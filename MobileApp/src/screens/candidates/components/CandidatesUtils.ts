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
  experience?: string;
  skills?: string[];
  avatarUrl?: string;
  phone?: string;
  email?: string;
  education?: string;
  bio?: string;
  resume_url?: string;
  resumeUrl?: string;
  resume?: string;
  notice_period?: string;
  preferred_shift?: string;
}

export const FILTER_TAGS = ['VMC Programming', 'Mastercam', 'AutoCAD', 'Fixture Design', 'Hydraulics', 'CNC Operator'];

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

export const CANDIDATE_SEARCH_SUGGESTIONS = [
  'Search candidates by name or skill...',
  'Search by trade (e.g. VMC, Fitter)...',
  'Search by location (e.g. MIDC)...',
  'Search by education (e.g. ITI, BE)...',
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
    location: 'Waluj MIDC, Chhatrapati Sambhajinagar',
    skills: ['CNC Operating', 'VMC', 'Fanuc', 'Precision Turning', 'Shop Safety'],
    experience: '6 Years',
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
    trade_specialization: 'VMC Programmer',
    location: 'Chikalthana MIDC, Chhatrapati Sambhajinagar',
    skills: ['VMC Programming', 'Mastercam', 'AutoCAD', 'Fixture Design'],
    experience: '4 Years',
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
    location: 'Shendra MIDC, Chhatrapati Sambhajinagar',
    skills: ['PLC Maintenance', 'Siemens TIA Portal', 'Control Wiring', 'HT/LT Panels'],
    experience: '8 Years',
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
    trade_specialization: 'Quality Assurance',
    location: 'Waluj MIDC, Chhatrapati Sambhajinagar',
    skills: ['CMM Inspection', 'IATF 16949', 'Metrology', 'Vernier & Micrometer'],
    experience: '5 Years',
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
    trade_specialization: 'MIG/TIG Welder',
    location: 'Paithan MIDC, Chhatrapati Sambhajinagar',
    skills: ['MIG Welding', 'TIG Welding', 'Structural Fabrication', 'X-Ray Quality'],
    experience: '7 Years',
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
    trade_specialization: 'Store Keeper',
    location: 'Chikalthana MIDC, Chhatrapati Sambhajinagar',
    skills: ['SAP MM', 'Inventory Control', 'Goods Receipt', 'Dispatch Management'],
    experience: '6 Years',
    education: 'B.Com - Dr. BAMU University',
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
    location: 'Railway Station MIDC, Chhatrapati Sambhajinagar',
    skills: ['Hydraulics', 'Pneumatics', 'Preventive Maintenance', 'Press Overhaul'],
    experience: '9 Years',
    education: 'Diploma in Electrical & Mechanical',
    aadhaar_verified: true,
    verified: true,
    preferred_shift: 'Rotational Shift',
    notice_period: 'Immediate',
    bio: 'Maintenance expert specializing in hydraulic press overhauls, pneumatic valve manifolds, and breakdown reduction.',
  },
];
