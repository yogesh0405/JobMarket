import React, { useState, useEffect, useRef, useMemo } from 'react';
import ReactDOM from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { apiFetch } from '../../utils/api';
import { timeAgo } from '../../utils/helpers';
import { resolveWebNotificationRoute } from '../../utils/notificationRouter';

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  time: string;
  read: boolean;
  group: 'TODAY' | 'EARLIER';
  type: 'device' | 'info' | 'job' | 'support' | string;
  rawType?: string;
  entityType?: string;
  link?: string;
  createdAtTimestamp: number;
}

export type NotificationCategory = 'ALL' | 'JOB_POSTINGS' | 'APPLICATIONS' | 'INTERVIEWS' | 'BANNERS' | 'PLATFORM' | 'OTHER';

export const EMPLOYER_CATEGORY_FILTERS = [
  { key: 'ALL', label: 'All' },
  { key: 'JOB_POSTINGS', label: 'Job Postings' },
  { key: 'APPLICATIONS', label: 'Applications' },
  { key: 'BANNERS', label: 'Banners' },
  { key: 'PLATFORM', label: 'Platform' },
];

export const CANDIDATE_CATEGORY_FILTERS = [
  { key: 'ALL', label: 'All' },
  { key: 'APPLICATIONS', label: 'Applications' },
  { key: 'INTERVIEWS', label: 'Interviews' },
  { key: 'PLATFORM', label: 'Platform' },
];

export const classifyNotification = (n: NotificationItem): NotificationCategory => {
  const type = (n.rawType || n.type || '').toUpperCase().trim();
  const entityType = (n.entityType || '').toUpperCase().trim();
  const title = (n.title || '').toUpperCase().trim();
  const msg = (n.message || '').toUpperCase().trim();
  const link = (n.link || '').toUpperCase().trim();

  // 1. BANNER / ADVERTISEMENTS
  if (
    entityType === 'BANNER' ||
    entityType === 'ADVERTISEMENT' ||
    entityType === 'AD' ||
    type.startsWith('BANNER') ||
    type.startsWith('AD_') ||
    link.includes('BANNERS') ||
    title.includes('BANNER') ||
    title.includes('ADVERTISEMENT') ||
    title.includes('AD CAMPAIGN')
  ) {
    return 'BANNERS';
  }

  // 2. INTERVIEWS & SCHEDULED CALLS
  if (
    entityType === 'INTERVIEW' ||
    type.includes('INTERVIEW') ||
    link.includes('INTERVIEW') ||
    title.includes('INTERVIEW') ||
    title.includes('WALK-IN') ||
    msg.includes('SCHEDULED AN INTERVIEW') ||
    msg.includes('INTERVIEW FOR')
  ) {
    return 'INTERVIEWS';
  }

  // 3. CANDIDATE APPLICATIONS & STATUSES
  if (
    entityType === 'APPLICATION' ||
    type === 'JOB_APPLICATION' ||
    type === 'APPLICATION_CONFIRMATION' ||
    type === 'APPLICATION_STATUS' ||
    type === 'APPLICATION_RECEIVED' ||
    type.includes('APPLICANT') ||
    type.includes('APPLICATION') ||
    link.includes('TAB=APPLICANTS') ||
    link.includes('/APPLICANTS') ||
    link.includes('TAB=APPLIED') ||
    link.includes('/APPLIED') ||
    title.includes('APPLICATION') ||
    title.includes('APPLICANT') ||
    title.startsWith('APPLICATION STATUS') ||
    msg.includes('APPLIED FOR') ||
    msg.includes('YOUR APPLICATION FOR')
  ) {
    return 'APPLICATIONS';
  }

  // 4. JOB POSTINGS & VACANCY MANAGEMENT
  if (
    entityType === 'JOB' ||
    type === 'JOB_APPROVAL' ||
    type === 'JOB_APPROVED' ||
    type === 'JOB_REJECTED' ||
    type === 'JOB_POSTED' ||
    type === 'JOB_EXPIRED' ||
    type === 'JOB_CREATED' ||
    type === 'JOB_UPDATED' ||
    type === 'JOB_EXPIRY' ||
    type.startsWith('JOB_') ||
    link.includes('TAB=MANAGE') ||
    link.includes('/EMPLOYER/JOBS') ||
    link.includes('/MANAGE-JOBS') ||
    title.includes('JOB POST') ||
    title.includes('JOB SUBMITTED') ||
    title.includes('JOB APPROVED') ||
    title.includes('JOB REJECTED') ||
    title.includes('VACANCY') ||
    msg.includes('YOUR JOB POST') ||
    msg.includes('JOB HAS BEEN')
  ) {
    return 'JOB_POSTINGS';
  }

  // 5. PLATFORM & ADMIN NOTIFICATIONS
  if (
    entityType === 'SUPPORT' ||
    entityType === 'TICKET' ||
    entityType === 'ADMIN' ||
    entityType === 'SYSTEM' ||
    entityType === 'KYC' ||
    entityType === 'VERIFICATION' ||
    type.includes('SUPPORT') ||
    type.includes('TICKET') ||
    type.includes('ADMIN') ||
    type.includes('SYSTEM') ||
    type.includes('BROADCAST') ||
    type.includes('KYC') ||
    type.includes('VERIF') ||
    type.includes('AADHAAR') ||
    type.includes('ACCOUNT') ||
    type.includes('SECURITY') ||
    link.includes('SUPPORT') ||
    link.includes('TICKETS') ||
    link.includes('ADMIN') ||
    link.includes('SECURITY') ||
    title.includes('SUPPORT') ||
    title.includes('TICKET')
  ) {
    return 'PLATFORM';
  }

  return 'OTHER';
};

