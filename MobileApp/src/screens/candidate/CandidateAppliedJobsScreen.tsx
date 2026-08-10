import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
  Linking,
  Image,
} from 'react-native';
import {
  Briefcase,
  Building2,
  MapPin,
  Clock,
  Calendar,
  IndianRupee,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  ChevronRight,
  ClipboardList,
} from 'lucide-react-native';
import { useFocusEffect } from '@react-navigation/native';
import { candidateApi } from '../../api/candidateApi';
import { Header } from '../../components/common/Header';
import { Skeleton as SkeletonLoader } from '../../components/common/SkeletonLoader';
import { COLORS, TYPOGRAPHY, SPACING, RADIUS } from '../../constants/theme';
import { useToast } from '../../context/ToastContext';
import { CompanyLogoAvatar } from '../../components/common/CompanyLogoAvatar';
import { getCompanyLogoUrl } from '../../utils/companyLogos';

interface Props {
  navigation: any;
}

export const CandidateAppliedJobsScreen: React.FC<Props> = ({ navigation }) => {
  const { showToast } = useToast();
  const [appliedList, setAppliedList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchAppliedData = useCallback(async (showSkeleton = false) => {
    if (showSkeleton) setLoading(true);
    try {
      const res = await candidateApi.getAppliedJobs();
      if (res.success && res.data) {
        setAppliedList(res.data || []);
      }
    } catch (e) {
      console.log('Error loading applied jobs:', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchAppliedData(false);
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

  const renderStatusPill = (status?: string) => {
    const s = (status || 'applied').toLowerCase();
    let color = '#16A34A'; // Green color for Applied
    let label = 'Applied';
    let IconComponent = CheckCircle2;

    if (s === 'shortlisted' || s === 'accepted') {
      color = '#16A34A';
      label = s === 'accepted' ? 'Hired' : 'Shortlisted';
      IconComponent = CheckCircle2;
    } else if (s === 'reviewed') {
      color = '#D97706';
      label = 'Under Review';
      IconComponent = Clock;
    } else if (s === 'rejected') {
      color = '#DC2626';
      label = 'Rejected';
      IconComponent = AlertCircle;
    }

    return (
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
        <IconComponent size={14} color={color} />
        <Text style={{ fontSize: 12, fontWeight: '700', color }}>{label}</Text>
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
              <SkeletonLoader width="60%" height={16} style={{ borderRadius: 4 }} />
              <SkeletonLoader width="85%" height={12} style={{ borderRadius: 4 }} />
            </View>
            <SkeletonLoader width={70} height={24} style={{ borderRadius: 12 }} />
          </View>

          {/* 3 Realistic Applied card skeletons */}
          {[1, 2, 3].map((key) => (
            <View key={key} style={styles.appliedCard3D}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                <SkeletonLoader width={40} height={40} style={{ borderRadius: 8 }} />
                <View style={{ flex: 1, gap: 6 }}>
                  <SkeletonLoader width="70%" height={16} style={{ borderRadius: 4 }} />
                  <SkeletonLoader width="50%" height={12} style={{ borderRadius: 4 }} />
                </View>
                <SkeletonLoader width={75} height={22} style={{ borderRadius: 11 }} />
              </View>

              <View style={{ flexDirection: 'row', gap: 8, marginTop: 4 }}>
                <SkeletonLoader width={95} height={22} style={{ borderRadius: 4 }} />
                <SkeletonLoader width={120} height={22} style={{ borderRadius: 4 }} />
              </View>

              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 4 }}>
                <SkeletonLoader width={100} height={12} style={{ borderRadius: 4 }} />
                <SkeletonLoader width={125} height={24} style={{ borderRadius: 6 }} />
              </View>
            </View>
          ))}
        </ScrollView>
      ) : (
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#2563EB']} />}
        >
          {/* Header summary bar */}
          <View style={styles.summaryBar}>
            <View style={{ flex: 1 }}>
              <Text style={styles.summaryTitle}>Job Application Progress</Text>
              <Text style={styles.summarySub}>Track status & interview calls</Text>
            </View>
            <View style={styles.countBadge}>
              <ClipboardList size={14} color="#2563EB" />
              <Text style={styles.countBadgeText}>{appliedList.length} Total</Text>
            </View>
          </View>

          {appliedList.length === 0 ? (
            <View style={styles.emptyCard}>
              <Briefcase size={44} color="#94A3B8" />
              <Text style={styles.emptyTitle}>No Active Applications</Text>
              <Text style={styles.emptyDesc}>
                You haven't submitted any job applications yet. Browse factory vacancies and apply today!
              </Text>
              <TouchableOpacity
                activeOpacity={0.8}
                style={styles.findJobsBtn}
                onPress={() => navigation.navigate('CandidateJobsTab')}
              >
                <Text style={styles.findJobsBtnText}>Explore Jobs & Vacancies</Text>
              </TouchableOpacity>
            </View>
          ) : (
            appliedList.map((item) => {
              const job = item.job || item;
              const status = (item.status || 'applied').toLowerCase();
              const isShortlisted = status === 'shortlisted' || status === 'accepted';
              const rawLogo = job.companyLogo || job.company_logo || job.logoUrl || job.logo_url || job.logo || item.companyLogo || item.company_logo || (job as any).companyLogoUrl;
              const logoUrl = getCompanyLogoUrl(job.company || 'Enterprise', rawLogo);

              return (
                <View key={item.jobId || job.id} style={styles.appliedCard3D}>
                  {/* Card Top Row */}
                  <View style={styles.cardHeaderRow}>
                    <CompanyLogoAvatar
                      logoUrl={logoUrl}
                      companyName={job.company}
                      size={38}
                    />

                    <View style={{ flex: 1 }}>
                      <Text style={styles.jobTitle} numberOfLines={1}>
                        {job.title || 'Industrial Vacancy'}
                      </Text>
                      <Text style={styles.companyName} numberOfLines={1}>
                        {job.company || 'Manufacturing Partner'} • {job.location || 'MIDC'}
                      </Text>
                    </View>
                  </View>

                  {/* Metadata Row (Clean inline text, no chip boxes) */}
                  <View style={styles.metaRow}>
                    <View style={styles.metaInlineItem}>
                      <MapPin size={12} color="#2563EB" />
                      <Text style={styles.metaInlineText}>{job.location || 'MIDC Zone'}</Text>
                    </View>

                    {job.salary_max || job.salaryMax ? (
                      <View style={styles.metaInlineItem}>
                        <IndianRupee size={12} color="#0F172A" />
                        <Text style={[styles.metaInlineText, { color: '#0F172A', fontWeight: '700' }]}>
                          ₹{job.salary_min || job.salaryMin || 15000} - ₹{job.salary_max || job.salaryMax}/mo
                        </Text>
                      </View>
                    ) : null}
                  </View>

                  {/* Interview Schedule Container (If Shortlisted) */}
                  {isShortlisted && (item.interviewDate || item.interview_date) ? (
                    <View style={styles.interviewContainer}>
                      <View style={styles.interviewHeaderRow}>
                        <Calendar size={16} color="#15803D" />
                        <Text style={styles.interviewHeaderTitle}>Interview Call Scheduled</Text>
                        <View style={styles.actionPill}>
                          <Text style={styles.actionPillText}>ACTION REQUIRED</Text>
                        </View>
                      </View>

                      <View style={styles.interviewDetailsGrid}>
                        <View style={{ flex: 1 }}>
                          <Text style={styles.detailLabel}>DATE</Text>
                          <Text style={styles.detailValue}>{item.interviewDate || item.interview_date}</Text>
                        </View>
                        <View style={{ flex: 1 }}>
                          <Text style={styles.detailLabel}>TIME</Text>
                          <Text style={styles.detailValue}>{item.interviewTime || item.interview_time || '10:00 AM'}</Text>
                        </View>
                      </View>

                      {item.venueAddress || item.venue_address ? (
                        <View>
                          <Text style={styles.detailLabel}>INTERVIEW VENUE ADDRESS</Text>
                          <Text style={styles.venueAddressText}>{item.venueAddress || item.venue_address}</Text>
                        </View>
                      ) : null}

                      {item.mapsLink || item.maps_link ? (
                        <TouchableOpacity
                          activeOpacity={0.8}
                          style={styles.openMapsBtn}
                          onPress={() => handleOpenMaps(item.mapsLink || item.maps_link)}
                        >
                          <MapPin size={14} color="#FFFFFF" />
                          <Text style={styles.openMapsBtnText}>Open Directions in Google Maps</Text>
                          <ExternalLink size={12} color="#FFFFFF" />
                        </TouchableOpacity>
                      ) : null}
                    </View>
                  ) : null}

                  {/* Footer Action Row */}
                  <View style={styles.cardFooterRow}>
                    <Text style={styles.appliedDateText}>
                      Applied on {item.appliedAt ? new Date(item.appliedAt).toLocaleDateString() : 'Recently'}
                    </Text>

                    <TouchableOpacity
                      activeOpacity={0.7}
                      style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}
                      onPress={() => navigation.navigate('CandidateJobDetail', { jobId: job.id })}
                    >
                      <CheckCircle2 size={14} color="#16A34A" />
                      <Text style={{ fontSize: 12.5, fontWeight: '700', color: '#16A34A' }}>Applied</Text>
                      <ChevronRight size={14} color="#16A34A" />
                    </TouchableOpacity>
                  </View>
                </View>
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
    padding: 16,
    paddingBottom: 130,
    gap: 14,
  },
  summaryBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 2,
    paddingVertical: 4,
    marginBottom: 4,
  },
  summaryTitle: {
    fontSize: 17.5,
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
    gap: 4,
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#BFDBFE',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
  },
  countBadgeText: {
    fontSize: 11.5,
    fontWeight: '800',
    color: '#2563EB',
  },
  emptyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    padding: 36,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: '#0F172A',
  },
  emptyDesc: {
    fontSize: 12.5,
    color: '#64748B',
    textAlign: 'center',
  },
  findJobsBtn: {
    backgroundColor: '#2563EB',
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: 6,
    marginTop: 6,
  },
  findJobsBtnText: {
    color: '#FFFFFF',
    fontSize: 12.5,
    fontWeight: '800',
  },
  appliedCard3D: {
    backgroundColor: '#FFFFFF',
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    padding: 14,
    gap: 10,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 2,
    elevation: 1,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  companyIconSquare: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  companyLogoImg: {
    width: 34,
    height: 34,
    borderRadius: 6,
  },
  jobTitle: {
    fontSize: 15,
    fontWeight: '900',
    color: '#0F172A',
  },
  companyName: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748B',
    marginTop: 1,
  },
  statusPill: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    borderWidth: 1,
  },
  statusPillText: {
    fontSize: 10,
    fontWeight: '800',
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 12,
  },
  metaInlineItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaInlineText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#64748B',
  },
  interviewContainer: {
    backgroundColor: '#F0FDF4',
    borderWidth: 1.5,
    borderColor: '#86EFAC',
    borderRadius: 6,
    padding: 12,
    gap: 8,
  },
  interviewHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  interviewHeaderTitle: {
    fontSize: 13,
    fontWeight: '900',
    color: '#15803D',
    flex: 1,
  },
  actionPill: {
    backgroundColor: '#DCFCE7',
    borderWidth: 1,
    borderColor: '#86EFAC',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  actionPillText: {
    fontSize: 9.5,
    fontWeight: '800',
    color: '#15803D',
  },
  interviewDetailsGrid: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 4,
    padding: 8,
    borderWidth: 1,
    borderColor: '#BBF7D0',
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
    backgroundColor: '#16A34A',
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
    borderTopColor: '#F1F5F9',
  },
  appliedDateText: {
    fontSize: 11.5,
    color: '#64748B',
    fontWeight: '600',
  },
  viewJobBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  viewJobBtnText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#2563EB',
  },
});
