import { COLORS } from '../../constants/theme';
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Share,
  Platform,
} from 'react-native';
import {
  MapPin,
  Briefcase,
  Bookmark,
  Users,
  CheckCircle2,
  Award,
  Send,
  IndianRupee,
  Calendar,
  Layers,
  Sparkles,
  FileText,
  Share2,
  ChevronLeft,
  Clock,
  Building2,
  Wrench,
  Check,
  Utensils,
} from 'lucide-react-native';
import { jobsApi } from '../../api/jobsApi';
import { candidateApi } from '../../api/candidateApi';
import { Job } from '../../types';
import { CompanyLogoAvatar } from '../../components/common/CompanyLogoAvatar';
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
  const initialJobId = extractJobIdFromUrl(rawParamId);

  const findSeedJob = (targetId?: string): Job | undefined => {
    if (!targetId) return undefined;
    const cleanId = String(targetId).trim().toLowerCase();
    return FALLBACK_SEED_JOBS.find(
      (j) =>
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

      if (mounted && user) {
        candidateApi
          .getSavedJobs()
          .then((savedRes) => {
            if (mounted && savedRes) {
              const savedData: any = savedRes;
              let savedList: any[] = [];
              if (Array.isArray(savedData)) savedList = savedData;
              else if (savedData?.data) savedList = savedData.data;
              const savedIds = savedList.map((j: any) => j.id || j.jobId);
              setIsSaved(savedIds.includes(jobId));
            }
          })
          .catch(() => {});

        candidateApi
          .getAppliedJobs()
          .then((appliedRes) => {
            if (mounted && appliedRes) {
              const appliedData: any = appliedRes;
              let appliedList: any[] = [];
              if (Array.isArray(appliedData)) appliedList = appliedData;
              else if (appliedData?.data) appliedList = appliedData.data;

              appliedJobsStore.setAppliedJobs(appliedList);
              const matchApp = appliedList.find(
                (item: any) =>
                  (item.jobId || item.job?.id || item.id) === jobId || String(item.jobId) === String(jobId)
              );
              if (matchApp) {
                setHasApplied(true);
                setAppliedItem(matchApp);
              }
            }
          })
          .catch(() => {});
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
      Alert.alert('Sign In Required', 'Please sign in or create an account to save job vacancies.', [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Sign In', onPress: () => navigation.navigate('EmployerLogin') },
      ]);
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
          <TouchableOpacity onPress={handleBackNavigation} style={{ padding: 6 }}>
            <ChevronLeft size={24} color="#0F172A" />
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

  const logoUrl = job.companyLogo || (job as any).company_logo || (job as any).logoUrl || (job as any).logo_url || (job as any).logo;

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

  const getPerkMeta = (perk: string) => {
    const p = perk.toLowerCase();
    if (p.includes('canteen') || p.includes('food') || p.includes('meal')) {
      return { icon: Utensils, color: '#059669', bg: '#ECFDF5', tag: 'Canteen Facility' };
    }
    if (p.includes('bus') || p.includes('transport') || p.includes('cab')) {
      return { icon: MapPin, color: COLORS.primary, bg: '#EFF6FF', tag: 'Factory Transport' };
    }
    if (p.includes('hostel') || p.includes('accommodation') || p.includes('room')) {
      return { icon: Building2, color: '#7C3AED', bg: '#F5F3FF', tag: 'Free Residence' };
    }
    if (p.includes('overtime') || p.includes('ot')) {
      return { icon: Clock, color: '#D97706', bg: '#FEF3C7', tag: 'OT Pay 1.5x' };
    }
    if (p.includes('bonus') || p.includes('joining') || p.includes('attendance')) {
      return { icon: Sparkles, color: '#0284C7', bg: '#F0F9FF', tag: 'Monthly Bonus' };
    }
    return { icon: CheckCircle2, color: '#16A34A', bg: '#F0FDF4', tag: 'Verified Benefit' };
  };

  return (
    <View style={styles.container}>
      {/* Top Overscroll Blue Fill to eliminate any white space above blue header when scrolling up or down */}
      <View style={styles.topOverscrollBlueFill} />

      <ScrollView
        contentContainerStyle={styles.scrollContentBody}
        showsVerticalScrollIndicator={false}
      >
        {/* FULL SCREEN TOP JOB HEADER MASTER CARD */}
        <View style={styles.profileHeaderMasterCard}>
          {/* Top Primary Color Header Band (Includes Back, Share, Save) */}
          <View style={[styles.topHeaderBandPrimary, { height: 98 + insets.top, paddingTop: Math.max(insets.top + 4, 12) }]}>
            <View style={styles.headerBandTopActions}>
              {/* Back Arrow Navigation */}
              <TouchableOpacity
                style={styles.backBtnHeader}
                onPress={handleBackNavigation}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <ChevronLeft size={21} color="#FFFFFF" strokeWidth={2.5} />
              </TouchableOpacity>

              {/* Right Actions (Share + Save) */}
              <View style={styles.topRightActionsRow}>
                <TouchableOpacity
                  style={styles.actionBtnHeader}
                  onPress={handleShareJob}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  <Share2 size={17} color="#FFFFFF" />
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.actionBtnHeader}
                  onPress={handleToggleSave}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  <Bookmark
                    size={17}
                    color="#FFFFFF"
                    fill={isSaved ? '#FFFFFF' : 'transparent'}
                  />
                </TouchableOpacity>
              </View>
            </View>
          </View>

          {/* Overlapping Centered Company Logo Avatar */}
          <View style={[styles.overlappingAvatarContainer, { top: 52 + insets.top }]}>
            <CompanyLogoAvatar
              logoUrl={logoUrl}
              companyName={job.company}
              size={84}
              borderRadius={42}
            />
          </View>

          {/* Header Info Below Overlapping Avatar */}
          <View style={styles.headerInfoContentStack}>
            <Text style={styles.candidateNameTitleText}>{job.title}</Text>
            <Text style={styles.candidateSpecializationSubText}>
              {job.company || 'Industrial Partner'} • {job.location || 'MIDC Zone'}
            </Text>

            {/* Quick Metrics Row Below Title */}
            <View style={styles.quickMetricsRowHeader}>
              <View style={styles.quickMetricItem}>
                <IndianRupee size={13} color={COLORS.primary} />
                <Text style={styles.quickMetricValue}>
                  ₹{job.salary_min || job.salaryMin || 15000} - ₹{job.salary_max || job.salaryMax || 25000}
                </Text>
              </View>

              <View style={styles.quickMetricDivider} />

              <View style={styles.quickMetricItem}>
                <Briefcase size={13} color="#64748B" />
                <Text style={styles.quickMetricValueLabel}>
                  {job.job_type || job.jobType || 'Full-Time'}
                </Text>
              </View>

              <View style={styles.quickMetricDivider} />

              <View style={styles.quickMetricItem}>
                <Users size={13} color="#64748B" />
                <Text style={styles.quickMetricValueLabel}>
                  {job.openings ?? 1} Vacancy
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* FULL SCREEN MASTER BODY CONTAINER */}
        <View style={styles.cardBlockContainer}>
          {/* SECTION 1: Key Job Specifications Grid */}
          <View style={styles.sectionHeaderRow}>
            <Briefcase size={18} color={COLORS.primary} />
            <Text style={styles.sectionTitleText}>Key Vacancy Specifications</Text>
          </View>

          <View style={styles.specGrid2Col}>
            <View style={styles.specGridItem}>
              <Text style={styles.specLabelText}>Trade / Role</Text>
              <Text style={styles.specValueText}>{job.trade || job.title || 'Technical Specialist'}</Text>
            </View>

            <View style={styles.specGridItem}>
              <Text style={styles.specLabelText}>Experience Required</Text>
              <Text style={styles.specValueText}>{minExp} - {maxExp} Years</Text>
            </View>

            <View style={styles.specGridItem}>
              <Text style={styles.specLabelText}>Work Mode</Text>
              <Text style={styles.specValueText}>{job.work_mode || job.workMode || 'On-site (Shop Floor)'}</Text>
            </View>

            <View style={styles.specGridItem}>
              <Text style={styles.specLabelText}>Shift Details</Text>
              <Text style={styles.specValueText}>{job.shift_details || (job as any).shiftDetails || 'Day Shift (8:00 AM - 5:00 PM)'}</Text>
            </View>
          </View>

          {/* SECTION 2: Technical Skills & Trade Chips */}
          {Array.isArray(job.skills) && job.skills.length > 0 ? (
            <>
              <View style={styles.sectionDividerSlate} />
              <View style={styles.sectionHeaderRow}>
                <Sparkles size={18} color={COLORS.primary} />
                <Text style={styles.sectionTitleText}>Required Technical Skills</Text>
              </View>

              <View style={styles.skillChipsRow}>
                {job.skills.map((skill, idx) => (
                  <View key={idx} style={styles.skillPillBadge}>
                    <Text style={styles.skillPillText}>{skill}</Text>
                  </View>
                ))}
              </View>
            </>
          ) : null}

          {/* SECTION 3: Job Overview & Description */}
          <View style={styles.sectionDividerSlate} />
          <View style={styles.sectionHeaderRow}>
            <FileText size={18} color={COLORS.primary} />
            <Text style={styles.sectionTitleText}>Job Description & Role Summary</Text>
          </View>
          <Text style={styles.bodyTextText}>
            {job.description || 'No detailed description provided for this industrial opening.'}
          </Text>

          {/* SECTION 4: Key Responsibilities */}
          {Array.isArray(job.responsibilities) && job.responsibilities.length > 0 ? (
            <>
              <View style={styles.sectionDividerSlate} />
              <View style={styles.sectionHeaderRow}>
                <Layers size={18} color={COLORS.primary} />
                <Text style={styles.sectionTitleText}>Key Responsibilities</Text>
              </View>
              <View style={styles.bulletList}>
                {job.responsibilities.map((resp, idx) => (
                  <View key={idx} style={styles.bulletItemRow}>
                    <CheckCircle2 size={15} color={COLORS.primary} style={{ marginTop: 2 }} />
                    <Text style={styles.bulletItemText}>{resp}</Text>
                  </View>
                ))}
              </View>
            </>
          ) : null}

          {/* SECTION 5: Requirements & ITI Certification */}
          {Array.isArray(job.requirements) && job.requirements.length > 0 ? (
            <>
              <View style={styles.sectionDividerSlate} />
              <View style={styles.sectionHeaderRow}>
                <Award size={18} color="#D97706" />
                <Text style={styles.sectionTitleText}>Requirements & ITI Certification</Text>
              </View>
              <View style={styles.bulletList}>
                {job.requirements.map((req, idx) => (
                  <View key={idx} style={styles.bulletItemRow}>
                    <Award size={15} color="#D97706" style={{ marginTop: 2 }} />
                    <Text style={styles.bulletItemText}>{req}</Text>
                  </View>
                ))}
              </View>
            </>
          ) : null}

          {/* SECTION 6: Perks & Facilities Offered */}
          {uniquePerks.length > 0 ? (
            <>
              <View style={styles.sectionDividerSlate} />
              <View style={styles.sectionHeaderRow}>
                <CheckCircle2 size={18} color={COLORS.primary} />
                <Text style={styles.sectionTitleText}>Perks & Facilities Offered</Text>
              </View>

              <View style={styles.perksInlineRow}>
                {uniquePerks.map((perk, idx) => (
                  <View key={idx} style={styles.perkInlineTag}>
                    <Check size={13} color={COLORS.primary} strokeWidth={2.5} />
                    <Text style={styles.perkInlineTagText}>{perk}</Text>
                  </View>
                ))}
              </View>
            </>
          ) : null}

          {/* SECTION 7: Interview Venue & Address */}
          {(job.interview_address || (job as any).interviewAddress) ? (
            <>
              <View style={styles.sectionDividerSlate} />
              <View style={styles.sectionHeaderRow}>
                <Calendar size={18} color="#059669" />
                <Text style={styles.sectionTitleText}>Interview Venue & Address</Text>
              </View>
              <Text style={styles.bodyTextText}>
                {job.interview_address || (job as any).interviewAddress}
              </Text>
            </>
          ) : null}

          {/* SECTION 8: Live Map Location Preview */}
          {job.google_maps_url || job.googleMapsUrl || (job.latitude && job.longitude) ? (
            <>
              <View style={styles.sectionDividerSlate} />
              <View style={styles.sectionHeaderRow}>
                <MapPin size={18} color={COLORS.primary} />
                <Text style={styles.sectionTitleText}>Factory Location Map</Text>
              </View>
              <JobLocationMapPreview
                latitude={job.latitude}
                longitude={job.longitude}
                locationName={job.location}
              />
            </>
          ) : null}
        </View>
      </ScrollView>

      {/* FULL WIDTH STICKY BOTTOM ACTION BAR */}
      <View style={[styles.bottomBarSticky, { paddingBottom: Math.max(insets.bottom, 6), paddingTop: 8 }]}>
        {hasApplied ? (
          (() => {
            const st = (appliedItem?.status || 'applied').toLowerCase();
            let bg = '#DCFCE7';
            let border = '#86EFAC';
            let text = '#16A34A';
            let label = 'APPLICATION SUBMITTED';

            if (st === 'shortlisted' || st === 'accepted' || st === 'hired') {
              bg = '#DCFCE7';
              border = '#86EFAC';
              text = '#16A34A';
              label = st === 'accepted' || st === 'hired' ? 'HIRED' : 'SHORTLISTED FOR INTERVIEW';
            } else if (st === 'reviewed' || st === 'under_review') {
              bg = '#FEF3C7';
              border = '#FDE68A';
              text = '#D97706';
              label = 'APPLICATION UNDER REVIEW';
            } else if (st === 'rejected') {
              bg = '#FEE2E2';
              border = '#FCA5A5';
              text = '#DC2626';
              label = 'NOT SHORTLISTED';
            }

            return (
              <View style={[styles.appliedBannerBox, { backgroundColor: bg, borderColor: border }]}>
                <CheckCircle2 size={18} color={text} />
                <Text style={[styles.appliedBannerText, { color: text }]}>{label}</Text>
              </View>
            );
          })()
        ) : (
          <TouchableOpacity
            activeOpacity={0.85}
            style={styles.applyNowBtnPrimary}
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
            <Text style={styles.applyNowBtnTextPrimary}>Apply Now</Text>
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
  topOverscrollBlueFill: {
    position: 'absolute',
    top: -500,
    left: 0,
    right: 0,
    height: 500,
    backgroundColor: COLORS.primary,
  },
  scrollContentBody: {
    paddingTop: 0,
    paddingBottom: 75,
  },
  profileHeaderMasterCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 0,
    borderRadius: 0,
    marginHorizontal: 0,
    marginTop: 0,
    marginBottom: 0,
    overflow: 'hidden',
  },
  topHeaderBandPrimary: {
    height: 98,
    backgroundColor: COLORS.primary,
    paddingHorizontal: 16,
    paddingTop: 10,
  },
  headerBandTopActions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 2,
  },
  backBtnHeader: {
    padding: 4,
    backgroundColor: 'transparent',
  },
  topRightActionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  actionBtnHeader: {
    padding: 4,
    backgroundColor: 'transparent',
  },
  overlappingAvatarContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 10,
  },
  headerInfoContentStack: {
    paddingTop: 46,
    paddingBottom: 16,
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  candidateNameTitleText: {
    fontSize: 19,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: -0.3,
    textAlign: 'center',
  },
  candidateSpecializationSubText: {
    fontSize: 12.5,
    fontWeight: '600',
    color: '#64748B',
    marginTop: 3,
    textAlign: 'center',
  },
  quickMetricsRowHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    width: '100%',
  },
  quickMetricItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  quickMetricValue: {
    fontSize: 13,
    fontWeight: '800',
    color: COLORS.primary,
  },
  quickMetricValueLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#475569',
  },
  quickMetricDivider: {
    width: 1,
    height: 16,
    backgroundColor: '#CBD5E1',
  },
  cardBlockContainer: {
    backgroundColor: '#FFFFFF',
    borderWidth: 0,
    borderRadius: 0,
    padding: 16,
    marginHorizontal: 0,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 10,
  },
  sectionTitleText: {
    fontSize: 14.5,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: -0.2,
  },
  specGrid2Col: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginTop: 4,
  },
  specGridItem: {
    width: '48%',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 10,
    borderRadius: 0,
  },
  specLabelText: {
    fontSize: 10.5,
    fontWeight: '700',
    color: '#64748B',
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  specValueText: {
    fontSize: 12.5,
    fontWeight: '800',
    color: '#0F172A',
    marginTop: 2,
  },
  skillChipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 4,
  },
  skillPillBadge: {
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#BFDBFE',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 0,
  },
  skillPillText: {
    fontSize: 11.5,
    fontWeight: '800',
    color: COLORS.primary,
  },
  bodyTextText: {
    fontSize: 13,
    color: '#475569',
    lineHeight: 19,
  },
  sectionDividerSlate: {
    height: 1,
    backgroundColor: '#94A3B8',
    marginVertical: 14,
  },
  bulletList: {
    gap: 8,
  },
  bulletItemRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  bulletItemText: {
    fontSize: 12.5,
    color: '#334155',
    lineHeight: 18,
    flex: 1,
  },
  perksInlineRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 4,
  },
  perkInlineTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 0,
  },
  perkInlineTagText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0F172A',
  },
  bottomBarSticky: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#CBD5E1',
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 6,
    zIndex: 999,
  },
  applyNowBtnPrimary: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: COLORS.primary,
    paddingVertical: 9,
    borderRadius: 0,
    width: '100%',
  },
  applyNowBtnTextPrimary: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '900',
  },
  appliedBannerBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 11,
    borderRadius: 0,
    borderWidth: 1,
    width: '100%',
  },
  appliedBannerText: {
    fontSize: 12.5,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
});
