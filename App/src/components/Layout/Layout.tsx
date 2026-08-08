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

  // Site footer is hidden on Job Details (/job/:id), Applicants (/job/:id/applicants), & Map View (/jobs/map) pages
  const hideFooter = location.pathname.startsWith('/job/') || location.pathname === '/jobs/map';

  return (
    <>
      <Navbar />
      <div id="page-content" className="page-enter">
        <Outlet />
      </div>
      {!hideFooter && <Footer />}
      <MobileBottomNav />
    </>
  );
};


