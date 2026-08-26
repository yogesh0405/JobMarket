import React from 'react';
import {
  View,
  Text,
  Modal,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Calendar, ChevronLeft, ChevronRight, Clock, Check } from 'lucide-react-native';
import { Input } from '../../../components/common/Input';
import { Button } from '../../../components/common/Button';
import { ResumePdfViewerModal } from '../../../components/common/ResumePdfViewerModal';
import { TRADES, SHIFTS } from './CandidateEditConstants';

interface CandidateEditModalsProps {
  tradeModalOpen: boolean;
  onCloseTradeModal: () => void;
  onSelectTrade: (trade: string) => void;

  shiftModalOpen: boolean;
  onCloseShiftModal: () => void;
  onSelectShift: (shift: string) => void;

  expModalOpen: boolean;
  onCloseExpModal: () => void;
  expTitle: string;
  setExpTitle: (val: string) => void;
  expCompany: string;
  setExpCompany: (val: string) => void;
  expStartYear: string;
  setExpStartYear: (val: string) => void;
  expEndYear: string;
  setExpEndYear: (val: string) => void;
  expIsCurrent: boolean;
  setExpIsCurrent: (val: boolean) => void;
  expDesc: string;
  setExpDesc: (val: string) => void;
  onAddExperience: () => void;

  eduModalOpen: boolean;
  onCloseEduModal: () => void;
  eduDegree: string;
  setEduDegree: (val: string) => void;
  eduInstitution: string;
  setEduInstitution: (val: string) => void;
  eduYear: string;
  setEduYear: (val: string) => void;
  onAddEducation: () => void;

  showPdfModal: boolean;
  onClosePdfModal: () => void;
  candidateName: string;
  candidateRole: string;
  pdfUrl: string;
}

