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
  Platform,
} from 'react-native';
import {
  Calendar,
  Clock,
  MapPin,
  Building2,
  Briefcase,
  ExternalLink,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Navigation2,
  Ticket,
} from 'lucide-react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../../hooks/useAuth';
import { candidateApi, InterviewItem } from '../../api/candidateApi';
import { appliedJobsStore } from '../../utils/appliedJobsStore';
import { Header } from '../../components/common/Header';
import { Skeleton as SkeletonLoader } from '../../components/common/SkeletonLoader';
import { COLORS, RADIUS } from '../../constants/theme';
import { WalkInDrivePassCard } from './components/WalkInDrivePassCard';
import { WalkInDrivePassModal } from './components/WalkInDrivePassModal';
import { CompanyLogoAvatar } from '../../components/common/CompanyLogoAvatar';

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

const isValidMapLink = (url?: string | null): boolean => {
  if (!url || typeof url !== 'string') return false;
  const trimmed = url.trim().toLowerCase();
  return (
    trimmed.startsWith('http://') ||
    trimmed.startsWith('https://') ||
    trimmed.startsWith('geo:') ||
    trimmed.includes('maps.google.') ||
    trimmed.includes('goo.gl/maps') ||
    trimmed.includes('maps.app.goo.gl')
  );
};

const InterviewCard: React.FC<{ item: InterviewItem; isPast?: boolean; navigation: any }> = ({ item, isPast, navigation }) => {
  const days = getDaysFromToday(item.interview_date);
  const hasValidMap = isValidMapLink(item.maps_link);

  const handleOpenMap = () => {
    if (hasValidMap && item.maps_link) {
      Linking.openURL(item.maps_link.trim()).catch((err) =>
        console.warn('Failed to open map link:', err)
      );
    }
  };

  const handleOpenJobDetails = () => {
    navigation.navigate('CandidateJobDetail', {
      jobId: item.job_id,
      job: {
        ...item,
        id: item.job_id,
        title: item.job_title,
        job_title: item.job_title,
        company: item.company_name || item.company,
        company_name: item.company_name || item.company,
        location: item.job_location || item.venue_address,
      },
    });
  };

  return (
    <TouchableOpacity
      style={[styles.card, isPast && styles.cardPast]}
      activeOpacity={0.88}
      onPress={handleOpenJobDetails}
    >
      {/* Company & Days Remaining Row */}
      <View style={styles.cardTopRow}>
        <CompanyLogoAvatar
          logoUrl={
            item.company_logo ||
            (item as any).companyLogo ||
            (item as any).logoUrl ||
            (item as any).logo_url ||
            (item as any).logo ||
            (item as any).employer_logo
          }
          companyName={item.company_name || item.company}
          size={36}
          borderRadius={RADIUS.xs}
        />
        <View style={{ flex: 1, minWidth: 0 }}>
          <Text style={[styles.companyName, isPast && styles.textMuted]} numberOfLines={1}>
            {item.company_name || item.company}
          </Text>
          <TouchableOpacity
            activeOpacity={0.75}
            onPress={handleOpenJobDetails}
            style={styles.jobTitleLinkRow}
          >
            <Text style={[styles.jobTitle, isPast ? styles.textMuted2 : styles.jobTitleLink]} numberOfLines={1}>
              {item.job_title}
            </Text>
            <ExternalLink size={10} color={isPast ? '#94A3B8' : COLORS.primary} style={{ marginLeft: 3 }} />
          </TouchableOpacity>
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
        hasValidMap ? (
          <TouchableOpacity style={styles.venueRow} onPress={handleOpenMap} activeOpacity={0.7}>
            <MapPin size={13} color={isPast ? '#94A3B8' : COLORS.primary} />
            <Text style={[styles.venueText, isPast && styles.textMuted]} numberOfLines={2}>{item.venue_address}</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 3, paddingLeft: 4 }}>
              <Navigation2 size={13} color={isPast ? '#94A3B8' : COLORS.primary} />
              <Text style={{ fontSize: 11, fontWeight: '800', color: isPast ? '#94A3B8' : COLORS.primary }}>Map</Text>
            </View>
          </TouchableOpacity>
        ) : (
          <View style={styles.venueRow}>
            <MapPin size={13} color={isPast ? '#94A3B8' : COLORS.primary} />
            <Text style={[styles.venueText, isPast && styles.textMuted]} numberOfLines={2}>{item.venue_address}</Text>
          </View>
        )
      ) : null}
    </TouchableOpacity>
  );
};

