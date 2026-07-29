import { PoolClient } from 'pg';
import { SeededCompanyRecord } from './companiesSeeder';

export class JobsSeeder {
  static async seed(client: PoolClient, companyMap: Map<string, SeededCompanyRecord>): Promise<number> {
    console.log('🏭 Seeding Industrial, IT, Retail, Education, Logistics & Services jobs...');

    const industrialJobTemplates = [
      {
        title: 'CNC & VMC Machine Operator',
        trade: 'CNC Machining',
        minExp: 2,
        maxExp: 6,
        salMin: 220000,
        salMax: 380000,
        jobType: 'Full-time',
        workMode: 'On-site',
        openings: 12,
        description: 'Operate 3-axis and 4-axis CNC/VMC machining centers with Fanuc / Siemens controllers for high-precision auto component production.',
        responsibilities: [
          'Set up workpieces, zero offsets, tool presetting, and run production cycles.',
          'Inspect machined parts using Vernier calipers, micrometers, and height gauges.',
          'Maintain 5S cleanliness, coolant concentration, and daily production log sheet.'
        ],
        requirements: [
          'ITI Machinist / Turner / Fitter or Diploma in Mechanical Engineering.',
          '2+ years experience operating FANUC or Siemens controlled CNC/VMC machines.',
          'Ability to read engineering drawings and GD&T symbols.'
        ],
        skills: ['CNC Operating', 'VMC', 'Fanuc', 'Vernier Caliper', 'GD&T', 'ITI Machinist'],
        perks: ['Overtime Pay (1.5x)', 'Subsidized Canteen', 'Bus Facility', 'Attendance Bonus ₹1,500/month']
      },
      {
        title: 'TIG & MIG Welder (Structural & Automotive)',
        trade: 'Welding',
        minExp: 1,
        maxExp: 5,
        salMin: 210000,
        salMax: 350000,
        jobType: 'Full-time',
        workMode: 'On-site',
        openings: 15,
        description: 'Perform high-quality MIG (GMAW) and TIG (GTAW) welding on automotive chassis frames, sheet metal, and pressure vessels.',
        responsibilities: [
          'Execute argon TIG and CO2 MIG welding according to welding procedure specification (WPS).',
          'Inspect weld seams for porosity, undercuts, and penetration defects.',
          'Adhere strictly to personal protective equipment (PPE) and shop floor safety rules.'
        ],
        requirements: [
          'Certified ITI Welder Trade passout.',
          '1+ year hands-on experience in sheet metal or heavy structural welding.',
          'Ability to pass 3G/4G welding position qualification test.'
        ],
        skills: ['MIG Welding', 'TIG Welding', 'Argon Welding', 'WPS Protocol', 'Shop Floor Safety'],
        perks: ['Joining Bonus ₹5,000', 'Safety Gear Provided', 'PF & ESIC Benefits', 'Subsidized Meals']
      },
      {
        title: 'Quality Control Inspector (QA/QC Inspector)',
        trade: 'Quality Assurance',
        minExp: 2,
        maxExp: 6,
        salMin: 250000,
        salMax: 420000,
        jobType: 'Full-time',
        workMode: 'On-site',
        openings: 6,
        description: 'Perform receiving inspection, in-process quality audits, CMM inspection, and final PDI checking on automotive assemblies.',
        responsibilities: [
          'Conduct dimensional inspection using CMM, profile projector, and precision instruments.',
          'Prepare PDI reports, 8D problem-solving reports, and CAPA for non-conformances.',
          'Maintain IATF 16949 quality documentation and calibration records.'
        ],
        requirements: [
          'Diploma or B.E. in Mechanical / Production Engineering.',
          '2+ years QA/QC experience in automotive or engineering manufacturing.',
          'Knowledge of 7 QC tools, APQP, PPAP, and SPC.'
        ],
        skills: ['Quality Inspector', 'CMM', 'IATF 16949', '7 QC Tools', 'PPAP', 'PDI Inspection'],
        perks: ['Annual Bonus', 'Health Insurance ₹3L', 'Company Transport', 'Training Certifications']
      },
      {
        title: 'Maintenance Fitter & Hydraulic Mechanic',
        trade: 'Fitter & Maintenance',
        minExp: 2,
        maxExp: 7,
        salMin: 230000,
        salMax: 400000,
        jobType: 'Full-time',
        workMode: 'On-site',
        openings: 8,
        description: 'Preventive, predictive, and breakdown maintenance of hydraulic presses, pneumatic systems, conveyors, and mechanical equipment.',
        responsibilities: [
          'Troubleshoot hydraulic power packs, cylinder leaks, pumps, valves, and gearboxes.',
          'Execute planned preventive maintenance (PPM) schedules to minimize downtime.',
          'Perform bearing replacements, shaft alignment, and mechanical overhauls.'
        ],
        requirements: [
          'ITI Mechanical Fitter or Diploma in Mechanical Engineering.',
          '2+ years experience in industrial machine maintenance.',
          'Proficient in reading hydraulic and pneumatic circuit diagrams.'
        ],
        skills: ['Maintenance Fitter', 'Hydraulics', 'Pneumatics', 'Preventive Maintenance', 'Bearing Replacement'],
        perks: ['Overtime Allowance', 'Subsidized Food', 'PF & ESIC', 'Quarterly Safety Award']
      },
      {
        title: 'PLC & Automation Systems Engineer',
        trade: 'Electrical & Automation',
        minExp: 3,
        maxExp: 8,
        salMin: 450000,
        salMax: 850000,
        jobType: 'Full-time',
        workMode: 'On-site',
        openings: 4,
        description: 'Program, commission, and maintain industrial PLCs (Siemens TIA Portal / Allen-Bradley), SCADA, HMI, and robotic automation lines.',
        responsibilities: [
          'Develop ladder logic and structured text programming for automated assembly lines.',
          'Integrate Profinet/EtherNet IP fieldbus networks and industrial VFD drives.',
          'Troubleshoot robot controllers (Fanuc/KUKA/ABB) and sensor interlocks.'
        ],
        requirements: [
          'B.E. / B.Tech in Electrical / Instrumentation / Mechatronics Engineering.',
          '3+ years hands-on experience in PLC programming and industrial automation.',
          'Familiarity with Siemens S7-1500, TIA Portal, and SCADA systems.'
        ],
        skills: ['PLC Programming', 'Siemens TIA Portal', 'SCADA', 'Industrial Automation', 'Robotics', 'Profinet'],
        perks: ['Flexi Pay', 'Health Insurance ₹5L', 'Annual Performance Bonus', 'Hybrid Support']
      },
      {
        title: 'Production Assembly Line Supervisor',
        trade: 'Production Management',
        minExp: 3,
        maxExp: 8,
        salMin: 380000,
        salMax: 650000,
        jobType: 'Full-time',
        workMode: 'On-site',
        openings: 5,
        description: 'Supervise shift production targets, line balancing, manpower allocation, OEE improvement, and Kaizen initiatives.',
        responsibilities: [
          'Lead a shift of 30+ assembly operators to achieve shift production quotas.',
          'Monitor Overall Equipment Effectiveness (OEE), scrap reduction, and line downtime.',
          'Implement 5S, TPM, and daily Gemba walks.'
        ],
        requirements: [
          'Diploma / Degree in Mechanical / Automobile Engineering.',
          '3+ years supervisory experience on automotive assembly line.',
          'Strong leadership and shop floor communication skills.'
        ],
        skills: ['Production Supervisor', 'OEE Improvement', '5S & TPM', 'Assembly Line', 'Manpower Handling'],
        perks: ['Performance Incentive', 'Free Bus', 'Duty Meal', 'Group Mediclaim']
      },
      {
        title: 'Full Stack Web Developer (Node.js & React)',
        trade: 'Software Development',
        minExp: 2,
        maxExp: 6,
        salMin: 600000,
        salMax: 1200000,
        jobType: 'Full-time',
        workMode: 'Hybrid',
        openings: 4,
        description: 'Build modern responsive enterprise web applications, REST APIs, and microservices using React, TypeScript, Node.js, and PostgreSQL.',
        responsibilities: [
          'Design and implement scalable RESTful APIs and database schemas.',
          'Develop interactive UI dashboards with React, Redux/Zustand, and Tailwind CSS.',
          'Write unit tests, participate in code reviews, and deploy on AWS / Docker pipelines.'
        ],
        requirements: [
          'B.E. / B.Tech / MCA in Computer Science / IT.',
          '2+ years professional software development experience.',
          'Proficient in TypeScript, Node.js, Express, React, PostgreSQL/MongoDB.'
        ],
        skills: ['React', 'TypeScript', 'Node.js', 'PostgreSQL', 'REST API', 'Docker'],
        perks: ['Flexible Working Hours', 'Laptop Allowance', 'Certification Reimbursement', 'WFH Option']
      },
      {
        title: 'Store Keeper & Warehouse Inventory Associate',
        trade: 'Logistics & Store',
        minExp: 1,
        maxExp: 4,
        salMin: 200000,
        salMax: 320000,
        jobType: 'Full-time',
        workMode: 'On-site',
        openings: 6,
        description: 'Manage material inwarding, SAP MIGO goods receipt, binning, inventory audits, and line feeding in central warehouse.',
        responsibilities: [
          'Perform physical stock verification and reconcile with SAP ERP inventory entries.',
          'Manage FIFO material dispatch to assembly lines and prepare gate passes.',
          'Operate battery-operated pallet trucks (BOPT) and stackers safely.'
        ],
        requirements: [
          'Graduate or Diploma in Material Management / Commerce.',
          '1+ year experience in industrial storekeeping or warehouse operations.',
          'Hands-on experience with SAP MM module or Tally ERP.'
        ],
        skills: ['Store Keeper', 'SAP MM', 'Inventory Management', 'FIFO', 'Warehouse Operations'],
        perks: ['PF & ESI', 'Overtime Pay', 'Subsidized Canteen', 'Transport']
      },
      {
        title: 'Retail Store Sales Executive',
        trade: 'Retail & Sales',
        minExp: 0,
        maxExp: 3,
        salMin: 180000,
        salMax: 280000,
        jobType: 'Full-time',
        workMode: 'On-site',
        openings: 10,
        description: 'Assist store customers, manage counter sales, maintain shelf merchandising, billing POS, and achieve monthly sales targets.',
        responsibilities: [
          'Greet shoppers, understand product requirements, and guide purchasing choices.',
          'Maintain visual merchandising standards and stock refill on sales floor.',
          'Process POS cash/card transactions quickly and accurately.'
        ],
        requirements: [
          '12th Pass or Any Graduate.',
          'Good spoken Hindi and Marathi communication skills.',
          'Customer-centric attitude and willingness to work flexible retail shifts.'
        ],
        skills: ['Retail Sales', 'Customer Service', 'POS Billing', 'Merchandising', 'Communication'],
        perks: ['Monthly Sales Incentive', 'Staff Discount 15%', 'Health Cover', 'Uniform Provided']
      },
      {
        title: 'Assistant Professor - Mechanical Engineering',
        trade: 'Education & Faculty',
        minExp: 2,
        maxExp: 7,
        salMin: 480000,
        salMax: 840000,
        jobType: 'Full-time',
        workMode: 'On-site',
        openings: 3,
        description: 'Deliver undergraduate lectures, conduct CAD/CAM lab practicals, guide final-year student projects, and publish research papers.',
        responsibilities: [
          'Teach courses in CAD/CAM, Thermodynamics, Machine Design, and Mechatronics.',
          'Supervise student laboratory experiments, mini-projects, and industrial visits.',
          'Participate in NBA accreditation documentation and departmental committees.'
        ],
        requirements: [
          'M.Tech / M.E. in Mechanical Engineering with first class.',
          '2+ years teaching or industry R&D experience.',
          'GATE qualification or Ph.D. preferred.'
        ],
        skills: ['Teaching', 'CAD/CAM', 'Machine Design', 'Research', 'NBA Accreditation'],
        perks: ['7th Pay Scale Perks', 'Provident Fund', 'Research Grant', 'Paid Vacation']
      },
      {
        title: 'Relationship Manager - Commercial & MSME Banking',
        trade: 'Banking & Finance',
        minExp: 2,
        maxExp: 6,
        salMin: 500000,
        salMax: 900000,
        jobType: 'Full-time',
        workMode: 'On-site',
        openings: 4,
        description: 'Source and manage commercial MSME loan portfolios, working capital credit facilities, letter of credit (LC), and bank guarantees for MIDC industries.',
        responsibilities: [
          'Acquire new industrial MSME clients across Waluj, Chikalthana, and Shendra MIDC belts.',
          'Prepare credit appraisal notes (CAM), financial ratio analysis, and balance sheet evaluations.',
          'Ensure timely loan renewals, documentation, and debt service tracking.'
        ],
        requirements: [
          'MBA Finance / CA / M.Com.',
          '2+ years experience in MSME or SME commercial banking credit/sales.',
          'Strong network in Chhatrapati Sambhajinagar industrial sector.'
        ],
        skills: ['Commercial Banking', 'MSME Loans', 'Credit Appraisal', 'Financial Analysis', 'Client Acquisition'],
        perks: ['Quarterly Performance Bonus', 'Travel Allowance', 'Mediclaim ₹5L', 'Staff Loan Benefits']
      }
    ];

    let totalCount = 0;

    // Filter out healthcare companies that were seeded in HealthcareSeeder
    const nonHealthcareCompanies = Array.from(companyMap.keys()).filter((name) => {
      return ![
        'MGM Medical College & Hospital',
        'United CIIGMA Hospital',
        'Medicover Hospitals',
        'Dr. Hedgewar Hospital',
        'Seth Nandlal Dhoot Hospital',
        'Apex Multispecialty Hospital',
        'Cipla Ltd',
        'Ajanta Pharma Ltd',
        'Lupin Ltd',
        'Sun Pharma Industries'
      ].includes(name);
    });

    for (const compName of nonHealthcareCompanies) {
      const companyRecord = companyMap.get(compName);
      if (!companyRecord) continue;

      const { employerId, companyData } = companyRecord;

      // Seed 3 to 5 jobs per company
      const jobsPerCompany = Math.floor(Math.random() * 3) + 3; // 3, 4, or 5 jobs

      for (let i = 0; i < jobsPerCompany; i++) {
        const tplIndex = (totalCount + i) % industrialJobTemplates.length;
        const tpl = industrialJobTemplates[tplIndex];

        // Add minor lat/lng jitter within ~200-400m for realistic scatter on map
        const latJitter = (Math.random() - 0.5) * 0.004;
        const lngJitter = (Math.random() - 0.5) * 0.004;
        const latitude = parseFloat((companyData.latitude + latJitter).toFixed(6));
        const longitude = parseFloat((companyData.longitude + lngJitter).toFixed(6));

        await client.query(
          `
          INSERT INTO jobs (
            employer_id, company, company_logo, company_color, title, industry, location,
            latitude, longitude, geocoding_status, last_geocoded_at, location_accuracy,
            job_type, work_mode, min_experience, max_experience, salary_min, salary_max,
            openings, filled_openings, min_age, max_age, gender, description,
            responsibilities, requirements, skills, perks, featured, status, views,
            posted_at, midc_zone, shift_details, overtime, accommodation, bus_facility,
            canteen, joining_bonus, attendance_bonus, contract_duration, walk_in_date,
            interview_address, trade
          ) VALUES (
            $1, $2, $3, $4, $5, $6, $7,
            $8, $9, 'SUCCESS', CURRENT_TIMESTAMP, 'EXACT',
            $10, $11, $12, $13, $14, $15,
            $16, 0, 18, 50, 'Any', $17,
            $18, $19, $20, $21, $22, 'APPROVED', $23,
            CURRENT_TIMESTAMP - ($24 || ' day')::INTERVAL, $25, $26, $27, $28, $29,
            $30, $31, $32, 'Permanent', NULL, $33, $34
          );
          `,
          [
            employerId,
            companyData.name,
            companyData.logo,
            companyData.color,
            tpl.title,
            companyData.industry,
            `${companyData.midcZone}, ${companyData.city}`,
            latitude,
            longitude,
            tpl.jobType,
            tpl.workMode,
            tpl.minExp,
            tpl.maxExp,
            tpl.salMin,
            tpl.salMax,
            tpl.openings,
            tpl.description,
            JSON.stringify(tpl.responsibilities),
            JSON.stringify(tpl.requirements),
            JSON.stringify(tpl.skills),
            JSON.stringify(tpl.perks),
            i === 0, // feature 1st job of each company
            Math.floor(Math.random() * 220) + 30,
            i % 15,
            companyData.midcZone,
            'General Shift (8:30 AM - 5:30 PM)',
            i % 2 === 0,
            i % 3 === 0,
            true, // bus
            true, // canteen
            i % 4 === 0,
            true,
            `${companyData.address}, ${companyData.city}, Maharashtra - ${companyData.pincode}`,
            tpl.trade
          ]
        );

        totalCount++;
      }
    }

    console.log(`✅ Seeded ${totalCount} Industrial, IT, Retail & Services jobs.`);
    return totalCount;
  }
}
