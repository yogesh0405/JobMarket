import bcrypt from 'bcrypt';
import { pool } from '../../config/database/pool';

async function seed() {
  console.log('🌱 Seeding database with production-ready default data...');
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // 1. Clean existing tables (except migrations)
    await client.query('TRUNCATE TABLE system_settings, reports, job_applications, jobs, skills, categories CASCADE;');
    // We also want to delete existing test users so they match the seed credentials
    await client.query(`DELETE FROM users WHERE email IN ('admin@demo.com', 'factory@demo.com', 'hr@demo.com', 'worker@demo.com');`);

    const passwordHash = await bcrypt.hash('demo123', 12);

    // 2. Insert Users
    console.log('Inserting seed users...');
    const userInsertResult = await client.query(`
      INSERT INTO users (email, password_hash, name, phone, role, company_name, gst_number, aadhaar_verified, trade_specialization, status)
      VALUES 
        ('admin@demo.com', $1, 'System Admin', '9876543219', 'admin', NULL, NULL, TRUE, NULL, 'ACTIVE'),
        ('factory@demo.com', $1, 'Ramesh Sawant', '9876543210', 'employer', 'Tata AutoComp Systems', '27AAAAA1111A1Z1', TRUE, NULL, 'ACTIVE'),
        ('hr@demo.com', $1, 'HR Manager', '9876543211', 'employer', 'Bharat Forge Ltd', '27BBBBB2222B2Z2', TRUE, NULL, 'ACTIVE'),
        ('worker@demo.com', $1, 'Rahul Sharma', '9876543212', 'candidate', NULL, NULL, TRUE, 'Welder', 'ACTIVE')
      RETURNING id, email, role;
    `, [passwordHash]);

    const usersMap = new Map<string, string>();
    userInsertResult.rows.forEach(row => {
      usersMap.set(row.email, row.id);
    });

    const adminId = usersMap.get('admin@demo.com')!;
    const emp1Id = usersMap.get('factory@demo.com')!;
    const emp2Id = usersMap.get('hr@demo.com')!;
    const workerId = usersMap.get('worker@demo.com')!;

    // Seed candidate profile details
    await client.query(`
      UPDATE users 
      SET 
        headline = 'Certified ITI Welder',
        location = 'Chakan MIDC, Pune',
        skills = '{"MIG Welding", "TIG Welding", "Fitting", "Shop Floor Safety"}',
        preferred_shift = 'Rotational (Shift A / B)',
        requires_bus = TRUE,
        requires_accommodation = FALSE,
        experience = $1,
        education = $2
      WHERE id = $3;
    `, [
      JSON.stringify([{ title: 'Assistant Welder', company: 'Sigma Electric', duration: '2023 - 2025', description: 'Assisted in structural sheet metal TIG welding.' }]),
      JSON.stringify([{ degree: 'ITI Welder Trade', institution: 'Government ITI Pune', year: '2021 - 2023' }]),
      workerId
    ]);

    // 3. Insert Categories
    console.log('Inserting seed categories...');
    const categories = [
      { name: 'Fitter', icon: '🔧' },
      { name: 'Welder', icon: '⚡' },
      { name: 'CNC Operator', icon: '🖥️' },
      { name: 'Electrician', icon: '🔌' },
      { name: 'Machinist', icon: '⚙️' },
      { name: 'Helper / Loader', icon: '📦' },
      { name: 'Quality Inspector', icon: '🔍' },
      { name: 'Apprentice', icon: '🎓' },
      { name: 'Driver / Forklift', icon: '🚜' },
      { name: 'Security Guard', icon: '🛡️' },
      { name: 'Store Keeper', icon: '📂' },
      { name: 'Technician', icon: '🔬' },
      { name: 'Hospital Jobs', icon: '🏥' },
      { name: 'Hotel Jobs', icon: '🏨' },
      { name: 'School & College', icon: '🏫' },
      { name: 'Office / Clerk', icon: '💼' }
    ];

    for (const cat of categories) {
      await client.query('INSERT INTO categories (name, icon, status) VALUES ($1, $2, $3)', [cat.name, cat.icon, 'ACTIVE']);
    }

    // 4. Insert Skills
    console.log('Inserting seed skills...');
    const skills = [
      'Java', 'React', 'CNC', 'PLC', 'AutoCAD', 'Welding', 'Machine Maintenance', 
      'Forklift', 'Electrician', 'MIG Welding', 'TIG Welding', 'Fitting', 'Shop Floor Safety',
      'HTML', 'CSS', 'Javascript', 'Excel', 'Data Entry', 'Customer Support', 'Nursing', 'Cooking'
    ];

    for (const sk of skills) {
      await client.query('INSERT INTO skills (name, status) VALUES ($1, $2)', [sk, 'ACTIVE']);
    }

    // 5. Insert Settings
    console.log('Inserting system settings...');
    const settings = [
      { key: 'platform_name', value: 'JobMarket' },
      { key: 'logo', value: 'JM' },
      { key: 'support_email', value: 'support@csnjobmarket.com' },
      { key: 'contact_number', value: '+91 9876543210' },
      { key: 'maintenance_mode', value: 'false' },
      { key: 'jwt_expiry', value: '5m' },
      { key: 'password_rules', value: '{"minLength":8,"requireUppercase":true,"requireLowercase":true,"requireNumber":true,"requireSpecial":true}' },
      { key: 'registration_toggle', value: 'true' },
      { key: 'employer_approval_toggle', value: 'true' },
      { key: 'job_approval_toggle', value: 'true' }
    ];

    for (const set of settings) {
      await client.query('INSERT INTO system_settings (key, value) VALUES ($1, $2)', [set.key, set.value]);
    }

    // 6. Generate and Insert Jobs
    console.log('Generating seed jobs...');
    const companies = [
      { name: 'Tata AutoComp Systems', industry: 'Automotive', location: 'Chakan MIDC', color: '#1E3A8A' },
      { name: 'Bharat Forge Ltd', industry: 'Manufacturing', location: 'Bhosari MIDC', color: '#B45309' },
      { name: 'Thermax Industrial', industry: 'Engineering', location: 'Bhosari MIDC', color: '#047857' },
      { name: 'Varroc Engineering', industry: 'Automotive', location: 'Waluj MIDC', color: '#DC2626' },
      { name: 'Sigma Electric', industry: 'Electricals', location: 'Chakan MIDC', color: '#0891B2' },
      { name: 'John Deere India', industry: 'Agro Machinery', location: 'Ranjangaon MIDC', color: '#15803D' },
      { name: 'Endurance Technologies', industry: 'Automotive', location: 'Waluj MIDC', color: '#4F46E5' }
    ];

    const trades = ['Welder', 'Fitter', 'CNC Operator', 'Electrician', 'Machinist', 'Quality Inspector'];
    const midczones = ['Chakan MIDC', 'Bhosari MIDC', 'Ranjangaon MIDC', 'Hinjawadi MIDC', 'Waluj MIDC'];

    // Generate ~60 jobs
    for (let i = 1; i <= 60; i++) {
      const company = companies[i % companies.length];
      const trade = trades[i % trades.length];
      const midcZone = midczones[i % midczones.length];
      const employerId = i % 2 === 0 ? emp1Id : emp2Id;
      const status = i <= 5 ? 'PENDING_REVIEW' : i <= 8 ? 'REJECTED' : 'APPROVED';
      const rejectReason = status === 'REJECTED' ? 'Incomplete job description or missing benefits details.' : null;

      const title = `${trade} CNC Specialist`;
      const location = `${midcZone}, Pune`;
      const description = `We are seeking a skilled and certified ${trade} for our manufacturing line at ${company.name}. The candidate should have practical experience operating CNC machinery and strictly adhering to shop floor safety guidelines.`;

      const requirements = [
        `Valid ITI Certification in ${trade} trade`,
        'Knowledge of operating heavy machines and safety standards',
        'Ability to read manufacturing drawings/blueprints'
      ];
      const responsibilities = [
        'Maintain daily production output and quality standards',
        'Perform machine calibration and setup as per blueprints',
        'Keep safety logs and clean workspace area daily'
      ];
      const jobSkills = [trade, 'CNC', 'Blueprint Reading', 'Safety Compliance'];
      const perks = ['Subsidized Meals', 'Bus Facility', 'PF & ESIC benefits', 'Attendance Bonus'];

      await client.query(`
        INSERT INTO jobs (
          employer_id, company, company_logo, company_color, title, industry, location,
          job_type, work_mode, min_experience, max_experience, salary_min, salary_max,
          openings, description, responsibilities, requirements, skills, perks,
          featured, status, reject_reason, views, posted_at, midc_zone, shift_details,
          overtime, accommodation, bus_facility, canteen, joining_bonus, attendance_bonus,
          interview_address, trade
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23,
          CURRENT_TIMESTAMP - ($24 || ' day')::INTERVAL, $25, $26, $27, $28, $29, $30, $31, $32, $33, $34
        );
      `, [
        employerId, company.name, company.name[0], company.color, title, company.industry, location,
        'Full-Time', 'Onsite', 1, 5, 18000, 28000,
        5 + (i % 10), description, JSON.stringify(responsibilities), JSON.stringify(requirements),
        JSON.stringify(jobSkills), JSON.stringify(perks), i % 6 === 0, status, rejectReason,
        Math.floor(Math.random() * 150) + 20, i % 10, midcZone, 'Day Shift (8 AM - 5 PM)',
        i % 2 === 0, i % 3 === 0, i % 4 !== 0, i % 5 !== 0, i % 6 === 0, i % 4 === 0,
        `${company.name} plant, ${midcZone}, Pune, Maharashtra`, trade
      ]);
    }

    // Get an approved job for worker application
    const approvedJobsResult = await client.query(`SELECT id FROM jobs WHERE status = 'APPROVED' LIMIT 5;`);
    const jobIds = approvedJobsResult.rows.map(row => row.id);

    // 7. Insert Job Applications
    console.log('Inserting seed job applications...');
    for (let i = 0; i < jobIds.length; i++) {
      const appStatus = i === 0 ? 'applied' : i === 1 ? 'reviewed' : i === 2 ? 'shortlisted' : 'rejected';
      await client.query(`
        INSERT INTO job_applications (job_id, user_id, status, applied_at)
        VALUES ($1, $2, $3, CURRENT_TIMESTAMP - ($4 || ' day')::INTERVAL)
        ON CONFLICT DO NOTHING;
      `, [jobIds[i], workerId, appStatus, i]);
    }

    // 8. Insert Reports
    console.log('Inserting seed reports...');
    await client.query(`
      INSERT INTO reports (reporter_id, reported_user_id, reported_content_id, reported_content_type, reason, status)
      VALUES ($1, $2, $3, 'JOB', 'The salary advertised is lower than minimum wage for 8-hour shift.', 'PENDING');
    `, [workerId, emp1Id, jobIds[0]]);

    // 9. Insert Audit Logs
    console.log('Skipping seed audit logs to conserve quota...');

    await client.query('COMMIT');
    console.log('🎉 Database seeding completed successfully.');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('❌ Seeding failed:', err);
    process.exit(1);
  } finally {
    client.release();
    pool.end();
  }
}

seed();
