import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useJobs } from '../../hooks/useJobs';
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

export const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { currentUser, updateUser } = useAuth();
  const { getAppliedJobs, getSavedJobs, getJobsByEmployer, deleteJob, updateApplicantStatus } = useJobs();
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

  const tab = searchParams.get('tab') || 'overview';

  useEffect(() => {
    if (!currentUser) {
      showToast('Please log in to access the dashboard', 'warning');
      navigate('/login');
    }
  }, [currentUser, navigate, showToast]);

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
    setEditModalOpen(true);
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.origin + '/#/profile/' + currentUser.id);
    showToast('Profile link copied to clipboard!', 'success');
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      showToast('Name is required', 'error');
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
        requiresAccommodation
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
        <div className="dashboard-layout">
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
                  <div className="dashboard-avatar">
                    {getInitials(currentUser.companyName || currentUser.name)}
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
                    {currentUser.resume && currentUser.resume.url ? t.myResume : t.uploadResume}
                  </button>
                </>
              )}
            </nav>
          </aside>

          {/* Main Dashboard Content */}
          <main className="dashboard-main">
            {isEmployer ? (
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
                <div className="form-group">
                  <label className="form-label">Full Name</label>
                  <input
                    type="text"
                    className="form-input"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>
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
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
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

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)', margin: 'var(--space-2) 0' }}>
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
            <div className="jobs-list">
              {appliedJobs.map(job => <JobCard key={job.id} job={job} />)}
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
            <h2>Welcome back, {currentUser.name.split(' ')[0]}! 🏢</h2>
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
                        <td><span className="table-job-title">{a.name}</span><br/><span className="table-company">{a.email}</span></td>
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
                    <tr><th>Job Title</th><th>Applicants</th><th>Views</th><th>Status</th><th>Posted</th><th>Actions</th></tr>
                  </thead>
                  <tbody>
                    {myJobs.map(job => (
                      <tr key={job.id}>
                        <td>
                          <span className="table-job-title">{job.title}</span>
                          <br/>
                          <span className="table-company">{job.location} · {job.jobType}</span>
                        </td>
                        <td><strong>{job.applicants?.length || 0}</strong></td>
                        <td>{job.views || 0}</td>
                        <td><span className={`status-badge status-${job.status}`}>{capitalize(job.status)}</span></td>
                        <td>{timeAgo(job.postedAt)}</td>
                        <td>
                          <div className="table-actions">
                            <button className="table-action-btn" title="Edit" onClick={() => navigate(`/edit-job/${job.id}`)}>
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                              </svg>
                            </button>
                            <button className="table-action-btn" title="View" onClick={() => navigate(`/job/${job.id}`)}>
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
                              </svg>
                            </button>
                            <button className="table-action-btn danger" title="Delete" onClick={() => handleDelete(job.id)}>
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
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
                    <div key={i} className="applicant-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
                      <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                        <div className="applicant-avatar">{getInitials(a.name)}</div>
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
                            {a.resume ? (
                              <button
                                onClick={() => setPreviewResume(a.resume)}
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
                      <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
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
        <ResumePreviewModal resume={previewResume} onClose={() => setPreviewResume(null)} />
      )}
    </>
  );
};


export default DashboardPage;
