import React, { useState, useEffect } from 'react';
import { Trash2, KeyRound, Lock, Eye, EyeOff, RotateCw, AlertTriangle, Loader2 } from 'lucide-react';
import { apiFetch } from '../../utils/api';

interface DeleteAccountModalProps {
  visible: boolean;
  onClose: () => void;
  userEmail?: string;
  hasPassword?: boolean;
  onSuccess: () => Promise<void> | void;
}

export const DeleteAccountModal: React.FC<DeleteAccountModalProps> = ({
  visible,
  onClose,
  userEmail = '',
  hasPassword = true,
  onSuccess,
}) => {
  const [otpCode, setOtpCode] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [maskedEmail, setMaskedEmail] = useState('');
  const [resendTimer, setResendTimer] = useState(60);
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Countdown timer for OTP resend
  useEffect(() => {
    let interval: any = null;
    if (visible && resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer((prev) => (prev > 0 ? prev - 1 : 0));
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [visible, resendTimer]);

  // When modal is opened, reset form & request real-time OTP
  useEffect(() => {
    if (visible) {
      setOtpCode('');
      setPassword('');
      setErrorMessage(null);
      setResendTimer(60);
      handleSendOtp();
    } else {
      setOtpCode('');
      setPassword('');
      setErrorMessage(null);
      setResendTimer(0);
    }
  }, [visible]);

  const handleSendOtp = async () => {
    setIsSendingOtp(true);
    setErrorMessage(null);
    try {
      const res = await apiFetch('/api/v1/auth/delete-account/request-otp', {
        method: 'POST',
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.success) {
        setMaskedEmail(data.email || userEmail || 'your registered email');
        setResendTimer(60);
      } else {
        setErrorMessage(
          data.error || data.message || 'Failed to dispatch verification code. Please try again.'
        );
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Network error occurred while requesting verification code.');
    } finally {
      setIsSendingOtp(false);
    }
  };

  const handleConfirmDelete = async () => {
    setErrorMessage(null);

    const cleanOtp = otpCode.trim();
    if (!cleanOtp || cleanOtp.length !== 6) {
      setErrorMessage('Please enter the complete 6-digit verification code.');
      return;
    }

    if (hasPassword && !password.trim()) {
      setErrorMessage('Account password is required to delete your account.');
      return;
    }

    setIsDeleting(true);
    try {
      let res = await apiFetch('/api/v1/auth/delete-account', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          otpCode: cleanOtp,
          password: password.trim(),
        }),
      });

      // Fallback for DELETE method if route router prefers DELETE
      if (!res.ok && (res.status === 404 || res.status === 405)) {
        res = await apiFetch('/api/v1/auth/delete-account', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            otpCode: cleanOtp,
            password: password.trim(),
          }),
        });
      }

      const data = await res.json().catch(() => ({}));
      if (res.ok && data.success) {
        onClose();
        await onSuccess();
      } else {
        setErrorMessage(
          data.error || data.message || 'Invalid verification code. Please check your email and try again.'
        );
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to process account deletion request.');
    } finally {
      setIsDeleting(false);
    }
  };

  if (!visible) return null;

  const isSubmitDisabled =
    otpCode.trim().length !== 6 ||
    (hasPassword && !password.trim()) ||
    isDeleting ||
    isSendingOtp;

  return (
    <div className="del-modal-overlay" onClick={onClose}>
      <style>{`
        /* Desktop View Styles */
        .del-modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-color: rgba(15, 23, 42, 0.65);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 99999;
          padding: 16px;
          backdrop-filter: blur(2px);
          animation: delFadeIn 0.15s ease-out;
        }

        .del-modal-card {
          background-color: #FFFFFF;
          border-radius: 12px;
          border: 1px solid #E2E8F0;
          box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.15), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
          max-width: 420px;
          width: 100%;
          padding: 26px 24px;
          box-sizing: border-box;
          text-align: center;
          animation: delScaleUp 0.15s ease-out;
        }

        .del-icon-circle {
          width: 56px;
          height: 56px;
          border-radius: 28px;
          background-color: #FEF2F2;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 16px;
        }

        .del-title {
          font-size: 18px;
          font-weight: 800;
          color: #0F172A;
          letter-spacing: -0.3px;
          margin: 0 0 8px 0;
        }

        .del-message {
          font-size: 13.5px;
          font-weight: 500;
          color: #475569;
          line-height: 20px;
          margin: 0 0 16px 0;
          padding: 0 4px;
        }

        .del-email-highlight {
          font-weight: 700;
          color: #1764E8;
        }

        .del-error-banner {
          background-color: #FEF2F2;
          border: 1px solid #FECACA;
          border-radius: 6px;
          padding: 8px 12px;
          margin-bottom: 14px;
          font-size: 12px;
          color: #DC2626;
          display: flex;
          align-items: center;
          gap: 6px;
          font-weight: 600;
          text-align: left;
        }

        .del-input-box {
          display: flex;
          align-items: center;
          gap: 10px;
          height: 48px;
          background-color: #F8FAFC;
          border: 1px solid #CBD5E1;
          border-radius: 8px;
          padding: 0 14px;
          margin-bottom: 12px;
          box-sizing: border-box;
          transition: border-color 0.15s ease;
        }

        .del-input-box:focus-within {
          border-color: #DC2626;
          box-shadow: 0 0 0 3px rgba(220, 38, 38, 0.1);
        }

        .del-otp-input {
          flex: 1;
          border: none;
          outline: none;
          background: transparent;
          font-size: 18px;
          font-weight: 800;
          letter-spacing: 6px;
          color: #0F172A;
          text-align: center;
          padding: 0;
          font-family: inherit;
        }

        .del-password-box {
          display: flex;
          align-items: center;
          gap: 10px;
          height: 44px;
          background-color: #F8FAFC;
          border: 1px solid #CBD5E1;
          border-radius: 8px;
          padding: 0 14px;
          margin-bottom: 12px;
          box-sizing: border-box;
          transition: border-color 0.15s ease;
        }

        .del-password-box:focus-within {
          border-color: #DC2626;
          box-shadow: 0 0 0 3px rgba(220, 38, 38, 0.1);
        }

        .del-password-input {
          flex: 1;
          border: none;
          outline: none;
          background: transparent;
          font-size: 13px;
          color: #0F172A;
          padding: 0;
          font-family: inherit;
        }

        .del-resend-row {
          margin-top: 2px;
          margin-bottom: 20px;
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: 28px;
        }

        .del-resend-timer-text {
          font-size: 12.5px;
          color: #64748B;
          line-height: 18px;
          text-align: center;
        }

        .del-resend-btn {
          display: inline-flex;
          align-items: center;
          background: transparent;
          border: none;
          cursor: pointer;
          padding: 4px 8px;
          color: #1764E8;
          font-size: 12.5px;
          font-weight: 700;
          gap: 4px;
          line-height: 18px;
        }

        .del-button-row {
          display: flex;
          align-items: center;
          gap: 12px;
          width: 100%;
        }

        .del-cancel-btn {
          flex: 1;
          height: 46px;
          background-color: #FFFFFF;
          border: 1.5px solid #CBD5E1;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 700;
          color: #0F172A;
          cursor: pointer;
          transition: background-color 0.15s ease;
        }

        .del-cancel-btn:hover {
          background-color: #F8FAFC;
        }

        .del-confirm-btn {
          flex: 1.3;
          height: 46px;
          background-color: #DC2626;
          border: none;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 700;
          color: #FFFFFF;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          transition: background-color 0.15s ease, opacity 0.15s ease;
        }

        .del-confirm-btn:hover:not(:disabled) {
          background-color: #B91C1C;
        }

        .del-confirm-btn:disabled {
          background-color: #F87171;
          opacity: 0.65;
          cursor: not-allowed;
        }

        /* ── Mobile View (max-width: 768px): Exact Parity with Mobile App DeleteAccountModal.tsx ── */
        @media (max-width: 768px) {
          .del-modal-overlay {
            padding: 20px !important;
          }

          .del-modal-card {
            max-width: 360px !important;
            border-radius: 16px !important;
            border: 1px solid #E2E8F0 !important;
            padding: 26px 20px 24px !important;
            box-shadow: 0 10px 25px -5px rgba(15, 23, 42, 0.25) !important;
          }

          .del-icon-circle {
            width: 56px !important;
            height: 56px !important;
            border-radius: 28px !important;
            margin-bottom: 16px !important;
          }

          .del-title {
            font-size: 18px !important;
            margin-bottom: 8px !important;
          }

          .del-message {
            font-size: 13.5px !important;
            line-height: 20px !important;
            margin-bottom: 18px !important;
          }

          .del-input-box {
            height: 48px !important;
            margin-bottom: 12px !important;
          }

          .del-otp-input {
            font-size: 18px !important;
            letter-spacing: 6px !important;
          }

          .del-password-box {
            height: 44px !important;
            margin-bottom: 12px !important;
          }

          .del-password-input {
            font-size: 13px !important;
          }

          .del-resend-row {
            margin-bottom: 20px !important;
          }

          .del-button-row {
            gap: 12px !important;
          }

          .del-cancel-btn {
            height: 46px !important;
            font-size: 14px !important;
            border-radius: 8px !important;
          }

          .del-confirm-btn {
            height: 46px !important;
            font-size: 14px !important;
            border-radius: 8px !important;
          }
        }

        @keyframes delFadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes delScaleUp {
          from { transform: scale(0.96); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
      `}</style>

      <div className="del-modal-card" onClick={(e) => e.stopPropagation()}>
        {/* Center Circular Icon Badge */}
        <div className="del-icon-circle">
          <Trash2 size={28} color="#DC2626" strokeWidth={2.4} />
        </div>

        {/* Title */}
        <h3 className="del-title">Verify Deletion Code</h3>

        {/* Message Description */}
        <p className="del-message">
          {isSendingOtp ? (
            'Sending 6-digit verification code to your email...'
          ) : (
            <>
              Enter the 6-digit OTP code sent to{' '}
              <span className="del-email-highlight">{maskedEmail || userEmail}</span>.
            </>
          )}
        </p>

        {/* Error Banner */}
        {errorMessage && (
          <div className="del-error-banner">
            <AlertTriangle size={15} style={{ flexShrink: 0 }} />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* 6-Digit OTP Input Box */}
        <div className="del-input-box">
          <KeyRound size={18} color="#DC2626" style={{ flexShrink: 0 }} />
          <input
            type="text"
            className="del-otp-input"
            placeholder="123456"
            maxLength={6}
            value={otpCode}
            onChange={(e) => {
              setOtpCode(e.target.value.replace(/[^0-9]/g, '').slice(0, 6));
              if (errorMessage) setErrorMessage(null);
            }}
            disabled={isDeleting}
            autoFocus
          />
          {isSendingOtp && <Loader2 size={16} color="#DC2626" className="animate-spin" style={{ flexShrink: 0 }} />}
        </div>

        {/* Mandatory Password Input Box */}
        {hasPassword && (
          <div className="del-password-box">
            <Lock size={16} color="#64748B" style={{ flexShrink: 0 }} />
            <input
              type={showPassword ? 'text' : 'password'}
              className="del-password-input"
              placeholder="Account Password *"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (errorMessage) setErrorMessage(null);
              }}
              disabled={isDeleting}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              style={{
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                color: '#64748B',
                padding: '4px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        )}

        {/* Resend OTP Row */}
        <div className="del-resend-row">
          {resendTimer > 0 ? (
            <span className="del-resend-timer-text">
              Resend code in{' '}
              <strong style={{ fontWeight: 700, color: '#1764E8' }}>
                {resendTimer}s
              </strong>
            </span>
          ) : (
            <button
              type="button"
              className="del-resend-btn"
              onClick={handleSendOtp}
              disabled={isSendingOtp || isDeleting}
            >
              <RotateCw size={13} style={{ marginRight: 2 }} />
              <span>Resend OTP Code</span>
            </button>
          )}
        </div>

        {/* Action Buttons Row */}
        <div className="del-button-row">
          <button
            type="button"
            className="del-cancel-btn"
            onClick={onClose}
            disabled={isDeleting}
          >
            Cancel
          </button>

          <button
            type="button"
            className="del-confirm-btn"
            onClick={handleConfirmDelete}
            disabled={isSubmitDisabled}
          >
            {isDeleting ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                <span>Deleting...</span>
              </>
            ) : (
              <span>Permanently Delete</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