const EmptyState: React.FC<{
  tab: TabType;
  filterType: 'ALL' | 'WALK_IN' | 'SCHEDULED';
  navigation: any;
}> = ({ tab, filterType, navigation }) => (
  <View style={styles.emptyContainer}>
    <View style={styles.emptyIconBox}>
      {filterType === 'WALK_IN' ? (
        <Ticket size={36} color="#CBD5E1" />
      ) : (
        <Calendar size={36} color="#CBD5E1" />
      )}
    </View>
    <Text style={styles.emptyTitle}>
      {filterType === 'WALK_IN'
        ? tab === 'upcoming'
          ? 'No Active Walk-in Passes'
          : 'No Past Walk-in History'
        : tab === 'upcoming'
        ? 'No Upcoming Interviews'
        : 'No Interview History'}
    </Text>
    <Text style={styles.emptyDesc}>
      {filterType === 'WALK_IN'
        ? 'When you apply to jobs with Walk-in Drives, your verified digital gate entry tickets will appear here automatically.'
        : tab === 'upcoming'
        ? 'When employers schedule you for an interview or walk-in drive, it will appear here.'
        : 'Your completed and previous interview history will be listed here.'}
    </Text>
    {filterType === 'WALK_IN' ? (
      <TouchableOpacity
        style={styles.exploreJobsBtn}
        activeOpacity={0.85}
        onPress={() => navigation.navigate('CandidateJobsTab')}
      >
        <Text style={styles.exploreJobsBtnText}>Explore Walk-in Vacancies</Text>
      </TouchableOpacity>
    ) : null}
  </View>
);

