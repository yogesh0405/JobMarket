import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  ScrollView,
  Platform,
} from 'react-native';
import { Lock, Eye, EyeOff, X, KeyRound, Mail, ArrowRight, RefreshCw } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Input } from '../../../components/common/Input';
import { Button } from '../../../components/common/Button';
import { ErrorBanner } from '../../../components/common/ErrorBanner';
import { authApi } from '../../../api/authApi';
import { COLORS } from '../../../constants/theme';

interface ForgotPasswordModalProps {
  visible: boolean;
  onClose: () => void;
  initialEmail?: string;
  onSuccess: (newPassword: string, email: string) => void;
}

export const ForgotPasswordModal: React.FC<ForgotPasswordModalProps> = ({
  visible,
  onClose,
  initialEmail = '',
  onSuccess,
}) => {
  const insets = useSafeAreaInsets();

  const [step, setStep] = useState<'REQUEST_OTP' | 'VERIFY_RESET'>('REQUEST_OTP');
  const [email, setEmail] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPass, setShowNewPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resendCooldown, setResendCooldown] = useState(0);

  useEffect(() => {
    if (visible) {
      const cleanEmail = (initialEmail || '').trim();
      setEmail(cleanEmail);
      setOtpCode('');
      setNewPassword('');
      setConfirmPassword('');
      setError(null);
      setShowNewPass(false);
      setShowConfirmPass(false);

      // If email was already filled and passed, auto-trigger step to enter OTP if desired or start on REQUEST_OTP
      if (cleanEmail && cleanEmail.includes('@')) {
        setStep('REQUEST_OTP');
      } else {
        setStep('REQUEST_OTP');
      }
    }
  }, [visible, initialEmail]);

  useEffect(() => {
    let timer: any;
    if (resendCooldown > 0) {
      timer = setTimeout(() => setResendCooldown((prev) => prev - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [resendCooldown]);

  const handleSendOtp = async () => {
    setError(null);
    const targetEmail = email.trim().toLowerCase();
    if (!targetEmail || !targetEmail.includes('@')) {
      setError('Please enter a valid registered email address.');
      return;
    }

    setLoading(true);
    try {
      const res = await authApi.forgotPassword(targetEmail);
      setLoading(false);
      if (res.success) {
        setStep('VERIFY_RESET');
        setResendCooldown(30);
      } else {
        setError(res.message || 'Could not send verification code. Please check email address.');
      }
    } catch (err: any) {
      setLoading(false);
      setError(err.message || 'Error sending verification code. Please try again.');
    }
  };

  const handleResetPassword = async () => {
    setError(null);
    const targetEmail = email.trim().toLowerCase();
    const cleanOtp = otpCode.trim();

    if (!cleanOtp || cleanOtp.length !== 6) {
      setError('Please enter the full 6-digit verification code.');
      return;
    }
    if (!newPassword || !confirmPassword) {
      setError('Please enter and confirm your new password.');
      return;
    }
    if (newPassword.length < 6) {
      setError('New password must be at least 6 characters long.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('New password and confirm password do not match.');
      return;
    }

    setLoading(true);
    try {
      const res = await authApi.resetPassword({
        email: targetEmail,
        otpCode: cleanOtp,
        newPassword: newPassword,
      });
      setLoading(false);
      if (res.success) {
        onSuccess(newPassword, targetEmail);
        onClose();
      } else {
        setError(res.message || 'Failed to reset password. Please check OTP code.');
      }
    } catch (err: any) {
      setLoading(false);
      setError(err.message || 'Error resetting password. Please try again.');
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoidingContainer}
      >
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={onClose}>
          <TouchableOpacity
            activeOpacity={1}
            style={[styles.modalSheet, { paddingBottom: Math.max(insets.bottom + 16, 24) }]}
            onPress={(e) => e.stopPropagation()}
          >
            <ScrollView
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
              bounces={false}
              contentContainerStyle={{ paddingBottom: 8 }}
            >
              {/* Header */}
              <View style={styles.modalHeaderRow}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1, marginRight: 8 }}>
                  <View style={[styles.sectionIconBox, { backgroundColor: '#EFF6FF' }]}>
                    <KeyRound size={18} color={COLORS.primary} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.modalTitleText} numberOfLines={1}>
                      {step === 'REQUEST_OTP' ? 'Reset Password' : 'Enter Verification Code'}
                    </Text>
                    <Text style={styles.modalSubtitleText} numberOfLines={1}>
                      {step === 'REQUEST_OTP'
                        ? 'Enter your registered email to receive a code'
                        : `Code sent to ${email}`}
                    </Text>
                  </View>
                </View>
                <TouchableOpacity onPress={onClose} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                  <X size={22} color="#64748B" />
                </TouchableOpacity>
              </View>

              {error ? <ErrorBanner message={error} style={{ marginBottom: 12 }} /> : null}

              {step === 'REQUEST_OTP' ? (
                /* STEP 1: Enter Email & Send OTP */
                <View style={{ marginTop: 4, gap: 12 }}>
                  <Input
                    label="Registered Email Address *"
                    placeholder="you@company.com"
                    keyboardType="email-address"
                    autoCapitalize="none"
                    value={email}
                    onChangeText={(t) => {
                      setEmail(t);
                      if (error) setError(null);
                    }}
                    leftIcon={<Mail size={18} color="#64748B" />}
                  />

                  <Button
                    title="Send Verification Code"
                    onPress={handleSendOtp}
                    loading={loading}
                    style={{ marginTop: 6, height: 46, borderRadius: 8 }}
                  />
                </View>
              ) : (
                /* STEP 2: Enter OTP & New Password */
                <View style={{ marginTop: 4, gap: 10 }}>
                  <Input
                    label="6-Digit Verification Code *"
                    placeholder="Enter 6-digit code"
                    keyboardType="numeric"
                    maxLength={6}
                    value={otpCode}
                    onChangeText={(t) => {
                      setOtpCode(t);
                      if (error) setError(null);
                    }}
                    leftIcon={<Mail size={18} color="#64748B" />}
                  />

                  <View style={styles.inputWithIconRow}>
                    <Input
                      label="New Password *"
                      placeholder="Enter new password"
                      secureTextEntry={!showNewPass}
                      value={newPassword}
                      onChangeText={(t) => {
                        setNewPassword(t);
                        if (error) setError(null);
                      }}
                      leftIcon={<Lock size={18} color="#64748B" />}
                      style={{ flex: 1 }}
                    />
                    <TouchableOpacity
                      style={styles.eyeBtn}
                      onPress={() => setShowNewPass(!showNewPass)}
                      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                    >
                      {showNewPass ? <EyeOff size={18} color="#64748B" /> : <Eye size={18} color="#64748B" />}
                    </TouchableOpacity>
                  </View>

                  <View style={styles.inputWithIconRow}>
                    <Input
                      label="Confirm New Password *"
                      placeholder="Re-enter new password"
                      secureTextEntry={!showConfirmPass}
                      value={confirmPassword}
                      onChangeText={(t) => {
                        setConfirmPassword(t);
                        if (error) setError(null);
                      }}
                      leftIcon={<Lock size={18} color="#64748B" />}
                      style={{ flex: 1 }}
                    />
                    <TouchableOpacity
                      style={styles.eyeBtn}
                      onPress={() => setShowConfirmPass(!showConfirmPass)}
                      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                    >
                      {showConfirmPass ? <EyeOff size={18} color="#64748B" /> : <Eye size={18} color="#64748B" />}
                    </TouchableOpacity>
                  </View>

                  <View style={styles.resendRow}>
                    {resendCooldown > 0 ? (
                      <Text style={styles.resendTimerText}>Resend code in {resendCooldown}s</Text>
                    ) : (
                      <TouchableOpacity activeOpacity={0.7} onPress={handleSendOtp} disabled={loading}>
                        <Text style={styles.resendLinkText}>Didn't receive code? Resend Code</Text>
                      </TouchableOpacity>
                    )}
                  </View>

                  <Button
                    title="Reset Password"
                    onPress={handleResetPassword}
                    loading={loading}
                    style={{ marginTop: 6, height: 46, borderRadius: 8 }}
                  />
                </View>
              )}
            </ScrollView>
          </TouchableOpacity>
        </TouchableOpacity>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  keyboardAvoidingContainer: {
    flex: 1,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingTop: 16,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    maxHeight: '88%',
  },
  modalHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  sectionIconBox: {
    width: 36,
    height: 36,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalTitleText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
  },
  modalSubtitleText: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 1,
  },
  inputWithIconRow: {
    position: 'relative',
  },
  eyeBtn: {
    position: 'absolute',
    right: 12,
    top: 36,
    padding: 4,
  },
  resendRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: -2,
    marginBottom: 4,
  },
  resendLinkText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.primary,
  },
  resendTimerText: {
    fontSize: 12,
    color: '#94A3B8',
    fontWeight: '500',
  },
});
