import React from 'react';

export interface BannerPreviewAdData {
  title?: string;
  description?: string | null;
  banner_image?: string | null;
  advertisement_type?: string | null;
  button_text?: string | null;
  company_name?: string | null;
  employer_name?: string | null;
}

interface BannerPreviewThumbnailProps {
  ad: BannerPreviewAdData;
  width?: string | number;
  height?: string | number;
  borderRadius?: string | number;
  onClick?: () => void;
  style?: React.CSSProperties;
  className?: string;
  showHoverEffect?: boolean;
}

export const BannerPreviewThumbnail: React.FC<BannerPreviewThumbnailProps> = ({
  ad,
  width = '140px',
  height = '70px',
  borderRadius = '8px',
  onClick,
  style,
  className,
  showHoverEffect = true
}) => {
  const [imageError, setImageError] = React.useState(false);

  const rawUri = ad.banner_image?.trim();
  const validUri =
    !imageError && rawUri && rawUri.length > 5
      ? rawUri
      : 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=800&q=80';

  const badgeText = (ad.advertisement_type || 'PROMOTIONAL').replace(/_/g, ' ');
  const titleText = ad.title || 'Untitled Banner';
  const descText = ad.description || (ad.company_name ? `${ad.company_name} hiring drive` : 'Industrial job opening & spot interview');
  const btnText = ad.button_text || 'Apply Now';

  // Determine if this is a compact thumbnail or a larger preview
  const numHeight = typeof height === 'number' ? height : parseInt(String(height), 10) || 70;
  const isCompact = numHeight <= 85;

  return (
    <div
      onClick={onClick}
      className={className}
      style={{
        width,
        height,
        borderRadius,
        position: 'relative',
        overflow: 'hidden',
        background: '#0F172A',
        border: '1px solid #CBD5E1',
        boxShadow: '0 1px 3px rgba(15, 23, 42, 0.08)',
        cursor: onClick ? 'pointer' : 'default',
        flexShrink: 0,
        userSelect: 'none',
        boxSizing: 'border-box',
        transition: showHoverEffect ? 'transform 0.15s ease, box-shadow 0.15s ease' : 'none',
        ...style
      }}
      title={`${titleText} - Click to view`}
    >
      {/* Background Image */}
      <img
        src={validUri}
        alt={titleText}
        onError={() => setImageError(true)}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          display: 'block'
        }}
      />

      {/* Dark Gradient Overlay matching Live Homepage Banner Slider */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(90deg, rgba(15, 23, 42, 0.94) 0%, rgba(15, 23, 42, 0.72) 65%, rgba(15, 23, 42, 0.28) 100%)',
          zIndex: 1
        }}
      />

      {/* Content Composition (Type Badge, Title, Description, CTA Button) */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          zIndex: 2,
          padding: isCompact ? '4px 6px' : '8px 12px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          boxSizing: 'border-box',
          pointerEvents: 'none'
        }}
      >
        {/* Top Header: Badge + Title + Description */}
        <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
          {/* Orange Type Badge */}
          <div
            style={{
              background: '#F97316',
              color: '#FFFFFF',
              fontSize: isCompact ? '6.5px' : '9px',
              fontWeight: '800',
              textTransform: 'uppercase',
              letterSpacing: '0.3px',
              padding: isCompact ? '1px 3.5px' : '2px 6px',
              borderRadius: '2px',
              lineHeight: '1.2',
              width: 'fit-content',
              maxWidth: '92%',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              marginBottom: isCompact ? '1px' : '3px'
            }}
          >
            {badgeText}
          </div>

          {/* Title */}
          <div
            style={{
              fontSize: isCompact ? '8.5px' : '12.5px',
              fontWeight: '800',
              color: '#FFFFFF',
              lineHeight: '1.15',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              textShadow: '0 1px 2px rgba(0, 0, 0, 0.85)',
              letterSpacing: '-0.1px'
            }}
          >
            {titleText}
          </div>

          {/* Description Snippet */}
          <div
            style={{
              fontSize: isCompact ? '6.8px' : '10px',
              color: 'rgba(241, 245, 249, 0.92)',
              lineHeight: '1.1',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              textShadow: '0 1px 2px rgba(0, 0, 0, 0.85)',
              marginTop: isCompact ? '0.5px' : '2px'
            }}
          >
            {descText}
          </div>
        </div>

        {/* Bottom CTA Button */}
        <div style={{ display: 'flex', alignItems: 'center', marginTop: isCompact ? '1px' : '4px' }}>
          <div
            style={{
              background: '#2563EB',
              color: '#FFFFFF',
              padding: isCompact ? '1.5px 5px' : '3px 8px',
              borderRadius: isCompact ? '2.5px' : '4px',
              fontSize: isCompact ? '6.8px' : '9.5px',
              fontWeight: '800',
              display: 'inline-flex',
              alignItems: 'center',
              gap: isCompact ? '2.5px' : '4px',
              lineHeight: '1.15',
              boxShadow: '0 1px 3px rgba(0, 0, 0, 0.3)',
              width: 'fit-content',
              maxWidth: '100%',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap'
            }}
          >
            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {btnText}
            </span>
            <svg
              width={isCompact ? '6' : '9'}
              height={isCompact ? '6' : '9'}
              viewBox="0 0 24 24"
              fill="none"
              stroke="#FFFFFF"
              strokeWidth="2.8"
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{ flexShrink: 0 }}
            >
              <line x1="5" y1="12" x2="19" y2="12" />
              <polyline points="12 5 19 12 12 19" />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
};
