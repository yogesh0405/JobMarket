import React from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  TouchableWithoutFeedback,
} from 'react-native';
import { AlertTriangle } from 'lucide-react-native';
import { COLORS } from '../../constants/theme';

export interface ConfirmationModalProps {
  visible: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message?: string;
  highlightText?: string;
  confirmText?: string;
  cancelText?: string;
  icon?: React.ReactNode;
  iconBgColor?: string;
  type?: 'danger' | 'primary' | 'warning';
  loading?: boolean;
  children?: React.ReactNode;
}

export const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  visible,
  onClose,
  onConfirm,
  title,
  message,
  highlightText,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  icon,
  iconBgColor,
  type = 'danger',
  loading = false,
  children,
}) => {
  const confirmBtnBg =
    type === 'danger' ? '#DC2626' : type === 'warning' ? '#D97706' : COLORS.primary;

  const defaultIconBg =
    type === 'danger' || type === 'warning' ? '#FEF3C7' : '#EFF6FF';

  const defaultIcon =
    type === 'danger' || type === 'warning' ? (
      <AlertTriangle size={26} color="#D97706" strokeWidth={2.2} />
    ) : null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.modalOverlay}>
          <TouchableWithoutFeedback>
            <View style={styles.modalCard}>
              {/* Center Circular Icon Badge */}
              <View style={[styles.iconCircle, { backgroundColor: iconBgColor || defaultIconBg }]}>
                {icon !== undefined ? icon : defaultIcon}
              </View>

              {/* Title */}
              <Text style={styles.titleText}>{title}</Text>

              {/* Message Description */}
              {message ? <Text style={styles.messageText}>{message}</Text> : null}

              {/* Optional Highlight Text */}
              {highlightText ? (
                <Text style={styles.highlightText} numberOfLines={1}>
                  {highlightText}
                </Text>
              ) : null}

              {children}

              {/* Action Buttons Row */}
              <View style={styles.buttonRow}>
                <TouchableOpacity
                  activeOpacity={0.85}
                  style={styles.cancelBtn}
                  onPress={onClose}
                  disabled={loading}
                >
                  <Text style={styles.cancelBtnText}>{cancelText}</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  activeOpacity={0.85}
                  style={[styles.confirmBtn, { backgroundColor: confirmBtnBg }]}
                  onPress={onConfirm}
                  disabled={loading}
                >
                  {loading ? (
                    <ActivityIndicator size="small" color="#FFFFFF" />
                  ) : (
                    <Text style={styles.confirmBtnText}>{confirmText}</Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </TouchableWithoutFeedback>
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
  modalCard: {
    width: '100%',
    maxWidth: 360,
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
    fontSize: 14,
    fontWeight: '500',
    color: '#475569',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 20,
  },
  highlightText: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.primary,
    textAlign: 'center',
    marginBottom: 16,
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
    flex: 1,
    height: 46,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  confirmBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
