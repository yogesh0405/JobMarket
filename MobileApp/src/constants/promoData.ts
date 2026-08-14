import { COLORS } from './theme';
export interface PromoBanner {
  id: string;
  badge: string;
  title: string;
  description: string;
  image: string;
  tag: string;
  btnText: string;
  color: string;
}

export const PROMO_BANNERS: PromoBanner[] = [
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
    btnText: 'Check Eligibility',
    color: '#D97706',
  },
];
