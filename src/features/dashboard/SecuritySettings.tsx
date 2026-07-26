import React, { useState, useEffect } from 'react';
import { apiFetch } from '../../utils/api';
import { useToast } from '../../hooks/useToast';
import { ForgotPasswordModal } from '../../components/auth/ForgotPasswordModal';

interface UserSession {
  id: string;
  ipAddress: string;
  deviceName: string;
  browser: string;
  os: string;
  deviceType: 'Desktop' | 'Mobile';
  createdAt: string;
  lastUsedAt: string;
}

export const SecuritySettings: React.FC = () => {
  const { showToast } = useToast();

  // Active Sessions state
  const [sessions, setSessions] = useState<UserSession[]>([]);
  const [loadingSessions, setLoadingSessions] = useState(true);

  // Change Password state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPass, setShowCurrentPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);
  const [submittingPassword, setSubmittingPassword] = useState(false);

  // Forgot Password Modal state
  const [isForgotModalOpen, setIsForgotModalOpen] = useState(false);

  // Detect current client environment fallback
  const getClientFallbackSession = (): UserSession => {
    const ua = navigator.userAgent;
    let browser = 'Chrome Browser';
    let os = 'macOS';
    let deviceType: 'Desktop' | 'Mobile' = 'Desktop';

    if (/firefox/i.test(ua)) browser = 'Firefox';
    else if (/safari/i.test(ua) && !/chrome/i.test(ua)) browser = 'Safari';
    else if (/edge/i.test(ua)) browser = 'Edge';

    if (/android/i.test(ua)) { os = 'Android'; deviceType = 'Mobile'; }
    else if (/iphone|ipad|ipod/i.test(ua)) { os = 'iOS'; deviceType = 'Mobile'; }
    else if (/windows/i.test(ua)) { os = 'Windows'; }
    else if (/linux/i.test(ua)) { os = 'Linux'; }

    return {
      id: 'current-session-fallback',
      ipAddress: '127.0.0.1 (Current Client)',
      deviceName: `${os} (${browser})`,
      browser,
      os,
      deviceType,
      createdAt: new Date().toISOString(),
      lastUsedAt: new Date().toISOString()
    };
  };

  // Fetch active login sessions
  const fetchSessions = async () => {
    try {
      setLoadingSessions(true);
      const res = await apiFetch('/api/v1/auth/sessions');
      if (res.ok) {
        const json = await res.json();
        const apiData = json.data || [];
        if (apiData.length === 0) {
          setSessions([getClientFallbackSession()]);
        } else {
          setSessions(apiData);
        }
      } else {
        setSessions([getClientFallbackSession()]);
      }
    } catch (err) {
      console.error('Failed to load active login sessions', err);
      setSessions([getClientFallbackSession()]);
    } finally {
      setLoadingSessions(false);
    }
  };

  useEffect(() => {
    fetchSessions();
  }, []);

  // Revoke session
  const handleRevokeSession = async (sessionId: string) => {
    if (sessionId === 'current-session-fallback') {
      showToast('Cannot revoke your active session directly from here. Use Logout.', 'info');
      return;
    }
    try {
      const res = await apiFetch(`/api/v1/auth/sessions/${sessionId}`, { method: 'DELETE' });
      if (res.ok) {
        showToast('Session revoked successfully', 'success');
        setSessions(prev => prev.filter(s => s.id !== sessionId));
      } else {
        showToast('Failed to revoke session', 'error');
      }
    } catch (err) {
      showToast('Error revoking session', 'error');
    }
  };

  // Revoke all other sessions
  const handleLogoutAllOther = async () => {
    try {
      const res = await apiFetch('/api/v1/auth/logout-all', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({})
      });
      if (res.ok) {
        showToast('Logged out from all other devices successfully', 'success');
        fetchSessions();
      } else {
        showToast('Failed to logout from other devices', 'error');
      }
    } catch (err) {
      showToast('Error executing logout all', 'error');
    }
  };

  // Password strength calculation
  const getPasswordStrength = (pass: string) => {
    if (!pass) return { score: 0, label: '', color: '#e2e8f0' };
    let score = 0;
    if (pass.length >= 6) score += 1;
    if (pass.length >= 10) score += 1;
    if (/[A-Z]/.test(pass)) score += 1;
    if (/[0-9]/.test(pass)) score += 1;
    if (/[^A-Za-z0-9]/.test(pass)) score += 1;

    if (score <= 2) return { score, label: 'Weak Password', color: '#ef4444' };
    if (score <= 4) return { score, label: 'Fair Strength', color: '#f59e0b' };
    return { score, label: 'Strong & Secure', color: '#10b981' };
  };

  const strength = getPasswordStrength(newPassword);

  // Handle Change Password Submit
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!currentPassword || !newPassword || !confirmPassword) {
      showToast('Please fill out all password fields', 'error');
      return;
    }

    if (newPassword !== confirmPassword) {
      showToast('New password and confirm password do not match', 'error');
      return;
    }

    if (newPassword.length < 6) {
      showToast('New password must be at least 6 characters long', 'error');
      return;
    }

    try {
      setSubmittingPassword(true);
      const res = await apiFetch('/api/v1/auth/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword, newPassword })
      });

      const json = await res.json();

      if (res.ok) {
        showToast('Password changed successfully!', 'success');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        showToast(json.error || 'Failed to change password', 'error');
      }
    } catch (err) {
      showToast('Error changing password', 'error');
    } finally {
      setSubmittingPassword(false);
    }
  };

  return (
    <div className="security-settings-container" style={{ maxWidth: '920px', margin: '0 auto', padding: '24px 16px' }}>
      {/* Header Banner */}
      <div style={{ marginBottom: '32px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
          <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: 'linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%)', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
          </div>
          <div>
            <h1 style={{ fontSize: '24px', fontWeight: '800', color: '#0f172a', margin: 0, lineHeight: 1.2 }}>
              Security & Login Sessions
            </h1>
            <p style={{ color: '#64748b', fontSize: '14px', margin: '4px 0 0 0' }}>
              Manage active device sessions, change account credentials, or reset your password securely.
            </p>
          </div>
        </div>
      </div>

      {/* SECTION 1: ACTIVE LOGIN SESSIONS */}
      <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '20px', padding: '24px', marginBottom: '28px', boxShadow: '0 4px 20px rgba(15, 23, 42, 0.04)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ color: '#2563eb' }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>
            </div>
            <div>
              <h2 style={{ fontSize: '18px', fontWeight: '800', color: '#0f172a', margin: 0 }}>Active Login Sessions</h2>
              <p style={{ fontSize: '13px', color: '#64748b', margin: '2px 0 0 0' }}>Real-time active devices currently authenticated with your account</p>
            </div>
          </div>

          {sessions.length > 1 && (
            <button
              onClick={handleLogoutAllOther}
              style={{
                background: 'rgba(239, 68, 68, 0.08)',
                color: '#dc2626',
                border: '1px solid rgba(239, 68, 68, 0.2)',
                padding: '8px 16px',
                borderRadius: '10px',
                fontSize: '13px',
                fontWeight: '700',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
            >
              Log Out All Other Devices
            </button>
          )}
        </div>

        {loadingSessions ? (
          <div style={{ padding: '24px', textAlign: 'center', color: '#94a3b8', fontSize: '14px' }}>
            Detecting active device sessions...
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {sessions.map((session, index) => {
              const isCurrent = index === 0;
              return (
                <div
                  key={session.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '16px',
                    borderRadius: '14px',
                    border: isCurrent ? '1px solid #bfdbfe' : '1px solid #f1f5f9',
                    background: isCurrent ? '#f0f9ff' : '#ffffff',
                    flexWrap: 'wrap',
                    gap: '12px'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                    <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: isCurrent ? '#dbeafe' : '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#2563eb' }}>
                      {session.deviceType === 'Mobile' ? (
                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="5" y="2" width="14" height="20" rx="2"/><line x1="12" y1="18" x2="12.01" y2="18"/></svg>
                      ) : (
                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>
                      )}
                    </div>
                    <div>
                      <div style={{ fontWeight: '800', fontSize: '15px', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        {session.deviceName}
                        {isCurrent && (
                          <span style={{ fontSize: '11px', fontWeight: '800', background: '#dcfce7', color: '#15803d', padding: '2px 10px', borderRadius: '999px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                            <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#16a34a' }} />
                            Current Active Session
                          </span>
                        )}
                      </div>
                      <div style={{ fontSize: '13px', color: '#64748b', marginTop: '2px', fontWeight: '500' }}>
                        India • {session.browser} on {session.os}
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                    <span style={{ fontSize: '12px', color: '#94a3b8', fontWeight: '500' }}>
                      Active since {new Date(session.createdAt).toLocaleDateString()}
                    </span>
                    {!isCurrent && (
                      <button
                        onClick={() => handleRevokeSession(session.id)}
                        style={{
                          background: 'none',
                          border: '1px solid #cbd5e1',
                          color: '#ef4444',
                          fontSize: '12px',
                          fontWeight: '700',
                          padding: '6px 12px',
                          borderRadius: '8px',
                          cursor: 'pointer'
                        }}
                      >
                        Revoke
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* SECTION 2: CHANGE ACCOUNT PASSWORD */}
      <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '20px', padding: '24px', marginBottom: '28px', boxShadow: '0 4px 20px rgba(15, 23, 42, 0.04)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '18px' }}>
          <div style={{ color: '#2563eb' }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
          </div>
          <div>
            <h2 style={{ fontSize: '18px', fontWeight: '800', color: '#0f172a', margin: 0 }}>Change Account Password</h2>
            <p style={{ fontSize: '13px', color: '#64748b', margin: '2px 0 0 0' }}>Update your password regularly to keep your account safe</p>
          </div>
        </div>

        <form onSubmit={handleChangePassword} style={{ display: 'flex', flexDirection: 'column', gap: '16px', maxWidth: '520px' }}>
          {/* Current Password */}
          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', color: '#334155', marginBottom: '6px' }}>Current Password</label>
            <div style={{ position: 'relative' }}>
              <input
                type={showCurrentPass ? 'text' : 'password'}
                value={currentPassword}
                onChange={e => setCurrentPassword(e.target.value)}
                placeholder="Enter current password"
                style={{ width: '100%', padding: '11px 40px 11px 14px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '14px', outline: 'none' }}
                required
              />
              <button
                type="button"
                onClick={() => setShowCurrentPass(!showCurrentPass)}
                style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}
              >
                {showCurrentPass ? '👁️' : '🔒'}
              </button>
            </div>
          </div>

          {/* New Password */}
          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', color: '#334155', marginBottom: '6px' }}>New Password</label>
            <div style={{ position: 'relative' }}>
              <input
                type={showNewPass ? 'text' : 'password'}
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
                placeholder="Enter new password (min. 6 characters)"
                style={{ width: '100%', padding: '11px 40px 11px 14px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '14px', outline: 'none' }}
                required
              />
              <button
                type="button"
                onClick={() => setShowNewPass(!showNewPass)}
                style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}
              >
                {showNewPass ? '👁️' : '🔒'}
              </button>
            </div>

            {newPassword && (
              <div style={{ marginTop: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ flex: 1, height: '5px', background: '#e2e8f0', borderRadius: '999px', overflow: 'hidden' }}>
                  <div style={{ width: `${(strength.score / 5) * 100}%`, height: '100%', background: strength.color, transition: 'width 0.3s ease' }} />
                </div>
                <span style={{ fontSize: '12px', fontWeight: '800', color: strength.color }}>{strength.label}</span>
              </div>
            )}
          </div>

          {/* Confirm New Password */}
          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', color: '#334155', marginBottom: '6px' }}>Confirm New Password</label>
            <div style={{ position: 'relative' }}>
              <input
                type={showConfirmPass ? 'text' : 'password'}
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                placeholder="Confirm new password"
                style={{ width: '100%', padding: '11px 40px 11px 14px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '14px', outline: 'none' }}
                required
              />
              <button
                type="button"
                onClick={() => setShowConfirmPass(!showConfirmPass)}
                style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}
              >
                {showConfirmPass ? '👁️' : '🔒'}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={submittingPassword}
            style={{
              marginTop: '8px',
              padding: '12px 24px',
              borderRadius: '10px',
              background: 'linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%)',
              color: '#ffffff',
              border: 'none',
              fontWeight: '800',
              fontSize: '14px',
              cursor: submittingPassword ? 'not-allowed' : 'pointer',
              opacity: submittingPassword ? 0.7 : 1,
              width: 'fit-content',
              boxShadow: '0 4px 12px rgba(37, 99, 235, 0.25)'
            }}
          >
            {submittingPassword ? 'Updating Password...' : 'Save New Password'}
          </button>
        </form>
      </div>

      {/* SECTION 3: EMAIL OTP FORGOT / RESET PASSWORD CARD */}
      <div
        style={{
          background: 'linear-gradient(135deg, #f8fafc 0%, #eff6ff 100%)',
          border: '1px solid #dbeafe',
          borderRadius: '20px',
          padding: '24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '16px'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', maxWidth: '600px' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: '#dbeafe', color: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
              <polyline points="22,6 12,13 2,6" />
            </svg>
          </div>
          <div>
            <h3 style={{ margin: '0 0 4px 0', fontSize: '17px', fontWeight: '800', color: '#0f172a' }}>
              Forgot or Lost Your Password?
            </h3>
            <p style={{ margin: 0, fontSize: '13px', color: '#64748b', lineHeight: 1.45 }}>
              Send a 6-digit OTP verification code to your registered email address to set a new password anytime.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setIsForgotModalOpen(true)}
          style={{
            background: '#ffffff',
            color: '#2563eb',
            border: '2px solid #2563eb',
            padding: '11px 20px',
            borderRadius: '12px',
            fontWeight: '800',
            fontSize: '13px',
            cursor: 'pointer',
            whiteSpace: 'nowrap',
            transition: 'all 0.2s ease',
            boxShadow: '0 2px 8px rgba(37, 99, 235, 0.1)'
          }}
        >
          Reset Password via Email OTP →
        </button>
      </div>

      {/* Forgot Password Email OTP Modal */}
      <ForgotPasswordModal
        isOpen={isForgotModalOpen}
        onClose={() => setIsForgotModalOpen(false)}
      />
    </div>
  );
};
