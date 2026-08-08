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
    let bg = '#EFF6FF';
    let border = '#93C5FD';
    let text = '#1D4ED8';
    let label = 'APPLIED';

    if (s === 'shortlisted' || s === 'accepted') {
      bg = '#DCFCE7';
      border = '#86EFAC';
      text = '#15803D';
      label = s === 'accepted' ? 'HIRED' : 'SHORTLISTED';
    } else if (s === 'reviewed') {
      bg = '#FEF3C7';
      border = '#FDE68A';
      text = '#B45309';
      label = 'UNDER REVIEW';
    } else if (s === 'rejected') {
      bg = '#FEF2F2';
      border = '#FCA5A5';
      text = '#DC2626';
      label = 'REJECTED';
    }

    return (
      <View style={[styles.statusPill, { backgroundColor: bg, borderColor: border }]}>
        <Text style={[styles.statusPillText, { color: text }]}>{label}</Text>
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
              <Text style={styles.summarySub}>Track your status and scheduled walk-in interview calls</Text>
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
              const logoUrl = job.companyLogo || job.company_logo || job.logoUrl || job.logo_url || job.logo || item.companyLogo || item.company_logo;

              return (
                <View key={item.jobId || job.id} style={styles.appliedCard3D}>
                  {/* Card Top Row */}
                  <View style={styles.cardHeaderRow}>
                    <View style={styles.companyIconSquare}>
                      {logoUrl ? (
                        <Image
                          source={{ uri: logoUrl }}
                          style={styles.companyLogoImg}
                          resizeMode="contain"
                        />
                      ) : (
                        <Building2 size={20} color="#2563EB" />
                      )}
                    </View>

                    <View style={{ flex: 1 }}>
                      <Text style={styles.jobTitle} numberOfLines={1}>
                        {job.title || 'Industrial Vacancy'}
                      </Text>
                      <Text style={styles.companyName} numberOfLines={1}>
                        {job.company || 'Manufacturing Partner'} • {job.location || 'MIDC'}
                      </Text>
                    </View>

                    {renderStatusPill(item.status)}
                  </View>

                  {/* Metadata Row */}
                  <View style={styles.metaRow}>
                    <View style={styles.metaBadge}>
                      <MapPin size={12} color="#2563EB" />
                      <Text style={styles.metaBadgeText}>{job.location || 'MIDC Zone'}</Text>
                    </View>

                    {job.salary_max || job.salaryMax ? (
                      <View style={[styles.metaBadge, { backgroundColor: '#F0FDF4', borderColor: '#BBF7D0' }]}>
                        <IndianRupee size={12} color="#16A34A" />
                        <Text style={[styles.metaBadgeText, { color: '#16A34A', fontWeight: '800' }]}>
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
                      style={styles.viewJobBtn}
                      onPress={() => navigation.navigate('CandidateJobDetail', { jobId: job.id })}
                    >
                      <Text style={styles.viewJobBtnText}>View Vacancy Details</Text>
                      <ChevronRight size={14} color="#2563EB" />
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
    paddingBottom: 95,
    gap: 14,
  },
  summaryBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderBottomWidth: 3,
    borderBottomColor: '#CBD5E1',
    padding: 14,
  },
  summaryTitle: {
    fontSize: 15,
    fontWeight: '900',
    color: '#0F172A',
  },
  summarySub: {
    fontSize: 11.5,
    color: '#64748B',
    marginTop: 2,
  },
  countBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#93C5FD',
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
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderBottomWidth: 3,
    borderBottomColor: '#CBD5E1',
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
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 14,
    gap: 10,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 1.5,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  companyIconSquare: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#BFDBFE',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  companyLogoImg: {
    width: 36,
    height: 36,
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
    flexWrap: 'wrap',
    gap: 6,
  },
  metaBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
  },
  metaBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#475569',
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
