import { User } from '../../../types';

export interface ExtendedCandidate extends Partial<User> {
  id: string;
  name: string;
  verified?: boolean;
  aadhaar_verified?: boolean;
  title?: string;
  trade_specialization?: string;
  headline?: string;
  location?: string;
  industry?: string;
  experience?: any;
  experience_years?: number;
  skills?: string[];
  avatarUrl?: string;
  phone?: string;
  email?: string;
  education?: any;
  bio?: string;
  resume_url?: string;
  resumeUrl?: string;
  resume?: string;
  notice_period?: string;
  preferred_shift?: string;
}

export const INDUSTRY_FILTER_OPTIONS = [
  'All Industries',
  'Automotive & Auto Components',
  'Industrial & Heavy Manufacturing',
  'Electronics & Electricals',
  'Pharmaceuticals & Chemicals',
  'Textiles & Garments',
  'Construction & Infrastructure',
  'Logistics, Supply Chain & Warehousing',
  'Food Processing & FMCG',
  'Plastics, Polymers & Rubber',
  'Iron, Steel & Metallurgy',
  'Services & General Engineering',
  'IT & Software Engineering',
];

export const EDUCATION_FILTER_OPTIONS = [
  'All Education Levels',
  'Fresher / Trainee',
  '10th / Below 10th',
  '12th Pass (HSC)',
  'ITI / Trade Certified',
  'Diploma / Polytechnic',
  'Graduate / B.E. / B.Tech',
  'Graduate (B.Sc / B.Com / BA)',
  'Post Graduate / Master\'s',
  'Doctorate / PhD',
];

export const EXPERIENCE_FILTER_OPTIONS = [
  'All Experience',
  'Fresher (0 Yrs)',
  '1+ Years',
  '2+ Years',
  '3+ Years',
  '5+ Years',
  '8+ Years',
  '10+ Years',
];

export const LOCATION_FILTER_OPTIONS = [
  'All Locations',
  'Waluj MIDC',
  'Shendra MIDC',
  'AURIC City (Shendra / Bidkin)',
  'Chikalthana MIDC',
  'Chitegaon MIDC',
  'Paithan MIDC',
  'Bidkin MIDC',
  'Railway Station MIDC',
  'CIDCO (N-1 to N-12)',
  'Beed Bypass & Satara Parisar',
  'Garkheda & Ulkanagari',
  'Jalna Road & Seven Hills',
  'Kranti Chowk & Station Road',
  'Padegaon & Harsul',
  'Chhatrapati Sambhajinagar (All Zones)',
  'Pune (Bhosari / Chakan / Talegaon)',
  'Nashik (Ambad / Satpur)',
  'Ahmednagar (Nagapur / Supa)',
];

export const TRADE_FILTER_OPTIONS = [
  'All Trades',
  'VMC Operator / Programmer',
  'CNC Machinist / Turner',
  'Industrial Fitter',
  'MIG / TIG Welder',
  'Industrial Electrician',
  'Quality Inspector (QA/QC)',
  'Tool & Die Maker',
  'Plant Maintenance',
  'Store Keeper / Supervisor',
  'Assembly Operator',
];

export const safeString = (val: any, fallback: string = ''): string => {
  if (val === null || val === undefined) return fallback;
  if (typeof val === 'string') return val;
  if (typeof val === 'number' || typeof val === 'boolean') return String(val);
  if (Array.isArray(val)) {
    if (val.length === 0) return fallback;
    const parts = val.map((item) => safeString(item)).filter(Boolean);
    return parts.length > 0 ? parts.join(', ') : fallback;
  }
  if (typeof val === 'object') {
    if (val.degree || val.institution || val.year) {
      const eduParts = [val.degree, val.institution, val.year].filter((x) => typeof x === 'string' || typeof x === 'number');
      if (eduParts.length > 0) return eduParts.join(' • ');
    }
    if (val.title || val.company || val.duration) {
      const workParts = [val.title, val.company, val.duration].filter((x) => typeof x === 'string' || typeof x === 'number');
      if (workParts.length > 0) return workParts.join(' - ');
    }
    if (val.city || val.state) {
      const locParts = [val.city, val.state].filter((x) => typeof x === 'string');
      if (locParts.length > 0) return locParts.join(', ');
    }
    const stringValues = Object.values(val)
      .map((v) => (typeof v === 'string' || typeof v === 'number' ? String(v) : ''))
      .filter(Boolean);
    return stringValues.length > 0 ? stringValues.join(' • ') : fallback;
  }
  return String(val);
};

