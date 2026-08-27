import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Image,
  TextInput,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
} from 'react-native';
import {
  ArrowLeft,
  UploadCloud,
  ArrowRight,
  Briefcase,
  CheckCircle2,
  AlertCircle,
  EyeOff,
} from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { apiFetch } from '../../api/client';
import { jobsApi } from '../../api/jobsApi';
import { Advertisement, AdvertisementType, Job } from '../../types';
import { DatePickerField } from '../../components/common/DatePickerField';
import { COLORS } from '../../constants/theme';
import { SuccessModal } from '../../components/common/SuccessModal';

interface Props {
  navigation: any;
  route?: any;
}

const DEFAULT_BANNER_IMAGE =
  'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=800&q=80';

export const CreateBannerScreen: React.FC<Props> = ({ navigation, route }) => {
  const insets = useSafeAreaInsets();
  const topInset = Math.max(insets.top || 0, Platform.OS === 'android' ? (StatusBar.currentHeight || 24) : 0);
  const initialBanner: Advertisement | undefined = route?.params?.banner;

  const [editingBanner, setEditingBanner] = useState<Advertisement | null>(initialBanner || null);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successModalConfig, setSuccessModalConfig] = useState<{
    visible: boolean;
    title: string;
    message: string;
    buttonText?: string;
  }>({
    visible: false,
    title: '',
    message: '',
  });

  // Form State
  const [title, setTitle] = useState(initialBanner?.title || '');
  const [description, setDescription] = useState(initialBanner?.description || '');
  const [bannerImage, setBannerImage] = useState(initialBanner?.banner_image || '');
  const [advertisementType, setAdvertisementType] = useState<AdvertisementType>(
    initialBanner?.advertisement_type || 'FEATURED_JOB'
  );
  const [linkedJobId, setLinkedJobId] = useState(
    (initialBanner as any)?.job_id || (initialBanner as any)?.jobId || initialBanner?.linked_job_id || ''
  );
  const [redirectUrl, setRedirectUrl] = useState(
    (initialBanner as any)?.target_url || (initialBanner as any)?.targetUrl || initialBanner?.redirect_url || ''
  );
  const [buttonText, setButtonText] = useState(initialBanner?.button_text || 'Apply Now');
  const [startDate, setStartDate] = useState(
    initialBanner?.start_date
      ? new Date(initialBanner.start_date).toISOString().slice(0, 10)
      : new Date().toISOString().slice(0, 10)
  );
  const [endDate, setEndDate] = useState(
    initialBanner?.end_date
      ? new Date(initialBanner.end_date).toISOString().slice(0, 10)
      : (() => {
          const d = new Date();
          d.setDate(d.getDate() + 30);
          return d.toISOString().slice(0, 10);
        })()
  );
  const [targetAudience, setTargetAudience] = useState(initialBanner?.target_audience || '');

  useEffect(() => {
    jobsApi
      .getMyJobs()
      .then((res) => {
        if (res.success && Array.isArray(res.data)) {
          setJobs(res.data);
        }
      })
      .catch(() => {});
  }, []);

  const handlePickImage = async () => {
    const permResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permResult.granted) {
      Alert.alert('Permission Required', 'Permission to access gallery is required to select a banner image.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: 'images',
      allowsEditing: true,
      aspect: [16, 9],
      quality: 0.8,
      base64: true,
    });

    if (!result.canceled && result.assets[0]) {
      const asset = result.assets[0];
      const base64Data = asset.base64
        ? `data:${asset.mimeType || 'image/jpeg'};base64,${asset.base64}`
        : asset.uri;
      setBannerImage(base64Data);
    }
  };

  const handleSubmit = async () => {
    if (isSubmitting) return;
    if (!title.trim()) {
      Alert.alert('Required Field', 'Please enter a promotional banner title.');
      return;
    }
    if (!startDate || !endDate) {
      Alert.alert('Required Field', 'Please select valid start and end dates.');
      return;
    }

    const finalImage =
      bannerImage.trim().length > 5 ? bannerImage.trim() : DEFAULT_BANNER_IMAGE;

    setIsSubmitting(true);
    try {
      const payload = {
        title: title.trim(),
        description: description.trim() || undefined,
        banner_image: finalImage,
        bannerImage: finalImage,
        advertisement_type: advertisementType,
        advertisementType: advertisementType,
        linked_job_id: linkedJobId || undefined,
        jobId: linkedJobId || undefined,
        redirect_url: redirectUrl.trim() || undefined,
        redirectUrl: redirectUrl.trim() || undefined,
        button_text: buttonText.trim() || 'Apply Now',
        buttonText: buttonText.trim() || 'Apply Now',
        priority: 'MEDIUM',
        start_date: new Date(startDate).toISOString(),
        startDate: new Date(startDate).toISOString(),
        end_date: new Date(endDate).toISOString(),
        endDate: new Date(endDate).toISOString(),
        target_audience: targetAudience.trim() || 'All Job Seekers',
        targetAudience: targetAudience.trim() || 'All Job Seekers',
      };

      const url = editingBanner
        ? `/api/v1/employer/advertisements/${editingBanner.id}`
        : '/api/v1/employer/advertisements';
      const method = editingBanner ? 'PUT' : 'POST';

      const res = await apiFetch(url, {
        method,
        body: JSON.stringify(payload),
      });

      if (res.success) {
        setSuccessModalConfig({
          visible: true,
          title: editingBanner
            ? 'Banner Updated Successfully !'
            : 'Banner Submitted for Approval !',
          message: editingBanner
            ? 'Your promotional banner updates have been submitted for admin approval. It will go live once verified.'
            : 'Your promotional banner has been submitted and is currently pending admin review. It will go live on the homepage carousel once approved by the JobMarket team.',
          buttonText: 'View Banners',
        });
      } else {
        Alert.alert('Submission Failed', res.message || 'Could not save banner advertisement.');
      }
    } catch (err: any) {
      Alert.alert('Error', err.message || 'An error occurred while saving.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" translucent={false} />

      {/* 1. Header Bar */}
      <View style={[styles.headerBanner, { paddingTop: topInset + (Platform.OS === 'android' ? 8 : 4) }]}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          style={styles.backBtn}
        >
          <ArrowLeft size={22} color="#0F172A" strokeWidth={2.4} />
        </TouchableOpacity>

        <View style={{ flex: 1 }}>
          <Text style={styles.headerTitleText}>
            {editingBanner ? 'Edit Promotional Banner' : 'Create Promotional Banner'}
          </Text>
          <Text style={styles.headerSubtitleText}>Promote urgent hiring on homepage slider</Text>
        </View>
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={[
            styles.scrollContent,
            { paddingBottom: Math.max(insets.bottom || 0, 16) + 40 },
          ]}
          showsVerticalScrollIndicator={false}
        >
          {/* Moderation Feedback Alert Banner */}
          {editingBanner && (editingBanner.status === 'REJECTED' || editingBanner.status === 'UNPUBLISHED' || (!editingBanner.is_active && editingBanner.status === 'DRAFT')) && (
            <View style={editingBanner.status === 'REJECTED' ? styles.moderationAlertBoxRejected : styles.moderationAlertBoxUnpublished}>
              <View style={styles.alertHeaderRow}>
                {editingBanner.status === 'REJECTED' ? (
                  <AlertCircle size={16} color="#DC2626" strokeWidth={2.4} />
                ) : (
                  <EyeOff size={16} color="#D97706" strokeWidth={2.4} />
                )}
                <Text style={editingBanner.status === 'REJECTED' ? styles.alertTitleRejected : styles.alertTitleUnpublished}>
                  {editingBanner.status === 'REJECTED' ? 'REJECTION FEEDBACK / REASON' : 'UNPUBLISHED REASON / ADMIN NOTE'}
                </Text>
              </View>
              <Text style={editingBanner.status === 'REJECTED' ? styles.alertBodyRejected : styles.alertBodyUnpublished}>
                {(editingBanner.rejection_reason || (editingBanner as any).unpublish_reason || (editingBanner as any).notes || (editingBanner as any).reason) ||
                  (editingBanner.status === 'REJECTED'
                    ? 'This banner was rejected by administrators. Please update the necessary details and resubmit.'
                    : 'This banner was unpublished from the homepage by administrators. You can update and resubmit it.')}
              </Text>
            </View>
          )}

          {/* Section 1: Campaign Details */}
          <View style={styles.formCard}>
            <Text style={styles.sectionHeaderTitle}>1. CAMPAIGN DETAILS</Text>

            <Text style={styles.inputLabel}>Banner Title *</Text>
            <TextInput
              style={styles.textInput}
              placeholder="e.g. Urgent Walk-In Drive for CNC Machinists"
              placeholderTextColor="#94A3B8"
              value={title}
              onChangeText={setTitle}
            />

            <Text style={styles.inputLabel}>Short Description / Subtitle</Text>
            <TextInput
              style={[styles.textInput, { height: 72, textAlignVertical: 'top' }]}
              placeholder="e.g. 50 Openings in Chakan MIDC. Immediate Joining."
              placeholderTextColor="#94A3B8"
              value={description}
              onChangeText={setDescription}
              multiline
              numberOfLines={3}
            />

            {/* Campaign Type Picker */}
            <Text style={styles.inputLabel}>Campaign Tag / Type</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 4 }}>
              {[
                { id: 'FEATURED_JOB', label: 'Featured Job' },
                { id: 'URGENT_HIRING', label: 'Urgent Hiring' },
                { id: 'WALK_IN_DRIVE', label: 'Walk-In Drive' },
                { id: 'COMPANY_PROMOTION', label: 'Company Spotlight' },
              ].map((type) => (
                <TouchableOpacity
                  key={type.id}
                  activeOpacity={0.8}
                  style={[
                    styles.typeChip,
                    advertisementType === type.id && styles.typeChipActive,
                  ]}
                  onPress={() => setAdvertisementType(type.id as AdvertisementType)}
                >
                  <Text
                    style={[
                      styles.typeChipText,
                      advertisementType === type.id && styles.typeChipTextActive,
                    ]}
                  >
                    {type.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* Section 2: Action Link & Target */}
          <View style={styles.formCard}>
            <Text style={styles.sectionHeaderTitle}>2. TARGET ACTION & LINK</Text>

            {jobs.length > 0 ? (
              <>
                <Text style={styles.inputLabel}>Link to Active Posted Job</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 10 }}>
                  <TouchableOpacity
                    style={[styles.jobChip, !linkedJobId && styles.jobChipActive]}
                    activeOpacity={0.8}
                    onPress={() => setLinkedJobId('')}
                  >
                    <Text style={[styles.jobChipText, !linkedJobId && styles.jobChipTextActive]}>
                      Direct Application Link
                    </Text>
                  </TouchableOpacity>
                  {jobs.map((j) => (
                    <TouchableOpacity
                      key={j.id}
                      style={[styles.jobChip, linkedJobId === j.id && styles.jobChipActive]}
                      activeOpacity={0.8}
                      onPress={() => setLinkedJobId(j.id)}
                    >
                      <Briefcase size={12} color={linkedJobId === j.id ? '#2563EB' : '#64748B'} />
                      <Text
                        style={[styles.jobChipText, linkedJobId === j.id && styles.jobChipTextActive]}
                        numberOfLines={1}
                      >
                        {j.title}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </>
            ) : null}

            {!linkedJobId ? (
              <>
                <Text style={styles.inputLabel}>Custom Redirect URL (Optional)</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="https://yourcompany.com/careers"
                  placeholderTextColor="#94A3B8"
                  value={redirectUrl}
                  onChangeText={setRedirectUrl}
                  autoCapitalize="none"
                  keyboardType="url"
                />
              </>
            ) : null}

            <Text style={styles.inputLabel}>Action Button Text *</Text>
            <TextInput
              style={styles.textInput}
              placeholder="e.g. Apply Now, View Details, Register Walk-In"
              placeholderTextColor="#94A3B8"
              value={buttonText}
              onChangeText={setButtonText}
            />

            <Text style={styles.subtextHint}>Suggestions:</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 4 }}>
              {[
                'Apply Now',
                'View Job Details',
                'Register Spot Interview',
                'Explore Jobs',
                'Direct Walk-In',
              ].map((preset) => (
                <TouchableOpacity
                  key={preset}
                  activeOpacity={0.8}
                  style={[
                    styles.typeChip,
                    buttonText === preset && styles.typeChipActive,
                  ]}
                  onPress={() => setButtonText(preset)}
                >
                  <Text
                    style={[
                      styles.typeChipText,
                      buttonText === preset && styles.typeChipTextActive,
                    ]}
                  >
                    {preset}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* Section 3: Media & Schedule */}
          <View style={styles.formCard}>
            <Text style={styles.sectionHeaderTitle}>3. BANNER IMAGE & SCHEDULE</Text>

            <Text style={styles.inputLabel}>Banner Image *</Text>
            <TouchableOpacity
              style={styles.imagePickerBtn}
              activeOpacity={0.8}
              onPress={handlePickImage}
            >
              <UploadCloud size={18} color={COLORS.primary} />
              <Text style={styles.imagePickerBtnText}>
                {bannerImage ? 'Change Image from Gallery' : 'Select Image from Photos (16:9)'}
              </Text>
            </TouchableOpacity>

            <Text style={[styles.inputLabel, { marginTop: 8 }]}>Or Enter Image URL</Text>
            <TextInput
              style={styles.textInput}
              placeholder="https://images.unsplash.com/..."
              placeholderTextColor="#94A3B8"
              value={bannerImage}
              onChangeText={setBannerImage}
              autoCapitalize="none"
            />

            {/* Start & End Date Pickers */}
            <View style={{ flexDirection: 'row', gap: 10, marginTop: 6 }}>
              <View style={{ flex: 1 }}>
                <DatePickerField
                  label="Start Date"
                  required
                  value={startDate}
                  onChange={setStartDate}
                  placeholder="Start date..."
                  minDate={new Date()}
                />
              </View>
              <View style={{ flex: 1 }}>
                <DatePickerField
                  label="End Date"
                  required
                  value={endDate}
                  onChange={setEndDate}
                  placeholder="End date..."
                  minDate={startDate ? new Date(startDate) : new Date()}
                />
              </View>
            </View>

            <Text style={styles.inputLabel}>Target Audience / Industrial Region</Text>
            <TextInput
              style={styles.textInput}
              placeholder="e.g. Pune & Chhatrapati Sambhajinagar MIDC"
              placeholderTextColor="#94A3B8"
              value={targetAudience}
              onChangeText={setTargetAudience}
            />
          </View>

          {/* Section 4: Live Preview */}
          <View style={styles.formCard}>
            <Text style={styles.sectionHeaderTitle}>LIVE BANNER PREVIEW</Text>
            <View style={styles.liveHomepageBannerCard}>
              <Image
                source={{
                  uri:
                    bannerImage.trim().length > 5
                      ? bannerImage.trim()
                      : DEFAULT_BANNER_IMAGE,
                }}
                style={styles.livePromoImage}
                resizeMode="cover"
              />

              <View style={styles.livePromoOverlay}>
                <View style={styles.livePromoBadgeOrange}>
                  <Text style={styles.livePromoBadgeOrangeText}>
                    {(advertisementType || 'FEATURED_JOB').replace(/_/g, ' ')}
                  </Text>
                </View>

                <View style={{ gap: 2 }}>
                  <Text style={styles.livePromoTitle} numberOfLines={1}>
                    {title.trim() || 'Sample Banner Title'}
                  </Text>
                  <Text style={styles.livePromoDesc} numberOfLines={2}>
                    {description.trim() ||
                      'Sample description preview as shown to job seekers on the homepage slider.'}
                  </Text>
                </View>

                <View style={styles.livePromoActionBtnBlue}>
                  <Text style={styles.livePromoActionBtnText}>
                    {buttonText || 'Apply Now'}
                  </Text>
                  <ArrowRight size={13} color="#2563EB" />
                </View>
              </View>
            </View>
          </View>

          {/* Submit Action Button */}
          <TouchableOpacity
            style={[styles.submitBtn, isSubmitting && { opacity: 0.6 }]}
            activeOpacity={0.85}
            disabled={isSubmitting}
            onPress={handleSubmit}
          >
            {isSubmitting ? (
              <ActivityIndicator color="#FFFFFF" size="small" />
            ) : (
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <CheckCircle2 size={18} color="#FFFFFF" />
                <Text style={styles.submitBtnText}>
                  {editingBanner ? 'Save & Resubmit Campaign' : 'Submit Campaign for Approval'}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Themed Attractive Success Modal */}
      <SuccessModal
        visible={successModalConfig.visible}
        title={successModalConfig.title}
        message={successModalConfig.message}
        buttonText={successModalConfig.buttonText || 'View Banners'}
        onButtonPress={() => {
          setSuccessModalConfig((prev) => ({ ...prev, visible: false }));
          navigation.goBack();
        }}
        onClose={() => {
          setSuccessModalConfig((prev) => ({ ...prev, visible: false }));
          navigation.goBack();
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },

  /* 1. Header Bar */
  headerBanner: {
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    paddingHorizontal: 16,
    paddingBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  backBtn: {
    padding: 2,
  },
  headerTitleText: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: -0.2,
  },
  headerSubtitleText: {
    fontSize: 11.5,
    color: '#64748B',
    marginTop: 1,
  },

  /* 2. Scroll Content */
  scrollContent: {
    padding: 16,
  },
  formCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 14,
    marginBottom: 14,
  },
  sectionHeaderTitle: {
    fontSize: 11.5,
    fontWeight: '800',
    color: '#64748B',
    letterSpacing: 0.6,
    marginBottom: 10,
  },
  inputLabel: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#334155',
    marginBottom: 4,
    marginTop: 8,
  },
  subtextHint: {
    fontSize: 11,
    color: '#64748B',
    marginBottom: 6,
    marginTop: 4,
  },
  textInput: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 9,
    fontSize: 13,
    color: '#0F172A',
    marginBottom: 4,
  },
  typeChip: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 8,
  },
  typeChipActive: {
    borderColor: '#2563EB',
    backgroundColor: '#EFF6FF',
  },
  typeChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#475569',
  },
  typeChipTextActive: {
    color: '#2563EB',
    fontWeight: '800',
  },
  jobChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 7,
    marginRight: 8,
    maxWidth: 220,
  },
  jobChipActive: {
    borderColor: '#2563EB',
    backgroundColor: '#EFF6FF',
  },
  jobChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#475569',
  },
  jobChipTextActive: {
    color: '#2563EB',
    fontWeight: '800',
  },
  imagePickerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#DBEAFE',
    borderRadius: 8,
    paddingVertical: 12,
    marginVertical: 4,
  },
  imagePickerBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#2563EB',
  },
  liveHomepageBannerCard: {
    height: 160,
    borderRadius: 10,
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: '#0F172A',
    marginTop: 4,
  },
  livePromoImage: {
    width: '100%',
    height: '100%',
    opacity: 0.5,
  },
  livePromoOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    padding: 12,
    justifyContent: 'space-between',
  },
  livePromoBadgeOrange: {
    backgroundColor: '#F59E0B',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
    alignSelf: 'flex-start',
  },
  livePromoBadgeOrangeText: {
    color: '#FFFFFF',
    fontSize: 9.5,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  livePromoTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  livePromoDesc: {
    fontSize: 11.5,
    color: '#E2E8F0',
    lineHeight: 15,
  },
  livePromoActionBtnBlue: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#2563EB',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  livePromoActionBtnText: {
    color: '#2563EB',
    fontSize: 12,
    fontWeight: '800',
  },
  submitBtn: {
    backgroundColor: '#2563EB',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
    marginBottom: 20,
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 5,
    elevation: 3,
  },
  submitBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },

  /* Moderation Feedback Alert Box */
  moderationAlertBoxRejected: {
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
    borderLeftWidth: 4,
    borderLeftColor: '#DC2626',
    borderRadius: 8,
    padding: 14,
    marginBottom: 16,
  },
  moderationAlertBoxUnpublished: {
    backgroundColor: '#FFFBEB',
    borderWidth: 1,
    borderColor: '#FDE68A',
    borderLeftWidth: 4,
    borderLeftColor: '#D97706',
    borderRadius: 8,
    padding: 14,
    marginBottom: 16,
  },
  alertHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 5,
  },
  alertTitleRejected: {
    fontSize: 12,
    fontWeight: '800',
    color: '#991B1B',
    letterSpacing: 0.5,
  },
  alertTitleUnpublished: {
    fontSize: 12,
    fontWeight: '800',
    color: '#92400E',
    letterSpacing: 0.5,
  },
  alertBodyRejected: {
    fontSize: 12.5,
    color: '#7F1D1D',
    fontWeight: '500',
    lineHeight: 18,
  },
  alertBodyUnpublished: {
    fontSize: 12.5,
    color: '#78350F',
    fontWeight: '500',
    lineHeight: 18,
  },
});
