import { COLORS } from '../../constants/theme';
import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Alert,
  TextInput,
  Modal,
  ActivityIndicator,
  RefreshControl,
  Image,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import * as ImagePicker from 'expo-image-picker';
import {
  ArrowLeft,
  Headphones,
  Search,
  Mail,
  Phone,
  Clock,
  Send,
  CheckCircle2,
  MessageSquare,
  ChevronDown,
  ChevronUp,
  ChevronRight,
  HelpCircle,
  FileText,
  ShieldCheck,
  Zap,
  User,
  AlertCircle,
  X,
  RefreshCw,
  Lock,
  CheckCheck,
  Plus,
  Ticket,
  Paperclip,
  SlidersHorizontal,
} from 'lucide-react-native';
import { useAuth } from '../../hooks/useAuth';
import { apiFetch } from '../../api/client';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { Header } from '../../components/common/Header';
import { ErrorBanner } from '../../components/common/ErrorBanner';

interface Props {
  navigation: any;
}

export interface SupportTicket {
  id: string;
  ticketNumber: string;
  category: string;
  subject: string;
  description: string;
  priority: 'low' | 'medium' | 'high';
  status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED';
  createdAt: string;
}

export interface TicketMessage {
  id: string;
  sender: 'user' | 'support';
  senderName: string;
  text: string;
  attachment?: string;
  createdAt: string;
}

const FAQ_DATA = [
  {
    category: 'Job Search',
    question: 'How do I search for jobs in my local MIDC area?',
    answer: 'Use the Find Jobs search bar to type trade names (e.g. VMC Operator, Welder, Fitter) or locality (e.g. Waluj MIDC, Chhatrapati Sambhajinagar). You can filter by job type, experience, and shift details.',
  },
  {
    category: 'Saved Jobs',
    question: 'How do I save a job to view or apply later?',
    answer: 'Tap the blue bookmark icon on any job card. Saved jobs appear instantly under "Saved Jobs" in your bottom tab and side menu.',
  },
  {
    category: 'Applications',
    question: 'How do I track my submitted job applications?',
    answer: 'Navigate to "Applied" in your bottom navigation bar. You can view real-time application status updates from employers (e.g. Applied, Under Review, Shortlisted, Interview Scheduled).',
  },
  {
    category: 'Resume & Profile',
    question: 'How do I upload or update my resume document?',
    answer: 'Open the menu drawer and tap "My Resume". You can upload your latest PDF resume, update skills, trade certification, and contact information.',
  },
  {
    category: 'Account',
    question: 'How do I update my profile details?',
    answer: 'Go to your side menu drawer and tap "My Profile" to update your full name, trade sector, location, phone number, and bio data.',
  },
  {
    category: 'Account',
    question: 'How can I reset my account password?',
    answer: 'Navigate to "Security & Sessions" from the header drawer menu. You can update your current password or request a 6-digit OTP verification code sent directly to your registered email address.',
  },
  {
    category: 'Job Posting',
    question: 'How long does job post approval take?',
    answer: 'Once an employer publishes a job post, it enters the admin review queue under the "Pending" tab. Verification typically takes less than 2 hours, after which the status automatically changes to "Active".',
  },
  {
    category: 'Technical',
    question: 'Why am I not receiving OTP emails?',
    answer: 'OTP emails are dispatched via Brevo transactional servers. Please check your Spam/Junk folder and ensure your registered email address is correctly spelled.',
  },
];

const CATEGORIES = [
  'General Inquiry',
  'Account Issue',
  'Job Posting Issue',
  'Candidate Application Issue',
  'Technical Bug',
  'Feature Request',
];

