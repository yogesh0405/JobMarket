import React, { useState, useEffect } from 'react';
import { apiFetch } from '../../../utils/api';
import { useToast } from '../../../hooks/useToast';
import { MapPin, RefreshCw, CheckCircle, AlertTriangle, Clock, Layers } from 'lucide-react';

export const AdminMapAnalyticsPage: React.FC = () => {
  const { showToast } = useToast();
  const [analytics, setAnalytics] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isGeocoding, setIsGeocoding] = useState(false);

  const fetchAnalytics = async () => {
    try {
      setIsLoading(true);
      const res = await apiFetch('/api/v1/jobs/admin/map-analytics');
      if (res.ok) {
        const json = await res.json();
        setAnalytics(json.data);
      }
    } catch (err) {
      console.error('Error fetching admin map analytics:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const handleTriggerGeocoding = async () => {
    try {
      setIsGeocoding(true);
      showToast('Triggering batch geocoding for pending jobs...', 'info');
      const res = await apiFetch('/api/jobs/geocode', { method: 'POST' });
      if (res.ok) {
        const json = await res.json();
        showToast(
          `Geocoding completed! Processed ${json.data.totalProcessed} jobs (Success: ${json.data.successCount}, Failed: ${json.data.failedCount})`,
          'success'
        );
        fetchAnalytics();
      } else {
        showToast('Batch geocoding failed', 'error');
      }
    } catch (error) {
      showToast('Error executing batch geocoding', 'error');
    } finally {
      setIsGeocoding(false);
    }
  };

  if (isLoading) {
    return (
      <div style={{ padding: '30px', textAlign: 'center' }}>
        <RefreshCw className="animate-spin" size={28} color="#3b82f6" style={{ margin: '0 auto 12px' }} />
        <p style={{ color: '#94a3b8', fontWeight: '600' }}>Loading Map Analytics...</p>
      </div>
    );
  }

  const overview = analytics?.overview || {};
  const topLocations = analytics?.topLocations || [];

  return (
    <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h2 style={{ fontSize: '22px', fontWeight: '800', color: '#ffffff', margin: '0 0 4px 0' }}>
            Map & Location Analytics
          </h2>
          <p style={{ fontSize: '14px', color: '#94a3b8', margin: 0 }}>
            Geographic distribution of jobs, coordinate accuracy, and batch geocoding status.
          </p>
        </div>

        <button
          onClick={handleTriggerGeocoding}
          disabled={isGeocoding}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '10px 18px',
            borderRadius: '10px',
            background: 'linear-gradient(135deg, #3b82f6, #6366f1)',
            color: '#ffffff',
            border: 'none',
            fontWeight: '600',
            fontSize: '14px',
            cursor: 'pointer',
            boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)'
          }}
        >
          <RefreshCw size={16} className={isGeocoding ? 'animate-spin' : ''} />
          {isGeocoding ? 'Geocoding in Progress...' : 'Run Batch Geocode'}
        </button>
      </div>

      {/* KPI Cards Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
        <div style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '12px', padding: '18px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ fontSize: '13px', color: '#94a3b8', fontWeight: '600' }}>Total Jobs</span>
            <Layers size={20} color="#3b82f6" />
          </div>
          <div style={{ fontSize: '26px', fontWeight: '800', color: '#ffffff' }}>{overview.total_jobs || 0}</div>
        </div>

        <div style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '12px', padding: '18px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ fontSize: '13px', color: '#94a3b8', fontWeight: '600' }}>Geocoded Jobs</span>
            <CheckCircle size={20} color="#10b981" />
          </div>
          <div style={{ fontSize: '26px', fontWeight: '800', color: '#10b981' }}>{overview.geocoded_jobs || 0}</div>
        </div>

        <div style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '12px', padding: '18px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ fontSize: '13px', color: '#94a3b8', fontWeight: '600' }}>Pending Geocode</span>
            <Clock size={20} color="#f59e0b" />
          </div>
          <div style={{ fontSize: '26px', fontWeight: '800', color: '#f59e0b' }}>{overview.pending_jobs || 0}</div>
        </div>

        <div style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '12px', padding: '18px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ fontSize: '13px', color: '#94a3b8', fontWeight: '600' }}>Failed Geocode</span>
            <AlertTriangle size={20} color="#ef4444" />
          </div>
          <div style={{ fontSize: '26px', fontWeight: '800', color: '#ef4444' }}>{overview.failed_jobs || 0}</div>
        </div>
      </div>

      {/* Top Locations Table */}
      <div style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '14px', padding: '20px' }}>
        <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#ffffff', margin: '0 0 16px 0' }}>
          Jobs Distribution by Location
        </h3>

        <table style={{ width: '100%', borderCollapse: 'collapse', color: '#cbd5e1', fontSize: '14px' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid #334155', textAlign: 'left' }}>
              <th style={{ padding: '10px 14px', color: '#94a3b8' }}>Location / City</th>
              <th style={{ padding: '10px 14px', color: '#94a3b8' }}>Total Jobs</th>
              <th style={{ padding: '10px 14px', color: '#94a3b8' }}>Geocoded</th>
              <th style={{ padding: '10px 14px', color: '#94a3b8' }}>Status</th>
            </tr>
          </thead>
          <tbody>
            {topLocations.map((item: any, idx: number) => {
              const geocodedPct = Math.round((Number(item.geocoded_count) / Number(item.job_count)) * 100);
              return (
                <tr key={idx} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.05)' }}>
                  <td style={{ padding: '12px 14px', fontWeight: '600', color: '#ffffff', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <MapPin size={15} color="#3b82f6" />
                    {item.city}
                  </td>
                  <td style={{ padding: '12px 14px' }}>{item.job_count}</td>
                  <td style={{ padding: '12px 14px', color: '#10b981', fontWeight: '600' }}>
                    {item.geocoded_count} ({geocodedPct}%)
                  </td>
                  <td style={{ padding: '12px 14px' }}>
                    <span
                      style={{
                        padding: '3px 8px',
                        borderRadius: '12px',
                        fontSize: '11px',
                        fontWeight: '700',
                        background: geocodedPct === 100 ? 'rgba(16, 185, 129, 0.15)' : 'rgba(245, 158, 11, 0.15)',
                        color: geocodedPct === 100 ? '#10b981' : '#f59e0b'
                      }}
                    >
                      {geocodedPct === 100 ? 'Fully Geocoded' : 'Partial'}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
export default AdminMapAnalyticsPage;
