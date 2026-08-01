export interface IndustryRoleMapping {
  industry: string;
  roles: string[];
  skills: Record<string, string[]>;
}

export const INDUSTRY_LIST = [
  'Manufacturing & Heavy Engineering',
  'Electrical & Electronics',
  'Welding & Metal Fabrication',
  'Assembly & Production',
  'Quality Control & Inspection',
  'Automotive & Auto Ancillary',
  'Logistics & Warehousing',
  'Healthcare & Hospitals',
  'Hotel & Hospitality',
  'Information Technology (IT)',
  'Education & Institutions',
  'Pharmaceuticals & Chemicals',
  'Construction & Real Estate',
  'Retail & FMCG',
  'Other / Custom Sector'
];

export const INDUSTRY_ROLE_MAPPINGS: Record<string, IndustryRoleMapping> = {
  'Manufacturing & Heavy Engineering': {
    industry: 'Manufacturing & Heavy Engineering',
    roles: [
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
      'Industrial Boiler Operator',
      'Foundry & Forging Operator'
    ],
    skills: {
      'CNC Machine Operator': ['CNC Operation', 'G-Code & M-Code', 'Micrometer Reading', 'Vernier Caliper', 'Engineering Drawing', 'Offset Setting'],
      'VMC Machine Operator': ['VMC Programming', 'CMM Inspection', 'Job Setting', 'Tooling Setup', 'Surface Finish Check', 'Blueprint Reading'],
      'Lathe Machine Operator': ['Manual Lathe', 'Turning & Facing', 'Threading', 'Precision Machining', 'Measurement Tools'],
      'Tool & Die Maker': ['Die Maintenance', 'Jigs & Fixtures', 'Stamping Dies', 'Grinding Machine', 'Precision Fitting', 'AutoCAD'],
      'Machinist': ['Milling Machine', 'Drilling Machine', 'Surface Grinder', 'Workshop Tools', 'Tolerance Standards'],
      'Fitter / Mechanical Fitter': ['Assembly & Dismantling', 'Pneumatics & Hydraulics', 'Equipment Repair', 'Hand Tools', 'Safety Protocols'],
      'Maintenance Fitter': ['Preventive Maintenance', 'Breakdown Repair', 'Gearbox Overhaul', 'Pump Maintenance', 'Lubrication System'],
      'Mechanical Inspector': ['Quality Inspection', 'Dimension Checking', 'GD&T', 'Dial Gauge', 'First Article Inspection'],
      'Sheet Metal Operator': ['Bending Machine', 'Shearing Operator', 'Press Brake', 'Metal Fabrication', 'Sheet Measurement'],
      'Hydraulics & Pneumatics Technician': ['Hydraulic Pump Overhaul', 'Pneumatic Valves', 'Cylinder Repair', 'Pressure Regulator', 'Oil Seal Replacement'],
      'Industrial Boiler Operator': ['Boiler Pressure Check', 'Steam Generation', 'Feed Water Treatment', 'Boiler Safety Valves', 'IBR Compliance'],
      'Foundry & Forging Operator': ['Induction Furnace', 'Molten Metal Pouring', 'Die Casting', 'Forging Hammer Operation', 'Heat Treatment']
    }
  },
  'Electrical & Electronics': {
    industry: 'Electrical & Electronics',
    roles: [
      'Industrial Electrician',
      'Wireman',
      'Control Panel Assembler',
      'PLC Automation Technician',
      'Maintenance Electrician',
      'Transformer Technician',
      'Electronics Tester / Soldering Tech',
      'HT / LT Switchgear Technician',
      'Armature Winder',
      'DG Set / Generator Technician',
      'Solar PV Panel Installer'
    ],
    skills: {
      'Industrial Electrician': ['3-Phase Wiring', 'Control Panel Wiring', 'Motor Starter (DOL/Star-Delta)', 'Multimeter Usage', 'Electrical Safety LOTO'],
      'Wireman': ['Cable Laying', 'Conduit Fitting', 'Single-Phase Wiring', 'DB Dressing', 'Circuit Breakers'],
      'Control Panel Assembler': ['Panel Board Wiring', 'Busbar Bending', 'Wire Harnessing', 'Schematic Diagram Reading', 'Ferrule Marking'],
      'PLC Automation Technician': ['PLC Troubleshooting', 'SCADA / HMI', 'VFD Configuration', 'Sensors & Actuators', 'Relay Logic'],
      'Maintenance Electrician': ['Electrical Maintenance', 'DG Set Operation', 'Substation Maintenance', 'LT/HT Switchgear', 'Earth Resistance Test'],
      'Transformer Technician': ['Transformer Oil Testing', 'Winding Test', 'Insulation Resistance', 'Tap Changer Overhaul'],
      'Electronics Tester / Soldering Tech': ['PCB Soldering', 'Oscilloscope Reading', 'Component Testing', 'Continuity Check', 'Quality Assurance'],
      'HT / LT Switchgear Technician': ['Air Circuit Breaker (ACB)', 'Vacuum Circuit Breaker (VCB)', 'Busbar Jointing', 'Relay Calibration'],
      'Armature Winder': ['Motor Rewinding', 'Coil Winding', 'Varnishing', 'Megger Insulation Testing', 'Stator Assembly'],
      'DG Set / Generator Technician': ['Diesel Engine Overhaul', 'Alternator Maintenance', 'AMF Panel Testing', 'Fuel Pump Timing'],
      'Solar PV Panel Installer': ['Solar Module Mounting', 'Inverter Wiring', 'Net Metering Connection', 'DC Cable Laying', 'Structure Assembly']
    }
  },
  'Welding & Metal Fabrication': {
    industry: 'Welding & Metal Fabrication',
    roles: [
      'TIG Welder (GTAW)',
      'MIG Welder (GMAW)',
      'Arc Welder (SMAW)',
      'Structural Fabricator',
      'Pipe Welder (6G Radiography)',
      'Gas Cutter / Plasma Cutter Operator',
      'Spot Welder Operator',
      'Laser Cutting Machine Operator',
      'Grinder & Polisher',
      'Heavy Pressure Vessel Welder',
      'Fit-Up Inspector'
    ],
    skills: {
      'TIG Welder (GTAW)': ['TIG Welding (GTAW)', 'Stainless Steel Welding', 'Aluminum Welding', 'Argon Gas Shielding', 'Weld Inspection'],
      'MIG Welder (GMAW)': ['MIG Welding (GMAW)', 'CO2 Welding', 'Flux Cored Wire', 'High-Speed Welding', 'Grinding & Finishing'],
      'Arc Welder (SMAW)': ['Manual Metal Arc Welding', 'Heavy Structure Welding', 'Electrode Selection', 'Slag Removal'],
      'Structural Fabricator': ['Structure Fabrication', 'Blue-Print Reading', 'Fitting & Tack Welding', 'Measuring Tape Accuracy', 'Beveling'],
      'Pipe Welder (6G Radiography)': ['6G Position Welding', 'Pressure Vessel Welding', 'Radiography Quality', 'Purging Techniques'],
      'Gas Cutter / Plasma Cutter Operator': ['Oxy-Acetylene Cutting', 'Plasma Cutting Torch', 'Plate Marking', 'Edge Preparation'],
      'Spot Welder Operator': ['Resistance Spot Welding', 'Electrode Alignment', 'Sheet Metal Joining', 'Current Setting'],
      'Laser Cutting Machine Operator': ['CNC Laser Cutting', 'CAD File Import', 'Nozzle Centering', 'Gas Pressure Control', 'Metal Sheet Nesting'],
      'Grinder & Polisher': ['Angle Grinder', 'Buffing Wheel', 'Weld Seam Removal', 'Mirror Polish Finishing', 'Deburring'],
      'Heavy Pressure Vessel Welder': ['Submerged Arc Welding (SAW)', 'Thick Plate Welding', 'Pre-Heating Standards', 'UT Test Quality'],
      'Fit-Up Inspector': ['Tack Fitting Verification', 'Root Gap Checking', 'Bevel Angle Check', 'Dimensional Tolerance']
    }
  },
  'Assembly & Production': {
    industry: 'Assembly & Production',
    roles: [
      'Production Line Assembly Worker',
      'Machine Helper / Shop Floor Worker',
      'Auto Assembly Technician',
      'Packaging Line Worker',
      'Sub-Assembly Operator',
      'Conveyor Line Operator',
      'Plastic Injection Molding Operator',
      'Blow Molding Machine Operator',
      'Material Handler / Loader',
      'Shop Floor Production Supervisor',
      'Rubber & Gasket Molding Worker'
    ],
    skills: {
      'Production Line Assembly Worker': ['Assembly Line Speed', 'Pneumatic Screwdriver', 'Torque Wrench', 'Standard Operating Procedure (SOP)', '5S Principles'],
      'Machine Helper / Shop Floor Worker': ['Material Loading/Unloading', 'Basic Machine Operation', 'Shop Floor Safety', 'Housekeeping', 'Material Movement'],
      'Auto Assembly Technician': ['Automotive Parts Fitting', 'Torque Tightening', 'Engine Assembly Line', 'Chassis Mounting', 'Quality Checking'],
      'Packaging Line Worker': ['Box Packing', 'Labeling & Barcoding', 'Strapping Machine', 'Palletizing', 'Quantity Verification'],
      'Sub-Assembly Operator': ['Component Mounting', 'Bench Assembly', 'Adhesive Application', 'Visual Inspection'],
      'Conveyor Line Operator': ['Conveyor Speed Control', 'Sensor Alignment', 'Jamming Clearance', 'Line Flow Maintenance'],
      'Plastic Injection Molding Operator': ['Molding Machine Setting', 'Raw Material Hopper Loading', 'Flash Removal', 'Die Temperature Check'],
      'Blow Molding Machine Operator': ['Parison Adjustment', 'Bottle Molding', 'Trimming', 'Air Pressure Control'],
      'Material Handler / Loader': ['Trolley Movement', 'Pallet Jack Operation', 'Bin Stacking', 'Part Kitting'],
      'Shop Floor Production Supervisor': ['Hourly Production Output', 'Manpower Deployment', 'Shift Report', 'Safety Enforcement', '5S Audit'],
      'Rubber & Gasket Molding Worker': ['Vulcanizing Press', 'Rubber Compound Loading', 'De-flashing', 'Gasket Inspection']
    }
  },
  'Quality Control & Inspection': {
    industry: 'Quality Control & Inspection',
    roles: [
      'Quality Control (QC) Inspector',
      'Quality Assurance (QA) Assistant',
      'CMM Machine Operator',
      'Incoming Material Inspector',
      'Line Quality Inspector',
      'Calibration Technician',
      'NDT (Non-Destructive Testing) Technician',
      'Hardness & Metallurgy Tester',
      'Process Audit Technician',
      'Outgoing Quality (OQC) Inspector',
      'First Piece Approval Inspector'
    ],
    skills: {
      'Quality Control (QC) Inspector': ['Vernier Caliper & Micrometer', 'Height Gauge', 'Bore Gauge', 'Reject Documentation', 'Sampling Plan AQL'],
      'Quality Assurance (QA) Assistant': ['ISO 9001 / IATF 16949', '8D Problem Solving', 'Process Audit', 'CAPA Implementation', 'Checksheet Maintenance'],
      'CMM Machine Operator': ['CMM Inspection', 'PC-DMIS Software', '3D Measurement', 'CAD Model Comparison', 'GD&T Analysis'],
      'Incoming Material Inspector': ['Raw Material Testing', 'Hardness Tester', 'Spectro Analysis Report', 'Vendor Defect Report'],
      'Line Quality Inspector': ['In-Process Inspection', 'Poka-Yoke Verification', 'First Piece Approval', 'Defect Tagging'],
      'Calibration Technician': ['Gauge Calibration', 'Master Gauge Standards', 'Calibration Certificate', 'Uncertainty Check'],
      'NDT (Non-Destructive Testing) Technician': ['Dye Penetrant Test (DPT)', 'Magnetic Particle Test (MPT)', 'Ultrasonic Testing (UT)', 'Radiography Interpretation'],
      'Hardness & Metallurgy Tester': ['Rockwell Hardness Tester', 'Vickers Hardness', 'Microstructure Analysis', 'Grain Size Checking'],
      'Process Audit Technician': ['Layered Process Audit (LPA)', 'SOP Compliance', 'Control Plan Verification', 'Process Capability (Cp/Cpk)'],
      'Outgoing Quality (OQC) Inspector': ['Finished Goods Inspection', 'Dispatch Audit', 'Box Packaging Quality', 'Barcoding Check'],
      'First Piece Approval Inspector': ['First Off Inspection', 'Setup Sign-Off', 'Dimension Verification', 'Production Release']
    }
  },
  'Automotive & Auto Ancillary': {
    industry: 'Automotive & Auto Ancillary',
    roles: [
      'Automotive Assembly Line Worker',
      'Auto Paint Shop Operator',
      'Press Shop Stamping Operator',
      'Chassis & Engine Fitter',
      'Vehicle Inspector / PDI Tester',
      'Auto Electrical Technician',
      'Wheel Alignment & Balancer',
      'Automobile Body Repair Technician',
      'Battery Assembly Worker',
      'Two-Wheeler / Four-Wheeler Mechanic',
      'EV (Electric Vehicle) Assembly Tech'
    ],
    skills: {
      'Automotive Assembly Line Worker': ['Automotive Assembly', 'Pneumatic Tools', 'IATF 16949 Standards', 'Line Speed', 'Visual Check'],
      'Auto Paint Shop Operator': ['Robotic Spray Painting', 'Primer & Clear Coat', 'Paint Defect Inspection', 'Buffing & Polishing'],
      'Press Shop Stamping Operator': ['Stamping Press Machine', 'Sheet Metal Pressing', 'Die Clamping', 'Blank Loading'],
      'Chassis & Engine Fitter': ['Engine Mounting', 'Gearbox Assembly', 'Brake Line Fitting', 'Torque Measurement'],
      'Vehicle Inspector / PDI Tester': ['Shower Test', 'Dynamometer Test', 'Alignment Checking', 'Pre-Delivery Inspection (PDI)'],
      'Auto Electrical Technician': ['Vehicle Wiring Harness', 'ECU Diagnostic Scanner', 'Relay & Fuse Box', 'Headlight Adjustment'],
      'Wheel Alignment & Balancer': ['Computerized Wheel Alignment', 'Dynamic Wheel Balancing', 'Tyre Changer Machine', 'Suspension Check'],
      'Automobile Body Repair Technician': ['Denting & Metal Straightening', 'Tack Welding Repair', 'Body Filler Application', 'Panel Replacement'],
      'Battery Assembly Worker': ['Lithium-Ion Cell Sorting', 'Busbar Spot Welding', 'BMS (Battery Management System)', 'Thermal Insulation'],
      'Two-Wheeler / Four-Wheeler Mechanic': ['Engine Overhaul', 'Carburetor / FI Cleaning', 'Brake Pad Replacement', 'Oil Filter Change'],
      'EV (Electric Vehicle) Assembly Tech': ['High-Voltage Wiring', 'EV Motor Mounting', 'Controller Programming', 'Charging Port Testing']
    }
  },
  'Logistics & Warehousing': {
    industry: 'Logistics & Warehousing',
    roles: [
      'Forklift Operator (Counterbalance / Reach Truck)',
      'Store Keeper / Store Executive',
      'Warehouse Assistant / Loader',
      'Dispatch Executive',
      'Inventory Controller',
      'Order Picker / Packer',
      'E-Commerce Fulfillment Assistant',
      'Crane / Hoist Operator',
      'Goods Vehicle Driver (LCV/HCV)',
      'Yard Supervisor',
      'Material Logistics Coordinator'
    ],
    skills: {
      'Forklift Operator (Counterbalance / Reach Truck)': ['Counterbalance Forklift', 'Reach Truck Operation', 'Pallet Handling', 'Safety License / Driving', 'High-Rack Stacking'],
      'Store Keeper / Store Executive': ['ERP / SAP Materials Management', 'GRN Generation', 'Bin Management', 'Stock Audit', 'FIFO / LIFO'],
      'Warehouse Assistant / Loader': ['Heavy Lifting & Stacking', 'Loading / Unloading Trucks', 'Parcel Sorting', 'Physical Stock Count'],
      'Dispatch Executive': ['Invoice & E-Way Bill', 'Transport Coordination', 'Dispatch Documentation', 'Vehicle Loading Plan'],
      'Inventory Controller': ['Stock Reconciliation', 'Cycle Count', 'Kitting', 'Material Tracking', 'Safety Stock Level'],
      'Order Picker / Packer': ['HHT Handheld Scanner', 'Pick List Accuracy', 'Carton Packaging', 'Shipping Label Tagging'],
      'E-Commerce Fulfillment Assistant': ['Sorting & Bagging', 'Return Package Audit', 'RTV Processing', 'Manifest Generation'],
      'Crane / Hoist Operator': ['EOT Crane Operation', 'Slinging & Rigging', 'Heavy Mold Lifting', 'Overhead Crane Safety'],
      'Goods Vehicle Driver (LCV/HCV)': ['Commercial Driving License (HMV)', 'GPS Navigation', 'Vehicle Inspection', 'Logbook Entry'],
      'Yard Supervisor': ['Trailer Parking Allocation', 'Gate Entry Inward/Outward', 'Dock Management', 'Vehicle Turnaround Time'],
      'Material Logistics Coordinator': ['Milk-Run Scheduling', 'Vendor Freight Tracking', '3PL Management', 'Container Loading Plan']
    }
  },
  'Healthcare & Hospitals': {
    industry: 'Healthcare & Hospitals',
    roles: [
      'Staff Nurse (GNM / B.Sc Nursing)',
      'Ward Boy / Nursing Assistant',
      'Lab Assistant / Pathology Technician',
      'Pharmacist / Pharmacy Assistant',
      'Hospital Receptionist / Billing Executive',
      'Operation Theatre (OT) Technician',
      'X-Ray / Radiology Technician',
      'ECG / Dialysis Technician',
      'Hospital Housekeeping Staff',
      'Medical Equipment Maintenance Tech',
      'Patient Care Attendant'
    ],
    skills: {
      'Staff Nurse (GNM / B.Sc Nursing)': ['Patient Care', 'IV Injection & Drip', 'Vital Signs Monitoring', 'ICU Care', 'Doctor Assistance'],
      'Ward Boy / Nursing Assistant': ['Patient Transfer', 'Bed Making', 'Basic Hygiene Care', 'Sample Delivery to Lab'],
      'Lab Assistant / Pathology Technician': ['Blood Sample Collection (Phlebotomy)', 'Centrifuge Machine', 'Slide Preparation', 'Basic Pathology'],
      'Pharmacist / Pharmacy Assistant': ['Medicine Dispensing', 'Pharmacy Billing', 'Drug Expiry Check', 'Inventory Stocking'],
      'Hospital Receptionist / Billing Executive': ['Patient Registration', 'Hospital HMS Software', 'Cash & Insurance Billing', 'Appointment Scheduling'],
      'Operation Theatre (OT) Technician': ['OT Sterilization & Autoclave', 'Surgical Instrument Setup', 'Anesthesia Trolley Prep', 'Patient Positioning'],
      'X-Ray / Radiology Technician': ['Digital X-Ray Machine', 'Positioning & Exposure', 'PACS Software', 'Radiation Safety Badge (TLD)'],
      'ECG / Dialysis Technician': ['12-Lead ECG Machine', 'Dialysis Machine Priming', 'Fistula Cannulation', 'Patient Monitor'],
      'Hospital Housekeeping Staff': ['Bio-Medical Waste Segregation (BMW)', 'Disinfection & Sanitization', 'Floor Scrubbing', 'Linen Change'],
      'Medical Equipment Maintenance Tech': ['Patient Monitor Calibration', 'Ventilator Servicing', 'Defibrillator Check', 'Biomedical Safety'],
      'Patient Care Attendant': ['Elderly Care', 'Feeding Assistance', 'Mobility Support', 'Personal Hygiene Help']
    }
  },
  'Hotel & Hospitality': {
    industry: 'Hotel & Hospitality',
    roles: [
      'Chef / Commis Cook (Indian/Chinese/Continental)',
      'Steward / F&B Waiter',
      'Housekeeping Supervisor / Executive',
      'Front Desk / Reception Executive',
      'Facility Maintenance Technician',
      'Kitchen Helper / Kitchen Steward',
      'Baker / Pastry Chef',
      'Barista / Bartender',
      'Room Service Attendant',
      'Banquets & Event Supervisor',
      'Hotel Security Guard'
    ],
    skills: {
      'Chef / Commis Cook (Indian/Chinese/Continental)': ['Commercial Cooking', 'Kitchen Hygiene (HACCP)', 'Food Preparation', 'Menu Execution', 'Inventory Handling'],
      'Steward / F&B Waiter': ['Table Service', 'Order Taking (POS)', 'Food & Beverage Service', 'Customer Hospitality'],
      'Housekeeping Supervisor / Executive': ['Room Cleaning Standards', 'Linen Management', 'Chemical Dilution', 'Guest Amenities'],
      'Front Desk / Reception Executive': ['Check-in / Check-out', 'Hotel PMS Software', 'Guest Interaction', 'Reservation Booking'],
      'Facility Maintenance Technician': ['AC Repair', 'Plumbing Maintenance', 'Electrical Fixing', 'Hotel Equipment Care'],
      'Kitchen Helper / Kitchen Steward': ['Dishwashing Machine', 'Vegetable Chopping', 'Kitchen Sanitation', 'Garbage Disposal'],
      'Baker / Pastry Chef': ['Baking Bread & Rolls', 'Cake Decoration', 'Oven Temperature Control', 'Pastry Fillings'],
      'Barista / Bartender': ['Espresso Machine Operation', 'Cocktail & Mocktail Preparation', 'Beverage Inventory', 'Bar Counter Cleanliness'],
      'Room Service Attendant': ['In-Room Dining Delivery', 'Tray Setup', 'Clearance', 'Order Accuracy'],
      'Banquets & Event Supervisor': ['Banquet Table Setup', 'Buffet Arrangement', 'Event Catering Flow', 'Guest Handling'],
      'Hotel Security Guard': ['Visitor Gate Register', 'Baggage Scanner', 'Patrolling', 'CCTV Monitoring']
    }
  },
  'Information Technology (IT)': {
    industry: 'Information Technology (IT)',
    roles: [
      'Software Engineer / Developer',
      'Frontend Developer (React/HTML/CSS)',
      'Backend Developer (Node.js/Python/Java)',
      'Full Stack Engineer',
      'QA / Software Tester (Manual & Automation)',
      'IT Support & Desktop Technician',
      'Network & System Administrator',
      'Database Administrator (SQL/Postgres)',
      'UI/UX Graphic Designer',
      'DevOps / Cloud Engineer',
      'Technical Support Executive'
    ],
    skills: {
      'Software Engineer / Developer': ['Data Structures', 'Git & GitHub', 'REST APIs', 'Database Design', 'Problem Solving'],
      'Frontend Developer (React/HTML/CSS)': ['React.js', 'TypeScript', 'CSS Flexbox/Grid', 'Responsive Web Design', 'State Management'],
      'Backend Developer (Node.js/Python/Java)': ['Node.js', 'Express', 'SQL & PostgreSQL', 'API Integration', 'Authentication JWT'],
      'Full Stack Engineer': ['React.js', 'Node.js', 'PostgreSQL / MongoDB', 'API Design', 'System Architecture'],
      'QA / Software Tester (Manual & Automation)': ['Manual Testing', 'Bug Reporting', 'Automation Cypress/Selenium', 'API Testing Postman', 'Test Cases'],
      'IT Support & Desktop Technician': ['Windows / Linux Administration', 'LAN / Wi-Fi Networking', 'Hardware Troubleshooting', 'Helpdesk Ticketing'],
      'Network & System Administrator': ['Cisco Router & Switch', 'Firewall Configuration', 'Active Directory / DNS', 'Server Backup'],
      'Database Administrator (SQL/Postgres)': ['SQL Query Optimization', 'Database Indexing', 'Backup & Restore', 'Schema Design'],
      'UI/UX Graphic Designer': ['Figma Design', 'Photoshop & Illustrator', 'Wireframing & Prototyping', 'User Flow'],
      'DevOps / Cloud Engineer': ['Docker & Kubernetes', 'CI/CD Pipelines', 'AWS / Azure Cloud', 'Linux Shell Scripting'],
      'Technical Support Executive': ['Customer Issue Resolution', 'Remote Desktop Support (AnyDesk/TeamViewer)', 'CRM Ticketing', 'SLA Adherence']
    }
  },
  'Education & Institutions': {
    industry: 'Education & Institutions',
    roles: [
      'Primary / High School Teacher',
      'College Lecturer / Assistant Professor',
      'Admin Executive / Office Clerk',
      'Data Entry Operator (DEO)',
      'Accountant (Tally / GST)',
      'Computer Lab Assistant',
      'School / College Librarian',
      'Student Counselor / Admissions Officer',
      'Physical Education (PE) Instructor / Coach',
      'Hostel Warden'
    ],
    skills: {
      'Primary / High School Teacher': ['Classroom Management', 'Subject Expertise', 'Lesson Planning', 'Student Evaluation', 'Parent Communication'],
      'College Lecturer / Assistant Professor': ['Curriculum Design', 'Academic Research', 'Lecture Delivery', 'Exam Evaluation'],
      'Admin Executive / Office Clerk': ['MS Office (Excel/Word)', 'Email Communication', 'Attendance Register', 'Office Supplies Management'],
      'Data Entry Operator (DEO)': ['Typing Speed (35+ WPM)', 'MS Excel Formulas', 'Data Accuracy', 'Document Scanning'],
      'Accountant (Tally / GST)': ['Tally Prime / ERP9', 'GST Filing', 'Bank Reconciliation', 'Petty Cash', 'Voucher Entry'],
      'Computer Lab Assistant': ['Computer Networking', 'Software Installation', 'PC Maintenance', 'Lab Timetable Management'],
      'School / College Librarian': ['Book Cataloging', 'Library Software Management', 'Issue & Return Register', 'Stock Audit'],
      'Student Counselor / Admissions Officer': ['Admissions Process', 'Career Counseling', 'Telephonic Follow-Up', 'Fee Structure Guidance'],
      'Physical Education (PE) Instructor / Coach': ['Sports Training & Fitness', 'Annual Sports Day Event', 'First Aid', 'Team Discipline'],
      'Hostel Warden': ['Student Room Allocation', 'Night Roll Call', 'Mess Food Supervision', 'Hostel Discipline & Safety']
    }
  },
  'Pharmaceuticals & Chemicals': {
    industry: 'Pharmaceuticals & Chemicals',
    roles: [
      'Pharma Production Operator (Granulation/Compression)',
      'QC Chemist (HPLC/UV)',
      'QA Compliance Officer',
      'Chemical Plant Process Operator',
      'Packaging Operator (Blister/Strip)',
      'Boiler Attendant / Utility Tech',
      'ETP (Effluent Treatment Plant) Operator',
      'Microbiologist Assistant',
      'Formulations Assistant',
      'Chemical Warehouse Executive',
      'Bulk Drug Plant Technician'
    ],
    skills: {
      'Pharma Production Operator (Granulation/Compression)': ['GMP & cGMP Standards', 'Granulation Machine', 'Compression Machine', 'Cleanroom Protocols (Class 100k)'],
      'QC Chemist (HPLC/UV)': ['HPLC Operation', 'UV Spectrophotometer', 'Titration', 'Raw Material Testing', 'Pharma Analysis'],
      'QA Compliance Officer': ['BMR & BPR Review', 'Validation Protocol', 'Audit Trail', 'Change Control & Deviation'],
      'Chemical Plant Process Operator': ['Reactor Operation', 'Distillation Column', 'Boiler Operation', 'Chemical Safety Hazards PPE'],
      'Packaging Operator (Blister/Strip)': ['Blister Packing Machine', 'Batch Coding Machine', 'Cartoning Machine', 'Leak Test'],
      'Boiler Attendant / Utility Tech': ['Steam Pressure Control', 'Water Softening Plant', 'Chiller Plant Maintenance', 'Utility Piping'],
      'ETP (Effluent Treatment Plant) Operator': ['pH Neutralization', 'Chemical Dosing', 'Sludge Filter Press', 'Pollution Board Standards'],
      'Microbiologist Assistant': ['Aseptic Testing', 'Media Preparation', 'Autoclaving', 'Air Sampling Check'],
      'Formulations Assistant': ['R&D Batch Trial', 'Blending & Mixing', 'Viscosity Measurement', 'Stability Chamber Check'],
      'Chemical Warehouse Executive': ['Hazchem Storage Safety', 'Material Safety Data Sheet (MSDS)', 'Chemical Drum Handling', 'FEFO Rule'],
      'Bulk Drug Plant Technician': ['Centrifuge & Dryer', 'Crystallizer Tank', 'Solvent Recovery', 'API Manufacturing']
    }
  },
  'Construction & Real Estate': {
    industry: 'Construction & Real Estate',
    roles: [
      'Civil Site Engineer',
      'Site Supervisor / Mukadam',
      'Construction Electrician',
      'Plumber & Sanitary Technician',
      'CAD Draughtsman',
      'Safety Officer (HSE)',
      'Mason / Concrete Worker',
      'Scaffolding Erector & Inspector',
      'Surveyor / Total Station Operator',
      'Heavy Equipment Operator (JCB/Poclain)',
      'Tile & Granite Fitter'
    ],
    skills: {
      'Civil Site Engineer': ['Site Execution', 'AutoCAD', 'Structural Drawing Reading', 'Concrete Testing', 'Bar Bending Schedule (BBS)'],
      'Site Supervisor / Mukadam': ['Labor Management', 'Material Verification', 'Daily Progress Report (DPR)', 'Work Quality Check'],
      'Construction Electrician': ['Building Wiring', 'Conduit Pipe Fitting', 'Distribution Board Assembly', 'Temporary Power Setup'],
      'Plumber & Sanitary Technician': ['CPVC / PVC Pipe Fitting', 'Sanitaryware Installation', 'Water Tank Connection', 'Leakage Repair'],
      'CAD Draughtsman': ['AutoCAD 2D/3D', 'Architectural Layout', 'Structural Detailing', 'Drawing Revisions'],
      'Safety Officer (HSE)': ['Scaffolding Inspection', 'PPE Enforcement', 'Toolbox Talk', 'Hazard Identification'],
      'Mason / Concrete Worker': ['Brickwork & Plastering', 'Concrete Pouring & Curing', 'Shuttering Alignment', 'Mortar Mixing'],
      'Scaffolding Erector & Inspector': ['Cuplock Scaffolding Assembly', 'H-Frame Setup', 'Safety Net Fixing', 'Tagging (Red/Green)'],
      'Surveyor / Total Station Operator': ['Total Station Instrument', 'Auto Level Layout', 'Boundary Marking', 'Contour Mapping'],
      'Heavy Equipment Operator (JCB/Poclain)': ['JCB Excavator Operation', 'Trench Digging', 'Poclain Loading', 'Machine Daily Check'],
      'Tile & Granite Fitter': ['Floor Tile Layout', 'Wall Cladding', 'Granite Cutting & Polishing', 'Cement Grouting']
    }
  },
  'Retail & FMCG': {
    industry: 'Retail & FMCG',
    roles: [
      'Store Manager / Assistant Manager',
      'Retail Sales Associate',
      'Billing Cashier / POS Operator',
      'Visual Merchandiser',
      'FMCG Sales Representative / Field Executive',
      'Supermarket Stocker / Merchandiser',
      'Customer Service Associate',
      'Inventory Stock Clerk',
      'Delivery Executive (Bike / Van)',
      'FMCG Distributor Coordinator',
      'Store Auditor'
    ],
    skills: {
      'Store Manager / Assistant Manager': ['Store P&L', 'Staff Shift Planning', 'Inventory Management', 'Customer Relationship'],
      'Retail Sales Associate': ['Product Recommendation', 'Customer Service', 'Stock Replenishment', 'Cross-Selling'],
      'Billing Cashier / POS Operator': ['POS Software Billing', 'Cash & Card Settlement', 'Barcode Scanner', 'Daily Cash Closing'],
      'Visual Merchandiser': ['Display Arrangement', 'Planogram Compliance', 'Promotional Banner Setup', 'Stock Styling'],
      'FMCG Sales Representative / Field Executive': ['Field Sales', 'Distributor Order Collection', 'Beat Plan Execution', 'Outlet Expansion'],
      'Supermarket Stocker / Merchandiser': ['Shelf Stocking', 'Expiry Date Rotation (FIFO)', 'Price Tag Labeling', 'Aisle Upkeep'],
      'Customer Service Associate': ['Customer Inquiry Resolution', 'Product Returns & Exchanges', 'Feedback Collection', 'Store Announcement'],
      'Inventory Stock Clerk': ['Inward Stock Count', 'Damage Goods Audit', 'Stock Room Sorting', 'ERP Stock Entry'],
      'Delivery Executive (Bike / Van)': ['Local Area Route Knowledge', 'Customer Order Delivery', 'Cash on Delivery (COD) Handling', 'Driving License'],
      'FMCG Distributor Coordinator': ['Distributor Stock Invoicing', 'Primary & Secondary Sales Tracking', 'Scheme Communication'],
      'Store Auditor': ['Physical Stock Verification', 'Shrinkage Audit', 'Cash Counter Audit', 'SOP Compliance Check']
    }
  },
  'Other / Custom Sector': {
    industry: 'Other / Custom Sector',
    roles: [
      'General Machine Operator',
      'Multiskilled Technician',
      'Apprentice / Industrial Trainee',
      'Supervisor / Team Leader',
      'Office Assistant / Peon',
      'Security Supervisor',
      'Utility Maintenance Staff',
      'Field Executive',
      'Commercial Driver',
      'Custom Job Role'
    ],
    skills: {
      'General Machine Operator': ['Machine Operation', 'Shop Floor Safety', 'Quality Focus', 'Hand Tools'],
      'Multiskilled Technician': ['Troubleshooting', 'Maintenance', 'Equipment Operation', 'Safety Protocols'],
      'Apprentice / Industrial Trainee': ['Quick Learner', 'Industrial Discipline', 'Basic Workshop Training', 'Punctuality'],
      'Supervisor / Team Leader': ['Manpower Allocation', 'Target Tracking', 'Reporting', 'Shift Coordination'],
      'Office Assistant / Peon': ['Office Filing', 'Pantry Service', 'Bank & Courier Visits', 'Office Upkeep'],
      'Security Supervisor': ['Gate Register', 'CCTV Monitoring', 'Security Guard Deployment', 'Emergency Response'],
      'Utility Maintenance Staff': ['Basic Electrical Fixing', 'Plumbing Check', 'Facility Upkeep', 'Tool Handling'],
      'Field Executive': ['Field Visits', 'Client Interaction', 'Document Collection', 'Report Entry'],
      'Commercial Driver': ['Commercial Driving License', 'Vehicle Maintenance', 'Route Knowledge', 'Safety Driving'],
      'Custom Job Role': ['Communication', 'Problem Solving', 'Teamwork', 'Punctuality']
    }
  }
};

