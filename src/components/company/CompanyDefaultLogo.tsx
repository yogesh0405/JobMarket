import React from 'react';

interface CompanyDefaultLogoProps {
  logoUrl?: string;
  companyName?: string;
  size?: number;
  borderRadius?: string;
}

export const CompanyDefaultLogo: React.FC<CompanyDefaultLogoProps> = ({
  logoUrl,
  companyName = 'Company',
  size = 28,
  borderRadius = '6px'
}) => {
  const isValidImage = Boolean(
    logoUrl && 
    (logoUrl.startsWith('http://') || logoUrl.startsWith('https://') || logoUrl.startsWith('data:image'))
  );

  if (isValidImage) {
    return (
      <div style={{
        width: `${size}px`,
        height: `${size}px`,
        borderRadius,
        overflow: 'hidden',
        border: '1px solid rgba(0,0,0,0.08)',
        flexShrink: 0,
        background: '#ffffff'
      }}>
        <img
          src={logoUrl}
          alt={companyName}
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          onError={(e) => {
            e.currentTarget.style.display = 'none';
          }}
        />
      </div>
    );
  }

  const iconSize = Math.max(14, Math.round(size * 0.58));

  return (
    <div style={{
      width: `${size}px`,
      height: `${size}px`,
      borderRadius,
      background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
      color: '#ffffff',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexShrink: 0,
      boxShadow: '0 2px 6px rgba(37, 99, 235, 0.25)'
    }}>
      <svg
        width={iconSize}
        height={iconSize}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        style={{ opacity: 0.95 }}
      >
        <rect x="4" y="2" width="16" height="20" rx="2" ry="2" />
        <path d="M9 22v-4h6v4" />
        <line x1="8" y1="6" x2="8.01" y2="6" strokeWidth="2.5" />
        <line x1="12" y1="6" x2="12.01" y2="6" strokeWidth="2.5" />
        <line x1="16" y1="6" x2="16.01" y2="6" strokeWidth="2.5" />
        <line x1="8" y1="10" x2="8.01" y2="10" strokeWidth="2.5" />
        <line x1="12" y1="10" x2="12.01" y2="10" strokeWidth="2.5" />
        <line x1="16" y1="10" x2="16.01" y2="10" strokeWidth="2.5" />
        <line x1="8" y1="14" x2="8.01" y2="14" strokeWidth="2.5" />
        <line x1="12" y1="14" x2="12.01" y2="14" strokeWidth="2.5" />
        <line x1="16" y1="14" x2="16.01" y2="14" strokeWidth="2.5" />
      </svg>
    </div>
  );
};
export default CompanyDefaultLogo;
