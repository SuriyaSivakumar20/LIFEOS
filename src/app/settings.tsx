import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Alert,
} from 'react-native';
import {
  Moon,
  Sun,
  Shield,
  Download,
  Upload,
  Globe,
  DollarSign,
  User,
  Check,
} from 'lucide-react-native';
import {
  ScreenContainer,
  Card,
  Button,
  Input,
  SectionHeader,
  useTheme,
  type ThemeMode,
} from '@lifeos/ui';
import { useAppStore } from '../stores/use-app-store';
import { AppHeader } from '../components/app-header';

export default function SettingsScreen() {
  const { colors, spacing, typography, radii, themeModeSetting } = useTheme();
  const { userProfile, updateProfile, setThemeMode } = useAppStore();

  const [name, setName] = useState(userProfile?.name || 'User');
  const [selectedCurrency, setSelectedCurrency] = useState(userProfile?.currency || 'USD');
  const [saveSuccess, setSaveSuccess] = useState(false);

  const currencies = ['USD', 'EUR', 'GBP', 'INR', 'CAD', 'AUD', 'JPY'];

  const themeOptions: { mode: ThemeMode; label: string; icon: React.ReactNode }[] = [
    { mode: 'dark', label: 'Dark (Default)', icon: <Moon size={16} color={colors.accentPrimary} /> },
    { mode: 'light', label: 'Light', icon: <Sun size={16} color={colors.accentPrimary} /> },
  ];

  const handleSaveProfile = async () => {
    await updateProfile({
      name: name.trim() || 'User',
      currency: selectedCurrency,
    });
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2500);
  };

  const handleThemeChange = async (mode: ThemeMode) => {
    await setThemeMode(mode);
  };

  return (
    <ScreenContainer
      header={
        <AppHeader
          title="Settings"
          subtitle="Preferences and local device storage"
          showSecondaryActions={false}
        />
      }
    >
      <View style={{ gap: spacing.lg, paddingVertical: spacing.md }}>
        {/* Profile Preferences */}
        <View>
          <SectionHeader title="Profile Preferences" />
          <Card padding="md" style={{ gap: spacing.md }}>
            <Input
              label="Your Name"
              value={name}
              onChangeText={setName}
              leftIcon={<User size={16} color={colors.textSecondary} />}
            />

            {/* Currency Selection */}
            <View>
              <Text
                style={{
                  color: colors.textSecondary,
                  fontSize: typography.fontSize.small,
                  marginBottom: spacing.xs,
                }}
              >
                Preferred Currency
              </Text>
              <View style={styles.chipRow}>
                {currencies.map((curr) => {
                  const isSelected = selectedCurrency === curr;
                  return (
                    <Pressable
                      key={curr}
                      onPress={() => setSelectedCurrency(curr)}
                      style={[
                        styles.currencyChip,
                        {
                          backgroundColor: isSelected ? colors.accentPrimary : colors.backgroundElevated,
                          borderColor: isSelected ? colors.accentPrimary : colors.border,
                          borderRadius: radii.sm,
                          paddingHorizontal: spacing.md,
                          paddingVertical: spacing.xs + 2,
                        },
                      ]}
                    >
                      <Text
                        style={{
                          color: isSelected ? '#FFFFFF' : colors.textPrimary,
                          fontSize: typography.fontSize.small,
                          fontWeight: isSelected ? '700' : '500',
                        }}
                      >
                        {curr}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>

            {/* Timezone */}
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
              <Globe size={16} color={colors.textSecondary} />
              <Text style={{ color: colors.textSecondary, fontSize: typography.fontSize.small }}>
                Timezone: {userProfile?.timezone || 'UTC'}
              </Text>
            </View>

            {saveSuccess && (
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <Check size={16} color={colors.success} />
                <Text style={{ color: colors.success, fontSize: typography.fontSize.small }}>
                  Settings saved successfully!
                </Text>
              </View>
            )}

            <Button
              title="Save Profile"
              variant="primary"
              onPress={handleSaveProfile}
            />
          </Card>
        </View>

        {/* Theme Selection */}
        <View>
          <SectionHeader title="Theme Appearance" />
          <Card padding="md" style={{ gap: spacing.sm }}>
            {themeOptions.map((opt) => {
              const isSelected = themeModeSetting === opt.mode;
              return (
                <Pressable
                  key={opt.mode}
                  onPress={() => handleThemeChange(opt.mode)}
                  style={({ pressed }) => [
                    styles.themeOptionRow,
                    {
                      backgroundColor: isSelected ? colors.accentMuted : colors.backgroundElevated,
                      borderColor: isSelected ? colors.accentPrimary : colors.border,
                      borderRadius: radii.md,
                      padding: spacing.md,
                      opacity: pressed ? 0.75 : 1,
                    },
                  ]}
                >
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md }}>
                    {opt.icon}
                    <Text
                      style={{
                        color: colors.textPrimary,
                        fontSize: typography.fontSize.body,
                        fontWeight: isSelected ? '600' : '400',
                      }}
                    >
                      {opt.label}
                    </Text>
                  </View>
                  {isSelected && <Check size={18} color={colors.accentPrimary} />}
                </Pressable>
              );
            })}
          </Card>
        </View>

        {/* Privacy & Architecture */}
        <View>
          <SectionHeader title="Privacy & Local Architecture" />
          <Card padding="md" style={{ gap: spacing.sm }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
              <Shield size={18} color={colors.success} />
              <Text style={{ color: colors.textPrimary, fontSize: typography.fontSize.body, fontWeight: '600' }}>
                100% Local-First
              </Text>
            </View>
            <Text style={{ color: colors.textSecondary, fontSize: typography.fontSize.small, lineHeight: 20 }}>
              LIFEOS stores all records strictly on this device (Expo SQLite on native, IndexedDB on web). No remote servers, no cloud tracking, and no external AI calls in this sprint.
            </Text>
          </Card>
        </View>

        {/* Data Export / Import */}
        <View>
          <SectionHeader title="Data Backup" subtitle="Local-only data management" />
          <Card padding="md" style={{ gap: spacing.md }}>
            <View style={{ flexDirection: 'row', gap: spacing.md }}>
              <Button
                title="Export Data"
                variant="secondary"
                icon={<Download size={16} color={colors.textPrimary} />}
                style={{ flex: 1 }}
                onPress={() => {
                  alert('Data export feature is staged for Sprint 2 with full JSON schema backup.');
                }}
              />
              <Button
                title="Import Data"
                variant="secondary"
                icon={<Upload size={16} color={colors.textPrimary} />}
                style={{ flex: 1 }}
                onPress={() => {
                  alert('Data import feature is staged for Sprint 2 with full JSON schema restore.');
                }}
              />
            </View>
          </Card>
        </View>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  currencyChip: {
    borderWidth: 1,
  },
  themeOptionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
  },
});
