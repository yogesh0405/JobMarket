import React, { useEffect, useState, useCallback } from 'react';
import { AdminApiService } from '../services/adminApi';
import { useToast } from '../../../hooks/useToast';
import { getInitials, formatNumber } from '../../../utils/helpers';
import { CompanyDefaultLogo } from '../../../components/company/CompanyDefaultLogo';
import {
  Eye,
  Building2,
  Mail,
  Phone,
  Globe,
  MapPin,
  Calendar,
  Briefcase,
  UserCheck,
  X,
  CheckCircle2,
  XCircle,
  ExternalLink
} from 'lucide-react';

export const EmployerManagementPage: React.FC = () => {
  const [employers, setEmployers] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');

  // Drawer state
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedEmployer, setSelectedEmployer] = useState<any>(null);
  const [drawerLoading, setDrawerLoading] = useState(false);

  const { showToast } = useToast();

  const fetchEmployers = useCallback(async () => {
    try {
      setLoading(true);
      const res = await AdminApiService.getEmployers({
        page,
        limit,
        search,
        status
      });
      setEmployers(res.data || []);
      setTotal(res.total || 0);
    } catch (err: any) {
      showToast('Failed to fetch employers list', 'error');
    } finally {
      setLoading(false);
    }
  }, [page, limit, search, status, showToast]);

  useEffect(() => {
    fetchEmployers();
  }, [page, status]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchEmployers();
  };

  const handleOpenDrawer = async (userId: string) => {
    try {
      setDrawerLoading(true);
      setDrawerOpen(true);
      const data = await AdminApiService.getUser(userId);
      setSelectedEmployer(data);
    } catch (err: any) {
      showToast(err.message || 'Failed to fetch employer profile', 'error');
    } finally {
      setDrawerLoading(false);
    }
  };

  const handleStatusChange = async (userId: string, newStatus: 'ACTIVE' | 'INACTIVE' | 'BLOCKED') => {
    try {
      await AdminApiService.updateUserStatus(userId, newStatus);
      showToast(`Employer status successfully updated to ${newStatus}`, 'success');
      if (selectedEmployer && selectedEmployer.profile.id === userId) {
        setSelectedEmployer({
          ...selectedEmployer,
          profile: {
            ...selectedEmployer.profile,
            status: newStatus
          }
        });
      }
      fetchEmployers();
    } catch (err: any) {
      showToast(err.message || 'Failed to update status', 'error');
    }
  };

  return (
    <div>
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: '800', color: 'var(--text-primary)' }}>Employer Directory</h1>
        <p style={{ color: 'var(--text-secondary)', marginTop: '4px' }}>Inspect and audit registered factories, hiring companies, and corporate recruiters</p>
      </div>

      {/* Filter toolbar */}
      <div className="admin-card" style={{ marginBottom: '24px' }}>
        <form onSubmit={handleSearchSubmit} className="filter-toolbar" style={{ background: 'var(--surface)' }}>
          <div style={{ position: 'relative', flex: 1, minWidth: '220px' }}>
            <input
              type="text"
              placeholder="Search company, contact name, email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="navbar-search-input"
              style={{ width: '100%', paddingLeft: '12px' }}
            />
          </div>

          <select className="filter-select" value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }}>
            <option value="">All Statuses</option>
            <option value="ACTIVE">Active</option>
            <option value="INACTIVE">Inactive</option>
            <option value="BLOCKED">Blocked</option>
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
        ) : employers.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-secondary)' }}>
            No employers registered on the platform.
          </div>
        ) : (
          <div className="table-wrapper">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Logo</th>
                  <th>Company Name</th>
                  <th>Contact Person</th>
                  <th>Registration Date</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {employers.map((emp) => (
                  <tr key={emp.id}>
                    <td>
                      <div 
                        style={{ cursor: 'pointer', display: 'inline-flex' }} 
                        onClick={() => handleOpenDrawer(emp.id)}
                        title="Click to view company profile"
                      >
                        <CompanyDefaultLogo
                          logoUrl={emp.profile_picture_url || emp.company_logo}
                          companyName={emp.company_name || emp.name}
                          size={36}
                          borderRadius="8px"
                        />
                      </div>
                    </td>
                    <td>
                      <strong 
                        style={{ cursor: 'pointer', color: 'var(--primary)', fontSize: '14.5px' }} 
                        onClick={() => handleOpenDrawer(emp.id)}
                        title="Click to view company profile"
                      >
                        {emp.company_name || emp.name || '—'}
                      </strong>
                    </td>
                    <td>
                      <div>
                        <strong>{emp.name}</strong>
                        <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '2px' }}>{emp.email}</div>
                      </div>
                    </td>
                    <td>{new Date(emp.created_at).toLocaleDateString()}</td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end' }}>
                        <button 
                          className="btn btn-outline" 
                          style={{ padding: '4px 10px', fontSize: '11px', display: 'inline-flex', alignItems: 'center', gap: '4px' }} 
                          onClick={() => handleOpenDrawer(emp.id)}
                          title="View Complete Company Profile"
                        >
                          <Eye size={12} /> View Profile
                        </button>
                        {emp.status === 'BLOCKED' ? (
                          <button className="btn btn-outline" style={{ padding: '4px 8px', fontSize: '11px' }} onClick={() => handleStatusChange(emp.id, 'ACTIVE')}>
                            Activate
                          </button>
                        ) : (
                          <button className="btn btn-outline" style={{ padding: '4px 8px', fontSize: '11px', color: 'var(--danger)' }} onClick={() => handleStatusChange(emp.id, 'BLOCKED')}>
                            Block
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Pagination Controls */}
            <div className="table-pagination">
              <span>Showing {employers.length} of {total} employers</span>
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

      {/* Employer Profile Drawer */}
      {drawerOpen && (
        <div className="drawer-backdrop" onClick={() => setDrawerOpen(false)}>
          <div className="admin-drawer" style={{ width: '650px', maxWidth: '95vw', background: '#ffffff', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)' }} onClick={(e) => e.stopPropagation()}>
            <div className="drawer-header" style={{ padding: '20px 24px', borderBottom: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <h2 className="drawer-title" style={{ fontSize: '18px', fontWeight: '800', color: '#0f172a', margin: 0 }}>Employer Profile Dossier</h2>
                <p style={{ margin: '2px 0 0 0', fontSize: '12.5px', color: '#64748b' }}>Complete company details, posted jobs, and recruiter information</p>
              </div>
              <button className="drawer-close-btn" style={{ background: '#f1f5f9', border: 'none', borderRadius: '50%', width: '32px', height: '32px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b' }} onClick={() => setDrawerOpen(false)}>
                <X size={18} />
              </button>
            </div>

            {drawerLoading ? (
              <div style={{ padding: '80px 40px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '16px' }}>
                <div className="spinner" style={{
                  width: '40px',
                  height: '40px',
                  border: '3px solid #e2e8f0',
                  borderTop: '3px solid #2563eb',
                  borderRadius: '50%',
                  animation: 'spin 1s linear infinite'
                }}></div>
                <div style={{ color: '#64748b', fontSize: '14px', fontWeight: '500' }}>Loading employer dossier...</div>
              </div>
            ) : selectedEmployer ? (
              <div className="drawer-body" style={{ padding: '24px', maxHeight: '72vh', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '18px' }}>
                {/* 1. Header Card with Company Logo & Name */}
                <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '16px', display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
                  <CompanyDefaultLogo 
                    logoUrl={selectedEmployer.profile.profile_picture_url || selectedEmployer.profile.company_logo} 
                    companyName={selectedEmployer.profile.company_name || selectedEmployer.profile.name} 
                    size={56} 
                    borderRadius="10px"
                  />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <h3 style={{ fontSize: '19px', fontWeight: '800', color: '#0f172a', margin: '0 0 4px 0' }}>
                      {selectedEmployer.profile.company_name || selectedEmployer.profile.name}
                    </h3>
                    <div style={{ fontSize: '13px', color: '#64748b', display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                        <Building2 size={13} style={{ color: '#2563eb' }} />
                        {selectedEmployer.profile.company_type || 'Industrial Employer'}
                      </span>
                      <span>•</span>
                      <span>ID: {selectedEmployer.profile.id.slice(0, 8)}</span>
                    </div>
                    <div style={{ display: 'flex', gap: '6px', marginTop: '8px' }}>
                      <span className={`status-badge ${selectedEmployer.profile.status === 'ACTIVE' ? 'status-active' : 'status-blocked'}`}>
                        {selectedEmployer.profile.status}
                      </span>
                    </div>
                  </div>
                </div>

                {/* 2. Recruiter Contact Details */}
                <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '16px' }}>
                  <div style={{ fontSize: '11px', fontWeight: '800', letterSpacing: '0.5px', textTransform: 'uppercase', color: '#64748b', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <UserCheck size={14} style={{ color: '#2563eb' }} />
                    Contact Person
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', fontSize: '13.5px' }}>
                    <div>
                      <span style={{ color: '#64748b', display: 'block', fontSize: '12px' }}>Authorized Representative</span>
                      <strong style={{ color: '#0f172a' }}>{selectedEmployer.profile.name}</strong>
                    </div>
                    <div>
                      <span style={{ color: '#64748b', display: 'block', fontSize: '12px' }}>Email</span>
                      <span style={{ color: '#0f172a', wordBreak: 'break-all' }}>{selectedEmployer.profile.email}</span>
                    </div>
                    <div>
                      <span style={{ color: '#64748b', display: 'block', fontSize: '12px' }}>Phone</span>
                      <span style={{ color: '#0f172a' }}>{selectedEmployer.profile.phone || '—'}</span>
                    </div>
                    <div>
                      <span style={{ color: '#64748b', display: 'block', fontSize: '12px' }}>Registered Since</span>
                      <span style={{ color: '#0f172a' }}>{new Date(selectedEmployer.profile.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>

                {/* 3. Company Overview & Location */}
                <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '16px' }}>
                  <div style={{ fontSize: '11px', fontWeight: '800', letterSpacing: '0.5px', textTransform: 'uppercase', color: '#64748b', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Building2 size={14} style={{ color: '#2563eb' }} />
                    Corporate Information
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', fontSize: '13.5px', marginBottom: '12px' }}>
                    <div>
                      <span style={{ color: '#64748b', display: 'block', fontSize: '12px' }}>Industry / Sector</span>
                      <strong style={{ color: '#0f172a' }}>{selectedEmployer.profile.industry || 'Industrial Manufacturing'}</strong>
                    </div>
                    <div>
                      <span style={{ color: '#64748b', display: 'block', fontSize: '12px' }}>Company Type</span>
                      <strong style={{ color: '#0f172a' }}>{selectedEmployer.profile.company_type || 'Private Limited'}</strong>
                    </div>
                    {selectedEmployer.profile.company_size && (
                      <div>
                        <span style={{ color: '#64748b', display: 'block', fontSize: '12px' }}>Company Scale</span>
                        <span style={{ color: '#0f172a' }}>{selectedEmployer.profile.company_size}</span>
                      </div>
                    )}
                    {selectedEmployer.profile.midc_zone && (
                      <div>
                        <span style={{ color: '#64748b', display: 'block', fontSize: '12px' }}>MIDC Industrial Zone</span>
                        <span style={{ color: '#0f172a' }}>{selectedEmployer.profile.midc_zone}</span>
                      </div>
                    )}
                    {selectedEmployer.profile.founded_year && (
                      <div>
                        <span style={{ color: '#64748b', display: 'block', fontSize: '12px' }}>Founded Year</span>
                        <span style={{ color: '#0f172a' }}>{selectedEmployer.profile.founded_year}</span>
                      </div>
                    )}
                    {selectedEmployer.profile.website && (
                      <div>
                        <span style={{ color: '#64748b', display: 'block', fontSize: '12px' }}>Website</span>
                        <a href={selectedEmployer.profile.website.startsWith('http') ? selectedEmployer.profile.website : `https://${selectedEmployer.profile.website}`} target="_blank" rel="noopener noreferrer" style={{ color: '#2563eb', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                          <Globe size={13} /> {selectedEmployer.profile.website.replace(/^https?:\/\//, '')}
                        </a>
                      </div>
                    )}
                  </div>

                  {selectedEmployer.profile.location && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13.5px', marginTop: '6px', paddingTop: '8px', borderTop: '1px solid #f1f5f9' }}>
                      <MapPin size={15} style={{ color: '#2563eb', flexShrink: 0 }} />
                      <span><strong>Address / Plant Location:</strong> {selectedEmployer.profile.location}</span>
                    </div>
                  )}

                  {selectedEmployer.profile.company_description && (
                    <div style={{ marginTop: '10px', paddingTop: '8px', borderTop: '1px solid #f1f5f9' }}>
                      <span style={{ color: '#64748b', display: 'block', fontSize: '12px', marginBottom: '4px' }}>About Company</span>
                      <p style={{ margin: 0, color: '#334155', lineHeight: '1.5', fontSize: '13px', whiteSpace: 'pre-line' }}>{selectedEmployer.profile.company_description}</p>
                    </div>
                  )}
                </div>

                {/* 4. Posted Job Openings */}
                <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '16px' }}>
                  <div style={{ fontSize: '11px', fontWeight: '800', letterSpacing: '0.5px', textTransform: 'uppercase', color: '#64748b', marginBottom: '12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Briefcase size={14} style={{ color: '#2563eb' }} />
                      Posted Jobs ({selectedEmployer.jobs ? selectedEmployer.jobs.length : 0})
                    </span>
                  </div>
                  {selectedEmployer.jobs && selectedEmployer.jobs.length > 0 ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {selectedEmployer.jobs.map((j: any) => (
                        <div key={j.id} style={{ padding: '10px 12px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <div>
                            <strong style={{ fontSize: '13.5px', color: '#0f172a' }}>{j.title}</strong>
                            <div style={{ fontSize: '12px', color: '#64748b' }}>{j.location} • ₹{formatNumber(j.salary_min)} - ₹{formatNumber(j.salary_max)}</div>
                          </div>
                          <span className={`status-badge ${j.status === 'APPROVED' ? 'status-active' : j.status === 'REJECTED' ? 'status-blocked' : 'status-pending'}`}>
                            {j.status}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div style={{ color: '#94a3b8', fontSize: '13px', textAlign: 'center', padding: '12px 0' }}>
                      No jobs posted by this employer yet.
                    </div>
                  )}
                </div>
              </div>
            ) : null}

            {/* Footer Actions */}
            {selectedEmployer && (
              <div style={{ padding: '16px 24px', background: '#f8fafc', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  {selectedEmployer.profile.status === 'BLOCKED' ? (
                    <button className="btn btn-primary" style={{ background: '#16a34a', color: '#ffffff', border: 'none', padding: '8px 16px' }} onClick={() => handleStatusChange(selectedEmployer.profile.id, 'ACTIVE')}>
                      Activate Employer
                    </button>
                  ) : (
                    <button className="btn btn-outline" style={{ color: '#dc2626', borderColor: '#fca5a5', padding: '8px 16px' }} onClick={() => handleStatusChange(selectedEmployer.profile.id, 'BLOCKED')}>
                      Block Employer
                    </button>
                  )}
                </div>
                <button className="btn btn-outline" onClick={() => setDrawerOpen(false)}>
                  Close Dossier
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
export default EmployerManagementPage;
