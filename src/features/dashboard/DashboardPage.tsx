import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useJobs } from '../../hooks/useJobs';
import { apiFetch } from '../../utils/api';
import { getInitials, formatNumber, formatSalary, capitalize, timeAgo, shareContent } from '../../utils/helpers';
import { ResumePreviewModal } from '../../components/profile/ResumePreviewModal';
import { CandidateDetailsModal } from '../../components/candidate/CandidateDetailsModal';
import { useToast } from '../../hooks/useToast';
import { useStore } from '../../store/useStore';
import { useTranslation } from '../../utils/translations';
import { CompanyDefaultLogo } from '../../components/company/CompanyDefaultLogo';
import { JobCard } from '../../components/job/JobCard';
import { Job } from '../../types';
import { ProfilePage } from '../profile/ProfilePage';
import { ResumePage } from '../profile/ResumePage';
import { JobPostPage } from '../jobs/JobPostPage';
import { AboutPage } from '../static/AboutPage';
import { ContactPage } from '../static/ContactPage';
import { SavedJobsPage } from './SavedJobsPage';
import { EmployerAdvertisements } from './EmployerAdvertisements';
import { SecuritySettings } from '../../components/profile/SecuritySettings';
import {
  Briefcase,
  Users,
  Eye,
  FileText,
  Search,
  Megaphone,
  PlusCircle,
  MapPin,
  Clock,
  CheckCircle2,
  AlertTriangle,
  ChevronRight,
  UserCheck,
  TrendingUp,
  Sparkles,
  Award,
  Layers,
  ArrowRight,
  ClipboardList
} from 'lucide-react';

