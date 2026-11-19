import React from 'react';
import {
  Pressable,
  Text,
  ActivityIndicator,
  StyleSheet,
  type ViewStyle,
  type TextStyle,
  type StyleProp,
} from 'react-native';
import { useTheme } from '../theme-context';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  disabled?: boolean;
  loading?: boolean;
  icon?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
  accessibilityLabel?: string;
}

export function Button({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  icon,
  style,
  textStyle,
  accessibilityLabel,
}: ButtonProps) {
  const { colors, radii, spacing, typography } = useTheme();

  const getContainerStyle = (pressed: boolean): ViewStyle => {
    let backgroundColor = 'transparent';
    let borderColor = 'transparent';
    let borderWidth = 0;

    switch (variant) {
      case 'primary':
        backgroundColor = pressed ? colors.accentHover : colors.accentPrimary;
        break;
      case 'secondary':
        backgroundColor = pressed ? colors.backgroundElevated : colors.backgroundSecondary;
        borderColor = colors.border;
        borderWidth = 1;
        break;
      case 'ghost':
        backgroundColor = pressed ? colors.accentMuted : 'transparent';
        break;
      case 'danger':
        backgroundColor = pressed ? colors.errorMuted : colors.error;
        break;
    }

    let paddingVertical = spacing.md;
    let paddingHorizontal = spacing.lg;

    if (size === 'sm') {
      paddingVertical = spacing.xs + 2;
      paddingHorizontal = spacing.md;
    } else if (size === 'lg') {
      paddingVertical = spacing.lg;
      paddingHorizontal = spacing.xxl;
    }

    return {
      backgroundColor,
      borderColor,
      borderWidth,
      borderRadius: radii.md,
      paddingVertical,
      paddingHorizontal,
      opacity: disabled ? 0.45 : 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: spacing.sm,
    };
  };

  const getTextStyle = (): TextStyle => {
    let color = colors.textPrimary;
    switch (variant) {
      case 'primary':
        color = '#FFFFFF';
        break;
      case 'secondary':
        color = colors.textPrimary;
        break;
      case 'ghost':
        color = colors.accentPrimary;
        break;
      case 'danger':
        color = '#FFFFFF';
        break;
    }

    let fontSize = typography.fontSize.body;
    let lineHeight = typography.lineHeight.body;

    if (size === 'sm') {
      fontSize = typography.fontSize.small;
      lineHeight = typography.lineHeight.small;
    } else if (size === 'lg') {
      fontSize = typography.fontSize.subhead;
      lineHeight = typography.lineHeight.subhead;
    }

    return {
      color,
      fontSize,
      lineHeight,
      fontWeight: typography.fontWeight.semibold,
      textAlign: 'center',
    };
  };

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || loading}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel || title}
      accessibilityState={{ disabled: disabled || loading }}
      style={({ pressed }) => [getContainerStyle(pressed), style]}
    >
      {loading ? (
        <ActivityIndicator
          size="small"
          color={variant === 'primary' || variant === 'danger' ? '#FFFFFF' : colors.accentPrimary}
        />
      ) : (
        <>
          {icon}
          <Text style={[getTextStyle(), textStyle]}>{title}</Text>
        </>
      )}
    </Pressable>
  );
}
