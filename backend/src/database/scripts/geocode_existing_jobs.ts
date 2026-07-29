import { JobRepository } from '../../modules/jobs/repositories/JobRepository';
import { pool } from '../../config/database/pool';

async function main() {
  console.log('🚀 Starting geocoding process for all existing database jobs...');
  try {
    const result = await JobRepository.geocodePendingJobs();
    console.log(`✅ Geocoding completed!`);
    console.log(`   - Total Processed: ${result.totalProcessed}`);
    console.log(`   - Success: ${result.successCount}`);
    console.log(`   - Failed/Skipped: ${result.failedCount}`);
  } catch (error) {
    console.error('❌ Geocoding script failed:', error);
  } finally {
    await pool.end();
  }
}

main();
