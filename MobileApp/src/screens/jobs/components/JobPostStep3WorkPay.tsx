import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Switch,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { Briefcase, IndianRupee, Clock, Sun, Moon, RotateCw, GraduationCap } from 'lucide-react-native';
import { Input } from '../../../components/common/Input';
import { SelectDropdown } from '../../../components/common/SelectDropdown';
import { EDUCATION_REQUIREMENT_OPTIONS } from './JobPostConstants';
import { COLORS, SPACING, RADIUS } from '../../../constants/theme';

interface JobPostStep3WorkPayProps {
  experienceRequired: boolean;
  setExperienceRequired: (val: boolean) => void;
  minExperience: string;
  setMinExperience: (val: string) => void;
  maxExperience: string;
  setMaxExperience: (val: string) => void;
  educationRequirement: string;
  setEducationRequirement: (val: string) => void;
  customEducation: string;
  setCustomEducation: (val: string) => void;
  discloseSalary: boolean;
  setDiscloseSalary: (val: boolean) => void;
  salaryMin: string;
  setSalaryMin: (val: string) => void;
  salaryMax: string;
  setSalaryMax: (val: string) => void;
  workMode: 'On-site' | 'Remote' | 'Hybrid';
  setWorkMode: (val: 'On-site' | 'Remote' | 'Hybrid') => void;
  workType: 'Full-time' | 'Part-time' | 'Contract' | 'Apprenticeship';
  setWorkType: (val: 'Full-time' | 'Part-time' | 'Contract' | 'Apprenticeship') => void;
  shiftCategory: 'Day Shift' | 'Night Shift' | 'Rotational Shift';
  setShiftCategory: (val: 'Day Shift' | 'Night Shift' | 'Rotational Shift') => void;
  overtime: boolean;
  setOvertime: (val: boolean) => void;
  canteen: boolean;
  setCanteen: (val: boolean) => void;
  busFacility: boolean;
  setBusFacility: (val: boolean) => void;
  accommodation: boolean;
  setAccommodation: (val: boolean) => void;
  pf: boolean;
  setPf: (val: boolean) => void;
  esic: boolean;
  setEsic: (val: boolean) => void;
  uniform: boolean;
  setUniform: (val: boolean) => void;
  medicalInsurance: boolean;
  setMedicalInsurance: (val: boolean) => void;
}

