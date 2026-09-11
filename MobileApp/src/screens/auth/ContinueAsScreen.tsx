import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  ImageBackground,
  Platform,
  Animated,
  Easing,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS, RADIUS } from '../../constants/theme';

interface Props {
  navigation: any;
}

const GREETINGS = ['HELLO !', 'WELCOME !', 'नमस्ते !'];

export const ContinueAsScreen: React.FC<Props> = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const [greetingIndex, setGreetingIndex] = useState(0);
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const slideAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const timeoutRef = useRef<any>(null);

  useEffect(() => {
    let isMounted = true;

    const runMacBookAnimation = () => {
      if (!isMounted) return;

      // Display greeting, then trigger the signature Apple roll-up transition
      timeoutRef.current = setTimeout(() => {
        if (!isMounted) return;

        // Exit: roll upward, fade out & subtly scale down (MacBook style exit)
        Animated.parallel([
          Animated.timing(fadeAnim, {
            toValue: 0,
            duration: 380,
            easing: Easing.bezier(0.4, 0, 0.2, 1),
            useNativeDriver: true,
          }),
          Animated.timing(slideAnim, {
            toValue: -30,
            duration: 380,
            easing: Easing.bezier(0.4, 0, 0.2, 1),
            useNativeDriver: true,
          }),
          Animated.timing(scaleAnim, {
            toValue: 0.94,
            duration: 380,
            easing: Easing.bezier(0.4, 0, 0.2, 1),
            useNativeDriver: true,
          }),
        ]).start(({ finished }) => {
          if (!finished || !isMounted) return;

          // Swap text and prepare next greeting just below the masked frame
          setGreetingIndex((prev) => (prev + 1) % GREETINGS.length);
          slideAnim.setValue(30);
          scaleAnim.setValue(0.94);

          // Entry: glide upward into frame, fade in & scale to 1.0 (Apple deceleration)
          Animated.parallel([
            Animated.timing(fadeAnim, {
              toValue: 1,
              duration: 480,
              easing: Easing.out(Easing.cubic),
              useNativeDriver: true,
            }),
            Animated.timing(slideAnim, {
              toValue: 0,
              duration: 480,
              easing: Easing.out(Easing.cubic),
              useNativeDriver: true,
            }),
            Animated.timing(scaleAnim, {
              toValue: 1.0,
              duration: 480,
              easing: Easing.out(Easing.cubic),
              useNativeDriver: true,
            }),
          ]).start(({ finished: enterFinished }) => {
            if (!enterFinished || !isMounted) return;
            runMacBookAnimation();
          });
        });
      }, 2100);
    };

    runMacBookAnimation();

    return () => {
      isMounted = false;
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [fadeAnim, slideAnim, scaleAnim]);

  const handleSelectRole = (role: 'candidate' | 'employer') => {
    navigation.navigate('EmployerLogin', { initialRole: role });
  };

  const handleSignUp = () => {
    navigation.navigate('EmployerSignup', { initialRole: 'candidate' });
  };

  const statusBarHeight = Platform.OS === 'android' ? (StatusBar.currentHeight || 24) : insets.top;
  const topPadding = Math.max(insets.top || 0, statusBarHeight || 0) + 20;
  const bottomPadding = Math.max(insets.bottom || 0, 20) + 16;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" translucent backgroundColor="transparent" />

      <ImageBackground
        source={require('../../../assets/welcome_city_bg.jpg')}
        style={styles.backgroundImage}
        resizeMode="cover"
      >
        <View style={[styles.contentOverlay, { paddingTop: topPadding, paddingBottom: bottomPadding }]}>
          {/* TOP HEADER SECTION */}
          <View style={styles.headerSection}>
            <View style={styles.titleContainer}>
              <Animated.Text
                style={[
                  styles.helloTitle,
                  {
                    opacity: fadeAnim,
                    transform: [
                      { translateY: slideAnim },
                      { scale: scaleAnim },
                    ],
                    letterSpacing: GREETINGS[greetingIndex].includes('नमस्ते') ? 0.5 : 1.5,
                  },
                ]}
                numberOfLines={1}
                adjustsFontSizeToFit
              >
                {GREETINGS[greetingIndex]}
              </Animated.Text>
            </View>
            <Text style={styles.helloSubtitle}>Choose how you want to continue</Text>
          </View>

          {/* SPACER ALLOWS THE CITYSCAPE ILLUSTRATION TO SHINE */}
          <View style={styles.spacer} />

          {/* BOTTOM BUTTONS SECTION */}
          <View style={styles.bottomSection}>
            {/* Primary Pill Button: Candidate / Job Seeker */}
            <TouchableOpacity
              style={styles.primaryPillButton}
              activeOpacity={0.85}
              onPress={() => handleSelectRole('candidate')}
            >
              <Text style={styles.primaryButtonText}>Continue as Job Seeker</Text>
            </TouchableOpacity>

            {/* Secondary Pill Button: Employer */}
            <TouchableOpacity
              style={styles.secondaryPillButton}
              activeOpacity={0.85}
              onPress={() => handleSelectRole('employer')}
            >
              <Text style={styles.secondaryButtonText}>Continue as Employer</Text>
            </TouchableOpacity>

            {/* Subtle Sign Up Link */}
            <TouchableOpacity
              style={styles.signUpRow}
              activeOpacity={0.7}
              onPress={handleSignUp}
            >
              <Text style={styles.signUpPrompt}>
                Don't have an account? <Text style={styles.signUpHighlight}>Sign Up</Text>
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ImageBackground>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#E9F3FD',
  },
  backgroundImage: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  contentOverlay: {
    flex: 1,
    justifyContent: 'space-between',
    paddingHorizontal: 28,
  },
  headerSection: {
    marginTop: Platform.OS === 'android' ? 24 : 18,
  },
  titleContainer: {
    height: 46,
    justifyContent: 'center',
    overflow: 'hidden',
  },
  helloTitle: {
    fontSize: 34,
    fontWeight: '900',
    color: '#0F172A',
    letterSpacing: 1.2,
  },
  helloSubtitle: {
    fontSize: 15,
    fontWeight: '500',
    color: '#475569',
    marginTop: 6,
    lineHeight: 22,
  },
  spacer: {
    flex: 1,
  },
  bottomSection: {
    width: '100%',
    maxWidth: 380,
    alignSelf: 'center',
    alignItems: 'center',
  },
  primaryPillButton: {
    width: '100%',
    height: 38,
    backgroundColor: COLORS.primary,
    borderRadius: RADIUS.md,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.22,
    shadowRadius: 5,
    elevation: 3,
  },
  primaryButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.2,
  },
  secondaryPillButton: {
    width: '100%',
    height: 38,
    backgroundColor: '#FFFFFF',
    borderRadius: RADIUS.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  secondaryButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.primary,
    letterSpacing: 0.2,
  },
  signUpRow: {
    marginTop: 10,
    paddingVertical: 4,
    paddingHorizontal: 12,
  },
  signUpPrompt: {
    fontSize: 13.5,
    fontWeight: '500',
    color: '#334155',
  },
  signUpHighlight: {
    fontWeight: '800',
    color: COLORS.primary,
    textDecorationLine: 'underline',
  },
});
