import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import {
  BarChart3,
  TrendingUp,
  Flame,
  CheckSquare,
  AlertCircle,
  PieChart,
} from 'lucide-react-native';
import {
  ScreenContainer,
  Card,
  SectionHeader,
  EmptyState,
  Button,
  useTheme,
} from '@lifeos/ui';
import { formatMinorUnits } from '@lifeos/core';
import { useAppStore } from '../stores/use-app-store';
import { AppHeader } from '../components/app-header';

export default function InsightsScreen() {
  const router = useRouter();
  const { colors, spacing, typography, radii } = useTheme();
  const {
    transactions,
    tasks,
    habits,
    financialSummary,
    categoryBreakdown,
    userProfile,
  } = useAppStore();

  const currency = userProfile?.currency ?? 'INR';

  // Calculate actual honest metrics
  const totalCompletedTasks = tasks.filter((t) => t.status === 'completed').length;
  const taskCompletionRate = tasks.length > 0
    ? Math.round((totalCompletedTasks / tasks.length) * 100)
    : 0;

  const activeHabitsCount = habits.length;
  const habitsDoneToday = habits.filter((h) => h.isCompletedToday).length;

  const hasSufficientData = transactions.length >= 3 || tasks.length >= 3 || habits.length >= 2;

  return (
    <ScreenContainer
      header={
        <AppHeader
          title="Insights"
          subtitle="Honest analytics based on your stored activity"
          showSecondaryActions={true}
        />
      }
    >
      <View style={{ gap: spacing.lg, paddingVertical: spacing.md }}>
        {!hasSufficientData ? (
          <EmptyState
            icon={<BarChart3 size={32} color={colors.accentPrimary} />}
            title="Insufficient data for deep analytics"
            description="LIFEOS does not fabricate fake metrics. Once you log more transactions, tasks, and habits, genuine trend analyses and patterns will appear here."
            actionLabel="Go to Home"
            onActionPress={() => router.push('/')}
          />
        ) : (
          <>
            {/* Financial Activity Summary */}
            <View>
              <SectionHeader title="Financial Activity" />
              <Card variant="elevated">
                <Text style={{ color: colors.textSecondary, fontSize: typography.fontSize.small }}>
                  Logged Transactions: {transactions.length}
                </Text>
                <View style={[styles.statsRow, { marginTop: spacing.md }]}>
                  <View style={styles.statBox}>
                    <Text style={{ color: colors.textSecondary, fontSize: typography.fontSize.tiny }}>
                      Net Cash Flow
                    </Text>
                    <Text
                      style={{
                        color:
                          financialSummary.availableBalanceMinor >= 0
                            ? colors.success
                            : colors.error,
                        fontSize: typography.fontSize.title3,
                        fontWeight: '700',
                        marginTop: 2,
                      }}
                    >
                      {formatMinorUnits(financialSummary.availableBalanceMinor, currency)}
                    </Text>
                  </View>

                  <View style={styles.statBox}>
                    <Text style={{ color: colors.textSecondary, fontSize: typography.fontSize.tiny }}>
                      Top Expense Category
                    </Text>
                    <Text
                      style={{
                        color: colors.textPrimary,
                        fontSize: typography.fontSize.title3,
                        fontWeight: '700',
                        marginTop: 2,
                      }}
                    >
                      {categoryBreakdown[0]?.categoryName ?? 'None'}
                    </Text>
                  </View>
                </View>
              </Card>
            </View>

            {/* Productivity & Consistency */}
            <View>
              <SectionHeader title="Productivity & Habits" />
              <View style={{ gap: spacing.sm }}>
                <Card padding="md">
                  <View style={styles.metricHeader}>
                    <CheckSquare size={18} color={colors.accentPrimary} />
                    <Text
                      style={{
                        color: colors.textPrimary,
                        fontSize: typography.fontSize.body,
                        fontWeight: '600',
                      }}
                    >
                      Task Completion Rate
                    </Text>
                  </View>
                  <Text
                    style={{
                      color: colors.accentPrimary,
                      fontSize: typography.fontSize.title1,
                      fontWeight: '700',
                      marginVertical: spacing.xs,
                    }}
                  >
                    {taskCompletionRate}%
                  </Text>
                  <Text style={{ color: colors.textSecondary, fontSize: typography.fontSize.small }}>
                    {totalCompletedTasks} of {tasks.length} total tasks completed.
                  </Text>
                </Card>

                <Card padding="md">
                  <View style={styles.metricHeader}>
                    <Flame size={18} color={colors.accentPrimary} />
                    <Text
                      style={{
                        color: colors.textPrimary,
                        fontSize: typography.fontSize.body,
                        fontWeight: '600',
                      }}
                    >
                      Habit Daily Check-in
                    </Text>
                  </View>
                  <Text
                    style={{
                      color: colors.success,
                      fontSize: typography.fontSize.title1,
                      fontWeight: '700',
                      marginVertical: spacing.xs,
                    }}
                  >
                    {habitsDoneToday} / {activeHabitsCount}
                  </Text>
                  <Text style={{ color: colors.textSecondary, fontSize: typography.fontSize.small }}>
                    Habits verified completed today.
                  </Text>
                </Card>
              </View>
            </View>
          </>
        )}
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  statBox: {
    flex: 1,
  },
  metricHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
});
