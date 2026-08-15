import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import {
  Building2,
  Zap,
  Phone,
  Calendar,
  Clock,
  ChevronRight,
} from 'lucide-react-native';
import { JobApplication } from '../../../types';
import { Input } from '../../../components/common/Input';
import { Button } from '../../../components/common/Button';
import { COLORS } from '../../../constants/theme';
import { safeValue } from './JobApplicantsUtils';

interface ApplicantDetailInterviewTabProps {
  selectedApplicant: JobApplication | null;
  interviewMode: string;
  setInterviewMode: (mode: string) => void;
  interviewDate: string;
  interviewTime: string;
  interviewLocation: string;
  setInterviewLocation: (loc: string) => void;
  interviewNotes: string;
  setInterviewNotes: (notes: string) => void;
  onScheduleInterview: () => void;
  onOpenDatePicker: () => void;
  onOpenTimePicker: () => void;
  modalLoading: boolean;
}

export const ApplicantDetailInterviewTab: React.FC<ApplicantDetailInterviewTabProps> = ({
  selectedApplicant,
  interviewMode,
  setInterviewMode,
  interviewDate,
  interviewTime,
  interviewLocation,
  setInterviewLocation,
  interviewNotes,
  setInterviewNotes,
  onScheduleInterview,
  onOpenDatePicker,
  onOpenTimePicker,
  modalLoading,
}) => {
  return (
    <View style={styles.modalSectionBox}>
      <Text style={styles.sectionHeadingTitle}>SCHEDULE INTERVIEW INVITE</Text>
      <Text style={styles.infoSectionBody}>
        Invite <Text style={{ fontWeight: '800', color: '#0F172A' }}>{safeValue(selectedApplicant?.user?.name)}</Text> to an official technical interview.
      </Text>

      <View style={[styles.rowDivider, { marginVertical: 14 }]} />

      <Text style={styles.sectionHeadingTitle}>1. SELECT INTERVIEW MODE</Text>
      <View style={styles.modePillRow}>
        {[
          { key: 'In-Person Walk-in', icon: Building2, label: 'In-Person' },
          { key: 'Online Video Call', icon: Zap, label: 'Video Call' },
          { key: 'Phone Screening', icon: Phone, label: 'Phone Call' },
        ].map((item) => {
          const IconComp = item.icon;
          const isSelected = interviewMode === item.key;
          return (
            <TouchableOpacity
              key={item.key}
              activeOpacity={0.8}
              style={[styles.cleanModePillBtn, isSelected && styles.cleanModePillBtnSelected]}
              onPress={() => setInterviewMode(item.key)}
            >
              <IconComp size={14} color={isSelected ? COLORS.primary : '#64748B'} />
              <Text style={[styles.cleanModePillText, isSelected && styles.cleanModePillTextSelected]}>{item.label}</Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <View style={[styles.rowDivider, { marginVertical: 14 }]} />

      <Text style={styles.sectionHeadingTitle}>2. INTERVIEW DETAILS & VENUE</Text>

      <View style={{ marginBottom: 12 }}>
        <Text style={styles.inputLabelStyle}>
          INTERVIEW DATE <Text style={{ color: '#EF4444' }}>*</Text>
        </Text>
        <TouchableOpacity activeOpacity={0.8} onPress={onOpenDatePicker} style={styles.cleanDatePickerTriggerBtn}>
          <Calendar size={16} color={COLORS.primary} />
          <Text style={styles.cleanDatePickerTriggerText}>
            {interviewDate ? new Date(interviewDate + 'T00:00:00').toDateString() : 'Tap to Select Date from Calendar...'}
          </Text>
          <ChevronRight size={16} color="#64748B" />
        </TouchableOpacity>
      </View>

      <View style={{ marginBottom: 12 }}>
        <Text style={styles.inputLabelStyle}>
          INTERVIEW TIME <Text style={{ color: '#EF4444' }}>*</Text>
        </Text>
        <TouchableOpacity activeOpacity={0.8} onPress={onOpenTimePicker} style={styles.cleanDatePickerTriggerBtn}>
          <Clock size={16} color={COLORS.primary} />
          <Text style={styles.cleanDatePickerTriggerText}>{interviewTime || 'Tap to Select Interview Time...'}</Text>
          <ChevronRight size={16} color="#64748B" />
        </TouchableOpacity>
      </View>

      <Input
        label="Venue Address / Video Link"
        placeholder="Factory Gate #2, Waluj MIDC or Google Meet Link"
        value={interviewLocation}
        onChangeText={setInterviewLocation}
      />

      <Input
        label="Instructions / Special Notes for Candidate"
        placeholder="Bring original ITI trade certificate & Aadhaar card."
        value={interviewNotes}
        onChangeText={setInterviewNotes}
      />

      <Button
        title="Schedule & Send Interview Invite"
        onPress={onScheduleInterview}
        loading={modalLoading}
        icon={<Calendar size={16} color="#FFFFFF" />}
        style={{ marginTop: 14, height: 46, borderRadius: 0 }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  modalSectionBox: {
    padding: 16,
  },
  sectionHeadingTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: '#94A3B8',
    letterSpacing: 0.8,
    marginBottom: 6,
  },
  infoSectionBody: {
    fontSize: 13,
    color: '#334155',
    lineHeight: 18,
  },
  rowDivider: {
    height: 1,
    backgroundColor: '#F1F5F9',
  },
  modePillRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 4,
  },
  cleanModePillBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 8,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    backgroundColor: '#FFFFFF',
  },
  cleanModePillBtnSelected: {
    borderColor: COLORS.primary,
    backgroundColor: '#EFF6FF',
  },
  cleanModePillText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
  },
  cleanModePillTextSelected: {
    color: COLORS.primary,
    fontWeight: '700',
  },
  inputLabelStyle: {
    fontSize: 11,
    fontWeight: '800',
    color: '#94A3B8',
    letterSpacing: 0.8,
    marginBottom: 4,
  },
  cleanDatePickerTriggerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: '#FFFFFF',
  },
  cleanDatePickerTriggerText: {
    flex: 1,
    fontSize: 13,
    fontWeight: '600',
    color: '#0F172A',
  },
});
