import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import {
  Briefcase,
  IndianRupee,
  Building2,
  MapPin,
  Clock,
  CheckCircle2,
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
    <View style={styles.container}>
      {/* 1. Header Information */}
      <View style={styles.headerBlock}>
        <Text style={styles.jobTitleLarge}>
          {appliedJob?.title || jobTitle || 'Industrial Operator'}
        </Text>
        <Text style={styles.jobCompanySub}>
          {safeValue(appliedJob?.company || 'Industrial Enterprise')} • {safeValue(appliedJob?.trade || appliedJob?.industry || 'Industrial Trade')}
        </Text>
      </View>

      <View style={styles.sectionDivider} />

      {/* 2. Specifications List (Minimal - No Icon Background Boxes) */}
      <Text style={styles.sectionHeadingTitle}>JOB SPECIFICATIONS</Text>

      <View style={styles.specRowsContainer}>
        {/* Salary */}
        <View style={styles.specRowItem}>
          <IndianRupee size={16} color={COLORS.primary} strokeWidth={2.2} />
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

        {/* Vacancies */}
        <View style={styles.specRowItem}>
          <Building2 size={16} color={COLORS.primary} strokeWidth={2.2} />
          <View style={styles.specTextCol}>
            <Text style={styles.specGridLabel}>Open Vacancies</Text>
            <Text style={styles.specGridValue}>
              {appliedJob?.openings || (appliedJob as any)?.vacancies || 1} Openings
            </Text>
          </View>
        </View>

        <View style={styles.rowDivider} />

        {/* Location */}
        <View style={styles.specRowItem}>
          <MapPin size={16} color={COLORS.primary} strokeWidth={2.2} />
          <View style={styles.specTextCol}>
            <Text style={styles.specGridLabel}>Work Location</Text>
            <Text style={styles.specGridValue}>
              {safeValue(appliedJob?.location || (appliedJob as any)?.midcZone || 'Waluj MIDC Industrial Area')}
            </Text>
          </View>
        </View>

        <View style={styles.rowDivider} />

        {/* Shift */}
        <View style={styles.specRowItem}>
          <Clock size={16} color={COLORS.primary} strokeWidth={2.2} />
          <View style={styles.specTextCol}>
            <Text style={styles.specGridLabel}>Work Shift & Mode</Text>
            <Text style={styles.specGridValue}>
              {safeValue((appliedJob as any)?.shift_timing || (appliedJob as any)?.shift_category || 'Day Shift')} • {appliedJob?.work_mode || 'On-site'}
            </Text>
          </View>
        </View>
      </View>

      {/* 3. Job Description */}
      {appliedJob?.description ? (
        <>
          <View style={styles.sectionDivider} />
          <Text style={styles.sectionHeadingTitle}>JOB DESCRIPTION</Text>
          <Text style={styles.infoSectionBody}>{appliedJob.description}</Text>
        </>
      ) : null}

      {/* 4. Required Skills */}
      {appliedJob?.skills && appliedJob.skills.length > 0 ? (
        <>
          <View style={styles.sectionDivider} />
          <Text style={styles.sectionHeadingTitle}>REQUIRED SKILLS</Text>
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
  container: {
    padding: 16,
    paddingBottom: 50,
    backgroundColor: '#F8FAFC',
  },
  headerBlock: {
    marginBottom: 4,
  },
  jobTitleLarge: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
    lineHeight: 24,
  },
  jobCompanySub: {
    fontSize: 13,
    color: '#64748B',
    marginTop: 4,
  },
  sectionDivider: {
    height: 1,
    backgroundColor: '#E2E8F0',
    marginVertical: 14,
  },
  sectionHeadingTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: '#94A3B8',
    letterSpacing: 0.8,
    marginBottom: 10,
  },
  specRowsContainer: {
    gap: 4,
  },
  specRowItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 6,
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
    fontSize: 13.5,
    fontWeight: '700',
    color: '#0F172A',
    marginTop: 1,
  },
  rowDivider: {
    height: 1,
    backgroundColor: '#F1F5F9',
  },
  infoSectionBody: {
    fontSize: 13,
    color: '#334155',
    lineHeight: 20,
  },
  skillsWrapRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 2,
  },
  borderlessSkillTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
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
