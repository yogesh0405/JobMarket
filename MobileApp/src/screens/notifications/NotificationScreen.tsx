import React, { useState, useCallback, useMemo } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  RefreshControl,
  Modal,
  TouchableWithoutFeedback,
  StatusBar,
  Platform,
} from 'react-native';
import {
  BellRing,
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
  MoreVertical,
} from 'lucide-react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Skeleton as SkeletonLoader } from '../../components/common/SkeletonLoader';
import { useNotifications, isNotificationRead } from '../../hooks/useNotifications';
import { AppNotification } from '../../api/notificationApi';
import { resolveMobileNotificationRoute } from '../../utils/notificationRouter';
import { useAuth } from '../../hooks/useAuth';
import { COLORS } from '../../constants/theme';

import { FocusAwareStatusBar } from '../../components/common/FocusAwareStatusBar';

interface Props {
  navigation: any;
}

type NotificationCategory = 'JOB_POSTINGS' | 'APPLICATIONS' | 'INTERVIEWS' | 'BANNERS' | 'PLATFORM' | 'OTHER';

const EMPLOYER_CATEGORY_FILTERS = [
  { key: 'ALL', label: 'All' },
  { key: 'JOB_POSTINGS', label: 'Job Postings' },
  { key: 'APPLICATIONS', label: 'Applications' },
  { key: 'BANNERS', label: 'Banners' },
  { key: 'PLATFORM', label: 'Platform' },
];

const CANDIDATE_CATEGORY_FILTERS = [
  { key: 'ALL', label: 'All' },
  { key: 'APPLICATIONS', label: 'Applications' },
  { key: 'INTERVIEWS', label: 'Interviews' },
  { key: 'PLATFORM', label: 'Platform' },
];

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

// 100% Mutually Exclusive, Domain-Accurate Notification Classifier
const classifyNotification = (n: AppNotification): NotificationCategory => {
  const type = (n.type || '').toUpperCase().trim();
  const entityType = ((n as any).entity_type || (n as any).entityType || '').toUpperCase().trim();
  const title = (n.title || '').toUpperCase().trim();
  const msg = (n.message || '').toUpperCase().trim();
  const link = ((n as any).link || '').toUpperCase().trim();

  // 1. BANNER / ADVERTISEMENTS (Highest specificity)
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

  // 2. INTERVIEWS & SCHEDULED CALLS (Highest specificity)
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
  // (New candidate applied to job, candidate confirmation, shortlist/hired/rejected candidate)
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

  // 4. JOB POSTINGS & VACANCY MANAGEMENT (Job approval, submission, live status, vacancy edit, expiry)
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

  // 5. PLATFORM & ADMIN NOTIFICATIONS (Support tickets, admin alerts, system announcements, KYC verification)
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
    title.includes('TICKET') ||
    title.includes('ADMIN') ||
    title.includes('ANNOUNCEMENT') ||
    title.includes('PLATFORM') ||
    title.includes('VERIFICATION') ||
    title.includes('KYC') ||
    title.includes('AADHAAR') ||
    title.includes('WELCOME') ||
    msg.includes('SUPPORT') ||
    msg.includes('TICKET') ||
    msg.includes('ADMIN') ||
    msg.includes('PLATFORM') ||
    msg.includes('JOBMARKET TEAM') ||
    msg.includes('JOBMARKET') ||
    msg.includes('CSN-JOBMARKET')
  ) {
    return 'PLATFORM';
  }

  return 'OTHER';
};

