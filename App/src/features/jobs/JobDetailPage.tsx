import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useParams, useNavigate, useLocation, Link } from 'react-router-dom';
import { useJobs } from '../../hooks/useJobs';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../hooks/useToast';
import { formatSalary, timeAgo, formatNumber, capitalize, shareContent } from '../../utils/helpers';
import { useStore } from '../../store/useStore';
import { useTranslation } from '../../utils/translations';
import { CompanyDefaultLogo } from '../../components/company/CompanyDefaultLogo';
import { JobLocationMapPreview } from '../../components/map/JobLocationMapPreview';
import { JobApplyModal } from '../../components/jobs/JobApplyModal';
import { Zap, Calendar, FileText, CheckCircle2, Phone, Smartphone } from 'lucide-react';

const ensureArray = (val: any): string[] => {
  if (Array.isArray(val)) return val.filter(Boolean).map(String);
  if (typeof val === 'string' && val.trim()) {
    try {
      const parsed = JSON.parse(val);
      if (Array.isArray(parsed)) return parsed.filter(Boolean).map(String);
      return [val.trim()];
    } catch (e) {
      return [val.trim()];
    }
  }
  return [];
};

export const JobDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { getJobById, fetchJobById, applyToJob, toggleSaveJob, isJobSaved } = useJobs();
  const { currentUser } = useAuth();
  const { showToast } = useToast();
  const { state } = useStore();
  const t = useTranslation(state.language);

  // Unconditional Hooks Declaration at Top (Strict Rules of Hooks)
  const [directJob, setDirectJob] = useState<any>(null);
  const storeJob = id ? getJobById(id) : undefined;
  const job = storeJob || directJob || undefined;

  const [isApplying, setIsApplying] = useState(false);
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [showWalkInPassModal, setShowWalkInPassModal] = useState(false);
  const [isFetchingJob, setIsFetchingJob] = useState(!job);
  const [localSavedOverride, setLocalSavedOverride] = useState<boolean | null>(null);
  const [showAppBanner, setShowAppBanner] = useState<boolean>(false);

  const isMobileDevice = typeof navigator !== 'undefined' && /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
  const jobIdStr = job?.id;
  const storeSaved = jobIdStr ? isJobSaved(jobIdStr) : false;
  const saved = localSavedOverride !== null ? localSavedOverride : storeSaved;

  useEffect(() => {
    let isMounted = true;
    if (id && fetchJobById) {
      if (!job) setIsFetchingJob(true);
      fetchJobById(id)
        .then((data: any) => {
          if (isMounted && data) setDirectJob(data);
        })
        .finally(() => {
          if (isMounted) setIsFetchingJob(false);
        });
    }
    return () => {
      isMounted = false;
    };
  }, [id]);

  useEffect(() => {
    setLocalSavedOverride(null);
  }, [storeSaved]);

  useEffect(() => {
    if (!location.hash || location.hash !== '#apply') {
      window.scrollTo(0, 0);
      document.body.scrollTop = 0;
      document.documentElement.scrollTop = 0;
    }
  }, [id]);

  useEffect(() => {
    if (location.hash === '#apply' || window.location.hash === '#apply') {
      const timer = setTimeout(() => {
        const applyEl = document.getElementById('apply');
        if (applyEl) {
          applyEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 150);
      return () => clearTimeout(timer);
    }
  }, [location.hash]);

  useEffect(() => {
    if (isMobileDevice && job) {
      setShowAppBanner(true);
    }
  }, [isMobileDevice, job]);

  const handleBackToJobs = (e?: React.MouseEvent) => {
    if (e) e.preventDefault();
    try {
      if (window.history.state && window.history.state.idx > 0) {
        navigate(-1);
      } else {
        navigate('/jobs');
      }
    } catch (err) {
      navigate('/jobs');
    }
  };

  const handleSave = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (!currentUser) {
      showToast('Please login to save jobs', 'info');
      navigate('/login');
      return;
    }
    if (!job) return;
    const newSavedStatus = toggleSaveJob(job.id);
    setLocalSavedOverride(newSavedStatus);
    showToast(newSavedStatus ? 'Job saved successfully!' : 'Job removed from saved list', 'success');
  };

  const handleWhatsAppShare = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (!job) return;
    const text = `Check out this job opening: ${job.title} at ${job.company} (${job.location}). Apply here: ${window.location.href}`;
    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  const handleApply = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (!currentUser) {
      showToast('Please login as a candidate to apply for jobs', 'info');
      navigate('/login');
      return;
    }
    if (currentUser.role !== 'candidate') {
      showToast('Only candidate accounts can apply for jobs', 'error');
      return;
    }
    if (!job) return;

    if (job.hiringMethod === 'WALK_IN' || job.isWalkIn) {
      setShowWalkInPassModal(true);
      return;
    }

    setShowApplyModal(true);
  };

  const handleConfirmApply = async () => {
    if (!job) return;
    setIsApplying(true);
    try {
      const res = await applyToJob(job.id);
      if (res.success) {
        showToast('Application submitted successfully!', 'success');
        setShowApplyModal(false);
      } else {
        showToast(res.error || 'Failed to submit application', 'error');
      }
    } catch (err: any) {
      showToast(err.message || 'Error submitting application', 'error');
    } finally {
      setIsApplying(false);
    }
  };

  if (isFetchingJob && !job) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '65vh', gap: '16px', padding: '32px' }}>
        <div style={{ width: '48px', height: '48px', borderRadius: '50%', border: '4px solid #cbd5e1', borderTopColor: '#344BFD', animation: 'spin 0.8s linear infinite' }}></div>
        <div style={{ fontSize: '15px', fontWeight: '800', color: '#0f172a' }}>Loading Job Details...</div>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="container" style={{ padding: '100px 0', textAlign: 'center' }}>
        <div className="empty-state">
          <h3>Job Not Found</h3>
          <p>This job listing may have been removed or doesn't exist.</p>
          <Link to="/jobs" className="btn btn-primary mt-4">Browse Jobs</Link>
        </div>
      </div>
    );
  }

  const safeApplicants = ensureArray(job.applicants);
  const safeResponsibilities = ensureArray(job.responsibilities);
  const safeRequirements = ensureArray(job.requirements);
  const safeSkills = ensureArray(job.skills);
  const safePerks = ensureArray(job.perks);

  const applicantRecord = safeApplicants.find((a: any) => a && (a.userId === currentUser?.id || a.id === currentUser?.id));
  const hasApplied = Boolean(
    currentUser && (
      currentUser.appliedJobs?.includes(job.id) ||
      currentUser.appliedJobsWithStatus?.some((app: any) => app.jobId === job.id) ||
      applicantRecord
    )
  );

  const appDetails = currentUser?.appliedJobsWithStatus?.find((a: any) => a.jobId === job.id) || (applicantRecord ? {
    jobId: job.id,
    status: applicantRecord.status || 'applied',
    appliedAt: applicantRecord.appliedAt
  } : null);

  const realApplicantCount = safeApplicants.length;

  // Dynamic Profile Strength Calculation based on completed user profile fields
  let profileStrength = 0;
  if (currentUser) {
    if (currentUser.name) profileStrength += 20;
    if (currentUser.email) profileStrength += 20;
    if (currentUser.phone) profileStrength += 20;
    if (currentUser.location) profileStrength += 15;
    if (currentUser.tradeSpecialization || currentUser.headline) profileStrength += 15;
    if (currentUser.resume) profileStrength += 10;
  }
  if (profileStrength === 0) profileStrength = 75;

  const isOwner = currentUser && currentUser.role === 'employer' && job.employerId === currentUser.id;

  const handleOpenInApp = () => {
    if (!job) return;
    try {
      localStorage.setItem('jobmarket_app_installed', 'true');
    } catch (e) {}

    const isAndroid = /Android/i.test(navigator.userAgent);
    const jobId = job.id;
    const webUrl = `${window.location.origin}/job/${jobId}`;
    const customSchemeUrl = `jobmarket://job/${jobId}`;
    const androidIntentUrl = `intent://job/${jobId}#Intent;scheme=jobmarket;package=com.jobmarket.mobileapp;S.browser_fallback_url=${encodeURIComponent(webUrl)};end;`;

    // 1. Trigger high-priority DOM anchor click for OS deep scheme handler
    const link = document.createElement('a');
    link.style.display = 'none';
    link.href = isAndroid ? androidIntentUrl : customSchemeUrl;
    document.body.appendChild(link);
    link.click();

    // 2. Direct location assignment fallback
    setTimeout(() => {
      window.location.href = customSchemeUrl;
    }, 200);

    setTimeout(() => {
      if (document.body.contains(link)) {
        document.body.removeChild(link);
      }
    }, 800);
  };

  return (
    <div className="detail-page-container" style={{ background: 'var(--bg)', minHeight: '100vh', padding: '16px 16px 140px 16px' }}>
      <div style={{ maxWidth: '1100px', margin: '0 auto', width: '100%' }}>
        {/* Compact Top App Handoff Banner Bar */}
        {showAppBanner && (
          <div className="app-handoff-banner-bar">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1, minWidth: 0 }}>
              <Smartphone size={16} color="#2563EB" style={{ flexShrink: 0 }} />
              <span className="app-handoff-title">
                Better experience in the app
              </span>
            </div>

            <div className="app-handoff-actions">
              <button
                className="app-handoff-btn"
                onClick={handleOpenInApp}
              >
                <span>Open App</span>
              </button>
              <button
                className="app-handoff-close-btn"
                onClick={() => setShowAppBanner(false)}
                title="Dismiss"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#94A3B8" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
          </div>
        )}

        <style>{`
          .app-handoff-banner-bar {
            background: #FFFFFF;
            border-radius: 8px;
            padding: 7px 12px;
            width: 100%;
            box-shadow: 0 2px 10px rgba(15, 23, 42, 0.05);
            border: 1px solid #CBD5E1;
            display: flex;
            flex-direction: row;
            align-items: center;
            justify-content: space-between;
            gap: 10px;
            margin-bottom: 12px;
            box-sizing: border-box;
          }

          .app-handoff-title {
            font-size: 13px;
            font-weight: 700;
            color: #0F172A;
            line-height: 1.2;
            letter-spacing: -0.1px;
          }

          .app-handoff-actions {
            display: flex;
            align-items: center;
            gap: 8px;
            flex-shrink: 0;
          }

          .app-handoff-btn {
            background: #344BFD;
            color: #FFFFFF;
            border: none;
            border-radius: 6px;
            padding: 5px 12px;
            font-size: 12px;
            font-weight: 700;
            cursor: pointer;
            box-shadow: 0 2px 6px rgba(52, 75, 253, 0.2);
            white-space: nowrap;
            display: flex;
            align-items: center;
            gap: 4px;
            transition: all 0.15s ease;
          }

          .app-handoff-btn:hover {
            background: #1A2EB8;
            box-shadow: 0 4px 14px rgba(52, 75, 253, 0.35);
          }

          .app-handoff-btn:active {
            transform: scale(0.98);
          }

          .app-handoff-close-btn {
            background: transparent;
            color: #94A3B8;
            border: none;
            padding: 4px;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            border-radius: 6px;
            transition: background 0.15s ease;
          }

          .app-handoff-close-btn:hover {
            background: #F1F5F9;
            color: #64748B;
          }

          .detail-sticky-bar {
            display: none !important;
          }
          @media (max-width: 768px) {
          #page-content {
            transform: none !important;
          }
          .detail-page-container {
            position: relative !important;
            padding: 16px 16px 180px 16px !important;
            min-height: 100vh !important;
            background: var(--bg) !important;
          }
          .detail-sticky-bar {
            display: flex !important;
            position: fixed !important;
            bottom: calc(64px + env(safe-area-inset-bottom, 0px)) !important;
            left: 0 !important;
            right: 0 !important;
            height: 68px !important;
            background: var(--surface, rgba(255, 255, 255, 0.98)) !important;
            backdrop-filter: blur(12px) !important;
            -webkit-backdrop-filter: blur(12px) !important;
            border-top: 1px solid var(--border-light, #E2E8F0) !important;
            padding: 10px 16px !important;
            z-index: 20000 !important;
            justify-content: center !important;
            box-shadow: 0 -4px 20px rgba(0, 0, 0, 0.12) !important;
            align-items: center !important;
          }
        }
      `}</style>
        {/* Back Link */}
        <button
          onClick={handleBackToJobs}
          style={{
            background: 'transparent',
            border: 'none',
            color: '#344BFD',
            fontSize: '15px',
            fontWeight: '600',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            marginBottom: '16px',
            padding: 0
          }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/>
          </svg>
          Back to Jobs
        </button>

        {/* 2-Column Responsive Layout */}
        <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
          
          {/* LEFT COLUMN: Main details card (Width: flex fill) */}
          <div style={{ flex: '1 1 600px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{
              background: '#ffffff',
              border: '1.5px solid #cbd5e1',
              borderRadius: '4px',
              padding: 'clamp(18px, 4vw, 28px)',
              position: 'relative',
              boxShadow: '0 8px 24px rgba(15, 23, 42, 0.08), 0 2px 6px rgba(15, 23, 42, 0.04)'
            }}>
              {/* 1. Header: Title full width */}
              <div style={{ marginBottom: '16px' }}>
                <h1 style={{
                  fontSize: 'clamp(20px, 4vw, 26px)',
                  fontWeight: '800',
                  color: '#0F172A',
                  margin: '0 0 14px 0',
                  lineHeight: '1.3',
                  letterSpacing: '-0.02em'
                }}>
                  {job.title}
                </h1>

                {/* Application Status Banner (visible to applied candidates - right under Title) */}
                {hasApplied && appDetails && (
                  <div style={{ 
                    background: '#ffffff', 
                    border: '1.5px solid #344BFD', 
                    borderRadius: '4px', 
                    padding: '16px 18px', 
                    marginBottom: '16px',
                    boxShadow: '0 4px 14px rgba(52, 75, 253, 0.08)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '12px'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '15px', fontWeight: '700', color: '#0F172A' }}>
                        Application Status:
                      </span>
                      <span className={`status-badge status-${appDetails.status}`} style={{ fontSize: '13px', padding: '6px 12px', borderRadius: '4px' }}>
                        {capitalize(appDetails.status)}
                      </span>
                    </div>

                    {(appDetails as any)?.status === 'shortlisted' && (appDetails as any)?.interviewDate && (
                      <div style={{ 
                        background: '#f8fafc', 
                        border: '1px solid #cbd5e1', 
                        borderRadius: '4px', 
                        padding: '14px',
                        fontSize: '13px',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '8px',
                        marginTop: '4px'
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#344BFD', fontWeight: '700' }}>
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
                          </svg>
                          <span>Interview Scheduled!</span>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginTop: '2px' }}>
                          <div>
                            <strong>Date:</strong> {(appDetails as any).interviewDate}
                          </div>
                          <div>
                            <strong>Time:</strong> {(appDetails as any).interviewTime}
                          </div>
                        </div>
                        <div>
                          <strong>Venue:</strong> {(appDetails as any).venueAddress}
                        </div>
                        {(appDetails as any).mapsLink && (
                          <div style={{ marginTop: '2px' }}>
                            <a 
                              href={(appDetails as any).mapsLink} 
                              target="_blank" 
                              rel="noreferrer" 
                              style={{ 
                                color: '#344BFD', 
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
                  </div>
                )}

                {/* Company Row & Work Mode Badges */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: '10px',
                  padding: '12px 16px',
                  background: '#ffffff',
                  borderRadius: '4px',
                  border: '1.5px solid #cbd5e1',
                  boxShadow: '0 2px 8px rgba(15, 23, 42, 0.04)'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <CompanyDefaultLogo 
                      logoUrl={job.companyLogo || (job as any).company_logo} 
                      companyName={job.company} 
                      size={44} 
                      borderRadius="4px"
                    />
                    <span style={{
                      fontSize: '15px',
                      fontWeight: '700',
                      color: '#1E293B',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '5px'
                    }}>
                      {job.company}
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="#2563eb" stroke="#ffffff" strokeWidth="2">
                        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>
                      </svg>
                    </span>
                  </div>

                  {/* Work Mode & Job Type & Hiring Method Badges */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                    <span style={{
                      background: '#EFF6FF',
                      color: '#1D4ED8',
                      border: '1px solid #DBEAFE',
                      fontSize: '11.5px',
                      fontWeight: '700',
                      padding: '3px 10px',
                      borderRadius: '4px'
                    }}>
                      {job.workMode || 'Onsite'}
                    </span>
                    <span style={{
                      background: '#F1F5F9',
                      color: '#334155',
                      border: '1px solid #E2E8F0',
                      fontSize: '11.5px',
                      fontWeight: '600',
                      padding: '3px 10px',
                      borderRadius: '4px'
                    }}>
                      {job.jobType}
                    </span>
                    <span style={{
                      background: job.hiringMethod === 'WALK_IN' || job.isWalkIn ? '#FEF3C7' : (job.hiringMethod === 'SCHEDULED_INTERVIEW' ? '#ECFDF5' : '#EFF6FF'),
                      color: job.hiringMethod === 'WALK_IN' || job.isWalkIn ? '#D97706' : (job.hiringMethod === 'SCHEDULED_INTERVIEW' ? '#059669' : '#1D4ED8'),
                      border: '1px solid currentColor',
                      fontSize: '11.5px',
                      fontWeight: '700',
                      padding: '3px 10px',
                      borderRadius: '4px',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '5px'
                    }}>
                      {job.hiringMethod === 'WALK_IN' || job.isWalkIn ? (
                        <><Zap size={13} /> Walk-in Drive</>
                      ) : job.hiringMethod === 'SCHEDULED_INTERVIEW' ? (
                        <><Calendar size={13} /> Scheduled Interview</>
                      ) : (
                        <><FileText size={13} /> Standard Hiring</>
                      )}
                    </span>
                  </div>
                </div>
              </div>

              {/* Detail Specs Responsive Grid (Location, Experience, Salary, Applicants, Date) */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
                gap: '10px 16px',
                marginBottom: '24px',
                padding: '14px 16px',
                background: '#ffffff',
                borderRadius: '4px',
                border: '1.5px solid #cbd5e1',
                boxShadow: '0 2px 8px rgba(15, 23, 42, 0.04)'
              }}>
                {/* Location */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#334155', fontSize: '13px', fontWeight: '500' }}>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2.2" style={{ flexShrink: 0 }}>
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                    <circle cx="12" cy="10" r="3" />
                  </svg>
                  <span>{job.location}</span>
                </div>

                {/* Experience */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#334155', fontSize: '13px', fontWeight: '500' }}>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2.2" style={{ flexShrink: 0 }}>
                    <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
                    <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
                  </svg>
                  <span>{job.experienceRequired === false ? 'No Experience Required' : `${job.minExperience}-${job.maxExperience} Years`}</span>
                </div>

                {/* Education Requirement */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#334155', fontSize: '13px', fontWeight: '500' }}>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2.2" style={{ flexShrink: 0 }}>
                    <path d="M22 10v6M2 10l10-5 10 5-10 5z"/>
                    <path d="M6 12v5c3 3 9 3 12 0v-5"/>
                  </svg>
                  <span>{job.educationRequirement || (job as any).education_requirement || (typeof (job as any).education === 'string' ? (job as any).education : '10th Pass')}</span>
                </div>

                {/* Salary */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#047857', fontSize: '13px', fontWeight: '700' }}>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#059669" strokeWidth="2.2" style={{ flexShrink: 0 }}>
                    <rect x="2" y="6" width="20" height="12" rx="2" />
                    <circle cx="12" cy="12" r="2" />
                  </svg>
                  <span>{job.discloseSalary === false ? 'Salary Not Disclosed' : formatSalary(job.salaryMin, job.salaryMax)}</span>
                </div>

                {/* Applicants */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#334155', fontSize: '13px', fontWeight: '500' }}>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2.2" style={{ flexShrink: 0 }}>
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                    <circle cx="9" cy="7" r="4" />
                    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                  </svg>
                  <span>{realApplicantCount} {realApplicantCount === 1 ? 'Applicant' : 'Applicants'}</span>
                </div>

                {/* Date Posted */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#64748B', fontSize: '13px', fontWeight: '500' }}>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#64748B" strokeWidth="2" style={{ flexShrink: 0 }}>
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
                  </svg>
                  <span>{timeAgo(job.postedAt)}</span>
                </div>
              </div>

              {/* Action buttons (Save, Share, WhatsApp) - Moved after Specs grid */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                flexWrap: 'wrap',
                marginBottom: '24px'
              }}>
                <button
                  onClick={handleSave}
                  style={{
                    background: saved ? '#2563eb' : '#F8FAFC',
                    border: saved ? '1px solid #2563eb' : '1px solid #CBD5E1',
                    padding: '8px 16px',
                    cursor: 'pointer',
                    color: saved ? '#ffffff' : '#475569',
                    borderRadius: '6px',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    fontSize: '13px',
                    fontWeight: '700',
                    transition: 'all 0.15s ease',
                    boxShadow: saved ? '0 2px 4px rgba(37,99,235,0.25)' : 'none'
                  }}
                >
                  <svg width="15" height="15" viewBox="0 0 24 24" fill={saved ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2.2">
                    <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
                  </svg>
                  {saved ? 'Saved ✓' : 'Save'}
                </button>

                <button
                  onClick={handleWhatsAppShare}
                  style={{
                    background: '#E8FBF0',
                    border: '1px solid #A7F3D0',
                    padding: '8px 14px',
                    cursor: 'pointer',
                    color: '#059669',
                    borderRadius: '4px',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    fontSize: '13px',
                    fontWeight: '700',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.514 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.724-1.455L0 24zm6.59-4.846c1.6.95 3.18 1.449 4.825 1.451 5.436.002 9.858-4.42 9.86-9.86.002-2.638-1.016-5.119-2.868-6.973C16.611 1.916 14.135.897 11.5.897c-5.444 0-9.866 4.418-9.87 9.858-.002 1.8.48 3.55 1.396 5.11l-1.002 3.658 3.743-.981c1.517.828 3.09 1.258 4.29 1.272zM17.65 14.39c-.3-.15-1.78-.88-2.05-.98-.28-.1-.48-.15-.68.15-.2.3-.78.98-.95 1.18-.18.2-.35.23-.65.08-1.1-.55-1.92-.95-2.67-2.25-.19-.34.19-.31.54-1.01.06-.11.03-.21-.02-.31-.05-.1-.45-1.08-.62-1.48-.16-.39-.33-.34-.45-.34H10.1c-.22 0-.58.08-.88.4-.3.32-1.15 1.13-1.15 2.75 0 1.63 1.19 3.2 1.35 3.42.17.22 2.33 3.56 5.65 5 .79.34 1.4.55 1.88.71.8.25 1.52.21 2.1.13.64-.1 1.78-.73 2.03-1.43.25-.7.25-1.29.17-1.43-.07-.15-.27-.23-.57-.38z"/>
                  </svg>
                  WhatsApp
                </button>
              </div>

              {/* Walk-in Drive Event Details Card */}
              {(job.hiringMethod === 'WALK_IN' || job.isWalkIn) && (
                <div style={{
                  background: '#FFFBEB',
                  border: '1.5px solid #FCD34D',
                  borderRadius: '4px',
                  padding: '16px',
                  marginBottom: '24px'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                    <Zap size={18} style={{ color: '#D97706' }} />
                    <h3 style={{ fontSize: '16px', fontWeight: '800', color: '#92400E', margin: 0 }}>
                      Direct Walk-In Drive Details
                    </h3>
                  </div>
                  <p style={{ fontSize: '13px', color: '#78350F', margin: '0 0 12px 0' }}>
                    Candidates can walk in directly to the venue with required documents.
                  </p>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '10px', fontSize: '13px', color: '#451A03' }}>
                    {job.walkInDate && (
                      <div><strong>Date:</strong> {job.walkInDate}</div>
                    )}
                    {(job.walkInStartTime || job.walkInTime) && (
                      <div><strong>Timing:</strong> {job.walkInStartTime && job.walkInEndTime ? `${job.walkInStartTime} to ${job.walkInEndTime}` : job.walkInTime}</div>
                    )}
                    {job.walkInContactPerson && (
                      <div><strong>Contact Person:</strong> {job.walkInContactPerson}</div>
                    )}
                    {job.walkInContactNumber && (
                      <div><strong>Contact No:</strong> <a href={`tel:${job.walkInContactNumber}`} style={{ color: '#D97706', fontWeight: '700', textDecoration: 'none' }}>{job.walkInContactNumber}</a></div>
                    )}
                  </div>
                  {job.interviewAddress && (
                    <div style={{ marginTop: '10px', fontSize: '13px', color: '#451A03' }}>
                      <strong>Venue Address:</strong> {job.interviewAddress}
                    </div>
                  )}
                  {job.walkInDocuments && (
                    <div style={{ marginTop: '8px', fontSize: '12.5px', color: '#92400E', background: '#FEF3C7', padding: '8px 12px', borderRadius: '6px' }}>
                      <strong>Documents to Carry:</strong> {job.walkInDocuments}
                    </div>
                  )}
                </div>
              )}

              {/* Job Description section */}
              <div style={{ marginBottom: '24px' }}>
                <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#0F172A', marginBottom: '8px' }}>
                  Job Description
                </h3>
                <p style={{
                  fontSize: '14px',
                  color: '#475569',
                  lineHeight: '1.6',
                  margin: 0,
                  whiteSpace: 'pre-wrap'
                }}>
                  {job.description || "We are looking for a skilled professional to join our growing team. You will be responsible for executing key operations, ensuring high quality and performance..."}
                </p>
              </div>

              {/* Key Responsibilities section */}
              <div style={{ marginBottom: '24px' }}>
                <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#0F172A', marginBottom: '8px' }}>
                  Key Responsibilities:
                </h3>
                <ul style={{
                  fontSize: '14px',
                  color: '#475569',
                  lineHeight: '1.6',
                  margin: 0,
                  paddingLeft: '20px',
                  listStyleType: 'disc'
                }}>
                  {safeResponsibilities.length > 0 ? (
                    safeResponsibilities.map((r, i) => <li key={i} style={{ marginBottom: '6px' }}>{r}</li>)
                  ) : (
                    <>
                      <li style={{ marginBottom: '6px' }}>Execute operational deliverables inline with product quality directives.</li>
                      <li style={{ marginBottom: '6px' }}>Optimize systems and processes for maximum speed and scale.</li>
                      <li style={{ marginBottom: '6px' }}>Collaborate with cross-functional team members to deliver projects.</li>
                      <li style={{ marginBottom: '6px' }}>Write clean, maintainable, and well-documented documentation/code.</li>
                    </>
                  )}
                </ul>
              </div>

              {/* Skills section */}
              <div style={{ marginBottom: '24px' }}>
                <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#0F172A', marginBottom: '8px' }}>
                  Skills:
                </h3>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {safeSkills.map(s => (
                    <span
                      key={s}
                      style={{
                        background: '#EEF1FF',
                        color: '#344BFD',
                        fontSize: '12px',
                        fontWeight: '600',
                        padding: '6px 12px',
                        borderRadius: '4px',
                        border: '1px solid #C7CEFE'
                      }}
                    >
                      {s}
                    </span>
                  ))}
                </div>
              </div>

              {/* Perks & Benefits section */}
              <div style={{ marginBottom: '12px' }}>
                <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#0F172A', marginBottom: '8px' }}>
                  Perk & Benefit :
                </h3>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {job.overtime && (
                    <span style={{ background: '#EEF1FF', color: '#344BFD', fontSize: '12px', fontWeight: '600', padding: '6px 12px', borderRadius: '4px', border: '1px solid #C7CEFE' }}>
                      Overtime (OT) Pay
                    </span>
                  )}
                  {job.canteen && (
                    <span style={{ background: '#EEF1FF', color: '#344BFD', fontSize: '12px', fontWeight: '600', padding: '6px 12px', borderRadius: '4px', border: '1px solid #C7CEFE' }}>
                      Subsidized Canteen
                    </span>
                  )}
                  {job.busFacility && (
                    <span style={{ background: '#EEF1FF', color: '#344BFD', fontSize: '12px', fontWeight: '600', padding: '6px 12px', borderRadius: '4px', border: '1px solid #C7CEFE' }}>
                      Bus Transport
                    </span>
                  )}
                  {job.accommodation && (
                    <span style={{ background: '#EEF1FF', color: '#344BFD', fontSize: '12px', fontWeight: '600', padding: '6px 12px', borderRadius: '4px', border: '1px solid #C7CEFE' }}>
                      Free Stay Hostel
                    </span>
                  )}
                  <span style={{ background: '#EEF1FF', color: '#344BFD', fontSize: '12px', fontWeight: '600', padding: '6px 12px', borderRadius: '4px', border: '1px solid #C7CEFE' }}>
                    Competitive salary
                  </span>
                  <span style={{ background: '#EEF1FF', color: '#344BFD', fontSize: '12px', fontWeight: '600', padding: '6px 12px', borderRadius: '4px', border: '1px solid #C7CEFE' }}>
                    Health insurance
                  </span>
                  <span style={{ background: '#EEF1FF', color: '#344BFD', fontSize: '12px', fontWeight: '600', padding: '6px 12px', borderRadius: '4px', border: '1px solid #C7CEFE' }}>
                    Flexible working
                  </span>
                  <span style={{ background: '#EEF1FF', color: '#344BFD', fontSize: '12px', fontWeight: '600', padding: '6px 12px', borderRadius: '4px', border: '1px solid #C7CEFE' }}>
                    Professional development budget
                  </span>
                  <span style={{ background: '#EEF1FF', color: '#344BFD', fontSize: '12px', fontWeight: '600', padding: '6px 12px', borderRadius: '4px', border: '1px solid #C7CEFE' }}>
                    Modern office
                  </span>
                </div>
              </div>

              {/* Pinmarked Job Location Map Preview */}
              {job.latitude && job.longitude && (
                <div style={{ marginTop: '28px', marginBottom: '12px' }}>
                  <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#0F172A', marginBottom: '8px' }}>
                    Job Location & Interactive Map
                  </h3>
                  <JobLocationMapPreview
                    latitude={job.latitude}
                    longitude={job.longitude}
                    locationName={job.location || job.title}
                    height="300px"
                  />
                </div>
              )}
            </div>
          </div>

          {/* RIGHT COLUMN: Sidebar cards (Width: 320px, stacks below on mobile) */}
          <div className="detail-sidebar" style={{ flex: '0 0 320px', width: '320px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
            
            {/* CARD 1: Apply for this job */}
            <div id="apply" className="detail-sidebar-apply-card" style={{
              background: '#ffffff',
              border: '1.5px solid #cbd5e1',
              borderRadius: '4px',
              padding: '24px',
              display: 'flex',
              flexDirection: 'column',
              gap: '16px',
              boxShadow: '0 8px 24px rgba(15, 23, 42, 0.08)'
            }}>
              <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#0F172A', margin: 0 }}>Apply for this job</h3>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#64748B', fontSize: '14px' }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" />
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
                </svg>
                <span>{realApplicantCount} {realApplicantCount === 1 ? 'Applicant' : 'Applicants'}</span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#64748B', fontSize: '14px' }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
                </svg>
                <span>Most applicants heard back within 2 weeks</span>
              </div>

              {/* Profile Strength Yellow Alert Box */}
              <div style={{
                background: '#FFFBEB',
                border: '1px solid #FDE68A',
                borderRadius: '4px',
                padding: '12px',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: '700', color: '#B45309' }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
                  </svg>
                  Profile Strength: {profileStrength}%
                </div>
                {/* Progress bar */}
                <div style={{ background: '#F59E0B22', height: '6px', borderRadius: '3px', overflow: 'hidden' }}>
                  <div style={{ background: '#344BFD', width: `${profileStrength}%`, height: '100%' }}></div>
                </div>
                <span style={{ fontSize: '11px', color: '#78350F' }}>Complete your profile to increase your chances</span>
              </div>

              {/* Apply Button */}
              {hasApplied ? (
                <>
                  <button
                    disabled
                    style={{
                      width: '100%',
                      background: '#EEF1FF',
                      color: '#344BFD',
                      border: 'none',
                      padding: '14px',
                      borderRadius: '4px',
                      fontWeight: '700',
                      fontSize: '15px',
                      cursor: 'not-allowed',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px'
                    }}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                      <polyline points="20 6 9 17 4 12"/>
                    </svg>
                    Already Applied
                  </button>
                  {appDetails && (
                    <div style={{ 
                      marginTop: '12px', 
                      padding: '12px', 
                      background: '#EEF1FF', 
                      borderRadius: '4px', 
                      border: '1px solid #E2E8F0',
                      fontSize: '13px'
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: appDetails.status === 'shortlisted' ? '8px' : '0' }}>
                        <strong>Status:</strong>
                        <span className={`status-badge status-${appDetails.status}`} style={{ fontSize: '11px', padding: '3px 8px', borderRadius: '4px' }}>
                          {capitalize(appDetails.status)}
                        </span>
                      </div>
                      {(appDetails as any)?.status === 'shortlisted' && (appDetails as any)?.interviewDate && (
                        <div style={{ fontSize: '12px', color: '#475569', display: 'flex', flexDirection: 'column', gap: '4px', borderTop: '1px solid #CBD5E1', paddingTop: '6px' }}>
                          <div>📅 <strong>{(appDetails as any).interviewDate}</strong> at <strong>{(appDetails as any).interviewTime}</strong></div>
                          <div style={{ fontSize: '11px', color: '#64748B' }}>📍 {(appDetails as any).venueAddress}</div>
                        </div>
                      )}
                    </div>
                  )}
                </>
              ) : isOwner ? (
                <button
                  onClick={() => navigate('/dashboard?tab=manage')}
                  style={{
                    width: '100%',
                    background: '#344BFD',
                    color: '#ffffff',
                    border: 'none',
                    padding: '14px',
                    borderRadius: '4px',
                    fontWeight: '700',
                    fontSize: '15px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px'
                  }}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <rect x="2" y="7" width="20" height="14" rx="2" ry="2"/>
                    <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>
                  </svg>
                  Manage Job
                </button>
              ) : (
                <button
                  onClick={handleApply}
                  disabled={isApplying}
                  style={{
                    width: '100%',
                    background: isApplying ? '#6366F1' : '#344BFD',
                    color: '#ffffff',
                    border: 'none',
                    padding: '14px',
                    borderRadius: '4px',
                    fontWeight: '700',
                    fontSize: '15px',
                    cursor: isApplying ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    opacity: isApplying ? 0.85 : 1,
                    transition: 'background 0.2s ease'
                  }}
                  onMouseEnter={(e) => { if (!isApplying) e.currentTarget.style.background = '#1A2EB8'; }}
                  onMouseLeave={(e) => { if (!isApplying) e.currentTarget.style.background = '#344BFD'; }}
                >
                  {isApplying ? (
                    <>
                      <svg className="animate-spin" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" style={{ animation: 'spin 0.8s linear infinite' }}>
                        <circle cx="12" cy="12" r="10" stroke="rgba(255,255,255,0.3)" />
                        <path d="M4 12a8 8 0 0 1 8-8" stroke="currentColor" strokeLinecap="round" />
                      </svg>
                      Applying...
                    </>
                  ) : (
                    'Apply Now'
                  )}
                </button>
              )}

              <span style={{ fontSize: '11px', color: '#94A3B8', textAlign: 'center' }}>
                {job.acceptResume === false 
                  ? 'Note: Resume upload is not required for this position.' 
                  : 'By applying, your profile & resume will be submitted.'}
              </span>
            </div>

            {/* CARD 2: Job Summary */}
            <div style={{
              background: '#ffffff',
              border: '1.5px solid #cbd5e1',
              borderRadius: '4px',
              padding: '20px',
              display: 'flex',
              flexDirection: 'column',
              gap: '16px',
              boxShadow: '0 4px 14px rgba(15, 23, 42, 0.05)'
            }}>
              <h3 style={{ fontSize: '17px', fontWeight: '700', color: '#0F172A', margin: 0 }}>Job Summary</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {/* Location Row */}
                <div style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  justifyContent: 'space-between',
                  gap: '12px',
                  paddingBottom: '10px',
                  borderBottom: '1px solid #f1f5f9'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
                    <div style={{ width: '28px', height: '28px', borderRadius: '6px', background: '#eff6ff', color: '#344BFD', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" />
                      </svg>
                    </div>
                    <span style={{ color: '#64748B', fontSize: '13px', fontWeight: '500' }}>Location</span>
                  </div>
                  <span style={{ fontWeight: '700', color: '#0F172A', fontSize: '13px', textAlign: 'right', wordBreak: 'break-word', flex: 1, minWidth: 0 }}>
                    {job.location}
                  </span>
                </div>

                {/* Salary Row */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '12px',
                  paddingBottom: '10px',
                  borderBottom: '1px solid #f1f5f9'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
                    <div style={{ width: '28px', height: '28px', borderRadius: '6px', background: '#ecfdf5', color: '#059669', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <line x1="12" y1="1" x2="12" y2="23"/>
                        <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
                      </svg>
                    </div>
                    <span style={{ color: '#64748B', fontSize: '13px', fontWeight: '500' }}>Salary</span>
                  </div>
                  <span style={{ fontWeight: '700', color: '#0F172A', fontSize: '13px', textAlign: 'right', whiteSpace: 'nowrap' }}>
                    {job.discloseSalary === false ? 'Salary Not Disclosed' : formatSalary(job.salaryMin, job.salaryMax)}
                  </span>
                </div>

                {/* Application Row */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '12px'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
                    <div style={{ width: '28px', height: '28px', borderRadius: '6px', background: '#fef3c7', color: '#d97706', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" />
                      </svg>
                    </div>
                    <span style={{ color: '#64748B', fontSize: '13px', fontWeight: '500' }}>Application</span>
                  </div>
                  <span style={{ fontWeight: '700', color: '#0F172A', fontSize: '13px', textAlign: 'right' }}>
                    {realApplicantCount} {realApplicantCount === 1 ? 'Applicant' : 'Applicants'}
                  </span>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* Floating Bottom Sticky Action Bar (Rendered into document.body via Portal to escape parent container transforms) */}
      {createPortal(
        <div className="detail-sticky-bar">
          <div style={{ width: '100%', maxWidth: '800px' }}>
            {hasApplied ? (
              <>
                <button
                  disabled
                  style={{
                    width: '100%',
                    background: '#EEF1FF',
                    color: '#344BFD',
                    border: 'none',
                    padding: '14px',
                    borderRadius: '4px',
                    fontWeight: '700',
                    fontSize: '15px',
                    cursor: 'not-allowed',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px'
                  }}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                  Already Applied (Status: {capitalize(appDetails?.status || 'applied')})
                </button>
                {appDetails && (appDetails as any).status === 'shortlisted' && (
                  <div style={{ fontSize: '11px', textAlign: 'center', color: 'var(--primary)', fontWeight: '600', marginTop: '4px' }}>
                    Interview Scheduled: {(appDetails as any).interviewDate} at {(appDetails as any).interviewTime}
                  </div>
                )}
              </>
            ) : isOwner ? (
              <button
                onClick={() => navigate('/dashboard?tab=manage')}
                style={{
                  width: '100%',
                  background: '#344BFD',
                  color: '#ffffff',
                  border: 'none',
                  padding: '14px',
                  borderRadius: '4px',
                  fontWeight: '700',
                  fontSize: '15px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px'
                }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <rect x="2" y="7" width="20" height="14" rx="2" ry="2"/>
                  <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>
                </svg>
                Manage Job
              </button>
            ) : hasApplied ? (
              <button
                disabled
                style={{
                  width: '100%',
                  padding: '12px 24px',
                  borderRadius: '4px',
                  border: '1.5px solid #bbf7d0',
                  background: '#dcfce7',
                  color: '#15803d',
                  fontWeight: '800',
                  fontSize: '15px',
                  cursor: 'default',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px'
                }}
              >
                <CheckCircle2 size={18} />
                <span>Applied ✓</span>
              </button>
            ) : (
              <button 
                onClick={handleApply} 
                disabled={isApplying}
                style={{
                  width: '100%',
                  padding: '12px 24px',
                  borderRadius: '4px',
                  border: 'none',
                  background: '#344BFD',
                  color: '#ffffff',
                  fontWeight: '700',
                  fontSize: '15px',
                  cursor: isApplying ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  opacity: isApplying ? 0.85 : 1,
                  transition: 'background 0.2s ease'
                }}
                onMouseEnter={(e) => { if (!isApplying) e.currentTarget.style.background = '#1A2EB8'; }}
                onMouseLeave={(e) => { if (!isApplying) e.currentTarget.style.background = '#344BFD'; }}
              >
                {isApplying ? (
                  <>
                    <svg className="animate-spin" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" style={{ animation: 'spin 0.8s linear infinite' }}>
                      <circle cx="12" cy="12" r="10" stroke="rgba(255,255,255,0.3)" />
                      <path d="M4 12a8 8 0 0 1 8-8" stroke="currentColor" strokeLinecap="round" />
                    </svg>
                    Applying...
                  </>
                ) : (
                  'Apply Now'
                )}
              </button>
            )}
          </div>
        </div>,
        document.body
      )}
      {showApplyModal && currentUser && (
        <JobApplyModal
          job={job}
          user={currentUser}
          onClose={() => setShowApplyModal(false)}
          onConfirm={handleConfirmApply}
          isApplying={isApplying}
        />
      )}
      {showWalkInPassModal && (
        createPortal(
          <div className="modal-backdrop" onClick={() => setShowWalkInPassModal(false)}>
            <div
              className="modal"
              onClick={(e) => e.stopPropagation()}
              style={{
                maxWidth: '520px',
                width: '100%',
                borderRadius: '6px',
                background: '#ffffff',
                border: '2px solid #f59e0b',
                boxShadow: '0 16px 40px rgba(15, 23, 42, 0.25)',
                overflow: 'hidden'
              }}
            >
              <div style={{ background: 'linear-gradient(135deg, #d97706 0%, #b45309 100%)', color: '#ffffff', padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Zap size={20} />
                  <h3 style={{ margin: 0, fontSize: '17px', fontWeight: '800' }}>Direct Walk-In Entry Pass</h3>
                </div>
                <button
                  type="button"
                  onClick={() => setShowWalkInPassModal(false)}
                  style={{ background: 'rgba(255,255,255,0.2)', border: 'none', color: '#ffffff', width: '28px', height: '28px', borderRadius: '4px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                >
                  ✕
                </button>
              </div>
              <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px', background: '#fffbef' }}>
                <div style={{ background: '#ffffff', padding: '14px', borderRadius: '6px', border: '1px solid #fcd34d' }}>
                  <div style={{ fontSize: '11px', fontWeight: '800', color: '#b45309', textTransform: 'uppercase' }}>TARGET POSITION</div>
                  <div style={{ fontSize: '16px', fontWeight: '800', color: '#0f172a', marginTop: '2px' }}>{job.title}</div>
                  <div style={{ fontSize: '13px', color: '#475569', fontWeight: '600' }}>{job.company} • {job.location}</div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  {job.walkInDate && (
                    <div style={{ background: '#ffffff', padding: '10px 12px', borderRadius: '4px', border: '1px solid #fde68a' }}>
                      <div style={{ fontSize: '11px', color: '#92400e', fontWeight: '700' }}>EVENT DATE</div>
                      <div style={{ fontSize: '13.5px', color: '#0f172a', fontWeight: '800', marginTop: '2px' }}>{job.walkInDate}</div>
                    </div>
                  )}
                  {(job.walkInStartTime || job.walkInTime) && (
                    <div style={{ background: '#ffffff', padding: '10px 12px', borderRadius: '4px', border: '1px solid #fde68a' }}>
                      <div style={{ fontSize: '11px', color: '#92400e', fontWeight: '700' }}>WALK-IN TIMING</div>
                      <div style={{ fontSize: '13.5px', color: '#0f172a', fontWeight: '800', marginTop: '2px' }}>
                        {job.walkInStartTime && job.walkInEndTime ? `${job.walkInStartTime} to ${job.walkInEndTime}` : job.walkInTime}
                      </div>
                    </div>
                  )}
                </div>

                {(job.walkInContactPerson || job.walkInContactNumber) && (
                  <div style={{ background: '#ffffff', padding: '12px', borderRadius: '6px', border: '1px solid #fde68a', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div>
                      <div style={{ fontSize: '11px', color: '#92400e', fontWeight: '700' }}>ON-SITE CONTACT</div>
                      <div style={{ fontSize: '13.5px', color: '#0f172a', fontWeight: '800', marginTop: '2px' }}>
                        {job.walkInContactPerson || 'HR Manager'}
                      </div>
                    </div>
                    {job.walkInContactNumber && (
                      <a
                        href={`tel:${job.walkInContactNumber}`}
                        style={{ background: '#d97706', color: '#ffffff', padding: '8px 14px', borderRadius: '4px', fontWeight: '800', fontSize: '12.5px', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                      >
                        <Phone size={14} /> Call Contact
                      </a>
                    )}
                  </div>
                )}

                {(job.interviewAddress || job.location) && (
                  <div style={{ background: '#ffffff', padding: '12px', borderRadius: '6px', border: '1px solid #fde68a' }}>
                    <div style={{ fontSize: '11px', color: '#92400e', fontWeight: '700' }}>WALK-IN VENUE ADDRESS</div>
                    <div style={{ fontSize: '13px', color: '#0f172a', fontWeight: '700', marginTop: '3px' }}>
                      {job.interviewAddress || job.location}
                    </div>
                  </div>
                )}

                {job.walkInDocuments && (
                  <div style={{ background: '#fef3c7', padding: '10px 12px', borderRadius: '4px', border: '1px solid #fcd34d', fontSize: '12px', color: '#92400e' }}>
                    <strong>Documents to Carry:</strong> {job.walkInDocuments}
                  </div>
                )}
              </div>
              <div style={{ padding: '12px 18px', background: '#ffffff', borderTop: '1px solid #fde68a', textAlign: 'right' }}>
                <button
                  type="button"
                  onClick={() => setShowWalkInPassModal(false)}
                  style={{ background: '#344BFD', color: '#ffffff', border: 'none', padding: '9px 20px', borderRadius: '4px', fontWeight: '800', fontSize: '13px', cursor: 'pointer' }}
                >
                  Got It (Save Pass)
                </button>
              </div>
            </div>
          </div>,
          document.body
        )
      )}
    </div>
  );
};
export default JobDetailPage;
