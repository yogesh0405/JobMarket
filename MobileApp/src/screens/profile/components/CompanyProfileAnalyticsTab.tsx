import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { RADIUS } from '../../../constants/theme';
import {
  Briefcase,
  CalendarCheck,
  Users,
  CheckCircle2,
} from 'lucide-react-native';

interface CompanyProfileAnalyticsTabProps {
  analyticsData: {
    totalJobs: number;
    activeJobs: number;
    totalApplications: number;
    shortlisted: number;
    interviewed: number;
    hired: number;
    rejected: number;
    avgResponseTimeHours: number;
  };
}

export const CompanyProfileAnalyticsTab: React.FC<CompanyProfileAnalyticsTabProps> = ({
  analyticsData,
}) => {
  return (
    <View style={styles.tabContainer}>
      <Text style={styles.sectionHeadingTitle}>LIVE RECRUITMENT METRICS</Text>

      <View style={styles.rowsList}>
        {/* Row 1: Total Job Posts */}
        <View style={styles.metricRowCard}>
          <View style={styles.metricIconBadge}>
            <Briefcase size={18} color="#0F172A" />
          </View>
          <View style={styles.metricTextWrap}>
            <Text style={styles.metricLabelText}>Total Job Posts</Text>
            <Text style={styles.metricSubText}>{analyticsData.activeJobs} Currently Active Openings</Text>
          </View>
          <Text style={styles.metricValueText}>{analyticsData.totalJobs}</Text>
        </View>

        {/* Row 2: Total Applicants */}
        <View style={styles.metricRowCard}>
          <View style={styles.metricIconBadge}>
            <Users size={18} color="#0F172A" />
          </View>
          <View style={styles.metricTextWrap}>
            <Text style={styles.metricLabelText}>Total Candidate Applications</Text>
            <Text style={styles.metricSubText}>{analyticsData.shortlisted} Shortlisted Candidates</Text>
          </View>
          <Text style={styles.metricValueText}>{analyticsData.totalApplications}</Text>
        </View>

        {/* Row 3: Interviews Held */}
        <View style={styles.metricRowCard}>
          <View style={styles.metricIconBadge}>
            <CalendarCheck size={18} color="#0F172A" />
          </View>
          <View style={styles.metricTextWrap}>
            <Text style={styles.metricLabelText}>Interviews & Screening Drives</Text>
            <Text style={styles.metricSubText}>Walk-in, Telephonic & Video Drives</Text>
          </View>
          <Text style={styles.metricValueText}>{analyticsData.interviewed}</Text>
        </View>

        {/* Row 4: Successful Hires */}
        <View style={styles.metricRowCard}>
          <View style={styles.metricIconBadge}>
            <CheckCircle2 size={18} color="#0F172A" />
          </View>
          <View style={styles.metricTextWrap}>
            <Text style={styles.metricLabelText}>Successful Plant Hires</Text>
            <Text style={styles.metricSubText}>Onboarded Industrial Workers</Text>
          </View>
          <Text style={styles.metricValueText}>{analyticsData.hired}</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  tabContainer: {
    gap: 10,
    marginBottom: 16,
  },
  sectionHeadingTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: '#64748B',
    letterSpacing: 0.8,
    marginTop: 4,
    marginBottom: 2,
  },
  rowsList: {
    gap: 12,
  },
  metricRowCard: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: RADIUS.card,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  },
  metricIconBadge: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  metricTextWrap: {
    flex: 1,
  },
  metricLabelText: {
    fontSize: 13.5,
    fontWeight: '700',
    color: '#0F172A',
  },
  metricSubText: {
    fontSize: 11.5,
    fontWeight: '500',
    color: '#64748B',
    marginTop: 2,
  },
  metricValueText: {
    fontSize: 17,
    fontWeight: '800',
    color: '#0F172A',
  },
});
