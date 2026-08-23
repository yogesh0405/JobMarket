import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  Building2,
  MapPin,
  Globe,
  Users,
  Calendar,
  Mail,
  Phone,
  ShieldCheck,
  Edit3,
  Briefcase,
  Search,
  ArrowLeft,
  ExternalLink,
  FileText,
  Share2,
  Check,
  ChevronRight,
  AlertCircle,
  X
} from 'lucide-react';
import { apiFetch } from '../../utils/api';
import { useAuth } from '../../hooks/useAuth';
import { useStore } from '../../store/useStore';
import { CompanyDefaultLogo } from '../../components/company/CompanyDefaultLogo';
import { JobCard } from '../../components/job/JobCard';
import { EditCompanyProfileModal } from './EditCompanyProfileModal';

export const CompanyProfilePage: React.FC = () => {
  const { companyId } = useParams<{ companyId: string }>();
  const navigate = useNavigate();
  const { currentUser } = useAuth();

  const [company, setCompany] = useState<any>(null);
  const [jobs, setJobs] = useState<any[]>([]);
  const [loadingCompany, setLoadingCompany] = useState(true);
  const [loadingJobs, setLoadingJobs] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [showAboutModal, setShowAboutModal] = useState(false);

  const isOwner = React.useMemo(() => {
    if (!currentUser || !company) return false;
    const role = (currentUser.role || '').toLowerCase();
    if (role !== 'employer' && role !== 'admin') return false;

    if (company.employer_id && currentUser.id === company.employer_id) return true;
    if (currentUser.email && company.email && currentUser.email.toLowerCase() === company.email.toLowerCase()) return true;
    if (currentUser.company_name && company.name && currentUser.company_name.toLowerCase() === company.name.toLowerCase()) return true;

    return false;
  }, [currentUser, company]);

  const { state } = useStore();

  const loadCompanyDetails = async () => {
    if (!companyId) return;
    setLoadingCompany(true);
    setError(null);

    try {
      const res = await apiFetch(`/api/v1/companies/${encodeURIComponent(companyId)}`);
      const json = await res.json();

      if (res.ok && json && (json.data || json.success)) {
        setCompany(json.data || json);
        setLoadingCompany(false);
        return;
      }
    } catch (err: any) {
      console.warn('API fetch company details failed, using store fallback:', err);
    }

    // Fallback: derive company details from store jobs or users
    const decoded = decodeURIComponent(companyId).toLowerCase().trim();
    const allJobs = Array.isArray(state.jobs) ? state.jobs : [];
    const matchingJob = allJobs.find(j =>
      j && (
        j.id === companyId ||
        (j as any).employer_id === companyId ||
        (j.company || '').toLowerCase().trim() === decoded ||
        decoded.includes((j.company || '').toLowerCase().trim())
      )
    );

    const compName = matchingJob ? matchingJob.company : decodeURIComponent(companyId);

    setCompany({
      id: companyId,
      name: compName,
      logo: matchingJob?.companyLogo || (matchingJob as any)?.logo,
      industry: matchingJob?.industry || 'Industrial Manufacturing',
      description: matchingJob?.description ? matchingJob.description.slice(0, 160) + '...' : 'Leading industrial manufacturing and production plant.',
      city: matchingJob?.location || 'Chhatrapati Sambhajinagar',
      midc_zone: matchingJob?.midcZone || 'Waluj MIDC',
      company_size: '500+ employees',
      founded_year: 1998,
      website: 'https://www.jobmarket.in',
      verified: true
    });
    setLoadingCompany(false);
  };

  const loadCompanyJobs = async () => {
    if (!companyId) return;
    setLoadingJobs(true);

    try {
      const res = await apiFetch(`/api/v1/companies/${encodeURIComponent(companyId)}/jobs`);
      const json = await res.json();

      if (res.ok && json && (json.data || Array.isArray(json))) {
        const list = Array.isArray(json) ? json : (json.data || []);
        setJobs(list);
        setLoadingJobs(false);
        return;
      }
    } catch (err) {
      console.warn('API fetch company jobs failed, falling back to local store:', err);
    }

    // Fallback mode: Filter store jobs strictly by exact employer_id or exact company name
    const decoded = decodeURIComponent(companyId).toLowerCase().trim();
    const cleanDecoded = decoded.replace(/[^a-z0-9]/g, '');
    const targetEmployerId = company?.employer_id || company?.id || companyId;

    const allJobs = Array.isArray(state.jobs) ? state.jobs : [];
    const filtered = allJobs.filter(j => {
      if (!j) return false;
      const jEmpId = j.employerId || (j as any).employer_id;
      if (jEmpId && targetEmployerId && jEmpId === targetEmployerId && jEmpId !== '00000000-0000-0000-0000-000000000000') {
        return true;
      }
      const cName = (j.company || '').toLowerCase().trim();
      const cleanCName = cName.replace(/[^a-z0-9]/g, '');
      return cName === decoded || (cleanCName.length > 3 && cleanCName === cleanDecoded);
    });

    setJobs(filtered);
    setLoadingJobs(false);
  };

  useEffect(() => {
    loadCompanyDetails();
    loadCompanyJobs();
    window.scrollTo(0, 0);
  }, [companyId]);

  const handleShare = async () => {
    const currentUrl = window.location.href;
    const shareData = {
      title: `${company?.name || 'Company Profile'} - JobMarket`,
      text: `View active jobs and company profile for ${company?.name || 'this company'} on JobMarket.`,
      url: currentUrl,
    };

    if (typeof navigator !== 'undefined' && (navigator as any).share && (navigator as any).canShare && (navigator as any).canShare(shareData)) {
      try {
        await (navigator as any).share(shareData);
        return;
      } catch (err: any) {
        if (err.name === 'AbortError') return;
      }
    }

    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(currentUrl);
      } else {
        const dummy = document.createElement('textarea');
        dummy.value = currentUrl;
        document.body.appendChild(dummy);
        dummy.select();
        document.execCommand('copy');
        document.body.removeChild(dummy);
      }
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2200);
    } catch (err) {
      console.error('Failed to copy link:', err);
    }
  };

  // Robust Company Name Resolution (Filters out raw UUIDs)
  const displayCompanyName = React.useMemo(() => {
    if (!company) return 'Company Profile';
    const isUUID = (str: string) => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str.trim());

    const candidates = [
      company.company_name,
      company.companyName,
      company.name,
      company.title,
      company.company
    ];

    for (const c of candidates) {
      if (typeof c === 'string' && c.trim() && !isUUID(c.trim())) {
        return c.trim();
      }
    }

    return 'Industrial Manufacturing Plant';
  }, [company]);

  // Smart Location Formatting without repeating city names
  const formattedLocation = React.useMemo(() => {
    if (!company) return '';
    const parts: string[] = [];

    const city = company.city || '';
    const address = company.address || '';
    const state = company.state || '';

    if (address.trim()) {
      parts.push(address.trim());
    }

    if (city.trim()) {
      const cityLower = city.trim().toLowerCase();
      const addrLower = address.toLowerCase();
      if (!addrLower.includes(cityLower)) {
        parts.push(city.trim());
      }
    }

    if (state.trim()) {
      const stateLower = state.trim().toLowerCase();
      const existingText = parts.join(', ').toLowerCase();
      if (!existingText.includes(stateLower)) {
        parts.push(state.trim());
      }
    }

    return parts.join(', ') || city || address || 'Location Available Upon Contact';
  }, [company]);

  const filteredJobs = React.useMemo(() => {
    if (!searchQuery.trim()) return jobs;
    const q = searchQuery.toLowerCase();
    return jobs.filter(
      (j) =>
        (j.title && j.title.toLowerCase().includes(q)) ||
        (j.location && j.location.toLowerCase().includes(q)) ||
        (j.trade && j.trade.toLowerCase().includes(q)) ||
        (j.jobType && j.jobType.toLowerCase().includes(q))
    );
  }, [jobs, searchQuery]);

  if (loadingCompany) {
    return (
      <div className="company-profile-wrapper" style={{ padding: '32px 16px' }}>
        <div style={{ textAlign: 'center', padding: '48px 0', color: '#64748B' }}>
          <div className="company-spinner" style={{ margin: '0 auto 16px auto' }} />
          <span>Loading company profile...</span>
        </div>
      </div>
    );
  }

  if (error || !company) {
    return (
      <div className="company-profile-wrapper" style={{ padding: '48px 16px', display: 'flex', justifyContent: 'center' }}>
        <div className="company-card-surface" style={{ maxWidth: '520px', width: '100%', padding: '36px 28px', textAlign: 'center' }}>
          <AlertCircle size={44} color="#EF4444" style={{ margin: '0 auto 16px auto' }} />
          <h2 style={{ fontSize: '18px', fontWeight: '700', color: '#0F172A', marginBottom: '8px' }}>
            Company Profile Not Found
          </h2>
          <p style={{ fontSize: '13.5px', color: '#64748B', lineHeight: '1.5', marginBottom: '24px' }}>
            {error || "The company profile you are looking for doesn't exist or has been removed."}
          </p>
          <button
            onClick={() => navigate('/companies')}
            className="company-btn-action company-btn-primary"
            style={{ padding: '10px 20px', margin: '0 auto' }}
          >
            <ArrowLeft size={16} />
            Back to Companies Directory
          </button>
        </div>
      </div>
    );
  }

  const completionPct = company.completion_percentage || 85;

  return (
    <div className="company-profile-wrapper">
      {/* Main Container */}
      <div className="company-main-container">

        {/* Single Executive Hero Header Card with Solid Blue Cover Banner */}
        <div className="company-hero-card">
          {/* Top Solid Blue Cover Banner */}
          <div className="company-cover-banner">
            {/* Top-Left Back Button inside Blue Section (No Background Box) */}
            <button
              onClick={() => window.history.length > 1 ? navigate(-1) : navigate('/companies')}
              style={{
                background: 'transparent',
                border: 'none',
                padding: 0,
                color: '#FFFFFF',
                fontSize: '12px',
                fontWeight: '700',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                cursor: 'pointer',
                marginTop: '-4px',
                marginLeft: '-4px',
                marginBottom: '24px',
                opacity: 0.9,
                transition: 'opacity 0.15s ease'
              }}
              onMouseEnter={(e) => (e.currentTarget.style.opacity = '1')}
              onMouseLeave={(e) => (e.currentTarget.style.opacity = '0.9')}
            >
              <ArrowLeft size={15} />
              <span>Back</span>
            </button>

            {/* Top Single Row Header: Logo + Title/Type (Left) | Actions/Share (Right) */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px', width: '100%', marginBottom: '6px' }}>
              {/* Left Side: Logo + Title & Industry/Type */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1, minWidth: 0 }}>
                <div 
                  onClick={isOwner ? triggerFileInput : undefined}
                  style={{
                    position: 'relative',
                    width: '44px',
                    height: '44px',
                    flexShrink: 0,
                    cursor: isOwner ? 'pointer' : 'default'
                  }}
                  title={isOwner ? "Click to update logo" : displayCompanyName}
                >
                  <div style={{
                    width: '100%',
                    height: '100%',
                    borderRadius: '50%',
                    backgroundColor: '#FFFFFF',
                    border: '1.5px solid #FFFFFF',
                    boxShadow: '0 2px 6px rgba(0,0,0,0.15)',
                    overflow: 'hidden',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <CompanyDefaultLogo
                      logoUrl={company.logo}
                      companyName={displayCompanyName}
                      size={40}
                      borderRadius="50%"
                    />
                  </div>

                  {isOwner && (
                    <div style={{
                      position: 'absolute',
                      bottom: '-2px',
                      right: '-2px',
                      width: '18px',
                      height: '18px',
                      borderRadius: '50%',
                      backgroundColor: '#FFFFFF',
                      border: '1px solid #2563EB',
                      color: '#2563EB',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: '0 1px 4px rgba(0,0,0,0.25)',
                      zIndex: 10
                    }}>
                      <Camera size={10} strokeWidth={2.5} />
                    </div>
                  )}
                </div>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <h1 className="company-hero-title" style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {displayCompanyName}
                  </h1>
                  <p className="company-tagline" style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {company.industry || 'Industrial Manufacturing & Engineering Operations'}
                  </p>
                </div>
              </div>

              {/* Right Side: Share Icon (& Edit Profile button if owner) */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
                {isOwner && (
                  <button onClick={() => setIsEditModalOpen(true)} className="company-btn-action company-btn-outline-white" style={{ padding: '4px 8px', fontSize: '12px' }}>
                    <Edit3 size={13} />
                    <span>Edit</span>
                  </button>
                )}
                <button
                  onClick={handleShare}
                  title={copiedLink ? 'Link Copied!' : 'Share Profile'}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    padding: '4px',
                    color: '#FFFFFF',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer'
                  }}
                >
                  {copiedLink ? <Check size={18} strokeWidth={2.5} style={{ color: '#4ADE80' }} /> : <Share2 size={18} strokeWidth={2.2} />}
                </button>
              </div>
            </div>

            {/* Employer Owner Profile Completion Banner */}
            {isOwner && (
              <div style={{
                marginTop: '16px',
                paddingTop: '14px',
                borderTop: '1px solid rgba(255, 255, 255, 0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '16px',
                flexWrap: 'wrap'
              }}>
                <div style={{ flex: 1, minWidth: '240px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', fontWeight: '700', color: '#FFFFFF', marginBottom: '4px' }}>
                    <span>Employer Profile Completion</span>
                    <span style={{ color: '#93C5FD' }}>{completionPct}%</span>
                  </div>
                  <div style={{ width: '100%', height: '5px', backgroundColor: 'rgba(255, 255, 255, 0.2)', borderRadius: '0px', overflow: 'hidden' }}>
                    <div style={{ width: `${completionPct}%`, height: '100%', backgroundColor: '#FFFFFF', transition: 'width 0.3s ease' }} />
                  </div>
                </div>
                <div style={{ fontSize: '12px', color: '#DBEAFE', display: 'flex', alignItems: 'center', gap: '10px', fontWeight: '600' }}>
                  <span>✓ Logo & Name</span>
                  <span>✓ Industry & Location</span>
                  <span>{company.website ? '✓ Website' : '○ Website'}</span>
                </div>
              </div>
            )}

            {/* Integrated Stats Row inside Single Blue Hero Card (Only rendered when provided) */}
            {(company.company_size || company.companySize || company.founded_year || company.foundedYear || company.city || company.address || formattedLocation) && (
              <>
                <div style={{ height: '1px', backgroundColor: 'rgba(255, 255, 255, 0.2)', margin: '10px 0' }} />
                <div className="company-hero-stats-row">
                  {(company.company_size || company.companySize) && (
                    <div className="company-hero-stat-item">
                      <div className="company-stat-icon">
                        <Users size={18} />
                      </div>
                      <div className="company-stat-text-container">
                        <div className="company-stat-label">EMPLOYEES</div>
                        <div className="company-stat-value">{company.company_size || company.companySize}</div>
                      </div>
                    </div>
                  )}

                  {(company.founded_year || company.foundedYear) && (
                    <div className="company-hero-stat-item">
                      <div className="company-stat-icon">
                        <Calendar size={18} />
                      </div>
                      <div className="company-stat-text-container">
                        <div className="company-stat-label">FOUNDED</div>
                        <div className="company-stat-value">{company.founded_year || company.foundedYear}</div>
                      </div>
                    </div>
                  )}

                  {(company.city || company.address || formattedLocation) && (
                    <div className="company-hero-stat-item full-width-stat">
                      <div className="company-stat-icon">
                        <MapPin size={16} />
                      </div>
                      <div className="company-stat-text-container">
                        <div className="company-stat-label">HEADQUARTERS</div>
                        <div className="company-stat-value">{formattedLocation || company.city || company.address}</div>
                      </div>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Content Layout Grid */}
        <div className="company-content-grid">
          {/* Left Column: About & Active Jobs List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

            {/* About Section */}
            <div className="company-card-surface">
              <h2 className="company-section-title">
                <Building2 size={18} color="#2563EB" />
                About {displayCompanyName}
              </h2>
              {(() => {
                const rawAboutText = company.description || `${displayCompanyName} is a premier organization operating in the ${company.industry || 'industrial'} sector located in ${formattedLocation || 'Chhatrapati Sambhajinagar'}, specializing in high-quality manufacturing operations, engineering standards, and career growth.`;
                const MAX_ABOUT_CHARS = 180;
                const isExceedingCapacity = rawAboutText.length > MAX_ABOUT_CHARS;
                const displayedAboutText = isExceedingCapacity ? `${rawAboutText.slice(0, MAX_ABOUT_CHARS).trim()}...` : rawAboutText;

                return (
                  <p className="company-description-text" style={{ margin: 0, whiteSpace: 'pre-line' }}>
                    {displayedAboutText}
                    {isExceedingCapacity && (
                      <button
                        onClick={() => setShowAboutModal(true)}
                        style={{
                          background: 'transparent',
                          border: 'none',
                          color: '#2563EB',
                          fontWeight: '700',
                          fontSize: '13px',
                          cursor: 'pointer',
                          padding: '0 0 0 6px',
                          textDecoration: 'underline'
                        }}
                      >
                        More...
                      </button>
                    )}
                  </p>
                );
              })()}

              {Array.isArray(company.specializations) && company.specializations.length > 0 && (
                <>
                  <div className="company-slate-divider" />
                  <div>
                    <h4 style={{ fontSize: '10.5px', fontWeight: '700', color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.4px', marginBottom: '8px' }}>Key Specializations</h4>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                      {company.specializations.map((spec: string, idx: number) => (
                        <span key={idx} style={{
                          padding: '4px 10px',
                          backgroundColor: '#EFF6FF',
                          border: '1px solid #BFDBFE',
                          fontSize: '12px',
                          fontWeight: '700',
                          color: '#1D4ED8'
                        }}>
                          {spec}
                        </span>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Active Job Openings Section */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div className="company-card-surface" style={{ padding: '18px 20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px', flexWrap: 'wrap', marginBottom: jobs.length > 0 ? '12px' : 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <Briefcase size={20} color="#2563EB" />
                    <h2 className="company-section-title" style={{ margin: 0 }}>
                      Active Job Openings
                    </h2>
                    <span style={{
                      padding: '2px 8px',
                      backgroundColor: '#EFF6FF',
                      color: '#2563EB',
                      fontSize: '12px',
                      fontWeight: '800',
                      border: '1px solid #BFDBFE'
                    }}>
                      {filteredJobs.length}
                    </span>
                  </div>

                  {isOwner && (
                    <button
                      onClick={() => navigate('/post-job')}
                      className="company-btn-action company-btn-primary"
                      style={{ padding: '6px 12px', fontSize: '12.5px' }}
                    >
                      + Post New Job
                    </button>
                  )}
                </div>

                {jobs.length > 0 && (
                  <div style={{ position: 'relative' }}>
                    <Search size={16} color="#94A3B8" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search openings by title, trade, or location..."
                      style={{
                        width: '100%',
                        padding: '9px 12px 9px 36px',
                        border: '1px solid #CBD5E1',
                        borderRadius: '0px',
                        fontSize: '13px',
                        outline: 'none',
                        backgroundColor: '#FFFFFF',
                        color: '#0F172A'
                      }}
                    />
                  </div>
                )}
              </div>

              {loadingJobs ? (
                <div className="company-card-surface" style={{ padding: '32px', textAlign: 'center', color: '#64748B' }}>
                  Loading active job postings...
                </div>
              ) : filteredJobs.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {filteredJobs.map((jobItem) => (
                    <JobCard key={jobItem.id} job={jobItem} />
                  ))}
                </div>
              ) : (
                <div className="company-card-surface" style={{ padding: '40px 24px', textAlign: 'center' }}>
                  <Briefcase size={36} color="#94A3B8" style={{ margin: '0 auto 12px' }} />
                  <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#0F172A', marginBottom: '6px' }}>
                    No Active Job Postings
                  </h3>
                  <p style={{ fontSize: '13px', color: '#64748B', margin: 0 }}>
                    {searchQuery ? 'No openings match your search filter.' : 'This company currently has no active openings listed on JobMarket.'}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Company Details Sidebar */}
          <div className="company-card-surface">
            <h2 className="company-section-title">
              <FileText size={18} color="#2563EB" />
              Company Details
            </h2>

            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {company.website && (
                <div className="company-kv-row">
                  <span className="company-kv-key">Website</span>
                  <a
                    href={company.website.startsWith('http') ? company.website : `https://${company.website}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="company-kv-value"
                    style={{ color: '#2563EB', textDecoration: 'none' }}
                  >
                    {company.website.replace(/^https?:\/\//, '')}
                  </a>
                </div>
              )}

              {company.phone && (
                <div className="company-kv-row">
                  <span className="company-kv-key">Phone</span>
                  <a href={`tel:${company.phone}`} className="company-kv-value" style={{ color: '#2563EB', textDecoration: 'none' }}>
                    {company.phone}
                  </a>
                </div>
              )}

              {company.email && (
                <div className="company-kv-row">
                  <span className="company-kv-key">Email</span>
                  <a href={`mailto:${company.email}`} className="company-kv-value" style={{ color: '#2563EB', textDecoration: 'none' }}>
                    {company.email}
                  </a>
                </div>
              )}

              <div className="company-kv-row">
                <span className="company-kv-key">Industry</span>
                <span className="company-kv-value">{company.industry || 'Industrial Manufacturing'}</span>
              </div>

              <div className="company-kv-row">
                <span className="company-kv-key">Company Type</span>
                <span className="company-kv-value">{company.company_type || 'Private Limited'}</span>
              </div>

              <div className="company-kv-row">
                <span className="company-kv-key">Company Size</span>
                <span className="company-kv-value">{company.company_size || '100-500 employees'}</span>
              </div>

              <div className="company-kv-row">
                <span className="company-kv-key">Founded Year</span>
                <span className="company-kv-value">{company.founded_year || '2010'}</span>
              </div>

              {company.midc_zone && (
                <div className="company-kv-row">
                  <span className="company-kv-key">MIDC Zone</span>
                  <span className="company-kv-value">{company.midc_zone}</span>
                </div>
              )}

              {company.gst_number && (
                <div className="company-kv-row">
                  <span className="company-kv-key">GST Registration</span>
                  <span className="company-kv-value" style={{ fontFamily: 'monospace' }}>{company.gst_number}</span>
                </div>
              )}

              {formattedLocation && (
                <div className="company-kv-row">
                  <span className="company-kv-key">Headquarters</span>
                  <span className="company-kv-value">{formattedLocation}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Employer Edit Modal */}
      {isEditModalOpen && (
        <EditCompanyProfileModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          company={company}
          onSaveSuccess={(updated) => setCompany(updated)}
        />
      )}

      {/* About Company Full Text Popup Modal */}
      {showAboutModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(15, 23, 42, 0.65)',
          backdropFilter: 'blur(4px)',
          zIndex: 25000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '16px'
        }}>
          <div style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '8px',
            border: '1px solid #CBD5E1',
            maxWidth: '600px',
            width: '100%',
            maxHeight: '85vh',
            display: 'flex',
            flexDirection: 'column',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
            overflow: 'hidden'
          }}>
            {/* Modal Header */}
            <div style={{
              padding: '14px 18px',
              backgroundColor: '#2563EB',
              color: '#FFFFFF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '15px', fontWeight: '800' }}>
                <Building2 size={18} />
                <span>About {displayCompanyName}</span>
              </div>
              <button
                onClick={() => setShowAboutModal(false)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#FFFFFF',
                  cursor: 'pointer',
                  padding: '4px',
                  display: 'flex',
                  alignItems: 'center'
                }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Body */}
            <div style={{ padding: '20px', overflowY: 'auto', flex: 1, fontSize: '14px', lineHeight: '1.7', color: '#334155', whiteSpace: 'pre-line' }}>
              {company.description || `${displayCompanyName} is a premier organization operating in the ${company.industry || 'industrial'} sector located in ${formattedLocation || 'Chhatrapati Sambhajinagar'}, specializing in high-quality manufacturing operations, engineering standards, and career growth.`}
            </div>

            {/* Modal Footer */}
            <div style={{ padding: '12px 18px', borderTop: '1px solid #CBD5E1', backgroundColor: '#F8FAFC', display: 'flex', justifyContent: 'flex-end' }}>
              <button
                onClick={() => setShowAboutModal(false)}
                style={{
                  backgroundColor: '#2563EB',
                  color: '#FFFFFF',
                  border: 'none',
                  padding: '8px 18px',
                  borderRadius: '6px',
                  fontWeight: '700',
                  fontSize: '13px',
                  cursor: 'pointer'
                }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
