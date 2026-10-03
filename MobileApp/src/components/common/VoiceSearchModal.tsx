import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  Modal,
  StyleSheet,
  TouchableOpacity,
  Platform,
  Animated,
  Easing,
  Alert,
} from 'react-native';
import { Mic, MicOff, X, ArrowRight, AlertCircle, RefreshCw } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import {
  ExpoSpeechRecognitionModule,
  useSpeechRecognitionEvent,
} from 'expo-speech-recognition';
import { COLORS, TYPOGRAPHY, FONTS } from '../../constants/theme';

interface VoiceSearchModalProps {
  visible: boolean;
  onClose: () => void;
  onSearchResult: (text: string) => void;
  placeholderHints?: string[];
}

const DEFAULT_HINTS = [
  'CNC Machine Operator',
  'ITI Fitter Waluj',
  'Quality Inspector',
  'Welder Shendra MIDC',
];

export const VoiceSearchModal: React.FC<VoiceSearchModalProps> = ({
  visible,
  onClose,
  onSearchResult,
  placeholderHints = DEFAULT_HINTS,
}) => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSupported, setIsSupported] = useState(true);

  // Animation values for the pulse effect
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const pulseOpacity = useRef(new Animated.Value(0.6)).current;
  const pulseLoop = useRef<Animated.CompositeAnimation | null>(null);

  // Auto-submit timer ref
  const autoSubmitTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Pulse animation controller
  useEffect(() => {
    if (isListening) {
      pulseLoop.current = Animated.loop(
        Animated.parallel([
          Animated.sequence([
            Animated.timing(pulseAnim, {
              toValue: 1.25,
              duration: 900,
              easing: Easing.out(Easing.ease),
              useNativeDriver: true,
            }),
            Animated.timing(pulseAnim, {
              toValue: 1,
              duration: 900,
              easing: Easing.in(Easing.ease),
              useNativeDriver: true,
            }),
          ]),
          Animated.sequence([
            Animated.timing(pulseOpacity, {
              toValue: 0.15,
              duration: 900,
              useNativeDriver: true,
            }),
            Animated.timing(pulseOpacity, {
              toValue: 0.6,
              duration: 900,
              useNativeDriver: true,
            }),
          ]),
        ])
      );
      pulseLoop.current.start();
    } else {
      pulseLoop.current?.stop();
      pulseAnim.setValue(1);
      pulseOpacity.setValue(0.6);
    }

    return () => {
      pulseLoop.current?.stop();
    };
  }, [isListening, pulseAnim, pulseOpacity]);

  // Speech recognition events
  useSpeechRecognitionEvent('start', () => {
    setIsListening(true);
    setErrorMessage(null);
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch (_) {}
  });

  useSpeechRecognitionEvent('end', () => {
    setIsListening(false);
  });

  useSpeechRecognitionEvent('result', (event) => {
    const candidateText = event.results[0]?.transcript || '';
    if (candidateText.trim()) {
      setTranscript(candidateText);
      setErrorMessage(null);

      // If recognition marked this as final, submit automatically after short pause
      if (event.isFinal) {
        if (autoSubmitTimeout.current) clearTimeout(autoSubmitTimeout.current);
        autoSubmitTimeout.current = setTimeout(() => {
          handleConfirmResult(candidateText);
        }, 700);
      }
    }
  });

  useSpeechRecognitionEvent('error', (event) => {
    setIsListening(false);
    if (event.error === 'no-speech') {
      setErrorMessage("No speech detected. Please speak closer to the microphone.");
    } else if (event.error === 'not-allowed') {
      setErrorMessage('Microphone or speech permission was denied. Please allow permission in system settings.');
    } else if (event.error !== 'aborted') {
      setErrorMessage(event.message || 'Speech recognition encountered an issue. Please try again.');
    }
  });

  // Start listening automatically whenever modal becomes visible
  useEffect(() => {
    if (visible) {
      setTranscript('');
      setErrorMessage(null);
      startListeningSession();
    } else {
      stopListeningSession();
    }

    return () => {
      if (autoSubmitTimeout.current) clearTimeout(autoSubmitTimeout.current);
      stopListeningSession();
    };
  }, [visible]);

  const startListeningSession = async () => {
    try {
      if (!ExpoSpeechRecognitionModule) {
        setIsSupported(false);
        setErrorMessage('Native voice recognition is not available in this build.');
        return;
      }

      // Check module availability
      const available = ExpoSpeechRecognitionModule.isRecognitionAvailable?.();
      if (available === false) {
        setIsSupported(false);
        setErrorMessage('Speech recognition is not enabled or supported on this device.');
        return;
      }

      // Request permission
      const perm = await ExpoSpeechRecognitionModule.requestPermissionsAsync();
      if (!perm.granted) {
        setErrorMessage('Microphone access is required to use voice search.');
        return;
      }

      // Start native speech recognition with Indian English priority or system locale
      ExpoSpeechRecognitionModule.start({
        lang: 'en-IN',
        interimResults: true,
        continuous: false,
        addsPunctuation: false,
      });
    } catch (err: any) {
      console.warn('Speech recognition start failed:', err);
      setErrorMessage(err?.message || 'Unable to start voice recognition.');
    }
  };

  const stopListeningSession = () => {
    try {
      if (ExpoSpeechRecognitionModule) {
        ExpoSpeechRecognitionModule.stop();
      }
    } catch (_) {}
    setIsListening(false);
  };

  const handleConfirmResult = (textToUse?: string) => {
    const finalQuery = (textToUse || transcript).trim();
    if (!finalQuery) return;

    try {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (_) {}

    stopListeningSession();
    onSearchResult(finalQuery);
    onClose();
  };

  const handleSelectHint = (hint: string) => {
    setTranscript(hint);
    handleConfirmResult(hint);
  };

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          {/* Header Bar */}
          <View style={styles.headerRow}>
            <View style={styles.headerTitleGroup}>
              <Text style={styles.headerTitle}>Voice Search</Text>
              <Text style={styles.headerSub}>
                {isListening ? 'Listening for trade, role, or company...' : 'Paused'}
              </Text>
            </View>
            <TouchableOpacity
              onPress={onClose}
              style={styles.closeBtn}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              activeOpacity={0.7}
            >
              <X size={20} color="#64748B" />
            </TouchableOpacity>
          </View>

          {/* Section Separator */}
          <View style={styles.sectionDivider} />

          {/* Center Mic & Live Waveform Animation */}
          <View style={styles.micSection}>
            <View style={styles.micAnimationWrapper}>
              {isListening && (
                <Animated.View
                  style={[
                    styles.pulseCircle,
                    {
                      transform: [{ scale: pulseAnim }],
                      opacity: pulseOpacity,
                    },
                  ]}
                />
              )}

              <TouchableOpacity
                onPress={() => {
                  if (isListening) {
                    stopListeningSession();
                  } else {
                    startListeningSession();
                  }
                }}
                activeOpacity={0.85}
                style={[
                  styles.micButton,
                  isListening ? styles.micButtonActive : styles.micButtonInactive,
                ]}
              >
                {isListening ? (
                  <Mic size={32} color="#FFFFFF" strokeWidth={2.4} />
                ) : (
                  <MicOff size={30} color="#FFFFFF" strokeWidth={2.2} />
                )}
              </TouchableOpacity>
            </View>

            <Text style={styles.statusLabel}>
              {isListening
                ? 'Speak now...'
                : transcript
                ? 'Speech captured'
                : 'Tap microphone to speak'}
            </Text>
          </View>

          {/* Live Transcript Display Box */}
          <View style={styles.transcriptBox}>
            {transcript ? (
              <Text style={styles.transcriptText}>{transcript}</Text>
            ) : (
              <Text style={styles.transcriptPlaceholder}>
                e.g., "Senior CNC Operator in Waluj MIDC"
              </Text>
            )}
          </View>

          {/* Error Message banner if any */}
          {errorMessage ? (
            <View style={styles.errorBox}>
              <AlertCircle size={15} color="#DC2626" style={{ marginRight: 6 }} />
              <Text style={styles.errorText}>{errorMessage}</Text>
              <TouchableOpacity
                onPress={startListeningSession}
                style={styles.retryBtn}
                activeOpacity={0.7}
              >
                <RefreshCw size={13} color="#DC2626" />
                <Text style={styles.retryBtnText}>Retry</Text>
              </TouchableOpacity>
            </View>
          ) : null}

          {/* Quick Example Suggestions */}
          <View style={styles.hintsSection}>
            <Text style={styles.hintsTitle}>SUGGESTED VOICE QUERIES</Text>
            <View style={styles.hintsWrap}>
              {placeholderHints.map((hint, idx) => (
                <TouchableOpacity
                  key={`hint-${idx}`}
                  style={styles.hintChip}
                  onPress={() => handleSelectHint(hint)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.hintChipText}>{hint}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Section Separator */}
          <View style={styles.sectionDivider} />

          {/* Footer CTA Buttons */}
          <View style={styles.footerRow}>
            <TouchableOpacity
              style={styles.cancelBtn}
              onPress={onClose}
              activeOpacity={0.7}
            >
              <Text style={styles.cancelBtnText}>Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.searchCtaBtn,
                !transcript.trim() && styles.searchCtaBtnDisabled,
              ]}
              disabled={!transcript.trim()}
              onPress={() => handleConfirmResult()}
              activeOpacity={0.8}
            >
              <Text style={styles.searchCtaBtnText}>Search Now</Text>
              <ArrowRight size={16} color="#FFFFFF" strokeWidth={2.2} style={{ marginLeft: 6 }} />
            </TouchableOpacity>
          </View>
        </View>
      </View>
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
  modalContainer: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: '#FFFFFF',
    borderRadius: 0, // Clean square corners per design rules
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingVertical: 18,
    paddingHorizontal: 16,
    elevation: 4,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 4,
  },
  headerTitleGroup: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0F172A',
    fontFamily: FONTS.bold || 'System',
  },
  headerSub: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
    fontFamily: FONTS.regular || 'System',
  },
  closeBtn: {
    padding: 8,
    minWidth: 44,
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionDivider: {
    height: 1,
    backgroundColor: '#94A3B8', // Slate 400 per design rules
    marginVertical: 6,
  },
  micSection: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
  },
  micAnimationWrapper: {
    width: 88,
    height: 88,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pulseCircle: {
    position: 'absolute',
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: '#3B82F6',
  },
  micButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 3,
    shadowColor: '#0066CC',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  micButtonActive: {
    backgroundColor: COLORS.primary, // Primary Blue strictly per design rules
  },
  micButtonInactive: {
    backgroundColor: '#64748B',
  },
  statusLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#334155',
    marginTop: 10,
  },
  transcriptBox: {
    minHeight: 64,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 0,
    padding: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 6,
  },
  transcriptText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#0F172A',
    textAlign: 'center',
    lineHeight: 22,
  },
  transcriptPlaceholder: {
    fontSize: 13,
    color: '#94A3B8',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FCA5A5',
    paddingHorizontal: 10,
    paddingVertical: 8,
    marginTop: 6,
    borderRadius: 0,
  },
  errorText: {
    flex: 1,
    fontSize: 12,
    color: '#DC2626',
    fontWeight: '500',
  },
  retryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 6,
    paddingVertical: 4,
  },
  retryBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#DC2626',
  },
  hintsSection: {
    marginTop: 8,
    marginBottom: 4,
  },
  hintsTitle: {
    fontSize: 10,
    fontWeight: '800',
    color: '#64748B',
    letterSpacing: 0.8,
    marginBottom: 6,
  },
  hintsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  hintChip: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 0,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  hintChipText: {
    fontSize: 11,
    color: '#334155',
    fontWeight: '500',
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 10,
    marginTop: 8,
  },
  cancelBtn: {
    minHeight: 44,
    paddingHorizontal: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cancelBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748B',
  },
  searchCtaBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary, // Primary Blue CTA
    paddingHorizontal: 18,
    minHeight: 44,
    borderRadius: 0, // Clean square corners per design rules
  },
  searchCtaBtnDisabled: {
    backgroundColor: '#94A3B8',
    opacity: 0.6,
  },
  searchCtaBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
