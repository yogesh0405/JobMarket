import React from 'react';
import {
  View,
  Text,
  Modal,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Image,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import { UploadCloud, ArrowRight, X } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { DatePickerField } from '../../../components/common/DatePickerField';
import { Advertisement, AdvertisementType, Job } from '../../../types';
import { COLORS } from '../../../constants/theme';

interface EmployerBannerModalProps {
  visible: boolean;
  onClose: () => void;
  editingBanner: Advertisement | null;
  title: string;
  setTitle: (val: string) => void;
  description: string;
  setDescription: (val: string) => void;
  advertisementType: AdvertisementType;
  setAdvertisementType: (val: AdvertisementType) => void;
  jobs: Job[];
  linkedJobId: string;
  setLinkedJobId: (val: string) => void;
  redirectUrl: string;
  setRedirectUrl: (val: string) => void;
  buttonText: string;
  setButtonText: (val: string) => void;
  bannerImage: string;
  setBannerImage: (val: string) => void;
  onPickImage: () => void;
  startDate: string;
  setStartDate: (val: string) => void;
  endDate: string;
  setEndDate: (val: string) => void;
  targetAudience: string;
  setTargetAudience: (val: string) => void;
  isSubmitting: boolean;
  onSubmit: () => void;
}

export const EmployerBannerModal: React.FC<EmployerBannerModalProps> = ({
  visible,
  onClose,
  editingBanner,
  title,
  setTitle,
  description,
  setDescription,
  advertisementType,
  setAdvertisementType,
  jobs,
  linkedJobId,
  setLinkedJobId,
  redirectUrl,
  setRedirectUrl,
  buttonText,
  setButtonText,
  bannerImage,
  setBannerImage,
  onPickImage,
  startDate,
  setStartDate,
  endDate,
  setEndDate,
  targetAudience,
  setTargetAudience,
  isSubmitting,
  onSubmit,
}) => {
  const insets = useSafeAreaInsets();

  return (
    <Modal visible={visible} animationType="slide" transparent={true} onRequestClose={onClose}>
      <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={onClose}>
        <TouchableOpacity activeOpacity={1} style={[styles.modalContent, { paddingBottom: Math.max(insets.bottom + 16, 28) }]} onPress={(e) => e.stopPropagation()}>
          <View style={styles.modalHeaderRow}>
            <Text style={styles.modalTitle}>{editingBanner ? 'Edit Banner Advertisement' : 'Create Promotional Banner'}</Text>
            <TouchableOpacity onPress={onClose} style={styles.modalCloseBtn}>
              <X size={20} color="#64748B" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalFormScroll} showsVerticalScrollIndicator={false}>
            <Text style={styles.inputLabel}>Banner Title *</Text>
            <TextInput
              style={styles.textInput}
              placeholder="e.g. Urgent Walk-In Drive for CNC Machinists"
              value={title}
              onChangeText={setTitle}
            />

            <Text style={styles.inputLabel}>Short Description / Subtitle</Text>
            <TextInput
              style={[styles.textInput, { height: 65 }]}
              placeholder="e.g. 50 Openings in Waluj MIDC. Immediate Joining."
              value={description}
              onChangeText={setDescription}
              multiline
            />

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
                  style={[styles.typeChip, advertisementType === type.id && styles.typeChipActive]}
                  onPress={() => setAdvertisementType(type.id as AdvertisementType)}
                >
                  <Text style={[styles.typeChipText, advertisementType === type.id && styles.typeChipTextActive]}>
                    {type.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            {jobs.length > 0 ? (
              <>
                <Text style={styles.inputLabel}>Link to Posted Job (Optional)</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 12 }}>
                  <TouchableOpacity
                    style={[styles.jobChip, !linkedJobId && styles.jobChipActive]}
                    onPress={() => setLinkedJobId('')}
                  >
                    <Text style={[styles.jobChipText, !linkedJobId && styles.jobChipTextActive]}>None (Custom Link)</Text>
                  </TouchableOpacity>
                  {jobs.map((j) => (
                    <TouchableOpacity
                      key={j.id}
                      style={[styles.jobChip, linkedJobId === j.id && styles.jobChipActive]}
                      onPress={() => setLinkedJobId(j.id)}
                    >
                      <Text style={[styles.jobChipText, linkedJobId === j.id && styles.jobChipTextActive]} numberOfLines={1}>
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
                  value={redirectUrl}
                  onChangeText={setRedirectUrl}
                />
              </>
            ) : null}

            <Text style={styles.inputLabel}>Action Button Text / Label *</Text>
            <TextInput
              style={[styles.textInput, { marginBottom: 6 }]}
              placeholder="e.g. Apply Now, View Details, Register Spot Interview"
              value={buttonText}
              onChangeText={setButtonText}
            />
            <Text style={[styles.inputLabel, { marginTop: 2, marginBottom: 4, color: '#64748B', fontSize: 11 }]}>
              Quick Button Suggestions (Tap to select):
            </Text>
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
                  style={[styles.typeChip, buttonText === preset && styles.typeChipActive]}
                  onPress={() => setButtonText(preset)}
                >
                  <Text style={[styles.typeChipText, buttonText === preset && styles.typeChipTextActive]}>
                    {preset}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <Text style={styles.inputLabel}>Banner Image *</Text>
            <TouchableOpacity style={styles.imagePickerBtn} activeOpacity={0.8} onPress={onPickImage}>
              <UploadCloud size={20} color={COLORS.primary} />
              <Text style={styles.imagePickerBtnText}>
                {bannerImage ? 'Change Image from Photos / Gallery' : 'Select Banner Image from Photos'}
              </Text>
            </TouchableOpacity>

            <Text style={[styles.inputLabel, { marginTop: 6 }]}>Or Enter Direct Image URL (Optional)</Text>
            <TextInput
              style={styles.textInput}
              placeholder="https://images.unsplash.com/..."
              value={bannerImage}
              onChangeText={setBannerImage}
            />

            <View style={{ flexDirection: 'row', gap: 10, marginTop: 6 }}>
              <View style={{ flex: 1 }}>
                <DatePickerField
                  label="Campaign Start Date"
                  required
                  value={startDate}
                  onChange={setStartDate}
                  placeholder="Select start date..."
                  minDate={new Date()}
                />
              </View>
              <View style={{ flex: 1 }}>
                <DatePickerField
                  label="Campaign End Date"
                  required
                  value={endDate}
                  onChange={setEndDate}
                  placeholder="Select end date..."
                  minDate={startDate ? new Date(startDate) : new Date()}
                />
              </View>
            </View>

            <Text style={styles.inputLabel}>Target Audience / Region</Text>
            <TextInput
              style={styles.textInput}
              placeholder="e.g. Chhatrapati Sambhajinagar ITI Machinists"
              value={targetAudience}
              onChangeText={setTargetAudience}
            />

            <Text style={styles.inputLabel}>Live Homepage Banner Preview</Text>
            <View style={styles.liveHomepageBannerCard}>
              <Image
                source={{
                  uri: bannerImage.trim() || 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=800&q=70',
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
                    {description.trim() || 'Sample description text preview as shown to candidates on homepage.'}
                  </Text>
                </View>

                <View style={styles.livePromoActionBtnBlue}>
                  <Text style={styles.livePromoActionBtnText}>
                    {buttonText || 'Apply Now'}
                  </Text>
                  <ArrowRight size={13} color="#FFFFFF" />
                </View>
              </View>
            </View>

            <TouchableOpacity
              style={[styles.submitBtn, isSubmitting && { opacity: 0.6 }]}
              disabled={isSubmitting}
              onPress={onSubmit}
            >
              {isSubmitting ? (
                <ActivityIndicator color="#FFFFFF" size="small" />
              ) : (
                <Text style={styles.submitBtnText}>
                  {editingBanner ? 'Save & Resubmit Banner' : 'Submit Banner for Approval'}
                </Text>
              )}
            </TouchableOpacity>
          </ScrollView>
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingTop: 16,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    maxHeight: '90%',
  },
  modalHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
  },
  modalCloseBtn: {
    padding: 4,
  },
  modalFormScroll: {
    marginTop: 10,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#334155',
    marginBottom: 6,
    marginTop: 10,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 6,
    paddingHorizontal: 12,
    height: 42,
    fontSize: 13,
    color: '#0F172A',
    backgroundColor: '#FFFFFF',
  },
  typeChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    marginRight: 6,
  },
  typeChipActive: {
    backgroundColor: '#EFF6FF',
    borderColor: COLORS.primary,
  },
  typeChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#475569',
  },
  typeChipTextActive: {
    color: COLORS.primary,
    fontWeight: '800',
  },
  jobChip: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    marginRight: 6,
  },
  jobChipActive: {
    backgroundColor: '#EFF6FF',
    borderColor: COLORS.primary,
  },
  jobChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#475569',
  },
  jobChipTextActive: {
    color: COLORS.primary,
    fontWeight: '800',
  },
  imagePickerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: COLORS.primary,
    backgroundColor: '#EFF6FF',
    paddingVertical: 12,
    borderRadius: 8,
  },
  imagePickerBtnText: {
    fontSize: 12.5,
    fontWeight: '700',
    color: COLORS.primary,
  },
  liveHomepageBannerCard: {
    height: 130,
    borderRadius: 8,
    overflow: 'hidden',
    position: 'relative',
    marginTop: 4,
  },
  livePromoImage: {
    width: '100%',
    height: '100%',
  },
  livePromoOverlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(15, 23, 42, 0.55)',
    padding: 10,
    justifyContent: 'space-between',
  },
  livePromoBadgeOrange: {
    alignSelf: 'flex-start',
    backgroundColor: '#EA580C',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  livePromoBadgeOrangeText: {
    fontSize: 9.5,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  livePromoTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  livePromoDesc: {
    fontSize: 11,
    color: '#E2E8F0',
    lineHeight: 14,
  },
  livePromoActionBtnBlue: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: COLORS.primary,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  livePromoActionBtnText: {
    fontSize: 10.5,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  submitBtn: {
    backgroundColor: COLORS.primary,
    height: 44,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
    marginBottom: 20,
  },
  submitBtnText: {
    fontSize: 13.5,
    fontWeight: '800',
    color: '#FFFFFF',
  },
});
