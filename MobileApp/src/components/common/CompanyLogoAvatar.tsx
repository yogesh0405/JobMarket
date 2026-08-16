import { COLORS } from '../../constants/theme';
import React, { useState } from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import { Building2 } from 'lucide-react-native';
import { getCompanyLogoUrl } from '../../utils/companyLogos';

interface Props {
  logoUrl?: string | null;
  companyName?: string;
  size?: number;
  borderRadius?: number;
  style?: any;
}

const BRAND_PALETTES = [
  { bg: '#EFF6FF', border: '#BFDBFE', text: '#1D4ED8' },
  { bg: '#ECFDF5', border: '#A7F3D0', text: '#047857' },
  { bg: '#FEF3C7', border: '#FDE68A', text: '#B45309' },
  { bg: '#F3E8FF', border: '#DDD6FE', text: '#6D28D9' },
  { bg: '#FEE2E2', border: '#FECACA', text: '#B91C1C' },
  { bg: '#E0F2FE', border: '#BAE6FD', text: '#0369A1' },
];

function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  return Math.abs(hash);
}

export function CompanyLogoAvatar({
  logoUrl,
  companyName,
  size = 40,
  borderRadius = 8,
  style,
}: Props) {
  const [imageError, setImageError] = useState(false);

  const normName = companyName && companyName.trim() ? companyName.trim() : '';
  const initialLetters = normName
    ? normName
        .split(' ')
        .filter(Boolean)
        .map((word) => word[0])
        .slice(0, 2)
        .join('')
        .toUpperCase()
    : 'JM';

  const palette = BRAND_PALETTES[hashString(normName || 'default') % BRAND_PALETTES.length];
  const fontSize = Math.max(11, Math.floor(size * (initialLetters.length > 1 ? 0.36 : 0.44)));

  const rawUrl = getCompanyLogoUrl(normName, logoUrl || undefined);

  const cleanUrl =
    !imageError &&
    rawUrl &&
    typeof rawUrl === 'string' &&
    rawUrl.trim().length > 5 &&
    (
      rawUrl.startsWith('http://') ||
      rawUrl.startsWith('https://') ||
      rawUrl.startsWith('data:image/') ||
      rawUrl.startsWith('file://') ||
      rawUrl.startsWith('content://')
    )
      ? rawUrl.trim()
      : null;

  return (
    <View
      style={[
        styles.initialBadge,
        {
          width: size,
          height: size,
          borderRadius,
          backgroundColor: palette.bg,
          borderColor: palette.border,
          position: 'relative',
          overflow: 'hidden',
        },
        style,
      ]}
    >
      <Text style={[styles.initialText, { fontSize, color: palette.text }]}>
        {initialLetters}
      </Text>

      {cleanUrl ? (
        <Image
          source={{ uri: cleanUrl }}
          style={[
            StyleSheet.absoluteFill,
            { width: '100%', height: '100%', borderRadius },
          ]}
          resizeMode="cover"
          onError={() => setImageError(true)}
        />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  imageContainer: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  logoImage: {
    width: '100%',
    height: '100%',
  },
  initialBadge: {
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  initialText: {
    fontWeight: '900',
  },
  defaultBadge: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 1,
  },
});