export const extractNumericExperience = (candidate: ExtendedCandidate): number => {
  if (typeof candidate.experience_years === 'number') return candidate.experience_years;
  if (typeof candidate.experience === 'number') return candidate.experience;
  const expStr = safeString(candidate.experience).toLowerCase();
  if (expStr.includes('fresher') || expStr.includes('0 yr') || expStr.includes('0 year')) return 0;
  const match = expStr.match(/(\d+(\.\d+)?)/);
  if (match) return parseFloat(match[1]);
  return 0;
};

export const matchesIndustry = (candidate: ExtendedCandidate, filter: string | null): boolean => {
  if (!filter || filter === 'All Industries') return true;
  const candInd = (candidate.industry || '').toLowerCase();
  const candTrade = (candidate.trade_specialization || '').toLowerCase();
  const candTitle = (candidate.title || '').toLowerCase();
  const candHeadline = (candidate.headline || '').toLowerCase();
  const candBio = (candidate.bio || '').toLowerCase();
  const candSkills = Array.isArray(candidate.skills) ? candidate.skills.join(' ').toLowerCase() : '';
  const combined = `${candInd} ${candTrade} ${candTitle} ${candHeadline} ${candBio} ${candSkills}`;

  switch (filter) {
    case 'Automotive & Auto Components':
      return /automotive|auto|vmc|cnc|chassis|engine|machinist|turner|vehicle|stamping|press shop|iatf/i.test(combined);
    case 'Industrial & Heavy Manufacturing':
      return /manufacturing|machin|fitter|welder|hydraulics|pneumatics|fabrication|plant|lathe|heavy equipment|tool & die/i.test(combined);
    case 'Electronics & Electricals':
      return /electric|electronic|plc|pcb|wireman|wiring|panel|circuit|transformer|testing/i.test(combined);
    case 'Pharmaceuticals & Chemicals':
      return /pharma|chemical|cleanroom|reactor|distillation|formulation|qc lab|hvac|drug|biotech/i.test(combined);
    case 'Textiles & Garments':
      return /textile|garment|spinning|weaving|stitching|tailor|sewing|fabric|apparel|dyeing/i.test(combined);
    case 'Construction & Infrastructure':
      return /construction|infrastructure|structural|civil|crane|excavator|scaffolding|mason|mep/i.test(combined);
    case 'Logistics, Supply Chain & Warehousing':
      return /logistics|warehouse|forklift|inventory|store|sap mm|dispatch|packer|picker|supply chain/i.test(combined);
    case 'Food Processing & FMCG':
      return /food|fmcg|beverage|dairy|packaging|cold storage|bakery|processing/i.test(combined);
    case 'Plastics, Polymers & Rubber':
      return /plastic|polymer|rubber|injection|moulding|extrusion|blow mould/i.test(combined);
    case 'Iron, Steel & Metallurgy':
      return /steel|iron|foundry|casting|forging|metallurgy|rolling mill|blast furnace|heat treat/i.test(combined);
    case 'Services & General Engineering':
      return /service|general engineering|facility|utility|maintenance|helper|mechanic|ac /i.test(combined);
    case 'IT & Software Engineering':
      return /software|it |developer|programmer|cad|cam|autocad|iot|embedded|data/i.test(combined);
    default:
      return combined.includes(filter.toLowerCase());
  }
};

export const matchesEducation = (candidate: ExtendedCandidate, filter: string | null): boolean => {
  if (!filter || filter === 'All Education Levels') return true;
  const eduStr = safeString(candidate.education).toLowerCase();
  const headline = (candidate.headline || '').toLowerCase();
  const bio = (candidate.bio || '').toLowerCase();
  const combined = `${eduStr} ${headline} ${bio}`;

  switch (filter) {
    case 'Fresher / Trainee':
      return combined.includes('fresher') || combined.includes('trainee') || extractNumericExperience(candidate) === 0;
    case '10th / Below 10th':
      return /10th|ssc|matric|secondary pass|below 10/i.test(combined);
    case '12th Pass (HSC)':
      return /12th|hsc|higher secondary|intermediate/i.test(combined);
    case 'ITI / Trade Certified':
      return /iti|nctvt|ncvt|scvt|trade certificate|craftsman|fitter|machinist|turner|welder/i.test(combined);
    case 'Diploma / Polytechnic':
      return /diploma|polytechnic|msbte|poly /i.test(combined);
    case 'Graduate / B.E. / B.Tech':
      return /b\.e|b\.tech|btech|bachelor of engineering|engineering graduate/i.test(combined);
    case 'Graduate (B.Sc / B.Com / BA)':
      return /graduate|b\.sc|bsc|b\.com|bcom|b\.a\.|ba |bca|bba/i.test(combined);
    case 'Post Graduate / Master\'s':
      return /m\.tech|mtech|mba|mca|m\.sc|m\.com|master|post graduate/i.test(combined);
    case 'Doctorate / PhD':
      return /phd|doctorate/i.test(combined);
    default:
      return combined.includes(filter.toLowerCase());
  }
};

