import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { BookOpen, BarChart3, Settings } from 'lucide-react-native';
import { useTheme, IconButton } from '@lifeos/ui';

export interface AppHeaderProps {
  title?: string;
  subtitle?: string;
  showSecondaryActions?: boolean;
  rightElement?: React.ReactNode;
}

export function AppHeader({
  title = 'LIFEOS',
  subtitle,
  showSecondaryActions = true,
  rightElement,
}: AppHeaderProps) {
  const router = useRouter();
  const { colors, spacing, typography } = useTheme();

  return (
    <View
      style={[
        styles.header,
        {
          paddingHorizontal: spacing.md,
          paddingVertical: spacing.md,
          borderBottomColor: colors.border,
          borderBottomWidth: 1,
          backgroundColor: colors.backgroundPrimary,
        },
      ]}
    >
      <View style={styles.titleArea}>
        <Text
          style={[
            styles.titleText,
            {
              color: colors.textPrimary,
              fontSize: typography.fontSize.title2,
              fontWeight: typography.fontWeight.bold,
            },
          ]}
        >
          {title}
        </Text>
        {subtitle ? (
          <Text
            style={[
              styles.subtitleText,
              {
                color: colors.textSecondary,
                fontSize: typography.fontSize.small,
                marginTop: spacing.xxs,
              },
            ]}
          >
            {subtitle}
          </Text>
        ) : null}
      </View>

      <View style={styles.actionsArea}>
        {rightElement}

        {showSecondaryActions && (
          <View style={styles.iconGroup}>
            <IconButton
              icon={<BookOpen size={18} color={colors.textSecondary} />}
              onPress={() => router.push('/journal')}
              accessibilityLabel="Open Journal"
              size="sm"
            />
            <IconButton
              icon={<BarChart3 size={18} color={colors.textSecondary} />}
              onPress={() => router.push('/insights')}
              accessibilityLabel="Open Insights"
              size="sm"
            />
            <IconButton
              icon={<Settings size={18} color={colors.textSecondary} />}
              onPress={() => router.push('/settings')}
              accessibilityLabel="Open Settings"
              size="sm"
            />
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
  },
  titleArea: {
    flex: 1,
  },
  titleText: {},
  subtitleText: {},
  actionsArea: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  iconGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
});
