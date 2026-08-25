import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  Switch,
  TextInput,
  StyleSheet,
} from 'react-native';
import {
  Building2,
  Camera,
  Upload,
  Minus,
  Plus,
  Award,
} from 'lucide-react-native';
import { Input } from '../../../components/common/Input';
import { SelectDropdown } from '../../../components/common/SelectDropdown';
import { COLORS, SPACING, RADIUS } from '../../../constants/theme';
import { INDUSTRY_LIST } from './JobPostConstants';

interface JobPostStep1BasicProps {
  companyLogo: string;
  onPickLogo: () => void;
  industry: string;
  customIndustry: string;
  setCustomIndustry: (val: string) => void;
  title: string;
  customTitle: string;
  setCustomTitle: (val: string) => void;
  setTitle: (val: string) => void;
  currentRoleOptions: string[];
  onIndustryChange: (val: string) => void;
  openingsInput: string;
  setOpeningsInput: (val: string) => void;
  targetIti: boolean;
  setTargetIti: (val: boolean) => void;
  itiTrade: string;
  setItiTrade: (val: string) => void;
  itiTradesList: string[];
  isMidcLocation: boolean;
  setIsMidcLocation: (val: boolean) => void;
  midcZone: string;
  setMidcZone: (val: string) => void;
  midcList: string[];
}

