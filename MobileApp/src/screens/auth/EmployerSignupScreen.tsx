import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { User as UserIcon, Mail, Lock, Phone, Building2, FileText, Wrench, UserCheck } from 'lucide-react-native';
import { useAuth } from '../../hooks/useAuth';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { ErrorBanner } from '../../components/common/ErrorBanner';
import { Header } from '../../components/common/Header';
import { COLORS, TYPOGRAPHY, SPACING, RADIUS } from '../../constants/theme';
import { signupSchema } from '../../utils/validators';

interface Props {
  navigation: any;
}

export const EmployerSignupScreen: React.FC<Props> = ({ navigation }) => {
  const { signup } = useAuth();

  const [role, setRole] = useState<'employer' | 'candidate'>('employer');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [gstNumber, setGstNumber] = useState('');
  const [tradeSpecialization, setTradeSpecialization] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

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
    <View style={styles.container}>
      <Header title="Create Employer Account" onBack={() => navigation.goBack()} />

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Create Account</Text>
            <Text style={styles.sectionSubtitle}>
              {role === 'employer'
                ? 'Register your company to post jobs and hire verified workforce'
                : 'Register as an industrial candidate to apply for factory & technical jobs'}
            </Text>

            {/* RBAC Role Selector Pills */}
            <Text style={styles.roleSelectorLabel}>SELECT REGISTRATION ACCOUNT TYPE (RBAC)</Text>
            <View style={styles.roleSelectorRow}>
              <TouchableOpacity
                activeOpacity={0.8}
                style={[styles.roleTab, role === 'employer' && styles.roleTabActive]}
                onPress={() => setRole('employer')}
              >
                <Building2 size={16} color={role === 'employer' ? '#FFFFFF' : '#64748B'} />
                <Text style={[styles.roleTabText, role === 'employer' && styles.roleTabTextActive]}>
                  Employer Account
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
              label="Full Name / Contact Person"
              required
              placeholder="John Doe"
              value={name}
              onChangeText={setName}
              leftIcon={<UserIcon size={18} color={COLORS.slate400} />}
              error={fieldErrors.name}
            />

            <Input
              label="Official Email Address"
              required
              placeholder="employer@company.com"
              keyboardType="email-address"
              autoCapitalize="none"
              value={email}
              onChangeText={setEmail}
              leftIcon={<Mail size={18} color={COLORS.slate400} />}
              error={fieldErrors.email}
            />

            <Input
              label="Mobile Number (10 Digits)"
              required
              placeholder="9876543210"
              keyboardType="phone-pad"
              maxLength={10}
              value={phone}
              onChangeText={setPhone}
              leftIcon={<Phone size={18} color={COLORS.slate400} />}
              error={fieldErrors.phone}
            />

            <Input
              label="Company / Enterprise Name"
              required
              placeholder="Acme Manufacturing Pvt Ltd"
              value={companyName}
              onChangeText={setCompanyName}
              leftIcon={<Building2 size={18} color={COLORS.slate400} />}
              error={fieldErrors.companyName}
            />

            <Input
              label="GST Number (Optional)"
              placeholder="27AAAAA0000A1Z5"
              autoCapitalize="characters"
              value={gstNumber}
              onChangeText={setGstNumber}
              leftIcon={<FileText size={18} color={COLORS.slate400} />}
              error={fieldErrors.gstNumber}
            />

            <Input
              label="Trade Specialization / Industry (Optional)"
              placeholder="Automotive / CNC Machining / Electronics"
              value={tradeSpecialization}
              onChangeText={setTradeSpecialization}
              leftIcon={<Wrench size={18} color={COLORS.slate400} />}
              error={fieldErrors.tradeSpecialization}
            />

            <Input
              label="Password"
              required
              placeholder="••••••••"
              isPassword
              value={password}
              onChangeText={setPassword}
              leftIcon={<Lock size={18} color={COLORS.slate400} />}
              error={fieldErrors.password}
            />

            <Input
              label="Confirm Password"
              required
              placeholder="••••••••"
              isPassword
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              leftIcon={<Lock size={18} color={COLORS.slate400} />}
              error={fieldErrors.confirmPassword}
            />

            <Button
              title="Register & Send Verification OTP"
              onPress={handleSignup}
              loading={loading}
              size="lg"
              style={styles.submitBtn}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    padding: SPACING.lg,
  },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.xl,
    padding: SPACING.xl,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  sectionTitle: {
    ...TYPOGRAPHY.h2,
    color: COLORS.slate900,
    marginBottom: 4,
  },
  sectionSubtitle: {
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
});
