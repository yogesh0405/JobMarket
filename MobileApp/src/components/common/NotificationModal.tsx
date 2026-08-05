import React, { useState } from 'react';
import {
  View,
  Text,
  Modal,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
  Animated,
} from 'react-native';
import {
  Bell,
  X,
  CheckCheck,
  Trash2,
  Briefcase,
  UserCheck,
  CheckCircle2,
  AlertTriangle,
  HelpCircle,
  Clock,
  ExternalLink,
} from 'lucide-react-native';
import { AppNotification } from '../../api/notificationApi';
import { COLORS, TYPOGRAPHY, SPACING } from '../../constants/theme';

interface Props {
  visible: boolean;
  onClose: () => void;
  notifications: AppNotification[];
  unreadCount: number;
  loading: boolean;
  refreshing: boolean;
  onRefresh: () => void;
  onMarkAsRead: (id: string) => void;
  onMarkAllAsRead: () => void;
  onDelete: (id: string) => void;
  onClearAll: () => void;
  onNavigateItem?: (item: AppNotification) => void;
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

export const NotificationModal: React.FC<Props> = ({
  visible,
  onClose,
  notifications,
  unreadCount,
  loading,
  refreshing,
  onRefresh,
  onMarkAsRead,
  onMarkAllAsRead,
  onDelete,
  onClearAll,
  onNavigateItem,
}) => {
  const [filter, setFilter] = useState<'ALL' | 'UNREAD'>('ALL');

  const displayedList = notifications.filter((n) => {
    if (filter === 'UNREAD') {
      return !(n.read || n.is_read);
    }
    return true;
  });

  const getNotifIcon = (type?: string) => {
    const t = (type || '').toUpperCase();
    if (t.includes('JOB_APPLICATION') || t.includes('CANDIDATE')) {
      return <UserCheck size={18} color="#2563EB" />;
    }
    if (t.includes('APPROVAL') || t.includes('APPROVED')) {
      return <CheckCircle2 size={18} color="#10B981" />;
    }
    if (t.includes('REJECTED') || t.includes('CANCEL')) {
      return <AlertTriangle size={18} color="#DC2626" />;
    }
    if (t.includes('SUPPORT') || t.includes('TICKET')) {
      return <HelpCircle size={18} color="#8B5CF6" />;
    }
    return <Briefcase size={18} color="#0EA5E9" />;
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <TouchableOpacity style={styles.backdrop} activeOpacity={1} onPress={onClose} />

        <View style={styles.sheetContainer}>
          {/* Top Notch Indicator */}
          <View style={styles.handleBar} />

          {/* Header Row */}
          <View style={styles.headerRow}>
            <View style={styles.headerTitleBox}>
              <Bell size={20} color="#0F172A" />
              <Text style={styles.headerTitle}>Notifications</Text>
              {unreadCount > 0 ? (
                <View style={styles.unreadBadgePill}>
                  <Text style={styles.unreadBadgeText}>{unreadCount} New</Text>
                </View>
              ) : null}
            </View>

            <TouchableOpacity style={styles.closeBtn} onPress={onClose} activeOpacity={0.7}>
              <X size={20} color="#64748B" />
            </TouchableOpacity>
          </View>

          {/* Filter Bar & Bulk Actions */}
          <View style={styles.actionsBar}>
            <View style={styles.filterPills}>
              <TouchableOpacity
                style={[styles.filterPill, filter === 'ALL' && styles.filterPillActive]}
                onPress={() => setFilter('ALL')}
              >
                <Text style={[styles.filterPillText, filter === 'ALL' && styles.filterPillTextActive]}>
                  All ({notifications.length})
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.filterPill, filter === 'UNREAD' && styles.filterPillActive]}
                onPress={() => setFilter('UNREAD')}
              >
                <Text style={[styles.filterPillText, filter === 'UNREAD' && styles.filterPillTextActive]}>
                  Unread ({unreadCount})
                </Text>
              </TouchableOpacity>
            </View>

            <View style={styles.bulkActionsRow}>
              {unreadCount > 0 ? (
                <TouchableOpacity style={styles.actionBtn} onPress={onMarkAllAsRead}>
                  <CheckCheck size={14} color="#2563EB" />
                  <Text style={styles.actionBtnText}>Read All</Text>
                </TouchableOpacity>
              ) : null}

              {notifications.length > 0 ? (
                <TouchableOpacity style={styles.actionBtn} onPress={onClearAll}>
                  <Trash2 size={14} color="#DC2626" />
                  <Text style={[styles.actionBtnText, { color: '#DC2626' }]}>Clear All</Text>
                </TouchableOpacity>
              ) : null}
            </View>
          </View>

