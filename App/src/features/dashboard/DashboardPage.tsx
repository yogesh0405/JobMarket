import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useJobs } from '../../hooks/useJobs';
import { apiFetch } from '../../utils/api';
import { getInitials, formatNumber, formatSalary, capitalize, timeAgo, shareContent, safeJsonParse } from '../../utils/helpers';
import { ResumePreviewModal } from '../../components/profile/ResumePreviewModal';
import { CandidateDetailsModal } from '../../components/candidate/CandidateDetailsModal';
import { useToast } from '../../hooks/useToast';
import { useStore } from '../../store/useStore';
import { useTranslation } from '../../utils/translations';
import { CompanyDefaultLogo } from '../../components/company/CompanyDefaultLogo';
import { JobCard } from '../../components/job/JobCard';
import { Job } from '../../types';
import { ProfilePage } from '../profile/ProfilePage';
import { CandidateEditProfileModal } from '../profile/CandidateEditProfileModal';
import { EditCompanyProfileModal } from '../company/EditCompanyProfileModal';
import { ResumePage } from '../profile/ResumePage';
import { JobPostPage } from '../jobs/JobPostPage';
import { safeValue } from '../jobs/JobApplicantsPage';
import { AboutPage } from '../static/AboutPage';
import { ContactPage } from '../static/ContactPage';
import { SavedJobsPage } from './SavedJobsPage';
import { EmployerAdvertisements } from './EmployerAdvertisements';
import { EmployerInterviewsTab } from '../interviews/EmployerInterviewsTab';
import { CandidateInterviewsTab } from '../interviews/CandidateInterviewsTab';
import { SecuritySettings } from '../../components/profile/SecuritySettings';
import { JobMarketLogoSvg } from '../../components/common/JobMarketLogoSvg';
import { MobileHeader } from '../../components/common/MobileHeader';
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
  ClipboardList,
  Building2,
  Calendar,
  IndianRupee,
  ExternalLink,
  ShieldCheck,
  Send,
  AlertCircle,
  Bell,
  MoreVertical,
  SlidersHorizontal,
  Trash2,
  Edit3,
  Share2,
  XCircle
} from 'lucide-react';

