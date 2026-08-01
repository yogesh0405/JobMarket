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

  // Highlight active state for dashboard tabs
  const isTabActive = (path: string) => {
    return location.pathname + location.search === path;
  };

  const isEmployer = currentUser?.role === 'employer';

  return (
    <div className="mobile-bottom-nav">
      {/* Item 1: Candidates for Employer OR Home for Candidates/Guests */}
      {isEmployer ? (
        <NavLink to="/dashboard?tab=candidates" className={`mobile-bottom-item ${isTabActive('/dashboard?tab=candidates') ? 'active' : ''}`}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
            <path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
          </svg>
          <span>Candidates</span>
        </NavLink>
      ) : (
        <NavLink to="/" className={({ isActive }) => `mobile-bottom-item ${isActive && location.search === '' ? 'active' : ''}`}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
            <polyline points="9 22 9 12 15 12 15 22"/>
          </svg>
          <span>{t.home}</span>
        </NavLink>
      )}

      {/* Item 2: Applicants (with professional logo) for Employer OR Find Jobs for Candidate/Guest */}
      {isEmployer ? (
        <NavLink to="/dashboard?tab=applicants" className={`mobile-bottom-item ${isTabActive('/dashboard?tab=applicants') ? 'active' : ''}`}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
            <rect x="8" y="2" width="8" height="4" rx="1" ry="1" />
            <path d="M9 14l2 2 4-4" />
          </svg>
          <span>Applicants</span>
        </NavLink>
      ) : (
        <NavLink to="/jobs" className={({ isActive }) => `mobile-bottom-item ${isActive ? 'active' : ''}`}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
            <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
          </svg>
          <span>{t.findJobs}</span>
        </NavLink>
      )}

      {/* Item 3: Center FAB - Post Job for Employer */}
      {isEmployer && (
        <NavLink to="/post-job" className={({ isActive }) => `mobile-bottom-item fab-item ${isActive ? 'active' : ''}`}>
          <div className="fab-circle">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ width: 20, height: 20, color: 'white' }}>
              <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="16" y2="12"/>
            </svg>
          </div>
          <span>{state.language === 'en' ? 'Post' : t.postJob}</span>
        </NavLink>
      )}

      {/* Candidate Tabs: Applied & Saved */}
      {currentUser?.role === 'candidate' && (
        <>
          <NavLink to="/dashboard?tab=applied" className={`mobile-bottom-item ${isTabActive('/dashboard?tab=applied') ? 'active' : ''}`}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
              <rect x="8" y="2" width="8" height="4" rx="1" ry="1" />
              <path d="M9 14l2 2 4-4" />
            </svg>
            <span>Applied</span>
          </NavLink>

          <NavLink to="/dashboard?tab=saved" className={`mobile-bottom-item ${isTabActive('/dashboard?tab=saved') ? 'active' : ''}`}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>
            </svg>
            <span>Saved</span>
          </NavLink>
        </>
      )}

      {/* Item 4: Manage Jobs for Employer */}
      {currentUser?.role === 'employer' && (
        <NavLink to="/dashboard?tab=manage" className={`mobile-bottom-item ${isTabActive('/dashboard?tab=manage') ? 'active' : ''}`}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
            <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
          </svg>
          <span>Manage Jobs</span>
        </NavLink>
      )}


      {/* Profile / Signup */}
      {currentUser ? (
        <NavLink 
          to={currentUser.role === 'admin' ? '/admin/dashboard' : '/dashboard?tab=profile'} 
          className={`mobile-bottom-item ${isTabActive('/dashboard?tab=profile') || location.pathname === '/profile' ? 'active' : ''}`}
        >
          <div className="mobile-bottom-avatar" style={{
            width: '22px',
            height: '22px',
            borderRadius: '50%',
            overflow: 'hidden',
            background: 'var(--primary)',
            color: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '10px',
            fontWeight: 'bold',
            marginBottom: '4px',
            boxShadow: '0 0 0 1px var(--border-light)'
          }}>
            {currentUser.profilePictureUrl ? (
              <img src={currentUser.profilePictureUrl} alt={currentUser.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              currentUser.name.charAt(0).toUpperCase()
            )}
          </div>
          <span style={{ maxWidth: '64px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {currentUser.name.split(' ')[0]}
          </span>
        </NavLink>
      ) : (
        <NavLink to="/signup" className={({ isActive }) => `mobile-bottom-item ${isActive ? 'active' : ''}`}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="8.5" cy="7" r="4"/>
            <line x1="20" y1="8" x2="20" y2="14"/><line x1="17" y1="11" x2="23" y2="11"/>
          </svg>
          <span>{t.signup}</span>
        </NavLink>
      )}
    </div>
  );
};
export default MobileBottomNav;
