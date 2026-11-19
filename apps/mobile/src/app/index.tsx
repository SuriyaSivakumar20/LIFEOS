import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import {
  Wallet,
  CheckSquare,
  Flame,
  Bell,
  Sparkles,
  Plus,
  BookOpen,
  ArrowRight,
  TrendingUp,
  TrendingDown,
  Bot,
} from 'lucide-react-native';
import {
  ScreenContainer,
  Card,
  Button,
  IconButton,
  SectionHeader,
  EmptyState,
  useTheme,
} from '@lifeos/ui';
import {
  getGreeting,
  formatDisplayDate,
  formatMinorUnits,
  formatLocalDateString,
} from '@lifeos/core';
import { ALFRED_DEFAULT_SUGGESTIONS } from '@lifeos/alfred';
import { useAppStore } from '../stores/use-app-store';
import { AppHeader } from '../components/app-header';

export default function HomeDashboardScreen() {
  const router = useRouter();
  const { colors, spacing, typography, radii } = useTheme();

  const {
    financialSummary,
    transactions,
    tasks,
    habits,
    reminders,
    toggleTaskStatus,
    toggleHabitToday,
    userProfile,
  } = useAppStore();

  const now = new Date();
  const { greeting } = getGreeting(now);
  const displayDate = formatDisplayDate(now);
  const todayStr = formatLocalDateString(now);

  const currency = userProfile?.currency ?? 'INR';

  // Today's tasks
  const todayTasks = tasks.filter((t) => {
    if (t.dueDate) return t.dueDate.startsWith(todayStr);
    return t.createdAt.startsWith(todayStr) || t.status === 'pending';
  }).slice(0, 4);

  // Active habits
  const activeHabits = habits.slice(0, 4);

  // Reminders
  const upcomingReminders = reminders.filter((r) => r.status === 'pending').slice(0, 3);

  return (
    <ScreenContainer
      header={
        <AppHeader
          title="LIFEOS"
          subtitle={displayDate}
          showSecondaryActions={true}
        />
      }
    >
      <View style={{ gap: spacing.lg, paddingVertical: spacing.md }}>
        {/* Greeting Banner */}
        <View style={styles.greetingContainer}>
          <Text
            style={[
              styles.greetingText,
              {
                color: colors.textPrimary,
                fontSize: typography.fontSize.title1,
                fontWeight: typography.fontWeight.bold,
              },
            ]}
          >
            {greeting}, {userProfile?.name || 'User'}
          </Text>
          <Text
            style={[
              styles.subGreeting,
              {
                color: colors.textSecondary,
                fontSize: typography.fontSize.body,
                marginTop: spacing.xxs,
              },
            ]}
          >
            Here is your daily personal overview.
          </Text>
        </View>

        {/* Quick Actions Row */}
        <View style={styles.quickActionsRow}>
          <Pressable
            onPress={() => router.push('/money')}
            style={({ pressed }) => [
              styles.quickActionButton,
              {
                backgroundColor: colors.backgroundSecondary,
                borderColor: colors.border,
                borderRadius: radii.md,
                padding: spacing.sm,
                opacity: pressed ? 0.75 : 1,
              },
            ]}
          >
            <Wallet size={16} color={colors.accentPrimary} />
            <Text
              style={[
                styles.quickActionLabel,
                { color: colors.textPrimary, fontSize: typography.fontSize.tiny, marginTop: spacing.xs },
              ]}
            >
              Money
            </Text>
          </Pressable>

          <Pressable
            onPress={() => router.push('/planner')}
            style={({ pressed }) => [
              styles.quickActionButton,
              {
                backgroundColor: colors.backgroundSecondary,
                borderColor: colors.border,
                borderRadius: radii.md,
                padding: spacing.sm,
                opacity: pressed ? 0.75 : 1,
              },
            ]}
          >
            <CheckSquare size={16} color={colors.accentPrimary} />
            <Text
              style={[
                styles.quickActionLabel,
                { color: colors.textPrimary, fontSize: typography.fontSize.tiny, marginTop: spacing.xs },
              ]}
            >
              Planner
            </Text>
          </Pressable>

          <Pressable
            onPress={() => router.push('/habits')}
            style={({ pressed }) => [
              styles.quickActionButton,
              {
                backgroundColor: colors.backgroundSecondary,
                borderColor: colors.border,
                borderRadius: radii.md,
                padding: spacing.sm,
                opacity: pressed ? 0.75 : 1,
              },
            ]}
          >
            <Flame size={16} color={colors.accentPrimary} />
            <Text
              style={[
                styles.quickActionLabel,
                { color: colors.textPrimary, fontSize: typography.fontSize.tiny, marginTop: spacing.xs },
              ]}
            >
              Habits
            </Text>
          </Pressable>

          <Pressable
            onPress={() => router.push('/journal')}
            style={({ pressed }) => [
              styles.quickActionButton,
              {
                backgroundColor: colors.backgroundSecondary,
                borderColor: colors.border,
                borderRadius: radii.md,
                padding: spacing.sm,
                opacity: pressed ? 0.75 : 1,
              },
            ]}
          >
            <BookOpen size={16} color={colors.accentPrimary} />
            <Text
              style={[
                styles.quickActionLabel,
                { color: colors.textPrimary, fontSize: typography.fontSize.tiny, marginTop: spacing.xs },
              ]}
            >
              Journal
            </Text>
          </Pressable>
        </View>

        {/* Alfred Assistant Entry Point */}
        <Card
          variant="elevated"
          onPress={() => router.push('/alfred')}
          style={{ borderColor: colors.accentPrimary, borderWidth: 1 }}
        >
          <View style={styles.alfredBanner}>
            <View
              style={[
                styles.alfredIconContainer,
                { backgroundColor: colors.accentMuted, borderRadius: radii.md },
              ]}
            >
              <Bot size={22} color={colors.accentPrimary} />
            </View>
            <View style={{ flex: 1 }}>
              <View style={styles.alfredHeaderRow}>
                <Text
                  style={[
                    styles.alfredTitle,
                    {
                      color: colors.textPrimary,
                      fontSize: typography.fontSize.subhead,
                      fontWeight: typography.fontWeight.semibold,
                    },
                  ]}
                >
                  Alfred Assistant
                </Text>
                <View
                  style={[
                    styles.offlineTag,
                    { backgroundColor: colors.backgroundElevated, borderColor: colors.border },
                  ]}
                >
                  <Text style={[styles.offlineTagText, { color: colors.textMuted }]}>Local</Text>
                </View>
              </View>
              <Text
                style={[
                  styles.alfredSubtitle,
                  {
                    color: colors.textSecondary,
                    fontSize: typography.fontSize.small,
                    marginTop: 2,
                  },
                ]}
              >
                Ready to assist with your day. Tap to open chat.
              </Text>
            </View>
            <ArrowRight size={18} color={colors.textSecondary} />
          </View>
        </Card>

        {/* Financial Overview Card */}
        <View>
          <SectionHeader
            title="Financial Overview"
            actionLabel="View all"
            onActionPress={() => router.push('/money')}
          />
          {transactions.length === 0 ? (
            <EmptyState
              icon={<Wallet size={24} color={colors.accentPrimary} />}
              title="No transactions logged"
              description="Add your income or expenses in Money to see calculated balances and totals."
              actionLabel="Add Transaction"
              onActionPress={() => router.push('/money')}
            />
          ) : (
            <Card>
              <Text
                style={[
                  styles.balanceLabel,
                  { color: colors.textSecondary, fontSize: typography.fontSize.small },
                ]}
              >
                Available Balance
              </Text>
              <Text
                style={[
                  styles.balanceValue,
                  {
                    color: colors.textPrimary,
                    fontSize: typography.fontSize.display,
                    fontWeight: typography.fontWeight.bold,
                    marginVertical: spacing.xs,
                  },
                ]}
              >
                {formatMinorUnits(financialSummary.availableBalanceMinor, currency)}
              </Text>

              <View
                style={[
                  styles.financeMetricsRow,
                  { borderTopColor: colors.border, borderTopWidth: 1, paddingTop: spacing.md, marginTop: spacing.sm },
                ]}
              >
                <View style={styles.financeMetric}>
                  <View style={styles.metricHeader}>
                    <TrendingUp size={14} color={colors.success} />
                    <Text style={[styles.metricLabel, { color: colors.textSecondary }]}>Total Income</Text>
                  </View>
                  <Text style={[styles.metricValue, { color: colors.success }]}>
                    {formatMinorUnits(financialSummary.totalIncomeMinor, currency)}
                  </Text>
                </View>

                <View style={styles.financeMetric}>
                  <View style={styles.metricHeader}>
                    <TrendingDown size={14} color={colors.error} />
                    <Text style={[styles.metricLabel, { color: colors.textSecondary }]}>Total Expenses</Text>
                  </View>
                  <Text style={[styles.metricValue, { color: colors.error }]}>
                    {formatMinorUnits(financialSummary.totalExpensesMinor, currency)}
                  </Text>
                </View>
              </View>
            </Card>
          )}
        </View>

        {/* Today's Tasks */}
        <View>
          <SectionHeader
            title="Today's Tasks"
            subtitle={`${todayTasks.filter((t) => t.status === 'completed').length}/${todayTasks.length} completed`}
            actionLabel="Planner"
            onActionPress={() => router.push('/planner')}
          />
          {todayTasks.length === 0 ? (
            <EmptyState
              icon={<CheckSquare size={24} color={colors.accentPrimary} />}
              title="No tasks scheduled for today"
              description="Add a task in the Planner to organize your day."
              actionLabel="Add Task"
              onActionPress={() => router.push('/planner')}
            />
          ) : (
            <View style={{ gap: spacing.sm }}>
              {todayTasks.map((task) => {
                const isCompleted = task.status === 'completed';
                return (
                  <Card
                    key={task.id}
                    onPress={() => toggleTaskStatus(task.id)}
                    padding="sm"
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      gap: spacing.md,
                    }}
                  >
                    <View
                      style={[
                        styles.checkbox,
                        {
                          borderColor: isCompleted ? colors.success : colors.border,
                          backgroundColor: isCompleted ? colors.successMuted : 'transparent',
                        },
                      ]}
                    >
                      {isCompleted && <CheckSquare size={14} color={colors.success} />}
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text
                        style={[
                          styles.taskTitle,
                          {
                            color: isCompleted ? colors.textMuted : colors.textPrimary,
                            textDecorationLine: isCompleted ? 'line-through' : 'none',
                            fontSize: typography.fontSize.body,
                          },
                        ]}
                      >
                        {task.title}
                      </Text>
                    </View>
                    <View
                      style={[
                        styles.priorityBadge,
                        {
                          backgroundColor:
                            task.priority === 'urgent'
                              ? colors.errorMuted
                              : task.priority === 'high'
                              ? colors.warningMuted
                              : colors.backgroundElevated,
                        },
                      ]}
                    >
                      <Text
                        style={[
                          styles.priorityText,
                          {
                            color:
                              task.priority === 'urgent'
                                ? colors.error
                                : task.priority === 'high'
                                ? colors.warning
                                : colors.textSecondary,
                          },
                        ]}
                      >
                        {task.priority}
                      </Text>
                    </View>
                  </Card>
                );
              })}
            </View>
          )}
        </View>

        {/* Habit Streaks */}
        <View>
          <SectionHeader
            title="Habit Streaks"
            actionLabel="All Habits"
            onActionPress={() => router.push('/habits')}
          />
          {activeHabits.length === 0 ? (
            <EmptyState
              icon={<Flame size={24} color={colors.accentPrimary} />}
              title="No habits tracked yet"
              description="Start a daily or weekly habit routine in Habits."
              actionLabel="Add Habit"
              onActionPress={() => router.push('/habits')}
            />
          ) : (
            <View style={{ gap: spacing.sm }}>
              {activeHabits.map((habit) => (
                <Card
                  key={habit.id}
                  padding="sm"
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm, flex: 1 }}>
                    <Flame
                      size={18}
                      color={habit.streakCount > 0 ? colors.accentPrimary : colors.textMuted}
                    />
                    <View>
                      <Text
                        style={[
                          styles.habitTitle,
                          { color: colors.textPrimary, fontSize: typography.fontSize.body },
                        ]}
                      >
                        {habit.title}
                      </Text>
                      <Text
                        style={[
                          styles.habitStreakText,
                          { color: colors.textSecondary, fontSize: typography.fontSize.tiny },
                        ]}
                      >
                        Streak: {habit.streakCount} days (Best: {habit.bestStreak})
                      </Text>
                    </View>
                  </View>

                  <Button
                    title={habit.isCompletedToday ? 'Done' : 'Check in'}
                    variant={habit.isCompletedToday ? 'secondary' : 'primary'}
                    size="sm"
                    onPress={() => toggleHabitToday(habit.id)}
                  />
                </Card>
              ))}
            </View>
          )}
        </View>

        {/* Upcoming Reminders */}
        {upcomingReminders.length > 0 && (
          <View>
            <SectionHeader title="Upcoming Reminders" />
            <View style={{ gap: spacing.sm }}>
              {upcomingReminders.map((r) => (
                <Card
                  key={r.id}
                  padding="sm"
                  style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md }}
                >
                  <Bell size={16} color={colors.warning} />
                  <View style={{ flex: 1 }}>
                    <Text
                      style={[
                        styles.reminderTitle,
                        { color: colors.textPrimary, fontSize: typography.fontSize.body },
                      ]}
                    >
                      {r.title}
                    </Text>
                  </View>
                </Card>
              ))}
            </View>
          </View>
        )}

        {/* Alfred Suggestions Section */}
        <View>
          <SectionHeader
            title="Alfred's Suggestions"
            subtitle="Contextual suggestions to prompt Alfred"
          />
          <View style={{ gap: spacing.sm }}>
            {ALFRED_DEFAULT_SUGGESTIONS.map((sug) => (
              <Card
                key={sug.id}
                onPress={() => router.push('/alfred')}
                variant="outlined"
                padding="sm"
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  borderColor: colors.border,
                }}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm, flex: 1 }}>
                  <Sparkles size={16} color={colors.accentPrimary} />
                  <Text
                    style={[
                      styles.suggestionText,
                      { color: colors.textPrimary, fontSize: typography.fontSize.small },
                    ]}
                  >
                    "{sug.label}"
                  </Text>
                </View>
                <ArrowRight size={14} color={colors.textSecondary} />
              </Card>
            ))}
          </View>
        </View>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  greetingContainer: {},
  greetingText: {},
  subGreeting: {},
  quickActionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  quickActionButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  quickActionLabel: {
    fontWeight: '600',
  },
  alfredBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  alfredIconContainer: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  alfredHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  alfredTitle: {},
  alfredSubtitle: {},
  offlineTag: {
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 4,
    borderWidth: 1,
  },
  offlineTagText: {
    fontSize: 10,
    fontWeight: '600',
  },
  balanceLabel: {},
  balanceValue: {},
  financeMetricsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  financeMetric: {
    flex: 1,
  },
  metricHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 2,
  },
  metricLabel: {
    fontSize: 12,
  },
  metricValue: {
    fontSize: 16,
    fontWeight: '700',
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 4,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  taskTitle: {},
  priorityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  priorityText: {
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  habitTitle: {},
  habitStreakText: {},
  reminderTitle: {},
  suggestionText: {
    fontWeight: '500',
  },
});
