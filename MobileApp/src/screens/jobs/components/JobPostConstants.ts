export const INDUSTRY_LIST = [
  'Automotive & Auto Components',
  'Industrial Manufacturing',
  'Electronics & Electricals',
  'Pharmaceuticals & Chemicals',
  'Textiles & Garments',
  'Construction & Infrastructure',
  'Logistics & Warehousing',
  'Services & General Engineering',
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

export const INDUSTRY_ROLE_MAPPINGS: Record<string, string[]> = {
  'Automotive & Auto Components': [
    'Assembly Line Operator',
    'VMC & CNC Programmer/Operator',
    'Quality Inspector (QA/QC)',
    'Press Shop Machine Operator',
    'Paint Shop Technician',
    'Automotive Electrician & Wireman',
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
  ],
  'Electronics & Electricals': [
    'PCB Assembly Technician',
    'Control Panel Wireman',
    'Testing & Calibration Inspector',
    'SMT Machine Operator',
    'Electrical Maintenance Technician',
    'Transformer Winding Operator',
  ],
  'Pharmaceuticals & Chemicals': [
    'Plant Operator (Reactors/Distillation)',
    'Pharma Packaging Machine Operator',
    'Quality Control Analyst (QC)',
    'Utility & Boiler Attendant',
    'HVAC & Cleanroom Technician',
    'Chemical Lab Assistant',
  ],
  'Textiles & Garments': [
    'Industrial Sewing Operator',
    'Weaving & Spinning Technician',
    'Textile Dyeing Operator',
    'Garment Quality Checker',
    'Pattern Maker & Cutter',
  ],
  'Construction & Infrastructure': [
    'Structural Steel Welder',
    'Bar Bender & Steel Fixer',
    'Heavy Crane & Excavator Operator',
    'Site Supervisor',
    'Scaffolding Inspector',
    'Mason & Shuttering Carpenter',
  ],
  'Logistics & Warehousing': [
    'Forklift Operator (Reach Truck)',
    'Warehouse Picker & Packer',
    'Inventory Control Executive',
    'Loading & Unloading Helper',
    'Dispatch & Store Assistant',
  ],
  'Services & General Engineering': [
    'General Fitter & Machinist',
    'Lathe Machine Operator',
    'Facility Maintenance Mechanic',
    'AC & Refrigeration Technician',
    'General Helper / Trainee',
  ],
};

export const getRolesForIndustry = (industryName: string): string[] => {
  return INDUSTRY_ROLE_MAPPINGS[industryName] || [
    'General Machine Operator',
    'Assembly Technician',
    'Quality Inspector',
    'Maintenance Fitter',
    'Shop Floor Trainee',
  ];
};

export const getSkillsForRole = (roleName: string, industryName: string): string[] => {
  const normRole = (roleName || '').toLowerCase();
  if (normRole.includes('cnc') || normRole.includes('vmc')) {
    return ['CNC Operating', 'VMC Programming', 'Fanuc Control', 'Mastercam', 'Micrometer / Vernier'];
  }
  if (normRole.includes('weld')) {
    return ['MIG Welding', 'TIG Welding', 'Arc Welding', 'Structural Fabrication', 'Blueprint Reading'];
  }
  if (normRole.includes('electric') || normRole.includes('wire')) {
    return ['Control Panel Wiring', 'Electrical Maintenance', 'PLC Troubleshooting', 'Multimeter Testing'];
  }
  if (normRole.includes('fit') || normRole.includes('machin')) {
    return ['Lathe Operation', 'Bench Fitting', 'Precision Measurement', 'Machine Maintenance'];
  }
  if (normRole.includes('qual') || normRole.includes('inspect')) {
    return ['Quality Inspection (QA/QC)', 'Vernier Caliper', 'CMM Operating', 'ISO Standard Compliance'];
  }
  return ['General Shopfloor Skill', 'Safety Compliance', 'Machine Operating', 'Process Quality'];
};
