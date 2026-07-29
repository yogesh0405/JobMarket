import { PoolClient } from 'pg';
import { SeededCompanyRecord } from './companiesSeeder';

export class HealthcareSeeder {
  static async seed(client: PoolClient, companyMap: Map<string, SeededCompanyRecord>): Promise<number> {
    console.log('🏥 Seeding Healthcare & Medical jobs for Chhatrapati Sambhajinagar hospitals & pharma plants...');

    const healthcareCompanies = [
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
    ];

    const healthcareJobTemplates = [
      {
        title: 'ICU Staff Nurse (NABH Accredited ICU)',
        trade: 'Nursing',
        minExp: 1,
        maxExp: 5,
        salMin: 240000,
        salMax: 420000,
        jobType: 'Full-time',
        workMode: 'On-site',
        openings: 8,
        description: 'Provide critical care nursing support in a 30-bed intensive care unit (ICU/ICCU). Monitor multi-para monitors, mechanical ventilators, arterial lines, and administer critical medication.',
        responsibilities: [
          'Monitor ventilator parameters, arterial blood gas (ABG) reports, and central lines.',
          'Administer IV infusions, blood transfusions, and emergency cardiac life support.',
          'Maintain NABH nursing documentation and shift handover notes.'
        ],
        requirements: [
          'B.Sc Nursing or GNM with valid Maharashtra Nursing Council (MNC) registration.',
          'Minimum 1 year ICU/CCU clinical bedside nursing experience.',
          'BLS and ACLS certification preferred.'
        ],
        skills: ['ICU Nursing', 'Critical Care', 'MNC Registered', 'BLS/ACLS', 'Ventilator Care', 'Patient Monitoring'],
        perks: ['Subsidized Meals', 'Hostel Accommodation Available', 'Medical Insurance ₹3L', 'Night Shift Allowance ₹300/night']
      },
      {
        title: 'Emergency Medical Officer (EMO - Casualty)',
        trade: 'Medical Officer',
        minExp: 2,
        maxExp: 7,
        salMin: 720000,
        salMax: 1200000,
        jobType: 'Full-time',
        workMode: 'On-site',
        openings: 3,
        description: 'Handle emergency triage, acute trauma resuscitation, cardiac emergencies, and casualty admissions in round-the-clock emergency department.',
        responsibilities: [
          'Provide initial emergency stabilization, intubation, CPR, and trauma care.',
          'Coordinate immediate specialty referrals with cardiologists, neurosurgeons, and orthopedic surgeons.',
          'Document medico-legal cases (MLC) accurately as per medical board guidelines.'
        ],
        requirements: [
          'MBBS degree with valid MMC (Maharashtra Medical Council) registration.',
          '2+ years experience in Hospital Emergency / Trauma Department.',
          'AHA ACLS/ATLS certification highly desirable.'
        ],
        skills: ['Emergency Medicine', 'MBBS', 'MMC Registered', 'Trauma Care', 'ACLS', 'Triage'],
        perks: ['Performance Bonus', 'Family Medical Insurance ₹5L', 'Professional Indemnity Cover', 'Free Transport']
      },
      {
        title: 'BAMS Resident Doctor (Ward / Emergency)',
        trade: 'Ayush / Resident Doctor',
        minExp: 1,
        maxExp: 4,
        salMin: 360000,
        salMax: 540000,
        jobType: 'Full-time',
        workMode: 'On-site',
        openings: 5,
        description: 'Manage in-patient department (IPD) wards, take clinical rounds, assist senior consultants, and manage patient admissions/discharges.',
        responsibilities: [
          'Conduct routine patient rounds, record vital signs, and update treatment charts.',
          'Assist senior medical officers during emergency procedures and admissions.',
          'Prepare detailed discharge summaries and patient case histories.'
        ],
        requirements: [
          'BAMS degree with valid MCIM registration.',
          '1+ year clinical experience in multi-specialty hospital IPD wards.',
          'Proficient in basic emergency medical management.'
        ],
        skills: ['BAMS', 'IPD Ward Care', 'Patient Management', 'Emergency Care', 'Medical Records'],
        perks: ['Duty Meals Provided', 'PF & ESI', 'Annual Performance Increment', 'Shift Rotation']
      },
      {
        title: 'Senior Clinical Pharmacist (In-Patient & OPD)',
        trade: 'Pharmacy',
        minExp: 1,
        maxExp: 5,
        salMin: 220000,
        salMax: 360000,
        jobType: 'Full-time',
        workMode: 'On-site',
        openings: 4,
        description: 'Dispense prescription medications, audit hospital pharmacy inventory, check drug interactions, and maintain narcotic drug registers.',
        responsibilities: [
          'Verify physician prescriptions for dosage accuracy, drug contraindications, and allergies.',
          'Manage IPD dose dispensing, cold chain storage (2-8°C), and inventory control.',
          'Maintain schedule H1 and narcotic medicine registers as per Drug Controller norms.'
        ],
        requirements: [
          'B.Pharm or D.Pharm with valid Maharashtra State Pharmacy Council (MSPC) license.',
          '1+ year hospital pharmacy dispensing experience.',
          'Knowledge of hospital pharmacy software (HIS).'
        ],
        skills: ['B.Pharm', 'Pharmacy Dispensing', 'Drug Safety', 'Cold Chain Management', 'MSPC Registered'],
        perks: ['Attendance Bonus', 'Subsidized Canteen', 'Medical Benefits', 'Overtime Pay']
      },
      {
        title: 'Diagnostic Lab Technician (DMLT / BMLT)',
        trade: 'Laboratory',
        minExp: 1,
        maxExp: 4,
        salMin: 200000,
        salMax: 320000,
        jobType: 'Full-time',
        workMode: 'On-site',
        openings: 6,
        description: 'Perform hematology, biochemistry, microbiology, and pathology diagnostic tests on fully automated analyzers.',
        responsibilities: [
          'Collect blood, urine, and body fluid specimens strictly following bio-safety protocols.',
          'Operate automated chemistry, hematology, and ELISA lab equipment.',
          'Perform daily Quality Control (QC) calibration and report verification.'
        ],
        requirements: [
          'BMLT or DMLT qualification from a recognized institution.',
          'Hands-on experience operating semi/fully automated pathology analyzers.',
          'Knowledge of NABL laboratory accreditation standards.'
        ],
        skills: ['DMLT', 'Pathology Lab', 'Hematology', 'Biochemistry', 'Specimen Collection', 'NABL Protocol'],
        perks: ['PF & ESIC', 'Canteen Facility', 'Uniform Allowance', 'Annual Health Checkup']
      },
      {
        title: 'Radiology Technician (CT Scan & MRI)',
        trade: 'Radiology',
        minExp: 2,
        maxExp: 6,
        salMin: 280000,
        salMax: 480000,
        jobType: 'Full-time',
        workMode: 'On-site',
        openings: 3,
        description: 'Operate 128-slice CT scanner, 1.5T MRI machine, digital X-Ray, and assist radiologists in diagnostic imaging procedures.',
        responsibilities: [
          'Position patients accurately for CT, MRI, and digital radiography scans.',
          'Administer IV contrast media under radiologist supervision.',
          'Ensure radiation protection protocols (TLD badge compliance and lead aprons).'
        ],
        requirements: [
          'B.Sc Radiography or Diploma in X-Ray / CT / MRI Technology.',
          '2+ years experience operating high-end CT / MRI diagnostic equipment.',
          'AERB radiation safety certification preferred.'
        ],
        skills: ['CT Scan', 'MRI', 'X-Ray', 'Radiography', 'AERB Safety', 'PACS System'],
        perks: ['Radiation Hazard Allowance', 'Health Insurance ₹4L', 'Paid Leave', 'Duty Meals']
      },
      {
        title: 'Biomedical Equipment Engineer',
        trade: 'Biomedical Engineering',
        minExp: 2,
        maxExp: 6,
        salMin: 320000,
        salMax: 550000,
        jobType: 'Full-time',
        workMode: 'On-site',
        openings: 2,
        description: 'Maintain, calibrate, and troubleshoot life-support medical equipment including ventilators, dialysis units, cath lab systems, and OT lights.',
        responsibilities: [
          'Perform preventive maintenance, breakdown repairs, and safety testing on medical devices.',
          'Manage Annual Maintenance Contracts (AMC/CMC) with equipment vendors.',
          'Ensure NABH compliance for calibration logs and biomedical equipment history files.'
        ],
        requirements: [
          'B.E. or Diploma in Biomedical Engineering.',
          '2+ years experience maintaining hospital medical equipment.',
          'Proficient in troubleshooting electronic medical instrumentation.'
        ],
        skills: ['Biomedical Engineering', 'Medical Equipment', 'Ventilators', 'Calibration', 'NABH Standards'],
        perks: ['Mobile Allowance', 'Health Insurance', 'Annual Bonus', 'Technical Training']
      },
      {
        title: 'Pharma Quality Assurance (QA) Executive',
        trade: 'Pharma Quality',
        minExp: 2,
        maxExp: 6,
        salMin: 350000,
        salMax: 600000,
        jobType: 'Full-time',
        workMode: 'On-site',
        openings: 4,
        description: 'Ensure cGMP compliance, IPQC checks, batch release documentation, change control, and CAPA investigations in FDA-approved manufacturing unit.',
        responsibilities: [
          'Review Batch Manufacturing Records (BMR) and Batch Packaging Records (BPR).',
          'Conduct internal cGMP audits, process validation, and risk assessments.',
          'Investigate Out of Specification (OOS) and Out of Trend (OOT) test results.'
        ],
        requirements: [
          'M.Pharm or B.Pharm degree.',
          '2+ years experience in USFDA / MHRA compliant formulation plant QA department.',
          'Thorough understanding of ICH guidelines and cGMP norms.'
        ],
        skills: ['Pharma QA', 'cGMP', 'BMR/BPR', 'USFDA Compliance', 'CAPA', 'Validation'],
        perks: ['Company Bus Facility', 'Subsidized Canteen', 'Bonus ₹40K', 'PF & ESIC']
      },
      {
        title: 'Pharma QC Chemist (HPLC / GC Specialist)',
        trade: 'Pharma Quality Control',
        minExp: 1,
        maxExp: 5,
        salMin: 280000,
        salMax: 480000,
        jobType: 'Full-time',
        workMode: 'On-site',
        openings: 5,
        description: 'Perform analytical testing of raw materials, finished products, and stability samples using HPLC, GC, UV-Vis spectrophotometers.',
        responsibilities: [
          'Analyze raw materials, in-process samples, and finished dosage forms on HPLC & GC.',
          'Execute assay, dissolution testing, related substances, and impurity profiling.',
          'Maintain analytical test data in compliance with ALCOA+ data integrity principles.'
        ],
        requirements: [
          'M.Sc Chemistry or B.Pharm.',
          '1+ year analytical experience using Waters / Agilent HPLC software (Empower 3).',
          'Good understanding of GLP and cGMP lab practices.'
        ],
        skills: ['HPLC', 'Gas Chromatography', 'Pharma QC', 'Empower 3', 'Dissolution', 'GLP'],
        perks: ['Bus Transport', 'Canteen Meal', 'Shift Allowance', 'Annual Incentive']
      }
    ];

    let insertedCount = 0;

    for (const compName of healthcareCompanies) {
      const companyRecord = companyMap.get(compName);
      if (!companyRecord) continue;

      const { employerId, companyData } = companyRecord;

      // Assign 4 to 6 healthcare jobs per hospital/pharma company
      const templateCount = Math.floor(Math.random() * 3) + 4; // 4 to 6 jobs

      for (let i = 0; i < templateCount; i++) {
        const templateIndex = (insertedCount + i) % healthcareJobTemplates.length;
        const tpl = healthcareJobTemplates[templateIndex];

        // Add slight random coordinate jitter within 300m for realistic campus mapping
        const latJitter = (Math.random() - 0.5) * 0.003;
        const lngJitter = (Math.random() - 0.5) * 0.003;
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
            $16, 0, 20, 45, 'Any', $17,
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
            i === 0, // featured for first job of each hospital
            Math.floor(Math.random() * 180) + 25,
            i % 12,
            companyData.midcZone,
            'Rotational Shift (A / B / Night)',
            false,
            true, // accommodation
            true, // bus
            true, // canteen
            false,
            true,
            `${companyData.address}, ${companyData.city}, Maharashtra - ${companyData.pincode}`,
            tpl.trade
          ]
        );

        insertedCount++;
      }
    }

    console.log(`✅ Seeded ${insertedCount} Healthcare & Medical jobs.`);
    return insertedCount;
  }
}
