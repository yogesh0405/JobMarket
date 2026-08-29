import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Mail, User, Send, ChevronDown } from 'lucide-react-native';
import { JobApplication } from '../../../types';
import { Input } from '../../../components/common/Input';
import { Button } from '../../../components/common/Button';
import { RADIUS } from '../../../constants/theme';
import { safeValue } from './JobApplicantsUtils';

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
  emailSubject,
  setEmailSubject,
  emailMessage,
  setEmailMessage,
  onSendCustomEmail,
  modalLoading,
  jobTitle,
}) => {
  const candidateName = safeValue(selectedApplicant?.user?.name || 'Applicant');
  const candidateEmail = safeValue(selectedApplicant?.user?.email || 'No email provided');
  const activeJobTitle = safeValue(selectedApplicant?.job?.title || jobTitle || 'Position');

  const isFormValid = emailSubject.trim().length > 0 && emailMessage.trim().length > 0;

  return (
    <View style={styles.container}>
      <View style={styles.sectionCard}>
        {/* Candidate Recipient Card */}
        <View style={styles.recipientHeaderRow}>
          <View style={styles.avatarSquircle}>
            <User size={18} color="#1764E8" strokeWidth={2} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.candidateNameText} numberOfLines={1}>
              {candidateName}
            </Text>
            <View style={styles.emailBadgeRow}>
              <Mail size={11} color="#657796" />
              <Text style={styles.candidateEmailText} numberOfLines={1}>
                {candidateEmail}
              </Text>
            </View>
          </View>
          <View style={styles.jobTagBadge}>
            <Text style={styles.jobTagText} numberOfLines={1}>
              {activeJobTitle}
            </Text>
          </View>
        </View>

        <View style={styles.sectionDivider} />

        {/* Template Quick Selection */}
        <View style={{ marginBottom: 12 }}>
          <Text style={styles.sectionHeadingTitle}>EMAIL TEMPLATES</Text>
          <TouchableOpacity
            style={styles.templateDropdownBtn}
            activeOpacity={0.8}
            onPress={onOpenTemplateDropdown}
          >
            <Text style={styles.templateDropdownText} numberOfLines={1}>
              {selectedTemplateLabel || 'Select Quick Email Template...'}
            </Text>
            <ChevronDown size={14} color="#657796" />
          </TouchableOpacity>
        </View>

        {/* Form Inputs: Subject & Body */}
        <View style={styles.formInputsWrap}>
          <Input
            label="Email Subject Line *"
            placeholder="e.g. Technical Interview Call: Industrial Fitter"
            value={emailSubject}
            onChangeText={setEmailSubject}
          />

          <View style={styles.messageInputGroup}>
            <Text style={styles.inputLabelText}>Email Message Body *</Text>
            <View style={styles.multilineInputBoxContainer}>
              <Input
                placeholder="Write official email message to candidate..."
                value={emailMessage}
                onChangeText={setEmailMessage}
                multiline
                numberOfLines={10}
                style={styles.multilineInputBox}
                inputContainerStyle={styles.multilineInputContainerStyle}
                containerStyle={{ flex: 1, marginBottom: 0 }}
              />
            </View>
          </View>
        </View>

        <Button
          title="Send Custom Email"
          onPress={onSendCustomEmail}
          loading={modalLoading}
          disabled={!isFormValid || modalLoading}
          icon={<Send size={14} color="#FFFFFF" />}
          style={styles.sendSubmitBtn}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 14,
  },
  sectionCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: RADIUS.card,
    borderWidth: 1,
    borderColor: '#E7EBF2',
    padding: 14,
    shadowColor: '#142A50',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
    justifyContent: 'space-between',
  },
  recipientHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  avatarSquircle: {
    width: 26,
    alignItems: 'center',
    justifyContent: 'center',
  },
  candidateNameText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#102A5C',
  },
  emailBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  candidateEmailText: {
    fontSize: 11,
    fontWeight: '500',
    color: '#657796',
  },
  jobTagBadge: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 6,
    paddingHorizontal: 7,
    paddingVertical: 3,
    maxWidth: 120,
  },
  jobTagText: {
    fontSize: 10.5,
    fontWeight: '500',
    color: '#657796',
  },
  sectionDivider: {
    height: 1,
    backgroundColor: '#E7EBF2',
    marginVertical: 12,
  },
  sectionHeadingTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: '#657796',
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  templateDropdownBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 6,
    paddingHorizontal: 12,
    height: 38,
  },
  templateDropdownText: {
    fontSize: 11.5,
    fontWeight: '500',
    color: '#102A5C',
    flex: 1,
  },
  formInputsWrap: {
    flex: 1,
    marginTop: 2,
  },
  messageInputGroup: {
    flex: 1,
    marginTop: 8,
    marginBottom: 8,
  },
  inputLabelText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#657796',
    marginBottom: 5,
  },
  multilineInputBoxContainer: {
    flex: 1,
    minHeight: 200,
  },
  multilineInputBox: {
    flex: 1,
    minHeight: 200,
    textAlignVertical: 'top',
    fontSize: 12,
    color: '#102A5C',
  },
  multilineInputContainerStyle: {
    flex: 1,
    minHeight: 200,
    alignItems: 'flex-start',
    paddingVertical: 8,
  },
  sendSubmitBtn: {
    marginTop: 10,
    height: 42,
    borderRadius: 6,
    backgroundColor: '#1764E8',
  },
});
