import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Linking,
  ActivityIndicator,
  StatusBar,
} from 'react-native';
import {
  Calendar,
  Clock,
  MapPin,
  Building2,
  Briefcase,
  ChevronLeft,
  ExternalLink,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Navigation2,
} from 'lucide-react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { candidateApi, InterviewItem } from '../../api/candidateApi';
import { Skeleton as SkeletonLoader } from '../../components/common/SkeletonLoader';
import { COLORS } from '../../constants/theme';

interface Props {
  navigation: any;
}

type TabType = 'upcoming' | 'past';

// Returns days from today (negative = past)
const getDaysFromToday = (dateStr: string): number => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(dateStr);
  target.setHours(0, 0, 0, 0);
  return Math.round((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
};

const formatDate = (dateStr: string): string => {
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });
};

const CountdownBadge: React.FC<{ days: number; isPast?: boolean }> = ({ days, isPast }) => {
  if (isPast || days < 0) return (
    <View style={[badgeStyles.base, badgeStyles.past]}>
      <Text style={badgeStyles.pastText}>{Math.abs(days)} {Math.abs(days) === 1 ? 'day' : 'days'} ago</Text>
    </View>
  );
  if (days === 0) return (
    <View style={[badgeStyles.base, badgeStyles.today]}>
      <Text style={badgeStyles.todayText}>TODAY</Text>
    </View>
  );
  if (days === 1) return (
    <View style={[badgeStyles.base, badgeStyles.tomorrow]}>
      <Text style={badgeStyles.tomorrowText}>TOMORROW</Text>
    </View>
  );
  return (
    <View style={[badgeStyles.base, badgeStyles.upcoming]}>
      <Text style={badgeStyles.upcomingText}>{days} days remaining</Text>
    </View>
  );
};

const InterviewCard: React.FC<{ item: InterviewItem; isPast?: boolean; navigation: any }> = ({ item, isPast, navigation }) => {
  const days = getDaysFromToday(item.interview_date);

  const handleOpenMap = () => {
    const url = item.maps_link || (item.venue_address
      ? `https://maps.google.com/?q=${encodeURIComponent(item.venue_address)}`
      : null);
    if (url) Linking.openURL(url);
  };

  const handleOpenJobDetails = () => {
    navigation.navigate('CandidateJobDetail', { jobId: item.job_id, job: item });
  };

  return (
    <TouchableOpacity
      style={[styles.card, isPast && styles.cardPast]}
      activeOpacity={0.88}
      onPress={handleOpenJobDetails}
    >
      {/* Company & Days Remaining Row */}
      <View style={styles.cardTopRow}>
        <View style={styles.companyDot}>
          <Building2 size={16} color={isPast ? '#94A3B8' : COLORS.primary} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={[styles.companyName, isPast && styles.textMuted]} numberOfLines={1}>
            {item.company_name || item.company}
          </Text>
          <Text style={[styles.jobTitle, isPast && styles.textMuted2]} numberOfLines={1}>
            {item.job_title}
          </Text>
        </View>
        <CountdownBadge days={days} isPast={isPast} />
      </View>

      {/* Divider */}
      <View style={styles.inlineDivider} />

      {/* Date / Time Row */}
      <View style={styles.infoGrid}>
        <View style={styles.infoCell}>
          <Calendar size={13} color={isPast ? '#94A3B8' : COLORS.primary} />
          <Text style={[styles.infoLabel, isPast && styles.textMuted]}>{formatDate(item.interview_date)}</Text>
        </View>
        {item.interview_time ? (
          <View style={styles.infoCell}>
            <Clock size={13} color={isPast ? '#94A3B8' : '#64748B'} />
            <Text style={[styles.infoLabel, isPast && styles.textMuted]}>{item.interview_time}</Text>
          </View>
        ) : null}
        {item.job_location ? (
          <View style={styles.infoCell}>
            <Briefcase size={13} color="#94A3B8" />
            <Text style={[styles.infoLabel, styles.textMuted]} numberOfLines={1}>{item.job_type || item.job_location}</Text>
          </View>
        ) : null}
      </View>

      {/* Venue Row */}
      {item.venue_address ? (
        <TouchableOpacity style={styles.venueRow} onPress={handleOpenMap} activeOpacity={0.7}>
          <MapPin size={13} color={isPast ? '#94A3B8' : '#EF4444'} />
          <Text style={[styles.venueText, isPast && styles.textMuted]} numberOfLines={2}>{item.venue_address}</Text>
          <Navigation2 size={13} color={isPast ? '#CBD5E1' : COLORS.primary} />
        </TouchableOpacity>
      ) : null}
    </TouchableOpacity>
  );
};

