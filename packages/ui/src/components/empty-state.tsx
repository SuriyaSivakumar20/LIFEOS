import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  type ViewStyle,
  type StyleProp,
} from 'react-native';
import { useTheme } from '../theme-context';
import { Button } from './button';

export interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description: string;
  actionLabel?: string;
  onActionPress?: () => void;
  style?: StyleProp<ViewStyle>;
}

export function EmptyState({
  icon,
  title,
  description,
  actionLabel,
  onActionPress,
  style,
}: EmptyStateProps) {
  const { colors, radii, spacing, typography } = useTheme();

  return (
    <View
      style={[
        styles.container,
        {
          padding: spacing.xl,
          backgroundColor: colors.backgroundSecondary,
          borderRadius: radii.lg,
          borderWidth: 1,
          borderColor: colors.border,
        },
        style,
      ]}
    >
      {icon && (
        <View
          style={[
            styles.iconWrapper,
            {
              backgroundColor: colors.backgroundElevated,
              borderRadius: radii.md,
              padding: spacing.md,
              marginBottom: spacing.md,
              borderColor: colors.border,
              borderWidth: 1,
            },
          ]}
        >
          {icon}
        </View>
      )}

      <Text
        style={[
          styles.title,
          {
            color: colors.textPrimary,
            fontSize: typography.fontSize.subhead,
            fontWeight: typography.fontWeight.semibold,
            marginBottom: spacing.xs,
            textAlign: 'center',
          },
        ]}
      >
        {title}
      </Text>

      <Text
        style={[
          styles.description,
          {
            color: colors.textSecondary,
            fontSize: typography.fontSize.small,
            lineHeight: typography.lineHeight.small + 2,
            textAlign: 'center',
            marginBottom: actionLabel && onActionPress ? spacing.lg : 0,
            maxWidth: 320,
          },
        ]}
      >
        {description}
      </Text>

      {actionLabel && onActionPress && (
        <Button
          title={actionLabel}
          onPress={onActionPress}
          variant="secondary"
          size="sm"
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {},
  description: {},
});