export const matchesExperience = (candidate: ExtendedCandidate, filter: string | null): boolean => {
  if (!filter || filter === 'All Experience') return true;
  const years = extractNumericExperience(candidate);
  const expStr = safeString(candidate.experience).toLowerCase();

  switch (filter) {
    case 'Fresher (0 Yrs)':
      return years === 0 || expStr.includes('fresher') || expStr.includes('0 yr') || expStr.includes('0 year') || expStr.includes('trainee');
    case '1+ Years':
      return years >= 1;
    case '2+ Years':
      return years >= 2;
    case '3+ Years':
      return years >= 3;
    case '5+ Years':
      return years >= 5;
    case '8+ Years':
      return years >= 8;
    case '10+ Years':
      return years >= 10;
    default: {
      const num = parseInt(filter, 10);
      return !isNaN(num) ? years >= num : true;
    }
  }
};

export const matchesLocation = (candidate: ExtendedCandidate, filter: string | null): boolean => {
  if (!filter || filter === 'All Locations') return true;
  const candLoc = (candidate.location || '').toLowerCase();

  if (filter === 'Waluj MIDC') return /waluj/i.test(candLoc);
  if (filter === 'Shendra MIDC') return /shendra/i.test(candLoc);
  if (filter.includes('AURIC')) return /auric|shendra|bidkin/i.test(candLoc);
  if (filter === 'Chikalthana MIDC') return /chikalthana/i.test(candLoc);
  if (filter === 'Chitegaon MIDC') return /chitegaon/i.test(candLoc);
  if (filter === 'Paithan MIDC') return /paithan/i.test(candLoc);
  if (filter === 'Bidkin MIDC') return /bidkin/i.test(candLoc);
  if (filter === 'Railway Station MIDC') return /railway station|station midc/i.test(candLoc);
  if (filter.includes('CIDCO')) return /cidco|town center|cannaught/i.test(candLoc);
  if (filter.includes('Beed Bypass')) return /beed bypass|satara|mit college/i.test(candLoc);
  if (filter.includes('Garkheda')) return /garkheda|ulkanagari|sutgirni/i.test(candLoc);
  if (filter.includes('Jalna Road')) return /jalna road|seven hills|dhoot hospital|cidco/i.test(candLoc);
  if (filter.includes('Kranti Chowk')) return /kranti chowk|station road|osmanpura/i.test(candLoc);
  if (filter.includes('Padegaon')) return /padegaon|harsul|daulatabad/i.test(candLoc);
  if (filter.includes('Sambhajinagar')) return /sambhajinagar|aurangabad|waluj|shendra|chikalthana|chitegaon|paithan|bidkin/i.test(candLoc);
  if (filter.includes('Pune')) return /pune|bhosari|chakan|talegaon|ranjangaon/i.test(candLoc);
  if (filter.includes('Nashik')) return /nashik|ambad|satpur/i.test(candLoc);
  if (filter.includes('Ahmednagar')) return /ahmednagar|nagapur|supa/i.test(candLoc);

  return candLoc.includes(filter.toLowerCase());
};

