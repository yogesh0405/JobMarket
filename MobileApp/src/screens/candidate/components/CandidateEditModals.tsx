import React from 'react';
import {
  View,
  Text,
  Modal,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
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
  expDuration: string;
  setExpDuration: (val: string) => void;
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
  expDuration,
  setExpDuration,
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

      {/* Add Experience Modal */}
      <Modal visible={expModalOpen} transparent animationType="slide" onRequestClose={onCloseExpModal}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Add Work Experience</Text>
            <Input label="Job Title" placeholder="e.g. VMC Operator" value={expTitle} onChangeText={setExpTitle} />
            <Input label="Company Name" placeholder="e.g. Bajaj Auto MIDC Waluj" value={expCompany} onChangeText={setExpCompany} />
            <Input label="Duration" placeholder="e.g. 2 Years (2021-2023)" value={expDuration} onChangeText={setExpDuration} />
            <Input label="Job Description" placeholder="Describe duties..." multiline value={expDesc} onChangeText={setExpDesc} />
            <View style={{ flexDirection: 'row', gap: 10, marginTop: 10 }}>
              <Button title="Cancel" variant="outline" onPress={onCloseExpModal} style={{ flex: 1 }} />
              <Button title="Add Entry" onPress={onAddExperience} style={{ flex: 1 }} />
            </View>
          </View>
        </View>
      </Modal>

      {/* Add Education Modal */}
      <Modal visible={eduModalOpen} transparent animationType="slide" onRequestClose={onCloseEduModal}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Add Education / ITI Certificate</Text>
            <Input label="Degree / Trade Certificate" placeholder="e.g. ITI Fitter" value={eduDegree} onChangeText={setEduDegree} />
            <Input label="Institute / College" placeholder="e.g. Govt ITI Aurangabad" value={eduInstitution} onChangeText={setEduInstitution} />
            <Input label="Passing Year" placeholder="e.g. 2022" keyboardType="numeric" value={eduYear} onChangeText={setEduYear} />
            <View style={{ flexDirection: 'row', gap: 10, marginTop: 10 }}>
              <Button title="Cancel" variant="outline" onPress={onCloseEduModal} style={{ flex: 1 }} />
              <Button title="Add Entry" onPress={onAddEducation} style={{ flex: 1 }} />
            </View>
          </View>
        </View>
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
});
