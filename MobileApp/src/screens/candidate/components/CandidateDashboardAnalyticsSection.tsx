import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { BarChart2, TrendingUp } from 'lucide-react-native';
import { COLORS } from '../../../constants/theme';

interface WeeklyGraphItem {
  day: string;
  count: number;
  height: number;
  active: boolean;
}

interface CandidateDashboardAnalyticsSectionProps {
  weeklyGraphData: WeeklyGraphItem[];
  appliedCount: number;
  savedCount: number;
  shortlistedCount: number;
  skillsCount: number;
  navigation: any;
}

export const CandidateDashboardAnalyticsSection: React.FC<CandidateDashboardAnalyticsSectionProps> = ({
  weeklyGraphData,
  appliedCount,
  savedCount,
  shortlistedCount,
  skillsCount,
  navigation,
}) => {
  return (
    <>
      <View style={styles.chartHeaderRow}>
        <View style={{ flex: 1 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <BarChart2 size={16} color={COLORS.primary} />
            <Text style={styles.chartTitleText}>Application Velocity & Activity</Text>
          </View>
          <Text style={styles.chartSubText}>Real application distribution by day of week</Text>
        </View>

        <View style={styles.trendBadge}>
          <TrendingUp size={12} color="#16A34A" />
          <Text style={styles.trendBadgeText}>Live Data</Text>
        </View>
      </View>

      {/* REAL BAR GRAPH VISUALIZATION */}
      <View style={styles.graphBox}>
        <View style={styles.graphBarsRow}>
          {weeklyGraphData.map((item, idx) => (
            <View key={idx} style={styles.graphColumn}>
              <Text style={styles.graphBarValueText}>{item.count}</Text>
              <View style={styles.graphBarTrack}>
                <View
                  style={[
                    styles.graphBarFill,
                    { height: `${item.height}%` },
                    item.active && styles.graphBarFillActive,
                  ]}
                />
              </View>
              <Text style={[styles.graphDayText, item.active && styles.graphDayTextActive]}>
                {item.day}
              </Text>
            </View>
          ))}
        </View>
        <View style={styles.graphBaselineAxis} />
      </View>

      {/* REAL KPI METRICS ROW BELOW CHART */}
      <View style={styles.kpiRow}>
        <TouchableOpacity
          activeOpacity={0.8}
          style={styles.kpiItem}
          onPress={() => navigation.navigate('CandidateAppliedTab')}
        >
          <Text style={styles.kpiValueText}>{appliedCount}</Text>
          <Text style={styles.kpiLabelText}>Applied</Text>
        </TouchableOpacity>

        <View style={styles.kpiDivider} />

        <TouchableOpacity
          activeOpacity={0.8}
          style={styles.kpiItem}
          onPress={() => navigation.navigate('CandidateSavedJobs')}
        >
          <Text style={styles.kpiValueText}>{savedCount}</Text>
          <Text style={styles.kpiLabelText}>Saved</Text>
        </TouchableOpacity>

        <View style={styles.kpiDivider} />

        <View style={styles.kpiItem}>
          <Text style={styles.kpiValueText}>{shortlistedCount}</Text>
          <Text style={styles.kpiLabelText}>Shortlisted</Text>
        </View>

        <View style={styles.kpiDivider} />

        <TouchableOpacity
          activeOpacity={0.8}
          style={styles.kpiItem}
          onPress={() => navigation.navigate('CandidateProfile')}
        >
          <Text style={styles.kpiValueText}>{skillsCount}</Text>
          <Text style={styles.kpiLabelText}>Skills</Text>
        </TouchableOpacity>
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  chartHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  chartTitleText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
  },
  chartSubText: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 1,
  },
  trendBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
  },
  trendBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#15803D',
  },
  graphBox: {
    marginVertical: 10,
  },
  graphBarsRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    height: 100,
    paddingHorizontal: 4,
  },
  graphColumn: {
    flex: 1,
    alignItems: 'center',
    height: '100%',
    justifyContent: 'flex-end',
  },
  graphBarValueText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#64748B',
    marginBottom: 4,
  },
  graphBarTrack: {
    width: 14,
    height: 70,
    backgroundColor: '#F1F5F9',
    borderRadius: 4,
    justifyContent: 'flex-end',
    overflow: 'hidden',
  },
  graphBarFill: {
    width: '100%',
    backgroundColor: '#94A3B8',
    borderRadius: 4,
  },
  graphBarFillActive: {
    backgroundColor: COLORS.primary,
  },
  graphDayText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#64748B',
    marginTop: 6,
  },
  graphDayTextActive: {
    color: COLORS.primary,
    fontWeight: '800',
  },
  graphBaselineAxis: {
    height: 1,
    backgroundColor: '#E2E8F0',
    marginTop: 2,
  },
  kpiRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingVertical: 10,
    paddingHorizontal: 8,
    marginTop: 10,
  },
  kpiItem: {
    flex: 1,
    alignItems: 'center',
  },
  kpiValueText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
  },
  kpiLabelText: {
    fontSize: 10.5,
    fontWeight: '600',
    color: '#64748B',
    marginTop: 1,
  },
  kpiDivider: {
    width: 1,
    height: 20,
    backgroundColor: '#CBD5E1',
  },
});
