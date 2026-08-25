import React from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  TouchableWithoutFeedback,
} from 'react-native';
import { Check, X } from 'lucide-react-native';
import { COLORS } from '../../constants/theme';

export interface SuccessModalProps {
  visible: boolean;
  onClose: () => void;
  title: string;
  message?: string;
  buttonText?: string;
  onButtonPress?: () => void;
  showCloseIcon?: boolean;
}

export const SuccessModal: React.FC<SuccessModalProps> = ({
  visible,
  onClose,
  title,
  message,
  buttonText = 'Done',
  onButtonPress,
  showCloseIcon = true,
}) => {
  const handlePressDone = () => {
    if (onButtonPress) {
      onButtonPress();
    } else {
      onClose();
    }
  };

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
              {/* Top Right Close "X" Button */}
              {showCloseIcon ? (
                <TouchableOpacity
                  activeOpacity={0.7}
                  style={styles.closeTopRightBtn}
                  onPress={onClose}
                  hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                >
                  <X size={20} color="#334155" strokeWidth={2.4} />
                </TouchableOpacity>
              ) : null}

              {/* Double Circular Green Checkmark Badge */}
              <View style={styles.outerCircle}>
                <View style={styles.innerCircle}>
                  <Check size={28} color="#FFFFFF" strokeWidth={3.2} />
                </View>
              </View>

              {/* Success Title */}
              <Text style={styles.titleText}>{title}</Text>

              {/* Optional Subtitle Message */}
              {message ? <Text style={styles.messageText}>{message}</Text> : null}

              {/* Primary Blue Action Button */}
              <TouchableOpacity
                activeOpacity={0.85}
                style={styles.doneButton}
                onPress={handlePressDone}
              >
                <Text style={styles.doneButtonText}>{buttonText}</Text>
              </TouchableOpacity>
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
    paddingHorizontal: 24,
  },
  modalCard: {
    width: '100%',
    maxWidth: 340,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 24,
    paddingTop: 32,
    paddingBottom: 24,
    alignItems: 'center',
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 18,
    elevation: 10,
  },
  closeTopRightBtn: {
    position: 'absolute',
    top: 14,
    right: 14,
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  outerCircle: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: '#E8FDF0',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  innerCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#10B981',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  titleText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 6,
  },
  messageText: {
    fontSize: 12.5,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 14,
  },
  doneButton: {
    width: '100%',
    height: 44,
    backgroundColor: COLORS.primary,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
  },
  doneButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
