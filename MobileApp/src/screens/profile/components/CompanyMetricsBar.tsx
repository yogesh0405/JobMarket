import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Briefcase, Star, Plus } from 'lucide-react-native';
import { RADIUS } from '../../../constants/theme';

interface CompanyMetricsBarProps {
  jobsCount: number;
  midcZone?: string;
  isVerified?: boolean;
  completionPct?: number;
  isOwner?: boolean;
  onPostJobPress?: () => void;
}

export const CompanyMetricsBar: React.FC<CompanyMetricsBarProps> = ({
  jobsCount,
  completionPct = 75,
  onPostJobPress,
}) => {
  return (
    <View style={styles.metricsBarContainer}>
      {/* 1. Jobs Posted */}
      <View style={styles.statCol}>
        <View style={[styles.iconSquare, { backgroundColor: '#EFF5FF' }]}>
          <Briefcase size={15} color="#1764E8" strokeWidth={2} />
        </View>
        <View style={styles.textWrap}>
          <Text style={styles.statValText}>{jobsCount || 2}</Text>
          <Text style={styles.statLabelText}>Jobs Posted</Text>
        </View>
      </View>

      {/* Vertical Divider */}
      <View style={styles.colDivider} />

      {/* 2. Profile Score */}
      <View style={styles.statCol}>
        <View style={[styles.iconSquare, { backgroundColor: '#ECF9F6' }]}>
          <Star size={15} color="#21A99B" strokeWidth={2} />
        </View>
        <View style={styles.textWrap}>
          <Text style={styles.statValText}>{completionPct}%</Text>
          <Text style={styles.statLabelText}>Profile Score</Text>
        </View>
      </View>

      {/* Vertical Divider */}
      <View style={styles.colDivider} />

      {/* 3. Post a Job Button (Styled matching the metric tab theme) */}
      <TouchableOpacity
        activeOpacity={0.7}
        onPress={onPostJobPress}
        style={[styles.statCol, styles.postJobBtnCol]}
      >
        <View style={[styles.iconSquare, { backgroundColor: '#EEF4FF' }]}>
          <Plus size={16} color="#1764E8" strokeWidth={2.4} />
        </View>
        <View style={styles.textWrap}>
          <Text style={[styles.statValText, { color: '#1764E8' }]}>Post Job</Text>
          <Text style={styles.statLabelText}>New Vacancy</Text>
        </View>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  metricsBarContainer: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E7EBF2',
    borderRadius: RADIUS.card,
    paddingVertical: 10,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: -32,
    marginHorizontal: 16,
    marginBottom: 16,
    zIndex: 20,
    elevation: 3,
    shadowColor: '#142A50',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
  },
  statCol: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 2,
  },
  postJobBtnCol: {
    borderRadius: 8,
  },
  iconSquare: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  textWrap: {
    flex: 1,
    justifyContent: 'center',
  },
  colDivider: {
    width: 1,
    height: 24,
    backgroundColor: '#E3E8F0',
    marginHorizontal: 2,
  },
  statValText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#102A5C',
  },
  statLabelText: {
    fontSize: 9.5,
    fontWeight: '500',
    color: '#657796',
    marginTop: 0.5,
  },
});
