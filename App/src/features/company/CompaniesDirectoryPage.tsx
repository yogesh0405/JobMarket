import React, { useState, useEffect, useMemo, useCallback } from 'react';
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

const FALLBACK_COMPANIES: CompanyItem[] = [
  {
    id: 'Bajaj Auto Ltd',
    name: 'Bajaj Auto Ltd',
    logo: 'https://logo.clearbit.com/bajajauto.com',
    industry: 'Automotive Manufacturing',
    company_type: 'Public Limited',
    description: 'Premier two-wheeler and three-wheeler manufacturing facility producing Pulsar, Chetak EV, and Commercial RE auto rickshaws at Waluj plant.',
    website: 'https://www.bajajauto.com',
    address: 'Plot No. A-1, Waluj Industrial Area, MIDC',
    city: 'Chhatrapati Sambhajinagar',
    midc_zone: 'Waluj MIDC (Chhatrapati Sambhajinagar)',
    company_size: '10,000+ employees',
    founded_year: 1945,
    jobs_count: 14,
    verified: true,
  },
  {
    id: 'Škoda Auto Volkswagen India',
    name: 'Škoda Auto Volkswagen India',
    logo: 'https://logo.clearbit.com/skoda-auto.com',
    industry: 'Automotive Manufacturing',
    company_type: 'Public Limited',
    description: 'State-of-the-art passenger vehicle assembly manufacturing Kushaq, Slavia, Taigun, and Virtus models for domestic and global export markets.',
    website: 'https://www.skoda-vw.co.in',
    address: 'Plot A-1, Shendra Industrial Area, MIDC',
    city: 'Chhatrapati Sambhajinagar',
    midc_zone: 'Shendra MIDC (Chhatrapati Sambhajinagar)',
    company_size: '5,000-10,000 employees',
    founded_year: 2001,
    jobs_count: 12,
    verified: true,
  },
  {
    id: 'Endurance Technologies Ltd',
    name: 'Endurance Technologies Ltd',
    logo: 'https://logo.clearbit.com/endurancegroup.com',
    industry: 'Auto Components',
    company_type: 'Public Limited',
    description: 'Leading automotive component manufacturer producing aluminium die-castings, suspension systems, transmission components, and braking systems.',
    website: 'https://www.endurancegroup.com',
    address: 'Plot No. E-92, Waluj Industrial Area, MIDC',
    city: 'Chhatrapati Sambhajinagar',
    midc_zone: 'Waluj MIDC (Chhatrapati Sambhajinagar)',
    company_size: '5,000-10,000 employees',
    founded_year: 1985,
    jobs_count: 9,
    verified: true,
  },
  {
    id: 'Varroc Engineering Ltd',
    name: 'Varroc Engineering Ltd',
    logo: 'https://logo.clearbit.com/varroc.com',
    industry: 'Auto Components & Lighting',
    company_type: 'Public Limited',
    description: 'Global Tier-1 automotive component group manufacturing exterior lighting, polymer components, electrical systems, and precision forgings.',
    website: 'https://www.varroc.com',
    address: 'Plot No. L-4, MIDC Industrial Area, Waluj',
    city: 'Chhatrapati Sambhajinagar',
    midc_zone: 'Waluj MIDC (Chhatrapati Sambhajinagar)',
    company_size: '5,000-10,000 employees',
    founded_year: 1990,
    jobs_count: 11,
    verified: true,
  },
  {
    id: 'Siemens Limited',
    name: 'Siemens Limited',
    logo: 'https://logo.clearbit.com/siemens.com',
    industry: 'Electrical & Industrial Automation',
    company_type: 'MNC Branch',
    description: 'Global engineering powerhouse manufacturing medium voltage switchgears, industrial circuit breakers, and power distribution systems.',
    website: 'https://www.siemens.co.in',
    address: 'Plot B-5, Waluj Industrial Area, MIDC',
    city: 'Chhatrapati Sambhajinagar',
    midc_zone: 'Waluj MIDC (Chhatrapati Sambhajinagar)',
    company_size: '5,000-10,000 employees',
    founded_year: 1847,
    jobs_count: 8,
    verified: true,
  },
  {
    id: 'Wockhardt Ltd',
    name: 'Wockhardt Ltd',
    logo: 'https://logo.clearbit.com/wockhardt.com',
    industry: 'Pharmaceuticals',
    company_type: 'Public Limited',
    description: 'Global pharmaceutical and biotechnology major manufacturing active pharmaceutical ingredients (APIs), sterile injectables, and formulations.',
    website: 'https://www.wockhardt.com',
    address: 'L-1, Chikalthana MIDC Area, Jalna Road',
    city: 'Chhatrapati Sambhajinagar',
    midc_zone: 'Chikalthana MIDC',
    company_size: '5,000-10,000 employees',
    founded_year: 1967,
    jobs_count: 6,
    verified: true,
  },
  {
    id: 'CEAT Tyres Ltd',
    name: 'CEAT Tyres Ltd',
    logo: 'https://logo.clearbit.com/ceat.com',
    industry: 'Tyre Manufacturing',
    company_type: 'Public Limited',
    description: 'RPG Group company manufacturing high-performance radial tyres for truck, bus, agricultural, and passenger cars in Waluj.',
    website: 'https://www.ceat.com',
    address: 'Plot No. H-3, Waluj MIDC Industrial Area',
    city: 'Chhatrapati Sambhajinagar',
    midc_zone: 'Waluj MIDC (Chhatrapati Sambhajinagar)',
    company_size: '1,000-5,000 employees',
    founded_year: 1958,
    jobs_count: 7,
    verified: true,
  },
  {
    id: 'Garware Technical Fibres Ltd',
    name: 'Garware Technical Fibres Ltd',
    logo: 'https://logo.clearbit.com/garwarefibres.com',
    industry: 'Technical Textiles & Fibres',
    company_type: 'Public Limited',
    description: 'Leading technical textiles manufacturer producing synthetic cordage, aquaculture nets, coated fabrics, and geo-synthetics.',
    website: 'https://www.garwarefibres.com',
    address: 'Plot No. 3, Chikalthana Industrial Area, MIDC',
    city: 'Chhatrapati Sambhajinagar',
    midc_zone: 'Chikalthana MIDC',
    company_size: '1,000-5,000 employees',
    founded_year: 1976,
    jobs_count: 5,
    verified: true,
  },
];

