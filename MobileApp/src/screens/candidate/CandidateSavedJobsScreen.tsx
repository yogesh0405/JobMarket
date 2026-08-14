import { COLORS } from '../../constants/theme';
import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
  Image,
} from 'react-native';
import {
  Bookmark,
  Building2,
  MapPin,
  Briefcase,
  IndianRupee,
  ChevronRight,
  Trash2,
  Search,
} from 'lucide-react-native';
import { useFocusEffect } from '@react-navigation/native';
import { candidateApi } from '../../api/candidateApi';
import { Job } from '../../types';
import { Header } from '../../components/common/Header';
import { Skeleton as SkeletonLoader } from '../../components/common/SkeletonLoader';
import { useToast } from '../../context/ToastContext';



interface Props {
  navigation: any;
}

export const CandidateSavedJobsScreen: React.FC<Props> = ({ navigation }) => {
  const { showToast } = useToast();
  const [savedJobs, setSavedJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchSavedData = useCallback(async (showSkeleton = false) => {
    if (showSkeleton) setLoading(true);
    try {
      const res: any = await candidateApi.getSavedJobs();
      let jobsList: Job[] = [];

      if (Array.isArray(res)) {
        jobsList = res;
      } else if (res && Array.isArray(res.data)) {
        jobsList = res.data;
      } else if (res && res.success && Array.isArray(res.jobs)) {
        jobsList = res.jobs;
      }

      setSavedJobs(jobsList || []);
    } catch (e) {
      console.log('Error loading saved jobs from database:', e);
      setSavedJobs([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchSavedData(false);
    }, [fetchSavedData])
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchSavedData(false);
  };

  const handleUnsave = useCallback((jobId: string) => {
    setSavedJobs((prev) => prev.filter((j) => j.id !== jobId));
    showToast('Job removed !', 'info');
    candidateApi.toggleSaveJob(jobId).catch(() => {});
  }, [showToast]);

  return (
    <View style={styles.container}>
      <Header title="JobMarket" subtitle="Industrial & Factory Jobs" showBack={false} />

      {loading && !refreshing ? (
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <View style={styles.gridRowContainer}>
            {[1, 2, 3, 4].map((key) => (
              <View key={key} style={styles.gridCardSkeleton}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                  <SkeletonLoader width={36} height={36} style={{ borderRadius: 6 }} />
                  <SkeletonLoader width={24} height={24} style={{ borderRadius: 12 }} />
                </View>
                <SkeletonLoader width="85%" height={15} style={{ borderRadius: 4, marginTop: 8 }} />
                <SkeletonLoader width="60%" height={12} style={{ borderRadius: 4, marginTop: 4 }} />
                <SkeletonLoader width="75%" height={12} style={{ borderRadius: 4, marginTop: 10 }} />
              </View>
            ))}
          </View>
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
              <Text style={styles.summaryTitle}>Saved Vacancies</Text>
              <Text style={styles.summarySub}>Jobs saved for quick reference</Text>
            </View>
            <View style={styles.countBadge}>
              <Bookmark size={14} color={COLORS.primary} fill={COLORS.primary} />
              <Text style={styles.countBadgeText}>{savedJobs.length} Saved</Text>
            </View>
          </View>

          {savedJobs.length === 0 ? (
            <View style={styles.emptyCard}>
              <Bookmark size={44} color="#94A3B8" />
              <Text style={styles.emptyTitle}>No Saved Jobs Yet</Text>
              <Text style={styles.emptyDesc}>
                Tap the bookmark icon on any job card to save it for quick reference later.
              </Text>
              <TouchableOpacity
                activeOpacity={0.8}
                style={styles.browseBtn}
                onPress={() => navigation.navigate('CandidateJobsTab')}
              >
                <Search size={14} color="#FFFFFF" />
                <Text style={styles.browseBtnText}>Browse Industrial Jobs</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.gridRowContainer}>
              {savedJobs.map((job) => {
                const logoUrl = job.companyLogo || (job as any).company_logo;
                return (
                  <TouchableOpacity
                    key={job.id}
                    activeOpacity={0.88}
                    style={styles.gridCard}
                    onPress={() => navigation.navigate('CandidateJobDetail', { jobId: job.id, job: job })}
                  >
                    {/* Role Title & Bookmark Row (First Line) */}
                    <View style={styles.gridCardTitleRow}>
                      <Text style={styles.jobTitle} numberOfLines={2}>
                        {job.title}
                      </Text>

                      <TouchableOpacity
                        style={styles.bookmarkBtn}
                        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                        onPress={(e) => {
                          e.stopPropagation();
                          handleUnsave(job.id);
                        }}
                      >
                        <Bookmark size={15} color={COLORS.primary} fill={COLORS.primary} />
                      </TouchableOpacity>
                    </View>

                    {/* Company Name with Small Logo */}
                    <View style={styles.companyRow}>
                      <View style={styles.smallCompanyIconSquare}>
                        {logoUrl ? (
                          <Image
                            source={{ uri: logoUrl }}
                            style={styles.smallCompanyLogoImg}
                            resizeMode="contain"
                          />
                        ) : (
                          <Building2 size={11} color={COLORS.primary} />
                        )}
                      </View>
                      <Text style={styles.companyName} numberOfLines={1}>
                        {job.company || 'Industrial Enterprise'}
                      </Text>
                    </View>

                    {/* Job Type & Shift Pills Directly Below Company Name */}
                    <View style={styles.pillBadgeRow}>
                      <View style={styles.typePill}>
                        <Briefcase size={10} color="#475569" />
                        <Text style={styles.typePillText} numberOfLines={1}>{job.job_type || job.jobType || 'Full-time'}</Text>
                      </View>
                      {(job as any).shift_type || (job as any).shiftType ? (
                        <View style={styles.shiftPill}>
                          <Text style={styles.shiftPillText} numberOfLines={1}>{(job as any).shift_type || (job as any).shiftType}</Text>
                        </View>
                      ) : null}
                    </View>

                    <View style={styles.gridCardDivider} />

                    {/* Location & Salary Below Divider */}
                    <View style={styles.gridCardFooterInfo}>
                      <View style={styles.metaItemRow}>
                        <MapPin size={11} color={COLORS.primary} />
                        <Text style={styles.metaText} numberOfLines={1}>{job.location || 'MIDC Industrial Zone'}</Text>
                      </View>

                      {job.salary_max || job.salaryMax ? (
                        <View style={styles.metaItemRow}>
                          <IndianRupee size={11} color="#0F172A" />
                          <Text style={styles.salaryText} numberOfLines={1}>
                            ₹{job.salary_min || job.salaryMin || 15000} - ₹{job.salary_max || job.salaryMax}/mo
                          </Text>
                        </View>
                      ) : null}
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
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
    color: COLORS.primary,
  },
  emptyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    padding: 36,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
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
  },
  browseBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: COLORS.primary,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    marginTop: 6,
  },
  browseBtnText: {
    color: '#FFFFFF',
    fontSize: 12.5,
    fontWeight: '800',
  },
  /* 2-Column Grid Layout */
  gridRowContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  gridCard: {
    width: '48.5%',
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    padding: 12,
    gap: 8,
    justifyContent: 'space-between',
  },
  gridCardSkeleton: {
    width: '48.5%',
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    padding: 12,
    height: 150,
  },
  gridCardTitleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 6,
  },
  jobTitle: {
    flex: 1,
    fontSize: 13.5,
    fontWeight: '800',
    color: '#0F172A',
    lineHeight: 18,
  },
  companyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginTop: -2,
  },
  smallCompanyIconSquare: {
    width: 20,
    height: 20,
    borderRadius: 4,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  smallCompanyLogoImg: {
    width: 18,
    height: 18,
    borderRadius: 3,
  },
  companyName: {
    fontSize: 11.5,
    fontWeight: '600',
    color: '#64748B',
    flex: 1,
  },
  bookmarkBtn: {
    padding: 2,
    backgroundColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
  },
  gridCardDivider: {
    height: 1,
    backgroundColor: '#E2E8F0',
  },
  gridCardFooterInfo: {
    gap: 4,
  },
  metaItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#64748B',
    flex: 1,
  },
  pillBadgeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
    marginVertical: 2,
  },
  typePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: 'transparent',
  },
  typePillText: {
    fontSize: 10.5,
    fontWeight: '600',
    color: '#64748B',
  },
  shiftPill: {
    backgroundColor: 'transparent',
  },
  shiftPillText: {
    fontSize: 10.5,
    fontWeight: '600',
    color: '#64748B',
  },
  salaryText: {
    fontSize: 11.5,
    fontWeight: '800',
    color: '#0F172A',
    flex: 1,
  },
});
