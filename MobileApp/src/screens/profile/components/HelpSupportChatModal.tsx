import React, { useRef, useEffect, useState } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Image,
  ActivityIndicator,
  StyleSheet,
  Platform,
  StatusBar,
  KeyboardAvoidingView,
  Keyboard,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { ArrowLeft, Paperclip, Send, X, Headphones } from 'lucide-react-native';
import { COLORS, RADIUS } from '../../../constants/theme';
import { useAuth } from '../../../hooks/useAuth';
import { SupportTicket, TicketMessage } from './HelpSupportConstants';

interface HelpSupportChatModalProps {
  visible: boolean;
  onClose: () => void;
  ticket: SupportTicket | null;
  chatMessages: TicketMessage[];
  loadingMessages?: boolean;
  replyMessage: string;
  setReplyMessage: (val: string) => void;
  sendingReply: boolean;
  selectedAttachment: { uri: string; name: string; base64?: string } | null;
  onPickAttachment: () => void;
  onRemoveAttachment: () => void;
  onSendReply: () => void;
}

// Helpers for Real Industry-Grade Date and Time Display
const formatMessageTime = (dateInput?: string): string => {
  if (!dateInput) return '';
  const parsed = new Date(dateInput);
  if (isNaN(parsed.getTime())) {
    if (/^\d{1,2}:\d{2}\s*(am|pm)?$/i.test(dateInput)) return dateInput;
    return '';
  }
  return parsed.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', hour12: true });
};

const formatChatDateHeader = (dateInput?: string): string => {
  if (!dateInput) return 'Today';

  const parsed = new Date(dateInput);
  if (isNaN(parsed.getTime())) {
    return String(dateInput);
  }

  const now = new Date();
  const isSameDay =
    parsed.getDate() === now.getDate() &&
    parsed.getMonth() === now.getMonth() &&
    parsed.getFullYear() === now.getFullYear();

  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const isYesterday =
    parsed.getDate() === yesterday.getDate() &&
    parsed.getMonth() === yesterday.getMonth() &&
    parsed.getFullYear() === yesterday.getFullYear();

  if (isSameDay) {
    return 'Today';
  }

  if (isYesterday) {
    return 'Yesterday';
  }

  const isCurrentYear = parsed.getFullYear() === now.getFullYear();
  return parsed.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    ...(isCurrentYear ? {} : { year: 'numeric' }),
  });
};

const getDayKey = (dateInput?: string): string => {
  if (!dateInput) return 'today';
  const parsed = new Date(dateInput);
  if (isNaN(parsed.getTime())) {
    return String(dateInput).split(',')[0].trim().toLowerCase();
  }
  return `${parsed.getFullYear()}-${parsed.getMonth() + 1}-${parsed.getDate()}`;
};

