import React from 'react';
import {
  View,
  Pressable,
  StyleSheet,
  type ViewStyle,
  type StyleProp,
} from 'react-native';
import { useTheme } from '../theme-context';

export interface CardProps {
  children: React.ReactNode;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
  variant?: 'default' | 'elevated' | 'outlined';
  padding?: 'none' | 'sm' | 'md' | 'lg';
  accessibilityLabel?: string;
}

export function Card({
  children,
  onPress,
  style,
  variant = 'default',
  padding = 'md',
  accessibilityLabel,
}: CardProps) {
  const { colors, radii, spacing, shadows } = useTheme();

  const getPadding = (): number => {
    switch (padding) {
      case 'none':
        return 0;
      case 'sm':
        return spacing.sm;
      case 'lg':
        return spacing.xl;
      case 'md':
      default:
        return spacing.lg;
    }
  };

  const getBackground = (): string => {
    switch (variant) {
      case 'elevated':
        return colors.backgroundElevated;
      case 'outlined':
        return 'transparent';
      case 'default':
      default:
        return colors.backgroundSecondary;
    }
  };

  const cardStyle: ViewStyle = {
    backgroundColor: getBackground(),
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: getPadding(),
    ...(variant === 'elevated' ? shadows.sm : {}),
  };

  if (onPress) {
    return (
      <Pressable
        onPress={onPress}
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel}
        style={({ pressed }) => [
          cardStyle,
          { opacity: pressed ? 0.88 : 1 },
          style,
        ]}
      >
        {children}
      </Pressable>
    );
  }

  return <View style={[cardStyle, style]}>{children}</View>;
}
