import React, { useEffect, useState } from 'react';
import { AdminApiService } from '../services/adminApi';
import { useToast } from '../../../hooks/useToast';
import { formatNumber } from '../../../utils/helpers';

export const JobApprovalPage: React.FC = () => {
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedJob, setSelectedJob] = useState<any>(null);
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  const { showToast } = useToast();

  const fetchPendingJobs = async () => {
    try {
      setLoading(true);
      const res = await AdminApiService.getPendingJobs();
      setJobs(res.data || []);
    } catch (err: any) {
      showToast(err.message || 'Failed to fetch pending jobs', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPendingJobs();
  }, []);

  const handleOpenDetails = async (jobId: string) => {
    try {
      const details = await AdminApiService.getJob(jobId);
      setSelectedJob(details);
      setDetailsModalOpen(true);
    } catch (err: any) {
      showToast('Failed to fetch job details', 'error');
    }
  };

  const handleApprove = async (jobId: string) => {
    setActionLoading(true);
    try {
      await AdminApiService.approveJob(jobId);
      showToast('Job listing approved successfully and published', 'success');
      setDetailsModalOpen(false);
      fetchPendingJobs();
    } catch (err: any) {
      showToast(err.message || 'Failed to approve job', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleRejectClick = () => {
    setRejectReason('');
    setRejectModalOpen(true);
  };

  const handleRejectSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rejectReason.trim()) {
      showToast('Please enter a reason for rejection', 'warning');
      return;
    }

    setActionLoading(true);
    try {
      await AdminApiService.rejectJob(selectedJob.id, rejectReason);
      showToast('Job listing rejected. Employer will be notified.', 'info');
      setRejectModalOpen(false);
      setDetailsModalOpen(false);
      fetchPendingJobs();
    } catch (err: any) {
      showToast(err.message || 'Failed to reject job', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div>
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: '800', color: 'var(--text-primary)' }}>Job Approvals Queue</h1>
        <p style={{ color: 'var(--text-secondary)', marginTop: '4px' }}>Review and approve new job postings from factories and employers</p>
      </div>

      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} style={{ height: '180px', background: '#e2e8f0', borderRadius: '8px', animation: 'pulse 1.5s infinite' }}></div>
          ))}
        </div>
      ) : jobs.length === 0 ? (
        <div className="admin-card" style={{ padding: '60px 24px', textAlign: 'center' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>🎉</div>
          <h3 style={{ fontSize: '18px', fontWeight: '700', color: 'var(--text-primary)' }}>Queue is empty!</h3>
          <p style={{ color: 'var(--text-secondary)', marginTop: '4px' }}>All newly posted jobs have been reviewed.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {jobs.map((job) => (
            <div className="admin-card" key={job.id} style={{ margin: 0, padding: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
                <div>
                  <span className="status-badge status-pending" style={{ marginBottom: '8px' }}>PENDING REVIEW</span>
                  <h3 style={{ fontSize: '18px', fontWeight: '800', color: 'var(--text-primary)' }}>{job.title}</h3>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginTop: '4px', color: 'var(--text-secondary)', fontSize: '14px' }}>
                    <span style={{ fontWeight: '600', color: 'var(--text-primary)' }}>{job.company}</span>
                    <span>•</span>
                    <span>{job.location} ({job.midc_zone || 'General'})</span>
                  </div>
                  <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', marginTop: '16px', fontSize: '13px', color: 'var(--text-secondary)' }}>
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '6px', color: 'var(--primary)', flexShrink: 0 }}>
                        <rect x="2" y="6" width="20" height="12" rx="2" />
                        <circle cx="12" cy="12" r="2" />
                        <path d="M6 12h.01M18 12h.01" />
                      </svg>
                      <strong>Salary:</strong>&nbsp;₹{formatNumber(job.salary_min)} - ₹{formatNumber(job.salary_max)} / month
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '6px', color: 'var(--primary)', flexShrink: 0 }}>
                        <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
                        <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
                      </svg>
                      <strong>Exp:</strong>&nbsp;{job.min_experience} - {job.max_experience} Yrs
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '6px', color: 'var(--primary)', flexShrink: 0 }}>
                        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                        <circle cx="9" cy="7" r="4" />
                        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                      </svg>
                      <strong>Vacancies:</strong>&nbsp;{job.openings} openings
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '6px', color: 'var(--primary)', flexShrink: 0 }}>
                        <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                        <line x1="16" y1="2" x2="16" y2="6" />
                        <line x1="8" y1="2" x2="8" y2="6" />
                        <line x1="3" y1="10" x2="21" y2="10" />
                      </svg>
                      <strong>Posted:</strong>&nbsp;{new Date(job.posted_at).toLocaleDateString()}
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', justifyContent: 'center', minWidth: '150px' }}>
                  <button className="btn btn-outline" style={{ padding: '8px 16px', fontSize: '13px', width: '100%' }} onClick={() => handleOpenDetails(job.id)}>
                    View Details
                  </button>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button className="btn btn-primary" style={{ padding: '8px 12px', fontSize: '13px', flex: 1, background: 'var(--success)' }} onClick={() => { setSelectedJob(job); handleApprove(job.id); }} disabled={actionLoading}>
                      Approve
                    </button>
                    <button className="btn" style={{ padding: '8px 12px', fontSize: '13px', flex: 1, background: 'var(--danger)', color: 'white' }} onClick={() => { setSelectedJob(job); handleRejectClick(); }}>
                      Reject
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Details Modal */}
      {detailsModalOpen && selectedJob && (
        <div className="drawer-backdrop" onClick={() => setDetailsModalOpen(false)}>
          <div className="admin-drawer" style={{ width: '600px' }} onClick={(e) => e.stopPropagation()}>
            <div className="drawer-header">
              <h2 className="drawer-title">Review Job Posting</h2>
              <button className="drawer-close-btn" onClick={() => setDetailsModalOpen(false)}>✕</button>
            </div>
            
            <div className="drawer-body">
              <div className="drawer-section">
                <h3 style={{ fontSize: '20px', fontWeight: '800' }}>{selectedJob.title}</h3>
                <p style={{ fontSize: '15px', color: 'var(--text-secondary)' }}>
                  <strong>Company:</strong> {selectedJob.company} <br />
                  <strong>Employer:</strong> {selectedJob.employer_name} ({selectedJob.employer_email} | {selectedJob.employer_phone})
                </p>
              </div>

              <div className="drawer-section">
                <span className="drawer-section-title">Job Metadata</span>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px 12px', fontSize: '14px' }}>
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '8px', color: 'var(--primary)', flexShrink: 0 }}>
                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                      <circle cx="12" cy="10" r="3" />
                    </svg>
                    <strong>MIDC Zone:</strong>&nbsp;{selectedJob.midc_zone || 'None'}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '8px', color: 'var(--primary)', flexShrink: 0 }}>
                      <circle cx="12" cy="12" r="3" />
                      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
                    </svg>
                    <strong>Trade:</strong>&nbsp;{selectedJob.trade || 'None'}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '8px', color: 'var(--primary)', flexShrink: 0 }}>
                      <circle cx="12" cy="12" r="10" />
                      <polyline points="12 6 12 12 16 14" />
                    </svg>
                    <strong>Job Type:</strong>&nbsp;{selectedJob.job_type}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '8px', color: 'var(--primary)', flexShrink: 0 }}>
                      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                      <polyline points="9 22 9 12 15 12 15 22" />
                    </svg>
                    <strong>Work Mode:</strong>&nbsp;{selectedJob.work_mode}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '8px', color: 'var(--primary)', flexShrink: 0 }}>
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                      <circle cx="12" cy="7" r="4" />
                    </svg>
                    <strong>Gender preference:</strong>&nbsp;{selectedJob.gender || 'Any'}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '8px', color: 'var(--primary)', flexShrink: 0 }}>
                      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                      <circle cx="9" cy="7" r="4" />
                      <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                    </svg>
                    <strong>Vacancies:</strong>&nbsp;{selectedJob.openings}
                  </div>
                </div>
              </div>

              <div className="drawer-section">
                <span className="drawer-section-title">Salary & Perks</span>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '14px' }}>
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '8px', color: 'var(--primary)', flexShrink: 0 }}>
                      <rect x="2" y="6" width="20" height="12" rx="2" />
                      <circle cx="12" cy="12" r="2" />
                      <path d="M6 12h.01M18 12h.01" />
                    </svg>
                    <strong>Salary:</strong>&nbsp;₹{formatNumber(selectedJob.salary_min)} - ₹{formatNumber(selectedJob.salary_max)} per month
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '8px', color: 'var(--primary)', flexShrink: 0 }}>
                      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
                    </svg>
                    <strong>Overtime Offered:</strong>&nbsp;{selectedJob.overtime ? 'Yes' : 'No'}
                  </div>
                  <div style={{ fontSize: '13px', color: 'var(--text-secondary)', paddingLeft: '22px' }}>
                    Accomodation: {selectedJob.accommodation ? 'Provided' : 'No'} | Canteen: {selectedJob.canteen ? 'Available' : 'No'} | Bus Service: {selectedJob.bus_facility ? 'Provided' : 'No'}
                  </div>
                </div>
              </div>

              <div className="drawer-section">
                <span className="drawer-section-title">Job Description</span>
                <p style={{ fontSize: '14px', lineHeight: '1.6', whiteSpace: 'pre-line' }}>{selectedJob.description}</p>
              </div>

              {selectedJob.requirements && selectedJob.requirements.length > 0 && (
                <div className="drawer-section">
                  <span className="drawer-section-title">Requirements</span>
                  <ul style={{ listStyleType: 'disc', paddingLeft: '20px', fontSize: '14px' }}>
                    {selectedJob.requirements.map((req: string, i: number) => <li key={i}>{req}</li>)}
                  </ul>
                </div>
              )}

              {selectedJob.responsibilities && selectedJob.responsibilities.length > 0 && (
                <div className="drawer-section">
                  <span className="drawer-section-title">Responsibilities</span>
                  <ul style={{ listStyleType: 'disc', paddingLeft: '20px', fontSize: '14px' }}>
                    {selectedJob.responsibilities.map((resp: string, i: number) => <li key={i}>{resp}</li>)}
                  </ul>
                </div>
              )}
            </div>

            <div style={{ padding: '20px', borderTop: '1px solid var(--border)', display: 'flex', gap: '12px' }}>
              <button className="btn btn-primary" style={{ flex: 1, background: 'var(--success)' }} onClick={() => handleApprove(selectedJob.id)} disabled={actionLoading}>
                {actionLoading ? 'Processing...' : 'Approve & Publish'}
              </button>
              <button className="btn" style={{ flex: 1, background: 'var(--danger)', color: 'white' }} onClick={handleRejectClick}>
                Reject Listing
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {rejectModalOpen && (
        <div className="drawer-backdrop" style={{ zIndex: 1000 }} onClick={() => setRejectModalOpen(false)}>
          <div className="admin-card" style={{ width: '400px', margin: '100px auto', padding: '24px', zIndex: 1001 }} onClick={(e) => e.stopPropagation()}>
            <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '12px' }}>Reject Job Posting</h3>
            <form onSubmit={handleRejectSubmit}>
              <div className="form-group">
                <label className="form-label">Reason for Rejection</label>
                <textarea className="form-input" style={{ height: '100px', padding: '10px' }} placeholder="Specify why the job is rejected (e.g. invalid contact information, low wages, spam details)" value={rejectReason} onChange={(e) => setRejectReason(e.target.value)} required />
              </div>
              <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', marginTop: '16px' }}>
                <button type="button" className="btn btn-outline" onClick={() => setRejectModalOpen(false)}>Cancel</button>
                <button type="submit" className="btn" style={{ background: 'var(--danger)', color: 'white' }} disabled={actionLoading}>
                  {actionLoading ? 'Submitting...' : 'Submit Rejection'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
export default JobApprovalPage;
