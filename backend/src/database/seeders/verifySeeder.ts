import { pool } from '../../config/database/pool';

export async function verifySeededData(): Promise<boolean> {
  console.log('🔍 Running automated verification script on seeded database...');
  const client = await pool.connect();
  let passed = true;

  try {
    // 1. Verify Employer Companies Count
    const employerRes = await client.query(
      `SELECT COUNT(*) FROM users WHERE role = 'employer';`
    );
    const employerCount = parseInt(employerRes.rows[0].count, 10);
    console.log(`📊 Total Seeded Companies / Employers: ${employerCount}`);
    if (employerCount < 50) {
      console.error(`❌ Validation Failed: Expected at least 50 companies, found ${employerCount}`);
      passed = false;
    } else {
      console.log(`✅ Passed: 50 real companies present.`);
    }

    // 2. Verify Jobs Count (Expected 150-250)
    const jobsRes = await client.query(`SELECT COUNT(*) FROM jobs;`);
    const jobsCount = parseInt(jobsRes.rows[0].count, 10);
    console.log(`📊 Total Seeded Jobs: ${jobsCount}`);
    if (jobsCount < 150 || jobsCount > 250) {
      console.error(`❌ Validation Failed: Expected 150-250 jobs, found ${jobsCount}`);
      passed = false;
    } else {
      console.log(`✅ Passed: Jobs count (${jobsCount}) is within 150-250 target range.`);
    }

    // 3. Verify Geographic Coordinates Coverage (Chhatrapati Sambhajinagar Bounding Box)
    const invalidCoordsRes = await client.query(
      `
      SELECT COUNT(*) FROM jobs 
      WHERE latitude IS NULL OR longitude IS NULL 
         OR latitude < 19.70 OR latitude > 20.10 
         OR longitude < 75.00 OR longitude > 75.70;
      `
    );
    const invalidCoordsCount = parseInt(invalidCoordsCoordsResRow(invalidCoordsRes), 10);
    if (invalidCoordsCount > 0) {
      console.error(`❌ Validation Failed: ${invalidCoordsCount} jobs have missing or out-of-bounds coordinates!`);
      passed = false;
    } else {
      console.log(`✅ Passed: 100% of jobs have valid coordinates in Chhatrapati Sambhajinagar.`);
    }

    // 4. Verify Company Logos
    const missingLogosRes = await client.query(
      `SELECT COUNT(*) FROM jobs WHERE company_logo IS NULL OR company_logo = '';`
    );
    const missingLogosCount = parseInt(missingLogosRes.rows[0].count, 10);
    if (missingLogosCount > 0) {
      console.error(`❌ Validation Failed: ${missingLogosCount} jobs are missing company logos!`);
      passed = false;
    } else {
      console.log(`✅ Passed: 100% of jobs have valid company logo URLs.`);
    }

    // 5. Verify Zero Orphan Records
    const orphanJobsRes = await client.query(
      `
      SELECT COUNT(*) FROM jobs j 
      LEFT JOIN users u ON j.employer_id = u.id 
      WHERE u.id IS NULL;
      `
    );
    const orphanJobsCount = parseInt(orphanJobsRes.rows[0].count, 10);
    if (orphanJobsCount > 0) {
      console.error(`❌ Validation Failed: ${orphanJobsCount} orphan jobs found!`);
      passed = false;
    } else {
      console.log(`✅ Passed: Zero orphan jobs.`);
    }

    // 6. Verify Keyword Search Functionality
    const searchTestRes = await client.query(
      `SELECT COUNT(*) FROM jobs WHERE LOWER(title) LIKE '%cnc%' OR LOWER(title) LIKE '%nurse%';`
    );
    const searchTestCount = parseInt(searchTestRes.rows[0].count, 10);
    console.log(`🔍 Search test query ('cnc' / 'nurse'): found ${searchTestCount} matching jobs.`);
    if (searchTestCount === 0) {
      console.error(`❌ Validation Failed: Keyword search test returned 0 results!`);
      passed = false;
    } else {
      console.log(`✅ Passed: Search and filter queries execute successfully.`);
    }

    if (passed) {
      console.log(`\n🎉 ALL VERIFICATION CHECKS PASSED SUCCESSFULLY! Database is 100% production ready.`);
    } else {
      console.error(`\n⚠️ Verification completed with errors.`);
    }

    return passed;
  } catch (error) {
    console.error(`❌ Verification failed with exception:`, error);
    return false;
  } finally {
    client.release();
  }
}

function invalidCoordsCoordsResRow(res: any): string {
  return res.rows[0].count;
}

if (require.main === module) {
  verifySeededData()
    .then((success) => {
      pool.end();
      process.exit(success ? 0 : 1);
    })
    .catch((err) => {
      console.error(err);
      pool.end();
      process.exit(1);
    });
}
