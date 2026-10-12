export const INDUSTRY_LIST = [
  'Automotive & Auto Components',
  'Industrial Manufacturing',
  'Electronics & Electricals',
  'Pharmaceuticals & Chemicals',
  'Textiles & Garments',
  'Construction & Infrastructure',
  'Logistics & Warehousing',
  'Services & General Engineering',
  'Healthcare & Hospitals',
  'Hotel & Hospitality',
  'Information Technology (IT)',
  'Education & Institutions',
  'Retail & FMCG',
  'Welding & Metal Fabrication',
  'Assembly & Production',
  'Quality Control & Inspection',
  'Banking & Financial Services',
  'Food Processing & Agriculture',
  'Security & Facility Management',
  'Other / Custom Sector',
];

export const EDUCATION_REQUIREMENT_OPTIONS = [
  '10th Pass',
  '12th Pass',
  'ITI',
  'Diploma',
  'Graduate',
  "Post Graduate / Master's",
  'Doctorate / PhD',
  'Others',
];

export const ITI_TRADES_LIST = [
  'Fitter',
  'Turner',
  'Machinist',
  'Electrician',
  'Welder (MIG/TIG/ARC)',
  'VMC/CNC Operator',
  'Quality Inspector',
  'Tool & Die Maker',
  'Other ITI Trade...',
];

export const MIDC_LIST = [
  'Waluj MIDC (Chhatrapati Sambhajinagar)',
  'Chakan MIDC (Pune)',
  'Bhosari MIDC (Pune)',
  'Taloja MIDC (Navi Mumbai)',
  'Ranjangaon MIDC (Pune)',
  'Butibori MIDC (Nagpur)',
  'Other MIDC Zone...',
];

