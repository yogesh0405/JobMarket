import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { 
  MoreVertical, 
  ChevronRight, 
  X, 
  PlusCircle, 
  Calendar, 
  Megaphone, 
  ShieldCheck, 
  HelpCircle, 
  Info, 
  LogOut, 
  Briefcase, 
  Bookmark, 
  User, 
  FileText, 
  Building2, 
  Home
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../hooks/useToast';
import { useStore } from '../../store/useStore';
import { useTranslation } from '../../utils/translations';
import { getInitials } from '../../utils/helpers';
import { apiFetch } from '../../utils/api';
import { HeaderSearchBar } from './HeaderSearchBar';
import { NavbarNotificationBell } from './NavbarNotificationBell';
import { JobMarketLogoSvg } from '../common/JobMarketLogoSvg';

export const Navbar: React.FC = () => {
  const { currentUser, logout } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const { state } = useStore();
  const t = useTranslation(state.language);

  const [scrolled, setScrolled] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [platformSettings, setPlatformSettings] = useState<{ logo_url?: string; platform_name?: string }>({});
  const dropdownRef = useRef<HTMLDivElement>(null);
  const mobileMenuRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const loadSettings = () => {
      apiFetch('/api/v1/settings')
        .then(r => r.ok ? r.json() : null)
        .then(res => {
          if (res?.data) {
            setPlatformSettings({
              logo_url: res.data.logo_url || '',
              platform_name: res.data.platform_name || ''
            });
          }
        })
        .catch(() => {});
    };

    loadSettings();
    window.addEventListener('settings-updated', loadSettings);
    return () => window.removeEventListener('settings-updated', loadSettings);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    showToast('Logged out successfully', 'success');
    navigate('/');
  };

  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  const isEmployer = currentUser?.role?.toLowerCase() === 'employer';
  const isSearchAllowed = location.pathname === '/' && !isEmployer;

  const isJobDetailRoute = (location.pathname.startsWith('/job/') || location.pathname.startsWith('/jobs/')) && location.pathname !== '/jobs' && location.pathname !== '/jobs/map';
  const isCompanyProfileRoute = (location.pathname.startsWith('/company/') || location.pathname.startsWith('/companies/')) && location.pathname !== '/companies';
  const isBannersSection = location.pathname.startsWith('/dashboard') && (
    location.search.includes('tab=advertisements') ||
    location.search.includes('tab=banners') ||
    location.search.includes('tab=promotions')
  );
  const isAppliedSection = location.pathname.startsWith('/dashboard') && location.search.includes('tab=applied');
  const isProfileSection = location.pathname === '/profile' || location.pathname === '/my-profile' || (location.pathname.startsWith('/dashboard') && (location.search.includes('tab=profile') || location.search.includes('tab=my-profile')));
  const isCompaniesRoute = location.pathname === '/companies' || location.pathname.startsWith('/companies');
  const isJobsRoute = location.pathname === '/jobs' || (location.pathname.startsWith('/jobs') && location.pathname !== '/jobs/map');
  const isHomeRoute = location.pathname === '/';
  const isInterviewsSection = (
    location.pathname.startsWith('/interviews') ||
    location.pathname.startsWith('/schedule') ||
    (location.pathname.startsWith('/dashboard') && (
      location.search.includes('tab=interviews') ||
      location.search.includes('tab=scheduled-interviews') ||
      location.search.includes('tab=schedule')
    ))
  );
  const isAboutSection = location.pathname.startsWith('/about') || (location.pathname.startsWith('/dashboard') && location.search.includes('tab=about'));
  const isContactSection = location.pathname.startsWith('/contact') || location.pathname.startsWith('/support') || location.pathname.startsWith('/help') || (location.pathname.startsWith('/dashboard') && location.search.includes('tab=support'));
  const isSecuritySection = location.pathname.startsWith('/security') || (location.pathname.startsWith('/dashboard') && location.search.includes('tab=security'));
  const isPostJobSection = location.pathname.startsWith('/post-job') || location.pathname.startsWith('/edit-job') || (location.pathname.startsWith('/dashboard') && (location.search.includes('tab=post-job') || location.search.includes('tab=post') || location.search.includes('tab=create-job')));
  const hideNavbarMobile = isJobDetailRoute || isCompanyProfileRoute || isInterviewsSection;

  // Determine current active section title dynamically
  const getCurrentSectionTitle = () => {
    const searchParams = new URLSearchParams(location.search);
    const tab = searchParams.get('tab');

    // Post / Edit Job
    if (location.pathname.startsWith('/post-job') || location.pathname.startsWith('/edit-job') || tab === 'post-job' || tab === 'create-job') {
      return 'Post a Job';
    }

    // Dashboard routes & tabs
    if (location.pathname.startsWith('/dashboard')) {
      if (tab === 'candidates' || (!tab && isEmployer)) return 'Browse Candidates';
      if (tab === 'manage') return 'Manage Jobs';
      if (tab === 'applicants') return 'Applicants';
      if (tab === 'interviews' || tab === 'scheduled-interviews') return 'Scheduled Interviews';
      if (tab === 'advertisements' || tab === 'banners' || tab === 'promotions') return 'Promotional Banners';
      if (tab === 'applied') return 'Applied Jobs';
      if (tab === 'saved') return 'Saved Jobs';
      if (tab === 'profile' || tab === 'my-profile') return isEmployer ? 'Company Profile' : 'My Profile';
      if (tab === 'resume') return 'My Resume';
      return isEmployer ? 'Browse Candidates' : 'Candidate Workspace';
    }

    // General pages
    if (location.pathname.startsWith('/jobs') || location.pathname.startsWith('/job/')) {
      return 'Find Jobs';
    }
    if (location.pathname.startsWith('/companies') || location.pathname.startsWith('/company/')) {
      return 'Top Companies';
    }
    if (location.pathname.startsWith('/resume')) {
      return 'Resume & CV';
    }
    if (location.pathname.startsWith('/profile') || location.pathname.startsWith('/my-profile')) {
      return isEmployer ? 'Company Profile' : 'My Profile';
    }
    if (location.pathname.startsWith('/security')) {
      return 'Security & Sessions';
    }
    if (location.pathname.startsWith('/about')) {
      return 'About JobMarket';
    }
    if (location.pathname.startsWith('/contact') || location.pathname.startsWith('/support')) {
      return 'Help & Support';
    }
    if (location.pathname.startsWith('/login')) {
      return 'Sign In';
    }
    if (location.pathname.startsWith('/signup')) {
      return 'Sign Up';
    }
    if (location.pathname === '/') {
      return isEmployer ? 'Browse Candidates' : 'Find Jobs & Careers';
    }

    return isEmployer ? 'Employer Portal' : 'Find Jobs & Careers';
  };

  return (
    <>
      <nav className={`navbar ${scrolled ? 'scrolled' : ''} ${isSearchAllowed ? 'has-search-strip' : ''} ${hideNavbarMobile ? 'hide-navbar-mobile' : ''}`}>
        <div className="navbar-inner">
          <div className="navbar-header-row">
            <Link to={isEmployer ? "/dashboard" : "/"} className="navbar-brand" style={{ display: 'flex', alignItems: 'center', margin: 0, padding: 0 }} title={isEmployer ? "Employer Workspace" : `${platformSettings.platform_name || 'JobMarket'} Home`}>
              {platformSettings.logo_url ? (
                <img 
                  src={platformSettings.logo_url} 
                  alt={`${platformSettings.platform_name || 'JobMarket'} Logo`} 
                  style={{ width: '30px', height: '30px', objectFit: 'contain', marginRight: '8px', flexShrink: 0, borderRadius: '6px' }} 
                />
              ) : (
                <div style={{ marginRight: '8px', display: 'flex', alignItems: 'center' }}>
                  <JobMarketLogoSvg size={28} />
                </div>
              )}
              <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                <span className="navbar-brand-text" style={{ fontSize: '15.5px', fontWeight: 800, color: '#1B4FDF', letterSpacing: '-0.3px', lineHeight: 1.1, margin: 0, padding: 0 }}>
                  {platformSettings.platform_name || 'JobMarket'}
                </span>
                <span style={{ fontSize: '11px', color: '#475569', marginTop: '1.5px', fontWeight: 600, lineHeight: 1.2 }}>
                  {getCurrentSectionTitle()}
                </span>
              </div>
            </Link>

            {/* DESKTOP ONLY NAVIGATION LINKS */}
            <div className="navbar-nav desktop-only-nav">
              {currentUser?.role === 'employer' ? (
                <>
                  <Link
                    to="/dashboard?tab=candidates"
                    className={`nav-link ${(location.pathname === '/dashboard' && (new URLSearchParams(location.search).get('tab') === 'candidates' || !new URLSearchParams(location.search).get('tab'))) ? 'active' : ''}`}
                  >
                    Browse Candidates
                  </Link>
                  <Link
                    to="/post-job"
                    className={`nav-link ${location.pathname === '/post-job' ? 'active' : ''}`}
                  >
                    Post Job
                  </Link>
                  <Link
                    to="/dashboard?tab=manage"
                    className={`nav-link ${location.pathname === '/dashboard' && new URLSearchParams(location.search).get('tab') === 'manage' ? 'active' : ''}`}
                  >
                    Manage Jobs
                  </Link>
                </>
              ) : (
                <>
                  <Link to="/" className={`nav-link ${isActive('/') ? 'active' : ''}`}>{t.home}</Link>
                  <Link to="/jobs" className={`nav-link ${isActive('/jobs') ? 'active' : ''}`}>{t.findJobs}</Link>
                  <Link to="/companies" className={`nav-link ${isActive('/companies') ? 'active' : ''}`}>Companies</Link>
                </>
              )}
            </div>

            <div className="navbar-actions" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <NavbarNotificationBell />

              {currentUser ? (
                <div 
                  className="navbar-user relative desktop-only-avatar" 
                  onClick={() => setDropdownOpen(!dropdownOpen)} 
                  ref={dropdownRef} 
                  style={{ border: 'none', padding: 0, background: 'transparent', cursor: 'pointer', alignItems: 'center', position: 'relative' }}
                  title="Account Menu"
                >
                  <div className="navbar-avatar" style={{ background: '#344BFD', color: '#ffffff', width: '42px', height: '42px', borderRadius: '50%', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 6px rgba(52, 75, 253, 0.2)' }}>
                    {currentUser.profilePictureUrl && typeof currentUser.profilePictureUrl === 'string' ? (
                      <img 
                        src={currentUser.profilePictureUrl} 
                        alt={typeof currentUser.name === 'string' ? currentUser.name : 'User'} 
                        referrerPolicy="no-referrer"
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                        onError={(e) => {
                          (e.currentTarget as HTMLElement).style.display = 'none';
                        }}
                      />
                    ) : (
                      getInitials(currentUser.name)
                    )}
                  </div>

                  {dropdownOpen && (
                    <div className="user-dropdown" style={{ position: 'absolute', right: 0, top: '100%', marginTop: '8px', zIndex: 1000 }}>
                      <button className="dropdown-item" onClick={() => { setDropdownOpen(false); navigate(currentUser.role === 'admin' ? '/admin/dashboard' : '/dashboard'); }}>
                        <Briefcase size={16} style={{ marginRight: 8 }} />
                        {t.dashboard}
                      </button>
                      <button className="dropdown-item" onClick={() => { setDropdownOpen(false); navigate('/security'); }}>
                        <ShieldCheck size={16} style={{ marginRight: 8 }} />
                        Security & Sessions
                      </button>
                      <div className="dropdown-divider"></div>
                      <button className="dropdown-item danger" onClick={() => { setDropdownOpen(false); handleLogout(); }}>
                        <LogOut size={16} style={{ marginRight: 8 }} />
                        {t.logout}
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="header-auth-buttons">
                  <Link to="/login" className="btn btn-ghost btn-sm">{t.login}</Link>
                  <Link to="/signup" className="btn btn-primary btn-sm btn-pill" style={{ background: 'var(--gradient-accent)' }}>{t.signup}</Link>
                </div>
              )}

              <button 
                type="button"
                className={`navbar-toggle ${mobileMenuOpen ? 'open' : ''}`} 
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                title="Menu"
                style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >
                <MoreVertical size={20} color="#1E293B" strokeWidth={2.2} />
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* ── MOBILE SIDEBAR DRAWER & BACKDROP ── */}
      <div 
        className={`mobile-backdrop ${mobileMenuOpen ? 'open' : ''}`} 
        onClick={() => setMobileMenuOpen(false)}
      ></div>

      <aside 
        ref={mobileMenuRef} 
        className={`mobile-sidebar-drawer ${mobileMenuOpen ? 'open' : ''}`}
      >
        {currentUser ? (
          <div className="mobile-drawer-inner">
            {/* Header Profile Info Card */}
            <div className="mobile-drawer-header">
              <Link 
                to={currentUser.role === 'employer' ? "/dashboard?tab=profile" : "/dashboard?tab=profile"} 
                className="mobile-drawer-user-info"
                onClick={() => setMobileMenuOpen(false)}
              >
                <div className="mobile-drawer-avatar">
                  {currentUser.companyLogo || currentUser.profilePictureUrl ? (
                    <img 
                      src={currentUser.companyLogo || currentUser.profilePictureUrl} 
                      alt={currentUser.name} 
                      onError={(e) => { (e.currentTarget as HTMLElement).style.display = 'none'; }}
                    />
                  ) : (
                    <span>{getInitials(currentUser.name)}</span>
                  )}
                </div>
                <div className="mobile-drawer-user-text">
                  <span className="mobile-drawer-user-name">{currentUser.name}</span>
                  <span className="mobile-drawer-user-email">{currentUser.email}</span>
                </div>
                <ChevronRight size={18} color="#94A3B8" className="mobile-drawer-header-arrow" />
              </Link>
              <button 
                type="button"
                className="mobile-drawer-close-btn" 
                onClick={() => setMobileMenuOpen(false)}
                aria-label="Close menu"
              >
                <X size={18} color="#475569" />
              </button>
            </div>

            {/* Scrollable Navigation Sections */}
            <div className="mobile-drawer-scroll-body">
              {currentUser.role === 'employer' ? (
                <>
                  {/* PLATFORM WORKSPACE */}
                  <div className="mobile-drawer-section-label">PLATFORM WORKSPACE</div>
                  <Link to="/post-job" className="mobile-drawer-item" onClick={() => setMobileMenuOpen(false)}>
                    <div className="mobile-drawer-item-left">
                      <PlusCircle size={19} className="mobile-drawer-icon" />
                      <span>Post a Job</span>
                    </div>
                    <ChevronRight size={16} color="#94A3B8" />
                  </Link>
                  <Link to="/dashboard?tab=interviews" className="mobile-drawer-item" onClick={() => setMobileMenuOpen(false)}>
                    <div className="mobile-drawer-item-left">
                      <Calendar size={19} className="mobile-drawer-icon" />
                      <span>Scheduled Interviews</span>
                    </div>
                    <ChevronRight size={16} color="#94A3B8" />
                  </Link>
                  <Link to="/dashboard?tab=advertisements" className="mobile-drawer-item" onClick={() => setMobileMenuOpen(false)}>
                    <div className="mobile-drawer-item-left">
                      <Megaphone size={19} className="mobile-drawer-icon" />
                      <span>Promote Banner / Ads</span>
                    </div>
                    <ChevronRight size={16} color="#94A3B8" />
                  </Link>

                  {/* SYSTEM & SECURITY */}
                  <div className="mobile-drawer-section-label">SYSTEM & SECURITY</div>
                  <Link to="/security" className="mobile-drawer-item" onClick={() => setMobileMenuOpen(false)}>
                    <div className="mobile-drawer-item-left">
                      <ShieldCheck size={19} className="mobile-drawer-icon" />
                      <span>Security & Sessions</span>
                    </div>
                    <ChevronRight size={16} color="#94A3B8" />
                  </Link>
                  <Link to="/contact" className="mobile-drawer-item" onClick={() => setMobileMenuOpen(false)}>
                    <div className="mobile-drawer-item-left">
                      <HelpCircle size={19} className="mobile-drawer-icon" />
                      <span>Help & Support Desk</span>
                    </div>
                    <ChevronRight size={16} color="#94A3B8" />
                  </Link>
                  <Link to="/about" className="mobile-drawer-item" onClick={() => setMobileMenuOpen(false)}>
                    <div className="mobile-drawer-item-left">
                      <Info size={19} className="mobile-drawer-icon" />
                      <span>About JobMarket</span>
                    </div>
                    <ChevronRight size={16} color="#94A3B8" />
                  </Link>

                  {/* ACCOUNT */}
                  <div className="mobile-drawer-section-label">ACCOUNT</div>
                  <button 
                    type="button" 
                    className="mobile-drawer-item danger" 
                    onClick={() => { handleLogout(); setMobileMenuOpen(false); }}
                  >
                    <div className="mobile-drawer-item-left">
                      <div className="mobile-drawer-icon-box danger">
                        <LogOut size={16} color="#DC2626" />
                      </div>
                      <span className="danger-text">Sign Out Account</span>
                    </div>
                    <ChevronRight size={16} color="#DC2626" />
                  </button>
                </>
              ) : (
                <>
                  {/* Candidate Items */}
                  <div className="mobile-drawer-section-label">CAREER & APPLICATIONS</div>
                  <Link to="/dashboard?tab=saved" className="mobile-drawer-item" onClick={() => setMobileMenuOpen(false)}>
                    <div className="mobile-drawer-item-left">
                      <Bookmark size={19} className="mobile-drawer-icon" />
                      <span>{t.savedJobs}</span>
                    </div>
                    <ChevronRight size={16} color="#94A3B8" />
                  </Link>
                  <Link to="/dashboard?tab=interviews" className="mobile-drawer-item" onClick={() => setMobileMenuOpen(false)}>
                    <div className="mobile-drawer-item-left">
                      <Calendar size={19} className="mobile-drawer-icon" />
                      <span>Scheduled Interviews</span>
                    </div>
                    <ChevronRight size={16} color="#94A3B8" />
                  </Link>

                  <div className="mobile-drawer-section-label">RESUME & DOCUMENTS</div>
                  <Link to="/resume" className="mobile-drawer-item" onClick={() => setMobileMenuOpen(false)}>
                    <div className="mobile-drawer-item-left">
                      <FileText size={19} className="mobile-drawer-icon" />
                      <span>{currentUser?.resume ? t.myResume : t.uploadResume}</span>
                    </div>
                    <ChevronRight size={16} color="#94A3B8" />
                  </Link>

                  <div className="mobile-drawer-section-label">SYSTEM & SECURITY</div>
                  <Link to="/security" className="mobile-drawer-item" onClick={() => setMobileMenuOpen(false)}>
                    <div className="mobile-drawer-item-left">
                      <ShieldCheck size={19} className="mobile-drawer-icon" />
                      <span>Security & Sessions</span>
                    </div>
                    <ChevronRight size={16} color="#94A3B8" />
                  </Link>
                  <Link to="/contact" className="mobile-drawer-item" onClick={() => setMobileMenuOpen(false)}>
                    <div className="mobile-drawer-item-left">
                      <HelpCircle size={19} className="mobile-drawer-icon" />
                      <span>Help & Support Desk</span>
                    </div>
                    <ChevronRight size={16} color="#94A3B8" />
                  </Link>
                  <Link to="/about" className="mobile-drawer-item" onClick={() => setMobileMenuOpen(false)}>
                    <div className="mobile-drawer-item-left">
                      <Info size={19} className="mobile-drawer-icon" />
                      <span>About JobMarket</span>
                    </div>
                    <ChevronRight size={16} color="#94A3B8" />
                  </Link>

                  <div className="mobile-drawer-section-label">ACCOUNT</div>
                  <button 
                    type="button" 
                    className="mobile-drawer-item danger" 
                    onClick={() => { handleLogout(); setMobileMenuOpen(false); }}
                  >
                    <div className="mobile-drawer-item-left">
                      <div className="mobile-drawer-icon-box danger">
                        <LogOut size={16} color="#DC2626" />
                      </div>
                      <span className="danger-text">Sign Out Account</span>
                    </div>
                    <ChevronRight size={16} color="#DC2626" />
                  </button>
                </>
              )}
            </div>
          </div>
        ) : (
          <div className="mobile-drawer-inner">
            {/* Guest Header */}
            <div className="mobile-drawer-header">
              <div className="mobile-drawer-user-info">
                <div className="mobile-drawer-avatar" style={{ background: 'var(--gradient-accent)' }}>
                  JM
                </div>
                <div className="mobile-drawer-user-text">
                  <span className="mobile-drawer-user-name">Welcome to JobMarket</span>
                  <span className="mobile-drawer-user-email">Technical & Factory Jobs</span>
                </div>
              </div>
              <button 
                type="button"
                className="mobile-drawer-close-btn" 
                onClick={() => setMobileMenuOpen(false)}
              >
                <X size={18} color="#475569" />
              </button>
            </div>

            <div className="mobile-drawer-scroll-body">
              <div className="mobile-drawer-section-label">EXPLORE</div>
              <Link to="/" className="mobile-drawer-item" onClick={() => setMobileMenuOpen(false)}>
                <div className="mobile-drawer-item-left">
                  <Home size={19} className="mobile-drawer-icon" />
                  <span>{t.home}</span>
                </div>
                <ChevronRight size={16} color="#94A3B8" />
              </Link>
              <Link to="/jobs" className="mobile-drawer-item" onClick={() => setMobileMenuOpen(false)}>
                <div className="mobile-drawer-item-left">
                  <Briefcase size={19} className="mobile-drawer-icon" />
                  <span>{t.findJobs}</span>
                </div>
                <ChevronRight size={16} color="#94A3B8" />
              </Link>
              <Link to="/companies" className="mobile-drawer-item" onClick={() => setMobileMenuOpen(false)}>
                <div className="mobile-drawer-item-left">
                  <Building2 size={19} className="mobile-drawer-icon" />
                  <span>Companies</span>
                </div>
                <ChevronRight size={16} color="#94A3B8" />
              </Link>
              <Link to="/about" className="mobile-drawer-item" onClick={() => setMobileMenuOpen(false)}>
                <div className="mobile-drawer-item-left">
                  <Info size={19} className="mobile-drawer-icon" />
                  <span>About Us</span>
                </div>
                <ChevronRight size={16} color="#94A3B8" />
              </Link>
              <Link to="/contact" className="mobile-drawer-item" onClick={() => setMobileMenuOpen(false)}>
                <div className="mobile-drawer-item-left">
                  <HelpCircle size={19} className="mobile-drawer-icon" />
                  <span>Help & Support</span>
                </div>
                <ChevronRight size={16} color="#94A3B8" />
              </Link>

              <div className="mobile-drawer-section-label">ACCOUNT</div>
              <Link to="/login" className="mobile-drawer-item" onClick={() => setMobileMenuOpen(false)}>
                <div className="mobile-drawer-item-left">
                  <User size={19} className="mobile-drawer-icon" />
                  <span>{t.login}</span>
                </div>
                <ChevronRight size={16} color="#94A3B8" />
              </Link>
              <Link to="/signup" className="mobile-drawer-item" onClick={() => setMobileMenuOpen(false)}>
                <div className="mobile-drawer-item-left">
                  <PlusCircle size={19} className="mobile-drawer-icon" />
                  <span>{t.signup}</span>
                </div>
                <ChevronRight size={16} color="#94A3B8" />
              </Link>
            </div>
          </div>
        )}
      </aside>
    </>
  );
};

export default Navbar;
