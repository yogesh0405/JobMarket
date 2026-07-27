import React, { useEffect, useState } from 'react';
import { AdminApiService } from '../services/adminApi';
import { useToast } from '../../../hooks/useToast';

export const SettingsPage: React.FC = () => {
  const [settings, setSettings] = useState<Record<string, string>>({
    platform_name: 'JobMarket',
    logo: 'JM',
    support_email: 'support@csnjobmarket.com',
    contact_number: '+91 9876543210',
    maintenance_mode: 'false',
    job_approval_toggle: 'true',
    banner_publish_toggle: 'true'
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const { showToast } = useToast();

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const res = await AdminApiService.getSettings();
      setSettings(prev => ({
        ...prev,
        ...(res || {}),
        banner_publish_toggle: res?.banner_publish_toggle ?? 'true'
      }));
    } catch (err: any) {
      showToast('Failed to load system settings', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleChange = (key: string, value: string) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleToggle = (key: string) => {
    const val = settings[key] === 'true' ? 'false' : 'true';
    handleChange(key, val);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await AdminApiService.updateSettings(settings);
      showToast('Platform settings updated successfully', 'success');
      fetchSettings();
    } catch (err: any) {
      showToast(err.message || 'Failed to update system settings', 'error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div style={{ padding: '40px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div style={{ height: '35px', background: '#e2e8f0', borderRadius: '4px', width: '200px', animation: 'pulse 1.5s infinite' }}></div>
        <div style={{ height: '250px', background: '#e2e8f0', borderRadius: '8px', animation: 'pulse 1.5s infinite' }}></div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '840px', margin: '0 auto', paddingBottom: '60px' }}>
      <div style={{ marginBottom: '28px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: '800', color: '#0f172a', margin: 0, letterSpacing: '-0.5px' }}>System Settings</h1>
        <p style={{ color: '#64748b', marginTop: '6px', fontSize: '14.5px' }}>Configure platform behaviors, maintenance parameters, and security properties</p>
      </div>

      <div style={{ background: '#ffffff', borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 4px 20px rgba(15, 23, 42, 0.05)', overflow: 'hidden' }}>
        <div style={{ padding: '20px 24px', borderBottom: '1px solid #f1f5f9', background: '#ffffff' }}>
          <h3 style={{ margin: 0, fontSize: '17px', fontWeight: '700', color: '#0f172a' }}>General Platform Config</h3>
        </div>

        <form onSubmit={handleSubmit} style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            <div className="form-group">
              <label className="form-label" style={{ fontWeight: '700', fontSize: '13px', color: '#334155', marginBottom: '8px', display: 'block' }}>Platform Name</label>
              <input 
                type="text" 
                className="form-input" 
                style={{ width: '100%', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '11px 14px', fontSize: '14px', color: '#0f172a', fontWeight: '500' }} 
                value={settings.platform_name || ''} 
                onChange={e => handleChange('platform_name', e.target.value)} 
                required 
              />
            </div>

            <div className="form-group">
              <label className="form-label" style={{ fontWeight: '700', fontSize: '13px', color: '#334155', marginBottom: '8px', display: 'block' }}>Branding Short Logo</label>
              <input 
                type="text" 
                className="form-input" 
                style={{ width: '100%', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '11px 14px', fontSize: '14px', color: '#0f172a', fontWeight: '500' }} 
                value={settings.logo || ''} 
                onChange={e => handleChange('logo', e.target.value)} 
                required 
              />
            </div>

            <div className="form-group">
              <label className="form-label" style={{ fontWeight: '700', fontSize: '13px', color: '#334155', marginBottom: '8px', display: 'block' }}>Support Email Address</label>
              <input 
                type="email" 
                className="form-input" 
                style={{ width: '100%', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '11px 14px', fontSize: '14px', color: '#0f172a', fontWeight: '500' }} 
                value={settings.support_email || ''} 
                onChange={e => handleChange('support_email', e.target.value)} 
                required 
              />
            </div>

            <div className="form-group">
              <label className="form-label" style={{ fontWeight: '700', fontSize: '13px', color: '#334155', marginBottom: '8px', display: 'block' }}>Support Contact Number</label>
              <input 
                type="text" 
                className="form-input" 
                style={{ width: '100%', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '11px 14px', fontSize: '14px', color: '#0f172a', fontWeight: '500' }} 
                value={settings.contact_number || ''} 
                onChange={e => handleChange('contact_number', e.target.value)} 
                required 
              />
            </div>
          </div>

          <hr style={{ border: 'none', borderBottom: '1px solid #f1f5f9', margin: '4px 0' }} />

          {/* System Toggle Controls */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            
            {/* Maintenance Mode Toggle */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '16px' }}>
              <div>
                <strong style={{ fontSize: '14.5px', color: '#0f172a', fontWeight: '700' }}>Maintenance Mode</strong>
                <p style={{ fontSize: '12.5px', color: '#64748b', margin: '3px 0 0 0' }}>Restrict all platform access. Shows a simple maintenance landing page to users.</p>
              </div>
              <button 
                type="button" 
                onClick={() => handleToggle('maintenance_mode')}
                style={{
                  padding: '7px 18px',
                  borderRadius: '6px',
                  border: 'none',
                  fontSize: '12px',
                  fontWeight: '800',
                  letterSpacing: '0.5px',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  background: settings.maintenance_mode === 'true' ? '#ef4444' : '#64748b',
                  color: '#ffffff',
                  minWidth: '95px'
                }}
              >
                {settings.maintenance_mode === 'true' ? 'ACTIVE' : 'INACTIVE'}
              </button>
            </div>

            {/* Job Post Approvals Queue Toggle */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '16px' }}>
              <div>
                <strong style={{ fontSize: '14.5px', color: '#0f172a', fontWeight: '700' }}>Job Post Approvals Queue</strong>
                <p style={{ fontSize: '12.5px', color: '#64748b', margin: '3px 0 0 0' }}>Newly posted jobs require review and verification by the admin before being published.</p>
              </div>
              <button 
                type="button" 
                onClick={() => handleToggle('job_approval_toggle')}
                style={{
                  padding: '7px 18px',
                  borderRadius: '6px',
                  border: 'none',
                  fontSize: '12px',
                  fontWeight: '800',
                  letterSpacing: '0.5px',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  background: settings.job_approval_toggle === 'true' ? '#10b981' : '#ef4444',
                  color: '#ffffff',
                  minWidth: '95px'
                }}
              >
                {settings.job_approval_toggle === 'true' ? 'ENABLED' : 'DISABLED'}
              </button>
            </div>

            {/* Promotional Banner Publishment Toggle */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '16px' }}>
              <div>
                <strong style={{ fontSize: '14.5px', color: '#0f172a', fontWeight: '700' }}>Promotional Banner Publishment</strong>
                <p style={{ fontSize: '12.5px', color: '#64748b', margin: '3px 0 0 0' }}>Global master switch for homepage promotional slider banners. When OFF, banners are hidden platform-wide.</p>
              </div>
              <button 
                type="button" 
                onClick={() => handleToggle('banner_publish_toggle')}
                style={{
                  padding: '7px 18px',
                  borderRadius: '6px',
                  border: 'none',
                  fontSize: '12px',
                  fontWeight: '800',
                  letterSpacing: '0.5px',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  background: settings.banner_publish_toggle === 'true' ? '#10b981' : '#ef4444',
                  color: '#ffffff',
                  minWidth: '95px'
                }}
              >
                {settings.banner_publish_toggle === 'true' ? 'ENABLED' : 'DISABLED'}
              </button>
            </div>

          </div>

          <div style={{ marginTop: '12px', display: 'flex', justifyContent: 'flex-end' }}>
            <button 
              type="submit" 
              className="btn btn-primary" 
              style={{ padding: '12px 28px', borderRadius: '8px', fontWeight: '700', fontSize: '14px', background: '#344BFD', border: 'none' }} 
              disabled={saving}
            >
              {saving ? 'Saving Config...' : 'Save Configuration'}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};

export default SettingsPage;
