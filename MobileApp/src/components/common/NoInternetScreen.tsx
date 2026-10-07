import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  StatusBar,
  ScrollView,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, {
  G,
  Circle,
  Rect,
  Path,
  Defs,
  LinearGradient,
  Stop,
} from 'react-native-svg';
import * as Haptics from 'expo-haptics';
import { WifiOff, RefreshCw, AlertCircle } from 'lucide-react-native';
import { useNetwork } from '../../context/NetworkContext';
import { COLORS } from '../../constants/theme';
import { JobMarketLogoSvg } from './JobMarketLogoSvg';

/**
 * Modern, enterprise-standard vector illustration tailored for JobMarket theme.
 * Features a circular halo backdrop, stylized mobile device with disconnected
 * signal indicators, and a wireless cloud with lightning accent.
 */
const NoConnectionGraphic: React.FC<{ size?: number }> = ({ size = 200 }) => {
  return (
    <Svg width={size} height={size} viewBox="0 0 220 220" fill="none">
      <Defs>
        <LinearGradient id="haloGrad" x1="0" y1="0" x2="220" y2="220">
          <Stop offset="0%" stopColor="#EFF6FF" stopOpacity="1" />
          <Stop offset="100%" stopColor="#DBEAFE" stopOpacity="0.6" />
        </LinearGradient>
        <LinearGradient id="cloudGrad" x1="0" y1="0" x2="1" y2="1">
          <Stop offset="0%" stopColor="#F59E0B" />
          <Stop offset="100%" stopColor="#D97706" />
        </LinearGradient>
        <LinearGradient id="primaryGrad" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0%" stopColor="#1B4FDF" />
          <Stop offset="100%" stopColor="#0B3CB8" />
        </LinearGradient>
      </Defs>

      {/* 1. Backdrop Subtle Halo */}
      <Circle cx="110" cy="110" r="88" fill="url(#haloGrad)" />
      <Circle
        cx="110"
        cy="110"
        r="88"
        stroke="#BFDBFE"
        strokeWidth="1"
        strokeDasharray="4 4"
      />

      {/* 2. Abstract Geometric Ground / Base Accent */}
      <Path
        d="M 54 160 L 80 142 L 102 160 Z"
        fill="#EF4444"
        opacity="0.9"
      />
      <Path
        d="M 122 160 L 148 138 L 172 160 Z"
        fill="#1B4FDF"
        opacity="0.9"
      />

      {/* 3. Central Smartphone Device */}
      <G>
        {/* Device Shadow & Frame */}
        <Rect
          x="78"
          y="62"
          width="64"
          height="102"
          rx="10"
          fill="#FFFFFF"
          stroke="#CBD5E1"
          strokeWidth="2"
        />

        {/* Screen Bezel Area */}
        <Rect
          x="83"
          y="72"
          width="54"
          height="82"
          rx="5"
          fill="#F8FAFC"
        />

        {/* Top Speaker Ear-piece */}
        <Rect
          x="101"
          y="66.5"
          width="18"
          height="2.5"
          rx="1.25"
          fill="#94A3B8"
        />

        {/* Signal Bars Indicator on Screen */}
        {/* Bar 1 (Lowest - Active Alert Red) */}
        <Rect
          x="92"
          y="126"
          width="4"
          height="8"
          rx="1"
          fill="#EF4444"
        />
        {/* Bar 2 (Empty / Inactive Slate) */}
        <Rect
          x="99"
          y="120"
          width="4"
          height="14"
          rx="1"
          fill="#CBD5E1"
        />
        {/* Bar 3 (Empty / Inactive Slate) */}
        <Rect
          x="106"
          y="114"
          width="4"
          height="20"
          rx="1"
          fill="#CBD5E1"
        />
        {/* Bar 4 (Empty / Inactive Slate) */}
        <Rect
          x="113"
          y="108"
          width="4"
          height="26"
          rx="1"
          fill="#CBD5E1"
        />
        {/* Bar 5 (Empty / Inactive Slate) */}
        <Rect
          x="120"
          y="102"
          width="4"
          height="32"
          rx="1"
          fill="#CBD5E1"
        />

        {/* Disconnect Warning Dot */}
        <Circle cx="94" cy="139" r="2.5" fill="#EF4444" />
      </G>

      {/* 4. Weather / Network Storm Cloud with Lightning Accent */}
      <G>
        {/* Cloud Body */}
        <Path
          d="M 96 46 C 96 39.5 101.5 34 108 34 C 113.8 34 118.6 38.2 119.7 43.8 C 121.2 43 122.9 42.5 124.7 42.5 C 130.4 42.5 135 47.1 135 52.8 C 135 53.4 134.9 54 134.8 54.6 C 137.8 56.1 140 59.3 140 63 C 140 67.4 136.4 71 132 71 L 96 71 C 90.5 71 86 66.5 86 61 C 86 56.1 89.5 52.1 94.2 51.2 C 94.1 50.5 94 49.7 94 49 C 94 47.3 94.5 45.7 95.3 44.3 C 95.7 44.9 96.2 45.4 96.7 45.8"
          fill="url(#cloudGrad)"
        />

        {/* Dynamic Lightning Bolt Accent */}
        <Path
          d="M 112 59 L 107 68 L 111.5 68 L 108 77 L 118 67 L 113.5 67 Z"
          fill="#DC2626"
        />

        {/* Soft Rain Droplets */}
        <Path
          d="M 96 75 L 94 80 M 104 76 L 102 81 M 122 75 L 120 80 M 130 76 L 128 81"
          stroke="#F59E0B"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
      </G>
    </Svg>
  );
};

