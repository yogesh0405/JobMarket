import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Linking,
  Platform,
  StatusBar,
  BackHandler,
  RefreshControl,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import {
  ArrowLeft,
  Mail,
  Phone,
  MessageSquare,
  Ticket,
  Plus,
  ChevronRight,
  Clock,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  MoreVertical,
  Send,
  Building2,
  Headphones,
  Globe,
} from 'lucide-react-native';
import { useAuth } from '../../hooks/useAuth';
import { apiFetch } from '../../api/client';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS } from '../../constants/theme';
import { SupportTicket, TicketMessage } from './components/HelpSupportConstants';
import { HelpSupportFaqSection } from './components/HelpSupportFaqSection';
import { HelpSupportTicketsView } from './components/HelpSupportTicketsView';
import { HelpSupportChatModal } from './components/HelpSupportChatModal';
import { Input } from '../../components/common/Input';
import { SelectDropdown } from '../../components/common/SelectDropdown';
import { Button } from '../../components/common/Button';
import { ErrorBanner } from '../../components/common/ErrorBanner';

interface Props {
  navigation: any;
}

export const HelpSupportScreen: React.FC<Props> = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const topInset = Math.max(insets.top || 0, Platform.OS === 'android' ? (StatusBar.currentHeight || 24) : 0);
  const { user } = useAuth();

  // 2 Primary Top Tabs: 'FAQ' | 'CONTACT'
  const [mainTab, setMainTab] = useState<'FAQ' | 'CONTACT'>('FAQ');

  // Help & Contact View: show 4 options menu vs detailed full-screen ticket manager
  const [showTicketManager, setShowTicketManager] = useState(false);

  // Contact Section Sub-Tab: 'CREATE' | 'MY_TICKETS'
  const [ticketSubTab, setTicketSubTab] = useState<'CREATE' | 'MY_TICKETS'>('CREATE');

  // FAQ Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFAQCategory, setActiveFAQCategory] = useState('General');

  // Support Ticket Form State
  const [fullName, setFullName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [category, setCategory] = useState('Job Application Inquiry');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Tickets List & Chat State
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
      const rawList = Array.isArray(res?.data)
        ? res.data
        : Array.isArray(res?.data?.tickets)
        ? res.data.tickets
        : Array.isArray(res?.tickets)
        ? res.tickets
        : [];

      if (rawList.length > 0) {
        const mapped: SupportTicket[] = rawList.map((item: any) => ({
          id: String(item.id || item._id),
          ticketNumber: item.ticket_number || item.ticketNumber || `TKT-${item.id}`,
          category: item.category || 'General Support',
          subject: item.subject || 'Support Inquiry',
          description: item.description || '',
          priority: (item.priority || 'medium').toLowerCase() as any,
          status: (item.status || 'OPEN').toUpperCase() as any,
          createdAt: item.created_at
            ? new Date(item.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
            : 'Recent',
        }));
        setMyTickets(mapped);
      } else if (res && res.success) {
        setMyTickets([]);
      }
    } catch (_) {
    } finally {
      setLoadingTickets(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchMyTickets();
  }, [fetchMyTickets]);

  // Back handler for chat modal and full-screen ticket view
  useEffect(() => {
    const handleBack = () => {
      if (selectedTicket) {
        setSelectedTicket(null);
        return true;
      }
      if (showTicketManager) {
        setShowTicketManager(false);
        return true;
      }
      return false;
    };

    const backSubscription = BackHandler.addEventListener('hardwareBackPress', handleBack);
    return () => backSubscription.remove();
  }, [showTicketManager, selectedTicket]);

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
              createdAt: m.created_at || m.createdAt || new Date().toISOString(),
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
      createdAt: new Date().toISOString(),
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
    } finally {
      setSendingReply(false);
    }
  };

  // Sync authenticated user details to support form state
  useEffect(() => {
    if (user?.name && !fullName) setFullName(user.name);
    if (user?.email && !email) setEmail(user.email);
    if (user?.phone && !phone) setPhone(user.phone);
  }, [user]);

  const handleCreateTicket = async () => {
    const finalFullName = fullName.trim() || user?.name || (user as any)?.fullName || 'JobMarket User';
    const finalEmail = email.trim() || user?.email || '';

    if (!finalFullName || !finalEmail || !subject.trim() || !description.trim()) {
      setFormError('Please fill out all required fields (*)');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(finalEmail)) {
      setFormError('Please provide a valid email address (e.g. user@example.com)');
      return;
    }

    // Clean phone number to 10 digits if provided
    let cleanedPhone: string | undefined = undefined;
    if (phone.trim()) {
      const digitsOnly = phone.replace(/[^0-9]/g, '');
      if (digitsOnly.length >= 10) {
        cleanedPhone = digitsOnly.slice(-10);
      } else {
        setFormError('Phone number must be at least 10 digits');
        return;
      }
    }

    setFormError(null);
    setIsSubmitting(true);

    try {
      const payload = {
        fullName: finalFullName,
        email: finalEmail,
        phone: cleanedPhone,
        category: category || 'Job Application Inquiry',
        subject: subject.trim(),
        description: description.trim(),
        preferredContact: 'email',
        priority: priority || 'medium',
      };

      const res = await apiFetch('/api/support/tickets', {
        method: 'POST',
        body: JSON.stringify(payload),
      });

      if (res && res.success && res.data) {
        const serverTicket = res.data;
        const ticketNum = serverTicket.ticket_number || serverTicket.ticketNumber || `TKT-${serverTicket.id}`;

        // Reset form inputs
        setSubject('');
        setDescription('');
        setFormError(null);

        // Immediately refresh tickets list from database
        await fetchMyTickets();

        // Switch to MY_TICKETS tab to see the created ticket
        setTicketSubTab('MY_TICKETS');

        Alert.alert(
          'Support Ticket Logged',
          `Your support ticket #${ticketNum} has been recorded successfully!\n\nOur technical desk will review your inquiry and email updates to ${finalEmail}.`,
          [{ text: 'OK' }]
        );
      } else {
        const errMsg = res?.message || res?.error || 'Failed to record support ticket. Please verify your details.';
        setFormError(errMsg);
        Alert.alert('Ticket Error', errMsg);
      }
    } catch (err: any) {
      const errMsg = err?.message || 'Unable to submit ticket. Please check your network connection or try again.';
      setFormError(errMsg);
      Alert.alert('Submission Error', errMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  // FULL SCREEN SUPPORT TICKET SECTION (Hides Help Center Header and Tabs)
  if (showTicketManager) {
    return (
      <View style={styles.container}>
        <HelpSupportTicketsView
          onBackToMain={() => setShowTicketManager(false)}
          ticketTab={ticketSubTab}
          setTicketTab={setTicketSubTab}
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
  }

  return (
    <View style={styles.container}>
      {/* Top Header Bar (Matching Reference Image - No 3 dots) */}
      <View style={[styles.topHeaderBar, { paddingTop: topInset + (Platform.OS === 'android' ? 10 : 8) }]}>
        <View style={styles.topHeaderNavRow}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            style={styles.backButton}
          >
            <ArrowLeft size={22} color="#0F172A" strokeWidth={2.4} />
          </TouchableOpacity>

          <Text style={styles.topHeaderTitle}>Help Center</Text>

          {/* Right empty spacer to keep title centered */}
          <View style={styles.backButton} />
        </View>

        {/* 2 Primary Top Tabs (FAQ vs Help & Contact) */}
        <View style={styles.tabBarContainer}>
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => setMainTab('FAQ')}
            style={[styles.tabButton, mainTab === 'FAQ' && styles.tabButtonActive]}
          >
            <Text style={[styles.tabButtonText, mainTab === 'FAQ' && styles.tabButtonTextActive]}>
              FAQ
            </Text>
            {mainTab === 'FAQ' && <View style={styles.tabIndicator} />}
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => setMainTab('CONTACT')}
            style={[styles.tabButton, mainTab === 'CONTACT' && styles.tabButtonActive]}
          >
            <Text style={[styles.tabButtonText, mainTab === 'CONTACT' && styles.tabButtonTextActive]}>
              Help & Contact
            </Text>
            {mainTab === 'CONTACT' && <View style={styles.tabIndicator} />}
          </TouchableOpacity>
        </View>
      </View>

      {/* Main Scroll Content */}
      <ScrollView
        style={styles.scrollArea}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: Math.max(insets.bottom + 24, 36) }]}
        showsVerticalScrollIndicator={false}
        refreshControl={
          mainTab === 'CONTACT' ? (
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[COLORS.primary]} />
          ) : undefined
        }
      >
        {mainTab === 'FAQ' ? (
          /* ── TAB 1: FAQ ACCORDION VIEW (Matching Reference Image) ── */
          <HelpSupportFaqSection
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            activeFAQCategory={activeFAQCategory}
            setActiveFAQCategory={setActiveFAQCategory}
          />
        ) : (
          /* ── TAB 2: HELP & CONTACT 4 OPTIONS VIEW (Matching Reference Image) ── */
          <View style={styles.contactOptionsList}>
            {/* Option 1: Support Ticket */}
            <TouchableOpacity
              activeOpacity={0.75}
              style={styles.contactOptionCard}
              onPress={() => {
                setTicketSubTab(myTickets.length > 0 ? 'MY_TICKETS' : 'CREATE');
                setShowTicketManager(true);
              }}
            >
              <View style={styles.contactOptionLeft}>
                <Headphones size={22} color="#0F172A" strokeWidth={2.2} />
                <Text style={styles.contactOptionTitle}>Support Ticket</Text>
              </View>
              {myTickets.length > 0 ? (
                <View style={styles.ticketCountBadge}>
                  <Text style={styles.ticketCountText}>{myTickets.length}</Text>
                </View>
              ) : (
                <ChevronRight size={18} color="#94A3B8" />
              )}
            </TouchableOpacity>

            {/* Option 2: Contact */}
            <TouchableOpacity
              activeOpacity={0.75}
              style={styles.contactOptionCard}
              onPress={() => Linking.openURL('tel:18002098800')}
            >
              <View style={styles.contactOptionLeft}>
                <Phone size={22} color="#0F172A" strokeWidth={2.2} />
                <Text style={styles.contactOptionTitle}>Contact</Text>
              </View>
              <ChevronRight size={18} color="#94A3B8" />
            </TouchableOpacity>

            {/* Option 3: Email */}
            <TouchableOpacity
              activeOpacity={0.75}
              style={styles.contactOptionCard}
              onPress={() => Linking.openURL('mailto:support@jobmarket.com')}
            >
              <View style={styles.contactOptionLeft}>
                <Mail size={22} color="#0F172A" strokeWidth={2.2} />
                <Text style={styles.contactOptionTitle}>Email</Text>
              </View>
              <ChevronRight size={18} color="#94A3B8" />
            </TouchableOpacity>

            {/* Option 4: Website */}
            <TouchableOpacity
              activeOpacity={0.75}
              style={styles.contactOptionCard}
              onPress={() => Linking.openURL('https://jobmarket.com')}
            >
              <View style={styles.contactOptionLeft}>
                <Globe size={22} color="#0F172A" strokeWidth={2.2} />
                <Text style={styles.contactOptionTitle}>Website</Text>
              </View>
              <ChevronRight size={18} color="#94A3B8" />
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>

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

  /* Top Navigation & Header */
  topHeaderBar: {
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  topHeaderNavRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  backButton: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  topHeaderTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: -0.3,
  },
  moreButton: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },

  /* Top Tab Bar (Matching Reference Image) */
  tabBarContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  tabButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  tabButtonActive: {},
  tabButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#64748B',
  },
  tabButtonTextActive: {
    color: '#0F172A',
    fontWeight: '800',
  },
  tabIndicator: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 2.5,
    backgroundColor: COLORS.primary,
    borderRadius: 2,
  },

  /* Scroll Area */
  scrollArea: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },

  /* 4 Contact Options List (Matching Reference Image) */
  contactOptionsList: {
    gap: 12,
    marginTop: 4,
  },
  contactOptionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingVertical: 18,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#0F172A',
    shadowOpacity: 0.02,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 3,
    elevation: 1,
  },
  contactOptionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  contactOptionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
    letterSpacing: -0.2,
  },
  ticketCountBadge: {
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  ticketCountText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#2563EB',
  },
  backToOptionsBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    alignSelf: 'flex-start',
    paddingVertical: 6,
    paddingHorizontal: 10,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 4,
  },
  backToOptionsText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
  },

  /* Contact Tab Styles */
  contactTabContainer: {
    gap: 16,
  },
  subSegmentContainer: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    padding: 4,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 6,
  },
  subSegmentBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 9,
    borderRadius: 8,
    gap: 6,
  },
  subSegmentBtnActive: {
    backgroundColor: '#0F172A',
  },
  subSegmentBtnText: {
    fontSize: 12.5,
    fontWeight: '600',
    color: '#64748B',
  },
  subSegmentBtnTextActive: {
    color: '#FFFFFF',
    fontWeight: '800',
  },

  /* Ticket Form Card */
  ticketFormCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 16,
    gap: 12,
    shadowColor: '#0F172A',
    shadowOpacity: 0.02,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 3,
    elevation: 1,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 4,
  },
  cardHeaderIconBox: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardHeaderTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
  },
  cardHeaderSubtitle: {
    fontSize: 11.5,
    color: '#64748B',
    marginTop: 1,
  },
  formFieldBlock: {
    gap: 6,
  },
  formFieldLabel: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#334155',
  },
  prioritySelectorRow: {
    flexDirection: 'row',
    gap: 8,
  },
  priorityPill: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    backgroundColor: '#F8FAFC',
    alignItems: 'center',
  },
  priorityPillLow: {
    backgroundColor: '#EFF6FF',
    borderColor: '#93C5FD',
  },
  priorityPillMed: {
    backgroundColor: '#FEF3C7',
    borderColor: '#FCD34D',
  },
  priorityPillHigh: {
    backgroundColor: '#FEF2F2',
    borderColor: '#FCA5A5',
  },
  priorityPillText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#64748B',
  },
  priorityPillTextActive: {
    color: '#0F172A',
    fontWeight: '800',
  },

  /* My Tickets List */
  myTicketsList: {
    gap: 10,
  },
  ticketItemCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 14,
    gap: 6,
    shadowColor: '#0F172A',
    shadowOpacity: 0.02,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 2,
    elevation: 1,
  },
  ticketItemTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  ticketNumberBadge: {
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  ticketNumberText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#2563EB',
  },
  ticketStatusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  ticketStatusOpen: {
    backgroundColor: '#FEF3C7',
  },
  ticketStatusResolved: {
    backgroundColor: '#DCFCE7',
  },
  ticketStatusText: {
    fontSize: 10.5,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  ticketStatusTextOpen: {
    color: '#B45309',
  },
  ticketStatusTextResolved: {
    color: '#15803D',
  },
  ticketItemSubjectText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
    marginTop: 2,
  },
  ticketItemDescText: {
    fontSize: 12.5,
    color: '#64748B',
    lineHeight: 17,
  },
  ticketItemFooterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 4,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  ticketCategoryPill: {
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  ticketCategoryPillText: {
    fontSize: 10.5,
    color: '#475569',
    fontWeight: '600',
  },
  ticketDateWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  ticketDateText: {
    fontSize: 11,
    color: '#94A3B8',
  },

  /* Empty Tickets State */
  emptyTicketsBox: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 36,
    paddingHorizontal: 20,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 6,
  },
  emptyTicketsTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
    marginTop: 6,
  },
  emptyTicketsSub: {
    fontSize: 12,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 18,
    maxWidth: 280,
  },
  emptyTicketsActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#2563EB',
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: 8,
    marginTop: 10,
  },
  emptyTicketsActionBtnText: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#FFFFFF',
  },

  /* Direct Contact Section */
  directContactSection: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 16,
  },
  directContactTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
  },
  directContactSubtitle: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
    marginBottom: 14,
  },
  contactGridRow: {
    flexDirection: 'row',
    gap: 10,
  },
  contactGridCard: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 12,
    alignItems: 'center',
  },
  contactCardIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  contactCardLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748B',
  },
  contactCardValue: {
    fontSize: 12,
    fontWeight: '800',
    color: '#0F172A',
    marginTop: 2,
  },
  contactCardTime: {
    fontSize: 10,
    color: '#94A3B8',
    marginTop: 2,
  },
});