export const NotificationScreen: React.FC<Props> = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const isEmployer = (user?.role || '').toLowerCase() === 'employer' || (user?.role || '').toLowerCase() === 'admin' || (user?.role || '').toLowerCase() === 'recruiter';

  const {
    notifications,
    unreadCount,
    loading,
    refreshing,
    fetchNotifications,
    markAsRead: onMarkNotifRead,
    markAllAsRead: onMarkAllNotifRead,
    removeNotification: onDeleteNotif,
    clearAll: onClearAllNotif,
  } = useNotifications();

  const [filter, setFilter] = useState<'ALL' | 'UNREAD'>('ALL');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [menuVisible, setMenuVisible] = useState(false);

  useFocusEffect(
    useCallback(() => {
      fetchNotifications(true);
    }, [fetchNotifications])
  );

  // Category Filter Options
  const categoryFilterOptions = useMemo(() => {
    return isEmployer ? EMPLOYER_CATEGORY_FILTERS : CANDIDATE_CATEGORY_FILTERS;
  }, [isEmployer]);

  const displayedList = useMemo(() => {
    return notifications.filter((n) => {
      // 1. Read / Unread tab filter
      if (filter === 'UNREAD' && isNotificationRead(n)) {
        return false;
      }

      // 2. Category capsule filter
      if (selectedCategory !== 'ALL') {
        const category = classifyNotification(n);
        if (selectedCategory === 'PLATFORM') {
          if (category !== 'PLATFORM' && category !== 'OTHER') {
            return false;
          }
        } else if (category !== selectedCategory) {
          return false;
        }
      }

      return true;
    });
  }, [notifications, filter, selectedCategory]);

  const handleNotificationClick = (item: AppNotification) => {
    if (!isNotificationRead(item)) {
      onMarkNotifRead(item.id);
    }
    const userRole = (user?.role || '').toLowerCase();
    const target = resolveMobileNotificationRoute(item, userRole);

    if (target && target.screen && navigation && typeof navigation.navigate === 'function') {
      if (target.params) {
        navigation.navigate(target.screen, target.params);
      } else {
        navigation.navigate(target.screen);
      }
    }
  };

  // Enterprise-Grade Industry Icons and Semantic Badge Styling
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
      icon: <BellRing size={19} color="#2563EB" strokeWidth={2.0} />,
      bgColor: '#EFF6FF',
      borderColor: '#BFDBFE',
    };
  };

  const statusBarHeight = Platform.OS === 'android' ? (StatusBar.currentHeight || 0) : 0;
  const safeTopPadding = Math.max(insets.top, statusBarHeight);

  return (
    <View style={[styles.container, { paddingTop: safeTopPadding }]}>
      <FocusAwareStatusBar barStyle="dark-content" backgroundColor="#FFFFFF" translucent={false} />

      {/* Three-Dot Dropdown Menu Modal */}
      <Modal
        visible={menuVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setMenuVisible(false)}
      >
        <TouchableWithoutFeedback onPress={() => setMenuVisible(false)}>
          <View style={styles.menuModalOverlay}>
            <View style={[styles.dropdownMenuCard, { top: safeTopPadding + 44 }]}>
              {/* Option 1: Mark all as read */}
              <TouchableOpacity
                style={styles.dropdownMenuItem}
                activeOpacity={0.7}
                onPress={() => {
                  setMenuVisible(false);
                  onMarkAllNotifRead();
                }}
              >
                <CheckCheck size={16} color={COLORS.primary} style={{ marginRight: 10 }} />
                <Text style={styles.dropdownMenuItemText}>Mark all as read</Text>
              </TouchableOpacity>

              <View style={styles.dropdownDivider} />

              {/* Option 2: Clear all */}
              <TouchableOpacity
                style={styles.dropdownMenuItem}
                activeOpacity={0.7}
                onPress={() => {
                  setMenuVisible(false);
                  onClearAllNotif();
                }}
              >
                <Trash2 size={16} color="#DC2626" style={{ marginRight: 10 }} />
                <Text style={[styles.dropdownMenuItemText, { color: '#DC2626' }]}>Clear all</Text>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

      <View style={styles.pageContent}>
        {/* Top Sticky Controls Wrap: Tab Bar & Capsule Filters with Crisp White Elevation */}
        <View style={styles.headerControlsWrap}>
          {/* Standard Underline Tabular Menu (Full Width Equal Tabs with Three-Dot Icon) */}
          <View style={styles.tabularMenuRow}>
            <View style={styles.tabsContainer}>
              {/* Tab: ALL */}
              <TouchableOpacity
                activeOpacity={0.8}
                style={[styles.tabularTabItem, filter === 'ALL' && styles.tabularTabItemActive]}
                onPress={() => setFilter('ALL')}
              >
                <View style={styles.tabTextWithBadge}>
                  <Text style={[styles.tabularTabText, filter === 'ALL' && styles.tabularTabTextActive]}>
                    All
                  </Text>
                  {notifications.length > 0 && (
                    <View style={[styles.tabCountBadge, filter === 'ALL' && styles.tabCountBadgeActive]}>
                      <Text style={[styles.tabCountBadgeText, filter === 'ALL' && styles.tabCountBadgeTextActive]}>
                        {notifications.length}
                      </Text>
                    </View>
                  )}
                </View>
                {filter === 'ALL' && <View style={styles.tabularActiveIndicator} />}
              </TouchableOpacity>

              {/* Tab: UNREAD */}
              <TouchableOpacity
                activeOpacity={0.8}
                style={[styles.tabularTabItem, filter === 'UNREAD' && styles.tabularTabItemActive]}
                onPress={() => setFilter('UNREAD')}
              >
                <View style={styles.tabTextWithBadge}>
                  <Text style={[styles.tabularTabText, filter === 'UNREAD' && styles.tabularTabTextActive]}>
                    Unread
                  </Text>
                  {unreadCount > 0 && (
                    <View style={[styles.tabCountBadge, filter === 'UNREAD' && styles.tabCountBadgeUnreadActive]}>
                      <Text style={[styles.tabCountBadgeText, filter === 'UNREAD' && styles.tabCountBadgeTextActive]}>
                        {unreadCount > 9 ? '9+' : unreadCount}
                      </Text>
                    </View>
                  )}
                </View>
                {filter === 'UNREAD' && <View style={styles.tabularActiveIndicator} />}
              </TouchableOpacity>
            </View>

            {/* Three-Dot Menu Action at End of Tab Menu */}
            <TouchableOpacity
              style={styles.tabMoreOptionsBtn}
              onPress={() => setMenuVisible(true)}
              activeOpacity={0.7}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <MoreVertical size={20} color="#64748B" strokeWidth={2.2} />
            </TouchableOpacity>
          </View>

          {/* LinkedIn-Style Horizontal Capsule Filter Pills */}
          <View style={styles.capsuleFiltersWrapper}>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.capsuleScrollContent}
            >
              {categoryFilterOptions.map((cat) => {
                const isActive = selectedCategory === cat.key;
                return (
                  <TouchableOpacity
                    key={cat.key}
                    style={[styles.capsulePill, isActive && styles.capsulePillActive]}
                    onPress={() => setSelectedCategory(cat.key)}
                    activeOpacity={0.75}
                  >
                    <Text style={[styles.capsuleText, isActive && styles.capsuleTextActive]}>
                      {cat.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>
        </View>

        {/* Notification LinkedIn-Style Flat List */}
        {loading ? (
          <View style={{ paddingHorizontal: 16, marginTop: 8 }}>
            {[1, 2, 3, 4, 5, 6].map((key) => (
              <View key={key} style={styles.skeletonRow}>
                <SkeletonLoader width={40} height={40} style={{ borderRadius: 20 }} />
                <View style={{ flex: 1, gap: 6 }}>
                  <SkeletonLoader width="65%" height={14} style={{ borderRadius: 4 }} />
                  <SkeletonLoader width="90%" height={12} style={{ borderRadius: 4 }} />
                  <SkeletonLoader width="30%" height={10} style={{ borderRadius: 4 }} />
                </View>
              </View>
            ))}
          </View>
        ) : displayedList.length === 0 ? (
          filter === 'UNREAD' ? (
            <View style={styles.emptyContainer}>
              <View style={styles.emptyIconCircle}>
                <CheckCircle2 size={32} color="#16A34A" />
              </View>
              <Text style={styles.emptyTitle}>You're All Caught Up!</Text>
              <Text style={styles.emptyDesc}>
                No unread notifications in this category.
              </Text>
            </View>
          ) : selectedCategory === 'JOB_POSTINGS' ? (
            <View style={styles.emptyContainer}>
              <View style={[styles.emptyIconCircle, { backgroundColor: '#EFF6FF' }]}>
                <Briefcase size={26} color={COLORS.primary} />
              </View>
              <Text style={styles.emptyTitle}>No Job Posting Notifications</Text>
              <Text style={styles.emptyDesc}>
                Updates regarding job post approvals, status changes, and vacancy expiries will appear here.
              </Text>
            </View>
          ) : selectedCategory === 'APPLICATIONS' ? (
            <View style={styles.emptyContainer}>
              <View style={[styles.emptyIconCircle, { backgroundColor: '#EFF6FF' }]}>
                <UserPlus size={26} color={COLORS.primary} />
              </View>
              <Text style={styles.emptyTitle}>No Application Notifications</Text>
              <Text style={styles.emptyDesc}>
                {isEmployer
                  ? 'Candidate job applications and applicant profile alerts will be shown here.'
                  : 'Updates on your job application statuses, shortlists, and hiring decisions will appear here.'}
              </Text>
            </View>
          ) : selectedCategory === 'INTERVIEWS' ? (
            <View style={styles.emptyContainer}>
              <View style={[styles.emptyIconCircle, { backgroundColor: '#FEF3C7' }]}>
                <CalendarClock size={26} color="#D97706" />
              </View>
              <Text style={styles.emptyTitle}>No Interview Notifications</Text>
              <Text style={styles.emptyDesc}>
                Scheduled interview invitations, timings, and walk-in venue updates will be listed here.
              </Text>
            </View>
          ) : selectedCategory === 'BANNERS' ? (
            <View style={styles.emptyContainer}>
              <View style={[styles.emptyIconCircle, { backgroundColor: '#F5F3FF' }]}>
                <Megaphone size={26} color="#7C3AED" />
              </View>
              <Text style={styles.emptyTitle}>No Banner Notifications</Text>
              <Text style={styles.emptyDesc}>
                Status updates on your advertisement campaigns and promotional banner approvals will be shown here.
              </Text>
            </View>
          ) : selectedCategory === 'PLATFORM' ? (
            <View style={styles.emptyContainer}>
              <View style={[styles.emptyIconCircle, { backgroundColor: '#F1F5F9' }]}>
                <Headphones size={26} color="#475569" />
              </View>
              <Text style={styles.emptyTitle}>No Platform Notifications</Text>
              <Text style={styles.emptyDesc}>
                Support ticket responses, team announcements, and account verification updates will appear here.
              </Text>
            </View>
          ) : (
            <View style={styles.emptyContainer}>
              <View style={styles.emptyIconCircle}>
                <CheckCircle2 size={32} color="#16A34A" />
              </View>
              <Text style={styles.emptyTitle}>You're All Caught Up!</Text>
              <Text style={styles.emptyDesc}>
                No notifications found for the selected filter.
              </Text>
            </View>
          )
        ) : (
          <ScrollView
            style={styles.scrollList}
            contentContainerStyle={[
              styles.scrollContent,
              { paddingBottom: Math.max(insets.bottom + 95, 115) },
            ]}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={() => fetchNotifications(true)}
                colors={[COLORS.primary]}
              />
            }
          >
            {displayedList.map((item) => {
              const isRead = item.read || item.is_read;
              const visual = renderNotifVisualMeta(item.type, item.title, item.message);

              return (
                <TouchableOpacity
                  key={item.id}
                  activeOpacity={0.7}
                  style={[styles.notifRowItem, !isRead && styles.notifRowItemUnread]}
                  onPress={() => handleNotificationClick(item)}
                >
                  {/* Left Circular Avatar with Semantic Theme */}
                  <View
                    style={[
                      styles.avatarCircle,
                      { backgroundColor: visual.bgColor, borderColor: visual.borderColor },
                    ]}
                  >
                    {visual.icon}
                  </View>

                  {/* Middle Content Area */}
                  <View style={styles.rowContentWrap}>
                    <Text style={[styles.rowTitleText, !isRead && styles.rowTitleTextUnread]} numberOfLines={1}>
                      {item.title}
                    </Text>
                    <Text style={styles.rowMessageText} numberOfLines={2}>
                      {item.message}
                    </Text>
                    <Text style={styles.rowTimeText}>{formatTimeAgo(item.created_at || item.createdAt)}</Text>
                  </View>

                  {/* Right Actions / Unread Dot */}
                  <View style={styles.rightActionColumn}>
                    {!isRead && <View style={styles.unreadIndicatorDot} />}
                    <TouchableOpacity
                      style={styles.deleteRowBtn}
                      onPress={(e) => {
                        e.stopPropagation();
                        onDeleteNotif(item.id);
                      }}
                      hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                    >
                      <Trash2 size={13} color="#94A3B8" />
                    </TouchableOpacity>
                  </View>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  menuModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.25)',
  },
  dropdownMenuCard: {
    position: 'absolute',
    right: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    minWidth: 175,
    paddingVertical: 4,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 6,
  },
  dropdownMenuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 11,
  },
  dropdownMenuItemText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1E293B',
  },
  dropdownDivider: {
    height: 1,
    backgroundColor: '#F1F5F9',
  },
  pageContent: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },

  headerControlsWrap: {
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 2,
    zIndex: 10,
  },

  /* Standard Underline Tabular Menu */
  tabularMenuRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    paddingLeft: 4,
    paddingRight: 8,
  },
  tabsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  tabularTabItem: {
    flex: 1,
    paddingVertical: 13,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  tabularTabItemActive: {},
  tabTextWithBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  tabularTabText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#64748B',
  },
  tabularTabTextActive: {
    color: COLORS.primary,
    fontWeight: '700',
  },
  tabCountBadge: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 7,
    paddingVertical: 1.5,
    borderRadius: 10,
  },
  tabCountBadgeActive: {
    backgroundColor: '#EFF6FF',
  },
  tabCountBadgeUnreadActive: {
    backgroundColor: '#FEF2F2',
  },
  tabCountBadgeText: {
    fontSize: 10.5,
    fontWeight: '700',
    color: '#64748B',
  },
  tabCountBadgeTextActive: {
    color: COLORS.primary,
  },
  tabularActiveIndicator: {
    position: 'absolute',
    bottom: -1,
    left: 8,
    right: 8,
    height: 2.5,
    backgroundColor: COLORS.primary,
    borderRadius: 2,
  },
  tabMoreOptionsBtn: {
    padding: 8,
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 4,
  },

  /* LinkedIn-Style Horizontal Capsule Filter Pills */
  capsuleFiltersWrapper: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 8,
  },
  capsuleScrollContent: {
    paddingHorizontal: 16,
    gap: 8,
    alignItems: 'center',
  },
  capsulePill: {
    paddingHorizontal: 12,
    paddingVertical: 5.5,
    borderRadius: 16,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  capsulePillActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  capsuleText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#475569',
  },
  capsuleTextActive: {
    color: '#FFFFFF',
  },

  /* Skeleton Loading Row */
  skeletonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },

  /* Empty State */
  emptyContainer: {
    marginTop: 60,
    paddingHorizontal: 32,
    alignItems: 'center',
  },
  emptyIconCircle: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: '#DCFCE7',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  emptyTitle: {
    fontSize: 14.5,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 4,
  },
  emptyDesc: {
    fontSize: 12,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 17,
  },

  /* LinkedIn-Style Notification List */
  scrollList: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollContent: {
    paddingBottom: 40,
  },
  notifRowItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 13,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    gap: 12,
  },
  notifRowItemUnread: {
    backgroundColor: '#F0F7FF',
  },
  avatarCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 1,
  },
  rowContentWrap: {
    flex: 1,
    paddingRight: 4,
  },
  rowTitleText: {
    fontSize: 12.5,
    fontWeight: '500',
    color: '#334155',
    marginBottom: 2,
  },
  rowTitleTextUnread: {
    fontWeight: '700',
    color: '#0F172A',
  },
  rowMessageText: {
    fontSize: 11.5,
    color: '#475569',
    lineHeight: 16,
    marginBottom: 4,
  },
  rowTimeText: {
    fontSize: 10.5,
    color: '#94A3B8',
    fontWeight: '500',
  },
  rightActionColumn: {
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 3,
    gap: 12,
  },
  unreadIndicatorDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.primary,
  },
  deleteRowBtn: {
    padding: 3,
  },
});
