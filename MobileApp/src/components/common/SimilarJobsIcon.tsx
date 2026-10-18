import React from 'react';
import Svg, { Rect, Path } from 'react-native-svg';

interface SimilarJobsIconProps {
  size?: number;
  color?: string;
  strokeWidth?: number;
}

export const SimilarJobsIcon: React.FC<SimilarJobsIconProps> = ({
  size = 18,
  color = '#000000',
  strokeWidth = 2,
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    {/* Left card wing */}
    <Path
      d="M7.5 5.5H4.5C3.12 5.5 2 6.62 2 8V16C2 17.38 3.12 18.5 4.5 18.5H7.5"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    {/* Right card wing */}
    <Path
      d="M16.5 5.5H19.5C20.88 5.5 22 6.62 22 8V16C22 17.38 20.88 18.5 19.5 18.5H16.5"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    {/* Center card */}
    <Rect
      x="7.5"
      y="2"
      width="9"
      height="20"
      rx="3.5"
      stroke={color}
      strokeWidth={strokeWidth}
      fill="#FFFFFF"
    />
  </Svg>
);
