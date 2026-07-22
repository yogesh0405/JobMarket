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

  if (location.pathname.startsWith('/job/')) {
    return null;
  }

  // Highlight active state for dashboard tabs
  const isTabActive = (path: string) => {
    return location.pathname + location.search === path;
  };

  return (
    <div className="mobile-bottom-nav">
      {/* Home */}
      <NavLink to="/" className={({ isActive }) => `mobile-bottom-item ${isActive && location.search === '' ? 'active' : ''}`}>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
          <polyline points="9 22 9 12 15 12 15 22"/>
        </svg>
        <span>{t.home}</span>
      </NavLink>

      {/* Find Jobs */}
      <NavLink to="/jobs" className={({ isActive }) => `mobile-bottom-item ${isActive ? 'active' : ''}`}>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
        </svg>
        <span>{t.findJobs}</span>
      </NavLink>

      {/* Middle Dynamic Button: Post Job / Deployments / Saved */}
      {currentUser?.role === 'employer' ? (
        <NavLink to="/post-job" className={({ isActive }) => `mobile-bottom-item ${isActive ? 'active' : ''}`}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/>
          </svg>
          <span>{t.postJob}</span>
        </NavLink>
      ) : currentUser?.role === 'candidate' ? (
        <NavLink to="/dashboard?tab=saved" className={`mobile-bottom-item ${isTabActive('/dashboard?tab=saved') ? 'active' : ''}`}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>
          </svg>
          <span>Saved</span>
        </NavLink>
      ) : (
        <NavLink to="/login" className={({ isActive }) => `mobile-bottom-item ${isActive ? 'active' : ''}`}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/><polyline points="10 17 15 12 10 7"/><line x1="15" y1="12" x2="3" y2="12"/>
          </svg>
          <span>{t.login}</span>
        </NavLink>
      )}


      {/* Profile / Signup */}
      {currentUser ? (
        <NavLink to={currentUser.role === 'candidate' ? '/profile' : '/dashboard'} className={({ isActive }) => `mobile-bottom-item ${isActive ? 'active' : ''}`}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
          </svg>
          <span>{currentUser.name.split(' ')[0]}</span>
        </NavLink>
      ) : (
        <NavLink to="/signup" className={({ isActive }) => `mobile-bottom-item ${isActive ? 'active' : ''}`}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
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
