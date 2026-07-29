import { pool } from './config/database/pool';

const SAMPLE_JOBS = [
  {
    company: 'Tata Motors Component Division',
    companyLogo: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=150&q=70&fm=webp',
    companyColor: '#0052cc',
    title: 'Senior CNC & VMC Machine Operator',
    industry: 'Automobile / Heavy Engineering',
    location: 'Chakan MIDC Phase 2, Pune',
    trade: 'Fitter / Turner',
    midcZone: 'Chakan MIDC',
    shiftDetails: '1st Shift (7:00 AM - 3:30 PM)',
    overtime: true,
    accommodation: true,
    busFacility: true,
    canteen: true,
    joiningBonus: true,
    attendanceBonus: true,
    contractDuration: 'Permanent',
    jobType: 'Full-time',
    workMode: 'On-site',
    minExperience: 2,
    maxExperience: 5,
    salaryMin: 22000,
    salaryMax: 32000,
    openings: 15,
    filledOpenings: 4,
    status: 'APPROVED',
    description: 'Looking for experienced CNC & VMC operators for precision machining of automotive components. Must know Fanuc and Siemens controls.',
    responsibilities: [
      'Operate CNC lathe and VMC milling machines.',
      'Perform tool offset adjustments and quality inspection using micrometers/verniers.',
      'Maintain production log and ensure 5S cleanliness on shop floor.'
    ],
    requirements: [
      'ITI in Fitter / Turner / Machinist.',
      'Minimum 2 years experience in CNC machining.',
      'Ability to read engineering drawings.'
    ],
    skills: ['CNC', 'VMC', 'Fanuc', 'Siemens', 'Micrometer'],
    perks: ['Overtime Pay (1.5x)', 'Subsidized Canteen', 'Free Uniform & Shoes']
  },
  {
    company: 'Foxconn Electronics Assemblies',
    companyLogo: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=150&q=70&fm=webp',
    companyColor: '#008080',
    title: 'Electronics Assembly Technician',
    industry: 'Consumer Electronics Manufacturing',
    location: 'Ranjangaon MIDC, Pune',
    trade: 'Electrician / Electronics',
    midcZone: 'Ranjangaon MIDC',
    shiftDetails: 'Rotational 3 Shifts',
    overtime: true,
    accommodation: true,
    busFacility: true,
    canteen: true,
    joiningBonus: false,
    attendanceBonus: true,
    contractDuration: '1 Year Apprenticeship',
    jobType: 'Full-time',
    workMode: 'On-site',
    minExperience: 0,
    maxExperience: 2,
    salaryMin: 16000,
    salaryMax: 21000,
    openings: 40,
    filledOpenings: 12,
    status: 'APPROVED',
    description: 'Immediate hiring for freshers and junior technicians in SMT line assembly, PCB soldering, and quality testing.',
    responsibilities: [
      'Assemble electronic components on high-speed SMT production line.',
      'Perform visual inspection and soldering touch-ups.',
      'Follow ESD safety guidelines strictly.'
    ],
    requirements: [
      'ITI Electrician / Electronics Mech or Diploma in E&TC.',
      'Fresher or up to 2 years experience.',
      'Good eyesight and hand dexterity.'
    ],
    skills: ['Soldering', 'PCB Testing', 'SMT Line', 'ESD Protection'],
    perks: ['Free Bus Transport', 'Attendance Incentive ₹1,500/mo', 'ESI & PF']
  },
  {
    company: 'Thermax Heavy Engineering Division',
    companyLogo: 'https://images.unsplash.com/photo-1541888946425-d0fbb186a5b3?auto=format&fit=crop&w=150&q=70&fm=webp',
    companyColor: '#d97706',
    title: 'TIG / MIG Certified Welder',
    industry: 'Boiler & Energy Systems',
    location: 'Bhosari MIDC, Pune',
    trade: 'Welder',
    midcZone: 'Bhosari MIDC',
    shiftDetails: 'General Shift (8:30 AM - 5:00 PM)',
    overtime: true,
    accommodation: false,
    busFacility: true,
    canteen: true,
    joiningBonus: true,
    attendanceBonus: false,
    contractDuration: 'Permanent',
    jobType: 'Full-time',
    workMode: 'On-site',
    minExperience: 3,
    maxExperience: 7,
    salaryMin: 28000,
    salaryMax: 38000,
    openings: 10,
    filledOpenings: 2,
    status: 'APPROVED',
    description: 'Urgently hiring IBR / 6G certified TIG & MIG welders for pressure vessel and boiler piping fabrication.',
    responsibilities: [
      'Perform high-pressure TIG welding on stainless steel and carbon steel pipes.',
      'Conduct X-ray / Radiography quality weld preparation.',
      'Read isometric piping drawings.'
    ],
    requirements: [
      'ITI Welder or 6G Welding Certificate.',
      '3+ years in heavy structural or piping welding.',
      'Knowledge of AWS / IBR welding standards.'
    ],
    skills: ['TIG Welding', 'MIG Welding', '6G Position', 'Pipe Fitting', 'Blueprint Reading'],
    perks: ['High Overtime Rate', 'Safety Hazard Allowance', 'Health Insurance Cover']
  },
  {
    company: 'Mahindra & Mahindra Plant 1',
    companyLogo: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&w=150&q=70&fm=webp',
    companyColor: '#dc2626',
    title: 'Automotive Quality Inspector',
    industry: 'Automotive Assembly',
    location: 'Chakan MIDC Phase 1, Pune',
    trade: 'Quality / Mechanical',
    midcZone: 'Chakan MIDC',
    shiftDetails: '2nd Shift (3:30 PM - 12:00 AM)',
    overtime: false,
    accommodation: true,
    busFacility: true,
    canteen: true,
    joiningBonus: true,
    attendanceBonus: true,
    contractDuration: 'Permanent',
    jobType: 'Full-time',
    workMode: 'On-site',
    minExperience: 1,
    maxExperience: 4,
    salaryMin: 20000,
    salaryMax: 27000,
    openings: 8,
    filledOpenings: 1,
    status: 'APPROVED',
    description: 'Responsible for incoming material inspection, in-process quality audits, and pre-dispatch vehicle quality checks.',
    responsibilities: [
      'Inspect sheet metal stampings and painted body parts for defects.',
      'Use CMM gauge, vernier, and micrometer for dimensional checks.',
      'Raise CAPA reports for rejection vendor items.'
    ],
    requirements: [
      'Diploma in Mechanical Engineering or ITI Quality Control.',
      'Knowledge of 7 QC Tools and ISO/IATF 16949.',
      'Basic computer knowledge (Excel / ERP).'
    ],
    skills: ['Quality Audit', '7 QC Tools', 'CMM Gauge', 'IATF 16949', 'Excel'],
    perks: ['Subsidized Meals', 'Performance Bonus', 'Transport Facility']
  }
];

