import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
  Alert,
  Platform,
  StatusBar,
} from 'react-native';
import {
  ArrowLeft,
  Plus,
  Sparkles,
} from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { Skeleton as SkeletonLoader } from '../../components/common/SkeletonLoader';
import { apiFetch } from '../../api/client';
import { Advertisement } from '../../types';
import { COLORS } from '../../constants/theme';
import { EmployerBannerItemCard } from './components/EmployerBannerItemCard';
import { BannerAnalyticsModal } from './components/BannerAnalyticsModal';

type FilterTab = 'ALL' | 'LIVE' | 'REVIEW' | 'REJECTED';

export const EmployerBannersScreen: React.FC<{ navigation: any; route?: any }> = ({
  navigation,
}) => {
  const insets = useSafeAreaInsets();
  const topInset = Math.max(insets.top || 0, Platform.OS === 'android' ? (StatusBar.currentHeight || 24) : 0);

  const [banners, setBanners] = useState<Advertisement[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<FilterTab>('ALL');

  // Analytics Modal
  const [analyticsBanner, setAnalyticsBanner] = useState<Advertisement | null>(null);

  const loadData = useCallback(async () => {
    try {
      const bannersRes = await apiFetch('/api/v1/employer/advertisements').catch(() => ({
        success: false,
        data: [],
      }));

      if (bannersRes.success && Array.isArray(bannersRes.data)) {
        setBanners(bannersRes.data);
      } else {
        setBanners([]);
      }
    } catch {
      setBanners([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  // Reload data every time screen comes into focus
  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData])
  );

  const onRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  // Status Filter Counts (100% Real Database Lifecycle)
  const countAll = banners.length;
  const countLive = banners.filter(
    (b) =>
      ((b.status || '').toUpperCase() === 'APPROVED' ||
        (b.status || '').toUpperCase() === 'PUBLISHED') &&
      b.is_active === true
  ).length;
  const countRejected = banners.filter(
    (b) => (b.status || '').toUpperCase() === 'REJECTED'
  ).length;
  const countReview = banners.filter((b) => {
    const s = (b.status || (b as any).approval_status || '').toUpperCase();
    const isLive = (s === 'APPROVED' || s === 'PUBLISHED') && b.is_active === true;
    const isRejected = s === 'REJECTED';
    return !isLive && !isRejected;
  }).length;

  const filteredBanners = banners.filter((b) => {
    const s = (b.status || (b as any).approval_status || 'PENDING_APPROVAL').toUpperCase();
    const isLive = (s === 'APPROVED' || s === 'PUBLISHED') && b.is_active === true;
    const isRejected = s === 'REJECTED';
    const isInReview = !isLive && !isRejected;

    if (activeTab === 'LIVE') return isLive;
    if (activeTab === 'REVIEW') return isInReview;
    if (activeTab === 'REJECTED') return isRejected;
    return true;
  });

  // Navigate to Dedicated Full-Page Creation Screen
  const handleOpenCreate = () => {
    navigation.navigate('CreateBanner');
  };

  // Navigate to Dedicated Full-Page Edit Screen
  const handleOpenEdit = (banner: Advertisement) => {
    navigation.navigate('CreateBanner', { banner });
  };

  const handleDelete = (id: string, bannerTitle: string) => {
    Alert.alert(
      'Delete Banner',
      `Are you sure you want to delete "${bannerTitle}"? This action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const res = await apiFetch(`/api/v1/employer/advertisements/${id}`, { method: 'DELETE' });
              if (res.success) {
                setBanners((prev) => prev.filter((b) => b.id !== id));
              }
            } catch {
              setBanners((prev) => prev.filter((b) => b.id !== id));
            }
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" translucent={false} />

      {/* 1. Header Bar (Exact match to reference screenshot) */}
      <View style={[styles.headerBanner, { paddingTop: topInset + (Platform.OS === 'android' ? 8 : 4) }]}>
        <View style={styles.headerLeftGroup}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            style={styles.backBtn}
          >
            <ArrowLeft size={22} color="#0F172A" strokeWidth={2.4} />
          </TouchableOpacity>

          <View style={{ flex: 1 }}>
            <Text style={styles.headerTitleText}>Promotional Banners</Text>
            <Text style={styles.headerSubtitleText}>Urgent hiring ads on homepage slider</Text>
          </View>
        </View>
      </View>

      {/* 2. Horizontal Filter Tabs Bar */}
      <View style={styles.filterTabsContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterTabsContent}>
          {/* All */}
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => setActiveTab('ALL')}
            style={[styles.filterTabPill, activeTab === 'ALL' ? styles.filterTabPillActive : styles.filterTabPillInactive]}
          >
            <Text style={[styles.filterTabText, activeTab === 'ALL' ? styles.filterTabTextActive : styles.filterTabTextInactive]}>
              All
            </Text>
            <View style={[styles.filterBadge, activeTab === 'ALL' ? styles.filterBadgeActive : styles.filterBadgeInactive]}>
              <Text style={[styles.filterBadgeText, activeTab === 'ALL' ? styles.filterBadgeTextActive : styles.filterBadgeTextInactive]}>
                {countAll}
              </Text>
            </View>
          </TouchableOpacity>

          {/* Live */}
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => setActiveTab('LIVE')}
            style={[styles.filterTabPill, activeTab === 'LIVE' ? styles.filterTabPillActive : styles.filterTabPillInactive]}
          >
            <Text style={[styles.filterTabText, activeTab === 'LIVE' ? styles.filterTabTextActive : styles.filterTabTextInactive]}>
              Live
            </Text>
            <View style={[styles.filterBadge, activeTab === 'LIVE' ? styles.filterBadgeActive : styles.filterBadgeInactive]}>
              <Text style={[styles.filterBadgeText, activeTab === 'LIVE' ? styles.filterBadgeTextActive : styles.filterBadgeTextInactive]}>
                {countLive}
              </Text>
            </View>
          </TouchableOpacity>

          {/* In Review */}
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => setActiveTab('REVIEW')}
            style={[styles.filterTabPill, activeTab === 'REVIEW' ? styles.filterTabPillActive : styles.filterTabPillInactive]}
          >
            <Text style={[styles.filterTabText, activeTab === 'REVIEW' ? styles.filterTabTextActive : styles.filterTabTextInactive]}>
              In Review
            </Text>
            <View style={[styles.filterBadge, activeTab === 'REVIEW' ? styles.filterBadgeActive : styles.filterBadgeInactive]}>
              <Text style={[styles.filterBadgeText, activeTab === 'REVIEW' ? styles.filterBadgeTextActive : styles.filterBadgeTextInactive]}>
                {countReview}
              </Text>
            </View>
          </TouchableOpacity>

          {/* Rejected */}
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => setActiveTab('REJECTED')}
            style={[styles.filterTabPill, activeTab === 'REJECTED' ? styles.filterTabPillActive : styles.filterTabPillInactive]}
          >
            <Text style={[styles.filterTabText, activeTab === 'REJECTED' ? styles.filterTabTextActive : styles.filterTabTextInactive]}>
              Rejected
            </Text>
            <View style={[styles.filterBadge, activeTab === 'REJECTED' ? styles.filterBadgeActive : styles.filterBadgeInactive]}>
              <Text style={[styles.filterBadgeText, activeTab === 'REJECTED' ? styles.filterBadgeTextActive : styles.filterBadgeTextInactive]}>
                {countRejected}
              </Text>
            </View>
          </TouchableOpacity>
        </ScrollView>
      </View>

      {/* 3. Banners List */}
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[COLORS.primary]} />}
      >
        {loading && !refreshing ? (
          <View style={{ gap: 12 }}>
            {[1, 2].map((key) => (
              <View key={key} style={styles.skeletonCard}>
                <SkeletonLoader width="100%" height={145} style={{ borderRadius: 8 }} />
                <SkeletonLoader width={180} height={16} style={{ borderRadius: 4, marginTop: 10 }} />
                <SkeletonLoader width="100%" height={32} style={{ borderRadius: 6, marginTop: 8 }} />
                <View style={{ flexDirection: 'row', gap: 8, marginTop: 10 }}>
                  <SkeletonLoader width="48%" height={36} style={{ borderRadius: 6 }} />
                  <SkeletonLoader width="48%" height={36} style={{ borderRadius: 6 }} />
                </View>
              </View>
            ))}
          </View>
        ) : filteredBanners.length === 0 ? (
          <View style={styles.emptyCard}>
            <Sparkles size={38} color="#94A3B8" />
            <Text style={styles.emptyTitle}>
              {activeTab === 'ALL' ? 'No Promotional Banners' : `No ${activeTab} Banners`}
            </Text>
            <Text style={styles.emptySubtitle}>
              Promote your urgent hiring requirements on the homepage slider banner to reach thousands of active job seekers.
            </Text>
            <TouchableOpacity style={styles.emptyActionBtn} activeOpacity={0.85} onPress={handleOpenCreate}>
              <Plus size={16} color="#FFFFFF" strokeWidth={2.5} />
              <Text style={styles.emptyActionText}>Create New Banner</Text>
            </TouchableOpacity>
          </View>
        ) : (
          filteredBanners.map((banner) => (
            <EmployerBannerItemCard
              key={banner.id}
              banner={banner}
              onEdit={handleOpenEdit}
              onDelete={handleDelete}
              onViewAnalytics={(b) => setAnalyticsBanner(b)}
            />
          ))
        )}
      </ScrollView>

      {/* 4. Floating Action Button (FAB) placed higher with safe-area bottom offset */}
      <TouchableOpacity
        activeOpacity={0.85}
        onPress={handleOpenCreate}
        style={[
          styles.createFabBtn,
          { bottom: Math.max(insets.bottom || 0, 16) + 28 },
        ]}
      >
        <Plus size={24} color="#FFFFFF" strokeWidth={2.6} />
      </TouchableOpacity>

      {/* 5. Banner Analytics Modal */}
      <BannerAnalyticsModal
        visible={!!analyticsBanner}
        onClose={() => setAnalyticsBanner(null)}
        banner={analyticsBanner}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },

  /* 1. Header Bar */
  headerBanner: {
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    paddingHorizontal: 16,
    paddingBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerLeftGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  backBtn: {
    padding: 2,
  },
  headerTitleText: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: -0.2,
  },
  headerSubtitleText: {
    fontSize: 11.5,
    color: '#64748B',
    marginTop: 1,
  },

  /* 2. Filter Tabs */
  filterTabsContainer: {
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    paddingVertical: 10,
  },
  filterTabsContent: {
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  filterTabPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
  },
  filterTabPillActive: {
    backgroundColor: '#2563EB',
    borderColor: '#2563EB',
  },
  filterTabPillInactive: {
    backgroundColor: '#FFFFFF',
    borderColor: '#CBD5E1',
  },
  filterTabText: {
    fontSize: 13,
    fontWeight: '700',
  },
  filterTabTextActive: {
    color: '#FFFFFF',
  },
  filterTabTextInactive: {
    color: '#334155',
  },
  filterBadge: {
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 10,
  },
  filterBadgeActive: {
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
  },
  filterBadgeInactive: {
    backgroundColor: '#F1F5F9',
  },
  filterBadgeText: {
    fontSize: 11,
    fontWeight: '800',
  },
  filterBadgeTextActive: {
    color: '#FFFFFF',
  },
  filterBadgeTextInactive: {
    color: '#64748B',
  },

  /* 3. Scroll Content */
  scrollContent: {
    padding: 16,
    paddingBottom: 110,
  },
  skeletonCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 12,
    marginBottom: 14,
  },
  emptyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    padding: 24,
    alignItems: 'center',
    marginTop: 20,
  },
  emptyTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
    marginTop: 10,
  },
  emptySubtitle: {
    fontSize: 12,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 18,
    marginTop: 4,
    marginBottom: 16,
  },
  emptyActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#2563EB',
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: 8,
  },
  emptyActionText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },

  /* 4. Floating Action Button (FAB) */
  createFabBtn: {
    position: 'absolute',
    right: 20,
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: '#2563EB',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 6,
    elevation: 6,
    zIndex: 99,
  },
});
