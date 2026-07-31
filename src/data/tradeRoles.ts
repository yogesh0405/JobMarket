export interface TradeRoleMapping {
  trade: string;
  roles: string[];
  skills: Record<string, string[]>;
}

export const TRADE_ROLE_MAPPINGS: Record<string, TradeRoleMapping> = {
  'Mechanical & Machining': {
    trade: 'Mechanical & Machining',
    roles: [
      'CNC Machine Operator',
      'VMC Operator',
      'Lathe Machine Operator',
      'Tool & Die Maker',
      'Machinist',
      'Fitter / Mechanical Fitter',
      'Maintenance Fitter',
      'Mechanical Inspector',
      'Sheet Metal Worker'
    ],
    skills: {
      'CNC Machine Operator': ['CNC Operation', 'G-Code & M-Code', 'Micrometer Reading', 'Vernier Caliper', 'Engineering Drawing', 'Offset Setting'],
      'VMC Operator': ['VMC Programming', 'CMM Inspection', 'Job Setting', 'Tooling Setup', 'Surface Finish Check', 'Blueprint Reading'],
      'Lathe Machine Operator': ['Manual Lathe', 'Turning & Facing', 'Threading', 'Precision Machining', 'Measurement Tools'],
      'Tool & Die Maker': ['Die Maintenance', 'Jigs & Fixtures', 'Stamping Dies', 'Grinding Machine', 'Precision Fitting', 'AutoCAD'],
      'Machinist': ['Milling Machine', 'Drilling Machine', 'Surface Grinder', 'Workshop Tools', 'Tolerance Standards'],
      'Fitter / Mechanical Fitter': ['Assembly & Dismantling', 'Pneumatics & Hydraulics', 'Equipment Repair', 'Hand Tools', 'Safety Protocols'],
      'Maintenance Fitter': ['Preventive Maintenance', 'Breakdown Repair', 'Gearbox Overhaul', 'Pump Maintenance', 'Lubrication System'],
      'Mechanical Inspector': ['Quality Inspection', 'Dimension Checking', 'GD&T', 'Dial Gauge', 'First Article Inspection'],
      'Sheet Metal Worker': ['Bending Machine', 'Shearing Operator', 'Press Brake', 'Metal Fabrication', 'Sheet Measurement']
    }
  },
  'Electrical & Electronics': {
    trade: 'Electrical & Electronics',
    roles: [
      'Industrial Electrician',
      'Wireman',
      'Control Panel Assembler',
      'PLC Automation Technician',
      'Maintenance Electrician',
      'Transformer Technician',
      'Electronics Tester'
    ],
    skills: {
      'Industrial Electrician': ['3-Phase Wiring', 'Control Panel Wiring', 'Motor Starter (DOL/Star-Delta)', 'Multimeter Usage', 'Electrical Safety LOTO'],
      'Wireman': ['Cable Laying', 'Conduit Fitting', 'Single-Phase Wiring', 'DB Dressing', 'Circuit Breakers'],
      'Control Panel Assembler': ['Panel Board Wiring', 'Busbar Bending', 'Wire Harnessing', 'Schematic Diagram Reading', 'Ferrule Marking'],
      'PLC Automation Technician': ['PLC Troubleshooting', 'SCADA / HMI', 'VFD Configuration', 'Sensors & Actuators', 'Relay Logic'],
      'Maintenance Electrician': ['Electrical Maintenance', 'DG Set Operation', 'Substation Maintenance', 'LT/HT Switchgear', 'Earth Resistance Test'],
      'Transformer Technician': ['Transformer Oil Testing', 'Winding Test', 'Insulation Resistance', 'Tap Changer Overhaul'],
      'Electronics Tester': ['PCB Soldering', 'Oscilloscope Reading', 'Component Testing', 'Continuity Check', 'Quality Assurance']
    }
  },
  'Welding & Fabrication': {
    trade: 'Welding & Fabrication',
    roles: [
      'TIG Welder',
      'MIG Welder',
      'Arc Welder (SMAW)',
      'Structural Fabricator',
      'Pipe Welder (6G)',
      'Gas Cutter / Plasma Cutter'
    ],
    skills: {
      'TIG Welder': ['TIG Welding (GTAW)', 'Stainless Steel Welding', 'Aluminum Welding', 'Argon Gas Shielding', 'Weld Inspection'],
      'MIG Welder': ['MIG Welding (GMAW)', 'CO2 Welding', 'Flux Cored Wire', 'High-Speed Welding', 'Grinding & Finishing'],
      'Arc Welder (SMAW)': ['Manual Metal Arc Welding', 'Heavy Structure Welding', 'Electrode Selection', 'Slag Removal'],
      'Structural Fabricator': ['Structure Fabrication', 'Blue-Print Reading', 'Fitting & Tack Welding', 'Measuring Tape Accuracy', 'Beveling'],
      'Pipe Welder (6G)': ['6G Position Welding', 'Pressure Vessel Welding', 'Radiography Quality', 'Purging Techniques'],
      'Gas Cutter / Plasma Cutter': ['Oxy-Acetylene Cutting', 'Plasma Cutting Torch', 'Plate Marking', 'Edge Preparation']
    }
  },
  'Assembly & Production': {
    trade: 'Assembly & Production',
    roles: [
      'Production Line Assembly Worker',
      'Machine Helper / Operator',
      'Auto Assembly Technician',
      'Packaging Line Worker',
      'Sub-Assembly Operator'
    ],
    skills: {
      'Production Line Assembly Worker': ['Assembly Line Speed', 'Pneumatic Screwdriver', 'Torque Wrench', 'Standard Operating Procedure (SOP)', '5S Principles'],
      'Machine Helper / Operator': ['Material Loading/Unloading', 'Basic Machine Operation', 'Shop Floor Safety', 'Housekeeping', 'Material Movement'],
      'Auto Assembly Technician': ['Automotive Parts Fitting', 'Torque Tightening', 'Engine Assembly Line', 'Chassis Mounting', 'Quality Checking'],
      'Packaging Line Worker': ['Box Packing', 'Labeling & Barcoding', 'Strapping Machine', 'Palletizing', 'Quantity Verification'],
      'Sub-Assembly Operator': ['Component Mounting', 'Bench Assembly', 'Adhesive Application', 'Visual Inspection']
    }
  },
  'Quality & Inspection': {
    trade: 'Quality & Inspection',
    roles: [
      'Quality Control (QC) Inspector',
      'Quality Assurance (QA) Assistant',
      'CMM Machine Operator',
      'Incoming Material Inspector',
      'Line Quality Inspector'
    ],
    skills: {
      'Quality Control (QC) Inspector': ['Vernier Caliper & Micrometer', 'Height Gauge', 'Bore Gauge', 'Reject Documentation', 'Sampling Plan AQL'],
      'Quality Assurance (QA) Assistant': ['ISO 9001 / IATF 16949', '8D Problem Solving', 'Process Audit', 'CAPA Implementation', 'Checksheet Maintenance'],
      'CMM Machine Operator': ['CMM Inspection', 'PC-DMIS Software', '3D Measurement', 'CAD Model Comparison', 'GD&T Analysis'],
      'Incoming Material Inspector': ['Raw Material Testing', 'Hardness Tester', 'Spectro Analysis Report', 'Vendor Defect Report'],
      'Line Quality Inspector': ['In-Process Inspection', 'Poka-Yoke Verification', 'First Piece Approval', 'Defect Tagging']
    }
  },
  'Logistics & Warehouse': {
    trade: 'Logistics & Warehouse',
    roles: [
      'Forklift Operator',
      'Store Keeper / Store Executive',
      'Warehouse Assistant / Loader',
      'Dispatch Executive',
      'Inventory Controller'
    ],
    skills: {
      'Forklift Operator': ['Counterbalance Forklift', 'Reach Truck Operation', 'Pallet Handling', 'Safety License / Driving', 'High-Rack Stacking'],
      'Store Keeper / Store Executive': ['ERP / SAP Materials Management', 'GRN Generation', 'Bin Management', 'Stock Audit', 'FIFO / LIFO'],
      'Warehouse Assistant / Loader': ['Heavy Lifting & Stacking', 'Loading / Unloading Trucks', 'Parcel Sorting', 'Physical Stock Count'],
      'Dispatch Executive': ['Invoice & E-Way Bill', 'Transport Coordination', 'Dispatch Documentation', 'Vehicle Loading Plan'],
      'Inventory Controller': ['Stock Reconciliation', 'Cycle Count', 'Kitting', 'Material Tracking', 'Safety Stock Level']
    }
  },
  'Hospitality & Facility': {
    trade: 'Hospitality & Facility',
    roles: [
      'Security Guard / Supervisor',
      'Housekeeping Staff / Janitor',
      'Office Boy / Peon',
      'Driver (Heavy & Light Vehicle)',
      'Cook / Canteen Chef',
      'Gardener / Groundskeeper'
    ],
    skills: {
      'Security Guard / Supervisor': ['Visitor Gate Register', 'Patrolling', 'Fire Extinguisher Operation', 'CCTV Monitoring', 'Canteen / Gate Frisking'],
      'Housekeeping Staff / Janitor': ['Industrial Cleaning Equipment', 'Chemical Dilution', 'Floor Scrubbing', 'Sanitization Protocols'],
      'Office Boy / Peon': ['Document Filing', 'Pantry Service', 'Bank & Courier Visits', 'Office Upkeep'],
      'Driver (Heavy & Light Vehicle)': ['Commercial Driving License', 'Vehicle Maintenance', 'Route Knowledge', 'Safety Driving Standards'],
      'Cook / Canteen Chef': ['Bulk Cooking (100+ Meals)', 'Kitchen Hygiene & Safety', 'Menu Planning', 'Food Storage'],
      'Gardener / Groundskeeper': ['Lawn Mowing', 'Plant Pruning', 'Watering & Fertilizing', 'Garden Tools Handling']
    }
  },
  'Healthcare & Nursing': {
    trade: 'Healthcare & Nursing',
    roles: [
      'Staff Nurse (GNM / B.Sc)',
      'Ward Boy / Nursing Assistant',
      'Lab Assistant / Technician',
      'Hospital Receptionist / Billing'
    ],
    skills: {
      'Staff Nurse (GNM / B.Sc)': ['Patient Care', 'IV Injection & Drip', 'Vital Signs Monitoring', 'ICU Care', 'Doctor Assistance'],
      'Ward Boy / Nursing Assistant': ['Patient Transfer', 'Bed Making', 'Basic Hygiene Care', 'Sample Delivery to Lab'],
      'Lab Assistant / Technician': ['Blood Sample Collection (Phlebotomy)', 'Centrifuge Machine', 'Slide Preparation', 'Basic Pathology'],
      'Hospital Receptionist / Billing': ['Patient Registration', 'Hospital HMS Software', 'Cash & Insurance Billing', 'Appointment Scheduling']
    }
  },
  'Education & Admin': {
    trade: 'Education & Admin',
    roles: [
      'Primary / High School Teacher',
      'Admin Executive / Clerk',
      'Data Entry Operator',
      'Accountant (Tally / GST)'
    ],
    skills: {
      'Primary / High School Teacher': ['Classroom Management', 'Subject Expertise', 'Lesson Planning', 'Student Evaluation', 'Parent Communication'],
      'Admin Executive / Clerk': ['MS Office (Excel/Word)', 'Email Communication', 'Attendance Register', 'Office Supplies Management'],
      'Data Entry Operator': ['Typing Speed (35+ WPM)', 'MS Excel Formulas', 'Data Accuracy', 'Document Scanning'],
      'Accountant (Tally / GST)': ['Tally Prime / ERP9', 'GST Filing', 'Bank Reconciliation', 'Petty Cash', 'Voucher Entry']
    }
  },
  'Other / Custom Trade': {
    trade: 'Other / Custom Trade',
    roles: [
      'General Technician',
      'Multiskilled Operator',
      'Apprentice / Trainee',
      'Supervisor / Team Leader',
      'Custom Role'
    ],
    skills: {
      'General Technician': ['Troubleshooting', 'Hand Tools', 'Safety Protocols', 'General Maintenance'],
      'Multiskilled Operator': ['Cross-Functional Operation', 'Fast Learning', 'Punctuality', 'Quality Focus'],
      'Apprentice / Trainee': ['Quick Learner', 'Industrial Discipline', 'Basic Workshop Training'],
      'Supervisor / Team Leader': ['Manpower Allocation', 'Shift Target Management', 'Safety Enforcement', 'Reporting'],
      'Custom Role': ['Communication', 'Problem Solving', 'Teamwork', 'Punctuality']
    }
  }
};

