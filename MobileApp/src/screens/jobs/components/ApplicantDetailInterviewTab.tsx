import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import {
  Building2,
  Zap,
  Phone,
  Calendar,
  Clock,
  ChevronRight,
  Send,
  Sparkles,
} from 'lucide-react-native';
import { JobApplication } from '../../../types';
import { Input } from '../../../components/common/Input';
import { Button } from '../../../components/common/Button';
import { RADIUS } from '../../../constants/theme';
import { safeValue } from './JobApplicantsUtils';

interface ApplicantDetailInterviewTabProps {
  selectedApplicant: JobApplication | null;
  interviewMode: string;
  setInterviewMode: (mode: string) => void;
  interviewDate: string;
  interviewTime: string;
  setInterviewTime?: (t: string) => void;
  interviewLocation: string;
  setInterviewLocation: (loc: string) => void;
  interviewMapsLink: string;
  setInterviewMapsLink: (link: string) => void;
  interviewNotes: string;
  setInterviewNotes: (notes: string) => void;
  onScheduleInterview: () => void;
  onOpenDatePicker: () => void;
  onOpenTimePicker: () => void;
  modalLoading: boolean;
}

const POPULAR_SLOTS = ['10:00 AM', '11:30 AM', '02:30 PM', '04:00 PM'];

