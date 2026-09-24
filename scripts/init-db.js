import { Pool } from 'pg';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

dotenv.config();

let connectionString = process.env.CUSTOM_DB_URL || process.env.DATABASE_URL || process.env.POSTGRES_URL || '';
const cleanUrl = connectionString.replace(/[\?&]sslmode=[^&]+/, '').replace(/[\?&]supa=[^&]+/, '');

const pool = new Pool({
  connectionString: cleanUrl.includes('?') ? `${cleanUrl}&sslmode=no-verify` : `${cleanUrl}?sslmode=no-verify`,
  ssl: { rejectUnauthorized: false }
});

async function initDatabase() {
  const client = await pool.connect();
  try {
    console.log('Connecting to PostgreSQL...');
    const userRes = await client.query('SELECT current_user, current_database(), current_schema()');
    console.log('Connected as user:', userRes.rows[0].current_user, 'in database:', userRes.rows[0].current_database);

    const schemaPath = path.resolve('database_setup.sql');
    if (!fs.existsSync(schemaPath)) {
      throw new Error(`No se encontró el archivo ${schemaPath}`);
    }

    const sqlContent = fs.readFileSync(schemaPath, 'utf8');
    console.log('Executing database schema and seed data...');
    
    await client.query(sqlContent);
    console.log('✓ Database tables and seed data executed successfully!');

    // Show summary of created tables and counts
    const tables = ['edificios', 'grupos_propiedad', 'usuarios', 'propiedades', 'propiedad_usuarios', 'huespedes', 'reservaciones', 'solicitudes_acceso'];
    console.log('\n--- Table Summary ---');
    for (const table of tables) {
      try {
        const countRes = await client.query(`SELECT COUNT(*) FROM ${table}`);
        console.log(`• ${table.padEnd(20)}: ${countRes.rows[0].count} records`);
      } catch (err) {
        console.log(`• ${table.padEnd(20)}: (Error / Not found)`);
      }
    }
    console.log('---------------------\n');

  } catch (err) {
    console.error('Database migration/seed error:', err.message);
    console.log('\nNota: Si tu usuario de base de datos no tiene permisos de CREATE TABLE, puedes copiar el contenido de "database_setup.sql" directamente en el SQL Editor de Supabase con el rol postgres/admin.');
  } finally {
    client.release();
    await pool.end();
  }
}

initDatabase();
