import React, { useEffect, useState, useRef } from 'react';
import { AdminApiService } from '../services/adminApi';
import { useToast } from '../../../hooks/useToast';
import { Upload, Trash2, Image as ImageIcon, CheckCircle, RefreshCw, AlertTriangle, X, RotateCcw } from 'lucide-react';
import { compressImageIfNecessary } from '../../../utils/uploadToCloudinary';

export const SettingsPage: React.FC = () => {
  const [settings, setSettings] = useState<Record<string, string>>({
    platform_name: 'JobMarket',
    logo: 'JM',
    logo_url: '',
    support_email: 'support@csnjobmarket.com',
    contact_number: '+91 240 2554000',
    maintenance_mode: 'false'
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [showEnableMaintenanceModal, setShowEnableMaintenanceModal] = useState(false);
  const [showDisableMaintenanceModal, setShowDisableMaintenanceModal] = useState(false);
  const [typedConfirmation, setTypedConfirmation] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { showToast } = useToast();

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const res = await AdminApiService.getSettings();
      setSettings(prev => ({
        ...prev,
        ...(res || {}),
        logo_url: res?.logo_url || ''
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

  const handleMaintenanceToggleClick = () => {
    if (settings.maintenance_mode === 'true') {
      setShowDisableMaintenanceModal(true);
    } else {
      setTypedConfirmation('');
      setShowEnableMaintenanceModal(true);
    }
  };

  const confirmActivateMaintenance = async () => {
    if (typedConfirmation.trim().toUpperCase() !== 'MAINTENANCE') {
      showToast('Please type MAINTENANCE exactly to confirm.', 'error');
      return;
    }
    setShowEnableMaintenanceModal(false);
    setTypedConfirmation('');
    const updated = { ...settings, maintenance_mode: 'true' };
    setSettings(updated);
    try {
      await AdminApiService.updateSettings(updated);
      window.dispatchEvent(new CustomEvent('settings-updated', { detail: updated }));
      showToast('Maintenance mode ACTIVATED platform-wide.', 'warning');
    } catch (err: any) {
      showToast(err.message || 'Failed to activate maintenance mode', 'error');
    }
  };

  const confirmDeactivateMaintenance = async () => {
    setShowDisableMaintenanceModal(false);
    const updated = { ...settings, maintenance_mode: 'false' };
    setSettings(updated);
    try {
      await AdminApiService.updateSettings(updated);
      window.dispatchEvent(new CustomEvent('settings-updated', { detail: updated }));
      showToast('Maintenance mode deactivated. Platform is now LIVE!', 'success');
    } catch (err: any) {
      showToast(err.message || 'Failed to update maintenance mode', 'error');
    }
  };

  const handleLogoFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      showToast('Please select a valid image file (PNG, SVG, JPG, WebP)', 'error');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      showToast('Logo file size must be under 5MB', 'error');
      return;
    }

    setUploadingLogo(true);
    try {
      const compressed = await compressImageIfNecessary(file, 800, 0.9);
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64Url = reader.result as string;
        handleChange('logo_url', base64Url);
        setUploadingLogo(false);
        showToast('Logo image loaded. Click "Save Configuration" to apply platform-wide.', 'info');
      };
      reader.onerror = () => {
        setUploadingLogo(false);
        showToast('Failed to read logo image file', 'error');
      };
      reader.readAsDataURL(compressed);
    } catch (err) {
      setUploadingLogo(false);
      showToast('Error processing logo image', 'error');
    }
  };

  const handleRemoveLogo = () => {
    handleChange('logo_url', '');
    if (fileInputRef.current) fileInputRef.current.value = '';
    showToast('Custom logo removed. Default branding will be used.', 'info');
  };

  const handleSetDefaultLogo = () => {
    setSettings(prev => ({
      ...prev,
      logo_url: '',
      logo: 'JM'
    }));
    if (fileInputRef.current) fileInputRef.current.value = '';
    showToast('Default JobMarket logo selected. Click "Save Configuration" to apply platform-wide.', 'info');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await AdminApiService.updateSettings(settings);
      showToast('Platform & Branding settings updated successfully', 'success');
      window.dispatchEvent(new CustomEvent('settings-updated', { detail: settings }));
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
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: '800', color: '#0f172a', margin: 0, letterSpacing: '-0.5px' }}>System Settings</h1>
        <p style={{ color: '#64748b', marginTop: '4px', fontSize: '13.5px' }}>Configure platform branding, company logos, contact info, and security toggles</p>
      </div>

      <div style={{ background: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 2px 12px rgba(15, 23, 42, 0.04)', overflow: 'hidden' }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid #f1f5f9', background: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <h3 style={{ margin: 0, fontSize: '15px', fontWeight: '700', color: '#0f172a' }}>General Platform & Branding Config</h3>
          <span style={{ fontSize: '11px', fontWeight: '600', color: '#10b981', background: '#ecfdf5', padding: '4px 8px', borderRadius: '4px', border: '1px solid #a7f3d0', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <CheckCircle size={12} /> Syncs to Web & Mobile
          </span>
        </div>

        <form onSubmit={handleSubmit} style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* Company / Platform Logo Management */}
          <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '16px 18px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
              <ImageIcon size={16} color="#344BFD" />
              <strong style={{ fontSize: '13.5px', color: '#0f172a', fontWeight: '700' }}>Platform & Company Logo</strong>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '20px', flexWrap: 'wrap' }}>
              {/* Visual Preview Box */}
              <div style={{
                width: '74px',
                height: '74px',
                borderRadius: '8px',
                background: '#ffffff',
                border: '1.5px dashed #cbd5e1',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                overflow: 'hidden',
                position: 'relative',
                flexShrink: 0,
                boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
              }}>
                {settings.logo_url ? (
                  <img
                    src={settings.logo_url}
                    alt="Platform Logo Preview"
                    style={{ width: '100%', height: '100%', objectFit: 'contain', padding: '4px' }}
                    onError={(e) => {
                      (e.currentTarget as HTMLElement).style.display = 'none';
                    }}
                  />
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '4px' }}>
                    <img
                      src="/logo.svg"
                      alt="JobMarket Default Logo"
                      style={{ width: '32px', height: '32px', objectFit: 'contain' }}
                      onError={(e) => {
                        (e.currentTarget as HTMLElement).style.display = 'none';
                      }}
                    />
                    <span style={{ fontSize: '9px', color: '#64748b', fontWeight: '700', marginTop: '2px' }}>Default JM</span>
                  </div>
                )}
              </div>

              {/* Upload and Control Actions */}
              <div style={{ flex: 1, minWidth: '240px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleLogoFileUpload}
                    accept="image/*"
                    style={{ display: 'none' }}
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploadingLogo}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '8px 14px',
                      background: '#344BFD',
                      color: '#ffffff',
                      borderRadius: '6px',
                      border: 'none',
                      fontSize: '12px',
                      fontWeight: '700',
                      cursor: 'pointer'
                    }}
                  >
                    <Upload size={13} />
                    {uploadingLogo ? 'Processing...' : 'Upload Logo Image'}
                  </button>

                  <button
                    type="button"
                    onClick={handleSetDefaultLogo}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '8px 14px',
                      background: '#ffffff',
                      color: '#0f172a',
                      borderRadius: '6px',
                      border: '1px solid #cbd5e1',
                      fontSize: '12px',
                      fontWeight: '700',
                      cursor: 'pointer',
                      boxShadow: '0 1px 2px rgba(0,0,0,0.04)'
                    }}
                  >
                    <RotateCcw size={13} color="#64748b" />
                    Use Default Logo
                  </button>

                  {settings.logo_url && (
                    <button
                      type="button"
                      onClick={handleRemoveLogo}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '5px',
                        padding: '8px 12px',
                        background: '#fee2e2',
                        color: '#dc2626',
                        borderRadius: '6px',
                        border: '1px solid #fecaca',
                        fontSize: '12px',
                        fontWeight: '700',
                        cursor: 'pointer'
                      }}
                    >
                      <Trash2 size={13} />
                      Remove
                    </button>
                  )}
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <input
                    type="text"
                    placeholder="Or enter direct Logo Image URL (e.g. https://.../logo.png)"
                    value={settings.logo_url || ''}
                    onChange={(e) => handleChange('logo_url', e.target.value)}
                    style={{
                      flex: 1,
                      background: '#ffffff',
                      border: '1px solid #cbd5e1',
                      borderRadius: '6px',
                      padding: '7px 10px',
                      fontSize: '12px',
                      color: '#0f172a'
                    }}
                  />
                </div>
                <span style={{ fontSize: '11px', color: '#64748b' }}>
                  Recommended: Transparent PNG, SVG, or high-res square/horizontal format (Max 5MB).
                </span>
              </div>
            </div>
          </div>

          {/* Form Text Inputs */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div className="form-group">
              <label className="form-label" style={{ fontWeight: '700', fontSize: '12.5px', color: '#334155', marginBottom: '6px', display: 'block' }}>Platform / Company Name</label>
              <input 
                type="text" 
                className="form-input" 
                style={{ width: '100%', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '6px', padding: '9px 12px', fontSize: '13px', color: '#0f172a', fontWeight: '500' }} 
                value={settings.platform_name || ''} 
                onChange={e => handleChange('platform_name', e.target.value)} 
                required 
              />
            </div>

            <div className="form-group">
              <label className="form-label" style={{ fontWeight: '700', fontSize: '12.5px', color: '#334155', marginBottom: '6px', display: 'block' }}>Branding Short Logo / Initials</label>
              <input 
                type="text" 
                className="form-input" 
                style={{ width: '100%', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '6px', padding: '9px 12px', fontSize: '13px', color: '#0f172a', fontWeight: '500' }} 
                value={settings.logo || ''} 
                onChange={e => handleChange('logo', e.target.value)} 
                placeholder="e.g. JM"
                required 
              />
            </div>

            <div className="form-group">
              <label className="form-label" style={{ fontWeight: '700', fontSize: '12.5px', color: '#334155', marginBottom: '6px', display: 'block' }}>Support Email Address</label>
              <input 
                type="email" 
                className="form-input" 
                style={{ width: '100%', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '6px', padding: '9px 12px', fontSize: '13px', color: '#0f172a', fontWeight: '500' }} 
                value={settings.support_email || ''} 
                onChange={e => handleChange('support_email', e.target.value)} 
                required 
              />
            </div>

            <div className="form-group">
              <label className="form-label" style={{ fontWeight: '700', fontSize: '12.5px', color: '#334155', marginBottom: '6px', display: 'block' }}>Support Contact Number</label>
              <input 
                type="text" 
                className="form-input" 
                style={{ width: '100%', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '6px', padding: '9px 12px', fontSize: '13px', color: '#0f172a', fontWeight: '500' }} 
                value={settings.contact_number || ''} 
                onChange={e => handleChange('contact_number', e.target.value)} 
                required 
              />
            </div>
          </div>

          <hr style={{ border: 'none', borderBottom: '1px solid #f1f5f9', margin: '2px 0' }} />

          {/* System Toggle Controls */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            
            {/* Maintenance Mode Toggle */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '16px' }}>
              <div>
                <strong style={{ fontSize: '13.5px', color: '#0f172a', fontWeight: '700' }}>Maintenance Mode</strong>
                <p style={{ fontSize: '12px', color: '#64748b', margin: '2px 0 0 0' }}>Restrict all platform access. Shows a simple maintenance landing page to users.</p>
              </div>
              <button 
                type="button" 
                onClick={handleMaintenanceToggleClick}
                style={{
                  padding: '6px 16px',
                  borderRadius: '6px',
                  border: 'none',
                  fontSize: '11.5px',
                  fontWeight: '800',
                  letterSpacing: '0.5px',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  background: settings.maintenance_mode === 'true' ? '#ef4444' : '#64748b',
                  color: '#ffffff',
                  minWidth: '90px'
                }}
              >
                {settings.maintenance_mode === 'true' ? 'ACTIVE' : 'INACTIVE'}
              </button>
            </div>

          </div>

          <div style={{ marginTop: '8px', display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
            <button 
              type="submit" 
              className="btn btn-primary" 
              style={{ padding: '10px 24px', borderRadius: '6px', fontWeight: '700', fontSize: '13px', background: '#344BFD', border: 'none', display: 'flex', alignItems: 'center', gap: '6px' }} 
              disabled={saving}
            >
              {saving && <RefreshCw size={13} className="animate-spin" />}
              {saving ? 'Saving Changes...' : 'Save Configuration'}
            </button>
          </div>

        </form>
      </div>

      {/* 1. GitHub-Style Type-to-Confirm Modal for ENABLING Maintenance Mode */}
      {showEnableMaintenanceModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(15, 23, 42, 0.65)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          padding: '20px'
        }}>
          <div style={{
            background: '#ffffff',
            borderRadius: '12px',
            maxWidth: '480px',
            width: '100%',
            padding: '24px',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.2), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
            border: '1px solid #fecaca'
          }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px', marginBottom: '16px' }}>
              <div style={{
                width: '42px',
                height: '42px',
                borderRadius: '50%',
                backgroundColor: '#fee2e2',
                color: '#dc2626',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}>
                <AlertTriangle size={22} />
              </div>
              <div style={{ flex: 1 }}>
                <h3 style={{ margin: '0 0 6px 0', fontSize: '17px', fontWeight: '800', color: '#0f172a' }}>
                  Enable Maintenance Mode?
                </h3>
                <p style={{ margin: 0, fontSize: '13px', color: '#64748b', lineHeight: '18px' }}>
                  This will immediately restrict public access for all job seekers and employers across Web and Mobile applications.
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setShowEnableMaintenanceModal(false);
                  setTypedConfirmation('');
                }}
                style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: '4px' }}
              >
                <X size={18} />
              </button>
            </div>

            <div style={{
              backgroundColor: '#fff1f2',
              border: '1px solid #ffe4e6',
              borderRadius: '8px',
              padding: '12px 14px',
              fontSize: '12.5px',
              color: '#9f1239',
              marginBottom: '16px',
              lineHeight: '17px'
            }}>
              To prevent accidental platform downtime, please type <strong style={{ color: '#be123c', letterSpacing: '0.5px' }}>MAINTENANCE</strong> to confirm:
            </div>

            {/* Type-to-confirm input */}
            <div style={{ marginBottom: '20px' }}>
              <input
                type="text"
                autoFocus
                placeholder="Type MAINTENANCE here"
                value={typedConfirmation}
                onChange={(e) => setTypedConfirmation(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  borderRadius: '6px',
                  border: typedConfirmation.trim().toUpperCase() === 'MAINTENANCE' ? '2px solid #dc2626' : '1px solid #cbd5e1',
                  fontSize: '14px',
                  fontWeight: '600',
                  color: '#0f172a',
                  outline: 'none',
                  backgroundColor: '#f8fafc'
                }}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button
                type="button"
                onClick={() => {
                  setShowEnableMaintenanceModal(false);
                  setTypedConfirmation('');
                }}
                style={{
                  padding: '9px 16px',
                  borderRadius: '6px',
                  border: '1px solid #cbd5e1',
                  background: '#ffffff',
                  color: '#475569',
                  fontSize: '13px',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmActivateMaintenance}
                disabled={typedConfirmation.trim().toUpperCase() !== 'MAINTENANCE'}
                style={{
                  padding: '9px 18px',
                  borderRadius: '6px',
                  border: 'none',
                  background: typedConfirmation.trim().toUpperCase() === 'MAINTENANCE' ? '#dc2626' : '#94a3b8',
                  color: '#ffffff',
                  fontSize: '13px',
                  fontWeight: '700',
                  cursor: typedConfirmation.trim().toUpperCase() === 'MAINTENANCE' ? 'pointer' : 'not-allowed',
                  opacity: typedConfirmation.trim().toUpperCase() === 'MAINTENANCE' ? 1 : 0.6,
                  transition: 'all 0.2s ease'
                }}
              >
                I understand, Enable Maintenance
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2. Confirmation Modal for MAKING PLATFORM LIVE (Deactivating Maintenance) */}
      {showDisableMaintenanceModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(15, 23, 42, 0.65)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          padding: '20px'
        }}>
          <div style={{
            background: '#ffffff',
            borderRadius: '12px',
            maxWidth: '460px',
            width: '100%',
            padding: '24px',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.2), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
            border: '1px solid #bbf7d0'
          }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px', marginBottom: '16px' }}>
              <div style={{
                width: '42px',
                height: '42px',
                borderRadius: '50%',
                backgroundColor: '#dcfce7',
                color: '#16a34a',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}>
                <CheckCircle size={22} />
              </div>
              <div style={{ flex: 1 }}>
                <h3 style={{ margin: '0 0 6px 0', fontSize: '17px', fontWeight: '800', color: '#0f172a' }}>
                  Make Platform LIVE?
                </h3>
                <p style={{ margin: 0, fontSize: '13px', color: '#64748b', lineHeight: '18px' }}>
                  This will immediately restore full public access for all job seekers and employers across Web and Mobile applications.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowDisableMaintenanceModal(false)}
                style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: '4px' }}
              >
                <X size={18} />
              </button>
            </div>

            <div style={{
              backgroundColor: '#f0fdf4',
              border: '1px solid #dcfce7',
              borderRadius: '8px',
              padding: '12px 14px',
              fontSize: '12px',
              color: '#15803d',
              marginBottom: '20px',
              lineHeight: '16px'
            }}>
              <strong>Status:</strong> The platform will immediately resume normal production traffic upon confirmation.
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button
                type="button"
                onClick={() => setShowDisableMaintenanceModal(false)}
                style={{
                  padding: '9px 16px',
                  borderRadius: '6px',
                  border: '1px solid #cbd5e1',
                  background: '#ffffff',
                  color: '#475569',
                  fontSize: '13px',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDeactivateMaintenance}
                style={{
                  padding: '9px 18px',
                  borderRadius: '6px',
                  border: 'none',
                  background: '#16a34a',
                  color: '#ffffff',
                  fontSize: '13px',
                  fontWeight: '700',
                  cursor: 'pointer',
                  boxShadow: '0 2px 8px rgba(22, 163, 74, 0.3)'
                }}
              >
                Yes, Make Platform LIVE
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SettingsPage;
