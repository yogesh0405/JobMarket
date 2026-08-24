import React, { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { apiFetch, safeParseJson } from '../../utils/api';
import { CompanyDefaultLogo } from '../../components/company/CompanyDefaultLogo';
import { JobCard } from '../../components/job/JobCard';
import { useStore } from '../../store/useStore';
import { Job } from '../../types';
import {
  Building2,
  MapPin,
  Users,
  Search,
  Briefcase,
  ExternalLink,
  CheckCircle2,
  LayoutGrid,
  List as ListIcon,
  X,
  Globe,
  Sparkles,
  ChevronRight
} from 'lucide-react';

interface CompanyItem {
  id: string;
  name: string;
  logo?: string;
  color?: string;
  industry?: string;
  description?: string;
  website?: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  midc_zone?: string;
  company_size?: string;
  founded_year?: number;
  open_jobs_count?: number;
  verified?: boolean;
  realJobs?: Job[];
}

const POPULAR_INDUSTRIES = [
  'All Companies',
  'Automotive Manufacturing',
  'Engineering & Machinery',
  'Pharmaceuticals & Chemicals',
  'Hospitality & Hotels',
  'Healthcare & Hospitals',
  'Electronics & Electricals'
];

const MIDC_ZONES = [
  'All Zones',
  'Waluj MIDC',
  'Shendra MIDC',
  'Chakan MIDC',
  'Bhosari MIDC',
  'Chikalthana MIDC',
  'Waluj Industrial Area'
];

export const CompaniesDirectoryPage: React.FC = () => {
  const navigate = useNavigate();
  const { state } = useStore();
  const [companies, setCompanies] = useState<CompanyItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeSearch, setActiveSearch] = useState('');
  const [selectedIndustry, setSelectedIndustry] = useState('All Companies');
  const [selectedZone, setSelectedZone] = useState('All Zones');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const [isMobile, setIsMobile] = useState(() => typeof window !== 'undefined' && window.innerWidth <= 768);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const allStoreJobs = useMemo(() => {
    return Array.isArray(state.jobs) ? state.jobs : [];
  }, [state.jobs]);

  const deriveCompaniesFromStore = React.useCallback((): CompanyItem[] => {
    return [];
  }, []);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    apiFetch('/api/v1/companies')
      .then(res => safeParseJson(res))
      .then(({ ok, data: json }) => {
        if (!isMounted) return;
        let fetchedList: CompanyItem[] = [];

        if (ok && json && (json.data || Array.isArray(json))) {
          const list = Array.isArray(json) ? json : (json.data || []);
          if (Array.isArray(list) && list.length > 0) {
            fetchedList = list;
          }
        }

        fetchedList = fetchedList.map(comp => {
          const compName = (comp.name || '').toLowerCase().trim();
          const cleanComp = compName.replace(/[^a-z0-9]/g, '');

          const matchingJobs = allStoreJobs.filter(j => {
            if (!j) return false;
            const jEmpId = j.employerId || (j as any).employer_id;
            if (jEmpId && comp.employer_id && jEmpId === comp.employer_id && jEmpId !== '00000000-0000-0000-0000-000000000000') {
              return true;
            }
            const jComp = (j.company || '').toLowerCase().trim();
            const cleanJComp = jComp.replace(/[^a-z0-9]/g, '');
            return jComp === compName || (cleanComp.length > 3 && cleanJComp === cleanComp);
          });

          return {
            ...comp,
            realJobs: matchingJobs,
            open_jobs_count: (comp.open_jobs_count !== undefined && comp.open_jobs_count !== null && comp.open_jobs_count > 0)
              ? comp.open_jobs_count
              : matchingJobs.length
          };
        });

        if (isMounted) {
          setCompanies(fetchedList);
          setLoading(false);
        }
      })
      .catch(err => {
        console.error('Failed to fetch backend companies:', err);
        if (isMounted) {
          setCompanies([]);
          setLoading(false);
        }
      });

    return () => { isMounted = false; };
  }, [allStoreJobs, deriveCompaniesFromStore]);

  const handleSearchSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setActiveSearch(searchQuery);
  };

  const filteredCompanies = useMemo(() => {
    return companies.filter(company => {
      const q = (activeSearch || searchQuery).toLowerCase().trim();
      const matchesSearch = !q || (
        company.name.toLowerCase().includes(q) ||
        (company.industry || '').toLowerCase().includes(q) ||
        (company.city || '').toLowerCase().includes(q) ||
        (company.midc_zone || '').toLowerCase().includes(q) ||
        (company.description || '').toLowerCase().includes(q) ||
        (company.realJobs || []).some(j => (j.title || '').toLowerCase().includes(q) || (j.trade || '').toLowerCase().includes(q))
      );

      const matchesIndustry = selectedIndustry === 'All Companies' ||
        (company.industry || '').toLowerCase().includes(selectedIndustry.toLowerCase());

      const matchesZone = selectedZone === 'All Zones' ||
        (company.midc_zone || '').toLowerCase() === selectedZone.toLowerCase();

      return matchesSearch && matchesIndustry && matchesZone;
    });
  }, [companies, searchQuery, activeSearch, selectedIndustry, selectedZone]);

  const totalOpenPositions = useMemo(() => {
    return companies.reduce((acc, c) => acc + (c.open_jobs_count ?? (c.realJobs ? c.realJobs.length : 0)), 0);
  }, [companies]);

  const handleOpenCompanyModal = (company: CompanyItem) => {
    setSelectedCompanyModal(company);
  };

  return (
    <div style={{ background: 'var(--bg-page)', minHeight: '100vh', width: '100%', overflowX: 'hidden', boxSizing: 'border-box' }}>
      {/* Hero Header Section */}
      <section style={{
        background: 'linear-gradient(135deg, #1E3A8A 0%, #2563EB 50%, #1D4ED8 100%)',
        color: '#FFFFFF',
        padding: isMobile ? '20px 16px 18px 16px' : '44px 24px 36px 24px',
        position: 'relative',
        overflow: 'hidden',
        width: '100%',
        boxSizing: 'border-box'
      }}>
        <div style={{
          position: 'absolute',
          top: '-30%',
          right: '-10%',
          width: '500px',
          height: '500px',
          background: 'radial-gradient(circle, rgba(255, 255, 255, 0.15) 0%, rgba(0, 0, 0, 0) 70%)',
          pointerEvents: 'none'
        }} />

        <div style={{
          maxWidth: '1140px',
          margin: '0 auto',
          position: 'relative',
          zIndex: 2,
          width: '100%',
          boxSizing: 'border-box'
        }}>
          <div style={{ maxWidth: '720px', width: '100%', boxSizing: 'border-box' }}>
            <h1 style={{ fontSize: isMobile ? '20px' : '32px', fontWeight: '800', lineHeight: 1.25, margin: '0 0 6px 0', letterSpacing: '-0.4px', color: '#FFFFFF' }}>
              Explore Top Industrial Employers & Factories
            </h1>
            <p style={{ fontSize: isMobile ? '12.5px' : '15px', color: 'rgba(255, 255, 255, 0.9)', lineHeight: 1.45, margin: 0, fontWeight: '500' }}>
              Discover leading automotive plants, engineering works, and manufacturing units actively hiring skilled technicians, operators, and factory personnel.
            </p>
          </div>

          {/* Search Box Form */}
          <form
            onSubmit={handleSearchSubmit}
            style={{
              background: '#FFFFFF',
              borderRadius: '8px',
              padding: isMobile ? '8px' : '4px 6px',
              marginTop: isMobile ? '14px' : '20px',
              boxShadow: '0 8px 20px rgba(0, 0, 0, 0.18)',
              display: 'flex',
              alignItems: 'stretch',
              flexDirection: isMobile ? 'column' : 'row',
              gap: isMobile ? '8px' : '6px',
              width: '100%',
              boxSizing: 'border-box'
            }}
          >
            <div style={{ width: '100%', flex: isMobile ? 'none' : '1 1 280px', position: 'relative', display: 'flex', alignItems: 'center', boxSizing: 'border-box' }}>
              <Search size={15} style={{ position: 'absolute', left: '12px', color: '#64748B', pointerEvents: 'none' }} />
              <input
                type="text"
                placeholder="Search company name, role, trade..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                style={{
                  width: '100%',
                  height: '38px',
                  paddingLeft: '36px',
                  paddingRight: '12px',
                  border: isMobile ? '1px solid #CBD5E1' : 'none',
                  borderRadius: isMobile ? '6px' : '0',
                  outline: 'none',
                  fontSize: '13px',
                  color: '#0F172A',
                  fontWeight: '500',
                  boxSizing: 'border-box'
                }}
              />
            </div>

            {!isMobile && <div style={{ height: '22px', width: '1px', background: '#E2E8F0', alignSelf: 'center' }} />}

            <div style={{ width: '100%', flex: isMobile ? 'none' : '0 0 180px', display: 'flex', alignItems: 'center', boxSizing: 'border-box' }}>
              <select
                value={selectedZone}
                onChange={e => setSelectedZone(e.target.value)}
                style={{
                  width: '100%',
                  height: '38px',
                  border: '1px solid #CBD5E1',
                  outline: 'none',
                  background: '#F8FAFC',
                  borderRadius: '6px',
                  padding: '0 10px',
                  fontSize: '12.5px',
                  fontWeight: '600',
                  color: '#334155',
                  cursor: 'pointer',
                  boxSizing: 'border-box'
                }}
              >
                {MIDC_ZONES.map(z => (
                  <option key={z} value={z}>{z}</option>
                ))}
              </select>
            </div>

            <button
              type="submit"
              style={{
                width: isMobile ? '100%' : 'auto',
                height: '38px',
                padding: '0 18px',
                background: '#2563EB',
                color: '#FFFFFF',
                border: 'none',
                borderRadius: '6px',
                fontWeight: '700',
                fontSize: '13px',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                flexShrink: 0
              }}
            >
              <Search size={14} />
              <span>Search</span>
            </button>
          </form>

          {/* Horizontal Industry Tab Menu */}
          <div className="no-scrollbar" style={{
            display: 'flex',
            gap: isMobile ? '6px' : '8px',
            overflowX: 'auto',
            marginTop: isMobile ? '12px' : '18px',
            paddingBottom: '4px',
            width: '100%',
            maxWidth: '100%',
            boxSizing: 'border-box',
            msOverflowStyle: 'none',
            scrollbarWidth: 'none',
            WebkitOverflowScrolling: 'touch'
          }}>
            {POPULAR_INDUSTRIES.map(ind => (
              <button
                key={ind}
                onClick={() => setSelectedIndustry(ind)}
                style={{
                  padding: isMobile ? '6px 14px' : '8px 18px',
                  borderRadius: '20px',
                  fontSize: isMobile ? '12px' : '13px',
                  fontWeight: selectedIndustry === ind ? '700' : '600',
                  background: selectedIndustry === ind ? '#FFFFFF' : 'rgba(255, 255, 255, 0.16)',
                  color: selectedIndustry === ind ? '#2563EB' : '#FFFFFF',
                  border: selectedIndustry === ind ? '1px solid #FFFFFF' : '1px solid rgba(255, 255, 255, 0.3)',
                  backdropFilter: selectedIndustry === ind ? 'none' : 'blur(4px)',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  boxShadow: selectedIndustry === ind ? '0 4px 12px rgba(0,0,0,0.15)' : 'none',
                  transition: 'all 0.15s ease'
                }}
              >
                {ind}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <div style={{
        maxWidth: '1140px',
        margin: '0 auto',
        width: '100%',
        boxSizing: 'border-box',
        marginTop: isMobile ? '16px' : '24px',
        padding: isMobile ? '0 16px 100px 16px' : '0 24px 60px 24px'
      }}>
        {/* Results Toolbar */}
        <div style={{
          display: 'flex',
          justify: 'space-between',
          alignItems: 'center',
          gap: '12px',
          marginBottom: isMobile ? '14px' : '20px',
          flexWrap: 'wrap',
          width: '100%',
          boxSizing: 'border-box'
        }}>
          <p style={{ margin: 0, fontSize: isMobile ? '13px' : '14.5px', color: '#64748B', fontWeight: '600' }}>
            Showing <strong style={{ color: '#0F172A' }}>{filteredCompanies.length}</strong> companies
          </p>

          {(searchQuery || activeSearch || selectedIndustry !== 'All Companies' || selectedZone !== 'All Zones') && (
            <button
              onClick={() => {
                setSearchQuery('');
                setActiveSearch('');
                setSelectedIndustry('All Companies');
                setSelectedZone('All Zones');
              }}
              style={{
                background: 'none',
                border: 'none',
                color: '#2563EB',
                fontSize: '12.5px',
                fontWeight: '600',
                cursor: 'pointer'
              }}
            >
              Reset
            </button>
          )}
        </div>

        {/* Loading Skeleton */}
        {loading && (
          <div style={{
            display: 'grid',
            gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fill, minmax(320px, 1fr))',
            gap: '16px',
            width: '100%',
            maxWidth: '100%',
            boxSizing: 'border-box'
          }}>
            {[1, 2, 3, 4].map(i => (
              <div key={i} style={{
                background: '#FFFFFF',
                border: '1px solid #CBD5E1',
                borderRadius: '8px',
                padding: '16px',
                boxShadow: '0 1px 3px rgba(15, 23, 42, 0.04)',
                display: 'flex',
                flexDirection: 'column',
                justify: 'space-between',
                minHeight: '180px',
                width: '100%',
                maxWidth: '100%',
                boxSizing: 'border-box',
                position: 'relative'
              }}>
                <div>
                  <div style={{ display: 'flex', gap: '12px', alignItems: 'center', marginBottom: '12px' }}>
                    <div style={{ width: '44px', height: '44px', borderRadius: '50%', background: '#E2E8F0', flexShrink: 0 }} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ width: '60%', height: '16px', background: '#E2E8F0', borderRadius: '4px', marginBottom: '6px' }} />
                      <div style={{ width: '40%', height: '12px', background: '#E2E8F0', borderRadius: '4px' }} />
                    </div>
                  </div>
                  <div style={{ width: '70%', height: '24px', background: '#F1F5F9', borderRadius: '4px', marginBottom: '12px' }} />
                  <div style={{ width: '100%', height: '32px', background: '#F8FAFC', borderRadius: '4px' }} />
                </div>
                <div style={{ width: '100%', height: '14px', background: '#F1F5F9', borderRadius: '4px', marginTop: '10px' }} />
              </div>
            ))}
          </div>
        )}

        {/* Company Cards Grid */}
        {!loading && filteredCompanies.length > 0 && (
          <div style={{
            display: 'grid',
            gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fill, minmax(320px, 1fr))',
            gap: '16px',
            width: '100%',
            maxWidth: '100%',
            boxSizing: 'border-box'
          }}>
            {filteredCompanies.map(company => {
              const openJobsCount = company.open_jobs_count ?? (company.realJobs ? company.realJobs.length : 0);
              return (
                <div
                  key={company.id}
                  style={{
                    background: '#FFFFFF',
                    border: '1px solid #CBD5E1',
                    borderRadius: '8px',
                    padding: '16px',
                    boxShadow: '0 1px 3px rgba(15, 23, 42, 0.04)',
                    display: 'flex',
                    flexDirection: 'column',
                    justify: 'space-between',
                    minHeight: '180px',
                    transition: 'transform 0.15s ease, box-shadow 0.15s ease',
                    position: 'relative',
                    cursor: 'pointer',
                    width: '100%',
                    maxWidth: '100%',
                    minWidth: 0,
                    boxSizing: 'border-box',
                    overflow: 'hidden'
                  }}
                  onClick={() => navigate(`/company/${encodeURIComponent(company.id || company.name)}`)}
                >
                  {/* Top-Right Profile ExternalLink Icon */}
                  <div style={{
                    position: 'absolute',
                    top: '14px',
                    right: '14px',
                    color: '#94A3B8',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <ExternalLink size={16} />
                  </div>

                  <div style={{ width: '100%', maxWidth: '100%', minWidth: 0, boxSizing: 'border-box' }}>
                    {/* Top Row: Company Logo Avatar & Name */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px', width: '100%', maxWidth: '100%', minWidth: 0, boxSizing: 'border-box', paddingRight: '24px' }}>
                      <div style={{
                        width: '44px',
                        height: '44px',
                        borderRadius: '50%',
                        border: '1px solid #E2E8F0',
                        overflow: 'hidden',
                        flexShrink: 0,
                        background: '#FFFFFF',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        <CompanyDefaultLogo name={company.name} logoUrl={company.logo} size={40} borderRadius="50%" />
                      </div>

                      <div style={{ flex: 1, minWidth: 0, overflow: 'hidden' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', minWidth: 0, overflow: 'hidden' }}>
                          <h3 style={{
                            fontSize: '15px',
                            fontWeight: '700',
                            color: '#0F172A',
                            margin: 0,
                            lineHeight: 1.3,
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            maxWidth: '100%'
                          }}>
                            {company.name}
                          </h3>
                        </div>

                        <span style={{
                          display: 'block',
                          fontSize: '12px',
                          color: '#2563EB',
                          fontWeight: '600',
                          marginTop: '2px',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          maxWidth: '100%'
                        }}>
                          {company.industry || 'Industrial Manufacturing'}
                        </span>
                      </div>
                    </div>

                    {/* Open Positions Pill & MIDC Zone Info */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginBottom: '12px', width: '100%', maxWidth: '100%', minWidth: 0, boxSizing: 'border-box' }}>
                      <span style={{
                        background: '#EFF6FF',
                        color: '#1D4ED8',
                        border: '1px solid #BFDBFE',
                        padding: '4px 10px',
                        borderRadius: '4px',
                        fontSize: '11.5px',
                        fontWeight: '700',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                        maxWidth: '100%',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap'
                      }}>
                        <Briefcase size={12} style={{ flexShrink: 0 }} />
                        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {openJobsCount} Open Position{openJobsCount > 1 ? 's' : ''}
                        </span>
                      </span>

                      <span style={{
                        background: '#F1F5F9',
                        color: '#475569',
                        padding: '4px 10px',
                        borderRadius: '4px',
                        fontSize: '11.5px',
                        fontWeight: '600',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                        maxWidth: '100%',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap'
                      }}>
                        <MapPin size={12} style={{ color: '#64748B', flexShrink: 0 }} />
                        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {company.midc_zone || 'Waluj MIDC'}
                        </span>
                      </span>
                    </div>

                    {/* Location Info */}
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      fontSize: '12.5px',
                      color: '#475569',
                      margin: '0 0 12px 0',
                      fontWeight: '500',
                      overflow: 'hidden'
                    }}>
                      <MapPin size={13} style={{ color: '#2563EB', flexShrink: 0 }} />
                      <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {company.address ? `${company.address}, ${company.city || 'Chhatrapati Sambhajinagar'}` : `${company.midc_zone || 'Waluj MIDC'}, ${company.city || 'Chhatrapati Sambhajinagar'}`}
                      </span>
                    </div>
                  </div>

                  {/* Company Info Metadata Line */}
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '14px',
                    fontSize: '12px',
                    color: '#64748B',
                    borderTop: '1px solid #F1F5F9',
                    paddingTop: '10px',
                    width: '100%',
                    boxSizing: 'border-box'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Users size={12} style={{ color: '#94A3B8' }} />
                      <span>{company.company_size || '100-500 employees'}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Building2 size={12} style={{ color: '#94A3B8' }} />
                      <span>Est. {company.founded_year || 2000}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Empty State */}
        {!loading && filteredCompanies.length === 0 && (
          <div style={{
            background: '#FFFFFF',
            border: '1.5px solid #CBD5E1',
            borderRadius: '12px',
            padding: '36px 16px',
            textAlign: 'center',
            maxWidth: '520px',
            margin: '24px auto'
          }}>
            <div style={{
              width: '56px',
              height: '56px',
              borderRadius: '50%',
              background: '#EFF6FF',
              color: '#2563EB',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 12px auto'
            }}>
              <Building2 size={28} />
            </div>
            <h3 style={{ fontSize: '17px', fontWeight: '800', color: '#0F172A', marginBottom: '6px' }}>
              No companies match your search
            </h3>
            <p style={{ fontSize: '13px', color: '#64748B', lineHeight: 1.45, marginBottom: '20px' }}>
              Try searching with a different keyword or resetting your filters.
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setActiveSearch('');
                setSelectedIndustry('All Companies');
                setSelectedZone('All Zones');
              }}
              style={{
                background: '#2563EB',
                color: '#FFFFFF',
                border: 'none',
                borderRadius: '6px',
                padding: '9px 18px',
                fontSize: '13px',
                fontWeight: '700',
                cursor: 'pointer'
              }}
            >
              Reset Filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
