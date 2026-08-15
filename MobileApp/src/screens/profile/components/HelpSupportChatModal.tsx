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
} from 'react-native';
import { X, User, Paperclip, Send } from 'lucide-react-native';
import { COLORS } from '../../../constants/theme';
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
  if (!ticket) return null;

  return (
    <Modal visible={visible} animationType="slide" transparent={false} onRequestClose={onClose}>
      <View style={styles.modalRootContainer}>
        {/* Header Bar */}
        <View style={styles.chatHeaderBar}>
          <View style={{ flex: 1 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <Text style={styles.chatTicketNumText}>{ticket.ticketNumber}</Text>
              <View style={[styles.chatStatusBadge, ticket.status === 'RESOLVED' ? styles.statusBadgeResolved : styles.statusBadgeOpen]}>
                <Text style={styles.chatStatusBadgeText}>{ticket.status}</Text>
              </View>
            </View>
            <Text style={styles.chatTicketSubjectText} numberOfLines={1}>{ticket.subject}</Text>
          </View>
          <TouchableOpacity onPress={onClose} style={styles.chatCloseBtn}>
            <X size={20} color="#0F172A" />
          </TouchableOpacity>
        </View>

        {/* Message Thread List */}
        <ScrollView contentContainerStyle={styles.chatMessagesScrollContent}>
          <View style={styles.systemInfoNoticeBox}>
            <Text style={styles.systemInfoNoticeTitle}>Support Ticket #{ticket.ticketNumber}</Text>
            <Text style={styles.systemInfoNoticeSub}>Category: {ticket.category} • Priority: {ticket.priority.toUpperCase()}</Text>
          </View>

          {chatMessages.map((msg) => {
            const isUser = msg.sender === 'user';
            return (
              <View key={msg.id} style={[styles.chatMsgRow, isUser ? styles.chatMsgRowUser : styles.chatMsgRowSupport]}>
                {!isUser && (
                  <View style={styles.chatAvatarSupport}>
                    <Text style={styles.chatAvatarSupportText}>ST</Text>
                  </View>
                )}
                <View style={[styles.chatBubble, isUser ? styles.chatBubbleUser : styles.chatBubbleSupport]}>
                  <Text style={[styles.chatSenderNameText, isUser ? styles.chatSenderNameUser : styles.chatSenderNameSupport]}>
                    {msg.senderName}
                  </Text>
                  <Text style={[styles.chatMsgBodyText, isUser ? styles.chatMsgBodyUser : styles.chatMsgBodySupport]}>
                    {msg.text}
                  </Text>
                  {msg.attachment ? (
                    <Image source={{ uri: msg.attachment }} style={styles.chatAttachmentImg} />
                  ) : null}
                  <Text style={[styles.chatMsgTimeText, isUser ? styles.chatMsgTimeUser : styles.chatMsgTimeSupport]}>
                    {msg.createdAt}
                  </Text>
                </View>
                {isUser && (
                  <View style={styles.chatAvatarUser}>
                    <User size={12} color="#FFFFFF" />
                  </View>
                )}
              </View>
            );
          })}
        </ScrollView>

        {/* Input Bar */}
        <View style={styles.chatInputBarContainer}>
          {selectedAttachment ? (
            <View style={styles.attachmentPreviewStrip}>
              <Text style={styles.attachmentPreviewName} numberOfLines={1}>{selectedAttachment.name}</Text>
              <TouchableOpacity onPress={onRemoveAttachment}>
                <X size={14} color="#DC2626" />
              </TouchableOpacity>
            </View>
          ) : null}
          <View style={styles.chatInputRowWrap}>
            <TouchableOpacity style={styles.attachBtnCircle} onPress={onPickAttachment}>
              <Paperclip size={18} color="#64748B" />
            </TouchableOpacity>

            <TextInput
              style={styles.chatInputField}
              placeholder="Type your message reply..."
              placeholderTextColor="#94A3B8"
              value={replyMessage}
              onChangeText={setReplyMessage}
              multiline
            />

            <TouchableOpacity
              style={[styles.chatSendBtnCircle, sendingReply && { opacity: 0.6 }]}
              onPress={onSendReply}
              disabled={sendingReply}
            >
              {sendingReply ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Send size={16} color="#FFFFFF" />
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalRootContainer: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  chatHeaderBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 48,
    paddingBottom: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  chatTicketNumText: {
    fontSize: 13,
    fontWeight: '800',
    color: COLORS.primary,
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
    fontSize: 10,
    fontWeight: '800',
    color: '#92400E',
  },
  chatTicketSubjectText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
    marginTop: 2,
  },
  chatCloseBtn: {
    padding: 6,
  },
  chatMessagesScrollContent: {
    padding: 16,
    gap: 12,
  },
  systemInfoNoticeBox: {
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#BFDBFE',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    marginBottom: 8,
  },
  systemInfoNoticeTitle: {
    fontSize: 12.5,
    fontWeight: '800',
    color: '#1E40AF',
  },
  systemInfoNoticeSub: {
    fontSize: 11,
    color: '#3B82F6',
    marginTop: 2,
  },
  chatMsgRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8,
    marginVertical: 2,
  },
  chatMsgRowUser: {
    justifyContent: 'flex-end',
  },
  chatMsgRowSupport: {
    justifyContent: 'flex-start',
  },
  chatAvatarSupport: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#0F172A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  chatAvatarSupportText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  chatAvatarUser: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chatBubble: {
    maxWidth: '78%',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  chatBubbleUser: {
    backgroundColor: COLORS.primary,
    borderBottomRightRadius: 2,
  },
  chatBubbleSupport: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderBottomLeftRadius: 2,
  },
  chatSenderNameText: {
    fontSize: 10.5,
    fontWeight: '700',
    marginBottom: 2,
  },
  chatSenderNameUser: {
    color: '#E0F2FE',
  },
  chatSenderNameSupport: {
    color: '#64748B',
  },
  chatMsgBodyText: {
    fontSize: 13,
    lineHeight: 18,
  },
  chatMsgBodyUser: {
    color: '#FFFFFF',
  },
  chatMsgBodySupport: {
    color: '#0F172A',
  },
  chatAttachmentImg: {
    width: 160,
    height: 120,
    borderRadius: 8,
    marginTop: 6,
  },
  chatMsgTimeText: {
    fontSize: 9.5,
    marginTop: 4,
    alignSelf: 'flex-end',
  },
  chatMsgTimeUser: {
    color: '#DBEAFE',
  },
  chatMsgTimeSupport: {
    color: '#94A3B8',
  },
  chatInputBarContainer: {
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    paddingHorizontal: 12,
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
    gap: 8,
  },
  attachBtnCircle: {
    padding: 8,
  },
  chatInputField: {
    flex: 1,
    backgroundColor: '#F1F5F9',
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 8,
    fontSize: 13,
    color: '#0F172A',
    maxHeight: 80,
  },
  chatSendBtnCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
