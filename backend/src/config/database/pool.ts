import { Pool } from 'pg';
import { env } from '../env';

export const pool = new Pool({
  connectionString: env.DATABASE_URL,
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
  keepAlive: true,
  keepAliveInitialDelayMillis: 10000,
});

pool.on('error', (err) => {
  // Catch serverless Neon idle pool client disconnects gracefully
  if (err.message && (
    err.message.includes('timeout') ||
    err.message.includes('EHOSTUNREACH') ||
    err.message.includes('ENOTFOUND') ||
    err.message.includes('Connection terminated unexpectedly')
  )) {
    return;
  }
  console.error('Unexpected error on idle pg client:', err.message || err);
});

pool.on('connect', (client) => {
  client.on('error', (err) => {
    if (err.message && err.message.includes('Connection terminated unexpectedly')) {
      return;
    }
    console.error('Database client connection error:', err.message || err);
  });
});

export const checkDatabaseConnection = async () => {
  try {
    const client = await pool.connect();
    console.log('✅ Database connected successfully');
    await client.query(`
      ALTER TABLE users ADD COLUMN IF NOT EXISTS has_password BOOLEAN DEFAULT TRUE;
      ALTER TABLE users ADD COLUMN IF NOT EXISTS google_id VARCHAR(255);
      ALTER TABLE users ADD COLUMN IF NOT EXISTS auth_provider VARCHAR(50) DEFAULT 'email';
    `);
    client.release();
  } catch (err) {
    console.error('❌ Database connection error', err);
    process.exit(-1);
  }
};
