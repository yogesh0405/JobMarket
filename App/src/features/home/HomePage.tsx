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

  const handleQuickTradeSearch = (tradeName: string) => {
    navigate(`/jobs?keyword=${encodeURIComponent(tradeName)}`);
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
        }
      `}</style>

      {/* Main Content Area */}
      <div className="home-main-container">
        {/* Top Search Bar & Live Autocomplete */}
        <div style={{ position: 'relative', width: '100%', zIndex: 100 }} ref={searchContainerRef}>
          <div
            className="home-top-search-bar"
            onClick={() => navigate('/search')}
            style={{
              display: 'flex',
              alignItems: 'center',
              backgroundColor: '#FFFFFF',
              border: '1px solid #CBD5E1',
              borderRadius: '8px',
              padding: '0 14px',
              height: '48px',
              gap: '10px',
              boxSizing: 'border-box',
              boxShadow: '0 1px 3px rgba(15, 23, 42, 0.05)',
              transition: 'all 0.15s ease',
              cursor: 'pointer',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1, minWidth: 0 }}>
              <Search
                size={18}
                color="#1B4FDF"
                style={{ flexShrink: 0 }}
              />

              <div
                style={{
                  flex: 1,
                  fontSize: '14.5px',
                  color: '#64748B',
                  fontWeight: 500,
                  userSelect: 'none',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}
              >
                {SEARCH_PLACEHOLDERS[placeholderIndex]}
              </div>

              <kbd style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: '#F1F5F9',
                color: '#64748B',
                borderRadius: '4px',
                padding: '2px 6px',
                fontSize: '11px',
                fontWeight: 700,
                border: '1px solid #E2E8F0',
                userSelect: 'none',
                pointerEvents: 'none',
                flexShrink: 0,
              }}>
                ⌘K
              </kbd>
            </div>

            <div style={{ width: '1px', height: '22px', backgroundColor: '#E2E8F0', flexShrink: 0 }} />

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setHomeFilterDrawerOpen(true);
              }}
              style={{
                background: 'transparent',
                border: 'none',
                padding: '4px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                color: '#1B4FDF',
                flexShrink: 0,
                position: 'relative',
              }}
              title="Filter Options"
            >
              <SlidersHorizontal size={18} color="#1B4FDF" />
              {activeHomeFilterCount > 0 && (
                <span
                  style={{
                    position: 'absolute',
                    top: '-2px',
                    right: '-2px',
                    backgroundColor: '#1764E8',
                    color: '#FFFFFF',
                    borderRadius: '50%',
                    width: '15px',
                    height: '15px',
                    fontSize: '9px',
                    fontWeight: 800,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: '1.5px solid #FFFFFF',
                  }}
                >
                  {activeHomeFilterCount}
                </span>
              )}
            </button>
          </div>

          {/* Autocomplete Dropdown Overlay disabled - search opens dedicated /search page */}
          {false && showSuggestions && (
            <div style={{
              position: 'absolute',
              top: '54px',
              left: 0,
              right: 0,
              backgroundColor: '#FFFFFF',
              borderRadius: '8px',
              border: '1px solid #CBD5E1',
              boxShadow: '0 12px 32px rgba(15, 23, 42, 0.15)',
              maxHeight: '380px',
              overflowY: 'auto',
              zIndex: 999,
              padding: '6px 0',
            }}>
              {topSearch.trim() === '' ? (
                // Empty state: show popular searches & quick filter tags
                <div style={{ padding: '8px 12px' }}>
                  <div style={{ fontSize: '11px', fontWeight: 800, color: '#94A3B8', letterSpacing: '0.4px', marginBottom: '8px' }}>
                    TRENDING TRADES & ROLES
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '14px' }}>
                    {['CNC Operator', 'Welder', 'Fitter', 'Electrician', 'Quality Inspector', 'Turner', 'Helper'].map((trade) => (
                      <button
                        key={trade}
                        type="button"
                        onClick={() => {
                          setTopSearch(trade);
                          handleSelectItem({ type: 'trade', label: trade });
                        }}
                        style={{
                          backgroundColor: '#F8FAFC',
                          border: '1px solid #E2E8F0',
                          borderRadius: '6px',
                          padding: '5px 10px',
                          fontSize: '12px',
                          fontWeight: 600,
                          color: '#334155',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px',
                          transition: 'all 0.15s ease',
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = '#EFF6FF';
                          e.currentTarget.style.borderColor = '#1B4FDF';
                          e.currentTarget.style.color = '#1B4FDF';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = '#F8FAFC';
                          e.currentTarget.style.borderColor = '#E2E8F0';
                          e.currentTarget.style.color = '#334155';
                        }}
                      >
                        <Award size={13} color="#1B4FDF" />
                        <span>{trade}</span>
                      </button>
                    ))}
                  </div>

                  <div style={{ fontSize: '11px', fontWeight: 800, color: '#94A3B8', letterSpacing: '0.4px', marginBottom: '8px' }}>
                    POPULAR INDUSTRIAL ZONES
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                    {['Chakan MIDC', 'Waluj MIDC', 'Bhosari MIDC', 'Taloja MIDC', 'Ranjangaon MIDC'].map((loc) => (
                      <button
                        key={loc}
                        type="button"
                        onClick={() => {
                          handleSelectItem({ type: 'location', label: loc });
                        }}
                        style={{
                          backgroundColor: '#F8FAFC',
                          border: '1px solid #E2E8F0',
                          borderRadius: '6px',
                          padding: '5px 10px',
                          fontSize: '12px',
                          fontWeight: 600,
                          color: '#334155',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px',
                          transition: 'all 0.15s ease',
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = '#EFF6FF';
                          e.currentTarget.style.borderColor = '#1B4FDF';
                          e.currentTarget.style.color = '#1B4FDF';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = '#F8FAFC';
                          e.currentTarget.style.borderColor = '#E2E8F0';
                          e.currentTarget.style.color = '#334155';
                        }}
                      >
                        <MapPin size={13} color="#D97706" />
                        <span>{loc}</span>
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                // Filtered search results
                <>
                  <div
                    onClick={() => handleSelectItem({ type: 'search_all', label: topSearch.trim() })}
                    style={{
                      padding: '10px 14px',
                      borderBottom: '1px solid #F1F5F9',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      cursor: 'pointer',
                      backgroundColor: selectedIndex === 0 ? '#EFF6FF' : '#F8FAFC',
                      transition: 'background 0.15s ease',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#EFF6FF')}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = selectedIndex === 0 ? '#EFF6FF' : '#F8FAFC')}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#1B4FDF' }}>
                      <Search size={15} />
                      <span>Search all jobs matching "<strong>{topSearch.trim()}</strong>"</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span style={{ fontSize: '11px', color: '#94A3B8' }}>Press ↵</span>
                      <ArrowRight size={14} color="#1B4FDF" />
                    </div>
                  </div>

                  {matchedSuggestions.jobs.length > 0 && (
                    <div style={{ padding: '6px 0' }}>
                      <div style={{ fontSize: '10.5px', fontWeight: 800, color: '#94A3B8', padding: '4px 14px', letterSpacing: '0.5px' }}>
                        MATCHING LIVE JOBS
                      </div>
                      {matchedSuggestions.jobs.map((j) => {
                        const itemIdx = flatSearchItems.findIndex((it) => it.type === 'job' && it.id === j.id);
                        const isSelected = selectedIndex === itemIdx;
                        return (
                          <div
                            key={j.id}
                            onClick={() => handleSelectItem({ type: 'job', label: j.title, id: j.id })}
                            style={{
                              padding: '8px 14px',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '10px',
                              cursor: 'pointer',
                              backgroundColor: isSelected ? '#EFF6FF' : 'transparent',
                              transition: 'background 0.15s ease',
                            }}
                            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#EFF6FF')}
                            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = isSelected ? '#EFF6FF' : 'transparent')}
                          >
                            <Briefcase size={16} color="#1B4FDF" style={{ flexShrink: 0 }} />
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <div style={{ fontSize: '13px', fontWeight: 700, color: '#0F172A', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                {j.title}
                              </div>
                              <div style={{ fontSize: '11px', color: '#64748B', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                {j.company} • {j.location}
                              </div>
                            </div>
                            <ChevronRight size={14} color="#94A3B8" />
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {matchedSuggestions.trades.length > 0 && (
                    <div style={{ padding: '6px 0', borderTop: '1px solid #F1F5F9' }}>
                      <div style={{ fontSize: '10.5px', fontWeight: 800, color: '#94A3B8', padding: '4px 14px', letterSpacing: '0.5px' }}>
                        POPULAR TRADES & SKILLS
                      </div>
                      {matchedSuggestions.trades.map((trade) => {
                        const itemIdx = flatSearchItems.findIndex((it) => it.type === 'trade' && it.label === trade);
                        const isSelected = selectedIndex === itemIdx;
                        return (
                          <div
                            key={trade}
                            onClick={() => handleSelectItem({ type: 'trade', label: trade })}
                            style={{
                              padding: '8px 14px',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '10px',
                              cursor: 'pointer',
                              backgroundColor: isSelected ? '#EFF6FF' : 'transparent',
                              transition: 'background 0.15s ease',
                            }}
                            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#EFF6FF')}
                            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = isSelected ? '#EFF6FF' : 'transparent')}
                          >
                            <Award size={16} color="#059669" style={{ flexShrink: 0 }} />
                            <div style={{ flex: 1, fontSize: '13px', fontWeight: 600, color: '#0F172A' }}>
                              {trade}
                            </div>
                            <ChevronRight size={14} color="#94A3B8" />
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {matchedSuggestions.locations.length > 0 && (
                    <div style={{ padding: '6px 0', borderTop: '1px solid #F1F5F9' }}>
                      <div style={{ fontSize: '10.5px', fontWeight: 800, color: '#94A3B8', padding: '4px 14px', letterSpacing: '0.5px' }}>
                        INDUSTRIAL ZONES & LOCATIONS
                      </div>
                      {matchedSuggestions.locations.map((loc) => {
                        const itemIdx = flatSearchItems.findIndex((it) => it.type === 'location' && it.label === loc);
                        const isSelected = selectedIndex === itemIdx;
                        return (
                          <div
                            key={loc}
                            onClick={() => handleSelectItem({ type: 'location', label: loc })}
                            style={{
                              padding: '8px 14px',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '10px',
                              cursor: 'pointer',
                              backgroundColor: isSelected ? '#EFF6FF' : 'transparent',
                              transition: 'background 0.15s ease',
                            }}
                            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#EFF6FF')}
                            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = isSelected ? '#EFF6FF' : 'transparent')}
                          >
                            <MapPin size={16} color="#D97706" style={{ flexShrink: 0 }} />
                            <div style={{ flex: 1, fontSize: '13px', fontWeight: 600, color: '#0F172A' }}>
                              {loc}
                            </div>
                            <ChevronRight size={14} color="#94A3B8" />
                          </div>
                        );
                      })}
                    </div>
                  )}
                </>
              )}
            </div>
          )}
        </div>

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
        <div className="home-category-section">
          <div className="home-category-badge" style={{ backgroundColor: '#EFF6FF', color: '#1B4FDF' }}>
            POPULAR TRADES
          </div>
          <h3 className="home-category-title">
            Browse by ITI Trade / Specialty
          </h3>
          <p className="home-category-sub">
            Direct vacancies in production, quality, maintenance & logistics
          </p>

          <div className="home-trades-grid">
            {ITI_TRADES_GRID.map((trade, idx) => {
              const IconComp = trade.icon;
              const count = getRealJobCount(trade.keyword);
              return (
                <div
                  key={idx}
                  className="home-chip-card"
                  onClick={() => handleQuickTradeSearch(trade.name)}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = '#1B4FDF';
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = '0 3px 8px rgba(27, 79, 223, 0.08)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = '#CBD5E1';
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 1px 2px rgba(15, 23, 42, 0.04)';
                  }}
                >
                  <div className="home-chip-icon-box" style={{ backgroundColor: '#EFF6FF' }}>
                    <IconComp size={18} color="#1B4FDF" />
                  </div>
                  <div className="home-chip-title">
                    {trade.name}
                  </div>
                  <div className="home-chip-count">
                    {count} {count === 1 ? 'Open position' : 'Open positions'}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Browse Jobs by Qualification */}
        <div className="home-category-section">
          <div className="home-category-badge" style={{ backgroundColor: '#F0FDF4', color: '#16A34A' }}>
            EDUCATION
          </div>
          <h3 className="home-category-title">
            Browse Jobs by Qualification
          </h3>
          <p className="home-category-sub">
            Find jobs matching your school education or college degree
          </p>

          <div className="home-education-grid">
            {EDUCATION_GRID.map((qual, idx) => {
              const IconComp = qual.icon;
              const count = getRealJobCount(qual.keyword);
              return (
                <div
                  key={idx}
                  className="home-chip-card"
                  onClick={() => handleQuickTradeSearch(qual.name)}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = '#16A34A';
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = '0 3px 8px rgba(22, 163, 74, 0.08)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = '#CBD5E1';
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 1px 2px rgba(15, 23, 42, 0.04)';
                  }}
                >
                  <div className="home-chip-icon-box" style={{ backgroundColor: '#F0FDF4' }}>
                    <IconComp size={18} color="#16A34A" />
                  </div>
                  <div className="home-chip-title">
                    {qual.name}
                  </div>
                  <div className="home-chip-count">
                    {count} {count === 1 ? 'Job Opening' : 'Job Openings'}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Hospital & Healthcare Jobs */}
        <div className="home-category-section">
          <div className="home-category-badge" style={{ backgroundColor: '#FEF2F2', color: '#DC2626' }}>
            HEALTHCARE
          </div>
          <h3 className="home-category-title">
            Hospital & Healthcare Jobs
          </h3>
          <p className="home-category-sub">
            Browse medical, nursing, administration and support staff jobs
          </p>

          <div className="home-healthcare-grid">
            {HOSPITAL_GRID.map((h, idx) => (
              <div
                key={idx}
                className="home-chip-card"
                onClick={() => handleQuickTradeSearch(h.name)}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = '#DC2626';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 3px 8px rgba(220, 38, 38, 0.08)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = '#CBD5E1';
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 1px 2px rgba(15, 23, 42, 0.04)';
                }}
              >
                <div className="home-chip-icon-box" style={{ backgroundColor: '#FEF2F2' }}>
                  <HeartPulse size={18} color="#DC2626" />
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
