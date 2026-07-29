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
  // Catch idle pool client errors gracefully
  if (err.message && (err.message.includes('timeout') || err.message.includes('EHOSTUNREACH') || err.message.includes('ENOTFOUND'))) {
    return;
  }
  console.error('Unexpected error on idle pg client:', err.message || err);
});

pool.on('connect', (client) => {
  client.on('error', (err) => {
    console.error('Database client connection error:', err);
  });
});

export const checkDatabaseConnection = async () => {
  try {
    const client = await pool.connect();
    console.log('✅ Database connected successfully');
    client.release();
  } catch (err) {
    console.error('❌ Database connection error', err);
    process.exit(-1);
  }
};