          {/* Notification Items List */}
          {loading ? (
            <View style={styles.loadingBox}>
              <ActivityIndicator size="large" color="#2563EB" />
              <Text style={styles.loadingText}>Fetching real-time notifications...</Text>
            </View>
          ) : displayedList.length === 0 ? (
            <View style={styles.emptyBox}>
              <View style={styles.emptyIconCircle}>
                <CheckCircle2 size={36} color="#10B981" />
              </View>
              <Text style={styles.emptyTitle}>You're All Caught Up!</Text>
              <Text style={styles.emptyDesc}>
                {filter === 'UNREAD'
                  ? 'No unread notifications at the moment.'
                  : 'No notification alerts in your account.'}
              </Text>
            </View>
          ) : (
            <ScrollView
              style={styles.scrollList}
              contentContainerStyle={{ paddingBottom: 24 }}
              showsVerticalScrollIndicator={false}
              refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#2563EB']} />}
            >
              {displayedList.map((item) => {
                const isRead = item.read || item.is_read;
                return (
                  <TouchableOpacity
                    key={item.id}
                    activeOpacity={0.8}
                    style={[styles.itemCard, !isRead && styles.itemCardUnread]}
                    onPress={() => {
                      if (!isRead) onMarkAsRead(item.id);
                      if (onNavigateItem) onNavigateItem(item);
                    }}
                  >
                    <View style={styles.itemIconSquircle}>{getNotifIcon(item.type)}</View>

                    <View style={styles.itemContent}>
                      <View style={styles.itemTitleRow}>
                        <Text style={[styles.itemTitle, !isRead && styles.itemTitleUnread]} numberOfLines={1}>
                          {item.title}
                        </Text>
                        <Text style={styles.itemTime}>{formatTimeAgo(item.created_at || item.createdAt)}</Text>
                      </View>

                      <Text style={styles.itemMessage} numberOfLines={2}>
                        {item.message}
                      </Text>
                    </View>

                    <TouchableOpacity
                      style={styles.itemDeleteBtn}
                      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                      onPress={(e) => {
                        e.stopPropagation();
                        onDelete(item.id);
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
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.45)',
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFill,
  },
  sheetContainer: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
    minHeight: 420,
    paddingHorizontal: 16,
    paddingTop: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  handleBar: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#CBD5E1',
    alignSelf: 'center',
    marginBottom: 12,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  headerTitleBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '900',
    color: '#0F172A',
  },
  unreadBadgePill: {
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#93C5FD',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  unreadBadgeText: {
    color: '#2563EB',
    fontSize: 11,
    fontWeight: '800',
  },
  closeBtn: {
    padding: 6,
    borderRadius: 16,
    backgroundColor: '#F8FAFC',
  },
  actionsBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  filterPills: {
    flexDirection: 'row',
    gap: 6,
  },
  filterPill: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  filterPillActive: {
    backgroundColor: '#2563EB',
    borderColor: '#1D4ED8',
  },
  filterPillText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#64748B',
  },
  filterPillTextActive: {
    color: '#FFFFFF',
  },
  bulkActionsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  actionBtnText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#2563EB',
  },
  loadingBox: {
    paddingVertical: 40,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  loadingText: {
    fontSize: 13,
    color: '#64748B',
    fontWeight: '600',
  },
  emptyBox: {
    paddingVertical: 45,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyIconCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#ECFDF5',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: '#0F172A',
    marginBottom: 4,
  },
  emptyDesc: {
    fontSize: 12.5,
    color: '#64748B',
    textAlign: 'center',
  },
  scrollList: {
    flex: 1,
    marginTop: 8,
  },
  itemCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 12,
    marginBottom: 8,
    gap: 10,
  },
  itemCardUnread: {
    backgroundColor: '#F8FAFC',
    borderColor: '#BFDBFE',
    borderLeftWidth: 3.5,
    borderLeftColor: '#2563EB',
  },
  itemIconSquircle: {
    width: 34,
    height: 34,
    borderRadius: 8,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  itemContent: {
    flex: 1,
  },
  itemTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 2,
  },
  itemTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#334155',
    flex: 1,
    marginRight: 6,
  },
  itemTitleUnread: {
    fontWeight: '900',
    color: '#0F172A',
  },
  itemTime: {
    fontSize: 10.5,
    fontWeight: '600',
    color: '#94A3B8',
  },
  itemMessage: {
    fontSize: 12,
    color: '#64748B',
    lineHeight: 16,
  },
  itemDeleteBtn: {
    padding: 4,
    marginTop: 2,
  },
});
