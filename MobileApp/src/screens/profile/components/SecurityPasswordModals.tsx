import React, { useState } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  ScrollView,
  Platform,
} from 'react-native';
import { Lock, Eye, EyeOff, X, KeyRound, Mail } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Input } from '../../../components/common/Input';
import { Button } from '../../../components/common/Button';
import { ErrorBanner } from '../../../components/common/ErrorBanner';
import { COLORS } from '../../../constants/theme';

interface SecurityPasswordModalsProps {
  isChangePassModalOpen: boolean;
  setIsChangePassModalOpen: (val: boolean) => void;
  currentPassword: string;
  setCurrentPassword: (val: string) => void;
  newPassword: string;
  setNewPassword: (val: string) => void;
  confirmPassword: string;
  setConfirmPassword: (val: string) => void;
  showCurrentPass: boolean;
  setShowCurrentPass: (val: boolean) => void;
  showNewPass: boolean;
  setShowNewPass: (val: boolean) => void;
  showConfirmPass: boolean;
  setShowConfirmPass: (val: boolean) => void;
  passwordLoading: boolean;
  passwordError: string | null;
  onChangePassword: () => void;

  isOtpModalOpen: boolean;
  setIsOtpModalOpen: (val: boolean) => void;
  resetEmail: string;
  otpCode: string;
  setOtpCode: (val: string) => void;
  otpNewPass: string;
  setOtpNewPass: (val: string) => void;
  otpConfirmPass: string;
  setOtpConfirmPass: (val: string) => void;
  otpLoading: boolean;
  otpError: string | null;
  onResetWithOtp: () => void;
}

