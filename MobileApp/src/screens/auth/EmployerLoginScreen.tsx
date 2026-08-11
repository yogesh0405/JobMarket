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
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import {
  Mail,
  Lock,
  Building2,
  UserCheck,
  ShieldCheck,
  KeyRound,
  X,
  ArrowRight,
  Eye,
  EyeOff,
  Factory,
  Sparkles,
  CheckCircle2,
  UserPlus,
} from 'lucide-react-native';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../context/ToastContext';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { ErrorBanner } from '../../components/common/ErrorBanner';
import { JobMarketLogoSvg } from '../../components/common/JobMarketLogoSvg';
import { COLORS, TYPOGRAPHY, SPACING, RADIUS } from '../../constants/theme';
import { loginSchema } from '../../utils/validators';

interface Props {
  navigation: any;
}

export const EmployerLoginScreen: React.FC<Props> = ({ navigation }) => {
  const { login, loginWithGoogle, verify2FALogin } = useAuth();
  const { showToast } = useToast();

  const [role, setRole] = useState<'employer' | 'candidate'>('employer');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

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
    setFieldErrors({});

    if (!email.trim() || !password.trim()) {
      const errMsg = 'Please enter both email address and password.';
      setError(errMsg);
      showToast(errMsg, 'error');
      return;
    }

    const result = loginSchema.safeParse({ email, password });
    if (!result.success) {
      const errors: Record<string, string> = {};
      result.error.issues.forEach((err: any) => {
        if (err.path[0]) {
          errors[err.path[0].toString()] = err.message;
        }
      });
      setFieldErrors(errors);
      const firstError = result.error.issues[0]?.message || 'Please check email and password format.';
      setError(firstError);
      showToast(firstError, 'error');
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
      const errorMsg = err.message || 'Invalid email or password. Please check your credentials.';
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
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* LAYOUT HEADER: Curved Enterprise Gradient Hero Banner */}
        <LinearGradient
          colors={['#0F172A', '#032B69', '#1E3A8A']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.heroHeader}
        >
          {/* Top Row Logo & Enterprise Badge */}
          <View style={styles.heroTopRow}>
            <View style={styles.logoBadgeContainer}>
              <JobMarketLogoSvg size={66} />
            </View>

            <View style={{ flex: 1 }}>
              <Text style={styles.brandTitleText}>JOBMARKET</Text>
              <View style={styles.verifiedBadgeRow}>
                <CheckCircle2 size={12} color="#34D399" />
                <Text style={styles.verifiedBadgeText}>Enterprise Certified Portal</Text>
              </View>
            </View>
          </View>

          <Text style={styles.heroTaglineText}>
            Connecting skilled ITI workforce & engineers directly with top MIDC factory plants.
          </Text>
        </LinearGradient>

        {/* LAYOUT BODY: Floating Overlapping 3D Form Card */}
        <View style={styles.floatingCardContainer}>
          <View style={styles.formCard3D}>
            {/* Card Header & Welcome Title */}
            <View style={styles.cardHeaderRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.welcomeText}>Sign in to Portal</Text>
                <Text style={styles.welcomeSubtitle}>
                  {role === 'employer'
                    ? 'Recruiter & Company Management Workspace'
                    : 'Candidate Job Applications & Profile Specs'}
                </Text>
              </View>
            </View>

            {/* Segmented RBAC Role Switcher */}
            <View style={styles.segmentedContainer}>
              <TouchableOpacity
                activeOpacity={0.88}
                style={[styles.segmentedTab, role === 'employer' && styles.segmentedTabActive]}
                onPress={() => setRole('employer')}
              >
                <Building2 size={16} color={role === 'employer' ? '#FFFFFF' : '#475569'} />
                <Text style={[styles.segmentedTabText, role === 'employer' && styles.segmentedTabTextActive]}>
                  Employer Portal
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                activeOpacity={0.88}
                style={[styles.segmentedTab, role === 'candidate' && styles.segmentedTabActive]}
                onPress={() => setRole('candidate')}
              >
                <UserCheck size={16} color={role === 'candidate' ? '#FFFFFF' : '#475569'} />
                <Text style={[styles.segmentedTabText, role === 'candidate' && styles.segmentedTabTextActive]}>
                  Employee Workspace
                </Text>
              </TouchableOpacity>
            </View>

            {error ? <ErrorBanner message={error} style={{ marginBottom: 14 }} /> : null}

            {/* Email Field */}
            <View style={{ marginBottom: 14 }}>
              <Input
                label="Official Email Address"
                required
                placeholder={role === 'employer' ? 'recruiter@company.com' : 'candidate@email.com'}
                keyboardType="email-address"
                autoCapitalize="none"
                value={email}
                onChangeText={(text) => {
                  setEmail(text);
                  if (error) setError(null);
                }}
                leftIcon={<Mail size={18} color="#64748B" />}
                error={fieldErrors.email}
                allowClear
                onClear={() => setEmail('')}
              />
            </View>

            {/* Password Field */}
            <View style={{ marginBottom: 16 }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                <Text style={styles.inputLabel}>Account Password *</Text>
                <TouchableOpacity
                  onPress={() => {
                    if (email) {
                      showToast('Sending OTP reset instructions...', 'info');
                    } else {
                      showToast('Please enter your email address first', 'warning');
                    }
                  }}
                >
                  <Text style={styles.forgotPassLink}>Forgot Password?</Text>
                </TouchableOpacity>
              </View>

              <Input
                isPassword
                placeholder="••••••••"
                value={password}
                onChangeText={(text) => {
                  setPassword(text);
                  if (error) setError(null);
                }}
                leftIcon={<Lock size={18} color="#64748B" />}
                error={fieldErrors.password}
              />
            </View>

            {/* Primary Action Button */}
            <TouchableOpacity
              activeOpacity={0.88}
              style={styles.primaryActionButton}
              onPress={handleLogin}
              disabled={loading}
            >
              <Text style={styles.primaryActionButtonText}>
                {loading ? 'Authenticating...' : 'Sign In'}
              </Text>
              <ArrowRight size={18} color="#FFFFFF" />
            </TouchableOpacity>

            {/* Google Authentication (Commented out for future implementation)
            <View style={styles.dividerRow}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>OR</Text>
              <View style={styles.dividerLine} />
            </View>

            <TouchableOpacity
              activeOpacity={0.88}
              style={styles.googleAuthButton}
              onPress={handleGoogleSignIn}
              disabled={loading}
            >
              <View style={styles.googleIconBadge}>
                <Text style={styles.googleIconText}>G</Text>
              </View>
              <Text style={styles.googleAuthButtonText}>Continue with Google</Text>
            </TouchableOpacity>
            */}

            {/* Register Link Footer */}
            <View style={styles.footerRegisterRow}>
              <Text style={styles.footerText}>
                {role === 'employer' ? "Need a company account? " : "New candidate user? "}
              </Text>
              <TouchableOpacity
                onPress={() => {
                  navigation.navigate('EmployerSignup', { initialRole: role });
                }}
              >
                <Text style={styles.registerLinkText}>Register Now</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* 2FA Verification Modal Overlay */}
      <Modal visible={show2FAModal} transparent animationType="fade" onRequestClose={() => setShow2FAModal(false)}>
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setShow2FAModal(false)}>
          <TouchableOpacity activeOpacity={1} style={styles.modalCard} onPress={(e) => e.stopPropagation()}>
            <View style={styles.modalHeaderRow}>
              <View style={styles.modalIconBox}>
                <ShieldCheck size={22} color="#0066C2" />
              </View>
              <TouchableOpacity style={styles.modalCloseBtn} onPress={() => setShow2FAModal(false)}>
                <X size={18} color="#64748B" />
              </TouchableOpacity>
            </View>

            <Text style={styles.modalTitleText}>2FA Security Verification Required</Text>
            <Text style={styles.modalSubText}>
              Two-Factor Authentication is enabled. Enter the 6-digit OTP code transmitted to{' '}
              <Text style={{ fontWeight: '800', color: '#032B69' }}>{email}</Text>.
            </Text>

            {twoFactorError ? <ErrorBanner message={twoFactorError} style={{ marginBottom: 12 }} /> : null}

            <Input
              label="6-Digit OTP Security Code"
              placeholder="e.g. 123456"
              keyboardType="number-pad"
              maxLength={6}
              value={twoFactorOtp}
              onChangeText={setTwoFactorOtp}
              leftIcon={<KeyRound size={18} color="#64748B" />}
            />

            <Button
              title="Verify 2FA Code & Access Portal"
              loading={twoFactorLoading}
              onPress={handleVerify2FACode}
              style={{ marginTop: 12 }}
            />
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F1F5F9',
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 30,
  },
  heroHeader: {
    paddingTop: Platform.OS === 'ios' ? 60 : 44,
    paddingHorizontal: 20,
    paddingBottom: 48,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
  },
  heroTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    marginBottom: 12,
  },
  logoBadgeContainer: {
    width: 76,
    height: 76,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#93C5FD',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 6,
  },
  brandTitleText: {
    fontSize: 24,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 1.5,
  },
  verifiedBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.25)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
    alignSelf: 'flex-start',
    marginTop: 4,
  },
  verifiedBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#E2E8F0',
    letterSpacing: 0.4,
  },
  heroTaglineText: {
    fontSize: 12.5,
    color: '#CBD5E1',
    lineHeight: 18,
    fontWeight: '500',
  },
  floatingCardContainer: {
    paddingHorizontal: 16,
    marginTop: -24,
  },
  formCard3D: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  cardHeaderRow: {
    marginBottom: 16,
  },
  welcomeText: {
    fontSize: 20,
    fontWeight: '900',
    color: '#0F172A',
    letterSpacing: -0.3,
  },
  welcomeSubtitle: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 3,
    lineHeight: 17,
  },
  segmentedContainer: {
    flexDirection: 'row',
    backgroundColor: '#F1F5F9',
    borderRadius: 10,
    padding: 3,
    gap: 4,
    marginBottom: 16,
  },
  segmentedTab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 9,
    borderRadius: 8,
  },
  segmentedTabActive: {
    backgroundColor: '#2563EB',
  },
  segmentedTabText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
  },
  segmentedTabTextActive: {
    color: '#FFFFFF',
    fontWeight: '800',
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#334155',
    marginBottom: 4,
  },
  forgotPassLink: {
    fontSize: 11.5,
    fontWeight: '800',
    color: '#2563EB',
  },
  inputEyeWrapper: {
    position: 'relative',
  },
  eyeIconBtn: {
    position: 'absolute',
    right: 12,
    top: 38,
    padding: 4,
  },
  primaryActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#2563EB',
    paddingVertical: 13,
    borderRadius: 10,
    marginTop: 6,
  },
  primaryActionButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 12,
    gap: 10,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#E2E8F0',
  },
  dividerText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#94A3B8',
  },
  googleAuthButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
    borderBottomWidth: 2.5,
    borderBottomColor: '#CBD5E1',
    paddingVertical: 11,
    borderRadius: 8,
  },
  googleIconBadge: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  googleIconText: {
    fontSize: 13,
    fontWeight: '900',
    color: '#4285F4',
  },
  googleAuthButtonText: {
    fontSize: 13.5,
    fontWeight: '800',
    color: '#1E293B',
  },
  secondarySignupButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#EFF6FF',
    borderWidth: 1.5,
    borderColor: '#93C5FD',
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginTop: 12,
  },
  secondarySignupButtonText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0066C2',
  },
  footerRegisterRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 18,
  },
  footerText: {
    fontSize: 12.5,
    color: '#64748B',
  },
  registerLinkText: {
    fontSize: 12.5,
    fontWeight: '800',
    color: '#2563EB',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    justifyContent: 'center',
    padding: 20,
  },
  modalCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  modalHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  modalIconBox: {
    width: 44,
    height: 44,
    borderRadius: 10,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalCloseBtn: {
    padding: 6,
  },
  modalTitleText: {
    fontSize: 18,
    fontWeight: '900',
    color: '#0F172A',
    marginBottom: 4,
  },
  modalSubText: {
    fontSize: 13,
    color: '#64748B',
    lineHeight: 18,
    marginBottom: 16,
  },
});
