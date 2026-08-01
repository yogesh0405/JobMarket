import React, { useEffect, useState, useCallback } from 'react';
import { AdminApiService } from '../services/adminApi';
import { useToast } from '../../../hooks/useToast';

export const AuditLogsPage: React.FC = () => {
  const [logs, setLogs] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit] = useState(15);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const { showToast } = useToast();

  const fetchLogs = useCallback(async () => {
    try {
      setLoading(true);
      const res = await AdminApiService.getAuditLogs({
        page,
        limit,
        search
      });
      setLogs(res.data || []);
      setTotal(res.total || 0);
    } catch (err: any) {
      showToast('Failed to fetch platform audit logs', 'error');
    } finally {
      setLoading(false);
    }
  }, [page, limit, search, showToast]);

  useEffect(() => {
    fetchLogs();
  }, [page]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchLogs();
  };

  // Helper to parse browser name from user agent
  const getBrowserName = (ua: string) => {
    if (!ua) return 'Unknown';
    if (ua.includes('Firefox')) return 'Firefox';
    if (ua.includes('Chrome')) return 'Chrome';
    if (ua.includes('Safari') && !ua.includes('Chrome')) return 'Safari';
    if (ua.includes('Edge')) return 'Edge';
    return 'Web Browser';
  };

  return (
    <div>
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: '800', color: 'var(--text-primary)' }}>System Security & Audit Trail</h1>
        <p style={{ color: 'var(--text-secondary)', marginTop: '4px' }}>Inspect platform audit logs, track security operations, and review admin actions</p>
      </div>

      {/* Filter toolbar */}
      <div className="admin-card" style={{ marginBottom: '24px' }}>
        <form onSubmit={handleSearch} className="filter-toolbar" style={{ background: 'var(--surface)' }}>
          <div style={{ position: 'relative', flex: 1, minWidth: '220px' }}>
            <input
              type="text"
              placeholder="Search by action, module, admin name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="navbar-search-input"
              style={{ width: '100%', paddingLeft: '12px' }}
            />
          </div>
          <button type="submit" className="btn btn-primary" style={{ padding: '8px 16px', fontSize: '13px' }}>
            Search Trail
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
        ) : logs.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-secondary)' }}>
            No audit logs captured yet.
          </div>
        ) : (
          <div className="table-wrapper">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Timestamp</th>
                  <th>Admin User</th>
                  <th>Action / Operation</th>
                  <th>Module</th>
                  <th>IP Address</th>
                  <th>Client Agent</th>
                  <th>Metadata Details</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log) => (
                  <tr key={log.id}>
                    <td style={{ whiteSpace: 'nowrap' }}>{new Date(log.created_at).toLocaleString()}</td>
                    <td>
                      <strong>{log.admin_name || 'System Auto'}</strong> <br />
                      <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>{log.admin_email || 'cron'}</span>
                    </td>
                    <td>
                      <span className="status-badge" style={{ background: '#e0e4ff', color: '#1a2eb8', fontWeight: 'bold' }}>
                        {log.action}
                      </span>
                    </td>
                    <td>{log.module || 'System'}</td>
                    <td>{log.ip_address || '127.0.0.1'}</td>
                    <td style={{ fontSize: '12px' }} title={log.user_agent}>
                      {getBrowserName(log.user_agent)}
                    </td>
                    <td style={{ maxWidth: '280px', fontSize: '11px' }}>
                      <pre style={{ margin: 0, padding: '4px', background: 'var(--border-light)', borderRadius: '3px', overflowX: 'auto', whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>
                        {JSON.stringify(log.metadata || {}, null, 2)}
                      </pre>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Pagination Controls */}
            <div className="table-pagination">
              <span>Showing {logs.length} of {total} audit records</span>
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
export default AuditLogsPage;
