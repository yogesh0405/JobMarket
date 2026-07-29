import { pool } from '../../config/database/pool';
import { runMasterSeeder } from '../seeders/masterSeeder';

async function main() {
  try {
    await runMasterSeeder();
  } catch (err) {
    console.error('Seeding error:', err);
    process.exit(1);
  } finally {
    pool.end();
  }
}

main();
