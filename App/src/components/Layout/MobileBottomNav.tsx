import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useStore } from '../../store/useStore';
import { useTranslation } from '../../utils/translations';
import {
  Home,
  Building2,
  Search,
  ClipboardCheck,
  User,
  Users,
  Briefcase,
  Plus,
  Bell,
} from 'lucide-react';

export const MobileBottomNav: React.FC = () => {
  const { currentUser } = useAuth();
  const { state } = useStore();
  const t = useTranslation(state.language);
  const location = useLocation();

  const isEmployer = currentUser?.role === 'employer';

  const isJobDetailRoute = (location.pathname.startsWith('/job/') || location.pathname.startsWith('/jobs/')) && location.pathname !== '/jobs' && location.pathname !== '/jobs/map';
  const isCompanyProfileRoute = (location.pathname.startsWith('/company/') || location.pathname.startsWith('/companies/')) && location.pathname !== '/companies';
  const isBannersSection = location.pathname.startsWith('/dashboard') && (
    location.search.includes('tab=advertisements') ||
    location.search.includes('tab=banners') ||
    location.search.includes('tab=promotions')
  );
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

  // Do not render bottom navigation bar on dedicated candidate profile, job detail, company profile, promotional banners, interviews, about, support, & security sections
  if (
    location.pathname.startsWith('/profile/') ||
    location.pathname.startsWith('/candidate/') ||
    location.pathname.startsWith('/p/') ||
    isJobDetailRoute ||
    isCompanyProfileRoute ||
    isBannersSection ||
    isInterviewsSection ||
    isAboutSection ||
    isContactSection ||
    isSecuritySection
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

  const userName = currentUser?.name || (currentUser as any)?.companyName || (currentUser as any)?.company_name || 'Profile';
  const firstInitial = (typeof userName === 'string' && userName.trim() ? userName.charAt(0).toUpperCase() : 'U');

  return (
    <div className="mobile-notched-dock-wrapper">
      <div className="mobile-notched-dock-container">
        {/* SVG Notched Background Dock */}
        <svg
          className="mobile-notched-dock-svg"
          viewBox="0 0 400 64"
          preserveAspectRatio="none"
        >
          <path
            d="M 0,0 H 158 C 174,0 178,24 200,24 C 222,24 226,0 242,0 H 400 V 64 H 0 Z"
            fill="#FFFFFF"
            stroke="#E2E8F0"
            strokeWidth="0.8"
          />
        </svg>

        {/* Tab Items Row */}
        <div className="mobile-notched-dock-row">
          {isEmployer ? (
            /* ══════════════════════════════════════════════════
               EMPLOYER BOTTOM NAVIGATION TABS (100% MobileApp UI)
               ══════════════════════════════════════════════════ */
            <>
              {/* 1. Candidates */}
              <NavLink
                to="/dashboard?tab=candidates"
                className={`mobile-notched-tab-item ${isTabActive('/dashboard?tab=candidates') ? 'active' : ''}`}
              >
                <div className="tab-icon-box">
                  <Users
                    size={21}
                    color={isTabActive('/dashboard?tab=candidates') ? '#1B4FDF' : '#1E293B'}
                    strokeWidth={isTabActive('/dashboard?tab=candidates') ? 2.5 : 2.1}
                  />
                </div>
                {isTabActive('/dashboard?tab=candidates') && <div className="tab-active-capsule" />}
                <span className="tab-label">Candidates</span>
              </NavLink>

              {/* 2. Applicants */}
              <NavLink
                to="/dashboard?tab=applicants"
                className={`mobile-notched-tab-item ${isTabActive('/dashboard?tab=applicants') ? 'active' : ''}`}
              >
                <div className="tab-icon-box">
                  <ClipboardCheck
                    size={21}
                    color={isTabActive('/dashboard?tab=applicants') ? '#1B4FDF' : '#1E293B'}
                    strokeWidth={isTabActive('/dashboard?tab=applicants') ? 2.5 : 2.1}
                  />
                </div>
                {isTabActive('/dashboard?tab=applicants') && <div className="tab-active-capsule" />}
                <span className="tab-label">Applicants</span>
              </NavLink>

              {/* 3. CENTER FLOATING POST JOB BUTTON */}
              <div className="mobile-notched-center-slot">
                <NavLink
                  to="/post-job"
                  className={`mobile-notched-fab-btn ${isTabActive('/post-job') ? 'active' : ''}`}
                  title="Post Job"
                >
                  <div className="fab-circle-gradient">
                    <Plus size={24} color="#FFFFFF" strokeWidth={2.8} />
                  </div>
                  <span className="fab-label">Post</span>
                </NavLink>
              </div>

              {/* 4. Notifications / Alerts */}
              <NavLink
                to="/dashboard?tab=notifications"
                className={`mobile-notched-tab-item ${isTabActive('/dashboard?tab=notifications') ? 'active' : ''}`}
              >
                <div className="tab-icon-box">
                  <Bell
                    size={21}
                    color={isTabActive('/dashboard?tab=notifications') ? '#1B4FDF' : '#1E293B'}
                    strokeWidth={isTabActive('/dashboard?tab=notifications') ? 2.5 : 2.1}
                  />
                </div>
                {isTabActive('/dashboard?tab=notifications') && <div className="tab-active-capsule" />}
                <span className="tab-label">Alerts</span>
              </NavLink>

              {/* 5. Manage Jobs */}
              <NavLink
                to="/dashboard?tab=manage"
                className={`mobile-notched-tab-item ${isTabActive('/dashboard?tab=manage') ? 'active' : ''}`}
              >
                <div className="tab-icon-box">
                  <Briefcase
                    size={21}
                    color={isTabActive('/dashboard?tab=manage') ? '#1B4FDF' : '#1E293B'}
                    strokeWidth={isTabActive('/dashboard?tab=manage') ? 2.5 : 2.1}
                  />
                </div>
                {isTabActive('/dashboard?tab=manage') && <div className="tab-active-capsule" />}
                <span className="tab-label">Manage Jobs</span>
              </NavLink>
            </>
          ) : (
            /* ══════════════════════════════════════════════════
               CANDIDATE / GUEST BOTTOM NAVIGATION TABS
               ══════════════════════════════════════════════════ */
            <>
              {/* 1. Home */}
              <NavLink
                to="/"
                className={`mobile-notched-tab-item ${isTabActive('/') ? 'active' : ''}`}
              >
                <div className="tab-icon-box">
                  <Home
                    size={21}
                    color={isTabActive('/') ? '#1B4FDF' : '#1E293B'}
                    strokeWidth={isTabActive('/') ? 2.5 : 2.1}
                  />
                </div>
                {isTabActive('/') && <div className="tab-active-capsule" />}
                <span className="tab-label">{t.home}</span>
              </NavLink>

              {/* 2. Companies */}
              <NavLink
                to="/companies"
                className={`mobile-notched-tab-item ${isTabActive('/companies') ? 'active' : ''}`}
              >
                <div className="tab-icon-box">
                  <Building2
                    size={21}
                    color={isTabActive('/companies') ? '#1B4FDF' : '#1E293B'}
                    strokeWidth={isTabActive('/companies') ? 2.5 : 2.1}
                  />
                </div>
                {isTabActive('/companies') && <div className="tab-active-capsule" />}
                <span className="tab-label">Companies</span>
              </NavLink>

              {/* 3. CENTER FLOATING FIND JOBS BUTTON */}
              <div className="mobile-notched-center-slot">
                <NavLink
                  to="/jobs"
                  className={`mobile-notched-fab-btn ${isTabActive('/jobs') ? 'active' : ''}`}
                  title="Find Jobs"
                >
                  <div className="fab-circle-gradient">
                    <Search size={22} color="#FFFFFF" strokeWidth={2.8} />
                  </div>
                  <span className="fab-label">{t.findJobs}</span>
                </NavLink>
              </div>

              {/* 4. Applied */}
              <NavLink
                to={currentUser ? '/dashboard?tab=applied' : '/login'}
                className={`mobile-notched-tab-item ${isTabActive('/dashboard?tab=applied') ? 'active' : ''}`}
              >
                <div className="tab-icon-box">
                  <ClipboardCheck
                    size={21}
                    color={isTabActive('/dashboard?tab=applied') ? '#1B4FDF' : '#1E293B'}
                    strokeWidth={isTabActive('/dashboard?tab=applied') ? 2.5 : 2.1}
                  />
                </div>
                {isTabActive('/dashboard?tab=applied') && <div className="tab-active-capsule" />}
                <span className="tab-label">Applied</span>
              </NavLink>

              {/* 5. Profile */}
              <NavLink
                to={currentUser ? (currentUser.role === 'admin' ? '/admin/dashboard' : '/dashboard?tab=profile') : '/login'}
                className={`mobile-notched-tab-item ${isTabActive('/dashboard?tab=profile') || isTabActive('/login') ? 'active' : ''}`}
              >
                <div className="tab-icon-box">
                  {currentUser?.profilePictureUrl && typeof currentUser.profilePictureUrl === 'string' ? (
                    <img
                      src={currentUser.profilePictureUrl}
                      alt={userName}
                      referrerPolicy="no-referrer"
                      style={{
                        width: isTabActive('/dashboard?tab=profile') ? '24px' : '22px',
                        height: isTabActive('/dashboard?tab=profile') ? '24px' : '22px',
                        borderRadius: '50%',
                        objectFit: 'cover',
                        border: isTabActive('/dashboard?tab=profile') ? '2px solid #1B4FDF' : '1.5px solid #1E293B',
                      }}
                      onError={(e) => {
                        (e.currentTarget as HTMLElement).style.display = 'none';
                      }}
                    />
                  ) : (
                    <User
                      size={21}
                      color={isTabActive('/dashboard?tab=profile') || isTabActive('/login') ? '#1B4FDF' : '#1E293B'}
                      strokeWidth={isTabActive('/dashboard?tab=profile') || isTabActive('/login') ? 2.5 : 2.1}
                    />
                  )}
                </div>
                {(isTabActive('/dashboard?tab=profile') || isTabActive('/login')) && <div className="tab-active-capsule" />}
                <span className="tab-label">
                  {currentUser ? (userName.split(' ')[0] || 'Profile') : t.login}
                </span>
              </NavLink>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default MobileBottomNav;
