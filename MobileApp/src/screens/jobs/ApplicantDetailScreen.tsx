import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Image,
  Alert,
  Modal,
  Platform,
  KeyboardAvoidingView,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  ArrowLeft,
  User as UserIcon,
  Briefcase,
  Zap,
  Calendar,
  Mail,
  ChevronLeft,
  ChevronRight,
  X,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
} from 'lucide-react-native';
import { Header } from '../../components/common/Header';
import { FocusAwareStatusBar } from '../../components/common/FocusAwareStatusBar';
import { ResumePdfViewerModal } from '../../components/common/ResumePdfViewerModal';
import { ClockTimePickerModal } from '../../components/common/ClockTimePickerModal';
import { ConfirmationModal } from '../../components/common/ConfirmationModal';
import { SuccessModal } from '../../components/common/SuccessModal';
import { JobApplication, ApplicationStatus, Job } from '../../types';
import { applicantsApi } from '../../api/applicantsApi';
import { jobsApi } from '../../api/jobsApi';
import { safeValue, EMAIL_TEMPLATES } from './components/JobApplicantsUtils';
import { extractCandidateResume } from '../../utils/fileUtils';
import { ApplicantDetailJobTab } from './components/ApplicantDetailJobTab';
import { ApplicantDetailCandidateTab } from './components/ApplicantDetailCandidateTab';
import { ApplicantDetailStatusTab } from './components/ApplicantDetailStatusTab';
import { ApplicantDetailInterviewTab } from './components/ApplicantDetailInterviewTab';
import { ApplicantDetailEmailTab } from './components/ApplicantDetailEmailTab';

export type ModalTabType = 'CANDIDATE' | 'JOB' | 'STATUS' | 'INTERVIEW' | 'EMAIL';

interface Props {
  navigation?: any;
  route?: {
    params?: {
      applicant?: JobApplication;
      jobId?: string;
      jobTitle?: string;
    };
  };
}

