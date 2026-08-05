import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Image,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import {
  Building2,
  Mail,
  Phone,
  FileText,
  Globe,
  MapPin,
  Camera,
  ShieldCheck,
  LogOut,
  Lock,
  UserCheck,
  Briefcase,
  Layers,
  ChevronRight,
  HelpCircle,
  Info,
} from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import { useAuth } from '../../hooks/useAuth';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { Header } from '../../components/common/Header';
import { ErrorBanner } from '../../components/common/ErrorBanner';
import { SelectDropdown } from '../../components/common/SelectDropdown';
import { COLORS, TYPOGRAPHY, SPACING, RADIUS, SHADOWS } from '../../constants/theme';

interface Props {
  navigation: any;
}

const INDUSTRY_LIST = [
  'Automotive & Auto Components',
  'Industrial Manufacturing',
  'Electronics & Electricals',
  'Pharmaceuticals & Chemicals',
  'Textiles & Garments',
  'Construction & Infrastructure',
  'Logistics & Warehousing',
  'Services & General Engineering',
];

const MIDC_LIST = [
  'Chakan MIDC (Pune)',
  'Bhosari MIDC (PCMC Pune)',
  'Ranjangaon MIDC (Pune)',
  'Talegaon MIDC (Pune)',
  'Hadapsar Industrial Estate',
  'Waluj MIDC (Chhatrapati Sambhajinagar)',
  'Shendra MIDC (Chhatrapati Sambhajinagar)',
  'Taloja MIDC (Navi Mumbai)',
  'Rabale MIDC (Navi Mumbai)',
  'Tarapur MIDC (Palghar)',
  'Additional Ambernath MIDC (Thane)',
  'Satpur MIDC (Nashik)',
  'Ambad MIDC (Nashik)',
  'Kagal Five Star MIDC (Kolhapur)',
  'Gokul Shirgaon MIDC (Kolhapur)',
  'Butibori MIDC (Nagpur)',
  'Rohanan MIDC (Raigad)',
  'Non-MIDC Private Industrial Zone',
];

