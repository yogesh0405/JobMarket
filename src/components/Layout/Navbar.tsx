import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../hooks/useToast';
import { useStore } from '../../store/useStore';
import { useTranslation, Language } from '../../utils/translations';
import { getInitials } from '../../utils/helpers';

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

  const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    dispatch({ type: 'SET_LANGUAGE', payload: e.target.value as Language });
    showToast(e.target.value === 'mr' ? 'भाषा बदलली: मराठी' : e.target.value === 'hi' ? 'भाषा बदली: हिन्दी' : 'Language changed: English', 'info');
  };

  return (
    <nav className={`navbar ${scrolled ? 'scrolled' : ''}`}>
      <div className={`mobile-backdrop ${mobileMenuOpen ? 'open' : ''}`} onClick={() => setMobileMenuOpen(false)}></div>
      <div className="navbar-inner">
        <Link to="/" className="navbar-brand">
          <div className="navbar-logo" style={{ background: 'var(--gradient-accent)' }}>JM</div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span className="navbar-brand-text" style={{ background: 'var(--gradient-accent)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>{t.brand}</span>
            <span style={{ fontSize: '9px', color: 'var(--text-secondary)', marginTop: '-2px', fontWeight: 'bold' }}>{t.tagline}</span>
          </div>
        </Link>

        <div className={`navbar-nav ${mobileMenuOpen ? 'open' : ''}`}>
          {currentUser && (
            <div className="mobile-sidebar-profile">
              <div className="sidebar-profile-header">
                <div className="sidebar-profile-avatar" style={{ background: '#344BFD', color: '#ffffff', width: '48px', height: '48px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '18px' }}>
                  {getInitials(currentUser.name)}
                </div>
                <div className="sidebar-profile-info">
                  <span className="sidebar-profile-name">{currentUser.name}</span>
                  <span className="sidebar-profile-email">{currentUser.email}</span>
                </div>
              </div>
              
              <div className="sidebar-profile-menu">
                <Link to="/dashboard" className="sidebar-menu-item" onClick={() => setMobileMenuOpen(false)}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: 18, height: 18 }}>
                    <rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>
                  </svg>
                  {t.dashboard}
                </Link>
                
                {currentUser.role === 'candidate' ? (
                  <>
                    <Link to="/dashboard?tab=profile" className="sidebar-menu-item" onClick={() => setMobileMenuOpen(false)}>
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: 18, height: 18 }}>
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
                      </svg>
                      {t.profile}
                    </Link>
                    <Link to="/dashboard?tab=resume" className="sidebar-menu-item" onClick={() => setMobileMenuOpen(false)}>
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: 18, height: 18 }}>
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/>
                      </svg>
                      {t.uploadResume}
                    </Link>
                    <Link to="/dashboard?tab=saved" className="sidebar-menu-item" onClick={() => setMobileMenuOpen(false)}>
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: 18, height: 18 }}>
                        <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>
                      </svg>
                      {t.savedJobs}
                    </Link>
                  </>
                ) : (
                  <Link to="/post-job" className="sidebar-menu-item" onClick={() => setMobileMenuOpen(false)}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: 18, height: 18 }}>
                      <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/>
                    </svg>
                    {t.postJob}
                  </Link>
                )}
                
                <div className="sidebar-menu-divider"></div>
                
                <button className="sidebar-menu-item danger" onClick={() => { handleLogout(); setMobileMenuOpen(false); }}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: 18, height: 18 }}>
                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
                  </svg>
                  {t.logout}
                </button>
              </div>
            </div>
          )}
          <Link to="/" className={`nav-link ${isActive('/') ? 'active' : ''}`}>{t.home}</Link>
          <Link to="/jobs" className={`nav-link ${isActive('/jobs') ? 'active' : ''}`}>{t.findJobs}</Link>
          <Link to="/post-job" className={`nav-link ${isActive('/post-job') ? 'active' : ''}`}>{t.postJob}</Link>
          {currentUser && (
            <Link to="/dashboard" className={`nav-link ${isActive('/dashboard') ? 'active' : ''}`}>{t.dashboard}</Link>
          )}
          <Link to="/about" className={`nav-link ${isActive('/about') ? 'active' : ''}`}>{t.about}</Link>
          <Link to="/contact" className={`nav-link ${isActive('/contact') ? 'active' : ''}`}>{t.contact}</Link>
          
          {/* Mobile Sidebar Footer */}
          <div className="mobile-sidebar-footer">
            <div className="footer-brand">
              <span className="footer-brand-name">JobMarket</span>
              <p>India's leading job marketplace connecting talented professionals with top companies. Find your dream job or hire the best talent today.</p>
              <div className="footer-social">
                <a href="#" aria-label="Twitter">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                  </svg>
                </a>
                <a href="#" aria-label="LinkedIn">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                  </svg>
                </a>
                <a href="#" aria-label="Instagram">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
                  </svg>
                </a>
                <a href="#" aria-label="Facebook">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                </a>
              </div>
            </div>

            <div className="footer-col">
              <h4>For Job Seekers</h4>
              <Link to="/jobs" onClick={() => setMobileMenuOpen(false)}>Browse Jobs</Link>
              <Link to="/jobs?workMode=Remote" onClick={() => setMobileMenuOpen(false)}>Remote Jobs</Link>
              <Link to="/jobs?jobType=Part-Time" onClick={() => setMobileMenuOpen(false)}>Part-time Jobs</Link>
              <Link to="/jobs?jobType=Freelance" onClick={() => setMobileMenuOpen(false)}>Freelance Jobs</Link>
              <Link to="/resume" onClick={() => setMobileMenuOpen(false)}>Upload Resume</Link>
            </div>

            <div className="footer-col">
              <h4>For Employers</h4>
              <Link to="/post-job" onClick={() => setMobileMenuOpen(false)}>Post a Job</Link>
              <Link to="/signup?role=employer" onClick={() => setMobileMenuOpen(false)}>Create Account</Link>
              <Link to="/dashboard" onClick={() => setMobileMenuOpen(false)}>Employer Dashboard</Link>
              <a href="#">Pricing Plans</a>
            </div>

            <div className="footer-col">
              <h4>Company</h4>
              <Link to="/about" onClick={() => setMobileMenuOpen(false)}>About Us</Link>
              <Link to="/contact" onClick={() => setMobileMenuOpen(false)}>Contact Us</Link>
              <a href="#">Careers</a>
              <a href="#">Blog</a>
            </div>
          </div>
        </div>

        <div className="navbar-actions" style={{ gap: 'var(--space-2)' }}>
          {currentUser ? (
            <div className="navbar-user relative" onClick={() => setDropdownOpen(!dropdownOpen)} ref={dropdownRef} style={{ border: 'none', padding: 0, background: 'transparent' }}>
              <div className="navbar-avatar" style={{ background: '#344BFD', color: '#ffffff', width: '36px', height: '36px', borderRadius: '50%' }}>{getInitials(currentUser.name)}</div>

              {dropdownOpen && (
                <div className="user-dropdown">
                  <button className="dropdown-item" onClick={() => navigate('/dashboard')}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: 18, height: 18, marginRight: 8 }}>
                      <rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>
                    </svg>
                    {t.dashboard}
                  </button>
                  {currentUser.role === 'candidate' ? (
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
                        {t.uploadResume}
                      </button>
                      <button className="dropdown-item" onClick={() => navigate('/dashboard?tab=saved')}>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: 18, height: 18, marginRight: 8 }}>
                          <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>
                        </svg>
                        {t.savedJobs}
                      </button>
                    </>
                  ) : (
                    <button className="dropdown-item" onClick={() => navigate('/post-job')}>
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: 18, height: 18, marginRight: 8 }}>
                        <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/>
                      </svg>
                      {t.postJob}
                    </button>
                  )}
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
            <>
              <Link to="/login" className="btn btn-ghost btn-sm">{t.login}</Link>
              <Link to="/signup" className="btn btn-primary btn-sm btn-pill" style={{ background: 'var(--gradient-accent)' }}>{t.signup}</Link>
            </>
          )}
        </div>

        <div className={`navbar-toggle ${mobileMenuOpen ? 'open' : ''}`} onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
          <span></span><span></span><span></span>
        </div>
      </div>
    </nav>
  );
};
export default Navbar;
