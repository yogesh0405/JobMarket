import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { Mail, FileText, ChevronRight, Send, CheckCircle2, User, Sparkles, AlertCircle } from 'lucide-react-native';
import { JobApplication } from '../../../types';
import { Input } from '../../../components/common/Input';
import { Button } from '../../../components/common/Button';
import { COLORS, FONTS } from '../../../constants/theme';
import { safeValue, EMAIL_TEMPLATES } from './JobApplicantsUtils';

interface ApplicantDetailEmailTabProps {
  selectedApplicant: JobApplication | null;
  selectedTemplateLabel: string;
  onOpenTemplateDropdown: () => void;
  onSelectTemplateKey?: (key: string) => void;
  emailSubject: string;
  setEmailSubject: (subj: string) => void;
  emailMessage: string;
  setEmailMessage: (msg: string) => void;
  onSendCustomEmail: () => void;
  modalLoading: boolean;
  jobTitle?: string;
}

export const ApplicantDetailEmailTab: React.FC<ApplicantDetailEmailTabProps> = ({
  selectedApplicant,
  selectedTemplateLabel,
  onOpenTemplateDropdown,
  onSelectTemplateKey,
  emailSubject,
  setEmailSubject,
  emailMessage,
  setEmailMessage,
  onSendCustomEmail,
  modalLoading,
  jobTitle,
}) => {
  const candidateName = safeValue(selectedApplicant?.user?.name || 'Applicant');
  const candidateEmail = safeValue(selectedApplicant?.user?.email);
  const activeJobTitle = safeValue(selectedApplicant?.job?.title || jobTitle || 'Position');

  const isFormValid = emailSubject.trim().length > 0 && emailMessage.trim().length > 0;

  return (
    <View style={styles.container}>
      <View style={styles.contentPadding}>
        {/* Candidate Recipient Card Container (No nested cards, clean square border) */}
        <View style={styles.recipientCardContainer}>
          <View style={styles.recipientHeaderRow}>
            <View style={styles.avatarSquircle}>
              <User size={18} color={COLORS.primary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.candidateNameText} numberOfLines={1}>{candidateName}</Text>
              <View style={styles.emailBadgeRow}>
                <Mail size={12} color={COLORS.primary} />
                <Text style={styles.candidateEmailText} numberOfLines={1}>{candidateEmail}</Text>
              </View>
            </View>
            <View style={styles.jobTagBadge}>
              <Text style={styles.jobTagText} numberOfLines={1}>{activeJobTitle}</Text>
            </View>
          </View>
        </View>

        {/* Crisp Slate 400 Section Divider */}
        <View style={styles.slateSectionDivider} />

        {/* Form Inputs: Subject & Body */}
        <View style={styles.formInputsWrap}>
          <Input
            label="Email Subject Line *"
            placeholder="e.g. Interview Invitation: Mechanical Fitter"
            value={emailSubject}
            onChangeText={setEmailSubject}
            containerStyle={styles.inputSpacing}
          />

          <Input
            label="Email Message Body *"
            placeholder="Write official email message to candidate..."
            value={emailMessage}
            onChangeText={setEmailMessage}
            multiline
            numberOfLines={10}
            style={styles.multilineInputBox}
            inputContainerStyle={styles.multilineInputContainerStyle}
            containerStyle={{ marginBottom: 4 }}
          />
        </View>
      </View>

      {/* Primary Action Sticky Callout Bar */}
      <View style={styles.stickyActionCalloutBar}>
        <Button
          title="Send Custom Email"
          onPress={onSendCustomEmail}
          loading={modalLoading}
          disabled={!isFormValid || modalLoading}
          icon={<Send size={16} color="#FFFFFF" />}
          style={!isFormValid || modalLoading ? styles.sendSubmitBtnDisabled : styles.sendSubmitBtn}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  contentPadding: {
    padding: 16,
  },
  recipientCardContainer: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 0,
    padding: 14,
  },
  recipientHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  avatarSquircle: {
    width: 38,
    height: 38,
    borderRadius: 0,
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#BFDBFE',
    alignItems: 'center',
    justifyContent: 'center',
  },
  candidateNameText: {
    fontSize: 14.5,
    fontWeight: '800',
    color: '#0F172A',
  },
  emailBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  candidateEmailText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.primary,
  },
  jobTagBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 0,
    maxWidth: 110,
  },
  jobTagText: {
    fontSize: 10.5,
    fontWeight: '700',
    color: '#475569',
  },

  slateSectionDivider: {
    height: 1,
    backgroundColor: '#94A3B8',
    marginVertical: 14,
  },

  formInputsWrap: {
    marginTop: 6,
  },
  inputSpacing: {
    marginBottom: 12,
  },
  multilineInputContainerStyle: {
    borderRadius: 0,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    paddingVertical: 10,
    minHeight: 180,
    alignItems: 'flex-start',
  },
  multilineInputBox: {
    minHeight: 160,
    textAlignVertical: 'top',
    fontSize: 13.5,
    color: '#0F172A',
    lineHeight: 20,
    paddingTop: 0,
    paddingBottom: 0,
  },

  stickyActionCalloutBar: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#CBD5E1',
  },
  sendSubmitBtn: {
    width: '100%',
    height: 48,
    borderRadius: 0,
    backgroundColor: COLORS.primary,
  },
  sendSubmitBtnDisabled: {
    backgroundColor: '#94A3B8',
  },
});
