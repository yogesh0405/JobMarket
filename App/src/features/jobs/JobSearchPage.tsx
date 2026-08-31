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
import { CompanyDefaultLogo } from '../../components/company/CompanyDefaultLogo';
import { MobileHeader } from '../../components/common/MobileHeader';
import { Job } from '../../types';
import {
  JobFilterModal,
  JobFilterValues,
  DEFAULT_JOB_FILTERS,
} from '../../components/job/JobFilterModal';

const CATEGORIES = [
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

const SEARCH_PLACEHOLDERS = [
  'Search jobs...',
  'Search trades (CNC, Welder, Fitter)...',
  'Search locations (Waluj, Chakan)...',
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

export const JobSearchPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { getJobs } = useJobs();
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState(searchParams.get('keyword') || '');
  const [selectedCategory, setSelectedCategory] = useState('All Jobs');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [filterDrawerOpen, setFilterDrawerOpen] = useState(false);
  const [placeholderIndex, setPlaceholderIndex] = useState(0);

  // Saved Jobs Local State
  const [savedJobIds, setSavedJobIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('saved_jobs_ids');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const toggleSaveJob = (jobId: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
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
    }, 2500);
    return () => clearInterval(timer);
  }, []);

  // Filter drawer options state
  const [activeFilters, setActiveFilters] = useState<JobFilterValues>(DEFAULT_JOB_FILTERS);

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
    return allJobs.filter((job) => {
      // Category filter
      if (selectedCategory !== 'All Jobs') {
        const cat = selectedCategory.toLowerCase();
        const titleMatch = (job.title || '').toLowerCase().includes(cat);
        const industryMatch = (job.industry || '').toLowerCase().includes(cat);
        const tradeMatch = (job.trade || '').toLowerCase().includes(cat);
        if (!titleMatch && !industryMatch && !tradeMatch) {
          return false;
        }
      }

      // Keyword query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const titleMatch = (job.title || '').toLowerCase().includes(q);
        const compMatch = (job.company || '').toLowerCase().includes(q);
        const locMatch = (job.location || '').toLowerCase().includes(q);
        const zoneMatch = (job.midcZone || job.midc_zone || '').toLowerCase();
        const tradeMatch = (job.trade || '').toLowerCase().includes(q);
        if (!titleMatch && !compMatch && !locMatch && !zoneMatch && !tradeMatch) {
          return false;
        }
      }

      // 1. Zone
      if (activeFilters.midcZone !== 'All Locations') {
        const zoneStr = (job.midc_zone || job.midcZone || job.address || job.city || job.location || '').toLowerCase();
        let keyword = activeFilters.midcZone.toLowerCase();
        if (keyword.includes('waluj')) keyword = 'waluj';
        else if (keyword.includes('shendra')) keyword = 'shendra';
        else if (keyword.includes('chikalthana')) keyword = 'chikalthana';
        else if (keyword.includes('chitegaon')) keyword = 'chitegaon';
        else if (keyword.includes('paithan')) keyword = 'paithan';
        else if (keyword.includes('bidkin')) keyword = 'bidkin';
        else if (keyword.includes('railway station')) keyword = 'railway';
        else if (keyword.includes('jalna road')) keyword = 'jalna';
        else if (keyword.includes('chhatrapati sambhajinagar') || keyword.includes('aurangabad')) keyword = 'sambhajinagar';
        else if (keyword.includes('chakan')) keyword = 'chakan';
        else if (keyword.includes('bhosari')) keyword = 'bhosari';
        else if (keyword.includes('talegaon')) keyword = 'talegaon';
        else if (keyword.includes('ranjangaon')) keyword = 'ranjangaon';
        else if (keyword.includes('taloja')) keyword = 'taloja';
        else if (keyword.includes('thane')) keyword = 'thane';

        const isMatch = zoneStr.includes(keyword) ||
          (keyword === 'sambhajinagar' && (
            zoneStr.includes('aurangabad') ||
            zoneStr.includes('waluj') ||
            zoneStr.includes('shendra') ||
            zoneStr.includes('chikalthana') ||
            zoneStr.includes('chitegaon') ||
            zoneStr.includes('paithan') ||
            zoneStr.includes('bidkin')
          ));
        if (!isMatch) return false;
      }

      // 2. Industry
      if (activeFilters.industry !== 'All Industries') {
        const ind = (job.industry || '').toLowerCase();
        const target = activeFilters.industry.toLowerCase();
        if (!ind.includes(target) && !target.includes(ind)) return false;
      }

      // 3. Trade / Role
      if (activeFilters.trade !== 'All Trades') {
        const title = (job.title || job.role || job.job_title || '').toLowerCase();
        const target = activeFilters.trade.toLowerCase();
        if (!title.includes(target) && !target.includes(title)) return false;
      }

      // 4. Education
      if (activeFilters.education !== 'All Education Levels') {
        const edu = (job.education || job.qualification || '').toLowerCase();
        const target = activeFilters.education.toLowerCase();
        if (!edu.includes(target) && !target.includes(edu)) return false;
      }

      // 5. Job Type
      if (activeFilters.jobType !== 'All Types') {
        const t = (job.job_type || job.jobType || job.type || '').toLowerCase();
        const target = activeFilters.jobType.toLowerCase();
        if (!t.includes(target) && !target.includes(t)) return false;
      }

      // 6. Work Mode
      if (activeFilters.workMode !== 'All Modes') {
        const m = (job.work_mode || job.workMode || '').toLowerCase();
        const target = activeFilters.workMode.toLowerCase();
        if (!m.includes(target) && !target.includes(m)) return false;
      }

      // 7. Experience
      if (activeFilters.minExperience !== 'All Experience') {
        const expStr = (job.experience || job.min_experience || job.minExperience || '').toLowerCase();
        const target = activeFilters.minExperience.toLowerCase();
        if (!expStr.includes(target) && !target.includes(expStr)) return false;
      }

      // 8. Perks & Facilities
      if (activeFilters.busFacility && !(job.bus_facility ?? job.busFacility)) return false;
      if (activeFilters.canteen && !(job.canteen ?? job.canteenFacility)) return false;
      if (activeFilters.accommodation && !(job.accommodation ?? job.hostelFacility)) return false;
      if (activeFilters.overtime && !(job.overtime ?? job.otFacility)) return false;

      return true;
    });
  }, [allJobs, selectedCategory, searchQuery, activeFilters]);

  const resetAllFilters = () => {
    setSearchQuery('');
    setSelectedCategory('All Jobs');
    setActiveFilters(DEFAULT_JOB_FILTERS);
  };

  return (
    <div style={{ width: '100%', minHeight: '100vh', background: '#F8FAFC', boxSizing: 'border-box' }}>
      <style>{`
        .jobs-main-container {
          width: 100%;
          max-width: 780px;
          margin: 0 auto;
          padding: 20px 16px 80px 16px;
          display: flex;
          flex-direction: column;
          gap: 16px;
          box-sizing: border-box;
        }

        @media (max-width: 767px) {
          .jobs-main-container {
            max-width: 580px;
            padding: 10px 12px 100px 12px !important;
            gap: 12px !important;
          }
        }
      `}</style>

      {/* Main Content Area */}
      <div className="jobs-main-container">
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
          <div style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            backgroundColor: '#F8FAFC',
            border: '1px solid #CBD5E1',
            borderRadius: '6px',
            padding: '0 10px',
            height: '40px',
            gap: '8px',
            boxSizing: 'border-box',
          }}>
            <Search size={16} color="#64748B" style={{ flexShrink: 0 }} />
            <input
              type="text"
              placeholder={SEARCH_PLACEHOLDERS[placeholderIndex]}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                flex: 1,
                border: 'none',
                outline: 'none',
                background: 'transparent',
                fontSize: '12.5px',
                color: '#0F172A',
                fontWeight: 500,
                padding: 0,
                margin: 0,
                width: '100%'
              }}
            />
            {searchQuery.length > 0 && (
              <button
                onClick={() => setSearchQuery('')}
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

            <div style={{ width: '1px', height: '18px', backgroundColor: '#E2E8F0' }} />

            <button
              onClick={() => setFilterDrawerOpen(true)}
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
            gap: '6px',
            overflowX: 'auto',
            scrollbarWidth: 'none',
            msOverflowStyle: 'none',
            WebkitOverflowScrolling: 'touch',
            marginBottom: '10px',
            width: '100%',
            boxSizing: 'border-box',
            paddingBottom: '2px',
          }}
        >
          {CATEGORIES.map((cat) => {
            const isActive = selectedCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                style={{
                  padding: '5px 12px',
                  borderRadius: '4px',
                  fontSize: '11.5px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  border: isActive ? '1px solid #1B4FDF' : '1px solid #E2E8F0',
                  backgroundColor: isActive ? '#1B4FDF' : '#F8FAFC',
                  color: isActive ? '#FFFFFF' : '#475569',
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
        <div style={{ marginBottom: '10px', fontSize: '11.5px', fontWeight: 500, color: '#64748B' }}>
          Showing <span style={{ fontWeight: 800, color: '#1B4FDF' }}>{filteredJobs.length}</span> active vacancies
        </div>

        {/* Job Cards List */}
        {filteredJobs.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {filteredJobs.map((job) => {
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
                      logoUrl={job.companyLogo}
                      size={42}
                      borderRadius="6px"
                    />
                    <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: '2px' }}>
                      <h4 style={{
                        margin: 0,
                        fontSize: '14px',
                        fontWeight: 800,
                        color: '#0F172A',
                        letterSpacing: '-0.15px',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                      }}>
                        {job.title}
                      </h4>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px', minWidth: 0 }}>
                        <MapPin size={12} color="#64748B" style={{ flexShrink: 0 }} />
                        <span style={{
                          fontSize: '11.5px',
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
                        fontSize: '14px',
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
                        onClick={(e) => toggleSaveJob(job.id, e)}
                        style={{
                          background: 'transparent',
                          border: 'none',
                          padding: '2px',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                        title={isSaved ? 'Remove from Saved' : 'Save Job'}
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
                      gap: '6px',
                      marginTop: '6px',
                      width: '100%',
                      overflow: 'hidden',
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px', flexShrink: 0 }}>
                        <Briefcase size={13} color="#64748B" />
                        <span style={{ fontSize: '11px', fontWeight: 600, color: '#475569' }}>
                          {expText}
                        </span>
                      </div>

                      <span style={{ fontSize: '11px', color: '#CBD5E1' }}>|</span>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '2px', flexShrink: 0 }}>
                        <span style={{ fontWeight: 700, color: '#64748B', fontSize: '11px' }}>₹</span>
                        <span style={{ fontSize: '11px', fontWeight: 600, color: '#475569' }}>
                          {salaryText}
                        </span>
                      </div>

                      <span style={{ fontSize: '11px', color: '#CBD5E1' }}>|</span>

                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        flex: 1,
                        minWidth: 0,
                        overflow: 'hidden',
                      }}>
                        <MapPin size={13} color="#64748B" style={{ flexShrink: 0 }} />
                        <span style={{
                          fontSize: '11px',
                          fontWeight: 600,
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
                    gap: '12px',
                    padding: '9px 14px',
                    backgroundColor: '#F8FAFC',
                    borderBottom: '1px solid #F1F5F9',
                    boxSizing: 'border-box',
                    overflow: 'hidden',
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', flexShrink: 0 }}>
                      <Clock size={13} color="#64748B" />
                      <span style={{ fontSize: '11px', fontWeight: 600, color: '#475569' }}>
                        {job.jobType || 'Full-time'}
                      </span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', flexShrink: 0 }}>
                      <Building2 size={13} color="#64748B" />
                      <span style={{ fontSize: '11px', fontWeight: 600, color: '#475569' }}>
                        {job.workMode || 'On-site'}
                      </span>
                    </div>

                    {openings ? (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px', flexShrink: 0 }}>
                        <Users size={13} color="#64748B" />
                        <span style={{ fontSize: '11px', fontWeight: 600, color: '#475569' }}>
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
                    padding: '9px 14px',
                    boxSizing: 'border-box',
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1, minWidth: 0 }}>
                      <CompanyDefaultLogo
                        name={job.company}
                        logoUrl={job.companyLogo}
                        size={38}
                        borderRadius="6px"
                      />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{
                          fontSize: '11.5px',
                          fontWeight: 700,
                          color: '#0F172A',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                        }}>
                          {job.company}
                        </div>
                        <div style={{ fontSize: '10px', color: '#64748B' }}>
                          Posted by Recruiter
                        </div>
                      </div>
                    </div>

                    <div style={{
                      fontSize: '10.5px',
                      fontWeight: 600,
                      color: '#94A3B8',
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
