import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Switch,
  TextInput,
  ScrollView,
  StyleSheet,
} from 'react-native';
import {
  Users,
  User,
  UserCheck,
  FileText,
  Building2,
  Phone,
  MapPin,
  Wrench,
  Plus,
  X,
} from 'lucide-react-native';
import { Input } from '../../../components/common/Input';
import { DatePickerField } from '../../../components/common/DatePickerField';
import { COLORS, SPACING } from '../../../constants/theme';

interface JobPostStep4EligibilityProps {
  genderPreference: string;
  setGenderPreference: (val: string) => void;
  minAgeInput: string;
  setMinAgeInput: (val: string) => void;
  maxAgeInput: string;
  setMaxAgeInput: (val: string) => void;
  hiringMethod: 'STANDARD' | 'WALK_IN';
  setHiringMethod: (val: 'STANDARD' | 'WALK_IN') => void;
  walkInDate: string;
  setWalkInDate: (val: string) => void;
  walkInStartTime: string;
  setWalkInStartTime: (val: string) => void;
  walkInEndTime: string;
  setWalkInEndTime: (val: string) => void;
  interviewAddress: string;
  setInterviewAddress: (val: string) => void;
  walkInContactPerson: string;
  setWalkInContactPerson: (val: string) => void;
  walkInContactNumber: string;
  setWalkInContactNumber: (val: string) => void;
  applicationDeadline: string;
  setApplicationDeadline: (val: string) => void;
  maxApplicantsInput: string;
  setMaxApplicantsInput: (val: string) => void;
  description: string;
  setDescription: (val: string) => void;
  showResponsibilities: boolean;
  setShowResponsibilities: (val: boolean) => void;
  responsibilities: string;
  setResponsibilities: (val: string) => void;
  showRequirements: boolean;
  setShowRequirements: (val: boolean) => void;
  requirements: string;
  setRequirements: (val: string) => void;
  skillsTags: string[];
  customSkillInput: string;
  setCustomSkillInput: (val: string) => void;
  onAddCustomSkill: () => void;
  onToggleSkill: (skill: string) => void;
  availableSkills: string[];
}