export const ApplicantDetailInterviewTab: React.FC<ApplicantDetailInterviewTabProps> = ({
  selectedApplicant,
  interviewMode,
  setInterviewMode,
  interviewDate,
  interviewTime,
  setInterviewTime,
  interviewLocation,
  setInterviewLocation,
  interviewMapsLink,
  setInterviewMapsLink,
  interviewNotes,
  setInterviewNotes,
  onScheduleInterview,
  onOpenDatePicker,
  onOpenTimePicker,
  modalLoading,
}) => {
  return (
    <View style={styles.container}>
      <View style={styles.sectionCard}>
        <Text style={styles.sectionHeadingTitle}>SCHEDULE TECHNICAL INTERVIEW</Text>
        <Text style={styles.infoSectionBody}>
          Send an official interview invitation to <Text style={{ fontWeight: '700', color: '#102A5C' }}>{safeValue(selectedApplicant?.user?.name)}</Text>.
        </Text>

        <View style={styles.sectionDivider} />

        {/* 1. Interview Mode */}
        <Text style={styles.sectionHeadingTitle}>1. INTERVIEW MODE</Text>
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
                activeOpacity={0.75}
                style={[styles.cleanModePillBtn, isSelected && styles.cleanModePillBtnSelected]}
                onPress={() => setInterviewMode(item.key)}
              >
                <IconComp size={13} color={isSelected ? '#1764E8' : '#657796'} />
                <Text style={[styles.cleanModePillText, isSelected && styles.cleanModePillTextSelected]}>
                  {item.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <View style={styles.sectionDivider} />

        {/* 2. Date & Time Selection */}
        <Text style={styles.sectionHeadingTitle}>2. DATE & TIME SELECTION</Text>

        {/* Date Field */}
        <View style={{ marginBottom: 10 }}>
          <Text style={styles.inputLabelStyle}>
            Interview Date <Text style={{ color: '#EF4444' }}>*</Text>
          </Text>
          <TouchableOpacity activeOpacity={0.8} onPress={onOpenDatePicker} style={styles.cleanDatePickerTriggerBtn}>
            <Calendar size={15} color="#1764E8" strokeWidth={1.8} />
            <Text style={styles.cleanDatePickerTriggerText}>
              {interviewDate ? new Date(interviewDate + 'T00:00:00').toDateString() : 'Tap to select interview date...'}
            </Text>
            <ChevronRight size={14} color="#91A0BA" />
          </TouchableOpacity>
        </View>

        {/* Time Field & Quick Slots */}
        <View style={{ marginBottom: 10 }}>
          <Text style={styles.inputLabelStyle}>
            Interview Time <Text style={{ color: '#EF4444' }}>*</Text>
          </Text>

          {/* Quick slot chips */}
          <View style={styles.quickSlotsWrap}>
            {POPULAR_SLOTS.map((slot) => {
              const isSelected = interviewTime === slot;
              return (
                <TouchableOpacity
                  key={slot}
                  activeOpacity={0.75}
                  style={[styles.quickSlotChip, isSelected && styles.quickSlotChipSelected]}
                  onPress={() => setInterviewTime?.(slot)}
                >
                  <Text style={[styles.quickSlotChipText, isSelected && styles.quickSlotChipTextSelected]}>
                    {slot}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Custom Time Trigger */}
          <TouchableOpacity activeOpacity={0.8} onPress={onOpenTimePicker} style={styles.cleanDatePickerTriggerBtn}>
            <Clock size={15} color="#1764E8" strokeWidth={1.8} />
            <Text style={styles.cleanDatePickerTriggerText}>
              {interviewTime ? `Selected: ${interviewTime}` : 'Choose Custom Time...'}
            </Text>
            <ChevronRight size={14} color="#91A0BA" />
          </TouchableOpacity>
        </View>

        <View style={styles.sectionDivider} />

        {/* 3. Venue & Instructions */}
        <Text style={styles.sectionHeadingTitle}>3. VENUE & INSTRUCTIONS</Text>

        <Input
          label="Venue Address *"
          placeholder="e.g. Factory Gate #2, Waluj MIDC, CSN"
          value={interviewLocation}
          onChangeText={setInterviewLocation}
        />

        <Input
          label="Google Maps Location Link *"
          placeholder="e.g. https://maps.app.goo.gl/... or https://maps.google.com/..."
          value={interviewMapsLink}
          onChangeText={setInterviewMapsLink}
          keyboardType="url"
          autoCapitalize="none"
        />

        <Input
          label="Instructions for Candidate"
          placeholder="Bring original ITI trade certificate & Aadhaar card."
          value={interviewNotes}
          onChangeText={setInterviewNotes}
        />

        <Button
          title="Schedule & Send Invite"
          onPress={onScheduleInterview}
          loading={modalLoading}
          icon={<Send size={14} color="#FFFFFF" />}
          style={styles.scheduleBtn}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 14,
  },
  sectionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: RADIUS.card,
    borderWidth: 1,
    borderColor: '#E7EBF2',
    padding: 14,
    shadowColor: '#142A50',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  sectionHeadingTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: '#657796',
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  infoSectionBody: {
    fontSize: 12.5,
    color: '#657796',
    lineHeight: 18,
  },
  sectionDivider: {
    height: 1,
    backgroundColor: '#E7EBF2',
    marginVertical: 12,
  },
  modePillRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 2,
  },
  cleanModePillBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    height: 38,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    backgroundColor: '#F8FAFC',
  },
  cleanModePillBtnSelected: {
    borderColor: '#1764E8',
    backgroundColor: '#EFF6FF',
  },
  cleanModePillText: {
    fontSize: 11.5,
    fontWeight: '600',
    color: '#657796',
  },
  cleanModePillTextSelected: {
    color: '#1764E8',
    fontWeight: '700',
  },
  inputLabelStyle: {
    fontSize: 11,
    fontWeight: '600',
    color: '#657796',
    marginBottom: 5,
  },
  quickSlotsWrap: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 6,
  },
  quickSlotChip: {
    flex: 1,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    backgroundColor: '#F8FAFC',
  },
  quickSlotChipSelected: {
    backgroundColor: '#EFF6FF',
    borderColor: '#1764E8',
  },
  quickSlotChipText: {
    fontSize: 10.5,
    fontWeight: '600',
    color: '#334155',
  },
  quickSlotChipTextSelected: {
    color: '#1764E8',
    fontWeight: '700',
  },
  cleanDatePickerTriggerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 6,
    paddingHorizontal: 12,
    height: 42,
  },
  cleanDatePickerTriggerText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#102A5C',
    flex: 1,
    marginLeft: 8,
  },
  scheduleBtn: {
    marginTop: 14,
    height: 42,
    borderRadius: 6,
    backgroundColor: '#1764E8',
  },
});
