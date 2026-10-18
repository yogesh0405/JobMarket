import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  TouchableWithoutFeedback,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Trash2, KeyRound, Lock, Eye, EyeOff, RotateCw } from 'lucide-react-native';
import { authApi } from '../../../api/authApi';
import { ErrorBanner } from '../../../components/common/ErrorBanner';
import { COLORS } from '../../../constants/theme';

interface DeleteAccountModalProps {
  visible: boolean;
  onClose: () => void;
  userEmail?: string;
  hasPassword?: boolean;
  onSuccess: () => Promise<void> | void;
}

export const DeleteAccountModal: React.FC<DeleteAccountModalProps> = ({
  visible,
  onClose,
  userEmail = '',
  hasPassword = true,
  onSuccess,
}) => {
  const [otpCode, setOtpCode] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [maskedEmail, setMaskedEmail] = useState('');
  const [resendTimer, setResendTimer] = useState(60);
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Timer countdown
  useEffect(() => {
    let interval: any = null;
    if (visible && resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer((prev) => (prev > 0 ? prev - 1 : 0));
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [visible, resendTimer]);

  // When modal is opened after confirmation click, trigger the real OTP request
  useEffect(() => {
    if (visible) {
      setOtpCode('');
      setPassword('');
      setErrorMessage(null);
      setResendTimer(60);
      handleSendOtp();
    } else {
      setOtpCode('');
      setPassword('');
      setErrorMessage(null);
      setResendTimer(0);
    }
  }, [visible]);

  const handleSendOtp = async () => {
    setIsSendingOtp(true);
    setErrorMessage(null);
    try {
      const res = await authApi.requestDeleteAccountOTP();
      if (res.success) {
        const resolvedEmail =
          (res as any)?.email ||
          (res as any)?.data?.email ||
          userEmail ||
          'your registered email';
        setMaskedEmail(resolvedEmail);
        setResendTimer(60);
      } else {
        setErrorMessage(
          res.error || res.message || 'Failed to dispatch verification code. Please try again.'
        );
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Network error occurred while requesting OTP.');
    } finally {
      setIsSendingOtp(false);
    }
  };

  const handleConfirmDelete = async () => {
    setErrorMessage(null);

    const cleanOtp = otpCode.trim();
    if (!cleanOtp || cleanOtp.length !== 6) {
      setErrorMessage('Please enter the complete 6-digit verification code.');
      return;
    }

    if (hasPassword && !password.trim()) {
      setErrorMessage('Account password is required to delete your account.');
      return;
    }

    setIsDeleting(true);
    try {
      const res = await authApi.deleteAccount({
        otpCode: cleanOtp,
        password: password.trim(),
      });

      if (res.success) {
        onClose();
        await onSuccess();
      } else {
        setErrorMessage(res.error || res.message || 'Invalid verification code. Please check your email.');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to process account deletion request.');
    } finally {
      setIsDeleting(false);
    }
  };

  const isSubmitDisabled =
    otpCode.trim().length !== 6 ||
    (hasPassword && !password.trim()) ||
    isDeleting ||
    isSendingOtp;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.modalOverlay}>
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            style={styles.keyboardContainer}
          >
            <TouchableWithoutFeedback>
              <View style={styles.modalCard}>
                {/* Center Circular Icon Badge */}
                <View style={styles.iconCircle}>
                  <Trash2 size={28} color="#DC2626" strokeWidth={2.4} />
                </View>

                {/* Title */}
                <Text style={styles.titleText}>Verify Deletion Code</Text>

                {/* Message Description */}
                <Text style={styles.messageText}>
                  {isSendingOtp ? (
                    'Sending 6-digit verification code to your email...'
                  ) : (
                    <>
                      Enter the 6-digit OTP code sent to{' '}
                      <Text style={styles.emailHighlight}>{maskedEmail || userEmail}</Text>.
                    </>
                  )}
                </Text>

                {/* Error Banner */}
                {errorMessage ? (
                  <ErrorBanner message={errorMessage} style={{ marginBottom: 14, width: '100%' }} />
                ) : null}

                {/* 6-Digit OTP Input Box */}
                <View style={styles.inputBox}>
                  <KeyRound size={18} color="#DC2626" />
                  <TextInput
                    style={styles.otpInput}
                    placeholder="123456"
                    placeholderTextColor="#94A3B8"
                    keyboardType="number-pad"
                    maxLength={6}
                    value={otpCode}
                    onChangeText={(t) => {
                      setOtpCode(t.replace(/[^0-9]/g, '').slice(0, 6));
                      if (errorMessage) setErrorMessage(null);
                    }}
                    editable={!isDeleting}
                    autoFocus
                  />
                  {isSendingOtp ? <ActivityIndicator size="small" color="#DC2626" /> : null}
                </View>

                {/* Mandatory Password Input Box */}
                {hasPassword ? (
                  <View style={styles.passwordBox}>
                    <Lock size={16} color="#64748B" />
                    <TextInput
                      style={styles.passwordInput}
                      placeholder="Account Password *"
                      placeholderTextColor="#94A3B8"
                      secureTextEntry={!showPassword}
                      value={password}
                      onChangeText={(t) => {
                        setPassword(t);
                        if (errorMessage) setErrorMessage(null);
                      }}
                      editable={!isDeleting}
                      autoCapitalize="none"
                    />
                    <TouchableOpacity
                      onPress={() => setShowPassword(!showPassword)}
                      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                    >
                      {showPassword ? (
                        <EyeOff size={16} color="#64748B" />
                      ) : (
                        <Eye size={16} color="#64748B" />
                      )}
                    </TouchableOpacity>
                  </View>
                ) : null}

                {/* Resend OTP Row */}
                <View style={styles.resendRow}>
                  {resendTimer > 0 ? (
                    <Text style={styles.resendTimerText}>
                      Resend code in{' '}
                      <Text style={{ fontWeight: '700', color: COLORS.primary }}>
                        {resendTimer}s
                      </Text>
                    </Text>
                  ) : (
                    <TouchableOpacity
                      style={styles.resendBtn}
                      onPress={handleSendOtp}
                      disabled={isSendingOtp || isDeleting}
                      activeOpacity={0.7}
                    >
                      <RotateCw size={13} color={COLORS.primary} style={{ marginRight: 4 }} />
                      <Text style={styles.resendBtnText}>Resend OTP Code</Text>
                    </TouchableOpacity>
                  )}
                </View>

                {/* Action Buttons Row */}
                <View style={styles.buttonRow}>
                  <TouchableOpacity
                    activeOpacity={0.85}
                    style={styles.cancelBtn}
                    onPress={onClose}
                    disabled={isDeleting}
                  >
                    <Text style={styles.cancelBtnText}>Cancel</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    activeOpacity={0.85}
                    style={[
                      styles.confirmBtn,
                      isSubmitDisabled && styles.confirmBtnDisabled,
                    ]}
                    onPress={handleConfirmDelete}
                    disabled={isSubmitDisabled}
                  >
                    {isDeleting ? (
                      <ActivityIndicator size="small" color="#FFFFFF" />
                    ) : (
                      <Text style={styles.confirmBtnText}>Permanently Delete</Text>
                    )}
                  </TouchableOpacity>
                </View>
              </View>
            </TouchableWithoutFeedback>
          </KeyboardAvoidingView>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  keyboardContainer: {
    width: '100%',
    maxWidth: 360,
  },
  modalCard: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 24,
    paddingTop: 26,
    paddingBottom: 24,
    alignItems: 'center',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.18,
    shadowRadius: 16,
    elevation: 10,
  },
  iconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#FEF2F2',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  titleText: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
    textAlign: 'center',
    letterSpacing: -0.3,
    marginBottom: 8,
  },
  messageText: {
    fontSize: 13.5,
    fontWeight: '500',
    color: '#475569',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 18,
    paddingHorizontal: 4,
    width: '100%',
  },
  emailHighlight: {
    fontWeight: '700',
    color: COLORS.primary,
    lineHeight: 20,
  },
  inputBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 8,
    paddingHorizontal: 14,
    height: 48,
    backgroundColor: '#F8FAFC',
    width: '100%',
    marginBottom: 12,
  },
  otpInput: {
    flex: 1,
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: 6,
    color: '#0F172A',
    paddingVertical: 0,
  },
  passwordBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 8,
    paddingHorizontal: 14,
    height: 44,
    backgroundColor: '#F8FAFC',
    width: '100%',
    marginBottom: 12,
  },
  passwordInput: {
    flex: 1,
    fontSize: 13,
    color: '#0F172A',
    paddingVertical: 0,
  },
  resendRow: {
    marginTop: 2,
    marginBottom: 20,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 28,
  },
  resendTimerText: {
    fontSize: 12.5,
    color: '#64748B',
    lineHeight: 18,
    textAlign: 'center',
  },
  resendBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  resendBtnText: {
    fontSize: 12.5,
    fontWeight: '700',
    color: COLORS.primary,
    lineHeight: 18,
  },
  buttonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    width: '100%',
  },
  cancelBtn: {
    flex: 1,
    height: 46,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
  },
  confirmBtn: {
    flex: 1.3,
    height: 46,
    backgroundColor: '#DC2626',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  confirmBtnDisabled: {
    backgroundColor: '#F87171',
    opacity: 0.65,
  },
  confirmBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