export const JobPostStep3WorkPay: React.FC<JobPostStep3WorkPayProps> = ({
  experienceRequired,
  setExperienceRequired,
  minExperience,
  setMinExperience,
  maxExperience,
  setMaxExperience,
  educationRequirement,
  setEducationRequirement,
  customEducation,
  setCustomEducation,
  discloseSalary,
  setDiscloseSalary,
  salaryMin,
  setSalaryMin,
  salaryMax,
  setSalaryMax,
  workMode,
  setWorkMode,
  workType,
  setWorkType,
  shiftCategory,
  setShiftCategory,
  overtime,
  setOvertime,
  canteen,
  setCanteen,
  busFacility,
  setBusFacility,
  accommodation,
  setAccommodation,
  pf,
  setPf,
  esic,
  setEsic,
  uniform,
  setUniform,
  medicalInsurance,
  setMedicalInsurance,
}) => {
  return (
    <View style={styles.formCard}>
      <View style={styles.cardHeaderRow}>
        <View style={{ flex: 1 }}>
          <Text style={styles.cardHeaderTitle}>Work & Pay Information</Text>
          <Text style={styles.cardHeaderSub}>Enter salary range, shift timings & benefits</Text>
        </View>
      </View>

      <View style={styles.sectionBlock}>
        <View style={styles.sectionHeaderRow}>
          <Briefcase size={16} color={COLORS.primary} />
          <Text style={styles.sectionTitleText}>Experience & Salary Requirements</Text>
        </View>

        <View style={styles.cardBody}>
          <View style={styles.switchHeaderRow}>
            <Text style={styles.fieldLabel}>Require Previous Work Experience</Text>
            <Switch value={experienceRequired} onValueChange={setExperienceRequired} trackColor={{ true: COLORS.primary }} />
          </View>

          {experienceRequired ? (
            <View style={styles.rowTwo}>
              <View style={{ flex: 1 }}>
                <Input
                  label="Min Experience (Yrs)"
                  keyboardType="numeric"
                  value={minExperience}
                  onChangeText={setMinExperience}
                  inputContainerStyle={{ borderRadius: 8 }}
                />
              </View>
              <View style={{ flex: 1 }}>
                <Input
                  label="Max Experience (Yrs)"
                  keyboardType="numeric"
                  value={maxExperience}
                  onChangeText={setMaxExperience}
                  inputContainerStyle={{ borderRadius: 8 }}
                />
              </View>
            </View>
          ) : null}

          {/* Education Qualification Requirement */}
          <View style={{ marginTop: SPACING.md }}>
            <SelectDropdown
              label="Education Qualification Requirement"
              required
              placeholder="Select Minimum Education..."
              value={educationRequirement}
              options={EDUCATION_REQUIREMENT_OPTIONS}
              onSelect={(val) => {
                setEducationRequirement(val);
                if (val !== 'Others') setCustomEducation('');
              }}
              triggerStyle={{ borderRadius: 8 }}
            />

            {educationRequirement === 'Others' ? (
              <Input
                placeholder="Enter custom qualification (e.g. B.Tech Mechanical, CA, 8th Pass)"
                value={customEducation}
                onChangeText={setCustomEducation}
                inputContainerStyle={{ borderRadius: 8 }}
                style={{ marginTop: -SPACING.xs }}
              />
            ) : null}
          </View>

          <View style={[styles.switchHeaderRow, { marginTop: SPACING.md }]}>
            <Text style={styles.fieldLabel}>Disclose Monthly Salary Range to Candidates</Text>
            <Switch value={discloseSalary} onValueChange={setDiscloseSalary} trackColor={{ true: COLORS.primary }} />
          </View>

          {discloseSalary ? (
            <View style={styles.rowTwo}>
              <View style={{ flex: 1 }}>
                <Input
                  label="Min Salary (₹/Month)"
                  keyboardType="numeric"
                  value={salaryMin}
                  onChangeText={setSalaryMin}
                  leftIcon={<IndianRupee size={15} color="#64748B" />}
                  inputContainerStyle={{ borderRadius: 8 }}
                />
              </View>
              <View style={{ flex: 1 }}>
                <Input
                  label="Max Salary (₹/Month)"
                  keyboardType="numeric"
                  value={salaryMax}
                  onChangeText={setSalaryMax}
                  leftIcon={<IndianRupee size={15} color="#64748B" />}
                  inputContainerStyle={{ borderRadius: 8 }}
                />
              </View>
            </View>
          ) : null}

          <Text style={[styles.fieldLabel, { marginTop: SPACING.md }]}>Work Mode</Text>
          <View style={styles.segmentedRow}>
            {(['On-site', 'Remote', 'Hybrid'] as const).map((m, idx, arr) => {
              const isSelected = workMode === m;
              const isLast = idx === arr.length - 1;
              return (
                <TouchableOpacity
                  key={m}
                  style={[
                    styles.segmentBtn,
                    !isLast && styles.tabBtnBorderRight,
                    isSelected && styles.segmentBtnActive,
                  ]}
                  onPress={() => setWorkMode(m)}
                >
                  <Text style={[styles.segmentText, isSelected && styles.segmentTextActive]} numberOfLines={1}>
                    {m}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <Text style={[styles.fieldLabel, { marginTop: SPACING.md }]}>Work Type</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipRow}>
            {(['Full-time', 'Part-time', 'Contract', 'Apprenticeship'] as const).map((t) => (
              <TouchableOpacity
                key={t}
                style={[styles.chip, workType === t && styles.chipActive]}
                onPress={() => setWorkType(t)}
              >
                <Text style={[styles.chipText, workType === t && styles.chipTextActive]}>{t}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </View>

      <View style={styles.sectionSeparator} />

      <View style={styles.sectionBlock}>
        <View style={styles.sectionHeaderRow}>
          <Clock size={16} color={COLORS.primary} />
          <Text style={styles.sectionTitleText}>Shift Timing & Statutory Facilities</Text>
        </View>

        <View style={styles.cardBody}>
          <Text style={styles.fieldLabel}>Shift Category</Text>
          <View style={styles.hiringSegmentedTrack}>
            {(['Day Shift', 'Night Shift', 'Rotational Shift'] as const).map((s, idx, arr) => {
              const isSelected = shiftCategory === s;
              const IconComp = s === 'Day Shift' ? Sun : s === 'Night Shift' ? Moon : RotateCw;
              const isLast = idx === arr.length - 1;
              return (
                <TouchableOpacity
                  key={s}
                  activeOpacity={0.8}
                  style={[
                    styles.hiringTabBtn,
                    !isLast && styles.tabBtnBorderRight,
                    isSelected && styles.hiringTabBtnActive,
                  ]}
                  onPress={() => setShiftCategory(s)}
                >
                  <IconComp size={14} color={isSelected ? '#FFFFFF' : '#64748B'} />
                  <Text style={[styles.hiringTabText, isSelected && styles.hiringTabTextActive]} numberOfLines={1}>
                    {s}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <View style={styles.perkGrid}>
            <View style={styles.perkItem}>
              <Text style={styles.perkLabel}>Overtime Pay (OT)</Text>
              <Switch value={overtime} onValueChange={setOvertime} trackColor={{ true: COLORS.primary }} />
            </View>
            <View style={styles.perkItem}>
              <Text style={styles.perkLabel}>Subsidized Canteen</Text>
              <Switch value={canteen} onValueChange={setCanteen} trackColor={{ true: COLORS.primary }} />
            </View>
            <View style={styles.perkItem}>
              <Text style={styles.perkLabel}>Bus / Transport Facility</Text>
              <Switch value={busFacility} onValueChange={setBusFacility} trackColor={{ true: COLORS.primary }} />
            </View>
            <View style={styles.perkItem}>
              <Text style={styles.perkLabel}>Free Accommodation / Quarters</Text>
              <Switch value={accommodation} onValueChange={setAccommodation} trackColor={{ true: COLORS.primary }} />
            </View>
            <View style={styles.perkItem}>
              <Text style={styles.perkLabel}>Provident Fund (PF)</Text>
              <Switch value={pf} onValueChange={setPf} trackColor={{ true: COLORS.primary }} />
            </View>
            <View style={styles.perkItem}>
              <Text style={styles.perkLabel}>ESIC Medical Facility</Text>
              <Switch value={esic} onValueChange={setEsic} trackColor={{ true: COLORS.primary }} />
            </View>
            <View style={styles.perkItem}>
              <Text style={styles.perkLabel}>Uniform & Safety Shoes</Text>
              <Switch value={uniform} onValueChange={setUniform} trackColor={{ true: COLORS.primary }} />
            </View>
            <View style={styles.perkItem}>
              <Text style={styles.perkLabel}>Medical Insurance</Text>
              <Switch value={medicalInsurance} onValueChange={setMedicalInsurance} trackColor={{ true: COLORS.primary }} />
            </View>
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  formCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: RADIUS.card,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    padding: 16,
    marginBottom: 16,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  cardHeaderTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
  },
  cardHeaderSub: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  sectionBlock: {},
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  sectionTitleText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
  },
  cardBody: {
    gap: 12,
  },
  switchHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  fieldLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#334155',
  },
  rowTwo: {
    flexDirection: 'row',
    gap: 10,
  },
  segmentedRow: {
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: '#F8FAFC',
  },
  segmentBtn: {
    flex: 1,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
    backgroundColor: '#FFFFFF',
  },
  segmentBtnActive: {
    backgroundColor: COLORS.primary,
  },
  tabBtnBorderRight: {
    borderRightWidth: 1,
    borderRightColor: '#CBD5E1',
  },
  segmentText: {
    fontSize: 12.5,
    fontWeight: '600',
    color: '#475569',
    textAlign: 'center',
  },
  segmentTextActive: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  chipRow: {
    flexDirection: 'row',
    marginTop: 4,
  },
  chip: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    backgroundColor: '#FFFFFF',
    borderRadius: 6,
    marginRight: 6,
  },
  chipActive: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primary,
  },
  chipText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#475569',
  },
  chipTextActive: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  sectionSeparator: {
    height: 1,
    backgroundColor: '#E2E8F0',
    marginVertical: 14,
  },
  hiringSegmentedTrack: {
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: '#F8FAFC',
  },
  hiringTabBtn: {
    flex: 1,
    height: 40,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
    gap: 5,
    backgroundColor: '#FFFFFF',
  },
  hiringTabBtnActive: {
    backgroundColor: COLORS.primary,
  },
  hiringTabText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#475569',
    textAlign: 'center',
  },
  hiringTabTextActive: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  perkGrid: {
    marginTop: 6,
    gap: 2,
  },
  perkItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 6,
    paddingHorizontal: 2,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  perkLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: '#334155',
  },
});
