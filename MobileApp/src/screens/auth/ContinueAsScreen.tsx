import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  ImageBackground,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface Props {
  navigation: any;
}

export const ContinueAsScreen: React.FC<Props> = ({ navigation }) => {
  const insets = useSafeAreaInsets();

  const handleSelectRole = (role: 'candidate' | 'employer') => {
    navigation.navigate('EmployerLogin', { initialRole: role });
  };

  const handleSignUp = () => {
    navigation.navigate('EmployerSignup', { initialRole: 'candidate' });
  };

  const statusBarHeight = Platform.OS === 'android' ? (StatusBar.currentHeight || 24) : insets.top;
  const topPadding = Math.max(insets.top || 0, statusBarHeight || 0) + 20;
  const bottomPadding = Math.max(insets.bottom || 0, 24) + 44;

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
            <Text style={styles.helloTitle}>HELLO</Text>
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
    backgroundColor: '#E8F2FC',
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
  helloTitle: {
    fontSize: 44,
    fontWeight: '900',
    color: '#1E255E',
    letterSpacing: 1.5,
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
    height: 48,
    backgroundColor: '#1E255E',
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.18,
    shadowRadius: 6,
    elevation: 3,
  },
  primaryButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.2,
  },
  secondaryPillButton: {
    width: '100%',
    height: 48,
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 2,
  },
  secondaryButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1E255E',
    letterSpacing: 0.2,
  },
  signUpRow: {
    marginTop: 14,
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  signUpPrompt: {
    fontSize: 13.5,
    fontWeight: '500',
    color: '#1E255E',
  },
  signUpHighlight: {
    fontWeight: '800',
    color: '#0A58E2',
    textDecorationLine: 'underline',
  },
});