export const INDUSTRY_ROLE_MAPPINGS: Record<string, string[]> = {
  // Backend standard categories & Machining
  'CNC & VMC Operator': [
    'CNC Machine Operator',
    'VMC Machine Operator',
    'CNC & VMC Programmer',
    'VMC Setup Operator & Setter',
    'Lathe Machine Operator',
    'Tool & Die Maker / Setter',
    'Precision Machinist',
    'CMM Machine Quality Inspector',
  ],
  'Welder & Fitter': [
    'MIG / MAG Welder',
    'TIG Welder (GTAW)',
    'Arc Welder (SMAW)',
    'Structural Steel Fabricator',
    'Mechanical Fitter / Assembler',
    'Bench Fitter & Tool Maker',
    'Pipe Welder (6G Radiography)',
    'Gas Cutter & Plasma Operator',
  ],
  'Quality & Testing': [
    'Quality Control (QC) Inspector',
    'Quality Assurance (QA) Assistant',
    'CMM Machine Operator',
    'Incoming Material Inspector',
    'Line Quality Inspector',
    'Calibration Technician',
    'NDT Technician (DPT/UT/MPT)',
    'First Piece Approval Inspector',
  ],
  'Electrical & Automation': [
    'Industrial Electrician',
    'Control Panel Wireman',
    'PLC Automation Technician',
    'Electrical Maintenance Technician',
    'Transformer & Motor Winder',
    'HT / LT Switchgear Technician',
    'Electronics Tester / Soldering Tech',
    'Solar PV Panel Installer',
  ],
  'Assembly & Production': [
    'Production Line Assembly Worker',
    'Machine Helper / Shop Floor Worker',
    'Auto Assembly Technician',
    'Packaging Line Worker',
    'Conveyor Line Operator',
    'Plastic Injection Molding Operator',
    'Shop Floor Production Supervisor',
    'Material Handler / Loader',
  ],
  'Healthcare & Nursing': [
    'Staff Nurse (GNM / B.Sc Nursing)',
    'Ward Boy / Nursing Assistant',
    'ICU Care Nurse',
    'Patient Care Attendant',
    'Operation Theatre (OT) Technician',
    'Hospital Housekeeping Staff',
    'Hospital Receptionist / Billing Executive',
    'Home Healthcare Nurse',
  ],
  'Doctors & Medical Officers': [
    'Resident Medical Officer (RMO)',
    'General Duty Doctor / Physician',
    'Emergency Medical Officer (EMO)',
    'Ayush Doctor (BAMS / BHMS)',
    'Junior Resident Doctor',
    'Specialist Consultant Physician',
    'Clinical Research Assistant',
  ],
  'Pharmacy & Pathology': [
    'Pharmacist (D.Pharm / B.Pharm)',
    'Pharmacy Assistant & Dispenser',
    'Pathology Lab Technician (DMLT/BMLT)',
    'Phlebotomist / Blood Collection Tech',
    'QC Analytical Chemist',
    'Pathology Lab Assistant',
    'Microbiology Technician',
  ],
  'Software & IT Services': [
    'Software Engineer / Developer',
    'Frontend Developer (React / Web)',
    'Backend Developer (Node.js / Java)',
    'Full Stack Developer',
    'QA & Software Tester',
    'IT Support & Desktop Technician',
    'Network & System Administrator',
    'Database Administrator (SQL / Mongo)',
    'UI/UX Graphic Designer',
  ],
  'Store & Warehouse': [
    'Store Keeper / Store Executive',
    'Warehouse Assistant & Loader',
    'Forklift Operator (Reach Truck)',
    'Inventory Control Executive',
    'Order Picker & Packer',
    'Dispatch & Billing Assistant',
    'Material Stacking Worker',
  ],
  'Retail & Sales': [
    'Retail Sales Associate / Counter Sales',
    'Store Manager / Assistant Manager',
    'Billing Cashier / POS Operator',
    'Visual Merchandiser',
    'FMCG Field Sales Representative',
    'Supermarket Stocker & Merchandiser',
    'Customer Care Executive',
    'Inventory Stock Clerk',
  ],
  'Banking & Finance': [
    'Accountant (Tally / GST / ERP)',
    'Banking Operations Executive',
    'Loan Processing Executive',
    'Cashier / Teller',
    'Accounts Assistant / Data Entry',
    'Internal Audit Assistant',
    'Credit & Collection Officer',
  ],
  'Education & Faculty': [
    'Primary / High School Teacher',
    'College Lecturer / Assistant Professor',
    'Admin Executive / School Clerk',
    'Data Entry Operator (DEO)',
    'Computer Lab Assistant',
    'Student Counselor / Admissions Officer',
    'Librarian / Assistant Librarian',
    'Sports Coach / Physical Instructor',
  ],
  'Logistics & Driver': [
    'Commercial Heavy Vehicle Driver (HCV)',
    'Light Commercial Vehicle Driver (LCV)',
    'Forklift Operator (Counterbalance / Reach)',
    'Delivery Executive / Van Driver',
    'Warehouse & Dispatch Assistant',
    'Fleet / Transport Supervisor',
    'Logistics Operations Executive',
  ],
  'Hotel & Hospitality': [
    'Chef / Commis Cook (Indian/Chinese/Continental)',
    'Steward / F&B Waiter',
    'Housekeeping Supervisor / Room Attendant',
    'Front Desk / Reception Executive',
    'Kitchen Helper / Kitchen Steward',
    'Baker & Pastry Chef',
    'Barista / Bartender',
    'Facility Maintenance Technician',
  ],
  'HR & Administration': [
    'HR Executive / Recruiter',
    'Admin Executive & Facility Coordinator',
    'Payroll & Compliance Executive',
    'Office Assistant / Peon / Boy',
    'Front Office Receptionist',
    'Data Entry Operator (DEO)',
    'Time Office Assistant',
  ],

  // Industry sectors & manufacturing domains
  'Automotive & Auto Components': [
    'Assembly Line Operator',
    'VMC & CNC Programmer/Operator',
    'Quality Inspector (QA/QC)',
    'Press Shop Machine Operator',
    'Paint Shop Technician',
    'Automotive Electrician & Wireman',
    'Chassis & Engine Fitter',
    'Two-Wheeler / Four-Wheeler Mechanic',
    'Tool & Die Maintenance Fitter',
  ],
  'Automotive & Auto Ancillary': [
    'Automotive Assembly Line Worker',
    'Auto Paint Shop Operator',
    'Press Shop Stamping Operator',
    'Chassis & Engine Fitter',
    'Vehicle Inspector / PDI Tester',
    'Auto Electrical Technician',
    'Wheel Alignment & Balancer',
    'Tool & Die Maintenance Fitter',
  ],
  'Industrial Manufacturing': [
    'CNC & VMC Machine Operator',
    'Heavy Equipment Fitter & Turner',
    'MIG / TIG Welder & Fabricator',
    'Hydraulics & Pneumatics Engineer',
    'Production Supervisor',
    'Maintenance Technician',
    'Sheet Metal Operator',
    'Foundry & Forging Operator',
  ],
  'Manufacturing & Heavy Engineering': [
    'CNC Machine Operator',
    'VMC Machine Operator',
    'Lathe Machine Operator',
    'Tool & Die Maker',
    'Machinist',
    'Fitter / Mechanical Fitter',
    'Maintenance Fitter',
    'Mechanical Inspector',
    'Sheet Metal Operator',
    'Hydraulics & Pneumatics Technician',
  ],
  'Electronics & Electricals': [
    'PCB Assembly Technician',
    'Control Panel Wireman',
    'Testing & Calibration Inspector',
    'SMT Machine Operator',
    'Electrical Maintenance Technician',
    'Transformer Winding Operator',
    'Solar PV Panel Installer',
  ],
  'Electrical & Electronics': [
    'Industrial Electrician',
    'Wireman',
    'Control Panel Assembler',
    'PLC Automation Technician',
    'Maintenance Electrician',
    'Transformer Technician',
    'Electronics Tester / Soldering Tech',
    'Solar PV Panel Installer',
  ],
  'Pharmaceuticals & Chemicals': [
    'Plant Operator (Reactors/Distillation)',
    'Pharma Packaging Machine Operator',
    'Quality Control Analyst (QC)',
    'Utility & Boiler Attendant',
    'HVAC & Cleanroom Technician',
    'Chemical Lab Assistant',
    'ETP Operator',
  ],
  'Textiles & Garments': [
    'Industrial Sewing Operator',
    'Weaving & Spinning Technician',
    'Textile Dyeing Operator',
    'Garment Quality Checker',
    'Pattern Maker & Cutter',
    'Tailor & Master',
    'Finishing & Packing Operator',
  ],
  'Construction & Infrastructure': [
    'Civil Site Supervisor / Engineer',
    'Structural Steel Welder',
    'Bar Bender & Steel Fixer',
    'Heavy Crane & Excavator Operator',
    'Construction Electrician',
    'Plumber & Sanitary Technician',
    'Scaffolding Inspector & Erector',
    'Mason & Shuttering Carpenter',
  ],
  'Construction & Real Estate': [
    'Civil Site Engineer',
    'Site Supervisor / Mukadam',
    'Construction Electrician',
    'Plumber & Sanitary Technician',
    'CAD Draughtsman',
    'Safety Officer (HSE)',
    'Mason / Concrete Worker',
    'Scaffolding Erector & Inspector',
  ],
  'Logistics & Warehousing': [
    'Forklift Operator (Reach Truck)',
    'Warehouse Picker & Packer',
    'Inventory Control Executive',
    'Loading & Unloading Helper',
    'Dispatch & Store Assistant',
    'Store Keeper / Executive',
    'Fleet / Transport Supervisor',
  ],
  'Services & General Engineering': [
    'General Fitter & Machinist',
    'Lathe Machine Operator',
    'Facility Maintenance Mechanic',
    'AC & Refrigeration Technician',
    'Industrial Welder & Fabricator',
    'Electrical Wireman',
    'General Helper / Trainee',
  ],
  'Healthcare & Hospitals': [
    'Staff Nurse (GNM / B.Sc Nursing)',
    'Ward Boy / Nursing Assistant',
    'Lab Assistant / Pathology Technician',
    'Pharmacist / Pharmacy Assistant',
    'Hospital Receptionist / Billing Executive',
    'Operation Theatre (OT) Technician',
    'Patient Care Attendant',
  ],
  'Information Technology (IT)': [
    'Software Engineer / Developer',
    'Frontend Developer (React / Web)',
    'Backend Developer (Node.js / Java)',
    'Full Stack Developer',
    'QA & Software Tester',
    'IT Support & Desktop Technician',
    'Network & System Administrator',
    'UI/UX Graphic Designer',
  ],
  'Education & Institutions': [
    'Primary / High School Teacher',
    'College Lecturer / Assistant Professor',
    'Admin Executive / Office Clerk',
    'Data Entry Operator (DEO)',
    'Computer Lab Assistant',
    'Student Counselor / Admissions Officer',
    'Librarian / Assistant Librarian',
  ],
  'Retail & FMCG': [
    'Store Manager / Assistant Manager',
    'Retail Sales Associate',
    'Billing Cashier / POS Operator',
    'Visual Merchandiser',
    'FMCG Sales Representative',
    'Supermarket Stocker / Merchandiser',
    'Customer Service Associate',
  ],
  'Welding & Metal Fabrication': [
    'TIG Welder (GTAW)',
    'MIG Welder (GMAW)',
    'Arc Welder (SMAW)',
    'Structural Fabricator',
    'Pipe Welder (6G Radiography)',
    'Gas Cutter / Plasma Cutter Operator',
    'Fit-Up Inspector',
  ],
  'Quality Control & Inspection': [
    'Quality Control (QC) Inspector',
    'Quality Assurance (QA) Assistant',
    'CMM Machine Operator',
    'Incoming Material Inspector',
    'Line Quality Inspector',
    'Calibration Technician',
    'NDT Technician',
  ],
  'Banking & Financial Services': [
    'Accountant (Tally / GST)',
    'Banking Operations Executive',
    'Loan Processing Executive',
    'Cashier / Teller',
    'Accounts Assistant',
    'Internal Audit Assistant',
  ],
  'Food Processing & Agriculture': [
    'Food Processing Machine Operator',
    'Quality & Hygiene Inspector',
    'Packaging & Sealing Operator',
    'Cold Storage Attendant',
    'Dairy Plant Technician',
    'Grain Mill / Flour Operator',
    'Sorting & Grading Helper',
  ],
  'Security & Facility Management': [
    'Security Guard / Gunman',
    'Security Supervisor',
    'CCTV Control Room Operator',
    'Housekeeping Supervisor / Staff',
    'Facility Maintenance Electrician',
    'Office Peon / Pantry Boy',
    'Fire & Safety Marshal',
  ],
  'Other / Custom Sector': [
    'General Operations Supervisor',
    'Specialist Technician',
    'Associate Team Member',
    'Field Executive',
    'Utility Maintenance Staff',
    'Office Assistant / Helper',
  ],
};

