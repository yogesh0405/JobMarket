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
  ShieldCheck,
  ShieldAlert,
  CheckCircle2,
  LogOut,
} from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { authApi } from '../../api/authApi';
import { useAuth } from '../../hooks/useAuth';
import { saveTokens } from '../../utils/secureStorage';
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
  const { user, refreshUser, logout } = useAuth();

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
    buttonText?: string;
    onButtonPress?: () => void;
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
      const res: any = await authApi.changePassword({ currentPassword, newPassword });
      setPasswordLoading(false);
      if (res.success) {
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
        setIsChangePassModalOpen(false);
        setSuccessModalConfig({
          visible: true,
          title: 'Password Updated Successfully !',
          message: 'Your account password has been updated securely. Please log in with your new password.',
          buttonText: 'Log In',
          onButtonPress: async () => {
            setSuccessModalConfig((prev) => ({ ...prev, visible: false }));
            await logout();
          },
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
      const res: any = await authApi.resetPassword({
        email: resetEmail.trim(),
        otpCode: otpCode.trim(),
        newPassword: otpNewPass,
      });
      if (res.success) {
        setIsOtpModalOpen(false);
        setOtpCode('');
        setOtpNewPass('');
        setOtpConfirmPass('');
        setSuccessModalConfig({
          visible: true,
          title: 'Password Reset Successfully !',
          message: 'Your account password has been reset. Please log in with your new password.',
          buttonText: 'Log In',
          onButtonPress: async () => {
            setSuccessModalConfig((prev) => ({ ...prev, visible: false }));
            await logout();
          },
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
      {/* Top Header Banner matching Reference */}
      <View style={[styles.headerBannerWhite, { paddingTop: topInset + (Platform.OS === 'android' ? 8 : 6) }]}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          style={styles.backButton}
        >
          <ArrowLeft size={22} color="#0F172A" strokeWidth={2.4} />
        </TouchableOpacity>
        <Text style={styles.headerTitleTextDark}>Security & Privacy</Text>
        <View style={{ width: 28 }} />
      </View>

      <KeyboardAwareScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* SECTION 1: LOGIN & CREDENTIALS */}
        <View style={styles.sectionGroup}>
          <Text style={styles.sectionCategoryTitle}>Login & Credentials</Text>

          {/* Row 1: Change Password */}
          <TouchableOpacity
            style={styles.settingRow}
            onPress={() => {
              setPasswordError(null);
              setIsChangePassModalOpen(true);
            }}
            activeOpacity={0.65}
          >
            <View style={styles.settingIconCol}>
              <Lock size={20} color="#334155" strokeWidth={1.8} />
            </View>
            <View style={styles.settingRowTextContent}>
              <Text style={styles.settingRowTitle}>Change password</Text>
              <Text style={styles.settingRowSub}>
                Update current password using existing account credentials
              </Text>
            </View>
            <ChevronRight size={18} color="#94A3B8" />
          </TouchableOpacity>

          <View style={styles.rowDividerLine} />

          {/* Row 2: Forgot Password */}
          <TouchableOpacity
            style={styles.settingRow}
            onPress={handleOpenResetConfirm}
            activeOpacity={0.65}
          >
            <View style={styles.settingIconCol}>
              <KeyRound size={20} color="#334155" strokeWidth={1.8} />
            </View>
            <View style={styles.settingRowTextContent}>
              <Text style={styles.settingRowTitle}>Forgot password?</Text>
              <Text style={styles.settingRowSub}>
                Send a 6-digit OTP to your registered email to reset password
              </Text>
            </View>
            <ChevronRight size={18} color="#94A3B8" />
          </TouchableOpacity>

          <View style={styles.rowDividerLine} />

          {/* Row 3: Two-Factor Authentication */}
          <View style={styles.settingRow}>
            <View style={styles.settingIconCol}>
              <ShieldCheck size={20} color="#334155" strokeWidth={1.8} />
            </View>
            <View style={styles.settingRowTextContent}>
              <Text style={styles.settingRowTitle}>Two-factor authentication (2FA)</Text>
              <Text style={styles.settingRowSub}>
                {twoFactorEnabled
                  ? 'Active: Every new login requires a 6-digit verification code sent to your email.'
                  : 'Require an email verification code on new device login attempts.'}
              </Text>
            </View>
            <Switch
              value={twoFactorEnabled}
              onValueChange={handleToggle2FA}
              trackColor={{ false: '#E2E8F0', true: '#BFDBFE' }}
              thumbColor={twoFactorEnabled ? '#2563EB' : '#94A3B8'}
            />
          </View>
        </View>

        <View style={styles.sectionSeparator} />

        {/* SECTION 2: ACTIVE SESSIONS */}
        <View style={styles.sectionGroup}>
          <SecuritySessionsSection
            sessions={sessions}
            sessionsLoading={sessionsLoading}
            onRevokeSession={handleRevokeSession}
            onTerminateOtherSessions={handleTerminateOtherSessions}
            isTerminatingOtherSessions={isTerminatingOtherSessions}
          />
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
        buttonText={successModalConfig.buttonText || 'Done'}
        onButtonPress={successModalConfig.onButtonPress}
        onClose={() => {
          if (successModalConfig.onButtonPress) {
            successModalConfig.onButtonPress();
          } else {
            setSuccessModalConfig({ visible: false, title: '' });
          }
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  headerBannerWhite: {
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    paddingTop: 12,
    paddingBottom: 14,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitleTextDark: {
    fontSize: 16.5,
    fontWeight: '700',
    color: '#0F172A',
    textAlign: 'center',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 100,
  },
  sectionGroup: {
    gap: 2,
  },
  sectionCategoryTitle: {
    fontSize: 12.5,
    fontWeight: '600',
    color: '#64748B',
    marginBottom: 4,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    gap: 12,
  },
  settingIconCol: {
    width: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  settingRowTextContent: {
    flex: 1,
    gap: 3,
  },
  settingRowTitle: {
    fontSize: 14.5,
    fontWeight: '600',
    color: '#0F172A',
    lineHeight: 20,
  },
  settingRowSub: {
    fontSize: 12,
    color: '#64748B',
    lineHeight: 17,
  },
  rowDividerLine: {
    height: 1,
    backgroundColor: '#F8FAFC',
  },
  sectionSeparator: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginVertical: 16,
  },
});
