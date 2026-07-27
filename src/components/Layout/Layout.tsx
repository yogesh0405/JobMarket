import React from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import { Navbar } from './Navbar';
import { Footer } from './Footer';
import { MobileBottomNav } from './MobileBottomNav';
import { useAuth } from '../../hooks/useAuth';

export const Layout: React.FC = () => {
  const { currentUser } = useAuth();

  // Industry-Standard Admin Isolation:
  // Admin users are strictly restricted to /admin/* and cannot access public user pages or user dashboards.
  if (currentUser && currentUser.role === 'admin') {
    return <Navigate to="/admin/dashboard" replace />;
  }

  return (
    <>
      <Navbar />
      <div id="page-content" className="page-enter">
        <Outlet />
      </div>
      <Footer />
      <MobileBottomNav />
    </>
  );
};

