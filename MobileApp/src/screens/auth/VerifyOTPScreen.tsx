import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { Mail, CheckCircle2 } from 'lucide-react-native';
import { useAuth } from '../../hooks/useAuth';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { ErrorBanner } from '../../components/common/ErrorBanner';
import { Header } from '../../components/common/Header';
import { COLORS, TYPOGRAPHY, SPACING, RADIUS } from '../../constants/theme';
import { otpSchema } from '../../utils/validators';

interface Props {
  route: any;
  navigation: any;
}

export const VerifyOTPScreen: React.FC<Props> = ({ route, navigation }) => {
  const { verifyOTP } = useAuth();
  const email = route?.params?.email || '';

  const [otpCode, setOtpCode] = useState('');
  const [timer, setTimer] = useState(60);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let interval: any = null;
    if (timer > 0) {
      interval = setInterval(() => setTimer((t) => t - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [timer]);

  const handleVerify = async () => {
    setError(null);
    const parseRes = otpSchema.safeParse({ otpCode });
    if (!parseRes.success) {
      setError(parseRes.error.issues[0]?.message || 'Invalid OTP');
      return;
    }

    setLoading(true);
    try {
      await verifyOTP(email, otpCode);
    } catch (err: any) {
      setError(err.message || 'OTP verification failed. Please check the code and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Header title="Email OTP Verification" onBack={() => navigation.goBack()} />

      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={styles.content}>
          <View style={styles.card}>
            <View style={styles.iconCircle}>
              <Mail size={32} color={COLORS.primary} />
            </View>

            <Text style={styles.title}>Check Your Inbox</Text>
            <Text style={styles.subtitle}>
              We sent a 6-digit verification code to {'\n'}
              <Text style={styles.emailHighlight}>{email}</Text>
            </Text>

            {error ? <ErrorBanner message={error} /> : null}

            <Input
              label="6-Digit Verification Code"
              placeholder="123456"
              keyboardType="number-pad"
              maxLength={6}
              value={otpCode}
              onChangeText={setOtpCode}
              style={styles.otpInputText}
            />

            <Button
              title="Verify Code & Complete Sign In"
              onPress={handleVerify}
              loading={loading}
              size="lg"
              style={styles.submitBtn}
            />

            <View style={styles.resendRow}>
              {timer > 0 ? (
                <Text style={styles.timerText}>Resend code in {timer}s</Text>
              ) : (
                <TouchableOpacity onPress={() => setTimer(60)}>
                  <Text style={styles.resendLink}>Resend OTP Code</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  flex: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    padding: SPACING.lg,
  },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.xl,
    padding: SPACING.xl,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  iconCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: COLORS.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.md,
  },
  title: {
    ...TYPOGRAPHY.h2,
    color: COLORS.slate900,
    marginBottom: 4,
  },
  subtitle: {
    ...TYPOGRAPHY.body,
    textAlign: 'center',
    color: COLORS.slate500,
    marginBottom: SPACING.xl,
  },
  emailHighlight: {
    fontWeight: '600',
    color: COLORS.slate900,
  },
  otpInputText: {
    textAlign: 'center',
    fontSize: 22,
    letterSpacing: 6,
    fontWeight: '700',
  },
  submitBtn: {
    width: '100%',
    marginTop: SPACING.md,
  },
  resendRow: {
    marginTop: SPACING.lg,
  },
  timerText: {
    ...TYPOGRAPHY.body,
    color: COLORS.slate400,
  },
  resendLink: {
    ...TYPOGRAPHY.body,
    fontWeight: '600',
    color: COLORS.primary,
  },
});
