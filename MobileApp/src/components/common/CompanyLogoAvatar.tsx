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

  const resolvedUrl = getCompanyLogoUrl(companyName, logoUrl || undefined);

  const cleanUrl =
    resolvedUrl &&
    typeof resolvedUrl === 'string' &&
    resolvedUrl.trim().length > 5 &&
    !resolvedUrl.startsWith('data:image/svg+xml') &&
    (
      resolvedUrl.startsWith('http://') ||
      resolvedUrl.startsWith('https://') ||
      resolvedUrl.startsWith('file://') ||
      resolvedUrl.startsWith('content://') ||
      resolvedUrl.startsWith('ph://') ||
      resolvedUrl.startsWith('data:image/') ||
      resolvedUrl.startsWith('blob:')
    )
      ? resolvedUrl.trim()
      : null;

  if (cleanUrl && !imageError) {
    return (
      <View style={[styles.imageContainer, { width: size, height: size, borderRadius }, style]}>
        <Image
          source={{ uri: cleanUrl }}
          style={styles.logoImage}
          resizeMode="cover"
          onError={() => setImageError(true)}
        />
      </View>
    );
  }

  const normName = companyName && companyName.trim() ? companyName.trim() : '';
  const initialLetters = normName
    ? normName
        .split(' ')
        .filter(Boolean)
        .map((word) => word[0])
        .slice(0, 2)
        .join('')
        .toUpperCase()
    : '';

  if (initialLetters) {
    const palette = BRAND_PALETTES[hashString(normName) % BRAND_PALETTES.length];
    const fontSize = Math.max(11, Math.floor(size * (initialLetters.length > 1 ? 0.36 : 0.44)));
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
          },
          style,
        ]}
      >
        <Text style={[styles.initialText, { fontSize, color: palette.text }]}>
          {initialLetters}
        </Text>
      </View>
    );
  }

  // Fallback icon for un-named companies
  const iconSize = Math.max(16, Math.floor(size * 0.5));

  return (
    <View style={[styles.defaultBadge, { width: size, height: size, borderRadius }, style]}>
      <Building2 size={iconSize} color={COLORS.primary} strokeWidth={2.2} />
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
