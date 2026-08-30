import React, { useEffect, useState, useCallback } from 'react';
import { AdminApiService } from '../services/adminApi';
import { useToast } from '../../../hooks/useToast';
import { getInitials, safeJsonParse } from '../../../utils/helpers';
import { ResumePreviewModal } from '../../../components/profile/ResumePreviewModal';

export const WorkerManagementPage: React.FC = () => {
  const [workers, setWorkers] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [previewResume, setPreviewResume] = useState<any>(null);
  const [previewUserId, setPreviewUserId] = useState<string>('');

  const { showToast } = useToast();

  const fetchWorkers = useCallback(async () => {
    try {
      setLoading(true);
      const res = await AdminApiService.getWorkers({
        page,
        limit,
        search,
        status
      });
      setWorkers(res.data || []);
      setTotal(res.total || 0);
    } catch (err: any) {
      showToast('Failed to fetch worker list', 'error');
    } finally {
      setLoading(false);
    }
  }, [page, limit, search, status, showToast]);

  useEffect(() => {
    fetchWorkers();
  }, [page, status]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchWorkers();
  };

  const handleStatusChange = async (userId: string, newStatus: 'ACTIVE' | 'INACTIVE' | 'BLOCKED') => {
    try {
      await AdminApiService.updateUserStatus(userId, newStatus);
      showToast(`Worker status successfully updated to ${newStatus}`, 'success');
      fetchWorkers();
    } catch (err: any) {
      showToast(err.message || 'Failed to update status', 'error');
    }
  };

  return (
    <div>
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: '800', color: 'var(--text-primary)' }}>Worker Roster</h1>
        <p style={{ color: 'var(--text-secondary)', marginTop: '4px' }}>Manage candidate credentials, specialized industrial trades, and background verifications</p>
      </div>

      {/* Filter toolbar */}
      <div className="admin-card" style={{ marginBottom: '24px' }}>
        <form onSubmit={handleSearchSubmit} className="filter-toolbar" style={{ background: 'var(--surface)' }}>
          <div style={{ position: 'relative', flex: 1, minWidth: '220px' }}>
            <input
              type="text"
              placeholder="Search by name, phone, trade..."
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
        ) : workers.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-secondary)' }}>
            No candidates registered on the platform.
          </div>
        ) : (
          <div className="table-wrapper">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Avatar</th>
                  <th>Name</th>
                  <th>Contact Details</th>
                  <th>Trade Specialization</th>
                  <th>Status</th>
                  <th>Resume</th>
                  <th>Registration Date</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {workers.map((worker) => (
                  <tr key={worker.id}>
                    <td>
                      <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#10b981', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '12px', overflow: 'hidden' }}>
                        {worker.profile_picture_url ? (
                          <img src={worker.profile_picture_url} alt={worker.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        ) : (
                          getInitials(worker.name)
                        )}
                      </div>
                    </td>
                    <td><strong>{worker.name}</strong></td>
                    <td>{worker.email} <br /><span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{worker.phone || '—'}</span></td>
                    <td><span className="status-badge" style={{ background: '#e0e4ff', color: '#1a2eb8' }}>{worker.trade_specialization || 'General Labor'}</span></td>
                    <td>
                      <span className={`status-badge ${worker.status === 'ACTIVE' ? 'status-active' : worker.status === 'BLOCKED' ? 'status-blocked' : 'status-pending'}`}>
                        {worker.status}
                      </span>
                    </td>
                    <td>
                      {worker.resume ? (
                        <button
                          className="btn btn-outline"
                          style={{ padding: '4px 8px', fontSize: '11px', background: 'var(--surface)', border: '1px solid var(--border)' }}
                          onClick={() => {
                            const resObj = safeJsonParse(worker.resume, null);
                            setPreviewResume(resObj);
                            setPreviewUserId(worker.id);
                          }}
                        >
                          View Resume
                        </button>
                      ) : '—'}
                    </td>
                    <td>{new Date(worker.created_at).toLocaleDateString()}</td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end' }}>
                        {worker.status === 'BLOCKED' ? (
                          <button className="btn btn-outline" style={{ padding: '4px 8px', fontSize: '11px' }} onClick={() => handleStatusChange(worker.id, 'ACTIVE')}>
                            Activate
                          </button>
                        ) : (
                          <button className="btn btn-outline" style={{ padding: '4px 8px', fontSize: '11px', color: 'var(--danger)' }} onClick={() => handleStatusChange(worker.id, 'BLOCKED')}>
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
              <span>Showing {workers.length} of {total} workers</span>
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
      {previewResume && (
        <ResumePreviewModal
          resume={previewResume}
          userId={previewUserId}
          onClose={() => {
            setPreviewResume(null);
            setPreviewUserId('');
          }}
        />
      )}
    </div>
  );
};
export default WorkerManagementPage;
