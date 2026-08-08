import { pool } from './config/database/pool';

// Real companies operating in Chhatrapati Sambhajinagar (Aurangabad) MIDC & Commercial zones
const SAMBHAJINAGAR_COMPANIES = [
  { company: 'Bajaj Auto Limited', logo: 'https://images.unsplash.com/photo-1558981806-ec527fa84c39?auto=format&fit=crop&w=250&q=80', color: '#D97706', defaultLoc: 'Waluj MIDC, Chhatrapati Sambhajinagar' },
  { company: 'Endurance Technologies Ltd', logo: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=250&q=80', color: '#DC2626', defaultLoc: 'Shendra MIDC DMIC, Chhatrapati Sambhajinagar' },
  { company: 'Siemens India Ltd', logo: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=250&q=80', color: '#0891B2', defaultLoc: 'Waluj MIDC Sector E, Chhatrapati Sambhajinagar' },
  { company: 'Garware Technical Fibres', logo: 'https://images.unsplash.com/photo-1581093458791-9f3c3900df4b?auto=format&fit=crop&w=250&q=80', color: '#059669', defaultLoc: 'Chikalthana MIDC, Chhatrapati Sambhajinagar' },
  { company: 'Varroc Engineering Ltd', logo: 'https://images.unsplash.com/photo-1581092335397-9583fe92d232?auto=format&fit=crop&w=250&q=80', color: '#2563EB', defaultLoc: 'Waluj MIDC K-Block, Chhatrapati Sambhajinagar' },
  { company: 'Lupin Limited (Pharma Division)', logo: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=250&q=80', color: '#059669', defaultLoc: 'Chikalthana MIDC, Chhatrapati Sambhajinagar' },
  { company: 'Ajanta Pharma Ltd', logo: 'https://images.unsplash.com/photo-1532938911079-1b06ac7ceec7?auto=format&fit=crop&w=250&q=80', color: '#BE185D', defaultLoc: 'Paithan MIDC, Chhatrapati Sambhajinagar' },
  { company: 'Perkins Engines India', logo: 'https://images.unsplash.com/photo-1581092580497-e0d23cbdf1dc?auto=format&fit=crop&w=250&q=80', color: '#B91C1C', defaultLoc: 'Shendra DMIC Smart City, Chhatrapati Sambhajinagar' },
  { company: 'Sterlite Technologies (STL)', logo: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=250&q=80', color: '#1D4ED8', defaultLoc: 'Waluj MIDC Sector 3, Chhatrapati Sambhajinagar' },
  { company: 'Grind Master Machines', logo: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=250&q=80', color: '#7C2D12', defaultLoc: 'Railway Station MIDC, Chhatrapati Sambhajinagar' },
  { company: 'Cosmo First Limited', logo: 'https://images.unsplash.com/photo-1581092795360-fd1ca04f0952?auto=format&fit=crop&w=250&q=80', color: '#0284C7', defaultLoc: 'Waluj MIDC Sector 2, Chhatrapati Sambhajinagar' },
  { company: 'Sanjeev Auto Parts', logo: 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=250&q=80', color: '#D97706', defaultLoc: 'Chittegaon MIDC, Chhatrapati Sambhajinagar' },
  { company: 'Wockhardt Hospitals', logo: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=250&q=80', color: '#BE185D', defaultLoc: 'Nageshwarwadi, Chhatrapati Sambhajinagar' },
  { company: 'MGM Medical College & Hospital', logo: 'https://images.unsplash.com/photo-1532938911079-1b06ac7ceec7?auto=format&fit=crop&w=250&q=80', color: '#0284C7', defaultLoc: 'Seven Hills, Chhatrapati Sambhajinagar' },
  { company: 'Seth Nandlal Dhoot Hospital', logo: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=250&q=80', color: '#047857', defaultLoc: 'Chikalthana MIDC Road, Chhatrapati Sambhajinagar' },
  { company: 'Apollo Pharmacy', logo: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=250&q=80', color: '#059669', defaultLoc: 'Kranti Chowk, Chhatrapati Sambhajinagar' },
  { company: 'Taj Hotels (Vivanta)', logo: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=250&q=80', color: '#9A3412', defaultLoc: 'Jalna Road, Chhatrapati Sambhajinagar' },
  { company: 'Radisson Blu Hotel', logo: 'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?auto=format&fit=crop&w=250&q=80', color: '#2563EB', defaultLoc: 'Airport Road, CIDCO, Chhatrapati Sambhajinagar' },
  { company: 'Prozone Mall Retail', logo: 'https://images.unsplash.com/photo-1567401893414-76b7b1e5a7a5?auto=format&fit=crop&w=250&q=80', color: '#C2410C', defaultLoc: 'API Corner, CIDCO, Chhatrapati Sambhajinagar' },
  { company: 'D-Mart Avenue Supermarts', logo: 'https://images.unsplash.com/photo-1567401893414-76b7b1e5a7a5?auto=format&fit=crop&w=250&q=80', color: '#059669', defaultLoc: 'Cannaught Place, CIDCO, Chhatrapati Sambhajinagar' },
  { company: 'MIT Group of Institutions', logo: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&w=250&q=80', color: '#7C3AED', defaultLoc: 'Beed Bypass Road, Chhatrapati Sambhajinagar' },
  { company: 'Deogiri Institute of Technology', logo: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&w=250&q=80', color: '#1D4ED8', defaultLoc: 'Station Road, Chhatrapati Sambhajinagar' },
  { company: 'Ryan International School', logo: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&w=250&q=80', color: '#0369A1', defaultLoc: 'N-3 CIDCO, Chhatrapati Sambhajinagar' },
  { company: 'Software Technology Parks of India (STPI)', logo: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=250&q=80', color: '#1D4ED8', defaultLoc: 'Chikalthana STPI Park, Chhatrapati Sambhajinagar' },
  { company: 'AURIC Smart City Infrastructure', logo: 'https://images.unsplash.com/photo-1581092580497-e0d23cbdf1dc?auto=format&fit=crop&w=250&q=80', color: '#0891B2', defaultLoc: 'Bidkin DMIC Node, Chhatrapati Sambhajinagar' },
  { company: 'Goodyear South Asia Tyres', logo: 'https://images.unsplash.com/photo-1581092335397-9583fe92d232?auto=format&fit=crop&w=250&q=80', color: '#D97706', defaultLoc: 'Waluj MIDC Sector 1, Chhatrapati Sambhajinagar' },
  { company: 'Reliance Trends Retail', logo: 'https://images.unsplash.com/photo-1567401893414-76b7b1e5a7a5?auto=format&fit=crop&w=250&q=80', color: '#B91C1C', defaultLoc: 'Nirala Bazar, Chhatrapati Sambhajinagar' },
  { company: 'Kirloskar Ferrous Industries', logo: 'https://images.unsplash.com/photo-1581092580497-e0d23cbdf1dc?auto=format&fit=crop&w=250&q=80', color: '#7C2D12', defaultLoc: 'Waluj MIDC, Chhatrapati Sambhajinagar' },
  { company: 'United Breweries Ltd (Kingfisher Plant)', logo: 'https://images.unsplash.com/photo-1581093458791-9f3c3900df4b?auto=format&fit=crop&w=250&q=80', color: '#D97706', defaultLoc: 'Waluj MIDC Sector E, Chhatrapati Sambhajinagar' },
  { company: 'Saffron Bakery & Cafe', logo: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=250&q=80', color: '#9A3412', defaultLoc: 'N-2 CIDCO, Chhatrapati Sambhajinagar' }
];

// Specific locations across Chhatrapati Sambhajinagar district & MIDC zones
const SAMBHAJINAGAR_LOCATIONS = [
  'Waluj MIDC Sector 1, Chhatrapati Sambhajinagar',
  'Waluj MIDC Sector 2, Chhatrapati Sambhajinagar',
  'Waluj MIDC Sector 3, Chhatrapati Sambhajinagar',
  'Waluj MIDC Sector E, Chhatrapati Sambhajinagar',
  'Waluj MIDC K-Block, Chhatrapati Sambhajinagar',
  'Shendra DMIC Smart City, Chhatrapati Sambhajinagar',
  'Shendra MIDC Phase 1, Chhatrapati Sambhajinagar',
  'Chikalthana MIDC Industrial Area, Chhatrapati Sambhajinagar',
  'Chikalthana STPI IT Park, Chhatrapati Sambhajinagar',
  'Railway Station MIDC, Chhatrapati Sambhajinagar',
  'Paithan MIDC Textile Zone, Chhatrapati Sambhajinagar',
  'Bidkin DMIC Industrial Node (AURIC), Chhatrapati Sambhajinagar',
  'Chittegaon MIDC Auto Hub, Chhatrapati Sambhajinagar',
  'Jalna Road Commercial Strip, Chhatrapati Sambhajinagar',
  'Town Center CIDCO, Chhatrapati Sambhajinagar',
  'Cannaught Place CIDCO, Chhatrapati Sambhajinagar',
  'N-1 to N-12 CIDCO Sector, Chhatrapati Sambhajinagar',
  'Kranti Chowk Business Hub, Chhatrapati Sambhajinagar',
  'Nageshwarwadi Adalat Road, Chhatrapati Sambhajinagar',
  'Seven Hills Hospital Belt, Chhatrapati Sambhajinagar',
  'Garkheda Commercial Complex, Chhatrapati Sambhajinagar',
  'Beed Bypass Road, Chhatrapati Sambhajinagar',
  'Pundlik Nagar Auto Corridor, Chhatrapati Sambhajinagar',
  'Nirala Bazar Retail Center, Chhatrapati Sambhajinagar',
  'Osmanpura IT Market, Chhatrapati Sambhajinagar',
  'Station Road Commercial Hub, Chhatrapati Sambhajinagar',
  'Gangapur Road Agro MIDC, Chhatrapati Sambhajinagar',
  'Kannad MIDC Zone, Chhatrapati Sambhajinagar',
  'Sillod MIDC Hub, Chhatrapati Sambhajinagar',
  'Prozone Mall API Corner, Chhatrapati Sambhajinagar'
];

// Diverse Job Templates across Trades, IT, Healthcare, Education, Hospitality, and Retail
const JOB_TEMPLATES = [
  // 1-15: ITI Skilled Machinist & Plant Mechanics
  { title: 'CNC 3-Axis & VMC Operator', trade: 'ITI Machinist', industry: 'Automotive & Heavy Engineering', minExp: 1, maxExp: 4, salMin: 220000, salMax: 340000, shift: 'Rotational 8-hr Shift' },
  { title: 'TIG & MIG Argon Welder', trade: 'ITI Welder', industry: 'Industrial Fabrication', minExp: 2, maxExp: 5, salMin: 280000, salMax: 400000, shift: 'Day Shift (8:00 AM - 5:00 PM)' },
  { title: 'Plant Maintenance Fitter & Millwright', trade: 'ITI Fitter', industry: 'Plant Maintenance', minExp: 2, maxExp: 6, salMin: 250000, salMax: 380000, shift: 'Rotational Shifts' },
  { title: 'Industrial Electrician & Wireman', trade: 'ITI Electrician', industry: 'Electrical Systems', minExp: 1, maxExp: 5, salMin: 240000, salMax: 360000, shift: 'General Shift (8:30 AM - 5:30 PM)' },
  { title: 'Siemens & Allen Bradley PLC Programmer', trade: 'PLC Automation', industry: 'Industrial Automation', minExp: 3, maxExp: 7, salMin: 450000, salMax: 700000, shift: 'General Shift' },
  { title: 'Tool & Die Maker (HPDC Dies)', trade: 'Tool Engineering', industry: 'Die Casting & Toolroom', minExp: 3, maxExp: 8, salMin: 360000, salMax: 540000, shift: 'Day Shift' },
  { title: 'VMC 5-Axis Mastercam Programmer', trade: 'CAM Programming', industry: 'Precision Engineering', minExp: 4, maxExp: 9, salMin: 480000, salMax: 720000, shift: 'General Shift' },
  { title: 'HVAC & Central Chiller Technician', trade: 'ITI RAC', industry: 'HVAC & Cooling Systems', minExp: 2, maxExp: 6, salMin: 260000, salMax: 390000, shift: 'Rotational Shifts' },
  { title: 'Plastic Injection Molding Machine Operator', trade: 'CIPET Plastics', industry: 'Plastics & Polymers', minExp: 1, maxExp: 4, salMin: 210000, salMax: 310000, shift: 'Rotational 3 Shifts' },
  { title: 'Hydraulic Press & Pneumatic Mechanic', trade: 'ITI Fitter', industry: 'Heavy Machinery', minExp: 2, maxExp: 6, salMin: 270000, salMax: 400000, shift: 'Rotational Shifts' },
  { title: 'Foundry Induction Furnace Operator', trade: 'Foundry Metallurgy', industry: 'Ferrous Metallurgy', minExp: 2, maxExp: 6, salMin: 290000, salMax: 420000, shift: 'Rotational 3 Shifts' },
  { title: 'Sheet Metal Stamping Press Tool Fitter', trade: 'Press Tooling', industry: 'Automotive Stamping', minExp: 2, maxExp: 5, salMin: 260000, salMax: 380000, shift: 'General Shift' },
  { title: 'Textile Extrusion Line Operator', trade: 'Textile Tech', industry: 'Technical Textiles', minExp: 1, maxExp: 4, salMin: 220000, salMax: 330000, shift: 'Rotational 3 Shifts' },
  { title: 'Automotive Paint Shop Robot Operator', trade: 'Automotive Paint', industry: 'Car Assembly', minExp: 2, maxExp: 5, salMin: 280000, salMax: 410000, shift: 'Rotational Shifts' },
  { title: 'Tyre Vulcanization Press Operator', trade: 'Rubber & Polymer', industry: 'Tyre Manufacturing', minExp: 1, maxExp: 4, salMin: 230000, salMax: 340000, shift: 'Rotational 3 Shifts' },

  // 16-30: Quality, Production, Safety & Operations
  { title: 'Quality Control Inspector (QA/QC)', trade: 'Quality Assurance', industry: 'Auto Components', minExp: 1, maxExp: 5, salMin: 260000, salMax: 390000, shift: 'Day Shift' },
  { title: 'Production Assembly Line Supervisor', trade: 'Production Engg', industry: '2-Wheeler Assembly', minExp: 3, maxExp: 7, salMin: 420000, salMax: 650000, shift: 'Rotational Shifts' },
  { title: 'Plant Safety Officer (EHS Inspector)', trade: 'Industrial Safety', industry: 'Chemical & Safety', minExp: 3, maxExp: 7, salMin: 480000, salMax: 700000, shift: 'General Shift' },
  { title: 'Store Keeper & Warehouse Material Manager', trade: 'Warehouse Mgmt', industry: 'Supply Chain', minExp: 2, maxExp: 6, salMin: 300000, salMax: 450000, shift: 'General Shift' },
  { title: 'Pharma Quality Assurance Executive (BMR)', trade: 'Pharma QA', industry: 'Pharmaceutical Formulations', minExp: 3, maxExp: 7, salMin: 450000, salMax: 680000, shift: 'Day Shift' },
  { title: 'Pharma QC Chemist (HPLC & GC Tester)', trade: 'Pharma QC', industry: 'API Manufacturing', minExp: 2, maxExp: 5, salMin: 320000, salMax: 480000, shift: 'General Shift' },
  { title: 'Heavy Forklift & Reach Truck Operator', trade: 'Forklift License', industry: 'Logistics Warehousing', minExp: 1, maxExp: 5, salMin: 220000, salMax: 320000, shift: 'Rotational Shifts' },
  { title: 'AutoCAD & SolidWorks Mechanical Designer', trade: 'Mechanical Design', industry: 'Industrial Design', minExp: 2, maxExp: 6, salMin: 380000, salMax: 580000, shift: 'General Shift' },
  { title: 'Boiler Attendant & Thermal Power Operator', trade: 'Boiler Certified', industry: 'Thermal Utilities', minExp: 3, maxExp: 8, salMin: 340000, salMax: 500000, shift: 'Rotational Shifts' },
  { title: 'Packaging & Bottling Line Supervisor', trade: 'Packaging Tech', industry: 'Beverage & FMCG', minExp: 2, maxExp: 6, salMin: 300000, salMax: 440000, shift: 'Rotational Shifts' },
  { title: 'Dispatch & Logistics Officer', trade: 'Logistics Ops', industry: 'Freight & Express', minExp: 2, maxExp: 5, salMin: 280000, salMax: 400000, shift: 'General Shift' },
  { title: 'Industrial Security Officer & CCTV Inspector', trade: 'Security Mgmt', industry: 'Plant Security', minExp: 2, maxExp: 6, salMin: 250000, salMax: 360000, shift: '12-hr Shift System' },
  { title: 'E-Mobility EV Battery Assembly Technician', trade: 'EV Assembly', industry: 'Electric Vehicles', minExp: 1, maxExp: 4, salMin: 270000, salMax: 390000, shift: 'General Shift' },
  { title: 'Solar Roof PV Installation Engineer', trade: 'Solar Electrical', industry: 'Renewable Energy', minExp: 2, maxExp: 5, salMin: 340000, salMax: 480000, shift: 'Day Shift' },
  { title: 'Continuous Improvement Kaizen Engineer', trade: 'Lean Six Sigma', industry: 'Operational Excellence', minExp: 3, maxExp: 7, salMin: 500000, salMax: 750000, shift: 'General Shift' },

  // 31-45: IT, Software, Mobile & Digital Media
  { title: 'Full Stack Web Developer (Node & React)', trade: 'Software Engg', industry: 'IT & Software', minExp: 3, maxExp: 6, salMin: 750000, salMax: 1200000, shift: 'General Shift (9:30 AM - 6:30 PM)', mode: 'Hybrid' },
  { title: 'Senior React Native App Developer', trade: 'Mobile Tech', industry: 'Mobile Applications', minExp: 4, maxExp: 8, salMin: 950000, salMax: 1500000, shift: 'General Shift', mode: 'Hybrid' },
  { title: 'Java Spring Boot Microservices Engineer', trade: 'Backend Engg', industry: 'Enterprise IT', minExp: 4, maxExp: 8, salMin: 900000, salMax: 1400000, shift: 'General Shift', mode: 'Hybrid' },
  { title: 'UI/UX Product Designer (Figma)', trade: 'UI/UX Design', industry: 'Product Design', minExp: 2, maxExp: 6, salMin: 650000, salMax: 1000000, shift: 'General Shift', mode: 'Hybrid' },
  { title: 'DevOps & AWS Cloud Engineer', trade: 'Cloud Ops', industry: 'Cloud Services', minExp: 3, maxExp: 7, salMin: 850000, salMax: 1350000, shift: 'General Shift', mode: 'Hybrid' },
  { title: 'Digital Marketing & SEO Specialist', trade: 'Digital Marketing', industry: 'E-Commerce Marketing', minExp: 2, maxExp: 5, salMin: 360000, salMax: 520000, shift: 'General Shift', mode: 'On-site' },
  { title: 'Data Entry & Commercial Billing Executive', trade: 'Office Admin', industry: 'Retail & Office Services', minExp: 1, maxExp: 4, salMin: 200000, salMax: 300000, shift: 'General Shift', mode: 'On-site' },
  { title: 'Network Administrator & Hardware Tech', trade: 'IT Support', industry: 'IT Infrastructure', minExp: 2, maxExp: 5, salMin: 280000, salMax: 420000, shift: 'General Shift', mode: 'On-site' },
  { title: 'Python Data Analyst & SQL Reporter', trade: 'Data Analytics', industry: 'Analytics Services', minExp: 2, maxExp: 5, salMin: 550000, salMax: 850000, shift: 'General Shift', mode: 'Hybrid' },
  { title: 'Cyber Security & Network Defense Specialist', trade: 'Cyber Security', industry: 'Information Security', minExp: 3, maxExp: 7, salMin: 800000, salMax: 1250000, shift: 'General Shift', mode: 'On-site' },
  { title: 'Android Kotlin Developer', trade: 'Mobile Tech', industry: 'App Development', minExp: 2, maxExp: 6, salMin: 700000, salMax: 1100000, shift: 'General Shift', mode: 'Hybrid' },
  { title: 'PHP Laravel Web Developer', trade: 'Web Dev', industry: 'Software Solutions', minExp: 2, maxExp: 5, salMin: 420000, salMax: 650000, shift: 'General Shift', mode: 'On-site' },
  { title: 'Graphic Designer & Video Editor', trade: 'Media Design', industry: 'Advertising Agency', minExp: 1, maxExp: 4, salMin: 260000, salMax: 400000, shift: 'General Shift', mode: 'On-site' },
  { title: 'Content Writer & Social Media Manager', trade: 'Content Marketing', industry: 'Digital Agency', minExp: 1, maxExp: 4, salMin: 240000, salMax: 360000, shift: 'General Shift', mode: 'Hybrid' },
  { title: 'SAP MM / SD Module Consultant', trade: 'ERP Software', industry: 'Enterprise Systems', minExp: 4, maxExp: 9, salMin: 1000000, salMax: 1600000, shift: 'General Shift', mode: 'Hybrid' },

  // 46-60: Healthcare, Hospitals & Medical Services
  { title: 'Staff Nurse (ICU & Critical Care)', trade: 'B.Sc / GNM Nursing', industry: 'Healthcare & Hospital', minExp: 1, maxExp: 5, salMin: 280000, salMax: 420000, shift: 'Rotational 3 Shifts' },
  { title: 'Biomedical Equipment Maintenance Engineer', trade: 'Biomedical Engg', industry: 'Medical Devices', minExp: 2, maxExp: 6, salMin: 420000, salMax: 620000, shift: 'General Shift' },
  { title: 'Pathology DMLT Lab Technician', trade: 'DMLT Pathology', industry: 'Diagnostic Lab', minExp: 1, maxExp: 4, salMin: 220000, salMax: 320000, shift: 'Morning Shift' },
  { title: 'Clinical Retail Pharmacist', trade: 'D.Pharm / B.Pharm', industry: 'Retail Pharmacy', minExp: 1, maxExp: 4, salMin: 240000, salMax: 350000, shift: 'Shift System' },
  { title: 'Radiology X-Ray & CT Technician', trade: 'DMRD Radiology', industry: 'Medical Imaging', minExp: 2, maxExp: 5, salMin: 300000, salMax: 450000, shift: 'General Shift' },
  { title: 'Operation Theatre (OT) Technician', trade: 'OT Technology', industry: 'Surgical Services', minExp: 2, maxExp: 5, salMin: 270000, salMax: 400000, shift: 'Rotational Shifts' },
  { title: 'Hospital Billing & TPA Desk Executive', trade: 'Hospital Admin', industry: 'Healthcare Admin', minExp: 1, maxExp: 4, salMin: 230000, salMax: 340000, shift: 'General Shift' },
  { title: 'Dialysis Unit Technician', trade: 'Dialysis Tech', industry: 'Nephrology Care', minExp: 1, maxExp: 4, salMin: 250000, salMax: 360000, shift: 'Shift System' },
  { title: 'Hospital Ward Attendant & Nursing Aide', trade: 'Patient Care', industry: 'Hospital Services', minExp: 0, maxExp: 3, salMin: 180000, salMax: 250000, shift: 'Rotational Shifts' },
  { title: 'Physiotherapist & Rehabilitation Specialist', trade: 'BPT / MPT', industry: 'Physical Therapy', minExp: 1, maxExp: 5, salMin: 320000, salMax: 480000, shift: 'General Shift' },

  // 61-75: Education, Teaching & Academic Management
  { title: 'Assistant Professor - Mechanical Engineering', trade: 'Academic Teaching', industry: 'Engineering College', minExp: 2, maxExp: 8, salMin: 580000, salMax: 880000, shift: 'General Day Shift' },
  { title: 'High School Physics Teacher (IIT-JEE)', trade: 'Physics Teaching', industry: 'CBSE School', minExp: 2, maxExp: 7, salMin: 400000, salMax: 650000, shift: 'School Hours' },
  { title: 'Mathematics Lecturer (M.Sc / B.Ed)', trade: 'Maths Teaching', industry: 'Junior College', minExp: 2, maxExp: 6, salMin: 360000, salMax: 550000, shift: 'School Hours' },
  { title: 'Chemistry Lab Assistant & Supervisor', trade: 'Chemistry B.Sc', industry: 'Academic Lab', minExp: 1, maxExp: 4, salMin: 210000, salMax: 300000, shift: 'General Shift' },
  { title: 'Primary School English & Social Studies Teacher', trade: 'B.Ed Teacher', industry: 'Primary Education', minExp: 1, maxExp: 5, salMin: 240000, salMax: 360000, shift: 'School Hours' },
  { title: 'Computer Science Lab Instructor', trade: 'BCA / Diploma CS', industry: 'Polytechnic College', minExp: 1, maxExp: 4, salMin: 230000, salMax: 340000, shift: 'General Shift' },
  { title: 'School Administrative Officer & Registrar', trade: 'Academic Admin', industry: 'School Management', minExp: 3, maxExp: 7, salMin: 380000, salMax: 550000, shift: 'General Shift' },

  // 76-100: Hospitality, Retail, Commercial Sales, HR & Accounts
  { title: 'Executive Chef & Kitchen Manager', trade: 'Culinary Arts', industry: '5-Star Hotel', minExp: 5, maxExp: 10, salMin: 680000, salMax: 1050000, shift: 'Split Shift' },
  { title: 'Hotel Front Desk Manager', trade: 'Front Office', industry: 'Luxury Hotel', minExp: 2, maxExp: 6, salMin: 340000, salMax: 500000, shift: 'Rotational Shift' },
  { title: 'Pastry Chef & Bakery Specialist', trade: 'Bakery Arts', industry: 'Artisan Bakery', minExp: 2, maxExp: 6, salMin: 280000, salMax: 420000, shift: 'Early Morning Shift' },
  { title: 'Housekeeping Supervisor', trade: 'Housekeeping', industry: 'Hotel Operations', minExp: 2, maxExp: 5, salMin: 260000, salMax: 380000, shift: 'Rotational Shift' },
  { title: 'Retail Store Manager', trade: 'Retail Management', industry: 'Retail Supermarket', minExp: 3, maxExp: 7, salMin: 400000, salMax: 580000, shift: 'Mall Hours Shift' },
  { title: 'Commercial Billing Counter Cashier', trade: 'Retail Billing', industry: 'Supermarket Retail', minExp: 1, maxExp: 4, salMin: 210000, salMax: 300000, shift: 'Shift System' },
  { title: 'HR Operations & Payroll Executive', trade: 'Human Resources', industry: 'Corporate HR', minExp: 2, maxExp: 5, salMin: 380000, salMax: 560000, shift: 'General Shift' },
  { title: 'Commercial Accountant (Tally Prime & GST)', trade: 'Tally Accounts', industry: 'Accounting Firm', minExp: 2, maxExp: 6, salMin: 300000, salMax: 450000, shift: 'General Shift' },
  { title: 'Commercial Sales & Business Development Exec', trade: 'B2B Sales', industry: 'Industrial Equipment', minExp: 2, maxExp: 6, salMin: 350000, salMax: 550000, shift: 'General Shift' },
  { title: 'Restaurant Captain & Head Steward', trade: 'Food & Beverage', industry: 'Fine Dining Restaurant', minExp: 1, maxExp: 4, salMin: 220000, salMax: 320000, shift: 'Evening Shift' },
  { title: 'Commercial Bank Teller & Cash Officer', trade: 'Banking Ops', industry: 'Commercial Banking', minExp: 2, maxExp: 5, salMin: 360000, salMax: 520000, shift: 'General Shift' },
  { title: 'Auto Showroom Service Advisor', trade: 'Auto Service', industry: 'Car Dealership', minExp: 2, maxExp: 5, salMin: 280000, salMax: 420000, shift: 'General Shift' },
  { title: 'Heavy Truck & Delivery Fleet Driver', trade: 'Heavy Driver', industry: 'Logistics Transport', minExp: 3, maxExp: 9, salMin: 290000, salMax: 430000, shift: 'Trip Basis' },
  { title: 'E-Commerce Delivery Rider', trade: 'Logistics Fleet', industry: 'Last-Mile Delivery', minExp: 0, maxExp: 3, salMin: 180000, salMax: 260000, shift: 'Flexible Shift' },
  { title: 'Customer Telecall & Support Representative', trade: 'BPO Support', industry: 'Customer Care', minExp: 0, maxExp: 3, salMin: 190000, salMax: 280000, shift: 'Day Shift' }
];

// Education requirements mapping
function getEduRequirement(trade: string): string {
  if (trade.includes('ITI') || trade.includes('Machinist') || trade.includes('Welder') || trade.includes('Fitter') || trade.includes('Electrician') || trade.includes('Plastics') || trade.includes('RAC')) {
    return 'ITI Certified (NCVT/SCVT)';
  }
  if (trade.includes('Engineering') || trade.includes('PLC') || trade.includes('Design') || trade.includes('Software') || trade.includes('Mobile') || trade.includes('Cloud')) {
    return 'Bachelor Degree (B.E. / B.Tech)';
  }
  if (trade.includes('Pharma') || trade.includes('DMLT') || trade.includes('Nursing') || trade.includes('Biomedical')) {
    return 'Diploma / Degree in Healthcare';
  }
  if (trade.includes('Teaching') || trade.includes('Maths') || trade.includes('Physics')) {
    return 'Master Degree (M.Sc / M.Tech / B.Ed)';
  }
  if (trade.includes('Driver') || trade.includes('Patient Care') || trade.includes('Delivery')) {
    return '10th / 12th Pass';
  }
  return 'Diploma / Graduate Degree';
}

// Skills generator
function getSkillsArray(title: string, trade: string): string[] {
  const base = [trade, 'Safety Protocols', 'Quality Standard'];
  if (title.includes('CNC') || title.includes('VMC')) return ['CNC Operation', 'VMC 3/4 Axis', 'Fanuc Controls', 'Vernier Caliper', 'Blueprint Reading'];
  if (title.includes('Welder')) return ['TIG Welding', 'MIG Argon', 'Structural Fabrication', 'Weld Inspection', 'Safety Gear'];
  if (title.includes('Electrician') || title.includes('PLC')) return ['Siemens PLC', 'TIA Portal', 'Panel Wiring', 'VFD Drives', 'Multimeter'];
  if (title.includes('Nurse') || title.includes('Hospital')) return ['ICU Patient Care', 'Vitals Monitoring', 'BLS/ACLS', 'Medication Admin', 'NABH Standards'];
  if (title.includes('Full Stack') || title.includes('Web')) return ['React.js', 'Node.js', 'TypeScript', 'PostgreSQL', 'REST APIs'];
  if (title.includes('Mobile') || title.includes('React Native')) return ['React Native', 'TypeScript', 'Expo CLI', 'Redux', 'iOS/Android'];
  if (title.includes('Teaching') || title.includes('Teacher')) return ['Academic Teaching', 'Classroom Mgmt', 'Curriculum Design', 'Student Mentoring', 'Lab Guidance'];
  if (title.includes('Chef') || title.includes('Bakery')) return ['Culinary Arts', 'HACCP Hygiene', 'Menu Planning', 'Baking', 'Food Safety'];
  if (title.includes('Quality') || title.includes('QA')) return ['7 QC Tools', 'QA/QC Audit', 'Micrometer', 'IATF 16949', 'Root Cause Analysis'];
  return [...base, 'Problem Solving', 'Teamwork'];
}

async function seed100SambhajiJobs() {
  console.log('🧹 Clearing old database jobs, applications, and bookmarks...');

  try {
    await pool.query('DELETE FROM job_applications;');
    await pool.query('DELETE FROM saved_jobs;');
    await pool.query('DELETE FROM jobs;');
    console.log('✅ Cleaned up old database tables successfully!');

    let employerRes = await pool.query("SELECT id FROM users WHERE role = 'EMPLOYER' LIMIT 1;");
    let employerId = employerRes.rows[0]?.id;

    if (!employerId) {
      const newEmployer = await pool.query(`
        INSERT INTO users (email, password_hash, name, phone, role, company_name, status)
        VALUES ('employer.chhatrapati@jobmarket.com', '$2b$10$X7WzD.4.O7gD7qMv/xW6U.rN81lKzP3eZ1zQZ.X61W2Z3Y4X5Y6Z7', 'Chhatrapati Sambhajinagar Employer Pool', '9876543210', 'EMPLOYER', 'Industrial & Commercial Recruitment Forum', 'APPROVED')
        RETURNING id;
      `);
      employerId = newEmployer.rows[0].id;
    }

    console.log(`🚀 Generating & Seeding 100 REAL Jobs for Chhatrapati Sambhajinagar across all MIDC zones & sectors...`);

    let insertedCount = 0;

    for (let i = 0; i < 100; i++) {
      insertedCount++;
      const companyObj = SAMBHAJINAGAR_COMPANIES[i % SAMBHAJINAGAR_COMPANIES.length];
      const template = JOB_TEMPLATES[i % JOB_TEMPLATES.length];
      const location = SAMBHAJINAGAR_LOCATIONS[i % SAMBHAJINAGAR_LOCATIONS.length];

      const workMode = template.mode || (i % 5 === 0 ? 'Hybrid' : i % 8 === 0 ? 'Remote' : 'On-site');
      const jobType = i % 7 === 0 ? 'Contract' : i % 12 === 0 ? 'Part-time' : 'Full-time';
      const eduReq = getEduRequirement(template.trade);
      const skills = getSkillsArray(template.title, template.trade);

      const description = `Urgent requirement for ${template.title} at ${companyObj.company} located in ${location}. Great career growth opportunity with attractive monthly salary, overtime benefits, and comprehensive employee welfare facilities.`;

      const responsibilities = [
        `Execute daily duties for ${template.title} as per plant SOP and quality standards.`,
        `Inspect work output, maintain zero safety incidents, and report progress to shift manager.`,
        `Collaborate with cross-functional teams to achieve daily targets.`
      ];

      const requirements = [
        `${eduReq} with ${template.minExp}+ years experience in ${template.industry}.`,
        `Strong technical knowledge in ${template.trade} and relevant tools.`,
        `Good communication and reliability.`
      ];

      const perks = [
        'Subsidized Canteen & Refreshments',
        'Free Transport / Bus Pass',
        'Attendance Bonus & Overtime Pay',
        'Group Medical & PF Insurance'
      ];

      const query = `
        INSERT INTO jobs (
          employer_id, company, company_logo, company_color, title, industry, location,
          trade, midc_zone, shift_details, overtime, accommodation, bus_facility, canteen,
          joining_bonus, attendance_bonus, contract_duration, job_type, work_mode,
          min_experience, max_experience, salary_min, salary_max, openings, filled_openings,
          status, description, responsibilities, requirements, skills, perks, education_requirement, posted_at
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19,
          $20, $21, $22, $23, $24, $25, $26, $27, $28, $29, $30, $31, $32, NOW() - ($33 || ' hours')::interval
        );
      `;

      const values = [
        employerId,
        companyObj.company,
        companyObj.logo,
        companyObj.color,
        template.title,
        template.industry,
        location,
        template.trade,
        location.split(',')[0],
        template.shift,
        true,
        i % 2 === 0,
        true,
        true,
        i % 3 === 0,
        true,
        'Permanent',
        jobType,
        workMode,
        template.minExp,
        template.maxExp,
        template.salMin,
        template.salMax,
        5 + (i % 15),
        1 + (i % 4),
        'APPROVED',
        description,
        JSON.stringify(responsibilities),
        JSON.stringify(requirements),
        JSON.stringify(skills),
        JSON.stringify(perks),
        eduReq,
        (i * 1.5).toFixed(0)
      ];

      await pool.query(query, values);
      if (insertedCount % 10 === 0 || insertedCount === 100) {
        console.log(`[${insertedCount}/100] ✅ Seeded: "${template.title}" @ ${companyObj.company} (${location.split(',')[0]})`);
      }
    }

    console.log('🎉 Successfully seeded 100 REAL jobs for Chhatrapati Sambhajinagar in PostgreSQL database!');
    process.exit(0);
  } catch (err) {
    console.error('❌ Error seeding 100 Sambhajinagar jobs:', err);
    process.exit(1);
  }
}

seed100SambhajiJobs();
