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
    const matchesCategory = item.category === activeFAQCategory;
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

        /* Mobile View (max-width: 768px) */
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
            padding: 10px 14px 0;
            margin-bottom: 10px;
            display: block;
          }

          .help-desktop-tab-row {
            display: none;
          }

          .help-center-container {
            max-width: 100%;
            padding: 0 12px;
            gap: 10px;
          }

          .help-card {
            border-radius: var(--radius-card, 8px);
            padding: 14px;
            gap: 10px;
          }

          .help-contact-grid {
            display: flex;
            flex-direction: column;
            gap: 8px;
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
              <ArrowLeft size={18} color="#0F172A" strokeWidth={2.4} />
            </button>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
                <span style={{ fontSize: '14px', fontWeight: 800, color: '#0F172A', letterSpacing: '-0.2px' }}>
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
              <div style={{ fontSize: '11px', color: '#475569', marginTop: '1px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
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
                            fontSize: '10px',
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
                        <div style={{ alignSelf: 'flex-end', maxWidth: '80%', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px' }}>
                          {msg.attachment && (
                            <img
                              src={msg.attachment}
                              alt="Attachment"
                              onClick={() => setPreviewImageModal(msg.attachment!)}
                              style={{ width: '220px', height: '130px', objectFit: 'cover', borderRadius: '8px', cursor: 'pointer', border: '1px solid #E2E8F0' }}
                            />
                          )}
                          {msg.text && (
                            <div style={{
                              backgroundColor: '#1B4FDF',
                              borderRadius: '10px',
                              padding: '8px 12px',
                              color: '#FFFFFF',
                              fontSize: '12px',
                              lineHeight: '17px',
                              wordBreak: 'break-word',
                              boxShadow: '0 1px 3px rgba(27, 79, 223, 0.15)'
                            }}>
                              {msg.text}
                              <div style={{ fontSize: '9px', color: 'rgba(255, 255, 255, 0.8)', textAlign: 'right', marginTop: '3px' }}>
                                {formatMessageTime(msgDate)}
                              </div>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div style={{ alignSelf: 'flex-start', maxWidth: '80%', display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '4px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '10px', fontWeight: 700, color: '#64748B', marginLeft: '4px' }}>
                            <Headphones size={11} color="#1B4FDF" />
                            <span>{msg.senderName || 'JobMarket Support'}</span>
                          </div>
                          {msg.attachment && (
                            <img
                              src={msg.attachment}
                              alt="Attachment"
                              onClick={() => setPreviewImageModal(msg.attachment!)}
                              style={{ width: '220px', height: '130px', objectFit: 'cover', borderRadius: '8px', cursor: 'pointer', border: '1px solid #E2E8F0' }}
                            />
                          )}
                          {msg.text && (
                            <div style={{
                              backgroundColor: '#FFFFFF',
                              border: '1px solid #E2E8F0',
                              borderRadius: '10px',
                              padding: '8px 12px',
                              color: '#0F172A',
                              fontSize: '12px',
                              lineHeight: '17px',
                              wordBreak: 'break-word',
                              boxShadow: '0 1px 2px rgba(15, 23, 42, 0.04)'
                            }}>
                              {msg.text}
                              <div style={{ fontSize: '9px', color: '#94A3B8', textAlign: 'right', marginTop: '3px' }}>
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
                style={{ width: '34px', height: '34px', borderRadius: '6px', border: '1px solid #E2E8F0', background: '#F8FAFC', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#64748B' }}
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
                  height: '36px',
                  borderRadius: '6px',
                  border: '1px solid #E2E8F0',
                  padding: '0 12px',
                  fontSize: '12px',
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
                  width: '36px',
                  height: '36px',
                  borderRadius: '6px',
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
                <Send size={15} />
              </button>
            </div>
          </div>
        </div>
      ) : showTicketManager ? (
        /* 2. SUPPORT TICKETS DESK & NEW TICKET VIEW */
        <div className="help-center-container">
          {ticketSubTab === 'CREATE' ? (
            <div className="help-card">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: '8px', borderBottom: '1px solid #E2E8F0' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <button
                    onClick={() => setTicketSubTab('MY_TICKETS')}
                    style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: 2, display: 'flex', alignItems: 'center' }}
                  >
                    <ArrowLeft size={18} color="#0F172A" />
                  </button>
                  <span style={{ fontSize: '14px', fontWeight: 700, color: '#0F172A' }}>
                    Create Support Ticket
                  </span>
                </div>
                <button
                  onClick={() => setShowTicketManager(false)}
                  style={{ background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '11.5px', color: '#64748B', fontWeight: 600 }}
                >
                  Close
                </button>
              </div>

              {formError && (
                <div style={{ backgroundColor: '#FEF2F2', border: '1px solid #FECACA', padding: '8px 12px', borderRadius: '6px', color: '#DC2626', fontSize: '11.5px', fontWeight: 600 }}>
                  {formError}
                </div>
              )}

              <form onSubmit={handleCreateTicketSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '10px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '10.5px', fontWeight: 600, color: '#475569', marginBottom: '3px' }}>Category</label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      style={{ width: '100%', height: '36px', borderRadius: '6px', border: '1px solid #ECEAE4', backgroundColor: '#FAF9F6', padding: '0 10px', fontSize: '11.5px', color: '#0F172A', outline: 'none' }}
                    >
                      {CATEGORY_OPTIONS.map((opt) => (
                        <option key={opt} value={opt}>{opt}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '10.5px', fontWeight: 600, color: '#475569', marginBottom: '3px' }}>Priority Level</label>
                    <div style={{ display: 'flex', gap: '6px' }}>
                      {(['low', 'medium', 'high'] as const).map((p) => (
                        <button
                          key={p}
                          type="button"
                          onClick={() => setPriority(p)}
                          style={{
                            flex: 1,
                            height: '36px',
                            borderRadius: '6px',
                            border: `1px solid ${priority === p ? '#1B4FDF' : '#E2E8F0'}`,
                            backgroundColor: priority === p ? '#EFF6FF' : '#FAF9F6',
                            color: priority === p ? '#1B4FDF' : '#475569',
                            fontSize: '11.5px',
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
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '10.5px', fontWeight: 600, color: '#475569', marginBottom: '3px' }}>Subject Summary</label>
                  <input
                    type="text"
                    placeholder="E.g., Problem submitting job application"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    style={{ width: '100%', height: '36px', borderRadius: '6px', border: '1px solid #ECEAE4', backgroundColor: '#FAF9F6', padding: '0 10px', fontSize: '11.5px', color: '#0F172A', outline: 'none', boxSizing: 'border-box' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '10.5px', fontWeight: 600, color: '#475569', marginBottom: '3px' }}>Detailed Explanation</label>
                  <textarea
                    rows={4}
                    placeholder="Describe your question or issue in detail..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    style={{ width: '100%', borderRadius: '6px', border: '1px solid #ECEAE4', backgroundColor: '#FAF9F6', padding: '8px 10px', fontSize: '11.5px', color: '#0F172A', outline: 'none', resize: 'vertical', boxSizing: 'border-box' }}
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
                    style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '6px 12px', borderRadius: '6px', border: '1px solid #CBD5E1', backgroundColor: '#FAF9F6', fontSize: '11px', fontWeight: 600, color: '#0F172A', cursor: 'pointer' }}
                  >
                    <Paperclip size={13} color="#1B4FDF" />
                    <span>{createTicketAttachment ? createTicketAttachment.name : 'Attach Screenshot or Document'}</span>
                  </button>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  style={{
                    width: '100%',
                    height: '38px',
                    borderRadius: '6px',
                    backgroundColor: '#1B4FDF',
                    border: 'none',
                    color: '#FFFFFF',
                    fontSize: '12px',
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
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: '8px', borderBottom: '1px solid #E2E8F0' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Ticket size={16} color="#1B4FDF" />
                  <span style={{ fontSize: '14px', fontWeight: 700, color: '#0F172A' }}>
                    Support Tickets Desk
                  </span>
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    onClick={() => setTicketSubTab('CREATE')}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                      padding: '6px 12px',
                      borderRadius: '6px',
                      backgroundColor: '#1B4FDF',
                      border: 'none',
                      color: '#FFFFFF',
                      fontSize: '11.5px',
                      fontWeight: 700,
                      cursor: 'pointer'
                    }}
                  >
                    <Plus size={13} />
                    <span>New Ticket</span>
                  </button>
                  <button
                    onClick={() => setShowTicketManager(false)}
                    style={{ background: 'transparent', border: '1px solid #E2E8F0', borderRadius: '6px', padding: '6px 10px', fontSize: '11.5px', color: '#64748B', fontWeight: 600, cursor: 'pointer' }}
                  >
                    Back
                  </button>
                </div>
              </div>

              {/* Search Conversation Bar */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                backgroundColor: '#FAF9F6',
                borderRadius: '6px',
                border: '1px solid #ECEAE4',
                padding: '0 10px',
                height: '36px',
                gap: '8px'
              }}>
                <Search size={14} color="#94A3B8" />
                <input
                  type="text"
                  placeholder="Search tickets by ID, category, or title..."
                  value={ticketSearchQuery}
                  onChange={(e) => setTicketSearchQuery(e.target.value)}
                  style={{
                    flex: 1,
                    border: 'none',
                    outline: 'none',
                    background: 'transparent',
                    fontSize: '11.5px',
                    color: '#0F172A'
                  }}
                />
                {ticketSearchQuery && (
                  <button
                    onClick={() => setTicketSearchQuery('')}
                    style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: 2, color: '#94A3B8' }}
                  >
                    <X size={13} />
                  </button>
                )}
              </div>

              {filteredTickets.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '24px 16px', color: '#64748B', fontSize: '12px' }}>
                  <Ticket size={28} color="#94A3B8" style={{ margin: '0 auto 6px', display: 'block' }} />
                  {ticketSearchQuery.trim() ? 'No Matching Tickets Found' : 'No Support Tickets Found'}
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {filteredTickets.map((t) => {
                    const isResolved = t.status === 'RESOLVED' || t.status === 'CLOSED';
                    return (
                      <div
                        key={t.id}
                        onClick={() => handleOpenTicketChat(t)}
                        style={{
                          backgroundColor: '#FAF9F6',
                          borderRadius: '6px',
                          border: '1px solid #ECEAE4',
                          padding: '10px 12px',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '4px',
                          cursor: 'pointer',
                          transition: 'all 0.2s ease'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <span style={{ fontSize: '11px', fontWeight: 800, color: '#1B4FDF' }}>{t.ticketNumber}</span>
                            <span style={{ fontSize: '10.5px', color: '#64748B' }}>• {t.category}</span>
                          </div>
                          <span style={{
                            padding: '2px 6px',
                            borderRadius: '4px',
                            fontSize: '9.5px',
                            fontWeight: 700,
                            textTransform: 'uppercase',
                            backgroundColor: isResolved ? '#DCFCE7' : '#FEF3C7',
                            color: isResolved ? '#15803D' : '#B45309',
                            border: `1px solid ${isResolved ? '#BBF7D0' : '#FDE68A'}`
                          }}>
                            {t.status}
                          </span>
                        </div>

                        <div style={{ fontSize: '12px', fontWeight: 700, color: '#0F172A' }}>
                          {t.subject}
                        </div>
                        <div style={{ fontSize: '11px', color: '#475569', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {t.description}
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
          {/* Mobile Sticky Header Bar */}
          <div className="help-mobile-top-bar">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: '8px' }}>
              <button
                onClick={() => {
                  if (window.history.length > 1) {
                    navigate(-1);
                  } else {
                    navigate('/dashboard');
                  }
                }}
                style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: 2 }}
                aria-label="Back"
              >
                <ArrowLeft size={18} color="#0F172A" strokeWidth={2.4} />
              </button>
              <span style={{ fontSize: '14px', fontWeight: 700, color: '#0F172A', letterSpacing: '-0.2px' }}>
                Help Center
              </span>
              <div style={{ width: '24px' }} />
            </div>

            {/* Mobile Tab Switcher */}
            <div style={{ display: 'flex', borderTop: '1px solid #E2E8F0' }}>
              <button
                type="button"
                onClick={() => setMainTab('FAQ')}
                style={{
                  flex: 1,
                  padding: '10px 0',
                  textAlign: 'center',
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  position: 'relative',
                  fontSize: '12px',
                  fontWeight: mainTab === 'FAQ' ? 800 : 600,
                  color: mainTab === 'FAQ' ? '#1B4FDF' : '#64748B'
                }}
              >
                FAQ
                {mainTab === 'FAQ' && (
                  <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '2px', backgroundColor: '#1B4FDF' }} />
                )}
              </button>

              <button
                type="button"
                onClick={() => setMainTab('CONTACT')}
                style={{
                  flex: 1,
                  padding: '10px 0',
                  textAlign: 'center',
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  position: 'relative',
                  fontSize: '12px',
                  fontWeight: mainTab === 'CONTACT' ? 800 : 600,
                  color: mainTab === 'CONTACT' ? '#1B4FDF' : '#64748B'
                }}
              >
                Help & Contact
                {mainTab === 'CONTACT' && (
                  <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '2px', backgroundColor: '#1B4FDF' }} />
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
                {/* Search Bar */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  backgroundColor: '#FAF9F6',
                  border: '1px solid #ECEAE4',
                  borderRadius: '6px',
                  padding: '0 10px',
                  height: '36px',
                  gap: '8px'
                }}>
                  <Search size={14} color="#94A3B8" />
                  <input
                    type="text"
                    placeholder="Search help topics, questions, keywords..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    style={{
                      flex: 1,
                      border: 'none',
                      outline: 'none',
                      background: 'transparent',
                      fontSize: '11.5px',
                      color: '#0F172A'
                    }}
                  />
                  {searchQuery ? (
                    <button
                      onClick={() => setSearchQuery('')}
                      style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: 2 }}
                    >
                      <X size={13} color="#64748B" />
                    </button>
                  ) : (
                    <SlidersHorizontal size={13} color="#94A3B8" />
                  )}
                </div>

                {/* Category Pills */}
                <div style={{ display: 'flex', gap: '6px', overflowX: 'auto', paddingBottom: '4px', scrollbarWidth: 'none' }}>
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
                          padding: '5px 12px',
                          borderRadius: '6px',
                          backgroundColor: isSelected ? '#1B4FDF' : '#FAF9F6',
                          border: `1px solid ${isSelected ? '#1B4FDF' : '#CBD5E1'}`,
                          color: isSelected ? '#FFFFFF' : '#475569',
                          fontSize: '11px',
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

                {/* FAQ List */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginTop: '4px' }}>
                  {filteredFAQs.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '24px 16px', color: '#64748B', fontSize: '11.5px' }}>
                      <HelpCircle size={24} color="#CBD5E1" style={{ margin: '0 auto 6px', display: 'block' }} />
                      No matching questions found. Try a different keyword or category.
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
                            borderRadius: '6px',
                            border: `1px solid ${isExpanded ? '#BFDBFE' : '#E2E8F0'}`,
                            padding: '12px 14px',
                            cursor: 'pointer'
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
                            <div style={{ fontSize: '12.5px', fontWeight: isExpanded ? 700 : 600, color: '#0F172A' }}>
                              {faq.question}
                            </div>
                            <ChevronDown
                              size={14}
                              color="#94A3B8"
                              style={{
                                transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
                                transition: 'transform 0.2s ease',
                                flexShrink: 0
                              }}
                            />
                          </div>

                          {isExpanded && (
                            <div style={{ marginTop: '6px', paddingTop: '6px', borderTop: '1px solid #E2E8F0', fontSize: '11px', color: '#475569', lineHeight: '16px' }}>
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
              /* TAB 2: HELP & CONTACT CHANNELS */
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
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div style={{ width: '32px', height: '32px', borderRadius: '6px', backgroundColor: '#EFF6FF', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#1B4FDF' }}>
                        <Ticket size={16} />
                      </div>
                      {myTickets.length > 0 ? (
                        <span style={{ backgroundColor: '#EFF6FF', border: '1px solid #BFDBFE', padding: '2px 6px', borderRadius: '4px', fontSize: '9.5px', fontWeight: 800, color: '#1B4FDF' }}>
                          {myTickets.length} Active
                        </span>
                      ) : null}
                    </div>
                    <div>
                      <div style={{ fontSize: '12.5px', fontWeight: 700, color: '#0F172A' }}>Support Tickets</div>
                      <div style={{ fontSize: '10.5px', color: '#64748B', marginTop: '2px' }}>Track & log inquiries</div>
                    </div>
                  </div>

                  {/* Option 2: Contact */}
                  <a href="tel:18002098800" className="help-contact-card">
                    <div style={{ width: '32px', height: '32px', borderRadius: '6px', backgroundColor: '#EFF6FF', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#1B4FDF' }}>
                      <Phone size={16} />
                    </div>
                    <div>
                      <div style={{ fontSize: '12.5px', fontWeight: 700, color: '#0F172A' }}>Toll-Free Helpline</div>
                      <div style={{ fontSize: '10.5px', color: '#64748B', marginTop: '2px' }}>1800-209-8800</div>
                    </div>
                  </a>

                  {/* Option 3: Email */}
                  <a href="mailto:support@jobmarket.com" className="help-contact-card">
                    <div style={{ width: '32px', height: '32px', borderRadius: '6px', backgroundColor: '#EFF6FF', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#1B4FDF' }}>
                      <Mail size={16} />
                    </div>
                    <div>
                      <div style={{ fontSize: '12.5px', fontWeight: 700, color: '#0F172A' }}>Email Support</div>
                      <div style={{ fontSize: '10.5px', color: '#64748B', marginTop: '2px' }}>support@jobmarket.com</div>
                    </div>
                  </a>

                  {/* Option 4: Website */}
                  <a href="https://jobmarket-ongn.onrender.com" target="_blank" rel="noreferrer" className="help-contact-card">
                    <div style={{ width: '32px', height: '32px', borderRadius: '6px', backgroundColor: '#EFF6FF', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#1B4FDF' }}>
                      <Globe size={16} />
                    </div>
                    <div>
                      <div style={{ fontSize: '12.5px', fontWeight: 700, color: '#0F172A' }}>Official Portal</div>
                      <div style={{ fontSize: '10.5px', color: '#64748B', marginTop: '2px' }}>Knowledge base & FAQ</div>
                    </div>
                  </a>
                </div>

                {/* Operations Info Banner */}
                <div className="help-card" style={{ padding: '16px 20px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Clock size={16} color="#1B4FDF" />
                      <div>
                        <div style={{ fontSize: '12px', fontWeight: 700, color: '#0F172A' }}>Operating Support Hours</div>
                        <div style={{ fontSize: '10.5px', color: '#64748B' }}>Monday to Saturday: 9:00 AM – 7:00 PM IST • Average SLA &lt; 2 hours</div>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        setTicketSubTab('CREATE');
                        setShowTicketManager(true);
                      }}
                      style={{
                        padding: '6px 14px',
                        borderRadius: '6px',
                        backgroundColor: '#1B4FDF',
                        border: 'none',
                        color: '#FFFFFF',
                        fontSize: '11.5px',
                        fontWeight: 700,
                        cursor: 'pointer'
                      }}
                    >
                      Log a New Inquiry
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
