import React, { useState, useEffect, useRef } from 'react';
import { apiFetch } from '../../../utils/api';
import { useToast } from '../../../hooks/useToast';

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

export const SupportManagementPage: React.FC = () => {
  const { showToast } = useToast();
  
  // Listings and pagination state
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [totalTickets, setTotalTickets] = useState(0);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);

  // Filters State
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [assigneeFilter, setAssigneeFilter] = useState('');
  const [searchText, setSearchText] = useState('');

  // Analytics Stats state
  const [analytics, setAnalytics] = useState<any>(null);
  const [loadingAnalytics, setLoadingAnalytics] = useState(true);

  // Selected ticket details
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
  const [messages, setMessages] = useState<SupportMessage[]>([]);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [isSendingReply, setIsSendingReply] = useState(false);
  
  // Reply attachment state
  const [replyBase64, setReplyBase64] = useState<string | undefined>(undefined);
  const [replyFileName, setReplyFileName] = useState<string | undefined>(undefined);
  const replyFileInputRef = useRef<HTMLInputElement>(null);

  // List of admins to assign tickets to
  const [admins, setAdmins] = useState<{ id: string; name: string }[]>([]);

  useEffect(() => {
    setPage(1);
    fetchTickets(1, true);
  }, [statusFilter, priorityFilter, categoryFilter, assigneeFilter]);

  // Handle search text submit
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchTickets(1, true);
  };

  useEffect(() => {
    fetchAnalytics();
    fetchAdminsList();
  }, []);

  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const fetchTickets = async (pageNum = 1, isInitial = false) => {
    if (pageNum === 1 || isInitial) {
      setLoading(true);
    } else {
      setLoadingMore(true);
    }
    try {
      const offset = (pageNum - 1) * limit;
      let queryStr = `limit=${limit}&offset=${offset}`;
      if (statusFilter) queryStr += `&status=${statusFilter}`;
      if (priorityFilter) queryStr += `&priority=${priorityFilter}`;
      if (categoryFilter) queryStr += `&category=${categoryFilter}`;
      if (assigneeFilter) queryStr += `&assignedAdmin=${assigneeFilter}`;
      if (searchText) queryStr += `&search=${encodeURIComponent(searchText)}`;

      const res = await apiFetch(`/api/admin/support?${queryStr}`);
      const data = await res.json();
      if (data.success) {
        const fetchedItems = Array.isArray(data.data) ? data.data : (Array.isArray(data.data?.tickets) ? data.data.tickets : []);
        const total = typeof data.total === 'number' ? data.total : (typeof data.data?.total === 'number' ? data.data.total : fetchedItems.length);
        if (pageNum === 1 || isInitial) {
          setTickets(fetchedItems);
        } else {
          setTickets(prev => [...prev, ...fetchedItems]);
        }
        setTotalTickets(total);
        setHasMore((pageNum * limit) < total);
      }
    } catch (err) {
      showToast('Failed to load support tickets list', 'error');
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    if (scrollHeight - scrollTop <= clientHeight + 40 && hasMore && !loadingMore && !loading) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchTickets(nextPage, false);
    }
  };

  const fetchAnalytics = async () => {
    setLoadingAnalytics(true);
    try {
      const res = await apiFetch('/api/admin/support/analytics');
      const data = await res.json();
      if (data.success) {
        setAnalytics(data.data);
      }
    } catch (err) {
      console.error('Failed to load support analytics:', err);
    } finally {
      setLoadingAnalytics(false);
    }
  };

  const fetchAdminsList = async () => {
    try {
      // Find system admins list from users database list
      const res = await apiFetch('/api/v1/admin/users?role=admin');
      const data = await res.json();
      if (data.success) {
        const userList = Array.isArray(data.data) ? data.data : (Array.isArray(data.data?.data) ? data.data.data : []);
        setAdmins(userList.map((u: any) => ({ id: u.id, name: u.name || u.email || 'Admin' })));
      }
    } catch (err) {
      console.error('Failed to fetch admin users list:', err);
    }
  };

  const chatBottomRef = useRef<HTMLDivElement>(null);

  // Auto-scroll chat to bottom on new messages
  useEffect(() => {
    if (chatBottomRef.current) {
      chatBottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  // Real-time polling for messages when ticket is open (Visibility-aware, 8s interval)
  useEffect(() => {
    if (!selectedTicket) return;
    const interval = setInterval(async () => {
      if (document.visibilityState !== 'visible') return;
      try {
        const res = await apiFetch(`/api/support/tickets/${selectedTicket.id}`);
        const data = await res.json();
        if (data.success && data.data.messages) {
          setMessages(data.data.messages);
        }
      } catch (err) {
        // silent polling catch
      }
    }, 8000);
    return () => clearInterval(interval);
  }, [selectedTicket?.id]);

  const handleTicketClick = async (ticket: SupportTicket) => {
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
      showToast('Failed to load conversation details', 'error');
    } finally {
      setIsLoadingDetails(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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

  const handleSendAdminReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim() && !replyBase64) return;
    if (!selectedTicket) return;

    setIsSendingReply(true);
    try {
      const res = await apiFetch('/api/admin/support/reply', {
        method: 'POST',
        body: JSON.stringify({
          ticketId: selectedTicket.id,
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
        
        // Reload ticket details to update status
        const detailsRes = await apiFetch(`/api/support/tickets/${selectedTicket.id}`);
        const detailsData = await detailsRes.json();
        if (detailsData.success) {
          setSelectedTicket(detailsData.data.ticket);
        }
        
        fetchTickets(); // Refresh list queue
        fetchAnalytics(); // Refresh analytics counts
      } else {
        showToast(data.error || 'Failed to send reply', 'error');
      }
    } catch (err) {
      showToast('Failed to post reply', 'error');
    } finally {
      setIsSendingReply(false);
    }
  };

  const handleAssignAdmin = async (adminId: string) => {
    if (!selectedTicket) return;
    try {
      const res = await apiFetch('/api/admin/support/assign', {
        method: 'POST',
        body: JSON.stringify({ ticketId: selectedTicket.id, adminId })
      });
      const data = await res.json();
      if (data.success) {
        showToast('Ticket assigned successfully', 'success');
        setSelectedTicket(data.data);
        fetchTickets();
      }
    } catch (err) {
      showToast('Failed to assign ticket', 'error');
    }
  };

  const handleUpdateStatus = async (status: string) => {
    if (!selectedTicket) return;
    try {
      const res = await apiFetch(`/api/admin/support/${selectedTicket.id}`, {
        method: 'PATCH',
        body: JSON.stringify({ status })
      });
      const data = await res.json();
      if (data.success) {
        showToast('Status updated successfully', 'success');
        setSelectedTicket(data.data);
        fetchTickets();
        fetchAnalytics();
      }
    } catch (err) {
      showToast('Failed to update status', 'error');
    }
  };

  const handleUpdatePriority = async (priority: string) => {
    if (!selectedTicket) return;
    try {
      const res = await apiFetch(`/api/admin/support/${selectedTicket.id}`, {
        method: 'PATCH',
        body: JSON.stringify({ priority })
      });
      const data = await res.json();
      if (data.success) {
        showToast('Priority updated successfully', 'success');
        setSelectedTicket(data.data);
        fetchTickets();
      }
    } catch (err) {
      showToast('Failed to update priority', 'error');
    }
  };

  const handleDeleteTicket = async (id: string) => {
    if (!window.confirm('WARNING: Are you sure you want to delete this ticket permanently? This action cannot be undone.')) return;
    try {
      const res = await apiFetch(`/api/admin/support/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        showToast('Ticket deleted successfully', 'success');
        setSelectedTicket(null);
        fetchTickets();
        fetchAnalytics();
      }
    } catch (err) {
      showToast('Failed to delete ticket', 'error');
    }
  };

  const handleExportCSV = () => {
    if (tickets.length === 0) {
      showToast('No tickets to export', 'error');
      return;
    }

    const headers = ['Ticket Number', 'Full Name', 'Email', 'Phone', 'Category', 'Subject', 'Priority', 'Status', 'Created At'];
    const rows = tickets.map(t => [
      t.ticket_number,
      t.full_name,
      t.email,
      t.phone || 'N/A',
      t.category,
      t.subject.replace(/"/g, '""'),
      t.priority,
      t.status,
      new Date(t.created_at).toLocaleDateString()
    ]);

    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(','), ...rows.map(e => e.map(val => `"${val}"`).join(','))].join('\n');
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `support_tickets_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Tickets exported to CSV successfully', 'success');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      
      {/* Page Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '28px', fontWeight: '800', color: 'var(--text-primary)' }}>Support Tickets</h1>
          <p style={{ color: 'var(--text-secondary)', marginTop: '4px' }}>Resolve candidate and employer help desk inquiries</p>
        </div>
        <button className="btn btn-primary" onClick={handleExportCSV} style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
          </svg>
          Export CSV
        </button>
      </div>

      {/* Analytics Dashboard Grid */}
      {!loadingAnalytics && analytics && (
        <div className="admin-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))' }}>
          <div className="stat-card-premium">
            <div className="stat-card-header">
              <span className="stat-card-title">Total Tickets</span>
            </div>
            <div className="stat-card-body">
              <span className="stat-card-number">{analytics.total}</span>
            </div>
          </div>
          <div className="stat-card-premium">
            <div className="stat-card-header">
              <span className="stat-card-title" style={{ color: 'var(--primary)' }}>Open Tickets</span>
            </div>
            <div className="stat-card-body">
              <span className="stat-card-number" style={{ color: 'var(--primary)' }}>{analytics.open}</span>
            </div>
          </div>
          <div className="stat-card-premium">
            <div className="stat-card-header">
              <span className="stat-card-title" style={{ color: 'var(--warning)' }}>In Progress</span>
            </div>
            <div className="stat-card-body">
              <span className="stat-card-number" style={{ color: 'var(--warning)' }}>{analytics.in_progress}</span>
            </div>
          </div>
          <div className="stat-card-premium">
            <div className="stat-card-header">
              <span className="stat-card-title" style={{ color: 'var(--success)' }}>Resolved</span>
            </div>
            <div className="stat-card-body">
              <span className="stat-card-number" style={{ color: 'var(--success)' }}>{analytics.resolved}</span>
            </div>
          </div>
          <div className="stat-card-premium">
            <div className="stat-card-header">
              <span className="stat-card-title">Closed</span>
            </div>
            <div className="stat-card-body">
              <span className="stat-card-number">{analytics.closed}</span>
            </div>
          </div>
          <div className="stat-card-premium">
            <div className="stat-card-header">
              <span className="stat-card-title" style={{ color: 'var(--accent)' }}>Resolution Rate</span>
            </div>
            <div className="stat-card-body">
              <span className="stat-card-number" style={{ color: 'var(--accent)' }}>{analytics.resolutionRate}%</span>
            </div>
          </div>
        </div>
      )}

      {/* Main Layout Workspace */}
      <div style={{ display: 'grid', gridTemplateColumns: selectedTicket ? '4fr 5fr' : '1fr', gap: '24px', alignItems: 'start' }}>
        
        {/* Left Column: Tickets Queue list */}
        <div className="admin-card" style={{ margin: 0, padding: '24px' }}>
          
          {/* Filters Bar */}
          <form onSubmit={handleSearchSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '24px' }}>
            <div style={{ display: 'flex', gap: '12px' }}>
              <input
                type="text"
                className="form-input"
                placeholder="Search ticket, email, name..."
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                style={{ flex: 1 }}
              />
              <button type="submit" className="btn btn-secondary" style={{ padding: '0 20px' }}>Search</button>
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '12px' }}>
              <select className="form-input" value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }} style={{ background: 'var(--surface)', fontSize: '13px' }}>
                <option value="">All Statuses</option>
                <option value="open">Open</option>
                <option value="in_progress">In Progress</option>
                <option value="waiting_for_user">Waiting for User</option>
                <option value="resolved">Resolved</option>
                <option value="closed">Closed</option>
              </select>

              <select className="form-input" value={priorityFilter} onChange={(e) => { setPriorityFilter(e.target.value); setPage(1); }} style={{ background: 'var(--surface)', fontSize: '13px' }}>
                <option value="">All Priorities</option>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>

              <select className="form-input" value={categoryFilter} onChange={(e) => { setCategoryFilter(e.target.value); setPage(1); }} style={{ background: 'var(--surface)', fontSize: '13px' }}>
                <option value="">All Categories</option>
                <option value="General Inquiry">General Inquiry</option>
                <option value="Account Issue">Account Issue</option>
                <option value="Login Problem">Login Problem</option>
                <option value="Employer Support">Employer Support</option>
                <option value="Candidate Support">Candidate Support</option>
                <option value="Job Posting Issue">Job Posting Issue</option>
                <option value="Job Application Issue">Job Application Issue</option>
                <option value="Verification">Verification</option>
                <option value="Technical Issue">Technical Issue</option>
                <option value="Bug Report">Bug Report</option>
              </select>

              <select className="form-input" value={assigneeFilter} onChange={(e) => { setAssigneeFilter(e.target.value); setPage(1); }} style={{ background: 'var(--surface)', fontSize: '13px' }}>
                <option value="">All Assignees</option>
                <option value="unassigned">Unassigned</option>
                {admins.map(a => (
                  <option key={a.id} value={a.id}>{a.name}</option>
                ))}
              </select>
            </div>
          </form>

          {/* Ticket Listings Queue (Infinite Scroll Container) */}
          {loading && tickets.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px' }}>
              <svg className="animate-spin" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="3" style={{ animation: 'spin 1s linear infinite' }}>
                <circle cx="12" cy="12" r="10" stroke="rgba(0,0,0,0.1)"/>
                <path d="M4 12a8 8 0 0 1 8-8V0C5.373 0 0 5.373 0 12h4" fill="currentColor"/>
              </svg>
            </div>
          ) : tickets.length > 0 ? (
            <div>
              <div
                ref={scrollContainerRef}
                onScroll={handleScroll}
                style={{
                  maxHeight: '650px',
                  overflowY: 'auto',
                  paddingRight: '6px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px'
                }}
              >
                {tickets.map(t => {
                  const isSelected = selectedTicket?.id === t.id;
                  return (
                    <div
                      key={t.id}
                      onClick={() => handleTicketClick(t)}
                      style={{
                        padding: '16px',
                        borderRadius: '10px',
                        border: `1px solid ${isSelected ? 'var(--primary)' : 'var(--border)'}`,
                        background: isSelected ? 'rgba(52, 75, 253, 0.06)' : 'var(--bg-secondary)',
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '8px'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontWeight: '700', fontSize: '15px', color: 'var(--text-primary)' }}>{t.ticket_number}</span>
                        <div style={{ display: 'flex', gap: '6px' }}>
                          <span className={`status-badge status-${t.status}`} style={{ fontSize: '10px', padding: '3px 8px', borderRadius: '4px', textTransform: 'capitalize' }}>
                            {t.status.replace(/_/g, ' ')}
                          </span>
                          <span style={{ 
                            fontSize: '10px',
                            padding: '3px 8px',
                            borderRadius: '4px',
                            background: t.priority === 'high' ? 'rgba(231,76,60,0.15)' : (t.priority === 'medium' ? 'rgba(241,196,15,0.15)' : 'rgba(127,140,141,0.15)'),
                            color: t.priority === 'high' ? 'var(--danger)' : (t.priority === 'medium' ? 'var(--warning)' : 'var(--text-secondary)'),
                            fontWeight: '600',
                            textTransform: 'uppercase'
                          }}>
                            {t.priority}
                          </span>
                        </div>
                      </div>
                      
                      <h4 style={{ margin: 0, fontSize: '14px', color: 'var(--text-primary)', fontWeight: '600' }}>{t.subject}</h4>
                      
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--text-tertiary)' }}>
                        <span>{t.full_name} &bull; {t.category}</span>
                        <span>{new Date(t.last_reply_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                  );
                })}

                {loadingMore && (
                  <div style={{ textAlign: 'center', padding: '16px 0' }}>
                    <svg className="animate-spin" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="3" style={{ animation: 'spin 1s linear infinite' }}>
                      <circle cx="12" cy="12" r="10" stroke="rgba(0,0,0,0.1)"/>
                      <path d="M4 12a8 8 0 0 1 8-8V0C5.373 0 0 5.373 0 12h4" fill="currentColor"/>
                    </svg>
                  </div>
                )}
              </div>

              {/* Status Footer info (Without Previous/Next buttons) */}
              <div style={{ borderTop: '1px solid var(--border)', paddingTop: '14px', marginTop: '16px', fontSize: '12px', color: 'var(--text-tertiary)', textAlign: 'center' }}>
                Loaded <strong>{tickets.length}</strong> of <strong>{totalTickets}</strong> total tickets
              </div>
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-secondary)' }}>
              No support tickets match your filters.
            </div>
          )}
        </div>

        {/* Right Column: Ticket Conversation & Details (Stagnant / Sticky Panel Beside List) */}
        {selectedTicket && (
          <div className="admin-card" style={{ margin: 0, padding: '24px', display: 'flex', flexDirection: 'column', gap: '24px', border: '1px solid var(--border)', position: 'sticky', top: '84px' }}>
            
            {/* Meta Control Dashboard Panel */}
            <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: '8px', padding: '16px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '700' }}>Manage Ticket</h3>
                <button
                  onClick={() => handleDeleteTicket(selectedTicket.id)}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'var(--danger)',
                    fontWeight: '600',
                    fontSize: '13px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}
                >
                  Delete Ticket
                </button>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div className="form-group">
                  <label className="form-label" style={{ fontSize: '11px' }}>Status</label>
                  <select
                    className="form-input"
                    value={selectedTicket.status}
                    onChange={(e) => handleUpdateStatus(e.target.value)}
                    style={{ background: 'var(--surface)', height: '36px', fontSize: '13px' }}
                  >
                    <option value="open">Open</option>
                    <option value="in_progress">In Progress</option>
                    <option value="waiting_for_user">Waiting for User</option>
                    <option value="resolved">Resolved</option>
                    <option value="closed">Closed</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label" style={{ fontSize: '11px' }}>Priority</label>
                  <select
                    className="form-input"
                    value={selectedTicket.priority}
                    onChange={(e) => handleUpdatePriority(e.target.value)}
                    style={{ background: 'var(--surface)', height: '36px', fontSize: '13px' }}
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label" style={{ fontSize: '11px' }}>Assigned Support Staff</label>
                <select
                  className="form-input"
                  value={selectedTicket.assigned_admin || ''}
                  onChange={(e) => handleAssignAdmin(e.target.value)}
                  style={{ background: 'var(--surface)', height: '36px', fontSize: '13px' }}
                >
                  <option value="">Unassigned</option>
                  {admins.map(a => (
                    <option key={a.id} value={a.id}>{a.name}</option>
                  ))}
                </select>
              </div>

              {/* Sender info */}
              <div style={{ borderTop: '1px solid var(--border)', paddingTop: '12px', fontSize: '13px', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <div><strong>Contact Name:</strong> {selectedTicket.full_name}</div>
                <div><strong>Email Address:</strong> <a href={`mailto:${selectedTicket.email}`} style={{ color: 'var(--primary)' }}>{selectedTicket.email}</a></div>
                {selectedTicket.phone && <div><strong>Phone Number:</strong> {selectedTicket.phone}</div>}
                <div><strong>Preferred Contact:</strong> {selectedTicket.preferred_contact}</div>
                <div><strong>Ticket Category:</strong> {selectedTicket.category}</div>
                <div><strong>Source Device:</strong> {selectedTicket.device || 'Desktop'} ({selectedTicket.browser || 'Unknown'})</div>
              </div>
            </div>

            {/* Conversation Thread */}
            <div>
              <h3 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '16px' }}>Conversation History</h3>
              
              <div style={{
                maxHeight: '380px',
                overflowY: 'auto',
                border: '1px solid var(--border)',
                borderRadius: '8px',
                padding: '16px',
                background: 'var(--surface)',
                display: 'flex',
                flexDirection: 'column',
                gap: '16px'
              }}>
                
                {/* Original ticket request message */}
                <div style={{
                  background: 'var(--bg-secondary)',
                  border: '1px solid var(--border)',
                  borderRadius: '6px',
                  padding: '12px',
                  fontSize: '13px'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-tertiary)', marginBottom: '6px', fontSize: '11px' }}>
                    <strong>{selectedTicket.full_name} &bull; Opening Message</strong>
                    <span>{new Date(selectedTicket.created_at).toLocaleString()}</span>
                  </div>
                  <p style={{ margin: 0, color: 'var(--text-primary)', whiteSpace: 'pre-wrap', lineHeight: 1.4 }}>{selectedTicket.description}</p>
                  
                  {selectedTicket.attachment && (
                    <div style={{ marginTop: '8px', borderTop: '1px solid var(--border)', paddingTop: '6px' }}>
                      <a
                        href={selectedTicket.attachment}
                        target="_blank"
                        rel="noreferrer"
                        style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', color: 'var(--primary)', textDecoration: 'none', fontWeight: '600' }}
                      >
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                          <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"/>
                        </svg>
                        View Attachment
                      </a>
                    </div>
                  )}
                </div>

                {/* List thread messages */}
                {isLoadingDetails ? (
                  <div style={{ textAlign: 'center', padding: '24px' }}>
                    <svg className="animate-spin" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="3" style={{ animation: 'spin 1s linear infinite' }}>
                      <circle cx="12" cy="12" r="10" stroke="rgba(0,0,0,0.1)"/>
                      <path d="M4 12a8 8 0 0 1 8-8V0C5.373 0 0 5.373 0 12h4" fill="currentColor"/>
                    </svg>
                  </div>
                ) : messages.length > 0 ? (
                  messages.map(m => {
                    const isMe = m.sender_role === 'admin';
                    return (
                      <div
                        key={m.id}
                        style={{
                          display: 'flex',
                          flexDirection: 'column',
                          alignSelf: isMe ? 'flex-end' : 'flex-start',
                          maxWidth: '85%'
                        }}
                      >
                        <div style={{
                          fontSize: '10px',
                          color: 'var(--text-tertiary)',
                          marginBottom: '2px',
                          alignSelf: isMe ? 'flex-end' : 'flex-start'
                        }}>
                          <strong>{m.sender_name || (isMe ? 'You' : 'User')}</strong> {isMe && '(Staff)'}
                        </div>
                        
                        <div style={{
                          padding: '10px 14px',
                          borderRadius: '8px',
                          background: isMe ? 'var(--primary)' : 'var(--bg-secondary)',
                          color: isMe ? '#ffffff' : 'var(--text-primary)',
                          border: isMe ? 'none' : '1px solid var(--border)',
                          fontSize: '13px',
                          lineHeight: 1.4,
                          wordBreak: 'break-word'
                        }}>
                          <p style={{ margin: 0, whiteSpace: 'pre-wrap' }}>{m.message}</p>
                          {m.attachment && (
                            <div style={{ marginTop: '6px', borderTop: `1px solid ${isMe ? 'rgba(255,255,255,0.2)' : 'var(--border)'}`, paddingTop: '4px' }}>
                              <a
                                href={m.attachment}
                                target="_blank"
                                rel="noreferrer"
                                style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', color: isMe ? '#ffffff' : 'var(--primary)', textDecoration: 'none', fontWeight: '600' }}
                              >
                                View Attachment
                              </a>
                            </div>
                          )}
                        </div>
                        
                        <div style={{
                          fontSize: '9px',
                          color: 'var(--text-tertiary)',
                          marginTop: '2px',
                          alignSelf: isMe ? 'flex-end' : 'flex-start'
                        }}>
                          {new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} &bull; {m.seen ? 'Read' : 'Delivered'}
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div style={{ textAlign: 'center', fontSize: '12px', color: 'var(--text-tertiary)', padding: '16px 0' }}>
                    No replies yet.
                  </div>
                )}
                <div ref={chatBottomRef} />
              </div>
            </div>

            {/* Reply Input Form */}
            {selectedTicket.status !== 'closed' && (
              <form onSubmit={handleSendAdminReply} style={{ display: 'flex', flexDirection: 'column', gap: '12px', borderTop: '1px solid var(--border)', paddingTop: '16px' }}>
                <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-end' }}>
                  <textarea
                    className="form-input"
                    placeholder="Type an official response to the user..."
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    style={{ flex: 1, minHeight: '60px', maxHeight: '120px' }}
                    required
                  />
                  <button
                    type="submit"
                    disabled={isSendingReply || (!replyText.trim() && !replyBase64)}
                    className="btn btn-primary"
                    style={{ height: '44px', padding: '0 24px' }}
                  >
                    Send Reply
                  </button>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '13px' }}>
                  <button
                    type="button"
                    onClick={() => replyFileInputRef.current?.click()}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      color: 'var(--primary)',
                      fontWeight: '600',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: 0
                    }}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"/>
                    </svg>
                    Attach Document
                  </button>
                  <span style={{ color: 'var(--text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '250px' }}>
                    {replyFileName || ''}
                  </span>
                </div>

                <input
                  type="file"
                  ref={replyFileInputRef}
                  onChange={handleFileChange}
                  accept=".pdf,.docx,.png,.jpg,.jpeg"
                  style={{ display: 'none' }}
                />
              </form>
            )}

          </div>
        )}

      </div>
    </div>
  );
};

export default SupportManagementPage;