export const NoInternetScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const { isOffline, retryConnection, isChecking } = useNetwork();
  const [localChecking, setLocalChecking] = useState(false);

  // When internet connection is active, this screen disappears automatically
  if (!isOffline) {
    return null;
  }

  const handleRetry = async () => {
    if (isChecking || localChecking) return;
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch (_) {}

    setLocalChecking(true);
    try {
      await retryConnection();
    } finally {
      setTimeout(() => {
        setLocalChecking(false);
      }, 500);
    }
  };

  const isPending = isChecking || localChecking;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" translucent={false} />

      {/* Top Standard Header */}
      <View
        style={[
          styles.topHeader,
          {
            paddingTop:
              Platform.OS === 'android'
                ? Math.max((StatusBar.currentHeight || 0) + 8, insets.top + 8, 20)
                : Math.max(insets.top + 8, 16),
          },
        ]}
      >
        <View style={styles.brandRow}>
          <JobMarketLogoSvg size={26} />
          <Text style={styles.brandText}>JobMarket</Text>
        </View>

        <View style={styles.statusBadge}>
          <View style={styles.statusDot} />
          <Text style={styles.statusBadgeText}>No Connection</Text>
        </View>
      </View>

      {/* Main Section Divider adhering to AGENTS.md rule */}
      <View style={styles.sectionDivider} />

      {/* Full-Screen Centered Content */}
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: Math.max(insets.bottom + 20, 24) },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.illustrationWrapper}>
          <NoConnectionGraphic size={190} />
        </View>

        {/* Primary Screen Title */}
        <Text style={styles.mainTitle}>No connection</Text>

        {/* Secondary Subtitle */}
        <Text style={styles.mainSubtitle}>
          Please check your internet connectivity and try again
        </Text>

        {/* Primary Action CTA — Retry Button (Strictly Blue, square corners, 48dp touch target) */}
        <TouchableOpacity
          activeOpacity={0.85}
          style={[styles.retryButton, isPending && styles.retryButtonDisabled]}
          onPress={handleRetry}
          disabled={isPending}
        >
          {isPending ? (
            <View style={styles.buttonContent}>
              <ActivityIndicator size="small" color="#FFFFFF" />
              <Text style={styles.retryButtonText}>Connecting...</Text>
            </View>
          ) : (
            <View style={styles.buttonContent}>
              <RefreshCw size={15} color="#FFFFFF" strokeWidth={2.4} />
              <Text style={styles.retryButtonText}>Retry</Text>
            </View>
          )}
        </TouchableOpacity>

        {/* Guidance Single Container Card adhering to AGENTS.md rule (No nested cards, square corners) */}
        <View style={styles.guideCard}>
          <View style={styles.guideHeaderRow}>
            <AlertCircle size={14} color="#64748B" />
            <Text style={styles.guideHeaderText}>Quick Troubleshooting</Text>
          </View>
          <View style={styles.guideDivider} />
          <Text style={styles.guideItemText}>
            • Verify Wi-Fi or Mobile Data is turned on
          </Text>
          <Text style={styles.guideItemText}>
            • Toggle Airplane mode off and on
          </Text>
          <Text style={styles.guideItemText}>
            • The screen will clear automatically once reconnected
          </Text>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#FFFFFF',
    zIndex: 99998,
  },
  topHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 10,
    backgroundColor: '#FFFFFF',
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  brandText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: -0.3,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#FEF2F2',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#DC2626',
  },
  statusBadgeText: {
    fontSize: 10.5,
    fontWeight: '700',
    color: '#DC2626',
    textTransform: 'uppercase',
  },
  sectionDivider: {
    height: 1,
    backgroundColor: '#94A3B8',
    marginVertical: 6,
  },
  scrollContent: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingTop: 16,
  },
  illustrationWrapper: {
    marginBottom: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mainTitle: {
    fontSize: 21,
    fontWeight: '700',
    color: '#0F172A',
    textAlign: 'center',
    letterSpacing: -0.3,
    marginBottom: 8,
  },
  mainSubtitle: {
    fontSize: 13.5,
    fontWeight: '400',
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 20,
    maxWidth: 290,
    marginBottom: 26,
  },
  retryButton: {
    backgroundColor: COLORS.primary, // Strictly Blue
    borderRadius: 0, // Square corners per AGENTS.md rule
    minHeight: 48, // Minimum touch target 44-48dp
    minWidth: 160,
    paddingHorizontal: 32,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 3,
    elevation: 2,
  },
  retryButtonDisabled: {
    opacity: 0.75,
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  guideCard: {
    width: '100%',
    maxWidth: 340,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 0, // Square corners per AGENTS.md rule
    padding: 14,
    marginTop: 36,
  },
  guideHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  guideHeaderText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#475569',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  guideDivider: {
    height: 1,
    backgroundColor: '#E2E8F0',
    marginVertical: 8,
  },
  guideItemText: {
    fontSize: 11.5,
    color: '#64748B',
    lineHeight: 18,
    marginVertical: 1.5,
  },
});

export default NoInternetScreen;
