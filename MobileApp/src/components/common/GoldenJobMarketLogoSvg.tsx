import React from 'react';
import Svg, { G, Path, Circle, Rect, Defs, LinearGradient as SvgLinearGradient, Stop } from 'react-native-svg';

interface Props {
  size?: number;
  width?: number;
  height?: number;
}

export const GoldenJobMarketLogoSvg: React.FC<Props> = ({
  size = 40,
  width,
  height,
}) => {
  const logoWidth = width || size;
  const logoHeight = height || size;

  return (
    <Svg width={logoWidth} height={logoHeight} viewBox="0 0 300 300" fill="none">
      <Defs>
        <SvgLinearGradient id="goldGradientPrimary" x1="0" y1="0" x2="1" y2="1">
          <Stop offset="0%" stopColor="#FFE58F" />
          <Stop offset="50%" stopColor="#F5A623" />
          <Stop offset="100%" stopColor="#D48806" />
        </SvgLinearGradient>

        <SvgLinearGradient id="goldGradientAccent" x1="0" y1="0" x2="1" y2="0.8">
          <Stop offset="0%" stopColor="#FFF1B8" />
          <Stop offset="60%" stopColor="#FAAD14" />
          <Stop offset="100%" stopColor="#AD6800" />
        </SvgLinearGradient>

        <SvgLinearGradient id="goldGradientDark" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0%" stopColor="#F5A623" />
          <Stop offset="100%" stopColor="#B76E00" />
        </SvgLinearGradient>
      </Defs>

      <G>
        {/* 1. Solid Gold Shield Outer Frame */}
        <Path
          d="M 150 20 L 255 58 V 140 C 255 208 202 258 150 282 C 98 258 45 208 45 140 V 58 L 150 20 Z M 150 42 L 68 71 V 136 C 68 192 112 236 150 256 C 188 236 232 192 232 136 V 71 L 150 42 Z"
          fill="url(#goldGradientPrimary)"
          fillRule="evenodd"
        />

        {/* 2. Three Gold Human Silhouettes */}
        {/* Left Short Person */}
        <Circle cx="106" cy="132" r="11" fill="url(#goldGradientAccent)" />
        <Rect x="95" y="146" width="22" height="52" rx="11" fill="url(#goldGradientAccent)" />

        {/* Middle Medium Person */}
        <Circle cx="146" cy="110" r="12.5" fill="url(#goldGradientPrimary)" />
        <Rect x="133" y="125" width="26" height="71" rx="13" fill="url(#goldGradientPrimary)" />

        {/* Right Tall Person */}
        <Circle cx="190" cy="88" r="14" fill="url(#goldGradientAccent)" />
        <Rect x="176" y="105" width="28" height="75" rx="14" fill="url(#goldGradientAccent)" />

        {/* 3. Gold Checkmark Left Arm */}
        <Path
          d="M 70 170 C 82 195 108 245 140 248 L 140 206 C 115 206 90 180 70 170 Z"
          fill="url(#goldGradientDark)"
        />

        {/* 4. Gold Arrow Shooting Up-Right */}
        <Path
          d="M 140 248 C 172 230 220 160 268 90 L 238 116 L 275 82 L 255 125 L 244 105 C 205 155 165 206 140 206 Z"
          fill="url(#goldGradientPrimary)"
        />
      </G>
    </Svg>
  );
};
