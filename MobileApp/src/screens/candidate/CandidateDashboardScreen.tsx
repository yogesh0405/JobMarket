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
  Briefcase,
  Bookmark,
  Award,
  Building2,
  MapPin,
  IndianRupee,
  BarChart2,
  TrendingUp,
  Clock,
  Search,
  ChevronRight,
  Star,
} from 'lucide-react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useAuth } from '../../hooks/useAuth';
import { candidateApi } from '../../api/candidateApi';
import { Job } from '../../types';
import { Header } from '../../components/common/Header';
import { Skeleton as SkeletonLoader } from '../../components/common/SkeletonLoader';
import { CompanyLogoAvatar } from '../../components/common/CompanyLogoAvatar';
import { COLORS } from '../../constants/theme';
import { appliedJobsStore } from '../../utils/appliedJobsStore';

interface Props {
  navigation: any;
  hideHeader?: boolean;
}

export const CandidateDashboardScreen: React.FC<Props> = ({ navigation, hideHeader = false }) => {
  const { user, refreshUser } = useAuth();
  const [appliedJobs, setAppliedJobs] = useState<any[]>(appliedJobsStore.getAppliedJobs());
  const [savedJobs, setSavedJobs] = useState<Job[]>([]);
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
        setSavedJobs(savedRes.data || []);
      }
      if (allJobsRes.success && allJobsRes.data) {
        const jobs = allJobsRes.data || [];
        setRecommendedJobs(jobs.slice(0, 4));
      }
    } catch (e) {
      console.log('Error fetching candidate dashboard data:', e);
      setAppliedJobs([...appliedJobsStore.getAppliedJobs()]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [refreshUser]);

  // Real-time store subscription & automated interval polling for live graph re-computation
  useEffect(() => {
    loadData(false);
    const interval = setInterval(() => {
      loadData(false);
    }, 4000);

    const unsubscribe = appliedJobsStore.subscribe(() => {
      setAppliedListStoreData();
    });

    return () => {
      clearInterval(interval);
      unsubscribe();
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
    // Calculate Monday 00:00:00 of the current calendar week
    const currentDayIndex = now.getDay(); // 0 = Sun, 1 = Mon...
    const distanceToMon = currentDayIndex === 0 ? -6 : 1 - currentDayIndex;
    const mondayOfThisWeek = new Date(now);
    mondayOfThisWeek.setDate(now.getDate() + distanceToMon);
    mondayOfThisWeek.setHours(0, 0, 0, 0);

    appliedJobs.forEach((item) => {
      const dateStr = item.appliedAt || item.applied_at || item.createdAt || item.created_at;
      if (dateStr) {
        const d = new Date(dateStr);
        if (!isNaN(d.getTime())) {
          // Count only applications submitted within current week up to right now
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

  // Real KPI Metrics derived from candidate profile & application records
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
      {/* 1. REAL ANALYTICS GRAPH CHART (DERIVED 100% FROM BACKEND APPLIED JOBS) */}
      <View style={styles.chartHeaderRow}>
        <View style={{ flex: 1 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <BarChart2 size={16} color={COLORS.primary} />
            <Text style={styles.chartTitleText}>Application Velocity & Activity</Text>
          </View>
          <Text style={styles.chartSubText}>Real application distribution by day of week</Text>
        </View>

        <View style={styles.trendBadge}>
          <TrendingUp size={12} color="#16A34A" />
          <Text style={styles.trendBadgeText}>Live Data</Text>
        </View>
      </View>

      {/* REAL BAR GRAPH VISUALIZATION */}
      <View style={styles.graphBox}>
        <View style={styles.graphBarsRow}>
          {weeklyGraphData.map((item, idx) => (
            <View key={idx} style={styles.graphColumn}>
              <Text style={styles.graphBarValueText}>{item.count}</Text>
              <View style={styles.graphBarTrack}>
                <View
                  style={[
                    styles.graphBarFill,
                    { height: `${item.height}%` },
                    item.active && styles.graphBarFillActive,
                  ]}
                />
              </View>
              <Text style={[styles.graphDayText, item.active && styles.graphDayTextActive]}>
                {item.day}
              </Text>
            </View>
          ))}
        </View>
        <View style={styles.graphBaselineAxis} />
      </View>

      {/* REAL KPI METRICS ROW BELOW CHART */}
      <View style={styles.kpiRow}>
        <TouchableOpacity
          activeOpacity={0.8}
          style={styles.kpiItem}
          onPress={() => navigation.navigate('CandidateAppliedTab')}
        >
          <Text style={styles.kpiValueText}>{appliedJobs.length}</Text>
          <Text style={styles.kpiLabelText}>Applied</Text>
        </TouchableOpacity>

        <View style={styles.kpiDivider} />

        <TouchableOpacity
          activeOpacity={0.8}
          style={styles.kpiItem}
          onPress={() => navigation.navigate('CandidateSavedTab')}
        >
          <Text style={styles.kpiValueText}>{savedJobs.length}</Text>
          <Text style={styles.kpiLabelText}>Saved</Text>
        </TouchableOpacity>

        <View style={styles.kpiDivider} />

        <View style={styles.kpiItem}>
          <Text style={styles.kpiValueText}>{shortlistedCount}</Text>
          <Text style={styles.kpiLabelText}>Shortlisted</Text>
        </View>

        <View style={styles.kpiDivider} />

        <TouchableOpacity
          activeOpacity={0.8}
          style={styles.kpiItem}
          onPress={() => navigation.navigate('CandidateProfile')}
        >
          <Text style={styles.kpiValueText}>{skillsCount}</Text>
          <Text style={styles.kpiLabelText}>Skills</Text>
        </TouchableOpacity>
      </View>

      {/* SLATE DIVIDER */}
      <View style={styles.sectionDividerSlate} />

      {/* 2. RECENT APPLICATIONS TRACKER */}
      <View style={styles.sectionHeaderRow}>
        <Text style={styles.sectionTitleText}>Recent Applications</Text>
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => navigation.navigate('CandidateAppliedTab')}
        >
          <Text style={styles.viewAllText}>View All ({appliedJobs.length}) →</Text>
        </TouchableOpacity>
      </View>

      {appliedJobs.length === 0 ? (
        <View style={styles.emptyApplicationsBox}>
          <Building2 size={26} color="#94A3B8" />
          <Text style={styles.emptyTitleText}>No Applications Submitted</Text>
          <Text style={styles.emptyDescText}>Browse verified MIDC industrial vacancies & apply with 1-click.</Text>
          <TouchableOpacity
            activeOpacity={0.85}
            style={styles.exploreVacanciesBtn}
            onPress={() => navigation.navigate('CandidateJobsTab')}
          >
            <Search size={13} color="#FFFFFF" />
            <Text style={styles.exploreVacanciesBtnText}>Explore Vacancies</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={{ marginTop: 4 }}>
          {appliedJobs.slice(0, 4).map((item, index) => {
            const job = item.job || item;
            const appliedDate = formatAppliedDate(item.appliedAt || item.applied_at || item.createdAt);
            return (
              <TouchableOpacity
                key={item.jobId || job.id || index}
                activeOpacity={0.85}
                style={styles.applicationRow}
                onPress={() => navigation.navigate('CandidateAppliedTab')}
              >
                <CompanyLogoAvatar
                  logoUrl={job.companyLogo || (job as any).company_logo || (job as any).logoUrl}
                  companyName={job.company || 'Industrial Company'}
                  size={38}
                  borderRadius={4}
                />
                <View style={{ flex: 1 }}>
                  <Text style={styles.rowJobTitle} numberOfLines={1}>
                    {job.title || 'Industrial Position'}
                  </Text>
                  <Text style={styles.rowCompanySub} numberOfLines={1}>
                    {job.company || 'Manufacturing Partner'} • {job.location || 'MIDC Zone'}
                  </Text>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 3 }}>
                    <Clock size={11} color="#94A3B8" />
                    <Text style={styles.appliedDateText}>{appliedDate}</Text>
                  </View>
                </View>
                <View style={{ alignItems: 'flex-end', justifyContent: 'center' }}>
                  {renderStatusTag(item.status)}
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
      )}

      {/* SLATE DIVIDER */}
      <View style={styles.sectionDividerSlate} />

      {/* 3. RECOMMENDED INDUSTRIAL VACANCIES (SQUARED 2-COLUMN CARD GRID LAYOUT) */}
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

                {/* Systematic Single-Row Tags Row (No Overflowing) */}
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
                  <Text style={styles.squaredCardBtnText}>View Details</Text>
                </TouchableOpacity>
              </TouchableOpacity>
            );
          })}
        </View>
      )}
    </View>
  );

  if (hideHeader) {
    return (
      <View style={{ paddingTop: 0, paddingHorizontal: 12 }}>
        {renderDashboardBody()}
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Header title="JobMarket" subtitle="Industrial & Factory Jobs" showBack={false} />
      {loading && !refreshing ? (
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <SkeletonLoader width="100%" height={260} style={{ borderRadius: 0 }} />
        </ScrollView>
      ) : (
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[COLORS.primary]} tintColor={COLORS.primary} />
          }
        >
          {renderDashboardBody()}
        </ScrollView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F7F7',
  },
  scrollContent: {
    paddingHorizontal: 12,
    paddingTop: 14,
    paddingBottom: 130,
  },
  singleMasterCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 0,
    padding: 16,
  },
  chartHeaderRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  chartTitleText: {
    fontSize: 14.5,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: -0.2,
  },
  chartSubText: {
    fontSize: 11.5,
    color: '#64748B',
    marginTop: 2,
    fontWeight: '500',
  },
  trendBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: '#DCFCE7',
    borderWidth: 1,
    borderColor: '#86EFAC',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
  },
  trendBadgeText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#16A34A',
  },
  graphBox: {
    paddingTop: 8,
    paddingBottom: 4,
  },
  graphBarsRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-around',
    height: 100,
    paddingHorizontal: 4,
  },
  graphColumn: {
    alignItems: 'center',
    width: 28,
  },
  graphBarValueText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#64748B',
    marginBottom: 4,
  },
  graphBarTrack: {
    width: 14,
    height: 68,
    backgroundColor: '#F1F5F9',
    borderRadius: 2,
    justifyContent: 'flex-end',
    overflow: 'hidden',
  },
  graphBarFill: {
    width: '100%',
    backgroundColor: '#94A3B8',
    borderRadius: 2,
  },
  graphBarFillActive: {
    backgroundColor: COLORS.primary,
  },
  graphDayText: {
    fontSize: 10.5,
    fontWeight: '700',
    color: '#64748B',
    marginTop: 6,
  },
  graphDayTextActive: {
    color: COLORS.primary,
    fontWeight: '900',
  },
  graphBaselineAxis: {
    height: 1,
    backgroundColor: '#CBD5E1',
    marginTop: 2,
  },
  kpiRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    marginTop: 14,
    paddingTop: 10,
  },
  kpiItem: {
    flex: 1,
    alignItems: 'center',
  },
  kpiValueText: {
    fontSize: 17,
    fontWeight: '900',
    color: COLORS.primary,
  },
  kpiLabelText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748B',
    marginTop: 2,
  },
  kpiDivider: {
    width: 1,
    height: 24,
    backgroundColor: '#E2E8F0',
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
    fontSize: 14.5,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: -0.2,
  },
  viewAllText: {
    fontSize: 12,
    fontWeight: '800',
    color: COLORS.primary,
  },
  emptyStateContainer: {
    paddingVertical: 12,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 12,
    color: '#94A3B8',
    fontStyle: 'italic',
  },
  emptyApplicationsBox: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    gap: 6,
  },
  emptyTitleText: {
    fontSize: 13.5,
    fontWeight: '800',
    color: '#0F172A',
  },
  emptyDescText: {
    fontSize: 11.5,
    color: '#64748B',
    textAlign: 'center',
  },
  exploreVacanciesBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: COLORS.primary,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 0,
    marginTop: 4,
  },
  exploreVacanciesBtnText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  applicationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 11,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    gap: 12,
  },
  rowJobTitle: {
    fontSize: 13.5,
    fontWeight: '800',
    color: '#0F172A',
  },
  rowCompanySub: {
    fontSize: 11.5,
    color: '#64748B',
    fontWeight: '600',
    marginTop: 1,
  },
  appliedDateText: {
    fontSize: 11,
    color: '#94A3B8',
    fontWeight: '600',
  },
  statusBadgePill: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 0,
    borderWidth: 1,
  },
  statusBadgeText: {
    fontSize: 10.5,
    fontWeight: '800',
    letterSpacing: 0.3,
  },

  /* SQUARED CARD GRID LAYOUT STYLES */
  squaredCardsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
    marginTop: 6,
  },
  squaredJobCard: {
    width: '48%',
    height: 236,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 0,
    padding: 10,
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  cardTopBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
  },
  cardTopLeftPill: {
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  cardTopLeftPillText: {
    fontSize: 9.5,
    fontWeight: '800',
    color: COLORS.primary,
  },
  cardTopRightBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#FDE68A',
  },
  cardTopRightBadgeText: {
    fontSize: 10.5,
    fontWeight: '800',
    color: '#B45309',
  },
  centeredLogoContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 4,
  },
  squaredJobTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0F172A',
    textAlign: 'center',
    marginTop: 2,
  },
  squaredCompanySub: {
    fontSize: 11,
    fontWeight: '700',
    color: '#475569',
    textAlign: 'center',
    marginTop: 1,
  },
  squaredLocationSub: {
    fontSize: 10.5,
    color: '#64748B',
    textAlign: 'center',
    marginTop: 1,
  },
  squaredTagsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    height: 20,
    marginVertical: 4,
  },
  squaredTagChip: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 10,
    maxWidth: 68,
  },
  squaredTagChipText: {
    fontSize: 9.5,
    fontWeight: '600',
    color: '#475569',
  },
  squaredTagChipMore: {
    backgroundColor: '#E2E8F0',
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: 10,
  },
  squaredTagChipMoreText: {
    fontSize: 9.5,
    fontWeight: '800',
    color: '#334155',
  },
  squaredCardBtn: {
    width: '100%',
    borderWidth: 1,
    borderColor: COLORS.primary,
    borderRadius: 0,
    paddingVertical: 7,
    alignItems: 'center',
    marginTop: 4,
    backgroundColor: '#FFFFFF',
  },
  squaredCardBtnText: {
    fontSize: 12,
    fontWeight: '800',
    color: COLORS.primary,
  },
});
