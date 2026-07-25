import React, { useEffect, useState, useCallback } from 'react';
import { AdminApiService } from '../services/adminApi';
import { useToast } from '../../../hooks/useToast';
import { getInitials } from '../../../utils/helpers';

export const EmployerManagementPage: React.FC = () => {
  const [employers, setEmployers] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');

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

  const handleStatusChange = async (userId: string, newStatus: 'ACTIVE' | 'INACTIVE' | 'BLOCKED') => {
    try {
      await AdminApiService.updateUserStatus(userId, newStatus);
      showToast(`Employer status successfully updated to ${newStatus}`, 'success');
      fetchEmployers();
    } catch (err: any) {
      showToast(err.message || 'Failed to update status', 'error');
    }
  };

  const handleVerify = async (userId: string, toggleVerify: boolean) => {
    try {
      // Toggle verified state on backend
      await AdminApiService.updateUserStatus(userId, toggleVerify ? 'ACTIVE' : 'INACTIVE');
      showToast(toggleVerify ? 'Employer verification approved!' : 'Verification suspended', 'success');
      fetchEmployers();
    } catch (err: any) {
      showToast('Failed to update verification status', 'error');
    }
  };

  return (
    <div>
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: '800', color: 'var(--text-primary)' }}>Employer Directory</h1>
        <p style={{ color: 'var(--text-secondary)', marginTop: '4px' }}>Verify corporate registrations, GST documentation, and active postings</p>
      </div>

      {/* Filter toolbar */}
      <div className="admin-card" style={{ marginBottom: '24px' }}>
        <form onSubmit={handleSearchSubmit} className="filter-toolbar" style={{ background: 'var(--surface)' }}>
          <div style={{ position: 'relative', flex: 1, minWidth: '220px' }}>
            <input
              type="text"
              placeholder="Search company, GST, name..."
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
                  <th>GST Registration</th>
                  <th>Status</th>
                  <th>Aadhaar Verified</th>
                  <th>Registration Date</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {employers.map((emp) => (
                  <tr key={emp.id}>
                    <td>
                      <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#8b5cf6', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '12px', overflow: 'hidden' }}>
                        {emp.profile_picture_url ? (
                          <img src={emp.profile_picture_url} alt={emp.company_name || emp.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        ) : (
                          getInitials(emp.company_name || emp.name)
                        )}
                      </div>
                    </td>
                    <td><strong>{emp.company_name || '—'}</strong></td>
                    <td>{emp.name} ({emp.email})</td>
                    <td><code style={{ fontSize: '12px', background: 'var(--border-light)', padding: '2px 6px', borderRadius: '3px' }}>{emp.gst_number || 'PENDING'}</code></td>
                    <td>
                      <span className={`status-badge ${emp.status === 'ACTIVE' ? 'status-active' : emp.status === 'BLOCKED' ? 'status-blocked' : 'status-pending'}`}>
                        {emp.status}
                      </span>
                    </td>
                    <td>
                      <span className={`status-badge ${emp.aadhaar_verified ? 'status-verified' : 'status-pending'}`}>
                        {emp.aadhaar_verified ? 'Approved' : 'Pending'}
                      </span>
                    </td>
                    <td>{new Date(emp.created_at).toLocaleDateString()}</td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end' }}>
                        {emp.aadhaar_verified ? (
                          <button className="btn" style={{ padding: '4px 8px', fontSize: '11px', background: 'var(--danger)', color: 'white' }} onClick={() => handleVerify(emp.id, false)}>
                            Suspend GST
                          </button>
                        ) : (
                          <button className="btn" style={{ padding: '4px 8px', fontSize: '11px', background: 'var(--success)', color: 'white' }} onClick={() => handleVerify(emp.id, true)}>
                            Approve GST
                          </button>
                        )}
                        {emp.status === 'BLOCKED' ? (
                          <button className="btn btn-outline" style={{ padding: '4px 8px', fontSize: '11px' }} onClick={() => handleStatusChange(emp.id, 'ACTIVE')}>
                            Activate
                          </button>
                        ) : (
                          <button className="btn btn-outline" style={{ padding: '4px 8px', fontSize: '11px', color: 'var(--danger)' }} onClick={() => handleStatusChange(emp.id, 'BLOCKED')}>
                            Suspend
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
    </div>
  );
};
export default EmployerManagementPage;
