import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  ArrowLeft,
  Search,
  SearchX,
  X,
  Clock,
  TrendingUp,
  Briefcase,
  MapPin,
  Building2,
  ChevronRight,
  ArrowUpRight,
} from 'lucide-react';
import { apiFetch } from '../../utils/api';
import { Job } from '../../types';
import { CompanyDefaultLogo } from '../../components/company/CompanyDefaultLogo';

const RECENT_SEARCHES_STORAGE_KEY = '@jobmarket_recent_searches_v2';
const COMPANIES_CACHE_KEY = '@jobmarket_companies_cache';
const JOBS_CACHE_KEY = '@jobmarket_jobs_cache';

const TRENDING_ROLES = [
  'CNC Machine Operator',
  'VMC 3-Axis Machinist',
  'ITI Electrician',
  'Fitter Technician',
  'Quality Inspector (QA/QC)',
  'Industrial Welder (MIG/TIG)',
  'Production Supervisor',
  'Tool & Die Maker',
];

const TRENDING_LOCATIONS = [
  'Waluj MIDC, Chhatrapati Sambhajinagar',
  'Chakan MIDC, Pune',
  'Bhosari MIDC, Pune',
  'Shendra MIDC Industrial Area',
  'Taloja MIDC, Navi Mumbai',
  'Ranjangaon MIDC',
];

