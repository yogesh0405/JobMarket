import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
  Linking,
} from 'react-native';
import {
  Briefcase,
  MapPin,
  Clock,
  Calendar,
  IndianRupee,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  ChevronRight,
  ClipboardList,
  Send,
  Award,
} from 'lucide-react-native';
import { useFocusEffect } from '@react-navigation/native';
import { candidateApi } from '../../api/candidateApi';
import { Header } from '../../components/common/Header';
import { Skeleton as SkeletonLoader } from '../../components/common/SkeletonLoader';
import { COLORS, RADIUS } from '../../constants/theme';
import { useToast } from '../../context/ToastContext';
import { CompanyLogoAvatar } from '../../components/common/CompanyLogoAvatar';
import { getCompanyLogoUrl } from '../../utils/companyLogos';
import { appliedJobsStore, normalizeApplicationStatus } from '../../utils/appliedJobsStore';

interface Props {
  navigation: any;
}

export const CandidateAppliedJobsScreen: React.FC<Props> = ({ navigation }) => {
  const { showToast } = useToast();
  const [appliedList, setAppliedList] = useState<any[]>(appliedJobsStore.getAppliedJobs());
  const [loading, setLoading] = useState(appliedJobsStore.getAppliedJobs().length === 0);
  const [refreshing, setRefreshing] = useState(false);
  const [filterTab, setFilterTab] = useState<'ALL' | 'INTERVIEW' | 'REVIEW' | 'DECISIONS'>('ALL');

  // Filter application list based on active tab
  const filteredApplications = appliedList.filter((item: any) => {
    const rawStatus = item.status || item.applicationStatus || item.job?.status;
    const s = normalizeApplicationStatus(rawStatus);
    if (filterTab === 'INTERVIEW') {
      return s === 'shortlisted';
    }
    if (filterTab === 'REVIEW') {
      return s === 'applied' || s === 'reviewed';
    }
    if (filterTab === 'DECISIONS') {
      return s === 'hired' || s === 'rejected';
    }
    return true;
  });

  const interviewCount = appliedList.filter((item: any) => {
    const rawStatus = item.status || item.applicationStatus || item.job?.status;
    const s = normalizeApplicationStatus(rawStatus);
    return s === 'shortlisted';
  }).length;

  const reviewCount = appliedList.filter((item: any) => {
    const rawStatus = item.status || item.applicationStatus || item.job?.status;
    const s = normalizeApplicationStatus(rawStatus);
    return s === 'applied' || s === 'reviewed';
  }).length;

  const decisionsCount = appliedList.filter((item: any) => {
    const rawStatus = item.status || item.applicationStatus || item.job?.status;
    const s = normalizeApplicationStatus(rawStatus);
    return s === 'hired' || s === 'rejected';
  }).length;

  const syncListWithStore = useCallback((apiData?: any[]) => {
    if (apiData && Array.isArray(apiData)) {
      appliedJobsStore.setAppliedJobs(apiData);
    }
    setAppliedList([...appliedJobsStore.getAppliedJobs()]);
  }, []);

  const isFetchingRef = React.useRef(false);

  const fetchAppliedData = useCallback(async (showSkeleton = false) => {
    if (isFetchingRef.current) return;
    isFetchingRef.current = true;
    if (showSkeleton && appliedJobsStore.getAppliedJobs().length === 0) setLoading(true);
    try {
      const res = await candidateApi.getAppliedJobs();
      if (res.success && Array.isArray(res.data)) {
        syncListWithStore(res.data);
      } else {
        syncListWithStore();
      }
    } catch (e: any) {
      // Graceful error catch for unauthenticated applied jobs load
      syncListWithStore();
    } finally {
      isFetchingRef.current = false;
      setLoading(false);
      setRefreshing(false);
    }
  }, [syncListWithStore]);

  // Subscribe to appliedJobsStore & safe periodic sync when active
  useEffect(() => {
    fetchAppliedData(false);
    const interval = setInterval(() => {
      fetchAppliedData(false);
    }, 30000);

    const unsubscribe = appliedJobsStore.subscribe(() => {
      setAppliedList([...appliedJobsStore.getAppliedJobs()]);
    });

    return () => {
      clearInterval(interval);
      unsubscribe();
    };
  }, [fetchAppliedData]);

  useFocusEffect(
    useCallback(() => {
      const hasPending = appliedJobsStore.consumePendingRefresh();
      const showSkeleton = hasPending || appliedJobsStore.getAppliedJobs().length === 0;
      fetchAppliedData(showSkeleton);
    }, [fetchAppliedData])
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchAppliedData(false);
  };

  const handleOpenMaps = (url?: string) => {
    if (!url) {
      showToast('Maps location link unavailable', 'warning');
      return;
    }
    Linking.openURL(url).catch(() => {
      showToast('Could not open map link', 'error');
    });
  };

  const renderStatusBadge = (status?: string) => {
    const s = (status || 'applied').toLowerCase();
    let bg = '#EFF6FF';
    let border = '#DBEAFE';
    let color = COLORS.primary;
    let label = 'APPLIED';
    let IconComp = Send;

    if (s === 'reviewed' || s === 'under_review') {
      bg = '#EFF6FF';
      border = '#DBEAFE';
      color = COLORS.primary;
      label = 'UNDER REVIEW';
      IconComp = Clock;
    } else if (s === 'shortlisted') {
      bg = '#F0FDF4';
      border = '#BBF7D0';
      color = '#15803D';
      label = 'SHORTLISTED';
      IconComp = Award;
    } else if (s === 'interview' || s === 'interview_scheduled') {
      bg = '#FEF3C7';
      border = '#FDE68A';
      color = '#D97706';
      label = 'INTERVIEW';
      IconComp = Calendar;
    } else if (s === 'hired' || s === 'selected' || s === 'accepted') {
      bg = '#DCFCE7';
      border = '#86EFAC';
      color = '#16A34A';
      label = 'HIRED';
      IconComp = CheckCircle2;
    } else if (s === 'rejected') {
      bg = '#FEF2F2';
      border = '#FECACA';
      color = '#DC2626';
      label = 'REJECTED';
      IconComp = AlertCircle;
    }

    return (
      <View style={[styles.statusPillBadge, { backgroundColor: bg, borderColor: border }]}>
        <IconComp size={11} color={color} strokeWidth={2.2} />
        <Text style={[styles.statusPillBadgeText, { color }]}>{label}</Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Header title="JobMarket" subtitle="Applied Jobs" showBack={false} />

      {/* Standard Underline Tabular Menu Bar */}
      <View style={styles.tabBarContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabBarScroll}>
          <TouchableOpacity
            activeOpacity={0.7}
            style={[styles.tabItem, filterTab === 'ALL' && styles.tabItemActive]}
            onPress={() => setFilterTab('ALL')}
          >
            <Text style={[styles.tabItemText, filterTab === 'ALL' && styles.tabItemTextActive]}>
              All ({appliedList.length})
            </Text>
            {filterTab === 'ALL' && <View style={styles.tabUnderline} />}
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.7}
            style={[styles.tabItem, filterTab === 'INTERVIEW' && styles.tabItemActive]}
            onPress={() => setFilterTab('INTERVIEW')}
          >
            <Text style={[styles.tabItemText, filterTab === 'INTERVIEW' && styles.tabItemTextActive]}>
              Interviews ({interviewCount})
            </Text>
            {filterTab === 'INTERVIEW' && <View style={styles.tabUnderline} />}
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.7}
            style={[styles.tabItem, filterTab === 'REVIEW' && styles.tabItemActive]}
            onPress={() => setFilterTab('REVIEW')}
          >
            <Text style={[styles.tabItemText, filterTab === 'REVIEW' && styles.tabItemTextActive]}>
              Under Review ({reviewCount})
            </Text>
            {filterTab === 'REVIEW' && <View style={styles.tabUnderline} />}
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.7}
            style={[styles.tabItem, filterTab === 'DECISIONS' && styles.tabItemActive]}
            onPress={() => setFilterTab('DECISIONS')}
          >
            <Text style={[styles.tabItemText, filterTab === 'DECISIONS' && styles.tabItemTextActive]}>
              Decisions ({decisionsCount})
            </Text>
            {filterTab === 'DECISIONS' && <View style={styles.tabUnderline} />}
          </TouchableOpacity>
        </ScrollView>
      </View>

      {loading && !refreshing ? (
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {/* Realistic Applied card skeletons */}
          {[1, 2, 3].map((key) => (
            <View key={key} style={styles.appliedCardSquare}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                <SkeletonLoader width={44} height={44} style={{ borderRadius: RADIUS.card }} />
                <View style={{ flex: 1, gap: 6 }}>
                  <SkeletonLoader width="70%" height={16} style={{ borderRadius: RADIUS.xs }} />
                  <SkeletonLoader width="50%" height={12} style={{ borderRadius: RADIUS.xs }} />
                </View>
                <SkeletonLoader width={80} height={22} style={{ borderRadius: RADIUS.sm }} />
              </View>

              <View style={{ flexDirection: 'row', gap: 8, marginTop: 6 }}>
                <SkeletonLoader width={95} height={22} style={{ borderRadius: RADIUS.xs }} />
                <SkeletonLoader width={120} height={22} style={{ borderRadius: RADIUS.xs }} />
              </View>
            </View>
          ))}
        </ScrollView>
      ) : (
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[COLORS.primary]} />}
        >

          {filteredApplications.length === 0 ? (
            <View style={styles.emptyCard}>
              <View style={styles.emptyIconCircle}>
                <Briefcase size={28} color={COLORS.primary} strokeWidth={2.2} />
              </View>
              <Text style={styles.emptyTitle}>
                {filterTab === 'ALL' ? 'No Active Applications' : 'No Applications Found'}
              </Text>
              <Text style={styles.emptyDesc}>
                {filterTab === 'ALL'
                  ? "You haven't submitted any job applications yet. Browse factory vacancies and apply today!"
                  : `No job applications currently match the "${filterTab.toLowerCase()}" filter.`}
              </Text>
              <TouchableOpacity
                activeOpacity={0.85}
                style={styles.findJobsBtn}
                onPress={() => navigation.navigate('CandidateJobsTab')}
              >
                <Text style={styles.findJobsBtnText}>Explore Jobs & Vacancies</Text>
              </TouchableOpacity>
            </View>
          ) : (
            filteredApplications.map((item: any) => {
              const job = item.job || item;
              const targetJobId = item.jobId || job.id || job._id;
              const status = (item.status || 'applied').toLowerCase();
              const isShortlisted = status === 'shortlisted' || status === 'interview' || status === 'interview_scheduled';
              const rawLogo = job.companyLogo || job.company_logo || job.logoUrl || job.logo_url || job.logo || item.companyLogo || item.company_logo || (job as any).companyLogoUrl;
              const logoUrl = getCompanyLogoUrl(job.company || 'Enterprise', rawLogo);
              const appliedDateFormatted = item.appliedAt
                ? new Date(item.appliedAt).toLocaleDateString('en-IN', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                  })
                : 'Recently';

              const hasSalary = Boolean(
                (job.salary_max && Number(job.salary_max) > 0) ||
                (job.salaryMax && Number(job.salaryMax) > 0) ||
                (job.salary_min && Number(job.salary_min) > 0) ||
                (job.salaryMin && Number(job.salaryMin) > 0)
              );

              return (
                <TouchableOpacity
                  key={targetJobId || `app-${Math.random()}`}
                  activeOpacity={0.88}
                  style={styles.appliedCardSquare}
                  onPress={() => navigation.navigate('CandidateJobDetail', { jobId: targetJobId, id: targetJobId, job })}
                >
                  {/* Card Top Header Row */}
                  <View style={styles.cardHeaderRow}>
                    <CompanyLogoAvatar
                      logoUrl={logoUrl}
                      companyName={job.company}
                      size={44}
                      borderRadius={RADIUS.card}
                    />

                    <View style={{ flex: 1, minWidth: 0 }}>
                      <Text style={styles.jobTitle} numberOfLines={1}>
                        {job.title || 'Industrial Vacancy'}
                      </Text>
                      <Text style={styles.companyName} numberOfLines={1}>
                        {job.company || 'Manufacturing Partner'} • {job.location || 'MIDC Zone'}
                      </Text>
                    </View>

                    <ChevronRight size={18} color="#94A3B8" />
                  </View>

                  {/* Section Separator */}
                  <View style={styles.sectionDividerSlate} />

                  {/* Metadata Info Tags */}
                  <View style={styles.metaRow}>
                    {job.location ? (
                      <View style={styles.metaTagPill}>
                        <MapPin size={12} color="#64748B" style={{ flexShrink: 0 }} />
                        <Text style={styles.metaTagText} numberOfLines={1} ellipsizeMode="tail">
                          {job.location}
                        </Text>
                      </View>
                    ) : null}

                    {hasSalary ? (
                      <View style={[styles.metaTagPill, styles.salaryTagPill]}>
                        <IndianRupee size={12} color={COLORS.primary} style={{ flexShrink: 0 }} />
                        <Text style={[styles.metaTagText, { color: COLORS.primary, fontWeight: '700' }]} numberOfLines={1} ellipsizeMode="tail">
                          {job.salary_min || job.salaryMin ? `₹${job.salary_min || job.salaryMin}` : ''}
                          {(job.salary_min || job.salaryMin) && (job.salary_max || job.salaryMax) ? ' - ' : ''}
                          {job.salary_max || job.salaryMax ? `₹${job.salary_max || job.salaryMax}` : ''}/mo
                        </Text>
                      </View>
                    ) : null}

                    {job.job_type || job.jobType ? (
                      <View style={styles.metaTagPill}>
                        <Text style={styles.metaTagText} numberOfLines={1} ellipsizeMode="tail">
                          {job.job_type || job.jobType}
                        </Text>
                      </View>
                    ) : null}
                  </View>

                  {/* Interview Schedule Sub-Layout */}
                  {isShortlisted && (item.interviewDate || item.interview_date) ? (
                    <View style={styles.interviewSubLayout}>
                      <View style={styles.interviewHeaderRow}>
                        <Calendar size={14} color={COLORS.primary} strokeWidth={2.2} />
                        <Text style={styles.interviewHeaderTitle}>Interview Scheduled</Text>
                        <View style={styles.actionPill}>
                          <Text style={styles.actionPillText}>CONFIRMED</Text>
                        </View>
                      </View>

                      <View style={styles.interviewDetailsRow}>
                        <Text style={styles.detailLabel}>DATE & TIME:</Text>
                        <Text style={styles.detailValue} numberOfLines={2} ellipsizeMode="tail">
                          {item.interviewDate || item.interview_date} {item.interviewTime || item.interview_time ? `(${item.interviewTime || item.interview_time})` : ''}
                        </Text>
                      </View>

                      {item.venueAddress || item.venue_address ? (
                        <View style={styles.venueContainer}>
                          <Text style={styles.venueLabel}>VENUE ADDRESS:</Text>
                          <Text style={styles.venueAddressText} numberOfLines={4} ellipsizeMode="tail">
                            {item.venueAddress || item.venue_address}
                          </Text>
                        </View>
                      ) : null}

                      {item.mapsLink || item.maps_link ? (
                        <TouchableOpacity
                          activeOpacity={0.85}
                          style={styles.openMapsBtn}
                          onPress={(e) => {
                            e.stopPropagation();
                            handleOpenMaps(item.mapsLink || item.maps_link);
                          }}
                        >
                          <MapPin size={13} color="#FFFFFF" />
                          <Text style={styles.openMapsBtnText}>Open Directions in Maps</Text>
                          <ExternalLink size={12} color="#FFFFFF" />
                        </TouchableOpacity>
                      ) : null}
                    </View>
                  ) : null}

                  {/* Footer Action Row with Status Badge */}
                  <View style={styles.cardFooterRow}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
                      <Clock size={12} color="#94A3B8" />
                      <Text style={styles.appliedDateText}>
                        Applied {appliedDateFormatted}
                      </Text>
                    </View>

                    {renderStatusBadge(item.status)}
                  </View>
                </TouchableOpacity>
              );
            })
          )}
        </ScrollView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 110,
    gap: 16,
  },
  tabBarContainer: {
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  tabBarScroll: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    gap: 22,
  },
  tabItem: {
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  tabItemActive: {},
  tabItemText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
  },
  tabItemTextActive: {
    fontWeight: '800',
    color: COLORS.primary,
  },
  tabUnderline: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 2.5,
    backgroundColor: COLORS.primary,
    borderTopLeftRadius: 3,
    borderTopRightRadius: 3,
  },
  emptyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: RADIUS.card,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 32,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 8,
  },
  emptyIconCircle: {
    width: 52,
    height: 52,
    borderRadius: RADIUS.full,
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#DBEAFE',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  emptyTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
  },
  emptyDesc: {
    fontSize: 11.5,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 17,
    maxWidth: 280,
  },
  findJobsBtn: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 18,
    paddingVertical: 9,
    borderRadius: RADIUS.card,
    marginTop: 6,
  },
  findJobsBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
  },
  appliedCardSquare: {
    backgroundColor: '#FFFFFF',
    borderRadius: RADIUS.card,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 14,
    gap: 9,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 1,
    overflow: 'hidden',
    width: '100%',
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    width: '100%',
  },
  jobTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: -0.15,
  },
  companyName: {
    fontSize: 11.5,
    fontWeight: '500',
    color: '#64748B',
    marginTop: 2,
    flexShrink: 1,
  },
  sectionDividerSlate: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginVertical: 2,
  },
  statusPillBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: RADIUS.xs,
    borderWidth: 1,
    flexShrink: 0,
  },
  statusPillBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.2,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 6,
    width: '100%',
  },
  metaTagPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3.5,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: RADIUS.xs,
    flexShrink: 1,
    maxWidth: '100%',
  },
  salaryTagPill: {
    backgroundColor: '#EFF6FF',
    borderColor: '#DBEAFE',
  },
  metaTagText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#475569',
    flexShrink: 1,
  },
  interviewSubLayout: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: RADIUS.card,
    padding: 10,
    gap: 5,
    width: '100%',
    overflow: 'hidden',
  },
  interviewHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    width: '100%',
  },
  interviewHeaderTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: '#0F172A',
    flex: 1,
  },
  actionPill: {
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#DBEAFE',
    paddingHorizontal: 5,
    paddingVertical: 1.5,
    borderRadius: RADIUS.xs,
    flexShrink: 0,
  },
  actionPillText: {
    fontSize: 9,
    fontWeight: '800',
    color: COLORS.primary,
  },
  interviewDetailsRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 5,
    width: '100%',
  },
  detailLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: '#64748B',
    letterSpacing: 0.5,
    flexShrink: 0,
    marginTop: 1,
  },
  detailValue: {
    fontSize: 11,
    fontWeight: '800',
    color: '#0F172A',
    flex: 1,
    flexShrink: 1,
  },
  venueContainer: {
    marginTop: 2,
    width: '100%',
  },
  venueLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: '#64748B',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  venueAddressText: {
    fontSize: 11,
    color: '#334155',
    lineHeight: 16,
    fontWeight: '600',
    width: '100%',
    flexShrink: 1,
  },
  openMapsBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    backgroundColor: COLORS.primary,
    paddingVertical: 7,
    paddingHorizontal: 10,
    borderRadius: RADIUS.sm,
    marginTop: 3,
  },
  openMapsBtnText: {
    color: '#FFFFFF',
    fontSize: 11.5,
    fontWeight: '800',
  },
  cardFooterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    marginTop: 1,
  },
  appliedDateText: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '500',
  },
});