export const ITI_TRADES_LIST = [
  'Fitter',
  'Electrician',
  'Welder (GAS & Electric)',
  'Machinist',
  'Turner',
  'CNC Operator',
  'Wireman',
  'Motor Mechanic Vehicle (MMV)',
  'Tool & Die Maker',
  'Instrument Mechanic',
  'Refrigeration & AC Technician (RAC)',
  'COPA (Computer Operator)',
  'Draughtsman Mechanical',
  'Diesel Mechanic',
  'Painter General',
  'Plumber',
  'Other ITI Trade...'
];

export const getRolesForTrade = (tradeName: string): string[] => {
  if (!tradeName) return [];
  const match = TRADE_ROLE_MAPPINGS[tradeName];
  if (match) return match.roles;
  
  // Search loose key match
  const foundKey = Object.keys(TRADE_ROLE_MAPPINGS).find(k => k.toLowerCase().includes(tradeName.toLowerCase()));
  if (foundKey) return TRADE_ROLE_MAPPINGS[foundKey].roles;

  return ['General Operator', 'Technician', 'Supervisor', 'Other Role...'];
};

export const getSkillsForRole = (roleName: string, tradeName?: string): string[] => {
  if (!roleName) return [];

  // Search trade mapping first
  if (tradeName && TRADE_ROLE_MAPPINGS[tradeName]) {
    const roleSkills = TRADE_ROLE_MAPPINGS[tradeName].skills[roleName];
    if (roleSkills && roleSkills.length > 0) return roleSkills;
  }

  // Global search across all trades
  for (const tradeKey of Object.values(TRADE_ROLE_MAPPINGS)) {
    if (tradeKey.skills[roleName]) {
      return tradeKey.skills[roleName];
    }
  }

  // Fallback defaults if role is custom
  return ['Shop Floor Safety', 'Quality Inspection', 'Tool Handling', 'Punctuality', 'Teamwork'];
};