export const CandidateEditModals: React.FC<CandidateEditModalsProps> = ({
  tradeModalOpen,
  onCloseTradeModal,
  onSelectTrade,

  shiftModalOpen,
  onCloseShiftModal,
  onSelectShift,

  expModalOpen,
  onCloseExpModal,
  expTitle,
  setExpTitle,
  expCompany,
  setExpCompany,
  expStartYear,
  setExpStartYear,
  expEndYear,
  setExpEndYear,
  expIsCurrent,
  setExpIsCurrent,
  expDesc,
  setExpDesc,
  onAddExperience,

  eduModalOpen,
  onCloseEduModal,
  eduDegree,
  setEduDegree,
  eduInstitution,
  setEduInstitution,
  eduYear,
  setEduYear,
  onAddEducation,

  showPdfModal,
  onClosePdfModal,
  candidateName,
  candidateRole,
  pdfUrl,
}) => {
  const currentSelectedYear = eduYear || String(new Date().getFullYear());

  const startNum = parseInt(expStartYear || '2022', 10);
  const endNum = expIsCurrent ? new Date().getFullYear() : parseInt(expEndYear || String(new Date().getFullYear()), 10);
  const diffYears = Math.max(endNum - startNum, 0);
  const diffText = diffYears === 0 ? '< 1 Year' : diffYears === 1 ? '1 Year' : `${diffYears} Years`;
  const calcDurationStr = `${diffText} (${startNum} - ${expIsCurrent ? 'Present' : endNum})`;

  return (
    <>
      {/* Trade Selector Modal */}
      <Modal visible={tradeModalOpen} transparent animationType="fade" onRequestClose={onCloseTradeModal}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Select Trade Specialization</Text>
            <ScrollView style={{ maxHeight: 300 }}>
              {TRADES.map((t) => (
                <TouchableOpacity
                  key={t}
                  style={styles.modalOptionRow}
                  onPress={() => onSelectTrade(t)}
                >
                  <Text style={styles.modalOptionText}>{t}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Shift Selector Modal */}
      <Modal visible={shiftModalOpen} transparent animationType="fade" onRequestClose={onCloseShiftModal}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Select Preferred Shift</Text>
            {SHIFTS.map((s) => (
              <TouchableOpacity
                key={s}
                style={styles.modalOptionRow}
                onPress={() => onSelectShift(s)}
              >
                <Text style={styles.modalOptionText}>{s}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </Modal>

      {/* Add Experience Modal with Start & End Year Controls */}
      <Modal visible={expModalOpen} transparent animationType="slide" onRequestClose={onCloseExpModal}>
        <KeyboardAvoidingView
          style={styles.modalOverlay}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <ScrollView
            contentContainerStyle={styles.modalScrollContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.modalCard}>
              <Text style={styles.modalTitle}>Add Work Experience</Text>
              <Input label="Job Title" placeholder="e.g. VMC Operator" value={expTitle} onChangeText={setExpTitle} />
              <Input label="Company Name" placeholder="e.g. Bajaj Auto MIDC Waluj" value={expCompany} onChangeText={setExpCompany} />
              
              {/* Start Year & End Year side-by-side inputs (Matching provided reference design) */}
              <View style={styles.dateRow}>
                {/* Start Year */}
                <View style={styles.dateCol}>
                  <Text style={styles.dateLabel}>
                    Start Year <Text style={styles.required}>*</Text>
                  </Text>
                  <View style={styles.dateInputBox}>
                    <TouchableOpacity
                      style={styles.dateStepBtn}
                      activeOpacity={0.7}
                      onPress={() => {
                        const y = parseInt(expStartYear || '2022', 10);
                        if (y > 1970) setExpStartYear(String(y - 1));
                      }}
                    >
                      <ChevronLeft size={16} color="#64748B" />
                    </TouchableOpacity>

                    <View style={styles.dateValueRow}>
                      <Calendar size={14} color="#0284C7" />
                      <Text style={styles.dateValueText}>{expStartYear || '2022'}</Text>
                    </View>

                    <TouchableOpacity
                      style={styles.dateStepBtn}
                      activeOpacity={0.7}
                      onPress={() => {
                        const y = parseInt(expStartYear || '2022', 10);
                        const maxYear = new Date().getFullYear();
                        if (y < maxYear) setExpStartYear(String(y + 1));
                      }}
                    >
                      <ChevronRight size={16} color="#64748B" />
                    </TouchableOpacity>
                  </View>
                </View>

                {/* End Year */}
                <View style={styles.dateCol}>
                  <Text style={styles.dateLabel}>
                    End Year <Text style={styles.required}>*</Text>
                  </Text>
                  <View style={[styles.dateInputBox, expIsCurrent && styles.dateInputBoxDisabled]}>
                    <TouchableOpacity
                      style={styles.dateStepBtn}
                      activeOpacity={0.7}
                      disabled={expIsCurrent}
                      onPress={() => {
                        const y = parseInt(expEndYear || String(new Date().getFullYear()), 10);
                        const startY = parseInt(expStartYear || '2022', 10);
                        if (y > startY) setExpEndYear(String(y - 1));
                      }}
                    >
                      <ChevronLeft size={16} color={expIsCurrent ? '#CBD5E1' : '#64748B'} />
                    </TouchableOpacity>

                    <View style={styles.dateValueRow}>
                      <Calendar size={14} color={expIsCurrent ? '#94A3B8' : '#0284C7'} />
                      <Text style={[styles.dateValueText, expIsCurrent && { color: '#0284C7', fontWeight: '800' }]}>
                        {expIsCurrent ? 'Present' : (expEndYear || String(new Date().getFullYear()))}
                      </Text>
                    </View>

                    <TouchableOpacity
                      style={styles.dateStepBtn}
                      activeOpacity={0.7}
                      disabled={expIsCurrent}
                      onPress={() => {
                        const y = parseInt(expEndYear || String(new Date().getFullYear()), 10);
                        const maxYear = new Date().getFullYear() + 1;
                        if (y < maxYear) setExpEndYear(String(y + 1));
                      }}
                    >
                      <ChevronRight size={16} color={expIsCurrent ? '#CBD5E1' : '#64748B'} />
                    </TouchableOpacity>
                  </View>
                </View>
              </View>

              {/* Currently Working Toggle */}
              <TouchableOpacity
                activeOpacity={0.75}
                style={styles.currentWorkRow}
                onPress={() => setExpIsCurrent(!expIsCurrent)}
              >
                <View style={[styles.checkboxBox, expIsCurrent && styles.checkboxBoxActive]}>
                  {expIsCurrent && <Check size={12} color="#FFFFFF" strokeWidth={3} />}
                </View>
                <Text style={styles.currentWorkText}>Currently working in this factory / role</Text>
              </TouchableOpacity>

              {/* Calculated Experience Duration Badge (Matching screenshot design) */}
              <View style={styles.calculatedDurationBadge}>
                <Clock size={13} color="#0284C7" />
                <Text style={styles.calculatedDurationText}>
                  Calculated Experience: {calcDurationStr}
                </Text>
              </View>

              <Input label="Job Description / Responsibilities" placeholder="Describe duties, machines operated..." multiline value={expDesc} onChangeText={setExpDesc} />
              <View style={{ flexDirection: 'row', gap: 10, marginTop: 10 }}>
                <Button title="Cancel" variant="outline" onPress={onCloseExpModal} style={{ flex: 1 }} />
                <Button title="Add Entry" onPress={onAddExperience} style={{ flex: 1 }} />
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </Modal>

      {/* Add Education Modal with Compact Inline Year Spinner */}
      <Modal visible={eduModalOpen} transparent animationType="slide" onRequestClose={onCloseEduModal}>
        <KeyboardAvoidingView
          style={styles.modalOverlay}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <ScrollView
            contentContainerStyle={styles.modalScrollContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.modalCard}>
              <Text style={styles.modalTitle}>Add Education / ITI Certificate</Text>
              <Input label="Degree / Trade Certificate" placeholder="e.g. ITI Fitter" value={eduDegree} onChangeText={setEduDegree} />
              <Input label="Institute / College" placeholder="e.g. Govt ITI Aurangabad" value={eduInstitution} onChangeText={setEduInstitution} />
              
              {/* Inline Year Spinner Stepper (No Large Popup) */}
              <View style={styles.formGroup}>
                <Text style={styles.inputLabel}>
                  Passing Year / Year of Completion <Text style={styles.required}>*</Text>
                </Text>
                
                <View style={styles.spinnerContainer}>
                  <TouchableOpacity
                    style={styles.spinnerStepBtn}
                    activeOpacity={0.7}
                    onPress={() => {
                      const yrNum = parseInt(currentSelectedYear, 10);
                      if (yrNum > 1970) {
                        setEduYear(String(yrNum - 1));
                      }
                    }}
                  >
                    <ChevronLeft size={20} color="#0F172A" />
                  </TouchableOpacity>

                  <View style={styles.spinnerValueBox}>
                    <Calendar size={15} color="#0284C7" />
                    <Text style={styles.spinnerYearText}>{currentSelectedYear}</Text>
                  </View>

                  <TouchableOpacity
                    style={styles.spinnerStepBtn}
                    activeOpacity={0.7}
                    onPress={() => {
                      const yrNum = parseInt(currentSelectedYear, 10);
                      const maxYear = new Date().getFullYear() + 4;
                      if (yrNum < maxYear) {
                        setEduYear(String(yrNum + 1));
                      }
                    }}
                  >
                    <ChevronRight size={20} color="#0F172A" />
                  </TouchableOpacity>
                </View>
              </View>

              <View style={{ flexDirection: 'row', gap: 10, marginTop: 10 }}>
                <Button title="Cancel" variant="outline" onPress={onCloseEduModal} style={{ flex: 1 }} />
                <Button title="Add Entry" onPress={onAddEducation} style={{ flex: 1 }} />
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </Modal>

      {/* PDF Resume Viewer Modal */}
      <ResumePdfViewerModal
        visible={showPdfModal}
        onClose={onClosePdfModal}
        candidateName={candidateName}
        candidateRole={candidateRole}
        pdfUrl={pdfUrl}
      />
    </>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    justifyContent: 'center',
  },
  modalScrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
  },
  modalCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 16,
    gap: 10,
  },
  modalTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 4,
  },
  modalOptionRow: {
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  modalOptionText: {
    fontSize: 13.5,
    fontWeight: '600',
    color: '#334155',
  },
  formGroup: {
    marginBottom: 6,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#334155',
    marginBottom: 6,
  },
  required: {
    color: '#DC2626',
  },
  spinnerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 6,
    height: 44,
    paddingHorizontal: 4,
  },
  spinnerStepBtn: {
    width: 38,
    height: 36,
    borderRadius: 5,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  spinnerValueBox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  spinnerYearText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 4,
  },
  dateCol: {
    flex: 1,
  },
  dateLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#334155',
    marginBottom: 6,
  },
  dateInputBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 8,
    height: 46,
    paddingHorizontal: 4,
  },
  dateInputBoxDisabled: {
    backgroundColor: '#F8FAFC',
    borderColor: '#E2E8F0',
  },
  dateStepBtn: {
    width: 32,
    height: 34,
    borderRadius: 6,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dateValueRow: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  dateValueText: {
    fontSize: 13.5,
    fontWeight: '700',
    color: '#0F172A',
  },
  currentWorkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 4,
    marginTop: -2,
  },
  checkboxBox: {
    width: 18,
    height: 18,
    borderRadius: 4,
    borderWidth: 1.5,
    borderColor: '#94A3B8',
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxBoxActive: {
    backgroundColor: '#0284C7',
    borderColor: '#0284C7',
  },
  currentWorkText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#475569',
  },
  calculatedDurationBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#BFDBFE',
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 7,
    marginTop: 2,
    marginBottom: 4,
  },
  calculatedDurationText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0284C7',
  },
});
