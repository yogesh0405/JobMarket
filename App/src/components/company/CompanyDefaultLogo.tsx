import React from 'react';
import { getCompanyLogo } from '../../utils/companyLogos';

interface CompanyDefaultLogoProps {
  logoUrl?: string | null;
  companyName?: string;
  size?: number;
  borderRadius?: string;
  companyColor?: string;
}

export const CompanyDefaultLogo: React.FC<CompanyDefaultLogoProps> = ({
  logoUrl,
  companyName = 'Company',
  size = 28,
  borderRadius = '50%',
  companyColor
}) => {
  const [imgError, setImgError] = React.useState(false);

  // Check if logoUrl is a valid http / data URI string (not single character like 'T' or 'B')
  const isExternalUrl = Boolean(
    logoUrl &&
    logoUrl.length > 5 &&
    (logoUrl.startsWith('http://') || logoUrl.startsWith('https://') || logoUrl.startsWith('data:image'))
  );

  const isValidImage = isExternalUrl && !imgError;

  if (isValidImage && logoUrl) {
    return (
      <div style={{
        width: `${size}px`,
        height: `${size}px`,
        borderRadius,
        overflow: 'hidden',
        border: '1px solid rgba(0,0,0,0.08)',
        flexShrink: 0,
        background: '#ffffff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <img
          src={logoUrl}
          alt={companyName}
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          onError={() => setImgError(true)}
        />
      </div>
    );
  }

  // Fallback to high-quality SVG corporate vector logo
  const generatedLogoUrl = getCompanyLogo(companyName, companyColor);

  return (
    <div style={{
      width: `${size}px`,
      height: `${size}px`,
      borderRadius,
      overflow: 'hidden',
      flexShrink: 0,
      boxShadow: '0 2px 6px rgba(0, 0, 0, 0.12)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#ffffff'
    }}>
      <img
        src={generatedLogoUrl}
        alt={companyName}
        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
      />
    </div>
  );
};

export default CompanyDefaultLogo;

