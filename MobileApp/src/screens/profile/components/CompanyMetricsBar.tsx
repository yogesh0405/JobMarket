import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface CompanyMetricsBarProps {
  jobsCount: number;
  midcZone?: string;
  isVerified?: boolean;
  completionPct?: number;
  isOwner?: boolean;
}

export const CompanyMetricsBar: React.FC<CompanyMetricsBarProps> = ({
  jobsCount,
  midcZone,
  completionPct = 85,
  isOwner = true,
}) => {
  const shortMidc = midcZone
    ? midcZone.replace(/\s*\([^)]*\)/g, '').trim()
    : 'Waluj MIDC';

  return (
    <View style={styles.metricsBarContainer}>
      {/* 1. Jobs Posted */}
      <View style={styles.statCol}>
        <Text style={styles.statValText}>{jobsCount || 0}</Text>
        <Text style={styles.statLabelText}>Jobs Posted</Text>
      </View>

      {/* Soft Vertical Divider */}
      <View style={styles.colDivider} />

      {/* 2. Profile Completion Score (Percentage Only) */}
      <View style={styles.statCol}>
        <Text style={styles.statValText}>{completionPct}%</Text>
        <Text style={styles.statLabelText}>Profile Score</Text>
      </View>

      {/* Soft Vertical Divider */}
      <View style={styles.colDivider} />

      {/* 3. Industrial Location / MIDC Zone */}
      <View style={styles.locationCol}>
        <Text style={styles.statValText} numberOfLines={1} ellipsizeMode="tail">
          {shortMidc}
        </Text>
        <Text style={styles.statLabelText}>Location / MIDC Zone</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  metricsBarContainer: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 0,
    paddingVertical: 12,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  },
  statCol: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 10,
  },
  colDivider: {
    width: 1,
    height: 28,
    backgroundColor: '#F1F5F9',
  },
  locationCol: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingLeft: 8,
  },
  statValText: {
    fontSize: 15.5,
    fontWeight: '800',
    color: '#2563EB',
    textAlign: 'center',
  },
  statLabelText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748B',
    marginTop: 2,
    textAlign: 'center',
  },
});
