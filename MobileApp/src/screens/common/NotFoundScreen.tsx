import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  Dimensions,
} from 'react-native';
import { Image } from 'expo-image';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Home } from 'lucide-react-native';
import { useAuth } from '../../hooks/useAuth';
import { COLORS, SPACING } from '../../constants/theme';

const { width: screenWidth } = Dimensions.get('window');
const imageSize = Math.min(screenWidth - 48, 340);

export const NotFoundScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<any>();
  const { isAuthenticated, user } = useAuth();

  const isCandidate = (user?.role || '').toLowerCase() === 'candidate';

  const handleGoHome = () => {
    if (!isAuthenticated) {
      navigation.reset({
        index: 0,
        routes: [{ name: 'ContinueAs' }],
      });
    } else if (isCandidate) {
      navigation.reset({
        index: 0,
        routes: [{ name: 'CandidateMain' }],
      });
    } else {
      navigation.reset({
        index: 0,
        routes: [{ name: 'EmployerMain' }],
      });
    }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        bounces={false}
      >
        <View style={styles.contentWrap}>
          {/* Custom JobMarket 3D Career Character */}
          <View style={[styles.imageWrap, { width: imageSize, height: imageSize * 0.75 }]}>
            <Image
              source={require('../../../assets/404-character.jpg')}
              style={styles.characterImage}
              contentFit="contain"
              transition={200}
            />
          </View>

          {/* Heading */}
          <Text style={styles.title}>Page Not Found</Text>

          {/* Subtitle Message */}
          <Text style={styles.subtitle}>
            The page or job you are looking for might have been removed, had its name changed or is temporarily unavailable.
          </Text>

          {/* Single Primary CTA Button — Pill shaped in JobMarket Blue */}
          <TouchableOpacity
            style={styles.primaryButton}
            activeOpacity={0.85}
            onPress={handleGoHome}
            accessibilityRole="button"
            accessibilityLabel="Go to Home Page"
          >
            <Home size={18} color="#FFFFFF" strokeWidth={2} style={styles.btnIcon} />
            <Text style={styles.primaryButtonText}>Home Page</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.xl,
  },
  contentWrap: {
    width: '100%',
    maxWidth: 420,
    alignItems: 'center',
    justifyContent: 'center',
  },
  imageWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.md,
  },
  characterImage: {
    width: '100%',
    height: '100%',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#0F172A',
    textAlign: 'center',
    marginBottom: SPACING.sm,
    letterSpacing: -0.4,
  },
  subtitle: {
    fontSize: 14,
    color: '#64748B',
    lineHeight: 22,
    textAlign: 'center',
    marginBottom: SPACING.xxl,
    maxWidth: 320,
  },
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
    height: 48,
    paddingHorizontal: 38,
    borderRadius: 9999,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 3,
  },
  btnIcon: {
    marginRight: 8,
  },
  primaryButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
    letterSpacing: 0.2,
  },
});
