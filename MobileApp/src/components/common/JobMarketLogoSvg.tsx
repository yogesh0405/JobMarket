import React from 'react';
import Svg, { G, Path, Circle, Rect } from 'react-native-svg';

interface JobMarketLogoSvgProps {
  size?: number;
  width?: number;
  height?: number;
}

export const JobMarketLogoSvg: React.FC<JobMarketLogoSvgProps> = ({
  size = 96,
  width,
  height,
}) => {
  const logoWidth = width || size;
  const logoHeight = height || size;

  return (
    <Svg
      width={logoWidth}
      height={logoHeight}
      viewBox="0 0 300 300"
      fill="none"
    >
      <G>
        {/* 1. Solid Broad Dark Navy Shield Frame (Hollow Center / 100% Transparent Inner) */}
        <Path
          d="M 150 20 L 255 58 V 140 C 255 208 202 258 150 282 C 98 258 45 208 45 140 V 58 L 150 20 Z M 150 42 L 68 71 V 136 C 68 192 112 236 150 256 C 188 236 232 192 232 136 V 71 L 150 42 Z"
          fill="#032B69"
          fillRule="evenodd"
        />

        {/* 2. Three Solid Navy Human Silhouettes */}
        {/* Left Short Person */}
        <Circle cx="106" cy="132" r="11" fill="#032B69" />
        <Rect x="95" y="146" width="22" height="52" rx="11" fill="#032B69" />

        {/* Middle Medium Person */}
        <Circle cx="146" cy="110" r="12.5" fill="#032B69" />
        <Rect x="133" y="125" width="26" height="71" rx="13" fill="#032B69" />

        {/* Right Tall Person */}
        <Circle cx="190" cy="88" r="14" fill="#032B69" />
        <Rect x="176" y="105" width="28" height="75" rx="14" fill="#032B69" />

        {/* 3. Broad Teal Checkmark Left Arm */}
        <Path
          d="M 70 170 C 82 195 108 245 140 248 L 140 206 C 115 206 90 180 70 170 Z"
          fill="#00A3A0"
        />

        {/* 4. Broad Solid Blue Arrow Shooting Up-Right (100% Transparent Background) */}
        <Path
          d="M 140 248 C 172 230 220 160 268 90 L 238 116 L 275 82 L 255 125 L 244 105 C 205 155 165 206 140 206 Z"
          fill="#0066C2"
        />
      </G>
    </Svg>
  );
};
