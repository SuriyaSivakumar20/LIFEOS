import React from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  type ViewStyle,
  type StyleProp,
} from 'react-native';
import { useTheme } from '../theme-context';

export interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  actionLabel?: string;
  onActionPress?: () => void;
  style?: StyleProp<ViewStyle>;
  rightElement?: React.ReactNode;
}

export function SectionHeader({
  title,
  subtitle,
  actionLabel,
  onActionPress,
  style,
  rightElement,
}: SectionHeaderProps) {
  const { colors, spacing, typography } = useTheme();

  return (
    <View style={[styles.container, { marginBottom: spacing.md }, style]}>
      <View style={styles.textContainer}>
        <Text
          style={[
            styles.title,
            {
              color: colors.textPrimary,
              fontSize: typography.fontSize.title3,
              fontWeight: typography.fontWeight.semibold,
              lineHeight: typography.lineHeight.title3,
            },
          ]}
        >
          {title}
        </Text>
        {subtitle ? (
          <Text
            style={[
              styles.subtitle,
              {
                color: colors.textSecondary,
                fontSize: typography.fontSize.small,
                lineHeight: typography.lineHeight.small,
                marginTop: spacing.xxs,
              },
            ]}
          >
            {subtitle}
          </Text>
        ) : null}
      </View>

      {rightElement ? (
        rightElement
      ) : actionLabel && onActionPress ? (
        <Pressable
          onPress={onActionPress}
          accessibilityRole="button"
          style={({ pressed }) => [{ opacity: pressed ? 0.7 : 1 }]}
        >
          <Text
            style={[
              styles.actionText,
              {
                color: colors.accentPrimary,
                fontSize: typography.fontSize.small,
                fontWeight: typography.fontWeight.medium,
              },
            ]}
          >
            {actionLabel}
          </Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  textContainer: {
    flex: 1,
  },
  title: {},
  subtitle: {},
  actionText: {},
});
