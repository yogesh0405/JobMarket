import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Platform,
  Switch,
  StatusBar,
} from 'react-native';
import {
  ArrowLeft,
  Lock,
  KeyRound,
  ChevronRight,
  ShieldAlert,
  CheckCircle2,
  LogOut,
} from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { authApi } from '../../api/authApi';
import { useAuth } from '../../hooks/useAuth';
import { KeyboardAwareScrollView } from '../../components/common/KeyboardAwareScrollView';
import { ConfirmationModal } from '../../components/common/ConfirmationModal';
import { SuccessModal } from '../../components/common/SuccessModal';
import { COLORS, RADIUS } from '../../constants/theme';
import { SecuritySessionsSection } from './components/SecuritySessionsSection';
import { SecurityPasswordModals } from './components/SecurityPasswordModals';

interface Props {
  navigation: any;
}

export const SecuritySettingsScreen: React.FC<Props> = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const { user, refreshUser, login } = useAuth();

  const [sessions, setSessions] = useState<any[]>([]);
  const [sessionsLoading, setSessionsLoading] = useState(true);

  const [twoFactorEnabled, setTwoFactorEnabled] = useState(
    !!(user?.is_two_factor_enabled || (user as any)?.two_factor_enabled || (user as any)?.twoFactorEnabled)
  );

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPass, setShowCurrentPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [isChangePassModalOpen, setIsChangePassModalOpen] = useState(false);

  const [isOtpModalOpen, setIsOtpModalOpen] = useState(false);
  const [resetEmail, setResetEmail] = useState(user?.email || '');
  const [otpCode, setOtpCode] = useState('');
  const [otpNewPass, setOtpNewPass] = useState('');
  const [otpConfirmPass, setOtpConfirmPass] = useState('');
  const [otpLoading, setOtpLoading] = useState(false);
  const [otpError, setOtpError] = useState<string | null>(null);

  const [confirmModalConfig, setConfirmModalConfig] = useState<{
    visible: boolean;
    title: string;
    message: string;
    highlightText?: string;
    confirmText: string;
    cancelText?: string;
    type?: 'danger' | 'primary' | 'warning';
    icon?: React.ReactNode;
    iconBgColor?: string;
    onConfirm: () => void;
  }>({
    visible: false,
    title: '',
    message: '',
    confirmText: 'Confirm',
    cancelText: 'Cancel',
    type: 'danger',
    onConfirm: () => {},
  });

  const [successModalConfig, setSuccessModalConfig] = useState<{
    visible: boolean;
    title: string;
    message?: string;
  }>({
    visible: false,
    title: '',
  });

  const handleOpenResetConfirm = () => {
    const targetEmail = user?.email || resetEmail;
    if (!targetEmail) {
      Alert.alert('Notice', 'No registered email found for this account.');
      return;
    }
    setConfirmModalConfig({
      visible: true,
      title: 'Reset Password',
      message: 'A 6-digit verification code will be sent to your registered email address:',
      highlightText: targetEmail,
      confirmText: 'Send Code',
      cancelText: 'Cancel',
      type: 'primary',
      iconBgColor: '#EFF6FF',
      icon: <KeyRound size={26} color={COLORS.primary} />,
      onConfirm: async () => {
        setConfirmModalConfig((prev) => ({ ...prev, visible: false }));
        setOtpError(null);
        setResetEmail(targetEmail);
        setIsOtpModalOpen(true);
        try {
          const res = await authApi.forgotPassword(targetEmail);
          if (!res.success) {
            setOtpError(res.message || 'Could not dispatch OTP. Please check email address.');
          }
        } catch (err: any) {
          console.warn('Direct OTP trigger error:', err);
        }
      },
    });
  };

  const detectRealTimeDeviceSession = async () => {
    setSessionsLoading(true);
    try {
      const serverRes = await authApi.getSessions();
      if (serverRes.success && Array.isArray(serverRes.data)) {
        setSessions(serverRes.data);
      } else {
        setSessions([]);
      }
    } catch (e) {
      console.warn('Error fetching real-time sessions:', e);
      setSessions([]);
    } finally {
      setSessionsLoading(false);
    }
  };

  useEffect(() => {
    // 1. Fetch live 2FA and profile settings from backend
    authApi.getProfile().then((res) => {
      if (res.success && res.data) {
        const u = (res.data as any).user || res.data;
        const is2FA = Boolean(u.is_two_factor_enabled || u.two_factor_enabled || u.twoFactorEnabled);
        setTwoFactorEnabled(is2FA);
        if (u.email) setResetEmail(u.email);
        refreshUser().catch(() => {});
      }
    }).catch(() => {});

    // 2. Fetch live active sessions from backend
    detectRealTimeDeviceSession();
  }, []);

  const handleRevokeSession = (sessionId: string, deviceName: string) => {
    setConfirmModalConfig({
      visible: true,
      title: 'Log Out Device',
      message: `Are you sure you want to log out of "${deviceName}"? You will need to sign in again on that device.`,
      confirmText: 'Log Out',
      cancelText: 'Cancel',
      type: 'danger',
      iconBgColor: '#FEE2E2',
      icon: <LogOut size={26} color="#DC2626" />,
      onConfirm: async () => {
        setConfirmModalConfig((prev) => ({ ...prev, visible: false }));
        try {
          await authApi.revokeSession(sessionId);
          setSessions((prev) => prev.filter((s) => s.id !== sessionId));
        } catch (e) {
          setSessions((prev) => prev.filter((s) => s.id !== sessionId));
        }
      },
    });
  };

  const [isTerminatingOtherSessions, setIsTerminatingOtherSessions] = useState(false);

  const handleTerminateOtherSessions = () => {
    setConfirmModalConfig({
      visible: true,
      title: 'Log Out Other Devices',
      message: 'Are you sure you want to log out of all other devices? You will remain signed in on this current device.',
      confirmText: 'Log Out Others',
      cancelText: 'Cancel',
      type: 'danger',
      iconBgColor: '#FEE2E2',
      icon: <LogOut size={26} color="#DC2626" />,
      onConfirm: async () => {
        setConfirmModalConfig((prev) => ({ ...prev, visible: false }));
        setIsTerminatingOtherSessions(true);
        try {
          await authApi.logoutAll();
          setSessions((prev) => prev.filter((s) => s.isCurrent || s.is_current));
        } catch (e: any) {
          console.warn(e);
        } finally {
          setIsTerminatingOtherSessions(false);
        }
      },
    });
  };

  const handleToggle2FA = async (nextVal: boolean) => {
    const previousVal = twoFactorEnabled;
    setTwoFactorEnabled(nextVal);

    try {
      const res = await authApi.toggle2FA(nextVal);
      if (res && res.success) {
        const serverState = Boolean((res as any).isTwoFactorEnabled ?? (res as any).is_two_factor_enabled ?? nextVal);
        setTwoFactorEnabled(serverState);
        await refreshUser();
        Alert.alert('2FA Protection Updated', `Two-Factor Authentication is now ${serverState ? 'ENABLED' : 'DISABLED'}.`);
      } else {
        setTwoFactorEnabled(previousVal);
        Alert.alert('Notice', res.message || 'Could not update 2FA setting on server.');
      }
    } catch (err: any) {
      setTwoFactorEnabled(previousVal);
      Alert.alert('Error', err.message || 'Failed to update 2FA setting.');
    }
  };

  const handleChangePassword = async () => {
    setPasswordError(null);

    if (!currentPassword || !newPassword || !confirmPassword) {
      setPasswordError('Please fill out all password fields.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError('New password and confirm password do not match.');
      return;
    }
    if (newPassword.length < 6) {
      setPasswordError('New password must be at least 6 characters long.');
      return;
    }

    setPasswordLoading(true);
    try {
      const res = await authApi.changePassword({ currentPassword, newPassword });
      setPasswordLoading(false);
      if (res.success) {
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
        setIsChangePassModalOpen(false);
        setSuccessModalConfig({
          visible: true,
          title: 'Password Updated Successfully !',
          message: 'Your account password has been updated securely.',
        });
      } else {
        setPasswordError(res.message || res.error || 'Failed to update password');
      }
    } catch (err: any) {
      setPasswordLoading(false);
      setPasswordError(err.message || 'Error updating password');
    }
  };

  const handleResetWithOtp = async () => {
    setOtpError(null);
    if (!otpCode.trim() || otpCode.trim().length !== 6) {
      setOtpError('Please enter the full 6-digit verification code.');
      return;
    }
    if (!otpNewPass || !otpConfirmPass) {
      setOtpError('Please enter and confirm your new password.');
      return;
    }
    if (otpNewPass.length < 6) {
      setOtpError('New password must be at least 6 characters.');
      return;
    }
    if (otpNewPass !== otpConfirmPass) {
      setOtpError('Passwords do not match.');
      return;
    }

    setOtpLoading(true);
    try {
      const res = await authApi.resetPassword({
        email: resetEmail.trim(),
        otpCode: otpCode.trim(),
        newPassword: otpNewPass,
      });
      if (res.success) {
        // Automatically renew authenticated session with the new password
        try {
          await login({
            email: resetEmail.trim(),
            password: otpNewPass,
          });
        } catch (loginErr) {
          console.warn('Silent session renewal after password reset:', loginErr);
        }

        setIsOtpModalOpen(false);
        setOtpCode('');
        setOtpNewPass('');
        setOtpConfirmPass('');
        setSuccessModalConfig({
          visible: true,
          title: 'Password Reset Successfully !',
          message: 'Your account password has been updated. You remain signed in.',
        });
      } else {
        setOtpError(res.message || 'Failed to reset password.');
      }
    } catch (err: any) {
      setOtpError(err.message || 'Failed to reset password.');
    } finally {
      setOtpLoading(false);
    }
  };

  const topInset = Math.max(insets.top || 0, Platform.OS === 'android' ? (StatusBar.currentHeight || 24) : 0);

  return (
    <View style={styles.container}>
      {/* Top Header Banner */}
      <View style={[styles.headerBannerWhite, { paddingTop: topInset + (Platform.OS === 'android' ? 8 : 6) }]}>
        <View style={styles.headerTitleNavRow}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            style={{ padding: 4 }}
          >
            <ArrowLeft size={22} color="#1E293B" strokeWidth={2} />
          </TouchableOpacity>
          <Text style={styles.headerTitleTextDark}>Security & Active Sessions</Text>
        </View>

        <View style={styles.topBannerStatsCardWhite}>
          <View style={styles.statColItem}>
            <Text style={styles.statValDarkText}>{twoFactorEnabled ? 'Active' : 'Off'}</Text>
            <Text style={styles.statLabelMutedTextDark}>2FA Protection</Text>
          </View>
          <View style={styles.statColDividerDark} />
          <View style={styles.statColItem}>
            <Text style={styles.statValDarkText}>{sessions.length || 1}</Text>
            <Text style={styles.statLabelMutedTextDark}>Device Sessions</Text>
          </View>
          <View style={styles.statColDividerDark} />
          <View style={styles.statColItem}>
            <Text style={styles.statValDarkText}>100%</Text>
            <Text style={styles.statLabelMutedTextDark}>Encrypted</Text>
          </View>
        </View>
      </View>

      <KeyboardAwareScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* CARD BLOCK 1: ACTIVE LOGIN SESSIONS */}
        <SecuritySessionsSection
          sessions={sessions}
          sessionsLoading={sessionsLoading}
          onRevokeSession={handleRevokeSession}
          onTerminateOtherSessions={handleTerminateOtherSessions}
          isTerminatingOtherSessions={isTerminatingOtherSessions}
        />

        {/* CARD BLOCK 2: ACCOUNT CREDENTIALS */}
        <View style={styles.cardBlock}>
          <View style={styles.sectionHeaderRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.sectionBlockTitle}>Account Credentials & Recovery</Text>
              <Text style={styles.sectionBlockSub}>Update password or trigger instant OTP reset</Text>
            </View>
          </View>

          <View style={{ gap: 10, paddingLeft: 14 }}>
            <TouchableOpacity
              style={styles.actionItemRow}
              onPress={() => {
                setPasswordError(null);
                setIsChangePassModalOpen(true);
              }}
              activeOpacity={0.7}
            >
              <View style={styles.actionIconPill}>
                <Lock size={16} color={COLORS.primary} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.actionRowTitle}>Change Account Password</Text>
                <Text style={styles.actionRowSub}>
                  Update current password using existing account credentials
                </Text>
              </View>
              <ChevronRight size={18} color="#94A3B8" />
            </TouchableOpacity>

            <View style={styles.rowDividerLine} />

            <TouchableOpacity
              style={styles.actionItemRow}
              onPress={handleOpenResetConfirm}
              activeOpacity={0.7}
            >
              <View style={styles.actionIconPill}>
                <KeyRound size={16} color={COLORS.primary} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.actionRowTitle}>Forgot Password?</Text>
                <Text style={styles.actionRowSub}>
                  Send 6-digit OTP to your registered email to reset password
                </Text>
              </View>
              <ChevronRight size={18} color={COLORS.primary} />
            </TouchableOpacity>
          </View>
        </View>

        {/* CARD BLOCK 3: MULTI-FACTOR AUTHENTICATION (2FA) */}
        <View style={styles.cardBlock}>
          <View style={styles.sectionHeaderRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.sectionBlockTitle}>Two-Factor Authentication (2FA)</Text>
              <Text style={styles.sectionBlockSub}>Extra layer of email OTP login security</Text>
            </View>
            <Switch
              value={twoFactorEnabled}
              onValueChange={handleToggle2FA}
              trackColor={{ false: '#CBD5E1', true: '#BFDBFE' }}
              thumbColor={twoFactorEnabled ? COLORS.primary : '#94A3B8'}
            />
          </View>

          <View style={[styles.twoFactorBannerBox, twoFactorEnabled ? styles.twoFactorActiveBox : styles.twoFactorDisabledBox]}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 }}>
              {twoFactorEnabled ? (
                <CheckCircle2 size={16} color="#16A34A" />
              ) : (
                <ShieldAlert size={16} color="#D97706" />
              )}
              <Text style={[styles.twoFactorStatusText, { color: twoFactorEnabled ? '#15803D' : '#B45309' }]}>
                2FA Protection is {twoFactorEnabled ? 'ACTIVE & ENFORCED' : 'DISABLED'}
              </Text>
            </View>
            <Text style={styles.twoFactorBannerDesc}>
              {twoFactorEnabled
                ? 'Every new device login requires a 6-digit verification code sent directly to your registered email address.'
                : 'Enable 2FA to protect your account from unauthorized login attempts across untrusted devices.'}
            </Text>
          </View>
        </View>
      </KeyboardAwareScrollView>

      {/* Password & OTP Modals */}
      <SecurityPasswordModals
        isChangePassModalOpen={isChangePassModalOpen}
        setIsChangePassModalOpen={setIsChangePassModalOpen}
        currentPassword={currentPassword}
        setCurrentPassword={setCurrentPassword}
        newPassword={newPassword}
        setNewPassword={setNewPassword}
        confirmPassword={confirmPassword}
        setConfirmPassword={setConfirmPassword}
        showCurrentPass={showCurrentPass}
        setShowCurrentPass={setShowCurrentPass}
        showNewPass={showNewPass}
        setShowNewPass={setShowNewPass}
        showConfirmPass={showConfirmPass}
        setShowConfirmPass={setShowConfirmPass}
        passwordLoading={passwordLoading}
        passwordError={passwordError}
        onChangePassword={handleChangePassword}
        isOtpModalOpen={isOtpModalOpen}
        setIsOtpModalOpen={setIsOtpModalOpen}
        resetEmail={resetEmail}
        otpCode={otpCode}
        setOtpCode={setOtpCode}
        otpNewPass={otpNewPass}
        setOtpNewPass={setOtpNewPass}
        otpConfirmPass={otpConfirmPass}
        setOtpConfirmPass={setOtpConfirmPass}
        otpLoading={otpLoading}
        otpError={otpError}
        onResetWithOtp={handleResetWithOtp}
      />
      {/* Confirmation Modal */}
      <ConfirmationModal
        visible={confirmModalConfig.visible}
        title={confirmModalConfig.title}
        message={confirmModalConfig.message}
        highlightText={confirmModalConfig.highlightText}
        confirmText={confirmModalConfig.confirmText}
        cancelText={confirmModalConfig.cancelText}
        type={confirmModalConfig.type}
        icon={confirmModalConfig.icon}
        iconBgColor={confirmModalConfig.iconBgColor}
        onClose={() => setConfirmModalConfig((prev) => ({ ...prev, visible: false }))}
        onConfirm={confirmModalConfig.onConfirm}
      />
      {/* Success Modal */}
      <SuccessModal
        visible={successModalConfig.visible}
        title={successModalConfig.title}
        message={successModalConfig.message}
        onClose={() => setSuccessModalConfig({ visible: false, title: '' })}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F7F7',
  },
  headerBannerWhite: {
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#CBD5E1',
    paddingTop: 12,
    paddingHorizontal: 16,
  },
  headerTitleNavRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 12,
  },
  headerTitleTextDark: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
  },
  topBannerStatsCardWhite: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: RADIUS.card,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingVertical: 10,
    marginBottom: 12,
  },
  statColItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValDarkText: {
    fontSize: 16,
    fontWeight: '900',
    color: COLORS.primary,
  },
  statLabelMutedTextDark: {
    fontSize: 11,
    fontWeight: '600',
    color: '#64748B',
    marginTop: 1,
  },
  statColDividerDark: {
    width: 1,
    height: 24,
    backgroundColor: '#CBD5E1',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 120,
    gap: 14,
  },
  cardBlock: {
    backgroundColor: '#FFFFFF',
    borderRadius: RADIUS.card,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    padding: 14,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionBlockTitle: {
    fontSize: 14.5,
    fontWeight: '800',
    color: '#0F172A',
  },
  sectionBlockSub: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
    lineHeight: 17,
  },
  slateSectionDivider: {
    height: 1,
    backgroundColor: '#94A3B8',
    marginVertical: 4,
  },
  actionItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 8,
  },
  actionIconPill: {
    width: 32,
    height: 32,
    borderRadius: 6,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionRowTitle: {
    fontSize: 13.5,
    fontWeight: '700',
    color: '#0F172A',
  },
  actionRowSub: {
    fontSize: 11.5,
    color: '#64748B',
    marginTop: 2,
    lineHeight: 16,
  },
  rowDividerLine: {
    height: 1,
    backgroundColor: '#F1F5F9',
  },
  rowDividerLineSlate: {
    height: 1,
    backgroundColor: '#94A3B8',
    marginVertical: 6,
  },
  twoFactorBannerBox: {
    padding: 12,
    borderRadius: 6,
    marginTop: 6,
  },
  twoFactorActiveBox: {
    backgroundColor: '#F0FDF4',
    borderWidth: 1,
    borderColor: '#BBF7D0',
  },
  twoFactorDisabledBox: {
    backgroundColor: '#FFFBEB',
    borderWidth: 1,
    borderColor: '#FDE68A',
  },
  twoFactorStatusText: {
    fontSize: 12,
    fontWeight: '800',
  },
  twoFactorBannerDesc: {
    fontSize: 12,
    color: '#475569',
    lineHeight: 17,
  },
});
