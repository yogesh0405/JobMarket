import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import {
  Briefcase,
  Bookmark,
  Eye,
  Award,
  ChevronRight,
  MapPin,
  Clock,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  Search,
  Sparkles,
  Building2,
  IndianRupee,
  BarChart3,
} from 'lucide-react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useAuth } from '../../hooks/useAuth';
import { candidateApi } from '../../api/candidateApi';
import { Job } from '../../types';
import { Header } from '../../components/common/Header';
import { Skeleton as SkeletonLoader } from '../../components/common/SkeletonLoader';
import { calculateCandidateProfileCompletion } from '../../utils/profileCompleteness';
import { CompanyLogoAvatar } from '../../components/common/CompanyLogoAvatar';

interface Props {
  navigation: any;
  hideHeader?: boolean;
}

export const CandidateDashboardScreen: React.FC<Props> = ({ navigation, hideHeader = false }) => {
  const { user, refreshUser } = useAuth();
  const [appliedJobs, setAppliedJobs] = useState<any[]>([]);
  const [savedJobs, setSavedJobs] = useState<Job[]>([]);
  const [recommendedJobs, setRecommendedJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
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
        setAppliedJobs(appliedRes.data || []);
      }
      if (savedRes.success && savedRes.data) {
        setSavedJobs(savedRes.data || []);
      }
      if (allJobsRes.success && allJobsRes.data) {
        const jobs = allJobsRes.data || [];
        setRecommendedJobs(jobs.slice(0, 6));
      }
    } catch (e) {
      console.log('Error fetching candidate dashboard data:', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [refreshUser]);

  useFocusEffect(
    useCallback(() => {
      loadData(false);
    }, [loadData])
  );

  const onRefresh = () => {
    setRefreshing(true);
    loadData(false);
  };

  const displayName = user?.name || user?.email || 'Candidate';
  const displayHeadline = user?.headline || user?.tradeSpecialization || 'Industrial Worker';
  const skillsCount = (user?.skills || []).length;
  const profileViews = user?.profile_picture_url ? 12 : 5;

  const completionData = calculateCandidateProfileCompletion(user);
  const completionScore = completionData.totalScore;

  const renderStatusTag = (status?: string) => {
    const s = (status || 'applied').toLowerCase();
    let text = '#15803D';
    let label = 'APPLIED';

    if (s === 'shortlisted' || s === 'accepted') {
      text = '#15803D';
      label = s === 'accepted' ? 'HIRED' : 'SHORTLISTED';
    } else if (s === 'reviewed') {
      text = '#B45309';
      label = 'UNDER REVIEW';
    } else if (s === 'rejected') {
      text = '#DC2626';
      label = 'REJECTED';
    }

    return (
      <Text style={{ fontSize: 11, fontWeight: '800', color: text, letterSpacing: 0.5 }}>
        {label}
      </Text>
    );
  };

  return (
    <View style={styles.container}>
      {!hideHeader && <Header title="JobMarket" subtitle="Industrial & Factory Jobs" showBack={false} />}

      {loading && !refreshing ? (
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {/* Candidate Analytics Skeleton */}
          <SkeletonLoader width={160} height={14} style={{ borderRadius: 0, marginBottom: 12 }} />
          <View style={{ flexDirection: 'row', gap: 12, marginBottom: 12 }}>
            <SkeletonLoader width="48%" height={40} style={{ borderRadius: 0 }} />
            <SkeletonLoader width="48%" height={40} style={{ borderRadius: 0 }} />
          </View>
          <View style={{ flexDirection: 'row', gap: 12 }}>
            <SkeletonLoader width="48%" height={40} style={{ borderRadius: 0 }} />
            <SkeletonLoader width="48%" height={40} style={{ borderRadius: 0 }} />
          </View>

          <View style={styles.sectionDivider} />

          {/* Recent Applications Skeleton */}
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 }}>
            <SkeletonLoader width={160} height={16} style={{ borderRadius: 0 }} />
            <SkeletonLoader width={70} height={16} style={{ borderRadius: 0 }} />
          </View>
          <View style={{ gap: 10 }}>
            <SkeletonLoader width="100%" height={48} style={{ borderRadius: 0 }} />
            <SkeletonLoader width="100%" height={48} style={{ borderRadius: 0 }} />
            <SkeletonLoader width="100%" height={48} style={{ borderRadius: 0 }} />
          </View>

          <View style={styles.sectionDivider} />

          {/* Recommended Vacancies Skeleton */}
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 }}>
            <SkeletonLoader width={180} height={16} style={{ borderRadius: 0 }} />
            <SkeletonLoader width={70} height={16} style={{ borderRadius: 0 }} />
          </View>
          <View style={{ flexDirection: 'row', gap: 10 }}>
            <SkeletonLoader width={190} height={85} style={{ borderRadius: 0 }} />
            <SkeletonLoader width={190} height={85} style={{ borderRadius: 0 }} />
          </View>
        </ScrollView>
      ) : (
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#2563EB']} />}
        >
          {/* SINGLE MASTER CARD FOR ALL DASHBOARD SECTIONS */}
          <View style={styles.singleMasterCard}>

            {/* SECTION 1: CANDIDATE ANALYTICS */}
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 8 }}>
              <BarChart3 size={16} color="#2563EB" />
              <Text style={styles.groupHeaderLabel}>CANDIDATE ANALYTICS</Text>
            </View>

            <View style={styles.statsQuadGrid}>
              <TouchableOpacity
                activeOpacity={0.8}
                style={styles.statMetricItem}
                onPress={() => navigation.navigate('CandidateAppliedTab')}
              >
                <Briefcase size={16} color="#2563EB" />
                <View style={styles.statTextStack}>
                  <Text style={styles.statNumber}>{appliedJobs.length}</Text>
                  <Text style={styles.statLabel} numberOfLines={1}>Jobs Applied</Text>
                </View>
              </TouchableOpacity>

              <View style={styles.statVerticalDivider} />

              <TouchableOpacity
                activeOpacity={0.8}
                style={styles.statMetricItem}
                onPress={() => navigation.navigate('CandidateSavedTab')}
              >
                <Bookmark size={16} color="#2563EB" />
                <View style={styles.statTextStack}>
                  <Text style={styles.statNumber}>{savedJobs.length}</Text>
                  <Text style={styles.statLabel} numberOfLines={1}>Saved Jobs</Text>
                </View>
              </TouchableOpacity>
            </View>

            <View style={styles.statHorizontalDivider} />

            <View style={styles.statsQuadGrid}>
              <View style={styles.statMetricItem}>
                <Eye size={16} color="#2563EB" />
                <View style={styles.statTextStack}>
                  <Text style={styles.statNumber}>{profileViews}</Text>
                  <Text style={styles.statLabel} numberOfLines={1}>Profile Views</Text>
                </View>
              </View>

              <View style={styles.statVerticalDivider} />

              <TouchableOpacity
                activeOpacity={0.8}
                style={styles.statMetricItem}
                onPress={() => navigation.navigate('CandidateProfile')}
              >
                <Award size={16} color="#2563EB" />
                <View style={styles.statTextStack}>
                  <Text style={styles.statNumber}>{skillsCount}</Text>
                  <Text style={styles.statLabel} numberOfLines={1}>Skills Added</Text>
                </View>
              </TouchableOpacity>
            </View>

            {/* DARK SEPARATOR */}
            <View style={styles.sectionDivider} />

            {/* SECTION 2: RECENT APPLICATIONS */}
            <View style={styles.cardHeaderRow}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, flex: 1 }}>
                <Briefcase size={16} color="#2563EB" />
                <Text style={styles.cardTitle}>Recent Applications</Text>
              </View>
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => navigation.navigate('CandidateAppliedTab')}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Text style={styles.viewAllText}>View All ({appliedJobs.length}) →</Text>
              </TouchableOpacity>
            </View>

            {appliedJobs.length === 0 ? (
              <View style={styles.emptyApplicationsBox}>
                <Building2 size={32} color="#94A3B8" />
                <Text style={styles.emptyTitle}>No Applications Submitted</Text>
                <Text style={styles.emptyDesc}>
                  Explore active MIDC factory vacancies & submit application.
                </Text>
                <TouchableOpacity
                  activeOpacity={0.85}
                  style={styles.browseJobsBtn}
                  onPress={() => navigation.navigate('CandidateJobsTab')}
                >
                  <Search size={14} color="#FFFFFF" />
                  <Text style={styles.browseJobsBtnText}>Browse Active Vacancies</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.applicationsList}>
                {appliedJobs.slice(0, 4).map((item, index, arr) => {
                  const job = item.job || item;
                  const isLast = index === arr.length - 1;
                  return (
                    <TouchableOpacity
                      key={item.jobId || job.id}
                      activeOpacity={0.85}
                      style={[
                        styles.applicationItemRow,
                        isLast && { borderBottomWidth: 0 },
                      ]}
                      onPress={() => navigation.navigate('CandidateAppliedTab')}
                    >
                      <CompanyLogoAvatar
                        logoUrl={job.companyLogo || (job as any).company_logo || (job as any).logoUrl || (job as any).logo_url}
                        companyName={job.company}
                        size={36}
                        borderRadius={0}
                      />
                      <View style={{ flex: 1 }}>
                        <Text style={styles.appJobTitle} numberOfLines={1}>
                          {job.title || 'Industrial Position'}
                        </Text>
                        <Text style={styles.appCompany} numberOfLines={1}>
                          {job.company || 'Manufacturing Partner'} • {job.location || 'MIDC'}
                        </Text>
                      </View>
                      <ChevronRight size={16} color="#94A3B8" />
                    </TouchableOpacity>
                  );
                })}
              </View>
            )}
          </View>

          {/* SECTION 3: RECOMMENDED VACANCIES (OUTSIDE MASTER CARD) */}
          {recommendedJobs.length > 0 ? (
            <>
              {/* DARK SEPARATOR WITH EXTRA SPACING AFTER CARD */}
              <View style={[styles.sectionDivider, { marginTop: 24, marginBottom: 36 }]} />

              <View style={styles.cardHeaderRow}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, flex: 1 }}>
                  <Building2 size={16} color="#2563EB" />
                  <Text style={styles.cardTitle}>Recommended Vacancies</Text>
                </View>
                <TouchableOpacity onPress={() => navigation.navigate('CandidateJobsTab')}>
                  <Text style={styles.viewAllText}>Explore All →</Text>
                </TouchableOpacity>
              </View>

              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 10, paddingTop: 4 }}>
                {recommendedJobs.map((job) => (
                  <TouchableOpacity
                    key={job.id}
                    activeOpacity={0.85}
                    style={styles.jobItemFlat}
                    onPress={() => navigation.navigate('CandidateJobDetail', { jobId: job.id })}
                  >
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                      <CompanyLogoAvatar
                        logoUrl={job.companyLogo || (job as any).company_logo || (job as any).logoUrl || (job as any).logo_url}
                        companyName={job.company}
                        size={28}
                        borderRadius={0}
                      />
                      <View style={{ flex: 1 }}>
                        <Text style={styles.miniTitle} numberOfLines={1}>
                          {job.title}
                        </Text>
                        <Text style={styles.miniCompany} numberOfLines={1}>
                          {job.company || 'Industrial Company'}
                        </Text>
                      </View>
                    </View>

                    <View style={styles.miniLocationRow}>
                      <MapPin size={11} color="#64748B" />
                      <Text style={styles.miniLocationText} numberOfLines={1}>
                        {job.location || 'MIDC Zone'}
                      </Text>
                    </View>

                    <View style={{ height: 1, backgroundColor: '#F1F5F9', marginVertical: 2 }} />

                    <View style={styles.salaryBadgeRow}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 2, flex: 1 }}>
                        <IndianRupee size={11} color="#16A34A" />
                        <Text style={styles.salaryText} numberOfLines={1}>
                          ₹{job.salary_min || job.salaryMin || 15000} - ₹{job.salary_max || job.salaryMax || 25000}
                        </Text>
                      </View>
                      <ChevronRight size={14} color="#2563EB" />
                    </View>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </>
          ) : null}
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
    paddingHorizontal: 8,
    paddingTop: 8,
    paddingBottom: 100,
    backgroundColor: '#FFFFFF',
  },
  singleMasterCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 0,
    padding: 10,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.02,
    shadowRadius: 2,
    elevation: 1,
  },
  sectionDivider: {
    height: 1,
    backgroundColor: '#94A3B8',
    marginTop: 10,
    marginBottom: 24,
  },
  groupHeaderLabel: {
    fontSize: 12,
    fontWeight: '900',
    color: '#0F172A',
    letterSpacing: 1.0,
    marginBottom: 0,
    paddingLeft: 0,
  },
  avatarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatarCircle: {
    width: 44,
    height: 44,
    borderRadius: 0,
    backgroundColor: '#2563EB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarLetter: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '900',
  },
  userName: {
    fontSize: 16.5,
    fontWeight: '900',
    color: '#0F172A',
  },
  userHeadline: {
    fontSize: 12.5,
    color: '#475569',
    fontWeight: '600',
    marginTop: 2,
  },
  locationTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  locationTagText: {
    fontSize: 11.5,
    color: '#64748B',
    fontWeight: '500',
  },
  statsQuadGrid: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 1,
    paddingHorizontal: 4,
  },
  statMetricItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 2,
    paddingHorizontal: 4,
  },
  statVerticalDivider: {
    width: 1,
    height: 24,
    backgroundColor: '#CBD5E1',
    marginHorizontal: 4,
  },
  statHorizontalDivider: {
    height: 1,
    backgroundColor: '#CBD5E1',
    marginVertical: 4,
  },
  statTextStack: {
    flex: 1,
  },
  statNumber: {
    fontSize: 16,
    fontWeight: '900',
    color: '#0F172A',
  },
  statLabel: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '700',
  },
  sectionContainer: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 0,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  cardTitle: {
    fontSize: 14.5,
    fontWeight: '900',
    color: '#0F172A',
  },
  progressPercent: {
    fontSize: 14,
    fontWeight: '900',
    color: '#2563EB',
  },
  progressBarTrack: {
    height: 6,
    borderRadius: 0,
    backgroundColor: '#F1F5F9',
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#2563EB',
    borderRadius: 0,
  },
  progressHint: {
    fontSize: 11.5,
    color: '#64748B',
    fontWeight: '600',
    marginBottom: 8,
  },
  sectionBreakdownBox: {
    paddingVertical: 2,
    gap: 2,
    marginBottom: 12,
  },
  sectionRowItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 9,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  sectionLabelText: {
    fontSize: 12.5,
  },
  sectionScoreText: {
    fontSize: 12,
    fontWeight: '800',
  },
  updateProfileBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#2563EB',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 0,
  },
  updateProfileBtnText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  viewAllText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#2563EB',
  },
  emptyApplicationsBox: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
    gap: 8,
  },
  emptyTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
  },
  emptyDesc: {
    fontSize: 11.5,
    color: '#64748B',
    textAlign: 'center',
  },
  browseJobsBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#2563EB',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 0,
    marginTop: 6,
  },
  browseJobsBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
  },
  applicationsList: {
    gap: 4,
  },
  applicationItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 4,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    gap: 10,
  },
  appJobTitle: {
    fontSize: 13.5,
    fontWeight: '800',
    color: '#0F172A',
  },
  appCompany: {
    fontSize: 11.5,
    color: '#64748B',
    fontWeight: '600',
    marginTop: 1,
  },
  jobItemFlat: {
    width: 190,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 0,
    padding: 10,
    gap: 4,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.02,
    shadowRadius: 2,
    elevation: 1,
  },
  miniTitle: {
    fontSize: 13.5,
    fontWeight: '800',
    color: '#0F172A',
  },
  miniCompany: {
    fontSize: 11.5,
    color: '#64748B',
    fontWeight: '600',
  },
  miniLocationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  miniLocationText: {
    fontSize: 11,
    color: '#64748B',
  },
  salaryBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    marginTop: 4,
  },
  salaryText: {
    fontSize: 11.5,
    fontWeight: '800',
    color: '#16A34A',
  },
});
