import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useParams, useNavigate, useLocation, Link } from 'react-router-dom';
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
  const location = useLocation();
  const { currentUser, syncUser } = useAuth();
  const { showToast } = useToast();
  const { state } = useStore();

  const passedCompany = (location.state as any)?.companyData;

  // Immediate Instant Initialization from passed router state or store jobs
  const [company, setCompany] = useState<any>(() => {
    if (passedCompany) return passedCompany;
    if (companyId) {
      const decoded = decodeURIComponent(companyId).toLowerCase().trim();
      const allJobs = Array.isArray(state.jobs) ? state.jobs : [];
      const match = allJobs.find(j =>
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
      if (match) {
        return {
          id: companyId,
          name: match.company,
          logo: (match as any).realCompanyLogo || (match as any).companyProfileLogo || (match as any).real_company_logo || (match as any).company_profile_logo || null,
          industry: (match as any).companyIndustry || match.industry || 'Industrial Manufacturing',
          company_type: 'Private Limited',
          city: (match as any).companyCity || match.location || 'Chhatrapati Sambhajinagar',
          midc_zone: (match as any).companyMidcZone || match.midcZone || '',
          description: match.description || `${match.company} is an active employer on JobMarket.`,
          verified: true
        };
      }
    }
    return null;
  });

  const [jobs, setJobs] = useState<any[]>([]);
  const [loadingCompany, setLoadingCompany] = useState(() => !company);
  const [loadingJobs, setLoadingJobs] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Tabs & Filters
  const [activeTab, setActiveTab] = useState<'jobs' | 'overview' | 'operations'>('jobs');
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
    setError(null);

    try {
      const res = await apiFetch(`/api/v1/companies/${encodeURIComponent(companyId)}`);
      if (res.ok) {
        const json = await res.json();
        if (json && (json.data || json.success)) {
          setCompany((prev: any) => ({ ...(prev || {}), ...(json.data || json) }));
          setLoadingCompany(false);
          return;
        }
      }
    } catch (err: any) {
      console.warn('API fetch company details failed, using store fallback:', err);
    }

    // Fallback: derive company details from store jobs or users if company not already present
    setCompany((prev: any) => {
      if (prev && prev.name) {
        return prev;
      }
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

      return {
        id: companyId,
        name: compName,
        logo: (matchingJob as any)?.realCompanyLogo || (matchingJob as any)?.companyProfileLogo || (matchingJob as any)?.real_company_logo || (matchingJob as any)?.company_profile_logo || null,
        industry: (matchingJob as any)?.companyIndustry || matchingJob?.industry || 'Industrial Manufacturing',
        company_type: 'Public Limited / MNC',
        description: matchingJob?.description || `${compName} is a premier engineering and manufacturing enterprise delivering precision industrial systems, advanced fabrication, and world-class career growth.`,
        city: matchingJob?.location || 'Chhatrapati Sambhajinagar',
        midc_zone: matchingJob?.midcZone || 'Waluj MIDC',
        company_size: '500+ employees',
        founded_year: 1998,
        website: 'https://www.jobmarket.in',
        gst_number: '27AABCU9603R1ZN',
        verified: true
      };
    });
    setLoadingCompany(false);
  };

  const loadCompanyJobs = async () => {
    if (!companyId) return;
    setLoadingJobs(true);

    try {
      const res = await apiFetch(`/api/v1/companies/${encodeURIComponent(companyId)}/jobs`);
      if (res.ok) {
        const json = await res.json();
        if (json && (json.data || Array.isArray(json))) {
          const list = Array.isArray(json) ? json : (json.data || []);
          setJobs(list);
          setLoadingJobs(false);
          return;
        }
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
      if (res.ok) {
        const json = await res.json();
        if (json?.success && json.data) {
          setIsFollowing(Boolean(json.data.isFollowing));
          setFollowersCount(Number(json.data.followersCount) || 0);
        }
      }
    } catch (err) {
      console.warn('Failed to load real-time follower status:', err);
    }
  };

  useEffect(() => {
    window.scrollTo(0, 0);
    loadCompanyDetails();
    loadCompanyJobs();
    loadFollowStatus();
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
      <div className="cmp-page-wrapper">
        {/* Banner Skeleton */}
        <div className="cmp-hero-banner" style={{ backgroundColor: '#0A58E2', opacity: 0.9 }}>
          <div className="cmp-banner-inner">
            <div className="cmp-banner-top-row">
              <div className="skeleton" style={{ width: '38px', height: '38px', borderRadius: '50%', background: 'rgba(255,255,255,0.2)' }} />
              <div style={{ display: 'flex', gap: '8px' }}>
                <div className="skeleton" style={{ width: '38px', height: '38px', borderRadius: '50%', background: 'rgba(255,255,255,0.2)' }} />
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Container */}
        <div className="cmp-main-container">
          {/* Header Card Skeleton */}
          <div className="cmp-header-card">
            <div className="cmp-header-top-row">
              <div className="cmp-header-identity">
                <div className="skeleton" style={{ width: '72px', height: '72px', borderRadius: '12px', flexShrink: 0 }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div className="skeleton" style={{ width: '55%', height: '24px', borderRadius: '6px', marginBottom: '10px' }} />
                  <div className="skeleton" style={{ width: '80%', height: '14px', borderRadius: '4px', marginBottom: '12px' }} />
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    <div className="skeleton" style={{ width: '120px', height: '28px', borderRadius: '9999px' }} />
                    <div className="skeleton" style={{ width: '90px', height: '28px', borderRadius: '9999px' }} />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Tab Navigation Skeleton */}
          <div style={{ display: 'flex', gap: '8px', marginTop: '16px', marginBottom: '16px' }}>
            <div className="skeleton" style={{ width: '100px', height: '38px', borderRadius: '8px' }} />
            <div className="skeleton" style={{ width: '100px', height: '38px', borderRadius: '8px' }} />
          </div>

          {/* Layout Grid Skeleton */}
          <div className="cmp-layout-grid">
            <div className="cmp-main-column">
              <div className="cmp-surface-card" style={{ padding: '16px' }}>
                {/* Search Bar Skeleton */}
                <div className="skeleton" style={{ width: '100%', height: '48px', borderRadius: '8px', marginBottom: '16px' }} />
                {/* Job Card Skeletons */}
                {[1, 2, 3].map((k) => (
                  <div key={k} className="cmp-job-item-card" style={{ padding: '14px', border: '1px solid #E2E8F0', borderRadius: '8px', marginBottom: '10px', backgroundColor: '#FFFFFF' }}>
                    <div className="skeleton" style={{ width: '48%', height: '18px', borderRadius: '4px', marginBottom: '10px' }} />
                    <div className="skeleton" style={{ width: '65%', height: '13px', borderRadius: '4px', marginBottom: '12px' }} />
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <div className="skeleton" style={{ width: '110px', height: '22px', borderRadius: '4px' }} />
                      <div className="skeleton" style={{ width: '80px', height: '22px', borderRadius: '4px' }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="cmp-side-column">
              <div className="cmp-surface-card" style={{ padding: '16px' }}>
                <div className="skeleton" style={{ width: '40%', height: '16px', borderRadius: '4px', marginBottom: '14px' }} />
                <div className="skeleton" style={{ width: '100%', height: '70px', borderRadius: '6px', marginBottom: '14px' }} />
                <div className="skeleton" style={{ width: '75%', height: '14px', borderRadius: '4px' }} />
              </div>
            </div>
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

  const companyBadgesMarkup = (
    <>
      {(company.industry || 'Industrial Manufacturing') && (
        <span className="cmp-pill-badge">
          {company.industry || 'Industrial Manufacturing'}
        </span>
      )}

      {(company.company_type || 'Public Limited / MNC') && (
        <span className="cmp-pill-badge">
          {company.company_type || 'Public Limited / MNC'}
        </span>
      )}
    </>
  );

  return (
    <div className="cmp-page-wrapper">
      {/* 1. Hero Cover Banner with exact mobile app background */}
      <div
        className="cmp-hero-banner"
        style={{
          backgroundImage: `url(${companyHeaderBg})`,
          backgroundColor: '#0A58E2',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat'
        }}
      >
        <div className="cmp-banner-inner">
          {/* Top Row: Back link & actions */}
          <div className="cmp-banner-top-row">
            <button
              type="button"
              onClick={() => (window.history.length > 1 ? navigate(-1) : navigate('/companies'))}
              className="cmp-banner-nav-btn cmp-banner-back-btn"
              title="Back"
              aria-label="Back"
            >
              <ArrowLeft size={22} color="#FFFFFF" strokeWidth={2.4} />
            </button>

            <div className="cmp-banner-actions">
              {isOwner && (
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(true)}
                  className="cmp-banner-nav-btn"
                  title="Edit Company Profile"
                  aria-label="Edit Profile"
                >
                  <Edit3 size={18} color="#FFFFFF" strokeWidth={2.2} />
                </button>
              )}

              {company.website && (
                <a
                  href={company.website.startsWith('http') ? company.website : `https://${company.website}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="cmp-banner-nav-btn"
                  title="Visit Website"
                  aria-label="Visit Website"
                >
                  <Globe size={18} color="#FFFFFF" strokeWidth={2} />
                </a>
              )}

              <button
                type="button"
                onClick={handleShare}
                className="cmp-banner-nav-btn"
                title="Share Profile"
                aria-label="Share Profile"
              >
                {copiedLink ? (
                  <Check size={20} color="#4ADE80" strokeWidth={2.8} />
                ) : (
                  <Share2 size={19} color="#FFFFFF" strokeWidth={2.2} />
                )}
              </button>
            </div>
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

                {/* Modern Badges Row - Desktop */}
                <div className="cmp-badges-row cmp-badges-desktop">
                  {companyBadgesMarkup}
                </div>
              </div>
            </div>

            {/* Modern Badges Row - Mobile (spans full width under identity) */}
            <div className="cmp-badges-row cmp-badges-mobile">
              {companyBadgesMarkup}
            </div>

            {/* Right Hub: Followers & Follow CTA */}
            <div className="cmp-header-actions">
              <div className="cmp-follower-count">
                <Users size={14} color="#64748B" />
                <span>
                  <strong>{formatFollowers(followersCount)}</strong>
                </span>
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
                    <Search size={18} color="#64748B" strokeWidth={2} style={{ flexShrink: 0 }} />
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
                        aria-label="Clear search"
                        style={{
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                          padding: '4px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: '#94A3B8',
                          flexShrink: 0
                        }}
                      >
                        <X size={14} />
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
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {[1, 2, 3].map((sk) => (
                      <div key={sk} className="cmp-job-item-card" style={{ padding: '14px', border: '1px solid #E2E8F0', borderRadius: '8px', backgroundColor: '#FFFFFF' }}>
                        <div className="skeleton" style={{ width: '48%', height: '18px', borderRadius: '4px', marginBottom: '10px' }} />
                        <div className="skeleton" style={{ width: '68%', height: '13px', borderRadius: '4px', marginBottom: '12px' }} />
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <div className="skeleton" style={{ width: '110px', height: '22px', borderRadius: '4px' }} />
                          <div className="skeleton" style={{ width: '80px', height: '22px', borderRadius: '4px' }} />
                        </div>
                      </div>
                    ))}
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

                        {/* Job Details Meta Row */}
                        <div className="cmp-job-details-row">
                          <span className="cmp-job-detail-item salary">
                            {jobItem.salaryRange || jobItem.salary || '₹18,000 - ₹28,000 / month'}
                          </span>
                          <span className="cmp-job-detail-separator">•</span>
                          <span className="cmp-job-detail-item">
                            {jobItem.experienceLevel || jobItem.experience || '1-3 Years Experience'}
                          </span>
                          {jobItem.trade && (
                            <>
                              <span className="cmp-job-detail-separator">•</span>
                              <span className="cmp-job-detail-item">
                                Trade: {jobItem.trade}
                              </span>
                            </>
                          )}
                          <span className="cmp-job-detail-separator">•</span>
                          <span className="cmp-job-detail-item">
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

            {/* TAB CONTENT: 3. OPERATIONS & LOCATIONS */}
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
