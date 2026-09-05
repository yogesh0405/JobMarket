import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Platform,
  TextInput,
  ActivityIndicator,
  StatusBar,
  ImageBackground,
  useWindowDimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import {
  ArrowLeft,
  Eye,
  EyeOff,
  Briefcase,
  User as UserIcon,
  Phone,
} from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../context/ToastContext';
import { ErrorBanner } from '../../components/common/ErrorBanner';
import { signupSchema } from '../../utils/validators';
import { GoogleGLogo } from './components/GoogleGLogo';

interface Props {
  navigation: any;
  route?: any;
}

export const EmployerSignupScreen: React.FC<Props> = ({ navigation, route }) => {
  const insets = useSafeAreaInsets();
  const { height: screenHeight } = useWindowDimensions();
  const { signup, loginWithGoogle } = useAuth();
  const { showToast } = useToast();
  const initialRole = route?.params?.initialRole || 'candidate';

  const [role, setRole] = useState<'employer' | 'candidate'>(initialRole);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [companyName, setCompanyName] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (route?.params?.initialRole) {
      setRole(route.params.initialRole);
    }
  }, [route?.params]);

  const handleGoogleSignUp = () => {
    setError(null);
    navigation.navigate('GoogleAuth', { role });
  };

  const handlePhoneSignUp = () => {
    setError(null);
    showToast('Phone number registration will be enabled shortly.', 'info');
  };

  const handleSignup = async () => {
    setError(null);

    const cleanEmail = email.trim().toLowerCase();
    const cleanName = name.trim();

    if (role === 'candidate' && !cleanName) {
      setError('Full name is required for Candidate registration.');
      return;
    }

    const derivedName =
      role === 'candidate'
        ? cleanName
        : companyName.trim() || cleanEmail.split('@')[0] || 'Employer';

    const fallbackPhone = '98' + Math.floor(10000000 + Math.random() * 90000000).toString();

    const payload = {
      name: derivedName,
      email: cleanEmail,
      password,
      confirmPassword,
      phone: fallbackPhone,
      companyName: role === 'employer' ? companyName.trim() : `${derivedName}'s Candidate Profile`,
      role,
    };

    if (role === 'employer' && !payload.companyName) {
      setError('Company / Factory name is required for Employer registration.');
      return;
    }

    const result = signupSchema.safeParse(payload);
    if (!result.success) {
      const firstError = result.error.issues[0]?.message || 'Please fill in all required fields correctly.';
      setError(firstError);
      return;
    }

    setLoading(true);
    try {
      await signup(payload);
      showToast('New OTP sent to your email. Please verify to complete registration.', 'info', 2000);
      navigation.navigate('VerifyOTP', {
        email: cleanEmail,
        role,
        signupPayload: payload,
      });
    } catch (err: any) {
      const errMsg = err.message || 'Registration failed. Please try again.';
      setError(errMsg);
    } finally {
      setLoading(false);
    }
  };

  const statusBarHeight = Platform.OS === 'android' ? (StatusBar.currentHeight || 28) : insets.top;
  const safeTop = Math.max(insets.top || 0, statusBarHeight || 0);
  const safeTopPadding = Math.max(safeTop + 10, Platform.OS === 'ios' ? 44 : 36);
  const safeBottomPadding = Math.max(insets.bottom || 0, 24) + 32;
  const headerHeight = Math.max(210, Math.min(screenHeight * 0.28, safeTopPadding + 160));

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" translucent backgroundColor="transparent" />

      {/* TOP JOBMARKET HEADER BANNER (EXACT SAME LIGHT BLUE THEME) */}
      <View style={[styles.headerBannerContainer, { height: headerHeight }]}>
        <ImageBackground
          source={require('../../../assets/login_header_jobmarket.jpg')}
          style={styles.headerImage}
          resizeMode="cover"
        >
          <LinearGradient
            colors={['rgba(255, 255, 255, 0.35)', 'transparent', 'rgba(255, 255, 255, 0.2)']}
            style={styles.headerGradient}
          >
            {/* UNIFIED TOP BAR GUARANTEED BELOW SYSTEM STATUS BAR */}
            <View style={[styles.headerTopBar, { paddingTop: safeTopPadding }]}>
              <TouchableOpacity
                style={styles.backButton}
                onPress={() => {
                  if (navigation?.canGoBack && navigation.canGoBack()) {
                    navigation.goBack();
                  } else {
                    navigation?.navigate?.('ContinueAs');
                  }
                }}
                activeOpacity={0.7}
                hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
              >
                <ArrowLeft size={24} color="#1E255E" strokeWidth={3.0} />
              </TouchableOpacity>

              {/* ROLE CAPSULE IN HEADER */}
              <TouchableOpacity
                style={styles.headerRoleCapsule}
                onPress={() => setRole(role === 'candidate' ? 'employer' : 'candidate')}
                activeOpacity={0.75}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <View style={styles.roleCapsuleDot}>
                  {role === 'candidate' ? (
                    <UserIcon size={12} color="#0A58E2" strokeWidth={2.5} />
                  ) : (
                    <Briefcase size={12} color="#0A58E2" strokeWidth={2.5} />
                  )}
                </View>
                <Text style={styles.headerRoleCapsuleText}>
                  {role === 'candidate' ? 'Employee' : 'Employer'}
                </Text>
              </TouchableOpacity>
            </View>
          </LinearGradient>
        </ImageBackground>
      </View>

      {/* WHITE BOTTOM SHEET / CARD */}
      <View style={styles.whiteSheet}>
        <ScrollView
          style={styles.scrollArea}
          contentContainerStyle={[
            styles.scrollContent,
            { paddingBottom: safeBottomPadding },
          ]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* SCREEN TITLE & SUBTITLE */}
          <View style={styles.sheetHeaderContainer}>
            <Text style={styles.sheetTitle}>Sign Up</Text>
            <Text style={styles.sheetSubtitle}>
              Create your account to get started with JobMarket.
            </Text>
          </View>

          {error ? <ErrorBanner message={error} style={{ marginBottom: 12 }} /> : null}

          {/* FULL NAME (CANDIDATE ONLY) */}
          {role === 'candidate' && (
            <View style={styles.inputWrapper}>
              <TextInput
                style={styles.pillInput}
                placeholder="Full Name"
                placeholderTextColor="#94A3B8"
                value={name}
                onChangeText={(t) => {
                  setName(t);
                  if (error) setError(null);
                }}
                autoCapitalize="words"
                returnKeyType="next"
              />
            </View>
          )}

          {/* COMPANY / FACTORY NAME (EMPLOYER ONLY) */}
          {role === 'employer' && (
            <View style={styles.inputWrapper}>
              <TextInput
                style={styles.pillInput}
                placeholder="Company / Enterprise Name"
                placeholderTextColor="#94A3B8"
                value={companyName}
                onChangeText={(t) => {
                  setCompanyName(t);
                  if (error) setError(null);
                }}
                autoCapitalize="words"
                returnKeyType="next"
              />
            </View>
          )}

          {/* EMAIL INPUT (PILL SHAPED) */}
          <View style={styles.inputWrapper}>
            <TextInput
              style={styles.pillInput}
              placeholder="Email Address"
              placeholderTextColor="#94A3B8"
              value={email}
              onChangeText={(t) => {
                setEmail(t);
                if (error) setError(null);
              }}
              autoCapitalize="none"
              keyboardType="email-address"
              returnKeyType="next"
            />
          </View>

          {/* PASSWORD INPUT (PILL SHAPED WITH EYE TOGGLE) */}
          <View style={styles.inputWrapper}>
            <View style={styles.pillPasswordWrapper}>
              <TextInput
                style={styles.pillPasswordInput}
                placeholder="Password (Min 6 characters)"
                placeholderTextColor="#94A3B8"
                secureTextEntry={!showPassword}
                value={password}
                onChangeText={(t) => {
                  setPassword(t);
                  if (error) setError(null);
                }}
              />
              <TouchableOpacity
                onPress={() => setShowPassword(!showPassword)}
                style={styles.eyeIconButton}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                activeOpacity={0.7}
              >
                {showPassword ? <EyeOff size={18} color="#64748B" /> : <Eye size={18} color="#64748B" />}
              </TouchableOpacity>
            </View>
          </View>

          {/* CONFIRM PASSWORD INPUT (PILL SHAPED WITH EYE TOGGLE) */}
          <View style={[styles.inputWrapper, { marginBottom: 30 }]}>
            <View style={styles.pillPasswordWrapper}>
              <TextInput
                style={styles.pillPasswordInput}
                placeholder="Confirm Password"
                placeholderTextColor="#94A3B8"
                secureTextEntry={!showConfirmPassword}
                value={confirmPassword}
                onChangeText={(t) => {
                  setConfirmPassword(t);
                  if (error) setError(null);
                }}
              />
              <TouchableOpacity
                onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                style={styles.eyeIconButton}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                activeOpacity={0.7}
              >
                {showConfirmPassword ? <EyeOff size={18} color="#64748B" /> : <Eye size={18} color="#64748B" />}
              </TouchableOpacity>
            </View>
          </View>

          {/* PRIMARY CTA: CREATE ACCOUNT (PILL SHAPED) */}
          <TouchableOpacity
            style={styles.signInPillBtn}
            onPress={handleSignup}
            disabled={loading}
            activeOpacity={0.88}
          >
            {loading ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Text style={styles.signInPillBtnText}>Create Account</Text>
            )}
          </TouchableOpacity>

          {/* OR DIVIDER */}
          <View style={styles.orDividerContainer}>
            <View style={styles.orDividerLine} />
            <Text style={styles.orDividerText}>or</Text>
            <View style={styles.orDividerLine} />
          </View>

          {/* SOCIAL / ALTERNATIVE SIGN UP (GOOGLE & PHONE) */}
          <View style={styles.socialRow}>
            <TouchableOpacity
              style={styles.socialPillBtn}
              onPress={handleGoogleSignUp}
              disabled={loading}
              activeOpacity={0.8}
            >
              <GoogleGLogo size={16} />
              <Text style={styles.socialPillBtnText}>Google</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.socialPillBtn}
              onPress={handlePhoneSignUp}
              disabled={loading}
              activeOpacity={0.8}
            >
              <Phone size={15} color="#1E255E" strokeWidth={2.2} />
              <Text style={styles.socialPillBtnText}>Phone</Text>
            </TouchableOpacity>
          </View>

          {/* SIGN IN PROMPT LINK */}
          <View style={styles.signUpPromptRow}>
            <Text style={styles.signUpPromptText}>Already have an account? </Text>
            <TouchableOpacity
              onPress={() => navigation.navigate('EmployerLogin', { initialRole: role })}
              activeOpacity={0.7}
            >
              <Text style={styles.signUpHighlightText}>Sign In</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#E8F2FC',
  },
  headerBannerContainer: {
    width: '100%',
    backgroundColor: '#E8F2FC',
  },
  headerImage: {
    width: '100%',
    height: '100%',
  },
  headerGradient: {
    flex: 1,
  },
  headerTopBar: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    zIndex: 20,
  },
  backButton: {
    width: 20,
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  whiteSheet: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 0,
    borderTopRightRadius: 0,
    marginTop: 0,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
    overflow: 'hidden',
  },
  scrollArea: {
    flex: 1,
  },
  headerRoleCapsule: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderWidth: 1.2,
    borderColor: '#BFDBFE',
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 7,
    shadowColor: '#1E255E',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    marginRight: 4,
  },
  roleCapsuleDot: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerRoleCapsuleText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#1E255E',
    letterSpacing: 0.2,
  },
  sheetHeaderContainer: {
    marginBottom: 30,
  },
  sheetTitle: {
    fontSize: 25,
    fontWeight: '800',
    color: '#1E255E',
    letterSpacing: -0.5,
    marginBottom: 4,
  },
  sheetSubtitle: {
    fontSize: 13.5,
    fontWeight: '400',
    color: '#64748B',
    lineHeight: 18,
  },
  scrollContent: {
    paddingHorizontal: 26,
    paddingTop: 12,
  },
  inputWrapper: {
    marginBottom: 11,
  },
  pillInput: {
    backgroundColor: '#EEF2F6',
    borderRadius: 23,
    height: 46,
    paddingHorizontal: 18,
    fontSize: 14,
    color: '#1E255E',
    fontWeight: '500',
  },
  pillPasswordWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EEF2F6',
    borderRadius: 23,
    height: 46,
    paddingHorizontal: 18,
  },
  pillPasswordInput: {
    flex: 1,
    height: '100%',
    fontSize: 14,
    color: '#1E255E',
    fontWeight: '500',
  },
  eyeIconButton: {
    paddingLeft: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  signInPillBtn: {
    backgroundColor: '#1E255E',
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 4,
    marginBottom: 14,
    shadowColor: '#1E255E',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.18,
    shadowRadius: 6,
    elevation: 3,
  },
  signInPillBtnText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.2,
  },
  orDividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    marginTop: 28,
    marginBottom: 28,
    paddingHorizontal: 16,
  },
  orDividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#E2E8F0',
  },
  orDividerText: {
    fontSize: 12.5,
    fontWeight: '500',
    color: '#94A3B8',
    textTransform: 'lowercase',
  },
  socialRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    marginTop: 0,
    marginBottom: 22,
    paddingHorizontal: 12,
  },
  socialPillBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    height: 38,
    paddingHorizontal: 12,
    borderRadius: 19,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 2,
    elevation: 1,
  },
  socialPillBtnText: {
    fontSize: 12.5,
    fontWeight: '600',
    color: '#1E255E',
  },
  signUpPromptRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 6,
    marginBottom: 10,
  },
  signUpPromptText: {
    fontSize: 13.5,
    color: '#64748B',
    fontWeight: '500',
  },
  signUpHighlightText: {
    fontSize: 13.5,
    color: '#1E255E',
    fontWeight: '800',
    textDecorationLine: 'underline',
  },
});
