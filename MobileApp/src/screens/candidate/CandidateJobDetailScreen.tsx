import { COLORS, RADIUS } from '../../constants/theme';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { runOnJS } from 'react-native-reanimated';
import React, { useState, useEffect, useCallback, useRef } from 'react';
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
  BackHandler,
  Linking,
  Animated,
  Dimensions,
} from 'react-native';
import {
  CheckCircle2,
  Send,
  ArrowLeft,
  MapPin,
  Ticket,
  ShieldCheck,
  AlertCircle,
  ChevronRight,
  Check,
  Globe,
  Calendar,
  Clock,
  Phone,
  ExternalLink,
  Briefcase,
  Share2,
  Bookmark,
  Flag,
  Users,
  IndianRupee,
  GraduationCap,
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
import { reportedJobsStore, ReportedJobMetadata } from '../../utils/reportedJobsStore';
import { CandidateJobDetailHeader } from './components/CandidateJobDetailHeader';
import { formatTimeAgo } from './components/CandidateJobSearchUtils';
import { shareJob } from '../../utils/shareUtils';
import { FocusAwareStatusBar } from '../../components/common/FocusAwareStatusBar';
import { CompanyLogoAvatar } from '../../components/common/CompanyLogoAvatar';
import { MetaVerifiedBadge } from '../../components/common/MetaVerifiedBadge';
import { SimilarJobsIcon } from '../../components/common/SimilarJobsIcon';

const SCREEN_WIDTH = Dimensions.get('window').width;

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

  const normalizeJob = (raw: any): Job | null => {
    if (!raw) return null;
    return {
      ...raw,
      id: raw.id || raw.job_id || raw.jobId || String(raw._id || ''),
      title: raw.title || raw.job_title || raw.jobTitle || raw.role || 'Job Opportunity',
      company: raw.company || raw.company_name || raw.companyName || 'Industrial Partner',
      location: raw.location || raw.job_location || raw.venue_address || 'MIDC Area',
    };
  };

  const rawParamId = route?.params?.jobId || route?.params?.id || route?.params?.job_id;
  const passedJob = normalizeJob(route?.params?.job);
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
  const isEmployer = (user?.role || '').toLowerCase() === 'employer';
  const { showToast } = useToast();
  const insets = useSafeAreaInsets();

  const initialFallbackJob = passedJob || findSeedJob(initialJobId);
  const [job, setJob] = useState<Job | null>(initialFallbackJob || null);
  const [loading, setLoading] = useState(!initialFallbackJob);
  const [isSaved, setIsSaved] = useState(false);
  const [hasApplied, setHasApplied] = useState(false);
  const [appliedItem, setAppliedItem] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'job_overview' | 'company_info'>('job_overview');

  // Synchronized animation clock for both tab underline and content slider
  const tabProgress = useRef(new Animated.Value(0)).current;
  const [tab1Height, setTab1Height] = useState<number | undefined>(undefined);
  const [tab2Height, setTab2Height] = useState<number | undefined>(undefined);

  const switchTab = useCallback((nextTab: 'job_overview' | 'company_info') => {
    setActiveTab(nextTab);
    Animated.spring(tabProgress, {
      toValue: nextTab === 'company_info' ? 1 : 0,
      stiffness: 300,
      damping: 28,
      mass: 0.8,
      useNativeDriver: true,
    }).start();
  }, [tabProgress]);

  // Horizontal swipe gesture to switch between tabs
  const handleTabSwipe = useCallback((direction: 'left' | 'right') => {
    if (direction === 'left' && activeTab === 'job_overview') {
      switchTab('company_info');
    } else if (direction === 'right' && activeTab === 'company_info') {
      switchTab('job_overview');
    }
  }, [activeTab, switchTab]);

  const contentTranslateX = tabProgress.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -SCREEN_WIDTH],
  });
  const activeContentHeight = activeTab === 'job_overview' ? tab1Height : tab2Height;

  const tabSwipeGesture = Gesture.Pan()
    .activeOffsetX([-35, 35])
    .failOffsetY([-25, 25])
    .onEnd((event) => {
      'worklet';
      if (Math.abs(event.translationX) > 60 && Math.abs(event.translationX) > Math.abs(event.translationY) * 1.4) {
        const direction = event.translationX < 0 ? 'left' : 'right';
        runOnJS(handleTabSwipe)(direction);
      }
    });
  const [isReported, setIsReported] = useState<boolean>(() => {
    return initialJobId ? reportedJobsStore.isReported(initialJobId) : false;
  });
  const [reportMeta, setReportMeta] = useState<ReportedJobMetadata | undefined>(() => {
    return initialJobId ? reportedJobsStore.getReportMetadata(initialJobId) : undefined;
  });
  const [similarJobs, setSimilarJobs] = useState<Job[]>([]);
  const [loadingSimilar, setLoadingSimilar] = useState<boolean>(false);

  // Apply clean white status bar with dark content matching Web App
  useFocusEffect(
    useCallback(() => {
      if (Platform.OS === 'android') {
        StatusBar.setBackgroundColor('#FFFFFF', true);
        StatusBar.setBarStyle('dark-content', true);
        StatusBar.setTranslucent(false);
      }
      return () => {
        if (Platform.OS === 'android') {
          StatusBar.setBackgroundColor('#FFFFFF', true);
          StatusBar.setBarStyle('dark-content', true);
          StatusBar.setTranslucent(false);
        }
      };
    }, [])
  );

  // Synchronize state whenever screen receives new navigation parameters
  useEffect(() => {
    const pId = route?.params?.jobId || route?.params?.id || route?.params?.job_id;
    const pJob = normalizeJob(route?.params?.job);
    const resolvedId = extractJobIdFromUrl(pId) || pJob?.id;

    if (pJob) {
      setJob(pJob);
      setActiveJobId(pJob.id);
      setLoading(false);
      if (reportedJobsStore.isReported(pJob.id)) {
        setIsReported(true);
        setReportMeta(reportedJobsStore.getReportMetadata(pJob.id));
      }
    } else if (resolvedId) {
      setActiveJobId(resolvedId);
      if (reportedJobsStore.isReported(resolvedId)) {
        setIsReported(true);
        setReportMeta(reportedJobsStore.getReportMetadata(resolvedId));
      }
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

  const fetchedSimilarRef = useRef<string | null>(null);
  const remoteStatusSyncedRef = useRef<string | null>(null);

  // Fast similar jobs query — runs exactly ONCE per activeJobId
  useEffect(() => {
    if (!activeJobId) {
      setSimilarJobs([]);
      return;
    }

    if (fetchedSimilarRef.current === activeJobId) {
      return;
    }
    fetchedSimilarRef.current = activeJobId;

    let isMounted = true;
    setLoadingSimilar(true);

    jobsApi
      .getSimilarJobs(activeJobId, 6)
      .then(async (res: any) => {
        if (!isMounted) return;
        const list = Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : [];
        let filtered = list.filter((j: any) => (j?.id || j?._id) !== activeJobId);

        // Fallback: if server returned empty, retrieve active jobs matching trade/industry
        if (filtered.length === 0) {
          try {
            const allRes: any = await candidateApi.getAllJobs();
            const allList = Array.isArray(allRes?.data) ? allRes.data : Array.isArray(allRes) ? allRes : [];
            const targetJob = job || passedJob;
            const targetTrade = String(targetJob?.trade || '').toLowerCase();
            const targetInd = String(targetJob?.industry || '').toLowerCase();

            const matched = allList.filter((j: any) => {
              const jId = j?.id || j?._id;
              if (jId === activeJobId) return false;
              const jTrade = String(j?.trade || '').toLowerCase();
              const jInd = String(j?.industry || '').toLowerCase();
              return (
                (targetTrade && jTrade && (jTrade.includes(targetTrade) || targetTrade.includes(jTrade))) ||
                (targetInd && jInd && (jInd.includes(targetInd) || targetInd.includes(jInd)))
              );
            });

            filtered = matched.length > 0 ? matched.slice(0, 6) : allList.filter((j: any) => (j?.id || j?._id) !== activeJobId).slice(0, 6);
          } catch (_) {}
        }

        if (isMounted) setSimilarJobs(filtered);
      })
      .catch(async (err) => {
        logger.error('Failed to load similar jobs', err);
        if (!isMounted) return;
        try {
          const allRes: any = await candidateApi.getAllJobs();
          const allList = Array.isArray(allRes?.data) ? allRes.data : Array.isArray(allRes) ? allRes : [];
          if (isMounted) setSimilarJobs(allList.filter((j: any) => (j?.id || j?._id) !== activeJobId).slice(0, 6));
        } catch (_) {
          if (isMounted) setSimilarJobs([]);
        }
      })
      .finally(() => {
        if (isMounted) setLoadingSimilar(false);
      });

    return () => {
      isMounted = false;
    };
  }, [activeJobId]);

  // Synchronous local state sync from reactive stores (no remote API calls = 0 risk of loops)
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

    if (savedJobsStore.isSaved(jobIdToCheck)) {
      setIsSaved(true);
    }
  }, [job?.id, activeJobId, passedJob?.id]);

  const checkReportedStatus = useCallback(() => {
    const targetJob = job || passedJob;
    const jobIdToCheck = targetJob?.id || activeJobId;
    if (!jobIdToCheck) return;

    const reported = reportedJobsStore.isReported(jobIdToCheck);
    setIsReported(reported);
    if (reported) {
      setReportMeta(reportedJobsStore.getReportMetadata(jobIdToCheck));
    }
  }, [job?.id, passedJob?.id, activeJobId]);

  // One-time remote fetch on screen mount to sync applied/saved status from server
  useEffect(() => {
    if (!activeJobId || remoteStatusSyncedRef.current === activeJobId) return;
    remoteStatusSyncedRef.current = activeJobId;

    candidateApi
      .getAppliedJobs()
      .then((appRes) => {
        if (Array.isArray(appRes?.data)) {
          const found = appRes.data.find(
            (a: any) =>
              String(a.job_id || a.jobId || a.job?.id || a.id).toLowerCase() ===
              String(activeJobId).toLowerCase()
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
        setIsSaved(savedJobsStore.isSaved(activeJobId));
      })
      .catch(() => {});
  }, [activeJobId]);

  // Listen to store updates without firing remote network requests
  useEffect(() => {
    syncApplicationStatus();
    checkReportedStatus();

    const unsubscribeApplied = appliedJobsStore.subscribe(syncApplicationStatus);
    const unsubscribeSaved = savedJobsStore.subscribe(() => {
      const targetJob = job || passedJob;
      const jobIdToCheck = targetJob?.id || activeJobId;
      if (jobIdToCheck) {
        setIsSaved(savedJobsStore.isSaved(jobIdToCheck));
      }
    });
    const unsubscribeReported = reportedJobsStore.subscribe(checkReportedStatus);

    return () => {
      unsubscribeApplied();
      unsubscribeSaved();
      unsubscribeReported();
    };
  }, [syncApplicationStatus, checkReportedStatus, job?.id, passedJob?.id, activeJobId]);

  useFocusEffect(
    useCallback(() => {
      syncApplicationStatus();
      checkReportedStatus();
    }, [syncApplicationStatus, checkReportedStatus])
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
        showToast('Job saved to bookmarks!', 'success', 1000);
      } else {
        showToast('Job removed from bookmarks', 'info', 1000);
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
    if (!jobIdStr) {
      showToast('Job information is not available to share', 'info');
      return;
    }

    await shareJob({
      id: jobIdStr,
      title: targetJob?.title,
      company: targetJob?.company,
      location: targetJob?.location,
      salaryMin: targetJob?.salary_min || targetJob?.salaryMin,
      salaryMax: targetJob?.salary_max || targetJob?.salaryMax,
    });
  };

  const fromHomeHorizontal = Boolean(
    route?.params?.fromHomeHorizontal ||
    route?.params?.fromHome ||
    route?.params?.fromHorizontalMenu
  );

  const handleBackNavigation = useCallback(() => {
    if (fromHomeHorizontal) {
      navigation.navigate('CandidateJobsTab', {
        screen: 'CandidateJobSearch',
      });
      return;
    }

    const state = navigation.getState?.();
    const canGoBackInCurrentStack = state ? state.index > 0 : false;

    if (canGoBackInCurrentStack) {
      navigation.goBack();
    } else {
      navigation.navigate('CandidateJobsTab', {
        screen: 'CandidateJobSearch',
      });
    }
  }, [fromHomeHorizontal, navigation]);

  useFocusEffect(
    useCallback(() => {
      const onBackPress = () => {
        handleBackNavigation();
        return true;
      };

      const subscription = BackHandler.addEventListener('hardwareBackPress', onBackPress);
      return () => subscription.remove();
    }, [handleBackNavigation])
  );

  if (isReported) {
    const meta = reportMeta || reportedJobsStore.getReportMetadata(activeJobId || job?.id || passedJob?.id);
    const jobTitle = meta?.title || job?.title || passedJob?.title || 'Job Opportunity';
    const company = meta?.company || job?.company || passedJob?.company || 'Employer';
    const reason = meta?.reasonCategory || 'Inappropriate / Fraudulent Listing';
    const reportedDateStr = meta?.reportedAt
      ? new Date(meta.reportedAt).toLocaleDateString('en-IN', {
          day: 'numeric',
          month: 'short',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        })
      : 'Recently Reported';
    const refCode = `REP-${String(meta?.jobId || activeJobId || job?.id || '000000').slice(-6).toUpperCase()}`;
    const androidStatusBarHeight = StatusBar.currentHeight || 0;
    const topSafeArea = Math.max(
      insets.top,
      Platform.OS === 'android' ? androidStatusBarHeight : 0,
      14
    );

    return (
      <View style={styles.container}>
        <FocusAwareStatusBar barStyle="dark-content" backgroundColor="#FFFFFF" translucent={false} />

        {/* Top Header Container with Safe Area Inset */}
        <View style={{ backgroundColor: '#FFFFFF', paddingTop: topSafeArea, borderBottomWidth: 1, borderBottomColor: '#E2E8F0' }}>
          <View style={styles.reportedHeaderBar}>
            <TouchableOpacity
              onPress={handleBackNavigation}
              style={styles.reportedBackBtn}
              hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
              activeOpacity={0.7}
            >
              <ArrowLeft size={22} color="#0F172A" strokeWidth={2.2} />
            </TouchableOpacity>
            <Text style={styles.reportedHeaderTitle}>Job Listing Reported</Text>
            <View style={{ width: 36 }} />
          </View>
        </View>

        <ScrollView
          contentContainerStyle={[
            styles.reportedScrollBody,
            { paddingBottom: Math.max(insets.bottom + 40, 60) },
          ]}
          showsVerticalScrollIndicator={false}
        >
          {/* Main Card */}
          <View style={styles.reportedCard}>
            {/* Status Icon */}
            <View style={styles.reportedIconWrapper}>
              <ShieldCheck size={36} color="#1B4FDF" strokeWidth={2.2} />
            </View>

            <Text style={styles.reportedSuccessTitle}>Report Submitted Successfully</Text>
            <Text style={styles.reportedSuccessSub}>
              Thank you for reporting this job opening. The job details have been hidden from your view while our Trust & Safety team investigates the employer and listing.
            </Text>

            {/* Slate 400 Divider per AGENTS.md */}
            <View style={styles.reportedDivider} />

            {/* Summary Box */}
            <View style={styles.reportedSummaryBox}>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Investigation Status</Text>
                <View style={styles.statusBadge}>
                  <Text style={styles.statusBadgeText}>Pending Moderation Review</Text>
                </View>
              </View>

              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Job Title</Text>
                <Text style={styles.summaryValue} numberOfLines={1}>{jobTitle}</Text>
              </View>

              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Company</Text>
                <Text style={styles.summaryValue} numberOfLines={1}>{company}</Text>
              </View>

              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Report Reason</Text>
                <Text style={[styles.summaryValue, { color: '#DC2626' }]} numberOfLines={1}>{reason}</Text>
              </View>

              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Submitted On</Text>
                <Text style={styles.summaryValue}>{reportedDateStr}</Text>
              </View>

              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Reference Code</Text>
                <Text style={[styles.summaryValue, { fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace' }]}>
                  #{refCode}
                </Text>
              </View>
            </View>

            {/* Safety Notice Banner */}
            <View style={styles.safetyNoticeBox}>
              <AlertCircle size={18} color="#1B4FDF" strokeWidth={2} style={{ marginTop: 2 }} />
              <View style={{ flex: 1 }}>
                <Text style={styles.safetyNoticeTitle}>Zero Tolerance for Fake Jobs</Text>
                <Text style={styles.safetyNoticeText}>
                  Our moderation team verifies employer credentials, physical factory presence, and registration documents. Confirmed fraudulent accounts and fake listings are permanently removed.
                </Text>
              </View>
            </View>

            {/* Primary Action Button */}
            <TouchableOpacity
              style={styles.reportedPrimaryBtn}
              activeOpacity={0.85}
              onPress={() => {
                navigation.navigate('CandidateJobsTab', {
                  screen: 'CandidateJobSearch',
                });
              }}
            >
              <Text style={styles.reportedPrimaryBtnText}>Browse Other Jobs</Text>
            </TouchableOpacity>

            {/* Secondary Action Button */}
            <TouchableOpacity
              style={styles.reportedSecondaryBtn}
              activeOpacity={0.7}
              onPress={handleBackNavigation}
            >
              <Text style={styles.reportedSecondaryBtnText}>Return to Previous Screen</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>
    );
  }

  if (loading) {
    const topInset = Math.max(insets.top || 0, Platform.OS === 'android' ? (StatusBar.currentHeight || 24) : 0);
    return (
      <View style={[styles.container, { backgroundColor: '#F8FAFC' }]}>
        <FocusAwareStatusBar barStyle="dark-content" backgroundColor="#FFFFFF" translucent={false} />
        <ScrollView
          contentContainerStyle={[styles.scrollContentBody, { paddingTop: topInset + 10 }]}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.jdCard}>
            <SkeletonLoader width="100%" height={24} style={{ borderRadius: 6 }} />
            <SkeletonLoader width="60%" height={16} style={{ borderRadius: 6, marginTop: 12 }} />
            <SkeletonLoader width="40%" height={14} style={{ borderRadius: 6, marginTop: 8 }} />
          </View>
          <View style={styles.jdCard}>
            <SkeletonLoader width="70%" height={20} style={{ borderRadius: 6 }} />
            <SkeletonLoader width="40%" height={14} style={{ borderRadius: 6, marginTop: 8 }} />
          </View>
        </ScrollView>
      </View>
    );
  }

  if (!job) {
    return (
      <View style={styles.container}>
        <FocusAwareStatusBar barStyle="dark-content" backgroundColor="#FFFFFF" translucent={false} />
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

  const ensureArray = (val: any): string[] => {
    if (Array.isArray(val)) return val.filter(Boolean).map(String);
    if (typeof val === 'string' && val.trim()) {
      try {
        const parsed = JSON.parse(val);
        if (Array.isArray(parsed)) return parsed.filter(Boolean).map(String);
        return [val.trim()];
      } catch (e) {
        return [val.trim()];
      }
    }
    return [];
  };

  const respList = ensureArray(job.responsibilities);
  const reqList = ensureArray(job.requirements);
  const skillsList = ensureArray(job.skills);

  const perksList: string[] = ensureArray(job.perks);
  if (job.bus_facility || (job as any).busFacility) perksList.push('Bus / Transport Facility');
  if ((job as any).accommodation) perksList.push('Hostel / Accommodation');
  if ((job as any).canteen) perksList.push('Subsidized Canteen');
  if ((job as any).overtime) perksList.push('Overtime Pay (OT)');
  if ((job as any).joining_bonus || (job as any).joiningBonus) perksList.push('Joining Bonus');
  if ((job as any).attendance_bonus || (job as any).attendanceBonus) perksList.push('Attendance Bonus');
  if ((job as any).pf) perksList.push('PF (Provident Fund)');
  if ((job as any).esic) perksList.push('ESIC Medical Coverage');
  if ((job as any).uniform) perksList.push('Free Uniform');
  if ((job as any).medicalInsurance || (job as any).medical_insurance) perksList.push('Medical Insurance');

  const uniquePerks = Array.from(new Set(perksList));

  const isExpNotRequired = job.experience_required === false || (job as any).experienceRequired === false;
  const minExp = job.min_experience ?? (job as any).minExperience ?? 0;
  const maxExp = job.max_experience ?? (job as any).maxExperience ?? 0;
  const isFresher = isExpNotRequired || (minExp === 0 && (maxExp === 0 || maxExp === undefined || maxExp === null));
  const expDisplay = isFresher ? 'Freshers (No Exp)' : (minExp === maxExp ? `${minExp} Years` : `${minExp} - ${maxExp} Years`);

  const minSalary = Number(job.salary_min || (job as any).salaryMin || 0);
  const maxSalary = Number(job.salary_max || (job as any).salaryMax || 0);
  const isSalaryDisclosed =
    (job as any).disclose_salary !== false &&
    (job as any).discloseSalary !== false &&
    (minSalary > 0 || maxSalary > 0);

  let salaryDisplay = 'Salary Not Disclosed';
  if (isSalaryDisclosed) {
    if (minSalary > 0 && maxSalary > 0) {
      salaryDisplay = `₹${minSalary.toLocaleString('en-IN')} - ₹${maxSalary.toLocaleString('en-IN')}`;
    } else if (minSalary > 0) {
      salaryDisplay = `₹${minSalary.toLocaleString('en-IN')}+`;
    } else if (maxSalary > 0) {
      salaryDisplay = `Up to ₹${maxSalary.toLocaleString('en-IN')}`;
    }
  }

  const vacancies = job.openings || (job as any).vacancies;

  const isWalkIn =
    ((job as any).hiringMethod || (job as any).hiring_method || '').toUpperCase() === 'WALK_IN' ||
    Boolean(job.isWalkIn) ||
    Boolean((job as any).is_walk_in) ||
    Boolean((job as any).walkInDate) ||
    Boolean((job as any).walk_in_date);

  const companyId =
    (job as any).company_id ||
    (job as any).companyId ||
    (job as any).employer_id ||
    (job as any).employerId ||
    job.company;

  const safeTopOffset = Math.max(insets.top || 0, Platform.OS === 'android' ? (StatusBar.currentHeight || 24) : 0);

  return (
    <View style={[styles.container, { backgroundColor: '#F8FAFC' }]}>
      <FocusAwareStatusBar barStyle="dark-content" backgroundColor="#FFFFFF" translucent={false} />

      {/* Main Content Scroll Area */}
      <ScrollView
        style={{ flex: 1, backgroundColor: '#F8FAFC' }}
        contentContainerStyle={{
          paddingTop: safeTopOffset + 2,
          paddingBottom: Math.max(insets.bottom + 140, 160),
        }}
        showsVerticalScrollIndicator={false}
      >
        {/* 1. Full-Width First Card & Underline Tabs */}
        <CandidateJobDetailHeader
          job={job}
          isSaved={isSaved}
          activeTab={activeTab}
          setActiveTab={switchTab}
          tabProgress={tabProgress}
          onBack={handleBackNavigation}
          onShare={handleShareJob}
          onToggleSave={handleToggleSave}
          onReport={() => {
            navigation.navigate('ReportJob', {
              jobId: job.id,
              jobTitle: job.title,
              companyName: job.company,
            });
          }}
          onCompanyPress={() => {
            const companyId = (job as any).company_id || (job as any).companyId || job.company;
            navigation.navigate('CompanyProfile', { companyId, name: job.company });
          }}
        />

        <GestureDetector gesture={tabSwipeGesture}>
          <View style={[{ width: SCREEN_WIDTH, overflow: 'hidden' }, activeContentHeight ? { height: activeContentHeight } : null]}>
            <Animated.View
              style={{
                flexDirection: 'row',
                width: SCREEN_WIDTH * 2,
                transform: [{ translateX: contentTranslateX }],
                alignItems: 'flex-start',
              }}
            >
              <View
                style={{ width: SCREEN_WIDTH, paddingHorizontal: 16, paddingTop: 14 }}
                onLayout={(e) => {
                  const h = Math.round(e.nativeEvent.layout.height);
                  if (h > 0) setTab1Height(h);
                }}
              >
            {/* WALK-IN DRIVE CALLOUT CARD (if walk-in) */}
            {isWalkIn && (
              <View style={styles.walkInCard}>
                <View style={styles.walkInHeader}>
                  <View style={styles.walkInBadge}>
                    <Ticket size={13} color="#0369A1" strokeWidth={2.4} />
                    <Text style={styles.walkInBadgeText}>OFFICIAL WALK-IN DRIVE</Text>
                  </View>
                  <Text style={styles.walkInConfirmedText}>Confirmed Registration</Text>
                </View>

                <View style={styles.walkInGrid}>
                  <View style={styles.walkInBox}>
                    <Text style={styles.walkInBoxLabel}>DRIVE DATE & TIMING</Text>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
                      <Calendar size={13} color="#0284C7" />
                      <Text style={styles.walkInBoxValue} numberOfLines={1}>
                        {(job as any).walkInDate || (job as any).walk_in_date || 'Announced'}
                      </Text>
                    </View>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 4 }}>
                      <Clock size={11} color="#64748B" />
                      <Text style={styles.walkInSubText}>
                        {(job as any).walkInStartTime || (job as any).walk_in_start_time || '10:00 AM'} - {(job as any).walkInEndTime || (job as any).walk_in_end_time || '04:00 PM'}
                      </Text>
                    </View>
                  </View>

                  {Boolean((job as any).walkInContactPerson || (job as any).walk_in_contact_person || (job as any).walkInContactNumber || (job as any).walk_in_contact_number) && (
                    <View style={styles.walkInBox}>
                      <Text style={styles.walkInBoxLabel}>DRIVE COORDINATOR</Text>
                      <Text style={styles.walkInBoxValue} numberOfLines={1}>
                        {(job as any).walkInContactPerson || (job as any).walk_in_contact_person || 'HR Desk'}
                      </Text>
                      {Boolean((job as any).walkInContactNumber || (job as any).walk_in_contact_number) && (
                        <TouchableOpacity
                          style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 }}
                          onPress={() => {
                            const raw = (job as any).walkInContactNumber || (job as any).walk_in_contact_number;
                            const clean = String(raw).replace(/[^0-9+]/g, '');
                            if (clean) Linking.openURL(`tel:${clean}`);
                          }}
                        >
                          <Phone size={11} color="#0284C7" />
                          <Text style={{ fontSize: 11.5, fontWeight: '700', color: '#0284C7' }} numberOfLines={1}>
                            {(job as any).walkInContactNumber || (job as any).walk_in_contact_number}
                          </Text>
                        </TouchableOpacity>
                      )}
                    </View>
                  )}
                </View>

                {Boolean((job as any).interviewAddress || (job as any).interview_address || job.location) && (
                  <View style={[styles.walkInBox, { marginBottom: 10 }]}>
                    <Text style={styles.walkInBoxLabel}>INTERVIEW VENUE ADDRESS</Text>
                    <Text style={styles.walkInVenueText}>
                      {(job as any).interviewAddress || (job as any).interview_address || job.location}
                    </Text>
                  </View>
                )}

                <View style={styles.walkInDocBox}>
                  <Text style={styles.walkInDocLabel}>MANDATORY DOCUMENTS TO CARRY</Text>
                  <Text style={styles.walkInDocText}>
                    {(job as any).walkInDocuments || (job as any).walk_in_documents || 'Updated Resume (2 Copies), Aadhar Card, Educational Marksheets, Passport Photographs, Bank Passbook'}
                  </Text>
                </View>
              </View>
            )}

            {/* 1. Job Overview & Skills Card */}
            <View style={styles.jdCard}>
              <View style={styles.cleanMetaList}>
                <View style={styles.cleanMetaItem}>
                  <Briefcase size={16} color="#64748B" strokeWidth={1.8} />
                  <Text style={styles.cleanMetaText}>{expDisplay}</Text>
                </View>

                <View style={styles.cleanMetaItem}>
                  <Users size={16} color="#64748B" strokeWidth={1.8} />
                  <Text style={styles.cleanMetaText}>
                    {vacancies ? `${vacancies} Openings` : 'Openings not mentioned'}
                  </Text>
                </View>

                <View style={styles.cleanMetaItem}>
                  <MapPin size={16} color="#64748B" strokeWidth={1.8} />
                  <Text style={styles.cleanMetaText}>
                    {(job as any).midc_zone || (job as any).midcZone || job.location || 'Location not specified'}
                  </Text>
                </View>

                <View style={styles.cleanMetaItem}>
                  <IndianRupee size={16} color="#64748B" strokeWidth={1.8} />
                  <Text style={styles.cleanMetaText}>
                    {isSalaryDisclosed ? salaryDisplay : 'Salary not disclosed'}
                  </Text>
                </View>

                {Boolean((job as any).educationRequirement || (job as any).education) && (
                  <View style={styles.cleanMetaItem}>
                    <GraduationCap size={16} color="#64748B" strokeWidth={1.8} />
                    <Text style={styles.cleanMetaText}>
                      {(job as any).educationRequirement || (job as any).education}
                    </Text>
                  </View>
                )}

                {Boolean((job as any).shift_details || (job as any).shiftDetails) && (
                  <View style={styles.cleanMetaItem}>
                    <Clock size={16} color="#64748B" strokeWidth={1.8} />
                    <Text style={styles.cleanMetaText}>
                      {(job as any).shift_details || (job as any).shiftDetails}
                    </Text>
                  </View>
                )}
              </View>

              {/* Must-have skills */}
              {skillsList.length > 0 && (
                <View style={styles.cleanSkillsSection}>
                  <Text style={styles.cleanSkillsLabel}>Must have skills</Text>
                  <Text style={styles.cleanSkillsText}>{skillsList.join(', ')}</Text>
                </View>
              )}
            </View>

            {/* 2. Job description section */}
            <View style={styles.sectionHeadingWrap}>
              <Text style={styles.cleanSectionHeading}>Job description</Text>
            </View>

            <View style={styles.jdCard}>
              <Text style={styles.cleanBodyText}>
                {job.description || 'No detailed description provided for this opening.'}
              </Text>

              {respList.length > 0 && (
                <View style={styles.descSubSection}>
                  <Text style={styles.cleanSubHeading}>What you’ll do</Text>
                  <View style={styles.cleanBulletList}>
                    {respList.map((resp, idx) => (
                      <View key={idx} style={styles.cleanBulletRow}>
                        <Text style={styles.cleanBulletDot}>•</Text>
                        <Text style={styles.cleanBulletText}>{resp}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              )}

              {reqList.length > 0 && (
                <View style={styles.descSubSection}>
                  <Text style={styles.cleanSubHeading}>Requirements & Qualifications</Text>
                  <View style={styles.cleanBulletList}>
                    {reqList.map((req, idx) => (
                      <View key={idx} style={styles.cleanBulletRow}>
                        <Text style={styles.cleanBulletDot}>•</Text>
                        <Text style={styles.cleanBulletText}>{req}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              )}
            </View>

            {/* WORKPLACE & PLANT LOCATION CARD */}
            <View style={styles.jdCard}>
              <Text style={styles.cleanCardTitle}>Workplace Location</Text>
              <Text style={styles.cleanLocationSubtitle}>
                {job.location} {(job as any).midc_zone || (job as any).midcZone ? `• ${(job as any).midc_zone || (job as any).midcZone}` : ''}
              </Text>
              <JobLocationMapPreview
                locationName={job.location}
                latitude={(job as any).latitude ? Number((job as any).latitude) : undefined}
                longitude={(job as any).longitude ? Number((job as any).longitude) : undefined}
              />
            </View>

            {/* SIMILAR JOBS SECTION */}
            {loadingSimilar ? (
              <View style={styles.similarJobsSection}>
                <View style={styles.similarSectionDivider} />
                <View style={styles.similarSectionHeaderRow}>
                  <View style={styles.similarTitleGroup}>
                    <SimilarJobsIcon size={19} color="#000000" strokeWidth={2.2} />
                    <Text style={styles.similarSectionTitle}>Similar Job Openings</Text>
                  </View>
                  <Text style={styles.similarSectionSubtitle}>Matching trade, role & location</Text>
                </View>
                <View style={{ gap: 12, marginTop: 10 }}>
                  <SkeletonLoader width="100%" height={160} style={{ borderRadius: 12 }} />
                  <SkeletonLoader width="100%" height={160} style={{ borderRadius: 12 }} />
                </View>
              </View>
            ) : similarJobs && similarJobs.length > 0 ? (
              <View style={styles.similarJobsSection}>
                <View style={styles.similarSectionDivider} />

                <View style={styles.similarSectionHeaderRow}>
                  <View style={styles.similarTitleGroup}>
                    <SimilarJobsIcon size={19} color="#000000" strokeWidth={2.2} />
                    <Text style={styles.similarSectionTitle}>Similar Job Openings</Text>
                  </View>
                  <Text style={styles.similarSectionSubtitle}>Matching trade, role & location</Text>
                </View>

                <View style={styles.similarJobsList}>
                  {similarJobs.map((simJob) => {
                    const sId = simJob.id || (simJob as any)._id;
                    const sTitle = simJob.title || (simJob as any).job_title || 'Industrial Position';
                    const sCompany = simJob.company || (simJob as any).company_name || 'Industrial Partner';
                    const sLocation = simJob.location || (simJob as any).midc_zone || (simJob as any).city || 'MIDC Area';
                    const sLogo =
                      simJob.companyLogo ||
                      (simJob as any).company_logo ||
                      (simJob as any).logoUrl ||
                      (simJob as any).logo_url ||
                      (simJob as any).logo ||
                      null;

                    const sMin = simJob.salary_min ?? (simJob as any).salaryMin;
                    const sMax = simJob.salary_max ?? (simJob as any).salaryMax;
                    let salaryText = 'Salary Not Disclosed';
                    if (sMin && sMax) {
                      if (sMin >= 100000) {
                        salaryText = `${(sMin / 100000).toFixed(1)}-${(sMax / 100000).toFixed(1)} Lacs PA`;
                      } else {
                        salaryText = `₹${Math.round(sMin / 1000)}k-${Math.round(sMax / 1000)}k/mo`;
                      }
                    } else if (sMin) {
                      salaryText =
                        sMin >= 100000 ? `₹${(sMin / 100000).toFixed(1)} Lacs+ PA` : `₹${sMin.toLocaleString('en-IN')}/mo`;
                    } else if (sMax) {
                      salaryText = `Up to ₹${sMax.toLocaleString('en-IN')}`;
                    }

                    const sMinExp = simJob.min_experience ?? (simJob as any).minExperience;
                    const sMaxExp = simJob.max_experience ?? (simJob as any).maxExperience;
                    const sIsExpNotReq =
                      simJob.experience_required === false || (simJob as any).experienceRequired === false;
                    const isFresher =
                      sIsExpNotReq || (sMinExp === 0 && (sMaxExp === 0 || sMaxExp === undefined || sMaxExp === null));
                    const expText = isFresher
                      ? 'Fresher'
                      : sMinExp !== undefined && sMaxExp !== undefined
                      ? `${sMinExp}-${sMaxExp} Yrs`
                      : sMinExp !== undefined
                      ? `${sMinExp}+ Yrs`
                      : 'Fresher';

                    const sJobType = simJob.job_type || (simJob as any).jobType || 'Full-time';
                    const sWorkMode = simJob.work_mode || (simJob as any).workMode || 'On-site';
                    const sOpenings = simJob.openings || (simJob as any).vacancies;
                    const sPostedDate =
                      simJob.posted_at ||
                      (simJob as any).postedAt ||
                      (simJob as any).created_at ||
                      (simJob as any).createdAt;
                    const sTimeText = sPostedDate ? formatTimeAgo(sPostedDate) : 'Recently';

                    return (
                      <TouchableOpacity
                        key={sId}
                        style={styles.similarJobCard}
                        activeOpacity={0.85}
                        onPress={() => {
                          if (typeof navigation.push === 'function') {
                            navigation.push('CandidateJobDetail', {
                              jobId: sId,
                              job: simJob,
                            });
                          } else {
                            navigation.navigate('CandidateJobDetail', {
                              jobId: sId,
                              job: simJob,
                            });
                          }
                        }}
                      >
                        {/* 1. Header Row: Logo Avatar + Title & Company Subtitle */}
                        <View style={styles.similarCardHeaderRow}>
                          <View style={styles.similarLogoContainer}>
                            <CompanyLogoAvatar
                              logoUrl={sLogo}
                              companyName={sCompany}
                              size={40}
                              borderRadius={8}
                            />
                          </View>

                          <View style={styles.similarTitleColumn}>
                            <Text style={styles.similarCardJobTitle} numberOfLines={1} ellipsizeMode="tail">
                              {sTitle}
                            </Text>
                            <Text style={styles.similarCardCompanySubtitle} numberOfLines={1} ellipsizeMode="tail">
                              Hiring at {sCompany}
                            </Text>
                          </View>
                        </View>

                        {/* 2. Metadata Rows (Calendar & Briefcase specs with '|' separator) */}
                        <View style={styles.similarMetaRowsContainer}>
                          <View style={styles.similarMetaLine}>
                            <Calendar size={13} color="#64748B" />
                            <Text style={styles.similarMetaLineText} numberOfLines={1} ellipsizeMode="tail">
                              Posted {sTimeText} • {sLocation}
                            </Text>
                          </View>

                          <View style={styles.similarMetaLine}>
                            <Briefcase size={13} color="#64748B" />
                            <Text style={styles.similarMetaLineText} numberOfLines={1} ellipsizeMode="tail">
                              {expText}   |   {salaryText}   |   {sJobType}
                            </Text>
                          </View>
                        </View>

                        {/* 3. Clean Divider */}
                        <View style={styles.similarCardDivider} />

                        {/* 4. Bottom Footer: Meta Indicators on Left | Action Button on Right */}
                        <View style={styles.similarCardFooterRow}>
                          <View style={styles.similarFooterLeftStatsRow}>
                            <Text style={styles.similarFooterStatText} numberOfLines={1} ellipsizeMode="tail">
                              {sOpenings ? `${sOpenings} Openings` : 'Immediate Hiring'}
                            </Text>
                            <Text style={styles.similarFooterStatDivider}>|</Text>
                            <Text style={styles.similarFooterStatText} numberOfLines={1} ellipsizeMode="tail">
                              {sWorkMode}
                            </Text>
                          </View>

                          <View style={styles.similarViewBtn}>
                            <Text style={styles.similarViewBtnText}>View Details</Text>
                            <ChevronRight size={13} color="#FFFFFF" strokeWidth={2.5} />
                          </View>
                        </View>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>
            ) : null}
              </View>

              <View
                style={{ width: SCREEN_WIDTH, paddingHorizontal: 16, paddingTop: 14 }}
                onLayout={(e) => {
                  const h = Math.round(e.nativeEvent.layout.height);
                  if (h > 0) setTab2Height(h);
                }}
              >
            {/* REQUIREMENTS & CANDIDATE ELIGIBILITY */}
            {reqList.length > 0 && (
              <>
                <View style={styles.sectionHeadingWrap}>
                  <Text style={styles.cleanSectionHeading}>Requirements & Eligibility</Text>
                </View>
                <View style={styles.jdCard}>
                  <View style={styles.cleanBulletList}>
                    {reqList.map((req, idx) => (
                      <View key={idx} style={styles.cleanBulletRow}>
                        <Text style={styles.cleanBulletDot}>•</Text>
                        <Text style={styles.cleanBulletText}>{req}</Text>
                      </View>
                    ))}
                  </View>

                  {skillsList.length > 0 && (
                    <View style={styles.cleanSkillsSection}>
                      <Text style={styles.cleanSkillsLabel}>Technical skills</Text>
                      <Text style={styles.cleanSkillsText}>{skillsList.join(', ')}</Text>
                    </View>
                  )}
                </View>
              </>
            )}

            {/* REQUIRED TECHNICAL SKILLS (if no reqList) */}
            {reqList.length === 0 && skillsList.length > 0 && (
              <>
                <View style={styles.sectionHeadingWrap}>
                  <Text style={styles.cleanSectionHeading}>Technical Skills</Text>
                </View>
                <View style={styles.jdCard}>
                  <Text style={styles.cleanSkillsLabel}>Required skills</Text>
                  <Text style={styles.cleanSkillsText}>{skillsList.join(', ')}</Text>
                </View>
              </>
            )}

            {/* PERKS & PLANT FACILITIES OFFERED */}
            {uniquePerks.length > 0 && (
              <>
                <View style={styles.sectionHeadingWrap}>
                  <Text style={styles.cleanSectionHeading}>Perks & Facilities</Text>
                </View>
                <View style={styles.jdCard}>
                  <View style={styles.cleanBulletList}>
                    {uniquePerks.map((perk, idx) => (
                      <View key={idx} style={styles.cleanBulletRow}>
                        <Text style={styles.cleanBulletDot}>•</Text>
                        <Text style={styles.cleanBulletText}>{perk}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              </>
            )}

            {/* COMPANY SNAPSHOT CARD */}
            <View style={styles.sectionHeadingWrap}>
              <Text style={styles.cleanSectionHeading}>About the Company</Text>
            </View>
            <View style={styles.jdCard}>
              <View style={styles.companyProfileTopRow}>
                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={() => navigation.navigate('CompanyProfile', { companyId, name: job.company })}
                >
                  <CompanyLogoAvatar
                    logoUrl={job.companyLogo || (job as any).realCompanyLogo || null}
                    companyName={job.company}
                    size={46}
                    borderRadius={8}
                  />
                </TouchableOpacity>

                <View style={styles.companyNameWrap}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                    <Text style={styles.companyCardName} numberOfLines={1}>{job.company}</Text>
                    <MetaVerifiedBadge size={14} color="#0095F6" />
                  </View>
                  <Text style={styles.companyCardIndustry} numberOfLines={1}>
                    {(job as any).companyIndustry || job.industry || 'Industrial Manufacturing'}
                  </Text>
                </View>
              </View>

              <View style={{ paddingTop: 8, borderTopWidth: 1, borderTopColor: '#F1F5F9', gap: 6 }}>
                <View style={styles.companyMetaRow}>
                  <MapPin size={13} color="#64748B" />
                  <Text style={styles.companyMetaText} numberOfLines={1}>
                    {(job as any).companyAddress || (job as any).companyCity || job.location || 'Chhatrapati Sambhajinagar'}
                  </Text>
                </View>

                {Boolean((job as any).companyWebsite || (job as any).website) && (
                  <TouchableOpacity
                    style={styles.companyMetaRow}
                    onPress={() => {
                      const rawUrl = (job as any).companyWebsite || (job as any).website;
                      if (!rawUrl) return;
                      const valid = rawUrl.startsWith('http') ? rawUrl : `https://${rawUrl}`;
                      Linking.openURL(valid);
                    }}
                  >
                    <Globe size={13} color="#2563EB" />
                    <Text style={[styles.companyMetaText, { color: '#2563EB', fontWeight: '500' }]} numberOfLines={1}>
                      Company Website
                    </Text>
                  </TouchableOpacity>
                )}
              </View>

              <TouchableOpacity
                style={styles.companyViewBtn}
                activeOpacity={0.8}
                onPress={() => navigation.navigate('CompanyProfile', { companyId, name: job.company })}
              >
                <Text style={styles.companyViewBtnText}>View Full Company Profile</Text>
                <ChevronRight size={14} color="#1D4ED8" strokeWidth={2.4} />
              </TouchableOpacity>
            </View>

            {/* DIRECT HIRING CONTACT CARD (if available) */}
            {Boolean((job as any).walkInContactNumber || (job as any).walk_in_contact_number) && (
              <>
                <View style={styles.sectionHeadingWrap}>
                  <Text style={styles.cleanSectionHeading}>Hiring Contact</Text>
                </View>
                <View style={styles.jdCard}>
                  <Text style={{ fontSize: 13.5, fontWeight: '600', color: '#0F172A' }}>
                    {(job as any).walkInContactPerson || (job as any).walk_in_contact_person || 'HR Department'}
                  </Text>
                  <TouchableOpacity
                    style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 6 }}
                    onPress={() => {
                      const num = (job as any).walkInContactNumber || (job as any).walk_in_contact_number;
                      const clean = String(num).replace(/[^0-9+]/g, '');
                      if (clean) Linking.openURL(`tel:${clean}`);
                    }}
                  >
                    <Phone size={13} color="#2563EB" />
                    <Text style={{ fontSize: 13.5, fontWeight: '600', color: '#2563EB' }}>
                      {(job as any).walkInContactNumber || (job as any).walk_in_contact_number}
                    </Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
              </View>
            </Animated.View>
          </View>
        </GestureDetector>
      </ScrollView>

      {/* BOTTOM FIXED CTA ACTION BAR */}
      {!isEmployer && (
        <View style={[styles.bottomActionBar, { paddingBottom: Math.max(insets.bottom + 10, 20) }]}>
          {(() => {
            const targetJob = job || passedJob;
            const isWalkIn =
              (targetJob?.hiringMethod || targetJob?.hiring_method || '').toUpperCase() === 'WALK_IN' ||
              Boolean(targetJob?.isWalkIn) ||
              Boolean((targetJob as any)?.is_walk_in) ||
              Boolean(targetJob?.walkInDate) ||
              Boolean(targetJob?.walk_in_date);

            if (hasApplied) {
              return (
                <View style={styles.appliedStatusCard}>
                  {isWalkIn ? (
                    <Ticket size={18} color="#1764E8" strokeWidth={2.4} />
                  ) : (
                    <CheckCircle2 size={18} color="#16A34A" />
                  )}
                  <View style={{ flex: 1, minWidth: 0 }}>
                    <Text style={styles.appliedStatusTitle}>
                      {isWalkIn ? 'Walk-in Pass Issued' : 'Application Submitted'}
                    </Text>
                    <Text style={styles.appliedStatusSub}>
                      {isWalkIn
                        ? 'Confirmed Admit Card available'
                        : `Status: ${(appliedItem?.status || 'APPLIED').toUpperCase()}`}
                    </Text>
                  </View>
                  {isWalkIn ? (
                    <TouchableOpacity
                      style={styles.viewPassBarBtn}
                      activeOpacity={0.8}
                      onPress={() => navigation.navigate('MyInterviews')}
                    >
                      <Text style={styles.viewPassBarBtnText}>View Pass</Text>
                    </TouchableOpacity>
                  ) : null}
                </View>
              );
            }

            return (
              <TouchableOpacity style={styles.applyCtaBtn} activeOpacity={0.85} onPress={handleApply}>
                {isWalkIn ? (
                  <>
                    <Ticket size={16} color="#FFFFFF" strokeWidth={2.4} />
                    <Text style={styles.applyCtaBtnText}>Register for Walk-in Drive</Text>
                  </>
                ) : (
                  <>
                    <Send size={16} color="#FFFFFF" strokeWidth={2.5} />
                    <Text style={styles.applyCtaBtnText}>Apply Now</Text>
                  </>
                )}
              </TouchableOpacity>
            );
          })()}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  scrollContentBody: {
    padding: 16,
  },
  tabContentBody: {
    paddingHorizontal: 16,
    paddingTop: 14,
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
  jdCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: RADIUS.card,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 16,
    marginBottom: 14,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  },
  jdCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 10,
    marginBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  jdCardTitleWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  jdCardTitle: {
    fontSize: 14.5,
    fontWeight: '700',
    color: '#0F172A',
  },
  sectionHeadingWrap: {
    marginBottom: 8,
    marginTop: 2,
  },
  cleanSectionHeading: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
    letterSpacing: -0.2,
  },
  cleanCardTitle: {
    fontSize: 14.5,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 4,
  },
  cleanLocationSubtitle: {
    fontSize: 13,
    fontWeight: '400',
    color: '#64748B',
    marginBottom: 10,
  },
  cleanMetaList: {
    gap: 12,
  },
  cleanMetaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  cleanMetaText: {
    fontSize: 13.5,
    fontWeight: '400',
    color: '#1E293B',
  },
  cleanSkillsSection: {
    marginTop: 14,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  cleanSkillsLabel: {
    fontSize: 13,
    fontWeight: '500',
    color: '#64748B',
    marginBottom: 4,
  },
  cleanSkillsText: {
    fontSize: 13.5,
    fontWeight: '400',
    color: '#1E293B',
    lineHeight: 20,
  },
  cleanSkillsTextSecondary: {
    fontSize: 13,
    fontWeight: '400',
    color: '#475569',
    lineHeight: 20,
  },
  cleanBodyText: {
    fontSize: 13.5,
    fontWeight: '400',
    color: '#334155',
    lineHeight: 21,
  },
  descSubSection: {
    marginTop: 14,
  },
  cleanSubHeading: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 8,
  },
  cleanBulletList: {
    gap: 6,
  },
  cleanBulletRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  cleanBulletDot: {
    fontSize: 14,
    color: '#64748B',
    lineHeight: 20,
  },
  cleanBulletText: {
    fontSize: 13.5,
    fontWeight: '400',
    color: '#334155',
    lineHeight: 20,
    flex: 1,
  },
  locationSubtitle: {
    fontSize: 12.5,
    fontWeight: '600',
    color: '#475569',
    marginBottom: 10,
  },
  skillsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  skillChip: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  skillChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1E293B',
  },
  perksGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  perkTile: {
    width: '48.5%',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#F1F5F9',
    borderRadius: 8,
    padding: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  perkIconBox: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#DCFCE7',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  perkText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#334155',
    flex: 1,
  },
  companyProfileTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 10,
  },
  companyNameWrap: {
    flex: 1,
    minWidth: 0,
  },
  companyCardName: {
    fontSize: 14.5,
    fontWeight: '700',
    color: '#0F172A',
  },
  companyCardIndustry: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  companyMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 6,
  },
  companyMetaText: {
    fontSize: 12,
    color: '#475569',
    flex: 1,
  },
  companyViewBtn: {
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#BFDBFE',
    paddingVertical: 10,
    borderRadius: 8,
  },
  companyViewBtnText: {
    fontSize: 12.5,
    fontWeight: '600',
    color: '#1D4ED8',
  },
  safetyAdvisoryCard: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: RADIUS.card,
    padding: 14,
    marginBottom: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: 10,
  },
  safetyTextGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
    minWidth: 200,
  },
  safetyText: {
    fontSize: 11.5,
    color: '#64748B',
    flex: 1,
    lineHeight: 16,
  },
  safetyReportLink: {
    fontSize: 12,
    fontWeight: '600',
    color: '#DC2626',
    textDecorationLine: 'underline',
  },
  walkInCard: {
    backgroundColor: '#F0F9FF',
    borderWidth: 1,
    borderColor: '#BAE6FD',
    borderRadius: RADIUS.card,
    padding: 14,
    marginBottom: 14,
  },
  walkInHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  walkInBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#E0F2FE',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
  },
  walkInBadgeText: {
    fontSize: 10.5,
    fontWeight: '600',
    color: '#0369A1',
    letterSpacing: 0.3,
  },
  walkInConfirmedText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#0284C7',
  },
  walkInGrid: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 10,
  },
  walkInBox: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E0F2FE',
    borderRadius: 6,
    padding: 10,
  },
  walkInBoxLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: '#0369A1',
    letterSpacing: 0.3,
    marginBottom: 4,
  },
  walkInBoxValue: {
    fontSize: 12.5,
    fontWeight: '600',
    color: '#0F172A',
  },
  walkInSubText: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '500',
  },
  walkInVenueText: {
    fontSize: 12,
    color: '#334155',
    fontWeight: '500',
    lineHeight: 16,
  },
  walkInDocBox: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#BAE6FD',
    borderStyle: 'dashed',
    borderRadius: 6,
    padding: 10,
  },
  walkInDocLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: '#0369A1',
    letterSpacing: 0.3,
    marginBottom: 3,
  },
  walkInDocText: {
    fontSize: 11.5,
    color: '#334155',
    lineHeight: 16,
  },
  cardBlockContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: RADIUS.card,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    padding: 16,
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
    height: 48,
    borderRadius: RADIUS.card,
    backgroundColor: COLORS.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  applyCtaBtnText: {
    fontSize: 15,
    fontWeight: '600',
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
  viewPassBarBtn: {
    backgroundColor: '#1764E8',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 0,
  },
  viewPassBarBtnText: {
    color: '#FFFFFF',
    fontSize: 11.5,
    fontWeight: '800',
  },
  reportedHeaderBar: {
    height: 52,
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
  reportedBackBtn: {
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },
  reportedHeaderTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
  },
  reportedScrollBody: {
    padding: 16,
    alignItems: 'center',
  },
  reportedCard: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 0,
    padding: 20,
    alignItems: 'center',
  },
  reportedIconWrapper: {
    width: 68,
    height: 68,
    backgroundColor: '#EFF6FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#DBEAFE',
  },
  reportedSuccessTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
    textAlign: 'center',
    marginBottom: 8,
  },
  reportedSuccessSub: {
    fontSize: 13,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 19,
    paddingHorizontal: 4,
  },
  reportedDivider: {
    width: '100%',
    height: 1,
    backgroundColor: '#94A3B8',
    marginVertical: 18,
  },
  reportedSummaryBox: {
    width: '100%',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 14,
    gap: 10,
    borderRadius: 0,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  summaryLabel: {
    fontSize: 12.5,
    color: '#64748B',
    fontWeight: '500',
  },
  summaryValue: {
    fontSize: 12.5,
    color: '#0F172A',
    fontWeight: '700',
    maxWidth: '60%',
    textAlign: 'right',
  },
  statusBadge: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderWidth: 1,
    borderColor: '#FDE68A',
    borderRadius: 0,
  },
  statusBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#B45309',
  },
  safetyNoticeBox: {
    width: '100%',
    flexDirection: 'row',
    gap: 10,
    backgroundColor: '#F0F9FF',
    borderWidth: 1,
    borderColor: '#BAE6FD',
    padding: 12,
    marginTop: 16,
    borderRadius: 0,
  },
  safetyNoticeTitle: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#0369A1',
    marginBottom: 2,
  },
  safetyNoticeText: {
    fontSize: 11.5,
    color: '#0C4A6E',
    lineHeight: 16,
  },
  reportedPrimaryBtn: {
    width: '100%',
    height: 48,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
    borderRadius: 0,
  },
  reportedPrimaryBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },
  reportedSecondaryBtn: {
    width: '100%',
    height: 46,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
    borderRadius: 0,
  },
  reportedSecondaryBtnText: {
    color: '#334155',
    fontSize: 13.5,
    fontWeight: '700',
  },
  similarJobsSection: {
    marginTop: 10,
  },
  similarSectionDivider: {
    height: 1,
    backgroundColor: '#94A3B8',
    marginVertical: 6,
  },
  similarSectionHeaderRow: {
    marginTop: 6,
    marginBottom: 10,
  },
  similarTitleGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
  },
  similarSectionTitle: {
    fontSize: 14.5,
    fontWeight: '800',
    color: '#0F172A',
  },
  similarSectionSubtitle: {
    fontSize: 11.5,
    color: '#64748B',
    marginTop: 2,
  },
  similarJobsList: {
    gap: 12,
  },
  similarJobCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 16,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.02,
    shadowRadius: 2,
    elevation: 1,
  },
  similarCardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  similarLogoContainer: {
    width: 44,
    height: 44,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  similarTitleColumn: {
    flex: 1,
    minWidth: 0,
    justifyContent: 'center',
  },
  similarCardJobTitle: {
    fontSize: 14.5,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: -0.15,
  },
  similarCardCompanySubtitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#475569',
    marginTop: 1,
  },
  similarMetaRowsContainer: {
    gap: 5,
    marginTop: 10,
  },
  similarMetaLine: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    minWidth: 0,
  },
  similarMetaLineText: {
    flex: 1,
    minWidth: 0,
    fontSize: 11.5,
    fontWeight: '600',
    color: '#475569',
  },
  similarCardDivider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginVertical: 10,
  },
  similarCardFooterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  similarFooterLeftStatsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flex: 1,
    minWidth: 0,
  },
  similarFooterStatText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#64748B',
    flexShrink: 1,
  },
  similarFooterStatDivider: {
    fontSize: 11,
    color: '#CBD5E1',
  },
  similarViewBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: COLORS.primary,
    borderRadius: 18,
    height: 28,
    paddingHorizontal: 12,
    justifyContent: 'center',
    flexShrink: 0,
  },
  similarViewBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
