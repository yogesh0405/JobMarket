import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { LayoutGrid, List, Map, MapPin } from 'lucide-react';
import { useJobs, JobFilters } from '../../hooks/useJobs';
import { useAuth } from '../../hooks/useAuth';
import { JobCard } from '../../components/job/JobCard';
import { CompanyDefaultLogo } from '../../components/company/CompanyDefaultLogo';
import { formatNumber, getCompanyColor } from '../../utils/helpers';
import { useStore } from '../../store/useStore';
import { useTranslation } from '../../utils/translations';
import { MobileSearchOverlay } from '../../components/search/MobileSearchOverlay';

export const JobSearchPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { getJobs } = useJobs();
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const { state } = useStore();
  const t = useTranslation(state.language);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [searchOverlayOpen, setSearchOverlayOpen] = useState(false);

  const viewParam = searchParams.get('view');
  const [viewMode, setViewMode] = useState<'grid' | 'list' | 'map'>(
    viewParam === 'list' || viewParam === 'map' ? viewParam : 'grid'
  );

  useEffect(() => {
    if (viewParam === 'grid' || viewParam === 'list' || viewParam === 'map') {
      setViewMode(viewParam);
    }
  }, [viewParam]);

  const industries = [
    "Manufacturing",
    "Automotive",
    "Electricals",
    "Healthcare",
    "Education",
    "IT & Software",
    "Logistics",
    "Construction",
    "FMCG",
    "Agriculture",
    "Mechanical & Assembly"
  ];

  const educations = [
    "10th Pass",
    "12th Pass",
    "ITI",
    "Diploma",
    "Graduate",
    "Post Graduate / Master's",
    "Doctorate / PhD",
    "Others"
  ];

  // Lock background scroll on mobile filters drawer open
  useEffect(() => {
    if (mobileFiltersOpen) {
      document.body.style.overflow = 'hidden';
      document.documentElement.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
    };
  }, [mobileFiltersOpen]);

  // Parse custom parameters for industrial fields
  const midcFilter = searchParams.get('midc') || '';
  const tradeFilter = searchParams.get('trade') || '';
  const canteenFilter = searchParams.get('canteen') === 'true';
  const busFilter = searchParams.get('bus') === 'true';
  const hostelFilter = searchParams.get('hostel') === 'true';
  const otFilter = searchParams.get('ot') === 'true';
  
  // Extra categories filters from PlacementIndia screenshot
  const walkinFilter = searchParams.get('walkin') === 'true';
  const femaleFilter = searchParams.get('female') === 'true';
  const nightShiftFilter = searchParams.get('nightShift') === 'true';
  const partTimeFilter = searchParams.get('partTime') === 'true';
  const fresherFilter = searchParams.get('fresher') === 'true';
  const postedByFilter = searchParams.get('postedBy') || '';
  const educationFilter = searchParams.get('education') || '';
  const departmentFilter = searchParams.get('department') || '';
  const companyTypeFilter = searchParams.get('companyType') || '';
  const roleCategoryFilter = searchParams.get('roleCategory') || '';
  const stipendFilter = searchParams.get('stipend') === 'true';
  const durationFilter = searchParams.get('duration') || '';
  const durationMaxParam = searchParams.get('durationMax');
  const durationMoreFilter = searchParams.get('durationMore') === 'true';
  const topCompaniesFilter = searchParams.get('topCompanies') || '';
  const freshnessFilter = searchParams.get('freshness') || '';

  const getFiltersFromParams = (): JobFilters => {
    const filters: JobFilters = {};
    if (searchParams.get('keyword')) filters.keyword = searchParams.get('keyword')!;
    if (searchParams.get('location')) filters.location = searchParams.get('location')!;
    if (searchParams.get('experience')) filters.experience = searchParams.get('experience')!;
    if (searchParams.get('salaryMin')) filters.salaryMin = searchParams.get('salaryMin')!;
    if (searchParams.get('industry')) filters.industry = searchParams.get('industry')!;
    if (searchParams.get('sort')) filters.sort = searchParams.get('sort')!;
    if (searchParams.get('workMode')) filters.workMode = searchParams.get('workMode')!;
    return filters;
  };

  const filters = getFiltersFromParams();

  // Perform filtering including new industrial parameters
  let allFilteredJobs = getJobs(filters);

  if (midcFilter) {
    allFilteredJobs = allFilteredJobs.filter(j => j.midcZone === midcFilter);
  }
  if (tradeFilter) {
    allFilteredJobs = allFilteredJobs.filter(j => j.trade === tradeFilter);
  }
  if (canteenFilter) {
    allFilteredJobs = allFilteredJobs.filter(j => j.canteen);
  }
  if (busFilter) {
    allFilteredJobs = allFilteredJobs.filter(j => j.busFacility);
  }
  if (hostelFilter) {
    allFilteredJobs = allFilteredJobs.filter(j => j.accommodation);
  }
  if (otFilter) {
    allFilteredJobs = allFilteredJobs.filter(j => j.overtime);
  }
  if (walkinFilter) {
    allFilteredJobs = allFilteredJobs.filter(j => !!j.walkInDate);
  }
  if (femaleFilter) {
    allFilteredJobs = allFilteredJobs.filter(j => j.gender === 'Female' || j.gender === 'Any');
  }
  if (nightShiftFilter) {
    allFilteredJobs = allFilteredJobs.filter(j => j.shiftDetails && j.shiftDetails.toLowerCase().includes('night'));
  }
  if (partTimeFilter) {
    allFilteredJobs = allFilteredJobs.filter(j => j.jobType === 'Part-Time');
  }
  if (fresherFilter) {
    allFilteredJobs = allFilteredJobs.filter(j => j.minExperience === 0);
  }
  if (postedByFilter) {
    const pBy = postedByFilter.toLowerCase().split(',');
    allFilteredJobs = allFilteredJobs.filter(j => {
      return pBy.some(p => {
        const isCorp = j.company.toLowerCase().includes('tata') || j.company.toLowerCase().includes('endurance');
        if (p === 'company') return isCorp;
        if (p === 'consultant') return !isCorp;
        return false;
      });
    });
  }

  // Department filter matching
  if (departmentFilter) {
    const depts = departmentFilter.split(',');
    allFilteredJobs = allFilteredJobs.filter(j => {
      return depts.some(dept => {
        const d = dept.toLowerCase();
        if (d === 'production') {
          return j.title.toLowerCase().includes('production') || 
                 j.title.toLowerCase().includes('operator') || 
                 j.title.toLowerCase().includes('welder') || 
                 j.title.toLowerCase().includes('fitter') ||
                 j.title.toLowerCase().includes('cnc') ||
                 j.title.toLowerCase().includes('machinist') ||
                 j.description.toLowerCase().includes('production') ||
                 j.description.toLowerCase().includes('assemble') ||
                 (j.industry && j.industry.toLowerCase().includes('manufacturing'));
        }
        if (d === 'maintenance') {
          return j.title.toLowerCase().includes('maintenance') || 
                 j.title.toLowerCase().includes('electrician') || 
                 j.title.toLowerCase().includes('service') || 
                 j.title.toLowerCase().includes('technician') ||
                 j.description.toLowerCase().includes('maintenance') ||
                 j.description.toLowerCase().includes('repair');
        }
        if (d === 'quality control') {
          return j.title.toLowerCase().includes('quality') || 
                 j.title.toLowerCase().includes('inspector') || 
                 j.title.toLowerCase().includes('qc') || 
                 j.title.toLowerCase().includes('testing') ||
                 j.description.toLowerCase().includes('quality') ||
                 j.description.toLowerCase().includes('inspect');
        }
        return false;
      });
    });
  }

  // Company Type filter matching
  if (companyTypeFilter) {
    const types = companyTypeFilter.split(',');
    allFilteredJobs = allFilteredJobs.filter(j => {
      return types.some(type => {
        const t = type.toLowerCase();
        const isCorp = j.company.toLowerCase().includes('tata') || 
                       j.company.toLowerCase().includes('john deere') || 
                       j.company.toLowerCase().includes('thermax') || 
                       j.company.toLowerCase().includes('varroc') || 
                       j.company.toLowerCase().includes('bharat forge') || 
                       j.company.toLowerCase().includes('endurance') || 
                       j.company.toLowerCase().includes('mnc') || 
                       j.company.toLowerCase().includes('corporation');
        if (t.includes('corporate') || t.includes('mnc')) {
          return isCorp;
        }
        if (t.includes('msme') || t.includes('factory')) {
          return !isCorp;
        }
        return false;
      });
    });
  }

  // Role Category filter matching
  if (roleCategoryFilter) {
    const roles = roleCategoryFilter.split(',');
    allFilteredJobs = allFilteredJobs.filter(j => {
      return roles.some(role => {
        const r = role.toLowerCase();
        if (r.includes('operator') || r.includes('technical')) {
          return j.trade === 'CNC Operator' || 
                 j.trade === 'Welder' || 
                 j.trade === 'Electrician' || 
                 j.trade === 'Machinist' || 
                 j.trade === 'Fitter' || 
                 j.title.toLowerCase().includes('operator') || 
                 j.title.toLowerCase().includes('cnc') || 
                 j.title.toLowerCase().includes('technician') ||
                 j.title.toLowerCase().includes('welder');
        }
        if (r.includes('helper') || r.includes('unskilled')) {
          return j.trade === 'Helper' || 
                 j.title.toLowerCase().includes('helper') || 
                 j.title.toLowerCase().includes('loader') || 
                 j.title.toLowerCase().includes('unskilled') ||
                 j.title.toLowerCase().includes('assistant');
        }
        return false;
      });
    });
  }

  // Stipend filter matching
  if (stipendFilter) {
    allFilteredJobs = allFilteredJobs.filter(j => 
      (j.jobType as string) === 'Internship' || 
      (j.salaryMin && j.salaryMin > 0) || 
      j.description.toLowerCase().includes('stipend') || 
      j.description.toLowerCase().includes('apprentice')
    );
  }

  // Duration filter matching (0 to 5 Range Slider + More than 5 Years option)
  const durationMaxVal = durationMaxParam !== null ? parseInt(durationMaxParam, 10) : null;

  if (durationMaxVal !== null || durationMoreFilter || durationFilter) {
    allFilteredJobs = allFilteredJobs.filter(j => {
      let matches = false;

      const minExp = j.minExperience ?? 0;
      const maxExp = j.maxExperience ?? j.minExperience ?? 0;
      const contractStr = (j.contractDuration || '').toLowerCase();

      // 1. Slider match (0 to 5 Years)
      if (durationMaxVal !== null) {
        if (minExp <= durationMaxVal) {
          matches = true;
        }
      }

      // 2. More than 5 Years option match
      if (durationMoreFilter) {
        if (minExp >= 5 || maxExp > 5 || contractStr.includes('permanent') || contractStr.includes('6') || contractStr.includes('year')) {
          matches = true;
        }
      }

      // 3. Legacy duration string options (1-3 Months, 6 Months+)
      if (durationFilter) {
        const durs = durationFilter.split(',');
        if (durs.some(dur => {
          const d = dur.toLowerCase();
          if (d.includes('1-3')) return contractStr.includes('1') || contractStr.includes('2') || contractStr.includes('3');
          if (d.includes('6')) return contractStr.includes('6') || contractStr.includes('12') || contractStr.includes('year') || !j.contractDuration;
          return false;
        })) {
          matches = true;
        }
      }

      return matches;
    });
  }

  // Top Companies filter matching
  if (topCompaniesFilter) {
    const cos = topCompaniesFilter.split(',');
    allFilteredJobs = allFilteredJobs.filter(j => {
      return cos.some(co => j.company.toLowerCase().includes(co.toLowerCase()));
    });
  }

  // Freshness filter matching
  if (freshnessFilter) {
    const fresh = freshnessFilter.split(',');
    allFilteredJobs = allFilteredJobs.filter(j => {
      const postedDate = new Date(j.postedAt);
      const diffTime = Math.abs(new Date().getTime() - postedDate.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return fresh.some(f => {
        const fLower = f.toLowerCase();
        if (fLower.includes('24') || fLower.includes('1')) {
          return diffDays <= 1;
        }
        if (fLower.includes('3')) {
          return diffDays <= 3;
        }
        return false;
      });
    });
  }

  if (educationFilter) {
    const eds = educationFilter.toLowerCase().split(',');
    allFilteredJobs = allFilteredJobs.filter(j => {
      const jobEdu = (j.educationRequirement || (j as any).education_requirement || (typeof (j as any).education === 'string' ? (j as any).education : '')).toLowerCase();
      if (jobEdu) {
        if (eds.some(ed => jobEdu.includes(ed) || ed.includes(jobEdu))) return true;
      }
      return eds.some(ed => {
        const title = j.title.toLowerCase();
        const desc = j.description.toLowerCase();
        const reqs = (j.requirements || []).join(' ').toLowerCase();
        
        if (ed.includes('10th')) {
          return title.includes('10th') || desc.includes('10th') || reqs.includes('10th') || desc.includes('matric') || reqs.includes('matric') || desc.includes('ssc') || reqs.includes('ssc');
        }
        if (ed.includes('12th')) {
          return title.includes('12th') || desc.includes('12th') || reqs.includes('12th') || desc.includes('hsc') || reqs.includes('hsc');
        }
        if (ed.includes('iti')) {
          return title.includes('iti') || desc.includes('iti') || reqs.includes('iti');
        }
        if (ed.includes('diploma')) {
          return title.includes('diploma') || desc.includes('diploma') || reqs.includes('diploma');
        }
        if (ed.includes('graduate')) {
          return title.includes('graduate') || desc.includes('graduate') || reqs.includes('graduate') || title.includes('degree') || desc.includes('degree') || reqs.includes('degree') || title.includes('b.e') || title.includes('b.tech') || reqs.includes('b.tech') || reqs.includes('b.e');
        }
        return title.includes(ed) || desc.includes(ed) || reqs.includes(ed);
      });
    });
  }

  const [visibleCount, setVisibleCount] = useState(10);

  useEffect(() => {
    setVisibleCount(10);
  }, [searchParams]);

  useEffect(() => {
    const handleScroll = () => {
      if (
        window.innerHeight + document.documentElement.scrollTop
        >= document.documentElement.offsetHeight - 250
      ) {
        setVisibleCount(prev => Math.min(prev + 10, allFilteredJobs.length));
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [allFilteredJobs.length]);

  const pagedJobs = allFilteredJobs.slice(0, visibleCount);

  // Accordion Sections State
  const [openSections, setOpenSections] = useState<Record<string, boolean>>(() => {
    const hash = window.location.hash || '';
    const hashQuery = hash.includes('?') ? hash.split('?')[1] : '';
    const urlParams = new URLSearchParams(hashQuery || window.location.search);
    return {
      experience: urlParams.has('experience') || urlParams.has('fresher'),
      workMode: urlParams.has('workMode') || urlParams.has('partTime'),
      department: urlParams.has('department'),
      location: urlParams.has('location'),
      salary: urlParams.has('salaryMin'),
      companyType: urlParams.has('companyType'),
      roleCategory: urlParams.has('roleCategory'),
      stipend: urlParams.has('stipend'),
      duration: urlParams.has('duration'),
      education: urlParams.has('education'),
      postedBy: urlParams.has('postedBy'),
      industry: urlParams.has('industry'),
      topCompanies: urlParams.has('topCompanies'),
      freshness: urlParams.has('freshness')
    };
  });

  useEffect(() => {
    setOpenSections(prev => {
      const next = { ...prev };
      if (searchParams.get('experience') || searchParams.get('fresher') === 'true') next.experience = true;
      if (searchParams.get('workMode') || searchParams.get('partTime') === 'true') next.workMode = true;
      if (searchParams.get('department')) next.department = true;
      if (searchParams.get('location')) next.location = true;
      if (searchParams.get('salaryMin')) next.salary = true;
      if (searchParams.get('companyType')) next.companyType = true;
      if (searchParams.get('roleCategory')) next.roleCategory = true;
      if (searchParams.get('stipend') === 'true') next.stipend = true;
      if (searchParams.get('duration')) next.duration = true;
      if (searchParams.get('education')) next.education = true;
      if (searchParams.get('postedBy')) next.postedBy = true;
      if (searchParams.get('industry')) next.industry = true;
      if (searchParams.get('topCompanies')) next.topCompanies = true;
      if (searchParams.get('freshness')) next.freshness = true;
      return next;
    });
  }, [searchParams]);

  const toggleSection = (section: string) => {
    setOpenSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const updateFiltersInParams = (newFilters: Record<string, string | null>) => {
    const nextParams = new URLSearchParams(searchParams);
    
    Object.entries(newFilters).forEach(([key, val]) => {
      if (val === undefined || val === null || val === '') {
        nextParams.delete(key);
      } else {
        nextParams.set(key, String(val));
      }
    });

    nextParams.delete('page');
    setSearchParams(nextParams);
  };

  const toggleToggleFilter = (key: string, currentValue: boolean) => {
    updateFiltersInParams({ [key]: currentValue ? null : 'true' });
  };

  const toggleMultiSelectFilter = (key: string, value: string) => {
    const nextParams = new URLSearchParams(searchParams);
    const currentVal = nextParams.get(key) || '';
    let values = currentVal ? currentVal.split(',') : [];

    if (values.includes(value)) {
      values = values.filter(v => v !== value);
    } else {
      values.push(value);
    }

    if (values.length === 0) {
      nextParams.delete(key);
    } else {
      nextParams.set(key, values.join(','));
    }

    nextParams.delete('page');
    setSearchParams(nextParams);
  };

  const clearAllFilters = () => {
    setSearchParams(new URLSearchParams());
  };

  // Top Category Pills configuration with relevant professional SVG icons
  const topCategories = [
    {
      label: 'All Jobs',
      value: '',
      icon: (
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
          <rect x="2" y="7" width="20" height="14" rx="2" ry="2"/>
          <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>
        </svg>
      )
    },
    {
      label: 'HR Jobs',
      value: 'HR',
      icon: (
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
          <circle cx="9" cy="7" r="4"/>
          <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
          <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
        </svg>
      )
    },
    {
      label: 'Marketing Jobs',
      value: 'Marketing',
      icon: (
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
          <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/>
          <polyline points="17 6 23 6 23 12"/>
        </svg>
      )
    },
    {
      label: 'Remote Jobs',
      value: 'Remote',
      icon: (
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
          <rect x="2" y="3" width="20" height="14" rx="2" ry="2"/>
          <line x1="8" y1="21" x2="16" y2="21"/>
          <line x1="12" y1="17" x2="12" y2="21"/>
        </svg>
      )
    },
    {
      label: 'Data Science Jobs',
      value: 'Data Science',
      icon: (
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
          <line x1="18" y1="20" x2="18" y2="10"/>
          <line x1="12" y1="20" x2="12" y2="4"/>
          <line x1="6" y1="20" x2="6" y2="14"/>
        </svg>
      )
    },
    {
      label: 'Engineering Jobs',
      value: 'Engineer',
      icon: (
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
          <rect x="4" y="4" width="16" height="16" rx="2" ry="2"/>
          <rect x="9" y="9" width="6" height="6"/>
          <line x1="9" y1="1" x2="9" y2="4"/>
          <line x1="15" y1="1" x2="15" y2="4"/>
          <line x1="9" y1="20" x2="9" y2="23"/>
          <line x1="15" y1="20" x2="15" y2="23"/>
          <line x1="20" y1="9" x2="23" y2="9"/>
          <line x1="20" y1="15" x2="23" y2="15"/>
          <line x1="1" y1="9" x2="4" y2="9"/>
          <line x1="1" y1="15" x2="4" y2="15"/>
        </svg>
      )
    },
    {
      label: 'Foreign MNCs Jobs',
      value: 'MNC',
      icon: (
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
          <circle cx="12" cy="12" r="10"/>
          <line x1="2" y1="12" x2="22" y2="12"/>
          <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
        </svg>
      )
    },
    {
      label: 'Banking & Finance Jobs',
      value: 'Finance',
      icon: (
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
          <line x1="12" y1="1" x2="12" y2="23"/>
          <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
        </svg>
      )
    }
  ];

  const renderSidebar = () => {
    return (
      <>
        {mobileFiltersOpen && (
          <div
            className="mobile-filter-backdrop"
            onClick={() => setMobileFiltersOpen(false)}
          />
        )}
        <aside
          className={`jobs-sidebar ${mobileFiltersOpen ? 'open' : ''}`}
          style={{ background: '#ffffff', border: '1.5px solid #CBD5E1', borderRadius: '0px' }}
        >
          <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', borderBottom: '1px solid #E2E8F0', position: 'sticky', top: 0, background: '#ffffff', zIndex: 5 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                {/* Close Button for Mobile Drawer */}
                <button
                  className="mobile-filter-close"
                  onClick={() => setMobileFiltersOpen(false)}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    padding: '4px',
                    cursor: 'pointer',
                    color: '#64748B',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                  </svg>
                </button>
                <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#0F172A', margin: 0 }}>All Filters</h3>
              </div>
              <span style={{ fontSize: '13px', color: '#2563EB', fontWeight: '700', cursor: 'pointer' }} onClick={clearAllFilters}>
                Clear All
              </span>
            </div>
    
                {/* Keyword Search Input */}
                <div style={{ padding: '16px', borderBottom: '1px solid #E2E8F0' }}>
                  <label style={{ fontSize: '13px', fontWeight: '700', color: '#475569', display: 'block', marginBottom: '8px' }}>
                    Keyword
                  </label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. Tata, CNC, Pune"
                    value={searchParams.get('keyword') || ''}
                    style={{ borderRadius: '0.3rem', border: '1.5px solid #E2E8F0', padding: '8px 12px', width: '100%', fontSize: '13.5px' }}
                    onChange={(e) => updateFiltersInParams({ keyword: e.target.value })}
                  />
                </div>
    
                {/* 1. Experience Collapsible */}
                <div style={{ borderBottom: '1px solid #E2E8F0', padding: '16px' }}>
                  <div onClick={() => toggleSection('experience')} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', fontWeight: '700', fontSize: '14px', color: '#0F172A' }}>
                    <span>Experience</span>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#64748B" strokeWidth="2.5" style={{ transform: openSections.experience ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }}>
                      <polyline points="6 9 12 15 18 9" />
                    </svg>
                  </div>
                  {openSections.experience && (
                    <div style={{ marginTop: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13.5px', color: '#475569', cursor: 'pointer' }}>
                        <input type="radio" name="exp" checked={!searchParams.get('experience')} onChange={() => updateFiltersInParams({ experience: null })} />
                        Any Experience
                      </label>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13.5px', color: '#475569', cursor: 'pointer' }}>
                        <input type="radio" name="exp" checked={searchParams.get('experience') === '0'} onChange={() => updateFiltersInParams({ experience: '0' })} />
                        Freshers (0 Years)
                      </label>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13.5px', color: '#475569', cursor: 'pointer' }}>
                        <input type="radio" name="exp" checked={searchParams.get('experience') === '2'} onChange={() => updateFiltersInParams({ experience: '2' })} />
                        1-3 Years
                      </label>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13.5px', color: '#475569', cursor: 'pointer' }}>
                        <input type="radio" name="exp" checked={searchParams.get('experience') === '3'} onChange={() => updateFiltersInParams({ experience: '3' })} />
                        3-5 Years
                      </label>
                    </div>
                  )}
                </div>
    
                {/* 2. Work Mode Collapsible */}
                <div style={{ borderBottom: '1px solid #E2E8F0', padding: '16px' }}>
                  <div onClick={() => toggleSection('workMode')} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', fontWeight: '700', fontSize: '14px', color: '#0F172A' }}>
                    <span>Work mode</span>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#64748B" strokeWidth="2.5" style={{ transform: openSections.workMode ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }}>
                      <polyline points="6 9 12 15 18 9" />
                    </svg>
                  </div>
                  {openSections.workMode && (
                    <div style={{ marginTop: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13.5px', color: '#475569', cursor: 'pointer' }}>
                        <input type="checkbox" checked={(searchParams.get('workMode') || '').split(',').includes('Onsite')} onChange={() => toggleMultiSelectFilter('workMode', 'Onsite')} />
                        Onsite
                      </label>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13.5px', color: '#475569', cursor: 'pointer' }}>
                        <input type="checkbox" checked={(searchParams.get('workMode') || '').split(',').includes('Remote')} onChange={() => toggleMultiSelectFilter('workMode', 'Remote')} />
                        Remote
                      </label>
                    </div>
                  )}
                </div>
    
                {/* 3. Department Collapsible */}
                <div style={{ borderBottom: '1px solid #E2E8F0', padding: '16px' }}>
                  <div onClick={() => toggleSection('department')} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', fontWeight: '700', fontSize: '14px', color: '#0F172A' }}>
                    <span>Department</span>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#64748B" strokeWidth="2.5" style={{ transform: openSections.department ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }}>
                      <polyline points="6 9 12 15 18 9" />
                    </svg>
                  </div>
                  {openSections.department && (
                    <div style={{ marginTop: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13.5px', color: '#475569', cursor: 'pointer' }}>
                        <input type="checkbox" checked={(searchParams.get('department') || '').split(',').includes('Production')} onChange={() => toggleMultiSelectFilter('department', 'Production')} />
                        Production
                      </label>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13.5px', color: '#475569', cursor: 'pointer' }}>
                        <input type="checkbox" checked={(searchParams.get('department') || '').split(',').includes('Maintenance')} onChange={() => toggleMultiSelectFilter('department', 'Maintenance')} />
                        Maintenance
                      </label>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13.5px', color: '#475569', cursor: 'pointer' }}>
                        <input type="checkbox" checked={(searchParams.get('department') || '').split(',').includes('Quality Control')} onChange={() => toggleMultiSelectFilter('department', 'Quality Control')} />
                        Quality Control
                      </label>
                    </div>
                  )}
                </div>
    
                {/* 4. Location Collapsible */}
                <div style={{ borderBottom: '1px solid #E2E8F0', padding: '16px' }}>
                  <div onClick={() => toggleSection('location')} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', fontWeight: '700', fontSize: '14px', color: '#0F172A' }}>
                    <span>Location</span>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#64748B" strokeWidth="2.5" style={{ transform: openSections.location ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }}>
                      <polyline points="6 9 12 15 18 9" />
                    </svg>
                  </div>
                  {openSections.location && (
                    <div style={{ marginTop: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {['Pune', 'Mumbai', 'Aurangabad', 'Nagpur'].map(loc => (
                        <label key={loc} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13.5px', color: '#475569', cursor: 'pointer' }}>
                          <input type="checkbox" checked={(searchParams.get('location') || '').split(',').includes(loc)} onChange={() => toggleMultiSelectFilter('location', loc)} />
                          {loc}
                        </label>
                      ))}
                    </div>
                  )}
                </div>
    
                {/* 5. Salary Collapsible */}
                <div style={{ borderBottom: '1px solid #E2E8F0', padding: '16px' }}>
                  <div onClick={() => toggleSection('salary')} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', fontWeight: '700', fontSize: '14px', color: '#0F172A' }}>
                    <span>Salary</span>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#64748B" strokeWidth="2.5" style={{ transform: openSections.salary ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }}>
                      <polyline points="6 9 12 15 18 9" />
                    </svg>
                  </div>
                  {openSections.salary && (
                    <div style={{ marginTop: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13.5px', color: '#475569', cursor: 'pointer' }}>
                        <input type="radio" name="salary" checked={!searchParams.get('salaryMin')} onChange={() => updateFiltersInParams({ salaryMin: null })} />
                        Any Salary
                      </label>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13.5px', color: '#475569', cursor: 'pointer' }}>
                        <input type="radio" name="salary" checked={searchParams.get('salaryMin') === '120000'} onChange={() => updateFiltersInParams({ salaryMin: '120000' })} />
                        ₹1.2 LPA+ (₹10k/mo)
                      </label>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13.5px', color: '#475569', cursor: 'pointer' }}>
                        <input type="radio" name="salary" checked={searchParams.get('salaryMin') === '180000'} onChange={() => updateFiltersInParams({ salaryMin: '180000' })} />
                        ₹1.8 LPA+ (₹15k/mo)
                      </label>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13.5px', color: '#475569', cursor: 'pointer' }}>
                        <input type="radio" name="salary" checked={searchParams.get('salaryMin') === '240000'} onChange={() => updateFiltersInParams({ salaryMin: '240000' })} />
                        ₹2.4 LPA+ (₹20k/mo)
                      </label>
                    </div>
                  )}
                </div>
    
                {/* 6. Company Type Collapsible */}
                <div style={{ borderBottom: '1px solid #E2E8F0', padding: '16px' }}>
                  <div onClick={() => toggleSection('companyType')} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', fontWeight: '700', fontSize: '14px', color: '#0F172A' }}>
                    <span>Company type</span>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#64748B" strokeWidth="2.5" style={{ transform: openSections.companyType ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }}>
                      <polyline points="6 9 12 15 18 9" />
                    </svg>
                  </div>
                  {openSections.companyType && (
                    <div style={{ marginTop: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13.5px', color: '#475569', cursor: 'pointer' }}>
                        <input type="checkbox" checked={(searchParams.get('companyType') || '').split(',').includes('Corporate MNC')} onChange={() => toggleMultiSelectFilter('companyType', 'Corporate MNC')} />
                        Corporate MNC
                      </label>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13.5px', color: '#475569', cursor: 'pointer' }}>
                        <input type="checkbox" checked={(searchParams.get('companyType') || '').split(',').includes('MSME Factory')} onChange={() => toggleMultiSelectFilter('companyType', 'MSME Factory')} />
                        MSME Factory
                      </label>
                    </div>
                  )}
                </div>
    
                {/* 7. Role Category Collapsible */}
                <div style={{ borderBottom: '1px solid #E2E8F0', padding: '16px' }}>
                  <div onClick={() => toggleSection('roleCategory')} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', fontWeight: '700', fontSize: '14px', color: '#0F172A' }}>
                    <span>Role category</span>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#64748B" strokeWidth="2.5" style={{ transform: openSections.roleCategory ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }}>
                      <polyline points="6 9 12 15 18 9" />
                    </svg>
                  </div>
                  {openSections.roleCategory && (
                    <div style={{ marginTop: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13.5px', color: '#475569', cursor: 'pointer' }}>
                        <input type="checkbox" checked={(searchParams.get('roleCategory') || '').split(',').includes('Technical Operator')} onChange={() => toggleMultiSelectFilter('roleCategory', 'Technical Operator')} />
                        Technical Operator
                      </label>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13.5px', color: '#475569', cursor: 'pointer' }}>
                        <input type="checkbox" checked={(searchParams.get('roleCategory') || '').split(',').includes('Helper / Unskilled')} onChange={() => toggleMultiSelectFilter('roleCategory', 'Helper / Unskilled')} />
                        Helper / Unskilled
                      </label>
                    </div>
                  )}
                </div>
    
                {/* 8. Stipend Collapsible */}
                <div style={{ borderBottom: '1px solid #E2E8F0', padding: '16px' }}>
                  <div onClick={() => toggleSection('stipend')} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', fontWeight: '700', fontSize: '14px', color: '#0F172A' }}>
                    <span>Stipend</span>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#64748B" strokeWidth="2.5" style={{ transform: openSections.stipend ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }}>
                      <polyline points="6 9 12 15 18 9" />
                    </svg>
                  </div>
                  {openSections.stipend && (
                    <div style={{ marginTop: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13.5px', color: '#475569', cursor: 'pointer' }}>
                        <input type="checkbox" checked={searchParams.get('stipend') === 'true'} onChange={(e) => updateFiltersInParams({ stipend: e.target.checked ? 'true' : null })} />
                        Paid Stipend
                      </label>
                    </div>
                  )}
                </div>
    
                {/* 9. Duration Collapsible (Range Slider 0-5 + More than 5 Option) */}
                <div style={{ borderBottom: '1px solid #E2E8F0', padding: '16px' }}>
                  <div onClick={() => toggleSection('duration')} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', fontWeight: '700', fontSize: '14px', color: '#0F172A' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span>Duration</span>
                    </div>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#64748B" strokeWidth="2.5" style={{ transform: openSections.duration ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }}>
                      <polyline points="6 9 12 15 18 9" />
                    </svg>
                  </div>
                  
                  {openSections.duration && (
                    <div style={{ marginTop: '14px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                      {/* Current Selected Value Header Badge */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#F8FAFC', padding: '8px 12px', borderRadius: '6px', border: '1px solid #E2E8F0' }}>
                        <span style={{ fontSize: '12px', fontWeight: '600', color: '#64748B' }}>Selected Range:</span>
                        <span style={{ fontSize: '13px', fontWeight: '700', color: '#2563EB' }}>
                          {durationMaxParam !== null && durationMoreFilter
                            ? `0 - 5+ Years`
                            : durationMaxParam !== null
                            ? `0 - ${durationMaxParam} ${Number(durationMaxParam) === 1 ? 'Year' : 'Years'}`
                            : durationMoreFilter
                            ? `> 5 Years (5+ Yrs)`
                            : `All Durations`}
                        </span>
                      </div>

                      {/* Slider Control Container */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#64748B', fontWeight: '600' }}>
                          <span>0 Yrs</span>
                          <span>Max: {durationMaxParam !== null ? `${durationMaxParam} Yrs` : 'Any'}</span>
                          <span>5 Yrs</span>
                        </div>

                        <input
                          type="range"
                          min="0"
                          max="5"
                          step="1"
                          value={durationMaxParam !== null ? durationMaxParam : '5'}
                          onChange={(e) => {
                            const val = e.target.value;
                            updateFiltersInParams({ durationMax: val });
                          }}
                          style={{
                            width: '100%',
                            height: '6px',
                            borderRadius: '3px',
                            background: `linear-gradient(to right, #2563eb 0%, #2563eb ${(Number(durationMaxParam !== null ? durationMaxParam : 5) / 5) * 100}%, #e2e8f0 ${(Number(durationMaxParam !== null ? durationMaxParam : 5) / 5) * 100}%, #e2e8f0 100%)`,
                            appearance: 'none',
                            outline: 'none',
                            cursor: 'pointer'
                          }}
                        />

                        {/* Slider Tick Marks */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0 2px', fontSize: '11px', color: '#94A3B8', fontWeight: '500' }}>
                          <span>0</span>
                          <span>1</span>
                          <span>2</span>
                          <span>3</span>
                          <span>4</span>
                          <span>5</span>
                        </div>
                      </div>



                      {/* More than 5 Years Checkbox Option */}
                      <label style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13.5px', color: '#0F172A', fontWeight: '600', cursor: 'pointer' }}>
                        <input
                          type="checkbox"
                          checked={durationMoreFilter}
                          onChange={(e) => {
                            updateFiltersInParams({ durationMore: e.target.checked ? 'true' : null });
                          }}
                          style={{ width: '16px', height: '16px', accentColor: '#2563eb', cursor: 'pointer' }}
                        />
                        <span>More than 5 Years (5+ Years)</span>
                      </label>

                      {/* Clear Duration Filter button if active */}
                      {(durationMaxParam !== null || durationMoreFilter || durationFilter) && (
                        <button
                          type="button"
                          onClick={() => {
                            updateFiltersInParams({ durationMax: null, durationMore: null, duration: null });
                          }}
                          style={{
                            background: 'none',
                            border: 'none',
                            color: '#EF4444',
                            fontSize: '12px',
                            fontWeight: '600',
                            cursor: 'pointer',
                            textAlign: 'left',
                            padding: '0',
                            marginTop: '2px'
                          }}
                        >
                          ✕ Reset Duration Filter
                        </button>
                      )}
                    </div>
                  )}
                </div>
    
                {/* 10. Education Collapsible */}
                <div style={{ borderBottom: '1px solid #E2E8F0', padding: '16px' }}>
                  <div onClick={() => toggleSection('education')} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', fontWeight: '700', fontSize: '14px', color: '#0F172A' }}>
                    <span>Education</span>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#64748B" strokeWidth="2.5" style={{ transform: openSections.education ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }}>
                      <polyline points="6 9 12 15 18 9" />
                    </svg>
                  </div>
                  {openSections.education && (
                    <div style={{ marginTop: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {educations.map(edu => (
                        <label key={edu} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13.5px', color: '#475569', cursor: 'pointer' }}>
                          <input 
                            type="checkbox" 
                            checked={(searchParams.get('education') || '').split(',').includes(edu)} 
                            onChange={() => toggleMultiSelectFilter('education', edu)} 
                          /> 
                          {edu}
                        </label>
                      ))}
                    </div>
                  )}
                </div>
    
                {/* 11. Posted by Accordion (Open by Default) */}
                <div style={{ borderBottom: '1px solid #E2E8F0', padding: '16px' }}>
                  <div onClick={() => toggleSection('postedBy')} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', fontWeight: '700', fontSize: '14px', color: '#0F172A' }}>
                    <span>Posted by</span>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#64748B" strokeWidth="2.5" style={{ transform: openSections.postedBy ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }}>
                      <polyline points="6 9 12 15 18 9" />
                    </svg>
                  </div>
                  {openSections.postedBy && (
                    <div style={{ marginTop: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13.5px', color: '#475569', cursor: 'pointer' }}>
                        <input type="checkbox" checked={(searchParams.get('postedBy') || '').split(',').includes('company')} onChange={() => toggleMultiSelectFilter('postedBy', 'company')} />
                        Company Jobs (75195)
                      </label>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13.5px', color: '#475569', cursor: 'pointer' }}>
                        <input type="checkbox" checked={(searchParams.get('postedBy') || '').split(',').includes('consultant')} onChange={() => toggleMultiSelectFilter('postedBy', 'consultant')} />
                        Consultant Jobs (20497)
                      </label>
                    </div>
                  )}
                </div>
    
                {/* 12. Industry Collapsible */}
                <div style={{ borderBottom: '1px solid #E2E8F0', padding: '16px' }}>
                  <div onClick={() => toggleSection('industry')} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', fontWeight: '700', fontSize: '14px', color: '#0F172A' }}>
                    <span>Industry</span>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#64748B" strokeWidth="2.5" style={{ transform: openSections.industry ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }}>
                      <polyline points="6 9 12 15 18 9" />
                    </svg>
                  </div>
                  {openSections.industry && (
                    <div style={{ marginTop: '12px', display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '200px', overflowY: 'auto' }}>
                      {industries.map(ind => (
                        <label key={ind} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13.5px', color: '#475569', cursor: 'pointer' }}>
                          <input 
                            type="checkbox" 
                            checked={(searchParams.get('industry') || '').split(',').includes(ind)} 
                            onChange={() => toggleMultiSelectFilter('industry', ind)} 
                          />
                          {ind}
                        </label>
                      ))}
                    </div>
                  )}
                </div>
    
                {/* 13. Top Companies Collapsible */}
                <div style={{ borderBottom: '1px solid #E2E8F0', padding: '16px' }}>
                  <div onClick={() => toggleSection('topCompanies')} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', fontWeight: '700', fontSize: '14px', color: '#0F172A' }}>
                    <span>Top companies</span>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#64748B" strokeWidth="2.5" style={{ transform: openSections.topCompanies ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }}>
                      <polyline points="6 9 12 15 18 9" />
                    </svg>
                  </div>
                  {openSections.topCompanies && (
                    <div style={{ marginTop: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13.5px', color: '#475569', cursor: 'pointer' }}>
                        <input type="checkbox" checked={(searchParams.get('topCompanies') || '').split(',').includes('Tata')} onChange={() => toggleMultiSelectFilter('topCompanies', 'Tata')} />
                        Tata AutoComp
                      </label>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13.5px', color: '#475569', cursor: 'pointer' }}>
                        <input type="checkbox" checked={(searchParams.get('topCompanies') || '').split(',').includes('Endurance')} onChange={() => toggleMultiSelectFilter('topCompanies', 'Endurance')} />
                        Endurance
                      </label>
                    </div>
                  )}
                </div>
    
                {/* 14. Freshness Collapsible */}
                <div style={{ padding: '16px' }}>
                  <div onClick={() => toggleSection('freshness')} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', fontWeight: '700', fontSize: '14px', color: '#0F172A' }}>
                    <span>Freshness</span>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#64748B" strokeWidth="2.5" style={{ transform: openSections.freshness ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }}>
                      <polyline points="6 9 12 15 18 9" />
                    </svg>
                  </div>
                  {openSections.freshness && (
                    <div style={{ marginTop: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13.5px', color: '#475569', cursor: 'pointer' }}>
                        <input type="checkbox" checked={(searchParams.get('freshness') || '').split(',').includes('Last 24 Hours')} onChange={() => toggleMultiSelectFilter('freshness', 'Last 24 Hours')} />
                        Last 24 Hours
                      </label>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13.5px', color: '#475569', cursor: 'pointer' }}>
                        <input type="checkbox" checked={(searchParams.get('freshness') || '').split(',').includes('Last 3 Days')} onChange={() => toggleMultiSelectFilter('freshness', 'Last 3 Days')} />
                        Last 3 Days
                      </label>
                    </div>
                  )}
                </div>
              </div>

              {/* Sticky Bottom Actions inside Mobile Side Drawer */}
              <div className="mobile-filter-footer">
                <button
                  onClick={() => setMobileFiltersOpen(false)}
                  style={{
                    width: '100%',
                    background: '#2563EB',
                    color: '#ffffff',
                    border: 'none',
                    padding: '13px',
                    borderRadius: '0px',
                    fontWeight: '700',
                    fontSize: '14.5px',
                    cursor: 'pointer',
                    boxShadow: '0 4px 14px rgba(37, 99, 235, 0.35)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  Apply Filters ({allFilteredJobs.length} Jobs)
                </button>
              </div>
            </aside>
      </>
    );
  };

  return (
    <div className="jobs-page" style={{ paddingTop: '8px' }}>
      <div className="container">
        
        {/* Main Header Row */}
        <div className="jobs-page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h1 style={{ fontSize: '24px', fontWeight: '800', color: '#0F172A', margin: 0 }}>{t.findJobs}</h1>
          {/* View Toggler */}
          <div style={{ display: 'inline-flex', background: '#F1F5F9', padding: '3px', borderRadius: '0.4rem', border: '1px solid #E2E8F0', gap: '3px' }}>
            <button
              type="button"
              style={{
                background: viewMode === 'grid' ? '#ffffff' : 'transparent',
                color: viewMode === 'grid' ? '#344BFD' : '#64748B',
                boxShadow: viewMode === 'grid' ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
                padding: '6px 14px',
                borderRadius: '0.3rem',
                border: 'none',
                fontWeight: '600',
                fontSize: '13px',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                transition: 'all 0.18s ease'
              }}
              onClick={() => setViewMode('grid')}
            >
              <LayoutGrid size={15} strokeWidth={2.2} />
              <span>Grid</span>
            </button>
            <button
              type="button"
              style={{
                background: viewMode === 'list' ? '#ffffff' : 'transparent',
                color: viewMode === 'list' ? '#344BFD' : '#64748B',
                boxShadow: viewMode === 'list' ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
                padding: '6px 14px',
                borderRadius: '0.3rem',
                border: 'none',
                fontWeight: '600',
                fontSize: '13px',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                transition: 'all 0.18s ease'
              }}
              onClick={() => setViewMode('list')}
            >
              <List size={15} strokeWidth={2.2} />
              <span>List</span>
            </button>
            <button
              type="button"
              style={{
                background: viewMode === 'map' ? '#ffffff' : 'transparent',
                color: viewMode === 'map' ? '#344BFD' : '#64748B',
                boxShadow: viewMode === 'map' ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
                padding: '6px 14px',
                borderRadius: '0.3rem',
                border: 'none',
                fontWeight: '600',
                fontSize: '13px',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                transition: 'all 0.18s ease'
              }}
              onClick={() => navigate('/jobs/map')}
            >
              <Map size={15} strokeWidth={2.2} />
              <span>Map</span>
            </button>
          </div>
        </div>

        {/* SEARCH BAR & FILTERS ROW */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px', flexWrap: 'nowrap' }}>
          <div
            className="toolbar-search-container"
            style={{ position: 'relative', flex: 1, cursor: 'pointer' }}
            onClick={() => setSearchOverlayOpen(true)}
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#94A3B8"
              strokeWidth="2.5"
              style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}
            >
              <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              type="text"
              className="form-input"
              placeholder="Search jobs, skills..."
              value={searchParams.get('keyword') || ''}
              readOnly
              onClick={() => setSearchOverlayOpen(true)}
              onFocus={() => setSearchOverlayOpen(true)}
              style={{
                borderRadius: '0px',
                border: '1.5px solid #CBD5E1',
                padding: '10px 14px 10px 38px',
                width: '100%',
                fontSize: '14px',
                fontWeight: '500',
                outline: 'none',
                background: '#ffffff',
                cursor: 'pointer',
                boxSizing: 'border-box'
              }}
            />
          </div>

          <button
            className="mobile-filter-toggle"
            onClick={() => setMobileFiltersOpen(!mobileFiltersOpen)}
            style={{
              background: '#ffffff',
              border: '1.5px solid #CBD5E1',
              padding: '9px 16px',
              borderRadius: '0px',
              fontWeight: '700',
              fontSize: '13.5px',
              color: '#0F172A',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              height: '42px',
              boxSizing: 'border-box'
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="4" y1="21" x2="4" y2="14"/><line x1="4" y1="10" x2="4" y2="3"/>
              <line x1="12" y1="21" x2="12" y2="12"/><line x1="12" y1="8" x2="12" y2="3"/>
              <line x1="20" y1="21" x2="20" y2="16"/><line x1="20" y1="12" x2="20" y2="3"/>
            </svg>
            <span className="filter-text">Filters</span>
          </button>
        </div>

        {/* TOP Category Filter Slider (Clean Sharp White Bar) */}
        <div style={{
          background: '#ffffff',
          padding: '8px 12px',
          borderRadius: '0px',
          marginBottom: '10px',
          display: 'flex',
          alignItems: 'center',
          position: 'relative',
          border: '1.5px solid #CBD5E1'
        }}>
          <div style={{
            display: 'flex',
            gap: '8px',
            overflowX: 'auto',
            scrollbarWidth: 'none',
            msOverflowStyle: 'none',
            width: '100%',
            paddingRight: '36px'
          }}>
            {topCategories.map(cat => {
              const active = (searchParams.get('keyword') || '') === cat.value;
              return (
                <button
                  key={cat.label}
                  onClick={() => updateFiltersInParams({ keyword: cat.value || null })}
                  style={{
                    background: active ? '#2563EB' : '#F8FAFC',
                    color: active ? '#ffffff' : '#0F172A',
                    border: active ? '1.5px solid #2563EB' : '1.5px solid #CBD5E1',
                    borderRadius: '0px',
                    padding: '7px 14px',
                    fontSize: '13px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                    transition: 'all 0.2s ease',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  {cat.icon}
                  <span>{cat.label}</span>
                </button>
              );
            })}
          </div>
          {/* Scroll arrow indicator */}
          <button style={{
            position: 'absolute',
            right: '8px',
            background: '#ffffff',
            border: '1.5px solid #CBD5E1',
            borderRadius: '0px',
            width: '28px',
            height: '28px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            boxShadow: '0 2px 4px rgba(0,0,0,0.06)'
          }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#64748B" strokeWidth="2.5">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </button>
        </div>



        {/* Main Layout Grid */}
        <div className={`jobs-layout ${viewMode === 'list' ? 'list-view-layout' : ''}`}>
          
          {/* LEFT COLUMN: Filters Sidebar (Modal overlay when open) */}
          {viewMode === 'grid' ? (
            mobileFiltersOpen ? createPortal(renderSidebar(), document.body) : renderSidebar()
          ) : (
            mobileFiltersOpen && createPortal(renderSidebar(), document.body)
          )}

          {/* MAIN COLUMN: Jobs Listing / Map View Content */}
          <div className="jobs-content" style={{ width: '100%' }}>
            {viewMode !== 'map' ? (
              <>
                <div className="jobs-toolbar">
                  <span className="jobs-count">
                    Showing <strong>{pagedJobs.length}</strong> of <strong>{allFilteredJobs.length}</strong> factory jobs
                  </span>
                  <div className="jobs-sort">
                    <label>Sort by:</label>
                    <select
                      value={searchParams.get('sort') || 'newest'}
                      onChange={(e) => updateFiltersInParams({ sort: e.target.value })}
                    >
                      <option value="newest">Newest First</option>
                      <option value="oldest">Oldest First</option>
                      <option value="salary-high">Salary: High to Low</option>
                      <option value="salary-low">Salary: Low to High</option>
                    </select>
                  </div>
                </div>

                {viewMode === 'grid' ? (
                  /* Grid View (Existing Job Cards) */
                  <div className="jobs-list">
                    {pagedJobs.length > 0 ? (
                      pagedJobs.map(job => <JobCard key={job.id} job={job} />)
                    ) : (
                      <div className="empty-state">
                        <h3>No industrial jobs found</h3>
                        <p>Adjust your filters or clear them to start over.</p>
                        <button className="btn btn-primary mt-4" onClick={clearAllFilters}>Clear Filters</button>
                      </div>
                    )}
                  </div>
                ) : (
                  /* Compact List View (100% Match with Reference Image 1) */
                  <div className="job-compact-list-container">
                    {pagedJobs.length > 0 ? (
                      pagedJobs.map(job => (
                        <div
                          key={job.id}
                          className="job-compact-card"
                          onClick={() => navigate(`/job/${job.id}`)}
                        >
                          <CompanyDefaultLogo
                            logoUrl={job.companyLogo || (job as any).company_logo}
                            companyName={job.company}
                            size={40}
                            borderRadius="10px"
                          />
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
                              <h4 className="job-compact-card-title">
                                {job.title}
                              </h4>
                              {Boolean(currentUser && (currentUser.appliedJobs?.includes(job.id) || currentUser.appliedJobsWithStatus?.some((a: any) => a.jobId === job.id))) && (
                                <span style={{ fontSize: '11px', fontWeight: '800', background: '#EFF6FF', color: '#2563EB', border: '1px solid #BFDBFE', padding: '2px 8px', borderRadius: '4px', whiteSpace: 'nowrap' }}>
                                  Applied ✓
                                </span>
                              )}
                            </div>
                            <div className="job-compact-card-location">
                              <MapPin size={12} color="#94A3B8" style={{ flexShrink: 0 }} />
                              <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                {job.location}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="empty-state">
                        <h3>No industrial jobs found</h3>
                        <p>Adjust your filters or clear them to start over.</p>
                        <button className="btn btn-primary mt-4" onClick={clearAllFilters}>Clear Filters</button>
                      </div>
                    )}
                  </div>
                )}

                {visibleCount < allFilteredJobs.length && (
                  <div style={{ textAlign: 'center', padding: '24px 0', color: 'var(--text-secondary)', fontWeight: '600' }}>
                    <span style={{ 
                      display: 'inline-block', 
                      width: '20px', 
                      height: '20px', 
                      border: '3px solid #E2E8F0', 
                      borderTopColor: '#344BFD', 
                      borderRadius: '50%', 
                      marginRight: '8px', 
                      verticalAlign: 'middle'
                    }}></span>
                    Loading more jobs...
                  </div>
                )}
              </>
            ) : (
              /* MOCK MAP VIEW SIMULATOR */
              <div style={{
                background: '#E0F2FE',
                borderRadius: '0.3rem',
                border: '2px solid #BAE6FD',
                height: 500,
                position: 'relative',
                overflow: 'hidden',
                boxShadow: 'var(--shadow-lg)'
              }}>
                <div style={{ position: 'absolute', inset: 0, opacity: 0.15, background: 'radial-gradient(circle, #0284c7 10%, transparent 11%), linear-gradient(0deg, transparent 24%, #0284c7 25%, #0284c7 26%, transparent 27%, transparent 74%, #0284c7 75%, #0284c7 76%, transparent 77%), linear-gradient(90deg, transparent 24%, #0284c7 25%, #0284c7 26%, transparent 27%, transparent 74%, #0284c7 75%, #0284c7 76%, transparent 77%)', backgroundSize: '40px 40px' }} />
                
                <div style={{ position: 'absolute', top: 50, left: 100, padding: '6px 12px', background: 'rgba(2,132,199,0.1)', border: '1px dashed #0284c7', borderRadius: '0.3rem', fontSize: '12px', color: '#0369a1', fontWeight: 'bold' }}>Sector 2, Chakan Industrial Phase 1</div>
                <div style={{ position: 'absolute', bottom: 100, right: 120, padding: '6px 12px', background: 'rgba(2,132,199,0.1)', border: '1px dashed #0284c7', borderRadius: '0.3rem', fontSize: '12px', color: '#0369a1', fontWeight: 'bold' }}>Ranjangaon MIDC Zone B</div>

                {allFilteredJobs.slice(0, 7).map((job, idx) => {
                  const companyColor = job.companyColor || getCompanyColor(job.company);
                  const x = 15 + (idx * 11) % 65;
                  const y = 20 + (idx * 14) % 60;

                  return (
                    <div
                      key={job.id}
                      style={{
                        position: 'absolute',
                        left: `${x}%`,
                        top: `${y}%`,
                        cursor: 'pointer',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        transform: 'translate(-50%, -100%)'
                      }}
                      onClick={() => navigate(`/job/${job.id}`)}
                    >
                      <div className="card" style={{
                        padding: '6px 10px',
                        fontSize: '11px',
                        background: 'white',
                        border: '1.5px solid var(--border)',
                        borderRadius: '0.3rem',
                        boxShadow: 'var(--shadow-md)',
                        whiteSpace: 'nowrap',
                        marginBottom: '4px',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center'
                      }}>
                        <strong style={{ color: 'var(--text-primary)' }}>{job.company}</strong>
                        <span style={{ fontSize: '9px', color: 'var(--text-secondary)' }}>{job.title.split(' ')[0]}</span>
                      </div>
                      <div style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: '50% 50% 50% 0',
                        background: companyColor,
                        transform: 'rotate(-45deg)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: 'var(--shadow-md)',
                        border: '2px solid white'
                      }}>
                        <div style={{
                          width: '12px',
                          height: '12px',
                          background: 'white',
                          borderRadius: '50%',
                          transform: 'rotate(45deg)'
                        }} />
                      </div>
                    </div>
                  );
                })}

                <div style={{
                  position: 'absolute',
                  bottom: '16px',
                  left: '16px',
                  background: 'rgba(15,23,42,0.85)',
                  color: 'white',
                  padding: '10px 16px',
                  borderRadius: '0.3rem',
                  fontSize: '12px',
                  backdropFilter: 'blur(4px)'
                }}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '6px', verticalAlign: 'middle', display: 'inline-block', color: 'var(--primary)' }}>
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                    <circle cx="12" cy="10" r="3" />
                  </svg>
                  Showing <strong>{Math.min(allFilteredJobs.length, 7)}</strong> factory sites near your location in <strong>Pune</strong>.
                </div>
              </div>
            )}
          </div>

        </div>
      </div>
      {/* Play Store Style Fullscreen / Overlay Instant Search View */}
      <MobileSearchOverlay
        isOpen={searchOverlayOpen}
        onClose={() => setSearchOverlayOpen(false)}
        initialQuery={searchParams.get('keyword') || ''}
        onSelectSearch={(queryStr, locationStr) => {
          updateFiltersInParams({
            keyword: queryStr || null,
            location: locationStr || searchParams.get('location') || null
          });
        }}
      />
    </div>
  );
};
export default JobSearchPage;
