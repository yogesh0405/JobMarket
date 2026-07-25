import { pool } from './config/database/pool';

async function seed() {
  try {
    const query = `
      UPDATE job_applications
      SET 
        status = 'shortlisted',
        interview_date = '2026-07-30',
        interview_time = '10:30 AM',
        venue_address = 'Tata Motors Plant, Chakan MIDC Phase 2, Pune, Maharashtra 410501',
        maps_link = 'https://maps.app.goo.gl/ChakanTataMotors'
      WHERE job_id = '96bb464d-3094-4d5f-9168-29739611614c' 
      AND user_id = '2f90cbd6-fa02-410d-a3d5-0bf85b8f3b22'
    `;
    const res = await pool.query(query);
    console.log('Successfully updated application with test interview details:', res.rowCount);
  } catch (err) {
    console.error(err);
  } finally {
    await pool.end();
  }
}

seed();
