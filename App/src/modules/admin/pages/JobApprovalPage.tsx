import React, { useEffect, useState } from 'react';
import { AdminApiService } from '../services/adminApi';
import { useToast } from '../../../hooks/useToast';
import { formatNumber, formatDate } from '../../../utils/helpers';
import { CompanyDefaultLogo } from '../../../components/company/CompanyDefaultLogo';
import {
  Eye,
  CheckCircle2,
  XCircle,
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
  FileText,
  Layers,
  GraduationCap,
  Home,
  Utensils,
  Bus,
  Calendar,
  ListChecks,
  X,
  Sparkles,
  Building
} from 'lucide-react';

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
      const jobList = Array.isArray(res) ? res : (Array.isArray(res?.data) ? res.data : []);
      setJobs(jobList);
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
                  {/* Company Logo */}
                  <CompanyDefaultLogo 
                    logoUrl={job.company_logo || job.companyLogo} 
                    companyName={job.company} 
                    size={48} 
                    borderRadius="10px"
                  />

                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                      <span className="status-badge status-pending" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                        <Clock size={12} /> PENDING REVIEW
                      </span>
                      {(job.reject_reason || job.rejectReason) && (
                        <span style={{ padding: '3px 8px', borderRadius: '6px', background: '#eff6ff', color: '#1d4ed8', border: '1px solid #bfdbfe', fontSize: '11px', fontWeight: '700', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                          ⚡ Resubmitted after correction
                        </span>
                      )}
                    </div>
                    <h3 style={{ fontSize: '18px', fontWeight: '800', color: 'var(--text-primary)' }}>{job.title}</h3>
                    {(job.reject_reason || job.rejectReason) && (
                      <div style={{ fontSize: '12px', background: '#fffbe5', border: '1px solid #fde68a', color: '#92400e', padding: '6px 10px', borderRadius: '6px', marginTop: '6px', fontWeight: '600' }}>
                        ⚠️ <strong>Previous Admin Note:</strong> "{job.reject_reason || job.rejectReason}"
                      </div>
                    )}
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginTop: '4px', color: 'var(--text-secondary)', fontSize: '14px' }}>
                      <span style={{ fontWeight: '600', color: 'var(--text-primary)' }}>{job.company}</span>
                      <span>•</span>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                        <MapPin size={13} style={{ color: '#2563eb' }} />
                        {job.location} ({job.midc_zone || 'General'})
                      </span>
                    </div>
                    <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', marginTop: '16px', fontSize: '13px', color: 'var(--text-secondary)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <IndianRupee size={14} style={{ color: '#2563eb' }} />
                        <strong>Salary:</strong>&nbsp;₹{formatNumber(job.salary_min)} - ₹{formatNumber(job.salary_max)} / month
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <GraduationCap size={14} style={{ color: '#2563eb' }} />
                        <strong>Exp:</strong>&nbsp;{job.min_experience} - {job.max_experience} Yrs
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Users size={14} style={{ color: '#2563eb' }} />
                        <strong>Vacancies:</strong>&nbsp;{job.openings} openings
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Calendar size={14} style={{ color: '#2563eb' }} />
                        <strong>Posted:</strong>&nbsp;{formatDate(job.posted_at || job.postedAt)}
                      </div>
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', justifyContent: 'center', minWidth: '150px' }}>
                  <button className="btn btn-outline" style={{ padding: '8px 16px', fontSize: '13px', width: '100%', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }} onClick={() => handleOpenDetails(job.id)}>
                    <Eye size={14} /> View Details
                  </button>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button className="btn btn-primary" style={{ padding: '8px 12px', fontSize: '13px', flex: 1, background: 'var(--success)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }} onClick={() => { setSelectedJob(job); handleApprove(job.id); }} disabled={actionLoading}>
                      <CheckCircle2 size={14} /> Approve
                    </button>
                    <button className="btn" style={{ padding: '8px 12px', fontSize: '13px', flex: 1, background: 'var(--danger)', color: 'white', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }} onClick={() => { setSelectedJob(job); handleRejectClick(); }}>
                      <XCircle size={14} /> Reject
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
              <button className="drawer-close-btn" style={{ background: '#f1f5f9', border: 'none', borderRadius: '50%', width: '32px', height: '32px', cursor: 'pointer', fontSize: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b' }} onClick={() => setDetailsModalOpen(false)}>
                <X size={18} />
              </button>
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
                      <span style={{ color: '#64748b', display: 'block', fontSize: '11px' }}>MIDC Zone / Location</span>
                      <strong style={{ color: '#0f172a' }}>{selectedJob.midc_zone || selectedJob.location || 'General'}</strong>
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
                      <UserCheck size={15} style={{ color: '#2563eb' }} />
                    </div>
                    <div>
                      <span style={{ color: '#64748b', display: 'block', fontSize: '11px' }}>Gender Preference</span>
                      <strong style={{ color: '#0f172a' }}>{selectedJob.gender || 'Any'}</strong>
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
                style={{ flex: 1, padding: '12px', borderRadius: '8px', background: '#2563eb', color: '#ffffff', border: 'none', fontWeight: '700', fontSize: '14px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', boxShadow: '0 4px 12px rgba(37, 99, 235, 0.25)' }}
              >
                <CheckCircle2 size={16} /> {actionLoading ? 'Approving...' : 'Approve & Publish Listing'}
              </button>
              <button 
                onClick={handleRejectClick} 
                style={{ padding: '12px 20px', borderRadius: '8px', background: '#fef2f2', color: '#dc2626', border: '1px solid #fca5a5', fontWeight: '700', fontSize: '14px', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
              >
                <XCircle size={16} /> Reject Listing
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {rejectModalOpen && (
        <div className="drawer-backdrop" style={{ zIndex: 1000 }} onClick={() => setRejectModalOpen(false)}>
          <div className="admin-card" style={{ width: '400px', margin: '100px auto', padding: '24px', zIndex: 1001, borderRadius: '16px' }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
              <XCircle size={20} style={{ color: '#dc2626' }} />
              <h3 style={{ fontSize: '18px', fontWeight: '700', margin: 0 }}>Reject Job Posting</h3>
            </div>
            <form onSubmit={handleRejectSubmit}>
              <div className="form-group">
                <label className="form-label" style={{ fontWeight: '600', fontSize: '13px' }}>Reason for Rejection</label>
                <textarea className="form-input" style={{ height: '100px', padding: '10px', width: '100%', borderRadius: '8px', border: '1px solid #cbd5e1', marginTop: '6px' }} placeholder="Specify why the job is rejected (e.g. invalid contact information, low wages, spam details)" value={rejectReason} onChange={(e) => setRejectReason(e.target.value)} required />
              </div>
              <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', marginTop: '16px' }}>
                <button type="button" className="btn btn-outline" onClick={() => setRejectModalOpen(false)} style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                  <X size={14} /> Cancel
                </button>
                <button type="submit" className="btn" style={{ background: '#dc2626', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '8px', fontWeight: '600', display: 'inline-flex', alignItems: 'center', gap: '4px' }} disabled={actionLoading}>
                  <XCircle size={14} /> {actionLoading ? 'Submitting...' : 'Submit Rejection'}
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
