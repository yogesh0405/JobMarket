import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, TextInputProps, ViewStyle } from 'react-native';
import { Eye, EyeOff, XCircle } from 'lucide-react-native';
import { COLORS, TYPOGRAPHY, SPACING, RADIUS } from '../../constants/theme';

interface InputProps extends TextInputProps {
  label?: string;
  required?: boolean;
  error?: string;
  leftIcon?: React.ReactNode;
  isPassword?: boolean;
  allowClear?: boolean;
  onClear?: () => void;
  containerStyle?: ViewStyle;
}

export const Input: React.FC<InputProps> = ({
  label,
  required = false,
  error,
  leftIcon,
  isPassword = false,
  allowClear = false,
  onClear,
  value,
  containerStyle,
  style,
  ...props
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [secureText, setSecureText] = useState(isPassword);

  return (
    <View style={[styles.wrapper, containerStyle]}>
      {label ? (
        <View style={styles.labelContainer}>
          <Text style={styles.label}>{label}</Text>
          {required && <Text style={styles.required}> *</Text>}
        </View>
      ) : null}

      <View
        style={[
          styles.inputContainer,
          isFocused && styles.inputFocused,
          !!error && styles.inputError,
        ]}
      >
        {leftIcon ? <View style={styles.iconLeft}>{leftIcon}</View> : null}

        <TextInput
          style={[styles.input, style]}
          placeholderTextColor={COLORS.textMuted}
          secureTextEntry={secureText}
          value={value}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          {...props}
        />

        {allowClear && !!value && onClear ? (
          <TouchableOpacity onPress={onClear} style={styles.iconRight}>
            <XCircle size={18} color={COLORS.slate400} />
          </TouchableOpacity>
        ) : null}

        {isPassword ? (
          <TouchableOpacity onPress={() => setSecureText(!secureText)} style={styles.iconRight}>
            {secureText ? (
              <EyeOff size={18} color={COLORS.slate400} />
            ) : (
              <Eye size={18} color={COLORS.slate400} />
            )}
          </TouchableOpacity>
        ) : null}
      </View>

      {error ? <Text style={styles.errorText}>{error}</Text> : null}
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: SPACING.md,
  },
  labelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  label: {
    fontSize: 13.5,
    fontWeight: '700',
    color: '#334155',
  },
  required: {
    color: COLORS.danger,
    fontWeight: '700',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.md,
    paddingHorizontal: SPACING.md,
    minHeight: 46,
  },
  inputFocused: {
    borderColor: COLORS.borderFocus,
  },
  inputError: {
    borderColor: COLORS.danger,
  },
  input: {
    flex: 1,
    ...TYPOGRAPHY.body,
    color: COLORS.textPrimary,
    paddingVertical: SPACING.sm,
  },
  iconLeft: {
    marginRight: SPACING.sm,
  },
  iconRight: {
    marginLeft: SPACING.sm,
    padding: SPACING.xs,
  },
  errorText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.danger,
    marginTop: 4,
  },
});