export const ApplicantDetailScreen: React.FC<Props> = ({ navigation, route }) => {
  const insets = useSafeAreaInsets();
  const { applicant, jobId, jobTitle = 'Industrial Position' } = route?.params || {};

  const [currentApplicant, setCurrentApplicant] = useState<JobApplication | null>(applicant || null);
  const [modalTab, setModalTab] = useState<ModalTabType>('JOB');
  const [jobDetails, setJobDetails] = useState<Job | null>(null);
  const [myJobs, setMyJobs] = useState<Job[]>([]);
  const [pdfModalVisible, setPdfModalVisible] = useState(false);
  const [loading, setLoading] = useState(false);

  // Interview States
  const [interviewDate, setInterviewDate] = useState('');
  const [interviewTime, setInterviewTime] = useState('');
  const [interviewMode, setInterviewMode] = useState('In-Person Walk-in');
  const [interviewLocation, setInterviewLocation] = useState('');
  const [interviewNotes, setInterviewNotes] = useState('');
  const [datePickerVisible, setDatePickerVisible] = useState(false);
  const [timePickerVisible, setTimePickerVisible] = useState(false);
  const [currentPickerMonth, setCurrentPickerMonth] = useState(new Date());

  // Email States
  const [emailSubject, setEmailSubject] = useState('');
  const [emailMessage, setEmailMessage] = useState('');
  const [selectedTemplateLabel, setSelectedTemplateLabel] = useState('');
  const [templateDropdownVisible, setTemplateDropdownVisible] = useState(false);

  // Status Change Theme Confirmation & Success Modal States
  const [confirmStatusModalVisible, setConfirmStatusModalVisible] = useState(false);
  const [successStatusModalVisible, setSuccessStatusModalVisible] = useState(false);
  const [statusUpdating, setStatusUpdating] = useState(false);
  const [statusDates, setStatusDates] = useState<Record<string, string>>({});
  const [successModalData, setSuccessModalData] = useState<{
    title: string;
    message: string;
    buttonText: string;
    destinationTab?: ModalTabType;
  }>({
    title: 'Status Updated Successfully',
    message: '',
    buttonText: 'Done',
  });
  const [pendingStatusTarget, setPendingStatusTarget] = useState<{
    userId: string;
    newStatus: ApplicationStatus;
    targetJobId?: string;
    label: string;
  } | null>(null);

  useEffect(() => {
    if (currentApplicant) {
      const initialAppliedDate =
        currentApplicant.applied_at || (currentApplicant as any).created_at || new Date().toISOString();
      const initialUpdatedDate = (currentApplicant as any).updated_at || initialAppliedDate;
      const curStatus = (currentApplicant.status || 'applied').toLowerCase();

      const pipeline = ['applied', 'shortlisted', 'interview', 'hired'];
      const curIdx = pipeline.indexOf(curStatus);

      const initialDates: Record<string, string> = {
        applied: initialAppliedDate,
      };

      if (curIdx > 0) {
        for (let i = 1; i <= curIdx; i++) {
          initialDates[pipeline[i]] = initialUpdatedDate;
        }
      }
      if (curStatus === 'rejected') {
        initialDates['rejected'] = initialUpdatedDate;
      }

      if ((currentApplicant as any).status_dates) {
        Object.assign(initialDates, (currentApplicant as any).status_dates);
      }
      setStatusDates(initialDates);
    }
  }, [currentApplicant?.id, currentApplicant?.status]);

  useEffect(() => {
    // Fetch user's jobs for context
    jobsApi.getMyJobs().then((res) => {
      if (res && res.success && Array.isArray(res.data)) {
        setMyJobs(res.data);
        const targetJId = currentApplicant?.job_id || jobId;
        if (targetJId) {
          const matched = res.data.find((j) => j.id === targetJId);
          if (matched) setJobDetails(matched);
        }
      }
    }).catch(() => {});
  }, [currentApplicant, jobId]);

  const applyEmailTemplate = (templateKey: string) => {
    const candidateName = currentApplicant?.user?.name || 'Candidate';
    const activeJobTitle = currentApplicant?.job?.title || jobTitle || 'Industrial Operator';
    const tpl = EMAIL_TEMPLATES.find((t) => t.key === templateKey);
    if (tpl) {
      setSelectedTemplateLabel(tpl.label);
      setEmailSubject(tpl.subject(activeJobTitle));
      setEmailMessage(tpl.message(candidateName, activeJobTitle));
    }
  };

  const handleUpdateStatus = (userId: string, newStatus: ApplicationStatus, targetJobId?: string) => {
    const activeJobId = targetJobId || currentApplicant?.job_id || jobId;
    if (!activeJobId || !userId) {
      Alert.alert('Error', 'Missing required applicant information to update status.');
      return;
    }

    if (currentApplicant?.status === newStatus) {
      return;
    }

    const statusLabels: Record<string, string> = {
      applied: 'Applied',
      shortlisted: 'Shortlisted',
      interview: 'Interview Scheduled',
      hired: 'Hired',
      rejected: 'Rejected',
    };
    const targetLabel = statusLabels[newStatus] || newStatus.toUpperCase();

    setPendingStatusTarget({
      userId,
      newStatus,
      targetJobId: activeJobId,
      label: targetLabel,
    });
    setConfirmStatusModalVisible(true);
  };

  const handleConfirmStatusChange = async () => {
    if (!pendingStatusTarget) return;
    const { userId, newStatus, targetJobId, label } = pendingStatusTarget;

    // Special Workflow for Interview: Navigate directly to Interview schedule section
    if (newStatus === 'interview') {
      setConfirmStatusModalVisible(false);
      setModalTab('INTERVIEW');
      return;
    }

    const effectiveJobId = targetJobId || jobId || currentApplicant?.job_id || '';
    if (!effectiveJobId) {
      setConfirmStatusModalVisible(false);
      Alert.alert('Error', 'Target Job ID is missing.');
      return;
    }

    setStatusUpdating(true);
    try {
      const res = await applicantsApi.updateApplicantStatus(effectiveJobId, userId, newStatus);
      if (res && res.success) {
        const nowIso = new Date().toISOString();
        const pipeline = ['applied', 'shortlisted', 'interview', 'hired'];
        const targetIdx = pipeline.indexOf(newStatus.toLowerCase());

        const updatedDates = { ...statusDates };
        if (targetIdx !== -1) {
          // If any previous step was skipped, take the date of the next selected status into the skipped status
          for (let i = 0; i <= targetIdx; i++) {
            if (!updatedDates[pipeline[i]]) {
              updatedDates[pipeline[i]] = nowIso;
            }
          }
          updatedDates[newStatus.toLowerCase()] = nowIso;
        } else if (newStatus.toLowerCase() === 'rejected') {
          updatedDates['rejected'] = nowIso;
        }

        setStatusDates(updatedDates);
        setCurrentApplicant((prev) =>
          prev ? { ...prev, status: newStatus, status_dates: updatedDates } : null
        );
        setConfirmStatusModalVisible(false);
        setSuccessModalData({
          title: 'Status Updated Successfully',
          message: `Candidate ${currentApplicant?.user?.name || 'Applicant'} is now marked as "${label}".`,
          buttonText: 'Done',
          destinationTab: undefined,
        });
        setSuccessStatusModalVisible(true);
      } else {
        setConfirmStatusModalVisible(false);
        Alert.alert('Update Failed', res?.message || 'Failed to update applicant status.');
      }
    } catch (err: any) {
      setConfirmStatusModalVisible(false);
      Alert.alert('Error', err.message || 'Failed to update candidate status.');
    } finally {
      setStatusUpdating(false);
    }
  };

  const handleScheduleInterview = async () => {
    if (!currentApplicant) return;
    if (!interviewDate) {
      Alert.alert('Validation Error', 'Please select the interview date.');
      return;
    }
    const targetJobId = currentApplicant?.job_id || (currentApplicant as any)?.jobId || jobId;
    if (!targetJobId) {
      Alert.alert('Error', 'Target job ID is required to schedule interview.');
      return;
    }

    setLoading(true);
    try {
      const venue = interviewLocation.trim() || 'Industrial Plant Main Gate';
      const targetUserId =
        currentApplicant.user_id ||
        (currentApplicant as any).userId ||
        (currentApplicant.user as any)?.id ||
        (currentApplicant as any).id;

      // 1. Submit Interview Schedule
      const res = await applicantsApi.scheduleInterview(targetJobId, targetUserId, {
        interviewDate,
        interviewTime: interviewTime || '10:00 AM',
        venueAddress: venue,
        interviewLocation: venue,
        interviewMode,
        notes: interviewNotes,
      });

      if (res && res.success) {
        // 2. Automatically update candidate status to 'interview'
        await applicantsApi.updateApplicantStatus(targetJobId, targetUserId, 'interview').catch(() => {});

        // 3. Update status dates inheriting any skipped stages
        const nowIso = new Date().toISOString();
        const pipeline = ['applied', 'shortlisted', 'interview', 'hired'];
        const targetIdx = pipeline.indexOf('interview');

        const updatedDates = { ...statusDates };
        for (let i = 0; i <= targetIdx; i++) {
          if (!updatedDates[pipeline[i]]) {
            updatedDates[pipeline[i]] = nowIso;
          }
        }
        updatedDates['interview'] = nowIso;

        setStatusDates(updatedDates);
        setCurrentApplicant((prev) =>
          prev ? { ...prev, status: 'interview' as any, status_dates: updatedDates } : null
        );

        // 4. Trigger Success Modal and navigate back to STATUS section
        setSuccessModalData({
          title: 'Interview Successfully Scheduled',
          message: `Official interview invite for ${currentApplicant?.user?.name || 'candidate'} has been confirmed for ${interviewDate} at ${interviewTime || '10:00 AM'}.\n\nApplication status is now updated to "Interview Scheduled".`,
          buttonText: 'View Status Pipeline',
          destinationTab: 'STATUS',
        });
        setSuccessStatusModalVisible(true);
      } else {
        Alert.alert('Scheduling Error', res?.message || 'Failed to schedule interview.');
      }
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to schedule interview.');
    } finally {
      setLoading(false);
    }
  };

  const handleSendCustomEmail = async () => {
    if (!currentApplicant) return;
    if (!emailSubject.trim() || !emailMessage.trim()) {
      Alert.alert('Validation Error', 'Please enter both email subject line and body.');
      return;
    }

    const candidateEmail = currentApplicant.user?.email;
    if (!candidateEmail) {
      Alert.alert('Error', 'No email address registered for this candidate.');
      return;
    }

    setLoading(true);
    try {
      const res = await applicantsApi.sendCustomEmail(
        currentApplicant.job_id || (currentApplicant as any).jobId || jobId || '',
        currentApplicant.user_id || (currentApplicant as any).userId || '',
        {
          subject: emailSubject.trim(),
          message: emailMessage.trim(),
        }
      );

      if (res && res.success) {
        Alert.alert('Email Sent', `Official communication email dispatched to ${candidateEmail}.`, [
          {
            text: 'OK',
            onPress: () => {
              setEmailSubject('');
              setEmailMessage('');
              setSelectedTemplateLabel('');
            },
          },
        ]);
      } else {
        Alert.alert('Email Error', res?.message || 'Failed to send email.');
      }
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to send custom email.');
    } finally {
      setLoading(false);
    }
  };

  const getInitials = (name?: string): string => {
    if (!name) return 'C';
    const parts = name.trim().split(/\s+/);
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  const userPhotoUrl = currentApplicant?.user
    ? (currentApplicant.user.profile_picture_url ||
        (currentApplicant.user as any).profilePictureUrl ||
        (currentApplicant.user as any).avatarUrl ||
        (currentApplicant.user as any).avatar_url ||
        (currentApplicant.user as any).avatar ||
        (currentApplicant.user as any).photo ||
        (currentApplicant.user as any).profile_picture ||
        (currentApplicant.user as any).profilePicture)
    : ((currentApplicant as any)?.profile_picture_url ||
        (currentApplicant as any)?.profilePictureUrl ||
        (currentApplicant as any)?.avatarUrl ||
        (currentApplicant as any)?.avatar ||
        null);

  const getDaysInMonthGrid = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDayIndex = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const grid: ({ day: number; dateStr: string; isPast: boolean } | null)[] = [];
    for (let i = 0; i < firstDayIndex; i++) {
      grid.push(null);
    }
    for (let day = 1; day <= daysInMonth; day++) {
      const dObj = new Date(year, month, day);
      const isPast = dObj < today;
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      grid.push({ day, dateStr, isPast });
    }
    return grid;
  };

  return (
    <View style={styles.container}>
      <FocusAwareStatusBar barStyle="dark-content" backgroundColor="#FFFFFF" translucent={false} />

      {/* Top Header with Back Button, Candidate Profile Picture, Name & Subtitle */}
      <View style={[styles.topHeaderContainer, { paddingTop: insets.top + (Platform.OS === 'ios' ? 4 : 8) }]}>
        <View style={styles.topHeaderRow}>
          <TouchableOpacity
            style={styles.backBtn}
            onPress={() => navigation.goBack()}
            activeOpacity={0.7}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <ArrowLeft size={20} color="#0F172A" />
          </TouchableOpacity>

          <View style={styles.headerAvatarBox}>
            {userPhotoUrl ? (
              <Image source={{ uri: userPhotoUrl }} style={styles.headerAvatarImg} />
            ) : (
              <Text style={styles.headerAvatarInitials}>
                {getInitials(currentApplicant?.user?.name || (currentApplicant as any)?.name || 'Candidate')}
              </Text>
            )}
          </View>

          <View style={styles.headerTitleCol}>
            <Text style={styles.headerCandidateName} numberOfLines={1}>
              {safeValue(currentApplicant?.user?.name || 'Candidate')}
            </Text>
            <Text style={styles.headerCandidateHeadline} numberOfLines={1}>
              {safeValue(currentApplicant?.user?.headline || currentApplicant?.user?.trade_specialization || jobTitle || 'Technical Candidate')}
            </Text>
          </View>
        </View>

        {/* 5-Tab Segmented Control Bar */}
        <View style={styles.segmentedTabBar}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabScroll}>
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => setModalTab('JOB')}
              style={[styles.tabItem, modalTab === 'JOB' && styles.tabItemActive]}
            >
              <Briefcase size={13} color={modalTab === 'JOB' ? '#1764E8' : '#657796'} />
              <Text style={[styles.tabText, modalTab === 'JOB' && styles.tabTextActive]}>
                Job Info
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => setModalTab('CANDIDATE')}
              style={[styles.tabItem, modalTab === 'CANDIDATE' && styles.tabItemActive]}
            >
              <UserIcon size={13} color={modalTab === 'CANDIDATE' ? '#1764E8' : '#657796'} />
              <Text style={[styles.tabText, modalTab === 'CANDIDATE' && styles.tabTextActive]}>
                Candidate Info
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => setModalTab('STATUS')}
              style={[styles.tabItem, modalTab === 'STATUS' && styles.tabItemActive]}
            >
              <Zap size={13} color={modalTab === 'STATUS' ? '#1764E8' : '#657796'} />
              <Text style={[styles.tabText, modalTab === 'STATUS' && styles.tabTextActive]}>
                Status
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => setModalTab('INTERVIEW')}
              style={[styles.tabItem, modalTab === 'INTERVIEW' && styles.tabItemActive]}
            >
              <Calendar size={13} color={modalTab === 'INTERVIEW' ? '#1764E8' : '#657796'} />
              <Text style={[styles.tabText, modalTab === 'INTERVIEW' && styles.tabTextActive]}>
                Interview
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => setModalTab('EMAIL')}
              style={[styles.tabItem, modalTab === 'EMAIL' && styles.tabItemActive]}
            >
              <Mail size={13} color={modalTab === 'EMAIL' ? '#1764E8' : '#657796'} />
              <Text style={[styles.tabText, modalTab === 'EMAIL' && styles.tabTextActive]}>
                Send Email
              </Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </View>

      {/* Screen Body Tab Content with Keyboard Elevation */}
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        <ScrollView
          style={styles.bodyScroll}
          contentContainerStyle={modalTab === 'EMAIL' ? { flexGrow: 1, paddingBottom: 24 } : { paddingBottom: 60 }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="interactive"
        >
          {modalTab === 'JOB' ? (
            <ApplicantDetailJobTab
              selectedApplicant={currentApplicant}
              jobDetails={jobDetails}
              myJobs={myJobs}
              jobTitle={jobTitle}
            />
          ) : null}

          {modalTab === 'CANDIDATE' ? (
            <ApplicantDetailCandidateTab
              selectedApplicant={currentApplicant}
              onOpenPdfModal={() => setPdfModalVisible(true)}
              onSelectEmailTab={() => setModalTab('EMAIL')}
            />
          ) : null}

          {modalTab === 'STATUS' ? (
            <ApplicantDetailStatusTab
              selectedApplicant={currentApplicant}
              jobId={jobId}
              onUpdateStatus={handleUpdateStatus}
              statusDates={statusDates}
            />
          ) : null}

          {modalTab === 'INTERVIEW' ? (
            <ApplicantDetailInterviewTab
              selectedApplicant={currentApplicant}
              interviewMode={interviewMode}
              setInterviewMode={setInterviewMode}
              interviewDate={interviewDate}
              interviewTime={interviewTime}
              setInterviewTime={setInterviewTime}
              interviewLocation={interviewLocation}
              setInterviewLocation={setInterviewLocation}
              interviewNotes={interviewNotes}
              setInterviewNotes={setInterviewNotes}
              onScheduleInterview={handleScheduleInterview}
              onOpenDatePicker={() => setDatePickerVisible(true)}
              onOpenTimePicker={() => setTimePickerVisible(true)}
              modalLoading={loading}
            />
          ) : null}

          {modalTab === 'EMAIL' ? (
            <ApplicantDetailEmailTab
              selectedApplicant={currentApplicant}
              selectedTemplateLabel={selectedTemplateLabel}
              onOpenTemplateDropdown={() => setTemplateDropdownVisible(true)}
              onSelectTemplateKey={applyEmailTemplate}
              emailSubject={emailSubject}
              setEmailSubject={setEmailSubject}
              emailMessage={emailMessage}
              setEmailMessage={setEmailMessage}
              onSendCustomEmail={handleSendCustomEmail}
              modalLoading={loading}
              jobTitle={jobTitle}
            />
          ) : null}
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Universal Resume PDF Viewer Modal */}
      {currentApplicant ? (
        <ResumePdfViewerModal
          visible={pdfModalVisible}
          onClose={() => setPdfModalVisible(false)}
          candidateName={currentApplicant.user?.name || 'Applicant'}
          candidateRole={jobTitle}
          pdfUrl={extractCandidateResume(currentApplicant).url}
        />
      ) : null}

      {/* Date Picker Modal */}
      <Modal visible={datePickerVisible} transparent animationType="fade">
        <View style={styles.datePickerModalOverlay}>
          <View style={styles.datePickerModalCard}>
            <View style={styles.calendarHeaderRow}>
              <TouchableOpacity
                style={styles.calendarNavBtn}
                onPress={() => {
                  const prev = new Date(currentPickerMonth);
                  prev.setMonth(prev.getMonth() - 1);
                  setCurrentPickerMonth(prev);
                }}
              >
                <ChevronLeft size={16} color="#334155" />
              </TouchableOpacity>

              <Text style={styles.calendarMonthTitle}>
                {currentPickerMonth.toLocaleString('default', { month: 'long', year: 'numeric' })}
              </Text>

              <TouchableOpacity
                style={styles.calendarNavBtn}
                onPress={() => {
                  const next = new Date(currentPickerMonth);
                  next.setMonth(next.getMonth() + 1);
                  setCurrentPickerMonth(next);
                }}
              >
                <ChevronRight size={16} color="#334155" />
              </TouchableOpacity>
            </View>

            <View style={styles.calendarWeekRow}>
              {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((d) => (
                <Text key={d} style={styles.calendarWeekLabel}>
                  {d}
                </Text>
              ))}
            </View>

            <View style={styles.calendarGridWrap}>
              {getDaysInMonthGrid(currentPickerMonth).map((item, idx) => {
                if (!item) {
                  return <View key={`empty-${idx}`} style={styles.calendarDayCellEmpty} />;
                }
                const isSelected = interviewDate === item.dateStr;
                return (
                  <TouchableOpacity
                    key={item.dateStr}
                    disabled={item.isPast}
                    onPress={() => {
                      setInterviewDate(item.dateStr);
                      setDatePickerVisible(false);
                    }}
                    style={[
                      styles.calendarDayCell,
                      isSelected && styles.calendarDayCellSelected,
                      item.isPast && styles.calendarDayCellPast,
                    ]}
                  >
                    <Text
                      style={[
                        styles.calendarDayText,
                        isSelected && styles.calendarDayTextSelected,
                        item.isPast && styles.calendarDayTextPast,
                      ]}
                    >
                      {item.day}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <TouchableOpacity style={styles.calendarCloseBtn} onPress={() => setDatePickerVisible(false)}>
              <Text style={styles.calendarCloseBtnText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Clock Time Picker Modal */}
      <ClockTimePickerModal
        visible={timePickerVisible}
        onClose={() => setTimePickerVisible(false)}
        initialTime={interviewTime || '10:00 AM'}
        onSelectTime={(formattedTime) => {
          setInterviewTime(formattedTime);
          setTimePickerVisible(false);
        }}
      />

      {/* Email Template Selection Dropdown Modal */}
      <Modal visible={templateDropdownVisible} transparent animationType="slide">
        <View style={styles.sheetOverlayBottom}>
          <View style={styles.cleanIosSheetCard}>
            <View style={styles.sheetGrabHandle} />
            <View style={styles.sheetHeaderRow}>
              <View>
                <Text style={styles.sheetTitle}>Choose Email Template</Text>
                <Text style={styles.sheetSubtitle}>Select pre-drafted message for applicant</Text>
              </View>
              <TouchableOpacity onPress={() => setTemplateDropdownVisible(false)} style={styles.closeHeaderBtn}>
                <X size={15} color="#475569" />
              </TouchableOpacity>
            </View>

            <ScrollView style={{ maxHeight: 320 }}>
              {EMAIL_TEMPLATES.map((tpl) => (
                <TouchableOpacity
                  key={tpl.key}
                  style={styles.cleanIosDropdownOptionRow}
                  activeOpacity={0.7}
                  onPress={() => {
                    applyEmailTemplate(tpl.key);
                    setTemplateDropdownVisible(false);
                  }}
                >
                  <View style={{ flex: 1 }}>
                    <Text style={styles.cleanStatusOptionText}>{tpl.label}</Text>
                    <Text style={styles.cleanStatusOptionDesc} numberOfLines={2}>
                      {tpl.message(currentApplicant?.user?.name || 'Candidate', jobTitle)}
                    </Text>
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Theme Status Confirmation Modal */}
      <ConfirmationModal
        visible={confirmStatusModalVisible}
        onClose={() => setConfirmStatusModalVisible(false)}
        onConfirm={handleConfirmStatusChange}
        title={pendingStatusTarget?.newStatus === 'interview' ? 'Schedule Candidate Interview' : 'Update Candidate Stage'}
        message={
          pendingStatusTarget?.newStatus === 'interview'
            ? `Configure interview details (date, time, venue mode) to schedule with ${currentApplicant?.user?.name || 'this candidate'}?`
            : `Are you sure you want to change the application status for ${currentApplicant?.user?.name || 'this candidate'}?`
        }
        highlightText={pendingStatusTarget?.label || ''}
        confirmText={pendingStatusTarget?.newStatus === 'interview' ? 'Proceed to Schedule' : 'Confirm & Update'}
        cancelText="Cancel"
        type={pendingStatusTarget?.newStatus === 'rejected' ? 'danger' : 'primary'}
        icon={
          pendingStatusTarget?.newStatus === 'rejected' ? (
            <AlertCircle size={28} color="#DC2626" strokeWidth={2.4} />
          ) : pendingStatusTarget?.newStatus === 'interview' ? (
            <Calendar size={28} color="#1764E8" strokeWidth={2.4} />
          ) : pendingStatusTarget?.newStatus === 'hired' ? (
            <CheckCircle2 size={28} color="#16A34A" strokeWidth={2.4} />
          ) : (
            <HelpCircle size={28} color="#1764E8" strokeWidth={2.4} />
          )
        }
        loading={statusUpdating}
      />

      {/* Theme Status Success Modal */}
      <SuccessModal
        visible={successStatusModalVisible}
        onClose={() => {
          setSuccessStatusModalVisible(false);
          if (successModalData.destinationTab) {
            setModalTab(successModalData.destinationTab);
          }
        }}
        title={successModalData.title}
        message={successModalData.message}
        buttonText={successModalData.buttonText}
        onButtonPress={() => {
          setSuccessStatusModalVisible(false);
          if (successModalData.destinationTab) {
            setModalTab(successModalData.destinationTab);
          }
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F9FC',
  },
  topHeaderContainer: {
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E7EBF2',
  },
  topHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingTop: 4,
    paddingBottom: 10,
    gap: 12,
  },
  backBtn: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: -4,
  },
  headerAvatarBox: {
    width: 36,
    height: 36,
    borderRadius: 6,
    backgroundColor: '#EEF4FF',
    borderWidth: 1,
    borderColor: '#DBEAFE',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  headerAvatarImg: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  headerAvatarInitials: {
    fontSize: 13.5,
    fontWeight: '700',
    color: '#1764E8',
  },
  headerTitleCol: {
    flex: 1,
  },
  headerCandidateName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#102A5C',
  },
  headerCandidateHeadline: {
    fontSize: 11.5,
    color: '#657796',
    fontWeight: '500',
    marginTop: 1,
  },
  segmentedTabBar: {
    paddingHorizontal: 10,
  },
  tabScroll: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingBottom: 0,
  },
  tabItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 4,
    paddingVertical: 8,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
    marginBottom: -1,
  },
  tabItemActive: {
    borderBottomColor: '#1764E8',
  },
  tabText: {
    fontSize: 11.5,
    fontWeight: '600',
    color: '#657796',
  },
  tabTextActive: {
    color: '#1764E8',
    fontWeight: '700',
  },
  bodyScroll: {
    flex: 1,
  },
  datePickerModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  datePickerModalCard: {
    width: '100%',
    maxWidth: 340,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E7EBF2',
    padding: 16,
  },
  calendarHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E7EBF2',
  },
  calendarNavBtn: {
    width: 30,
    height: 30,
    borderRadius: 6,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  calendarMonthTitle: {
    fontSize: 13.5,
    fontWeight: '700',
    color: '#102A5C',
  },
  calendarWeekRow: {
    flexDirection: 'row',
    marginBottom: 6,
  },
  calendarWeekLabel: {
    flex: 1,
    textAlign: 'center',
    fontSize: 11,
    fontWeight: '700',
    color: '#657796',
  },
  calendarGridWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  calendarDayCellEmpty: {
    width: '14.28%',
    height: 34,
  },
  calendarDayCell: {
    width: '14.28%',
    height: 34,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 6,
    marginVertical: 2,
  },
  calendarDayCellSelected: {
    backgroundColor: '#1764E8',
  },
  calendarDayCellPast: {
    opacity: 0.35,
  },
  calendarDayText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#102A5C',
  },
  calendarDayTextSelected: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  calendarDayTextPast: {
    color: '#94A3B8',
  },
  calendarCloseBtn: {
    marginTop: 14,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 6,
    paddingVertical: 9,
    alignItems: 'center',
  },
  calendarCloseBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#334155',
  },
  sheetOverlayBottom: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    justifyContent: 'flex-end',
  },
  cleanIosSheetCard: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    paddingHorizontal: 18,
    paddingTop: 12,
    paddingBottom: 24,
    width: '100%',
  },
  sheetGrabHandle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#E2E8F0',
    alignSelf: 'center',
    marginBottom: 10,
  },
  sheetHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E7EBF2',
  },
  sheetTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#102A5C',
  },
  sheetSubtitle: {
    fontSize: 11,
    fontWeight: '500',
    color: '#657796',
    marginTop: 1,
  },
  closeHeaderBtn: {
    width: 30,
    height: 30,
    borderRadius: 6,
    backgroundColor: '#F8FAFC',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cleanIosDropdownOptionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 4,
    borderBottomWidth: 1,
    borderBottomColor: '#F8FAFC',
  },
  cleanStatusOptionText: {
    fontSize: 12.5,
    fontWeight: '600',
    color: '#102A5C',
  },
  cleanStatusOptionDesc: {
    fontSize: 11,
    color: '#657796',
    marginTop: 1,
  },
});