export const matchesTrade = (candidate: ExtendedCandidate, filter: string | null): boolean => {
  if (!filter || filter === 'All Trades') return true;
  const candTrade = (candidate.trade_specialization || '').toLowerCase();
  const candTitle = (candidate.title || '').toLowerCase();
  const candSkills = Array.isArray(candidate.skills) ? candidate.skills.join(' ').toLowerCase() : '';
  const combined = `${candTrade} ${candTitle} ${candSkills}`;

  switch (filter) {
    case 'VMC Operator / Programmer':
      return /vmc/i.test(combined);
    case 'CNC Machinist / Turner':
      return /cnc|turner|lathe/i.test(combined);
    case 'Industrial Fitter':
      return /fitter|assembly/i.test(combined);
    case 'MIG / TIG Welder':
      return /welder|welding|fabricat/i.test(combined);
    case 'Industrial Electrician':
      return /electrician|wireman|plc/i.test(combined);
    case 'Quality Inspector (QA/QC)':
      return /quality|inspector|qa|qc|cmm/i.test(combined);
    case 'Tool & Die Maker':
      return /tool|die maker|press tool/i.test(combined);
    case 'Plant Maintenance':
      return /maintenance|hydraulics|pneumatics/i.test(combined);
    case 'Store Keeper / Supervisor':
      return /store|warehouse|inventory|sap mm/i.test(combined);
    case 'Assembly Operator':
      return /assembly|operator|production/i.test(combined);
    default:
      return combined.includes(filter.toLowerCase());
  }
};

export const CANDIDATE_SEARCH_SUGGESTIONS = [
  'Search Candidates',
  'Search Skills',
  'Search Trades',
  'Search Locations',
];

