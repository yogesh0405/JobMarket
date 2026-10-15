import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Search,
  MapPin,
  Briefcase,
  ChevronLeft,
  ChevronRight,
  ArrowRight,
  X,
  Award,
  SlidersHorizontal,
  GraduationCap,
  ChevronDown,
  Star,
  Clock,
  Building2,
  Users,
  Bookmark,
  HeartPulse,
  Utensils,
  BookOpen,
  CheckCircle2,
  ShieldCheck,
  Zap,
  Wrench,
  Cog,
  Package,
} from 'lucide-react';
import { useJobs } from '../../hooks/useJobs';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../hooks/useToast';
import { CompanyDefaultLogo } from '../../components/company/CompanyDefaultLogo';
import { BannerSlider } from '../../components/home/BannerSlider';
import { Job } from '../../types';
import {
  JobFilterModal,
  JobFilterValues,
  DEFAULT_JOB_FILTERS,
} from '../../components/job/JobFilterModal';

// Constants matching Mobile App
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
  'Waluj MIDC, Chhatrapati Sambhajinagar',
  'Shendra MIDC, Chhatrapati Sambhajinagar',
  'Chikalthana MIDC, Chhatrapati Sambhajinagar',
  'Chakan MIDC, Pune',
  'Bhosari MIDC, Pune',
  'Taloja MIDC, Navi Mumbai',
  'Thane Belapur MIDC',
  'Ranjangaon MIDC',
  'Pimpri Industrial Zone',
];

const DEFAULT_ROLE_TABS = [
  { id: 'All Opportunities', label: '1. All Opportunities', keyword: '' },
  { id: 'CNC Operator', label: '2. CNC Operator', keyword: 'cnc' },
  { id: 'Welder', label: '3. Welder', keyword: 'welder' },
  { id: 'Fitter', label: '4. Fitter', keyword: 'fitter' },
  { id: 'Electrician', label: '5. Electrician', keyword: 'electrician' },
  { id: 'Quality Inspector', label: '6. Quality Inspector', keyword: 'quality' },
  { id: 'Assembly Operator', label: '7. Assembly Operator', keyword: 'assembly' },
];

const ITI_TRADES_GRID = [
  { name: 'CNC / VMC Operator', icon: Cog, keyword: 'cnc' },
  { name: 'Welder / Fabricator', icon: Zap, keyword: 'welder' },
  { name: 'Fitter & Assembly', icon: Wrench, keyword: 'fitter' },
  { name: 'Electrician & Wireman', icon: Zap, keyword: 'electrician' },
  { name: 'Quality Inspector', icon: Award, keyword: 'quality' },
  { name: 'Machine Operator', icon: Cog, keyword: 'operator' },
  { name: 'Turner / Machinist', icon: Wrench, keyword: 'machinist' },
  { name: 'Tool & Die Maker', icon: Cog, keyword: 'tool' },
  { name: 'Store & Inventory', icon: Package, keyword: 'store' },
  { name: 'Helper & Loader', icon: Package, keyword: 'helper' },
  { name: 'Forklift Operator / Driver', icon: Briefcase, keyword: 'driver' },
  { name: 'Maintenance Technician', icon: Wrench, keyword: 'maintenance' },
];

const EDUCATION_GRID = [
  { name: '10th / 12th Pass', icon: GraduationCap, keyword: '10th 12th ssc hsc' },
  { name: 'ITI Certified', icon: Award, keyword: 'iti fitter welder electrician turner' },
  { name: 'Diploma Holder', icon: GraduationCap, keyword: 'diploma polytechnic' },
  { name: 'B.E. / B.Tech', icon: GraduationCap, keyword: 'b.e b.tech engineering engineer' },
  { name: 'Graduate Degree', icon: GraduationCap, keyword: 'graduate graduation bachelor degree' },
  { name: 'Post Graduate', icon: GraduationCap, keyword: 'postgraduate master mba mca' },
];

const HOSPITAL_GRID = [
  { name: 'Staff Nurse', icon: HeartPulse, keyword: 'nurse' },
  { name: 'Ward Attendant', icon: HeartPulse, keyword: 'ward' },
  { name: 'Lab Technician', icon: HeartPulse, keyword: 'lab' },
  { name: 'Pharmacy Assistant', icon: HeartPulse, keyword: 'pharmacy' },
  { name: 'Hospital Admin', icon: HeartPulse, keyword: 'hospital' },
  { name: 'Radiology Tech', icon: HeartPulse, keyword: 'radiology' },
];

const TRADE_FALLBACK_IMAGE = 'https://images.unsplash.com/photo-158109226825-a6a2a5aee158?w=600&q=80';
const HEALTHCARE_FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=600&q=80';
const EDUCATION_FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=600&q=80';

export interface HorizontalCardItem {
  id: string;
  name: string;
  image: string;
  startingSalary: string;
  keyword: string;
}

