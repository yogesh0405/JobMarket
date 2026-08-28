import React, { useEffect } from 'react';
import { Outlet, Navigate, useLocation } from 'react-router-dom';
import { Navbar } from './Navbar';
import { Footer } from './Footer';
import { MobileBottomNav } from './MobileBottomNav';
import { useAuth } from '../../hooks/useAuth';

export const Layout: React.FC = () => {
  const { currentUser } = useAuth();
  const location = useLocation();

  // Scroll to top of viewport on route change unless hash anchor exists
  useEffect(() => {
    if (!location.hash) {
      window.scrollTo(0, 0);
      document.body.scrollTop = 0;
      document.documentElement.scrollTop = 0;
    }
  }, [location.pathname, location.hash]);

  // Industry-Standard Admin Isolation:
  // Admin users are strictly restricted to /admin/* and cannot access public user pages or user dashboards.
  if (currentUser && currentUser.role === 'admin') {
    return <Navigate to="/admin/dashboard" replace />;
  }

  // Site footer is hidden for Employers, Dashboard, Company, Post-Job, Job Details, Contact/Support, Settings, & Map View pages
  const isEmployer = currentUser?.role === 'employer';
  const isEmployerRoute = location.pathname.startsWith('/dashboard') ||
                          location.pathname.startsWith('/company') ||
                          location.pathname.startsWith('/post-job') ||
                          location.pathname.startsWith('/edit-job') ||
                          location.pathname.startsWith('/employer') ||
                          location.pathname.startsWith('/candidates');

  const hideFooter = isEmployer ||
                     isEmployerRoute ||
                     location.pathname.startsWith('/job/') ||
                     location.pathname.startsWith('/about') ||
                     location.pathname.startsWith('/terms') ||
                     location.pathname.startsWith('/privacy') ||
                     location.pathname.startsWith('/contact') ||
                     location.pathname.startsWith('/support') ||
                     location.pathname.startsWith('/settings') ||
                     location.pathname === '/jobs/map' ||
                     location.search.includes('tab=support') ||
                     location.search.includes('tab=security') ||
                     location.search.includes('tab=profile');

  const isCandidateProfileRoute = location.pathname.startsWith('/profile/') ||
                                  location.pathname.startsWith('/candidate/') ||
                                  location.pathname.startsWith('/p/');

  const isPostJobRoute = location.pathname.startsWith('/post-job') ||
                         location.pathname.startsWith('/edit-job');

  const isJobDetailRoute = (location.pathname.startsWith('/job/') || location.pathname.startsWith('/jobs/')) && location.pathname !== '/jobs' && location.pathname !== '/jobs/map';

  const isCompanyProfileRoute = (location.pathname.startsWith('/company/') || location.pathname.startsWith('/companies/')) && location.pathname !== '/companies';

  const isAboutRoute = location.pathname.startsWith('/about');
  const isContactRoute = location.pathname.startsWith('/contact') || location.pathname.startsWith('/support') || location.pathname.startsWith('/help');

  const hideNavbar = isCandidateProfileRoute || isPostJobRoute || isJobDetailRoute || isCompanyProfileRoute || isAboutRoute || isContactRoute;

  return (
    <>
      {!hideNavbar && <Navbar />}
      <div 
        id="page-content" 
        className={`page-enter ${hideNavbar ? 'no-navbar-padding' : ''}`} 
        style={
          (isPostJobRoute || isContactRoute)
            ? { height: '100dvh', display: 'flex', flexDirection: 'column', overflow: 'hidden', paddingTop: 0 } 
            : hideNavbar 
            ? { paddingTop: 0 } 
            : undefined
        }
      >
        <Outlet />
      </div>
      {!hideFooter && <Footer />}
      {!isAboutRoute && !isContactRoute && !isPostJobRoute && <MobileBottomNav />}
    </>
  );
};