export const SEED_CANDIDATES: ExtendedCandidate[] = [
  {
    id: 'cand-101',
    name: 'Rajesh Kumar Sharma',
    email: 'rajesh.sharma@demo.com',
    phone: '9822011001',
    role: 'candidate',
    profile_picture_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
    headline: 'Senior CNC Operator & Machinist (ITI Certified)',
    title: 'Senior CNC Operator',
    trade_specialization: 'CNC Machinist',
    industry: 'Automotive & Auto Components',
    location: 'Waluj MIDC, Chhatrapati Sambhajinagar',
    skills: ['CNC Operating', 'VMC', 'Fanuc', 'Precision Turning', 'Shop Safety'],
    experience: '6 Years',
    experience_years: 6,
    education: 'ITI Machinist - Govt ITI Sambhajinagar',
    aadhaar_verified: true,
    verified: true,
    preferred_shift: 'Day Shift',
    notice_period: 'Immediate (15 Days)',
    bio: 'Certified ITI Machinist with 6+ years experience operating CNC & VMC machines in automotive manufacturing units in Waluj MIDC.',
  },
  {
    id: 'cand-102',
    name: 'Amitabh Verma',
    email: 'amitabh.verma@demo.com',
    phone: '9822011002',
    role: 'candidate',
    profile_picture_url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80',
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80',
    headline: 'VMC Programmer & CAD/CAM Designer',
    title: 'VMC Programmer',
    trade_specialization: 'VMC Operator / Programmer',
    industry: 'Industrial & Heavy Manufacturing',
    location: 'Chikalthana MIDC, Chhatrapati Sambhajinagar',
    skills: ['VMC Programming', 'Mastercam', 'AutoCAD', 'Fixture Design'],
    experience: '4 Years',
    experience_years: 4,
    education: 'Diploma in Mechanical Engineering',
    aadhaar_verified: true,
    verified: true,
    preferred_shift: 'Rotational Shift',
    notice_period: '1 Month',
    bio: 'Experienced VMC programmer proficient in Mastercam and 3D G-code generation for precision component manufacturing.',
  },
  {
    id: 'cand-103',
    name: 'Sunil Deshmukh',
    email: 'sunil.deshmukh@demo.com',
    phone: '9822011003',
    role: 'candidate',
    profile_picture_url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=400&q=80',
    avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=400&q=80',
    headline: 'Certified Industrial Electrician & PLC Maintenance Specialist',
    title: 'Industrial Electrician',
    trade_specialization: 'Industrial Electrician',
    industry: 'Electronics & Electricals',
    location: 'Shendra MIDC, Chhatrapati Sambhajinagar',
    skills: ['PLC Maintenance', 'Siemens TIA Portal', 'Control Wiring', 'HT/LT Panels'],
    experience: '8 Years',
    experience_years: 8,
    education: 'ITI Electrician Trade',
    aadhaar_verified: true,
    verified: true,
    preferred_shift: 'Day Shift',
    notice_period: 'Immediate',
    bio: 'Senior plant electrician with 8 years experience in Siemens PLC troubleshooting, motor drives, and factory electrical wiring.',
  },
  {
    id: 'cand-104',
    name: 'Vikram Kulkarni',
    email: 'vikram.kulkarni@demo.com',
    phone: '9822011004',
    role: 'candidate',
    profile_picture_url: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=400&q=80',
    avatarUrl: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=400&q=80',
    headline: 'Quality Control Inspector & CMM Specialist',
    title: 'Quality Inspector',
    trade_specialization: 'Quality Inspector (QA/QC)',
    industry: 'Automotive & Auto Components',
    location: 'Waluj MIDC, Chhatrapati Sambhajinagar',
    skills: ['CMM Inspection', 'IATF 16949', 'Metrology', 'Vernier & Micrometer'],
    experience: '5 Years',
    experience_years: 5,
    education: 'B.E. Mechanical Engineering',
    aadhaar_verified: true,
    verified: true,
    preferred_shift: 'Rotational Shift',
    notice_period: '15 Days',
    bio: 'Mechanical Quality Engineer specialized in CMM machine programming and automotive part inspection per IATF standards.',
  },
  {
    id: 'cand-105',
    name: 'Pradeep Shinde',
    email: 'pradeep.shinde@demo.com',
    phone: '9822011005',
    role: 'candidate',
    profile_picture_url: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=400&q=80',
    avatarUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=400&q=80',
    headline: 'High-Pressure Heavy MIG & TIG Welder',
    title: 'MIG/TIG Welder',
    trade_specialization: 'MIG / TIG Welder',
    industry: 'Iron, Steel & Metallurgy',
    location: 'Paithan MIDC, Chhatrapati Sambhajinagar',
    skills: ['MIG Welding', 'TIG Welding', 'Structural Fabrication', 'X-Ray Quality'],
    experience: '7 Years',
    experience_years: 7,
    education: 'ITI Welder Trade Certificate',
    aadhaar_verified: true,
    verified: true,
    preferred_shift: 'Day Shift',
    notice_period: 'Immediate',
    bio: 'Certified X-Ray welder with 7 years expertise in heavy chassis fabrication, stainless steel TIG, and CO2 welding.',
  },
  {
    id: 'cand-106',
    name: 'Sachin Joshi',
    email: 'sachin.joshi@demo.com',
    phone: '9822011006',
    role: 'candidate',
    profile_picture_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
    headline: 'Warehouse & Inventory Store Supervisor (SAP MM)',
    title: 'Store Keeper',
    trade_specialization: 'Store Keeper / Supervisor',
    industry: 'Logistics, Supply Chain & Warehousing',
    location: 'Chikalthana MIDC, Chhatrapati Sambhajinagar',
    skills: ['SAP MM', 'Inventory Control', 'Goods Receipt', 'Dispatch Management'],
    experience: '6 Years',
    experience_years: 6,
    education: 'Graduate - B.Com Dr. BAMU University',
    aadhaar_verified: true,
    verified: true,
    preferred_shift: 'Day Shift',
    notice_period: '15 Days',
    bio: 'Store supervisor managing industrial raw material inventory, SAP MM transactions, and dispatch logistics.',
  },
  {
    id: 'cand-107',
    name: 'Anil Gavhane',
    email: 'anil.gavhane@demo.com',
    phone: '9822011007',
    role: 'candidate',
    profile_picture_url: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=400&q=80',
    avatarUrl: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=400&q=80',
    headline: 'Senior Hydraulics & Pneumatics Maintenance Engineer',
    title: 'Plant Maintenance Engineer',
    trade_specialization: 'Plant Maintenance',
    industry: 'Industrial & Heavy Manufacturing',
    location: 'Railway Station MIDC, Chhatrapati Sambhajinagar',
    skills: ['Hydraulics', 'Pneumatics', 'Preventive Maintenance', 'Press Overhaul'],
    experience: '9 Years',
    experience_years: 9,
    education: 'Diploma in Electrical & Mechanical',
    aadhaar_verified: true,
    verified: true,
    preferred_shift: 'Rotational Shift',
    notice_period: 'Immediate',
    bio: 'Maintenance expert specializing in hydraulic press overhauls, pneumatic valve manifolds, and breakdown reduction.',
  },
  {
    id: 'cand-108',
    name: 'Pooja Kale',
    email: 'pooja.kale@demo.com',
    phone: '9822011008',
    role: 'candidate',
    profile_picture_url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80',
    avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80',
    headline: 'Fresher QC Chemist & Formulation Trainee (B.Sc Chemistry)',
    title: 'QC Chemist / Trainee',
    trade_specialization: 'Quality Inspector (QA/QC)',
    industry: 'Pharmaceuticals & Chemicals',
    location: 'Shendra MIDC, Chhatrapati Sambhajinagar',
    skills: ['HPLC Basics', 'Titration', 'GMP Standards', 'Lab Safety', 'Spectrophotometer'],
    experience: 'Fresher (0 Yrs)',
    experience_years: 0,
    education: 'Graduate (B.Sc Chemistry) - 2026 Batch',
    aadhaar_verified: true,
    verified: true,
    preferred_shift: 'Day Shift',
    notice_period: 'Immediate',
    bio: 'Motivated chemistry graduate seeking Entry-level QC Chemist / Formulation Trainee role in pharmaceutical or chemical manufacturing plants.',
  },
  {
    id: 'cand-109',
    name: 'Dnyaneshwar Rathod',
    email: 'dnyaneshwar.rathod@demo.com',
    phone: '9822011009',
    role: 'candidate',
    profile_picture_url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80',
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80',
    headline: 'Fresher ITI Fitter & Assembly Trainee',
    title: 'Assembly Operator Trainee',
    trade_specialization: 'Industrial Fitter',
    industry: 'Automotive & Auto Components',
    location: 'Chitegaon MIDC, Chhatrapati Sambhajinagar',
    skills: ['Bench Fitting', 'Blueprint Reading', 'Hand Tools', 'Shopfloor 5S'],
    experience: 'Fresher (0 Yrs)',
    experience_years: 0,
    education: 'ITI / Trade Certified (Fitter Trade 2026)',
    aadhaar_verified: true,
    verified: true,
    preferred_shift: 'Rotational Shift',
    notice_period: 'Immediate',
    bio: 'Fresh ITI Fitter looking to kickstart industrial career as Machine Assembler or Production Trainee.',
  },
  {
    id: 'cand-110',
    name: 'Gaurav Patil',
    email: 'gaurav.patil@demo.com',
    phone: '9822011010',
    role: 'candidate',
    profile_picture_url: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=400&q=80',
    avatarUrl: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=400&q=80',
    headline: 'Plastic Injection Moulding Machine Operator & Setter',
    title: 'Injection Moulding Operator',
    trade_specialization: 'Assembly Operator',
    industry: 'Plastics, Polymers & Rubber',
    location: 'Waluj MIDC, Chhatrapati Sambhajinagar',
    skills: ['Injection Moulding', 'Mould Setting', 'Polymer Processing', 'Cycle Time Optimization'],
    experience: '3 Years',
    experience_years: 3,
    education: 'Diploma / Polytechnic (Polymer Engineering)',
    aadhaar_verified: true,
    verified: true,
    preferred_shift: 'Rotational Shift',
    notice_period: '15 Days',
    bio: 'Skilled injection moulding operator with 3 years hands-on experience on Toshiba & Engel machines.',
  },
  {
    id: 'cand-111',
    name: 'Suresh Gaikwad',
    email: 'suresh.gaikwad@demo.com',
    phone: '9822011011',
    role: 'candidate',
    profile_picture_url: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=400&q=80',
    avatarUrl: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=400&q=80',
    headline: 'Food Packaging & Bottling Line Operator',
    title: 'Food Packaging Operator',
    trade_specialization: 'Assembly Operator',
    industry: 'Food Processing & FMCG',
    location: 'Paithan MIDC, Chhatrapati Sambhajinagar',
    skills: ['Packaging Line', 'Bottling Automation', 'Food Safety Standards', 'FSSAI Compliance'],
    experience: '2 Years',
    experience_years: 2,
    education: '12th Pass (HSC)',
    aadhaar_verified: true,
    verified: true,
    preferred_shift: 'Day Shift',
    notice_period: 'Immediate',
    bio: 'Packaging operator with FMCG line experience in automated bottle capping, labeling, and shrink wrapping.',
  },
  {
    id: 'cand-112',
    name: 'Mahesh Jadhav',
    email: 'mahesh.jadhav@demo.com',
    phone: '9822011012',
    role: 'candidate',
    profile_picture_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
    headline: 'Industrial Sewing & Garment Quality Checker',
    title: 'Garment Technician',
    trade_specialization: 'Assembly Operator',
    industry: 'Textiles & Garments',
    location: 'Chikalthana MIDC, Chhatrapati Sambhajinagar',
    skills: ['Industrial Sewing', 'Pattern Stitching', 'Garment Inspection', 'Thread Tensioning'],
    experience: '4 Years',
    experience_years: 4,
    education: '10th / Below 10th',
    aadhaar_verified: true,
    verified: true,
    preferred_shift: 'Day Shift',
    notice_period: 'Immediate',
    bio: 'Garment and textile machine operator skilled in heavy denim and industrial safety suit manufacturing.',
  },
];

