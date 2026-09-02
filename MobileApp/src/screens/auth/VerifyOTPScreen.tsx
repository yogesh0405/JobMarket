import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  TextInput,
  StatusBar,
  ScrollView,
} from 'react-native';
import { ArrowLeft, Mail, MessageSquare } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../context/ToastContext';
import { authApi } from '../../api/authApi';
import { ErrorBanner } from '../../components/common/ErrorBanner';
import { COLORS } from '../../constants/theme';
import { otpSchema } from '../../utils/validators';

interface Props {
  route: any;
  navigation: any;
}

export const VerifyOTPScreen: React.FC<Props> = ({ route, navigation }) => {
  const insets = useSafeAreaInsets();
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

  const hiddenInputRef = useRef<TextInput>(null);

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
      setError('OTP has expired. Please tap "Resend" below to receive a new code.');
      return;
    }

    const parseRes = otpSchema.safeParse({ otpCode: cleanOtp });
    if (!parseRes.success) {
      setError(parseRes.error.issues[0]?.message || 'Please enter the complete 6-digit OTP code.');
      return;
    }

    setLoading(true);
    try {
      await verifyOTP(cleanEmail, cleanOtp, false);

      showToast('Registered successfully! Please sign in.', 'success', 2000);
      navigation.navigate('EmployerLogin', {
        registeredEmail: cleanEmail,
        initialRole: signupPayload?.role || route?.params?.role || 'candidate',
        signupSuccess: true,
      });
    } catch (err: any) {
      const serverMsg = err.message || '';
      if (timer > 0) {
        if (serverMsg.toLowerCase().includes('expired')) {
          setError('Invalid 6-digit OTP code. Please enter the latest code sent to your email.');
        } else {
          setError(serverMsg || 'Registration unsuccessful. Please verify your OTP code and try again.');
        }
      } else {
        setError('OTP has expired. Please tap "Resend" below.');
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
      if (signupPayload && signupPayload.email) {
        await signup(signupPayload);
      } else {
        await authApi.sendOTP(cleanEmail, 'verification');
      }
      setTimer(60);
      setOtpCode('');
      showToast('New OTP has been sent to your email.', 'success');
    } catch (err: any) {
      setError(err.message || 'Failed to send new OTP code. Please check details.');
      showToast(err.message || 'Failed to resend OTP code', 'error');
    } finally {
      setResending(false);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* Top Header Navigation */}
      <View style={[styles.headerNav, { paddingTop: Math.max(insets.top, 16) + 8 }]}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          style={styles.backButton}
        >
          <ArrowLeft size={22} color="#0F172A" strokeWidth={2.4} />
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={[
            styles.scrollContent,
            { paddingBottom: Math.max(insets.bottom, 24) + 16 },
          ]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Main Title */}
          <Text style={styles.screenTitle}>Enter Verification{'\n'}Code</Text>

          {/* Center Graphic Badge Illustration */}
          <View style={styles.graphicSection}>
            <View style={styles.illustrationCircle}>
              {/* Smartphone Illustration Frame */}
              <View style={styles.phoneFrame}>
                <View style={styles.phoneSpeaker} />
                <View style={styles.phoneScreen}>
                  <View style={styles.mailIconBox}>
                    <Mail size={22} color={COLORS.primary} strokeWidth={2.4} />
                  </View>
                </View>
                <View style={styles.phoneHomeButton} />
              </View>

              {/* Chat Speech Bubble Accent */}
              <View style={styles.chatBubble}>
                <View style={styles.chatBubbleLine} />
                <View style={[styles.chatBubbleLine, { width: 14 }]} />
                <View style={styles.chatBubbleLine} />
              </View>
            </View>
          </View>

          {/* Subtext Description */}
          <Text style={styles.descriptionText}>
            Please enter verification code{'\n'}sent to{' '}
            <Text style={styles.emailHighlightText}>{cleanEmail}</Text>
          </Text>

          {/* Error Banner if any */}
          {error ? (
            <View style={styles.errorWrapper}>
              <ErrorBanner message={error} />
            </View>
          ) : null}

          {/* 6-Digit OTP Dash Slots (Exact Reference Match) */}
          <View style={styles.otpSlotsRow}>
            <View style={styles.slotsVisualContainer} pointerEvents="none">
              {[0, 1, 2, 3, 4, 5].map((index) => {
                const digit = otpCode[index] || '';
                const isCurrent = otpCode.length === index;
                return (
                  <View key={index} style={styles.otpSlotItem}>
                    <Text style={styles.otpDigitText}>{digit}</Text>
                    <View
                      style={[
                        styles.otpDashLine,
                        (digit || isCurrent) && styles.otpDashLineActive,
                      ]}
                    />
                  </View>
                );
              })}
            </View>

            {/* Overlaid Transparent Native TextInput for Immediate Touch & Typing */}
            <TextInput
              ref={hiddenInputRef}
              style={styles.overlaidTextInput}
              value={otpCode}
              onChangeText={(t) => {
                const cleaned = t.replace(/[^0-9]/g, '').slice(0, 6);
                setOtpCode(cleaned);
                if (error) setError(null);
              }}
              keyboardType="number-pad"
              maxLength={6}
              autoFocus={true}
              caretHidden={true}
              cursorColor="transparent"
              selectionColor="transparent"
            />
          </View>

          {/* Resend Code Section */}
          <View style={styles.resendContainer}>
            <Text style={styles.resendPromptText}>Didn't receive the code? </Text>
            {timer > 0 ? (
              <Text style={styles.resendTimerText}>Resend in {timer}s</Text>
            ) : (
              <TouchableOpacity
                onPress={handleResend}
                disabled={resending}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                {resending ? (
                  <ActivityIndicator size="small" color={COLORS.primary} />
                ) : (
                  <Text style={styles.resendActionLink}>Resend</Text>
                )}
              </TouchableOpacity>
            )}
          </View>

          {/* Spam / Promotions Tab Tip */}
          <Text style={styles.spamTipText}>
            Note: If you don't see the email, please check your Spam, Junk, or Promotions folder.
          </Text>

          {/* Bottom Primary Action Button: "Verify the Code" */}
          <View style={styles.actionButtonContainer}>
            <TouchableOpacity
              style={styles.verifyBtn}
              onPress={handleVerify}
              disabled={loading}
              activeOpacity={0.88}
            >
              {loading ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Text style={styles.verifyBtnText}>Verify the Code</Text>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  flex: {
    flex: 1,
  },
  headerNav: {
    paddingHorizontal: 20,
    paddingBottom: 4,
  },
  backButton: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollContent: {
    paddingHorizontal: 24,
    alignItems: 'center',
    paddingTop: 10,
  },
  screenTitle: {
    fontSize: 23,
    fontWeight: '800',
    color: '#1E293B',
    textAlign: 'center',
    letterSpacing: -0.4,
    lineHeight: 30,
    marginBottom: 24,
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
  },
  graphicSection: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 28,
  },
  illustrationCircle: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: '#EBF5FF',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  phoneFrame: {
    width: 62,
    height: 96,
    borderRadius: 12,
    backgroundColor: '#1E293B',
    paddingTop: 6,
    paddingBottom: 6,
    paddingHorizontal: 4,
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 3,
  },
  phoneSpeaker: {
    width: 16,
    height: 2.5,
    borderRadius: 2,
    backgroundColor: '#64748B',
  },
  phoneScreen: {
    width: '100%',
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 4,
    marginVertical: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mailIconBox: {
    width: 34,
    height: 34,
    borderRadius: 8,
    backgroundColor: '#EBF5FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  phoneHomeButton: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#64748B',
  },
  chatBubble: {
    position: 'absolute',
    top: 22,
    right: 18,
    backgroundColor: COLORS.primary,
    borderRadius: 8,
    borderBottomLeftRadius: 1,
    paddingVertical: 5,
    paddingHorizontal: 7,
    gap: 2.5,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 3,
  },
  chatBubbleLine: {
    height: 2,
    width: 18,
    backgroundColor: '#FFFFFF',
    borderRadius: 1,
  },
  descriptionText: {
    fontSize: 13,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 20,
    fontWeight: '400',
  },
  emailHighlightText: {
    color: '#0F172A',
    fontWeight: '700',
  },
  errorWrapper: {
    width: '100%',
    marginBottom: 16,
  },
  otpSlotsRow: {
    width: '100%',
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 18,
    position: 'relative',
  },
  slotsVisualContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    width: '100%',
    height: '100%',
  },
  otpSlotItem: {
    width: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  otpDigitText: {
    fontSize: 22,
    fontWeight: '700',
    color: '#0F172A',
    textAlign: 'center',
    height: 32,
    lineHeight: 30,
  },
  otpDashLine: {
    width: '100%',
    height: 2.5,
    backgroundColor: '#CBD5E1',
    borderRadius: 2,
    marginTop: 4,
  },
  otpDashLineActive: {
    backgroundColor: COLORS.primary,
    height: 3,
  },
  overlaidTextInput: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: '100%',
    height: '100%',
    color: 'transparent',
    backgroundColor: 'transparent',
    opacity: 0,
    fontSize: 1,
  },
  resendContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 24,
    marginBottom: 36,
  },
  resendPromptText: {
    fontSize: 12.5,
    color: '#64748B',
    fontWeight: '400',
  },
  resendActionLink: {
    fontSize: 12.5,
    color: COLORS.primary,
    fontWeight: '700',
    textDecorationLine: 'underline',
  },
  resendTimerText: {
    fontSize: 12.5,
    color: '#94A3B8',
    fontWeight: '600',
  },
  spamTipText: {
    fontSize: 11,
    color: '#94A3B8',
    textAlign: 'center',
    marginBottom: 24,
    marginTop: -20,
    paddingHorizontal: 8,
  },
  actionButtonContainer: {
    width: '100%',
    marginTop: 10,
  },
  verifyBtn: {
    backgroundColor: COLORS.primary,
    height: 46,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 3,
  },
  verifyBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.2,
  },
});
