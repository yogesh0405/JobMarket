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

  // Help & Contact View: show 4 options menu vs detailed ticket manager
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
      if (data && data.success && Array.isArray(data.data)) {
        setMyTickets(data.data);
      }
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    fetchMyTickets();
  }, [fetchMyTickets]);

  const fetchChatMessages = useCallback(async (ticketId: string) => {
    setLoadingChatMessages(true);
    try {
      const res = await apiFetch(`/api/support/tickets/${ticketId}/messages`);
      const data = await res.json();
      if (data && data.success && Array.isArray(data.data)) {
        setChatMessages(data.data);
      } else {
        setChatMessages([]);
      }
    } catch {
      setChatMessages([]);
    } finally {
      setLoadingChatMessages(false);
    }
  }, []);

  const handleOpenTicketChat = (ticket: SupportTicket) => {
    setSelectedTicket(ticket);
    fetchChatMessages(ticket.id);
  };

  const handleSendChatMessage = async () => {
    if (!replyMessage.trim() && !selectedAttachment) return;
    if (!selectedTicket) return;

    setSendingReply(true);
    try {
      const payload = {
        text: replyMessage.trim(),
        attachment: selectedAttachment ? selectedAttachment.base64 || selectedAttachment.uri : undefined,
      };

      const res = await apiFetch(`/api/support/tickets/${selectedTicket.id}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (data && data.success && data.data) {
        setChatMessages((prev) => [...prev, data.data]);
        setReplyMessage('');
        setSelectedAttachment(null);
        setTimeout(() => {
          if (chatScrollRef.current) {
            chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
          }
        }, 100);
      }
    } catch {
      // ignore
    } finally {
      setSendingReply(false);
    }
  };

  const handleCreateTicketSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim()) {
      setFormError('Please provide a short summary subject.');
      return;
    }
    if (!description.trim()) {
      setFormError('Please detail your issue or inquiry.');
      return;
    }

    setIsSubmitting(true);
    setFormError(null);

    try {
      const payload = {
        category,
        priority,
        subject: subject.trim(),
        description: description.trim(),
        attachment: createTicketAttachment ? createTicketAttachment.base64 || createTicketAttachment.uri : undefined,
      };

      const res = await apiFetch('/api/support/tickets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (data && data.success && data.data) {
        setCreatedTicketSuccess(data.data);
        setSubject('');
        setDescription('');
        setCreateTicketAttachment(null);
        fetchMyTickets();
      } else {
        setFormError(data.message || 'Failed to submit support ticket. Please try again.');
      }
    } catch {
      setFormError('Network error while logging ticket. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, isChat = false) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      if (isChat) {
        setSelectedAttachment({ uri: result, name: file.name, base64: result });
      } else {
        setCreateTicketAttachment({ uri: result, name: file.name, base64: result });
      }
    };
    reader.readAsDataURL(file);
  };

  const filteredFAQs = FAQ_DATA.filter((item) => {
    const matchesCategory =
      activeFAQCategory === 'General'
        ? true
        : item.category.toLowerCase() === activeFAQCategory.toLowerCase();
    const matchesSearch =
      !searchQuery.trim() ||
      item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.answer.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const filteredTickets = myTickets.filter((t) => {
    if (!ticketSearchQuery.trim()) return true;
    const q = ticketSearchQuery.toLowerCase();
    return (
      t.ticketNumber?.toLowerCase().includes(q) ||
      t.subject?.toLowerCase().includes(q) ||
      t.category?.toLowerCase().includes(q) ||
      t.description?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="help-center-wrapper">
      <style>{`
        .help-center-wrapper {
          width: 100%;
          min-height: auto;
          box-sizing: border-box;
          font-family: inherit;
        }

        .help-mobile-top-bar {
          display: none;
        }

        .help-center-container {
          width: 100%;
          max-width: 100%;
          margin: 0;
          padding: 0 0 40px;
          display: flex;
          flex-direction: column;
          gap: 14px;
          box-sizing: border-box;
        }

        .help-desktop-tab-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          background-color: #FFFFFF;
          border: 1px solid #E2E8F0;
          border-radius: var(--radius-card, 8px);
          padding: 6px;
          margin-bottom: 12px;
          box-shadow: 0 1px 3px rgba(15, 23, 42, 0.04);
        }

        .help-desktop-tabs {
          display: flex;
          gap: 6px;
        }

        .help-desktop-tab-btn {
          padding: 8px 16px;
          border-radius: 6px;
          border: none;
          background: transparent;
          font-size: 12.5px;
          font-weight: 700;
          color: #64748B;
          cursor: pointer;
          transition: all 0.2s ease;
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .help-desktop-tab-btn:hover {
          color: #0F172A;
          background-color: #F8FAFC;
        }

        .help-desktop-tab-btn.active {
          background-color: #EFF6FF;
          color: #1B4FDF;
        }

        .help-card {
          background-color: #FFFFFF;
          border-radius: var(--radius-card, 8px);
          border: 1px solid #E2E8F0;
          padding: 20px 24px;
          box-shadow: 0 1px 3px rgba(15, 23, 42, 0.04);
          display: flex;
          flex-direction: column;
          gap: 12px;
          box-sizing: border-box;
          width: 100%;
        }

        .help-contact-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 12px;
        }

        .help-contact-card {
          background-color: #FFFFFF;
          border: 1px solid #E2E8F0;
          border-radius: var(--radius-card, 8px);
          padding: 16px;
          display: flex;
          flex-direction: column;
          gap: 8px;
          text-decoration: none;
          color: inherit;
          transition: all 0.2s ease;
          box-shadow: 0 1px 2px rgba(15, 23, 42, 0.03);
          cursor: pointer;
        }

        .help-contact-card:hover {
          border-color: #BFDBFE;
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(27, 79, 223, 0.08);
        }

        /* ─── MOBILE VIEW (MAX-WIDTH: 768PX) ─── */
        /* Exact 100% Mobile Metrics Matched to MobileApp */
        @media (max-width: 768px) {
          .help-center-wrapper {
            background-color: #F8FAFC;
            min-height: 100vh;
            padding-bottom: 32px;
          }

          .help-mobile-top-bar {
            position: sticky;
            top: 0;
            z-index: 50;
            background-color: #FFFFFF;
            border-bottom: 1px solid #E2E8F0;
            padding: 12px 16px 0;
            margin-bottom: 14px;
            display: block;
          }

          .help-mobile-top-title {
            font-size: 16px;
            font-weight: 800;
            color: #0F172A;
            letter-spacing: -0.2px;
          }

          .help-mobile-tab-btn {
            font-size: 13px;
            font-weight: 600;
            color: #64748B;
            padding: 12px 0;
          }

          .help-mobile-tab-btn.active {
            font-weight: 800;
            color: #1B4FDF;
          }

          .help-desktop-tab-row {
            display: none;
          }

          .help-center-container {
            max-width: 100%;
            padding: 0 14px;
            gap: 12px;
          }

          .help-card {
            background-color: #FFFFFF;
            border-radius: 14px;
            border: 1px solid #E2E8F0;
            padding: 14px;
            gap: 12px;
            box-shadow: 0 1px 3px rgba(15, 23, 42, 0.02);
          }

          /* Mobile Category Pill (11.5px, radius 16px, 12x6 padding) */
          .help-category-pill {
            padding: 6px 12px !important;
            border-radius: 16px !important;
            font-size: 11.5px !important;
            font-weight: 600 !important;
          }

          .help-category-pill.active {
            font-weight: 700 !important;
            background-color: #1B4FDF !important;
            border-color: #1B4FDF !important;
            color: #FFFFFF !important;
          }

          /* Mobile Search Bar (40px, radius 12px, 12.5px font) */
          .help-search-box {
            height: 40px !important;
            border-radius: 12px !important;
            background-color: #FFFFFF !important;
            border: 1px solid #E2E8F0 !important;
            padding: 0 12px !important;
            margin-bottom: 14px !important;
          }

          .help-search-input {
            font-size: 12.5px !important;
            color: #0F172A !important;
            font-weight: 500 !important;
          }

          /* Mobile FAQ Accordion (radius 14px, 14px padding, 13px question, 11.5px answer) */
          .help-faq-item {
            background-color: #FFFFFF !important;
            border-radius: 14px !important;
            border: 1px solid #E2E8F0 !important;
            padding: 14px !important;
          }

          .help-faq-item.expanded {
            background-color: #FAF9F6 !important;
            border-color: #BFDBFE !important;
          }

          .help-faq-question {
            font-size: 13px !important;
            font-weight: 700 !important;
            color: #0F172A !important;
            line-height: 18px !important;
            letter-spacing: -0.2px !important;
          }

          .help-faq-question.active {
            font-weight: 800 !important;
          }

          .help-faq-answer {
            font-size: 11.5px !important;
            color: #475569 !important;
            line-height: 16.5px !important;
            margin-top: 8px !important;
            padding-top: 8px !important;
          }

          /* Mobile Help & Contact 4 Option Cards (radius 14px, 12x14 padding, 13px title, 19px icon) */
          .help-contact-grid {
            display: flex;
            flex-direction: column;
            gap: 8px;
          }

          .help-contact-card {
            background-color: #FFFFFF !important;
            border-radius: 14px !important;
            border: 1px solid #E2E8F0 !important;
            padding: 12px 14px !important;
            display: flex !important;
            flex-direction: row !important;
            align-items: center !important;
            justify-content: space-between !important;
            gap: 12px !important;
          }

          .help-contact-title {
            font-size: 13px !important;
            font-weight: 600 !important;
            color: #0F172A !important;
            letter-spacing: -0.1px !important;
          }

          .help-contact-badge {
            background-color: #EFF6FF !important;
            border: 1px solid #BFDBFE !important;
            padding: 3px 8px !important;
            border-radius: 10px !important;
            font-size: 11px !important;
            font-weight: 800 !important;
            color: #1B4FDF !important;
          }
        }
      `}</style>

      {/* 1. TICKET DETAIL / CHAT VIEW */}
      {selectedTicket ? (
        <div style={{ display: 'flex', flexDirection: 'column', width: '100%', height: viewportHeight ? `${viewportHeight}px` : 'calc(100vh - 80px)', backgroundColor: '#F8FAFC', borderRadius: 'var(--radius-card, 8px)', overflow: 'hidden', border: '1px solid #E2E8F0' }}>
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
                <span style={{ fontSize: '15px', fontWeight: 800, color: '#0F172A', letterSpacing: '-0.2px' }}>
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
              <div style={{ textAlign: 'center', padding: '40px 0', color: '#64748B', fontSize: '12px' }}>
                Loading conversation...
              </div>
            ) : (
              <div style={{ width: '100%', maxWidth: '800px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '10px' }}>
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
                        <div style={{ alignSelf: 'flex-start', maxWidth: '82%', display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '4px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '10.5px', fontWeight: 700, color: '#64748B', marginLeft: '4px' }}>
                            <Headphones size={12} color="#1B4FDF" />
                            <span>{msg.senderName || 'JobMarket Support'}</span>
                          </div>
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
                              backgroundColor: '#FFFFFF',
                              border: '1px solid #E2E8F0',
                              borderRadius: '16px',
                              padding: '9px 13px',
                              color: '#0F172A',
                              fontSize: '12.5px',
                              lineHeight: '18px',
                              wordBreak: 'break-word',
                              boxShadow: '0 1px 2px rgba(15, 23, 42, 0.04)'
                            }}>
                              {msg.text}
                              <div style={{ fontSize: '9.5px', color: '#94A3B8', textAlign: 'right', marginTop: '3px' }}>
                                {formatMessageTime(msgDate)}
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </React.Fragment>
                  );
                })}
              </div>
            )}
          </div>

          {/* Chat Reply Input Bar */}
          <div style={{
            flexShrink: 0,
            backgroundColor: '#FFFFFF',
            borderTop: '1px solid #E2E8F0',
            padding: '8px 14px',
            display: 'flex',
            flexDirection: 'column',
            gap: '6px'
          }}>
            {selectedAttachment && (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#FAF9F6', border: '1px solid #ECEAE4', padding: '4px 8px', borderRadius: '6px' }}>
                <span style={{ fontSize: '11px', color: '#0F172A', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  📎 {selectedAttachment.name}
                </span>
                <button onClick={() => setSelectedAttachment(null)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#64748B' }}>
                  <X size={13} />
                </button>
              </div>
            )}

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <input
                type="file"
                ref={chatFileInputRef}
                style={{ display: 'none' }}
                accept="image/*,.pdf"
                onChange={(e) => handleFileChange(e, true)}
              />
              <button
                type="button"
                onClick={() => chatFileInputRef.current?.click()}
                style={{ width: '36px', height: '36px', borderRadius: '8px', border: '1px solid #E2E8F0', background: '#F8FAFC', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#64748B' }}
                title="Attach image or file"
              >
                <Paperclip size={16} />
              </button>

              <input
                type="text"
                ref={chatInputRef}
                placeholder="Type your response..."
                value={replyMessage}
                onChange={(e) => setReplyMessage(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendChatMessage();
                  }
                }}
                style={{
                  flex: 1,
                  height: '38px',
                  borderRadius: '8px',
                  border: '1px solid #E2E8F0',
                  padding: '0 12px',
                  fontSize: '12.5px',
                  color: '#0F172A',
                  outline: 'none',
                  backgroundColor: '#F8FAFC'
                }}
              />

              <button
                type="button"
                onClick={handleSendChatMessage}
                disabled={sendingReply || (!replyMessage.trim() && !selectedAttachment)}
                style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: '8px',
                  backgroundColor: '#1B4FDF',
                  border: 'none',
                  color: '#FFFFFF',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  opacity: sendingReply || (!replyMessage.trim() && !selectedAttachment) ? 0.5 : 1
                }}
              >
                <Send size={16} />
              </button>
            </div>
          </div>
        </div>
      ) : showTicketManager ? (
        /* 2. SUPPORT TICKETS DESK & NEW TICKET VIEW */
        <div className="help-center-container">
          {ticketSubTab === 'CREATE' ? (
            <div className="help-card">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: '10px', borderBottom: '1px solid #E2E8F0' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <button
                    onClick={() => setTicketSubTab('MY_TICKETS')}
                    style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: 2, display: 'flex', alignItems: 'center' }}
                  >
                    <ArrowLeft size={20} color="#0F172A" strokeWidth={2.4} />
                  </button>
                  <span style={{ fontSize: '16px', fontWeight: 800, color: '#0F172A', letterSpacing: '-0.2px' }}>
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

              {formError && (
                <div style={{ backgroundColor: '#FEF2F2', border: '1px solid #FECACA', padding: '10px 12px', borderRadius: '10px', color: '#DC2626', fontSize: '12px', fontWeight: 600 }}>
                  {formError}
                </div>
              )}

              <form onSubmit={handleCreateTicketSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                  <label style={{ fontSize: '12px', fontWeight: 600, color: '#0F172A' }}>Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    style={{ width: '100%', height: '44px', borderRadius: '12px', border: '1px solid #ECEAE4', backgroundColor: '#FAF9F6', padding: '0 12px', fontSize: '12.5px', color: '#0F172A', outline: 'none' }}
                  >
                    {CATEGORY_OPTIONS.map((opt) => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                  <label style={{ fontSize: '12px', fontWeight: 600, color: '#0F172A' }}>Priority</label>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    {(['low', 'medium', 'high'] as const).map((p) => (
                      <button
                        key={p}
                        type="button"
                        onClick={() => setPriority(p)}
                        style={{
                          flex: 1,
                          height: '38px',
                          borderRadius: '10px',
                          border: `1px solid ${priority === p ? '#1B4FDF' : '#E2E8F0'}`,
                          backgroundColor: priority === p ? '#EFF6FF' : '#FAF9F6',
                          color: priority === p ? '#1B4FDF' : '#475569',
                          fontSize: '12px',
                          fontWeight: 700,
                          textTransform: 'capitalize',
                          cursor: 'pointer'
                        }}
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                  <label style={{ fontSize: '12px', fontWeight: 600, color: '#0F172A' }}>Subject</label>
                  <input
                    type="text"
                    placeholder="E.g., Problem submitting job application"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    style={{ width: '100%', height: '44px', borderRadius: '12px', border: '1px solid #ECEAE4', backgroundColor: '#FAF9F6', padding: '0 12px', fontSize: '12.5px', color: '#0F172A', outline: 'none', boxSizing: 'border-box' }}
                  />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                  <label style={{ fontSize: '12px', fontWeight: 600, color: '#0F172A' }}>Description</label>
                  <textarea
                    rows={4}
                    placeholder="Provide full details of your issue..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    style={{ width: '100%', borderRadius: '12px', border: '1px solid #ECEAE4', backgroundColor: '#FAF9F6', padding: '10px 12px', fontSize: '12.5px', color: '#0F172A', outline: 'none', resize: 'vertical', boxSizing: 'border-box' }}
                  />
                </div>

                <div>
                  <input
                    type="file"
                    ref={fileInputRef}
                    style={{ display: 'none' }}
                    accept="image/*,.pdf"
                    onChange={(e) => handleFileChange(e, false)}
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '8px 14px', borderRadius: '8px', border: '1px solid #CBD5E1', backgroundColor: '#FAF9F6', fontSize: '11.5px', fontWeight: 600, color: '#0F172A', cursor: 'pointer' }}
                  >
                    <Paperclip size={14} color="#1B4FDF" />
                    <span>{createTicketAttachment ? createTicketAttachment.name : 'Attach Screenshot or Document'}</span>
                  </button>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  style={{
                    width: '100%',
                    height: '44px',
                    borderRadius: '10px',
                    backgroundColor: '#1B4FDF',
                    border: 'none',
                    color: '#FFFFFF',
                    fontSize: '13px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    marginTop: '4px',
                    opacity: isSubmitting ? 0.7 : 1
                  }}
                >
                  {isSubmitting ? 'Submitting Ticket...' : 'Submit Support Ticket'}
                </button>
              </form>
            </div>
          ) : (
            /* Support Tickets List */
            <div className="help-card">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: '10px', borderBottom: '1px solid #E2E8F0' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <button
                    onClick={() => setShowTicketManager(false)}
                    style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: 2, display: 'flex', alignItems: 'center' }}
                  >
                    <ArrowLeft size={20} color="#0F172A" strokeWidth={2.4} />
                  </button>
                  <span style={{ fontSize: '16px', fontWeight: 800, color: '#0F172A', letterSpacing: '-0.2px' }}>
                    Support Tickets Desk
                  </span>
                </div>
                <button
                  onClick={() => setTicketSubTab('CREATE')}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    padding: '6px 12px',
                    borderRadius: '8px',
                    backgroundColor: '#1B4FDF',
                    border: 'none',
                    color: '#FFFFFF',
                    fontSize: '12px',
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  <Plus size={14} />
                  <span>New Ticket</span>
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

              {filteredTickets.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '32px 16px', color: '#64748B', fontSize: '12.5px' }}>
                  <Ticket size={32} color="#94A3B8" style={{ margin: '0 auto 8px', display: 'block' }} />
                  <div style={{ fontSize: '14px', fontWeight: 800, color: '#0F172A', marginBottom: '4px' }}>
                    {ticketSearchQuery.trim() ? 'No Matching Tickets Found' : 'No Support Tickets Found'}
                  </div>
                  <div style={{ fontSize: '11.5px', color: '#475569', maxWidth: '280px', margin: '0 auto' }}>
                    {ticketSearchQuery.trim()
                      ? 'Try adjusting your search keywords.'
                      : "You haven't submitted any technical tickets yet. Tap 'New Ticket' above to log an inquiry."}
                  </div>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {filteredTickets.map((t) => {
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
                            <span style={{ fontSize: '10.5px', fontWeight: 800, color: '#1B4FDF', backgroundColor: '#EFF6FF', padding: '2.5px 7px', borderRadius: '5px' }}>
                              {t.ticketNumber}
                            </span>
                          </div>
                          <span style={{
                            padding: '2.5px 7px',
                            borderRadius: '5px',
                            fontSize: '10px',
                            fontWeight: 800,
                            textTransform: 'uppercase',
                            backgroundColor: isResolved ? '#DCFCE7' : '#FEF3C7',
                            color: isResolved ? '#15803D' : '#B45309'
                          }}>
                            {t.status}
                          </span>
                        </div>

                        <div style={{ fontSize: '13px', fontWeight: 700, color: '#0F172A', marginTop: '2px' }}>
                          {t.subject}
                        </div>
                        <div style={{ fontSize: '11.5px', color: '#475569', lineHeight: '16px', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                          {t.description}
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '2px', paddingTop: '6px', borderTop: '1px solid #E2E8F0' }}>
                          <span style={{ backgroundColor: '#FAF9F6', border: '1px solid #ECEAE4', padding: '2.5px 6px', borderRadius: '4px', fontSize: '10px', fontWeight: 600, color: '#475569' }}>
                            {t.category}
                          </span>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '10.5px', color: '#94A3B8' }}>
                            <Clock size={11} color="#94A3B8" />
                            <span>{t.createdAt}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      ) : (
        /* 3. MAIN HELP CENTER (FAQ VS HELP & CONTACT) */
        <div>
          {/* Mobile Sticky Header Bar (16px title, 13px tabs with blue active indicator) */}
          <div className="help-mobile-top-bar">
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
              <span className="help-mobile-top-title">
                Help Center
              </span>
              <div style={{ width: '28px' }} />
            </div>

            {/* Mobile Tab Switcher */}
            <div style={{ display: 'flex', borderTop: '1px solid #E2E8F0' }}>
              <button
                type="button"
                className={`help-mobile-tab-btn ${mainTab === 'FAQ' ? 'active' : ''}`}
                onClick={() => setMainTab('FAQ')}
                style={{
                  flex: 1,
                  textAlign: 'center',
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  position: 'relative'
                }}
              >
                FAQ
                {mainTab === 'FAQ' && (
                  <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '2.5px', backgroundColor: '#1B4FDF', borderRadius: '2px' }} />
                )}
              </button>

              <button
                type="button"
                className={`help-mobile-tab-btn ${mainTab === 'CONTACT' ? 'active' : ''}`}
                onClick={() => setMainTab('CONTACT')}
                style={{
                  flex: 1,
                  textAlign: 'center',
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  position: 'relative'
                }}
              >
                Help & Contact
                {mainTab === 'CONTACT' && (
                  <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '2.5px', backgroundColor: '#1B4FDF', borderRadius: '2px' }} />
                )}
              </button>
            </div>
          </div>

          <div className="help-center-container">
            {/* Desktop Tab Switcher */}
            <div className="help-desktop-tab-row">
              <div className="help-desktop-tabs">
                <button
                  type="button"
                  className={`help-desktop-tab-btn ${mainTab === 'FAQ' ? 'active' : ''}`}
                  onClick={() => setMainTab('FAQ')}
                >
                  <HelpCircle size={15} />
                  <span>Frequently Asked Questions (FAQ)</span>
                </button>
                <button
                  type="button"
                  className={`help-desktop-tab-btn ${mainTab === 'CONTACT' ? 'active' : ''}`}
                  onClick={() => setMainTab('CONTACT')}
                >
                  <Headphones size={15} />
                  <span>Help & Contact Channels</span>
                </button>
              </div>

              <button
                type="button"
                onClick={() => {
                  setTicketSubTab('MY_TICKETS');
                  setShowTicketManager(true);
                }}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  backgroundColor: '#FAF9F6',
                  border: '1px solid #CBD5E1',
                  borderRadius: '6px',
                  padding: '6px 12px',
                  fontSize: '11.5px',
                  fontWeight: 700,
                  color: '#0F172A',
                  cursor: 'pointer'
                }}
              >
                <Ticket size={13} color="#1B4FDF" />
                <span>Support Tickets Desk ({myTickets.length})</span>
              </button>
            </div>

            {mainTab === 'FAQ' ? (
              /* TAB 1: FAQ ACCORDION */
              <div className="help-card">
                {/* Category Pills (11.5px font, radius 16px, padding 6x12) */}
                <div style={{ display: 'flex', gap: '6px', overflowX: 'auto', paddingBottom: '12px', scrollbarWidth: 'none' }}>
                  {categories.map((cat) => {
                    const isSelected = activeFAQCategory === cat;
                    return (
                      <button
                        key={cat}
                        type="button"
                        className={`help-category-pill ${isSelected ? 'active' : ''}`}
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

                {/* Search Bar (height 40px, radius 12px, font 12.5px) */}
                <div className="help-search-box" style={{
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
                  <Search size={18} color="#94A3B8" />
                  <input
                    type="text"
                    className="help-search-input"
                    placeholder="Search for help..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    style={{
                      flex: 1,
                      border: 'none',
                      outline: 'none',
                      fontSize: '12.5px',
                      color: '#0F172A',
                      fontWeight: 500
                    }}
                  />
                  {searchQuery ? (
                    <button
                      onClick={() => setSearchQuery('')}
                      style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: 2 }}
                    >
                      <X size={16} color="#64748B" />
                    </button>
                  ) : (
                    <SlidersHorizontal size={16} color="#94A3B8" />
                  )}
                </div>

                {/* FAQ List (radius 14px, 14px padding, 13px question, 11.5px answer) */}
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
                      <HelpCircle size={32} color="#CBD5E1" />
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
                          className={`help-faq-item ${isExpanded ? 'expanded' : ''}`}
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
                            <div className={`help-faq-question ${isExpanded ? 'active' : ''}`} style={{ fontSize: '13px', fontWeight: isExpanded ? 800 : 700, color: '#0F172A', lineHeight: '18px', letterSpacing: '-0.2px' }}>
                              {faq.question}
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                              <ChevronDown
                                size={18}
                                color={isExpanded ? '#1B4FDF' : '#64748B'}
                                style={{
                                  transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
                                  transition: 'transform 0.2s ease'
                                }}
                              />
                            </div>
                          </div>

                          {isExpanded && (
                            <div className="help-faq-answer" style={{ marginTop: '8px', paddingTop: '8px', borderTop: '1px solid #E2E8F0', fontSize: '11.5px', color: '#475569', lineHeight: '16.5px' }}>
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
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div className="help-contact-grid">
                  {/* Option 1: Support Ticket */}
                  <div
                    className="help-contact-card"
                    onClick={() => {
                      setTicketSubTab('MY_TICKETS');
                      setShowTicketManager(true);
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <Headphones size={19} color="#0F172A" strokeWidth={2.2} />
                      <span className="help-contact-title" style={{ fontSize: '13px', fontWeight: 600, color: '#0F172A', letterSpacing: '-0.1px' }}>
                        Support Ticket
                      </span>
                    </div>
                    {myTickets.length > 0 ? (
                      <span className="help-contact-badge" style={{ backgroundColor: '#EFF6FF', border: '1px solid #BFDBFE', padding: '3px 8px', borderRadius: '10px', fontSize: '11px', fontWeight: 800, color: '#1B4FDF' }}>
                        {myTickets.length}
                      </span>
                    ) : (
                      <ChevronRight size={16} color="#94A3B8" />
                    )}
                  </div>

                  {/* Option 2: Contact */}
                  <a
                    href="tel:18002098800"
                    className="help-contact-card"
                    style={{ textDecoration: 'none' }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <Phone size={19} color="#0F172A" strokeWidth={2.2} />
                      <span className="help-contact-title" style={{ fontSize: '13px', fontWeight: 600, color: '#0F172A', letterSpacing: '-0.1px' }}>
                        Contact
                      </span>
                    </div>
                    <ChevronRight size={16} color="#94A3B8" />
                  </a>

                  {/* Option 3: Email */}
                  <a
                    href="mailto:support@jobmarket.com"
                    className="help-contact-card"
                    style={{ textDecoration: 'none' }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <Mail size={19} color="#0F172A" strokeWidth={2.2} />
                      <span className="help-contact-title" style={{ fontSize: '13px', fontWeight: 600, color: '#0F172A', letterSpacing: '-0.1px' }}>
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
                    className="help-contact-card"
                    style={{ textDecoration: 'none' }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <Globe size={19} color="#0F172A" strokeWidth={2.2} />
                      <span className="help-contact-title" style={{ fontSize: '13px', fontWeight: 600, color: '#0F172A', letterSpacing: '-0.1px' }}>
                        Website
                      </span>
                    </div>
                    <ChevronRight size={16} color="#94A3B8" />
                  </a>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
