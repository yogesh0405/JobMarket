import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Modal,
  TextInput,
  ActivityIndicator,
  StatusBar,
} from 'react-native';
import Svg, { Path } from 'react-native-svg';
import {
  Mail,
  Lock,
  Building2,
  User as UserIcon,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  Eye,
  EyeOff,
  HelpCircle,
  Phone,
  Briefcase,
  X,
  KeyRound,
} from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../context/ToastContext';
import { ErrorBanner } from '../../components/common/ErrorBanner';
import { JobMarketLogoSvg } from '../../components/common/JobMarketLogoSvg';
import { COLORS } from '../../constants/theme';
import { loginSchema } from '../../utils/validators';

interface Props {
  navigation: any;
}

// Custom Google G Logo SVG
const GoogleGLogo: React.FC<{ size?: number }> = ({ size = 18 }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <Path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
    <Path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
    <Path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
    <Path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
  </Svg>
);

export const EmployerLoginScreen: React.FC<Props> = ({ navigation }) => {
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

  // 2FA Modal State
  const [show2FAModal, setShow2FAModal] = useState(false);
  const [mfaToken, setMfaToken] = useState('');
  const [twoFactorOtp, setTwoFactorOtp] = useState('');
  const [twoFactorLoading, setTwoFactorLoading] = useState(false);
  const [twoFactorError, setTwoFactorError] = useState<string | null>(null);

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
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" translucent={false} />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* TOP BRAND HEADER SECTION (Navy Blue) */}
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
                  <CheckCircle2 size={11} color="#34D399" />
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
              <TouchableOpacity
                onPress={() => {
                  showToast('Sending password reset link...', 'info');
                }}
              >
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

      {/* 2FA Modal */}
      <Modal visible={show2FAModal} transparent animationType="fade" onRequestClose={() => setShow2FAModal(false)}>
        <View style={styles.modalBackdrop}>
          <View style={styles.mfaCard}>
            <View style={styles.mfaHeaderRow}>
              <View style={styles.mfaIconBadge}>
                <ShieldCheck size={22} color={COLORS.primary} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.mfaTitle}>Two-Factor Security</Text>
                <Text style={styles.mfaSub}>Enter the 6-digit OTP code sent to your registered email.</Text>
              </View>
              <TouchableOpacity onPress={() => setShow2FAModal(false)}>
                <X size={20} color="#64748B" />
              </TouchableOpacity>
            </View>

            {twoFactorError ? <ErrorBanner message={twoFactorError} style={{ marginBottom: 12 }} /> : null}

            <View style={styles.mfaInputBox}>
              <KeyRound size={18} color={COLORS.primary} />
              <TextInput
                style={styles.mfaTextInput}
                placeholder="123456"
                placeholderTextColor="#94A3B8"
                keyboardType="number-pad"
                maxLength={6}
                value={twoFactorOtp}
                onChangeText={(t) => {
                  setTwoFactorOtp(t);
                  if (twoFactorError) setTwoFactorError(null);
                }}
              />
            </View>

            <TouchableOpacity style={styles.mfaSubmitBtn} onPress={handleVerify2FACode} disabled={twoFactorLoading}>
              {twoFactorLoading ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Text style={styles.mfaSubmitBtnText}>Verify 2FA Code</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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

  // Brand Header (Primary Blue)
  brandHeader: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 20,
    paddingBottom: 28,
  },
  brandTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  logoTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  logoSquare: {
    width: 44,
    height: 44,
    borderRadius: 12,
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
    gap: 2,
  },
  brandTitleText: {
    fontSize: 22,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: -0.3,
  },
  enterprisePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.25)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  enterprisePillText: {
    fontSize: 9.5,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  helpCircleBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroHeadlineText: {
    fontSize: 22,
    fontWeight: '800',
    color: '#FFFFFF',
    lineHeight: 28,
    marginTop: 20,
    marginBottom: 18,
    maxWidth: '92%',
  },

  // 3 Metric Stat Cards
  statsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  statCard: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.10)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.22)',
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statNumberText: {
    fontSize: 17,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  statLabelText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#CBD5E1',
    marginTop: 2,
  },

  // White Card Sheet
  whiteSheetCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 40,
    marginTop: -4,
  },
  dragHandleBar: {
    width: 36,
    height: 4,
    backgroundColor: '#CBD5E1',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 16,
  },
  sheetTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0F172A',
  },
  sheetSubtitle: {
    fontSize: 13,
    fontWeight: '500',
    color: '#64748B',
    marginTop: 2,
    marginBottom: 16,
  },

  // Role Segmented Selector
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
    gap: 8,
    height: 40,
    borderRadius: 6,
  },
  roleSegmentTabActive: {
    backgroundColor: COLORS.primary,
  },
  roleSegmentTabText: {
    fontSize: 13.5,
    fontWeight: '700',
    color: '#475569',
  },
  roleSegmentTabTextActive: {
    color: '#FFFFFF',
    fontWeight: '800',
  },

  // Form Inputs
  inputGroup: {
    marginBottom: 16,
  },
  labelLinkRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#334155',
    marginBottom: 6,
  },
  forgotLinkText: {
    fontSize: 12.5,
    fontWeight: '700',
    color: COLORS.primary,
  },
  inputBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 10,
    paddingHorizontal: 12,
    height: 48,
    gap: 10,
  },
  textInput: {
    flex: 1,
    height: '100%',
    fontSize: 14,
    fontWeight: '600',
    color: '#0F172A',
    paddingVertical: 0,
    margin: 0,
  },

  // Checkbox
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
    borderColor: '#94A3B8',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
  },
  checkboxSquareActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  checkboxLabelText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#475569',
  },

  // Primary Sign In Button
  primarySignInBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: COLORS.primary,
    height: 50,
    borderRadius: 12,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 3,
  },
  primarySignInBtnText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#FFFFFF',
  },

  // OR CONTINUE WITH Divider
  orDividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
    gap: 10,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#E2E8F0',
  },
  orDividerText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#94A3B8',
    letterSpacing: 0.8,
  },

  // Social Buttons
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
    height: 46,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 12,
  },
  socialBtnText: {
    fontSize: 13.5,
    fontWeight: '700',
    color: '#0F172A',
  },
  phoneIconBadge: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#DCFCE7',
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Footer Link
  footerLinkRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 4,
  },
  footerText: {
    fontSize: 13.5,
    fontWeight: '500',
    color: '#64748B',
  },
  footerLinkBold: {
    fontSize: 13.5,
    fontWeight: '800',
    color: COLORS.primary,
  },

  // 2FA Modal
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  mfaCard: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    gap: 16,
  },
  mfaHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  mfaIconBadge: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  mfaTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#0F172A',
  },
  mfaSub: {
    fontSize: 12.5,
    color: '#64748B',
    marginTop: 2,
  },
  mfaInputBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 10,
    paddingHorizontal: 14,
    height: 48,
    gap: 10,
  },
  mfaTextInput: {
    flex: 1,
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: 4,
  },
  mfaSubmitBtn: {
    backgroundColor: COLORS.primary,
    height: 46,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mfaSubmitBtnText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#FFFFFF',
  },
});
