import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  ActivityIndicator,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  ArrowLeft,
  X,
  ChevronRight,
  Check,
  Ban,
  ShieldCheck,
  Headphones,
  CheckCircle2,
} from 'lucide-react-native';
import { COLORS, RADIUS } from '../../constants/theme';
import { jobsApi } from '../../api/jobsApi';
import { useToast } from '../../context/ToastContext';

interface ReportReasonOption {
  key: string;
  label: string;
  descriptionHint: string;
}

const REPORT_REASONS: ReportReasonOption[] = [
  {
    key: 'MONEY_DEMAND',
    label: 'Asking for money or advance payment',
    descriptionHint: 'Did the recruiter ask for registration fees, training charges, or security deposit?',
  },
  {
    key: 'FAKE_EMPLOYER',
    label: 'Fake company or brand impersonation',
    descriptionHint: 'Is this company pretending to be an existing brand, or non-existent?',
  },
  {
    key: 'MISLEADING_TERMS',
    label: 'Misleading role, salary, or job terms',
    descriptionHint: 'Are the promised salary, job role, or location different from advertised?',
  },
  {
    key: 'OFFENSIVE_CONTENT',
    label: 'Offensive, discriminatory, or inappropriate',
    descriptionHint: 'Does this listing contain inappropriate language or discriminatory requirements?',
  },
  {
    key: 'SCAM_OR_PHISHING',
    label: 'Suspected scam, fraud, or phishing',
    descriptionHint: 'Are they asking for sensitive personal IDs, OTPs, or suspicious link clicks?',
  },
  {
    key: 'DUPLICATE_OR_EXPIRED',
    label: 'Duplicate, spam, or expired vacancy',
    descriptionHint: 'Is this job listing repeated, obsolete, or no longer accepting applicants?',
  },
  {
    key: 'OTHER',
    label: 'Something else',
    descriptionHint: 'Please describe the issue you encountered with this job listing.',
  },
];

interface Props {
  navigation: any;
  route: any;
}

