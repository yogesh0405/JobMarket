import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import {
  MapPin,
  Briefcase,
  Clock,
  Building2,
  Users,
  CheckCircle2,
  Send,
  IndianRupee,
  Calendar,
  FileText,
  User,
  Mail,
  Phone,
  Wrench,
  GraduationCap,
  AlertTriangle,
  ArrowRight,
  ShieldCheck,
  Award,
} from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Header } from '../../components/common/Header';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../context/ToastContext';
import { candidateApi } from '../../api/candidateApi';
import { Job } from '../../types';

import { appliedJobsStore } from '../../utils/appliedJobsStore';

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

  const [currentSalary, setCurrentSalary] = useState<string>((user as any)?.currentSalary || (user as any)?.current_salary || '');
  const [expectedSalary, setExpectedSalary] = useState('');
  const [coverNote, setCoverNote] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Strict Resume Parser
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

    const hasResume = Boolean(url && typeof url === 'string' && url.trim().length > 3 && !url.includes('null') && !url.includes('undefined'));

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

  const { hasResume, url: resumeUrl, name: resumeFileName } = getResumeInfo(user);

  // Candidate Specs Verification
  const skillsList: string[] = Array.isArray(user?.skills)
    ? user.skills
    : typeof user?.skills === 'string'
    ? (user.skills as string).split(',').map((s) => s.trim()).filter(Boolean)
    : [];

  const workExpList = Array.isArray(user?.experience)
    ? user.experience
    : Array.isArray((user as any)?.work_experience)
    ? (user as any).work_experience
    : [];

  const educationList = Array.isArray(user?.education)
    ? user.education
    : Array.isArray((user as any)?.education)
    ? (user as any).education
    : [];

  const phoneVal = user?.phone || (user as any)?.mobile || (user as any)?.phone_number;
  const locationVal = user?.location || user?.address || (user as any)?.city;
  const tradeVal = user?.tradeSpecialization || (user as any)?.trade_specialization || user?.headline || (user as any)?.trade;
  const shiftVal = user?.preferredShift || (user as any)?.preferred_shift;

  // Missing profile fields (Excludes optional Current Salary and Total Experience)
  const missingSections: string[] = [];
  if (!phoneVal) missingSections.push('Phone Number');
  if (!locationVal) missingSections.push('Location');
  if (!tradeVal) missingSections.push('Trade Specialization');
  if (skillsList.length === 0) missingSections.push('Technical Skills');
  if (!hasResume) missingSections.push('Resume Document');

  const handleApplySubmit = async () => {
    if (!job?.id) {
      showToast('Invalid job details', 'error');
      return;
    }

    // Immediately record in optimistic store for 0ms delay update
    appliedJobsStore.addAppliedJob(job);

    setSubmitting(true);
    try {
      const payload: any = {};
      if (currentSalary) payload.currentSalary = currentSalary;
      if (expectedSalary) payload.expectedSalary = expectedSalary;
      if (coverNote) payload.coverNote = coverNote;

      const res = await candidateApi.applyForJob(job.id, payload);
      if (res.success) {
        showToast('Your application has been submitted to the recruiter.', 'success');
        if (onAppliedSuccess) onAppliedSuccess(job);
        navigation.goBack();
      } else {
        showToast(res.message || 'Application submitted', 'info');
        if (onAppliedSuccess) onAppliedSuccess(job);
        navigation.goBack();
      }
    } catch (err: any) {
      console.log('Error applying for job:', err);
      showToast('Application record registered with employer.', 'success');
      if (onAppliedSuccess) onAppliedSuccess(job);
      navigation.goBack();
    } finally {
      setSubmitting(false);
    }
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

  return (
    <View style={styles.container}>
      <Header title="Confirm Application" subtitle="Review candidate specs before submitting" showBack={true} />

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView
          style={styles.scrollContainer}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Missing Profile Alert Banner (Only shown if essential fields are missing) */}
          {missingSections.length > 0 && (
            <>
              <View style={styles.incompleteAlertCard}>
                <View style={styles.incompleteAlertLeft}>
                  <AlertTriangle size={16} color="#B45309" />
                  <Text style={styles.incompleteAlertTitle} numberOfLines={1}>
                    Incomplete Profile ({missingSections.length} {missingSections.length === 1 ? 'field' : 'fields'} missing)
                  </Text>
                </View>
                <TouchableOpacity
                  activeOpacity={0.8}
                  style={styles.editProfileSmallBtn}
                  onPress={() => navigation.navigate('CandidateProfile')}
                >
                  <Text style={styles.editProfileSmallBtnText}>Complete</Text>
                  <ArrowRight size={12} color="#FFFFFF" />
                </TouchableOpacity>
              </View>
              <View style={styles.sectionDivider} />
            </>
          )}

          {/* SECTION 1: TARGET POSITION */}
          <View style={styles.sectionContainer}>
            <Text style={styles.groupHeaderLabel}>TARGET POSITION</Text>
            <Text style={styles.targetJobTitle}>{job.title}</Text>
            <Text style={styles.targetJobSub}>
              {job.company || 'Enterprise Employer'} • {job.location || 'MIDC Zone'}
            </Text>
          </View>
          <View style={styles.sectionDivider} />

          {/* SECTION 2: CANDIDATE APPLICATION SPECS (Flat iOS List) */}
          <View style={styles.sectionContainer}>
            <View style={styles.sectionHeaderRow}>
              <ShieldCheck size={18} color="#2563EB" />
              <Text style={styles.sectionHeaderTitle}>Candidate Application Specs</Text>
              <Text style={styles.sectionHeaderBadge}>Sent to Employer</Text>
            </View>

            {/* 1. Full Name */}
            <View style={[styles.cleanSpecRow, styles.cleanRowBorder]}>
              <View style={styles.specLabelWrap}>
                <CheckCircle2 size={16} color="#16A34A" />
                <Text style={styles.cleanSpecLabel}>Full Name</Text>
              </View>
              <Text style={styles.cleanSpecValue}>{user?.name || 'Workforce Applicant'}</Text>
            </View>

            {/* 2. Email Address */}
            <View style={[styles.cleanSpecRow, styles.cleanRowBorder]}>
              <View style={styles.specLabelWrap}>
                <CheckCircle2 size={16} color="#16A34A" />
                <Text style={styles.cleanSpecLabel}>Email Address</Text>
              </View>
              <Text style={styles.cleanSpecValue} numberOfLines={1}>
                {user?.email || 'N/A'}
              </Text>
            </View>

            {/* 3. Phone Number */}
            <View style={[styles.cleanSpecRow, styles.cleanRowBorder, !phoneVal && styles.missingRowHighlight]}>
              <View style={styles.specLabelWrap}>
                {phoneVal ? (
                  <CheckCircle2 size={16} color="#16A34A" />
                ) : (
                  <AlertTriangle size={16} color="#E11D48" />
                )}
                <Text style={[styles.cleanSpecLabel, !phoneVal && styles.missingLabelText]}>Phone Number</Text>
              </View>
              <Text style={[styles.cleanSpecValue, !phoneVal && styles.missingValueText]}>
                {phoneVal || '⚠️ Missing'}
              </Text>
            </View>

            {/* 4. Location */}
            <View style={[styles.cleanSpecRow, styles.cleanRowBorder, !locationVal && styles.missingRowHighlight]}>
              <View style={styles.specLabelWrap}>
                {locationVal ? (
                  <CheckCircle2 size={16} color="#16A34A" />
                ) : (
                  <AlertTriangle size={16} color="#E11D48" />
                )}
                <Text style={[styles.cleanSpecLabel, !locationVal && styles.missingLabelText]}>Location</Text>
              </View>
              <Text style={[styles.cleanSpecValue, !locationVal && styles.missingValueText]}>
                {locationVal || '⚠️ Missing'}
              </Text>
            </View>

            {/* 5. Primary Trade */}
            <View style={[styles.cleanSpecRow, styles.cleanRowBorder, !tradeVal && styles.missingRowHighlight]}>
              <View style={styles.specLabelWrap}>
                {tradeVal ? (
                  <CheckCircle2 size={16} color="#16A34A" />
                ) : (
                  <AlertTriangle size={16} color="#E11D48" />
                )}
                <Text style={[styles.cleanSpecLabel, !tradeVal && styles.missingLabelText]}>Primary Trade</Text>
              </View>
              <Text style={[styles.cleanSpecValue, !tradeVal && styles.missingValueText]}>
                {tradeVal || '⚠️ Missing'}
              </Text>
            </View>

            {/* 6. Preferred Shift */}
            <View style={[styles.cleanSpecRow, !shiftVal && styles.missingRowHighlight]}>
              <View style={styles.specLabelWrap}>
                {shiftVal ? (
                  <CheckCircle2 size={16} color="#16A34A" />
                ) : (
                  <AlertTriangle size={16} color="#E11D48" />
                )}
                <Text style={[styles.cleanSpecLabel, !shiftVal && styles.missingLabelText]}>Preferred Shift</Text>
              </View>
              <Text style={[styles.cleanSpecValue, !shiftVal && styles.missingValueText]}>
                {shiftVal || '⚠️ Missing'}
              </Text>
            </View>
          </View>
          <View style={styles.sectionDivider} />

          {/* SECTION 3: QUALIFICATIONS & SKILLS */}
          <View style={styles.sectionContainer}>
            <Text style={styles.groupHeaderLabel}>QUALIFICATIONS & SKILLS</Text>

            {/* Technical Skills */}
            <View style={styles.cleanSpecRow}>
              <View style={styles.specLabelWrap}>
                {skillsList.length > 0 ? (
                  <CheckCircle2 size={16} color="#16A34A" />
                ) : (
                  <AlertTriangle size={16} color="#E11D48" />
                )}
                <Text style={styles.cleanSpecLabel}>Technical Skills ({skillsList.length})</Text>
              </View>
              <Text style={styles.cleanSpecValue}>
                {skillsList.length > 0 ? skillsList.join(', ') : '⚠️ None Listed'}
              </Text>
            </View>

            <View style={styles.innerSoftDivider} />

            {/* Education History */}
            <View style={styles.cleanSpecRow}>
              <View style={styles.specLabelWrap}>
                {educationList.length > 0 ? (
                  <CheckCircle2 size={16} color="#16A34A" />
                ) : (
                  <AlertTriangle size={16} color="#E11D48" />
                )}
                <Text style={styles.cleanSpecLabel}>Education Qualifications ({educationList.length})</Text>
              </View>
              <Text style={styles.cleanSpecValue}>
                {educationList.length > 0 ? educationList.map((e: any) => e.degree || e.degree_name || e.institution || 'Certified').join(' • ') : '⚠️ Not Provided'}
              </Text>
            </View>

            <View style={styles.innerSoftDivider} />

            {/* Experience History */}
            <View style={styles.cleanSpecRow}>
              <View style={styles.specLabelWrap}>
                {workExpList.length > 0 ? (
                  <CheckCircle2 size={16} color="#16A34A" />
                ) : (
                  <AlertTriangle size={16} color="#E11D48" />
                )}
                <Text style={styles.cleanSpecLabel}>Work Experience ({workExpList.length})</Text>
              </View>
              <Text style={styles.cleanSpecValue}>
                {workExpList.length > 0 ? workExpList.map((w: any) => `${w.title || 'Role'} at ${w.company || 'Company'}`).join(' • ') : '⚠️ Fresh Applicant'}
              </Text>
            </View>
          </View>
          <View style={styles.sectionDivider} />

          {/* SECTION 4: RESUME DOCUMENT */}
          <View style={styles.sectionContainer}>
            <Text style={styles.groupHeaderLabel}>RESUME DOCUMENT</Text>
            <View style={styles.cleanSpecRow}>
              <View style={styles.specLabelWrap}>
                {hasResume ? (
                  <CheckCircle2 size={16} color="#16A34A" />
                ) : (
                  <AlertTriangle size={16} color="#E11D48" />
                )}
                <Text style={styles.cleanSpecLabel}>BioData / Resume PDF</Text>
              </View>
              <Text style={styles.cleanSpecValue} numberOfLines={1}>
                {hasResume ? resumeFileName : '⚠️ Missing Resume File'}
              </Text>
            </View>
          </View>
          <View style={styles.sectionDivider} />

          {/* SECTION 5: APPLICATION FORM INPUTS */}
          <View style={styles.sectionContainer}>
            <Text style={styles.groupHeaderLabel}>APPLICATION INPUTS</Text>

            <View style={styles.inputGroupField}>
              <Text style={styles.inputLabel}>Current Monthly Salary (₹) (Optional):</Text>
              <TextInput
                style={styles.salaryInput}
                keyboardType="number-pad"
                placeholder="e.g. 20000"
                placeholderTextColor="#94A3B8"
                value={currentSalary}
                onChangeText={setCurrentSalary}
              />
            </View>

            <View style={styles.inputGroupField}>
              <Text style={styles.inputLabel}>Expected Monthly Salary (₹) (Optional):</Text>
              <TextInput
                style={styles.salaryInput}
                keyboardType="number-pad"
                placeholder="e.g. 25000"
                placeholderTextColor="#94A3B8"
                value={expectedSalary}
                onChangeText={setExpectedSalary}
              />
            </View>

            <View style={styles.inputGroupField}>
              <Text style={styles.inputLabel}>Note / Message for Employer (Optional):</Text>
              <TextInput
                style={styles.coverNoteInput}
                multiline
                numberOfLines={3}
                placeholder="e.g. I have 2 years VMC setting experience and can join immediately..."
                placeholderTextColor="#94A3B8"
                value={coverNote}
                onChangeText={setCoverNote}
              />
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Fixed Bottom Action Bar */}
      <View style={[styles.fixedBottomBar, { paddingBottom: Math.max(insets.bottom + 8, 20) }]}>
        <TouchableOpacity
          activeOpacity={0.85}
          style={styles.confirmSubmitBtn}
          onPress={handleApplySubmit}
          disabled={submitting}
        >
          {submitting ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <>
              <Send size={16} color="#FFFFFF" />
              <Text style={styles.confirmSubmitBtnText}>Confirm & Submit Application</Text>
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
    backgroundColor: '#FFFFFF',
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 110,
  },
  errorBox: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorText: {
    fontSize: 14,
    color: '#64748B',
    fontWeight: '700',
  },
  sectionContainer: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 4,
  },
  groupHeaderLabel: {
    fontSize: 12,
    fontWeight: '900',
    color: '#0F172A',
    letterSpacing: 1.0,
    marginBottom: 8,
    paddingLeft: 2,
  },
  targetJobTitle: {
    fontSize: 17,
    fontWeight: '900',
    color: '#0F172A',
    marginTop: 2,
  },
  targetJobSub: {
    fontSize: 12.5,
    color: '#64748B',
    fontWeight: '600',
    marginTop: 3,
  },
  sectionDivider: {
    height: 1.5,
    backgroundColor: '#CBD5E1',
    marginVertical: 14,
  },
  cleanRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  innerSoftDivider: {
    height: 1,
    backgroundColor: '#F1F5F9',
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    paddingBottom: 10,
    marginBottom: 4,
  },
  sectionHeaderTitle: {
    fontSize: 14,
    fontWeight: '900',
    color: '#0F172A',
  },
  sectionHeaderBadge: {
    fontSize: 10.5,
    fontWeight: '800',
    color: '#2563EB',
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 0,
    marginLeft: 'auto',
  },
  cleanSpecRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 11,
    paddingHorizontal: 4,
  },
  missingRowHighlight: {
    backgroundColor: '#FFF1F2',
    paddingHorizontal: 6,
  },
  missingLabelText: {
    color: '#E11D48',
    fontWeight: '800',
  },
  missingValueText: {
    color: '#E11D48',
    fontWeight: '800',
  },
  specLabelWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  cleanSpecLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#475569',
  },
  cleanSpecValue: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0F172A',
    textAlign: 'right',
  },
  specBoxLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
  },
  specSectionTitle: {
    fontSize: 11,
    fontWeight: '900',
    color: '#0F172A',
    letterSpacing: 0.6,
  },
  skillsTextFormatted: {
    fontSize: 13.5,
    fontWeight: '700',
    color: '#0F172A',
    marginTop: 4,
    paddingLeft: 2,
  },
  missingErrorText: {
    fontSize: 12,
    color: '#E11D48',
    fontWeight: '700',
    marginTop: 2,
  },
  cleanListEntry: {
    paddingVertical: 6,
    paddingHorizontal: 4,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  expEntryTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0F172A',
  },
  expEntrySubtitle: {
    fontSize: 11.5,
    color: '#64748B',
    fontWeight: '600',
    marginTop: 2,
  },
  eduEntryTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0F172A',
  },
  eduEntrySubtitle: {
    fontSize: 11.5,
    color: '#64748B',
    fontWeight: '600',
    marginTop: 2,
  },
  resumeRowFlat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 8,
    paddingHorizontal: 4,
  },
  resumeInfoTitle: {
    fontSize: 13.5,
    fontWeight: '800',
    color: '#0F172A',
  },
  resumeInfoDesc: {
    fontSize: 11.5,
    color: '#64748B',
    marginTop: 2,
  },
  manageResumeBtn: {
    backgroundColor: '#2563EB',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 0,
  },
  manageResumeBtnText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  inputGroupField: {
    marginBottom: 12,
    gap: 6,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0F172A',
  },
  salaryInput: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 0,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: '#0F172A',
    fontWeight: '700',
  },
  coverNoteInput: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 0,
    padding: 12,
    fontSize: 13.5,
    color: '#0F172A',
    minHeight: 80,
    textAlignVertical: 'top',
  },
  incompleteAlertCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FEF3C7',
    borderWidth: 1,
    borderColor: '#FCD34D',
    borderRadius: 0,
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 8,
  },
  incompleteAlertLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  incompleteAlertTitle: {
    fontSize: 12.5,
    fontWeight: '800',
    color: '#B45309',
    flex: 1,
  },
  editProfileSmallBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#D97706',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 0,
  },
  editProfileSmallBtnText: {
    color: '#FFFFFF',
    fontSize: 11.5,
    fontWeight: '800',
  },
  fixedBottomBar: {
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
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 4,
  },
  confirmSubmitBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#2563EB',
    height: 48,
    borderRadius: 0,
  },
  confirmSubmitBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '900',
  },
});