const EmptyState: React.FC<{ tab: TabType }> = ({ tab }) => (
  <View style={styles.emptyContainer}>
    <View style={styles.emptyIconBox}>
      <Calendar size={36} color="#CBD5E1" />
    </View>
    <Text style={styles.emptyTitle}>
      {tab === 'upcoming' ? 'No Upcoming Interviews' : 'No Interview History'}
    </Text>
    <Text style={styles.emptyDesc}>
      {tab === 'upcoming'
        ? 'When employers schedule you for an interview, it will appear here.'
        : 'Your completed and previous interview history will be listed here.'}
    </Text>
  </View>
);

export const CandidateInterviewsScreen: React.FC<Props> = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const [activeTab, setActiveTab] = useState<TabType>('upcoming');
  const [upcoming, setUpcoming] = useState<InterviewItem[]>([]);
  const [past, setPast] = useState<InterviewItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchInterviews = useCallback(async () => {
    try {
      const res = await candidateApi.getMyInterviews();
      if (res.success && res.data) {
        setUpcoming(res.data.upcoming || []);
        setPast(res.data.past || []);
      }
    } catch (e) {
      console.log('Error fetching interviews:', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(useCallback(() => {
    setLoading(true);
    fetchInterviews();
  }, [fetchInterviews]));

  const onRefresh = () => {
    setRefreshing(true);
    fetchInterviews();
  };

  const displayList = activeTab === 'upcoming' ? upcoming : past;

  return (
    <View style={[styles.container, { paddingTop: Math.max(insets.top, 0) }]}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" translucent={false} />

      {/* Header */}
      <View style={styles.headerBar}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => navigation.goBack()}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <ChevronLeft size={22} color="#0F172A" />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={styles.headerTitle}>My Interviews</Text>
          <Text style={styles.headerSub}>Interview schedule & history</Text>
        </View>
        {upcoming.length > 0 && (
          <View style={styles.upcomingBadge}>
            <Text style={styles.upcomingBadgeText}>{upcoming.length}</Text>
          </View>
        )}
      </View>

      {/* Tab Toggle */}
      <View style={styles.tabRow}>
        <TouchableOpacity
          style={[styles.tabBtn, activeTab === 'upcoming' && styles.tabBtnActive]}
          onPress={() => setActiveTab('upcoming')}
          activeOpacity={0.8}
        >
          <Text style={[styles.tabBtnText, activeTab === 'upcoming' && styles.tabBtnTextActive]}>
            Upcoming {upcoming.length > 0 ? `(${upcoming.length})` : ''}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tabBtn, activeTab === 'past' && styles.tabBtnActive]}
          onPress={() => setActiveTab('past')}
          activeOpacity={0.8}
        >
          <Text style={[styles.tabBtnText, activeTab === 'past' && styles.tabBtnTextActive]}>
            History {past.length > 0 ? `(${past.length})` : ''}
          </Text>
        </TouchableOpacity>
      </View>
      <View style={styles.tabDivider} />

      {/* Content */}
      {loading ? (
        <View style={{ padding: 16, gap: 12 }}>
          {[1, 2, 3].map((key) => (
            <View key={key} style={{ backgroundColor: '#FFFFFF', borderRadius: 8, borderWidth: 1, borderColor: '#CBD5E1', padding: 14 }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 }}>
                <SkeletonLoader width={120} height={16} style={{ borderRadius: 4 }} />
                <SkeletonLoader width={70} height={18} style={{ borderRadius: 4 }} />
              </View>
              <SkeletonLoader width="80%" height={18} style={{ borderRadius: 4, marginBottom: 8 }} />
              <SkeletonLoader width="60%" height={14} style={{ borderRadius: 4, marginBottom: 12 }} />
              <View style={{ paddingTop: 10, borderTopWidth: 1, borderTopColor: '#F1F5F9', flexDirection: 'row', justifyContent: 'space-between' }}>
                <SkeletonLoader width={100} height={14} style={{ borderRadius: 4 }} />
                <SkeletonLoader width={80} height={14} style={{ borderRadius: 4 }} />
              </View>
            </View>
          ))}
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[COLORS.primary]} />}
        >
          {displayList.length === 0 ? (
            <EmptyState tab={activeTab} />
          ) : (
            displayList.map((item) => (
              <InterviewCard key={item.application_id} item={item} isPast={activeTab === 'past'} navigation={navigation} />
            ))
          )}
        </ScrollView>
      )}
    </View>
  );
};

