import React from 'react';
import { View, StyleSheet, useWindowDimensions, Platform } from 'react-native';
import { useRouter, usePathname } from 'expo-router';
import { BottomNavigation, WebSidebar, useTheme } from '@lifeos/ui';
import { PRIMARY_NAV_ITEMS, ALL_NAV_ITEMS } from '../navigation/nav-config';

export interface AppShellProps {
  children: React.ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { width } = useWindowDimensions();
  const { colors } = useTheme();

  const isWideScreen = Platform.OS === 'web' && width >= 768;

  const handleNavigate = (route: string) => {
    if (pathname === route) return;
    router.push(route as any);
  };

  if (isWideScreen) {
    return (
      <View style={[styles.wideContainer, { backgroundColor: colors.backgroundPrimary }]}>
        <WebSidebar
          items={ALL_NAV_ITEMS}
          currentRoute={pathname}
          onNavigate={handleNavigate}
        />
        <View style={styles.mainContent}>
          {children}
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.mobileContainer, { backgroundColor: colors.backgroundPrimary }]}>
      <View style={styles.mobileContent}>
        {children}
      </View>
      <BottomNavigation
        items={PRIMARY_NAV_ITEMS}
        currentRoute={pathname}
        onNavigate={handleNavigate}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wideContainer: {
    flex: 1,
    flexDirection: 'row',
    height: '100%',
    width: '100%',
  },
  mainContent: {
    flex: 1,
    height: '100%',
  },
  mobileContainer: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  mobileContent: {
    flex: 1,
  },
});
