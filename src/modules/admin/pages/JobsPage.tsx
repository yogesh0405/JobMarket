import React, { useEffect, useState, useCallback } from 'react';
import { AdminApiService } from '../services/adminApi';
import { useToast } from '../../../hooks/useToast';
import { CompanyDefaultLogo } from '../../../components/company/CompanyDefaultLogo';
import { formatNumber } from '../../../utils/helpers';

export const JobsPage: React.FC = () => {
  const [jobs, setJobs] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');

  const [selectedJob, setSelectedJob] = useState<any>(null);
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  const { showToast } = useToast();

  const fetchJobs = useCallback(async () => {
    try {
      setLoading(true);
      const res = await AdminApiService.getJobs({
        page,
        limit,
        search,
        status
      });
      setJobs(res.data || []);
      setTotal(res.total || 0);
    } catch (err: any) {
      showToast('Failed to fetch job postings', 'error');
    } finally {
      setLoading(false);
    }
  }, [page, limit, search, status, showToast]);

  useEffect(() => {
    fetchJobs();
  }, [page, status]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchJobs();
  };

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
      fetchJobs();
    } catch (err: any) {
      showToast(err.message || 'Failed to approve job', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleUnpublish = async (jobId: string) => {
    if (!window.confirm('Are you sure you want to unpublish this live job listing? It will be hidden from candidates.')) return;
    setActionLoading(true);
    try {
      await AdminApiService.unpublishJob(jobId);
      showToast('Job listing unpublished successfully', 'info');
      setDetailsModalOpen(false);
      fetchJobs();
    } catch (err: any) {
      showToast(err.message || 'Failed to unpublish job', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async (jobId: string) => {
    if (!window.confirm('Are you sure you want to permanently delete this job listing? This action cannot be undone.')) return;
    setActionLoading(true);
    try {
      await AdminApiService.deleteJob(jobId);
      showToast('Job listing deleted permanently', 'success');
      setDetailsModalOpen(false);
      fetchJobs();
    } catch (err: any) {
      showToast(err.message || 'Failed to delete job', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div>
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: '800', color: 'var(--text-primary)' }}>Platform Job Board</h1>
        <p style={{ color: 'var(--text-secondary)', marginTop: '4px' }}>Inspect and audit all job listings posted by employers on the marketplace</p>
      </div>

      {/* Filter toolbar */}
      <div className="admin-card" style={{ marginBottom: '24px' }}>
        <form onSubmit={handleSearchSubmit} className="filter-toolbar" style={{ background: 'var(--surface)' }}>
          <div style={{ position: 'relative', flex: 1, minWidth: '220px' }}>
            <input
              type="text"
              placeholder="Search by job title, company..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="navbar-search-input"
              style={{ width: '100%', paddingLeft: '12px' }}
            />
          </div>

          <select className="filter-select" value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }}>
            <option value="">All Statuses</option>
            <option value="APPROVED">Approved / Live</option>
            <option value="PENDING_REVIEW">Pending Review</option>
            <option value="REJECTED">Rejected</option>
            <option value="UNPUBLISHED">Unpublished</option>
          </select>

          <button type="submit" className="btn btn-primary" style={{ padding: '8px 16px', fontSize: '13px' }}>
            Apply Filter
          </button>
        </form>
      </div>

      {/* Table grid */}
      <div className="admin-card">
        {loading ? (
          <div style={{ padding: '40px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} style={{ height: '35px', background: '#e2e8f0', borderRadius: '4px', animation: 'pulse 1.5s infinite' }}></div>
            ))}
          </div>
        ) : jobs.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-secondary)' }}>
            No jobs posted on the platform.
          </div>
        ) : (
          <div className="table-wrapper">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Job Title</th>
                  <th>Company</th>
                  <th>Location</th>
                  <th>Experience Req.</th>
                  <th>Salary Range</th>
                  <th>Vacancies</th>
                  <th>Status</th>
                  <th>Posted Date</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {jobs.map((job) => (
                  <tr key={job.id}>
                    <td><strong style={{ cursor: 'pointer', color: 'var(--primary)' }} onClick={() => handleOpenDetails(job.id)}>{job.title}</strong></td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <CompanyDefaultLogo 
                          logoUrl={job.company_logo || job.companyLogo} 
                          companyName={job.company} 
                          size={28} 
                          borderRadius="6px"
                        />
                        <span>{job.company}</span>
                      </div>
                    </td>
                    <td>{job.location}</td>
                    <td>{job.min_experience} - {job.max_experience} Yrs</td>
                    <td>₹{formatNumber(job.salary_min)} - ₹{formatNumber(job.salary_max)}</td>
                    <td>{job.openings}</td>
                    <td>
                      <span className={`status-badge ${job.status === 'APPROVED' ? 'status-active' : job.status === 'REJECTED' ? 'status-blocked' : job.status === 'UNPUBLISHED' ? 'status-inactive' : 'status-pending'}`}>
                        {job.status === 'APPROVED' ? 'Live' : job.status === 'REJECTED' ? 'Rejected' : job.status === 'UNPUBLISHED' ? 'Unpublished' : 'Pending Review'}
                      </span>
                    </td>
                    <td>{new Date(job.posted_at).toLocaleDateString()}</td>
                    <td style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
                      <button className="action-btn edit" title="Review Details" onClick={() => handleOpenDetails(job.id)} style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', padding: '6px' }}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                          <circle cx="12" cy="12" r="3" />
                        </svg>
                      </button>

                      {job.status === 'APPROVED' && (
                        <button className="action-btn" title="Unpublish Job" onClick={() => handleUnpublish(job.id)} style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', padding: '6px', color: '#d97706' }}>
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                            <line x1="9" y1="9" x2="15" y2="15" />
                            <line x1="15" y1="9" x2="9" y2="15" />
                          </svg>
                        </button>
                      )}

                      <button className="action-btn delete" title="Delete Job Listing" onClick={() => handleDelete(job.id)} style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', padding: '6px' }}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="3 6 5 6 21 6" />
                          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                        </svg>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Pagination Controls */}
            <div className="table-pagination">
              <span>Showing {jobs.length} of {total} jobs</span>
              <div className="pagination-btn-group">
                <button className="pagination-btn" onClick={() => setPage(p => Math.max(p - 1, 1))} disabled={page === 1}>
                  Previous
                </button>
                <span style={{ display: 'flex', alignItems: 'center', padding: '0 8px' }}>Page {page} of {Math.ceil(total / limit) || 1}</span>
                <button className="pagination-btn" onClick={() => setPage(p => p + 1)} disabled={page >= Math.ceil(total / limit)}>
                  Next
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Details Modal */}
      {detailsModalOpen && selectedJob && (
        <div className="drawer-backdrop" onClick={() => setDetailsModalOpen(false)}>
          <div className="admin-drawer" style={{ width: '600px' }} onClick={(e) => e.stopPropagation()}>
            <div className="drawer-header">
              <h2 className="drawer-title">Job Details</h2>
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
                    <strong>Location:</strong>&nbsp;{selectedJob.location}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '8px', color: 'var(--primary)', flexShrink: 0 }}>
                      <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
                      <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
                    </svg>
                    <strong>Industry:</strong>&nbsp;{selectedJob.industry}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '8px', color: 'var(--primary)', flexShrink: 0 }}>
                      <circle cx="12" cy="12" r="10" />
                      <polyline points="12 6 12 12 16 14" />
                    </svg>
                    <strong>Experience:</strong>&nbsp;{selectedJob.min_experience} - {selectedJob.max_experience} Years
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '8px', color: 'var(--primary)', flexShrink: 0 }}>
                      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                      <circle cx="9" cy="7" r="4" />
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
            </div>

            <div style={{ padding: '20px', borderTop: '1px solid var(--border)', display: 'flex', gap: '12px' }}>
              {selectedJob.status === 'PENDING_REVIEW' && (
                <button className="btn btn-primary" style={{ flex: 1, background: 'var(--success)' }} onClick={() => handleApprove(selectedJob.id)} disabled={actionLoading}>
                  Approve Posting
                </button>
              )}
              {selectedJob.status === 'APPROVED' && (
                <button className="btn btn-warning" style={{ flex: 1, background: '#d97706', color: 'white', border: 'none' }} onClick={() => handleUnpublish(selectedJob.id)} disabled={actionLoading}>
                  Unpublish Job
                </button>
              )}
              <button className="btn btn-danger" style={{ background: '#ef4444', color: 'white', border: 'none', padding: '8px 16px' }} onClick={() => handleDelete(selectedJob.id)} disabled={actionLoading}>
                Delete Job
              </button>
              <button className="btn btn-outline" onClick={() => setDetailsModalOpen(false)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
export default JobsPage;
