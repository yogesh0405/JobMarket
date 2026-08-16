import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Linking,
  BackHandler,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import {
  Headphones,
  Mail,
  Phone,
  MessageSquare,
  Ticket,
} from 'lucide-react-native';
import { useAuth } from '../../hooks/useAuth';
import { apiFetch } from '../../api/client';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Header } from '../../components/common/Header';
import { COLORS } from '../../constants/theme';
import { SupportTicket, TicketMessage } from './components/HelpSupportConstants';
import { HelpSupportFaqSection } from './components/HelpSupportFaqSection';
import { HelpSupportTicketsView } from './components/HelpSupportTicketsView';
import { HelpSupportChatModal } from './components/HelpSupportChatModal';

interface Props {
  navigation: any;
}

export const HelpSupportScreen: React.FC<Props> = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();

  const [currentView, setCurrentView] = useState<'MAIN' | 'TICKETS'>('MAIN');
  const [ticketTab, setTicketTab] = useState<'CREATE' | 'MY_TICKETS'>('CREATE');

  const [fullName, setFullName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState(user?.phone || '');

  const [category, setCategory] = useState('Job Application Inquiry');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [activeFAQCategory, setActiveFAQCategory] = useState('All');

  const [myTickets, setMyTickets] = useState<SupportTicket[]>([]);
  const [loadingTickets, setLoadingTickets] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
  const [chatMessages, setChatMessages] = useState<TicketMessage[]>([]);
  const [replyMessage, setReplyMessage] = useState('');
  const [sendingReply, setSendingReply] = useState(false);
  const [selectedAttachment, setSelectedAttachment] = useState<{ uri: string; name: string; base64?: string } | null>(null);

  const CATEGORY_OPTIONS = [
    'Job Application Inquiry',
    'Employer Job Posting Issue',
    'Resume Document Upload Issue',
    'Account & Security Verification',
    'OTP Email Non-receipt',
    'Other Technical Query',
  ];

  const fetchMyTickets = useCallback(async () => {
    setLoadingTickets(true);
    try {
      const res = await apiFetch('/api/support/tickets');
      if (res.success && Array.isArray(res.data)) {
        const mapped: SupportTicket[] = res.data.map((item: any) => ({
          id: String(item.id || item._id),
          ticketNumber: item.ticket_number || item.ticketNumber || `TKT-${item.id}`,
          category: item.category || 'General Support',
          subject: item.subject || 'Support Inquiry',
          description: item.description || '',
          priority: item.priority || 'medium',
          status: item.status || 'OPEN',
          createdAt: item.created_at
            ? new Date(item.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
            : 'Recent',
        }));
        setMyTickets(mapped);
      }
    } catch (err) {
      // Keep state intact
    } finally {
      setLoadingTickets(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchMyTickets();
  }, [fetchMyTickets]);

  // Intercept back navigation when viewing TICKETS section
  useEffect(() => {
    const handleBack = () => {
      if (selectedTicket) {
        setSelectedTicket(null);
        return true;
      }
      if (currentView === 'TICKETS') {
        setCurrentView('MAIN');
        return true;
      }
      return false;
    };

    const backSubscription = BackHandler.addEventListener('hardwareBackPress', handleBack);
    return () => backSubscription.remove();
  }, [currentView, selectedTicket]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchMyTickets();
  };

  const isMessageFromUser = (msg: any): boolean => {
    if (!msg) return false;
    const senderType = String(msg.sender || msg.sender_type || msg.senderType || '').toLowerCase();
    if (senderType === 'user' || senderType === 'candidate' || senderType === 'employer' || senderType === 'client') return true;
    if (senderType === 'support' || senderType === 'admin' || senderType === 'agent' || senderType === 'system') return false;

    const msgUserId = String(msg.userId || msg.user_id || msg.senderId || msg.sender_id || '');
    const currentUserId = String(user?.id || (user as any)?.user_id || '');
    if (msgUserId && currentUserId && msgUserId === currentUserId) return true;

    const senderEmail = String(msg.senderEmail || msg.sender_email || msg.email || '').toLowerCase();
    const currentEmail = String(user?.email || '').toLowerCase();
    if (senderEmail && currentEmail && senderEmail === currentEmail) return true;

    return false;
  };

  const handleOpenTicketChat = async (ticket: SupportTicket) => {
    setSelectedTicket(ticket);

    const initialMsg: TicketMessage = {
      id: 'init-1',
      sender: 'user',
      senderName: user?.name || 'You',
      text: ticket.description,
      createdAt: ticket.createdAt,
    };

    setChatMessages([initialMsg]);

    try {
      const res = await apiFetch(`/api/support/tickets/${ticket.id}`);
      if (res.success && res.data) {
        const rawMsgs = res.data.messages || res.data.conversations || [];
        if (Array.isArray(rawMsgs) && rawMsgs.length > 0) {
          const mappedMsgs: TicketMessage[] = rawMsgs.map((m: any, idx: number) => {
            const isUserMsg = isMessageFromUser(m);
            return {
              id: String(m.id || idx),
              sender: isUserMsg ? 'user' : 'support',
              senderName: isUserMsg ? (user?.name || 'You') : 'Support Team',
              text: m.message || m.text || '',
              attachment: m.attachment || m.attachment_url || undefined,
              createdAt: m.created_at
                ? new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                : 'Recent',
            };
          });
          setChatMessages(mappedMsgs);
        }
      }
    } catch (_) {}
  };

  const handlePickAttachment = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 0.7,
        base64: true,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        const filename = asset.fileName || `Attachment_${Date.now()}.jpg`;
        setSelectedAttachment({
          uri: asset.uri,
          name: filename,
          base64: asset.base64 ? `data:image/jpeg;base64,${asset.base64}` : undefined,
        });
      }
    } catch (_) {}
  };

  const handleSendReply = async () => {
    if (!replyMessage.trim() && !selectedAttachment) return;
    if (!selectedTicket) return;

    setSendingReply(true);

    const userMsg: TicketMessage = {
      id: `local-${Date.now()}`,
      sender: 'user',
      senderName: user?.name || 'You',
      text: replyMessage.trim(),
      attachment: selectedAttachment?.uri,
      createdAt: 'Just now',
    };

    setChatMessages((prev) => [...prev, userMsg]);
    setReplyMessage('');
    const sentAttachment = selectedAttachment;
    setSelectedAttachment(null);

    try {
      await apiFetch(`/api/support/tickets/${selectedTicket.id}/messages`, {
        method: 'POST',
        body: JSON.stringify({
          message: userMsg.text,
          attachment: sentAttachment?.base64 || sentAttachment?.uri,
        }),
      });
    } catch (_) {
      // Chat state updated locally
    } finally {
      setSendingReply(false);
    }
  };

  const handleCreateTicket = async () => {
    if (!fullName.trim() || !email.trim() || !subject.trim() || !description.trim()) {
      setFormError('Please complete all required fields (*)');
      return;
    }
    setFormError(null);
    setIsSubmitting(true);

    const generatedNum = `TKT-${Math.floor(100000 + Math.random() * 900000)}`;

    const newTicket: SupportTicket = {
      id: String(Date.now()),
      ticketNumber: generatedNum,
      category,
      subject: subject.trim(),
      description: description.trim(),
      priority,
      status: 'OPEN',
      createdAt: new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
    };

    try {
      const payload = {
        fullName: fullName.trim(),
        email: email.trim(),
        phone: phone.trim() || undefined,
        category,
        subject: subject.trim(),
        description: description.trim(),
        preferredContact: 'email',
        priority,
      };

      const res = await apiFetch('/api/support/tickets', {
        method: 'POST',
        body: JSON.stringify(payload),
      });

      if (res.success && res.data) {
        const serverTicket = res.data;
        const ticketNum = serverTicket.ticket_number || serverTicket.ticketNumber || generatedNum;
        newTicket.id = String(serverTicket.id || newTicket.id);
        newTicket.ticketNumber = ticketNum;
      }

      await fetchMyTickets();
    } catch (err: any) {
      // Handled in state
    } finally {
      setIsSubmitting(false);
      setMyTickets((prev) => [newTicket, ...prev]);

      Alert.alert(
        'Support Ticket Created',
        `Your ticket #${generatedNum} has been logged successfully!\n\nOur technical support team will review your inquiry and contact you at ${email.trim()} within 2 hours.`,
        [
          {
            text: 'View My Tickets',
            onPress: () => {
              setSubject('');
              setDescription('');
              setTicketTab('MY_TICKETS');
            },
          },
        ]
      );
    }
  };

  return (
    <View style={styles.container}>
      {currentView === 'TICKETS' ? (
        <HelpSupportTicketsView
          onBackToMain={() => setCurrentView('MAIN')}
          ticketTab={ticketTab}
          setTicketTab={setTicketTab}
          myTickets={myTickets}
          fullName={fullName}
          setFullName={setFullName}
          email={email}
          setEmail={setEmail}
          phone={phone}
          setPhone={setPhone}
          category={category}
          setCategory={setCategory}
          priority={priority}
          setPriority={setPriority}
          subject={subject}
          setSubject={setSubject}
          description={description}
          setDescription={setDescription}
          isSubmitting={isSubmitting}
          formError={formError}
          categoryOptions={CATEGORY_OPTIONS}
          onCreateTicket={handleCreateTicket}
          refreshing={refreshing}
          onRefresh={onRefresh}
          onOpenTicketChat={handleOpenTicketChat}
        />
      ) : (
        <>
          <Header
            title="Help & Support Center"
            subtitle="Knowledgebase, verified FAQs & support ticket desk"
            onBack={() => navigation.goBack()}
            hideRightActions={true}
          />

          <ScrollView
            style={styles.mainScrollContent}
            contentContainerStyle={[styles.mainScrollContentContainer, { paddingBottom: Math.max(insets.bottom + 24, 32) }]}
            showsVerticalScrollIndicator={false}
          >
            {/* SUPPORT DESK BANNER CARD */}
            <View style={styles.supportDeskBannerCard}>
              <View style={styles.bannerTitleIconRow}>
                <View style={styles.liveBadgeIconCircle}>
                  <Headphones size={20} color={COLORS.primary} />
                </View>
                <Text style={styles.bannerMainTitle}>How can we assist you today?</Text>
              </View>
              <Text style={styles.bannerSubDescription}>
                Search our knowledgebase below or log a priority ticket to connect directly with our Chhatrapati Sambhajinagar desk.
              </Text>

              <TouchableOpacity
                activeOpacity={0.85}
                style={styles.raiseTicketCtaBtn}
                onPress={() => {
                  setTicketTab('CREATE');
                  setCurrentView('TICKETS');
                }}
              >
                <MessageSquare size={16} color="#FFFFFF" />
                <Text style={styles.raiseTicketCtaBtnText}>Raise Support Ticket</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.sectionDividerSlate} />

            {/* FAQ KNOWLEDGEBASE SECTION */}
            <HelpSupportFaqSection
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              activeFAQCategory={activeFAQCategory}
              setActiveFAQCategory={setActiveFAQCategory}
            />

            <View style={styles.sectionDividerSlate} />

            {/* HELPLINE & EMAIL CONTACT SECTION */}
            <View style={styles.contactDetailsSectionCard}>
              <Text style={styles.contactSectionHeaderTitle}>Direct Assistance Channels</Text>
              <Text style={styles.contactSectionHeaderSub}>Reach out directly to our Chhatrapati Sambhajinagar operations desk</Text>

              <View style={styles.contactItemsGridRow}>
                <TouchableOpacity
                  activeOpacity={0.85}
                  style={styles.contactChannelItemCard}
                  onPress={() => Linking.openURL('tel:18002098800')}
                >
                  <View style={styles.contactIconPillCircle}>
                    <Phone size={18} color={COLORS.primary} />
                  </View>
                  <Text style={styles.contactChannelLabelText}>Toll-Free Helpline</Text>
                  <Text style={styles.contactChannelValueText}>1800-209-8800</Text>
                  <Text style={styles.contactChannelTimeText}>Mon-Sat (9 AM - 7 PM)</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  activeOpacity={0.85}
                  style={styles.contactChannelItemCard}
                  onPress={() => Linking.openURL('mailto:support@jobmarket.com')}
                >
                  <View style={styles.contactIconPillCircle}>
                    <Mail size={18} color={COLORS.primary} />
                  </View>
                  <Text style={styles.contactChannelLabelText}>Email Desk</Text>
                  <Text style={styles.contactChannelValueText}>support@jobmarket.com</Text>
                  <Text style={styles.contactChannelTimeText}>24/7 Inbox Response</Text>
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
        </>
      )}

      {/* TICKET CHAT MODAL */}
      <HelpSupportChatModal
        visible={!!selectedTicket}
        onClose={() => setSelectedTicket(null)}
        ticket={selectedTicket}
        chatMessages={chatMessages}
        replyMessage={replyMessage}
        setReplyMessage={setReplyMessage}
        sendingReply={sendingReply}
        selectedAttachment={selectedAttachment}
        onPickAttachment={handlePickAttachment}
        onRemoveAttachment={() => setSelectedAttachment(null)}
        onSendReply={handleSendReply}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  mainScrollContent: {
    flex: 1,
  },
  mainScrollContentContainer: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  supportDeskBannerCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    padding: 16,
  },
  bannerTitleIconRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 10,
  },
  liveBadgeIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bannerMainTitle: {
    flex: 1,
    fontSize: 17,
    fontWeight: '800',
    color: '#0F172A',
  },
  bannerSubDescription: {
    fontSize: 12.5,
    color: '#64748B',
    lineHeight: 18,
    marginBottom: 16,
  },
  raiseTicketCtaBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: COLORS.primary,
    paddingVertical: 12,
    borderRadius: 6,
  },
  raiseTicketCtaBtnText: {
    fontSize: 13.5,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  sectionDividerSlate: {
    height: 1,
    backgroundColor: '#94A3B8',
    marginVertical: 14,
  },
  contactDetailsSectionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    padding: 16,
  },
  contactSectionHeaderTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
  },
  contactSectionHeaderSub: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
    marginBottom: 14,
  },
  contactItemsGridRow: {
    flexDirection: 'row',
    gap: 12,
  },
  contactChannelItemCard: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 12,
    alignItems: 'center',
  },
  contactIconPillCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  contactChannelLabelText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748B',
  },
  contactChannelValueText: {
    fontSize: 12.5,
    fontWeight: '800',
    color: '#0F172A',
    marginTop: 2,
  },
  contactChannelTimeText: {
    fontSize: 10,
    color: '#94A3B8',
    marginTop: 2,
  },
});
