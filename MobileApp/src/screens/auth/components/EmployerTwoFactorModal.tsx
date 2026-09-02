import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  TextInput,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import { ShieldCheck, X, KeyRound, RotateCw } from 'lucide-react-native';
import { ErrorBanner } from '../../../components/common/ErrorBanner';
import { COLORS } from '../../../constants/theme';

interface EmployerTwoFactorModalProps {
  visible: boolean;
  onClose: () => void;
  email?: string;
  twoFactorOtp: string;
  setTwoFactorOtp: (val: string) => void;
  twoFactorError: string | null;
  setTwoFactorError: (err: string | null) => void;
  twoFactorLoading: boolean;
  onVerify: () => void;
  onResend?: () => Promise<void>;
}

export const EmployerTwoFactorModal: React.FC<EmployerTwoFactorModalProps> = ({
  visible,
  onClose,
  email,
  twoFactorOtp,
  setTwoFactorOtp,
  twoFactorError,
  setTwoFactorError,
  twoFactorLoading,
  onVerify,
  onResend,
}) => {
  const [resendTimer, setResendTimer] = useState(60);
  const [resending, setResending] = useState(false);

  useEffect(() => {
    let interval: any = null;
    if (visible && resendTimer > 0) {
      interval = setInterval(() => setResendTimer((t) => t - 1), 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [visible, resendTimer]);

  const handleResendPress = async () => {
    if (resendTimer > 0 || resending || !onResend) return;
    setResending(true);
    try {
      await onResend();
      setResendTimer(60);
    } finally {
      setResending(false);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.modalBackdrop}>
        <View style={styles.mfaCard}>
          <View style={styles.mfaHeaderRow}>
            <View style={styles.mfaIconBadge}>
              <ShieldCheck size={22} color={COLORS.primary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.mfaTitle}>Two-Factor Security</Text>
              <Text style={styles.mfaSub}>
                Enter the 6-digit OTP code sent to{' '}
                <Text style={{ fontWeight: '700', color: '#0F172A' }}>{email || 'your registered email'}</Text>.
              </Text>
            </View>
            <TouchableOpacity onPress={onClose} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <X size={20} color="#64748B" />
            </TouchableOpacity>
          </View>

          {twoFactorError ? <ErrorBanner message={twoFactorError} style={{ marginBottom: 12 }} /> : null}

          <View style={styles.mfaInputBox}>
            <KeyRound size={18} color={COLORS.primary} />
            <TextInput
              style={styles.mfaTextInput}
              placeholder="123456"
              placeholderTextColor="#94A3B8"
              keyboardType="number-pad"
              maxLength={6}
              value={twoFactorOtp}
              onChangeText={(t) => {
                setTwoFactorOtp(t.replace(/[^0-9]/g, '').slice(0, 6));
                if (twoFactorError) setTwoFactorError(null);
              }}
            />
          </View>

          <TouchableOpacity
            style={styles.mfaVerifyBtn}
            activeOpacity={0.85}
            disabled={twoFactorLoading || twoFactorOtp.trim().length !== 6}
            onPress={onVerify}
          >
            {twoFactorLoading ? (
              <ActivityIndicator color="#FFFFFF" size="small" />
            ) : (
              <Text style={styles.mfaVerifyBtnText}>Verify 2FA Code</Text>
            )}
          </TouchableOpacity>

          {onResend ? (
            <View style={styles.resendRow}>
              {resendTimer > 0 ? (
                <Text style={styles.resendTimerText}>
                  Resend 2FA code in <Text style={{ fontWeight: '700', color: COLORS.primary }}>{resendTimer}s</Text>
                </Text>
              ) : (
                <TouchableOpacity
                  style={styles.resendBtn}
                  onPress={handleResendPress}
                  disabled={resending}
                  activeOpacity={0.7}
                >
                  <RotateCw size={13} color={COLORS.primary} />
                  <Text style={styles.resendBtnText}>
                    {resending ? 'Sending Code...' : 'Resend 2FA Code'}
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          ) : null}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  mfaCard: {
    width: '100%',
    maxWidth: 380,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    padding: 18,
  },
  mfaHeaderRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    marginBottom: 14,
  },
  mfaIconBadge: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  mfaTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
  },
  mfaSub: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
    lineHeight: 16,
  },
  mfaInputBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 46,
    backgroundColor: '#F8FAFC',
    marginBottom: 14,
  },
  mfaTextInput: {
    flex: 1,
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 4,
    color: '#0F172A',
  },
  mfaVerifyBtn: {
    height: 44,
    backgroundColor: COLORS.primary,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mfaVerifyBtnText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  resendRow: {
    marginTop: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  resendTimerText: {
    fontSize: 12,
    color: '#64748B',
  },
  resendBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  resendBtnText: {
    fontSize: 12.5,
    fontWeight: '700',
    color: COLORS.primary,
  },
});