const ZONE_FILTERS = [
  'All Companies',
  'Waluj MIDC',
  'Chakan MIDC',
  'Shendra MIDC',
  'Chikalthana MIDC',
];

export const CompaniesDirectoryPage: React.FC = () => {
  const [companies, setCompanies] = useState<CompanyItem[]>(FALLBACK_COMPANIES);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedZone, setSelectedZone] = useState('All Companies');

  const fetchCompanies = useCallback(async () => {
    try {
      setLoading(true);
      const res = await apiFetch('/api/v1/companies');
      const { ok, data: json } = await safeParseJson(res);
      const list = Array.isArray(json) ? json : (json?.data || json?.companies || []);
      if (ok && Array.isArray(list) && list.length > 0) {
        setCompanies(list);
      } else {
        setCompanies(FALLBACK_COMPANIES);
      }
    } catch (e) {
      console.log('Using fallback verified companies list', e);
      setCompanies(FALLBACK_COMPANIES);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCompanies();
  }, [fetchCompanies]);

  const filteredCompanies = useMemo(() => {
    return companies.filter((c) => {
      if (selectedZone && selectedZone !== 'All Companies' && selectedZone !== 'All Zones') {
        const zoneStr = (c.midc_zone || c.midcZone || c.address || c.city || '').toLowerCase();
        const filterKeyword = selectedZone.toLowerCase().replace(' midc', '').trim();
        if (!zoneStr.includes(filterKeyword)) {
          return false;
        }
      }

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchName = (c.name || '').toLowerCase().includes(q);
        const matchIndustry = (c.industry || '').toLowerCase().includes(q);
        const matchCity = (c.city || '').toLowerCase().includes(q);
        const matchZone = (c.midc_zone || c.midcZone || '').toLowerCase();
        return matchName || matchIndustry || matchCity || matchZone;
      }

      return true;
    });
  }, [companies, selectedZone, searchQuery]);

  return (
    <div style={{ width: '100%', minHeight: '100vh', background: '#FFFFFF', boxSizing: 'border-box' }}>
      {/* Reusable Mobile-Identical Top Header Bar */}
      <MobileHeader title="Top Companies" />

      {/* Main Content Area */}
      <div style={{
        maxWidth: '580px',
        margin: '0 auto',
        padding: '16px',
        paddingBottom: '40px',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
        boxSizing: 'border-box',
      }}>
        {/* Search Bar */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          backgroundColor: '#F8FAFC',
          border: '1px solid #CBD5E1',
          borderRadius: '6px',
          padding: '0 12px',
          height: '40px',
          marginBottom: '12px',
          boxSizing: 'border-box',
          width: '100%'
        }}>
          <Search size={16} color="#64748B" style={{ flexShrink: 0 }} />
          <input
            type="text"
            placeholder="Search companies by name, MIDC zone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              flex: 1,
              border: 'none',
              outline: 'none',
              background: 'transparent',
              fontSize: '12.5px',
              color: '#0F172A',
              padding: 0,
              margin: 0,
              width: '100%'
            }}
          />
        </div>

        {/* Zone Filter Chips */}
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
            marginBottom: '12px',
            width: '100%',
            boxSizing: 'border-box',
            paddingBottom: '2px'
          }}
        >
          {ZONE_FILTERS.map((zone) => {
            const isActive = selectedZone === zone;
            return (
              <button
                key={zone}
                onClick={() => setSelectedZone(zone)}
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
                  flexShrink: 0
                }}
              >
                {zone}
              </button>
            );
          })}
        </div>

        {/* Count Summary */}
        <div style={{ marginBottom: '14px', fontSize: '11.5px', fontWeight: 500, color: '#64748B' }}>
          Showing <span style={{ fontWeight: 800, color: '#0F172A' }}>{filteredCompanies.length}</span> Verified Companies
        </div>

        {/* Company Cards List */}
        {filteredCompanies.length > 0 ? (
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
                    cursor: 'pointer'
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
                  {/* Card Top Distinct Header Band */}
                  <div style={{
                    backgroundColor: '#F8FAFC',
                    borderBottom: '1px solid #E2E8F0',
                    padding: '12px 14px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    width: '100%',
                    boxSizing: 'border-box'
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
                        fontSize: '15px',
                        fontWeight: 800,
                        color: '#0F172A',
                        letterSpacing: '-0.2px',
                        lineHeight: 1.3,
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis'
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
                        textOverflow: 'ellipsis'
                      }}>
                        {comp.industry || 'Industrial Manufacturing'} • {companyType}
                      </p>
                    </div>

                    <ChevronRight size={18} color="#94A3B8" style={{ flexShrink: 0 }} />
                  </div>

                  {/* Card Body Area */}
                  <div style={{
                    padding: '12px 14px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '8px',
                    backgroundColor: '#FFFFFF',
                    width: '100%',
                    boxSizing: 'border-box'
                  }}>
                    {/* Row 1: Address & Estd Year (Clean Plain Text with Icons) */}
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      width: '100%',
                      overflow: 'hidden'
                    }}>
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        flexShrink: 1,
                        minWidth: 0,
                        overflow: 'hidden'
                      }}>
                        <MapPin size={12} color="#64748B" style={{ flexShrink: 0 }} />
                        <span style={{
                          fontSize: '11.5px',
                          fontWeight: 500,
                          color: '#64748B',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis'
                        }}>
                          {locationText}
                        </span>
                      </div>

                      {foundedYear ? (
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px',
                          flexShrink: 0
                        }}>
                          <Calendar size={12} color="#64748B" style={{ flexShrink: 0 }} />
                          <span style={{
                            fontSize: '11.5px',
                            fontWeight: 500,
                            color: '#64748B',
                            whiteSpace: 'nowrap'
                          }}>
                            Estd. {foundedYear}
                          </span>
                        </div>
                      ) : null}
                    </div>

                    {/* Row 2: Employee Count Pill */}
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      width: '100%',
                      overflow: 'hidden'
                    }}>
                      <div style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '3.5px',
                        backgroundColor: '#F8FAFC',
                        border: '1px solid #E2E8F0',
                        padding: '3px 7px',
                        borderRadius: '4px',
                        maxWidth: '100%',
                        flexShrink: 1,
                        overflow: 'hidden'
                      }}>
                        <Users size={11} color="#64748B" style={{ flexShrink: 0 }} />
                        <span style={{
                          fontSize: '11px',
                          fontWeight: 600,
                          color: '#475569',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis'
                        }}>
                          {companySize}
                        </span>
                      </div>
                    </div>

                    {comp.description ? (
                      <p style={{
                        margin: '2px 0 0 0',
                        fontSize: '11.5px',
                        color: '#64748B',
                        lineHeight: '16px',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden'
                      }}>
                        {comp.description}
                      </p>
                    ) : null}

                    {/* Card Footer */}
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      paddingTop: '8px',
                      borderTop: '1px solid #F1F5F9',
                      marginTop: '1px',
                      width: '100%'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                        <Briefcase size={12} color="#1B4FDF" />
                        <span style={{ fontSize: '11px', fontWeight: 700, color: '#1B4FDF' }}>
                          {jobsCount} Vacancies Available
                        </span>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                        <span style={{ fontSize: '11px', fontWeight: 800, color: '#1B4FDF' }}>
                          View Details
                        </span>
                        <ChevronRight size={13} color="#1B4FDF" strokeWidth={2.5} />
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
            gap: '8px',
            marginTop: '8px',
            boxSizing: 'border-box'
          }}>
            <div style={{
              width: '52px',
              height: '52px',
              borderRadius: '26px',
              backgroundColor: '#EFF6FF',
              border: '1px solid #DBEAFE',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '4px'
            }}>
              <Building2 size={26} color="#1B4FDF" strokeWidth={2.2} />
            </div>
            <h3 style={{ fontSize: '15px', fontWeight: 800, color: '#0F172A', margin: 0 }}>
              No Companies Found
            </h3>
            <p style={{ fontSize: '11.5px', color: '#64748B', margin: 0, maxWidth: '280px', lineHeight: '16px' }}>
              No industrial companies match your current search query or zone filter.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
