import React from 'react';
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
  SafeAreaView,
  Platform,
  StatusBar,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { X, User, Paperclip, Send, Headphones, CheckCheck } from 'lucide-react-native';
import { COLORS } from '../../../constants/theme';
import { useAuth } from '../../../hooks/useAuth';
import { SupportTicket, TicketMessage } from './HelpSupportConstants';

interface HelpSupportChatModalProps {
  visible: boolean;
  onClose: () => void;
  ticket: SupportTicket | null;
  chatMessages: TicketMessage[];
  replyMessage: string;
  setReplyMessage: (val: string) => void;
  sendingReply: boolean;
  selectedAttachment: { uri: string; name: string; base64?: string } | null;
  onPickAttachment: () => void;
  onRemoveAttachment: () => void;
  onSendReply: () => void;
}

export const HelpSupportChatModal: React.FC<HelpSupportChatModalProps> = ({
  visible,
  onClose,
  ticket,
  chatMessages,
  replyMessage,
  setReplyMessage,
  sendingReply,
  selectedAttachment,
  onPickAttachment,
  onRemoveAttachment,
  onSendReply,
}) => {
  const { user } = useAuth();
  const userPhotoUri =
    user?.profilePictureUrl ||
    (user as any)?.profile_picture_url ||
    (user as any)?.companyLogo ||
    (user as any)?.company_logo;

  const insets = useSafeAreaInsets();
  const topInset = Math.max(insets.top || 0, Platform.OS === 'android' ? (StatusBar.currentHeight || 24) : 0);

  if (!ticket) return null;

  const canSend = (replyMessage.trim().length > 0 || !!selectedAttachment) && !sendingReply;

  return (
    <Modal visible={visible} animationType="slide" transparent={false} onRequestClose={onClose}>
      <SafeAreaView style={styles.modalRootContainer}>
        {/* Instagram DM Style Header Bar */}
        <View style={[styles.chatHeaderBar, { paddingTop: topInset + (Platform.OS === 'android' ? 6 : 4) }]}>
          <TouchableOpacity onPress={onClose} style={styles.chatCloseBtn} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <X size={22} color="#0F172A" />
          </TouchableOpacity>

          <View style={styles.headerInfoCol}>
            <View style={styles.headerTitleRow}>
              <Text style={styles.chatHeaderNameText} numberOfLines={1}>Support Ticket #{ticket.ticketNumber}</Text>
              <View style={[styles.chatStatusBadge, ticket.status === 'RESOLVED' ? styles.statusBadgeResolved : styles.statusBadgeOpen]}>
                <Text style={styles.chatStatusBadgeText}>{ticket.status}</Text>
              </View>
            </View>
            <Text style={styles.chatHeaderSubText} numberOfLines={1}>{ticket.subject}</Text>
          </View>
        </View>

        {/* Message Thread List */}
        <ScrollView contentContainerStyle={styles.chatMessagesScrollContent} showsVerticalScrollIndicator={false}>
          <View style={styles.systemInfoNoticeBox}>
            <Text style={styles.systemInfoNoticeTitle}>Technical Inquiry Thread</Text>
            <Text style={styles.systemInfoNoticeSub}>Category: {ticket.category} • Priority: {ticket.priority.toUpperCase()}</Text>
          </View>

          {chatMessages.map((msg) => {
            const isUser = msg.sender === 'user';
            return (
              <View key={msg.id} style={[styles.chatMsgRow, isUser ? styles.chatMsgRowUser : styles.chatMsgRowSupport]}>
                <View style={[styles.chatBubble, isUser ? styles.chatBubbleUser : styles.chatBubbleSupport]}>
                  {/* Inside Avatar & Sender Name Header */}
                  <View style={styles.chatBubbleHeaderRow}>
                    {isUser ? (
                      <View style={styles.chatAvatarUserInside}>
                        {userPhotoUri ? (
                          <Image source={{ uri: userPhotoUri }} style={styles.avatarImageInside} />
                        ) : (
                          <User size={9} color="#FFFFFF" />
                        )}
                      </View>
                    ) : (
                      <View style={styles.chatAvatarSupportInside}>
                        <Headphones size={9} color={COLORS.primary} />
                      </View>
                    )}
                    <Text style={[styles.chatSenderNameText, isUser ? styles.chatSenderNameUser : styles.chatSenderNameSupport]}>
                      {isUser ? 'Me' : msg.senderName}
                    </Text>
                  </View>

                  <Text style={[styles.chatMsgBodyText, isUser ? styles.chatMsgBodyUser : styles.chatMsgBodySupport]}>
                    {msg.text}
                  </Text>

                  {msg.attachment ? (
                    <Image source={{ uri: msg.attachment }} style={styles.chatAttachmentImg} />
                  ) : null}

                  <View style={styles.msgFooterRow}>
                    <Text style={[styles.chatMsgTimeText, isUser ? styles.chatMsgTimeUser : styles.chatMsgTimeSupport]}>
                      {msg.createdAt}
                    </Text>
                    {isUser && <CheckCheck size={12} color="#93C5FD" style={{ marginLeft: 3 }} />}
                  </View>
                </View>
              </View>
            );
          })}
        </ScrollView>

        {/* Instagram DM Floating Input Bar */}
        <View style={styles.chatInputBarContainer}>
          {selectedAttachment ? (
            <View style={styles.attachmentPreviewStrip}>
              <Text style={styles.attachmentPreviewName} numberOfLines={1}>{selectedAttachment.name}</Text>
              <TouchableOpacity onPress={onRemoveAttachment} hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}>
                <X size={14} color="#DC2626" />
              </TouchableOpacity>
            </View>
          ) : null}

          <View style={styles.chatInputRowWrap}>
            <TouchableOpacity style={styles.attachBtnCircle} onPress={onPickAttachment} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <Paperclip size={18} color="#64748B" />
            </TouchableOpacity>

            <TextInput
              style={styles.chatInputField}
              placeholder="Message..."
              placeholderTextColor="#94A3B8"
              value={replyMessage}
              onChangeText={setReplyMessage}
              multiline
            />

            <TouchableOpacity
              style={[styles.chatSendBtnCircle, !canSend && styles.chatSendBtnDisabled]}
              onPress={onSendReply}
              disabled={!canSend}
            >
              {sendingReply ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Send size={15} color={canSend ? '#FFFFFF' : '#94A3B8'} />
              )}
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalRootContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  chatHeaderBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    gap: 12,
  },
  chatCloseBtn: {
    padding: 2,
  },
  headerInfoCol: {
    flex: 1,
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  chatHeaderNameText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
  },
  chatHeaderSubText: {
    fontSize: 11.5,
    color: '#64748B',
    marginTop: 1,
  },
  headerAvatarCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  onlinePulseDotSmall: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 9,
    height: 9,
    borderRadius: 4.5,
    backgroundColor: '#22C55E',
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
  },
  chatStatusBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  statusBadgeOpen: {
    backgroundColor: '#FEF3C7',
  },
  statusBadgeResolved: {
    backgroundColor: '#DCFCE7',
  },
  chatStatusBadgeText: {
    fontSize: 9.5,
    fontWeight: '800',
    color: '#92400E',
  },
  chatMessagesScrollContent: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 10,
  },
  systemInfoNoticeBox: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 8,
    padding: 10,
    alignItems: 'center',
    marginBottom: 6,
  },
  systemInfoNoticeTitle: {
    fontSize: 11.5,
    fontWeight: '800',
    color: '#475569',
  },
  systemInfoNoticeSub: {
    fontSize: 10.5,
    color: '#64748B',
    marginTop: 2,
  },
  chatMsgRow: {
    flexDirection: 'row',
    marginVertical: 1,
  },
  chatMsgRowUser: {
    justifyContent: 'flex-end',
  },
  chatMsgRowSupport: {
    justifyContent: 'flex-start',
  },
  chatBubble: {
    maxWidth: '80%',
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  chatBubbleUser: {
    backgroundColor: '#2563EB',
    borderBottomRightRadius: 4,
  },
  chatBubbleSupport: {
    backgroundColor: '#F1F5F9',
    borderBottomLeftRadius: 4,
  },
  chatBubbleHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginBottom: 4,
  },
  chatAvatarUserInside: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  chatAvatarSupportInside: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarImageInside: {
    width: 18,
    height: 18,
    borderRadius: 9,
  },
  chatSenderNameText: {
    fontSize: 10.5,
    fontWeight: '700',
  },
  chatSenderNameUser: {
    color: '#EFF6FF',
  },
  chatSenderNameSupport: {
    color: '#475569',
  },
  chatMsgBodyText: {
    fontSize: 13.5,
    lineHeight: 19,
  },
  chatMsgBodyUser: {
    color: '#FFFFFF',
  },
  chatMsgBodySupport: {
    color: '#0F172A',
  },
  chatAttachmentImg: {
    width: 180,
    height: 135,
    borderRadius: 12,
    marginTop: 6,
  },
  msgFooterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginTop: 4,
  },
  chatMsgTimeText: {
    fontSize: 9.5,
  },
  chatMsgTimeUser: {
    color: '#BFDBFE',
  },
  chatMsgTimeSupport: {
    color: '#94A3B8',
  },
  chatInputBarContainer: {
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  attachmentPreviewStrip: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FEF2F2',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
    marginBottom: 8,
  },
  attachmentPreviewName: {
    fontSize: 11.5,
    color: '#DC2626',
    fontWeight: '600',
  },
  chatInputRowWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    borderRadius: 24,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  attachBtnCircle: {
    padding: 6,
  },
  chatInputField: {
    flex: 1,
    paddingHorizontal: 8,
    paddingVertical: 8,
    fontSize: 13.5,
    color: '#0F172A',
    maxHeight: 80,
  },
  chatSendBtnCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#2563EB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  chatSendBtnDisabled: {
    backgroundColor: '#E2E8F0',
  },
});
