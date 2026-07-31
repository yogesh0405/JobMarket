import fs from 'fs';
import path from 'path';
import { pool } from '../../config/database/pool';

async function runMigrations() {
  const client = await pool.connect();
  try {
    // Create migrations table if not exists
    await client.query(`
      CREATE TABLE IF NOT EXISTS migrations (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) UNIQUE NOT NULL,
        executed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    const { rows } = await client.query('SELECT name FROM migrations');
    const executedMigrations = new Set(rows.map((row) => row.name));

    const migrationsDir = fs.existsSync(path.join(__dirname, '../migrations')) 
      ? path.join(__dirname, '../migrations') 
      : path.join(__dirname, '../../src/database/migrations');
    const files = fs.readdirSync(migrationsDir).sort();

    for (const file of files) {
      if (file.endsWith('_up.sql') && !executedMigrations.has(file)) {
        console.log(`Executing migration: ${file}...`);
        const filePath = path.join(migrationsDir, file);
        const sql = fs.readFileSync(filePath, 'utf-8');

        await client.query('BEGIN');
        try {
          await client.query(sql);
          await client.query('INSERT INTO migrations (name) VALUES ($1)', [file]);
          await client.query('COMMIT');
          console.log(`✅ Migration ${file} executed successfully.`);
        } catch (err) {
          await client.query('ROLLBACK');
          console.error(`❌ Migration ${file} failed:`, err);
          process.exit(1);
        }
      }
    }
    console.log('🎉 All migrations applied successfully.');
  } catch (err) {
    console.error('Migration runner failed', err);
    process.exit(1);
  } finally {
    client.release();
    pool.end();
  }
}

runMigrations();
