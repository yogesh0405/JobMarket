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
  const { signup, loginWithGoogle } = useAuth();
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
  const [gstNumber, setGstNumber] = useState('');
  const [tradeSpecialization, setTradeSpecialization] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scrollViewRef = useRef<ScrollView>(null);

  const handleInputFocus = (offset: number) => {
    setTimeout(() => {
      scrollViewRef.current?.scrollTo({ y: offset, animated: true });
    }, 100);
  };

  const handleGoogleSignUp = () => {
    setError(null);
    navigation.navigate('GoogleAuth', { role });
  };

  const handleSignup = async () => {
    setError(null);

    const cleanEmail = email.trim().toLowerCase();
    const cleanPhone = phone.trim();

    const payload = {
      name: name.trim(),
      email: cleanEmail,
      password,
      confirmPassword,
      phone: cleanPhone,
      companyName: role === 'employer' ? companyName.trim() : (companyName.trim() || `${name.trim()}'s Candidate Profile`),
      gstNumber: gstNumber ? gstNumber.trim() : undefined,
      tradeSpecialization: tradeSpecialization ? tradeSpecialization.trim() : undefined,
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
      const res = await signup(payload);
      const targetEmail = res?.email || cleanEmail;
      navigation.navigate('VerifyOTP', {
        email: targetEmail,
        signupPayload: payload,
      });
    } catch (err: any) {
      setError(err.message || 'Registration failed. Please check details and try again.');
    } finally {
      setLoading(false);
    }
  };

  const safeTopPadding = Math.max(
    insets.top,
    Platform.OS === 'android' ? (StatusBar.currentHeight || 24) : 20
  ) + 8;
  const safeBottomPadding = Math.max(insets.bottom, 16) + 16;

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
        {/* SINGLE UNIFIED OUTER CARD */}
        <View style={styles.unifiedCard}>
          {/* TOP HERO BANNER IMAGE (FIXED) */}
          <View style={styles.heroImageContainer}>
            <ImageBackground
              source={require('../../../assets/auth_group_banner.jpg')}
              style={styles.heroImage}
              resizeMode="cover"
            >
              <LinearGradient
                colors={['rgba(15, 23, 42, 0.05)', 'rgba(15, 23, 42, 0.6)', 'rgba(15, 23, 42, 0.92)']}
                style={styles.heroGradient}
              >
                <View style={styles.heroTextContainer}>
                  <Text style={styles.heroHeadline}>Work together. Grow with ease.</Text>
                  <Text style={styles.heroSubheadline}>
                    Connecting skilled talent with leading enterprises across India.
                  </Text>
                </View>
              </LinearGradient>
            </ImageBackground>
          </View>

          {/* SCROLLABLE FORM SECTION */}
          <ScrollView
            ref={scrollViewRef}
            style={styles.scrollableFormArea}
            contentContainerStyle={[styles.cardBody, { paddingBottom: 100 }]}
            keyboardShouldPersistTaps="handled"
            automaticallyAdjustKeyboardInsets={Platform.OS === 'ios'}
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
                <UserIcon size={14} color={role === 'candidate' ? '#FFFFFF' : '#64748B'} />
                <Text style={[styles.roleSegmentTabText, role === 'candidate' && styles.roleSegmentTabTextActive]}>
                  Candidate
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.roleSegmentTab, role === 'employer' && styles.roleSegmentTabActive]}
                onPress={() => setRole('employer')}
                activeOpacity={0.8}
              >
                <Briefcase size={14} color={role === 'employer' ? '#FFFFFF' : '#64748B'} />
                <Text style={[styles.roleSegmentTabText, role === 'employer' && styles.roleSegmentTabTextActive]}>
                  Employer
                </Text>
              </TouchableOpacity>
            </View>

            {error ? <ErrorBanner message={error} style={{ marginBottom: 13 }} /> : null}

            {/* Input: Full Name */}
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
                keyboardType="number-pad"
                maxLength={10}
                value={phone}
                onFocus={() => handleInputFocus(160)}
                onChangeText={(t) => {
                  const sanitized = t.replace(/[^0-9]/g, '').slice(0, 10);
                  setPhone(sanitized);
                  if (error) setError(null);
                }}
              />
            </View>

            {/* Role specific inputs */}
            {role === 'employer' ? (
              <>
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>
                    Company / Factory Name<Text style={{ color: '#EF4444' }}>*</Text>
                  </Text>
                  <TextInput
                    style={styles.textInput}
                    placeholder="Tata Motors Ltd"
                    placeholderTextColor="#94A3B8"
                    value={companyName}
                    onFocus={() => handleInputFocus(220)}
                    onChangeText={setCompanyName}
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>GSTIN / Business Registration (Optional)</Text>
                  <TextInput
                    style={styles.textInput}
                    placeholder="27AAAAA0000A1Z5"
                    placeholderTextColor="#94A3B8"
                    autoCapitalize="characters"
                    value={gstNumber}
                    onFocus={() => handleInputFocus(280)}
                    onChangeText={setGstNumber}
                  />
                </View>
              </>
            ) : (
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Trade / Skill Specialization (Optional)</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="CNC Operator / Turner / Welder"
                  placeholderTextColor="#94A3B8"
                  value={tradeSpecialization}
                  onFocus={() => handleInputFocus(220)}
                  onChangeText={setTradeSpecialization}
                />
              </View>
            )}

            {/* Input: Password */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>
                Account Password<Text style={{ color: '#EF4444' }}>*</Text>
              </Text>
              <View style={styles.passwordInputWrapper}>
                <TextInput
                  style={styles.passwordTextInput}
                  placeholder="••••••••"
                  placeholderTextColor="#94A3B8"
                  secureTextEntry={!showPassword}
                  value={password}
                  onFocus={() => handleInputFocus(290)}
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
    flex: 1,
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
    height: 180,
    width: '100%',
    backgroundColor: '#0F172A',
    flexShrink: 0,
  },
  scrollableFormArea: {
    flex: 1,
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  heroGradient: {
    flex: 1,
    justifyContent: 'flex-end',
    paddingHorizontal: 18,
    paddingBottom: 18,
  },
  heroTextContainer: {
    gap: 4,
  },
  heroHeadline: {
    fontSize: 20,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: -0.3,
    lineHeight: 25,
  },
  heroSubheadline: {
    fontSize: 12,
    fontWeight: '400',
    color: 'rgba(255, 255, 255, 0.9)',
    lineHeight: 16,
  },
  cardBody: {
    paddingHorizontal: 20,
    paddingTop: 14,
    paddingBottom: 24,
  },
  backButton: {
    alignSelf: 'flex-start',
    paddingVertical: 2,
    paddingRight: 10,
    marginBottom: 8,
  },
  welcomeHeading: {
    fontSize: 23,
    fontWeight: '900',
    color: '#0F172A',
    letterSpacing: -0.4,
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
    marginBottom: 4,
  },
  signupPromptRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  promptText: {
    fontSize: 12.5,
    color: '#64748B',
    fontWeight: '400',
  },
  signupLinkText: {
    fontSize: 12.5,
    color: COLORS.primary,
    fontWeight: '700',
    textDecorationLine: 'underline',
  },
  roleSegmentContainer: {
    flexDirection: 'row',
    backgroundColor: '#F1F5F9',
    borderRadius: 10,
    padding: 2.5,
    marginBottom: 14,
  },
  roleSegmentTab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    paddingVertical: 6.5,
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
    fontSize: 11.5,
    fontWeight: '600',
    color: '#64748B',
  },
  roleSegmentTabTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  inputGroup: {
    marginBottom: 13,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 5,
  },
  textInput: {
    backgroundColor: '#F6F4EE',
    borderRadius: 12,
    height: 46,
    paddingHorizontal: 14,
    fontSize: 13.5,
    color: '#0F172A',
    fontWeight: '500',
  },
  passwordInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F6F4EE',
    borderRadius: 12,
    height: 46,
    paddingHorizontal: 14,
  },
  passwordTextInput: {
    flex: 1,
    height: '100%',
    fontSize: 13.5,
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
    height: 46,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
    marginBottom: 14,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 2,
  },
  primarySignUpBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.2,
  },
  orDividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 14,
  },
  orDividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#E2E8F0',
  },
  orDividerText: {
    fontSize: 10.5,
    fontWeight: '600',
    color: '#94A3B8',
    letterSpacing: 0.8,
  },
  googleSignInBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 46,
    borderRadius: 12,
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
    fontSize: 13,
    fontWeight: '600',
    color: '#1E293B',
  },
});
