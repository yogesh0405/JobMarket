import React, { useState } from 'react';
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
import Svg, { Path } from 'react-native-svg';
import {
  Mail,
  Lock,
  Building2,
  User as UserIcon,
  Phone,
  CheckCircle2,
  ArrowRight,
  Eye,
  EyeOff,
  HelpCircle,
  Briefcase,
  FileText,
  Wrench,
  ChevronLeft,
} from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../../hooks/useAuth';
import { ErrorBanner } from '../../components/common/ErrorBanner';
import { JobMarketLogoSvg } from '../../components/common/JobMarketLogoSvg';
import { COLORS } from '../../constants/theme';
import { signupSchema } from '../../utils/validators';

interface Props {
  navigation: any;
  route?: any;
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
  const [phone, setPhone] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [gstNumber, setGstNumber] = useState('');
  const [tradeSpecialization, setTradeSpecialization] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
      const firstError = result.error.issues[0]?.message || 'Please fill in all required fields correctly.';
      setError(firstError);
      return;
    }

    setLoading(true);
    try {
      await signup(payload);
    } catch (err: any) {
      setError(err.message || 'Registration failed. Please check details and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <StatusBar barStyle="light-content" backgroundColor="#10386E" />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* TOP BRAND HEADER SECTION (Navy Blue) */}
        <View style={[styles.brandHeader, { paddingTop: Math.max(insets.top + 8, 24) }]}>
          {/* Logo & Enterprise Certification Badge + Back / Help Button */}
          <View style={styles.brandTopRow}>
            <View style={styles.logoTitleRow}>
              <View style={styles.logoSquare}>
                <JobMarketLogoSvg size={32} />
              </View>
              <View style={styles.titleBadgeColumn}>
                <Text style={styles.brandTitleText}>JobMarket</Text>
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

          {/* Title & Subtitle */}
          <Text style={styles.sheetTitle}>Create your new account</Text>
          <Text style={styles.sheetSubtitle}>
            {role === 'candidate' ? 'Candidate & job seeker registration' : 'Recruiter & company workspace setup'}
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

          {/* Name Field */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>
              Full name<Text style={{ color: '#EF4444' }}>*</Text>
            </Text>
            <View style={styles.inputBox}>
              <UserIcon size={18} color="#94A3B8" />
              <TextInput
                style={styles.textInput}
                placeholder="Ramesh Sharma"
                placeholderTextColor="#94A3B8"
                value={name}
                onChangeText={(t) => {
                  setName(t);
                  if (error) setError(null);
                }}
              />
            </View>
          </View>

          {/* Email Field */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>
              Official email address<Text style={{ color: '#EF4444' }}>*</Text>
            </Text>
            <View style={styles.inputBox}>
              <Mail size={18} color="#94A3B8" />
              <TextInput
                style={styles.textInput}
                placeholder="candidate@email.com"
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

          {/* Phone Field */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>
              Mobile phone number<Text style={{ color: '#EF4444' }}>*</Text>
            </Text>
            <View style={styles.inputBox}>
              <Phone size={18} color="#94A3B8" />
              <TextInput
                style={styles.textInput}
                placeholder="9876543210"
                placeholderTextColor="#94A3B8"
                keyboardType="phone-pad"
                value={phone}
                onChangeText={(t) => {
                  setPhone(t);
                  if (error) setError(null);
                }}
              />
            </View>
          </View>

          {/* Role specific inputs */}
          {role === 'employer' ? (
            <>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>
                  Company name<Text style={{ color: '#EF4444' }}>*</Text>
                </Text>
                <View style={styles.inputBox}>
                  <Building2 size={18} color="#94A3B8" />
                  <TextInput
                    style={styles.textInput}
                    placeholder="Tata Motors Ltd"
                    placeholderTextColor="#94A3B8"
                    value={companyName}
                    onChangeText={setCompanyName}
                  />
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>GSTIN / Business Registration (Optional)</Text>
                <View style={styles.inputBox}>
                  <FileText size={18} color="#94A3B8" />
                  <TextInput
                    style={styles.textInput}
                    placeholder="27AAAAA0000A1Z5"
                    placeholderTextColor="#94A3B8"
                    autoCapitalize="characters"
                    value={gstNumber}
                    onChangeText={setGstNumber}
                  />
                </View>
              </View>
            </>
          ) : (
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Trade / Skill Specialization (Optional)</Text>
              <View style={styles.inputBox}>
                <Wrench size={18} color="#94A3B8" />
                <TextInput
                  style={styles.textInput}
                  placeholder="CNC Operator / Turner / Welder"
                  placeholderTextColor="#94A3B8"
                  value={tradeSpecialization}
                  onChangeText={setTradeSpecialization}
                />
              </View>
            </View>
          )}

          {/* Password Field */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>
              Account password<Text style={{ color: '#EF4444' }}>*</Text>
            </Text>
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
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                {showPassword ? <EyeOff size={18} color="#64748B" /> : <Eye size={18} color="#64748B" />}
              </TouchableOpacity>
            </View>
          </View>

          {/* Confirm Password Field */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>
              Confirm password<Text style={{ color: '#EF4444' }}>*</Text>
            </Text>
            <View style={styles.inputBox}>
              <Lock size={18} color="#94A3B8" />
              <TextInput
                style={styles.textInput}
                placeholder="••••••••"
                placeholderTextColor="#94A3B8"
                secureTextEntry={!showPassword}
                value={confirmPassword}
                onChangeText={(t) => {
                  setConfirmPassword(t);
                  if (error) setError(null);
                }}
              />
            </View>
          </View>

          {/* Primary CTA Button: Create Account -> */}
          <TouchableOpacity
            style={styles.primarySignUpBtn}
            onPress={handleSignup}
            disabled={loading}
            activeOpacity={0.88}
          >
            {loading ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <>
                <Text style={styles.primarySignUpBtnText}>Create Account</Text>
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

          {/* Social / Alternate Registration Row */}
          <View style={styles.socialButtonsRow}>
            <TouchableOpacity
              style={styles.socialBtn}
              onPress={handleGoogleSignUp}
              disabled={loading}
              activeOpacity={0.8}
            >
              <GoogleGLogo size={18} />
              <Text style={styles.socialBtnText}>Google</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.socialBtn}
              onPress={() => navigation.navigate('VerifyOTP')}
              disabled={loading}
              activeOpacity={0.8}
            >
              <View style={styles.phoneIconBadge}>
                <Phone size={12} color="#16A34A" />
              </View>
              <Text style={styles.socialBtnText}>Phone Number</Text>
            </TouchableOpacity>
          </View>

          {/* Footer Login Link */}
          <View style={styles.footerLinkRow}>
            <Text style={styles.footerText}>Already have an account? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('EmployerLogin')}>
              <Text style={styles.footerLinkBold}>Sign in</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#10386E',
  },
  scrollContent: {
    flexGrow: 1,
    backgroundColor: '#10386E',
  },

  // Brand Header (Navy Blue)
  brandHeader: {
    backgroundColor: '#10386E',
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
    gap: 10,
  },
  backBtnSquare: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
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
    backgroundColor: '#10386E',
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
  inputLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#334155',
    marginBottom: 6,
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

  // Primary Sign Up Button
  primarySignUpBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#10386E',
    height: 50,
    borderRadius: 12,
    shadowColor: '#10386E',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 3,
    marginTop: 8,
  },
  primarySignUpBtnText: {
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
    color: '#10386E',
  },
});
