import React, { useState, forwardRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, TextInputProps, ViewStyle } from 'react-native';
import { Eye, EyeOff, XCircle } from 'lucide-react-native';
import { COLORS, TYPOGRAPHY, SPACING } from '../../constants/theme';

export interface InputProps extends TextInputProps {
  label?: string;
  required?: boolean;
  error?: string;
  leftIcon?: React.ReactNode;
  isPassword?: boolean;
  allowClear?: boolean;
  onClear?: () => void;
  containerStyle?: ViewStyle;
  inputContainerStyle?: ViewStyle;
}

export const Input = forwardRef<TextInput, InputProps>(({
  label,
  required = false,
  error,
  leftIcon,
  isPassword = false,
  allowClear = false,
  onClear,
  value,
  containerStyle,
  inputContainerStyle,
  style,
  onFocus,
  onBlur,
  ...props
}, ref) => {
  const [isFocused, setIsFocused] = useState(false);
  const [secureText, setSecureText] = useState(isPassword);

  return (
    <View style={[styles.wrapper, containerStyle]}>
      {label ? (
        <View style={styles.labelContainer}>
          <Text style={styles.label}>{label.endsWith('*') ? label.slice(0, -1).trim() : label}</Text>
          {(required || label.endsWith('*')) && <Text style={styles.required}> *</Text>}
        </View>
      ) : null}

      <View
        style={[
          styles.inputContainer,
          inputContainerStyle,
          isFocused && styles.inputFocused,
          !!error && styles.inputError,
        ]}
      >
        {leftIcon ? <View style={styles.iconLeft}>{leftIcon}</View> : null}

        <TextInput
          ref={ref}
          style={[styles.input, style]}
          placeholderTextColor={COLORS.textMuted}
          secureTextEntry={secureText}
          value={value}
          onFocus={(e) => {
            setIsFocused(true);
            if (onFocus) onFocus(e);
          }}
          onBlur={(e) => {
            setIsFocused(false);
            if (onBlur) onBlur(e);
          }}
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
});

Input.displayName = 'Input';

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: 16,
  },
  labelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  label: {
    fontSize: 13.5,
    fontWeight: '700',
    color: '#0F172A',
  },
  required: {
    color: COLORS.danger,
    fontWeight: '700',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 8,
    paddingHorizontal: 14,
    height: 48,
    minHeight: 48,
  },
  inputFocused: {
    borderColor: COLORS.primary,
    borderWidth: 2,
  },
  inputError: {
    borderColor: COLORS.danger,
  },
  input: {
    flex: 1,
    fontSize: 13.5,
    color: '#0F172A',
    paddingVertical: 0,
  },
  iconLeft: {
    marginRight: 10,
  },
  iconRight: {
    marginLeft: 10,
    padding: SPACING.xs,
  },
  errorText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.danger,
    marginTop: 4,
  },
});