export const JobPostStep1Basic: React.FC<JobPostStep1BasicProps> = ({
  companyLogo,
  onPickLogo,
  industry,
  customIndustry,
  setCustomIndustry,
  title,
  customTitle,
  setCustomTitle,
  setTitle,
  currentRoleOptions,
  onIndustryChange,
  openingsInput,
  setOpeningsInput,
  targetIti,
  setTargetIti,
  itiTrade,
  setItiTrade,
  itiTradesList,
  isMidcLocation,
  setIsMidcLocation,
  midcZone,
  setMidcZone,
  midcList,
}) => {
  return (
    <View style={styles.formCard}>
      <View style={styles.cardHeaderRow}>
        <View style={{ flex: 1 }}>
          <Text style={styles.cardHeaderTitle}>Basic Job Details</Text>
          <Text style={styles.cardHeaderSub}>Enter company logo & job specifications</Text>
        </View>
      </View>

      <View style={styles.logoUploadContainer}>
        <TouchableOpacity activeOpacity={0.8} style={styles.logoUploadBox} onPress={onPickLogo}>
          {companyLogo ? (
            <View style={styles.logoPreviewWrapper}>
              <Image source={{ uri: companyLogo }} style={styles.logoPreviewImage} resizeMode="contain" />
              <View style={styles.logoEditBadge}>
                <Camera size={12} color="#FFFFFF" />
                <Text style={styles.logoEditText}>Change Logo</Text>
              </View>
            </View>
          ) : (
            <View style={styles.logoPlaceholderWrapper}>
              <View style={styles.uploadIconCircle}>
                <Upload size={18} color={COLORS.primary} />
              </View>
              <Text style={styles.logoUploadTitle}>Upload Company Logo</Text>
              <Text style={styles.logoUploadSub}>JPG, PNG or WEBP (Tap to upload)</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      <View style={styles.sectionSeparator} />

      <View style={styles.sectionBlock}>
        <View style={styles.sectionHeaderRow}>
          <Building2 size={16} color={COLORS.primary} />
          <Text style={styles.sectionTitleText}>Industry & Role Specifications</Text>
        </View>

        <View style={styles.cardBody}>
          <SelectDropdown
            label="Industry Type / Sector"
            required
            placeholder="Select Industry / Sector..."
            value={industry}
            options={[...INDUSTRY_LIST, 'Other']}
            onSelect={(val) => onIndustryChange(val)}
            triggerStyle={{ borderRadius: 8 }}
          />

          {industry === 'Other' ? (
            <Input
              placeholder="Type custom industry sector (e.g. Renewable Energy & Solar)"
              value={customIndustry}
              onChangeText={setCustomIndustry}
              inputContainerStyle={{ borderRadius: 8 }}
              style={{ marginTop: -SPACING.xs }}
            />
          ) : null}

          <SelectDropdown
            label="Job Role"
            required
            placeholder={industry ? 'Select Role for this Industry...' : 'Select Industry Type first'}
            disabledPlaceholder="Select Industry Type first"
            disabled={!industry}
            value={title}
            options={[...currentRoleOptions, 'Other']}
            onSelect={(val) => {
              setTitle(val);
              if (val !== 'Other') setCustomTitle('');
            }}
            triggerStyle={{ borderRadius: 8 }}
          />

          {title === 'Other' ? (
            <Input
              placeholder="Type custom job role (e.g. Senior VMC Programmer)"
              value={customTitle}
              onChangeText={setCustomTitle}
              inputContainerStyle={{ borderRadius: 8 }}
              style={{ marginTop: -SPACING.xs }}
            />
          ) : null}

          <View style={styles.fieldBlock}>
            <Text style={styles.fieldLabel}>
              No. of Vacancies <Text style={styles.required}>*</Text>
            </Text>
            <View style={styles.stepperBox}>
              <TouchableOpacity
                style={styles.stepperBtn}
                activeOpacity={0.7}
                onPress={() => {
                  const curr = parseInt(openingsInput, 10) || 1;
                  setOpeningsInput(String(Math.max(1, curr - 1)));
                }}
              >
                <Minus size={15} color="#0F172A" strokeWidth={2.5} />
              </TouchableOpacity>
              <TextInput
                style={styles.stepperInput}
                keyboardType="numeric"
                value={openingsInput}
                onChangeText={(val) => {
                  const sanitized = val.replace(/^0+/, '');
                  setOpeningsInput(sanitized);
                }}
                onBlur={() => {
                  if (!openingsInput || parseInt(openingsInput, 10) < 1) {
                    setOpeningsInput('1');
                  }
                }}
              />
              <TouchableOpacity
                style={styles.stepperBtn}
                activeOpacity={0.7}
                onPress={() => {
                  const curr = parseInt(openingsInput, 10) || 1;
                  setOpeningsInput(String(curr + 1));
                }}
              >
                <Plus size={15} color="#0F172A" strokeWidth={2.5} />
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.sectionSeparator} />

          <TouchableOpacity style={styles.checkboxRow} activeOpacity={0.8} onPress={() => setTargetIti(!targetIti)}>
            <Award size={16} color={COLORS.primary} style={{ marginRight: 8 }} />
            <Text style={styles.checkboxText}>Target ITI Professionals</Text>
            <Switch value={targetIti} onValueChange={setTargetIti} trackColor={{ true: COLORS.primary }} />
          </TouchableOpacity>

          {targetIti ? (
            <View style={{ marginTop: SPACING.xs }}>
              <SelectDropdown
                label="ITI Specialization Trade"
                placeholder="Select ITI Specialization Trade..."
                value={itiTrade}
                options={itiTradesList}
                onSelect={(val) => setItiTrade(val)}
                triggerStyle={{ borderRadius: 8 }}
              />
            </View>
          ) : null}

          <TouchableOpacity style={styles.checkboxRow} activeOpacity={0.8} onPress={() => setIsMidcLocation(!isMidcLocation)}>
            <Building2 size={16} color={COLORS.primary} style={{ marginRight: 8 }} />
            <Text style={styles.checkboxText}>This Job is Located in an MIDC Area</Text>
            <Switch value={isMidcLocation} onValueChange={setIsMidcLocation} trackColor={{ true: COLORS.primary }} />
          </TouchableOpacity>

          {isMidcLocation ? (
            <View style={{ marginTop: SPACING.xs }}>
              <SelectDropdown
                label="Select MIDC Zone in Maharashtra"
                placeholder="Select MIDC Zone in Maharashtra..."
                value={midcZone}
                options={midcList}
                onSelect={(val) => setMidcZone(val)}
                triggerStyle={{ borderRadius: 8 }}
              />
            </View>
          ) : null}
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
  logoUploadContainer: {
    alignItems: 'center',
    marginBottom: 14,
  },
  logoUploadBox: {
    width: '100%',
    height: 90,
    backgroundColor: '#F8FAFC',
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
    borderStyle: 'dashed',
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  logoPreviewWrapper: {
    width: '100%',
    height: '100%',
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoPreviewImage: {
    width: '80%',
    height: '80%',
  },
  logoEditBadge: {
    position: 'absolute',
    bottom: 6,
    right: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(15, 23, 42, 0.75)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
  },
  logoEditText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  logoPlaceholderWrapper: {
    alignItems: 'center',
  },
  uploadIconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  logoUploadTitle: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#0F172A',
  },
  logoUploadSub: {
    fontSize: 10.5,
    color: '#64748B',
    marginTop: 1,
  },
  sectionSeparator: {
    height: 1,
    backgroundColor: '#E2E8F0',
    marginVertical: 14,
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
  fieldBlock: {
    marginTop: 4,
  },
  fieldLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#334155',
    marginBottom: 6,
  },
  required: {
    color: '#EF4444',
  },
  stepperBox: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 8,
    backgroundColor: '#F8FAFC',
    height: 42,
    width: 140,
  },
  stepperBtn: {
    width: 40,
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#E2E8F0',
  },
  stepperInput: {
    flex: 1,
    textAlign: 'center',
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
    padding: 0,
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
  },
  checkboxText: {
    flex: 1,
    fontSize: 13,
    fontWeight: '600',
    color: '#334155',
  },
});
