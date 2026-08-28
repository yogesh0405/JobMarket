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
              browser: s.browser || (isMob ? 'Mobile App / Browser' : 'Web Browser'),
              location: s.location || 'Maharashtra, India',
              ip: s.ipAddress || s.ip_address || '198.51.100.24',
              lastActive: isCurrent ? 'Active Now' : (s.lastUsedAt ? `Last active ${new Date(s.lastUsedAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}` : 'Last active recently'),
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
          max-width: 480px;
          margin: 0 auto;
          display: flex;
          flex-direction: column;
          gap: 14px;
          padding: 12px 14px 40px;
          box-sizing: border-box;
        }

        .sec-header-bar {
          display: flex;
          align-items: center;
          gap: 12px;
          padding-bottom: 12px;
          border-bottom: 1px solid #F1F5F9;
        }

        .sec-circle-back {
          width: 32px;
          height: 32px;
          border-radius: 16px;
          border: 1px solid #E2E8F0;
          background: #FFFFFF;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          color: #0F172A;
          flex-shrink: 0;
          transition: all 0.2s ease;
        }

        .sec-circle-back:hover {
          background: #F8FAFC;
          border-color: #CBD5E1;
        }

        .sec-header-title {
          margin: 0;
          font-size: 17px;
          font-weight: 800;
          color: #0F172A;
          font-family: 'Georgia', serif;
          letter-spacing: -0.3px;
        }

        .sec-card-box {
          background: #FFFFFF;
          border-radius: 20px;
          border: 1px solid #E2E8F0;
          padding: 16px 18px;
          box-shadow: 0 4px 12px rgba(15, 23, 42, 0.03);
          display: flex;
          flex-direction: column;
          gap: 12px;
          box-sizing: border-box;
          width: 100%;
        }

        .sec-card-title {
          margin: 0;
          font-size: 15px;
          font-weight: 800;
          color: #0F172A;
          font-family: 'Georgia', serif;
          letter-spacing: -0.2px;
        }

        .sec-card-subtitle {
          margin: 2px 0 0;
          font-size: 11.5px;
          color: #64748B;
          line-height: 15px;
        }

        .sec-input-label {
          display: block;
          font-size: 11.5px;
          font-weight: 600;
          color: #334155;
          margin-bottom: 5px;
        }

        .sec-input-field {
          width: 100%;
          height: 42px;
          border-radius: 12px;
          background-color: #FAF9F6;
          border: 1px solid #ECEAE4;
          padding: 0 38px 0 12px;
          font-size: 12.5px;
          color: #0F172A;
          outline: none;
          box-sizing: border-box;
          font-family: inherit;
          transition: border-color 0.2s ease, box-shadow 0.2s ease;
        }

        .sec-input-field:focus {
          border-color: #1B4FDF;
          box-shadow: 0 0 0 3px rgba(27, 79, 223, 0.1);
        }

        .sec-primary-btn {
          width: 100%;
          height: 42px;
          border-radius: 21px;
          background-color: #1B4FDF;
          color: #FFFFFF;
          border: none;
          font-size: 13px;
          font-weight: 700;
          cursor: pointer;
          margin-top: 2px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          box-shadow: 0 2px 6px rgba(27, 79, 223, 0.2);
          transition: background-color 0.2s ease, transform 0.1s ease;
        }

        .sec-primary-btn:hover {
          background-color: #153BB0;
        }

        .sec-primary-btn:active {
          transform: scale(0.99);
        }

        .sec-outline-btn {
          width: 100%;
          height: 40px;
          border-radius: 20px;
          border: 1px solid #CBD5E1;
          background-color: #FFFFFF;
          color: #0F172A;
          font-size: 12.5px;
          font-weight: 600;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          transition: background-color 0.2s ease, border-color 0.2s ease;
        }

        .sec-outline-btn:hover {
          background-color: #F8FAFC;
          border-color: #94A3B8;
        }

        .sec-session-item {
          background-color: #FAF9F6;
          border: 1px solid #ECEAE4;
          border-radius: 14px;
          padding: 10px 12px;
          display: flex;
          align-items: center;
          gap: 10px;
          box-sizing: border-box;
        }

        .sec-device-badge {
          background-color: #E8F5E9;
          padding: 3px 8px;
          border-radius: 10px;
          font-size: 10px;
          font-weight: 700;
          color: #2E7D32;
          flex-shrink: 0;
        }

        @media (max-width: 640px) {
          .security-page-container {
            padding: 8px 10px 32px;
            gap: 12px;
          }
          .sec-card-box {
            padding: 14px 16px;
            border-radius: 18px;
          }
        }
      `}</style>
      
      {/* Header with Circle Back and Serif Title */}
      <div className="sec-header-bar">
        <button
          onClick={() => window.history.back()}
          className="sec-circle-back"
          aria-label="Go back"
        >
          <ArrowLeft size={16} />
        </button>
        <h1 className="sec-header-title">
          Security & Sessions
        </h1>
      </div>

      {/* CARD 1: RESET PASSWORD (EXACT MATCH REFERENCE) */}
      <div className="sec-card-box">
        {/* Header Row */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <h2 className="sec-card-title">
              Reset Password
            </h2>
            <p className="sec-card-subtitle">
              Update your credentials for secure ledger access.
            </p>
          </div>
          <KeyRound size={18} color="#64748B" style={{ flexShrink: 0, marginTop: '2px' }} />
        </div>

        {/* Inline Reset Password Form */}
        <form onSubmit={handleDirectPasswordChange} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <div>
            <label className="sec-input-label">
              Current Password
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type={showCurrentPass ? 'text' : 'password'}
                placeholder="Enter current password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="sec-input-field"
              />
              <button
                type="button"
                onClick={() => setShowCurrentPass(!showCurrentPass)}
                style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#64748B', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
              >
                {showCurrentPass ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <div>
            <label className="sec-input-label">
              New Password
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type={showNewPass ? 'text' : 'password'}
                placeholder="Min 6 characters"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="sec-input-field"
              />
              <button
                type="button"
                onClick={() => setShowNewPass(!showNewPass)}
                style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#64748B', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
              >
                {showNewPass ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <div>
            <label className="sec-input-label">
              Confirm New Password
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type={showConfirmPass ? 'text' : 'password'}
                placeholder="Re-enter new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="sec-input-field"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPass(!showConfirmPass)}
                style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#64748B', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
              >
                {showConfirmPass ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmittingChangePass}
            className="sec-primary-btn"
          >
            {isSubmittingChangePass ? 'Saving...' : 'Save New Password'}
          </button>
        </form>

        {/* Soft Divider */}
        <div style={{ height: '1px', backgroundColor: '#F1F5F9', margin: '4px 0' }} />

        {/* Forgot Password Sub-section */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
          <div style={{ fontSize: '12.5px', fontWeight: '700', color: '#0F172A' }}>
            Forgot your password?
          </div>
          <div style={{ fontSize: '11px', color: '#64748B', lineHeight: '15px', marginBottom: '6px' }}>
            We'll email a secure one-time reset code to your registered email.
          </div>

          <button
            type="button"
            onClick={handleSendResetOtp}
            disabled={isSendingOtp}
            className="sec-outline-btn"
          >
            <Send size={14} />
            <span>{isSendingOtp ? 'Sending code...' : 'Forgot password'}</span>
          </button>
        </div>

        {/* Inline OTP Reset Expandable Section */}
        {isOtpOpen && (
          <form onSubmit={handleResetPasswordWithOtp} style={{
            marginTop: '6px',
            padding: '12px 14px',
            backgroundColor: '#F8FAFC',
            borderRadius: '14px',
            border: '1px solid #E2E8F0',
            display: 'flex',
            flexDirection: 'column',
            gap: '10px'
          }}>
            <div style={{ fontSize: '12px', fontWeight: '700', color: '#1E293B' }}>
              Enter 6-Digit OTP & New Password
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: '600', color: '#475569', marginBottom: '4px' }}>
                6-Digit Verification Code
              </label>
              <input
                type="text"
                placeholder="Enter 6-digit code"
                maxLength={6}
                value={otpCode}
                onChange={(e) => setOtpCode(e.target.value)}
                style={{
                  width: '100%',
                  height: '38px',
                  borderRadius: '10px',
                  backgroundColor: '#FFFFFF',
                  border: '1px solid #CBD5E1',
                  padding: '0 10px',
                  fontSize: '12.5px',
                  color: '#0F172A',
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: '600', color: '#475569', marginBottom: '4px' }}>
                New Password
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showOtpNewPass ? 'text' : 'password'}
                  placeholder="Min 6 characters"
                  value={otpNewPass}
                  onChange={(e) => setOtpNewPass(e.target.value)}
                  style={{
                    width: '100%',
                    height: '38px',
                    borderRadius: '10px',
                    backgroundColor: '#FFFFFF',
                    border: '1px solid #CBD5E1',
                    padding: '0 36px 0 10px',
                    fontSize: '12.5px',
                    color: '#0F172A',
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowOtpNewPass(!showOtpNewPass)}
                  style={{ position: 'absolute', right: '8px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#64748B', cursor: 'pointer' }}
                >
                  {showOtpNewPass ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: '600', color: '#475569', marginBottom: '4px' }}>
                Confirm New Password
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showOtpConfirmPass ? 'text' : 'password'}
                  placeholder="Re-enter new password"
                  value={otpConfirmPass}
                  onChange={(e) => setOtpConfirmPass(e.target.value)}
                  style={{
                    width: '100%',
                    height: '38px',
                    borderRadius: '10px',
                    backgroundColor: '#FFFFFF',
                    border: '1px solid #CBD5E1',
                    padding: '0 36px 0 10px',
                    fontSize: '12.5px',
                    color: '#0F172A',
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowOtpConfirmPass(!showOtpConfirmPass)}
                  style={{ position: 'absolute', right: '8px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#64748B', cursor: 'pointer' }}
                >
                  {showOtpConfirmPass ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '8px', marginTop: '2px' }}>
              <button
                type="submit"
                disabled={isResettingPass}
                style={{
                  flex: 1,
                  height: '38px',
                  borderRadius: '19px',
                  backgroundColor: '#1B4FDF',
                  color: '#FFFFFF',
                  border: 'none',
                  fontSize: '12.5px',
                  fontWeight: '700',
                  cursor: isResettingPass ? 'not-allowed' : 'pointer'
                }}
              >
                {isResettingPass ? 'Resetting...' : 'Reset Password'}
              </button>
              <button
                type="button"
                onClick={() => setIsOtpOpen(false)}
                style={{
                  padding: '0 14px',
                  height: '38px',
                  borderRadius: '19px',
                  backgroundColor: '#FFFFFF',
                  color: '#475569',
                  border: '1px solid #CBD5E1',
                  fontSize: '12px',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>
            </div>
          </form>
        )}
      </div>

      {/* CARD 2: ACTIVE SESSIONS (EXACT MATCH REFERENCE) */}
      <div className="sec-card-box">
        {/* Header Row */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <h2 className="sec-card-title">
              Active Sessions
            </h2>
            <p className="sec-card-subtitle">
              Devices currently signed in to your account.
            </p>
          </div>
          <Laptop size={18} color="#64748B" style={{ flexShrink: 0, marginTop: '2px' }} />
        </div>

        {/* Sessions List */}
        {sessionsLoading ? (
          <div style={{ padding: '16px', textAlign: 'center', color: '#64748B', fontSize: '11.5px' }}>
            Checking active devices...
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {sessions.map((sess) => {
              const DeviceIcon = sess.type === 'mobile' ? Smartphone : Laptop;
              return (
                <div key={sess.id} className="sec-session-item">
                  <div style={{ width: '28px', height: '28px', borderRadius: '7px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#475569', flexShrink: 0 }}>
                    <DeviceIcon size={18} strokeWidth={1.8} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: '12.5px', fontWeight: '700', color: '#0F172A', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {sess.isCurrent ? `Current Device (${sess.device})` : sess.device}
                    </div>
                    <div style={{ fontSize: '10.5px', color: '#64748B', marginTop: '1px' }}>
                      {sess.isCurrent ? `Active Now · IP: ${sess.ip}` : `${sess.lastActive}`}
                    </div>
                  </div>

                  {sess.isCurrent ? (
                    <div className="sec-device-badge">
                      This Device
                    </div>
                  ) : (
                    <button
                      onClick={() => handleRevokeSession(sess.id)}
                      title="Revoke session"
                      style={{
                        background: 'none',
                        border: 'none',
                        color: '#94A3B8',
                        cursor: 'pointer',
                        padding: '4px',
                        display: 'flex',
                        alignItems: 'center'
                      }}
                    >
                      <LogOut size={16} />
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Log Out Other Devices Action */}
        <button
          onClick={handleTerminateOtherSessions}
          disabled={isTerminatingSessions}
          style={{
            background: 'none',
            border: 'none',
            color: '#EF4444',
            fontSize: '12px',
            fontWeight: '600',
            cursor: isTerminatingSessions ? 'not-allowed' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '5px',
            paddingTop: '4px',
            paddingBottom: '2px'
          }}
        >
          <LogOut size={14} strokeWidth={2} />
          <span>{isTerminatingSessions ? 'Logging out other devices...' : 'Log out of all other devices'}</span>
        </button>
      </div>

      {/* CARD 3: TWO-FACTOR AUTHENTICATION */}
      <div className="sec-card-box" style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h2 className="sec-card-title" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <ShieldCheck size={18} color="#1B4FDF" />
            <span>Two-Factor Authentication</span>
          </h2>
          <p className="sec-card-subtitle" style={{ marginTop: '3px' }}>
            {twoFactorEnabled
              ? 'Active: Verification code sent to email on new device login.'
              : 'Require an email verification code on new device login attempts.'}
          </p>
        </div>

        <input
          type="checkbox"
          checked={twoFactorEnabled}
          onChange={handleToggle2FA}
          disabled={isToggling2FA}
          style={{
            width: '20px',
            height: '20px',
            accentColor: '#1B4FDF',
            cursor: isToggling2FA ? 'not-allowed' : 'pointer',
            flexShrink: 0
          }}
        />
      </div>

    </div>
  );
};