export const SecurityPasswordModals: React.FC<SecurityPasswordModalsProps> = ({
  isChangePassModalOpen,
  setIsChangePassModalOpen,
  currentPassword,
  setCurrentPassword,
  newPassword,
  setNewPassword,
  confirmPassword,
  setConfirmPassword,
  showCurrentPass,
  setShowCurrentPass,
  showNewPass,
  setShowNewPass,
  showConfirmPass,
  setShowConfirmPass,
  passwordLoading,
  passwordError,
  onChangePassword,
  isOtpModalOpen,
  setIsOtpModalOpen,
  resetEmail,
  otpCode,
  setOtpCode,
  otpNewPass,
  setOtpNewPass,
  otpConfirmPass,
  setOtpConfirmPass,
  otpLoading,
  otpError,
  onResetWithOtp,
}) => {
  const insets = useSafeAreaInsets();
  const [showOtpNewPass, setShowOtpNewPass] = useState(false);
  const [showOtpConfirmPass, setShowOtpConfirmPass] = useState(false);

  return (
    <>
      {/* CHANGE PASSWORD MODAL */}
      <Modal
        visible={isChangePassModalOpen}
        animationType="slide"
        transparent
        onRequestClose={() => setIsChangePassModalOpen(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardAvoidingContainer}
        >
          <TouchableOpacity
            style={styles.modalOverlay}
            activeOpacity={1}
            onPress={() => setIsChangePassModalOpen(false)}
          >
            <TouchableOpacity
              activeOpacity={1}
              style={[
                styles.modalSheet,
                { paddingBottom: Math.max(insets.bottom + 16, 24) },
              ]}
              onPress={(e) => e.stopPropagation()}
            >
              <ScrollView
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
                bounces={false}
                contentContainerStyle={{ paddingBottom: 8 }}
              >
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
                  <TouchableOpacity
                    onPress={() => setIsChangePassModalOpen(false)}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  >
                    <X size={22} color="#64748B" />
                  </TouchableOpacity>
                </View>

                {passwordError ? <ErrorBanner message={passwordError} style={{ marginBottom: 12 }} /> : null}

                <View style={{ marginTop: 4, gap: 10 }}>
                  <View style={styles.inputWithIconRow}>
                    <Input
                      label="Current Password *"
                      placeholder="Enter current password"
                      secureTextEntry={!showCurrentPass}
                      value={currentPassword}
                      onChangeText={setCurrentPassword}
                      leftIcon={<Lock size={18} color="#64748B" />}
                      style={{ flex: 1 }}
                    />
                    <TouchableOpacity style={styles.eyeBtn} onPress={() => setShowCurrentPass(!showCurrentPass)}>
                      {showCurrentPass ? <EyeOff size={18} color="#64748B" /> : <Eye size={18} color="#64748B" />}
                    </TouchableOpacity>
                  </View>

                  <View style={styles.inputWithIconRow}>
                    <Input
                      label="New Password *"
                      placeholder="Enter new password"
                      secureTextEntry={!showNewPass}
                      value={newPassword}
                      onChangeText={setNewPassword}
                      leftIcon={<Lock size={18} color="#64748B" />}
                      style={{ flex: 1 }}
                    />
                    <TouchableOpacity style={styles.eyeBtn} onPress={() => setShowNewPass(!showNewPass)}>
                      {showNewPass ? <EyeOff size={18} color="#64748B" /> : <Eye size={18} color="#64748B" />}
                    </TouchableOpacity>
                  </View>

                  <View style={styles.inputWithIconRow}>
                    <Input
                      label="Confirm New Password *"
                      placeholder="Re-enter new password"
                      secureTextEntry={!showConfirmPass}
                      value={confirmPassword}
                      onChangeText={setConfirmPassword}
                      leftIcon={<Lock size={18} color="#64748B" />}
                      style={{ flex: 1 }}
                    />
                    <TouchableOpacity style={styles.eyeBtn} onPress={() => setShowConfirmPass(!showConfirmPass)}>
                      {showConfirmPass ? <EyeOff size={18} color="#64748B" /> : <Eye size={18} color="#64748B" />}
                    </TouchableOpacity>
                  </View>

                  <Button
                    title="Update Password"
                    onPress={onChangePassword}
                    loading={passwordLoading}
                    style={{ marginTop: 10, height: 46, borderRadius: 8 }}
                  />
                </View>
              </ScrollView>
            </TouchableOpacity>
          </TouchableOpacity>
        </KeyboardAvoidingView>
      </Modal>

      {/* OTP RESET PASSWORD MODAL */}
      <Modal
        visible={isOtpModalOpen}
        animationType="slide"
        transparent
        onRequestClose={() => setIsOtpModalOpen(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardAvoidingContainer}
        >
          <TouchableOpacity
            style={styles.modalOverlay}
            activeOpacity={1}
            onPress={() => setIsOtpModalOpen(false)}
          >
            <TouchableOpacity
              activeOpacity={1}
              style={[
                styles.modalSheet,
                { paddingBottom: Math.max(insets.bottom + 16, 24) },
              ]}
              onPress={(e) => e.stopPropagation()}
            >
              <ScrollView
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
                bounces={false}
                contentContainerStyle={{ paddingBottom: 8 }}
              >
                <View style={styles.modalHeaderRow}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1, marginRight: 8 }}>
                    <View style={[styles.sectionIconBox, { backgroundColor: '#EFF6FF' }]}>
                      <KeyRound size={18} color={COLORS.primary} />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.modalTitleText} numberOfLines={1}>Password Reset</Text>
                      <Text style={styles.modalSubtitleText} numberOfLines={1}>Code sent to {resetEmail}</Text>
                    </View>
                  </View>
                  <TouchableOpacity
                    onPress={() => setIsOtpModalOpen(false)}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  >
                    <X size={22} color="#64748B" />
                  </TouchableOpacity>
                </View>

                {otpError ? <ErrorBanner message={otpError} style={{ marginBottom: 12 }} /> : null}

                <View style={{ marginTop: 4, gap: 10 }}>
                  <Input
                    label="6-Digit Verification Code *"
                    placeholder="Enter 6-digit OTP"
                    keyboardType="numeric"
                    maxLength={6}
                    value={otpCode}
                    onChangeText={setOtpCode}
                    leftIcon={<Mail size={18} color="#64748B" />}
                  />

                  <View style={styles.inputWithIconRow}>
                    <Input
                      label="New Password *"
                      placeholder="Enter new password"
                      secureTextEntry={!showOtpNewPass}
                      value={otpNewPass}
                      onChangeText={setOtpNewPass}
                      leftIcon={<Lock size={18} color="#64748B" />}
                      style={{ flex: 1 }}
                    />
                    <TouchableOpacity style={styles.eyeBtn} onPress={() => setShowOtpNewPass(!showOtpNewPass)}>
                      {showOtpNewPass ? <EyeOff size={18} color="#64748B" /> : <Eye size={18} color="#64748B" />}
                    </TouchableOpacity>
                  </View>

                  <View style={styles.inputWithIconRow}>
                    <Input
                      label="Confirm New Password *"
                      placeholder="Confirm new password"
                      secureTextEntry={!showOtpConfirmPass}
                      value={otpConfirmPass}
                      onChangeText={setOtpConfirmPass}
                      leftIcon={<Lock size={18} color="#64748B" />}
                      style={{ flex: 1 }}
                    />
                    <TouchableOpacity style={styles.eyeBtn} onPress={() => setShowOtpConfirmPass(!showOtpConfirmPass)}>
                      {showOtpConfirmPass ? <EyeOff size={18} color="#64748B" /> : <Eye size={18} color="#64748B" />}
                    </TouchableOpacity>
                  </View>

                  <Button
                    title="Reset Password"
                    onPress={onResetWithOtp}
                    loading={otpLoading}
                    style={{ marginTop: 10, height: 46, borderRadius: 8 }}
                  />
                </View>
              </ScrollView>
            </TouchableOpacity>
          </TouchableOpacity>
        </KeyboardAvoidingView>
      </Modal>
    </>
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
    fontSize: 11.5,
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
});
