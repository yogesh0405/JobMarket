import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  TextInput,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Alert,
  Image,
  SafeAreaView,
  StatusBar,
  Platform,
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
import * as ImagePicker from 'expo-image-picker';
import { apiFetch } from '../../../api/client';
import { CompanyLogoAvatar } from '../../../components/common/CompanyLogoAvatar';
import { COLORS } from '../../../constants/theme';

interface EditCompanyProfileModalProps {
  visible: boolean;
  onClose: () => void;
  company: any;
  onSaveSuccess: (updatedCompany: any) => void;
}

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
  'Waluj MIDC (Chhatrapati Sambhajinagar)',
  'Chikalthana MIDC (Chhatrapati Sambhajinagar)',
  'Paithan MIDC (Chhatrapati Sambhajinagar)',
  'Shendra DMIC / MIDC (Chhatrapati Sambhajinagar)',
  'Bidkin DMIC / MIDC (Chhatrapati Sambhajinagar)',
  'Railway Station Industrial Area (Chhatrapati Sambhajinagar)',
  'Chakan MIDC (Pune)',
  'Bhosari MIDC (Pune)',
  'Ranjangaon MIDC (Pune)',
  'Hinjawadi MIDC (Pune)',
  'Rabale MIDC (Navi Mumbai)',
  'Taloja MIDC (Navi Mumbai)',
  'Tarapur MIDC (Palghar)',
  'Butibori MIDC (Nagpur)',
  'Non-MIDC Private Industrial Zone',
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

