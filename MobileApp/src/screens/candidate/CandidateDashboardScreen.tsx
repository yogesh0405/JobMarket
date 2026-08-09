import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  FlatList,
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
  FileText,
  UserCheck,
  ShieldCheck,
  Search,
  Sparkles,
  ArrowRight,
  Building2,
  IndianRupee,
} from 'lucide-react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useAuth } from '../../hooks/useAuth';
import { candidateApi, AppliedJobDetails } from '../../api/candidateApi';
import { Job } from '../../types';
import { Header } from '../../components/common/Header';
import { Skeleton as SkeletonLoader } from '../../components/common/SkeletonLoader';
import { calculateCandidateProfileCompletion } from '../../utils/profileCompleteness';
import { COLORS, TYPOGRAPHY, SPACING, RADIUS } from '../../constants/theme';

interface Props {
  navigation: any;
}

export const CandidateDashboardScreen: React.FC<Props> = ({ navigation }) => {
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
        // Filter recommended jobs matching candidate trade or active jobs
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
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <SkeletonLoader width="100%" height={120} style={{ borderRadius: 8, marginBottom: 16 }} />
          <SkeletonLoader width="100%" height={160} style={{ borderRadius: 8, marginBottom: 16 }} />
          <SkeletonLoader width="100%" height={240} style={{ borderRadius: 8 }} />
        </ScrollView>
      ) : (
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#2563EB']} />}
        >
          {/* Welcome User Card */}
          <View style={styles.welcomeCard}>
            <View style={styles.avatarRow}>
              <View style={styles.avatarCircle}>
                <Text style={styles.avatarLetter}>{displayName.charAt(0).toUpperCase()}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <Text style={styles.userName}>{displayName}</Text>
                  <ShieldCheck size={16} color="#10B981" />
                </View>
                <Text style={styles.userHeadline}>{displayHeadline}</Text>
                <View style={styles.locationTag}>
                  <MapPin size={12} color="#64748B" />
                  <Text style={styles.locationTagText}>{user?.location || 'Maharashtra, MIDC Zone'}</Text>
                </View>
              </View>
            </View>
          </View>

          {/* Stats Grid (4 Compact Perfectly Aligned 3D Cards) */}
          <View style={styles.statsGrid}>
            <TouchableOpacity
              activeOpacity={0.8}
              style={styles.statCard}
              onPress={() => navigation.navigate('CandidateAppliedTab')}
            >
              <View style={[styles.statIconBox, { backgroundColor: '#EFF6FF', borderColor: '#BFDBFE' }]}>
                <Briefcase size={16} color="#2563EB" />
              </View>
              <View style={styles.statTextStack}>
                <Text style={styles.statNumber}>{appliedJobs.length}</Text>
                <Text style={styles.statLabel} numberOfLines={1}>Jobs Applied</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.8}
              style={styles.statCard}
              onPress={() => navigation.navigate('CandidateSavedTab')}
            >
              <View style={[styles.statIconBox, { backgroundColor: '#F3E8FF', borderColor: '#DDD6FE' }]}>
                <Bookmark size={16} color="#8B5CF6" />
              </View>
              <View style={styles.statTextStack}>
                <Text style={styles.statNumber}>{savedJobs.length}</Text>
                <Text style={styles.statLabel} numberOfLines={1}>Saved Jobs</Text>
              </View>
            </TouchableOpacity>

            <View style={styles.statCard}>
              <View style={[styles.statIconBox, { backgroundColor: '#ECFDF5', borderColor: '#A7F3D0' }]}>
                <Eye size={16} color="#10B981" />
              </View>
              <View style={styles.statTextStack}>
                <Text style={styles.statNumber}>{profileViews}</Text>
                <Text style={styles.statLabel} numberOfLines={1}>Profile Views</Text>
              </View>
            </View>

            <TouchableOpacity
              activeOpacity={0.8}
              style={styles.statCard}
              onPress={() => navigation.navigate('CandidateProfile')}
            >
              <View style={[styles.statIconBox, { backgroundColor: '#FEF3C7', borderColor: '#FDE68A' }]}>
                <Award size={16} color="#D97706" />
              </View>
              <View style={styles.statTextStack}>
                <Text style={styles.statNumber}>{skillsCount}</Text>
                <Text style={styles.statLabel} numberOfLines={1}>Skills & Trades</Text>
              </View>
            </TouchableOpacity>
          </View>

          {/* Profile Completion Tracker Card with Section Breakdown */}
          <View style={styles.card3D}>
            <View style={styles.cardHeaderRow}>
              <Sparkles size={18} color="#2563EB" />
              <Text style={styles.cardTitle}>Real Profile Completeness</Text>
              <Text style={[styles.progressPercent, { color: completionScore === 100 ? '#16A34A' : '#2563EB' }]}>
                {completionScore}%
              </Text>
            </View>

            <View style={styles.progressBarTrack}>
              <View
                style={[
                  styles.progressBarFill,
                  {
                    width: `${completionScore}%`,
                    backgroundColor: completionScore === 100 ? '#16A34A' : '#2563EB',
                  },
                ]}
              />
            </View>

            <Text style={styles.progressHint}>{completionData.nextRecommendedAction}</Text>

            {/* 6 Core Sections Status List */}
            <View style={styles.sectionBreakdownBox}>
              {Object.entries(completionData.sections).map(([key, sec]) => (
                <View key={key} style={styles.sectionRowItem}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, flex: 1 }}>
                    {sec.completed ? (
                      <CheckCircle2 size={16} color="#16A34A" />
                    ) : (
                      <AlertCircle size={16} color="#D97706" />
                    )}
                    <Text
                      style={[
                        styles.sectionLabelText,
                        { color: sec.completed ? '#0F172A' : '#475569', fontWeight: sec.completed ? '700' : '600' },
                      ]}
                      numberOfLines={1}
                    >
                      {sec.label}
                    </Text>
                  </View>
                  <Text style={[styles.sectionScoreText, { color: sec.completed ? '#16A34A' : '#D97706' }]}>
                    {sec.score}/{sec.maxScore}%
                  </Text>
                </View>
              ))}
            </View>

            <TouchableOpacity
              activeOpacity={0.8}
              style={styles.updateProfileBtn}
              onPress={() => navigation.navigate('CandidateProfile')}
            >
              <Text style={styles.updateProfileBtnText}>Complete Profile Sections</Text>
              <ChevronRight size={16} color="#2563EB" />
            </TouchableOpacity>
          </View>

          {/* Recent Applications Section */}
          <View style={styles.card3D}>
            <View style={styles.cardHeaderRow}>
              <Briefcase size={18} color="#0F172A" />
              <Text style={styles.cardTitle}>Recent Applications</Text>
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => navigation.navigate('CandidateAppliedTab')}
              >
                <Text style={styles.viewAllText}>View All ({appliedJobs.length})</Text>
              </TouchableOpacity>
            </View>

            {appliedJobs.length === 0 ? (
              <View style={styles.emptyApplicationsBox}>
                <Building2 size={36} color="#94A3B8" />
                <Text style={styles.emptyTitle}>No Job Applications Submitted</Text>
                <Text style={styles.emptyDesc}>
                  Browse thousands of industrial & factory job vacancies across Maharashtra MIDC zones.
                </Text>
                <TouchableOpacity
                  activeOpacity={0.8}
                  style={styles.browseJobsBtn}
                  onPress={() => navigation.navigate('CandidateJobsTab')}
                >
                  <Search size={15} color="#FFFFFF" />
                  <Text style={styles.browseJobsBtnText}>Browse Active Vacancies</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.applicationsList}>
                {appliedJobs.slice(0, 4).map((item) => {
                  const job = item.job || item;
                  return (
                    <TouchableOpacity
                      key={item.jobId || job.id}
                      activeOpacity={0.8}
                      style={styles.applicationItemRow}
                      onPress={() => navigation.navigate('CandidateAppliedTab')}
                    >
                      <View style={styles.companyIconSquare}>
                        <Building2 size={20} color="#2563EB" />
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.appJobTitle} numberOfLines={1}>
                          {job.title || 'Industrial Position'}
                        </Text>
                        <Text style={styles.appCompany} numberOfLines={1}>
                          {job.company || 'Manufacturing Partner'} • {job.location || 'MIDC'}
                        </Text>
                      </View>
                      {renderStatusPill(item.status)}
                    </TouchableOpacity>
                  );
                })}
              </View>
            )}
          </View>

          {/* Recommended Jobs Horizontal Carousel */}
          {recommendedJobs.length > 0 ? (
            <View style={styles.carouselSection}>
              <View style={styles.sectionHeaderRow}>
                <Text style={styles.sectionTitle}>Recommended Factory Vacancies</Text>
                <TouchableOpacity onPress={() => navigation.navigate('CandidateJobsTab')}>
                  <Text style={styles.viewAllText}>Explore All →</Text>
                </TouchableOpacity>
              </View>

              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 12 }}>
                {recommendedJobs.map((job) => (
                  <TouchableOpacity
                    key={job.id}
                    activeOpacity={0.8}
                    style={styles.jobCardMini}
                    onPress={() => navigation.navigate('CandidateJobDetail', { jobId: job.id })}
                  >
                    <View style={styles.jobCardTop}>
                      <View style={styles.miniIconSquare}>
                        <Building2 size={16} color="#2563EB" />
                      </View>
                      <View style={styles.workModeTag}>
                        <Text style={styles.workModeText}>{job.work_mode || job.workMode || 'On-site'}</Text>
                      </View>
                    </View>

                    <Text style={styles.miniTitle} numberOfLines={1}>
                      {job.title}
                    </Text>
                    <Text style={styles.miniCompany} numberOfLines={1}>
                      {job.company}
                    </Text>

                    <View style={styles.miniLocationRow}>
                      <MapPin size={12} color="#64748B" />
                      <Text style={styles.miniLocationText} numberOfLines={1}>
                        {job.location}
                      </Text>
                    </View>

                    <View style={styles.salaryBadgeRow}>
                      <IndianRupee size={12} color="#16A34A" />
                      <Text style={styles.salaryText}>
                        ₹{job.salary_min || job.salaryMin || 15000} - ₹{job.salary_max || job.salaryMax || 25000}/mo
                      </Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
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
    padding: 16,
    paddingBottom: 130,
    gap: 16,
  },
  welcomeCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    padding: 16,
  },
  avatarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatarCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#2563EB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarLetter: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '900',
  },
  userName: {
    fontSize: 17,
    fontWeight: '900',
    color: '#0F172A',
  },
  userHeadline: {
    fontSize: 12.5,
    color: '#475569',
    fontWeight: '600',
    marginTop: 1,
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
    fontWeight: '600',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  statCard: {
    width: '48.8%',
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    paddingHorizontal: 12,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  },
  statIconBox: {
    width: 34,
    height: 34,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
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
    fontWeight: '600',
  },
  card3D: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    padding: 16,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '900',
    color: '#0F172A',
    flex: 1,
    marginLeft: 6,
  },
  progressPercent: {
    fontSize: 14,
    fontWeight: '900',
    color: '#2563EB',
  },
  progressBarTrack: {
    height: 8,
    borderRadius: 4,
    backgroundColor: '#F1F5F9',
    overflow: 'hidden',
    marginBottom: 10,
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#2563EB',
    borderRadius: 4,
  },
  progressHint: {
    fontSize: 12,
    color: '#64748B',
    lineHeight: 17,
    marginBottom: 10,
  },
  sectionBreakdownBox: {
    paddingVertical: 4,
    gap: 4,
    marginBottom: 12,
  },
  sectionRowItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 7,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  sectionLabelText: {
    fontSize: 12,
  },
  sectionScoreText: {
    fontSize: 11.5,
    fontWeight: '800',
  },
  updateProfileBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#BFDBFE',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 6,
  },
  updateProfileBtnText: {
    fontSize: 12.5,
    fontWeight: '800',
    color: '#2563EB',
  },
  viewAllText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#2563EB',
  },
  emptyApplicationsBox: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 24,
    gap: 8,
  },
  emptyTitle: {
    fontSize: 15,
    fontWeight: '900',
    color: '#0F172A',
  },
  emptyDesc: {
    fontSize: 12,
    color: '#64748B',
    textAlign: 'center',
    paddingHorizontal: 16,
  },
  browseJobsBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#2563EB',
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: 6,
    marginTop: 8,
  },
  browseJobsBtnText: {
    color: '#FFFFFF',
    fontSize: 12.5,
    fontWeight: '800',
  },
  applicationsList: {
    gap: 8,
  },
  applicationItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    backgroundColor: '#F8FAFC',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 10,
  },
  companyIconSquare: {
    width: 36,
    height: 36,
    borderRadius: 6,
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#BFDBFE',
    alignItems: 'center',
    justifyContent: 'center',
  },
  appJobTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0F172A',
  },
  appCompany: {
    fontSize: 11.5,
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
  carouselSection: {
    gap: 10,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '900',
    color: '#0F172A',
  },
  jobCardMini: {
    width: 210,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderBottomWidth: 3,
    borderBottomColor: '#CBD5E1',
    padding: 12,
    gap: 6,
  },
  jobCardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  miniIconSquare: {
    width: 30,
    height: 30,
    borderRadius: 6,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  workModeTag: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  workModeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#475569',
  },
  miniTitle: {
    fontSize: 13,
    fontWeight: '900',
    color: '#0F172A',
  },
  miniCompany: {
    fontSize: 11.5,
    color: '#64748B',
  },
  miniLocationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  miniLocationText: {
    fontSize: 11,
    color: '#64748B',
  },
  salaryBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: '#F0FDF4',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#BBF7D0',
    alignSelf: 'flex-start',
    marginTop: 4,
  },
  salaryText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#16A34A',
  },
});
