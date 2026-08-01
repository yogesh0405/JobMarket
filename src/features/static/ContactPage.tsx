import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../hooks/useToast';
import { apiFetch } from '../../utils/api';
import { 
  Headphones, 
  Search, 
  Mail, 
  Phone, 
  MapPin, 
  Clock, 
  ShieldAlert, 
  FileText, 
  Paperclip, 
  Send, 
  RefreshCw, 
  CheckCircle2, 
  MessageSquare, 
  ChevronDown, 
  X,
  AlertCircle
} from 'lucide-react';

interface SupportTicket {
  id: string;
  ticket_number: string;
  user_id: string | null;
  full_name: string;
  email: string;
  phone: string | null;
  category: string;
  subject: string;
  description: string;
  attachment: string | null;
  preferred_contact: string;
  priority: 'low' | 'medium' | 'high';
  status: 'open' | 'in_progress' | 'waiting_for_user' | 'resolved' | 'closed';
  assigned_admin: string | null;
  created_at: string;
  updated_at: string;
  last_reply_at: string;
  device: string | null;
  browser: string | null;
}

interface SupportMessage {
  id: string;
  ticket_id: string;
  sender_id: string | null;
  message: string;
  attachment: string | null;
  seen: boolean;
  created_at: string;
  sender_name?: string;
  sender_role?: string;
}

interface InAppNotification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  is_read: boolean;
  link: string | null;
  created_at: string;
}

const FAQ_DATA = [
  {
    category: 'Account',
    question: 'How do I update my profile details?',
    answer: 'Go to your Dashboard, click on "My Profile" in the sidebar, and you can edit your personal details, Aadhaar number, shifts, and contact information. Updates are saved instantly.'
  },
  {
    category: 'Account',
    question: 'How can I reset my password?',
    answer: 'If you are logged out, click "Forgot Password" on the Login page. If you are logged in, navigate to Settings from your profile dropdown to update your account credentials.'
  },
  {
    category: 'Login',
    question: 'Why am I not receiving the OTP for login?',
    answer: 'OTP emails are sent via Brevo. Please check your Spam/Junk folder. Ensure the email address entered is correct and matches your registered account email.'
  },
  {
    category: 'Candidate',
    question: 'How do I upload or modify my resume?',
    answer: 'Navigate to "My Resume" from the sidebar menu in your Dashboard. You can upload files in PDF, PNG, JPG, or DOCX formats up to 5MB. Resumes are safely stored in Cloudinary for rapid load times.'
  },
  {
    category: 'Employer',
    question: 'How do I verify my company status?',
    answer: 'During registration or profile editing, enter your company name and GST number. Our system validates the business registration to ensure factory candidates apply to legitimate employers.'
  },
  {
    category: 'Job Posting',
    question: 'How long does job approval take?',
    answer: 'Once an employer posts a job, it enters the admin approval queue. Admin verification typically takes less than 2 hours, after which the listing becomes visible to candidates.'
  },
  {
    category: 'Job Applications',
    question: 'How do I track my applied jobs?',
    answer: 'Candidates can view all applications in the "Applied Jobs" tab of their Dashboard. Statuses like "Applied", "Reviewed", "Shortlisted", "Accepted", or "Rejected" are visible in real-time.'
  },
  {
    category: 'Payments',
    question: 'Are there any fees for job posting?',
    answer: 'JobMarket is currently free to use for both factory employers and technical job seekers. Premium plans for advanced filtering and candidate messaging will be introduced soon.'
  },
  {
    category: 'Technical',
    question: 'The website is not loading properly on my mobile phone. What should I do?',
    answer: 'JobMarket is fully responsive. Clear your browser cache or open the website in a private/incognito window. Supported browsers include Google Chrome, Safari, and Firefox.'
  },
  {
    category: 'Feature Requests',
    question: 'Can I request custom features for my factory operations?',
    answer: 'Yes! Create a support ticket choosing the "Feature Request" category, and describe the tools or workflow improvements you would like to see in our industrial marketplace.'
  }
];

