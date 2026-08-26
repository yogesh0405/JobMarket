import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
  StatusBar,
} from 'react-native';
import {
  ArrowLeft,
  MapPin,
  Briefcase,
  Clock,
  User,
  FileText,
  AlertTriangle,
  Pencil,
  Send,
  GraduationCap,
  CheckCircle2,
  Building2,
  Bus,
  Home,
  ShieldCheck,
  Check,
  XCircle,
} from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../context/ToastContext';
import { candidateApi } from '../../api/candidateApi';
import { COLORS, RADIUS } from '../../constants/theme';
import { CompanyLogoAvatar } from '../../components/common/CompanyLogoAvatar';
import { appliedJobsStore } from '../../utils/appliedJobsStore';
import { SuccessModal } from '../../components/common/SuccessModal';
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
  const onAppliedSuccess = route.params?.onAppliedSuccess as ((id: string) => void) | undefined;

  const [submitting, setSubmitting] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

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
  const nameVal = String(user?.name || (user as any)?.full_name || 'Workforce Applicant');
  const emailVal = user?.email ? String(user.email) : '';
  const phoneVal = user?.phone || (user as any)?.mobile || (user as any)?.phone_number ? String(user?.phone || (user as any)?.mobile || (user as any)?.phone_number) : '';
  const locationVal = user?.location || user?.address || (user as any)?.city ? String(user?.location || user?.address || (user as any)?.city) : '';
  const midcZoneVal = user?.midc_zone || user?.midcZone ? String(user?.midc_zone || user?.midcZone) : '';
  const tradeVal = user?.tradeSpecialization || (user as any)?.trade_specialization || user?.headline || (user as any)?.trade ? String(user?.tradeSpecialization || (user as any)?.trade_specialization || user?.headline || (user as any)?.trade) : '';
  const preferredShiftVal = user?.preferredShift || (user as any)?.preferred_shift ? String(user?.preferredShift || (user as any)?.preferred_shift) : '';
  const noticePeriodVal = user?.notice_period || (user as any)?.noticePeriod ? String(user?.notice_period || (user as any)?.noticePeriod) : '';
  const requiresBus = user?.requiresBus ?? (user as any)?.requires_bus;
  const requiresAccommodation = user?.requiresAccommodation ?? (user as any)?.requires_accommodation;
  const aadhaarVerified = Boolean(user?.aadhaarVerified ?? (user as any)?.aadhaar_verified);

  // Safe Education Parser & Text Formatter (prevents React child object errors)
  const formatEducationVal = (): string | null => {
    const rawEdu = user?.education || (user as any)?.highest_education || (user as any)?.qualification;
    if (!rawEdu) return null;

    const formatSingleEduObj = (item: any): string | null => {
      if (!item) return null;
      if (typeof item === 'string') {
        const trimmed = item.trim();
        if (trimmed.startsWith('{') || trimmed.startsWith('[')) {
          try {
            return formatSingleEduObj(JSON.parse(trimmed));
          } catch (_) {
            return trimmed;
          }
        }
        return trimmed || null;
      }
      if (Array.isArray(item)) {
        const list = item.map(formatSingleEduObj).filter(Boolean);
        return list.length > 0 ? list.join(' • ') : null;
      }
      if (typeof item === 'object') {
        const degree = item.degree || item.qualification || item.title || item.course || item.name;
        const institution = item.institution || item.college || item.university || item.school;
        const year = item.year || item.passingYear || item.passing_year || item.duration;

        const parts: string[] = [];
        if (degree) parts.push(String(degree).trim());
        if (institution) parts.push(String(institution).trim());
        if (year) parts.push(`(${String(year).trim()})`);

        return parts.length > 0 ? parts.join(' - ') : null;
      }
      return String(item);
    };

    return formatSingleEduObj(rawEdu);
  };

  const educationVal = formatEducationVal();
  
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
    ? user.skills.map((s: any) => typeof s === 'object' ? (s.name || s.skill || JSON.stringify(s)) : String(s)).filter(Boolean)
    : typeof user?.skills === 'string'
    ? (user.skills as string).split(',').map((s) => s.trim()).filter(Boolean)
    : [];

  // Missing Info Items
  const missingItems: { label: string; detail: string; step: number }[] = [];
  if (!phoneVal) missingItems.push({ label: 'Phone Contact', detail: 'Phone contact number missing', step: 1 });
  if (!locationVal) missingItems.push({ label: 'Location / City', detail: 'Current location / city not specified', step: 1 });
  if (!tradeVal) missingItems.push({ label: 'Primary Trade', detail: 'Primary trade specialization not configured', step: 1 });
  if (!educationVal) missingItems.push({ label: 'Education', detail: 'Education qualification not provided', step: 2 });
  if (!expVal && expList.length === 0) missingItems.push({ label: 'Work Experience', detail: 'Work experience history not added', step: 3 });
  if (skillsList.length === 0) missingItems.push({ label: 'Technical Skills', detail: 'No technical skills added (minimum 5 recommended)', step: 4 });
  else if (skillsList.length < 5) missingItems.push({ label: 'Technical Skills', detail: `Only ${skillsList.length}/5 recommended technical skills added`, step: 4 });
  if (!hasResume) missingItems.push({ label: 'Resume Document', detail: 'Resume document not uploaded', step: 4 });

  const getTargetStepForMissingInfo = () => {
    if (missingItems.length > 0) {
      return missingItems[0].step;
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

  // Handle Application Submit (Matching Web App instant optimistic UX)
  const handleApplySubmit = () => {
    if (!job?.id) {
      showToast('Invalid job details', 'error');
      return;
    }

    setSubmitting(true);

    // 1. Instantly record application in local & persistent store
    appliedJobsStore.addAppliedJob(job);

    // 2. Invoke callback to update Job Detail state immediately
    if (typeof onAppliedSuccess === 'function') {
      onAppliedSuccess(job.id);
    }

    // 3. Dispatch backend API call concurrently
    const resumeUrl = getResumeInfo(user)?.url || undefined;
    candidateApi.applyForJob(job.id, { resumeUrl }).catch((err) => {
      console.warn('Background application API sync note:', err);
    });

    // 4. Brief tactile delay for smooth feedback, then open SuccessModal
    setTimeout(() => {
      setSubmitting(false);
      setShowSuccessModal(true);
    }, 250);
  };

  const topInset = Math.max(insets.top || 0, Platform.OS === 'android' ? (StatusBar.currentHeight || 24) : 0);

  if (!job) {
    return (
      <View style={styles.container}>
        <View style={[styles.topNavBar, { paddingTop: topInset + (Platform.OS === 'android' ? 6 : 4) }]}>
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => navigation.goBack()}
            style={styles.backIconButton}
          >
            <ArrowLeft size={22} color="#0F172A" strokeWidth={2.2} />
          </TouchableOpacity>
          <View style={styles.topNavTitleBlock}>
            <Text style={styles.topNavTitleText}>Candidate Details</Text>
          </View>
        </View>
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
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* Clean Top Navigation Bar with Back Button on Left of Candidate Details */}
      <View style={[styles.topNavBar, { paddingTop: topInset + (Platform.OS === 'android' ? 6 : 4) }]}>
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => navigation.goBack()}
          style={styles.backIconButton}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
        >
          <ArrowLeft size={22} color="#0F172A" strokeWidth={2.2} />
        </TouchableOpacity>

        <View style={styles.topNavTitleBlock}>
          <Text style={styles.topNavTitleText}>Candidate Details</Text>
          <Text style={styles.topNavSubtitleText} numberOfLines={1}>
            Applying for {job.title || 'Job Opening'}
          </Text>
        </View>
      </View>

      <ScrollView
        style={styles.scrollContainer}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: 110 + insets.bottom }]}
        showsVerticalScrollIndicator={false}
      >
        {/* CANDIDATE PROFILE CARD (Comprehensive Profile Fields) */}
        <View style={styles.profileCardContainer}>
          {/* Card Header */}
          <View style={styles.profileCardTitleRow}>
            <User size={18} color={COLORS.primary} />
            <Text style={styles.profileCardTitle}>Candidate Profile Details</Text>
          </View>

          <View style={styles.fieldBlocksList}>
            {/* 1. Full Name */}
            <View style={styles.fieldBlock}>
              <Text style={styles.fieldBlockLabel}>FULL NAME</Text>
              <Text style={styles.fieldBlockValue}>{nameVal}</Text>
            </View>

            {/* 2. Email Address */}
            <View style={styles.fieldBlock}>
              <Text style={styles.fieldBlockLabel}>EMAIL ADDRESS</Text>
              <Text style={styles.fieldBlockValue}>{emailVal || 'Not provided'}</Text>
            </View>

            {/* 3. Phone Contact */}
            <View style={styles.fieldBlock}>
              <View style={styles.fieldBlockHeaderRow}>
                <Text style={styles.fieldBlockLabel}>PHONE CONTACT</Text>
                {!phoneVal ? (
                  <Text style={styles.missingInlineText}>• Not Provided</Text>
                ) : null}
              </View>
              <Text style={[styles.fieldBlockValue, !phoneVal && styles.fieldBlockValueMissing]}>
                {phoneVal || 'Not provided'}
              </Text>
            </View>

            {/* 4. Location / City & MIDC Zone */}
            <View style={styles.fieldBlock}>
              <View style={styles.fieldBlockHeaderRow}>
                <Text style={styles.fieldBlockLabel}>LOCATION / MIDC ZONE</Text>
                {!locationVal && !midcZoneVal ? (
                  <Text style={styles.missingInlineText}>• Not Specified</Text>
                ) : null}
              </View>
              <Text style={[styles.fieldBlockValue, !locationVal && !midcZoneVal && styles.fieldBlockValueMissing]}>
                {[locationVal, midcZoneVal].filter(Boolean).join(', ') || 'Not specified'}
              </Text>
            </View>

            {/* 5. Primary Trade / Specialization */}
            <View style={styles.fieldBlock}>
              <View style={styles.fieldBlockHeaderRow}>
                <Text style={styles.fieldBlockLabel}>PRIMARY TRADE</Text>
                {!tradeVal ? (
                  <Text style={styles.missingInlineText}>• Not Configured</Text>
                ) : null}
              </View>
              <Text style={[styles.fieldBlockValue, !tradeVal && styles.fieldBlockValueMissing]}>
                {tradeVal || 'Not configured'}
              </Text>
            </View>

            {/* 6. Work Experience */}
            <View style={styles.fieldBlock}>
              <View style={styles.fieldBlockHeaderRow}>
                <Text style={styles.fieldBlockLabel}>TOTAL WORK EXPERIENCE</Text>
                {!expVal && expList.length === 0 ? (
                  <Text style={styles.missingInlineText}>• Not Added</Text>
                ) : null}
              </View>
              <Text style={[styles.fieldBlockValue, !expVal && expList.length === 0 && styles.fieldBlockValueMissing]}>
                {expVal || 'No work experience records added'}
              </Text>
            </View>

            {/* 7. Highest Education */}
            <View style={styles.fieldBlock}>
              <View style={styles.fieldBlockHeaderRow}>
                <Text style={styles.fieldBlockLabel}>HIGHEST EDUCATION</Text>
                {!educationVal ? (
                  <Text style={styles.missingInlineText}>• Not Specified</Text>
                ) : null}
              </View>
              <Text style={[styles.fieldBlockValue, !educationVal && styles.fieldBlockValueMissing]}>
                {educationVal || 'Not specified'}
              </Text>
            </View>

            {/* 8. Technical Skills (Clean text list format) */}
            <View style={styles.fieldBlock}>
              <View style={styles.fieldBlockHeaderRow}>
                <Text style={styles.fieldBlockLabel}>TECHNICAL SKILLS</Text>
                {skillsList.length < 5 ? (
                  <Text style={styles.missingInlineText}>
                    {skillsList.length === 0 ? '• Not Added' : `• ${skillsList.length}/5 Recommended`}
                  </Text>
                ) : null}
              </View>
              <Text style={[styles.fieldBlockValue, skillsList.length === 0 && styles.fieldBlockValueMissing]}>
                {skillsList.length > 0 ? skillsList.join('  •  ') : 'No technical skills added'}
              </Text>
            </View>

            {/* 9. Preferred Shift & Notice Period */}
            <View style={styles.fieldRow2Col}>
              <View style={[styles.fieldBlock, { flex: 1 }]}>
                <Text style={styles.fieldBlockLabel}>PREFERRED SHIFT</Text>
                <Text style={styles.fieldBlockValue}>{preferredShiftVal || 'Flexible / Any'}</Text>
              </View>
              <View style={[styles.fieldBlock, { flex: 1 }]}>
                <Text style={styles.fieldBlockLabel}>NOTICE PERIOD</Text>
                <Text style={styles.fieldBlockValue}>{noticePeriodVal || 'Immediate'}</Text>
              </View>
            </View>

            {/* 10. Transport & Accommodation Facilities */}
            <View style={styles.fieldRow2Col}>
              <View style={[styles.fieldBlock, { flex: 1 }]}>
                <Text style={styles.fieldBlockLabel}>BUS / TRANSPORT</Text>
                <Text style={styles.fieldBlockValue}>
                  {requiresBus !== undefined ? (requiresBus ? 'Required' : 'Self Transport') : 'Not specified'}
                </Text>
              </View>
              <View style={[styles.fieldBlock, { flex: 1 }]}>
                <Text style={styles.fieldBlockLabel}>ACCOMMODATION</Text>
                <Text style={styles.fieldBlockValue}>
                  {requiresAccommodation !== undefined ? (requiresAccommodation ? 'Required' : 'Own Arrangement') : 'Not specified'}
                </Text>
              </View>
            </View>

            {/* 11. Identity Verification */}
            <View style={styles.fieldBlock}>
              <Text style={styles.fieldBlockLabel}>IDENTITY VERIFICATION</Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 4 }}>
                {aadhaarVerified ? (
                  <>
                    <ShieldCheck size={16} color="#16A34A" />
                    <Text style={{ fontSize: 13.5, fontWeight: '700', color: '#16A34A' }}>Aadhaar Verified</Text>
                  </>
                ) : (
                  <>
                    <Clock size={15} color="#D97706" />
                    <Text style={{ fontSize: 13.5, fontWeight: '700', color: '#D97706' }}>Pending Identity Verification</Text>
                  </>
                )}
              </View>
            </View>

            {/* 12. Attached Resume Document (Clean White Section) */}
            <View style={styles.resumeWhiteBox}>
              {hasResume ? (
                <>
                  <View style={styles.resumeWhiteHeader}>
                    <FileText size={18} color={COLORS.primary} />
                    <Text style={styles.resumeFileNameText} numberOfLines={1}>
                      {resumeFileName}
                    </Text>
                    <Text style={styles.resumeStatusText}>Attached</Text>
                  </View>
                  <Text style={styles.resumeSubtext}>
                    This document will be automatically transmitted to the recruiter
                  </Text>
                </>
              ) : (
                <>
                  <View style={styles.resumeWhiteHeader}>
                    <AlertTriangle size={18} color="#D97706" />
                    <Text style={styles.resumeMissingFileNameText}>
                      No Resume Uploaded
                    </Text>
                  </View>
                  <Text style={styles.resumeMissingSubtext}>
                    Recruiters prefer applications with an attached resume document.
                  </Text>
                </>
              )}
            </View>
          </View>
        </View>

        {/* 3. MISSING INFORMATION CARD (Only shown if missing fields exist - Pure White Clean Section) */}
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
                <Text style={styles.missingCountText}>
                  {missingItems.length} Missing {missingItems.length === 1 ? 'Field' : 'Fields'}
                </Text>
              </View>

              {/* Inner White Box */}
              <View style={styles.whiteCalloutBox}>
                <Text style={styles.whiteCalloutSubhead}>
                  The following candidate profile details are currently empty:
                </Text>
                <View style={styles.bulletsList}>
                  {missingItems.map((item, idx) => (
                    <Text key={idx} style={styles.bulletItem}>
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
                <Pencil size={15} color={COLORS.primary} />
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

      {/* Success Modal */}
      <SuccessModal
        visible={showSuccessModal}
        title="Application Submitted Successfully !"
        message={`Your application for "${job?.title || 'Industrial Position'}" has been sent to the recruiter.`}
        buttonText="View Applied Jobs"
        onClose={() => {
          setShowSuccessModal(false);
          navigation.goBack();
        }}
        onButtonPress={() => {
          setShowSuccessModal(false);
          navigation.navigate('CandidateMain', { screen: 'CandidateAppliedTab' });
        }}
      />
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

  /* TOP NAVIGATION BAR */
  topNavBar: {
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    gap: 12,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 2,
    zIndex: 10,
  },
  backIconButton: {
    padding: 6,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: -4,
  },
  topNavTitleBlock: {
    flex: 1,
    minWidth: 0,
  },
  topNavTitleText: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: -0.3,
  },
  topNavSubtitleText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#64748B',
    marginTop: 1,
  },

  /* 2. CANDIDATE PROFILE CARD */
  profileCardContainer: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: RADIUS.card,
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
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: RADIUS.card,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  fieldBlockHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 2,
  },
  fieldBlockLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: '#64748B',
    letterSpacing: 0.5,
  },
  fieldBlockValue: {
    fontSize: 13.5,
    fontWeight: '700',
    color: '#0F172A',
    marginTop: 2,
  },
  fieldBlockValueMissing: {
    color: '#D97706',
    fontStyle: 'italic',
    fontWeight: '600',
  },
  missingInlineText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#D97706',
  },
  fieldRow2Col: {
    flexDirection: 'row',
    gap: 10,
  },

  /* RESUME WHITE BOX */
  resumeWhiteBox: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: RADIUS.card,
    padding: 12,
    marginTop: 4,
    gap: 4,
  },
  resumeWhiteHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  resumeFileNameText: {
    flex: 1,
    fontSize: 13,
    fontWeight: '800',
    color: '#0F172A',
  },
  resumeStatusText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#16A34A',
  },
  resumeSubtext: {
    fontSize: 11.5,
    color: '#64748B',
    lineHeight: 16,
    marginLeft: 26,
  },
  resumeMissingFileNameText: {
    flex: 1,
    fontSize: 13,
    fontWeight: '800',
    color: '#D97706',
  },
  resumeMissingSubtext: {
    fontSize: 11.5,
    color: '#64748B',
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
    borderRadius: RADIUS.card,
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
  missingCountText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#D97706',
  },
  whiteCalloutBox: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: RADIUS.card,
    padding: 12,
    gap: 6,
  },
  whiteCalloutSubhead: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#0F172A',
    lineHeight: 18,
  },
  bulletsList: {
    gap: 4,
    marginTop: 2,
  },
  bulletItem: {
    fontSize: 12,
    fontWeight: '600',
    color: '#D97706',
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
    borderColor: COLORS.primary,
    borderRadius: RADIUS.card,
    paddingVertical: 10,
    marginTop: 4,
  },
  updateProfileBtnText: {
    fontSize: 13,
    fontWeight: '800',
    color: COLORS.primary,
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
    backgroundColor: COLORS.primary,
    borderRadius: RADIUS.card,
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
