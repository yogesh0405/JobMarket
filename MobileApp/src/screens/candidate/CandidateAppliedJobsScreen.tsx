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
import { COLORS } from '../../constants/theme';
import { useToast } from '../../context/ToastContext';
import { CompanyLogoAvatar } from '../../components/common/CompanyLogoAvatar';
import { getCompanyLogoUrl } from '../../utils/companyLogos';
import { appliedJobsStore } from '../../utils/appliedJobsStore';

interface Props {
  navigation: any;
}

export const CandidateAppliedJobsScreen: React.FC<Props> = ({ navigation }) => {
  const { showToast } = useToast();
  const [appliedList, setAppliedList] = useState<any[]>(appliedJobsStore.getAppliedJobs());
  const [loading, setLoading] = useState(appliedJobsStore.getAppliedJobs().length === 0);
  const [refreshing, setRefreshing] = useState(false);

  const syncListWithStore = useCallback((apiData?: any[]) => {
    if (apiData && Array.isArray(apiData)) {
      appliedJobsStore.setAppliedJobs(apiData);
    }
    setAppliedList([...appliedJobsStore.getAppliedJobs()]);
  }, []);

  const fetchAppliedData = useCallback(async (showSkeleton = false) => {
    if (showSkeleton) setLoading(true);
    try {
      const res = await candidateApi.getAppliedJobs();
      if (res.success && res.data) {
        syncListWithStore(res.data);
      } else {
        syncListWithStore();
      }
    } catch (e) {
      console.log('Error loading applied jobs:', e);
      syncListWithStore();
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [syncListWithStore]);

  // Subscribe to appliedJobsStore & live interval polling for real-time status updates
  useEffect(() => {
    fetchAppliedData(false);
    const interval = setInterval(() => {
      fetchAppliedData(false);
    }, 4000);

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

          {appliedList.length === 0 ? (
            <View style={styles.emptyCard}>
              <Briefcase size={40} color="#94A3B8" />
              <Text style={styles.emptyTitle}>No Active Applications</Text>
              <Text style={styles.emptyDesc}>
                You haven't submitted any job applications yet. Browse factory vacancies and apply today!
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
            appliedList.map((item) => {
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
                  {/* Card Top Row */}
                  <View style={styles.cardHeaderRow}>
                    <CompanyLogoAvatar
                      logoUrl={logoUrl}
                      companyName={job.company}
                      size={40}
                      borderRadius={0}
                    />

                    <View style={{ flex: 1, minWidth: 0 }}>
                      <Text style={styles.jobTitle} numberOfLines={1}>
                        {job.title || 'Industrial Vacancy'}
                      </Text>
                      <Text style={styles.companyName} numberOfLines={1}>
                        {job.company || 'Manufacturing Partner'} • {job.location || 'MIDC'}
                      </Text>
                    </View>

                    <ChevronRight size={18} color="#94A3B8" />
                  </View>

                  <View style={styles.sectionDividerSlate} />

                  {/* Metadata Row */}
                  <View style={styles.metaRow}>
                    <View style={styles.metaInlineItem}>
                      <MapPin size={13} color={COLORS.primary} />
                      <Text style={styles.metaInlineText}>{job.location || 'MIDC Zone'}</Text>
                    </View>

                    {job.salary_max || job.salaryMax ? (
                      <View style={styles.metaInlineItem}>
                        <IndianRupee size={13} color="#0F172A" />
                        <Text style={[styles.metaInlineText, { color: '#0F172A', fontWeight: '800' }]}>
                          ₹{job.salary_min || job.salaryMin || 15000} - ₹{job.salary_max || job.salaryMax}/mo
                        </Text>
                      </View>
                    ) : null}
                  </View>

                  {/* Interview Schedule Details (If Interview Scheduled) */}
                  {isShortlisted && (item.interviewDate || item.interview_date) ? (
                    <View style={styles.interviewContainer}>
                      <View style={styles.interviewHeaderRow}>
                        <Calendar size={15} color={COLORS.primary} />
                        <Text style={styles.interviewHeaderTitle}>Interview Schedule & Walk-In Pass</Text>
                        <View style={styles.actionPill}>
                          <Text style={styles.actionPillText}>CONFIRMED</Text>
                        </View>
                      </View>

                      <View style={styles.interviewDetailsGrid}>
                        <View style={{ flex: 1 }}>
                          <Text style={styles.detailLabel}>DATE & TIME</Text>
                          <Text style={styles.detailValue}>
                            {item.interviewDate || item.interview_date} {item.interviewTime || item.interview_time ? `(${item.interviewTime || item.interview_time})` : ''}
                          </Text>
                        </View>
                      </View>

                      {item.venueAddress || item.venue_address ? (
                        <View style={{ marginTop: 2 }}>
                          <Text style={styles.detailLabel}>INTERVIEW VENUE ADDRESS</Text>
                          <Text style={styles.venueAddressText}>{item.venueAddress || item.venue_address}</Text>
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
                          <Text style={styles.openMapsBtnText}>Open Directions in Google Maps</Text>
                          <ExternalLink size={12} color="#FFFFFF" />
                        </TouchableOpacity>
                      ) : null}
                    </View>
                  ) : null}

                  {/* Footer Action Row with Real Live Application Status */}
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
    borderRadius: 0,
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
    borderRadius: 0,
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
    gap: 14,
  },
  metaInlineItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaInlineText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#475569',
  },
  interviewContainer: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 0,
    padding: 12,
    gap: 8,
    marginTop: 4,
  },
  interviewHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
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
    borderRadius: 0,
  },
  actionPillText: {
    fontSize: 9.5,
    fontWeight: '800',
    color: COLORS.primary,
  },
  interviewDetailsGrid: {
    flexDirection: 'row',
    backgroundColor: '#F8FAFC',
    borderRadius: 0,
    padding: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 12,
  },
  detailLabel: {
    fontSize: 9.5,
    fontWeight: '800',
    color: '#64748B',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  detailValue: {
    fontSize: 12.5,
    fontWeight: '800',
    color: '#0F172A',
  },
  venueAddressText: {
    fontSize: 12,
    color: '#334155',
    lineHeight: 16,
    fontWeight: '600',
  },
  openMapsBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: COLORS.primary,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 0,
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
    borderTopColor: '#F1F5F9',
  },
  appliedDateText: {
    fontSize: 11.5,
    color: '#64748B',
    fontWeight: '600',
  },
});
