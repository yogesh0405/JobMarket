import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { apiFetch } from '../../utils/api';
import { resolveWebNotificationRoute } from '../../utils/notificationRouter';
import {
  Bell,
  CheckCheck,
  Trash2,
  Briefcase,
  UserCheck,
  CalendarClock,
  Megaphone,
  ShieldCheck,
  Info,
  Clock,
  ArrowLeft,
  X,
  MoreVertical
} from 'lucide-react';

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  time: string;
  createdAt?: string;
  read: boolean;
  link?: string;
  type: 'job' | 'support' | 'announcement' | 'info';
  rawType?: string;
  entityType?: string;
  entityId?: string;
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

// 100% Domain-Accurate Notification Classifier matching Mobile NotificationScreen
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

const formatTimeAgo = (dateStr?: string): string => {
  if (!dateStr) return 'Just now';
  const createdMs = new Date(dateStr).getTime();
  if (isNaN(createdMs)) return 'Just now';
  const diffSec = Math.floor((Date.now() - createdMs) / 1000);
  if (diffSec < 60) return 'Just now';
  if (diffSec < 3600) return `${Math.floor(diffSec / 60)}m ago`;
  if (diffSec < 86400) return `${Math.floor(diffSec / 3600)}h ago`;
  if (diffSec < 172800) return 'Yesterday';
  return `${Math.floor(diffSec / 86400)}d ago`;
};

