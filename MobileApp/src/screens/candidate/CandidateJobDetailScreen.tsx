import { COLORS } from '../../constants/theme';
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Modal,
  TextInput,
  ActivityIndicator,
  Alert,
  Image,
  Share,
  Platform,
  Linking,
} from 'react-native';
import {
  MapPin,
  Briefcase,
  Clock,
  Building2,
  Bookmark,
  Users,
  CheckCircle2,
  Award,
  Send,
  X,
  IndianRupee,
  Calendar,
  Layers,
  Sparkles,
  FileText,
  User,
  Mail,
  Phone,
  Wrench,
  GraduationCap,
  AlertTriangle,
  AlertCircle,
  Check,
  ArrowRight,
  ShieldCheck,
  Share2,
} from 'lucide-react-native';
import { jobsApi } from '../../api/jobsApi';
import { candidateApi } from '../../api/candidateApi';
import { Job } from '../../types';
import { CompanyLogoAvatar } from '../../components/common/CompanyLogoAvatar';
import { Header } from '../../components/common/Header';
import { Skeleton as SkeletonLoader } from '../../components/common/SkeletonLoader';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../context/ToastContext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { JobLocationMapPreview } from '../../components/map/JobLocationMapPreview';
import { logger } from '../../utils/logger';
import { FALLBACK_SEED_JOBS } from '../../constants/seedJobs';
import { appliedJobsStore } from '../../utils/appliedJobsStore';

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
      if (queryMatch && queryMatch[1]) {
        return queryMatch[1];
      }

      const uuidMatch = str.match(/([a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12})/i);
      if (uuidMatch) return uuidMatch[1];

      const urlClean = str.split('?')[0].split('#')[0];
      const matchJobPath = urlClean.match(/job[s]?\/([^\/]+)/i);
      if (matchJobPath && matchJobPath[1]) {
        return matchJobPath[1];
      }

      const segments = urlClean.split('/').filter(Boolean);
      const lastSeg = segments[segments.length - 1];
      if (lastSeg && lastSeg !== 'job' && lastSeg !== 'jobs') {
        return lastSeg;
      }
    }
    return str;
  };

  const rawParamId = route?.params?.jobId || route?.params?.id || route?.params?.job_id;
  const initialJobId = extractJobIdFromUrl(rawParamId);

  const findSeedJob = (targetId?: string): Job | undefined => {
    if (!targetId) return undefined;
    const cleanId = String(targetId).trim().toLowerCase();
    return FALLBACK_SEED_JOBS.find(j =>
      j.id.toLowerCase() === cleanId ||
      j.id.toLowerCase() === `j${cleanId}` ||
      cleanId === `j${j.id.toLowerCase()}` ||
      cleanId.includes(j.id.toLowerCase()) ||
      j.title.toLowerCase().includes(cleanId)
    );
  };

  const [activeJobId, setActiveJobId] = useState<string | undefined>(initialJobId);
  const passedJob = route?.params?.job as Job | undefined;
  const { user } = useAuth();
  const { showToast } = useToast();
  const insets = useSafeAreaInsets();

  const initialFallbackJob = passedJob || findSeedJob(activeJobId);
  const [job, setJob] = useState<Job | null>(initialFallbackJob || null);
  const [loading, setLoading] = useState(!initialFallbackJob);
  const [isSaved, setIsSaved] = useState(false);
  const [hasApplied, setHasApplied] = useState(false);
  const [appliedItem, setAppliedItem] = useState<any>(null);
  const [applyModalOpen, setApplyModalOpen] = useState(false);
  const [expectedSalary, setExpectedSalary] = useState('');
  const [coverNote, setCoverNote] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Extract candidate profile specs matching Web App 100%
  const skillsList: string[] = Array.isArray(user?.skills)
    ? user.skills
    : typeof user?.skills === 'string'
    ? (user.skills as string).split(',').map((s) => s.trim()).filter(Boolean)
    : [];

  const expList: any[] = Array.isArray(user?.experience)
    ? user.experience
    : typeof user?.experience === 'string'
    ? ((): any[] => { try { return JSON.parse(user.experience); } catch (_) { return []; } })()
    : [];

  const eduList: any[] = Array.isArray(user?.education)
    ? user.education
    : typeof user?.education === 'string'
    ? ((): any[] => { try { return JSON.parse(user.education); } catch (_) { return []; } })()
    : [];

  const hasResume = !!(user?.resume_url || user?.resumeUrl || (user as any)?.resume?.url || (user as any)?.resume?.name);

  // Calculate all missing profile sections
  const missingSections: string[] = [];
  if (!user?.phone) missingSections.push('Phone Number');
  if (!user?.location) missingSections.push('Location');
  if (!user?.tradeSpecialization && !user?.trade_specialization && !user?.headline) missingSections.push('Primary Trade');
  if (!user?.preferredShift && !user?.preferred_shift) missingSections.push('Preferred Shift');
  if (skillsList.length < 5) missingSections.push(`Skills (${skillsList.length}/5 min)`);
  if (expList.length === 0) missingSections.push('Work Experience');
  if (eduList.length === 0) missingSections.push('Education');
  if (!hasResume) missingSections.push('Resume CV Document');

  useEffect(() => {
    const paramId = extractJobIdFromUrl(route?.params?.jobId || route?.params?.id || route?.params?.job_id);
    if (paramId && paramId !== activeJobId) {
      setActiveJobId(paramId);
    }
  }, [route?.params]);

  useEffect(() => {
    const handleUrl = (url: string | null) => {
      if (url) {
        const foundId = extractJobIdFromUrl(url);
        if (foundId) setActiveJobId(foundId);
      }
    };

    Linking.getInitialURL().then(handleUrl).catch(() => {});
    const subscription = Linking.addEventListener('url', (event: { url: string }) => {
      handleUrl(event.url);
    });

    return () => {
      subscription.remove();
    };
  }, []);

  useEffect(() => {
    const syncFromStore = () => {
      if (!activeJobId) return;
      const allApplied = appliedJobsStore.getAppliedJobs();
      const match = allApplied.find((a: any) =>
        (a.jobId || a.job?.id || a.id) === activeJobId ||
        String(a.jobId) === String(activeJobId)
      );
      if (match) {
        setHasApplied(true);
        setAppliedItem(match);
      }
    };

    syncFromStore();
    const unsubscribe = appliedJobsStore.subscribe(syncFromStore);
    return () => unsubscribe();
  }, [activeJobId]);

  useEffect(() => {
    const jobId = activeJobId;
    if (!jobId) return;
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
          } else {
            const fallback = findSeedJob(jobId);
            if (fallback) setJob(fallback);
          }
        }
      } catch (e) {
        if (mounted) {
          const fallback = findSeedJob(jobId);
          if (fallback) setJob(fallback);
        }
      } finally {
        if (mounted) setLoading(false);
      }

      // 2. Fetch saved/applied state in background ONLY if user is logged in
      if (mounted && user) {
        candidateApi.getSavedJobs().then((savedRes) => {
          if (mounted && savedRes) {
            const savedData: any = savedRes;
            let savedList: any[] = [];
            if (Array.isArray(savedData)) savedList = savedData;
            else if (savedData?.data) savedList = savedData.data;
            const savedIds = savedList.map((j: any) => j.id || j.jobId);
            setIsSaved(savedIds.includes(jobId));
          }
        }).catch(() => {});

        candidateApi.getAppliedJobs().then((appliedRes) => {
          if (mounted && appliedRes) {
            const appliedData: any = appliedRes;
            let appliedList: any[] = [];
            if (Array.isArray(appliedData)) appliedList = appliedData;
            else if (appliedData?.data) appliedList = appliedData.data;
            
            appliedJobsStore.setAppliedJobs(appliedList);
            const matchApp = appliedList.find((item: any) =>
              (item.jobId || item.job?.id || item.id) === jobId ||
              String(item.jobId) === String(jobId)
            );
            if (matchApp) {
              setHasApplied(true);
              setAppliedItem(matchApp);
            }
          }
        }).catch(() => {});
      }
    };

    fetchDetails();
    return () => {
      mounted = false;
    };
  }, [activeJobId, passedJob]);

  const jobId = activeJobId;

  const handleToggleSave = () => {
    if (!user) {
      Alert.alert(
        'Sign In Required',
        'Please sign in or create an account to save job vacancies.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Sign In', onPress: () => navigation.navigate('EmployerLogin') },
        ]
      );
      return;
    }
    if (!jobId) return;
    const newSavedState = !isSaved;
    setIsSaved(newSavedState);
    showToast(newSavedState ? 'Job saved !' : 'Job removed !', newSavedState ? 'success' : 'info');
    candidateApi.toggleSaveJob(jobId).catch(() => {});
  };

  const handleShareJob = async () => {
    const targetJob = job || passedJob;
    const jobIdStr = jobId || targetJob?.id || '';
    const canonicalHttpsUrl = jobIdStr ? `https://job-market-wine.vercel.app/job/${jobIdStr}` : 'https://job-market-wine.vercel.app';
    const titleStr = targetJob?.title ? `${targetJob.title} - ${targetJob.company || 'Industrial Company'}` : 'Industrial Job Vacancy';
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

  const handleApplySubmit = async () => {
    if (!jobId) return;
    setSubmitting(true);
    try {
      const payload = {
        coverNote: coverNote.trim() || undefined,
        expectedSalary: expectedSalary.trim() || undefined,
        resumeUrl: user?.resume_url || user?.resumeUrl || undefined,
        candidateName: user?.name || undefined,
        candidatePhone: user?.phone || undefined,
        candidateEmail: user?.email || undefined,
      };

      const res = await candidateApi.applyForJob(jobId, payload);
      setSubmitting(false);
      setApplyModalOpen(false);

      if (res && (res.success || (res as any).status === 200 || (res as any).ok)) {
        setHasApplied(true);
        Alert.alert(
          'Application Delivered Successfully! 🎉',
          `Your application for "${job?.title}" has been transmitted directly to ${job?.company || 'the employer'}.\n\nIt is now listed under your "Applied Jobs" tab.`,
          [
            {
              text: 'View Applied Jobs',
              onPress: () => navigation.navigate('CandidateAppliedTab'),
            },
            { text: 'OK', style: 'cancel' },
          ]
        );
      } else {
        const errorMsg = res?.message || res?.error || 'Failed to submit application. Please try again.';
        showToast(errorMsg, 'error');
        Alert.alert('Application Failed', errorMsg);
      }
    } catch (e: any) {
      setSubmitting(false);
      const errorMsg = e?.message || 'Failed to submit application. Please check your internet connection.';
      showToast(errorMsg, 'error');
      Alert.alert('Application Failed', errorMsg);
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
        <Header title="Job Details" onBack={handleBackNavigation} />
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <View style={styles.singleMasterCard}>
            {/* Header Banner Skeleton */}
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
              <SkeletonLoader width={46} height={46} style={{ borderRadius: 0 }} />
              <View style={{ flex: 1, gap: 8 }}>
                <SkeletonLoader width="70%" height={18} style={{ borderRadius: 0 }} />
                <SkeletonLoader width="45%" height={13} style={{ borderRadius: 0 }} />
              </View>
            </View>

            <View style={styles.divider} />

            {/* Quick Highlights Skeleton */}
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
              <SkeletonLoader width={100} height={14} style={{ borderRadius: 0 }} />
              <SkeletonLoader width={85} height={14} style={{ borderRadius: 0 }} />
              <SkeletonLoader width={90} height={14} style={{ borderRadius: 0 }} />
              <SkeletonLoader width={105} height={14} style={{ borderRadius: 0 }} />
            </View>

            <View style={styles.divider} />

            {/* Salary Section Skeleton */}
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <SkeletonLoader width={140} height={14} style={{ borderRadius: 0 }} />
              <SkeletonLoader width={150} height={16} style={{ borderRadius: 0 }} />
            </View>

            <View style={styles.sectionDivider} />

            {/* Technical Skills Skeleton */}
            <SkeletonLoader width={180} height={16} style={{ borderRadius: 0 }} />
            <View style={{ gap: 8, marginTop: 4 }}>
              <SkeletonLoader width="90%" height={13} style={{ borderRadius: 0 }} />
              <SkeletonLoader width="75%" height={13} style={{ borderRadius: 0 }} />
              <SkeletonLoader width="80%" height={13} style={{ borderRadius: 0 }} />
            </View>

            <View style={styles.sectionDivider} />

            {/* Overview Skeleton */}
            <SkeletonLoader width={160} height={16} style={{ borderRadius: 0 }} />
            <View style={{ gap: 6, marginTop: 4 }}>
              <SkeletonLoader width="98%" height={13} style={{ borderRadius: 0 }} />
              <SkeletonLoader width="95%" height={13} style={{ borderRadius: 0 }} />
              <SkeletonLoader width="60%" height={13} style={{ borderRadius: 0 }} />
            </View>

            <View style={styles.sectionDivider} />

            {/* Responsibilities Skeleton */}
            <SkeletonLoader width={170} height={16} style={{ borderRadius: 0 }} />
            <View style={{ gap: 8, marginTop: 4 }}>
              <SkeletonLoader width="88%" height={13} style={{ borderRadius: 0 }} />
              <SkeletonLoader width="82%" height={13} style={{ borderRadius: 0 }} />
            </View>
          </View>
        </ScrollView>
      </View>
    );
  }

  if (!job) {
    return (
      <View style={styles.container}>
        <Header title="Job Details" onBack={handleBackNavigation} />
        <View style={{ flex: 1, padding: 20, alignItems: 'center', justifyContent: 'center' }}>
          <View style={{ backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#CBD5E1', padding: 24, borderRadius: 0, width: '100%', alignItems: 'center', gap: 12 }}>
            <AlertCircle size={44} color="#DC2626" />
            <Text style={{ fontSize: 17, fontWeight: '800', color: '#0F172A', textAlign: 'center' }}>Job Vacancy Unavailable</Text>
            <Text style={{ fontSize: 13, color: '#64748B', textAlign: 'center', lineHeight: 18 }}>This job listing is no longer active, has expired, or was removed by the employer.</Text>
            <TouchableOpacity
              activeOpacity={0.85}
              style={{ backgroundColor: COLORS.primary, paddingHorizontal: 20, paddingVertical: 10, marginTop: 8 }}
              onPress={handleBackNavigation}
            >
              <Text style={{ color: '#FFFFFF', fontWeight: '700', fontSize: 13 }}>Back to Jobs</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  }

  const logoUrl = job.companyLogo || (job as any).company_logo;
  const midcZoneVal = (job as any).midcZone || (job as any).midc_zone;

  const perksList: string[] = job.perks || [];
  if (job.bus_facility || job.busFacility) perksList.push('Bus / Transport Facility');
  if (job.accommodation) perksList.push('Hostel / Accommodation');
  if (job.canteen) perksList.push('Subsidized Canteen');
  if (job.overtime) perksList.push('Overtime Pay (OT)');
  if (job.joining_bonus || job.joiningBonus) perksList.push('Joining Bonus');
  if (job.attendance_bonus || job.attendanceBonus) perksList.push('Attendance Bonus');

  const uniquePerks = Array.from(new Set(perksList));

  return (
    <View style={styles.container}>
      <Header title="Job Details" onBack={handleBackNavigation} />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Single Master Card Container */}
        <View style={styles.singleMasterCard}>
          {/* SECTION 1: Banner & Header */}
          <View style={styles.bannerTopRow}>
            {/* Left Company Logo */}
            <CompanyLogoAvatar
              logoUrl={job.companyLogo || (job as any).company_logo || (job as any).logoUrl || (job as any).logo_url || (job as any).logo}
              companyName={job.company}
              size={46}
              borderRadius={0}
            />

            {/* Center Title & Company Stack */}
            <View style={{ flex: 1, minWidth: 0, justifyContent: 'center' }}>
              <Text style={styles.jobTitle}>{job.title}</Text>
              <Text style={styles.companyName}>{job.company || 'Industrial Enterprise'}</Text>
              {midcZoneVal ? (
                <Text style={styles.midcText}>MIDC Zone: {midcZoneVal}</Text>
              ) : null}
            </View>

            {/* Right Top Actions (Share + Save) */}
            <View style={styles.topRightActionsRow}>
              <TouchableOpacity
                style={styles.shareBtnTop}
                onPress={handleShareJob}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Share2 size={17} color={COLORS.primary} />
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.bookmarkBtn}
                onPress={handleToggleSave}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Bookmark
                  size={17}
                  color={isSaved ? COLORS.primary : '#94A3B8'}
                  fill={isSaved ? COLORS.primary : 'transparent'}
                />
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.divider} />

          {/* Key Quick Highlights */}
          <View style={styles.highlightsGrid}>
            <View style={styles.highlightItem}>
              <MapPin size={14} color={COLORS.primary} />
              <Text style={styles.highlightText}>{job.location || 'MIDC Zone'}</Text>
            </View>

            <View style={styles.highlightItem}>
              <Briefcase size={14} color="#64748B" />
              <Text style={styles.highlightText}>{job.job_type || job.jobType || 'Full-time'}</Text>
            </View>

            <View style={styles.highlightItem}>
              <Clock size={14} color="#64748B" />
              <Text style={styles.highlightText}>{job.work_mode || job.workMode || 'On-site'}</Text>
            </View>

            <View style={styles.highlightItem}>
              <Users size={14} color="#64748B" />
              <Text style={styles.highlightText}>{job.openings ?? 1} Vacancies</Text>
            </View>

            {(job.shift_details || (job as any).shiftDetails) ? (
              <View style={styles.highlightItem}>
                <Layers size={14} color="#7C3AED" />
                <Text style={styles.highlightText}>{job.shift_details || (job as any).shiftDetails}</Text>
              </View>
            ) : null}
          </View>

          <View style={styles.divider} />

          {/* Salary Section */}
          <View style={styles.salaryRowSection}>
            <Text style={styles.salaryTitle}>Offered Salary Package:</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 2 }}>
              <IndianRupee size={14} color="#15803D" />
              <Text style={styles.salaryValue}>
                ₹{job.salary_min || job.salaryMin || 15000} - ₹{job.salary_max || job.salaryMax || 25000} / year
              </Text>
            </View>
          </View>

          {/* SECTION 2: Technical Skills */}
          {Array.isArray(job.skills) && job.skills.length > 0 ? (
            <>
              <View style={styles.sectionDivider} />
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 8 }}>
                <Sparkles size={16} color={COLORS.primary} />
                <Text style={styles.sectionHeaderTitle}>Key Technical Skills & Trade</Text>
              </View>
              <View style={styles.bulletList}>
                {job.skills.map((skill, idx) => (
                  <View key={idx} style={styles.bulletItem}>
                    <CheckCircle2 size={15} color={COLORS.primary} style={{ marginTop: 2 }} />
                    <Text style={styles.bulletText}>{skill}</Text>
                  </View>
                ))}
              </View>
            </>
          ) : null}

          {/* SECTION 3: Job Overview & Description */}
          <View style={styles.sectionDivider} />
          <Text style={styles.sectionHeaderTitle}>Job Overview & Description</Text>
          <Text style={styles.bodyText}>{job.description || 'No detailed description provided.'}</Text>

          {/* SECTION 4: Key Responsibilities */}
          {Array.isArray(job.responsibilities) && job.responsibilities.length > 0 ? (
            <>
              <View style={styles.sectionDivider} />
              <Text style={styles.sectionHeaderTitle}>Key Responsibilities</Text>
              <View style={styles.bulletList}>
                {job.responsibilities.map((resp, idx) => (
                  <View key={idx} style={styles.bulletItem}>
                    <CheckCircle2 size={15} color={COLORS.primary} style={{ marginTop: 2 }} />
                    <Text style={styles.bulletText}>{resp}</Text>
                  </View>
                ))}
              </View>
            </>
          ) : null}

          {/* SECTION 5: Requirements & ITI Certification */}
          {Array.isArray(job.requirements) && job.requirements.length > 0 ? (
            <>
              <View style={styles.sectionDivider} />
              <Text style={styles.sectionHeaderTitle}>Requirements & ITI Certification</Text>
              <View style={styles.bulletList}>
                {job.requirements.map((req, idx) => (
                  <View key={idx} style={styles.bulletItem}>
                    <Award size={15} color="#D97706" style={{ marginTop: 2 }} />
                    <Text style={styles.bulletText}>{req}</Text>
                  </View>
                ))}
              </View>
            </>
          ) : null}

          {/* SECTION 6: Walk-in Interview Venue & Address */}
          {(job.interview_address || (job as any).interviewAddress) ? (
            <>
              <View style={styles.sectionDivider} />
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 6 }}>
                <Calendar size={16} color="#059669" />
                <Text style={styles.sectionHeaderTitle}>Interview Venue & Address</Text>
              </View>
              <Text style={styles.bodyText}>{job.interview_address || (job as any).interviewAddress}</Text>
            </>
          ) : null}

          {/* SECTION 7: Perks & Amenities */}
          {uniquePerks.length > 0 ? (
            <>
              <View style={styles.sectionDivider} />
              <Text style={styles.sectionHeaderTitle}>Perks & Facilities Offered</Text>
              <View style={styles.bulletList}>
                {uniquePerks.map((perk, idx) => (
                  <View key={idx} style={styles.bulletItem}>
                    <CheckCircle2 size={15} color="#16A34A" style={{ marginTop: 2 }} />
                    <Text style={styles.bulletText}>{perk}</Text>
                  </View>
                ))}
              </View>
            </>
          ) : null}

          {/* SECTION 7.5: Live Interview Schedule & Walk-In Pass */}
          {(hasApplied && ((appliedItem?.status || '').toLowerCase().includes('interview') || appliedItem?.interviewDate || appliedItem?.venueAddress || (job as any)?.interview_address)) ? (
            <>
              <View style={styles.sectionDivider} />
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 8 }}>
                <Calendar size={16} color={COLORS.primary} />
                <Text style={styles.sectionHeaderTitle}>Interview Schedule & Walk-In Pass</Text>
              </View>

              <View style={{ gap: 10 }}>
                {/* Date & Time */}
                <View style={styles.interviewRowPlain}>
                  <Clock size={15} color={COLORS.primary} style={{ marginTop: 2 }} />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.interviewLabelPlain}>Date & Time</Text>
                    <Text style={styles.interviewValuePlain}>
                      {appliedItem?.interviewDate || (job as any)?.interview_date || 'Date to be confirmed by HR'}
                      {appliedItem?.interviewTime ? ` (${appliedItem.interviewTime})` : ''}
                    </Text>
                  </View>
                </View>

                {/* Venue Address */}
                <View style={styles.interviewRowPlain}>
                  <MapPin size={15} color={COLORS.primary} style={{ marginTop: 2 }} />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.interviewLabelPlain}>Interview Venue & Address</Text>
                    <Text style={styles.interviewValuePlain}>
                      {appliedItem?.venueAddress || appliedItem?.interviewAddress || (job as any)?.interview_address || job.location}
                    </Text>
                  </View>
                </View>

                {/* Documents to Carry */}
                <View style={styles.interviewRowPlain}>
                  <FileText size={15} color={COLORS.primary} style={{ marginTop: 2 }} />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.interviewLabelPlain}>Documents to Carry</Text>
                    <Text style={styles.interviewValuePlain}>
                      {appliedItem?.interviewDocuments || (job as any)?.walkInDocuments || 'Aadhaar Card, ITI Trade Certificate, Resume CV, 2 Passport Photos'}
                    </Text>
                  </View>
                </View>

                {/* HR Contact */}
                {(appliedItem?.hrContactPerson || appliedItem?.hrPhone) ? (
                  <View style={styles.interviewRowPlain}>
                    <Phone size={15} color={COLORS.primary} style={{ marginTop: 2 }} />
                    <View style={{ flex: 1 }}>
                      <Text style={styles.interviewLabelPlain}>Recruiter HR Contact</Text>
                      <Text style={styles.interviewValuePlain}>
                        {appliedItem?.hrContactPerson || 'HR Lead'} {appliedItem?.hrPhone ? `(${appliedItem.hrPhone})` : ''}
                      </Text>
                    </View>
                  </View>
                ) : null}

                {/* Actions */}
                <View style={styles.interviewActionRowPlain}>
                  {(job?.google_maps_url || job?.googleMapsUrl || (job?.latitude && job?.longitude)) && (
                    <TouchableOpacity
                      activeOpacity={0.8}
                      style={styles.interviewMapBtnPlain}
                      onPress={() => {
                        const mapsUrl = job?.google_maps_url || job?.googleMapsUrl || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(job?.location || '')}`;
                        Linking.openURL(mapsUrl);
                      }}
                    >
                      <MapPin size={14} color={COLORS.primary} />
                      <Text style={styles.interviewMapBtnTextPlain}>Google Maps Directions</Text>
                    </TouchableOpacity>
                  )}

                  {appliedItem?.hrPhone && (
                    <TouchableOpacity
                      activeOpacity={0.8}
                      style={styles.interviewCallBtnPlain}
                      onPress={() => {
                        Linking.openURL(`tel:${appliedItem.hrPhone}`);
                      }}
                    >
                      <Phone size={14} color="#FFFFFF" />
                      <Text style={styles.interviewCallBtnTextPlain}>Call HR</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            </>
          ) : null}

          {/* SECTION 8: Interactive Google Map Preview */}
          {job.google_maps_url || job.googleMapsUrl || (job.latitude && job.longitude) ? (
            <>
              <View style={styles.sectionDivider} />
              <Text style={styles.sectionHeaderTitle}>Factory Location Map</Text>
              <JobLocationMapPreview
                latitude={job.latitude}
                longitude={job.longitude}
                locationName={job.location}
              />
            </>
          ) : null}
        </View>
      </ScrollView>

      {/* Bottom Sticky Action Bar */}
      <View style={[styles.bottomBar, { paddingBottom: Math.max(insets.bottom, 6), paddingTop: 8 }]}>
        {hasApplied ? (
          (() => {
            const st = (appliedItem?.status || 'applied').toLowerCase();
            let bg = '#F0FDF4';
            let borderColor = '#BBF7D0';
            let textColor = COLORS.primary;
            let IconComp = Send;
            let statusTitle = 'Applied';
            let statusSub = 'Employer received your candidate profile & CV specs.';

            if (st === 'reviewed' || st === 'under_review') {
              bg = '#EFF6FF';
              borderColor = '#BFDBFE';
              textColor = COLORS.primary;
              IconComp = Clock;
              statusTitle = 'Under Review';
              statusSub = 'Employer HR team is reviewing your application.';
            } else if (st === 'shortlisted') {
              bg = '#F0F9FF';
              borderColor = '#BAE6FD';
              textColor = '#0284C7';
              IconComp = Award;
              statusTitle = 'Shortlisted';
              statusSub = 'Profile passed initial screening for interview selection.';
            } else if (st === 'interview' || st === 'interview_scheduled') {
              bg = '#FEF3C7';
              borderColor = '#FCD34D';
              textColor = '#D97706';
              IconComp = Calendar;
              statusTitle = 'Interview';
              statusSub = 'Interview invitation details released by recruiter.';
            } else if (st === 'hired' || st === 'selected' || st === 'accepted') {
              bg = '#ECFDF5';
              borderColor = '#A7F3D0';
              textColor = '#047857';
              IconComp = CheckCircle2;
              statusTitle = 'Hired';
              statusSub = 'Congratulations! You have been selected for this position.';
            } else if (st === 'rejected') {
              bg = '#F8FAFC';
              borderColor = '#CBD5E1';
              textColor = '#DC2626';
              IconComp = AlertCircle;
              statusTitle = 'Rejected';
              statusSub = 'Employer selected another candidate for this opening.';
            }

            return (
              <View style={[styles.appliedBanner, { backgroundColor: bg, borderColor: borderColor }]}>
                <IconComp size={18} color={textColor} />
                <View style={{ flex: 1 }}>
                  <Text style={[styles.appliedBannerText, { color: textColor }]} numberOfLines={1}>{statusTitle}</Text>
                  <Text style={styles.appliedBannerSubtext} numberOfLines={1}>{statusSub}</Text>
                </View>
              </View>
            );
          })()
        ) : (
          <TouchableOpacity
            activeOpacity={0.85}
            style={styles.applyNowBtn}
            onPress={() => {
              if (!user) {
                Alert.alert(
                  'Sign In Required',
                  'Please sign in or create an account to apply for job vacancies.',
                  [
                    { text: 'Cancel', style: 'cancel' },
                    { text: 'Sign In', onPress: () => navigation.navigate('EmployerLogin') },
                  ]
                );
                return;
              }
              if (job) {
                navigation.navigate('CandidateApplyConfirm', {
                  job,
                  onAppliedSuccess: () => setHasApplied(true),
                });
              }
            }}
          >
            <Send size={16} color="#FFFFFF" />
            <Text style={styles.applyNowBtnText}>Apply now</Text>
          </TouchableOpacity>
        )}
      </View>
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
    paddingBottom: 120,
    gap: 16,
  },
  singleMasterCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 0,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    padding: 16,
    gap: 10,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.02,
    shadowRadius: 2,
    elevation: 1,
  },
  sectionDivider: {
    height: 1.5,
    backgroundColor: '#CBD5E1',
    marginVertical: 14,
  },
  bannerTopRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  companyIconSquare: {
    width: 44,
    height: 44,
    borderRadius: 0,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    marginTop: 1,
  },
  companyLogoImg: {
    width: 40,
    height: 40,
    borderRadius: 0,
  },
  jobTitle: {
    fontSize: 16.5,
    fontWeight: '900',
    color: '#0F172A',
    lineHeight: 22,
  },
  companyName: {
    fontSize: 13,
    fontWeight: '700',
    color: '#64748B',
    marginTop: 2,
  },
  midcText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: COLORS.primary,
    marginTop: 2,
  },
  topRightActionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  skillsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  skillChip: {
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#BFDBFE',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 0,
  },
  skillChipText: {
    fontSize: 12,
    fontWeight: '800',
    color: COLORS.primary,
  },
  bookmarkBtn: {
    padding: 4,
    backgroundColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
  },
  divider: {
    height: 1,
    backgroundColor: '#F1F5F9',
  },
  highlightsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  highlightItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginRight: 10,
    marginVertical: 2,
  },
  highlightText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#475569',
  },
  salaryRowSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    gap: 12,
    paddingTop: 4,
  },
  salaryTitle: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#64748B',
  },
  salaryValue: {
    fontSize: 13.5,
    fontWeight: '800',
    color: '#15803D',
  },
  sectionHeaderTitle: {
    fontSize: 15,
    fontWeight: '900',
    color: '#0F172A',
  },
  bodyText: {
    fontSize: 13,
    color: '#475569',
    lineHeight: 19,
  },
  bulletList: {
    gap: 8,
  },
  bulletItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  bulletText: {
    fontSize: 12.5,
    color: '#334155',
    lineHeight: 18,
    flex: 1,
  },
  perksGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  perkChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#F0FDF4',
    borderWidth: 1,
    borderColor: '#BBF7D0',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 0,
  },
  perkChipText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#15803D',
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 6,
    flexDirection: 'row',
    alignItems: 'center',
    zIndex: 999,
    elevation: 8,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
  },
  shareBtnTop: {
    padding: 4,
    backgroundColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bottomShareBtn: {
    width: 44,
    height: 44,
    borderRadius: 0,
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#BFDBFE',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  applyNowBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: COLORS.primary,
    paddingVertical: 13,
    borderRadius: 0,
  },
  applyNowBtnBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: COLORS.primary,
    paddingVertical: 13,
    borderRadius: 0,
    width: '100%',
  },
  applyNowBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '900',
  },
  appliedBanner: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    gap: 10,
    backgroundColor: '#DCFCE7',
    borderWidth: 1,
    borderColor: '#86EFAC',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 0,
  },
  appliedBannerText: {
    color: '#15803D',
    fontSize: 13,
    fontWeight: '900',
  },
  appliedBannerSubtext: {
    color: '#475569',
    fontSize: 11,
    fontWeight: '600',
    marginTop: 1,
  },
  interviewRowPlain: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  interviewLabelPlain: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748B',
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  interviewValuePlain: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0F172A',
    marginTop: 2,
    lineHeight: 18,
  },
  interviewActionRowPlain: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 4,
  },
  interviewMapBtnPlain: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    paddingVertical: 9,
    paddingHorizontal: 12,
    borderRadius: 0,
  },
  interviewMapBtnTextPlain: {
    fontSize: 12,
    fontWeight: '800',
    color: COLORS.primary,
  },
  interviewCallBtnPlain: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: COLORS.primary,
    paddingVertical: 9,
    paddingHorizontal: 16,
    borderRadius: 0,
  },
  interviewCallBtnTextPlain: {
    fontSize: 12,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.5)',
    justifyContent: 'flex-end',
  },
  modalSheetContainer: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 16,
    paddingHorizontal: 20,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    maxHeight: '85%',
  },
  modalHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: '900',
    color: '#0F172A',
  },
  closeBtn: {
    padding: 6,
  },
  modalBody: {
    flex: 1,
    paddingTop: 14,
  },
  targetJobSummaryCard: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 8,
    padding: 10,
    marginBottom: 8,
  },
  applyingForLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: '#64748B',
    letterSpacing: 0.5,
  },
  applyingForTitle: {
    fontSize: 15,
    fontWeight: '900',
    color: '#0F172A',
  },
  applyingForCompany: {
    fontSize: 12,
    color: '#64748B',
  },
  resumeInfoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#BFDBFE',
    padding: 10,
    borderRadius: 8,
    marginBottom: 8,
  },
  resumeInfoBoxMissing: {
    backgroundColor: '#FFF1F2',
    borderColor: '#FECDD3',
  },
  resumeInfoTitle: {
    fontSize: 12.5,
    fontWeight: '800',
    color: COLORS.primary,
  },
  resumeInfoDesc: {
    fontSize: 11,
    color: COLORS.primary,
    marginTop: 1,
  },
  manageResumeBtn: {
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#BFDBFE',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
  },
  manageResumeBtnText: {
    fontSize: 11.5,
    fontWeight: '800',
    color: COLORS.primary,
  },
  candidateBioCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 8,
    padding: 10,
    marginBottom: 8,
    gap: 6,
  },
  headerIconSquare: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#BFDBFE',
    alignItems: 'center',
    justifyContent: 'center',
  },
  incompleteAlertCard: {
    backgroundColor: '#FFFBE6',
    borderWidth: 1,
    borderColor: '#FFE58F',
    borderRadius: 10,
    padding: 10,
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  incompleteAlertTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: '#8C6100',
  },
  incompleteAlertDesc: {
    fontSize: 10.5,
    color: '#B57200',
    fontWeight: '600',
    marginTop: 2,
    lineHeight: 14,
  },
  editProfileSmallBtn: {
    backgroundColor: '#D97706',
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 6,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  editProfileSmallBtnText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '800',
  },
  specsHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    paddingBottom: 6,
    marginBottom: 4,
  },
  bioSectionHeaderTitle: {
    fontSize: 10.5,
    fontWeight: '800',
    color: COLORS.primary,
    letterSpacing: 0.5,
  },
  specsGrid: {
    gap: 6,
  },
  specBox: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 6,
    padding: 8,
  },
  specBoxMissing: {
    backgroundColor: '#FFF1F2',
    borderColor: '#FECDD3',
  },
  specBoxLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  specBoxLabel: {
    fontSize: 9.5,
    fontWeight: '800',
    color: '#64748B',
    letterSpacing: 0.5,
  },
  specBoxValue: {
    fontSize: 12,
    fontWeight: '800',
    color: '#0F172A',
    marginTop: 2,
  },
  specSectionBlock: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 6,
    padding: 8,
    gap: 4,
    marginTop: 2,
  },
  specSectionBlockWarning: {
    backgroundColor: '#FFFBE6',
    borderColor: '#FDE68A',
  },
  specSectionBlockMissing: {
    backgroundColor: '#FFF1F2',
    borderColor: '#FECDD3',
  },
  specSectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  specSectionTitle: {
    fontSize: 9.5,
    fontWeight: '800',
    color: '#64748B',
    letterSpacing: 0.5,
  },
  skillsCountBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
  },
  skillsBadgeSuccess: {
    backgroundColor: '#DCFCE7',
  },
  skillsBadgeWarning: {
    backgroundColor: '#FEF3C7',
  },
  skillsCountBadgeText: {
    fontSize: 10,
    fontWeight: '800',
  },
  skillsChipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
    marginTop: 4,
  },
  specSkillChip: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
  },
  specSkillChipText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#1E293B',
  },
  missingWarningText: {
    fontSize: 11,
    color: '#D97706',
    fontWeight: '700',
    marginTop: 2,
  },
  missingErrorText: {
    fontSize: 11,
    color: '#E11D48',
    fontWeight: '700',
    marginTop: 2,
  },
  expEntryItem: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderLeftWidth: 3,
    borderLeftColor: '#0284C7',
    padding: 6,
    borderRadius: 4,
  },
  expEntryTitle: {
    fontSize: 11.5,
    fontWeight: '800',
    color: '#0F172A',
  },
  expEntrySubtitle: {
    fontSize: 10.5,
    color: '#64748B',
    fontWeight: '600',
    marginTop: 1,
  },
  eduEntryItem: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderLeftWidth: 3,
    borderLeftColor: '#16A34A',
    padding: 6,
    borderRadius: 4,
  },
  eduEntryTitle: {
    fontSize: 11.5,
    fontWeight: '800',
    color: '#0F172A',
  },
  eduEntrySubtitle: {
    fontSize: 10.5,
    color: '#64748B',
    fontWeight: '600',
    marginTop: 1,
  },
  bioDetailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  bioDetailLabel: {
    fontSize: 11.5,
    color: '#64748B',
    fontWeight: '600',
  },
  bioDetailValue: {
    fontSize: 12,
    fontWeight: '800',
    color: '#0F172A',
  },
  coverNoteLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#334155',
    marginTop: 4,
  },
  salaryInput: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    fontSize: 13,
    color: '#0F172A',
    fontWeight: '700',
  },
  coverNoteInput: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 8,
    padding: 10,
    fontSize: 12.5,
    color: '#0F172A',
    minHeight: 65,
    textAlignVertical: 'top',
  },
  modalFooter: {
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 12,
  },
  confirmSubmitBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: COLORS.primary,
    paddingVertical: 13,
    borderRadius: 8,
  },
  confirmSubmitBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '900',
  },
});