export const getRolesForIndustry = (industryName: string): string[] => {
  if (!industryName) return [];
  const raw = industryName.trim();

  // 1. Exact match in mappings
  if (INDUSTRY_ROLE_MAPPINGS[raw]) {
    return INDUSTRY_ROLE_MAPPINGS[raw];
  }

  // 2. Case-insensitive exact match
  const lower = raw.toLowerCase();
  for (const [key, roles] of Object.entries(INDUSTRY_ROLE_MAPPINGS)) {
    if (key.toLowerCase() === lower) {
      return roles;
    }
  }

  // 3. Intelligent keyword & domain mapping
  if (lower.includes('cnc') || lower.includes('vmc') || lower.includes('machin')) {
    return INDUSTRY_ROLE_MAPPINGS['CNC & VMC Operator'];
  }
  if (lower.includes('weld') || lower.includes('fabricat')) {
    return INDUSTRY_ROLE_MAPPINGS['Welder & Fitter'];
  }
  if (lower.includes('qual') || lower.includes('inspect') || lower.includes('testing') || lower.includes('qc') || lower.includes('qa')) {
    return INDUSTRY_ROLE_MAPPINGS['Quality & Testing'];
  }
  if (lower.includes('electr') || lower.includes('wire') || lower.includes('solar') || lower.includes('panel')) {
    return INDUSTRY_ROLE_MAPPINGS['Electrical & Automation'];
  }
  if (lower.includes('assembl') || lower.includes('product') || lower.includes('mold') || lower.includes('mould')) {
    return INDUSTRY_ROLE_MAPPINGS['Assembly & Production'];
  }
  if (lower.includes('auto') || lower.includes('vehic') || lower.includes('motor')) {
    return INDUSTRY_ROLE_MAPPINGS['Automotive & Auto Components'];
  }
  if (lower.includes('doctor') || lower.includes('physician') || lower.includes('medical officer')) {
    return INDUSTRY_ROLE_MAPPINGS['Doctors & Medical Officers'];
  }
  if (lower.includes('nurse') || lower.includes('nursing') || lower.includes('health') || lower.includes('hospital') || lower.includes('clinic')) {
    return INDUSTRY_ROLE_MAPPINGS['Healthcare & Nursing'];
  }
  if (lower.includes('patholog')) {
    return INDUSTRY_ROLE_MAPPINGS['Pharmacy & Pathology'];
  }
  if (lower.includes('pharma') || lower.includes('chemist') || lower.includes('drug') || lower.includes('chemical')) {
    return INDUSTRY_ROLE_MAPPINGS['Pharmaceuticals & Chemicals'];
  }
  if (lower.includes('software') || lower.includes('comput') || lower.includes('develop') || lower.includes('tech') || lower.includes('code') || lower === 'it' || lower.includes('information technology')) {
    return INDUSTRY_ROLE_MAPPINGS['Software & IT Services'];
  }
  if (lower.includes('warehous') || lower.includes('store') || lower.includes('inventory') || lower.includes('stock')) {
    return INDUSTRY_ROLE_MAPPINGS['Store & Warehouse'];
  }
  if (lower.includes('driver') || lower.includes('logist') || lower.includes('transport') || lower.includes('fleet')) {
    return INDUSTRY_ROLE_MAPPINGS['Logistics & Driver'];
  }
  if (lower.includes('retail') || lower.includes('sales') || lower.includes('fmcg') || lower.includes('cashier')) {
    return INDUSTRY_ROLE_MAPPINGS['Retail & Sales'];
  }
  if (lower.includes('bank') || lower.includes('financ') || lower.includes('account') || lower.includes('audit') || lower.includes('tax')) {
    return INDUSTRY_ROLE_MAPPINGS['Banking & Finance'];
  }
  if (lower.includes('educat') || lower.includes('facult') || lower.includes('school') || lower.includes('colleg') || lower.includes('teach') || lower.includes('lectur')) {
    return INDUSTRY_ROLE_MAPPINGS['Education & Faculty'];
  }
  if (lower.includes('hotel') || lower.includes('hospitality') || lower.includes('restaur') || lower.includes('chef') || lower.includes('cook') || lower.includes('steward') || lower.includes('cater')) {
    return INDUSTRY_ROLE_MAPPINGS['Hotel & Hospitality'];
  }
  if (lower.includes('hr') || lower.includes('human resource') || lower.includes('admin') || lower.includes('office') || lower.includes('recruit')) {
    return INDUSTRY_ROLE_MAPPINGS['HR & Administration'];
  }
  if (lower.includes('textil') || lower.includes('garment') || lower.includes('cloth') || lower.includes('sew') || lower.includes('apparel')) {
    return INDUSTRY_ROLE_MAPPINGS['Textiles & Garments'];
  }
  if (lower.includes('construct') || lower.includes('civil') || lower.includes('build') || lower.includes('infrastruct') || lower.includes('real estate')) {
    return INDUSTRY_ROLE_MAPPINGS['Construction & Infrastructure'];
  }
  if (lower.includes('food') || lower.includes('agri') || lower.includes('dairy')) {
    return INDUSTRY_ROLE_MAPPINGS['Food Processing & Agriculture'];
  }
  if (lower.includes('secur') || lower.includes('guard') || lower.includes('facility')) {
    return INDUSTRY_ROLE_MAPPINGS['Security & Facility Management'];
  }
  if (lower.includes('manufactur') || lower.includes('heavy') || lower.includes('engineer') || lower.includes('industr')) {
    return INDUSTRY_ROLE_MAPPINGS['Industrial Manufacturing'];
  }

  // 4. Partial substring in any existing key
  const matchedKey = Object.keys(INDUSTRY_ROLE_MAPPINGS).find((k) =>
    k.toLowerCase().includes(lower) || lower.includes(k.toLowerCase())
  );
  if (matchedKey) {
    return INDUSTRY_ROLE_MAPPINGS[matchedKey];
  }

  // 5. Fallback roles for completely unknown sector
  return [
    'Operations Supervisor',
    'Specialist / Executive',
    'Technician',
    'Associate Team Member',
    'General Helper / Trainee',
  ];
};

