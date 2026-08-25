import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  StyleSheet,
  TextInput,
} from 'react-native';
import {
  Building2,
  Camera,
  Mail,
  Phone,
  Globe,
  MapPin,
  FileText,
  ShieldCheck,
  UserCheck,
  Briefcase,
} from 'lucide-react-native';
import { Input } from '../../../components/common/Input';
import { SelectDropdown } from '../../../components/common/SelectDropdown';
import { CompanyLogoAvatar } from '../../../components/common/CompanyLogoAvatar';
import { COLORS, RADIUS } from '../../../constants/theme';

interface CompanyProfileFormCardProps {
  logoUri: string | null;
  onPickLogo: () => void;
  companyName: string;
  setCompanyName: (val: string) => void;
  gstNumber: string;
  setGstNumber: (val: string) => void;
  industry: string;
  setIndustry: (val: string) => void;
  industryList: string[];
  midcZone: string;
  setMidcZone: (val: string) => void;
  midcList: string[];
  contactPerson: string;
  setContactPerson: (val: string) => void;
  userEmail?: string;
  phone: string;
  setPhone: (val: string) => void;
  website: string;
  setWebsite: (val: string) => void;
  address: string;
  setAddress: (val: string) => void;
  description: string;
  setDescription: (val: string) => void;
}

export const CompanyProfileFormCard: React.FC<CompanyProfileFormCardProps> = ({
  logoUri,
  onPickLogo,
  companyName,
  setCompanyName,
  gstNumber,
  setGstNumber,
  industry,
  setIndustry,
  industryList,
  midcZone,
  setMidcZone,
  midcList,
  contactPerson,
  setContactPerson,
  userEmail,
  phone,
  setPhone,
  website,
  setWebsite,
  address,
  setAddress,
  description,
  setDescription,
}) => {
  return (
    <View style={styles.formCardContainer}>
      {/* Enterprise Avatar Header */}
      <View style={styles.logoEditContainer}>
        <TouchableOpacity activeOpacity={0.85} onPress={onPickLogo} style={styles.logoBorderWrapper}>
          <CompanyLogoAvatar logoUrl={logoUri} companyName={companyName || 'Enterprise'} size={76} borderRadius={38} />
          <View style={styles.cameraIconBadge}>
            <Camera size={12} color="#FFFFFF" />
          </View>
        </TouchableOpacity>
        <Text style={styles.tapToChangeLogoText}>Tap to update enterprise logo</Text>
      </View>

      <View style={styles.sectionDividerSlate} />

      <Text style={styles.formSectionCategoryTitle}>ENTERPRISE IDENTIFICATION</Text>

      <Input
        label="Company / Enterprise Name *"
        placeholder="e.g. Endurance Technologies Ltd"
        value={companyName}
        onChangeText={setCompanyName}
        leftIcon={<Building2 size={18} color="#64748B" />}
      />

      <Input
        label="GST Registration Number (Optional)"
        placeholder="15-digit GSTIN (e.g. 27AAAAA0000A1Z5)"
        value={gstNumber}
        maxLength={15}
        autoCapitalize="characters"
        onChangeText={setGstNumber}
        leftIcon={<ShieldCheck size={18} color="#64748B" />}
      />

      <SelectDropdown
        label="Industry Sector / Trade *"
        value={industry}
        options={industryList}
        onSelect={setIndustry}
        leftIcon={<Briefcase size={18} color="#64748B" />}
      />

      <SelectDropdown
        label="Primary MIDC Zone *"
        value={midcZone}
        options={midcList}
        onSelect={setMidcZone}
        leftIcon={<MapPin size={18} color="#64748B" />}
      />

      <View style={styles.sectionDividerSlate} />

      <Text style={styles.formSectionCategoryTitle}>PRIMARY CONTACT DETAILS</Text>

      <Input
        label="Contact Person Name *"
        placeholder="HR Manager / Factory Representative"
        value={contactPerson}
        onChangeText={setContactPerson}
        leftIcon={<UserCheck size={18} color="#64748B" />}
      />

      <Input
        label="Registered Email (Account)"
        value={userEmail || ''}
        editable={false}
        leftIcon={<Mail size={18} color="#94A3B8" />}
      />

      <Input
        label="Contact Phone Number *"
        placeholder="10-digit mobile number"
        keyboardType="number-pad"
        value={phone}
        maxLength={10}
        onChangeText={(t) => setPhone(t.replace(/[^0-9]/g, '').slice(0, 10))}
        leftIcon={<Phone size={18} color="#64748B" />}
      />

      <Input
        label="Company Website (Optional)"
        placeholder="https://www.company.com"
        value={website}
        keyboardType="url"
        autoCapitalize="none"
        onChangeText={setWebsite}
        leftIcon={<Globe size={18} color="#64748B" />}
      />

      <Input
        label="Factory Street Address *"
        placeholder="Plot No, Block MIDC Industrial Area"
        value={address}
        onChangeText={setAddress}
        leftIcon={<MapPin size={18} color="#64748B" />}
      />

      <Input
        label="Company Overview / Description"
        placeholder="Brief description of products manufactured and plant facilities..."
        value={description}
        onChangeText={setDescription}
        multiline={true}
        leftIcon={<FileText size={18} color="#64748B" />}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  formCardContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: RADIUS.card,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    padding: 16,
    gap: 12,
  },
  logoEditContainer: {
    alignItems: 'center',
    marginVertical: 6,
  },
  logoBorderWrapper: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 2,
    borderColor: COLORS.primary,
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F8FAFC',
  },
  logoImg: {
    width: 74,
    height: 74,
    borderRadius: 37,
  },
  logoFallbackBox: {
    width: 74,
    height: 74,
    borderRadius: 37,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cameraIconBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
    elevation: 3,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
  },
  tapToChangeLogoText: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 6,
    fontWeight: '600',
  },
  sectionDividerSlate: {
    height: 1,
    backgroundColor: '#E2E8F0',
    marginVertical: 4,
  },
  formSectionCategoryTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: '#94A3B8',
    letterSpacing: 0.8,
    marginTop: 2,
  },
  inputGroup: {
    gap: 6,
  },
  inputLabelText: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#334155',
  },
  textAreaField: {
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 6,
    padding: 10,
    fontSize: 13,
    color: '#0F172A',
    minHeight: 80,
    textAlignVertical: 'top',
  },
});
