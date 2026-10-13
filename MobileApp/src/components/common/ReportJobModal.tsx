import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  ActivityIndicator,
  TouchableWithoutFeedback,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import {
  ShieldAlert,
  X,
  CheckCircle2,
  DollarSign,
  Building,
  AlertTriangle,
  Flame,
  Mail,
  HelpCircle,
  ShieldCheck,
} from 'lucide-react-native';
import { COLORS, RADIUS } from '../../constants/theme';
import { jobsApi } from '../../api/jobsApi';

export interface ReportJobModalProps {
  visible: boolean;
  jobId: string;
  jobTitle?: string;
  companyName?: string;
  onClose: () => void;
  onReportSuccess?: () => void;
}

interface ReasonOption {
  key: string;
  label: string;
  description: string;
  icon: any;
  color: string;
}

const REPORT_REASONS: ReasonOption[] = [
  {
    key: 'SCAM_FEE',
    label: 'Asking for Money or Registration Fee',
    description: 'Employer demanded payment for interview, security deposit, uniform, or document verification.',
    icon: DollarSign,
    color: '#DC2626',
  },
  {
    key: 'FAKE_EMPLOYER',
    label: 'Fake Employer or Ghost Company',
    description: 'Company does not exist at the venue, recruiter is impersonating a brand, or fake offer.',
    icon: Building,
    color: '#D97706',
  },
  {
    key: 'MISLEADING_TERMS',
    label: 'Misleading Salary or Job Description',
    description: 'Actual salary, shift timing, work type, or location differ drastically from the listing.',
    icon: AlertTriangle,
    color: '#2563EB',
  },
  {
    key: 'OFFENSIVE_CONTENT',
    label: 'Inappropriate or Discriminatory Content',
    description: 'Contains offensive language, harassment, discrimination, or illegal work demands.',
    icon: Flame,
    color: '#DC2626',
  },
  {
    key: 'SPAM_PROMO',
    label: 'Spam, Advertisement, or Network Marketing',
    description: 'Not a genuine job opening. Attempting to sell courses, products, or MLM schemes.',
    icon: Mail,
    color: '#7C3AED',
  },
  {
    key: 'OTHER',
    label: 'Other Safety Violation',
    description: 'Any other suspicious activity that violates platform trust & safety guidelines.',
    icon: HelpCircle,
    color: '#475569',
  },
];

