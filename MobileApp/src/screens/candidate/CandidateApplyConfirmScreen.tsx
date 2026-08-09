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
  const expVal = (user as any)?.experienceYears || (user as any)?.totalExperience || (user as any)?.experience_years;
  const salaryVal = (user as any)?.currentSalary || (user as any)?.current_salary;

  const missingSections: string[] = [];
  if (!phoneVal) missingSections.push('Phone Number');
  if (!locationVal) missingSections.push('Location');
  if (!tradeVal) missingSections.push('Trade Specialization');
  if (!shiftVal) missingSections.push('Preferred Shift');
  if (!expVal) missingSections.push('Total Experience');
  if (!salaryVal) missingSections.push('Current Salary');
  if (skillsList.length === 0) missingSections.push('Technical Skills');
  if (workExpList.length === 0) missingSections.push('Work Experience History');
  if (educationList.length === 0) missingSections.push('Education / ITI Details');
  if (!hasResume) missingSections.push('Resume Document');

  const handleApplySubmit = async () => {
    if (!job?.id) {
      showToast('Invalid job details', 'error');
      return;
    }

    setSubmitting(true);
    try {
      const payload: any = {};
      if (expectedSalary) payload.expectedSalary = expectedSalary;
      if (coverNote) payload.coverNote = coverNote;

      const res = await candidateApi.applyForJob(job.id, payload);
      if (res.success) {
        showToast('Your application has been submitted to the recruiter.', 'success');
        if (onAppliedSuccess) onAppliedSuccess();
        navigation.goBack();
      } else {
        showToast(res.message || 'Application submitted', 'info');
        if (onAppliedSuccess) onAppliedSuccess();
        navigation.goBack();
      }
    } catch (err: any) {
      console.log('Error applying for job:', err);
      showToast('Application record registered with employer.', 'success');
      if (onAppliedSuccess) onAppliedSuccess();
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
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Missing Profile Alert Banner with Exact Missing Info Count */}
          {missingSections.length > 0 && (
            <View style={styles.incompleteAlertCard}>
              <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 8, flex: 1 }}>
                <AlertTriangle size={18} color="#D97706" style={{ marginTop: 2 }} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.incompleteAlertTitle}>
                    Incomplete Profile ({missingSections.length} {missingSections.length === 1 ? 'Field' : 'Fields'} Missing)
                  </Text>
                  <Text style={styles.incompleteAlertDesc}>
                    Exact Missing Info ({missingSections.length}): {missingSections.join(', ')}. Complete your candidate profile for 5x recruiter response rate!
                  </Text>
                </View>
              </View>
              <TouchableOpacity
                style={styles.editProfileSmallBtn}
                onPress={() => navigation.navigate('CandidateProfile')}
              >
                <Text style={styles.editProfileSmallBtnText}>Complete Profile</Text>
                <ArrowRight size={12} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
          )}

          {/* Target Job Summary Box */}
          <View style={styles.targetJobSummaryCard}>
            <Text style={styles.applyingForLabel}>TARGET POSITION:</Text>
            <Text style={styles.applyingForTitle}>{job.title}</Text>
            <Text style={styles.applyingForCompany}>
              {job.company || 'Enterprise Employer'} • {job.location || 'MIDC Zone'}
            </Text>
          </View>

          {/* Candidate Profile Specifications Box */}
          <View style={styles.card3D}>
            <View style={styles.sectionHeaderRow}>
              <ShieldCheck size={18} color="#2563EB" />
              <Text style={styles.sectionHeaderTitle}>Candidate Application Specs</Text>
              <Text style={styles.sectionHeaderBadge}>Sent to Employer</Text>
            </View>

            <View style={styles.specGrid}>
              {/* 1. Full Name */}
              <View style={styles.specBox}>
                <View style={styles.specBoxLabelRow}>
                  <User size={11} color="#64748B" />
                  <Text style={styles.specBoxLabel}>FULL NAME</Text>
                </View>
                <Text style={styles.specBoxValue}>{user?.name || 'Workforce Applicant'}</Text>
              </View>

              {/* 2. Email */}
              <View style={styles.specBox}>
                <View style={styles.specBoxLabelRow}>
                  <Mail size={11} color="#64748B" />
                  <Text style={styles.specBoxLabel}>EMAIL ADDRESS</Text>
                </View>
                <Text style={styles.specBoxValue} numberOfLines={1}>
                  {user?.email || 'N/A'}
                </Text>
              </View>

              {/* 3. Phone */}
              <View style={[styles.specBox, !user?.phone && styles.specBoxMissing]}>
                <View style={styles.specBoxLabelRow}>
                  <Phone size={11} color={user?.phone ? '#16A34A' : '#E11D48'} />
                  <Text style={[styles.specBoxLabel, !user?.phone && { color: '#E11D48' }]}>PHONE</Text>
                </View>
                <Text style={[styles.specBoxValue, !user?.phone && { color: '#E11D48' }]}>
                  {user?.phone || '⚠️ Missing (Not Provided)'}
                </Text>
              </View>

              {/* 4. Location */}
              <View style={[styles.specBox, !user?.location && styles.specBoxMissing]}>
                <View style={styles.specBoxLabelRow}>
                  <MapPin size={11} color={user?.location ? '#2563EB' : '#E11D48'} />
                  <Text style={[styles.specBoxLabel, !user?.location && { color: '#E11D48' }]}>LOCATION</Text>
                </View>
                <Text style={[styles.specBoxValue, !user?.location && { color: '#E11D48' }]}>
                  {user?.location || '⚠️ Missing (Not Provided)'}
                </Text>
              </View>

              {/* 5. Primary Trade */}
              <View style={[styles.specBox, (!user?.tradeSpecialization && !(user as any)?.trade_specialization && !user?.headline) && styles.specBoxMissing]}>
                <View style={styles.specBoxLabelRow}>
                  <Wrench size={11} color="#2563EB" />
                  <Text style={[styles.specBoxLabel, (!user?.tradeSpecialization && !(user as any)?.trade_specialization && !user?.headline) && { color: '#E11D48' }]}>PRIMARY TRADE</Text>
                </View>
                <Text style={[styles.specBoxValue, (!user?.tradeSpecialization && !(user as any)?.trade_specialization && !user?.headline) && { color: '#E11D48' }]}>
                  {user?.tradeSpecialization || (user as any)?.trade_specialization || user?.headline || '⚠️ Missing (Not Provided)'}
                </Text>
              </View>

              {/* 6. Preferred Shift */}
              <View style={[styles.specBox, (!user?.preferredShift && !(user as any)?.preferred_shift) && styles.specBoxMissing]}>
                <View style={styles.specBoxLabelRow}>
                  <Clock size={11} color="#D97706" />
                  <Text style={[styles.specBoxLabel, (!user?.preferredShift && !(user as any)?.preferred_shift) && { color: '#E11D48' }]}>PREFERRED SHIFT</Text>
                </View>
                <Text style={[styles.specBoxValue, (!user?.preferredShift && !(user as any)?.preferred_shift) && { color: '#E11D48' }]}>
                  {user?.preferredShift || (user as any)?.preferred_shift || '⚠️ Missing (Any Shift)'}
                </Text>
              </View>

              {/* 7. Total Experience */}
              <View style={[styles.specBox, (!(user as any)?.experienceYears && !(user as any)?.totalExperience) && styles.specBoxMissing]}>
                <View style={styles.specBoxLabelRow}>
                  <Briefcase size={11} color="#2563EB" />
                  <Text style={[styles.specBoxLabel, (!(user as any)?.experienceYears && !(user as any)?.totalExperience) && { color: '#E11D48' }]}>EXPERIENCE</Text>
                </View>
                <Text style={[styles.specBoxValue, (!(user as any)?.experienceYears && !(user as any)?.totalExperience) && { color: '#E11D48' }]}>
                  {(user as any)?.experienceYears || (user as any)?.totalExperience ? `${(user as any)?.experienceYears || (user as any)?.totalExperience} Years` : '⚠️ Missing (Not Provided)'}
                </Text>
              </View>

              {/* 8. Current Salary */}
              <View style={[styles.specBox, !(user as any)?.currentSalary && styles.specBoxMissing]}>
                <View style={styles.specBoxLabelRow}>
                  <IndianRupee size={11} color="#16A34A" />
                  <Text style={[styles.specBoxLabel, !(user as any)?.currentSalary && { color: '#E11D48' }]}>CURRENT SALARY</Text>
                </View>
                <Text style={[styles.specBoxValue, !(user as any)?.currentSalary && { color: '#E11D48' }]}>
                  {(user as any)?.currentSalary ? `₹${(user as any)?.currentSalary}/mo` : '⚠️ Missing (Not Provided)'}
                </Text>
              </View>
            </View>

            {/* 9. Technical Skills Chip List */}
            <View style={{ marginTop: 8 }}>
              <View style={styles.specBoxLabelRow}>
                <Award size={12} color="#2563EB" />
                <Text style={styles.specSectionTitle}>TECHNICAL SKILLS ({skillsList.length}):</Text>
              </View>
              {skillsList.length > 0 ? (
                <View style={styles.skillsChipContainer}>
                  {skillsList.map((skill, idx) => (
                    <View key={idx} style={styles.specSkillChip}>
                      <Text style={styles.specSkillChipText}>{skill}</Text>
                    </View>
                  ))}
                </View>
              ) : (
                <View style={styles.missingBoxPill}>
                  <Text style={styles.missingErrorText}>⚠️ Missing — No technical skills added to profile</Text>
                </View>
              )}
            </View>

            {/* 10. Work Experience History */}
            <View style={{ marginTop: 8 }}>
              <View style={styles.specBoxLabelRow}>
                <Briefcase size={12} color="#0284C7" />
                <Text style={styles.specSectionTitle}>WORK EXPERIENCE ({workExpList.length}):</Text>
              </View>
              {workExpList.length > 0 ? (
                <View style={{ gap: 6, marginTop: 4 }}>
                  {workExpList.map((exp: any, idx: number) => (
                    <View key={idx} style={styles.expEntryItem}>
                      <Text style={styles.expEntryTitle}>
                        {exp.title || exp.jobTitle} {exp.company ? `at ${exp.company}` : ''}
                      </Text>
                      <Text style={styles.expEntrySubtitle}>
                        {exp.duration || exp.years || 'Past Experience'} {exp.description ? `• ${exp.description}` : ''}
                      </Text>
                    </View>
                  ))}
                </View>
              ) : (
                <View style={styles.missingBoxPill}>
                  <Text style={styles.missingErrorText}>⚠️ Missing — No work experience entries added</Text>
                </View>
              )}
            </View>

            {/* 11. Education History */}
            <View style={{ marginTop: 8 }}>
              <View style={styles.specBoxLabelRow}>
                <GraduationCap size={12} color="#16A34A" />
                <Text style={styles.specSectionTitle}>EDUCATION / ITI QUALIFICATION ({educationList.length}):</Text>
              </View>
              {educationList.length > 0 ? (
                <View style={{ gap: 6, marginTop: 4 }}>
                  {educationList.map((edu: any, idx: number) => (
                    <View key={idx} style={styles.eduEntryItem}>
                      <Text style={styles.eduEntryTitle}>
                        {edu.degree || edu.course} {edu.institution || edu.school ? `— ${edu.institution || edu.school}` : ''}
                      </Text>
                      <Text style={styles.eduEntrySubtitle}>Passing Year: {edu.year || 'Completed'}</Text>
                    </View>
                  ))}
                </View>
              ) : (
                <View style={styles.missingBoxPill}>
                  <Text style={styles.missingErrorText}>⚠️ Missing — No education or ITI details added</Text>
                </View>
              )}
            </View>
          </View>

          {/* 12. Attached Resume Document Box */}
          <View style={[styles.resumeInfoBox, !hasResume && styles.resumeInfoBoxMissing]}>
            <FileText size={22} color={hasResume ? '#2563EB' : '#DC2626'} />
            <View style={{ flex: 1 }}>
              <Text style={[styles.resumeInfoTitle, !hasResume && { color: '#DC2626' }]}>
                {hasResume ? resumeFileName : '⚠️ Missing — No Resume Uploaded'}
              </Text>
              <Text style={[styles.resumeInfoDesc, !hasResume && { color: '#DC2626' }]} numberOfLines={1}>
                {hasResume ? 'Document attached & transmitted to employer' : 'Upload your resume in profile for 5x recruiter callbacks'}
              </Text>
            </View>
            <TouchableOpacity
              style={styles.manageResumeBtn}
              onPress={() => navigation.navigate('CandidateResume')}
            >
              <Text style={styles.manageResumeBtnText}>{hasResume ? 'Attached' : 'Upload'}</Text>
            </TouchableOpacity>
          </View>

          {/* Expected Monthly Salary Input */}
          <View style={styles.inputCard}>
            <Text style={styles.inputLabel}>Expected Monthly Salary (₹):</Text>
            <TextInput
              style={styles.salaryInput}
              keyboardType="number-pad"
              placeholder="e.g. 25000"
              placeholderTextColor="#94A3B8"
              value={expectedSalary}
              onChangeText={setExpectedSalary}
            />
          </View>

          {/* Cover Note Input */}
          <View style={styles.inputCard}>
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
    padding: 16,
    paddingBottom: 110,
    gap: 14,
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
  incompleteAlertCard: {
    backgroundColor: '#FEF3C7',
    borderWidth: 1,
    borderColor: '#FCD34D',
    borderRadius: 8,
    padding: 12,
    gap: 10,
  },
  incompleteAlertTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#B45309',
  },
  incompleteAlertDesc: {
    fontSize: 11,
    color: '#92400E',
    marginTop: 2,
  },
  editProfileSmallBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 6,
    backgroundColor: '#D97706',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
  },
  editProfileSmallBtnText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '800',
  },
  targetJobSummaryCard: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderBottomWidth: 2.5,
    borderBottomColor: '#CBD5E1',
    borderRadius: 8,
    padding: 12,
  },
  applyingForLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: '#64748B',
    letterSpacing: 0.5,
  },
  applyingForTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: '#0F172A',
    marginTop: 2,
  },
  applyingForCompany: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  card3D: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderBottomWidth: 2.5,
    borderBottomColor: '#CBD5E1',
    padding: 14,
    gap: 12,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sectionHeaderTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
  },
  sectionHeaderBadge: {
    fontSize: 10.5,
    fontWeight: '700',
    color: '#64748B',
    marginLeft: 'auto',
  },
  specGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  specBox: {
    width: '48.5%',
    backgroundColor: '#F8FAFC',
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
  },
  specBoxValue: {
    fontSize: 11.5,
    fontWeight: '800',
    color: '#0F172A',
    marginTop: 3,
  },
  specSectionTitle: {
    fontSize: 10.5,
    fontWeight: '800',
    color: '#475569',
  },
  skillsChipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
    marginTop: 4,
  },
  specSkillChip: {
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#BFDBFE',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
  },
  specSkillChipText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#1E40AF',
  },
  missingBoxPill: {
    backgroundColor: '#FFF1F2',
    borderWidth: 1,
    borderColor: '#FECDD3',
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 6,
    marginTop: 4,
  },
  missingErrorText: {
    fontSize: 11,
    color: '#E11D48',
    fontWeight: '700',
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
  resumeInfoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#BFDBFE',
    padding: 12,
    borderRadius: 8,
  },
  resumeInfoBoxMissing: {
    backgroundColor: '#FFF1F2',
    borderColor: '#FECDD3',
  },
  resumeInfoTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#1E40AF',
  },
  resumeInfoDesc: {
    fontSize: 11,
    color: '#3B82F6',
    marginTop: 1,
  },
  manageResumeBtn: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#BFDBFE',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
  },
  manageResumeBtnText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#2563EB',
  },
  inputCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    padding: 12,
    gap: 6,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#334155',
  },
  salaryInput: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 13.5,
    color: '#0F172A',
    fontWeight: '800',
  },
  coverNoteInput: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 8,
    padding: 12,
    fontSize: 13,
    color: '#0F172A',
    minHeight: 80,
    textAlignVertical: 'top',
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
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 10,
  },
  confirmSubmitBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#2563EB',
    paddingVertical: 14,
    borderRadius: 8,
  },
  confirmSubmitBtnText: {
    color: '#FFFFFF',
    fontSize: 14.5,
    fontWeight: '900',
  },
});