export const ITI_HORIZONTAL_DATA: HorizontalCardItem[] = [
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

export const EDUCATION_HORIZONTAL_DATA: HorizontalCardItem[] = [
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

export const HOSPITAL_HORIZONTAL_DATA: HorizontalCardItem[] = [
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

const SafeCardImage: React.FC<{ src: string; fallbackSrc: string; alt: string }> = ({ src, fallbackSrc, alt }) => {
  const [imgSrc, setImgSrc] = useState(src);
  return (
    <img
      src={imgSrc}
      alt={alt}
      onError={() => {
        if (imgSrc !== fallbackSrc) setImgSrc(fallbackSrc);
      }}
      className="home-horizontal-card-img"
      loading="lazy"
    />
  );
};

const EXPERIENCE_FILTER_OPTIONS = [
  'All Experience',
  'Fresher (0 Years)',
  '1–3 Years',
  '3–5 Years',
  '5+ Years',
];

interface HorizontalMenuFilterBarProps {
  location: string;
  onLocationChange: (loc: string) => void;
  experience: string;
  onExperienceChange: (exp: string) => void;
  availableLocations: string[];
  totalCardsCount: number;
  matchingCardsCount: number;
  showAllCards: boolean;
  onToggleShowAll: () => void;
  onReset: () => void;
}

const HorizontalMenuFilterBar: React.FC<HorizontalMenuFilterBarProps> = ({
  location,
  onLocationChange,
  experience,
  onExperienceChange,
  availableLocations,
  totalCardsCount,
  matchingCardsCount,
  showAllCards,
  onToggleShowAll,
  onReset,
}) => {
  const isFiltered = location !== 'All Locations' || experience !== 'All Experience';

  return (
    <div className="home-horizontal-filter-row">
      <div className={`home-horizontal-filter-badge ${location !== 'All Locations' ? 'active-filter' : ''}`}>
        <MapPin size={14} color={location !== 'All Locations' ? '#1B4FDF' : '#64748B'} />
        <select
          value={location}
          onChange={(e) => onLocationChange(e.target.value)}
          className="home-horizontal-filter-select"
          aria-label="Filter by Location"
        >
          <option value="All Locations">All Locations</option>
          {availableLocations.map((loc) => (
            <option key={loc} value={loc}>
              {loc}
            </option>
          ))}
        </select>
      </div>

      <div className={`home-horizontal-filter-badge ${experience !== 'All Experience' ? 'active-filter' : ''}`}>
        <Briefcase size={14} color={experience !== 'All Experience' ? '#1B4FDF' : '#64748B'} />
        <select
          value={experience}
          onChange={(e) => onExperienceChange(e.target.value)}
          className="home-horizontal-filter-select"
          aria-label="Filter by Experience"
        >
          {EXPERIENCE_FILTER_OPTIONS.map((exp) => (
            <option key={exp} value={exp}>
              {exp}
            </option>
          ))}
        </select>
      </div>

      {isFiltered && (
        <button
          type="button"
          onClick={onReset}
          className="home-horizontal-filter-clear"
          title="Reset filters"
        >
          <X size={13} />
          <span>Clear</span>
        </button>
      )}

      {isFiltered && (
        <div className="home-horizontal-count-indicator">
          <span>
            {matchingCardsCount} of {totalCardsCount} available
          </span>
          {matchingCardsCount < totalCardsCount && (
            <button
              type="button"
              onClick={onToggleShowAll}
              className="home-horizontal-toggle-show-btn"
            >
              {showAllCards ? 'Show Matching Only' : 'Show All'}
            </button>
          )}
        </div>
      )}
    </div>
  );
};



const HOTEL_GRID = [
  { name: 'Chef & Cook', icon: Utensils, keyword: 'cook' },
  { name: 'Housekeeping Staff', icon: Utensils, keyword: 'housekeeping' },
  { name: 'F&B Server', icon: Utensils, keyword: 'waiter' },
  { name: 'Front Desk / Reception', icon: Utensils, keyword: 'reception' },
  { name: 'Kitchen Helper', icon: Utensils, keyword: 'kitchen' },
  { name: 'Hotel Maintenance', icon: Utensils, keyword: 'hotel' },
];

const SCHOOL_GRID = [
  { name: 'Subject Teacher', icon: BookOpen, keyword: 'teacher' },
  { name: 'Office Assistant / Clerk', icon: BookOpen, keyword: 'clerk' },
  { name: 'Peon & Attendant', icon: BookOpen, keyword: 'peon' },
  { name: 'Lab Assistant', icon: BookOpen, keyword: 'assistant' },
  { name: 'Campus Security Guard', icon: BookOpen, keyword: 'security' },
  { name: 'School Bus Driver', icon: BookOpen, keyword: 'driver' },
];

const SEARCH_PLACEHOLDERS = [
  'Search jobs...',
  'Search trades (CNC, Welder, Fitter)...',
  'Search locations (Waluj, Chakan, Pune)...',
];

function formatTimeAgo(dateString?: string): string {
  if (!dateString) return 'Just now';
  const str = String(dateString).trim();
  if (/^\d+[mhdws]\s+ago$/i.test(str) || str.toLowerCase() === 'just now') {
    return str;
  }
  const posted = new Date(str);
  if (isNaN(posted.getTime())) return 'Just now';
  const now = new Date();
  const diffMs = now.getTime() - posted.getTime();
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  if (diffHours < 1) {
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    return diffMinutes <= 1 ? 'Just now' : `${diffMinutes}m ago`;
  }
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) return `${diffDays}d ago`;
  return `${Math.floor(diffDays / 7)}w ago`;
}

export const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const { getJobs, toggleSaveJob, isJobSaved, fetchCandidateSavedJobs } = useJobs();
  const { currentUser } = useAuth();
  const { showToast } = useToast();

  const [placeholderIndex, setPlaceholderIndex] = useState(0);
  const [topSearch, setTopSearch] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isInputFocused, setIsInputFocused] = useState(false);
  const [homeFilterDrawerOpen, setHomeFilterDrawerOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);

  const searchContainerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Keyboard shortcut listener (Cmd+K / Ctrl+K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        navigate('/search');
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Close suggestions on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
        setIsInputFocused(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Active Role Tab
  const [activeRoleTab, setActiveRoleTab] = useState('All Opportunities');

  // Sync candidate saved jobs from PostgreSQL on mount
  useEffect(() => {
    if (currentUser && fetchCandidateSavedJobs) {
      fetchCandidateSavedJobs();
    }
  }, [currentUser?.id, fetchCandidateSavedJobs]);

  const handleToggleSaveJob = (jobId: string, e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    if (!currentUser) {
      showToast('Please log in to save jobs', 'warning');
      navigate('/login');
      return;
    }
    const isNowSaved = toggleSaveJob(jobId);
    showToast(
      isNowSaved ? 'Job saved to your bookmarks! 🔖' : 'Job removed from saved',
      isNowSaved ? 'success' : 'info'
    );
  };

  // Rotating placeholder
  useEffect(() => {
    const timer = setInterval(() => {
      setPlaceholderIndex((prev) => (prev + 1) % SEARCH_PLACEHOLDERS.length);
    }, 2000);
    return () => clearInterval(timer);
  }, []);

  const allJobs = useMemo(() => {
    return getJobs({});
  }, [getJobs]);

  const getRealJobCount = useCallback(
    (keyword: string) => {
      const q = keyword.toLowerCase().trim();
      if (!q) return allJobs.length;
      const tokens = q.split(/[\s/&,-]+/).filter((t) => t.length > 0 && !['and', 'or', 'in', 'of', 'for', 'the'].includes(t));
      return allJobs.filter((j) => {
        const fullJobText = [
          j.title,
          j.company,
          j.description,
          j.location,
          j.industry,
          (j as any).industryType,
          j.trade,
          (j as any).itiTrade,
          j.workMode,
          j.jobType,
          j.midcZone,
          (j as any).shiftDetails,
          j.educationRequirement,
          (j as any).education_requirement,
          (j as any).education_level,
          ...(j.skills || []),
          ...(j.requirements || []),
        ].filter(Boolean).join(' ').toLowerCase();

        return tokens.length > 0
          ? tokens.some((token) => {
              if (token.length <= 3) {
                const escaped = token.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
                return new RegExp(`\\b${escaped}\\b`, 'i').test(fullJobText);
              }
              return fullJobText.includes(token);
            })
          : true;
      }).length;
    },
    [allJobs]
  );

  // Horizontal Section Real-Time Filters
  const [tradeLocationFilter, setTradeLocationFilter] = useState('All Locations');
  const [tradeExpFilter, setTradeExpFilter] = useState('All Experience');
  const [tradeShowAllCards, setTradeShowAllCards] = useState(false);

  const [eduLocationFilter, setEduLocationFilter] = useState('All Locations');
  const [eduExpFilter, setEduExpFilter] = useState('All Experience');
  const [eduShowAllCards, setEduShowAllCards] = useState(false);

  const [hospLocationFilter, setHospLocationFilter] = useState('All Locations');
  const [hospExpFilter, setHospExpFilter] = useState('All Experience');
  const [hospShowAllCards, setHospShowAllCards] = useState(false);

  const availableLocations = useMemo(() => {
    const locs = new Set<string>();
    [
      'Chakan MIDC',
      'Bhosari MIDC',
      'Waluj MIDC',
      'Shendra MIDC',
      'Talegaon MIDC',
      'Ranjangaon MIDC',
      'Pune',
      'Chhatrapati Sambhajinagar',
      'Mumbai',
      'Nashik',
    ].forEach((l) => locs.add(l));

    allJobs.forEach((j) => {
      if (j.location && j.location.trim().length > 1) locs.add(j.location.trim());
      if (j.midcZone && j.midcZone.trim().length > 1) locs.add(j.midcZone.trim());
    });

    return Array.from(locs).sort();
  }, [allJobs]);

  const matchesFilterLocation = useCallback((job: Job, location: string): boolean => {
    if (!location || location === 'All Locations') return true;
    const target = location.toLowerCase();
    const zoneStr = `${job.location || ''} ${(job as any).midcZone || ''}`.toLowerCase();
    
    const keywords = ['chakan', 'bhosari', 'waluj', 'ranjangaon', 'talegaon', 'hadapsar', 'shendra', 'taloja', 'rabale', 'thane', 'tarapur', 'ambernath', 'satpur', 'ambad', 'kagal', 'gokul shirgaon', 'butibori', 'roha', 'pimpri', 'khed', 'pune', 'nashik', 'aurangabad', 'sambhajinagar', 'mumbai', 'nagpur', 'kolhapur'];
    const matchedKw = keywords.find(k => target.includes(k));
    if (matchedKw) {
      if (matchedKw === 'sambhajinagar' || matchedKw === 'aurangabad') {
        return zoneStr.includes('sambhajinagar') || zoneStr.includes('aurangabad') || zoneStr.includes('waluj') || zoneStr.includes('shendra') || zoneStr.includes('chikalthana');
      }
      return zoneStr.includes(matchedKw);
    }
    return zoneStr.includes(target) || target.includes(zoneStr);
  }, []);

  const matchesFilterExperience = useCallback((job: Job, exp: string): boolean => {
    if (!exp || exp === 'All Experience') return true;
    const target = exp.toLowerCase();
    const minE = job.minExperience ?? 0;
    const maxE = job.maxExperience ?? minE;

    if (target.includes('fresher') || target.includes('0')) {
      return minE === 0 || (job as any).acceptFreshers === true || (job as any).experienceRequired === false;
    }
    if (target.includes('1') && target.includes('3')) {
      return minE <= 3 && maxE >= 1;
    }
    if (target.includes('3') && target.includes('5')) {
      return minE <= 5 && maxE >= 3;
    }
    if (target.includes('5+') || target.includes('5')) {
      return maxE >= 5;
    }
    return true;
  }, []);

  const getRealFilteredJobCount = useCallback(
    (keyword: string, location: string, exp: string) => {
      const q = keyword.toLowerCase().trim();
      const tokens = q ? q.split(/[\s/&,-]+/).filter((t) => t.length > 0 && !['and', 'or', 'in', 'of', 'for', 'the', 'jobs'].includes(t)) : [];

      return allJobs.filter((j) => {
        if (!matchesFilterLocation(j, location)) return false;
        if (!matchesFilterExperience(j, exp)) return false;
        if (!q) return true;

        const fullJobText = [
          j.title,
          j.company,
          j.description,
          j.location,
          j.industry,
          (j as any).industryType,
          j.trade,
          (j as any).itiTrade,
          j.workMode,
          j.jobType,
          j.midcZone,
          (j as any).shiftDetails,
          j.educationRequirement,
          (j as any).education_requirement,
          (j as any).education_level,
          ...(j.skills || []),
          ...(j.requirements || []),
        ].filter(Boolean).join(' ').toLowerCase();

        return tokens.length > 0
          ? tokens.some((token) => {
              if (token.length <= 3) {
                const escaped = token.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
                return new RegExp(`\\b${escaped}\\b`, 'i').test(fullJobText);
              }
              return fullJobText.includes(token);
            })
          : true;
      }).length;
    },
    [allJobs, matchesFilterLocation, matchesFilterExperience]
  );

  const isTradeFiltered = tradeLocationFilter !== 'All Locations' || tradeExpFilter !== 'All Experience';
  const tradeMatchingCount = useMemo(() => {
    return ITI_HORIZONTAL_DATA.filter(
      (item) => getRealFilteredJobCount(item.keyword || item.name, tradeLocationFilter, tradeExpFilter) > 0
    ).length;
  }, [tradeLocationFilter, tradeExpFilter, getRealFilteredJobCount]);

  const visibleTradeCards = useMemo(() => {
    if (!isTradeFiltered || tradeShowAllCards) return ITI_HORIZONTAL_DATA;
    return ITI_HORIZONTAL_DATA.filter(
      (item) => getRealFilteredJobCount(item.keyword || item.name, tradeLocationFilter, tradeExpFilter) > 0
    );
  }, [isTradeFiltered, tradeShowAllCards, tradeLocationFilter, tradeExpFilter, getRealFilteredJobCount]);

  const isEduFiltered = eduLocationFilter !== 'All Locations' || eduExpFilter !== 'All Experience';
  const eduMatchingCount = useMemo(() => {
    return EDUCATION_HORIZONTAL_DATA.filter(
      (item) => getRealFilteredJobCount(item.keyword || item.name, eduLocationFilter, eduExpFilter) > 0
    ).length;
  }, [eduLocationFilter, eduExpFilter, getRealFilteredJobCount]);

  const visibleEduCards = useMemo(() => {
    if (!isEduFiltered || eduShowAllCards) return EDUCATION_HORIZONTAL_DATA;
    return EDUCATION_HORIZONTAL_DATA.filter(
      (item) => getRealFilteredJobCount(item.keyword || item.name, eduLocationFilter, eduExpFilter) > 0
    );
  }, [isEduFiltered, eduShowAllCards, eduLocationFilter, eduExpFilter, getRealFilteredJobCount]);

  const isHospFiltered = hospLocationFilter !== 'All Locations' || hospExpFilter !== 'All Experience';
  const hospMatchingCount = useMemo(() => {
    return HOSPITAL_HORIZONTAL_DATA.filter(
      (item) => getRealFilteredJobCount(item.keyword || item.name, hospLocationFilter, hospExpFilter) > 0
    ).length;
  }, [hospLocationFilter, hospExpFilter, getRealFilteredJobCount]);

  const visibleHospCards = useMemo(() => {
    if (!isHospFiltered || hospShowAllCards) return HOSPITAL_HORIZONTAL_DATA;
    return HOSPITAL_HORIZONTAL_DATA.filter(
      (item) => getRealFilteredJobCount(item.keyword || item.name, hospLocationFilter, hospExpFilter) > 0
    );
  }, [isHospFiltered, hospShowAllCards, hospLocationFilter, hospExpFilter, getRealFilteredJobCount]);



  const matchedSuggestions = useMemo(() => {
    const trimmed = topSearch.trim().toLowerCase();
    if (!trimmed) {
      return { jobs: [], trades: [], locations: [] };
    }

    const matchedJobs = allJobs
      .filter((j) => {
        const titleMatch = (j.title || '').toLowerCase().includes(trimmed);
        const companyMatch = (j.company || '').toLowerCase().includes(trimmed);
        const tradeMatch = (j.trade || '').toLowerCase().includes(trimmed);
        const indMatch = (j.industry || '').toLowerCase().includes(trimmed);
        return titleMatch || companyMatch || tradeMatch || indMatch;
      })
      .slice(0, 4);

    const popularTrades = [
      'CNC Operator',
      'VMC Operator',
      'Fitter',
      'Welder',
      'Electrician',
      'Quality Inspector',
      'Assembly Operator',
      'Turner',
      'Tool & Die Maker',
      'Store Keeper',
      'Helper',
      'Maintenance Technician',
    ];
    const matchedTrades = popularTrades.filter((t) => t.toLowerCase().includes(trimmed)).slice(0, 3);

    const matchedLocations = MIDC_ZONES.filter((l) => l.toLowerCase().includes(trimmed)).slice(0, 3);

    return {
      jobs: matchedJobs,
      trades: matchedTrades,
      locations: matchedLocations,
    };
  }, [topSearch, allJobs]);

  // Flattened items array for smooth arrow key navigation
  const flatSearchItems = useMemo(() => {
    if (!topSearch.trim()) return [];
    const items: Array<{ type: 'search_all' | 'job' | 'trade' | 'location'; label: string; sub?: string; id?: string }> = [
      { type: 'search_all', label: topSearch.trim() },
    ];
    matchedSuggestions.jobs.forEach((j) => {
      items.push({ type: 'job', label: j.title, sub: `${j.company} • ${j.location}`, id: j.id });
    });
    matchedSuggestions.trades.forEach((t) => {
      items.push({ type: 'trade', label: t, sub: 'ITI Trade' });
    });
    matchedSuggestions.locations.forEach((l) => {
      items.push({ type: 'location', label: l, sub: 'Industrial Zone' });
    });
    return items;
  }, [topSearch, matchedSuggestions]);

  // Reset keyboard selection index when query changes
  useEffect(() => {
    setSelectedIndex(-1);
  }, [topSearch]);

  const handleSelectItem = (item: { type: string; label: string; id?: string }) => {
    setShowSuggestions(false);
    setIsInputFocused(false);
    if (item.type === 'job' && item.id) {
      navigate(`/job/${item.id}`);
    } else if (item.type === 'trade') {
      setTopSearch(item.label);
      handleQuickTradeSearch(item.label);
    } else if (item.type === 'location') {
      setLocationQuery(item.label);
      navigate(`/jobs?location=${encodeURIComponent(item.label)}`);
    } else {
      handleSearchSubmit();
    }
  };

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!showSuggestions) {
      if (e.key === 'ArrowDown') {
        setShowSuggestions(true);
      } else if (e.key === 'Enter') {
        handleSearchSubmit();
      }
      return;
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (flatSearchItems.length > 0) {
        setSelectedIndex((prev) => (prev < flatSearchItems.length - 1 ? prev + 1 : 0));
      }
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (flatSearchItems.length > 0) {
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : flatSearchItems.length - 1));
      }
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (selectedIndex >= 0 && selectedIndex < flatSearchItems.length) {
        handleSelectItem(flatSearchItems[selectedIndex]);
      } else {
        setShowSuggestions(false);
        handleSearchSubmit();
      }
    } else if (e.key === 'Escape') {
      setShowSuggestions(false);
    }
  };

  // Home Filters state for side drawer — must be declared before roleFilteredJobs
  const [homeFilters, setHomeFilters] = useState<JobFilterValues>(DEFAULT_JOB_FILTERS);

  const roleFilteredJobs = useMemo(() => {
    if (activeRoleTab === 'All Opportunities') return allJobs;
    const tabObj = DEFAULT_ROLE_TABS.find((t) => t.id === activeRoleTab);
    const keyword = tabObj?.keyword || activeRoleTab.toLowerCase();
    return allJobs.filter((j) => {
      const fullText = [
        j.title, j.trade, (j as any).itiTrade, j.industry, (j as any).industryType,
        ...(j.skills || []),
      ].filter(Boolean).join(' ').toLowerCase();
      return fullText.includes(keyword);
    });
  }, [activeRoleTab, allJobs]);

  // Horizontal Menu Next & Previous 3-jobs carousel controls
  const rolesCarouselRef = useRef<HTMLDivElement>(null);
  const [canScrollRolesPrev, setCanScrollRolesPrev] = useState(false);
  const [canScrollRolesNext, setCanScrollRolesNext] = useState(true);

  const checkRolesScroll = useCallback(() => {
    if (rolesCarouselRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = rolesCarouselRef.current;
      setCanScrollRolesPrev(scrollLeft > 10);
      setCanScrollRolesNext(scrollLeft + clientWidth < scrollWidth - 10);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(checkRolesScroll, 150);
    window.addEventListener('resize', checkRolesScroll);
    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', checkRolesScroll);
    };
  }, [checkRolesScroll, roleFilteredJobs, activeRoleTab]);

  useEffect(() => {
    if (rolesCarouselRef.current) {
      rolesCarouselRef.current.scrollTo({ left: 0, behavior: 'smooth' });
    }
    setTimeout(checkRolesScroll, 200);
  }, [activeRoleTab, checkRolesScroll]);

  const handleScrollRolesPrev = () => {
    if (rolesCarouselRef.current) {
      // 3 cards step: (290px card width + 14px gap) * 3 = 912px
      const cardStep = (290 + 14) * 3;
      rolesCarouselRef.current.scrollBy({ left: -cardStep, behavior: 'smooth' });
      setTimeout(checkRolesScroll, 400);
    }
  };

  const handleScrollRolesNext = () => {
    if (rolesCarouselRef.current) {
      const cardStep = (290 + 14) * 3;
      rolesCarouselRef.current.scrollBy({ left: cardStep, behavior: 'smooth' });
      setTimeout(checkRolesScroll, 400);
    }
  };

  const handleSearchSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const params = new URLSearchParams();
    if (topSearch.trim()) params.set('keyword', topSearch.trim());
    if (selectedLocation && selectedLocation !== 'All Locations') params.set('location', selectedLocation);
    navigate(`/jobs?${params.toString()}`);
  };

  const handleQuickTradeSearch = (
    tradeName: string,
    filterType?: 'trade' | 'education',
    extraFilters?: { location?: string; exp?: string }
  ) => {
    const params = new URLSearchParams();
    if (tradeName) {
      if (filterType === 'education') {
        params.set('education', tradeName);
      } else if (filterType === 'trade') {
        params.set('trade', tradeName);
      } else {
        params.set('keyword', tradeName);
      }
    } else {
      if (filterType === 'trade') {
        params.set('trade', 'All Trades');
      } else if (filterType === 'education') {
        params.set('education', 'All Education Levels');
      }
    }

    if (extraFilters?.location && extraFilters.location !== 'All Locations') {
      params.set('location', extraFilters.location);
    }
    if (extraFilters?.exp && extraFilters.exp !== 'All Experience') {
      params.set('exp', extraFilters.exp);
    }

    const queryStr = params.toString();
    navigate(queryStr ? `/jobs?${queryStr}` : '/jobs');
  };

  const activeHomeFilterCount = useMemo(() => {
    let count = 0;
    if (homeFilters.midcZone !== 'All Locations') count++;
    if (homeFilters.industry !== 'All Industries') count++;
    if (homeFilters.trade !== 'All Trades') count++;
    if (homeFilters.education !== 'All Education Levels') count++;
    if (homeFilters.jobType !== 'All Types') count++;
    if (homeFilters.workMode !== 'All Modes') count++;
    if (homeFilters.minExperience !== 'All Experience') count++;
    if (homeFilters.busFacility) count++;
    if (homeFilters.canteen) count++;
    if (homeFilters.accommodation) count++;
    if (homeFilters.overtime) count++;
    return count;
  }, [homeFilters]);

  const handleApplyHomeFilters = (applied: JobFilterValues) => {
    // Navigate to /jobs with filters as URL params so JobSearchPage picks them up
    const params = new URLSearchParams();
    if (applied.midcZone !== 'All Locations') params.set('location', applied.midcZone);
    if (applied.industry !== 'All Industries') params.set('industry', applied.industry);
    if (applied.trade !== 'All Trades') params.set('trade', applied.trade);
    if (applied.education !== 'All Education Levels') params.set('education', applied.education);
    if (applied.jobType !== 'All Types') params.set('jobType', applied.jobType);
    if (applied.workMode !== 'All Modes') params.set('workMode', applied.workMode);
    if (applied.minExperience !== 'All Experience') params.set('exp', applied.minExperience);
    if (applied.busFacility) params.set('bus', 'true');
    if (applied.canteen) params.set('canteen', 'true');
    if (applied.accommodation) params.set('hostel', 'true');
    if (applied.overtime) params.set('ot', 'true');
    navigate(`/jobs?${params.toString()}`);
  };

  return (
    <div style={{ width: '100%', minHeight: '100vh', background: '#F8FAFC', boxSizing: 'border-box' }}>
      <style>{`
        .home-main-container {
          width: 100%;
          max-width: 1180px;
          margin: 0 auto;
          padding: 24px 20px 80px 20px;
          display: flex;
          flex-direction: column;
          gap: 24px;
          box-sizing: border-box;
        }

        .home-main-container .banner-slider-container {
          padding: 0 !important;
          margin: 0 !important;
          max-width: 100% !important;
        }

        .home-search-fields-grid {
          display: grid;
          grid-template-columns: 1fr 1fr 1.25fr auto;
          gap: 12px;
          align-items: center;
        }

        .home-search-submit-btn {
          height: 46px;
          padding: 0 20px;
          white-space: nowrap;
          margin-top: 0 !important;
          font-size: 14px;
          font-weight: 700;
        }

        .home-stats-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 16px;
        }

        .home-stat-card {
          background-color: #FFFFFF;
          border: 1px solid #CBD5E1;
          border-radius: 8px;
          padding: 16px 14px;
          text-align: center;
          box-shadow: 0 1px 3px rgba(15, 23, 42, 0.04);
        }

        .home-stat-card .stat-number {
          font-size: 26px;
          font-weight: 900;
          line-height: 1.2;
        }

        .home-stat-card .stat-label {
          font-size: 13px;
          font-weight: 600;
          color: #64748B;
          margin-top: 4px;
        }

        /* Category Header Styles Desktop */
        .home-category-section {
          display: flex;
          flex-direction: column;
          align-items: center;
          width: 100%;
          margin: 38px 0 0 0;
        }

        .home-category-badge {
          display: inline-block;
          font-size: 12px;
          font-weight: 800;
          padding: 4px 12px;
          border-radius: 4px;
          margin-bottom: 8px;
          letter-spacing: 0.4px;
        }

        .home-category-title {
          font-size: 24px;
          font-weight: 800;
          color: #0F172A;
          margin: 0 0 6px 0;
          text-align: center;
          letter-spacing: -0.2px;
        }

        .home-category-sub {
          font-size: 14px;
          color: #64748B;
          margin: 0 0 18px 0;
          text-align: center;
        }

        .home-jobs-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 14px;
        }

        .home-trades-grid,
        .home-education-grid,
        .home-healthcare-grid,
        .home-hospitality-grid {
          display: grid;
          grid-template-columns: repeat(6, 1fr);
          gap: 12px;
          width: 100%;
        }

        .home-chip-card {
          background-color: #FFFFFF;
          border: 1px solid #CBD5E1;
          border-radius: 8px;
          padding: 14px 8px;
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          cursor: pointer;
          box-shadow: 0 1px 3px rgba(15, 23, 42, 0.04);
          transition: all 0.15s ease;
        }

        .home-chip-icon-box {
          width: 38px;
          height: 38px;
          border-radius: 6px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 8px;
        }

        .home-chip-title {
          font-size: 13.5px;
          font-weight: 700;
          color: #0F172A;
          line-height: 17px;
          min-height: 34px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .home-chip-count {
          font-size: 11.5px;
          color: #64748B;
          font-weight: 600;
          margin-top: 4px;
        }

        /* Horizontal Carousel Categories */
        .home-category-section-left {
          align-items: flex-start !important;
          text-align: left !important;
        }

        .home-category-header-row {
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 2px;
        }

        .home-category-title-left {
          font-size: 20px;
          font-weight: 800;
          color: #0F172A;
          margin: 0;
          letter-spacing: -0.2px;
        }

        .home-category-see-all {
          background: none;
          border: none;
          padding: 4px 8px;
          font-size: 13.5px;
          font-weight: 600;
          color: #1B4FDF;
          cursor: pointer;
          transition: opacity 0.15s ease;
        }

        .home-category-see-all:hover {
          opacity: 0.8;
          text-decoration: underline;
        }

        .home-category-sub-left {
          font-size: 13px;
          color: #64748B;
          margin: 0 0 14px 0;
        }

        .home-horizontal-filter-row {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 12px;
          flex-wrap: wrap;
          width: 100%;
        }

        .home-horizontal-filter-badge {
          display: flex;
          align-items: center;
          gap: 6px;
          background-color: #FFFFFF;
          border: 1px solid #CBD5E1;
          border-radius: 6px;
          padding: 6px 10px;
          font-size: 13px;
          color: #334155;
          box-shadow: 0 1px 2px rgba(15, 23, 42, 0.04);
          transition: all 0.15s ease;
        }

        .home-horizontal-filter-badge:focus-within {
          border-color: #1B4FDF;
          box-shadow: 0 0 0 2px rgba(27, 79, 223, 0.12);
        }

        .home-horizontal-filter-badge.active-filter {
          border-color: #1B4FDF;
          background-color: #EFF6FF;
          color: #1B4FDF;
          font-weight: 600;
        }

        .home-horizontal-filter-select {
          border: none;
          background: transparent;
          outline: none;
          font-size: 13px;
          color: inherit;
          font-weight: inherit;
          cursor: pointer;
          max-width: 220px;
        }

        .home-horizontal-filter-clear {
          background: none;
          border: none;
          font-size: 12.5px;
          font-weight: 600;
          color: #EF4444;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 4px;
          padding: 5px 10px;
          border-radius: 4px;
          transition: background-color 0.15s ease;
        }

        .home-horizontal-filter-clear:hover {
          background-color: #FEE2E2;
        }

        .home-horizontal-count-indicator {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 12.5px;
          color: #64748B;
          margin-left: auto;
          font-weight: 500;
        }

        .home-horizontal-toggle-show-btn {
          background: none;
          border: 1px solid #CBD5E1;
          border-radius: 4px;
          padding: 3px 8px;
          font-size: 12px;
          font-weight: 600;
          color: #1B4FDF;
          cursor: pointer;
          transition: all 0.15s ease;
        }

        .home-horizontal-toggle-show-btn:hover {
          background-color: #EFF6FF;
          border-color: #1B4FDF;
        }

        .home-horizontal-empty-box {
          width: 100%;
          background-color: #FFFFFF;
          border: 1px dashed #CBD5E1;
          border-radius: 8px;
          padding: 24px 20px;
          text-align: center;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 12px;
          box-sizing: border-box;
          margin-bottom: 8px;
        }

        .home-filter-reset-action-btn {
          background-color: #1B4FDF;
          color: #FFFFFF;
          border: none;
          border-radius: 6px;
          padding: 7px 16px;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          transition: background-color 0.15s ease;
        }

        .home-filter-reset-action-btn:hover {
          background-color: #153fb5;
        }

        .home-filter-toggle-all-action-btn {
          background-color: #F1F5F9;
          color: #334155;
          border: 1px solid #CBD5E1;
          border-radius: 6px;
          padding: 7px 16px;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.15s ease;
        }

        .home-filter-toggle-all-action-btn:hover {
          background-color: #E2E8F0;
        }

        .home-horizontal-scroll {
          display: flex;
          flex-direction: row;
          gap: 14px;
          overflow-x: auto;
          width: 100%;
          padding: 4px 2px 14px 2px;
          box-sizing: border-box;
          scrollbar-width: thin;
          scrollbar-color: #CBD5E1 transparent;
          -webkit-overflow-scrolling: touch;
        }

        .home-horizontal-scroll::-webkit-scrollbar {
          height: 6px;
        }

        .home-horizontal-scroll::-webkit-scrollbar-track {
          background: transparent;
        }

        .home-horizontal-scroll::-webkit-scrollbar-thumb {
          background-color: #CBD5E1;
          border-radius: 4px;
        }

        .home-horizontal-scroll::-webkit-scrollbar-thumb:hover {
          background-color: #94A3B8;
        }

        .home-horizontal-card {
          flex: 0 0 162px;
          width: 162px;
          background-color: #FFFFFF;
          border: 1px solid #E2E8F0;
          border-radius: 8px;
          overflow: hidden;
          box-shadow: 0 1px 3px rgba(15, 23, 42, 0.04);
          cursor: pointer;
          display: flex;
          flex-direction: column;
          transition: all 0.2s ease;
          text-align: left;
        }

        .home-horizontal-card:hover {
          border-color: #1B4FDF;
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(27, 79, 223, 0.1);
        }

        .home-horizontal-card-img {
          width: 100%;
          height: 108px;
          object-fit: cover;
          background-color: #F1F5F9;
          display: block;
        }

        .home-horizontal-card-body {
          padding: 10px 12px 12px 12px;
          display: flex;
          flex-direction: column;
          flex: 1;
        }

        .home-horizontal-card-title {
          font-size: 14px;
          font-weight: 700;
          color: #0F172A;
          line-height: 1.25;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .home-horizontal-job-count {
          font-size: 11px;
          color: #64748B;
          margin-top: 4px;
        }

        .home-horizontal-price-row {
          display: flex;
          align-items: baseline;
          gap: 3px;
          margin-top: 6px;
        }

        .home-horizontal-price-from {
          font-size: 11px;
          color: #64748B;
          font-weight: 400;
        }

        .home-horizontal-price-val {
          font-size: 13px;
          font-weight: 800;
          color: #0F172A;
        }

        /* Advantage Section Desktop */
        .home-advantage-section {
          display: flex;
          flex-direction: column;
          align-items: center;
          width: 100%;
          margin: 44px 0 0 0;
        }

        .home-advantage-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 18px;
          width: 100%;
        }

        .home-advantage-card {
          background-color: #FFFFFF;
          border-radius: 8px;
          border: 1px solid #CBD5E1;
          padding: 18px 20px;
          display: flex;
          align-items: flex-start;
          gap: 14px;
          box-shadow: 0 1px 3px rgba(15, 23, 42, 0.04);
        }

        .home-advantage-title {
          font-size: 15.5px;
          font-weight: 700;
          color: #0F172A;
        }

        .home-advantage-desc {
          font-size: 13.5px;
          color: #64748B;
          margin-top: 4px;
          line-height: 19px;
        }

        /* Popular Roles Section Desktop */
        .home-popular-roles-section {
          display: flex;
          flex-direction: column;
          gap: 16px;
          width: 100%;
          margin: 44px 0 36px 0;
        }

        .home-popular-roles-title {
          font-size: 22px;
          font-weight: 800;
          color: #0F172A;
          margin: 0;
          letter-spacing: -0.2px;
        }

        .home-popular-roles-badge {
          font-size: 11.5px;
          font-weight: 800;
          background-color: #DCFCE7;
          color: #15803D;
          padding: 3px 8px;
          border-radius: 4px;
          letter-spacing: 0.4px;
        }

        .home-popular-roles-sub {
          font-size: 13.5px;
          color: #64748B;
          margin: 3px 0 0 0;
        }

        .home-popular-roles-carousel-wrapper {
          position: relative;
          width: 100%;
        }

        .home-carousel-arrow-btn {
          position: absolute;
          top: 50%;
          transform: translateY(-50%);
          z-index: 10;
          width: 44px;
          height: 44px;
          border-radius: 50%;
          background-color: #FFFFFF;
          border: 1px solid #CBD5E1;
          box-shadow: 0 4px 14px rgba(15, 23, 42, 0.12);
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          color: #1B4FDF;
          transition: all 0.18s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .home-carousel-arrow-btn:disabled {
          cursor: not-allowed;
          opacity: 0.35 !important;
          color: #94A3B8 !important;
          background-color: #F8FAFC !important;
          border-color: #E2E8F0 !important;
          box-shadow: none !important;
          transform: translateY(-50%) !important;
        }

        .home-carousel-prev-btn {
          left: -18px;
        }

        .home-carousel-next-btn {
          right: -18px;
        }

        @media (max-width: 768px) {
          .home-carousel-prev-btn {
            left: -4px;
          }
          .home-carousel-next-btn {
            right: -4px;
          }
        }

        .home-popular-job-card {
          width: 290px;
          min-width: 290px;
          flex-shrink: 0;
          background-color: #FFFFFF;
          border-radius: 8px;
          border: 1px solid #CBD5E1;
          padding: 16px;
          box-shadow: 0 1px 3px rgba(15, 23, 42, 0.04);
          text-decoration: none;
          color: inherit;
          display: flex;
          flex-direction: column;
          box-sizing: border-box;
          transition: all 0.15s ease;
        }

        .home-popular-job-title {
          font-size: 15.5px;
          font-weight: 800;
          color: #0F172A;
          letter-spacing: -0.15px;
        }

        @media (max-width: 1100px) and (min-width: 768px) {
          .home-search-fields-grid {
            grid-template-columns: 1fr 1fr;
          }
          .home-search-submit-btn {
            grid-column: span 2;
            height: 44px;
          }
          .home-stats-grid {
            grid-template-columns: repeat(2, 1fr);
          }
          .home-jobs-grid {
            grid-template-columns: 1fr;
          }
          .home-advantage-grid {
            grid-template-columns: 1fr;
          }
          .home-trades-grid,
          .home-education-grid,
          .home-healthcare-grid,
          .home-hospitality-grid {
            grid-template-columns: repeat(3, 1fr);
            gap: 10px;
          }
        }

        @media (max-width: 767px) {
          .home-main-container {
            max-width: 580px;
            padding: 10px 12px 100px 12px !important;
            gap: 12px !important;
          }          /* Top Search Bar Mobile */
          .home-top-search-bar {
            height: 42px !important;
            padding: 0 10px !important;
            gap: 8px !important;
          }
          .home-top-search-input {
            font-size: 12.5px !important;
          }
          .home-top-search-input::placeholder {
            font-size: 12px !important;
          }
          .home-trending-title {
            font-size: 9.5px !important;
          }
          .home-trending-btn {
            font-size: 11px !important;
            padding: 3.5px 8px !important;
          }

          /* Popular Roles Section Mobile */
          .home-popular-roles-section {
            margin: 20px 0 16px 0 !important;
            gap: 8px !important;
          }
          .home-popular-roles-title {
            font-size: 15px !important;
          }
          .home-popular-roles-sub {
            font-size: 11px !important;
          }
          .home-popular-job-card {
            width: 240px !important;
            min-width: 240px !important;
            padding: 10px !important;
            border-radius: 6px !important;
          }
          .home-popular-job-card h4 {
            font-size: 13px !important;
          }
          .home-popular-job-title {
            font-size: 13px !important;
          }
          .home-popular-job-company {
            font-size: 11px !important;
          }
          .home-popular-job-badge {
            font-size: 9.5px !important;
            padding: 1.5px 5px !important;
          }
          .home-popular-job-salary {
            font-size: 11px !important;
          }
          .home-popular-job-btn {
            font-size: 11px !important;
            padding: 5px 10px !important;
            height: 28px !important;
          }

          /* MIDC Zone Section Mobile */
          .home-midc-section {
            margin: 20px 0 16px 0 !important;
            gap: 8px !important;
          }
          .home-midc-title {
            font-size: 15px !important;
          }
          .home-midc-sub {
            font-size: 11px !important;
          }
          .home-midc-card {
            padding: 10px !important;
          }
          .home-midc-zone-name {
            font-size: 12.5px !important;
          }
          .home-midc-city {
            font-size: 10.5px !important;
          }
          .home-midc-tag {
            font-size: 9.5px !important;
            padding: 1.5px 5px !important;
          }

          /* Stats Grid Mobile */
          .home-stats-grid {
            grid-template-columns: repeat(2, 1fr) !important;
            gap: 8px !important;
          }
          .home-stat-card {
            padding: 8px 6px !important;
            border-radius: 6px !important;
          }
          .home-stat-card .stat-number {
            font-size: 16px !important;
          }
          .home-stat-card .stat-label {
            font-size: 10px !important;
          }

          /* Categories Grids & Chips Mobile */
          .home-category-section {
            margin-top: 20px !important;
          }
          .home-category-badge {
            font-size: 9px !important;
            padding: 2px 7px !important;
            margin-bottom: 4px !important;
          }
          .home-category-title {
            font-size: 15px !important;
            margin-bottom: 2px !important;
          }
          .home-category-sub {
            font-size: 11px !important;
            margin-bottom: 8px !important;
            line-height: 14px !important;
          }

          .home-trades-grid,
          .home-education-grid,
          .home-healthcare-grid,
          .home-hospitality-grid {
            grid-template-columns: repeat(3, 1fr) !important;
            gap: 6px !important;
          }
          .home-chip-card {
            padding: 7px 4px !important;
            border-radius: 6px !important;
          }
          .home-chip-icon-box {
            width: 24px !important;
            height: 24px !important;
            margin-bottom: 3px !important;
            border-radius: 4px !important;
          }
          .home-chip-icon-box svg {
            width: 12px !important;
            height: 12px !important;
          }
          .home-chip-title {
            font-size: 10px !important;
            line-height: 12px !important;
            min-height: 24px !important;
          }
          .home-chip-count {
            font-size: 8.5px !important;
            margin-top: 1px !important;
          }

          /* Advantage Section Mobile */
          .home-advantage-section {
            margin: 16px 0 20px 0 !important;
            gap: 8px !important;
          }
          .home-advantage-grid {
            display: flex !important;
            flex-direction: column !important;
            gap: 8px !important;
          }
          .home-advantage-card {
            padding: 10px 12px !important;
            border-radius: 6px !important;
            gap: 8px !important;
          }
          .home-advantage-title {
            font-size: 12.5px !important;
          }
          .home-advantage-desc {
            font-size: 11px !important;
            line-height: 14px !important;
          }

          /* Horizontal Cards Mobile View */
          .home-horizontal-card {
            flex: 0 0 148px !important;
            width: 148px !important;
          }
          .home-horizontal-card-img {
            height: 104px !important;
          }
          .home-category-title-left {
            font-size: 16px !important;
          }
        }
      `}</style>

      {/* Main Content Area */}
      <div className="home-main-container">
        {/* Promotional Banner Carousel Slider */}
        <div style={{ width: '100%', overflow: 'hidden', borderRadius: '6px' }}>
          <BannerSlider />
        </div>

        {/* Popular Role Picks Section (Horizontal Carousel matching MobileApp) */}
        <div className="home-popular-roles-section" style={{ display: 'flex', flexDirection: 'column', gap: '16px', width: '100%', margin: '44px 0 36px 0' }}>
          {/* Section Header */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '42px',
              height: '42px',
              borderRadius: '8px',
              backgroundColor: '#EFF6FF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}>
              <Briefcase size={22} color="#1B4FDF" />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                <h3 className="home-popular-roles-title">
                  Popular Role Picks
                </h3>
                <span className="home-popular-roles-badge">
                  VERIFIED JOBS
                </span>
              </div>
              <p className="home-popular-roles-sub">
                Explore top verified job opportunities categorized by available roles in the database
              </p>
            </div>
          </div>

          {/* Role Filter Tabs Horizontal Scroll */}
          <div
            className="no-scrollbar"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              overflowX: 'auto',
              scrollbarWidth: 'none',
              msOverflowStyle: 'none',
              WebkitOverflowScrolling: 'touch',
              padding: '4px 0',
            }}
          >
            {DEFAULT_ROLE_TABS.map((tab) => {
              const isActive = activeRoleTab === tab.id;
              const count = tab.id === 'All Opportunities' ? allJobs.length : getRealJobCount(tab.keyword);
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveRoleTab(tab.id)}
                  style={{
                    padding: '8px 16px',
                    borderRadius: '6px',
                    fontSize: '13.5px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                    border: isActive ? '1px solid #1B4FDF' : '1px solid #E2E8F0',
                    backgroundColor: isActive ? '#1B4FDF' : '#FFFFFF',
                    color: isActive ? '#FFFFFF' : '#334155',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    flexShrink: 0,
                    transition: 'all 0.15s ease',
                  }}
                >
                  <span style={{ color: isActive ? '#FFFFFF' : '#94A3B8', fontSize: '15px', lineHeight: 1 }}>•</span>
                  <span>{tab.label}</span>
                  <span style={{
                    fontSize: '11px',
                    padding: '2px 7px',
                    borderRadius: '10px',
                    backgroundColor: isActive ? 'rgba(255,255,255,0.25)' : '#F1F5F9',
                    color: isActive ? '#FFFFFF' : '#64748B',
                    fontWeight: 800,
                  }}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Horizontal Scrolling Job Cards Carousel Wrapper */}
          <div className="home-popular-roles-carousel-wrapper">
            {/* Previous Button on Left Side of Menu */}
            <button
              type="button"
              onClick={handleScrollRolesPrev}
              disabled={!canScrollRolesPrev}
              className="home-carousel-arrow-btn home-carousel-prev-btn"
              title="Previous 3 jobs"
              aria-label="Previous 3 jobs"
              onMouseEnter={(e) => {
                if (canScrollRolesPrev) {
                  e.currentTarget.style.backgroundColor = '#1B4FDF';
                  e.currentTarget.style.color = '#FFFFFF';
                  e.currentTarget.style.borderColor = '#1B4FDF';
                  e.currentTarget.style.transform = 'translateY(-50%) scale(1.08)';
                }
              }}
              onMouseLeave={(e) => {
                if (canScrollRolesPrev) {
                  e.currentTarget.style.backgroundColor = '#FFFFFF';
                  e.currentTarget.style.color = '#1B4FDF';
                  e.currentTarget.style.borderColor = '#CBD5E1';
                  e.currentTarget.style.transform = 'translateY(-50%) scale(1)';
                }
              }}
            >
              <ChevronLeft size={24} strokeWidth={2.5} />
            </button>

            {/* Horizontal Scrolling Job Cards Carousel Track */}
            <div
              ref={rolesCarouselRef}
              onScroll={checkRolesScroll}
              className="no-scrollbar"
              style={{
                display: 'flex',
                gap: '14px',
                overflowX: 'auto',
                scrollBehavior: 'smooth',
                scrollbarWidth: 'none',
                msOverflowStyle: 'none',
                WebkitOverflowScrolling: 'touch',
                padding: '4px 0 8px 0',
              }}
            >
            {roleFilteredJobs.length === 0 ? (
              <div style={{
                width: '100%',
                padding: '28px',
                backgroundColor: '#FFFFFF',
                borderRadius: '8px',
                border: '1px solid #CBD5E1',
                textAlign: 'center',
                color: '#64748B',
                fontSize: '14px',
              }}>
                No vacancies under "{activeRoleTab}" currently.
              </div>
            ) : (
              <>
                {roleFilteredJobs.map((job) => {
                  const isSaved = isJobSaved(job.id);
                  const isExpNotRequired = (job as any).experienceRequired === false || (job as any).experience_required === false;
                  const minExp = job.minExperience ?? (job as any).min_experience ?? 0;
                  const maxExp = job.maxExperience ?? (job as any).max_experience ?? 0;
                  const isFresher = isExpNotRequired || (minExp === 0 && (maxExp === 0 || maxExp === undefined || maxExp === null));
                  const expStr = isFresher ? 'Freshers' : (minExp === maxExp ? `${minExp} Yrs` : `${minExp}-${maxExp} Yrs`);

                  let salaryStr = '3-5 Lacs';
                  const sMin = job.salaryMin ?? (job as any).salary_min;
                  const sMax = job.salaryMax ?? (job as any).salary_max;
                  if (sMin && sMax) {
                    if (sMin >= 100000) {
                      salaryStr = `${(sMin / 100000).toFixed(0)}-${(sMax / 100000).toFixed(0)} Lacs`;
                    } else {
                      salaryStr = `${Math.round(sMin / 1000)}k-${Math.round(sMax / 1000)}k`;
                    }
                  }

                  const locationText = job.midcZone || job.location || 'Chhatrapati Sambhajinagar';
                  const shiftText = (job as any).shiftDetails || (job as any).shift_details || 'Day Shift (8:00 AM - 5:00 PM (9 hrs))';

                  return (
                    <Link
                      key={job.id}
                      to={`/job/${job.id}`}
                      className="home-popular-job-card"
                      style={{
                        width: '290px',
                        minWidth: '290px',
                        flexShrink: 0,
                        backgroundColor: '#FFFFFF',
                        borderRadius: '8px',
                        border: '1px solid #CBD5E1',
                        padding: '16px',
                        boxShadow: '0 1px 3px rgba(15, 23, 42, 0.04)',
                        textDecoration: 'none',
                        color: 'inherit',
                        display: 'flex',
                        flexDirection: 'column',
                        boxSizing: 'border-box',
                        transition: 'all 0.15s ease',
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.borderColor = '#1B4FDF')}
                      onMouseLeave={(e) => (e.currentTarget.style.borderColor = '#CBD5E1')}
                    >
                      {/* Top Row: Title & Bookmark */}
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
                        <h4
                          className="home-popular-job-title"
                          style={{
                            margin: 0,
                            fontSize: '15.5px',
                            fontWeight: 800,
                            color: '#0F172A',
                            letterSpacing: '-0.15px',
                            flex: 1,
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                          }}
                        >
                          {job.title}
                        </h4>
                        <button
                          onClick={(e) => handleToggleSaveJob(job.id, e)}
                          title={isSaved ? 'Remove from Saved' : 'Save Job'}
                          aria-label={isSaved ? 'Remove from Saved' : 'Save Job'}
                          style={{ background: 'transparent', border: 'none', padding: '2px', cursor: 'pointer', flexShrink: 0 }}
                        >
                          <Bookmark
                            size={18}
                            color={isSaved ? '#1B4FDF' : '#94A3B8'}
                            fill={isSaved ? '#1B4FDF' : 'transparent'}
                          />
                        </button>
                      </div>

                      {/* Location Row */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '5px', marginTop: '6px' }}>
                        <MapPin size={13} color="#94A3B8" style={{ flexShrink: 0 }} />
                        <span style={{ fontSize: '13px', color: '#64748B', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {locationText}
                        </span>
                      </div>

                      {/* Specs Row (Exp & Salary) */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '6px' }}>
                        <Briefcase size={13} color="#94A3B8" style={{ flexShrink: 0 }} />
                        <span style={{ fontSize: '13px', fontWeight: 600, color: '#334155' }}>
                          {expStr}   |   ₹ {salaryStr}
                        </span>
                      </div>

                      {/* Badges Row (On-site / Full-Time) */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '8px' }}>
                        <span className="home-popular-job-badge" style={{
                          backgroundColor: '#F1F5F9',
                          color: '#475569',
                          fontSize: '11.5px',
                          fontWeight: 700,
                          padding: '3px 8px',
                          borderRadius: '4px',
                        }}>
                          {job.workMode || (job as any).work_mode || 'On-site'}
                        </span>
                        <span className="home-popular-job-badge" style={{
                          backgroundColor: '#F1F5F9',
                          color: '#475569',
                          fontSize: '11.5px',
                          fontWeight: 700,
                          padding: '3px 8px',
                          borderRadius: '4px',
                        }}>
                          {job.jobType || (job as any).job_type || 'Full-time'}
                        </span>
                      </div>

                      {/* Shift Details Pill */}
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        backgroundColor: '#F3E8FF',
                        padding: '5px 9px',
                        borderRadius: '4px',
                        marginTop: '8px',
                      }}>
                        <Clock size={12} color="#7C3AED" style={{ flexShrink: 0 }} />
                        <span style={{
                          fontSize: '12px',
                          fontWeight: 600,
                          color: '#6B21A8',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                        }}>
                          {shiftText}
                        </span>
                      </div>

                      {/* Divider */}
                      <div style={{ height: '1px', backgroundColor: '#F1F5F9', margin: '12px 0' }} />

                      {/* Company Footer */}
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1, minWidth: 0 }}>
                          <CompanyDefaultLogo name={job.company} logoUrl={job.companyLogo} size={36} borderRadius="6px" />
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div className="home-popular-job-company" style={{ fontSize: '13px', fontWeight: 700, color: '#0F172A', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                              {job.company}
                            </div>
                            <div style={{ fontSize: '11px', color: '#64748B', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                              Posted by {job.company || 'Recruiter'}
                            </div>
                          </div>
                        </div>
                        <span style={{ fontSize: '11px', fontWeight: 600, color: '#94A3B8', flexShrink: 0 }}>
                          {formatTimeAgo(job.postedAt || (job as any).created_at)}
                        </span>
                      </div>
                    </Link>
                  );
                })}

                {/* Explore All Roles End Card */}
                <Link
                  to={`/jobs?keyword=${encodeURIComponent(DEFAULT_ROLE_TABS.find((t) => t.id === activeRoleTab)?.keyword || '')}`}
                  style={{
                    width: '210px',
                    minWidth: '210px',
                    flexShrink: 0,
                    backgroundColor: '#F8FAFC',
                    borderRadius: '8px',
                    border: '1px dashed #CBD5E1',
                    padding: '18px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    textAlign: 'center',
                    textDecoration: 'none',
                    color: 'inherit',
                    boxSizing: 'border-box',
                    gap: '8px',
                    transition: 'all 0.15s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = '#1B4FDF';
                    e.currentTarget.style.backgroundColor = '#EFF6FF';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = '#CBD5E1';
                    e.currentTarget.style.backgroundColor = '#F8FAFC';
                  }}
                >
                  <div style={{
                    width: '42px',
                    height: '42px',
                    borderRadius: '50%',
                    backgroundColor: '#FFFFFF',
                    border: '1px solid #DBEAFE',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}>
                    <ArrowRight size={22} color="#1B4FDF" />
                  </div>
                  <div style={{ fontSize: '14.5px', fontWeight: 800, color: '#0F172A' }}>
                    Explore All Roles
                  </div>
                  <div style={{ fontSize: '12px', color: '#64748B' }}>
                    View full catalog of live vacancies
                  </div>
                </Link>
              </>
            )}
          </div>

            {/* Next Button on Right Side of Menu */}
            <button
              type="button"
              onClick={handleScrollRolesNext}
              disabled={!canScrollRolesNext}
              className="home-carousel-arrow-btn home-carousel-next-btn"
              title="Next 3 jobs"
              aria-label="Next 3 jobs"
              onMouseEnter={(e) => {
                if (canScrollRolesNext) {
                  e.currentTarget.style.backgroundColor = '#1B4FDF';
                  e.currentTarget.style.color = '#FFFFFF';
                  e.currentTarget.style.borderColor = '#1B4FDF';
                  e.currentTarget.style.transform = 'translateY(-50%) scale(1.08)';
                }
              }}
              onMouseLeave={(e) => {
                if (canScrollRolesNext) {
                  e.currentTarget.style.backgroundColor = '#FFFFFF';
                  e.currentTarget.style.color = '#1B4FDF';
                  e.currentTarget.style.borderColor = '#CBD5E1';
                  e.currentTarget.style.transform = 'translateY(-50%) scale(1)';
                }
              }}
            >
              <ChevronRight size={24} strokeWidth={2.5} />
            </button>
          </div>
        </div>

        {/* Live Stats 4 Grid */}
        <div className="home-stats-grid">
          <div className="home-stat-card">
            <div className="stat-number" style={{ color: '#1B4FDF' }}>{allJobs.length || '25+'}</div>
            <div className="stat-label">Active Listings</div>
          </div>
          <div className="home-stat-card">
            <div className="stat-number" style={{ color: '#059669' }}>120+</div>
            <div className="stat-label">Factories Hiring</div>
          </div>
          <div className="home-stat-card">
            <div className="stat-number" style={{ color: '#7C3AED' }}>10,000+</div>
            <div className="stat-label">Verified Workers</div>
          </div>
          <div className="home-stat-card">
            <div className="stat-number" style={{ color: '#EA580C' }}>4,500+</div>
            <div className="stat-label">Monthly Placements</div>
          </div>
        </div>

        {/* Browse by ITI Trade / Specialty */}
        <div className="home-category-section home-category-section-left">
          <div className="home-category-badge" style={{ backgroundColor: '#EFF6FF', color: '#1B4FDF' }}>
            POPULAR TRADES
          </div>
          <div className="home-category-header-row">
            <h3 className="home-category-title-left">
              Browse by ITI Trade / Specialty
            </h3>
            <button
              type="button"
              className="home-category-see-all"
              onClick={() => handleQuickTradeSearch('', 'trade', { location: tradeLocationFilter, exp: tradeExpFilter })}
            >
              See All
            </button>
          </div>
          <p className="home-category-sub-left">
            Direct vacancies in production, quality, maintenance & logistics
          </p>

          <HorizontalMenuFilterBar
            location={tradeLocationFilter}
            onLocationChange={setTradeLocationFilter}
            experience={tradeExpFilter}
            onExperienceChange={setTradeExpFilter}
            availableLocations={availableLocations}
            totalCardsCount={ITI_HORIZONTAL_DATA.length}
            matchingCardsCount={tradeMatchingCount}
            showAllCards={tradeShowAllCards}
            onToggleShowAll={() => setTradeShowAllCards(prev => !prev)}
            onReset={() => {
              setTradeLocationFilter('All Locations');
              setTradeExpFilter('All Experience');
            }}
          />

          {visibleTradeCards.length === 0 ? (
            <div className="home-horizontal-empty-box">
              <div style={{ fontSize: '13.5px', color: '#64748B', fontWeight: 600 }}>
                No active ITI trade openings found matching "{tradeLocationFilter}" & "{tradeExpFilter}".
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  type="button"
                  className="home-filter-reset-action-btn"
                  onClick={() => {
                    setTradeLocationFilter('All Locations');
                    setTradeExpFilter('All Experience');
                  }}
                >
                  Reset Filters
                </button>
                <button
                  type="button"
                  className="home-filter-toggle-all-action-btn"
                  onClick={() => setTradeShowAllCards(true)}
                >
                  View All Trades
                </button>
              </div>
            </div>
          ) : (
            <div className="home-horizontal-scroll">
              {visibleTradeCards.map((item) => {
                const realCount = isTradeFiltered
                  ? getRealFilteredJobCount(item.keyword || item.name, tradeLocationFilter, tradeExpFilter)
                  : getRealJobCount(item.keyword || item.name);
                return (
                  <div
                    key={item.id}
                    className="home-horizontal-card"
                    onClick={() => handleQuickTradeSearch(item.name, 'trade', { location: tradeLocationFilter, exp: tradeExpFilter })}
                  >
                    <SafeCardImage
                      src={item.image}
                      fallbackSrc={TRADE_FALLBACK_IMAGE}
                      alt={item.name}
                    />
                    <div className="home-horizontal-card-body">
                      <div className="home-horizontal-card-title" title={item.name}>
                        {item.name}
                      </div>
                      <div className="home-horizontal-job-count">
                        {realCount > 0 ? `${realCount} ${realCount === 1 ? 'Job Opening' : 'Job Openings'}` : 'Direct Openings'}
                      </div>
                      <div className="home-horizontal-price-row">
                        <span className="home-horizontal-price-from">From </span>
                        <span className="home-horizontal-price-val">{item.startingSalary}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Browse Jobs by Qualification */}
        <div className="home-category-section home-category-section-left">
          <div className="home-category-badge" style={{ backgroundColor: '#F0FDF4', color: '#16A34A' }}>
            EDUCATION
          </div>
          <div className="home-category-header-row">
            <h3 className="home-category-title-left">
              Browse Jobs by Qualification
            </h3>
            <button
              type="button"
              className="home-category-see-all"
              onClick={() => handleQuickTradeSearch('', 'education', { location: eduLocationFilter, exp: eduExpFilter })}
            >
              See All
            </button>
          </div>
          <p className="home-category-sub-left">
            Find jobs matching your school education or college degree
          </p>

          <HorizontalMenuFilterBar
            location={eduLocationFilter}
            onLocationChange={setEduLocationFilter}
            experience={eduExpFilter}
            onExperienceChange={setEduExpFilter}
            availableLocations={availableLocations}
            totalCardsCount={EDUCATION_HORIZONTAL_DATA.length}
            matchingCardsCount={eduMatchingCount}
            showAllCards={eduShowAllCards}
            onToggleShowAll={() => setEduShowAllCards(prev => !prev)}
            onReset={() => {
              setEduLocationFilter('All Locations');
              setEduExpFilter('All Experience');
            }}
          />

          {visibleEduCards.length === 0 ? (
            <div className="home-horizontal-empty-box">
              <div style={{ fontSize: '13.5px', color: '#64748B', fontWeight: 600 }}>
                No active qualification openings found matching "{eduLocationFilter}" & "{eduExpFilter}".
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  type="button"
                  className="home-filter-reset-action-btn"
                  onClick={() => {
                    setEduLocationFilter('All Locations');
                    setEduExpFilter('All Experience');
                  }}
                >
                  Reset Filters
                </button>
                <button
                  type="button"
                  className="home-filter-toggle-all-action-btn"
                  onClick={() => setEduShowAllCards(true)}
                >
                  View All Qualifications
                </button>
              </div>
            </div>
          ) : (
            <div className="home-horizontal-scroll">
              {visibleEduCards.map((item) => {
                const realCount = isEduFiltered
                  ? getRealFilteredJobCount(item.keyword || item.name, eduLocationFilter, eduExpFilter)
                  : getRealJobCount(item.keyword || item.name);
                return (
                  <div
                    key={item.id}
                    className="home-horizontal-card"
                    onClick={() => handleQuickTradeSearch(item.name, 'education', { location: eduLocationFilter, exp: eduExpFilter })}
                  >
                    <SafeCardImage
                      src={item.image}
                      fallbackSrc={EDUCATION_FALLBACK_IMAGE}
                      alt={item.name}
                    />
                    <div className="home-horizontal-card-body">
                      <div className="home-horizontal-card-title" title={item.name}>
                        {item.name}
                      </div>
                      <div className="home-horizontal-job-count">
                        {realCount > 0 ? `${realCount} ${realCount === 1 ? 'Job Opening' : 'Job Openings'}` : 'Direct Openings'}
                      </div>
                      <div className="home-horizontal-price-row">
                        <span className="home-horizontal-price-from">From </span>
                        <span className="home-horizontal-price-val">{item.startingSalary}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Hospital & Healthcare Jobs */}
        <div className="home-category-section home-category-section-left">
          <div className="home-category-badge" style={{ backgroundColor: '#FEF2F2', color: '#DC2626' }}>
            HOSPITAL
          </div>
          <div className="home-category-header-row">
            <h3 className="home-category-title-left">
              Hospital & Healthcare Jobs
            </h3>
            <button
              type="button"
              className="home-category-see-all"
              onClick={() => handleQuickTradeSearch('Hospital', undefined, { location: hospLocationFilter, exp: hospExpFilter })}
            >
              See All
            </button>
          </div>
          <p className="home-category-sub-left">
            Browse medical, nursing, administration and support staff jobs
          </p>

          <HorizontalMenuFilterBar
            location={hospLocationFilter}
            onLocationChange={setHospLocationFilter}
            experience={hospExpFilter}
            onExperienceChange={setHospExpFilter}
            availableLocations={availableLocations}
            totalCardsCount={HOSPITAL_HORIZONTAL_DATA.length}
            matchingCardsCount={hospMatchingCount}
            showAllCards={hospShowAllCards}
            onToggleShowAll={() => setHospShowAllCards(prev => !prev)}
            onReset={() => {
              setHospLocationFilter('All Locations');
              setHospExpFilter('All Experience');
            }}
          />

          {visibleHospCards.length === 0 ? (
            <div className="home-horizontal-empty-box">
              <div style={{ fontSize: '13.5px', color: '#64748B', fontWeight: 600 }}>
                No active hospital openings found matching "{hospLocationFilter}" & "{hospExpFilter}".
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  type="button"
                  className="home-filter-reset-action-btn"
                  onClick={() => {
                    setHospLocationFilter('All Locations');
                    setHospExpFilter('All Experience');
                  }}
                >
                  Reset Filters
                </button>
                <button
                  type="button"
                  className="home-filter-toggle-all-action-btn"
                  onClick={() => setHospShowAllCards(true)}
                >
                  View All Roles
                </button>
              </div>
            </div>
          ) : (
            <div className="home-horizontal-scroll">
              {visibleHospCards.map((item) => {
                const realCount = isHospFiltered
                  ? getRealFilteredJobCount(item.keyword || item.name, hospLocationFilter, hospExpFilter)
                  : getRealJobCount(item.keyword || item.name);
                return (
                  <div
                    key={item.id}
                    className="home-horizontal-card"
                    onClick={() => handleQuickTradeSearch(item.name, undefined, { location: hospLocationFilter, exp: hospExpFilter })}
                  >
                    <SafeCardImage
                      src={item.image}
                      fallbackSrc={HEALTHCARE_FALLBACK_IMAGE}
                      alt={item.name}
                    />
                    <div className="home-horizontal-card-body">
                      <div className="home-horizontal-card-title" title={item.name}>
                        {item.name}
                      </div>
                      <div className="home-horizontal-job-count">
                        {realCount > 0 ? `${realCount} ${realCount === 1 ? 'Job Opening' : 'Job Openings'}` : 'Direct Openings'}
                      </div>
                      <div className="home-horizontal-price-row">
                        <span className="home-horizontal-price-from">From </span>
                        <span className="home-horizontal-price-val">{item.startingSalary}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Hotel & Hospitality Jobs */}
        <div className="home-category-section">
          <div className="home-category-badge" style={{ backgroundColor: '#FFFBEB', color: '#D97706' }}>
            HOSPITALITY
          </div>
          <h3 className="home-category-title">
            Hotel & Hospitality Jobs
          </h3>
          <p className="home-category-sub">
            Opportunities in kitchen, housekeeping, food service & front desk
          </p>

          <div className="home-hospitality-grid">
            {HOTEL_GRID.map((h, idx) => (
              <div
                key={idx}
                className="home-chip-card"
                onClick={() => handleQuickTradeSearch(h.name)}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = '#D97706';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 3px 8px rgba(217, 119, 6, 0.08)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = '#CBD5E1';
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 1px 2px rgba(15, 23, 42, 0.04)';
                }}
              >
                <div className="home-chip-icon-box" style={{ backgroundColor: '#FFFBEB' }}>
                  <Utensils size={18} color="#D97706" />
                </div>
                <div className="home-chip-title">
                  {h.name}
                </div>
                <div className="home-chip-count">
                  {getRealJobCount(h.keyword)} Openings
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Applicant Advantage Section */}
        <div className="home-advantage-section">
          <div className="home-category-badge" style={{ backgroundColor: '#EFF6FF', color: '#1B4FDF' }}>
            JOBMARKET ADVANTAGE
          </div>
          <h3 className="home-category-title">
            Why Industrial Workers Choose JobMarket
          </h3>

          <div className="home-advantage-grid">
            <div className="home-advantage-card">
              <CheckCircle2 size={24} color="#16A34A" style={{ flexShrink: 0, marginTop: '2px' }} />
              <div>
                <div className="home-advantage-title">
                  Direct MIDC Plant Hiring
                </div>
                <div className="home-advantage-desc">
                  Connect straight with plant HR without middle consultants or commission cuts.
                </div>
              </div>
            </div>

            <div className="home-advantage-card">
              <CheckCircle2 size={24} color="#16A34A" style={{ flexShrink: 0, marginTop: '2px' }} />
              <div>
                <div className="home-advantage-title">
                  100% Free Job Applications
                </div>
                <div className="home-advantage-desc">
                  No registration charges or hidden fees for workers and job seekers.
                </div>
              </div>
            </div>

            <div className="home-advantage-card">
              <CheckCircle2 size={24} color="#16A34A" style={{ flexShrink: 0, marginTop: '2px' }} />
              <div>
                <div className="home-advantage-title">
                  Bus & Canteen Verified Facilities
                </div>
                <div className="home-advantage-desc">
                  All job openings specify company bus routes, subsidized canteen, and OT perks.
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Shared Reusable Job Filter Modal */}
      <JobFilterModal
        isOpen={homeFilterDrawerOpen}
        onClose={() => setHomeFilterDrawerOpen(false)}
        currentFilters={homeFilters}
        onApplyFilters={handleApplyHomeFilters}
        onResetFilters={() => setHomeFilters(DEFAULT_JOB_FILTERS)}
        allJobs={allJobs}
        totalJobsCount={allJobs.length}
      />
    </div>
  );
};
