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
    let border = '#BFDBFE';
    let color = COLORS.primary;
    let label = 'APPLIED';
    let IconComp = Send;

    if (s === 'reviewed' || s === 'under_review') {
      bg = '#EFF6FF';
      border = '#BFDBFE';
      color = COLORS.primary;
      label = 'UNDER REVIEW';
      IconComp = Clock;
    } else if (s === 'shortlisted') {
      bg = '#F0F9FF';
      border = '#BAE6FD';
      color = '#0284C7';
      label = 'SHORTLISTED';
      IconComp = Award;
    } else if (s === 'interview' || s === 'interview_scheduled') {
      bg = '#FEF3C7';
      border = '#FCD34D';
      color = '#D97706';
      label = 'INTERVIEW';
      IconComp = Calendar;
    } else if (s === 'hired' || s === 'selected' || s === 'accepted') {
      bg = '#F0FDF4';
      border = '#BBF7D0';
      color = '#16A34A';
      label = 'HIRED';
      IconComp = CheckCircle2;
    } else if (s === 'rejected') {
      bg = '#F8FAFC';
      border = '#CBD5E1';
      color = '#DC2626';
      label = 'REJECTED';
      IconComp = AlertCircle;
    }

    return (
      <View style={[styles.statusPillBadge, { backgroundColor: bg, borderColor: border }]}>
        <IconComp size={12} color={color} />
        <Text style={[styles.statusPillBadgeText, { color }]}>{label}</Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Header title="JobMarket" subtitle="Industrial & Factory Jobs" showBack={false} />

      {loading && !refreshing ? (
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {/* Summary bar skeleton */}
          <View style={styles.summaryBar}>
            <View style={{ flex: 1, gap: 6 }}>
              <SkeletonLoader width="60%" height={16} style={{ borderRadius: 0 }} />
              <SkeletonLoader width="85%" height={12} style={{ borderRadius: 0 }} />
            </View>
            <SkeletonLoader width={70} height={24} style={{ borderRadius: 0 }} />
          </View>

          {/* 3 Realistic Applied card skeletons */}
          {[1, 2, 3].map((key) => (
            <View key={key} style={styles.appliedCardSquare}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                <SkeletonLoader width={40} height={40} style={{ borderRadius: 0 }} />
                <View style={{ flex: 1, gap: 6 }}>
                  <SkeletonLoader width="70%" height={16} style={{ borderRadius: 0 }} />
                  <SkeletonLoader width="50%" height={12} style={{ borderRadius: 0 }} />
                </View>
                <SkeletonLoader width={75} height={22} style={{ borderRadius: 0 }} />
              </View>

              <View style={{ flexDirection: 'row', gap: 8, marginTop: 4 }}>
                <SkeletonLoader width={95} height={22} style={{ borderRadius: 0 }} />
                <SkeletonLoader width={120} height={22} style={{ borderRadius: 0 }} />
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
          {/* Header summary bar */}
          <View style={styles.summaryBar}>
            <View style={{ flex: 1 }}>
              <Text style={styles.summaryTitle}>Job Application Progress</Text>
              <Text style={styles.summarySub}>Track status & interview calls</Text>
            </View>
            <View style={styles.countBadge}>
              <ClipboardList size={14} color={COLORS.primary} />
              <Text style={styles.countBadgeText}>{appliedList.length} Total</Text>
            </View>
          </View>

          {/* Status Filter Segment Tabs */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterTabsRow}>
            <TouchableOpacity
              activeOpacity={0.8}
              style={[styles.filterSegmentBtn, filterTab === 'ALL' && styles.filterSegmentBtnActive]}
              onPress={() => setFilterTab('ALL')}
            >
              <Text style={[styles.filterSegmentText, filterTab === 'ALL' && styles.filterSegmentTextActive]}>
                All ({appliedList.length})
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.8}
              style={[styles.filterSegmentBtn, filterTab === 'INTERVIEW' && styles.filterSegmentBtnActive]}
              onPress={() => setFilterTab('INTERVIEW')}
            >
              <Calendar size={12} color={filterTab === 'INTERVIEW' ? '#FFFFFF' : '#475569'} />
              <Text style={[styles.filterSegmentText, filterTab === 'INTERVIEW' && styles.filterSegmentTextActive]}>
                Interviews ({interviewCount})
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.8}
              style={[styles.filterSegmentBtn, filterTab === 'REVIEW' && styles.filterSegmentBtnActive]}
              onPress={() => setFilterTab('REVIEW')}
            >
              <Clock size={12} color={filterTab === 'REVIEW' ? '#FFFFFF' : '#475569'} />
              <Text style={[styles.filterSegmentText, filterTab === 'REVIEW' && styles.filterSegmentTextActive]}>
                Under Review ({reviewCount})
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.8}
              style={[styles.filterSegmentBtn, filterTab === 'DECISIONS' && styles.filterSegmentBtnActive]}
              onPress={() => setFilterTab('DECISIONS')}
            >
              <CheckCircle2 size={12} color={filterTab === 'DECISIONS' ? '#FFFFFF' : '#475569'} />
              <Text style={[styles.filterSegmentText, filterTab === 'DECISIONS' && styles.filterSegmentTextActive]}>
                Decisions ({decisionsCount})
              </Text>
            </TouchableOpacity>
          </ScrollView>

          {filteredApplications.length === 0 ? (
            <View style={styles.emptyCard}>
              <Briefcase size={40} color="#94A3B8" />
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
                      size={42}
                      borderRadius={6}
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

                  {/* Section Separator Rule */}
                  <View style={styles.sectionDividerSlate} />

                  {/* Metadata Info Row */}
                  <View style={styles.metaRow}>
                    <View style={styles.metaInlineItem}>
                      <MapPin size={13} color={COLORS.primary} style={{ flexShrink: 0 }} />
                      <Text style={styles.metaInlineText} numberOfLines={1} ellipsizeMode="tail">
                        {job.location || 'MIDC Zone'}
                      </Text>
                    </View>

                    {job.salary_max || job.salaryMax ? (
                      <View style={styles.metaInlineItem}>
                        <IndianRupee size={13} color="#0F172A" style={{ flexShrink: 0 }} />
                        <Text style={[styles.metaInlineText, { color: '#0F172A', fontWeight: '800' }]} numberOfLines={1}>
                          ₹{job.salary_min || job.salaryMin || 15000} - ₹{job.salary_max || job.salaryMax}/mo
                        </Text>
                      </View>
                    ) : null}
                  </View>

                  {/* Interview Schedule Sub-Layout (No card-in-card nesting) */}
                  {isShortlisted && (item.interviewDate || item.interview_date) ? (
                    <View style={styles.interviewSubLayout}>
                      <View style={styles.sectionDividerSlate} />
                      <View style={styles.interviewHeaderRow}>
                        <Calendar size={14} color={COLORS.primary} />
                        <Text style={styles.interviewHeaderTitle}>Interview Scheduled</Text>
                        <View style={styles.actionPill}>
                          <Text style={styles.actionPillText}>CONFIRMED</Text>
                        </View>
                      </View>

                      <View style={styles.interviewDetailsRow}>
                        <Text style={styles.detailLabel}>DATE & TIME:</Text>
                        <Text style={styles.detailValue} numberOfLines={1} ellipsizeMode="tail">
                          {item.interviewDate || item.interview_date} {item.interviewTime || item.interview_time ? `(${item.interviewTime || item.interview_time})` : ''}
                        </Text>
                      </View>

                      {item.venueAddress || item.venue_address ? (
                        <View style={styles.venueContainer}>
                          <Text style={styles.venueLabel}>VENUE ADDRESS:</Text>
                          <Text style={styles.venueAddressText} numberOfLines={3} ellipsizeMode="tail">
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
                    <Text style={styles.appliedDateText}>
                      Applied {item.appliedAt ? new Date(item.appliedAt).toLocaleDateString() : 'Recently'}
                    </Text>

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
    backgroundColor: '#F7F7F7',
  },
  scrollContent: {
    paddingHorizontal: 12,
    paddingTop: 12,
    paddingBottom: 110,
    gap: 12,
  },
  summaryBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 2,
    marginBottom: 2,
  },
  summaryTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: -0.3,
  },
  summarySub: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  filterTabsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginVertical: 4,
  },
  filterSegmentBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    paddingHorizontal: 11,
    paddingVertical: 6,
    borderRadius: 6,
  },
  filterSegmentBtnActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  filterSegmentText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#475569',
  },
  filterSegmentTextActive: {
    color: '#FFFFFF',
    fontWeight: '800',
  },
  countBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 0,
  },
  countBadgeText: {
    fontSize: 11.5,
    fontWeight: '800',
    color: COLORS.primary,
  },
  emptyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 0,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    padding: 32,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    marginTop: 10,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
  },
  emptyDesc: {
    fontSize: 12.5,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 18,
  },
  findJobsBtn: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 16,
    paddingVertical: 11,
    borderRadius: 0,
    marginTop: 6,
  },
  findJobsBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
  },
  appliedCardSquare: {
    backgroundColor: '#FFFFFF',
    borderRadius: RADIUS.card,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    padding: 14,
    gap: 10,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  jobTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
  },
  companyName: {
    fontSize: 12.5,
    fontWeight: '600',
    color: '#64748B',
    marginTop: 2,
  },
  sectionDividerSlate: {
    height: 1,
    backgroundColor: '#94A3B8',
    marginVertical: 4,
  },
  statusPillBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    borderWidth: 1,
  },
  statusPillBadgeText: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 12,
    width: '100%',
  },
  metaInlineItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    flexShrink: 1,
    maxWidth: '100%',
  },
  metaInlineText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#475569',
    flexShrink: 1,
  },
  interviewSubLayout: {
    gap: 6,
    width: '100%',
  },
  interviewHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    width: '100%',
  },
  interviewHeaderTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0F172A',
    flex: 1,
  },
  actionPill: {
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#BFDBFE',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    flexShrink: 0,
  },
  actionPillText: {
    fontSize: 9.5,
    fontWeight: '800',
    color: COLORS.primary,
  },
  interviewDetailsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    width: '100%',
  },
  detailLabel: {
    fontSize: 10.5,
    fontWeight: '800',
    color: '#64748B',
    letterSpacing: 0.5,
    flexShrink: 0,
  },
  detailValue: {
    fontSize: 12,
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
    fontSize: 10.5,
    fontWeight: '800',
    color: '#64748B',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  venueAddressText: {
    fontSize: 12,
    color: '#334155',
    lineHeight: 17,
    fontWeight: '600',
    width: '100%',
    flexWrap: 'wrap',
  },
  openMapsBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: COLORS.primary,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    marginTop: 4,
  },
  openMapsBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
  },
  cardFooterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    marginTop: 2,
  },
  appliedDateText: {
    fontSize: 11.5,
    color: '#64748B',
    fontWeight: '600',
  },
});
