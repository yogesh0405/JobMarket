import React, { useState, useEffect, useRef } from 'react';
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
  type: 'device' | 'info' | 'job' | 'support';
  link?: string;
  createdAtTimestamp: number;
}

export const NavbarNotificationBell: React.FC = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();

  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isMobile, setIsMobile] = useState(() => typeof window !== 'undefined' && window.innerWidth <= 768);
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
    setNotifications(prev => prev.filter(n => n.id !== id));
    apiFetch(`/api/v1/notifications/${id}`, { method: 'DELETE' }).catch(() => {});
  };

  const markAllAsRead = async () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    apiFetch('/api/v1/notifications/read-all', { method: 'PATCH' }).catch(() => {});
  };

  const clearAllNotifications = async () => {
    setNotifications([]);
    apiFetch('/api/v1/notifications/clear-all', { method: 'DELETE' }).catch(() => {});
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

  const todayItems = notifications.filter(n => n.group === 'TODAY');
  const earlierItems = notifications.filter(n => n.group === 'EARLIER');

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
                fontSize: '13.5px',
                fontWeight: isUnread ? '800' : '600',
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
                  width: '8px',
                  height: '8px',
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
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="3 6 5 6 21 6" />
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
              </svg>
            </button>
          </div>
        </div>

        <div
          style={{
            fontSize: '12px',
            color: isUnread ? '#1e40af' : '#64748b',
            marginTop: '5px',
            lineHeight: '1.4',
            fontWeight: isUnread ? '500' : '400'
          }}
        >
          {item.message}
        </div>

        <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '6px', fontWeight: '500' }}>
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
                <h2 style={{ margin: 0, fontSize: '17px', fontWeight: '800', color: '#0f172a' }}>Notifications</h2>
                {unreadCount > 0 && (
                  <span
                    style={{
                      background: '#eff6ff',
                      color: '#2563eb',
                      fontSize: '11px',
                      fontWeight: '700',
                      padding: '2px 8px',
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
                    onClick={clearAllNotifications}
                    title="Clear all notifications"
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#94a3b8',
                      cursor: 'pointer',
                      padding: '4px',
                      display: 'flex',
                      alignItems: 'center'
                    }}
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                    </svg>
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
              ) : notifications.length === 0 ? (
                <div style={{ padding: '40px 0', textAlign: 'center', color: '#94a3b8' }}>
                  <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px auto', color: '#94a3b8' }}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" /><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" /></svg>
                  </div>
                  <div style={{ fontSize: '14px', fontWeight: '700', color: '#334155' }}>No notifications yet</div>
                  <div style={{ fontSize: '12px', color: '#64748b', marginTop: '4px' }}>Real hiring events, support replies, and application status updates will appear here.</div>
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
