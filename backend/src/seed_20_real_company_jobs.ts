import { pool } from './config/database/pool';

const REAL_COMPANY_JOBS = [
  {
    company: 'Tata Motors Limited',
    companyLogo: 'https://unavatar.io/tata.com',
    companyColor: '#0052cc',
    title: 'Automotive CNC Machine Operator',
    industry: 'Automotive Manufacturing',
    location: 'Waluj MIDC, Chhatrapati Sambhajinagar',
    trade: 'CNC Operator',
    midcZone: 'Waluj MIDC Sector 4',
    shiftDetails: 'Rotational 3-Shift (8 Hours)',
    overtime: true,
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
    salaryMin: 280000,
    salaryMax: 420000,
    openings: 20,
    filledOpenings: 4,
    status: 'APPROVED',
    description: 'Tata Motors Waluj plant urgently requires experienced CNC and VMC machine operators for engine block machining and transmission component fabrication.',
    responsibilities: [
      'Operate 3-axis CNC turning and 4-axis VMC milling machines.',
      'Measure component dimensions using Vernier caliper, micrometer, and dial indicator.',
      'Maintain 5S and 1S/2S TPM machine logs.'
    ],
    requirements: [
      'ITI Machinist / Turner / Fitter or Diploma in Mechanical Engineering.',
      '1+ years hands-on experience on Fanuc or Siemens controls.'
    ],
    skills: ['CNC Operation', 'VMC Milling', 'Fanuc Controls', 'Quality Inspection', 'Blueprint Reading'],
    perks: ['Subsidized Canteen (₹15/meal)', 'Free Bus Transport', 'Attendance Bonus ₹1500/mo']
  },
  {
    company: 'Bajaj Auto Limited',
    companyLogo: 'https://unavatar.io/bajajauto.com',
    companyColor: '#0284c7',
    title: 'TIG & Robotic Welding Technician',
    industry: 'Two-Wheeler Manufacturing',
    location: 'Waluj MIDC, Chhatrapati Sambhajinagar',
    trade: 'Welder',
    midcZone: 'Waluj MIDC Sector 2',
    shiftDetails: 'General & Morning Shift',
    overtime: true,
    accommodation: false,
    busFacility: true,
    canteen: true,
    joiningBonus: true,
    attendanceBonus: true,
    contractDuration: 'Permanent',
    jobType: 'Full-time',
    workMode: 'On-site',
    minExperience: 2,
    maxExperience: 5,
    salaryMin: 320000,
    salaryMax: 480000,
    openings: 15,
    filledOpenings: 3,
    status: 'APPROVED',
    description: 'Bajaj Auto Chassis Plant seeks skilled TIG/MIG welders and robotic welding cell operators for motorcycle frame manufacturing.',
    responsibilities: [
      'Execute high-precision TIG & MIG welding on aluminum and steel motorcycle frames.',
      'Monitor automated Fanuc/ABB robotic welding stations.',
      'Conduct weld seam inspection and dye-penetrant testing.'
    ],
    requirements: [
      'ITI Welder (NCVT/SCVT certified).',
      '2+ years experience in automotive sheet metal or frame welding.'
    ],
    skills: ['TIG Welding', 'MIG Welding', 'Robotic Welding', 'Chassis Fabrication', 'Safety Standards'],
    perks: ['PF + ESI + Gratuity', 'Uniform & Safety Gear Provided', 'Overtime ₹130/hr']
  },
  {
    company: 'Tata Consultancy Services',
    companyLogo: 'https://unavatar.io/tcs.com',
    companyColor: '#0052cc',
    title: 'Java Full Stack Developer (Spring Boot & React)',
    industry: 'IT Services & Consulting',
    location: 'Chhinwara IT Park, Pune',
    trade: 'Software Engineering',
    midcZone: 'Hinjewadi IT Park Phase 3',
    shiftDetails: 'General Shift (9:00 AM - 6:00 PM)',
    overtime: false,
    accommodation: false,
    busFacility: true,
    canteen: true,
    joiningBonus: true,
    attendanceBonus: false,
    contractDuration: 'Permanent',
    jobType: 'Full-time',
    workMode: 'Hybrid',
    minExperience: 3,
    maxExperience: 7,
    salaryMin: 900000,
    salaryMax: 1500000,
    openings: 30,
    filledOpenings: 8,
    status: 'APPROVED',
    description: 'TCS Digital Banking unit hiring Java Full Stack Engineers with expertise in Spring Boot microservices, React.js, and AWS deployments.',
    responsibilities: [
      'Develop microservices using Java 17, Spring Boot, and PostgreSQL.',
      'Build responsive candidate and admin web UI components in React and TypeScript.',
      'Deploy applications on AWS ECS/EKS with automated CI/CD pipelines.'
    ],
    requirements: [
      'B.E. / B.Tech / MCA in Computer Science or Information Technology.',
      '3+ years professional experience in Java, REST APIs, and React.'
    ],
    skills: ['Java 17', 'Spring Boot', 'React', 'TypeScript', 'PostgreSQL', 'AWS'],
    perks: ['Health Cover ₹5,00,000', 'Hybrid Work Model', 'Annual Performance Incentive']
  },
  {
    company: 'Infosys Limited',
    companyLogo: 'https://unavatar.io/infosys.com',
    companyColor: '#0284c7',
    title: 'React Native Mobile Application Engineer',
    industry: 'IT Software & Cloud',
    location: 'Hinjewadi Phase 2, Pune',
    trade: 'Mobile App Development',
    midcZone: 'Hinjewadi IT Hub',
    shiftDetails: 'Flexible Shift',
    overtime: false,
    accommodation: false,
    busFacility: true,
    canteen: true,
    joiningBonus: true,
    attendanceBonus: false,
    contractDuration: 'Permanent',
    jobType: 'Full-time',
    workMode: 'Hybrid',
    minExperience: 2,
    maxExperience: 6,
    salaryMin: 850000,
    salaryMax: 1400000,
    openings: 12,
    filledOpenings: 2,
    status: 'APPROVED',
    description: 'Infosys Mobile COE looking for React Native developers to build enterprise Android/iOS mobile applications for global logistics clients.',
    responsibilities: [
      'Develop cross-platform iOS and Android screens using React Native and Expo.',
      'Integrate REST APIs, AsyncStorage, and push notifications.',
      'Optimize UI rendering performance and smooth navigation transitions.'
    ],
    requirements: [
      'Bachelor degree in Computer Science or Software Engineering.',
      '2+ years hands-on React Native mobile application development experience.'
    ],
    skills: ['React Native', 'Expo', 'TypeScript', 'Redux / Context API', 'RESTful APIs'],
    perks: ['Flexible Work Hours', 'Laptop & Workstation Provided', 'Higher Education Sponsorship']
  },
  {
    company: 'Persistent Systems',
    companyLogo: 'https://unavatar.io/persistent.com',
    companyColor: '#ea580c',
    title: 'DevOps & Cloud Infrastructure Engineer',
    industry: 'Software Engineering',
    location: 'Senapati Bapat Road, Pune',
    trade: 'DevOps & Cloud',
    midcZone: 'SB Road IT Hub',
    shiftDetails: 'General Shift',
    overtime: false,
    accommodation: false,
    busFacility: true,
    canteen: true,
    joiningBonus: true,
    attendanceBonus: false,
    contractDuration: 'Permanent',
    jobType: 'Full-time',
    workMode: 'Hybrid',
    minExperience: 3,
    maxExperience: 8,
    salaryMin: 1100000,
    salaryMax: 1800000,
    openings: 8,
    filledOpenings: 1,
    status: 'APPROVED',
    description: 'Persistent Systems hiring DevOps Engineers to manage AWS Kubernetes infrastructure, Docker containerization, and Render/Heroku deployments.',
    responsibilities: [
      'Manage CI/CD pipelines using GitHub Actions and Jenkins.',
      'Configure Kubernetes clusters, NGINX ingress routing, and PostgreSQL databases.',
      'Monitor infrastructure health and response times.'
    ],
    requirements: [
      'Degree in CS / IT.',
      '3+ years DevOps experience with AWS, Docker, and Kubernetes.'
    ],
    skills: ['AWS', 'Docker', 'Kubernetes', 'GitHub Actions', 'PostgreSQL', 'Linux'],
    perks: ['Comprehensive Family Health Insurance', 'Annual Certification Reimbursement']
  },
  {
    company: 'Mahindra & Mahindra',
    companyLogo: 'https://unavatar.io/mahindra.com',
    companyColor: '#dc2626',
    title: 'Quality Control & Inspection Engineer',
    industry: 'Automotive Manufacturing',
    location: 'Chakan MIDC Phase 4, Pune',
    trade: 'Quality Assurance',
    midcZone: 'Chakan MIDC',
    shiftDetails: 'Rotational 3-Shift',
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
    maxExperience: 6,
    salaryMin: 360000,
    salaryMax: 550000,
    openings: 18,
    filledOpenings: 5,
    status: 'APPROVED',
    description: 'Mahindra Chakan SUV manufacturing unit hiring Quality Control Engineers for CMM inspection, PPAP documentation, and line quality audit.',
    responsibilities: [
      'Perform CMM dimensional inspection on vehicle engine blocks and body panels.',
      'Maintain ISO 9001 and IATF 16949 quality documentation.',
      'Resolve root causes of assembly line defects using 8D problem solving.'
    ],
    requirements: [
      'Diploma or B.E. in Mechanical / Automobile Engineering.',
      '2+ years QA/QC experience in automotive assembly.'
    ],
    skills: ['CMM Inspection', 'IATF 16949', 'Root Cause Analysis', 'Vernier & Micrometer', 'APQP/PPAP'],
    perks: ['Subsidized Food', 'Free Company Bus Transport', 'Overtime Bonus']
  },
  {
    company: 'Siemens India',
    companyLogo: 'https://unavatar.io/siemens.com',
    companyColor: '#006666',
    title: 'PLC & Automation Systems Engineer',
    industry: 'Industrial Automation',
    location: 'Shendra MIDC, Chhatrapati Sambhajinagar',
    trade: 'Electrical & Automation',
    midcZone: 'Shendra Industrial Zone',
    shiftDetails: 'General Shift',
    overtime: false,
    accommodation: false,
    busFacility: true,
    canteen: true,
    joiningBonus: true,
    attendanceBonus: true,
    contractDuration: 'Permanent',
    jobType: 'Full-time',
    workMode: 'On-site',
    minExperience: 2,
    maxExperience: 7,
    salaryMin: 500000,
    salaryMax: 850000,
    openings: 10,
    filledOpenings: 2,
    status: 'APPROVED',
    description: 'Siemens Shendra Smart Factory hiring Automation Engineers for S7-1200/1500 PLC programming, SCADA development, and industrial IoT integration.',
    responsibilities: [
      'Program Siemens S7 PLC controls using TIA Portal.',
      'Develop WinCC SCADA dashboards for industrial automation lines.',
      'Commission VFD drives, servo motors, and sensor networks.'
    ],
    requirements: [
      'B.E. / B.Tech in Electrical / Electronics / Instrumentation Engineering.',
      '2+ years experience in industrial automation PLC programming.'
    ],
    skills: ['Siemens TIA Portal', 'PLC Programming', 'SCADA', 'VFD Drives', 'Industrial Automation'],
    perks: ['Global Mobility Options', 'Medical Insurance ₹6 Lakhs', 'Annual Performance Bonus']
  },
  {
    company: 'Bosch Engineering',
    companyLogo: 'https://unavatar.io/bosch.com',
    companyColor: '#ea580c',
    title: 'Embedded Systems & ECU Firmware Engineer',
    industry: 'Automotive Electronics',
    location: 'Naregaon, Chhatrapati Sambhajinagar',
    trade: 'Embedded Electronics',
    midcZone: 'Chitegaon Industrial Area',
    shiftDetails: 'General Shift',
    overtime: false,
    accommodation: false,
    busFacility: true,
    canteen: true,
    joiningBonus: true,
    attendanceBonus: false,
    contractDuration: 'Permanent',
    jobType: 'Full-time',
    workMode: 'On-site',
    minExperience: 3,
    maxExperience: 8,
    salaryMin: 750000,
    salaryMax: 1300000,
    openings: 14,
    filledOpenings: 3,
    status: 'APPROVED',
    description: 'Bosch Automotive Electronics division seeking Embedded C software developers for Engine Control Unit (ECU) firmware and CAN bus protocol development.',
    responsibilities: [
      'Develop embedded C firmware for automotive electronic control units.',
      'Test CAN, LIN, and FlexRay communication protocols using CANoe.',
      'Perform MISRA C code compliance and unit testing.'
    ],
    requirements: [
      'B.E. in Electronics & Communication / Electrical Engineering.',
      '3+ years experience in Embedded C and automotive protocols.'
    ],
    skills: ['Embedded C', 'CAN Bus', 'CANoe', 'AUTOSAR', 'Microcontrollers', 'RTOS'],
    perks: ['Bosch International Training', 'Flexible Working Hours', 'Health Cover']
  },
  {
    company: 'Endurance Technologies',
    companyLogo: 'https://unavatar.io/endurancegroup.com',
    companyColor: '#2563eb',
    title: 'Die Casting & Foundry Production Supervisor',
    industry: 'Aluminium Die Casting',
    location: 'Waluj MIDC, Chhatrapati Sambhajinagar',
    trade: 'Production Supervisor',
    midcZone: 'Waluj Sector 3',
    shiftDetails: 'Rotational 3-Shift',
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
    maxExperience: 6,
    salaryMin: 340000,
    salaryMax: 500000,
    openings: 16,
    filledOpenings: 4,
    status: 'APPROVED',
    description: 'Endurance Technologies Waluj plant hiring High Pressure Die Casting (HPDC) supervisors for aluminum alloy component casting and shot monitoring.',
    responsibilities: [
      'Supervise 650T-1600T Buhler HPDC casting machines.',
      'Control furnace temperatures, molten metal degasification, and plunger velocity.',
      'Achieve daily shift production targets with zero defect tolerance.'
    ],
    requirements: [
      'Diploma in Metallurgy / Mechanical Engineering.',
      '2+ years experience in aluminum High Pressure Die Casting.'
    ],
    skills: ['HPDC Die Casting', 'Metallurgy', 'Melting Furnace', 'Shift Supervision', 'Production Planning'],
    perks: ['Free Accommodation Facility', 'Subsidized Canteen', 'Performance Bonus']
  },
  {
    company: 'Varroc Engineering',
    companyLogo: 'https://unavatar.io/varroc.com',
    companyColor: '#059669',
    title: 'Plastic Injection Molding Tooling Engineer',
    industry: 'Plastic Polymers & Lighting',
    location: 'Waluj MIDC, Chhatrapati Sambhajinagar',
    trade: 'Tooling & Molding',
    midcZone: 'Waluj Sector 1',
    shiftDetails: 'General Shift',
    overtime: true,
    accommodation: false,
    busFacility: true,
    canteen: true,
    joiningBonus: true,
    attendanceBonus: true,
    contractDuration: 'Permanent',
    jobType: 'Full-time',
    workMode: 'On-site',
    minExperience: 2,
    maxExperience: 5,
    salaryMin: 320000,
    salaryMax: 480000,
    openings: 12,
    filledOpenings: 2,
    status: 'APPROVED',
    description: 'Varroc Polymer Division seeking Injection Molding Tooling Engineers for mold maintenance, core/cavity polishing, and trial parameter optimization.',
    responsibilities: [
      'Set up plastic injection molding machines (Engel / Toshiba 100T-800T).',
      'Optimize molding parameters (injection pressure, cycle time, cooling time).',
      'Conduct preventive tool maintenance and mold repair.'
    ],
    requirements: [
      'CIPET Diploma or Diploma in Plastics Technology / Mechanical Engineering.',
      '2+ years experience in plastic injection molding.'
    ],
    skills: ['Injection Molding', 'Tool Maintenance', 'CIPET Certification', 'Polymers', 'Quality Parameters'],
    perks: ['ESI + PF', 'Uniform & Safety Shoes', 'Overtime Allowance']
  },
  {
    company: 'Larsen & Toubro',
    companyLogo: 'https://unavatar.io/larsentoubro.com',
    companyColor: '#1d4ed8',
    title: 'Heavy Structural Fabrication Engineer',
    industry: 'Heavy Engineering',
    location: 'Chakan MIDC Phase 2, Pune',
    trade: 'Structural Engineering',
    midcZone: 'Chakan MIDC',
    shiftDetails: 'General Shift',
    overtime: true,
    accommodation: true,
    busFacility: true,
    canteen: true,
    joiningBonus: true,
    attendanceBonus: true,
    contractDuration: 'Permanent',
    jobType: 'Full-time',
    workMode: 'On-site',
    minExperience: 3,
    maxExperience: 8,
    salaryMin: 450000,
    salaryMax: 720000,
    openings: 22,
    filledOpenings: 6,
    status: 'APPROVED',
    description: 'L&T Heavy Engineering seeking Structural Fabrication Engineers for defense and infrastructure heavy steel structure manufacturing.',
    responsibilities: [
      'Supervise heavy steel plate cutting, beveling, assembly, and SAW welding.',
      'Review engineering fabrication drawings and bill of materials (BOM).',
      'Ensure compliance with ASME and AWS D1.1 welding standards.'
    ],
    requirements: [
      'B.E. / Diploma in Mechanical / Production Engineering.',
      '3+ years experience in heavy steel fabrication.'
    ],
    skills: ['Structural Fabrication', 'ASME Code', 'SAW Welding', 'Production Planning', 'NDT Testing'],
    perks: ['Free Housing Facility', 'Subsidized Mess', 'Medical Insurance']
  },
  {
    company: 'Reliance Industries',
    companyLogo: 'https://unavatar.io/ril.com',
    companyColor: '#b91c1c',
    title: 'Petrochemical Process Maintenance Engineer',
    industry: 'Oil & Gas Petrochemicals',
    location: 'Nagothane Petrochemical Complex, Maharashtra',
    trade: 'Process Maintenance',
    midcZone: 'Nagothane Complex',
    shiftDetails: 'Rotational 3-Shift',
    overtime: false,
    accommodation: true,
    busFacility: true,
    canteen: true,
    joiningBonus: true,
    attendanceBonus: false,
    contractDuration: 'Permanent',
    jobType: 'Full-time',
    workMode: 'On-site',
    minExperience: 4,
    maxExperience: 9,
    salaryMin: 650000,
    salaryMax: 1100000,
    openings: 15,
    filledOpenings: 3,
    status: 'APPROVED',
    description: 'Reliance Petrochemicals hiring Maintenance Engineers for high-pressure pumps, heat exchangers, and steam turbine overhaul.',
    responsibilities: [
      'Execute preventive maintenance on centrifugal pumps, compressors, and valves.',
      'Perform laser alignment and vibration analysis on rotating equipment.',
      'Ensure strict adherence to plant safety permits and OSHA standards.'
    ],
    requirements: [
      'B.E. / B.Tech in Mechanical / Chemical Engineering.',
      '4+ years maintenance experience in continuous process plants.'
    ],
    skills: ['Rotating Equipment', 'Pumps & Turbines', 'Vibration Analysis', 'Plant Maintenance', 'OSHA Safety'],
    perks: ['Company Quarters Township', 'Free Medical Care for Family', 'Annual Retention Bonus']
  },
  {
    company: 'Wipro Technologies',
    companyLogo: 'https://unavatar.io/wipro.com',
    companyColor: '#0284c7',
    title: 'Cloud DevOps & Cyber Security Analyst',
    industry: 'IT & Cloud Security',
    location: 'Hinjewadi Phase 1, Pune',
    trade: 'Cyber Security',
    midcZone: 'Hinjewadi IT Park',
    shiftDetails: 'General Shift',
    overtime: false,
    accommodation: false,
    busFacility: true,
    canteen: true,
    joiningBonus: true,
    attendanceBonus: false,
    contractDuration: 'Permanent',
    jobType: 'Full-time',
    workMode: 'Hybrid',
    minExperience: 3,
    maxExperience: 7,
    salaryMin: 950000,
    salaryMax: 1600000,
    openings: 10,
    filledOpenings: 2,
    status: 'APPROVED',
    description: 'Wipro CyberSecurity Practice looking for SOC Analysts and Cloud Security Engineers to monitor SIEM alerts and secure AWS cloud infrastructure.',
    responsibilities: [
      'Monitor SOC security events using Splunk and Azure Sentinel.',
      'Perform vulnerability assessments (VAPT) and cloud posture hardening.',
      'Respond to security incidents and implement firewall rules.'
    ],
    requirements: [
      'Degree in Computer Science / IT / Cyber Security.',
      '3+ years experience in SOC monitoring and cloud security.'
    ],
    skills: ['Cyber Security', 'Splunk', 'AWS Security', 'VAPT', 'SIEM', 'Network Protocols'],
    perks: ['Flexible Hybrid Work', 'Global Certification Sponsorship', 'Health Insurance']
  },
  {
    company: 'HDFC Bank',
    companyLogo: 'https://unavatar.io/hdfcbank.com',
    companyColor: '#1e40af',
    title: 'Branch Operations & Credit Relationship Manager',
    industry: 'Banking & Financial Services',
    location: 'Kranti Chowk, Chhatrapati Sambhajinagar',
    trade: 'Banking Operations',
    midcZone: 'Central Business District',
    shiftDetails: 'General Shift (9:30 AM - 6:30 PM)',
    overtime: false,
    accommodation: false,
    busFacility: false,
    canteen: false,
    joiningBonus: true,
    attendanceBonus: false,
    contractDuration: 'Permanent',
    jobType: 'Full-time',
    workMode: 'On-site',
    minExperience: 2,
    maxExperience: 6,
    salaryMin: 450000,
    salaryMax: 750000,
    openings: 12,
    filledOpenings: 3,
    status: 'APPROVED',
    description: 'HDFC Bank hiring Credit Managers for commercial loan appraisal, working capital assessment, and MSME business banking relationships.',
    responsibilities: [
      'Appraise MSME loan proposals and perform financial statement analysis.',
      'Conduct site visits and verify creditworthiness of industrial clients.',
      'Ensure compliance with RBI guidelines and branch audit norms.'
    ],
    requirements: [
      'MBA Finance / M.Com / CA Inter.',
      '2+ years experience in retail or MSME banking credit operations.'
    ],
    skills: ['Credit Assessment', 'Financial Analysis', 'MSME Banking', 'Loan Appraisal', 'RBI Compliance'],
    perks: ['Low Interest Employee Loans', 'Mediclaim ₹4L', 'Quarterly Performance Incentives']
  },
  {
    company: 'State Bank of India',
    companyLogo: 'https://unavatar.io/sbi.co.in',
    companyColor: '#0369a1',
    title: 'IT Systems Administrator & DB Analyst',
    industry: 'Public Sector Banking',
    location: 'CIDCO Cannaught Place, Chhatrapati Sambhajinagar',
    trade: 'Database Administration',
    midcZone: 'CIDCO Commercial Area',
    shiftDetails: 'General Shift',
    overtime: false,
    accommodation: true,
    busFacility: false,
    canteen: true,
    joiningBonus: false,
    attendanceBonus: false,
    contractDuration: 'Permanent',
    jobType: 'Full-time',
    workMode: 'On-site',
    minExperience: 2,
    maxExperience: 5,
    salaryMin: 520000,
    salaryMax: 820000,
    openings: 8,
    filledOpenings: 1,
    status: 'APPROVED',
    description: 'State Bank of India IT Division hiring Database Administrators for Oracle/PostgreSQL database tuning, backup management, and server administration.',
    responsibilities: [
      'Maintain High-Availability Oracle & PostgreSQL database clusters.',
      'Perform automated daily database backups and disaster recovery drills.',
      'Optimize query execution plans and database storage indexes.'
    ],
    requirements: [
      'B.Tech / MCA in Computer Science / IT.',
      '2+ years DBA experience with PostgreSQL or Oracle.'
    ],
    skills: ['PostgreSQL', 'Oracle DB', 'Linux Administration', 'SQL Optimization', 'Backup & Recovery'],
    perks: ['Bank Quarters Facility', 'Pension & Gratuity', 'Medical Coverage']
  },
  {
    company: 'Amazon Development Center',
    companyLogo: 'https://unavatar.io/amazon.com',
    companyColor: '#ea580c',
    title: 'Supply Chain Operations & Logistics Lead',
    industry: 'E-Commerce & Logistics',
    location: 'Chakan Fulfillment Center, Pune',
    trade: 'Supply Chain Management',
    midcZone: 'Chakan Logistics Hub',
    shiftDetails: 'Rotational Shifts',
    overtime: true,
    accommodation: false,
    busFacility: true,
    canteen: true,
    joiningBonus: true,
    attendanceBonus: true,
    contractDuration: 'Permanent',
    jobType: 'Full-time',
    workMode: 'On-site',
    minExperience: 3,
    maxExperience: 7,
    salaryMin: 700000,
    salaryMax: 1200000,
    openings: 20,
    filledOpenings: 5,
    status: 'APPROVED',
    description: 'Amazon Logistics hiring Warehouse Area Managers to lead fulfillment center operations, inventory accuracy, and outbound dispatch logistics.',
    responsibilities: [
      'Lead a team of 40 warehouse associates in picking, packing, and sorting.',
      'Optimize inventory metrics using Amazon WMS (Warehouse Management System).',
      'Enforce strict workplace safety standards and SLA metrics.'
    ],
    requirements: [
      'Bachelor Degree in Engineering / Supply Chain / Management.',
      '3+ years experience in warehouse operations or logistics management.'
    ],
    skills: ['Supply Chain', 'WMS System', 'Logistics Management', 'Team Leadership', 'Inventory Control'],
    perks: ['Amazon RSU Stock Grants', 'Free Transport Bus', 'Comprehensive Medical Policy']
  },
  {
    company: 'Google Cloud India',
    companyLogo: 'https://unavatar.io/google.com',
    companyColor: '#4285f4',
    title: 'Cloud Solutions Architect (GCP & Data Engineering)',
    industry: 'Cloud Infrastructure & AI',
    location: 'Koregaon Park, Pune',
    trade: 'Cloud Architecture',
    midcZone: 'Koregaon Park Tech Center',
    shiftDetails: 'Flexible Shift',
    overtime: false,
    accommodation: false,
    busFacility: true,
    canteen: true,
    joiningBonus: true,
    attendanceBonus: false,
    contractDuration: 'Permanent',
    jobType: 'Full-time',
    workMode: 'Hybrid',
    minExperience: 5,
    maxExperience: 10,
    salaryMin: 2200000,
    salaryMax: 3500000,
    openings: 6,
    filledOpenings: 1,
    status: 'APPROVED',
    description: 'Google Cloud team seeking Cloud Solutions Architects to design scalable GCP data pipelines, BigQuery analytics, and enterprise AI integrations.',
    responsibilities: [
      'Architect enterprise cloud migration strategies on Google Cloud Platform.',
      'Build real-time data streaming pipelines using BigQuery, Dataflow, and Pub/Sub.',
      'Guide enterprise clients on cloud security, cost optimization, and DevOps.'
    ],
    requirements: [
      'B.Tech / M.Tech in CS or equivalent.',
      '5+ years experience designing GCP cloud solutions.'
    ],
    skills: ['GCP Cloud', 'BigQuery', 'Data Pipelines', 'Kubernetes', 'System Architecture', 'Python'],
    perks: ['Google Stock Units (GSUs)', 'Free Gourmet Meals', 'Top-tier Health Coverage']
  },
  {
    company: 'Tech Mahindra',
    companyLogo: 'https://unavatar.io/techmahindra.com',
    companyColor: '#e11d48',
    title: 'Embedded IoT & Automotive Telematics Engineer',
    industry: 'Telecommunications & Automotive',
    location: 'Rajiv Gandhi InfoTech Park, Hinjewadi, Pune',
    trade: 'IoT Engineering',
    midcZone: 'Hinjewadi Phase 3',
    shiftDetails: 'General Shift',
    overtime: false,
    accommodation: false,
    busFacility: true,
    canteen: true,
    joiningBonus: true,
    attendanceBonus: false,
    contractDuration: 'Permanent',
    jobType: 'Full-time',
    workMode: 'Hybrid',
    minExperience: 3,
    maxExperience: 7,
    salaryMin: 800000,
    salaryMax: 1400000,
    openings: 15,
    filledOpenings: 3,
    status: 'APPROVED',
    description: 'Tech Mahindra Connected Mobility unit hiring IoT Engineers for connected vehicle telematics, GPS tracking protocols, and MQTT cloud gateways.',
    responsibilities: [
      'Develop C/C++ firmware for OBD-II vehicle tracking hardware.',
      'Integrate MQTT and HTTP communication protocols with cloud servers.',
      'Conduct vehicle field testing and sensor data calibration.'
    ],
    requirements: [
      'B.E. in Electronics & Telecommunication / Computer Engineering.',
      '3+ years experience in embedded IoT and telematics development.'
    ],
    skills: ['Embedded C++', 'IoT Sensors', 'MQTT Protocol', 'OBD-II', 'Telematics', 'GPS Modules'],
    perks: ['Work-from-Home Flexibility', 'Medical Insurance ₹5L', 'Annual Bonus']
  },
  {
    company: 'Cognizant India',
    companyLogo: 'https://unavatar.io/cognizant.com',
    companyColor: '#0284c7',
    title: 'QA Automation Engineer (Selenium & Appium)',
    industry: 'Software Testing & QA',
    location: 'Eon IT Park, Kharadi, Pune',
    trade: 'Software Testing',
    midcZone: 'Kharadi IT Zone',
    shiftDetails: 'General Shift',
    overtime: false,
    accommodation: false,
    busFacility: true,
    canteen: true,
    joiningBonus: true,
    attendanceBonus: false,
    contractDuration: 'Permanent',
    jobType: 'Full-time',
    workMode: 'Hybrid',
    minExperience: 3,
    maxExperience: 6,
    salaryMin: 700000,
    salaryMax: 1100000,
    openings: 18,
    filledOpenings: 4,
    status: 'APPROVED',
    description: 'Cognizant Digital Quality Engineering hiring QA Automation Engineers for automated web and mobile testing using Selenium, Appium, and TestNG.',
    responsibilities: [
      'Build automated test suites for React Web and React Native mobile apps.',
      'Integrate test automation scripts into GitHub Actions CI/CD pipelines.',
      'Perform API automation testing using Postman and RestAssured.'
    ],
    requirements: [
      'B.Tech / BCA / MCA in CS / IT.',
      '3+ years experience in Selenium & Appium test automation.'
    ],
    skills: ['Selenium', 'Appium', 'Java', 'TestNG', 'API Automation', 'CI/CD'],
    perks: ['Hybrid Work Model', 'Corporate Health Cover', 'Upskilling Allowances']
  },
  {
    company: 'Microsoft India',
    companyLogo: 'https://unavatar.io/microsoft.com',
    companyColor: '#00a4ef',
    title: 'Azure Cloud & Data Platform Engineer',
    industry: 'Cloud Computing & AI',
    location: 'SB Road, Pune',
    trade: 'Cloud Engineering',
    midcZone: 'Pune Central Tech Zone',
    shiftDetails: 'Flexible Shift',
    overtime: false,
    accommodation: false,
    busFacility: true,
    canteen: true,
    joiningBonus: true,
    attendanceBonus: false,
    contractDuration: 'Permanent',
    jobType: 'Full-time',
    workMode: 'Hybrid',
    minExperience: 4,
    maxExperience: 9,
    salaryMin: 1800000,
    salaryMax: 2800000,
    openings: 10,
    filledOpenings: 2,
    status: 'APPROVED',
    description: 'Microsoft India Cloud team seeking Azure Engineers to architect enterprise Azure Synapse analytics, Cosmos DB, and AI infrastructure solutions.',
    responsibilities: [
      'Design high-availability cloud infrastructure on Microsoft Azure.',
      'Implement Azure Data Factory pipelines and Cosmos DB databases.',
      'Provide technical guidance on Azure security and governance.'
    ],
    requirements: [
      'B.E. / B.Tech in CS / IT / EE.',
      '4+ years hands-on Azure cloud engineering experience.'
    ],
    skills: ['Microsoft Azure', 'Azure Data Factory', 'Cosmos DB', 'C# / .NET', 'Cloud Security'],
    perks: ['Microsoft Stock Awards', 'Flexible Remote Options', 'Wellness Allowance']
  }
];

