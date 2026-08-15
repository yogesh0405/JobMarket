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
  'Manufacturing & Assembly',
  'CNC Machining & Tooling',
  'Welding & Metal Fabrication',
  'Electricals & Electronics',
  'Quality & Inspection',
  'Logistics & Warehouse',
  'Pharma & Healthcare',
  'Automotive & Engineering',
];

export const EDUCATIONS = [
  'Select Education',
  '10th Pass',
  '12th Pass',
  'ITI Certificate',
  'Diploma',
  'Graduate (BE / B.Tech / BA / B.Com)',
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

export const HOSPITAL_GRID = [
  { name: 'Staff Nurse', icon: HeartPulse },
  { name: 'Ward Boy / Assistant', icon: HeartPulse },
  { name: 'Lab Assistant', icon: HeartPulse },
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
