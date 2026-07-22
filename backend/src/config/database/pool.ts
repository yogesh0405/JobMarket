import { Pool } from 'pg';
import { env } from '../env';

export const pool = new Pool({
  connectionString: env.DATABASE_URL,
  // Standard enterprise connection pool settings
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
});

pool.on('error', (err, client) => {
  console.error('Unexpected error on idle pg client', err);
  process.exit(-1);
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
