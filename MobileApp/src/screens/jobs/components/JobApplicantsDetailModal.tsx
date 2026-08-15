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

  const userPhotoUrl = selectedApplicant?.user ? (selectedApplicant.user.profile_picture_url || (selectedApplicant.user as any).profilePhotoUrl) : null;

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
                    <UserIcon size={22} color={COLORS.primary} />
                  )}
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.modalCandidateName} numberOfLines={1}>
                    {safeValue(selectedApplicant?.user?.name || 'Applicant Profile')}
                  </Text>
                  <Text style={styles.modalCandidateHeadline} numberOfLines={1}>
                    {safeValue(selectedApplicant?.user?.headline || selectedApplicant?.user?.trade_specialization)}
                  </Text>
                </View>

                <TouchableOpacity onPress={onClose} style={styles.closeBtn} activeOpacity={0.7}>
                  <X size={20} color={COLORS.slate600} />
                </TouchableOpacity>
              </View>

              {/* 5-Tab Segmented Control */}
              <View style={styles.menuTabBarWrapperInline}>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.menuTabBarContent}>
                  <TouchableOpacity
                    activeOpacity={0.8}
                    onPress={() => setModalTab('JOB')}
                    style={[styles.menuTabItem, modalTab === 'JOB' && styles.menuTabItemActive]}
                  >
                    <Briefcase size={14} color={modalTab === 'JOB' ? COLORS.primary : '#64748B'} />
                    <Text style={[styles.menuTabText, modalTab === 'JOB' && styles.menuTabTextActive]}>Job Info</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    activeOpacity={0.8}
                    onPress={() => setModalTab('CANDIDATE')}
                    style={[styles.menuTabItem, modalTab === 'CANDIDATE' && styles.menuTabItemActive]}
                  >
                    <UserIcon size={14} color={modalTab === 'CANDIDATE' ? COLORS.primary : '#64748B'} />
                    <Text style={[styles.menuTabText, modalTab === 'CANDIDATE' && styles.menuTabTextActive]}>Candidate Info</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    activeOpacity={0.8}
                    onPress={() => setModalTab('STATUS')}
                    style={[styles.menuTabItem, modalTab === 'STATUS' && styles.menuTabItemActive]}
                  >
                    <Zap size={14} color={modalTab === 'STATUS' ? COLORS.primary : '#64748B'} />
                    <Text style={[styles.menuTabText, modalTab === 'STATUS' && styles.menuTabTextActive]}>Status</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    activeOpacity={0.8}
                    onPress={() => setModalTab('INTERVIEW')}
                    style={[styles.menuTabItem, modalTab === 'INTERVIEW' && styles.menuTabItemActive]}
                  >
                    <Calendar size={14} color={modalTab === 'INTERVIEW' ? COLORS.primary : '#64748B'} />
                    <Text style={[styles.menuTabText, modalTab === 'INTERVIEW' && styles.menuTabTextActive]}>Interview</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    activeOpacity={0.8}
                    onPress={() => setModalTab('EMAIL')}
                    style={[styles.menuTabItem, modalTab === 'EMAIL' && styles.menuTabItemActive]}
                  >
                    <Mail size={14} color={modalTab === 'EMAIL' ? COLORS.primary : '#64748B'} />
                    <Text style={[styles.menuTabText, modalTab === 'EMAIL' && styles.menuTabTextActive]}>Send Email</Text>
                  </TouchableOpacity>
                </ScrollView>
              </View>
            </View>

            {/* Modal Body Tabs */}
            <ScrollView style={styles.modalBodyScroll} showsVerticalScrollIndicator={false}>
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
      <Modal visible={datePickerVisible} transparent animationType="fade" onRequestClose={() => setDatePickerVisible(false)}>
        <TouchableOpacity style={styles.datePickerModalOverlay} activeOpacity={1} onPress={() => setDatePickerVisible(false)}>
          <TouchableOpacity activeOpacity={1} style={styles.datePickerModalCard} onPress={(e) => e.stopPropagation()}>
            <View style={styles.calendarHeaderRow}>
              <TouchableOpacity
                style={styles.calendarNavBtn}
                activeOpacity={0.7}
                onPress={() => setCurrentPickerMonth(new Date(currentPickerMonth.getFullYear(), currentPickerMonth.getMonth() - 1, 1))}
              >
                <ChevronLeft size={18} color="#0F172A" />
              </TouchableOpacity>

              <Text style={styles.calendarMonthTitle}>
                {currentPickerMonth.toLocaleString('default', { month: 'long', year: 'numeric' })}
              </Text>

              <TouchableOpacity
                style={styles.calendarNavBtn}
                activeOpacity={0.7}
                onPress={() => setCurrentPickerMonth(new Date(currentPickerMonth.getFullYear(), currentPickerMonth.getMonth() + 1, 1))}
              >
                <ChevronRight size={18} color="#0F172A" />
              </TouchableOpacity>
            </View>

            <View style={styles.calendarWeekRow}>
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((w, idx) => (
                <Text key={idx} style={styles.calendarWeekLabel}>{w}</Text>
              ))}
            </View>

            <View style={styles.calendarGridWrap}>
              {getDaysInMonthGrid(currentPickerMonth).map((dObj, idx) => {
                if (!dObj) return <View key={`emp-${idx}`} style={styles.calendarDayCellEmpty} />;
                const isSelected = interviewDate === dObj.dateStr;
                return (
                  <TouchableOpacity
                    key={dObj.dateStr}
                    disabled={dObj.isPast}
                    activeOpacity={0.7}
                    style={[
                      styles.calendarDayCell,
                      dObj.isPast && styles.calendarDayCellPast,
                      isSelected && styles.calendarDayCellSelected,
                    ]}
                    onPress={() => {
                      setInterviewDate(dObj.dateStr);
                      setDatePickerVisible(false);
                    }}
                  >
                    <Text
                      style={[
                        styles.calendarDayText,
                        dObj.isPast && styles.calendarDayTextPast,
                        isSelected && styles.calendarDayTextSelected,
                      ]}
                    >
                      {dObj.day}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <TouchableOpacity style={styles.calendarCloseBtn} onPress={() => setDatePickerVisible(false)}>
              <Text style={styles.calendarCloseBtnText}>Close Calendar</Text>
            </TouchableOpacity>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>

      {/* Email Template Bottom Sheet */}
      <Modal visible={templateDropdownVisible} transparent animationType="slide" onRequestClose={() => setTemplateDropdownVisible(false)}>
        <TouchableOpacity style={styles.sheetOverlayBottom} activeOpacity={1} onPress={() => setTemplateDropdownVisible(false)}>
          <View style={styles.cleanIosSheetCard}>
            <View style={styles.sheetGrabHandle} />
            <View style={styles.sheetHeaderRow}>
              <View>
                <Text style={styles.sheetTitle}>Select Email Template</Text>
                <Text style={styles.sheetSubtitle}>Choose from standard recruiter templates</Text>
              </View>
              <TouchableOpacity onPress={() => setTemplateDropdownVisible(false)} style={styles.closeHeaderBtn}>
                <X size={16} color="#64748B" />
              </TouchableOpacity>
            </View>

            <ScrollView style={{ maxHeight: 300 }}>
              {EMAIL_TEMPLATES.map((tpl) => (
                <TouchableOpacity
                  key={tpl.key}
                  style={styles.cleanIosDropdownOptionRow}
                  onPress={() => {
                    applyEmailTemplate(tpl.key);
                    setTemplateDropdownVisible(false);
                  }}
                >
                  <View style={styles.dropdownIconBadge}>
                    <FileText size={16} color={COLORS.primary} />
                  </View>
                  <View style={{ flex: 1, marginLeft: 10 }}>
                    <Text style={styles.cleanStatusOptionText}>{tpl.label}</Text>
                    <Text style={styles.cleanStatusOptionDesc}>{tpl.desc}</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </TouchableOpacity>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  fullScreenPageContainer: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  fullPageHeader: {
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#CBD5E1',
    paddingTop: 10,
    paddingBottom: 4,
  },
  fullPageHeaderTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 8,
    gap: 10,
  },
  modalAvatarBox: {
    width: 44,
    height: 44,
    borderRadius: 8,
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#BFDBFE',
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
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
  },
  modalCandidateHeadline: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 1,
  },
  closeBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuTabBarWrapperInline: {
    paddingHorizontal: 12,
  },
  menuTabBarContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingBottom: 4,
  },
  menuTabItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 0,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  menuTabItemActive: {
    borderBottomColor: COLORS.primary,
    backgroundColor: '#EFF6FF',
  },
  menuTabText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
  },
  menuTabTextActive: {
    color: COLORS.primary,
    fontWeight: '800',
  },
  modalBodyScroll: {
    flex: 1,
    padding: 14,
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
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    padding: 16,
  },
  calendarHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  calendarNavBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    alignItems: 'center',
    justifyContent: 'center',
  },
  calendarMonthTitle: {
    fontSize: 14.5,
    fontWeight: '800',
    color: '#0F172A',
  },
  calendarWeekRow: {
    flexDirection: 'row',
    marginBottom: 6,
  },
  calendarWeekLabel: {
    flex: 1,
    textAlign: 'center',
    fontSize: 11,
    fontWeight: '800',
    color: '#94A3B8',
  },
  calendarGridWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  calendarDayCellEmpty: {
    width: '14.28%',
    height: 36,
  },
  calendarDayCell: {
    width: '14.28%',
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    marginVertical: 2,
  },
  calendarDayCellSelected: {
    backgroundColor: COLORS.primary,
  },
  calendarDayCellPast: {
    opacity: 0.35,
  },
  calendarDayText: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#0F172A',
  },
  calendarDayTextSelected: {
    color: '#FFFFFF',
    fontWeight: '900',
  },
  calendarDayTextPast: {
    color: '#94A3B8',
  },
  calendarCloseBtn: {
    marginTop: 14,
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: 'center',
  },
  calendarCloseBtnText: {
    fontSize: 12.5,
    fontWeight: '800',
    color: '#334155',
  },
  sheetOverlayBottom: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    justifyContent: 'flex-end',
  },
  cleanIosSheetCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 0,
    borderTopWidth: 1,
    borderTopColor: '#CBD5E1',
    paddingHorizontal: 18,
    paddingTop: 10,
    paddingBottom: 24,
    width: '100%',
  },
  sheetGrabHandle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#CBD5E1',
    alignSelf: 'center',
    marginBottom: 12,
  },
  sheetHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  sheetTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
  },
  sheetSubtitle: {
    fontSize: 11.5,
    fontWeight: '500',
    color: '#64748B',
    marginTop: 1,
  },
  closeHeaderBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cleanIosDropdownOptionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 4,
  },
  dropdownIconBadge: {
    width: 32,
    height: 32,
    borderRadius: 0,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cleanStatusOptionText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
  },
  cleanStatusOptionDesc: {
    fontSize: 11,
    fontWeight: '500',
    color: '#64748B',
    marginTop: 1,
  },
});
