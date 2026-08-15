import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import {
  Briefcase,
  Zap,
  Users,
  CheckCircle2,
} from 'lucide-react-native';
import { COLORS } from '../../../constants/theme';

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

      <View style={styles.metricsGrid2x2}>
        <View style={styles.metricCardItem}>
          <View style={styles.metricHeaderRow}>
            <Text style={styles.metricLabelText}>Total Job Posts</Text>
            <View style={[styles.metricIconBadge, { backgroundColor: '#EFF6FF' }]}>
              <Briefcase size={16} color={COLORS.primary} />
            </View>
          </View>
          <Text style={styles.metricValueText}>{analyticsData.totalJobs}</Text>
          <Text style={styles.metricSubText}>{analyticsData.activeJobs} Currently Active</Text>
        </View>

        <View style={styles.metricCardItem}>
          <View style={styles.metricHeaderRow}>
            <Text style={styles.metricLabelText}>Total Applicants</Text>
            <View style={[styles.metricIconBadge, { backgroundColor: '#F0FDF4' }]}>
              <Users size={16} color="#16A34A" />
            </View>
          </View>
          <Text style={styles.metricValueText}>{analyticsData.totalApplications}</Text>
          <Text style={styles.metricSubText}>{analyticsData.shortlisted} Shortlisted</Text>
        </View>

        <View style={styles.metricCardItem}>
          <View style={styles.metricHeaderRow}>
            <Text style={styles.metricLabelText}>Interviews Held</Text>
            <View style={[styles.metricIconBadge, { backgroundColor: '#FEF3C7' }]}>
              <Zap size={16} color="#D97706" />
            </View>
          </View>
          <Text style={styles.metricValueText}>{analyticsData.interviewed}</Text>
          <Text style={styles.metricSubText}>Walk-in & Video Drives</Text>
        </View>

        <View style={styles.metricCardItem}>
          <View style={styles.metricHeaderRow}>
            <Text style={styles.metricLabelText}>Successful Hires</Text>
            <View style={[styles.metricIconBadge, { backgroundColor: '#F3E8FF' }]}>
              <CheckCircle2 size={16} color="#9333EA" />
            </View>
          </View>
          <Text style={styles.metricValueText}>{analyticsData.hired}</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  tabContainer: {
    gap: 12,
  },
  sectionHeadingTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: '#94A3B8',
    letterSpacing: 0.8,
    marginTop: 4,
  },
  metricsGrid2x2: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  metricCardItem: {
    width: '48%',
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 14,
  },
  metricHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  metricLabelText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#64748B',
  },
  metricIconBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  metricValueText: {
    fontSize: 22,
    fontWeight: '800',
    color: '#0F172A',
    marginTop: 8,
  },
  metricSubText: {
    fontSize: 10.5,
    color: '#64748B',
    marginTop: 2,
  },
});
