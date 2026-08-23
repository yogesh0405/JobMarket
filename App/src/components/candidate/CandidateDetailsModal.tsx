import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Link } from 'react-router-dom';
import { 
  User, Mail, Phone, MapPin, ShieldCheck, Wrench, Briefcase, 
  Clock, FileText, X, CheckCircle2, Award, Calendar, Bus, Home, 
  GraduationCap, DollarSign, UserCheck, Building, Check, Sparkles 
} from 'lucide-react';
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

const tryParseJson = (data: any) => {
  if (!data) return null;
  if (typeof data !== 'string') return data;
  try {
    return JSON.parse(data);
  } catch {
    return data;
  }
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
  const hasJobContext = Boolean(viewWorker?.jobId || viewWorker?.job_id || viewWorker?.job || viewWorker?.applicationStatus || viewWorker?.applicantStatus);
  
  const rawSkills = tryParseJson(viewWorker?.skills);
  const skillsList: string[] = Array.isArray(rawSkills)
    ? rawSkills
    : typeof rawSkills === 'string'
    ? rawSkills.split(',').map((s: string) => s.trim()).filter(Boolean)
    : [];

  const rawExperience = tryParseJson(viewWorker?.experience);
  const experienceList: any[] = Array.isArray(rawExperience)
    ? rawExperience
    : typeof rawExperience === 'object' && rawExperience !== null
    ? [rawExperience]
    : typeof rawExperience === 'string' && rawExperience.trim()
    ? [{ role: rawExperience, company: 'Work Experience', duration: 'As per profile' }]
    : [];

  const rawEducation = tryParseJson(viewWorker?.qualification || viewWorker?.education);
  const displayQualification: string = typeof rawEducation === 'string'
    ? rawEducation
    : Array.isArray(rawEducation) && rawEducation.length > 0
    ? (rawEducation[0]?.degree || rawEducation[0]?.title || rawEducation[0]?.qualification || 'ITI / Industrial Vocational Training')
    : typeof rawEducation === 'object' && rawEducation !== null
    ? (rawEducation.degree || rawEducation.title || rawEducation.qualification || 'ITI / Industrial Vocational Training')
    : 'ITI / Industrial Vocational Training';

  const resumeObj = typeof viewWorker?.resume === 'string'
    ? { url: viewWorker.resume, name: 'Candidate Resume.pdf' }
    : viewWorker?.resume && typeof viewWorker.resume === 'object'
    ? viewWorker.resume
    : null;

  const [activeSubTab, setActiveSubTab] = useState<'job_details' | 'profile' | 'hiring'>(hasJobContext ? 'job_details' : 'profile');
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
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null);
  const [scheduleSuccessMsg, setScheduleSuccessMsg] = useState<string>('');

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
    if (!hasJobContext && activeSubTab !== 'profile') {
      setActiveSubTab('profile');
    }
    const jobTitle = jobData?.title || viewWorker?.jobTitle || viewWorker?.tradeSpecialization || 'Position';
    const compName = jobData?.company || 'Recruitment Team';
    setEmailSubject(`Regarding your application for ${jobTitle}`);
    setEmailMessage(`Hi ${viewWorker?.name || 'Candidate'},\n\nWe would like to connect with you regarding your application for the ${jobTitle} role.\n\nBest regards,\n${compName}`);
    setApplicantStatus(viewWorker?.status || 'applied');
  }, [viewWorker, jobData, hasJobContext]);

  if (!viewWorker) return null;

  const targetJobId = jobData?.id || selectedJobId || viewWorker?.jobId || viewWorker?.job_id || '';
  const displayJobTitle = jobData?.title || viewWorker?.jobTitle || viewWorker?.job_title;

  const handleStatusChange = async (newStatus: string) => {
    setUpdatingStatus(newStatus);
    setApplicantStatus(newStatus);
    if (updateApplicantStatus && targetJobId) {
      try {
        await updateApplicantStatus(targetJobId, viewWorker.userId || viewWorker.id, newStatus);
        if (showToast) showToast(`Status updated to ${capitalize(newStatus)}`, 'success');
      } catch (err: any) {
        if (showToast) showToast(err.message || 'Failed to update status', 'error');
      } finally {
        setUpdatingStatus(null);
      }
    } else {
      setUpdatingStatus(null);
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
      setScheduleSuccessMsg('Interview scheduled & invitation sent successfully to candidate!');
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
            borderRadius: '6px',
            boxShadow: '0 12px 36px rgba(15, 23, 42, 0.16)',
            background: 'var(--surface, #ffffff)',
            border: '1.5px solid #cbd5e1'
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
                {hasJobContext ? 'Application & Candidate Details' : 'Candidate Profile Details'}
              </h3>
              <p style={{ margin: '2px 0 0', fontSize: '12px', color: 'var(--text-secondary)' }}>
                {hasJobContext ? 'View complete profile, job specs & take hiring actions' : 'View candidate qualifications, work experience & contact info'}
              </p>
            </div>
            <button
              className="modal-close"
              onClick={onClose}
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '4px',
                border: '1px solid #cbd5e1',
                background: '#f8fafc',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '15px',
                color: '#475569'
              }}
            >
              <X size={16} />
            </button>
          </div>

          {/* Sticky Tab Bar (only shown when viewing specific job application) */}
          {hasJobContext && (
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
                borderRadius: '6px',
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
                  padding: '8px 12px',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '12.5px',
                  fontWeight: activeSubTab === 'job_details' ? '700' : '600',
                  color: activeSubTab === 'job_details' ? '#ffffff' : 'var(--text-secondary)',
                  background: activeSubTab === 'job_details' ? 'var(--primary, #344BFD)' : 'transparent',
                  boxShadow: activeSubTab === 'job_details' ? '0 2px 8px rgba(52, 75, 253, 0.25)' : 'none',
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
                  padding: '8px 12px',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '12.5px',
                  fontWeight: activeSubTab === 'profile' ? '700' : '600',
                  color: activeSubTab === 'profile' ? '#ffffff' : 'var(--text-secondary)',
                  background: activeSubTab === 'profile' ? 'var(--primary, #344BFD)' : 'transparent',
                  boxShadow: activeSubTab === 'profile' ? '0 2px 8px rgba(52, 75, 253, 0.25)' : 'none',
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
                  padding: '8px 12px',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '12.5px',
                  fontWeight: activeSubTab === 'hiring' ? '700' : '600',
                  color: activeSubTab === 'hiring' ? '#ffffff' : 'var(--text-secondary)',
                  background: activeSubTab === 'hiring' ? 'var(--primary, #344BFD)' : 'transparent',
                  boxShadow: activeSubTab === 'hiring' ? '0 2px 8px rgba(52, 75, 253, 0.25)' : 'none',
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
          )}

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
            {/* Top Candidate Hero Summary Card */}
            <div
              style={{
                background: '#ffffff',
                padding: '14px 16px',
                borderRadius: '6px',
                border: '1.5px solid #cbd5e1',
                boxShadow: '0 2px 6px rgba(15, 23, 42, 0.04)',
                display: 'flex',
                flexDirection: 'column',
                gap: '12px'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                <div
                  style={{
                    width: '52px',
                    height: '52px',
                    borderRadius: '6px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: 'linear-gradient(135deg, #1e3a8a 0%, #344BFD 100%)',
                    color: '#ffffff',
                    fontSize: '20px',
                    fontWeight: '800',
                    overflow: 'hidden',
                    flexShrink: 0,
                    border: '1.5px solid #cbd5e1'
                  }}
                >
                  {viewWorker.profilePictureUrl ? (
                    <img src={viewWorker.profilePictureUrl} alt={viewWorker.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    (viewWorker.name || 'C').charAt(0).toUpperCase()
                  )}
                </div>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', flexWrap: 'wrap' }}>
                    <h3 style={{ margin: 0, fontSize: '16.5px', fontWeight: '800', color: '#0f172a', lineHeight: '1.2' }}>
                      {viewWorker.name || 'Candidate Name'}
                    </h3>
                    {hasJobContext && (
                      <span
                        className={`status-badge status-${applicantStatus}`}
                        style={{
                          fontSize: '11px',
                          padding: '3px 9px',
                          fontWeight: '700',
                          borderRadius: '4px',
                          textTransform: 'uppercase',
                          letterSpacing: '0.5px'
                        }}
                      >
                        {capitalize(applicantStatus)}
                      </span>
                    )}
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px', flexWrap: 'wrap' }}>
                    {viewWorker.aadhaarVerified && (
                      <span style={{ fontSize: '11px', padding: '2px 7px', background: '#dcfce7', color: '#15803d', border: '1px solid #bbf7d0', borderRadius: '4px', fontWeight: '700', display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                        <ShieldCheck size={12} />
                        <span>Verified</span>
                      </span>
                    )}
                    <span style={{ color: '#344BFD', fontWeight: '700', fontSize: '13px' }}>
                      {hasJobContext && displayJobTitle ? (
                        <>Applied for: <strong>{displayJobTitle}</strong></>
                      ) : (
                        <>Role / Trade: <strong>{viewWorker.tradeSpecialization || viewWorker.headline || 'Industrial Specialist'}</strong></>
                      )}
                    </span>
                  </div>
                </div>
              </div>

              {/* Quick Contact Chips Row */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: '#475569', borderTop: '1px solid #e2e8f0', paddingTop: '10px', flexWrap: 'wrap' }}>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', background: '#f8fafc', padding: '5px 10px', borderRadius: '4px', border: '1px solid #cbd5e1', fontWeight: '600', color: '#334155', maxWidth: '100%', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  <Mail size={13} style={{ color: '#2563eb', flexShrink: 0 }} />
                  <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{viewWorker.email || 'Email Not Provided'}</span>
                </div>
                {viewWorker.phone && (
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', background: '#f8fafc', padding: '5px 10px', borderRadius: '4px', border: '1px solid #cbd5e1', fontWeight: '600', color: '#334155' }}>
                    <Phone size={13} style={{ color: '#16a34a', flexShrink: 0 }} />
                    <span>{viewWorker.phone}</span>
                  </div>
                )}
                {viewWorker.location && (
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', background: '#f8fafc', padding: '5px 10px', borderRadius: '4px', border: '1px solid #cbd5e1', fontWeight: '600', color: '#334155' }}>
                    <MapPin size={13} style={{ color: '#dc2626', flexShrink: 0 }} />
                    <span>{viewWorker.location}</span>
                  </div>
                )}
              </div>
            </div>

            {/* TAB 1: JOB DETAILS */}
            {activeSubTab === 'job_details' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {isLoadingJob ? (
                  <div style={{ padding: '40px 20px', textAlign: 'center', background: '#ffffff', borderRadius: '6px', border: '1.5px solid #cbd5e1' }}>
                    <div style={{ position: 'relative', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: '12px' }}>
                      <div style={{ width: '40px', height: '40px', borderRadius: '50%', border: '3.5px solid #cbd5e1', borderTopColor: '#344BFD', animation: 'spin 0.8s linear infinite' }}></div>
                    </div>
                    <p style={{ margin: 0, color: '#0f172a', fontSize: '13.5px', fontWeight: '700' }}>Loading Job Specifications...</p>
                  </div>
                ) : jobData ? (
                  <>
                    {/* Primary Job Info Card */}
                    <div style={{ background: '#ffffff', padding: '16px', borderRadius: '6px', border: '1.5px solid #cbd5e1', boxShadow: '0 2px 6px rgba(15, 23, 42, 0.04)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px', flexWrap: 'wrap' }}>
                        <div style={{ flex: '1 1 200px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                            <h4 style={{ margin: 0, fontSize: '17px', fontWeight: '800', color: '#0f172a', lineHeight: '1.2' }}>
                              {jobData.title}
                            </h4>
                            {jobData.jobType && (
                              <span style={{ fontSize: '11px', padding: '2px 8px', background: '#eff6ff', color: '#1d4ed8', border: '1px solid #bfdbfe', borderRadius: '4px', fontWeight: '700' }}>
                                {jobData.jobType}
                              </span>
                            )}
                          </div>

                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '6px', flexWrap: 'wrap', fontSize: '13px', color: '#475569' }}>
                            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', fontWeight: '600', color: '#1e293b' }}>
                              <Building size={14} style={{ color: '#2563eb' }} />
                              <span>{jobData.company || 'Company Name'}</span>
                            </div>
                            {jobData.location && (
                              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', fontWeight: '500', color: '#475569' }}>
                                <MapPin size={14} style={{ color: '#dc2626' }} />
                                <span>{jobData.location}</span>
                              </div>
                            )}
                          </div>
                        </div>

                        <Link
                          to={`/job/${jobData.id}`}
                          target="_blank"
                          rel="noreferrer"
                          className="btn btn-primary btn-sm"
                          style={{
                            fontSize: '12px',
                            padding: '7px 12px',
                            fontWeight: '700',
                            borderRadius: '4px',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '5px',
                            whiteSpace: 'nowrap'
                          }}
                        >
                          <span>View Job Details Page</span>
                          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                            <line x1="7" y1="17" x2="17" y2="7" />
                            <polyline points="7 7 17 7 17 17" />
                          </svg>
                        </Link>
                      </div>

                      {/* Job Metadata 2-Column Grid */}
                      <div
                        style={{
                          display: 'grid',
                          gridTemplateColumns: '1fr 1fr',
                          gap: '10px',
                          marginTop: '14px',
                          paddingTop: '14px',
                          borderTop: '1px solid #e2e8f0'
                        }}
                      >
                        <div style={{ background: '#ffffff', padding: '10px 12px', borderRadius: '4px', border: '1px solid #cbd5e1' }}>
                          <div style={{ fontSize: '10.5px', color: '#64748b', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px' }}>SALARY / STIPEND</div>
                          <div style={{ fontSize: '13px', fontWeight: '700', color: '#059669', marginTop: '3px' }}>
                            {jobData.salary?.min
                              ? `₹${formatNumber(jobData.salary.min)} - ₹${formatNumber(jobData.salary.max || jobData.salary.min)} / ${jobData.salary.period || 'month'}`
                              : jobData.salaryMin
                              ? `₹${formatNumber(jobData.salaryMin)} - ₹${formatNumber(jobData.salaryMax || jobData.salaryMin)} / month`
                              : 'Salary Negotiable'}
                          </div>
                        </div>

                        <div style={{ background: '#ffffff', padding: '10px 12px', borderRadius: '4px', border: '1px solid #cbd5e1' }}>
                          <div style={{ fontSize: '10.5px', color: '#64748b', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px' }}>VACANCIES</div>
                          <div style={{ fontSize: '13px', fontWeight: '700', color: '#2563eb', marginTop: '3px' }}>
                            {jobData.filledOpenings || 0} / {jobData.openings || 1} Positions Filled
                          </div>
                        </div>

                        <div style={{ background: '#ffffff', padding: '10px 12px', borderRadius: '4px', border: '1px solid #cbd5e1' }}>
                          <div style={{ fontSize: '10.5px', color: '#64748b', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px' }}>EXPERIENCE REQUIRED</div>
                          <div style={{ fontSize: '13px', fontWeight: '700', color: '#0f172a', marginTop: '3px' }}>
                            {jobData.minExperience !== undefined
                              ? `${jobData.minExperience} - ${jobData.maxExperience || jobData.minExperience} Yrs`
                              : 'Any Experience'}
                          </div>
                        </div>

                        <div style={{ background: '#ffffff', padding: '10px 12px', borderRadius: '4px', border: '1px solid #cbd5e1' }}>
                          <div style={{ fontSize: '10.5px', color: '#64748b', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px' }}>POSTED DATE</div>
                          <div style={{ fontSize: '13px', fontWeight: '700', color: '#0f172a', marginTop: '3px' }}>
                            {jobData.postedAt ? new Date(jobData.postedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Recently'}
                          </div>
                        </div>
                      </div>

                      {/* Perks & Amenities Badges */}
                      {(jobData.overtime || jobData.accommodation || jobData.busFacility || jobData.canteen || jobData.joiningBonus || jobData.attendanceBonus) && (
                        <div style={{ marginTop: '12px', paddingTop: '10px', borderTop: '1px dashed #cbd5e1' }}>
                          <div style={{ fontSize: '10.5px', color: '#64748b', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '6px' }}>
                            PERKS & FACILITIES INCLUDED
                          </div>
                          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                            {jobData.overtime && <span style={{ fontSize: '11px', padding: '3px 8px', background: '#e0f2fe', color: '#0369a1', border: '1px solid #bae6fd', borderRadius: '4px', fontWeight: '600' }}>⚡ Overtime Pay</span>}
                            {jobData.accommodation && <span style={{ fontSize: '11px', padding: '3px 8px', background: '#fef3c7', color: '#b45309', border: '1px solid #fde68a', borderRadius: '4px', fontWeight: '600' }}>🏠 Accommodation</span>}
                            {jobData.busFacility && <span style={{ fontSize: '11px', padding: '3px 8px', background: '#dcfce7', color: '#15803d', border: '1px solid #bbf7d0', borderRadius: '4px', fontWeight: '600' }}>🚌 Free Bus Facility</span>}
                            {jobData.canteen && <span style={{ fontSize: '11px', padding: '3px 8px', background: '#fae8ff', color: '#86198f', border: '1px solid #f5d0fe', borderRadius: '4px', fontWeight: '600' }}>🍱 Canteen Meals</span>}
                            {jobData.joiningBonus && <span style={{ fontSize: '11px', padding: '3px 8px', background: '#fee2e2', color: '#b91c1c', border: '1px solid #fecaca', borderRadius: '4px', fontWeight: '600' }}>💰 Joining Bonus</span>}
                            {jobData.attendanceBonus && <span style={{ fontSize: '11px', padding: '3px 8px', background: '#e0e7ff', color: '#4338ca', border: '1px solid #c7d2fe', borderRadius: '4px', fontWeight: '600' }}>🎯 Attendance Bonus</span>}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Job Description Block */}
                    {jobData.description && (
                      <div style={{ background: '#ffffff', padding: '16px', borderRadius: '6px', border: '1.5px solid #cbd5e1' }}>
                        <h4 style={{ margin: '0 0 10px', fontSize: '12px', color: '#475569', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: '700' }}>
                          Job Description
                        </h4>
                        <div style={{ fontSize: '13px', lineHeight: '1.6', color: '#1e293b', whiteSpace: 'pre-line' }}>
                          {jobData.description}
                        </div>
                      </div>
                    )}

                    {/* Requirements Block */}
                    {Array.isArray(jobData.requirements) && jobData.requirements.length > 0 && (
                      <div style={{ background: '#ffffff', padding: '16px', borderRadius: '6px', border: '1.5px solid #cbd5e1' }}>
                        <h4 style={{ margin: '0 0 10px', fontSize: '12px', color: '#475569', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: '700' }}>
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
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {/* Account & Identification Details */}
                <div style={{ background: '#ffffff', padding: '16px', borderRadius: '6px', border: '1.5px solid #cbd5e1', boxShadow: '0 4px 12px rgba(15, 23, 42, 0.06)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                    <div style={{ width: '28px', height: '28px', borderRadius: '4px', background: '#eff6ff', color: '#344BFD', border: '1px solid #bfdbfe', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <User size={16} />
                    </div>
                    <h4 style={{ margin: 0, fontSize: '13px', color: '#0f172a', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: '800' }}>
                      Account & Contact Information
                    </h4>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '10px' }}>
                    <div style={{ background: '#f8fafc', padding: '10px 12px', borderRadius: '4px', border: '1px solid #cbd5e1' }}>
                      <div style={{ fontSize: '11px', color: '#64748b', fontWeight: '700', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Mail size={12} style={{ color: '#2563eb' }} />
                        <span>EMAIL ADDRESS</span>
                      </div>
                      <div style={{ fontSize: '13px', color: '#0f172a', fontWeight: '700', marginTop: '3px', wordBreak: 'break-all' }}>
                        {viewWorker.email || 'Not Provided'}
                      </div>
                    </div>

                    <div style={{ background: '#f8fafc', padding: '10px 12px', borderRadius: '4px', border: '1px solid #cbd5e1' }}>
                      <div style={{ fontSize: '11px', color: '#64748b', fontWeight: '700', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Phone size={12} style={{ color: '#16a34a' }} />
                        <span>PHONE NUMBER</span>
                      </div>
                      <div style={{ fontSize: '13px', color: '#0f172a', fontWeight: '700', marginTop: '3px' }}>
                        {viewWorker.phone || 'Not Provided'}
                      </div>
                    </div>

                    <div style={{ background: '#f8fafc', padding: '10px 12px', borderRadius: '4px', border: '1px solid #cbd5e1' }}>
                      <div style={{ fontSize: '11px', color: '#64748b', fontWeight: '700', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <MapPin size={12} style={{ color: '#dc2626' }} />
                        <span>CURRENT LOCATION</span>
                      </div>
                      <div style={{ fontSize: '13px', color: '#0f172a', fontWeight: '700', marginTop: '3px' }}>
                        {viewWorker.location || 'Maharashtra, India'}
                      </div>
                    </div>

                    <div style={{ background: '#f8fafc', padding: '10px 12px', borderRadius: '4px', border: '1px solid #cbd5e1' }}>
                      <div style={{ fontSize: '11px', color: '#64748b', fontWeight: '700', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <ShieldCheck size={12} style={{ color: '#15803d' }} />
                        <span>GOVT VERIFICATION</span>
                      </div>
                      <div style={{ fontSize: '13px', color: viewWorker.aadhaarVerified ? '#15803d' : '#64748b', fontWeight: '700', marginTop: '3px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        {viewWorker.aadhaarVerified ? (
                          <>
                            <CheckCircle2 size={14} style={{ color: '#15803d' }} />
                            <span>Aadhaar Verified ✓</span>
                          </>
                        ) : 'Unverified'}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Professional Trade & Skills */}
                <div style={{ background: '#ffffff', padding: '16px', borderRadius: '6px', border: '1.5px solid #cbd5e1', boxShadow: '0 4px 12px rgba(15, 23, 42, 0.06)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                    <div style={{ width: '28px', height: '28px', borderRadius: '4px', background: '#eff6ff', color: '#344BFD', border: '1px solid #bfdbfe', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Wrench size={16} />
                    </div>
                    <h4 style={{ margin: 0, fontSize: '13px', color: '#0f172a', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: '800' }}>
                      Trade & Technical Specialization
                    </h4>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '10px' }}>
                      <div style={{ background: '#f8fafc', padding: '10px 12px', borderRadius: '4px', border: '1px solid #cbd5e1' }}>
                        <div style={{ fontSize: '11px', color: '#64748b', fontWeight: '700', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <Wrench size={12} style={{ color: '#344BFD' }} />
                          <span>PRIMARY TRADE</span>
                        </div>
                        <div style={{ fontSize: '14px', color: '#344BFD', fontWeight: '800', marginTop: '3px' }}>
                          {viewWorker.tradeSpecialization || viewWorker.headline || 'Industrial Specialist'}
                        </div>
                      </div>

                      <div style={{ background: '#f8fafc', padding: '10px 12px', borderRadius: '4px', border: '1px solid #cbd5e1' }}>
                        <div style={{ fontSize: '11px', color: '#64748b', fontWeight: '700', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <Briefcase size={12} style={{ color: '#0284c7' }} />
                          <span>TOTAL EXPERIENCE</span>
                        </div>
                        <div style={{ fontSize: '13.5px', color: '#0f172a', fontWeight: '800', marginTop: '3px' }}>
                          {viewWorker.totalExperience ? `${viewWorker.totalExperience} Years` : viewWorker.experienceYears ? `${viewWorker.experienceYears} Years` : '1+ Years Experience'}
                        </div>
                      </div>
                    </div>

                    {skillsList.length > 0 && (
                      <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '4px', border: '1px solid #cbd5e1' }}>
                        <div style={{ fontSize: '11px', color: '#64748b', fontWeight: '700', textTransform: 'uppercase', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <Award size={13} style={{ color: '#1d4ed8' }} />
                          <span>TECHNICAL SKILLS & CERTIFICATIONS</span>
                        </div>
                        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                          {skillsList.map((sk: string, idx: number) => (
                            <span key={idx} style={{ fontSize: '12px', padding: '4px 10px', background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '4px', fontWeight: '700', color: '#1d4ed8', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                              <span>✓</span>
                              <span>{sk}</span>
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Education & Qualifications */}
                <div style={{ background: '#ffffff', padding: '16px', borderRadius: '6px', border: '1.5px solid #cbd5e1', boxShadow: '0 4px 12px rgba(15, 23, 42, 0.06)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                    <div style={{ width: '28px', height: '28px', borderRadius: '4px', background: '#eff6ff', color: '#344BFD', border: '1px solid #bfdbfe', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <GraduationCap size={16} />
                    </div>
                    <h4 style={{ margin: 0, fontSize: '13px', color: '#0f172a', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: '800' }}>
                      Education & Qualifications
                    </h4>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '10px' }}>
                    <div style={{ background: '#f8fafc', padding: '10px 12px', borderRadius: '4px', border: '1px solid #cbd5e1' }}>
                      <div style={{ fontSize: '11px', color: '#64748b', fontWeight: '700', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <GraduationCap size={12} style={{ color: '#7c3aed' }} />
                        <span>HIGHEST QUALIFICATION</span>
                      </div>
                      <div style={{ fontSize: '13.5px', color: '#0f172a', fontWeight: '800', marginTop: '3px' }}>
                        {displayQualification}
                      </div>
                    </div>

                    <div style={{ background: '#f8fafc', padding: '10px 12px', borderRadius: '4px', border: '1px solid #cbd5e1' }}>
                      <div style={{ fontSize: '11px', color: '#64748b', fontWeight: '700', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Award size={12} style={{ color: '#059669' }} />
                        <span>TRADE CERTIFICATE</span>
                      </div>
                      <div style={{ fontSize: '13.5px', color: '#0f172a', fontWeight: '800', marginTop: '3px' }}>
                        {viewWorker.aadhaarVerified ? 'Government Certified Trade Specialist' : 'Standard Vocational Certificate'}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Job & Shift Preferences */}
                <div style={{ background: '#ffffff', padding: '16px', borderRadius: '6px', border: '1.5px solid #cbd5e1', boxShadow: '0 4px 12px rgba(15, 23, 42, 0.06)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                    <div style={{ width: '28px', height: '28px', borderRadius: '4px', background: '#eff6ff', color: '#344BFD', border: '1px solid #bfdbfe', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Clock size={16} />
                    </div>
                    <h4 style={{ margin: 0, fontSize: '13px', color: '#0f172a', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: '800' }}>
                      Work & Shift Preferences
                    </h4>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '10px' }}>
                    <div style={{ background: '#f8fafc', padding: '10px 12px', borderRadius: '4px', border: '1px solid #cbd5e1' }}>
                      <div style={{ fontSize: '11px', color: '#64748b', fontWeight: '700', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Clock size={12} style={{ color: '#d97706' }} />
                        <span>PREFERRED SHIFT</span>
                      </div>
                      <div style={{ fontSize: '13px', color: '#0f172a', fontWeight: '700', marginTop: '3px' }}>
                        {viewWorker.preferredShift || 'Flexible / Any Shift'}
                      </div>
                    </div>

                    <div style={{ background: '#f8fafc', padding: '10px 12px', borderRadius: '4px', border: '1px solid #cbd5e1' }}>
                      <div style={{ fontSize: '11px', color: '#64748b', fontWeight: '700', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <DollarSign size={12} style={{ color: '#059669' }} />
                        <span>EXPECTED SALARY</span>
                      </div>
                      <div style={{ fontSize: '13px', color: '#0f172a', fontWeight: '700', marginTop: '3px' }}>
                        {viewWorker.expectedSalary ? `₹${formatNumber(viewWorker.expectedSalary)} / month` : 'As per Industry Standards'}
                      </div>
                    </div>

                    <div style={{ background: '#f8fafc', padding: '10px 12px', borderRadius: '4px', border: '1px solid #cbd5e1' }}>
                      <div style={{ fontSize: '11px', color: '#64748b', fontWeight: '700', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Bus size={12} style={{ color: '#2563eb' }} />
                        <span>BUS FACILITY</span>
                      </div>
                      <div style={{ fontSize: '13px', color: '#0f172a', fontWeight: '700', marginTop: '3px' }}>
                        {viewWorker.requiresBus ? 'Required' : 'Not Required'}
                      </div>
                    </div>

                    <div style={{ background: '#f8fafc', padding: '10px 12px', borderRadius: '4px', border: '1px solid #cbd5e1' }}>
                      <div style={{ fontSize: '11px', color: '#64748b', fontWeight: '700', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Home size={12} style={{ color: '#ea580c' }} />
                        <span>ACCOMMODATION</span>
                      </div>
                      <div style={{ fontSize: '13px', color: '#0f172a', fontWeight: '700', marginTop: '3px' }}>
                        {viewWorker.requiresAccommodation ? 'Required' : 'Not Required'}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Experience section */}
                {experienceList.length > 0 && (
                  <div style={{ background: '#ffffff', padding: '16px', borderRadius: '6px', border: '1.5px solid #cbd5e1', boxShadow: '0 4px 12px rgba(15, 23, 42, 0.06)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                      <div style={{ width: '28px', height: '28px', borderRadius: '4px', background: '#eff6ff', color: '#344BFD', border: '1px solid #bfdbfe', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Briefcase size={16} />
                      </div>
                      <h4 style={{ margin: 0, fontSize: '13px', color: '#0f172a', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: '800' }}>
                        Work Experience History
                      </h4>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      {experienceList.map((exp: any, idx: number) => {
                        if (!exp) return null;
                        if (typeof exp === 'string') {
                          return (
                            <div key={idx} style={{ padding: '12px', background: '#f8fafc', borderRadius: '4px', border: '1px solid #cbd5e1' }}>
                              <div style={{ fontSize: '13.5px', color: '#0f172a', fontWeight: '700' }}>{exp}</div>
                            </div>
                          );
                        }
                        return (
                          <div key={idx} style={{ padding: '12px', background: '#f8fafc', borderRadius: '4px', border: '1px solid #cbd5e1' }}>
                            <div style={{ fontSize: '14px', fontWeight: '800', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '6px' }}>
                              <Building size={14} style={{ color: '#344BFD' }} />
                              <span>{exp.role || exp.title || exp.company || 'Industrial Role'}</span>
                            </div>
                            <div style={{ fontSize: '12.5px', color: '#475569', fontWeight: '600', marginTop: '3px', display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                              {exp.company && <span>{exp.company}</span>}
                              {(exp.duration || exp.years || exp.startDate) && (
                                <>
                                  {exp.company && <span>•</span>}
                                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                                    <Calendar size={12} />
                                    <span>{exp.duration || (exp.years ? `${exp.years} Years` : `${exp.startDate || ''} - ${exp.endDate || 'Present'}`)}</span>
                                  </span>
                                </>
                              )}
                            </div>
                            {exp.description && (
                              <p style={{ margin: '6px 0 0', fontSize: '12.5px', color: '#64748b', lineHeight: '1.4' }}>{exp.description}</p>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Resume Card */}
                {resumeObj && (resumeObj.url || resumeObj.name) && (
                  <div style={{ background: '#ffffff', padding: '16px', borderRadius: '6px', border: '1.5px solid #cbd5e1', boxShadow: '0 4px 12px rgba(15, 23, 42, 0.06)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', flexWrap: 'wrap' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div style={{ width: '42px', height: '42px', borderRadius: '4px', background: '#eff6ff', color: '#344BFD', border: '1px solid #bfdbfe', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <FileText size={22} />
                      </div>
                      <div>
                        <div style={{ fontSize: '14px', fontWeight: '800', color: '#0f172a' }}>
                          {resumeObj.name || 'Candidate Resume'}
                        </div>
                        <div style={{ fontSize: '11.5px', color: '#64748b', fontWeight: '600' }}>PDF Resume Attachment</div>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => setPreviewResume(resumeObj)}
                      style={{
                        padding: '8px 16px',
                        borderRadius: '4px',
                        border: '1.5px solid #344BFD',
                        background: '#eff6ff',
                        color: '#344BFD',
                        fontWeight: '700',
                        fontSize: '12.5px',
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        transition: 'all 0.18s ease'
                      }}
                    >
                      <FileText size={15} />
                      <span>Preview Resume Document</span>
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* TAB 3: STATUS & INTERVIEW */}
            {activeSubTab === 'hiring' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {/* Status Update Pipeline */}
                <div style={{ background: '#ffffff', padding: '16px', borderRadius: '6px', border: '1.5px solid #cbd5e1' }}>
                  <h4 style={{ margin: '0 0 12px', fontSize: '12px', color: '#475569', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: '700' }}>
                    Update Application Status
                  </h4>

                  <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '6px', marginBottom: '14px' }}>
                    {['applied', 'reviewed', 'shortlisted', 'accepted', 'rejected'].map((st) => (
                      <button
                        key={st}
                        type="button"
                        disabled={!!updatingStatus}
                        onClick={() => handleStatusChange(st)}
                        style={{
                          flex: '1 0 auto',
                          padding: '7px 12px',
                          borderRadius: '4px',
                          border: applicantStatus === st ? '2px solid #344BFD' : '1px solid #cbd5e1',
                          background: applicantStatus === st ? '#eef2ff' : '#ffffff',
                          color: applicantStatus === st ? '#344BFD' : '#475569',
                          fontWeight: applicantStatus === st ? '700' : '600',
                          fontSize: '12px',
                          cursor: updatingStatus ? 'not-allowed' : 'pointer',
                          textTransform: 'capitalize',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px'
                        }}
                      >
                        {updatingStatus === st ? (
                          <>
                            <svg className="animate-spin" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" style={{ animation: 'spin 0.8s linear infinite' }}>
                              <circle cx="12" cy="12" r="10" stroke="rgba(0,0,0,0.2)" />
                              <path d="M4 12a8 8 0 0 1 8-8" stroke="currentColor" strokeLinecap="round" />
                            </svg>
                            <span>Updating...</span>
                          </>
                        ) : (
                          st === 'accepted' ? 'Hired / Accepted ✓' : st
                        )}
                      </button>
                    ))}
                  </div>

                  <div style={{ fontSize: '12.5px', color: '#475569' }}>
                    Current Pipeline State: <strong style={{ color: '#344BFD', textTransform: 'uppercase' }}>{applicantStatus}</strong>
                  </div>
                </div>

                {/* Schedule Interview Block */}
                <div style={{ background: '#ffffff', padding: '16px', borderRadius: '6px', border: '1.5px solid #cbd5e1' }}>
                  <h4 style={{ margin: '0 0 12px', fontSize: '12px', color: '#475569', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: '700' }}>
                    Schedule In-Person / Online Interview
                  </h4>

                  {scheduleSuccessMsg && (
                    <div style={{
                      background: '#ECFDF5',
                      color: '#065F46',
                      border: '1.5px solid #A7F3D0',
                      padding: '10px 14px',
                      borderRadius: '6px',
                      fontSize: '13px',
                      fontWeight: '600',
                      marginBottom: '12px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px'
                    }}>
                      <CheckCircle2 size={16} style={{ color: '#059669', flexShrink: 0 }} />
                      <span>{scheduleSuccessMsg}</span>
                    </div>
                  )}

                  <form onSubmit={handleScheduleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px' }}>
                      <div>
                        <label style={{ display: 'block', fontSize: '11.5px', fontWeight: '700', color: '#475569', marginBottom: '4px' }}>
                          INTERVIEW DATE *
                        </label>
                        <input
                          type="date"
                          value={interviewDate}
                          onChange={(e) => setInterviewDate(e.target.value)}
                          required
                          style={{ width: '100%', height: '38px', padding: '8px 12px', borderRadius: '4px', border: '1px solid #cbd5e1', fontSize: '13px', background: '#ffffff' }}
                        />
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: '11.5px', fontWeight: '700', color: '#475569', marginBottom: '4px' }}>
                          INTERVIEW TIME *
                        </label>
                        <input
                          type="time"
                          value={interviewTime}
                          onChange={(e) => setInterviewTime(e.target.value)}
                          required
                          style={{ width: '100%', height: '38px', padding: '8px 12px', borderRadius: '4px', border: '1px solid #cbd5e1', fontSize: '13px', background: '#ffffff' }}
                        />
                      </div>
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '11.5px', fontWeight: '700', color: '#475569', marginBottom: '4px' }}>
                        VENUE ADDRESS / LOCATION DETAILS *
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Factory Premises Gate 2, MIDC Chakan, Pune"
                        value={venueAddress}
                        onChange={(e) => setVenueAddress(e.target.value)}
                        required
                        style={{ width: '100%', height: '38px', padding: '8px 12px', borderRadius: '4px', border: '1px solid #cbd5e1', fontSize: '13px', background: '#ffffff' }}
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '11.5px', fontWeight: '700', color: '#475569', marginBottom: '4px' }}>
                        GOOGLE MAPS LOCATION LINK (OPTIONAL)
                      </label>
                      <input
                        type="url"
                        placeholder="https://maps.google.com/..."
                        value={mapsLink}
                        onChange={(e) => setMapsLink(e.target.value)}
                        style={{ width: '100%', height: '38px', padding: '8px 12px', borderRadius: '4px', border: '1px solid #cbd5e1', fontSize: '13px', background: '#ffffff' }}
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={isScheduling}
                      style={{
                        width: '100%',
                        height: '40px',
                        fontSize: '13px',
                        padding: '9px 16px',
                        fontWeight: '700',
                        borderRadius: '4px',
                        background: '#344BFD',
                        color: '#ffffff',
                        border: 'none',
                        marginTop: '4px',
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px',
                        cursor: isScheduling ? 'not-allowed' : 'pointer',
                        opacity: isScheduling ? 0.8 : 1,
                        boxShadow: '0 2px 6px rgba(52, 75, 253, 0.25)'
                      }}
                    >
                      {isScheduling ? (
                        <>
                          <svg className="animate-spin" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" style={{ animation: 'spin 0.8s linear infinite' }}>
                            <circle cx="12" cy="12" r="10" stroke="rgba(255,255,255,0.3)" />
                            <path d="M4 12a8 8 0 0 1 8-8" stroke="currentColor" strokeLinecap="round" />
                          </svg>
                          <span>Scheduling Interview...</span>
                        </>
                      ) : (
                        <>
                          <Calendar size={15} />
                          <span>Send Interview Call Invitation</span>
                        </>
                      )}
                    </button>
                  </form>
                </div>

                {/* Send Direct Email */}
                <div style={{ background: '#ffffff', padding: '16px', borderRadius: '6px', border: '1.5px solid #cbd5e1' }}>
                  <h4 style={{ margin: '0 0 12px', fontSize: '12px', color: '#475569', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: '700' }}>
                    Send Direct Email Message
                  </h4>

                  <form onSubmit={handleSendEmailSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '11.5px', fontWeight: '700', color: '#475569', marginBottom: '4px' }}>
                        EMAIL SUBJECT *
                      </label>
                      <input
                        type="text"
                        value={emailSubject}
                        onChange={(e) => setEmailSubject(e.target.value)}
                        required
                        style={{ width: '100%', height: '38px', padding: '8px 12px', borderRadius: '4px', border: '1px solid #cbd5e1', fontSize: '13px', background: '#ffffff' }}
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '11.5px', fontWeight: '700', color: '#475569', marginBottom: '4px' }}>
                        MESSAGE *
                      </label>
                      <textarea
                        rows={4}
                        value={emailMessage}
                        onChange={(e) => setEmailMessage(e.target.value)}
                        required
                        style={{ width: '100%', padding: '8px 12px', borderRadius: '4px', border: '1px solid #cbd5e1', fontSize: '13px', background: '#ffffff', resize: 'vertical' }}
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={isSendingEmail}
                      style={{
                        width: '100%',
                        height: '40px',
                        fontSize: '13px',
                        padding: '9px 16px',
                        fontWeight: '700',
                        borderRadius: '4px',
                        background: '#2563eb',
                        color: '#ffffff',
                        border: 'none',
                        marginTop: '4px',
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px',
                        cursor: isSendingEmail ? 'not-allowed' : 'pointer',
                        opacity: isSendingEmail ? 0.8 : 1,
                        boxShadow: '0 2px 6px rgba(37, 99, 235, 0.25)'
                      }}
                    >
                      {isSendingEmail ? (
                        <>
                          <svg className="animate-spin" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" style={{ animation: 'spin 0.8s linear infinite' }}>
                            <circle cx="12" cy="12" r="10" stroke="rgba(255,255,255,0.3)" />
                            <path d="M4 12a8 8 0 0 1 8-8" stroke="currentColor" strokeLinecap="round" />
                          </svg>
                          <span>Sending Email...</span>
                        </>
                      ) : (
                        <>
                          <Mail size={15} />
                          <span>Send Custom Email Notification</span>
                        </>
                      )}
                    </button>
                  </form>
                </div>
              </div>
            )}
          </div>

          {/* Modal Action Footer */}
          <div
            style={{
              padding: '12px 16px',
              borderTop: '1.5px solid #cbd5e1',
              background: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '10px',
              flexShrink: 0
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              {viewWorker.phone && (
                <a
                  href={`tel:${viewWorker.phone}`}
                  style={{
                    padding: '8px 14px',
                    borderRadius: '4px',
                    background: '#16a34a',
                    color: '#ffffff',
                    fontWeight: '700',
                    fontSize: '12.5px',
                    textDecoration: 'none',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  <Phone size={14} />
                  <span>Call Candidate</span>
                </a>
              )}
              {viewWorker.email && (
                <a
                  href={`mailto:${viewWorker.email}`}
                  style={{
                    padding: '8px 14px',
                    borderRadius: '4px',
                    background: '#eff6ff',
                    border: '1px solid #bfdbfe',
                    color: '#1d4ed8',
                    fontWeight: '700',
                    fontSize: '12.5px',
                    textDecoration: 'none',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  <Mail size={14} />
                  <span>Email</span>
                </a>
              )}
            </div>

            <button
              type="button"
              onClick={onClose}
              style={{
                padding: '8px 18px',
                borderRadius: '4px',
                border: '1.5px solid #cbd5e1',
                background: '#f8fafc',
                color: '#334155',
                fontWeight: '700',
                fontSize: '12.5px',
                cursor: 'pointer'
              }}
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </>,
    document.body
  );
};
