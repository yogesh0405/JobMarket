import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
} from 'react-native';
import {
  MapPin,
  Briefcase,
  Clock,
  User,
  FileText,
  AlertTriangle,
  Pencil,
  Send,
} from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Header } from '../../components/common/Header';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../context/ToastContext';
import { candidateApi } from '../../api/candidateApi';
import { CompanyLogoAvatar } from '../../components/common/CompanyLogoAvatar';
import { appliedJobsStore } from '../../utils/appliedJobsStore';
import { Job } from '../../types';

interface Props {
  navigation: any;
  route: any;
}

export const CandidateApplyConfirmScreen: React.FC<Props> = ({ navigation, route }) => {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const { showToast } = useToast();

  const job = route.params?.job as Job;
  const onAppliedSuccess = route.params?.onAppliedSuccess;

  const [submitting, setSubmitting] = useState(false);

  // Resume Parser Helper
  const getResumeInfo = (u: any) => {
    if (!u) return { hasResume: false, url: null, name: null };

    const rawResume = u.resume;
    let parsedObj: any = null;

    if (typeof rawResume === 'string') {
      const trimmed = rawResume.trim();
      if (trimmed.startsWith('{') || trimmed.startsWith('[')) {
        try {
          parsedObj = JSON.parse(trimmed);
        } catch (e) {}
      }
    }

    const url =
      u.resumeUrl ||
      u.resume_url ||
      u.resumePath ||
      u.resume_path ||
      (typeof rawResume === 'string' && !rawResume.startsWith('{') ? rawResume : null) ||
      parsedObj?.url ||
      parsedObj?.path ||
      (typeof rawResume === 'object' && rawResume?.url ? rawResume.url : null);

    const hasResume = Boolean(
      url && typeof url === 'string' && url.trim().length > 3 && !url.includes('null') && !url.includes('undefined')
    );

    let name =
      u.resumeName ||
      u.resume_name ||
      parsedObj?.name ||
      parsedObj?.originalName ||
      (typeof rawResume === 'object' && rawResume?.name ? rawResume.name : null);

    if (!name && hasResume && typeof url === 'string') {
      const parts = url.split('/');
      const filename = parts.pop() || '';
      name = filename.split('?')[0] || 'Uploaded_Resume.pdf';
    }

    return {
      hasResume,
      url,
      name: name || 'Uploaded_Resume.pdf',
    };
  };

  const { hasResume, name: resumeFileName } = getResumeInfo(user);

  // Candidate Profile Data Parsing
  const nameVal = user?.name || (user as any)?.full_name || 'Workforce Applicant';
  const emailVal = user?.email || '';
  const phoneVal = user?.phone || (user as any)?.mobile || (user as any)?.phone_number || '';
  const locationVal = user?.location || user?.address || (user as any)?.city || '';
  const tradeVal = user?.tradeSpecialization || (user as any)?.trade_specialization || user?.headline || (user as any)?.trade || '';
  
  // Experience Parser & Safe Text Formatter
  const expList: any[] = Array.isArray(user?.experience)
    ? user.experience
    : typeof user?.experience === 'string'
    ? ((): any[] => { try { return JSON.parse(user.experience as string); } catch (_) { return []; } })()
    : Array.isArray((user as any)?.work_experience)
    ? (user as any).work_experience
    : [];

  const formatExpVal = (): string | null => {
    const raw = (user as any)?.totalExperience || (user as any)?.total_experience || (user as any)?.experienceYears || (user as any)?.experience_years;
    if (raw && typeof raw !== 'object') {
      return typeof raw === 'number' ? `${raw} Years Exp` : String(raw);
    }
    if (Array.isArray(expList) && expList.length > 0) {
      const first = expList[0];
      if (typeof first === 'string' && first.trim()) return first.trim();
      if (first && typeof first === 'object') {
        const role = first.designation || first.title || first.role || first.company || first.companyName;
        const duration = first.years || first.duration || first.experience;
        if (role && duration) return `${role} (${duration})`;
        if (role) return role;
        if (duration) return `${duration}`;
      }
      return `${expList.length} Work Experience Record(s)`;
    }
    return null;
  };

  const expVal = formatExpVal();

  // Technical Skills List
  const skillsList: string[] = Array.isArray(user?.skills)
    ? user.skills
    : typeof user?.skills === 'string'
    ? (user.skills as string).split(',').map((s) => s.trim()).filter(Boolean)
    : [];

  // Missing Info Items
  const missingItems: { label: string; detail: string }[] = [];
  if (!phoneVal) missingItems.push({ label: 'Phone Contact', detail: 'Phone Contact number missing' });
  if (!locationVal) missingItems.push({ label: 'Location / City', detail: 'Location / City not specified' });
  if (!tradeVal) missingItems.push({ label: 'Primary Trade', detail: 'Primary Trade specialization not configured' });
  if (skillsList.length < 5) missingItems.push({ label: 'Technical Skills', detail: `Technical Skills (${skillsList.length}/5 minimum recommended)` });
  if (!expVal && expList.length === 0) missingItems.push({ label: 'Work Experience', detail: 'Work Experience History not added' });
  if (!hasResume) missingItems.push({ label: 'Resume Document', detail: 'Resume Document not uploaded' });

  const getTargetStepForMissingInfo = () => {
    if (!phoneVal || !locationVal || !tradeVal) {
      return 1; // Step 1: Basic Info (Phone, Location, Trade)
    }
    if (!expVal && expList.length === 0) {
      return 3; // Step 3: Work Experience
    }
    if (skillsList.length < 5 || !hasResume) {
      return 4; // Step 4: Technical Skills & Resume
    }
    return 1;
  };

  const handleNavigateToMissingStep = () => {
    const targetStep = getTargetStepForMissingInfo();
    navigation.navigate('CandidateEditProfile', {
      step: targetStep,
      initialStep: targetStep,
    });
  };

  // Handle Application Submit (0ms Instant Optimistic UX matching Web App)
  const handleApplySubmit = () => {
    if (!job?.id) {
      showToast('Invalid job details', 'error');
      return;
    }

    setSubmitting(true);

    // 1. Instantly record application in local store
    appliedJobsStore.addAppliedJob(job);
    showToast('Your application has been submitted to the recruiter.', 'success');

    // 2. Fire background API sync to live backend
    candidateApi.applyForJob(job.id, {}).catch((err) => {
      console.warn('Background application sync note:', err);
    });

    // 3. Return to previous screen instantly
    setTimeout(() => {
      setSubmitting(false);
      navigation.goBack();
    }, 150);
  };

  if (!job) {
    return (
      <View style={styles.container}>
        <Header title="Confirm Application" showBack={true} />
        <View style={styles.errorBox}>
          <Text style={styles.errorText}>No job selected for application.</Text>
        </View>
      </View>
    );
  }

  // Format Salary Range
  const salaryText = job.salaryMin && job.salaryMax
    ? `₹${job.salaryMin} - ₹${job.salaryMax} / mo`
    : job.salaryMin
    ? `₹${job.salaryMin} / mo`
    : 'Salary Negotiable';

  // Format Experience Range
  const expReqText = job.minExperience !== undefined && job.maxExperience !== undefined
    ? `${job.minExperience} - ${job.maxExperience} Years Exp`
    : '0 - 3 Years Exp';

  return (
    <View style={styles.container}>
      {/* Top Header */}
      <Header
        title="Confirm Job Application"
        subtitle="Review candidate details before submitting to recruiter"
        showBack={true}
      />

      <ScrollView
        style={styles.scrollContainer}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: 110 + insets.bottom }]}
        showsVerticalScrollIndicator={false}
      >
        {/* 1. TOP JOB DETAILS CARD */}
        <View style={styles.jobCardContainer}>
          {/* Solid Blue Top Banner */}
          <View style={styles.jobBannerHeader}>
            <CompanyLogoAvatar
              logoUrl={job.companyLogo || (job as any)?.logo}
              companyName={job.company || 'Employer'}
              size={46}
              borderRadius={23}
            />
            <View style={styles.jobBannerTextWrap}>
              <Text style={styles.companyNameText} numberOfLines={1}>
                {job.company || 'Enterprise Employer'}
              </Text>
              <Text style={styles.jobTitleText} numberOfLines={2}>
                {job.title}
              </Text>
            </View>
          </View>

          {/* Bottom Details Row */}
          <View style={styles.jobBannerBody}>
            {/* Location */}
            <View style={styles.jobMetaRow}>
              <MapPin size={15} color="#64748B" />
              <Text style={styles.jobMetaLocationText} numberOfLines={2}>
                {job.location || job.midc_zone || (job as any).midcZone || 'Chhatrapati Sambhajinagar, Maharashtra'}
              </Text>
            </View>

            {/* Salary & Exp Stats */}
            <View style={styles.jobStatsRow}>
              <View style={styles.statItem}>
                <Briefcase size={14} color="#2563EB" />
                <Text style={styles.statItemText}>{salaryText}</Text>
              </View>

              <View style={styles.statItem}>
                <Clock size={14} color="#64748B" />
                <Text style={styles.statItemText}>{expReqText}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* 2. CANDIDATE PROFILE CARD (Only Available Fields) */}
        <View style={styles.profileCardContainer}>
          {/* Card Header */}
          <View style={styles.profileCardTitleRow}>
            <User size={18} color="#2563EB" />
            <Text style={styles.profileCardTitle}>Candidate Profile</Text>
          </View>

          <View style={styles.fieldBlocksList}>
            {/* Full Name */}
            {nameVal ? (
              <View style={styles.fieldBlock}>
                <Text style={styles.fieldBlockLabel}>FULL NAME</Text>
                <Text style={styles.fieldBlockValue}>{nameVal}</Text>
              </View>
            ) : null}

            {/* Email Address */}
            {emailVal ? (
              <View style={styles.fieldBlock}>
                <Text style={styles.fieldBlockLabel}>EMAIL ADDRESS</Text>
                <Text style={styles.fieldBlockValue}>{emailVal}</Text>
              </View>
            ) : null}

            {/* Phone Contact */}
            {phoneVal ? (
              <View style={styles.fieldBlock}>
                <Text style={styles.fieldBlockLabel}>PHONE CONTACT</Text>
                <Text style={styles.fieldBlockValue}>{phoneVal}</Text>
              </View>
            ) : null}

            {/* Location / City */}
            {locationVal ? (
              <View style={styles.fieldBlock}>
                <Text style={styles.fieldBlockLabel}>LOCATION / CITY</Text>
                <Text style={styles.fieldBlockValue}>{locationVal}</Text>
              </View>
            ) : null}

            {/* Primary Trade */}
            {tradeVal ? (
              <View style={styles.fieldBlock}>
                <Text style={styles.fieldBlockLabel}>PRIMARY TRADE</Text>
                <Text style={styles.fieldBlockValue}>{tradeVal}</Text>
              </View>
            ) : null}

            {/* Experience */}
            {expVal ? (
              <View style={styles.fieldBlock}>
                <Text style={styles.fieldBlockLabel}>EXPERIENCE</Text>
                <Text style={styles.fieldBlockValue}>{expVal}</Text>
              </View>
            ) : null}

            {/* Resume Document Box */}
            {hasResume ? (
              <View style={styles.resumeGreenBox}>
                <View style={styles.resumeGreenHeader}>
                  <FileText size={18} color="#16A34A" />
                  <Text style={styles.resumeFileNameText} numberOfLines={1}>
                    {resumeFileName}
                  </Text>
                </View>
                <Text style={styles.resumeSubtext}>
                  This document will be automatically transmitted to the employer
                </Text>
              </View>
            ) : null}
          </View>
        </View>

        {/* 3. MISSING INFORMATION CARD (Only shown if missing fields exist) */}
        {missingItems.length > 0 && (
          <>
            <View style={styles.sectionSeparator} />

            <View style={styles.missingCardContainer}>
              {/* Missing Header Row */}
              <View style={styles.missingHeaderRow}>
                <View style={styles.missingTitleLeft}>
                  <AlertTriangle size={18} color="#D97706" />
                  <Text style={styles.missingTitleText}>Information Not Provided in Profile</Text>
                </View>
                <View style={styles.missingBadge}>
                  <Text style={styles.missingBadgeText}>
                    {missingItems.length} Missing {missingItems.length === 1 ? 'Field' : 'Fields'}
                  </Text>
                </View>
              </View>

              {/* Inner Amber Callout Box */}
              <View style={styles.amberCalloutBox}>
                <Text style={styles.amberCalloutSubhead}>
                  The following candidate profile details are currently empty or not configured:
                </Text>
                <View style={styles.amberBulletsList}>
                  {missingItems.map((item, idx) => (
                    <Text key={idx} style={styles.amberBulletItem}>
                      • {item.detail}
                    </Text>
                  ))}
                </View>
              </View>

              <Text style={styles.missingFooterNote}>
                You can still submit your application now or edit your candidate profile first.
              </Text>

              {/* Update Profile Action CTA */}
              <TouchableOpacity
                activeOpacity={0.8}
                style={styles.updateProfileBtn}
                onPress={handleNavigateToMissingStep}
              >
                <Pencil size={15} color="#2563EB" />
                <Text style={styles.updateProfileBtnText}>Update Profile Details</Text>
              </TouchableOpacity>
            </View>
          </>
        )}
      </ScrollView>

      {/* 4. FIXED BOTTOM SUBMIT FOOTER */}
      <View style={[styles.bottomFooterBar, { paddingBottom: Math.max(insets.bottom, 12) }]}>
        <TouchableOpacity
          activeOpacity={0.85}
          style={[styles.submitButton, submitting && styles.submitButtonDisabled]}
          onPress={handleApplySubmit}
          disabled={submitting}
        >
          {submitting ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <>
              <Send size={18} color="#FFFFFF" />
              <Text style={styles.submitButtonText}>Submit Application</Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  errorBox: {
    padding: 24,
    alignItems: 'center',
  },
  errorText: {
    fontSize: 14,
    color: '#DC2626',
  },

  /* 1. TOP JOB DETAILS CARD */
  jobCardContainer: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 0,
    overflow: 'hidden',
    marginBottom: 16,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  },
  jobBannerHeader: {
    backgroundColor: '#2563EB',
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  jobBannerTextWrap: {
    flex: 1,
  },
  companyNameText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#93C5FD',
  },
  jobTitleText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#FFFFFF',
    marginTop: 2,
    lineHeight: 22,
  },
  jobBannerBody: {
    padding: 14,
    backgroundColor: '#FFFFFF',
    gap: 10,
  },
  jobMetaRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 6,
  },
  jobMetaLocationText: {
    flex: 1,
    fontSize: 12.5,
    fontWeight: '600',
    color: '#475569',
    lineHeight: 18,
  },
  jobStatsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginTop: 2,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  statItemText: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#334155',
  },

  /* 2. CANDIDATE PROFILE CARD */
  profileCardContainer: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 0,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  },
  profileCardTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 14,
  },
  profileCardTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
  },
  fieldBlocksList: {
    gap: 10,
  },
  fieldBlock: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#F1F5F9',
    borderRadius: 0,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  fieldBlockLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: '#64748B',
    letterSpacing: 0.5,
  },
  fieldBlockValue: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
    marginTop: 3,
  },

  /* RESUME GREEN BOX */
  resumeGreenBox: {
    backgroundColor: '#F0FDF4',
    borderWidth: 1,
    borderColor: '#DCFCE7',
    borderRadius: 0,
    padding: 12,
    marginTop: 4,
    gap: 4,
  },
  resumeGreenHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  resumeFileNameText: {
    flex: 1,
    fontSize: 13,
    fontWeight: '800',
    color: '#15803D',
  },
  resumeSubtext: {
    fontSize: 11.5,
    color: '#16A34A',
    lineHeight: 16,
    marginLeft: 26,
  },

  /* SECTION SEPARATOR */
  sectionSeparator: {
    height: 1,
    backgroundColor: '#94A3B8',
    marginVertical: 12,
  },

  /* 3. MISSING INFORMATION CARD */
  missingCardContainer: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 0,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
    gap: 12,
  },
  missingHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  missingTitleLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  missingTitleText: {
    fontSize: 14.5,
    fontWeight: '800',
    color: '#0F172A',
    flex: 1,
  },
  missingBadge: {
    backgroundColor: '#FEF3C7',
    borderWidth: 1,
    borderColor: '#FDE68A',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 0,
  },
  missingBadgeText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#B45309',
  },
  amberCalloutBox: {
    backgroundColor: '#FFFBEB',
    borderWidth: 1,
    borderColor: '#FDE68A',
    borderRadius: 0,
    padding: 12,
    gap: 6,
  },
  amberCalloutSubhead: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#92400E',
    lineHeight: 18,
  },
  amberBulletsList: {
    gap: 4,
    marginTop: 2,
  },
  amberBulletItem: {
    fontSize: 12,
    fontWeight: '600',
    color: '#B45309',
    lineHeight: 16,
  },
  missingFooterNote: {
    fontSize: 12,
    color: '#64748B',
    lineHeight: 17,
  },
  updateProfileBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#2563EB',
    borderRadius: 0,
    paddingVertical: 10,
    marginTop: 4,
  },
  updateProfileBtnText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#2563EB',
  },

  /* 4. FIXED BOTTOM SUBMIT FOOTER */
  bottomFooterBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    paddingHorizontal: 16,
    paddingTop: 12,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 8,
  },
  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#2563EB',
    borderRadius: 0,
    paddingVertical: 14,
  },
  submitButtonDisabled: {
    backgroundColor: '#93C5FD',
  },
  submitButtonText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#FFFFFF',
  },
});
