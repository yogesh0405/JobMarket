import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, KeyboardAvoidingView, Platform, Modal } from 'react-native';
import { Mail, Lock, Building2, UserCheck, ShieldCheck, KeyRound, X } from 'lucide-react-native';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../context/ToastContext';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { ErrorBanner } from '../../components/common/ErrorBanner';
import { COLORS, TYPOGRAPHY, SPACING, RADIUS } from '../../constants/theme';
import { loginSchema } from '../../utils/validators';

interface Props {
  navigation: any;
}

export const EmployerLoginScreen: React.FC<Props> = ({ navigation }) => {
  const { login, verify2FALogin } = useAuth();
  const { showToast } = useToast();

  const [role, setRole] = useState<'employer' | 'candidate'>('employer');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  // 2FA Modal State
  const [show2FAModal, setShow2FAModal] = useState(false);
  const [mfaToken, setMfaToken] = useState('');
  const [twoFactorOtp, setTwoFactorOtp] = useState('');
  const [twoFactorLoading, setTwoFactorLoading] = useState(false);
  const [twoFactorError, setTwoFactorError] = useState<string | null>(null);

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
      } else {
        showToast(role === 'candidate' ? '🎉 Welcome to Employee Portal!' : '🎉 Welcome back to Employer Portal!', 'success');
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
      showToast('🎉 2FA Verification Successful! Welcome back.', 'success');
    } catch (err: any) {
      setTwoFactorError(err.message || 'Invalid 6-digit 2FA security code.');
    } finally {
      setTwoFactorLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        {/* Header Branding */}
        <View style={styles.brandHeader}>
          <View style={styles.iconBadge}>
            <Building2 size={36} color={COLORS.primary} />
          </View>
          <Text style={styles.appTitle}>CSN Job Market</Text>
          <Text style={styles.portalSubtitle}>Employer Enterprise Portal</Text>
        </View>

        {/* Card Form */}
        <View style={styles.card}>
          <Text style={styles.welcomeText}>Sign in to your account</Text>
          <Text style={styles.instructionText}>
            {role === 'employer'
              ? 'Manage industrial job postings, candidates, and company profile'
              : 'Access industrial candidate workspace and job applications'}
          </Text>

          {/* RBAC Role Selector Pills */}
          <Text style={styles.roleSelectorLabel}>SELECT ACCOUNT ROLE (RBAC)</Text>
          <View style={styles.roleSelectorRow}>
            <TouchableOpacity
              activeOpacity={0.8}
              style={[styles.roleTab, role === 'employer' && styles.roleTabActive]}
              onPress={() => setRole('employer')}
            >
              <Building2 size={16} color={role === 'employer' ? '#FFFFFF' : '#64748B'} />
              <Text style={[styles.roleTabText, role === 'employer' && styles.roleTabTextActive]}>
                Employer / Recruiter
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.8}
              style={[styles.roleTab, role === 'candidate' && styles.roleTabActive]}
              onPress={() => setRole('candidate')}
            >
              <UserCheck size={16} color={role === 'candidate' ? '#FFFFFF' : '#64748B'} />
              <Text style={[styles.roleTabText, role === 'candidate' && styles.roleTabTextActive]}>
                Employee / Candidate
              </Text>
            </TouchableOpacity>
          </View>

          {error ? <ErrorBanner message={error} /> : null}

          <Input
            label="Official Email Address"
            required
            placeholder="employer@company.com"
            keyboardType="email-address"
            autoCapitalize="none"
            value={email}
            onChangeText={(text) => {
              setEmail(text);
              if (error) setError(null);
            }}
            leftIcon={<Mail size={18} color={COLORS.slate400} />}
            error={fieldErrors.email}
            allowClear
            onClear={() => setEmail('')}
          />

          <Input
            label="Password"
            required
            placeholder="••••••••"
            isPassword
            value={password}
            onChangeText={(text) => {
              setPassword(text);
              if (error) setError(null);
            }}
            leftIcon={<Lock size={18} color={COLORS.slate400} />}
            error={fieldErrors.password}
          />

          <Button
            title="Sign In to Employer Dashboard"
            onPress={handleLogin}
            loading={loading}
            size="lg"
            style={styles.submitBtn}
          />

          <TouchableOpacity
            style={styles.demoFillBtn}
            onPress={() => {
              setEmail('employer@demo.com');
              setPassword('Employer@123');
              setError(null);
              setFieldErrors({});
            }}
          >
            <Text style={styles.demoFillText}>⚡ Quick Fill Verified Employer Account</Text>
          </TouchableOpacity>

          <View style={styles.footerRow}>
            <Text style={styles.footerText}>Don't have an employer account? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('EmployerSignup')}>
              <Text style={styles.linkText}>Register Company</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      {/* 2FA Verification Modal Overlay */}
      <Modal visible={show2FAModal} transparent animationType="fade" onRequestClose={() => setShow2FAModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeaderRow}>
              <View style={styles.modalIconBox}>
                <ShieldCheck size={22} color="#2563EB" />
              </View>
              <TouchableOpacity style={styles.modalCloseBtn} onPress={() => setShow2FAModal(false)}>
                <X size={18} color="#64748B" />
              </TouchableOpacity>
            </View>

            <Text style={styles.modalTitleText}>2FA Verification Required</Text>
            <Text style={styles.modalSubText}>
              Two-Factor Authentication is active for this account. Enter the 6-digit OTP security code sent to <Text style={{ fontWeight: '800', color: '#0F172A' }}>{email}</Text>.
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
              title="Verify 2FA Code & Sign In"
              loading={twoFactorLoading}
              onPress={handleVerify2FACode}
              style={{ marginTop: 12 }}
            />
          </View>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
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
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: SPACING.lg,
  },
  brandHeader: {
    alignItems: 'center',
    marginBottom: SPACING.xl,
  },
  iconBadge: {
    width: 68,
    height: 68,
    borderRadius: 20,
    backgroundColor: COLORS.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.md,
  },
  appTitle: {
    ...TYPOGRAPHY.h1,
    color: COLORS.slate900,
  },
  portalSubtitle: {
    ...TYPOGRAPHY.subtitle,
    color: COLORS.primary,
    fontWeight: '600',
  },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.xl,
    padding: SPACING.xl,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  welcomeText: {
    ...TYPOGRAPHY.h2,
    fontSize: 20,
    color: COLORS.slate900,
    marginBottom: 4,
  },
  instructionText: {
    ...TYPOGRAPHY.body,
    color: COLORS.slate500,
    marginBottom: SPACING.md,
  },
  roleSelectorLabel: {
    fontSize: 10.5,
    fontWeight: '800',
    color: '#64748B',
    letterSpacing: 0.8,
    marginBottom: 6,
  },
  roleSelectorRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: SPACING.md,
  },
  roleTab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderRadius: 8,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderBottomWidth: 2.5,
    borderBottomColor: '#CBD5E1',
  },
  roleTabActive: {
    backgroundColor: '#2563EB',
    borderColor: '#1D4ED8',
    borderBottomWidth: 3,
    borderBottomColor: '#1E40AF',
  },
  roleTabText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#475569',
  },
  roleTabTextActive: {
    color: '#FFFFFF',
    fontWeight: '900',
  },
  submitBtn: {
    marginTop: SPACING.md,
  },
  demoFillBtn: {
    marginTop: SPACING.md,
    alignItems: 'center',
    paddingVertical: SPACING.xs,
  },
  demoFillText: {
    ...TYPOGRAPHY.caption,
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.primary,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: SPACING.xl,
  },
  footerText: {
    ...TYPOGRAPHY.body,
    color: COLORS.slate600,
  },
  linkText: {
    ...TYPOGRAPHY.body,
    fontWeight: '600',
    color: COLORS.primary,
  },
});
