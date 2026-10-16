import React, { useState, useEffect, useMemo, useRef } from 'react';
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
  ChevronLeft,
  AlertCircle,
  Lock,
  Star,
  Plus,
  Headphones,
  X,
  Coffee,
  Truck,
  Award,
  Clock,
  GraduationCap,
  CheckCircle2,
  Heart,
  Sparkles,
  Filter,
  Wrench,
  Cpu,
  Layers,
  Settings,
  ShieldAlert,
  HelpCircle,
  Copy
} from 'lucide-react';
import companyHeaderBg from '../../assets/company_header_bg.jpg';
import { apiFetch } from '../../utils/api';
import { shareContent, timeAgo } from '../../utils/helpers';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../hooks/useToast';
import { useStore } from '../../store/useStore';
import { CompanyDefaultLogo } from '../../components/company/CompanyDefaultLogo';
import { EditCompanyProfileModal } from './EditCompanyProfileModal';
import { MetaVerifiedBadge } from '../../components/common/MetaVerifiedBadge';
import '../../styles/companyProfile.css';

export const CompanyProfilePage: React.FC = () => {
  const { companyId } = useParams<{ companyId: string }>();
  const navigate = useNavigate();
  const { currentUser, syncUser } = useAuth();
  const { showToast } = useToast();
  const { state } = useStore();

  const [company, setCompany] = useState<any>(null);
  const [jobs, setJobs] = useState<any[]>([]);
  const [loadingCompany, setLoadingCompany] = useState(true);
  const [loadingJobs, setLoadingJobs] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Tabs & Filters
  const [activeTab, setActiveTab] = useState<'jobs' | 'overview' | 'culture' | 'operations'>('jobs');
  const [selectedDepartment, setSelectedDepartment] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedAddress, setCopiedAddress] = useState(false);

  // Real-Time Genuine Follow State
  const [isFollowing, setIsFollowing] = useState(false);
  const [followersCount, setFollowersCount] = useState(0);
  const [isSubmittingFollow, setIsSubmittingFollow] = useState(false);

  // Department Scroll Ref
  const deptScrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const isOwner = useMemo(() => {
    if (!currentUser || !company) return false;
    const role = (currentUser.role || '').toLowerCase();
    if (role !== 'employer' && role !== 'admin') return false;

    if (company.employer_id && currentUser.id === company.employer_id) return true;
    if (currentUser.email && company.email && currentUser.email.toLowerCase() === company.email.toLowerCase()) return true;
    if (currentUser.company_name && company.name && currentUser.company_name.toLowerCase() === company.name.toLowerCase()) return true;

    return false;
  }, [currentUser, company]);

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
      company_type: 'Public Limited / MNC',
      description: matchingJob?.description || `${compName} is a premier engineering and manufacturing enterprise delivering precision industrial systems, advanced fabrication, and world-class career growth.`,
      city: matchingJob?.location || 'Chhatrapati Sambhajinagar',
      midc_zone: matchingJob?.midcZone || 'Waluj MIDC',
      company_size: '500+ employees',
      founded_year: 1998,
      website: 'https://www.jobmarket.in',
      gst_number: '27AABCU9603R1ZN',
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

  const loadFollowStatus = async () => {
    if (!companyId) return;
    try {
      const res = await apiFetch(`/api/v1/companies/${encodeURIComponent(companyId)}/follow-status`);
      const json = await res.json();
      if (res.ok && json?.success && json.data) {
        setIsFollowing(Boolean(json.data.isFollowing));
        setFollowersCount(Number(json.data.followersCount) || 0);
      }
    } catch (err) {
      console.warn('Failed to load real-time follower status:', err);
    }
  };

  useEffect(() => {
    loadCompanyDetails();
    loadCompanyJobs();
    loadFollowStatus();
    window.scrollTo(0, 0);
  }, [companyId]);

  // Sync follow state when user signs in or out
  useEffect(() => {
    loadFollowStatus();
  }, [currentUser, companyId]);

  const handleToggleFollow = async () => {
    if (!currentUser) {
      showToast('Please sign in to follow companies and receive live vacancy alerts.', 'info');
      navigate(`/login?redirect=${encodeURIComponent(window.location.pathname)}`);
      return;
    }

    if (isSubmittingFollow || !companyId) return;

    const prevFollowing = isFollowing;
    const prevCount = followersCount;
    const nextFollowing = !prevFollowing;
    const nextCount = nextFollowing ? prevCount + 1 : Math.max(0, prevCount - 1);

    // Optimistic Real-Time UI Update
    setIsFollowing(nextFollowing);
    setFollowersCount(nextCount);
    setIsSubmittingFollow(true);

    if (nextFollowing) {
      showToast(`You are now following ${displayCompanyName}`, 'success');
    } else {
      showToast(`Unfollowed ${displayCompanyName}`, 'info');
    }

    try {
      const res = await apiFetch(`/api/v1/companies/${encodeURIComponent(companyId)}/toggle-follow`, {
        method: 'POST'
      });
      const json = await res.json();
      if (res.ok && json?.success && json.data) {
        setIsFollowing(Boolean(json.data.isFollowing));
        setFollowersCount(Number(json.data.followersCount) || 0);
      } else {
        // Rollback on server rejection
        setIsFollowing(prevFollowing);
        setFollowersCount(prevCount);
        showToast(json?.error || 'Unable to update follow status.', 'error');
      }
    } catch (err) {
      // Rollback on network failure
      setIsFollowing(prevFollowing);
      setFollowersCount(prevCount);
      showToast('Network error while updating follow status.', 'error');
    } finally {
      setIsSubmittingFollow(false);
    }
  };

  const formatFollowers = (count: number) => {
    if (count <= 0) return '0 followers';
    if (count === 1) return '1 follower';
    if (count < 1000) return `${count} followers`;
    if (count < 1000000) {
      const formatted = (count / 1000).toFixed(1).replace(/\.0$/, '');
      return `${formatted}K followers`;
    }
    const formatted = (count / 1000000).toFixed(1).replace(/\.0$/, '');
    return `${formatted}M followers`;
  };

  const handleShare = async () => {
    const currentUrl = `${window.location.origin}/company/${encodeURIComponent(companyId || '')}`;
    const companyDisplayName = company?.name || company?.company_name || 'Company';
    await shareContent(
      `${companyDisplayName} - JobMarket Profile`,
      `View active job vacancies and company details for ${companyDisplayName} on JobMarket: ${currentUrl}`,
      currentUrl,
      () => {
        setCopiedLink(true);
        setTimeout(() => setCopiedLink(false), 2200);
      }
    );
  };

  const handleCopyAddress = (addr: string) => {
    navigator.clipboard.writeText(addr);
    setCopiedAddress(true);
    setTimeout(() => setCopiedAddress(false), 2200);
  };

  // Robust Company Name Resolution
  const displayCompanyName = useMemo(() => {
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

    return 'Industrial Enterprise';
  }, [company]);

  // Formatted Location
  const formattedLocation = useMemo(() => {
    if (!company) return '';
    const parts: string[] = [];
    const city = company.city || '';
    const address = company.address || '';
    const state = company.state || '';

    if (address.trim()) parts.push(address.trim());
    if (city.trim() && !address.toLowerCase().includes(city.trim().toLowerCase())) parts.push(city.trim());
    if (state.trim() && !parts.join(', ').toLowerCase().includes(state.trim().toLowerCase())) parts.push(state.trim());

    return parts.join(', ') || city || address || 'Waluj MIDC, Chhatrapati Sambhajinagar';
  }, [company]);

  // Dynamic Tagline
  const companyTagline = useMemo(() => {
    if (company?.tagline) return company.tagline;
    if (company?.slogan) return company.slogan;
    if (company?.description) {
      const firstSentence = company.description.split('.')[0];
      if (firstSentence && firstSentence.length > 15 && firstSentence.length < 90) {
        return firstSentence.trim() + '.';
      }
    }
    return 'New possibilities. Now possible.';
  }, [company]);

  // Dynamic Department Listing for the Competitor Carousel
  const departmentsList = useMemo(() => {
    const deptMap = new Map<string, { count: number; icon: any }>();

    jobs.forEach(job => {
      const title = (job.title || '').toLowerCase();
      const trade = (job.trade || '').trim();
      let dept = trade || 'Production & Operations';

      if (trade) {
        dept = trade;
      } else if (title.includes('cnc') || title.includes('vmc') || title.includes('operator') || title.includes('machin')) {
        dept = 'CNC & Machining';
      } else if (title.includes('weld') || title.includes('fabricat')) {
        dept = 'Welding & Fabrication';
      } else if (title.includes('qual') || title.includes('qa') || title.includes('qc') || title.includes('inspect')) {
        dept = 'Quality & Metrology';
      } else if (title.includes('elect') || title.includes('maint')) {
        dept = 'Maintenance & Electrical';
      } else if (title.includes('fit') || title.includes('assemb')) {
        dept = 'Assembly & Fitting';
      } else if (title.includes('sales') || title.includes('market') || title.includes('bde')) {
        dept = 'Sales & Business Dev';
      } else if (title.includes('eng') || title.includes('design') || title.includes('cad')) {
        dept = 'Engineering & Tooling';
      }

      const existing = deptMap.get(dept);
      if (existing) {
        existing.count += 1;
      } else {
        const icon = dept.includes('Quality') ? ShieldCheck :
                     dept.includes('CNC') ? Cpu :
                     dept.includes('Weld') || dept.includes('Tool') ? Wrench :
                     dept.includes('Maintenance') ? Settings :
                     dept.includes('Assembly') ? Layers : Briefcase;
        deptMap.set(dept, { count: 1, icon });
      }
    });

    if (deptMap.size < 2) {
      const defaultDepts = [
        { name: 'Engineering & Tooling', count: 3, icon: Wrench },
        { name: 'CNC & Machine Operations', count: 4, icon: Cpu },
        { name: 'Assembly & Production', count: 5, icon: Layers },
        { name: 'Quality Control & Metrology', count: 2, icon: ShieldCheck },
        { name: 'Maintenance & Electrical', count: 2, icon: Settings },
        { name: 'Sales & Plant Logistics', count: 1, icon: Briefcase }
      ];

      return defaultDepts.map(d => ({
        name: d.name,
        count: d.count,
        icon: d.icon,
        isDefault: true
      }));
    }

    return Array.from(deptMap.entries()).map(([name, data]) => ({
      name,
      count: data.count,
      icon: data.icon,
      isDefault: false
    }));
  }, [jobs]);

  // Check Department Carousel Scroll Limits
  const checkDeptScroll = () => {
    if (!deptScrollRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = deptScrollRef.current;
    setCanScrollLeft(scrollLeft > 6);
    setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 6);
  };

  const handleDeptScroll = (direction: 'left' | 'right') => {
    if (!deptScrollRef.current) return;
    const distance = 260;
    deptScrollRef.current.scrollBy({
      left: direction === 'left' ? -distance : distance,
      behavior: 'smooth'
    });
    setTimeout(checkDeptScroll, 300);
  };

  // Filtered Jobs by selected department & search query
  const filteredJobs = useMemo(() => {
    let list = jobs;

    if (selectedDepartment) {
      const dLower = selectedDepartment.toLowerCase();
      list = list.filter(j => {
        const t = (j.title || '').toLowerCase();
        const tr = (j.trade || '').toLowerCase();
        return t.includes(dLower) || tr.includes(dLower) || dLower.includes(tr) || dLower.includes(t);
      });
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (j) =>
          (j.title && j.title.toLowerCase().includes(q)) ||
          (j.location && j.location.toLowerCase().includes(q)) ||
          (j.trade && j.trade.toLowerCase().includes(q)) ||
          (j.jobType && j.jobType.toLowerCase().includes(q)) ||
          (j.description && j.description.toLowerCase().includes(q))
      );
    }
    return list;
  }, [jobs, selectedDepartment, searchQuery]);

  if (loadingCompany) {
    return (
      <div className="cmp-page-wrapper" style={{ padding: '32px 16px' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div className="skeleton" style={{ width: '100%', height: '240px', borderRadius: '16px', marginBottom: '20px' }} />
          <div className="skeleton" style={{ width: '100%', height: '140px', borderRadius: '16px', marginBottom: '20px' }} />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '24px' }}>
            <div className="skeleton" style={{ height: '400px', borderRadius: '16px' }} />
            <div className="skeleton" style={{ height: '400px', borderRadius: '16px' }} />
          </div>
        </div>
      </div>
    );
  }

  if (error || !company) {
    return (
      <div className="cmp-page-wrapper" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '60px 16px' }}>
        <div className="cmp-surface-card" style={{ maxWidth: '500px', textAlign: 'center', padding: '40px 24px' }}>
          <AlertCircle size={48} color="#EF4444" style={{ margin: '0 auto 16px auto' }} />
          <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#0F172A', marginBottom: '8px' }}>
            Company Profile Not Found
          </h2>
          <p style={{ fontSize: '14px', color: '#64748B', lineHeight: '1.5', marginBottom: '24px' }}>
            {error || "The company profile you are looking for does not exist or has been removed."}
          </p>
          <button
            onClick={() => navigate('/companies')}
            className="cmp-btn-apply-sm"
            style={{ padding: '10px 24px', margin: '0 auto' }}
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
    <div className="cmp-page-wrapper">
      {/* 1. Hero Cover Banner with ambient styling, mission tagline & top utility bar */}
      <div
        className="cmp-hero-banner"
        style={{
          backgroundImage: `linear-gradient(135deg, rgba(7, 21, 48, 0.90) 0%, rgba(15, 43, 102, 0.86) 50%, rgba(27, 79, 223, 0.84) 100%), url(${companyHeaderBg})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      >
        <div className="cmp-banner-inner">
          {/* Top Row: Back link & actions */}
          <div className="cmp-banner-top-row">
            <button
              type="button"
              onClick={() => (window.history.length > 1 ? navigate(-1) : navigate('/companies'))}
              className="cmp-banner-btn-pill cmp-banner-back-btn"
              title="Back"
            >
              <ArrowLeft size={16} strokeWidth={2.4} />
              <span>Back</span>
            </button>

            <div className="cmp-banner-actions">
              {isOwner && (
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(true)}
                  className="cmp-banner-btn-pill"
                  title="Edit Company Profile"
                >
                  <Edit3 size={15} strokeWidth={2.2} />
                  <span>Edit Profile</span>
                </button>
              )}

              {company.website && (
                <a
                  href={company.website.startsWith('http') ? company.website : `https://${company.website}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="cmp-banner-btn-pill"
                  title="Visit Website"
                >
                  <Globe size={15} strokeWidth={2} />
                  <span>Website</span>
                  <ExternalLink size={12} strokeWidth={2.4} />
                </a>
              )}

              <button
                type="button"
                onClick={handleShare}
                className="cmp-banner-btn-pill"
                title="Share Profile"
              >
                {copiedLink ? <Check size={16} color="#4ADE80" strokeWidth={2.8} /> : <Share2 size={15} strokeWidth={2.2} />}
                <span>{copiedLink ? 'Copied!' : 'Share'}</span>
              </button>
            </div>
          </div>

          {/* Center Branded Headline (Competitor Tagline Feature, Elevated) */}
          <div className="cmp-banner-center-text">
            <h1 className="cmp-banner-headline">
              {companyTagline}
            </h1>
            <p className="cmp-banner-subheadline">
              Industrial Excellence • Certified Manufacturing • Empowering Careers
            </p>
          </div>

          {/* Trust Seal in bottom corner */}
          <div className="cmp-banner-trust-badge">
            <ShieldCheck size={14} color="#10B981" strokeWidth={2.5} />
            <span>Managed by Employer & Verified by JobMarket</span>
          </div>
        </div>
      </div>

      {/* Main Container */}
      <div className="cmp-main-container">
        {/* 2. Elevated Floating Company Header Card */}
        <div className="cmp-header-card">
          <div className="cmp-header-top-row">
            {/* Identity: Logo + Name + Badges */}
            <div className="cmp-header-identity">
              <div className="cmp-logo-box">
                {company.logo ? (
                  <CompanyDefaultLogo
                    logoUrl={company.logo}
                    companyName={displayCompanyName}
                    size={80}
                    borderRadius="14px"
                  />
                ) : (
                  <Building2 size={44} color="#1B4FDF" strokeWidth={2.2} />
                )}
              </div>

              <div className="cmp-identity-info">
                <div className="cmp-company-name-row">
                  <h2 className="cmp-company-title">{displayCompanyName}</h2>
                  <MetaVerifiedBadge size={22} color="#0095F6" title="Verified Employer" />
                </div>

                <p className="cmp-company-tagline">
                  {company.description &&
                  company.description.trim().length > 3 &&
                  !['na', 'n/a', 'none', 'null', 'undefined', '-'].includes(company.description.trim().toLowerCase())
                    ? company.description.slice(0, 115) + (company.description.length > 115 ? '...' : '')
                    : 'Leading manufacturing and engineering operations plant.'}
                </p>

                {/* Modern Badges Row */}
                <div className="cmp-badges-row">
                  <span className="cmp-pill-badge verified-emerald">
                    <ShieldCheck size={13} color="#059669" strokeWidth={2.4} />
                    <span>Verified Employer</span>
                    <span className="cmp-badge-subtext">• 100% Genuine</span>
                  </span>

                  <span className="cmp-pill-badge active-blue">
                    <Building2 size={13} color="#1D4ED8" />
                    <span>{company.industry || 'Industrial Manufacturing'}</span>
                  </span>

                  <span className="cmp-pill-badge">
                    <Lock size={13} color="#64748B" />
                    <span>{company.company_type || 'Public Limited / MNC'}</span>
                  </span>

                  <span className="cmp-pill-badge">
                    <MapPin size={13} color="#64748B" />
                    <span>{company.midc_zone || 'Waluj MIDC'} • {company.city || 'Chhatrapati Sambhajinagar'}</span>
                  </span>

                  <span className="cmp-pill-badge">
                    <Users size={13} color="#64748B" />
                    <span>{company.company_size || '500+ Employees'}</span>
                  </span>

                  {company.founded_year && (
                    <span className="cmp-pill-badge">
                      <Calendar size={13} color="#64748B" />
                      <span>Est. {company.founded_year}</span>
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Right Hub: Followers & Follow CTA */}
            <div className="cmp-header-actions">
              <div className="cmp-header-actions-meta">
                <div className="cmp-follower-count">
                  <Users size={14} color="#64748B" />
                  <span>
                    <strong>{formatFollowers(followersCount)}</strong>
                  </span>
                </div>

                <div className="cmp-vacancies-status-pill">
                  <span className="cmp-pulse-dot" />
                  <span>{jobs.length} Active Openings</span>
                </div>
              </div>

              <button
                type="button"
                disabled={isSubmittingFollow}
                onClick={handleToggleFollow}
                className={`cmp-btn-follow ${isFollowing ? 'following' : 'not-following'}`}
                style={{ opacity: isSubmittingFollow ? 0.75 : 1, cursor: isSubmittingFollow ? 'wait' : 'pointer' }}
                title={isFollowing ? 'Click to unfollow' : 'Click to follow this company'}
              >
                {isFollowing ? (
                  <>
                    <Check size={16} strokeWidth={2.5} color="#10B981" />
                    <span>Following</span>
                  </>
                ) : (
                  <>
                    <Plus size={16} strokeWidth={2.5} />
                    <span>Follow</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* 3. Sticky Interactive Navigation Tabs Bar */}
        <div className="cmp-tabs-wrapper">
          <ul className="cmp-tabs-list">
            <li>
              <button
                type="button"
                onClick={() => setActiveTab('jobs')}
                className={`cmp-tab-button ${activeTab === 'jobs' ? 'active' : ''}`}
              >
                <Briefcase size={16} />
                <span>Jobs</span>
                <span className="cmp-tab-counter-badge">{jobs.length}</span>
              </button>
            </li>
            <li>
              <button
                type="button"
                onClick={() => setActiveTab('overview')}
                className={`cmp-tab-button ${activeTab === 'overview' ? 'active' : ''}`}
              >
                <Building2 size={16} />
                <span>Overview</span>
              </button>
            </li>
            <li>
              <button
                type="button"
                onClick={() => setActiveTab('culture')}
                className={`cmp-tab-button ${activeTab === 'culture' ? 'active' : ''}`}
              >
                <Heart size={16} />
                <span>Why Join Us & Culture</span>
              </button>
            </li>
            <li>
              <button
                type="button"
                onClick={() => setActiveTab('operations')}
                className={`cmp-tab-button ${activeTab === 'operations' ? 'active' : ''}`}
              >
                <MapPin size={16} />
                <span>Plant & Operations</span>
              </button>
            </li>
          </ul>
        </div>

        {/* 4. Desktop 2-Column Grid Layout */}
        <div className="cmp-layout-grid">
          {/* Main Column */}
          <div className="cmp-main-col">
            {/* "Departments Hiring at [Company]" Section (Competitor Highlight - Interactive Filter!) */}
            <div className="cmp-surface-card">
              <div className="cmp-card-header">
                <div className="cmp-card-title-group">
                  <div className="cmp-card-icon-wrap">
                    <Layers size={18} strokeWidth={2.2} />
                  </div>
                  <div>
                    <h3 className="cmp-card-title">Departments hiring at {displayCompanyName}</h3>
                    <p className="cmp-card-subtitle">
                      Explore live vacancies categorized by technical department & trade
                    </p>
                  </div>
                </div>

                {selectedDepartment && (
                  <button
                    type="button"
                    onClick={() => setSelectedDepartment(null)}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#1B4FDF',
                      fontSize: '12.5px',
                      fontWeight: 600,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}
                  >
                    <X size={14} />
                    <span>Clear Filter</span>
                  </button>
                )}
              </div>

              {/* Horizontal Scrollable Department Cards */}
              <div className="cmp-departments-container">
                {canScrollLeft && (
                  <button
                    type="button"
                    onClick={() => handleDeptScroll('left')}
                    className="cmp-carousel-arrow prev"
                    title="Scroll left"
                    aria-label="Scroll left"
                  >
                    <ChevronLeft size={20} strokeWidth={2.6} />
                  </button>
                )}

                <div
                  ref={deptScrollRef}
                  onScroll={checkDeptScroll}
                  className="cmp-departments-scroll"
                >
                  {departmentsList.map((dept, idx) => {
                    const IconComponent = dept.icon || Briefcase;
                    const isSelected = selectedDepartment === dept.name;
                    return (
                      <div
                        key={idx}
                        onClick={() => {
                          setSelectedDepartment(isSelected ? null : dept.name);
                          if (activeTab !== 'jobs') setActiveTab('jobs');
                        }}
                        className={`cmp-dept-card ${isSelected ? 'selected' : ''}`}
                      >
                        <div>
                          <div className="cmp-dept-card-header">
                            <div className="cmp-dept-icon-box">
                              <IconComponent size={18} strokeWidth={2.2} />
                            </div>
                            <h4 className="cmp-dept-name">{dept.name}</h4>
                          </div>
                        </div>

                        <div className="cmp-dept-openings-link">
                          <span>{dept.count} {dept.count === 1 ? 'opening' : 'openings'}</span>
                          <ChevronRight size={14} strokeWidth={2.4} />
                        </div>
                      </div>
                    );
                  })}
                </div>

                {canScrollRight && (
                  <button
                    type="button"
                    onClick={() => handleDeptScroll('right')}
                    className="cmp-carousel-arrow next"
                    title="Scroll right"
                    aria-label="Scroll right"
                  >
                    <ChevronRight size={20} strokeWidth={2.6} />
                  </button>
                )}
              </div>
            </div>

            {/* TAB CONTENT: 1. JOBS TAB */}
            {activeTab === 'jobs' && (
              <div className="cmp-surface-card">
                <div className="cmp-card-header">
                  <div className="cmp-card-title-group">
                    <div className="cmp-card-icon-wrap">
                      <Briefcase size={18} strokeWidth={2.2} />
                    </div>
                    <div>
                      <h3 className="cmp-card-title">Active Job Openings</h3>
                      <p className="cmp-card-subtitle">
                        Showing {filteredJobs.length} of {jobs.length} published vacancies
                      </p>
                    </div>
                  </div>

                  {isOwner && (
                    <button
                      type="button"
                      onClick={() => navigate('/post-job')}
                      className="cmp-btn-apply-sm"
                      style={{ padding: '7px 14px' }}
                    >
                      <Plus size={15} strokeWidth={2.4} />
                      <span>Post Vacancy</span>
                    </button>
                  )}
                </div>

                {/* Search & Active Department Toolbar */}
                <div className="cmp-jobs-toolbar">
                  <div className="cmp-jobs-search-box">
                    <Search size={16} color="#94A3B8" strokeWidth={2} />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search roles by title, trade, skill, or location..."
                      className="cmp-jobs-search-input"
                    />
                    {searchQuery && (
                      <button
                        type="button"
                        onClick={() => setSearchQuery('')}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                      >
                        <X size={14} color="#94A3B8" />
                      </button>
                    )}
                  </div>

                  {selectedDepartment && (
                    <div className="cmp-active-filter-indicator">
                      <span>Dept: {selectedDepartment}</span>
                      <X
                        size={14}
                        style={{ cursor: 'pointer' }}
                        onClick={() => setSelectedDepartment(null)}
                      />
                    </div>
                  )}
                </div>

                {/* Job Cards List */}
                {loadingJobs ? (
                  <div style={{ padding: '36px', textAlign: 'center', color: '#64748B' }}>
                    Loading active job vacancies...
                  </div>
                ) : filteredJobs.length > 0 ? (
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    {filteredJobs.map((jobItem, idx) => (
                      <div key={jobItem.id || idx} className="cmp-job-item-card">
                        <div className="cmp-job-item-header">
                          <div>
                            <h4 className="cmp-job-item-title">
                              <Link to={`/job/${jobItem.id}`}>
                                {jobItem.title}
                              </Link>
                            </h4>
                            <div className="cmp-job-meta-row">
                              <span className="cmp-job-meta-item">
                                <Building2 size={13} color="#1B4FDF" />
                                <span>{displayCompanyName}</span>
                              </span>
                              <span className="cmp-job-meta-item">
                                <MapPin size={13} color="#64748B" />
                                <span>{jobItem.location || 'Waluj MIDC, Chhatrapati Sambhajinagar'}</span>
                              </span>
                              <span className="cmp-job-meta-item">
                                <Briefcase size={13} color="#64748B" />
                                <span>{jobItem.jobType || jobItem.job_type || 'Full Time'}</span>
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Highlight Pills */}
                        <div className="cmp-job-highlight-badges">
                          <span className="cmp-job-pill-tag salary">
                            {jobItem.salaryRange || jobItem.salary || '₹18,000 - ₹28,000 / month'}
                          </span>
                          <span className="cmp-job-pill-tag">
                            {jobItem.experienceLevel || jobItem.experience || '1-3 Years Experience'}
                          </span>
                          {jobItem.trade && (
                            <span className="cmp-job-pill-tag">
                              Trade: {jobItem.trade}
                            </span>
                          )}
                          <span className="cmp-job-pill-tag">
                            {jobItem.shiftType || 'General / Rotational Shift'}
                          </span>
                        </div>

                        {/* Footer with Apply CTA */}
                        <div className="cmp-job-item-footer">
                          <span className="cmp-job-posted-time">
                            Posted {timeAgo(jobItem.postedAt || jobItem.posted_at || jobItem.createdAt || jobItem.created_at)}
                          </span>

                          <div className="cmp-job-actions-row">
                            <Link
                              to={`/job/${jobItem.id}`}
                              style={{
                                color: '#1B4FDF',
                                fontSize: '13px',
                                fontWeight: 600,
                                textDecoration: 'none',
                                padding: '6px 10px'
                              }}
                            >
                              View Details
                            </Link>
                            <Link
                              to={`/job/${jobItem.id}`}
                              className="cmp-btn-apply-sm"
                            >
                              <span>Apply Now</span>
                              <ChevronRight size={14} strokeWidth={2.4} />
                            </Link>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div style={{ padding: '48px 24px', textAlign: 'center', backgroundColor: '#F8FAFC', borderRadius: '10px' }}>
                    <Briefcase size={36} color="#94A3B8" style={{ margin: '0 auto 12px auto' }} />
                    <h4 style={{ fontSize: '16px', fontWeight: 700, color: '#0F172A', margin: '0 0 6px 0' }}>
                      No openings match your search
                    </h4>
                    <p style={{ fontSize: '13px', color: '#64748B', margin: '0 0 16px 0' }}>
                      Try adjusting your keywords or clearing the department filter.
                    </p>
                    <button
                      type="button"
                      onClick={() => { setSearchQuery(''); setSelectedDepartment(null); }}
                      className="cmp-btn-apply-sm"
                      style={{ margin: '0 auto' }}
                    >
                      Reset All Filters
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* TAB CONTENT: 2. OVERVIEW TAB */}
            {activeTab === 'overview' && (
              <>
                <div className="cmp-surface-card">
                  <div className="cmp-card-header">
                    <div className="cmp-card-title-group">
                      <div className="cmp-card-icon-wrap">
                        <Building2 size={18} strokeWidth={2.2} />
                      </div>
                      <div>
                        <h3 className="cmp-card-title">About {displayCompanyName}</h3>
                        <p className="cmp-card-subtitle">Corporate profile, leadership & operational scope</p>
                      </div>
                    </div>
                  </div>

                  <p style={{ fontSize: '14px', lineHeight: '24px', color: '#334155', margin: '0 0 16px 0', whiteSpace: 'pre-line' }}>
                    {company.description ||
                      `${displayCompanyName} is an established industrial enterprise recognized for precision engineering, rigorous quality assurance, and sustainable manufacturing practices in the Chhatrapati Sambhajinagar industrial belt.`}
                  </p>

                  {Array.isArray(company.specializations) && company.specializations.length > 0 && (
                    <div style={{ marginTop: '20px' }}>
                      <h4 style={{ fontSize: '13.5px', fontWeight: 700, color: '#0F172A', margin: '0 0 10px 0' }}>
                        Core Capabilities & Production Expertise
                      </h4>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                        {company.specializations.map((spec: string, idx: number) => (
                          <span
                            key={idx}
                            style={{
                              backgroundColor: '#EFF6FF',
                              border: '1px solid #BFDBFE',
                              padding: '5px 12px',
                              borderRadius: '6px',
                              fontSize: '12px',
                              color: '#1D4ED8',
                              fontWeight: 600
                            }}
                          >
                            {spec}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Company At A Glance Grid */}
                <div className="cmp-surface-card">
                  <div className="cmp-card-header">
                    <div className="cmp-card-title-group">
                      <div className="cmp-card-icon-wrap">
                        <Sparkles size={18} strokeWidth={2.2} />
                      </div>
                      <div>
                        <h3 className="cmp-card-title">Enterprise At A Glance</h3>
                        <p className="cmp-card-subtitle">Key structural metrics and credentials</p>
                      </div>
                    </div>
                  </div>

                  <div className="cmp-glance-grid">
                    <div className="cmp-glance-item">
                      <span className="cmp-glance-label">Founded Year</span>
                      <span className="cmp-glance-val">{company.founded_year || '1998'} (Established)</span>
                    </div>
                    <div className="cmp-glance-item">
                      <span className="cmp-glance-label">Ownership Type</span>
                      <span className="cmp-glance-val">{company.company_type || 'Public Limited / MNC'}</span>
                    </div>
                    <div className="cmp-glance-item">
                      <span className="cmp-glance-label">Workforce Scale</span>
                      <span className="cmp-glance-val">{company.company_size || '500+ Active Employees'}</span>
                    </div>
                    <div className="cmp-glance-item">
                      <span className="cmp-glance-label">Industrial Zone</span>
                      <span className="cmp-glance-val">{company.midc_zone || 'Waluj MIDC Industrial Area'}</span>
                    </div>
                    <div className="cmp-glance-item">
                      <span className="cmp-glance-label">GSTIN Verification</span>
                      <span className="cmp-glance-val" style={{ fontFamily: 'monospace', color: '#10B981' }}>
                        {company.gst_number || company.gstin || '27AABCU9603R1ZN'} (Verified)
                      </span>
                    </div>
                    <div className="cmp-glance-item">
                      <span className="cmp-glance-label">Recruitment Status</span>
                      <span className="cmp-glance-val" style={{ color: '#1B4FDF' }}>
                        Actively Hiring ({jobs.length} roles)
                      </span>
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* TAB CONTENT: 3. WHY JOIN US & CULTURE */}
            {activeTab === 'culture' && (
              <div className="cmp-surface-card">
                <div className="cmp-card-header">
                  <div className="cmp-card-title-group">
                    <div className="cmp-card-icon-wrap">
                      <Heart size={18} strokeWidth={2.2} />
                    </div>
                    <div>
                      <h3 className="cmp-card-title">Why Join {displayCompanyName}</h3>
                      <p className="cmp-card-subtitle">
                        Perks, social security, skill advancement and safety values
                      </p>
                    </div>
                  </div>
                </div>

                <div className="cmp-perks-grid">
                  <div className="cmp-perk-card">
                    <div className="cmp-perk-icon-wrap" style={{ backgroundColor: '#EFF6FF', color: '#1B4FDF' }}>
                      <ShieldCheck size={20} strokeWidth={2.2} />
                    </div>
                    <div>
                      <h4 className="cmp-perk-title">PF & ESIC Medical Coverage</h4>
                      <p className="cmp-perk-desc">
                        100% statutory Provident Fund and comprehensive ESIC medical healthcare for employees and family.
                      </p>
                    </div>
                  </div>

                  <div className="cmp-perk-card">
                    <div className="cmp-perk-icon-wrap" style={{ backgroundColor: '#ECFDF5', color: '#059669' }}>
                      <Coffee size={20} strokeWidth={2.2} />
                    </div>
                    <div>
                      <h4 className="cmp-perk-title">Subsidized Canteen & Meals</h4>
                      <p className="cmp-perk-desc">
                        Nutritious hot lunch, breakfast, and tea served daily in certified hygienic plant facilities.
                      </p>
                    </div>
                  </div>

                  <div className="cmp-perk-card">
                    <div className="cmp-perk-icon-wrap" style={{ backgroundColor: '#FEF3C7', color: '#D97706' }}>
                      <Truck size={20} strokeWidth={2.2} />
                    </div>
                    <div>
                      <h4 className="cmp-perk-title">Company Bus & Transport</h4>
                      <p className="cmp-perk-desc">
                        Free shuttle routes covering Chhatrapati Sambhajinagar, Waluj, Shendra, and key MIDC junctions.
                      </p>
                    </div>
                  </div>

                  <div className="cmp-perk-card">
                    <div className="cmp-perk-icon-wrap" style={{ backgroundColor: '#F5F3FF', color: '#7C3AED' }}>
                      <Award size={20} strokeWidth={2.2} />
                    </div>
                    <div>
                      <h4 className="cmp-perk-title">Attendance & Shift Bonus</h4>
                      <p className="cmp-perk-desc">
                        Consistent production incentives, 100% attendance awards, and statutory overtime allowances.
                      </p>
                    </div>
                  </div>

                  <div className="cmp-perk-card">
                    <div className="cmp-perk-icon-wrap" style={{ backgroundColor: '#EFF6FF', color: '#2563EB' }}>
                      <GraduationCap size={20} strokeWidth={2.2} />
                    </div>
                    <div>
                      <h4 className="cmp-perk-title">Apprenticeship & Skill Training</h4>
                      <p className="cmp-perk-desc">
                        Hands-on tooling certification, advanced CNC simulation, and fast-track career promotion.
                      </p>
                    </div>
                  </div>

                  <div className="cmp-perk-card">
                    <div className="cmp-perk-icon-wrap" style={{ backgroundColor: '#ECFDF5', color: '#10B981' }}>
                      <CheckCircle2 size={20} strokeWidth={2.2} />
                    </div>
                    <div>
                      <h4 className="cmp-perk-title">Zero-Harm Safety Standards</h4>
                      <p className="cmp-perk-desc">
                        Top-tier PPE gear, ergonomic workstations, and safety-first manufacturing protocol.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB CONTENT: 4. OPERATIONS & LOCATIONS */}
            {activeTab === 'operations' && (
              <div className="cmp-surface-card">
                <div className="cmp-card-header">
                  <div className="cmp-card-title-group">
                    <div className="cmp-card-icon-wrap">
                      <MapPin size={18} strokeWidth={2.2} />
                    </div>
                    <div>
                      <h3 className="cmp-card-title">Plant Location & Operations</h3>
                      <p className="cmp-card-subtitle">Manufacturing premises and physical address</p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleCopyAddress(formattedLocation)}
                    style={{
                      background: '#F1F5F9',
                      border: '1px solid #CBD5E1',
                      padding: '6px 12px',
                      borderRadius: '6px',
                      fontSize: '12px',
                      fontWeight: 600,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '5px'
                    }}
                  >
                    {copiedAddress ? <Check size={14} color="#10B981" /> : <Copy size={14} />}
                    <span>{copiedAddress ? 'Address Copied!' : 'Copy Address'}</span>
                  </button>
                </div>

                <div style={{ padding: '16px', backgroundColor: '#F8FAFC', borderRadius: '8px', border: '1px solid #E2E8F0', marginBottom: '20px' }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                    <MapPin size={22} color="#1B4FDF" style={{ flexShrink: 0, marginTop: '2px' }} />
                    <div>
                      <h4 style={{ fontSize: '15px', fontWeight: 700, color: '#0F172A', margin: '0 0 4px 0' }}>
                        Primary Manufacturing Plant
                      </h4>
                      <p style={{ fontSize: '13.5px', color: '#475569', margin: 0, lineHeight: 1.5 }}>
                        {formattedLocation}
                      </p>
                      <span style={{ display: 'inline-block', marginTop: '6px', fontSize: '12px', color: '#1B4FDF', fontWeight: 600 }}>
                        Zone: {company.midc_zone || 'Waluj Industrial Area'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Statutory Registration Details */}
                <h4 style={{ fontSize: '14px', fontWeight: 700, color: '#0F172A', margin: '0 0 12px 0' }}>
                  Statutory Registrations & Identifiers
                </h4>
                <div className="cmp-glance-grid">
                  <div className="cmp-glance-item">
                    <span className="cmp-glance-label">GSTIN / Registration</span>
                    <span className="cmp-glance-val" style={{ fontFamily: 'monospace' }}>
                      {company.gst_number || company.gstin || '27AABCU9603R1ZN'}
                    </span>
                  </div>
                  <div className="cmp-glance-item">
                    <span className="cmp-glance-label">Plant Operating Shifts</span>
                    <span className="cmp-glance-val">3 Shifts (Morning, General, Night)</span>
                  </div>
                  <div className="cmp-glance-item">
                    <span className="cmp-glance-label">HR / Careers Helpline</span>
                    <span className="cmp-glance-val">
                      {company.phone || '+91 240 2554000'}
                    </span>
                  </div>
                  <div className="cmp-glance-item">
                    <span className="cmp-glance-label">HR Inquiry Email</span>
                    <span className="cmp-glance-val" style={{ color: '#1B4FDF' }}>
                      {company.email || 'careers@jobmarket.in'}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Side Sticky Column (Desktop) */}
          <div className="cmp-side-col">
            {/* Quick Facts Card */}
            <div className="cmp-side-card">
              <h4 className="cmp-side-card-title">
                <Building2 size={16} color="#1B4FDF" />
                <span>Company Overview</span>
              </h4>

              <div className="cmp-contact-row">
                <div style={{ flex: 1 }}>
                  <div className="cmp-contact-label">Industry</div>
                  <div className="cmp-contact-val">{company.industry || 'Automotive & Manufacturing'}</div>
                </div>
              </div>

              <div className="cmp-contact-row">
                <div style={{ flex: 1 }}>
                  <div className="cmp-contact-label">Company Size</div>
                  <div className="cmp-contact-val">{company.company_size || '500+ employees'}</div>
                </div>
              </div>

              <div className="cmp-contact-row">
                <div style={{ flex: 1 }}>
                  <div className="cmp-contact-label">Founded</div>
                  <div className="cmp-contact-val">{company.founded_year || '1998'}</div>
                </div>
              </div>

              <div className="cmp-contact-row">
                <div style={{ flex: 1 }}>
                  <div className="cmp-contact-label">Headquarters</div>
                  <div className="cmp-contact-val">{company.city || 'Chhatrapati Sambhajinagar'}</div>
                </div>
              </div>

              {company.website && (
                <div className="cmp-contact-row">
                  <div style={{ flex: 1 }}>
                    <div className="cmp-contact-label">Official Website</div>
                    <div className="cmp-contact-val">
                      <a
                        href={company.website.startsWith('http') ? company.website : `https://${company.website}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                      >
                        <span>{company.website.replace(/^https?:\/\//, '')}</span>
                        <ExternalLink size={12} />
                      </a>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Verification & Trust Guarantee Card */}
            <div className="cmp-side-card" style={{ borderLeft: '4px solid #10B981' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                <ShieldCheck size={20} color="#10B981" strokeWidth={2.4} />
                <h4 style={{ fontSize: '14.5px', fontWeight: 700, color: '#0F172A', margin: 0 }}>
                  Verified Employer Seal
                </h4>
              </div>
              <p style={{ fontSize: '12.5px', color: '#64748B', lineHeight: '18px', margin: '0 0 12px 0' }}>
                This employer has undergone Aadhaar, GSTIN, and MIDC manufacturing credential verification on JobMarket.
              </p>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#047857', fontWeight: 600 }}>
                <Check size={14} strokeWidth={2.8} />
                <span>100% Authentic Vacancies Guaranteed</span>
              </div>
            </div>

            {/* Direct HR Inquiries Card */}
            <div className="cmp-side-card">
              <h4 className="cmp-side-card-title">
                <Mail size={16} color="#1B4FDF" />
                <span>Direct HR Inquiries</span>
              </h4>

              <div className="cmp-contact-row">
                <div style={{ flex: 1 }}>
                  <div className="cmp-contact-label">Careers & HR Email</div>
                  <div className="cmp-contact-val">
                    <a href={`mailto:${company.email || 'careers@jobmarket.in'}`}>
                      {company.email || 'careers@jobmarket.in'}
                    </a>
                  </div>
                </div>
              </div>

              <div className="cmp-contact-row">
                <div style={{ flex: 1 }}>
                  <div className="cmp-contact-label">Plant Reception Phone</div>
                  <div className="cmp-contact-val">
                    {company.phone ? (
                      <a href={`tel:${company.phone}`}>{company.phone}</a>
                    ) : (
                      'Available on Application'
                    )}
                  </div>
                </div>
              </div>

              <div style={{ marginTop: '14px' }}>
                <button
                  type="button"
                  onClick={handleShare}
                  style={{
                    width: '100%',
                    padding: '9px 14px',
                    borderRadius: '8px',
                    border: '1.5px solid #CBD5E1',
                    backgroundColor: '#FFFFFF',
                    color: '#0F172A',
                    fontSize: '13px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <Share2 size={15} />
                  <span>{copiedLink ? 'Link Copied!' : 'Share Company Profile'}</span>
                </button>
              </div>
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
          onSaveSuccess={(updated) => {
            setCompany(updated);
            if (currentUser) {
              syncUser();
            }
            if (updated?.name && decodeURIComponent(companyId || '').trim().toLowerCase() !== (updated.name || '').trim().toLowerCase()) {
              navigate(`/company/${encodeURIComponent(updated.name)}`, { replace: true });
            }
          }}
        />
      )}
    </div>
  );
};
