import React, { useEffect } from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { Slot } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { ThemeProvider, Button, darkColors } from '@lifeos/ui';
import { useAppStore } from '../stores/use-app-store';
import { AppShell } from '../components/app-shell';

SplashScreen.preventAutoHideAsync().catch(() => {});

export default function RootLayout() {
  const { isDbReady, dbError, init, retryInit, themeMode } = useAppStore();

  useEffect(() => {
    init().finally(() => {
      SplashScreen.hideAsync().catch(() => {});
    });
  }, []);

  if (dbError) {
    return (
      <View style={[styles.centerContainer, { backgroundColor: darkColors.backgroundPrimary }]}>
        <View style={[styles.errorCard, { backgroundColor: darkColors.backgroundSecondary, borderColor: darkColors.border }]}>
          <Text style={[styles.errorTitle, { color: darkColors.error }]}>Database Error</Text>
          <Text style={[styles.errorDescription, { color: darkColors.textSecondary }]}>
            Unable to initialize local database storage:
          </Text>
          <Text style={[styles.errorDetails, { color: darkColors.textPrimary }]}>{dbError}</Text>
          <Button
            title="Retry Initialization"
            variant="primary"
            onPress={retryInit}
            style={{ marginTop: 16 }}
          />
        </View>
      </View>
    );
  }

  if (!isDbReady) {
    return (
      <View style={[styles.centerContainer, { backgroundColor: darkColors.backgroundPrimary }]}>
        <Text style={[styles.brandLogo, { color: darkColors.textPrimary }]}>LIFEOS</Text>
        <Text style={[styles.brandSub, { color: darkColors.textSecondary }]}>Initializing local system...</Text>
        <ActivityIndicator size="small" color={darkColors.accentPrimary} style={{ marginTop: 20 }} />
      </View>
    );
  }

  return (
    <ThemeProvider initialMode={themeMode}>
      <AppShell>
        <Slot />
      </AppShell>
    </ThemeProvider>
  );
}

const styles = StyleSheet.create({
  centerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  brandLogo: {
    fontSize: 28,
    fontWeight: '800',
    letterSpacing: 2,
  },
  brandSub: {
    fontSize: 14,
    marginTop: 6,
  },
  errorCard: {
    width: '100%',
    maxWidth: 420,
    padding: 24,
    borderRadius: 14,
    borderWidth: 1,
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 8,
  },
  errorDescription: {
    fontSize: 14,
    marginBottom: 8,
  },
  errorDetails: {
    fontSize: 13,
    fontFamily: 'monospace',
    marginBottom: 12,
  },
});
