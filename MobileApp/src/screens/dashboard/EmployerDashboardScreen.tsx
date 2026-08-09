import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  RefreshControl,
  StyleSheet,
  TouchableOpacity,
  Image,
} from 'react-native';
import {
  PlusCircle,
  Briefcase,
  Users,
  CheckCircle2,
  Clock,
  Building2,
  ChevronRight,
  ShieldCheck,
  MapPin,
  TrendingUp,
  UserCheck,
  BarChart3,
  PieChart,
  Target,
  Zap,
  Award,
  Calendar,
} from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../../hooks/useAuth';
import { jobsApi } from '../../api/jobsApi';
import { apiFetch } from '../../api/client';
import { Job } from '../../types';
import { Badge } from '../../components/common/Badge';
import { Skeleton, JobCardSkeleton } from '../../components/common/SkeletonLoader';
import { EmptyState } from '../../components/common/EmptyState';
import { ManageVacanciesModal } from '../../components/jobs/ManageVacanciesModal';
import { COLORS, TYPOGRAPHY, SPACING, RADIUS, SHADOWS } from '../../constants/theme';
import { Header } from '../../components/common/Header';

interface Props {
  navigation: any;
}

export const EmployerDashboardScreen: React.FC<Props> = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();

  const [jobs, setJobs] = useState<Job[]>([]);
  const [analytics, setAnalytics] = useState({
    totalJobs: 0,
    activeJobs: 0,
    totalApplications: 0,
    shortlisted: 0,
    interviewed: 0,
    hired: 0,
    rejected: 0,
    avgResponseTimeHours: 24,
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [manageVacanciesJob, setManageVacanciesJob] = useState<Job | null>(null);

  const fetchDashboardData = useCallback(async () => {
    setError(null);
    try {
      const [jobsRes, analyticsRes] = await Promise.all([
        jobsApi.getMyJobs(),
        apiFetch('/api/v1/jobs/employer/analytics').catch(() => ({ success: false, data: null })),
      ]);

      if (jobsRes.success && Array.isArray(jobsRes.data)) {
        setJobs(jobsRes.data);
      } else {
        setJobs([]);
      }

      if (analyticsRes.success && analyticsRes.data) {
        setAnalytics({
          totalJobs: Number(analyticsRes.data.totalJobs || 0),
          activeJobs: Number(analyticsRes.data.activeJobs || 0),
          totalApplications: Number(analyticsRes.data.totalApplications || 0),
          shortlisted: Number(analyticsRes.data.shortlisted || 0),
          interviewed: Number(analyticsRes.data.interviewed || 0),
          hired: Number(analyticsRes.data.hired || 0),
          rejected: Number(analyticsRes.data.rejected || 0),
          avgResponseTimeHours: Number(analyticsRes.data.avgResponseTimeHours || 24),
        });
      }
    } catch (err: any) {
      setError(err.message || 'Failed to fetch employer dashboard data');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchDashboardData();
  };

  const totalJobs = jobs.length;
  const activeJobs = jobs.filter((j) => (j.status || '').toUpperCase() === 'APPROVED').length;
  const pendingJobs = jobs.filter((j) => (j.status || '').toUpperCase() === 'PENDING_REVIEW' || (j.status || '').toUpperCase() === 'PENDING').length;
  const totalApplicants = jobs.reduce((acc, j) => acc + (j.applicants_count || 0), 0);

  const companyName = user?.companyName || user?.company_name || 'Industrial Enterprise';
  const companyLogo = user?.companyLogo || user?.company_logo;

  // 1. Dynamic Regional Location Breakdown from Employer's actual jobs in DB
  const locationMap: { [key: string]: number } = {};
  jobs.forEach((j) => {
    if (j.location) {
      const cleanLoc = j.location.split(',')[0].trim();
      locationMap[cleanLoc] = (locationMap[cleanLoc] || 0) + (j.applicants_count || 1);
    }
  });
  const sortedLocs = Object.entries(locationMap).sort((a, b) => b[1] - a[1]);
  const totalLocVolume = Object.values(locationMap).reduce((a, b) => a + b, 0) || 1;
  const dynamicLocations = sortedLocs.length > 0 ? sortedLocs.slice(0, 3).map(([locName, val]) => ({
    name: locName,
    pct: Math.round((val / totalLocVolume) * 100),
  })) : [
    { name: 'No Active Locations', pct: 0 },
  ];

  // 2. Dynamic Technical Trade Demand Breakdown from Employer's actual jobs in DB
  const tradeMap: { [key: string]: number } = {};
  jobs.forEach((j) => {
    const cleanTrade = j.trade || j.industry;
    if (cleanTrade) {
      tradeMap[cleanTrade] = (tradeMap[cleanTrade] || 0) + (j.applicants_count || 1);
    }
  });
  const sortedTrades = Object.entries(tradeMap).sort((a, b) => b[1] - a[1]);
  const totalTradeVolume = Object.values(tradeMap).reduce((a, b) => a + b, 0) || 1;
  const dynamicTrades = sortedTrades.length > 0 ? sortedTrades.slice(0, 3).map(([tName, val]) => ({
    name: tName,
    pct: Math.round((val / totalTradeVolume) * 100),
  })) : [
    { name: 'No Active Trades', pct: 0 },
  ];

  if (loading && !refreshing) {
    return (
      <View style={styles.container}>
        <Header title="JobMarket" subtitle="Industrial & Factory Jobs" showBack={false} />
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {/* Minimal Hero Header Skeleton */}
          <View style={styles.minimalHeroCard}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
              <Skeleton width={44} height={44} style={{ borderRadius: 10 }} />
              <View style={{ flex: 1, gap: 6 }}>
                <Skeleton width="55%" height={16} style={{ borderRadius: 4 }} />
                <Skeleton width="40%" height={12} style={{ borderRadius: 4 }} />
              </View>
            </View>
          </View>

          {/* 4 Metric Cards Grid Skeleton */}
          <View style={styles.metricsGrid}>
            {[1, 2, 3, 4].map((k) => (
              <View key={k} style={styles.metricCard}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                  <Skeleton width="55%" height={12} style={{ borderRadius: 4 }} />
                  <Skeleton width={24} height={24} style={{ borderRadius: 6 }} />
                </View>
                <Skeleton width="40%" height={24} style={{ borderRadius: 4 }} />
              </View>
            ))}
          </View>

          {/* Analytics Funnel Card Skeleton */}
          <View style={styles.analyticsCard}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16 }}>
              <Skeleton width="45%" height={16} style={{ borderRadius: 4 }} />
              <Skeleton width={70} height={20} style={{ borderRadius: 10 }} />
            </View>
            {[1, 2, 3, 4].map((k) => (
              <View key={k} style={{ marginBottom: 12 }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 }}>
                  <Skeleton width="45%" height={12} style={{ borderRadius: 4 }} />
                  <Skeleton width="25%" height={12} style={{ borderRadius: 4 }} />
                </View>
                <Skeleton width="100%" height={8} style={{ borderRadius: 4 }} />
              </View>
            ))}
          </View>

          {/* Locations & Trades 2-Col Skeleton */}
          <View style={styles.analyticsTwoColRow}>
            <View style={styles.subAnalyticsCard}>
              <Skeleton width="60%" height={14} style={{ borderRadius: 4, marginBottom: 12 }} />
              <Skeleton width="100%" height={8} style={{ borderRadius: 4, marginBottom: 8 }} />
              <Skeleton width="100%" height={8} style={{ borderRadius: 4, marginBottom: 8 }} />
              <Skeleton width="100%" height={8} style={{ borderRadius: 4 }} />
            </View>
            <View style={styles.subAnalyticsCard}>
              <Skeleton width="60%" height={14} style={{ borderRadius: 4, marginBottom: 12 }} />
              <Skeleton width="100%" height={8} style={{ borderRadius: 4, marginBottom: 8 }} />
              <Skeleton width="100%" height={8} style={{ borderRadius: 4, marginBottom: 8 }} />
              <Skeleton width="100%" height={8} style={{ borderRadius: 4 }} />
            </View>
          </View>

          {/* Recent Jobs Header & Cards Skeleton */}
          <View style={{ marginVertical: 12 }}>
            <Skeleton width="40%" height={16} style={{ borderRadius: 4, marginBottom: 12 }} />
            <JobCardSkeleton />
            <JobCardSkeleton />
          </View>
        </ScrollView>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Header title="JobMarket" subtitle="Industrial & Factory Jobs" showBack={false} />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[COLORS.primary]} />}
      >
        {/* Minimal Hero Header Card */}
        <View style={styles.minimalHeroCard}>
          <View style={styles.heroRow}>
            <TouchableOpacity
              style={{ flexDirection: 'row', alignItems: 'center', flex: 1, gap: 10 }}
              activeOpacity={0.7}
              onPress={() => navigation.navigate('CompanyProfile')}
            >
              <View style={styles.companyLogoBox}>
                {companyLogo ? (
                  <Image source={{ uri: companyLogo }} style={styles.companyLogoImage} />
                ) : (
                  <Building2 size={20} color={COLORS.primary} />
                )}
              </View>

              <View style={{ flex: 1 }}>
                <View style={styles.nameVerifiedRow}>
                  <Text style={styles.companyNameText} numberOfLines={1}>
                    {companyName}
                  </Text>
                  <View style={styles.verifiedPill}>
                    <ShieldCheck size={11} color="#16A34A" />
                  </View>
                </View>
                <Text style={styles.companySubtitleText}>
                  {totalJobs} Jobs Posted • {totalApplicants} Applicants
                </Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>

        {/* 4 Metric Cards Grid - Minimal & Perfectly Aligned */}
        <View style={styles.metricsGrid}>
          <View style={styles.metricCard}>
            <View style={styles.metricHeaderRow}>
              <Text style={styles.metricLabelText}>Total Jobs</Text>
              <View style={[styles.miniIconSquircle, { backgroundColor: '#EFF6FF' }]}>
                <Briefcase size={14} color="#2563EB" />
              </View>
            </View>
            <Text style={styles.metricValueText}>{loading ? '-' : totalJobs}</Text>
          </View>

          <View style={styles.metricCard}>
            <View style={styles.metricHeaderRow}>
              <Text style={styles.metricLabelText}>Approved Active</Text>
              <View style={[styles.miniIconSquircle, { backgroundColor: '#F0FDF4' }]}>
                <CheckCircle2 size={14} color="#16A34A" />
              </View>
            </View>
            <Text style={styles.metricValueText}>{loading ? '-' : activeJobs}</Text>
          </View>

          <View style={styles.metricCard}>
            <View style={styles.metricHeaderRow}>
              <Text style={styles.metricLabelText}>Pending Review</Text>
              <View style={[styles.miniIconSquircle, { backgroundColor: '#FEF3C7' }]}>
                <Clock size={14} color="#D97706" />
              </View>
            </View>
            <Text style={styles.metricValueText}>{loading ? '-' : pendingJobs}</Text>
          </View>

          <View style={styles.metricCard}>
            <View style={styles.metricHeaderRow}>
              <Text style={styles.metricLabelText}>Candidates</Text>
              <View style={[styles.miniIconSquircle, { backgroundColor: '#F0F9FF' }]}>
                <Users size={14} color="#0284C7" />
              </View>
            </View>
            <Text style={styles.metricValueText}>{loading ? '-' : totalApplicants}</Text>
          </View>
        </View>

        {/* Analytics Pipeline Card - 100% Real Database Analytics */}
        {(() => {
          const totalApps = analytics.totalApplications || jobs.reduce((acc, j) => acc + (j.applicants_count || 0), 0) || 0;
          const totalAppsSafe = totalApps || 1;
          const shortlistedPct = Math.min(100, Math.round((analytics.shortlisted / totalAppsSafe) * 100));
          const interviewedPct = Math.min(100, Math.round((analytics.interviewed / totalAppsSafe) * 100));
          const hiredPct = Math.min(100, Math.round((analytics.hired / totalAppsSafe) * 100));

          return (
            <View style={styles.analyticsCard}>
              <View style={styles.cardHeaderRow}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <BarChart3 size={16} color={COLORS.primary} />
                  <Text style={styles.cardSectionTitle}>Jobs & Candidate Analytics</Text>
                </View>
                <View style={styles.liveMetricsBadge}>
                  <TrendingUp size={10} color="#15803D" />
                  <Text style={styles.liveMetricsText}>Real-Time</Text>
                </View>
              </View>

              {/* Real-Time Conversion Pipeline */}
              <View style={styles.funnelItem}>
                <View style={styles.funnelLabelRow}>
                  <Text style={styles.funnelTitle}>1. Total Applications Received</Text>
                  <Text style={styles.funnelVal}>{totalApps} (100%)</Text>
                </View>
                <View style={styles.progressBg}>
                  <View style={[styles.progressFill, { width: totalApps > 0 ? '100%' : '0%', backgroundColor: '#2563EB' }]} />
                </View>
              </View>

              <View style={styles.funnelItem}>
                <View style={styles.funnelLabelRow}>
                  <Text style={styles.funnelTitle}>2. Shortlisted Candidates</Text>
                  <Text style={styles.funnelVal}>{analytics.shortlisted} ({totalApps > 0 ? shortlistedPct : 0}%)</Text>
                </View>
                <View style={styles.progressBg}>
                  <View style={[styles.progressFill, { width: `${totalApps > 0 ? shortlistedPct : 0}%`, backgroundColor: '#0284C7' }]} />
                </View>
              </View>

              <View style={styles.funnelItem}>
                <View style={styles.funnelLabelRow}>
                  <Text style={styles.funnelTitle}>3. Interview Scheduled</Text>
                  <Text style={styles.funnelVal}>{analytics.interviewed} ({totalApps > 0 ? interviewedPct : 0}%)</Text>
                </View>
                <View style={styles.progressBg}>
                  <View style={[styles.progressFill, { width: `${totalApps > 0 ? interviewedPct : 0}%`, backgroundColor: '#D97706' }]} />
                </View>
              </View>

              <View style={styles.funnelItem}>
                <View style={styles.funnelLabelRow}>
                  <Text style={styles.funnelTitle}>4. Hired / Offered</Text>
                  <Text style={styles.funnelVal}>{analytics.hired} ({totalApps > 0 ? hiredPct : 0}%)</Text>
                </View>
                <View style={styles.progressBg}>
                  <View style={[styles.progressFill, { width: `${totalApps > 0 ? hiredPct : 0}%`, backgroundColor: '#16A34A' }]} />
                </View>
              </View>
            </View>
          );
        })()}

        {/* Dynamic MIDC Region & Trade Breakdown */}
        <View style={styles.analyticsTwoColRow}>
          <View style={styles.subAnalyticsCard}>
            <View style={styles.subHeaderRow}>
              <MapPin size={13} color={COLORS.primary} />
              <Text style={styles.subHeaderTitle}>Job Locations</Text>
            </View>

            {dynamicLocations.map((item, idx) => (
              <View key={idx} style={{ marginBottom: 4 }}>
                <View style={styles.miniMetricRow}>
                  <Text style={styles.miniMetricLabel} numberOfLines={1}>{item.name}</Text>
                  <Text style={styles.miniMetricVal}>{item.pct}%</Text>
                </View>
                <View style={styles.miniBarBg}>
                  <View
                    style={[
                      styles.miniBarFill,
                      {
                        width: `${Math.max(item.pct, 8)}%`,
                        backgroundColor: idx === 0 ? '#2563EB' : idx === 1 ? '#16A34A' : '#D97706',
                      },
                    ]}
                  />
                </View>
              </View>
            ))}
          </View>

          <View style={styles.subAnalyticsCard}>
            <View style={styles.subHeaderRow}>
              <Zap size={13} color="#D97706" />
              <Text style={styles.subHeaderTitle}>Job Trades</Text>
            </View>

            {dynamicTrades.map((item, idx) => (
              <View key={idx} style={{ marginBottom: 4 }}>
                <View style={styles.miniMetricRow}>
                  <Text style={styles.miniMetricLabel} numberOfLines={1}>{item.name}</Text>
                  <Text style={styles.miniMetricVal}>{item.pct}%</Text>
                </View>
                <View style={styles.miniBarBg}>
                  <View
                    style={[
                      styles.miniBarFill,
                      {
                        width: `${Math.max(item.pct, 8)}%`,
                        backgroundColor: idx === 0 ? '#2563EB' : idx === 1 ? '#0284C7' : '#16A34A',
                      },
                    ]}
                  />
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* Recent Jobs Section */}
        <View style={styles.recentSectionHeader}>
          <Text style={styles.sectionTitleText}>RECENT JOB POSTINGS</Text>
          <TouchableOpacity onPress={() => navigation.navigate('MyJobs')}>
            <Text style={styles.viewAllText}>View All ({jobs.length})</Text>
          </TouchableOpacity>
        </View>

        {loading ? (
          <>
            <JobCardSkeleton />
            <JobCardSkeleton />
          </>
        ) : jobs.length === 0 ? (
          <EmptyState
            title="No Jobs Posted Yet"
            description="Start reaching thousands of skilled blue-collar workers by posting your first job."
            actionTitle="Post Your First Job"
            onAction={() => navigation.navigate('PostJob')}
          />
        ) : (
          jobs.slice(0, 5).map((job) => {
            const logoUri = job.companyLogo || (job as any).company_logo || companyLogo;
            return (
              <TouchableOpacity
                key={job.id}
                activeOpacity={0.9}
                onPress={() => navigation.navigate('JobApplicants', { jobId: job.id, jobTitle: job.title })}
                style={styles.recentJobCard}
              >
                {/* Header Row: Company Logo + Title + Status Badge + Meta */}
                <View style={styles.jobCardHeaderRow}>
                  <View style={styles.companyLogoBox}>
                    {logoUri ? (
                      <Image source={{ uri: logoUri }} style={styles.companyLogoImage} />
                    ) : (
                      <Building2 size={22} color={COLORS.primary} />
                    )}
                  </View>

                  <View style={styles.headerTextCol}>
                    <View style={styles.titleBadgeRow}>
                      <Text style={styles.jobTitleText} numberOfLines={1}>
                        {job.title}
                      </Text>
                      <Badge status={job.status} />
                    </View>

                    <Text style={styles.recentCompanyNameText} numberOfLines={1}>
                      {job.company || companyName}
                    </Text>

                    <View style={styles.metaRow}>
                      <View style={styles.tradeBadge}>
                        <Text style={styles.tradeBadgeText}>
                          {job.trade || job.industry || 'Industrial'}
                        </Text>
                      </View>

                      <View style={styles.locationPill}>
                        <MapPin size={12} color={COLORS.slate500} />
                        <Text style={styles.locationText} numberOfLines={1}>
                          {job.location}
                        </Text>
                      </View>
                    </View>
                  </View>
                </View>

                {/* Details Bar: Salary Tag + Openings Tag */}
                <View style={styles.detailsRow}>
                  <View style={styles.salaryTag}>
                    <Text style={styles.salaryLabel}>SALARY</Text>
                    <Text style={styles.salaryText}>
                      ₹{job.salary_min?.toLocaleString()} - ₹{job.salary_max?.toLocaleString()} / mo
                    </Text>
                  </View>

                  <TouchableOpacity
                    style={styles.openingsTag}
                    activeOpacity={0.8}
                    onPress={() => setManageVacanciesJob(job)}
                  >
                    <Briefcase size={12} color={COLORS.primary} />
                    <Text style={styles.openingsText}>
                      {job.filledOpenings || (job as any).filled_openings || 0} / {job.openings || 1} Vacancies
                    </Text>
                  </TouchableOpacity>
                </View>

                {/* Footer Bar: Applicants Count Button + Adjust Vacancies Button */}
                <View style={styles.cardFooter}>
                  <TouchableOpacity
                    style={styles.applicantBtn}
                    activeOpacity={0.8}
                    onPress={() => navigation.navigate('JobApplicants', { jobId: job.id, jobTitle: job.title })}
                  >
                    <Users size={14} color={COLORS.primary} />
                    <Text style={styles.applicantBtnText}>
                      {job.applicants_count || 0} Candidates
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.adjustVacanciesBtn}
                    activeOpacity={0.8}
                    onPress={() => setManageVacanciesJob(job)}
                  >
                    <Briefcase size={13} color="#0284C7" />
                    <Text style={styles.adjustVacanciesBtnText}>Adjust Vacancies</Text>
                  </TouchableOpacity>
                </View>
              </TouchableOpacity>
            );
          })
        )}
      </ScrollView>

      {/* Live Vacancy Adjustment Modal */}
      <ManageVacanciesModal
        visible={!!manageVacanciesJob}
        job={manageVacanciesJob}
        onClose={() => setManageVacanciesJob(null)}
        onSuccess={(updatedJob) => {
          setJobs((prev) => prev.map((j) => (j.id === updatedJob.id ? updatedJob : j)));
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollContent: {
    paddingHorizontal: SPACING.md,
    paddingTop: 8,
    paddingBottom: 130,
  },
  /* Minimal Hero Card */
  minimalHeroCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderBottomWidth: 2.5,
    borderBottomColor: '#CBD5E1',
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 8,
  },
  heroRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  companyLogoBox: {
    width: 38,
    height: 38,
    borderRadius: 6,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  companyLogoImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  nameVerifiedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  companyNameText: {
    ...TYPOGRAPHY.h2,
    fontSize: 14.5,
    fontWeight: '800',
    color: '#0F172A',
  },
  verifiedPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 6,
    paddingVertical: 1.5,
    borderRadius: 4,
  },
  verifiedPillText: {
    fontSize: 9.5,
    fontWeight: '700',
    color: '#15803D',
  },
  companySubtitleText: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 1,
  },
  compactPostBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: COLORS.primary,
    paddingHorizontal: 9,
    paddingVertical: 6,
    borderRadius: 5,
  },
  compactPostBtnText: {
    color: COLORS.textWhite,
    fontSize: 11.5,
    fontWeight: '700',
  },

  /* Metrics Grid */
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: 8,
    marginBottom: 8,
  },
  metricCard: {
    width: '48.5%',
    minHeight: 76,
    backgroundColor: '#FFFFFF',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderBottomWidth: 2.5,
    borderBottomColor: '#CBD5E1',
    paddingHorizontal: 10,
    paddingVertical: 8,
    justifyContent: 'space-between',
  },
  metricHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 2,
  },
  metricLabelText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#64748B',
  },
  miniIconSquircle: {
    width: 24,
    height: 24,
    borderRadius: 5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  metricValueText: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
  },

  /* Quick Actions Row */
  quickActionsRow: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 8,
  },
  quickActionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    paddingVertical: 8,
    borderRadius: 5,
    borderWidth: 1,
    borderBottomWidth: 2,
  },
  quickActionText: {
    fontSize: 11.5,
    fontWeight: '700',
  },

  /* Minimal Analytics Card */
  analyticsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderBottomWidth: 2.5,
    borderBottomColor: '#CBD5E1',
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 8,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
    paddingBottom: 4,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  cardSectionTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0F172A',
  },
  liveMetricsBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 6,
    paddingVertical: 1.5,
    borderRadius: 4,
  },
  liveMetricsText: {
    fontSize: 9.5,
    fontWeight: '700',
    color: '#15803D',
  },
  funnelItem: {
    marginBottom: 6,
  },
  funnelLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 2,
  },
  funnelTitle: {
    fontSize: 11,
    fontWeight: '600',
    color: '#334155',
  },
  funnelVal: {
    fontSize: 11,
    fontWeight: '700',
    color: '#2563EB',
  },
  progressBg: {
    height: 5,
    backgroundColor: '#F1F5F9',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },

  /* 2-Column Analytics Sub Cards */
  analyticsTwoColRow: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 8,
  },
  subAnalyticsCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderBottomWidth: 2.5,
    borderBottomColor: '#CBD5E1',
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  subHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 6,
    paddingBottom: 3,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  subHeaderTitle: {
    fontSize: 11.5,
    fontWeight: '800',
    color: '#0F172A',
  },
  miniMetricRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 4,
    marginBottom: 2,
  },
  miniMetricLabel: {
    fontSize: 10.5,
    fontWeight: '600',
    color: '#475569',
  },
  miniMetricVal: {
    fontSize: 10,
    fontWeight: '700',
    color: '#0F172A',
  },
  miniBarBg: {
    height: 4,
    backgroundColor: '#F1F5F9',
    borderRadius: 2,
    overflow: 'hidden',
  },
  miniBarFill: {
    height: '100%',
    borderRadius: 2,
  },

  /* Recent Jobs Header */
  recentSectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
    marginTop: 2,
  },
  sectionTitleText: {
    fontSize: 10.5,
    fontWeight: '800',
    color: '#94A3B8',
    letterSpacing: 0.6,
  },
  viewAllText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: COLORS.primary,
  },
  recentJobCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderBottomWidth: 2.5,
    borderBottomColor: '#CBD5E1',
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 8,
    shadowColor: '#64748B',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 2,
    elevation: 1,
  },
  jobCardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  headerTextCol: {
    flex: 1,
    marginLeft: 8,
  },
  titleBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 6,
  },
  jobTitleText: {
    fontSize: 14.5,
    fontWeight: '800',
    color: '#0F172A',
    flex: 1,
    letterSpacing: -0.2,
  },
  recentCompanyNameText: {
    fontSize: 11.5,
    color: '#475569',
    fontWeight: '500',
    marginTop: 1,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 4,
  },
  tradeBadge: {
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#BFDBFE',
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 1.5,
  },
  tradeBadgeText: {
    color: '#2563EB',
    fontSize: 10,
    fontWeight: '700',
  },
  locationPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    flex: 1,
  },
  locationText: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '500',
  },
  detailsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 5,
    paddingHorizontal: 8,
    paddingVertical: 5,
    marginBottom: 6,
  },
  salaryTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  salaryLabel: {
    fontSize: 9.5,
    fontWeight: '800',
    color: '#64748B',
    letterSpacing: 0.5,
  },
  salaryText: {
    fontSize: 11.5,
    fontWeight: '800',
    color: COLORS.primary,
  },
  openingsTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  openingsText: {
    fontSize: 10.5,
    fontWeight: '700',
    color: '#334155',
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 6,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  applicantBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  applicantBtnText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: COLORS.primary,
  },
  adjustVacanciesBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#F0F9FF',
    borderWidth: 1,
    borderColor: '#BAE6FD',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 5,
  },
  adjustVacanciesBtnText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#0284C7',
  },
});
