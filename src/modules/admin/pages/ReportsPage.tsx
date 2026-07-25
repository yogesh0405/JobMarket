import React, { useEffect, useState, useCallback } from 'react';
import { AdminApiService } from '../services/adminApi';
import { useToast } from '../../../hooks/useToast';

export const ReportsPage: React.FC = () => {
  const [reports, setReports] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [loading, setLoading] = useState(true);

  const { showToast } = useToast();

  const fetchReports = useCallback(async () => {
    try {
      setLoading(true);
      const res = await AdminApiService.getReports({ page, limit });
      setReports(res.data || []);
      setTotal(res.total || 0);
    } catch (err: any) {
      showToast('Failed to fetch platform content reports', 'error');
    } finally {
      setLoading(false);
    }
  }, [page, limit, showToast]);

  useEffect(() => {
    fetchReports();
  }, [page]);

  const handleResolveAction = async (reportId: string, action: 'ignore' | 'delete_content' | 'suspend_user') => {
    const confirmationMsg = action === 'delete_content' 
      ? 'Are you sure you want to delete the reported content?' 
      : action === 'suspend_user' 
      ? 'Are you sure you want to deactivate the violating user account?' 
      : 'Are you sure you want to ignore this report?';
      
    if (!window.confirm(confirmationMsg)) return;

    try {
      await AdminApiService.resolveReport(reportId, action);
      showToast('Report resolved successfully', 'success');
      fetchReports();
    } catch (err: any) {
      showToast(err.message || 'Failed to resolve report', 'error');
    }
  };

  return (
    <div>
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: '800', color: 'var(--text-primary)' }}>Content Moderation & Reports</h1>
        <p style={{ color: 'var(--text-secondary)', marginTop: '4px' }}>Audit flagged listings, review reporting details, and suspend violations</p>
      </div>

      {/* Reports Board */}
      <div className="admin-card">
        {loading ? (
          <div style={{ padding: '40px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} style={{ height: '35px', background: '#e2e8f0', borderRadius: '4px', animation: 'pulse 1.5s infinite' }}></div>
            ))}
          </div>
        ) : reports.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-secondary)' }}>
            No content reports submitted. Platform health is excellent!
          </div>
        ) : (
          <div className="table-wrapper">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Report Date</th>
                  <th>Reporter</th>
                  <th>Reported Party</th>
                  <th>Flagged Content</th>
                  <th>Reason Description</th>
                  <th>Status State</th>
                  <th style={{ textAlign: 'right' }}>Actions / Resolution</th>
                </tr>
              </thead>
              <tbody>
                {reports.map((rep) => (
                  <tr key={rep.id}>
                    <td>{new Date(rep.created_at).toLocaleString()}</td>
                    <td>
                      <strong>{rep.reporter_name || 'Anonymous'}</strong> <br />
                      <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>{rep.reporter_email || ''}</span>
                    </td>
                    <td>
                      <strong>{rep.reported_user_name || 'System'}</strong> <br />
                      <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>{rep.reported_user_email || ''}</span>
                    </td>
                    <td>
                      <span className="status-badge" style={{ background: '#e0e4ff', color: '#1a2eb8' }}>
                        {rep.reported_content_type}
                      </span> <br />
                      <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>ID: {rep.reported_content_id}</span>
                    </td>
                    <td style={{ maxWidth: '280px', wordBreak: 'break-word', fontSize: '13px' }}>{rep.reason}</td>
                    <td>
                      <span className={`status-badge ${rep.status === 'RESOLVED' ? 'status-active' : rep.status === 'IGNORED' ? 'status-inactive' : 'status-pending'}`}>
                        {rep.status}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      {rep.status === 'PENDING' ? (
                        <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end' }}>
                          <button className="btn btn-outline" style={{ padding: '4px 8px', fontSize: '11px', background: 'var(--success-light)', color: 'var(--success)' }} onClick={() => handleResolveAction(rep.id, 'ignore')}>
                            Ignore
                          </button>
                          {rep.reported_content_type === 'JOB' && (
                            <button className="btn" style={{ padding: '4px 8px', fontSize: '11px', background: 'var(--danger)', color: 'white' }} onClick={() => handleResolveAction(rep.id, 'delete_content')}>
                              Delete Job
                            </button>
                          )}
                          <button className="btn" style={{ padding: '4px 8px', fontSize: '11px', background: '#3b82f6', color: 'white' }} onClick={() => handleResolveAction(rep.id, 'suspend_user')}>
                            Suspend User
                          </button>
                        </div>
                      ) : (
                        <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                          Resolved at: {new Date(rep.resolved_at).toLocaleDateString()}
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Pagination Controls */}
            <div className="table-pagination">
              <span>Showing {reports.length} of {total} reports</span>
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
export default ReportsPage;
