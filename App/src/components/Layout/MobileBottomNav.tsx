import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useStore } from '../../store/useStore';
import { useTranslation } from '../../utils/translations';

export const MobileBottomNav: React.FC = () => {
  const { currentUser } = useAuth();
  const { state } = useStore();
  const t = useTranslation(state.language);
  const location = useLocation();

  const isEmployer = currentUser?.role === 'employer';

  // Do not render bottom navigation bar on dedicated candidate profile & post-job pages
  if (
    location.pathname.startsWith('/profile/') ||
    location.pathname.startsWith('/candidate/') ||
    location.pathname.startsWith('/p/') ||
    location.pathname.startsWith('/post-job') ||
    location.pathname.startsWith('/edit-job')
  ) {
    return null;
  }

  const isTabActive = (targetPath: string) => {
    if (targetPath.includes('?tab=')) {
      const searchParams = new URLSearchParams(location.search);
      const defaultTab = isEmployer ? 'candidates' : 'profile';
      const currentTab = searchParams.get('tab') || defaultTab;
      const targetTab = new URLSearchParams(targetPath.split('?')[1]).get('tab');
      
      if (location.pathname === '/profile' && targetTab === 'profile') {
        return true;
      }
      return location.pathname === '/dashboard' && currentTab === targetTab;
    }
    if (targetPath === '/post-job') {
      return location.pathname === '/post-job' || (location.pathname === '/dashboard' && new URLSearchParams(location.search).get('tab') === 'post-job');
    }
    return location.pathname === targetPath && !location.search;
  };

  return (
    <div className="mobile-bottom-nav">
      {/* ── EMPLOYER ITEMS ── */}
      {isEmployer ? (
        <>
          {/* 1. Candidates */}
          <NavLink to="/dashboard?tab=candidates" className={() => `mobile-bottom-item ${isTabActive('/dashboard?tab=candidates') ? 'active' : ''}`}>
            <div className="mobile-bottom-icon-wrap">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
                <path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
              </svg>
            </div>
            <span>Candidates</span>
          </NavLink>

          {/* 2. Applicants */}
          <NavLink to="/dashboard?tab=applicants" className={() => `mobile-bottom-item ${isTabActive('/dashboard?tab=applicants') ? 'active' : ''}`}>
            <div className="mobile-bottom-icon-wrap">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
                <rect x="8" y="2" width="8" height="4" rx="1" ry="1" />
                <path d="M9 14l2 2 4-4" />
              </svg>
            </div>
            <span>Applicants</span>
          </NavLink>

          {/* 3. Post Job */}
          <NavLink to="/post-job" className={() => `mobile-bottom-item ${isTabActive('/post-job') ? 'active' : ''}`}>
            <div className="mobile-bottom-icon-wrap">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"/>
                <line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/>
              </svg>
            </div>
            <span>Post Job</span>
          </NavLink>

          {/* 4. Manage Jobs */}
          <NavLink to="/dashboard?tab=manage" className={() => `mobile-bottom-item ${isTabActive('/dashboard?tab=manage') ? 'active' : ''}`}>
            <div className="mobile-bottom-icon-wrap">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
                <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
              </svg>
            </div>
            <span>Manage Jobs</span>
          </NavLink>
        </>
      ) : (
        /* ── CANDIDATE / GUEST ITEMS ── */
        <>
          {/* 1. Home */}
          <NavLink to="/" className={() => `mobile-bottom-item ${isTabActive('/') ? 'active' : ''}`}>
            <div className="mobile-bottom-icon-wrap">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                <polyline points="9 22 9 12 15 12 15 22"/>
              </svg>
            </div>
            <span>{t.home}</span>
          </NavLink>

          {/* 2. Find Jobs */}
          <NavLink to="/jobs" className={() => `mobile-bottom-item ${isTabActive('/jobs') ? 'active' : ''}`}>
            <div className="mobile-bottom-icon-wrap">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
                <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
              </svg>
            </div>
            <span>{t.findJobs}</span>
          </NavLink>

          {/* 3. Companies */}
          <NavLink to="/companies" className={() => `mobile-bottom-item ${isTabActive('/companies') ? 'active' : ''}`}>
            <div className="mobile-bottom-icon-wrap">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="4" y="2" width="16" height="20" rx="2" ry="2"/>
                <path d="M9 22v-4h6v4"/>
                <path d="M8 6h.01"/><path d="M16 6h.01"/>
                <path d="M8 10h.01"/><path d="M16 10h.01"/>
                <path d="M8 14h.01"/><path d="M16 14h.01"/>
              </svg>
            </div>
            <span>Companies</span>
          </NavLink>

          {/* 4. Applied Jobs (if logged in) */}
          {currentUser && (
            <NavLink to="/dashboard?tab=applied" className={() => `mobile-bottom-item ${isTabActive('/dashboard?tab=applied') ? 'active' : ''}`}>
              <div className="mobile-bottom-icon-wrap">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
                  <rect x="8" y="2" width="8" height="4" rx="1" ry="1" />
                  <path d="M9 14l2 2 4-4" />
                </svg>
              </div>
              <span>Applied</span>
            </NavLink>
          )}
        </>
      )}

      {/* ── PROFILE / SIGNUP ITEM ── */}
      {currentUser ? (
        <NavLink 
          to={currentUser.role === 'admin' ? '/admin/dashboard' : '/dashboard?tab=profile'} 
          className={() => `mobile-bottom-item ${isTabActive('/dashboard?tab=profile') ? 'active' : ''}`}
        >
          <div className="mobile-bottom-icon-wrap">
            {currentUser.profilePictureUrl ? (
              <img 
                src={currentUser.profilePictureUrl} 
                alt={currentUser.name} 
                style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} 
              />
            ) : (
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
              </svg>
            )}
          </div>
          <span style={{ maxWidth: '64px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {currentUser.name.split(' ')[0]}
          </span>
        </NavLink>
      ) : (
        <NavLink to="/signup" className={() => `mobile-bottom-item ${isTabActive('/signup') ? 'active' : ''}`}>
          <div className="mobile-bottom-icon-wrap">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="8.5" cy="7" r="4"/>
              <line x1="20" y1="8" x2="20" y2="14"/><line x1="17" y1="11" x2="23" y2="11"/>
            </svg>
          </div>
          <span>{t.signup}</span>
        </NavLink>
      )}

    </div>
  );
};
export default MobileBottomNav;
