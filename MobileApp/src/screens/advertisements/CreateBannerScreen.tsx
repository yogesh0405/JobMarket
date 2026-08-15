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
} from 'react-native';
import {
  UploadCloud,
  ArrowRight,
  Sparkles,
} from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import { Header } from '../../components/common/Header';
import { apiFetch } from '../../api/client';
import { jobsApi } from '../../api/jobsApi';
import { Advertisement, AdvertisementType, Job } from '../../types';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { DatePickerField } from '../../components/common/DatePickerField';
import { COLORS, FONTS } from '../../constants/theme';

interface Props {
  navigation: any;
  route?: any;
}

export const CreateBannerScreen: React.FC<Props> = ({ navigation, route }) => {
  const insets = useSafeAreaInsets();
  const initialBanner: Advertisement | undefined = route?.params?.banner;

  const [editingBanner, setEditingBanner] = useState<Advertisement | null>(initialBanner || null);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State
  const [title, setTitle] = useState(initialBanner?.title || '');
  const [description, setDescription] = useState(initialBanner?.description || '');
  const [bannerImage, setBannerImage] = useState(initialBanner?.banner_image || '');
  const [advertisementType, setAdvertisementType] = useState<AdvertisementType>(
    initialBanner?.advertisement_type || 'FEATURED_JOB'
  );
  const [linkedJobId, setLinkedJobId] = useState(initialBanner?.linked_job_id || '');
  const [redirectUrl, setRedirectUrl] = useState(initialBanner?.redirect_url || '');
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
          d.setDate(d.getDate() + 14);
          return d.toISOString().slice(0, 10);
        })()
  );
  const [targetAudience, setTargetAudience] = useState(initialBanner?.target_audience || '');

  useEffect(() => {
    jobsApi.getMyJobs()
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
    if (!title.trim()) {
      Alert.alert('Required Field', 'Please enter a promotional banner title.');
      return;
    }
    if (!startDate || !endDate) {
      Alert.alert('Required Field', 'Please select valid start and end dates.');
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        title: title.trim(),
        description: description.trim(),
        banner_image:
          bannerImage.trim() ||
          'https://images.unsplash.com/photo-1581092335397-9583fe92d232?auto=format&fit=crop&w=800&q=80',
        advertisement_type: advertisementType,
        linked_job_id: linkedJobId || undefined,
        redirect_url: redirectUrl || undefined,
        button_text: buttonText,
        priority: 'MEDIUM',
        start_date: new Date(startDate).toISOString(),
        end_date: new Date(endDate).toISOString(),
        target_audience: targetAudience || 'All Job Seekers',
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
        Alert.alert(
          'Success',
          editingBanner
            ? 'Banner campaign updated and submitted for approval.'
            : 'New banner campaign submitted for admin review.',
          [
            {
              text: 'OK',
              onPress: () => {
                navigation.navigate('EmployerBanners', { refresh: true });
              },
            },
          ]
        );
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
      <Header
        title={editingBanner ? 'Edit Banner' : 'Create Banner'}
        subtitle="Home Page Banner Campaign"
        showBack={true}
        onBack={() => navigation.goBack()}
      />

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={[styles.scrollContent, { paddingBottom: Math.max(insets.bottom + 20, 50) }]}
          showsVerticalScrollIndicator={false}
        >
          {/* Section 1: Campaign Details */}
          <Text style={styles.sectionHeaderTitle}>CAMPAIGN DETAILS</Text>

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
            style={[styles.textInput, { height: 68, textAlignVertical: 'top' }]}
            placeholder="e.g. 50 Openings in Chakan MIDC. Immediate Joining."
            placeholderTextColor="#94A3B8"
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={3}
          />

          {/* Campaign Type Picker */}
          <Text style={styles.inputLabel}>Campaign Type</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 12 }}>
            {[
              { id: 'FEATURED_JOB', label: 'Featured Job' },
              { id: 'URGENT_HIRING', label: 'Urgent Hiring' },
              { id: 'WALK_IN_DRIVE', label: 'Walk-In Drive' },
              { id: 'COMPANY_PROMOTION', label: 'Company Spotlight' },
            ].map((type) => (
              <TouchableOpacity
                key={type.id}
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

          {/* Section Divider */}
          <View style={styles.divider} />

          {/* Section 2: Action Link */}
          <Text style={styles.sectionHeaderTitle}>TARGET ACTION & LINK</Text>

          {jobs.length > 0 ? (
            <>
              <Text style={styles.inputLabel}>Link to Posted Job (Optional)</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 12 }}>
                <TouchableOpacity
                  style={[styles.jobChip, !linkedJobId && styles.jobChipActive]}
                  onPress={() => setLinkedJobId('')}
                >
                  <Text style={[styles.jobChipText, !linkedJobId && styles.jobChipTextActive]}>
                    Custom Website Link
                  </Text>
                </TouchableOpacity>
                {jobs.map((j) => (
                  <TouchableOpacity
                    key={j.id}
                    style={[styles.jobChip, linkedJobId === j.id && styles.jobChipActive]}
                    onPress={() => setLinkedJobId(j.id)}
                  >
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
              <Text style={styles.inputLabel}>Custom Website / Target URL</Text>
              <TextInput
                style={styles.textInput}
                placeholder="https://yourcompany.com/careers"
                placeholderTextColor="#94A3B8"
                value={redirectUrl}
                onChangeText={setRedirectUrl}
              />
            </>
          ) : null}

          <Text style={styles.inputLabel}>Action Button Label *</Text>
          <TextInput
            style={[styles.textInput, { marginBottom: 6 }]}
            placeholder="e.g. Apply Now, View Details, Register Spot Interview"
            placeholderTextColor="#94A3B8"
            value={buttonText}
            onChangeText={setButtonText}
          />
          <Text style={styles.subtextHint}>Quick Suggestions (Tap to select):</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 14 }}>
            {[
              'Apply Now',
              'View Job Details',
              'Register Spot Interview',
              'Explore Jobs',
              'Direct Walk-In',
              'Contact Recruiter',
            ].map((preset) => (
              <TouchableOpacity
                key={preset}
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

          {/* Section Divider */}
          <View style={styles.divider} />

          {/* Section 3: Banner Image & Schedule */}
          <Text style={styles.sectionHeaderTitle}>MEDIA & SCHEDULE</Text>

          <Text style={styles.inputLabel}>Banner Image *</Text>
          <TouchableOpacity
            style={styles.imagePickerBtn}
            activeOpacity={0.8}
            onPress={handlePickImage}
          >
            <UploadCloud size={18} color={COLORS.employerPrimary} />
            <Text style={styles.imagePickerBtnText}>
              {bannerImage ? 'Change Image from Gallery' : 'Select Image from Photos'}
            </Text>
          </TouchableOpacity>

          <Text style={[styles.inputLabel, { marginTop: 8 }]}>Or Enter Image URL (Optional)</Text>
          <TextInput
            style={styles.textInput}
            placeholder="https://images.unsplash.com/..."
            placeholderTextColor="#94A3B8"
            value={bannerImage}
            onChangeText={setBannerImage}
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

          <Text style={styles.inputLabel}>Target Audience / Region</Text>
          <TextInput
            style={styles.textInput}
            placeholder="e.g. Pune & Chhatrapati Sambhajinagar"
            placeholderTextColor="#94A3B8"
            value={targetAudience}
            onChangeText={setTargetAudience}
          />

          {/* Banner Live Preview */}
          <Text style={styles.sectionHeaderTitle}>LIVE BANNER PREVIEW</Text>
          <View style={styles.liveHomepageBannerCard}>
            <Image
              source={{
                uri:
                  bannerImage.trim() ||
                  'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=800&q=70',
              }}
              style={styles.livePromoImage}
              resizeMode="cover"
            />

            <View style={styles.livePromoOverlay}>
              <View style={styles.livePromoBadgeOrange}>
                <Text style={styles.livePromoBadgeOrangeText}>
                  {(advertisementType || 'FEATURED_JOB').replace('_', ' ')}
                </Text>
              </View>

              <View style={{ gap: 2 }}>
                <Text style={styles.livePromoTitle} numberOfLines={1}>
                  {title.trim() || 'Sample Banner Title'}
                </Text>
                <Text style={styles.livePromoDesc} numberOfLines={2}>
                  {description.trim() ||
                    'Sample description preview as shown to job seekers on mobile homepage.'}
                </Text>
              </View>

              <View style={styles.livePromoActionBtnBlue}>
                <Text style={styles.livePromoActionBtnText}>
                  {buttonText || 'Apply Now'}
                </Text>
                <ArrowRight size={13} color={COLORS.employerPrimary} />
              </View>
            </View>
          </View>

          {/* Submit Action Button */}
          <TouchableOpacity
            style={[styles.submitBtn, isSubmitting && { opacity: 0.6 }]}
            disabled={isSubmitting}
            onPress={handleSubmit}
          >
            {isSubmitting ? (
              <ActivityIndicator color="#FFFFFF" size="small" />
            ) : (
              <Text style={styles.submitBtnText}>
                {editingBanner ? 'Save & Resubmit Campaign' : 'Submit Campaign for Approval'}
              </Text>
            )}
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 40,
  },
  sectionHeaderTitle: {
    fontSize: 12,
    fontFamily: FONTS.bold,
    color: '#0F172A',
    letterSpacing: 0.5,
    marginTop: 8,
    marginBottom: 10,
  },
  inputLabel: {
    fontSize: 13,
    fontFamily: FONTS.medium,
    color: '#334155',
    marginBottom: 4,
    marginTop: 8,
  },
  subtextHint: {
    fontSize: 11,
    fontFamily: FONTS.regular,
    color: '#64748B',
    marginBottom: 6,
  },
  textInput: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 13.5,
    fontFamily: FONTS.regular,
    color: '#0F172A',
    marginBottom: 4,
  },
  typeChip: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 8,
  },
  typeChipActive: {
    borderColor: COLORS.employerPrimary,
    backgroundColor: '#EFF6FF',
  },
  typeChipText: {
    fontSize: 12,
    fontFamily: FONTS.medium,
    color: '#475569',
  },
  typeChipTextActive: {
    color: COLORS.employerPrimary,
    fontFamily: FONTS.bold,
  },
  jobChip: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 8,
    maxWidth: 180,
  },
  jobChipActive: {
    borderColor: COLORS.employerPrimary,
    backgroundColor: '#EFF6FF',
  },
  jobChipText: {
    fontSize: 12,
    fontFamily: FONTS.medium,
    color: '#475569',
  },
  jobChipTextActive: {
    color: COLORS.employerPrimary,
    fontFamily: FONTS.bold,
  },
  divider: {
    height: 1,
    backgroundColor: '#94A3B8',
    marginVertical: 14,
  },
  imagePickerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: COLORS.employerPrimary,
    borderRadius: 8,
    paddingVertical: 12,
    marginVertical: 4,
  },
  imagePickerBtnText: {
    fontSize: 13,
    fontFamily: FONTS.semibold,
    color: COLORS.employerPrimary,
  },
  liveHomepageBannerCard: {
    height: 165,
    borderRadius: 10,
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: COLORS.employerPrimary,
    marginVertical: 10,
  },
  livePromoImage: {
    width: '100%',
    height: '100%',
    opacity: 0.45,
  },
  livePromoOverlay: {
    position: 'absolute',
    inset: 0,
    padding: 12,
    justifyContent: 'space-between',
  },
  livePromoBadgeOrange: {
    backgroundColor: '#F59E0B',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  livePromoBadgeOrangeText: {
    color: '#FFFFFF',
    fontSize: 9.5,
    fontFamily: FONTS.bold,
    letterSpacing: 0.5,
  },
  livePromoTitle: {
    fontSize: 15,
    fontFamily: FONTS.bold,
    color: '#FFFFFF',
  },
  livePromoDesc: {
    fontSize: 11.5,
    fontFamily: FONTS.regular,
    color: '#E2E8F0',
    lineHeight: 15,
  },
  livePromoActionBtnBlue: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: COLORS.employerPrimary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  livePromoActionBtnText: {
    color: COLORS.employerPrimary,
    fontSize: 12,
    fontFamily: FONTS.bold,
  },
  submitBtn: {
    backgroundColor: COLORS.employerPrimary,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
    marginBottom: 24,
  },
  submitBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontFamily: FONTS.bold,
  },
});