/**
 * Returns list of dynamic job roles for the selected Industry Type.
 */
export const getRolesForIndustry = (industryName: string): string[] => {
  if (!industryName) return [];

  // Direct key lookup
  const match = INDUSTRY_ROLE_MAPPINGS[industryName];
  if (match) return match.roles;

  // Fuzzy lookup matching key substrings
  const foundKey = Object.keys(INDUSTRY_ROLE_MAPPINGS).find(k => 
    k.toLowerCase().includes(industryName.toLowerCase()) || industryName.toLowerCase().includes(k.toLowerCase())
  );
  if (foundKey) return INDUSTRY_ROLE_MAPPINGS[foundKey].roles;

  // Fallback roles for any custom industry name
  return ['General Operator', 'Technician', 'Supervisor', 'Executive', 'Other Role...'];
};

/**
 * Returns dynamic skill suggestions for a specific role and industry.
 */
export const getSkillsForRole = (roleName: string, industryName?: string): string[] => {
  if (!roleName) return [];

  // Search specified industry mapping first
  if (industryName && INDUSTRY_ROLE_MAPPINGS[industryName]) {
    const roleSkills = INDUSTRY_ROLE_MAPPINGS[industryName].skills[roleName];
    if (roleSkills && roleSkills.length > 0) return roleSkills;
  }

  // Global search across all industries
  for (const industryObj of Object.values(INDUSTRY_ROLE_MAPPINGS)) {
    if (industryObj.skills[roleName]) {
      return industryObj.skills[roleName];
    }
  }

  // Fallback default skills
  return ['Quality Focus', 'Safety Protocols', 'Punctuality', 'Teamwork', 'Problem Solving'];
};
