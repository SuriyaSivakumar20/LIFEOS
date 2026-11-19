import React from 'react';
import {
  Pressable,
  StyleSheet,
  type ViewStyle,
  type StyleProp,
} from 'react-native';
import { useTheme } from '../theme-context';

export interface IconButtonProps {
  icon: React.ReactNode;
  onPress: () => void;
  disabled?: boolean;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'ghost' | 'secondary' | 'accent';
  style?: StyleProp<ViewStyle>;
  accessibilityLabel: string;
}

export function IconButton({
  icon,
  onPress,
  disabled = false,
  size = 'md',
  variant = 'ghost',
  style,
  accessibilityLabel,
}: IconButtonProps) {
  const { colors, radii, spacing } = useTheme();

  let dimension = 38;
  if (size === 'sm') dimension = 30;
  if (size === 'lg') dimension = 46;

  const getStyle = (pressed: boolean): ViewStyle => {
    let backgroundColor = 'transparent';
    let borderColor = 'transparent';
    let borderWidth = 0;

    switch (variant) {
      case 'secondary':
        backgroundColor = pressed ? colors.backgroundElevated : colors.backgroundSecondary;
        borderColor = colors.border;
        borderWidth = 1;
        break;
      case 'accent':
        backgroundColor = pressed ? colors.accentHover : colors.accentPrimary;
        break;
      case 'ghost':
        backgroundColor = pressed ? colors.backgroundElevated : 'transparent';
        break;
    }

    return {
      width: dimension,
      height: dimension,
      borderRadius: radii.md,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor,
      borderColor,
      borderWidth,
      opacity: disabled ? 0.4 : 1,
    };
  };

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      accessibilityState={{ disabled }}
      style={({ pressed }) => [getStyle(pressed), style]}
    >
      {icon}
    </Pressable>
  );
}
