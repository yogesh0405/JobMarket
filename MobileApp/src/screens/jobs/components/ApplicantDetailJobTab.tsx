import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import {
  Briefcase,
  IndianRupee,
  Building2,
  MapPin,
  Clock,
} from 'lucide-react-native';
import { Job, JobApplication } from '../../../types';
import { COLORS } from '../../../constants/theme';
import { safeValue } from './JobApplicantsUtils';

interface ApplicantDetailJobTabProps {
  selectedApplicant: JobApplication | null;
  jobDetails: Job | null;
  myJobs: Job[];
  jobTitle: string;
}

export const ApplicantDetailJobTab: React.FC<ApplicantDetailJobTabProps> = ({
  selectedApplicant,
  jobDetails,
  myJobs,
  jobTitle,
}) => {
  const appliedJob = selectedApplicant?.job || myJobs.find((j) => j.id === selectedApplicant?.job_id) || jobDetails;

  return (
    <View style={styles.modalSectionBox}>
      <Text style={styles.sectionHeadingTitle}>APPLIED JOB SPECIFICATIONS</Text>
      <Text style={styles.jobTitleLarge}>{appliedJob?.title || jobTitle || 'Industrial Operator'}</Text>
      <Text style={styles.jobCompanySub}>
        {safeValue(appliedJob?.company || 'Industrial Enterprise')} • {safeValue(appliedJob?.trade || appliedJob?.industry || 'Industrial Trade')}
      </Text>

      <View style={[styles.rowDivider, { marginVertical: 12 }]} />

      <Text style={styles.sectionHeadingTitle}>JOB DETAILS & SALARY</Text>

      <View style={styles.specRowsContainer}>
        <View style={styles.specRowItem}>
          <View style={styles.specIconBadge}>
            <IndianRupee size={15} color={COLORS.primary} />
          </View>
          <View style={styles.specTextCol}>
            <Text style={styles.specGridLabel}>Salary Offer</Text>
            <Text style={styles.specGridValue}>
              {appliedJob?.salary_min
                ? `₹${appliedJob.salary_min.toLocaleString()} - ₹${appliedJob.salary_max?.toLocaleString()} / mo`
                : '₹25,000 - ₹35,000 / mo'}
            </Text>
          </View>
        </View>

        <View style={styles.rowDivider} />

        <View style={styles.specRowItem}>
          <View style={styles.specIconBadge}>
            <Building2 size={15} color="#16A34A" />
          </View>
          <View style={styles.specTextCol}>
            <Text style={styles.specGridLabel}>Vacancies & Openings</Text>
            <Text style={styles.specGridValue}>{appliedJob?.openings || (appliedJob as any)?.vacancies || 1} Openings</Text>
          </View>
        </View>

        <View style={styles.rowDivider} />

        <View style={styles.specRowItem}>
          <View style={styles.specIconBadge}>
            <MapPin size={15} color="#0284C7" />
          </View>
          <View style={styles.specTextCol}>
            <Text style={styles.specGridLabel}>MIDC Location Address</Text>
            <Text style={styles.specGridValue}>
              {safeValue(appliedJob?.location || (appliedJob as any)?.midcZone || 'Waluj MIDC Industrial Area')}
            </Text>
          </View>
        </View>

        <View style={styles.rowDivider} />

        <View style={styles.specRowItem}>
          <View style={styles.specIconBadge}>
            <Clock size={15} color="#D97706" />
          </View>
          <View style={styles.specTextCol}>
            <Text style={styles.specGridLabel}>Work Shift & Mode</Text>
            <Text style={styles.specGridValue}>
              {safeValue((appliedJob as any)?.shift_timing || (appliedJob as any)?.shift_category || 'Day Shift')} • {appliedJob?.work_mode || 'On-site'}
            </Text>
          </View>
        </View>
      </View>

      {appliedJob?.description ? (
        <>
          <View style={[styles.rowDivider, { marginVertical: 12 }]} />
          <Text style={styles.sectionHeadingTitle}>JOB DESCRIPTION & REQUIREMENTS</Text>
          <Text style={styles.infoSectionBody}>{appliedJob.description}</Text>
        </>
      ) : null}

      {appliedJob?.skills && appliedJob.skills.length > 0 ? (
        <>
          <View style={[styles.rowDivider, { marginVertical: 12 }]} />
          <Text style={styles.sectionHeadingTitle}>REQUIRED TRADE SKILLS</Text>
          <View style={styles.skillsWrapRow}>
            {(Array.isArray(appliedJob.skills) ? appliedJob.skills : [appliedJob.skills]).map((skill: any, i: number) => (
              <View key={i} style={styles.borderlessSkillTag}>
                <View style={styles.skillDot} />
                <Text style={styles.borderlessSkillText}>{safeValue(skill)}</Text>
              </View>
            ))}
          </View>
        </>
      ) : null}
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
  jobTitleLarge: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
  },
  jobCompanySub: {
    fontSize: 12.5,
    color: '#64748B',
    marginTop: 2,
  },
  rowDivider: {
    height: 1,
    backgroundColor: '#F1F5F9',
  },
  specRowsContainer: {
    gap: 8,
    marginTop: 6,
  },
  specRowItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 4,
  },
  specIconBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F8FAFC',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  specTextCol: {
    flex: 1,
  },
  specGridLabel: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '600',
  },
  specGridValue: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
    marginTop: 1,
  },
  infoSectionBody: {
    fontSize: 13,
    color: '#334155',
    lineHeight: 18,
  },
  skillsWrapRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 4,
  },
  borderlessSkillTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 4,
  },
  skillDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.primary,
  },
  borderlessSkillText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#334155',
  },
});
