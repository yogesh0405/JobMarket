import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/Layout/Layout';
import { HomePage } from './features/home/HomePage';
import { LoginPage } from './features/auth/LoginPage';
import { SignupPage } from './features/auth/SignupPage';
import { VerifyOTPPage } from './features/auth/VerifyOTPPage';
import { JobSearchPage } from './features/jobs/JobSearchPage';
import { JobDetailPage } from './features/jobs/JobDetailPage';
import { JobPostPage } from './features/jobs/JobPostPage';
import { DashboardPage } from './features/dashboard/DashboardPage';
import { ProfilePage } from './features/profile/ProfilePage';
import { ResumePage } from './features/profile/ResumePage';
import { AboutPage } from './features/static/AboutPage';
import { ContactPage } from './features/static/ContactPage';

export const App: React.FC = () => {
  return (
    <Routes>
      {/* Pages WITH Navbar/Footer */}
      <Route element={<Layout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/jobs" element={<JobSearchPage />} />
        <Route path="/job/:id" element={<JobDetailPage />} />
        <Route path="/post-job" element={<JobPostPage />} />
        <Route path="/edit-job/:id" element={<JobPostPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/profile" element={<Navigate to="/dashboard?tab=profile" replace />} />
        <Route path="/resume" element={<Navigate to="/dashboard?tab=resume" replace />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/contact" element={<ContactPage />} />
      </Route>

      {/* Pages WITHOUT Navbar/Footer (Full screen split-screen) */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignupPage />} />
      <Route path="/verify-otp" element={<VerifyOTPPage />} />

      {/* Fallback to Home */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};
