import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  Pressable,
} from 'react-native';
import {
  Plus,
  Flame,
  Check,
  Trash2,
  X,
  Award,
} from 'lucide-react-native';
import {
  ScreenContainer,
  Card,
  Button,
  Input,
  IconButton,
  SectionHeader,
  EmptyState,
  useTheme,
} from '@lifeos/ui';
import { useAppStore } from '../stores/use-app-store';
import { AppHeader } from '../components/app-header';

export default function HabitsScreen() {
  const { colors, spacing, typography, radii } = useTheme();
  const { habits, addHabit, toggleHabitToday, deleteHabit } = useAppStore();

  const [modalVisible, setModalVisible] = useState(false);
  const [title, setTitle] = useState('');
  const [frequency, setFrequency] = useState<'daily' | 'weekly'>('daily');
  const [targetDays, setTargetDays] = useState('7');
  const [errorMsg, setErrorMsg] = useState('');

  const completedTodayCount = habits.filter((h) => h.isCompletedToday).length;

  const openAddModal = () => {
    setTitle('');
    setFrequency('daily');
    setTargetDays('7');
    setErrorMsg('');
    setModalVisible(true);
  };

  const handleSaveHabit = async () => {
    if (!title.trim()) {
      setErrorMsg('Please enter a habit title');
      return;
    }
    const days = parseInt(targetDays, 10);
    if (isNaN(days) || days < 1 || days > 7) {
      setErrorMsg('Target days per week must be between 1 and 7');
      return;
    }

    try {
      await addHabit({
        title: title.trim(),
        frequency,
        targetDaysPerWeek: days,
        isArchived: false,
      });
      setModalVisible(false);
    } catch {
      setErrorMsg('Failed to save habit');
    }
  };

  return (
    <ScreenContainer
      header={
        <AppHeader
          title="Habits"
          subtitle="Streaks and daily consistency"
          rightElement={
            <Button
              title="+ Add Habit"
              onPress={openAddModal}
              size="sm"
            />
          }
        />
      }
    >
      <View style={{ gap: spacing.lg, paddingVertical: spacing.md }}>
        {/* Streak Summary Overview */}
        <Card variant="elevated">
          <View style={styles.summaryRow}>
            <View style={styles.summaryItem}>
              <View style={styles.summaryIconRow}>
                <Flame size={16} color={colors.accentPrimary} />
                <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>
                  Active Habits
                </Text>
              </View>
              <Text
                style={[
                  styles.summaryValue,
                  { color: colors.textPrimary, fontSize: typography.fontSize.title1, fontWeight: '700' },
                ]}
              >
                {habits.length}
              </Text>
            </View>

            <View style={styles.summaryItem}>
              <View style={styles.summaryIconRow}>
                <Check size={16} color={colors.success} />
                <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>
                  Done Today
                </Text>
              </View>
              <Text
                style={[
                  styles.summaryValue,
                  { color: colors.success, fontSize: typography.fontSize.title1, fontWeight: '700' },
                ]}
              >
                {completedTodayCount} / {habits.length}
              </Text>
            </View>
          </View>
        </Card>

        {/* Habit List */}
        <View>
          <SectionHeader
            title="Your Daily Habits"
            subtitle="Tap to complete today's log"
          />
          {habits.length === 0 ? (
            <EmptyState
              icon={<Flame size={24} color={colors.accentPrimary} />}
              title="No habits created yet"
              description="Form strong daily disciplines by adding your first habit."
              actionLabel="Add Habit"
              onActionPress={openAddModal}
            />
          ) : (
            <View style={{ gap: spacing.sm }}>
              {habits.map((habit) => (
                <Card
                  key={habit.id}
                  padding="md"
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <View style={{ flex: 1, marginRight: spacing.md }}>
                    <Text
                      style={[
                        styles.habitTitle,
                        {
                          color: colors.textPrimary,
                          fontSize: typography.fontSize.subhead,
                          fontWeight: typography.fontWeight.semibold,
                        },
                      ]}
                    >
                      {habit.title}
                    </Text>

                    <View style={styles.streakDetailsRow}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                        <Flame
                          size={14}
                          color={habit.streakCount > 0 ? colors.accentPrimary : colors.textMuted}
                        />
                        <Text
                          style={[
                            styles.streakCountText,
                            {
                              color: habit.streakCount > 0 ? colors.accentPrimary : colors.textSecondary,
                              fontSize: typography.fontSize.small,
                              fontWeight: '600',
                            },
                          ]}
                        >
                          {habit.streakCount} day streak
                        </Text>
                      </View>

                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                        <Award size={14} color={colors.textMuted} />
                        <Text style={[styles.bestStreakText, { color: colors.textMuted, fontSize: typography.fontSize.tiny }]}>
                          Best: {habit.bestStreak}
                        </Text>
                      </View>
                    </View>
                  </View>

                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
                    <Button
                      title={habit.isCompletedToday ? 'Completed' : 'Check in'}
                      variant={habit.isCompletedToday ? 'secondary' : 'primary'}
                      size="sm"
                      onPress={() => toggleHabitToday(habit.id)}
                    />
                    <IconButton
                      icon={<Trash2 size={14} color={colors.textMuted} />}
                      onPress={() => deleteHabit(habit.id)}
                      size="sm"
                      accessibilityLabel="Delete habit"
                    />
                  </View>
                </Card>
              ))}
            </View>
          )}
        </View>
      </View>

      {/* Add Habit Modal */}
      <Modal
        visible={modalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={[styles.modalOverlay, { backgroundColor: colors.overlay }]}>
          <View
            style={[
              styles.modalCard,
              {
                backgroundColor: colors.backgroundSecondary,
                borderColor: colors.border,
                borderRadius: radii.xl,
                padding: spacing.xl,
              },
            ]}
          >
            <View style={styles.modalHeader}>
              <Text
                style={[
                  styles.modalTitle,
                  {
                    color: colors.textPrimary,
                    fontSize: typography.fontSize.title3,
                    fontWeight: typography.fontWeight.semibold,
                  },
                ]}
              >
                Add Habit
              </Text>
              <IconButton
                icon={<X size={18} color={colors.textSecondary} />}
                onPress={() => setModalVisible(false)}
                accessibilityLabel="Close"
                size="sm"
              />
            </View>

            <Input
              label="Habit Name"
              placeholder="e.g. Morning 20m workout, Read 15 pages"
              value={title}
              onChangeText={setTitle}
            />

            <Input
              label="Target Days per Week (1 - 7)"
              placeholder="7"
              keyboardType="number-pad"
              value={targetDays}
              onChangeText={setTargetDays}
            />

            {errorMsg ? (
              <Text style={[styles.errorText, { color: colors.error, fontSize: typography.fontSize.small }]}>
                {errorMsg}
              </Text>
            ) : null}

            <View style={styles.modalActions}>
              <Button
                title="Cancel"
                variant="secondary"
                onPress={() => setModalVisible(false)}
                style={{ flex: 1 }}
              />
              <Button
                title="Save Habit"
                variant="primary"
                onPress={handleSaveHabit}
                style={{ flex: 1 }}
              />
            </View>
          </View>
        </View>
      </Modal>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  summaryItem: {
    alignItems: 'center',
  },
  summaryIconRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 4,
  },
  summaryLabel: {
    fontSize: 12,
  },
  summaryValue: {},
  habitTitle: {},
  streakDetailsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 6,
  },
  streakCountText: {},
  bestStreakText: {},
  modalOverlay: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  modalCard: {
    width: '100%',
    maxWidth: 440,
    borderWidth: 1,
    gap: 16,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  modalTitle: {},
  errorText: {},
  modalActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
});