export const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { currentUser, updateUser, syncUser } = useAuth();
  const { getAppliedJobs, getSavedJobs, getJobsByEmployer, deleteJob, updateApplicantStatus, fetchEmployerJobs } = useJobs();
  const { showToast } = useToast();
  const { state } = useStore();
  const t = useTranslation(state.language);

  const [editModalOpen, setEditModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [headline, setHeadline] = useState('');
  const [location, setLocation] = useState('');
  const [phone, setPhone] = useState('');
  const [tradeSpecialization, setTradeSpecialization] = useState('');
  const [preferredShift, setPreferredShift] = useState('');
  const [requiresBus, setRequiresBus] = useState(false);
  const [requiresAccommodation, setRequiresAccommodation] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [companyName, setCompanyName] = useState('');
  const [gstNumber, setGstNumber] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const rawTab = searchParams.get('tab') || 'overview';
  const tab = rawTab === 'candidate' ? 'candidates' : rawTab;

  const [isLoading, setIsLoading] = useState(!currentUser);

  useEffect(() => {
    if (!currentUser) {
      showToast('Please log in to access the dashboard', 'warning');
      navigate('/login');
    }
  }, [currentUser, navigate, showToast]);

  useEffect(() => {
    let isMounted = true;
    const loadDashboardData = async () => {
      try {
        await syncUser();
        if (fetchEmployerJobs) {
          await fetchEmployerJobs();
        }
      } catch (err) {
        console.error('Error syncing dashboard data:', err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };
    loadDashboardData();
    return () => { isMounted = false; };
  }, []);

  useEffect(() => {
    if (currentUser && (currentUser.role === 'employer' || currentUser.role === 'admin' || currentUser.role === 'recruiter') && fetchEmployerJobs) {
      fetchEmployerJobs();
    }
  }, [currentUser?.id, currentUser?.role]);

  if (!currentUser || isLoading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '65vh', gap: '16px', padding: '32px' }}>
        <div style={{ position: 'relative', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ width: '56px', height: '56px', borderRadius: '50%', border: '4px solid #cbd5e1', borderTopColor: '#344BFD', animation: 'spin 0.8s linear infinite' }}></div>
          <div style={{ position: 'absolute', width: '28px', height: '28px', borderRadius: '50%', background: '#eff6ff', border: '1px solid #bfdbfe', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: '800', color: '#344BFD' }}>JM</div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <h3 style={{ margin: '0 0 4px', fontSize: '16px', fontWeight: '800', color: '#0f172a' }}>Loading Dashboard Data...</h3>
          <p style={{ margin: 0, fontSize: '12.5px', color: '#64748b', fontWeight: '600' }}>Preparing profile details, applications and candidate listings</p>
        </div>
      </div>
    );
  }

  if (tab === 'saved') {
    return <SavedJobsPage />;
  }

  const setTab = (newTab: string) => {
    setSearchParams({ tab: newTab });
  };

  const handleEdit = () => {
    setName(currentUser.name);
    setHeadline(currentUser.headline || '');
    setLocation(currentUser.location || '');
    setPhone(currentUser.phone || '');
    setTradeSpecialization(currentUser.tradeSpecialization || '');
    setPreferredShift(currentUser.preferredShift || '');
    setRequiresBus(!!currentUser.requiresBus);
    setRequiresAccommodation(!!currentUser.requiresAccommodation);
    setCompanyName(currentUser.companyName || '');
    setGstNumber(currentUser.gstNumber || '');
    setEditModalOpen(true);
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.origin + '/#/profile/' + currentUser.id);
    showToast('Profile link copied to clipboard!', 'success');
  };

  const convertToWebP = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const max_size = 500;
          let width = img.width;
          let height = img.height;
          if (width > height) {
            if (width > max_size) {
              height *= max_size / width;
              width = max_size;
            }
          } else {
            if (height > max_size) {
              width *= max_size / height;
              height = max_size;
            }
          }
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, width, height);
          const dataUrl = canvas.toDataURL('image/webp', 0.8);
          resolve(dataUrl);
        };
        img.onerror = () => reject(new Error('Failed to load image'));
        img.src = event.target?.result as string;
      };
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsDataURL(file);
    });
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    if (!file.type.startsWith('image/')) {
      showToast('Please select an image file', 'error');
      return;
    }

    setIsUploading(true);
    try {
      const webpBase64 = await convertToWebP(file);
      const response = await apiFetch('/api/v1/auth/profile/picture', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image: webpBase64 })
      });

      const data = await response.json();
      if (!response.ok) {
        showToast(data.error || 'Failed to upload photo', 'error');
        return;
      }

      await syncUser();
      showToast('Photo uploaded successfully', 'success');
    } catch (err: any) {
      showToast(err.message || 'Failed to upload photo', 'error');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      showToast('Name is required', 'error');
      return;
    }
    if (currentUser.role === 'employer' && !companyName.trim()) {
      showToast('Company name is required', 'error');
      return;
    }
    if (phone && phone.length !== 10) {
      showToast('Phone number must be exactly 10 digits', 'error');
      return;
    }
    setIsSaving(true);
    try {
      const result = await updateUser({
        name,
        headline,
        location,
        phone,
        tradeSpecialization,
        preferredShift,
        requiresBus,
        requiresAccommodation,
        companyName,
        gstNumber
      });

      if (result.success) {
        showToast('Changes saved', 'success');
        setEditModalOpen(false);
      } else {
        showToast(result.error || 'Failed to update profile.', 'error');
      }
    } catch (err) {
      showToast('An error occurred. Please try again.', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const tradesList = ['Fitter', 'Welder', 'CNC Operator', 'Electrician', 'Machinist', 'Helper', 'Quality Inspector'];

  const isEmployer = currentUser.role === 'employer';

  return (
    <>
      <div className="dashboard-page">
      <div className="container">
        <div className={`dashboard-layout ${['applied', 'applicants', 'candidates', 'manage', 'advertisements', 'banners', 'promotions', 'post-job', 'overview', 'security', 'about', 'support', 'saved', 'profile', 'resume'].includes(tab) ? 'hide-sidebar-mobile candidates-tab-active' : ''}`}>
          {/* Sidebar */}
          <aside className="dashboard-sidebar">
            <div className="dashboard-profile">
              <div className="dashboard-banner">
                <div className="banner-actions">
                  <button className="banner-btn" onClick={(e) => { e.preventDefault(); handleShare(); }} title="Share Profile">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/>
                      <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
                    </svg>
                  </button>
                  <button className="banner-btn" onClick={(e) => { e.preventDefault(); handleEdit(); }} title="Edit Profile">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                    </svg>
                  </button>
                </div>
              </div>
              
              <div className="dashboard-profile-body">
                <div className="dashboard-profile-header">
                  <div className="dashboard-avatar" style={{ overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {currentUser.profilePictureUrl ? (
                      <img src={currentUser.profilePictureUrl} alt={currentUser.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      getInitials(currentUser.companyName || currentUser.name)
                    )}
                  </div>
                  <div className="dashboard-profile-title">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <h3>{currentUser.companyName || currentUser.name}</h3>
                      {(isEmployer || currentUser.aadhaarVerified) && (
                        <svg viewBox="0 0 24 24" fill="currentColor" className="verified-badge">
                          <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                        </svg>
                      )}
                    </div>
                    <p className="profile-handle">@{ (currentUser.companyName || currentUser.name).toLowerCase().replace(/\s+/g, '') }</p>
                  </div>
                </div>

                <p className="profile-description">
                  {isEmployer ? 'Verified Recruiter on JobMarket' : (currentUser.headline || 'Job Seeker')} • {currentUser.location || 'Pune, Maharashtra'}
                </p>

                <div className="profile-meta-grid">
                  <div className="meta-item">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
                    </svg>
                    <span>{currentUser.location || 'Pune, MH'}</span>
                  </div>
                  <div className="meta-item">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
                    </svg>
                    <a href={`mailto:${currentUser.email}`} onClick={(e) => e.stopPropagation()}>{currentUser.email}</a>
                  </div>
                  <div className="meta-item">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/>
                    </svg>
                    <span>Specialty: {isEmployer ? 'Hiring' : (currentUser.tradeSpecialization || 'ITI Welder')}</span>
                  </div>
                  <div className="meta-item">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
                    </svg>
                    <span>Joined: {new Date(currentUser.createdAt).getFullYear()}</span>
                  </div>
                </div>
              </div>
            </div>
            
            <nav className="dashboard-nav">
              <button
                className={`dashboard-nav-item tab-overview ${tab === 'overview' ? 'active' : ''}`}
                onClick={() => setTab('overview')}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: 18, height: 18 }}>
                  <rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/>
                  <rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>
                </svg>
                <span className="desktop-only-text">Overview</span>
                <span className="mobile-only-text">Dashboard</span>
              </button>

              {isEmployer && (
                <>
                  <button
                    className={`dashboard-nav-item tab-manage ${tab === 'manage' ? 'active' : ''}`}
                    onClick={() => setTab('manage')}
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: 18, height: 18 }}>
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/>
                    </svg>
                    Manage Jobs
                    <span className="nav-badge">{getJobsByEmployer(currentUser.id).length}</span>
                  </button>
                  <button
                    className={`dashboard-nav-item tab-applicants ${tab === 'applicants' ? 'active' : ''}`}
                    onClick={() => setTab('applicants')}
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: 18, height: 18 }}>
                      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
                      <path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                    </svg>
                    Applicants
                    <span className="nav-badge">
                      {getJobsByEmployer(currentUser.id).reduce((sum, j) => sum + (j.applicants?.length || 0), 0)}
                    </span>
                  </button>
                  <button
                    className={`dashboard-nav-item tab-candidates ${tab === 'candidates' ? 'active' : ''}`}
                    onClick={() => setTab('candidates')}
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: 18, height: 18 }}>
                      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
                      <path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                    </svg>
                    Browse Candidates
                  </button>
                  <button
                    className={`dashboard-nav-item tab-advertisements ${tab === 'advertisements' ? 'active' : ''}`}
                    onClick={() => setTab('advertisements')}
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: 18, height: 18 }}>
                      <rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>
                    </svg>
                    <span className="desktop-only-text">Promotional Banners</span>
                    <span className="mobile-only-text">Banners</span>
                  </button>
                  <div style={{ height: 1, background: 'var(--border)', margin: 'var(--space-2) 0' }}></div>
                  <button
                    className={`dashboard-nav-item tab-post-job ${tab === 'post-job' ? 'active' : ''}`}
                    onClick={() => setTab('post-job')}
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: 18, height: 18 }}>
                      <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/>
                    </svg>
                    Post New Job
                  </button>
                </>
              )}

              {!isEmployer && (
                <>
                  <button
                    className={`dashboard-nav-item tab-profile ${tab === 'profile' ? 'active' : ''}`}
                    onClick={() => setTab('profile')}
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: 18, height: 18 }}>
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
                    </svg>
                    <span className="desktop-only-text">My Profile</span>
                    <span className="mobile-only-text">About</span>
                  </button>
                  <button
                    className={`dashboard-nav-item tab-saved ${tab === 'saved' ? 'active' : ''}`}
                    onClick={() => setTab('saved')}
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: 18, height: 18 }}>
                      <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>
                    </svg>
                    <span className="desktop-only-text">Saved Jobs</span>
                    <span className="mobile-only-text">Jobs Saved</span>
                    <span className="nav-badge">{(currentUser.savedJobs || []).length}</span>
                  </button>
                  <button
                    className={`dashboard-nav-item tab-applied ${tab === 'applied' ? 'active' : ''}`}
                    onClick={() => setTab('applied')}
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: 18, height: 18 }}>
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/>
                    </svg>
                    Applied Jobs
                    <span className="nav-badge">{(currentUser.appliedJobs || []).length}</span>
                  </button>
                  <div style={{ height: 1, background: 'var(--border)', margin: 'var(--space-2) 0' }}></div>
                  <button
                    className={`dashboard-nav-item tab-resume ${tab === 'resume' ? 'active' : ''}`}
                    onClick={() => setTab('resume')}
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: 18, height: 18 }}>
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>
                    </svg>
                    {currentUser.resume && (currentUser.resume.name || currentUser.resume.url) ? t.myResume : t.uploadResume}
                  </button>
                </>
              )}
              <div style={{ height: 1, background: 'var(--border)', margin: 'var(--space-2) 0' }}></div>
              <button
                className={`dashboard-nav-item tab-security ${tab === 'security' ? 'active' : ''}`}
                onClick={() => setTab('security')}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: 18, height: 18 }}>
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
                Security & Sessions
              </button>
              <button
                className={`dashboard-nav-item tab-about ${tab === 'about' ? 'active' : ''}`}
                onClick={() => setTab('about')}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: 18, height: 18 }}>
                  <circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/>
                </svg>
                About Us
              </button>
              <button
                className={`dashboard-nav-item tab-support ${tab === 'support' ? 'active' : ''}`}
                onClick={() => setTab('support')}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: 18, height: 18 }}>
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                </svg>
                Help & Support
              </button>
            </nav>
          </aside>

          {/* Main Dashboard Content */}
          <main className="dashboard-main">
            {tab === 'security' ? (
              <SecuritySettings />
            ) : tab === 'about' ? (
              <AboutPage />
            ) : tab === 'support' ? (
              <ContactPage />
            ) : tab === 'saved' && isEmployer ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <h2 style={{ fontSize: '20px', fontWeight: '800', margin: 0, color: 'var(--text-primary)' }}>Saved Jobs</h2>
                    <p style={{ margin: '4px 0 0', color: 'var(--text-secondary)', fontSize: '13px' }}>Jobs bookmarked for quick reference</p>
                  </div>
                  <span className="badge badge-primary" style={{ padding: '6px 12px', borderRadius: '9999px', fontWeight: '700' }}>
                    {getSavedJobs().length} Saved
                  </span>
                </div>
                {getSavedJobs().length > 0 ? (
                  <div className="jobs-list" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '16px' }}>
                    {getSavedJobs().map(job => <JobCard key={job.id} job={job} />)}
                  </div>
                ) : (
                  <div className="empty-state" style={{ background: 'var(--surface)', padding: '40px 20px', borderRadius: '12px', textAlign: 'center', border: '1px solid var(--border)' }}>
                    <div className="empty-state-icon" style={{ width: '56px', height: '56px', borderRadius: '50%', background: 'var(--bg-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px auto', color: 'var(--primary)' }}>
                      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>
                      </svg>
                    </div>
                    <h3 style={{ margin: '0 0 8px 0', fontSize: '18px', fontWeight: '700' }}>No Saved Jobs</h3>
                    <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '14px' }}>Click the bookmark icon on any job card to save it for quick reference.</p>
                    <button onClick={() => navigate('/jobs')} className="btn btn-primary" style={{ marginTop: '16px' }}>Browse Jobs</button>
                  </div>
                )}
              </div>
            ) : isEmployer ? (
              <EmployerDashboard tab={tab} currentUser={currentUser} getJobsByEmployer={getJobsByEmployer} deleteJob={deleteJob} updateApplicantStatus={updateApplicantStatus} showToast={showToast} navigate={navigate} setTab={setTab} t={t} />
            ) : (
              <CandidateDashboard tab={tab} currentUser={currentUser} getAppliedJobs={getAppliedJobs} getSavedJobs={getSavedJobs} setTab={setTab} t={t} />
            )}
          </main>
        </div>
      </div>
    </div>
      {editModalOpen && createPortal(
        <div className="modal-backdrop" onClick={() => setEditModalOpen(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">Edit Profile</h3>
              <button className="modal-close" onClick={() => setEditModalOpen(false)}>✕</button>
            </div>
            <div className="modal-body">
              <form id="edit-profile-form" onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
                {/* Image Upload section */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', marginBottom: 'var(--space-3)' }}>
                  <div 
                    style={{ 
                      width: '80px', 
                      height: '80px', 
                      borderRadius: '50%', 
                      background: 'var(--gradient-accent)', 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center', 
                      position: 'relative', 
                      cursor: 'pointer',
                      overflow: 'hidden'
                    }}
                    onClick={() => fileInputRef.current?.click()}
                  >
                    {currentUser.profilePictureUrl ? (
                      <img src={currentUser.profilePictureUrl} alt={currentUser.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ color: 'white' }}>
                        <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
                        <circle cx="12" cy="13" r="4"/>
                      </svg>
                    )}
                    {isUploading && (
                      <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <svg className="animate-spin" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" style={{ animation: 'spin 1s linear infinite' }}>
                          <circle cx="12" cy="12" r="10" stroke="rgba(255,255,255,0.2)"/>
                          <path d="M4 12a8 8 0 0 1 8-8" strokeLinecap="round"/>
                        </svg>
                      </div>
                    )}
                  </div>
                  <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Click to upload profile photo</span>
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    onChange={handleFileChange} 
                    accept="image/*" 
                    style={{ display: 'none' }} 
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">{currentUser.role === 'employer' ? 'Contact Person / Full Name' : 'Full Name'}</label>
                  <input
                    type="text"
                    className="form-input"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>

                {currentUser.role === 'employer' && (
                  <>
                    <div className="form-group">
                      <label className="form-label">Company Name</label>
                      <input
                        type="text"
                        className="form-input"
                        value={companyName}
                        onChange={(e) => setCompanyName(e.target.value)}
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">GST Number (Optional)</label>
                      <input
                        type="text"
                        className="form-input"
                        value={gstNumber}
                        maxLength={15}
                        placeholder="15-digit GSTIN"
                        onChange={(e) => setGstNumber(e.target.value.toUpperCase())}
                      />
                    </div>
                  </>
                )}
                <div className="form-group">
                  <label className="form-label">Headline</label>
                  <input
                    type="text"
                    className="form-input"
                    value={headline}
                    placeholder="e.g. ITI Welder Apprentice"
                    onChange={(e) => setHeadline(e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Location</label>
                  <input
                    type="text"
                    className="form-input"
                    value={location}
                    placeholder="e.g. Chakan MIDC, Pune"
                    onChange={(e) => setLocation(e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Phone</label>
                  <input
                    type="tel"
                    className="form-input"
                    maxLength={10}
                    placeholder="10-digit mobile number"
                    value={phone}
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, '');
                      if (val.length <= 10) setPhone(val);
                    }}
                  />
                </div>

                {currentUser.role === 'candidate' && (
                  <>
                    <div className="form-group">
                      <label className="form-label">Trade Specialty</label>
                      <select className="form-select" value={tradeSpecialization} onChange={(e) => setTradeSpecialization(e.target.value)}>
                        <option value="">Select Specialty</option>
                        {tradesList.map(t => <option key={t} value={t}>{t}</option>)}
                      </select>
                    </div>

                    <div className="form-group">
                      <label className="form-label">Preferred Shift</label>
                      <select className="form-select" value={preferredShift} onChange={(e) => setPreferredShift(e.target.value)}>
                        <option value="">Any Shift</option>
                        <option value="Day Shift (8 AM - 5 PM)">Day Shift (8 AM - 5 PM)</option>
                        <option value="Night Shift (8 PM - 5 AM)">Night Shift (8 PM - 5 AM)</option>
                        <option value="Rotational (Shift A / B)">Rotational (Shift A / B)</option>
                      </select>
                    </div>

                    <div className="grid grid-2" style={{ gap: 'var(--space-4)', margin: 'var(--space-2) 0' }}>
                      <label className="form-checkbox" style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: 'var(--fs-xs)', color: 'var(--text-secondary)' }}>
                        <input type="checkbox" checked={requiresBus} onChange={(e) => setRequiresBus(e.target.checked)} />
                        Requires Bus Transport
                      </label>
                      <label className="form-checkbox" style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: 'var(--fs-xs)', color: 'var(--text-secondary)' }}>
                        <input type="checkbox" checked={requiresAccommodation} onChange={(e) => setRequiresAccommodation(e.target.checked)} />
                        Requires Hostel Stay
                      </label>
                    </div>
                  </>
                )}

                <button type="submit" className="btn btn-primary" style={{ marginTop: 'var(--space-2)' }} disabled={isSaving}>
                  {isSaving ? (
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                      <svg className="animate-spin" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" style={{ animation: 'spin 1s linear infinite' }}>
                        <circle cx="12" cy="12" r="10" stroke="rgba(255,255,255,0.2)"/>
                        <path d="M4 12a8 8 0 0 1 8-8" strokeLinecap="round"/>
                      </svg>
                      Saving...
                    </span>
                  ) : 'Save Changes'}
                </button>
              </form>
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  );
};

// --- CANDIDATE VIEW ---
interface CandidateProps {
  tab: string;
  currentUser: any;
  getAppliedJobs: () => Job[];
  getSavedJobs: () => Job[];
  setTab: (tab: string) => void;
  t: any;
}

