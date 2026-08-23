import React, { useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { Layout } from './components/Layout/Layout';
import { HomePage } from './features/home/HomePage';
import { LoginPage } from './features/auth/LoginPage';
import { SignupPage } from './features/auth/SignupPage';
import { VerifyOTPPage } from './features/auth/VerifyOTPPage';
import { JobSearchPage } from './features/jobs/JobSearchPage';
import { JobMapPage } from './features/jobs/JobMapPage';
import { JobDetailPage } from './features/jobs/JobDetailPage';
import { JobPostPage } from './features/jobs/JobPostPage';
import { JobApplicantsPage } from './features/jobs/JobApplicantsPage';
import { DashboardPage } from './features/dashboard/DashboardPage';
import { ProfilePage } from './features/profile/ProfilePage';
import { PublicProfilePage } from './features/profile/PublicProfilePage';
import { ResumePage } from './features/profile/ResumePage';
import { AboutPage } from './features/static/AboutPage';
import { ContactPage } from './features/static/ContactPage';
import { CompanyProfilePage } from './features/company/CompanyProfilePage';
import { CompaniesDirectoryPage } from './features/company/CompaniesDirectoryPage';
import { useAuth } from './hooks/useAuth';
import { apiFetch } from './utils/api';
import { useStore } from './store/useStore';

// Admin imports
import { AdminLayout } from './modules/admin/layouts/AdminLayout';
import { AdminLoginPage } from './modules/admin/pages/AdminLoginPage';
import { AdminDashboardPage } from './modules/admin/pages/AdminDashboardPage';
import { JobApprovalPage } from './modules/admin/pages/JobApprovalPage';
import { JobsPage } from './modules/admin/pages/JobsPage';
import { UserManagementPage } from './modules/admin/pages/UserManagementPage';
import { EmployerManagementPage } from './modules/admin/pages/EmployerManagementPage';
import { WorkerManagementPage } from './modules/admin/pages/WorkerManagementPage';
import { CategorySkillManagementPage } from './modules/admin/pages/CategorySkillManagementPage';
import { ReportsPage } from './modules/admin/pages/ReportsPage';
import { SettingsPage } from './modules/admin/pages/SettingsPage';
import { SupportManagementPage } from './modules/admin/pages/SupportManagementPage';
import { AdminAdvertisementPage } from './modules/admin/pages/AdminAdvertisementPage';
import { BroadcastPage } from './modules/admin/pages/BroadcastPage';
import { RoleTabsManagementPage } from './modules/admin/pages/RoleTabsManagementPage';
import { AdminMapAnalyticsPage } from './modules/admin/pages/AdminMapAnalyticsPage';

import { ErrorBoundary } from './components/common/ErrorBoundary';

export const App: React.FC = () => {
  const navigate = useNavigate();
  const { syncUser } = useAuth();
  const { dispatch } = useStore();

  useEffect(() => {
    // Intercept legacy or external hash URLs (e.g. /#/job/:id) and cleanly route to path
    if (window.location.hash && window.location.hash.startsWith('#/')) {
      const cleanPath = window.location.hash.replace(/^#/, '');
      if (cleanPath) {
        navigate(cleanPath, { replace: true });
      }
    }
  }, [navigate]);

  useEffect(() => {
    syncUser();

    // Fetch real jobs from PostgreSQL backend database
    apiFetch('/api/v1/jobs')
      .then((res: any) => {
        if (res.ok) return res.json();
        throw new Error('Failed to fetch database jobs');
      })
      .then((json: any) => {
        const rawJobs = Array.isArray(json) ? json : (json.data || json.jobs || []);
        if (Array.isArray(rawJobs)) {
          dispatch({ type: 'SET_JOBS', payload: rawJobs });
        }
      })
      .catch((err: any) => {
        console.error('Error fetching database jobs:', err);
        dispatch({ type: 'SET_JOBS', payload: [] });
      });
  }, []);

  return (
    <ErrorBoundary>
      <Routes>
        {/* 1. Standalone Auth Pages (Full screen - NO Navbar/Footer) */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/verify-otp" element={<VerifyOTPPage />} />

        {/* 2. Admin Module Routes (Isolated Portal) */}
        <Route path="/admin/login" element={<AdminLoginPage />} />
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<Navigate to="/admin/dashboard" replace />} />
          <Route path="dashboard" element={<AdminDashboardPage />} />
          <Route path="login" element={<Navigate to="/admin/login" replace />} />
          <Route path="job-approvals" element={<JobApprovalPage />} />
          <Route path="advertisements" element={<AdminAdvertisementPage />} />
          <Route path="jobs" element={<JobsPage />} />
          <Route path="users" element={<UserManagementPage />} />
          <Route path="employers" element={<EmployerManagementPage />} />
          <Route path="workers" element={<WorkerManagementPage />} />
          <Route path="categories" element={<CategorySkillManagementPage />} />
          <Route path="role-tabs" element={<RoleTabsManagementPage />} />
          <Route path="reports" element={<ReportsPage />} />
          <Route path="settings" element={<SettingsPage />} />
          <Route path="support" element={<SupportManagementPage />} />
          <Route path="broadcast" element={<BroadcastPage />} />
          <Route path="map-analytics" element={<AdminMapAnalyticsPage />} />
        </Route>

        {/* 3. Public Pages (WITH Navbar/Footer Layout) */}
        <Route element={<Layout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/jobs" element={<JobSearchPage />} />
          <Route path="/jobs/map" element={<JobMapPage />} />
          <Route path="/job/:id" element={<JobDetailPage />} />
          <Route path="/jobs/:id" element={<JobDetailPage />} />
          <Route path="/post-job" element={<JobPostPage />} />
          <Route path="/edit-job/:id" element={<JobPostPage />} />
          <Route path="/job/:id/applicants" element={<JobApplicantsPage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/profile" element={<Navigate to="/dashboard?tab=profile" replace />} />
          <Route path="/profile/:id" element={<PublicProfilePage />} />
          <Route path="/p/:id" element={<PublicProfilePage />} />
          <Route path="/resume" element={<Navigate to="/dashboard?tab=resume" replace />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/companies" element={<CompaniesDirectoryPage />} />
          <Route path="/company/:companyId" element={<CompanyProfilePage />} />
          <Route path="/companies/:companyId" element={<CompanyProfilePage />} />
        </Route>

        {/* 4. Fallback Catch-All */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </ErrorBoundary>
  );
};
