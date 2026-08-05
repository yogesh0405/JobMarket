import React from 'react';
import { TouchableOpacity, Text, ActivityIndicator, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import * as Haptics from 'expo-haptics';
import { COLORS, TYPOGRAPHY, SPACING, RADIUS } from '../../constants/theme';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  disabled?: boolean;
  icon?: React.ReactNode;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  icon,
  style,
  textStyle,
}) => {
  const handlePress = () => {
    if (disabled || loading) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress();
  };

  const getContainerStyle = (): ViewStyle => {
    const base: ViewStyle = styles.base;

    let sizeStyle: ViewStyle = {};
    if (size === 'sm') sizeStyle = styles.sizeSm;
    else if (size === 'lg') sizeStyle = styles.sizeLg;
    else sizeStyle = styles.sizeMd;

    let variantStyle: ViewStyle = {};
    if (variant === 'secondary') variantStyle = styles.secondary;
    else if (variant === 'outline') variantStyle = styles.outline;
    else if (variant === 'danger') variantStyle = styles.danger;
    else if (variant === 'ghost') variantStyle = styles.ghost;
    else variantStyle = styles.primary;

    const stateStyle: ViewStyle = (disabled || loading) ? styles.disabled : {};

    return { ...base, ...sizeStyle, ...variantStyle, ...stateStyle, ...style };
  };

  const getTextStyle = (): TextStyle => {
    let color = COLORS.textWhite;
    if (variant === 'secondary') color = COLORS.slate900;
    else if (variant === 'outline') color = COLORS.primary;
    else if (variant === 'ghost') color = COLORS.slate700;

    return {
      ...TYPOGRAPHY.button,
      color,
      ...textStyle,
    };
  };

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={handlePress}
      disabled={disabled || loading}
      style={getContainerStyle()}
    >
      {loading ? (
        <ActivityIndicator color={variant === 'outline' || variant === 'ghost' ? COLORS.primary : COLORS.textWhite} />
      ) : (
        <>
          {icon}
          <Text style={[getTextStyle(), icon ? { marginLeft: SPACING.sm } : null]}>{title}</Text>
        </>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: RADIUS.md,
  },
  sizeSm: {
    paddingVertical: SPACING.xs,
    paddingHorizontal: SPACING.md,
  },
  sizeMd: {
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
  },
  sizeLg: {
    paddingVertical: SPACING.lg,
    paddingHorizontal: SPACING.xxl,
  },
  primary: {
    backgroundColor: COLORS.primary,
  },
  secondary: {
    backgroundColor: COLORS.slate100,
  },
  outline: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  danger: {
    backgroundColor: COLORS.danger,
  },
  ghost: {
    backgroundColor: 'transparent',
  },
  disabled: {
    opacity: 0.5,
  },
});
