import React from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  Platform,
  type ViewStyle,
} from 'react-native';
import { useTheme } from '../theme-context';

export interface NavItemConfig {
  key: string;
  label: string;
  route: string;
  icon: (props: { color: string; size: number }) => React.ReactNode;
  badge?: number | string;
}

export interface BottomNavigationProps {
  items: NavItemConfig[];
  currentRoute: string;
  onNavigate: (route: string) => void;
  style?: ViewStyle;
}

export function BottomNavigation({
  items,
  currentRoute,
  onNavigate,
  style,
}: BottomNavigationProps) {
  const { colors, spacing, typography, radii, shadows } = useTheme();

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: colors.backgroundSecondary,
          borderTopColor: colors.border,
          ...shadows.md,
        },
        style,
      ]}
    >
      <View style={styles.navRow}>
        {items.map((item) => {
          const isActive = currentRoute === item.route;
          const activeColor = colors.accentPrimary;
          const inactiveColor = colors.textSecondary;
          const color = isActive ? activeColor : inactiveColor;

          return (
            <Pressable
              key={item.key}
              onPress={() => onNavigate(item.route)}
              accessibilityRole="tab"
              accessibilityState={{ selected: isActive }}
              accessibilityLabel={item.label}
              style={({ pressed }) => [
                styles.tabButton,
                {
                  opacity: pressed ? 0.75 : 1,
                  borderRadius: radii.md,
                },
              ]}
            >
              <View style={styles.iconContainer}>
                {item.icon({ color, size: 22 })}
                {item.badge !== undefined && (
                  <View
                    style={[
                      styles.badge,
                      {
                        backgroundColor: colors.accentPrimary,
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.badgeText,
                        {
                          color: '#FFFFFF',
                          fontSize: typography.fontSize.tiny,
                        },
                      ]}
                    >
                      {item.badge}
                    </Text>
                  </View>
                )}
              </View>

              <Text
                style={[
                  styles.tabLabel,
                  {
                    color,
                    fontSize: typography.fontSize.tiny,
                    fontWeight: isActive
                      ? typography.fontWeight.semibold
                      : typography.fontWeight.regular,
                    marginTop: spacing.xxs,
                  },
                ]}
                numberOfLines={1}
              >
                {item.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderTopWidth: 1,
    paddingTop: 6,
    paddingBottom: Platform.OS === 'ios' ? 24 : 8,
    width: '100%',
  },
  navRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    maxWidth: 720,
    alignSelf: 'center',
    width: '100%',
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 4,
  },
  iconContainer: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  badge: {
    position: 'absolute',
    top: -4,
    right: -8,
    minWidth: 14,
    height: 14,
    borderRadius: 7,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 2,
  },
  badgeText: {
    fontWeight: '700',
    lineHeight: 12,
  },
  tabLabel: {},
});
