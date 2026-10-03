import React from 'react';

interface AccountSuspendedPageProps {
  errorCode?: string;
  message?: string;
  onSignOut?: () => void;
}

export const AccountSuspendedPage: React.FC<AccountSuspendedPageProps> = ({
  errorCode,
  message,
  onSignOut,
}) => {
  const isBlocked = !errorCode || errorCode === 'ACCOUNT_BLOCKED';

  const handleContactSupport = () => {
    window.location.href = 'mailto:support@jobmarket.com?subject=Account%20Suspension%20Appeal';
  };

  const handleSignOut = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('sessionId');
    if (onSignOut) {
      onSignOut();
    }
    window.location.href = '/login';
  };

  return (
    <div style={styles.overlay}>
      <div style={styles.card}>
        {/* Icon */}
        <div style={styles.iconWrap}>
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#DC2626" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"/>
            <line x1="12" y1="8" x2="12" y2="12"/>
            <line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
        </div>

        {/* Title */}
        <h1 style={styles.title}>
          {isBlocked ? 'Account Suspended' : 'Account Inactive'}
        </h1>

        {/* Subtitle */}
        <p style={styles.subtitle}>
          {message || (isBlocked
            ? 'Your account has been suspended by the platform administrator due to a violation of our Terms of Service or Community Guidelines.'
            : 'Your account is currently inactive. Please verify your email address to regain access to the platform.')}
        </p>

        {/* Info Box */}
        <div style={styles.infoBox}>
          <p style={styles.infoTitle}>What you can do</p>
          {isBlocked ? (
            <ul style={styles.infoList}>
              <li>Review our <a href="/terms" style={styles.link}>Terms of Service</a> and Community Guidelines</li>
              <li>Contact our support team to appeal this decision</li>
              <li>Provide any necessary verification documents</li>
            </ul>
          ) : (
            <ul style={styles.infoList}>
              <li>Check your email inbox for the verification link</li>
              <li>Check your spam or junk folder</li>
              <li>Contact support if you didn't receive the verification email</li>
            </ul>
          )}
        </div>

        {/* Reference */}
        <div style={styles.refBox}>
          <span style={styles.refLabel}>Error Code</span>
          <span style={styles.refValue}>{errorCode || 'ACCOUNT_BLOCKED'}</span>
        </div>

        {/* Actions */}
        <div style={styles.actions}>
          <button
            onClick={handleContactSupport}
            style={styles.primaryBtn}
            onMouseEnter={e => (e.currentTarget.style.background = '#1D4ED8')}
            onMouseLeave={e => (e.currentTarget.style.background = '#2563EB')}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
              <polyline points="22,6 12,13 2,6"/>
            </svg>
            Contact Support
          </button>
          <button
            onClick={handleSignOut}
            style={styles.secondaryBtn}
            onMouseEnter={e => { e.currentTarget.style.background = '#F1F5F9'; e.currentTarget.style.borderColor = '#94A3B8'; }}
            onMouseLeave={e => { e.currentTarget.style.background = '#FFFFFF'; e.currentTarget.style.borderColor = '#CBD5E1'; }}
          >
            Sign Out
          </button>
        </div>

        <p style={styles.support}>
          Need help?&nbsp;
          <a href="mailto:support@jobmarket.com" style={styles.link}>
            support@jobmarket.com
          </a>
        </p>
      </div>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  overlay: {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #F8FAFC 0%, #EFF6FF 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '24px',
    fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif",
  },
  card: {
    background: '#FFFFFF',
    borderRadius: '16px',
    border: '1px solid #E2E8F0',
    boxShadow: '0 4px 24px rgba(15, 23, 42, 0.08)',
    padding: '48px 40px',
    maxWidth: '520px',
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    textAlign: 'center',
  },
  iconWrap: {
    width: '80px',
    height: '80px',
    borderRadius: '50%',
    background: '#FEF2F2',
    border: '2px solid #FECACA',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: '24px',
  },
  title: {
    fontSize: '26px',
    fontWeight: '800',
    color: '#0F172A',
    margin: '0 0 12px 0',
    letterSpacing: '-0.4px',
  },
  subtitle: {
    fontSize: '15px',
    color: '#64748B',
    lineHeight: '1.65',
    margin: '0 0 28px 0',
    fontWeight: '400',
  },
  infoBox: {
    width: '100%',
    background: '#F8FAFC',
    border: '1px solid #E2E8F0',
    borderRadius: '10px',
    padding: '20px 24px',
    marginBottom: '20px',
    textAlign: 'left',
  },
  infoTitle: {
    fontSize: '12px',
    fontWeight: '700',
    color: '#334155',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.6px',
    margin: '0 0 12px 0',
  },
  infoList: {
    margin: 0,
    padding: '0 0 0 20px',
    fontSize: '14px',
    color: '#475569',
    lineHeight: '1.85',
  },
  refBox: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    background: '#F1F5F9',
    borderRadius: '8px',
    padding: '10px 16px',
    marginBottom: '28px',
    width: '100%',
    justifyContent: 'center',
  },
  refLabel: {
    fontSize: '12px',
    fontWeight: '600',
    color: '#94A3B8',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.5px',
  },
  refValue: {
    fontSize: '12px',
    fontWeight: '700',
    color: '#475569',
    fontFamily: 'monospace',
  },
  actions: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '12px',
    width: '100%',
    marginBottom: '24px',
  },
  primaryBtn: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    width: '100%',
    padding: '14px 24px',
    background: '#2563EB',
    color: '#FFFFFF',
    border: 'none',
    borderRadius: '10px',
    fontSize: '15px',
    fontWeight: '700',
    cursor: 'pointer',
    transition: 'background 0.15s ease',
    letterSpacing: '0.1px',
  },
  secondaryBtn: {
    width: '100%',
    padding: '13px 24px',
    background: '#FFFFFF',
    color: '#475569',
    border: '1.5px solid #CBD5E1',
    borderRadius: '10px',
    fontSize: '15px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.15s ease',
  },
  support: {
    fontSize: '13px',
    color: '#94A3B8',
    margin: 0,
  },
  link: {
    color: '#2563EB',
    textDecoration: 'none',
    fontWeight: '600',
  },
};