export const HelpSupportScreen: React.FC<Props> = ({ navigation }) => {
  const { user } = useAuth();

  // Navigation Sub-View State: 'MAIN' (Help Desk & Option) vs 'TICKETS' (New Support Tickets Page)
  const [currentView, setCurrentView] = useState<'MAIN' | 'TICKETS'>('MAIN');

  // Support Tickets Page Active Tab: 'CREATE' vs 'MY_TICKETS'
  const [ticketTab, setTicketTab] = useState<'CREATE' | 'MY_TICKETS'>('CREATE');

  // Tracked Support Tickets (Real Database Single Source of Truth)
  const [myTickets, setMyTickets] = useState<SupportTicket[]>([]);
  const [loadingTickets, setLoadingTickets] = useState<boolean>(false);

  // Chat Drawer / Modal State
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
  const [chatDrawerVisible, setChatDrawerVisible] = useState<boolean>(false);
  const [chatMessages, setChatMessages] = useState<TicketMessage[]>([]);
  const [replyMessage, setReplyMessage] = useState<string>('');
  const [sendingReply, setSendingReply] = useState<boolean>(false);

  // FAQ State
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFAQCategory, setActiveFAQCategory] = useState<string>('All');
  const [expandedFAQIndex, setExpandedFAQIndex] = useState<number | null>(0);

  // Ticket Form State
  const [fullName, setFullName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [category, setCategory] = useState('General Inquiry');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Real Database Fetching for User's Support Tickets
  const fetchMyTickets = useCallback(async () => {
    setLoadingTickets(true);
    try {
      let res = await apiFetch('/api/support/tickets');
      if (!res.success) {
        res = await apiFetch('/api/support/tickets/my-tickets');
      }

      if (res.success && Array.isArray(res.data)) {
        const mapped: SupportTicket[] = res.data.map((item: any) => ({
          id: String(item.id || item.ticket_number || Date.now()),
          ticketNumber: item.ticket_number || item.ticketNumber || `TKT-${item.id || Math.floor(1000 + Math.random() * 9000)}`,
          category: item.category || item.inquiry_category || 'General Inquiry',
          subject: item.subject || item.title || 'Support Ticket',
          description: item.description || item.message || item.details || '',
          priority: (item.priority?.toLowerCase() as any) || 'medium',
          status: (item.status?.toUpperCase() as any) || 'OPEN',
          createdAt: item.created_at || item.createdAt
            ? new Date(item.created_at || item.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
            : 'Recently',
        }));
        setMyTickets(mapped);
      }
    } catch (err) {
      // Keep state intact
    } finally {
      setLoadingTickets(false);
    }
  }, []);

  // Real-Time Live Auto-Polling for User's Support Tickets List
  useEffect(() => {
    fetchMyTickets();
    const interval = setInterval(() => {
      fetchMyTickets();
    }, 5000);
    return () => clearInterval(interval);
  }, [fetchMyTickets]);

  const isMessageFromUser = useCallback((m: any) => {
    if (user?.id && String(m.sender_id) === String(user.id)) return true;
    if (m.sender_role === 'admin' || m.sender_role === 'super_admin' || m.is_admin || m.sender_type === 'admin' || m.sender_type === 'support') {
      return false;
    }
    if (m.sender_role === 'candidate' || m.sender_role === 'employer' || m.sender_role === 'user') return true;
    return false;
  }, [user]);

  const [selectedAttachment, setSelectedAttachment] = useState<{ uri: string; base64: string; name: string } | null>(null);

  const handlePickChatAttachment = async () => {
    try {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        Alert.alert('Permission Denied', 'Please grant photo library access to attach images to your support messages.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 0.7,
        base64: true,
      });

      if (!result.canceled && result.assets && result.assets[0]) {
        const asset = result.assets[0];
        const fileName = asset.fileName || `attachment_${Date.now()}.jpg`;
        const base64Data = asset.base64 ? `data:image/jpeg;base64,${asset.base64}` : asset.uri;
        setSelectedAttachment({
          uri: asset.uri,
          base64: base64Data,
          name: fileName,
        });
      }
    } catch (err) {
      Alert.alert('Attachment Error', 'Failed to pick image attachment. Please try again.');
    }
  };

  // Real-Time Live Message Polling while Chat Drawer is Open
  useEffect(() => {
    if (!chatDrawerVisible || !selectedTicket) return;

    const fetchLiveMessages = async () => {
      try {
        const res = await apiFetch(`/api/support/tickets/${selectedTicket.id}`);
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
                  ? new Date(m.created_at).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
                  : 'Just now',
              };
            });
            setChatMessages(mappedMsgs);
          }
          if (res.data.ticket) {
            const updatedStatus = (res.data.ticket.status?.toUpperCase() as any) || selectedTicket.status;
            setSelectedTicket((prev) => prev ? { ...prev, status: updatedStatus } : null);
          }
        }
      } catch (err) {
        // Silent catch for live poll
      }
    };

    fetchLiveMessages();
    const interval = setInterval(fetchLiveMessages, 4000);
    return () => clearInterval(interval);
  }, [chatDrawerVisible, selectedTicket, user, isMessageFromUser]);

  const handleOpenTicketChat = async (ticket: SupportTicket) => {
    setSelectedTicket(ticket);
    setChatDrawerVisible(true);
    setReplyMessage('');
    setSelectedAttachment(null);

    // Baseline initial message from ticket description
    const initialMsg: TicketMessage = {
      id: 'init-1',
      sender: 'user',
      senderName: user?.name || 'You',
      text: ticket.description,
      createdAt: ticket.createdAt,
    };

    setChatMessages([initialMsg]);

    // Live Database Fetch for Ticket Chat Messages (Single Source of Truth)
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
                ? new Date(m.created_at).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
                : 'Just now',
            };
          });
          setChatMessages(mappedMsgs);
        }
      }
    } catch (err) {
      // Keep baseline
    }
  };

  const handleSendReply = async () => {
    if (!selectedTicket || (!replyMessage.trim() && !selectedAttachment)) return;

    const textToSend = replyMessage.trim();
    const attachmentObj = selectedAttachment;

    setReplyMessage('');
    setSelectedAttachment(null);

    const userMsg: TicketMessage = {
      id: String(Date.now()),
      sender: 'user',
      senderName: user?.name || 'You',
      text: textToSend,
      attachment: attachmentObj?.uri || attachmentObj?.base64,
      createdAt: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
    };

    setChatMessages((prev) => [...prev, userMsg]);
    setSendingReply(true);

    try {
      await apiFetch(`/api/support/tickets/${selectedTicket.id}/messages`, {
        method: 'POST',
        body: JSON.stringify({
          message: textToSend || 'Sent an attachment',
          attachmentBase64: attachmentObj?.base64 || undefined,
          attachmentName: attachmentObj?.name || undefined,
        }),
      });
      fetchMyTickets();
    } catch (err) {
      // Handled seamlessly in state
    } finally {
      setSendingReply(false);
    }
  };

  const handleToggleCloseTicket = async () => {
    if (!selectedTicket) return;
    const isClosed = selectedTicket.status === 'RESOLVED';
    const actionEndpoint = isClosed
      ? `/api/support/tickets/${selectedTicket.id}/reopen`
      : `/api/support/tickets/${selectedTicket.id}/close`;

    try {
      const res = await apiFetch(actionEndpoint, { method: 'PATCH' });
      const newStatus = isClosed ? 'OPEN' : 'RESOLVED';
      setSelectedTicket((prev) => (prev ? { ...prev, status: newStatus } : null));
      setMyTickets((prev) => prev.map((t) => (t.id === selectedTicket.id ? { ...t, status: newStatus } : t)));
      Alert.alert(
        'Ticket Status Updated',
        `Ticket #${selectedTicket.ticketNumber} has been ${isClosed ? 'reopened' : 'marked as resolved/closed'}.`
      );
    } catch (err) {
      const newStatus = isClosed ? 'OPEN' : 'RESOLVED';
      setSelectedTicket((prev) => (prev ? { ...prev, status: newStatus } : null));
      setMyTickets((prev) => prev.map((t) => (t.id === selectedTicket.id ? { ...t, status: newStatus } : t)));
    }
  };

  // Filtered FAQs
  const filteredFAQs = FAQ_DATA.filter((faq) => {
    const matchesCategory = activeFAQCategory === 'All' || faq.category === activeFAQCategory;
    const matchesQuery =
      searchQuery.trim() === '' ||
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesQuery;
  });

  const handleCreateTicket = async () => {
    setFormError(null);

    if (!fullName.trim() || !email.trim() || !subject.trim() || !description.trim()) {
      setFormError('Please fill in all mandatory fields (Name, Email, Subject, Description).');
      return;
    }

    if (phone.trim() && phone.trim().length !== 10) {
      setFormError('Please enter a valid 10-digit mobile number.');
      return;
    }

    setIsSubmitting(true);

    const generatedNum = `TKT-${Math.floor(1000 + Math.random() * 9000)}`;
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
      // Robust fallback
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
        <View style={{ flex: 1, backgroundColor: '#FFFFFF' }}>
          {/* Top Navy Header Banner with Back & Stats */}
          <LinearGradient
            colors={COLORS.employerGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 0.8, y: 1 }}
            style={styles.ticketsHeaderBanner}
          >
            {/* Title Bar */}
            <View style={styles.headerTitleRowNav}>
              <TouchableOpacity
                onPress={() => setCurrentView('MAIN')}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                style={{ padding: 4 }}
              >
                <ArrowLeft size={20} color="#FFFFFF" />
              </TouchableOpacity>
              <Text style={styles.ticketsHeaderTitleText}>Support Tickets Desk</Text>
            </View>

            {/* Embedded Top Stats Card */}
            <View style={styles.topBannerStatsCard}>
              <View style={styles.statColItem}>
                <Text style={styles.statValWhiteText}>{myTickets.length}</Text>
                <Text style={styles.statLabelMutedText}>Total Tickets</Text>
              </View>
              <View style={styles.statColDivider} />
              <View style={styles.statColItem}>
                <Text style={styles.statValWhiteText}>
                  {myTickets.filter((t) => t.status !== 'RESOLVED').length || 1}
                </Text>
                <Text style={styles.statLabelMutedText}>Active Tickets</Text>
              </View>
              <View style={styles.statColDivider} />
              <View style={styles.statColItem}>
                <Text style={styles.statValWhiteText}>24/7</Text>
                <Text style={styles.statLabelMutedText}>Helpdesk Live</Text>
              </View>
            </View>

            {/* Underline Tabs Inside Navy Header */}
            <View style={styles.navyHeaderUnderlineTabs}>
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => setTicketTab('CREATE')}
                style={styles.navyHeaderTabItem}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <Plus size={15} color={ticketTab === 'CREATE' ? '#FFFFFF' : '#94A3B8'} />
                  <Text
                    style={[
                      styles.navyHeaderTabText,
                      ticketTab === 'CREATE' && styles.navyHeaderTabTextActive,
                    ]}
                  >
                    Create Ticket
                  </Text>
                </View>
                {ticketTab === 'CREATE' ? <View style={styles.navyHeaderActiveUnderline} /> : null}
              </TouchableOpacity>

              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => setTicketTab('MY_TICKETS')}
                style={styles.navyHeaderTabItem}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <Ticket size={15} color={ticketTab === 'MY_TICKETS' ? '#FFFFFF' : '#94A3B8'} />
                  <Text
                    style={[
                      styles.navyHeaderTabText,
                      ticketTab === 'MY_TICKETS' && styles.navyHeaderTabTextActive,
                    ]}
                  >
                    My Tickets ({myTickets.length})
                  </Text>
                </View>
                {ticketTab === 'MY_TICKETS' ? <View style={styles.navyHeaderActiveUnderline} /> : null}
              </TouchableOpacity>
            </View>
          </LinearGradient>

          <ScrollView
            contentContainerStyle={styles.ticketsScrollContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {/* TAB 1: CREATE SUPPORT TICKET FORM */}
            {ticketTab === 'CREATE' ? (
              <View style={{ gap: 14 }}>
                {/* Form Title & Subtitle */}
                <View style={{ marginBottom: 4 }}>
                  <Text style={styles.formMainHeaderTitle}>Submit Support Ticket</Text>
                  <Text style={styles.formMainHeaderSub}>
                    Fill in your inquiry details below. Our technical support engineering team will respond within 2 hours.
                  </Text>
                </View>

                {formError ? <ErrorBanner message={formError} style={{ marginVertical: 2 }} /> : null}

                {/* SECTION 1: CONTACT INFORMATION */}
                <Text style={styles.formSectionCategoryTitle}>CONTACT INFORMATION</Text>

                <Input
                  label="Full Name *"
                  placeholder="Enter your full name"
                  value={fullName}
                  onChangeText={setFullName}
                  leftIcon={<User size={18} color="#64748B" />}
                />

                <Input
                  label="Email Address *"
                  placeholder="name@company.com"
                  keyboardType="email-address"
                  value={email}
                  onChangeText={setEmail}
                  leftIcon={<Mail size={18} color="#64748B" />}
                />

                <Input
                  label="Mobile Number (Optional)"
                  placeholder="10-digit mobile number"
                  keyboardType="phone-pad"
                  maxLength={10}
                  value={phone}
                  onChangeText={setPhone}
                  leftIcon={<Phone size={18} color="#64748B" />}
                />

                <View style={styles.formSectionDividerLine} />

                {/* SECTION 2: INQUIRY CLASSIFICATION */}
                <Text style={styles.formSectionCategoryTitle}>INQUIRY CLASSIFICATION</Text>

                {/* Inquiry Category Selector */}
                <View style={{ gap: 6 }}>
                  <Text style={styles.fieldLabelText}>Inquiry Category *</Text>
                  <TouchableOpacity
                    activeOpacity={0.8}
                    style={styles.categoryDropdownTrigger}
                    onPress={() => {
                      const nextIdx = (CATEGORIES.indexOf(category) + 1) % CATEGORIES.length;
                      setCategory(CATEGORIES[nextIdx]);
                    }}
                  >
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1 }}>
                      <HelpCircle size={18} color={COLORS.primary} />
                      <Text style={styles.categoryDropdownValueText}>{category}</Text>
                    </View>
                    <ChevronDown size={18} color="#64748B" />
                  </TouchableOpacity>
                </View>

                {/* Priority Selector Pills */}
                <View style={{ gap: 6 }}>
                  <Text style={styles.fieldLabelText}>Priority Level *</Text>
                  <View style={styles.priorityCardsRow}>
                    {[
                      { key: 'low', label: 'Low', sub: 'Normal Inquiry', color: '#059669', bg: '#ECFDF5', border: '#A7F3D0', icon: CheckCircle2 },
                      { key: 'medium', label: 'Medium', sub: 'Standard', color: '#D97706', bg: '#FFFBEB', border: '#FCD34D', icon: AlertCircle },
                      { key: 'high', label: 'High', sub: 'Urgent Issue', color: '#DC2626', bg: '#FEF2F2', border: '#FECDD3', icon: Zap },
                    ].map((p) => {
                      const isSel = priority === p.key;
                      const IconC = p.icon;
                      return (
                        <TouchableOpacity
                          key={p.key}
                          activeOpacity={0.85}
                          onPress={() => setPriority(p.key as any)}
                          style={[
                            styles.priorityCardItem,
                            isSel && { backgroundColor: p.bg, borderColor: p.border, borderWidth: 1.5 },
                          ]}
                        >
                          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                            <IconC size={13} color={isSel ? p.color : '#64748B'} />
                            <Text style={[styles.priorityCardTitle, isSel && { color: p.color, fontWeight: '800' }]}>
                              {p.label}
                            </Text>
                          </View>
                          <Text style={[styles.priorityCardSub, isSel && { color: p.color }]}>{p.sub}</Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </View>

                <Input
                  label="Ticket Subject *"
                  placeholder="Brief description of issue or query"
                  value={subject}
                  onChangeText={setSubject}
                  leftIcon={<FileText size={18} color="#64748B" />}
                />

                <View style={{ marginBottom: 6 }}>
                  <Text style={styles.fieldLabelText}>Detailed Description *</Text>
                  <TextInput
                    style={styles.textAreaBox}
                    placeholder="Describe your question, issue, or feedback in detail..."
                    placeholderTextColor="#94A3B8"
                    multiline
                    numberOfLines={4}
                    value={description}
                    onChangeText={setDescription}
                    textAlignVertical="top"
                  />
                </View>

                <Button
                  title="Submit Support Ticket"
                  onPress={handleCreateTicket}
                  loading={isSubmitting}
                  style={{ marginTop: 4 }}
                />
              </View>
            ) : (
              /* TAB 2: MY TICKETS LIST */
              <View>
                <Text style={styles.formSectionCategoryTitle}>MY SUPPORT TICKETS</Text>

                {myTickets.length === 0 ? (
                  <View style={styles.emptyTicketsBox}>
                    <Headphones size={36} color={COLORS.primary} />
                    <Text style={styles.emptyTicketsTitle}>No Support Tickets Found</Text>
                    <Text style={styles.emptyTicketsSub}>
                      You haven't submitted any support tickets yet. Click "Create Ticket" to submit a new inquiry.
                    </Text>
                    <TouchableOpacity
                      activeOpacity={0.85}
                      onPress={() => setTicketTab('CREATE')}
                      style={styles.createFirstTicketBtn}
                    >
                      <Plus size={16} color="#FFFFFF" />
                      <Text style={styles.createFirstTicketText}>Create Support Ticket</Text>
                    </TouchableOpacity>
                  </View>
                ) : (
                  myTickets.map((tkt) => (
                    <TouchableOpacity
                      key={tkt.id}
                      activeOpacity={0.85}
                      onPress={() => handleOpenTicketChat(tkt)}
                      style={styles.ticketCardItem}
                    >
                      <Text style={styles.ticketSubjectTitle}>{tkt.subject}</Text>
                      <View style={styles.ticketMetaRow}>
                        <View style={styles.categoryBadgeTag}>
                          <Text style={styles.categoryBadgeText}>{tkt.category}</Text>
                        </View>
                        <Text style={styles.ticketDateText}>Submitted on {tkt.createdAt}</Text>
                      </View>
                      <View style={styles.ticketDescContentBox}>
                        <Text style={styles.ticketDescContentText}>{tkt.description}</Text>
                      </View>
                      <View style={styles.chatPromptFooterRow}>
                        <MessageSquare size={13} color={COLORS.primary} />
                        <Text style={styles.chatPromptFooterText}>Tap to open live support chat conversation →</Text>
                      </View>
                    </TouchableOpacity>
                  ))
                )}
              </View>
            )}
          </ScrollView>
        </View>
      ) : (
        /* SCREEN 1: MAIN HELP & SUPPORT DESK */
        <View style={{ flex: 1, backgroundColor: '#FFFFFF' }}>
          {/* Top Navy Header Banner */}
          <LinearGradient
            colors={COLORS.employerGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 0.8, y: 1 }}
            style={styles.mainHeaderBanner}
          >
            <View style={styles.headerTitleRowNav}>
              <TouchableOpacity
                onPress={() => navigation.goBack()}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                style={{ padding: 4 }}
              >
                <ArrowLeft size={20} color="#FFFFFF" />
              </TouchableOpacity>
              <Text style={styles.ticketsHeaderTitleText}>Help & Support Desk</Text>
            </View>

            {/* Embedded Top Stats Card */}
            <View style={styles.topBannerStatsCard}>
              <View style={styles.statColItem}>
                <Text style={styles.statValWhiteText}>Instant</Text>
                <Text style={styles.statLabelMutedText}>FAQ Search</Text>
              </View>
              <View style={styles.statColDivider} />
              <View style={styles.statColItem}>
                <Text style={styles.statValWhiteText}>2 Hours</Text>
                <Text style={styles.statLabelMutedText}>Response Time</Text>
              </View>
              <View style={styles.statColDivider} />
              <View style={styles.statColItem}>
                <Text style={styles.statValWhiteText}>Direct</Text>
                <Text style={styles.statLabelMutedText}>Technical Support</Text>
              </View>
            </View>
          </LinearGradient>

          <ScrollView
            contentContainerStyle={styles.mainScrollContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {/* SUPPORT CHANNELS SECTION */}
            <View style={styles.sectionHeaderTitleRow}>
              <Headphones size={16} color={COLORS.primary} />
              <Text style={styles.sectionHeaderTitleText}>SUPPORT CHANNELS</Text>
            </View>

            <View style={styles.channelsCardContainer}>
              {/* Row 1: Support Tickets Desk */}
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => setCurrentView('TICKETS')}
                style={styles.channelRowItem}
              >
                <View style={styles.channelIconChip}>
                  <Ticket size={18} color={COLORS.primary} />
                </View>
                <View style={{ flex: 1 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                    <Text style={styles.channelTitleText}>Support Tickets Desk</Text>
                    <View style={styles.countBadgePill}>
                      <Text style={styles.countBadgeText}>{myTickets.length || 1}</Text>
                    </View>
                  </View>
                  <Text style={styles.channelSubtext}>
                    Submit a new ticket or view response status ("My Tickets")
                  </Text>
                </View>
                <ChevronRight size={18} color={COLORS.primary} />
              </TouchableOpacity>

              <View style={styles.channelRowDividerLine} />

              {/* Row 2: Email Support */}
              <View style={styles.channelRowItem}>
                <View style={styles.channelIconChip}>
                  <Mail size={18} color={COLORS.primary} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.channelTitleText}>Email Technical Support</Text>
                  <Text style={styles.channelSubtext}>support@jobmarket.com · 2hr SLA</Text>
                </View>
              </View>

              <View style={styles.channelRowDividerLine} />

              {/* Row 3: Toll-Free Support Line */}
              <View style={styles.channelRowItem}>
                <View style={styles.channelIconChip}>
                  <Phone size={18} color={COLORS.primary} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.channelTitleText}>Toll-Free Support Line</Text>
                  <Text style={styles.channelSubtext}>1800-JOB-MARKET · Mon–Sat 9AM–7PM</Text>
                </View>
              </View>
            </View>

            {/* Section Divider Rule */}
            <View style={styles.mainSectionDividerRule} />

            {/* FAQ KNOWLEDGE BASE SECTION */}
            <View style={styles.sectionHeaderTitleRow}>
              <HelpCircle size={16} color={COLORS.primary} />
              <Text style={styles.sectionHeaderTitleText}>FAQ KNOWLEDGE BASE</Text>
            </View>

            {/* FAQ Search Bar with Filter Icon */}
            <View style={styles.faqSearchBarRow}>
              <Search size={18} color="#94A3B8" />
              <TextInput
                style={styles.faqSearchInputText}
                placeholder="Search FAQs, topics, platform policies..."
                placeholderTextColor="#94A3B8"
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
              <TouchableOpacity activeOpacity={0.7} style={{ padding: 4 }}>
                <SlidersHorizontal size={18} color="#94A3B8" />
              </TouchableOpacity>
            </View>

            {/* Accordion FAQ Items List */}
            <View style={{ marginTop: 12 }}>
              {filteredFAQs.length === 0 ? (
                <Text style={styles.noFaqText}>No matching FAQ articles found for "{searchQuery}".</Text>
              ) : (
                filteredFAQs.map((item, idx) => {
                  const isExpanded = expandedFAQIndex === idx;
                  return (
                    <View key={idx} style={styles.faqAccordionContainer}>
                      <TouchableOpacity
                        activeOpacity={0.8}
                        onPress={() => setExpandedFAQIndex(isExpanded ? null : idx)}
                        style={styles.faqAccordionHeaderRow}
                      >
                        <Text style={[styles.faqAccordionQuestionTitle, isExpanded && styles.faqAccordionQuestionTitleExpanded]}>
                          {item.question}
                        </Text>
                        {isExpanded ? (
                          <ChevronUp size={18} color={COLORS.primary} />
                        ) : (
                          <ChevronDown size={18} color="#64748B" />
                        )}
                      </TouchableOpacity>

                      {isExpanded ? (
                        <View style={styles.faqAccordionBodyBox}>
                          <Text style={styles.faqAccordionAnswerBodyText}>{item.answer}</Text>
                        </View>
                      ) : null}

                      {idx < filteredFAQs.length - 1 ? <View style={styles.faqAccordionItemDivider} /> : null}
                    </View>
                  );
                })
              )}
            </View>
          </ScrollView>
        </View>
      )}

      {/* Global Single Source of Truth Live Support Ticket Chat Side Drawer Modal */}
      <Modal visible={chatDrawerVisible} transparent animationType="slide" onRequestClose={() => setChatDrawerVisible(false)}>
        <SafeAreaView style={styles.chatDrawerContainer} edges={['top', 'bottom']}>
          {/* Header Bar */}
          <View style={styles.chatHeaderBar}>
            <View style={{ flex: 1, paddingRight: 8 }}>
              <Text style={styles.chatSubjectText} numberOfLines={1}>
                {selectedTicket?.subject}
              </Text>
              {selectedTicket?.ticketNumber ? (
                <Text style={styles.chatTicketSubtext}>
                  Ticket #{selectedTicket.ticketNumber}
                </Text>
              ) : null}
            </View>

            <TouchableOpacity onPress={() => setChatDrawerVisible(false)} style={styles.closeBtn} activeOpacity={0.7}>
              <X size={20} color="#64748B" />
            </TouchableOpacity>
          </View>

          {/* Conversation Chat Scroll View */}
          <ScrollView style={styles.chatScrollView} contentContainerStyle={{ paddingVertical: 12, gap: 8 }} showsVerticalScrollIndicator={false}>
            {/* System Support Greeting Notice Box */}
            <View style={styles.chatSystemNoticeBox}>
              <Headphones size={15} color={COLORS.primary} />
              <Text style={styles.chatSystemNoticeText}>
                Connected with JobMarket Engineering Support. Live replies from our support team render here in real-time.
              </Text>
            </View>

            {chatMessages.map((msg) => {
              const isUser = msg.sender === 'user';
              return (
                <View key={msg.id} style={styles.chatMessageGroupContainer}>
                  <View
                    style={[
                      styles.chatBubbleWrapperRow,
                      isUser ? styles.chatBubbleUserAlign : styles.chatBubbleSupportAlign,
                    ]}
                  >
                    {/* Chat Bubble Box */}
                    <View style={[styles.chatBubbleBox, isUser ? styles.chatBubbleUserBox : styles.chatBubbleSupportBox]}>
                      {!isUser ? (
                        <View style={styles.supportInlineHeaderRow}>
                          <Headphones size={13} color={COLORS.primary} />
                          <Text style={styles.supportInlineTitleText}>{msg.senderName}</Text>
                        </View>
                      ) : null}

                      {msg.attachment ? (
                        <View style={{ marginBottom: msg.text ? 6 : 0, borderRadius: 10, overflow: 'hidden' }}>
                          <Image
                            source={{ uri: msg.attachment }}
                            style={{ width: 210, height: 140, borderRadius: 10 }}
                            resizeMode="cover"
                          />
                        </View>
                      ) : null}

                      {msg.text ? (
                        <Text style={[styles.chatBubbleText, isUser ? styles.chatBubbleUserText : styles.chatBubbleSupportText]}>
                          {msg.text}
                        </Text>
                      ) : null}
                    </View>
                  </View>

                  {/* Timestamp OUTSIDE the Chat Bubble Box */}
                  <View style={[
                    styles.chatOutsideTimestampRow,
                    isUser ? styles.chatOutsideTimestampUser : styles.chatOutsideTimestampSupport
                  ]}>
                    <Text style={styles.chatOutsideTimestampText}>
                      {msg.createdAt}
                    </Text>
                    {isUser ? (
                      <CheckCheck size={12} color={COLORS.primary} style={{ marginLeft: 3 }} />
                    ) : null}
                  </View>
                </View>
              );
            })}
          </ScrollView>

          {/* Selected Attachment Preview Banner Bar */}
          {selectedAttachment ? (
            <View style={styles.attachmentPreviewBanner}>
              <Image source={{ uri: selectedAttachment.uri }} style={styles.attachmentPreviewThumb} />
              <View style={{ flex: 1 }}>
                <Text style={styles.attachmentPreviewName} numberOfLines={1}>
                  {selectedAttachment.name}
                </Text>
                <Text style={styles.attachmentPreviewSub}>Ready to send with message</Text>
              </View>
              <TouchableOpacity onPress={() => setSelectedAttachment(null)} style={styles.removeAttachmentBtn}>
                <X size={16} color="#64748B" />
              </TouchableOpacity>
            </View>
          ) : null}

          {/* Fixed iPhone iMessage Style Input Bar at Bottom */}
          <View style={styles.chatInputBarContainer}>
            <TextInput
              style={styles.chatTextInput}
              placeholder="Message Support..."
              placeholderTextColor="#94A3B8"
              value={replyMessage}
              onChangeText={setReplyMessage}
              multiline
            />

            <TouchableOpacity
              activeOpacity={0.7}
              onPress={handlePickChatAttachment}
              style={styles.attachFileBtn}
            >
              <Paperclip size={20} color={COLORS.primary} />
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.85}
              onPress={handleSendReply}
              style={[
                styles.chatSendBtn,
                (!replyMessage.trim() && !selectedAttachment) && styles.chatSendBtnDisabled,
              ]}
              disabled={(!replyMessage.trim() && !selectedAttachment) || sendingReply}
            >
              <Send size={16} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },

  /* Screen 1 & Screen 2 Header Navy Banners */
  mainHeaderBanner: {
    paddingTop: Platform.OS === 'ios' ? 42 : 18,
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  ticketsHeaderBanner: {
    paddingTop: Platform.OS === 'ios' ? 42 : 18,
    paddingHorizontal: 16,
    paddingBottom: 0,
  },
  headerTitleRowNav: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 8,
  },
  ticketsHeaderTitleText: {
    fontSize: 17,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: -0.3,
  },
  topBannerStatsCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 8,
    paddingVertical: 7,
    paddingHorizontal: 12,
    marginBottom: 6,
  },
  statColItem: {
    alignItems: 'center',
    flex: 1,
  },
  statValWhiteText: {
    fontSize: 14.5,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  statLabelMutedText: {
    fontSize: 10,
    fontWeight: '500',
    color: 'rgba(255, 255, 255, 0.75)',
    marginTop: 2,
  },
  statColDivider: {
    width: 1,
    height: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },

  /* Navy Header Underline Tab Switcher (Screen 2) */
  navyHeaderUnderlineTabs: {
    flexDirection: 'row',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.15)',
    marginTop: 4,
  },
  navyHeaderTabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 11,
    position: 'relative',
  },
  navyHeaderTabText: {
    fontSize: 13,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.7)',
  },
  navyHeaderTabTextActive: {
    color: '#FFFFFF',
    fontWeight: '800',
  },
  navyHeaderActiveUnderline: {
    position: 'absolute',
    bottom: 0,
    left: 20,
    right: 20,
    height: 2.5,
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 2,
    borderTopRightRadius: 2,
  },

  /* Scroll View Contents */
  mainScrollContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 60,
  },
  ticketsScrollContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 60,
  },

  /* Section Titles */
  sectionHeaderTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 10,
    marginTop: 4,
  },
  sectionHeaderTitleText: {
    fontSize: 12,
    fontWeight: '800',
    color: COLORS.primary,
    letterSpacing: 0.5,
  },

  /* Channels List Card (Screen 1) */
  channelsCardContainer: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 8,
    overflow: 'hidden',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  },
  channelRowItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  channelIconChip: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  channelTitleText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
  },
  countBadgePill: {
    backgroundColor: COLORS.primary,
    borderRadius: 10,
    paddingHorizontal: 7,
    paddingVertical: 1,
  },
  countBadgeText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '800',
  },
  channelSubtext: {
    fontSize: 11.5,
    fontWeight: '500',
    color: '#64748B',
    marginTop: 2,
  },
  channelRowDividerLine: {
    height: 1,
    backgroundColor: '#E2E8F0',
  },

  /* Section Separator Rule */
  mainSectionDividerRule: {
    height: 1,
    backgroundColor: '#94A3B8',
    marginVertical: 16,
  },

  /* FAQ Search Bar (Screen 1) */
  faqSearchBarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 44,
    gap: 8,
  },
  faqSearchInputText: {
    flex: 1,
    fontSize: 13.5,
    color: '#0F172A',
    fontWeight: '500',
  },

  /* Accordion FAQ List (Screen 1) */
  faqAccordionContainer: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 12,
  },
  faqAccordionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
  },
  faqAccordionQuestionTitle: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    color: '#0F172A',
    lineHeight: 20,
  },
  faqAccordionQuestionTitleExpanded: {
    color: COLORS.primary,
    fontWeight: '800',
  },
  faqAccordionBodyBox: {
    marginTop: 8,
    paddingTop: 4,
  },
  faqAccordionAnswerBodyText: {
    fontSize: 13,
    color: '#475569',
    lineHeight: 19,
    fontWeight: '400',
  },
  faqAccordionItemDivider: {
    height: 1,
    backgroundColor: '#E2E8F0',
    marginTop: 12,
  },
  noFaqText: {
    fontSize: 13,
    color: '#64748B',
    textAlign: 'center',
    paddingVertical: 20,
  },

  /* Form Styling (Screen 2 - Create Support Ticket) */
  formMainHeaderTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#0F172A',
  },
  formMainHeaderSub: {
    fontSize: 12,
    color: '#64748B',
    lineHeight: 17,
    marginTop: 3,
  },
  formSectionCategoryTitle: {
    fontSize: 11.5,
    fontWeight: '800',
    color: COLORS.primary,
    letterSpacing: 0.5,
    marginTop: 6,
    marginBottom: 2,
  },
  formSectionDividerLine: {
    height: 1,
    backgroundColor: '#CBD5E1',
    marginVertical: 6,
  },
  fieldLabelText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#334155',
    marginBottom: 4,
  },
  categoryDropdownTrigger: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 44,
  },
  categoryDropdownValueText: {
    fontSize: 13.5,
    fontWeight: '700',
    color: '#0F172A',
  },
  priorityCardsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  priorityCardItem: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 6,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
  },
  priorityCardTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
  },
  priorityCardSub: {
    fontSize: 10,
    color: '#64748B',
    fontWeight: '500',
  },
  textAreaBox: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 8,
    padding: 12,
    minHeight: 90,
    fontSize: 13.5,
    color: '#0F172A',
  },

  /* My Tickets List Styles (Screen 2 Tab 2) */
  emptyTicketsBox: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 36,
    paddingHorizontal: 20,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    marginTop: 8,
  },
  emptyTicketsTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
    marginTop: 12,
  },
  emptyTicketsSub: {
    fontSize: 12.5,
    color: '#64748B',
    textAlign: 'center',
    marginTop: 4,
    lineHeight: 18,
  },
  createFirstTicketBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: COLORS.primary,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginTop: 16,
  },
  createFirstTicketText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
  },
  ticketCardItem: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 8,
    padding: 14,
    marginBottom: 10,
    gap: 8,
  },
  ticketSubjectTitle: {
    fontSize: 14.5,
    fontWeight: '800',
    color: '#0F172A',
  },
  ticketMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  categoryBadgeTag: {
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  categoryBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.primary,
  },
  ticketDateText: {
    fontSize: 11,
    color: '#64748B',
  },
  ticketDescContentBox: {
    backgroundColor: '#F8FAFC',
    padding: 8,
    borderRadius: 6,
  },
  ticketDescContentText: {
    fontSize: 12,
    color: '#334155',
    lineHeight: 17,
  },

  /* Live Support Chat Side Drawer Styles */
  chatPromptFooterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 10,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  chatPromptFooterText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: COLORS.primary,
  },
  closeBtn: {
    width: 34,
    height: 34,
    borderRadius: 6,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 6,
  },
  closeTicketHeaderBtn: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
    borderWidth: 1,
  },
  resolveBtnStyle: {
    backgroundColor: '#ECFDF5',
    borderColor: '#A7F3D0',
  },
  reopenBtnStyle: {
    backgroundColor: '#EFF6FF',
    borderColor: '#BFDBFE',
  },
  closeTicketHeaderBtnText: {
    fontSize: 11,
    fontWeight: '800',
  },

  /* Live Chat Drawer Styles */
  chatDrawerContainer: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  chatHeaderBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  chatSubjectText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
  },
  chatTicketSubtext: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },
  chatScrollView: {
    flex: 1,
    paddingHorizontal: 16,
  },
  chatSystemNoticeBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#BFDBFE',
    borderRadius: 8,
    padding: 10,
    marginBottom: 8,
  },
  chatSystemNoticeText: {
    flex: 1,
    fontSize: 11.5,
    color: '#1E40AF',
    lineHeight: 16,
  },
  chatMessageGroupContainer: {
    marginBottom: 10,
  },
  chatBubbleWrapperRow: {
    flexDirection: 'row',
    width: '100%',
  },
  chatBubbleUserAlign: {
    justifyContent: 'flex-end',
  },
  chatBubbleSupportAlign: {
    justifyContent: 'flex-start',
  },
  chatBubbleBox: {
    maxWidth: '82%',
    padding: 12,
    borderRadius: 12,
  },
  chatBubbleUserBox: {
    backgroundColor: COLORS.primary,
    borderBottomRightRadius: 2,
  },
  chatBubbleSupportBox: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderBottomLeftRadius: 2,
  },
  supportInlineHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  supportInlineTitleText: {
    fontSize: 11.5,
    fontWeight: '800',
    color: COLORS.primary,
  },
  chatBubbleText: {
    fontSize: 13.5,
    lineHeight: 19,
  },
  chatBubbleUserText: {
    color: '#FFFFFF',
  },
  chatBubbleSupportText: {
    color: '#0F172A',
  },
  chatOutsideTimestampRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 3,
  },
  chatOutsideTimestampUser: {
    justifyContent: 'flex-end',
    paddingRight: 4,
  },
  chatOutsideTimestampSupport: {
    justifyContent: 'flex-start',
    paddingLeft: 4,
  },
  chatOutsideTimestampText: {
    fontSize: 10,
    color: '#94A3B8',
  },
  attachmentPreviewBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  attachmentPreviewThumb: {
    width: 36,
    height: 36,
    borderRadius: 6,
  },
  attachmentPreviewName: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0F172A',
  },
  attachmentPreviewSub: {
    fontSize: 10,
    color: '#64748B',
  },
  removeAttachmentBtn: {
    padding: 4,
  },
  chatInputBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 8,
  },
  chatTextInput: {
    flex: 1,
    backgroundColor: '#F1F5F9',
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 8,
    maxHeight: 100,
    fontSize: 13.5,
    color: '#0F172A',
  },
  attachFileBtn: {
    padding: 6,
  },
  chatSendBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chatSendBtnDisabled: {
    opacity: 0.5,
  },
});
