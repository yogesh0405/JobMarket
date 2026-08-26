import React, { useState, useCallback, useMemo, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import {
  Building2,
  Star,
} from 'lucide-react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useAuth } from '../../hooks/useAuth';
import { candidateApi } from '../../api/candidateApi';
import { Job } from '../../types';
import { Header } from '../../components/common/Header';
import { Skeleton as SkeletonLoader } from '../../components/common/SkeletonLoader';
import { CompanyLogoAvatar } from '../../components/common/CompanyLogoAvatar';
import { getRecommendedJobsForCandidate } from '../../utils/recommendationMatcher';
import { COLORS } from '../../constants/theme';
import { appliedJobsStore } from '../../utils/appliedJobsStore';
import { savedJobsStore } from '../../utils/savedJobsStore';
import { CandidateDashboardAnalyticsSection } from './components/CandidateDashboardAnalyticsSection';
import { CandidateDashboardApplicationsSection } from './components/CandidateDashboardApplicationsSection';

interface Props {
  navigation: any;
  hideHeader?: boolean;
}

export const CandidateDashboardScreen: React.FC<Props> = ({ navigation, hideHeader = false }) => {
  const { user, refreshUser } = useAuth();
  const [appliedJobs, setAppliedJobs] = useState<any[]>(appliedJobsStore.getAppliedJobs());
  const [savedJobs, setSavedJobs] = useState<Job[]>(savedJobsStore.getSavedJobs());
  const [recommendedJobs, setRecommendedJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(appliedJobsStore.getAppliedJobs().length === 0);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = useCallback(async (showSkeleton = false) => {
    if (showSkeleton) setLoading(true);
    try {
      await refreshUser();
      const [appliedRes, savedRes, allJobsRes] = await Promise.all([
        candidateApi.getAppliedJobs().catch(() => ({ success: false, data: [] })),
        candidateApi.getSavedJobs().catch(() => ({ success: false, data: [] })),
        candidateApi.getAllJobs().catch(() => ({ success: false, data: [] })),
      ]);

      if (appliedRes.success && appliedRes.data) {
        appliedJobsStore.setAppliedJobs(appliedRes.data);
        setAppliedJobs([...appliedJobsStore.getAppliedJobs()]);
      } else {
        setAppliedJobs([...appliedJobsStore.getAppliedJobs()]);
      }

      if (savedRes.success && savedRes.data) {
        savedJobsStore.setSavedJobs(savedRes.data);
        setSavedJobs(savedJobsStore.getSavedJobs());
      } else {
        setSavedJobs(savedJobsStore.getSavedJobs());
      }
      if (allJobsRes.success && allJobsRes.data) {
        const jobs = allJobsRes.data || [];
        const matchedJobs = getRecommendedJobsForCandidate(jobs, user);
        setRecommendedJobs(matchedJobs.slice(0, 4));
      }
    } catch (e) {
      console.log('Error fetching candidate dashboard data:', e);
      setAppliedJobs([...appliedJobsStore.getAppliedJobs()]);
      setSavedJobs(savedJobsStore.getSavedJobs());
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [refreshUser]);

  useEffect(() => {
    loadData(false);
    const interval = setInterval(() => {
      loadData(false);
    }, 4000);

    const unsubscribeApplied = appliedJobsStore.subscribe(() => {
      setAppliedListStoreData();
    });

    const unsubscribeSaved = savedJobsStore.subscribe(() => {
      setSavedJobs(savedJobsStore.getSavedJobs());
    });

    return () => {
      clearInterval(interval);
      unsubscribeApplied();
      unsubscribeSaved();
    };
  }, [loadData]);

  const setAppliedListStoreData = () => {
    setAppliedJobs([...appliedJobsStore.getAppliedJobs()]);
  };

  useFocusEffect(
    useCallback(() => {
      loadData(false);
    }, [loadData])
  );

  const onRefresh = () => {
    setRefreshing(true);
    loadData(false);
  };

  // 100% REAL GRAPH COMPUTATION FOR THE CURRENT CALENDAR WEEK
  const weeklyGraphData = useMemo(() => {
    const daysMap = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const counts: { [key: string]: number } = { Mon: 0, Tue: 0, Wed: 0, Thu: 0, Fri: 0, Sat: 0, Sun: 0 };

    const now = new Date();
    const currentDayIndex = now.getDay();
    const distanceToMon = currentDayIndex === 0 ? -6 : 1 - currentDayIndex;
    const mondayOfThisWeek = new Date(now);
    mondayOfThisWeek.setDate(now.getDate() + distanceToMon);
    mondayOfThisWeek.setHours(0, 0, 0, 0);

    appliedJobs.forEach((item) => {
      const dateStr = item.appliedAt || item.applied_at || item.createdAt || item.created_at;
      if (dateStr) {
        const d = new Date(dateStr);
        if (!isNaN(d.getTime())) {
          if (d >= mondayOfThisWeek && d <= now) {
            const dayName = daysMap[d.getDay()];
            if (counts[dayName] !== undefined) {
              counts[dayName] += 1;
            }
          }
        }
      }
    });

    const displayOrder = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const todayName = daysMap[currentDayIndex];
    const maxCount = Math.max(...Object.values(counts), 1);

    return displayOrder.map((day) => {
      const count = counts[day] || 0;
      const heightPercent = Math.max(Math.round((count / maxCount) * 85), count > 0 ? 30 : 12);
      return {
        day,
        count,
        height: heightPercent,
        active: day === todayName,
      };
    });
  }, [appliedJobs]);

  const shortlistedCount = useMemo(() => {
    return appliedJobs.filter((a) =>
      ['shortlisted', 'accepted', 'hired'].includes((a.status || '').toLowerCase())
    ).length;
  }, [appliedJobs]);

  const skillsCount = (user?.skills || []).length;

  const formatAppliedDate = (dateStr?: string) => {
    if (!dateStr) return 'Recently';
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return 'Recently';
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    if (diffDays === 0) return 'Applied Today';
    if (diffDays === 1) return 'Applied Yesterday';
    if (diffDays < 7) return `Applied ${diffDays}d ago`;
    return `Applied ${d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;
  };

  const renderStatusTag = (status?: string) => {
    const s = (status || 'applied').toLowerCase();
    let text = COLORS.primary;
    let bg = '#EFF6FF';
    let border = '#BFDBFE';
    let label = 'APPLIED';

    if (s === 'hired' || s === 'accepted') {
      text = '#16A34A';
      bg = '#DCFCE7';
      border = '#86EFAC';
      label = 'HIRED';
    } else if (s === 'shortlisted') {
      text = COLORS.primary;
      bg = '#EFF6FF';
      border = '#BFDBFE';
      label = 'SHORTLISTED';
    } else if (s === 'reviewed' || s === 'under review') {
      text = '#D97706';
      bg = '#FEF3C7';
      border = '#FDE68A';
      label = 'UNDER REVIEW';
    } else if (s === 'rejected') {
      text = '#DC2626';
      bg = '#FEE2E2';
      border = '#FCA5A5';
      label = 'REJECTED';
    }

    return (
      <View style={[styles.statusBadgePill, { backgroundColor: bg, borderColor: border }]}>
        <Text style={[styles.statusBadgeText, { color: text }]}>{label}</Text>
      </View>
    );
  };

  const renderDashboardBody = () => (
    <View style={styles.singleMasterCard}>
      {/* 1. REAL ANALYTICS GRAPH CHART */}
      <CandidateDashboardAnalyticsSection
        weeklyGraphData={weeklyGraphData}
        appliedCount={appliedJobs.length}
        savedCount={savedJobs.length}
        shortlistedCount={shortlistedCount}
        skillsCount={skillsCount}
        navigation={navigation}
      />

      {/* SLATE DIVIDER */}
      <View style={styles.sectionDividerSlate} />

      {/* 2. RECENT APPLICATIONS TRACKER */}
      <CandidateDashboardApplicationsSection
        appliedJobs={appliedJobs}
        formatAppliedDate={formatAppliedDate}
        renderStatusTag={renderStatusTag}
        navigation={navigation}
      />

      {/* SLATE DIVIDER */}
      <View style={styles.sectionDividerSlate} />

      {/* 3. RECOMMENDED INDUSTRIAL VACANCIES */}
      <View style={styles.sectionHeaderRow}>
        <Text style={styles.sectionTitleText}>Recommended Vacancies</Text>
        <TouchableOpacity onPress={() => navigation.navigate('CandidateJobsTab')}>
          <Text style={styles.viewAllText}>Explore All →</Text>
        </TouchableOpacity>
      </View>

      {recommendedJobs.length === 0 ? (
        <View style={styles.emptyStateContainer}>
          <Text style={styles.emptyText}>No recommended vacancies available right now.</Text>
        </View>
      ) : (
        <View style={styles.squaredCardsGrid}>
          {recommendedJobs.slice(0, 4).map((job) => {
            const jobSkills = Array.isArray(job.skills) && job.skills.length > 0 ? job.skills : ['Factory', 'Machining'];
            const firstSkill = jobSkills[0];
            const remainingCount = Math.max(jobSkills.length - 1, 1);
            return (
              <TouchableOpacity
                key={job.id}
                activeOpacity={0.88}
                style={styles.squaredJobCard}
                onPress={() => navigation.navigate('CandidateJobDetail', { jobId: job.id })}
              >
                {/* Top Badges Row */}
                <View style={styles.cardTopBadgeRow}>
                  <View style={styles.cardTopLeftPill}>
                    <Text style={styles.cardTopLeftPillText} numberOfLines={1}>
                      {job.job_type || job.jobType || 'Full-Time'}
                    </Text>
                  </View>

                  <View style={styles.cardTopRightBadge}>
                    <Star size={10} color="#D97706" />
                    <Text style={styles.cardTopRightBadgeText}>4.8</Text>
                  </View>
                </View>

                {/* Centered Circular Logo */}
                <View style={styles.centeredLogoContainer}>
                  <CompanyLogoAvatar
                    logoUrl={job.companyLogo || (job as any).company_logo || (job as any).logoUrl}
                    companyName={job.company || 'Industrial Partner'}
                    size={56}
                    borderRadius={28}
                  />
                </View>

                {/* Centered Title, Company, Location */}
                <Text style={styles.squaredJobTitle} numberOfLines={1}>
                  {job.title}
                </Text>

                <Text style={styles.squaredCompanySub} numberOfLines={1}>
                  {job.company || 'MIDC Company'}
                </Text>

                <Text style={styles.squaredLocationSub} numberOfLines={1}>
                  ({job.location || 'MIDC Zone'})
                </Text>

                {/* Tags Row */}
                <View style={styles.squaredTagsRow}>
                  <View style={styles.squaredTagChip}>
                    <Text style={styles.squaredTagChipText} numberOfLines={1}>
                      {firstSkill}
                    </Text>
                  </View>
                  <View style={styles.squaredTagChipMore}>
                    <Text style={styles.squaredTagChipMoreText}>+{remainingCount}</Text>
                  </View>
                </View>

                {/* Bottom Action Button */}
                <TouchableOpacity
                  activeOpacity={0.8}
                  style={styles.squaredCardBtn}
                  onPress={() => navigation.navigate('CandidateJobDetail', { jobId: job.id })}
                >
                  <Text style={styles.squaredCardBtnText}>View Job Details</Text>
                </TouchableOpacity>
              </TouchableOpacity>
            );
          })}
        </View>
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      {!hideHeader && (
        <Header title="Candidate Dashboard" subtitle="Application status, job activity & metrics" showBack={false} />
      )}

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[COLORS.primary]} />}
      >
        {loading ? (
          <SkeletonLoader width="100%" height={450} style={{ borderRadius: 0 }} />
        ) : (
          renderDashboardBody()
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  scrollContent: {
    padding: 14,
    paddingBottom: 110,
  },
  singleMasterCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 0,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    padding: 14,
  },
  statusBadgePill: {
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
  },
  statusBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  sectionDividerSlate: {
    height: 1,
    backgroundColor: '#94A3B8',
    marginVertical: 14,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  sectionTitleText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
  },
  viewAllText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.primary,
  },
  emptyStateContainer: {
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 20,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 12.5,
    color: '#64748B',
  },
  squaredCardsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginTop: 4,
  },
  squaredJobCard: {
    width: '48%',
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    padding: 10,
  },
  cardTopBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  cardTopLeftPill: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  cardTopLeftPillText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#475569',
  },
  cardTopRightBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  cardTopRightBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#D97706',
  },
  centeredLogoContainer: {
    alignItems: 'center',
    marginVertical: 4,
  },
  squaredJobTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0F172A',
    textAlign: 'center',
    marginTop: 4,
  },
  squaredCompanySub: {
    fontSize: 11.5,
    color: '#64748B',
    textAlign: 'center',
    marginTop: 1,
  },
  squaredLocationSub: {
    fontSize: 10.5,
    color: '#94A3B8',
    textAlign: 'center',
    marginTop: 1,
  },
  squaredTagsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    marginVertical: 8,
  },
  squaredTagChip: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    maxWidth: '70%',
  },
  squaredTagChipText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#475569',
  },
  squaredTagChipMore: {
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: 4,
  },
  squaredTagChipMoreText: {
    fontSize: 10,
    fontWeight: '800',
    color: COLORS.primary,
  },
  squaredCardBtn: {
    backgroundColor: COLORS.primary,
    borderRadius: 4,
    paddingVertical: 6,
    alignItems: 'center',
  },
  squaredCardBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
