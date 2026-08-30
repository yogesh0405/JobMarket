import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Mail,
  Phone,
  Ticket,
  Plus,
  ChevronRight,
  ChevronDown,
  Clock,
  CheckCircle2,
  HelpCircle,
  Send,
  Headphones,
  Globe,
  Search,
  SlidersHorizontal,
  X,
  PlusCircle,
  ArrowUpCircle,
  Info,
  Paperclip
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { apiFetch } from '../../utils/api';

export interface SupportTicket {
  id: string;
  ticketNumber: string;
  userId?: string;
  fullName?: string;
  category: string;
  subject: string;
  description: string;
  attachment?: string;
  priority: 'low' | 'medium' | 'high';
  status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';
  createdAt: string;
  rawCreatedAt?: string;
  updatedAt?: string;
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
    category: 'General',
    question: 'How do I manage my notifications?',
    answer: 'To manage notifications, go to "Settings," select "Notification Settings," and customize your alerts for new job postings, application status updates, and interview calls.',
  },
  {
    category: 'General',
    question: 'Is JobMarket free for job seekers?',
    answer: 'Yes, 100% free! Candidates can create profiles, build digital resumes, apply to verified employers, and attend interviews without any hidden fees.',
  },
  {
    category: 'General',
    question: 'Is my personal data safe and private?',
    answer: 'Yes. All personal contact information, resumes, and identification documents are encrypted with enterprise AES-256 standard and only shared with employers you apply to.',
  },
  {
    category: 'Account',
    question: 'How do I update my profile and trade details?',
    answer: 'Tap your profile in the top drawer menu and select "My Profile". You can edit your name, trade specializations, experience level, expected salary, and bio.',
  },
  {
    category: 'Account',
    question: 'How do I reset or change my account password?',
    answer: 'Navigate to "Security & Sessions" from the header drawer. You can update your password directly or verify via an email OTP code.',
  },
  {
    category: 'Job Search',
    question: 'How do I search for jobs in specific industrial areas?',
    answer: 'Use the Find Jobs search bar to filter by trade (e.g. CNC Operator, Welder, Electrician) or locality (e.g. Waluj MIDC, Shendra MIDC, Chhatrapati Sambhajinagar).',
  },
  {
    category: 'Job Search',
    question: 'How do I save a job to apply later?',
    answer: 'Tap the bookmark icon on any job card. Saved jobs appear immediately under "Saved Jobs" in your bottom navigation dock.',
  },
  {
    category: 'Applications',
    question: 'How do I track my submitted job applications?',
    answer: 'Open the "Applied" tab in your navigation dock. You will see live status badges from employers: Applied, Under Review, Shortlisted, and Scheduled Interviews.',
  },
  {
    category: 'Applications',
    question: 'Can I withdraw or edit a submitted job application?',
    answer: 'Once submitted, applications are delivered directly to the hiring employer. You can update your master resume profile anytime to ensure employers see your latest credentials.',
  },
  {
    category: 'Resume',
    question: 'How do I upload or update my PDF resume?',
    answer: 'Open the side drawer menu and tap "My Resume". You can upload a fresh PDF file, preview your formatted resume document, and download it with 1 tap.',
  },
  {
    category: 'Security',
    question: 'What should I do if I suspect a fraudulent job listing?',
    answer: 'All employers on JobMarket go through enterprise verification. If you ever encounter suspicious behavior, raise a support ticket immediately under the "Help & Contact" tab.',
  },
  {
    category: 'Technical',
    question: 'Why am I not receiving OTP or email notifications?',
    answer: 'OTP emails are dispatched via high-speed transactional servers. Please check your Spam/Junk folder and ensure your email address is spelled correctly in profile settings.',
  },
];

const CATEGORY_OPTIONS = [
  'Job Application Inquiry',
  'Employer Job Posting Issue',
  'Resume Document Upload Issue',
  'Account & Security Verification',
  'OTP Email Non-receipt',
  'Other Technical Query',
];

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
  if (isNaN(parsed.getTime())) return String(dateInput);
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

  if (isSameDay) return 'Today';
  if (isYesterday) return 'Yesterday';

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
  if (isNaN(parsed.getTime())) return String(dateInput).split(',')[0].trim().toLowerCase();
  return `${parsed.getFullYear()}-${parsed.getMonth() + 1}-${parsed.getDate()}`;
};