export const EditCompanyProfileModal: React.FC<EditCompanyProfileModalProps> = ({
  visible,
  onClose,
  company,
  onSaveSuccess,
}) => {
  if (!visible) return null;

  // 4-Step Stepper State: 1, 2, 3, 4
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3 | 4>(1);

  // Form State
  const [name, setName] = useState(company?.name || '');
  const [logo, setLogo] = useState(company?.logo || company?.logoUrl || '');
  const [industry, setIndustry] = useState(company?.industry || 'Industrial Manufacturing');
  const [companyType, setCompanyType] = useState(company?.company_type || company?.companyType || 'Private Limited');
  const [companySize, setCompanySize] = useState(company?.company_size || company?.companySize || '200-500 employees');
  const [foundedYear, setFoundedYear] = useState<string>(String(company?.founded_year || company?.foundedYear || '2005'));
  const [website, setWebsite] = useState(company?.website || '');
  const [phone, setPhone] = useState(company?.phone || '');
  const [email, setEmail] = useState(company?.email || '');
  const [address, setAddress] = useState(company?.address || '');
  const [city, setCity] = useState(company?.city || 'Chhatrapati Sambhajinagar');
  const [midcZone, setMidcZone] = useState(company?.midc_zone || company?.midcZone || 'Waluj MIDC (Chhatrapati Sambhajinagar)');
  const [description, setDescription] = useState(company?.description || '');
  const rawGstInitial = company?.gst_number || company?.gstNumber || '';
  const cleanGstInitial = rawGstInitial.includes('@') || rawGstInitial.includes('.com') ? '' : rawGstInitial;
  const [gstNumber, setGstNumber] = useState(cleanGstInitial);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Picker Modal State
  const [pickerModalType, setPickerModalType] = useState<'INDUSTRY' | 'MIDC' | 'TYPE' | 'SIZE' | null>(null);

  useEffect(() => {
    if (visible && company) {
      setName(company.name || '');
      setLogo(company.logo || company.logoUrl || '');
      setIndustry(company.industry || 'Industrial Manufacturing');
      setCompanyType(company.company_type || company.companyType || 'Private Limited');
      setCompanySize(company.company_size || company.companySize || '200-500 employees');
      setFoundedYear(String(company.founded_year || company.foundedYear || '2005'));
      setWebsite(company.website || '');
      setPhone(company.phone || '');
      setEmail(company.email || '');
      setAddress(company.address || '');
      setCity(company.city || 'Chhatrapati Sambhajinagar');
      setMidcZone(company.midc_zone || company.midcZone || 'Waluj MIDC (Chhatrapati Sambhajinagar)');
      setDescription(company.description || '');
      const rawGst = company.gst_number || company.gstNumber || '';
      setGstNumber(rawGst.includes('@') || rawGst.includes('.com') ? '' : rawGst);
      setCurrentStep(1);
      setErrorMsg(null);
    }
  }, [visible, company]);

  const handleImageUpload = async () => {
    const permResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permResult.granted) {
      Alert.alert('Permission Required', 'Permission to access gallery is required to upload company logo.');
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
      const photoUri = asset.base64 ? `data:${asset.mimeType || 'image/jpeg'};base64,${asset.base64}` : (asset.uri || '');
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
      setCurrentStep(4);
    }
  };

  const handlePrevStep = () => {
    setErrorMsg(null);
    if (currentStep > 1) {
      setCurrentStep((prev) => (prev - 1) as any);
    }
  };

  const handleSubmit = async () => {
    setErrorMsg(null);

    if (!name.trim()) {
      setErrorMsg('Company name is required.');
      setCurrentStep(1);
      return;
    }

    setIsSubmitting(true);

    try {
      const companyId = company?.id || encodeURIComponent(name.trim());
      const res = await apiFetch(`/api/v1/companies/${companyId}`, {
        method: 'PUT',
        body: JSON.stringify({
          name: name.trim(),
          logo: logo.trim(),
          industry,
          company_type: companyType,
          company_size: companySize,
          founded_year: Number(foundedYear) || 2005,
          website: website.trim(),
          phone: phone.trim(),
          email: email.trim(),
          address: address.trim(),
          city: city.trim(),
          midc_zone: midcZone.trim(),
          description: description.trim(),
          gst_number: gstNumber.trim().toUpperCase(),
        }),
      });

      if (res && (res.success === false || res.error)) {
        throw new Error(res.error || res.message || 'Failed to update company profile.');
      }

      const updatedData = res?.data || res?.company || res;
      onSaveSuccess(updatedData);
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'An unexpected error occurred while saving.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={false} onRequestClose={onClose}>
      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

        {/* Modal Header */}
        <View style={styles.modalHeader}>
          <TouchableOpacity activeOpacity={0.7} onPress={onClose} style={styles.backBtn} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
            <ArrowLeft size={22} color="#1E293B" strokeWidth={2} />
          </TouchableOpacity>
          <View style={styles.headerTitleWrap}>
            <Text style={styles.headerTitleText}>Edit Company Profile</Text>
            <Text style={styles.headerSubtitleText}>Update factory details & business preferences</Text>
          </View>
        </View>

        {/* 4-Step Stepper Indicator Bar */}
        <View style={styles.stepperBar}>
          <View style={styles.stepperRow}>
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
        <ScrollView style={styles.scrollBody} contentContainerStyle={styles.scrollBodyContent} showsVerticalScrollIndicator={false}>

          {/* STEP 1: Basic Details & Logo */}
          {currentStep === 1 && (
            <View style={styles.stepContainer}>
              {/* Photo Upload Avatar Header */}
              <View style={styles.avatarHeaderWrap}>
                <View style={styles.avatarOuterWrapper}>
                  <View style={styles.avatarCircleInner}>
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

          {/* STEP 2: Overview & Operations */}
          {currentStep === 2 && (
            <View style={styles.stepContainer}>
              <View style={styles.cardBox}>
                <Text style={styles.cardBoxTitle}>Business Overview & Operations</Text>

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
                  <Text style={styles.fieldLabel}>Official Website URL</Text>
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

        {/* Modal Bottom Action Footer Bar */}
        <View style={styles.modalFooterBar}>
          {currentStep > 1 && (
            <TouchableOpacity activeOpacity={0.8} onPress={handlePrevStep} style={styles.backStepBtn}>
              <Text style={styles.backStepBtnText}>Back</Text>
            </TouchableOpacity>
          )}

          {currentStep < 4 ? (
            <TouchableOpacity activeOpacity={0.85} onPress={handleNextStep} style={styles.nextStepBtn}>
              <Text style={styles.nextStepBtnText}>Continue to Step {currentStep + 1}</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              activeOpacity={0.85}
              onPress={handleSubmit}
              disabled={isSubmitting}
              style={[styles.nextStepBtn, isSubmitting && { opacity: 0.7 }]}
            >
              {isSubmitting ? (
                <ActivityIndicator color="#FFFFFF" size="small" />
              ) : (
                <Text style={styles.nextStepBtnText}>Save Profile</Text>
              )}
            </TouchableOpacity>
          )}
        </View>

        {/* Option Picker Modal */}
        {pickerModalType ? (
          <Modal transparent animationType="fade" visible={!!pickerModalType} onRequestClose={() => setPickerModalType(null)}>
            <TouchableOpacity activeOpacity={1} style={styles.pickerBackdrop} onPress={() => setPickerModalType(null)}>
              <View style={styles.pickerContainer}>
                <View style={styles.pickerHeader}>
                  <Text style={styles.pickerTitle}>
                    {pickerModalType === 'INDUSTRY' ? 'Select Industry Sector' :
                     pickerModalType === 'MIDC' ? 'Select MIDC Zone' :
                     pickerModalType === 'TYPE' ? 'Select Company Type' : 'Select Company Size'}
                  </Text>
                  <TouchableOpacity onPress={() => setPickerModalType(null)}>
                    <X size={20} color="#64748B" />
                  </TouchableOpacity>
                </View>
                <ScrollView style={{ maxHeight: 320 }}>
                  {(pickerModalType === 'INDUSTRY' ? INDUSTRY_OPTIONS :
                    pickerModalType === 'MIDC' ? MIDC_OPTIONS :
                    pickerModalType === 'TYPE' ? COMPANY_TYPES : SIZE_OPTIONS).map((opt) => (
                    <TouchableOpacity
                      key={opt}
                      style={styles.pickerOptionRow}
                      onPress={() => {
                        if (pickerModalType === 'INDUSTRY') setIndustry(opt);
                        else if (pickerModalType === 'MIDC') setMidcZone(opt);
                        else if (pickerModalType === 'TYPE') setCompanyType(opt);
                        else setCompanySize(opt);
                        setPickerModalType(null);
                      }}
                    >
                      <Text style={styles.pickerOptionText}>{opt}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            </TouchableOpacity>
          </Modal>
        ) : null}
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    backgroundColor: '#FFFFFF',
    gap: 12,
  },
  backBtn: {
    padding: 4,
  },
  headerTitleWrap: {
    flex: 1,
  },
  headerTitleText: {
    fontSize: 17,
    fontWeight: '800',
    color: '#0F172A',
  },
  headerSubtitleText: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  stepperBar: {
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  stepperRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  stepItem: {
    alignItems: 'center',
    flex: 1,
  },
  stepCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepCircleActive: {
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
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
    fontWeight: '600',
    color: '#991B1B',
    flex: 1,
  },
  scrollBody: {
    flex: 1,
  },
  scrollBodyContent: {
    padding: 16,
    paddingBottom: 40,
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
  avatarCircleInner: {
    width: '100%',
    height: '100%',
    borderRadius: 34,
    borderWidth: 2,
    borderColor: '#FFFFFF',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
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
    fontWeight: '600',
    color: '#64748B',
    marginTop: 8,
  },
  cardBox: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 0,
    padding: 16,
    gap: 14,
  },
  cardBoxTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 4,
  },
  fieldWrap: {
    gap: 6,
  },
  fieldLabel: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#0F172A',
  },
  reqStar: {
    color: '#DC2626',
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 0,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 13.5,
    color: '#0F172A',
    backgroundColor: '#FFFFFF',
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  monoInput: {
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  pickerSelectorBtn: {
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 0,
    paddingHorizontal: 12,
    paddingVertical: 11,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
  },
  pickerSelectorText: {
    fontSize: 13.5,
    color: '#0F172A',
    flex: 1,
  },
  rowGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  modalFooterBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    backgroundColor: '#FFFFFF',
    gap: 12,
  },
  backStepBtn: {
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 0,
    backgroundColor: '#FFFFFF',
  },
  backStepBtnText: {
    fontSize: 13.5,
    fontWeight: '700',
    color: '#334155',
  },
  nextStepBtn: {
    flex: 1,
    backgroundColor: '#2563EB',
    paddingVertical: 12,
    borderRadius: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  nextStepBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  pickerBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    justifyContent: 'center',
    padding: 20,
  },
  pickerContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 0,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    padding: 16,
  },
  pickerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    paddingBottom: 12,
    marginBottom: 8,
  },
  pickerTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
  },
  pickerOptionRow: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  pickerOptionText: {
    fontSize: 13.5,
    color: '#0F172A',
  },
});
