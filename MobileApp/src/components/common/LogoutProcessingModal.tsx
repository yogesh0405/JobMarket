import React from 'react';
import {
  Modal,
  View,
  Text,
  ActivityIndicator,
  StyleSheet,
  StatusBar,
} from 'react-native';
import { LogOut } from 'lucide-react-native';
import { COLORS } from '../../constants/theme';

interface LogoutProcessingModalProps {
  visible: boolean;
}

export const LogoutProcessingModal: React.FC<LogoutProcessingModalProps> = ({ visible }) => {
  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={() => {}}
    >
      <View style={styles.modalOverlay}>
        <StatusBar barStyle="light-content" backgroundColor="rgba(15, 23, 42, 0.7)" />
        <View style={styles.modalCard}>
          {/* Centered Icon with Circular Loading Spinner wrapping around it */}
          <View style={styles.iconContainer}>
            <ActivityIndicator
              size="large"
              color={COLORS.primary}
              style={StyleSheet.absoluteFill}
            />
            <View style={styles.iconCircleInner}>
              <LogOut size={20} color={COLORS.primary} strokeWidth={2.2} />
            </View>
          </View>

          {/* Title & Subtitle */}
          <Text style={styles.titleText}>Signing Out</Text>
          <Text style={styles.subtitleText}>Securely closing your session...</Text>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.72)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 28,
  },
  modalCard: {
    width: '100%',
    maxWidth: 300,
    backgroundColor: '#FFFFFF',
    borderRadius: 0,
    paddingVertical: 26,
    paddingHorizontal: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 10,
    elevation: 8,
  },
  iconContainer: {
    width: 64,
    height: 64,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    position: 'relative',
  },
  iconCircleInner: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleText: {
    fontSize: 16.5,
    fontWeight: '700',
    color: '#0F172A',
    letterSpacing: -0.2,
    marginBottom: 4,
    textAlign: 'center',
  },
  subtitleText: {
    fontSize: 12.5,
    fontWeight: '400',
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 18,
  },
});
