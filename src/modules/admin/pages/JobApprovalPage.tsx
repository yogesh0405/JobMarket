import React, { useEffect, useState } from 'react';
import { AdminApiService } from '../services/adminApi';
import { useToast } from '../../../hooks/useToast';
import { formatNumber } from '../../../utils/helpers';
import { CompanyDefaultLogo } from '../../../components/company/CompanyDefaultLogo';

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
                <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
                  {/* Company Logo / Initial Avatar */}
                  <CompanyDefaultLogo 
                    logoUrl={job.company_logo || job.companyLogo} 
                    companyName={job.company} 
                    size={48} 
                    borderRadius="10px"
                  />

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
          <div className="admin-drawer" style={{ width: '620px', maxWidth: '95vw', background: '#ffffff', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)' }} onClick={(e) => e.stopPropagation()}>
            {/* Header */}
            <div className="drawer-header" style={{ padding: '20px 24px', borderBottom: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <h2 className="drawer-title" style={{ fontSize: '18px', fontWeight: '800', color: '#0f172a', margin: 0 }}>Review Job Posting</h2>
                <p style={{ margin: '2px 0 0 0', fontSize: '12.5px', color: '#64748b' }}>Verify posting details before publishing to live website</p>
              </div>
              <button className="drawer-close-btn" style={{ background: '#f1f5f9', border: 'none', borderRadius: '50%', width: '32px', height: '32px', cursor: 'pointer', fontSize: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b' }} onClick={() => setDetailsModalOpen(false)}>✕</button>
            </div>
            
            <div className="drawer-body" style={{ padding: '24px', maxHeight: '72vh', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '18px' }}>
              {/* Job Title & Recruiter Header Card */}
              <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '16px', display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
                <CompanyDefaultLogo 
                  logoUrl={selectedJob.company_logo || selectedJob.companyLogo} 
                  companyName={selectedJob.company !== 'na' ? selectedJob.company : selectedJob.title} 
                  size={52} 
                  borderRadius="10px"
                />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <h3 style={{ fontSize: '19px', fontWeight: '800', color: '#0f172a', margin: '0 0 4px 0', lineHeight: 1.3 }}>{selectedJob.title}</h3>
                  <div style={{ fontSize: '13px', color: '#475569', display: 'flex', flexDirection: 'column', gap: '3px' }}>
                    {selectedJob.company && selectedJob.company !== 'na' && (
                      <div><strong>Company:</strong> {selectedJob.company}</div>
                    )}
                    <div>
                      <strong>Employer:</strong> {selectedJob.employer_name || 'Direct Recruiter'} 
                      {selectedJob.employer_email && <span style={{ color: '#64748b' }}> ({selectedJob.employer_email}{selectedJob.employer_phone ? ` | ${selectedJob.employer_phone}` : ''})</span>}
                    </div>
                  </div>
                </div>
              </div>

              {/* Job Metadata Grid */}
              <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '16px' }}>
                <div style={{ fontSize: '11px', fontWeight: '800', letterSpacing: '0.5px', textTransform: 'uppercase', color: '#64748b', marginBottom: '12px' }}>
                  Job Metadata
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px 16px', fontSize: '13.5px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" />
                    </svg>
                    <span style={{ color: '#64748b' }}>MIDC Zone:</span>
                    <strong style={{ color: '#0f172a' }}>{selectedJob.midc_zone || 'None'}</strong>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                      <circle cx="12" cy="12" r="3" />
                      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
                    </svg>
                    <span style={{ color: '#64748b' }}>Trade:</span>
                    <strong style={{ color: '#0f172a' }}>{selectedJob.trade || 'None'}</strong>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                      <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
                    </svg>
                    <span style={{ color: '#64748b' }}>Job Type:</span>
                    <strong style={{ color: '#0f172a' }}>{selectedJob.job_type}</strong>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" />
                    </svg>
                    <span style={{ color: '#64748b' }}>Work Mode:</span>
                    <strong style={{ color: '#0f172a' }}>{selectedJob.work_mode}</strong>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
                    </svg>
                    <span style={{ color: '#64748b' }}>Gender:</span>
                    <strong style={{ color: '#0f172a' }}>{selectedJob.gender || 'Any'}</strong>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" />
                      <path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
                    </svg>
                    <span style={{ color: '#64748b' }}>Vacancies:</span>
                    <strong style={{ color: '#0f172a' }}>{selectedJob.openings}</strong>
                  </div>
                </div>
              </div>

              {/* Salary & Perks Highlight Card */}
              <div style={{ background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '12px', padding: '16px' }}>
                <div style={{ fontSize: '11px', fontWeight: '800', letterSpacing: '0.5px', textTransform: 'uppercase', color: '#1e40af', marginBottom: '10px' }}>
                  Salary & Perks
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '15px', fontWeight: '800', color: '#1e3a8a', marginBottom: '10px' }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2.2">
                    <rect x="2" y="6" width="20" height="12" rx="2" /><circle cx="12" cy="12" r="2" />
                  </svg>
                  <span>₹{formatNumber(selectedJob.salary_min)} - ₹{formatNumber(selectedJob.salary_max)} per month</span>
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', fontSize: '12.5px' }}>
                  <span style={{ padding: '4px 12px', borderRadius: '9999px', background: selectedJob.overtime ? '#dbeafe' : '#f1f5f9', color: selectedJob.overtime ? '#1d4ed8' : '#64748b', border: selectedJob.overtime ? '1px solid #bfdbfe' : '1px solid #e2e8f0', fontWeight: '600' }}>
                    ⚡ Overtime: {selectedJob.overtime ? 'Yes' : 'No'}
                  </span>
                  <span style={{ padding: '4px 12px', borderRadius: '9999px', background: selectedJob.accommodation ? '#dbeafe' : '#f1f5f9', color: selectedJob.accommodation ? '#1d4ed8' : '#64748b', border: selectedJob.accommodation ? '1px solid #bfdbfe' : '1px solid #e2e8f0', fontWeight: '600' }}>
                    🏠 Accommodation: {selectedJob.accommodation ? 'Provided' : 'No'}
                  </span>
                  <span style={{ padding: '4px 12px', borderRadius: '9999px', background: selectedJob.canteen ? '#dbeafe' : '#f1f5f9', color: selectedJob.canteen ? '#1d4ed8' : '#64748b', border: selectedJob.canteen ? '1px solid #bfdbfe' : '1px solid #e2e8f0', fontWeight: '600' }}>
                    🍱 Canteen: {selectedJob.canteen ? 'Available' : 'No'}
                  </span>
                  <span style={{ padding: '4px 12px', borderRadius: '9999px', background: selectedJob.bus_facility ? '#dbeafe' : '#f1f5f9', color: selectedJob.bus_facility ? '#1d4ed8' : '#64748b', border: selectedJob.bus_facility ? '1px solid #bfdbfe' : '1px solid #e2e8f0', fontWeight: '600' }}>
                    🚌 Bus Service: {selectedJob.bus_facility ? 'Provided' : 'No'}
                  </span>
                </div>
              </div>

              {/* Job Description */}
              <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '16px' }}>
                <div style={{ fontSize: '11px', fontWeight: '800', letterSpacing: '0.5px', textTransform: 'uppercase', color: '#64748b', marginBottom: '8px' }}>
                  Job Description
                </div>
                <p style={{ fontSize: '13.5px', lineHeight: '1.6', color: '#334155', margin: 0, whiteSpace: 'pre-line' }}>{selectedJob.description}</p>
              </div>

              {/* Requirements */}
              {selectedJob.requirements && selectedJob.requirements.length > 0 && (
                <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '16px' }}>
                  <div style={{ fontSize: '11px', fontWeight: '800', letterSpacing: '0.5px', textTransform: 'uppercase', color: '#64748b', marginBottom: '8px' }}>
                    Requirements
                  </div>
                  <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '13.5px', color: '#334155', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    {selectedJob.requirements.map((req: string, i: number) => <li key={i}>{req}</li>)}
                  </ul>
                </div>
              )}
            </div>

            {/* Actions Footer */}
            <div style={{ padding: '16px 24px', background: '#f8fafc', borderTop: '1px solid #e2e8f0', display: 'flex', gap: '12px' }}>
              <button 
                onClick={() => handleApprove(selectedJob.id)} 
                disabled={actionLoading}
                style={{ flex: 1, padding: '12px', borderRadius: '8px', background: '#344BFD', color: '#ffffff', border: 'none', fontWeight: '700', fontSize: '14px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', boxShadow: '0 4px 12px rgba(52, 75, 253, 0.25)' }}
              >
                ✓ {actionLoading ? 'Approving...' : 'Approve & Publish Listing'}
              </button>
              <button 
                onClick={handleRejectClick} 
                style={{ padding: '12px 20px', borderRadius: '8px', background: '#fef2f2', color: '#dc2626', border: '1px solid #fca5a5', fontWeight: '700', fontSize: '14px', cursor: 'pointer' }}
              >
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