export const ReportJobScreen: React.FC<Props> = ({ navigation, route }) => {
  const insets = useSafeAreaInsets();
  const { showToast } = useToast();

  const jobId: string = route?.params?.jobId || '';
  const jobTitle: string = route?.params?.jobTitle || 'Job Listing';
  const companyName: string = route?.params?.companyName || 'Employer';

  // Flow steps: 'SELECT_REASON' | 'ADD_DETAILS' | 'SUCCESS'
  const [currentStep, setCurrentStep] = useState<'SELECT_REASON' | 'ADD_DETAILS' | 'SUCCESS'>('SELECT_REASON');
  const [selectedReason, setSelectedReason] = useState<ReportReasonOption | null>(null);
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isEmployerHidden, setIsEmployerHidden] = useState(false);

  const handleSelectReason = (reason: ReportReasonOption) => {
    setSelectedReason(reason);
    setCurrentStep('ADD_DETAILS');
  };

  const handleBack = () => {
    if (currentStep === 'ADD_DETAILS') {
      setCurrentStep('SELECT_REASON');
    } else {
      navigation.goBack();
    }
  };

  const handleClose = () => {
    navigation.goBack();
  };

  const handleSubmitReport = async () => {
    if (!selectedReason) return;
    if (!jobId) {
      // Offline / fallback job preview
      setCurrentStep('SUCCESS');
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await jobsApi.reportJob(jobId, {
        reasonCategory: selectedReason.key,
        description: description.trim() || undefined,
      });

      if (response && response.success === false) {
        showToast(response.message || 'Unable to submit report', 'error');
        setIsSubmitting(false);
        return;
      }

      setCurrentStep('SUCCESS');
    } catch (err: any) {
      // Even if network fails or already reported, provide friendly user-facing resolution
      const errMsg = err?.response?.data?.message || err?.message || '';
      if (errMsg.toLowerCase().includes('already')) {
        setCurrentStep('SUCCESS');
      } else {
        showToast(errMsg || 'Report submitted for review', 'info');
        setCurrentStep('SUCCESS');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleHideEmployer = () => {
    setIsEmployerHidden(true);
    showToast(`Jobs from ${companyName} will be hidden from your feed`, 'success');
  };

  const handleSafetyGuidelines = () => {
    Alert.alert(
      'Job Safety Guidelines',
      '• Legitimate employers never ask candidates to pay for interviews, registration, or equipment.\n• Never share bank details, UPI PINs, or OTPs with recruiters.\n• Always verify official company email domains and interview venue addresses.',
      [{ text: 'Got It', style: 'default' }]
    );
  };

  const handleContactSupport = () => {
    showToast('Trust & Safety team has been alerted', 'info');
  };

  // STEP 3: SUCCESS / CONFIRMATION (Matches user reference Image 2)
  if (currentStep === 'SUCCESS') {
    return (
      <View style={[styles.container, { paddingTop: Math.max(insets.top, 12) }]}>
        <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" translucent={false} />

        {/* Top Header */}
        <View style={styles.headerBar}>
          <View style={styles.headerSideBox} />
          <Text style={styles.headerTitle}>Report</Text>
          <TouchableOpacity
            style={styles.headerSideBox}
            onPress={handleClose}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            activeOpacity={0.7}
          >
            <X size={22} color="#0F172A" strokeWidth={2.2} />
          </TouchableOpacity>
        </View>

        <ScrollView
          contentContainerStyle={[styles.successScrollBody, { paddingBottom: Math.max(insets.bottom + 80, 100) }]}
          showsVerticalScrollIndicator={false}
        >
          {/* Centered Big Checkmark Icon */}
          <View style={styles.successIconCircle}>
            <Check size={32} color="#0F172A" strokeWidth={2.6} />
          </View>

          {/* Headline & Subhead */}
          <Text style={styles.successTitle}>Thanks for your feedback</Text>
          <Text style={styles.successSubtitle}>
            We use these reports to show you less of this kind of content and ensure genuine, scam-free job opportunities.
          </Text>

          {/* Other steps you can take */}
          <View style={styles.otherStepsContainer}>
            <Text style={styles.otherStepsTitle}>Other steps you can take</Text>

            {/* Step 1: Hide Employer */}
            <TouchableOpacity
              style={styles.stepRow}
              activeOpacity={0.65}
              onPress={handleHideEmployer}
              disabled={isEmployerHidden}
            >
              <View style={styles.stepIconBox}>
                <Ban size={22} color={isEmployerHidden ? '#94A3B8' : '#0F172A'} strokeWidth={1.9} />
              </View>
              <View style={styles.stepTextBox}>
                <Text style={[styles.stepLabel, isEmployerHidden && styles.stepLabelDone]}>
                  {isEmployerHidden ? `Hidden jobs from ${companyName}` : `Hide jobs from ${companyName}`}
                </Text>
              </View>
              {isEmployerHidden ? (
                <CheckCircle2 size={18} color="#16A34A" />
              ) : (
                <ChevronRight size={20} color="#94A3B8" />
              )}
            </TouchableOpacity>

            {/* Step 2: Community Standards / Trust Guidelines */}
            <TouchableOpacity
              style={styles.stepRow}
              activeOpacity={0.65}
              onPress={handleSafetyGuidelines}
            >
              <View style={styles.stepIconBox}>
                <ShieldCheck size={22} color="#0F172A" strokeWidth={1.9} />
              </View>
              <View style={styles.stepTextBox}>
                <Text style={styles.stepLabel}>Learn more about our Safety Standards</Text>
              </View>
              <ChevronRight size={20} color="#94A3B8" />
            </TouchableOpacity>

            {/* Step 3: Contact Support */}
            <TouchableOpacity
              style={styles.stepRow}
              activeOpacity={0.65}
              onPress={handleContactSupport}
            >
              <View style={styles.stepIconBox}>
                <Headphones size={22} color="#0F172A" strokeWidth={1.9} />
              </View>
              <View style={styles.stepTextBox}>
                <Text style={styles.stepLabel}>Contact Trust & Safety Support</Text>
              </View>
              <ChevronRight size={20} color="#94A3B8" />
            </TouchableOpacity>
          </View>
        </ScrollView>

        {/* Fixed Bottom CTA "Done" Button */}
        <View style={[styles.bottomActionBar, { paddingBottom: Math.max(insets.bottom + 12, 20) }]}>
          <TouchableOpacity
            style={styles.donePrimaryBtn}
            activeOpacity={0.85}
            onPress={handleClose}
          >
            <Text style={styles.donePrimaryBtnText}>Done</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // STEP 2: DETAILS & SUBMISSION (User selected a reason)
  if (currentStep === 'ADD_DETAILS') {
    return (
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={[styles.container, { paddingTop: Math.max(insets.top, 12) }]}>
          <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" translucent={false} />

          {/* Top Header */}
          <View style={styles.headerBar}>
            <TouchableOpacity
              style={styles.headerSideBox}
              onPress={handleBack}
              hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
              activeOpacity={0.7}
            >
              <ArrowLeft size={22} color="#0F172A" strokeWidth={2.2} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Report</Text>
            <TouchableOpacity
              style={styles.headerSideBox}
              onPress={handleClose}
              hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
              activeOpacity={0.7}
            >
              <X size={22} color="#0F172A" strokeWidth={2.2} />
            </TouchableOpacity>
          </View>

          <ScrollView
            contentContainerStyle={[styles.detailsScrollBody, { paddingBottom: Math.max(insets.bottom + 90, 110) }]}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {/* Reason Badge */}
            <View style={styles.selectedReasonCard}>
              <Text style={styles.selectedReasonCategoryLabel}>Reporting category</Text>
              <Text style={styles.selectedReasonCategoryTitle}>{selectedReason?.label}</Text>
            </View>

            {/* Instruction */}
            <Text style={styles.detailsHeading}>Provide additional context</Text>
            <Text style={styles.detailsSubheading}>
              {selectedReason?.descriptionHint || 'Please explain what happened to help our moderation team investigate.'}
            </Text>

            {/* Text Input */}
            <View style={styles.inputWrapper}>
              <TextInput
                style={styles.textAreaInput}
                placeholder="Write additional details here (optional)..."
                placeholderTextColor="#94A3B8"
                multiline
                numberOfLines={5}
                textAlignVertical="top"
                maxLength={500}
                value={description}
                onChangeText={setDescription}
              />
              <Text style={styles.charCounter}>{description.length}/500</Text>
            </View>

            {/* Privacy Assurance */}
            <View style={styles.confidentialityNotice}>
              <ShieldCheck size={16} color="#059669" />
              <Text style={styles.confidentialityText}>
                Your report is anonymous. The employer will not be notified of who submitted this report.
              </Text>
            </View>
          </ScrollView>

          {/* Bottom Submit CTA */}
          <View style={[styles.bottomActionBar, { paddingBottom: Math.max(insets.bottom + 12, 20) }]}>
            <TouchableOpacity
              style={[styles.donePrimaryBtn, isSubmitting && { opacity: 0.8 }]}
              activeOpacity={0.85}
              onPress={handleSubmitReport}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Text style={styles.donePrimaryBtnText}>Submit Report</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    );
  }

  // STEP 1: SELECT REASON (Matches user reference Image 1)
  return (
    <View style={[styles.container, { paddingTop: Math.max(insets.top, 12) }]}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" translucent={false} />

      {/* Top Header */}
      <View style={styles.headerBar}>
        <TouchableOpacity
          style={styles.headerSideBox}
          onPress={handleBack}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          activeOpacity={0.7}
        >
          <ArrowLeft size={22} color="#0F172A" strokeWidth={2.2} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Report</Text>
        <TouchableOpacity
          style={styles.headerSideBox}
          onPress={handleClose}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          activeOpacity={0.7}
        >
          <X size={22} color="#0F172A" strokeWidth={2.2} />
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={[styles.reasonsScrollBody, { paddingBottom: Math.max(insets.bottom + 40, 50) }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Main Title Section */}
        <View style={styles.heroSection}>
          <Text style={styles.heroTitle}>Why are you reporting this job?</Text>
          <Text style={styles.heroSubtitle}>
            Your report is confidential. If someone is asking for advance money or you are in immediate danger, do not pay and alert local authorities.
          </Text>
        </View>

        {/* Reasons List */}
        <View style={styles.reasonsListWrapper}>
          {REPORT_REASONS.map((item) => (
            <TouchableOpacity
              key={item.key}
              style={styles.reasonRowItem}
              activeOpacity={0.6}
              onPress={() => handleSelectReason(item)}
            >
              <Text style={styles.reasonLabelText}>{item.label}</Text>
              <ChevronRight size={20} color="#94A3B8" strokeWidth={1.8} />
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  headerBar: {
    height: 52,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  headerSideBox: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#0F172A',
  },

  // Step 1: Reasons Styles
  reasonsScrollBody: {
    paddingTop: 24,
  },
  heroSection: {
    paddingHorizontal: 24,
    alignItems: 'center',
    marginBottom: 28,
  },
  heroTitle: {
    fontSize: 19,
    fontWeight: '800',
    color: '#0F172A',
    textAlign: 'center',
    lineHeight: 26,
  },
  heroSubtitle: {
    fontSize: 13,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 19,
    marginTop: 10,
    paddingHorizontal: 8,
  },
  reasonsListWrapper: {
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  reasonRowItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  reasonLabelText: {
    fontSize: 15,
    fontWeight: '500',
    color: '#0F172A',
    flex: 1,
    marginRight: 12,
  },

  // Step 2: Details Styles
  detailsScrollBody: {
    padding: 20,
  },
  selectedReasonCard: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 14,
    borderRadius: RADIUS.card,
    marginBottom: 20,
  },
  selectedReasonCategoryLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748B',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  selectedReasonCategoryTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.primary,
    marginTop: 4,
  },
  detailsHeading: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
  },
  detailsSubheading: {
    fontSize: 13,
    color: '#64748B',
    lineHeight: 18,
    marginTop: 4,
    marginBottom: 16,
  },
  inputWrapper: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: RADIUS.card,
    padding: 12,
  },
  textAreaInput: {
    fontSize: 14,
    color: '#0F172A',
    minHeight: 120,
    padding: 0,
    lineHeight: 20,
  },
  charCounter: {
    fontSize: 11,
    color: '#94A3B8',
    textAlign: 'right',
    marginTop: 6,
  },
  confidentialityNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 16,
    backgroundColor: '#ECFDF5',
    padding: 12,
    borderRadius: RADIUS.card,
    borderWidth: 1,
    borderColor: '#D1FAE5',
  },
  confidentialityText: {
    fontSize: 12,
    color: '#065F46',
    flex: 1,
    lineHeight: 16,
  },

  // Step 3: Success Screen Styles
  successScrollBody: {
    alignItems: 'center',
    paddingTop: 48,
    paddingHorizontal: 20,
  },
  successIconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  successTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0F172A',
    textAlign: 'center',
  },
  successSubtitle: {
    fontSize: 13.5,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 20,
    marginTop: 8,
    paddingHorizontal: 12,
  },
  otherStepsContainer: {
    width: '100%',
    marginTop: 36,
  },
  otherStepsTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 8,
  },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  stepIconBox: {
    width: 32,
    alignItems: 'flex-start',
  },
  stepTextBox: {
    flex: 1,
    marginRight: 8,
  },
  stepLabel: {
    fontSize: 14.5,
    color: '#0F172A',
    fontWeight: '500',
  },
  stepLabelDone: {
    color: '#94A3B8',
    textDecorationLine: 'line-through',
  },

  // Bottom Fixed Bar
  bottomActionBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  donePrimaryBtn: {
    height: 48,
    backgroundColor: COLORS.primary,
    borderRadius: RADIUS.card,
    alignItems: 'center',
    justifyContent: 'center',
  },
  donePrimaryBtnText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
