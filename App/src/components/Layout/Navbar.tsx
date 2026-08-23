import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../hooks/useToast';
import { useStore } from '../../store/useStore';
import { useTranslation, Language } from '../../utils/translations';
import { getInitials } from '../../utils/helpers';
import { HeaderSearchBar } from './HeaderSearchBar';
import { NavbarNotificationBell } from './NavbarNotificationBell';

export const Navbar: React.FC = () => {
  const { currentUser, logout } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const { state, dispatch } = useStore();
  const t = useTranslation(state.language);

  const [scrolled, setScrolled] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const mobileMenuRef = useRef<HTMLDivElement>(null);

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
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target as Node)) {
        // If clicking the toggle button itself, let its own click handler handle it
        const toggleBtn = document.querySelector('.navbar-toggle');
        if (toggleBtn && toggleBtn.contains(event.target as Node)) {
          return;
        }
        setMobileMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    setDropdownOpen(false);
    setMobileMenuOpen(false);
  }, [location]);

  const handleLogout = () => {
    logout();
    showToast('Logged out successfully', 'success');
    navigate('/');
  };

  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  const isSearchAllowed = location.pathname === '/';

  const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    dispatch({ type: 'SET_LANGUAGE', payload: e.target.value as Language });
    showToast(e.target.value === 'mr' ? 'भाषा बदलली: मराठी' : e.target.value === 'hi' ? 'भाषा बदली: हिन्दी' : 'Language changed: English', 'info');
  };

  const isJobDetailRoute = (location.pathname.startsWith('/job/') || location.pathname.startsWith('/jobs/')) && location.pathname !== '/jobs' && location.pathname !== '/jobs/map';
  const isCompanyProfileRoute = (location.pathname.startsWith('/company/') || location.pathname.startsWith('/companies/')) && location.pathname !== '/companies';
  const hideNavbarMobile = isJobDetailRoute || isCompanyProfileRoute;

  return (
    <nav className={`navbar ${scrolled ? 'scrolled' : ''} ${isSearchAllowed ? 'has-search-strip' : ''} ${hideNavbarMobile ? 'hide-navbar-mobile' : ''}`}>
      <div className={`mobile-backdrop ${mobileMenuOpen ? 'open' : ''}`} onClick={() => setMobileMenuOpen(false)}></div>
      <div className="navbar-inner">
        <div className="navbar-header-row">
          <Link to="/" className="navbar-brand">
            <img src="/logo.svg" alt="JobMarket Logo" style={{ width: '40px', height: '40px', objectFit: 'contain', marginRight: '8px' }} />
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span className="navbar-brand-text" style={{ background: 'var(--gradient-accent)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text', fontSize: '22px', lineHeight: 1.1 }}>{t.brand}</span>
              <span style={{ fontSize: '10.5px', color: 'var(--text-secondary)', marginTop: '0', fontWeight: 'bold' }}>{t.tagline}</span>
            </div>
          </Link>

          {/* DESKTOP SEARCH BAR */}
          {isSearchAllowed && (
            <div className="desktop-search-container">
              <HeaderSearchBar />
            </div>
          )}

        <div ref={mobileMenuRef} className={`navbar-nav ${mobileMenuOpen ? 'open' : ''}`}>
          {/* MOBILE ONLY DRAWER SECTION */}
          <div className="mobile-drawer-content" style={{ width: '100%' }}>
            {currentUser ? (
              <div className="mobile-sidebar-profile">
                <div className="sidebar-profile-header">
                  <div className="sidebar-profile-avatar" style={{ background: '#344BFD', color: '#ffffff', width: '48px', height: '48px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '18px', overflow: 'hidden' }}>
                    {currentUser.profilePictureUrl ? (
                      <img src={currentUser.profilePictureUrl} alt={currentUser.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      getInitials(currentUser.name)
                    )}
                  </div>
                  <div className="sidebar-profile-info">
                    <span className="sidebar-profile-name">{currentUser.name}</span>
                    <span className="sidebar-profile-email">{currentUser.email}</span>
                  </div>
                </div>
                
                <div className="sidebar-profile-menu" style={{ marginTop: 'var(--space-4)' }}>
                  {/* Home (Candidates / Guests Only) */}
                  {currentUser.role !== 'employer' && (
                    <Link to="/" className="sidebar-menu-item" onClick={() => setMobileMenuOpen(false)}>
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: 18, height: 18 }}>
                        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>
                      </svg>
                      {t.home}
                    </Link>
                  )}

                  {/* Find Jobs (Candidates / Guests Only) */}
                  {currentUser.role !== 'employer' && (
                    <Link to="/jobs" className="sidebar-menu-item" onClick={() => setMobileMenuOpen(false)}>
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: 18, height: 18 }}>
                        <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
                      </svg>
                      {t.findJobs}
                    </Link>
                  )}

                  {/* Dashboard */}
                  <Link to="/dashboard" className="sidebar-menu-item" onClick={() => setMobileMenuOpen(false)}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: 18, height: 18 }}>
                      <rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>
                    </svg>
                    {t.dashboard}
                  </Link>
                  
                  {currentUser.role === 'employer' && (
                    <>
                      <Link to="/dashboard?tab=profile" className="sidebar-menu-item" onClick={() => setMobileMenuOpen(false)}>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: 18, height: 18 }}>
                          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
                        </svg>
                        Company Profile
                      </Link>
                    </>
                  )}

                  {/* Saved Jobs (Candidates / Guests Only) */}
                  {currentUser.role !== 'employer' && (
                    <Link to="/dashboard?tab=saved" className="sidebar-menu-item" onClick={() => setMobileMenuOpen(false)}>
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: 18, height: 18 }}>
                        <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>
                      </svg>
                      {t.savedJobs}
                    </Link>
                  )}

                  {currentUser.role === 'candidate' && (
                    <>
                      {/* Profile */}
                      <Link to="/dashboard?tab=profile" className="sidebar-menu-item" onClick={() => setMobileMenuOpen(false)}>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: 18, height: 18 }}>
                          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
                        </svg>
                        {t.profile}
                      </Link>
                      {/* Resume */}
                      <Link to="/dashboard?tab=resume" className="sidebar-menu-item" onClick={() => setMobileMenuOpen(false)}>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: 18, height: 18 }}>
                          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/>
                        </svg>
                        {currentUser?.resume ? t.myResume : t.uploadResume}
                      </Link>
                    </>
                  )}

                  {/* Security & Sessions for ALL Logged In Users */}
                  <Link to="/dashboard?tab=security" className="sidebar-menu-item" onClick={() => setMobileMenuOpen(false)}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: 18, height: 18 }}>
                      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                    </svg>
                    Security & Sessions
                  </Link>

                  <div className="sidebar-menu-divider"></div>
                  
                  {/* About Us */}
                  <Link to="/about" className="sidebar-menu-item" onClick={() => setMobileMenuOpen(false)}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: 18, height: 18 }}>
                      <circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/>
                    </svg>
                    About Us
                  </Link>

                  {/* Help & Support */}
                  <Link to="/contact" className="sidebar-menu-item" onClick={() => setMobileMenuOpen(false)}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: 18, height: 18 }}>
                      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                    </svg>
                    Help & Support
                  </Link>

                  <div className="sidebar-menu-divider"></div>

                  {/* Logout */}
                  <button className="sidebar-menu-item danger" onClick={() => { handleLogout(); setMobileMenuOpen(false); }}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: 18, height: 18 }}>
                      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
                    </svg>
                    {t.logout}
                  </button>
                </div>
              </div>
            ) : (
              <div className="mobile-sidebar-profile">
                {/* Guest Header */}
                <div className="sidebar-profile-header">
                  <div className="navbar-logo" style={{ background: 'var(--gradient-accent)', width: '36px', height: '36px', borderRadius: '50%', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>JM</div>
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <span className="sidebar-profile-name" style={{ fontSize: '15px' }}>Welcome to JobMarket</span>
                    <span style={{ fontSize: '10px', color: 'var(--text-secondary)' }}>Find technical & factory jobs</span>
                  </div>
                </div>

                <div className="sidebar-profile-menu" style={{ marginTop: 'var(--space-4)' }}>
                  {/* Home */}
                  <Link to="/" className="sidebar-menu-item" onClick={() => setMobileMenuOpen(false)}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: 18, height: 18 }}>
                      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>
                    </svg>
                    {t.home}
                  </Link>

                  {/* Find Jobs */}
                  <Link to="/jobs" className="sidebar-menu-item" onClick={() => setMobileMenuOpen(false)}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: 18, height: 18 }}>
                      <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
                    </svg>
                    {t.findJobs}
                  </Link>


                  {/* Companies */}
                  <Link to="/companies" className="sidebar-menu-item" onClick={() => setMobileMenuOpen(false)}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: 18, height: 18 }}>
                      <path d="M19 21V5a2 2 0 0 0-2-2H7a2 2 0 0 0-2 2v16"/><path d="M1 21h22"/><path d="M9 7h1"/><path d="M9 11h1"/><path d="M9 15h1"/><path d="M14 7h1"/><path d="M14 11h1"/><path d="M14 15h1"/>
                    </svg>
                    Companies
                  </Link>

                  {/* About Us */}
                  <Link to="/about" className="sidebar-menu-item" onClick={() => setMobileMenuOpen(false)}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: 18, height: 18 }}>
                      <circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/>
                    </svg>
                    About Us
                  </Link>

                  {/* Help & Support */}
                  <Link to="/contact" className="sidebar-menu-item" onClick={() => setMobileMenuOpen(false)}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: 18, height: 18 }}>
                      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                    </svg>
                    Help & Support
                  </Link>

                  <div className="sidebar-menu-divider"></div>

                  {/* Log In */}
                  <Link to="/login" className="sidebar-menu-item" onClick={() => setMobileMenuOpen(false)}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: 18, height: 18 }}>
                      <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/><polyline points="10 17 15 12 10 7"/><line x1="15" y1="12" x2="3" y2="12"/>
                    </svg>
                    {t.login}
                  </Link>

                  {/* Sign Up */}
                  <Link to="/signup" className="sidebar-menu-item" onClick={() => setMobileMenuOpen(false)}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: 18, height: 18 }}>
                      <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><line x1="19" y1="8" x2="19" y2="14"/><line x1="22" y1="11" x2="16" y2="11"/>
                    </svg>
                    {t.signup}
                  </Link>
                </div>
              </div>
            )}
          </div>

          {/* DESKTOP ONLY LINKS */}
          {currentUser?.role !== 'employer' && (
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
              onClick={() => navigate(currentUser.role === 'admin' ? '/admin/dashboard' : '/dashboard')} 
              ref={dropdownRef} 
              style={{ border: 'none', padding: 0, background: 'transparent', cursor: 'pointer', alignItems: 'center' }}
              title="Dashboard Overview"
            >
              <div className="navbar-avatar" style={{ background: '#344BFD', color: '#ffffff', width: '42px', height: '42px', borderRadius: '50%', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 6px rgba(52, 75, 253, 0.2)' }}>
                {currentUser.profilePictureUrl ? (
                  <img src={currentUser.profilePictureUrl} alt={currentUser.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  getInitials(currentUser.name)
                )}
              </div>

              {dropdownOpen && (
                <div className="user-dropdown">
                  <button className="dropdown-item" onClick={() => navigate(currentUser.role === 'admin' ? '/admin/dashboard' : '/dashboard')}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: 18, height: 18, marginRight: 8 }}>
                      <rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>
                    </svg>
                    {t.dashboard}
                  </button>
                  {currentUser.role === 'admin' ? (
                    <button className="dropdown-item" onClick={() => navigate('/admin/dashboard')}>
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: 18, height: 18, marginRight: 8 }}>
                        <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
                      </svg>
                      Admin Dashboard
                    </button>
                  ) : currentUser.role === 'candidate' ? (
                    <>
                      <button className="dropdown-item" onClick={() => navigate('/dashboard?tab=profile')}>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: 18, height: 18, marginRight: 8 }}>
                          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
                        </svg>
                        {t.profile}
                      </button>
                      <button className="dropdown-item" onClick={() => navigate('/dashboard?tab=resume')}>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: 18, height: 18, marginRight: 8 }}>
                          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/>
                        </svg>
                        {currentUser.resume ? t.myResume : t.uploadResume}
                      </button>
                      <button className="dropdown-item" onClick={() => navigate('/dashboard?tab=saved')}>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: 18, height: 18, marginRight: 8 }}>
                          <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>
                        </svg>
                        {t.savedJobs}
                      </button>
                    </>
                  ) : null}
                  <button className="dropdown-item" onClick={() => navigate('/dashboard?tab=security')}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: 18, height: 18, marginRight: 8 }}>
                      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                    </svg>
                    Security & Sessions
                  </button>
                  <div className="dropdown-divider"></div>
                  <button className="dropdown-item danger" onClick={handleLogout}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: 18, height: 18, marginRight: 8 }}>
                      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
                    </svg>
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

          <div className={`navbar-toggle ${mobileMenuOpen ? 'open' : ''}`} onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            <span></span><span></span><span></span>
          </div>
        </div>
      </div>

      {/* MOBILE SEARCH STRIP BELOW HEADER ROW */}
      {isSearchAllowed && (
        <div className="mobile-search-strip">
          <HeaderSearchBar />
        </div>
      )}
    </div>
  </nav>
  );
};
export default Navbar;
