import React, { useState, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { apiFetch } from '../../utils/api';
import {
  Users,
  ClipboardCheck,
  PlusCircle,
  Bell,
  LayoutList,
  Home,
  Building2,
  Search,
} from 'lucide-react';

export const MobileBottomNav: React.FC = () => {
  const { currentUser } = useAuth();
  const location = useLocation();
  const [unreadCount, setUnreadCount] = useState(0);

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

  useEffect(() => {
    if (!currentUser?.id) return;
    const fetchUnread = () => {
      apiFetch('/api/v1/notifications')
        .then(res => res.ok ? res.json() : null)
        .then(data => {
          const list = Array.isArray(data) ? data : (data?.data || []);
          if (Array.isArray(list)) {
            const count = list.filter((n: any) => !n.read).length;
            setUnreadCount(count);
          }
        })
        .catch(() => {});
    };
    fetchUnread();
    window.addEventListener('notifications-updated', fetchUnread);
    return () => window.removeEventListener('notifications-updated', fetchUnread);
  }, [currentUser?.id]);

  // Do not render on full screen dedicated detail pages
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
    if (targetPath === '/companies') {
      return location.pathname.startsWith('/companies');
    }
    if (targetPath === '/jobs') {
      return location.pathname === '/jobs';
    }
    return location.pathname === targetPath && !location.search;
  };

  return (
    <nav className="mobile-app-tab-dock" aria-label="Mobile Bottom Navigation">
      <div className="mobile-app-tab-row">
        {isEmployer ? (
          <>
            {/* 1. Candidates */}
            <NavLink
              to="/dashboard?tab=candidates"
              className={`mobile-app-tab-item ${isTabActive('/dashboard?tab=candidates') ? 'active' : ''}`}
            >
              {isTabActive('/dashboard?tab=candidates') && <div className="tab-top-indicator" />}
              <div className="tab-icon-box">
                <Users
                  size={23}
                  color={isTabActive('/dashboard?tab=candidates') ? '#1B4FDF' : '#64748B'}
                  strokeWidth={isTabActive('/dashboard?tab=candidates') ? 2.4 : 1.8}
                />
              </div>
              <span className="tab-label">Candidates</span>
            </NavLink>

            {/* 2. Applicants */}
            <NavLink
              to="/dashboard?tab=applicants"
              className={`mobile-app-tab-item ${isTabActive('/dashboard?tab=applicants') ? 'active' : ''}`}
            >
              {isTabActive('/dashboard?tab=applicants') && <div className="tab-top-indicator" />}
              <div className="tab-icon-box">
                <ClipboardCheck
                  size={23}
                  color={isTabActive('/dashboard?tab=applicants') ? '#1B4FDF' : '#64748B'}
                  strokeWidth={isTabActive('/dashboard?tab=applicants') ? 2.4 : 1.8}
                />
              </div>
              <span className="tab-label">Applicants</span>
            </NavLink>

            {/* 3. Post */}
            <NavLink
              to="/post-job"
              className={`mobile-app-tab-item ${isTabActive('/post-job') ? 'active' : ''}`}
            >
              {isTabActive('/post-job') && <div className="tab-top-indicator" />}
              <div className="tab-icon-box">
                <PlusCircle
                  size={23}
                  color={isTabActive('/post-job') ? '#1B4FDF' : '#64748B'}
                  strokeWidth={isTabActive('/post-job') ? 2.4 : 1.8}
                />
              </div>
              <span className="tab-label">Post</span>
            </NavLink>

            {/* 4. Manage */}
            <NavLink
              to="/dashboard?tab=manage"
              className={`mobile-app-tab-item ${isTabActive('/dashboard?tab=manage') ? 'active' : ''}`}
            >
              {isTabActive('/dashboard?tab=manage') && <div className="tab-top-indicator" />}
              <div className="tab-icon-box">
                <LayoutList
                  size={23}
                  color={isTabActive('/dashboard?tab=manage') ? '#1B4FDF' : '#64748B'}
                  strokeWidth={isTabActive('/dashboard?tab=manage') ? 2.4 : 1.8}
                />
              </div>
              <span className="tab-label">Manage</span>
            </NavLink>

            {/* 5. Company */}
            <NavLink
              to="/dashboard?tab=profile"
              className={`mobile-app-tab-item ${isTabActive('/dashboard?tab=profile') ? 'active' : ''}`}
            >
              {isTabActive('/dashboard?tab=profile') && <div className="tab-top-indicator" />}
              <div className="tab-icon-box">
                <Building2
                  size={23}
                  color={isTabActive('/dashboard?tab=profile') ? '#1B4FDF' : '#64748B'}
                  strokeWidth={isTabActive('/dashboard?tab=profile') ? 2.4 : 1.8}
                />
              </div>
              <span className="tab-label">Company</span>
            </NavLink>
          </>
        ) : (
          <>
            {/* 1. Home */}
            <NavLink
              to="/"
              className={`mobile-app-tab-item ${isTabActive('/') ? 'active' : ''}`}
            >
              {isTabActive('/') && <div className="tab-top-indicator" />}
              <div className="tab-icon-box">
                <Home
                  size={23}
                  color={isTabActive('/') ? '#1B4FDF' : '#64748B'}
                  strokeWidth={isTabActive('/') ? 2.4 : 1.8}
                />
              </div>
              <span className="tab-label">Home</span>
            </NavLink>

            {/* 2. Companies */}
            <NavLink
              to="/companies"
              className={`mobile-app-tab-item ${isTabActive('/companies') ? 'active' : ''}`}
            >
              {isTabActive('/companies') && <div className="tab-top-indicator" />}
              <div className="tab-icon-box">
                <Building2
                  size={23}
                  color={isTabActive('/companies') ? '#1B4FDF' : '#64748B'}
                  strokeWidth={isTabActive('/companies') ? 2.4 : 1.8}
                />
              </div>
              <span className="tab-label">Companies</span>
            </NavLink>

            {/* 3. Jobs */}
            <NavLink
              to="/jobs"
              className={`mobile-app-tab-item ${isTabActive('/jobs') ? 'active' : ''}`}
            >
              {isTabActive('/jobs') && <div className="tab-top-indicator" />}
              <div className="tab-icon-box">
                <Search
                  size={23}
                  color={isTabActive('/jobs') ? '#1B4FDF' : '#64748B'}
                  strokeWidth={isTabActive('/jobs') ? 2.4 : 1.8}
                />
              </div>
              <span className="tab-label">Jobs</span>
            </NavLink>

            {/* 4. Alerts */}
            <NavLink
              to="/dashboard?tab=notifications"
              className={`mobile-app-tab-item ${isTabActive('/dashboard?tab=notifications') ? 'active' : ''}`}
            >
              {isTabActive('/dashboard?tab=notifications') && <div className="tab-top-indicator" />}
              <div className="tab-icon-box">
                <Bell
                  size={23}
                  color={isTabActive('/dashboard?tab=notifications') ? '#1B4FDF' : '#64748B'}
                  strokeWidth={isTabActive('/dashboard?tab=notifications') ? 2.4 : 1.8}
                />
                {unreadCount > 0 && (
                  <span className="tab-badge">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </div>
              <span className="tab-label">Alerts</span>
            </NavLink>

            {/* 5. Applied */}
            <NavLink
              to={currentUser ? '/dashboard?tab=applied' : '/login'}
              className={`mobile-app-tab-item ${isTabActive('/dashboard?tab=applied') ? 'active' : ''}`}
            >
              {isTabActive('/dashboard?tab=applied') && <div className="tab-top-indicator" />}
              <div className="tab-icon-box">
                <ClipboardCheck
                  size={23}
                  color={isTabActive('/dashboard?tab=applied') ? '#1B4FDF' : '#64748B'}
                  strokeWidth={isTabActive('/dashboard?tab=applied') ? 2.4 : 1.8}
                />
              </div>
              <span className="tab-label">Applied</span>
            </NavLink>
          </>
        )}
      </div>
    </nav>
  );
};

export default MobileBottomNav;
