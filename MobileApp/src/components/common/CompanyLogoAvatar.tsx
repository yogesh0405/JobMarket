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

  React.useEffect(() => {
    setImageError(false);
  }, [logoUrl]);

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

  const palette = normName
    ? BRAND_PALETTES[hashString(normName) % BRAND_PALETTES.length]
    : { bg: '#EFF6FF', border: '#BFDBFE', text: COLORS.primary || '#1D4ED8' };

  const fontSize = Math.max(11, Math.floor(size * (initialLetters.length > 1 ? 0.36 : 0.44)));

  // If explicit logoUrl / avatarUrl is provided, use it directly!
  const directUrl =
    logoUrl &&
    typeof logoUrl === 'string' &&
    logoUrl.trim().length > 5 &&
    !logoUrl.includes('null') &&
    !logoUrl.includes('undefined')
      ? logoUrl.trim()
      : null;

  const rawUrl = directUrl || (normName ? getCompanyLogoUrl(normName, undefined) : null);

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
      {initialLetters ? (
        <Text style={[styles.initialText, { fontSize, color: palette.text }]}>
          {initialLetters}
        </Text>
      ) : (
        <Building2
          size={Math.max(16, Math.round(size * 0.52))}
          color={COLORS.primary || '#1D4ED8'}
          strokeWidth={2.2}
        />
      )}

      {cleanUrl ? (
        <View style={[StyleSheet.absoluteFill, { backgroundColor: '#FFFFFF', alignItems: 'center', justifyContent: 'center' }]}>
          <Image
            source={{ uri: cleanUrl }}
            style={{ width: '92%', height: '92%', borderRadius: Math.max(0, borderRadius - 2) }}
            resizeMode="contain"
            onError={() => setImageError(true)}
          />
        </View>
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
