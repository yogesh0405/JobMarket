import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { ChevronDown, Plus, Trash2 } from 'lucide-react-native';
import { Input } from '../../../components/common/Input';
import { COLORS } from '../../../constants/theme';

interface CandidateEditStep2EducationProps {
  tradeSpecialization: string;
  isOtherSelected: boolean;
  customTrade: string;
  setCustomTrade: (val: string) => void;
  education: any[];
  onOpenTradeModal: () => void;
  onOpenEduModal: () => void;
  onRemoveEducation: (index: number) => void;
}

export const CandidateEditStep2Education: React.FC<CandidateEditStep2EducationProps> = ({
  tradeSpecialization,
  isOtherSelected,
  customTrade,
  setCustomTrade,
  education,
  onOpenTradeModal,
  onOpenEduModal,
  onRemoveEducation,
}) => {
  return (
    <View style={styles.masterEditCard}>
      <View style={styles.cardHeaderRow}>
        <View style={{ flex: 1 }}>
          <Text style={styles.cardHeaderTitle}>Education & Specialization</Text>
          <Text style={styles.cardHeaderSub}>Specify ITI trade specialization & qualifications</Text>
        </View>
      </View>

      <View style={styles.sectionBlock}>
        <View style={{ gap: 10 }}>
          <Text style={styles.sectionTitleText}>Trade Specialization <Text style={{ color: '#DC2626' }}>*</Text></Text>
          <TouchableOpacity
            activeOpacity={0.8}
            style={styles.dropdownPickerRow}
            onPress={onOpenTradeModal}
          >
            <Text style={styles.dropdownPickerText}>
              {(isOtherSelected || tradeSpecialization === 'Other') ? (customTrade || 'Other (Specify Below)') : tradeSpecialization}
            </Text>
            <ChevronDown size={16} color="#94A3B8" />
          </TouchableOpacity>

          {(isOtherSelected || tradeSpecialization === 'Other') ? (
            <Input
              label="Custom Trade Specialization"
              required
              placeholder="e.g. Laser Cutting Operator / PLC Automation Programmer"
              value={customTrade}
              onChangeText={setCustomTrade}
              inputContainerStyle={{ borderRadius: 6 }}
              allowClear={true}
              onClear={() => setCustomTrade('')}
            />
          ) : null}
        </View>
      </View>

      <View style={styles.sectionDividerSlate} />

      <View style={styles.sectionBlock}>
        <View style={styles.sectionHeaderRow}>
          <Text style={[styles.sectionTitleText, { flex: 1 }]}>Education & ITI Certificates</Text>
          <TouchableOpacity style={styles.addBtnSmall} onPress={onOpenEduModal}>
            <Plus size={14} color={COLORS.primary} />
            <Text style={styles.addBtnSmallText}>Add Entry</Text>
          </TouchableOpacity>
        </View>

        <View style={{ marginTop: 6 }}>
          {education.length === 0 ? (
            <Text style={styles.emptySubText}>No education or ITI certificate entries added yet.</Text>
          ) : (
            education.map((item, idx) => (
              <React.Fragment key={idx}>
                {idx > 0 && <View style={styles.innerCardItemSeparator} />}
                <View style={styles.itemRowCard}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.itemRowTitle}>{item.degree || item.degreeName || 'Degree / ITI Certificate'}</Text>
                    <Text style={styles.itemRowSub}>{item.institution || item.school || item.college} • Passing Year: {item.year || item.passingYear || '-'}</Text>
                  </View>
                  <TouchableOpacity
                    activeOpacity={0.7}
                    style={styles.deleteBtnBox}
                    hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                    onPress={() => onRemoveEducation(idx)}
                  >
                    <Trash2 size={16} color="#DC2626" />
                  </TouchableOpacity>
                </View>
              </React.Fragment>
            ))
          )}
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
  innerCardItemSeparator: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginVertical: 4,
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
  deleteBtnBox: {
    width: 36,
    height: 36,
    borderRadius: 6,
    backgroundColor: '#FEE2E2',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
