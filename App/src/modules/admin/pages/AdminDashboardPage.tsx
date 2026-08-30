import React, { useEffect, useState } from 'react';
import { AdminApiService } from '../services/adminApi';
import { useToast } from '../../../hooks/useToast';

export const AdminDashboardPage: React.FC = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const result = await AdminApiService.getDashboard();
        setData(result);
      } catch (err: any) {
        showToast(err.message || 'Failed to load dashboard data', 'error');
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, [showToast]);

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '360px', gap: '16px' }}>
        <div style={{
          width: '44px',
          height: '44px',
          border: '4px solid var(--border)',
          borderTop: '4px solid var(--primary)',
          borderRadius: '50%',
          animation: 'spin 0.8s linear infinite'
        }}></div>
        <p style={{ color: 'var(--text-secondary)', fontSize: '14px', fontWeight: '600' }}>Fetching real-time database metrics...</p>
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  const stats = data?.stats || {};
  const charts = data?.charts || {};

  // Formatter for numbers
  const formatNum = (num: number) => {
    return new Intl.NumberFormat('en-IN').format(num || 0);
  };

  const widgetConfig = [
    { label: 'Total Users', value: stats.total_users, increase: `${stats.total_users > 0 ? 'Live' : '0'}`, color: 'var(--primary)', icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg> },
    { label: 'Workers (Candidates)', value: stats.total_workers, increase: `${stats.total_users > 0 ? Math.round((stats.total_workers / (stats.total_users || 1)) * 100) : 0}% of total`, color: 'var(--accent)', icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg> },
    { label: 'Employers', value: stats.total_employers, increase: `${stats.total_users > 0 ? Math.round((stats.total_employers / (stats.total_users || 1)) * 100) : 0}% of total`, color: '#8B5CF6', icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="4" y="2" width="16" height="20" rx="2" ry="2" /><line x1="9" y1="22" x2="9" y2="16" /><line x1="15" y1="22" x2="15" y2="16" /><line x1="9" y1="16" x2="15" y2="16" /><path d="M8 6h2v2H8V6zm4 0h2v2h-2V6zm4 0h2v2h-2V6zM8 10h2v2H8v-2zm4 0h2v2h-2v-2zm4 0h2v2h-2v-2z" /></svg> },
    { label: 'Admins', value: stats.total_admins, increase: 'System', color: '#6B7280', icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg> },
    { label: 'Active Jobs', value: stats.approved_jobs, increase: `${stats.total_jobs > 0 ? Math.round((stats.approved_jobs / (stats.total_jobs || 1)) * 100) : 0}% active`, color: 'var(--success)', icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="7" width="20" height="14" rx="2" ry="2" /><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" /></svg> },
    { label: 'Pending Jobs', value: stats.pending_jobs, increase: stats.pending_jobs > 0 ? 'Requires Action' : 'All Reviewed', color: 'var(--warning)', icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg> },
    { label: 'Rejected Jobs', value: stats.rejected_jobs, increase: `${stats.total_jobs > 0 ? Math.round((stats.rejected_jobs / (stats.total_jobs || 1)) * 100) : 0}% rejected`, color: 'var(--danger)', icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><line x1="15" y1="9" x2="9" y2="15" /><line x1="9" y1="9" x2="15" y2="15" /></svg> },
    { label: 'Online Users', value: stats.online_users, increase: 'Active now', color: '#10B981', icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 12h-4l-3 9L9 3l-3 9H2" /></svg> },
    { label: 'Today\'s Applications', value: stats.applications_today, increase: 'Today', color: '#F59E0B', icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /></svg> },
    { label: 'Monthly Applications', value: stats.applications_this_month, increase: 'This Month', color: '#EC4899', icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" /><line x1="6" y1="20" x2="6" y2="14" /></svg> },
    { label: 'Companies Registered', value: stats.total_companies, increase: 'Verified', color: '#3B82F6', icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="4" y="2" width="16" height="20" rx="2" ry="2" /><line x1="9" y1="22" x2="9" y2="16" /><line x1="15" y1="22" x2="15" y2="16" /><line x1="9" y1="16" x2="15" y2="16" /><path d="M8 6h2v2H8V6zm4 0h2v2h-2V6zm4 0h2v2h-2V6zM8 10h2v2H8v-2zm4 0h2v2h-2v-2zm4 0h2v2h-2v-2z" /></svg> },
    { label: 'New Registrations (7d)', value: stats.new_registrations, increase: 'Last 7 Days', color: '#14B8A6', icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><line x1="19" y1="8" x2="19" y2="14" /><line x1="22" y1="11" x2="16" y2="11" /></svg> }
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <div>
          <h1 style={{ fontSize: '20px', fontWeight: '800', color: 'var(--text-primary)', margin: 0 }}>Dashboard Overview</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '12px', margin: '2px 0 0' }}>Platform activities and real-time statistics</p>
        </div>
        <div style={{ fontSize: '11px', color: 'var(--text-tertiary)', background: 'var(--surface)', padding: '6px 10px', borderRadius: '4px', border: '1px solid var(--border)' }}>
          Last Updated: {new Date().toLocaleTimeString()}
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="admin-grid">
        {widgetConfig.map((w, index) => (
          <div className="stat-card-premium" key={index}>
            <div className="stat-card-header">
              <span className="stat-card-title">{w.label}</span>
              <div className="stat-card-icon-wrapper" style={{ background: `${w.color}15`, color: w.color }}>
                {w.icon}
              </div>
            </div>
            <div className="stat-card-body">
              <span className="stat-card-number">{formatNum(w.value)}</span>
              <span className={`stat-card-trend ${w.increase.startsWith('-') ? 'trend-down' : 'trend-up'}`} style={{ color: w.increase.includes('New') || w.increase.includes('Active') ? 'var(--primary)' : undefined }}>
                {w.increase}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Charts / Progress bars section */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '16px', marginTop: '16px' }}>
        
        {/* Top Trade Categories */}
        <div className="admin-card" style={{ margin: 0 }}>
          <div className="admin-card-header" style={{ padding: '12px 16px' }}>
            <h3 className="admin-card-title" style={{ fontSize: '13px', fontWeight: '700' }}>Top Trade Categories</h3>
          </div>
          <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {charts.topCategories?.map((cat: any, idx: number) => {
              const maxVal = charts.topCategories[0]?.count || 1;
              const percent = Math.round((cat.count / maxVal) * 100);
              return (
                <div key={idx} style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', fontWeight: '600' }}>
                    <span>{cat.category}</span>
                    <span style={{ color: 'var(--text-secondary)' }}>{cat.count} Jobs</span>
                  </div>
                  <div style={{ height: '6px', width: '100%', background: 'var(--border)', borderRadius: '3px', overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${percent}%`, background: 'var(--primary)', borderRadius: '3px' }}></div>
                  </div>
                </div>
              );
            })}
            {(!charts.topCategories || charts.topCategories.length === 0) && (
              <p style={{ color: 'var(--text-secondary)', textAlign: 'center', fontSize: '12px' }}>No category data available</p>
            )}
          </div>
        </div>

        {/* Top Locations */}
        <div className="admin-card" style={{ margin: 0 }}>
          <div className="admin-card-header" style={{ padding: '12px 16px' }}>
            <h3 className="admin-card-title" style={{ fontSize: '13px', fontWeight: '700' }}>Top MIDC Job Locations</h3>
          </div>
          <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {charts.topLocations?.map((loc: any, idx: number) => {
              const maxVal = charts.topLocations[0]?.count || 1;
              const percent = Math.round((loc.count / maxVal) * 100);
              return (
                <div key={idx} style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', fontWeight: '600' }}>
                    <span>{loc.location}</span>
                    <span style={{ color: 'var(--text-secondary)' }}>{loc.count} Jobs</span>
                  </div>
                  <div style={{ height: '6px', width: '100%', background: 'var(--border)', borderRadius: '3px', overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${percent}%`, background: 'var(--accent)', borderRadius: '3px' }}></div>
                  </div>
                </div>
              );
            })}
            {(!charts.topLocations || charts.topLocations.length === 0) && (
              <p style={{ color: 'var(--text-secondary)', textAlign: 'center', fontSize: '12px' }}>No location data available</p>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
export default AdminDashboardPage;
