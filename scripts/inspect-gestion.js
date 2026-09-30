import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;
const rawUrl = process.env.CUSTOM_DB_URL || process.env.DATABASE_URL || '';
const cleanUrl = rawUrl.replace(/[\?&]sslmode=[^&]+/, '').replace(/[\?&]supa=[^&]+/, '');
const pool = new Pool({
  connectionString: cleanUrl + (cleanUrl.includes('?') ? '&' : '?') + 'sslmode=no-verify',
  ssl: { rejectUnauthorized: false }
});

async function main() {
  const client = await pool.connect();
  try {
    const tables = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'gestion_residencial'
    `);
    console.log('Tables in gestion_residencial:', tables.rows.map(r => r.table_name));
    
    for (const t of tables.rows) {
      const cols = await client.query(`
        SELECT column_name, data_type 
        FROM information_schema.columns 
        WHERE table_schema = 'gestion_residencial' AND table_name = $1
      `, [t.table_name]);
      console.log(`Table ${t.table_name}:`, cols.rows.map(c => `${c.column_name} (${c.data_type})`).join(', '));
    }
  } catch (err) {
    console.error('Error inspecting:', err);
  } finally {
    client.release();
    await pool.end();
  }
}

main();
