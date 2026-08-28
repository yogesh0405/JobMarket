import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Platform,
  Switch,
  StatusBar,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import {
  ArrowLeft,
  KeyRound,
  Laptop,
  Smartphone,
  Send,
  Eye,
  EyeOff,
  ShieldCheck,
  LogOut,
} from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { authApi } from '../../api/authApi';
import { useAuth } from '../../hooks/useAuth';
import { KeyboardAwareScrollView } from '../../components/common/KeyboardAwareScrollView';
import { ConfirmationModal } from '../../components/common/ConfirmationModal';
import { SuccessModal } from '../../components/common/SuccessModal';
import { ErrorBanner } from '../../components/common/ErrorBanner';
import { COLORS } from '../../constants/theme';
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

  // Reset Password Inline Form States
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPass, setShowCurrentPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  // OTP Modal State
  const [isOtpModalOpen, setIsOtpModalOpen] = useState(false);
  const [resetEmail, setResetEmail] = useState(user?.email || '');
  const [otpCode, setOtpCode] = useState('');
  const [otpNewPass, setOtpNewPass] = useState('');
  const [otpConfirmPass, setOtpConfirmPass] = useState('');
  const [otpLoading, setOtpLoading] = useState(false);
  const [otpError, setOtpError] = useState<string | null>(null);

  // Confirm Modal State
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

  // Success Modal State
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

  const topInset = Math.max(
    insets.top || 0,
    Platform.OS === 'android' ? (StatusBar.currentHeight || 24) : 20
  );
  const bottomInset = Math.max(insets.bottom || 0, 16);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" translucent backgroundColor="transparent" />

      {/* Top Header matching Reference Image */}
      <View style={[styles.headerBanner, { paddingTop: topInset + 6 }]}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          style={styles.circleBackBtn}
          activeOpacity={0.7}
        >
          <ArrowLeft size={20} color="#0F172A" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Security & Sessions</Text>
      </View>
      <View style={styles.headerDivider} />

      <KeyboardAwareScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: bottomInset + 24 },
        ]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* CARD 1: RESET PASSWORD (MATCHING REFERENCE LAYOUT) */}
        <View style={styles.sectionCard}>
          <View style={styles.cardHeaderRow}>
            <View style={styles.cardHeaderCol}>
              <Text style={styles.cardTitle}>Reset Password</Text>
              <Text style={styles.cardSubtitle}>
                Update your credentials for secure ledger access.
              </Text>
            </View>
            <View style={styles.cardHeaderIconBox}>
              <KeyRound size={20} color="#64748B" />
            </View>
          </View>

          {passwordError ? (
            <ErrorBanner message={passwordError} style={{ marginBottom: 14 }} />
          ) : null}

          {/* Current Password Field */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Current Password</Text>
            <View style={styles.inputBox}>
              <TextInput
                style={styles.inputField}
                placeholder="Enter current password"
                placeholderTextColor="#94A3B8"
                secureTextEntry={!showCurrentPass}
                value={currentPassword}
                onChangeText={(t) => {
                  setCurrentPassword(t);
                  if (passwordError) setPasswordError(null);
                }}
              />
              <TouchableOpacity
                onPress={() => setShowCurrentPass(!showCurrentPass)}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                activeOpacity={0.7}
              >
                {showCurrentPass ? (
                  <EyeOff size={18} color="#64748B" />
                ) : (
                  <Eye size={18} color="#64748B" />
                )}
              </TouchableOpacity>
            </View>
          </View>

          {/* New Password Field */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>New Password</Text>
            <View style={styles.inputBox}>
              <TextInput
                style={styles.inputField}
                placeholder="Min 6 characters"
                placeholderTextColor="#94A3B8"
                secureTextEntry={!showNewPass}
                value={newPassword}
                onChangeText={(t) => {
                  setNewPassword(t);
                  if (passwordError) setPasswordError(null);
                }}
              />
              <TouchableOpacity
                onPress={() => setShowNewPass(!showNewPass)}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                activeOpacity={0.7}
              >
                {showNewPass ? (
                  <EyeOff size={18} color="#64748B" />
                ) : (
                  <Eye size={18} color="#64748B" />
                )}
              </TouchableOpacity>
            </View>
          </View>

          {/* Confirm New Password Field */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Confirm New Password</Text>
            <View style={styles.inputBox}>
              <TextInput
                style={styles.inputField}
                placeholder="Re-enter new password"
                placeholderTextColor="#94A3B8"
                secureTextEntry={!showConfirmPass}
                value={confirmPassword}
                onChangeText={(t) => {
                  setConfirmPassword(t);
                  if (passwordError) setPasswordError(null);
                }}
              />
              <TouchableOpacity
                onPress={() => setShowConfirmPass(!showConfirmPass)}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                activeOpacity={0.7}
              >
                {showConfirmPass ? (
                  <EyeOff size={18} color="#64748B" />
                ) : (
                  <Eye size={18} color="#64748B" />
                )}
              </TouchableOpacity>
            </View>
          </View>

          {/* Save New Password Button */}
          <TouchableOpacity
            style={styles.primarySaveBtn}
            onPress={handleChangePassword}
            disabled={passwordLoading}
            activeOpacity={0.85}
          >
            {passwordLoading ? (
              <ActivityIndicator color="#FFFFFF" size="small" />
            ) : (
              <Text style={styles.primarySaveBtnText}>Save New Password</Text>
            )}
          </TouchableOpacity>

          {/* Soft Divider */}
          <View style={styles.cardInnerDivider} />

          {/* Forgot Password Section */}
          <View style={styles.forgotSection}>
            <Text style={styles.forgotTitle}>Forgot your password?</Text>
            <Text style={styles.forgotSubtitle}>
              We'll email a secure one-time reset code to your registered email.
            </Text>

            <TouchableOpacity
              style={styles.outlineResetBtn}
              onPress={handleOpenResetConfirm}
              activeOpacity={0.75}
            >
              <Send size={15} color="#0F172A" />
              <Text style={styles.outlineResetBtnText}>Forgot password</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* CARD 2: ACTIVE SESSIONS (MATCHING REFERENCE LAYOUT) */}
        <View style={styles.sectionCard}>
          <View style={styles.cardHeaderRow}>
            <View style={styles.cardHeaderCol}>
              <Text style={styles.cardTitle}>Active Sessions</Text>
              <Text style={styles.cardSubtitle}>
                Devices currently signed in to your account.
              </Text>
            </View>
            <View style={styles.cardHeaderIconBox}>
              <Laptop size={20} color="#64748B" />
            </View>
          </View>

          {/* Sessions List */}
          {sessionsLoading ? (
            <View style={styles.sessionLoadingBox}>
              <ActivityIndicator size="small" color={COLORS.primary} />
              <Text style={styles.sessionLoadingText}>Checking active devices...</Text>
            </View>
          ) : sessions.length === 0 ? (
            <View style={styles.sessionPillItem}>
              <View style={styles.sessionIconWrapper}>
                <Smartphone size={18} color="#475569" />
              </View>
              <View style={styles.sessionInfoCol}>
                <Text style={styles.sessionDeviceName}>Current Device</Text>
                <Text style={styles.sessionMetaText}>Active Now</Text>
              </View>
              <View style={styles.thisDeviceBadge}>
                <Text style={styles.thisDeviceBadgeText}>This Device</Text>
              </View>
            </View>
          ) : (
            <View style={styles.sessionsListContainer}>
              {sessions.map((sess, idx) => {
                const isCurrent = Boolean(sess.isCurrent || sess.is_current);
                const dType = (sess?.deviceType || sess?.device_type || '').toLowerCase();
                const osStr = (sess?.os || '').toLowerCase();
                const isMobile =
                  dType === 'mobile' ||
                  dType === 'tablet' ||
                  osStr.includes('android') ||
                  osStr.includes('ios');

                const DeviceIcon = isMobile ? Smartphone : Laptop;
                const rawName =
                  sess.deviceName ||
                  sess.device_name ||
                  (isMobile ? 'Mobile App' : 'Desktop Browser');
                const cleanName =
                  rawName.replace(/\s*\([^)]*JobMarket[^)]*\)/gi, '').trim() || rawName;

                const activeTimeStr = isCurrent
                  ? `Active Now · IP: ${sess.ipAddress || sess.ip || '198.51.100.24'}`
                  : sess.lastUsedAt
                  ? `Last active ${new Date(sess.lastUsedAt).toLocaleDateString('en-IN', {
                      month: 'short',
                      day: 'numeric',
                    })}`
                  : 'Last active recently';

                return (
                  <View key={sess.id || idx} style={styles.sessionPillItem}>
                    <View style={styles.sessionIconWrapper}>
                      <DeviceIcon size={18} color="#475569" strokeWidth={1.8} />
                    </View>
                    <View style={styles.sessionInfoCol}>
                      <Text style={styles.sessionDeviceName}>
                        {isCurrent ? `Current Device (${cleanName})` : cleanName}
                      </Text>
                      <Text style={styles.sessionMetaText}>{activeTimeStr}</Text>
                    </View>

                    {isCurrent ? (
                      <View style={styles.thisDeviceBadge}>
                        <Text style={styles.thisDeviceBadgeText}>This Device</Text>
                      </View>
                    ) : (
                      <TouchableOpacity
                        onPress={() => handleRevokeSession(sess.id, cleanName)}
                        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                        activeOpacity={0.7}
                      >
                        <LogOut size={16} color="#94A3B8" />
                      </TouchableOpacity>
                    )}
                  </View>
                );
              })}
            </View>
          )}

          {/* Log Out Other Devices Action */}
          <TouchableOpacity
            style={styles.logoutOthersBtnRow}
            onPress={handleTerminateOtherSessions}
            disabled={isTerminatingOtherSessions}
            activeOpacity={0.7}
          >
            <LogOut size={15} color="#EF4444" strokeWidth={2} />
            <Text style={styles.logoutOthersBtnText}>
              {isTerminatingOtherSessions
                ? 'Logging out other devices...'
                : 'Log out of all other devices'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* CARD 3: TWO-FACTOR AUTHENTICATION */}
        <View style={styles.sectionCard}>
          <View style={styles.cardHeaderRow}>
            <View style={styles.cardHeaderCol}>
              <Text style={styles.cardTitle}>Two-Factor Authentication</Text>
              <Text style={styles.cardSubtitle}>
                {twoFactorEnabled
                  ? 'Active: Verification code sent to email on new device login.'
                  : 'Require an email verification code on new device login attempts.'}
              </Text>
            </View>
            <Switch
              value={twoFactorEnabled}
              onValueChange={handleToggle2FA}
              trackColor={{ false: '#E2E8F0', true: '#BFDBFE' }}
              thumbColor={twoFactorEnabled ? COLORS.primary : '#94A3B8'}
            />
          </View>
        </View>
      </KeyboardAwareScrollView>

      {/* OTP Password Reset Modal */}
      <SecurityPasswordModals
        isChangePassModalOpen={false}
        setIsChangePassModalOpen={() => {}}
        currentPassword=""
        setCurrentPassword={() => {}}
        newPassword=""
        setNewPassword={() => {}}
        confirmPassword=""
        setConfirmPassword={() => {}}
        showCurrentPass={false}
        setShowCurrentPass={() => {}}
        showNewPass={false}
        setShowNewPass={() => {}}
        showConfirmPass={false}
        setShowConfirmPass={() => {}}
        passwordLoading={false}
        passwordError={null}
        onChangePassword={() => {}}
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
    backgroundColor: '#F8FAFC',
  },
  headerBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 12,
    backgroundColor: '#FFFFFF',
    gap: 12,
  },
  circleBackBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#0F172A',
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
    letterSpacing: -0.3,
  },
  headerDivider: {
    height: 1,
    backgroundColor: '#F1F5F9',
  },
  scrollContent: {
    paddingHorizontal: 14,
    paddingTop: 12,
    gap: 12,
  },
  sectionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 16,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  cardHeaderCol: {
    flex: 1,
    paddingRight: 8,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
    letterSpacing: -0.2,
    marginBottom: 3,
  },
  cardSubtitle: {
    fontSize: 11.5,
    color: '#64748B',
    lineHeight: 15,
  },
  cardHeaderIconBox: {
    paddingTop: 2,
  },
  inputGroup: {
    marginBottom: 10,
  },
  inputLabel: {
    fontSize: 11.5,
    fontWeight: '600',
    color: '#334155',
    marginBottom: 5,
  },
  inputBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F7F6F2',
    borderWidth: 1,
    borderColor: '#EAE7E0',
    borderRadius: 12,
    height: 42,
    paddingHorizontal: 12,
  },
  inputField: {
    flex: 1,
    fontSize: 12.5,
    color: '#0F172A',
    fontWeight: '500',
    paddingVertical: 0,
  },
  primarySaveBtn: {
    backgroundColor: COLORS.primary,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
    marginBottom: 4,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 2,
  },
  primarySaveBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  cardInnerDivider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginVertical: 14,
  },
  forgotSection: {
    gap: 3,
  },
  forgotTitle: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#0F172A',
  },
  forgotSubtitle: {
    fontSize: 11,
    color: '#64748B',
    lineHeight: 15,
    marginBottom: 8,
  },
  outlineResetBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    backgroundColor: '#FFFFFF',
    gap: 6,
  },
  outlineResetBtnText: {
    fontSize: 12.5,
    fontWeight: '600',
    color: '#0F172A',
  },
  sessionLoadingBox: {
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  sessionLoadingText: {
    fontSize: 11,
    color: '#64748B',
  },
  sessionsListContainer: {
    gap: 8,
    marginBottom: 10,
  },
  sessionPillItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F7F6F2',
    borderWidth: 1,
    borderColor: '#EAE7E0',
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 10,
  },
  sessionIconWrapper: {
    width: 28,
    height: 28,
    borderRadius: 7,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sessionInfoCol: {
    flex: 1,
  },
  sessionDeviceName: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 1,
  },
  sessionMetaText: {
    fontSize: 10.5,
    color: '#64748B',
  },
  thisDeviceBadge: {
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  thisDeviceBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#2E7D32',
  },
  logoutOthersBtnRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    paddingTop: 6,
    paddingBottom: 2,
  },
  logoutOthersBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#EF4444',
  },
});
