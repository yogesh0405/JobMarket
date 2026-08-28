import React, { useState, useEffect } from 'react';
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
  ImageBackground,
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

interface Props {
  navigation: any;
  route?: any;
}

export const EmployerLoginScreen: React.FC<Props> = ({ navigation, route }) => {
  const insets = useSafeAreaInsets();
  const { login, loginWithGoogle, verify2FALogin } = useAuth();
  const { showToast } = useToast();

  const [role, setRole] = useState<'employer' | 'candidate'>('candidate');
  const [email, setEmail] = useState('');
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
    if (route?.params?.signupSuccess) {
      showToast('Registration verified! Please enter your password to sign in.', 'success');
    }
  }, [route?.params]);

  // 2FA Modal State
  const [show2FAModal, setShow2FAModal] = useState(false);
  const [mfaToken, setMfaToken] = useState('');
  const [twoFactorOtp, setTwoFactorOtp] = useState('');
  const [twoFactorLoading, setTwoFactorLoading] = useState(false);
  const [twoFactorError, setTwoFactorError] = useState<string | null>(null);

  // Forgot Password & Confirmation Modal State
  const [showForgotPasswordModal, setShowForgotPasswordModal] = useState(false);
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

  const handleOpenForgotPassword = () => {
    const cleanEmail = email.trim();
    if (cleanEmail && cleanEmail.includes('@')) {
      setConfirmModalConfig({
        visible: true,
        title: 'Reset Password',
        message: 'A 6-digit verification code will be sent to your registered email address:',
        highlightText: cleanEmail,
        confirmText: 'Send Code',
        cancelText: 'Cancel',
        type: 'primary',
        iconBgColor: '#EFF6FF',
        icon: <KeyRound size={26} color={COLORS.primary} />,
        onConfirm: async () => {
          setConfirmModalConfig((prev) => ({ ...prev, visible: false }));
          setShowForgotPasswordModal(true);
          try {
            await authApi.forgotPassword(cleanEmail);
          } catch (e: any) {
            console.warn('Forgot password dispatch error:', e);
          }
        },
      });
    } else {
      setShowForgotPasswordModal(true);
    }
  };

  const handleGoogleSignIn = () => {
    setError(null);
    navigation.navigate('GoogleAuth', { role });
  };

  const handleLogin = async () => {
    setError(null);

    if (!email.trim() || !password.trim()) {
      const errMsg = 'Please enter email and password.';
      setError(errMsg);
      showToast(errMsg, 'error');
      return;
    }

    setLoading(true);
    try {
      const loginRes = await login({ email: email.trim(), password, role });
      if (loginRes && loginRes.require2FA) {
        setMfaToken(loginRes.mfaToken);
        setShow2FAModal(true);
        showToast('🛡️ 2FA Required: Enter the 6-digit code sent to your email.', 'info');
      }
    } catch (err: any) {
      const errorMsg = err.message || 'Invalid credentials. Please try again.';
      setError(errorMsg);
      showToast(errorMsg, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleVerify2FACode = async () => {
    if (!twoFactorOtp.trim() || twoFactorOtp.trim().length !== 6) {
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
        {/* SINGLE UNIFIED OUTER CARD (CONTAINING IMAGE & FORM) */}
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

          {/* INNER SCROLLABLE FORM SECTION */}
          <ScrollView
            style={styles.scrollableFormArea}
            contentContainerStyle={styles.cardBody}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {/* Back Navigation Button */}
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => {
                if (navigation.canGoBack()) {
                  navigation.goBack();
                }
              }}
              hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
              activeOpacity={0.7}
            >
              <ArrowLeft size={22} color="#0F172A" />
            </TouchableOpacity>

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

            {error ? <ErrorBanner message={error} style={{ marginBottom: 14 }} /> : null}

            {/* Email Address Input */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Email Address</Text>
              <TextInput
                style={styles.textInput}
                placeholder="Email Address"
                placeholderTextColor="#94A3B8"
                value={email}
                onChangeText={(t) => {
                  setEmail(t);
                  if (error) setError(null);
                }}
                autoCapitalize="none"
                keyboardType="email-address"
              />
            </View>

            {/* Password Input with Forgot Password? Link */}
            <View style={styles.inputGroup}>
              <View style={styles.labelRow}>
                <Text style={styles.inputLabel}>Password</Text>
                <TouchableOpacity onPress={handleOpenForgotPassword} activeOpacity={0.7}>
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
        twoFactorOtp={twoFactorOtp}
        setTwoFactorOtp={setTwoFactorOtp}
        twoFactorError={twoFactorError}
        setTwoFactorError={setTwoFactorError}
        twoFactorLoading={twoFactorLoading}
        onVerify={handleVerify2FACode}
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
    borderRadius: 30,
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
    color: '#0F172A',
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
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 5,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 5,
  },
  forgotPasswordLink: {
    fontSize: 11.5,
    fontWeight: '600',
    color: '#1E293B',
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
  primaryLoginBtn: {
    backgroundColor: COLORS.primary,
    height: 46,
    borderRadius: 23,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
    marginBottom: 12,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 2,
  },
  primaryLoginBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.2,
  },
  rememberSessionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 18,
  },
  checkboxBox: {
    width: 17,
    height: 17,
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
    fontSize: 12,
    color: '#475569',
    fontWeight: '500',
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
    borderRadius: 23,
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
