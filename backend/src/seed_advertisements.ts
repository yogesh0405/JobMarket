import { pool } from './config/database/pool';

async function seedAdvertisements() {
  const client = await pool.connect();
  try {
    console.log('Seeding initial promotional banner advertisements...');

    // Find an admin or employer user to set as owner
    const userRes = await client.query(`SELECT id, role FROM users LIMIT 5;`);
    let ownerId = null;
    let ownerType = 'ADMIN';
    if (userRes.rows.length > 0) {
      ownerId = userRes.rows[0].id;
      ownerType = userRes.rows[0].role === 'employer' ? 'EMPLOYER' : 'ADMIN';
    }

    // Find a job to link if available
    const jobRes = await client.query(`SELECT id FROM jobs LIMIT 1;`);
    const linkedJobId = jobRes.rows.length > 0 ? jobRes.rows[0].id : null;

    const startDate = new Date();
    const endDate = new Date();
    endDate.setDate(startDate.getDate() + 60);

    const ads = [
      {
        title: '⚡ Mega Walk-In Drive 2026 - 500+ Openings in Chakan MIDC',
        description: 'Spot offers for ITI Fitters, Welders, CNC Operators & Machine Helpers. Free bus & canteen facility provided.',
        banner_image: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=1200&q=80',
        advertisement_type: 'WALK_IN_DRIVE',
        priority: 'CRITICAL',
        button_text: 'Register Spot Interview',
        target_audience: 'ITI & Diploma Technicians',
      },
      {
        title: '⭐ Tata Motors Apprentice & Technician Recruitment Campaign',
        description: 'Immediate openings for 1st & 2nd shift. Attractive monthly stipend + joining bonus.',
        banner_image: 'https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?auto=format&fit=crop&w=1200&q=80',
        advertisement_type: 'APPRENTICESHIP',
        priority: 'HIGH',
        button_text: 'Apply Now',
        target_audience: 'Freshers & Experienced Candidates',
      },
      {
        title: '🔥 Urgent Hiring: Senior CNC & VMC Operators (Pune Zone)',
        description: 'High salary up to ₹35,000/month + Overtime + Accommodation allowance.',
        banner_image: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=1200&q=80',
        advertisement_type: 'URGENT_HIRING',
        priority: 'HIGH',
        button_text: 'View Job Details',
        target_audience: 'Precision Machinists',
      },
      {
        title: '🏛️ Govt Apprenticeship & Skill Certification Drive 2026',
        description: 'Government authorized NSDC apprenticeship scheme with government certification.',
        banner_image: 'https://images.unsplash.com/photo-1581092335397-9583fe92d232?auto=format&fit=crop&w=1200&q=80',
        advertisement_type: 'GOVERNMENT_JOB',
        priority: 'MEDIUM',
        button_text: 'Apply Online',
        target_audience: '10th/12th/ITI Pass Outs',
      },
    ];

    for (const ad of ads) {
      await client.query(
        `
        INSERT INTO advertisements (
          title, description, banner_image, advertisement_type, owner_type, owner_id,
          linked_job_id, button_text, priority, status, approval_status,
          start_date, end_date, is_active, target_audience
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, 'APPROVED', 'APPROVED', $10, $11, TRUE, $12)
        ON CONFLICT DO NOTHING;
      `,
        [
          ad.title,
          ad.description,
          ad.banner_image,
          ad.advertisement_type,
          ownerType,
          ownerId,
          linkedJobId,
          ad.button_text,
          ad.priority,
          startDate.toISOString(),
          endDate.toISOString(),
          ad.target_audience,
        ]
      );
    }

    console.log('✅ Successfully seeded 4 promotional advertisements!');
  } catch (err) {
    console.error('Error seeding advertisements:', err);
  } finally {
    client.release();
    pool.end();
  }
}

seedAdvertisements();
