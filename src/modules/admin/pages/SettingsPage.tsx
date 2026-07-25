import React, { useEffect, useState } from 'react';
import { AdminApiService } from '../services/adminApi';
import { useToast } from '../../../hooks/useToast';

export const SettingsPage: React.FC = () => {
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const { showToast } = useToast();

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const res = await AdminApiService.getSettings();
      setSettings(res || {});
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
    <div>
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: '800', color: 'var(--text-primary)' }}>System Settings</h1>
        <p style={{ color: 'var(--text-secondary)', marginTop: '4px' }}>Configure platform behaviors, maintenance parameters, and security properties</p>
      </div>

      <div className="admin-card" style={{ maxWidth: '800px' }}>
        <div className="admin-card-header">
          <h3 className="admin-card-title">General Platform Config</h3>
        </div>

        <form onSubmit={handleSubmit} style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            <div className="form-group">
              <label className="form-label">Platform Name</label>
              <input type="text" className="form-input" style={{ background: 'var(--border-light)', padding: '10px' }} value={settings.platform_name || ''} onChange={e => handleChange('platform_name', e.target.value)} required />
            </div>

            <div className="form-group">
              <label className="form-label">Branding Short Logo</label>
              <input type="text" className="form-input" style={{ background: 'var(--border-light)', padding: '10px' }} value={settings.logo || ''} onChange={e => handleChange('logo', e.target.value)} required />
            </div>

            <div className="form-group">
              <label className="form-label">Support Email Address</label>
              <input type="email" className="form-input" style={{ background: 'var(--border-light)', padding: '10px' }} value={settings.support_email || ''} onChange={e => handleChange('support_email', e.target.value)} required />
            </div>

            <div className="form-group">
              <label className="form-label">Support Contact Number</label>
              <input type="text" className="form-input" style={{ background: 'var(--border-light)', padding: '10px' }} value={settings.contact_number || ''} onChange={e => handleChange('contact_number', e.target.value)} required />
            </div>
          </div>

          <hr style={{ border: 'none', borderBottom: '1px solid var(--border)', margin: '10px 0' }} />

          {/* Toggle Switches */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <strong style={{ fontSize: '15px' }}>Maintenance Mode</strong>
                <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Restrict all platform access. Shows a simple maintenance landing page to users.</p>
              </div>
              <button type="button" className="btn" style={{ padding: '8px 16px', background: settings.maintenance_mode === 'true' ? 'var(--danger)' : '#6b7280', color: 'white' }} onClick={() => handleToggle('maintenance_mode')}>
                {settings.maintenance_mode === 'true' ? 'ACTIVE' : 'INACTIVE'}
              </button>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <strong style={{ fontSize: '15px' }}>Public Registrations</strong>
                <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Allow new workers and employers to sign up on the platform.</p>
              </div>
              <button type="button" className="btn" style={{ padding: '8px 16px', background: settings.registration_toggle === 'true' ? 'var(--success)' : 'var(--danger)', color: 'white' }} onClick={() => handleToggle('registration_toggle')}>
                {settings.registration_toggle === 'true' ? 'ENABLED' : 'DISABLED'}
              </button>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <strong style={{ fontSize: '15px' }}>Employer GST Moderation</strong>
                <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>All corporate employers require admin verification before posting listings.</p>
              </div>
              <button type="button" className="btn" style={{ padding: '8px 16px', background: settings.employer_approval_toggle === 'true' ? 'var(--success)' : 'var(--danger)', color: 'white' }} onClick={() => handleToggle('employer_approval_toggle')}>
                {settings.employer_approval_toggle === 'true' ? 'ENABLED' : 'DISABLED'}
              </button>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <strong style={{ fontSize: '15px' }}>Job Post Approvals Queue</strong>
                <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Newly posted jobs require review and verification by the admin before being published.</p>
              </div>
              <button type="button" className="btn" style={{ padding: '8px 16px', background: settings.job_approval_toggle === 'true' ? 'var(--success)' : 'var(--danger)', color: 'white' }} onClick={() => handleToggle('job_approval_toggle')}>
                {settings.job_approval_toggle === 'true' ? 'ENABLED' : 'DISABLED'}
              </button>
            </div>
          </div>

          <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'flex-end' }}>
            <button type="submit" className="btn btn-primary" style={{ padding: '12px 24px' }} disabled={saving}>
              {saving ? 'Saving Config...' : 'Save Configuration'}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};
export default SettingsPage;
