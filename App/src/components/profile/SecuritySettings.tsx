import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../hooks/useToast';
import { apiFetch } from '../../utils/api';
import { 
  Shield, 
  Key, 
  Lock, 
  Smartphone, 
  Laptop, 
  LogOut, 
  CheckCircle2, 
  Send, 
  ShieldAlert,
  Eye,
  EyeOff,
  RefreshCw,
  Clock,
  MapPin,
  History,
  Check
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
  
  // Tab state for Password section: 'none' | 'change' | 'otp_reset'
  const [passwordMode, setPasswordMode] = useState<'none' | 'change' | 'otp_reset'>('none');

  // Direct Password Change state
  const [currentPassword, setCurrentPassword] = useState('');
  const [changeNewPassword, setChangeNewPassword] = useState('');
  const [changeConfirmPassword, setChangeConfirmPassword] = useState('');
  const [showCurrentPass, setShowCurrentPass] = useState(false);
  const [showChangeNewPass, setShowChangeNewPass] = useState(false);
  const [showChangeConfirmPass, setShowChangeConfirmPass] = useState(false);
  const [isSubmittingChangePass, setIsSubmittingChangePass] = useState(false);

  // OTP Reset Password state
  const [otpStep, setOtpStep] = useState<'request' | 'verify'>('request');
  const [otpCode, setOtpCode] = useState('');
  const [resetNewPassword, setResetNewPassword] = useState('');
  const [resetConfirmPassword, setResetConfirmPassword] = useState('');
  const [showResetNewPass, setShowResetNewPass] = useState(false);
  const [showResetConfirmPass, setShowResetConfirmPass] = useState(false);
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [isResettingPass, setIsResettingPass] = useState(false);
  
  // Resend Timer state (60 seconds)
  const [resendTimer, setResendTimer] = useState(0);

  // Active Sessions state
  const clientInfo = getClientPlatformInfo();
  const [sessions, setSessions] = useState<SessionItem[]>([
    {
      id: localStorage.getItem('sessionId') || 'session-current',
      device: clientInfo.deviceName,
      browser: clientInfo.browser,
      location: 'Maharashtra, India',
      ip: '127.0.0.1 (Current IP)',
      lastActive: 'Active now',
      isCurrent: true,
      type: clientInfo.type
    }
  ]);
  const [isTerminatingSessions, setIsTerminatingSessions] = useState(false);
  const [revokingSessionId, setRevokingSessionId] = useState<string | null>(null);

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

  // Fetch real active sessions from backend
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
              ip: s.ipAddress || s.ip_address || '127.0.0.1',
              lastActive: isCurrent ? 'Active now' : (s.lastUsedAt ? new Date(s.lastUsedAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) : 'Recently active'),
              isCurrent,
              type: isMob ? ('mobile' as const) : ('desktop' as const)
            };
          });

          // Ensure current session is always at top
          mapped.sort((a, b) => (b.isCurrent ? 1 : 0) - (a.isCurrent ? 1 : 0));
          setSessions(mapped);
        }
      })
      .catch(() => null);

    return () => { isMounted = false; };
  }, []);

  // Resend countdown timer effect
  useEffect(() => {
    if (resendTimer <= 0) return;
    const interval = setInterval(() => {
      setResendTimer(prev => prev - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [resendTimer]);

  // 1. Direct Password Change Handler
  const handleDirectPasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword || !changeNewPassword || !changeConfirmPassword) {
      showToast('Please fill in all password fields.', 'error');
      return;
    }
    if (changeNewPassword !== changeConfirmPassword) {
      showToast('New passwords do not match.', 'error');
      return;
    }
    if (changeNewPassword.length < 6) {
      showToast('New password must be at least 6 characters.', 'error');
      return;
    }

    setIsSubmittingChangePass(true);
    try {
      const res = await apiFetch('/api/v1/auth/change-password', {
        method: 'POST',
        body: JSON.stringify({ currentPassword, newPassword: changeNewPassword })
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || json.message || 'Failed to update password');

      showToast('Password changed successfully!', 'success');
      setCurrentPassword('');
      setChangeNewPassword('');
      setChangeConfirmPassword('');
      setPasswordMode('none');
    } catch (err: any) {
      showToast(err.message || 'Failed to update password. Please check current password.', 'error');
    } finally {
      setIsSubmittingChangePass(false);
    }
  };

  // 2. Send Reset OTP Handler
  const handleSendResetOtp = async (isResend = false) => {
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

      showToast(isResend ? 'OTP resent successfully to registered email' : 'OTP sent to registered email', 'success');
      setOtpStep('verify');
      setResendTimer(60); // 60 seconds countdown
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
    if (!resetNewPassword || !resetConfirmPassword) {
      showToast('Please enter and confirm your new password.', 'error');
      return;
    }
    if (resetNewPassword !== resetConfirmPassword) {
      showToast('New passwords do not match.', 'error');
      return;
    }
    if (resetNewPassword.length < 6) {
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
          newPassword: resetNewPassword
        })
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || json.message || 'Failed to reset password');

      showToast('Password reset successfully! You can now use your new password.', 'success');
      setOtpCode('');
      setResetNewPassword('');
      setResetConfirmPassword('');
      setOtpStep('request');
      setPasswordMode('none');
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

    setRevokingSessionId(sessionId);
    try {
      const res = await apiFetch(`/api/v1/auth/sessions/${sessionId}`, {
        method: 'DELETE'
      });
      const json = await res.json().catch(() => null);
      if (!res.ok && json) throw new Error(json.error || json.message || 'Failed to revoke session');

      if (isCurrentSession) {
        showToast('Current device session revoked. Logging out...', 'info');
        setTimeout(() => {
          logout();
        }, 300);
      } else {
        setSessions(prev => prev.filter(s => s.id !== sessionId));
        showToast('Device session revoked successfully', 'success');
      }
    } catch (err: any) {
      showToast(err.message || 'Failed to revoke session', 'error');
    } finally {
      setRevokingSessionId(null);
    }
  };



  return (
    <div className="security-settings-wrapper" style={{ display: 'flex', flexDirection: 'column', gap: '20px', maxWidth: '100%', overflowX: 'hidden' }}>
      
      {/* Industry-Grade Ultra-Responsive Style Overrides */}
      <style>{`
        .sec-card {
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          padding: 20px;
          box-shadow: 0 1px 3px rgba(15, 23, 42, 0.04), 0 4px 12px rgba(15, 23, 42, 0.02);
          box-sizing: border-box;
          width: 100%;
        }

        .sec-session-card {
          border-radius: 12px;
          padding: 16px;
          display: flex;
          flex-direction: column;
          gap: 12px;
          box-sizing: border-box;
          width: 100%;
          transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .sec-session-card.is-current {
          background: linear-gradient(180deg, #ffffff 0%, #f8fafc 100%);
          border: 1.5px solid #344BFD;
          box-shadow: 0 4px 14px rgba(52, 75, 253, 0.08);
        }

        .sec-session-card.is-other {
          background: #ffffff;
          border: 1px solid #e2e8f0;
          box-shadow: 0 1px 3px rgba(15, 23, 42, 0.03);
        }

        .sec-session-header {
          display: flex;
          align-items: flex-start;
          gap: 12px;
          width: 100%;
        }

        .sec-device-icon {
          width: 44px;
          height: 44px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .sec-meta-pills {
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          gap: 8px;
          margin-top: 8px;
        }

        .sec-pill {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          background: #f1f5f9;
          border: 1px solid #e2e8f0;
          color: #334155;
          font-size: 12px;
          font-weight: 500;
          padding: 4px 10px;
          border-radius: 6px;
          line-height: 1.3;
        }

        .sec-badge-current {
          background: #344BFD;
          color: #ffffff;
          font-size: 10.5px;
          font-weight: 700;
          padding: 3px 9px;
          border-radius: 12px;
          letter-spacing: 0.4px;
          display: inline-flex;
          align-items: center;
          gap: 4px;
          white-space: nowrap;
          box-shadow: 0 2px 6px rgba(52, 75, 253, 0.25);
        }

        .sec-btn-revoke {
          width: 100%;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          background: #fef2f2;
          color: #dc2626;
          border: 1px solid #fca5a5;
          padding: 10px 16px;
          border-radius: 8px;
          font-weight: 600;
          font-size: 13px;
          cursor: pointer;
          transition: all 0.15s ease;
        }
        @media (min-width: 640px) {
          .sec-btn-revoke {
            width: auto;
          }
          .sec-session-card-inner {
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 16px;
          }
        }
        .sec-btn-revoke:hover {
          background: #fee2e2;
        }

        .sec-btn-forget {
          width: 100%;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          background: #eff6ff;
          color: #2563eb;
          border: 1.5px solid #bfdbfe;
          padding: 12px 18px;
          border-radius: 8px;
          font-weight: 700;
          font-size: 13.5px;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        .sec-btn-forget:hover {
          background: #dbeafe;
          color: #1d4ed8;
        }

        .sec-input {
          width: 100%;
          padding: 11px 13px;
          border-radius: 8px;
          border: 1.5px solid #cbd5e1;
          font-size: 13.5px;
          outline: none;
          box-sizing: border-box;
          transition: border-color 0.2s;
        }
        .sec-input:focus {
          border-color: #344BFD;
        }
      `}</style>

      {/* PAGE TITLE BAR */}
      <div className="sec-card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '42px',
            height: '42px',
            borderRadius: '10px',
            background: '#eff6ff',
            border: '1px solid #bfdbfe',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#344BFD',
            flexShrink: 0
          }}>
            <Shield size={22} />
          </div>
          <div>
            <h2 style={{ margin: 0, fontSize: '17px', fontWeight: '800', color: '#0f172a' }}>Security & Session Management</h2>
            <p style={{ margin: '2px 0 0', color: '#64748b', fontSize: '12.5px' }}>Device sessions, password authentication & activity governance</p>
          </div>
        </div>
      </div>



      {/* SECTION 2A: CHANGE PASSWORD SECTION (WITH CURRENT PASSWORD) */}
      <div className="sec-card" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div>
          <h3 style={{ margin: 0, fontSize: '15.5px', fontWeight: '800', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Key size={18} style={{ color: '#344BFD' }} />
            <span>Change Password</span>
          </h3>
          <p style={{ margin: '2px 0 0', fontSize: '12px', color: '#64748b' }}>
            Update your account password using your current password.
          </p>
        </div>

        <form onSubmit={handleDirectPasswordChange} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#475569', marginBottom: '4px' }}>
              Current Password
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type={showCurrentPass ? 'text' : 'password'}
                className="sec-input"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Enter current password"
                style={{ paddingRight: '40px' }}
              />
              <button
                type="button"
                onClick={() => setShowCurrentPass(!showCurrentPass)}
                style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}
              >
                {showCurrentPass ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#475569', marginBottom: '4px' }}>
              New Password
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type={showChangeNewPass ? 'text' : 'password'}
                className="sec-input"
                value={changeNewPassword}
                onChange={(e) => setChangeNewPassword(e.target.value)}
                placeholder="Enter new password (min. 6 chars)"
                style={{ paddingRight: '40px' }}
              />
              <button
                type="button"
                onClick={() => setShowChangeNewPass(!showChangeNewPass)}
                style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}
              >
                {showChangeNewPass ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#475569', marginBottom: '4px' }}>
              Confirm New Password
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type={showChangeConfirmPass ? 'text' : 'password'}
                className="sec-input"
                value={changeConfirmPassword}
                onChange={(e) => setChangeConfirmPassword(e.target.value)}
                placeholder="Re-enter new password"
                style={{ paddingRight: '40px' }}
              />
              <button
                type="button"
                onClick={() => setShowChangeConfirmPass(!showChangeConfirmPass)}
                style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}
              >
                {showChangeConfirmPass ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={isSubmittingChangePass}
              style={{
                padding: '11px 18px',
                borderRadius: '8px',
                border: 'none',
                background: '#344BFD',
                color: '#ffffff',
                fontWeight: '700',
                fontSize: '13px',
                cursor: isSubmittingChangePass ? 'not-allowed' : 'pointer',
                width: '100%',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px'
              }}
            >
              <Lock size={15} />
              <span>{isSubmittingChangePass ? 'Updating...' : 'Update Password'}</span>
            </button>
          </div>
        </form>
      </div>

      {/* SECTION 2B: FORGOT PASSWORD SECTION (OTP RESET WORKFLOW) */}
      <div className="sec-card" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div>
          <h3 style={{ margin: 0, fontSize: '15.5px', fontWeight: '800', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Send size={18} style={{ color: '#2563eb' }} />
            <span>Forget Password</span>
          </h3>
          <p style={{ margin: '2px 0 0', fontSize: '12px', color: '#64748b' }}>
            Send an OTP code to your registered email to reset your password.
          </p>
        </div>

        {/* Main User Requested Button Name: Forget pasword ? Reset.. */}
        <button
          type="button"
          className="sec-btn-forget"
          onClick={() => setPasswordMode(passwordMode === 'otp_reset' ? 'none' : 'otp_reset')}
        >
          <Send size={16} />
          <span>Forget pasword ? Reset..</span>
        </button>

        {/* FORGET PASSWORD RESET WORKFLOW */}
        {passwordMode === 'otp_reset' && (
          <div style={{
            background: '#f8fafc',
            border: '1.5px solid #bfdbfe',
            borderRadius: '10px',
            padding: '16px',
            display: 'flex',
            flexDirection: 'column',
            gap: '14px',
            marginTop: '4px'
          }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ fontSize: '14px', fontWeight: '800', color: '#1e40af', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <ShieldAlert size={18} style={{ flexShrink: 0 }} />
                <span>OTP Password Reset Workflow</span>
              </div>
              <div style={{ fontSize: '12px', color: '#475569', background: '#ffffff', padding: '6px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', wordBreak: 'break-all' }}>
                Registered Email: <strong style={{ color: '#0f172a' }}>{currentUser?.email || 'N/A'}</strong>
              </div>
            </div>

            {/* STEP 1: REQUEST OTP */}
            {otpStep === 'request' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <p style={{ margin: 0, fontSize: '12.5px', color: '#475569' }}>
                  Click below to send a 6-digit OTP verification code to <strong>{currentUser?.email}</strong>.
                </p>
                <button
                  type="button"
                  onClick={() => handleSendResetOtp(false)}
                  disabled={isSendingOtp}
                  style={{
                    padding: '11px 18px',
                    borderRadius: '8px',
                    border: 'none',
                    background: '#344BFD',
                    color: '#ffffff',
                    fontWeight: '700',
                    fontSize: '13px',
                    cursor: isSendingOtp ? 'not-allowed' : 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    width: '100%'
                  }}
                >
                  <Send size={15} />
                  <span>{isSendingOtp ? 'Sending OTP Code...' : 'Send OTP to Registered Email'}</span>
                </button>
              </div>
            )}

            {/* STEP 2: VERIFY OTP & SET NEW PASSWORD */}
            {otpStep === 'verify' && (
              <form onSubmit={handleResetPasswordWithOtp} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', padding: '8px 12px', borderRadius: '6px', color: '#166534', fontSize: '12px', fontWeight: '600' }}>
                  ✓ OTP code sent to {currentUser?.email}. Please check your inbox.
                </div>

                {/* OTP Code Input */}
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#334155', marginBottom: '4px' }}>
                    Enter 6-Digit OTP Code
                  </label>
                  <input
                    type="text"
                    className="sec-input"
                    placeholder="e.g. 582910"
                    maxLength={6}
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                  />
                </div>

                {/* Reset New Password */}
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#334155', marginBottom: '4px' }}>
                    New Password
                  </label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type={showResetNewPass ? 'text' : 'password'}
                      className="sec-input"
                      placeholder="Enter new password (min. 6 chars)"
                      value={resetNewPassword}
                      onChange={(e) => setResetNewPassword(e.target.value)}
                      style={{ paddingRight: '40px' }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowResetNewPass(!showResetNewPass)}
                      style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}
                    >
                      {showResetNewPass ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                {/* Reset Confirm Password */}
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#334155', marginBottom: '4px' }}>
                    Confirm New Password
                  </label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type={showResetConfirmPass ? 'text' : 'password'}
                      className="sec-input"
                      placeholder="Re-enter new password"
                      value={resetConfirmPassword}
                      onChange={(e) => setResetConfirmPassword(e.target.value)}
                      style={{ paddingRight: '40px' }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowResetConfirmPass(!showResetConfirmPass)}
                      style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}
                    >
                      {showResetConfirmPass ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                {/* Action Row: Reset Button & Resend Option */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '4px' }}>
                  <button
                    type="submit"
                    disabled={isResettingPass}
                    style={{
                      padding: '11px 18px',
                      borderRadius: '8px',
                      border: 'none',
                      background: '#344BFD',
                      color: '#ffffff',
                      fontWeight: '700',
                      fontSize: '13.5px',
                      cursor: isResettingPass ? 'not-allowed' : 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      width: '100%'
                    }}
                  >
                    <Lock size={15} />
                    <span>{isResettingPass ? 'Resetting Password...' : 'Reset Password'}</span>
                  </button>

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
                    <button
                      type="button"
                      onClick={() => handleSendResetOtp(true)}
                      disabled={resendTimer > 0 || isSendingOtp}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: resendTimer > 0 ? '#94a3b8' : '#2563eb',
                        fontSize: '12.5px',
                        fontWeight: '700',
                        cursor: resendTimer > 0 || isSendingOtp ? 'not-allowed' : 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}
                    >
                      <RefreshCw size={13} className={isSendingOtp ? 'animate-spin' : ''} />
                      <span>
                        {resendTimer > 0 
                          ? `Resend OTP in ${resendTimer}s` 
                          : isSendingOtp 
                            ? 'Sending OTP...' 
                            : 'Resend OTP Code'}
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={() => { setOtpStep('request'); setPasswordMode('none'); }}
                      style={{ background: 'none', border: 'none', color: '#64748b', fontSize: '12px', cursor: 'pointer' }}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </form>
            )}
          </div>
        )}
      </div>

      {/* SECTION 3: LAST SECTION — LOGIN SESSIONS HISTORY & SECURITY LOG */}
      <div className="sec-card" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
          <div>
            <h3 style={{ margin: 0, fontSize: '15.5px', fontWeight: '800', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <History size={18} style={{ color: '#344BFD' }} />
              <span>Login Sessions History & Security Log</span>
            </h3>
            <p style={{ margin: '2px 0 0', fontSize: '12px', color: '#64748b' }}>
              Audit log of active & past logins across browsers and mobile platforms.
            </p>
          </div>

          {sessions.length > 1 && (
            <button
              onClick={handleTerminateOtherSessions}
              disabled={isTerminatingSessions}
              style={{
                background: '#fef2f2',
                color: '#dc2626',
                border: '1px solid #fca5a5',
                padding: '8px 14px',
                borderRadius: '8px',
                fontWeight: '700',
                fontSize: '12px',
                cursor: isTerminatingSessions ? 'not-allowed' : 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <LogOut size={14} />
              <span>{isTerminatingSessions ? 'Terminating...' : 'Logout All Other Devices'}</span>
            </button>
          )}
        </div>

        {/* Responsive Activity Log List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {sessions.map((sess, idx) => (
            <div
              key={sess.id || idx}
              style={{
                background: '#FFFFFF',
                border: sess.isCurrent ? '1.5px solid #2563EB' : '1px solid #E2E8F0',
                borderRadius: '8px',
                padding: '14px 16px',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
                boxShadow: '0 1px 3px rgba(15, 23, 42, 0.03)',
                boxSizing: 'border-box',
                width: '100%'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '6px',
                    background: sess.isCurrent ? '#EFF6FF' : '#F8FAFC',
                    color: sess.isCurrent ? '#2563EB' : '#64748B',
                    border: '1px solid #E2E8F0',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                  }}>
                    {sess.type === 'mobile' ? <Smartphone size={18} /> : <Laptop size={18} />}
                  </div>
                  <div>
                    <h4 style={{ margin: 0, fontSize: '14px', fontWeight: '700', color: '#0F172A' }}>{sess.device}</h4>
                    <div style={{ fontSize: '12px', color: '#64748B', marginTop: '1px' }}>{sess.browser}</div>
                  </div>
                </div>

                {!sess.isCurrent && (
                  <button
                    onClick={() => handleRevokeSession(sess.id)}
                    disabled={revokingSessionId === sess.id}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#DC2626',
                      fontSize: '12.5px',
                      fontWeight: '600',
                      cursor: revokingSessionId === sess.id ? 'not-allowed' : 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                      padding: 0
                    }}
                  >
                    <LogOut size={13} />
                    <span>{revokingSessionId === sess.id ? 'Logging out...' : 'Logout'}</span>
                  </button>
                )}
              </div>

              {/* Clean Typography Metadata Line (No Chips / No Containers) */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', fontSize: '12px', color: '#64748B', marginTop: '2px', flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <MapPin size={13} style={{ color: '#64748B' }} />
                  <span>{sess.location}</span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '5px', color: sess.isCurrent ? '#16A34A' : '#64748B', fontWeight: sess.isCurrent ? '700' : '500' }}>
                  <Clock size={13} style={{ color: sess.isCurrent ? '#16A34A' : '#64748B' }} />
                  <span>{sess.isCurrent ? '● Active now' : `Last active: ${sess.lastActive}`}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* 2FA Toggle Banner */}
        <div style={{
          background: '#f8fafc',
          border: '1px solid #e2e8f0',
          borderRadius: '10px',
          padding: '14px 16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '12px',
          marginTop: '4px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <ShieldAlert size={20} style={{ color: twoFactorEnabled ? '#16a34a' : '#344BFD', flexShrink: 0 }} />
            <div>
              <div style={{ fontSize: '13px', fontWeight: '800', color: '#0f172a' }}>Two-Factor Authentication (2FA)</div>
              <div style={{ fontSize: '11.5px', color: '#64748b' }}>Require OTP code verification during account login</div>
            </div>
          </div>

          <button
            type="button"
            onClick={handleToggle2FA}
            disabled={isToggling2FA}
            style={{
              padding: '8px 14px',
              borderRadius: '8px',
              border: twoFactorEnabled ? '1.5px solid #bbf7d0' : '1.5px solid #cbd5e1',
              background: twoFactorEnabled ? '#f0fdf4' : '#ffffff',
              color: twoFactorEnabled ? '#16a34a' : '#0f172a',
              fontWeight: '700',
              fontSize: '12px',
              cursor: isToggling2FA ? 'not-allowed' : 'pointer'
            }}
          >
            {isToggling2FA ? 'Updating...' : twoFactorEnabled ? '2FA Enabled ✓' : 'Enable 2FA'}
          </button>
        </div>
      </div>

    </div>
  );
};
