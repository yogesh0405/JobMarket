import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import {
  User as UserIcon,
  Mail,
  Lock,
  Phone,
  Building2,
  FileText,
  Wrench,
  UserCheck,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Eye,
  EyeOff,
} from 'lucide-react-native';
import { useAuth } from '../../hooks/useAuth';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { ErrorBanner } from '../../components/common/ErrorBanner';
import { JobMarketLogoSvg } from '../../components/common/JobMarketLogoSvg';
import { COLORS, TYPOGRAPHY, SPACING, RADIUS } from '../../constants/theme';
import { signupSchema } from '../../utils/validators';

interface Props {
  navigation: any;
  route?: any;
}

export const EmployerSignupScreen: React.FC<Props> = ({ navigation, route }) => {
  const { signup, loginWithGoogle } = useAuth();
  const initialRole = route?.params?.initialRole || 'employer';

  const [role, setRole] = useState<'employer' | 'candidate'>(initialRole);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [phone, setPhone] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [gstNumber, setGstNumber] = useState('');
  const [tradeSpecialization, setTradeSpecialization] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const handleGoogleSignUp = async () => {
    try {
      setLoading(true);
      setError(null);
      const userGoogleEmail = email.trim() || (role === 'employer' ? 'employer.google@gmail.com' : 'candidate.google@gmail.com');
      const rawName = name.trim() || userGoogleEmail.split('@')[0].replace(/[\._]/g, ' ');
      const formattedName = rawName.charAt(0).toUpperCase() + rawName.slice(1);

      await loginWithGoogle({
        email: userGoogleEmail.toLowerCase(),
        name: formattedName,
        role: role,
        googleId: `google_user_${Date.now()}`,
      });
    } catch (err: any) {
      setError(err.message || 'Google Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async () => {
    setError(null);
    setFieldErrors({});

    const payload = {
      name,
      email,
      password,
      confirmPassword,
      phone,
      companyName: role === 'employer' ? companyName : (companyName || `${name}'s Candidate Profile`),
      gstNumber: gstNumber || undefined,
      tradeSpecialization: tradeSpecialization || undefined,
      role,
    };

    const result = signupSchema.safeParse(payload);
    if (!result.success) {
      const errors: Record<string, string> = {};
      result.error.issues.forEach((err: any) => {
        if (err.path[0]) {
          errors[err.path[0].toString()] = err.message;
        }
      });
      setFieldErrors(errors);
      return;
    }

    setLoading(true);
    try {
      const res = await signup(payload);
      navigation.navigate('VerifyOTP', { email: res.email || email });
    } catch (err: any) {
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
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
          colors={COLORS.employerGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.heroHeader}
        >
          {/* Top Back Navigation Row */}
          <TouchableOpacity
            style={styles.backBtnHeader}
            onPress={() => navigation.goBack()}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <ArrowLeft size={20} color="#FFFFFF" />
            <Text style={styles.backBtnText}>Back to Sign In</Text>
          </TouchableOpacity>

          {/* Logo & Enterprise Title */}
          <View style={styles.heroTopRow}>
            <View style={styles.logoBadgeContainer}>
              <JobMarketLogoSvg size={64} />
            </View>

            <View style={{ flex: 1 }}>
              <Text style={styles.brandTitleText}>JOBMARKET</Text>
              <View style={styles.verifiedBadgeRow}>
                <CheckCircle2 size={12} color="#34D399" />
                <Text style={styles.verifiedBadgeText}>Enterprise Account Registration</Text>
              </View>
            </View>
          </View>

          <Text style={styles.heroTaglineText}>
            Hire Smarter. Build Stronger.
          </Text>
        </LinearGradient>

        {/* LAYOUT BODY: Floating Overlapping 3D Form Card */}
        <View style={styles.floatingCardContainer}>
          <View style={styles.formCard3D}>
            {/* Card Header & Title */}
            <View style={styles.cardHeaderRow}>
              <Text style={styles.welcomeText}>Create Account</Text>
              <Text style={styles.welcomeSubtitle}>
                {role === 'employer'
                  ? 'Register your company to post vacancies & access candidate database'
                  : 'Register as a candidate to apply for industrial & technical jobs'}
              </Text>
            </View>

            {/* Segmented RBAC Role Switcher */}
            <Text style={styles.roleSelectorLabel}>SELECT REGISTRATION TYPE</Text>
            <View style={styles.segmentedContainer}>
              <TouchableOpacity
                activeOpacity={0.88}
                style={[styles.segmentedTab, role === 'employer' && styles.segmentedTabActive]}
                onPress={() => setRole('employer')}
              >
                <Building2 size={16} color={role === 'employer' ? '#FFFFFF' : '#475569'} />
                <Text style={[styles.segmentedTabText, role === 'employer' && styles.segmentedTabTextActive]}>
                  Employer Account
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                activeOpacity={0.88}
                style={[styles.segmentedTab, role === 'candidate' && styles.segmentedTabActive]}
                onPress={() => setRole('candidate')}
              >
                <UserCheck size={16} color={role === 'candidate' ? '#FFFFFF' : '#475569'} />
                <Text style={[styles.segmentedTabText, role === 'candidate' && styles.segmentedTabTextActive]}>
                  Candidate Account
                </Text>
              </TouchableOpacity>
            </View>

            {error ? <ErrorBanner message={error} style={{ marginBottom: 14 }} /> : null}

            {/* Form Fields */}
            <Input
              label="Full Name / Contact Person *"
              required
              placeholder="John Doe"
              value={name}
              onChangeText={setName}
              leftIcon={<UserIcon size={18} color="#64748B" />}
              error={fieldErrors.name}
            />

            <Input
              label="Official Email Address *"
              required
              placeholder={role === 'employer' ? 'recruiter@company.com' : 'candidate@email.com'}
              keyboardType="email-address"
              autoCapitalize="none"
              value={email}
              onChangeText={setEmail}
              leftIcon={<Mail size={18} color="#64748B" />}
              error={fieldErrors.email}
            />

            <Input
              label="Mobile Number (10 Digits) *"
              required
              placeholder="9876543210"
              keyboardType="phone-pad"
              maxLength={10}
              value={phone}
              onChangeText={setPhone}
              leftIcon={<Phone size={18} color="#64748B" />}
              error={fieldErrors.phone}
            />

            {role === 'employer' ? (
              <>
                <Input
                  label="Company / Enterprise Name *"
                  required
                  placeholder="Acme Manufacturing Pvt Ltd"
                  value={companyName}
                  onChangeText={setCompanyName}
                  leftIcon={<Building2 size={18} color="#64748B" />}
                  error={fieldErrors.companyName}
                />

                <Input
                  label="GST Number (Optional)"
                  placeholder="27AAAAA0000A1Z5"
                  autoCapitalize="characters"
                  value={gstNumber}
                  onChangeText={setGstNumber}
                  leftIcon={<FileText size={18} color="#64748B" />}
                  error={fieldErrors.gstNumber}
                />
              </>
            ) : null}

            <Input
              label="Trade Specialization / Primary Skill (Optional)"
              placeholder="VMC Operator / CNC Machining / Welder / Fitter"
              value={tradeSpecialization}
              onChangeText={setTradeSpecialization}
              leftIcon={<Wrench size={18} color="#64748B" />}
              error={fieldErrors.tradeSpecialization}
            />

            <Input
              label="Account Password *"
              required
              isPassword
              placeholder="••••••••"
              value={password}
              onChangeText={setPassword}
              leftIcon={<Lock size={18} color="#64748B" />}
              error={fieldErrors.password}
            />

            <Input
              label="Confirm Account Password *"
              required
              isPassword
              placeholder="••••••••"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              leftIcon={<Lock size={18} color="#64748B" />}
              error={fieldErrors.confirmPassword}
            />

            {/* Submit Button */}
            <TouchableOpacity
              activeOpacity={0.88}
              style={styles.primaryActionButton}
              onPress={handleSignup}
              disabled={loading}
            >
              <Text style={styles.primaryActionButtonText}>
                {loading ? 'Registering Account...' : 'Register & Send Email Verification OTP'}
              </Text>
              <ArrowRight size={18} color="#FFFFFF" />
            </TouchableOpacity>

            {/* Google Registration (Commented out for future implementation)
            <View style={styles.dividerRow}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>OR QUICK REGISTER</Text>
              <View style={styles.dividerLine} />
            </View>

            <TouchableOpacity
              activeOpacity={0.88}
              style={styles.googleAuthButton}
              onPress={handleGoogleSignUp}
              disabled={loading}
            >
              <View style={styles.googleIconBadge}>
                <Text style={styles.googleIconText}>G</Text>
              </View>
              <Text style={styles.googleAuthButtonText}>Register with Google Account</Text>
            </TouchableOpacity>
            */}

            {/* Login Link Footer */}
            <View style={styles.footerRegisterRow}>
              <Text style={styles.footerText}>Already have an account? </Text>
              <TouchableOpacity onPress={() => navigation.navigate('EmployerLogin')}>
                <Text style={styles.registerLinkText}>Sign In Here</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>
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
    paddingTop: Platform.OS === 'ios' ? 54 : 36,
    paddingHorizontal: 20,
    paddingBottom: 48,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
  },
  backBtnHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 14,
  },
  backBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#93C5FD',
  },
  heroTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    marginBottom: 10,
  },
  logoBadgeContainer: {
    width: 72,
    height: 72,
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
    fontSize: 23,
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
    fontSize: 9.5,
    fontWeight: '700',
    color: '#E2E8F0',
    letterSpacing: 0.4,
  },
  heroTaglineText: {
    fontSize: 12,
    color: '#CBD5E1',
    lineHeight: 17,
    fontWeight: '500',
  },
  floatingCardContainer: {
    paddingHorizontal: 16,
    marginTop: -26,
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
    marginBottom: 14,
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
  roleSelectorLabel: {
    fontSize: 10.5,
    fontWeight: '800',
    color: '#64748B',
    letterSpacing: 0.8,
    marginBottom: 6,
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
    backgroundColor: COLORS.primary,
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
    backgroundColor: COLORS.primary,
    paddingVertical: 13,
    borderRadius: 10,
    marginTop: 10,
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
    fontSize: 10.5,
    fontWeight: '800',
    color: '#94A3B8',
    letterSpacing: 0.5,
  },
  googleAuthButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    paddingVertical: 11,
    borderRadius: 10,
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
    color: COLORS.primary,
  },
});