export const CandidateInterviewsScreen: React.FC<Props> = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<TabType>('upcoming');
  const [filterType, setFilterType] = useState<'ALL' | 'WALK_IN' | 'SCHEDULED'>('ALL');
  const [upcoming, setUpcoming] = useState<InterviewItem[]>([]);
  const [past, setPast] = useState<InterviewItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedPassItem, setSelectedPassItem] = useState<InterviewItem | null>(null);
  const [showPassModal, setShowPassModal] = useState(false);

  const fetchInterviews = useCallback(async () => {
    try {
      const [interviewsRes, appliedRes] = await Promise.allSettled([
        candidateApi.getMyInterviews(),
        candidateApi.getAppliedJobs(),
      ]);

      const rawUpcoming =
        interviewsRes.status === 'fulfilled' && interviewsRes.value.success && interviewsRes.value.data
          ? interviewsRes.value.data.upcoming || []
          : [];
      const rawPast =
        interviewsRes.status === 'fulfilled' && interviewsRes.value.success && interviewsRes.value.data
          ? interviewsRes.value.data.past || []
          : [];

      // Gather applied jobs from both backend API & local persistent store
      const appliedFromApi =
        appliedRes.status === 'fulfilled' && appliedRes.value.success && Array.isArray(appliedRes.value.data)
          ? appliedRes.value.data
          : [];
      const appliedFromStore = appliedJobsStore.getAppliedJobs();

      const combinedApplied = [...appliedFromApi];
      appliedFromStore.forEach((stored) => {
        const targetId = stored.jobId || stored.job?.id;
        if (!targetId) return;
        const exists = combinedApplied.some((a: any) => {
          const aId = a.jobId || a.job_id || a.job?.id || a.id;
          return String(aId).toLowerCase() === String(targetId).toLowerCase();
        });
        if (!exists) {
          combinedApplied.push(stored);
        }
      });

      // Map walk-in drive applications into interview items
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const walkInItems: InterviewItem[] = [];

      combinedApplied.forEach((item: any) => {
        const job = item.job || item;
        const hm = (job.hiringMethod || job.hiring_method || '').toUpperCase();
        const isWalkIn =
          hm === 'WALK_IN' ||
          Boolean(job.isWalkIn) ||
          Boolean(job.is_walk_in) ||
          Boolean(job.walkInDate) ||
          Boolean(job.walk_in_date);

        if (!isWalkIn) return;

        const dateStr =
          job.walkInDate || job.walk_in_date || item.interviewDate || item.interview_date || '';
        const timeStr =
          item.interviewTime ||
          item.interview_time ||
          (job.walkInStartTime
            ? `${job.walkInStartTime}${job.walkInEndTime ? ' - ' + job.walkInEndTime : ''}`
            : '10:00 AM - 04:00 PM');
        const venue =
          job.interviewAddress ||
          job.interview_address ||
          item.venueAddress ||
          item.venue_address ||
          job.location ||
          'Company Factory Premises';

        const passNum = `PASS-WID-${String(job.id || 'WID').replace(/[^a-zA-Z0-9]/g, '').slice(-4).toUpperCase() || '7842'}-${String(item.id || item.jobId || 'APL').replace(/[^a-zA-Z0-9]/g, '').slice(-4).toUpperCase() || '9120'}`;

        walkInItems.push({
          application_id: String(item.id || item.jobId || job.id),
          job_id: String(job.id || item.jobId || item.job_id),
          status: item.status || 'applied',
          applied_at: item.appliedAt || item.applied_at || (job as any)?.appliedAt || (job as any)?.applied_at || new Date().toISOString(),
          interview_date: dateStr,
          interview_time: timeStr,
          venue_address: venue,
          maps_link: job.googleMapsUrl || job.google_maps_url || item.mapsLink || item.maps_link || '',
          job_title: job.title || item.title || 'Technical Specialist',
          company: job.company || item.company || 'Industrial Company',
          company_name: job.company || item.company || 'Industrial Company',
          company_logo: job.companyLogo || job.company_logo || item.companyLogo || '',
          job_location: job.location || item.location || '',
          industry: job.industry || item.industry,
          job_type: job.job_type || job.jobType,
          work_mode: job.work_mode || job.workMode,
          salary_min: job.salary_min || job.salaryMin,
          salary_max: job.salary_max || job.salaryMax,
          is_walk_in: true,
          hiring_method: 'WALK_IN',
          walk_in_date: dateStr,
          walk_in_start_time: job.walkInStartTime || job.walk_in_start_time || '10:00 AM',
          walk_in_end_time: job.walkInEndTime || job.walk_in_end_time || '04:00 PM',
          walk_in_contact_person: job.walkInContactPerson || job.walk_in_contact_person || job.contactPerson || '',
          walk_in_contact_number: job.walkInContactNumber || job.walk_in_contact_number || '',
          walk_in_documents: job.walkInDocuments || job.walk_in_documents || '',
          ticket_number: passNum,
          candidate_name: user?.name,
          candidate_phone: user?.phone,
        });
      });

      // Merge and enrich rawUpcoming & rawPast
      const finalUpcoming: InterviewItem[] = [];
      const finalPast: InterviewItem[] = [];
      const processedJobIds = new Set<string>();

      // 1. Process regular interviews from backend
      rawUpcoming.forEach((item) => {
        const matchingWalkIn = walkInItems.find(
          (w) => String(w.job_id).toLowerCase() === String(item.job_id).toLowerCase()
        );
        if (matchingWalkIn) {
          processedJobIds.add(String(item.job_id).toLowerCase());
          finalUpcoming.push({ ...item, ...matchingWalkIn });
        } else {
          processedJobIds.add(String(item.job_id).toLowerCase());
          finalUpcoming.push(item);
        }
      });

      rawPast.forEach((item) => {
        const matchingWalkIn = walkInItems.find(
          (w) => String(w.job_id).toLowerCase() === String(item.job_id).toLowerCase()
        );
        if (matchingWalkIn) {
          processedJobIds.add(String(item.job_id).toLowerCase());
          finalPast.push({ ...item, ...matchingWalkIn });
        } else {
          processedJobIds.add(String(item.job_id).toLowerCase());
          finalPast.push(item);
        }
      });

      // 2. Add remaining walk-in drive passes
      walkInItems.forEach((w) => {
        const jId = String(w.job_id).toLowerCase();
        if (processedJobIds.has(jId)) return;
        processedJobIds.add(jId);

        let isTargetPast = false;
        if (w.interview_date) {
          const targetDate = new Date(w.interview_date);
          targetDate.setHours(0, 0, 0, 0);
          if (!isNaN(targetDate.getTime()) && targetDate < today) {
            isTargetPast = true;
          }
        }

        if (isTargetPast) {
          finalPast.push(w);
        } else {
          finalUpcoming.push(w);
        }
      });

      setUpcoming(finalUpcoming);
      setPast(finalPast);
    } catch (e) {
      console.log('Error fetching interviews:', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user?.name, user?.phone]);

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      fetchInterviews();
    }, [fetchInterviews])
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchInterviews();
  };

  const currentTabList = activeTab === 'upcoming' ? upcoming : past;
  const walkInCount = currentTabList.filter((i) => i.is_walk_in).length;
  const scheduledCount = currentTabList.filter((i) => !i.is_walk_in).length;

  const displayList =
    filterType === 'WALK_IN'
      ? currentTabList.filter((i) => i.is_walk_in)
      : filterType === 'SCHEDULED'
      ? currentTabList.filter((i) => !i.is_walk_in)
      : currentTabList;

  return (
    <View style={styles.container}>
      {/* Header */}
      <Header
        title="My Interviews"
        subtitle="Interview schedule & walk-in passes"
        showBack={true}
        onBack={() => navigation.goBack()}
        hideBell={true}
        hideMenu={true}
        hideRightActions={true}
      />

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

      {/* Sub-Filter Pill Row */}
      <View style={styles.subFilterRow}>
        <TouchableOpacity
          activeOpacity={0.75}
          style={[styles.subFilterPill, filterType === 'ALL' && styles.subFilterPillActive]}
          onPress={() => setFilterType('ALL')}
        >
          <Text style={[styles.subFilterText, filterType === 'ALL' && styles.subFilterTextActive]}>
            All ({currentTabList.length})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          activeOpacity={0.75}
          style={[styles.subFilterPill, filterType === 'WALK_IN' && styles.subFilterPillActive]}
          onPress={() => setFilterType('WALK_IN')}
        >
          <Ticket size={11} color={filterType === 'WALK_IN' ? '#FFFFFF' : '#1764E8'} style={{ marginRight: 4 }} />
          <Text style={[styles.subFilterText, filterType === 'WALK_IN' && styles.subFilterTextActive]}>
            Walk-in Drive ({walkInCount})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          activeOpacity={0.75}
          style={[styles.subFilterPill, filterType === 'SCHEDULED' && styles.subFilterPillActive]}
          onPress={() => setFilterType('SCHEDULED')}
        >
          <Text style={[styles.subFilterText, filterType === 'SCHEDULED' && styles.subFilterTextActive]}>
            Other ({scheduledCount})
          </Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      {loading ? (
        <View style={{ padding: 16, gap: 12 }}>
          {[1, 2, 3].map((key) => (
            <View
              key={key}
              style={{
                backgroundColor: '#FFFFFF',
                borderRadius: RADIUS.card,
                borderWidth: 1,
                borderColor: '#CBD5E1',
                padding: 14,
              }}
            >
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 }}>
                <SkeletonLoader width={120} height={16} style={{ borderRadius: RADIUS.xs }} />
                <SkeletonLoader width={70} height={18} style={{ borderRadius: RADIUS.xs }} />
              </View>
              <SkeletonLoader width="80%" height={18} style={{ borderRadius: RADIUS.xs, marginBottom: 8 }} />
              <SkeletonLoader width="60%" height={14} style={{ borderRadius: RADIUS.xs, marginBottom: 12 }} />
              <View style={{ flexDirection: 'row', gap: 16 }}>
                <SkeletonLoader width={100} height={14} style={{ borderRadius: RADIUS.xs }} />
                <SkeletonLoader width={80} height={14} style={{ borderRadius: RADIUS.xs }} />
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
            <EmptyState tab={activeTab} filterType={filterType} navigation={navigation} />
          ) : (
            displayList.map((item) =>
              item.is_walk_in ? (
                <WalkInDrivePassCard
                  key={item.application_id || item.job_id}
                  item={item}
                  isPast={activeTab === 'past'}
                  candidateName={user?.name}
                  candidatePhone={user?.phone}
                  onPressPass={(p) => {
                    setSelectedPassItem(p);
                    setShowPassModal(true);
                  }}
                  navigation={navigation}
                />
              ) : (
                <InterviewCard
                  key={item.application_id || item.job_id}
                  item={item}
                  isPast={activeTab === 'past'}
                  navigation={navigation}
                />
              )
            )
          )}
        </ScrollView>
      )}

      {/* Official Walk-in Drive Admit Card Pass Modal */}
      <WalkInDrivePassModal
        visible={showPassModal}
        item={selectedPassItem}
        candidateName={user?.name}
        candidatePhone={user?.phone}
        onClose={() => {
          setShowPassModal(false);
          setSelectedPassItem(null);
        }}
      />
    </View>
  );
};

