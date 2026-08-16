import { pool } from './config/database/pool';
import { redisClient } from './config/redis';

// 50 Real-world Companies & Employers in Chhatrapati Sambhajinagar (Aurangabad)
const SAMBHAJINAGAR_JOBS_50 = [
  {
    company: 'Bajaj Auto Limited',
    logo: 'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?auto=format&fit=crop&w=250&q=80',
    color: '#D97706',
    title: 'Senior CNC & VMC Machine Operator',
    industry: 'Automotive & Heavy Engineering',
    trade: 'CNC Operator',
    location: 'Waluj MIDC Sector E, Chhatrapati Sambhajinagar, MH 431136',
    midcZone: 'Waluj MIDC',
    lat: 19.8402,
    lng: 75.2458,
    salMin: 280000,
    salMax: 420000,
    minExp: 2,
    maxExp: 6,
    openings: 25,
    shift: 'Rotational 3-Shift System (A / B / C)',
    workMode: 'On-site',
    jobType: 'Full-time',
    eduReq: 'ITI Machinist / Turner (NCVT Certified)',
    skills: ['CNC Operation', 'VMC 3-Axis', 'Fanuc Control', 'Vernier Caliper', 'Micrometer', 'Drawing Reading'],
    perks: ['Subsidized Canteen', 'Company Bus Facility', 'PF & ESIC Benefits', 'Attendance Bonus'],
    desc: 'Hiring experienced CNC & VMC Operators for two-wheeler engine component machining line at Bajaj Auto Plant, Waluj MIDC. Candidate must be skilled in component loading, offset adjustment, and dimension checks using precision instruments.',
    responsibilities: [
      'Operate CNC Turning and VMC machining centers as per standard operating procedure (SOP).',
      'Perform 100% first-off dimension checks using Vernier Caliper, Micrometer, and Bore Gauges.',
      'Maintain daily production log sheet and ensure zero component scrap rate.'
    ],
    requirements: [
      'ITI Machinist / Turner trade pass from Govt or Private ITI.',
      'Minimum 2 years of hands-on experience in high-volume automotive machining plant.',
      'Willingness to work in rotational shift system.'
    ]
  },
  {
    company: 'Endurance Technologies Ltd',
    logo: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=250&q=80',
    color: '#DC2626',
    title: 'High Pressure Die Casting (HPDC) Operator',
    industry: 'Automotive Components',
    trade: 'Die Casting Operator',
    location: 'Shendra DMIC Smart City, Chhatrapati Sambhajinagar, MH 431154',
    midcZone: 'Shendra DMIC',
    lat: 19.8794,
    lng: 75.4851,
    salMin: 300000,
    salMax: 450000,
    minExp: 2,
    maxExp: 5,
    openings: 18,
    shift: 'Rotational 8-Hour Shift',
    workMode: 'On-site',
    jobType: 'Full-time',
    eduReq: 'Diploma / ITI Mechanical',
    skills: ['HPDC Machine', 'Aluminum Casting', 'Molten Metal Handling', 'Die Setup', 'Defect Analysis'],
    perks: ['Canteen Facility', 'Bus Transport', 'Group Health Insurance', 'Overtime Double Rate'],
    desc: 'Urgent opening for High Pressure Die Casting Machine Operators at Endurance Technologies plant in Shendra DMIC. Role involves operating automated casting machines, molten aluminum pouring, die temperature regulation, and visual inspection.',
    responsibilities: [
      'Operate 800T to 1600T automated High Pressure Die Casting machines safely.',
      'Inspect cast aluminum components for cold shuts, porosity, and surface defects.',
      'Coordinate with tool room for die cleaning, spraying, and maintenance.'
    ],
    requirements: [
      'Diploma Mechanical or ITI Fitter with HPDC plant experience.',
      'Proven knowledge of aluminum alloy die casting processes and safety protocols.'
    ]
  },
  {
    company: 'Siemens India Ltd',
    logo: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=250&q=80',
    color: '#0891B2',
    title: 'PLC & Industrial Automation Programmer',
    industry: 'Industrial Automation & Power',
    trade: 'PLC Automation',
    location: 'Waluj MIDC K-Block, Chhatrapati Sambhajinagar, MH 431136',
    midcZone: 'Waluj MIDC',
    lat: 19.8420,
    lng: 75.2410,
    salMin: 550000,
    salMax: 850000,
    minExp: 3,
    maxExp: 7,
    openings: 8,
    shift: 'General Shift (8:30 AM - 5:30 PM)',
    workMode: 'On-site',
    jobType: 'Full-time',
    eduReq: 'B.E. / B.Tech / Diploma in Electrical / Instrumentation',
    skills: ['Siemens S7-1500', 'TIA Portal', 'SCADA WinCC', 'VFD Drives', 'Industrial Networking', 'Control Panel Wiring'],
    perks: ['5-Day Work Week', 'Subsidized Meals', 'Mediclaim Policy', 'Annual Bonus'],
    desc: 'Siemens Industrial Automation division in Waluj MIDC is looking for a PLC & SCADA Engineer. Responsible for programming, commissioning, and troubleshooting Siemens S7 PLC systems, VFD drives, and HMI panels for client industrial projects.',
    responsibilities: [
      'Develop PLC logic using Siemens TIA Portal for automated manufacturing lines.',
      'Design SCADA screens and integrate HMI control interfaces.',
      'Commission electrical control panels on client sites and resolve automation faults.'
    ],
    requirements: [
      'Degree or Diploma in Electrical, Electronics, or Instrumentation Engineering.',
      '3+ years certified experience working on Siemens PLC & SCADA systems.'
    ]
  },
  {
    company: 'Garware Technical Fibres',
    logo: 'https://images.unsplash.com/photo-1581093458791-9f3c3900df4b?auto=format&fit=crop&w=250&q=80',
    color: '#059669',
    title: 'Textile Extrusion Line Operator & Fitter',
    industry: 'Technical Textiles & Polymers',
    trade: 'Extrusion Operator',
    location: 'Chikalthana MIDC Area, Chhatrapati Sambhajinagar, MH 431006',
    midcZone: 'Chikalthana MIDC',
    lat: 19.8776,
    lng: 75.3853,
    salMin: 240000,
    salMax: 350000,
    minExp: 1,
    maxExp: 4,
    openings: 20,
    shift: 'Rotational 3 Shifts',
    workMode: 'On-site',
    jobType: 'Full-time',
    eduReq: 'ITI Maintenance Fitter / CIPET Plastics',
    skills: ['Extrusion Machine', 'Polymer Processing', 'Temperature Control', 'Winder Setup', 'Machine Maintenance'],
    perks: ['Subsidized Canteen', 'Free Bus Pass', 'PF / ESIC', 'Production Incentive'],
    desc: 'Hiring Extrusion Line Operators at Garware Technical Fibres plant, Chikalthana MIDC. Candidates will monitor high-speed polymer filament extrusion lines, control temperature zones, and replace extrusion dies.',
    responsibilities: [
      'Monitor temperature, pressure, and line speed on polymer extrusion lines.',
      'Perform filament threading, bobbin changing, and quality denier testing.',
      'Clean extrusion dies and maintain extruder gearbox lubrication.'
    ],
    requirements: [
      'ITI Fitter or CIPET Plastics diploma holder.',
      '1+ years work experience in plastic or technical textile extrusion manufacturing.'
    ]
  },
  {
    company: 'Varroc Engineering Ltd',
    logo: 'https://images.unsplash.com/photo-1581092335397-9583fe92d232?auto=format&fit=crop&w=250&q=80',
    color: '#2563EB',
    title: 'TIG & MIG Heavy Structural Welder',
    industry: 'Automotive Electrical & Lighting',
    trade: 'Welder',
    location: 'Waluj MIDC Sector 3, Chhatrapati Sambhajinagar, MH 431136',
    midcZone: 'Waluj MIDC',
    lat: 19.8380,
    lng: 75.2480,
    salMin: 270000,
    salMax: 390000,
    minExp: 2,
    maxExp: 6,
    openings: 15,
    shift: 'Day Shift (8:00 AM - 5:00 PM)',
    workMode: 'On-site',
    jobType: 'Full-time',
    eduReq: 'ITI Welder Trade (NCVT)',
    skills: ['MIG Welding (GMAW)', 'TIG Argon Welding', 'CO2 Welding', 'Drawing Reading', 'Grinding & Finishing'],
    perks: ['Overtime Double Rate', 'Canteen Facility', 'Bus Transport', 'Safety Kit Provided'],
    desc: 'Required skilled MIG & TIG Welders for automotive frame and bracket welding at Varroc Engineering, Waluj Plant 3. Must pass 3G/4G weld test during walk-in interview.',
    responsibilities: [
      'Perform MIG and Argon TIG welding on automotive sheet metal assemblies.',
      'Check weld penetration, porosity, and dimensions using weld gauges.',
      'Adhere strictly to personal protective equipment (PPE) safety guidelines.'
    ],
    requirements: [
      'Completed ITI Welder trade certification.',
      '2+ years welding experience in automotive component manufacturing plant.'
    ]
  },
  {
    company: 'Lupin Limited (Pharma Division)',
    logo: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=250&q=80',
    color: '#059669',
    title: 'Pharma Quality Control Chemist (HPLC / GC)',
    industry: 'Pharmaceuticals & Healthcare',
    trade: 'Pharma QC',
    location: 'Chikalthana MIDC Industrial Road, Chhatrapati Sambhajinagar, MH 431006',
    midcZone: 'Chikalthana MIDC',
    lat: 19.8790,
    lng: 75.3890,
    salMin: 380000,
    salMax: 560000,
    minExp: 2,
    maxExp: 5,
    openings: 10,
    shift: 'General Shift (9:00 AM - 6:00 PM)',
    workMode: 'On-site',
    jobType: 'Full-time',
    eduReq: 'M.Sc Chemistry / B.Pharm / M.Pharm',
    skills: ['HPLC Analysis', 'Gas Chromatography (GC)', 'Dissolution Tester', 'GMP Documentation', 'USP / IP Testing'],
    perks: ['Subsidized Meals', 'Mediclaim Policy', 'Annual Performance Bonus', 'Transport Pass'],
    desc: 'Lupin Pharma USFDA approved plant in Chikalthana MIDC is hiring Quality Control Chemists. Candidate will test raw materials, finished pharmaceutical formulations, and active ingredients using HPLC and GC analytical instruments.',
    responsibilities: [
      'Perform routine assay, impurity profiling, and dissolution testing of oral solid dosage batches.',
      'Operate Waters HPLC, Agilent GC, and UV-Vis Spectrophotometer instruments.',
      'Maintain cGMP compliant laboratory analytical records and instrument logbooks.'
    ],
    requirements: [
      'M.Sc Chemistry or B.Pharm graduate.',
      'Minimum 2 years experience in USFDA / MHRA approved pharmaceutical QC laboratory.'
    ]
  },
  {
    company: 'Ajanta Pharma Ltd',
    logo: 'https://images.unsplash.com/photo-1532938911079-1b06ac7ceec7?auto=format&fit=crop&w=250&q=80',
    color: '#BE185D',
    title: 'Pharma Production & Formulation Operator',
    industry: 'Pharmaceutical Formulations',
    trade: 'Pharma Production',
    location: 'Paithan MIDC Industrial Zone, Chhatrapati Sambhajinagar, MH 431148',
    midcZone: 'Paithan MIDC',
    lat: 19.4815,
    lng: 75.3820,
    salMin: 280000,
    salMax: 400000,
    minExp: 2,
    maxExp: 5,
    openings: 14,
    shift: 'Rotational 3-Shift',
    workMode: 'On-site',
    jobType: 'Full-time',
    eduReq: 'D.Pharm / B.Sc Chemistry / ITI',
    skills: ['Tablet Compression', 'FBD Granulation', 'Coating Machine', 'Batch Manufacturing Record (BMR)', 'cGMP Compliance'],
    perks: ['Company Bus Service', 'Subsidized Canteen', 'Provident Fund', 'ESIC Coverage'],
    desc: 'Ajanta Pharma formulation unit at Paithan MIDC requires Tablet Compression & Granulation Operators. Responsible for operating high-speed tablet compression machines and fluid bed dryers while strictly following BMR protocols.',
    responsibilities: [
      'Operate Fette / Sejong tablet compression machines and FBD granulation equipment.',
      'Fill and record batch manufacturing parameters accurately in BMR documents.',
      'Perform in-process checks including friability, hardness, weight variation, and disintegration.'
    ],
    requirements: [
      'D.Pharm or B.Sc Chemistry or ITI certified operator.',
      '2+ years tablet manufacturing experience in WHO-GMP certified pharma unit.'
    ]
  },
  {
    company: 'Perkins Engines India',
    logo: 'https://images.unsplash.com/photo-1581092580497-e0d23cbdf1dc?auto=format&fit=crop&w=250&q=80',
    color: '#B91C1C',
    title: 'Heavy Diesel Engine Assembly Specialist',
    industry: 'Heavy Machinery & Generators',
    trade: 'Engine Assembly',
    location: 'Shendra DMIC Smart City, Chhatrapati Sambhajinagar, MH 431154',
    midcZone: 'Shendra DMIC',
    lat: 19.8820,
    lng: 75.4880,
    salMin: 320000,
    salMax: 480000,
    minExp: 2,
    maxExp: 6,
    openings: 12,
    shift: 'Day Shift (8:00 AM - 5:00 PM)',
    workMode: 'On-site',
    jobType: 'Full-time',
    eduReq: 'ITI Diesel Mechanic / Automobile Engineer',
    skills: ['Diesel Engine Assembly', 'Torque Wrenching', 'Cylinder Head Fitting', 'Engine Testing', 'Piston Assembly'],
    perks: ['Subsidized Meals', 'Free Transport', 'Medical Health Insurance', 'Annual Incentive'],
    desc: 'Perkins Engines (Caterpillar Group) state-of-the-art plant at Shendra DMIC Smart City is hiring Diesel Engine Assemblers. Candidate will assemble heavy industrial generator diesel engines on an automated conveyor line.',
    responsibilities: [
      'Assemble engine blocks, crankshafts, pistons, fuel injection pumps, and turbochargers.',
      'Use pneumatic torque wrenches to tighten critical engine head bolts to specified Nm values.',
      'Conduct static engine leak testing and dyno test bed preparation.'
    ],
    requirements: [
      'ITI Diesel Mechanic or Diploma in Automobile Engineering.',
      '2+ years assembly experience in diesel engine, tractor, or commercial vehicle manufacturing.'
    ]
  },
  {
    company: 'Sterlite Technologies (STL)',
    logo: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=250&q=80',
    color: '#1D4ED8',
    title: 'Optical Fiber Cable Manufacturing Technician',
    industry: 'Telecom & Fiber Optics',
    trade: 'Fiber Optics Tech',
    location: 'Waluj MIDC Sector 2, Chhatrapati Sambhajinagar, MH 431136',
    midcZone: 'Waluj MIDC',
    lat: 19.8350,
    lng: 75.2510,
    salMin: 260000,
    salMax: 380000,
    minExp: 1,
    maxExp: 4,
    openings: 22,
    shift: 'Rotational 3-Shift',
    workMode: 'On-site',
    jobType: 'Full-time',
    eduReq: 'Diploma Electrical / ITI Wireman',
    skills: ['Optical Fiber Splicing', 'Fiber Coloring', 'OTDR Testing', 'Cable Jacketing', 'Cleanroom SOP'],
    perks: ['Subsidized Meals', 'Transport Pass', 'ESIC & PF', 'Skill Allowance'],
    desc: 'Sterlite Technologies (STL) optical fiber manufacturing facility in Waluj MIDC is hiring Plant Technicians for fiber coloring, buffering, and cable jacketing lines.',
    responsibilities: [
      'Operate high-speed fiber buffering and extruding production machines.',
      'Conduct optical attenuation testing using OTDR (Optical Time Domain Reflectometer).',
      'Maintain cleanroom standards and handle delicate glass fiber spools.'
    ],
    requirements: [
      'Diploma Electrical or Electronics, or ITI Electrician/Wireman.',
      '1+ years technical manufacturing experience.'
    ]
  },
  {
    company: 'Grind Master Machines',
    logo: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=250&q=80',
    color: '#7C2D12',
    title: 'Robotic Automation & Grinding Machine Fitter',
    industry: 'Industrial Robotics & Metal Finishing',
    trade: 'Robotics Fitter',
    location: 'Railway Station MIDC, Chhatrapati Sambhajinagar, MH 431005',
    midcZone: 'Railway Station MIDC',
    lat: 19.8580,
    lng: 75.3120,
    salMin: 350000,
    salMax: 520000,
    minExp: 2,
    maxExp: 6,
    openings: 10,
    shift: 'General Shift (8:30 AM - 5:30 PM)',
    workMode: 'On-site',
    jobType: 'Full-time',
    eduReq: 'ITI Mechanical Fitter / Diploma Mechanical',
    skills: ['Robotic Cell Assembly', 'FANUC / ABB Robot', 'Precision Machine Fitting', 'Hydraulics & Pneumatics', 'Alignment'],
    perks: ['Canteen Facility', 'Uniform & Shoes', 'Mediclaim', 'Performance Bonus'],
    desc: 'Grind Master Machines, global leader in metal finishing robotics, is hiring Machine Assembly Fitters at Railway Station MIDC plant. Position involves mechanical assembly of custom robotic deburring and superfinishing machines.',
    responsibilities: [
      'Assemble precision linear guides, ball screws, robot grippers, and grinding spindles.',
      'Align machine structures using dial indicators and laser precision tools.',
      'Assist automation engineers during pre-dispatch customer trial runs.'
    ],
    requirements: [
      'ITI Fitter or Diploma Mechanical Engineer.',
      '2+ years hands-on experience assembling special purpose machines (SPM) or robotics.'
    ]
  },
  {
    company: 'Cosmo First Limited',
    logo: 'https://images.unsplash.com/photo-1581092795360-fd1ca04f0952?auto=format&fit=crop&w=250&q=80',
    color: '#0284C7',
    title: 'BOPP Film Extrusion Machine Operator',
    industry: 'Packaging Films & Polymers',
    trade: 'Film Extrusion',
    location: 'Waluj MIDC Sector 1, Chhatrapati Sambhajinagar, MH 431136',
    midcZone: 'Waluj MIDC',
    lat: 19.8450,
    lng: 75.2400,
    salMin: 280000,
    salMax: 420000,
    minExp: 2,
    maxExp: 5,
    openings: 16,
    shift: 'Rotational 3-Shift System',
    workMode: 'On-site',
    jobType: 'Full-time',
    eduReq: 'CIPET Diploma / ITI Maintenance Fitter',
    skills: ['BOPP Extrusion', 'Thickness Gauge Control', 'Corona Treater', 'Slitter Rewinder', 'Polymer Resins'],
    perks: ['Subsidized Meals', 'Bus Pass', 'Medical & PF', 'Night Shift Allowance'],
    desc: 'Cosmo First (formerly Cosmo Films) Waluj plant is hiring BOPP Film Extrusion Line Operators. Role requires operating wide-width biaxially oriented polypropylene film extrusion lines.',
    responsibilities: [
      'Control melt temperature, extruder speed, and casting roll chillers.',
      'Monitor online thickness profile gauge and adjust die bolts accordingly.',
      'Perform slitter machine roll changes and package finished film rolls.'
    ],
    requirements: [
      'CIPET Diploma or ITI Mechanical/Fitter qualification.',
      '2+ years experience in BOPP, BOPET, or blown film extrusion plant.'
    ]
  },
  {
    company: 'Sanjeev Auto Parts',
    logo: 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=250&q=80',
    color: '#D97706',
    title: 'Forging Press & Heat Treatment Supervisor',
    industry: 'Auto Components Forging',
    trade: 'Forging Supervisor',
    location: 'Chittegaon MIDC Auto Hub, Chhatrapati Sambhajinagar, MH 431105',
    midcZone: 'Chittegaon MIDC',
    lat: 19.7820,
    lng: 75.3640,
    salMin: 360000,
    salMax: 540000,
    minExp: 3,
    maxExp: 7,
    openings: 8,
    shift: 'Rotational Shifts',
    workMode: 'On-site',
    jobType: 'Full-time',
    eduReq: 'Diploma Mechanical / Metallurgy',
    skills: ['Hot Forging Press', 'Induction Billet Heater', 'Heat Treatment (Quench/Temper)', 'Metallurgy Inspection', '5S & Kaizen'],
    perks: ['Subsidized Canteen', 'Bus Facility', 'PF & ESIC', 'Production Bonus'],
    desc: 'Urgent requirement for Forging Press Supervisor at Sanjeev Auto Parts, Chittegaon MIDC. Responsibilities include supervising closed-die hot forging lines, induction billet heating furnaces, and heat treatment operations for automotive gears and shafts.',
    responsibilities: [
      'Manage daily production on 1000T - 2500T hot forging mechanical presses.',
      'Monitor induction billet furnace temperatures and heat treatment cycle parameters.',
      'Conduct grain flow analysis and hardness testing on forged automotive components.'
    ],
    requirements: [
      'Diploma in Mechanical or Metallurgy Engineering.',
      '3+ years experience supervising hot forging press shop operations.'
    ]
  },
  {
    company: 'Wockhardt Hospitals',
    logo: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=250&q=80',
    color: '#BE185D',
    title: 'Senior ICU & Critical Care Staff Nurse',
    industry: 'Healthcare & Super-specialty Hospital',
    trade: 'Staff Nurse',
    location: 'Nageshwarwadi Adalat Road, Chhatrapati Sambhajinagar, MH 431001',
    midcZone: 'Nageshwarwadi',
    lat: 19.8760,
    lng: 75.3280,
    salMin: 320000,
    salMax: 480000,
    minExp: 2,
    maxExp: 6,
    openings: 15,
    shift: 'Rotational Hospital Shift (Morning / Evening / Night)',
    workMode: 'On-site',
    jobType: 'Full-time',
    eduReq: 'B.Sc Nursing / GNM (MNC Registered)',
    skills: ['ICU Nursing', 'Ventilator Care', 'Patient Monitoring', 'ACLS/BLS Certified', 'NABH Documentation'],
    perks: ['Subsidized Staff Meals', 'Medical Insurance', 'Uniform Allowance', 'Annual Bonus'],
    desc: 'Wockhardt Super-specialty Hospital at Nageshwarwadi is hiring MNC-registered ICU Staff Nurses. Position involves monitoring critically ill patients in Cardiac ICU and Surgical ICU units.',
    responsibilities: [
      'Deliver direct nursing care to critical ICU patients including mechanical ventilation care.',
      'Administer intravenous medications, blood products, and record vital signs accurately.',
      'Maintain NABH hospital accreditation documentation and nursing handovers.'
    ],
    requirements: [
      'B.Sc Nursing or GNM with active Maharashtra Nursing Council (MNC) registration.',
      'Minimum 2 years experience in multi-bed ICU of NABH accredited hospital.'
    ]
  },
  {
    company: 'MGM Medical College & Hospital',
    logo: 'https://images.unsplash.com/photo-1532938911079-1b06ac7ceec7?auto=format&fit=crop&w=250&q=80',
    color: '#0284C7',
    title: 'Pathology DMLT Laboratory Technician',
    industry: 'Healthcare & Medical Education',
    trade: 'Lab Technician',
    location: 'Seven Hills, Jalna Road, Chhatrapati Sambhajinagar, MH 431003',
    midcZone: 'Seven Hills',
    lat: 19.8630,
    lng: 75.3480,
    salMin: 240000,
    salMax: 360000,
    minExp: 1,
    maxExp: 4,
    openings: 12,
    shift: 'General / Morning Shift',
    workMode: 'On-site',
    jobType: 'Full-time',
    eduReq: 'DMLT / B.Sc Medical Lab Technology (BMLT)',
    skills: ['Hematology Analyzer', 'Biochemistry Testing', 'Blood Sample Collection', 'Microbiology Culture', 'LIMS Software'],
    perks: ['Staff Health Benefits', 'PF & ESIC', 'Subsidized Canteen', 'Paid Leaves'],
    desc: 'MGM Medical College & Hospital at Seven Hills is recruiting DMLT Pathological Lab Technicians. Role includes blood sample collection, running automated biochemistry analyzers, and preparing pathology reports.',
    responsibilities: [
      'Collect venous blood samples from OPD and IPD patients following aseptic techniques.',
      'Operate automated hematology, biochemistry, and immunoassay analyzers.',
      'Verify test result quality controls and upload findings to Hospital LIMS software.'
    ],
    requirements: [
      'DMLT or BMLT degree from recognized institution.',
      '1+ years clinical pathology lab experience.'
    ]
  },
  {
    company: 'Seth Nandlal Dhoot Hospital',
    logo: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=250&q=80',
    color: '#047857',
    title: 'Clinical Pharmacist (Hospital Pharmacy)',
    industry: 'Hospital & Healthcare',
    trade: 'Pharmacist',
    location: 'Chikalthana MIDC Road, Chhatrapati Sambhajinagar, MH 431006',
    midcZone: 'Chikalthana MIDC',
    lat: 19.8780,
    lng: 75.3820,
    salMin: 260000,
    salMax: 380000,
    minExp: 1,
    maxExp: 5,
    openings: 10,
    shift: 'Rotational Hospital Shift',
    workMode: 'On-site',
    jobType: 'Full-time',
    eduReq: 'D.Pharm / B.Pharm (Registered Pharmacist)',
    skills: ['Drug Dispensing', 'Pharmacy Billing Software', 'Stock Audit', 'Cold Chain Storage', 'Drug Interaction Check'],
    perks: ['Medical Insurance', 'Subsidized Meals', 'PF & ESIC', 'Uniform Provided'],
    desc: 'Seth Nandlal Dhoot Hospital is hiring Registered Pharmacists for indoor and outdoor hospital pharmacy counters. Candidate will dispense prescription medicines, verify dosages, and manage hospital pharmacy inventory.',
    responsibilities: [
      'Dispense prescription drugs accurately to indoor and outdoor patients.',
      'Maintain narcotic drug registers, cold chain vaccine storage, and stock expiry audits.',
      'Operate pharmacy management billing software and explain dosage instructions to patients.'
    ],
    requirements: [
      'D.Pharm or B.Pharm with valid Maharashtra State Pharmacy Council (MSPC) license.',
      '1+ years hospital or retail pharmacy experience.'
    ]
  },
  {
    company: 'Apollo Pharmacy',
    logo: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=250&q=80',
    color: '#059669',
    title: 'Retail Medical Store Executive Pharmacist',
    industry: 'Retail Healthcare & Pharmacy',
    trade: 'Retail Pharmacist',
    location: 'Kranti Chowk Commercial Hub, Chhatrapati Sambhajinagar, MH 431001',
    midcZone: 'Kranti Chowk',
    lat: 19.8720,
    lng: 75.3260,
    salMin: 220000,
    salMax: 320000,
    minExp: 1,
    maxExp: 4,
    openings: 15,
    shift: 'Shift System (8 AM - 4 PM / 2 PM - 10 PM)',
    workMode: 'On-site',
    jobType: 'Full-time',
    eduReq: 'D.Pharm / B.Pharm',
    skills: ['Retail Billing', 'Customer Service', 'Medicine Storage', 'POS Computer', 'Inventory Control'],
    perks: ['Incentive Bonus', 'ESI / PF Benefits', 'Staff Discount', 'Growth Pathway'],
    desc: 'Apollo Pharmacy is expanding in Chhatrapati Sambhajinagar and hiring Retail Pharmacists for Kranti Chowk and CIDCO branches. Responsible for customer billing, OTC medicine sales, and inventory management.',
    responsibilities: [
      'Read doctor prescriptions correctly and dispense OTC/prescription medicines.',
      'Maintain POS inventory levels, reorder low stock, and handle cash counter.',
      'Provide basic patient advice regarding medicine timing and dosage instructions.'
    ],
    requirements: [
      'D.Pharm or B.Pharm degree holder with valid MSPC registration card.'
    ]
  },
  {
    company: 'Vivanta Taj Hotel',
    logo: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=250&q=80',
    color: '#9A3412',
    title: 'Executive Chef & Kitchen Production Head',
    industry: 'Luxury Hospitality & Fine Dining',
    trade: 'Executive Chef',
    location: 'Jalna Road Commercial Strip, Chhatrapati Sambhajinagar, MH 431003',
    midcZone: 'Jalna Road',
    lat: 19.8750,
    lng: 75.3520,
    salMin: 700000,
    salMax: 1100000,
    minExp: 5,
    maxExp: 10,
    openings: 2,
    shift: 'Split Shift (Hotel Duty)',
    workMode: 'On-site',
    jobType: 'Full-time',
    eduReq: 'Degree / Diploma in Hotel Management & Culinary Arts',
    skills: ['Multi-Cuisine Cooking', 'Menu Design', 'Food Safety HACCP', 'Kitchen Staff Leadership', 'Food Costing'],
    perks: ['Duty Meals Provided', 'Luxury Accommodation Allowance', 'Health Insurance', 'Annual Bonus'],
    desc: 'Vivanta by Taj Hotel, Chhatrapati Sambhajinagar is looking for an Executive Chef to head multi-cuisine kitchen operations. Role oversees Indian, Continental, and Asian dining outlets, banquet catering, and kitchen hygiene compliance.',
    responsibilities: [
      'Lead culinary operations across hotel dining restaurants and banquet halls.',
      'Design seasonal menus, calculate food portion costs, and maintain HACCP food hygiene standards.',
      'Train junior chefs, commis cooks, and manage kitchen supply procurement.'
    ],
    requirements: [
      'Degree or Diploma in Hotel Management from recognized NCHMCT institute.',
      '5+ years culinary leadership experience in 4-star or 5-star hotel.'
    ]
  },
  {
    company: 'Radisson Blu Hotel',
    logo: 'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?auto=format&fit=crop&w=250&q=80',
    color: '#2563EB',
    title: 'Front Office & Guest Reception Manager',
    industry: 'Hospitality & Hotel Operations',
    trade: 'Front Office Manager',
    location: 'Airport Road, CIDCO Town Center, Chhatrapati Sambhajinagar, MH 431003',
    midcZone: 'CIDCO Town Center',
    lat: 19.8690,
    lng: 75.3780,
    salMin: 360000,
    salMax: 540000,
    minExp: 2,
    maxExp: 6,
    openings: 5,
    shift: 'Rotational Hotel Shift',
    workMode: 'On-site',
    jobType: 'Full-time',
    eduReq: 'BHM / B.Sc Hotel Management',
    skills: ['Opera PMS Software', 'Guest Check-in', 'English & Hindi Fluency', 'Concierge Service', 'Billing Audit'],
    perks: ['Duty Meals Provided', 'Uniform Laundry', 'Medical Benefits', 'Incentives'],
    desc: 'Radisson Blu Hotel Airport Road CIDCO is hiring Front Office Executive & Duty Managers. Responsibilities include managing guest check-in/check-out, room allocation, handling VIP guests, and using Opera PMS software.',
    responsibilities: [
      'Welcome hotel guests, process check-ins/check-outs, and assign guest rooms.',
      'Resolve guest queries promptly with polite, 5-star professional hospitality standards.',
      'Manage front desk cash settlement, room reservations, and telephone inquiries.'
    ],
    requirements: [
      'Graduate in Hotel Management (BHM).',
      '2+ years front desk experience in branded business hotel with Opera PMS knowledge.'
    ]
  },
  {
    company: 'Prozone Mall Retail',
    logo: 'https://images.unsplash.com/photo-1567401893414-76b7b1e5a7a5?auto=format&fit=crop&w=250&q=80',
    color: '#C2410C',
    title: 'Retail Store Manager & Floor Supervisor',
    industry: 'Retail Mall & Fashion Apparel',
    trade: 'Store Manager',
    location: 'API Corner, CIDCO Prozone Mall, Chhatrapati Sambhajinagar, MH 431003',
    midcZone: 'CIDCO API Corner',
    lat: 19.8740,
    lng: 75.3620,
    salMin: 380000,
    salMax: 580000,
    minExp: 3,
    maxExp: 7,
    openings: 6,
    shift: 'Mall Shift System (10:00 AM - 9:30 PM)',
    workMode: 'On-site',
    jobType: 'Full-time',
    eduReq: 'Graduate (Any Stream) / MBA Marketing',
    skills: ['Retail Store Ops', 'Visual Merchandising', 'POS Sales Software', 'Inventory Stock Count', 'Staff Management'],
    perks: ['Monthly Sales Commission', 'Staff Discount Card', 'PF / ESIC', 'Annual Increment'],
    desc: 'Leading fashion retail brand inside Prozone Mall CIDCO is hiring Store Managers. Position is responsible for daily retail shop floor operations, driving sales targets, visual display setup, and customer service.',
    responsibilities: [
      'Drive monthly retail sales targets and analyze weekly footfall conversion ratios.',
      'Supervise store sales staff, manage duty rosters, and maintain visual merchandising guidelines.',
      'Oversee inventory inward/outward stock counts, POS cash registers, and shrinkage control.'
    ],
    requirements: [
      'Bachelor degree holder.',
      '3+ years retail store operations experience in shopping mall environment.'
    ]
  },
  {
    company: 'D-Mart Avenue Supermarts',
    logo: 'https://images.unsplash.com/photo-1567401893414-76b7b1e5a7a5?auto=format&fit=crop&w=250&q=80',
    color: '#059669',
    title: 'Supermarket Billing Cashier & Floor Associate',
    industry: 'Retail Supermarket & FMCG',
    trade: 'Retail Cashier',
    location: 'Cannaught Place, CIDCO, Chhatrapati Sambhajinagar, MH 431003',
    midcZone: 'Cannaught Place CIDCO',
    lat: 19.8730,
    lng: 75.3590,
    salMin: 200000,
    salMax: 290000,
    minExp: 0,
    maxExp: 3,
    openings: 30,
    shift: 'Shift System (7 AM - 3 PM / 2 PM - 10 PM)',
    workMode: 'On-site',
    jobType: 'Full-time',
    eduReq: '12th Pass / Any Graduate',
    skills: ['Barcode Scanning', 'Cash Handling', 'POS Computer', 'Customer Courtesy', 'Shelf Stocking'],
    perks: ['Attendance Bonus', 'Overtime Allowance', 'ESI & PF', 'Staff Uniform Provided'],
    desc: 'D-Mart Avenue Supermarts is hiring Billing Counter Cashiers and Floor Associates for CIDCO Cannaught Place store. Freshers with 12th pass education are welcome to apply.',
    responsibilities: [
      'Operate barcode scanning POS counter quickly and process customer payments accurately.',
      'Assist customers in locating grocery items on hypermarket shelves.',
      'Restock merchandise on display racks and maintain shelf price tags.'
    ],
    requirements: [
      'Passed 12th standard or graduation.',
      'Basic numerical ability and willingness to work flexible supermarket shifts.'
    ]
  },
  {
    company: 'MIT Group of Institutions',
    logo: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&w=250&q=80',
    color: '#7C3AED',
    title: 'Assistant Professor (Mechanical Engineering)',
    industry: 'Higher Education & Academic Research',
    trade: 'Assistant Professor',
    location: 'Beed Bypass Road Campus, Chhatrapati Sambhajinagar, MH 431010',
    midcZone: 'Beed Bypass Road',
    lat: 19.8550,
    lng: 75.3420,
    salMin: 600000,
    salMax: 900000,
    minExp: 2,
    maxExp: 8,
    openings: 4,
    shift: 'General College Hours (9:00 AM - 5:00 PM)',
    workMode: 'On-site',
    jobType: 'Full-time',
    eduReq: 'M.Tech / Ph.D in Mechanical Engineering (First Class)',
    skills: ['CAD/CAM Teaching', 'Thermodynamics', 'Lab Mentoring', 'Research Publications', 'NBA/NAAC Documentation'],
    perks: ['5-Day Work Week', 'Research Grant Support', 'PF & Gratuity', 'Vacation Leaves'],
    desc: 'MIT Engineering College, Beed Bypass Campus invites applications for Assistant Professor in Mechanical Engineering. Candidate will deliver lectures in CAD/CAM, Thermal Engineering, supervise B.Tech student projects, and guide practical labs.',
    responsibilities: [
      'Conduct undergraduate lectures and lab practicals in Mechanical Engineering subjects.',
      'Guide B.Tech final year student major research projects and industrial internships.',
      'Participate in NBA/NAAC accreditation document preparation and departmental committees.'
    ],
    requirements: [
      'M.Tech or Ph.D in Mechanical Engineering from AICTE recognized university.',
      'Minimum 2 years teaching or industrial research experience.'
    ]
  },
  {
    company: 'Deogiri Institute of Technology',
    logo: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&w=250&q=80',
    color: '#1D4ED8',
    title: 'Computer Science Lab Instructor & Network Tech',
    industry: 'Engineering & Diploma Education',
    trade: 'Lab Instructor',
    location: 'Station Road Academic Hub, Chhatrapati Sambhajinagar, MH 431005',
    midcZone: 'Station Road',
    lat: 19.8650,
    lng: 75.3150,
    salMin: 240000,
    salMax: 360000,
    minExp: 1,
    maxExp: 4,
    openings: 6,
    shift: 'College Hours (8:30 AM - 4:30 PM)',
    workMode: 'On-site',
    jobType: 'Full-time',
    eduReq: 'BCA / B.Sc Computer Science / Diploma CS',
    skills: ['C++ / Java Lab Guidance', 'Linux & Windows Setup', 'PC Hardware Maintenance', 'LAN Networking', 'Lab Inventory'],
    perks: ['Subsidized Canteen', 'PF & Gratuity', 'College Holidays', 'Health Insurance'],
    desc: 'Deogiri Institute of Technology at Station Road is recruiting Computer Science Lab Instructors. Position oversees programming computer labs, assisting students during practical sessions, and maintaining hardware/software setups.',
    responsibilities: [
      'Configure student desktop PCs with Linux, Windows, C++, Python, and MySQL software.',
      'Guide diploma and degree students during computer programming practical lab sessions.',
      'Maintain computer lab hardware inventory, LAN switches, and internet network switches.'
    ],
    requirements: [
      'BCA, B.Sc CS, or Diploma in Computer Engineering.',
      '1+ years experience in computer hardware, networking, or educational lab instruction.'
    ]
  },
  {
    company: 'Software Technology Parks of India (STPI)',
    logo: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=250&q=80',
    color: '#1D4ED8',
    title: 'Full Stack Web Developer (Node.js & React)',
    industry: 'IT & Software Development',
    trade: 'Full Stack Developer',
    location: 'Chikalthana STPI IT Park, Chhatrapati Sambhajinagar, MH 431006',
    midcZone: 'Chikalthana STPI',
    lat: 19.8810,
    lng: 75.3910,
    salMin: 750000,
    salMax: 1200000,
    minExp: 3,
    maxExp: 7,
    openings: 8,
    shift: 'General IT Shift (9:30 AM - 6:30 PM)',
    workMode: 'Hybrid',
    jobType: 'Full-time',
    eduReq: 'B.E. / B.Tech CS / MCA / BCA',
    skills: ['React.js', 'Node.js', 'TypeScript', 'PostgreSQL', 'RESTful APIs', 'Docker', 'Git'],
    perks: ['Hybrid Work Model', '5-Day Work Week', 'Health Insurance Policy', 'Annual Performance Bonus'],
    desc: 'Software company operating inside STPI IT Park Chikalthana is hiring Full Stack Web Developers. Role involves developing responsive web applications, REST APIs, and database models using Node.js, React, TypeScript, and PostgreSQL.',
    responsibilities: [
      'Build scalable backend web services using Node.js, Express, and PostgreSQL microservices.',
      'Develop modern responsive frontend interfaces in React.js with TypeScript and Tailwind CSS.',
      'Write clean, well-tested code and collaborate using Git version control and Docker.'
    ],
    requirements: [
      'B.E./B.Tech in Computer Science or MCA.',
      '3+ years hands-on production experience in Node.js & React stack development.'
    ]
  },
  {
    company: 'STPI IT Park Software Unit',
    logo: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=250&q=80',
    color: '#0284C7',
    title: 'Senior React Native Mobile App Engineer',
    industry: 'Mobile Software Engineering',
    trade: 'Mobile App Developer',
    location: 'Chikalthana STPI IT Park, Chhatrapati Sambhajinagar, MH 431006',
    midcZone: 'Chikalthana STPI',
    lat: 19.8810,
    lng: 75.3910,
    salMin: 850000,
    salMax: 1400000,
    minExp: 3,
    maxExp: 7,
    openings: 6,
    shift: 'General Shift',
    workMode: 'Hybrid',
    jobType: 'Full-time',
    eduReq: 'B.E. / B.Tech CS / MCA',
    skills: ['React Native', 'TypeScript', 'Redux Toolkit', 'Expo CLI', 'iOS / Android Publishing', 'REST APIs'],
    perks: ['Flexible Hours', '5-Day Work Week', 'Health Insurance', 'Latest Mac/Laptop Provided'],
    desc: 'Mobile product team at STPI IT Park Chikalthana is recruiting Senior React Native Engineers. Candidate will architect cross-platform iOS & Android mobile apps for enterprise logistics and hiring marketplaces.',
    responsibilities: [
      'Develop native-performing Android & iOS apps using React Native, Expo, and TypeScript.',
      'Integrate REST APIs, push notifications, offline storage, and interactive map UI views.',
      'Publish app updates to Google Play Store and Apple App Store.'
    ],
    requirements: [
      'B.E. CS / MCA or equivalent degree.',
      '3+ years active experience building commercial React Native mobile apps.'
    ]
  },
  {
    company: 'AURIC Smart City Infrastructure',
    logo: 'https://images.unsplash.com/photo-1581092580497-e0d23cbdf1dc?auto=format&fit=crop&w=250&q=80',
    color: '#0891B2',
    title: 'Industrial Smart Grid Electrical Maintenance Engineer',
    industry: 'Smart Infrastructure & Utilities',
    trade: 'Electrical Engineer',
    location: 'Bidkin DMIC Industrial Node (AURIC), Chhatrapati Sambhajinagar, MH 431105',
    midcZone: 'Bidkin DMIC Node',
    lat: 19.6710,
    lng: 75.3100,
    salMin: 450000,
    salMax: 680000,
    minExp: 3,
    maxExp: 7,
    openings: 5,
    shift: 'General Shift (8:30 AM - 5:30 PM)',
    workMode: 'On-site',
    jobType: 'Full-time',
    eduReq: 'B.E. Electrical / Diploma Electrical',
    skills: ['HT/LT Electrical Substation', '33kV Switchgear', 'Transformer Maintenance', 'SCADA Metering', 'Electrical Safety'],
    perks: ['Company Bus Service', 'Subsidized Canteen', 'Provident Fund', 'Mediclaim'],
    desc: 'AURIC Smart City Industrial Node at Bidkin is hiring Electrical Maintenance Engineers. Responsible for operating 33kV/11kV electrical substations, smart underground cabling, and SCADA power distribution networks.',
    responsibilities: [
      'Supervise preventive maintenance of 33kV/11kV transformers, SF6 breakers, and HT switchgears.',
      'Monitor SCADA smart energy meters and investigate electrical tripping incidents.',
      'Ensure 100% adherence to Maharashtra State Electricity Board safety regulations.'
    ],
    requirements: [
      'B.E. or Diploma in Electrical Engineering with Electrical Supervisor License.',
      '3+ years experience in HT substation maintenance or industrial power distribution.'
    ]
  },
  {
    company: 'Goodyear South Asia Tyres',
    logo: 'https://images.unsplash.com/photo-1581092335397-9583fe92d232?auto=format&fit=crop&w=250&q=80',
    color: '#D97706',
    title: 'Tyre Vulcanization Press & Rubber Operator',
    industry: 'Tyre Manufacturing & Rubber',
    trade: 'Vulcanization Operator',
    location: 'Waluj MIDC Sector 2, Chhatrapati Sambhajinagar, MH 431136',
    midcZone: 'Waluj MIDC',
    lat: 19.8390,
    lng: 75.2470,
    salMin: 250000,
    salMax: 360000,
    minExp: 1,
    maxExp: 5,
    openings: 20,
    shift: 'Rotational 3-Shift',
    workMode: 'On-site',
    jobType: 'Full-time',
    eduReq: 'ITI Fitter / Rubber Tech / 12th Pass',
    skills: ['Curing Press', 'Tyre Vulcanization', 'Rubber Compound', 'Steam Pressure Check', 'Quality Inspection'],
    perks: ['Subsidized Canteen', 'Bus Facility', 'PF & ESIC', 'Overtime Bonus'],
    desc: 'Goodyear South Asia Tyres plant at Waluj MIDC is hiring Curing Press Operators. Role involves loading green tyres into steam-heated curing presses, monitoring curing timers, and inspecting finished tyres.',
    responsibilities: [
      'Operate automated hydraulic tyre curing vulcanization presses.',
      'Check steam pressure, curing cycle temperature, and bladder condition.',
      'Inspect cured passenger car and truck tyres for tread mold defects.'
    ],
    requirements: [
      'ITI trade certificate or 12th Pass with rubber plant experience.',
      'Physical fitness to work in industrial manufacturing environment.'
    ]
  },
  {
    company: 'Reliance Trends Retail',
    logo: 'https://images.unsplash.com/photo-1567401893414-76b7b1e5a7a5?auto=format&fit=crop&w=250&q=80',
    color: '#B91C1C',
    title: 'Retail Sales Executive & Billing Staff',
    industry: 'Fashion Apparel & Retail',
    trade: 'Sales Executive',
    location: 'Nirala Bazar Commercial Belt, Chhatrapati Sambhajinagar, MH 431001',
    midcZone: 'Nirala Bazar',
    lat: 19.8770,
    lng: 75.3200,
    salMin: 190000,
    salMax: 270000,
    minExp: 0,
    maxExp: 3,
    openings: 25,
    shift: 'Shift System (10:00 AM - 8:30 PM)',
    workMode: 'On-site',
    jobType: 'Full-time',
    eduReq: '12th Pass / Graduate',
    skills: ['Customer Assistance', 'Garment Display', 'Billing Counter', 'Communication', 'Stock Tagging'],
    perks: ['Sales Commission', 'Uniform Provided', 'PF & ESIC', 'Staff Discount'],
    desc: 'Reliance Trends flagship store at Nirala Bazar is hiring Retail Sales Executives. Freshers with positive attitude and good customer communication skills are invited to apply.',
    responsibilities: [
      'Assist customers in selecting clothing apparel and trial room assistance.',
      'Arrange clothing stock neatly on display racks according to size and color codes.',
      'Operate POS billing counter and handle customer transactions politely.'
    ],
    requirements: [
      'Passed 12th standard or graduation degree.',
      'Friendly personality and fluency in Marathi/Hindi.'
    ]
  },
  {
    company: 'Kirloskar Ferrous Industries',
    logo: 'https://images.unsplash.com/photo-1581092580497-e0d23cbdf1dc?auto=format&fit=crop&w=250&q=80',
    color: '#7C2D12',
    title: 'Foundry Induction Furnace Melt Technician',
    industry: 'Iron Castings & Metallurgy',
    trade: 'Foundry Technician',
    location: 'Waluj MIDC K-Block, Chhatrapati Sambhajinagar, MH 431136',
    midcZone: 'Waluj MIDC',
    lat: 19.8430,
    lng: 75.2430,
    salMin: 300000,
    salMax: 440000,
    minExp: 2,
    maxExp: 6,
    openings: 14,
    shift: 'Rotational 3-Shift',
    workMode: 'On-site',
    jobType: 'Full-time',
    eduReq: 'ITI Metallurgy / Fitter / Diploma Mech',
    skills: ['Induction Furnace', 'Molten Iron Pouring', 'Spectro Sampling', 'Slag Removal', 'Refractory Lining'],
    perks: ['Subsidized Meals', 'Bus Pass', 'Heavy Duty Safety Gear', 'PF & Mediclaim'],
    desc: 'Kirloskar Ferrous Industries Waluj plant is hiring Induction Furnace Operators for pig iron and grey iron engine block casting line. Position requires monitoring electric induction melting furnaces and metal chemistry.',
    responsibilities: [
      'Operate 10-Ton medium frequency electric induction melting furnaces.',
      'Take liquid metal samples for spectrometer chemical analysis and dip temperature probes.',
      'Pour molten iron into sand mold lines adhering strictly to foundry safety norms.'
    ],
    requirements: [
      'ITI or Diploma qualification.',
      '2+ years experience in iron or steel foundry furnace operation.'
    ]
  },
  {
    company: 'United Breweries Ltd (Kingfisher Plant)',
    logo: 'https://images.unsplash.com/photo-1581093458791-9f3c3900df4b?auto=format&fit=crop&w=250&q=80',
    color: '#D97706',
    title: 'Automated Bottling & Packaging Line Technician',
    industry: 'Beverage & FMCG Packaging',
    trade: 'Packaging Operator',
    location: 'Waluj MIDC Sector E, Chhatrapati Sambhajinagar, MH 431136',
    midcZone: 'Waluj MIDC',
    lat: 19.8410,
    lng: 75.2490,
    salMin: 270000,
    salMax: 390000,
    minExp: 1,
    maxExp: 5,
    openings: 18,
    shift: 'Rotational 3-Shift',
    workMode: 'On-site',
    jobType: 'Full-time',
    eduReq: 'ITI Fitter / Electrician / Packaging Tech',
    skills: ['High-speed Bottling Line', 'Labeller Machine', 'Crown Capper', 'Case Packer', 'Conveyor Maintenance'],
    perks: ['Subsidized Canteen', 'Bus Service', 'PF & ESIC', 'Quarterly Bonus'],
    desc: 'United Breweries (Heineken Group) Kingfisher manufacturing facility in Waluj MIDC is hiring Bottling Line Technicians for operating high-speed automated washing, filling, crowning, and labeling machines.',
    responsibilities: [
      'Operate Krones high-speed glass bottle filling and crowning machinery.',
      'Perform line changeovers for different bottle sizes and clear sensor jams.',
      'Maintain daily line filling efficiency and conduct fill level quality checks.'
    ],
    requirements: [
      'ITI Fitter, Electrician, or Diploma holder.',
      '1+ years technical experience in bottling or FMCG packaging plant.'
    ]
  },
  {
    company: 'Saffron Bakery & Cafe',
    logo: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=250&q=80',
    color: '#9A3412',
    title: 'Head Pastry Chef & Artisan Baker',
    industry: 'Food & Beverage Bakery',
    trade: 'Pastry Chef',
    location: 'N-2 CIDCO Commercial Belt, Chhatrapati Sambhajinagar, MH 431003',
    midcZone: 'N-2 CIDCO',
    lat: 19.8720,
    lng: 75.3570,
    salMin: 280000,
    salMax: 420000,
    minExp: 2,
    maxExp: 6,
    openings: 4,
    shift: 'Early Morning Shift (6:00 AM - 3:00 PM)',
    workMode: 'On-site',
    jobType: 'Full-time',
    eduReq: 'Craft Certificate / Diploma in Bakery & Confectionery',
    skills: ['Bread Baking', 'Pastry & Cake Design', 'Deck Oven Operation', 'Food Hygiene', 'Recipe Costing'],
    perks: ['Free Duty Meals', 'Incentive Bonus', 'PF Benefits', 'Paid Offs'],
    desc: 'Saffron Bakery & Cafe N-2 CIDCO is hiring a Head Pastry Chef & Baker. Candidate will prepare artisan breads, croissants, custom celebration cakes, pastries, and manage daily bakery production.',
    responsibilities: [
      'Bake fresh artisan breads, buns, pastries, and custom fondant cakes daily.',
      'Operate commercial spiral mixers, proofing cabinets, and multi-deck gas ovens.',
      'Maintain strict kitchen food hygiene and reorder raw baking ingredients.'
    ],
    requirements: [
      'Diploma or Certificate in Bakery & Pastry Arts.',
      '2+ years professional bakery experience.'
    ]
  },
  {
    company: 'Commercial Accounts & Audit Firm',
    logo: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=250&q=80',
    color: '#1E3A8A',
    title: 'Senior Commercial Accountant (Tally Prime & GST)',
    industry: 'Accounting & Financial Services',
    trade: 'Accountant',
    location: 'Osmanpura IT & Business Hub, Chhatrapati Sambhajinagar, MH 431005',
    midcZone: 'Osmanpura',
    lat: 19.8770,
    lng: 75.3200,
    salMin: 320000,
    salMax: 480000,
    minExp: 2,
    maxExp: 6,
    openings: 8,
    shift: 'General Office Shift (9:30 AM - 6:30 PM)',
    workMode: 'On-site',
    jobType: 'Full-time',
    eduReq: 'B.Com / M.Com / Tally Certified',
    skills: ['Tally Prime', 'GST Return Filing (GSTR-1/3B)', 'TDS Deduction', 'Bank Reconciliation', 'MS Excel VLOOKUP'],
    perks: ['5.5 Day Work Week', 'Annual Bonus', 'PF Benefits', 'Health Insurance'],
    desc: 'Accounting firm in Osmanpura is hiring Senior Accountants for industrial clients in Waluj & Chikalthana MIDC. Role involves day-to-day book entries, GST returns, TDS calculation, and bank reconciliation.',
    responsibilities: [
      'Maintain daily sales, purchase, payment, and journal vouchers in Tally Prime.',
      'Prepare and file monthly GST returns (GSTR-1, GSTR-3B) and quarterly TDS statements.',
      'Perform monthly bank reconciliation statements and prepare trial balance.'
    ],
    requirements: [
      'B.Com or M.Com degree holder.',
      '2+ years practical accounting experience in commercial or CA firm setup.'
    ]
  },
  {
    company: 'Sterlite Optical Glass Division',
    logo: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=250&q=80',
    color: '#1D4ED8',
    title: 'Quality Assurance & Inspection Supervisor (QA/QC)',
    industry: 'Optical Tech & Telecom Manufacturing',
    trade: 'Quality Inspector',
    location: 'Waluj MIDC Sector 3, Chhatrapati Sambhajinagar, MH 431136',
    midcZone: 'Waluj MIDC',
    lat: 19.8370,
    lng: 75.2500,
    salMin: 340000,
    salMax: 500000,
    minExp: 2,
    maxExp: 6,
    openings: 7,
    shift: 'Day Shift',
    workMode: 'On-site',
    jobType: 'Full-time',
    eduReq: 'Diploma Mechanical / B.Sc Physics',
    skills: ['7 QC Tools', 'ISO 9001 Audit', 'Optical Measurement', 'First Piece Inspection', '8D Problem Solving'],
    perks: ['Subsidized Meals', 'Bus Pass', 'Mediclaim', 'Performance Bonus'],
    desc: 'Sterlite Optical Glass division is recruiting QA/QC Inspectors. Role includes conducting incoming raw glass inspection, online process audits, and final pre-dispatch quality checks.',
    responsibilities: [
      'Perform dimensional and optical clarity checks on preform glass rods.',
      'Prepare 8D root cause analysis reports for customer quality complaints.',
      'Conduct internal ISO 9001 quality audits and calibrate inspection instruments.'
    ],
    requirements: [
      'Diploma Mechanical or B.Sc Physics.',
      '2+ years quality control experience in precision electronics or glass manufacturing.'
    ]
  },
  {
    company: 'Dhoot Transmission Pvt Ltd',
    logo: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=250&q=80',
    color: '#B45309',
    title: 'Automotive Wiring Harness Assembly Technician',
    industry: 'Auto Electrical & Electronics',
    trade: 'Wiring Harness Operator',
    location: 'Farola MIDC Paithan Road, Chhatrapati Sambhajinagar, MH 431105',
    midcZone: 'Farola MIDC',
    lat: 19.7420,
    lng: 75.3400,
    salMin: 220000,
    salMax: 310000,
    minExp: 1,
    maxExp: 4,
    openings: 35,
    shift: 'Rotational 3-Shift',
    workMode: 'On-site',
    jobType: 'Full-time',
    eduReq: 'ITI Electrician / Wireman / 12th Pass',
    skills: ['Crimping Press', 'Wiring Board Laying', 'Continuity Tester', 'Taping & Sleeving', 'Connector Assembly'],
    perks: ['Subsidized Canteen', 'Free Bus Transport', 'PF & ESIC', 'Attendance Bonus'],
    desc: 'Dhoot Transmission Plant at Farola Paithan Road is hiring Wiring Harness Assemblers. Female and male candidates with ITI or 12th pass education are welcome to apply for vehicle wiring assembly line.',
    responsibilities: [
      'Lay electric wires on assembly routing boards according to color code schematics.',
      'Operate automated terminal crimping presses and wire stripping tools.',
      'Check 100% electrical continuity on automated wire harness test benches.'
    ],
    requirements: [
      'ITI Electrician / Wireman or 12th Pass.',
      'Good color vision and dexterity for handling fine electrical wires.'
    ]
  },
  {
    company: 'Garware Polyester Division',
    logo: 'https://images.unsplash.com/photo-1581093458791-9f3c3900df4b?auto=format&fit=crop&w=250&q=80',
    color: '#059669',
    title: 'Plant Utility Boiler & Chiller Operator',
    industry: 'Polyester & Chemical Utilities',
    trade: 'Boiler Attendant',
    location: 'Chikalthana MIDC Area, Chhatrapati Sambhajinagar, MH 431006',
    midcZone: 'Chikalthana MIDC',
    lat: 19.8770,
    lng: 75.3860,
    salMin: 320000,
    salMax: 460000,
    minExp: 3,
    maxExp: 7,
    openings: 6,
    shift: 'Rotational 3-Shift',
    workMode: 'On-site',
    jobType: 'Full-time',
    eduReq: '1st / 2nd Class Boiler Competency Certificate (IBR)',
    skills: ['IBR Boiler Operation', 'Centrifugal Chiller', 'Cooling Tower', 'Water Softening Plant', 'DM Plant'],
    perks: ['Subsidized Canteen', 'Bus Pass', 'Mediclaim', 'Overtime Bonus'],
    desc: 'Garware Polyester Plant Chikalthana MIDC is hiring Certified Boiler Attendants for operating 10-TPH coal/gas fired IBR steam boilers, thermic fluid heaters, and 500-TR centrifugal chillers.',
    responsibilities: [
      'Operate IBR high-pressure steam boilers and maintain required steam header pressure.',
      'Check boiler feed water chemistry, blowdown, and operate DM water treatment plant.',
      'Monitor centrifugal chillers, air compressors, and cooling tower circulating pumps.'
    ],
    requirements: [
      '1st or 2nd Class Boiler Attendant Competency Certificate issued by Maharashtra Steam Boiler Directorate.'
    ]
  },
  {
    company: 'Lupin Chemical API Division',
    logo: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=250&q=80',
    color: '#059669',
    title: 'API Chemical Reactor Plant Operator',
    industry: 'Bulk Drugs & Chemical API',
    trade: 'Chemical Plant Operator',
    location: 'Chikalthana MIDC, Chhatrapati Sambhajinagar, MH 431006',
    midcZone: 'Chikalthana MIDC',
    lat: 19.8800,
    lng: 75.3900,
    salMin: 300000,
    salMax: 440000,
    minExp: 2,
    maxExp: 6,
    openings: 12,
    shift: 'Rotational 3-Shift',
    workMode: 'On-site',
    jobType: 'Full-time',
    eduReq: 'B.Sc Chemistry / ITI AOCP (Attendant Operator Chemical Plant)',
    skills: ['Glass-Lined Reactor', 'Centrifuge Machine', 'Vacuum Tray Dryer (VTD)', 'Solvent Recovery', 'Hazchem Safety'],
    perks: ['Subsidized Meals', 'Bus Facility', 'PF & ESIC', 'Safety Allowance'],
    desc: 'Lupin Chemical API synthesis plant in Chikalthana MIDC is hiring AOCP Chemical Operators for handling glass-lined chemical reactors, centrifuges, and solvent recovery columns.',
    responsibilities: [
      'Charge chemical raw materials into 3KL - 5KL glass-lined reactors as per Batch Production Record (BPR).',
      'Control reaction temperature, vacuum, and agitation speed during synthesis.',
      'Operate spin-top centrifuges and vacuum tray dryers for API crystal isolation.'
    ],
    requirements: [
      'B.Sc Chemistry or ITI AOCP (Attendant Operator Chemical Plant).',
      '2+ years experience in API or fine bulk chemical manufacturing plant.'
    ]
  },
  {
    company: 'Varroc Lighting Systems',
    logo: 'https://images.unsplash.com/photo-1581092335397-9583fe92d232?auto=format&fit=crop&w=250&q=80',
    color: '#2563EB',
    title: 'Plastic Injection Molding Tool Room Fitter',
    industry: 'Automotive Plastics & Toolroom',
    trade: 'Toolroom Fitter',
    location: 'Waluj MIDC K-Block, Chhatrapati Sambhajinagar, MH 431136',
    midcZone: 'Waluj MIDC',
    lat: 19.8410,
    lng: 75.2420,
    salMin: 320000,
    salMax: 480000,
    minExp: 3,
    maxExp: 7,
    openings: 7,
    shift: 'Day Shift',
    workMode: 'On-site',
    jobType: 'Full-time',
    eduReq: 'NTTF / CIPET / ITI Tool & Die Maker',
    skills: ['Injection Mold Maintenance', 'Surface Grinder', 'Die Spotting', 'Spark Erosion EDM', 'Mold Polishing'],
    perks: ['Subsidized Meals', 'Bus Pass', 'Mediclaim Policy', 'Overtime Bonus'],
    desc: 'Varroc Lighting division Tool Room is hiring Plastic Injection Mold Maintenance Fitters. Role involves preventive maintenance, polishing, and repair of multi-cavity automotive headlamp plastic injection molds.',
    responsibilities: [
      'Dismantle, clean, polish, and assemble plastic injection molds up to 15 Tons.',
      'Perform die spotting, core/cavity polishing, and replace broken ejector pins.',
      'Operate surface grinders, radial drills, and EDM machines for mold modification.'
    ],
    requirements: [
      'Diploma from NTTF, CIPET, or ITI Tool & Die Maker trade.',
      '3+ years hands-on plastic injection mold tool room maintenance experience.'
    ]
  },
  {
    company: 'Bajaj Engine Assembly Line',
    logo: 'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?auto=format&fit=crop&w=250&q=80',
    color: '#D97706',
    title: 'Shop Floor Assembly Line Production Supervisor',
    industry: 'Automotive 2-Wheeler Assembly',
    trade: 'Production Supervisor',
    location: 'Waluj MIDC Sector E, Chhatrapati Sambhajinagar, MH 431136',
    midcZone: 'Waluj MIDC',
    lat: 19.8405,
    lng: 75.2460,
    salMin: 450000,
    salMax: 680000,
    minExp: 4,
    maxExp: 8,
    openings: 5,
    shift: 'Rotational Shifts',
    workMode: 'On-site',
    jobType: 'Full-time',
    eduReq: 'Diploma / B.E. Mechanical Engineering',
    skills: ['Conveyor Line Ops', 'Poka-Yoke', '5S & Kaizen', 'Shift Output Target', 'Manpower Planning'],
    perks: ['Subsidized Canteen', 'Bus Service', 'Health Insurance', 'Annual Incentive'],
    desc: 'Bajaj Auto Waluj Plant is hiring Shop Floor Production Supervisors for motorcycle engine assembly line. Position demands managing 30+ operators, meeting hourly line Takt time targets, and maintaining zero assembly defects.',
    responsibilities: [
      'Supervise daily motorcycle engine assembly line operations to achieve shift targets.',
      'Implement Poka-Yoke error-proofing fixtures and audit 5S workplace cleanliness.',
      'Investigate assembly line stoppages and coordinate with maintenance engineers.'
    ],
    requirements: [
      'Diploma or B.E. in Mechanical / Automobile Engineering.',
      '4+ years assembly line supervisory experience in major automotive OEM or Tier-1 plant.'
    ]
  },
  {
    company: 'Sanitaryware & Ceramic Unit',
    logo: 'https://images.unsplash.com/photo-1581092580497-e0d23cbdf1dc?auto=format&fit=crop&w=250&q=80',
    color: '#0891B2',
    title: 'Tunnel Kiln Furnace & Ceramic Glaze Operator',
    industry: 'Ceramics & Building Materials',
    trade: 'Kiln Operator',
    location: 'Chikalthana MIDC, Chhatrapati Sambhajinagar, MH 431006',
    midcZone: 'Chikalthana MIDC',
    lat: 19.8785,
    lng: 75.3875,
    salMin: 250000,
    salMax: 360000,
    minExp: 2,
    maxExp: 5,
    openings: 10,
    shift: 'Rotational 3-Shift',
    workMode: 'On-site',
    jobType: 'Full-time',
    eduReq: 'ITI Fitter / Ceramic Diploma / 12th Pass',
    skills: ['Tunnel Kiln', 'Temperature Profile', 'Gas Burner Control', 'Glaze Spraying', 'Ceramic Quality'],
    perks: ['Canteen Facility', 'Bus Transport', 'PF & ESIC', 'Heat Allowance'],
    desc: 'Ceramic manufacturing plant in Chikalthana MIDC is recruiting Tunnel Kiln Operators. Role involves monitoring continuous gas-fired tunnel kilns, controlling firing zone temperature curves, and inspecting vitrified ceramic products.',
    responsibilities: [
      'Monitor continuous tunnel kiln gas burner pressure and temperature curves (1200°C).',
      'Push ceramic kiln cars at regulated push-time intervals.',
      'Inspect fired ceramic sanitaryware for cracks, warpage, and glaze defects.'
    ],
    requirements: [
      'ITI or 12th Pass with experience in kiln, furnace, or ceramic manufacturing.'
    ]
  },
  {
    company: 'Ryan International School',
    logo: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&w=250&q=80',
    color: '#0369A1',
    title: 'High School Physics & Mathematics Teacher (CBSE)',
    industry: 'School Education & Academics',
    trade: 'School Teacher',
    location: 'N-3 CIDCO Educational Sector, Chhatrapati Sambhajinagar, MH 431003',
    midcZone: 'N-3 CIDCO',
    lat: 19.8710,
    lng: 75.3550,
    salMin: 360000,
    salMax: 540000,
    minExp: 2,
    maxExp: 7,
    openings: 3,
    shift: 'School Duty (8:00 AM - 3:00 PM)',
    workMode: 'On-site',
    jobType: 'Full-time',
    eduReq: 'M.Sc Physics / Mathematics + B.Ed',
    skills: ['CBSE Curriculum', 'Classroom Teaching', 'Lab Experiments', 'Student Mentoring', 'Smartboard Teaching'],
    perks: ['School Bus Transport', 'Subsidized Staff Child Education', 'PF & Gratuity', 'Summer Vacation'],
    desc: 'Ryan International School CIDCO N-3 is recruiting High School Physics & Maths Teachers for 9th to 12th CBSE classes. Candidate must possess excellent English communication and subject mastery.',
    responsibilities: [
      'Conduct daily Physics & Mathematics classes for CBSE secondary and senior secondary students.',
      'Organize practical physics lab experiments and prepare monthly test question papers.',
      'Conduct parent-teacher meetings and track individual student academic progress.'
    ],
    requirements: [
      'M.Sc in Physics or Mathematics with completed B.Ed degree.',
      '2+ years teaching experience in CBSE affiliated English medium school.'
    ]
  },
  {
    company: 'Solar & Renewable Energy Solutions',
    logo: 'https://images.unsplash.com/photo-1508514177221-188b1cf16e9d?auto=format&fit=crop&w=250&q=80',
    color: '#D97706',
    title: 'Rooftop Solar PV Installation & Commissioning Engineer',
    industry: 'Renewable Solar Energy',
    trade: 'Solar Engineer',
    location: 'Garkheda Commercial Complex, Chhatrapati Sambhajinagar, MH 431009',
    midcZone: 'Garkheda',
    lat: 19.8640,
    lng: 75.3410,
    salMin: 320000,
    salMax: 480000,
    minExp: 2,
    maxExp: 5,
    openings: 8,
    shift: 'Day Shift (9:00 AM - 6:00 PM)',
    workMode: 'On-site',
    jobType: 'Full-time',
    eduReq: 'Degree / Diploma Electrical Engineering',
    skills: ['Solar PV Design', 'On-Grid Inverter', 'Net Metering MSEDCL', 'Structure Mounting', 'Solar Cabling'],
    perks: ['Travel Fuel Allowance', 'Mobile Allowance', 'PF & ESIC', 'Project Incentive'],
    desc: 'Solar EPC company in Garkheda is hiring Solar Project Engineers. Role includes site survey, rooftop solar structure installation, string inverter wiring, and MSEDCL net-metering commissioning for industrial clients.',
    responsibilities: [
      'Perform rooftop solar structural design and DC/AC cabling layout surveys.',
      'Supervise installation of solar PV panels, string inverters, and lightning arrestors.',
      'Coordinate with MSEDCL engineers for net-metering approval and grid synchronization.'
    ],
    requirements: [
      'Diploma or B.E. Electrical Engineering.',
      '2+ years rooftop solar EPC installation experience.'
    ]
  },
  {
    company: 'E-Commerce Delivery & Logistics Hub',
    logo: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=250&q=80',
    color: '#059669',
    title: 'Warehouse Material Store Manager & SAP Executive',
    industry: 'Supply Chain & Logistics',
    trade: 'Storekeeper',
    location: 'Shendra MIDC Logistics Park, Chhatrapati Sambhajinagar, MH 431154',
    midcZone: 'Shendra DMIC',
    lat: 19.8800,
    lng: 75.4860,
    salMin: 320000,
    salMax: 480000,
    minExp: 2,
    maxExp: 6,
    openings: 10,
    shift: 'General Shift',
    workMode: 'On-site',
    jobType: 'Full-time',
    eduReq: 'Graduate (B.Com / B.Sc / BBA)',
    skills: ['SAP MM Module', 'Material Inward/Outward', 'GRN Generation', 'Inventory Audit', 'Forklift Dispatch'],
    perks: ['Subsidized Canteen', 'Bus Pass', 'Medical Cover', 'PF & ESIC'],
    desc: 'Central warehouse in Shendra MIDC is hiring Storekeepers & SAP Material Executives. Role involves receiving raw materials, generating Goods Receipt Notes (GRN), inventory binning, and issuing parts to production floor.',
    responsibilities: [
      'Verify incoming supplier invoice items against purchase orders and issue GRNs in SAP.',
      'Manage inventory bin locations, stock audit counts, and FIFO material issuance.',
      'Coordinate dispatch of finished goods trucks to client locations.'
    ],
    requirements: [
      'Bachelor degree holder.',
      '2+ years warehouse store management experience with working knowledge of SAP MM.'
    ]
  },
  {
    company: 'Endurance Aluminum Foundry Unit',
    logo: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=250&q=80',
    color: '#DC2626',
    title: 'Industrial Plant EHS & Safety Officer',
    industry: 'Plant Safety & Environment',
    trade: 'Safety Officer',
    location: 'Waluj MIDC Sector 1, Chhatrapati Sambhajinagar, MH 431136',
    midcZone: 'Waluj MIDC',
    lat: 19.8440,
    lng: 75.2410,
    salMin: 420000,
    salMax: 650000,
    minExp: 3,
    maxExp: 7,
    openings: 4,
    shift: 'General Shift',
    workMode: 'On-site',
    jobType: 'Full-time',
    eduReq: 'B.Sc / B.E. + Advanced Diploma in Industrial Safety (ADIS CLI/RLI)',
    skills: ['Hazard Identification', 'PPE Enforcement', 'Fire Safety Audit', 'ISO 45001 Compliance', 'Incident Investigation'],
    perks: ['Subsidized Meals', 'Bus Pass', 'Mediclaim', 'Performance Bonus'],
    desc: 'Endurance Technologies Waluj plant is hiring an Industrial Safety Officer. Position requires conducting daily plant safety walks, enforcing PPE compliance, conducting mock fire drills, and maintaining ISO 45001 standards.',
    responsibilities: [
      'Audit shop floor safety compliance across die casting, machining, and heat treatment plants.',
      'Conduct new employee safety induction training, Toolbox Talks, and fire hazard drills.',
      'Investigate near-miss incidents and implement corrective action preventive action (CAPA).'
    ],
    requirements: [
      'B.Sc or B.E. degree with ADIS (Advanced Diploma in Industrial Safety) from CLI/RLI/MSBTE.',
      '3+ years experience as Safety Officer in manufacturing engineering plant.'
    ]
  },
  {
    company: 'Siemens Control Panel Works',
    logo: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=250&q=80',
    color: '#0891B2',
    title: 'Control Panel Wireman & Busbar Fitter',
    industry: 'Electrical Switchgear Assembly',
    trade: 'Electrician',
    location: 'Waluj MIDC Sector K, Chhatrapati Sambhajinagar, MH 431136',
    midcZone: 'Waluj MIDC',
    lat: 19.8415,
    lng: 75.2415,
    salMin: 230000,
    salMax: 330000,
    minExp: 1,
    maxExp: 4,
    openings: 25,
    shift: 'Day Shift (8:30 AM - 5:30 PM)',
    workMode: 'On-site',
    jobType: 'Full-time',
    eduReq: 'ITI Electrician / Wireman (NCVT)',
    skills: ['Control Panel Wiring', 'Ferrule Marking', 'Busbar Bending', 'Contactor & Relay', 'Schematic Drawing'],
    perks: ['Subsidized Meals', 'Bus Pass', 'Overtime Double Rate', 'PF & ESIC'],
    desc: 'Siemens vendor unit in Waluj MIDC is hiring Panel Wiremen. Candidate will perform point-to-point electrical wiring of PLC control panels, MCC panels, and bend copper busbars according to electrical drawings.',
    responsibilities: [
      'Wire electrical components including MCBs, contactors, overload relays, and PLCs in enclosures.',
      'Fix ferrules, lug cables properly using hydraulic crimping tools.',
      'Check wiring continuity using multimeter before final testing.'
    ],
    requirements: [
      'ITI Electrician or Wireman pass certificate.',
      '1+ years experience in electrical control panel assembly shop.'
    ]
  },
  {
    company: 'Hydraulics & Heavy Pneumatics Unit',
    logo: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=250&q=80',
    color: '#7C2D12',
    title: 'Hydraulic Cylinder & Pump Maintenance Fitter',
    industry: 'Heavy Industrial Hydraulics',
    trade: 'Hydraulics Fitter',
    location: 'Railway Station MIDC, Chhatrapati Sambhajinagar, MH 431005',
    midcZone: 'Railway Station MIDC',
    lat: 19.8590,
    lng: 75.3110,
    salMin: 270000,
    salMax: 390000,
    minExp: 2,
    maxExp: 6,
    openings: 10,
    shift: 'Day Shift',
    workMode: 'On-site',
    jobType: 'Full-time',
    eduReq: 'ITI Fitter (NCVT)',
    skills: ['Hydraulic Cylinder Repair', 'Oil Seal Replacement', 'Vane & Piston Pump', 'Solenoid Valve', 'Pressure Testing'],
    perks: ['Subsidized Canteen', 'Safety Shoes & Uniform', 'PF & ESIC', 'Bonus'],
    desc: 'Hydraulics repair works plant at Railway Station MIDC is recruiting Maintenance Fitters. Role involves dismantling, replacing seal kits, honing cylinders, and pressure testing heavy industrial hydraulic power packs.',
    responsibilities: [
      'Dismantle hydraulic press cylinders, replace chevron seal packs, and hone inner bores.',
      'Overhaul hydraulic pumps, directional control valves, and proportional valves.',
      'Perform high pressure hydraulic oil leak testing up to 250 Bar.'
    ],
    requirements: [
      'ITI Fitter certificate.',
      '2+ years hands-on experience in hydraulic equipment maintenance.'
    ]
  },
  {
    company: 'E-Mobility EV Powertrain Plant',
    logo: 'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?auto=format&fit=crop&w=250&q=80',
    color: '#D97706',
    title: 'EV Battery Pack Assembly & Testing Technician',
    industry: 'Electric Vehicles & Clean Energy',
    trade: 'EV Technician',
    location: 'Shendra DMIC Smart City, Chhatrapati Sambhajinagar, MH 431154',
    midcZone: 'Shendra DMIC',
    lat: 19.8810,
    lng: 75.4870,
    salMin: 280000,
    salMax: 400000,
    minExp: 1,
    maxExp: 4,
    openings: 18,
    shift: 'General Shift',
    workMode: 'On-site',
    jobType: 'Full-time',
    eduReq: 'ITI Electrician / Diploma Electronics / EV Certificate',
    skills: ['Lithium-ion Cells', 'BMS Wiring', 'Spot Welding', 'Battery Testing', 'Insulation Resistance Check'],
    perks: ['Subsidized Meals', 'Bus Pass', 'Mediclaim', 'ESIC & PF'],
    desc: 'Electric Vehicle manufacturing plant in Shendra DMIC is hiring EV Battery Assembly Technicians. Role involves assembling lithium-ion cell modules, BMS wiring, laser spot welding busbars, and testing battery packs.',
    responsibilities: [
      'Assemble lithium-ion battery cell modules and connect Battery Management System (BMS) harnesses.',
      'Perform micro-spot welding on nickel strips and check cell voltage balancing.',
      'Conduct high voltage insulation resistance tests and thermal sensor checks.'
    ],
    requirements: [
      'ITI Electrician, Diploma Electronics, or EV Technician course completion.',
      '1+ years technical manufacturing experience.'
    ]
  },
  {
    company: 'Heavy Transport Fleet Hub',
    logo: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=250&q=80',
    color: '#059669',
    title: 'Heavy Truck & Container Trailer Driver',
    industry: 'Logistics & Freight Transport',
    trade: 'Heavy Driver',
    location: 'Waluj Transport Nagar, Chhatrapati Sambhajinagar, MH 431136',
    midcZone: 'Waluj MIDC',
    lat: 19.8430,
    lng: 75.2440,
    salMin: 300000,
    salMax: 420000,
    minExp: 3,
    maxExp: 10,
    openings: 20,
    shift: 'Trip Basis Fleet Duty',
    workMode: 'On-site',
    jobType: 'Full-time',
    eduReq: '10th Pass + Valid Heavy Transport License (TR/Badge)',
    skills: ['14-Wheeler Driving', 'Long Route Transport', 'Vehicle Inspection', 'GPS Tracking', 'Clean Driving Record'],
    perks: ['Daily Trip Allowance', 'Free Loading/Unloading Helper', 'Medical Insurance', 'PF Benefits'],
    desc: 'Logistics company operating out of Waluj Transport Nagar is hiring Heavy Commercial Vehicle (HCV) Drivers for 14-wheeler container trucks on Chhatrapati Sambhajinagar to Mumbai/Pune routes.',
    responsibilities: [
      'Drive heavy 14-wheeler container trucks safely on long-haul highway routes.',
      'Inspect engine oil, brake air pressure, and tyre condition before starting trips.',
      'Ensure safe delivery of factory goods and collect signed transport waybills.'
    ],
    requirements: [
      'Valid Heavy Commercial Vehicle (HPV/TR) driving license with badge.',
      '3+ years experience driving heavy multi-axle trucks on Indian highways.'
    ]
  },
  {
    company: 'Commercial Printing & Packaging Press',
    logo: 'https://images.unsplash.com/photo-1581092795360-fd1ca04f0952?auto=format&fit=crop&w=250&q=80',
    color: '#0284C7',
    title: 'Offset Printing Machine Operator & Cutter',
    industry: 'Commercial Printing & Packaging',
    trade: 'Offset Operator',
    location: 'Chikalthana MIDC Area, Chhatrapati Sambhajinagar, MH 431006',
    midcZone: 'Chikalthana MIDC',
    lat: 19.8765,
    lng: 75.3845,
    salMin: 240000,
    salMax: 350000,
    minExp: 2,
    maxExp: 6,
    openings: 8,
    shift: 'Day Shift',
    workMode: 'On-site',
    jobType: 'Full-time',
    eduReq: 'Diploma Printing Tech / ITI / 10th Pass',
    skills: ['4-Color Offset Press', 'Heidelberg Press', 'Paper Cutting Machine', 'Ink Matching', 'Plate Mounting'],
    perks: ['Subsidized Canteen', 'Overtime Pay', 'PF & ESIC', 'Bonus'],
    desc: 'Commercial packaging press in Chikalthana MIDC is recruiting 4-Color Offset Printing Operators. Position requires operating Heidelberg offset presses for pharmaceutical carton and brochure printing.',
    responsibilities: [
      'Set up CTP printing plates, adjust ink duct keys, and dampening solution levels.',
      'Conduct color matching against approved customer proof samples.',
      'Operate polar paper cutting machines for post-press trimming.'
    ],
    requirements: [
      'Diploma in Printing Technology or ITI/10th Pass with 2+ years offset press experience.'
    ]
  },
  {
    company: 'Tooling & Precision Machine Works',
    logo: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=250&q=80',
    color: '#7C2D12',
    title: 'Conventional Lathe & Surface Grinder Operator',
    industry: 'Tooling & Precision Machining',
    trade: 'Machinist',
    location: 'Railway Station MIDC, Chhatrapati Sambhajinagar, MH 431005',
    midcZone: 'Railway Station MIDC',
    lat: 19.8575,
    lng: 75.3135,
    salMin: 230000,
    salMax: 340000,
    minExp: 2,
    maxExp: 6,
    openings: 12,
    shift: 'Day Shift',
    workMode: 'On-site',
    jobType: 'Full-time',
    eduReq: 'ITI Turner / Machinist (NCVT)',
    skills: ['Conventional Lathe', 'Surface Grinding', 'Thread Cutting', 'Vernier Caliper', 'Engineering Drawing'],
    perks: ['Subsidized Canteen', 'Safety Shoes Provided', 'PF & ESIC', 'Bonus'],
    desc: 'Machine shop at Railway Station MIDC is hiring Conventional Lathe Turners and Surface Grinders. Job involves turning custom steel shafts, cutting external threads, and precision surface grinding.',
    responsibilities: [
      'Operate heavy conventional lathe machines to turn steel shafts to ±0.02mm tolerance.',
      'Perform precision flat surface grinding on magnetic chuck surface grinders.',
      'Read engineering drawings and select appropriate HSS and carbide cutting tools.'
    ],
    requirements: [
      'ITI Turner or Machinist trade certificate.',
      '2+ years experience on conventional machine tools.'
    ]
  },
  {
    company: 'Aurangabad Electrical Maintenance Services',
    logo: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=250&q=80',
    color: '#0891B2',
    title: 'Industrial Motor Rewinding & HT Motor Technician',
    industry: 'Electrical Motor Repair',
    trade: 'Electrician',
    location: 'Pundlik Nagar Commercial Belt, Chhatrapati Sambhajinagar, MH 431009',
    midcZone: 'Pundlik Nagar',
    lat: 19.8680,
    lng: 75.3490,
    salMin: 220000,
    salMax: 320000,
    minExp: 1,
    maxExp: 5,
    openings: 10,
    shift: 'General Shift',
    workMode: 'On-site',
    jobType: 'Full-time',
    eduReq: 'ITI Wireman / Electrician',
    skills: ['3-Phase Motor Rewinding', 'Stator Coil Winding', 'Varnish Dip Baking', 'Insulation Megger Test', 'Bearing Replacement'],
    perks: ['Subsidized Canteen', 'Overtime Double Rate', 'PF & ESIC'],
    desc: 'Electrical motor service unit in Pundlik Nagar is hiring Motor Rewinding Technicians. Job involves rewinding 3-phase AC induction motors, replacing bearings, and varnish baking.',
    responsibilities: [
      'Strip burnt copper coils from AC motor stators and prepare insulation paper slots.',
      'Wind new copper wire coils using automatic coil winding machines and insert into slots.',
      'Perform varnish dipping, oven baking, and megger insulation testing before final assembly.'
    ],
    requirements: [
      'ITI Electrician or Wireman pass.',
      '1+ years experience in AC/DC electric motor rewinding workshop.'
    ]
  },
  {
    company: 'Commercial Auto Dealership & Workshop',
    logo: 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=250&q=80',
    color: '#D97706',
    title: 'Four Wheeler Auto Mechanic & Diagnostic Advisor',
    industry: 'Automobile Dealership & Service',
    trade: 'Auto Mechanic',
    location: 'Jalna Road Service Belt, Chhatrapati Sambhajinagar, MH 431003',
    midcZone: 'Jalna Road',
    lat: 19.8745,
    lng: 75.3510,
    salMin: 250000,
    salMax: 380000,
    minExp: 2,
    maxExp: 6,
    openings: 8,
    shift: 'General Shift (9:00 AM - 6:30 PM)',
    workMode: 'On-site',
    jobType: 'Full-time',
    eduReq: 'ITI Mechanic Motor Vehicle (MMV) / Diploma Automobile',
    skills: ['Car Engine Overhaul', 'OBD2 Scanner Diagnostic', 'Brake System', 'Suspension Repair', 'Wheel Alignment'],
    perks: ['Incentive Per Vehicle', 'Subsidized Lunch', 'Uniform & Tool Kit', 'PF & ESIC'],
    desc: 'Authorized car dealership workshop on Jalna Road is hiring Motor Vehicle Mechanics. Role includes periodic car servicing, OBD scanner fault diagnosis, engine overhaul, and suspension repairs.',
    responsibilities: [
      'Perform periodic engine oil change, spark plug replacement, and brake pad service.',
      'Diagnose check engine light codes using computerized OBD scan tools.',
      'Overhaul car transmissions, clutches, and suspension steering systems.'
    ],
    requirements: [
      'ITI MMV (Mechanic Motor Vehicle) or Diploma in Automobile Engineering.',
      '2+ years multi-brand or authorized car dealership service experience.'
    ]
  },
  {
    company: 'Commercial Security & Guarding Services',
    logo: 'https://images.unsplash.com/photo-1581092580497-e0d23cbdf1dc?auto=format&fit=crop&w=250&q=80',
    color: '#1E3A8A',
    title: 'Industrial Plant Security Supervisor & CCTV Inspector',
    industry: 'Plant Security & Facility Operations',
    trade: 'Security Officer',
    location: 'Waluj MIDC Sector 1, Chhatrapati Sambhajinagar, MH 431136',
    midcZone: 'Waluj MIDC',
    lat: 19.8455,
    lng: 75.2425,
    salMin: 240000,
    salMax: 330000,
    minExp: 2,
    maxExp: 7,
    openings: 15,
    shift: '12-Hour Shift System (Day / Night)',
    workMode: 'On-site',
    jobType: 'Full-time',
    eduReq: '12th Pass / Ex-Serviceman Preferred',
    skills: ['CCTV Monitoring', 'Gate Pass Entry', 'Material Truck Audit', 'Visitor Management', 'Fire Safety'],
    perks: ['Free Uniform Provided', 'PF & ESIC', 'Accommodation Allowance', 'Overtime Pay'],
    desc: 'Industrial Security agency is hiring Security Supervisors for factory premises in Waluj MIDC. Role oversees factory gate entry registers, material inward vehicle checking, and CCTV camera monitoring.',
    responsibilities: [
      'Supervise factory main gate security guards and maintain visitor/material truck registers.',
      'Monitor plant CCTV camera systems for unauthorized perimeter entry.',
      'Conduct night patrolling rounds and check plant fire extinguisher status.'
    ],
    requirements: [
      'Passed 12th standard (Ex-servicemen or NCC cadets preferred).',
      '2+ years industrial plant security experience.'
    ]
  },
  {
    company: 'Software IT Services Firm',
    logo: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=250&q=80',
    color: '#1D4ED8',
    title: 'Data Entry & Commercial Billing Executive',
    industry: 'Office Admin & IT Support',
    trade: 'Data Entry Operator',
    location: 'Nirala Bazar Business Center, Chhatrapati Sambhajinagar, MH 431001',
    midcZone: 'Nirala Bazar',
    lat: 19.8768,
    lng: 75.3205,
    salMin: 180000,
    salMax: 260000,
    minExp: 0,
    maxExp: 3,
    openings: 12,
    shift: 'General Day Shift (9:30 AM - 6:00 PM)',
    workMode: 'On-site',
    jobType: 'Full-time',
    eduReq: '12th Pass / Any Graduate + MS-CIT / Typing Speed 30+ WPM',
    skills: ['MS Excel VLOOKUP', 'English & Marathi Typing', 'Data Entry', 'Commercial Invoicing', 'Email Communication'],
    perks: ['5.5 Day Work Week', 'PF & ESIC', 'Annual Increment', 'Friendly Work Culture'],
    desc: 'Commercial office in Nirala Bazar is hiring Data Entry & Invoicing Executives. Freshers with good computer typing speed in English and Marathi are welcome.',
    responsibilities: [
      'Enter daily customer orders, sales data, and billing vouchers into MS Excel and accounting software.',
      'Generate commercial invoices and email delivery challans to clients.',
      'Maintain office physical files and digital spreadsheet database.'
    ],
    requirements: [
      'Passed 12th standard or graduation with MS-CIT typing certificate.',
      'Typing speed of 30+ WPM in English.'
    ]
  },
  {
    company: 'Industrial Chemical & Water Treatment',
    logo: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=250&q=80',
    color: '#059669',
    title: 'Effluent Treatment Plant (ETP & STP) Operator',
    industry: 'Environmental & Wastewater Treatment',
    trade: 'ETP Operator',
    location: 'Chikalthana MIDC Industrial Area, Chhatrapati Sambhajinagar, MH 431006',
    midcZone: 'Chikalthana MIDC',
    lat: 19.8795,
    lng: 75.3885,
    salMin: 230000,
    salMax: 330000,
    minExp: 1,
    maxExp: 5,
    openings: 8,
    shift: 'Rotational 3-Shift',
    workMode: 'On-site',
    jobType: 'Full-time',
    eduReq: 'ITI AOCP / B.Sc Chemistry / 12th Science',
    skills: ['ETP Plant Operation', 'Dosing Pumps', 'Filter Press', 'pH & COD Testing', 'Sludge Dewatering'],
    perks: ['Subsidized Canteen', 'Bus Pass', 'PF & ESIC', 'Safety Kit'],
    desc: 'Industrial ETP management unit in Chikalthana MIDC is recruiting Effluent Treatment Plant Operators. Candidate will operate chemical dosing pumps, filter presses, and perform pH/COD water quality checks.',
    responsibilities: [
      'Operate chemical coagulation dosing pumps, aeration tanks, and clarifier units.',
      'Perform daily pH, total dissolved solids (TDS), and COD/BOD water quality tests.',
      'Operate sludge dewatering filter presses and dispose of hazardous sludge safely.'
    ],
    requirements: [
      'ITI AOCP, B.Sc Chemistry, or 12th Science.',
      '1+ years hands-on ETP or STP plant operation experience.'
    ]
  },
  {
    company: 'Commercial Heavy Equipment Rental',
    logo: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=250&q=80',
    color: '#7C2D12',
    title: 'Mobile Crane & Heavy Lift Hydraulic Operator',
    industry: 'Heavy Construction & Crane Logistics',
    trade: 'Crane Operator',
    location: 'Shendra DMIC Equipment Hub, Chhatrapati Sambhajinagar, MH 431154',
    midcZone: 'Shendra DMIC',
    lat: 19.8825,
    lng: 75.4895,
    salMin: 320000,
    salMax: 480000,
    minExp: 3,
    maxExp: 9,
    openings: 6,
    shift: 'Day Shift',
    workMode: 'On-site',
    jobType: 'Full-time',
    eduReq: '10th Pass + Heavy Crane Driving License',
    skills: ['Hydraulic Mobile Crane', 'Telescopic Boom', 'Load Chart Reading', 'Outrigger Setup', 'Rigging Safety'],
    perks: ['Free Food & Lodging on Site', 'Overtime Allowance', 'Medical Cover', 'PF Benefits'],
    desc: 'Equipment rental hub at Shendra DMIC is hiring 30-Ton to 75-Ton Mobile Crane Operators. Role involves operating telescopic boom cranes for industrial plant machinery erection.',
    responsibilities: [
      'Operate 30T - 75T hydraulic telescopic mobile cranes safely on industrial erection sites.',
      'Position crane outriggers on stable ground and verify load chart weight limits.',
      'Perform daily pre-lift hydraulic oil level and wire rope safety inspections.'
    ],
    requirements: [
      'Valid Heavy Driving License with crane endorsement.',
      '3+ years experience operating mobile hydraulic cranes.'
    ]
  },
  {
    company: 'Aurangabad Medical Diagnostic Lab',
    logo: 'https://images.unsplash.com/photo-1532938911079-1b06ac7ceec7?auto=format&fit=crop&w=250&q=80',
    color: '#0284C7',
    title: 'Radiology X-Ray & CT Scan Technician',
    industry: 'Diagnostic Imaging & Healthcare',
    trade: 'Radiology Tech',
    location: 'Kranti Chowk Diagnostic Belt, Chhatrapati Sambhajinagar, MH 431001',
    midcZone: 'Kranti Chowk',
    lat: 19.8725,
    lng: 75.3265,
    salMin: 280000,
    salMax: 420000,
    minExp: 1,
    maxExp: 5,
    openings: 5,
    shift: 'General / Shift System',
    workMode: 'On-site',
    jobType: 'Full-time',
    eduReq: 'Diploma in Medical Radiology Technology (DMRT / BMRT)',
    skills: ['X-Ray Imaging', 'Multi-slice CT Scan', 'PACS Software', 'Radiation Safety TLD', 'Patient Positioning'],
    perks: ['Subsidized Staff Meals', 'Health Insurance', 'PF & ESIC', 'Annual Increment'],
    desc: 'Diagnostic imaging center at Kranti Chowk is hiring X-Ray & CT Scan Technicians. Position involves positioning patients, operating digital X-ray and CT scanners, and managing PACS image transfers.',
    responsibilities: [
      'Position patients correctly and capture digital X-ray and 16-slice CT scan images.',
      'Adhere strictly to BARC radiation safety guidelines and wear TLD badge.',
      'Archive digital DICOM images to PACS software for radiologist evaluation.'
    ],
    requirements: [
      'DMRT or BMRT degree from recognized medical institute.',
      '1+ years experience operating digital X-Ray and CT scan machines.'
    ]
  },
  {
    company: 'Industrial Fasteners & Stamping Unit',
    logo: 'https://images.unsplash.com/photo-1581092335397-9583fe92d232?auto=format&fit=crop&w=250&q=80',
    color: '#2563EB',
    title: 'High Speed Sheet Metal Stamping Press Tool Operator',
    industry: 'Metal Stamping & Fasteners',
    trade: 'Press Operator',
    location: 'Waluj MIDC Sector 2, Chhatrapati Sambhajinagar, MH 431136',
    midcZone: 'Waluj MIDC',
    lat: 19.8375,
    lng: 75.2495,
    salMin: 240000,
    salMax: 350000,
    minExp: 1,
    maxExp: 5,
    openings: 16,
    shift: 'Rotational 3-Shift',
    workMode: 'On-site',
    jobType: 'Full-time',
    eduReq: 'ITI Fitter / Press Tool Operator',
    skills: ['Progressive Die Press', 'Coil Feeder', 'Blanking & Piercing', 'Die Clamping', 'Burr Inspection'],
    perks: ['Subsidized Canteen', 'Bus Pass', 'PF & ESIC', 'Overtime Bonus'],
    desc: 'Auto stamping unit in Waluj MIDC is recruiting Mechanical Press Operators. Role requires operating 50T to 200T progressive die stamping presses for manufacturing automotive washers and clips.',
    responsibilities: [
      'Set steel strip coils into automatic decoiler feeder units and feed into press dies.',
      'Operate mechanical power presses safely and monitor progressive die stroke alignment.',
      'Inspect stamped metal parts for burrs, thickness, and dimensions using Vernier Caliper.'
    ],
    requirements: [
      'ITI Fitter or Press Tool trade pass.',
      '1+ years experience on mechanical power presses and progressive stamping dies.'
    ]
  }
];

