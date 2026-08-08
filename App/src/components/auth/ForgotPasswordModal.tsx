import React, { useState, useEffect, useRef } from 'react';
import ReactDOM from 'react-dom';
import { apiFetch } from '../../utils/api';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../hooks/useToast';

interface ForgotPasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  initialEmail?: string;
  autoSendOtp?: boolean;
}

export const ForgotPasswordModal: React.FC<ForgotPasswordModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  initialEmail = '',
  autoSendOtp = false
}) => {
  const { currentUser } = useAuth();
  const { showToast } = useToast();

  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [email, setEmail] = useState('');
  const [otpDigits, setOtpDigits] = useState<string[]>(['', '', '', '', '', '']);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPass, setShowNewPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);

  const [loading, setLoading] = useState(false);
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);
  const [otpError, setOtpError] = useState(false);
  const [inlineError, setInlineError] = useState<string | null>(null);

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const isSendingOtpRef = useRef(false);

  // Function to send OTP for an email address
  const sendOtpForEmail = async (targetEmail: string) => {
    if (isSendingOtpRef.current) return;
    isSendingOtpRef.current = true;

    try {
      setLoading(true);
      setIsSendingOtp(true);
      setInlineError(null);
      const res = await apiFetch('/api/v1/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: targetEmail })
      });
      const json = await res.json();

      if (res.ok) {
        showToast('otp sent to registered email', 'success');
        setStep(2);
        setResendTimer(60);
      } else {
        setStep(1);
        setInlineError(json.error || 'No account found with this email address.');
      }
    } catch (err) {
      setInlineError('Error requesting password reset OTP');
    } finally {
      setLoading(false);
      setIsSendingOtp(false);
      isSendingOtpRef.current = false;
    }
  };

  // Reset modal state on open
  useEffect(() => {
    if (isOpen) {
      setOtpDigits(['', '', '', '', '', '']);
      setNewPassword('');
      setConfirmPassword('');
      setLoading(false);
      setIsSendingOtp(false);
      setOtpError(false);
      setInlineError(null);
      isSendingOtpRef.current = false;

      const targetEmail = initialEmail || currentUser?.email || '';
      if (targetEmail) {
        setEmail(targetEmail);
        if (autoSendOtp) {
          setStep(2);
          sendOtpForEmail(targetEmail);
        } else {
          setStep(1);
        }
      } else {
        setEmail('');
        setStep(1);
      }
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

  // Auto focus first OTP input when reaching step 2
  useEffect(() => {
    if (step === 2) {
      setTimeout(() => {
        inputRefs.current[0]?.focus();
      }, 150);
    }
  }, [step]);

  if (!isOpen) return null;

  // Step 1: Request OTP manually if no initial email
  const handleRequestOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !/\S+@\S+\.\S+/.test(email)) {
      showToast('Please enter a valid email address', 'error');
      return;
    }
    await sendOtpForEmail(email);
  };

  // Handle individual OTP digit change
  const handleOtpDigitChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const newDigits = [...otpDigits];
    newDigits[index] = value.slice(-1);
    setOtpDigits(newDigits);
    setOtpError(false);
    setInlineError(null);

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  // Handle Backspace navigation in OTP digits
  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  // Handle Paste event for 6-digit OTP
  const handleOtpPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (pastedData.length > 0) {
      const newDigits = ['', '', '', '', '', ''];
      for (let i = 0; i < pastedData.length; i++) {
        newDigits[i] = pastedData[i];
      }
      setOtpDigits(newDigits);
      setOtpError(false);
      setInlineError(null);
      if (pastedData.length === 6) {
        inputRefs.current[5]?.focus();
      } else {
        inputRefs.current[pastedData.length]?.focus();
      }
    }
  };

  // Step 2: Verify OTP
  const handleVerifyOTP = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const fullOtp = otpDigits.join('');
    if (fullOtp.length !== 6) {
      setOtpError(true);
      setInlineError('Please enter the full 6-digit OTP code');
      return;
    }

    try {
      setLoading(true);
      setOtpError(false);
      setInlineError(null);
      const res = await apiFetch('/api/v1/auth/verify-reset-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otpCode: fullOtp })
      });
      const json = await res.json();

      if (res.ok) {
        showToast('OTP Verified! Enter your new password.', 'success');
        setStep(3);
      } else {
        setOtpError(true);
        setInlineError(json.error || 'Invalid or expired OTP code. Please check the code or click Resend OTP.');
      }
    } catch (err) {
      setOtpError(true);
      setInlineError('Error verifying OTP code. Please try requesting a new OTP.');
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

    const fullOtp = otpDigits.join('');

    try {
      setLoading(true);
      const res = await apiFetch('/api/v1/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otpCode: fullOtp, newPassword })
      });
      const json = await res.json();

      if (res.ok) {
        showToast('Password updated successfully!', 'success');
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
    <div style={{ position: 'fixed', inset: 0, zIndex: 999999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
      {/* Dynamic Keyframes for OTP animation */}
      <style>{`
        @keyframes modalPopIn {
          from { opacity: 0; transform: scale(0.95) translateY(10px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }
        @keyframes otpBoxPulse {
          0% { border-color: #cbd5e1; transform: scale(1); }
          50% { border-color: #344BFD; transform: scale(1.05); }
          100% { border-color: #344BFD; transform: scale(1); }
        }
        @keyframes shakeError {
          0%, 100% { transform: translateX(0); }
          20%, 60% { transform: translateX(-6px); }
          40%, 80% { transform: translateX(6px); }
        }
        @keyframes pulseRing {
          0% { transform: scale(0.85); opacity: 0.9; }
          100% { transform: scale(1.45); opacity: 0; }
        }
        @keyframes floatMail {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-6px); }
        }
        @keyframes barLoading {
          0% { left: -40%; width: 40%; }
          50% { width: 60%; }
          100% { left: 100%; width: 40%; }
        }
      `}</style>

      {/* Backdrop */}
      <div
        style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(15, 23, 42, 0.6)',
          backdropFilter: 'blur(4px)',
          WebkitBackdropFilter: 'blur(4px)'
        }}
      />

      {/* Modal Box */}
      <div
        style={{
          position: 'relative',
          width: '420px',
          maxWidth: '100%',
          background: '#ffffff',
          borderRadius: '8px',
          padding: '24px',
          boxShadow: '0 20px 40px rgba(15, 23, 42, 0.2)',
          zIndex: 1000000,
          animation: 'modalPopIn 0.25s cubic-bezier(0.16, 1, 0.3, 1) forwards',
          border: '1px solid #cbd5e1'
        }}
      >
        {/* Header Bar */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', borderBottom: '1px solid #f1f5f9', paddingBottom: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ width: '28px', height: '28px', borderRadius: '4px', background: '#eff6ff', color: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                <rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
              </svg>
            </div>
            <h2 style={{ margin: 0, fontSize: '17px', fontWeight: '800', color: '#0f172a' }}>
              {isSendingOtp ? 'Sending OTP Verification...' : (
                <>
                  {step === 1 && 'Forgot Password'}
                  {step === 2 && 'Email OTP Verification'}
                  {step === 3 && 'Set New Password'}
                  {step === 4 && 'Password Reset Complete'}
                </>
              )}
            </h2>
          </div>
          <button
            onClick={onClose}
            style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', fontSize: '18px', padding: '4px', lineHeight: 1 }}
          >
            ✕
          </button>
        </div>

        {/* LOADING ANIMATION SCREEN */}
        {isSendingOtp ? (
          <div style={{
            textAlign: 'center',
            padding: '28px 12px 20px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            {/* Animated Pulsing Mail Icon */}
            <div style={{
              position: 'relative',
              width: '72px',
              height: '72px',
              marginBottom: '20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <div style={{
                position: 'absolute',
                inset: '-8px',
                borderRadius: '50%',
                background: 'rgba(37, 99, 235, 0.2)',
                animation: 'pulseRing 1.6s ease-out infinite'
              }} />
              <div style={{
                position: 'absolute',
                inset: '-18px',
                borderRadius: '50%',
                background: 'rgba(37, 99, 235, 0.1)',
                animation: 'pulseRing 1.6s ease-out 0.4s infinite'
              }} />

              <div style={{
                width: '60px',
                height: '60px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 8px 20px rgba(37, 99, 235, 0.35)',
                animation: 'floatMail 2s ease-in-out infinite',
                zIndex: 2
              }}>
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                  <polyline points="22,6 12,13 2,6"/>
                </svg>
              </div>
            </div>

            <h3 style={{ margin: '0 0 6px 0', fontSize: '15.5px', fontWeight: '800', color: '#0f172a' }}>
              Sending OTP Verification Code...
            </h3>
            <p style={{ margin: '0 0 20px 0', fontSize: '13px', color: '#64748b', lineHeight: 1.5 }}>
              Sending a secure 6-digit OTP code to<br/>
              <strong style={{ color: '#2563eb', fontWeight: '700' }}>{email || currentUser?.email}</strong>
            </p>

            {/* Horizontal Bar Loading Animation */}
            <div style={{
              width: '180px',
              height: '4px',
              background: '#e2e8f0',
              borderRadius: '2px',
              overflow: 'hidden',
              position: 'relative'
            }}>
              <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                height: '100%',
                width: '40%',
                background: 'linear-gradient(90deg, #2563eb 0%, #60a5fa 100%)',
                borderRadius: '2px',
                animation: 'barLoading 1.2s ease-in-out infinite'
              }} />
            </div>
          </div>
        ) : (
          <>
            {/* STEP 1: Enter Email */}
        {step === 1 && (
          <form onSubmit={handleRequestOTP}>
            <p style={{ color: '#64748b', fontSize: '13px', lineHeight: 1.5, margin: '0 0 16px 0' }}>
              Enter your registered email address below. We will send a 6-digit OTP code to verify your request.
            </p>
            <div style={{ marginBottom: '18px' }}>
              <label style={{ display: 'block', fontSize: '12.5px', fontWeight: '700', color: '#334155', marginBottom: '6px' }}>
                Registered Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={e => { setEmail(e.target.value); setInlineError(null); }}
                placeholder="name@example.com"
                style={{ width: '100%', padding: '10px 12px', borderRadius: '6px', border: inlineError ? '1px solid #ef4444' : '1px solid #cbd5e1', fontSize: '13.5px', outline: 'none', boxSizing: 'border-box' }}
                required
              />
            </div>

            {inlineError && (
              <div style={{
                background: '#fef2f2',
                border: '1px solid #fca5a5',
                borderRadius: '6px',
                padding: '10px 12px',
                marginBottom: '14px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                color: '#991b1b',
                fontSize: '12.5px',
                fontWeight: '600',
                lineHeight: 1.4
              }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" style={{ flexShrink: 0 }}>
                  <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                </svg>
                <span>{inlineError}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%',
                padding: '10px',
                borderRadius: '6px',
                background: '#344BFD',
                color: '#ffffff',
                border: 'none',
                fontWeight: '700',
                fontSize: '13.5px',
                cursor: loading ? 'not-allowed' : 'pointer'
              }}
            >
              {loading ? 'Sending OTP Email...' : 'Send Verification OTP →'}
            </button>
          </form>
        )}

        {/* STEP 2: Enter 6-digit OTP with Individual Animated Input Boxes */}
        {step === 2 && (
          <form onSubmit={handleVerifyOTP}>
            <p style={{ color: '#64748b', fontSize: '13px', lineHeight: 1.5, margin: '0 0 16px 0' }}>
              We sent a 6-digit OTP verification code to <strong style={{ color: '#0f172a' }}>{email}</strong>. Please enter the code below:
            </p>

            <div style={{ 
              marginBottom: '20px', 
              animation: otpError ? 'shakeError 0.4s ease' : 'none' 
            }}>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', marginBottom: '8px', textAlign: 'center' }}>
                6-Digit Verification Code
              </label>
              
              <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                {otpDigits.map((digit, idx) => (
                  <input
                    key={idx}
                    ref={el => { inputRefs.current[idx] = el; }}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={e => handleOtpDigitChange(idx, e.target.value)}
                    onKeyDown={e => handleOtpKeyDown(idx, e)}
                    onPaste={handleOtpPaste}
                    style={{
                      width: '42px',
                      height: '48px',
                      textAlign: 'center',
                      fontSize: '20px',
                      fontWeight: '800',
                      color: '#0f172a',
                      borderRadius: '6px',
                      border: otpError ? '2px solid #ef4444' : digit ? '2px solid #344BFD' : '1px solid #cbd5e1',
                      background: digit ? '#eff6ff' : '#ffffff',
                      outline: 'none',
                      transition: 'all 0.15s ease',
                      boxShadow: digit ? '0 2px 8px rgba(52, 75, 253, 0.15)' : 'none'
                    }}
                  />
                ))}
              </div>
            </div>

            {inlineError && (
              <div style={{
                background: '#fef2f2',
                border: '1px solid #fca5a5',
                borderRadius: '6px',
                padding: '10px 12px',
                marginBottom: '14px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                color: '#991b1b',
                fontSize: '12.5px',
                fontWeight: '600',
                lineHeight: 1.4
              }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" style={{ flexShrink: 0 }}>
                  <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                </svg>
                <span>{inlineError}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%',
                padding: '10px',
                borderRadius: '6px',
                background: '#344BFD',
                color: '#ffffff',
                border: 'none',
                fontWeight: '700',
                fontSize: '13.5px',
                cursor: loading ? 'not-allowed' : 'pointer',
                marginBottom: '12px'
              }}
            >
              {loading ? 'Verifying OTP Code...' : 'Verify OTP & Continue →'}
            </button>

            <div style={{ textAlign: 'center' }}>
              {resendTimer > 0 ? (
                <span style={{ fontSize: '12px', color: '#64748b', fontWeight: '500' }}>
                  Resend OTP code in {resendTimer}s
                </span>
              ) : (
                <button
                  type="button"
                  onClick={() => sendOtpForEmail(email)}
                  style={{ background: 'none', border: 'none', color: '#344BFD', fontSize: '12.5px', fontWeight: '700', cursor: 'pointer' }}
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
            <p style={{ color: '#64748b', fontSize: '13px', lineHeight: 1.5, margin: '0 0 16px 0' }}>
              OTP Verified! Enter your new password below to update your account credentials:
            </p>
            <div style={{ marginBottom: '14px' }}>
              <label style={{ display: 'block', fontSize: '12.5px', fontWeight: '700', color: '#334155', marginBottom: '6px' }}>New Password</label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showNewPass ? 'text' : 'password'}
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                  placeholder="Enter new password (min. 6 chars)"
                  style={{ width: '100%', padding: '10px 38px 10px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13.5px', outline: 'none', boxSizing: 'border-box' }}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowNewPass(!showNewPass)}
                  style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', padding: '4px', display: 'flex', alignItems: 'center' }}
                  title={showNewPass ? 'Hide password' : 'Show password'}
                >
                  {showNewPass ? (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
                    </svg>
                  ) : (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/>
                    </svg>
                  )}
                </button>
              </div>
            </div>
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontSize: '12.5px', fontWeight: '700', color: '#334155', marginBottom: '6px' }}>Confirm New Password</label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showConfirmPass ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  placeholder="Confirm new password"
                  style={{ width: '100%', padding: '10px 38px 10px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13.5px', outline: 'none', boxSizing: 'border-box' }}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPass(!showConfirmPass)}
                  style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', padding: '4px', display: 'flex', alignItems: 'center' }}
                  title={showConfirmPass ? 'Hide password' : 'Show password'}
                >
                  {showConfirmPass ? (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
                    </svg>
                  ) : (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/>
                    </svg>
                  )}
                </button>
              </div>
            </div>
            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%',
                padding: '10px',
                borderRadius: '6px',
                background: '#15803d',
                color: '#ffffff',
                border: 'none',
                fontWeight: '700',
                fontSize: '13.5px',
                cursor: loading ? 'not-allowed' : 'pointer'
              }}
            >
              {loading ? 'Resetting Password...' : 'Save New Password'}
            </button>
          </form>
        )}

        {/* STEP 4: Success Screen */}
        {step === 4 && (
          <div style={{ textAlign: 'center', padding: '12px 0' }}>
            <div style={{ width: '52px', height: '52px', borderRadius: '50%', background: '#dcfce7', color: '#15803d', fontSize: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px auto', border: '1px solid #86efac' }}>
              ✓
            </div>
            <h3 style={{ margin: '0 0 6px 0', fontSize: '17px', fontWeight: '800', color: '#0f172a' }}>Password Reset Successfully</h3>
            <p style={{ color: '#64748b', fontSize: '13px', marginBottom: '18px' }}>
              Your account password has been updated. You can now use your new password.
            </p>
            <button
              onClick={onClose}
              style={{ width: '100%', padding: '10px', borderRadius: '6px', background: '#344BFD', color: '#ffffff', border: 'none', fontWeight: '700', fontSize: '13.5px', cursor: 'pointer' }}
            >
              Close Window
            </button>
          </div>
        )}
        </>
        )}
      </div>
    </div>,
    document.body
  );
};
export default ForgotPasswordModal;
