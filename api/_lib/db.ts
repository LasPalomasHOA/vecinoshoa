import { Pool, type QueryResult, type QueryResultRow } from 'pg';
import dotenv from 'dotenv';

// Load environment variables for local development
dotenv.config();

let pool: Pool | null = null;

export function getConnectionString(): string {
  return (
    process.env.CUSTOM_DB_URL ||
    process.env.DATABASE_URL ||
    process.env.POSTGRES_URL ||
    process.env.POSTGRES_PRISMA_URL ||
    process.env.POSTGRES_URL_NON_POOLING ||
    ''
  );
}

export function getSchemaName(): string {
  return (process.env.DB_SCHEMA || 'gestion_residencial').trim();
}

export function getQuotedSchema(): string {
  const schema = getSchemaName();
  return schema.includes(' ') ? `"${schema.replace(/"/g, '""')}"` : schema;
}

export function getDbPool(): Pool {
  if (pool) {
    return pool;
  }

  const rawUrl = getConnectionString();
  if (!rawUrl) {
    console.warn('[DB] No database connection string found in environment variables (CUSTOM_DB_URL, DATABASE_URL, POSTGRES_URL).');
  }

  // Clean URL to avoid conflicting SSL / Supabase flags with pg driver
  const cleanUrl = rawUrl
    .replace(/[\?&]sslmode=[^&]+/, '')
    .replace(/[\?&]supa=[^&]+/, '');

  const connectionString = cleanUrl
    ? cleanUrl.includes('?')
      ? `${cleanUrl}&sslmode=no-verify`
      : `${cleanUrl}?sslmode=no-verify`
    : '';

  pool = new Pool({
    connectionString,
    ssl: connectionString.includes('localhost') || connectionString.includes('127.0.0.1')
      ? false
      : { rejectUnauthorized: false },
    max: 10,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 10000,
  });

  pool.on('error', (err) => {
    console.error('[DB] Unexpected error on idle client:', err);
  });

  return pool;
}

export async function query<T extends QueryResultRow = any>(
  text: string,
  params: any[] = []
): Promise<QueryResult<T>> {
  const p = getDbPool();
  const start = Date.now();
  try {
    const res = await p.query<T>(text, params);
    const duration = Date.now() - start;
    if (process.env.NODE_ENV === 'development' && duration > 500) {
      console.log(`[DB Slow Query] ${duration}ms: ${text.substring(0, 80)}...`);
    }
    return res;
  } catch (err: any) {
    console.error(`[DB Error] query failed: ${err.message}\nSQL: ${text}\nParams:`, params);
    throw err;
  }
}

export async function queryOne<T extends QueryResultRow = any>(
  text: string,
  params: any[] = []
): Promise<T | null> {
  const res = await query<T>(text, params);
  return res.rows.length > 0 ? res.rows[0] : null;
}

export async function testConnection(): Promise<{ ok: boolean; message: string; version?: string; schema?: string }> {
  try {
    const schema = getSchemaName();
    const res = await query(`SELECT version(), current_database()`);
    return {
      ok: true,
      message: `Conexión a PostgreSQL exitosa (Esquema: ${schema})`,
      version: res.rows[0]?.version,
      schema: schema
    };
  } catch (err: any) {
    return {
      ok: false,
      message: err.message || 'Error al conectar a la base de datos'
    };
  }
}
