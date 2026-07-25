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
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <div style={{ height: '40px', background: '#e2e8f0', borderRadius: '4px', width: '200px', animation: 'pulse 1.5s infinite' }}></div>
        <div className="admin-grid">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} style={{ height: '120px', background: '#e2e8f0', borderRadius: '8px', animation: 'pulse 1.5s infinite' }}></div>
          ))}
        </div>
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
    { label: 'Total Users', value: stats.total_users, increase: '+12%', color: 'var(--primary)', icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg> },
    { label: 'Workers (Candidates)', value: stats.total_workers, increase: '+8%', color: 'var(--accent)', icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg> },
    { label: 'Employers', value: stats.total_employers, increase: '+15%', color: '#8B5CF6', icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="4" y="2" width="16" height="20" rx="2" ry="2" /><line x1="9" y1="22" x2="9" y2="16" /><line x1="15" y1="22" x2="15" y2="16" /><line x1="9" y1="16" x2="15" y2="16" /><path d="M8 6h2v2H8V6zm4 0h2v2h-2V6zm4 0h2v2h-2V6zM8 10h2v2H8v-2zm4 0h2v2h-2v-2zm4 0h2v2h-2v-2z" /></svg> },
    { label: 'Admins', value: stats.total_admins, increase: '0%', color: '#6B7280', icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg> },
    { label: 'Active Jobs', value: stats.approved_jobs, increase: '+24%', color: 'var(--success)', icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="7" width="20" height="14" rx="2" ry="2" /><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" /></svg> },
    { label: 'Pending Jobs', value: stats.pending_jobs, increase: 'New', color: 'var(--warning)', icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg> },
    { label: 'Rejected Jobs', value: stats.rejected_jobs, increase: '-3%', color: 'var(--danger)', icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><line x1="15" y1="9" x2="9" y2="15" /><line x1="9" y1="9" x2="15" y2="15" /></svg> },
    { label: 'Online Users', value: stats.online_users, increase: 'Active now', color: '#10B981', icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 12h-4l-3 9L9 3l-3 9H2" /></svg> },
    { label: 'Today\'s Applications', value: stats.applications_today, increase: '+18%', color: '#F59E0B', icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /></svg> },
    { label: 'Monthly Applications', value: stats.applications_this_month, increase: '+32%', color: '#EC4899', icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" /><line x1="6" y1="20" x2="6" y2="14" /></svg> },
    { label: 'Companies Registered', value: stats.total_companies, increase: '+5%', color: '#3B82F6', icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="4" y="2" width="16" height="20" rx="2" ry="2" /><line x1="9" y1="22" x2="9" y2="16" /><line x1="15" y1="22" x2="15" y2="16" /><line x1="9" y1="16" x2="15" y2="16" /><path d="M8 6h2v2H8V6zm4 0h2v2h-2V6zm4 0h2v2h-2V6zM8 10h2v2H8v-2zm4 0h2v2h-2v-2zm4 0h2v2h-2v-2z" /></svg> },
    { label: 'New Registrations (7d)', value: stats.new_registrations, increase: '+14%', color: '#14B8A6', icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><line x1="19" y1="8" x2="19" y2="14" /><line x1="22" y1="11" x2="16" y2="11" /></svg> }
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '28px', fontWeight: '800', color: 'var(--text-primary)' }}>Dashboard Overview</h1>
          <p style={{ color: 'var(--text-secondary)', marginTop: '4px' }}>Platform activities and real-time statistics</p>
        </div>
        <div style={{ fontSize: '12px', color: 'var(--text-tertiary)', background: 'var(--surface)', padding: '8px 12px', borderRadius: '4px', border: '1px solid var(--border)' }}>
          Last Updated: {new Date().toLocaleTimeString()}
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="admin-grid">
        {widgetConfig.map((w, index) => (
          <div className="stat-card-premium" key={index}>
            <div className="stat-card-header">
              <span className="stat-card-title">{w.label}</span>
              <div className="stat-card-icon-wrapper" style={{ background: `${w.color}15`, color: w.color, fontSize: '18px' }}>
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
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '24px', marginTop: '32px' }}>
        
        {/* Top Trade Categories */}
        <div className="admin-card" style={{ margin: 0 }}>
          <div className="admin-card-header">
            <h3 className="admin-card-title">Top Trade Categories</h3>
          </div>
          <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {charts.topCategories?.map((cat: any, idx: number) => {
              const maxVal = charts.topCategories[0]?.count || 1;
              const percent = Math.round((cat.count / maxVal) * 100);
              return (
                <div key={idx} style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', fontWeight: '600' }}>
                    <span>{cat.category}</span>
                    <span style={{ color: 'var(--text-secondary)' }}>{cat.count} Jobs</span>
                  </div>
                  <div style={{ height: '8px', width: '100%', background: 'var(--border)', borderRadius: '4px', overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${percent}%`, background: 'var(--primary)', borderRadius: '4px' }}></div>
                  </div>
                </div>
              );
            })}
            {(!charts.topCategories || charts.topCategories.length === 0) && (
              <p style={{ color: 'var(--text-secondary)', textAlign: 'center' }}>No category data available</p>
            )}
          </div>
        </div>

        {/* Top Locations */}
        <div className="admin-card" style={{ margin: 0 }}>
          <div className="admin-card-header">
            <h3 className="admin-card-title">Top MIDC Job Locations</h3>
          </div>
          <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {charts.topLocations?.map((loc: any, idx: number) => {
              const maxVal = charts.topLocations[0]?.count || 1;
              const percent = Math.round((loc.count / maxVal) * 100);
              return (
                <div key={idx} style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', fontWeight: '600' }}>
                    <span>{loc.location}</span>
                    <span style={{ color: 'var(--text-secondary)' }}>{loc.count} Jobs</span>
                  </div>
                  <div style={{ height: '8px', width: '100%', background: 'var(--border)', borderRadius: '4px', overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${percent}%`, background: 'var(--accent)', borderRadius: '4px' }}></div>
                  </div>
                </div>
              );
            })}
            {(!charts.topLocations || charts.topLocations.length === 0) && (
              <p style={{ color: 'var(--text-secondary)', textAlign: 'center' }}>No location data available</p>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
export default AdminDashboardPage;
