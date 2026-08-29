import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import {
  IndianRupee,
  Building2,
  MapPin,
  Clock,
  Briefcase,
} from 'lucide-react-native';
import { Job, JobApplication } from '../../../types';
import { RADIUS } from '../../../constants/theme';
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
      <View style={styles.sectionCard}>
        <View style={styles.headerBlock}>
          <Text style={styles.jobTitleLarge}>
            {appliedJob?.title || jobTitle || 'Industrial Operator'}
          </Text>
          <Text style={styles.jobCompanySub}>
            {safeValue(appliedJob?.company || 'Industrial Enterprise')} • {safeValue(appliedJob?.trade || appliedJob?.industry || 'Industrial Trade')}
          </Text>
        </View>

        <View style={styles.sectionDivider} />

        {/* 2. Specifications List */}
        <Text style={styles.sectionHeadingTitle}>JOB SPECIFICATIONS</Text>

        <View style={styles.specRowsContainer}>
          {/* Salary */}
          <View style={styles.specRowItem}>
            <View style={styles.specIconBox}>
              <IndianRupee size={13} color="#1764E8" strokeWidth={2} />
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

          {/* Vacancies */}
          <View style={styles.specRowItem}>
            <View style={styles.specIconBox}>
              <Building2 size={13} color="#1764E8" strokeWidth={2} />
            </View>
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
            <View style={styles.specIconBox}>
              <MapPin size={13} color="#1764E8" strokeWidth={2} />
            </View>
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
            <View style={styles.specIconBox}>
              <Clock size={13} color="#1764E8" strokeWidth={2} />
            </View>
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
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 14,
  },
  sectionCard: {
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
  },
  headerBlock: {
    marginBottom: 2,
  },
  jobTitleLarge: {
    fontSize: 15,
    fontWeight: '700',
    color: '#102A5C',
    lineHeight: 21,
  },
  jobCompanySub: {
    fontSize: 11.5,
    fontWeight: '500',
    color: '#657796',
    marginTop: 3,
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
    marginBottom: 8,
  },
  specRowsContainer: {
    gap: 2,
  },
  specRowItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 5,
  },
  specIconBox: {
    width: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  specTextCol: {
    flex: 1,
  },
  specGridLabel: {
    fontSize: 10.5,
    color: '#657796',
    fontWeight: '500',
  },
  specGridValue: {
    fontSize: 12.5,
    fontWeight: '600',
    color: '#102A5C',
    marginTop: 1,
  },
  rowDivider: {
    height: 1,
    backgroundColor: '#F8FAFC',
  },
  infoSectionBody: {
    fontSize: 12,
    color: '#334155',
    lineHeight: 18,
  },
  skillsWrapRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 2,
  },
  borderlessSkillTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  skillDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: '#1764E8',
  },
  borderlessSkillText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#334155',
  },
});
