import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  TextInput,
  ActivityIndicator,
  StatusBar,
  Keyboard,
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
} from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../context/ToastContext';
import { ErrorBanner } from '../../components/common/ErrorBanner';
import { COLORS } from '../../constants/theme';
import { API_BASE_URL } from '../../api/client';
import { signupSchema } from '../../utils/validators';
import { handleFocusInput } from '../../components/common/KeyboardAwareScrollView';
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
  const [phone, setPhone] = useState('');
  const [companyName, setCompanyName] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const scrollViewRef = useRef<ScrollView>(null);

  useEffect(() => {
    const showSub = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
      (e: any) => setKeyboardHeight(e.endCoordinates?.height || 0)
    );
    const hideSub = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
      () => setKeyboardHeight(0)
    );
    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  const handleInputFocus = (offset: number) => {
    setTimeout(() => {
      scrollViewRef.current?.scrollTo({ y: offset, animated: true });
    }, 120);
  };

  const handleGoogleSignUp = () => {
    setError(null);
    navigation.navigate('GoogleAuth', { role });
  };

  const handleSignup = async () => {
    setError(null);

    const cleanEmail = email.trim().toLowerCase();
    const cleanPhone = phone.trim();
    const cleanName = name.trim();

    if (role === 'candidate' && !cleanName) {
      setError('Full name is required for Candidate registration.');
      return;
    }

    const derivedName = role === 'candidate'
      ? cleanName
      : (companyName.trim() || cleanEmail.split('@')[0] || 'Employer');

    const payload = {
      name: derivedName,
      email: cleanEmail,
      password,
      confirmPassword,
      phone: cleanPhone,
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

  const safeTopPadding = Math.max(
    insets.top,
    Platform.OS === 'android' ? (StatusBar.currentHeight || 24) : 12
  );
  const safeBottomPadding = Math.max(insets.bottom, 6);
  const targetCardHeight = Math.max(740, Math.min(screenHeight - safeTopPadding - safeBottomPadding, 960));

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <StatusBar barStyle="dark-content" translucent backgroundColor="transparent" />

      <View
        style={[
          styles.mainWrapper,
          {
            paddingTop: safeTopPadding,
            paddingBottom: safeBottomPadding,
          },
        ]}
      >
        {/* SINGLE UNIFIED OUTER CARD - IDENTICAL HEIGHT TO LOGIN */}
        <View style={[styles.unifiedCard, { height: targetCardHeight }]}>
          {/* TOP HERO BANNER IMAGE (FIXED) */}
          <View style={styles.heroImageContainer}>
            <ImageBackground
              source={require('../../../assets/auth_group_banner.jpg')}
              style={styles.heroImage}
              imageStyle={styles.heroImageInner}
            >
              <LinearGradient
                colors={['rgba(15, 23, 42, 0.05)', 'rgba(15, 23, 42, 0.6)', 'rgba(15, 23, 42, 0.92)']}
                style={styles.heroGradient}
              >
                <View style={styles.heroTextContainer}>
                  <Text style={styles.heroHeadline}>Work together. Grow with ease.</Text>
                  <Text style={styles.heroSubheadline}>
                    Connecting skilled talent with leading enterprises.
                  </Text>
                </View>
              </LinearGradient>
            </ImageBackground>
          </View>

          {/* INNER SCROLLABLE FORM SECTION */}
          <ScrollView
            ref={scrollViewRef}
            style={styles.scrollableFormArea}
            contentContainerStyle={[
              styles.cardBody,
              { paddingBottom: keyboardHeight > 0 ? keyboardHeight + 80 : 36 },
            ]}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {/* Heading */}
            <Text style={styles.welcomeHeading}>Create Account</Text>

            {/* Subtitle & Sign in Link */}
            <View style={styles.signupPromptRow}>
              <Text style={styles.promptText}>Already have an account? </Text>
              <TouchableOpacity
                onPress={() => navigation.navigate('EmployerLogin', { initialRole: role })}
                activeOpacity={0.7}
              >
                <Text style={styles.signupLinkText}>Sign in</Text>
              </TouchableOpacity>
            </View>

            {/* Role Switcher (Candidate vs Employer) */}
            <View style={styles.roleSegmentContainer}>
              <TouchableOpacity
                style={[styles.roleSegmentTab, role === 'candidate' && styles.roleSegmentTabActive]}
                onPress={() => setRole('candidate')}
                activeOpacity={0.8}
              >
                <UserIcon size={15} color={role === 'candidate' ? '#FFFFFF' : '#64748B'} />
                <Text style={[styles.roleSegmentTabText, role === 'candidate' && styles.roleSegmentTabTextActive]}>
                  Candidate
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.roleSegmentTab, role === 'employer' && styles.roleSegmentTabActive]}
                onPress={() => setRole('employer')}
                activeOpacity={0.8}
              >
                <Briefcase size={15} color={role === 'employer' ? '#FFFFFF' : '#64748B'} />
                <Text style={[styles.roleSegmentTabText, role === 'employer' && styles.roleSegmentTabTextActive]}>
                  Employer
                </Text>
              </TouchableOpacity>
            </View>

            {error ? <ErrorBanner message={error} style={{ marginBottom: 13 }} /> : null}

            {/* Input: Full Name (Candidate only) */}
            {role === 'candidate' && (
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>
                  Full Name<Text style={{ color: '#EF4444' }}>*</Text>
                </Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="Ramesh Sharma"
                  placeholderTextColor="#94A3B8"
                  value={name}
                  onFocus={() => handleInputFocus(40)}
                  onChangeText={(t) => {
                    setName(t);
                    if (error) setError(null);
                  }}
                />
              </View>
            )}

            {/* Input: Email Address */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>
                Email Address<Text style={{ color: '#EF4444' }}>*</Text>
              </Text>
              <TextInput
                style={styles.textInput}
                placeholder="candidate@email.com"
                placeholderTextColor="#94A3B8"
                value={email}
                onFocus={() => handleInputFocus(100)}
                onChangeText={(t) => {
                  setEmail(t);
                  if (error) setError(null);
                }}
                autoCapitalize="none"
                keyboardType="email-address"
              />
            </View>

            {/* Input: Mobile Phone Number */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>
                Mobile Phone Number<Text style={{ color: '#EF4444' }}>*</Text>
              </Text>
              <TextInput
                style={styles.textInput}
                placeholder="9876543210"
                placeholderTextColor="#94A3B8"
                value={phone}
                maxLength={10}
                onFocus={() => handleInputFocus(160)}
                onChangeText={(t) => {
                  const cleaned = t.replace(/[^0-9]/g, '').slice(0, 10);
                  setPhone(cleaned);
                  if (error) setError(null);
                }}
                keyboardType="phone-pad"
              />
            </View>

            {/* Role specific inputs (Employer only) */}
            {role === 'employer' && (
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>
                  Company / Factory Name<Text style={{ color: '#EF4444' }}>*</Text>
                </Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="Tata Motors Ltd / Endurance"
                  placeholderTextColor="#94A3B8"
                  value={companyName}
                  onFocus={() => handleInputFocus(220)}
                  onChangeText={(t) => {
                    setCompanyName(t);
                    if (error) setError(null);
                  }}
                />
              </View>
            )}

            {/* Input: Password */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>
                Create Password<Text style={{ color: '#EF4444' }}>*</Text>
              </Text>
              <View style={styles.passwordInputWrapper}>
                <TextInput
                  style={styles.passwordTextInput}
                  placeholder="Min 6 characters"
                  placeholderTextColor="#94A3B8"
                  secureTextEntry={!showPassword}
                  value={password}
                  onFocus={() => handleInputFocus(280)}
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
                  {showPassword ? <EyeOff size={18} color="#0F172A" /> : <Eye size={18} color="#0F172A" />}
                </TouchableOpacity>
              </View>
            </View>

            {/* Input: Confirm Password */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>
                Confirm Password<Text style={{ color: '#EF4444' }}>*</Text>
              </Text>
              <View style={styles.passwordInputWrapper}>
                <TextInput
                  style={styles.passwordTextInput}
                  placeholder="••••••••"
                  placeholderTextColor="#94A3B8"
                  secureTextEntry={!showConfirmPassword}
                  value={confirmPassword}
                  onFocus={() => handleInputFocus(360)}
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
                  {showConfirmPassword ? <EyeOff size={18} color="#0F172A" /> : <Eye size={18} color="#0F172A" />}
                </TouchableOpacity>
              </View>
            </View>

            {/* Primary CTA: Create Account Button */}
            <TouchableOpacity
              style={styles.primarySignUpBtn}
              onPress={handleSignup}
              disabled={loading}
              activeOpacity={0.88}
            >
              {loading ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Text style={styles.primarySignUpBtnText}>Create Account</Text>
              )}
            </TouchableOpacity>

            {/* OR Divider */}
            <View style={styles.orDividerContainer}>
              <View style={styles.orDividerLine} />
              <Text style={styles.orDividerText}>OR</Text>
              <View style={styles.orDividerLine} />
            </View>

            {/* Google Sign In Button */}
            <TouchableOpacity
              style={styles.googleSignInBtn}
              onPress={handleGoogleSignUp}
              disabled={loading}
              activeOpacity={0.8}
            >
              <View style={styles.googleIconContainer}>
                <GoogleGLogo size={20} />
              </View>
              <Text style={styles.googleSignInBtnText}>Continue with Google</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F1F5F9',
  },
  mainWrapper: {
    flex: 1,
    paddingHorizontal: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  unifiedCard: {
    width: '100%',
    maxWidth: 440,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 4,
  },
  heroImageContainer: {
    height: 125,
    width: '100%',
    backgroundColor: '#0F172A',
    flexShrink: 0,
    overflow: 'hidden',
  },
  scrollableFormArea: {
    flex: 1,
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  heroImageInner: {
    resizeMode: 'cover',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 175,
  },
  heroGradient: {
    flex: 1,
    justifyContent: 'flex-end',
    paddingHorizontal: 16,
    paddingBottom: 10,
  },
  heroTextContainer: {
    gap: 3,
  },
  heroHeadline: {
    fontSize: 16.5,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: -0.2,
    lineHeight: 21,
  },
  heroSubheadline: {
    fontSize: 10.5,
    fontWeight: '400',
    color: 'rgba(255, 255, 255, 0.9)',
    lineHeight: 14,
  },
  cardBody: {
    paddingHorizontal: 18,
    paddingTop: 12,
    paddingBottom: 28,
  },
  welcomeHeading: {
    fontSize: 18.5,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: -0.3,
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
    marginBottom: 2,
  },
  signupPromptRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  promptText: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '400',
  },
  signupLinkText: {
    fontSize: 12,
    color: COLORS.primary,
    fontWeight: '700',
    textDecorationLine: 'underline',
  },
  roleSegmentContainer: {
    flexDirection: 'row',
    backgroundColor: '#F1F5F9',
    borderRadius: 10,
    padding: 3,
    marginTop: 10,
    marginBottom: 39,
    height: 40,
  },
  roleSegmentTab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    height: '100%',
    borderRadius: 8,
  },
  roleSegmentTabActive: {
    backgroundColor: COLORS.primary,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 2,
  },
  roleSegmentTabText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
  },
  roleSegmentTabTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  inputGroup: {
    marginBottom: 10,
  },
  inputLabel: {
    fontSize: 11.5,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 3,
  },
  textInput: {
    backgroundColor: '#F6F4EE',
    borderRadius: 9,
    height: 40,
    paddingHorizontal: 12,
    fontSize: 12,
    color: '#0F172A',
    fontWeight: '500',
  },
  passwordInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F6F4EE',
    borderRadius: 9,
    height: 40,
    paddingHorizontal: 12,
  },
  passwordTextInput: {
    flex: 1,
    height: '100%',
    fontSize: 12,
    color: '#0F172A',
    fontWeight: '500',
  },
  eyeIconButton: {
    paddingLeft: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  primarySignUpBtn: {
    backgroundColor: COLORS.primary,
    height: 40,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
    marginBottom: 10,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 2,
  },
  primarySignUpBtnText: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.2,
  },
  orDividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 10,
  },
  orDividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#E2E8F0',
  },
  orDividerText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#94A3B8',
    letterSpacing: 0.8,
  },
  googleSignInBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 40,
    borderRadius: 9,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    backgroundColor: '#FFFFFF',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  },
  googleIconContainer: {
    marginRight: 8,
  },
  googleSignInBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1E293B',
  },
});