async function seed50SambhajiRealJobs() {
  console.log('🧹 Clearing old jobs from database to seed 50 REAL Chhatrapati Sambhajinagar jobs...');

  try {
    await pool.query('DELETE FROM job_applications;');
    await pool.query('DELETE FROM saved_jobs;');
    await pool.query('DELETE FROM jobs;');
    console.log('✅ Cleaned up old database tables successfully!');

    // Fetch or create real employers in database to map jobs to
    const employerEmails = [
      'bajaj.employer@jobmarket.com',
      'endurance.hr@jobmarket.com',
      'siemens.recruitment@jobmarket.com',
      'varroc.careers@jobmarket.com',
      'lupin.hr@jobmarket.com',
      'wockhardt.recruitment@jobmarket.com'
    ];

    const employerIds: string[] = [];

    for (let i = 0; i < employerEmails.length; i++) {
      const email = employerEmails[i];
      let res = await pool.query('SELECT id FROM users WHERE email = $1;', [email]);
      if (res.rows.length > 0) {
        employerIds.push(res.rows[0].id);
      } else {
        const companyName = SAMBHAJINAGAR_JOBS_50[i % SAMBHAJINAGAR_JOBS_50.length].company;
        const newEmp = await pool.query(`
          INSERT INTO users (email, password_hash, name, phone, role, company_name, status)
          VALUES ($1, '$2b$10$X7WzD.4.O7gD7qMv/xW6U.rN81lKzP3eZ1zQZ.X61W2Z3Y4X5Y6Z7', $2, $3, 'EMPLOYER', $4, 'APPROVED')
          RETURNING id;
        `, [email, `${companyName} HR Team`, `987654320${i}`, companyName]);
        employerIds.push(newEmp.rows[0].id);
      }
    }

    console.log(`🚀 Seeding 50 REAL Jobs with company logos, coordinates, and details for Chhatrapati Sambhajinagar...`);

    let count = 0;

    for (let i = 0; i < SAMBHAJINAGAR_JOBS_50.length; i++) {
      const job = SAMBHAJINAGAR_JOBS_50[i];
      const assignedEmployerId = employerIds[i % employerIds.length];
      const mapLink = `https://maps.google.com/?q=${job.lat},${job.lng}`;
      const interviewAddress = `${job.location} | Map: ${mapLink}`;

      const query = `
        INSERT INTO jobs (
          employer_id, company, company_logo, company_color, title, industry, location,
          trade, midc_zone, shift_details, overtime, accommodation, bus_facility, canteen,
          joining_bonus, attendance_bonus, contract_duration, job_type, work_mode,
          min_experience, max_experience, salary_min, salary_max, openings, filled_openings,
          status, description, responsibilities, requirements, skills, perks, education_requirement,
          latitude, longitude, geocoding_status, interview_address, posted_at
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19,
          $20, $21, $22, $23, $24, $25, $26, $27, $28, $29, $30, $31, $32, $33, $34, $35, $36,
          NOW() - ($37 || ' hours')::interval
        );
      `;

      const values = [
        assignedEmployerId,
        job.company,
        job.logo,
        job.color,
        job.title,
        job.industry,
        job.location,
        job.trade,
        job.midcZone,
        job.shift,
        true,
        i % 2 === 0,
        true,
        true,
        i % 3 === 0,
        true,
        'Permanent',
        job.jobType,
        job.workMode,
        job.minExp,
        job.maxExp,
        job.salMin,
        job.salMax,
        job.openings,
        1 + (i % 3),
        'APPROVED',
        job.desc,
        JSON.stringify(job.responsibilities),
        JSON.stringify(job.requirements),
        JSON.stringify(job.skills),
        JSON.stringify(job.perks),
        job.eduReq,
        job.lat,
        job.lng,
        'COMPLETED',
        interviewAddress,
        (i * 2).toFixed(0)
      ];

      await pool.query(query, values);
      count++;
      if (count % 10 === 0 || count === 50) {
        console.log(`[${count}/50] ✅ Seeded: "${job.title}" @ ${job.company} (${job.midcZone})`);
      }
    }

    // Invalidate Redis cache if available
    try {
      if (redisClient.isOpen) {
        await redisClient.del('cache:jobs:active');
        const keys = await redisClient.keys('cache:job:*');
        if (keys.length > 0) {
          await redisClient.del(keys);
        }
        console.log('⚡ Redis cache invalidated successfully!');
      }
    } catch (redisErr) {
      console.warn('Note: Redis cache invalidation skipped or failed:', redisErr);
    }

    console.log('🎉 Successfully inserted 50 REAL-WORLD jobs for Chhatrapati Sambhajinagar into PostgreSQL database!');
    process.exit(0);
  } catch (err) {
    console.error('❌ Error seeding 50 Sambhajinagar jobs:', err);
    process.exit(1);
  }
}

seed50SambhajiRealJobs();
