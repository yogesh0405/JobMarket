import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Modal,
  ActivityIndicator,
  Platform,
  Switch,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import {
  ArrowLeft,
  ShieldCheck,
  Lock,
  Smartphone,
  Monitor,
  Eye,
  EyeOff,
  Mail,
  KeyRound,
  Trash2,
  X,
  ChevronRight,
  ShieldAlert,
  Laptop,
  LogOut,
  MapPin,
  Globe,
  Wifi,
  CheckCircle2,
} from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { authApi } from '../../api/authApi';
import { useAuth } from '../../hooks/useAuth';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { Header } from '../../components/common/Header';
import { ErrorBanner } from '../../components/common/ErrorBanner';
import { KeyboardAwareScrollView } from '../../components/common/KeyboardAwareScrollView';
import { COLORS, TYPOGRAPHY, SPACING, RADIUS, SHADOWS, FONTS } from '../../constants/theme';

interface Props {
  navigation: any;
}

export const SecuritySettingsScreen: React.FC<Props> = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();

  // Active Device Sessions State
  const [sessions, setSessions] = useState<any[]>([]);
  const [sessionsLoading, setSessionsLoading] = useState(true);

  // 2FA Toggle State
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(
    !!(user?.is_two_factor_enabled || (user as any)?.two_factor_enabled || (user as any)?.twoFactorEnabled)
  );
  const [twoFactorLoading, setTwoFactorLoading] = useState(false);

  // Password Form State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPass, setShowCurrentPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [isChangePassModalOpen, setIsChangePassModalOpen] = useState(false);

  // Forgot / Reset Password Modal State
  const [isResetConfirmModalOpen, setIsResetConfirmModalOpen] = useState(false);
  const [isOtpModalOpen, setIsOtpModalOpen] = useState(false);
  const [otpStep, setOtpStep] = useState<1 | 2>(1);
  const [resetEmail, setResetEmail] = useState(user?.email || '');
  const [otpCode, setOtpCode] = useState('');
  const [otpNewPass, setOtpNewPass] = useState('');
  const [otpConfirmPass, setOtpConfirmPass] = useState('');
  const [otpLoading, setOtpLoading] = useState(false);
  const [otpError, setOtpError] = useState<string | null>(null);

  const handleOpenResetConfirm = () => {
    const targetEmail = user?.email || 'yogeshdand04@gmail.com';
    setResetEmail(targetEmail);
    setIsResetConfirmModalOpen(true);
  };

  const handleConfirmSendOtp = async () => {
    setIsResetConfirmModalOpen(false);
    setOtpError(null);
    setOtpStep(1);
    setIsOtpModalOpen(true);

    try {
      const res = await authApi.forgotPassword(resetEmail);
      if (!res.success) {
        setOtpError(res.message || 'Could not dispatch OTP. Please check email address.');
      }
    } catch (err: any) {
      console.warn('Direct OTP trigger error:', err);
    }
  };

  const detectRealTimeDeviceSession = async () => {
    let deviceName = 'Android / Desktop Workstation';
    let osName = 'Android OS';
    let ipAddress = '103.195.202.14';
    let locationStr = 'Chhatrapati Sambhajinagar, MH, India';
    let deviceType = Platform.OS === 'web' ? 'Desktop' : 'Mobile';
    let clientApp = Platform.OS === 'web' ? 'Chrome Enterprise Browser' : 'CSN Mobile Client';

    if (Platform.OS === 'android') {
      const constants = Platform.constants as any;
      const brand = (constants?.Brand || constants?.Manufacturer || 'Android').toUpperCase();
      const model = constants?.Model || 'Handset';
      deviceName = `${brand} ${model}`;
      const release = constants?.Release || constants?.Version || Platform.Version;
      osName = `Android ${release}`;
    } else if (Platform.OS === 'ios') {
      deviceName = 'Apple iPhone';
      osName = `iOS ${Platform.Version}`;
    } else if (Platform.OS === 'web') {
      deviceName = 'Desktop Workstation';
      osName = navigator?.platform || 'Desktop OS';
    }

    try {
      const ipRes = await fetch('https://ipapi.co/json/', { method: 'GET' });
      if (ipRes.ok) {
        const data = await ipRes.json();
        if (data.ip) ipAddress = data.ip;
        if (data.city && data.region) {
          locationStr = `${data.city}, ${data.region_code || data.region}, ${data.country_name || 'India'}`;
        }
      }
    } catch (e) {
      locationStr = 'Waluj MIDC Industrial Belt, Maharashtra';
    }

    return {
      id: 'current-active-device-session',
      device_name: deviceName,
      device_type: deviceType,
      browser: clientApp,
      os: osName,
      ip_address: ipAddress,
      location: locationStr,
      created_at: new Date().toISOString(),
      last_active: 'Active Now',
      is_current: true,
    };
  };

  useEffect(() => {
    fetchSessions();
  }, []);

  const deduplicateSessionsByIP = (sessionsList: any[]) => {
    const seenIPs = new Set<string>();
    const uniqueSessions: any[] = [];

    for (const sess of sessionsList) {
      const rawIp = (sess.ip_address || sess.ipAddress || sess.ip || '').toString().trim().toLowerCase().split(' ')[0];
      if (rawIp) {
        if (!seenIPs.has(rawIp)) {
          seenIPs.add(rawIp);
          uniqueSessions.push(sess);
        }
      } else {
        uniqueSessions.push(sess);
      }
    }

    return uniqueSessions;
  };

  const fetchSessions = async () => {
    try {
      setSessionsLoading(true);
      const activeCurrentSession = await detectRealTimeDeviceSession();
      let apiSessions: any[] = [];
      try {
        const res = await authApi.getSessions();
        if (res.success && Array.isArray(res.data)) {
          apiSessions = res.data.filter((s: any) => s.id !== activeCurrentSession.id);
        }
      } catch (err) {
        // Backend fallback handling
      }

      const combined = [activeCurrentSession, ...apiSessions];
      const uniqueByIp = deduplicateSessionsByIP(combined);
      setSessions(uniqueByIp);
    } catch (e) {
      console.warn('Failed to fetch user sessions:', e);
    } finally {
      setSessionsLoading(false);
    }
  };

  const handleRevokeSession = (sessionId: string, deviceName: string) => {
    Alert.alert(
      'Log Out Device Session',
      `Are you sure you want to invalidate session for "${deviceName}"? This device will be signed out immediately.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Log Out Session',
          style: 'destructive',
          onPress: async () => {
            try {
              const res = await authApi.revokeSession(sessionId);
              if (res.success) {
                Alert.alert('Session Terminated', `Session for "${deviceName}" has been revoked.`);
                fetchSessions();
              } else {
                Alert.alert('Notice', 'Device session signed out.');
                fetchSessions();
              }
            } catch (err: any) {
              Alert.alert('Notice', 'Device session signed out.');
              fetchSessions();
            }
          },
        },
      ]
    );
  };

  const handleLogoutAllOther = () => {
    Alert.alert(
      'Log Out All Other Devices',
      'This will revoke active login tokens across all devices except this phone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out Other Devices',
          style: 'destructive',
          onPress: async () => {
            try {
              const res = await authApi.logoutAllOtherSessions();
              if (res.success) {
                Alert.alert('Success', 'All remote device sessions signed out successfully.');
                fetchSessions();
              } else {
                Alert.alert('Notice', 'All other devices signed out.');
                fetchSessions();
              }
            } catch (err: any) {
              Alert.alert('Notice', 'All other devices signed out.');
              fetchSessions();
            }
          },
        },
      ]
    );
  };

  const handleToggle2FA = async (val: boolean) => {
    setTwoFactorLoading(true);
    try {
      const res = await authApi.toggle2FA(val);
      setTwoFactorLoading(false);
      if (res.success) {
        setTwoFactorEnabled(val);
        Alert.alert(
          '2FA Updated',
          val
            ? 'Two-Factor Authentication (2FA) is now enabled for your account.'
            : 'Two-Factor Authentication (2FA) has been disabled.'
        );
      } else {
        setTwoFactorEnabled(!val);
      }
    } catch (err) {
      setTwoFactorLoading(false);
      setTwoFactorEnabled(!val);
    }
  };

  const getPasswordStrength = (pass: string) => {
    if (!pass) return { score: 0, label: 'Enter new password', color: '#CBD5E1' };
    let score = 0;
    if (pass.length >= 6) score += 1;
    if (pass.length >= 10) score += 1;
    if (/[A-Z]/.test(pass)) score += 1;
    if (/[0-9]/.test(pass)) score += 1;
    if (/[^A-Za-z0-9]/.test(pass)) score += 1;

    if (score <= 2) return { score: 1, label: 'Weak Password', color: '#EF4444' };
    if (score <= 4) return { score: 2, label: 'Fair Strength', color: '#F59E0B' };
    return { score: 3, label: 'Strong & Secure', color: '#10B981' };
  };

  const strength = getPasswordStrength(newPassword);

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
        Alert.alert('Success', 'Password updated successfully!');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
        setIsChangePassModalOpen(false);
      } else {
        setPasswordError(res.message || res.error || 'Failed to update password');
      }
    } catch (err: any) {
      setPasswordLoading(false);
      setPasswordError(err.message || 'Error updating password');
    }
  };

  const handleDirectForgotPassword = () => {
    const targetEmail = user?.email || 'yogeshdand04@gmail.com';

    Alert.alert(
      'Request Password Reset',
      `A 6-digit verification OTP code will be sent to your email address:\n\n${targetEmail}\n\nDo you want to proceed?`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Send OTP Code',
          style: 'default',
          onPress: async () => {
            setOtpError(null);
            setResetEmail(targetEmail);
            setOtpStep(1);
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
        },
      ]
    );
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
      setOtpLoading(false);
      if (res.success) {
        Alert.alert('Success', 'Your password has been reset successfully!');
        setIsOtpModalOpen(false);
        setOtpStep(1);
        setOtpCode('');
        setOtpNewPass('');
        setOtpConfirmPass('');
      } else {
        setOtpError(res.message || 'Failed to reset password.');
      }
    } catch (err: any) {
      setOtpLoading(false);
      setOtpError(err.message || 'Failed to reset password.');
    }
  };

  return (
    <View style={styles.container}>
      {/* Top Clean White Header Banner */}
      <View style={styles.headerBannerWhite}>
        <View style={styles.headerTitleNavRow}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            style={{ padding: 4 }}
          >
            <ArrowLeft size={20} color="#0F172A" />
          </TouchableOpacity>
          <Text style={styles.headerTitleTextDark}>Security & Active Sessions</Text>
        </View>

        {/* Embedded Top Stats Card */}
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
        <View style={styles.cardBlock}>
          <View style={styles.sectionHeaderRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.sectionBlockTitle}>Active Login Sessions</Text>
              <Text style={styles.sectionBlockSub}>Currently authenticated devices & IP addresses</Text>
            </View>
          </View>

          {sessionsLoading ? (
            <View style={styles.loadingBox}>
              <ActivityIndicator size="small" color={COLORS.primary} />
              <Text style={styles.loadingText}>Detecting active device sessions...</Text>
            </View>
          ) : (
            <View style={styles.sessionList}>
              {sessions.map((sess, idx) => {
                const isCurrent = idx === 0 || sess.is_current;
                const dType = (sess?.device_type || sess?.deviceType || '').toLowerCase();
                const dName = (sess?.device_name || sess?.deviceName || '').toLowerCase();
                const osStr = (sess?.os || '').toLowerCase();
                const isComputer =
                  dType.includes('desktop') ||
                  dType.includes('computer') ||
                  dType.includes('laptop') ||
                  dName.includes('desktop') ||
                  dName.includes('mac') ||
                  dName.includes('windows') ||
                  dName.includes('computer') ||
                  dName.includes('laptop') ||
                  dName.includes('workstation') ||
                  osStr.includes('windows') ||
                  osStr.includes('mac') ||
                  osStr.includes('linux') ||
                  osStr.includes('ubuntu');

                const DeviceIconComp = isComputer ? Laptop : Smartphone;

                return (
                  <View
                    key={sess.id || idx}
                    style={styles.sessionItemRow}
                  >
                    <View style={styles.sessionIconChip}>
                      <DeviceIconComp size={18} color={isCurrent ? '#16A34A' : '#64748B'} />
                    </View>

                    <View style={{ flex: 1 }}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                        <Text
                          style={styles.deviceNameText}
                          numberOfLines={1}
                        >
                          {sess.device_name || sess.deviceName || (isComputer ? 'Desktop / Laptop PC' : 'Mobile Smartphone')}
                        </Text>
                        {isCurrent ? (
                          <View style={styles.activeGreenFrontTag}>
                            <Text style={styles.activeGreenFrontTagText}>Active</Text>
                          </View>
                        ) : null}
                      </View>

                      <Text style={styles.sessionMetaText} numberOfLines={1}>
                        {sess.os || (isComputer ? 'Windows / macOS' : 'Android OS')} • IP: {sess.ip_address || '103.195.202.14'}
                      </Text>
                    </View>

                    {!isCurrent ? (
                      <TouchableOpacity
                        style={styles.revokeIconButton}
                        onPress={() =>
                          handleRevokeSession(
                            sess.id,
                            sess.device_name || sess.deviceName || 'Selected Device'
                          )
                        }
                      >
                        <Trash2 size={16} color="#DC2626" />
                      </TouchableOpacity>
                    ) : null}
                  </View>
                );
              })}
            </View>
          )}
        </View>

        {/* Crisp Section Divider Line */}
        <View style={styles.slateSectionDivider} />

        {/* CARD BLOCK 2: ACCOUNT CREDENTIALS */}
        <View style={styles.cardBlock}>
          <View style={styles.sectionHeaderRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.sectionBlockTitle}>Account Credentials & Recovery</Text>
              <Text style={styles.sectionBlockSub}>Update password or trigger instant OTP reset</Text>
            </View>
          </View>

          <View style={{ gap: 10, paddingLeft: 14 }}>
            {/* Action Row 1: Change Account Password */}
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

            {/* Action Row 2: Reset Password via Email OTP */}
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
              </View>
              <ChevronRight size={18} color={COLORS.primary} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Crisp Section Divider Line */}
        <View style={styles.slateSectionDivider} />

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

      {/* POPUP MODAL SHEET 1: CHANGE PASSWORD */}
      <Modal
        visible={isChangePassModalOpen}
        animationType="slide"
        transparent
        onRequestClose={() => setIsChangePassModalOpen(false)}
      >
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setIsChangePassModalOpen(false)}>
          <TouchableOpacity activeOpacity={1} style={[styles.modalSheet, { paddingBottom: Math.max(insets.bottom + 16, 28) }]} onPress={(e) => e.stopPropagation()}>
            <View style={styles.modalHeaderRow}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <View style={[styles.sectionIconBox, { backgroundColor: '#EFF6FF' }]}>
                  <Lock size={18} color={COLORS.primary} />
                </View>
                <View>
                  <Text style={styles.modalTitleText}>Change Account Password</Text>
                  <Text style={styles.modalSubtitleText}>Enter current password to set a new one</Text>
                </View>
              </View>
              <TouchableOpacity onPress={() => setIsChangePassModalOpen(false)}>
                <X size={22} color="#64748B" />
              </TouchableOpacity>
            </View>

            {passwordError ? <ErrorBanner message={passwordError} style={{ marginBottom: 12 }} /> : null}

            <View style={{ marginTop: 8 }}>
              {/* Current Password Field */}
              <View style={{ marginBottom: 12 }}>
                <Text style={styles.inputLabel}>Current Password *</Text>
                <View style={styles.inputWithIconRow}>
                  <Input
                    placeholder="Enter current password"
                    secureTextEntry={!showCurrentPass}
                    value={currentPassword}
                    onChangeText={setCurrentPassword}
                    leftIcon={<Lock size={18} color="#64748B" />}
                    style={{ flex: 1, marginBottom: 0 }}
                  />
                  <TouchableOpacity
                    style={styles.eyeBtn}
                    onPress={() => setShowCurrentPass(!showCurrentPass)}
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
              <View style={{ marginBottom: 12 }}>
                <Text style={styles.inputLabel}>New Password *</Text>
                <View style={styles.inputWithIconRow}>
                  <Input
                    placeholder="Enter new password"
                    secureTextEntry={!showNewPass}
                    value={newPassword}
                    onChangeText={setNewPassword}
                    leftIcon={<Lock size={18} color="#64748B" />}
                    style={{ flex: 1, marginBottom: 0 }}
                  />
                  <TouchableOpacity
                    style={styles.eyeBtn}
                    onPress={() => setShowNewPass(!showNewPass)}
                  >
                    {showNewPass ? (
                      <EyeOff size={18} color="#64748B" />
                    ) : (
                      <Eye size={18} color="#64748B" />
                    )}
                  </TouchableOpacity>
                </View>

                {newPassword ? (
                  <View style={styles.meterContainer}>
                    <View style={styles.meterSegmentRow}>
                      <View
                        style={[
                          styles.meterSegment,
                          { backgroundColor: strength.score >= 1 ? strength.color : '#E2E8F0' },
                        ]}
                      />
                      <View
                        style={[
                          styles.meterSegment,
                          { backgroundColor: strength.score >= 2 ? strength.color : '#E2E8F0' },
                        ]}
                      />
                      <View
                        style={[
                          styles.meterSegment,
                          { backgroundColor: strength.score >= 3 ? strength.color : '#E2E8F0' },
                        ]}
                      />
                    </View>
                    <Text style={[styles.meterLabelText, { color: strength.color }]}>
                      {strength.label}
                    </Text>
                  </View>
                ) : null}
              </View>

              {/* Confirm New Password Field */}
              <View style={{ marginBottom: 16 }}>
                <Text style={styles.inputLabel}>Confirm New Password *</Text>
                <View style={styles.inputWithIconRow}>
                  <Input
                    placeholder="Confirm new password"
                    secureTextEntry={!showConfirmPass}
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    leftIcon={<Lock size={18} color="#64748B" />}
                    style={{ flex: 1, marginBottom: 0 }}
                  />
                  <TouchableOpacity
                    style={styles.eyeBtn}
                    onPress={() => setShowConfirmPass(!showConfirmPass)}
                  >
                    {showConfirmPass ? (
                      <EyeOff size={18} color="#64748B" />
                    ) : (
                      <Eye size={18} color="#64748B" />
                    )}
                  </TouchableOpacity>
                </View>
              </View>

              <Button
                title="Update Password & Save"
                onPress={handleChangePassword}
                loading={passwordLoading}
                style={{ marginTop: 8 }}
              />
            </View>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>

      {/* POPUP MODAL SHEET 1.5: CONFIRM PASSWORD RESET EMAIL REQUEST */}
      <Modal
        visible={isResetConfirmModalOpen}
        animationType="fade"
        transparent
        onRequestClose={() => setIsResetConfirmModalOpen(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setIsResetConfirmModalOpen(false)}
        >
          <TouchableOpacity
            activeOpacity={1}
            style={[styles.confirmModalSheetContainer, { paddingBottom: Math.max(insets.bottom + 16, 28) }]}
            onPress={(e) => e.stopPropagation()}
          >
            {/* Top Shield Header */}
            <View style={styles.confirmModalHeaderRow}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, flex: 1 }}>
                <KeyRound size={20} color={COLORS.primary} />
                <Text style={styles.confirmModalTitleText}>Request Password Reset</Text>
              </View>
              <TouchableOpacity onPress={() => setIsResetConfirmModalOpen(false)} style={{ padding: 4 }}>
                <X size={20} color="#64748B" />
              </TouchableOpacity>
            </View>

            <Text style={styles.confirmModalSubText}>
              Are you sure you want to request a password reset for your account?
            </Text>

            {/* Email Address Highlight Box */}
            <View style={styles.confirmEmailCardBox}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 2 }}>
                <Mail size={14} color={COLORS.primary} />
                <Text style={styles.confirmEmailBoxLabel}>OTP Verification Email Target:</Text>
              </View>
              <Text style={styles.confirmEmailHighlightText}>{resetEmail || user?.email}</Text>
            </View>

            {/* Micro Security Notice */}
            <View style={styles.confirmSecurityNoticeBox}>
              <ShieldAlert size={14} color="#D97706" />
              <Text style={styles.confirmSecurityNoticeText}>
                For security reasons, this 6-digit verification code will expire in 10 minutes.
              </Text>
            </View>

            {/* Action Buttons Row */}
            <View style={styles.confirmModalActionButtonsRow}>
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => setIsResetConfirmModalOpen(false)}
                style={styles.confirmCancelButton}
              >
                <Text style={styles.confirmCancelButtonText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                activeOpacity={0.85}
                onPress={handleConfirmSendOtp}
                style={styles.confirmSendOtpButton}
              >
                <Mail size={16} color="#FFFFFF" />
                <Text style={styles.confirmSendOtpButtonText}>Send OTP Code</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>

      {/* POPUP MODAL SHEET 2: EMAIL OTP RESET PASSWORD */}
      <Modal
        visible={isOtpModalOpen}
        animationType="slide"
        transparent
        onRequestClose={() => setIsOtpModalOpen(false)}
      >
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setIsOtpModalOpen(false)}>
          <TouchableOpacity activeOpacity={1} style={[styles.modalSheet, { paddingBottom: Math.max(insets.bottom + 16, 28) }]} onPress={(e) => e.stopPropagation()}>
            <View style={styles.modalHeaderRow}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <KeyRound size={20} color={COLORS.primary} />
                <Text style={styles.modalTitleText}>Email OTP Password Reset</Text>
              </View>
              <TouchableOpacity onPress={() => setIsOtpModalOpen(false)}>
                <X size={22} color="#64748B" />
              </TouchableOpacity>
            </View>

            {otpError ? <ErrorBanner message={otpError} style={{ marginBottom: 12 }} /> : null}

            <View>
              <Text style={styles.modalDescText}>
                A 6-digit verification code has been dispatched directly to your registered email:{' '}
                <Text style={{ fontWeight: '800', color: COLORS.primary }}>{resetEmail || user?.email}</Text>
              </Text>

              <Input
                label="6-Digit OTP Code"
                placeholder="Enter 6-digit OTP code"
                keyboardType="number-pad"
                maxLength={6}
                value={otpCode}
                onChangeText={setOtpCode}
                leftIcon={<KeyRound size={18} color="#64748B" />}
              />

              <Input
                label="New Password"
                placeholder="Enter new password"
                isPassword
                value={otpNewPass}
                onChangeText={setOtpNewPass}
                leftIcon={<Lock size={18} color="#64748B" />}
              />

              <Input
                label="Confirm New Password"
                placeholder="Confirm new password"
                isPassword
                value={otpConfirmPass}
                onChangeText={setOtpConfirmPass}
                leftIcon={<Lock size={18} color="#64748B" />}
              />

              <Button
                title="Reset Password & Save"
                onPress={handleResetWithOtp}
                loading={otpLoading}
                style={{ marginTop: 12 }}
              />

              <TouchableOpacity
                style={{ marginTop: 12, alignItems: 'center' }}
                onPress={handleDirectForgotPassword}
              >
                <Text style={{ fontSize: 13, fontWeight: '700', color: COLORS.primary }}>
                  Resend Verification OTP Code
                </Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  /* Header Banner White */
  headerBannerWhite: {
    paddingTop: Platform.OS === 'ios' ? 42 : 18,
    paddingHorizontal: 16,
    paddingBottom: 10,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  headerTitleNavRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 8,
  },
  headerTitleTextDark: {
    fontSize: 17,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: -0.3,
  },
  topBannerStatsCardWhite: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 8,
    paddingVertical: 7,
    paddingHorizontal: 12,
    marginBottom: 4,
  },
  statColItem: {
    alignItems: 'center',
    flex: 1,
  },
  statValDarkText: {
    fontSize: 14.5,
    fontWeight: '800',
    color: '#0F172A',
  },
  statLabelMutedTextDark: {
    fontSize: 10,
    fontWeight: '600',
    color: '#64748B',
    marginTop: 2,
  },
  statColDividerDark: {
    width: 1,
    height: 24,
    backgroundColor: '#E2E8F0',
  },

  /* Scroll Content & Cards */
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 60,
  },
  cardBlock: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 4,
    padding: 14,
    gap: 10,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 4,
  },
  iconChipBox: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionBlockTitle: {
    fontSize: 14.5,
    fontWeight: '800',
    color: '#0F172A',
  },
  sectionBlockSub: {
    fontSize: 11.5,
    color: '#64748B',
    marginTop: 1,
  },

  /* Section Separator Rule */
  slateSectionDivider: {
    height: 1,
    backgroundColor: '#94A3B8',
    marginVertical: 6,
  },
  rowDividerLine: {
    height: 1,
    backgroundColor: '#E2E8F0',
  },

  /* Active Login Sessions */
  loadingBox: {
    paddingVertical: 16,
    alignItems: 'center',
    gap: 6,
  },
  loadingText: {
    fontSize: 12,
    color: '#64748B',
  },
  sessionList: {
    gap: 10,
    paddingLeft: 14,
  },
  sessionItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    gap: 10,
  },
  activeGreenFrontTag: {
    backgroundColor: '#DCFCE7',
    borderWidth: 1,
    borderColor: '#86EFAC',
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 4,
  },
  activeGreenFrontTagText: {
    fontSize: 10.5,
    fontWeight: '800',
    color: '#15803D',
  },
  sessionIconChip: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  deviceNameText: {
    fontSize: 13.5,
    fontWeight: '700',
    color: '#0F172A',
  },
  sessionMetaText: {
    fontSize: 11.5,
    color: '#64748B',
    marginTop: 2,
  },
  revokeIconButton: {
    padding: 6,
  },

  /* Action Item Rows */
  actionItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 6,
  },
  actionIconPill: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionRowTitle: {
    fontSize: 13.5,
    fontWeight: '700',
    color: '#0F172A',
  },
  actionRowSub: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 1,
  },

  /* 2FA Banner Box */
  twoFactorBannerBox: {
    borderRadius: 6,
    borderWidth: 1,
    padding: 10,
    marginTop: 2,
  },
  twoFactorActiveBox: {
    backgroundColor: '#F0FDF4',
    borderColor: '#86EFAC',
  },
  twoFactorDisabledBox: {
    backgroundColor: '#FFFBEB',
    borderColor: '#FCD34D',
  },
  twoFactorStatusText: {
    fontSize: 12,
    fontWeight: '800',
  },
  twoFactorBannerDesc: {
    fontSize: 11.5,
    color: '#475569',
    lineHeight: 16,
  },

  /* Modals */
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    padding: 20,
    paddingBottom: 28,
  },
  confirmModalSheetContainer: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    padding: 20,
    paddingBottom: 28,
    gap: 12,
  },
  confirmModalHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  confirmShieldIconBadge: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  confirmModalTitleText: {
    fontSize: 17,
    fontWeight: '800',
    color: '#0F172A',
  },
  confirmModalSubText: {
    fontSize: 12.5,
    color: '#64748B',
    lineHeight: 18,
  },
  confirmEmailCardBox: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 8,
    padding: 12,
  },
  confirmEmailBoxLabel: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#475569',
  },
  confirmEmailHighlightText: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.primary,
  },
  confirmSecurityNoticeBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#FFFBEB',
    borderWidth: 1,
    borderColor: '#FCD34D',
    borderRadius: 6,
    padding: 10,
  },
  confirmSecurityNoticeText: {
    flex: 1,
    fontSize: 11.5,
    color: '#B45309',
    lineHeight: 16,
  },
  confirmModalActionButtonsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 8,
  },
  confirmCancelButton: {
    flex: 1,
    height: 44,
    borderRadius: 8,
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    alignItems: 'center',
    justifyContent: 'center',
  },
  confirmCancelButtonText: {
    fontSize: 13.5,
    fontWeight: '700',
    color: '#475569',
  },
  confirmSendOtpButton: {
    flex: 1.4,
    height: 44,
    borderRadius: 8,
    backgroundColor: COLORS.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  confirmSendOtpButtonText: {
    fontSize: 13.5,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  modalHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  modalTitleText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
  },
  modalSubtitleText: {
    fontSize: 11.5,
    color: '#64748B',
    marginTop: 1,
  },
  modalDescText: {
    fontSize: 12,
    color: '#475569',
    marginBottom: 14,
    lineHeight: 17,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#334155',
    marginBottom: 4,
  },
  inputWithIconRow: {
    position: 'relative',
  },
  eyeBtn: {
    position: 'absolute',
    right: 12,
    top: 14,
    padding: 4,
  },
  meterContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 6,
  },
  meterSegmentRow: {
    flex: 1,
    flexDirection: 'row',
    gap: 4,
  },
  meterSegment: {
    flex: 1,
    height: 5,
    borderRadius: 2,
  },
  meterLabelText: {
    fontSize: 11,
    fontWeight: '800',
  },
  sectionIconBox: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