export const GlobalSearchPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialQuery = searchParams.get('q') || searchParams.get('keyword') || '';
  const initialCategory = (searchParams.get('cat') as 'all' | 'jobs' | 'companies') || 'all';

  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [activeCategory, setActiveCategory] = useState<'all' | 'jobs' | 'companies'>(initialCategory);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [allJobs, setAllJobs] = useState<Job[]>([]);
  const [allCompanies, setAllCompanies] = useState<any[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Focus input on mount
  useEffect(() => {
    loadRecentSearches();
    fetchAllData();
    const timer = setTimeout(() => {
      searchInputRef.current?.focus();
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  const loadRecentSearches = () => {
    try {
      const stored = localStorage.getItem(RECENT_SEARCHES_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          setRecentSearches(parsed.slice(0, 10));
        }
      }
    } catch (e) {
      console.warn('Failed to load recent searches:', e);
    }
  };

  const saveSearchToHistory = (keyword: string) => {
    const trimmed = keyword.trim();
    if (!trimmed) return;
    try {
      const updated = [trimmed, ...recentSearches.filter((item) => item.toLowerCase() !== trimmed.toLowerCase())].slice(0, 10);
      setRecentSearches(updated);
      localStorage.setItem(RECENT_SEARCHES_STORAGE_KEY, JSON.stringify(updated));
    } catch (e) {
      console.warn('Failed to save search history:', e);
    }
  };

  const removeSingleRecentSearch = (e: React.MouseEvent, keyword: string) => {
    e.stopPropagation();
    try {
      const updated = recentSearches.filter((item) => item !== keyword);
      setRecentSearches(updated);
      localStorage.setItem(RECENT_SEARCHES_STORAGE_KEY, JSON.stringify(updated));
    } catch (e) {
      console.warn('Failed to remove recent search:', e);
    }
  };

  const clearAllRecentSearches = (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      setRecentSearches([]);
      localStorage.removeItem(RECENT_SEARCHES_STORAGE_KEY);
    } catch (e) {
      console.warn('Failed to clear search history:', e);
    }
  };

  // High Concurrency Data Fetching with client cache for instant response (1000+ concurrent users)
  const fetchAllData = async () => {
    try {
      // 1. Instant Cache Hydration (<1ms)
      try {
        const cachedComps = localStorage.getItem(COMPANIES_CACHE_KEY);
        if (cachedComps) {
          const parsed = JSON.parse(cachedComps);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setAllCompanies(parsed);
          }
        }
        const cachedJobs = localStorage.getItem(JOBS_CACHE_KEY);
        if (cachedJobs) {
          const parsedJobs = JSON.parse(cachedJobs);
          if (Array.isArray(parsedJobs) && parsedJobs.length > 0) {
            setAllJobs(parsedJobs);
          }
        }
      } catch (_) {}

      // 2. Fetch fresh dataset
      setIsLoadingData(true);
      const [jobsRes, compsRes] = await Promise.all([
        apiFetch('/api/v1/jobs').catch(() => null),
        apiFetch('/api/v1/companies').catch(() => null),
      ]);

      if (jobsRes && jobsRes.ok) {
        const jobJson = await jobsRes.json().catch(() => null);
        const jobList = Array.isArray(jobJson) ? jobJson : (jobJson?.data || []);
        if (Array.isArray(jobList) && jobList.length > 0) {
          setAllJobs(jobList);
          try {
            localStorage.setItem(JOBS_CACHE_KEY, JSON.stringify(jobList.slice(0, 100)));
          } catch (_) {}
        }
      }

      if (compsRes && compsRes.ok) {
        const compJson = await compsRes.json().catch(() => null);
        const compList = Array.isArray(compJson) ? compJson : (compJson?.data || compJson?.companies || []);
        if (Array.isArray(compList) && compList.length > 0) {
          setAllCompanies(compList);
          try {
            localStorage.setItem(COMPANIES_CACHE_KEY, JSON.stringify(compList.slice(0, 50)));
          } catch (_) {}
        }
      }
    } catch (e) {
      console.warn('Failed to fetch autocomplete data:', e);
    } finally {
      setIsLoadingData(false);
    }
  };

  const handleExecuteSearch = (term: string) => {
    const trimmed = term.trim();
    if (!trimmed) return;
    saveSearchToHistory(trimmed);
    setSearchQuery(trimmed);

    // If searching specifically in companies or term matches a company name exactly
    const exactCompany = allCompanies.find(
      (c) => (c.name || c.company_name || c.company || '').toLowerCase().trim() === trimmed.toLowerCase()
    );

    if (activeCategory === 'companies' || exactCompany) {
      if (exactCompany) {
        handleCompanyClick(exactCompany);
        return;
      }
      navigate(`/companies?search=${encodeURIComponent(trimmed)}`);
      return;
    }

    // For jobs, roles, trades, or general queries: navigate to Find Jobs
    navigate(`/jobs?keyword=${encodeURIComponent(trimmed)}`);
  };

  const handleLocationSearch = (location: string) => {
    saveSearchToHistory(location);
    navigate(`/jobs?location=${encodeURIComponent(location)}`);
  };

  const handleJobClick = (job: Job) => {
    saveSearchToHistory(job.title);
    navigate(`/job/${job.id}`);
  };

  const handleCompanyClick = (company: any) => {
    const compName = company.name || company.company_name || company.company || 'Company';
    saveSearchToHistory(compName);
    const companyId = company.id || company.user_id || company.companyId || compName;
    navigate(`/company/${companyId}`);
  };

  // Top Industrial Employers from real registered companies (Deduplicated)
  const platformCompanies = useMemo(() => {
    const seen = new Set<string>();
    const result: any[] = [];

    const addCompany = (c: any) => {
      if (!c) return;
      const cId = (c.id || c.user_id || '').toString().trim();
      const cName = (c.name || c.company_name || c.company || '').toString().trim();
      if (!cName && !cId) return;
      const idKey = cId ? cId.toLowerCase() : '';
      const nameKey = cName ? cName.toLowerCase() : '';
      if ((idKey && seen.has(idKey)) || (nameKey && seen.has(nameKey))) return;
      if (idKey) seen.add(idKey);
      if (nameKey) seen.add(nameKey);

      result.push({
        ...c,
        id: cId || cName,
        name: cName || 'Industrial Company',
        industry: c.industry || 'Industrial Manufacturing',
        location: c.midc_zone || c.location || c.city || 'Chhatrapati Sambhajinagar',
        logo: c.logo || c.logo_url || c.logoUrl || c.profilePictureUrl || c.profile_picture_url || null,
      });
    };

    if (Array.isArray(allCompanies) && allCompanies.length > 0) {
      allCompanies.forEach(addCompany);
    }

    if (result.length < 8 && Array.isArray(allJobs)) {
      allJobs.forEach((j) => {
        const cName = (j.company || (j as any).company_name || '').toString().trim();
        if (cName) {
          addCompany({
            id: j.employer_id || (j as any).company_id || cName,
            name: cName,
            industry: j.industry || 'Industrial Manufacturing',
            location: j.location || 'Chhatrapati Sambhajinagar',
            logo: (j as any).companyLogo || (j as any).company_logo || (j as any).logoUrl || null,
          });
        }
      });
    }

    return result.slice(0, 8);
  }, [allCompanies, allJobs]);

  // Autocomplete matching live query across Jobs, Companies, Trades, Locations (Zero-Latency In-Memory)
  const autocompleteSuggestions = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) {
      return { jobs: [], companies: [], trades: [], locations: [] };
    }

    // 1. Matching Live Jobs
    const seenJobIds = new Set<string>();
    const matchedJobs: Job[] = [];
    if (activeCategory !== 'companies') {
      for (const j of allJobs) {
        if (!j || !j.id || seenJobIds.has(j.id)) continue;
        const titleMatch = (j.title || '').toLowerCase().includes(q);
        const compMatch = (j.company || '').toLowerCase().includes(q);
        const indMatch = (j.industry || '').toLowerCase().includes(q);
        const tradeMatch = (j.trade || '').toLowerCase().includes(q);
        const skillsMatch = Array.isArray(j.skills) && j.skills.some((s) => s.toLowerCase().includes(q));
        if (titleMatch || compMatch || indMatch || tradeMatch || skillsMatch) {
          seenJobIds.add(j.id);
          matchedJobs.push(j);
          if (matchedJobs.length >= 8) break;
        }
      }
    }

    // 2. Matching Companies
    const seenCompKeys = new Set<string>();
    const matchedCompanies: any[] = [];
    if (activeCategory !== 'jobs') {
      for (const c of allCompanies) {
        if (!c) continue;
        const cKey = ((c.id || '') + (c.name || c.company_name || '')).toLowerCase().trim();
        if (!cKey || seenCompKeys.has(cKey)) continue;
        const nameMatch = (c.name || c.company_name || c.company || '').toLowerCase().includes(q);
        const indMatch = (c.industry || '').toLowerCase().includes(q);
        const locMatch = (c.city || c.location || c.midc_zone || '').toLowerCase().includes(q);
        const aboutMatch = (c.about || c.description || '').toLowerCase().includes(q);
        if (nameMatch || indMatch || locMatch || aboutMatch) {
          seenCompKeys.add(cKey);
          matchedCompanies.push(c);
          if (matchedCompanies.length >= 8) break;
        }
      }
    }

    // 3. Matching Trades
    const matchedTrades = activeCategory === 'companies'
      ? []
      : TRENDING_ROLES.filter((t) => t.toLowerCase().includes(q)).slice(0, 4);

    // 4. Matching Locations
    const matchedLocations = TRENDING_LOCATIONS.filter((l) => l.toLowerCase().includes(q)).slice(0, 4);

    return {
      jobs: matchedJobs,
      companies: matchedCompanies,
      trades: matchedTrades,
      locations: matchedLocations,
    };
  }, [searchQuery, allJobs, allCompanies, activeCategory]);

  const hasLiveQuery = searchQuery.trim().length > 0;
  const hasAnySuggestions =
    autocompleteSuggestions.companies.length > 0 ||
    autocompleteSuggestions.jobs.length > 0 ||
    autocompleteSuggestions.trades.length > 0 ||
    autocompleteSuggestions.locations.length > 0;

  const handleBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate('/');
    }
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#FFFFFF', display: 'flex', flexDirection: 'column' }}>
      {/* Top Header matching Mobile App */}
      <div style={{
        position: 'sticky',
        top: 0,
        zIndex: 1000,
        backgroundColor: '#FFFFFF',
        borderBottom: '1px solid #F1F5F9',
        padding: '10px 14px',
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        boxSizing: 'border-box'
      }}>
        <button
          type="button"
          onClick={handleBack}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: '6px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#0F172A',
            borderRadius: '50%',
            flexShrink: 0
          }}
          title="Back"
        >
          <ArrowLeft size={22} color="#0F172A" strokeWidth={2} />
        </button>

        {/* Pill Search Input Wrapper */}
        <div style={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          backgroundColor: '#FFFFFF',
          borderRadius: '24px',
          padding: '0 12px',
          height: '40px',
          border: '1.2px solid #CBD5E1',
          boxSizing: 'border-box'
        }}>
          <Search size={16} color="#64748B" style={{ marginRight: '8px', flexShrink: 0 }} />
          <input
            ref={searchInputRef}
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleExecuteSearch(searchQuery);
              }
            }}
            placeholder={
              activeCategory === 'companies'
                ? 'Search companies, factories, MIDC zones...'
                : activeCategory === 'jobs'
                ? 'Search jobs, trades, roles, skills...'
                : 'Search jobs, companies, skills, locations...'
            }
            style={{
              flex: 1,
              fontSize: '13.5px',
              color: '#0F172A',
              fontWeight: 500,
              border: 'none',
              outline: 'none',
              background: 'transparent',
              padding: 0,
              margin: 0,
              width: '100%'
            }}
          />
          {searchQuery.length > 0 && (
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                searchInputRef.current?.focus();
              }}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: '4px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#64748B'
              }}
            >
              <X size={15} color="#64748B" />
            </button>
          )}
        </div>

        {searchQuery.trim().length > 0 && (
          <button
            type="button"
            onClick={() => handleExecuteSearch(searchQuery)}
            style={{
              background: 'none',
              border: 'none',
              color: '#1D4ED8',
              fontSize: '13.5px',
              fontWeight: 700,
              cursor: 'pointer',
              padding: '6px 4px',
              flexShrink: 0
            }}
          >
            Search
          </button>
        )}
      </div>

      {/* Scope Category Filter Tabs: All, Jobs, Companies */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        padding: '10px 16px',
        borderBottom: '1px solid #F1F5F9',
        backgroundColor: '#FFFFFF'
      }}>
        {(['all', 'jobs', 'companies'] as const).map((cat) => {
          const isActive = activeCategory === cat;
          const label = cat === 'all' ? 'All' : cat === 'jobs' ? 'Jobs' : 'Companies';
          return (
            <button
              key={cat}
              type="button"
              onClick={() => setActiveCategory(cat)}
              style={{
                padding: '5px 14px',
                borderRadius: '16px',
                fontSize: '12.5px',
                fontWeight: isActive ? 700 : 600,
                backgroundColor: isActive ? '#1D4ED8' : '#F1F5F9',
                color: isActive ? '#FFFFFF' : '#475569',
                border: isActive ? '1px solid #1D4ED8' : '1px solid #E2E8F0',
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              {label}
            </button>
          );
        })}
      </div>

      {/* Content Scroll View */}
      <div style={{ flex: 1, overflowY: 'auto', paddingBottom: '60px' }}>
        {hasLiveQuery ? (
          /* VIEW A: LIVE AUTOCOMPLETE PREDICTIVE RESULTS (WHEN TYPING) */
          <div style={{ maxWidth: '800px', margin: '0 auto', width: '100%' }}>
            {/* Primary Search Row */}
            <div
              onClick={() => handleExecuteSearch(searchQuery)}
              style={{
                display: 'flex',
                alignItems: 'center',
                padding: '12px 16px',
                borderBottom: '1px solid #F1F5F9',
                cursor: 'pointer',
                backgroundColor: '#FFFFFF',
                transition: 'background-color 0.15s ease'
              }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#F8FAFC')}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#FFFFFF')}
            >
              <Search size={17} color="#1D4ED8" style={{ marginRight: '12px', flexShrink: 0 }} />
              <div style={{ flex: 1, minWidth: 0, fontSize: '13.5px', color: '#0F172A' }}>
                Search for "<strong style={{ color: '#1D4ED8' }}>{searchQuery.trim()}</strong>"
              </div>
              <ArrowUpRight size={15} color="#94A3B8" style={{ flexShrink: 0 }} />
            </div>

            {/* Skeletons when fetching initial network data if cache wasn't ready */}
            {isLoadingData && allJobs.length === 0 && (
              <div style={{ padding: '24px 16px', textAlign: 'center' }}>
                <div style={{ fontSize: '12.5px', color: '#64748B', fontWeight: 600 }}>Searching matches...</div>
              </div>
            )}

            {!hasAnySuggestions && !isLoadingData && (
              <div style={{ padding: '40px 16px', textAlign: 'center' }}>
                <div style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '50%',
                  backgroundColor: '#F1F5F9',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 12px auto'
                }}>
                  <SearchX size={24} color="#64748B" strokeWidth={2} />
                </div>
                <h3 style={{ fontSize: '15px', fontWeight: 800, color: '#0F172A', margin: '0 0 4px 0' }}>
                  No Results Found
                </h3>
                <p style={{ fontSize: '12.5px', color: '#64748B', margin: '0 0 16px 0' }}>
                  No direct matches found for "{searchQuery.trim()}".
                </p>

                {/* Suggestions & Tips */}
                <div style={{
                  backgroundColor: '#F8FAFC',
                  border: '1px solid #E2E8F0',
                  borderRadius: '8px',
                  padding: '12px 14px',
                  textAlign: 'left',
                  margin: '0 auto 20px auto',
                  maxWidth: '420px'
                }}>
                  <div style={{ fontSize: '11px', fontWeight: 800, color: '#475569', letterSpacing: '0.4px', marginBottom: '6px' }}>
                    SUGGESTIONS & TIPS
                  </div>
                  <div style={{ fontSize: '12px', color: '#334155', lineHeight: '1.5' }}>
                    • Check for spelling errors or alternative abbreviations<br />
                    • Search by general trade (e.g., CNC, VMC, Fitter, Welder)<br />
                    • Search by MIDC industrial area (e.g., Waluj, Chakan, Bhosari)
                  </div>
                </div>

                {/* Popular Trades Quick Chips */}
                <div>
                  <div style={{ fontSize: '11px', fontWeight: 800, color: '#64748B', letterSpacing: '0.4px', marginBottom: '8px' }}>
                    POPULAR INDUSTRIAL ROLES
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', justifyContent: 'center' }}>
                    {TRENDING_ROLES.slice(0, 5).map((role) => (
                      <button
                        key={role}
                        type="button"
                        onClick={() => handleExecuteSearch(role)}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '5px',
                          padding: '6px 12px',
                          borderRadius: '16px',
                          border: '1px solid #CBD5E1',
                          backgroundColor: '#FFFFFF',
                          fontSize: '12px',
                          fontWeight: 600,
                          color: '#0F172A',
                          cursor: 'pointer'
                        }}
                      >
                        <TrendingUp size={12} color="#1D4ED8" />
                        <span>{role}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Standalone Matching Companies & Factories */}
            {autocompleteSuggestions.companies.length > 0 && (
              <div style={{ marginTop: '12px', borderBottom: '6px solid #F8FAFC', paddingBottom: '4px' }}>
                <div style={{ padding: '8px 16px', fontSize: '11px', fontWeight: 800, color: '#64748B', letterSpacing: '0.4px' }}>
                  COMPANIES & FACTORIES
                </div>
                {autocompleteSuggestions.companies.map((comp, idx) => {
                  const compName = comp.name || comp.company_name || comp.company || 'Industrial Company';
                  const compLoc = comp.midc_zone || comp.location || comp.city || 'Industrial MIDC';
                  const compInd = comp.industry || 'Manufacturing';
                  const compLogo = comp.logo || comp.logo_url || comp.logoUrl || comp.profilePictureUrl || comp.profile_picture_url;
                  return (
                    <div
                      key={`match-comp-${comp.id || compName}-${idx}`}
                      onClick={() => handleCompanyClick(comp)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        padding: '10px 16px',
                        borderBottom: '1px solid #F1F5F9',
                        cursor: 'pointer',
                        backgroundColor: '#FFFFFF'
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#F8FAFC')}
                      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#FFFFFF')}
                    >
                      <div style={{ marginRight: '12px', flexShrink: 0 }}>
                        <CompanyDefaultLogo logoUrl={compLogo} companyName={compName} size={36} borderRadius="8px" />
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: '13.5px', fontWeight: 700, color: '#0F172A', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {compName}
                        </div>
                        <div style={{ fontSize: '11.5px', color: '#64748B', marginTop: '2px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {compInd} • {compLoc}
                        </div>
                      </div>
                      <ChevronRight size={15} color="#CBD5E1" style={{ flexShrink: 0 }} />
                    </div>
                  );
                })}
              </div>
            )}

            {/* Matching Live Jobs */}
            {autocompleteSuggestions.jobs.length > 0 && (
              <div style={{ marginTop: '12px', borderBottom: '6px solid #F8FAFC', paddingBottom: '4px' }}>
                <div style={{ padding: '8px 16px', fontSize: '11px', fontWeight: 800, color: '#64748B', letterSpacing: '0.4px' }}>
                  MATCHING JOBS
                </div>
                {autocompleteSuggestions.jobs.map((job, idx) => {
                  const jobLogo = job.companyLogo || (job as any)?.company_logo || (job as any)?.logo;
                  return (
                    <div
                      key={`match-job-${job.id}-${idx}`}
                      onClick={() => handleJobClick(job)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        padding: '10px 16px',
                        borderBottom: '1px solid #F1F5F9',
                        cursor: 'pointer',
                        backgroundColor: '#FFFFFF'
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#F8FAFC')}
                      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#FFFFFF')}
                    >
                      <div style={{ marginRight: '12px', flexShrink: 0 }}>
                        <CompanyDefaultLogo logoUrl={jobLogo} companyName={job.company} size={36} borderRadius="8px" />
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: '13.5px', fontWeight: 700, color: '#0F172A', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {job.title}
                        </div>
                        <div style={{ fontSize: '11.5px', color: '#64748B', marginTop: '2px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {job.company} • {job.location}
                        </div>
                      </div>
                      <ChevronRight size={15} color="#CBD5E1" style={{ flexShrink: 0 }} />
                    </div>
                  );
                })}

                <button
                  type="button"
                  onClick={() => handleExecuteSearch(searchQuery)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    width: '100%',
                    padding: '11px 16px',
                    background: 'none',
                    border: 'none',
                    color: '#1D4ED8',
                    fontSize: '12.5px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    borderTop: '1px solid #F1F5F9'
                  }}
                >
                  <Briefcase size={14} color="#1D4ED8" />
                  <span>Search all jobs matching "{searchQuery.trim()}" in Find Jobs</span>
                  <ArrowUpRight size={14} color="#1D4ED8" />
                </button>
              </div>
            )}

            {/* Matching Trades */}
            {autocompleteSuggestions.trades.length > 0 && (
              <div style={{ marginTop: '12px', borderBottom: '6px solid #F8FAFC', paddingBottom: '4px' }}>
                <div style={{ padding: '8px 16px', fontSize: '11px', fontWeight: 800, color: '#64748B', letterSpacing: '0.4px' }}>
                  POPULAR ROLES & TRADES
                </div>
                {autocompleteSuggestions.trades.map((trade, idx) => (
                  <div
                    key={`match-trade-${trade}-${idx}`}
                    onClick={() => handleExecuteSearch(trade)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      padding: '10px 16px',
                      borderBottom: '1px solid #F1F5F9',
                      cursor: 'pointer',
                      backgroundColor: '#FFFFFF'
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#F8FAFC')}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#FFFFFF')}
                  >
                    <TrendingUp size={16} color="#64748B" style={{ marginRight: '12px', flexShrink: 0 }} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: '13.5px', fontWeight: 600, color: '#0F172A' }}>{trade}</div>
                      <div style={{ fontSize: '11px', color: '#64748B' }}>Job Role / Trade</div>
                    </div>
                    <ArrowUpRight size={15} color="#94A3B8" style={{ flexShrink: 0 }} />
                  </div>
                ))}
              </div>
            )}

            {/* Matching Locations */}
            {autocompleteSuggestions.locations.length > 0 && (
              <div style={{ marginTop: '12px', borderBottom: '6px solid #F8FAFC', paddingBottom: '4px' }}>
                <div style={{ padding: '8px 16px', fontSize: '11px', fontWeight: 800, color: '#64748B', letterSpacing: '0.4px' }}>
                  LOCATIONS & MIDC ZONES
                </div>
                {autocompleteSuggestions.locations.map((loc, idx) => (
                  <div
                    key={`match-loc-${loc}-${idx}`}
                    onClick={() => handleLocationSearch(loc)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      padding: '10px 16px',
                      borderBottom: '1px solid #F1F5F9',
                      cursor: 'pointer',
                      backgroundColor: '#FFFFFF'
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#F8FAFC')}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#FFFFFF')}
                  >
                    <MapPin size={17} color="#64748B" style={{ marginRight: '12px', flexShrink: 0 }} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: '13.5px', fontWeight: 600, color: '#0F172A' }}>{loc}</div>
                      <div style={{ fontSize: '11px', color: '#64748B' }}>Industrial Location</div>
                    </div>
                    <ArrowUpRight size={15} color="#94A3B8" style={{ flexShrink: 0 }} />
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          /* VIEW B: RECENT SEARCHES, TOP EMPLOYERS & TRENDING (WHEN INPUT IS EMPTY) */
          <div style={{ maxWidth: '800px', margin: '0 auto', width: '100%' }}>
            {/* 1. RECENT SEARCHES */}
            {recentSearches.length > 0 && (
              <div style={{ marginTop: '8px', borderBottom: '6px solid #F8FAFC', paddingBottom: '4px' }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '8px 16px'
                }}>
                  <span style={{ fontSize: '11px', fontWeight: 800, color: '#64748B', letterSpacing: '0.4px' }}>
                    RECENT SEARCHES
                  </span>
                  <button
                    type="button"
                    onClick={clearAllRecentSearches}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#1D4ED8',
                      fontSize: '11.5px',
                      fontWeight: 700,
                      cursor: 'pointer',
                      padding: 0
                    }}
                  >
                    Clear
                  </button>
                </div>

                {recentSearches.map((term, index) => (
                  <div
                    key={`recent-${term}-${index}`}
                    onClick={() => handleExecuteSearch(term)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '10px 16px',
                      borderBottom: '1px solid #F1F5F9',
                      cursor: 'pointer',
                      backgroundColor: '#FFFFFF'
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#F8FAFC')}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#FFFFFF')}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1, minWidth: 0 }}>
                      <Clock size={16} color="#64748B" style={{ flexShrink: 0 }} />
                      <span style={{ fontSize: '13.5px', fontWeight: 600, color: '#0F172A', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {term}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={(e) => removeSingleRecentSearch(e, term)}
                      style={{
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        padding: '4px',
                        color: '#94A3B8',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                      title="Remove"
                    >
                      <X size={15} color="#94A3B8" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* 2. TOP INDUSTRIAL EMPLOYERS */}
            {platformCompanies.length > 0 && (
              <div style={{ marginTop: '12px', borderBottom: '6px solid #F8FAFC', paddingBottom: '4px' }}>
                <div style={{ padding: '8px 16px', fontSize: '11px', fontWeight: 800, color: '#64748B', letterSpacing: '0.4px' }}>
                  TOP INDUSTRIAL EMPLOYERS
                </div>
                {platformCompanies.map((comp, idx) => (
                  <div
                    key={`platform-comp-${comp.id || comp.name}-${idx}`}
                    onClick={() => handleCompanyClick(comp)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      padding: '10px 16px',
                      borderBottom: '1px solid #F1F5F9',
                      cursor: 'pointer',
                      backgroundColor: '#FFFFFF'
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#F8FAFC')}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#FFFFFF')}
                  >
                    <div style={{ marginRight: '12px', flexShrink: 0 }}>
                      <CompanyDefaultLogo logoUrl={comp.logo} companyName={comp.name} size={36} borderRadius="8px" />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: '13.5px', fontWeight: 700, color: '#0F172A', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {comp.name}
                      </div>
                      <div style={{ fontSize: '11.5px', color: '#64748B', marginTop: '2px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {comp.industry} • {comp.location}
                      </div>
                    </div>
                    <ChevronRight size={15} color="#CBD5E1" style={{ flexShrink: 0 }} />
                  </div>
                ))}
              </div>
            )}

            {/* 3. TRENDING INDUSTRIAL ROLES */}
            <div style={{ marginTop: '12px', borderBottom: '6px solid #F8FAFC', paddingBottom: '4px' }}>
              <div style={{ padding: '8px 16px', fontSize: '11px', fontWeight: 800, color: '#64748B', letterSpacing: '0.4px' }}>
                TRY SEARCHING FOR
              </div>
              {TRENDING_ROLES.map((role, idx) => (
                <div
                  key={`trending-${role}-${idx}`}
                  onClick={() => handleExecuteSearch(role)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    padding: '10px 16px',
                    borderBottom: '1px solid #F1F5F9',
                    cursor: 'pointer',
                    backgroundColor: '#FFFFFF'
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#F8FAFC')}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#FFFFFF')}
                >
                  <TrendingUp size={16} color="#64748B" style={{ marginRight: '12px', flexShrink: 0 }} />
                  <div style={{ flex: 1, minWidth: 0, fontSize: '13.5px', fontWeight: 600, color: '#0F172A' }}>
                    {role}
                  </div>
                  <ArrowUpRight size={15} color="#94A3B8" style={{ flexShrink: 0 }} />
                </div>
              ))}
            </div>

            {/* 4. POPULAR INDUSTRIAL HUBS */}
            <div style={{ marginTop: '12px', borderBottom: '6px solid #F8FAFC', paddingBottom: '4px' }}>
              <div style={{ padding: '8px 16px', fontSize: '11px', fontWeight: 800, color: '#64748B', letterSpacing: '0.4px' }}>
                POPULAR INDUSTRIAL HUBS
              </div>
              {TRENDING_LOCATIONS.map((loc, idx) => (
                <div
                  key={`hub-${loc}-${idx}`}
                  onClick={() => handleLocationSearch(loc)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    padding: '10px 16px',
                    borderBottom: '1px solid #F1F5F9',
                    cursor: 'pointer',
                    backgroundColor: '#FFFFFF'
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#F8FAFC')}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#FFFFFF')}
                >
                  <MapPin size={16} color="#64748B" style={{ marginRight: '12px', flexShrink: 0 }} />
                  <div style={{ flex: 1, minWidth: 0, fontSize: '13.5px', fontWeight: 600, color: '#0F172A' }}>
                    {loc}
                  </div>
                  <ArrowUpRight size={15} color="#94A3B8" style={{ flexShrink: 0 }} />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default GlobalSearchPage;
