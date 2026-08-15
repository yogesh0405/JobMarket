import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Building2, Search, Clock } from 'lucide-react-native';
import { CompanyLogoAvatar } from '../../../components/common/CompanyLogoAvatar';
import { COLORS } from '../../../constants/theme';

interface CandidateDashboardApplicationsSectionProps {
  appliedJobs: any[];
  formatAppliedDate: (dateStr?: string) => string;
  renderStatusTag: (status?: string) => React.ReactNode;
  navigation: any;
}

export const CandidateDashboardApplicationsSection: React.FC<CandidateDashboardApplicationsSectionProps> = ({
  appliedJobs,
  formatAppliedDate,
  renderStatusTag,
  navigation,
}) => {
  return (
    <>
      <View style={styles.sectionHeaderRow}>
        <Text style={styles.sectionTitleText}>Recent Applications</Text>
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => navigation.navigate('CandidateAppliedTab')}
        >
          <Text style={styles.viewAllText}>View All ({appliedJobs.length}) →</Text>
        </TouchableOpacity>
      </View>

      {appliedJobs.length === 0 ? (
        <View style={styles.emptyApplicationsBox}>
          <Building2 size={26} color="#94A3B8" />
          <Text style={styles.emptyTitleText}>No Applications Submitted</Text>
          <Text style={styles.emptyDescText}>Browse verified MIDC industrial vacancies & apply with 1-click.</Text>
          <TouchableOpacity
            activeOpacity={0.85}
            style={styles.exploreVacanciesBtn}
            onPress={() => navigation.navigate('CandidateJobsTab')}
          >
            <Search size={13} color="#FFFFFF" />
            <Text style={styles.exploreVacanciesBtnText}>Explore Vacancies</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={{ marginTop: 4 }}>
          {appliedJobs.slice(0, 4).map((item, index) => {
            const job = item.job || item;
            const appliedDate = formatAppliedDate(item.appliedAt || item.applied_at || item.createdAt);
            return (
              <TouchableOpacity
                key={item.jobId || job.id || index}
                activeOpacity={0.85}
                style={styles.applicationRow}
                onPress={() => navigation.navigate('CandidateAppliedTab')}
              >
                <CompanyLogoAvatar
                  logoUrl={job.companyLogo || (job as any).company_logo || (job as any).logoUrl}
                  companyName={job.company || 'Industrial Company'}
                  size={38}
                  borderRadius={4}
                />
                <View style={{ flex: 1 }}>
                  <Text style={styles.rowJobTitle} numberOfLines={1}>
                    {job.title || 'Industrial Position'}
                  </Text>
                  <Text style={styles.rowCompanySub} numberOfLines={1}>
                    {job.company || 'Manufacturing Partner'} • {job.location || 'MIDC Zone'}
                  </Text>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 3 }}>
                    <Clock size={11} color="#94A3B8" />
                    <Text style={styles.appliedDateText}>{appliedDate}</Text>
                  </View>
                </View>
                <View style={{ alignItems: 'flex-end', justifyContent: 'center' }}>
                  {renderStatusTag(item.status)}
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
      )}
    </>
  );
};

const styles = StyleSheet.create({
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  sectionTitleText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
  },
  viewAllText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.primary,
  },
  emptyApplicationsBox: {
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 20,
    alignItems: 'center',
    marginVertical: 4,
  },
  emptyTitleText: {
    fontSize: 13.5,
    fontWeight: '800',
    color: '#0F172A',
    marginTop: 8,
  },
  emptyDescText: {
    fontSize: 11.5,
    color: '#64748B',
    textAlign: 'center',
    marginTop: 2,
  },
  exploreVacanciesBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: COLORS.primary,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 6,
    marginTop: 10,
  },
  exploreVacanciesBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  applicationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 10,
    marginBottom: 8,
  },
  rowJobTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0F172A',
  },
  rowCompanySub: {
    fontSize: 11.5,
    color: '#64748B',
    marginTop: 1,
  },
  appliedDateText: {
    fontSize: 10.5,
    color: '#94A3B8',
  },
});
