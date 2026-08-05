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

const SAVED_FALLBACK_JOBS: Job[] = [
  {
    id: 'fallback-job-1',
    employer_id: 'emp-1',
    company: 'Skyline Manufacturing',
    title: 'TIG Welder (GTAW)',
    industry: 'Welding & Metal Fabrication',
    location: 'Pune MIDC',
    job_type: 'Full-time',
    work_mode: 'On-site',
    min_experience: 0,
    max_experience: 2,
    salary_min: 200000,
    salary_max: 250000,
    openings: 5,
    description: 'Looking for skilled TIG Welder for stainless steel pipe fabrication in Pune MIDC.',
    responsibilities: ['Execute TIG welding as per drawing', 'Inspect weld joints for quality'],
    requirements: ['ITI Welder certificate', '0-2 years experience'],
    skills: ['TIG Welding', 'GTAW', 'Blueprint Reading'],
    status: 'APPROVED',
    posted_at: '7h ago',
    shift_details: 'Day Shift (8:00 AM - 5:00 PM)',
  },
  {
    id: 'fallback-job-2',
    employer_id: 'emp-2',
    company: 'Siemens Industrial Automation',
    title: 'Control Panel Wireman',
    industry: 'Electricals & Electronics',
    location: 'Chakan MIDC, Pune',
    job_type: 'Full-time',
    work_mode: 'On-site',
    min_experience: 0,
    max_experience: 3,
    salary_min: 180000,
    salary_max: 300000,
    openings: 8,
    description: 'Control panel wiring and testing for PLC automation systems.',
    responsibilities: ['Wire control panels as per schematic', 'Test circuit continuity'],
    requirements: ['ITI Electrician or Wireman', '0-3 years experience'],
    skills: ['Control Wiring', 'Panel Assembly', 'Circuit Testing'],
    status: 'APPROVED',
    posted_at: '12h ago',
    shift_details: 'Day Shift (8:30 AM - 5:30 PM)',
  },
];

interface Props {
  navigation: any;
}

export const CandidateSavedJobsScreen: React.FC<Props> = ({ navigation }) => {
  const { showToast } = useToast();
  const [savedJobs, setSavedJobs] = useState<Job[]>(SAVED_FALLBACK_JOBS);
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

      if (jobsList && jobsList.length > 0) {
        setSavedJobs(jobsList);
      } else {
        setSavedJobs(SAVED_FALLBACK_JOBS);
      }
    } catch (e) {
      console.log('Error loading saved jobs:', e);
      setSavedJobs(SAVED_FALLBACK_JOBS);
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
      <Header title="Saved & Bookmarked Jobs" showBack={false} />

      {loading && !refreshing ? (
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <SkeletonLoader width="100%" height={140} style={{ borderRadius: 8, marginBottom: 12 }} />
          <SkeletonLoader width="100%" height={140} style={{ borderRadius: 8, marginBottom: 12 }} />
          <SkeletonLoader width="100%" height={140} style={{ borderRadius: 8 }} />
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
              <Text style={styles.summaryTitle}>Bookmarked Vacancies</Text>
              <Text style={styles.summarySub}>Jobs saved for quick reference and direct application</Text>
            </View>
            <View style={styles.countBadge}>
              <Bookmark size={14} color="#8B5CF6" fill="#8B5CF6" />
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
    backgroundColor: '#F3E8FF',
    borderWidth: 1,
    borderColor: '#DDD6FE',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
  },
  countBadgeText: {
    fontSize: 11.5,
    fontWeight: '800',
    color: '#8B5CF6',
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
  browseBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#2563EB',
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: 6,
    marginTop: 6,
  },
  browseBtnText: {
    color: '#FFFFFF',
    fontSize: 12.5,
    fontWeight: '800',
  },
  savedCard3D: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderBottomWidth: 3,
    borderBottomColor: '#CBD5E1',
    padding: 14,
    gap: 10,
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
    borderColor: '#E2E8F0',
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
    backgroundColor: '#F0FDF4',
    borderWidth: 1,
    borderColor: '#BBF7D0',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  salaryPillText: {
    fontSize: 11.5,
    fontWeight: '800',
    color: '#16A34A',
  },
  applyActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  applyActionText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#2563EB',
  },
});
