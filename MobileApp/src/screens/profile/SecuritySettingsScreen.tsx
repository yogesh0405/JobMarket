import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Switch,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import {
  KeyRound,
  Laptop,
  Smartphone,
  Send,
  Eye,
  EyeOff,
  ShieldCheck,
  LogOut,
  AlertTriangle,
} from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { authApi } from '../../api/authApi';
import { useAuth } from '../../hooks/useAuth';
import { Header } from '../../components/common/Header';
import { FocusAwareStatusBar } from '../../components/common/FocusAwareStatusBar';
import { KeyboardAwareScrollView } from '../../components/common/KeyboardAwareScrollView';
import { ConfirmationModal } from '../../components/common/ConfirmationModal';
import { SuccessModal } from '../../components/common/SuccessModal';
import { ErrorBanner } from '../../components/common/ErrorBanner';
import { COLORS, RADIUS } from '../../constants/theme';
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
    loading?: boolean;
    onConfirm: () => void;
  }>({
    visible: false,
    title: '',
    message: '',
    confirmText: 'Confirm',
    cancelText: 'Cancel',
    type: 'danger',
    loading: false,
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
      icon: <KeyRound size={24} color="#1764E8" />,
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
      icon: <LogOut size={24} color="#DC2626" />,
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
      icon: <LogOut size={24} color="#DC2626" />,
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

  const executeToggle2FA = async (nextVal: boolean) => {
    // 1. Set loading indicator on confirmation modal
    setConfirmModalConfig((prev) => ({ ...prev, loading: true }));

    try {
      const res = await authApi.toggle2FA(nextVal);
      if (res && res.success) {
        const serverState = Boolean((res as any).isTwoFactorEnabled ?? (res as any).is_two_factor_enabled ?? nextVal);
        // 2. Update local 2FA state immediately
        setTwoFactorEnabled(serverState);
        // 3. Close the confirmation modal
        setConfirmModalConfig((prev) => ({ ...prev, visible: false, loading: false }));
        // 4. Instantly show success confirmation modal
        setSuccessModalConfig({
          visible: true,
          title: serverState ? '2FA Protection Enabled' : '2FA Protection Disabled',
          message: serverState
            ? 'Two-Factor Authentication is now active. A 6-digit OTP security code will be sent to your email whenever you log in.'
            : 'Two-Factor Authentication has been turned off. Your account will no longer require an OTP code on sign-in.',
          buttonText: 'Got It',
          onButtonPress: () => setSuccessModalConfig((prev) => ({ ...prev, visible: false })),
        });
        // 5. Refresh user session asynchronously in background
        refreshUser().catch(() => {});
      } else {
        setConfirmModalConfig((prev) => ({ ...prev, visible: false, loading: false }));
        Alert.alert('Notice', res.message || 'Could not update 2FA setting on server.');
      }
    } catch (err: any) {
      setConfirmModalConfig((prev) => ({ ...prev, visible: false, loading: false }));
      Alert.alert('Error', err.message || 'Failed to update 2FA setting.');
    }
  };

  const handleToggle2FA = (nextVal: boolean) => {
    setConfirmModalConfig({
      visible: true,
      title: nextVal ? 'Enable Two-Factor (2FA)?' : 'Disable Two-Factor (2FA)?',
      message: nextVal
        ? 'Every time you log in, a 6-digit OTP verification code will be sent to your registered email address to secure your account.'
        : 'Your account will no longer require an OTP code on login. This reduces account security against unauthorized access.',
      highlightText: nextVal
        ? '🛡️ Recommended for highest account security'
        : '⚠️ Account will be protected by password only',
      confirmText: nextVal ? 'Enable 2FA' : 'Disable 2FA',
      cancelText: 'Cancel',
      type: nextVal ? 'primary' : 'danger',
      loading: false,
      icon: nextVal ? (
        <ShieldCheck size={28} color="#1764E8" strokeWidth={2.4} />
      ) : (
        <AlertTriangle size={28} color="#DC2626" strokeWidth={2.4} />
      ),
      iconBgColor: nextVal ? '#EFF6FF' : '#FEF2F2',
      onConfirm: async () => {
        await executeToggle2FA(nextVal);
      },
    });
  };

  const userHasPassword = Boolean(
    (user as any)?.has_password !== false &&
    (user as any)?.hasPassword !== false &&
    ((user as any)?.auth_provider !== 'google' || (user as any)?.has_password === true)
  );

  const handleChangePassword = async () => {
    setPasswordError(null);

    if (userHasPassword && !currentPassword) {
      setPasswordError('Please enter your current password.');
      return;
    }
    if (!newPassword || !confirmPassword) {
      setPasswordError('Please fill out both new password fields.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError('New password and confirm password do not match.');
      return;
    }
    if (newPassword.length < 6) {
      setPasswordError('New password must be at least 6 characters.');
      return;
    }

    setPasswordLoading(true);
    try {
      const res = await authApi.changePassword({
        currentPassword: userHasPassword ? currentPassword : '',
        newPassword,
      });

      if (res.success) {
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
        await refreshUser().catch(() => {});
        setSuccessModalConfig({
          visible: true,
          title: userHasPassword ? 'Password Updated' : 'Password Created',
          message: userHasPassword
            ? 'Your account password has been changed successfully.'
            : 'Your account password has been set successfully. You can now use it to log in with your email.',
          buttonText: 'Done',
          onButtonPress: () => setSuccessModalConfig((prev) => ({ ...prev, visible: false })),
        });
      } else {
        setPasswordError(res.message || 'Failed to update password. Please check your current password.');
      }
    } catch (err: any) {
      setPasswordError(err.message || 'Network error occurred while updating password.');
    } finally {
      setPasswordLoading(false);
    }
  };

  const handleResetWithOtp = async () => {
    setOtpError(null);

    if (!otpCode || !otpNewPass || !otpConfirmPass) {
      setOtpError('Please fill in all OTP and password fields.');
      return;
    }
    if (otpNewPass !== otpConfirmPass) {
      setOtpError('New password and confirm password do not match.');
      return;
    }
    if (otpNewPass.length < 6) {
      setOtpError('Password must be at least 6 characters.');
      return;
    }

    setOtpLoading(true);
    try {
      const res = await authApi.resetPassword({
        email: resetEmail,
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
          title: 'Password Reset Successful',
          message: 'Your password has been reset with OTP. You can now use your new credentials.',
          buttonText: 'Done',
          onButtonPress: () => setSuccessModalConfig((prev) => ({ ...prev, visible: false })),
        });
      } else {
        setOtpError(res.message || 'Invalid verification code or expired session.');
      }
    } catch (err: any) {
      setOtpError(err.message || 'Failed to verify OTP code.');
    } finally {
      setOtpLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <FocusAwareStatusBar barStyle="dark-content" backgroundColor="#FFFFFF" translucent={false} />

      <Header
        title="Security & Sessions"
        showBack={true}
        onBack={() => navigation.goBack()}
        hideRightActions={true}
        hideBell={true}
        hideMenu={true}
      />

      <KeyboardAwareScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: Math.max(insets.bottom + 80, 110) },
        ]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* CARD 1: SET OR CHANGE PASSWORD */}
        <View style={styles.sectionCard}>
          <View style={styles.cardHeaderRow}>
            <View style={styles.cardHeaderCol}>
              <Text style={styles.cardTitle}>{userHasPassword ? 'Change Password' : 'Set Password'}</Text>
              <Text style={styles.cardSubtitle}>
                {userHasPassword
                  ? 'Update your account password for secure access.'
                  : 'You signed in with Google. Set a password to also log in using your email and password.'}
              </Text>
            </View>
            <View style={styles.cardHeaderIconBox}>
              <KeyRound size={18} color="#1764E8" />
            </View>
          </View>

          {passwordError ? (
            <ErrorBanner message={passwordError} style={{ marginBottom: 12 }} />
          ) : null}

          {/* Current Password Field - Only for users with existing password */}
          {userHasPassword && (
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
                    <EyeOff size={16} color="#64748B" />
                  ) : (
                    <Eye size={16} color="#64748B" />
                  )}
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* New Password Field */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>{userHasPassword ? 'New Password' : 'Create Password'}</Text>
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
                  <EyeOff size={16} color="#64748B" />
                ) : (
                  <Eye size={16} color="#64748B" />
                )}
              </TouchableOpacity>
            </View>
          </View>

          {/* Confirm New Password Field */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Confirm {userHasPassword ? 'New ' : ''}Password</Text>
            <View style={styles.inputBox}>
              <TextInput
                style={styles.inputField}
                placeholder="Re-enter password"
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
                  <EyeOff size={16} color="#64748B" />
                ) : (
                  <Eye size={16} color="#64748B" />
                )}
              </TouchableOpacity>
            </View>
          </View>

          <TouchableOpacity
            style={styles.primarySaveBtn}
            activeOpacity={0.8}
            onPress={handleChangePassword}
            disabled={passwordLoading}
          >
            {passwordLoading ? (
              <ActivityIndicator color="#FFFFFF" size="small" />
            ) : (
              <Text style={styles.primarySaveBtnText}>
                {userHasPassword ? 'Update Password' : 'Set Password'}
              </Text>
            )}
          </TouchableOpacity>

          {userHasPassword && (
            <>
              <View style={styles.cardInnerDivider} />

              {/* Forgot Password Alternative Option */}
              <View style={styles.forgotSection}>
                <Text style={styles.forgotTitle}>Trouble remembering current password?</Text>
                <Text style={styles.forgotSubtitle}>
                  Request a 6-digit OTP verification code sent directly to your email address.
                </Text>

                <TouchableOpacity
                  style={styles.outlineResetBtn}
                  activeOpacity={0.8}
                  onPress={handleOpenResetConfirm}
                >
                  <Send size={14} color="#102A5C" />
                  <Text style={styles.outlineResetBtnText}>Reset via Email OTP</Text>
                </TouchableOpacity>
              </View>
            </>
          )}
        </View>

        {/* CARD 2: TWO FACTOR AUTHENTICATION */}
        <View style={styles.sectionCard}>
          <View style={styles.cardHeaderRow}>
            <View style={styles.cardHeaderCol}>
              <Text style={styles.cardTitle}>Two-Factor Authentication (2FA)</Text>
              <Text style={styles.cardSubtitle}>
                Add an extra layer of security requiring an OTP verification code on sign in.
              </Text>
            </View>
            <View style={styles.cardHeaderIconBox}>
              <ShieldCheck size={18} color="#1764E8" />
            </View>
          </View>

          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => handleToggle2FA(!twoFactorEnabled)}
            style={styles.twoFactorRow}
          >
            <View style={{ flex: 1 }}>
              <Text style={styles.twoFactorStatusText}>
                {twoFactorEnabled ? '2FA Protection Enabled' : '2FA Protection Disabled'}
              </Text>
              <Text style={styles.twoFactorStatusSub}>
                {twoFactorEnabled
                  ? 'Verification codes are sent to your registered email upon login.'
                  : 'Enable this setting to secure your account against unauthorized access.'}
              </Text>
            </View>
            <View pointerEvents="none">
              <Switch
                value={twoFactorEnabled}
                trackColor={{ false: '#CBD5E1', true: '#BFDBFE' }}
                thumbColor={twoFactorEnabled ? '#1764E8' : '#F8FAFC'}
              />
            </View>
          </TouchableOpacity>
        </View>

        {/* CARD 3: ACTIVE DEVICE SESSIONS */}
        <View style={styles.sectionCard}>
          <View style={styles.cardHeaderRow}>
            <View style={styles.cardHeaderCol}>
              <Text style={styles.cardTitle}>Active Device Sessions</Text>
              <Text style={styles.cardSubtitle}>
                Review and manage devices logged into your account.
              </Text>
            </View>
            <View style={styles.cardHeaderIconBox}>
              <Smartphone size={18} color="#1764E8" />
            </View>
          </View>

          {sessionsLoading ? (
            <View style={styles.sessionLoadingBox}>
              <ActivityIndicator color="#1764E8" size="small" />
              <Text style={styles.sessionLoadingText}>Checking live device connections...</Text>
            </View>
          ) : sessions.length === 0 ? (
            <View style={styles.sessionPillItem}>
              <View style={[styles.sessionIconWrapper, { backgroundColor: '#EEF4FF' }]}>
                <Smartphone size={14} color="#1764E8" />
              </View>
              <View style={styles.sessionInfoCol}>
                <Text style={styles.sessionDeviceName}>Current Mobile Device</Text>
                <Text style={styles.sessionMetaText}>Active Session • Verified</Text>
              </View>
              <View style={styles.thisDeviceBadge}>
                <Text style={styles.thisDeviceBadgeText}>Current</Text>
              </View>
            </View>
          ) : (
            <View style={styles.sessionsListContainer}>
              {sessions.map((session, index) => {
                const isCurrent = session.isCurrent || session.is_current;
                const isDesktop = session.deviceType === 'desktop' || session.device_type === 'desktop' || (session.browser && !session.os);
                const IconComponent = isDesktop ? Laptop : Smartphone;
                const deviceLabel = session.deviceName || session.device_name || session.browser || (isDesktop ? 'Desktop Web' : 'Mobile App');
                const locationLabel = session.location || session.ipAddress || session.ip || 'Active Session';

                return (
                  <View key={session.id || index} style={styles.sessionPillItem}>
                    <View style={[styles.sessionIconWrapper, { backgroundColor: isCurrent ? '#EEF4FF' : '#F1F5F9' }]}>
                      <IconComponent size={14} color={isCurrent ? '#1764E8' : '#64748B'} />
                    </View>
                    <View style={styles.sessionInfoCol}>
                      <Text style={styles.sessionDeviceName} numberOfLines={1}>
                        {deviceLabel}
                      </Text>
                      <Text style={styles.sessionMetaText} numberOfLines={1}>
                        {locationLabel}
                      </Text>
                    </View>
                    {isCurrent ? (
                      <View style={styles.thisDeviceBadge}>
                        <Text style={styles.thisDeviceBadgeText}>Current</Text>
                      </View>
                    ) : (
                      <TouchableOpacity
                        style={styles.revokeSessionBtn}
                        activeOpacity={0.7}
                        onPress={() => handleRevokeSession(session.id, deviceLabel)}
                      >
                        <Text style={styles.revokeSessionBtnText}>Logout</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                );
              })}
            </View>
          )}

          {sessions.filter((s) => !s.isCurrent && !s.is_current).length > 0 ? (
            <TouchableOpacity
              style={styles.logoutOthersBtnRow}
              activeOpacity={0.7}
              onPress={handleTerminateOtherSessions}
              disabled={isTerminatingOtherSessions}
            >
              {isTerminatingOtherSessions ? (
                <ActivityIndicator size="small" color="#DC2626" />
              ) : (
                <>
                  <LogOut size={13} color="#DC2626" />
                  <Text style={styles.logoutOthersBtnText}>Log Out from All Other Devices</Text>
                </>
              )}
            </TouchableOpacity>
          ) : null}
        </View>
      </KeyboardAwareScrollView>

      {/* Password Modals Component */}
      <SecurityPasswordModals
        isChangePassModalOpen={false}
        setIsChangePassModalOpen={() => {}}
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

      {/* Reusable Confirmation Modal */}
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
        loading={confirmModalConfig.loading}
        onConfirm={confirmModalConfig.onConfirm}
        onClose={() => setConfirmModalConfig((prev) => ({ ...prev, visible: false, loading: false }))}
      />

      {/* Reusable Success Modal */}
      <SuccessModal
        visible={successModalConfig.visible}
        onClose={() => setSuccessModalConfig((prev) => ({ ...prev, visible: false }))}
        title={successModalConfig.title}
        message={successModalConfig.message}
        buttonText={successModalConfig.buttonText}
        onButtonPress={successModalConfig.onButtonPress || (() => setSuccessModalConfig((prev) => ({ ...prev, visible: false })))}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F9FC',
  },
  scrollContent: {
    paddingHorizontal: 14,
    paddingTop: 12,
    gap: 15,
  },
  sectionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: RADIUS.card,
    borderWidth: 1,
    borderColor: '#E7EBF2',
    padding: 14,
    shadowColor: '#142A50',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  cardHeaderCol: {
    flex: 1,
    paddingRight: 8,
  },
  cardTitle: {
    fontSize: 13.5,
    fontWeight: '700',
    color: '#102A5C',
    letterSpacing: -0.1,
    marginBottom: 2,
  },
  cardSubtitle: {
    fontSize: 11,
    color: '#657796',
    fontWeight: '500',
    lineHeight: 15,
  },
  cardHeaderIconBox: {
    paddingTop: 2,
  },
  inputGroup: {
    marginBottom: 10,
  },
  inputLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#657796',
    marginBottom: 5,
  },
  inputBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 6,
    height: 40,
    paddingHorizontal: 12,
  },
  inputField: {
    flex: 1,
    fontSize: 12.5,
    color: '#102A5C',
    fontWeight: '500',
    paddingVertical: 0,
  },
  primarySaveBtn: {
    backgroundColor: '#1764E8',
    height: 40,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
    marginBottom: 2,
  },
  primarySaveBtnText: {
    color: '#FFFFFF',
    fontSize: 12.5,
    fontWeight: '700',
  },
  cardInnerDivider: {
    height: 1,
    backgroundColor: '#E7EBF2',
    marginTop: 14,
    marginBottom: 12,
  },
  forgotSection: {
    marginTop: 4,
    gap: 2,
  },
  forgotTitle: {
    fontSize: 13.5,
    fontWeight: '700',
    color: '#102A5C',
    letterSpacing: -0.1,
    marginBottom: 2,
  },
  forgotSubtitle: {
    fontSize: 11,
    color: '#657796',
    fontWeight: '500',
    lineHeight: 15,
    marginBottom: 8,
  },
  outlineResetBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 38,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    backgroundColor: '#F8FAFC',
    gap: 6,
  },
  outlineResetBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#102A5C',
  },
  twoFactorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 4,
    gap: 10,
  },
  twoFactorStatusText: {
    fontSize: 12.5,
    fontWeight: '600',
    color: '#102A5C',
    marginBottom: 2,
  },
  twoFactorStatusSub: {
    fontSize: 10.5,
    color: '#657796',
    lineHeight: 14,
  },
  sessionLoadingBox: {
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  sessionLoadingText: {
    fontSize: 11,
    color: '#657796',
  },
  sessionsListContainer: {
    gap: 6,
    marginBottom: 8,
  },
  sessionPillItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 8,
    gap: 8,
  },
  sessionIconWrapper: {
    width: 28,
    height: 28,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sessionInfoCol: {
    flex: 1,
  },
  sessionDeviceName: {
    fontSize: 12,
    fontWeight: '700',
    color: '#102A5C',
    marginBottom: 1,
  },
  sessionMetaText: {
    fontSize: 10.5,
    color: '#657796',
  },
  thisDeviceBadge: {
    backgroundColor: '#EEF4FF',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 4,
  },
  thisDeviceBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#1764E8',
  },
  revokeSessionBtn: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#FCA5A5',
    backgroundColor: '#FEF2F2',
  },
  revokeSessionBtnText: {
    fontSize: 10.5,
    fontWeight: '600',
    color: '#DC2626',
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
    fontSize: 11.5,
    fontWeight: '600',
    color: '#DC2626',
  },
});
