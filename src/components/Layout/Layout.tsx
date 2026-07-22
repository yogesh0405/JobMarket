import React from 'react';
import { Outlet } from 'react-router-dom';
import { Navbar } from './Navbar';
import { Footer } from './Footer';
import { MobileBottomNav } from './MobileBottomNav';

export const Layout: React.FC = () => {
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
