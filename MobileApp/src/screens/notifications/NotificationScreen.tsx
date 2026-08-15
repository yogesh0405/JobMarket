import React, { useState, useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import {
  Bell,
  CheckCheck,
  Trash2,
  Briefcase,
  CheckCircle2,
  HelpCircle,
  Calendar,
  Send,
  Sparkles,
  ShieldCheck,
  FileText,
  XCircle,
} from 'lucide-react-native';
import { Header } from '../../components/common/Header';
import { useNotifications } from '../../hooks/useNotifications';
import { AppNotification } from '../../api/notificationApi';
import { resolveMobileNotificationRoute } from '../../utils/notificationRouter';
import { useAuth } from '../../hooks/useAuth';
import { FONTS, COLORS } from '../../constants/theme';

interface Props {
  navigation: any;
}

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

export const NotificationScreen: React.FC<Props> = ({ navigation }) => {
  const { user } = useAuth();
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

  useFocusEffect(
    useCallback(() => {
      fetchNotifications(true);
    }, [fetchNotifications])
  );

  const displayedList = notifications.filter((n) => {
    if (filter === 'UNREAD') {
      return !(n.read || n.is_read);
    }
    return true;
  });

  const handleNotificationClick = (item: AppNotification) => {
    if (!item.read && !item.is_read) {
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

  const renderNotifDirectIcon = (type?: string, title?: string, message?: string) => {
    const combined = `${type || ''} ${title || ''} ${message || ''}`.toUpperCase();

    if (combined.includes('INTERVIEW') || combined.includes('SCHEDULED') || combined.includes('WALK-IN') || combined.includes('SHORTLIST')) {
      return <Calendar size={18} color="#D97706" />;
    }
    if (combined.includes('HIRED') || combined.includes('ACCEPTED') || combined.includes('APPROV')) {
      return <CheckCircle2 size={18} color="#16A34A" />;
    }
    if (combined.includes('APPLIED') || combined.includes('APPLICATION') || combined.includes('APPLY')) {
      return <Send size={18} color={COLORS.primary} />;
    }
    if (combined.includes('JOB') || combined.includes('VACANCY') || combined.includes('POSTED')) {
      return <Briefcase size={18} color={COLORS.primary} />;
    }
    if (combined.includes('BANNER') || combined.includes('PROMOT') || combined.includes('ADVERTI')) {
      return <Sparkles size={18} color="#D97706" />;
    }
    if (combined.includes('VERIF') || combined.includes('SECURITY') || combined.includes('SHIELD')) {
      return <ShieldCheck size={18} color={COLORS.primary} />;
    }
    if (combined.includes('RESUME') || combined.includes('DOC') || combined.includes('BIO-DATA')) {
      return <FileText size={18} color="#7C3AED" />;
    }
    if (combined.includes('REJECT') || combined.includes('CANCEL') || combined.includes('DECLIN')) {
      return <XCircle size={18} color="#DC2626" />;
    }
    if (combined.includes('SUPPORT') || combined.includes('TICKET') || combined.includes('HELP')) {
      return <HelpCircle size={18} color="#7C3AED" />;
    }

    return <Bell size={18} color={COLORS.primary} />;
  };

  return (
    <View style={styles.container}>
      {/* Standard Clean Professional Header */}
      <Header
        title="Notifications"
        subtitle="Job alerts & real-time updates"
        onBack={() => navigation.goBack()}
        hideRightActions={true}
      />

      <View style={styles.pageContent}>
        {/* Filter Pills & Bulk Actions Bar */}
        <View style={styles.actionsBarRow}>
          <View style={styles.filterPillsGroup}>
            <TouchableOpacity
              activeOpacity={0.8}
              style={[styles.filterPill, filter === 'ALL' && styles.filterPillActive]}
              onPress={() => setFilter('ALL')}
            >
              <Text style={[styles.filterPillText, filter === 'ALL' && styles.filterPillTextActive]}>
                All ({notifications.length})
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.8}
              style={[styles.filterPill, filter === 'UNREAD' && styles.filterPillActive]}
              onPress={() => setFilter('UNREAD')}
            >
              <Text style={[styles.filterPillText, filter === 'UNREAD' && styles.filterPillTextActive]}>
                Unread ({unreadCount > 9 ? '9+' : unreadCount})
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.bulkActionsGroup}>
            {unreadCount > 0 ? (
              <TouchableOpacity activeOpacity={0.8} style={styles.bulkActionBtn} onPress={onMarkAllNotifRead}>
                <CheckCheck size={14} color={COLORS.primary} />
                <Text style={styles.bulkActionBtnText}>Read All</Text>
              </TouchableOpacity>
            ) : null}

            {notifications.length > 0 ? (
              <TouchableOpacity activeOpacity={0.8} style={styles.bulkActionBtn} onPress={onClearAllNotif}>
                <Trash2 size={14} color="#DC2626" />
                <Text style={[styles.bulkActionBtnText, { color: '#DC2626' }]}>Clear All</Text>
              </TouchableOpacity>
            ) : null}
          </View>
        </View>

        {/* Section Divider Line */}
        <View style={styles.slateSectionDivider} />

        {/* Notification Cards List */}
        {loading ? (
          <View style={styles.loadingBox}>
            <ActivityIndicator size="small" color={COLORS.primary} />
            <Text style={styles.loadingText}>Loading notifications...</Text>
          </View>
        ) : displayedList.length === 0 ? (
          <View style={styles.emptyCardContainer}>
            <View style={styles.emptyIconCircle}>
              <CheckCircle2 size={32} color="#16A34A" />
            </View>
            <Text style={styles.emptyTitle}>You're All Caught Up!</Text>
            <Text style={styles.emptyDesc}>
              {filter === 'UNREAD'
                ? 'No unread notifications at the moment.'
                : 'No notifications found in your account.'}
            </Text>
          </View>
        ) : (
          <ScrollView
            style={styles.scrollList}
            contentContainerStyle={styles.scrollContent}
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
              return (
                <TouchableOpacity
                  key={item.id}
                  activeOpacity={0.88}
                  style={[styles.notificationCard, !isRead && styles.notificationCardUnread]}
                  onPress={() => handleNotificationClick(item)}
                >
                  {/* Direct Icon (No container shape) */}
                  <View style={{ marginTop: 2 }}>
                    {renderNotifDirectIcon(item.type, item.title, item.message)}
                  </View>

                  {/* Main Content Area */}
                  <View style={styles.itemContent}>
                    <View style={styles.itemTitleRow}>
                      <View style={styles.titleWrapRow}>
                        {!isRead ? <View style={styles.unreadDot} /> : null}
                        <Text style={[styles.itemTitle, !isRead && styles.itemTitleUnread]} numberOfLines={1}>
                          {item.title}
                        </Text>
                      </View>
                      <Text style={styles.itemTime}>{formatTimeAgo(item.created_at || item.createdAt)}</Text>
                    </View>

                    <Text style={styles.itemMessage} numberOfLines={2}>
                      {item.message}
                    </Text>
                  </View>

                  {/* Delete Icon */}
                  <TouchableOpacity
                    style={styles.itemDeleteBtn}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                    onPress={(e) => {
                      e.stopPropagation();
                      onDeleteNotif(item.id);
                    }}
                  >
                    <Trash2 size={15} color="#94A3B8" />
                  </TouchableOpacity>
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
    backgroundColor: '#F8F9FA',
  },
  pageContent: {
    flex: 1,
    paddingHorizontal: 16,
    backgroundColor: '#F8F9FA',
  },
  actionsBarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 10,
    paddingBottom: 6,
  },
  filterPillsGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  filterPill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#CBD5E1',
  },
  filterPillActive: {
    backgroundColor: '#EFF6FF',
    borderColor: '#BFDBFE',
  },
  filterPillText: {
    fontSize: 11.5,
    fontWeight: '600',
    color: '#64748B',
  },
  filterPillTextActive: {
    color: COLORS.primary,
    fontWeight: '800',
  },

  bulkActionsGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  bulkActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  bulkActionBtnText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: COLORS.primary,
  },

  slateSectionDivider: {
    height: 1,
    backgroundColor: '#94A3B8',
    marginVertical: 6,
  },

  loadingBox: {
    paddingVertical: 60,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  loadingText: {
    fontSize: 12.5,
    color: '#64748B',
  },
  emptyCardContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    padding: 32,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    marginTop: 16,
  },
  emptyIconCircle: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 2,
  },
  emptyTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
  },
  emptyDesc: {
    fontSize: 12,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 18,
  },

  scrollList: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: 6,
    paddingBottom: 56,
    gap: 10,
  },
  notificationCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#FFFFFF',
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    padding: 14,
    gap: 12,
    elevation: 1,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 2,
  },
  notificationCardUnread: {
    borderLeftWidth: 3,
    borderLeftColor: COLORS.primary,
    backgroundColor: '#FFFFFF',
  },
  itemContent: {
    flex: 1,
  },
  itemTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  titleWrapRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 6,
  },
  unreadDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.primary,
    marginRight: 6,
  },
  itemTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#334155',
    flex: 1,
  },
  itemTitleUnread: {
    fontWeight: '800',
    color: '#0F172A',
  },
  itemTime: {
    fontSize: 11,
    color: '#94A3B8',
  },
  itemMessage: {
    fontSize: 11.5,
    color: '#64748B',
    lineHeight: 16,
  },
  itemDeleteBtn: {
    padding: 4,
    marginTop: 2,
  },
});
