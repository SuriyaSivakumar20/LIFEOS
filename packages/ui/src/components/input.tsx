import React from 'react';
import {
  View,
  TextInput,
  Text,
  StyleSheet,
  type TextInputProps,
  type ViewStyle,
  type TextStyle,
  type StyleProp,
} from 'react-native';
import { useTheme } from '../theme-context';

export interface InputProps extends Omit<TextInputProps, 'style'> {
  label?: string;
  error?: string | null;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  containerStyle?: StyleProp<ViewStyle>;
  inputStyle?: StyleProp<TextStyle>;
}

export function Input({
  label,
  error,
  helperText,
  leftIcon,
  rightIcon,
  containerStyle,
  inputStyle,
  placeholderTextColor,
  ...rest
}: InputProps) {
  const { colors, radii, spacing, typography } = useTheme();

  return (
    <View style={[styles.wrapper, containerStyle]}>
      {label && (
        <Text
          style={[
            styles.label,
            {
              color: colors.textSecondary,
              fontSize: typography.fontSize.small,
              fontWeight: typography.fontWeight.medium,
              marginBottom: spacing.xs,
            },
          ]}
        >
          {label}
        </Text>
      )}

      <View
        style={[
          styles.inputContainer,
          {
            backgroundColor: colors.backgroundElevated,
            borderColor: error ? colors.error : colors.border,
            borderRadius: radii.md,
            paddingHorizontal: spacing.md,
          },
        ]}
      >
        {leftIcon && <View style={[styles.iconWrapper, { marginRight: spacing.sm }]}>{leftIcon}</View>}

        <TextInput
          placeholderTextColor={placeholderTextColor || colors.textMuted}
          style={[
            styles.input,
            {
              color: colors.textPrimary,
              fontSize: typography.fontSize.body,
              paddingVertical: spacing.md,
            },
            inputStyle,
          ]}
          {...rest}
        />

        {rightIcon && <View style={[styles.iconWrapper, { marginLeft: spacing.sm }]}>{rightIcon}</View>}
      </View>

      {error ? (
        <Text
          style={[
            styles.errorText,
            {
              color: colors.error,
              fontSize: typography.fontSize.tiny,
              marginTop: spacing.xxs,
            },
          ]}
        >
          {error}
        </Text>
      ) : helperText ? (
        <Text
          style={[
            styles.helperText,
            {
              color: colors.textMuted,
              fontSize: typography.fontSize.tiny,
              marginTop: spacing.xxs,
            },
          ]}
        >
          {helperText}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    width: '100%',
  },
  label: {},
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    minHeight: 46,
  },
  input: {
    flex: 1,
    padding: 0,
  },
  iconWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorText: {},
  helperText: {},
});
