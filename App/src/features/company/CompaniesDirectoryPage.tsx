import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { Link } from 'react-router-dom';
import { apiFetch, safeParseJson } from '../../utils/api';
import { CompanyDefaultLogo } from '../../components/company/CompanyDefaultLogo';
import { MobileHeader } from '../../components/common/MobileHeader';
import {
  Building2,
  Search,
  MapPin,
  Briefcase,
  ChevronRight,
  Users,
  Calendar,
  SlidersHorizontal,
  X,
  XCircle,
  RotateCcw,
  Check,
  Sparkles,
} from 'lucide-react';

interface CompanyItem {
  id: string;
  name: string;
  logo?: string;
  industry?: string;
  company_type?: string;
  companyType?: string;
  description?: string;
  website?: string;
  address?: string;
  city?: string;
  midc_zone?: string;
  midcZone?: string;
  company_size?: string;
  companySize?: string;
  founded_year?: number;
  founded?: number;
  open_jobs_count?: number;
  jobs_count?: number;
  openings_count?: number;
  jobsCount?: number;
  verified?: boolean;
}

const COMPANIES_CACHE_KEY = 'jobmarket_cached_companies';

const getInitialCachedCompanies = (): CompanyItem[] => {
  try {
    const raw = localStorage.getItem(COMPANIES_CACHE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    // Ignore error
  }
  return [];
};

const MIDC_ZONES = [
  'All Locations',
  'Waluj MIDC (Chhatrapati Sambhajinagar)',
  'Shendra MIDC / AURIC City (Chhatrapati Sambhajinagar)',
  'Chikalthana MIDC (Chhatrapati Sambhajinagar)',
  'Chitegaon MIDC (Chhatrapati Sambhajinagar)',
  'Paithan MIDC (Chhatrapati Sambhajinagar)',
  'Bidkin DMIC / AURIC City (Chhatrapati Sambhajinagar)',
  'Railway Station Industrial Area (Chhatrapati Sambhajinagar)',
  'Jalna Road Industrial Belt (Chhatrapati Sambhajinagar)',
  'Chhatrapati Sambhajinagar (All Areas)',
  'Chakan MIDC (Pune)',
  'Bhosari MIDC (Pune)',
  'Talegaon MIDC (Pune)',
  'Ranjangaon MIDC (Pune)',
  'Taloja MIDC (Navi Mumbai)',
  'Thane Belapur MIDC',
];

const INDUSTRIES = [
  'All Industries',
  'Automotive Manufacturing',
  'Auto Components & Precision Forging',
  'Pharmaceuticals & Biotech',
  'Electrical & Industrial Automation',
  'Tyre & Rubber Manufacturing',
  'Technical Textiles & Fibres',
  'Heavy Engineering & Fabrication',
  'Food Processing & FMCG',
  'IT & Electronics Hardware',
];

const COMPANY_TYPES = [
  'All Types',
  'Public Limited',
  'Private Limited',
  'Multinational Corporation (MNC)',
  'Joint Venture / Partnership',
];

const COMPANY_SIZES = [
  'All Sizes',
  '10,000+ employees',
  '5,000-10,000 employees',
  '1,000-5,000 employees',
  '500-1,000 employees',
  '100-500 employees',
];

type CompanyFilterCategoryKey = 'LOCATION' | 'INDUSTRY' | 'TYPE' | 'SIZE' | 'HIRING';

export const CompaniesDirectoryPage: React.FC = () => {
  const [companies, setCompanies] = useState<CompanyItem[]>(getInitialCachedCompanies);
  const [loading, setLoading] = useState(() => getInitialCachedCompanies().length === 0);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterDrawerOpen, setFilterDrawerOpen] = useState(false);
  const [activeFilterTab, setActiveFilterTab] = useState<CompanyFilterCategoryKey>('LOCATION');

  // Responsive detection: Mobile vs Desktop Drawer
  const [isMobile, setIsMobile] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return window.innerWidth < 768;
    }
    return false;
  });

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Active Applied Filters State
  const [filters, setFilters] = useState({
    midcZone: 'All Locations',
    industry: 'All Industries',
    companyType: 'All Types',
    companySize: 'All Sizes',
    onlyHiring: false,
  });

  // Draft filters for Modal
  const [draftZone, setDraftZone] = useState<string | null>(null);
  const [draftIndustry, setDraftIndustry] = useState<string | null>(null);
  const [draftType, setDraftType] = useState<string | null>(null);
  const [draftSize, setDraftSize] = useState<string | null>(null);
  const [draftOnlyHiring, setDraftOnlyHiring] = useState<boolean>(false);

  const handleOpenFilterModal = (tabKey: CompanyFilterCategoryKey = 'LOCATION') => {
    setActiveFilterTab(tabKey);
    setDraftZone(filters.midcZone === 'All Locations' ? null : filters.midcZone);
    setDraftIndustry(filters.industry === 'All Industries' ? null : filters.industry);
    setDraftType(filters.companyType === 'All Types' ? null : filters.companyType);
    setDraftSize(filters.companySize === 'All Sizes' ? null : filters.companySize);
    setDraftOnlyHiring(filters.onlyHiring);
    setFilterDrawerOpen(true);
  };

  useEffect(() => {
    if (filterDrawerOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [filterDrawerOpen]);

  const fetchCompanies = useCallback(async () => {
    try {
      const res = await apiFetch('/api/v1/companies');
      const { ok, data: json } = await safeParseJson(res);
      const list = Array.isArray(json) ? json : (json?.data || json?.companies || []);
      if (ok && Array.isArray(list) && list.length > 0) {
        setCompanies(list);
        try {
          localStorage.setItem(COMPANIES_CACHE_KEY, JSON.stringify(list));
        } catch (e) {}
      }
    } catch (e) {
      console.warn('Companies fetch error:', e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCompanies();
  }, [fetchCompanies]);

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filters.midcZone !== 'All Locations') count++;
    if (filters.industry !== 'All Industries') count++;
    if (filters.companyType !== 'All Types') count++;
    if (filters.companySize !== 'All Sizes') count++;
    if (filters.onlyHiring) count++;
    return count;
  }, [filters]);

  const resetAllFilters = () => {
    setSearchQuery('');
    setFilters({
      midcZone: 'All Locations',
      industry: 'All Industries',
      companyType: 'All Types',
      companySize: 'All Sizes',
      onlyHiring: false,
    });
    setDraftZone(null);
    setDraftIndustry(null);
    setDraftType(null);
    setDraftSize(null);
    setDraftOnlyHiring(false);
  };

  const isCompanyMatchingFilters = useCallback((c: CompanyItem, targetFilters: typeof filters, search: string) => {
    // 1. Zone filter
    if (targetFilters.midcZone && targetFilters.midcZone !== 'All Locations' && targetFilters.midcZone !== 'All MIDC Zones & Cities') {
      const zoneStr = (c.midc_zone || c.midcZone || c.address || c.city || c.location || '').toLowerCase();
      let keyword = targetFilters.midcZone.toLowerCase();
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
      if (!isMatch) {
        return false;
      }
    }

    // 2. Industry filter
    if (targetFilters.industry && targetFilters.industry !== 'All Industries') {
      const ind = (c.industry || '').toLowerCase();
      const target = targetFilters.industry.toLowerCase();
      if (!ind.includes(target) && !target.includes(ind)) {
        return false;
      }
    }

    // 3. Company Type filter
    if (targetFilters.companyType && targetFilters.companyType !== 'All Types') {
      const cType = (c.company_type || c.companyType || '').toLowerCase();
      const target = targetFilters.companyType.toLowerCase();
      if (!cType.includes(target) && !target.includes(cType)) {
        return false;
      }
    }

    // 4. Company Size filter
    if (targetFilters.companySize && targetFilters.companySize !== 'All Sizes') {
      const cSize = (c.company_size || c.companySize || '').toLowerCase();
      const target = targetFilters.companySize.toLowerCase();
      if (!cSize.includes(target) && !target.includes(cSize)) {
        return false;
      }
    }

    // 5. Only Hiring filter
    if (targetFilters.onlyHiring) {
      const jobsCount = c.open_jobs_count ?? c.jobs_count ?? c.openings_count ?? c.jobsCount ?? 0;
      if (jobsCount <= 0) {
        return false;
      }
    }

    // 6. Search query
    if (search.trim()) {
      const q = search.toLowerCase().trim();
      const matchName = (c.name || '').toLowerCase().includes(q);
      const matchIndustry = (c.industry || '').toLowerCase().includes(q);
      const matchCity = (c.city || '').toLowerCase().includes(q);
      const matchZone = (c.midc_zone || c.midcZone || '').toLowerCase();
      return matchName || matchIndustry || matchCity || matchZone;
    }

    return true;
  }, []);

  const filteredCompanies = useMemo(() => {
    return companies.filter((c) => isCompanyMatchingFilters(c, filters, searchQuery));
  }, [companies, filters, searchQuery, isCompanyMatchingFilters]);

  // Real-time calculation of matching count inside the draft filter
  const draftMatchingCount = useMemo(() => {
    const draftTarget = {
      midcZone: draftZone || 'All Locations',
      industry: draftIndustry || 'All Industries',
      companyType: draftType || 'All Types',
      companySize: draftSize || 'All Sizes',
      onlyHiring: draftOnlyHiring,
    };
    return companies.filter((c) => isCompanyMatchingFilters(c, draftTarget, searchQuery)).length;
  }, [companies, draftZone, draftIndustry, draftType, draftSize, draftOnlyHiring, searchQuery, isCompanyMatchingFilters]);

  const handleApplyDraftFilters = () => {
    setFilters({
      midcZone: draftZone || 'All Locations',
      industry: draftIndustry || 'All Industries',
      companyType: draftType || 'All Types',
      companySize: draftSize || 'All Sizes',
      onlyHiring: draftOnlyHiring,
    });
    setFilterDrawerOpen(false);
  };

  const handleResetDraftFilters = () => {
    setDraftZone(null);
    setDraftIndustry(null);
    setDraftType(null);
    setDraftSize(null);
    setDraftOnlyHiring(false);
  };

  return (
    <div style={{ width: '100%', minHeight: '100vh', background: '#F8FAFC', boxSizing: 'border-box' }}>
      <style>{`
        .companies-main-container {
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
          .companies-main-container {
            max-width: 580px;
            padding: 10px 12px 100px 12px !important;
            gap: 12px !important;
          }
        }

        .filter-category-pill {
          padding: 7px 12px;
          border-radius: 6px;
          font-size: 12px;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          gap: 6px;
          transition: all 0.15s ease;
          border: 1px solid #CBD5E1;
          background-color: #F8FAFC;
          color: #334155;
          user-select: none;
        }
        .filter-category-pill.selected {
          border-color: #1B4FDF;
          background-color: #EFF6FF;
          color: #1B4FDF;
          font-weight: 700;
        }
      `}</style>

      {/* Main Content Area */}
      <div className="companies-main-container">
        {/* Search Bar & Dedicated Filter Button */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          width: '100%',
          boxSizing: 'border-box',
        }}>
          <div style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            backgroundColor: '#FFFFFF',
            border: '1px solid #CBD5E1',
            borderRadius: '6px',
            padding: '0 10px',
            height: '40px',
            gap: '8px',
            boxSizing: 'border-box',
            boxShadow: '0 1px 3px rgba(15, 23, 42, 0.05)',
          }}>
            <Search size={16} color="#64748B" style={{ flexShrink: 0 }} />
            <input
              type="text"
              placeholder="Search companies by name, MIDC zone, industry..."
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
                width: '100%',
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
              onClick={() => handleOpenFilterModal('LOCATION')}
              style={{
                background: 'transparent',
                border: 'none',
                padding: '4px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                color: '#1764E8',
                position: 'relative',
              }}
              title="Filter Companies"
            >
              <SlidersHorizontal size={18} color="#1764E8" />
              {activeFilterCount > 0 && (
                <span style={{
                  position: 'absolute',
                  top: '-3px',
                  right: '-3px',
                  backgroundColor: '#1764E8',
                  color: '#FFFFFF',
                  fontSize: '9.5px',
                  fontWeight: 800,
                  width: '15px',
                  height: '15px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: '1.5px solid #FFFFFF',
                }}>
                  {activeFilterCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Results Count & Quick Reset Filter Bar */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          fontSize: '12px',
          color: '#64748B',
          fontWeight: 600,
          padding: '0 2px',
        }}>
          <div>
            Showing <span style={{ fontWeight: 800, color: '#0F172A' }}>{filteredCompanies.length}</span> Verified Companies
          </div>

          {(activeFilterCount > 0 || searchQuery.trim()) && (
            <button
              onClick={resetAllFilters}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#1764E8',
                fontWeight: 700,
                fontSize: '11px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '3px',
                padding: 0,
              }}
            >
              <RotateCcw size={11} />
              Reset Filters
            </button>
          )}
        </div>

        {/* Company Cards List or Loading Skeletons */}
        {loading && companies.length === 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {[1, 2, 3, 4].map((n) => (
              <div
                key={n}
                style={{
                  backgroundColor: '#FFFFFF',
                  border: '1px solid #CBD5E1',
                  borderRadius: '6px',
                  padding: '14px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '10px',
                  boxShadow: '0 1px 3px rgba(15, 23, 42, 0.05)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ width: '48px', height: '48px', borderRadius: '6px', backgroundColor: '#F1F5F9' }} />
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <div style={{ width: '40%', height: '15px', borderRadius: '4px', backgroundColor: '#F1F5F9' }} />
                    <div style={{ width: '25%', height: '12px', borderRadius: '4px', backgroundColor: '#F1F5F9' }} />
                  </div>
                </div>
                <div style={{ width: '85%', height: '12px', borderRadius: '4px', backgroundColor: '#F1F5F9', marginTop: '4px' }} />
              </div>
            ))}
          </div>
        ) : filteredCompanies.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {filteredCompanies.map((comp) => {
              const jobsCount = comp.open_jobs_count ?? comp.jobs_count ?? comp.openings_count ?? comp.jobsCount ?? 4;
              const locationText = comp.midc_zone || comp.midcZone || comp.city || 'Waluj MIDC, Chhatrapati Sambhajinagar';
              const companyType = comp.company_type || comp.companyType || 'Private Limited';
              const companySize = comp.company_size || comp.companySize || '500+ employees';
              const foundedYear = comp.founded_year || comp.founded;

              return (
                <Link
                  key={comp.id || comp.name}
                  to={`/company/${comp.id || encodeURIComponent(comp.name)}`}
                  style={{
                    backgroundColor: '#FFFFFF',
                    border: '1px solid #CBD5E1',
                    borderRadius: '6px',
                    marginBottom: '16px',
                    boxShadow: '0 2px 8px rgba(15, 23, 42, 0.08), 0 1px 3px rgba(15, 23, 42, 0.05)',
                    overflow: 'hidden',
                    textDecoration: 'none',
                    color: 'inherit',
                    display: 'flex',
                    flexDirection: 'column',
                    width: '100%',
                    boxSizing: 'border-box',
                    transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
                    cursor: 'pointer',
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
                  {/* Card Top Header (Company Profile Logo and Name) */}
                  <div style={{
                    backgroundColor: '#FFFFFF',
                    borderBottom: '1px solid #E2E8F0',
                    padding: '12px 14px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    width: '100%',
                    boxSizing: 'border-box',
                  }}>
                    <CompanyDefaultLogo
                      name={comp.name}
                      logoUrl={comp.logo}
                      size={48}
                      borderRadius="6px"
                    />

                    <div style={{ flex: 1, minWidth: 0, overflow: 'hidden' }}>
                      <h3 style={{
                        margin: 0,
                        fontSize: '14.5px',
                        fontWeight: 600,
                        color: '#0F172A',
                        letterSpacing: '-0.15px',
                        lineHeight: 1.3,
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                      }}>
                        {comp.name}
                      </h3>
                      <p style={{
                        margin: '2px 0 0 0',
                        fontSize: '11.5px',
                        fontWeight: 500,
                        color: '#64748B',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                      }}>
                        {comp.industry || 'Industrial Manufacturing'} • {companyType}
                      </p>
                    </div>

                    <ChevronRight size={18} color="#94A3B8" style={{ flexShrink: 0 }} />
                  </div>

                  {/* Card Middle Body Details */}
                  <div style={{
                    padding: '12px 14px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '8px',
                    boxSizing: 'border-box',
                  }}>
                    {/* Row 1: Address & Estd adjacent in one row (Address truncates with ellipsis if long) */}
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      marginTop: '2px',
                      fontSize: '11.5px',
                      color: '#475569',
                      width: '100%',
                      minWidth: 0,
                      overflow: 'hidden',
                      whiteSpace: 'nowrap',
                    }}>
                      <div style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                        minWidth: 0,
                        maxWidth: '70%',
                        overflow: 'hidden',
                        flexShrink: 1,
                      }}>
                        <MapPin size={12} color="#1764E8" style={{ flexShrink: 0 }} />
                        <span style={{
                          fontWeight: 500,
                          color: '#334155',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}>
                          {locationText}
                        </span>
                      </div>

                      {foundedYear && (
                        <div style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                          flexShrink: 0,
                          whiteSpace: 'nowrap',
                        }}>
                          <Calendar size={12} color="#64748B" style={{ flexShrink: 0 }} />
                          <span style={{ fontWeight: 500, color: '#64748B' }}>Estd. {foundedYear}</span>
                        </div>
                      )}
                    </div>

                    {/* Row 2: Number of employees */}
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      fontSize: '11.5px',
                      color: '#64748B',
                      marginTop: '-2px',
                    }}>
                      <Users size={12} color="#64748B" style={{ flexShrink: 0 }} />
                      <span style={{ fontWeight: 500 }}>{companySize}</span>
                    </div>

                    {/* Card Bottom Vacancies CTA Footer */}
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      paddingTop: '8px',
                      borderTop: '1px solid #E2E8F0',
                      marginTop: '1px',
                      width: '100%',
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                        <Briefcase size={12} color="#1764E8" />
                        <span style={{ fontSize: '11px', fontWeight: 700, color: '#1764E8' }}>
                          {jobsCount} Vacancies Available
                        </span>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                        <span style={{ fontSize: '11px', fontWeight: 800, color: '#1764E8' }}>
                          View Details
                        </span>
                        <ChevronRight size={13} color="#1764E8" strokeWidth={2.5} />
                      </div>
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
            border: '1px solid #CBD5E1',
            borderRadius: '6px',
            padding: '32px 20px',
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            marginTop: '12px',
          }}>
            <Building2 size={36} color="#94A3B8" />
            <h3 style={{ fontSize: '15px', fontWeight: 800, color: '#0F172A', marginTop: '12px', marginBottom: 0 }}>
              No companies match your filters
            </h3>
            <p style={{ fontSize: '12px', color: '#64748B', marginTop: '4px', marginBottom: 0, maxWidth: '280px', lineHeight: '16px' }}>
              Try adjusting your industrial zone, sector, or keyword filters.
            </p>
            <button
              onClick={resetAllFilters}
              style={{
                backgroundColor: '#1764E8',
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

      {/* ── FILTER MODAL / DRAWER (PORTAL TO BODY) ── */}
      {filterDrawerOpen && typeof document !== 'undefined' && createPortal(
        <>
          {/* Desktop Backdrop Overlay */}
          {!isMobile && (
            <div
              onClick={() => setFilterDrawerOpen(false)}
              style={{
                position: 'fixed',
                inset: 0,
                backgroundColor: 'rgba(15, 23, 42, 0.45)',
                backdropFilter: 'blur(2px)',
                zIndex: 9999998,
                touchAction: 'none',
                transition: 'opacity 0.2s ease',
              }}
            />
          )}

          {/* Filter Container (Full-Page on Mobile, Right-Side Drawer on Desktop) */}
          <div
            style={{
              position: 'fixed',
              ...(isMobile
                ? {
                    inset: 0,
                    width: '100vw',
                    height: '100dvh',
                    backgroundColor: '#F8FAFC',
                    paddingTop: 'env(safe-area-inset-top, 0px)',
                    paddingBottom: 'env(safe-area-inset-bottom, 0px)',
                  }
                : {
                    top: 0,
                    right: 0,
                    bottom: 0,
                    width: '420px',
                    maxWidth: '90vw',
                    height: '100dvh',
                    backgroundColor: '#FFFFFF',
                    boxShadow: '-6px 0 28px rgba(15, 23, 42, 0.2)',
                  }),
              maxHeight: '100dvh',
              zIndex: 9999999,
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
              overscrollBehavior: 'contain',
              touchAction: 'none',
              boxSizing: 'border-box',
            }}
          >
            {/* Header (Fixed at top) */}
            <div
              style={{
                width: '100%',
                backgroundColor: '#FFFFFF',
                borderBottom: '1px solid #E2E8F0',
                flexShrink: 0,
                display: 'flex',
                justifyContent: isMobile ? 'center' : 'flex-start',
              }}
            >
              <div
                style={{
                  width: '100%',
                  maxWidth: isMobile ? '920px' : '100%',
                  padding: '10px 16px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  boxSizing: 'border-box',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div
                    style={{
                      width: '28px',
                      height: '28px',
                      borderRadius: '6px',
                      backgroundColor: '#EFF6FF',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <SlidersHorizontal size={14} color="#1764E8" />
                  </div>
                  <div>
                    <h3 style={{ margin: 0, fontSize: '13px', fontWeight: 700, color: '#0F172A', letterSpacing: '-0.1px' }}>
                      Filter Companies
                    </h3>
                    <p style={{ margin: '1px 0 0', fontSize: '11px', color: '#64748B' }}>
                      Showing {draftMatchingCount} matching companies
                    </p>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <button
                    type="button"
                    onClick={handleResetDraftFilters}
                    style={{
                      background: '#EFF6FF',
                      border: 'none',
                      color: '#1764E8',
                      fontSize: '11px',
                      fontWeight: 600,
                      cursor: 'pointer',
                      padding: '4px 8px',
                      borderRadius: '4px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '3px',
                    }}
                    title="Reset All"
                  >
                    <RotateCcw size={11} />
                    <span>Reset All</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setFilterDrawerOpen(false)}
                    style={{
                      background: '#F1F5F9',
                      border: 'none',
                      color: '#475569',
                      cursor: 'pointer',
                      padding: '5px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      borderRadius: '4px',
                    }}
                    title="Close"
                  >
                    <XCircle size={16} />
                  </button>
                </div>
              </div>
            </div>

            {/* Category Navigation Bar (Horizontal Scrollable Tabs with Pill Badges) */}
            <div
              style={{
                width: '100%',
                backgroundColor: '#F8FAFC',
                borderBottom: '1px solid #E2E8F0',
                flexShrink: 0,
                display: 'flex',
                justifyContent: isMobile ? 'center' : 'flex-start',
              }}
            >
              <div
                style={{
                  width: '100%',
                  maxWidth: isMobile ? '920px' : '100%',
                  padding: '7px 14px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  overflowX: 'auto',
                  overscrollBehaviorX: 'contain',
                  touchAction: 'pan-x',
                  scrollbarWidth: 'none',
                  boxSizing: 'border-box',
                }}
              >
                {[
                  { key: 'LOCATION', label: 'Location', icon: MapPin, activeVal: draftZone },
                  { key: 'INDUSTRY', label: 'Industry', icon: Building2, activeVal: draftIndustry },
                  { key: 'TYPE', label: 'Ownership', icon: Briefcase, activeVal: draftType },
                  { key: 'SIZE', label: 'Workforce', icon: Users, activeVal: draftSize },
                  { key: 'HIRING', label: 'Hiring', icon: Sparkles, activeVal: draftOnlyHiring ? 'Active Hiring' : null },
                ].map((cat) => {
                  const isSelected = activeFilterTab === cat.key;
                  const Icon = cat.icon;
                  const hasSelection = cat.activeVal && !cat.activeVal.startsWith('All ');

                  return (
                    <button
                      key={cat.key}
                      type="button"
                      onClick={() => setActiveFilterTab(cat.key as CompanyFilterCategoryKey)}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                        height: '25px',
                        padding: '0 9px',
                        borderRadius: '12px',
                        border: isSelected ? '1px solid #1764E8' : '1px solid #CBD5E1',
                        backgroundColor: isSelected ? '#1764E8' : '#FFFFFF',
                        color: isSelected ? '#FFFFFF' : '#334155',
                        fontSize: '10.5px',
                        fontWeight: isSelected ? 600 : 500,
                        cursor: 'pointer',
                        whiteSpace: 'nowrap',
                        flexShrink: 0,
                        transition: 'all 0.15s ease',
                      }}
                    >
                      <Icon size={11} color={isSelected ? '#FFFFFF' : '#64748B'} />
                      <span>{cat.label}</span>
                      {hasSelection && (
                        <span
                          style={{
                            width: '3.5px',
                            height: '3.5px',
                            borderRadius: '50%',
                            backgroundColor: isSelected ? '#FFFFFF' : '#1764E8',
                            display: 'inline-block',
                            marginLeft: '1px',
                          }}
                        />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Options List Body (Full Page on Mobile, Side Drawer on Desktop) */}
            <div
              style={{
                flex: 1,
                overflowY: 'auto',
                padding: '14px',
                backgroundColor: isMobile ? '#F8FAFC' : '#FFFFFF',
                overscrollBehaviorY: 'contain',
                touchAction: 'pan-y',
                display: 'flex',
                justifyContent: isMobile ? 'center' : 'flex-start',
              }}
            >
              <div
                style={{
                  width: '100%',
                  maxWidth: isMobile ? '920px' : '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  boxSizing: 'border-box',
                }}
              >
                <div
                  style={{
                    fontSize: '9.5px',
                    fontWeight: 700,
                    color: '#64748B',
                    letterSpacing: '0.4px',
                    marginBottom: '8px',
                    textTransform: 'uppercase',
                  }}
                >
                  Select {activeFilterTab === 'LOCATION' ? 'Location / MIDC Zone' : activeFilterTab === 'TYPE' ? 'Ownership / Company Type' : activeFilterTab === 'SIZE' ? 'Workforce Scale' : activeFilterTab === 'HIRING' ? 'Hiring Status' : 'Industry'}
                </div>

                {activeFilterTab === 'LOCATION' && (
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: isMobile ? 'repeat(auto-fill, minmax(260px, 1fr))' : '1fr',
                      gap: '6px',
                    }}
                  >
                    {MIDC_ZONES.map((opt) => {
                      const isChecked = (draftZone === opt) || (!draftZone && opt === 'All Locations');
                      return (
                        <div
                          key={opt}
                          onClick={() => setDraftZone(opt === 'All Locations' ? null : opt)}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            padding: '9px 12px',
                            borderRadius: '5px',
                            backgroundColor: isChecked ? '#EFF6FF' : '#FFFFFF',
                            border: isChecked ? '1px solid #1764E8' : '1px solid #E2E8F0',
                            cursor: 'pointer',
                            transition: 'all 0.15s ease',
                          }}
                        >
                          <span style={{ fontSize: '11px', fontWeight: isChecked ? 600 : 400, color: isChecked ? '#1764E8' : '#1E293B' }}>
                            {opt}
                          </span>
                          {isChecked && <Check size={14} color="#1764E8" strokeWidth={2.5} />}
                        </div>
                      );
                    })}
                  </div>
                )}

                {activeFilterTab === 'INDUSTRY' && (
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: isMobile ? 'repeat(auto-fill, minmax(260px, 1fr))' : '1fr',
                      gap: '6px',
                    }}
                  >
                    {INDUSTRIES.map((opt) => {
                      const isChecked = (draftIndustry === opt) || (!draftIndustry && opt === 'All Industries');
                      return (
                        <div
                          key={opt}
                          onClick={() => setDraftIndustry(opt === 'All Industries' ? null : opt)}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            padding: '9px 12px',
                            borderRadius: '5px',
                            backgroundColor: isChecked ? '#EFF6FF' : '#FFFFFF',
                            border: isChecked ? '1px solid #1764E8' : '1px solid #E2E8F0',
                            cursor: 'pointer',
                            transition: 'all 0.15s ease',
                          }}
                        >
                          <span style={{ fontSize: '11px', fontWeight: isChecked ? 600 : 400, color: isChecked ? '#1764E8' : '#1E293B' }}>
                            {opt}
                          </span>
                          {isChecked && <Check size={14} color="#1764E8" strokeWidth={2.5} />}
                        </div>
                      );
                    })}
                  </div>
                )}

                {activeFilterTab === 'TYPE' && (
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: isMobile ? 'repeat(auto-fill, minmax(260px, 1fr))' : '1fr',
                      gap: '6px',
                    }}
                  >
                    {COMPANY_TYPES.map((opt) => {
                      const isChecked = (draftType === opt) || (!draftType && opt === 'All Types');
                      return (
                        <div
                          key={opt}
                          onClick={() => setDraftType(opt === 'All Types' ? null : opt)}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            padding: '9px 12px',
                            borderRadius: '5px',
                            backgroundColor: isChecked ? '#EFF6FF' : '#FFFFFF',
                            border: isChecked ? '1px solid #1764E8' : '1px solid #E2E8F0',
                            cursor: 'pointer',
                            transition: 'all 0.15s ease',
                          }}
                        >
                          <span style={{ fontSize: '11px', fontWeight: isChecked ? 600 : 400, color: isChecked ? '#1764E8' : '#1E293B' }}>
                            {opt}
                          </span>
                          {isChecked && <Check size={14} color="#1764E8" strokeWidth={2.5} />}
                        </div>
                      );
                    })}
                  </div>
                )}

                {activeFilterTab === 'SIZE' && (
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: isMobile ? 'repeat(auto-fill, minmax(260px, 1fr))' : '1fr',
                      gap: '6px',
                    }}
                  >
                    {COMPANY_SIZES.map((opt) => {
                      const isChecked = (draftSize === opt) || (!draftSize && opt === 'All Sizes');
                      return (
                        <div
                          key={opt}
                          onClick={() => setDraftSize(opt === 'All Sizes' ? null : opt)}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            padding: '9px 12px',
                            borderRadius: '5px',
                            backgroundColor: isChecked ? '#EFF6FF' : '#FFFFFF',
                            border: isChecked ? '1px solid #1764E8' : '1px solid #E2E8F0',
                            cursor: 'pointer',
                            transition: 'all 0.15s ease',
                          }}
                        >
                          <span style={{ fontSize: '11px', fontWeight: isChecked ? 600 : 400, color: isChecked ? '#1764E8' : '#1E293B' }}>
                            {opt}
                          </span>
                          {isChecked && <Check size={14} color="#1764E8" strokeWidth={2.5} />}
                        </div>
                      );
                    })}
                  </div>
                )}

                {activeFilterTab === 'HIRING' && (
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: isMobile ? 'repeat(auto-fill, minmax(260px, 1fr))' : '1fr',
                      gap: '6px',
                    }}
                  >
                    {[
                      { label: 'All Companies', val: false },
                      { label: 'Actively Hiring Only (With Open Vacancies)', val: true },
                    ].map((opt) => {
                      const isChecked = draftOnlyHiring === opt.val;
                      return (
                        <div
                          key={opt.label}
                          onClick={() => setDraftOnlyHiring(opt.val)}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            padding: '9px 12px',
                            borderRadius: '5px',
                            backgroundColor: isChecked ? '#EFF6FF' : '#FFFFFF',
                            border: isChecked ? '1px solid #1764E8' : '1px solid #E2E8F0',
                            cursor: 'pointer',
                            transition: 'all 0.15s ease',
                          }}
                        >
                          <span style={{ fontSize: '11px', fontWeight: isChecked ? 600 : 400, color: isChecked ? '#1764E8' : '#1E293B' }}>
                            {opt.label}
                          </span>
                          {isChecked && <Check size={14} color="#1764E8" strokeWidth={2.5} />}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* Sticky Bottom Actions (Fixed at bottom) */}
            <div
              style={{
                width: '100%',
                backgroundColor: '#FFFFFF',
                borderTop: '1px solid #E2E8F0',
                flexShrink: 0,
                boxShadow: '0 -2px 10px rgba(15, 23, 42, 0.04)',
                display: 'flex',
                justifyContent: isMobile ? 'center' : 'flex-start',
              }}
            >
              <div
                style={{
                  width: '100%',
                  maxWidth: isMobile ? '920px' : '100%',
                  padding: '10px 14px',
                  paddingBottom: isMobile ? 'calc(12px + env(safe-area-inset-bottom, 0px))' : '10px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '10px',
                  boxSizing: 'border-box',
                }}
              >
                <button
                  type="button"
                  onClick={handleResetDraftFilters}
                  style={{
                    padding: '7px 12px',
                    borderRadius: '5px',
                    border: '1px solid #CBD5E1',
                    backgroundColor: '#FFFFFF',
                    color: '#64748B',
                    fontSize: '11px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                  }}
                >
                  <RotateCcw size={11} />
                  <span>Reset All</span>
                </button>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <button
                    type="button"
                    onClick={() => setFilterDrawerOpen(false)}
                    style={{
                      padding: '7px 14px',
                      borderRadius: '5px',
                      border: '1px solid #CBD5E1',
                      backgroundColor: '#FFFFFF',
                      color: '#334155',
                      fontSize: '11px',
                      fontWeight: 600,
                      cursor: 'pointer',
                    }}
                  >
                    Cancel
                  </button>

                  <button
                    type="button"
                    onClick={handleApplyDraftFilters}
                    style={{
                      padding: '7px 18px',
                      borderRadius: '5px',
                      border: 'none',
                      backgroundColor: '#1764E8',
                      color: '#FFFFFF',
                      fontSize: '11.5px',
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '5px',
                      boxShadow: '0 2px 6px rgba(23, 100, 232, 0.2)',
                    }}
                  >
                    <Check size={13} strokeWidth={2.5} />
                    <span>Apply Filters ({draftMatchingCount})</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>,
        document.body
      )}
    </div>
  );
};

export default CompaniesDirectoryPage;
