import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useJobs } from '../../hooks/useJobs';
import { apiFetch } from '../../utils/api';
import { getInitials, formatNumber, capitalize, timeAgo } from '../../utils/helpers';
import { ResumePreviewModal } from '../../components/profile/ResumePreviewModal';
import { useToast } from '../../hooks/useToast';
import { useStore } from '../../store/useStore';
import { useTranslation } from '../../utils/translations';
import { JobCard } from '../../components/job/JobCard';
import { Job } from '../../types';
import { ProfilePage } from '../profile/ProfilePage';
import { ResumePage } from '../profile/ResumePage';
import { JobPostPage } from '../jobs/JobPostPage';
import { AboutPage } from '../static/AboutPage';
import { ContactPage } from '../static/ContactPage';

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

  const tab = searchParams.get('tab') || 'overview';

  useEffect(() => {
    if (!currentUser) {
      showToast('Please log in to access the dashboard', 'warning');
      navigate('/login');
    }
  }, [currentUser, navigate, showToast]);

  useEffect(() => {
    if (currentUser && currentUser.role === 'employer' && fetchEmployerJobs) {
      fetchEmployerJobs();
    }
  }, [currentUser, fetchEmployerJobs]);

  if (!currentUser) return null;

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
        <div className={`dashboard-layout ${tab === 'candidates' ? 'candidates-tab-active' : ''}`}>
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
                    {currentUser.resume ? t.myResume : t.uploadResume}
                  </button>
                </>
              )}
              <div style={{ height: 1, background: 'var(--border)', margin: 'var(--space-2) 0' }}></div>
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
            {tab === 'about' ? (
              <AboutPage />
            ) : tab === 'support' ? (
              <ContactPage />
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
          <div className="dashboard-welcome">
            <h2>Welcome back, {currentUser.name.split(' ')[0]}! 👋</h2>
            <p>Your Aadhaar is verified. Review factory openings near Chakan MIDC.</p>
          </div>

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
              <div className="stat-info"><h3>{Math.floor(Math.random() * 10) + 5}</h3><p>Profile Views</p></div>
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
          <h2 style={{ fontSize: 'var(--fs-2xl)', marginBottom: 'var(--space-6)' }}>Applied Jobs</h2>
          {appliedJobs.length > 0 ? (
            <div className="jobs-list" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
              {appliedJobs.map(job => {
                const appDetails = currentUser.appliedJobsWithStatus?.find((a: any) => a.jobId === job.id);
                return (
                  <div key={job.id} style={{ 
                    background: 'var(--bg)', 
                    border: '1px solid var(--border)', 
                    borderRadius: '12px', 
                    padding: '20px', 
                    display: 'flex', 
                    flexDirection: 'column', 
                    gap: '16px',
                    boxShadow: 'var(--shadow-sm)'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '16px' }}>
                      <div>
                        <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '700' }}>{job.title}</h3>
                        <p style={{ margin: '4px 0 0', color: 'var(--text-secondary)', fontSize: '14px' }}>
                          {job.company} • {job.location} ({job.workMode})
                        </p>
                      </div>
                      <div>
                        {appDetails && (
                          <span className={`status-badge status-${appDetails.status}`} style={{ fontSize: '13px', padding: '6px 12px' }}>
                            {capitalize(appDetails.status)}
                          </span>
                        )}
                      </div>
                    </div>

                    {appDetails && appDetails.status === 'shortlisted' && appDetails.interviewDate && (
                      <div style={{ 
                        background: 'var(--bg-secondary)', 
                        border: '1px solid var(--border)', 
                        borderRadius: '8px', 
                        padding: '16px',
                        fontSize: '14px',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '10px'
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--primary)', fontWeight: '700' }}>
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
                          </svg>
                          <span>Interview Scheduled!</span>
                        </div>
                        <div className="grid grid-2" style={{ gap: '12px', marginTop: '4px' }}>
                          <div>
                            <strong>Date:</strong> {appDetails.interviewDate}
                          </div>
                          <div>
                            <strong>Time:</strong> {appDetails.interviewTime}
                          </div>
                        </div>
                        <div>
                          <strong>Venue:</strong> {appDetails.venueAddress}
                        </div>
                        {appDetails.mapsLink && (
                          <div style={{ marginTop: '4px' }}>
                            <a 
                              href={appDetails.mapsLink} 
                              target="_blank" 
                              rel="noreferrer" 
                              style={{ 
                                color: 'var(--primary)', 
                                textDecoration: 'none', 
                                fontWeight: '600',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '4px'
                              }}
                            >
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M12 2a8 8 0 0 0-8 8c0 5.25 8 12 8 12s8-6.75 8-12a8 8 0 0 0-8-8z"/><circle cx="12" cy="10" r="3"/>
                              </svg>
                              Open in Google Maps
                            </a>
                          </div>
                        )}
                      </div>
                    )}

                    <div style={{ display: 'flex', justifyContent: 'flex-end', borderTop: '1px solid var(--border)', paddingTop: '12px' }}>
                      <Link to={`/job/${job.id}`} className="btn btn-ghost btn-sm" style={{ padding: '6px 12px', fontSize: '13px' }}>
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
    const loadCandidates = async () => {
      try {
        const data = await getAllCandidates();
        setCandidates(data);
      } catch (err: any) {
        showToast(err.message || 'Failed to load candidates', 'error');
      } finally {
        setLoading(false);
      }
    };
    loadCandidates();
  }, [getAllCandidates, showToast]);

  const filteredCandidates = candidates.filter(c => {
    const matchesSearch = searchQuery === '' || 
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.headline && c.headline.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (c.skills && c.skills.some((s: string) => s.toLowerCase().includes(searchQuery.toLowerCase())));

    const matchesTrade = selectedTrade === '' || c.tradeSpecialization === selectedTrade;
    const matchesLocation = selectedLocation === '' || (c.location && c.location.toLowerCase().includes(selectedLocation.toLowerCase()));

    return matchesSearch && matchesTrade && matchesLocation;
  });

  const uniqueTrades = Array.from(new Set(candidates.map(c => c.tradeSpecialization).filter(Boolean)));
  const uniqueLocations = Array.from(new Set(candidates.map(c => c.location).filter(Boolean)));

  return (
    <>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-6)' }}>
        <h2 style={{ fontSize: 'var(--fs-2xl)' }}>Browse Candidates</h2>
      </div>

      <div style={{ 
        background: 'var(--bg-secondary)', 
        padding: '16px', 
        borderRadius: '8px', 
        border: '1px solid var(--border)', 
        marginBottom: '20px',
        display: 'flex',
        flexWrap: 'wrap',
        gap: '12px'
      }}>
        <div style={{ flex: '1 1 200px' }}>
          <input 
            type="text" 
            placeholder="Search by worker name, skills..."
            className="form-input"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ width: '100%' }}
          />
        </div>
        <div style={{ flex: '1 1 180px' }}>
          <select 
            className="form-select"
            value={selectedTrade}
            onChange={(e) => setSelectedTrade(e.target.value)}
            style={{ width: '100%' }}
          >
            <option value="">All Specializations</option>
            {uniqueTrades.map(trade => (
              <option key={trade} value={trade}>{trade}</option>
            ))}
          </select>
        </div>
        <div style={{ flex: '1 1 180px' }}>
          <select 
            className="form-select"
            value={selectedLocation}
            onChange={(e) => setSelectedLocation(e.target.value)}
            style={{ width: '100%' }}
          >
            <option value="">All Locations</option>
            {uniqueLocations.map(loc => (
              <option key={loc} value={loc}>{loc}</option>
            ))}
          </select>
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px' }}>
          <p>Loading candidate profiles...</p>
        </div>
      ) : filteredCandidates.length > 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {filteredCandidates.map(c => (
            <div key={c.id} className="candidate-card">
              <div className="candidate-card-header">
                <div className="candidate-avatar">
                  {c.profilePictureUrl ? (
                    <img src={c.profilePictureUrl} alt={c.name} />
                  ) : (
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ color: 'white' }}>
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                      <circle cx="12" cy="7" r="4"/>
                    </svg>
                  )}
                </div>
                
                <div className="candidate-header-details">
                  <div className="candidate-name-row">
                    <h4 className="candidate-name">{c.name}</h4>
                    {c.aadhaarVerified && (
                      <span className="candidate-badge">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ marginRight: '2px' }}>
                          <polyline points="20 6 9 17 4 12"/>
                        </svg>
                        Aadhaar Verified
                      </span>
                    )}
                  </div>
                  <p className="candidate-headline">
                    {c.headline || c.tradeSpecialization || 'Industrial Worker'}
                  </p>
                </div>
              </div>

              <div className="candidate-info-body">
                <div className="candidate-meta-list">
                  <div className="candidate-meta-item">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
                    </svg>
                    <span>{c.location || 'Maharashtra, India'}</span>
                  </div>

                  {c.preferredShift && (
                    <div className="candidate-meta-item">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
                      </svg>
                      <span>Preferred Shift: {c.preferredShift} Shift</span>
                    </div>
                  )}

                  {c.experience && c.experience.length > 0 && (
                    <div className="candidate-meta-item">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>
                      </svg>
                      <span>{c.experience[0].role} at {c.experience[0].company} ({c.experience[0].duration || c.experience[0].years || '1'} yrs)</span>
                    </div>
                  )}
                </div>

                {c.skills && c.skills.length > 0 && (
                  <div className="candidate-skills-row">
                    {c.skills.slice(0, 4).map((skill: string, index: number) => (
                      <span key={index} className="candidate-skill-pill">
                        {skill}
                      </span>
                    ))}
                    {c.skills.length > 4 && (
                      <span style={{ fontSize: '11px', color: 'var(--text-tertiary)', padding: '2px' }}>
                        +{c.skills.length - 4} more
                      </span>
                    )}
                  </div>
                )}
              </div>

              <div className="candidate-action-row">
                <button 
                  className="btn btn-primary btn-sm"
                  onClick={() => handleOpenDetails({ ...c, userId: c.id }, '', '')}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
                  </svg>
                  View Profile
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <h3>No candidates match filters</h3>
          <p>Try resetting search or filters to see more workers.</p>
        </div>
      )}
    </>
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
  const totalApplicants = myJobs.reduce((sum, j) => sum + (j.applicants?.length || 0), 0);
  const totalViews = myJobs.reduce((sum, j) => sum + (j.views || 0), 0);
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

  const [activeSubTab, setActiveSubTab] = useState<'profile' | 'hiring'>('profile');
  const [interviewDate, setInterviewDate] = useState('');
  const [interviewTime, setInterviewTime] = useState('');
  const [venueAddress, setVenueAddress] = useState('');
  const [mapsLink, setMapsLink] = useState('');
  const [emailSubject, setEmailSubject] = useState('');
  const [emailMessage, setEmailMessage] = useState('');
  const [isScheduling, setIsScheduling] = useState(false);
  const [isSendingEmail, setIsSendingEmail] = useState(false);

  const handleOpenDetails = (applicant: any, jobId: string, jobTitle: string) => {
    setViewWorker({ ...applicant, jobId, jobTitle });
    setEmailSubject(`Regarding your application for ${jobTitle}`);
    setEmailMessage(`Hi ${applicant.name},\n\nWe would like to connect with you regarding your application for the ${jobTitle} position at ${currentUser?.companyName || currentUser?.name}.\n\nBest regards,\nRecruitment Team\n${currentUser?.companyName || currentUser?.name}`);
    setActiveSubTab('profile');
    setInterviewDate('');
    setInterviewTime('');
    setVenueAddress('');
    setMapsLink('');
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
        applicantsList.push({ ...a, jobTitle: job.title, jobId: job.id });
      });
    });
    applicantsList.sort((a, b) => new Date(b.appliedAt).getTime() - new Date(a.appliedAt).getTime());
    return applicantsList;
  };

  const recentApplicants = getRecentApplicants();

  const renderContent = () => {
    switch (tab) {
    case 'overview':
      return (
        <>
          <div className="dashboard-welcome">
            <h2>Welcome back, {currentUser.name.split(' ')[0]}!</h2>
            <p>GST Verified: {currentUser.gstNumber}. Manage active trade postings below.</p>
          </div>

          <div className="dashboard-stats">
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
              <div className="empty-state" style={{ padding: 'var(--space-8)' }}>
                <p>No applicants yet.</p>
              </div>
            )}
          </div>
        </>
      );

    case 'manage':
      return (
        <>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-6)' }}>
            <h2 style={{ fontSize: 'var(--fs-2xl)' }}>Manage Jobs</h2>
            <button className="btn btn-primary btn-sm" onClick={() => setTab('post-job')}>+ Post New Job</button>
          </div>
          {myJobs.length > 0 ? (
            <div className="manage-jobs-card">
              <div style={{ overflowX: 'auto', width: '100%' }}>
                <table className="manage-table">
                  <thead>
                    <tr><th>Job Title</th><th>Vacancies</th><th>Applicants</th><th>Views</th><th>Status</th><th>Posted</th><th>Actions</th></tr>
                  </thead>
                  <tbody>
                    {myJobs.map(job => (
                      <tr key={job.id}>
                        <td>
                          <span className="table-job-title">{job.title}</span>
                          <br/>
                          <span className="table-company">{job.location} · {job.jobType}</span>
                        </td>
                        <td>
                          <span style={{ fontWeight: '600' }}>{job.filledOpenings || 0}</span> / <span>{job.openings}</span> allotted
                          {job.openings > (job.filledOpenings || 0) ? (
                            <div style={{ fontSize: '11px', color: '#16a34a', marginTop: '2px' }}>
                              ({job.openings - (job.filledOpenings || 0)} open)
                            </div>
                          ) : (
                            <div style={{ fontSize: '11px', color: 'var(--text-tertiary)', marginTop: '2px' }}>
                              (0 open)
                            </div>
                          )}
                        </td>
                        <td>
                          <Link to={`/job/${job.id}/applicants`} style={{ textDecoration: 'none', color: 'var(--primary)', fontWeight: '700' }}>
                            {job.applicants?.length || 0}
                          </Link>
                        </td>
                        <td>{job.views || 0}</td>
                        <td><span className={`status-badge status-${job.status}`}>{capitalize(job.status)}</span></td>
                        <td>{timeAgo(job.postedAt)}</td>
                        <td>
                          <div className="table-actions">
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
          ) : (
            <div className="empty-state">
              <h3>No jobs posted yet</h3>
              <p>Start posting jobs to find the best talent.</p>
              <button className="btn btn-primary mt-4" onClick={() => setTab('post-job')}>Post a Job</button>
            </div>
          )}
        </>
      );

    case 'candidates':
      return <CandidatesTab showToast={showToast} handleOpenDetails={handleOpenDetails} />;

    case 'applicants':
      return (
        <>
          <h2 style={{ fontSize: 'var(--fs-2xl)', marginBottom: 'var(--space-6)' }}>All Applicants</h2>
          {myJobs.filter(j => (j.applicants?.length || 0) > 0).length > 0 ? (
            myJobs.filter(j => (j.applicants?.length || 0) > 0).map(job => (
              <div key={job.id} className="activity-card" style={{ marginBottom: 'var(--space-6)' }}>
                <div className="activity-header">
                  <h3>{job.title} <span style={{ fontWeight: 'normal', color: 'var(--text-tertiary)', fontSize: 'var(--fs-sm)' }}>({job.applicants?.length} applicants)</span></h3>
                </div>
                <div style={{ padding: 'var(--space-4)', display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
                  {job.applicants!.map((a, i) => (
                    <div key={i} className="applicant-card">
                      <div className="applicant-header-wrapper">
                        <div className="applicant-avatar" style={{ overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          {a.profilePictureUrl ? (
                            <img src={a.profilePictureUrl} alt={a.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          ) : (
                            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ color: 'white' }}>
                              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                              <circle cx="12" cy="7" r="4"/>
                            </svg>
                          )}
                        </div>
                        <div className="applicant-info">
                          <h4>{a.name}</h4>
                          <p>{a.email} · Applied {timeAgo(a.appliedAt)}</p>
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', marginTop: '4px', alignItems: 'center' }}>
                            {a.phone && (
                              <a
                                href={`https://wa.me/${a.phone.replace(/[^0-9]/g, '')}`}
                                target="_blank"
                                rel="noreferrer"
                                style={{
                                  color: '#16a34a',
                                  fontWeight: '600',
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '4px',
                                  textDecoration: 'none',
                                  fontSize: '12px'
                                }}
                              >
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                                  <path d="M12.012 2c-5.506 0-9.989 4.478-9.99 9.984a9.96 9.96 0 0 0 1.335 4.978L2 22l5.178-1.357a9.945 9.945 0 0 0 4.83 1.259h.004c5.507 0 9.99-4.479 9.991-9.985.002-2.67-1.035-5.18-2.924-7.07C17.189 3.036 14.678 2 12.012 2zm5.727 14.04c-.314.88-1.52 1.616-2.09 1.706-.51.08-1.18.15-3.83-1.02-3.39-1.51-5.58-5.11-5.75-5.36-.17-.25-1.38-2.03-1.38-3.87 0-1.84.9-2.73 1.22-3.08.27-.3.73-.38.96-.38.22 0 .44.01.63.02.2.01.47-.07.73.61.27.69.93 2.51 1.01 2.68.08.17.14.37.02.6-.11.23-.25.37-.37.52-.12.15-.26.3-.37.42-.12.13-.25.27-.1.54.15.26.68 1.2 1.46 1.94.99.96 1.83 1.25 2.09 1.38.26.13.41.11.56-.06.15-.17.65-.81.82-1.09.18-.28.36-.23.61-.13.25.1 1.6.83 1.88.98.28.14.47.21.54.34.07.13.07.76-.24 1.64z"/>
                                </svg>
                                Chat on WhatsApp ({a.phone})
                              </a>
                            )}
                            <button
                              onClick={() => handleOpenDetails(a, job.id, job.title)}
                              style={{
                                color: 'var(--primary)',
                                fontWeight: '600',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '4px',
                                background: 'transparent',
                                border: 'none',
                                padding: 0,
                                cursor: 'pointer',
                                fontSize: '12px'
                              }}
                            >
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
                              </svg>
                              View Details
                            </button>
                            <span style={{ color: 'var(--text-tertiary)', fontSize: '12px' }}>·</span>
                            {a.resume ? (
                              <button
                                onClick={() => setPreviewResume({ ...a.resume, userId: a.userId })}
                                style={{
                                  color: 'var(--primary)',
                                  fontWeight: '600',
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '4px',
                                  background: 'transparent',
                                  border: 'none',
                                  padding: 0,
                                  cursor: 'pointer',
                                  fontSize: '12px'
                                }}
                              >
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/>
                                </svg>
                                View Resume ({a.resume.name})
                              </button>
                            ) : (
                              <span style={{ fontSize: '12px', color: 'var(--text-tertiary)' }}>No resume attached</span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="applicant-actions">
                        <span className={`status-badge status-${a.status}`}>{capitalize(a.status)}</span>
                        <select
                          value={a.status}
                          onChange={(e) => updateApplicantStatus(job.id, a.userId, e.target.value)}
                          style={{
                            padding: '6px 10px',
                            borderRadius: '6px',
                            border: '1px solid var(--border)',
                            fontSize: '12px',
                            background: 'var(--bg)',
                            cursor: 'pointer',
                            outline: 'none'
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
                  ))}
                </div>
              </div>
            ))
          ) : (
            <div className="empty-state">
              <div className="empty-state-icon">
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="2">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
                </svg>
              </div>
              <h3>No applicants yet</h3>
              <p>Your job listings will attract candidates soon!</p>
            </div>
          )}
        </>
      );

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
      {viewWorker && createPortal(
        <div className="modal-backdrop" onClick={() => setViewWorker(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '600px', width: '100%' }}>
            <div className="modal-header">
              <h3 className="modal-title">Candidate Details</h3>
              <button className="modal-close" onClick={() => setViewWorker(null)}>✕</button>
            </div>
            <div className="modal-body" style={{ maxHeight: '75vh', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              
              {/* Header profile */}
              <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                <div className="applicant-avatar" style={{ width: '60px', height: '60px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--gradient-accent)', overflow: 'hidden', flexShrink: 0 }}>
                  {viewWorker.profilePictureUrl ? (
                    <img src={viewWorker.profilePictureUrl} alt={viewWorker.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ color: 'white' }}>
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                      <circle cx="12" cy="7" r="4"/>
                    </svg>
                  )}
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '700' }}>{viewWorker.name}</h3>
                  <p style={{ margin: '4px 0 0', color: 'var(--text-secondary)' }}>{viewWorker.headline || 'Job Seeker'}</p>
                </div>
              </div>

              {/* Tab Selector */}
              {viewWorker.jobId ? (
                <div style={{ display: 'flex', borderBottom: '1px solid var(--border)', marginBottom: '4px' }}>
                  <button 
                    onClick={() => setActiveSubTab('profile')} 
                    style={{ 
                      flex: 1, 
                      padding: '12px', 
                      background: 'none', 
                      border: 'none', 
                      borderBottom: activeSubTab === 'profile' ? '2px solid var(--primary)' : '2px solid transparent',
                      fontWeight: activeSubTab === 'profile' ? '700' : '500',
                      color: activeSubTab === 'profile' ? 'var(--primary)' : 'var(--text-secondary)',
                      cursor: 'pointer'
                    }}
                  >
                    Candidate Profile
                  </button>
                  <button 
                    onClick={() => setActiveSubTab('hiring')} 
                    style={{ 
                      flex: 1, 
                      padding: '12px', 
                      background: 'none', 
                      border: 'none', 
                      borderBottom: activeSubTab === 'hiring' ? '2px solid var(--primary)' : '2px solid transparent',
                      fontWeight: activeSubTab === 'hiring' ? '700' : '500',
                      color: activeSubTab === 'hiring' ? 'var(--primary)' : 'var(--text-secondary)',
                      cursor: 'pointer'
                    }}
                  >
                    Hiring & Communications
                  </button>
                </div>
              ) : null}

              {activeSubTab === 'profile' ? (
                <>
                  {/* 1. Account Information */}
                  <div>
                    <h4 style={{ margin: '0 0 10px', fontSize: '12px', color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: '700' }}>Account Information</h4>
                    <div className="grid grid-2" style={{ gap: '12px', fontSize: '14px' }}>
                      <div>
                        <strong>Email:</strong> {viewWorker.email}
                      </div>
                      <div>
                        <strong>Phone:</strong> {viewWorker.phone || 'None'}
                      </div>
                      {viewWorker.createdAt && (
                        <div>
                          <strong>Joined:</strong> {new Date(viewWorker.createdAt).toLocaleDateString()}
                        </div>
                      )}
                      <div>
                        <strong>Verification:</strong> {viewWorker.aadhaarVerified ? 'Verified ✓' : 'Unverified'}
                      </div>
                    </div>
                  </div>

                  {/* 2. Professional Profile */}
                  <div>
                    <h4 style={{ margin: '0 0 10px', fontSize: '12px', color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: '700' }}>Professional Profile</h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '14px' }}>
                      <div>
                        <strong>Headline:</strong> {viewWorker.headline || 'None'}
                      </div>
                      <div>
                        <strong>Location:</strong> {viewWorker.location || 'None'}
                      </div>
                      <div>
                        <strong>Trade Specialization:</strong> {viewWorker.tradeSpecialization || 'None'}
                      </div>
                      <div>
                        <strong>Skills:</strong> {viewWorker.skills?.join(', ') || 'None'}
                      </div>
                    </div>
                  </div>

                  {/* 3. Job Preferences */}
                  <div>
                    <h4 style={{ margin: '0 0 10px', fontSize: '12px', color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: '700' }}>Job Preferences</h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '14px' }}>
                      <div><strong>Preferred Shift:</strong> {viewWorker.preferredShift || 'Any'}</div>
                      <div><strong>Requires Bus Facility:</strong> {viewWorker.requiresBus ? 'Yes' : 'No'}</div>
                      <div><strong>Requires Accommodation:</strong> {viewWorker.requiresAccommodation ? 'Yes' : 'No'}</div>
                    </div>
                  </div>

                  {/* 4. Work Experience */}
                  <div>
                    <h4 style={{ margin: '0 0 10px', fontSize: '12px', color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: '700' }}>Work Experience</h4>
                    {viewWorker.experience && viewWorker.experience.length > 0 ? (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {viewWorker.experience.map((exp: any, index: number) => (
                          <div key={index} style={{ background: 'var(--bg-secondary)', padding: '12px', borderRadius: '6px', border: '1px solid var(--border)' }}>
                            <div style={{ fontWeight: '700', fontSize: '14px' }}>{exp.title}</div>
                            <div style={{ color: 'var(--text-secondary)', fontSize: '13px', marginTop: '2px' }}>{exp.company} • {exp.duration}</div>
                            {exp.description && <div style={{ fontSize: '13px', marginTop: '6px', color: 'var(--text-secondary)' }}>{exp.description}</div>}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>No experience details uploaded</p>
                    )}
                  </div>

                  {/* 5. Education History */}
                  <div>
                    <h4 style={{ margin: '0 0 10px', fontSize: '12px', color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: '700' }}>Education History</h4>
                    {viewWorker.education && viewWorker.education.length > 0 ? (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {viewWorker.education.map((edu: any, index: number) => (
                          <div key={index} style={{ background: 'var(--bg-secondary)', padding: '12px', borderRadius: '6px', border: '1px solid var(--border)' }}>
                            <div style={{ fontWeight: '700', fontSize: '14px' }}>{edu.degree}</div>
                            <div style={{ color: 'var(--text-secondary)', fontSize: '13px', marginTop: '2px' }}>{edu.institution} • {edu.year}</div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>No education details uploaded</p>
                    )}
                  </div>

                  {/* 6. Resume / Portfolio */}
                  <div>
                    <h4 style={{ margin: '0 0 10px', fontSize: '12px', color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: '700' }}>Resume Metadata</h4>
                    {viewWorker.resume ? (
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--bg-secondary)', padding: '10px 14px', borderRadius: '4px', fontSize: '13px', border: '1px solid var(--border)' }}>
                        <span>📄 {viewWorker.resume.name} ({viewWorker.resume.size || 'N/A'})</span>
                        <button
                          onClick={() => {
                            setPreviewResume({ ...viewWorker.resume, userId: viewWorker.userId });
                            setViewWorker(null);
                          }}
                          style={{
                            color: 'var(--primary)',
                            fontWeight: '600',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                            background: 'transparent',
                            border: 'none',
                            padding: '4px 8px',
                            cursor: 'pointer',
                            fontSize: '13px'
                          }}
                        >
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/>
                          </svg>
                          View Resume
                        </button>
                      </div>
                    ) : (
                      <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>No resume uploaded</p>
                    )}
                  </div>
                </>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  {/* 1. Update Status */}
                  <div style={{ background: 'var(--bg-secondary)', padding: '16px', borderRadius: '8px', border: '1px solid var(--border)' }}>
                    <h4 style={{ margin: '0 0 12px', fontSize: '13px', textTransform: 'uppercase', color: 'var(--text-tertiary)', fontWeight: '700' }}>Application Status</h4>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <span className={`status-badge status-${viewWorker.status}`} style={{ fontSize: '13px', padding: '6px 12px' }}>
                        {capitalize(viewWorker.status)}
                      </span>
                      <select
                        value={viewWorker.status}
                        onChange={(e) => {
                          updateApplicantStatus(viewWorker.jobId, viewWorker.userId, e.target.value);
                          setViewWorker((prev: any) => ({ ...prev, status: e.target.value }));
                        }}
                        style={{
                          padding: '8px 12px',
                          borderRadius: '6px',
                          border: '1px solid var(--border)',
                          fontSize: '13px',
                          background: 'var(--bg)',
                          cursor: 'pointer',
                          flex: 1
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

                  {/* 2. Direct Actions */}
                  <div className="grid grid-2" style={{ gap: '12px' }}>
                    {viewWorker.phone && (
                      <a
                        href={`https://wa.me/${viewWorker.phone.replace(/[^0-9]/g, '')}`}
                        target="_blank"
                        rel="noreferrer"
                        className="btn"
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '8px',
                          background: '#16a34a',
                          color: 'white',
                          textDecoration: 'none',
                          fontSize: '13px',
                          fontWeight: '600',
                          padding: '10px'
                        }}
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M12.012 2c-5.506 0-9.989 4.478-9.99 9.984a9.96 9.96 0 0 0 1.335 4.978L2 22l5.178-1.357a9.945 9.945 0 0 0 4.83 1.259h.004c5.507 0 9.99-4.479 9.991-9.985.002-2.67-1.035-5.18-2.924-7.07C17.189 3.036 14.678 2 12.012 2zm5.727 14.04c-.314.88-1.52 1.616-2.09 1.706-.51.08-1.18.15-3.83-1.02-3.39-1.51-5.58-5.11-5.75-5.36-.17-.25-1.38-2.03-1.38-3.87 0-1.84.9-2.73 1.22-3.08.27-.3.73-.38.96-.38.22 0 .44.01.63.02.2.01.47-.07.73.61.27.69.93 2.51 1.01 2.68.08.17.14.37.02.6-.11.23-.25.37-.37.52-.12.15-.26.3-.37.42-.12.13-.25.27-.1.54.15.26.68 1.2 1.46 1.94.99.96 1.83 1.25 2.09 1.38.26.13.41.11.56-.06.15-.17.65-.81.82-1.09.18-.28.36-.23.61-.13.25.1 1.6.83 1.88.98.28.14.47.21.54.34.07.13.07.76-.24 1.64z"/>
                        </svg>
                        Chat on WhatsApp
                      </a>
                    )}
                    {viewWorker.resume ? (
                      <button
                        className="btn"
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '8px',
                          background: 'var(--primary)',
                          color: 'white',
                          border: 'none',
                          fontSize: '13px',
                          fontWeight: '600',
                          padding: '10px',
                          cursor: 'pointer'
                        }}
                        onClick={() => {
                          setPreviewResume({ ...viewWorker.resume, userId: viewWorker.userId });
                          setViewWorker(null);
                        }}
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/>
                        </svg>
                        View Resume
                      </button>
                    ) : (
                      <button
                        className="btn"
                        disabled
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '8px',
                          background: 'var(--bg-secondary)',
                          color: 'var(--text-tertiary)',
                          border: '1px solid var(--border)',
                          fontSize: '13px',
                          fontWeight: '600',
                          padding: '10px',
                          cursor: 'not-allowed'
                        }}
                      >
                        No Resume Uploaded
                      </button>
                    )}
                  </div>

                  {/* 3. Schedule Interview */}
                  <div style={{ background: 'var(--bg-secondary)', padding: '16px', borderRadius: '8px', border: '1px solid var(--border)' }}>
                    <h4 style={{ margin: '0 0 12px', fontSize: '13px', textTransform: 'uppercase', color: 'var(--text-tertiary)', fontWeight: '700' }}>Schedule Interview</h4>
                    <form onSubmit={async (e) => {
                      e.preventDefault();
                      if (!interviewDate || !interviewTime || !venueAddress) {
                        showToast('Please fill in date, time, and address details', 'error');
                        return;
                      }
                      setIsScheduling(true);
                      try {
                        const res = await scheduleInterview(viewWorker.jobId, viewWorker.userId, {
                          interviewDate,
                          interviewTime,
                          venueAddress,
                          mapsLink
                        });
                        if (res.success) {
                          showToast('Interview scheduled and candidate notified via email', 'success');
                          setViewWorker((prev: any) => ({ ...prev, status: 'shortlisted' }));
                          setInterviewDate('');
                          setInterviewTime('');
                          setVenueAddress('');
                          setMapsLink('');
                        } else {
                          showToast(res.error || 'Failed to schedule interview', 'error');
                        }
                      } catch (err: any) {
                        showToast(err.message || 'An error occurred', 'error');
                      } finally {
                        setIsScheduling(false);
                      }
                    }} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      <div className="grid grid-2" style={{ gap: '12px' }}>
                        <div className="form-group">
                          <label className="form-label" style={{ fontSize: '12px', marginBottom: '4px' }}>Date</label>
                          <input
                            type="date"
                            className="form-input"
                            required
                            value={interviewDate}
                            onChange={(e) => setInterviewDate(e.target.value)}
                            style={{ padding: '8px' }}
                          />
                        </div>
                        <div className="form-group">
                          <label className="form-label" style={{ fontSize: '12px', marginBottom: '4px' }}>Time</label>
                          <input
                            type="time"
                            className="form-input"
                            required
                            value={interviewTime}
                            onChange={(e) => setInterviewTime(e.target.value)}
                            style={{ padding: '8px' }}
                          />
                        </div>
                      </div>
                      <div className="form-group">
                        <label className="form-label" style={{ fontSize: '12px', marginBottom: '4px' }}>Venue Address</label>
                        <textarea
                          className="form-input"
                          required
                          rows={2}
                          value={venueAddress}
                          placeholder="e.g. Factory Office Main Gate, Chakan MIDC, Pune"
                          onChange={(e) => setVenueAddress(e.target.value)}
                          style={{ padding: '8px', minHeight: '60px', fontFamily: 'inherit' }}
                        />
                      </div>
                      <div className="form-group">
                        <label className="form-label" style={{ fontSize: '12px', marginBottom: '4px' }}>Google Maps Link (Optional)</label>
                        <input
                          type="url"
                          className="form-input"
                          value={mapsLink}
                          placeholder="e.g. https://maps.app.goo.gl/..."
                          onChange={(e) => setMapsLink(e.target.value)}
                          style={{ padding: '8px' }}
                        />
                      </div>
                      <button type="submit" className="btn btn-primary" style={{ padding: '10px', fontSize: '13px', fontWeight: '600' }} disabled={isScheduling}>
                        {isScheduling ? 'Scheduling...' : 'Schedule & Send Email'}
                      </button>
                    </form>
                  </div>

                  {/* 4. Send Custom Email */}
                  <div style={{ background: 'var(--bg-secondary)', padding: '16px', borderRadius: '8px', border: '1px solid var(--border)' }}>
                    <h4 style={{ margin: '0 0 12px', fontSize: '13px', textTransform: 'uppercase', color: 'var(--text-tertiary)', fontWeight: '700' }}>Send Email to Worker</h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      <div className="form-group">
                        <label className="form-label" style={{ fontSize: '12px', marginBottom: '4px' }}>Subject</label>
                        <input
                          type="text"
                          className="form-input"
                          required
                          value={emailSubject}
                          onChange={(e) => setEmailSubject(e.target.value)}
                          style={{ padding: '8px' }}
                        />
                      </div>
                      <div className="form-group">
                        <label className="form-label" style={{ fontSize: '12px', marginBottom: '4px' }}>Message Body</label>
                        <textarea
                          className="form-input"
                          required
                          rows={4}
                          value={emailMessage}
                          onChange={(e) => setEmailMessage(e.target.value)}
                          style={{ padding: '8px', minHeight: '100px', fontFamily: 'inherit', fontSize: '13px' }}
                        />
                      </div>
                      
                      <div className="grid grid-2" style={{ gap: '12px', marginTop: '4px' }}>
                        <a
                          href={`https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(viewWorker.email)}&su=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailMessage)}`}
                          target="_blank"
                          rel="noreferrer"
                          className="btn btn-primary"
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '8px',
                            textDecoration: 'none',
                            padding: '10px',
                            fontSize: '13px',
                            fontWeight: '600'
                          }}
                        >
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
                          </svg>
                          Open in Gmail
                        </a>
                        <a
                          href={`mailto:${viewWorker.email}?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailMessage)}`}
                          className="btn"
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '8px',
                            background: 'var(--bg-secondary)',
                            color: 'var(--text)',
                            border: '1px solid var(--border)',
                            textDecoration: 'none',
                            padding: '10px',
                            fontSize: '13px',
                            fontWeight: '600'
                          }}
                        >
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                            <polyline points="22,6 12,13 2,6"/>
                          </svg>
                          Open Default Mail App
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              )}

            </div>
          </div>
        </div>,
        document.body
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
                <div style={{ width: '48px', height: '48px', flexShrink: 0, borderRadius: '6px', overflow: 'hidden', background: '#344BFD', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {manageVacanciesJob.companyLogo && manageVacanciesJob.companyLogo.startsWith('http') ? (
                    <img src={manageVacanciesJob.companyLogo} alt={manageVacanciesJob.company} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <svg viewBox="0 0 100 100" style={{ width: '100%', height: '100%', display: 'block' }}>
                      <rect width="100" height="100" fill="#344BFD" />
                      <path d="M20 90 L20 40 L45 40 L45 90 Z" fill="#ffffff" opacity="0.15" />
                      <path d="M40 90 L40 25 L70 25 L70 90 Z" fill="#ffffff" opacity="0.25" />
                      <path d="M65 90 L65 50 L85 50 L85 90 Z" fill="#ffffff" opacity="0.1" />
                      <rect x="47" y="32" width="6" height="8" fill="#ffffff" opacity="0.7" />
                      <rect x="57" y="32" width="6" height="8" fill="#ffffff" opacity="0.7" />
                      <rect x="47" y="45" width="6" height="8" fill="#ffffff" opacity="0.7" />
                      <rect x="57" y="45" width="6" height="8" fill="#ffffff" opacity="0.7" />
                      <rect x="47" y="58" width="6" height="8" fill="#ffffff" opacity="0.7" />
                      <rect x="57" y="58" width="6" height="8" fill="#ffffff" opacity="0.7" />
                    </svg>
                  )}
                </div>

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
