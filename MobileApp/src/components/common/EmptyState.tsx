import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { FolderOpen } from 'lucide-react-native';
import { Button } from './Button';
import { COLORS, TYPOGRAPHY, SPACING } from '../../constants/theme';

interface EmptyStateProps {
  title: string;
  description?: string;
  icon?: React.ReactNode;
  actionTitle?: string;
  onAction?: () => void;
  style?: ViewStyle;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  icon,
  actionTitle,
  onAction,
  style,
}) => {
  return (
    <View style={[styles.container, style]}>
      <View style={styles.iconContainer}>
        {icon || <FolderOpen size={48} color={COLORS.slate400} />}
      </View>
      <Text style={styles.title}>{title}</Text>
      {description ? <Text style={styles.description}>{description}</Text> : null}
      {actionTitle && onAction ? (
        <Button
          title={actionTitle}
          onPress={onAction}
          variant="primary"
          size="sm"
          style={styles.actionButton}
        />
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.xxl,
  },
  iconContainer: {
    marginBottom: SPACING.md,
    opacity: 0.8,
  },
  title: {
    ...TYPOGRAPHY.h2,
    fontSize: 18,
    textAlign: 'center',
    color: COLORS.slate800,
    marginBottom: SPACING.xs,
  },
  description: {
    ...TYPOGRAPHY.body,
    textAlign: 'center',
    color: COLORS.slate500,
    marginBottom: SPACING.lg,
  },
  actionButton: {
    marginTop: SPACING.sm,
  },
});