export const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { currentUser, updateUser, syncUser, logout } = useAuth();
  const { getAppliedJobs, getSavedJobs, getJobsByEmployer, deleteJob, updateApplicantStatus, fetchEmployerJobs, fetchCandidateAppliedJobs, fetchCandidateSavedJobs, toggleSaveJob } = useJobs();
  const { showToast } = useToast();
  const { state } = useStore();
  const t = useTranslation(state.language);

  const handleLogout = () => {
    logout();
    showToast('Logged out successfully', 'success');
    navigate('/');
  };

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

  const rawTab = searchParams.get('tab') || (currentUser?.role === 'employer' ? 'profile' : 'profile');
  const tab = rawTab === 'candidate' ? 'candidates' : rawTab;

  const [isLoading, setIsLoading] = useState(!currentUser);

  useEffect(() => {
    if (!currentUser) {
      showToast('Please log in to access the dashboard', 'warning');
      navigate('/login');
    }
  }, [currentUser, navigate, showToast]);

  useEffect(() => {
    if (rawTab === 'resume') {
      navigate('/resume', { replace: true });
    }
  }, [rawTab, navigate]);

  useEffect(() => {
    let isMounted = true;
    const loadDashboardData = async () => {
      try {
        await syncUser();
        if (currentUser?.role === 'candidate') {
          if (fetchCandidateAppliedJobs) await fetchCandidateAppliedJobs();
          if (fetchCandidateSavedJobs) await fetchCandidateSavedJobs();
        } else if (fetchEmployerJobs) {
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
    } else if (currentUser && currentUser.role === 'candidate') {
      if (fetchCandidateAppliedJobs) fetchCandidateAppliedJobs();
      if (fetchCandidateSavedJobs) fetchCandidateSavedJobs();
    }
  }, [currentUser?.id, currentUser?.role, tab]);

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
    if (!currentUser) return;
    const profileId = currentUser.id;
    const shareUrl = `${window.location.origin}/profile/${profileId}`;
    shareContent(
      currentUser.name || 'User Profile',
      `Check out my profile on JobMarket`,
      shareUrl,
      () => showToast('Public profile link copied to clipboard! Anyone on any device can open this link to view your profile. 📋', 'success')
    );
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

  if (['interviews', 'scheduled-interviews'].includes(tab)) {
    return isEmployer ? (
      <EmployerInterviewsTab currentUser={currentUser} showToast={showToast} navigate={navigate} />
    ) : (
      <CandidateInterviewsTab currentUser={currentUser} showToast={showToast} navigate={navigate} />
    );
  }

  return (
    <>
      <div className={`dashboard-page ${['applied', 'resume'].includes(tab) ? 'bg-white-page' : ''}`} style={['applied', 'resume'].includes(tab) ? { background: '#FFFFFF' } : undefined}>
      <div className="container">
        <div className={`dashboard-layout ${['applied', 'applicants', 'candidates', 'manage', 'advertisements', 'banners', 'promotions', 'post-job', 'overview', 'security', 'about', 'support', 'saved', 'profile', 'resume', 'interviews', 'scheduled-interviews'].includes(tab) ? 'hide-sidebar-mobile candidates-tab-active' : ''}`}>
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
                    {currentUser.profilePictureUrl && typeof currentUser.profilePictureUrl === 'string' ? (
                      <img 
                        src={currentUser.profilePictureUrl} 
                        alt={typeof currentUser.name === 'string' ? currentUser.name : 'User'} 
                        referrerPolicy="no-referrer"
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                        onError={(e) => {
                          (e.currentTarget as HTMLElement).style.display = 'none';
                        }}
                      />
                    ) : (
                      getInitials(currentUser.companyName || currentUser.name)
                    )}
                  </div>
                  <div className="dashboard-profile-title">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <h3>{currentUser.companyName || currentUser.name || 'User Profile'}</h3>
                      {(isEmployer || currentUser.aadhaarVerified) && (
                        <svg viewBox="0 0 24 24" fill="currentColor" className="verified-badge">
                          <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                        </svg>
                      )}
                    </div>
                    <p className="profile-handle">@{ (currentUser.companyName || currentUser.name || 'user').toLowerCase().replace(/\s+/g, '') }</p>
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
              {isEmployer ? (
                <button
                  className={`dashboard-nav-item tab-profile ${tab === 'profile' ? 'active' : ''}`}
                  onClick={() => setTab('profile')}
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: 18, height: 18 }}>
                    <rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>
                  </svg>
                  Company Profile
                </button>
              ) : (
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
              )}

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
                    className={`dashboard-nav-item tab-interviews ${tab === 'interviews' ? 'active' : ''}`}
                    onClick={() => setTab('interviews')}
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: 18, height: 18 }}>
                      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
                    </svg>
                    <span className="desktop-only-text">Scheduled Interviews</span>
                    <span className="mobile-only-text">Interviews</span>
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
                  <button
                    className={`dashboard-nav-item tab-interviews ${tab === 'interviews' ? 'active' : ''}`}
                    onClick={() => setTab('interviews')}
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: 18, height: 18 }}>
                      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
                    </svg>
                    <span className="desktop-only-text">Scheduled Interviews</span>
                    <span className="mobile-only-text">Interviews</span>
                  </button>
                  <div style={{ height: 1, background: 'var(--border)', margin: 'var(--space-2) 0' }}></div>
                  <button
                    className={`dashboard-nav-item tab-resume ${tab === 'resume' ? 'active' : ''}`}
                    onClick={() => navigate('/resume')}
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
                className="dashboard-nav-item tab-security"
                onClick={() => navigate('/security')}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: 18, height: 18 }}>
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
                Security & Sessions
              </button>
              <button
                className="dashboard-nav-item tab-about"
                onClick={() => navigate('/about')}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: 18, height: 18 }}>
                  <circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/>
                </svg>
                About Us
              </button>
              <button
                className="dashboard-nav-item tab-support"
                onClick={() => navigate('/contact')}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: 18, height: 18 }}>
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                </svg>
                Help & Support
              </button>
              <div style={{ height: 1, background: 'var(--border)', margin: 'var(--space-2) 0' }}></div>
              <button
                className="dashboard-nav-item danger"
                onClick={handleLogout}
                style={{ color: '#dc2626', display: 'flex', alignItems: 'center', gap: '10px' }}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: 18, height: 18 }}>
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
                </svg>
                {t.logout || 'Log Out'}
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
              <EmployerDashboard tab={tab} currentUser={currentUser} getJobsByEmployer={getJobsByEmployer} deleteJob={deleteJob} updateApplicantStatus={updateApplicantStatus} fetchEmployerJobs={fetchEmployerJobs} showToast={showToast} navigate={navigate} setTab={setTab} t={t} />
            ) : (
              <CandidateDashboard tab={tab} currentUser={currentUser} getAppliedJobs={getAppliedJobs} getSavedJobs={getSavedJobs} toggleSaveJob={toggleSaveJob} setTab={setTab} t={t} />
            )}
          </main>
        </div>
      </div>
    </div>
      {/* Edit Profile Modal (Candidate 4-Step Stepper or Employer Profile Modal) */}
      {currentUser.role !== 'employer' ? (
        <CandidateEditProfileModal 
          isOpen={editModalOpen} 
          onClose={() => setEditModalOpen(false)} 
          onSuccess={() => syncUser()} 
        />
      ) : (
        <EditCompanyProfileModal 
          isOpen={editModalOpen} 
          onClose={() => setEditModalOpen(false)} 
          company={currentUser} 
          onSaveSuccess={() => syncUser()} 
        />
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
  toggleSaveJob: (jobId: string) => boolean;
  setTab: (tab: string) => void;
  t: any;
}

const CandidateDashboard: React.FC<CandidateProps> = ({ tab, currentUser, getAppliedJobs, getSavedJobs, toggleSaveJob, setTab, t }) => {
  const [removedSavedIds, setRemovedSavedIds] = useState<string[]>([]);
  const [filterTab, setFilterTab] = useState<'ALL' | 'INTERVIEW' | 'REVIEW' | 'DECISIONS'>('ALL');
  const appliedJobs = getAppliedJobs();
  const savedJobs = getSavedJobs().filter(j => !removedSavedIds.includes(j.id));

  const interviewCount = appliedJobs.filter(job => {
    const appDetails = currentUser.appliedJobsWithStatus?.find((a: any) => a.jobId === job.id);
    const status = (appDetails?.status || 'applied').toLowerCase();
    return status === 'shortlisted' || status === 'interview' || status === 'interview_scheduled' || status === 'interviewed' || status === 'postponed' || !!appDetails?.interviewDate;
  }).length;

  const reviewCount = appliedJobs.filter(job => {
    const appDetails = currentUser.appliedJobsWithStatus?.find((a: any) => a.jobId === job.id);
    const status = (appDetails?.status || 'applied').toLowerCase();
    return status === 'applied' || status === 'reviewed' || status === 'under_review';
  }).length;

  const decisionsCount = appliedJobs.filter(job => {
    const appDetails = currentUser.appliedJobsWithStatus?.find((a: any) => a.jobId === job.id);
    const status = (appDetails?.status || 'applied').toLowerCase();
    return status === 'hired' || status === 'accepted' || status === 'selected' || status === 'rejected';
  }).length;

  const filteredAppliedJobs = appliedJobs.filter(job => {
    const appDetails = currentUser.appliedJobsWithStatus?.find((a: any) => a.jobId === job.id);
    const status = (appDetails?.status || 'applied').toLowerCase();
    if (filterTab === 'INTERVIEW') {
      return status === 'shortlisted' || status === 'interview' || status === 'interview_scheduled' || status === 'interviewed' || status === 'postponed' || !!appDetails?.interviewDate;
    }
    if (filterTab === 'REVIEW') {
      return status === 'applied' || status === 'reviewed' || status === 'under_review';
    }
    if (filterTab === 'DECISIONS') {
      return status === 'hired' || status === 'accepted' || status === 'selected' || status === 'rejected';
    }
    return true;
  });

  switch (tab) {
    case 'interviews':
    case 'scheduled-interviews':
      return <CandidateInterviewsTab currentUser={currentUser} />;
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
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>
                </svg>
              </div>
              <div className="stat-info"><h3>{currentUser.role === 'candidate' ? 'Active' : 'Verified'}</h3><p>Profile Status</p></div>
            </div>
            <div className="stat-card">
              <div className="stat-icon warning">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
                </svg>
              </div>
              <div className="stat-info"><h3>{(Array.isArray(currentUser.skills) ? currentUser.skills : (typeof currentUser.skills === 'string' ? safeJsonParse(currentUser.skills, []) : [])).length}</h3><p>Skills / Trades</p></div>
            </div>
          </div>

          <div className="dashboard-section">
            <div className="section-header">
              <h2>Recent Applications</h2>
              <button className="btn btn-ghost btn-sm" onClick={() => setTab('applied')}>View All</button>
            </div>
            {appliedJobs.length > 0 ? (
              <div className="table-responsive">
                <table className="dashboard-table">
                  <thead>
                    <tr><th>Job Title</th><th>Company</th><th>Applied</th><th>Status</th></tr>
                  </thead>
                  <tbody>
                    {appliedJobs.slice(0, 5).map(job => {
                      const app = currentUser.appliedJobsWithStatus?.find((a: any) => a.jobId === job.id);
                      return (
                        <tr key={job.id}>
                          <td><strong>{job.title}</strong></td>
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
              <div className="empty-state">
                <div className="empty-state-icon">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                  </svg>
                </div>
                <h3>No applications yet</h3>
                <p>Start exploring and applying to industrial jobs across Maharashtra</p>
                <button className="btn btn-primary btn-sm" onClick={() => window.location.href = '/jobs'}>Browse Jobs</button>
              </div>
            )}
          </div>
        </>
      );

    case 'applied':
      return (
        <div style={{ width: '100%', minHeight: '100vh', background: '#FFFFFF', boxSizing: 'border-box' }}>
          {/* Reusable Mobile-Identical Top Header Bar */}
          <MobileHeader title="Applied Jobs" />

          {/* Main Content Area */}
          <div style={{
            maxWidth: '580px',
            margin: '0 auto',
            padding: '16px',
            paddingBottom: '40px',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
            boxSizing: 'border-box',
          }}>

          {/* Standard Underline Tabular Menu Bar Immediately Under Header */}
          <div 
            className="no-scrollbar applied-tab-bar" 
            style={{ 
              backgroundColor: '#FFFFFF', 
              borderBottom: '1px solid #E2E8F0', 
              display: 'flex', 
              alignItems: 'center', 
              gap: '22px', 
              overflowX: 'auto', 
              scrollbarWidth: 'none', 
              msOverflowStyle: 'none', 
              WebkitOverflowScrolling: 'touch', 
              width: '100%', 
              boxSizing: 'border-box',
              padding: '0 4px',
            }}
          >
            <button
              onClick={() => setFilterTab('ALL')}
              style={{
                background: 'transparent',
                border: 'none',
                padding: '12px 2px',
                cursor: 'pointer',
                fontSize: '12px',
                fontWeight: filterTab === 'ALL' ? 800 : 600,
                color: filterTab === 'ALL' ? '#1B4FDF' : '#64748B',
                position: 'relative',
                whiteSpace: 'nowrap',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              All ({appliedJobs.length})
              {filterTab === 'ALL' && <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '2.5px', backgroundColor: '#1B4FDF', borderTopLeftRadius: '3px', borderTopRightRadius: '3px' }} />}
            </button>

            <button
              onClick={() => setFilterTab('INTERVIEW')}
              style={{
                background: 'transparent',
                border: 'none',
                padding: '12px 2px',
                cursor: 'pointer',
                fontSize: '12px',
                fontWeight: filterTab === 'INTERVIEW' ? 800 : 600,
                color: filterTab === 'INTERVIEW' ? '#1B4FDF' : '#64748B',
                position: 'relative',
                whiteSpace: 'nowrap',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              Interviews ({interviewCount})
              {filterTab === 'INTERVIEW' && <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '2.5px', backgroundColor: '#1B4FDF', borderTopLeftRadius: '3px', borderTopRightRadius: '3px' }} />}
            </button>

            <button
              onClick={() => setFilterTab('REVIEW')}
              style={{
                background: 'transparent',
                border: 'none',
                padding: '12px 2px',
                cursor: 'pointer',
                fontSize: '12px',
                fontWeight: filterTab === 'REVIEW' ? 800 : 600,
                color: filterTab === 'REVIEW' ? '#1B4FDF' : '#64748B',
                position: 'relative',
                whiteSpace: 'nowrap',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              Under Review ({reviewCount})
              {filterTab === 'REVIEW' && <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '2.5px', backgroundColor: '#1B4FDF', borderTopLeftRadius: '3px', borderTopRightRadius: '3px' }} />}
            </button>

            <button
              onClick={() => setFilterTab('DECISIONS')}
              style={{
                background: 'transparent',
                border: 'none',
                padding: '12px 2px',
                cursor: 'pointer',
                fontSize: '12px',
                fontWeight: filterTab === 'DECISIONS' ? 800 : 600,
                color: filterTab === 'DECISIONS' ? '#1B4FDF' : '#64748B',
                position: 'relative',
                whiteSpace: 'nowrap',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              Decisions ({decisionsCount})
              {filterTab === 'DECISIONS' && <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '2.5px', backgroundColor: '#1B4FDF', borderTopLeftRadius: '3px', borderTopRightRadius: '3px' }} />}
            </button>
          </div>

          {filteredAppliedJobs.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {filteredAppliedJobs.map(job => {
                const appDetails = currentUser.appliedJobsWithStatus?.find((a: any) => a.jobId === job.id);
                const status = (appDetails?.status || 'applied').toLowerCase();
                const isShortlisted = status === 'shortlisted' || status === 'interview' || status === 'interview_scheduled';
                
                let badgeBg = '#EFF6FF';
                let badgeBorder = '#DBEAFE';
                let badgeColor = '#1B4FDF';
                let badgeLabel = 'APPLIED';
                let IconComp = Send;

                if (status === 'reviewed' || status === 'under_review') {
                  badgeBg = '#EFF6FF';
                  badgeBorder = '#DBEAFE';
                  badgeColor = '#1B4FDF';
                  badgeLabel = 'UNDER REVIEW';
                  IconComp = Clock;
                } else if (status === 'shortlisted') {
                  badgeBg = '#F0FDF4';
                  badgeBorder = '#BBF7D0';
                  badgeColor = '#15803D';
                  badgeLabel = 'SHORTLISTED';
                  IconComp = Award;
                } else if (status === 'interview' || status === 'interview_scheduled') {
                  badgeBg = '#FEF3C7';
                  badgeBorder = '#FDE68A';
                  badgeColor = '#D97706';
                  badgeLabel = 'INTERVIEW';
                  IconComp = Calendar;
                } else if (status === 'hired' || status === 'selected' || status === 'accepted') {
                  badgeBg = '#DCFCE7';
                  badgeBorder = '#86EFAC';
                  badgeColor = '#16A34A';
                  badgeLabel = 'HIRED';
                  IconComp = CheckCircle2;
                } else if (status === 'rejected') {
                  badgeBg = '#FEF2F2';
                  badgeBorder = '#FECACA';
                  badgeColor = '#DC2626';
                  badgeLabel = 'REJECTED';
                  IconComp = AlertCircle;
                }

                const rawDate = appDetails?.appliedAt || job.postedAt;
                const appliedDateFormatted = rawDate
                  ? new Date(rawDate).toLocaleDateString('en-IN', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    })
                  : 'Recently';

                const hasSalary = Boolean(
                  (job.salary_max && Number(job.salary_max) > 0) ||
                  (job.salaryMax && Number(job.salaryMax) > 0) ||
                  (job.salary_min && Number(job.salary_min) > 0) ||
                  (job.salaryMin && Number(job.salaryMin) > 0)
                );

                return (
                  <Link
                    key={job.id}
                    to={`/job/${job.id}`}
                    className="applied-job-card"
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', width: '100%' }}>
                      <CompanyDefaultLogo
                        logoUrl={job.companyLogo || (job as any).company_logo}
                        companyName={job.company}
                        size={44}
                        borderRadius="6px"
                      />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <h3 style={{ margin: 0, fontSize: '14px', fontWeight: 800, color: '#0F172A', letterSpacing: '-0.15px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {job.title}
                        </h3>
                        <p style={{ margin: '2px 0 0 0', fontSize: '11.5px', fontWeight: 500, color: '#64748B', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {job.company || 'Manufacturing Partner'} • {job.location || 'MIDC Zone'}
                        </p>
                      </div>
                      <ChevronRight size={18} color="#94A3B8" style={{ flexShrink: 0 }} />
                    </div>

                    <div style={{ height: '1px', backgroundColor: '#F1F5F9', margin: '2px 0' }} />

                    <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '6px', width: '100%' }}>
                      {job.location ? (
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '3.5px', background: '#F8FAFC', border: '1px solid #E2E8F0', padding: '3px 7px', borderRadius: '4px', fontSize: '11px', fontWeight: 600, color: '#475569', flexShrink: 1, maxWidth: '100%' }}>
                          <MapPin size={12} color="#64748B" style={{ flexShrink: 0 }} />
                          <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{job.location}</span>
                        </div>
                      ) : null}

                      {hasSalary ? (
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '3.5px', background: '#EFF6FF', border: '1px solid #DBEAFE', padding: '3px 7px', borderRadius: '4px', fontSize: '11px', fontWeight: 700, color: '#1B4FDF', flexShrink: 1, maxWidth: '100%' }}>
                          <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {job.salary_min || job.salaryMin ? `₹${job.salary_min || job.salaryMin}` : ''}
                            {(job.salary_min || job.salaryMin) && (job.salary_max || job.salaryMax) ? ' - ' : ''}
                            {job.salary_max || job.salaryMax ? `₹${job.salary_max || job.salaryMax}` : ''}/mo
                          </span>
                        </div>
                      ) : null}

                      {(job.workMode || job.job_type || job.jobType) ? (
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '3.5px', background: '#F8FAFC', border: '1px solid #E2E8F0', padding: '3px 7px', borderRadius: '4px', fontSize: '11px', fontWeight: 600, color: '#475569', flexShrink: 1, maxWidth: '100%' }}>
                          <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{job.workMode || job.job_type || job.jobType}</span>
                        </div>
                      ) : null}
                    </div>

                    {isShortlisted && (appDetails?.interviewDate || (appDetails as any)?.interview_date) && (
                      <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '6px', padding: '10px', display: 'flex', flexDirection: 'column', gap: '5px', width: '100%', boxSizing: 'border-box', overflow: 'hidden' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '5px', width: '100%' }}>
                          <Calendar size={14} color="#1B4FDF" strokeWidth={2.2} />
                          <span style={{ fontSize: '12px', fontWeight: 800, color: '#0F172A', flex: 1 }}>Interview Scheduled</span>
                          <span style={{ background: '#EFF6FF', border: '1px solid #DBEAFE', padding: '1.5px 5px', borderRadius: '4px', fontSize: '9px', fontWeight: 800, color: '#1B4FDF', flexShrink: 0 }}>CONFIRMED</span>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '5px', width: '100%' }}>
                          <span style={{ fontSize: '10px', fontWeight: 800, color: '#64748B', letterSpacing: '0.5px', flexShrink: 0, marginTop: '1px' }}>DATE & TIME:</span>
                          <span style={{ fontSize: '11px', fontWeight: 800, color: '#0F172A', flex: 1 }}>
                            {appDetails.interviewDate || (appDetails as any).interview_date} {appDetails.interviewTime || (appDetails as any).interview_time ? `(${appDetails.interviewTime || (appDetails as any).interview_time})` : ''}
                          </span>
                        </div>

                        {(appDetails.venueAddress || (appDetails as any).venue_address) && (
                          <div style={{ marginTop: '2px', width: '100%' }}>
                            <span style={{ fontSize: '10px', fontWeight: 800, color: '#64748B', letterSpacing: '0.5px', display: 'block', marginBottom: '2px' }}>VENUE ADDRESS:</span>
                            <p style={{ margin: 0, fontSize: '11px', color: '#334155', lineHeight: 1.45, fontWeight: 600, flexShrink: 1, width: '100%' }}>
                              {appDetails.venueAddress || (appDetails as any).venue_address}
                            </p>
                          </div>
                        )}

                        {(appDetails.mapsLink || (appDetails as any).maps_link) && (
                          <a
                            href={appDetails.mapsLink || (appDetails as any).maps_link}
                            target="_blank"
                            rel="noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              gap: '5px',
                              background: '#1B4FDF',
                              color: '#FFFFFF',
                              padding: '7px 10px',
                              borderRadius: '6px',
                              fontSize: '11.5px',
                              fontWeight: 800,
                              textDecoration: 'none',
                              marginTop: '3px',
                              width: 'fit-content'
                            }}
                          >
                            <MapPin size={13} color="#FFFFFF" />
                            <span>Open Directions in Maps</span>
                            <ExternalLink size={12} color="#FFFFFF" />
                          </a>
                        )}
                      </div>
                    )}

                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '8px', borderTop: '1px solid #F1F5F9', marginTop: '1px', width: '100%' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Clock size={12} color="#94A3B8" />
                        <span style={{ fontSize: '11px', color: '#64748B', fontWeight: 500 }}>
                          Applied {appliedDateFormatted}
                        </span>
                      </div>

                      <span style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                        background: badgeBg,
                        border: `1px solid ${badgeBorder}`,
                        color: badgeColor,
                        padding: '3px 7px',
                        borderRadius: '4px',
                        fontSize: '10px',
                        fontWeight: 800,
                        letterSpacing: '0.2px',
                        flexShrink: 0
                      }}>
                        <IconComp size={11} strokeWidth={2.2} />
                        {badgeLabel}
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>
          ) : (
            <div style={{
              background: '#FFFFFF',
              borderRadius: '6px',
              border: '1px solid #E2E8F0',
              padding: '32px 20px',
              textAlign: 'center',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              marginTop: '8px'
            }}>
              <div style={{ width: '52px', height: '52px', borderRadius: '26px', backgroundColor: '#EFF6FF', border: '1px solid #DBEAFE', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '4px' }}>
                <Briefcase size={26} color="#1B4FDF" strokeWidth={2.2} />
              </div>
              <h3 style={{ fontSize: '15px', fontWeight: 800, color: '#0F172A', margin: 0 }}>
                {filterTab === 'ALL' ? 'No Active Applications' : 'No Applications Found'}
              </h3>
              <p style={{ fontSize: '11.5px', color: '#64748B', margin: 0, maxWidth: '280px', lineHeight: 1.45 }}>
                {filterTab === 'ALL'
                  ? "You haven't submitted any job applications yet. Browse factory vacancies and apply today!"
                  : `No job applications currently match the "${filterTab.toLowerCase()}" filter.`}
              </p>
              <Link
                to="/jobs"
                style={{
                  background: '#1B4FDF',
                  color: '#FFFFFF',
                  padding: '9px 18px',
                  borderRadius: '6px',
                  fontSize: '12px',
                  fontWeight: 800,
                  textDecoration: 'none',
                  marginTop: '6px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                Explore Jobs & Vacancies
              </Link>
            </div>
          )}
        </div>
      </div>
    );

    case 'saved':
      return (
        <>
          <h2 style={{ fontSize: 'var(--fs-2xl)', marginBottom: 'var(--space-6)' }}>Saved Jobs</h2>
          {savedJobs.length > 0 ? (
            <div className="jobs-list">
              {savedJobs.map(job => (
                <JobCard
                  key={job.id}
                  job={job}
                  onSaveToggle={(jobId, isSaved) => {
                    if (!isSaved) {
                      setRemovedSavedIds(prev => [...prev, jobId]);
                    }
                  }}
                />
              ))}
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
      return null;

    default:
      return null;
  }
};

const CandidatesTab: React.FC<{
  showToast: any;
  handleOpenDetails: (applicant: any, jobId: string, jobTitle: string) => void;
}> = ({ showToast, handleOpenDetails }) => {
  const navigate = useNavigate();
  const { getAllCandidates } = useJobs();
  const [candidates, setCandidates] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedTrade, setSelectedTrade] = useState<string>('');
  const [selectedLocation, setSelectedLocation] = useState<string>('');
  const [showFilterPanel, setShowFilterPanel] = useState<boolean>(false);

  const [isSearchFocused, setIsSearchFocused] = useState<boolean>(false);

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

    const query = searchQuery.trim().toLowerCase();

    const matchesSearch = query === '' || 
      (c.name && String(c.name).toLowerCase().includes(query)) ||
      (c.headline && String(c.headline).toLowerCase().includes(query)) ||
      (c.tradeSpecialization && String(c.tradeSpecialization).toLowerCase().includes(query)) ||
      (c.location && String(c.location).toLowerCase().includes(query)) ||
      (c.city && String(c.city).toLowerCase().includes(query)) ||
      (c.midc_zone && String(c.midc_zone).toLowerCase().includes(query)) ||
      skillsList.some((s: string) => String(s).toLowerCase().includes(query));

    const matchesTrade = selectedTrade === '' || c.tradeSpecialization === selectedTrade || c.headline === selectedTrade;
    const matchesLocation = selectedLocation === '' || 
      (c.location && String(c.location).toLowerCase().includes(selectedLocation.toLowerCase())) ||
      (c.city && String(c.city).toLowerCase().includes(selectedLocation.toLowerCase()));

    return matchesSearch && matchesTrade && matchesLocation;
  });

  const uniqueTrades = Array.from(new Set((candidates || []).map(c => c?.tradeSpecialization || c?.headline).filter(Boolean)));
  const uniqueLocations = Array.from(new Set((candidates || []).map(c => c?.location || c?.city).filter(Boolean)));

  const hasActiveFilters = searchQuery !== '' || selectedTrade !== '' || selectedLocation !== '';

  return (
    <div style={{
      width: '100%',
      maxWidth: '680px',
      margin: '0 auto',
      padding: '0px 16px 40px',
      boxSizing: 'border-box'
    }}>
      {/* Sticky Top Search Bar (Exact Mobile App Behavior - 0px Gap) */}
      <div style={{
        position: 'sticky',
        top: 'var(--navbar-height)',
        zIndex: 40,
        backgroundColor: '#FFFFFF',
        margin: '0px -16px 12px -16px',
        padding: '10px 16px 10px 16px',
        borderBottom: '1px solid #E7EBF2',
        boxShadow: '0 2px 4px rgba(15, 23, 42, 0.02)'
      }}>
        <div style={{ 
          background: '#F8FAFC', 
          padding: '0 12px', 
          borderRadius: '8px', 
          border: (isSearchFocused || searchQuery || showFilterPanel || hasActiveFilters) ? '1px solid #1764E8' : '1px solid #E2E8F0', 
          boxShadow: '0 1px 2px rgba(15, 23, 42, 0.04)',
          display: 'flex',
          alignItems: 'center',
          height: '38px',
          width: '100%',
          boxSizing: 'border-box',
          transition: 'border-color 0.15s ease'
        }}>
          <Search size={14} color={isSearchFocused ? '#1764E8' : '#91A0BA'} style={{ marginRight: '8px', flexShrink: 0 }} />
          <input 
            type="text" 
            placeholder="Search by Skills (e.g. CNC, Vernier, AutoCAD)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => setIsSearchFocused(true)}
            onBlur={() => setIsSearchFocused(false)}
            style={{
              flex: 1,
              width: '100%',
              fontSize: '12.5px',
              height: '100%',
              border: 'none',
              outline: 'none',
              background: 'transparent',
              color: '#102A5C',
              fontWeight: 500
            }}
          />
          {searchQuery && (
            <button 
              type="button" 
              onClick={() => setSearchQuery('')}
              style={{
                background: 'none',
                border: 'none',
                color: '#91A0BA',
                cursor: 'pointer',
                fontSize: '13px',
                padding: '4px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginRight: '2px'
              }}
            >
              ✕
            </button>
          )}

          <div style={{ width: '1px', height: '18px', backgroundColor: '#E2E8F0', margin: '0 6px', flexShrink: 0 }} />

          {/* Filter Sliders Action Icon Toggle */}
          <button 
            type="button"
            onClick={() => setShowFilterPanel(prev => !prev)}
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              cursor: 'pointer', 
              padding: '4px',
              background: 'none',
              border: 'none',
              color: showFilterPanel || hasActiveFilters ? '#1764E8' : '#657796',
              position: 'relative'
            }} 
            title="Toggle Filters"
          >
            <SlidersHorizontal size={14} />
            {hasActiveFilters && (
              <div style={{ width: '7px', height: '7px', borderRadius: '50%', backgroundColor: '#1764E8', borderWidth: '1.5px', borderColor: '#FFFFFF', position: 'absolute', top: '0px', right: '0px' }} />
            )}
          </button>
        </div>

        {/* Results Info Row */}
        {(searchQuery || hasActiveFilters) && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginTop: '8px',
            marginBottom: '0px'
          }}>
            <span style={{ fontSize: '11px', fontWeight: 500, color: '#657796' }}>
              Found {filteredCandidates.length} candidate{filteredCandidates.length === 1 ? '' : 's'}
              {selectedTrade ? ` • ${selectedTrade}` : ''}
              {selectedLocation ? ` • ${selectedLocation}` : ''}
            </span>
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                setSelectedTrade('');
                setSelectedLocation('');
              }}
              style={{
                background: 'none',
                border: 'none',
                fontSize: '11px',
                fontWeight: 600,
                color: '#1764E8',
                cursor: 'pointer'
              }}
            >
              Reset All
            </button>
          </div>
        )}
      </div>

      {/* Expandable Filter Drawer Panel */}
      {showFilterPanel && (
        <div style={{
          backgroundColor: '#FFFFFF',
          border: '1px solid #E2E8F0',
          borderRadius: '8px',
          padding: '12px',
          marginBottom: '14px',
          display: 'flex',
          flexDirection: 'column',
          gap: '10px',
          boxShadow: '0 4px 12px rgba(15, 23, 42, 0.06)'
        }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', width: '100%', boxSizing: 'border-box' }}>
            <div>
              <label style={{ fontSize: '11px', fontWeight: '700', color: '#64748B', display: 'block', marginBottom: '4px' }}>Trade Specialization</label>
              <select 
                className="form-select"
                value={selectedTrade}
                onChange={(e) => setSelectedTrade(e.target.value)}
                style={{ width: '100%', fontSize: '12px', height: '34px', borderRadius: '6px', border: '1px solid #E2E8F0' }}
              >
                <option value="">All Specializations</option>
                {uniqueTrades.map(trade => (
                  <option key={trade} value={trade}>{trade}</option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ fontSize: '11px', fontWeight: '700', color: '#64748B', display: 'block', marginBottom: '4px' }}>Location / MIDC Zone</label>
              <select 
                className="form-select"
                value={selectedLocation}
                onChange={(e) => setSelectedLocation(e.target.value)}
                style={{ width: '100%', fontSize: '12px', height: '34px', borderRadius: '6px', border: '1px solid #E2E8F0' }}
              >
                <option value="">All Locations</option>
                {uniqueLocations.map(loc => (
                  <option key={loc} value={loc}>{loc}</option>
                ))}
              </select>
            </div>
          </div>

          {hasActiveFilters && (
            <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: '4px' }}>
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedTrade('');
                  setSelectedLocation('');
                }}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#1764E8',
                  fontWeight: '700',
                  fontSize: '11.5px',
                  cursor: 'pointer',
                  padding: '2px 6px'
                }}
              >
                Reset Filters ✕
              </button>
            </div>
          )}
        </div>
      )}

      {loading ? (
        <div style={{ textAlign: 'center', padding: '48px 16px', background: '#ffffff', borderRadius: '8px', border: '1px solid #E2E8F0', boxShadow: '0 1px 3px rgba(15, 23, 42, 0.05)' }}>
          <div style={{ position: 'relative', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: '12px' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '50%', border: '3px solid #E2E8F0', borderTopColor: '#1764E8', animation: 'spin 0.8s linear infinite' }}></div>
          </div>
          <h4 style={{ margin: '0 0 4px', fontSize: '14px', fontWeight: '700', color: '#102A5C' }}>Loading Candidate Profiles...</h4>
          <p style={{ margin: 0, fontSize: '12px', fontWeight: '500', color: '#64748b' }}>Fetching verified industrial workers and ITI technicians</p>
        </div>
      ) : filteredCandidates.length > 0 ? (
        <div className="candidates-grid-responsive" style={{ gap: '10px' }}>
          {filteredCandidates.map(c => {
            const skillsList: string[] = Array.isArray(c.skills)
              ? c.skills
              : typeof c.skills === 'string'
              ? c.skills.split(',').map((s: string) => s.trim()).filter(Boolean)
              : [];

            const initials = getInitials(c.name || 'Candidate');

            return (
              <div 
                key={c.id || c.email} 
                style={{ 
                  backgroundColor: '#FFFFFF', 
                  border: '1px solid #CBD5E1', 
                  borderRadius: '8px', 
                  padding: '10px', 
                  display: 'flex', 
                  flexDirection: 'column', 
                  alignItems: 'center', 
                  textAlign: 'center', 
                  boxShadow: '0 2px 8px rgba(15, 23, 42, 0.08), 0 1px 3px rgba(15, 23, 42, 0.04)', 
                  position: 'relative', 
                  width: '100%', 
                  minWidth: 0, 
                  maxWidth: '100%', 
                  boxSizing: 'border-box', 
                  overflow: 'hidden', 
                  transition: 'border-color 0.15s ease, box-shadow 0.15s ease' 
                }} 
              >
                {/* Centered Profile Avatar */}
                <div style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '24px',
                  backgroundColor: '#EEF4FF',
                  border: '1px solid #DBEAFE',
                  overflow: 'hidden',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '2px auto 0 auto',
                  flexShrink: 0
                }}>
                  {c.profilePictureUrl && typeof c.profilePictureUrl === 'string' ? (
                    <img 
                      src={c.profilePictureUrl} 
                      alt={c.name} 
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                      onError={(e) => {
                        (e.currentTarget as HTMLElement).style.display = 'none';
                      }}
                    />
                  ) : (
                    <span style={{ fontSize: '15px', fontWeight: '700', color: '#1764E8' }}>
                      {initials}
                    </span>
                  )}
                </div>

                {/* Candidate Name */}
                <h4 style={{
                  margin: '4px 0 2px 0',
                  fontSize: '12.5px',
                  fontWeight: '700',
                  color: '#102A5C',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  width: '100%',
                  textAlign: 'center',
                  lineHeight: '1.2'
                }}>
                  {c.name}
                </h4>

                {/* Role / Specialization */}
                <div style={{
                  fontSize: '10.5px',
                  fontWeight: '500',
                  color: '#1764E8',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  width: '100%',
                  textAlign: 'center',
                  marginTop: '1px',
                  lineHeight: '1.2'
                }}>
                  {c.headline || c.tradeSpecialization || 'Technician'}
                </div>

                {/* Company / Location */}
                <div style={{
                  fontSize: '10px',
                  color: '#657796',
                  fontWeight: '400',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  width: '100%',
                  textAlign: 'center',
                  marginTop: '1px',
                  lineHeight: '1.2'
                }}>
                  {c.location || 'MIDC Zone'}
                </div>

                {/* Skill Badges Row */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '4px',
                  width: '100%',
                  height: '20px',
                  marginTop: '4px',
                  marginBottom: '4px',
                  overflow: 'hidden'
                }}>
                  {skillsList.length > 0 ? (
                    <>
                      <span style={{
                        backgroundColor: '#F8FAFC',
                        border: '1px solid #E2E8F0',
                        color: '#475569',
                        fontSize: '9.5px',
                        fontWeight: '500',
                        padding: '2px 6px',
                        borderRadius: '4px',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        maxWidth: '75%'
                      }}>
                        {skillsList[0]}
                      </span>
                      {skillsList.length > 1 && (
                        <span style={{
                          backgroundColor: '#EEF4FF',
                          border: '1px solid #DBEAFE',
                          color: '#1764E8',
                          fontSize: '9.5px',
                          fontWeight: '700',
                          padding: '2px 5px',
                          borderRadius: '4px',
                          flexShrink: 0
                        }}>
                          +{skillsList.length - 1}
                        </span>
                      )}
                    </>
                  ) : (
                    <span style={{
                      backgroundColor: '#F8FAFC',
                      border: '1px solid #E2E8F0',
                      color: '#475569',
                      fontSize: '9.5px',
                      fontWeight: '500',
                      padding: '2px 6px',
                      borderRadius: '4px'
                    }}>
                      Industrial Trade
                    </span>
                  )}
                </div>

                {/* View Profile Action Button */}
                <button
                  onClick={() => {
                    const targetId = c.id || c.userId || c._id;
                    if (targetId) {
                      navigate(`/profile/${targetId}`);
                    } else {
                      handleOpenDetails({ ...c, userId: c.id }, '', '');
                    }
                  }}
                  style={{
                    width: '100%',
                    height: '28px',
                    backgroundColor: '#F8FAFC',
                    border: '1px solid #E2E8F0',
                    borderRadius: '6px',
                    color: '#1764E8',
                    fontWeight: '600',
                    fontSize: '10.5px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'all 0.15s ease',
                    marginTop: '6px'
                  }}
                >
                  View Profile
                </button>
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
  fetchEmployerJobs?: () => Promise<any>;
  showToast: any;
  navigate: any;
  setTab: (tab: string) => void;
  t: any;
}

const EmployerDashboard: React.FC<EmployerProps> = ({ tab, currentUser, getJobsByEmployer, deleteJob, updateApplicantStatus, fetchEmployerJobs, showToast, navigate, setTab, t }) => {
  const [employerJobs, setEmployerJobs] = useState<Job[]>([]);
  const [loadingJobs, setLoadingJobs] = useState(false);

  const loadEmployerJobs = useCallback(async () => {
    try {
      setLoadingJobs(true);
      const res = await apiFetch('/api/v1/jobs/my-jobs/all');
      const json = await res.json();
      if (res.ok && json.success && Array.isArray(json.data)) {
        setEmployerJobs(json.data);
      }
      if (fetchEmployerJobs) {
        await fetchEmployerJobs();
      }
    } catch (e) {
      console.error('Error fetching employer jobs in EmployerDashboard:', e);
    } finally {
      setLoadingJobs(false);
    }
  }, [fetchEmployerJobs]);

  useEffect(() => {
    loadEmployerJobs();
  }, [loadEmployerJobs, tab]);

  const storeJobs = getJobsByEmployer(currentUser.id);
  const myJobs = employerJobs.length > 0 ? employerJobs : storeJobs;
  const activeJobs = myJobs.filter(j => j.status === 'active' || (j as any).dbStatus === 'APPROVED');
  const [manageActiveTab, setManageActiveTab] = useState<'ALL' | 'APPROVED' | 'PENDING_REVIEW' | 'REJECTED'>('ALL');

  const isPendingJobStatus = (status?: string) => {
    const s = (status || '').toUpperCase();
    return s === 'PENDING' || s === 'PENDING_REVIEW' || s === 'PENDING_APPROVAL' || s === 'DRAFT' || s === 'IN_REVIEW' || s === 'UNDER_APPROVAL' || status === 'pending';
  };

  const isApprovedJobStatus = (status?: string) => {
    const s = (status || '').toUpperCase();
    return s === 'APPROVED' || s === 'ACTIVE' || status === 'active';
  };

  const isRejectedJobStatus = (status?: string) => {
    const s = (status || '').toUpperCase();
    return s === 'REJECTED' || s === 'CLOSED' || status === 'rejected';
  };

  const filteredManageJobs = myJobs.filter((j) => {
    const status = (j.dbStatus || j.status || '') as string;
    if (manageActiveTab === 'ALL') return true;
    if (manageActiveTab === 'APPROVED') return isApprovedJobStatus(status);
    if (manageActiveTab === 'PENDING_REVIEW') return isPendingJobStatus(status);
    if (manageActiveTab === 'REJECTED') return isRejectedJobStatus(status);
    return true;
  });

  const pendingJobsCount = myJobs.filter((j) => isPendingJobStatus((j.dbStatus || j.status || '') as string)).length;
  const approvedJobsCount = myJobs.filter((j) => isApprovedJobStatus((j.dbStatus || j.status || '') as string)).length;
  const rejectedJobsCount = myJobs.filter((j) => isRejectedJobStatus((j.dbStatus || j.status || '') as string)).length;

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
        onClick={() => setTab('interviews')}
        style={{
          flex: 1,
          padding: '7px 4px',
          borderRadius: '6px',
          border: 'none',
          background: ['interviews', 'scheduled-interviews'].includes(tab) ? '#344BFD' : 'transparent',
          color: ['interviews', 'scheduled-interviews'].includes(tab) ? '#ffffff' : '#475569',
          fontWeight: ['interviews', 'scheduled-interviews'].includes(tab) ? '700' : '600',
          fontSize: '11.5px',
          cursor: 'pointer',
          whiteSpace: 'nowrap',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '4px'
        }}
      >
        <span>Interviews</span>
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
    const targetUserId = applicant.userId || applicant.id || applicant.user?.id;
    if (targetUserId) {
      apiFetch(`/api/v1/users/${targetUserId}/view`, { method: 'POST' }).catch(() => {});
    }

    if (jobId && targetUserId) {
      navigate(`/job/${jobId}/applicant/${targetUserId}`);
      return;
    } else if (targetUserId) {
      navigate(`/applicant/${targetUserId}`);
      return;
    }

    setViewWorker({ ...applicant, jobId, jobTitle, job: myJobs.find(j => j.id === jobId) });
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
      const rawApps = job.applicants;
      const apps = Array.isArray(rawApps)
        ? rawApps
        : (typeof rawApps === 'string' ? safeJsonParse(rawApps, []) : []);
      apps.forEach((a: any) => {
        if (a && typeof a === 'object') {
          applicantsList.push({ ...a, jobTitle: job.title, jobId: job.id, job });
        }
      });
    });
    applicantsList.sort((a, b) => new Date(b.appliedAt || 0).getTime() - new Date(a.appliedAt || 0).getTime());
    return applicantsList;
  };

  const recentApplicants = getRecentApplicants();

  const renderContent = () => {
    switch (tab) {
    case 'advertisements':
    case 'banners':
    case 'promotions':
      return <EmployerAdvertisements employerJobs={myJobs} />;
    case 'interviews':
    case 'scheduled-interviews':
      return <EmployerInterviewsTab currentUser={currentUser} showToast={showToast} navigate={navigate} />;
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
        if (rawStatus === 'PENDING_REVIEW' || rawStatus === 'PENDING' || rawStatus === 'UNDER_APPROVAL' || rawStatus === 'DRAFT' || rawStatus === 'IN_REVIEW' || job.status === 'pending') {
          return (
            <span style={{ padding: '3px 8px', borderRadius: '6px', background: '#FFFBEB', color: '#B45309', border: '1px solid #FDE68A', fontSize: '11px', fontWeight: '700', display: 'inline-flex', alignItems: 'center', gap: '4px', whiteSpace: 'nowrap', flexShrink: 0 }}>
              <Clock size={11} color="#B45309" />
              <span>Under Review</span>
            </span>
          );
        }
        if (rawStatus === 'REJECTED' || job.status === 'rejected') {
          return (
            <span style={{ padding: '3px 8px', borderRadius: '6px', background: '#FEF2F2', color: '#DC2626', border: '1px solid #FECACA', fontSize: '11px', fontWeight: '700', display: 'inline-flex', alignItems: 'center', gap: '4px', whiteSpace: 'nowrap', flexShrink: 0 }}>
              <XCircle size={11} color="#DC2626" />
              <span>Rejected</span>
            </span>
          );
        }
        if (rawStatus === 'CLOSED' || job.status === 'closed') {
          return (
            <span style={{ padding: '3px 8px', borderRadius: '6px', background: '#F1F5F9', color: '#64748B', border: '1px solid #CBD5E1', fontSize: '11px', fontWeight: '700', whiteSpace: 'nowrap', flexShrink: 0 }}>
              Closed
            </span>
          );
        }
        return (
          <span style={{ padding: '3px 8px', borderRadius: '6px', background: '#EFF6FF', color: '#1764E8', border: '1px solid #BFDBFE', fontSize: '11px', fontWeight: '700', display: 'inline-flex', alignItems: 'center', gap: '4px', whiteSpace: 'nowrap', flexShrink: 0 }}>
            <CheckCircle2 size={11} color="#1764E8" />
            <span>Active</span>
          </span>
        );
      };

      return (
        <div style={{
          width: '100%',
          maxWidth: '680px',
          margin: '0 auto',
          padding: '0px 16px 40px',
          boxSizing: 'border-box'
        }}>
          {/* Filter Tabs Bar - 100% Mobile App Underline Tab Navigation */}
          <div style={{
            position: 'sticky',
            top: 'var(--navbar-height)',
            zIndex: 40,
            backgroundColor: '#FFFFFF',
            margin: '0px -16px 12px -16px',
            padding: '0px 16px 0px 16px',
            borderBottom: '1px solid #E7EBF2',
            boxShadow: '0 2px 4px rgba(15, 23, 42, 0.02)'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '16px',
              overflowX: 'auto',
              scrollbarWidth: 'none',
              paddingTop: '4px'
            }}>
              {[
                { key: 'ALL', label: 'All Jobs', count: myJobs.length },
                { key: 'APPROVED', label: 'Active', count: approvedJobsCount },
                { key: 'PENDING_REVIEW', label: 'Pending', count: pendingJobsCount },
                { key: 'REJECTED', label: 'Rejected', count: rejectedJobsCount },
              ].map((tab) => {
                const isSelected = manageActiveTab === tab.key;
                return (
                  <button
                    key={tab.key}
                    type="button"
                    onClick={() => setManageActiveTab(tab.key as any)}
                    style={{
                      height: '38px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px',
                      backgroundColor: 'transparent',
                      border: 'none',
                      borderBottom: isSelected ? '2px solid #1764E8' : '2px solid transparent',
                      padding: '0 2px',
                      marginBottom: '-1px',
                      cursor: 'pointer',
                      whiteSpace: 'nowrap',
                      flexShrink: 0
                    }}
                  >
                    <span style={{
                      fontSize: '12.5px',
                      fontWeight: isSelected ? 700 : 600,
                      color: isSelected ? '#1764E8' : '#657796'
                    }}>
                      {tab.label}
                    </span>
                    <span style={{
                      backgroundColor: isSelected ? '#EEF4FF' : '#F1F5F9',
                      color: isSelected ? '#1764E8' : '#657796',
                      padding: '1.5px 6px',
                      borderRadius: '8px',
                      minWidth: '18px',
                      fontSize: '10.5px',
                      fontWeight: isSelected ? 700 : 600,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      {tab.count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {filteredManageJobs.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', width: '100%', boxSizing: 'border-box' }}>
              {filteredManageJobs.map((job) => {
                const pending = isPendingJobStatus((job.dbStatus || job.status || '') as string);
                const isRejected = isRejectedJobStatus((job.dbStatus || job.status || '') as string);
                const logoUri = job.companyLogo || (job as any).company_logo || currentUser?.companyLogo || currentUser?.company_logo;

                const salMin = job.salary_min ?? (job as any).salaryMin ?? (job as any).salary_min;
                const salMax = job.salary_max ?? (job as any).salaryMax ?? (job as any).salary_max;

                let salaryStr = 'Salary Undisclosed';
                if (salMin && salMax) {
                  salaryStr = `₹${Number(salMin).toLocaleString('en-IN')} - ₹${Number(salMax).toLocaleString('en-IN')}`;
                } else if (salMin || salMax) {
                  salaryStr = `₹${Number(salMin || salMax).toLocaleString('en-IN')}`;
                }

                const totalVacancies = job.openings ?? (job as any).openings ?? 1;
                const filledVacancies = job.filledOpenings ?? (job as any).filled_openings ?? 0;
                const actualApplicantCount = typeof (job as any).applicants_count === 'number'
                  ? (job as any).applicants_count
                  : (typeof (job as any).applicantsCount === 'number'
                      ? (job as any).applicantsCount
                      : (Array.isArray(job.applicants) ? job.applicants.length : 0));

                const locationText = job.location || (job as any).midcZone || (job as any).midc_zone || 'MIDC Area';
                const tradeText = (job as any).tradeSpecialization || (job as any).trade_specialization || job.industry;

                return (
                  <div
                    key={job.id}
                    style={{
                      backgroundColor: '#FFFFFF',
                      borderRadius: '8px',
                      border: '1px solid #CBD5E1',
                      padding: '12px',
                      boxShadow: '0 2px 8px rgba(15, 23, 42, 0.08), 0 1px 3px rgba(15, 23, 42, 0.04)',
                      transition: 'border-color 0.15s ease, box-shadow 0.15s ease',
                      width: '100%',
                      boxSizing: 'border-box'
                    }}
                  >
                    {/* Header Row with Logo, Title & Status */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      {/* Company Logo Box */}
                      <div style={{
                        width: '36px',
                        height: '36px',
                        borderRadius: '8px',
                        backgroundColor: '#EEF4FF',
                        border: '1px solid #DBEAFE',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        overflow: 'hidden',
                        flexShrink: 0
                      }}>
                        {logoUri ? (
                          <img src={logoUri} alt={job.company || job.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        ) : (
                          <Building2 size={18} color="#1764E8" strokeWidth={2} />
                        )}
                      </div>

                      {/* Header Text Column */}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '6px' }}>
                          <h4
                            onClick={() => navigate(`/job/${job.id}/applicants`)}
                            style={{
                              fontSize: '13.5px',
                              fontWeight: 700,
                              color: '#102A5C',
                              letterSpacing: '-0.2px',
                              margin: 0,
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap',
                              cursor: 'pointer'
                            }}
                          >
                            {job.title}
                          </h4>
                          {renderJobStatusBadge(job)}
                        </div>

                        <div style={{
                          fontSize: '11px',
                          fontWeight: 500,
                          color: '#657796',
                          marginTop: '1.5px',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap'
                        }}>
                          {job.company || currentUser?.companyName || 'Company'}
                          {tradeText ? ` • ${tradeText}` : ''}
                        </div>
                      </div>
                    </div>

                    {/* Chips / Meta Details Row */}
                    <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '6px', marginTop: '8px' }}>
                      <div style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                        backgroundColor: '#F8FAFC',
                        border: '1px solid #E2E8F0',
                        padding: '2.5px 7px',
                        borderRadius: '6px',
                        fontSize: '10.5px',
                        fontWeight: 500,
                        color: '#657796'
                      }}>
                        <MapPin size={11} color="#657796" />
                        <span>{locationText}</span>
                      </div>

                      <div style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        backgroundColor: '#F8FAFC',
                        border: '1px solid #E2E8F0',
                        padding: '2.5px 7px',
                        borderRadius: '6px',
                        fontSize: '10.5px',
                        fontWeight: 500,
                        color: '#657796'
                      }}>
                        <span>{salaryStr}</span>
                      </div>

                      {(job.jobType || job.job_type) && (
                        <div style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          backgroundColor: '#F8FAFC',
                          border: '1px solid #E2E8F0',
                          padding: '2.5px 7px',
                          borderRadius: '6px',
                          fontSize: '10.5px',
                          fontWeight: 500,
                          color: '#657796'
                        }}>
                          <span>{job.jobType || job.job_type}</span>
                        </div>
                      )}
                    </div>

                    {/* Pending Notice Banner */}
                    {pending && (
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        backgroundColor: '#FFFBEB',
                        border: '1px solid #FDE68A',
                        padding: '5px 8px',
                        borderRadius: '6px',
                        marginTop: '8px',
                        fontSize: '10.5px',
                        fontWeight: 600,
                        color: '#B45309'
                      }}>
                        <Clock size={12} color="#D97706" style={{ flexShrink: 0 }} />
                        <span>Pending Admin Approval — Under review. Will go live once verified.</span>
                      </div>
                    )}

                    {/* Rejected Notice Banner */}
                    {isRejected && (
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        backgroundColor: '#FEF2F2',
                        border: '1px solid #FECACA',
                        padding: '5px 8px',
                        borderRadius: '6px',
                        marginTop: '8px',
                        fontSize: '10.5px',
                        fontWeight: 600,
                        color: '#B91C1C'
                      }}>
                        <XCircle size={12} color="#DC2626" style={{ flexShrink: 0 }} />
                        <span>Job Rejected — {job.rejectReason || (job as any).reject_reason || 'Does not meet posting requirements.'}</span>
                      </div>
                    )}

                    {/* Card Row Divider */}
                    <div style={{ height: '1px', backgroundColor: '#E7EBF2', margin: '9px 0' }} />

                    {/* Action Footer Bar */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '8px' }}>
                      {/* Left: Clean Borderless Text Buttons (Applicants & Vacancies/Openings) */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1, minWidth: 0 }}>
                        <button
                          type="button"
                          onClick={() => navigate(`/job/${job.id}/applicants`)}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4.5px',
                            background: 'none',
                            border: 'none',
                            padding: '4px 0',
                            cursor: 'pointer',
                            color: '#334155',
                            fontSize: '11.5px',
                            fontWeight: 600
                          }}
                          title="View Applicants"
                        >
                          <Users size={13} color="#475569" strokeWidth={2} />
                          <span>{actualApplicantCount} {actualApplicantCount === 1 ? 'Applicant' : 'Applicants'}</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => setManageVacanciesJob(job)}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4.5px',
                            background: 'none',
                            border: 'none',
                            padding: '4px 0',
                            color: '#334155',
                            fontSize: '11.5px',
                            fontWeight: 600,
                            cursor: 'pointer'
                          }}
                          title="Manage Vacancies"
                        >
                          <Briefcase size={12} color="#475569" strokeWidth={2} />
                          <span>{filledVacancies}/{totalVacancies} Vacancies</span>
                        </button>
                      </div>

                      {/* Right: Actions Group (Share, Edit, Delete) */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>

                        {/* Share Button */}
                        <button
                          type="button"
                          onClick={() => {
                            const jobUrl = `${window.location.origin}/job/${job.id}`;
                            shareContent(
                              job.title,
                              `Check out this job: ${job.title} at ${job.company || 'JobMarket'}`,
                              jobUrl,
                              () => showToast('Job link copied to clipboard! 📋', 'success')
                            );
                          }}
                          style={{
                            width: '28px',
                            height: '28px',
                            borderRadius: '6px',
                            backgroundColor: '#F8FAFC',
                            border: '1px solid #E2E8F0',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: '#475569',
                            cursor: 'pointer'
                          }}
                          title="Share Job Link"
                        >
                          <Share2 size={13} color="#475569" strokeWidth={2} />
                        </button>

                        {/* Edit Button */}
                        <button
                          type="button"
                          onClick={() => navigate(`/edit-job/${job.id}`)}
                          style={{
                            width: '28px',
                            height: '28px',
                            borderRadius: '6px',
                            backgroundColor: '#F8FAFC',
                            border: '1px solid #E2E8F0',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: '#475569',
                            cursor: 'pointer'
                          }}
                          title="Edit Job"
                        >
                          <Edit3 size={13} color="#475569" strokeWidth={2} />
                        </button>

                        {/* Delete Button */}
                        <button
                          type="button"
                          onClick={() => handleDelete(job.id)}
                          style={{
                            width: '28px',
                            height: '28px',
                            borderRadius: '6px',
                            backgroundColor: '#FEF2F2',
                            border: '1px solid #FECACA',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: '#EF4444',
                            cursor: 'pointer'
                          }}
                          title="Delete Job"
                        >
                          <Trash2 size={13} color="#EF4444" strokeWidth={2} />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '8px',
              border: '1px solid #E7EBF2',
              padding: '40px 20px',
              textAlign: 'center'
            }}>
              <div style={{
                width: '48px',
                height: '48px',
                borderRadius: '50%',
                backgroundColor: '#EFF6FF',
                color: '#1764E8',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 12px'
              }}>
                <Briefcase size={22} color="#1764E8" strokeWidth={2} />
              </div>
              <div style={{ fontSize: '14px', fontWeight: 700, color: '#102A5C', marginBottom: '4px' }}>
                No Job Postings Found
              </div>
              <div style={{ fontSize: '12px', color: '#657796', marginBottom: '16px' }}>
                {manageActiveTab === 'ALL'
                  ? 'You have not created any job postings yet.'
                  : `No jobs currently found under the "${manageActiveTab === 'PENDING_REVIEW' ? 'Pending' : manageActiveTab === 'APPROVED' ? 'Active' : 'Rejected'}" filter.`}
              </div>
              <button
                type="button"
                onClick={() => setTab('post-job')}
                style={{
                  padding: '8px 16px',
                  borderRadius: '6px',
                  border: 'none',
                  backgroundColor: '#1764E8',
                  color: '#FFFFFF',
                  fontSize: '12.5px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                + Post Your First Job
              </button>
            </div>
          )}
        </div>
      );
    }

    case 'candidates':
      return <CandidatesTab showToast={showToast} handleOpenDetails={handleOpenDetails} />;

    case 'applicants': {
      const allApplicants = getRecentApplicants();
      const filteredApplicants = allApplicants.filter(a => {
        const q = appSearchQuery.toLowerCase().trim();
        const matchesSearch = !q ||
          safeValue(a.name || a.user?.name).toLowerCase().includes(q) ||
          safeValue(a.email || a.user?.email).toLowerCase().includes(q) ||
          safeValue(a.jobTitle).toLowerCase().includes(q) ||
          safeValue(a.headline || a.tradeSpecialization || a.trade_specialization || a.user?.headline).toLowerCase().includes(q) ||
          safeValue(a.location || a.user?.location).toLowerCase().includes(q) ||
          safeValue(a.skills || a.user?.skills).toLowerCase().includes(q);

        const s = (a.status || 'applied').toLowerCase();
        const matchesStatus = appStatusFilter === 'all' || s === appStatusFilter || (appStatusFilter === 'accepted' && s === 'hired') || (appStatusFilter === 'interviewed' && (s === 'interview' || s === 'interviewed'));
        const matchesJob = appJobFilter === 'all' || a.jobId === appJobFilter;
        return matchesSearch && matchesStatus && matchesJob;
      });

      const totalReceived = allApplicants.length;
      const reviewedCount = allApplicants.filter(a => a.status === 'reviewed').length;
      const shortlistedCount = allApplicants.filter(a => a.status === 'shortlisted').length;
      const acceptedCount = allApplicants.filter(a => a.status === 'accepted' || a.status === 'hired').length;

      return (
        <div style={{
          width: '100%',
          maxWidth: '680px',
          margin: '0 auto',
          padding: '0px 16px 40px',
          boxSizing: 'border-box'
        }}>
          {/* Sticky Top Search & Filter Bar Section (0px Gap) */}
          <div style={{
            position: 'sticky',
            top: 'var(--navbar-height)',
            zIndex: 40,
            backgroundColor: '#FFFFFF',
            margin: '0px -16px 12px -16px',
            padding: '10px 16px 8px 16px',
            borderBottom: '1px solid #E7EBF2',
            boxShadow: '0 2px 4px rgba(15, 23, 42, 0.02)'
          }}>
            {/* ── 1. SEARCH BAR ── */}
            <div style={{ position: 'relative', marginBottom: '8px' }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                backgroundColor: '#F8FAFC',
                borderRadius: '8px',
                border: appSearchQuery ? '1px solid #1764E8' : '1px solid #E2E8F0',
                padding: '0 12px',
                height: '38px',
                boxShadow: '0 1px 2px rgba(15, 23, 42, 0.04)',
                transition: 'border-color 0.15s ease'
              }}>
                <Search size={14} color={appSearchQuery ? '#1764E8' : '#91A0BA'} style={{ marginRight: '8px', flexShrink: 0 }} />
                <input
                  type="text"
                  value={appSearchQuery}
                  onChange={(e) => setAppSearchQuery(e.target.value)}
                  placeholder="Search by Skills (e.g. CNC, Vernier, AutoCAD)..."
                  style={{
                    border: 'none',
                    outline: 'none',
                    width: '100%',
                    fontSize: '12.5px',
                    fontWeight: 500,
                    color: '#102A5C',
                    backgroundColor: 'transparent'
                  }}
                />
                {appSearchQuery && (
                  <button
                    type="button"
                    onClick={() => setAppSearchQuery('')}
                    style={{
                      border: 'none',
                      background: 'transparent',
                      cursor: 'pointer',
                      padding: '4px',
                      color: '#94A3B8',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    ✕
                  </button>
                )}
              </div>
            </div>

            {/* ── 2. FILTER & STATUS TABS ROW ── */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              overflowX: 'auto',
              paddingBottom: '2px',
              scrollbarWidth: 'none'
            }}>
              {/* Job Selector Dropdown Pill */}
              <div style={{ flexShrink: 0 }}>
                <select
                  value={appJobFilter}
                  onChange={(e) => setAppJobFilter(e.target.value)}
                  style={{
                    height: '32px',
                    padding: '0 10px',
                    borderRadius: '6px',
                    border: '1px solid #E2E8F0',
                    backgroundColor: '#FFFFFF',
                    fontSize: '12px',
                    fontWeight: 600,
                    color: '#334155',
                    cursor: 'pointer',
                    outline: 'none'
                  }}
                >
                  <option value="all">All Jobs ({activeJobs.length})</option>
                  {activeJobs.map((job) => (
                    <option key={job.id} value={job.id}>
                      {job.title} ({(job.applicants || []).length})
                    </option>
                  ))}
                </select>
              </div>

              {/* Status Tabs with Counts */}
              {[
                { label: 'All', value: 'all', count: allApplicants.length },
                { label: 'Applied', value: 'applied', count: allApplicants.filter((a) => (a.status || 'applied') === 'applied').length },
                { label: 'Shortlisted', value: 'shortlisted', count: allApplicants.filter((a) => a.status === 'shortlisted').length },
                { label: 'Interviewed', value: 'interviewed', count: allApplicants.filter((a) => a.status === 'interviewed' || a.status === 'interview').length },
                { label: 'Hired', value: 'accepted', count: allApplicants.filter((a) => a.status === 'accepted' || a.status === 'hired').length },
                { label: 'Rejected', value: 'rejected', count: allApplicants.filter((a) => a.status === 'rejected').length },
              ].map((tab) => {
                const isActive = appStatusFilter === tab.value;
                return (
                  <button
                    key={tab.value}
                    type="button"
                    onClick={() => setAppStatusFilter(tab.value)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      height: '32px',
                      padding: '0 8px',
                      border: 'none',
                      background: 'transparent',
                      borderBottom: isActive ? '2px solid #1764E8' : '2px solid transparent',
                      color: isActive ? '#1764E8' : '#64748B',
                      fontSize: '12px',
                      fontWeight: isActive ? 700 : 600,
                      cursor: 'pointer',
                      whiteSpace: 'nowrap',
                      flexShrink: 0
                    }}
                  >
                    <span>{tab.label}</span>
                    <span style={{
                      backgroundColor: isActive ? '#EFF6FF' : '#E2E8F0',
                      color: isActive ? '#1764E8' : '#475569',
                      borderRadius: '10px',
                      padding: '1px 6px',
                      fontSize: '11px',
                      fontWeight: 700
                    }}>
                      {tab.count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* ── 3. CANDIDATE APPLICANTS LIST ── */}
          {filteredApplicants.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {filteredApplicants.map((a, i) => {
                const candidateName = safeValue(a.name) || 'Applicant';
                const candidateTrade = safeValue(a.headline || a.tradeSpecialization || a.trade_specialization || a.jobTitle) || 'Candidate';
                const candidateExp = safeValue(a.experience || a.user?.experience);
                const candidateLocation = safeValue(a.location || a.user?.location || (a as any).midc_zone);
                const avatarUri = a.profilePictureUrl || a.user?.profilePictureUrl;
                const shiftVal = a.preferredShift || a.preferred_shift || a.user?.preferredShift ? safeValue(a.preferredShift || a.preferred_shift || a.user?.preferredShift) : '';
                const s = (a.status || 'applied').toLowerCase();

                return (
                  <div
                    key={i}
                    onClick={() => handleOpenDetails(a, a.jobId, a.jobTitle)}
                    style={{
                      backgroundColor: '#FFFFFF',
                      borderRadius: '8px',
                      border: '1px solid #CBD5E1',
                      padding: '12px',
                      boxShadow: '0 2px 8px rgba(15, 23, 42, 0.08), 0 1px 3px rgba(15, 23, 42, 0.04)',
                      cursor: 'pointer',
                      transition: 'border-color 0.15s ease, box-shadow 0.15s ease'
                    }}
                  >
                    {/* Header Row */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      {/* Avatar Box */}
                      <div style={{
                        width: '36px',
                        height: '36px',
                        borderRadius: '8px',
                        backgroundColor: '#EEF4FF',
                        border: '1px solid #DBEAFE',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        overflow: 'hidden',
                        flexShrink: 0
                      }}>
                        {avatarUri ? (
                          <img
                            src={avatarUri}
                            alt={candidateName}
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            onError={(e) => {
                              (e.target as HTMLElement).style.display = 'none';
                            }}
                          />
                        ) : (
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#1764E8" strokeWidth="2">
                            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                            <circle cx="12" cy="7" r="4" />
                          </svg>
                        )}
                      </div>

                      {/* Candidate Info Text */}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '6px' }}>
                          <div style={{
                            fontSize: '13.5px',
                            fontWeight: 700,
                            color: '#102A5C',
                            letterSpacing: '-0.2px',
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis'
                          }}>
                            {candidateName}
                          </div>

                          {/* Status Badge */}
                          <div style={{ flexShrink: 0 }}>
                            {s === 'shortlisted' ? (
                              <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#0284C7', fontSize: '12px', fontWeight: 700 }}>
                                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                                  <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="8.5" cy="7" r="4"/><polyline points="17 11 19 13 23 9"/>
                                </svg>
                                <span>Shortlisted</span>
                              </div>
                            ) : s === 'interviewed' || s === 'interview' ? (
                              <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#9333EA', fontSize: '12px', fontWeight: 700 }}>
                                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
                                </svg>
                                <span>Interview</span>
                              </div>
                            ) : s === 'accepted' || s === 'hired' ? (
                              <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#16A34A', fontSize: '12px', fontWeight: 700 }}>
                                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>
                                </svg>
                                <span>Hired</span>
                              </div>
                            ) : s === 'rejected' ? (
                              <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#DC2626', fontSize: '12px', fontWeight: 700 }}>
                                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                                  <circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/>
                                </svg>
                                <span>Rejected</span>
                              </div>
                            ) : (
                              <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#1764E8', fontSize: '12px', fontWeight: 700 }}>
                                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/>
                                </svg>
                                <span>Applied</span>
                              </div>
                            )}
                          </div>
                        </div>

                        <div style={{
                          fontSize: '11px',
                          fontWeight: 500,
                          color: '#657796',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          marginTop: '2px'
                        }}>
                          {candidateTrade}
                        </div>
                      </div>

                      {/* Chevron Right */}
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#91A0BA" strokeWidth="2" style={{ flexShrink: 0, marginLeft: '4px' }}>
                        <polyline points="9 18 15 12 9 6" />
                      </svg>
                    </div>

                    {/* Meta Chips Row */}
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      flexWrap: 'wrap',
                      gap: '6px',
                      marginTop: '10px'
                    }}>
                      {candidateExp ? (
                        <div style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                          backgroundColor: '#F8FAFC',
                          border: '1px solid #E2E8F0',
                          borderRadius: '4px',
                          padding: '3px 8px',
                          fontSize: '11px',
                          color: '#475569',
                          fontWeight: 500,
                          maxWidth: '100%',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap'
                        }}>
                          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#657796" strokeWidth="2" style={{ flexShrink: 0 }}>
                            <rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>
                          </svg>
                          <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {candidateExp}
                          </span>
                        </div>
                      ) : (
                        <div style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                          backgroundColor: '#F8FAFC',
                          border: '1px solid #E2E8F0',
                          borderRadius: '4px',
                          padding: '3px 8px',
                          fontSize: '11px',
                          color: '#475569',
                          fontWeight: 500
                        }}>
                          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#657796" strokeWidth="2" style={{ flexShrink: 0 }}>
                            <rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>
                          </svg>
                          <span>Not Provided</span>
                        </div>
                      )}

                      {candidateLocation ? (
                        <div style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                          backgroundColor: '#F8FAFC',
                          border: '1px solid #E2E8F0',
                          borderRadius: '4px',
                          padding: '3px 8px',
                          fontSize: '11px',
                          color: '#475569',
                          fontWeight: 500
                        }}>
                          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#657796" strokeWidth="2" style={{ flexShrink: 0 }}>
                            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
                          </svg>
                          <span>{candidateLocation}</span>
                        </div>
                      ) : (
                        <div style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                          backgroundColor: '#F8FAFC',
                          border: '1px solid #E2E8F0',
                          borderRadius: '4px',
                          padding: '3px 8px',
                          fontSize: '11px',
                          color: '#475569',
                          fontWeight: 500
                        }}>
                          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#657796" strokeWidth="2" style={{ flexShrink: 0 }}>
                            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
                          </svg>
                          <span>Not Specified</span>
                        </div>
                      )}

                      {shiftVal && shiftVal !== 'Not Provided' && (
                        <div style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          backgroundColor: '#F8FAFC',
                          border: '1px solid #E2E8F0',
                          borderRadius: '4px',
                          padding: '3px 8px',
                          fontSize: '11px',
                          color: '#475569',
                          fontWeight: 500
                        }}>
                          <span>{shiftVal}</span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '8px',
              border: '1px solid #E7EBF2',
              padding: '40px 20px',
              textAlign: 'center'
            }}>
              <div style={{
                width: '48px',
                height: '48px',
                borderRadius: '50%',
                backgroundColor: '#EFF6FF',
                color: '#1764E8',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 12px'
              }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#1764E8" strokeWidth="2">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
                </svg>
              </div>
              <div style={{ fontSize: '14px', fontWeight: 700, color: '#102A5C', marginBottom: '4px' }}>
                No Applicants Found
              </div>
              <div style={{ fontSize: '12px', color: '#657796' }}>
                {appSearchQuery ? 'Try adjusting your search criteria.' : 'No candidates in this category yet.'}
              </div>
            </div>
          )}
        </div>
      );
    }

      case 'post-job':
        return (
          <JobPostPage isEmbedded={true} onComplete={() => setTab('manage')} />
        );

      case 'profile':
        return <ProfilePage />;

      case 'security':
        return <SecuritySettings />;

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