const CandidateDashboard: React.FC<CandidateProps> = ({ tab, currentUser, getAppliedJobs, getSavedJobs, setTab, t }) => {
  const appliedJobs = getAppliedJobs();
  const savedJobs = getSavedJobs();

  switch (tab) {
    case 'overview':
      return (
        <>


          <div className="dashboard-stats">
            <div className="stat-card">
              <div className="stat-icon primary">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/>
                </svg>
              </div>
              <div className="stat-info"><h3>{appliedJobs.length}</h3><p>Jobs Applied</p></div>
            </div>
            <div className="stat-card">
              <div className="stat-icon accent">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>
                </svg>
              </div>
              <div className="stat-info"><h3>{savedJobs.length}</h3><p>Saved Jobs</p></div>
            </div>
            <div className="stat-card">
              <div className="stat-icon success">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
                </svg>
              </div>
              <div className="stat-info"><h3>{currentUser.profileViews || (currentUser.viewedBy ? currentUser.viewedBy.length : 0)}</h3><p>Profile Views</p></div>
            </div>
            <div className="stat-card">
              <div className="stat-icon warning">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
                </svg>
              </div>
              <div className="stat-info"><h3>{(currentUser.skills || []).length}</h3><p>Skills / Trades</p></div>
            </div>
          </div>

          <div className="activity-card">
            <div className="activity-header">
              <h3>Recent Applications</h3>
              <button className="btn btn-ghost btn-sm" onClick={() => setTab('applied')}>View All</button>
            </div>
            {appliedJobs.length > 0 ? (
              <div style={{ overflowX: 'auto', width: '100%' }}>
                <table className="activity-table">
                  <thead>
                    <tr><th>Job Title</th><th>Company</th><th>Applied</th><th>Status</th></tr>
                  </thead>
                  <tbody>
                    {appliedJobs.slice(0, 5).map(job => {
                      const app = (job.applicants || []).find(a => a.userId === currentUser.id);
                      return (
                        <tr key={job.id}>
                          <td>
                            <Link to={`/job/${job.id}`} className="table-job-title">{job.title}</Link>
                          </td>
                          <td>{job.company}</td>
                          <td>{app ? timeAgo(app.appliedAt) : 'N/A'}</td>
                          <td>
                            <span className={`status-badge status-${app?.status || 'applied'}`}>
                              {capitalize(app?.status || 'applied')}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="empty-state" style={{ padding: 'var(--space-8)' }}>
                <p>No applications yet. <Link to="/jobs">Start applying!</Link></p>
              </div>
            )}
          </div>
        </>
      );

    case 'applied':
      return (
        <>
          <div style={{ marginBottom: '24px' }}>
            <h2 style={{ fontSize: '24px', fontWeight: '800', color: '#0f172a', margin: 0, letterSpacing: '-0.5px' }}>Applied Jobs</h2>
            <p style={{ color: '#64748b', fontSize: '14px', marginTop: '4px', margin: '4px 0 0 0' }}>Track your application progress and scheduled interviews in real time</p>
          </div>

          {appliedJobs.length > 0 ? (
            <div className="jobs-list" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {appliedJobs.map(job => {
                const appDetails = currentUser.appliedJobsWithStatus?.find((a: any) => a.jobId === job.id);
                const status = (appDetails?.status || 'applied').toLowerCase();
                
                let badgeBg = '#eff6ff';
                let badgeColor = '#1d4ed8';
                let badgeBorder = '#bfdbfe';
                
                if (status === 'shortlisted' || status === 'accepted') {
                  badgeBg = '#dcfce7';
                  badgeColor = '#15803d';
                  badgeBorder = '#86efac';
                } else if (status === 'rejected') {
                  badgeBg = '#fee2e2';
                  badgeColor = '#b91c1c';
                  badgeBorder = '#fca5a5';
                }

                return (
                  <div key={job.id} style={{ 
                    background: '#ffffff', 
                    border: '1px solid #cbd5e1', 
                    borderRadius: '8px', 
                    padding: '20px 24px', 
                    display: 'flex', 
                    flexDirection: 'column', 
                    gap: '16px',
                    boxShadow: '0 4px 14px rgba(15, 23, 42, 0.05)',
                    transition: 'all 0.2s ease',
                    position: 'relative'
                  }}>
                    {/* Top Header Row: Full Width Title */}
                    <div style={{ marginBottom: '8px' }}>
                      <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '800', color: '#0f172a', letterSpacing: '-0.3px', lineHeight: '1.35' }}>{job.title}</h3>
                    </div>

                    {/* Specs Row: Location, WorkMode, Salary */}
                    <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap', margin: '4px 0 10px 0', fontSize: '13.5px', color: '#475569' }}>
                      <span style={{ fontWeight: '500', display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ color: '#344BFD' }}>
                          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
                        </svg>
                        {job.location} ({job.workMode || 'On-site'})
                      </span>
                      {job.salaryMax > 0 && (
                        <>
                          <span style={{ color: '#cbd5e1' }}>•</span>
                          <span style={{ fontSize: '13px', color: '#15803d', fontWeight: '700', background: '#f0fdf4', padding: '2px 8px', borderRadius: '4px', border: '1px solid #bbf7d0', display: 'inline-flex', alignItems: 'center' }}>
                            ₹{formatSalary(job.salaryMin, job.salaryMax)}
                          </span>
                        </>
                      )}
                    </div>

                    {/* Company Row: Small Logo + Company Name */}
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      padding: '8px 12px',
                      background: '#F8FAFC',
                      borderRadius: '6px',
                      border: '1px solid #F1F5F9',
                      margin: '0 0 12px 0'
                    }}>
                      <CompanyDefaultLogo 
                        logoUrl={job.companyLogo || (job as any).company_logo} 
                        companyName={job.company} 
                        size={26} 
                        borderRadius="6px"
                      />
                      <span style={{ fontSize: '13.5px', color: '#1E293B', fontWeight: '600' }}>
                        {job.company}
                      </span>
                    </div>

                      {/* Status Badge */}
                      {appDetails && (
                        <span style={{ 
                          background: badgeBg, 
                          color: badgeColor, 
                          border: `1px solid ${badgeBorder}`, 
                          fontSize: '11px', 
                          fontWeight: '800', 
                          padding: '4px 10px', 
                          borderRadius: '4px',
                          letterSpacing: '0.6px',
                          textTransform: 'uppercase'
                        }}>
                          {capitalize(appDetails.status)}
                        </span>
                      )}

                    {/* Interview Details Card */}
                    {appDetails && appDetails.status === 'shortlisted' && appDetails.interviewDate && (
                      <div style={{ 
                        background: '#f8fafc', 
                        border: '1px solid #cbd5e1', 
                        borderRadius: '6px', 
                        padding: '16px',
                        fontSize: '14px',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '12px'
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#1e40af', fontWeight: '800', fontSize: '14px' }}>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
                            </svg>
                            <span>Interview Scheduled</span>
                          </div>
                          <span style={{ fontSize: '11px', color: '#1e40af', background: '#e0e7ff', padding: '2px 8px', borderRadius: '4px', fontWeight: '700', border: '1px solid #c7d2fe' }}>
                            Action Required
                          </span>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px', background: '#ffffff', borderRadius: '6px', padding: '12px 14px', border: '1px solid #e2e8f0' }}>
                          <div>
                            <span style={{ fontSize: '11px', color: '#64748b', fontWeight: '700', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '3px' }}>
                              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                              Date
                            </span>
                            <strong style={{ color: '#0f172a', fontSize: '13.5px' }}>{appDetails.interviewDate}</strong>
                          </div>
                          <div>
                            <span style={{ fontSize: '11px', color: '#64748b', fontWeight: '700', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '3px' }}>
                              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                              Time
                            </span>
                            <strong style={{ color: '#0f172a', fontSize: '13.5px' }}>{appDetails.interviewTime}</strong>
                          </div>
                          <div style={{ gridColumn: '1 / -1' }}>
                            <span style={{ fontSize: '11px', color: '#64748b', fontWeight: '700', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '3px' }}>
                              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                              Venue / Plant Address
                            </span>
                            <strong style={{ color: '#0f172a', fontSize: '13.5px' }}>{appDetails.venueAddress}</strong>
                          </div>
                        </div>

                        {appDetails.mapsLink && (
                          <div>
                            <a 
                              href={appDetails.mapsLink} 
                              target="_blank" 
                              rel="noreferrer" 
                              style={{ 
                                background: '#2563eb', 
                                color: '#ffffff', 
                                textDecoration: 'none', 
                                fontWeight: '700',
                                fontSize: '12.5px',
                                padding: '7px 14px',
                                borderRadius: '4px',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '6px'
                              }}
                            >
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                                <path d="M12 2a8 8 0 0 0-8 8c0 5.25 8 12 8 12s8-6.75 8-12a8 8 0 0 0-8-8z"/><circle cx="12" cy="10" r="3"/>
                              </svg>
                              Open Directions in Google Maps
                            </a>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Footer Row */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #f1f5f9', paddingTop: '14px', marginTop: '2px' }}>
                      <span style={{ fontSize: '12px', color: '#64748b', fontWeight: '500' }}>
                        Applied on {new Date(job.postedAt || Date.now()).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </span>
                      <Link to={`/job/${job.id}`} className="btn btn-secondary btn-sm" style={{ padding: '6px 14px', fontSize: '12.5px', fontWeight: '700', borderRadius: '4px', background: '#f8fafc', border: '1px solid #cbd5e1', color: '#344BFD', textDecoration: 'none' }}>
                        View Job Details →
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="empty-state">
              <div className="empty-state-icon">
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="2">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                </svg>
              </div>
              <h3>No applications yet</h3>
              <p>Start browsing jobs and apply to your dream positions!</p>
              <Link to="/jobs" className="btn btn-primary mt-4">Browse Jobs</Link>
            </div>
          )}
        </>
      );

    case 'saved':
      return (
        <>
          <h2 style={{ fontSize: 'var(--fs-2xl)', marginBottom: 'var(--space-6)' }}>Saved Jobs</h2>
          {savedJobs.length > 0 ? (
            <div className="jobs-list">
              {savedJobs.map(job => <JobCard key={job.id} job={job} />)}
            </div>
          ) : (
            <div className="empty-state">
              <div className="empty-state-icon">
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="2">
                  <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>
                </svg>
              </div>
              <h3>No saved jobs</h3>
              <p>Save jobs you're interested in to review later.</p>
              <Link to="/jobs" className="btn btn-primary mt-4">Browse Jobs</Link>
            </div>
          )}
        </>
      );

    case 'profile':
      return <ProfilePage />;

    case 'resume':
      return <ResumePage />;

    default:
      return null;
  }
};

const CandidatesTab: React.FC<{
  showToast: any;
  handleOpenDetails: (applicant: any, jobId: string, jobTitle: string) => void;
}> = ({ showToast, handleOpenDetails }) => {
  const { getAllCandidates } = useJobs();
  const [candidates, setCandidates] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedTrade, setSelectedTrade] = useState<string>('');
  const [selectedLocation, setSelectedLocation] = useState<string>('');

  useEffect(() => {
    let isMounted = true;
    const loadCandidates = async () => {
      try {
        setLoading(true);
        const data = await getAllCandidates();
        if (isMounted) {
          setCandidates(data || []);
        }
      } catch (err: any) {
        console.error('Failed to load candidates:', err);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };
    loadCandidates();
    return () => {
      isMounted = false;
    };
  }, []);

  const filteredCandidates = (candidates || []).filter(c => {
    if (!c) return false;
    if (c.isResumePublic === false) return false;

    const skillsList: string[] = Array.isArray(c.skills)
      ? c.skills
      : typeof c.skills === 'string'
      ? c.skills.split(',').map((s: string) => s.trim()).filter(Boolean)
      : [];

    const matchesSearch = searchQuery === '' || 
      (c.name && String(c.name).toLowerCase().includes(searchQuery.toLowerCase())) ||
      (c.headline && String(c.headline).toLowerCase().includes(searchQuery.toLowerCase())) ||
      skillsList.some((s: string) => String(s).toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesTrade = selectedTrade === '' || c.tradeSpecialization === selectedTrade;
    const matchesLocation = selectedLocation === '' || (c.location && String(c.location).toLowerCase().includes(selectedLocation.toLowerCase()));

    return matchesSearch && matchesTrade && matchesLocation;
  });

  const uniqueTrades = Array.from(new Set((candidates || []).map(c => c?.tradeSpecialization).filter(Boolean)));
  const uniqueLocations = Array.from(new Set((candidates || []).map(c => c?.location).filter(Boolean)));

  return (
    <div style={{ width: '100%', boxSizing: 'border-box' }}>
      <div style={{ marginBottom: '14px' }}>
        <h2 style={{ fontSize: '18px', margin: 0, fontWeight: '800', color: '#0f172a' }}>Browse Candidates</h2>
        <p style={{ color: '#64748b', fontSize: '12px', margin: '2px 0 0', fontWeight: '500' }}>
          Discover verified factory workers, ITI technicians, and industrial specialists.
        </p>
      </div>

      {/* Filter Card */}
      <div style={{ 
        background: '#ffffff', 
        padding: '12px', 
        borderRadius: '6px', 
        border: '1.5px solid #cbd5e1', 
        marginBottom: '16px',
        boxShadow: '0 4px 12px rgba(15, 23, 42, 0.08), 0 1px 3px rgba(15, 23, 42, 0.05)',
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
        width: '100%',
        boxSizing: 'border-box'
      }}>
        <div style={{ position: 'relative', width: '100%' }}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2.2" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}>
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input 
            type="text" 
            placeholder="Search by worker name, role, skills..."
            className="form-input"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ width: '100%', paddingLeft: '34px', fontSize: '13px', height: '38px', borderRadius: '4px' }}
          />
          {searchQuery && (
            <button 
              type="button" 
              onClick={() => setSearchQuery('')}
              style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', fontSize: '14px', padding: '2px' }}
            >
              ✕
            </button>
          )}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', width: '100%', boxSizing: 'border-box' }}>
          <select 
            className="form-select"
            value={selectedTrade}
            onChange={(e) => setSelectedTrade(e.target.value)}
            style={{ width: '100%', fontSize: '12px', height: '36px', borderRadius: '4px' }}
          >
            <option value="">All Specializations</option>
            {uniqueTrades.map(trade => (
              <option key={trade} value={trade}>{trade}</option>
            ))}
          </select>

          <select 
            className="form-select"
            value={selectedLocation}
            onChange={(e) => setSelectedLocation(e.target.value)}
            style={{ width: '100%', fontSize: '12px', height: '36px', borderRadius: '4px' }}
          >
            <option value="">All Locations</option>
            {uniqueLocations.map(loc => (
              <option key={loc} value={loc}>{loc}</option>
            ))}
          </select>
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '48px 16px', background: '#ffffff', borderRadius: '6px', border: '1.5px solid #cbd5e1', boxShadow: '0 4px 12px rgba(15, 23, 42, 0.06)' }}>
          <div style={{ position: 'relative', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: '12px' }}>
            <div style={{ width: '42px', height: '42px', borderRadius: '50%', border: '3.5px solid #cbd5e1', borderTopColor: '#344BFD', animation: 'spin 0.8s linear infinite' }}></div>
          </div>
          <h4 style={{ margin: '0 0 4px', fontSize: '15px', fontWeight: '800', color: '#0f172a' }}>Loading Candidate Profiles...</h4>
          <p style={{ margin: 0, fontSize: '12.5px', fontWeight: '600', color: '#64748b' }}>Fetching verified industrial workers and ITI technicians</p>
        </div>
      ) : filteredCandidates.length > 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', width: '100%', boxSizing: 'border-box' }}>
          {filteredCandidates.map(c => {
            const skillsList: string[] = Array.isArray(c.skills)
              ? c.skills
              : typeof c.skills === 'string'
              ? c.skills.split(',').map((s: string) => s.trim()).filter(Boolean)
              : [];

            const expItem = Array.isArray(c.experience) && c.experience.length > 0 ? c.experience[0] : null;
            const expText = expItem ? (expItem.duration || expItem.years || '1') : (typeof c.experience === 'string' ? c.experience : null);

            return (
              <div 
                key={c.id || c.email} 
                onClick={() => handleOpenDetails({ ...c, userId: c.id }, '', '')}
                style={{ 
                  background: '#ffffff', 
                  border: '1.5px solid #cbd5e1', 
                  borderRadius: '6px', 
                  padding: '14px', 
                  boxShadow: '0 4px 12px rgba(15, 23, 42, 0.08), 0 1px 3px rgba(15, 23, 42, 0.05)', 
                  display: 'flex', 
                  flexDirection: 'column', 
                  gap: '10px', 
                  width: '100%', 
                  boxSizing: 'border-box',
                  cursor: 'pointer',
                  transition: 'border-color 0.2s ease, box-shadow 0.2s ease'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ width: '46px', height: '46px', borderRadius: '6px', background: '#eff6ff', border: '1px solid #cbd5e1', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, overflow: 'hidden' }}>
                    {c.profilePictureUrl ? (
                      <img src={c.profilePictureUrl} alt={c.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      <span style={{ fontSize: '18px', fontWeight: '800', color: '#344BFD' }}>
                        {(c.name || 'C').charAt(0).toUpperCase()}
                      </span>
                    )}
                  </div>
                  
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                      <h4 style={{ margin: 0, fontSize: '15px', fontWeight: '700', color: '#0f172a', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{c.name}</h4>
                      {c.aadhaarVerified && (
                        <span style={{ padding: '2px 8px', borderRadius: '9999px', background: '#dcfce7', color: '#15803d', border: '1px solid #bbf7d0', fontSize: '10.5px', fontWeight: '700', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                            <path d="m9 12 2 2 4-4"/>
                          </svg>
                          <span>Verified</span>
                        </span>
                      )}
                    </div>
                    <p style={{ margin: '2px 0 0 0', fontSize: '12px', color: '#475569', fontWeight: '600', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {c.headline || c.tradeSpecialization || 'Industrial Specialist'}
                    </p>
                  </div>
                </div>

                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px 14px', padding: '8px 10px', background: 'linear-gradient(180deg, #f8fafc 0%, #f1f5f9 100%)', borderRadius: '4px', border: '1px solid #cbd5e1', fontSize: '11.5px', color: '#64748b', fontWeight: '500' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                      <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/>
                      <circle cx="12" cy="10" r="3"/>
                    </svg>
                    <span style={{ color: '#334155', fontWeight: '600' }}>{c.location || 'Maharashtra, India'}</span>
                  </div>

                  {c.preferredShift && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                        <circle cx="12" cy="12" r="10"/>
                        <polyline points="12 6 12 12 16 14"/>
                      </svg>
                      <span>{c.preferredShift} Shift</span>
                    </div>
                  )}

                  {expText && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                        <rect width="20" height="14" x="2" y="7" rx="2" ry="2"/>
                        <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>
                      </svg>
                      <span>({expText} yrs)</span>
                    </div>
                  )}
                </div>

                {skillsList.length > 0 && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', alignItems: 'center' }}>
                    {skillsList.slice(0, 4).map((skill: string, index: number) => (
                      <span key={index} style={{ padding: '3px 8px', borderRadius: '4px', background: '#eff6ff', color: '#1d4ed8', border: '1px solid #bfdbfe', fontSize: '11px', fontWeight: '600' }}>
                        {skill}
                      </span>
                    ))}
                    {skillsList.length > 4 && (
                      <span style={{ fontSize: '11px', color: '#64748b', fontWeight: '600', padding: '2px 4px' }}>
                        +{skillsList.length - 4} more
                      </span>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '32px 16px', textAlign: 'center' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#eff6ff', color: '#344BFD', border: '1px solid #dbeafe', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8"/>
              <path d="m21 21-4.3-4.3"/>
            </svg>
          </div>
          <h3 style={{ margin: '0 0 4px 0', fontSize: '15px', fontWeight: '700', color: '#0f172a' }}>No candidates match filters</h3>
          <p style={{ margin: '0 0 16px 0', fontSize: '12.5px', color: '#64748b' }}>Try resetting search or filters to see all available workers.</p>
          {(searchQuery || selectedTrade || selectedLocation) && (
            <button
              onClick={() => { setSearchQuery(''); setSelectedTrade(''); setSelectedLocation(''); }}
              style={{ padding: '8px 16px', borderRadius: '6px', border: '1px solid #cbd5e1', background: '#ffffff', color: '#334155', fontWeight: '700', fontSize: '12px', cursor: 'pointer' }}
            >
              Reset All Filters
            </button>
          )}
        </div>
      )}
    </div>
  );
};

// --- EMPLOYER VIEW ---
interface EmployerProps {
  tab: string;
  currentUser: any;
  getJobsByEmployer: (id: string) => Job[];
  deleteJob: (id: string) => void;
  updateApplicantStatus: (jobId: string, applicantUserId: string, newStatus: string) => void;
  showToast: any;
  navigate: any;
  setTab: (tab: string) => void;
  t: any;
}

const EmployerDashboard: React.FC<EmployerProps> = ({ tab, currentUser, getJobsByEmployer, deleteJob, updateApplicantStatus, showToast, navigate, setTab, t }) => {
  const myJobs = getJobsByEmployer(currentUser.id);
  const activeJobs = myJobs.filter(j => j.status === 'active');
  const rejectedJobs = myJobs.filter(j => ((j.dbStatus || j.status || '') as string).toUpperCase() === 'REJECTED' || j.status === 'rejected' || !!j.rejectReason);
  const totalApplicants = myJobs.reduce((sum, j) => sum + (j.applicants?.length || 0), 0);
  const totalViews = myJobs.reduce((sum, j) => sum + (j.views || 0), 0);

  const renderEmployerTopTabBar = () => (
    <div className="employer-mobile-top-tab-bar" style={{
      display: 'flex',
      flexDirection: 'row',
      alignItems: 'center',
      background: '#ffffff',
      borderRadius: '8px',
      padding: '3px',
      marginBottom: '14px',
      border: '1px solid #cbd5e1',
      boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
      width: '100%',
      boxSizing: 'border-box',
      gap: '2px'
    }}>
      <button
        type="button"
        onClick={() => setTab('manage')}
        style={{
          flex: 1,
          padding: '7px 4px',
          borderRadius: '6px',
          border: 'none',
          background: tab === 'manage' ? '#344BFD' : 'transparent',
          color: tab === 'manage' ? '#ffffff' : '#475569',
          fontWeight: tab === 'manage' ? '700' : '600',
          fontSize: '11.5px',
          cursor: 'pointer',
          whiteSpace: 'nowrap',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '4px'
        }}
      >
        <span>Jobs ({myJobs.length})</span>
      </button>

      <button
        type="button"
        onClick={() => setTab('applicants')}
        style={{
          flex: 1,
          padding: '7px 4px',
          borderRadius: '6px',
          border: 'none',
          background: tab === 'applicants' ? '#344BFD' : 'transparent',
          color: tab === 'applicants' ? '#ffffff' : '#475569',
          fontWeight: tab === 'applicants' ? '700' : '600',
          fontSize: '11.5px',
          cursor: 'pointer',
          whiteSpace: 'nowrap',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '4px'
        }}
      >
        <span>Applicants ({totalApplicants})</span>
      </button>

      <button
        type="button"
        onClick={() => setTab('advertisements')}
        style={{
          flex: 1,
          padding: '7px 4px',
          borderRadius: '6px',
          border: 'none',
          background: ['advertisements', 'banners', 'promotions'].includes(tab) ? '#344BFD' : 'transparent',
          color: ['advertisements', 'banners', 'promotions'].includes(tab) ? '#ffffff' : '#475569',
          fontWeight: ['advertisements', 'banners', 'promotions'].includes(tab) ? '700' : '600',
          fontSize: '11.5px',
          cursor: 'pointer',
          whiteSpace: 'nowrap',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '4px'
        }}
      >
        <span>Banners</span>
      </button>

      <button
        type="button"
        onClick={() => setTab('candidates')}
        style={{
          flex: 1,
          padding: '7px 4px',
          borderRadius: '6px',
          border: 'none',
          background: tab === 'candidates' ? '#344BFD' : 'transparent',
          color: tab === 'candidates' ? '#ffffff' : '#475569',
          fontWeight: tab === 'candidates' ? '700' : '600',
          fontSize: '11.5px',
          cursor: 'pointer',
          whiteSpace: 'nowrap',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '4px'
        }}
      >
        <span>Candidates</span>
      </button>
    </div>
  );
  const [previewResume, setPreviewResume] = useState<any>(null);
  const [viewWorker, setViewWorker] = useState<any>(null);
  const { scheduleInterview, sendCustomEmail, updateJob } = useJobs();

  const [manageVacanciesJob, setManageVacanciesJob] = useState<Job | null>(null);
  const [tempOpenings, setTempOpenings] = useState<number>(0);
  const [tempFilled, setTempFilled] = useState<number>(0);
  const [isSavingVacancies, setIsSavingVacancies] = useState<boolean>(false);

  useEffect(() => {
    if (manageVacanciesJob) {
      setTempOpenings(manageVacanciesJob.openings);
      setTempFilled(manageVacanciesJob.filledOpenings || 0);
    }
  }, [manageVacanciesJob]);

  const handleSaveVacancies = async () => {
    if (!manageVacanciesJob) return;
    if (tempOpenings < 1) {
      showToast('Total openings must be at least 1', 'error');
      return;
    }
    if (tempFilled < 0) {
      showToast('Allotted openings cannot be negative', 'error');
      return;
    }
    if (tempFilled > tempOpenings) {
      showToast('Allotted openings cannot exceed total openings', 'error');
      return;
    }

    setIsSavingVacancies(true);
    try {
      const isFullyAllotted = tempFilled === tempOpenings;
      const updates = {
        openings: tempOpenings,
        filledOpenings: tempFilled,
        status: isFullyAllotted ? 'closed' : 'active'
      };

      await updateJob(manageVacanciesJob.id, updates);
      showToast('Vacancies updated successfully', 'success');
      setManageVacanciesJob(null);
    } catch (err: any) {
      showToast(err.message || 'Failed to update vacancies', 'error');
    } finally {
      setIsSavingVacancies(false);
    }
  };

  const [activeSubTab, setActiveSubTab] = useState<'job_details' | 'profile' | 'hiring'>('job_details');
  const [appSearchQuery, setAppSearchQuery] = useState('');
  const [appStatusFilter, setAppStatusFilter] = useState('all');
  const [appJobFilter, setAppJobFilter] = useState('all');
  const [interviewDate, setInterviewDate] = useState('');
  const [interviewTime, setInterviewTime] = useState('');
  const [venueAddress, setVenueAddress] = useState('');
  const [mapsLink, setMapsLink] = useState('');
  const [emailSubject, setEmailSubject] = useState('');
  const [emailMessage, setEmailMessage] = useState('');
  const [isScheduling, setIsScheduling] = useState(false);
  const [isSendingEmail, setIsSendingEmail] = useState(false);

  const handleOpenDetails = (applicant: any, jobId: string, jobTitle: string) => {
    setViewWorker({ ...applicant, jobId, jobTitle, job: myJobs.find(j => j.id === jobId) });
    setEmailSubject(`Regarding your application for ${jobTitle || applicant.headline || 'Job Opening'}`);
    setEmailMessage(`Hi ${applicant.name},\n\nWe would like to connect with you regarding your application for the ${jobTitle || applicant.headline || 'Position'} at ${currentUser?.companyName || currentUser?.name}.\n\nBest regards,\nRecruitment Team\n${currentUser?.companyName || currentUser?.name}`);
    setActiveSubTab('job_details');
    setInterviewDate(applicant.interviewDate || '');
    setInterviewTime(applicant.interviewTime || '');
    setVenueAddress(applicant.venueAddress || '');
    setMapsLink(applicant.mapsLink || '');

    // Increment profile view metric for candidate
    const targetUserId = applicant.userId || applicant.id;
    if (targetUserId) {
      apiFetch(`/api/v1/users/${targetUserId}/view`, { method: 'POST' }).catch(() => {});
    }
  };

  const handleDelete = (jobId: string) => {
    if (window.confirm('Are you sure you want to delete this job listing?')) {
      deleteJob(jobId);
      showToast('Job deleted successfully', 'success');
    }
  };

  const getRecentApplicants = () => {
    const applicantsList: any[] = [];
    myJobs.forEach(job => {
      (job.applicants || []).forEach(a => {
        applicantsList.push({ ...a, jobTitle: job.title, jobId: job.id, job });
      });
    });
    applicantsList.sort((a, b) => new Date(b.appliedAt).getTime() - new Date(a.appliedAt).getTime());
    return applicantsList;
  };

  const recentApplicants = getRecentApplicants();

  const renderContent = () => {
    switch (tab) {
    case 'advertisements':
    case 'banners':
    case 'promotions':
      return <EmployerAdvertisements employerJobs={myJobs} />;
    case 'overview':
      return (
        <>


          {rejectedJobs.length > 0 && (
            <div style={{
              background: '#FEF2F2',
              border: '1.5px solid #FCA5A5',
              borderRadius: '12px',
              padding: '14px 18px',
              marginBottom: '20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '12px',
              flexWrap: 'wrap',
              boxShadow: '0 2px 8px rgba(239, 68, 68, 0.08)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#DC2626" strokeWidth="2.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                <span style={{ fontSize: '13.5px', fontWeight: '700', color: '#991B1B' }}>
                  Action Required: You have {rejectedJobs.length} job listing{rejectedJobs.length > 1 ? 's' : ''} requiring correction based on Admin feedback.
                </span>
              </div>
              <button
                onClick={() => setTab('manage')}
                style={{
                  background: '#DC2626',
                  color: 'white',
                  border: 'none',
                  padding: '7px 14px',
                  borderRadius: '6px',
                  fontSize: '12.5px',
                  fontWeight: '700',
                  cursor: 'pointer'
                }}
              >
                View & Correct Listings
              </button>
            </div>
          )}

          {/* Welcome Header & Quick Action Hub */}
          <div style={{ background: '#ffffff', border: '1.5px solid #cbd5e1', borderRadius: '6px', padding: '16px', marginBottom: '20px', boxShadow: '0 4px 12px rgba(15, 23, 42, 0.08), 0 1px 3px rgba(15, 23, 42, 0.05)' }}>
            <div style={{ marginBottom: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <h2 style={{ fontSize: '18px', fontWeight: '800', color: '#0f172a', margin: 0 }}>
                  Welcome back, {currentUser.companyName || currentUser.name}
                </h2>
                <Sparkles size={18} style={{ color: '#f59e0b', flexShrink: 0 }} />
              </div>
              <p style={{ margin: '3px 0 0 0', fontSize: '12.5px', color: '#64748b' }}>
                Manage hiring campaigns, track candidate applications, and recruit verified industrial workers.
              </p>
            </div>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              <button 
                onClick={() => navigate('/post-job')}
                style={{ padding: '8px 16px', borderRadius: '8px', border: 'none', background: '#344BFD', color: '#ffffff', fontWeight: '700', fontSize: '12.5px', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
              >
                <PlusCircle size={15} />
                <span>Post New Job</span>
              </button>
              <button 
                onClick={() => setTab('candidates')}
                style={{ padding: '8px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#f8fafc', color: '#334155', fontWeight: '700', fontSize: '12.5px', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
              >
                <Search size={14} style={{ color: '#2563eb' }} />
                <span>Browse Candidates</span>
              </button>
              <button 
                onClick={() => setTab('advertisements')}
                style={{ padding: '8px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#f8fafc', color: '#334155', fontWeight: '700', fontSize: '12.5px', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
              >
                <Megaphone size={14} style={{ color: '#4f46e5' }} />
                <span>Create Banner</span>
              </button>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="dashboard-stats" style={{ marginBottom: '20px' }}>
            <div className="stat-card">
              <div className="stat-icon primary">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>
                </svg>
              </div>
              <div className="stat-info"><h3>{activeJobs.length}</h3><p>Active Jobs</p></div>
            </div>
            <div className="stat-card">
              <div className="stat-icon accent">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                </svg>
              </div>
              <div className="stat-info"><h3>{totalApplicants}</h3><p>Total Applicants</p></div>
            </div>
            <div className="stat-card">
              <div className="stat-icon success">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
                </svg>
              </div>
              <div className="stat-info"><h3>{formatNumber(totalViews)}</h3><p>Total Views</p></div>
            </div>
            <div className="stat-card">
              <div className="stat-icon warning">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                </svg>
              </div>
              <div className="stat-info"><h3>{myJobs.length}</h3><p>Jobs Posted</p></div>
            </div>
          </div>

          {/* Active Vacancies Quick Overview */}
          {myJobs.length > 0 && (
            <div style={{ background: '#ffffff', border: '1.5px solid #cbd5e1', borderRadius: '6px', padding: '16px', marginBottom: '20px', boxShadow: '0 4px 12px rgba(15, 23, 42, 0.08), 0 1px 3px rgba(15, 23, 42, 0.05)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <h3 style={{ margin: 0, fontSize: '15px', fontWeight: '700', color: '#0f172a' }}>Active Listings & Vacancy Fulfillment</h3>
                <button onClick={() => setTab('manage')} style={{ background: 'none', border: 'none', color: '#344BFD', fontSize: '12px', fontWeight: '700', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                  <span>Manage All ({myJobs.length})</span>
                  <ChevronRight size={14} />
                </button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {myJobs.slice(0, 3).map((j: any) => {
                  const filled = j.filledOpenings || 0;
                  const total = j.openings || 1;
                  const pct = Math.min(100, Math.round((filled / total) * 100));
                  return (
                    <div key={j.id} style={{ background: '#f8fafc', border: '1px solid #f1f5f9', borderRadius: '8px', padding: '10px 12px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div style={{ width: '36px', height: '36px', borderRadius: '8px', overflow: 'hidden', flexShrink: 0, background: '#eff6ff', border: '1px solid #dbeafe', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        {j.companyLogo || (j as any).company_logo ? (
                          <img src={j.companyLogo || (j as any).company_logo} alt={j.company || j.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        ) : (
                          <CompanyDefaultLogo companyName={j.company || currentUser?.companyName || 'Company'} logoUrl={null} size={36} />
                        )}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                          <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            <strong style={{ fontSize: '13px', color: '#0f172a' }}>{j.title}</strong>
                            <span style={{ fontSize: '11px', color: '#64748b', marginLeft: '6px', display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                              <MapPin size={11} style={{ color: '#2563eb' }} />
                              {j.location}
                            </span>
                          </div>
                          <span style={{ fontSize: '11.5px', fontWeight: '700', color: '#344BFD', flexShrink: 0, marginLeft: '8px' }}>
                            {filled} / {total} Filled
                          </span>
                        </div>
                        <div style={{ width: '100%', height: '5px', background: '#e2e8f0', borderRadius: '9999px', overflow: 'hidden' }}>
                          <div style={{ width: `${pct}%`, height: '100%', background: pct === 100 ? '#16a34a' : '#344BFD', transition: 'width 0.3s ease' }}></div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Candidate Discovery Feature Highlight */}
          <div style={{ background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 100%)', borderRadius: '6px', border: '1px solid #312e81', padding: '16px 18px', color: '#ffffff', marginBottom: '20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px', boxShadow: '0 6px 18px rgba(30, 27, 75, 0.22)' }}>
            <div>
              <div style={{ fontSize: '11px', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.5px', color: '#a5b4fc', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <UserCheck size={13} style={{ color: '#a5b4fc' }} />
                <span>Verified Candidate Pool</span>
              </div>
              <h4 style={{ margin: '4px 0 0 0', fontSize: '15px', fontWeight: '800', color: '#ffffff' }}>Directly Contact Factory & Industrial Specialists</h4>
              <p style={{ margin: '2px 0 0 0', fontSize: '12px', color: '#e0e7ff', fontWeight: '500' }}>Browse fitters, welders, CNC operators, and electricians in your MIDC zone.</p>
            </div>
            <button 
              onClick={() => setTab('candidates')}
              style={{ background: '#ffffff', color: '#312e81', border: 'none', padding: '8px 16px', borderRadius: '8px', fontWeight: '800', fontSize: '12.5px', cursor: 'pointer', whiteSpace: 'nowrap', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
            >
              <span>Browse Candidates</span>
              <ArrowRight size={14} />
            </button>
          </div>

          {/* Recent Applicants Feed */}
          <div className="activity-card">
            <div className="activity-header">
              <h3>Recent Applicants</h3>
              <button className="btn btn-ghost btn-sm" onClick={() => setTab('applicants')}>View All</button>
            </div>
            {recentApplicants.length > 0 ? (
              <div style={{ overflowX: 'auto', width: '100%' }}>
                <table className="activity-table">
                  <thead>
                    <tr><th>Candidate</th><th>Job</th><th>Applied</th><th>Status</th></tr>
                  </thead>
                  <tbody>
                    {recentApplicants.slice(0, 10).map((a, i) => (
                      <tr key={i}>
                        <td>
                          <span 
                            className="table-job-title" 
                            style={{ color: 'var(--primary)', cursor: 'pointer', fontWeight: '600' }}
                            onClick={() => handleOpenDetails(a, a.jobId, a.jobTitle)}
                          >
                            {a.name}
                          </span>
                          <br/>
                          <span className="table-company">{a.email}</span>
                        </td>
                        <td>{a.jobTitle}</td>
                        <td>{timeAgo(a.appliedAt)}</td>
                        <td><span className={`status-badge status-${a.status}`}>{capitalize(a.status)}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="empty-state" style={{ padding: '24px 16px', textAlign: 'center' }}>
                <div style={{ width: '44px', height: '44px', borderRadius: '50%', background: '#eff6ff', border: '1px solid #dbeafe', color: '#344BFD', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 10px auto' }}>
                  <ClipboardList size={22} />
                </div>
                <h4 style={{ margin: '0 0 4px 0', fontSize: '14.5px', fontWeight: '700', color: '#0f172a' }}>No applications received yet</h4>
                <p style={{ margin: '0 0 14px 0', fontSize: '12px', color: '#64748b' }}>
                  Boost candidate reach by promoting your job posting on the hero banner slider.
                </p>
                <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', flexWrap: 'wrap' }}>
                  <button 
                    onClick={() => setTab('advertisements')}
                    style={{ padding: '7px 14px', borderRadius: '6px', border: 'none', background: '#344BFD', color: '#ffffff', fontWeight: '700', fontSize: '12px', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                  >
                    <Megaphone size={13} />
                    <span>Create Banner</span>
                  </button>
                  <button 
                    onClick={() => setTab('candidates')}
                    style={{ padding: '7px 14px', borderRadius: '6px', border: '1px solid #cbd5e1', background: '#ffffff', color: '#334155', fontWeight: '700', fontSize: '12px', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                  >
                    <Search size={13} style={{ color: '#2563eb' }} />
                    <span>Browse Candidates</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </>
      );

    case 'manage': {
      const renderJobStatusBadge = (job: Job) => {
        const rawStatus = ((job.dbStatus || job.status || '') as string).toUpperCase();
        if (rawStatus === 'PENDING_REVIEW' || rawStatus === 'PENDING' || rawStatus === 'UNDER_APPROVAL' || job.status === 'pending') {
          return (
            <span style={{ padding: '4px 9px', borderRadius: '9999px', background: '#fef3c7', color: '#b45309', border: '1px solid #fde68a', fontSize: '11px', fontWeight: '700', display: 'inline-flex', alignItems: 'center', gap: '4px', whiteSpace: 'nowrap', flexShrink: 0 }}>
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
              <span>Under Approval</span>
            </span>
          );
        }
        if (rawStatus === 'REJECTED' || job.status === 'rejected') {
          return (
            <span style={{ padding: '4px 9px', borderRadius: '9999px', background: '#fef2f2', color: '#dc2626', border: '1px solid #fca5a5', fontSize: '11px', fontWeight: '700', display: 'inline-flex', alignItems: 'center', gap: '4px', whiteSpace: 'nowrap', flexShrink: 0 }}>
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>
              <span>Rejected</span>
            </span>
          );
        }
        if (rawStatus === 'CLOSED' || job.status === 'closed') {
          return (
            <span style={{ padding: '4px 9px', borderRadius: '9999px', background: '#f1f5f9', color: '#64748b', border: '1px solid #cbd5e1', fontSize: '11px', fontWeight: '700', whiteSpace: 'nowrap', flexShrink: 0 }}>
              Closed
            </span>
          );
        }
        return (
          <span style={{ padding: '4px 9px', borderRadius: '9999px', background: '#dbeafe', color: '#1d4ed8', border: '1px solid #bfdbfe', fontSize: '11px', fontWeight: '700', display: 'inline-flex', alignItems: 'center', gap: '4px', whiteSpace: 'nowrap', flexShrink: 0 }}>
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
            <span>Active (Live)</span>
          </span>
        );
      };

      return (
        <>
          <div style={{ marginBottom: '20px' }}>
            <h2 style={{ fontSize: '20px', fontWeight: '800', color: '#0f172a', margin: 0 }}>Manage Jobs</h2>
            <p style={{ margin: '2px 0 0 0', fontSize: '12.5px', color: '#64748b' }}>Track applications, edit vacancies & manage listings</p>
          </div>

          {myJobs.length > 0 ? (
            <>
              {/* Desktop Table View */}
              <div className="manage-jobs-card desktop-manage-jobs-table">
                <div style={{ overflowX: 'auto', width: '100%' }}>
                  <table className="manage-table">
                    <thead>
                      <tr><th>Job Title</th><th>Vacancies</th><th>Applicants</th><th>Views</th><th>Status</th><th>Posted</th><th>Actions</th></tr>
                    </thead>
                    <tbody>
                      {myJobs.map(job => (
                        <tr key={job.id}>
                          <td>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                              <div style={{ width: '38px', height: '38px', borderRadius: '8px', overflow: 'hidden', flexShrink: 0, background: '#eff6ff', border: '1px solid #dbeafe', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                {job.companyLogo || (job as any).company_logo ? (
                                  <img src={job.companyLogo || (job as any).company_logo} alt={job.company || job.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                ) : (
                                  <CompanyDefaultLogo companyName={job.company || currentUser?.companyName || 'Company'} logoUrl={null} size={38} />
                                )}
                              </div>
                              <div>
                                <span className="table-job-title" style={{ fontWeight: '700', color: '#0f172a', display: 'block' }}>{job.title}</span>
                                <span className="table-company" style={{ color: '#64748b', fontSize: '12px' }}>{job.company ? `${job.company} · ` : ''}{job.location} · {job.jobType}</span>
                              </div>
                            </div>
                            {(job.rejectReason || ((job.dbStatus || job.status || '') as string).toUpperCase() === 'REJECTED') && (
                              <div style={{ fontSize: '11.5px', background: '#FEF2F2', border: '1px solid #FECACA', color: '#991B1B', padding: '4px 8px', borderRadius: '6px', marginTop: '6px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                ⚠️ <strong>Admin Note:</strong> {job.rejectReason || 'Correction required'}
                              </div>
                            )}
                          </td>
                          <td>
                            <span style={{ fontWeight: '700' }}>{job.filledOpenings || 0}</span> / <span>{job.openings}</span>
                            {job.openings > (job.filledOpenings || 0) ? (
                              <div style={{ fontSize: '11px', color: '#1d4ed8', fontWeight: '600', marginTop: '2px' }}>
                                ({job.openings - (job.filledOpenings || 0)} open)
                              </div>
                            ) : (
                              <div style={{ fontSize: '11px', color: 'var(--text-tertiary)', marginTop: '2px' }}>
                                (0 open)
                              </div>
                            )}
                          </td>
                          <td>
                            <Link to={`/job/${job.id}/applicants`} style={{ textDecoration: 'none', color: '#344BFD', fontWeight: '800' }}>
                              {job.applicants?.length || 0} candidates
                            </Link>
                          </td>
                          <td>{job.views || 0}</td>
                          <td>{renderJobStatusBadge(job)}</td>
                          <td>{timeAgo(job.postedAt)}</td>
                          <td>
                            <div className="table-actions">
                              {(((job.dbStatus || job.status || '') as string).toUpperCase() === 'REJECTED' || job.status === 'rejected') && (
                                <button className="table-action-btn" title="Edit & Resubmit" style={{ background: '#DC2626', color: 'white', border: 'none' }} onClick={() => navigate(`/edit-job/${job.id}`)}>
                                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                                </button>
                              )}
                              <button className="table-action-btn" title="Manage Vacancies" onClick={() => setManageVacanciesJob(job)}>
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                  <rect x="2" y="7" width="20" height="14" rx="2" ry="2"/>
                                  <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>
                                  <polyline points="9 13 11 15 15 11"/>
                                </svg>
                              </button>
                              <button className="table-action-btn" title="View Applicants" onClick={() => navigate(`/job/${job.id}/applicants`)}>
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                                </svg>
                              </button>
                              <button className="table-action-btn" title="Edit" onClick={() => navigate(`/edit-job/${job.id}`)}>
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                                </svg>
                              </button>
                              <button className="table-action-btn" title="View Listing" onClick={() => navigate(`/job/${job.id}`)}>
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
                                </svg>
                              </button>
                              <button className="table-action-btn danger" title="Delete" onClick={() => handleDelete(job.id)}>
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                  <polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2 2v2"/>
                                </svg>
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Mobile Responsive Cards View */}
              <div className="mobile-manage-jobs-list" style={{ width: '100%', boxSizing: 'border-box' }}>
                {myJobs.map(job => (
                  <div key={job.id} style={{ background: '#ffffff', border: '1.5px solid #cbd5e1', borderRadius: '6px', padding: '14px', boxShadow: '0 4px 12px rgba(15, 23, 42, 0.08), 0 1px 3px rgba(15, 23, 42, 0.05)', display: 'flex', flexDirection: 'column', gap: '12px', width: '100%', boxSizing: 'border-box' }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', width: '100%', boxSizing: 'border-box' }}>
                      <div style={{ width: '44px', height: '44px', borderRadius: '6px', overflow: 'hidden', flexShrink: 0, background: '#eff6ff', border: '1px solid #cbd5e1', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        {job.companyLogo || (job as any).company_logo ? (
                          <img src={job.companyLogo || (job as any).company_logo} alt={job.company || job.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        ) : (
                          <CompanyDefaultLogo companyName={job.company || currentUser?.companyName || 'Company'} logoUrl={null} size={44} />
                        )}
                      </div>

                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '8px', width: '100%' }}>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <h4 style={{ margin: '0 0 2px 0', fontSize: '15px', fontWeight: '700', color: '#0f172a', lineHeight: 1.25 }}>{job.title}</h4>
                            {job.company && <div style={{ fontSize: '12px', color: '#334155', fontWeight: '600', marginBottom: '3px' }}>{job.company}</div>}
                            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', flexWrap: 'wrap', fontSize: '11.5px', color: '#64748b', fontWeight: '500' }}>
                              <MapPin size={12} style={{ color: '#2563eb', flexShrink: 0 }} />
                              <span>{job.location || 'Onsite'}</span>
                              <span style={{ color: '#cbd5e1' }}>•</span>
                              <span>{job.jobType}</span>
                            </div>
                          </div>

                          <div style={{ flexShrink: 0 }}>
                            {renderJobStatusBadge(job)}
                          </div>
                        </div>

                        {(job.rejectReason || ((job.dbStatus || job.status || '') as string).toUpperCase() === 'REJECTED') && (
                          <div style={{ fontSize: '11.5px', background: '#FEF2F2', border: '1px solid #FECACA', color: '#991B1B', padding: '6px 8px', borderRadius: '6px', marginTop: '8px', fontWeight: '600' }}>
                            ⚠️ <strong>Admin Note:</strong> {job.rejectReason || 'Correction required by admin'}
                          </div>
                        )}
                      </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '6px', padding: '8px 10px', background: '#f8fafc', borderRadius: '6px', border: '1px solid #f1f5f9', textAlign: 'center' }}>
                      <div>
                        <div style={{ fontSize: '9.5px', color: '#64748b', fontWeight: '700', textTransform: 'uppercase' }}>Vacancies</div>
                        <div style={{ fontSize: '13px', fontWeight: '800', color: '#0f172a', marginTop: '1px' }}>
                          {job.filledOpenings || 0} / {job.openings}
                        </div>
                      </div>
                      <div>
                        <div style={{ fontSize: '9.5px', color: '#64748b', fontWeight: '700', textTransform: 'uppercase' }}>Applicants</div>
                        <Link to={`/job/${job.id}/applicants`} style={{ fontSize: '13px', fontWeight: '800', color: '#344BFD', textDecoration: 'none', display: 'block', marginTop: '1px' }}>
                          {job.applicants?.length || 0}
                        </Link>
                      </div>
                      <div>
                        <div style={{ fontSize: '9.5px', color: '#64748b', fontWeight: '700', textTransform: 'uppercase' }}>Views</div>
                        <div style={{ fontSize: '13px', fontWeight: '800', color: '#0f172a', marginTop: '1px' }}>{job.views || 0}</div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', paddingTop: '2px' }}>
                      {/* Tier 1: Primary Action Button (Full Width) */}
                      <button 
                        onClick={() => navigate(`/job/${job.id}/applicants`)} 
                        style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: 'none', background: '#344BFD', color: '#ffffff', fontWeight: '700', fontSize: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
                      >
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                          <circle cx="9" cy="7" r="4"/>
                          <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                          <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                        </svg>
                        <span>View Applicants ({job.applicants?.length || 0})</span>
                      </button>

                      {/* Tier 2: Secondary Action Toolbar (3 items aligned in 1 row) */}
                      <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                        <button 
                          onClick={() => setManageVacanciesJob(job)} 
                          style={{ flex: 1, padding: '7px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', background: '#ffffff', color: '#334155', fontWeight: '700', fontSize: '11.5px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}
                        >
                          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>
                          <span>Openings</span>
                        </button>
                        <button 
                          onClick={() => navigate(`/edit-job/${job.id}`)} 
                          style={{ flex: 1, padding: '7px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', background: '#ffffff', color: '#334155', fontWeight: '700', fontSize: '11.5px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}
                        >
                          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                          <span>Edit</span>
                        </button>
                        <button 
                          onClick={() => handleDelete(job.id)} 
                          style={{ padding: '7px 12px', borderRadius: '6px', border: '1px solid #fca5a5', background: '#fef2f2', color: '#dc2626', fontWeight: '700', fontSize: '11.5px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                          title="Delete Listing"
                        >
                          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2 2v2"/></svg>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div style={{
              background: '#ffffff',
              border: '1px solid #e2e8f0',
              borderRadius: '16px',
              padding: '40px 20px',
              textAlign: 'center',
              boxShadow: '0 4px 12px rgba(0,0,0,0.03)'
            }}>
              <div style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                background: '#eff6ff',
                color: '#344BFD',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 16px auto',
                border: '1px solid #bfdbfe'
              }}>
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="7" width="20" height="14" rx="2" ry="2"/>
                  <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>
                </svg>
              </div>
              <h3 style={{ fontSize: '18px', fontWeight: '800', color: '#0f172a', margin: '0 0 6px 0' }}>
                No Job Listings Posted Yet
              </h3>
              <p style={{ fontSize: '13.5px', color: '#64748b', maxWidth: '360px', margin: '0 auto 20px auto', lineHeight: 1.5 }}>
                Start posting industrial job openings to reach thousands of verified candidates in your MIDC zone.
              </p>
              <button 
                onClick={() => setTab('post-job')}
                style={{
                  padding: '12px 24px',
                  borderRadius: '10px',
                  background: '#344BFD',
                  color: '#ffffff',
                  border: 'none',
                  fontWeight: '700',
                  fontSize: '14px',
                  cursor: 'pointer',
                  boxShadow: '0 4px 14px rgba(52, 75, 253, 0.3)',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                + Post Your First Job →
              </button>
            </div>
          )}
        </>
      );
    }

    case 'candidates':
      return <CandidatesTab showToast={showToast} handleOpenDetails={handleOpenDetails} />;

    case 'applicants': {
      const allApplicants = getRecentApplicants();
      const filteredApplicants = allApplicants.filter(a => {
        const matchesSearch = appSearchQuery === '' ||
          a.name.toLowerCase().includes(appSearchQuery.toLowerCase()) ||
          a.email.toLowerCase().includes(appSearchQuery.toLowerCase()) ||
          a.jobTitle.toLowerCase().includes(appSearchQuery.toLowerCase());
        const matchesStatus = appStatusFilter === 'all' || a.status === appStatusFilter;
        const matchesJob = appJobFilter === 'all' || a.jobId === appJobFilter;
        return matchesSearch && matchesStatus && matchesJob;
      });

      const totalReceived = allApplicants.length;
      const reviewedCount = allApplicants.filter(a => a.status === 'reviewed').length;
      const shortlistedCount = allApplicants.filter(a => a.status === 'shortlisted').length;
      const acceptedCount = allApplicants.filter(a => a.status === 'accepted').length;

      return (
        <div style={{ width: '100%', boxSizing: 'border-box' }}>
          <div style={{ marginBottom: '14px' }}>
            <h2 style={{ fontSize: '17px', margin: 0, fontWeight: '700', color: '#0f172a' }}>Recent Job Applications</h2>
            <p style={{ color: '#64748b', fontSize: '11.5px', margin: '2px 0 0' }}>
              Track candidate applications, review job details, schedule interviews, and communicate directly with applicants.
            </p>
          </div>

          {/* Metric Summary Cards (Compact 2x2 Grid) */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px', marginBottom: '14px', width: '100%', boxSizing: 'border-box' }}>
            <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '10px 12px', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ width: '32px', height: '32px', borderRadius: '6px', background: '#eff6ff', color: '#344BFD', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><rect x="8" y="2" width="8" height="4" rx="1" ry="1"/><path d="M9 14l2 2 4-4"/>
                </svg>
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: '15px', fontWeight: '800', color: '#0f172a', lineHeight: 1.2 }}>{totalReceived}</h3>
                <p style={{ margin: 0, fontSize: '11px', color: '#64748b', fontWeight: '500' }}>Total Received</p>
              </div>
            </div>

            <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '10px 12px', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ width: '32px', height: '32px', borderRadius: '6px', background: '#fef3c7', color: '#b45309', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
                </svg>
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: '15px', fontWeight: '800', color: '#0f172a', lineHeight: 1.2 }}>{reviewedCount}</h3>
                <p style={{ margin: 0, fontSize: '11px', color: '#64748b', fontWeight: '500' }}>Under Review</p>
              </div>
            </div>

            <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '10px 12px', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ width: '32px', height: '32px', borderRadius: '6px', background: '#e0e7ff', color: '#4338ca', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
                </svg>
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: '15px', fontWeight: '800', color: '#0f172a', lineHeight: 1.2 }}>{shortlistedCount}</h3>
                <p style={{ margin: 0, fontSize: '11px', color: '#64748b', fontWeight: '500' }}>Shortlisted</p>
              </div>
            </div>

            <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '10px 12px', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ width: '32px', height: '32px', borderRadius: '6px', background: '#dbeafe', color: '#1d4ed8', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>
                </svg>
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: '15px', fontWeight: '800', color: '#0f172a', lineHeight: 1.2 }}>{acceptedCount}</h3>
                <p style={{ margin: 0, fontSize: '11px', color: '#64748b', fontWeight: '500' }}>Hired</p>
              </div>
            </div>
          </div>

          {/* Filter Bar */}
          <div style={{ background: '#ffffff', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(15, 23, 42, 0.04)', marginBottom: '14px', display: 'flex', flexDirection: 'column', gap: '10px', width: '100%', boxSizing: 'border-box' }}>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              <div style={{ flex: '1 1 180px', position: 'relative' }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', pointerEvents: 'none' }}>
                  <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
                </svg>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Search candidate name, email, job..."
                  value={appSearchQuery}
                  onChange={(e) => setAppSearchQuery(e.target.value)}
                  style={{ width: '100%', paddingLeft: '30px', height: '36px', fontSize: '12px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                />
              </div>
              <div style={{ flex: '1 1 160px' }}>
                <select
                  className="form-select"
                  value={appJobFilter}
                  onChange={(e) => setAppJobFilter(e.target.value)}
                  style={{ width: '100%', height: '36px', fontSize: '12px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                >
                  <option value="all">All Job Postings ({myJobs.length})</option>
                  {myJobs.map(job => (
                    <option key={job.id} value={job.id}>{job.title} ({job.applicants?.length || 0})</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Status Pills Container */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <span style={{ fontSize: '10px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Filter by Status:</span>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
                {[
                  { label: 'All', value: 'all' },
                  { label: 'Applied', value: 'applied' },
                  { label: 'Reviewed', value: 'reviewed' },
                  { label: 'Shortlisted', value: 'shortlisted' },
                  { label: 'Accepted', value: 'accepted' },
                  { label: 'Rejected', value: 'rejected' },
                ].map(st => (
                  <button
                    key={st.value}
                    onClick={() => setAppStatusFilter(st.value)}
                    style={{
                      padding: '5px 10px',
                      borderRadius: '6px',
                      fontSize: '11.5px',
                      fontWeight: appStatusFilter === st.value ? '700' : '500',
                      background: appStatusFilter === st.value ? '#344BFD' : '#f1f5f9',
                      color: appStatusFilter === st.value ? '#ffffff' : '#475569',
                      border: appStatusFilter === st.value ? '1px solid #344BFD' : '1px solid #cbd5e1',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                      lineHeight: '1.2'
                    }}
                  >
                    {st.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Applications List */}
          {filteredApplicants.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {filteredApplicants.map((a, i) => (
                <div key={i} className="applicant-card-item">
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    
                    {/* Top Row: Candidate Header + Status Pill & Dropdown */}
                    <div className="applicant-header-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                      <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flex: '1 1 220px' }}>
                        <div className="applicant-avatar" style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'var(--gradient-accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', flexShrink: 0, border: '1px solid var(--border)' }}>
                          {a.profilePictureUrl ? (
                            <img src={a.profilePictureUrl} alt={a.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          ) : (
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ color: 'white' }}>
                              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                              <circle cx="12" cy="7" r="4"/>
                            </svg>
                          )}
                        </div>
                        
                        <div style={{ minWidth: 0 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                            <h4 style={{ margin: 0, fontSize: '15px', fontWeight: '700', color: 'var(--text)', wordBreak: 'break-word' }}>{a.name}</h4>
                            {a.aadhaarVerified && (
                              <span className="candidate-badge" style={{ fontSize: '10px', padding: '1px 6px', background: '#dcfce7', color: '#15803d', borderRadius: '10px', fontWeight: '600', display: 'inline-flex', alignItems: 'center', gap: '2px' }}>
                                <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor">
                                  <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                                </svg>
                                Verified
                              </span>
                            )}
                          </div>
                          <p style={{ margin: '1px 0 0', color: 'var(--primary)', fontWeight: '600', fontSize: '13px', wordBreak: 'break-word' }}>
                            Applied for: <Link to={`/job/${a.jobId}`} style={{ color: 'var(--primary)', textDecoration: 'underline' }}>{a.jobTitle}</Link>
                          </p>
                          <p style={{ margin: '1px 0 0', color: 'var(--text-secondary)', fontSize: '12px', wordBreak: 'break-word' }}>
                            {a.email} {a.phone ? `· ${a.phone}` : ''} · Applied {timeAgo(a.appliedAt)}
                          </p>
                        </div>
                      </div>

                      {/* Status Selector & Badge */}
                      <div className="applicant-status-controls" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span className={`status-badge-desktop status-badge status-${a.status}`} style={{ fontSize: '11px', padding: '3px 8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                          {capitalize(a.status)}
                        </span>
                        <select
                          value={a.status}
                          onChange={(e) => updateApplicantStatus(a.jobId, a.userId, e.target.value)}
                          style={{
                            padding: '4px 8px',
                            borderRadius: '6px',
                            border: '1px solid var(--border)',
                            fontSize: '12px',
                            background: 'var(--surface)',
                            color: 'var(--text-primary)',
                            cursor: 'pointer',
                            fontWeight: '600'
                          }}
                        >
                          <option value="applied">Applied</option>
                          <option value="reviewed">Reviewed</option>
                          <option value="shortlisted">Shortlisted</option>
                          <option value="accepted">Accepted</option>
                          <option value="rejected">Rejected</option>
                        </select>
                      </div>
                    </div>

                    {/* Scheduled Interview Info Banner (If set) */}
                    {a.interviewDate && (
                      <div style={{ padding: '6px 10px', background: 'rgba(37, 99, 235, 0.06)', borderRadius: '6px', border: '1px solid rgba(37, 99, 235, 0.15)', fontSize: '12px', color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                          <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
                        </svg>
                        <span><strong>Interview Scheduled:</strong> {a.interviewDate} at {a.interviewTime}</span>
                        {a.venueAddress && <span style={{ opacity: 0.85 }}>({a.venueAddress})</span>}
                      </div>
                    )}

                    {/* Bottom Action Bar */}
                    <div className="applicant-action-bar" style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '8px', paddingTop: '6px', borderTop: '1px solid var(--border-light)', flexWrap: 'wrap' }}>
                      <button
                        onClick={() => handleOpenDetails(a, a.jobId, a.jobTitle)}
                        className="btn btn-primary btn-sm btn-mobile-full"
                        style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', fontSize: '12px', padding: '6px 12px', fontWeight: '600', borderRadius: '6px' }}
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
                        </svg>
                        View Job & Candidate Details
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <div className="empty-state-icon">
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="2">
                  <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><rect x="8" y="2" width="8" height="4" rx="1" ry="1"/><path d="M9 14l2 2 4-4"/>
                </svg>
              </div>
              <h3>No applications match your search or filter</h3>
              <p>Try resetting filters or searching for another candidate.</p>
              <button
                className="btn btn-ghost btn-sm mt-4"
                onClick={() => {
                  setAppSearchQuery('');
                  setAppStatusFilter('all');
                  setAppJobFilter('all');
                }}
              >
                Reset Filters
              </button>
            </div>
          )}
        </div>
      );
    }

      case 'post-job':
        return (
          <JobPostPage isEmbedded={true} onComplete={() => setTab('manage')} />
        );

      default:
        return null;
    }
  };

  return (
    <>
      {renderContent()}
      {previewResume && (
        <ResumePreviewModal resume={previewResume} onClose={() => setPreviewResume(null)} userId={previewResume?.userId} />
      )}
      {viewWorker && (
        <CandidateDetailsModal
          viewWorker={viewWorker}
          onClose={() => setViewWorker(null)}
          updateApplicantStatus={updateApplicantStatus}
          scheduleInterview={scheduleInterview}
          sendCustomEmail={sendCustomEmail}
          showToast={showToast}
          myJobs={myJobs}
        />
      )}

      {manageVacanciesJob && createPortal(
        <div className="modal-backdrop" onClick={() => setManageVacanciesJob(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '480px', width: '100%' }}>
            <div className="modal-header">
              <h3 className="modal-title">Manage Vacancies</h3>
              <button className="modal-close" onClick={() => setManageVacanciesJob(null)}>✕</button>
            </div>
            <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div style={{ background: 'var(--bg-secondary)', padding: '16px', borderRadius: '8px', border: '1px solid var(--border)', display: 'flex', gap: '16px', alignItems: 'center' }}>
                <CompanyDefaultLogo
                  logoUrl={manageVacanciesJob.companyLogo}
                  companyName={manageVacanciesJob.company}
                  size={48}
                  borderRadius="8px"
                />

                <div style={{ flex: 1, minWidth: 0 }}>
                  <h4 style={{ margin: 0, fontSize: '15px', fontWeight: '700' }}>{manageVacanciesJob.title}</h4>
                  <p style={{ margin: '4px 0 0', fontSize: '13px', color: 'var(--text-secondary)' }}>
                    {manageVacanciesJob.company} · {manageVacanciesJob.location} · {manageVacanciesJob.jobType}
                  </p>
                </div>
              </div>

              {/* Total Openings Counter */}
              <div className="form-group">
                <label className="form-label" style={{ fontWeight: '600', marginBottom: '6px' }}>Total Vacancies (Openings)</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <button 
                    className="btn" 
                    type="button"
                    onClick={() => setTempOpenings(prev => Math.max(1, prev - 1))}
                    style={{ padding: '8px 16px', background: 'var(--bg-secondary)', border: '1px solid var(--border)', fontWeight: 'bold', fontSize: '16px' }}
                  >
                    -
                  </button>
                  <input 
                    type="number" 
                    min="1" 
                    value={tempOpenings} 
                    onChange={(e) => setTempOpenings(Math.max(1, parseInt(e.target.value) || 1))}
                    style={{ flex: 1, padding: '10px', textAlign: 'center', fontSize: '16px', fontWeight: '600', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', background: 'var(--bg)' }}
                  />
                  <button 
                    className="btn" 
                    type="button"
                    onClick={() => setTempOpenings(prev => prev + 1)}
                    style={{ padding: '8px 16px', background: 'var(--bg-secondary)', border: '1px solid var(--border)', fontWeight: 'bold', fontSize: '16px' }}
                  >
                    +
                  </button>
                </div>
                <span style={{ fontSize: '11px', color: 'var(--text-tertiary)', marginTop: '4px', display: 'block' }}>
                  The total target vacancies listed for this job role.
                </span>
              </div>

              {/* Allotted/Filled Openings Counter */}
              <div className="form-group">
                <label className="form-label" style={{ fontWeight: '600', marginBottom: '6px' }}>Allotted (Filled) Vacancies</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <button 
                    className="btn" 
                    type="button"
                    onClick={() => setTempFilled(prev => Math.max(0, prev - 1))}
                    style={{ padding: '8px 16px', background: 'var(--bg-secondary)', border: '1px solid var(--border)', fontWeight: 'bold', fontSize: '16px' }}
                  >
                    -
                  </button>
                  <input 
                    type="number" 
                    min="0" 
                    max={tempOpenings}
                    value={tempFilled} 
                    onChange={(e) => setTempFilled(Math.max(0, Math.min(tempOpenings, parseInt(e.target.value) || 0)))}
                    style={{ flex: 1, padding: '10px', textAlign: 'center', fontSize: '16px', fontWeight: '600', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', background: 'var(--bg)' }}
                  />
                  <button 
                    className="btn" 
                    type="button"
                    onClick={() => setTempFilled(prev => Math.min(tempOpenings, prev + 1))}
                    style={{ padding: '8px 16px', background: 'var(--bg-secondary)', border: '1px solid var(--border)', fontWeight: 'bold', fontSize: '16px' }}
                  >
                    +
                  </button>
                </div>
                <span style={{ fontSize: '11px', color: 'var(--text-tertiary)', marginTop: '4px', display: 'block' }}>
                  Number of positions that have been filled by accepted candidates.
                </span>
              </div>

              {/* Status Alert and Breakdown */}
              <div style={{ 
                padding: '12px 16px', 
                borderRadius: '8px', 
                fontSize: '13px', 
                lineHeight: '1.4',
                background: tempFilled === tempOpenings ? 'rgba(239, 68, 68, 0.08)' : 'rgba(22, 163, 74, 0.08)',
                border: tempFilled === tempOpenings ? '1px solid rgba(239, 68, 68, 0.2)' : '1px solid rgba(22, 163, 74, 0.2)',
                color: tempFilled === tempOpenings ? '#b91c1c' : '#15803d'
              }}>
                {tempFilled === tempOpenings ? (
                  <strong>⚠️ All vacancies filled! This job listing will be marked as CLOSED and hidden from active search.</strong>
                ) : (
                  <span>
                    <strong>✅ Active:</strong> {tempOpenings - tempFilled} open vacancies remaining. The listing will remain open.
                  </span>
                )}
              </div>

              {/* Actions */}
              <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
                <button 
                  className="btn" 
                  onClick={() => setManageVacanciesJob(null)}
                  style={{ flex: 1, padding: '10px', background: 'var(--bg-secondary)', color: 'var(--text)', border: '1px solid var(--border)', fontWeight: '600', cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button 
                  className="btn btn-primary" 
                  onClick={handleSaveVacancies}
                  disabled={isSavingVacancies}
                  style={{ flex: 1, padding: '10px', fontWeight: '600', cursor: 'pointer' }}
                >
                  {isSavingVacancies ? 'Saving...' : 'Save Changes'}
                </button>
              </div>

            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  );
};


export default DashboardPage;
