import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Dimensions,
  Image,
  Easing,
  StatusBar,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Briefcase, Building2 } from 'lucide-react-native';
import { COLORS } from '../../constants/theme';

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
  const logoScale = useRef(new Animated.Value(0.9)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const logoFloat = useRef(new Animated.Value(0)).current;
  const glowScale = useRef(new Animated.Value(0.85)).current;
  const glowOpacity = useRef(new Animated.Value(0.2)).current;
  
  const textOpacity = useRef(new Animated.Value(0)).current;
  const textTranslateY = useRef(new Animated.Value(20)).current;
  
  const loadingWidth = useRef(new Animated.Value(0.1)).current;
  const loadingOpacity = useRef(new Animated.Value(0.4)).current;
  
  const bgShape1TranslateY = useRef(new Animated.Value(0)).current;
  const bgShape2TranslateY = useRef(new Animated.Value(0)).current;

  const [imageLoaded, setImageLoaded] = useState(false);

  useEffect(() => {
    // 1. Entrance Animations (Logo and Glow)
    Animated.parallel([
      Animated.timing(logoOpacity, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
        easing: Easing.out(Easing.back(1.5)),
      }),
      Animated.timing(logoScale, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
        easing: Easing.out(Easing.back(1.5)),
      }),
    ]).start();

    // 2. Delayed Text Entrance (after 300ms)
    Animated.sequence([
      Animated.delay(300),
      Animated.parallel([
        Animated.timing(textOpacity, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.timing(textTranslateY, {
          toValue: 0,
          duration: 600,
          useNativeDriver: true,
          easing: Easing.out(Easing.quad),
        }),
      ]),
    ]).start();

    // 3. Continuous Logo Floating Loop
    const floatAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(logoFloat, {
          toValue: -8,
          duration: 1800,
          useNativeDriver: true,
          easing: Easing.inOut(Easing.quad),
        }),
        Animated.timing(logoFloat, {
          toValue: 8,
          duration: 1800,
          useNativeDriver: true,
          easing: Easing.inOut(Easing.quad),
        }),
      ])
    );
    floatAnimation.start();

    // 4. Continuous Background Glow Pulse Loop
    const glowAnimation = Animated.loop(
      Animated.parallel([
        Animated.sequence([
          Animated.timing(glowScale, {
            toValue: 1.15,
            duration: 1500,
            useNativeDriver: true,
            easing: Easing.inOut(Easing.quad),
          }),
          Animated.timing(glowScale, {
            toValue: 0.85,
            duration: 1500,
            useNativeDriver: true,
            easing: Easing.inOut(Easing.quad),
          }),
        ]),
        Animated.sequence([
          Animated.timing(glowOpacity, {
            toValue: 0.55,
            duration: 1500,
            useNativeDriver: true,
            easing: Easing.inOut(Easing.quad),
          }),
          Animated.timing(glowOpacity, {
            toValue: 0.2,
            duration: 1500,
            useNativeDriver: true,
            easing: Easing.inOut(Easing.quad),
          }),
        ]),
      ])
    );
    glowAnimation.start();

    // 5. Continuous Loading Breathing Loop
    const loadingAnimation = Animated.loop(
      Animated.parallel([
        Animated.sequence([
          Animated.timing(loadingWidth, {
            toValue: 1,
            duration: 1200,
            useNativeDriver: true,
            easing: Easing.inOut(Easing.quad),
          }),
          Animated.timing(loadingWidth, {
            toValue: 0.1,
            duration: 1200,
            useNativeDriver: true,
            easing: Easing.inOut(Easing.quad),
          }),
        ]),
        Animated.sequence([
          Animated.timing(loadingOpacity, {
            toValue: 0.9,
            duration: 1200,
            useNativeDriver: true,
            easing: Easing.inOut(Easing.quad),
          }),
          Animated.timing(loadingOpacity, {
            toValue: 0.4,
            duration: 1200,
            useNativeDriver: true,
            easing: Easing.inOut(Easing.quad),
          }),
        ]),
      ])
    );
    loadingAnimation.start();

    // 6. Background Shapes Gentle Float Loop
    const shapesAnimation = Animated.parallel([
      Animated.loop(
        Animated.sequence([
          Animated.timing(bgShape1TranslateY, {
            toValue: -15,
            duration: 4000,
            useNativeDriver: true,
            easing: Easing.inOut(Easing.quad),
          }),
          Animated.timing(bgShape1TranslateY, {
            toValue: 15,
            duration: 4000,
            useNativeDriver: true,
            easing: Easing.inOut(Easing.quad),
          }),
        ])
      ),
      Animated.loop(
        Animated.sequence([
          Animated.timing(bgShape2TranslateY, {
            toValue: 20,
            duration: 5000,
            useNativeDriver: true,
            easing: Easing.inOut(Easing.quad),
          }),
          Animated.timing(bgShape2TranslateY, {
            toValue: -20,
            duration: 5000,
            useNativeDriver: true,
            easing: Easing.inOut(Easing.quad),
          }),
        ])
      ),
    ]);
    shapesAnimation.start();

    // 7. Timer to initiate exit transition after 3000ms (3 seconds)
    const splashTimer = setTimeout(() => {
      isMinDurationElapsed.current = true;
      checkAndExit();
    }, 3000);

    return () => {
      clearTimeout(splashTimer);
    };
  }, []);

  // Monitor loadingAuth changes.
  useEffect(() => {
    if (!isLoadingAuth && isMinDurationElapsed.current) {
      checkAndExit();
    }
  }, [isLoadingAuth]);

  // Check if minimum 3s duration has elapsed AND Auth initialization is complete
  const isMinDurationElapsed = useRef(false);
  
  const checkAndExit = () => {
    if (isMinDurationElapsed.current && !isLoadingAuth) {
      Animated.timing(rootOpacity, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
        easing: Easing.inOut(Easing.quad),
      }).start(() => {
        onFinish();
      });
    }
  };

  return (
    <Animated.View style={[styles.container, { opacity: rootOpacity }]}>
      <StatusBar barStyle="dark-content" backgroundColor="#F8FAFC" />
      
      {/* Background Gradient */}
      <LinearGradient
        colors={['#F8FAFC', '#F1F7FF', '#E8F2FF']}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        style={StyleSheet.absoluteFill}
      />

      {/* Floating BG Geometry 1 */}
      <Animated.View
        style={[
          styles.bgShape,
          styles.bgShape1,
          { transform: [{ translateY: bgShape1TranslateY }] },
        ]}
      />

      {/* Floating BG Geometry 2 */}
      <Animated.View
        style={[
          styles.bgShape,
          styles.bgShape2,
          { transform: [{ translateY: bgShape2TranslateY }] },
        ]}
      />

      {/* Center Branding Content */}
      <View style={styles.centerContent}>
        {/* Glow Pulse behind Logo */}
        <Animated.View
          style={[
            styles.glowPulse,
            {
              transform: [{ scale: glowScale }],
              opacity: glowOpacity,
            },
          ]}
        />

        {/* Logo Container */}
        <Animated.View
          style={[
            styles.logoContainer,
            {
              transform: [{ scale: logoScale }, { translateY: logoFloat }],
              opacity: logoOpacity,
            },
          ]}
        >
          {/* Logo fallback or image */}
          {!imageLoaded && (
            <View style={styles.logoFallback}>
              <Building2 size={42} color="#FFFFFF" strokeWidth={2.2} />
            </View>
          )}
          
          <Image
            source={require('../../../assets/icon.png')}
            style={[styles.logoImage, imageLoaded && styles.logoImageVisible]}
            onLoad={() => setImageLoaded(true)}
          />
        </Animated.View>

        {/* App Title & Subtitle */}
        <Animated.View
          style={[
            styles.textContainer,
            {
              opacity: textOpacity,
              transform: [{ translateY: textTranslateY }],
            },
          ]}
        >
          <Text style={styles.appTitle}>CSN JobMarket</Text>
          <View style={styles.subtitleContainer}>
            <Briefcase size={13} color="#64748B" style={styles.subtitleIcon} />
            <Text style={styles.appSubtitle}>Industrial & Factory Jobs</Text>
          </View>
        </Animated.View>
      </View>

      {/* Loading Indicator at bottom */}
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
        <Text style={styles.footerText}>Secure Industrial Hiring Platform</Text>
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
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    width: '100%',
  },
  glowPulse: {
    position: 'absolute',
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: '#3B82F6',
    filter: 'blur(30px)',
    opacity: 0.3,
  },
  logoContainer: {
    width: 96,
    height: 96,
    borderRadius: 24,
    backgroundColor: '#2563EB',
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.35,
    shadowRadius: 15,
    elevation: 12,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  logoFallback: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    backgroundColor: '#2563EB',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 2,
  },
  logoImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
    opacity: 0,
  },
  logoImageVisible: {
    opacity: 1,
  },
  textContainer: {
    alignItems: 'center',
    marginTop: 24,
  },
  appTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: -0.5,
  },
  subtitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
  },
  subtitleIcon: {
    marginRight: 5,
  },
  appSubtitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#64748B',
    letterSpacing: 0.5,
  },
  footerContainer: {
    width: '100%',
    alignItems: 'center',
    paddingBottom: 48,
  },
  loadingTrack: {
    width: 140,
    height: 4,
    backgroundColor: '#E2E8F0',
    borderRadius: 2,
    overflow: 'hidden',
    marginBottom: 16,
  },
  loadingFill: {
    width: '100%',
    height: '100%',
    backgroundColor: '#2563EB',
    borderRadius: 2,
  },
  footerText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#94A3B8',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  bgShape: {
    position: 'absolute',
    backgroundColor: '#DBEAFE',
    opacity: 0.45,
    borderRadius: 9999,
  },
  bgShape1: {
    width: 280,
    height: 280,
    top: -50,
    left: -80,
  },
  bgShape2: {
    width: 220,
    height: 220,
    bottom: 80,
    right: -60,
  },
});
