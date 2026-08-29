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
import { JobApplyPage } from './features/jobs/JobApplyPage';
import { JobPostPage } from './features/jobs/JobPostPage';
import { JobApplicantsPage } from './features/jobs/JobApplicantsPage';
import { ApplicantDetailPage } from './features/jobs/ApplicantDetailPage';
import { DashboardPage } from './features/dashboard/DashboardPage';
import { ProfilePage } from './features/profile/ProfilePage';
import { PublicProfilePage } from './features/profile/PublicProfilePage';
import { ResumePage } from './features/profile/ResumePage';
import { AboutPage } from './features/static/AboutPage';
import { ContactPage } from './features/static/ContactPage';
import { TermsPage } from './features/static/TermsPage';
import { PrivacyPage } from './features/static/PrivacyPage';
import { CompanyProfilePage } from './features/company/CompanyProfilePage';
import { CompaniesDirectoryPage } from './features/company/CompaniesDirectoryPage';
import { SecurityPage } from './features/security/SecurityPage';
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

// Route Guard: Prevents Employers from accessing candidate/employee sections (Home, Jobs Search, Map, Job Detail/Apply, Companies Directory)
const CandidateOrGuestOnly: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser } = useAuth();
  const isEmployer = currentUser?.role?.toLowerCase() === 'employer';
  if (isEmployer) {
    return <Navigate to="/dashboard" replace />;
  }
  return <>{children}</>;
};

// Route Guard: Ensures only Employers can access employer actions (Post Job, Edit Job, Job Applicants)
const EmployerOnly: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser } = useAuth();
  const isEmployer = currentUser?.role?.toLowerCase() === 'employer';
  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }
  if (!isEmployer) {
    return <Navigate to="/dashboard" replace />;
  }
  return <>{children}</>;
};

export const App: React.FC = () => {
  const navigate = useNavigate();
  const { currentUser, syncUser, loginWithGoogle } = useAuth();
  const { dispatch } = useStore();

  useEffect(() => {
    // Intercept legacy or external hash URLs (e.g. /#/job/:id) and cleanly route to path
    if (window.location.hash && window.location.hash.startsWith('#/')) {
      const cleanPath = window.location.hash.replace(/^#/, '');
      if (cleanPath) {
        navigate(cleanPath, { replace: true });
      }
    }

    // Intercept Google OAuth access_token returned in hash (#access_token=...)
    if (typeof window !== 'undefined' && window.location.hash && window.location.hash.includes('access_token=')) {
      const hash = window.location.hash.substring(1);
      const params = new URLSearchParams(hash);
      const accessToken = params.get('access_token');
      if (accessToken) {
        window.history.replaceState(null, '', window.location.pathname);
        loginWithGoogle({ accessToken }, 'candidate').then((res) => {
          if (res.success) {
            navigate(res.user?.role === 'admin' ? '/admin/dashboard' : '/dashboard');
          }
        });
      }
    }
  }, [navigate, loginWithGoogle]);

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

  const isEmployer = currentUser?.role?.toLowerCase() === 'employer';

  return (
    <ErrorBoundary>
      <Routes>
        {/* 1. Standalone Fullscreen Pages (NO Navbar/Footer/BottomNav) */}
        <Route path="/auth" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/verify-otp" element={<VerifyOTPPage />} />
        <Route path="/security" element={<SecurityPage />} />
        <Route path="/resume" element={<CandidateOrGuestOnly><ResumePage /></CandidateOrGuestOnly>} />

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

        {/* 3. Main Application Routes (WITH Navbar/Footer Layout) */}
        <Route element={<Layout />}>
          {/* Candidate / Public Only Routes (Employers redirected to /dashboard) */}
          <Route path="/" element={<CandidateOrGuestOnly><HomePage /></CandidateOrGuestOnly>} />
          <Route path="/jobs" element={<CandidateOrGuestOnly><JobSearchPage /></CandidateOrGuestOnly>} />
          <Route path="/jobs/map" element={<CandidateOrGuestOnly><JobMapPage /></CandidateOrGuestOnly>} />
          <Route path="/job/:id" element={<CandidateOrGuestOnly><JobDetailPage /></CandidateOrGuestOnly>} />
          <Route path="/jobs/:id" element={<CandidateOrGuestOnly><JobDetailPage /></CandidateOrGuestOnly>} />
          <Route path="/job/:id/apply" element={<CandidateOrGuestOnly><JobApplyPage /></CandidateOrGuestOnly>} />
          <Route path="/jobs/:id/apply" element={<CandidateOrGuestOnly><JobApplyPage /></CandidateOrGuestOnly>} />
          <Route path="/companies" element={<CandidateOrGuestOnly><CompaniesDirectoryPage /></CandidateOrGuestOnly>} />
          <Route path="/company/:companyId" element={<CandidateOrGuestOnly><CompanyProfilePage /></CandidateOrGuestOnly>} />

          {/* Employer Only Routes */}
          <Route path="/post-job" element={<EmployerOnly><JobPostPage /></EmployerOnly>} />
          <Route path="/edit-job/:id" element={<EmployerOnly><JobPostPage /></EmployerOnly>} />
          <Route path="/job/:id/applicants" element={<EmployerOnly><JobApplicantsPage /></EmployerOnly>} />
          <Route path="/job/:jobId/applicant/:applicantId" element={<EmployerOnly><ApplicantDetailPage /></EmployerOnly>} />
          <Route path="/applicant/:applicantId" element={<EmployerOnly><ApplicantDetailPage /></EmployerOnly>} />

          {/* Shared Workspaces */}
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/profile" element={<Navigate to={isEmployer ? "/dashboard?tab=profile" : "/dashboard?tab=profile"} replace />} />
          <Route path="/profile/:id" element={<PublicProfilePage />} />
          <Route path="/p/:id" element={<PublicProfilePage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/help" element={<ContactPage />} />
          <Route path="/support" element={<ContactPage />} />
          <Route path="/terms" element={<TermsPage />} />
          <Route path="/about/terms" element={<TermsPage />} />
          <Route path="/privacy" element={<PrivacyPage />} />
          <Route path="/about/privacy" element={<PrivacyPage />} />
        </Route>

        {/* 4. Fallback Catch-All */}
        <Route path="*" element={<Navigate to={isEmployer ? "/dashboard" : "/"} replace />} />
      </Routes>
    </ErrorBoundary>
  );
};
