import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { COLORS, TYPOGRAPHY, SPACING, RADIUS } from '../../constants/theme';

interface BadgeProps {
  status: string;
  style?: ViewStyle;
}

export const Badge: React.FC<BadgeProps> = ({ status, style }) => {
  const normStatus = (status || '').toUpperCase();

  const getStyle = () => {
    switch (normStatus) {
      case 'APPROVED':
      case 'ACTIVE':
      case 'HIRED':
        return {
          bg: COLORS.successBg,
          text: COLORS.success,
          label: normStatus === 'APPROVED' ? 'Approved' : normStatus === 'ACTIVE' ? 'Active' : 'Hired',
        };
      case 'PENDING_REVIEW':
      case 'PENDING':
      case 'APPLIED':
        return {
          bg: COLORS.warningBg,
          text: COLORS.warning,
          label: normStatus === 'PENDING_REVIEW' ? 'Pending Review' : normStatus === 'PENDING' ? 'Pending' : 'Applied',
        };
      case 'REJECTED':
      case 'CLOSED':
        return {
          bg: COLORS.dangerBg,
          text: COLORS.danger,
          label: normStatus === 'REJECTED' ? 'Rejected' : 'Closed',
        };
      case 'SHORTLISTED':
      case 'INTERVIEWED':
        return {
          bg: COLORS.infoBg,
          text: COLORS.info,
          label: normStatus === 'SHORTLISTED' ? 'Shortlisted' : 'Interview Scheduled',
        };
      default:
        return {
          bg: COLORS.slate100,
          text: COLORS.slate700,
          label: status,
        };
    }
  };

  const config = getStyle();

  return (
    <View style={[styles.badge, { backgroundColor: config.bg }, style]}>
      <Text style={[styles.text, { color: config.text }]}>{config.label}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
    borderRadius: RADIUS.full,
    alignSelf: 'flex-start',
  },
  text: {
    ...TYPOGRAPHY.caption,
    fontWeight: '600',
    fontSize: 11,
  },
});
