import { COLORS } from '../../constants/theme';
import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Dimensions,
  Easing,
  StatusBar,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Briefcase, ShieldCheck } from 'lucide-react-native';
import { JobMarketLogoSvg } from './JobMarketLogoSvg';

interface SplashScreenProps {
  onFinish: () => void;
  isLoadingAuth: boolean;
}

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

export const SplashScreen: React.FC<SplashScreenProps> = ({
  onFinish,
  isLoadingAuth,
}) => {
  // Animation Values
  const rootOpacity = useRef(new Animated.Value(1)).current;
  const logoScale = useRef(new Animated.Value(0.1)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const logoFloat = useRef(new Animated.Value(0)).current;
  const logoRotate = useRef(new Animated.Value(0)).current;

  // Dual Pulsing Concentric Energy Rings
  const ring1Scale = useRef(new Animated.Value(0.4)).current;
  const ring1Opacity = useRef(new Animated.Value(0.8)).current;
  const ring2Scale = useRef(new Animated.Value(0.2)).current;
  const ring2Opacity = useRef(new Animated.Value(0.6)).current;

  // Text & Subtitle Slide
  const textOpacity = useRef(new Animated.Value(0)).current;
  const textTranslateY = useRef(new Animated.Value(24)).current;
  const badgeScale = useRef(new Animated.Value(0)).current;

  // Loading Bar
  const loadingWidth = useRef(new Animated.Value(0.05)).current;
  const loadingOpacity = useRef(new Animated.Value(0.5)).current;

  useEffect(() => {
    // 1. Elastic 3D Spring Pop & Entrance for Logo
    Animated.parallel([
      Animated.timing(logoOpacity, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.spring(logoScale, {
        toValue: 1,
        friction: 5,
        tension: 80,
        useNativeDriver: true,
      }),
    ]).start();

    // 2. Continuous Orbit & Radial Pulse Rings Loop
    const ringAnimation = Animated.loop(
      Animated.parallel([
        // Ring 1 Pulse
        Animated.sequence([
          Animated.parallel([
            Animated.timing(ring1Scale, {
              toValue: 1.8,
              duration: 2000,
              easing: Easing.out(Easing.cubic),
              useNativeDriver: true,
            }),
            Animated.timing(ring1Opacity, {
              toValue: 0,
              duration: 2000,
              easing: Easing.out(Easing.cubic),
              useNativeDriver: true,
            }),
          ]),
          Animated.parallel([
            Animated.timing(ring1Scale, {
              toValue: 0.4,
              duration: 0,
              useNativeDriver: true,
            }),
            Animated.timing(ring1Opacity, {
              toValue: 0.8,
              duration: 0,
              useNativeDriver: true,
            }),
          ]),
        ]),
        // Ring 2 Pulse (Staggered Offset)
        Animated.sequence([
          Animated.delay(400),
          Animated.parallel([
            Animated.timing(ring2Scale, {
              toValue: 2.2,
              duration: 2000,
              easing: Easing.out(Easing.cubic),
              useNativeDriver: true,
            }),
            Animated.timing(ring2Opacity, {
              toValue: 0,
              duration: 2000,
              easing: Easing.out(Easing.cubic),
              useNativeDriver: true,
            }),
          ]),
          Animated.parallel([
            Animated.timing(ring2Scale, {
              toValue: 0.2,
              duration: 0,
              useNativeDriver: true,
            }),
            Animated.timing(ring2Opacity, {
              toValue: 0.6,
              duration: 0,
              useNativeDriver: true,
            }),
          ]),
        ]),
      ])
    );
    ringAnimation.start();

    // 3. Gentle Floating & Micro Tilt Loop
    const floatAnimation = Animated.loop(
      Animated.sequence([
        Animated.parallel([
          Animated.timing(logoFloat, {
            toValue: -10,
            duration: 1600,
            useNativeDriver: true,
            easing: Easing.inOut(Easing.quad),
          }),
          Animated.timing(logoRotate, {
            toValue: 1,
            duration: 1600,
            useNativeDriver: true,
            easing: Easing.inOut(Easing.quad),
          }),
        ]),
        Animated.parallel([
          Animated.timing(logoFloat, {
            toValue: 10,
            duration: 1600,
            useNativeDriver: true,
            easing: Easing.inOut(Easing.quad),
          }),
          Animated.timing(logoRotate, {
            toValue: -1,
            duration: 1600,
            useNativeDriver: true,
            easing: Easing.inOut(Easing.quad),
          }),
        ]),
      ])
    );
    floatAnimation.start();

    // 4. Staggered Text & Badge Reveal
    Animated.sequence([
      Animated.delay(350),
      Animated.parallel([
        Animated.timing(textOpacity, {
          toValue: 1,
          duration: 550,
          useNativeDriver: true,
        }),
        Animated.timing(textTranslateY, {
          toValue: 0,
          duration: 550,
          useNativeDriver: true,
          easing: Easing.out(Easing.back(1.2)),
        }),
      ]),
      Animated.spring(badgeScale, {
        toValue: 1,
        friction: 6,
        tension: 100,
        useNativeDriver: true,
      }),
    ]).start();

    // 5. Loading Progress Track Animation
    const loadingLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(loadingWidth, {
          toValue: 1,
          duration: 1400,
          useNativeDriver: true,
          easing: Easing.inOut(Easing.quad),
        }),
        Animated.timing(loadingWidth, {
          toValue: 0.05,
          duration: 1400,
          useNativeDriver: true,
          easing: Easing.inOut(Easing.quad),
        }),
      ])
    );
    loadingLoop.start();

    // 6. Dismiss Splash sequence
    let timer: any;
    if (!isLoadingAuth) {
      timer = setTimeout(() => {
        Animated.timing(rootOpacity, {
          toValue: 0,
          duration: 500,
          useNativeDriver: true,
          easing: Easing.in(Easing.quad),
        }).start(() => {
          onFinish();
        });
      }, 4000);
    }

    return () => {
      if (timer) clearTimeout(timer);
      ringAnimation.stop();
      floatAnimation.stop();
      loadingLoop.stop();
    };
  }, [isLoadingAuth, onFinish]);

  const spinRotation = logoRotate.interpolate({
    inputRange: [-1, 1],
    outputRange: ['-3deg', '3deg'],
  });

  return (
    <Animated.View style={[styles.container, { opacity: rootOpacity }]}>
      <StatusBar barStyle="dark-content" backgroundColor="#F8FAFC" translucent />

      {/* Decorative Ambient Background Gradients */}
      <View style={styles.bgWrapper} pointerEvents="none">
        <LinearGradient
          colors={['#EFF6FF', '#DBEAFE', '#F8FAFC']}
          style={StyleSheet.absoluteFill}
        />
        <View style={[styles.bgCircle, styles.bgCircle1]} />
        <View style={[styles.bgCircle, styles.bgCircle2]} />
      </View>

      {/* Center Branding Animation Suite */}
      <View style={styles.centerContent}>
        {/* Pulsing Concentric Energy Ring 1 */}
        <Animated.View
          style={[
            styles.pulseRing,
            styles.pulseRing1,
            {
              transform: [{ scale: ring1Scale }],
              opacity: ring1Opacity,
            },
          ]}
        />

        {/* Pulsing Concentric Energy Ring 2 */}
        <Animated.View
          style={[
            styles.pulseRing,
            styles.pulseRing2,
            {
              transform: [{ scale: ring2Scale }],
              opacity: ring2Opacity,
            },
          ]}
        />

        {/* 3D Animated Logo Emblem */}
        <Animated.View
          style={[
            styles.logoWrapper,
            {
              transform: [
                { scale: logoScale },
                { translateY: logoFloat },
                { rotate: spinRotation },
              ],
              opacity: logoOpacity,
            },
          ]}
        >
          <JobMarketLogoSvg size={118} />
        </Animated.View>

        {/* App Title & Subtitle with Badge */}
        <Animated.View
          style={[
            styles.textContainer,
            {
              opacity: textOpacity,
              transform: [{ translateY: textTranslateY }],
            },
          ]}
        >
          <Text style={styles.appTitle}>JobMarket</Text>

          <View style={styles.subtitleContainer}>
            <Briefcase size={13} color={COLORS.primary} style={styles.subtitleIcon} />
            <Text style={styles.appSubtitle}>Industrial & Factory Jobs</Text>
          </View>

          <Animated.View style={[styles.verifiedPill, { transform: [{ scale: badgeScale }] }]}>
            <ShieldCheck size={12} color="#059669" />
            <Text style={styles.verifiedPillText}>VERIFIED RECRUITMENT PLATFORM</Text>
          </Animated.View>
        </Animated.View>
      </View>

      {/* Footer Progress Indicator */}
      <View style={styles.footerContainer}>
        <View style={styles.loadingTrack}>
          <Animated.View
            style={[
              styles.loadingFill,
              {
                opacity: loadingOpacity,
                transform: [{ scaleX: loadingWidth }],
              },
            ]}
          />
        </View>
        <Text style={styles.footerText}>Direct Employer & Candidate Matching</Text>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFill,
    justifyContent: 'space-between',
    alignItems: 'center',
    zIndex: 9999,
    backgroundColor: '#F8FAFC',
  },
  bgWrapper: {
    ...StyleSheet.absoluteFill,
  },
  bgCircle: {
    position: 'absolute',
    borderRadius: 999,
    opacity: 0.5,
  },
  bgCircle1: {
    width: 320,
    height: 320,
    top: -80,
    left: -100,
    backgroundColor: '#BFDBFE',
  },
  bgCircle2: {
    width: 260,
    height: 260,
    bottom: 60,
    right: -80,
    backgroundColor: '#93C5FD',
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    width: '100%',
  },
  pulseRing: {
    position: 'absolute',
    width: 160,
    height: 160,
    borderRadius: 80,
    borderWidth: 2,
  },
  pulseRing1: {
    borderColor: COLORS.primary,
    backgroundColor: 'rgba(59, 130, 246, 0.08)',
  },
  pulseRing2: {
    borderColor: '#0284C7',
    backgroundColor: 'rgba(2, 132, 199, 0.06)',
  },
  logoWrapper: {
    width: 118,
    height: 118,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#032B69',
    shadowOffset: { width: 0, height: 14 },
    shadowOpacity: 0.35,
    shadowRadius: 20,
    elevation: 16,
  },
  textContainer: {
    alignItems: 'center',
    marginTop: 28,
  },
  appTitle: {
    fontSize: 32,
    fontWeight: '900',
    color: '#0F172A',
    letterSpacing: -0.8,
  },
  subtitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
  },
  subtitleIcon: {
    marginRight: 6,
  },
  appSubtitle: {
    fontSize: 13.5,
    fontWeight: '700',
    color: '#475569',
    letterSpacing: 0.4,
  },
  verifiedPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#ECFDF5',
    borderWidth: 1,
    borderColor: '#A7F3D0',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    marginTop: 14,
  },
  verifiedPillText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#047857',
    letterSpacing: 0.6,
  },
  footerContainer: {
    width: '100%',
    alignItems: 'center',
    paddingBottom: 44,
  },
  loadingTrack: {
    width: 160,
    height: 4,
    backgroundColor: '#E2E8F0',
    borderRadius: 2,
    overflow: 'hidden',
    marginBottom: 14,
  },
  loadingFill: {
    width: '100%',
    height: '100%',
    backgroundColor: COLORS.primary,
    borderRadius: 2,
  },
  footerText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748B',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
});
