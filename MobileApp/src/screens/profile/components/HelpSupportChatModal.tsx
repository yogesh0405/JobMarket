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
import { COLORS } from '../../../constants/theme';
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

  useEffect(() => {
    if (visible && !loadingMessages) {
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [visible, loadingMessages, chatMessages.length]);

  useEffect(() => {
    const showEvent = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const showSub = Keyboard.addListener(showEvent, () => {
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 50);
    });

    return () => {
      showSub.remove();
    };
  }, []);

  if (!ticket) return null;

  const canSend = (replyMessage.trim().length > 0 || !!selectedAttachment) && !sendingReply;

  return (
    <SafeAreaView style={styles.modalContainer} edges={['top', 'bottom']}>
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
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 10 : 0}
        >
          {loadingMessages ? (
            <View style={styles.loadingStateWrapper}>
              <ActivityIndicator size="large" color="#6366F1" />
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
                          <Headphones size={13} color="#2186FF" strokeWidth={2.2} />
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

          <View style={[styles.inputBarOuterContainer, { paddingBottom: Math.max(insets.bottom, 12) }]}>
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

              {/* Text Input with 'Enter Message' placeholder */}
              <TextInput
                style={[styles.textInput, { maxHeight: 90 }]}
                placeholder="Enter Message"
                placeholderTextColor="#94A3B8"
                value={replyMessage}
                onChangeText={setReplyMessage}
                onFocus={() => {
                  setTimeout(() => scrollViewRef.current?.scrollToEnd({ animated: true }), 60);
                }}
                multiline
              />

              {/* Direct Send Icon Button on Right (Matching Image) */}
              <TouchableOpacity
                activeOpacity={0.75}
                style={styles.sendIconButton}
                onPress={onSendReply}
                disabled={!canSend}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                {sendingReply ? (
                  <ActivityIndicator size="small" color="#6366F1" />
                ) : (
                  <Send size={20} color={canSend ? '#6366F1' : '#94A3B8'} />
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
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    gap: 12,
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
    color: '#0F172A',
    letterSpacing: -0.2,
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
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
    fontWeight: '800',
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
    paddingHorizontal: 16,
    paddingTop: 12,
  },

  /* Centered Date / Time Stamp (Matching Reference Image) */
  dateStampContainer: {
    alignItems: 'center',
    marginVertical: 14,
  },
  dateStampText: {
    fontSize: 12,
    color: '#94A3B8',
    fontWeight: '400',
  },

  /* Outbound User Message Styles (Matching Reference Image) */
  userMsgWrapper: {
    alignSelf: 'flex-end',
    alignItems: 'flex-end',
    marginBottom: 12,
    maxWidth: '82%',
  },
  userBubble: {
    backgroundColor: '#2186FF', // Vibrant reference blue
    borderRadius: 22,
    paddingVertical: 13,
    paddingHorizontal: 18,
  },
  userBubbleText: {
    fontSize: 14.5,
    color: '#FFFFFF',
    lineHeight: 20,
    fontWeight: '400',
  },
  userBubbleTimeRow: {
    alignSelf: 'flex-end',
    marginTop: 4,
  },
  userBubbleTimeText: {
    fontSize: 10,
    color: 'rgba(255, 255, 255, 0.75)',
    fontWeight: '500',
  },

  /* Inbound Support Message Styles (Matching Reference Image) */
  supportMsgRow: {
    alignSelf: 'flex-start',
    marginBottom: 14,
    maxWidth: '82%',
  },
  supportBubble: {
    backgroundColor: '#EEF2F6', // Soft cool gray-blue from reference
    borderRadius: 20,
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  supportHeaderTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  supportAgentName: {
    fontSize: 13,
    fontWeight: '700',
    color: '#2186FF',
  },
  supportBubbleText: {
    fontSize: 14.5,
    color: '#0F172A',
    lineHeight: 20,
    fontWeight: '400',
  },
  supportBubbleTimeRow: {
    alignSelf: 'flex-end',
    marginTop: 4,
  },
  supportBubbleTimeText: {
    fontSize: 10,
    color: '#94A3B8',
    fontWeight: '500',
  },

  /* Image Attachments */
  imageAttachmentWrapper: {
    alignSelf: 'flex-end',
    marginBottom: 6,
  },
  imageAttachmentWrapperLeft: {
    marginTop: 8,
  },
  imageAttachmentCard: {
    width: 240,
    height: 140,
    borderRadius: 16,
    backgroundColor: '#E2E8F0',
  },

  /* Bottom Input Bar (Matching Reference Image) */
  inputBarOuterContainer: {
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    paddingHorizontal: 16,
    paddingTop: 10,
  },
  attachmentPreviewStrip: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FEF2F2',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    marginBottom: 8,
  },
  attachmentPreviewText: {
    fontSize: 12,
    color: '#DC2626',
    fontWeight: '600',
    flex: 1,
  },
  capsuleInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 26,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 16,
    paddingVertical: Platform.OS === 'ios' ? 10 : 7,
    minHeight: 48,
    shadowColor: '#000000',
    shadowOpacity: 0.03,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 3,
    elevation: 1,
  },
  clipButton: {
    width: 30,
    height: 30,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 6,
  },
  textInput: {
    flex: 1,
    fontSize: 14.5,
    color: '#0F172A',
    paddingVertical: 6,
    paddingHorizontal: 4,
    minHeight: 36,
  },
  sendIconButton: {
    padding: 6,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 6,
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
    width: 40,
    height: 40,
    borderRadius: 20,
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
    gap: 12,
  },
  loadingStateText: {
    fontSize: 13.5,
    fontWeight: '500',
    color: '#64748B',
  },
});

