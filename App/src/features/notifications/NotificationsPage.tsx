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
  X
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

  const isMountedRef = useRef(true);

  const isEmployer = currentUser?.role?.toLowerCase() === 'employer';
  const categoryFilterOptions = isEmployer ? EMPLOYER_CATEGORY_FILTERS : CANDIDATE_CATEGORY_FILTERS;

  const fetchRealNotifications = async (isInitial = false) => {
    if (!currentUser) {
      if (isMountedRef.current) {
        setNotifications([]);
        setLoading(false);
      }
      return;
    }

    try {
      if (isInitial && isMountedRef.current) {
        setLoading(true);
      }

      const sysRes = await apiFetch('/api/v1/notifications').catch(() => null);

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
      if (isMountedRef.current) {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    isMountedRef.current = true;
    fetchRealNotifications(true);

    const handleFocus = () => fetchRealNotifications(false);
    window.addEventListener('focus', handleFocus);
    window.addEventListener('notifications-updated', handleFocus);

    return () => {
      isMountedRef.current = false;
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('notifications-updated', handleFocus);
    };
  }, [currentUser]);

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

  return (
    <div style={{ minHeight: '80vh', backgroundColor: '#f8fafc', padding: '24px 16px' }}>
      <div
        style={{
          maxWidth: '680px',
          margin: '0 auto',
          background: '#ffffff',
          borderRadius: '16px',
          border: '1px solid #e2e8f0',
          boxShadow: '0 4px 20px -2px rgba(15, 23, 42, 0.06)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        {/* Top Header Card */}
        <div
          style={{
            padding: '20px 24px',
            borderBottom: '1px solid #f1f5f9',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: '#ffffff',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <button
              type="button"
              onClick={() => navigate(-1)}
              style={{
                background: 'none',
                border: 'none',
                color: '#64748b',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                padding: '4px',
                borderRadius: '8px',
                transition: 'background 0.15s ease'
              }}
              title="Go Back"
            >
              <ArrowLeft size={20} />
            </button>
            <h1 style={{ margin: 0, fontSize: '18px', fontWeight: '700', color: '#0f172a' }}>
              Notifications
            </h1>
            {unreadCount > 0 && (
              <span
                style={{
                  background: '#eff6ff',
                  color: '#1b4fdf',
                  fontSize: '11px',
                  fontWeight: '700',
                  padding: '2px 8px',
                  borderRadius: '9999px',
                }}
              >
                {unreadCount > 9 ? '9+' : unreadCount} new
              </span>
            )}
          </div>

          {/* Quick Header Actions */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            {/* Mark All As Read */}
            <button
              type="button"
              onClick={markAllAsRead}
              title="Mark all as read"
              disabled={unreadCount === 0}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 12px',
                borderRadius: '8px',
                border: '1px solid #e2e8f0',
                background: unreadCount > 0 ? '#ffffff' : '#f8fafc',
                color: unreadCount > 0 ? '#1b4fdf' : '#94a3b8',
                fontSize: '12px',
                fontWeight: '600',
                cursor: unreadCount > 0 ? 'pointer' : 'default',
                transition: 'all 0.15s ease'
              }}
            >
              <CheckCheck size={15} />
              <span>Mark all read</span>
            </button>

            {/* Clear All */}
            {notifications.length > 0 && (
              <button
                type="button"
                onClick={() => setShowClearConfirm(true)}
                disabled={isClearing}
                title="Clear all notifications permanently"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '6px 12px',
                  borderRadius: '8px',
                  border: '1px solid #fee2e2',
                  background: '#fef2f2',
                  color: '#dc2626',
                  fontSize: '12px',
                  fontWeight: '600',
                  cursor: isClearing ? 'wait' : 'pointer',
                  opacity: isClearing ? 0.6 : 1,
                  transition: 'all 0.15s ease'
                }}
              >
                <Trash2 size={15} />
                <span>{isClearing ? 'Clearing...' : 'Clear all'}</span>
              </button>
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
          style={{
            display: 'flex',
            borderBottom: '1px solid #f1f5f9',
            padding: '0 24px',
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
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '12px 24px',
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
        <div style={{ padding: '8px 16px', minHeight: '360px' }}>
          {loading && notifications.length === 0 ? (
            <div style={{ padding: '40px 0', textAlign: 'center', color: '#94a3b8', fontSize: '13px' }}>
              <div
                style={{
                  width: '32px',
                  height: '32px',
                  border: '3px solid #e2e8f0',
                  borderTopColor: '#1b4fdf',
                  borderRadius: '50%',
                  margin: '0 auto 12px auto',
                  animation: 'spin 1s linear infinite'
                }}
              />
              Loading notifications...
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
                    padding: '4px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: '6px',
                    transition: 'all 0.15s ease',
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
