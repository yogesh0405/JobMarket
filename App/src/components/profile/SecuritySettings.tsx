import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../hooks/useToast';
import { apiFetch } from '../../utils/api';
import { 
  ShieldCheck, 
  KeyRound, 
  Laptop, 
  Smartphone, 
  LogOut, 
  Send, 
  Eye, 
  EyeOff,
  ArrowLeft
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface SessionItem {
  id: string;
  device: string;
  browser: string;
  location: string;
  ip: string;
  lastActive: string;
  isCurrent: boolean;
  type: 'desktop' | 'mobile';
}

function getClientPlatformInfo() {
  const ua = navigator.userAgent;
  let browser = 'Chrome';
  let os = 'macOS';
  let type: 'desktop' | 'mobile' = 'desktop';

  if (/edg|edge/i.test(ua)) browser = 'Edge';
  else if (/opera|opr/i.test(ua)) browser = 'Opera';
  else if (/firefox|fxios/i.test(ua)) browser = 'Firefox';
  else if (/chrome|crios/i.test(ua)) browser = 'Chrome';
  else if (/safari/i.test(ua)) browser = 'Safari';

  if (/android/i.test(ua)) { os = 'Android'; type = 'mobile'; }
  else if (/iphone|ipod/i.test(ua)) { os = 'iOS'; type = 'mobile'; }
  else if (/ipad/i.test(ua)) { os = 'iPadOS'; type = 'mobile'; }
  else if (/macintosh|mac os x/i.test(ua)) { os = 'macOS'; type = 'desktop'; }
  else if (/windows/i.test(ua)) { os = 'Windows'; type = 'desktop'; }
  else if (/linux/i.test(ua)) { os = 'Linux'; type = 'desktop'; }

  return {
    browser,
    os,
    type,
    deviceName: `${os} (${browser})`,
    location: 'Maharashtra, India'
  };
}

export const SecuritySettings: React.FC = () => {
  const { currentUser, logout } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  
  // Direct Password Change state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPass, setShowCurrentPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);
  const [isSubmittingChangePass, setIsSubmittingChangePass] = useState(false);

  // OTP Reset Password state
  const [isOtpOpen, setIsOtpOpen] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [otpNewPass, setOtpNewPass] = useState('');
  const [otpConfirmPass, setOtpConfirmPass] = useState('');
  const [showOtpNewPass, setShowOtpNewPass] = useState(false);
  const [showOtpConfirmPass, setShowOtpConfirmPass] = useState(false);
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [isResettingPass, setIsResettingPass] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);

  // Active Sessions state
  const clientInfo = getClientPlatformInfo();
  const [sessions, setSessions] = useState<SessionItem[]>([
    {
      id: localStorage.getItem('sessionId') || 'session-current',
      device: clientInfo.deviceName,
      browser: clientInfo.browser,
      location: 'Maharashtra, India',
      ip: '198.51.100.24',
      lastActive: 'Active Now',
      isCurrent: true,
      type: clientInfo.type
    }
  ]);
  const [sessionsLoading, setSessionsLoading] = useState(true);
  const [isTerminatingSessions, setIsTerminatingSessions] = useState(false);

  // 2FA state
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(
    Boolean((currentUser as any)?.is_two_factor_enabled || (currentUser as any)?.isTwoFactorEnabled)
  );
  const [isToggling2FA, setIsToggling2FA] = useState(false);

  useEffect(() => {
    if (currentUser) {
      setTwoFactorEnabled(Boolean((currentUser as any)?.is_two_factor_enabled || (currentUser as any)?.isTwoFactorEnabled));
    }
  }, [currentUser]);

  // Resend timer countdown
  useEffect(() => {
    if (resendTimer <= 0) return;
    const interval = setInterval(() => setResendTimer(prev => prev - 1), 1000);
    return () => clearInterval(interval);
  }, [resendTimer]);

  // Fetch real active sessions
  useEffect(() => {
    let isMounted = true;
    const currentSessionId = localStorage.getItem('sessionId');

    apiFetch('/api/v1/auth/sessions')
      .then(res => res.ok ? res.json() : null)
      .then(json => {
        if (!isMounted) return;
        if (json && json.success && Array.isArray(json.data) && json.data.length > 0) {
          const mapped: SessionItem[] = json.data.map((s: any, idx: number) => {
            const isCurrent = Boolean(s.isCurrent || s.is_current || (currentSessionId && s.id === currentSessionId));
            const devType = (s.deviceType || s.device_type || s.os || '').toLowerCase();
            const isMob = devType.includes('mobile') || (s.os || '').toLowerCase().includes('android') || (s.os || '').toLowerCase().includes('ios');
            const dName = s.deviceName || s.device_name || `${s.os || 'Device'} (${s.browser || 'Browser'})`;

            return {
              id: s.id || `sess-${idx}`,
              device: dName,
              browser: s.browser || (isMob ? 'Mobile App' : 'Desktop Web'),
              location: s.location || 'Active Session',
              ip: s.ipAddress || s.ip_address || '198.51.100.24',
              lastActive: isCurrent ? 'Active Now' : (s.lastUsedAt ? `Last active ${new Date(s.lastUsedAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}` : 'Active Session'),
              isCurrent,
              type: isMob ? ('mobile' as const) : ('desktop' as const)
            };
          });

          mapped.sort((a, b) => (b.isCurrent ? 1 : 0) - (a.isCurrent ? 1 : 0));
          setSessions(mapped);
        }
      })
      .catch(() => null)
      .finally(() => {
        if (isMounted) setSessionsLoading(false);
      });

    return () => { isMounted = false; };
  }, []);

  // 1. Direct Password Change Handler
  const handleDirectPasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword || !newPassword || !confirmPassword) {
      showToast('Please fill in all password fields.', 'error');
      return;
    }
    if (newPassword !== confirmPassword) {
      showToast('New passwords do not match.', 'error');
      return;
    }
    if (newPassword.length < 6) {
      showToast('New password must be at least 6 characters.', 'error');
      return;
    }

    setIsSubmittingChangePass(true);
    try {
      const res = await apiFetch('/api/v1/auth/change-password', {
        method: 'POST',
        body: JSON.stringify({ currentPassword, newPassword })
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || json.message || 'Failed to update password');

      showToast('Password changed successfully!', 'success');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      showToast(err.message || 'Failed to update password. Please check current password.', 'error');
    } finally {
      setIsSubmittingChangePass(false);
    }
  };

  // 2. Send Reset OTP Handler
  const handleSendResetOtp = async () => {
    const userEmail = currentUser?.email;
    if (!userEmail) {
      showToast('User email not found. Please log in again.', 'error');
      return;
    }

    setIsSendingOtp(true);
    try {
      const res = await apiFetch('/api/v1/auth/forgot-password', {
        method: 'POST',
        body: JSON.stringify({ email: userEmail })
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || json.message || 'Failed to send OTP code');

      showToast('OTP sent to registered email', 'success');
      setIsOtpOpen(true);
      setResendTimer(60);
    } catch (err: any) {
      showToast(err.message || 'Failed to send OTP code.', 'error');
    } finally {
      setIsSendingOtp(false);
    }
  };

  // 3. Confirm Reset Password with OTP Handler
  const handleResetPasswordWithOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    const userEmail = currentUser?.email;
    if (!userEmail) {
      showToast('User email not found.', 'error');
      return;
    }
    if (!otpCode || otpCode.trim().length < 4) {
      showToast('Please enter the valid OTP code received on your email.', 'error');
      return;
    }
    if (!otpNewPass || !otpConfirmPass) {
      showToast('Please enter and confirm your new password.', 'error');
      return;
    }
    if (otpNewPass !== otpConfirmPass) {
      showToast('New passwords do not match.', 'error');
      return;
    }
    if (otpNewPass.length < 6) {
      showToast('Password must be at least 6 characters long.', 'error');
      return;
    }

    setIsResettingPass(true);
    try {
      const res = await apiFetch('/api/v1/auth/reset-password', {
        method: 'POST',
        body: JSON.stringify({
          email: userEmail,
          otpCode: otpCode.trim(),
          newPassword: otpNewPass
        })
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || json.message || 'Failed to reset password');

      showToast('Password reset successfully! You can now use your new password.', 'success');
      setOtpCode('');
      setOtpNewPass('');
      setOtpConfirmPass('');
      setIsOtpOpen(false);
    } catch (err: any) {
      showToast(err.message || 'Failed to reset password. Please verify your OTP code.', 'error');
    } finally {
      setIsResettingPass(false);
    }
  };

  // 4. Terminate All Other Sessions
  const handleTerminateOtherSessions = async () => {
    setIsTerminatingSessions(true);
    try {
      const res = await apiFetch('/api/v1/auth/logout-all', {
        method: 'POST'
      });
      const json = await res.json().catch(() => null);
      if (!res.ok && json) throw new Error(json.error || json.message || 'Failed to terminate sessions');

      setSessions(prev => prev.filter(s => s.isCurrent));
      showToast('Successfully logged out of all other devices & active sessions!', 'success');
    } catch (err: any) {
      showToast(err.message || 'Failed to terminate other sessions', 'error');
    } finally {
      setIsTerminatingSessions(false);
    }
  };

  // 5. Revoke Specific Session
  const handleRevokeSession = async (sessionId: string) => {
    const currentSessionId = localStorage.getItem('sessionId');
    const targetSession = sessions.find(s => s.id === sessionId);
    const isCurrentSession = Boolean(targetSession?.isCurrent || (currentSessionId && sessionId === currentSessionId));

    try {
      const res = await apiFetch(`/api/v1/auth/sessions/${sessionId}`, {
        method: 'DELETE'
      });
      const json = await res.json().catch(() => null);
      if (!res.ok && json) throw new Error(json.error || json.message || 'Failed to revoke session');

      if (isCurrentSession) {
        showToast('Current device session revoked. Logging out...', 'info');
        setTimeout(() => logout(), 300);
      } else {
        setSessions(prev => prev.filter(s => s.id !== sessionId));
        showToast('Device session revoked successfully', 'success');
      }
    } catch (err: any) {
      showToast(err.message || 'Failed to revoke session', 'error');
    }
  };

  // 6. Toggle 2FA API Handler
  const handleToggle2FA = async () => {
    const nextState = !twoFactorEnabled;
    setIsToggling2FA(true);
    try {
      const res = await apiFetch('/api/v1/auth/2fa/toggle', {
        method: 'POST',
        body: JSON.stringify({ enabled: nextState })
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || json.message || 'Failed to update 2FA setting');

      setTwoFactorEnabled(nextState);
      showToast(nextState ? '2FA protection enabled for your account!' : '2FA protection disabled.', nextState ? 'success' : 'info');
    } catch (err: any) {
      showToast(err.message || 'Failed to update 2FA setting', 'error');
    } finally {
      setIsToggling2FA(false);
    }
  };

  return (
    <div className="security-page-container">
      <style>{`
        .security-page-container {
          width: 100%;
          max-width: 100%;
          margin: 0;
          display: flex;
          flex-direction: column;
          gap: 12px;
          padding: 0 0 32px;
          box-sizing: border-box;
          font-family: inherit;
        }

        .sec-mobile-header {
          display: none;
        }

        .sec-card-box {
          background: #FFFFFF;
          border-radius: var(--radius-card, 8px);
          border: 1px solid #E2E8F0;
          padding: 16px 20px;
          box-shadow: 0 1px 3px rgba(15, 23, 42, 0.04);
          display: flex;
          flex-direction: column;
          gap: 10px;
          box-sizing: border-box;
          width: 100%;
        }

        .sec-card-header-row {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 8px;
        }

        .sec-card-title {
          margin: 0;
          font-size: 13.5px;
          font-weight: 700;
          color: #0F172A;
          letter-spacing: -0.1px;
        }

        .sec-card-subtitle {
          margin: 2px 0 0;
          font-size: 11px;
          color: #64748B;
          line-height: 15px;
          font-weight: 400;
        }

        .sec-card-icon-box {
          width: 28px;
          height: 28px;
          border-radius: 6px;
          background-color: #EFF6FF;
          border: 1px solid #DBEAFE;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #1B4FDF;
          flex-shrink: 0;
        }

        .sec-input-label {
          display: block;
          font-size: 10.5px;
          font-weight: 600;
          color: #475569;
          margin-bottom: 3px;
        }

        .sec-input-wrapper {
          position: relative;
          display: flex;
          align-items: center;
          width: 100%;
        }

        .sec-input-field {
          width: 100%;
          height: 36px;
          border-radius: 6px;
          background-color: #FAF9F6;
          border: 1px solid #ECEAE4;
          padding: 0 34px 0 10px;
          font-size: 11.5px;
          color: #0F172A;
          outline: none;
          box-sizing: border-box;
          font-family: inherit;
          transition: border-color 0.2s ease;
        }

        .sec-input-field:focus {
          border-color: #1B4FDF;
          background-color: #FFFFFF;
        }

        .sec-eye-btn {
          position: absolute;
          right: 8px;
          background: transparent;
          border: none;
          cursor: pointer;
          color: #64748B;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 4px;
        }

        .sec-primary-save-btn {
          width: 100%;
          height: 36px;
          border-radius: 6px;
          background-color: #1B4FDF;
          color: #FFFFFF;
          border: none;
          font-size: 11.5px;
          font-weight: 700;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: opacity 0.2s ease;
          margin-top: 2px;
        }

        .sec-primary-save-btn:hover {
          opacity: 0.92;
        }

        .sec-card-divider {
          height: 1px;
          background-color: #E2E8F0;
          margin: 4px 0;
        }

        .sec-outline-reset-btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 5px;
          background-color: #FAF9F6;
          border: 1px solid #CBD5E1;
          border-radius: 6px;
          padding: 6px 12px;
          font-size: 11px;
          font-weight: 700;
          color: #0F172A;
          cursor: pointer;
          margin-top: 4px;
          transition: all 0.2s ease;
        }

        .sec-outline-reset-btn:hover {
          background-color: #F1F5F9;
          border-color: #94A3B8;
        }

        .sec-session-pill {
          display: flex;
          align-items: center;
          justify-content: space-between;
          background-color: #FAF9F6;
          border: 1px solid #ECEAE4;
          border-radius: 6px;
          padding: 8px 10px;
          gap: 8px;
        }

        .sec-this-device-badge {
          background-color: #EFF6FF;
          border: 1px solid #BFDBFE;
          color: #1B4FDF;
          font-size: 9.5px;
          font-weight: 700;
          padding: 2px 6px;
          border-radius: 4px;
          flex-shrink: 0;
        }

        .sec-revoke-btn {
          background-color: #FEF2F2;
          border: 1px solid #FCA5A5;
          color: #DC2626;
          font-size: 10px;
          font-weight: 700;
          padding: 2px 8px;
          border-radius: 4px;
          cursor: pointer;
          flex-shrink: 0;
        }

        /* Mobile View (max-width: 768px) */
        @media (max-width: 768px) {
          .security-page-container {
            max-width: 100%;
            padding: 0 0 28px;
            gap: 8px;
            background-color: #F8FAFC;
          }

          .sec-mobile-header {
            position: sticky;
            top: 0;
            z-index: 50;
            background-color: #FFFFFF;
            border-bottom: 1px solid #E2E8F0;
            padding: 10px 14px;
            display: flex;
            align-items: center;
            justify-content: space-between;
            margin-bottom: 2px;
          }

          .sec-card-box {
            border-radius: var(--radius-card, 8px);
            padding: 12px 14px;
            gap: 8px;
          }
        }
      `}</style>

      {/* Mobile Top Header (Mobile View Only) */}
      <div className="sec-mobile-header">
        <button
          onClick={() => {
            if (window.history.length > 1) {
              navigate(-1);
            } else {
              navigate('/dashboard');
            }
          }}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '32px',
            height: '32px',
            backgroundColor: 'transparent',
            border: 'none',
            cursor: 'pointer',
            borderRadius: '6px',
            color: '#0F172A'
          }}
        >
          <ArrowLeft size={18} color="#0F172A" strokeWidth={2.4} />
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <ShieldCheck size={16} color="#1B4FDF" strokeWidth={2.2} />
          <span style={{ fontSize: '14px', fontWeight: 700, color: '#0F172A', letterSpacing: '-0.2px' }}>
            Security & Sessions
          </span>
        </div>

        <div style={{ width: '32px' }} />
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', padding: '0 12px' }}>

        {/* CARD 1: RESET PASSWORD */}
        <div className="sec-card-box">
          <div className="sec-card-header-row">
            <div>
              <h2 className="sec-card-title">Reset Password</h2>
              <p className="sec-card-subtitle">
                Update your account password for secure access.
              </p>
            </div>
            <div className="sec-card-icon-box">
              <KeyRound size={15} />
            </div>
          </div>

          <form onSubmit={handleDirectPasswordChange} style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginTop: '2px' }}>
            {/* Current Password */}
            <div>
              <label className="sec-input-label">Current Password</label>
              <div className="sec-input-wrapper">
                <input
                  type={showCurrentPass ? 'text' : 'password'}
                  className="sec-input-field"
                  placeholder="Enter current password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                />
                <button
                  type="button"
                  className="sec-eye-btn"
                  onClick={() => setShowCurrentPass(!showCurrentPass)}
                >
                  {showCurrentPass ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            {/* New Password */}
            <div>
              <label className="sec-input-label">New Password</label>
              <div className="sec-input-wrapper">
                <input
                  type={showNewPass ? 'text' : 'password'}
                  className="sec-input-field"
                  placeholder="Min 6 characters"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />
                <button
                  type="button"
                  className="sec-eye-btn"
                  onClick={() => setShowNewPass(!showNewPass)}
                >
                  {showNewPass ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            {/* Confirm New Password */}
            <div>
              <label className="sec-input-label">Confirm New Password</label>
              <div className="sec-input-wrapper">
                <input
                  type={showConfirmPass ? 'text' : 'password'}
                  className="sec-input-field"
                  placeholder="Re-enter new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
                <button
                  type="button"
                  className="sec-eye-btn"
                  onClick={() => setShowConfirmPass(!showConfirmPass)}
                >
                  {showConfirmPass ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="sec-primary-save-btn"
              disabled={isSubmittingChangePass}
            >
              {isSubmittingChangePass ? 'Updating...' : 'Update Password'}
            </button>
          </form>

          <div className="sec-card-divider" />

          {/* Trouble remembering current password? */}
          <div>
            <div style={{ fontSize: '11.5px', fontWeight: 700, color: '#0F172A' }}>
              Trouble remembering current password?
            </div>
            <p style={{ fontSize: '10.5px', color: '#64748B', lineHeight: '15px', margin: '2px 0 4px', fontWeight: 400 }}>
              Request a 6-digit OTP verification code sent directly to your email address.
            </p>

            <button
              type="button"
              className="sec-outline-reset-btn"
              onClick={handleSendResetOtp}
              disabled={isSendingOtp}
            >
              <Send size={12} color="#1B4FDF" />
              <span>{isSendingOtp ? 'Sending Code...' : 'Reset via Email OTP'}</span>
            </button>
          </div>

          {/* Inline OTP Input Section if open */}
          {isOtpOpen && (
            <form onSubmit={handleResetPasswordWithOtp} style={{ backgroundColor: '#FAF9F6', border: '1px solid #ECEAE4', borderRadius: '6px', padding: '10px', marginTop: '6px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <div style={{ fontSize: '11.5px', fontWeight: 700, color: '#0F172A' }}>
                Enter 6-Digit Email Code
              </div>

              <div>
                <label className="sec-input-label">Verification OTP</label>
                <input
                  type="text"
                  className="sec-input-field"
                  placeholder="Enter 6-digit code"
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value)}
                  maxLength={6}
                />
              </div>

              <div>
                <label className="sec-input-label">Set New Password</label>
                <div className="sec-input-wrapper">
                  <input
                    type={showOtpNewPass ? 'text' : 'password'}
                    className="sec-input-field"
                    placeholder="Min 6 characters"
                    value={otpNewPass}
                    onChange={(e) => setOtpNewPass(e.target.value)}
                  />
                  <button type="button" className="sec-eye-btn" onClick={() => setShowOtpNewPass(!showOtpNewPass)}>
                    {showOtpNewPass ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>

              <div>
                <label className="sec-input-label">Confirm New Password</label>
                <div className="sec-input-wrapper">
                  <input
                    type={showOtpConfirmPass ? 'text' : 'password'}
                    className="sec-input-field"
                    placeholder="Re-enter new password"
                    value={otpConfirmPass}
                    onChange={(e) => setOtpConfirmPass(e.target.value)}
                  />
                  <button type="button" className="sec-eye-btn" onClick={() => setShowOtpConfirmPass(!showOtpConfirmPass)}>
                    {showOtpConfirmPass ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '6px', marginTop: '2px' }}>
                <button type="submit" className="sec-primary-save-btn" style={{ flex: 1 }} disabled={isResettingPass}>
                  {isResettingPass ? 'Verifying...' : 'Confirm New Password'}
                </button>
                <button type="button" onClick={() => setIsOtpOpen(false)} style={{ padding: '0 10px', background: '#FFFFFF', border: '1px solid #CBD5E1', borderRadius: '6px', fontSize: '11px', fontWeight: 600, color: '#64748B', cursor: 'pointer' }}>
                  Cancel
                </button>
              </div>
            </form>
          )}
        </div>

        {/* CARD 2: TWO-FACTOR AUTHENTICATION */}
        <div className="sec-card-box">
          <div className="sec-card-header-row">
            <div>
              <h2 className="sec-card-title">Two-Factor Authentication (2FA)</h2>
              <p className="sec-card-subtitle">
                Add an extra layer of security requiring an OTP verification code on sign in.
              </p>
            </div>
            <div className="sec-card-icon-box">
              <ShieldCheck size={15} />
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#FAF9F6', border: '1px solid #ECEAE4', borderRadius: '6px', padding: '10px 12px', gap: '10px' }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '11.5px', fontWeight: 700, color: '#0F172A' }}>
                {twoFactorEnabled ? '2FA Protection Enabled' : '2FA Protection Disabled'}
              </div>
              <p style={{ fontSize: '10.5px', color: '#64748B', lineHeight: '15px', margin: '2px 0 0', fontWeight: 400 }}>
                {twoFactorEnabled
                  ? 'Verification codes are sent to your registered email upon login.'
                  : 'Enable this setting to secure your account against unauthorized access.'}
              </p>
            </div>

            {/* Toggle Switch */}
            <button
              type="button"
              onClick={handleToggle2FA}
              disabled={isToggling2FA}
              style={{
                width: '40px',
                height: '22px',
                borderRadius: '11px',
                backgroundColor: twoFactorEnabled ? '#1B4FDF' : '#CBD5E1',
                border: 'none',
                cursor: 'pointer',
                position: 'relative',
                transition: 'background-color 0.2s ease',
                flexShrink: 0,
                padding: '2px'
              }}
            >
              <div style={{
                width: '18px',
                height: '18px',
                borderRadius: '9px',
                backgroundColor: '#FFFFFF',
                position: 'absolute',
                top: '2px',
                left: twoFactorEnabled ? '20px' : '2px',
                transition: 'left 0.2s ease',
                boxShadow: '0 1px 3px rgba(0,0,0,0.15)'
              }} />
            </button>
          </div>
        </div>

        {/* CARD 3: ACTIVE DEVICE SESSIONS */}
        <div className="sec-card-box">
          <div className="sec-card-header-row">
            <div>
              <h2 className="sec-card-title">Active Device Sessions</h2>
              <p className="sec-card-subtitle">
                Review and manage devices logged into your account.
              </p>
            </div>
            <div className="sec-card-icon-box">
              <Smartphone size={15} />
            </div>
          </div>

          {sessionsLoading ? (
            <div style={{ textAlign: 'center', padding: '12px', fontSize: '11px', color: '#64748B' }}>
              Checking live device connections...
            </div>
          ) : sessions.length === 0 ? (
            <div className="sec-session-pill">
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <div style={{ width: '24px', height: '24px', borderRadius: '4px', backgroundColor: '#EFF6FF', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#1B4FDF' }}>
                  <Smartphone size={13} />
                </div>
                <div>
                  <div style={{ fontSize: '11.5px', fontWeight: 700, color: '#0F172A' }}>Current Device</div>
                  <div style={{ fontSize: '10px', color: '#64748B' }}>Active Session • Verified</div>
                </div>
              </div>
              <span className="sec-this-device-badge">Current</span>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
              {sessions.map((session, index) => {
                const IconComp = session.type === 'desktop' ? Laptop : Smartphone;
                return (
                  <div key={session.id || index} className="sec-session-pill">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', minWidth: 0, flex: 1 }}>
                      <div style={{ width: '24px', height: '24px', borderRadius: '4px', backgroundColor: session.isCurrent ? '#EFF6FF' : '#F1F5F9', display: 'flex', alignItems: 'center', justifyContent: 'center', color: session.isCurrent ? '#1B4FDF' : '#64748B', flexShrink: 0 }}>
                        <IconComp size={13} />
                      </div>
                      <div style={{ minWidth: 0, flex: 1 }}>
                        <div style={{ fontSize: '11.5px', fontWeight: 700, color: '#0F172A', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {session.device}
                        </div>
                        <div style={{ fontSize: '10px', color: '#64748B' }}>
                          {session.location} • {session.lastActive}
                        </div>
                      </div>
                    </div>

                    {session.isCurrent ? (
                      <span className="sec-this-device-badge">Current</span>
                    ) : (
                      <button
                        type="button"
                        className="sec-revoke-btn"
                        onClick={() => handleRevokeSession(session.id)}
                      >
                        Revoke
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {sessions.filter(s => !s.isCurrent).length > 0 && (
            <button
              type="button"
              onClick={handleTerminateOtherSessions}
              disabled={isTerminatingSessions}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '5px',
                backgroundColor: 'transparent',
                border: 'none',
                color: '#DC2626',
                fontSize: '11px',
                fontWeight: 700,
                cursor: 'pointer',
                padding: '6px 0 2px',
                marginTop: '2px'
              }}
            >
              <LogOut size={12} color="#DC2626" />
              <span>{isTerminatingSessions ? 'Terminating...' : 'Log Out from All Other Devices'}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
