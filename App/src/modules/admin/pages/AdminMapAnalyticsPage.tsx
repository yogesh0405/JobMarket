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
      const res = await apiFetch('/api/v1/jobs/geocode', { method: 'POST' });
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
      <div style={{ padding: '40px 20px', textAlign: 'center', background: '#ffffff', borderRadius: '4px', border: '1.5px solid #cbd5e1' }}>
        <RefreshCw className="animate-spin" size={28} color="#344BFD" style={{ margin: '0 auto 12px' }} />
        <p style={{ color: '#64748b', fontWeight: '600', fontSize: '14px', margin: 0 }}>Loading Map & Location Analytics...</p>
      </div>
    );
  }

  const overview = analytics?.overview || {};
  const topLocations = analytics?.topLocations || [];

  return (
    <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '24px', background: '#f8fafc', minHeight: '100vh' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h2 style={{ fontSize: '22px', fontWeight: '800', color: '#0f172a', margin: '0 0 4px 0' }}>
            Map & Location Analytics
          </h2>
          <p style={{ fontSize: '13.5px', color: '#64748b', margin: 0, fontWeight: '500' }}>
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
            borderRadius: '4px',
            background: '#344BFD',
            color: '#ffffff',
            border: 'none',
            fontWeight: '700',
            fontSize: '13.5px',
            cursor: 'pointer',
            boxShadow: '0 4px 12px rgba(52, 75, 253, 0.25)',
            transition: 'all 0.18s ease'
          }}
        >
          <RefreshCw size={16} className={isGeocoding ? 'animate-spin' : ''} />
          {isGeocoding ? 'Geocoding in Progress...' : 'Run Batch Geocode'}
        </button>
      </div>

      {/* KPI Cards Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
        <div style={{ background: '#ffffff', border: '1.5px solid #cbd5e1', borderRadius: '4px', padding: '18px', boxShadow: '0 4px 12px rgba(15, 23, 42, 0.05)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ fontSize: '12.5px', color: '#64748b', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Total Jobs</span>
            <div style={{ width: '32px', height: '32px', borderRadius: '4px', background: '#eff6ff', color: '#344BFD', border: '1px solid #bfdbfe', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Layers size={18} />
            </div>
          </div>
          <div style={{ fontSize: '28px', fontWeight: '800', color: '#0f172a', lineHeight: 1.1 }}>{overview.total_jobs || 0}</div>
        </div>

        <div style={{ background: '#ffffff', border: '1.5px solid #cbd5e1', borderRadius: '4px', padding: '18px', boxShadow: '0 4px 12px rgba(15, 23, 42, 0.05)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ fontSize: '12.5px', color: '#64748b', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Geocoded Jobs</span>
            <div style={{ width: '32px', height: '32px', borderRadius: '4px', background: '#dcfce7', color: '#15803d', border: '1px solid #bbf7d0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <CheckCircle size={18} />
            </div>
          </div>
          <div style={{ fontSize: '28px', fontWeight: '800', color: '#059669', lineHeight: 1.1 }}>{overview.geocoded_jobs || 0}</div>
        </div>

        <div style={{ background: '#ffffff', border: '1.5px solid #cbd5e1', borderRadius: '4px', padding: '18px', boxShadow: '0 4px 12px rgba(15, 23, 42, 0.05)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ fontSize: '12.5px', color: '#64748b', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Pending Geocode</span>
            <div style={{ width: '32px', height: '32px', borderRadius: '4px', background: '#fef3c7', color: '#b45309', border: '1px solid #fde68a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Clock size={18} />
            </div>
          </div>
          <div style={{ fontSize: '28px', fontWeight: '800', color: '#d97706', lineHeight: 1.1 }}>{overview.pending_jobs || 0}</div>
        </div>

        <div style={{ background: '#ffffff', border: '1.5px solid #cbd5e1', borderRadius: '4px', padding: '18px', boxShadow: '0 4px 12px rgba(15, 23, 42, 0.05)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ fontSize: '12.5px', color: '#64748b', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Failed Geocode</span>
            <div style={{ width: '32px', height: '32px', borderRadius: '4px', background: '#fee2e2', color: '#b91c1c', border: '1px solid #fecaca', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <AlertTriangle size={18} />
            </div>
          </div>
          <div style={{ fontSize: '28px', fontWeight: '800', color: '#dc2626', lineHeight: 1.1 }}>{overview.failed_jobs || 0}</div>
        </div>
      </div>

      {/* Top Locations Table */}
      <div style={{ background: '#ffffff', border: '1.5px solid #cbd5e1', borderRadius: '4px', padding: '20px', boxShadow: '0 4px 12px rgba(15, 23, 42, 0.05)' }}>
        <h3 style={{ fontSize: '16px', fontWeight: '800', color: '#0f172a', margin: '0 0 16px 0' }}>
          Jobs Distribution by Location
        </h3>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', color: '#334155', fontSize: '13.5px' }}>
            <thead>
              <tr style={{ background: '#f8fafc', borderBottom: '1.5px solid #cbd5e1', textAlign: 'left' }}>
                <th style={{ padding: '12px 14px', color: '#475569', fontWeight: '700', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Location / City</th>
                <th style={{ padding: '12px 14px', color: '#475569', fontWeight: '700', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Total Jobs</th>
                <th style={{ padding: '12px 14px', color: '#475569', fontWeight: '700', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Geocoded</th>
                <th style={{ padding: '12px 14px', color: '#475569', fontWeight: '700', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {topLocations.map((item: any, idx: number) => {
                const geocodedPct = Math.round((Number(item.geocoded_count) / Number(item.job_count)) * 100);
                return (
                  <tr key={idx} style={{ borderBottom: '1px solid #e2e8f0' }}>
                    <td style={{ padding: '12px 14px', fontWeight: '700', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <MapPin size={15} color="#344BFD" />
                      {item.city}
                    </td>
                    <td style={{ padding: '12px 14px', fontWeight: '600', color: '#334155' }}>{item.job_count}</td>
                    <td style={{ padding: '12px 14px', color: '#059669', fontWeight: '700' }}>
                      {item.geocoded_count} ({geocodedPct}%)
                    </td>
                    <td style={{ padding: '12px 14px' }}>
                      <span
                        style={{
                          padding: '4px 10px',
                          borderRadius: '4px',
                          fontSize: '11px',
                          fontWeight: '800',
                          textTransform: 'uppercase',
                          letterSpacing: '0.4px',
                          background: geocodedPct === 100 ? '#dcfce7' : '#fef3c7',
                          color: geocodedPct === 100 ? '#15803d' : '#b45309',
                          border: geocodedPct === 100 ? '1px solid #bbf7d0' : '1px solid #fde68a'
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
    </div>
  );
};
export default AdminMapAnalyticsPage;