export async function seed20RealCompanyJobs() {
  try {
    console.log('🚀 Starting Seeding of 20 Fresh Jobs with REAL Company Logos...');

    // First update any existing jobs with broken clearbit/null company_logo to real working domain logos
    await pool.query(`
      UPDATE jobs 
      SET company_logo = 'https://unavatar.io/tata.com' 
      WHERE company ILIKE '%tata%' OR company_logo LIKE '%clearbit%' OR company_logo IS NULL OR company_logo = '';
    `);
    
    await pool.query(`
      UPDATE jobs 
      SET company_logo = 'https://unavatar.io/bajajauto.com' 
      WHERE company ILIKE '%bajaj%';
    `);

    await pool.query(`
      UPDATE jobs 
      SET company_logo = 'https://unavatar.io/endurancegroup.com' 
      WHERE company ILIKE '%endurance%';
    `);

    await pool.query(`
      UPDATE jobs 
      SET company_logo = 'https://unavatar.io/varroc.com' 
      WHERE company ILIKE '%varroc%';
    `);

    await pool.query(`
      UPDATE jobs 
      SET company_logo = 'https://unavatar.io/siemens.com' 
      WHERE company ILIKE '%siemens%';
    `);

    await pool.query(`
      UPDATE jobs 
      SET company_logo = 'https://unavatar.io/bosch.com' 
      WHERE company ILIKE '%bosch%';
    `);

    // Get an existing employer user ID to associate the jobs with
    const empRes = await pool.query(`SELECT id FROM users WHERE role = 'employer' LIMIT 1;`);
    const employerId = empRes.rows[0]?.id || 'a0000000-0000-0000-0000-000000000001';

    let insertedCount = 0;
    for (const job of REAL_COMPANY_JOBS) {
      const query = `
        INSERT INTO jobs (
          employer_id, company, company_logo, company_color, title, industry, location,
          trade, midc_zone, shift_details, overtime, accommodation, bus_facility, canteen,
          joining_bonus, attendance_bonus, contract_duration, job_type, work_mode,
          min_experience, max_experience, salary_min, salary_max, openings, filled_openings,
          status, description, responsibilities, requirements, skills, perks, posted_at
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19,
          $20, $21, $22, $23, $24, $25, $26, $27, $28, $29, $30, $31, NOW() - ($32 || ' minutes')::interval
        )
        RETURNING id;
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
        JSON.stringify(job.perks),
        (insertedCount * 5).toString()
      ];

      await pool.query(query, values);
      insertedCount++;
      console.log(`[${insertedCount}/20] ✅ Seeded Job with REAL Logo: "${job.title}" at ${job.company} (${job.companyLogo})`);
    }

    console.log('🎉 SUCCESSFULLY SEEDED 20 FRESH JOBS WITH 100% REAL WORKING COMPANY LOGOS!');
    process.exit(0);
  } catch (err) {
    console.error('❌ Error seeding 20 real company jobs:', err);
    process.exit(1);
  }
}

seed20RealCompanyJobs();