async function seedJobsWithLogos() {
  console.log('🌱 Starting Job Database Seeding with Company Logos...');
  
  try {
    let employerRes = await pool.query("SELECT id FROM users WHERE role = 'EMPLOYER' LIMIT 1;");
    let employerId = employerRes.rows[0]?.id;

    if (!employerId) {
      const newEmployer = await pool.query(`
        INSERT INTO users (email, password_hash, name, phone, role, company_name, status)
        VALUES ('employer.demo@jobmarket.com', '$2b$10$X7WzD.4.O7gD7qMv/xW6U.rN81lKzP3eZ1zQZ.X61W2Z3Y4X5Y6Z7', 'Demo Industrial Employer', '9876543210', 'EMPLOYER', 'Industrial Enterprises', 'APPROVED')
        RETURNING id;
      `);
      employerId = newEmployer.rows[0].id;
    }

    for (const job of SAMPLE_JOBS) {
      const query = `
        INSERT INTO jobs (
          employer_id, company, company_logo, company_color, title, industry, location,
          trade, midc_zone, shift_details, overtime, accommodation, bus_facility, canteen,
          joining_bonus, attendance_bonus, contract_duration, job_type, work_mode,
          min_experience, max_experience, salary_min, salary_max, openings, filled_openings,
          status, description, responsibilities, requirements, skills, perks, posted_at
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19,
          $20, $21, $22, $23, $24, $25, $26, $27, $28, $29, $30, $31, NOW()
        );
      `;

      const values = [
        employerId,
        job.company,
        job.companyLogo,
        job.companyColor,
        job.title,
        job.industry,
        job.location,
        job.trade,
        job.midcZone,
        job.shiftDetails,
        job.overtime,
        job.accommodation,
        job.busFacility,
        job.canteen,
        job.joiningBonus,
        job.attendanceBonus,
        job.contractDuration,
        job.jobType,
        job.workMode,
        job.minExperience,
        job.maxExperience,
        job.salaryMin,
        job.salaryMax,
        job.openings,
        job.filledOpenings,
        job.status,
        job.description,
        JSON.stringify(job.responsibilities),
        JSON.stringify(job.requirements),
        JSON.stringify(job.skills),
        JSON.stringify(job.perks)
      ];

      await pool.query(query, values);
      console.log(`✅ Inserted Job: "${job.title}" for ${job.company}`);
    }

    console.log('🎉 Successfully seeded jobs with company logos and optimized data!');
    process.exit(0);
  } catch (err) {
    console.error('❌ Error seeding jobs:', err);
    process.exit(1);
  }
}

seedJobsWithLogos();
