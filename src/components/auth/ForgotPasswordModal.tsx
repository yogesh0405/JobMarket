import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { apiFetch } from '../../utils/api';
import { useToast } from '../../hooks/useToast';

interface ForgotPasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const ForgotPasswordModal: React.FC<ForgotPasswordModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const { showToast } = useToast();

  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [email, setEmail] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [loading, setLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);

  // Reset modal state on open
  useEffect(() => {
    if (isOpen) {
      setStep(1);
      setEmail('');
      setOtpCode('');
      setNewPassword('');
      setConfirmPassword('');
      setLoading(false);
    }
  }, [isOpen]);

  // Resend OTP countdown
  useEffect(() => {
    let interval: any;
    if (resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer(prev => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [resendTimer]);

  if (!isOpen) return null;

  // Step 1: Request OTP
  const handleRequestOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !/\S+@\S+\.\S+/.test(email)) {
      showToast('Please enter a valid email address', 'error');
      return;
    }

    try {
      setLoading(true);
      const res = await apiFetch('/api/v1/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      const json = await res.json();

      if (res.ok) {
        showToast('OTP sent to your email!', 'success');
        setStep(2);
        setResendTimer(60);
      } else {
        showToast(json.error || 'Failed to send OTP', 'error');
      }
    } catch (err) {
      showToast('Error requesting password reset', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Verify OTP
  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otpCode || otpCode.length !== 6) {
      showToast('Please enter a valid 6-digit OTP code', 'error');
      return;
    }

    try {
      setLoading(true);
      const res = await apiFetch('/api/v1/auth/verify-reset-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otpCode })
      });
      const json = await res.json();

      if (res.ok) {
        showToast('OTP verified! Now enter your new password.', 'success');
        setStep(3);
      } else {
        showToast(json.error || 'Invalid OTP code', 'error');
      }
    } catch (err) {
      showToast('Error verifying OTP code', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Step 3: Reset Password
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword || !confirmPassword) {
      showToast('Please fill in both password fields', 'error');
      return;
    }

    if (newPassword !== confirmPassword) {
      showToast('Passwords do not match', 'error');
      return;
    }

    if (newPassword.length < 6) {
      showToast('Password must be at least 6 characters long', 'error');
      return;
    }

    try {
      setLoading(true);
      const res = await apiFetch('/api/v1/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otpCode, newPassword })
      });
      const json = await res.json();

      if (res.ok) {
        showToast('Password reset successfully!', 'success');
        setStep(4);
        if (onSuccess) onSuccess();
      } else {
        showToast(json.error || 'Failed to reset password', 'error');
      }
    } catch (err) {
      showToast('Error resetting password', 'error');
    } finally {
      setLoading(false);
    }
  };

  return ReactDOM.createPortal(
    <div style={{ position: 'fixed', inset: 0, zIndex: 999999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(15, 23, 42, 0.5)',
          backdropFilter: 'blur(6px)',
          WebkitBackdropFilter: 'blur(6px)'
        }}
      />

      {/* Modal Box */}
      <div
        style={{
          position: 'relative',
          width: '420px',
          maxWidth: '92vw',
          background: '#ffffff',
          borderRadius: '20px',
          padding: '28px',
          boxShadow: '0 20px 50px rgba(15, 23, 42, 0.25)',
          zIndex: 1000000,
          animation: 'fadeInUp 0.25s ease forwards'
        }}
      >
        {/* Header Bar */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
          <h2 style={{ margin: 0, fontSize: '20px', fontWeight: '800', color: '#0f172a' }}>
            {step === 1 && '🔑 Forgot Password'}
            {step === 2 && '✉️ Enter Email OTP'}
            {step === 3 && '🔒 Set New Password'}
            {step === 4 && '🎉 Password Reset Complete'}
          </h2>
          <button
            onClick={onClose}
            style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', fontSize: '18px', padding: '4px' }}
          >
            ✕
          </button>
        </div>

        {/* STEP 1: Enter Email */}
        {step === 1 && (
          <form onSubmit={handleRequestOTP}>
            <p style={{ color: '#64748b', fontSize: '14px', lineHeight: 1.5, margin: '0 0 16px 0' }}>
              Enter your registered email address below. We will send you a 6-digit OTP code to reset your password.
            </p>
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#334155', marginBottom: '6px' }}>
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="name@example.com"
                style={{ width: '100%', padding: '12px 14px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '14px', outline: 'none' }}
                required
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%',
                padding: '12px',
                borderRadius: '10px',
                background: '#2563eb',
                color: '#ffffff',
                border: 'none',
                fontWeight: '700',
                fontSize: '14px',
                cursor: loading ? 'not-allowed' : 'pointer'
              }}
            >
              {loading ? 'Sending OTP Email...' : 'Send Verification OTP →'}
            </button>
          </form>
        )}

        {/* STEP 2: Enter 6-digit OTP */}
        {step === 2 && (
          <form onSubmit={handleVerifyOTP}>
            <p style={{ color: '#64748b', fontSize: '14px', lineHeight: 1.5, margin: '0 0 16px 0' }}>
              We sent a 6-digit OTP verification code to <strong>{email}</strong>. Please enter it below:
            </p>
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#334155', marginBottom: '6px' }}>
                6-Digit OTP Code
              </label>
              <input
                type="text"
                maxLength={6}
                value={otpCode}
                onChange={e => setOtpCode(e.target.value.replace(/\D/g, ''))}
                placeholder="123456"
                style={{ width: '100%', padding: '14px', borderRadius: '10px', border: '2px solid #3b82f6', fontSize: '22px', fontWeight: '800', letterSpacing: '6px', textAlign: 'center', outline: 'none' }}
                required
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%',
                padding: '12px',
                borderRadius: '10px',
                background: '#2563eb',
                color: '#ffffff',
                border: 'none',
                fontWeight: '700',
                fontSize: '14px',
                cursor: loading ? 'not-allowed' : 'pointer',
                marginBottom: '12px'
              }}
            >
              {loading ? 'Verifying OTP...' : 'Verify OTP Code →'}
            </button>

            <div style={{ textAlign: 'center' }}>
              {resendTimer > 0 ? (
                <span style={{ fontSize: '12px', color: '#94a3b8' }}>Resend OTP in {resendTimer}s</span>
              ) : (
                <button
                  type="button"
                  onClick={handleRequestOTP}
                  style={{ background: 'none', border: 'none', color: '#2563eb', fontSize: '13px', fontWeight: '600', cursor: 'pointer' }}
                >
                  Didn't receive code? Resend OTP
                </button>
              )}
            </div>
          </form>
        )}

        {/* STEP 3: Enter New Password */}
        {step === 3 && (
          <form onSubmit={handleResetPassword}>
            <p style={{ color: '#64748b', fontSize: '14px', lineHeight: 1.5, margin: '0 0 16px 0' }}>
              Your OTP is verified! Please enter your new password below:
            </p>
            <div style={{ marginBottom: '14px' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#334155', marginBottom: '6px' }}>New Password</label>
              <input
                type="password"
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
                placeholder="Enter new password (min. 6 chars)"
                style={{ width: '100%', padding: '12px 14px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '14px', outline: 'none' }}
                required
              />
            </div>
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#334155', marginBottom: '6px' }}>Confirm New Password</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                placeholder="Confirm new password"
                style={{ width: '100%', padding: '12px 14px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '14px', outline: 'none' }}
                required
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%',
                padding: '12px',
                borderRadius: '10px',
                background: '#10b981',
                color: '#ffffff',
                border: 'none',
                fontWeight: '700',
                fontSize: '14px',
                cursor: loading ? 'not-allowed' : 'pointer'
              }}
            >
              {loading ? 'Resetting Password...' : 'Save New Password & Finish'}
            </button>
          </form>
        )}

        {/* STEP 4: Success Screen */}
        {step === 4 && (
          <div style={{ textAlign: 'center', padding: '10px 0' }}>
            <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: '#dcfce7', color: '#166534', fontSize: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px auto' }}>
              ✓
            </div>
            <h3 style={{ margin: '0 0 8px 0', fontSize: '18px', fontWeight: '700', color: '#0f172a' }}>Password Reset Successfully</h3>
            <p style={{ color: '#64748b', fontSize: '14px', marginBottom: '20px' }}>
              Your account password has been updated. You can now log in using your new password.
            </p>
            <button
              onClick={onClose}
              style={{ width: '100%', padding: '12px', borderRadius: '10px', background: '#2563eb', color: '#ffffff', border: 'none', fontWeight: '700', fontSize: '14px', cursor: 'pointer' }}
            >
              Continue to Login
            </button>
          </div>
        )}
      </div>
    </div>,
    document.body
  );
};
