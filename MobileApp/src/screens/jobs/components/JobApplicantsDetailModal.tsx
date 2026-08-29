import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  ScrollView,
  Image,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  User as UserIcon,
  Mail,
  Calendar,
  ChevronRight,
  ChevronLeft,
  Briefcase,
  Zap,
  X,
  FileText,
} from 'lucide-react-native';
import { JobApplication, ApplicationStatus, Job } from '../../../types';
import { COLORS } from '../../../constants/theme';
import { safeValue, EMAIL_TEMPLATES } from './JobApplicantsUtils';
import { ApplicantDetailJobTab } from './ApplicantDetailJobTab';
import { ApplicantDetailCandidateTab } from './ApplicantDetailCandidateTab';
import { ApplicantDetailStatusTab } from './ApplicantDetailStatusTab';
import { ApplicantDetailInterviewTab } from './ApplicantDetailInterviewTab';
import { ApplicantDetailEmailTab } from './ApplicantDetailEmailTab';

export type ModalTabType = 'CANDIDATE' | 'JOB' | 'STATUS' | 'INTERVIEW' | 'EMAIL';

interface JobApplicantsDetailModalProps {
  visible: boolean;
  onClose: () => void;
  selectedApplicant: JobApplication | null;
  jobTitle: string;
  jobId?: string;
  jobDetails: Job | null;
  myJobs: Job[];
  modalTab: ModalTabType;
  setModalTab: (tab: ModalTabType) => void;
  // Status Handler
  onUpdateStatus: (userId: string, newStatus: ApplicationStatus, targetJobId?: string) => void;
  // Interview States & Handlers
  interviewDate: string;
  setInterviewDate: (d: string) => void;
  interviewTime: string;
  setInterviewTime: (t: string) => void;
  interviewMode: string;
  setInterviewMode: (m: string) => void;
  interviewLocation: string;
  setInterviewLocation: (l: string) => void;
  interviewNotes: string;
  setInterviewNotes: (n: string) => void;
  onScheduleInterview: () => void;
  setTimePickerVisible: (v: boolean) => void;
  // Email States & Handlers
  emailSubject: string;
  setEmailSubject: (s: string) => void;
  emailMessage: string;
  setEmailMessage: (m: string) => void;
  selectedTemplateLabel: string;
  setSelectedTemplateLabel: (l: string) => void;
  onSendCustomEmail: () => void;
  onOpenPdfModal: () => void;
  modalLoading: boolean;
}

