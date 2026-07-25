import React, { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useJobs } from '../../hooks/useJobs';
import { useToast } from '../../hooks/useToast';
import { apiFetch } from '../../utils/api';
import { getInitials, timeAgo, capitalize } from '../../utils/helpers';
import { ResumePreviewModal } from '../../components/profile/ResumePreviewModal';

export const JobApplicantsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { updateApplicantStatus, scheduleInterview, sendCustomEmail } = useJobs();
  const { showToast } = useToast();

  const [job, setJob] = useState<any>(null);
  const [applicants, setApplicants] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [previewResume, setPreviewResume] = useState<any>(null);
  const [viewWorker, setViewWorker] = useState<any>(null);

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

  useEffect(() => {
    if (!currentUser) {
      showToast('Please log in to view this page', 'warning');
      navigate('/login');
      return;
    }
    if (currentUser.role !== 'employer') {
      showToast('Access denied: Employers only', 'error');
      navigate('/dashboard');
      return;
    }
  }, [currentUser, navigate, showToast]);

  const loadData = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    try {
      // 1. Fetch job details
      const jobRes = await apiFetch(`/api/v1/jobs/${id}`);
      const jobJson = await jobRes.json();
      if (!jobRes.ok) throw new Error(jobJson.message || 'Failed to fetch job details');
      
      const jobData = jobJson.data;
      if (jobData.employerId !== currentUser?.id) {
        showToast('Unauthorized access to this job listing', 'error');
        navigate('/dashboard');
        return;
      }
      setJob(jobData);

      // 2. Fetch applicants list
      const appsRes = await apiFetch(`/api/v1/jobs/${id}/applicants`);
      const appsJson = await appsRes.json();
      if (appsRes.ok && appsJson.success) {
        setApplicants(appsJson.data || []);
      }
    } catch (err: any) {
      console.error(err);
      showToast(err.message || 'Failed to load applicants', 'error');
    } finally {
      setLoading(false);
    }
  }, [id, currentUser, navigate, showToast]);

  useEffect(() => {
    if (currentUser && currentUser.role === 'employer') {
      loadData();
    }
  }, [currentUser, loadData]);

  const handleStatusChange = async (userId: string, newStatus: string) => {
    if (!id) return;
    try {
      await updateApplicantStatus(id, userId, newStatus);
      setApplicants(prev => 
        prev.map(a => a.userId === userId ? { ...a, status: newStatus } : a)
      );
      showToast('Applicant status updated', 'success');
    } catch (err: any) {
      showToast(err.message || 'Failed to update status', 'error');
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
        <svg className="animate-spin" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="3" style={{ animation: 'spin 1s linear infinite' }}>
          <circle cx="12" cy="12" r="10" stroke="rgba(0,0,0,0.1)"/>
          <path d="M4 12a8 8 0 0 1 8-8" strokeLinecap="round"/>
        </svg>
      </div>
    );
  }

  if (!job) return null;

  return (
    <div className="container" style={{ padding: 'var(--space-8) var(--space-4)', maxWidth: '800px', margin: '0 auto', paddingBottom: '100px' }}>
      {/* Back to Dashboard */}
      <div style={{ marginBottom: 'var(--space-6)' }}>
        <Link to="/dashboard?tab=manage" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)', textDecoration: 'none', fontWeight: '600', fontSize: 'var(--fs-sm)' }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/>
          </svg>
          Back to Dashboard
        </Link>
      </div>

      {/* Header */}
      <div className="activity-card" style={{ padding: 'var(--space-6)', marginBottom: 'var(--space-6)', display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <h1 style={{ fontSize: 'var(--fs-2xl)', fontWeight: 'var(--fw-bold)', margin: 0 }}>{job.title}</h1>
        <p style={{ color: 'var(--text-secondary)', margin: 0, fontSize: 'var(--fs-sm)' }}>{job.company} · {job.location}</p>
        <div style={{ display: 'flex', gap: '8px', marginTop: 'var(--space-2)' }}>
          <span className={`status-badge status-${job.status?.toLowerCase()}`}>{capitalize(job.status)}</span>
          <span style={{ fontSize: 'var(--fs-sm)', color: 'var(--text-tertiary)', alignSelf: 'center' }}>({applicants.length} applicants)</span>
        </div>
      </div>

      <h2 style={{ fontSize: 'var(--fs-lg)', fontWeight: 'var(--fw-semibold)', marginBottom: 'var(--space-4)' }}>List of Applicants</h2>

      {applicants.length > 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
          {applicants.map((a, i) => (
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
                  onChange={(e) => handleStatusChange(a.userId, e.target.value)}
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
      ) : (
        <div className="empty-state">
          <h3>No applicants yet</h3>
          <p>We will notify you when candidates apply for this job listing.</p>
        </div>
      )}

      {/* Preview Resume Modal */}
      {previewResume && (
        <ResumePreviewModal resume={previewResume} onClose={() => setPreviewResume(null)} userId={previewResume?.userId} />
      )}

      {/* Candidate Details Modal */}
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
                          handleStatusChange(viewWorker.userId, e.target.value);
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
    </div>
  );
};
