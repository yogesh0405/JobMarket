import { COLORS } from '../../../constants/theme';
import {
  Wrench,
  Zap,
  Tv,
  Power,
  Cog,
  Package,
  Search,
  GraduationCap,
  Briefcase,
  Shield,
  Folder,
  BarChart2,
  FileText,
  CheckCircle2,
  HeartPulse,
  Utensils,
  BookOpen,
} from 'lucide-react-native';

export interface RoleTabItem {
  id: string;
  label: string;
  keyword: string;
  enabled: boolean;
  priority: number;
}

export const PROMO_BANNERS = [
  {
    id: 'banner-1',
    badge: '⚡ MEGA WALK-IN DRIVE',
    title: '500+ Vacancies in Chakan & Waluj MIDC',
    description: 'Spot job offers for ITI Fitters, Welders, CNC Operators & Machine Helpers. Free bus & canteen.',
    image: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=800&q=70',
    tag: 'Chakan MIDC',
    btnText: 'Register Spot Interview',
    color: COLORS.primary,
  },
  {
    id: 'banner-2',
    badge: '⭐ TATA MOTORS RECRUITMENT',
    title: 'Apprentice & Technician Campaign',
    description: 'Immediate openings for 1st & 2nd shift. High stipend + monthly attendance bonus.',
    image: 'https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?auto=format&fit=crop&w=800&q=70',
    tag: 'Tata Motors',
    btnText: 'Apply Now',
    color: '#065F46',
  },
  {
    id: 'banner-3',
    badge: '🔥 URGENT HIRING',
    title: 'Senior CNC & VMC Operators Needed',
    description: 'High salary package up to ₹35,000/month + Overtime + Free Hostel accommodation.',
    image: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=70',
    tag: 'CNC Operator',
    btnText: 'View Vacancy Details',
    color: '#991B1B',
  },
  {
    id: 'banner-4',
    badge: '🏛️ GOVT APPRENTICESHIP',
    title: 'Govt Skill Certification Drive 2026',
    description: 'Government authorized NSDC apprenticeship scheme with official trade certification.',
    image: 'https://images.unsplash.com/photo-1581092335397-9583fe92d232?auto=format&fit=crop&w=800&q=70',
    tag: 'Apprentice',
    btnText: 'Apply Online',
    color: COLORS.primary,
  },
];

export const INDUSTRIES = [
  'Select Industry',
  'Automotive & Auto Components',
  'Industrial Manufacturing & Assembly',
  'CNC Machining & Tooling',
  'Welding & Metal Fabrication',
  'Electronics & Electricals',
  'Quality & Inspection',
  'Logistics & Warehousing',
  'Pharmaceuticals & Chemicals',
  'Textiles & Garments',
  'Construction & Infrastructure',
  'Services & General Engineering',
];

export const EDUCATIONS = [
  'Select Education',
  '10th Pass',
  '12th Pass',
  'ITI Certificate (Fitter / Welder / Electrician / CNC / Turner)',
  'Diploma (Mechanical / Electrical / Civil / Automobile)',
  'B.E. / B.Tech (Mechanical / Production / Electrical / ECE)',
  'Graduate (BA / B.Com / B.Sc / BCA / BBA)',
  'Post Graduate (M.Tech / MBA / MCA)',
];

export const MIDC_ZONES = [
  'Chakan MIDC (Pune)',
  'Bhosari MIDC (PCMC Pune)',
  'Ranjangaon MIDC (Pune)',
  'Talegaon MIDC (Pune)',
  'Hadapsar Industrial Estate',
  'Waluj MIDC (Chhatrapati Sambhajinagar)',
  'Shendra MIDC (Chhatrapati Sambhajinagar)',
  'Taloja MIDC (Navi Mumbai)',
  'Rabale MIDC (Navi Mumbai)',
  'Thane Belapur Industrial Area',
  'Tarapur MIDC (Palghar)',
  'Additional Ambernath MIDC (Thane)',
  'Satpur MIDC (Nashik)',
  'Ambad MIDC (Nashik)',
  'Kagal Five Star MIDC (Kolhapur)',
  'Gokul Shirgaon MIDC (Kolhapur)',
  'Butibori MIDC (Nagpur)',
  'Roha MIDC (Raigad)',
  'Pimpri Industrial Zone',
  'Khed City MIDC',
];

export const DEFAULT_ROLE_TABS_DATA: RoleTabItem[] = [
  { id: 'All Opportunities', label: '1. All Opportunities', keyword: '', enabled: true, priority: 1 },
  { id: 'Welder', label: '2. Welder', keyword: 'welder', enabled: true, priority: 2 },
  { id: 'CNC Operator', label: '3. CNC Operator', keyword: 'cnc', enabled: true, priority: 3 },
  { id: 'Fitter', label: '4. Fitter', keyword: 'fitter', enabled: true, priority: 4 },
  { id: 'Electrician', label: '5. Electrician', keyword: 'electrician', enabled: true, priority: 5 },
  { id: 'Machinist', label: '6. Machinist', keyword: 'machinist', enabled: true, priority: 6 },
  { id: 'Quality Inspector', label: '7. Quality Inspector', keyword: 'quality', enabled: true, priority: 7 },
];

export const ITI_TRADES_GRID = [
  { name: 'Fitter', icon: Wrench },
  { name: 'Welder', icon: Zap },
  { name: 'CNC Operator', icon: Tv },
  { name: 'Electrician', icon: Power },
  { name: 'Machinist', icon: Cog },
  { name: 'Helper / Loader', icon: Package },
  { name: 'Quality Inspector', icon: Search },
  { name: 'Apprentice', icon: GraduationCap },
  { name: 'Driver / Forklift', icon: Briefcase },
  { name: 'Security Guard', icon: Shield },
  { name: 'Store Keeper', icon: Folder },
  { name: 'Technician', icon: Wrench },
];

