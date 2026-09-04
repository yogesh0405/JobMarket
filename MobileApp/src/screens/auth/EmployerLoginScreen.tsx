import React, { useState, useEffect, useRef } from 'react';
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
  Check,
  Briefcase,
  User as UserIcon,
  KeyRound,
} from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../context/ToastContext';
import { ErrorBanner } from '../../components/common/ErrorBanner';
import { ConfirmationModal } from '../../components/common/ConfirmationModal';
import { SuccessModal } from '../../components/common/SuccessModal';
import { COLORS } from '../../constants/theme';
import { authApi } from '../../api/authApi';
import { API_BASE_URL } from '../../api/client';
import { GoogleGLogo } from './components/GoogleGLogo';
import { EmployerTwoFactorModal } from './components/EmployerTwoFactorModal';
import { ForgotPasswordModal } from './components/ForgotPasswordModal';
import { handleFocusInput } from '../../components/common/KeyboardAwareScrollView';

interface Props {
  navigation: any;
  route?: any;
}

export const EmployerLoginScreen: React.FC<Props> = ({ navigation, route }) => {
  const insets = useSafeAreaInsets();
  const { height: screenHeight } = useWindowDimensions();
  const { login, loginWithGoogle, verify2FALogin } = useAuth();
  const { showToast } = useToast();

  const [role, setRole] = useState<'employer' | 'candidate'>('candidate');
  const [email, setEmail] = useState('');
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
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [keepSignedIn, setKeepSignedIn] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (route?.params?.registeredEmail) {
      setEmail(String(route.params.registeredEmail).trim());
    }
    if (route?.params?.initialRole) {
      setRole(route.params.initialRole);
    }
  }, [route?.params]);

  // 2FA Flow States
  const [show2FAModal, setShow2FAModal] = useState(false);
  const [mfaToken, setMfaToken] = useState('');
  const [twoFactorOtp, setTwoFactorOtp] = useState('');
  const [twoFactorError, setTwoFactorError] = useState<string | null>(null);
  const [twoFactorLoading, setTwoFactorLoading] = useState(false);

  // Forgot Password Flow States
  const [showForgotPasswordModal, setShowForgotPasswordModal] = useState(false);

  // Custom Modal Alerts State
  const [confirmModalConfig, setConfirmModalConfig] = useState<{
    visible: boolean;
    title: string;
    message: string;
    highlightText?: string;
    confirmText: string;
    cancelText?: string;
    type?: 'danger' | 'primary' | 'warning';
    icon?: React.ReactNode;
    iconBgColor?: string;
    onConfirm: () => void;
  }>({
    visible: false,
    title: '',
    message: '',
    confirmText: 'Confirm',
    cancelText: 'Cancel',
    type: 'danger',
    onConfirm: () => {},
  });

  const [successModalConfig, setSuccessModalConfig] = useState<{
    visible: boolean;
    title: string;
    message?: string;
  }>({
    visible: false,
    title: '',
  });

  const handleGoogleSignIn = () => {
    setError(null);
    navigation.navigate('GoogleAuth', { role });
  };

  const handleLogin = async () => {
    setError(null);
    const cleanEmail = email.trim().toLowerCase();

    if (!cleanEmail || !password) {
      setError('Please enter your email and password.');
      return;
    }

    setLoading(true);
    try {
      const response = await login(cleanEmail, password, role);

      if (response && (response.require2FA || response.requires2FA)) {
        setMfaToken(response.mfaToken || response.tempToken || response.token || '');
        setTwoFactorOtp('');
        setTwoFactorError(null);
        setShow2FAModal(true);
        return;
      }

      showToast('Welcome back to JobMarket!', 'success', 1000);
    } catch (err: any) {
      const errMsg = err.message || 'Login failed. Please check your credentials.';

      // Case 1: Unverified Account -> Prompt to send verification OTP
      if (
        err.requiresVerification ||
        errMsg.toLowerCase().includes('verify your otp') ||
        errMsg.toLowerCase().includes('not verified') ||
        errMsg.toLowerCase().includes('verify your email')
      ) {
        setConfirmModalConfig({
          visible: true,
          title: 'Account Verification Required',
          message: 'Your account has not been verified yet. Would you like us to send a 6-digit OTP code to',
          highlightText: cleanEmail,
          confirmText: 'Send Verification OTP',
          cancelText: 'Cancel',
          type: 'primary',
          icon: <KeyRound size={24} color={COLORS.primary} />,
          iconBgColor: '#EFF6FF',
          onConfirm: async () => {
            setConfirmModalConfig((prev) => ({ ...prev, visible: false }));
            try {
              await authApi.sendOTP(cleanEmail, 'verification');
              showToast('6-digit OTP code sent to your email.', 'info');
              navigation.navigate('VerifyOTP', { email: cleanEmail, role });
            } catch (otpErr: any) {
              setError(otpErr.message || 'Failed to send OTP code.');
            }
          },
        });
        return;
      }

      // Case 2: Role Mismatch -> Offer switching tab
      if (
        errMsg.toLowerCase().includes('does not belong to this role') ||
        errMsg.toLowerCase().includes('change the role')
      ) {
        const oppositeRole = role === 'candidate' ? 'employer' : 'candidate';
        const oppositeRoleLabel = role === 'candidate' ? 'Employer / Recruiter' : 'Job Seeker / Candidate';
        setConfirmModalConfig({
          visible: true,
          title: 'Role Mismatch Detected',
          message: `This account is registered under the ${oppositeRoleLabel} portal. Would you like to switch to the ${oppositeRoleLabel} login tab?`,
          confirmText: `Switch to ${role === 'candidate' ? 'Employer' : 'Candidate'}`,
          cancelText: 'Cancel',
          type: 'primary',
          icon: <Briefcase size={24} color={COLORS.primary} />,
          iconBgColor: '#EFF6FF',
          onConfirm: () => {
            setConfirmModalConfig((prev) => ({ ...prev, visible: false }));
            setRole(oppositeRole);
            setError(null);
          },
        });
        return;
      }

      // Case 3: Account restricted / blocked
      if (err.status === 403 || errMsg.toLowerCase().includes('restricted') || errMsg.toLowerCase().includes('blocked')) {
        setConfirmModalConfig({
          visible: true,
          title: 'Account Restricted',
          message: errMsg,
          confirmText: 'Contact Support',
          cancelText: 'Close',
          type: 'danger',
          onConfirm: () => {
            setConfirmModalConfig((prev) => ({ ...prev, visible: false }));
            navigation.navigate('HelpSupport');
          },
        });
        return;
      }

      setError(errMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleResend2FA = async () => {
    const cleanEmail = email.trim().toLowerCase();
    try {
      const response = await login(cleanEmail, password, role);
      if (response && (response.mfaToken || response.tempToken || response.token)) {
        setMfaToken(response.mfaToken || response.tempToken || response.token);
      }
      showToast('New 6-digit 2FA code has been sent to your email.', 'success');
    } catch (err: any) {
      setTwoFactorError(err.message || 'Failed to resend 2FA code.');
    }
  };

  const handleVerify2FACode = async () => {
    if (!twoFactorOtp || twoFactorOtp.trim().length !== 6) {
      setTwoFactorError('Please enter the complete 6-digit OTP code.');
      return;
    }
    setTwoFactorError(null);
    setTwoFactorLoading(true);
    try {
      await verify2FALogin(mfaToken, twoFactorOtp.trim());
      setShow2FAModal(false);
    } catch (err: any) {
      setTwoFactorError(err.message || 'Invalid 6-digit 2FA security code.');
    } finally {
      setTwoFactorLoading(false);
    }
  };

  const statusBarHeight = Platform.OS === 'android' ? (StatusBar.currentHeight || 28) : insets.top;
  const safeTopPadding = Math.max(insets.top, statusBarHeight) + 14;
  const safeBottomPadding = Math.max(insets.bottom, 16) + 14;
  const availableHeight = screenHeight - safeTopPadding - safeBottomPadding;
  const targetCardHeight = Math.max(580, Math.min(availableHeight - 12, 730));
  const spaceAboveKeyboard = screenHeight - safeTopPadding - keyboardHeight - 12;
  const activeCardHeight = keyboardHeight > 0 ? Math.max(260, Math.min(spaceAboveKeyboard, targetCardHeight)) : targetCardHeight;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" translucent backgroundColor="transparent" />

      <View
        style={[
          styles.mainWrapper,
          {
            paddingTop: safeTopPadding,
            paddingBottom: keyboardHeight > 0 ? keyboardHeight + 12 : safeBottomPadding,
            justifyContent: keyboardHeight > 0 ? 'flex-start' : 'center',
          },
        ]}
      >
        {/* SINGLE UNIFIED OUTER CARD (CONTAINING IMAGE & FORM) */}
        <View style={[styles.unifiedCard, { height: activeCardHeight }]}>
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
              { paddingBottom: keyboardHeight > 0 ? 120 : 28 },
            ]}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {/* Welcome Back Heading */}
            <Text style={styles.welcomeHeading}>Welcome Back</Text>

            {/* Subtitle & Sign Up Link */}
            <View style={styles.signupPromptRow}>
              <Text style={styles.promptText}>Don't have an account? </Text>
              <TouchableOpacity
                onPress={() => navigation.navigate('EmployerSignup', { initialRole: role })}
                activeOpacity={0.7}
              >
                <Text style={styles.signupLinkText}>Sign up</Text>
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

            {error ? <ErrorBanner message={error} style={{ marginBottom: 14 }} /> : null}

            {/* Email Address Input */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Email Address</Text>
              <TextInput
                style={styles.textInput}
                placeholder="Email Address"
                placeholderTextColor="#94A3B8"
                value={email}
                onFocus={(e) => handleFocusInput(e, scrollViewRef)}
                onChangeText={(t) => {
                  setEmail(t);
                  if (error) setError(null);
                }}
                autoCapitalize="none"
                keyboardType="email-address"
                returnKeyType="next"
              />
            </View>

            {/* Password Input */}
            <View style={[styles.inputGroup, styles.passwordInputGroup]}>
              <View style={styles.labelRow}>
                <Text style={styles.inputLabel}>Password</Text>
                <TouchableOpacity
                  onPress={() => setShowForgotPasswordModal(true)}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  <Text style={styles.forgotPasswordLink}>Forgot Password?</Text>
                </TouchableOpacity>
              </View>
              <View style={styles.passwordInputWrapper}>
                <TextInput
                  style={styles.passwordTextInput}
                  placeholder="Password"
                  placeholderTextColor="#94A3B8"
                  secureTextEntry={!showPassword}
                  value={password}
                  onFocus={(e) => handleFocusInput(e, scrollViewRef)}
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
                  {showPassword ? <EyeOff size={19} color="#0F172A" /> : <Eye size={19} color="#0F172A" />}
                </TouchableOpacity>
              </View>
            </View>

            {/* Primary CTA: Log In Button */}
            <TouchableOpacity
              style={styles.primaryLoginBtn}
              onPress={handleLogin}
              disabled={loading}
              activeOpacity={0.88}
            >
              {loading ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Text style={styles.primaryLoginBtnText}>Log In</Text>
              )}
            </TouchableOpacity>

            {/* Remember my session Checkbox */}
            <TouchableOpacity
              style={styles.rememberSessionRow}
              activeOpacity={0.8}
              onPress={() => setKeepSignedIn(!keepSignedIn)}
            >
              <View style={[styles.checkboxBox, keepSignedIn && styles.checkboxBoxActive]}>
                {keepSignedIn && <Check size={13} color="#FFFFFF" strokeWidth={3} />}
              </View>
              <Text style={styles.rememberSessionText}>Remember my session</Text>
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
              onPress={handleGoogleSignIn}
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

      {/* 2FA Verification Modal */}
      <EmployerTwoFactorModal
        visible={show2FAModal}
        onClose={() => setShow2FAModal(false)}
        email={email.trim().toLowerCase()}
        twoFactorOtp={twoFactorOtp}
        setTwoFactorOtp={setTwoFactorOtp}
        twoFactorError={twoFactorError}
        setTwoFactorError={setTwoFactorError}
        twoFactorLoading={twoFactorLoading}
        onVerify={handleVerify2FACode}
        onResend={handleResend2FA}
      />

      {/* Forgot Password Modal */}
      <ForgotPasswordModal
        visible={showForgotPasswordModal}
        onClose={() => setShowForgotPasswordModal(false)}
        initialEmail={email}
        onSuccess={(newPass, resetMail) => {
          setEmail(resetMail);
          setPassword(newPass);
          setSuccessModalConfig({
            visible: true,
            title: 'Password Reset Successfully !',
            message: 'Your account password has been reset successfully. You can now sign in with your new password.',
          });
        }}
      />

      {/* Confirmation Modal */}
      <ConfirmationModal
        visible={confirmModalConfig.visible}
        title={confirmModalConfig.title}
        message={confirmModalConfig.message}
        highlightText={confirmModalConfig.highlightText}
        confirmText={confirmModalConfig.confirmText}
        cancelText={confirmModalConfig.cancelText}
        type={confirmModalConfig.type}
        icon={confirmModalConfig.icon}
        iconBgColor={confirmModalConfig.iconBgColor}
        onClose={() => setConfirmModalConfig((prev) => ({ ...prev, visible: false }))}
        onConfirm={confirmModalConfig.onConfirm}
      />

      {/* Success Modal */}
      <SuccessModal
        visible={successModalConfig.visible}
        title={successModalConfig.title}
        message={successModalConfig.message}
        buttonText="Sign in Now"
        onClose={() => setSuccessModalConfig({ visible: false, title: '' })}
      />
    </View>
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
    height: 150,
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
    paddingBottom: 16,
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
  passwordInputGroup: {
    marginBottom: 35,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 3,
  },
  inputLabel: {
    fontSize: 11.5,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 3,
  },
  forgotPasswordLink: {
    fontSize: 10.5,
    fontWeight: '600',
    color: '#1E293B',
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
  primaryLoginBtn: {
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
  primaryLoginBtnText: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.2,
  },
  rememberSessionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 14,
  },
  checkboxBox: {
    width: 16,
    height: 16,
    borderRadius: 4,
    borderWidth: 1.5,
    borderColor: '#94A3B8',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
  },
  checkboxBoxActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  rememberSessionText: {
    fontSize: 11.5,
    color: '#475569',
    fontWeight: '500',
  },
  orDividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 20,
    marginBottom: 28,
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