export const getSkillsForRole = (roleName: string, industryName?: string): string[] => {
  const normRole = (roleName || '').toLowerCase();
  const normInd = (industryName || '').toLowerCase();

  // CNC & Machining
  if (normRole.includes('cnc') || normRole.includes('vmc') || normRole.includes('machin') || normRole.includes('lathe')) {
    return ['CNC Operating', 'VMC Programming', 'Fanuc Control', 'Micrometer & Vernier', 'Blueprint Reading', 'Job Setting'];
  }

  // Welding & Fabrication
  if (normRole.includes('weld') || normRole.includes('fabricat')) {
    return ['MIG Welding', 'TIG Welding', 'Arc Welding', 'Structural Fabrication', 'Blueprint Reading', 'Grinding & Finishing'];
  }

  // Electrical & Automation
  if (normRole.includes('electric') || normRole.includes('wire') || normRole.includes('plc') || normRole.includes('panel')) {
    return ['Control Panel Wiring', '3-Phase Wiring', 'Electrical Maintenance', 'PLC Troubleshooting', 'Multimeter Testing', 'Electrical Safety LOTO'];
  }

  // Quality & Inspection
  if (normRole.includes('qual') || normRole.includes('inspect') || normRole.includes('cmm') || normRole.includes('calibration') || normRole.includes('ndt')) {
    return ['Quality Inspection (QA/QC)', 'Vernier Caliper', 'CMM Operating', 'ISO Standard Compliance', 'First Piece Approval', 'Reject Tagging'];
  }

  // Healthcare, Nursing & Medical
  if (normRole.includes('nurse') || normRole.includes('patient') || normRole.includes('ward') || normRole.includes('icu')) {
    return ['Patient Care', 'IV Injection & Drip', 'Vital Signs Monitoring', 'ICU Care', 'Doctor Assistance', 'Hospital Hygiene'];
  }
  if (normRole.includes('doctor') || normRole.includes('rmo') || normRole.includes('physician') || normRole.includes('medical')) {
    return ['Clinical Diagnosis', 'Patient Care & Treatment', 'Emergency Response', 'Medical Records', 'Prescription Writing'];
  }

  // Pharmacy & Pathology
  if (normRole.includes('pharmac') || normRole.includes('chemist') || normRole.includes('lab') || normRole.includes('patholog')) {
    return ['Medicine Dispensing', 'Lab Testing (DMLT)', 'Phlebotomy', 'HPLC / Titration', 'Chemical Safety', 'Stock Management'];
  }

  // Software & IT
  if (normRole.includes('software') || normRole.includes('developer') || normRole.includes('frontend') || normRole.includes('backend') || normRole.includes('engineer') && normInd.includes('it')) {
    return ['Programming', 'REST APIs', 'Git & GitHub', 'Database Design', 'Problem Solving', 'Debugging'];
  }
  if (normRole.includes('desktop') || normRole.includes('network') || normRole.includes('support') || normRole.includes('admin') && normInd.includes('it')) {
    return ['Hardware Troubleshooting', 'Windows/Linux OS', 'LAN/Wi-Fi Setup', 'Helpdesk Ticketing', 'Remote Support'];
  }

  // Warehouse & Logistics
  if (normRole.includes('forklift')) {
    return ['Counterbalance Forklift', 'Reach Truck Operation', 'Pallet Handling', 'Safety Driving', 'High-Rack Stacking'];
  }
  if (normRole.includes('store') || normRole.includes('warehouse') || normRole.includes('inventory') || normRole.includes('picker')) {
    return ['ERP / Stock Management', 'GRN & Invoicing', 'Barcode Scanner (HHT)', 'FIFO / LIFO', 'Material Stacking'];
  }
  if (normRole.includes('driver')) {
    return ['Commercial Driving License', 'GPS Route Navigation', 'Vehicle Maintenance', 'Safety Driving', 'Logbook Entry'];
  }

  // Retail & Sales
  if (normRole.includes('sales') || normRole.includes('retail') || normRole.includes('cashier') || normRole.includes('merchandiser')) {
    return ['Customer Service', 'POS Billing Software', 'Product Knowledge', 'Cash Handling', 'Stock Merchandising', 'Communication'];
  }

  // Banking & Accounting
  if (normRole.includes('account') || normRole.includes('tally') || normRole.includes('gst') || normRole.includes('bank') || normRole.includes('audit')) {
    return ['Tally Prime / ERP9', 'GST & TDS Filing', 'Bank Reconciliation', 'Ledger Accounting', 'MS Excel Formulas'];
  }

  // Education
  if (normRole.includes('teacher') || normRole.includes('lecturer') || normRole.includes('professor') || normRole.includes('counselor')) {
    return ['Classroom Management', 'Subject Expertise', 'Lesson Planning', 'Student Evaluation', 'Communication'];
  }

  // Hotel & Food
  if (normRole.includes('chef') || normRole.includes('cook') || normRole.includes('baker') || normRole.includes('kitchen')) {
    return ['Commercial Cooking', 'Kitchen Hygiene (HACCP)', 'Food Preparation', 'Menu Execution', 'Inventory Handling'];
  }
  if (normRole.includes('steward') || normRole.includes('waiter') || normRole.includes('housekeeping') || normRole.includes('front desk')) {
    return ['Customer Hospitality', 'Table Service', 'Room Cleaning Standards', 'Order Taking (POS)', 'Communication'];
  }

  // HR & Administration
  if (normRole.includes('hr') || normRole.includes('recruiter') || normRole.includes('payroll') || normRole.includes('admin') || normRole.includes('office')) {
    return ['Recruitment & Sourcing', 'Payroll Processing', 'Employee Records', 'Office Administration', 'Communication'];
  }

  // Textiles
  if (normRole.includes('sew') || normRole.includes('tailor') || normRole.includes('weaving') || normRole.includes('garment') || normRole.includes('textile')) {
    return ['Industrial Sewing Machine', 'Pattern Cutting', 'Fabric Inspection', 'Garment Finishing', 'Stitching Accuracy'];
  }

  // Construction
  if (normRole.includes('civil') || normRole.includes('mason') || normRole.includes('plumber') || normRole.includes('scaffolding') || normRole.includes('bar bender')) {
    return ['Site Execution', 'Blueprint Reading', 'Structural Fitting', 'Safety Protocols (PPE)', 'Measurement Accuracy'];
  }

  // General Shop Floor & Manufacturing
  if (normRole.includes('fit') || normRole.includes('assembl') || normRole.includes('operator')) {
    return ['Bench Fitting', 'Assembly Line Operations', 'Pneumatic Tools', 'Machine Maintenance', '5S Principles'];
  }

  return ['Quality Focus', 'Safety Protocols', 'Punctuality', 'Teamwork', 'Problem Solving', 'Task Execution'];
};
