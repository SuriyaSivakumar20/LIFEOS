import React from 'react';
import { View, Text, Pressable, StyleSheet, type ViewStyle } from 'react-native';
import { useTheme } from '../theme-context';
import type { NavItemConfig } from './bottom-navigation';

export interface WebSidebarProps {
  items: NavItemConfig[];
  currentRoute: string;
  onNavigate: (route: string) => void;
  style?: ViewStyle;
}

export function WebSidebar({
  items,
  currentRoute,
  onNavigate,
  style,
}: WebSidebarProps) {
  const { colors, spacing, typography, radii } = useTheme();

  return (
    <View
      style={[
        styles.sidebar,
        {
          backgroundColor: colors.backgroundSecondary,
          borderRightColor: colors.border,
          paddingVertical: spacing.xl,
          paddingHorizontal: spacing.md,
        },
        style,
      ]}
    >
      <View style={styles.brandContainer}>
        <View
          style={[
            styles.brandIcon,
            { backgroundColor: colors.accentPrimary, borderRadius: radii.sm },
          ]}
        >
          <Text style={styles.brandIconText}>L</Text>
        </View>
        <View>
          <Text
            style={[
              styles.brandTitle,
              {
                color: colors.textPrimary,
                fontSize: typography.fontSize.title3,
                fontWeight: typography.fontWeight.bold,
              },
            ]}
          >
            LIFEOS
          </Text>
          <Text
            style={[
              styles.brandSubtitle,
              {
                color: colors.textMuted,
                fontSize: typography.fontSize.tiny,
              },
            ]}
          >
            Assistant: Alfred
          </Text>
        </View>
      </View>

      <View style={[styles.divider, { backgroundColor: colors.border, marginVertical: spacing.lg }]} />

      <View style={styles.navItemsContainer}>
        {items.map((item) => {
          const isActive = currentRoute === item.route;
          const activeBg = colors.accentMuted;
          const activeColor = colors.accentPrimary;
          const inactiveColor = colors.textSecondary;

          return (
            <Pressable
              key={item.key}
              onPress={() => onNavigate(item.route)}
              accessibilityRole="link"
              accessibilityLabel={item.label}
              style={({ pressed }) => [
                styles.navItem,
                {
                  backgroundColor: isActive ? activeBg : pressed ? colors.backgroundElevated : 'transparent',
                  borderRadius: radii.md,
                  paddingVertical: spacing.sm + 2,
                  paddingHorizontal: spacing.md,
                  marginBottom: spacing.xs,
                },
              ]}
            >
              <View style={styles.navItemLeft}>
                {item.icon({
                  color: isActive ? activeColor : inactiveColor,
                  size: 20,
                })}
                <Text
                  style={[
                    styles.navItemText,
                    {
                      color: isActive ? colors.textPrimary : inactiveColor,
                      fontSize: typography.fontSize.body,
                      fontWeight: isActive
                        ? typography.fontWeight.semibold
                        : typography.fontWeight.regular,
                      marginLeft: spacing.md,
                    },
                  ]}
                >
                  {item.label}
                </Text>
              </View>

              {item.badge !== undefined && (
                <View
                  style={[
                    styles.badge,
                    {
                      backgroundColor: colors.accentPrimary,
                      borderRadius: radii.full,
                      paddingHorizontal: spacing.xs + 2,
                    },
                  ]}
                >
                  <Text style={styles.badgeText}>{item.badge}</Text>
                </View>
              )}
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  sidebar: {
    width: 240,
    borderRightWidth: 1,
    height: '100%',
  },
  brandContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 8,
  },
  brandIcon: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandIconText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 18,
  },
  brandTitle: {},
  brandSubtitle: {},
  divider: {
    height: 1,
  },
  navItemsContainer: {
    flex: 1,
  },
  navItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  navItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  navItemText: {},
  badge: {
    paddingVertical: 1,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
});
