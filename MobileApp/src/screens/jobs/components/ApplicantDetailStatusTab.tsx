import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { CheckCircle2 } from 'lucide-react-native';
import { ApplicationStatus, JobApplication } from '../../../types';
import { Badge } from '../../../components/common/Badge';
import { COLORS } from '../../../constants/theme';

interface ApplicantDetailStatusTabProps {
  selectedApplicant: JobApplication | null;
  jobId?: string;
  onUpdateStatus: (userId: string, newStatus: ApplicationStatus, targetJobId?: string) => void;
}

export const ApplicantDetailStatusTab: React.FC<ApplicantDetailStatusTabProps> = ({
  selectedApplicant,
  jobId,
  onUpdateStatus,
}) => {
  return (
    <View>
      <View style={styles.modalSectionBox}>
        <Text style={styles.sectionHeadingTitle}>CURRENT APPLICATION STATUS</Text>
        <View style={styles.minimalStatusRow}>
          <Badge status={selectedApplicant?.status || 'applied'} />
          <Text style={styles.minimalStatusSub}>
            Applied on {new Date(selectedApplicant?.applied_at || Date.now()).toLocaleDateString()}
          </Text>
        </View>
      </View>

      <View style={styles.sectionSeparator} />

      <View style={styles.modalSectionBox}>
        <Text style={styles.sectionHeadingTitle}>SELECT CANDIDATE WORKFLOW STATUS</Text>
        <View style={styles.statusButtonList}>
          {[
            { key: 'applied', label: 'Applied', desc: 'Candidate application received' },
            { key: 'shortlisted', label: 'Shortlisted', desc: 'Mark candidate as shortlisted for review' },
            { key: 'interview', label: 'Interview Scheduled', desc: 'Interview invite & walk-in pass released' },
            { key: 'hired', label: 'Hired', desc: 'Offer extended & candidate hired' },
            { key: 'rejected', label: 'Rejected', desc: 'Application not moving forward' },
          ].map((item) => {
            const isSelected =
              selectedApplicant?.status === item.key ||
              (item.key === 'interview' && (selectedApplicant?.status === 'interviewed' || selectedApplicant?.status === 'interview_scheduled'));
            return (
              <TouchableOpacity
                key={item.key}
                activeOpacity={0.8}
                style={[styles.cleanStatusOptionRow, isSelected && styles.cleanStatusOptionRowSelected]}
                onPress={() => {
                  if (selectedApplicant) {
                    const activeJId = selectedApplicant.job_id || (selectedApplicant as any).jobId || jobId;
                    onUpdateStatus(selectedApplicant.user_id, item.key as ApplicationStatus, activeJId);
                  }
                }}
              >
                <View style={{ flex: 1 }}>
                  <Text style={[styles.cleanStatusOptionText, isSelected && styles.cleanStatusOptionTextSelected]}>
                    {item.label}
                  </Text>
                  <Text style={styles.cleanStatusOptionDesc}>{item.desc}</Text>
                </View>
                {isSelected ? <CheckCircle2 size={18} color={COLORS.primary} /> : <View style={styles.radioDotOutline} />}
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  modalSectionBox: {
    padding: 16,
  },
  sectionHeadingTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: '#94A3B8',
    letterSpacing: 0.8,
    marginBottom: 6,
  },
  minimalStatusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 4,
  },
  minimalStatusSub: {
    fontSize: 12,
    color: '#64748B',
  },
  sectionSeparator: {
    height: 1,
    backgroundColor: '#F1F5F9',
  },
  statusButtonList: {
    gap: 8,
    marginTop: 6,
  },
  cleanStatusOptionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    backgroundColor: '#FFFFFF',
  },
  cleanStatusOptionRowSelected: {
    borderColor: COLORS.primary,
    backgroundColor: '#EFF6FF',
  },
  cleanStatusOptionText: {
    fontSize: 13.5,
    fontWeight: '700',
    color: '#0F172A',
  },
  cleanStatusOptionTextSelected: {
    color: COLORS.primary,
  },
  cleanStatusOptionDesc: {
    fontSize: 11.5,
    color: '#64748B',
    marginTop: 2,
  },
  radioDotOutline: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 1.5,
    borderColor: '#94A3B8',
  },
});
