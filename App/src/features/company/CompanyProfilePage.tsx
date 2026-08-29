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
  Lock,
  Star,
  Plus,
  Headphones,
  X
} from 'lucide-react';
import companyHeaderBg from '../../assets/company_header_bg.jpg';
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
        (j as any).employerId === companyId ||
        (j as any).companyId === companyId ||
        (j.company || '').toLowerCase().trim() === decoded ||
        decoded.includes((j.company || '').toLowerCase().trim()) ||
        (j.company || '').toLowerCase().trim().includes(decoded)
      )
    );

    const compName = matchingJob ? matchingJob.company : decodeURIComponent(companyId);

    setCompany({
      id: companyId,
      name: compName,
      logo: matchingJob?.companyLogo || (matchingJob as any)?.logo,
      industry: matchingJob?.industry || 'Industrial Manufacturing',
      description: matchingJob?.description || 'Leading industrial manufacturing and production plant specializing in high-quality engineering operations and career opportunities.',
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
      <div className="company-profile-wrapper" style={{ padding: '24px 16px' }}>
        <div className="company-main-container" style={{ maxWidth: '1100px', margin: '0 auto' }}>
          {/* Hero Header Card Skeleton */}
          <div style={{ backgroundColor: '#FFFFFF', borderRadius: '12px', border: '1px solid #E2E8F0', padding: '24px', marginBottom: '20px', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '20px' }}>
              <div className="skeleton" style={{ width: '80px', height: '80px', borderRadius: '16px', flexShrink: 0 }} />
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div className="skeleton" style={{ width: '260px', height: '24px', borderRadius: '6px' }} />
                <div className="skeleton" style={{ width: '180px', height: '16px', borderRadius: '4px' }} />
                <div className="skeleton" style={{ width: '130px', height: '14px', borderRadius: '4px' }} />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '12px', paddingTop: '16px', borderTop: '1px solid #F1F5F9' }}>
              <div className="skeleton" style={{ height: '48px', borderRadius: '8px' }} />
              <div className="skeleton" style={{ height: '48px', borderRadius: '8px' }} />
              <div className="skeleton" style={{ height: '48px', borderRadius: '8px' }} />
              <div className="skeleton" style={{ height: '48px', borderRadius: '8px' }} />
            </div>
          </div>

          {/* Overview & Form Content Skeleton */}
          <div style={{ backgroundColor: '#FFFFFF', borderRadius: '12px', border: '1px solid #E2E8F0', padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div className="skeleton" style={{ width: '180px', height: '20px', borderRadius: '4px' }} />
            <div className="skeleton" style={{ width: '100%', height: '14px', borderRadius: '4px' }} />
            <div className="skeleton" style={{ width: '92%', height: '14px', borderRadius: '4px' }} />
            <div className="skeleton" style={{ width: '85%', height: '14px', borderRadius: '4px' }} />
          </div>
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

  const completionPct = company.completion_percentage || 75;

  return (
    <div style={{
      width: '100%',
      minHeight: '100vh',
      backgroundColor: '#F7F9FC',
      boxSizing: 'border-box'
    }}>
      {/* Container matching Mobile/Responsive Width */}
      <div style={{
        maxWidth: '720px',
        margin: '0 auto',
        paddingBottom: '60px',
        boxSizing: 'border-box'
      }}>
        {/* 1. Primary Blue Hero Header Banner with Exact Mobile App Background Image */}
        <div style={{
          backgroundColor: '#0A58E2',
          backgroundImage: `url(${companyHeaderBg})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          padding: '16px 16px 48px 16px',
          color: '#FFFFFF',
          position: 'relative',
          boxSizing: 'border-box'
        }}>
          {/* Top Controls Row */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '4px 0',
            marginBottom: '6px'
          }}>
            <button
              onClick={() => window.history.length > 1 ? navigate(-1) : navigate('/companies')}
              style={{
                background: 'transparent',
                border: 'none',
                padding: '6px',
                color: '#FFFFFF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer'
              }}
              title="Go Back"
            >
              <ArrowLeft size={20} strokeWidth={2.4} />
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              {isOwner && (
                <button
                  onClick={() => setIsEditModalOpen(true)}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    padding: '6px',
                    color: '#FFFFFF',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer'
                  }}
                  title="Edit Profile"
                >
                  <Edit3 size={15} strokeWidth={2} />
                </button>
              )}

              <button
                onClick={handleShare}
                style={{
                  background: 'transparent',
                  border: 'none',
                  padding: '6px',
                  color: '#FFFFFF',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer'
                }}
                title={copiedLink ? 'Link Copied!' : 'Share Profile'}
              >
                {copiedLink ? <Check size={18} strokeWidth={2.8} color="#4ADE80" /> : <Share2 size={19} strokeWidth={2} />}
              </button>
            </div>
          </div>

          {/* Company Identity Hero Row */}
          <div style={{ display: 'flex', alignItems: 'center', marginTop: '2px' }}>
            {/* Large Circular White Logo Container (72px Exact Mobile Match) */}
            <div style={{
              width: '72px',
              height: '72px',
              borderRadius: '36px',
              backgroundColor: '#FFFFFF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginRight: '14px',
              flexShrink: 0,
              boxShadow: '0 3px 8px rgba(16, 42, 92, 0.2)',
              overflow: 'hidden'
            }}>
              {company.logo ? (
                <CompanyDefaultLogo
                  logoUrl={company.logo}
                  companyName={displayCompanyName}
                  size={68}
                  borderRadius="34px"
                />
              ) : (
                <Headphones size={38} color="#1764E8" strokeWidth={2.3} />
              )}
            </div>

            {/* Company Info Column */}
            <div style={{ flex: 1, minWidth: 0, justifyContent: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
                <h1 style={{
                  fontSize: '22px',
                  fontWeight: 700,
                  color: '#FFFFFF',
                  margin: 0,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  letterSpacing: '-0.2px'
                }}>
                  {displayCompanyName}
                </h1>
                <div style={{
                  width: '18px',
                  height: '18px',
                  borderRadius: '9px',
                  backgroundColor: '#1764E8',
                  color: '#FFFFFF',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }} title="Verified Employer">
                  <Check size={11} strokeWidth={3} />
                </div>
              </div>

              {/* Subtitle Category Pills */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'nowrap' }}>
                <div style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  backgroundColor: 'rgba(255, 255, 255, 0.18)',
                  padding: '3.5px 8px',
                  borderRadius: '6px',
                  fontSize: '11px',
                  fontWeight: 500,
                  color: '#FFFFFF',
                  flexShrink: 1,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap'
                }}>
                  <Building2 size={12} color="#FFFFFF" strokeWidth={2.2} />
                  <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {company.industry || 'Industrial Manufacturing'}
                  </span>
                </div>

                <div style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  backgroundColor: 'rgba(255, 255, 255, 0.18)',
                  padding: '3.5px 8px',
                  borderRadius: '6px',
                  fontSize: '11px',
                  fontWeight: 500,
                  color: '#FFFFFF',
                  flexShrink: 1,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap'
                }}>
                  <Lock size={12} color="#FFFFFF" strokeWidth={2.2} />
                  <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {company.company_type || 'Private Limited'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 2. Floating Metrics Bar (Exact Mobile App UI - 32px Overlap) */}
        <div style={{
          backgroundColor: '#FFFFFF',
          border: '1px solid #E7EBF2',
          borderRadius: '8px',
          padding: '10px 12px',
          margin: '-32px 16px 16px 16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          position: 'relative',
          zIndex: 10,
          boxShadow: '0 3px 8px rgba(20, 42, 80, 0.06)'
        }}>
          {/* Stat 1: Jobs Posted */}
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '6px', padding: '0 2px' }}>
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              backgroundColor: '#EFF5FF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}>
              <Briefcase size={15} color="#1764E8" strokeWidth={2} />
            </div>
            <div style={{ flex: 1, justifyContent: 'center' }}>
              <div style={{ fontSize: '13px', fontWeight: 700, color: '#102A5C', lineHeight: 1.1 }}>{jobs.length || 0}</div>
              <div style={{ fontSize: '9.5px', fontWeight: 500, color: '#657796', marginTop: '0.5px' }}>Jobs Posted</div>
            </div>
          </div>

          <div style={{ width: '1px', height: '24px', backgroundColor: '#E3E8F0', margin: '0 2px' }} />

          {/* Stat 2: Profile Score */}
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '6px', padding: '0 2px' }}>
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              backgroundColor: '#ECF9F6',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}>
              <Star size={15} color="#21A99B" strokeWidth={2} />
            </div>
            <div style={{ flex: 1, justifyContent: 'center' }}>
              <div style={{ fontSize: '13px', fontWeight: 700, color: '#102A5C', lineHeight: 1.1 }}>{completionPct}%</div>
              <div style={{ fontSize: '9.5px', fontWeight: 500, color: '#657796', marginTop: '0.5px' }}>Profile Score</div>
            </div>
          </div>

          <div style={{ width: '1px', height: '24px', backgroundColor: '#E3E8F0', margin: '0 2px' }} />

          {/* Stat 3: Post Job / Open Vacancies */}
          <div
            onClick={isOwner ? () => navigate('/post-job') : undefined}
            style={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '0 2px',
              cursor: isOwner ? 'pointer' : 'default'
            }}
          >
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              backgroundColor: '#EEF4FF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}>
              <Plus size={16} color="#1764E8" strokeWidth={2.4} />
            </div>
            <div style={{ flex: 1, justifyContent: 'center' }}>
              <div style={{ fontSize: '13px', fontWeight: 700, color: '#1764E8', lineHeight: 1.1 }}>{isOwner ? 'Post Job' : 'Vacancies'}</div>
              <div style={{ fontSize: '9.5px', fontWeight: 500, color: '#657796', marginTop: '0.5px' }}>{isOwner ? 'New Vacancy' : 'Live Openings'}</div>
            </div>
          </div>
        </div>

        {/* 3. About Company & Operations Card */}
        <div style={{
          backgroundColor: '#FFFFFF',
          borderRadius: '8px',
          border: '1px solid #E7EBF2',
          padding: '16px',
          margin: '0 16px 12px 16px',
          boxShadow: '0 2px 6px rgba(20, 42, 80, 0.04)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              backgroundColor: '#EEF4FF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Building2 size={16} color="#1764E8" strokeWidth={2.2} />
            </div>
            <h3 style={{ fontSize: '14.5px', fontWeight: 700, color: '#102A5C', margin: 0 }}>
              About {displayCompanyName}
            </h3>
          </div>

          <p style={{
            fontSize: '13px',
            color: '#66789B',
            lineHeight: '20px',
            margin: 0,
            whiteSpace: 'pre-line'
          }}>
            {company.description || `${displayCompanyName} is a leading industrial organization operating in manufacturing and engineering operations.`}
          </p>

          {Array.isArray(company.specializations) && company.specializations.length > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '12px' }}>
              {company.specializations.map((spec: string, idx: number) => (
                <span
                  key={idx}
                  style={{
                    backgroundColor: '#F8FAFC',
                    border: '1px solid #E2E8F0',
                    padding: '4px 8px',
                    borderRadius: '4px',
                    fontSize: '11px',
                    color: '#475569',
                    fontWeight: 600
                  }}
                >
                  {spec}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* 4. Company Details & Verification Card */}
        <div style={{
          backgroundColor: '#FFFFFF',
          borderRadius: '8px',
          border: '1px solid #E7EBF2',
          padding: '16px',
          margin: '0 16px 12px 16px',
          boxShadow: '0 2px 6px rgba(20, 42, 80, 0.04)'
        }}>
          {/* Card Header with Title and Verified Badge */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <h3 style={{ fontSize: '14.5px', fontWeight: 700, color: '#102A5C', margin: 0 }}>
              Company Details & Verification
            </h3>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              backgroundColor: '#EAF8F5',
              padding: '3px 8px',
              borderRadius: '6px'
            }}>
              <ShieldCheck size={13} color="#19A98F" strokeWidth={2.4} />
              <span style={{ fontSize: '11px', fontWeight: 600, color: '#19A98F' }}>Verified</span>
            </div>
          </div>

          <div style={{ height: '1px', backgroundColor: '#E2E7EF', margin: '12px 0' }} />

          {/* Details 2-Column Grid */}
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {/* Row 1: Location & Legal Type */}
            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)', gap: '12px' }}>
              <div style={{ minWidth: 0, overflow: 'hidden' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                  <div style={{ width: '24px', height: '24px', borderRadius: '6px', backgroundColor: '#EEF4FF', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <MapPin size={14} color="#1764E8" strokeWidth={2} />
                  </div>
                  <span style={{ fontSize: '10.5px', fontWeight: 500, color: '#66789B', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>Plant Address & Location</span>
                </div>
                <div style={{ fontSize: '12px', fontWeight: 600, color: '#102A5C', lineHeight: '16px', paddingLeft: '30px', wordBreak: 'break-word', overflowWrap: 'anywhere' }}>
                  {formattedLocation || 'Waluj MIDC, Chhatrapati Sambhajinagar'}
                </div>
              </div>

              <div style={{ minWidth: 0, overflow: 'hidden' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                  <div style={{ width: '24px', height: '24px', borderRadius: '6px', backgroundColor: '#F2F1FF', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Building2 size={14} color="#625CEB" strokeWidth={2} />
                  </div>
                  <span style={{ fontSize: '10.5px', fontWeight: 500, color: '#66789B', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>Legal Company Type</span>
                </div>
                <div style={{ fontSize: '12px', fontWeight: 600, color: '#102A5C', lineHeight: '16px', paddingLeft: '30px', wordBreak: 'break-word', overflowWrap: 'anywhere' }}>
                  {company.company_type || 'Private Limited'}
                </div>
              </div>
            </div>

            <div style={{ height: '1px', backgroundColor: '#E5EAF2', margin: '10px 0' }} />

            {/* Row 2: Company Size & Founded Year */}
            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)', gap: '12px' }}>
              <div style={{ minWidth: 0, overflow: 'hidden' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                  <div style={{ width: '24px', height: '24px', borderRadius: '6px', backgroundColor: '#ECFAF7', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Users size={14} color="#21A99B" strokeWidth={2} />
                  </div>
                  <span style={{ fontSize: '10.5px', fontWeight: 500, color: '#66789B', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>Company Size</span>
                </div>
                <div style={{ fontSize: '12px', fontWeight: 600, color: '#102A5C', lineHeight: '16px', paddingLeft: '30px', wordBreak: 'break-word', overflowWrap: 'anywhere' }}>
                  {company.company_size || '200–500 employees'}
                </div>
              </div>

              <div style={{ minWidth: 0, overflow: 'hidden' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                  <div style={{ width: '24px', height: '24px', borderRadius: '6px', backgroundColor: '#FFFBEB', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Calendar size={14} color="#D97706" strokeWidth={2} />
                  </div>
                  <span style={{ fontSize: '10.5px', fontWeight: 500, color: '#66789B', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>Founded Year</span>
                </div>
                <div style={{ fontSize: '12px', fontWeight: 600, color: '#102A5C', lineHeight: '16px', paddingLeft: '30px', wordBreak: 'break-word', overflowWrap: 'anywhere' }}>
                  {company.founded_year || '2005'}
                </div>
              </div>
            </div>

            <div style={{ height: '1px', backgroundColor: '#E5EAF2', margin: '10px 0' }} />

            {/* Row 3: GST Number & Email */}
            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)', gap: '12px' }}>
              <div style={{ minWidth: 0, overflow: 'hidden' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                  <div style={{ width: '24px', height: '24px', borderRadius: '6px', backgroundColor: '#EFF5FF', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <FileText size={14} color="#1764E8" strokeWidth={2} />
                  </div>
                  <span style={{ fontSize: '10.5px', fontWeight: 500, color: '#66789B', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>GSTIN Registration</span>
                </div>
                <div style={{ fontSize: '12px', fontWeight: 600, color: '#102A5C', lineHeight: '16px', paddingLeft: '30px', fontFamily: 'monospace', wordBreak: 'break-all' }}>
                  {company.gst_number || company.gstin || '27AABCU9603R1ZN'}
                </div>
              </div>

              <div style={{ minWidth: 0, overflow: 'hidden' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                  <div style={{ width: '24px', height: '24px', borderRadius: '6px', backgroundColor: '#EEF4FF', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Mail size={14} color="#1764E8" strokeWidth={2} />
                  </div>
                  <span style={{ fontSize: '10.5px', fontWeight: 500, color: '#66789B', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>HR / Contact Email</span>
                </div>
                <div style={{ fontSize: '12px', fontWeight: 600, color: '#102A5C', lineHeight: '16px', paddingLeft: '30px', minWidth: 0, overflow: 'hidden' }}>
                  <a
                    href={`mailto:${company.email || 'hr@jobmarket.in'}`}
                    style={{
                      color: '#1764E8',
                      textDecoration: 'none',
                      display: 'block',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                      maxWidth: '100%'
                    }}
                    title={company.email || 'hr@jobmarket.in'}
                  >
                    {company.email || 'hr@jobmarket.in'}
                  </a>
                </div>
              </div>
            </div>

            <div style={{ height: '1px', backgroundColor: '#E5EAF2', margin: '10px 0' }} />

            {/* Row 4: Phone & Website */}
            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)', gap: '12px' }}>
              <div style={{ minWidth: 0, overflow: 'hidden' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                  <div style={{ width: '24px', height: '24px', borderRadius: '6px', backgroundColor: '#ECFAF7', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Phone size={14} color="#21A99B" strokeWidth={2} />
                  </div>
                  <span style={{ fontSize: '10.5px', fontWeight: 500, color: '#66789B', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>Contact Phone</span>
                </div>
                <div style={{ fontSize: '12px', fontWeight: 600, color: '#102A5C', lineHeight: '16px', paddingLeft: '30px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {company.phone ? (
                    <a href={`tel:${company.phone}`} style={{ color: '#102A5C', textDecoration: 'none' }}>
                      {company.phone}
                    </a>
                  ) : (
                    'Provided upon application'
                  )}
                </div>
              </div>

              <div style={{ minWidth: 0, overflow: 'hidden' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                  <div style={{ width: '24px', height: '24px', borderRadius: '6px', backgroundColor: '#EFF5FF', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Globe size={14} color="#1764E8" strokeWidth={2} />
                  </div>
                  <span style={{ fontSize: '10.5px', fontWeight: 500, color: '#66789B', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>Website Portal</span>
                </div>
                <div style={{ fontSize: '12px', fontWeight: 600, color: '#1764E8', lineHeight: '16px', paddingLeft: '30px', minWidth: 0, overflow: 'hidden' }}>
                  {company.website ? (
                    <a
                      href={company.website.startsWith('http') ? company.website : `https://${company.website}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        color: '#1764E8',
                        textDecoration: 'none',
                        display: 'block',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                        maxWidth: '100%'
                      }}
                      title={company.website}
                    >
                      {company.website.replace(/^https?:\/\//, '')}
                    </a>
                  ) : (
                    <span style={{ color: '#657796' }}>jobmarket.in</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 5. Active Job Openings Section (Exact Mobile App UI) */}
        <div style={{
          backgroundColor: '#FFFFFF',
          borderRadius: '8px',
          border: '1px solid #E7EBF2',
          padding: '16px',
          margin: '0 16px 12px 16px',
          boxShadow: '0 2px 6px rgba(20, 42, 80, 0.04)'
        }}>
          {/* Header Row */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <h3 style={{ fontSize: '14.5px', fontWeight: 700, color: '#102A5C', margin: 0 }}>
                Active Job Openings
              </h3>
              <div style={{
                backgroundColor: '#EFF6FF',
                color: '#1764E8',
                fontSize: '11px',
                fontWeight: 700,
                padding: '1px 6px',
                borderRadius: '8px'
              }}>
                {filteredJobs.length}
              </div>
            </div>

            <button
              onClick={() => navigate('/jobs')}
              style={{
                background: 'none',
                border: 'none',
                color: '#1764E8',
                fontSize: '11.5px',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: '2px',
                cursor: 'pointer',
                padding: 0
              }}
            >
              <span>View all</span>
              <ChevronRight size={14} strokeWidth={2.4} />
            </button>
          </div>

          {/* Search Box */}
          <div style={{
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
            backgroundColor: '#FFFFFF',
            border: '1px solid #DCE3EE',
            borderRadius: '12px',
            padding: '0 10px',
            height: '38px',
            gap: '8px',
            marginBottom: '8px'
          }}>
            <Search size={12} color="#91A0BA" strokeWidth={2} style={{ flexShrink: 0 }} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search vacancies by title, trade, location..."
              style={{
                border: 'none',
                outline: 'none',
                backgroundColor: 'transparent',
                fontSize: '12px',
                fontWeight: 500,
                color: '#102A5C',
                width: '100%',
                padding: 0
              }}
            />
          </div>

          {/* Jobs List */}
          {loadingJobs ? (
            <div style={{ padding: '24px', textAlign: 'center', color: '#657796', fontSize: '12px' }}>
              Loading active job vacancies...
            </div>
          ) : filteredJobs.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {filteredJobs.map((jobItem, idx) => (
                <div
                  key={jobItem.id || idx}
                  onClick={() => navigate(`/job/${jobItem.id}`)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '10px 0',
                    borderTop: idx > 0 ? '1px solid #DFE5EE' : 'none',
                    cursor: 'pointer'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1, minWidth: 0 }}>
                    <div style={{
                      width: '36px',
                      height: '36px',
                      borderRadius: '10px',
                      backgroundColor: idx % 2 === 0 ? '#F2F1FF' : '#ECFAF7',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0
                    }}>
                      <Building2 size={16} color={idx % 2 === 0 ? '#625CEB' : '#21A99B'} strokeWidth={2} />
                    </div>

                    <div style={{ flex: 1, minWidth: 0, justifyContent: 'center' }}>
                      <h4 style={{
                        fontSize: '13px',
                        fontWeight: 700,
                        color: '#102A5C',
                        margin: '0 0 1px 0',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap'
                      }}>
                        {jobItem.title}
                      </h4>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                        <MapPin size={10} color="#66789B" />
                        <span style={{ fontSize: '10.5px', color: '#66789B', fontWeight: 500 }}>
                          {jobItem.location || 'Waluj MIDC, Maharashtra'} • {jobItem.jobType || jobItem.job_type || 'Full Time'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px', flexShrink: 0, paddingLeft: '8px' }}>
                    <span style={{ fontSize: '10.5px', color: '#66789B', fontWeight: 500 }}>
                      {idx === 0 ? '2d ago' : '5d ago'}
                    </span>
                    <ChevronRight size={14} color="#94A3B8" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ padding: '24px', textAlign: 'center', color: '#657796', fontSize: '12px' }}>
              No vacancies match your search filter.
            </div>
          )}
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
    </div>
  );
};
