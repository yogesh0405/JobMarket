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
  StatusBar,
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
  Globe,
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

  const [activeTab, setActiveTab] = useState<'job_overview' | 'company_info'>('job_overview');

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" translucent={false} />

      <ScrollView
        contentContainerStyle={styles.scrollContentBody}
        showsVerticalScrollIndicator={false}
      >
        {/* TOP COMPANY & JOB HEADER MASTER CARD */}
        <View style={styles.profileHeaderMasterCard}>
          {/* Top Blue Banner: Exact Element Placement */}
          <View style={[styles.topHeaderBandPrimary, { height: 100 + Math.max(insets.top, 6), paddingTop: Math.max(insets.top + 6, 12) }]}>
            <View style={styles.headerBandTopActions}>
              {/* Back Navigation Arrow */}
              <TouchableOpacity
                style={styles.backBtnHeader}
                onPress={handleBackNavigation}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <ChevronLeft size={20} color="#FFFFFF" strokeWidth={2.5} />
              </TouchableOpacity>

              {/* Top Right Actions: Compact Share & Save Icons */}
              <View style={styles.topRightActionsRow}>
                <TouchableOpacity
                  style={styles.transparentIconBtn}
                  onPress={handleShareJob}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  <Share2 size={16} color="#FFFFFF" />
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.transparentIconBtn}
                  onPress={handleToggleSave}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  <Bookmark
                    size={16}
                    color="#FFFFFF"
                    fill={isSaved ? '#FFFFFF' : 'transparent'}
                  />
                </TouchableOpacity>
              </View>
            </View>

            {/* Avatar + Company Name & Job Role Stack inside Blue Section */}
            <View style={styles.bannerHeaderFlexRow}>
              {/* Circular Company Avatar */}
              <View style={styles.bannerAvatarBox}>
                <CompanyLogoAvatar
                  logoUrl={logoUrl}
                  companyName={job.company}
                  size={64}
                  borderRadius={32}
                />
              </View>

              {/* Both Company Name & Job Role Title inside Blue Header Stack */}
              <View style={styles.bannerTitleTextStack}>
                <View style={styles.bannerCompanyRow}>
                  <Text style={styles.bannerCompanyNameText} numberOfLines={1}>
                    {job.company || 'Company'}
                  </Text>
                  <CheckCircle2 size={15} color="#FFFFFF" strokeWidth={2} />
                </View>

                {/* Job Role Title included inside Blue Header */}
                <Text style={styles.bannerJobRoleSubText} numberOfLines={1}>
                  {job.title}
                </Text>

                {(job as any).handle ? (
                  <Text style={styles.bannerCompanyHandleText}>@{(job as any).handle}</Text>
                ) : null}
              </View>
            </View>
          </View>

          {/* White Body Header Area */}
          <View style={styles.whiteHeaderCardBody}>
            {/* Top Right Openings Count Badge directly below Blue Section */}
            <View style={styles.openingsBadgeTopRight}>
              <Users size={11} color={COLORS.primary} />
              <Text style={styles.openingsBadgeText}>
                {job.openings ? `${job.openings} Openings` : '1 Vacancy'}
              </Text>
            </View>

            {/* Authentic Metadata Stack (Location, Website, Industry) */}
            <View style={styles.refMetaStack}>
              {/* Row 1: Map Pin & Website */}
              {job.location || (job as any).website ? (
                <View style={styles.refMetaRow}>
                  {job.location ? (
                    <>
                      <MapPin size={13} color="#64748B" />
                      <Text style={styles.refMetaText}>{job.location}</Text>
                    </>
                  ) : null}
                  {(job as any).website ? (
                    <>
                      <Globe size={13} color={COLORS.primary} style={{ marginLeft: job.location ? 12 : 0 }} />
                      <Text style={styles.refMetaLink}>{(job as any).website}</Text>
                    </>
                  ) : null}
                </View>
              ) : null}

              {/* Row 2: Industry */}
              {job.industry || job.trade ? (
                <View style={styles.refMetaRow}>
                  <Building2 size={13} color="#64748B" />
                  <Text style={styles.refMetaText}>Industry : {job.industry || job.trade}</Text>
                </View>
              ) : null}
            </View>

            {/* Segmented Underline Tab Bar */}
            <View style={styles.segmentedTabBar}>
              <TouchableOpacity
                activeOpacity={0.8}
                style={[styles.segmentedTabBtn, activeTab === 'job_overview' && styles.segmentedTabBtnActive]}
                onPress={() => setActiveTab('job_overview')}
              >
                <Briefcase size={14} color={activeTab === 'job_overview' ? COLORS.primary : '#64748B'} />
                <Text style={[styles.segmentedTabText, activeTab === 'job_overview' && styles.segmentedTabTextActive]}>
                  Job Overview
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                activeOpacity={0.8}
                style={[styles.segmentedTabBtn, activeTab === 'company_info' && styles.segmentedTabBtnActive]}
                onPress={() => setActiveTab('company_info')}
              >
                <Award size={14} color={activeTab === 'company_info' ? COLORS.primary : '#64748B'} />
                <Text style={[styles.segmentedTabText, activeTab === 'company_info' && styles.segmentedTabTextActive]}>
                  Requirements & Perks
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* GREY SECTION SEPARATOR LINE TO SEPARATE HEADER FROM BELOW SECTION */}
        <View style={styles.headerBodySeparatorSlate} />

        {/* CLASSIFIED BODY CONTENT CONTAINER (CLEAN & VISUALLY CALM) */}
        <View style={styles.cardBlockContainer}>
          {activeTab === 'job_overview' ? (
            /* PART 1: JOB OVERVIEW & ROLE DETAILS */
            <>
              {/* SECTION 1: Key Job Specifications Grid */}
              <View style={styles.sectionHeaderRow}>
                <Text style={styles.sectionTitleText}>Key Specifications</Text>
              </View>

              <View style={styles.specGrid2Col}>
                <View style={styles.specGridItem}>
                  <Text style={styles.specLabelText}>Trade / Role</Text>
                  <Text style={styles.specValueText} numberOfLines={1}>{job.trade || job.title}</Text>
                </View>

                {/* Salary Package */}
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

                {(job.shift_details || (job as any).shiftDetails) ? (
                  <View style={styles.specGridItem}>
                    <Text style={styles.specLabelText}>Shift Details</Text>
                    <Text style={styles.specValueText} numberOfLines={1}>{job.shift_details || (job as any).shiftDetails}</Text>
                  </View>
                ) : null}
              </View>

              {/* SECTION 2: Technical Skills & Trade List */}
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

              {/* SECTION 3: Job Overview & Description */}
              <View style={styles.sectionDividerSlate} />
              <View style={styles.sectionHeaderRow}>
                <Text style={styles.sectionTitleText}>Role Description</Text>
              </View>
              <Text style={styles.bodyTextText}>
                {job.description || 'No detailed description provided for this industrial opening.'}
              </Text>

              {/* SECTION 4: Key Responsibilities */}
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
            /* PART 2: REQUIREMENTS, PERKS & VENUE DETAILS */
            <>
              {/* SECTION 1: Requirements & ITI Certification */}
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

              {/* SECTION 2: Perks & Facilities Offered */}
              {uniquePerks.length > 0 ? (
                <View style={{ marginBottom: 12 }}>
                  {Array.isArray(job.requirements) && job.requirements.length > 0 ? (
                    <View style={styles.sectionDividerSlate} />
                  ) : null}
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

              {/* SECTION 3: Interview Venue & Address */}
              {(job.interview_address || (job as any).interviewAddress) ? (
                <View style={{ marginBottom: 12 }}>
                  <View style={styles.sectionDividerSlate} />
                  <View style={styles.sectionHeaderRow}>
                    <Text style={styles.sectionTitleText}>Interview Venue & Address</Text>
                  </View>
                  <Text style={styles.bodyTextText}>
                    {job.interview_address || (job as any).interviewAddress}
                  </Text>
                </View>
              ) : null}

              {/* SECTION 4: Live Map Location Preview */}
              {job.google_maps_url || job.googleMapsUrl || (job.latitude && job.longitude) ? (
                <View>
                  <View style={styles.sectionDividerSlate} />
                  <View style={styles.sectionHeaderRow}>
                    <Text style={styles.sectionTitleText}>Factory Location Map</Text>
                  </View>
                  <JobLocationMapPreview
                    latitude={job.latitude}
                    longitude={job.longitude}
                    locationName={job.location}
                  />
                </View>
              ) : null}
            </>
          )}
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
    backgroundColor: '#FFFFFF',
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
    overflow: 'visible',
    zIndex: 10,
    position: 'relative',
  },
  topHeaderBandPrimary: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 16,
    paddingTop: 8,
    position: 'relative',
    zIndex: 20,
    elevation: 4,
  },
  headerBandTopActions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    zIndex: 40,
  },
  backBtnHeader: {
    padding: 4,
    backgroundColor: 'transparent',
  },
  topRightActionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  transparentIconBtn: {
    padding: 4,
    backgroundColor: 'transparent',
  },
  bannerHeaderFlexRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
    gap: 12,
    zIndex: 30,
    position: 'relative',
  },
  bannerAvatarBox: {
    borderWidth: 2.5,
    borderColor: '#FFFFFF',
    borderRadius: 34,
    backgroundColor: '#FFFFFF',
    transform: [{ translateY: 12 }],
    zIndex: 99,
    elevation: 10,
  },
  bannerTitleTextStack: {
    flex: 1,
    justifyContent: 'center',
  },
  bannerCompanyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flexShrink: 1,
  },
  bannerCompanyNameText: {
    fontSize: 16.5,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: -0.2,
    flexShrink: 1,
  },
  bannerJobRoleSubText: {
    fontSize: 13.5,
    fontWeight: '700',
    color: '#DBEAFE',
    marginTop: 2,
    marginBottom: 6,
    letterSpacing: -0.1,
  },
  bannerCompanyHandleText: {
    fontSize: 11.5,
    color: '#93C5FD',
    fontWeight: '500',
    marginTop: 1,
  },
  whiteHeaderCardBody: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 0,
    backgroundColor: '#FFFFFF',
    zIndex: 1,
  },
  openingsBadgeTopRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#BFDBFE',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 8,
    alignSelf: 'flex-end',
    marginTop: 2,
    marginBottom: 2,
  },
  openingsBadgeText: {
    fontSize: 10.5,
    fontWeight: '700',
    color: COLORS.primary,
  },
  roleBelowCompanyBox: {
    paddingLeft: 73,
    paddingTop: 0,
    paddingBottom: 8,
  },
  jobTitleMainHeadline: {
    fontSize: 15.5,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: -0.2,
    lineHeight: 21,
  },
  refMetaStack: {
    gap: 8,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    marginBottom: 4,
  },
  refMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flexWrap: 'wrap',
  },
  refMetaText: {
    fontSize: 12,
    color: '#475569',
    fontWeight: '500',
  },
  refMetaLink: {
    fontSize: 12,
    color: COLORS.primary,
    fontWeight: '600',
  },
  refBoldMetricText: {
    fontSize: 13.5,
    fontWeight: '800',
    color: '#0F172A',
  },
  refMutedMetricText: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '500',
  },

  segmentedTabBar: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: '#CBD5E1',
    marginTop: 14,
    width: '100%',
  },
  segmentedTabBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 11,
    borderBottomWidth: 3.5,
    borderBottomColor: 'transparent',
  },
  segmentedTabBtnActive: {
    borderBottomColor: COLORS.primary,
  },
  segmentedTabText: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#64748B',
  },
  segmentedTabTextActive: {
    color: COLORS.primary,
    fontWeight: '800',
  },
  headerBodySeparatorSlate: {
    height: 1,
    backgroundColor: '#CBD5E1',
    width: '100%',
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
    gap: 6,
    marginBottom: 8,
  },
  sectionTitleText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: -0.2,
  },
  specGrid2Col: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    rowGap: 12,
    columnGap: 16,
    marginTop: 4,
  },
  specGridItem: {
    flexBasis: '47%',
    flexGrow: 1,
    backgroundColor: 'transparent',
    borderWidth: 0,
    paddingVertical: 2,
    paddingHorizontal: 0,
  },
  specLabelText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
    marginBottom: 2,
  },
  specValueText: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#0F172A',
  },
  skillChipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 4,
  },
  skillPillBadge: {
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 4,
  },
  skillPillText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#334155',
  },
  bodyTextText: {
    fontSize: 12.5,
    color: '#475569',
    lineHeight: 19,
  },
  sectionDividerSlate: {
    height: 1,
    backgroundColor: '#CBD5E1',
    marginVertical: 12,
  },
  bulletList: {
    gap: 8,
  },
  bulletItemRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 6,
  },
  bulletDotText: {
    fontSize: 14,
    color: '#64748B',
    fontWeight: '700',
    lineHeight: 18,
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
