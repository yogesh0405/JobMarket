import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Search,
  MapPin,
  Briefcase,
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
import { MobileHeader } from '../../components/common/MobileHeader';
import { CompanyDefaultLogo } from '../../components/company/CompanyDefaultLogo';
import { BannerSlider } from '../../components/home/BannerSlider';
import { Job } from '../../types';

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
];

const EDUCATION_GRID = [
  { name: '10th / 12th Pass', icon: GraduationCap, keyword: 'pass' },
  { name: 'ITI Certified', icon: Award, keyword: 'iti' },
  { name: 'Diploma Holder', icon: GraduationCap, keyword: 'diploma' },
  { name: 'B.E. / B.Tech', icon: GraduationCap, keyword: 'engineering' },
  { name: 'Graduate Degree', icon: GraduationCap, keyword: 'graduate' },
  { name: 'Post Graduate', icon: GraduationCap, keyword: 'master' },
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
  if (!dateString) return '1d ago';
  const now = new Date();
  const posted = new Date(dateString);
  const diffMs = now.getTime() - posted.getTime();
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  if (diffHours < 1) return 'Just now';
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) return `${diffDays}d ago`;
  return `${Math.floor(diffDays / 7)}w ago`;
}

export const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const { getJobs } = useJobs();
  const { currentUser } = useAuth();

  const [placeholderIndex, setPlaceholderIndex] = useState(0);
  const [topSearch, setTopSearch] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isInputFocused, setIsInputFocused] = useState(false);
  const [homeFilterDrawerOpen, setHomeFilterDrawerOpen] = useState(false);

  // Hero Card State
  const [selectedIndustry, setSelectedIndustry] = useState('Select Industry');
  const [selectedEducation, setSelectedEducation] = useState('Select Education');
  const [locationQuery, setLocationQuery] = useState('');
  const [showLocationSuggestions, setShowLocationSuggestions] = useState(false);

  // Active Role Tab
  const [activeRoleTab, setActiveRoleTab] = useState('All Opportunities');

  // Saved Jobs
  const [savedJobIds, setSavedJobIds] = useState<string[]>(() => {
    try {
      const s = localStorage.getItem('saved_jobs_ids');
      return s ? JSON.parse(s) : [];
    } catch {
      return [];
    }
  });

  const toggleSaveJob = (jobId: string, e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    setSavedJobIds((prev) => {
      const exists = prev.includes(jobId);
      const updated = exists ? prev.filter((id) => id !== jobId) : [...prev, jobId];
      try {
        localStorage.setItem('saved_jobs_ids', JSON.stringify(updated));
      } catch (err) {
        console.error(err);
      }
      return updated;
    });
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
      return allJobs.filter((j) => {
        const titleMatch = (j.title || '').toLowerCase().includes(q);
        const indMatch = (j.industry || '').toLowerCase().includes(q);
        const tradeMatch = (j.trade || '').toLowerCase().includes(q);
        return titleMatch || indMatch || tradeMatch;
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
        return titleMatch || companyMatch || tradeMatch;
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

  const roleFilteredJobs = useMemo(() => {
    if (activeRoleTab === 'All Opportunities') {
      return allJobs;
    }
    const tabObj = DEFAULT_ROLE_TABS.find((t) => t.id === activeRoleTab);
    const keyword = tabObj?.keyword || activeRoleTab.toLowerCase();
    return allJobs.filter((j) => {
      const titleMatch = (j.title || '').toLowerCase().includes(keyword);
      const tradeMatch = (j.trade || '').toLowerCase().includes(keyword);
      const indMatch = (j.industry || '').toLowerCase().includes(keyword);
      return titleMatch || tradeMatch || indMatch;
    });
  }, [activeRoleTab, allJobs]);

  const handleSearchSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const params = new URLSearchParams();
    if (topSearch.trim()) params.set('keyword', topSearch.trim());
    if (selectedIndustry !== 'Select Industry') params.set('industry', selectedIndustry);
    if (selectedEducation !== 'Select Education') params.set('education', selectedEducation);
    if (locationQuery.trim()) params.set('location', locationQuery.trim());
    navigate(`/jobs?${params.toString()}`);
  };

  const handleQuickTradeSearch = (tradeName: string) => {
    navigate(`/jobs?keyword=${encodeURIComponent(tradeName)}`);
  };

  // Home Filters state for side drawer
  const [homeFilters, setHomeFilters] = useState({
    industry: 'All Industries',
    jobType: 'All Types',
    workMode: 'All Modes',
    midcZone: 'All MIDC Zones',
    busFacility: false,
    canteen: false,
    accommodation: false,
    overtime: false,
  });

  const matchingMidcZones = useMemo(() => {
    const query = locationQuery.trim().toLowerCase();
    if (!query) return MIDC_ZONES.slice(0, 4);
    return MIDC_ZONES.filter((zone) => zone.toLowerCase().includes(query)).slice(0, 5);
  }, [locationQuery]);

  return (
    <div style={{ width: '100%', minHeight: '100vh', background: '#F8FAFC', boxSizing: 'border-box' }}>
      {/* Mobile Top Header (100% matching MobileApp & other tabs, hidden on desktop) */}
      <MobileHeader title="JobMarket" />

      {/* Main Content Area */}
      <div style={{
        maxWidth: '580px',
        margin: '0 auto',
        padding: '14px 16px 120px 16px',
        display: 'flex',
        flexDirection: 'column',
        gap: '14px',
        boxSizing: 'border-box',
      }}>
        {/* Top Search Bar & Live Autocomplete */}
        <div style={{ position: 'relative', width: '100%', zIndex: 100 }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            backgroundColor: '#FFFFFF',
            border: isInputFocused ? '1px solid #1B4FDF' : '1px solid #CBD5E1',
            borderRadius: '6px',
            padding: '0 12px',
            height: '48px',
            gap: '10px',
            boxSizing: 'border-box',
            boxShadow: '0 1px 3px rgba(15, 23, 42, 0.05)',
            transition: 'all 0.15s ease',
          }}>
            <Search
              size={18}
              color={isInputFocused ? '#1B4FDF' : '#64748B'}
              style={{ flexShrink: 0, cursor: 'pointer' }}
              onClick={() => handleSearchSubmit()}
            />

            <input
              type="text"
              placeholder={SEARCH_PLACEHOLDERS[placeholderIndex]}
              value={topSearch}
              onChange={(e) => {
                setTopSearch(e.target.value);
                setShowSuggestions(e.target.value.trim().length > 0);
              }}
              onFocus={() => {
                setIsInputFocused(true);
                setShowSuggestions(topSearch.trim().length > 0);
              }}
              onBlur={() => {
                setTimeout(() => setIsInputFocused(false), 200);
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  setShowSuggestions(false);
                  handleSearchSubmit();
                }
              }}
              style={{
                flex: 1,
                border: 'none',
                outline: 'none',
                background: 'transparent',
                fontSize: '14.5px',
                color: '#0F172A',
                fontWeight: 600,
                padding: 0,
                margin: 0,
                width: '100%',
              }}
            />

            {topSearch.length > 0 && (
              <button
                onClick={() => {
                  setTopSearch('');
                  setShowSuggestions(false);
                }}
                style={{
                  background: '#F1F5F9',
                  border: 'none',
                  borderRadius: '50%',
                  width: '24px',
                  height: '24px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  padding: 0,
                  flexShrink: 0,
                }}
              >
                <X size={14} color="#64748B" />
              </button>
            )}

            <div style={{ width: '1px', height: '22px', backgroundColor: '#E2E8F0', flexShrink: 0 }} />

            <button
              onClick={() => setHomeFilterDrawerOpen(true)}
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
              }}
              title="Filter Options"
            >
              <SlidersHorizontal size={18} color="#1B4FDF" />
            </button>
          </div>

          {/* Autocomplete Dropdown Overlay */}
          {showSuggestions && topSearch.trim().length > 0 && (
            <div style={{
              position: 'absolute',
              top: '52px',
              left: 0,
              right: 0,
              backgroundColor: '#FFFFFF',
              borderRadius: '6px',
              border: '1px solid #CBD5E1',
              boxShadow: '0 8px 24px rgba(15, 23, 42, 0.12)',
              maxHeight: '300px',
              overflowY: 'auto',
              zIndex: 999,
              padding: '8px 0',
            }}>
              <div
                onClick={() => {
                  setShowSuggestions(false);
                  handleSearchSubmit();
                }}
                style={{
                  padding: '10px 14px',
                  borderBottom: '1px solid #F1F5F9',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  cursor: 'pointer',
                  backgroundColor: '#F8FAFC',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#1B4FDF' }}>
                  <Search size={15} />
                  <span>Search all jobs matching "<strong>{topSearch.trim()}</strong>"</span>
                </div>
                <ArrowRight size={14} color="#1B4FDF" />
              </div>

              {matchedSuggestions.jobs.length > 0 && (
                <div style={{ padding: '8px 0' }}>
                  <div style={{ fontSize: '10.5px', fontWeight: 800, color: '#94A3B8', padding: '4px 14px', letterSpacing: '0.5px' }}>
                    MATCHING LIVE JOBS
                  </div>
                  {matchedSuggestions.jobs.map((j) => (
                    <div
                      key={j.id}
                      onClick={() => {
                        setShowSuggestions(false);
                        navigate(`/job/${j.id}`);
                      }}
                      style={{
                        padding: '8px 14px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        cursor: 'pointer',
                        transition: 'background 0.15s ease',
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#F8FAFC')}
                      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
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
                  ))}
                </div>
              )}

              {matchedSuggestions.trades.length > 0 && (
                <div style={{ padding: '8px 0', borderTop: '1px solid #F1F5F9' }}>
                  <div style={{ fontSize: '10.5px', fontWeight: 800, color: '#94A3B8', padding: '4px 14px', letterSpacing: '0.5px' }}>
                    POPULAR TRADES & SKILLS
                  </div>
                  {matchedSuggestions.trades.map((trade) => (
                    <div
                      key={trade}
                      onClick={() => {
                        setTopSearch(trade);
                        setShowSuggestions(false);
                        handleQuickTradeSearch(trade);
                      }}
                      style={{
                        padding: '8px 14px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        cursor: 'pointer',
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#F8FAFC')}
                      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                    >
                      <Award size={16} color="#059669" style={{ flexShrink: 0 }} />
                      <div style={{ flex: 1, fontSize: '13px', fontWeight: 600, color: '#0F172A' }}>
                        {trade}
                      </div>
                      <ChevronRight size={14} color="#94A3B8" />
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Promotional Banner Carousel Slider */}
        <div style={{ width: '100%', overflow: 'hidden', borderRadius: '6px' }}>
          <BannerSlider />
        </div>

        {/* Hero Search Card */}
        <div style={{
          backgroundColor: '#FFFFFF',
          borderRadius: '6px',
          border: '1px solid #CBD5E1',
          padding: '16px',
          boxShadow: '0 2px 8px rgba(15, 23, 42, 0.08)',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
          boxSizing: 'border-box',
        }}>
          {/* Badge & Title */}
          <div>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              backgroundColor: '#EFF6FF',
              padding: '3px 8px',
              borderRadius: '4px',
              border: '1px solid #DBEAFE',
              marginBottom: '6px',
            }}>
              <Star size={12} color="#1B4FDF" />
              <span style={{ fontSize: '11px', fontWeight: 800, color: '#1B4FDF' }}>
                Industrial & Factory Jobs
              </span>
            </div>
            <h2 style={{ fontSize: '18px', fontWeight: 800, color: '#0F172A', margin: '0 0 4px 0', letterSpacing: '-0.2px' }}>
              Discover Factory & Technical Jobs near you
            </h2>
            <p style={{ fontSize: '12px', color: '#64748B', margin: 0, lineHeight: '17px' }}>
              Direct hiring for ITI, CNC operators, Welders, Fitters & Helpers in MIDC industrial clusters.
            </p>
          </div>

          {/* Form Fields */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {/* Industry Selector */}
            <div style={{ position: 'relative' }}>
              <select
                value={selectedIndustry}
                onChange={(e) => setSelectedIndustry(e.target.value)}
                style={{
                  width: '100%',
                  height: '42px',
                  padding: '0 12px 0 36px',
                  borderRadius: '6px',
                  border: '1px solid #CBD5E1',
                  backgroundColor: '#F8FAFC',
                  fontSize: '13px',
                  fontWeight: selectedIndustry !== 'Select Industry' ? 700 : 500,
                  color: selectedIndustry !== 'Select Industry' ? '#0F172A' : '#64748B',
                  outline: 'none',
                  cursor: 'pointer',
                  appearance: 'none',
                  WebkitAppearance: 'none',
                }}
              >
                {INDUSTRIES.map((ind) => (
                  <option key={ind} value={ind}>
                    {ind}
                  </option>
                ))}
              </select>
              <Briefcase size={15} color="#1B4FDF" style={{ position: 'absolute', left: '12px', top: '13px', pointerEvents: 'none' }} />
              <ChevronDown size={15} color="#94A3B8" style={{ position: 'absolute', right: '12px', top: '13px', pointerEvents: 'none' }} />
            </div>

            {/* Education Selector */}
            <div style={{ position: 'relative' }}>
              <select
                value={selectedEducation}
                onChange={(e) => setSelectedEducation(e.target.value)}
                style={{
                  width: '100%',
                  height: '42px',
                  padding: '0 12px 0 36px',
                  borderRadius: '6px',
                  border: '1px solid #CBD5E1',
                  backgroundColor: '#F8FAFC',
                  fontSize: '13px',
                  fontWeight: selectedEducation !== 'Select Education' ? 700 : 500,
                  color: selectedEducation !== 'Select Education' ? '#0F172A' : '#64748B',
                  outline: 'none',
                  cursor: 'pointer',
                  appearance: 'none',
                  WebkitAppearance: 'none',
                }}
              >
                {EDUCATIONS.map((ed) => (
                  <option key={ed} value={ed}>
                    {ed}
                  </option>
                ))}
              </select>
              <GraduationCap size={15} color="#1B4FDF" style={{ position: 'absolute', left: '12px', top: '13px', pointerEvents: 'none' }} />
              <ChevronDown size={15} color="#94A3B8" style={{ position: 'absolute', right: '12px', top: '13px', pointerEvents: 'none' }} />
            </div>

            {/* Location Query Input with Auto MIDC Suggestions */}
            <div style={{ position: 'relative' }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                height: '42px',
                padding: '0 12px',
                borderRadius: '6px',
                border: '1px solid #CBD5E1',
                backgroundColor: '#F8FAFC',
                gap: '8px',
              }}>
                <MapPin size={15} color="#1B4FDF" style={{ flexShrink: 0 }} />
                <input
                  type="text"
                  placeholder="Enter location / MIDC area (e.g. Waluj, Chakan)"
                  value={locationQuery}
                  onChange={(e) => {
                    setLocationQuery(e.target.value);
                    setShowLocationSuggestions(true);
                  }}
                  onFocus={() => setShowLocationSuggestions(true)}
                  onBlur={() => setTimeout(() => setShowLocationSuggestions(false), 200)}
                  style={{
                    flex: 1,
                    border: 'none',
                    outline: 'none',
                    background: 'transparent',
                    fontSize: '13px',
                    color: '#0F172A',
                    fontWeight: 500,
                    padding: 0,
                    margin: 0,
                    width: '100%',
                  }}
                />
                {locationQuery.length > 0 && (
                  <button
                    onClick={() => setLocationQuery('')}
                    style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: '2px' }}
                  >
                    <X size={13} color="#64748B" />
                  </button>
                )}
              </div>

              {showLocationSuggestions && (
                <div style={{
                  position: 'absolute',
                  top: '46px',
                  left: 0,
                  right: 0,
                  backgroundColor: '#FFFFFF',
                  borderRadius: '6px',
                  border: '1px solid #CBD5E1',
                  boxShadow: '0 4px 14px rgba(15, 23, 42, 0.1)',
                  zIndex: 200,
                  overflow: 'hidden',
                }}>
                  {matchingMidcZones.map((zone) => (
                    <div
                      key={zone}
                      onClick={() => {
                        setLocationQuery(zone);
                        setShowLocationSuggestions(false);
                      }}
                      style={{
                        padding: '8px 12px',
                        fontSize: '12px',
                        color: '#334155',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        borderBottom: '1px solid #F1F5F9',
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#F8FAFC')}
                      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                    >
                      <MapPin size={12} color="#94A3B8" />
                      <span>{zone}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Search Submit Button */}
            <button
              onClick={() => handleSearchSubmit()}
              style={{
                backgroundColor: '#1B4FDF',
                color: '#FFFFFF',
                height: '44px',
                borderRadius: '6px',
                border: 'none',
                fontSize: '14px',
                fontWeight: 800,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                cursor: 'pointer',
                marginTop: '4px',
                boxShadow: '0 2px 6px rgba(27, 79, 223, 0.25)',
              }}
            >
              <Search size={16} color="#FFFFFF" />
              Find Matching Jobs
            </button>
          </div>
        </div>

        {/* Popular Role Picks Section */}
        <div style={{
          backgroundColor: '#FFFFFF',
          borderRadius: '6px',
          border: '1px solid #CBD5E1',
          padding: '16px',
          boxShadow: '0 2px 8px rgba(15, 23, 42, 0.08)',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
          boxSizing: 'border-box',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{
                width: '32px',
                height: '32px',
                borderRadius: '6px',
                backgroundColor: '#EFF6FF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                <Briefcase size={17} color="#1B4FDF" />
              </div>
              <div>
                <h3 style={{ fontSize: '15px', fontWeight: 800, color: '#0F172A', margin: 0 }}>
                  Popular Role Picks
                </h3>
                <span style={{ fontSize: '11px', color: '#64748B' }}>
                  Explore top verified industrial openings
                </span>
              </div>
            </div>
            <span style={{
              fontSize: '10px',
              fontWeight: 800,
              backgroundColor: '#DCFCE7',
              color: '#15803D',
              padding: '2px 6px',
              borderRadius: '4px',
            }}>
              VERIFIED JOBS
            </span>
          </div>

          {/* Role Filter Tabs Horizontal Scroll */}
          <div
            className="no-scrollbar"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              overflowX: 'auto',
              scrollbarWidth: 'none',
              msOverflowStyle: 'none',
              WebkitOverflowScrolling: 'touch',
              paddingBottom: '2px',
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
                    padding: '5px 10px',
                    borderRadius: '4px',
                    fontSize: '11.5px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                    border: isActive ? '1px solid #1B4FDF' : '1px solid #E2E8F0',
                    backgroundColor: isActive ? '#1B4FDF' : '#F8FAFC',
                    color: isActive ? '#FFFFFF' : '#475569',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    flexShrink: 0,
                    transition: 'all 0.15s ease',
                  }}
                >
                  <span>{tab.label}</span>
                  <span style={{
                    fontSize: '10px',
                    padding: '1px 5px',
                    borderRadius: '3px',
                    backgroundColor: isActive ? 'rgba(255,255,255,0.25)' : '#E2E8F0',
                    color: isActive ? '#FFFFFF' : '#64748B',
                    fontWeight: 800,
                  }}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Active Role Jobs List (CandidateJobCardItem design) */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {roleFilteredJobs.slice(0, 4).map((job) => {
              const isSaved = savedJobIds.includes(job.id);
              const expText =
                job.minExperience !== undefined
                  ? `${job.minExperience}-${job.maxExperience ?? job.minExperience + 2} Yrs Exp`
                  : '0-2 Yrs Exp';
              const salaryText =
                job.salaryMin && job.salaryMax
                  ? `${(job.salaryMin / 100000).toFixed(1)}-${(job.salaryMax / 100000).toFixed(1)} Lacs PA`
                  : '3.5-5.5 Lacs PA';
              const locationText = job.midcZone || job.location || 'Chhatrapati Sambhajinagar';
              const openings = job.openings || 4;

              return (
                <Link
                  key={job.id}
                  to={`/job/${job.id}`}
                  style={{
                    backgroundColor: '#FFFFFF',
                    borderRadius: '6px',
                    border: '1px solid #CBD5E1',
                    overflow: 'hidden',
                    textDecoration: 'none',
                    color: 'inherit',
                    display: 'flex',
                    flexDirection: 'column',
                    boxShadow: '0 1px 4px rgba(15, 23, 42, 0.04)',
                    boxSizing: 'border-box',
                  }}
                >
                  {/* Top Section */}
                  <div style={{ padding: '12px 14px', borderBottom: '1px solid #F1F5F9' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
                      <h4 style={{
                        margin: 0,
                        fontSize: '13.5px',
                        fontWeight: 800,
                        color: '#0F172A',
                        letterSpacing: '-0.15px',
                        flex: 1,
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                      }}>
                        {job.title}
                      </h4>
                      <button
                        onClick={(e) => toggleSaveJob(job.id, e)}
                        style={{ background: 'transparent', border: 'none', padding: '2px', cursor: 'pointer' }}
                      >
                        <Bookmark
                          size={16}
                          color={isSaved ? '#1B4FDF' : '#94A3B8'}
                          fill={isSaved ? '#1B4FDF' : 'transparent'}
                        />
                      </button>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '6px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '3px', flexShrink: 0 }}>
                        <Briefcase size={12} color="#64748B" />
                        <span style={{ fontSize: '11px', fontWeight: 600, color: '#475569' }}>{expText}</span>
                      </div>
                      <span style={{ fontSize: '11px', color: '#CBD5E1' }}>|</span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '2px', flexShrink: 0 }}>
                        <span style={{ fontWeight: 700, color: '#64748B', fontSize: '11px' }}>₹</span>
                        <span style={{ fontSize: '11px', fontWeight: 600, color: '#475569' }}>{salaryText}</span>
                      </div>
                      <span style={{ fontSize: '11px', color: '#CBD5E1' }}>|</span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '3px', flex: 1, minWidth: 0, overflow: 'hidden' }}>
                        <MapPin size={12} color="#64748B" style={{ flexShrink: 0 }} />
                        <span style={{ fontSize: '11px', fontWeight: 600, color: '#475569', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {locationText}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Middle Specs Band */}
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '8px 14px',
                    backgroundColor: '#F8FAFC',
                    borderBottom: '1px solid #F1F5F9',
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', fontWeight: 600, color: '#475569' }}>
                      <Clock size={12} color="#64748B" />
                      <span>{job.jobType || 'Full-time'}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', fontWeight: 600, color: '#475569' }}>
                      <Building2 size={12} color="#64748B" />
                      <span>{job.workMode || 'On-site'}</span>
                    </div>
                    {openings && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', fontWeight: 600, color: '#475569' }}>
                        <Users size={12} color="#64748B" />
                        <span>{openings} Vacancies</span>
                      </div>
                    )}
                  </div>

                  {/* Bottom Employer Row */}
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '8px 14px',
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1, minWidth: 0 }}>
                      <CompanyDefaultLogo name={job.company} logoUrl={job.companyLogo} size={32} borderRadius="6px" />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: '11.5px', fontWeight: 700, color: '#0F172A', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {job.company}
                        </div>
                        <div style={{ fontSize: '9.5px', color: '#64748B' }}>Posted by Recruiter</div>
                      </div>
                    </div>
                    <div style={{ fontSize: '10px', fontWeight: 600, color: '#94A3B8' }}>
                      {formatTimeAgo(job.postedAt || (job as any).created_at)}
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>

          <Link
            to={`/jobs?keyword=${encodeURIComponent(DEFAULT_ROLE_TABS.find((t) => t.id === activeRoleTab)?.keyword || '')}`}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              padding: '10px',
              backgroundColor: '#EFF6FF',
              borderRadius: '6px',
              textDecoration: 'none',
              fontSize: '12.5px',
              fontWeight: 800,
              color: '#1B4FDF',
              marginTop: '4px',
            }}
          >
            <span>View All {activeRoleTab} Jobs</span>
            <ArrowRight size={14} />
          </Link>
        </div>

        {/* Live Stats 2x2 Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
          <div style={{ backgroundColor: '#FFFFFF', border: '1px solid #CBD5E1', borderRadius: '6px', padding: '12px', textAlign: 'center' }}>
            <div style={{ fontSize: '20px', fontWeight: 900, color: '#1B4FDF' }}>{allJobs.length || '25+'}</div>
            <div style={{ fontSize: '11px', fontWeight: 600, color: '#64748B', marginTop: '2px' }}>Active Listings</div>
          </div>
          <div style={{ backgroundColor: '#FFFFFF', border: '1px solid #CBD5E1', borderRadius: '6px', padding: '12px', textAlign: 'center' }}>
            <div style={{ fontSize: '20px', fontWeight: 900, color: '#059669' }}>120+</div>
            <div style={{ fontSize: '11px', fontWeight: 600, color: '#64748B', marginTop: '2px' }}>Factories Hiring</div>
          </div>
          <div style={{ backgroundColor: '#FFFFFF', border: '1px solid #CBD5E1', borderRadius: '6px', padding: '12px', textAlign: 'center' }}>
            <div style={{ fontSize: '20px', fontWeight: 900, color: '#7C3AED' }}>10,000+</div>
            <div style={{ fontSize: '11px', fontWeight: 600, color: '#64748B', marginTop: '2px' }}>Verified Workers</div>
          </div>
          <div style={{ backgroundColor: '#FFFFFF', border: '1px solid #CBD5E1', borderRadius: '6px', padding: '12px', textAlign: 'center' }}>
            <div style={{ fontSize: '20px', fontWeight: 900, color: '#EA580C' }}>4,500+</div>
            <div style={{ fontSize: '11px', fontWeight: 600, color: '#64748B', marginTop: '2px' }}>Monthly Placements</div>
          </div>
        </div>

        {/* Browse by ITI Trade / Specialty */}
        <div style={{
          backgroundColor: '#FFFFFF',
          borderRadius: '6px',
          border: '1px solid #CBD5E1',
          padding: '16px',
          boxShadow: '0 2px 8px rgba(15, 23, 42, 0.08)',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
          boxSizing: 'border-box',
        }}>
          <div>
            <div style={{
              display: 'inline-block',
              fontSize: '10px',
              fontWeight: 800,
              backgroundColor: '#EFF6FF',
              color: '#1B4FDF',
              padding: '2px 6px',
              borderRadius: '4px',
              marginBottom: '4px',
            }}>
              POPULAR TRADES
            </div>
            <h3 style={{ fontSize: '15px', fontWeight: 800, color: '#0F172A', margin: 0 }}>
              Browse by ITI Trade / Specialty
            </h3>
            <p style={{ fontSize: '11.5px', color: '#64748B', margin: '2px 0 0 0' }}>
              Direct vacancies in production, quality, maintenance & logistics
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
            {ITI_TRADES_GRID.map((trade, idx) => {
              const IconComp = trade.icon;
              const count = getRealJobCount(trade.keyword);
              return (
                <div
                  key={idx}
                  onClick={() => handleQuickTradeSearch(trade.keyword)}
                  style={{
                    backgroundColor: '#F8FAFC',
                    border: '1px solid #E2E8F0',
                    borderRadius: '6px',
                    padding: '10px 8px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    textAlign: 'center',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = '#1B4FDF';
                    e.currentTarget.style.backgroundColor = '#EFF6FF';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = '#E2E8F0';
                    e.currentTarget.style.backgroundColor = '#F8FAFC';
                  }}
                >
                  <div style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '6px',
                    backgroundColor: '#FFFFFF',
                    border: '1px solid #E2E8F0',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: '6px',
                  }}>
                    <IconComp size={16} color="#1B4FDF" />
                  </div>
                  <div style={{
                    fontSize: '11.5px',
                    fontWeight: 700,
                    color: '#0F172A',
                    lineHeight: '14px',
                    height: '28px',
                    overflow: 'hidden',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}>
                    {trade.name}
                  </div>
                  <div style={{ fontSize: '10px', color: '#64748B', fontWeight: 600, marginTop: '2px' }}>
                    {count} Openings
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Browse Jobs by Qualification */}
        <div style={{
          backgroundColor: '#FFFFFF',
          borderRadius: '6px',
          border: '1px solid #CBD5E1',
          padding: '16px',
          boxShadow: '0 2px 8px rgba(15, 23, 42, 0.08)',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
          boxSizing: 'border-box',
        }}>
          <div>
            <div style={{
              display: 'inline-block',
              fontSize: '10px',
              fontWeight: 800,
              backgroundColor: '#F0FDF4',
              color: '#16A34A',
              padding: '2px 6px',
              borderRadius: '4px',
              marginBottom: '4px',
            }}>
              EDUCATION
            </div>
            <h3 style={{ fontSize: '15px', fontWeight: 800, color: '#0F172A', margin: 0 }}>
              Browse Jobs by Qualification
            </h3>
            <p style={{ fontSize: '11.5px', color: '#64748B', margin: '2px 0 0 0' }}>
              Find jobs matching your school education or college degree
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
            {EDUCATION_GRID.map((qual, idx) => {
              const IconComp = qual.icon;
              const count = getRealJobCount(qual.keyword);
              return (
                <div
                  key={idx}
                  onClick={() => handleQuickTradeSearch(qual.keyword)}
                  style={{
                    backgroundColor: '#F8FAFC',
                    border: '1px solid #E2E8F0',
                    borderRadius: '6px',
                    padding: '10px 8px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    textAlign: 'center',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = '#16A34A';
                    e.currentTarget.style.backgroundColor = '#F0FDF4';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = '#E2E8F0';
                    e.currentTarget.style.backgroundColor = '#F8FAFC';
                  }}
                >
                  <div style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '6px',
                    backgroundColor: '#FFFFFF',
                    border: '1px solid #E2E8F0',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: '6px',
                  }}>
                    <IconComp size={16} color="#16A34A" />
                  </div>
                  <div style={{
                    fontSize: '11.5px',
                    fontWeight: 700,
                    color: '#0F172A',
                    lineHeight: '14px',
                    height: '28px',
                    overflow: 'hidden',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}>
                    {qual.name}
                  </div>
                  <div style={{ fontSize: '10px', color: '#64748B', fontWeight: 600, marginTop: '2px' }}>
                    {count} Openings
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Hospital & Healthcare Jobs */}
        <div style={{
          backgroundColor: '#FFFFFF',
          borderRadius: '6px',
          border: '1px solid #CBD5E1',
          padding: '16px',
          boxShadow: '0 2px 8px rgba(15, 23, 42, 0.08)',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
          boxSizing: 'border-box',
        }}>
          <div>
            <div style={{
              display: 'inline-block',
              fontSize: '10px',
              fontWeight: 800,
              backgroundColor: '#FEF2F2',
              color: '#DC2626',
              padding: '2px 6px',
              borderRadius: '4px',
              marginBottom: '4px',
            }}>
              HEALTHCARE
            </div>
            <h3 style={{ fontSize: '15px', fontWeight: 800, color: '#0F172A', margin: 0 }}>
              Hospital & Healthcare Jobs
            </h3>
            <p style={{ fontSize: '11.5px', color: '#64748B', margin: '2px 0 0 0' }}>
              Browse medical, nursing, administration and support staff jobs
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
            {HOSPITAL_GRID.map((h, idx) => (
              <div
                key={idx}
                onClick={() => handleQuickTradeSearch(h.keyword)}
                style={{
                  backgroundColor: '#F8FAFC',
                  border: '1px solid #E2E8F0',
                  borderRadius: '6px',
                  padding: '10px 8px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  textAlign: 'center',
                  cursor: 'pointer',
                }}
              >
                <div style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '6px',
                  backgroundColor: '#FFFFFF',
                  border: '1px solid #E2E8F0',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '6px',
                }}>
                  <HeartPulse size={16} color="#DC2626" />
                </div>
                <div style={{ fontSize: '11.5px', fontWeight: 700, color: '#0F172A', lineHeight: '14px' }}>
                  {h.name}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Hotel & Hospitality Jobs */}
        <div style={{
          backgroundColor: '#FFFFFF',
          borderRadius: '6px',
          border: '1px solid #CBD5E1',
          padding: '16px',
          boxShadow: '0 2px 8px rgba(15, 23, 42, 0.08)',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
          boxSizing: 'border-box',
        }}>
          <div>
            <div style={{
              display: 'inline-block',
              fontSize: '10px',
              fontWeight: 800,
              backgroundColor: '#FFFBEB',
              color: '#D97706',
              padding: '2px 6px',
              borderRadius: '4px',
              marginBottom: '4px',
            }}>
              HOSPITALITY
            </div>
            <h3 style={{ fontSize: '15px', fontWeight: 800, color: '#0F172A', margin: 0 }}>
              Hotel & Hospitality Jobs
            </h3>
            <p style={{ fontSize: '11.5px', color: '#64748B', margin: '2px 0 0 0' }}>
              Opportunities in kitchen, housekeeping, food service & front desk
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
            {HOTEL_GRID.map((h, idx) => (
              <div
                key={idx}
                onClick={() => handleQuickTradeSearch(h.keyword)}
                style={{
                  backgroundColor: '#F8FAFC',
                  border: '1px solid #E2E8F0',
                  borderRadius: '6px',
                  padding: '10px 8px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  textAlign: 'center',
                  cursor: 'pointer',
                }}
              >
                <div style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '6px',
                  backgroundColor: '#FFFFFF',
                  border: '1px solid #E2E8F0',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '6px',
                }}>
                  <Utensils size={16} color="#D97706" />
                </div>
                <div style={{ fontSize: '11.5px', fontWeight: 700, color: '#0F172A', lineHeight: '14px' }}>
                  {h.name}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Applicant Advantage Section */}
        <div style={{
          backgroundColor: '#FFFFFF',
          borderRadius: '6px',
          border: '1px solid #CBD5E1',
          padding: '16px',
          boxShadow: '0 2px 8px rgba(15, 23, 42, 0.08)',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
          boxSizing: 'border-box',
        }}>
          <div>
            <div style={{
              display: 'inline-block',
              fontSize: '10px',
              fontWeight: 800,
              backgroundColor: '#EFF6FF',
              color: '#1B4FDF',
              padding: '2px 6px',
              borderRadius: '4px',
              marginBottom: '4px',
            }}>
              JOBMARKET ADVANTAGE
            </div>
            <h3 style={{ fontSize: '15px', fontWeight: 800, color: '#0F172A', margin: 0 }}>
              Why Industrial Workers Choose JobMarket
            </h3>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
              <CheckCircle2 size={18} color="#16A34A" style={{ flexShrink: 0, marginTop: '2px' }} />
              <div>
                <div style={{ fontSize: '13px', fontWeight: 700, color: '#0F172A' }}>
                  Direct MIDC Plant Hiring
                </div>
                <div style={{ fontSize: '11.5px', color: '#64748B' }}>
                  Connect straight with plant HR without middle consultants or commission cuts.
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
              <CheckCircle2 size={18} color="#16A34A" style={{ flexShrink: 0, marginTop: '2px' }} />
              <div>
                <div style={{ fontSize: '13px', fontWeight: 700, color: '#0F172A' }}>
                  100% Free Job Applications
                </div>
                <div style={{ fontSize: '11.5px', color: '#64748B' }}>
                  No registration charges or hidden fees for workers and job seekers.
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
              <CheckCircle2 size={18} color="#16A34A" style={{ flexShrink: 0, marginTop: '2px' }} />
              <div>
                <div style={{ fontSize: '13px', fontWeight: 700, color: '#0F172A' }}>
                  Bus & Canteen Verified Facilities
                </div>
                <div style={{ fontSize: '11.5px', color: '#64748B' }}>
                  All job openings specify company bus routes, subsidized canteen, and OT perks.
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filter Side Drawer Modal */}
      {homeFilterDrawerOpen && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(15, 23, 42, 0.5)',
          zIndex: 9999,
          display: 'flex',
          justifyContent: 'flex-end',
        }}>
          <div style={{
            width: '100%',
            maxWidth: '380px',
            backgroundColor: '#FFFFFF',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            boxShadow: '-4px 0 24px rgba(0,0,0,0.15)',
          }}>
            <div style={{
              padding: '16px',
              borderBottom: '1px solid #E2E8F0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}>
              <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 800, color: '#0F172A' }}>
                Filter Home Vacancies
              </h3>
              <button
                onClick={() => setHomeFilterDrawerOpen(false)}
                style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: '4px' }}
              >
                <X size={20} color="#64748B" />
              </button>
            </div>

            <div style={{ padding: '16px', flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                  MIDC Zone / Industrial Area
                </label>
                <select
                  value={homeFilters.midcZone}
                  onChange={(e) => setHomeFilters((prev) => ({ ...prev, midcZone: e.target.value }))}
                  style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '12.5px', backgroundColor: '#F8FAFC' }}
                >
                  <option value="All MIDC Zones">All MIDC Zones</option>
                  {MIDC_ZONES.map((z) => (
                    <option key={z} value={z}>
                      {z}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                  Job Type
                </label>
                <select
                  value={homeFilters.jobType}
                  onChange={(e) => setHomeFilters((prev) => ({ ...prev, jobType: e.target.value }))}
                  style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '12.5px', backgroundColor: '#F8FAFC' }}
                >
                  <option value="All Types">All Types</option>
                  <option value="Full-time">Full-time</option>
                  <option value="Part-time">Part-time</option>
                  <option value="Contract">Contract</option>
                  <option value="Apprenticeship">Apprenticeship</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '8px' }}>
                  Plant Facilities & Perks
                </label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: '#475569', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={homeFilters.busFacility}
                      onChange={(e) => setHomeFilters((prev) => ({ ...prev, busFacility: e.target.checked }))}
                    />
                    Bus Transport Facility
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: '#475569', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={homeFilters.canteen}
                      onChange={(e) => setHomeFilters((prev) => ({ ...prev, canteen: e.target.checked }))}
                    />
                    Canteen / Subsidized Food
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: '#475569', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={homeFilters.accommodation}
                      onChange={(e) => setHomeFilters((prev) => ({ ...prev, accommodation: e.target.checked }))}
                    />
                    Hostel / Accommodation
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: '#475569', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={homeFilters.overtime}
                      onChange={(e) => setHomeFilters((prev) => ({ ...prev, overtime: e.target.checked }))}
                    />
                    Overtime Pay Available
                  </label>
                </div>
              </div>
            </div>

            <div style={{ padding: '16px', borderTop: '1px solid #E2E8F0', display: 'flex', gap: '10px' }}>
              <button
                onClick={() => {
                  setHomeFilters({
                    industry: 'All Industries',
                    jobType: 'All Types',
                    workMode: 'All Modes',
                    midcZone: 'All MIDC Zones',
                    busFacility: false,
                    canteen: false,
                    accommodation: false,
                    overtime: false,
                  });
                }}
                style={{ flex: 1, padding: '10px', borderRadius: '6px', border: '1px solid #CBD5E1', backgroundColor: '#FFFFFF', color: '#475569', fontSize: '12.5px', fontWeight: 700, cursor: 'pointer' }}
              >
                Reset
              </button>
              <button
                onClick={() => {
                  setHomeFilterDrawerOpen(false);
                  const params = new URLSearchParams();
                  if (homeFilters.midcZone !== 'All MIDC Zones') params.set('location', homeFilters.midcZone);
                  if (homeFilters.jobType !== 'All Types') params.set('jobType', homeFilters.jobType);
                  if (homeFilters.busFacility) params.set('bus', 'true');
                  if (homeFilters.canteen) params.set('canteen', 'true');
                  if (homeFilters.accommodation) params.set('hostel', 'true');
                  if (homeFilters.overtime) params.set('ot', 'true');
                  navigate(`/jobs?${params.toString()}`);
                }}
                style={{ flex: 2, padding: '10px', borderRadius: '6px', border: 'none', backgroundColor: '#1B4FDF', color: '#FFFFFF', fontSize: '12.5px', fontWeight: 700, cursor: 'pointer' }}
              >
                Apply & Search
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
