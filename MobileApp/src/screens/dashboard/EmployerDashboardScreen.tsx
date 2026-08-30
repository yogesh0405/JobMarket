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
  Building2,
  ChevronRight,
  ShieldCheck,
  MapPin,
  Zap,
} from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../../hooks/useAuth';
import { jobsApi } from '../../api/jobsApi';
import { apiFetch } from '../../api/client';
import { Job } from '../../types';
import { Badge } from '../../components/common/Badge';
import { Skeleton, JobCardSkeleton } from '../../components/common/SkeletonLoader';
import { EmptyState } from '../../components/common/EmptyState';
import { ManageVacanciesModal } from '../../components/jobs/ManageVacanciesModal';
import { COLORS, RADIUS } from '../../constants/theme';
import { Header } from '../../components/common/Header';
import { CompanyLogoAvatar } from '../../components/common/CompanyLogoAvatar';
import { EmployerDashboardHeader } from './components/EmployerDashboardHeader';

interface Props {
  navigation: any;
}

export const EmployerDashboardScreen: React.FC<Props> = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();

  const [jobs, setJobs] = useState<Job[]>([]);
  const [realCandidates, setRealCandidates] = useState<any[]>([]);
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
      const [jobsRes, analyticsRes, candidatesRes] = await Promise.all([
        jobsApi.getMyJobs(),
        apiFetch('/api/v1/jobs/employer/analytics').catch(() => ({ success: false, data: null })),
        apiFetch('/api/v1/jobs/workers/all').catch(() => ({ success: false, data: [] })),
      ]);

      if (jobsRes.success && Array.isArray(jobsRes.data)) {
        setJobs(jobsRes.data);
      } else {
        setJobs([]);
      }

      if (candidatesRes && candidatesRes.success && Array.isArray(candidatesRes.data)) {
        setRealCandidates(candidatesRes.data);
      } else {
        setRealCandidates([]);
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
  const pendingJobs = jobs.filter((j) => (j.status || '').toUpperCase() === 'PENDING').length;

  const companyName = user?.companyName || user?.company_name || user?.name || 'Industrial Enterprise';
  const companyLogo =
    user?.companyLogo ||
    user?.company_logo ||
    user?.profilePictureUrl ||
    'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=150&q=80';

  const totalApplicants = jobs.reduce((acc, j) => acc + (j.applicants_count || 0), 0);

  const dynamicLocations = React.useMemo(() => {
    if (jobs.length === 0) {
      return [
        { name: 'Waluj MIDC', pct: 60 },
        { name: 'Chakan MIDC', pct: 40 },
      ];
    }
    const counts: Record<string, number> = {};
    jobs.forEach((j) => {
      const loc = (j.location || ' Waluj MIDC').split(',')[0].trim();
      counts[loc] = (counts[loc] || 0) + 1;
    });

    const entries = Object.entries(counts).sort((a, b) => b[1] - a[1]);
    const top = entries.slice(0, 2);
    const sumTop = top.reduce((a, b) => a + b[1], 0) || 1;

    return top.map(([name, count]) => ({
      name,
      pct: Math.round((count / sumTop) * 100),
    }));
  }, [jobs]);

  const dynamicTrades = React.useMemo(() => {
    if (jobs.length === 0) {
      return [
        { name: 'VMC Operating', pct: 55 },
        { name: 'CNC Turning', pct: 45 },
      ];
    }
    const counts: Record<string, number> = {};
    jobs.forEach((j) => {
      const trd = j.trade || j.industry || j.title || 'CNC Operating';
      counts[trd] = (counts[trd] || 0) + 1;
    });

    const entries = Object.entries(counts).sort((a, b) => b[1] - a[1]);
    const top = entries.slice(0, 2);
    const sumTop = top.reduce((a, b) => a + b[1], 0) || 1;

    return top.map(([name, count]) => ({
      name,
      pct: Math.round((count / sumTop) * 100),
    }));
  }, [jobs]);

  return (
    <View style={styles.container}>
      <Header title="JobMarket" subtitle="Employer Dashboard" showBack={false} />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[COLORS.primary]} />}
      >
        <EmployerDashboardHeader
          companyName={companyName}
          companyLogo={companyLogo}
          totalJobs={totalJobs}
          activeJobs={activeJobs}
          pendingJobs={pendingJobs}
          totalApplicants={totalApplicants}
          loading={loading}
          analytics={analytics}
          onPostJobPress={() => navigation.navigate('PostJob')}
          onCompanyPress={() => navigation.navigate('EmployerProfileTab')}
        />

        {/* Dynamic Regional & Trade Breakdown */}
        <View style={styles.analyticsTwoColRow}>
          <View style={styles.subAnalyticsCard}>
            <View style={styles.subHeaderRow}>
              <MapPin size={13} color={COLORS.primary} />
              <Text style={styles.subHeaderTitle}>Job Locations</Text>
            </View>

            {dynamicLocations.map((item, idx) => (
              <View key={idx} style={{ marginBottom: 6 }}>
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
                        backgroundColor: idx === 0 ? COLORS.primary : idx === 1 ? '#16A34A' : '#D97706',
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
              <View key={idx} style={{ marginBottom: 6 }}>
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
                        backgroundColor: idx === 0 ? COLORS.primary : idx === 1 ? '#0284C7' : '#16A34A',
                      },
                    ]}
                  />
                </View>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.sectionDividerSlate} />

        {/* Candidates Section */}
        <View style={styles.recentSectionHeader}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <Users size={16} color={COLORS.primary} />
            <Text style={styles.sectionTitleText}>REAL CANDIDATES IN DATABASE</Text>
          </View>
          <TouchableOpacity onPress={() => navigation.navigate('CandidatesTab')}>
            <Text style={styles.viewAllText}>View All ({realCandidates.length}) →</Text>
          </TouchableOpacity>
        </View>

        {loading ? (
          <View style={styles.candidatesSingleCard}>
            <Skeleton width="100%" height={60} style={{ borderRadius: 0 }} />
          </View>
        ) : realCandidates.length === 0 ? (
          <View style={styles.emptyCandidatesCard}>
            <Users size={28} color="#94A3B8" />
            <Text style={styles.emptyCandidatesTitle}>No Registered Candidates Found</Text>
            <Text style={styles.emptyCandidatesSubtitle}>
              Real candidates registered in the database will be listed here.
            </Text>
          </View>
        ) : (
          <View style={styles.candidatesSingleCard}>
            {realCandidates.slice(0, 4).map((c: any, index: number, arr: any[]) => {
              const photoUri = c.profilePictureUrl || c.profile_picture_url || c.avatar_url || c.avatarUrl || c.avatar;
              const candidateName = c.name || c.displayName || c.fullName || 'Registered Candidate';
              const tradeText = c.headline || c.trade_specialization || c.trade || c.role || 'Skilled Industrial Worker';
              const locationText = c.location || c.address || 'MIDC Industrial Zone';
              const isLast = index === arr.length - 1;

              return (
                <TouchableOpacity
                  key={c.id || `candidate-${index}`}
                  activeOpacity={0.8}
                  style={[
                    styles.candidateRowItem,
                    isLast && { borderBottomWidth: 0 },
                  ]}
                  onPress={() => navigation.navigate('CandidateDetail', { candidate: c })}
                >
                  <CompanyLogoAvatar
                    logoUrl={photoUri}
                    companyName={candidateName}
                    size={36}
                    borderRadius={0}
                    style={{ marginRight: 10 }}
                  />
                  <View style={{ flex: 1, paddingRight: 4 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
                      <Text style={styles.candidateNameText} numberOfLines={1}>
                        {candidateName}
                      </Text>
                      {c.aadhaar_verified ? (
                        <View style={styles.verifiedPill}>
                          <ShieldCheck size={10} color="#15803D" />
                        </View>
                      ) : null}
                    </View>
                    <Text style={styles.candidateTradeText} numberOfLines={1}>
                      {tradeText}
                    </Text>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 }}>
                      <MapPin size={11} color="#64748B" />
                      <Text style={styles.candidateLocationText} numberOfLines={1}>
                        {locationText}
                      </Text>
                    </View>
                  </View>
                  <ChevronRight size={16} color="#94A3B8" />
                </TouchableOpacity>
              );
            })}
          </View>
        )}

        <View style={styles.sectionDividerSlate} />

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
                onPress={() => navigation.navigate('ApplicantsTab', { jobId: job.id, jobTitle: job.title })}
                style={styles.recentJobCard}
              >
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

                <View style={styles.cardFooter}>
                  <TouchableOpacity
                    style={styles.applicantBtn}
                    activeOpacity={0.8}
                    onPress={() => navigation.navigate('ApplicantsTab', { jobId: job.id, jobTitle: job.title })}
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
    backgroundColor: '#F7F7F7',
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 120,
  },
  analyticsTwoColRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 8,
  },
  subAnalyticsCard: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    borderRadius: RADIUS.card,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    padding: 10,
  },
  subHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 8,
  },
  subHeaderTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: '#0F172A',
  },
  miniMetricRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  miniMetricLabel: {
    fontSize: 11,
    color: '#475569',
    fontWeight: '600',
    flex: 1,
  },
  miniMetricVal: {
    fontSize: 11,
    fontWeight: '800',
    color: '#0F172A',
  },
  miniBarBg: {
    height: 4,
    backgroundColor: '#E2E8F0',
    borderRadius: 2,
    overflow: 'hidden',
    marginTop: 2,
  },
  miniBarFill: {
    height: '100%',
    borderRadius: 2,
  },
  sectionDividerSlate: {
    height: 1,
    backgroundColor: '#94A3B8',
    marginVertical: 16,
  },
  recentSectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  sectionTitleText: {
    fontSize: 12,
    fontWeight: '800',
    color: COLORS.primary,
    letterSpacing: 0.6,
  },
  viewAllText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.primary,
  },
  candidatesSingleCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: RADIUS.card,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    paddingHorizontal: 12,
  },
  candidateRowItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  candidateNameText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0F172A',
  },
  verifiedPill: {
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 4,
  },
  candidateTradeText: {
    fontSize: 11.5,
    color: '#0284C7',
    fontWeight: '600',
  },
  candidateLocationText: {
    fontSize: 10.5,
    color: '#64748B',
  },
  emptyCandidatesCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: RADIUS.card,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    padding: 20,
    alignItems: 'center',
  },
  emptyCandidatesTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
    marginTop: 8,
  },
  emptyCandidatesSubtitle: {
    fontSize: 11.5,
    color: '#64748B',
    textAlign: 'center',
    marginTop: 2,
  },
  recentJobCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: RADIUS.card,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    padding: 12,
    marginBottom: 10,
  },
  jobCardHeaderRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 10,
  },
  companyLogoBox: {
    width: 44,
    height: 44,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    backgroundColor: '#F8FAFC',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  companyLogoImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'contain',
  },
  headerTextCol: {
    flex: 1,
    minWidth: 0,
  },
  titleBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 6,
  },
  jobTitleText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
    flex: 1,
  },
  recentCompanyNameText: {
    fontSize: 11.5,
    fontWeight: '600',
    color: '#64748B',
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
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  tradeBadgeText: {
    fontSize: 10.5,
    fontWeight: '700',
    color: COLORS.primary,
  },
  locationPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  locationText: {
    fontSize: 10.5,
    color: '#64748B',
  },
  detailsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F8FAFC',
    borderRadius: 6,
    padding: 8,
    marginBottom: 10,
  },
  salaryTag: {},
  salaryLabel: {
    fontSize: 9.5,
    fontWeight: '800',
    color: '#64748B',
  },
  salaryText: {
    fontSize: 11.5,
    fontWeight: '800',
    color: '#0F172A',
  },
  openingsTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  openingsText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: COLORS.primary,
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    paddingTop: 8,
  },
  applicantBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  applicantBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.primary,
  },
  adjustVacanciesBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  adjustVacanciesBtnText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#0284C7',
  },
});