export const NavbarNotificationBell: React.FC = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();

  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isMobile, setIsMobile] = useState(() => typeof window !== 'undefined' && window.innerWidth <= 768);
  const [isClearing, setIsClearing] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [clearError, setClearError] = useState<string | null>(null);
  const isMountedRef = useRef(true);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  // Load REAL notifications from Database without continuous blinking
  const fetchRealNotifications = async (isInitial = false) => {
    if (!currentUser?.id) {
      if (isMountedRef.current) {
        setNotifications([]);
        setLoading(false);
      }
      return;
    }

    const now = Date.now();
    const oneDayMs = 24 * 60 * 60 * 1000;

    try {
      // Only show spinner on very first load if we have no items
      if (isInitial && notifications.length === 0 && isMountedRef.current) {
        setLoading(true);
      }

      const sysRes = await apiFetch('/api/v1/notifications').catch(() => null);

      if (sysRes && sysRes.ok) {
        const sysJson = await sysRes.json();
        const sysNotifs = sysJson.data || [];
        const realItems: NotificationItem[] = [];

        sysNotifs.forEach((item: any) => {
          const createdMs = new Date(item.created_at || item.createdAt || Date.now()).getTime();
          const isToday = (now - createdMs) < oneDayMs;
          const isRead = item.read || item.is_read || false;

          let notifType: NotificationItem['type'] = 'info';
          if (['JOB_APPLICATION', 'JOB_STATUS', 'JOB_INTERVIEW', 'JOB_APPROVAL', 'AD_APPROVED', 'AD_REJECTED', 'AD_UNPUBLISHED'].includes(item.type)) {
            notifType = 'job';
          } else if (['SUPPORT', 'SUPPORT_TICKET', 'SUPPORT_REPLY'].includes(item.type)) {
            notifType = 'support';
          }

          realItems.push({
            id: item.id,
            title: item.title,
            message: item.message,
            time: timeAgo(item.created_at || item.createdAt || new Date().toISOString()),
            read: isRead,
            group: isToday ? 'TODAY' : 'EARLIER',
            type: notifType,
            rawType: item.type || '',
            entityType: item.entity_type || item.entityType || '',
            link: item.link || '/dashboard',
            createdAtTimestamp: createdMs
          });
        });

        // Sort real notifications by newest first
        realItems.sort((a, b) => b.createdAtTimestamp - a.createdAtTimestamp);

        if (isMountedRef.current) {
          setNotifications(realItems);
        }
      }
    } catch (err) {
      console.error('Failed to load real notifications from DB', err);
    } finally {
      if (isMountedRef.current) {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    if (!currentUser?.id) {
      setNotifications([]);
      setLoading(false);
      return;
    }

    fetchRealNotifications(true);

    // 1. Background poll every 45s (only when browser tab is active/visible)
    const pollInterval = setInterval(() => {
      if (document.visibilityState === 'visible') {
        fetchRealNotifications(false);
      }
    }, 45000);

    // 2. Refresh when tab becomes visible
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        fetchRealNotifications(false);
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // 3. Listen for global custom 'notifications-updated' event
    const handleCustomUpdate = () => fetchRealNotifications(false);
    window.addEventListener('notifications-updated', handleCustomUpdate);

    return () => {
      clearInterval(pollInterval);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('notifications-updated', handleCustomUpdate);
    };
  }, [currentUser?.id]);

  const unreadCount = notifications.filter(n => !n.read).length;

  // Handle window resize for Desktop vs Mobile drawer mode
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Lock body scroll when drawer is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const handleNotificationClick = async (item: NotificationItem) => {
    // Optimistic read update
    setNotifications(prev =>
      prev.map(n => (n.id === item.id ? { ...n, read: true } : n))
    );

    apiFetch(`/api/v1/notifications/${item.id}/read`, { method: 'PATCH' }).catch(() => {});
    setIsOpen(false);

    const userRole = (currentUser as any)?.role || 'candidate';
    const targetRoute = resolveWebNotificationRoute(item as any, userRole);

    if (targetRoute) {
      if (targetRoute.startsWith('#')) {
        window.location.hash = targetRoute;
      } else {
        navigate(targetRoute);
      }
    }
  };

  const deleteNotification = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    const backup = [...notifications];
    setNotifications(prev => prev.filter(n => n.id !== id));
    try {
      const res = await apiFetch(`/api/v1/notifications/${id}`, { method: 'DELETE' });
      if (!res.ok) {
        setNotifications(backup);
      } else {
        window.dispatchEvent(new CustomEvent('notifications-updated'));
      }
    } catch {
      setNotifications(backup);
    }
  };

  const markAllAsRead = async () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    apiFetch('/api/v1/notifications/read-all', { method: 'PATCH' }).catch(() => {});
  };

  const clearAllNotifications = async () => {
    if (isClearing || notifications.length === 0) return;
    setIsClearing(true);
    setClearError(null);
    const backup = [...notifications];
    setNotifications([]);

    try {
      const res = await apiFetch('/api/v1/notifications/clear-all', { method: 'DELETE' });
      if (!res.ok) {
        throw new Error('Failed to permanently clear notifications');
      }
      setShowClearConfirm(false);
      window.dispatchEvent(new CustomEvent('notifications-updated'));
    } catch (err: any) {
      console.error('Failed to clear notifications:', err);
      setNotifications(backup);
      setClearError('Could not clear notifications. Please try again.');
    } finally {
      setIsClearing(false);
    }
  };

  const renderIcon = (type: NotificationItem['type']) => {
    if (type === 'job') {
      return (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
          <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
        </svg>
      );
    }
    if (type === 'support') {
      return (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
        </svg>
      );
    }
    return (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#6366f1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <line x1="12" y1="16" x2="12" y2="12" />
        <line x1="12" y1="8" x2="12.01" y2="8" />
      </svg>
    );
  };

  const isEmployer = (currentUser?.role || '').toLowerCase() === 'employer';
  const [filter, setFilter] = useState<'ALL' | 'UNREAD'>('ALL');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');

  const categoryFilterOptions = useMemo(() => {
    return isEmployer ? EMPLOYER_CATEGORY_FILTERS : CANDIDATE_CATEGORY_FILTERS;
  }, [isEmployer]);

  const displayedList = useMemo(() => {
    return notifications.filter((n) => {
      // 1. Read / Unread tab filter
      if (filter === 'UNREAD' && n.read) {
        return false;
      }

      // 2. Category capsule filter
      if (selectedCategory !== 'ALL') {
        const cat = classifyNotification(n);
        if (selectedCategory === 'PLATFORM') {
          if (cat !== 'PLATFORM' && cat !== 'OTHER') {
            return false;
          }
        } else if (cat !== selectedCategory) {
          return false;
        }
      }

      return true;
    });
  }, [notifications, filter, selectedCategory]);

  const todayItems = displayedList.filter((n) => n.group === 'TODAY');
  const earlierItems = displayedList.filter((n) => n.group === 'EARLIER');

  const renderItemCard = (item: NotificationItem) => {
    const isUnread = !item.read;

    return (
      <div
        key={item.id}
        onClick={() => handleNotificationClick(item)}
        style={{
          background: isUnread ? '#eff6ff' : '#ffffff',
          border: isUnread ? '1px solid #bfdbfe' : '1px solid #f1f5f9',
          borderRadius: '14px',
          padding: '12px 14px',
          marginBottom: '10px',
          cursor: 'pointer',
          position: 'relative',
          transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
          boxShadow: isUnread ? '0 2px 8px rgba(37, 99, 235, 0.08)' : '0 1px 3px rgba(0,0,0,0.02)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1 }}>
            {renderIcon(item.type)}
            <span
              style={{
                fontSize: '12px',
                fontWeight: isUnread ? '650' : '500',
                color: isUnread ? '#1e3a8a' : '#334155',
                lineHeight: '1.3'
              }}
            >
              {item.title}
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
            {isUnread && (
              <span
                style={{
                  width: '7px',
                  height: '7px',
                  borderRadius: '50%',
                  background: '#2563eb'
                }}
              />
            )}

            <button
              type="button"
              onClick={(e) => deleteNotification(e, item.id)}
              title="Delete notification"
              style={{
                background: 'none',
                border: 'none',
                color: '#94a3b8',
                cursor: 'pointer',
                padding: '3px',
                display: 'flex',
                alignItems: 'center',
                borderRadius: '4px'
              }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="3 6 5 6 21 6" />
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
              </svg>
            </button>
          </div>
        </div>

        <div
          style={{
            fontSize: '11px',
            color: isUnread ? '#1e40af' : '#64748b',
            marginTop: '4px',
            lineHeight: '1.4',
            fontWeight: '400'
          }}
        >
          {item.message}
        </div>

        <div style={{ fontSize: '10px', color: '#94a3b8', marginTop: '5px', fontWeight: '500' }}>
          {item.time}
        </div>
      </div>
    );
  };

  // React Portal Content (mounted on document.body for top z-index stack)
  const drawerPortal = isOpen
    ? ReactDOM.createPortal(
        <div style={{ position: 'fixed', inset: 0, zIndex: 999999 }}>
          {/* Full Screen Blurred Backdrop */}
          <div
            className="notification-backdrop"
            onClick={() => setIsOpen(false)}
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(15, 23, 42, 0.45)',
              backdropFilter: 'blur(8px)',
              WebkitBackdropFilter: 'blur(8px)',
              zIndex: 999999,
              transition: 'opacity 0.2s ease'
            }}
          />

          {/* Drawer Container (Desktop Right Sidebar / Mobile Bottom Sheet) */}
          <div
            className={`notification-drawer ${isMobile ? 'mobile-bottom-drawer' : 'desktop-side-drawer'}`}
            style={
              isMobile
                ? {
                    position: 'fixed',
                    bottom: 0,
                    left: 0,
                    right: 0,
                    maxHeight: '88vh',
                    background: '#ffffff',
                    borderRadius: '24px 24px 0 0',
                    boxShadow: '0 -10px 40px rgba(15, 23, 42, 0.25)',
                    zIndex: 1000000,
                    display: 'flex',
                    flexDirection: 'column',
                    overflow: 'hidden',
                    animation: 'slideUpBottom 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards'
                  }
                : {
                    position: 'fixed',
                    top: 0,
                    right: 0,
                    bottom: 0,
                    width: '390px',
                    maxWidth: '100vw',
                    background: '#ffffff',
                    boxShadow: '-10px 0 40px rgba(15, 23, 42, 0.2)',
                    zIndex: 1000000,
                    display: 'flex',
                    flexDirection: 'column',
                    overflow: 'hidden',
                    animation: 'slideInRight 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards'
                  }
            }
          >
            {/* Mobile Drag Indicator Pill */}
            {isMobile && (
              <div style={{ display: 'flex', justifyContent: 'center', paddingTop: '12px', paddingBottom: '4px' }}>
                <div style={{ width: '40px', height: '4px', borderRadius: '999px', background: '#cbd5e1' }} />
              </div>
            )}

            {/* Drawer Header */}
            <div
              style={{
                padding: '16px 20px',
                borderBottom: '1px solid #f1f5f9',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexShrink: 0
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <h2 style={{ margin: 0, fontSize: '14.5px', fontWeight: '700', color: '#0f172a' }}>Notifications</h2>
                {unreadCount > 0 && (
                  <span
                    style={{
                      background: '#eff6ff',
                      color: '#2563eb',
                      fontSize: '10px',
                      fontWeight: '700',
                      padding: '1.5px 7px',
                      borderRadius: '999px'
                    }}
                  >
                    {unreadCount > 9 ? '9+' : unreadCount} new
                  </span>
                )}
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                {/* Mark All as Read Icon (Double Checkmark) */}
                <button
                  type="button"
                  onClick={markAllAsRead}
                  title="Mark all as read"
                  style={{
                    background: 'none',
                    border: 'none',
                    color: unreadCount > 0 ? '#2563eb' : '#cbd5e1',
                    cursor: unreadCount > 0 ? 'pointer' : 'default',
                    padding: '4px',
                    display: 'flex',
                    alignItems: 'center'
                  }}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M18 6L7 17l-5-5" />
                    <path d="M22 10l-7.5 7.5L13 16" />
                  </svg>
                </button>

                {/* Clear All Icon (Trash) */}
                {notifications.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setShowClearConfirm(true)}
                    disabled={isClearing}
                    title="Clear all notifications permanently"
                    style={{
                      background: 'none',
                      border: 'none',
                      color: isClearing ? '#94a3b8' : '#ef4444',
                      cursor: isClearing ? 'wait' : 'pointer',
                      padding: '4px',
                      display: 'flex',
                      alignItems: 'center',
                      opacity: isClearing ? 0.6 : 1
                    }}
                  >
                    {isClearing ? (
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="animate-spin">
                        <circle cx="12" cy="12" r="10" strokeOpacity="0.25" stroke="currentColor" />
                        <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" />
                      </svg>
                    ) : (
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                      </svg>
                    )}
                  </button>
                )}

                {/* Close Button Cross */}
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  title="Close"
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#64748b',
                    cursor: 'pointer',
                    padding: '4px',
                    display: 'flex',
                    alignItems: 'center'
                  }}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Clear All Confirmation Banner */}
            {showClearConfirm && (
              <div
                style={{
                  padding: '10px 16px',
                  background: '#fef2f2',
                  borderBottom: '1px solid #fee2e2',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '8px'
                }}
              >
                <div style={{ fontSize: '12px', color: '#991b1b', fontWeight: '500' }}>
                  Permanently delete all notifications?
                </div>
                <div style={{ display: 'flex', gap: '6px' }}>
                  <button
                    type="button"
                    onClick={() => setShowClearConfirm(false)}
                    disabled={isClearing}
                    style={{
                      background: '#ffffff',
                      border: '1px solid #cbd5e1',
                      borderRadius: '4px',
                      padding: '4px 9px',
                      fontSize: '11px',
                      fontWeight: '600',
                      color: '#475569',
                      cursor: 'pointer'
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={clearAllNotifications}
                    disabled={isClearing}
                    style={{
                      background: '#dc2626',
                      border: 'none',
                      borderRadius: '4px',
                      padding: '4px 9px',
                      fontSize: '11px',
                      fontWeight: '600',
                      color: '#ffffff',
                      cursor: 'pointer'
                    }}
                  >
                    {isClearing ? 'Deleting...' : 'Clear All'}
                  </button>
                </div>
              </div>
            )}

            {clearError && (
              <div style={{ padding: '8px 16px', background: '#fee2e2', color: '#b91c1c', fontSize: '12px', textAlign: 'center' }}>
                {clearError}
              </div>
            )}

            {/* Tab Bar: ALL vs UNREAD (Matching MobileApp Notification Screen) */}
            <div
              style={{
                display: 'flex',
                borderBottom: '1px solid #f1f5f9',
                padding: '0 20px',
                background: '#ffffff',
                flexShrink: 0,
              }}
            >
              <button
                type="button"
                onClick={() => setFilter('ALL')}
                style={{
                  flex: 1,
                  padding: '10px 0',
                  background: 'none',
                  border: 'none',
                  borderBottom: filter === 'ALL' ? '2.5px solid #1b4fdf' : '2.5px solid transparent',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  fontSize: '13px',
                  fontWeight: filter === 'ALL' ? 700 : 600,
                  color: filter === 'ALL' ? '#1b4fdf' : '#64748b',
                  transition: 'all 0.15s ease',
                }}
              >
                <span>All</span>
                <span
                  style={{
                    fontSize: '10.5px',
                    fontWeight: 700,
                    padding: '1px 6px',
                    borderRadius: '10px',
                    backgroundColor: filter === 'ALL' ? '#eff6ff' : '#f1f5f9',
                    color: filter === 'ALL' ? '#1b4fdf' : '#64748b',
                  }}
                >
                  {notifications.length}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setFilter('UNREAD')}
                style={{
                  flex: 1,
                  padding: '10px 0',
                  background: 'none',
                  border: 'none',
                  borderBottom: filter === 'UNREAD' ? '2.5px solid #1b4fdf' : '2.5px solid transparent',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  fontSize: '13px',
                  fontWeight: filter === 'UNREAD' ? 700 : 600,
                  color: filter === 'UNREAD' ? '#1b4fdf' : '#64748b',
                  transition: 'all 0.15s ease',
                }}
              >
                <span>Unread</span>
                {unreadCount > 0 && (
                  <span
                    style={{
                      fontSize: '10.5px',
                      fontWeight: 700,
                      padding: '1px 6px',
                      borderRadius: '10px',
                      backgroundColor: filter === 'UNREAD' ? '#fef2f2' : '#f1f5f9',
                      color: filter === 'UNREAD' ? '#dc2626' : '#64748b',
                    }}
                  >
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>
            </div>

            {/* LinkedIn-Style Horizontal Capsule Filter Pills (Matching Mobile Notification Screen) */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 20px',
                overflowX: 'auto',
                scrollbarWidth: 'none',
                background: '#ffffff',
                borderBottom: '1px solid #f1f5f9',
                flexShrink: 0,
              }}
            >
              {categoryFilterOptions.map((cat) => {
                const isActive = selectedCategory === cat.key;
                return (
                  <button
                    key={cat.key}
                    type="button"
                    onClick={() => setSelectedCategory(cat.key)}
                    style={{
                      padding: '5px 13px',
                      borderRadius: '9999px',
                      fontSize: '12px',
                      fontWeight: 600,
                      border: isActive ? '1px solid #1b4fdf' : '1px solid #e2e8f0',
                      backgroundColor: isActive ? '#1b4fdf' : '#f8fafc',
                      color: isActive ? '#ffffff' : '#475569',
                      cursor: 'pointer',
                      whiteSpace: 'nowrap',
                      flexShrink: 0,
                      transition: 'all 0.15s ease',
                    }}
                  >
                    {cat.label}
                  </button>
                );
              })}
            </div>

            {/* Notifications Scroll Body */}
            <div
              style={{
                padding: '16px 20px',
                overflowY: 'auto',
                flex: 1
              }}
            >
              {loading && notifications.length === 0 ? (
                <div style={{ padding: '36px 0', textAlign: 'center', color: '#94a3b8', fontSize: '13px' }}>
                  Loading real notifications...
                </div>
              ) : displayedList.length === 0 ? (
                <div style={{ padding: '40px 0', textAlign: 'center', color: '#94a3b8' }}>
                  <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px auto', color: '#94a3b8' }}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" /><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" /></svg>
                  </div>
                  <div style={{ fontSize: '14px', fontWeight: '700', color: '#334155' }}>
                    {filter === 'UNREAD'
                      ? 'No unread notifications'
                      : selectedCategory !== 'ALL'
                      ? `No ${categoryFilterOptions.find((c) => c.key === selectedCategory)?.label || ''} notifications`
                      : 'No notifications yet'}
                  </div>
                  <div style={{ fontSize: '12px', color: '#64748b', marginTop: '4px' }}>
                    {filter === 'UNREAD'
                      ? 'You have caught up with all updates!'
                      : 'Real hiring events, support replies, and application status updates will appear here.'}
                  </div>
                </div>
              ) : (
                <>
                  {/* TODAY SECTION */}
                  {todayItems.length > 0 && (
                    <div style={{ marginBottom: '14px' }}>
                      <div
                        style={{
                          fontSize: '10px',
                          fontWeight: '800',
                          color: '#64748b',
                          letterSpacing: '0.5px',
                          textTransform: 'uppercase',
                          marginBottom: '8px'
                        }}
                      >
                        TODAY
                      </div>
                      {todayItems.map(renderItemCard)}
                    </div>
                  )}

                  {/* EARLIER SECTION */}
                  {earlierItems.length > 0 && (
                    <div>
                      <div
                        style={{
                          fontSize: '10px',
                          fontWeight: '800',
                          color: '#64748b',
                          letterSpacing: '0.5px',
                          textTransform: 'uppercase',
                          margin: '14px 0 8px 0'
                        }}
                      >
                        EARLIER
                      </div>
                      {earlierItems.map(renderItemCard)}
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>,
        document.body
      )
    : null;

  return (
    <div className="notification-bell-container" style={{ position: 'relative', display: 'inline-flex', alignItems: 'center' }}>
      {/* Transparent Bell Button (Exact Mobile App Match - No Background) */}
      <button
        type="button"
        className="notification-bell-btn"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Notifications"
        style={{
          position: 'relative',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '32px',
          height: '32px',
          background: 'transparent',
          border: 'none',
          padding: 0,
          color: '#334155',
          cursor: 'pointer',
          outline: 'none',
          boxShadow: 'none',
          transition: 'color 0.15s ease'
        }}
      >
        <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
          <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
        </svg>

        {unreadCount > 0 && (
          <span
            className="notification-badge-count"
            style={{
              position: 'absolute',
              top: '-2px',
              right: '-4px',
              minWidth: '15px',
              height: '15px',
              padding: '0 3px',
              borderRadius: '999px',
              background: '#ef4444',
              color: '#ffffff',
              fontSize: '8.5px',
              fontWeight: '800',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              lineHeight: 1,
              boxShadow: '0 2px 4px rgba(239, 68, 68, 0.35)',
              boxSizing: 'border-box'
            }}
          >
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {drawerPortal}
    </div>
  );
};