export const JobApplicantsDetailModal: React.FC<JobApplicantsDetailModalProps> = ({
  visible,
  onClose,
  selectedApplicant,
  jobTitle,
  jobId,
  jobDetails,
  myJobs,
  modalTab,
  setModalTab,
  onUpdateStatus,
  interviewDate,
  setInterviewDate,
  interviewTime,
  setInterviewTime,
  interviewMode,
  setInterviewMode,
  interviewLocation,
  setInterviewLocation,
  interviewNotes,
  setInterviewNotes,
  onScheduleInterview,
  setTimePickerVisible,
  emailSubject,
  setEmailSubject,
  emailMessage,
  setEmailMessage,
  selectedTemplateLabel,
  setSelectedTemplateLabel,
  onSendCustomEmail,
  onOpenPdfModal,
  modalLoading,
}) => {
  const [datePickerVisible, setDatePickerVisible] = useState(false);
  const [currentPickerMonth, setCurrentPickerMonth] = useState(new Date());
  const [templateDropdownVisible, setTemplateDropdownVisible] = useState(false);

  const applyEmailTemplate = (templateKey: string) => {
    const candidateName = selectedApplicant?.user?.name || 'Candidate';
    const activeJobTitle = selectedApplicant?.job?.title || jobTitle || 'Industrial Operator';
    const tpl = EMAIL_TEMPLATES.find((t) => t.key === templateKey);
    if (tpl) {
      setSelectedTemplateLabel(tpl.label);
      setEmailSubject(tpl.subject(activeJobTitle));
      setEmailMessage(tpl.message(candidateName, activeJobTitle));
    }
  };

  const userPhotoUrl = selectedApplicant?.user
    ? (selectedApplicant.user.profile_picture_url || (selectedApplicant.user as any).profilePictureUrl || (selectedApplicant.user as any).avatarUrl || (selectedApplicant.user as any).avatar_url || (selectedApplicant.user as any).avatar || (selectedApplicant.user as any).photo)
    : null;

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
    <>
      <Modal visible={visible} animationType="slide" transparent={false} onRequestClose={onClose}>
        <SafeAreaView style={styles.fullScreenPageContainer}>
          <View style={{ flex: 1 }}>
            {/* Modal Header */}
            <View style={styles.fullPageHeader}>
              <View style={styles.fullPageHeaderTopRow}>
                <View style={styles.modalAvatarBox}>
                  {userPhotoUrl ? (
                    <Image
                      source={{ uri: userPhotoUrl }}
                      style={styles.avatarImg}
                    />
                  ) : (
                    <UserIcon size={18} color="#1764E8" strokeWidth={2} />
                  )}
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.modalCandidateName} numberOfLines={1}>
                    {safeValue(selectedApplicant?.user?.name || 'Applicant Profile')}
                  </Text>
                  <Text style={styles.modalCandidateHeadline} numberOfLines={1}>
                    {safeValue(selectedApplicant?.user?.headline || selectedApplicant?.user?.trade_specialization || 'Technical Candidate')}
                  </Text>
                </View>

                <TouchableOpacity onPress={onClose} style={styles.closeBtn} activeOpacity={0.7}>
                  <X size={15} color="#475569" strokeWidth={2} />
                </TouchableOpacity>
              </View>

              {/* 5-Tab Segmented Control with Clean Active Underline */}
              <View style={styles.menuTabBarWrapperInline}>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.menuTabBarContent}>
                  <TouchableOpacity
                    activeOpacity={0.8}
                    onPress={() => setModalTab('JOB')}
                    style={[styles.menuTabItem, modalTab === 'JOB' && styles.menuTabItemActive]}
                  >
                    <Briefcase size={13} color={modalTab === 'JOB' ? '#1764E8' : '#657796'} />
                    <Text style={[styles.menuTabText, modalTab === 'JOB' && styles.menuTabTextActive]}>Job Info</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    activeOpacity={0.8}
                    onPress={() => setModalTab('CANDIDATE')}
                    style={[styles.menuTabItem, modalTab === 'CANDIDATE' && styles.menuTabItemActive]}
                  >
                    <UserIcon size={13} color={modalTab === 'CANDIDATE' ? '#1764E8' : '#657796'} />
                    <Text style={[styles.menuTabText, modalTab === 'CANDIDATE' && styles.menuTabTextActive]}>Candidate Info</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    activeOpacity={0.8}
                    onPress={() => setModalTab('STATUS')}
                    style={[styles.menuTabItem, modalTab === 'STATUS' && styles.menuTabItemActive]}
                  >
                    <Zap size={13} color={modalTab === 'STATUS' ? '#1764E8' : '#657796'} />
                    <Text style={[styles.menuTabText, modalTab === 'STATUS' && styles.menuTabTextActive]}>Status</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    activeOpacity={0.8}
                    onPress={() => setModalTab('INTERVIEW')}
                    style={[styles.menuTabItem, modalTab === 'INTERVIEW' && styles.menuTabItemActive]}
                  >
                    <Calendar size={13} color={modalTab === 'INTERVIEW' ? '#1764E8' : '#657796'} />
                    <Text style={[styles.menuTabText, modalTab === 'INTERVIEW' && styles.menuTabTextActive]}>Interview</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    activeOpacity={0.8}
                    onPress={() => setModalTab('EMAIL')}
                    style={[styles.menuTabItem, modalTab === 'EMAIL' && styles.menuTabItemActive]}
                  >
                    <Mail size={13} color={modalTab === 'EMAIL' ? '#1764E8' : '#657796'} />
                    <Text style={[styles.menuTabText, modalTab === 'EMAIL' && styles.menuTabTextActive]}>Send Email</Text>
                  </TouchableOpacity>
                </ScrollView>
              </View>
            </View>

            {/* Modal Body Tabs */}
            <ScrollView
              style={styles.modalBodyScroll}
              contentContainerStyle={{ padding: 14, paddingBottom: 64 }}
              showsVerticalScrollIndicator={false}
            >
              {modalTab === 'JOB' ? (
                <ApplicantDetailJobTab
                  selectedApplicant={selectedApplicant}
                  jobDetails={jobDetails}
                  myJobs={myJobs}
                  jobTitle={jobTitle}
                />
              ) : null}

              {modalTab === 'CANDIDATE' ? (
                <ApplicantDetailCandidateTab
                  selectedApplicant={selectedApplicant}
                  onOpenPdfModal={onOpenPdfModal}
                  onSelectEmailTab={() => setModalTab('EMAIL')}
                />
              ) : null}

              {modalTab === 'STATUS' ? (
                <ApplicantDetailStatusTab
                  selectedApplicant={selectedApplicant}
                  jobId={jobId}
                  onUpdateStatus={onUpdateStatus}
                />
              ) : null}

              {modalTab === 'INTERVIEW' ? (
                <ApplicantDetailInterviewTab
                  selectedApplicant={selectedApplicant}
                  interviewMode={interviewMode}
                  setInterviewMode={setInterviewMode}
                  interviewDate={interviewDate}
                  interviewTime={interviewTime}
                  interviewLocation={interviewLocation}
                  setInterviewLocation={setInterviewLocation}
                  interviewNotes={interviewNotes}
                  setInterviewNotes={setInterviewNotes}
                  onScheduleInterview={onScheduleInterview}
                  onOpenDatePicker={() => setDatePickerVisible(true)}
                  onOpenTimePicker={() => setTimePickerVisible(true)}
                  modalLoading={modalLoading}
                />
              ) : null}

              {modalTab === 'EMAIL' ? (
                <ApplicantDetailEmailTab
                  selectedApplicant={selectedApplicant}
                  selectedTemplateLabel={selectedTemplateLabel}
                  onOpenTemplateDropdown={() => setTemplateDropdownVisible(true)}
                  onSelectTemplateKey={applyEmailTemplate}
                  emailSubject={emailSubject}
                  setEmailSubject={setEmailSubject}
                  emailMessage={emailMessage}
                  setEmailMessage={setEmailMessage}
                  onSendCustomEmail={onSendCustomEmail}
                  modalLoading={modalLoading}
                  jobTitle={jobTitle}
                />
              ) : null}
            </ScrollView>
          </View>
        </SafeAreaView>
      </Modal>

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
                      {tpl.message(selectedApplicant?.user?.name || 'Candidate', jobTitle)}
                    </Text>
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  fullScreenPageContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  fullPageHeader: {
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E7EBF2',
  },
  fullPageHeaderTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  modalAvatarBox: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: '#EEF4FF',
    borderWidth: 1,
    borderColor: '#DBEAFE',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  avatarImg: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  modalCandidateName: {
    fontSize: 13.5,
    fontWeight: '700',
    color: '#102A5C',
  },
  modalCandidateHeadline: {
    fontSize: 11,
    color: '#657796',
    fontWeight: '500',
    marginTop: 1,
  },
  closeBtn: {
    width: 30,
    height: 30,
    borderRadius: 6,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuTabBarWrapperInline: {
    paddingHorizontal: 10,
  },
  menuTabBarContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingBottom: 0,
  },
  menuTabItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 4,
    paddingVertical: 8,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
    marginBottom: -1,
  },
  menuTabItemActive: {
    borderBottomColor: '#1764E8',
  },
  menuTabText: {
    fontSize: 11.5,
    fontWeight: '600',
    color: '#657796',
  },
  menuTabTextActive: {
    color: '#1764E8',
    fontWeight: '700',
  },
  modalBodyScroll: {
    flex: 1,
    backgroundColor: '#F7F9FC',
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
