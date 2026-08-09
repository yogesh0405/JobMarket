import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  Modal,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
  PanResponder,
  Animated,
  Dimensions,
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
  ChevronUp,
  ChevronDown,
} from 'lucide-react-native';
import { AppNotification } from '../../api/notificationApi';
import { COLORS, TYPOGRAPHY, SPACING } from '../../constants/theme';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');
const COLLAPSED_HEIGHT = Math.min(SCREEN_HEIGHT * 0.70, 560);
const EXPANDED_HEIGHT = SCREEN_HEIGHT * 0.94;

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
  const [isExpanded, setIsExpanded] = useState(false);

  const animatedHeight = useRef(new Animated.Value(COLLAPSED_HEIGHT)).current;

  useEffect(() => {
    if (visible) {
      setIsExpanded(false);
      animatedHeight.setValue(COLLAPSED_HEIGHT);
    }
  }, [visible]);

  useEffect(() => {
    Animated.spring(animatedHeight, {
      toValue: isExpanded ? EXPANDED_HEIGHT : COLLAPSED_HEIGHT,
      useNativeDriver: false,
      friction: 8,
      tension: 40,
    }).start();
  }, [isExpanded]);

  // Real-time Finger Drag PanResponder
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, gestureState) => Math.abs(gestureState.dy) > 3,
      onPanResponderMove: (_, gestureState) => {
        const currentBase = isExpanded ? EXPANDED_HEIGHT : COLLAPSED_HEIGHT;
        const newHeight = currentBase - gestureState.dy;
        if (newHeight >= 280 && newHeight <= EXPANDED_HEIGHT + 30) {
          animatedHeight.setValue(newHeight);
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dy < -30) {
          // Dragged finger UP -> Expand fully
          setIsExpanded(true);
        } else if (gestureState.dy > 60) {
          // Dragged finger DOWN -> Collapse or Close
          if (isExpanded) {
            setIsExpanded(false);
          } else {
            onClose();
          }
        } else {
          // Snap back smoothly
          Animated.spring(animatedHeight, {
            toValue: isExpanded ? EXPANDED_HEIGHT : COLLAPSED_HEIGHT,
            useNativeDriver: false,
            friction: 8,
          }).start();
        }
      },
    })
  ).current;

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

        <Animated.View style={[styles.sheetContainer, { height: animatedHeight }]}>
          {/* Real-Time Touch & Finger Drag Handle Header Bar */}
          <View {...panResponder.panHandlers} style={styles.handleBarTouchArea}>
            <View style={styles.handleBar} />
          </View>

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

            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <TouchableOpacity
                style={styles.expandBtn}
                onPress={() => setIsExpanded((prev) => !prev)}
                activeOpacity={0.7}
              >
                {isExpanded ? (
                  <ChevronDown size={18} color="#64748B" />
                ) : (
                  <ChevronUp size={18} color="#2563EB" />
                )}
              </TouchableOpacity>

              <TouchableOpacity style={styles.closeBtn} onPress={onClose} activeOpacity={0.7}>
                <X size={20} color="#64748B" />
              </TouchableOpacity>
            </View>
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
              contentContainerStyle={{ paddingBottom: 30 }}
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
        </Animated.View>
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
    paddingHorizontal: 16,
    paddingTop: 6,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  handleBarTouchArea: {
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FAFAFA',
    marginHorizontal: -16,
    marginTop: -6,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  handleBar: {
    width: 44,
    height: 5,
    borderRadius: 3,
    backgroundColor: '#94A3B8',
    marginBottom: 4,
  },
  swipeHintText: {
    fontSize: 10.5,
    fontWeight: '800',
    color: '#64748B',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
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
  expandBtn: {
    padding: 6,
    borderRadius: 16,
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#BFDBFE',
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
    alignItems: 'center',
    gap: 6,
  },
  filterPill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: '#F1F5F9',
  },
  filterPillActive: {
    backgroundColor: '#2563EB',
  },
  filterPillText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#64748B',
  },
  filterPillTextActive: {
    color: '#FFFFFF',
    fontWeight: '800',
  },
  bulkActionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
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
    paddingVertical: 50,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  emptyIconCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#ECFDF5',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: '#0F172A',
  },
  emptyDesc: {
    fontSize: 12.5,
    color: '#64748B',
    textAlign: 'center',
  },
  scrollList: {
    flex: 1,
    paddingTop: 8,
  },
  itemCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 10,
    padding: 12,
    marginBottom: 8,
    gap: 10,
  },
  itemCardUnread: {
    backgroundColor: '#F0F9FF',
    borderColor: '#BAE6FD',
  },
  itemIconSquircle: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemContent: {
    flex: 1,
  },
  itemTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 3,
  },
  itemTitle: {
    fontSize: 13.5,
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
    color: '#94A3B8',
    fontWeight: '600',
  },
  itemMessage: {
    fontSize: 12,
    color: '#475569',
    lineHeight: 16,
  },
  itemDeleteBtn: {
    padding: 4,
  },
});
