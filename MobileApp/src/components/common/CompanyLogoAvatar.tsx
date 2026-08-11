import React, { useState } from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import { Building2 } from 'lucide-react-native';

interface Props {
  logoUrl?: string | null;
  companyName?: string;
  size?: number;
  borderRadius?: number;
  style?: any;
}

export function CompanyLogoAvatar({
  logoUrl,
  companyName,
  size = 40,
  borderRadius = 8,
  style,
}: Props) {
  const [imageError, setImageError] = useState(false);

  const cleanUrl =
    typeof logoUrl === 'string' &&
    logoUrl.trim().length > 5 &&
    !logoUrl.startsWith('data:image/svg+xml') &&
    (
      logoUrl.startsWith('http://') ||
      logoUrl.startsWith('https://') ||
      logoUrl.startsWith('file://') ||
      logoUrl.startsWith('content://') ||
      logoUrl.startsWith('ph://') ||
      logoUrl.startsWith('data:image/')
    )
      ? logoUrl.trim()
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

  const initialLetter =
    typeof companyName === 'string' && companyName.trim().length > 0
      ? companyName.trim().charAt(0).toUpperCase()
      : null;

  if (initialLetter) {
    const fontSize = Math.max(12, Math.floor(size * 0.42));
    return (
      <View style={[styles.initialBadge, { width: size, height: size, borderRadius }, style]}>
        <Text style={[styles.initialText, { fontSize }]}>{initialLetter}</Text>
      </View>
    );
  }

  // High-Grade Professional Corporate / Industrial Default Badge
  const iconSize = Math.max(16, Math.floor(size * 0.5));

  return (
    <View style={[styles.defaultBadge, { width: size, height: size, borderRadius }, style]}>
      <Building2 size={iconSize} color="#2563EB" strokeWidth={2.2} />
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
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#BFDBFE',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  initialText: {
    fontWeight: '800',
    color: '#2563EB',
  },
  defaultBadge: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 1,
  },
});