export interface ITITradeHorizontalItem {
  id: string;
  name: string;
  image: string;
  startingSalary: string;
  keyword: string;
}

export const ITI_HORIZONTAL_DATA: ITITradeHorizontalItem[] = [
  {
    id: 'fitter',
    name: 'Fitter',
    image: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=600&q=80',
    startingSalary: '₹20,000/m',
    keyword: 'Fitter',
  },
  {
    id: 'welder',
    name: 'Welder',
    image: 'https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?w=600&q=80',
    startingSalary: '₹24,000/m',
    keyword: 'Welder',
  },
  {
    id: 'cnc-operator',
    name: 'CNC Operator',
    image: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=600&q=80',
    startingSalary: '₹25,000/m',
    keyword: 'CNC',
  },
  {
    id: 'electrician',
    name: 'Electrician',
    image: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=600&q=80',
    startingSalary: '₹22,000/m',
    keyword: 'Electrician',
  },
  {
    id: 'machinist',
    name: 'Machinist',
    image: 'https://images.unsplash.com/photo-1505798577917-a65157d3320a?w=600&q=80',
    startingSalary: '₹21,000/m',
    keyword: 'Machinist',
  },
  {
    id: 'technician',
    name: 'Technician',
    image: 'https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600&q=80',
    startingSalary: '₹23,000/m',
    keyword: 'Technician',
  },
];

export const EDUCATION_GRID = [
  { name: '12th Pass Jobs', icon: GraduationCap },
  { name: 'B.Com Jobs', icon: BarChart2 },
  { name: 'BA Jobs', icon: FileText },
  { name: 'B.E. / B.Tech Jobs', icon: Cog },
  { name: 'Diploma Jobs', icon: CheckCircle2 },
  { name: 'BCA Jobs', icon: Tv },
  { name: 'BBA Jobs', icon: BarChart2 },
  { name: 'B.Sc Jobs', icon: Tv },
  { name: '10th Pass Jobs', icon: GraduationCap },
];

export interface EducationHorizontalItem {
  id: string;
  name: string;
  image: string;
  startingSalary: string;
  keyword: string;
}

export const EDUCATION_HORIZONTAL_DATA: EducationHorizontalItem[] = [
  {
    id: '10th-pass',
    name: '10th Pass Jobs',
    image: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=600&q=80',
    startingSalary: '₹12,000/m',
    keyword: '10th Pass',
  },
  {
    id: '12th-pass',
    name: '12th Pass Jobs',
    image: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=600&q=80',
    startingSalary: '₹15,000/m',
    keyword: '12th Pass',
  },
  {
    id: 'diploma',
    name: 'Diploma Jobs',
    image: 'https://images.unsplash.com/photo-1509062522246-3755977927d7?w=600&q=80',
    startingSalary: '₹20,000/m',
    keyword: 'Diploma',
  },
  {
    id: 'graduate',
    name: 'Graduate (BA / B.Com)',
    image: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=600&q=80',
    startingSalary: '₹18,000/m',
    keyword: 'Graduate',
  },
  {
    id: 'btech',
    name: 'B.E. / B.Tech Jobs',
    image: 'https://images.unsplash.com/photo-1531482615713-2afd69097998?w=600&q=80',
    startingSalary: '₹28,000/m',
    keyword: 'B.E.',
  },
  {
    id: 'bca',
    name: 'BCA / IT Graduate',
    image: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=600&q=80',
    startingSalary: '₹22,000/m',
    keyword: 'BCA',
  },
];

export interface HospitalRoleItem {
  id: string;
  name: string;
  image: string;
  startingSalary: string;
  keyword: string;
}

export const HOSPITAL_HORIZONTAL_DATA: HospitalRoleItem[] = [
  {
    id: 'staff-nurse',
    name: 'Staff Nurse',
    image: 'https://images.unsplash.com/photo-1576765608535-5f04d1e3f289?w=600&q=80',
    startingSalary: '₹18,000/m',
    keyword: 'Staff Nurse',
  },
  {
    id: 'ward-boy',
    name: 'Ward Boy / Assistant',
    image: 'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?w=600&q=80',
    startingSalary: '₹14,000/m',
    keyword: 'Ward Boy',
  },
  {
    id: 'lab-assistant',
    name: 'Lab Assistant',
    image: 'https://images.unsplash.com/photo-1579154204601-01588f351e67?w=600&q=80',
    startingSalary: '₹16,000/m',
    keyword: 'Lab Assistant',
  },
  {
    id: 'pharmacist',
    name: 'Pharmacist',
    image: 'https://images.unsplash.com/photo-1587854692152-cbe660dbde88?w=600&q=80',
    startingSalary: '₹22,000/m',
    keyword: 'Pharmacist',
  },
];

export const HOSPITAL_GRID = [
  { name: 'Staff Nurse', icon: HeartPulse },
  { name: 'Ward Boy / Assistant', icon: HeartPulse },
  { name: 'Lab Assistant', icon: HeartPulse },
  { name: 'Pharmacist', icon: HeartPulse },
];

export const HOTEL_GRID = [
  { name: 'Commi 1 Chef / Cook', icon: Utensils },
  { name: 'Hotel Waiter', icon: Utensils },
  { name: 'Housekeeping Associate', icon: Utensils },
];

export const SCHOOL_GRID = [
  { name: 'Primary Teacher', icon: BookOpen },
  { name: 'High School Teacher', icon: BookOpen },
  { name: 'Librarian Assistant', icon: HeartPulse },
];
