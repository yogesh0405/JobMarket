import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform, ActivityIndicator, Alert } from 'react-native';
import { Mail, CheckCircle2, RotateCw } from 'lucide-react-native';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../context/ToastContext';
import { authApi } from '../../api/authApi';
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
  const { verifyOTP, signup } = useAuth();
  const { showToast } = useToast();
  const rawEmail = route?.params?.email || '';
  const cleanEmail = String(rawEmail).trim().toLowerCase();
  const signupPayload = route?.params?.signupPayload || null;

  const [otpCode, setOtpCode] = useState('');
  const [timer, setTimer] = useState(60);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let interval: any = null;
    if (timer > 0) {
      interval = setInterval(() => setTimer((t) => t - 1), 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [timer]);

  const handleVerify = async () => {
    setError(null);
    const cleanOtp = otpCode.trim();

    if (timer <= 0) {
      setError('OTP has expired. Please click "Resend OTP Code" below to receive a new code.');
      return;
    }

    const parseRes = otpSchema.safeParse({ otpCode: cleanOtp });
    if (!parseRes.success) {
      setError(parseRes.error.issues[0]?.message || 'Please enter the complete 6-digit OTP code.');
      return;
    }

    setLoading(true);
    try {
      const res = await verifyOTP(cleanEmail, cleanOtp, false);

      Alert.alert(
        'Signup Successful! 🎉',
        'Your account has been successfully verified and saved to the database. Please sign in to access your workspace.',
        [
          {
            text: 'Proceed to Login',
            onPress: () => {
              navigation.navigate('EmployerLogin', {
                registeredEmail: cleanEmail,
                initialRole: signupPayload?.role || 'candidate',
                signupSuccess: true,
              });
            },
          },
        ],
        { cancelable: false }
      );
    } catch (err: any) {
      const serverMsg = err.message || '';
      if (timer > 0) {
        // While the countdown timer is active, do not display misleading "expired" text
        if (serverMsg.toLowerCase().includes('expired')) {
          setError('Invalid 6-digit OTP code. Please enter the latest code sent to your email.');
        } else {
          setError(serverMsg || 'Registration unsuccessful. Please verify your OTP code and try again.');
        }
      } else {
        setError('OTP has expired. Please tap "Resend OTP Code" below.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (timer > 0 || resending) return;
    setResending(true);
    setError(null);
    try {
      if (signupPayload && signupPayload.email && signupPayload.password) {
        await signup(signupPayload);
      } else {
        await authApi.signup({
          email: cleanEmail,
          password: 'Password@123',
          confirmPassword: 'Password@123',
          name: cleanEmail.split('@')[0],
          role: 'employer',
          phone: '9876543210',
        });
      }
      setTimer(60);
      setOtpCode('');
      showToast('A fresh 6-digit verification code has been sent to your email.', 'success');
    } catch (err: any) {
      setError(err.message || 'Failed to send new verification code. Please check details.');
      showToast(err.message || 'Failed to resend OTP code', 'error');
    } finally {
      setResending(false);
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
              <Text style={styles.emailHighlight}>{cleanEmail}</Text>
            </Text>

            {error ? <ErrorBanner message={error} /> : null}

            <Input
              label="6-Digit Verification Code"
              placeholder="123456"
              keyboardType="number-pad"
              maxLength={6}
              value={otpCode}
              onChangeText={(t) => {
                setOtpCode(t.replace(/[^0-9]/g, '').slice(0, 6));
                if (error) setError(null);
              }}
              style={styles.otpInputText}
            />

            <Button
              title={loading ? 'Verifying Code...' : 'Verify Code & Complete Sign In'}
              onPress={handleVerify}
              loading={loading}
              size="lg"
              style={styles.submitBtn}
            />

            <View style={styles.resendRow}>
              {timer > 0 ? (
                <Text style={styles.timerText}>Resend code in {timer}s</Text>
              ) : (
                <TouchableOpacity
                  onPress={handleResend}
                  disabled={resending}
                  style={styles.resendBtn}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  {resending ? (
                    <ActivityIndicator size="small" color={COLORS.primary} />
                  ) : (
                    <Text style={styles.resendLink}>Resend OTP Code</Text>
                  )}
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
  resendBtn: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  resendLink: {
    ...TYPOGRAPHY.body,
    fontWeight: '600',
    color: COLORS.primary,
  },
});
