import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import {
  Users,
  ClipboardCheck,
  PlusCircle,
  LayoutList,
  Home,
  Building2,
  Search,
  User,
} from 'lucide-react';

export const MobileBottomNav: React.FC = () => {
  const { currentUser } = useAuth();
  const location = useLocation();

  const [profileImgError, setProfileImgError] = useState(false);
  const [companyLogoError, setCompanyLogoError] = useState(false);

  const userPhoto = currentUser?.profilePictureUrl || (currentUser as any)?.photoURL || (currentUser as any)?.avatar || (currentUser as any)?.profile_picture_url || (currentUser as any)?.avatar_url;
  const companyLogo = (currentUser as any)?.logo || (currentUser as any)?.companyLogo || currentUser?.profilePictureUrl;

  useEffect(() => {
    setProfileImgError(false);
  }, [userPhoto]);

  useEffect(() => {
    setCompanyLogoError(false);
  }, [companyLogo]);

  useEffect(() => {
    const handleProfileUpdate = () => {
      setProfileImgError(false);
      setCompanyLogoError(false);
    };
    window.addEventListener('profile-updated', handleProfileUpdate);
    return () => window.removeEventListener('profile-updated', handleProfileUpdate);
  }, []);

  const isEmployer = currentUser?.role === 'employer';

  const normalizedPath = location.pathname.replace(/\/+$/, '') || '/';
  const isJobsPage = normalizedPath === '/jobs';
  const isCompaniesPage = normalizedPath === '/companies';

  const isJobDetailRoute = !isJobsPage && normalizedPath !== '/jobs/map' && (normalizedPath.startsWith('/job/') || normalizedPath.startsWith('/jobs/'));
  const isCompanyProfileRoute = !isCompaniesPage && (normalizedPath.startsWith('/company/') || normalizedPath.startsWith('/companies/'));
  const isBannersSection = normalizedPath.startsWith('/dashboard') && (
    location.search.includes('tab=advertisements') ||
    location.search.includes('tab=banners') ||
    location.search.includes('tab=promotions')
  );
  const isInterviewsSection = (
    normalizedPath.startsWith('/interviews') ||
    normalizedPath.startsWith('/schedule') ||
    (normalizedPath.startsWith('/dashboard') && (
      location.search.includes('tab=interviews') ||
      location.search.includes('tab=scheduled-interviews') ||
      location.search.includes('tab=schedule')
    ))
  );
  const isAboutSection = normalizedPath.startsWith('/about') || (normalizedPath.startsWith('/dashboard') && location.search.includes('tab=about'));
  const isContactSection = normalizedPath.startsWith('/contact') || normalizedPath.startsWith('/support') || normalizedPath.startsWith('/help') || (normalizedPath.startsWith('/dashboard') && location.search.includes('tab=support'));
  const isSecuritySection = normalizedPath.startsWith('/security') || (normalizedPath.startsWith('/dashboard') && location.search.includes('tab=security'));

  // Do not render on full screen dedicated detail pages
  if (
    normalizedPath.startsWith('/profile/') ||
    normalizedPath.startsWith('/candidate/') ||
    normalizedPath.startsWith('/p/') ||
    normalizedPath.startsWith('/post-job') ||
    normalizedPath.startsWith('/edit-job') ||
    isJobDetailRoute ||
    isCompanyProfileRoute ||
    isBannersSection ||
    isInterviewsSection ||
    isAboutSection ||
    isContactSection ||
    isSecuritySection ||
    normalizedPath === '/notifications' ||
    normalizedPath === '/alerts' ||
    normalizedPath === '/search'
  ) {
    return null;
  }

  const isTabActive = (targetPath: string) => {
    if (targetPath.includes('?tab=')) {
      const searchParams = new URLSearchParams(location.search);
      const defaultTab = isEmployer ? 'candidates' : 'profile';
      const currentTab = searchParams.get('tab') || defaultTab;
      const targetTab = new URLSearchParams(targetPath.split('?')[1]).get('tab');
      
      if (normalizedPath === '/profile' && targetTab === 'profile') {
        return true;
      }
      return normalizedPath === '/dashboard' && currentTab === targetTab;
    }
    if (targetPath === '/post-job') {
      return normalizedPath === '/post-job' || (normalizedPath === '/dashboard' && new URLSearchParams(location.search).get('tab') === 'post-job');
    }
    if (targetPath === '/companies') {
      return isCompaniesPage;
    }
    if (targetPath === '/jobs') {
      return isJobsPage;
    }
    return normalizedPath === targetPath && !location.search;
  };

  return (
    <nav className="mobile-app-tab-dock" aria-label="Mobile Bottom Navigation">
      <div className="mobile-app-tab-row">
        {isEmployer ? (
          <>
            {/* 1. Candidates */}
            <Link
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
            </Link>

            {/* 2. Applicants */}
            <Link
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
            </Link>

            {/* 3. Post */}
            <Link
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
            </Link>

            {/* 4. Manage */}
            <Link
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
            </Link>

            {/* 5. Company */}
            <Link
              to="/dashboard?tab=profile"
              className={`mobile-app-tab-item ${isTabActive('/dashboard?tab=profile') ? 'active' : ''}`}
            >
              {isTabActive('/dashboard?tab=profile') && <div className="tab-top-indicator" />}
              <div className="tab-icon-box">
                {currentUser && companyLogo && !companyLogoError ? (
                  <img
                    src={companyLogo}
                    alt="Company"
                    referrerPolicy="no-referrer"
                    style={{
                      width: '23px',
                      height: '23px',
                      borderRadius: '50%',
                      objectFit: 'cover',
                      border: isTabActive('/dashboard?tab=profile') ? '2px solid #1B4FDF' : '1.5px solid #94A3B8',
                    }}
                    onError={() => setCompanyLogoError(true)}
                  />
                ) : (
                  <Building2
                    size={23}
                    color={isTabActive('/dashboard?tab=profile') ? '#1B4FDF' : '#64748B'}
                    strokeWidth={isTabActive('/dashboard?tab=profile') ? 2.4 : 1.8}
                  />
                )}
              </div>
              <span className="tab-label">Company</span>
            </Link>
          </>
        ) : (
          <>
            {/* 1. Home */}
            <Link
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
            </Link>

            {/* 2. Companies */}
            <Link
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
            </Link>

            {/* 3. Jobs */}
            <Link
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
            </Link>

            {/* 4. Applied */}
            <Link
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
            </Link>

            {/* 5. Profile */}
            <Link
              to={currentUser ? '/dashboard?tab=profile' : '/login'}
              className={`mobile-app-tab-item ${isTabActive('/dashboard?tab=profile') || (currentUser && location.pathname === '/profile') ? 'active' : ''}`}
            >
              {(isTabActive('/dashboard?tab=profile') || (currentUser && location.pathname === '/profile')) && <div className="tab-top-indicator" />}
              <div className="tab-icon-box">
                {currentUser && userPhoto && !profileImgError ? (
                  <img
                    src={userPhoto}
                    alt={currentUser?.name || 'Profile'}
                    referrerPolicy="no-referrer"
                    style={{
                      width: '23px',
                      height: '23px',
                      borderRadius: '50%',
                      objectFit: 'cover',
                      border: (isTabActive('/dashboard?tab=profile') || (currentUser && location.pathname === '/profile'))
                        ? '2px solid #1B4FDF'
                        : '1.5px solid #94A3B8',
                    }}
                    onError={() => setProfileImgError(true)}
                  />
                ) : (
                  <User
                    size={23}
                    color={(isTabActive('/dashboard?tab=profile') || (currentUser && location.pathname === '/profile')) ? '#1B4FDF' : '#64748B'}
                    strokeWidth={(isTabActive('/dashboard?tab=profile') || (currentUser && location.pathname === '/profile')) ? 2.4 : 1.8}
                  />
                )}
              </div>
              <span className="tab-label">Profile</span>
            </Link>
          </>
        )}
      </div>
    </nav>
  );
};

export default MobileBottomNav;