export const ContactPage: React.FC = () => {
  const navigate = useNavigate();
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
  const [expandedFAQIndex, setExpandedFAQIndex] = useState<number | null>(0);

  // Tickets Filter & Search
  const [ticketSearchQuery, setTicketSearchQuery] = useState('');

  // Support Ticket Form State
  const [category, setCategory] = useState('Job Application Inquiry');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [createTicketAttachment, setCreateTicketAttachment] = useState<{ uri: string; name: string; base64?: string } | null>(null);

  // Tickets List & Chat State
  const [myTickets, setMyTickets] = useState<SupportTicket[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
  const [chatMessages, setChatMessages] = useState<TicketMessage[]>([]);
  const [loadingChatMessages, setLoadingChatMessages] = useState(false);
  const [replyMessage, setReplyMessage] = useState('');
  const [sendingReply, setSendingReply] = useState(false);
  const [selectedAttachment, setSelectedAttachment] = useState<{ uri: string; name: string; base64?: string } | null>(null);
  const [previewImageModal, setPreviewImageModal] = useState<string | null>(null);
  const [viewportHeight, setViewportHeight] = useState<number | null>(null);
  const [createdTicketSuccess, setCreatedTicketSuccess] = useState<{
    id: string;
    ticketNumber: string;
    category: string;
    subject: string;
    status: string;
  } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const chatFileInputRef = useRef<HTMLInputElement>(null);
  const chatScrollRef = useRef<HTMLDivElement>(null);
  const chatInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (typeof window === 'undefined' || !window.visualViewport) return;

    const handleResize = () => {
      if (window.visualViewport) {
        setViewportHeight(window.visualViewport.height);
        if (chatScrollRef.current) {
          chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
        }
      }
    };

    window.visualViewport.addEventListener('resize', handleResize);
    window.visualViewport.addEventListener('scroll', handleResize);
    handleResize();

    return () => {
      window.visualViewport?.removeEventListener('resize', handleResize);
      window.visualViewport?.removeEventListener('scroll', handleResize);
    };
  }, [selectedTicket]);

  const categories = ['General', 'Account', 'Job Search', 'Applications', 'Resume', 'Security', 'Technical'];

  const fetchMyTickets = useCallback(async () => {
    try {
      const res = await apiFetch('/api/support/tickets');
      const data = await res.json();
      const rawList = Array.isArray(data?.data)
        ? data.data
        : Array.isArray(data?.data?.tickets)
        ? data.data.tickets
        : Array.isArray(data?.tickets)
        ? data.tickets
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
      } else if (data && data.success) {
        setMyTickets([]);
      }
    } catch (_) {}
  }, []);

  useEffect(() => {
    fetchMyTickets();
  }, [fetchMyTickets]);

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

    return false;
  };

  const fetchTicketMessages = useCallback(async (ticket: SupportTicket) => {
    try {
      const res = await apiFetch(`/api/support/tickets/${ticket.id}`);
      const data = await res.json();
      if (data && data.success && data.data) {
        if (data.data.ticket) {
          setSelectedTicket(prev => prev ? {
            ...prev,
            status: (data.data.ticket.status || prev.status).toUpperCase(),
            updatedAt: data.data.ticket.updated_at || data.data.ticket.updatedAt || prev.updatedAt
          } : prev);
        }

        const initialMsg: TicketMessage = {
          id: `init-${ticket.id}`,
          sender: 'user',
          senderName: user?.name || ticket.fullName || 'You',
          text: ticket.description,
          attachment: ticket.attachment || (ticket as any).attachment_url || undefined,
          createdAt: data.data.ticket?.created_at || ticket.rawCreatedAt || ticket.createdAt || new Date().toISOString(),
        };

        const rawMsgs = data.data.messages || data.data.conversations || [];
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

  useEffect(() => {
    if (!selectedTicket) return;
    const interval = setInterval(() => {
      fetchTicketMessages(selectedTicket);
    }, 7000);
    return () => clearInterval(interval);
  }, [selectedTicket?.id, fetchTicketMessages]);

  useEffect(() => {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
    }
  }, [chatMessages.length, selectedTicket]);

  const handlePickFile = (e: React.ChangeEvent<HTMLInputElement>, isChat = false) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      if (file.size > 10 * 1024 * 1024) {
        alert('File size must be under 10MB');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        const attachmentObj = { uri: base64, name: file.name, base64 };
        if (isChat) {
          setSelectedAttachment(attachmentObj);
        } else {
          setCreateTicketAttachment(attachmentObj);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCreateTicket = async () => {
    const finalFullName = user?.name || (user as any)?.fullName || 'JobMarket User';
    const finalEmail = user?.email || 'user@jobmarket.com';
    const userRawPhone = user?.phone || (user as any)?.mobile || '';

    if (!subject.trim() || !description.trim()) {
      setFormError('Please fill in the subject and description.');
      return;
    }

    let cleanedPhone: string | undefined = undefined;
    if (userRawPhone) {
      const digitsOnly = String(userRawPhone).replace(/[^0-9]/g, '');
      if (digitsOnly.length >= 10) cleanedPhone = digitsOnly.slice(-10);
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
        attachment: createTicketAttachment?.base64,
        attachmentBase64: createTicketAttachment?.base64,
        attachmentName: createTicketAttachment?.name || 'attachment.jpg',
        preferredContact: 'email',
        priority: priority || 'medium',
      };

      const res = await apiFetch('/api/support/tickets', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
      const data = await res.json();

      if (data && data.success && data.data) {
        const serverTicket = data.data;
        const ticketNum = serverTicket.ticket_number || serverTicket.ticketNumber || `TKT-${serverTicket.id}`;

        setSubject('');
        setDescription('');
        setCreateTicketAttachment(null);
        setFormError(null);

        await fetchMyTickets();
        setTicketSubTab('MY_TICKETS');

        setCreatedTicketSuccess({
          id: String(serverTicket.id),
          ticketNumber: ticketNum,
          category: serverTicket.category || category || 'Job Application Inquiry',
          subject: serverTicket.subject || subject,
          status: serverTicket.status || 'OPEN',
        });
      } else {
        const errMsg = data?.message || data?.error || 'Failed to record support ticket.';
        setFormError(errMsg);
      }
    } catch (err: any) {
      setFormError(err?.message || 'Unable to submit ticket. Please check network connection.');
    } finally {
      setIsSubmitting(false);
    }
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
          attachment: sentAttachment?.base64,
          attachmentBase64: sentAttachment?.base64,
          attachmentName: sentAttachment?.name || 'attachment.jpg',
        }),
      });

      await fetchTicketMessages(selectedTicket);
    } catch (err: any) {
      console.error('Failed to send reply:', err);
    } finally {
      setSendingReply(false);
    }
  };

  const filteredFAQs = FAQ_DATA.filter((faq) => {
    const matchesCategory =
      activeFAQCategory === 'General'
        ? true
        : faq.category.toLowerCase() === activeFAQCategory.toLowerCase();

    const matchesQuery =
      searchQuery.trim() === '' ||
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesCategory && matchesQuery;
  });

  const filteredTickets = myTickets.filter((t) => {
    if (!ticketSearchQuery.trim()) return true;
    const q = ticketSearchQuery.toLowerCase();
    return (
      (t.ticketNumber && t.ticketNumber.toLowerCase().includes(q)) ||
      (t.subject && t.subject.toLowerCase().includes(q)) ||
      (t.description && t.description.toLowerCase().includes(q)) ||
      (t.category && t.category.toLowerCase().includes(q))
    );
  });

  // 1. FULL SCREEN SUPPORT CHAT IN-APP VIEW
  if (selectedTicket) {
    const hasInputContent = !!replyMessage.trim() || !!selectedAttachment;

    return (
      <div style={{
        backgroundColor: '#FFFFFF',
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        height: viewportHeight ? `${viewportHeight}px` : '100dvh',
        maxHeight: viewportHeight ? `${viewportHeight}px` : '100dvh',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        boxSizing: 'border-box',
        zIndex: 1000
      }}>
        {/* Header Bar */}
        <div style={{
          flexShrink: 0,
          backgroundColor: '#FFFFFF',
          borderBottom: '1px solid #E2E8F0',
          padding: '12px 16px',
          display: 'flex',
          alignItems: 'center',
          gap: '10px'
        }}>
          <button
            onClick={() => setSelectedTicket(null)}
            style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: 4, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            aria-label="Back"
          >
            <ArrowLeft size={20} color="#0F172A" strokeWidth={2.4} />
          </button>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
              <span style={{ fontSize: '15px', fontWeight: 800, color: '#0F172A', fontFamily: 'inherit', letterSpacing: '-0.2px' }}>
                Ticket #{selectedTicket.ticketNumber}
              </span>
              <span style={{
                fontSize: '9.5px',
                fontWeight: 700,
                textTransform: 'uppercase',
                padding: '2.5px 7px',
                borderRadius: '4px',
                backgroundColor: selectedTicket.status === 'RESOLVED' || selectedTicket.status === 'CLOSED' ? '#DCFCE7' : '#FEF3C7',
                color: selectedTicket.status === 'RESOLVED' || selectedTicket.status === 'CLOSED' ? '#15803D' : '#B45309',
                border: `1px solid ${selectedTicket.status === 'RESOLVED' || selectedTicket.status === 'CLOSED' ? '#BBF7D0' : '#FDE68A'}`
              }}>
                {selectedTicket.status}
              </span>
            </div>
            <div style={{ fontSize: '11.5px', color: '#475569', marginTop: '1px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {selectedTicket.subject}
            </div>
          </div>
        </div>

        {/* Messages List */}
        <div ref={chatScrollRef} style={{ flex: 1, overflowY: 'auto', WebkitOverflowScrolling: 'touch', padding: '14px 16px 20px', display: 'flex', flexDirection: 'column' }}>
          {loadingChatMessages ? (
            <div style={{ textAlign: 'center', padding: '40px 0', color: '#64748B', fontSize: '12.5px' }}>
              Loading conversation...
            </div>
          ) : (
            <div style={{ maxWidth: '520px', width: '100%', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {chatMessages.map((msg, index) => {
                const isUser = msg.sender === 'user';
                const prevMsg = index > 0 ? chatMessages[index - 1] : null;
                const msgDate = msg.createdAt || selectedTicket?.createdAt || new Date().toISOString();
                const prevDate = prevMsg?.createdAt || selectedTicket?.createdAt;
                const shouldShowDateHeader = index === 0 || getDayKey(msgDate) !== getDayKey(prevDate);

                return (
                  <React.Fragment key={msg.id || index}>
                    {shouldShowDateHeader && (
                      <div style={{ textAlign: 'center', margin: '8px 0' }}>
                        <span style={{
                          fontSize: '10.5px',
                          color: '#94A3B8',
                          fontWeight: 600,
                          backgroundColor: '#FAF9F6',
                          border: '1px solid #ECEAE4',
                          padding: '3px 10px',
                          borderRadius: '10px'
                        }}>
                          {formatChatDateHeader(msgDate)}
                        </span>
                      </div>
                    )}

                    {isUser ? (
                      <div style={{ alignSelf: 'flex-end', maxWidth: '82%', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px' }}>
                        {msg.attachment && (
                          <img
                            src={msg.attachment}
                            alt="Attachment"
                            onClick={() => setPreviewImageModal(msg.attachment!)}
                            style={{ width: '220px', height: '130px', objectFit: 'cover', borderRadius: '14px', cursor: 'pointer', border: '1px solid #E2E8F0' }}
                          />
                        )}
                        {msg.text && (
                          <div style={{
                            backgroundColor: '#1B4FDF',
                            borderRadius: '16px',
                            padding: '9px 13px',
                            color: '#FFFFFF',
                            fontSize: '12.5px',
                            lineHeight: '18px',
                            wordBreak: 'break-word',
                            boxShadow: '0 1px 3px rgba(27, 79, 223, 0.15)'
                          }}>
                            {msg.text}
                            <div style={{ fontSize: '9.5px', color: 'rgba(255, 255, 255, 0.8)', textAlign: 'right', marginTop: '3px' }}>
                              {formatMessageTime(msgDate)}
                            </div>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div style={{ alignSelf: 'flex-start', maxWidth: '82%', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <div style={{
                          backgroundColor: '#FAF9F6',
                          border: '1px solid #ECEAE4',
                          borderRadius: '16px',
                          padding: '9px 13px',
                          boxShadow: '0 1px 3px rgba(15, 23, 42, 0.02)'
                        }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '5px', marginBottom: '3px' }}>
                            <Headphones size={13} color="#1B4FDF" strokeWidth={2.2} />
                            <span style={{ fontSize: '11px', fontWeight: 700, color: '#1B4FDF' }}>
                              {msg.senderName || 'Support Team'}
                            </span>
                          </div>
                          <div style={{ fontSize: '12.5px', color: '#0F172A', lineHeight: '18px', wordBreak: 'break-word' }}>
                            {msg.text}
                          </div>
                          {msg.attachment && (
                            <img
                              src={msg.attachment}
                              alt="Attachment"
                              onClick={() => setPreviewImageModal(msg.attachment!)}
                              style={{ width: '220px', height: '130px', objectFit: 'cover', borderRadius: '14px', cursor: 'pointer', marginTop: '6px', border: '1px solid #E2E8F0' }}
                            />
                          )}
                          <div style={{ fontSize: '9.5px', color: '#94A3B8', textAlign: 'right', marginTop: '3px' }}>
                            {formatMessageTime(msgDate)}
                          </div>
                        </div>
                      </div>
                    )}
                  </React.Fragment>
                );
              })}
            </div>
          )}
        </div>

        {/* Input Bar Footer (Permanently Anchored to Bottom) */}
        <div style={{
          flexShrink: 0,
          backgroundColor: '#FFFFFF',
          borderTop: '1px solid #E2E8F0',
          padding: '8px 14px',
          boxSizing: 'border-box'
        }}>
          <div style={{ maxWidth: '520px', margin: '0 auto' }}>
            {selectedAttachment && (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                backgroundColor: '#FEF2F2',
                border: '1px solid #FCA5A5',
                padding: '5px 10px',
                borderRadius: '8px',
                marginBottom: '6px',
                fontSize: '11.5px',
                color: '#DC2626',
                fontWeight: 600
              }}>
                <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  📎 {selectedAttachment.name}
                </span>
                <button
                  onClick={() => setSelectedAttachment(null)}
                  style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#DC2626', padding: 2, display: 'flex', alignItems: 'center' }}
                >
                  <X size={14} />
                </button>
              </div>
            )}

            <div style={{
              display: 'flex',
              alignItems: 'center',
              backgroundColor: '#F8FAFC',
              borderRadius: '24px',
              border: '1.5px solid #E2E8F0',
              padding: '3px 4px 3px 10px',
              minHeight: '44px',
              gap: '6px',
              boxSizing: 'border-box'
            }}>
              <input
                type="file"
                ref={chatFileInputRef}
                style={{ display: 'none' }}
                accept="image/*"
                onChange={(e) => handlePickFile(e, true)}
              />
              <button
                type="button"
                onClick={() => chatFileInputRef.current?.click()}
                style={{
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '5px',
                  color: '#64748B',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: '50%'
                }}
                title="Attach image"
              >
                <Paperclip size={18} strokeWidth={2.2} />
              </button>
              <input
                ref={chatInputRef}
                type="text"
                placeholder="Enter Message"
                value={replyMessage}
                onChange={(e) => setReplyMessage(e.target.value)}
                onFocus={() => {
                  setTimeout(() => {
                    if (window.visualViewport) {
                      setViewportHeight(window.visualViewport.height);
                    }
                    if (chatScrollRef.current) {
                      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
                    }
                    window.scrollTo(0, 0);
                  }, 80);
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleSendReply();
                  }
                }}
                style={{
                  flex: 1,
                  border: 'none',
                  outline: 'none',
                  background: 'transparent',
                  fontSize: '13px',
                  color: '#0F172A',
                  padding: '6px 2px',
                  minWidth: 0
                }}
              />
              <button
                type="button"
                onClick={handleSendReply}
                disabled={sendingReply || !hasInputContent}
                style={{
                  width: '34px',
                  height: '34px',
                  borderRadius: '17px',
                  backgroundColor: hasInputContent ? '#1B4FDF' : '#F1F5F9',
                  border: 'none',
                  cursor: hasInputContent ? 'pointer' : 'default',
                  color: hasInputContent ? '#FFFFFF' : '#94A3B8',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  boxShadow: hasInputContent ? '0 2px 6px rgba(27, 79, 223, 0.35)' : 'none',
                  transition: 'all 0.15s ease'
                }}
                title="Send message"
              >
                <Send size={15} strokeWidth={2.4} />
              </button>
            </div>
          </div>
        </div>

        {/* Lightbox Preview */}
        {previewImageModal && (
          <div
            onClick={() => setPreviewImageModal(null)}
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(2, 6, 23, 0.95)',
              zIndex: 9999,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '16px'
            }}
          >
            <button
              onClick={() => setPreviewImageModal(null)}
              style={{
                position: 'absolute',
                top: 20,
                right: 20,
                background: 'rgba(255, 255, 255, 0.2)',
                border: 'none',
                borderRadius: '18px',
                width: '36px',
                height: '36px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#FFFFFF',
                cursor: 'pointer'
              }}
            >
              <X size={20} />
            </button>
            <img
              src={previewImageModal}
              alt="Preview"
              style={{ maxWidth: '90%', maxHeight: '80%', objectFit: 'contain' }}
            />
          </div>
        )}
      </div>
    );
  }

  // 2. FULL SCREEN SUPPORT TICKET DESK (Hides Help Center Header & Tabs)
  if (showTicketManager) {
    if (ticketSubTab === 'CREATE') {
      const isUrgent = priority === 'high';
      return (
        <div style={{ backgroundColor: '#FFFFFF', minHeight: '100vh', paddingBottom: '40px', boxSizing: 'border-box' }}>
          {/* Header */}
          <div style={{
            position: 'sticky',
            top: 0,
            zIndex: 50,
            backgroundColor: '#FFFFFF',
            borderBottom: '1px solid #E2E8F0',
            padding: '12px 16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '14px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <button
                onClick={() => setTicketSubTab('MY_TICKETS')}
                style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: 4 }}
              >
                <ArrowLeft size={20} color="#0F172A" strokeWidth={2.4} />
              </button>
              <span style={{ fontSize: '16px', fontWeight: 800, color: '#0F172A', fontFamily: 'inherit', letterSpacing: '-0.2px' }}>
                New ticket
              </span>
            </div>
            <button
              onClick={() => setShowTicketManager(false)}
              style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: 4 }}
            >
              <Headphones size={18} color="#0F172A" strokeWidth={2.2} />
            </button>
          </div>

          <div style={{ maxWidth: '520px', margin: '0 auto', padding: '0 14px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {formError && (
              <div style={{ backgroundColor: '#FEF2F2', border: '1px solid #FECACA', padding: '10px 12px', borderRadius: '10px', color: '#DC2626', fontSize: '12px', fontWeight: 600 }}>
                {formError}
              </div>
            )}

            {/* Category */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
              <label style={{ fontSize: '12px', fontWeight: 600, color: '#0F172A' }}>Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                style={{
                  backgroundColor: '#FAF9F6',
                  borderRadius: '12px',
                  border: '1px solid #ECEAE4',
                  minHeight: '44px',
                  padding: '0 12px',
                  fontSize: '12.5px',
                  color: '#0F172A',
                  outline: 'none'
                }}
              >
                {CATEGORY_OPTIONS.map((opt) => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            </div>

            {/* Subject */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
              <label style={{ fontSize: '12px', fontWeight: 600, color: '#0F172A' }}>Subject</label>
              <input
                type="text"
                placeholder="E.g, Payment not going though"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                style={{
                  backgroundColor: '#FAF9F6',
                  borderRadius: '12px',
                  border: '1px solid #ECEAE4',
                  padding: '0 12px',
                  minHeight: '44px',
                  fontSize: '12.5px',
                  color: '#0F172A',
                  outline: 'none'
                }}
              />
            </div>

            {/* Description */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
              <label style={{ fontSize: '12px', fontWeight: 600, color: '#0F172A' }}>Describe your issue</label>
              <textarea
                placeholder="Please provide as much details as possible"
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                style={{
                  backgroundColor: '#FAF9F6',
                  borderRadius: '12px',
                  border: '1px solid #ECEAE4',
                  padding: '10px 12px',
                  minHeight: '100px',
                  fontSize: '12.5px',
                  color: '#0F172A',
                  outline: 'none',
                  resize: 'vertical'
                }}
              />
            </div>

            {/* Upload File */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
              <label style={{ fontSize: '12px', fontWeight: 600, color: '#0F172A' }}>Upload file</label>
              <input
                type="file"
                ref={fileInputRef}
                style={{ display: 'none' }}
                accept="image/*"
                onChange={(e) => handlePickFile(e, false)}
              />
              {createTicketAttachment ? (
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  backgroundColor: '#FAF9F6',
                  borderRadius: '12px',
                  border: '1px solid #ECEAE4',
                  padding: '10px',
                  gap: '10px'
                }}>
                  {createTicketAttachment.uri && (
                    <img
                      src={createTicketAttachment.uri}
                      alt="Thumbnail"
                      style={{ width: '38px', height: '38px', borderRadius: '8px', objectFit: 'cover' }}
                    />
                  )}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: '12px', fontWeight: 700, color: '#0F172A', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {createTicketAttachment.name}
                    </div>
                    <div style={{ fontSize: '10.5px', color: '#475569', marginTop: '1px' }}>
                      Ready to upload (Max 10 MB)
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setCreateTicketAttachment(null)}
                    style={{ padding: '5px', borderRadius: '12px', backgroundColor: '#FEE2E2', border: 'none', cursor: 'pointer', color: '#DC2626' }}
                  >
                    <X size={14} />
                  </button>
                </div>
              ) : (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  style={{
                    backgroundColor: '#FAF9F6',
                    borderRadius: '12px',
                    border: '1.5px dashed #ECEAE4',
                    padding: '18px 12px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    gap: '3px'
                  }}
                >
                  <PlusCircle size={22} color="#0F172A" strokeWidth={2} />
                  <span style={{ fontSize: '12.5px', fontWeight: 600, color: '#0F172A', marginTop: '2px' }}>
                    Add screenshot / file
                  </span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '1px' }}>
                    <Info size={11} color="#94A3B8" />
                    <span style={{ fontSize: '10.5px', color: '#94A3B8' }}>Max 10 Mb</span>
                  </div>
                </div>
              )}
            </div>

            {/* Mark as Urgent Toggle */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '4px 0' }}>
              <label style={{ fontSize: '12.5px', fontWeight: 600, color: '#0F172A', cursor: 'pointer' }}>
                Mark as urgent
              </label>
              <input
                type="checkbox"
                checked={isUrgent}
                onChange={(e) => setPriority(e.target.checked ? 'high' : 'medium')}
                style={{ width: '18px', height: '18px', cursor: 'pointer', accentColor: '#1B4FDF' }}
              />
            </div>

            {/* Submit Pill Button */}
            <button
              type="button"
              onClick={handleCreateTicket}
              disabled={isSubmitting}
              style={{
                backgroundColor: '#1B4FDF',
                borderRadius: '20px',
                height: '42px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                color: '#FFFFFF',
                fontSize: '13px',
                fontWeight: 700,
                border: 'none',
                cursor: isSubmitting ? 'default' : 'pointer',
                boxShadow: '0 3px 6px rgba(27, 79, 223, 0.25)',
                marginTop: '4px'
              }}
            >
              {isSubmitting ? (
                <span>Submitting...</span>
              ) : (
                <>
                  <span>Submit Ticket</span>
                  <ArrowUpCircle size={18} color="#FFFFFF" strokeWidth={2.2} />
                </>
              )}
            </button>
          </div>
        </div>
      );
    }

    // Support Tickets List
    return (
      <div style={{ backgroundColor: '#F8FAFC', minHeight: '100vh', paddingBottom: '90px', boxSizing: 'border-box' }}>
        {/* Header */}
        <div style={{
          position: 'sticky',
          top: 0,
          zIndex: 50,
          backgroundColor: '#FFFFFF',
          borderBottom: '1px solid #E2E8F0',
          padding: '12px 16px 10px',
          marginBottom: '10px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <button
                onClick={() => setShowTicketManager(false)}
                style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: 4 }}
              >
                <ArrowLeft size={20} color="#0F172A" strokeWidth={2.4} />
              </button>
              <span style={{ fontSize: '16px', fontWeight: 800, color: '#0F172A', fontFamily: 'inherit', letterSpacing: '-0.2px' }}>
                Support Tickets Desk
              </span>
            </div>
            <button
              onClick={() => setShowTicketManager(false)}
              style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: 4 }}
            >
              <Headphones size={18} color="#0F172A" strokeWidth={2.2} />
            </button>
          </div>

          {/* Search Conversation Bar */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            backgroundColor: '#FAF9F6',
            borderRadius: '12px',
            border: '1px solid #ECEAE4',
            padding: '0 12px',
            height: '40px',
            gap: '8px'
          }}>
            <Search size={15} color="#94A3B8" />
            <input
              type="text"
              placeholder="Search conversation"
              value={ticketSearchQuery}
              onChange={(e) => setTicketSearchQuery(e.target.value)}
              style={{
                flex: 1,
                border: 'none',
                outline: 'none',
                background: 'transparent',
                fontSize: '12.5px',
                color: '#0F172A'
              }}
            />
            {ticketSearchQuery && (
              <button
                onClick={() => setTicketSearchQuery('')}
                style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: 2, color: '#94A3B8' }}
              >
                <X size={14} />
              </button>
            )}
          </div>
        </div>

        {/* Tickets List */}
        <div style={{ maxWidth: '520px', margin: '0 auto', padding: '0 14px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {filteredTickets.length === 0 ? (
            <div style={{
              alignItems: 'center',
              justifyContent: 'center',
              padding: '28px 16px',
              backgroundColor: '#FFFFFF',
              borderRadius: '14px',
              border: '1px solid #E2E8F0',
              textAlign: 'center',
              display: 'flex',
              flexDirection: 'column',
              gap: '6px',
              marginTop: '8px'
            }}>
              <Ticket size={34} color="#94A3B8" />
              <div style={{ fontSize: '14px', fontWeight: 800, color: '#0F172A' }}>
                {ticketSearchQuery.trim() ? 'No Matching Tickets Found' : 'No Support Tickets Found'}
              </div>
              <div style={{ fontSize: '11.5px', color: '#475569', maxWidth: '300px', lineHeight: '16px' }}>
                {ticketSearchQuery.trim()
                  ? 'Try adjusting your search keywords.'
                  : "You haven't submitted any technical tickets yet. Tap the '+' button below to log an inquiry."}
              </div>
            </div>
          ) : (
            filteredTickets.map((t) => {
              const isResolved = t.status === 'RESOLVED' || t.status === 'CLOSED';
              return (
                <div
                  key={t.id}
                  onClick={() => handleOpenTicketChat(t)}
                  style={{
                    backgroundColor: '#FFFFFF',
                    borderRadius: '14px',
                    border: '1px solid #E2E8F0',
                    padding: '12px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '5px',
                    cursor: 'pointer',
                    boxShadow: '0 1px 3px rgba(15, 23, 42, 0.02)'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Ticket size={13} color="#1B4FDF" />
                      <span style={{ fontSize: '11px', fontWeight: 800, color: '#1B4FDF' }}>{t.ticketNumber}</span>
                    </div>
                    <span style={{
                      padding: '2.5px 7px',
                      borderRadius: '4px',
                      fontSize: '10px',
                      fontWeight: 800,
                      textTransform: 'uppercase',
                      backgroundColor: isResolved ? '#DCFCE7' : '#FEF3C7',
                      color: isResolved ? '#15803D' : '#B45309',
                      border: `1px solid ${isResolved ? '#BBF7D0' : '#FDE68A'}`
                    }}>
                      {t.status}
                    </span>
                  </div>

                  <div style={{ fontSize: '13px', fontWeight: 700, color: '#0F172A', marginTop: '2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {t.subject}
                  </div>
                  <div style={{ fontSize: '11.5px', color: '#475569', lineHeight: '16px', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {t.description}
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '3px', paddingTop: '6px', borderTop: '1px solid #E2E8F0' }}>
                    <span style={{ backgroundColor: '#FAF9F6', border: '1px solid #ECEAE4', padding: '2px 6px', borderRadius: '4px', fontSize: '10px', fontWeight: 600, color: '#475569' }}>
                      {t.category}
                    </span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '10.5px', color: '#94A3B8' }}>
                      <Clock size={11} color="#94A3B8" />
                      <span>{t.createdAt}</span>
                      <ChevronRight size={13} color="#1B4FDF" style={{ marginLeft: 2 }} />
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Floating Action Button (FAB) */}
        <button
          onClick={() => setTicketSubTab('CREATE')}
          style={{
            position: 'fixed',
            right: 20,
            bottom: 24,
            width: '48px',
            height: '48px',
            borderRadius: '24px',
            backgroundColor: '#1B4FDF',
            border: 'none',
            color: '#FFFFFF',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            boxShadow: '0 4px 10px rgba(27, 79, 223, 0.35)',
            zIndex: 40
          }}
          aria-label="New Ticket"
        >
          <Plus size={24} strokeWidth={2.6} />
        </button>

        {/* Confirmation Modal */}
        {createdTicketSuccess && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.6)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '24px'
          }}>
            <div style={{
              width: '100%',
              maxWidth: '360px',
              backgroundColor: '#FFFFFF',
              borderRadius: '20px',
              padding: '24px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              boxShadow: '0 12px 24px rgba(15, 23, 42, 0.18)'
            }}>
              <div style={{
                width: '64px',
                height: '64px',
                borderRadius: '32px',
                backgroundColor: '#EFF6FF',
                border: '2px solid #DBEAFE',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '14px'
              }}>
                <CheckCircle2 size={32} color="#1B4FDF" strokeWidth={2.4} />
              </div>

              <div style={{ fontSize: '18px', fontWeight: 800, color: '#0F172A', textAlign: 'center', marginBottom: '4px' }}>
                Support Ticket Created
              </div>
              <div style={{ fontSize: '12.5px', color: '#64748B', textAlign: 'center', lineHeight: '18px', marginBottom: '16px' }}>
                Your technical ticket has been logged and assigned to our desk.
              </div>

              <div style={{
                width: '100%',
                backgroundColor: '#FAF9F6',
                borderRadius: '12px',
                border: '1px solid #ECEAE4',
                padding: '10px 14px',
                marginBottom: '18px',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '12px', color: '#64748B' }}>Ticket ID</span>
                  <span style={{ fontSize: '12.5px', fontWeight: 800, color: '#1B4FDF' }}>#{createdTicketSuccess.ticketNumber}</span>
                </div>
                <div style={{ height: 1, backgroundColor: '#E2E8F0' }} />
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '12px', color: '#64748B' }}>Category</span>
                  <span style={{ fontSize: '12px', fontWeight: 600, color: '#0F172A' }}>{createdTicketSuccess.category}</span>
                </div>
                <div style={{ height: 1, backgroundColor: '#E2E8F0' }} />
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '12px', color: '#64748B' }}>Status</span>
                  <span style={{ fontSize: '10.5px', fontWeight: 700, color: '#1B4FDF', backgroundColor: '#EFF6FF', padding: '2px 6px', borderRadius: '4px' }}>
                    {createdTicketSuccess.status}
                  </span>
                </div>
                <div style={{ height: 1, backgroundColor: '#E2E8F0' }} />
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '12px', color: '#64748B' }}>Response Time</span>
                  <span style={{ fontSize: '12px', fontWeight: 600, color: '#0F172A' }}>Within 2 Hours</span>
                </div>
              </div>

              <button
                onClick={() => {
                  const createdId = createdTicketSuccess.id;
                  const found = myTickets.find((t) => String(t.id) === createdId) || {
                    id: createdId,
                    ticketNumber: createdTicketSuccess.ticketNumber,
                    subject: createdTicketSuccess.subject,
                    description: '',
                    category: createdTicketSuccess.category,
                    status: createdTicketSuccess.status as any,
                    createdAt: 'Just now',
                  };
                  setCreatedTicketSuccess(null);
                  handleOpenTicketChat(found as any);
                }}
                style={{
                  width: '100%',
                  height: '44px',
                  backgroundColor: '#1B4FDF',
                  borderRadius: '12px',
                  border: 'none',
                  color: '#FFFFFF',
                  fontSize: '13.5px',
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  cursor: 'pointer'
                }}
              >
                <span>View Ticket Conversation</span>
                <ChevronRight size={16} color="#FFFFFF" strokeWidth={2.4} />
              </button>

              <button
                onClick={() => setCreatedTicketSuccess(null)}
                style={{
                  marginTop: '8px',
                  background: 'transparent',
                  border: 'none',
                  color: '#64748B',
                  fontSize: '13px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  padding: '6px'
                }}
              >
                Done
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  // 3. MAIN HELP CENTER VIEW (FAQ vs Help & Contact)
  return (
    <div style={{ backgroundColor: '#F8FAFC', minHeight: '100vh', paddingBottom: '36px', boxSizing: 'border-box' }}>
      {/* Top Header Bar */}
      <div style={{
        position: 'sticky',
        top: 0,
        zIndex: 50,
        backgroundColor: '#FFFFFF',
        borderBottom: '1px solid #E2E8F0',
        padding: '12px 16px 0',
        marginBottom: '14px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: '12px' }}>
          <button
            onClick={() => {
              if (window.history.length > 1) {
                navigate(-1);
              } else {
                navigate('/dashboard');
              }
            }}
            style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: 4 }}
            aria-label="Back"
          >
            <ArrowLeft size={20} color="#0F172A" strokeWidth={2.4} />
          </button>
          <span style={{ fontSize: '16px', fontWeight: 800, color: '#0F172A', fontFamily: 'inherit', letterSpacing: '-0.2px' }}>
            Help Center
          </span>
          <div style={{ width: '28px' }} />
        </div>

        {/* 2 Primary Top Tabs */}
        <div style={{ display: 'flex', borderTop: '1px solid #E2E8F0' }}>
          <button
            type="button"
            onClick={() => setMainTab('FAQ')}
            style={{
              flex: 1,
              padding: '12px 0',
              textAlign: 'center',
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              position: 'relative',
              fontSize: '13px',
              fontWeight: mainTab === 'FAQ' ? 800 : 600,
              color: mainTab === 'FAQ' ? '#1B4FDF' : '#64748B'
            }}
          >
            FAQ
            {mainTab === 'FAQ' && (
              <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '2.5px', backgroundColor: '#1B4FDF', borderRadius: '2px' }} />
            )}
          </button>

          <button
            type="button"
            onClick={() => setMainTab('CONTACT')}
            style={{
              flex: 1,
              padding: '12px 0',
              textAlign: 'center',
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              position: 'relative',
              fontSize: '13px',
              fontWeight: mainTab === 'CONTACT' ? 800 : 600,
              color: mainTab === 'CONTACT' ? '#1B4FDF' : '#64748B'
            }}
          >
            Help & Contact
            {mainTab === 'CONTACT' && (
              <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '2.5px', backgroundColor: '#1B4FDF', borderRadius: '2px' }} />
            )}
          </button>
        </div>
      </div>

      <div style={{ maxWidth: '520px', margin: '0 auto', padding: '0 14px' }}>
        {mainTab === 'FAQ' ? (
          /* TAB 1: FAQ ACCORDION */
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {/* Category Pills */}
            <div style={{ display: 'flex', gap: '6px', overflowX: 'auto', paddingBottom: '12px', scrollbarWidth: 'none' }}>
              {categories.map((cat) => {
                const isSelected = activeFAQCategory === cat;
                return (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => {
                      setActiveFAQCategory(cat);
                      setExpandedFAQIndex(0);
                    }}
                    style={{
                      padding: '6px 12px',
                      borderRadius: '16px',
                      backgroundColor: isSelected ? '#1B4FDF' : '#FFFFFF',
                      border: `1px solid ${isSelected ? '#1B4FDF' : '#E2E8F0'}`,
                      color: isSelected ? '#FFFFFF' : '#475569',
                      fontSize: '11.5px',
                      fontWeight: isSelected ? 700 : 600,
                      cursor: 'pointer',
                      whiteSpace: 'nowrap'
                    }}
                  >
                    {cat}
                  </button>
                );
              })}
            </div>

            {/* Search Bar */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              backgroundColor: '#FFFFFF',
              border: '1px solid #E2E8F0',
              borderRadius: '12px',
              padding: '0 12px',
              height: '40px',
              gap: '8px',
              marginBottom: '14px',
              boxShadow: '0 1px 2px rgba(15, 23, 42, 0.02)'
            }}>
              <Search size={16} color="#94A3B8" />
              <input
                type="text"
                placeholder="Search for help..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  flex: 1,
                  border: 'none',
                  outline: 'none',
                  fontSize: '12.5px',
                  color: '#0F172A'
                }}
              />
              {searchQuery ? (
                <button
                  onClick={() => setSearchQuery('')}
                  style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: 2 }}
                >
                  <X size={14} color="#64748B" />
                </button>
              ) : (
                <SlidersHorizontal size={14} color="#94A3B8" />
              )}
            </div>

            {/* FAQ List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {filteredFAQs.length === 0 ? (
                <div style={{
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '32px 16px',
                  backgroundColor: '#FFFFFF',
                  borderRadius: '14px',
                  border: '1px solid #E2E8F0',
                  textAlign: 'center',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '4px'
                }}>
                  <HelpCircle size={28} color="#CBD5E1" />
                  <div style={{ fontSize: '14px', fontWeight: 700, color: '#0F172A', marginTop: '8px' }}>
                    No results found
                  </div>
                  <div style={{ fontSize: '11.5px', color: '#475569' }}>
                    Try searching with different keywords or switch categories.
                  </div>
                </div>
              ) : (
                filteredFAQs.map((faq, idx) => {
                  const isExpanded = expandedFAQIndex === idx;
                  return (
                    <div
                      key={idx}
                      onClick={() => setExpandedFAQIndex(isExpanded ? null : idx)}
                      style={{
                        backgroundColor: isExpanded ? '#FAF9F6' : '#FFFFFF',
                        borderRadius: '14px',
                        border: `1px solid ${isExpanded ? '#BFDBFE' : '#E2E8F0'}`,
                        padding: '14px',
                        cursor: 'pointer',
                        boxShadow: '0 1px 3px rgba(15, 23, 42, 0.02)'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px' }}>
                        <div style={{ fontSize: '13px', fontWeight: isExpanded ? 800 : 700, color: '#0F172A', lineHeight: '18px', letterSpacing: '-0.2px' }}>
                          {faq.question}
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                          <ChevronDown
                            size={16}
                            color="#94A3B8"
                            style={{
                              transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
                              transition: 'transform 0.2s ease'
                            }}
                          />
                        </div>
                      </div>

                      {isExpanded && (
                        <div style={{ marginTop: '8px', paddingTop: '8px', borderTop: '1px solid #E2E8F0', fontSize: '11.5px', color: '#475569', lineHeight: '16.5px' }}>
                          {faq.answer}
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        ) : (
          /* TAB 2: HELP & CONTACT 4 OPTIONS VIEW */
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '2px' }}>
            {/* Option 1: Support Ticket */}
            <div
              onClick={() => {
                setTicketSubTab('MY_TICKETS');
                setShowTicketManager(true);
              }}
              style={{
                backgroundColor: '#FFFFFF',
                borderRadius: '14px',
                border: '1px solid #E2E8F0',
                padding: '12px 14px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                cursor: 'pointer',
                boxShadow: '0 1px 3px rgba(15, 23, 42, 0.02)'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <Headphones size={18} color="#0F172A" strokeWidth={2.2} />
                <span style={{ fontSize: '13px', fontWeight: 600, color: '#0F172A', letterSpacing: '-0.1px' }}>
                  Support Ticket
                </span>
              </div>
              {myTickets.length > 0 ? (
                <span style={{ backgroundColor: '#EFF6FF', border: '1px solid #BFDBFE', padding: '3px 8px', borderRadius: '10px', fontSize: '11px', fontWeight: 800, color: '#1B4FDF' }}>
                  {myTickets.length}
                </span>
              ) : (
                <ChevronRight size={16} color="#94A3B8" />
              )}
            </div>

            {/* Option 2: Contact */}
            <a
              href="tel:18002098800"
              style={{
                backgroundColor: '#FFFFFF',
                borderRadius: '14px',
                border: '1px solid #E2E8F0',
                padding: '12px 14px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                textDecoration: 'none',
                boxShadow: '0 1px 3px rgba(15, 23, 42, 0.02)'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <Phone size={18} color="#0F172A" strokeWidth={2.2} />
                <span style={{ fontSize: '13px', fontWeight: 600, color: '#0F172A', letterSpacing: '-0.1px' }}>
                  Contact
                </span>
              </div>
              <ChevronRight size={16} color="#94A3B8" />
            </a>

            {/* Option 3: Email */}
            <a
              href="mailto:support@jobmarket.com"
              style={{
                backgroundColor: '#FFFFFF',
                borderRadius: '14px',
                border: '1px solid #E2E8F0',
                padding: '12px 14px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                textDecoration: 'none',
                boxShadow: '0 1px 3px rgba(15, 23, 42, 0.02)'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <Mail size={18} color="#0F172A" strokeWidth={2.2} />
                <span style={{ fontSize: '13px', fontWeight: 600, color: '#0F172A', letterSpacing: '-0.1px' }}>
                  Email
                </span>
              </div>
              <ChevronRight size={16} color="#94A3B8" />
            </a>

            {/* Option 4: Website */}
            <a
              href="https://jobmarket-ongn.onrender.com"
              target="_blank"
              rel="noreferrer"
              style={{
                backgroundColor: '#FFFFFF',
                borderRadius: '14px',
                border: '1px solid #E2E8F0',
                padding: '12px 14px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                textDecoration: 'none',
                boxShadow: '0 1px 3px rgba(15, 23, 42, 0.02)'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <Globe size={18} color="#0F172A" strokeWidth={2.2} />
                <span style={{ fontSize: '13px', fontWeight: 600, color: '#0F172A', letterSpacing: '-0.1px' }}>
                  Website
                </span>
              </div>
              <ChevronRight size={16} color="#94A3B8" />
            </a>
          </div>
        )}
      </div>
    </div>
  );
};

export default ContactPage;
