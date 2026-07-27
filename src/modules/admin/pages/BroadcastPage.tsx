import React, { useState, useEffect } from 'react';
import { AdminApiService } from '../services/adminApi';
import { useToast } from '../../../hooks/useToast';

export const BroadcastPage: React.FC = () => {
  const { showToast } = useToast();

  const [targetAudience, setTargetAudience] = useState<'ALL' | 'WORKERS' | 'EMPLOYERS' | 'CATEGORY_WORKERS'>('ALL');
  const [category, setCategory] = useState('');
  const [categoriesList, setCategoriesList] = useState<any[]>([]);
  const [channels, setChannels] = useState<('IN_APP' | 'EMAIL')[]>(['IN_APP', 'EMAIL']);
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [actionLink, setActionLink] = useState('');
  const [sending, setSending] = useState(false);
  const [lastResult, setLastResult] = useState<any>(null);

  const [historyLogs, setHistoryLogs] = useState<any[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  const fetchHistory = async () => {
    try {
      setLoadingHistory(true);
      const res = await AdminApiService.getAuditLogs({ page: 1, limit: 30, search: 'BROADCAST_SENT' });
      setHistoryLogs(res?.data || []);
    } catch (err) {
      console.error('Failed to fetch broadcast history logs', err);
    } finally {
      setLoadingHistory(false);
    }
  };

  useEffect(() => {
    AdminApiService.getCategories()
      .then(res => setCategoriesList(res || []))
      .catch(() => {});
    fetchHistory();
  }, []);

  const handleChannelToggle = (channel: 'IN_APP' | 'EMAIL') => {
    if (channels.includes(channel)) {
      if (channels.length === 1) {
        showToast('At least one notification channel must remain selected', 'warning');
        return;
      }
      setChannels(channels.filter(c => c !== channel));
    } else {
      setChannels([...channels, channel]);
    }
  };

  const handleSendBroadcast = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!subject.trim()) {
      showToast('Please enter a broadcast subject title', 'error');
      return;
    }
    if (!message.trim()) {
      showToast('Please enter the broadcast message body', 'error');
      return;
    }
    if (targetAudience === 'CATEGORY_WORKERS' && !category) {
      showToast('Please select a target industry category', 'error');
      return;
    }

    if (!window.confirm(`Are you sure you want to dispatch this broadcast to target audience "${targetAudience}"?`)) {
      return;
    }

    try {
      setSending(true);
      const res = await AdminApiService.broadcastNotifications({
        targetAudience,
        category: targetAudience === 'CATEGORY_WORKERS' ? category : undefined,
        channels,
        subject,
        message,
        actionLink: actionLink.trim() || undefined
      });

      showToast(res.message || 'Broadcast successfully dispatched!', 'success');
      setLastResult(res);
      setSubject('');
      setMessage('');
      setActionLink('');
      fetchHistory();
    } catch (err: any) {
      showToast(err.message || 'Failed to dispatch broadcast', 'error');
    } finally {
      setSending(false);
    }
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
      {/* Light Header Banner */}
      <div style={{ marginBottom: '28px', background: '#ffffff', padding: '24px 30px', borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 4px 20px rgba(0,0,0,0.03)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: '800', color: '#0f172a', margin: 0, letterSpacing: '-0.3px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
              <path d="M13.73 21a2 2 0 0 1-3.46 0" />
            </svg>
            Broadcast Notifications System
          </h1>
          <p style={{ color: '#64748b', marginTop: '6px', fontSize: '13px', margin: 0 }}>
            Enterprise multi-channel broadcast engine for targeted user announcements and email updates
          </p>
        </div>
        <div style={{ background: '#eff6ff', color: '#2563eb', padding: '8px 16px', borderRadius: '999px', fontSize: '12px', fontWeight: '700', border: '1px solid #bfdbfe' }}>
          SYSTEM BROADCAST
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '28px', alignItems: 'start' }}>
        {/* Form Panel */}
        <div className="admin-card" style={{ padding: '28px', borderRadius: '8px', border: '1px solid #e2e8f0', background: '#ffffff', boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
          <div style={{ borderBottom: '1px solid #f1f5f9', paddingBottom: '16px', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: 'rgba(37, 99, 235, 0.1)', color: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
              </svg>
            </div>
            <div>
              <h2 style={{ fontSize: '17px', fontWeight: '800', color: '#0f172a', margin: 0 }}>Compose Campaign</h2>
              <span style={{ fontSize: '12px', color: '#64748b' }}>Configure target audience, channels, and message content</span>
            </div>
          </div>

          <form onSubmit={handleSendBroadcast} style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
            {/* Target Audience */}
            <div>
              <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: '700', marginBottom: '8px', color: '#334155' }}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2.2">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
                </svg>
                Target Audience Category
              </label>
              <select
                className="filter-select"
                value={targetAudience}
                onChange={(e) => setTargetAudience(e.target.value as any)}
                style={{ width: '100%', padding: '11px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px', fontWeight: '500', background: '#f8fafc', color: '#0f172a' }}
              >
                <option value="ALL">All Platform Users (Workers & Employers)</option>
                <option value="WORKERS">Workers / Candidates Only</option>
                <option value="EMPLOYERS">Employers / Hiring Managers Only</option>
                <option value="CATEGORY_WORKERS">Targeted Trade Category (Workers)</option>
              </select>
            </div>

            {/* Category Selector (Conditional) */}
            {targetAudience === 'CATEGORY_WORKERS' && (
              <div>
                <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: '700', marginBottom: '8px', color: '#334155' }}>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2.2">
                    <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
                  </svg>
                  Industrial Trade / Skill Category
                </label>
                <select
                  className="filter-select"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  style={{ width: '100%', padding: '11px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px', fontWeight: '500', background: '#f8fafc', color: '#0f172a' }}
                >
                  <option value="">Select Category...</option>
                  {categoriesList.map((cat) => (
                    <option key={cat.id || cat.name} value={cat.name}>
                      {cat.name}
                    </option>
                  ))}
                  <option value="Welder">Welder</option>
                  <option value="CNC Operator">CNC Operator</option>
                  <option value="Fitter">Fitter</option>
                  <option value="Electrician">Electrician</option>
                  <option value="Turner">Turner</option>
                </select>
              </div>
            )}

            {/* Channel Selection */}
            <div>
              <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: '700', marginBottom: '10px', color: '#334155' }}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2.2">
                  <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
                </svg>
                Dispatch Channels
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 14px', borderRadius: '8px', border: channels.includes('IN_APP') ? '2px solid #2563eb' : '1px solid #cbd5e1', background: channels.includes('IN_APP') ? '#eff6ff' : '#ffffff', cursor: 'pointer', transition: 'all 0.2s ease' }}>
                  <input
                    type="checkbox"
                    checked={channels.includes('IN_APP')}
                    onChange={() => handleChannelToggle('IN_APP')}
                    style={{ width: '18px', height: '18px', accentColor: '#2563eb' }}
                  />
                  <div>
                    <span style={{ display: 'block', fontSize: '13px', fontWeight: '700', color: '#0f172a' }}>In-App Notification</span>
                    <span style={{ fontSize: '11px', color: '#64748b' }}>App Drawer & Bell badge</span>
                  </div>
                </label>

                <label style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 14px', borderRadius: '8px', border: channels.includes('EMAIL') ? '2px solid #2563eb' : '1px solid #cbd5e1', background: channels.includes('EMAIL') ? '#eff6ff' : '#ffffff', cursor: 'pointer', transition: 'all 0.2s ease' }}>
                  <input
                    type="checkbox"
                    checked={channels.includes('EMAIL')}
                    onChange={() => handleChannelToggle('EMAIL')}
                    style={{ width: '18px', height: '18px', accentColor: '#2563eb' }}
                  />
                  <div>
                    <span style={{ display: 'block', fontSize: '13px', fontWeight: '700', color: '#0f172a' }}>Email Broadcast</span>
                    <span style={{ fontSize: '11px', color: '#64748b' }}>Brevo SMTP Delivery</span>
                  </div>
                </label>
              </div>
            </div>

            {/* Subject */}
            <div>
              <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: '700', marginBottom: '8px', color: '#334155' }}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2.2">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" /><polyline points="22,6 12,13 2,6" />
                </svg>
                Subject / Campaign Title
              </label>
              <input
                type="text"
                placeholder="e.g., Special MIDC Industrial Hiring Drive in Pune"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                style={{ width: '100%', padding: '11px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px', background: '#ffffff', color: '#0f172a', outline: 'none' }}
              />
            </div>

            {/* Action Link (Optional) */}
            <div>
              <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: '700', marginBottom: '8px', color: '#334155' }}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2.2">
                  <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                  <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
                </svg>
                Target Action URL Link (Optional)
              </label>
              <input
                type="text"
                placeholder="e.g., /jobs or /dashboard?tab=applied-jobs"
                value={actionLink}
                onChange={(e) => setActionLink(e.target.value)}
                style={{ width: '100%', padding: '11px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px', background: '#ffffff', color: '#0f172a', outline: 'none' }}
              />
            </div>

            {/* Message Body */}
            <div>
              <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: '700', marginBottom: '8px', color: '#334155' }}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2.2">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                </svg>
                Notification Message Content
              </label>
              <textarea
                rows={5}
                placeholder="Write your announcement message here..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                style={{ width: '100%', padding: '12px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px', background: '#ffffff', color: '#0f172a', resize: 'vertical', fontFamily: 'inherit', outline: 'none', lineHeight: '1.5' }}
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={sending}
              style={{
                width: '100%',
                padding: '14px',
                borderRadius: '8px',
                background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
                color: '#ffffff',
                border: 'none',
                fontSize: '15px',
                fontWeight: '700',
                cursor: sending ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                boxShadow: '0 4px 14px rgba(37, 99, 235, 0.3)',
                transition: 'all 0.2s ease',
                marginTop: '6px'
              }}
            >
              {sending ? (
                <>
                  <svg className="animate-spin" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" style={{ animation: 'spin 1s linear infinite' }}>
                    <circle cx="12" cy="12" r="10" stroke="rgba(255,255,255,0.2)"/>
                    <path d="M4 12a8 8 0 0 1 8-8" fill="currentColor"/>
                  </svg>
                  Dispatching Campaign...
                </>
              ) : (
                <>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                    <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
                  </svg>
                  Send Broadcast Campaign
                </>
              )}
            </button>
          </form>
        </div>

        {/* Live Light Preview & Audit Sidebar */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', height: '100%' }}>
          {/* Light Theme Drawer Card Preview */}
          <div className="admin-card" style={{ padding: '24px', borderRadius: '8px', background: '#ffffff', color: '#0f172a', boxShadow: '0 4px 20px rgba(0,0,0,0.03)', border: '1px solid #e2e8f0', flexShrink: 0 }}>
            <div style={{ borderBottom: '1px solid #f1f5f9', paddingBottom: '14px', marginBottom: '18px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#2563eb' }}></div>
                <h3 style={{ fontSize: '13px', fontWeight: '800', color: '#475569', textTransform: 'uppercase', letterSpacing: '0.8px', margin: 0 }}>
                  Live Drawer Preview
                </h3>
              </div>
              <span style={{ fontSize: '11px', background: '#eff6ff', color: '#2563eb', padding: '3px 10px', borderRadius: '999px', fontWeight: '700', border: '1px solid #bfdbfe' }}>
                {targetAudience}
              </span>
            </div>

            {/* Rendered Light Card Mockup */}
            <div style={{ background: '#f8fafc', borderRadius: '8px', padding: '16px', border: '1px solid #e2e8f0', display: 'flex', gap: '12px' }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: '#eff6ff', color: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 0 1-3.46 0" />
                </svg>
              </div>

              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                  <h4 style={{ fontSize: '14px', fontWeight: '700', color: '#0f172a', margin: 0 }}>
                    {subject || 'Announcement Subject Title'}
                  </h4>
                  <span style={{ fontSize: '10px', color: '#94a3b8' }}>Just Now</span>
                </div>
                <p style={{ fontSize: '12px', color: '#475569', margin: '0 0 10px 0', lineHeight: '1.5', whiteSpace: 'pre-line' }}>
                  {message || 'Your broadcast campaign message text will render here dynamically as you compose...'}
                </p>
                {actionLink && (
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '11px', color: '#2563eb', fontWeight: '700' }}>
                    View Action Target &rarr;
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Broadcast History Sidebar Section */}
          <div className="admin-card" style={{ padding: '20px', borderRadius: '8px', background: '#ffffff', border: '1px solid #e2e8f0', boxShadow: '0 4px 20px rgba(0,0,0,0.03)', flex: 1, display: 'flex', flexDirection: 'column', minHeight: '380px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', borderBottom: '1px solid #f1f5f9', paddingBottom: '12px', flexShrink: 0 }}>
              <div>
                <h3 style={{ fontSize: '13px', fontWeight: '800', color: '#475569', textTransform: 'uppercase', letterSpacing: '0.8px', margin: 0, display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2.2">
                    <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
                  </svg>
                  Broadcast History
                </h3>
              </div>
              <button 
                onClick={fetchHistory}
                className="btn btn-ghost btn-sm"
                style={{ fontSize: '11px', display: 'flex', alignItems: 'center', gap: '4px', color: '#2563eb', border: '1px solid #bfdbfe', background: '#eff6ff', borderRadius: '6px', padding: '4px 10px', fontWeight: '700', cursor: 'pointer' }}
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/>
                </svg>
                Refresh
              </button>
            </div>

            {loadingHistory ? (
              <div style={{ padding: '20px', textAlign: 'center', color: '#64748b', fontSize: '12px' }}>Loading history...</div>
            ) : historyLogs.length === 0 ? (
              <div style={{ padding: '20px 12px', textAlign: 'center', color: '#64748b', background: '#f8fafc', borderRadius: '10px', border: '1px dashed #cbd5e1', fontSize: '12px', flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                No previous broadcasts found.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', flex: 1, maxHeight: '350px', overflowY: 'auto', paddingRight: '4px' }}>
                {historyLogs.map((log: any) => {
                  const meta = typeof log.details === 'string' ? JSON.parse(log.details || '{}') : (log.details || {});
                  return (
                    <div key={log.id} style={{ padding: '12px', borderRadius: '10px', background: '#f8fafc', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px' }}>
                        <strong style={{ fontSize: '13px', color: '#0f172a', lineHeight: '1.3' }}>{meta.subject || log.details?.subject || 'System Broadcast'}</strong>
                        <span style={{ fontSize: '10px', background: '#eff6ff', color: '#2563eb', padding: '2px 6px', borderRadius: '4px', fontWeight: '700', whiteSpace: 'nowrap' }}>
                          {meta.targetAudience || 'ALL'}
                        </span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '11px', color: '#64748b', marginTop: '2px' }}>
                        <span>Sent to <strong>{meta.totalRecipients || 0}</strong> users</span>
                        <span>{new Date(log.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
export default BroadcastPage;