export const CompanyProfileScreen: React.FC<Props> = ({ navigation }) => {
  const { user, updateUserProfile, logout } = useAuth();

  // Profile Form State
  const [companyName, setCompanyName] = useState(user?.companyName || user?.company_name || '');
  const [gstNumber, setGstNumber] = useState(user?.gstNumber || user?.gst_number || '');
  const [industry, setIndustry] = useState(
    user?.tradeSpecialization || user?.trade_specialization || user?.industry || 'Industrial Manufacturing'
  );
  const [midcZone, setMidcZone] = useState(user?.midcZone || user?.midc_zone || 'Chakan MIDC (Pune)');
  const [contactPerson, setContactPerson] = useState(user?.contactPerson || user?.contact_person || user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [website, setWebsite] = useState(user?.website || '');
  const [address, setAddress] = useState(user?.address || '');
  const [description, setDescription] = useState(user?.companyDescription || user?.company_description || '');
  const [logoUri, setLogoUri] = useState<string | null>(user?.companyLogo || user?.company_logo || null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  React.useEffect(() => {
    if (user) {
      if (user.companyName || user.company_name) setCompanyName(user.companyName || user.company_name || '');
      if (user.gstNumber || user.gst_number) setGstNumber(user.gstNumber || user.gst_number || '');
      if (user.tradeSpecialization || user.trade_specialization || user.industry) {
        setIndustry(user.tradeSpecialization || user.trade_specialization || user.industry || 'Industrial Manufacturing');
      }
      if (user.midcZone || user.midc_zone) setMidcZone(user.midcZone || user.midc_zone || 'Chakan MIDC (Pune)');
      if (user.contactPerson || user.contact_person || user.name) setContactPerson(user.contactPerson || user.contact_person || user.name || '');
      if (user.phone) setPhone(user.phone || '');
      if (user.website) setWebsite(user.website || '');
      if (user.address) setAddress(user.address || '');
      if (user.companyDescription || user.company_description) {
        setDescription(user.companyDescription || user.company_description || '');
      }
      if (user.companyLogo || user.company_logo) setLogoUri(user.companyLogo || user.company_logo || null);
    }
  }, [user]);

  const handlePickLogo = async () => {
    const permResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permResult.granted) {
      Alert.alert('Permission Required', 'Permission to access gallery is required to upload logo.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: 'images',
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
      base64: true,
    });

    if (!result.canceled && result.assets[0]) {
      const asset = result.assets[0];
      const base64Data = asset.base64
        ? `data:${asset.mimeType || 'image/jpeg'};base64,${asset.base64}`
        : asset.uri;
      setLogoUri(base64Data);
    }
  };

  const handleSaveProfile = async () => {
    setError(null);

    if (!companyName.trim()) {
      setError('Company / Enterprise Name is mandatory.');
      return;
    }

    if (gstNumber.trim() && gstNumber.trim().length !== 15) {
      setError('GST Registration Number must be exactly 15 characters (e.g. 27AAAAA0000A1Z5).');
      return;
    }

    setLoading(true);
    try {
      await updateUserProfile({
        companyName: companyName.trim(),
        company_name: companyName.trim(),
        gstNumber: gstNumber.trim().toUpperCase(),
        gst_number: gstNumber.trim().toUpperCase(),
        tradeSpecialization: industry,
        trade_specialization: industry,
        industry,
        midcZone,
        midc_zone: midcZone,
        contactPerson: contactPerson.trim(),
        contact_person: contactPerson.trim(),
        phone: phone.trim(),
        address: address.trim(),
        website: website.trim(),
        companyDescription: description.trim(),
        company_description: description.trim(),
        companyLogo: logoUri || undefined,
        company_logo: logoUri || undefined,
      });

      setLoading(false);
      Alert.alert(
        'Profile Saved',
        'Your company profile details have been saved directly to the database!'
      );
    } catch (err: any) {
      setLoading(false);
      setError(err.message || 'Failed to update company profile.');
    }
  };

  const handleLogout = () => {
    Alert.alert('Logout Confirmation', 'Are you sure you want to sign out from JobMarket?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Log Out', style: 'destructive', onPress: () => logout() },
    ]);
  };

  return (
    <View style={styles.container}>
      <Header title="Company Profile" />

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {error ? <ErrorBanner message={error} style={{ marginBottom: SPACING.md }} /> : null}

          {/* 3D Header Profile Card */}
          <LinearGradient
            colors={['#0F172A', '#1E3A8A', '#2563EB']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.heroBanner}
          >
            <View style={styles.avatarRow}>
              <TouchableOpacity style={styles.avatarPicker} activeOpacity={0.8} onPress={handlePickLogo}>
                {logoUri ? (
                  <Image source={{ uri: logoUri }} style={styles.avatarImage} />
                ) : (
                  <View style={styles.avatarPlaceholder}>
                    <Building2 size={32} color={COLORS.primary} />
                  </View>
                )}
                <View style={styles.cameraBadge}>
                  <Camera size={13} color={COLORS.textWhite} />
                </View>
              </TouchableOpacity>

              <View style={{ flex: 1 }}>
                <View style={styles.verifiedBadge}>
                  <ShieldCheck size={13} color="#34D399" />
                  <Text style={styles.verifiedText}>Verified Employer</Text>
                </View>
                <Text style={styles.companyTitle} numberOfLines={1}>
                  {companyName || 'Enterprise Company Name'}
                </Text>
                <Text style={styles.emailSubtitle} numberOfLines={1}>
                  {user?.email}
                </Text>
              </View>
            </View>
          </LinearGradient>

          {/* SECTION 1: GENERAL ENTERPRISE DETAILS */}
          <View style={styles.card}>
            <View style={styles.cardTitleBox}>
              <View style={[styles.sectionIconBox, { backgroundColor: '#EFF6FF' }]}>
                <Building2 size={20} color={COLORS.primary} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.sectionTitle}>General Enterprise Details</Text>
                <Text style={styles.sectionSubtitle}>Primary company registration & industrial zone info</Text>
              </View>
            </View>

            <Input
              label="Company / Enterprise Name *"
              placeholder="e.g. Acme Industrial Technologies Pvt Ltd"
              value={companyName}
              onChangeText={setCompanyName}
              leftIcon={<Building2 size={18} color={COLORS.slate400} />}
            />

            <Input
              label="GST Registration Number"
              placeholder="e.g. 27AAAAA0000A1Z5"
              autoCapitalize="characters"
              maxLength={15}
              value={gstNumber}
              onChangeText={setGstNumber}
              leftIcon={<FileText size={18} color={COLORS.slate400} />}
            />

            <SelectDropdown
              label="Primary Industry Sector *"
              required
              placeholder="Select Industry Sector..."
              value={industry}
              options={INDUSTRY_LIST}
              onSelect={(val) => setIndustry(val)}
            />

            <SelectDropdown
              label="MIDC Industrial Zone in Maharashtra"
              placeholder="Select MIDC Zone..."
              value={midcZone}
              options={MIDC_LIST}
              onSelect={(val) => setMidcZone(val)}
            />
          </View>

          {/* SECTION 2: CONTACT & PLANT LOCATION */}
          <View style={styles.card}>
            <View style={styles.cardTitleBox}>
              <View style={[styles.sectionIconBox, { backgroundColor: '#F0FDF4' }]}>
                <UserCheck size={20} color="#15803D" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.sectionTitle}>Contact & Plant Location</Text>
                <Text style={styles.sectionSubtitle}>Recruiter contact person & factory plant details</Text>
              </View>
            </View>

            <Input
              label="Primary Recruiter / HR Contact Person"
              placeholder="e.g. Rajesh Sharma (HR Head)"
              value={contactPerson}
              onChangeText={setContactPerson}
              leftIcon={<UserCheck size={18} color={COLORS.slate400} />}
            />

            <Input
              label="Contact Phone Number"
              placeholder="10-digit mobile number"
              keyboardType="phone-pad"
              maxLength={10}
              value={phone}
              onChangeText={setPhone}
              leftIcon={<Phone size={18} color={COLORS.slate400} />}
            />

            <Input
              label="Company Official Website"
              placeholder="https://www.company.com"
              autoCapitalize="none"
              keyboardType="url"
              value={website}
              onChangeText={setWebsite}
              leftIcon={<Globe size={18} color={COLORS.slate400} />}
            />

            <Input
              label="Registered Plant / Office Address"
              placeholder="Full factory or office street address..."
              multiline
              numberOfLines={2}
              value={address}
              onChangeText={setAddress}
              leftIcon={<MapPin size={18} color={COLORS.slate400} />}
            />

            <Input
              label="Company Overview & Products"
              placeholder="Brief overview of products, CNC capabilities, shifts, or company history..."
              multiline
              numberOfLines={3}
              value={description}
              onChangeText={setDescription}
              style={{ minHeight: 70 }}
            />

            <Button
              title="Save Company Profile"
              onPress={handleSaveProfile}
              loading={loading}
              style={{ marginTop: SPACING.xs }}
            />
          </View>

          {/* SECTION 3: QUICK NAVIGATION & ACCOUNT */}
          <View style={styles.card}>
            <Text style={[styles.sectionTitle, { marginBottom: SPACING.md }]}>
              Account Quick Links
            </Text>

            <TouchableOpacity
              style={styles.navRow}
              activeOpacity={0.7}
              onPress={() => navigation.navigate('SecuritySettings')}
            >
              <View style={[styles.navIconBox, { backgroundColor: '#EFF6FF' }]}>
                <Lock size={18} color={COLORS.primary} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.navTitle}>Security & Active Sessions</Text>
                <Text style={styles.navSubtitle}>Manage passwords & signed-in devices</Text>
              </View>
              <ChevronRight size={18} color={COLORS.slate400} />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.navRow}
              activeOpacity={0.7}
              onPress={() => navigation.navigate('HelpSupport')}
            >
              <View style={[styles.navIconBox, { backgroundColor: '#ECFEFF' }]}>
                <HelpCircle size={18} color="#0891B2" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.navTitle}>Help & Support Desk</Text>
                <Text style={styles.navSubtitle}>FAQ knowledge base & support tickets</Text>
              </View>
              <ChevronRight size={18} color={COLORS.slate400} />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.navRow}
              activeOpacity={0.7}
              onPress={() => navigation.navigate('AboutUs')}
            >
              <View style={[styles.navIconBox, { backgroundColor: '#FEF3C7' }]}>
                <Info size={18} color="#B45309" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.navTitle}>About JobMarket</Text>
                <Text style={styles.navSubtitle}>Industrial marketplace mission & stats</Text>
              </View>
              <ChevronRight size={18} color={COLORS.slate400} />
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.navRow, { borderBottomWidth: 0 }]}
              activeOpacity={0.7}
              onPress={handleLogout}
            >
              <View style={[styles.navIconBox, { backgroundColor: '#FEE2E2' }]}>
                <LogOut size={18} color={COLORS.danger} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.navTitle, { color: COLORS.danger }]}>Logout Account</Text>
                <Text style={styles.navSubtitle}>Sign out from current mobile session</Text>
              </View>
              <ChevronRight size={18} color={COLORS.slate400} />
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    padding: SPACING.lg,
    paddingBottom: SPACING.xxl * 2,
  },
  heroBanner: {
    borderRadius: 8,
    padding: SPACING.lg,
    marginBottom: SPACING.lg,
    borderWidth: 1,
    borderColor: '#1E3A8A',
    borderBottomWidth: 3.5,
    borderBottomColor: '#172554',
    shadowColor: '#1E3A8A',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 4,
  },
  avatarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
  },
  avatarPicker: {
    position: 'relative',
  },
  avatarPlaceholder: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarImage: {
    width: 64,
    height: 64,
    borderRadius: 32,
  },
  cameraBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    backgroundColor: COLORS.primary,
    padding: 5,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    alignSelf: 'flex-start',
    marginBottom: 4,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  verifiedText: {
    color: '#34D399',
    fontSize: 10.5,
    fontWeight: '800',
  },
  companyTitle: {
    ...TYPOGRAPHY.h2,
    fontSize: 18,
    fontWeight: '900',
    color: COLORS.textWhite,
  },
  emailSubtitle: {
    ...TYPOGRAPHY.caption,
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.85)',
  },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: 8,
    padding: SPACING.lg,
    marginBottom: SPACING.lg,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderBottomWidth: 3.5,
    borderBottomColor: '#CBD5E1',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },
  cardTitleBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    marginBottom: SPACING.md,
  },
  sectionIconBox: {
    width: 38,
    height: 38,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  sectionTitle: {
    ...TYPOGRAPHY.h2,
    fontSize: 16.5,
    fontWeight: '800',
    color: COLORS.slate900,
  },
  sectionSubtitle: {
    ...TYPOGRAPHY.caption,
    fontSize: 12,
    color: COLORS.slate500,
    marginTop: 1,
  },
  navRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
    paddingVertical: SPACING.md - 2,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.slate100,
  },
  navIconBox: {
    width: 36,
    height: 36,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  navTitle: {
    ...TYPOGRAPHY.subtitle,
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.slate900,
  },
  navSubtitle: {
    ...TYPOGRAPHY.caption,
    fontSize: 11.5,
    color: COLORS.slate500,
  },
});