export const ReportJobModal: React.FC<ReportJobModalProps> = ({
  visible,
  jobId,
  jobTitle,
  companyName,
  onClose,
  onReportSuccess,
}) => {
  const [selectedReason, setSelectedReason] = useState<string>('SCAM_FEE');
  const [details, setDetails] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const resetState = () => {
    setSelectedReason('SCAM_FEE');
    setDetails('');
    setLoading(false);
    setErrorMessage(null);
    setIsSubmitted(false);
  };

  const handleClose = () => {
    if (loading) return;
    resetState();
    onClose();
  };

  const handleSubmit = async () => {
    if (!selectedReason) {
      setErrorMessage('Please select a reason for reporting.');
      return;
    }

    setLoading(true);
    setErrorMessage(null);

    try {
      const selectedObj = REPORT_REASONS.find((r) => r.key === selectedReason);
      const categoryLabel = selectedObj?.label || selectedReason;

      const res = await jobsApi.reportJob(jobId, {
        reasonCategory: categoryLabel,
        description: details.trim(),
      });

      if (res && res.success !== false) {
        setIsSubmitted(true);
        onReportSuccess?.();
      } else {
        setErrorMessage(res?.error || 'Failed to submit report. Please try again.');
      }
    } catch (err: any) {
      setErrorMessage(err?.message || 'Something went wrong while submitting the report.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={handleClose}
      statusBarTranslucent
    >
      <TouchableWithoutFeedback onPress={handleClose}>
        <View style={styles.modalOverlay}>
          <TouchableWithoutFeedback>
            <KeyboardAvoidingView
              behavior={Platform.OS === 'ios' ? 'padding' : undefined}
              style={styles.modalContainer}
            >
              {/* Header Row */}
              <View style={styles.modalHeader}>
                <View style={styles.headerTitleRow}>
                  <View style={styles.shieldIconBadge}>
                    <ShieldAlert size={20} color="#DC2626" />
                  </View>
                  <View style={{ flex: 1, minWidth: 0 }}>
                    <Text style={styles.headerTitleText}>Report Job Listing</Text>
                    <Text style={styles.headerSubText} numberOfLines={1}>
                      {jobTitle || 'Job Opening'}{companyName ? ` • ${companyName}` : ''}
                    </Text>
                  </View>
                </View>

                <TouchableOpacity
                  style={styles.closeBtn}
                  onPress={handleClose}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <X size={18} color="#64748B" />
                </TouchableOpacity>
              </View>

              {isSubmitted ? (
                /* SUCCESS CONFIRMATION STATE */
                <View style={styles.successStateBox}>
                  <View style={styles.successIconCircle}>
                    <CheckCircle2 size={44} color="#059669" />
                  </View>
                  <Text style={styles.successTitle}>Report Submitted</Text>
                  <Text style={styles.successDesc}>
                    Thank you for helping keep the JobMarket community authentic and safe. Our Trust & Safety team reviews all reported listings within 24 hours.
                  </Text>
                  <View style={styles.confidentialityBadge}>
                    <ShieldCheck size={16} color="#2563EB" />
                    <Text style={styles.confidentialityText}>
                      Your report is 100% confidential. The employer will not see who flagged this listing.
                    </Text>
                  </View>
                  <TouchableOpacity
                    style={styles.successDoneBtn}
                    onPress={handleClose}
                    activeOpacity={0.85}
                  >
                    <Text style={styles.successDoneBtnText}>Done</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                /* FORM INPUT STATE */
                <ScrollView
                  style={styles.scrollArea}
                  contentContainerStyle={styles.scrollContent}
                  showsVerticalScrollIndicator={false}
                  keyboardShouldPersistTaps="handled"
                >
                  <Text style={styles.sectionLabel}>Select the primary issue:</Text>

                  {REPORT_REASONS.map((reason) => {
                    const isSelected = selectedReason === reason.key;
                    const IconComp = reason.icon;
                    return (
                      <TouchableOpacity
                        key={reason.key}
                        style={[
                          styles.reasonOptionCard,
                          isSelected && styles.reasonOptionCardActive,
                        ]}
                        activeOpacity={0.8}
                        onPress={() => {
                          setSelectedReason(reason.key);
                          setErrorMessage(null);
                        }}
                      >
                        <View style={[styles.reasonIconBox, { backgroundColor: `${reason.color}15` }]}>
                          <IconComp size={18} color={reason.color} />
                        </View>
                        <View style={{ flex: 1, minWidth: 0 }}>
                          <Text style={[styles.reasonLabel, isSelected && styles.reasonLabelActive]}>
                            {reason.label}
                          </Text>
                          <Text style={styles.reasonDesc}>{reason.description}</Text>
                        </View>
                        <View style={[styles.radioCircle, isSelected && styles.radioCircleActive]}>
                          {isSelected && <View style={styles.radioDot} />}
                        </View>
                      </TouchableOpacity>
                    );
                  })}

                  {/* Additional Details */}
                  <View style={styles.detailsSection}>
                    <Text style={styles.sectionLabel}>Additional details (optional):</Text>
                    <TextInput
                      style={styles.detailsInput}
                      placeholder="Explain what happened (e.g. asked money on WhatsApp, wrong company address, false salary)..."
                      placeholderTextColor="#94A3B8"
                      multiline
                      numberOfLines={3}
                      maxLength={500}
                      value={details}
                      onChangeText={setDetails}
                      textAlignVertical="top"
                    />
                    <Text style={styles.charCountText}>{details.length}/500</Text>
                  </View>

                  {/* Safety note */}
                  <View style={styles.confidentialNoteRow}>
                    <ShieldCheck size={14} color="#64748B" />
                    <Text style={styles.confidentialNoteText}>
                      Reports are strictly confidential and audited by human moderators.
                    </Text>
                  </View>

                  {errorMessage ? (
                    <View style={styles.errorBanner}>
                      <Text style={styles.errorBannerText}>{errorMessage}</Text>
                    </View>
                  ) : null}

                  {/* CTA Actions */}
                  <View style={styles.actionButtonsRow}>
                    <TouchableOpacity
                      style={styles.cancelButton}
                      onPress={handleClose}
                      disabled={loading}
                    >
                      <Text style={styles.cancelButtonText}>Cancel</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[styles.submitButton, loading && styles.submitButtonDisabled]}
                      onPress={handleSubmit}
                      disabled={loading}
                      activeOpacity={0.85}
                    >
                      {loading ? (
                        <ActivityIndicator size="small" color="#FFFFFF" />
                      ) : (
                        <Text style={styles.submitButtonText}>Submit Report</Text>
                      )}
                    </TouchableOpacity>
                  </View>
                </ScrollView>
              )}
            </KeyboardAvoidingView>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    maxHeight: '90%',
    paddingBottom: Platform.OS === 'ios' ? 24 : 16,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
    paddingRight: 8,
  },
  shieldIconBadge: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: '#FEF2F2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitleText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
  },
  headerSubText: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 1,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 6,
    backgroundColor: '#F8FAFC',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollArea: {
    maxHeight: 520,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 20,
  },
  sectionLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 8,
  },
  reasonOptionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderRadius: RADIUS.card,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    backgroundColor: '#FFFFFF',
    marginBottom: 8,
    gap: 10,
  },
  reasonOptionCardActive: {
    borderColor: COLORS.primary,
    backgroundColor: '#EFF6FF',
  },
  reasonIconBox: {
    width: 34,
    height: 34,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  reasonLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#0F172A',
  },
  reasonLabelActive: {
    color: COLORS.primary,
    fontWeight: '700',
  },
  reasonDesc: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
    lineHeight: 14,
  },
  radioCircle: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 1.5,
    borderColor: '#94A3B8',
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioCircleActive: {
    borderColor: COLORS.primary,
  },
  radioDot: {
    width: 9,
    height: 9,
    borderRadius: 4.5,
    backgroundColor: COLORS.primary,
  },
  detailsSection: {
    marginTop: 8,
    marginBottom: 8,
  },
  detailsInput: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 8,
    padding: 10,
    fontSize: 12.5,
    color: '#0F172A',
    minHeight: 68,
  },
  charCountText: {
    fontSize: 10.5,
    color: '#94A3B8',
    textAlign: 'right',
    marginTop: 4,
  },
  confidentialNoteRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 6,
  },
  confidentialNoteText: {
    fontSize: 11.5,
    color: '#64748B',
  },
  errorBanner: {
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
    borderRadius: 6,
    padding: 8,
    marginTop: 6,
  },
  errorBannerText: {
    fontSize: 12,
    color: '#DC2626',
    fontWeight: '500',
  },
  actionButtonsRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 14,
  },
  cancelButton: {
    flex: 1,
    height: 44,
    borderRadius: RADIUS.card,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#475569',
  },
  submitButton: {
    flex: 2,
    height: 44,
    borderRadius: RADIUS.card,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitButtonDisabled: {
    opacity: 0.65,
  },
  submitButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  /* SUCCESS STATE */
  successStateBox: {
    padding: 24,
    alignItems: 'center',
  },
  successIconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#ECFDF5',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  successTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 8,
  },
  successDesc: {
    fontSize: 13,
    color: '#475569',
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 16,
  },
  confidentialityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#EFF6FF',
    borderRadius: 8,
    padding: 12,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  confidentialityText: {
    fontSize: 12,
    color: '#1E40AF',
    flex: 1,
    lineHeight: 16,
  },
  successDoneBtn: {
    width: '100%',
    height: 44,
    borderRadius: RADIUS.card,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  successDoneBtnText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});

export default ReportJobModal;