export const NotificationsPage: React.FC = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();

  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'ALL' | 'UNREAD'>('ALL');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [isClearing, setIsClearing] = useState(false);
  const [clearError, setClearError] = useState<string | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);

  const isMountedRef = useRef(true);
  const isFetchingRef = useRef(false);
  const notificationsRef = useRef<NotificationItem[]>([]);
  notificationsRef.current = notifications;
  const menuRef = useRef<HTMLDivElement>(null);

  const isEmployer = currentUser?.role?.toLowerCase() === 'employer';
  const categoryFilterOptions = isEmployer ? EMPLOYER_CATEGORY_FILTERS : CANDIDATE_CATEGORY_FILTERS;

  const fetchRealNotifications = async (isInitial = false) => {
    if (!currentUser?.id) {
      if (isMountedRef.current) {
        setNotifications([]);
        setLoading(false);
      }
      return;
    }

    if (isFetchingRef.current) return;
    isFetchingRef.current = true;

    try {
      // Only show skeleton loader on initial fetch if we have 0 items
      if (isInitial && notificationsRef.current.length === 0 && isMountedRef.current) {
        setLoading(true);
      }

      // 5-second timeout protection so request never hangs indefinitely
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);

      const sysRes = await apiFetch('/api/v1/notifications', { signal: controller.signal }).catch(() => null);
      clearTimeout(timeoutId);

      if (sysRes && sysRes.ok) {
        const sysData = await sysRes.json();
        const list = Array.isArray(sysData) ? sysData : sysData.data || [];
        const realItems: NotificationItem[] = [];

        list.forEach((n: any) => {
          const rawType = (n.type || '').toLowerCase();
          let notifType: NotificationItem['type'] = 'info';

          if (rawType.includes('job') || rawType.includes('post') || rawType.includes('applicant')) {
            notifType = 'job';
          } else if (rawType.includes('support') || rawType.includes('ticket')) {
            notifType = 'support';
          } else if (rawType.includes('broadcast') || rawType.includes('announcement')) {
            notifType = 'announcement';
          }

          realItems.push({
            id: n.id,
            title: n.title,
            message: n.message,
            time: formatTimeAgo(n.created_at || n.createdAt),
            createdAt: n.created_at || n.createdAt,
            read: n.is_read !== undefined ? !!n.is_read : (n.read !== undefined ? !!n.read : false),
            link: n.link,
            type: notifType,
            rawType: n.type || '',
            entityType: n.entity_type || n.entityType || '',
            entityId: n.entity_id || n.entityId || ''
          });
        });

        realItems.sort((a, b) => {
          const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
          const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
          return dateB - dateA;
        });

        if (isMountedRef.current) {
          setNotifications(realItems);
        }
      }
    } catch (err) {
      console.error('Failed to load notifications from DB:', err);
    } finally {
      isFetchingRef.current = false;
      if (isMountedRef.current) {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    isMountedRef.current = true;

    // Failsafe timer: guarantee loading never exceeds 2.5s under any condition
    const failsafeTimer = setTimeout(() => {
      if (isMountedRef.current) {
        setLoading(false);
      }
    }, 2500);

    if (!currentUser?.id) {
      setNotifications([]);
      setLoading(false);
      return () => clearTimeout(failsafeTimer);
    }

    fetchRealNotifications(true);

    const handleUpdate = () => {
      if (document.visibilityState === 'visible') {
        fetchRealNotifications(false);
      }
    };

    window.addEventListener('focus', handleUpdate);
    window.addEventListener('notifications-updated', handleUpdate);

    return () => {
      clearTimeout(failsafeTimer);
      isMountedRef.current = false;
      window.removeEventListener('focus', handleUpdate);
      window.removeEventListener('notifications-updated', handleUpdate);
    };
  }, [currentUser?.id]);

  // Close three-dot menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent | TouchEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    if (menuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('touchstart', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [menuOpen]);

  const unreadCount = useMemo(() => notifications.filter(n => !n.read).length, [notifications]);

  // Filtered notifications by Read status and Capsule Category
  const displayedList = useMemo(() => {
    return notifications.filter((n) => {
      if (filter === 'UNREAD' && n.read) return false;
      if (selectedCategory !== 'ALL') {
        const cat = classifyNotification(n);
        if (cat !== selectedCategory) return false;
      }
      return true;
    });
  }, [notifications, filter, selectedCategory]);

  const handleNotificationClick = async (item: NotificationItem) => {
    setNotifications(prev =>
      prev.map(n => (n.id === item.id ? { ...n, read: true } : n))
    );

    apiFetch(`/api/v1/notifications/${item.id}/read`, { method: 'PATCH' }).catch(() => {});

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
    window.dispatchEvent(new CustomEvent('notifications-updated'));
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

  const renderCategoryIcon = (item: NotificationItem) => {
    const cat = classifyNotification(item);
    switch (cat) {
      case 'BANNERS':
        return (
          <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: '#fef3c7', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Megaphone size={18} color="#d97706" />
          </div>
        );
      case 'INTERVIEWS':
        return (
          <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: '#f3e8ff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <CalendarClock size={18} color="#7e22ce" />
          </div>
        );
      case 'APPLICATIONS':
        return (
          <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: '#dcfce7', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <UserCheck size={18} color="#15803d" />
          </div>
        );
      case 'JOB_POSTINGS':
        return (
          <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Briefcase size={18} color="#1b4fdf" />
          </div>
        );
      case 'PLATFORM':
        return (
          <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <ShieldCheck size={18} color="#475569" />
          </div>
        );
      default:
        return (
          <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Bell size={18} color="#1b4fdf" />
          </div>
        );
    }
  };

  const handleBack = () => {
    if (window.history.state && window.history.state.idx > 0) {
      navigate(-1);
    } else {
      navigate(isEmployer ? '/dashboard' : '/');
    }
  };

  return (
    <div className="notifications-page-container">
      <style>{`
        .notifications-page-container {
          min-height: 100vh;
          background-color: #f8fafc;
          box-sizing: border-box;
        }
        .notifications-card-box {
          background: #ffffff;
          overflow: hidden;
          display: flex;
          flex-direction: column;
          box-sizing: border-box;
        }
        .notifications-top-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          background: #ffffff;
          box-sizing: border-box;
        }
        .notifications-back-btn {
          background: transparent;
          border: none;
          color: #0f172a;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          width: 38px;
          height: 38px;
          border-radius: 8px;
          margin-right: 4px;
          margin-left: -4px;
          flex-shrink: 0;
          transition: background 0.15s ease;
        }
        .notifications-back-btn:hover {
          background-color: #f1f5f9;
        }
        .notifications-back-btn:active {
          background-color: #e2e8f0;
        }
        .notifications-action-btn {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 6px 12px;
          border-radius: 8px;
          font-size: 12.5px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.15s ease;
        }
        @media (max-width: 768px) {
          .notifications-page-container {
            padding: 0 !important;
            background-color: #ffffff !important;
          }
          .notifications-card-box {
            max-width: 100% !important;
            margin: 0 !important;
            border-radius: 0 !important;
            border: none !important;
            box-shadow: none !important;
            min-height: 100vh !important;
          }
          .notifications-top-header {
            position: sticky !important;
            top: 0 !important;
            z-index: 50 !important;
            padding: 10px 14px !important;
            background: #ffffff !important;
            border-bottom: 1px solid #e2e8f0 !important;
            box-shadow: 0 1px 3px rgba(15, 23, 42, 0.04) !important;
          }
          .notifications-action-text {
            display: none !important;
          }
          .notifications-action-btn {
            padding: 7px !important;
            width: 36px !important;
            height: 36px !important;
            justify-content: center !important;
          }
          .notifications-tab-strip {
            padding: 0 14px !important;
          }
          .notifications-capsules-strip {
            padding: 10px 14px !important;
          }
          .notifications-list-container {
            padding: 4px 12px 64px 12px !important;
          }
        }
        @media (min-width: 769px) {
          .notifications-page-container {
            padding: 28px 16px 48px 16px !important;
          }
          .notifications-card-box {
            max-width: 700px !important;
            margin: 0 auto !important;
            border-radius: 12px !important;
            border: 1px solid #e2e8f0 !important;
            box-shadow: 0 4px 20px -2px rgba(15, 23, 42, 0.06) !important;
          }
          .notifications-top-header {
            padding: 18px 24px !important;
            border-bottom: 1px solid #f1f5f9 !important;
          }
          .notifications-tab-strip {
            padding: 0 24px !important;
          }
          .notifications-capsules-strip {
            padding: 12px 24px !important;
          }
          .notifications-list-container {
            padding: 8px 18px 24px 18px !important;
          }
        }
        @keyframes notifPulse {
          0%, 100% { opacity: 0.95; }
          50% { opacity: 0.35; }
        }
        @keyframes fadeInMenu {
          from {
            opacity: 0;
            transform: translateY(-4px) scale(0.97);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
      `}</style>

      <div className="notifications-card-box">
        {/* Top Header Card */}
        <div className="notifications-top-header">
          <div style={{ display: 'flex', alignItems: 'center', minWidth: 0, flex: 1, gap: '4px' }}>
            <button
              type="button"
              onClick={handleBack}
              className="notifications-back-btn"
              title="Go Back"
              aria-label="Go Back"
            >
              <ArrowLeft size={22} color="#0f172a" strokeWidth={2.3} />
            </button>
            <h1 style={{ margin: 0, fontSize: '17px', fontWeight: '800', color: '#0f172a', letterSpacing: '-0.3px', whiteSpace: 'nowrap' }}>
              Notifications
            </h1>
            {unreadCount > 0 && (
              <span
                style={{
                  marginLeft: '6px',
                  background: '#eff6ff',
                  color: '#1b4fdf',
                  fontSize: '11px',
                  fontWeight: '700',
                  padding: '2px 8px',
                  borderRadius: '9999px',
                  whiteSpace: 'nowrap',
                }}
              >
                {unreadCount > 9 ? '9+' : unreadCount} new
              </span>
            )}
          </div>

          {/* Three-Dot Menu Options (Read all, Clear all) */}
          <div ref={menuRef} style={{ position: 'relative', flexShrink: 0 }}>
            <button
              type="button"
              onClick={() => setMenuOpen(prev => !prev)}
              title="More options"
              aria-label="More options"
              aria-expanded={menuOpen}
              style={{
                background: menuOpen ? '#f1f5f9' : 'transparent',
                border: 'none',
                color: '#334155',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '38px',
                height: '38px',
                borderRadius: '8px',
                transition: 'all 0.15s ease'
              }}
            >
              <MoreVertical size={20} strokeWidth={2.2} />
            </button>

            {menuOpen && (
              <div
                style={{
                  position: 'absolute',
                  top: 'calc(100% + 6px)',
                  right: 0,
                  width: '185px',
                  background: '#ffffff',
                  borderRadius: '10px',
                  boxShadow: '0 10px 25px -5px rgba(15, 23, 42, 0.15), 0 4px 10px -2px rgba(15, 23, 42, 0.08)',
                  border: '1px solid #e2e8f0',
                  padding: '6px',
                  zIndex: 100,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '2px',
                  animation: 'fadeInMenu 0.15s cubic-bezier(0.16, 1, 0.3, 1) forwards'
                }}
              >
                {/* Option 1: Read all */}
                <button
                  type="button"
                  disabled={unreadCount === 0}
                  onClick={() => {
                    setMenuOpen(false);
                    markAllAsRead();
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    width: '100%',
                    padding: '9px 12px',
                    border: 'none',
                    background: 'transparent',
                    borderRadius: '6px',
                    color: unreadCount > 0 ? '#0f172a' : '#94a3b8',
                    fontSize: '13px',
                    fontWeight: '600',
                    cursor: unreadCount > 0 ? 'pointer' : 'default',
                    textAlign: 'left',
                    transition: 'background 0.15s ease'
                  }}
                  onMouseEnter={(e) => {
                    if (unreadCount > 0) e.currentTarget.style.backgroundColor = '#f1f5f9';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }}
                >
                  <CheckCheck size={16} color={unreadCount > 0 ? '#1b4fdf' : '#94a3b8'} strokeWidth={2.2} />
                  <span>Read all</span>
                </button>

                {/* Divider */}
                <div style={{ height: '1px', background: '#f1f5f9', margin: '3px 0' }} />

                {/* Option 2: Clear all */}
                <button
                  type="button"
                  disabled={notifications.length === 0 || isClearing}
                  onClick={() => {
                    setMenuOpen(false);
                    setShowClearConfirm(true);
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    width: '100%',
                    padding: '9px 12px',
                    border: 'none',
                    background: 'transparent',
                    borderRadius: '6px',
                    color: notifications.length > 0 ? '#dc2626' : '#94a3b8',
                    fontSize: '13px',
                    fontWeight: '600',
                    cursor: notifications.length > 0 ? 'pointer' : 'default',
                    textAlign: 'left',
                    transition: 'background 0.15s ease'
                  }}
                  onMouseEnter={(e) => {
                    if (notifications.length > 0) e.currentTarget.style.backgroundColor = '#fef2f2';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }}
                >
                  <Trash2 size={16} color={notifications.length > 0 ? '#dc2626' : '#94a3b8'} strokeWidth={2} />
                  <span>Clear all</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Clear All Confirmation Banner */}
        {showClearConfirm && (
          <div
            style={{
              padding: '12px 24px',
              background: '#fef2f2',
              borderBottom: '1px solid #fee2e2',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '12px',
            }}
          >
            <div style={{ fontSize: '13px', color: '#991b1b', fontWeight: '500' }}>
              Are you sure you want to permanently delete all notifications? This action cannot be undone.
            </div>
            <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
              <button
                type="button"
                onClick={() => setShowClearConfirm(false)}
                disabled={isClearing}
                style={{
                  background: '#ffffff',
                  border: '1px solid #cbd5e1',
                  borderRadius: '6px',
                  padding: '5px 12px',
                  fontSize: '12px',
                  fontWeight: '600',
                  color: '#475569',
                  cursor: 'pointer',
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
                  borderRadius: '6px',
                  padding: '5px 12px',
                  fontSize: '12px',
                  fontWeight: '600',
                  color: '#ffffff',
                  cursor: 'pointer',
                }}
              >
                {isClearing ? 'Deleting...' : 'Clear All'}
              </button>
            </div>
          </div>
        )}

        {clearError && (
          <div style={{ padding: '10px 24px', background: '#fee2e2', color: '#b91c1c', fontSize: '13px', textAlign: 'center' }}>
            {clearError}
          </div>
        )}

        {/* Tab Bar: ALL vs UNREAD (Matching MobileApp Notification Screen) */}
        <div
          className="notifications-tab-strip"
          style={{
            display: 'flex',
            borderBottom: '1px solid #f1f5f9',
            background: '#ffffff',
            flexShrink: 0,
          }}
        >
          <button
            type="button"
            onClick={() => setFilter('ALL')}
            style={{
              flex: 1,
              padding: '13px 0',
              background: 'none',
              border: 'none',
              borderBottom: filter === 'ALL' ? '2.5px solid #1b4fdf' : '2.5px solid transparent',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              fontSize: '14px',
              fontWeight: filter === 'ALL' ? 700 : 600,
              color: filter === 'ALL' ? '#1b4fdf' : '#64748b',
              transition: 'all 0.15s ease',
            }}
          >
            <span>All</span>
            <span
              style={{
                fontSize: '11px',
                fontWeight: 700,
                padding: '1.5px 7px',
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
              padding: '13px 0',
              background: 'none',
              border: 'none',
              borderBottom: filter === 'UNREAD' ? '2.5px solid #1b4fdf' : '2.5px solid transparent',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              fontSize: '14px',
              fontWeight: filter === 'UNREAD' ? 700 : 600,
              color: filter === 'UNREAD' ? '#1b4fdf' : '#64748b',
              transition: 'all 0.15s ease',
            }}
          >
            <span>Unread</span>
            {unreadCount > 0 && (
              <span
                style={{
                  fontSize: '11px',
                  fontWeight: 700,
                  padding: '1.5px 7px',
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
          className="notifications-capsules-strip"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
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
                  padding: '6px 14px',
                  borderRadius: '9999px',
                  fontSize: '12.5px',
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

        {/* Notification Items List */}
        <div className="notifications-list-container" style={{ minHeight: '360px' }}>
          {loading && notifications.length === 0 ? (
            <div style={{ padding: '8px 12px' }}>
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '14px',
                    padding: '16px 12px',
                    borderBottom: '1px solid #f1f5f9',
                    animation: 'notifPulse 1.4s ease-in-out infinite'
                  }}
                >
                  <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: '#e2e8f0', flexShrink: 0 }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                      <div style={{ width: '40%', height: '14px', backgroundColor: '#e2e8f0', borderRadius: '4px' }} />
                      <div style={{ width: '15%', height: '12px', backgroundColor: '#f1f5f9', borderRadius: '4px' }} />
                    </div>
                    <div style={{ width: '80%', height: '12px', backgroundColor: '#f1f5f9', borderRadius: '4px', marginBottom: '6px' }} />
                    <div style={{ width: '55%', height: '12px', backgroundColor: '#f1f5f9', borderRadius: '4px' }} />
                  </div>
                </div>
              ))}
            </div>
          ) : !currentUser?.id ? (
            <div style={{ padding: '60px 20px', textAlign: 'center' }}>
              <div
                style={{
                  width: '56px',
                  height: '56px',
                  borderRadius: '50%',
                  background: '#eff6ff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 16px auto',
                  color: '#1b4fdf',
                }}
              >
                <Bell size={26} />
              </div>
              <h3 style={{ margin: '0 0 6px 0', fontSize: '16px', fontWeight: '700', color: '#0f172a' }}>
                Sign in to view notifications
              </h3>
              <p style={{ margin: '0 auto 18px', maxWidth: '340px', fontSize: '13px', color: '#64748b', lineHeight: '1.5' }}>
                Stay updated with interview schedules, job applications, and important announcements.
              </p>
              <button
                type="button"
                onClick={() => navigate('/login')}
                style={{
                  padding: '9px 22px',
                  backgroundColor: '#1b4fdf',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '13px',
                  fontWeight: '700',
                  cursor: 'pointer',
                  boxShadow: '0 2px 8px rgba(27, 79, 223, 0.25)'
                }}
              >
                Sign In
              </button>
            </div>
          ) : displayedList.length === 0 ? (
            <div style={{ padding: '60px 20px', textAlign: 'center', color: '#94a3b8' }}>
              <div
                style={{
                  width: '56px',
                  height: '56px',
                  borderRadius: '50%',
                  background: '#f1f5f9',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 14px auto',
                  color: '#94a3b8',
                }}
              >
                <Bell size={26} />
              </div>
              <h3 style={{ margin: '0 0 6px 0', fontSize: '15px', fontWeight: '700', color: '#0f172a' }}>
                {filter === 'UNREAD' ? 'No unread notifications' : 'No notifications in this category'}
              </h3>
              <p style={{ margin: 0, fontSize: '13px', color: '#64748b' }}>
                {filter === 'UNREAD'
                  ? "You're all caught up! There are no unread notifications at this time."
                  : 'New activity, alerts, and applications will appear here.'}
              </p>
            </div>
          ) : (
            displayedList.map((item) => (
              <div
                key={item.id}
                onClick={() => handleNotificationClick(item)}
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '14px',
                  padding: '14px 12px',
                  borderRadius: '10px',
                  background: item.read ? '#ffffff' : '#f8faff',
                  borderLeft: item.read ? '3px solid transparent' : '3px solid #1b4fdf',
                  borderBottom: '1px solid #f1f5f9',
                  cursor: 'pointer',
                  position: 'relative',
                  transition: 'background 0.15s ease',
                }}
              >
                {/* Category Icon */}
                {renderCategoryIcon(item)}

                {/* Content Box */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span
                        style={{
                          fontSize: '13.5px',
                          fontWeight: item.read ? '600' : '700',
                          color: item.read ? '#334155' : '#0f172a',
                        }}
                      >
                        {item.title}
                      </span>
                      {!item.read && (
                        <span
                          style={{
                            width: '7px',
                            height: '7px',
                            borderRadius: '50%',
                            backgroundColor: '#1b4fdf',
                            display: 'inline-block',
                          }}
                        />
                      )}
                    </div>
                    <span style={{ fontSize: '11px', color: '#94a3b8', whiteSpace: 'nowrap', fontWeight: '500' }}>
                      {item.time}
                    </span>
                  </div>

                  <p
                    style={{
                      margin: '4px 0 0 0',
                      fontSize: '13px',
                      color: item.read ? '#64748b' : '#334155',
                      lineHeight: '1.45',
                    }}
                  >
                    {item.message}
                  </p>
                </div>

                {/* Delete Item Button */}
                <button
                  type="button"
                  onClick={(e) => deleteNotification(e, item.id)}
                  title="Remove notification"
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#cbd5e1',
                    cursor: 'pointer',
                    padding: '6px',
                    width: '32px',
                    height: '32px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: '6px',
                    transition: 'all 0.15s ease',
                    flexShrink: 0
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = '#ef4444';
                    e.currentTarget.style.backgroundColor = '#fee2e2';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = '#cbd5e1';
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }}
                >
                  <Trash2 size={15} />
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
