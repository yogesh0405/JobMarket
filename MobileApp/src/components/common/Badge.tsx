import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import {
  CheckCircle2,
  Clock,
  XCircle,
  Calendar,
  UserCheck,
  FileText,
  Tag,
} from 'lucide-react-native';
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
          Icon: CheckCircle2,
        };
      case 'PENDING_APPROVAL':
      case 'PENDING_REVIEW':
      case 'UNDER_APPROVAL':
      case 'IN_REVIEW':
      case 'SUBMITTED':
      case 'DRAFT':
      case 'PENDING':
        return {
          bg: COLORS.warningBg,
          text: COLORS.warning,
          label: normStatus === 'PENDING_APPROVAL' ? 'Pending Approval' : normStatus === 'PENDING_REVIEW' ? 'Pending Review' : normStatus === 'DRAFT' ? 'Draft' : 'Pending Approval',
          Icon: Clock,
        };
      case 'APPLIED':
        return {
          bg: COLORS.infoBg,
          text: COLORS.info,
          label: 'Applied',
          Icon: FileText,
        };
      case 'SHORTLISTED':
        return {
          bg: COLORS.infoBg,
          text: COLORS.info,
          label: 'Shortlisted',
          Icon: UserCheck,
        };
      case 'INTERVIEWED':
        return {
          bg: COLORS.infoBg,
          text: COLORS.info,
          label: 'Interview Scheduled',
          Icon: Calendar,
        };
      case 'REJECTED':
      case 'CLOSED':
        return {
          bg: COLORS.dangerBg,
          text: COLORS.danger,
          label: normStatus === 'REJECTED' ? 'Rejected' : 'Closed',
          Icon: XCircle,
        };
      default:
        return {
          bg: COLORS.slate100,
          text: COLORS.slate700,
          label: status,
          Icon: Tag,
        };
    }
  };

  const config = getStyle();
  const IconComponent = config.Icon;

  return (
    <View style={[styles.badge, style]}>
      <IconComponent size={12} color={config.text} />
      <Text style={[styles.text, { color: config.text }]}>{config.label}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'transparent',
    paddingHorizontal: 0,
    paddingVertical: 0,
    alignSelf: 'flex-start',
  },
  text: {
    ...TYPOGRAPHY.caption,
    fontWeight: '700',
    fontSize: 11,
  },
});
