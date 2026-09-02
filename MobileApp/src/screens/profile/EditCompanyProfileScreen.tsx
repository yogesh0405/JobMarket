import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Alert,
  SafeAreaView,
  Platform,
  Modal,
} from 'react-native';
import {
  ArrowLeft,
  Check,
  Camera,
  Building2,
  MapPin,
  Mail,
  Phone,
  Globe,
  FileText,
  AlertCircle,
  X,
  ChevronDown,
} from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import { apiFetch } from '../../api/client';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../context/ToastContext';
import { CompanyLogoAvatar } from '../../components/common/CompanyLogoAvatar';
import { FocusAwareStatusBar } from '../../components/common/FocusAwareStatusBar';
import { COLORS } from '../../constants/theme';

const INDUSTRY_OPTIONS = [
  'Automotive & Auto Components',
  'Industrial Manufacturing',
  'Electronics & Electricals',
  'Pharmaceuticals & Chemicals',
  'Textiles & Garments',
  'Construction & Infrastructure',
  'Logistics & Warehousing',
  'Precision Machining & Forging',
  'Sheet Metal & Plastics',
  'Wiring Harness & Automotive Electronics',
  'Services & General Engineering',
  'Other Industrial Trade...',
];

const SIZE_OPTIONS = [
  '1-50 employees',
  '50-200 employees',
  '200-500 employees',
  '500-1,000 employees',
  '1,000-5,000 employees',
  '5,000-10,000 employees',
  '10,000+ employees',
];

const MIDC_OPTIONS = [
  'Not Applicable (Non-MIDC / Commercial)',
  'Waluj MIDC (Chhatrapati Sambhajinagar)',
  'Chikalthana MIDC (Chhatrapati Sambhajinagar)',
  'Shendra DMIC / MIDC (Chhatrapati Sambhajinagar)',
  'Bidkin DMIC / MIDC (Chhatrapati Sambhajinagar)',
  'Paithan MIDC (Chhatrapati Sambhajinagar)',
  'Railway Station Industrial Area (Chhatrapati Sambhajinagar)',
  'Chakan MIDC (Pune)',
  'Bhosari MIDC (Pune)',
  'Ranjangaon MIDC (Pune)',
  'Hinjawadi MIDC (Pune)',
  'Talegaon MIDC (Pune)',
  'Rabale MIDC (Navi Mumbai)',
  'Taloja MIDC (Navi Mumbai)',
  'Tarapur MIDC (Palghar)',
  'Butibori MIDC (Nagpur)',
  'Ambad MIDC (Nashik)',
  'Satpur MIDC (Nashik)',
  'Other MIDC / Industrial Zone...',
];

const COMPANY_TYPES = [
  'Private Limited',
  'Public Limited',
  'Sole Proprietorship',
  'Partnership Firm',
  'LLP',
  'MNC Branch',
  'Govt Enterprise',
];

