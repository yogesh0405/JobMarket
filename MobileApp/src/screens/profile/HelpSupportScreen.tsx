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
  Modal,
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
  const [loadingChatMessages, setLoadingChatMessages] = useState(false);
  const [replyMessage, setReplyMessage] = useState('');
  const [sendingReply, setSendingReply] = useState(false);
  const [selectedAttachment, setSelectedAttachment] = useState<{ uri: string; name: string; base64?: string } | null>(null);
  const [createTicketAttachment, setCreateTicketAttachment] = useState<{ uri: string; name: string; base64?: string } | null>(null);
  const [createdTicketSuccess, setCreatedTicketSuccess] = useState<{
    id: string;
    ticketNumber: string;
    category: string;
    subject: string;
    status: string;
  } | null>(null);

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
          userId: item.user_id || item.userId || undefined,
          fullName: item.full_name || item.fullName || undefined,
          category: item.category || 'General Support',
          subject: item.subject || 'Support Inquiry',
          description: item.description || '',
          attachment: item.attachment || item.attachment_url || undefined,
          priority: (item.priority || 'medium').toLowerCase() as any,
          status: (item.status || 'OPEN').toUpperCase() as any,
          createdAt: item.created_at
            ? new Date(item.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
            : 'Recent',
          rawCreatedAt: item.created_at || undefined,
          updatedAt: item.updated_at || item.updatedAt || undefined,
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

  const isMessageFromUser = (msg: any, ticketOwnerId?: string): boolean => {
    if (!msg) return false;
    const role = String(msg.sender_role || msg.senderRole || msg.role || '').toLowerCase();
    if (role === 'admin') return false;
    if (role === 'candidate' || role === 'employer') return true;

    const senderType = String(msg.sender || msg.sender_type || msg.senderType || '').toLowerCase();
    if (senderType === 'support' || senderType === 'admin' || senderType === 'agent' || senderType === 'system') return false;
    if (senderType === 'user' || senderType === 'candidate' || senderType === 'employer' || senderType === 'client') return true;

    const msgUserId = String(msg.userId || msg.user_id || msg.senderId || msg.sender_id || '');
    const currentUserId = String(user?.id || (user as any)?.user_id || '');
    if (msgUserId && currentUserId && msgUserId === currentUserId) return true;
    if (ticketOwnerId && msgUserId && msgUserId === String(ticketOwnerId)) return true;

    const senderEmail = String(msg.senderEmail || msg.sender_email || msg.email || '').toLowerCase();
    const currentEmail = String(user?.email || '').toLowerCase();
    if (senderEmail && currentEmail && senderEmail === currentEmail) return true;

    return false;
  };

  const fetchTicketMessages = useCallback(async (ticket: SupportTicket) => {
    try {
      const res = await apiFetch(`/api/support/tickets/${ticket.id}`);
      if (res && res.success && res.data) {
        if (res.data.ticket) {
          setSelectedTicket(prev => prev ? {
            ...prev,
            status: res.data.ticket.status || prev.status,
            updatedAt: res.data.ticket.updated_at || res.data.ticket.updatedAt || prev.updatedAt
          } : prev);
        }

        const initialMsg: TicketMessage = {
          id: `init-${ticket.id}`,
          sender: 'user',
          senderName: user?.name || ticket.fullName || 'You',
          text: ticket.description,
          attachment: ticket.attachment || (ticket as any).attachment_url || undefined,
          createdAt: res.data.ticket?.created_at || ticket.rawCreatedAt || ticket.createdAt || new Date().toISOString(),
        };

        const rawMsgs = res.data.messages || res.data.conversations || [];
        const mappedReplies: TicketMessage[] = Array.isArray(rawMsgs)
          ? rawMsgs.map((m: any, idx: number) => {
              const isUserMsg = isMessageFromUser(m, ticket.userId);
              return {
                id: String(m.id || `reply-${idx}`),
                sender: isUserMsg ? 'user' : 'support',
                senderName: isUserMsg ? (user?.name || 'You') : (m.sender_name || 'Support Team'),
                text: m.message || m.text || '',
                attachment: m.attachment || m.attachment_url || undefined,
                createdAt: m.created_at || m.createdAt || new Date().toISOString(),
              };
            })
          : [];

        // Always preserve initial problem statement at index 0 followed by all replies
        setChatMessages([initialMsg, ...mappedReplies]);
      }
    } catch (_) {}
  }, [user]);

  const handleOpenTicketChat = async (ticket: SupportTicket) => {
    setSelectedTicket(ticket);
    setLoadingChatMessages(true);
    setChatMessages([]);

    try {
      await fetchTicketMessages(ticket);
    } finally {
      setLoadingChatMessages(false);
    }
  };

  // Real-time polling while chat modal is open (every 3.5s)
  useEffect(() => {
    if (!selectedTicket) return;
    const interval = setInterval(() => {
      fetchTicketMessages(selectedTicket);
    }, 3500);
    return () => clearInterval(interval);
  }, [selectedTicket?.id, fetchTicketMessages]);

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
        const base64Data = asset.base64
          ? (asset.base64.startsWith('data:') ? asset.base64 : `data:image/jpeg;base64,${asset.base64}`)
          : undefined;

        setSelectedAttachment({
          uri: asset.uri,
          name: filename,
          base64: base64Data,
        });
      }
    } catch (_) {}
  };

  const handleSendReply = async () => {
    if (!replyMessage.trim() && !selectedAttachment) return;
    if (!selectedTicket) return;

    const messageText = replyMessage.trim();
    const sentAttachment = selectedAttachment;

    setSendingReply(true);

    const userMsg: TicketMessage = {
      id: `local-${Date.now()}`,
      sender: 'user',
      senderName: user?.name || 'You',
      text: messageText,
      attachment: sentAttachment?.uri || sentAttachment?.base64,
      createdAt: new Date().toISOString(),
    };

    setChatMessages((prev) => [...prev, userMsg]);
    setReplyMessage('');
    setSelectedAttachment(null);

    try {
      await apiFetch(`/api/support/tickets/${selectedTicket.id}/messages`, {
        method: 'POST',
        body: JSON.stringify({
          message: messageText || '📎 Attachment',
          attachment: sentAttachment?.base64 || sentAttachment?.uri,
          attachmentBase64: sentAttachment?.base64 || sentAttachment?.uri,
          attachmentName: sentAttachment?.name || 'attachment.jpg',
        }),
      });

      await fetchTicketMessages(selectedTicket);
    } catch (err: any) {
      console.error('Failed to send reply with attachment:', err);
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
    const finalFullName = user?.name || (user as any)?.fullName || fullName.trim() || 'JobMarket User';
    const finalEmail = user?.email || email.trim() || 'user@jobmarket.com';
    const userRawPhone = user?.phone || (user as any)?.mobile || phone.trim() || '';

    if (!subject.trim() || !description.trim()) {
      setFormError('Please enter a subject title and detailed explanation (*)');
      return;
    }

    let cleanedPhone: string | undefined = undefined;
    if (userRawPhone) {
      const digitsOnly = String(userRawPhone).replace(/[^0-9]/g, '');
      if (digitsOnly.length >= 10) {
        cleanedPhone = digitsOnly.slice(-10);
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
        attachment: createTicketAttachment?.base64 || createTicketAttachment?.uri,
        attachmentBase64: createTicketAttachment?.base64 || createTicketAttachment?.uri,
        attachmentName: createTicketAttachment?.name || 'attachment.jpg',
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
        setCreateTicketAttachment(null);
        setFormError(null);

        // Immediately refresh tickets list from database
        await fetchMyTickets();

        // Switch to MY_TICKETS tab to see the created ticket
        setTicketSubTab('MY_TICKETS');

        // Show our professional themed success confirmation modal
        setCreatedTicketSuccess({
          id: String(serverTicket.id),
          ticketNumber: ticketNum,
          category: serverTicket.category || category || 'Job Application Inquiry',
          subject: serverTicket.subject || subject,
          status: serverTicket.status || 'OPEN',
        });
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

  // 1. FULL SCREEN SUPPORT CHAT IN-APP PAGE (Active when ticket is selected)
  if (selectedTicket) {
    return (
      <View style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" translucent={false} />
        <HelpSupportChatModal
          visible={true}
          onClose={() => setSelectedTicket(null)}
          ticket={selectedTicket}
          chatMessages={chatMessages}
          loadingMessages={loadingChatMessages}
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

  // 2. FULL SCREEN SUPPORT TICKET MANAGER (Hides Help Center Header and Tabs)
  if (showTicketManager) {
    return (
      <View style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" translucent={false} />
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
          ticketAttachment={createTicketAttachment}
          setTicketAttachment={setCreateTicketAttachment}
          onCreateTicket={handleCreateTicket}
          refreshing={refreshing}
          onRefresh={onRefresh}
          onOpenTicketChat={handleOpenTicketChat}
        />

        {/* Attractive Professional Confirmation Modal */}
        <Modal
          visible={!!createdTicketSuccess}
          transparent
          animationType="fade"
          onRequestClose={() => setCreatedTicketSuccess(null)}
        >
          <View style={styles.confirmModalOverlay}>
            <View style={styles.confirmModalCard}>
              {/* Top Primary Blue Badge */}
              <View style={styles.confirmIconBadge}>
                <CheckCircle2 size={34} color={COLORS.primary} strokeWidth={2.4} />
              </View>

              <Text style={styles.confirmModalTitle}>Support Ticket Created</Text>
              <Text style={styles.confirmModalSub}>
                Your technical ticket has been logged and assigned to our desk.
              </Text>

              {/* Ticket Info Summary Box */}
              <View style={styles.confirmTicketSummaryBox}>
                <View style={styles.confirmSummaryRow}>
                  <Text style={styles.confirmSummaryLabel}>Ticket ID</Text>
                  <Text style={styles.confirmSummaryValHighlight}>#{createdTicketSuccess?.ticketNumber}</Text>
                </View>
                <View style={styles.confirmSummaryDivider} />
                <View style={styles.confirmSummaryRow}>
                  <Text style={styles.confirmSummaryLabel}>Category</Text>
                  <Text style={styles.confirmSummaryVal} numberOfLines={1}>{createdTicketSuccess?.category}</Text>
                </View>
                <View style={styles.confirmSummaryDivider} />
                <View style={styles.confirmSummaryRow}>
                  <Text style={styles.confirmSummaryLabel}>Status</Text>
                  <View style={styles.confirmStatusPill}>
                    <Text style={styles.confirmStatusText}>{createdTicketSuccess?.status || 'OPEN'}</Text>
                  </View>
                </View>
                <View style={styles.confirmSummaryDivider} />
                <View style={styles.confirmSummaryRow}>
                  <Text style={styles.confirmSummaryLabel}>Response Time</Text>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                    <Clock size={12} color="#64748B" />
                    <Text style={styles.confirmSummaryVal}>Within 2 Hours</Text>
                  </View>
                </View>
              </View>

              {/* Actions */}
              <TouchableOpacity
                activeOpacity={0.85}
                style={styles.confirmPrimaryBtn}
                onPress={() => {
                  const createdId = createdTicketSuccess?.id;
                  const found = myTickets.find((t) => String(t.id) === createdId) || {
                    id: createdId || '',
                    ticketNumber: createdTicketSuccess?.ticketNumber || '',
                    subject: createdTicketSuccess?.subject || '',
                    description: '',
                    category: createdTicketSuccess?.category || '',
                    status: createdTicketSuccess?.status || 'OPEN',
                    createdAt: 'Just now',
                  };
                  setCreatedTicketSuccess(null);
                  handleOpenTicketChat(found as any);
                }}
              >
                <Text style={styles.confirmPrimaryBtnText}>View Ticket Conversation</Text>
                <ChevronRight size={18} color="#FFFFFF" strokeWidth={2.4} />
              </TouchableOpacity>

              <TouchableOpacity
                activeOpacity={0.7}
                style={styles.confirmSecondaryBtn}
                onPress={() => setCreatedTicketSuccess(null)}
              >
                <Text style={styles.confirmSecondaryBtnText}>Done</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
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
                setTicketSubTab('MY_TICKETS');
                setShowTicketManager(true);
              }}
            >
              <View style={styles.contactOptionLeft}>
                <Headphones size={19} color="#0F172A" strokeWidth={2.2} />
                <Text style={styles.contactOptionTitle}>Support Ticket</Text>
              </View>
              {myTickets.length > 0 ? (
                <View style={styles.ticketCountBadge}>
                  <Text style={styles.ticketCountText}>{myTickets.length}</Text>
                </View>
              ) : (
                <ChevronRight size={16} color="#94A3B8" />
              )}
            </TouchableOpacity>

            {/* Option 2: Contact */}
            <TouchableOpacity
              activeOpacity={0.75}
              style={styles.contactOptionCard}
              onPress={() => Linking.openURL('tel:18002098800')}
            >
              <View style={styles.contactOptionLeft}>
                <Phone size={19} color="#0F172A" strokeWidth={2.2} />
                <Text style={styles.contactOptionTitle}>Contact</Text>
              </View>
              <ChevronRight size={16} color="#94A3B8" />
            </TouchableOpacity>

            {/* Option 3: Email */}
            <TouchableOpacity
              activeOpacity={0.75}
              style={styles.contactOptionCard}
              onPress={() => Linking.openURL('mailto:support@jobmarket.com')}
            >
              <View style={styles.contactOptionLeft}>
                <Mail size={19} color="#0F172A" strokeWidth={2.2} />
                <Text style={styles.contactOptionTitle}>Email</Text>
              </View>
              <ChevronRight size={16} color="#94A3B8" />
            </TouchableOpacity>

            {/* Option 4: Website */}
            <TouchableOpacity
              activeOpacity={0.75}
              style={styles.contactOptionCard}
              onPress={() => Linking.openURL('https://jobmarket-ongn.onrender.com')}
            >
              <View style={styles.contactOptionLeft}>
                <Globe size={19} color="#0F172A" strokeWidth={2.2} />
                <Text style={styles.contactOptionTitle}>Website</Text>
              </View>
              <ChevronRight size={16} color="#94A3B8" />
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

      {/* Attractive Professional Confirmation Modal */}
      <Modal
        visible={!!createdTicketSuccess}
        transparent
        animationType="fade"
        onRequestClose={() => setCreatedTicketSuccess(null)}
      >
        <View style={styles.confirmModalOverlay}>
          <View style={styles.confirmModalCard}>
            {/* Top Primary Blue Badge */}
            <View style={styles.confirmIconBadge}>
              <CheckCircle2 size={34} color={COLORS.primary} strokeWidth={2.4} />
            </View>

            <Text style={styles.confirmModalTitle}>Support Ticket Created</Text>
            <Text style={styles.confirmModalSub}>
              Your technical ticket has been logged and assigned to our desk.
            </Text>

            {/* Ticket Info Summary Box */}
            <View style={styles.confirmTicketSummaryBox}>
              <View style={styles.confirmSummaryRow}>
                <Text style={styles.confirmSummaryLabel}>Ticket ID</Text>
                <Text style={styles.confirmSummaryValHighlight}>#{createdTicketSuccess?.ticketNumber}</Text>
              </View>
              <View style={styles.confirmSummaryDivider} />
              <View style={styles.confirmSummaryRow}>
                <Text style={styles.confirmSummaryLabel}>Category</Text>
                <Text style={styles.confirmSummaryVal} numberOfLines={1}>{createdTicketSuccess?.category}</Text>
              </View>
              <View style={styles.confirmSummaryDivider} />
              <View style={styles.confirmSummaryRow}>
                <Text style={styles.confirmSummaryLabel}>Status</Text>
                <View style={styles.confirmStatusPill}>
                  <Text style={styles.confirmStatusText}>{createdTicketSuccess?.status || 'OPEN'}</Text>
                </View>
              </View>
              <View style={styles.confirmSummaryDivider} />
              <View style={styles.confirmSummaryRow}>
                <Text style={styles.confirmSummaryLabel}>Response Time</Text>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                  <Clock size={12} color="#64748B" />
                  <Text style={styles.confirmSummaryVal}>Within 2 Hours</Text>
                </View>
              </View>
            </View>

            {/* Actions */}
            <TouchableOpacity
              activeOpacity={0.85}
              style={styles.confirmPrimaryBtn}
              onPress={() => {
                const createdId = createdTicketSuccess?.id;
                const found = myTickets.find((t) => String(t.id) === createdId) || {
                  id: createdId || '',
                  ticketNumber: createdTicketSuccess?.ticketNumber || '',
                  subject: createdTicketSuccess?.subject || '',
                  description: '',
                  category: createdTicketSuccess?.category || '',
                  status: createdTicketSuccess?.status || 'OPEN',
                  createdAt: 'Just now',
                };
                setCreatedTicketSuccess(null);
                handleOpenTicketChat(found as any);
              }}
            >
              <Text style={styles.confirmPrimaryBtnText}>View Ticket Conversation</Text>
              <ChevronRight size={18} color="#FFFFFF" strokeWidth={2.4} />
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.7}
              style={styles.confirmSecondaryBtn}
              onPress={() => setCreatedTicketSuccess(null)}
            >
              <Text style={styles.confirmSecondaryBtnText}>Done</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  /* Attractive Themed Confirmation Modal */
  confirmModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  confirmModalCard: {
    width: '100%',
    maxWidth: 360,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.18,
    shadowRadius: 24,
    elevation: 8,
  },
  confirmIconBadge: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    borderWidth: 2,
    borderColor: '#DBEAFE',
  },
  confirmModalTitle: {
    fontSize: 19,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: -0.3,
    textAlign: 'center',
    marginBottom: 6,
  },
  confirmModalSub: {
    fontSize: 13,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 18,
  },
  confirmTicketSummaryBox: {
    width: '100%',
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 20,
  },
  confirmSummaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 6,
  },
  confirmSummaryLabel: {
    fontSize: 12.5,
    color: '#64748B',
    fontWeight: '500',
  },
  confirmSummaryVal: {
    fontSize: 12.5,
    fontWeight: '600',
    color: '#0F172A',
  },
  confirmSummaryValHighlight: {
    fontSize: 13,
    fontWeight: '800',
    color: COLORS.primary,
  },
  confirmSummaryDivider: {
    height: 1,
    backgroundColor: '#E2E8F0',
  },
  confirmStatusPill: {
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  confirmStatusText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.primary,
  },
  confirmPrimaryBtn: {
    width: '100%',
    height: 48,
    backgroundColor: COLORS.primary,
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 3,
  },
  confirmPrimaryBtnText: {
    fontSize: 14.5,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  confirmSecondaryBtn: {
    marginTop: 10,
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  confirmSecondaryBtnText: {
    fontSize: 13.5,
    fontWeight: '600',
    color: '#64748B',
  },

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
    gap: 10,
    marginTop: 4,
  },
  contactOptionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingVertical: 14,
    paddingHorizontal: 16,
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
    gap: 14,
  },
  contactOptionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0F172A',
    letterSpacing: -0.1,
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

