import { pool } from './config/database/pool';

async function inspect() {
  try {
    const result = await pool.query('SELECT * FROM job_applications');
    console.log('Current job applications in DB:');
    console.dir(result.rows, { depth: null });
  } catch (err) {
    console.error(err);
  } finally {
    await pool.end();
  }
}

inspect();
