import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { AlertCircle } from 'lucide-react-native';
import { Button } from './Button';
import { COLORS, TYPOGRAPHY, SPACING, RADIUS } from '../../constants/theme';

interface ErrorBannerProps {
  message: string;
  onRetry?: () => void;
  style?: ViewStyle;
}

export const ErrorBanner: React.FC<ErrorBannerProps> = ({ message, onRetry, style }) => {
  return (
    <View style={[styles.container, style]}>
      <AlertCircle size={20} color={COLORS.danger} style={styles.icon} />
      <Text style={styles.message}>{message}</Text>
      {onRetry ? (
        <Button
          title="Retry"
          onPress={onRetry}
          variant="outline"
          size="sm"
          style={styles.retryButton}
          textStyle={{ fontSize: 12, color: COLORS.danger }}
        />
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.dangerBg,
    borderWidth: 1,
    borderColor: '#FCA5A5',
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.md,
  },
  icon: {
    marginRight: SPACING.sm,
  },
  message: {
    flex: 1,
    ...TYPOGRAPHY.body,
    fontSize: 13,
    color: COLORS.danger,
  },
  retryButton: {
    marginLeft: SPACING.sm,
    paddingVertical: 4,
    paddingHorizontal: SPACING.sm,
    borderColor: COLORS.danger,
  },
});
