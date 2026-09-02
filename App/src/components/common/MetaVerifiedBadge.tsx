import React from 'react';

interface MetaVerifiedBadgeProps {
  size?: number;
  color?: string;
  style?: React.CSSProperties;
  className?: string;
  title?: string;
}

export const MetaVerifiedBadge: React.FC<MetaVerifiedBadgeProps> = ({
  size = 18,
  color = '#0095F6',
  style,
  className,
  title = 'Verified Profile',
}) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ display: 'inline-block', verticalAlign: 'middle', flexShrink: 0, ...style }}
      className={className}
      title={title}
    >
      {/* Meta / Instagram Verified Rosette Starburst */}
      <path
        d="M22.25 12c0-1.43-.88-2.67-2.19-3.23.16-.44.25-.92.25-1.42 0-2.21-1.79-4-4-4-.5 0-.98.09-1.42.25C14.33 2.29 13.09 1.41 11.66 1.41c-1.43 0-2.67.88-3.23 2.19-.44-.16-.92-.25-1.42-.25-2.21 0-4 1.79-4 4 0 .5.09.98.25 1.42C1.95 9.33 1.07 10.57 1.07 12c0 1.43.88 2.67 2.19 3.23-.16.44-.25.92-.25 1.42 0 2.21 1.79 4 4 4 .5 0 .98-.09 1.42-.25.56 1.31 1.8 2.19 3.23 2.19 1.43 0 2.67-.88 3.23-2.19.44.16.92.25 1.42.25 2.21 0 4-1.79 4-4 0-.5-.09-.98-.25-1.42 1.31-.56 2.19-1.8 2.19-3.23z"
        fill={color}
      />
      {/* Crisp White Centered Checkmark */}
      <path
        d="M10.09 15.65 6.35 11.91l1.41-1.41 2.33 2.33 6.16-6.16 1.41 1.41-7.57 7.57z"
        fill="#FFFFFF"
      />
    </svg>
  );
};
