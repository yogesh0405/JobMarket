import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Home } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { COLORS } from '../../constants/theme';
import characterImg from '../../assets/404-character.jpg';

export const NotFoundPage: React.FC = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();

  const isEmployer = currentUser?.role?.toLowerCase() === 'employer';

  const handleGoHome = () => {
    navigate(isEmployer ? '/dashboard' : '/');
  };

  return (
    <div style={styles.container}>
      <div style={styles.contentWrap}>
        {/* Industry-Grade JobMarket 3D Character Illustration */}
        <div style={styles.imageWrap}>
          <img
            src={characterImg}
            alt="404 Page Not Found - JobMarket"
            style={styles.characterImage}
            loading="eager"
          />
        </div>

        {/* Heading */}
        <h1 style={styles.title}>Page Not Found</h1>

        {/* Subtitle Message */}
        <p style={styles.subtitle}>
          The page or job you are looking for might have been removed, had its name changed, or is temporarily unavailable.
        </p>

        {/* Single Primary CTA Button — Themed in JobMarket Blue */}
        <div style={styles.btnWrap}>
          <button
            onClick={handleGoHome}
            style={styles.primaryButton}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = COLORS.primaryDark;
              e.currentTarget.style.transform = 'translateY(-1px)';
              e.currentTarget.style.boxShadow = '0 6px 16px -2px rgba(27, 79, 223, 0.35)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = COLORS.primary;
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 4px 12px -2px rgba(27, 79, 223, 0.25)';
            }}
          >
            <Home size={17} style={{ marginRight: 8 }} />
            {isEmployer ? 'Back to Dashboard' : 'Home Page'}
          </button>
        </div>
      </div>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  container: {
    minHeight: '75vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '32px 20px 48px',
    backgroundColor: '#FFFFFF',
    fontFamily: 'Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    boxSizing: 'border-box',
  },
  contentWrap: {
    maxWidth: 540,
    width: '100%',
    textAlign: 'center',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  imageWrap: {
    width: '100%',
    maxWidth: 420,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  characterImage: {
    width: '100%',
    height: 'auto',
    maxHeight: 320,
    objectFit: 'contain',
    display: 'block',
  },
  title: {
    fontSize: '32px',
    fontWeight: 700,
    color: '#0F172A',
    margin: '12px 0 10px 0',
    letterSpacing: '-0.025em',
    lineHeight: 1.25,
  },
  subtitle: {
    fontSize: '15px',
    color: '#64748B',
    lineHeight: 1.6,
    maxWidth: 440,
    margin: '0 0 28px 0',
    fontWeight: 400,
  },
  btnWrap: {
    display: 'flex',
    justifyContent: 'center',
    width: '100%',
  },
  primaryButton: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
    color: '#FFFFFF',
    border: 'none',
    borderRadius: '9999px',
    padding: '12px 36px',
    fontSize: '15px',
    fontWeight: 600,
    cursor: 'pointer',
    boxShadow: '0 4px 12px -2px rgba(27, 79, 223, 0.25)',
    transition: 'all 0.2s ease',
    outline: 'none',
  },
};
