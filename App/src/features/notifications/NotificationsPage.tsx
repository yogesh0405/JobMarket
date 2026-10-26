import React, { useState, useEffect, useRef, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { apiFetch } from '../../utils/api';
import { resolveWebNotificationRoute } from '../../utils/notificationRouter';
import {
  Bell,
  CheckCheck,
  CheckCircle2,
  Trash2,
  Briefcase,
  UserCheck,
  UserPlus,
  CalendarClock,
  Megaphone,
  ShieldCheck,
  FileText,
  BadgeCheck,
  XCircle,
  Headphones,
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

  useEffect(() => {
    if (showClearConfirm) {
      const prevOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = prevOverflow;
      };
    }
  }, [showClearConfirm]);

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

  // Enterprise-Grade Industry Icons and Semantic Badge Styling (100% matched with MobileApp)
  const renderNotifVisualMeta = (type?: string, title?: string, message?: string) => {
    const combined = `${type || ''} ${title || ''} ${message || ''}`.toUpperCase();

    // 1. Interviews & Scheduled Walk-Ins
    if (combined.includes('INTERVIEW') || combined.includes('SCHEDULED') || combined.includes('WALK-IN')) {
      return {
        icon: <CalendarClock size={19} color="#D97706" strokeWidth={2.0} />,
        bgColor: '#FEF3C7',
        borderColor: '#FDE68A',
      };
    }

    // 2. Selection, Shortlist, Hired, Offer
    if (combined.includes('HIRED') || combined.includes('ACCEPTED') || combined.includes('SHORTLIST') || combined.includes('APPROVED')) {
      return {
        icon: <BadgeCheck size={19} color="#059669" strokeWidth={2.0} />,
        bgColor: '#ECFDF5',
        borderColor: '#A7F3D0',
      };
    }

    // 3. New Candidate Application (Employer received applicant)
    if (combined.includes('APPLICANT') || combined.includes('APPLIED') || combined.includes('JOB_APPLICATION')) {
      return {
        icon: <UserPlus size={19} color="#2563EB" strokeWidth={2.0} />,
        bgColor: '#EFF6FF',
        borderColor: '#BFDBFE',
      };
    }

    // 4. Application Status Confirmation (Candidate sent application)
    if (combined.includes('APPLICATION') || combined.includes('APPLY')) {
      return {
        icon: <UserCheck size={19} color="#2563EB" strokeWidth={2.0} />,
        bgColor: '#EFF6FF',
        borderColor: '#BFDBFE',
      };
    }

    // 5. Job Posting, Vacancy, Role Management
    if (combined.includes('JOB') || combined.includes('VACANCY') || combined.includes('POSTED')) {
      return {
        icon: <Briefcase size={19} color="#0A58E2" strokeWidth={2.0} />,
        bgColor: '#EFF6FF',
        borderColor: '#BFDBFE',
      };
    }

    // 6. Promotional Banners & Ad Campaigns
    if (combined.includes('BANNER') || combined.includes('PROMOT') || combined.includes('ADVERTI') || combined.includes('CAMPAIGN')) {
      return {
        icon: <Megaphone size={19} color="#7C3AED" strokeWidth={2.0} />,
        bgColor: '#F5F3FF',
        borderColor: '#DDD6FE',
      };
    }

    // 7. Security, Identity, Aadhaar, KYC
    if (combined.includes('VERIF') || combined.includes('SECURITY') || combined.includes('SHIELD') || combined.includes('AADHAAR')) {
      return {
        icon: <ShieldCheck size={19} color="#0284C7" strokeWidth={2.0} />,
        bgColor: '#F0F9FF',
        borderColor: '#BAE6FD',
      };
    }

    // 8. Resume, Bio-Data, Documents
    if (combined.includes('RESUME') || combined.includes('DOC') || combined.includes('BIO-DATA')) {
      return {
        icon: <FileText size={19} color="#6366F1" strokeWidth={2.0} />,
        bgColor: '#EEF2FF',
        borderColor: '#C7D2FE',
      };
    }

    // 9. Rejections, Cancellations, Closed Vacancies
    if (combined.includes('REJECT') || combined.includes('CANCEL') || combined.includes('DECLIN') || combined.includes('EXPIRE')) {
      return {
        icon: <XCircle size={19} color="#DC2626" strokeWidth={2.0} />,
        bgColor: '#FEF2F2',
        borderColor: '#FECACA',
      };
    }

    // 10. Help, Support, Helpdesk
    if (combined.includes('SUPPORT') || combined.includes('TICKET') || combined.includes('HELP')) {
      return {
        icon: <Headphones size={19} color="#475569" strokeWidth={2.0} />,
        bgColor: '#F1F5F9',
        borderColor: '#E2E8F0',
      };
    }

    // 11. Default System Alert
    return {
      icon: <Bell size={19} color="#2563EB" strokeWidth={2.0} />,
      bgColor: '#EFF6FF',
      borderColor: '#BFDBFE',
    };
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
        }
        @media (min-width: 769px) {
          .notifications-page-container {
            padding: 24px 16px 48px 16px !important;
          }
          .notifications-card-box {
            max-width: 680px !important;
            margin: 0 auto !important;
            border-radius: 10px !important;
            border: 1px solid #e2e8f0 !important;
            box-shadow: 0 4px 16px -2px rgba(15, 23, 42, 0.05) !important;
          }
        }

        /* Top Sticky Controls Wrap: Tab Bar & Capsule Filters with Crisp White Elevation */
        .notifications-header-controls-wrap {
          background-color: #ffffff;
          border-bottom: 1px solid #e2e8f0;
          box-shadow: 0 2px 3px rgba(15, 23, 42, 0.04);
          position: sticky;
          top: 0;
          z-index: 20;
        }

        /* Standard Underline Tabular Menu (Full Width Equal Tabs with Three-Dot Icon) */
        .notifications-tabular-menu-row {
          display: flex;
          align-items: center;
          background-color: #ffffff;
          border-bottom: 1px solid #f1f5f9;
          padding-left: 4px;
          padding-right: 8px;
        }
        .notifications-tabs-container {
          display: flex;
          align-items: center;
          flex: 1;
        }
        .notifications-tabular-tab-item {
          flex: 1;
          padding: 13px 0;
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          background: transparent;
          border: none;
          cursor: pointer;
        }
        .notifications-tab-text-with-badge {
          display: flex;
          align-items: center;
          gap: 6px;
        }
        .notifications-tabular-tab-text {
          font-size: 13px;
          font-weight: 600;
          color: #64748b;
          transition: color 0.15s ease;
        }
        .notifications-tabular-tab-text.active {
          color: #1b4fdf;
          font-weight: 700;
        }
        .notifications-tab-count-badge {
          background-color: #f1f5f9;
          padding: 1.5px 7px;
          border-radius: 10px;
          font-size: 10.5px;
          font-weight: 700;
          color: #64748b;
        }
        .notifications-tab-count-badge.active {
          background-color: #eff6ff;
          color: #1b4fdf;
        }
        .notifications-tab-count-unread-badge.active {
          background-color: #fef2f2;
          color: #1b4fdf;
        }
        .notifications-tabular-active-indicator {
          position: absolute;
          bottom: -1px;
          left: 8px;
          right: 8px;
          height: 2.5px;
          background-color: #1b4fdf;
          border-radius: 2px;
        }
        .notifications-tab-more-options-btn {
          padding: 8px;
          border-radius: 6px;
          display: flex;
          justify-content: center;
          align-items: center;
          margin-left: 4px;
          background: transparent;
          border: none;
          cursor: pointer;
          transition: background 0.15s ease;
        }
        .notifications-tab-more-options-btn:hover {
          background-color: #f1f5f9;
        }

        /* Three-Dot Dropdown Menu Card */
        .notifications-dropdown-menu-card {
          position: absolute;
          right: 0;
          top: calc(100% + 4px);
          background-color: #ffffff;
          border-radius: 8px;
          border: 1px solid #e2e8f0;
          min-width: 175px;
          padding: 4px 0;
          box-shadow: 0 4px 14px rgba(15, 23, 42, 0.12);
          z-index: 100;
          animation: fadeInMenu 0.15s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        .notifications-dropdown-menu-item {
          display: flex;
          align-items: center;
          width: 100%;
          padding: 11px 14px;
          background: transparent;
          border: none;
          cursor: pointer;
          text-align: left;
          transition: background 0.15s ease;
        }
        .notifications-dropdown-menu-item:hover:not(:disabled) {
          background-color: #f8fafc;
        }
        .notifications-dropdown-menu-item:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
        .notifications-dropdown-menu-item-text {
          font-size: 13px;
          font-weight: 600;
          color: #1e293b;
        }
        .notifications-dropdown-divider {
          height: 1px;
          background-color: #f1f5f9;
        }

        /* LinkedIn-Style Horizontal Capsule Filter Pills */
        .notifications-capsule-filters-wrapper {
          background-color: #ffffff;
          padding: 8px 0;
          overflow-x: auto;
          scrollbar-width: none;
        }
        .notifications-capsule-filters-wrapper::-webkit-scrollbar {
          display: none;
        }
        .notifications-capsule-scroll-content {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 0 16px;
          min-width: max-content;
        }
        .notifications-capsule-pill {
          padding: 5.5px 12px;
          border-radius: 16px;
          background-color: #f8fafc;
          border: 1px solid #e2e8f0;
          font-size: 12px;
          font-weight: 600;
          color: #475569;
          cursor: pointer;
          white-space: nowrap;
          transition: all 0.15s ease;
        }
        .notifications-capsule-pill:hover:not(.active) {
          background-color: #f1f5f9;
          border-color: #cbd5e1;
        }
        .notifications-capsule-pill.active {
          background-color: #1b4fdf;
          border-color: #1b4fdf;
          color: #ffffff;
        }

        /* LinkedIn-Style Notification List */
        .notifications-scroll-list {
          flex: 1;
          background-color: #ffffff;
        }
        .notifications-row-item {
          display: flex;
          align-items: flex-start;
          background-color: #ffffff;
          padding: 13px 16px;
          border-bottom: 1px solid #f1f5f9;
          gap: 12px;
          cursor: pointer;
          transition: background-color 0.15s ease;
          text-align: left;
          width: 100%;
          box-sizing: border-box;
        }
        .notifications-row-item:hover {
          background-color: #f8fafc;
        }
        .notifications-row-item.unread {
          background-color: #f0f7ff;
        }
        .notifications-row-item.unread:hover {
          background-color: #e6f0fd;
        }
        .notifications-avatar-circle {
          width: 40px;
          height: 40px;
          border-radius: 20px;
          border: 1px solid #e2e8f0;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-top: 1px;
          flex-shrink: 0;
        }
        .notifications-row-content-wrap {
          flex: 1;
          min-width: 0;
          padding-right: 4px;
        }
        .notifications-row-title-text {
          font-size: 12.5px;
          font-weight: 500;
          color: #334155;
          margin-bottom: 2px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .notifications-row-title-text.unread {
          font-weight: 700;
          color: #0f172a;
        }
        .notifications-row-message-text {
          font-size: 11.5px;
          color: #475569;
          line-height: 16px;
          margin-bottom: 4px;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
          word-break: break-word;
        }
        .notifications-row-time-text {
          font-size: 10.5px;
          color: #94a3b8;
          font-weight: 500;
        }
        .notifications-right-action-column {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: space-between;
          padding-top: 3px;
          gap: 12px;
          flex-shrink: 0;
        }
        .notifications-unread-indicator-dot {
          width: 8px;
          height: 8px;
          border-radius: 4px;
          background-color: #1b4fdf;
        }
        .notifications-delete-row-btn {
          padding: 3px;
          background: transparent;
          border: none;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 4px;
          color: #94a3b8;
          transition: color 0.15s ease, background-color 0.15s ease;
        }
        .notifications-delete-row-btn:hover {
          color: #dc2626;
          background-color: #fee2e2;
        }

        /* Skeleton Loading Row */
        .notifications-skeleton-row {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 14px 16px;
          border-bottom: 1px solid #f1f5f9;
        }

        /* Empty State */
        .notifications-empty-container {
          margin-top: 60px;
          padding: 0 32px 60px 32px;
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
        }
        .notifications-empty-icon-circle {
          width: 54px;
          height: 54px;
          border-radius: 27px;
          background-color: #dcfce7;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 12px;
        }
        .notifications-empty-title {
          font-size: 14.5px;
          font-weight: 700;
          color: #0f172a;
          margin-bottom: 4px;
        }
        .notifications-empty-desc {
          font-size: 12px;
          color: #64748b;
          text-align: center;
          line-height: 17px;
          max-width: 320px;
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

      {/* Clear All Confirmation Modal - Centered via createPortal */}
      {showClearConfirm && typeof document !== 'undefined' && createPortal(
        <div
          onClick={() => !isClearing && setShowClearConfirm(false)}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            width: '100vw',
            height: '100vh',
            minHeight: '100dvh',
            backgroundColor: 'rgba(15, 23, 42, 0.6)',
            backdropFilter: 'blur(4px)',
            WebkitBackdropFilter: 'blur(4px)',
            zIndex: 999999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '16px',
            boxSizing: 'border-box',
            overflowY: 'auto',
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: '#FFFFFF',
              borderRadius: '12px',
              border: '1px solid #E2E8F0',
              boxShadow: '0 25px 50px -12px rgba(15, 23, 42, 0.35)',
              maxWidth: '380px',
              width: '100%',
              padding: '24px 20px',
              textAlign: 'center',
              position: 'relative',
              margin: 'auto',
              boxSizing: 'border-box',
            }}
          >
            {/* Close Button */}
            <button
              type="button"
              onClick={() => !isClearing && setShowClearConfirm(false)}
              disabled={isClearing}
              style={{
                position: 'absolute',
                top: '12px',
                right: '12px',
                background: 'transparent',
                border: 'none',
                color: '#94A3B8',
                cursor: 'pointer',
                padding: '4px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: '6px',
              }}
              aria-label="Close"
            >
              <X size={18} />
            </button>

            {/* Warning/Trash Icon Badge */}
            <div
              style={{
                width: '48px',
                height: '48px',
                borderRadius: '24px',
                backgroundColor: '#FEF2F2',
                border: '1px solid #FEE2E2',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 14px auto',
              }}
            >
              <Trash2 size={22} color="#DC2626" strokeWidth={2.2} />
            </div>

            {/* Title */}
            <h3
              style={{
                margin: '0 0 8px 0',
                fontSize: '17px',
                fontWeight: 800,
                color: '#0F172A',
                letterSpacing: '-0.2px',
              }}
            >
              Clear All Notifications
            </h3>

            {/* Message */}
            <p
              style={{
                margin: '0 0 20px 0',
                fontSize: '13.5px',
                color: '#64748B',
                lineHeight: '20px',
              }}
            >
              Are you sure you want to permanently delete all notifications? This action cannot be undone.
            </p>

            {/* Buttons */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                width: '100%',
              }}
            >
              <button
                type="button"
                onClick={() => setShowClearConfirm(false)}
                disabled={isClearing}
                style={{
                  flex: 1,
                  height: '42px',
                  background: '#FFFFFF',
                  border: '1.5px solid #CBD5E1',
                  borderRadius: '8px',
                  fontSize: '13.5px',
                  fontWeight: 700,
                  color: '#475569',
                  cursor: isClearing ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={clearAllNotifications}
                disabled={isClearing}
                style={{
                  flex: 1,
                  height: '42px',
                  background: '#DC2626',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '13.5px',
                  fontWeight: 700,
                  color: '#FFFFFF',
                  cursor: isClearing ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 2px 6px rgba(220, 38, 38, 0.25)',
                }}
              >
                {isClearing ? 'Deleting...' : 'Clear All'}
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      <div className="notifications-card-box">
        {/* Top Sticky Controls Wrap: Tab Bar & Capsule Filters with Crisp White Elevation */}
        <div className="notifications-header-controls-wrap">
          {/* Standard Underline Tabular Menu (Full Width Equal Tabs with Three-Dot Icon) */}
          <div className="notifications-tabular-menu-row">
            <div className="notifications-tabs-container">
              {/* Tab: ALL */}
              <button
                type="button"
                className="notifications-tabular-tab-item"
                onClick={() => setFilter('ALL')}
              >
                <div className="notifications-tab-text-with-badge">
                  <span className={`notifications-tabular-tab-text ${filter === 'ALL' ? 'active' : ''}`}>
                    All
                  </span>
                  {notifications.length > 0 && (
                    <span className={`notifications-tab-count-badge ${filter === 'ALL' ? 'active' : ''}`}>
                      {notifications.length}
                    </span>
                  )}
                </div>
                {filter === 'ALL' && <div className="notifications-tabular-active-indicator" />}
              </button>

              {/* Tab: UNREAD */}
              <button
                type="button"
                className="notifications-tabular-tab-item"
                onClick={() => setFilter('UNREAD')}
              >
                <div className="notifications-tab-text-with-badge">
                  <span className={`notifications-tabular-tab-text ${filter === 'UNREAD' ? 'active' : ''}`}>
                    Unread
                  </span>
                  {unreadCount > 0 && (
                    <span className={`notifications-tab-count-badge notifications-tab-count-unread-badge ${filter === 'UNREAD' ? 'active' : ''}`}>
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </div>
                {filter === 'UNREAD' && <div className="notifications-tabular-active-indicator" />}
              </button>
            </div>

            {/* Three-Dot Menu Action at End of Tab Menu */}
            <div ref={menuRef} style={{ position: 'relative' }}>
              <button
                type="button"
                className="notifications-tab-more-options-btn"
                onClick={() => setMenuOpen((prev) => !prev)}
                title="More options"
                aria-label="More options"
                aria-expanded={menuOpen}
              >
                <MoreVertical size={20} color="#64748B" strokeWidth={2.2} />
              </button>

              {/* Dropdown Menu Card */}
              {menuOpen && (
                <div className="notifications-dropdown-menu-card">
                  {/* Option 1: Mark all as read */}
                  <button
                    type="button"
                    className="notifications-dropdown-menu-item"
                    disabled={unreadCount === 0}
                    onClick={() => {
                      setMenuOpen(false);
                      markAllAsRead();
                    }}
                  >
                    <CheckCheck size={16} color="#1B4FDF" style={{ marginRight: 10, flexShrink: 0 }} />
                    <span className="notifications-dropdown-menu-item-text">Mark all as read</span>
                  </button>

                  <div className="notifications-dropdown-divider" />

                  {/* Option 2: Clear all */}
                  <button
                    type="button"
                    className="notifications-dropdown-menu-item"
                    disabled={notifications.length === 0}
                    onClick={() => {
                      setMenuOpen(false);
                      setShowClearConfirm(true);
                    }}
                  >
                    <Trash2 size={16} color="#DC2626" style={{ marginRight: 10, flexShrink: 0 }} />
                    <span className="notifications-dropdown-menu-item-text" style={{ color: '#DC2626' }}>Clear all</span>
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* LinkedIn-Style Horizontal Capsule Filter Pills */}
          <div className="notifications-capsule-filters-wrapper">
            <div className="notifications-capsule-scroll-content">
              {categoryFilterOptions.map((cat) => {
                const isActive = selectedCategory === cat.key;
                return (
                  <button
                    key={cat.key}
                    type="button"
                    className={`notifications-capsule-pill ${isActive ? 'active' : ''}`}
                    onClick={() => setSelectedCategory(cat.key)}
                  >
                    {cat.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* LinkedIn-Style Notification List */}
        <div className="notifications-scroll-list">
          {loading ? (
            <div style={{ padding: '8px 16px', marginTop: '8px' }}>
              {[1, 2, 3, 4, 5, 6].map((key) => (
                <div key={key} className="notifications-skeleton-row">
                  <div style={{ width: '40px', height: '40px', borderRadius: '20px', backgroundColor: '#e2e8f0', flexShrink: 0, animation: 'notifPulse 1.4s ease-in-out infinite' }} />
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <div style={{ width: '65%', height: '14px', borderRadius: '4px', backgroundColor: '#e2e8f0', animation: 'notifPulse 1.4s ease-in-out infinite' }} />
                    <div style={{ width: '90%', height: '12px', borderRadius: '4px', backgroundColor: '#f1f5f9', animation: 'notifPulse 1.4s ease-in-out infinite' }} />
                    <div style={{ width: '30%', height: '10px', borderRadius: '4px', backgroundColor: '#f1f5f9', animation: 'notifPulse 1.4s ease-in-out infinite' }} />
                  </div>
                </div>
              ))}
            </div>
          ) : !currentUser?.id ? (
            <div className="notifications-empty-container">
              <div className="notifications-empty-icon-circle" style={{ backgroundColor: '#EFF6FF' }}>
                <Bell size={26} color="#1B4FDF" />
              </div>
              <div className="notifications-empty-title">Sign in to view notifications</div>
              <div className="notifications-empty-desc">
                Stay updated with interview schedules, job applications, and important announcements.
              </div>
              <button
                type="button"
                onClick={() => navigate('/login')}
                style={{
                  marginTop: '16px',
                  padding: '9px 24px',
                  backgroundColor: '#1B4FDF',
                  color: '#FFFFFF',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '13px',
                  fontWeight: '700',
                  cursor: 'pointer',
                  boxShadow: '0 2px 8px rgba(27, 79, 223, 0.25)',
                }}
              >
                Sign In
              </button>
            </div>
          ) : displayedList.length === 0 ? (
            filter === 'UNREAD' ? (
              <div className="notifications-empty-container">
                <div className="notifications-empty-icon-circle">
                  <CheckCircle2 size={32} color="#16A34A" />
                </div>
                <div className="notifications-empty-title">You're All Caught Up!</div>
                <div className="notifications-empty-desc">
                  No unread notifications in this category.
                </div>
              </div>
            ) : selectedCategory === 'JOB_POSTINGS' ? (
              <div className="notifications-empty-container">
                <div className="notifications-empty-icon-circle" style={{ backgroundColor: '#EFF6FF' }}>
                  <Briefcase size={26} color="#1B4FDF" />
                </div>
                <div className="notifications-empty-title">No Job Posting Notifications</div>
                <div className="notifications-empty-desc">
                  Updates regarding job post approvals, status changes, and vacancy expiries will appear here.
                </div>
              </div>
            ) : selectedCategory === 'APPLICATIONS' ? (
              <div className="notifications-empty-container">
                <div className="notifications-empty-icon-circle" style={{ backgroundColor: '#EFF6FF' }}>
                  <UserPlus size={26} color="#1B4FDF" />
                </div>
                <div className="notifications-empty-title">No Application Notifications</div>
                <div className="notifications-empty-desc">
                  {isEmployer
                    ? 'Candidate job applications and applicant profile alerts will be shown here.'
                    : 'Updates on your job application statuses, shortlists, and hiring decisions will appear here.'}
                </div>
              </div>
            ) : selectedCategory === 'INTERVIEWS' ? (
              <div className="notifications-empty-container">
                <div className="notifications-empty-icon-circle" style={{ backgroundColor: '#FEF3C7' }}>
                  <CalendarClock size={26} color="#D97706" />
                </div>
                <div className="notifications-empty-title">No Interview Notifications</div>
                <div className="notifications-empty-desc">
                  Scheduled interview invitations, timings, and walk-in venue updates will be listed here.
                </div>
              </div>
            ) : selectedCategory === 'BANNERS' ? (
              <div className="notifications-empty-container">
                <div className="notifications-empty-icon-circle" style={{ backgroundColor: '#F5F3FF' }}>
                  <Megaphone size={26} color="#7C3AED" />
                </div>
                <div className="notifications-empty-title">No Banner Notifications</div>
                <div className="notifications-empty-desc">
                  Status updates on your advertisement campaigns and promotional banner approvals will be shown here.
                </div>
              </div>
            ) : selectedCategory === 'PLATFORM' ? (
              <div className="notifications-empty-container">
                <div className="notifications-empty-icon-circle" style={{ backgroundColor: '#F1F5F9' }}>
                  <Headphones size={26} color="#475569" />
                </div>
                <div className="notifications-empty-title">No Platform Notifications</div>
                <div className="notifications-empty-desc">
                  Support ticket responses, team announcements, and account verification updates will appear here.
                </div>
              </div>
            ) : (
              <div className="notifications-empty-container">
                <div className="notifications-empty-icon-circle">
                  <CheckCircle2 size={32} color="#16A34A" />
                </div>
                <div className="notifications-empty-title">You're All Caught Up!</div>
                <div className="notifications-empty-desc">
                  No notifications found for the selected filter.
                </div>
              </div>
            )
          ) : (
            displayedList.map((item) => {
              const isRead = item.read;
              const visual = renderNotifVisualMeta(item.rawType || item.type, item.title, item.message);

              return (
                <div
                  key={item.id}
                  className={`notifications-row-item ${!isRead ? 'unread' : ''}`}
                  onClick={() => handleNotificationClick(item)}
                >
                  {/* Left Circular Avatar with Semantic Theme */}
                  <div
                    className="notifications-avatar-circle"
                    style={{ backgroundColor: visual.bgColor, borderColor: visual.borderColor }}
                  >
                    {visual.icon}
                  </div>

                  {/* Middle Content Area */}
                  <div className="notifications-row-content-wrap">
                    <div className={`notifications-row-title-text ${!isRead ? 'unread' : ''}`}>
                      {item.title}
                    </div>
                    <div className="notifications-row-message-text">
                      {item.message}
                    </div>
                    <div className="notifications-row-time-text">
                      {item.time}
                    </div>
                  </div>

                  {/* Right Actions / Unread Dot */}
                  <div className="notifications-right-action-column">
                    {!isRead && <div className="notifications-unread-indicator-dot" />}
                    <button
                      type="button"
                      className="notifications-delete-row-btn"
                      onClick={(e) => deleteNotification(e, item.id)}
                      title="Remove notification"
                      aria-label="Remove notification"
                    >
                      <Trash2 size={13} color="#94A3B8" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
