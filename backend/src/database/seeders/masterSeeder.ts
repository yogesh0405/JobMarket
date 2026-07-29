import bcrypt from 'bcrypt';
import { pool } from '../../config/database/pool';
import { CompaniesSeeder } from './companiesSeeder';
import { HealthcareSeeder } from './healthcareSeeder';
import { JobsSeeder } from './jobsSeeder';

export async function runMasterSeeder(): Promise<void> {
  console.log('🚀 Starting Master Seeder for Chhatrapati Sambhajinagar Production Deployment...');
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // 1. Clean Database (TRUNCATE & DELETE old demo data)
    console.log('🧹 Clearing legacy mock database records...');
    await client.query(`
      TRUNCATE TABLE 
        job_applications, 
        saved_jobs, 
        reports, 
        jobs, 
        categories, 
        skills, 
        system_settings 
      CASCADE;
    `);

    // Clean old demo users
    await client.query(`
      DELETE FROM users 
      WHERE email IN (
        'admin@demo.com', 
        'factory@demo.com', 
        'hr@demo.com', 
        'worker@demo.com'
      ) OR email LIKE 'hr@%.com';
    `);

    const defaultPasswordHash = await bcrypt.hash('demo123', 10);

    // 2. Insert Standard System Users (Admin & Candidate)
    console.log('👤 Seeding default admin & candidate test accounts...');
    const userInsertResult = await client.query(
      `
      INSERT INTO users (
        email, password_hash, name, phone, role, company_name, gst_number,
        aadhaar_verified, trade_specialization, status, location
      ) VALUES 
        ('admin@demo.com', $1, 'System Admin', '9876543219', 'admin', NULL, NULL, TRUE, NULL, 'ACTIVE', 'Chhatrapati Sambhajinagar'),
        ('worker@demo.com', $1, 'Ramesh Patil', '9876543212', 'candidate', NULL, NULL, TRUE, 'CNC Machinist', 'ACTIVE', 'Waluj MIDC, Chhatrapati Sambhajinagar')
      RETURNING id, email, role;
      `,
      [defaultPasswordHash]
    );

    const workerId = userInsertResult.rows.find((r) => r.role === 'candidate')?.id;

    if (workerId) {
      await client.query(
        `
        UPDATE users 
        SET 
          headline = 'Certified ITI Machinist & CNC Operator',
          location = 'Waluj MIDC, Chhatrapati Sambhajinagar',
          skills = '{"CNC Machining", "Fanuc", "MIG Welding", "Fitting", "Shop Floor Safety"}',
          preferred_shift = 'Rotational (Shift A / B)',
          requires_bus = TRUE,
          requires_accommodation = FALSE,
          experience = $1,
          education = $2
        WHERE id = $3;
        `,
        [
          JSON.stringify([
            {
              title: 'CNC Machine Operator',
              company: 'Badve Engineering Ltd',
              duration: '2023 - 2025',
              description: 'Operated 3-axis CNC VMC machines in automotive sheet metal section.'
            }
          ]),
          JSON.stringify([
            {
              degree: 'ITI Machinist Trade',
              institution: 'Government ITI Chhatrapati Sambhajinagar',
              year: '2021 - 2023'
            }
          ]),
          workerId
        ]
      );
    }

    // 3. Seed Categories & Skills
    console.log('🏷️ Seeding categories and skills...');
    const categories = [
      { name: 'CNC & VMC Operator', icon: '⚙️' },
      { name: 'Welder & Fitter', icon: '⚡' },
      { name: 'Quality & Testing', icon: '🔍' },
      { name: 'Electrical & Automation', icon: '🔌' },
      { name: 'Assembly & Production', icon: '🔧' },
      { name: 'Healthcare & Nursing', icon: '🏥' },
      { name: 'Doctors & Medical Officers', icon: '🩺' },
      { name: 'Pharmacy & Pathology', icon: '💊' },
      { name: 'Software & IT Services', icon: '💻' },
      { name: 'Store & Warehouse', icon: '📦' },
      { name: 'Retail & Sales', icon: '🛍️' },
      { name: 'Banking & Finance', icon: '🏦' },
      { name: 'Education & Faculty', icon: '🏫' },
      { name: 'Logistics & Driver', icon: '🚜' },
      { name: 'Hotel & Hospitality', icon: '🏨' },
      { name: 'HR & Administration', icon: '💼' }
    ];

    for (const cat of categories) {
      await client.query(
        'INSERT INTO categories (name, icon, status) VALUES ($1, $2, $3) ON CONFLICT DO NOTHING',
        [cat.name, cat.icon, 'ACTIVE']
      );
    }

    const skills = [
      'CNC Operating', 'VMC', 'Fanuc', 'MIG Welding', 'TIG Welding', 'Quality Inspector',
      'CMM', 'IATF 16949', 'Hydraulics', 'Pneumatics', 'PLC Programming', 'Siemens TIA Portal',
      'ICU Nursing', 'Critical Care', 'Emergency Medicine', 'MBBS', 'BAMS', 'B.Pharm',
      'DMLT', 'CT Scan', 'React', 'TypeScript', 'Node.js', 'PostgreSQL', 'SAP MM',
      'Retail Sales', 'Commercial Banking', 'CAD/CAM'
    ];

    for (const sk of skills) {
      await client.query(
        'INSERT INTO skills (name, status) VALUES ($1, $2) ON CONFLICT DO NOTHING',
        [sk, 'ACTIVE']
      );
    }

    // 4. Insert System Settings
    console.log('⚙️ Seeding system settings...');
    const settings = [
      { key: 'platform_name', value: 'CSN JobMarket' },
      { key: 'logo', value: 'JM' },
      { key: 'support_email', value: 'support@csnjobmarket.com' },
      { key: 'contact_number', value: '+91 240 2554000' },
      { key: 'default_city', value: 'Chhatrapati Sambhajinagar' },
      { key: 'maintenance_mode', value: 'false' }
    ];

    for (const set of settings) {
      await client.query(
        'INSERT INTO system_settings (key, value) VALUES ($1, $2) ON CONFLICT DO NOTHING',
        [set.key, set.value]
      );
    }

    // 5. Run Companies Seeder (50 real companies)
    const companyMap = await CompaniesSeeder.seed(client);

    // 6. Run Healthcare Seeder (~50 hospital & pharma jobs)
    const healthcareJobsCount = await HealthcareSeeder.seed(client, companyMap);

    // 7. Run Industrial & Other Sectors Jobs Seeder (~150 industrial, IT, retail jobs)
    const industrialJobsCount = await JobsSeeder.seed(client, companyMap);

    const totalJobs = healthcareJobsCount + industrialJobsCount;

    // 8. Seed Sample Candidate Applications & Saved Jobs
    if (workerId) {
      const approvedJobs = await client.query(
        `SELECT id FROM jobs WHERE status = 'APPROVED' LIMIT 6;`
      );
      for (let i = 0; i < approvedJobs.rows.length; i++) {
        const jobId = approvedJobs.rows[i].id;
        if (i < 3) {
          await client.query(
            `
            INSERT INTO job_applications (job_id, user_id, status, applied_at)
            VALUES ($1, $2, $3, CURRENT_TIMESTAMP - ($4 || ' day')::INTERVAL)
            ON CONFLICT DO NOTHING;
            `,
            [jobId, workerId, i === 0 ? 'applied' : i === 1 ? 'reviewed' : 'shortlisted', i]
          );
        }
        await client.query(
          `
          INSERT INTO saved_jobs (user_id, job_id)
          VALUES ($1, $2)
          ON CONFLICT DO NOTHING;
          `,
          [workerId, jobId]
        );
      }
    }

    await client.query('COMMIT');
    console.log(`🎉 Master Seeding completed successfully!`);
    console.log(`   - Companies Seeded: ${companyMap.size}`);
    console.log(`   - Total Jobs Seeded: ${totalJobs}`);
    console.log(`   - Location Target: Chhatrapati Sambhajinagar (Aurangabad)`);
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Master Seeding failed:', error);
    throw error;
  } finally {
    client.release();
  }
}

if (require.main === module) {
  runMasterSeeder()
    .then(() => {
      pool.end();
      process.exit(0);
    })
    .catch((err) => {
      console.error(err);
      pool.end();
      process.exit(1);
    });
}