// --- Badge styles ---
const badgeStyles = StyleSheet.create({
  base: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 4, alignSelf: 'flex-start' },
  today: { backgroundColor: '#EFF6FF', borderWidth: 1, borderColor: '#BFDBFE' },
  todayText: { fontSize: 10, fontWeight: '900', color: COLORS.primary, letterSpacing: 0.5 },
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
    borderRadius: RADIUS.card,
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
    borderRadius: RADIUS.xs,
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#BFDBFE',
    alignItems: 'center',
    justifyContent: 'center',
  },
  companyName: { fontSize: 13, fontWeight: '800', color: '#0F172A' },
  jobTitleLinkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
    alignSelf: 'flex-start',
  },
  jobTitle: { fontSize: 11.5, fontWeight: '600', color: '#475569' },
  jobTitleLink: {
    color: COLORS.primary,
    fontWeight: '700',
    textDecorationLine: 'underline',
  },
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
    borderRadius: RADIUS.xs,
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
    borderRadius: RADIUS.xs,
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
    borderRadius: RADIUS.card,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  emptyTitle: { fontSize: 15, fontWeight: '800', color: '#334155', textAlign: 'center' },
  emptyDesc: { fontSize: 13, fontWeight: '500', color: '#94A3B8', textAlign: 'center', lineHeight: 20 },
  exploreJobsBtn: {
    backgroundColor: '#1764E8',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: RADIUS.card,
    marginTop: 8,
  },
  exploreJobsBtnText: {
    fontSize: 12.5,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  subFilterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 10,
    gap: 8,
  },
  subFilterPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: RADIUS.full,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#CBD5E1',
  },
  subFilterPillActive: {
    backgroundColor: '#1764E8',
    borderColor: '#1764E8',
  },
  subFilterText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#64748B',
  },
  subFilterTextActive: {
    color: '#FFFFFF',
  },
});
