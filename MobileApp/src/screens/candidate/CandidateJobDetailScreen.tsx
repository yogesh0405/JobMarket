import { COLORS, RADIUS } from '../../constants/theme';
import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Share,
  Platform,
  StatusBar,
} from 'react-native';
import {
  CheckCircle2,
  Send,
  ArrowLeft,
  MapPin,
} from 'lucide-react-native';
import { useFocusEffect } from '@react-navigation/native';
import { jobsApi } from '../../api/jobsApi';
import { candidateApi } from '../../api/candidateApi';
import { isValidId } from '../../api/client';
import { Job } from '../../types';
import { Skeleton as SkeletonLoader } from '../../components/common/SkeletonLoader';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../context/ToastContext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { JobLocationMapPreview } from '../../components/map/JobLocationMapPreview';
import { logger } from '../../utils/logger';
import { FALLBACK_SEED_JOBS } from '../../constants/seedJobs';
import { appliedJobsStore } from '../../utils/appliedJobsStore';
import { savedJobsStore } from '../../utils/savedJobsStore';
import { CandidateJobDetailHeader } from './components/CandidateJobDetailHeader';

interface Props {
  navigation: any;
  route: any;
}

export const CandidateJobDetailScreen: React.FC<Props> = ({ navigation, route }) => {
  const extractJobIdFromUrl = (input?: string): string | undefined => {
    if (!input || typeof input !== 'string') return undefined;
    const str = input.trim();
    if (str.includes('/') || str.includes('?')) {
      const queryMatch = str.match(/[?&](?:jobId|id|job_id)=([^&]+)/i);
      if (queryMatch && queryMatch[1]) return queryMatch[1];
      const uuidMatch = str.match(/([a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12})/i);
      if (uuidMatch) return uuidMatch[1];
      const urlClean = str.split('?')[0].split('#')[0];
      const matchJobPath = urlClean.match(/job[s]?\/([^\/]+)/i);
      if (matchJobPath && matchJobPath[1]) return matchJobPath[1];
      const segments = urlClean.split('/').filter(Boolean);
      const lastSeg = segments[segments.length - 1];
      if (lastSeg && lastSeg !== 'job' && lastSeg !== 'jobs') return lastSeg;
    }
    return str;
  };

  const rawParamId = route?.params?.jobId || route?.params?.id || route?.params?.job_id;
  const passedJob = route?.params?.job as Job | undefined;
  const initialJobId = extractJobIdFromUrl(rawParamId) || passedJob?.id;

  const findSeedJob = (targetId?: string): Job | undefined => {
    if (!targetId) return undefined;
    const cleanId = String(targetId).trim().toLowerCase();
    return FALLBACK_SEED_JOBS.find(
      (j) =>
        j.id.toLowerCase() === cleanId ||
        j.id.toLowerCase() === `j${cleanId}` ||
        cleanId === `j${j.id.toLowerCase()}`
    );
  };

  const [activeJobId, setActiveJobId] = useState<string | undefined>(initialJobId);
  const { user } = useAuth();
  const { showToast } = useToast();
  const insets = useSafeAreaInsets();

  const initialFallbackJob = passedJob || findSeedJob(initialJobId);
  const [job, setJob] = useState<Job | null>(initialFallbackJob || null);
  const [loading, setLoading] = useState(!initialFallbackJob);
  const [isSaved, setIsSaved] = useState(false);
  const [hasApplied, setHasApplied] = useState(false);
  const [appliedItem, setAppliedItem] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'job_overview' | 'company_info'>('job_overview');

  // Synchronize state whenever screen receives new navigation parameters
  useEffect(() => {
    const pId = route?.params?.jobId || route?.params?.id || route?.params?.job_id;
    const pJob = route?.params?.job as Job | undefined;
    const resolvedId = extractJobIdFromUrl(pId) || pJob?.id;

    if (pJob) {
      setJob(pJob);
      setActiveJobId(pJob.id);
      setLoading(false);
    } else if (resolvedId) {
      setActiveJobId(resolvedId);
      const seed = findSeedJob(resolvedId);
      if (seed) {
        setJob(seed);
        setLoading(false);
      } else {
        setLoading(true);
      }
    }
  }, [route?.params]);

  useEffect(() => {
    if (!isValidId(activeJobId)) return;
    const jobId = activeJobId!;
    let mounted = true;

    const fetchDetails = async () => {
      const seedJob = findSeedJob(jobId);
      if (seedJob && mounted) {
        setJob(seedJob);
        setLoading(false);
      } else if (!passedJob && mounted) {
        setLoading(true);
      }

      try {
        const jobRes = await jobsApi.getJobById(jobId).catch(() => null);
        if (mounted) {
          const rawJob: any = jobRes;
          const parsedJob: Job | null = rawJob?.data || (rawJob?.id ? rawJob : null);
          if (parsedJob) {
            setJob(parsedJob);
          }
        }
      } catch (err) {
        logger.warn('Failed fetching API job details:', err);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchDetails();
    return () => {
      mounted = false;
    };
  }, [activeJobId]);

  const syncApplicationStatus = useCallback(() => {
    const targetJob = job || passedJob;
    const jobIdToCheck = targetJob?.id || activeJobId;
    if (!jobIdToCheck) return;

    const isMatched = appliedJobsStore.hasApplied(jobIdToCheck);
    const storedApplied = appliedJobsStore.getAppliedJob(jobIdToCheck);

    setHasApplied(Boolean(isMatched));
    if (storedApplied) {
      setAppliedItem(storedApplied);
    }

    candidateApi
      .getAppliedJobs()
      .then((appRes) => {
        if (Array.isArray(appRes?.data)) {
          const found = appRes.data.find(
            (a: any) =>
              String(a.job_id || a.jobId || a.job?.id || a.id).toLowerCase() ===
              String(jobIdToCheck).toLowerCase()
          );
          if (found) {
            setHasApplied(true);
            setAppliedItem(found);
            const actualJob = (found as any).job || found;
            if (actualJob && actualJob.id) {
              appliedJobsStore.addAppliedJob(actualJob);
            }
          }
        }
      })
      .catch(() => {});

    // Check saved state from reactive store first
    if (savedJobsStore.isSaved(jobIdToCheck)) {
      setIsSaved(true);
    }

    candidateApi
      .getSavedJobs()
      .then((savedRes) => {
        let jobsList: Job[] = [];
        if (Array.isArray(savedRes)) {
          jobsList = savedRes;
        } else if (savedRes && Array.isArray(savedRes.data)) {
          jobsList = savedRes.data;
        } else if (savedRes && (savedRes as any).success && Array.isArray((savedRes as any).jobs)) {
          jobsList = (savedRes as any).jobs;
        }
        if (jobsList.length > 0) {
          savedJobsStore.setSavedJobs(jobsList);
        }
        const saved = savedJobsStore.isSaved(jobIdToCheck) || jobsList.some(
          (j: any) => String(j.id).toLowerCase() === String(jobIdToCheck).toLowerCase()
        );
        setIsSaved(saved);
      })
      .catch(() => {});
  }, [job?.id, activeJobId, passedJob?.id]);

  useEffect(() => {
    syncApplicationStatus();
    const unsubscribeApplied = appliedJobsStore.subscribe(syncApplicationStatus);
    const unsubscribeSaved = savedJobsStore.subscribe(() => {
      const targetJob = job || passedJob;
      const jobIdToCheck = targetJob?.id || activeJobId;
      if (jobIdToCheck) {
        setIsSaved(savedJobsStore.isSaved(jobIdToCheck));
      }
    });
    return () => {
      unsubscribeApplied();
      unsubscribeSaved();
    };
  }, [syncApplicationStatus, job?.id, passedJob?.id, activeJobId]);

  useFocusEffect(
    useCallback(() => {
      syncApplicationStatus();
    }, [syncApplicationStatus])
  );

  const handleToggleSave = async () => {
    const targetJob = job || passedJob;
    const jobId = targetJob?.id || activeJobId;
    if (!jobId) return;

    const previousSaved = isSaved;
    try {
      const nextSavedState = await savedJobsStore.toggleSave(targetJob || { id: jobId } as Job);
      setIsSaved(nextSavedState);
      if (nextSavedState) {
        showToast('Job saved to bookmarks!', 'success');
      } else {
        showToast('Job removed from bookmarks', 'info');
      }
    } catch (err: any) {
      setIsSaved(previousSaved);
      showToast(err.message || 'Failed to update saved job status', 'error');
    }
  };

  const handleApply = () => {
    const targetJob = job || passedJob;
    const jobId = targetJob?.id || activeJobId;
    if (!jobId) return;

    if (!user) {
      Alert.alert(
        'Login Required',
        'Please login to submit your application for this factory job opening.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Login', onPress: () => navigation.navigate('EmployerLogin') },
        ]
      );
      return;
    }

    if (hasApplied) {
      showToast('You have already applied for this job opening', 'info');
      return;
    }

    navigation.navigate('CandidateApplyConfirm', {
      job: targetJob,
    });
  };

  const handleShareJob = async () => {
    const targetJob = job || passedJob;
    const jobIdStr = activeJobId || targetJob?.id || '';
    const canonicalHttpsUrl = jobIdStr
      ? `https://job-market-wine.vercel.app/job/${jobIdStr}`
      : 'https://job-market-wine.vercel.app';
    const titleStr = targetJob?.title
      ? `${targetJob.title} - ${targetJob.company || 'Industrial Company'}`
      : 'Industrial Job Vacancy';
    const locationStr = targetJob?.location || 'MIDC Industrial Zone';

    let salStr = 'Competitive Salary Package';
    if (targetJob) {
      const minSal = targetJob.salary_min || targetJob.salaryMin;
      const maxSal = targetJob.salary_max || targetJob.salaryMax;
      if (minSal && maxSal) {
        salStr = `₹${Math.round(minSal / 1000)}k - ₹${Math.round(maxSal / 1000)}k / month`;
      }
    }

    const shareMsg = `🔥 Industrial Job Opening!\n\n📋 Role: ${targetJob?.title || 'Technical Specialist'}\n🏢 Company: ${targetJob?.company || 'Industrial Company'}\n📍 Location: ${locationStr}\n💰 Salary: ${salStr}\n\n👉 Apply / View Details:\n${canonicalHttpsUrl}`;

    try {
      if (Platform.OS === 'ios') {
        await Share.share({ title: titleStr, message: shareMsg, url: canonicalHttpsUrl });
      } else {
        await Share.share({ title: titleStr, message: shareMsg }, { dialogTitle: titleStr });
      }
    } catch (error: any) {
      logger.warn('Share error:', error);
      showToast(error.message || 'Could not open share options', 'error');
    }
  };

  const handleBackNavigation = () => {
    if (navigation.canGoBack()) {
      navigation.goBack();
    } else {
      navigation.navigate('CandidateTab', { screen: 'CandidateHomeTab' });
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <ScrollView contentContainerStyle={styles.scrollContentBody} showsVerticalScrollIndicator={false}>
          <View style={styles.profileHeaderMasterCard}>
            <SkeletonLoader width="100%" height={110} style={{ borderRadius: 0 }} />
          </View>
          <View style={styles.cardBlockContainer}>
            <SkeletonLoader width="70%" height={20} style={{ borderRadius: 0 }} />
            <SkeletonLoader width="40%" height={14} style={{ borderRadius: 0, marginTop: 8 }} />
          </View>
        </ScrollView>
      </View>
    );
  }

  if (!job) {
    return (
      <View style={styles.container}>
        <View style={{ paddingTop: Math.max(insets.top, 12), paddingHorizontal: 16 }}>
          <TouchableOpacity onPress={handleBackNavigation} style={{ padding: 4 }} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
            <ArrowLeft size={22} color="#1E293B" strokeWidth={2} />
          </TouchableOpacity>
        </View>

        <View style={{ flex: 1, padding: 20, alignItems: 'center', justifyContent: 'center' }}>
          <View
            style={{
              backgroundColor: '#FFFFFF',
              borderWidth: 1,
              borderColor: '#CBD5E1',
              padding: 24,
              borderRadius: 0,
              width: '100%',
              alignItems: 'center',
              gap: 12,
            }}
          >
            <Text style={{ fontSize: 16, fontWeight: '800', color: '#0F172A' }}>Job Vacancy Not Found</Text>
            <Text style={{ fontSize: 12.5, color: '#64748B', textAlign: 'center' }}>
              The requested job opening may have been filled or expired.
            </Text>
            <TouchableOpacity
              activeOpacity={0.85}
              style={{
                backgroundColor: COLORS.primary,
                paddingHorizontal: 16,
                paddingVertical: 10,
                borderRadius: 0,
                marginTop: 6,
              }}
              onPress={handleBackNavigation}
            >
              <Text style={{ color: '#FFFFFF', fontWeight: '800', fontSize: 13 }}>Browse Other Jobs</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  }

  const perksList: string[] = job.perks || [];
  if (job.bus_facility || job.busFacility) perksList.push('Bus / Transport Facility');
  if (job.accommodation) perksList.push('Hostel / Accommodation');
  if (job.canteen) perksList.push('Subsidized Canteen');
  if (job.overtime) perksList.push('Overtime Pay (OT)');
  if (job.joining_bonus || job.joiningBonus) perksList.push('Joining Bonus');
  if (job.attendance_bonus || job.attendanceBonus) perksList.push('Attendance Bonus');

  const uniquePerks = Array.from(new Set(perksList));
  const minExp = job.min_experience ?? (job as any).minExperience ?? 0;
  const maxExp = job.max_experience ?? (job as any).maxExperience ?? 3;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" translucent={false} />

      {/* 1. Full-Width Edge-to-Edge Blue Header Banner with Tabs */}
      <CandidateJobDetailHeader
        job={job}
        isSaved={isSaved}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onBack={handleBackNavigation}
        onShare={handleShareJob}
        onToggleSave={handleToggleSave}
        onCompanyPress={() => {
          const companyId = (job as any).company_id || (job as any).companyId || job.company;
          navigation.navigate('CompanyProfile', { companyId, name: job.company });
        }}
      />

      {/* 2. Main Content Scroll Area */}
      <ScrollView
        contentContainerStyle={[
          styles.scrollContentBody,
          { paddingBottom: Math.max(insets.bottom + 140, 160) },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.cardBlockContainer}>
          {activeTab === 'job_overview' ? (
            <>
              <View style={styles.sectionHeaderRow}>
                <Text style={styles.sectionTitleText}>Key Specifications</Text>
              </View>

              <View style={styles.specGrid2Col}>
                <View style={styles.specGridItem}>
                  <Text style={styles.specLabelText}>Trade / Role</Text>
                  <Text style={styles.specValueText} numberOfLines={1}>{job.trade || job.title}</Text>
                </View>

                <View style={styles.specGridItem}>
                  <Text style={styles.specLabelText}>Total Openings</Text>
                  <Text style={styles.specValueText} numberOfLines={1}>
                    {job.openings || (job as any).vacancies ? `${job.openings || (job as any).vacancies} Vacancies` : '1 Open Position'}
                  </Text>
                </View>

                {(job.salary_min || job.salaryMin || job.salary_max || job.salaryMax) ? (
                  <View style={styles.specGridItem}>
                    <Text style={styles.specLabelText}>Salary Package</Text>
                    <Text style={styles.specValueText} numberOfLines={1}>
                      ₹{job.salary_min || job.salaryMin || 0} - ₹{job.salary_max || job.salaryMax || 0} / mo
                    </Text>
                  </View>
                ) : null}

                <View style={styles.specGridItem}>
                  <Text style={styles.specLabelText}>Experience Required</Text>
                  <Text style={styles.specValueText} numberOfLines={1}>{minExp} - {maxExp} Years</Text>
                </View>

                {(job.work_mode || job.workMode || job.job_type || job.jobType) ? (
                  <View style={styles.specGridItem}>
                    <Text style={styles.specLabelText}>Work Mode</Text>
                    <Text style={styles.specValueText} numberOfLines={1}>{job.work_mode || job.workMode || job.job_type || job.jobType}</Text>
                  </View>
                ) : null}

                {job.location ? (
                  <View style={styles.specGridItemFull}>
                    <Text style={styles.specLabelText}>Plant Location / Address</Text>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 3 }}>
                      <MapPin size={14} color={COLORS.primary} />
                      <Text style={styles.specValueText} numberOfLines={2}>{job.location}</Text>
                    </View>
                  </View>
                ) : null}
              </View>

              {Array.isArray(job.skills) && job.skills.length > 0 ? (
                <>
                  <View style={styles.sectionDividerSlate} />
                  <View style={styles.sectionHeaderRow}>
                    <Text style={styles.sectionTitleText}>Required Technical Skills</Text>
                  </View>

                  <View style={styles.bulletList}>
                    {job.skills.map((skill, idx) => (
                      <View key={idx} style={styles.bulletItemRow}>
                        <Text style={styles.bulletDotText}>•</Text>
                        <Text style={styles.bulletItemText}>{skill}</Text>
                      </View>
                    ))}
                  </View>
                </>
              ) : null}

              <View style={styles.sectionDividerSlate} />
              <View style={styles.sectionHeaderRow}>
                <Text style={styles.sectionTitleText}>Role Description</Text>
              </View>
              <Text style={styles.bodyTextText}>
                {job.description || 'No detailed description provided for this industrial opening.'}
              </Text>

              {Array.isArray(job.responsibilities) && job.responsibilities.length > 0 ? (
                <>
                  <View style={styles.sectionDividerSlate} />
                  <View style={styles.sectionHeaderRow}>
                    <Text style={styles.sectionTitleText}>Key Responsibilities</Text>
                  </View>
                  <View style={styles.bulletList}>
                    {job.responsibilities.map((resp, idx) => (
                      <View key={idx} style={styles.bulletItemRow}>
                        <Text style={styles.bulletDotText}>•</Text>
                        <Text style={styles.bulletItemText}>{resp}</Text>
                      </View>
                    ))}
                  </View>
                </>
              ) : null}
            </>
          ) : (
            <>
              {Array.isArray(job.requirements) && job.requirements.length > 0 ? (
                <View style={{ marginBottom: 12 }}>
                  <View style={styles.sectionHeaderRow}>
                    <Text style={styles.sectionTitleText}>Requirements & Eligibility</Text>
                  </View>
                  <View style={styles.bulletList}>
                    {job.requirements.map((req, idx) => (
                      <View key={idx} style={styles.bulletItemRow}>
                        <Text style={styles.bulletDotText}>•</Text>
                        <Text style={styles.bulletItemText}>{req}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              ) : null}

              {uniquePerks.length > 0 ? (
                <View style={{ marginBottom: 12 }}>
                  <View style={styles.sectionHeaderRow}>
                    <Text style={styles.sectionTitleText}>Perks & Facilities Offered</Text>
                  </View>
                  <View style={styles.bulletList}>
                    {uniquePerks.map((perk, idx) => (
                      <View key={idx} style={styles.bulletItemRow}>
                        <Text style={styles.bulletDotText}>•</Text>
                        <Text style={styles.bulletItemText}>{perk}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              ) : null}

              <View style={styles.sectionHeaderRow}>
                <Text style={styles.sectionTitleText}>Location</Text>
              </View>
              <JobLocationMapPreview
                locationName={job.location}
                latitude={(job as any).latitude ? Number((job as any).latitude) : undefined}
                longitude={(job as any).longitude ? Number((job as any).longitude) : undefined}
              />
            </>
          )}
        </View>
      </ScrollView>

      {/* BOTTOM FIXED CTA ACTION BAR */}
      <View style={[styles.bottomActionBar, { paddingBottom: Math.max(insets.bottom + 10, 20) }]}>
        {hasApplied ? (
          <View style={styles.appliedStatusCard}>
            <CheckCircle2 size={18} color="#16A34A" />
            <View style={{ flex: 1 }}>
              <Text style={styles.appliedStatusTitle}>Application Submitted</Text>
              <Text style={styles.appliedStatusSub}>
                Status: {(appliedItem?.status || 'APPLIED').toUpperCase()}
              </Text>
            </View>
          </View>
        ) : (
          <TouchableOpacity style={styles.applyCtaBtn} activeOpacity={0.85} onPress={handleApply}>
            <Send size={16} color="#FFFFFF" strokeWidth={2.5} />
            <Text style={styles.applyCtaBtnText}>Apply Now</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F7F7',
  },
  scrollContentBody: {
    padding: 16,
  },
  profileHeaderMasterCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: RADIUS.card,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    overflow: 'hidden',
  },
  headerBodySeparatorSlate: {
    height: 1,
    backgroundColor: '#94A3B8',
    marginVertical: 14,
  },
  cardBlockContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: RADIUS.card,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    padding: 16,
  },
  sectionHeaderRow: {
    marginBottom: 8,
  },
  sectionTitleText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
  },
  sectionDividerSlate: {
    height: 1,
    backgroundColor: '#E2E8F0',
    marginVertical: 14,
  },
  specGrid2Col: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 4,
  },
  specGridItem: {
    width: '48%',
    backgroundColor: '#F8FAFC',
    padding: 10,
    borderRadius: 6,
  },
  specGridItemFull: {
    width: '100%',
    backgroundColor: '#F8FAFC',
    padding: 10,
    borderRadius: 6,
  },
  specLabelText: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '600',
  },
  specValueText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0F172A',
    marginTop: 2,
  },
  bulletList: {
    gap: 6,
  },
  bulletItemRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  bulletDotText: {
    fontSize: 14,
    color: COLORS.primary,
    fontWeight: '800',
  },
  bulletItemText: {
    fontSize: 13,
    color: '#334155',
    flex: 1,
    lineHeight: 18,
  },
  bodyTextText: {
    fontSize: 13,
    color: '#334155',
    lineHeight: 20,
  },
  bottomActionBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#CBD5E1',
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  applyCtaBtn: {
    height: 46,
    borderRadius: RADIUS.card,
    backgroundColor: COLORS.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  applyCtaBtnText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  appliedStatusCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#DCFCE7',
    borderWidth: 1,
    borderColor: '#BBF7D0',
    padding: 12,
    borderRadius: RADIUS.card,
  },
  appliedStatusTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#15803D',
  },
  appliedStatusSub: {
    fontSize: 11,
    color: '#166534',
    marginTop: 1,
  },
});
