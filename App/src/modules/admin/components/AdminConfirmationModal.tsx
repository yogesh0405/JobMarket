import React, { useEffect } from 'react';
import { AlertTriangle, AlertCircle, CheckCircle2, Info, X } from 'lucide-react';

export interface AdminConfirmationModalProps {
  isOpen: boolean;
  title: string;
  message: React.ReactNode;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'warning' | 'primary' | 'success' | 'info';
  icon?: React.ReactNode;
  loading?: boolean;
  showCancel?: boolean;
  onConfirm: () => void | Promise<void>;
  onCancel: () => void;
}

export const AdminConfirmationModal: React.FC<AdminConfirmationModalProps> = ({
  isOpen,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'primary',
  icon,
  loading = false,
  showCancel = true,
  onConfirm,
  onCancel,
}) => {
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !loading) {
        onCancel();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, loading, onCancel]);

  if (!isOpen) return null;

  const getVariantStyles = () => {
    switch (variant) {
      case 'danger':
        return {
          iconBg: '#FEF2F2',
          iconColor: '#DC2626',
          confirmBg: '#DC2626',
          confirmHoverBg: '#B91C1C',
          defaultIcon: <AlertTriangle size={26} />,
        };
      case 'warning':
        return {
          iconBg: '#FEF3C7',
          iconColor: '#D97706',
          confirmBg: '#D97706',
          confirmHoverBg: '#B45309',
          defaultIcon: <AlertCircle size={26} />,
        };
      case 'success':
        return {
          iconBg: '#DCFCE7',
          iconColor: '#16A34A',
          confirmBg: '#16A34A',
          confirmHoverBg: '#15803D',
          defaultIcon: <CheckCircle2 size={26} />,
        };
      case 'info':
        return {
          iconBg: '#EFF6FF',
          iconColor: '#1B4FDF',
          confirmBg: '#1B4FDF',
          confirmHoverBg: '#1642C0',
          defaultIcon: <Info size={26} />,
        };
      case 'primary':
      default:
        return {
          iconBg: '#EFF6FF',
          iconColor: '#1B4FDF',
          confirmBg: '#1B4FDF',
          confirmHoverBg: '#1642C0',
          defaultIcon: <CheckCircle2 size={26} />,
        };
    }
  };

  const currentStyles = getVariantStyles();

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.65)',
        backdropFilter: 'blur(4px)',
        WebkitBackdropFilter: 'blur(4px)',
        zIndex: 99999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
        boxSizing: 'border-box',
        animation: 'fadeIn 0.15s ease-out',
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget && !loading) {
          onCancel();
        }
      }}
    >
      <div
        style={{
          backgroundColor: '#FFFFFF',
          borderRadius: '16px',
          padding: '28px 24px',
          maxWidth: '420px',
          width: '100%',
          margin: 'auto',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.2), 0 10px 10px -5px rgba(0, 0, 0, 0.1)',
          textAlign: 'center',
          boxSizing: 'border-box',
          position: 'relative',
          border: '1px solid #E2E8F0',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        {!loading && (
          <button
            type="button"
            onClick={onCancel}
            style={{
              position: 'absolute',
              top: '16px',
              right: '16px',
              background: 'none',
              border: 'none',
              color: '#94A3B8',
              cursor: 'pointer',
              padding: '4px',
              borderRadius: '6px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <X size={18} />
          </button>
        )}

        {/* Icon Circle */}
        <div
          style={{
            width: '56px',
            height: '56px',
            borderRadius: '50%',
            backgroundColor: currentStyles.iconBg,
            color: currentStyles.iconColor,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 16px auto',
          }}
        >
          {icon || currentStyles.defaultIcon}
        </div>

        {/* Title */}
        <h3
          style={{
            margin: '0 0 10px 0',
            fontSize: '18px',
            fontWeight: '800',
            color: '#0F172A',
            letterSpacing: '-0.2px',
          }}
        >
          {title}
        </h3>

        {/* Message */}
        <div
          style={{
            margin: '0 0 24px 0',
            fontSize: '13.5px',
            color: '#64748B',
            lineHeight: '1.55',
            fontWeight: '500',
            textAlign: 'center',
            wordBreak: 'break-word',
          }}
        >
          {message}
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', gap: '10px', width: '100%' }}>
          {showCancel && (
            <button
              type="button"
              disabled={loading}
              onClick={onCancel}
              style={{
                flex: 1,
                height: '42px',
                borderRadius: '8px',
                border: '1.5px solid #CBD5E1',
                backgroundColor: '#FFFFFF',
                color: '#334155',
                fontSize: '13.5px',
                fontWeight: '700',
                cursor: loading ? 'not-allowed' : 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              {cancelText}
            </button>
          )}
          <button
            type="button"
            disabled={loading}
            onClick={() => onConfirm()}
            style={{
              flex: 1,
              height: '42px',
              borderRadius: '8px',
              border: 'none',
              backgroundColor: currentStyles.confirmBg,
              color: '#FFFFFF',
              fontSize: '13.5px',
              fontWeight: '700',
              cursor: loading ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              boxShadow: `0 4px 12px ${currentStyles.confirmBg}40`,
              transition: 'all 0.15s ease',
            }}
          >
            {loading ? (
              <>
                <div
                  style={{
                    width: '16px',
                    height: '16px',
                    border: '2px solid rgba(255, 255, 255, 0.3)',
                    borderTopColor: '#FFFFFF',
                    borderRadius: '50%',
                    animation: 'spin 0.8s linear infinite',
                  }}
                />
                Processing...
              </>
            ) : (
              confirmText
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
export default AdminConfirmationModal;
