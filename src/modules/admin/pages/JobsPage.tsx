import React, { useEffect, useState, useCallback } from 'react';
import { AdminApiService } from '../services/adminApi';
import { useToast } from '../../../hooks/useToast';
import { CompanyDefaultLogo } from '../../../components/company/CompanyDefaultLogo';
import { formatNumber } from '../../../utils/helpers';
import {
  Eye,
  EyeOff,
  Trash2,
  MapPin,
  Briefcase,
  Clock,
  Users,
  IndianRupee,
  Zap,
  Building2,
  UserCheck,
  Mail,
  Phone,
  CheckCircle2,
  XCircle,
  X,
  FileText,
  Layers,
  GraduationCap,
  Home,
  Utensils,
  Bus,
  Building,
  Sparkles,
  ListChecks
} from 'lucide-react';

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
                        <Eye size={15} />
                      </button>

                      {job.status === 'APPROVED' && (
                        <button className="action-btn" title="Unpublish Job" onClick={() => handleUnpublish(job.id)} style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', padding: '6px', color: '#d97706' }}>
                          <EyeOff size={15} />
                        </button>
                      )}

                      <button className="action-btn delete" title="Delete Job Listing" onClick={() => handleDelete(job.id)} style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', padding: '6px' }}>
                        <Trash2 size={15} />
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
          <div className="admin-drawer" style={{ width: '620px', maxWidth: '95vw', background: '#ffffff', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)' }} onClick={(e) => e.stopPropagation()}>
            <div className="drawer-header" style={{ padding: '20px 24px', borderBottom: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <h2 className="drawer-title" style={{ fontSize: '18px', fontWeight: '800', color: '#0f172a', margin: 0 }}>Job Details</h2>
                  <span className={`status-badge ${selectedJob.status === 'APPROVED' ? 'status-active' : selectedJob.status === 'REJECTED' ? 'status-blocked' : selectedJob.status === 'UNPUBLISHED' ? 'status-inactive' : 'status-pending'}`} style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                    {selectedJob.status === 'APPROVED' ? <CheckCircle2 size={12} /> : selectedJob.status === 'REJECTED' ? <XCircle size={12} /> : selectedJob.status === 'UNPUBLISHED' ? <EyeOff size={12} /> : <Clock size={12} />}
                    {selectedJob.status === 'APPROVED' ? 'Live' : selectedJob.status === 'REJECTED' ? 'Rejected' : selectedJob.status === 'UNPUBLISHED' ? 'Unpublished' : 'Pending Review'}
                  </span>
                </div>
                <p style={{ margin: '2px 0 0 0', fontSize: '12.5px', color: '#64748b' }}>Complete specifications and recruiter information for this listing</p>
              </div>
              <button className="drawer-close-btn" style={{ background: '#f1f5f9', border: 'none', borderRadius: '50%', width: '32px', height: '32px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b' }} onClick={() => setDetailsModalOpen(false)}>
                <X size={18} />
              </button>
            </div>
            
            <div className="drawer-body" style={{ padding: '24px', maxHeight: '72vh', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '18px' }}>
              {/* Recruiter / Header Card */}
              <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '16px', display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
                <CompanyDefaultLogo 
                  logoUrl={selectedJob.company_logo || selectedJob.companyLogo} 
                  companyName={selectedJob.company && selectedJob.company !== 'na' ? selectedJob.company : selectedJob.title} 
                  size={52} 
                  borderRadius="10px"
                />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <h3 style={{ fontSize: '19px', fontWeight: '800', color: '#0f172a', margin: '0 0 6px 0', lineHeight: 1.3 }}>{selectedJob.title}</h3>
                  <div style={{ fontSize: '13px', color: '#475569', display: 'flex', flexDirection: 'column', gap: '5px' }}>
                    {selectedJob.company && selectedJob.company !== 'na' && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Building2 size={15} style={{ color: '#2563eb', flexShrink: 0 }} />
                        <span><strong>Company:</strong> {selectedJob.company}</span>
                      </div>
                    )}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                      <UserCheck size={15} style={{ color: '#475569', flexShrink: 0 }} />
                      <span><strong>Employer:</strong> {selectedJob.employer_name || 'Direct Recruiter'}</span>
                      {selectedJob.employer_email && (
                        <span style={{ color: '#64748b', display: 'inline-flex', alignItems: 'center', gap: '4px', marginLeft: '6px' }}>
                          <Mail size={13} /> {selectedJob.employer_email}
                        </span>
                      )}
                      {selectedJob.employer_phone && (
                        <span style={{ color: '#64748b', display: 'inline-flex', alignItems: 'center', gap: '4px', marginLeft: '6px' }}>
                          <Phone size={13} /> {selectedJob.employer_phone}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Job Metadata Grid */}
              <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '16px' }}>
                <div style={{ fontSize: '11px', fontWeight: '800', letterSpacing: '0.5px', textTransform: 'uppercase', color: '#64748b', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Sparkles size={14} style={{ color: '#2563eb' }} />
                  Job Metadata
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px 16px', fontSize: '13.5px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{ width: '28px', height: '28px', borderRadius: '6px', background: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <MapPin size={15} style={{ color: '#2563eb' }} />
                    </div>
                    <div>
                      <span style={{ color: '#64748b', display: 'block', fontSize: '11px' }}>Location / Zone</span>
                      <strong style={{ color: '#0f172a' }}>{selectedJob.location} {selectedJob.midc_zone ? `(${selectedJob.midc_zone})` : ''}</strong>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{ width: '28px', height: '28px', borderRadius: '6px', background: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <Building size={15} style={{ color: '#2563eb' }} />
                    </div>
                    <div>
                      <span style={{ color: '#64748b', display: 'block', fontSize: '11px' }}>Industry</span>
                      <strong style={{ color: '#0f172a' }}>{selectedJob.industry || 'General'}</strong>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{ width: '28px', height: '28px', borderRadius: '6px', background: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <Layers size={15} style={{ color: '#2563eb' }} />
                    </div>
                    <div>
                      <span style={{ color: '#64748b', display: 'block', fontSize: '11px' }}>Trade / Role</span>
                      <strong style={{ color: '#0f172a' }}>{selectedJob.trade || selectedJob.category || 'Standard'}</strong>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{ width: '28px', height: '28px', borderRadius: '6px', background: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <GraduationCap size={15} style={{ color: '#2563eb' }} />
                    </div>
                    <div>
                      <span style={{ color: '#64748b', display: 'block', fontSize: '11px' }}>Experience Required</span>
                      <strong style={{ color: '#0f172a' }}>{selectedJob.min_experience} - {selectedJob.max_experience} Years</strong>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{ width: '28px', height: '28px', borderRadius: '6px', background: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <Clock size={15} style={{ color: '#2563eb' }} />
                    </div>
                    <div>
                      <span style={{ color: '#64748b', display: 'block', fontSize: '11px' }}>Job Type</span>
                      <strong style={{ color: '#0f172a' }}>{selectedJob.job_type || 'Full-time'}</strong>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{ width: '28px', height: '28px', borderRadius: '6px', background: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <Home size={15} style={{ color: '#2563eb' }} />
                    </div>
                    <div>
                      <span style={{ color: '#64748b', display: 'block', fontSize: '11px' }}>Work Mode</span>
                      <strong style={{ color: '#0f172a' }}>{selectedJob.work_mode || 'On-site'}</strong>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{ width: '28px', height: '28px', borderRadius: '6px', background: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <Users size={15} style={{ color: '#2563eb' }} />
                    </div>
                    <div>
                      <span style={{ color: '#64748b', display: 'block', fontSize: '11px' }}>Vacancies</span>
                      <strong style={{ color: '#0f172a' }}>{selectedJob.openings} openings</strong>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{ width: '28px', height: '28px', borderRadius: '6px', background: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <UserCheck size={15} style={{ color: '#2563eb' }} />
                    </div>
                    <div>
                      <span style={{ color: '#64748b', display: 'block', fontSize: '11px' }}>Gender Preference</span>
                      <strong style={{ color: '#0f172a' }}>{selectedJob.gender || 'Any'}</strong>
                    </div>
                  </div>
                </div>
              </div>

              {/* Salary & Perks Highlight Card */}
              <div style={{ background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '12px', padding: '16px' }}>
                <div style={{ fontSize: '11px', fontWeight: '800', letterSpacing: '0.5px', textTransform: 'uppercase', color: '#1e40af', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <IndianRupee size={15} style={{ color: '#2563eb' }} />
                  Salary & Perks
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '16px', fontWeight: '800', color: '#1e3a8a', marginBottom: '12px' }}>
                  <IndianRupee size={20} style={{ color: '#2563eb' }} />
                  <span>₹{formatNumber(selectedJob.salary_min)} - ₹{formatNumber(selectedJob.salary_max)} per month</span>
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', fontSize: '12.5px' }}>
                  <span style={{ padding: '6px 12px', borderRadius: '8px', background: selectedJob.overtime ? '#dbeafe' : '#f1f5f9', color: selectedJob.overtime ? '#1d4ed8' : '#64748b', border: selectedJob.overtime ? '1px solid #bfdbfe' : '1px solid #e2e8f0', fontWeight: '600', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                    <Zap size={14} style={{ color: selectedJob.overtime ? '#2563eb' : '#94a3b8' }} /> Overtime: {selectedJob.overtime ? 'Yes' : 'No'}
                  </span>
                  <span style={{ padding: '6px 12px', borderRadius: '8px', background: selectedJob.accommodation ? '#dbeafe' : '#f1f5f9', color: selectedJob.accommodation ? '#1d4ed8' : '#64748b', border: selectedJob.accommodation ? '1px solid #bfdbfe' : '1px solid #e2e8f0', fontWeight: '600', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                    <Home size={14} style={{ color: selectedJob.accommodation ? '#2563eb' : '#94a3b8' }} /> Accommodation: {selectedJob.accommodation ? 'Provided' : 'No'}
                  </span>
                  <span style={{ padding: '6px 12px', borderRadius: '8px', background: selectedJob.canteen ? '#dbeafe' : '#f1f5f9', color: selectedJob.canteen ? '#1d4ed8' : '#64748b', border: selectedJob.canteen ? '1px solid #bfdbfe' : '1px solid #e2e8f0', fontWeight: '600', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                    <Utensils size={14} style={{ color: selectedJob.canteen ? '#2563eb' : '#94a3b8' }} /> Canteen: {selectedJob.canteen ? 'Available' : 'No'}
                  </span>
                  <span style={{ padding: '6px 12px', borderRadius: '8px', background: selectedJob.bus_facility ? '#dbeafe' : '#f1f5f9', color: selectedJob.bus_facility ? '#1d4ed8' : '#64748b', border: selectedJob.bus_facility ? '1px solid #bfdbfe' : '1px solid #e2e8f0', fontWeight: '600', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                    <Bus size={14} style={{ color: selectedJob.bus_facility ? '#2563eb' : '#94a3b8' }} /> Bus Service: {selectedJob.bus_facility ? 'Provided' : 'No'}
                  </span>
                </div>
              </div>

              {/* Job Description */}
              <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '16px' }}>
                <div style={{ fontSize: '11px', fontWeight: '800', letterSpacing: '0.5px', textTransform: 'uppercase', color: '#64748b', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <FileText size={15} style={{ color: '#2563eb' }} />
                  Job Description
                </div>
                <p style={{ fontSize: '13.5px', lineHeight: '1.6', color: '#334155', margin: 0, whiteSpace: 'pre-line' }}>{selectedJob.description}</p>
              </div>

              {/* Requirements */}
              {selectedJob.requirements && selectedJob.requirements.length > 0 && (
                <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '16px' }}>
                  <div style={{ fontSize: '11px', fontWeight: '800', letterSpacing: '0.5px', textTransform: 'uppercase', color: '#64748b', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <ListChecks size={15} style={{ color: '#2563eb' }} />
                    Requirements & Qualifications
                  </div>
                  <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '13.5px', color: '#334155', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    {selectedJob.requirements.map((req: string, i: number) => <li key={i}>{req}</li>)}
                  </ul>
                </div>
              )}
            </div>

            <div style={{ padding: '16px 24px', background: '#f8fafc', borderTop: '1px solid #e2e8f0', display: 'flex', gap: '12px' }}>
              {selectedJob.status === 'PENDING_REVIEW' && (
                <button className="btn btn-primary" style={{ flex: 1, background: '#16a34a', color: '#ffffff', border: 'none', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }} onClick={() => handleApprove(selectedJob.id)} disabled={actionLoading}>
                  <CheckCircle2 size={16} /> Approve Posting
                </button>
              )}
              {selectedJob.status === 'APPROVED' && (
                <button className="btn btn-warning" style={{ flex: 1, background: '#d97706', color: '#ffffff', border: 'none', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }} onClick={() => handleUnpublish(selectedJob.id)} disabled={actionLoading}>
                  <EyeOff size={16} /> Unpublish Job
                </button>
              )}
              <button className="btn btn-danger" style={{ background: '#ef4444', color: '#ffffff', border: 'none', padding: '8px 16px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }} onClick={() => handleDelete(selectedJob.id)} disabled={actionLoading}>
                <Trash2 size={16} /> Delete Job
              </button>
              <button className="btn btn-outline" style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }} onClick={() => setDetailsModalOpen(false)}>
                <X size={16} /> Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
export default JobsPage;