export const HelpSupportChatModal: React.FC<HelpSupportChatModalProps> = ({
  visible,
  onClose,
  ticket,
  chatMessages,
  loadingMessages = false,
  replyMessage,
  setReplyMessage,
  sendingReply,
  selectedAttachment,
  onPickAttachment,
  onRemoveAttachment,
  onSendReply,
}) => {
  const { user } = useAuth();
  const insets = useSafeAreaInsets();
  const topInset = Math.max(insets.top || 0, Platform.OS === 'android' ? (StatusBar.currentHeight || 24) : 0);
  const scrollViewRef = useRef<ScrollView>(null);
  const [previewImageModal, setPreviewImageModal] = useState<string | null>(null);
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);

  useEffect(() => {
    if (visible && !loadingMessages) {
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [visible, loadingMessages, chatMessages.length]);

  useEffect(() => {
    const showEvent = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvent = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';

    const showSub = Keyboard.addListener(showEvent, () => {
      setIsKeyboardVisible(true);
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 50);
    });

    const hideSub = Keyboard.addListener(hideEvent, () => {
      setIsKeyboardVisible(false);
    });

    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  if (!ticket) return null;

  const canSend = (replyMessage.trim().length > 0 || !!selectedAttachment) && !sendingReply;

  return (
    <SafeAreaView style={styles.modalContainer} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" translucent={false} />

        {/* Top Header Bar */}
        <View style={styles.headerBar}>
          <TouchableOpacity onPress={onClose} style={styles.backBtn} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
            <ArrowLeft size={22} color="#0F172A" strokeWidth={2.4} />
          </TouchableOpacity>

          <View style={styles.headerInfo}>
            <View style={styles.headerTitleRow}>
              <Text style={styles.headerTitle} numberOfLines={1}>
                Ticket #{ticket.ticketNumber}
              </Text>
              <View style={[styles.statusPill, ticket.status === 'RESOLVED' || ticket.status === 'CLOSED' ? styles.statusPillResolved : styles.statusPillOpen]}>
                <Text style={[styles.statusPillText, ticket.status === 'RESOLVED' || ticket.status === 'CLOSED' ? styles.statusPillTextResolved : styles.statusPillTextOpen]}>
                  {ticket.status}
                </Text>
              </View>
            </View>
            <Text style={styles.headerSubtitle} numberOfLines={1}>
              {ticket.subject}
            </Text>
          </View>
        </View>

        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          keyboardVerticalOffset={0}
        >
          {loadingMessages ? (
            <View style={styles.loadingStateWrapper}>
              <ActivityIndicator size="large" color={COLORS.primary} />
              <Text style={styles.loadingStateText}>Loading conversation...</Text>
            </View>
          ) : (
            <ScrollView
              ref={scrollViewRef}
              contentContainerStyle={[styles.messagesContainer, { paddingBottom: 16 }]}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
              onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: false })}
            >
            {chatMessages.map((msg, index) => {
              const isUser = msg.sender === 'user';
              const prevMsg = index > 0 ? chatMessages[index - 1] : null;

              const msgDate = msg.createdAt || ticket?.createdAt || new Date().toISOString();
              const prevDate = prevMsg?.createdAt || ticket?.createdAt;
              const shouldShowDateHeader = index === 0 || getDayKey(msgDate) !== getDayKey(prevDate);

              return (
                <React.Fragment key={msg.id || index}>
                  {shouldShowDateHeader && (
                    <View style={styles.dateStampContainer}>
                      <Text style={styles.dateStampText}>{formatChatDateHeader(msgDate)}</Text>
                    </View>
                  )}

                  {isUser ? (
                    <View style={styles.userMsgWrapper}>
                      {msg.attachment ? (
                        <TouchableOpacity
                          activeOpacity={0.88}
                          onPress={() => setPreviewImageModal(msg.attachment!)}
                          style={styles.imageAttachmentWrapper}
                        >
                          <Image source={{ uri: msg.attachment }} style={styles.imageAttachmentCard} />
                        </TouchableOpacity>
                      ) : null}

                      {msg.text ? (
                        <View style={styles.userBubble}>
                          <Text style={styles.userBubbleText}>{msg.text}</Text>
                          <View style={styles.userBubbleTimeRow}>
                            <Text style={styles.userBubbleTimeText}>{formatMessageTime(msgDate)}</Text>
                          </View>
                        </View>
                      ) : null}
                    </View>
                  ) : (
                    <View style={styles.supportMsgRow}>
                      <View style={styles.supportBubble}>
                        <View style={styles.supportHeaderTitleRow}>
                          <Headphones size={13} color={COLORS.primary} strokeWidth={2.2} />
                          <Text style={styles.supportAgentName}>
                            {msg.senderName || 'Support Team'}
                          </Text>
                        </View>
                        <Text style={styles.supportBubbleText}>{msg.text}</Text>

                        {msg.attachment ? (
                          <TouchableOpacity
                            activeOpacity={0.88}
                            onPress={() => setPreviewImageModal(msg.attachment!)}
                            style={styles.imageAttachmentWrapperLeft}
                          >
                            <Image source={{ uri: msg.attachment }} style={styles.imageAttachmentCard} />
                          </TouchableOpacity>
                        ) : null}

                        <View style={styles.supportBubbleTimeRow}>
                          <Text style={styles.supportBubbleTimeText}>{formatMessageTime(msgDate)}</Text>
                        </View>
                      </View>
                    </View>
                  )}
                </React.Fragment>
              );
            })}
          </ScrollView>
        )}

          {/* Fullscreen High-Res Image Preview Modal */}
          {previewImageModal && (
            <Modal
              visible={!!previewImageModal}
              transparent
              animationType="fade"
              onRequestClose={() => setPreviewImageModal(null)}
            >
              <View style={styles.fullImageModalOverlay}>
                <TouchableOpacity
                  activeOpacity={0.8}
                  style={styles.closeFullImageBtn}
                  onPress={() => setPreviewImageModal(null)}
                >
                  <X size={22} color="#FFFFFF" strokeWidth={2.5} />
                </TouchableOpacity>

                <Image
                  source={{ uri: previewImageModal }}
                  style={styles.fullImagePreview}
                  resizeMode="contain"
                />
              </View>
            </Modal>
          )}

          <View style={[styles.inputBarOuterContainer, { paddingBottom: isKeyboardVisible ? 0 : (Platform.OS === 'ios' ? insets.bottom : 6) }]}>
            {selectedAttachment ? (
              <View style={styles.attachmentPreviewStrip}>
                <Text style={styles.attachmentPreviewText} numberOfLines={1}>
                  📎 {selectedAttachment.name}
                </Text>
                <TouchableOpacity onPress={onRemoveAttachment} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                  <X size={16} color="#DC2626" />
                </TouchableOpacity>
              </View>
            ) : null}

            {/* Pill Capsule Container */}
            <View style={styles.capsuleInputRow}>
              {/* Paperclip / Attachment Icon on Left */}
              <TouchableOpacity
                style={styles.clipButton}
                onPress={onPickAttachment}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Paperclip size={20} color="#94A3B8" strokeWidth={2} />
              </TouchableOpacity>

              {/* Text Input with 'Enter Message' placeholder (Standard Text type, not password, non-scrollable) */}
              <TextInput
                style={styles.textInput}
                placeholder="Enter Message"
                placeholderTextColor="#94A3B8"
                value={replyMessage}
                onChangeText={setReplyMessage}
                secureTextEntry={false}
                keyboardType="default"
                autoCapitalize="sentences"
                autoCorrect={true}
                multiline={false}
                returnKeyType="send"
                onSubmitEditing={() => {
                  if (canSend) onSendReply();
                }}
                blurOnSubmit={false}
                onFocus={() => {
                  setTimeout(() => scrollViewRef.current?.scrollToEnd({ animated: true }), 60);
                }}
              />

              {/* Direct Send Icon Button on Right */}
              <TouchableOpacity
                activeOpacity={0.75}
                style={styles.sendIconButton}
                onPress={onSendReply}
                disabled={!canSend}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                {sendingReply ? (
                  <ActivityIndicator size="small" color={COLORS.primary} />
                ) : (
                  <Send size={20} color={canSend ? COLORS.primary : '#94A3B8'} />
                )}
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },

  /* Header */
  headerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    gap: 10,
  },
  backBtn: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerInfo: {
    flex: 1,
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  headerTitle: {
    flex: 1,
    fontSize: 15,
    fontWeight: '800',
    color: COLORS.textPrimary,
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
    letterSpacing: -0.2,
  },
  headerSubtitle: {
    fontSize: 11.5,
    color: COLORS.textSecondary,
    marginTop: 1,
  },
  statusPill: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  statusPillOpen: {
    backgroundColor: '#FEF3C7',
  },
  statusPillResolved: {
    backgroundColor: '#DCFCE7',
  },
  statusPillText: {
    fontSize: 9.5,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  statusPillTextOpen: {
    color: '#B45309',
  },
  statusPillTextResolved: {
    color: '#15803D',
  },

  /* Messages Scroll View */
  messagesContainer: {
    paddingHorizontal: 14,
    paddingTop: 10,
  },

  /* Centered Date / Time Stamp */
  dateStampContainer: {
    alignItems: 'center',
    marginVertical: 12,
  },
  dateStampText: {
    fontSize: 10.5,
    color: COLORS.textMuted,
    fontWeight: '600',
    backgroundColor: COLORS.softWarmBg,
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.softWarmBorder,
  },

  /* Outbound User Message Styles */
  userMsgWrapper: {
    alignSelf: 'flex-end',
    alignItems: 'flex-end',
    marginBottom: 10,
    maxWidth: '82%',
  },
  userBubble: {
    backgroundColor: COLORS.primary,
    borderRadius: 16,
    paddingVertical: 9,
    paddingHorizontal: 13,
  },
  userBubbleText: {
    fontSize: 12,
    color: COLORS.textWhite,
    lineHeight: 17,
    fontWeight: '400',
  },
  userBubbleTimeRow: {
    alignSelf: 'flex-end',
    marginTop: 3,
  },
  userBubbleTimeText: {
    fontSize: 9.5,
    color: 'rgba(255, 255, 255, 0.8)',
    fontWeight: '500',
  },

  /* Inbound Support Message Styles */
  supportMsgRow: {
    alignSelf: 'flex-start',
    marginBottom: 10,
    maxWidth: '82%',
  },
  supportBubble: {
    backgroundColor: COLORS.softWarmBg,
    borderWidth: 1,
    borderColor: COLORS.softWarmBorder,
    borderRadius: 16,
    paddingVertical: 9,
    paddingHorizontal: 13,
  },
  supportHeaderTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginBottom: 3,
  },
  supportAgentName: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.primary,
  },
  supportBubbleText: {
    fontSize: 12,
    color: COLORS.textPrimary,
    lineHeight: 17,
    fontWeight: '400',
  },
  supportBubbleTimeRow: {
    alignSelf: 'flex-end',
    marginTop: 3,
  },
  supportBubbleTimeText: {
    fontSize: 9.5,
    color: COLORS.textMuted,
    fontWeight: '500',
  },

  /* Image Attachments */
  imageAttachmentWrapper: {
    alignSelf: 'flex-end',
    marginBottom: 6,
  },
  imageAttachmentWrapperLeft: {
    marginTop: 6,
  },
  imageAttachmentCard: {
    width: 220,
    height: 130,
    borderRadius: RADIUS.card,
    backgroundColor: COLORS.border,
  },

  /* Bottom Input Bar */
  inputBarOuterContainer: {
    backgroundColor: COLORS.surface,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingHorizontal: 12,
    paddingTop: 6,
  },
  attachmentPreviewStrip: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FEF2F2',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: RADIUS.xs,
    marginBottom: 6,
  },
  attachmentPreviewText: {
    fontSize: 11.5,
    color: '#DC2626',
    fontWeight: '600',
    flex: 1,
  },
  capsuleInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    paddingHorizontal: 12,
    paddingVertical: Platform.OS === 'ios' ? 7 : 4,
    minHeight: 42,
    shadowColor: '#0F172A',
    shadowOpacity: 0.02,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 2,
    elevation: 1,
  },
  clipButton: {
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 4,
  },
  textInput: {
    flex: 1,
    fontSize: 12.5,
    color: COLORS.textPrimary,
    paddingVertical: 4,
    paddingHorizontal: 4,
    minHeight: 32,
  },
  sendIconButton: {
    padding: 5,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 4,
  },

  /* Fullscreen Image Lightbox Modal */
  fullImageModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(2, 6, 23, 0.95)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  closeFullImageBtn: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 48 : 24,
    right: 20,
    zIndex: 99,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  fullImagePreview: {
    width: '100%',
    height: '80%',
  },
  loadingStateWrapper: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    gap: 10,
  },
  loadingStateText: {
    fontSize: 12.5,
    fontWeight: '500',
    color: COLORS.textSecondary,
  },
});