export const ContactPage: React.FC = () => {
  const { currentUser } = useAuth();
  const { showToast } = useToast();

  // Form State
  const [fullName, setFullName] = useState(currentUser?.name || '');
  const [email, setEmail] = useState(currentUser?.email || '');
  const [phone, setPhone] = useState('');
  const [category, setCategory] = useState('General Inquiry');
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [preferredContact, setPreferredContact] = useState('Email');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [privacyPolicy, setPrivacyPolicy] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Attachment State
  const [attachmentBase64, setAttachmentBase64] = useState<string | undefined>(undefined);
  const [attachmentName, setAttachmentName] = useState<string | undefined>(undefined);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Search & Accordion State
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFAQCategory, setActiveFAQCategory] = useState<string | null>('Account');
  const [expandedFAQIndex, setExpandedFAQIndex] = useState<number | null>(null);

  // User Tickets State
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
  const [messages, setMessages] = useState<SupportMessage[]>([]);
  const [replyText, setReplyText] = useState('');
  const [replyBase64, setReplyBase64] = useState<string | undefined>(undefined);
  const [replyFileName, setReplyFileName] = useState<string | undefined>(undefined);
  const replyFileInputRef = useRef<HTMLInputElement>(null);
  const [isSendingReply, setIsSendingReply] = useState(false);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);

  // Notifications State
  const [notifications, setNotifications] = useState<InAppNotification[]>([]);
  
  // Ref for scrolling chat to bottom
  const chatBottomRef = useRef<HTMLDivElement>(null);

  // Load User Data
  useEffect(() => {
    if (currentUser) {
      fetchUserTickets();
      fetchNotifications();
    }
  }, [currentUser]);

  // Scroll to bottom of chat when messages change
  useEffect(() => {
    if (chatBottomRef.current) {
      chatBottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, selectedTicket]);

  const fetchUserTickets = async () => {
    try {
      const res = await apiFetch('/api/support/tickets');
      const data = await res.json();
      if (data.success) {
        setTickets(data.data);
      }
    } catch (err) {
      console.error('Failed to load tickets:', err);
    }
  };

  const fetchNotifications = async () => {
    try {
      const res = await apiFetch('/api/support/notifications');
      const data = await res.json();
      if (data.success) {
        setNotifications(data.data);
      }
    } catch (err) {
      console.error('Failed to load notifications:', err);
    }
  };

  const markNotificationRead = async (id: string) => {
    try {
      const res = await apiFetch(`/api/support/notifications/${id}/read`, { method: 'PATCH' });
      const data = await res.json();
      if (data.success) {
        setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
      }
    } catch (err) {
      console.error('Failed to read notification:', err);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      if (file.size > 10 * 1024 * 1024) {
        showToast('File size must be under 10MB', 'error');
        return;
      }
      setAttachmentName(file.name);
      const reader = new FileReader();
      reader.onloadend = () => {
        setAttachmentBase64(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleReplyFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      if (file.size > 10 * 1024 * 1024) {
        showToast('File size must be under 10MB', 'error');
        return;
      }
      setReplyFileName(file.name);
      const reader = new FileReader();
      reader.onloadend = () => {
        setReplyBase64(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCreateTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (phone && phone.length !== 10) {
      showToast('Phone number must be exactly 10 digits', 'error');
      return;
    }
    if (!privacyPolicy) {
      showToast('You must agree to the Privacy Policy', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await apiFetch('/api/support/tickets', {
        method: 'POST',
        body: JSON.stringify({
          fullName,
          email,
          phone,
          category,
          subject,
          description,
          attachmentBase64,
          attachmentName,
          preferredContact,
          priority
        })
      });

      const data = await res.json();
      if (data.success) {
        showToast(`Support Ticket ${data.data.ticket_number} created successfully!`, 'success');
        setSubject('');
        setDescription('');
        setAttachmentBase64(undefined);
        setAttachmentName(undefined);
        if (fileInputRef.current) fileInputRef.current.value = '';
        if (currentUser) {
          fetchUserTickets();
          fetchNotifications();
        }
      } else {
        showToast(data.message || data.error || 'Failed to create ticket', 'error');
      }
    } catch (err) {
      showToast('An error occurred. Please try again.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleViewTicketDetails = async (ticket: SupportTicket) => {
    setIsLoadingDetails(true);
    setSelectedTicket(ticket);
    try {
      const res = await apiFetch(`/api/support/tickets/${ticket.id}`);
      const data = await res.json();
      if (data.success) {
        setMessages(data.data.messages);
        setSelectedTicket(data.data.ticket);
      }
    } catch (err) {
      showToast('Failed to load ticket details', 'error');
    } finally {
      setIsLoadingDetails(false);
    }
  };

  const handleSendReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim() && !replyBase64) return;
    if (!selectedTicket) return;

    setIsSendingReply(true);
    try {
      const res = await apiFetch(`/api/support/tickets/${selectedTicket.id}/messages`, {
        method: 'POST',
        body: JSON.stringify({
          message: replyText,
          attachmentBase64: replyBase64,
          attachmentName: replyFileName
        })
      });

      const data = await res.json();
      if (data.success) {
        setMessages(prev => [...prev, data.data]);
        setReplyText('');
        setReplyBase64(undefined);
        setReplyFileName(undefined);
        if (replyFileInputRef.current) replyFileInputRef.current.value = '';
        fetchUserTickets(); // Reload list to update last reply dates/statuses
      } else {
        showToast(data.message || data.error || 'Failed to send reply', 'error');
      }
    } catch (err) {
      showToast('Failed to send message', 'error');
    } finally {
      setIsSendingReply(false);
    }
  };

  const handleCloseTicket = async () => {
    if (!selectedTicket) return;
    if (!window.confirm('Are you sure you want to close this ticket?')) return;

    try {
      const res = await apiFetch(`/api/support/tickets/${selectedTicket.id}/close`, { method: 'PATCH' });
      const data = await res.json();
      if (data.success) {
        showToast('Ticket closed successfully', 'success');
        setSelectedTicket(data.data);
        fetchUserTickets();
      }
    } catch (err) {
      showToast('Failed to close ticket', 'error');
    }
  };

  const handleReopenTicket = async () => {
    if (!selectedTicket) return;
    try {
      const res = await apiFetch(`/api/support/tickets/${selectedTicket.id}/reopen`, { method: 'PATCH' });
      const data = await res.json();
      if (data.success) {
        showToast('Ticket reopened successfully', 'success');
        setSelectedTicket(data.data);
        fetchUserTickets();
      }
    } catch (err) {
      showToast('Failed to reopen ticket', 'error');
    }
  };

  // Filter FAQs based on search and selected category
  const filteredFAQs = FAQ_DATA.filter(faq => {
    const matchesSearch = searchQuery
      ? (faq.question.toLowerCase().includes(searchQuery.toLowerCase()) || faq.answer.toLowerCase().includes(searchQuery.toLowerCase()) || faq.category.toLowerCase().includes(searchQuery.toLowerCase()))
      : true;
    
    const matchesCategory = searchQuery ? true : (faq.category === activeFAQCategory);
    return matchesSearch && matchesCategory;
  });

  const uniqueCategories = Array.from(new Set(FAQ_DATA.map(f => f.category)));

  return (
    <div style={{ maxWidth: '720px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '16px', paddingBottom: '40px' }}>
      {/* Sleek Banner Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', background: '#ffffff', padding: '14px 16px', borderRadius: '6px', border: '1.5px solid #cbd5e1', boxShadow: '0 2px 6px rgba(15, 23, 42, 0.04)' }}>
        <div style={{ width: '42px', height: '42px', borderRadius: '6px', background: '#eef2ff', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#344BFD', flexShrink: 0 }}>
          <Headphones size={22} />
        </div>
        <div>
          <h2 style={{ fontSize: '17px', fontWeight: '800', margin: 0, color: '#0f172a' }}>Help & Support Center</h2>
          <p style={{ margin: '2px 0 0', color: '#64748b', fontSize: '12px' }}>Search FAQs, create support tickets, or contact our 24/7 customer care team</p>
        </div>
      </div>

      {/* Main Content Area */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        
        {/* FAQ Search Section */}
        <div className="card support-card">
          <h3 style={{ fontSize: '15px', fontWeight: 800, color: '#0f172a', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Search size={18} style={{ color: '#344BFD' }} />
            <span>Search Help Articles</span>
          </h3>
          
          <div style={{ position: 'relative', width: '100%', marginBottom: '14px' }}>
            <input
              type="text"
              placeholder="Search FAQs, common issues, jobs, payments..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ width: '100%', paddingLeft: '38px', height: '38px', fontSize: '13px', borderRadius: '4px', border: '1px solid #cbd5e1', outline: 'none' }}
            />
            <Search size={16} style={{ position: 'absolute', left: '12px', top: '11px', color: '#94a3b8' }} />
          </div>

          {/* Category selection - hide if search active */}
          {!searchQuery && (
            <div className="support-faq-categories">
              {uniqueCategories.map(cat => (
                <button
                  key={cat}
                  onClick={() => {
                    setActiveFAQCategory(cat);
                    setExpandedFAQIndex(null);
                  }}
                  style={{
                    padding: '5px 12px',
                    borderRadius: '4px',
                    border: '1px solid #cbd5e1',
                    background: activeFAQCategory === cat ? '#344BFD' : '#ffffff',
                    color: activeFAQCategory === cat ? '#ffffff' : '#475569',
                    fontWeight: '700',
                    cursor: 'pointer',
                    fontSize: '12px',
                    transition: 'all 0.15s'
                  }}
                >
                  {cat}
                </button>
              ))}
            </div>
          )}

          {/* FAQ Listing (Accordion) */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {filteredFAQs.length > 0 ? (
              filteredFAQs.map((faq, idx) => {
                const isExpanded = expandedFAQIndex === idx;
                return (
                  <div key={idx} className="faq-item">
                    <button
                      onClick={() => setExpandedFAQIndex(isExpanded ? null : idx)}
                      style={{
                        width: '100%',
                        padding: '12px 14px',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        textAlign: 'left',
                        fontSize: '13.5px',
                        fontWeight: '700',
                        color: '#0f172a',
                        gap: '10px'
                      }}
                    >
                      <span>{faq.question}</span>
                      <span className={`faq-chevron ${isExpanded ? 'expanded' : ''}`} style={{ flexShrink: 0 }}>
                        <ChevronDown size={14} />
                      </span>
                    </button>
                    
                    {isExpanded && (
                      <div style={{ padding: '12px 14px', background: '#f8fafc', borderTop: '1px solid #cbd5e1', color: '#475569', fontSize: '13px', lineHeight: 1.5 }}>
                        {faq.answer}
                      </div>
                    )}
                  </div>
                );
              })
            ) : (
              <div style={{ textAlign: 'center', color: '#64748b', padding: '16px 0', fontSize: '13px' }}>
                No help articles found matching your query.
              </div>
            )}
          </div>
        </div>

        {/* Contact Details & Support Ticket Form Grid */}
        <div className="support-main-grid">
          
          {/* Left Column - Contact Details */}
          <div className="card support-info-card">
            <h3 style={{ fontSize: '15px', fontWeight: 800, color: '#0f172a', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Mail size={18} style={{ color: '#344BFD' }} />
              <span>Support Information</span>
            </h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                <div style={{ width: '38px', height: '38px', borderRadius: '4px', background: '#eef2ff', color: '#344BFD', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Mail size={18} />
                </div>
                <div>
                  <h4 style={{ fontSize: '12.5px', fontWeight: 700, margin: '0 0 2px', color: '#0f172a' }}>Support Email</h4>
                  <a href="mailto:support@jobmarket.com" style={{ color: '#2563eb', fontWeight: 600, fontSize: '13px', textDecoration: 'none' }}>support@jobmarket.com</a>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                <div style={{ width: '38px', height: '38px', borderRadius: '4px', background: '#fff7ed', color: '#ea580c', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Phone size={18} />
                </div>
                <div>
                  <h4 style={{ fontSize: '12.5px', fontWeight: 700, margin: '0 0 2px', color: '#0f172a' }}>Customer Care</h4>
                  <p style={{ color: '#475569', fontSize: '13px', margin: 0, fontWeight: 600 }}>+91 98765 43210</p>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                <div style={{ width: '38px', height: '38px', borderRadius: '4px', background: '#f0fdf4', color: '#16a34a', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <MapPin size={18} />
                </div>
                <div>
                  <h4 style={{ fontSize: '12.5px', fontWeight: 700, margin: '0 0 2px', color: '#0f172a' }}>Office Address</h4>
                  <p style={{ color: '#475569', fontSize: '12.5px', margin: 0, lineHeight: 1.4 }}>
                    123 Innovation Drive, Koramangala, Bangalore 560034
                  </p>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                <div style={{ width: '38px', height: '38px', borderRadius: '4px', background: '#faf5ff', color: '#9333ea', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Clock size={18} />
                </div>
                <div>
                  <h4 style={{ fontSize: '12.5px', fontWeight: 700, margin: '0 0 2px', color: '#0f172a' }}>Business Hours & SLA</h4>
                  <p style={{ color: '#475569', fontSize: '12.5px', margin: 0 }}>Mon–Fri • 9 AM – 6 PM (Avg reply &lt; 24h)</p>
                </div>
              </div>
            </div>
          </div>

            {/* Right Column - Support Ticket Form */}
            <div className="card support-ticket-form-card">
              <h2 style={{ fontSize: 'var(--fs-2xl)', fontWeight: 700, marginBottom: 'var(--space-6)', color: 'var(--text-primary)' }}>Create Support Ticket</h2>
              
              <form onSubmit={handleCreateTicket} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div className="support-form-grid">
                  <div className="form-group">
                    <label className="form-label">Full Name <span style={{ color: 'var(--danger)' }}>*</span></label>
                    <input
                      type="text"
                      className="form-input"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Your name"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Email Address <span style={{ color: 'var(--danger)' }}>*</span></label>
                    <input
                      type="email"
                      className="form-input"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="your.email@example.com"
                      required
                    />
                  </div>
                </div>

                <div className="support-form-grid">
                  <div className="form-group">
                    <label className="form-label">Phone Number (Optional)</label>
                    <input
                      type="tel"
                      className="form-input"
                      value={phone}
                      onChange={(e) => {
                        const val = e.target.value.replace(/[^0-9]/g, '');
                        if (val.length <= 10) {
                          setPhone(val);
                        }
                      }}
                      placeholder="10-digit mobile number"
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Category <span style={{ color: 'var(--danger)' }}>*</span></label>
                    <select
                      className="form-input"
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      style={{ background: 'var(--surface)' }}
                    >
                      <option value="General Inquiry">General Inquiry</option>
                      <option value="Account Issue">Account Issue</option>
                      <option value="Login Problem">Login Problem</option>
                      <option value="Employer Support">Employer Support</option>
                      <option value="Candidate Support">Candidate Support</option>
                      <option value="Job Posting Issue">Job Posting Issue</option>
                      <option value="Job Application Issue">Job Application Issue</option>
                      <option value="Verification">Verification</option>
                      <option value="Technical Issue">Technical Issue</option>
                      <option value="Payment">Payment</option>
                      <option value="Bug Report">Bug Report</option>
                      <option value="Feature Request">Feature Request</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Subject <span style={{ color: 'var(--danger)' }}>*</span></label>
                  <input
                    type="text"
                    className="form-input"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder="Brief summary of your query (5–120 characters)"
                    minLength={5}
                    maxLength={120}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Description <span style={{ color: 'var(--danger)' }}>*</span></label>
                  <textarea
                    className="form-textarea"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Provide details about your query (20–3000 characters)"
                    minLength={20}
                    maxLength={3000}
                    style={{ minHeight: '120px' }}
                    required
                  />
                </div>

                <div className="support-form-grid" style={{ alignItems: 'center' }}>
                  <div className="form-group">
                    <label className="form-label">Preferred Contact Method</label>
                    <div style={{ display: 'flex', gap: '16px', marginTop: '8px' }}>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '14px', color: 'var(--text-secondary)' }}>
                        <input
                          type="radio"
                          name="preferredContact"
                          value="Email"
                          checked={preferredContact === 'Email'}
                          onChange={() => setPreferredContact('Email')}
                        />
                        Email
                      </label>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '14px', color: 'var(--text-secondary)' }}>
                        <input
                          type="radio"
                          name="preferredContact"
                          value="Phone"
                          checked={preferredContact === 'Phone'}
                          onChange={() => setPreferredContact('Phone')}
                        />
                        Phone
                      </label>
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Priority</label>
                    <select
                      className="form-input"
                      value={priority}
                      onChange={(e) => setPriority(e.target.value as any)}
                      style={{ background: 'var(--surface)' }}
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Attachment (PDF, DOCX, PNG, JPG, JPEG &bull; Max 10MB)</label>
                  <div style={{ display: 'flex', gap: '12px', alignItems: 'center', marginTop: '4px' }}>
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      style={{
                        padding: '10px 16px',
                        borderRadius: '6px',
                        background: 'var(--bg-secondary)',
                        border: '1px solid var(--border)',
                        color: 'var(--text-primary)',
                        cursor: 'pointer',
                        fontSize: '13px',
                        fontWeight: '600'
                      }}
                    >
                      Choose File
                    </button>
                    <span style={{ fontSize: '13px', color: 'var(--text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '200px' }}>
                      {attachmentName || 'No file selected'}
                    </span>
                  </div>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept=".pdf,.docx,.png,.jpg,.jpeg"
                    style={{ display: 'none' }}
                  />
                </div>

                <div className="form-group" style={{ marginTop: '8px' }}>
                  <label style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', cursor: 'pointer', fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                    <input
                      type="checkbox"
                      checked={privacyPolicy}
                      onChange={(e) => setPrivacyPolicy(e.target.checked)}
                      style={{ marginTop: '3px' }}
                      required
                    />
                    I agree to the privacy policy and consent to support staff contacting me regarding my query.
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  style={{
                    width: '100%',
                    height: '40px',
                    background: '#344BFD',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '4px',
                    fontWeight: '700',
                    fontSize: '13.5px',
                    cursor: isSubmitting ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    marginTop: '12px',
                    boxShadow: '0 2px 6px rgba(52, 75, 253, 0.25)',
                    opacity: isSubmitting ? 0.85 : 1
                  }}
                >
                  {isSubmitting ? (
                    <>
                      <svg className="animate-spin" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" style={{ animation: 'spin 0.8s linear infinite' }}>
                        <circle cx="12" cy="12" r="10" stroke="rgba(255,255,255,0.3)"/>
                        <path d="M4 12a8 8 0 0 1 8-8" stroke="currentColor" strokeLinecap="round"/>
                      </svg>
                      <span>Creating Support Ticket...</span>
                    </>
                  ) : (
                    <>
                      <Send size={15} />
                      <span>Submit Support Ticket</span>
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>

          {/* Registered Users: Support Tickets Section */}
          {currentUser && (
            <div style={{ marginTop: 'var(--space-16)' }}>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '32px' }}>
                
                {/* Tickets list */}
                <div className="card support-card">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                    <h2 style={{ fontSize: 'var(--fs-2xl)', fontWeight: 700, margin: 0 }}>My Support Tickets</h2>
                    <button 
                      onClick={fetchUserTickets}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: 'var(--primary)',
                        fontWeight: '600',
                        fontSize: '13px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px'
                      }}
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <path d="M23 4v6h-6M1 20v-6h6"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/>
                      </svg>
                      Refresh
                    </button>
                  </div>

                  {tickets.length > 0 ? (
                    <>
                      <div className="desktop-table-view" style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px', textAlign: 'left' }}>
                          <thead>
                            <tr style={{ borderBottom: '2px solid var(--border)', color: 'var(--text-tertiary)', fontWeight: 700 }}>
                              <th style={{ padding: '12px' }}>Ticket Number</th>
                              <th style={{ padding: '12px' }}>Subject</th>
                              <th style={{ padding: '12px' }}>Category</th>
                              <th style={{ padding: '12px' }}>Status</th>
                              <th style={{ padding: '12px' }}>Priority</th>
                              <th style={{ padding: '12px' }}>Last Reply</th>
                              <th style={{ padding: '12px', textAlign: 'right' }}>Actions</th>
                            </tr>
                          </thead>
                          <tbody>
                            {tickets.map(t => (
                              <tr key={t.id} style={{ borderBottom: '1px solid var(--border)' }}>
                                <td style={{ padding: '12px', fontWeight: '700', color: 'var(--text-primary)' }}>{t.ticket_number}</td>
                                <td style={{ padding: '12px', color: 'var(--text-primary)', maxWidth: '240px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{t.subject}</td>
                                <td style={{ padding: '12px', color: 'var(--text-secondary)' }}>{t.category}</td>
                                <td style={{ padding: '12px' }}>
                                  <span className={`status-badge status-${t.status}`} style={{ fontSize: '11px', padding: '4px 8px', borderRadius: '4px', textTransform: 'capitalize' }}>
                                    {t.status.replace(/_/g, ' ')}
                                  </span>
                                </td>
                                <td style={{ padding: '12px', textTransform: 'capitalize' }}>
                                  <span style={{ 
                                    color: t.priority === 'high' ? 'var(--danger)' : (t.priority === 'medium' ? 'var(--warning)' : 'var(--text-secondary)'),
                                    fontWeight: '600'
                                  }}>
                                    {t.priority}
                                  </span>
                                </td>
                                <td style={{ padding: '12px', color: 'var(--text-tertiary)' }}>{new Date(t.last_reply_at).toLocaleDateString()}</td>
                                <td style={{ padding: '12px', textAlign: 'right' }}>
                                  <button
                                    className="btn btn-secondary btn-sm"
                                    onClick={() => handleViewTicketDetails(t)}
                                    style={{ padding: '6px 12px' }}
                                  >
                                    View Details
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>

                      <div className="mobile-cards-view">
                        {tickets.map(t => (
                          <div key={t.id} className="mobile-ticket-card">
                            <div className="mobile-ticket-header">
                              <span className="mobile-ticket-number">{t.ticket_number}</span>
                              <span className={`status-badge status-${t.status}`} style={{ fontSize: '11px', padding: '4px 8px', borderRadius: '4px', textTransform: 'capitalize' }}>
                                {t.status.replace(/_/g, ' ')}
                              </span>
                            </div>
                            <h3 className="mobile-ticket-subject">{t.subject}</h3>
                            <div className="mobile-ticket-meta">
                              <div className="mobile-ticket-meta-item">
                                <span>Category:</span>
                                <strong>{t.category}</strong>
                              </div>
                              <div className="mobile-ticket-meta-item">
                                <span>Priority:</span>
                                <span style={{ 
                                  color: t.priority === 'high' ? 'var(--danger)' : (t.priority === 'medium' ? 'var(--warning)' : 'var(--text-secondary)'),
                                  fontWeight: '600'
                                }}>
                                  {t.priority}
                                </span>
                              </div>
                              <div className="mobile-ticket-meta-item">
                                <span>Last Reply:</span>
                                <span>{new Date(t.last_reply_at).toLocaleDateString()}</span>
                              </div>
                            </div>
                            <div className="mobile-ticket-actions">
                              <span></span>
                              <button
                                className="btn btn-secondary btn-sm"
                                onClick={() => handleViewTicketDetails(t)}
                                style={{ padding: '6px 12px' }}
                              >
                                View Details
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </>
                  ) : (
                    <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-secondary)' }}>
                      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ marginBottom: '16px', opacity: 0.5 }}>
                        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                      </svg>
                      <p style={{ margin: 0, fontWeight: 600 }}>No support tickets created yet.</p>
                      <p style={{ margin: '4px 0 0', fontSize: '13px' }}>Use the form above to submit your first ticket.</p>
                    </div>
                  )}
                </div>

                {/* Support Notifications Panel */}
                {(() => {
                  const supportAlerts = notifications.filter(n => {
                    const text = `${n.title} ${n.message}`.toLowerCase();
                    return text.includes('support') || text.includes('ticket') || text.includes('helpdesk') || text.includes('agent') || text.includes('inquiry');
                  });

                  if (supportAlerts.length === 0) return null;

                  return (
                    <div style={{ background: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '8px', padding: '20px', boxShadow: '0 2px 10px rgba(15, 23, 42, 0.03)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
                        <div style={{ width: '32px', height: '32px', borderRadius: '6px', background: '#eff6ff', color: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                          </svg>
                        </div>
                        <div>
                          <h2 style={{ fontSize: '17px', fontWeight: '800', color: '#0f172a', margin: 0 }}>Recent Support Alerts</h2>
                          <p style={{ fontSize: '12px', color: '#64748b', margin: '2px 0 0 0' }}>Customer support and ticket status updates</p>
                        </div>
                      </div>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        {supportAlerts.map(n => (
                          <div
                            key={n.id}
                            onClick={() => {
                              if (!n.is_read) markNotificationRead(n.id);
                            }}
                            style={{
                              padding: '12px 14px',
                              background: n.is_read ? '#ffffff' : '#f0f9ff',
                              borderRadius: '6px',
                              border: n.is_read ? '1px solid #e2e8f0' : '1px solid #93c5fd',
                              cursor: 'pointer',
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'flex-start',
                              gap: '12px',
                              transition: 'all 0.2s ease'
                            }}
                          >
                            <div style={{ minWidth: 0, flex: 1 }}>
                              <h4 style={{ margin: '0 0 3px', fontSize: '13.5px', color: '#0f172a', fontWeight: n.is_read ? '700' : '800' }}>{n.title}</h4>
                              <p style={{ margin: 0, fontSize: '12.5px', color: '#475569', lineHeight: 1.45 }}>{n.message}</p>
                              <span style={{ fontSize: '11px', color: '#94a3b8', marginTop: '4px', display: 'inline-block', fontWeight: '500' }}>
                                {new Date(n.created_at).toLocaleString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                              </span>
                            </div>
                            {!n.is_read && (
                              <span style={{ width: '8px', height: '8px', background: '#2563eb', borderRadius: '50%', flexShrink: 0, marginTop: '4px' }}></span>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })()}

              </div>

              {/* Chat Thread Conversation Slide-in Modal */}
              {selectedTicket && createPortal(
                <div className="support-drawer-backdrop" onClick={() => setSelectedTicket(null)}>
                  
                  <div className="support-drawer-container" onClick={e => e.stopPropagation()}>
                    
                    {/* Drawer Header */}
                    <div className="support-drawer-header">
                      <div className="support-drawer-header-info">
                        <div className="support-drawer-header-title-row">
                          <span className="support-drawer-header-number">{selectedTicket.ticket_number}</span>
                          <span className={`status-badge status-${selectedTicket.status}`} style={{ textTransform: 'capitalize' }}>
                            {selectedTicket.status.replace(/_/g, ' ')}
                          </span>
                        </div>
                        <p className="support-drawer-header-subject">{selectedTicket.subject}</p>
                        <button
                          onClick={() => setSelectedTicket(null)}
                          className="btn-drawer-close"
                        >
                          ✕
                        </button>
                      </div>
                      
                      <div className="support-drawer-header-actions">
                        {selectedTicket.status !== 'closed' && selectedTicket.status !== 'resolved' ? (
                          <button
                            onClick={handleCloseTicket}
                            className="btn-close-ticket"
                          >
                            Close Ticket
                          </button>
                        ) : (
                          <button
                            onClick={handleReopenTicket}
                            className="btn-reopen-ticket"
                          >
                            Reopen
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Chat Area Body */}
                    <div className="support-drawer-body" style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '20px', background: 'var(--surface)' }}>
                      
                      {/* Ticket Original Description Message */}
                      <div className="support-description-block">
                        <div className="support-description-header">
                          <strong>{selectedTicket.full_name} &bull; Created Ticket</strong>
                          <span>{new Date(selectedTicket.created_at).toLocaleString()}</span>
                        </div>
                        <p className="support-description-text">{selectedTicket.description}</p>
                        
                        {selectedTicket.attachment && (
                          <div style={{ marginTop: '12px', borderTop: '1px solid var(--border)', paddingTop: '8px' }}>
                            <a
                              href={selectedTicket.attachment}
                              target="_blank"
                              rel="noreferrer"
                              style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: 'var(--primary)', textDecoration: 'none', fontWeight: '600' }}
                            >
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"/>
                              </svg>
                              View Ticket Attachment
                            </a>
                          </div>
                        )}
                      </div>

                      {/* Timeline Divider */}
                      <div className="support-timeline-divider">
                        <span className="support-timeline-line"></span>
                        <span className="support-timeline-text">Conversation Thread</span>
                        <span className="support-timeline-line"></span>
                      </div>

                      {/* Message Thread */}
                      {isLoadingDetails ? (
                        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <svg className="animate-spin" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="3" style={{ animation: 'spin 1s linear infinite' }}>
                            <circle cx="12" cy="12" r="10" stroke="rgba(0,0,0,0.1)"/>
                            <path d="M4 12a8 8 0 0 1 8-8V0C5.373 0 0 5.373 0 12h4" fill="currentColor"/>
                          </svg>
                        </div>
                      ) : (
                        messages.map(m => {
                          const isMe = m.sender_id === currentUser.id;
                          return (
                            <div
                              key={m.id}
                              className="support-message-container"
                              style={{
                                alignSelf: isMe ? 'flex-end' : 'flex-start'
                              }}
                            >
                              {/* Sender Title */}
                              <div
                                className="support-message-sender"
                                style={{
                                  alignSelf: isMe ? 'flex-end' : 'flex-start'
                                }}
                              >
                                <strong>{isMe ? 'You' : (m.sender_name || 'Agent')}</strong>
                                {!isMe && m.sender_role === 'admin' && (
                                  <span style={{ background: 'var(--primary)', color: '#ffffff', padding: '1px 5px', borderRadius: '3px', fontSize: '9px', fontWeight: '700', textTransform: 'uppercase' }}>
                                    Support Staff
                                  </span>
                                )}
                              </div>
                              
                              {/* Message bubble */}
                              <div className={isMe ? 'chat-bubble-me' : 'chat-bubble-agent'}>
                                <p style={{ margin: 0, whiteSpace: 'pre-wrap' }}>{m.message}</p>
                                
                                {m.attachment && (
                                  <div style={{ marginTop: '8px', borderTop: `1px solid ${isMe ? 'rgba(255,255,255,0.2)' : 'var(--border)'}`, paddingTop: '6px' }}>
                                    <a
                                      href={m.attachment}
                                      target="_blank"
                                      rel="noreferrer"
                                      style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: isMe ? '#ffffff' : 'var(--primary)', textDecoration: 'none', fontWeight: '600' }}
                                    >
                                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                        <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"/>
                                      </svg>
                                      View Attachment
                                    </a>
                                  </div>
                                )}
                              </div>

                              {/* Time and Ticks */}
                              <div
                                className="support-message-meta"
                                style={{
                                  alignSelf: isMe ? 'flex-end' : 'flex-start'
                                }}
                              >
                                <span>{new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                {isMe && (
                                  <span style={{ color: m.seen ? 'var(--primary)' : 'var(--text-tertiary)', fontWeight: 'bold' }} title={m.seen ? 'Read' : 'Delivered'}>
                                    {m.seen ? '✓✓' : '✓'}
                                  </span>
                                )}
                              </div>
                            </div>
                          );
                        })
                      )}
                      <div ref={chatBottomRef}></div>
                    </div>

                    {/* Chat Input footer */}
                    {selectedTicket.status !== 'closed' && (
                      <div className="support-drawer-footer" style={{ borderTop: '1px solid var(--border)' }}>
                        <form onSubmit={handleSendReply} className="chat-input-form">
                          
                          {/* File Attachment Preview badge if selected */}
                          {replyFileName && (
                            <div className="chat-attachment-preview">
                              <span className="chat-attachment-preview-name">
                                📎 {replyFileName}
                              </span>
                              <button
                                type="button"
                                className="chat-attachment-preview-remove"
                                onClick={() => {
                                  setReplyBase64(undefined);
                                  setReplyFileName(undefined);
                                  if (replyFileInputRef.current) replyFileInputRef.current.value = '';
                                }}
                              >
                                ✕
                              </button>
                            </div>
                          )}

                          <div className="chat-input-bar">
                            {/* Attachment Button */}
                            <button
                              type="button"
                              className="chat-input-btn-attach"
                              onClick={() => replyFileInputRef.current?.click()}
                              title="Add Attachment"
                            >
                              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"/>
                              </svg>
                            </button>

                            {/* Textarea */}
                            <textarea
                              className="chat-input-textarea"
                              placeholder="Type a message to support..."
                              value={replyText}
                              onChange={(e) => setReplyText(e.target.value)}
                              rows={1}
                            />
                            
                            {/* Send Button */}
                            <button
                              type="submit"
                              disabled={isSendingReply || (!replyText.trim() && !replyBase64)}
                              className="chat-input-btn-send"
                              title="Send Message"
                            >
                              {isSendingReply ? (
                                <svg className="animate-spin" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" style={{ animation: 'spin 1s linear infinite' }}>
                                  <circle cx="12" cy="12" r="10" stroke="rgba(255,255,255,0.2)"/>
                                  <path d="M4 12a8 8 0 0 1 8-8V0C5.373 0 0 5.373 0 12h4" fill="currentColor"/>
                                </svg>
                              ) : (
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ transform: 'rotate(45deg) translate(-1px, 1px)' }}>
                                  <line x1="22" y1="2" x2="11" y2="13" />
                                  <polygon points="22 2 15 22 11 13 2 9 22 2" />
                                </svg>
                              )}
                            </button>
                          </div>

                          <input
                            type="file"
                            ref={replyFileInputRef}
                            onChange={handleReplyFileChange}
                            accept=".pdf,.docx,.png,.jpg,.jpeg"
                            style={{ display: 'none' }}
                          />
                        </form>
                      </div>
                    )}

                  </div>
                </div>,
                document.body
              )}

            </div>
          )}

      </div>
    </div>
  );
};

export default ContactPage;
