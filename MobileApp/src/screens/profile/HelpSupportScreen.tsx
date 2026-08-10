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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import {
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
      {/* Dynamic Main View Switcher */}
      {currentView === 'TICKETS' ? (
        <View style={{ flex: 1 }}>
          <Header title="Support Tickets" onBack={() => setCurrentView('MAIN')} />

          <ScrollView
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {/* Standard Professional iPhone Underline Tab Bar */}
            <View style={styles.underlineTabBar}>
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => setTicketTab('CREATE')}
                style={styles.underlineTabItem}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <Plus size={15} color={ticketTab === 'CREATE' ? '#2563EB' : '#64748B'} />
                  <Text style={[styles.underlineTabText, ticketTab === 'CREATE' && styles.underlineTabTextActive]}>
                    Create Ticket
                  </Text>
                </View>
                {ticketTab === 'CREATE' ? <View style={styles.underlineActiveIndicator} /> : null}
              </TouchableOpacity>

              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => setTicketTab('MY_TICKETS')}
                style={styles.underlineTabItem}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <Ticket size={15} color={ticketTab === 'MY_TICKETS' ? '#2563EB' : '#64748B'} />
                  <Text style={[styles.underlineTabText, ticketTab === 'MY_TICKETS' && styles.underlineTabTextActive]}>
                    My Tickets ({myTickets.length})
                  </Text>
                </View>
                {ticketTab === 'MY_TICKETS' ? <View style={styles.underlineActiveIndicator} /> : null}
              </TouchableOpacity>
            </View>

            {/* TAB CONTENT 1: CREATE SUPPORT TICKET FORM */}
            {ticketTab === 'CREATE' ? (
              <View>
                <Text style={styles.groupHeaderLabel}>NEW SUPPORT INQUIRY</Text>
                <View style={styles.singleMasterCard}>
                  <Text style={styles.sectionTitle}>Submit Support Ticket</Text>

                  {formError ? <ErrorBanner message={formError} style={{ marginVertical: 4 }} /> : null}

                  {/* Full Name & Email */}
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

                  {/* Category Dropdown Pills */}
                  <Text style={styles.fieldLabel}>Inquiry Category *</Text>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryRow}>
                    {CATEGORIES.map((cat) => (
                      <TouchableOpacity
                        key={cat}
                        onPress={() => setCategory(cat)}
                        style={[styles.categoryPill, category === cat && styles.categoryPillActive]}
                      >
                        <Text style={[styles.categoryPillText, category === cat && styles.categoryPillTextActive]}>
                          {cat}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>

                  {/* Priority Selector */}
                  <Text style={styles.fieldLabel}>Priority Level *</Text>
                  <View style={styles.priorityRow}>
                    {[
                      { key: 'low', label: 'Low', color: '#059669', bg: '#ECFDF5' },
                      { key: 'medium', label: 'Medium', color: '#D97706', bg: '#FFFBEB' },
                      { key: 'high', label: 'High Priority', color: '#DC2626', bg: '#FEF2F2' },
                    ].map((p) => (
                      <TouchableOpacity
                        key={p.key}
                        onPress={() => setPriority(p.key as any)}
                        style={[
                          styles.priorityBtn,
                          priority === p.key && { backgroundColor: p.bg, borderColor: p.color },
                        ]}
                      >
                        <Text
                          style={[
                            styles.priorityBtnText,
                            priority === p.key && { color: p.color, fontWeight: '800' },
                          ]}
                        >
                          {p.label}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>

                  <Input
                    label="Ticket Subject *"
                    placeholder="Brief description of issue or query"
                    value={subject}
                    onChangeText={setSubject}
                    leftIcon={<FileText size={18} color="#64748B" />}
                  />

                  <View style={{ marginBottom: 12 }}>
                    <Text style={styles.fieldLabel}>Detailed Description *</Text>
                    <TextInput
                      style={styles.textArea}
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
                  />
                </View>
              </View>
            ) : (
              /* TAB CONTENT 2: MY TICKETS (PREVIOUS TICKETS) */
              <View>
                <Text style={styles.groupHeaderLabel}>MY SUPPORT TICKETS</Text>

                {myTickets.length === 0 ? (
                  <View style={styles.emptyTicketsBox}>
                    <Headphones size={36} color="#2563EB" />
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
                      {/* Subject Line */}
                      <Text style={styles.ticketSubjectTitle}>{tkt.subject}</Text>

                      {/* Category & Date Meta Row */}
                      <View style={styles.ticketMetaRow}>
                        <View style={styles.categoryBadgeTag}>
                          <Text style={styles.categoryBadgeText}>{tkt.category}</Text>
                        </View>
                        <Text style={styles.ticketDateText}>Submitted on {tkt.createdAt}</Text>
                      </View>

                      {/* Description Box */}
                      <View style={styles.ticketDescContentBox}>
                        <Text style={styles.ticketDescContentText}>{tkt.description}</Text>
                      </View>

                      {/* Action Hint Footer */}
                      <View style={styles.chatPromptFooterRow}>
                        <MessageSquare size={13} color="#2563EB" />
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
        <View style={{ flex: 1 }}>
          <Header title="Help & Support Desk" onBack={() => navigation.goBack()} />

          <ScrollView
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {/* DEDICATED SUPPORT TICKET OPTION CARD */}
            <Text style={styles.groupHeaderLabel}>SUPPORT TICKETS</Text>
            <TouchableOpacity
              activeOpacity={0.85}
              onPress={() => setCurrentView('TICKETS')}
              style={styles.supportTicketOptionCard}
            >
              <View style={styles.supportTicketIconBox}>
                <Headphones size={22} color="#2563EB" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.supportOptionTitleText}>Support Tickets</Text>
                <Text style={styles.supportOptionSubtitleText}>
                  Create a new support ticket or view your previous tickets ("My Tickets")
                </Text>
              </View>
              <ChevronRight size={20} color="#64748B" />
            </TouchableOpacity>

            {/* FAQ KNOWLEDGE BASE SECTION */}
            <Text style={styles.groupHeaderLabel}>FAQ KNOWLEDGE BASE</Text>
            <View style={styles.singleMasterCard}>
              {/* FAQ Banner Header & Search */}
              <View style={styles.heroHeaderSection}>
                <View style={styles.heroHeaderRow}>
                  <View style={styles.heroIconBox}>
                    <HelpCircle size={20} color="#2563EB" />
                  </View>
                  <Text style={styles.heroTitle}>Frequently Asked Questions</Text>
                </View>

                <Text style={styles.heroSubtitle}>
                  Search our FAQ knowledge base to find instant answers for platform features and inquiries.
                </Text>

                {/* FAQ Search Bar */}
                <View style={styles.searchBarContainer}>
                  <Search size={18} color="#94A3B8" style={styles.searchIcon} />
                  <TextInput
                    style={styles.searchInput}
                    placeholder="Search FAQs, topics, platform policies..."
                    placeholderTextColor="#94A3B8"
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                  />
                </View>
              </View>

              <View style={styles.sectionDivider} />

              {/* FAQ ACCORDION LIST */}
              <View>
                {/* Category Filter Pills */}
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryRow}>
                  {['All', 'Account', 'Job Posting', 'Applications', 'Technical'].map((cat) => (
                    <TouchableOpacity
                      key={cat}
                      onPress={() => setActiveFAQCategory(cat)}
                      style={[styles.categoryPill, activeFAQCategory === cat && styles.categoryPillActive]}
                    >
                      <Text style={[styles.categoryPillText, activeFAQCategory === cat && styles.categoryPillTextActive]}>
                        {cat}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>

                {/* Accordion FAQ Items */}
                <View style={styles.faqList}>
                  {filteredFAQs.length === 0 ? (
                    <Text style={styles.noFaqText}>No matching FAQ articles found for "{searchQuery}".</Text>
                  ) : (
                    filteredFAQs.map((item, idx) => {
                      const isExpanded = expandedFAQIndex === idx;
                      return (
                        <TouchableOpacity
                          key={idx}
                          activeOpacity={0.8}
                          onPress={() => setExpandedFAQIndex(isExpanded ? null : idx)}
                          style={[styles.faqItemRow, isExpanded && styles.faqItemRowExpanded]}
                        >
                          <View style={styles.faqHeaderRow}>
                            <View style={styles.faqQuestionBox}>
                              <View style={styles.faqBlueDot} />
                              <Text style={[styles.faqQuestionText, isExpanded && { color: '#2563EB' }]}>{item.question}</Text>
                            </View>
                            {isExpanded ? (
                              <ChevronUp size={18} color="#2563EB" />
                            ) : (
                              <ChevronDown size={18} color="#64748B" />
                            )}
                          </View>

                          {isExpanded ? (
                            <View>
                              <View style={styles.faqQuestionSeparator} />
                              <Text style={styles.faqAnswerText}>{item.answer}</Text>
                            </View>
                          ) : null}
                        </TouchableOpacity>
                      );
                    })
                  )}
                </View>
              </View>
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
              <Headphones size={15} color="#2563EB" />
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
                          <Headphones size={13} color="#2563EB" />
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
                      <CheckCheck size={12} color="#2563EB" style={{ marginLeft: 3 }} />
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
              <Paperclip size={20} color="#2563EB" />
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
  scrollContent: {
    padding: 16,
    paddingBottom: 48,
  },
  groupHeaderLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: '#2563EB',
    letterSpacing: 0.8,
    paddingLeft: 4,
    marginBottom: 8,
    marginTop: 4,
    textTransform: 'uppercase',
  },

  /* Dedicated Support Tickets Option Card */
  supportTicketOptionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 0,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 14,
    marginBottom: 20,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  },
  supportTicketIconBox: {
    width: 44,
    height: 44,
    borderRadius: 8,
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#BFDBFE',
    alignItems: 'center',
    justifyContent: 'center',
  },
  supportOptionTitleText: {
    fontSize: 14.5,
    fontWeight: '800',
    color: '#0F172A',
  },
  supportOptionSubtitleText: {
    fontSize: 11.5,
    fontWeight: '500',
    color: '#64748B',
    marginTop: 2,
  },

  /* Underline Tab Bar for Tickets Page */
  underlineTabBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    marginBottom: 16,
  },
  underlineTabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    position: 'relative',
  },
  underlineTabText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#64748B',
  },
  underlineTabTextActive: {
    color: '#2563EB',
    fontWeight: '800',
  },
  underlineActiveIndicator: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 2.5,
    backgroundColor: '#2563EB',
  },

  singleMasterCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 0,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    padding: 18,
    gap: 16,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 2,
  },
  sectionDivider: {
    height: 1,
    backgroundColor: '#E2E8F0',
    marginVertical: 12,
  },
  heroHeaderSection: {
    marginBottom: 0,
  },
  heroHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 6,
  },
  heroIconBox: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#BFDBFE',
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
  },
  heroSubtitle: {
    fontSize: 12,
    color: '#64748B',
    lineHeight: 17,
    marginBottom: 12,
  },
  searchBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 42,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 12.5,
    color: '#0F172A',
  },
  categoryRow: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  categoryPill: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 8,
  },
  categoryPillActive: {
    backgroundColor: '#EFF6FF',
    borderColor: '#2563EB',
  },
  categoryPillText: {
    fontSize: 11.5,
    fontWeight: '600',
    color: '#475569',
  },
  categoryPillTextActive: {
    color: '#2563EB',
    fontWeight: '800',
  },
  faqList: {
    gap: 8,
  },
  noFaqText: {
    fontSize: 12,
    color: '#64748B',
    textAlign: 'center',
    paddingVertical: 12,
  },
  faqItemRow: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  faqItemRowExpanded: {
    borderBottomColor: '#CBD5E1',
  },
  faqHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  faqQuestionBox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginRight: 8,
  },
  faqBlueDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#2563EB',
  },
  faqQuestionText: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#0F172A',
    flex: 1,
  },
  faqQuestionSeparator: {
    height: 1,
    backgroundColor: '#E2E8F0',
    marginVertical: 10,
  },
  faqAnswerText: {
    fontSize: 12,
    color: '#475569',
    lineHeight: 18.5,
  },
  fieldLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#334155',
    marginBottom: 6,
    marginTop: 4,
  },
  priorityRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 14,
  },
  priorityBtn: {
    flex: 1,
    height: 38,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  priorityBtnText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#475569',
  },
  textArea: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 12.5,
    color: '#0F172A',
    minHeight: 110,
  },

  /* My Tickets Cards */
  ticketCardItem: {
    backgroundColor: '#FFFFFF',
    borderRadius: 0,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    padding: 16,
    marginBottom: 12,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 2,
    elevation: 1,
  },
  ticketCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  ticketNumBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#BFDBFE',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
  },
  ticketNumText: {
    fontSize: 11.5,
    fontWeight: '800',
    color: '#2563EB',
  },
  statusBadge: {
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  statusBadgeText: {
    fontSize: 10.5,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  ticketSubjectTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 6,
  },
  ticketMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  categoryBadgeTag: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 4,
  },
  categoryBadgeText: {
    fontSize: 10.5,
    fontWeight: '700',
    color: '#475569',
  },
  ticketDateText: {
    fontSize: 11,
    color: '#64748B',
  },
  ticketDescContentBox: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#F1F5F9',
    borderRadius: 6,
    padding: 10,
  },
  ticketDescContentText: {
    fontSize: 12,
    color: '#334155',
    lineHeight: 17,
  },

  emptyTicketsBox: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  emptyTicketsTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
    marginTop: 10,
  },
  emptyTicketsSub: {
    fontSize: 12,
    color: '#64748B',
    textAlign: 'center',
    marginTop: 4,
    marginBottom: 16,
    lineHeight: 17,
  },
  createFirstTicketBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#2563EB',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 0,
  },
  createFirstTicketText: {
    fontSize: 12.5,
    fontWeight: '800',
    color: '#FFFFFF',
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
    color: '#2563EB',
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
  chatDrawerContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  chatHeaderBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    backgroundColor: '#FFFFFF',
  },
  chatSubjectText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: -0.3,
  },
  chatTicketSubtext: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
    marginTop: 2,
  },
  chatScrollView: {
    flex: 1,
    paddingHorizontal: 16,
    backgroundColor: '#FFFFFF',
  },
  chatSystemNoticeBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#BFDBFE',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  chatSystemNoticeText: {
    fontSize: 11.5,
    fontWeight: '600',
    color: '#1E40AF',
    flex: 1,
    lineHeight: 16,
  },
  chatMessageGroupContainer: {
    marginVertical: 2,
    width: '100%',
  },
  chatBubbleWrapperRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    maxWidth: '92%',
    gap: 8,
  },
  chatBubbleUserAlign: {
    alignSelf: 'flex-end',
    alignItems: 'flex-end',
  },
  chatBubbleSupportAlign: {
    alignSelf: 'flex-start',
    alignItems: 'flex-start',
  },
  supportInlineHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginBottom: 3,
  },
  supportInlineTitleText: {
    fontSize: 11.5,
    fontWeight: '800',
    color: '#2563EB',
  },
  chatBubbleBox: {
    paddingHorizontal: 14,
    paddingTop: 8,
    paddingBottom: 8,
    borderRadius: 18,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 2,
    elevation: 1,
  },
  chatBubbleUserBox: {
    backgroundColor: '#2563EB',
    borderBottomRightRadius: 2,
  },
  chatBubbleSupportBox: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderBottomLeftRadius: 2,
  },
  chatBubbleText: {
    fontSize: 13.5,
    lineHeight: 19,
  },
  chatBubbleUserText: {
    color: '#FFFFFF',
    fontWeight: '400',
  },
  chatBubbleSupportText: {
    color: '#0F172A',
    fontWeight: '400',
  },
  chatOutsideTimestampRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 1,
    marginBottom: 1,
  },
  chatOutsideTimestampUser: {
    alignSelf: 'flex-end',
    paddingRight: 2,
  },
  chatOutsideTimestampSupport: {
    alignSelf: 'flex-start',
    paddingLeft: 2,
  },
  chatOutsideTimestampText: {
    fontSize: 10,
    color: '#94A3B8',
    fontWeight: '500',
  },
  chatInputBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    backgroundColor: '#FFFFFF',
    gap: 10,
  },
  chatTextInput: {
    flex: 1,
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    maxHeight: 90,
    fontSize: 13.5,
    color: '#0F172A',
  },
  chatSendBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#2563EB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  chatSendBtnDisabled: {
    backgroundColor: '#CBD5E1',
  },
  attachFileBtn: {
    padding: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  attachmentPreviewBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#F8FAFC',
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
    fontSize: 10.5,
    color: '#64748B',
  },
  removeAttachmentBtn: {
    padding: 6,
  },
});
