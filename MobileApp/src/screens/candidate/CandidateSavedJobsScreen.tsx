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
          {[1, 2, 3].map((key) => (
            <View key={key} style={styles.savedCard3D}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                <SkeletonLoader width={40} height={40} style={{ borderRadius: 8 }} />
                <View style={{ flex: 1, gap: 6 }}>
                  <SkeletonLoader width="70%" height={16} style={{ borderRadius: 4 }} />
                  <SkeletonLoader width="50%" height={12} style={{ borderRadius: 4 }} />
                </View>
                <SkeletonLoader width={28} height={28} style={{ borderRadius: 14 }} />
              </View>

              <View style={{ flexDirection: 'row', gap: 8, marginTop: 4 }}>
                <SkeletonLoader width={85} height={22} style={{ borderRadius: 4 }} />
                <SkeletonLoader width={110} height={22} style={{ borderRadius: 4 }} />
              </View>

              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 4 }}>
                <SkeletonLoader width={90} height={12} style={{ borderRadius: 4 }} />
                <SkeletonLoader width={120} height={24} style={{ borderRadius: 6 }} />
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
              <Text style={styles.summaryTitle}>Saved Jobs</Text>
              <Text style={styles.summarySub}>Jobs saved for quick reference and direct application</Text>
            </View>
            <View style={styles.countBadge}>
              <Bookmark size={14} color="#2563EB" fill="#2563EB" />
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
            savedJobs.map((job) => {
              const logoUrl = job.companyLogo || (job as any).company_logo;
              return (
                <TouchableOpacity
                  key={job.id}
                  activeOpacity={0.85}
                  style={styles.savedCard3D}
                  onPress={() => navigation.navigate('CandidateJobDetail', { jobId: job.id })}
                >
                  <View style={styles.cardTopRow}>
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
                        {job.title}
                      </Text>
                      <Text style={styles.companyName} numberOfLines={1}>
                        {job.company || 'Industrial Enterprise'}
                      </Text>
                    </View>

                    <TouchableOpacity
                      style={styles.bookmarkBtn}
                      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                      onPress={(e) => {
                        e.stopPropagation();
                        handleUnsave(job.id);
                      }}
                    >
                      <Bookmark size={18} color="#2563EB" fill="#2563EB" />
                    </TouchableOpacity>
                  </View>

                  {/* Metadata Row */}
                  <View style={styles.metaRow}>
                    <View style={styles.metaBadge}>
                      <MapPin size={12} color="#2563EB" />
                      <Text style={styles.metaBadgeText}>{job.location || 'MIDC Zone'}</Text>
                    </View>

                    <View style={styles.metaBadge}>
                      <Briefcase size={12} color="#64748B" />
                      <Text style={styles.metaBadgeText}>{job.job_type || job.jobType || 'Full-time'}</Text>
                    </View>
                  </View>

                  {/* Footer Row */}
                  <View style={styles.cardFooterRow}>
                    <View style={styles.salaryPill}>
                      <IndianRupee size={12} color="#16A34A" />
                      <Text style={styles.salaryPillText}>
                        ₹{job.salary_min || job.salaryMin || 15000} - ₹{job.salary_max || job.salaryMax || 25000}/mo
                      </Text>
                    </View>

                    <View style={styles.applyActionBtn}>
                      <Text style={styles.applyActionText}>View & Apply</Text>
                      <ChevronRight size={14} color="#2563EB" />
                    </View>
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
    backgroundColor: '#2563EB',
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
  savedCard3D: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    padding: 14,
    gap: 10,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  },
  cardTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  companyIconSquare: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#CBD5E1',
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
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: -0.2,
  },
  companyName: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
    marginTop: 1,
  },
  bookmarkBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#BFDBFE',
    alignItems: 'center',
    justifyContent: 'center',
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
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#BFDBFE',
    paddingHorizontal: 7,
    paddingVertical: 2.5,
    borderRadius: 6,
  },
  metaBadgeText: {
    fontSize: 10.5,
    fontWeight: '700',
    color: '#2563EB',
  },
  cardFooterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  salaryPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: '#DCFCE7',
    borderWidth: 1,
    borderColor: '#86EFAC',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  salaryPillText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#15803D',
  },
  applyActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  applyActionText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#2563EB',
  },
});
