import React from 'react';
import { View, Text, TouchableOpacity, Switch, TextInput, StyleSheet } from 'react-native';
import { ChevronDown, Plus, Trash2 } from 'lucide-react-native';
import { COLORS } from '../../../constants/theme';

interface CandidateEditStep3ExperienceProps {
  experience: any[];
  preferredShift: string;
  requiresBus: boolean;
  setRequiresBus: (val: boolean) => void;
  requiresAccommodation: boolean;
  setRequiresAccommodation: (val: boolean) => void;
  availableInDays: number;
  setAvailableInDays: (val: number) => void;
  onOpenExpModal: () => void;
  onOpenShiftModal: () => void;
  onRemoveExperience: (index: number) => void;
}

export const CandidateEditStep3Experience: React.FC<CandidateEditStep3ExperienceProps> = ({
  experience,
  preferredShift,
  requiresBus,
  setRequiresBus,
  requiresAccommodation,
  setRequiresAccommodation,
  availableInDays,
  setAvailableInDays,
  onOpenExpModal,
  onOpenShiftModal,
  onRemoveExperience,
}) => {
  return (
    <View style={styles.masterEditCard}>
      <View style={styles.cardHeaderRow}>
        <View style={{ flex: 1 }}>
          <Text style={styles.cardHeaderTitle}>Work Experience & Shift</Text>
          <Text style={styles.cardHeaderSub}>Enter past factory experience & work shift preferences</Text>
        </View>
      </View>

      <View style={styles.sectionBlock}>
        <View style={styles.sectionHeaderRow}>
          <Text style={[styles.sectionTitleText, { flex: 1 }]}>Work Experience History</Text>
          <TouchableOpacity style={styles.addBtnSmall} onPress={onOpenExpModal}>
            <Plus size={14} color={COLORS.primary} />
            <Text style={styles.addBtnSmallText}>Add Entry</Text>
          </TouchableOpacity>
        </View>

        <View style={{ marginTop: 6 }}>
          {experience.length === 0 ? (
            <Text style={styles.emptySubText}>No work experience entries added yet.</Text>
          ) : (
            experience.map((item, idx) => (
              <View key={idx} style={styles.itemRowCard}>
                <View style={styles.experienceBlueDot} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.itemRowTitle}>{item.title}</Text>
                  <Text style={styles.itemRowSub}>{item.company}</Text>
                  <Text style={styles.itemRowDuration}>
                    {item.duration || (item.startYear ? `${item.startYear} - ${item.endYear || 'Present'}` : '')}
                  </Text>
                  {item.description ? <Text style={styles.itemRowDesc}>{item.description}</Text> : null}
                </View>
                <TouchableOpacity
                  activeOpacity={0.7}
                  style={styles.deleteBtnBox}
                  hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                  onPress={() => onRemoveExperience(idx)}
                >
                  <Trash2 size={16} color="#DC2626" />
                </TouchableOpacity>
              </View>
            ))
          )}
        </View>
      </View>

      <View style={styles.sectionDividerSlate} />

      <View style={styles.sectionBlock}>
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitleText}>Shift & Facility Preferences</Text>
        </View>

        <View style={{ gap: 10 }}>
          <Text style={styles.inputLabel}>Preferred Shift <Text style={{ color: '#DC2626' }}>*</Text></Text>
          <TouchableOpacity
            activeOpacity={0.8}
            style={styles.dropdownPickerRow}
            onPress={onOpenShiftModal}
          >
            <Text style={styles.dropdownPickerText}>{preferredShift}</Text>
            <ChevronDown size={16} color="#94A3B8" />
          </TouchableOpacity>

          <View style={styles.toggleRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.toggleTitle}>Requires Bus Transport</Text>
              <Text style={styles.toggleDesc}>Company bus pickup/drop facility needed</Text>
            </View>
            <Switch value={requiresBus} onValueChange={setRequiresBus} trackColor={{ true: COLORS.primary }} />
          </View>

          <View style={styles.toggleRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.toggleTitle}>Requires Hostel Stay</Text>
              <Text style={styles.toggleDesc}>Accommodation / Hostel room facility needed</Text>
            </View>
            <Switch value={requiresAccommodation} onValueChange={setRequiresAccommodation} trackColor={{ true: COLORS.primary }} />
          </View>

          {/* Availability to Join in Days */}
          <View style={{ marginTop: 6, paddingTop: 10, borderTopWidth: 1, borderTopColor: '#E2E8F0' }}>
            <Text style={styles.inputLabel}>
              Available to Join In (Days) <Text style={{ color: '#DC2626' }}>*</Text>
            </Text>
            <Text style={{ fontSize: 11.5, color: '#64748B', marginTop: 2, marginBottom: 8 }}>
              How many days will you take to join after job selection? (0 = Immediately Available).
            </Text>

            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 8 }}>
              {[
                { label: 'Immediate (0d)', days: 0 },
                { label: '7 Days', days: 7 },
                { label: '15 Days', days: 15 },
                { label: '30 Days', days: 30 },
                { label: '45 Days', days: 45 },
                { label: '60 Days', days: 60 },
              ].map((opt) => {
                const isSelected = availableInDays === opt.days;
                return (
                  <TouchableOpacity
                    key={opt.days}
                    activeOpacity={0.7}
                    onPress={() => setAvailableInDays(opt.days)}
                    style={[
                      styles.availChip,
                      isSelected && styles.availChipSelected,
                    ]}
                  >
                    <Text style={[styles.availChipText, isSelected && styles.availChipTextSelected]}>
                      {opt.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <TextInput
                keyboardType="numeric"
                value={String(availableInDays)}
                onChangeText={(text) => {
                  const cleaned = text.replace(/[^0-9]/g, '');
                  setAvailableInDays(cleaned ? Math.min(180, parseInt(cleaned, 10)) : 0);
                }}
                placeholder="0"
                placeholderTextColor="#94A3B8"
                style={styles.daysInput}
              />
              <Text style={{ fontSize: 12.5, color: '#334155', fontWeight: '600' }}>
                Days ({availableInDays === 0 ? 'Immediately Available' : `Available in ${availableInDays} Days`})
              </Text>
            </View>
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  masterEditCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    padding: 16,
    marginBottom: 14,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  cardHeaderTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
  },
  cardHeaderSub: {
    fontSize: 11.5,
    color: '#64748B',
    marginTop: 2,
  },
  sectionDividerSlate: {
    height: 1,
    backgroundColor: '#E2E8F0',
    marginVertical: 14,
  },
  sectionBlock: {},
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  sectionTitleText: {
    fontSize: 13.5,
    fontWeight: '800',
    color: '#0F172A',
  },
  dropdownPickerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 6,
    paddingHorizontal: 12,
    height: 42,
    backgroundColor: '#FFFFFF',
  },
  dropdownPickerText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#0F172A',
  },
  addBtnSmall: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    backgroundColor: '#EFF6FF',
  },
  addBtnSmallText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: COLORS.primary,
  },
  emptySubText: {
    fontSize: 12,
    color: '#94A3B8',
    fontStyle: 'italic',
  },
  itemRowCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 6,
  },
  itemRowTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
  },
  itemRowSub: {
    fontSize: 11.5,
    color: '#64748B',
  },
  itemRowDuration: {
    fontSize: 11,
    color: '#94A3B8',
  },
  itemRowDesc: {
    fontSize: 11.5,
    color: '#475569',
    marginTop: 2,
  },
  experienceBlueDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.primary,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#334155',
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 6,
  },
  toggleTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
  },
  toggleDesc: {
    fontSize: 11,
    color: '#64748B',
  },
  deleteBtnBox: {
    width: 36,
    height: 36,
    borderRadius: 6,
    backgroundColor: '#FEE2E2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  availChip: {
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 0,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    backgroundColor: '#FFFFFF',
  },
  availChipSelected: {
    borderColor: '#2563EB',
    backgroundColor: '#EFF6FF',
  },
  availChipText: {
    fontSize: 11.5,
    color: '#334155',
    fontWeight: '500',
  },
  availChipTextSelected: {
    color: '#1D4ED8',
    fontWeight: '700',
  },
  daysInput: {
    width: 72,
    height: 38,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 0,
    paddingHorizontal: 8,
    fontSize: 13.5,
    color: '#0F172A',
    backgroundColor: '#FFFFFF',
  },
});
