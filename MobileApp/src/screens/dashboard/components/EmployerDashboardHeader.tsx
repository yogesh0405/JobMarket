import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import {
  PlusCircle,
  Briefcase,
  Users,
  CheckCircle2,
  Clock,
  ShieldCheck,
  BarChart3,
  TrendingUp,
} from 'lucide-react-native';
import { CompanyLogoAvatar } from '../../../components/common/CompanyLogoAvatar';
import { COLORS } from '../../../constants/theme';

interface EmployerDashboardHeaderProps {
  companyName: string;
  companyLogo: string;
  totalJobs: number;
  activeJobs: number;
  pendingJobs: number;
  totalApplicants: number;
  loading: boolean;
  analytics: {
    totalApplications: number;
    shortlisted: number;
    interviewed: number;
    hired: number;
  };
  onPostJobPress: () => void;
  onCompanyPress: () => void;
}

export const EmployerDashboardHeader: React.FC<EmployerDashboardHeaderProps> = ({
  companyName,
  companyLogo,
  totalJobs,
  activeJobs,
  pendingJobs,
  totalApplicants,
  loading,
  analytics,
  onPostJobPress,
  onCompanyPress,
}) => {
  const totalApps = analytics.totalApplications || 0;
  const totalAppsSafe = totalApps || 1;
  const shortlistedPct = Math.min(100, Math.round((analytics.shortlisted / totalAppsSafe) * 100));
  const interviewedPct = Math.min(100, Math.round((analytics.interviewed / totalAppsSafe) * 100));
  const hiredPct = Math.min(100, Math.round((analytics.hired / totalAppsSafe) * 100));

  return (
    <>
      <View style={styles.topProfileBarCard}>
        <View style={styles.profileRowHeader}>
          <TouchableOpacity style={styles.companyLeftCol} activeOpacity={0.8} onPress={onCompanyPress}>
            <CompanyLogoAvatar logoUrl={companyLogo} companyName={companyName} size={42} borderRadius={6} />
            <View style={{ flex: 1, minWidth: 0 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <Text style={styles.companyTitleText} numberOfLines={1}>
                  {companyName}
                </Text>
                <View style={styles.verifiedPill}>
                  <ShieldCheck size={11} color="#16A34A" />
                </View>
              </View>
              <Text style={styles.companySubtitleText}>
                {totalJobs} Active Jobs • {totalApplicants} Candidates
              </Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity style={styles.compactPostBtn} activeOpacity={0.8} onPress={onPostJobPress}>
            <PlusCircle size={14} color="#FFFFFF" />
            <Text style={styles.compactPostBtnText}>Post Job</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.metricsRow}>
        <View style={styles.metricCard}>
          <View style={styles.metricHeaderRow}>
            <Text style={styles.metricLabelText}>Total Jobs</Text>
            <View style={[styles.miniIconSquircle, { backgroundColor: '#EFF6FF' }]}>
              <Briefcase size={14} color={COLORS.primary} />
            </View>
          </View>
          <Text style={styles.metricValueText}>{loading ? '-' : totalJobs}</Text>
        </View>

        <View style={styles.metricCard}>
          <View style={styles.metricHeaderRow}>
            <Text style={styles.metricLabelText}>Approved Active</Text>
            <View style={[styles.miniIconSquircle, { backgroundColor: '#F0FDF4' }]}>
              <CheckCircle2 size={14} color="#16A34A" />
            </View>
          </View>
          <Text style={styles.metricValueText}>{loading ? '-' : activeJobs}</Text>
        </View>
      </View>

      <View style={styles.metricsRow}>
        <View style={styles.metricCard}>
          <View style={styles.metricHeaderRow}>
            <Text style={styles.metricLabelText}>Pending Review</Text>
            <View style={[styles.miniIconSquircle, { backgroundColor: '#FFFBEB' }]}>
              <Clock size={14} color="#D97706" />
            </View>
          </View>
          <Text style={styles.metricValueText}>{loading ? '-' : pendingJobs}</Text>
        </View>

        <View style={styles.metricCard}>
          <View style={styles.metricHeaderRow}>
            <Text style={styles.metricLabelText}>Candidates</Text>
            <View style={[styles.miniIconSquircle, { backgroundColor: '#F0F9FF' }]}>
              <Users size={14} color="#0284C7" />
            </View>
          </View>
          <Text style={styles.metricValueText}>{loading ? '-' : totalApplicants}</Text>
        </View>
      </View>

      <View style={styles.analyticsCard}>
        <View style={styles.cardHeaderRow}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <BarChart3 size={16} color={COLORS.primary} />
            <Text style={styles.cardSectionTitle}>Jobs & Candidate Analytics</Text>
          </View>
          <View style={styles.liveMetricsBadge}>
            <TrendingUp size={10} color="#15803D" />
            <Text style={styles.liveMetricsText}>Real-Time</Text>
          </View>
        </View>

        <View style={styles.funnelItem}>
          <View style={styles.funnelLabelRow}>
            <Text style={styles.funnelTitle}>1. Total Applications Received</Text>
            <Text style={styles.funnelVal}>{totalApps} (100%)</Text>
          </View>
          <View style={styles.progressBg}>
            <View style={[styles.progressFill, { width: totalApps > 0 ? '100%' : '0%', backgroundColor: COLORS.primary }]} />
          </View>
        </View>

        <View style={styles.funnelItem}>
          <View style={styles.funnelLabelRow}>
            <Text style={styles.funnelTitle}>2. Shortlisted Candidates</Text>
            <Text style={styles.funnelVal}>{analytics.shortlisted} ({totalApps > 0 ? shortlistedPct : 0}%)</Text>
          </View>
          <View style={styles.progressBg}>
            <View style={[styles.progressFill, { width: `${totalApps > 0 ? shortlistedPct : 0}%`, backgroundColor: '#0284C7' }]} />
          </View>
        </View>

        <View style={styles.funnelItem}>
          <View style={styles.funnelLabelRow}>
            <Text style={styles.funnelTitle}>3. Interview Scheduled</Text>
            <Text style={styles.funnelVal}>{analytics.interviewed} ({totalApps > 0 ? interviewedPct : 0}%)</Text>
          </View>
          <View style={styles.progressBg}>
            <View style={[styles.progressFill, { width: `${totalApps > 0 ? interviewedPct : 0}%`, backgroundColor: '#D97706' }]} />
          </View>
        </View>

        <View style={styles.funnelItem}>
          <View style={styles.funnelLabelRow}>
            <Text style={styles.funnelTitle}>4. Hired / Offered</Text>
            <Text style={styles.funnelVal}>{analytics.hired} ({totalApps > 0 ? hiredPct : 0}%)</Text>
          </View>
          <View style={styles.progressBg}>
            <View style={[styles.progressFill, { width: `${totalApps > 0 ? hiredPct : 0}%`, backgroundColor: '#16A34A' }]} />
          </View>
        </View>
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  topProfileBarCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    padding: 12,
    marginBottom: 12,
  },
  profileRowHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  companyLeftCol: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  companyTitleText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
  },
  verifiedPill: {
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 4,
  },
  companySubtitleText: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 1,
  },
  compactPostBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: COLORS.primary,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
  },
  compactPostBtnText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  metricsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 8,
  },
  metricCard: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    padding: 10,
  },
  metricHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  metricLabelText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#64748B',
  },
  miniIconSquircle: {
    width: 24,
    height: 24,
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  metricValueText: {
    fontSize: 18,
    fontWeight: '900',
    color: '#0F172A',
  },
  analyticsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    padding: 12,
    marginTop: 4,
    marginBottom: 12,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  cardSectionTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0F172A',
  },
  liveMetricsBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  liveMetricsText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#15803D',
  },
  funnelItem: {
    marginBottom: 10,
  },
  funnelLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 3,
  },
  funnelTitle: {
    fontSize: 11.5,
    fontWeight: '600',
    color: '#334155',
  },
  funnelVal: {
    fontSize: 11.5,
    fontWeight: '800',
    color: '#0F172A',
  },
  progressBg: {
    height: 6,
    backgroundColor: '#F1F5F9',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
});