export const EditCompanyProfileScreen: React.FC<{ navigation: any; route: any }> = ({
  navigation,
  route,
}) => {
  const insets = useSafeAreaInsets();
  const { user, updateUserProfile, refreshUser } = useAuth();
  const { showToast } = useToast();

  const passedCompany = route?.params?.company;
  const onSaveSuccessCallback = route?.params?.onSaveSuccess;

  // 4-Step Stepper State: 1, 2, 3, 4
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3 | 4>(1);

  // Form State
  const [name, setName] = useState(passedCompany?.name || (user as any)?.company_name || (user as any)?.companyName || user?.name || '');
  const [logo, setLogo] = useState(passedCompany?.logo || passedCompany?.logoUrl || (user as any)?.profile_picture_url || '');
  const [industry, setIndustry] = useState(passedCompany?.industry || 'Automotive & Auto Components');
  const [otherIndustry, setOtherIndustry] = useState('');
  const [companyType, setCompanyType] = useState(passedCompany?.company_type || passedCompany?.companyType || 'Private Limited');
  const [companySize, setCompanySize] = useState(passedCompany?.company_size || passedCompany?.companySize || '200-500 employees');
  const [foundedYear, setFoundedYear] = useState<string>(String(passedCompany?.founded_year || passedCompany?.foundedYear || ''));
  const [website, setWebsite] = useState(passedCompany?.website || '');
  const [phone, setPhone] = useState(passedCompany?.phone || user?.phone || '');
  const [email, setEmail] = useState(passedCompany?.email || user?.email || '');
  const [address, setAddress] = useState(passedCompany?.address || (user as any)?.location || '');
  const [city, setCity] = useState(passedCompany?.city || (user as any)?.location || '');
  const [midcZone, setMidcZone] = useState(passedCompany?.midc_zone || passedCompany?.midcZone || 'Not Applicable (Non-MIDC / Commercial)');
  const [otherMidcZone, setOtherMidcZone] = useState('');
  const [description, setDescription] = useState(passedCompany?.description || (user as any)?.bio || '');
  const rawGstInitial = passedCompany?.gst_number || passedCompany?.gstNumber || (user as any)?.gst_number || (user as any)?.gstNumber || '';
  const cleanGstInitial = rawGstInitial.includes('@') || rawGstInitial.includes('.com') ? '' : rawGstInitial;
  const [gstNumber, setGstNumber] = useState(cleanGstInitial);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Picker Modal State
  const [pickerModalType, setPickerModalType] = useState<'INDUSTRY' | 'MIDC' | 'TYPE' | 'SIZE' | null>(null);

  useEffect(() => {
    if (passedCompany) {
      setName(passedCompany.name || '');
      setLogo(passedCompany.logo || passedCompany.logoUrl || '');
      const rawInd = passedCompany.industry || 'Automotive & Auto Components';
      const isKnown = INDUSTRY_OPTIONS.includes(rawInd) && rawInd !== 'Other Industrial Trade...';
      if (isKnown) {
        setIndustry(rawInd);
        setOtherIndustry('');
      } else {
        setIndustry('Other Industrial Trade...');
        setOtherIndustry(rawInd === 'Other Industrial Trade...' ? '' : rawInd);
      }
      setCompanyType(passedCompany.company_type || passedCompany.companyType || 'Private Limited');
      setCompanySize(passedCompany.company_size || passedCompany.companySize || '200-500 employees');
      setFoundedYear(String(passedCompany.founded_year || passedCompany.foundedYear || ''));
      setWebsite(passedCompany.website || '');
      setPhone(passedCompany.phone || user?.phone || '');
      setEmail(passedCompany.email || user?.email || '');
      setAddress(passedCompany.address || '');
      setCity(passedCompany.city || '');
      const rawMidc = passedCompany.midc_zone || passedCompany.midcZone || 'Not Applicable (Non-MIDC / Commercial)';
      const isKnownMidc = MIDC_OPTIONS.includes(rawMidc) && rawMidc !== 'Other MIDC / Industrial Zone...';
      if (isKnownMidc) {
        setMidcZone(rawMidc);
        setOtherMidcZone('');
      } else {
        setMidcZone('Other MIDC / Industrial Zone...');
        setOtherMidcZone(rawMidc === 'Other MIDC / Industrial Zone...' ? '' : rawMidc);
      }
      setDescription(passedCompany.description || '');
      const rawGst = passedCompany.gst_number || passedCompany.gstNumber || '';
      setGstNumber(rawGst.includes('@') || rawGst.includes('.com') ? '' : rawGst);
    }
  }, [passedCompany]);

  const handleImageUpload = async () => {
    const permResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permResult.granted) {
      Alert.alert('Permission Denied', 'Permission to access gallery is required to upload logo.');
      return;
    }

    const pickerResult = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
      base64: true,
    });

    if (!pickerResult.canceled && pickerResult.assets && pickerResult.assets.length > 0) {
      const asset = pickerResult.assets[0];
      const photoUri = asset.base64 ? `data:image/jpeg;base64,${asset.base64}` : asset.uri;
      setLogo(photoUri);
    }
  };

  const handleNextStep = () => {
    setErrorMsg(null);
    if (currentStep === 1) {
      if (!name.trim()) {
        setErrorMsg('Company name is required.');
        return;
      }
      if (!industry.trim()) {
        setErrorMsg('Industry sector is required.');
        return;
      }
      if (industry === 'Other Industrial Trade...' && !otherIndustry.trim()) {
        setErrorMsg('Please specify your custom industry / trade sector.');
        return;
      }
      setCurrentStep(2);
    } else if (currentStep === 2) {
      if (gstNumber.trim() && gstNumber.trim().length !== 15) {
        setErrorMsg('GST Registration Number must be exactly 15 characters.');
        return;
      }
      setCurrentStep(3);
    } else if (currentStep === 3) {
      if (!city.trim()) {
        setErrorMsg('City / Location is required.');
        return;
      }
      if (midcZone === 'Other MIDC / Industrial Zone...' && !otherMidcZone.trim()) {
        setErrorMsg('Please specify your custom MIDC / Industrial Zone name.');
        return;
      }
      setCurrentStep(4);
    }
  };

  const handlePrevStep = () => {
    setErrorMsg(null);
    if (currentStep > 1) {
      setCurrentStep((prev) => (prev - 1) as any);
    } else {
      navigation.goBack();
    }
  };

  const handleSubmit = async () => {
    setErrorMsg(null);

    if (!name.trim()) {
      setErrorMsg('Company name is required.');
      setCurrentStep(1);
      return;
    }

    if (industry === 'Other Industrial Trade...' && !otherIndustry.trim()) {
      setErrorMsg('Please specify your custom industry / trade sector.');
      setCurrentStep(1);
      return;
    }

    if (midcZone === 'Other MIDC / Industrial Zone...' && !otherMidcZone.trim()) {
      setErrorMsg('Please specify your custom MIDC / Industrial Zone name.');
      setCurrentStep(3);
      return;
    }

    const cleanPhone = phone.replace(/[^0-9]/g, '').slice(0, 10);
    if (cleanPhone && (cleanPhone.length !== 10 || !/^[6-9]/.test(cleanPhone))) {
      setErrorMsg('Helpline phone number must be a valid 10-digit Indian mobile number starting with 6, 7, 8, or 9.');
      setCurrentStep(4);
      return;
    }

    setIsSubmitting(true);

    const finalIndustry =
      industry === 'Other Industrial Trade...'
        ? (otherIndustry.trim() || 'General Engineering')
        : industry.trim();

    const finalMidcZone =
      midcZone === 'Other MIDC / Industrial Zone...'
        ? (otherMidcZone.trim() || 'Private Industrial Zone')
        : midcZone.trim();

    try {
      const companyId = passedCompany?.id || user?.id || encodeURIComponent(name.trim());
      const res = await apiFetch(`/api/v1/companies/${companyId}`, {
        method: 'PUT',
        body: JSON.stringify({
          name: name.trim(),
          logo: logo.trim(),
          industry: finalIndustry,
          company_type: companyType,
          companyType: companyType,
          company_size: companySize,
          companySize: companySize,
          founded_year: foundedYear ? Number(foundedYear) : undefined,
          foundedYear: foundedYear ? Number(foundedYear) : undefined,
          website: website.trim(),
          phone: phone.trim(),
          email: email.trim(),
          address: address.trim(),
          city: city.trim(),
          midc_zone: finalMidcZone,
          midcZone: finalMidcZone,
          description: description.trim(),
          gst_number: gstNumber.trim().toUpperCase(),
        }),
      });

      if (res && (res.success === false || res.error)) {
        throw new Error(res.error || res.message || 'Failed to update company profile.');
      }

      const updatedCompanyData = res?.data || res?.company || {
        ...passedCompany,
        id: passedCompany?.id || companyId,
        name: name.trim(),
        logo: logo.trim(),
        industry: finalIndustry,
        company_type: companyType,
        company_size: companySize,
        founded_year: Number(foundedYear) || 2005,
        website: website.trim(),
        phone: phone.trim(),
        email: email.trim(),
        address: address.trim(),
        city: city.trim(),
        midc_zone: finalMidcZone,
        description: description.trim(),
        gst_number: gstNumber.trim().toUpperCase(),
      };

      if (onSaveSuccessCallback) {
        onSaveSuccessCallback(updatedCompanyData);
      }

      // Sync auth session state
      await updateUserProfile({
        company_name: name.trim(),
        companyName: name.trim(),
        gst_number: gstNumber.trim().toUpperCase(),
        gstNumber: gstNumber.trim().toUpperCase(),
        ...(logo ? { profile_picture_url: logo, company_logo: logo } : {}),
      } as any).catch(() => {});

      await refreshUser().catch(() => {});

      showToast('Company profile updated successfully!', 'success');
      navigation.goBack();
    } catch (err: any) {
      setErrorMsg(err.message || 'An unexpected error occurred while saving.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getPickerData = () => {
    switch (pickerModalType) {
      case 'INDUSTRY':
        return {
          title: 'Select Industry Sector',
          options: INDUSTRY_OPTIONS,
          selected: industry,
          onSelect: (val: string) => setIndustry(val),
        };
      case 'MIDC':
        return {
          title: 'Select MIDC Industrial Zone',
          options: MIDC_OPTIONS,
          selected: midcZone,
          onSelect: (val: string) => setMidcZone(val),
        };
      case 'TYPE':
        return {
          title: 'Select Company Legal Type',
          options: COMPANY_TYPES,
          selected: companyType,
          onSelect: (val: string) => setCompanyType(val),
        };
      case 'SIZE':
        return {
          title: 'Select Company Size',
          options: SIZE_OPTIONS,
          selected: companySize,
          onSelect: (val: string) => setCompanySize(val),
        };
      default:
        return null;
    }
  };

  const pickerInfo = getPickerData();

  return (
    <SafeAreaView style={styles.screenContainer}>
      <FocusAwareStatusBar barStyle="light-content" backgroundColor="#0A58E2" />

      {/* Top Navigation Header */}
      <View style={styles.topHeader}>
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => navigation.goBack()}
          style={styles.backBtn}
        >
          <ArrowLeft size={22} color="#FFFFFF" strokeWidth={2.4} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Edit Company Profile</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Stepper Progress Bar */}
      <View style={styles.stepperContainer}>
        <View style={styles.stepItemsRow}>
          {/* Step 1 */}
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => setCurrentStep(1)}
            style={styles.stepItem}
          >
            <View style={[
              styles.stepCircle,
              currentStep === 1 && styles.stepCircleActive,
              currentStep > 1 && styles.stepCircleCompleted
            ]}>
              {currentStep > 1 ? <Check size={14} color="#FFFFFF" strokeWidth={3} /> : <Text style={[styles.stepNumText, currentStep === 1 && styles.stepNumTextActive]}>1</Text>}
            </View>
            <Text style={[styles.stepLabelText, currentStep === 1 && styles.stepLabelTextActive]}>Basic</Text>
          </TouchableOpacity>

          <View style={[styles.stepLine, currentStep > 1 && styles.stepLineActive]} />

          {/* Step 2 */}
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => currentStep > 1 && setCurrentStep(2)}
            style={styles.stepItem}
          >
            <View style={[
              styles.stepCircle,
              currentStep === 2 && styles.stepCircleActive,
              currentStep > 2 && styles.stepCircleCompleted
            ]}>
              {currentStep > 2 ? <Check size={14} color="#FFFFFF" strokeWidth={3} /> : <Text style={[styles.stepNumText, currentStep === 2 && styles.stepNumTextActive]}>2</Text>}
            </View>
            <Text style={[styles.stepLabelText, currentStep === 2 && styles.stepLabelTextActive]}>Overview</Text>
          </TouchableOpacity>

          <View style={[styles.stepLine, currentStep > 2 && styles.stepLineActive]} />

          {/* Step 3 */}
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => currentStep > 2 && setCurrentStep(3)}
            style={styles.stepItem}
          >
            <View style={[
              styles.stepCircle,
              currentStep === 3 && styles.stepCircleActive,
              currentStep > 3 && styles.stepCircleCompleted
            ]}>
              {currentStep > 3 ? <Check size={14} color="#FFFFFF" strokeWidth={3} /> : <Text style={[styles.stepNumText, currentStep === 3 && styles.stepNumTextActive]}>3</Text>}
            </View>
            <Text style={[styles.stepLabelText, currentStep === 3 && styles.stepLabelTextActive]}>Location</Text>
          </TouchableOpacity>

          <View style={[styles.stepLine, currentStep > 3 && styles.stepLineActive]} />

          {/* Step 4 */}
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => currentStep > 3 && setCurrentStep(4)}
            style={styles.stepItem}
          >
            <View style={[
              styles.stepCircle,
              currentStep === 4 && styles.stepCircleActive
            ]}>
              <Text style={[styles.stepNumText, currentStep === 4 && styles.stepNumTextActive]}>4</Text>
            </View>
            <Text style={[styles.stepLabelText, currentStep === 4 && styles.stepLabelTextActive]}>Contact</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Error Alert Box */}
      {errorMsg ? (
        <View style={styles.errorBox}>
          <AlertCircle size={16} color="#DC2626" />
          <Text style={styles.errorText}>{errorMsg}</Text>
        </View>
      ) : null}

      {/* Form Body Scroll Area */}
      <ScrollView
        style={styles.scrollBody}
        contentContainerStyle={[styles.scrollBodyContent, { paddingBottom: insets.bottom + 100 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* STEP 1: Basic Details & Logo */}
        {currentStep === 1 && (
          <View style={styles.stepContainer}>
            {/* Photo Upload Avatar Header */}
            <View style={styles.avatarHeaderWrap}>
              <View style={styles.avatarOuterWrapper}>
                <View style={styles.avatarInnerWrapper}>
                  <CompanyLogoAvatar logoUrl={logo} companyName={name || 'Company'} size={64} borderRadius={32} />
                </View>
                <TouchableOpacity activeOpacity={0.85} onPress={handleImageUpload} style={styles.cameraBadgeBtn}>
                  <Camera size={13} color="#2563EB" strokeWidth={2.5} />
                </TouchableOpacity>
              </View>
              <Text style={styles.avatarSubtitleText}>Tap camera to update logo</Text>
            </View>

            {/* Company Information Form Box */}
            <View style={styles.cardBox}>
              <Text style={styles.cardBoxTitle}>Company Information</Text>

              <View style={styles.fieldWrap}>
                <Text style={styles.fieldLabel}>Company Name <Text style={styles.reqStar}>*</Text></Text>
                <TextInput
                  style={styles.textInput}
                  value={name}
                  onChangeText={setName}
                  placeholder="e.g. Bajaj Auto Limited"
                  placeholderTextColor="#94A3B8"
                />
              </View>

              <View style={styles.fieldWrap}>
                <Text style={styles.fieldLabel}>Industry Sector <Text style={styles.reqStar}>*</Text></Text>
                <TouchableOpacity
                  activeOpacity={0.8}
                  style={styles.pickerSelectorBtn}
                  onPress={() => setPickerModalType('INDUSTRY')}
                >
                  <Text style={styles.pickerSelectorText}>{industry}</Text>
                  <ChevronDown size={16} color="#64748B" />
                </TouchableOpacity>
              </View>

              {/* Custom Industry / Trade Input Field when 'Other' is selected */}
              {industry === 'Other Industrial Trade...' && (
                <View style={styles.fieldWrap}>
                  <Text style={styles.fieldLabel}>
                    Specify Custom Trade / Industry Sector <Text style={styles.reqStar}>*</Text>
                  </Text>
                  <TextInput
                    style={styles.textInput}
                    value={otherIndustry}
                    onChangeText={(t) => {
                      setOtherIndustry(t);
                      if (errorMsg) setErrorMsg(null);
                    }}
                    placeholder="e.g. Aerospace Machining / Robotics / Foundry"
                    placeholderTextColor="#94A3B8"
                  />
                </View>
              )}

              <View style={styles.fieldWrap}>
                <Text style={styles.fieldLabel}>Company Legal Type</Text>
                <TouchableOpacity
                  activeOpacity={0.8}
                  style={styles.pickerSelectorBtn}
                  onPress={() => setPickerModalType('TYPE')}
                >
                  <Text style={styles.pickerSelectorText}>{companyType}</Text>
                  <ChevronDown size={16} color="#64748B" />
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}

        {/* STEP 2: Operations & Scale */}
        {currentStep === 2 && (
          <View style={styles.stepContainer}>
            <View style={styles.cardBox}>
              <Text style={styles.cardBoxTitle}>Operations & Scale</Text>

              <View style={styles.fieldWrap}>
                <Text style={styles.fieldLabel}>Company Bio / Description</Text>
                <TextInput
                  style={[styles.textInput, styles.textArea]}
                  value={description}
                  onChangeText={setDescription}
                  multiline
                  numberOfLines={4}
                  placeholder="Brief summary of your manufacturing operations, plant capacity, and career growth opportunities for technical candidates..."
                  placeholderTextColor="#94A3B8"
                  textAlignVertical="top"
                />
              </View>

              <View style={styles.rowGrid}>
                <View style={[styles.fieldWrap, { flex: 1 }]}>
                  <Text style={styles.fieldLabel}>Company Size</Text>
                  <TouchableOpacity
                    activeOpacity={0.8}
                    style={styles.pickerSelectorBtn}
                    onPress={() => setPickerModalType('SIZE')}
                  >
                    <Text style={[styles.pickerSelectorText, { fontSize: 12 }]} numberOfLines={1}>{companySize}</Text>
                    <ChevronDown size={14} color="#64748B" />
                  </TouchableOpacity>
                </View>

                <View style={[styles.fieldWrap, { flex: 1 }]}>
                  <Text style={styles.fieldLabel}>Founded Year</Text>
                  <TextInput
                    style={styles.textInput}
                    value={foundedYear}
                    onChangeText={setFoundedYear}
                    keyboardType="numeric"
                    placeholder="e.g. 2005"
                    placeholderTextColor="#94A3B8"
                  />
                </View>
              </View>

              <View style={styles.fieldWrap}>
                <Text style={styles.fieldLabel}>GST Registration Number (Optional)</Text>
                <TextInput
                  style={[styles.textInput, styles.monoInput]}
                  value={gstNumber}
                  onChangeText={(val) => setGstNumber(val.toUpperCase())}
                  maxLength={15}
                  placeholder="e.g. 27AAACB2211R1ZM"
                  placeholderTextColor="#94A3B8"
                  autoCapitalize="characters"
                />
              </View>
            </View>
          </View>
        )}

        {/* STEP 3: Location & MIDC Zone */}
        {currentStep === 3 && (
          <View style={styles.stepContainer}>
            <View style={styles.cardBox}>
              <Text style={styles.cardBoxTitle}>Location & MIDC Zone</Text>

              <View style={styles.fieldWrap}>
                <Text style={styles.fieldLabel}>City / Location <Text style={styles.reqStar}>*</Text></Text>
                <TextInput
                  style={styles.textInput}
                  value={city}
                  onChangeText={setCity}
                  placeholder="e.g. Chhatrapati Sambhajinagar"
                  placeholderTextColor="#94A3B8"
                />
              </View>

              <View style={styles.fieldWrap}>
                <Text style={styles.fieldLabel}>MIDC Industrial Zone <Text style={styles.reqStar}>*</Text></Text>
                <TouchableOpacity
                  activeOpacity={0.8}
                  style={styles.pickerSelectorBtn}
                  onPress={() => setPickerModalType('MIDC')}
                >
                  <Text style={styles.pickerSelectorText} numberOfLines={1}>{midcZone}</Text>
                  <ChevronDown size={16} color="#64748B" />
                </TouchableOpacity>
              </View>

              {/* Additional Manual Input for Custom MIDC / Industrial Zone */}
              {midcZone === 'Other MIDC / Industrial Zone...' && (
                <View style={styles.fieldWrap}>
                  <Text style={styles.fieldLabel}>
                    Specify MIDC / Industrial Zone Name <Text style={styles.reqStar}>*</Text>
                  </Text>
                  <TextInput
                    style={styles.textInput}
                    value={otherMidcZone}
                    onChangeText={(t) => {
                      setOtherMidcZone(t);
                      if (errorMsg) setErrorMsg(null);
                    }}
                    placeholder="e.g. Supa MIDC (Ahmednagar) / Kagal MIDC (Kolhapur)"
                    placeholderTextColor="#94A3B8"
                  />
                </View>
              )}

              <View style={styles.fieldWrap}>
                <Text style={styles.fieldLabel}>Factory / Plant Address</Text>
                <TextInput
                  style={[styles.textInput, styles.textArea]}
                  value={address}
                  onChangeText={setAddress}
                  multiline
                  numberOfLines={3}
                  placeholder="e.g. Plot No. E-10, MIDC Waluj Industrial Area, Gate No. 4..."
                  placeholderTextColor="#94A3B8"
                  textAlignVertical="top"
                />
              </View>
            </View>
          </View>
        )}

        {/* STEP 4: Contact & Digital Presence */}
        {currentStep === 4 && (
          <View style={styles.stepContainer}>
            <View style={styles.cardBox}>
              <Text style={styles.cardBoxTitle}>Contact Information & Digital Presence</Text>

              <View style={styles.fieldWrap}>
                <Text style={styles.fieldLabel}>Helpline Phone Number</Text>
                <TextInput
                  style={styles.textInput}
                  value={phone}
                  onChangeText={(val) => setPhone(val.replace(/[^0-9]/g, '').slice(0, 10))}
                  keyboardType="number-pad"
                  maxLength={10}
                  placeholder="10-digit mobile number"
                  placeholderTextColor="#94A3B8"
                />
              </View>

              <View style={styles.fieldWrap}>
                <Text style={styles.fieldLabel}>Official HR Email</Text>
                <TextInput
                  style={styles.textInput}
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  placeholder="e.g. hr@company.com"
                  placeholderTextColor="#94A3B8"
                />
              </View>

              <View style={styles.fieldWrap}>
                <Text style={styles.fieldLabel}>Official Company Website</Text>
                <TextInput
                  style={styles.textInput}
                  value={website}
                  onChangeText={setWebsite}
                  keyboardType="url"
                  autoCapitalize="none"
                  placeholder="e.g. https://www.company.com"
                  placeholderTextColor="#94A3B8"
                />
              </View>
            </View>
          </View>
        )}
      </ScrollView>

      {/* Footer Navigation Action Bar */}
      <View style={[styles.bottomFooter, { paddingBottom: Math.max(insets.bottom, 16) }]}>
        <TouchableOpacity
          style={styles.secondaryNavBtn}
          activeOpacity={0.8}
          onPress={handlePrevStep}
        >
          <Text style={styles.secondaryNavBtnText}>{currentStep === 1 ? 'Cancel' : 'Previous'}</Text>
        </TouchableOpacity>

        {currentStep < 4 ? (
          <TouchableOpacity
            style={styles.primaryNavBtn}
            activeOpacity={0.85}
            onPress={handleNextStep}
          >
            <Text style={styles.primaryNavBtnText}>Next Step</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={[styles.primaryNavBtn, isSubmitting && { opacity: 0.7 }]}
            activeOpacity={0.85}
            onPress={handleSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <ActivityIndicator color="#FFFFFF" size="small" />
            ) : (
              <Text style={styles.primaryNavBtnText}>Save & Update Profile</Text>
            )}
          </TouchableOpacity>
        )}
      </View>

      {/* Selection Bottom Sheet Modal */}
      {pickerInfo ? (
        <Modal
          visible={Boolean(pickerModalType)}
          transparent
          animationType="fade"
          onRequestClose={() => setPickerModalType(null)}
        >
          <TouchableOpacity
            style={styles.pickerModalOverlay}
            activeOpacity={1}
            onPress={() => setPickerModalType(null)}
          >
            <View style={styles.pickerModalContent} onStartShouldSetResponder={() => true}>
              <View style={styles.pickerModalHeader}>
                <Text style={styles.pickerModalTitle}>{pickerInfo.title}</Text>
                <TouchableOpacity onPress={() => setPickerModalType(null)} style={styles.pickerModalCloseBtn}>
                  <X size={18} color="#64748B" />
                </TouchableOpacity>
              </View>

              <ScrollView style={styles.pickerModalList} showsVerticalScrollIndicator={false}>
                {pickerInfo.options.map((opt, idx) => {
                  const isSelected = pickerInfo.selected === opt;
                  return (
                    <TouchableOpacity
                      key={idx}
                      style={[styles.pickerOptionItem, isSelected && styles.pickerOptionItemSelected]}
                      onPress={() => {
                        pickerInfo.onSelect(opt);
                        setPickerModalType(null);
                      }}
                      activeOpacity={0.7}
                    >
                      <Text style={[styles.pickerOptionText, isSelected && styles.pickerOptionTextSelected]}>
                        {opt}
                      </Text>
                      {isSelected ? <Check size={16} color="#2563EB" strokeWidth={2.5} /> : null}
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </View>
          </TouchableOpacity>
        </Modal>
      ) : null}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  screenContainer: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  topHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#0A58E2',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  backBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  stepperContainer: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  stepItemsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  stepItem: {
    alignItems: 'center',
    zIndex: 2,
  },
  stepCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#F1F5F9',
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepCircleActive: {
    backgroundColor: '#EFF6FF',
    borderColor: '#2563EB',
  },
  stepCircleCompleted: {
    backgroundColor: '#2563EB',
    borderColor: '#2563EB',
  },
  stepNumText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#64748B',
  },
  stepNumTextActive: {
    color: '#2563EB',
  },
  stepLabelText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#64748B',
    marginTop: 4,
  },
  stepLabelTextActive: {
    fontWeight: '800',
    color: '#0F172A',
  },
  stepLine: {
    flex: 1,
    height: 2,
    backgroundColor: '#E2E8F0',
    marginHorizontal: 4,
    marginTop: -16,
  },
  stepLineActive: {
    backgroundColor: '#2563EB',
  },
  errorBox: {
    marginHorizontal: 16,
    marginTop: 12,
    padding: 12,
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FCA5A5',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  errorText: {
    fontSize: 12.5,
    color: '#DC2626',
    fontWeight: '600',
    flex: 1,
  },
  scrollBody: {
    flex: 1,
  },
  scrollBodyContent: {
    padding: 16,
  },
  stepContainer: {
    gap: 16,
  },
  avatarHeaderWrap: {
    alignItems: 'center',
    marginVertical: 8,
  },
  avatarOuterWrapper: {
    position: 'relative',
    width: 68,
    height: 68,
  },
  avatarInnerWrapper: {
    width: '100%',
    height: '100%',
    borderRadius: 32,
    overflow: 'hidden',
  },
  cameraBadgeBtn: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#2563EB',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
    elevation: 4,
  },
  avatarSubtitleText: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 6,
    fontWeight: '500',
  },
  cardBox: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 16,
    gap: 14,
  },
  cardBoxTitle: {
    fontSize: 14.5,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 4,
  },
  fieldWrap: {
    gap: 6,
  },
  fieldLabel: {
    fontSize: 12.5,
    fontWeight: '600',
    color: '#334155',
  },
  reqStar: {
    color: '#DC2626',
  },
  textInput: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 13.5,
    color: '#0F172A',
  },
  textArea: {
    minHeight: 80,
    paddingTop: 10,
  },
  monoInput: {
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    letterSpacing: 1,
    fontWeight: '600',
  },
  rowGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  pickerSelectorBtn: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    paddingHorizontal: 12,
    paddingVertical: 11,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  pickerSelectorText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#0F172A',
    flex: 1,
  },
  bottomFooter: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    gap: 12,
  },
  secondaryNavBtn: {
    flex: 1,
    backgroundColor: '#F1F5F9',
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#CBD5E1',
  },
  secondaryNavBtnText: {
    fontSize: 13.5,
    fontWeight: '700',
    color: '#475569',
  },
  primaryNavBtn: {
    flex: 1.6,
    backgroundColor: COLORS.primary || '#0A58E2',
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryNavBtnText: {
    fontSize: 13.5,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  pickerModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    justifyContent: 'flex-end',
  },
  pickerModalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    maxHeight: '75%',
    paddingBottom: 24,
  },
  pickerModalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  pickerModalTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
  },
  pickerModalCloseBtn: {
    padding: 4,
  },
  pickerModalList: {
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  pickerOptionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  pickerOptionItemSelected: {
    backgroundColor: '#EFF6FF',
  },
  pickerOptionText: {
    fontSize: 13.5,
    color: '#334155',
    fontWeight: '500',
    flex: 1,
  },
  pickerOptionTextSelected: {
    color: '#2563EB',
    fontWeight: '700',
  },
});
