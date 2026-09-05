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
  Phone,
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
  const { height: screenHeight } = useWindowDimensions();
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

  const handlePhoneSignIn = () => {
    setError(null);
    showToast('Phone number sign-in will be enabled shortly.', 'info');
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
  const safeTop = Math.max(insets.top || 0, statusBarHeight || 0);
  const safeTopPadding = Math.max(safeTop + 10, Platform.OS === 'ios' ? 44 : 36);
  const safeBottomPadding = Math.max(insets.bottom || 0, 24) + 32;
  const headerHeight = Math.max(210, Math.min(screenHeight * 0.28, safeTopPadding + 160));

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" translucent backgroundColor="transparent" />

      {/* TOP JOBMARKET HEADER BANNER (LIGHT BLUE THEME) */}
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
        <View style={[styles.scrollContent, { paddingBottom: safeBottomPadding }]}>
          {/* SCREEN TITLE & SUBTITLE */}
          <View style={styles.sheetHeaderContainer}>
            <Text style={styles.sheetTitle}>Sign In</Text>
            <Text style={styles.sheetSubtitle}>
              Welcome back! Please enter your details to continue.
            </Text>
          </View>

          {error ? <ErrorBanner message={error} style={{ marginBottom: 14 }} /> : null}

          {/* EMAIL INPUT (PILL SHAPED) */}
          <View style={styles.inputWrapper}>
            <TextInput
              style={styles.pillInput}
              placeholder="Email"
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
                {showPassword ? <EyeOff size={19} color="#64748B" /> : <Eye size={19} color="#64748B" />}
              </TouchableOpacity>
            </View>
          </View>

          {/* PRIMARY CTA: SIGN IN (PILL SHAPED) */}
          <TouchableOpacity
            style={styles.signInPillBtn}
            onPress={handleLogin}
            disabled={loading}
            activeOpacity={0.88}
          >
            {loading ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Text style={styles.signInPillBtnText}>Sign In</Text>
            )}
          </TouchableOpacity>

          {/* FORGOT PASSWORD LINK */}
          <TouchableOpacity
            style={styles.forgotPasswordContainer}
            onPress={() => setShowForgotPasswordModal(true)}
            activeOpacity={0.7}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Text style={styles.forgotPasswordText}>Forgot password?</Text>
          </TouchableOpacity>

          {/* OR DIVIDER */}
          <View style={styles.orDividerContainer}>
            <View style={styles.orDividerLine} />
            <Text style={styles.orDividerText}>or</Text>
            <View style={styles.orDividerLine} />
          </View>

          {/* SOCIAL / ALTERNATIVE SIGN IN (GOOGLE & PHONE) */}
          <View style={styles.socialRow}>
            <TouchableOpacity
              style={styles.socialPillBtn}
              onPress={handleGoogleSignIn}
              disabled={loading}
              activeOpacity={0.8}
            >
              <GoogleGLogo size={16} />
              <Text style={styles.socialPillBtnText}>Google</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.socialPillBtn}
              onPress={handlePhoneSignIn}
              disabled={loading}
              activeOpacity={0.8}
            >
              <Phone size={15} color="#1E255E" strokeWidth={2.2} />
              <Text style={styles.socialPillBtnText}>Phone</Text>
            </TouchableOpacity>
          </View>

          {/* SIGN UP PROMPT LINK */}
          <View style={styles.signUpPromptRow}>
            <Text style={styles.signUpPromptText}>Don't have an account? </Text>
            <TouchableOpacity
              onPress={() => navigation.navigate('EmployerSignup', { initialRole: role })}
              activeOpacity={0.7}
            >
              <Text style={styles.signUpHighlightText}>Sign Up</Text>
            </TouchableOpacity>
          </View>
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
  keyboardAvoid: {
    flex: 1,
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
    marginBottom: 32,
  },
  sheetTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: '#1E255E',
    letterSpacing: -0.5,
    marginBottom: 6,
  },
  sheetSubtitle: {
    fontSize: 14,
    fontWeight: '400',
    color: '#64748B',
    lineHeight: 20,
  },
  scrollContent: {
    paddingHorizontal: 28,
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
  forgotPasswordContainer: {
    alignItems: 'center',
    marginBottom: 4,
    paddingVertical: 4,
  },
  forgotPasswordText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#475569',
  },
  orDividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    marginTop: 22,
    marginBottom: 22,
    paddingHorizontal: 16,
    width: '100%',
  },
  orDividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#E2E8F0',
  },
  orDividerText: {
    fontSize: 12.5,
    color: '#94A3B8',
    fontWeight: '500',
    textTransform: 'lowercase',
  },
  socialRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    marginBottom: 26,
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
    paddingVertical: 8,
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