// --- Badge styles ---
const badgeStyles = StyleSheet.create({
  base: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 4, alignSelf: 'flex-start' },
  today: { backgroundColor: '#FEF2F2', borderWidth: 1, borderColor: '#FECACA' },
  todayText: { fontSize: 10, fontWeight: '900', color: '#DC2626', letterSpacing: 0.5 },
  tomorrow: { backgroundColor: '#FFF7ED', borderWidth: 1, borderColor: '#FED7AA' },
  tomorrowText: { fontSize: 10, fontWeight: '900', color: '#EA580C', letterSpacing: 0.5 },
  soon: { backgroundColor: '#FFFBEB', borderWidth: 1, borderColor: '#FDE68A' },
  soonText: { fontSize: 10, fontWeight: '800', color: '#D97706' },
  upcoming: { backgroundColor: '#EFF6FF', borderWidth: 1, borderColor: '#BFDBFE' },
  upcomingText: { fontSize: 10, fontWeight: '800', color: COLORS.primary },
  past: { backgroundColor: '#F1F5F9', borderWidth: 1, borderColor: '#CBD5E1' },
  pastText: { fontSize: 10, fontWeight: '800', color: '#64748B' },
});

// --- Status chip styles ---
const chipStyles = StyleSheet.create({
  shortlisted: { flexDirection: 'row', alignItems: 'center', gap: 3, backgroundColor: '#EFF6FF', borderWidth: 1, borderColor: '#BFDBFE', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  shortlistedText: { fontSize: 9, fontWeight: '800', color: COLORS.primary },
  hired: { flexDirection: 'row', alignItems: 'center', gap: 3, backgroundColor: '#F0FDF4', borderWidth: 1, borderColor: '#BBF7D0', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  hiredText: { fontSize: 9, fontWeight: '800', color: '#16A34A' },
  rejected: { flexDirection: 'row', alignItems: 'center', gap: 3, backgroundColor: '#FEF2F2', borderWidth: 1, borderColor: '#FECACA', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  rejectedText: { fontSize: 9, fontWeight: '800', color: '#DC2626' },
});

// --- Main styles ---
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F7F7F7' },

  // Header
  headerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  backBtn: {
    padding: 4,
    backgroundColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: { fontSize: 16, fontWeight: '800', color: '#0F172A' },
  headerSub: { fontSize: 12, fontWeight: '500', color: '#64748B', marginTop: 1 },
  upcomingBadge: {
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    minWidth: 22,
    height: 22,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
  },
  upcomingBadgeText: { fontSize: 11, fontWeight: '900', color: '#FFFFFF' },

  // Tabs
  tabRow: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingTop: 12,
    gap: 8,
  },
  tabBtn: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabBtnActive: { borderBottomColor: COLORS.primary },
  tabBtnText: { fontSize: 13, fontWeight: '600', color: '#64748B' },
  tabBtnTextActive: { color: COLORS.primary, fontWeight: '800' },
  tabDivider: { height: 1, backgroundColor: '#E2E8F0', marginBottom: 12 },

  // Cards
  scrollContent: { paddingHorizontal: 16, paddingTop: 4, paddingBottom: 120, gap: 10 },
  card: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 0,
    padding: 14,
    gap: 10,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  cardPast: { backgroundColor: '#FAFAFA', borderColor: '#E8ECF0' },
  cardTopRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  companyDot: {
    width: 36,
    height: 36,
    borderRadius: 0,
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#BFDBFE',
    alignItems: 'center',
    justifyContent: 'center',
  },
  companyName: { fontSize: 13, fontWeight: '800', color: '#0F172A' },
  jobTitle: { fontSize: 11, fontWeight: '600', color: '#475569', marginTop: 1 },
  inlineDivider: { height: 1, backgroundColor: '#F1F5F9' },

  // Info Grid
  infoGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  infoCell: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  infoLabel: { fontSize: 12, fontWeight: '600', color: '#334155' },

  // Venue
  venueRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 6,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 8,
  },
  venueText: { flex: 1, fontSize: 12, fontWeight: '500', color: '#475569', lineHeight: 17 },

  // Card Footer
  cardFooter: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  directionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderWidth: 1,
    borderColor: '#BFDBFE',
    backgroundColor: '#EFF6FF',
  },
  directionBtnText: { fontSize: 11, fontWeight: '800', color: COLORS.primary },

  // Muted text
  textMuted: { color: '#94A3B8' },
  textMuted2: { color: '#CBD5E1' },

  // Loading
  loadingContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
  loadingText: { fontSize: 13, fontWeight: '600', color: '#64748B' },

  // Empty state
  emptyContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingTop: 80, paddingHorizontal: 32, gap: 12 },
  emptyIconBox: {
    width: 72,
    height: 72,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  emptyTitle: { fontSize: 15, fontWeight: '800', color: '#334155', textAlign: 'center' },
  emptyDesc: { fontSize: 13, fontWeight: '500', color: '#94A3B8', textAlign: 'center', lineHeight: 20 },
});
