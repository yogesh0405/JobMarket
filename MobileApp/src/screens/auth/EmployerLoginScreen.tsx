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
} from 'react-native';
import {
  Mail,
  Lock,
  User as UserIcon,
  CheckCircle2,
  ArrowRight,
  Eye,
  EyeOff,
  Phone,
  Briefcase,
  KeyRound,
} from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../context/ToastContext';
import { ErrorBanner } from '../../components/common/ErrorBanner';
import { JobMarketLogoSvg } from '../../components/common/JobMarketLogoSvg';
import { ConfirmationModal } from '../../components/common/ConfirmationModal';
import { SuccessModal } from '../../components/common/SuccessModal';
import { COLORS } from '../../constants/theme';
import { authApi } from '../../api/authApi';
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

  const handleGoogleSignIn = async () => {
    try {
      setLoading(true);
      setError(null);
      const userGoogleEmail = email.trim() || (role === 'employer' ? 'employer.google@gmail.com' : 'candidate.google@gmail.com');
      const rawName = userGoogleEmail.split('@')[0].replace(/[\._]/g, ' ');
      const formattedName = rawName.charAt(0).toUpperCase() + rawName.slice(1);

      await loginWithGoogle({
        email: userGoogleEmail.toLowerCase(),
        name: formattedName,
        role: role,
        googleId: `google_user_${Date.now()}`,
      });
    } catch (err: any) {
      setError(err.message || 'Google Sign-In failed');
      showToast(err.message || 'Google Sign-In failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async () => {
    setError(null);

    if (!email.trim() || !password.trim()) {
      const errMsg = 'Please enter mobile/email and password.';
      setError(errMsg);
      showToast(errMsg, 'error');
      return;
    }

    setLoading(true);
    try {
      const loginRes = await login({ email, password, role });
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

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <StatusBar barStyle="dark-content" backgroundColor="transparent" />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* TOP BRAND HEADER SECTION (Primary Blue) */}
        <View style={[styles.brandHeader, { paddingTop: Math.max(insets.top + 8, 24) }]}>
          {/* Logo & Enterprise Certification Badge + Help Button */}
          <View style={styles.brandTopRow}>
            <View style={styles.logoTitleRow}>
              <View style={styles.logoSquare}>
                <JobMarketLogoSvg size={32} />
              </View>
              <View style={styles.titleBadgeColumn}>
                <Text style={styles.brandTitleText}>JobMarket</Text>

                {/* ENTERPRISE CERTIFIED Pill */}
                <View style={styles.enterprisePill}>
                  <CheckCircle2 size={11} color="#FFFFFF" />
                  <Text style={styles.enterprisePillText}>ENTERPRISE CERTIFIED</Text>
                </View>
              </View>
            </View>
          </View>

          {/* Headline Text */}
          <Text style={styles.heroHeadlineText}>
            Where skilled talent meets the factory floor.
          </Text>

          {/* 3 Metric Stat Glass Cards Row */}
          <View style={styles.statsRow}>
            <View style={styles.statCard}>
              <Text style={styles.statNumberText}>42K+</Text>
              <Text style={styles.statLabelText}>Workers Placed</Text>
            </View>

            <View style={styles.statCard}>
              <Text style={styles.statNumberText}>860+</Text>
              <Text style={styles.statLabelText}>Plants Hiring</Text>
            </View>

            <View style={styles.statCard}>
              <Text style={styles.statNumberText}>36</Text>
              <Text style={styles.statLabelText}>Districts</Text>
            </View>
          </View>
        </View>

        {/* BOTTOM FORM SHEET CARD (Solid White with Curved Top Corners) */}
        <View style={styles.whiteSheetCard}>
          {/* Drag Handle Bar Indicator */}
          <View style={styles.dragHandleBar} />

          {/* Sign in Title & Subtitle */}
          <Text style={styles.sheetTitle}>Sign in to your workspace</Text>
          <Text style={styles.sheetSubtitle}>
            {role === 'candidate' ? 'Candidate & job application portal' : 'Recruiter & company hiring portal'}
          </Text>

          {/* Segmented Role Switcher: Employer vs Employee */}
          <View style={styles.roleSegmentContainer}>
            <TouchableOpacity
              activeOpacity={0.85}
              style={[styles.roleSegmentTab, role === 'employer' && styles.roleSegmentTabActive]}
              onPress={() => setRole('employer')}
            >
              <Briefcase size={16} color={role === 'employer' ? '#FFFFFF' : '#475569'} />
              <Text style={[styles.roleSegmentTabText, role === 'employer' && styles.roleSegmentTabTextActive]}>
                Employer
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.85}
              style={[styles.roleSegmentTab, role === 'candidate' && styles.roleSegmentTabActive]}
              onPress={() => setRole('candidate')}
            >
              <UserIcon size={16} color={role === 'candidate' ? '#FFFFFF' : '#475569'} />
              <Text style={[styles.roleSegmentTabText, role === 'candidate' && styles.roleSegmentTabTextActive]}>
                Employee
              </Text>
            </TouchableOpacity>
          </View>

          {error ? <ErrorBanner message={error} style={{ marginBottom: 14 }} /> : null}

          {/* Input 1: Mobile or email* */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>
              Mobile or email<Text style={{ color: '#EF4444' }}>*</Text>
            </Text>
            <View style={styles.inputBox}>
              <Mail size={18} color="#94A3B8" />
              <TextInput
                style={styles.textInput}
                placeholder={role === 'candidate' ? 'candidate@email.com' : 'recruiter@company.com'}
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
          </View>

          {/* Input 2: Account password* */}
          <View style={styles.inputGroup}>
            <View style={styles.labelLinkRow}>
              <Text style={styles.inputLabel}>
                Account password<Text style={{ color: '#EF4444' }}>*</Text>
              </Text>
              <TouchableOpacity onPress={handleOpenForgotPassword}>
                <Text style={styles.forgotLinkText}>Forgot?</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.inputBox}>
              <Lock size={18} color="#94A3B8" />
              <TextInput
                style={styles.textInput}
                placeholder="••••••••"
                placeholderTextColor="#94A3B8"
                secureTextEntry={!showPassword}
                value={password}
                onChangeText={(t) => {
                  setPassword(t);
                  if (error) setError(null);
                }}
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                {showPassword ? <EyeOff size={18} color="#64748B" /> : <Eye size={18} color="#64748B" />}
              </TouchableOpacity>
            </View>
          </View>

          {/* Keep me signed in Checkbox */}
          <TouchableOpacity
            style={styles.checkboxRow}
            activeOpacity={0.8}
            onPress={() => setKeepSignedIn(!keepSignedIn)}
          >
            <View style={[styles.checkboxSquare, keepSignedIn && styles.checkboxSquareActive]}>
              {keepSignedIn && <CheckCircle2 size={14} color="#FFFFFF" />}
            </View>
            <Text style={styles.checkboxLabelText}>Keep me signed in</Text>
          </TouchableOpacity>

          {/* Primary CTA Button: Sign in -> */}
          <TouchableOpacity
            style={styles.primarySignInBtn}
            onPress={handleLogin}
            disabled={loading}
            activeOpacity={0.88}
          >
            {loading ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <>
                <Text style={styles.primarySignInBtnText}>Sign in</Text>
                <ArrowRight size={18} color="#FFFFFF" />
              </>
            )}
          </TouchableOpacity>

          {/* OR CONTINUE WITH Divider */}
          <View style={styles.orDividerRow}>
            <View style={styles.dividerLine} />
            <Text style={styles.orDividerText}>OR CONTINUE WITH</Text>
            <View style={styles.dividerLine} />
          </View>

          {/* Social / Alternate Login Row */}
          <View style={styles.socialButtonsRow}>
            {/* Google Login Button */}
            <TouchableOpacity
              style={styles.socialBtn}
              onPress={handleGoogleSignIn}
              disabled={loading}
              activeOpacity={0.8}
            >
              <GoogleGLogo size={18} />
              <Text style={styles.socialBtnText}>Google</Text>
            </TouchableOpacity>

            {/* Phone Number Login Button */}
            <TouchableOpacity
              style={styles.socialBtn}
              onPress={() => {
                showToast('Enter your mobile number to sign in via SMS OTP', 'info');
              }}
              disabled={loading}
              activeOpacity={0.8}
            >
              <View style={styles.phoneIconBadge}>
                <Phone size={12} color="#16A34A" />
              </View>
              <Text style={styles.socialBtnText}>Phone Number</Text>
            </TouchableOpacity>
          </View>

          {/* Footer Signup Link */}
          <View style={styles.footerLinkRow}>
            <Text style={styles.footerText}>Don't have an account? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('EmployerSignup', { initialRole: role })}>
              <Text style={styles.footerLinkBold}>Sign up now</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

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
    backgroundColor: COLORS.primary,
  },
  scrollContent: {
    flexGrow: 1,
    backgroundColor: COLORS.primary,
  },
  brandHeader: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 20,
    paddingBottom: 28,
  },
  brandTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  logoTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  logoSquare: {
    width: 44,
    height: 44,
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  titleBadgeColumn: {
    justifyContent: 'center',
  },
  brandTitleText: {
    fontSize: 20,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  enterprisePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.25)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 12,
    marginTop: 2,
  },
  enterprisePillText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  heroHeadlineText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 20,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  statCard: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.25)',
    padding: 10,
    alignItems: 'center',
  },
  statNumberText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  statLabelText: {
    fontSize: 10,
    color: '#E2E8F0',
    marginTop: 2,
  },
  whiteSheetCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 32,
  },
  dragHandleBar: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#CBD5E1',
    alignSelf: 'center',
    marginBottom: 16,
  },
  sheetTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: '#0F172A',
  },
  sheetSubtitle: {
    fontSize: 13,
    color: '#64748B',
    marginTop: 2,
    marginBottom: 18,
  },
  roleSegmentContainer: {
    flexDirection: 'row',
    backgroundColor: '#F1F5F9',
    borderRadius: 8,
    padding: 3,
    marginBottom: 18,
  },
  roleSegmentTab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: 6,
  },
  roleSegmentTabActive: {
    backgroundColor: COLORS.primary,
  },
  roleSegmentTabText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#475569',
  },
  roleSegmentTabTextActive: {
    color: '#FFFFFF',
  },
  inputGroup: {
    marginBottom: 14,
  },
  labelLinkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  inputLabel: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#334155',
    marginBottom: 6,
  },
  forgotLinkText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.primary,
  },
  inputBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 46,
  },
  textInput: {
    flex: 1,
    height: '100%',
    fontSize: 14,
    color: '#0F172A',
    fontWeight: '600',
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 18,
  },
  checkboxSquare: {
    width: 18,
    height: 18,
    borderRadius: 4,
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
  },
  checkboxSquareActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  checkboxLabelText: {
    fontSize: 12.5,
    color: '#475569',
    fontWeight: '600',
  },
  primarySignInBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: COLORS.primary,
    height: 48,
    borderRadius: 8,
    marginBottom: 20,
  },
  primarySignInBtnText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  orDividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#E2E8F0',
  },
  orDividerText: {
    fontSize: 10.5,
    fontWeight: '800',
    color: '#94A3B8',
    letterSpacing: 0.5,
  },
  socialButtonsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  socialBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    height: 44,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 8,
  },
  phoneIconBadge: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#DCFCE7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  socialBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#334155',
  },
  footerLinkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  footerText: {
    fontSize: 13,
    color: '#64748B',
  },
  footerLinkBold: {
    fontSize: 13,
    fontWeight: '800',
    color: COLORS.primary,
  },
});