export const JobPostStep4Eligibility: React.FC<JobPostStep4EligibilityProps> = ({
  genderPreference,
  setGenderPreference,
  minAgeInput,
  setMinAgeInput,
  maxAgeInput,
  setMaxAgeInput,
  hiringMethod,
  setHiringMethod,
  walkInDate,
  setWalkInDate,
  walkInStartTime,
  setWalkInStartTime,
  walkInEndTime,
  setWalkInEndTime,
  interviewAddress,
  setInterviewAddress,
  walkInContactPerson,
  setWalkInContactPerson,
  walkInContactNumber,
  setWalkInContactNumber,
  applicationDeadline,
  setApplicationDeadline,
  maxApplicantsInput,
  setMaxApplicantsInput,
  description,
  setDescription,
  showResponsibilities,
  setShowResponsibilities,
  responsibilities,
  setResponsibilities,
  showRequirements,
  setShowRequirements,
  requirements,
  setRequirements,
  skillsTags,
  customSkillInput,
  setCustomSkillInput,
  onAddCustomSkill,
  onToggleSkill,
  availableSkills,
}) => {
  return (
    <View style={styles.formCard}>
      <View style={styles.cardHeaderRow}>
        <View style={{ flex: 1 }}>
          <Text style={styles.cardHeaderTitle}>Role & Eligibility</Text>
          <Text style={styles.cardHeaderSub}>Enter age criteria, hiring mode & key skills</Text>
        </View>
      </View>

      <View style={styles.sectionBlock}>
        <View style={styles.sectionHeaderRow}>
          <Users size={16} color={COLORS.primary} />
          <Text style={styles.sectionTitleText}>Applicant Eligibility & Age Criteria</Text>
        </View>

        <View style={styles.cardBody}>
          <Text style={styles.fieldLabel}>Gender Preference</Text>
          <View style={styles.hiringSegmentedTrack}>
            {(['No Preference', 'Male Only', 'Female Only'] as const).map((g, idx, arr) => {
              const isSelected = genderPreference === g;
              const IconComp = g === 'No Preference' ? Users : g === 'Male Only' ? User : UserCheck;
              const isLast = idx === arr.length - 1;
              return (
                <TouchableOpacity
                  key={g}
                  activeOpacity={0.8}
                  style={[
                    styles.hiringTabBtn,
                    !isLast && styles.tabBtnBorderRight,
                    isSelected && styles.hiringTabBtnActive,
                  ]}
                  onPress={() => setGenderPreference(g)}
                >
                  <IconComp size={14} color={isSelected ? '#FFFFFF' : '#64748B'} />
                  <Text style={[styles.hiringTabText, isSelected && styles.hiringTabTextActive]} numberOfLines={1}>
                    {g}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <View style={[styles.rowTwo, { marginTop: SPACING.md }]}>
            <View style={{ flex: 1 }}>
              <Input
                label="Min Age (Years)"
                keyboardType="numeric"
                value={minAgeInput}
                onChangeText={setMinAgeInput}
                inputContainerStyle={{ borderRadius: 8 }}
              />
            </View>
            <View style={{ flex: 1 }}>
              <Input
                label="Max Age (Years)"
                keyboardType="numeric"
                value={maxAgeInput}
                onChangeText={setMaxAgeInput}
                inputContainerStyle={{ borderRadius: 8 }}
              />
            </View>
          </View>
        </View>
      </View>

      <View style={styles.sectionSeparator} />

      <View style={styles.sectionBlock}>
        <View style={styles.sectionHeaderRow}>
          <FileText size={16} color={COLORS.primary} />
          <Text style={styles.sectionTitleText}>Application and Hiring Mode</Text>
        </View>

        <View style={styles.cardBody}>
          <Text style={styles.fieldLabel}>Select Hiring Mode</Text>
          <View style={styles.hiringSegmentedTrack}>
            <TouchableOpacity
              activeOpacity={0.8}
              style={[
                styles.hiringTabBtn,
                styles.tabBtnBorderRight,
                hiringMethod === 'STANDARD' && styles.hiringTabBtnActive,
              ]}
              onPress={() => setHiringMethod('STANDARD')}
            >
              <Building2 size={14} color={hiringMethod === 'STANDARD' ? '#FFFFFF' : '#64748B'} />
              <Text style={[styles.hiringTabText, hiringMethod === 'STANDARD' && styles.hiringTabTextActive]} numberOfLines={1}>
                Standard Online
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.8}
              style={[
                styles.hiringTabBtn,
                hiringMethod === 'WALK_IN' && styles.hiringTabBtnActive,
              ]}
              onPress={() => setHiringMethod('WALK_IN')}
            >
              <UserCheck size={14} color={hiringMethod === 'WALK_IN' ? '#FFFFFF' : '#64748B'} />
              <Text style={[styles.hiringTabText, hiringMethod === 'WALK_IN' && styles.hiringTabTextActive]} numberOfLines={1}>
                Direct Walk-in Drive
              </Text>
            </TouchableOpacity>
          </View>

          {hiringMethod === 'WALK_IN' ? (
            <View style={{ marginTop: 8, gap: 10 }}>
              <DatePickerField
                label="Walk-in Interview Date"
                placeholder="Select walk-in date..."
                value={walkInDate}
                onChange={setWalkInDate}
                minDate={new Date()}
              />
              <View style={styles.rowTwo}>
                <View style={{ flex: 1 }}>
                  <Input
                    label="Start Time"
                    placeholder="10:00 AM"
                    value={walkInStartTime}
                    onChangeText={setWalkInStartTime}
                    inputContainerStyle={{ borderRadius: 8 }}
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Input
                    label="End Time"
                    placeholder="04:00 PM"
                    value={walkInEndTime}
                    onChangeText={setWalkInEndTime}
                    inputContainerStyle={{ borderRadius: 8 }}
                  />
                </View>
              </View>
              <Input
                label="Interview Venue Address"
                placeholder="Gate No 2, Factory Reception, MIDC"
                value={interviewAddress}
                onChangeText={setInterviewAddress}
                leftIcon={<MapPin size={16} color="#64748B" />}
                inputContainerStyle={{ borderRadius: 8 }}
              />
              <View style={styles.rowTwo}>
                <View style={{ flex: 1 }}>
                  <Input
                    label="Contact Person"
                    placeholder="HR Manager / Supervisor"
                    value={walkInContactPerson}
                    onChangeText={setWalkInContactPerson}
                    leftIcon={<UserCheck size={16} color="#64748B" />}
                    inputContainerStyle={{ borderRadius: 8 }}
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Input
                    label="Contact Mobile"
                    placeholder="10-digit number"
                    keyboardType="phone-pad"
                    value={walkInContactNumber}
                    onChangeText={setWalkInContactNumber}
                    leftIcon={<Phone size={16} color="#64748B" />}
                    inputContainerStyle={{ borderRadius: 8 }}
                  />
                </View>
              </View>
            </View>
          ) : null}

          <View style={[styles.rowTwo, { marginTop: 12 }]}>
            <View style={{ flex: 1 }}>
              <DatePickerField
                label="Application Deadline"
                required
                placeholder="Select deadline date..."
                value={applicationDeadline}
                onChange={setApplicationDeadline}
                minDate={new Date()}
              />
            </View>
            <View style={{ flex: 1 }}>
              <Input
                label="Max Applicants Cap"
                placeholder="e.g. 50 (0 = Unlimited)"
                keyboardType="numeric"
                value={maxApplicantsInput}
                onChangeText={setMaxApplicantsInput}
                inputContainerStyle={{ borderRadius: 8 }}
              />
            </View>
          </View>
        </View>
      </View>

      <View style={styles.sectionSeparator} />

      <View style={styles.sectionBlock}>
        <View style={styles.sectionHeaderRow}>
          <Wrench size={16} color={COLORS.primary} />
          <Text style={styles.sectionTitleText}>Job Description, Responsibilities & Skills</Text>
        </View>

        <View style={styles.cardBody}>
          <Input
            label="Job Description"
            required
            multiline
            numberOfLines={4}
            placeholder="Describe machine operations, shop floor duties, and expectations..."
            value={description}
            onChangeText={setDescription}
            inputContainerStyle={{ borderRadius: 8 }}
            style={{ minHeight: 90 }}
          />

          <View style={[styles.switchHeaderRow, { marginTop: 14, paddingVertical: 4 }]}>
            <Text style={styles.fieldLabel}>Add Key Responsibilities</Text>
            <Switch
              value={showResponsibilities}
              onValueChange={(val) => {
                setShowResponsibilities(val);
                if (!val) setResponsibilities('');
              }}
              trackColor={{ true: COLORS.primary }}
            />
          </View>

          {showResponsibilities ? (
            <Input
              label="Key Responsibilities (One per line)"
              multiline
              numberOfLines={3}
              placeholder="e.g. Operate CNC machine per job card&#10;Perform Quality Checks"
              value={responsibilities}
              onChangeText={setResponsibilities}
              inputContainerStyle={{ borderRadius: 8 }}
              style={{ marginTop: 4, minHeight: 70 }}
            />
          ) : null}

          <View style={[styles.switchHeaderRow, { marginTop: 14, paddingVertical: 4 }]}>
            <Text style={styles.fieldLabel}>Add Job Requirements & Qualifications</Text>
            <Switch
              value={showRequirements}
              onValueChange={(val) => {
                setShowRequirements(val);
                if (!val) setRequirements('');
              }}
              trackColor={{ true: COLORS.primary }}
            />
          </View>

          {showRequirements ? (
            <Input
              label="Job Requirements & Qualification (One per line)"
              multiline
              numberOfLines={3}
              placeholder="e.g. ITI / Diploma in Fitter Trade&#10;1+ year shopfloor experience"
              value={requirements}
              onChangeText={setRequirements}
              inputContainerStyle={{ borderRadius: 8 }}
              style={{ marginTop: 4, minHeight: 70 }}
            />
          ) : null}

          <Text style={[styles.fieldLabel, { marginTop: SPACING.md }]}>
            Key Skills <Text style={styles.required}>*</Text>
          </Text>
          
          <View style={styles.customSkillInputRow}>
            <TextInput
              style={styles.customSkillInput}
              placeholder="Enter skills (e.g. CNC Operating)"
              placeholderTextColor="#94A3B8"
              value={customSkillInput}
              onChangeText={setCustomSkillInput}
              onSubmitEditing={onAddCustomSkill}
              returnKeyType="done"
            />
            <TouchableOpacity style={styles.addCustomSkillBtn} activeOpacity={0.8} onPress={onAddCustomSkill}>
              <Plus size={16} color="#FFFFFF" strokeWidth={2.5} />
              <Text style={styles.addSkillBtnText}>Add</Text>
            </TouchableOpacity>
          </View>

          {skillsTags.length > 0 ? (
            <View style={styles.selectedTagsWrap}>
              {skillsTags.map((sk) => (
                <View key={`selected-${sk}`} style={styles.selectedTagChip}>
                  <Text style={styles.selectedTagText}>{sk}</Text>
                  <TouchableOpacity
                    onPress={() => onToggleSkill(sk)}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                    style={{ marginLeft: 6 }}
                  >
                    <X size={13} color={COLORS.primary} strokeWidth={2.5} />
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          ) : null}

          {availableSkills.filter((sk) => !skillsTags.includes(sk)).length > 0 ? (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipRow}>
              {availableSkills
                .filter((sk) => !skillsTags.includes(sk))
                .map((sk) => (
                  <TouchableOpacity key={sk} style={styles.chip} onPress={() => onToggleSkill(sk)}>
                    <Text style={styles.chipText}>+ {sk}</Text>
                  </TouchableOpacity>
                ))}
            </ScrollView>
          ) : null}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  formCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
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
  fieldLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#334155',
  },
  required: {
    color: '#EF4444',
  },
  rowTwo: {
    flexDirection: 'row',
    gap: 10,
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
  tabBtnBorderRight: {
    borderRightWidth: 1,
    borderRightColor: '#CBD5E1',
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
  sectionSeparator: {
    height: 1,
    backgroundColor: '#E2E8F0',
    marginVertical: 14,
  },
  switchHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  customSkillInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  customSkillInput: {
    flex: 1,
    height: 44,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    fontSize: 13,
    color: '#0F172A',
    borderRadius: 8,
  },
  addCustomSkillBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    height: 44,
    backgroundColor: COLORS.primary,
    borderRadius: 8,
    gap: 4,
  },
  addSkillBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  selectedTagsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 6,
  },
  selectedTagChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#BFDBFE',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
  },
  selectedTagText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.primary,
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
  chipText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#475569',
  },
});
