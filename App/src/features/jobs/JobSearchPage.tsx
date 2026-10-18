import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import {
  Search,
  SlidersHorizontal,
  X,
  Briefcase,
  MapPin,
  Clock,
  Building2,
  Users,
  Bookmark,
  LayoutGrid,
  List,
  Map as MapIcon,
  RotateCcw,
} from 'lucide-react';
import { useJobs, JobFilters } from '../../hooks/useJobs';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../hooks/useToast';
import { CompanyDefaultLogo } from '../../components/company/CompanyDefaultLogo';
import { MobileHeader } from '../../components/common/MobileHeader';
import { apiFetch } from '../../utils/api';
import { Job } from '../../types';
import {
  JobFilterModal,
  JobFilterValues,
  DEFAULT_JOB_FILTERS,
} from '../../components/job/JobFilterModal';
import { JobDesktopSideFilter } from '../../components/job/JobDesktopSideFilter';

export const CATEGORIES = [
  'All Jobs',
  'Automotive',
  'CNC / VMC Operator',
  'Welder / Fabricator',
  'Fitter / Turner',
  'Quality Inspector',
  'Electrician',
  'Maintenance Engineer',
  'Assembly Operator',
  'Store & Inventory',
  'Packaging',
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

export const matchesJobFilter = (
  job: Job,
  filters: Partial<JobFilterValues>,
  search: string = '',
  category: string = 'All Jobs'
): boolean => {
  // Category filter
  if (category && category !== 'All Jobs') {
    const cat = category.toLowerCase().trim();
    const title = (job.title || '').toLowerCase();
    const industry = (job.industry || '').toLowerCase();
    const trade = (job.trade || '').toLowerCase();
    const catField = ((job as any).category || (job as any).category_name || (job as any).categoryName || (job as any).job_category || '').toLowerCase();

    const titleMatch = title.includes(cat);
    const industryMatch = industry.includes(cat) || (industry.length > 0 && cat.includes(industry));
    const tradeMatch = trade.includes(cat) || (trade.length > 0 && cat.includes(trade));
    const catFieldMatch = catField.includes(cat) || (catField.length > 0 && cat.includes(catField));

    const tokens = cat.replace(/[()&,/]/g, ' ').split(/\s+/).filter((t: string) => t.length > 2);
    const allJobText = `${title} ${industry} ${trade} ${catField}`;
    const tokenMatch = tokens.length > 0 && tokens.some((t: string) => allJobText.includes(t));

    if (!titleMatch && !industryMatch && !tradeMatch && !catFieldMatch && !tokenMatch) {
      return false;
    }
  }

  // Keyword search
  if (search.trim()) {
    const q = search.toLowerCase().trim();
    const fullJobText = [
      job.title,
      job.company,
      job.description,
      job.location,
      job.industry,
      (job as any).industryType,
      job.trade,
      (job as any).itiTrade,
      job.workMode,
      job.jobType,
      job.midcZone,
      (job as any).shiftDetails,
      job.educationRequirement,
      (job as any).education_requirement,
      (job as any).education_level,
      ...(job.skills || []),
      ...(job.requirements || []),
    ].filter(Boolean).join(' ').toLowerCase();

    const tokens = q.split(/[\s/&,-]+/).filter((t) => t.length > 0 && !['and', 'or', 'in', 'of', 'for', 'the'].includes(t));
    const matches = tokens.length > 0 ? tokens.some((t) => fullJobText.includes(t)) : true;
    if (!matches) return false;
  }

  // 1. Zone
  if (filters.midcZone && filters.midcZone !== 'All Locations') {
    const zoneStr = (job.midc_zone || job.midcZone || job.address || job.city || job.location || '').toLowerCase();
    const target = filters.midcZone.toLowerCase();
    const keywords = ['waluj', 'shendra', 'chikalthana', 'chitegaon', 'paithan', 'bidkin', 'railway', 'jalna', 'sambhajinagar', 'chakan', 'bhosari', 'talegaon', 'ranjangaon', 'taloja', 'thane', 'pune'];
    let matchedKw = '';
    for (const kw of keywords) {
      if (target.includes(kw)) {
        matchedKw = kw;
        break;
      }
    }
    if (matchedKw) {
      if (matchedKw === 'sambhajinagar') {
        const isSnb = zoneStr.includes('sambhajinagar') || zoneStr.includes('aurangabad') || zoneStr.includes('waluj') || zoneStr.includes('shendra') || zoneStr.includes('chikalthana') || zoneStr.includes('chitegaon') || zoneStr.includes('paithan') || zoneStr.includes('bidkin');
        if (!isSnb) return false;
      } else {
        if (!zoneStr.includes(matchedKw)) return false;
      }
    } else {
      if (!zoneStr.includes(target) && !target.includes(zoneStr)) return false;
    }
  }

  // 2. Industry
  if (filters.industry && filters.industry !== 'All Industries') {
    const ind = (job.industry || (job as any).industryType || '').toLowerCase();
    const target = filters.industry.toLowerCase();
    const tokens = target.split(/[\s&,/()]+/).filter((t) => t.length > 2);
    const matches = ind.includes(target) || target.includes(ind) || tokens.some((t) => ind.includes(t));
    if (!matches) return false;
  }

  // 3. Trade / Role
  if (filters.trade && filters.trade !== 'All Trades') {
    const tradeText = `${job.title || ''} ${job.trade || ''} ${(job as any).role || ''} ${(job as any).job_title || ''}`.toLowerCase();
    const target = filters.trade.toLowerCase();
    const tokens = target.split(/[\s&,/()]+/).filter((t) => t.length > 2);
    const matches = tradeText.includes(target) || tradeText.includes(tradeText) || tokens.some((t) => tradeText.includes(t));
    if (!matches) return false;
  }

  // 4. Education
  if (filters.education && filters.education !== 'All Education Levels') {
    const edu = `${job.educationRequirement || ''} ${(job as any).education_requirement || ''} ${job.education || ''} ${(job as any).qualification || ''} ${(job as any).education_level || ''}`.toLowerCase();
    const target = filters.education.toLowerCase();
    const tokens = target.split(/[\s&,/()]+/).filter((t) => t.length > 2);
    const matches = edu.includes(target) || target.includes(edu) || tokens.some((t) => edu.includes(t));
    if (!matches) return false;
  }

  // 5. Job Type
  if (filters.jobType && filters.jobType !== 'All Types') {
    const t = (job.job_type || job.jobType || job.type || '').toLowerCase().replace(/[^a-z0-9]/g, '');
    const target = filters.jobType.toLowerCase().replace(/[^a-z0-9]/g, '');
    if (!t.includes(target) && !target.includes(t)) return false;
  }

  // 6. Work Mode
  if (filters.workMode && filters.workMode !== 'All Modes') {
    const m = (job.work_mode || job.workMode || '').toLowerCase().replace(/[^a-z0-9]/g, '');
    const target = filters.workMode.toLowerCase().replace(/[^a-z0-9]/g, '');
    if (!m.includes(target) && !target.includes(m)) return false;
  }

  // 7. Experience Range
  if (filters.minExperience && filters.minExperience !== 'All Experience') {
    const target = filters.minExperience.toLowerCase();
    const minE = job.minExperience ?? 0;
    const maxE = job.maxExperience ?? minE;

    if (target.includes('fresher') || target.includes('0')) {
      if (!(minE === 0 || (job as any).acceptFreshers === true || (job as any).experienceRequired === false)) {
        return false;
      }
    } else if (target.includes('1') && target.includes('3')) {
      if (!(minE <= 3 && maxE >= 1)) return false;
    } else if (target.includes('3') && target.includes('5')) {
      if (!(minE <= 5 && maxE >= 3)) return false;
    } else if (target.includes('5+') || target.includes('5')) {
      if (!(maxE >= 5)) return false;
    }
  }

  // 8. Perks & Facilities
  if (filters.busFacility && !(job.bus_facility ?? job.busFacility)) return false;
  if (filters.canteen && !(job.canteen ?? (job as any).canteenFacility)) return false;
  if (filters.accommodation && !(job.accommodation ?? (job as any).hostelFacility)) return false;
  if (filters.overtime && !(job.overtime ?? (job as any).otFacility)) return false;

  return true;
};

export const JobSearchPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { getJobs, toggleSaveJob, isJobSaved, fetchCandidateSavedJobs } = useJobs();
  const { currentUser } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState(searchParams.get('keyword') || '');
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || 'All Jobs');
  const [categoriesList, setCategoriesList] = useState<string[]>(CATEGORIES);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [filterDrawerOpen, setFilterDrawerOpen] = useState(false);

  // Fetch dynamic categories from backend API on mount
  useEffect(() => {
    let isMounted = true;
    apiFetch('/api/v1/jobs/meta/categories')
      .then(r => r.ok ? r.json() : null)
      .then(res => {
        if (!isMounted) return;
        if (res && res.success && Array.isArray(res.data) && res.data.length > 0) {
          const names: string[] = res.data
            .map((c: any) => typeof c === 'string' ? c : c.name)
            .filter(Boolean);
          const merged = Array.from(new Set(['All Jobs', ...names, ...CATEGORIES]));
          setCategoriesList(merged);
        }
      })
      .catch(() => null);

    return () => { isMounted = false; };
  }, []);

  // Sync category param from URL
  useEffect(() => {
    const cat = searchParams.get('category');
    if (cat) {
      setSelectedCategory(cat);
    }
  }, [searchParams]);

  // Sync candidate saved jobs from PostgreSQL on mount
  useEffect(() => {
    if (currentUser && fetchCandidateSavedJobs) {
      fetchCandidateSavedJobs();
    }
  }, [currentUser?.id, fetchCandidateSavedJobs]);

  const handleToggleSaveJob = (jobId: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

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


  // Sync search query from URL params when navigating from Home page or external links
  useEffect(() => {
    const kw = searchParams.get('keyword');
    if (kw !== null) {
      setSearchQuery(kw);
    }
  }, [searchParams]);

  // Filter drawer options state
  const [activeFilters, setActiveFilters] = useState<JobFilterValues>(() => {
    // Pre-populate from URL params (e.g. when navigating from Home page filter)
    const p = new URLSearchParams(window.location.search);
    return {
      midcZone: p.get('location') || 'All Locations',
      industry: p.get('industry') || 'All Industries',
      trade: p.get('trade') || 'All Trades',
      education: p.get('education') || 'All Education Levels',
      jobType: p.get('jobType') || 'All Types',
      workMode: p.get('workMode') || 'All Modes',
      minExperience: p.get('exp') || 'All Experience',
      busFacility: p.get('bus') === 'true',
      canteen: p.get('canteen') === 'true',
      accommodation: p.get('hostel') === 'true',
      overtime: p.get('ot') === 'true',
    };
  });

  // Sync activeFilters whenever the URL params change
  useEffect(() => {
    setActiveFilters({
      midcZone: searchParams.get('location') || 'All Locations',
      industry: searchParams.get('industry') || 'All Industries',
      trade: searchParams.get('trade') || 'All Trades',
      education: searchParams.get('education') || 'All Education Levels',
      jobType: searchParams.get('jobType') || 'All Types',
      workMode: searchParams.get('workMode') || 'All Modes',
      minExperience: searchParams.get('exp') || 'All Experience',
      busFacility: searchParams.get('bus') === 'true',
      canteen: searchParams.get('canteen') === 'true',
      accommodation: searchParams.get('hostel') === 'true',
      overtime: searchParams.get('ot') === 'true',
    });
  }, [searchParams]);

  const allJobs = useMemo(() => {
    return getJobs({});
  }, [getJobs]);

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (activeFilters.midcZone !== 'All Locations') count++;
    if (activeFilters.industry !== 'All Industries') count++;
    if (activeFilters.trade !== 'All Trades') count++;
    if (activeFilters.education !== 'All Education Levels') count++;
    if (activeFilters.jobType !== 'All Types') count++;
    if (activeFilters.workMode !== 'All Modes') count++;
    if (activeFilters.minExperience !== 'All Experience') count++;
    if (activeFilters.busFacility) count++;
    if (activeFilters.canteen) count++;
    if (activeFilters.accommodation) count++;
    if (activeFilters.overtime) count++;
    return count;
  }, [activeFilters]);

  const filteredJobs = useMemo(() => {
    return allJobs.filter((job) => matchesJobFilter(job, activeFilters, searchQuery, selectedCategory));
  }, [allJobs, selectedCategory, searchQuery, activeFilters]);

  const resetAllFilters = () => {
    setSearchQuery('');
    setSelectedCategory('All Jobs');
    setActiveFilters(DEFAULT_JOB_FILTERS);
    setSearchParams({});
  };

  return (
    <div style={{ width: '100%', minHeight: '100vh', background: '#F8FAFC', boxSizing: 'border-box' }}>
      <style>{`
        .jobs-page-wrapper {
          width: 100%;
          max-width: 1240px;
          margin: 0 auto;
          padding: 24px 20px 80px 20px;
          display: flex;
          gap: 24px;
          align-items: flex-start;
          box-sizing: border-box;
        }

        .jobs-main-content {
          flex: 1;
          min-width: 0;
          display: flex;
          flex-direction: column;
          gap: 14px;
          box-sizing: border-box;
        }

        @media (max-width: 1023px) {
          .jobs-page-wrapper {
            max-width: 780px;
            padding: 20px 16px 80px 16px;
            display: flex;
            flex-direction: column;
            gap: 16px;
          }
          .desktop-side-filter {
            display: none !important;
          }
        }

        @media (max-width: 767px) {
          .jobs-page-wrapper {
            max-width: 580px;
            padding: 10px 12px 100px 12px !important;
            gap: 12px !important;
          }
        }

        @media (min-width: 1024px) {
          .mobile-filter-trigger {
            display: none !important;
          }
        }
      `}</style>

      {/* Main Content Area */}
      <div className="jobs-page-wrapper">
        {/* Desktop Side Filter (Strictly desktop view >= 1024px) */}
        <JobDesktopSideFilter
          currentFilters={activeFilters}
          onApplyFilters={(applied) => setActiveFilters(applied)}
          onResetFilters={resetAllFilters}
          allJobs={allJobs}
          activeFilterCount={activeFilterCount}
        />

        {/* Main Content Column */}
        <div className="jobs-main-content">
        {/* Top Search Bar & View Mode Bar */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          marginBottom: '10px',
          width: '100%',
          boxSizing: 'border-box'
        }}>
          {/* Search Input Box */}
          <div
            onClick={() => navigate(`/search${searchQuery ? `?q=${encodeURIComponent(searchQuery)}` : ''}`)}
            style={{
              flex: 1,
              minWidth: 0,
              display: 'flex',
              alignItems: 'center',
              backgroundColor: '#F8FAFC',
              border: '1px solid #CBD5E1',
              borderRadius: '6px',
              padding: '0 10px',
              height: '40px',
              gap: '8px',
              boxSizing: 'border-box',
              cursor: 'pointer',
            }}
          >
            <Search size={16} color="#64748B" style={{ flexShrink: 0 }} />
            <div
              style={{
                flex: 1,
                minWidth: 0,
                fontSize: '14.5px',
                color: searchQuery ? '#0F172A' : '#64748B',
                fontWeight: searchQuery ? 600 : 500,
                userSelect: 'none',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              {searchQuery || 'Search jobs...'}
            </div>
            {searchQuery.length > 0 && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setSearchQuery('');
                  setSearchParams({});
                }}
                style={{
                  background: '#F1F5F9',
                  border: 'none',
                  borderRadius: '50%',
                  width: '20px',
                  height: '20px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  padding: 0,
                }}
              >
                <X size={12} color="#64748B" />
              </button>
            )}

            <div className="mobile-filter-trigger" style={{ width: '1px', height: '18px', backgroundColor: '#E2E8F0' }} />

            <button
              className="mobile-filter-trigger"
              onClick={(e) => { e.stopPropagation(); setFilterDrawerOpen(true); }}
              style={{
                background: 'transparent',
                border: 'none',
                padding: '4px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                color: '#1B4FDF',
                position: 'relative',
              }}
              title="Filter Jobs"
            >
              <SlidersHorizontal size={17} color="#1B4FDF" />
              {activeFilterCount > 0 && (
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
                  {activeFilterCount}
                </span>
              )}
            </button>
          </div>

          {/* View Toggle Buttons */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            backgroundColor: '#FFFFFF',
            border: '1px solid #CBD5E1',
            borderRadius: '6px',
            padding: '2px',
            gap: '2px',
            height: '40px',
            boxSizing: 'border-box',
            flexShrink: 0,
          }}>
            <button
              onClick={() => setViewMode('grid')}
              style={{
                background: viewMode === 'grid' ? '#EFF6FF' : 'transparent',
                border: 'none',
                borderRadius: '4px',
                padding: '6px 7px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                color: viewMode === 'grid' ? '#1B4FDF' : '#64748B',
              }}
              title="Card View"
            >
              <LayoutGrid size={15} />
            </button>
            <button
              onClick={() => setViewMode('list')}
              style={{
                background: viewMode === 'list' ? '#EFF6FF' : 'transparent',
                border: 'none',
                borderRadius: '4px',
                padding: '6px 7px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                color: viewMode === 'list' ? '#1B4FDF' : '#64748B',
              }}
              title="List View"
            >
              <List size={15} />
            </button>
            <button
              onClick={() => navigate('/jobs/map')}
              style={{
                background: 'transparent',
                border: 'none',
                borderRadius: '4px',
                padding: '6px 7px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                color: '#059669',
              }}
              title="Map View"
            >
              <MapPin size={15} />
            </button>
          </div>
        </div>

        {/* Category Filter Chips Horizontal Scroll */}
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
            marginBottom: '12px',
            width: '100%',
            boxSizing: 'border-box',
            paddingBottom: '4px',
          }}
        >
          {categoriesList.map((cat) => {
            const isActive = selectedCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                style={{
                  padding: '6px 14px',
                  borderRadius: '6px',
                  fontSize: '13px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  border: isActive ? '1px solid #1B4FDF' : '1px solid #CBD5E1',
                  backgroundColor: isActive ? '#1B4FDF' : '#FFFFFF',
                  color: isActive ? '#FFFFFF' : '#334155',
                  transition: 'all 0.15s ease',
                  flexShrink: 0,
                }}
              >
                {cat}
              </button>
            );
          })}
        </div>

        {/* Results Count Line */}
        <div style={{ marginBottom: '12px', fontSize: '13.5px', fontWeight: 600, color: '#475569' }}>
          Showing <span style={{ fontWeight: 800, color: '#1B4FDF' }}>{filteredJobs.length}</span> active vacancies
        </div>

        {/* Job Cards List */}
        {filteredJobs.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {filteredJobs.map((job) => {
              const isSaved = isJobSaved(job.id);
              const isExpNotRequired = (job as any).experienceRequired === false || (job as any).experience_required === false;
              const minExp = job.minExperience ?? (job as any).min_experience;
              const maxExp = job.maxExperience ?? (job as any).max_experience;
              const isFresher = isExpNotRequired || (minExp === 0 && (maxExp === 0 || maxExp === undefined || maxExp === null));
              const expText = isFresher
                ? 'Fresher'
                : minExp !== undefined
                ? `${minExp}-${maxExp ?? minExp + 2} Yrs Exp`
                : 'Fresher';
              const salaryText =
                job.salaryMin && job.salaryMax
                  ? `${(job.salaryMin / 100000).toFixed(1)}-${(job.salaryMax / 100000).toFixed(1)} Lacs PA`
                  : '3.5-5.5 Lacs PA';
              const locationText = job.midcZone || job.location || 'Chhatrapati Sambhajinagar';
              const openings = job.openings || 4;

              if (viewMode === 'list') {
                return (
                  <Link
                    key={job.id}
                    to={`/job/${job.id}`}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      backgroundColor: '#FFFFFF',
                      borderRadius: '6px',
                      border: '1px solid #CBD5E1',
                      padding: '12px',
                      marginBottom: '10px',
                      textDecoration: 'none',
                      color: 'inherit',
                      boxShadow: '0 1px 3px rgba(15, 23, 42, 0.04)',
                      transition: 'all 0.15s ease',
                      boxSizing: 'border-box',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = '#94A3B8';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = '#CBD5E1';
                    }}
                  >
                    <CompanyDefaultLogo
                      name={job.company}
                      logoUrl={job.companyLogo || (job as any).company_logo || (job as any).logoUrl || (job as any).logo_url || (job as any).logo}
                      size={42}
                      borderRadius="6px"
                    />
                    <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <h4 style={{
                        margin: 0,
                        fontSize: '16px',
                        fontWeight: 800,
                        color: '#0F172A',
                        letterSpacing: '-0.15px',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                      }}>
                        {job.title}
                      </h4>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '5px', minWidth: 0 }}>
                        <MapPin size={13} color="#64748B" style={{ flexShrink: 0 }} />
                        <span style={{
                          fontSize: '13px',
                          color: '#64748B',
                          fontWeight: 500,
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                        }}>
                          {locationText}
                        </span>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={(e) => handleToggleSaveJob(job.id, e)}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        padding: '6px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        borderRadius: '4px',
                        flexShrink: 0
                      }}
                      title={isSaved ? 'Remove from Saved' : 'Save Job'}
                      aria-label={isSaved ? 'Remove from Saved' : 'Save Job'}
                    >
                      <Bookmark
                        size={18}
                        color={isSaved ? '#1B4FDF' : '#94A3B8'}
                        fill={isSaved ? '#1B4FDF' : 'transparent'}
                      />
                    </button>
                  </Link>
                );
              }

              return (
                <Link
                  key={job.id}
                  to={`/job/${job.id}`}
                  style={{
                    width: '100%',
                    backgroundColor: '#FFFFFF',
                    borderRadius: '6px',
                    border: '1px solid #CBD5E1',
                    marginBottom: '12px',
                    overflow: 'hidden',
                    textDecoration: 'none',
                    color: 'inherit',
                    display: 'flex',
                    flexDirection: 'column',
                    boxShadow: '0 2px 8px rgba(15, 23, 42, 0.08), 0 1px 3px rgba(15, 23, 42, 0.05)',
                    boxSizing: 'border-box',
                    transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = '#94A3B8';
                    e.currentTarget.style.boxShadow = '0 4px 14px rgba(15, 23, 42, 0.12), 0 1px 4px rgba(15, 23, 42, 0.08)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = '#CBD5E1';
                    e.currentTarget.style.boxShadow = '0 2px 8px rgba(15, 23, 42, 0.08), 0 1px 3px rgba(15, 23, 42, 0.05)';
                  }}
                >
                  {/* Top Section */}
                  <div style={{
                    padding: '14px',
                    borderBottom: '1px solid #F1F5F9',
                    boxSizing: 'border-box',
                  }}>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: '8px',
                    }}>
                      <h3 style={{
                        margin: 0,
                        fontSize: '16px',
                        fontWeight: 800,
                        color: '#0F172A',
                        letterSpacing: '-0.15px',
                        flex: 1,
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                      }}>
                        {job.title}
                      </h3>

                      <button
                        type="button"
                        onClick={(e) => handleToggleSaveJob(job.id, e)}
                        style={{
                          background: 'transparent',
                          border: 'none',
                          padding: '4px',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          borderRadius: '4px',
                        }}
                        title={isSaved ? 'Remove from Saved' : 'Save Job'}
                        aria-label={isSaved ? 'Remove from Saved' : 'Save Job'}
                      >
                        <Bookmark
                          size={18}
                          color={isSaved ? '#1B4FDF' : '#94A3B8'}
                          fill={isSaved ? '#1B4FDF' : 'transparent'}
                        />
                      </button>
                    </div>

                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      marginTop: '8px',
                      width: '100%',
                      overflow: 'hidden',
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px', flexShrink: 0 }}>
                        <Briefcase size={14} color="#64748B" />
                        <span style={{ fontSize: '13px', fontWeight: 600, color: '#334155' }}>
                          {expText}
                        </span>
                      </div>

                      <span style={{ fontSize: '12px', color: '#CBD5E1' }}>|</span>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '2px', flexShrink: 0 }}>
                        <span style={{ fontWeight: 700, color: '#64748B', fontSize: '13px' }}>₹</span>
                        <span style={{ fontSize: '13px', fontWeight: 700, color: '#16A34A' }}>
                          {salaryText}
                        </span>
                      </div>

                      <span style={{ fontSize: '12px', color: '#CBD5E1' }}>|</span>

                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        flex: 1,
                        minWidth: 0,
                        overflow: 'hidden',
                      }}>
                        <MapPin size={14} color="#64748B" style={{ flexShrink: 0 }} />
                        <span style={{
                          fontSize: '13px',
                          fontWeight: 500,
                          color: '#475569',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                        }}>
                          {locationText}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Middle Section (Specs Row) */}
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '14px',
                    padding: '10px 14px',
                    backgroundColor: '#F8FAFC',
                    borderBottom: '1px solid #F1F5F9',
                    boxSizing: 'border-box',
                    overflow: 'hidden',
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px', flexShrink: 0 }}>
                      <Clock size={13} color="#64748B" />
                      <span style={{ fontSize: '12.5px', fontWeight: 600, color: '#334155' }}>
                        {job.jobType || 'Full-time'}
                      </span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px', flexShrink: 0 }}>
                      <Building2 size={13} color="#64748B" />
                      <span style={{ fontSize: '12.5px', fontWeight: 600, color: '#334155' }}>
                        {job.workMode || 'On-site'}
                      </span>
                    </div>

                    {openings ? (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '5px', flexShrink: 0 }}>
                        <Users size={13} color="#64748B" />
                        <span style={{ fontSize: '12.5px', fontWeight: 600, color: '#334155' }}>
                          {openings} Vacancies
                        </span>
                      </div>
                    ) : null}
                  </div>

                  {/* Bottom Section (Employer info & time ago) */}
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '10px 14px',
                    boxSizing: 'border-box',
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1, minWidth: 0 }}>
                      <CompanyDefaultLogo
                        name={job.company}
                        logoUrl={job.companyLogo || (job as any).company_logo || (job as any).logoUrl || (job as any).logo_url || (job as any).logo}
                        size={40}
                        borderRadius="6px"
                      />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{
                          fontSize: '13.5px',
                          fontWeight: 700,
                          color: '#0F172A',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                        }}>
                          {job.company}
                        </div>
                        <div style={{ fontSize: '11.5px', color: '#64748B' }}>
                          Direct Employer
                        </div>
                      </div>
                    </div>

                    <div style={{
                      fontSize: '12px',
                      fontWeight: 600,
                      color: '#64748B',
                      flexShrink: 0,
                      marginLeft: '8px',
                    }}>
                      {formatTimeAgo(job.postedAt || (job as any).created_at)}
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        ) : (
          /* Empty State */
          <div style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '6px',
            border: '1px solid #CBD5E1',
            padding: '30px',
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            marginTop: '20px',
            boxSizing: 'border-box',
          }}>
            <Briefcase size={32} color="#94A3B8" />
            <h3 style={{ fontSize: '15px', fontWeight: 800, color: '#0F172A', marginTop: '10px', marginBottom: 0 }}>
              No matching job vacancies
            </h3>
            <p style={{ fontSize: '11.5px', color: '#64748B', marginTop: '4px', marginBottom: 0, lineHeight: '16px' }}>
              Try clearing filters or search term to see more listings.
            </p>
            <button
              onClick={resetAllFilters}
              style={{
                backgroundColor: '#1B4FDF',
                padding: '8px 16px',
                borderRadius: '4px',
                marginTop: '14px',
                border: 'none',
                cursor: 'pointer',
                fontSize: '11.5px',
                fontWeight: 700,
                color: '#FFFFFF',
              }}
            >
              Reset All Filters
            </button>
          </div>
        )}
        </div>
      </div>

      {/* Industry-Standard Job Filter Modal */}
      <JobFilterModal
        isOpen={filterDrawerOpen}
        onClose={() => setFilterDrawerOpen(false)}
        currentFilters={activeFilters}
        onApplyFilters={(applied) => setActiveFilters(applied)}
        onResetFilters={() => setActiveFilters(DEFAULT_JOB_FILTERS)}
        allJobs={allJobs}
        totalJobsCount={allJobs.length}
      />
    </div>
  );
};
