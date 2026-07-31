import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Link } from 'react-router-dom';
import { apiFetch } from '../../utils/api';
import { ResumePreviewModal } from '../profile/ResumePreviewModal';

export interface CandidateDetailsModalProps {
  viewWorker: any;
  onClose: () => void;
  updateApplicantStatus?: (jobId: string, userId: string, status: string) => Promise<any> | void;
  scheduleInterview?: (jobId: string, userId: string, data: any) => Promise<any> | void;
  sendCustomEmail?: (jobId: string, userId: string, data: any) => Promise<any> | void;
  showToast?: (message: string, type?: 'success' | 'error' | 'warning' | 'info') => void;
  myJobs?: any[];
}

const capitalize = (s?: string) => {
  if (!s) return '';
  return s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();
};

const formatNumber = (num?: number) => {
  if (num === undefined || num === null) return '0';
  return num.toLocaleString('en-IN');
};

export const CandidateDetailsModal: React.FC<CandidateDetailsModalProps> = ({
  viewWorker,
  onClose,
  updateApplicantStatus,
  scheduleInterview,
  sendCustomEmail,
  showToast,
  myJobs = []
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'job_details' | 'profile' | 'hiring'>('job_details');
  const [previewResume, setPreviewResume] = useState<any>(null);
  
  // Job resolution state
  const [jobData, setJobData] = useState<any>(viewWorker?.job || null);
  const [isLoadingJob, setIsLoadingJob] = useState<boolean>(false);
  const [selectedJobId, setSelectedJobId] = useState<string>(viewWorker?.jobId || viewWorker?.job_id || '');

  // Form states for Interview Scheduling
  const [interviewDate, setInterviewDate] = useState(viewWorker?.interviewDate || '');
  const [interviewTime, setInterviewTime] = useState(viewWorker?.interviewTime || '');
  const [venueAddress, setVenueAddress] = useState(viewWorker?.venueAddress || '');
  const [mapsLink, setMapsLink] = useState(viewWorker?.mapsLink || '');
  const [isScheduling, setIsScheduling] = useState(false);

  // Form states for Custom Email
  const [emailSubject, setEmailSubject] = useState('');
  const [emailMessage, setEmailMessage] = useState('');
  const [isSendingEmail, setIsSendingEmail] = useState(false);

  // Applicant status local state
  const [applicantStatus, setApplicantStatus] = useState<string>(viewWorker?.status || 'applied');

  // Resolve target jobId and jobData
  useEffect(() => {
    const targetJobId = viewWorker?.jobId || viewWorker?.job_id || selectedJobId;
    setSelectedJobId(targetJobId);

    // 1. Direct job object attached
    if (viewWorker?.job && (!targetJobId || String(viewWorker.job.id) === String(targetJobId))) {
      setJobData(viewWorker.job);
      return;
    }

    // 2. Check in myJobs array
    if (targetJobId && myJobs.length > 0) {
      const found = myJobs.find(j => String(j.id) === String(targetJobId));
      if (found) {
        setJobData(found);
        return;
      }
    }

    // 3. Fetch from API if jobId exists but job object is missing
    if (targetJobId) {
      let isMounted = true;
      setIsLoadingJob(true);
      apiFetch(`/api/v1/jobs/${targetJobId}`)
        .then(r => r.ok ? r.json() : null)
        .then(res => {
          if (!isMounted) return;
          if (res?.success && res?.data) {
            setJobData(res.data);
          }
        })
        .catch(err => {
          console.error('Failed to fetch job details for modal:', err);
        })
        .finally(() => {
          if (isMounted) setIsLoadingJob(false);
        });

      return () => {
        isMounted = false;
      };
    } else {
      setJobData(null);
    }
  }, [viewWorker, selectedJobId, myJobs]);

  // Initial subject & message preparation
  useEffect(() => {
    const jobTitle = jobData?.title || viewWorker?.jobTitle || viewWorker?.tradeSpecialization || 'Position';
    const compName = jobData?.company || 'Recruitment Team';
    setEmailSubject(`Regarding your application for ${jobTitle}`);
    setEmailMessage(`Hi ${viewWorker?.name || 'Candidate'},\n\nWe would like to connect with you regarding your application for the ${jobTitle} role.\n\nBest regards,\n${compName}`);
    setApplicantStatus(viewWorker?.status || 'applied');
  }, [viewWorker, jobData]);

  if (!viewWorker) return null;

  const targetJobId = jobData?.id || selectedJobId || viewWorker?.jobId || viewWorker?.job_id || '';
  const displayJobTitle = jobData?.title || viewWorker?.jobTitle || viewWorker?.job_title;

  const handleStatusChange = async (newStatus: string) => {
    setApplicantStatus(newStatus);
    if (updateApplicantStatus && targetJobId) {
      try {
        await updateApplicantStatus(targetJobId, viewWorker.userId || viewWorker.id, newStatus);
        if (showToast) showToast(`Status updated to ${capitalize(newStatus)}`, 'success');
      } catch (err: any) {
        if (showToast) showToast(err.message || 'Failed to update status', 'error');
      }
    }
  };

  const handleScheduleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetJobId) {
      if (showToast) showToast('Please select a specific job opening to schedule an interview', 'warning');
      return;
    }
    if (!interviewDate || !interviewTime || !venueAddress) {
      if (showToast) showToast('Please fill in date, time, and venue address', 'error');
      return;
    }

    setIsScheduling(true);
    try {
      if (scheduleInterview) {
        await scheduleInterview(targetJobId, viewWorker.userId || viewWorker.id, {
          interviewDate,
          interviewTime,
          venueAddress,
          mapsLink
        });
      }
      if (showToast) showToast('Interview scheduled & invitation sent!', 'success');
    } catch (err: any) {
      if (showToast) showToast(err.message || 'Failed to schedule interview', 'error');
    } finally {
      setIsScheduling(false);
    }
  };

  const handleSendEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetJobId) {
      if (showToast) showToast('Please select a specific job opening to send email', 'warning');
      return;
    }
    if (!emailSubject || !emailMessage) {
      if (showToast) showToast('Subject and message are required', 'error');
      return;
    }

    setIsSendingEmail(true);
    try {
      if (sendCustomEmail) {
        await sendCustomEmail(targetJobId, viewWorker.userId || viewWorker.id, {
          subject: emailSubject,
          message: emailMessage
        });
      }
      if (showToast) showToast('Email sent to candidate successfully', 'success');
    } catch (err: any) {
      if (showToast) showToast(err.message || 'Failed to send email', 'error');
    } finally {
      setIsSendingEmail(false);
    }
  };

  return createPortal(
    <>
      {previewResume && (
        <ResumePreviewModal
          resume={previewResume}
          onClose={() => setPreviewResume(null)}
          userId={previewResume?.userId || viewWorker?.userId || viewWorker?.id}
        />
      )}

      <div className="modal-backdrop candidate-modal-backdrop" onClick={onClose}>
        <div
          className="modal candidate-modal"
          onClick={(e) => e.stopPropagation()}
          style={{
            maxWidth: '720px',
            width: '100%',
            maxHeight: '90vh',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            borderRadius: '16px',
            boxShadow: '0 24px 48px -12px rgba(0, 0, 0, 0.25)',
            background: 'var(--surface, #ffffff)',
            border: '1px solid var(--border)'
          }}
        >
          {/* Top Modal Header */}
          <div
            className="modal-header"
            style={{
              padding: '16px 20px',
              borderBottom: '1px solid var(--border)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              background: 'var(--surface)',
              flexShrink: 0
            }}
          >
            <div>
              <h3 className="modal-title" style={{ margin: 0, fontSize: '18px', fontWeight: '700', color: 'var(--text-primary)' }}>
                Application & Candidate Details
              </h3>
              <p style={{ margin: '2px 0 0', fontSize: '12px', color: 'var(--text-secondary)' }}>
                View complete profile, job specs & take hiring actions
              </p>
            </div>
            <button
              className="modal-close"
              onClick={onClose}
              style={{
                width: '34px',
                height: '34px',
                borderRadius: '50%',
                border: '1px solid var(--border)',
                background: 'var(--bg-secondary)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '16px',
                color: 'var(--text-secondary)'
              }}
            >
              ✕
            </button>
          </div>

          {/* Sticky Tab Bar */}
          <div
            style={{
              background: 'var(--surface)',
              padding: '8px 16px',
              borderBottom: '1px solid var(--border)',
              flexShrink: 0,
              zIndex: 10
            }}
          >
            <div
              style={{
                display: 'flex',
                background: 'var(--bg-secondary, #f8fafc)',
                padding: '4px',
                borderRadius: '10px',
                gap: '4px',
                border: '1px solid var(--border-light, #e2e8f0)',
                overflowX: 'auto',
                scrollbarWidth: 'none'
              }}
            >
              <button
                type="button"
                onClick={() => setActiveSubTab('job_details')}
                style={{
                  flex: '1 1 0',
                  minWidth: '100px',
                  padding: '9px 12px',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '13px',
                  fontWeight: activeSubTab === 'job_details' ? '700' : '600',
                  color: activeSubTab === 'job_details' ? '#ffffff' : 'var(--text-secondary)',
                  background: activeSubTab === 'job_details' ? 'var(--primary, #344BFD)' : 'transparent',
                  boxShadow: activeSubTab === 'job_details' ? '0 4px 12px rgba(52, 75, 253, 0.35)' : 'none',
                  transition: 'all 0.2s ease',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  whiteSpace: 'nowrap'
                }}
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
                  <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
                </svg>
                Job Info
              </button>

              <button
                type="button"
                onClick={() => setActiveSubTab('profile')}
                style={{
                  flex: '1 1 0',
                  minWidth: '125px',
                  padding: '9px 12px',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '13px',
                  fontWeight: activeSubTab === 'profile' ? '700' : '600',
                  color: activeSubTab === 'profile' ? '#ffffff' : 'var(--text-secondary)',
                  background: activeSubTab === 'profile' ? 'var(--primary, #344BFD)' : 'transparent',
                  boxShadow: activeSubTab === 'profile' ? '0 4px 12px rgba(52, 75, 253, 0.35)' : 'none',
                  transition: 'all 0.2s ease',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  whiteSpace: 'nowrap'
                }}
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
                Candidate Profile
              </button>

              <button
                type="button"
                onClick={() => setActiveSubTab('hiring')}
                style={{
                  flex: '1 1 0',
                  minWidth: '130px',
                  padding: '9px 12px',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '13px',
                  fontWeight: activeSubTab === 'hiring' ? '700' : '600',
                  color: activeSubTab === 'hiring' ? '#ffffff' : 'var(--text-secondary)',
                  background: activeSubTab === 'hiring' ? 'var(--primary, #344BFD)' : 'transparent',
                  boxShadow: activeSubTab === 'hiring' ? '0 4px 12px rgba(52, 75, 253, 0.35)' : 'none',
                  transition: 'all 0.2s ease',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  whiteSpace: 'nowrap'
                }}
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                  <line x1="16" y1="2" x2="16" y2="6" />
                  <line x1="8" y1="2" x2="8" y2="6" />
                  <line x1="3" y1="10" x2="21" y2="10" />
                </svg>
                Status & Interview
              </button>
            </div>
          </div>

          {/* Modal Body Container */}
          <div
            className="modal-body candidate-modal-body"
            style={{
              flex: 1,
              overflowY: 'auto',
              display: 'flex',
              flexDirection: 'column',
              gap: '16px',
              padding: '16px',
              WebkitOverflowScrolling: 'touch'
            }}
          >
            {/* Top Candidate Summary Card */}
            <div
              style={{
                background: 'var(--bg-secondary, #f8fafc)',
                padding: '16px',
                borderRadius: '12px',
                border: '1px solid var(--border)',
                display: 'flex',
                flexDirection: 'column',
                gap: '12px'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flex: '1 1 240px' }}>
                  <div
                    style={{
                      width: '54px',
                      height: '54px',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      background: 'var(--gradient-primary, #344BFD)',
                      overflow: 'hidden',
                      flexShrink: 0,
                      boxShadow: '0 4px 10px rgba(52, 75, 253, 0.2)'
                    }}
                  >
                    {viewWorker.profilePictureUrl ? (
                      <img src={viewWorker.profilePictureUrl} alt={viewWorker.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ color: 'white' }}>
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                        <circle cx="12" cy="7" r="4" />
                      </svg>
                    )}
                  </div>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                      <h3 style={{ margin: 0, fontSize: '17px', fontWeight: '700', color: 'var(--text-primary)', lineHeight: '1.2' }}>
                        {viewWorker.name || 'Candidate Name'}
                      </h3>
                      {viewWorker.aadhaarVerified && (
                        <span style={{ fontSize: '11px', padding: '2px 8px', background: '#dcfce7', color: '#15803d', borderRadius: '9999px', fontWeight: '600', whiteSpace: 'nowrap' }}>
                          Verified ✓
                        </span>
                      )}
                    </div>
                    
                    <p style={{ margin: '4px 0 0', color: 'var(--primary)', fontWeight: '600', fontSize: '13px' }}>
                      {displayJobTitle ? (
                        <>Applied for: <strong>{displayJobTitle}</strong></>
                      ) : (
                        <>Role / Trade: <strong>{viewWorker.tradeSpecialization || viewWorker.headline || 'Talent Pool Candidate'}</strong></>
                      )}
                    </p>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span
                    className={`status-badge status-${applicantStatus}`}
                    style={{
                      fontSize: '12px',
                      padding: '6px 14px',
                      fontWeight: '700',
                      borderRadius: '9999px',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px'
                    }}
                  >
                    {capitalize(applicantStatus)}
                  </span>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', fontSize: '12.5px', color: 'var(--text-secondary)', borderTop: '1px solid var(--border-light)', paddingTop: '10px', flexWrap: 'wrap' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                  ✉ {viewWorker.email || 'Email Not Provided'}
                </span>
                {viewWorker.phone && (
                  <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                    📞 {viewWorker.phone}
                  </span>
                )}
                {viewWorker.location && (
                  <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                    📍 {viewWorker.location}
                  </span>
                )}
              </div>
            </div>

            {/* TAB 1: JOB DETAILS */}
            {activeSubTab === 'job_details' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {isLoadingJob ? (
                  <div style={{ padding: '32px', textAlign: 'center', background: 'var(--bg-secondary)', borderRadius: '12px' }}>
                    <div className="spinner" style={{ margin: '0 auto 12px' }}></div>
                    <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '14px' }}>Loading Job Specifications...</p>
                  </div>
                ) : jobData ? (
                  <>
                    {/* Primary Job Info Card */}
                    <div style={{ background: 'var(--bg-secondary, #ffffff)', padding: '18px', borderRadius: '12px', border: '1px solid var(--border)', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px', flexWrap: 'wrap' }}>
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                            <h4 style={{ margin: 0, fontSize: '18px', fontWeight: '700', color: 'var(--text-primary)' }}>
                              {jobData.title}
                            </h4>
                            {jobData.jobType && (
                              <span style={{ fontSize: '11px', padding: '3px 9px', background: 'var(--primary-50, #eef2ff)', color: 'var(--primary)', borderRadius: '6px', fontWeight: '600' }}>
                                {jobData.jobType}
                              </span>
                            )}
                          </div>
                          <p style={{ margin: '6px 0 0', color: 'var(--text-secondary)', fontSize: '14px', fontWeight: '500' }}>
                            🏢 {jobData.company || 'Company'} • 📍 {jobData.location || 'Location'} ({jobData.workMode || 'On-site'})
                          </p>
                        </div>

                        <Link
                          to={`/job/${jobData.id}`}
                          target="_blank"
                          rel="noreferrer"
                          className="btn btn-primary btn-sm"
                          style={{
                            fontSize: '12.5px',
                            padding: '8px 14px',
                            fontWeight: '600',
                            borderRadius: '8px',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '6px',
                            whiteSpace: 'nowrap',
                            boxShadow: '0 2px 8px rgba(52, 75, 253, 0.25)'
                          }}
                        >
                          <span>View Job Details Page</span>
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                            <line x1="7" y1="17" x2="17" y2="7" />
                            <polyline points="7 7 17 7 17 17" />
                          </svg>
                        </Link>
                      </div>

                      {/* Job Metadata Grid */}
                      <div
                        style={{
                          display: 'grid',
                          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                          gap: '14px',
                          marginTop: '16px',
                          paddingTop: '16px',
                          borderTop: '1px solid var(--border)',
                          fontSize: '13px'
                        }}
                      >
                        <div style={{ background: 'var(--surface)', padding: '10px 12px', borderRadius: '8px', border: '1px solid var(--border-light)' }}>
                          <div style={{ fontSize: '11px', color: 'var(--text-tertiary)', fontWeight: '700', textTransform: 'uppercase' }}>SALARY / STIPEND</div>
                          <div style={{ fontSize: '13.5px', fontWeight: '700', color: 'var(--text-primary)', marginTop: '2px' }}>
                            {jobData.salary?.min
                              ? `₹${formatNumber(jobData.salary.min)} - ₹${formatNumber(jobData.salary.max || jobData.salary.min)} / ${jobData.salary.period || 'month'}`
                              : jobData.salaryMin
                              ? `₹${formatNumber(jobData.salaryMin)} - ₹${formatNumber(jobData.salaryMax || jobData.salaryMin)} / month`
                              : 'Competitive / Negotiable'}
                          </div>
                        </div>

                        <div style={{ background: 'var(--surface)', padding: '10px 12px', borderRadius: '8px', border: '1px solid var(--border-light)' }}>
                          <div style={{ fontSize: '11px', color: 'var(--text-tertiary)', fontWeight: '700', textTransform: 'uppercase' }}>VACANCIES</div>
                          <div style={{ fontSize: '13.5px', fontWeight: '700', color: 'var(--primary)', marginTop: '2px' }}>
                            {jobData.filledOpenings || 0} / {jobData.openings || 1} Positions Filled
                          </div>
                        </div>

                        <div style={{ background: 'var(--surface)', padding: '10px 12px', borderRadius: '8px', border: '1px solid var(--border-light)' }}>
                          <div style={{ fontSize: '11px', color: 'var(--text-tertiary)', fontWeight: '700', textTransform: 'uppercase' }}>EXPERIENCE REQUIRED</div>
                          <div style={{ fontSize: '13.5px', fontWeight: '700', color: 'var(--text-primary)', marginTop: '2px' }}>
                            {jobData.minExperience !== undefined
                              ? `${jobData.minExperience} - ${jobData.maxExperience || jobData.minExperience} Years`
                              : 'Any Experience Level'}
                          </div>
                        </div>

                        <div style={{ background: 'var(--surface)', padding: '10px 12px', borderRadius: '8px', border: '1px solid var(--border-light)' }}>
                          <div style={{ fontSize: '11px', color: 'var(--text-tertiary)', fontWeight: '700', textTransform: 'uppercase' }}>POSTED DATE</div>
                          <div style={{ fontSize: '13.5px', fontWeight: '700', color: 'var(--text-primary)', marginTop: '2px' }}>
                            {jobData.postedAt ? new Date(jobData.postedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Recently'}
                          </div>
                        </div>
                      </div>

                      {/* Perks & Amenities Badges */}
                      {(jobData.overtime || jobData.accommodation || jobData.busFacility || jobData.canteen || jobData.joiningBonus || jobData.attendanceBonus) && (
                        <div style={{ marginTop: '14px', paddingTop: '12px', borderTop: '1px dashed var(--border)' }}>
                          <div style={{ fontSize: '11px', color: 'var(--text-tertiary)', fontWeight: '700', textTransform: 'uppercase', marginBottom: '8px' }}>
                            PERKS & FACILITIES INCLUDED
                          </div>
                          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                            {jobData.overtime && <span style={{ fontSize: '11.5px', padding: '3px 8px', background: '#e0f2fe', color: '#0369a1', borderRadius: '6px', fontWeight: '600' }}>⚡ Overtime Pay</span>}
                            {jobData.accommodation && <span style={{ fontSize: '11.5px', padding: '3px 8px', background: '#fef3c7', color: '#b45309', borderRadius: '6px', fontWeight: '600' }}>🏠 Accommodation</span>}
                            {jobData.busFacility && <span style={{ fontSize: '11.5px', padding: '3px 8px', background: '#dcfce7', color: '#15803d', borderRadius: '6px', fontWeight: '600' }}>🚌 Free Bus Facility</span>}
                            {jobData.canteen && <span style={{ fontSize: '11.5px', padding: '3px 8px', background: '#fae8ff', color: '#86198f', borderRadius: '6px', fontWeight: '600' }}>🍱 Canteen Meals</span>}
                            {jobData.joiningBonus && <span style={{ fontSize: '11.5px', padding: '3px 8px', background: '#fee2e2', color: '#b91c1c', borderRadius: '6px', fontWeight: '600' }}>💰 Joining Bonus</span>}
                            {jobData.attendanceBonus && <span style={{ fontSize: '11.5px', padding: '3px 8px', background: '#e0e7ff', color: '#4338ca', borderRadius: '6px', fontWeight: '600' }}>🎯 Attendance Bonus</span>}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Job Description Block */}
                    {jobData.description && (
                      <div style={{ background: 'var(--bg-secondary)', padding: '16px', borderRadius: '12px', border: '1px solid var(--border)' }}>
                        <h4 style={{ margin: '0 0 10px', fontSize: '12px', color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: '700' }}>
                          Job Description
                        </h4>
                        <div style={{ fontSize: '13.5px', lineHeight: '1.6', color: 'var(--text-primary)', whiteSpace: 'pre-line' }}>
                          {jobData.description}
                        </div>
                      </div>
                    )}

                    {/* Requirements Block */}
                    {jobData.requirements && jobData.requirements.length > 0 && (
                      <div style={{ background: 'var(--bg-secondary)', padding: '16px', borderRadius: '12px', border: '1px solid var(--border)' }}>
                        <h4 style={{ margin: '0 0 10px', fontSize: '12px', color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: '700' }}>
                          Key Requirements
                        </h4>
                        <ul style={{ margin: 0, paddingLeft: '20px', display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '13.5px', color: 'var(--text-primary)' }}>
                          {jobData.requirements.map((req: string, idx: number) => (
                            <li key={idx}>{req}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </>
                ) : (
                  /* Candidate Pool / No Specific Job Linked State */
                  <div style={{ background: 'var(--bg-secondary)', padding: '24px', borderRadius: '12px', border: '1px solid var(--border)', textAlign: 'center' }}>
                    <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'var(--primary-50, #eef2ff)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="2">
                        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                        <circle cx="9" cy="7" r="4" />
                        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                      </svg>
                    </div>
                    <h4 style={{ margin: '0 0 6px', fontSize: '16px', fontWeight: '700', color: 'var(--text-primary)' }}>
                      Candidate Pool Profile
                    </h4>
                    <p style={{ margin: '0 0 16px', fontSize: '13px', color: 'var(--text-secondary)', maxWidth: '420px', marginLeft: 'auto', marginRight: 'auto' }}>
                      This profile was accessed from the general candidate pool. Select an active job below to evaluate candidate fit or schedule an interview.
                    </p>

                    {myJobs.length > 0 ? (
                      <div style={{ maxWidth: '400px', margin: '0 auto', textAlign: 'left' }}>
                        <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: 'var(--text-secondary)', marginBottom: '6px' }}>
                          Select Active Job Listing to Match / Link:
                        </label>
                        <select
                          value={selectedJobId}
                          onChange={(e) => setSelectedJobId(e.target.value)}
                          style={{
                            width: '100%',
                            padding: '10px 12px',
                            borderRadius: '8px',
                            border: '1px solid var(--border)',
                            fontSize: '13px',
                            background: 'var(--surface)',
                            fontWeight: '600',
                            color: 'var(--text-primary)'
                          }}
                        >
                          <option value="">-- Choose Job Opening --</option>
                          {myJobs.map((j) => (
                            <option key={j.id} value={j.id}>
                              {j.title} ({j.location})
                            </option>
                          ))}
                        </select>
                      </div>
                    ) : (
                      <Link to="/dashboard?tab=post-job" className="btn btn-primary btn-sm" style={{ fontSize: '12.5px' }}>
                        + Post a New Job Listing
                      </Link>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* TAB 2: CANDIDATE PROFILE */}
            {activeSubTab === 'profile' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {/* Account Details */}
                <div style={{ background: 'var(--bg-secondary)', padding: '16px', borderRadius: '12px', border: '1px solid var(--border)' }}>
                  <h4 style={{ margin: '0 0 12px', fontSize: '12px', color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: '700' }}>
                    Account Information
                  </h4>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '14px' }}>
                    <div>
                      <div style={{ fontSize: '11px', color: 'var(--text-tertiary)', fontWeight: '600' }}>EMAIL ADDRESS</div>
                      <div style={{ fontSize: '13.5px', color: 'var(--text-primary)', fontWeight: '600', marginTop: '2px', wordBreak: 'break-all' }}>
                        {viewWorker.email || 'Not Provided'}
                      </div>
                    </div>
                    <div>
                      <div style={{ fontSize: '11px', color: 'var(--text-tertiary)', fontWeight: '600' }}>PHONE NUMBER</div>
                      <div style={{ fontSize: '13.5px', color: 'var(--text-primary)', fontWeight: '600', marginTop: '2px' }}>
                        {viewWorker.phone || 'Not Provided'}
                      </div>
                    </div>
                    <div>
                      <div style={{ fontSize: '11px', color: 'var(--text-tertiary)', fontWeight: '600' }}>LOCATION</div>
                      <div style={{ fontSize: '13.5px', color: 'var(--text-primary)', fontWeight: '600', marginTop: '2px' }}>
                        {viewWorker.location || 'Not Specified'}
                      </div>
                    </div>
                    <div>
                      <div style={{ fontSize: '11px', color: 'var(--text-tertiary)', fontWeight: '600' }}>VERIFICATION STATUS</div>
                      <div style={{ fontSize: '13.5px', color: viewWorker.aadhaarVerified ? '#15803d' : 'var(--text-secondary)', fontWeight: '600', marginTop: '2px' }}>
                        {viewWorker.aadhaarVerified ? 'Aadhaar Verified ✓' : 'Unverified'}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Professional Headline & Skills */}
                <div style={{ background: 'var(--bg-secondary)', padding: '16px', borderRadius: '12px', border: '1px solid var(--border)' }}>
                  <h4 style={{ margin: '0 0 12px', fontSize: '12px', color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: '700' }}>
                    Trade & Skills
                  </h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <div>
                      <div style={{ fontSize: '11px', color: 'var(--text-tertiary)', fontWeight: '600' }}>SPECIALIZATION / TRADE</div>
                      <div style={{ fontSize: '14px', color: 'var(--primary)', fontWeight: '700', marginTop: '2px' }}>
                        {viewWorker.tradeSpecialization || viewWorker.headline || 'General Worker'}
                      </div>
                    </div>

                    {viewWorker.skills && viewWorker.skills.length > 0 && (
                      <div>
                        <div style={{ fontSize: '11px', color: 'var(--text-tertiary)', fontWeight: '600', marginBottom: '6px' }}>SKILLS & CERTIFICATIONS</div>
                        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                          {viewWorker.skills.map((sk: string, idx: number) => (
                            <span key={idx} style={{ fontSize: '12px', padding: '4px 10px', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '6px', fontWeight: '600', color: 'var(--text-primary)' }}>
                              {sk}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Candidate Preferences */}
                <div style={{ background: 'var(--bg-secondary)', padding: '16px', borderRadius: '12px', border: '1px solid var(--border)' }}>
                  <h4 style={{ margin: '0 0 12px', fontSize: '12px', color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: '700' }}>
                    Job & Shift Preferences
                  </h4>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '14px' }}>
                    <div>
                      <div style={{ fontSize: '11px', color: 'var(--text-tertiary)', fontWeight: '600' }}>PREFERRED SHIFT</div>
                      <div style={{ fontSize: '13.5px', color: 'var(--text-primary)', fontWeight: '600', marginTop: '2px' }}>
                        {viewWorker.preferredShift || 'Flexible / Any Shift'}
                      </div>
                    </div>
                    <div>
                      <div style={{ fontSize: '11px', color: 'var(--text-tertiary)', fontWeight: '600' }}>BUS TRANSPORT</div>
                      <div style={{ fontSize: '13.5px', color: 'var(--text-primary)', fontWeight: '600', marginTop: '2px' }}>
                        {viewWorker.requiresBus ? 'Requires Bus Facility' : 'Not Required'}
                      </div>
                    </div>
                    <div>
                      <div style={{ fontSize: '11px', color: 'var(--text-tertiary)', fontWeight: '600' }}>ACCOMMODATION</div>
                      <div style={{ fontSize: '13.5px', color: 'var(--text-primary)', fontWeight: '600', marginTop: '2px' }}>
                        {viewWorker.requiresAccommodation ? 'Requires Housing' : 'Not Required'}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Experience section */}
                {viewWorker.experience && viewWorker.experience.length > 0 && (
                  <div style={{ background: 'var(--bg-secondary)', padding: '16px', borderRadius: '12px', border: '1px solid var(--border)' }}>
                    <h4 style={{ margin: '0 0 12px', fontSize: '12px', color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: '700' }}>
                      Work Experience
                    </h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      {viewWorker.experience.map((exp: any, idx: number) => (
                        <div key={idx} style={{ padding: '10px 12px', background: 'var(--surface)', borderRadius: '8px', border: '1px solid var(--border-light)' }}>
                          <div style={{ fontSize: '14px', fontWeight: '700', color: 'var(--text-primary)' }}>{exp.role || exp.title}</div>
                          <div style={{ fontSize: '12.5px', color: 'var(--text-secondary)', marginTop: '2px' }}>
                            {exp.company} • {exp.duration || `${exp.startDate || ''} - ${exp.endDate || 'Present'}`}
                          </div>
                          {exp.description && (
                            <p style={{ margin: '6px 0 0', fontSize: '12.5px', color: 'var(--text-secondary)' }}>{exp.description}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Resume Card */}
                {viewWorker.job?.acceptResume !== false && viewWorker.resume && (viewWorker.resume.url || viewWorker.resume.name) && (
                  <div style={{ background: 'var(--bg-secondary)', padding: '16px', borderRadius: '12px', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', flexWrap: 'wrap' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div style={{ width: '40px', height: '40px', borderRadius: '8px', background: 'var(--primary-50)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="2">
                          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                          <polyline points="14 2 14 8 20 8" />
                        </svg>
                      </div>
                      <div>
                        <div style={{ fontSize: '13.5px', fontWeight: '700', color: 'var(--text-primary)' }}>
                          {viewWorker.resume.name || 'Candidate Resume'}
                        </div>
                        <div style={{ fontSize: '11.5px', color: 'var(--text-tertiary)' }}>PDF Document</div>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => setPreviewResume(viewWorker.resume)}
                      className="btn btn-outline btn-sm"
                      style={{ fontSize: '12px', padding: '6px 14px', borderRadius: '6px', fontWeight: '600' }}
                    >
                      Preview Resume Document 📄
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* TAB 3: STATUS & INTERVIEW */}
            {activeSubTab === 'hiring' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {/* Status Update Pipeline */}
                <div style={{ background: 'var(--bg-secondary)', padding: '18px', borderRadius: '12px', border: '1px solid var(--border)' }}>
                  <h4 style={{ margin: '0 0 14px', fontSize: '12px', color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: '700' }}>
                    Update Application Status
                  </h4>

                  <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '8px', marginBottom: '16px' }}>
                    {['applied', 'reviewed', 'shortlisted', 'accepted', 'rejected'].map((st) => (
                      <button
                        key={st}
                        type="button"
                        onClick={() => handleStatusChange(st)}
                        style={{
                          flex: '1 0 auto',
                          padding: '8px 14px',
                          borderRadius: '8px',
                          border: applicantStatus === st ? '2px solid var(--primary)' : '1px solid var(--border)',
                          background: applicantStatus === st ? 'var(--primary-50, #eef2ff)' : 'var(--surface)',
                          color: applicantStatus === st ? 'var(--primary)' : 'var(--text-secondary)',
                          fontWeight: applicantStatus === st ? '700' : '600',
                          fontSize: '12.5px',
                          cursor: 'pointer',
                          textTransform: 'capitalize'
                        }}
                      >
                        {st === 'accepted' ? 'Hired / Accepted ✓' : st}
                      </button>
                    ))}
                  </div>

                  <div style={{ fontSize: '12.5px', color: 'var(--text-secondary)' }}>
                    Current Pipeline State: <strong style={{ color: 'var(--primary)', textTransform: 'uppercase' }}>{applicantStatus}</strong>
                  </div>
                </div>

                {/* Schedule Interview Block */}
                <div style={{ background: 'var(--bg-secondary)', padding: '18px', borderRadius: '12px', border: '1px solid var(--border)' }}>
                  <h4 style={{ margin: '0 0 14px', fontSize: '12px', color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: '700' }}>
                    Schedule In-Person / Online Interview
                  </h4>

                  <form onSubmit={handleScheduleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px' }}>
                      <div>
                        <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '4px' }}>
                          INTERVIEW DATE *
                        </label>
                        <input
                          type="date"
                          value={interviewDate}
                          onChange={(e) => setInterviewDate(e.target.value)}
                          required
                          style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid var(--border)', fontSize: '13px', background: 'var(--surface)' }}
                        />
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '4px' }}>
                          INTERVIEW TIME *
                        </label>
                        <input
                          type="time"
                          value={interviewTime}
                          onChange={(e) => setInterviewTime(e.target.value)}
                          required
                          style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid var(--border)', fontSize: '13px', background: 'var(--surface)' }}
                        />
                      </div>
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '4px' }}>
                        VENUE ADDRESS / LOCATION DETAILS *
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Factory Premises Gate 2, MIDC Chakan, Pune"
                        value={venueAddress}
                        onChange={(e) => setVenueAddress(e.target.value)}
                        required
                        style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid var(--border)', fontSize: '13px', background: 'var(--surface)' }}
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '4px' }}>
                        GOOGLE MAPS LOCATION LINK (OPTIONAL)
                      </label>
                      <input
                        type="url"
                        placeholder="https://maps.google.com/..."
                        value={mapsLink}
                        onChange={(e) => setMapsLink(e.target.value)}
                        style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid var(--border)', fontSize: '13px', background: 'var(--surface)' }}
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={isScheduling}
                      className="btn btn-primary"
                      style={{ fontSize: '13px', padding: '10px 16px', fontWeight: '600', borderRadius: '8px', alignSelf: 'flex-start', marginTop: '4px' }}
                    >
                      {isScheduling ? 'Scheduling...' : 'Send Interview Call Invitation 📅'}
                    </button>
                  </form>
                </div>

                {/* Send Direct Email */}
                <div style={{ background: 'var(--bg-secondary)', padding: '18px', borderRadius: '12px', border: '1px solid var(--border)' }}>
                  <h4 style={{ margin: '0 0 14px', fontSize: '12px', color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: '700' }}>
                    Send Direct Email Message
                  </h4>

                  <form onSubmit={handleSendEmailSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '4px' }}>
                        EMAIL SUBJECT *
                      </label>
                      <input
                        type="text"
                        value={emailSubject}
                        onChange={(e) => setEmailSubject(e.target.value)}
                        required
                        style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid var(--border)', fontSize: '13px', background: 'var(--surface)' }}
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '4px' }}>
                        MESSAGE *
                      </label>
                      <textarea
                        rows={4}
                        value={emailMessage}
                        onChange={(e) => setEmailMessage(e.target.value)}
                        required
                        style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid var(--border)', fontSize: '13px', background: 'var(--surface)', resize: 'vertical' }}
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={isSendingEmail}
                      className="btn btn-outline"
                      style={{ fontSize: '13px', padding: '10px 16px', fontWeight: '600', borderRadius: '8px', alignSelf: 'flex-start', marginTop: '4px' }}
                    >
                      {isSendingEmail ? 'Sending...' : 'Send Custom Email Notification ✉'}
                    </button>
                  </form>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>,
    document.body
  );
};
