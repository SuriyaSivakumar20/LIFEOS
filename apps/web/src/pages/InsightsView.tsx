import React from 'react';
import { PieChart, Activity, BarChart3, ArrowDownLeft, ArrowUpRight } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { SectionHeader } from '../components/ui/SectionHeader';
import { EmptyState } from '../components/ui/EmptyState';
import { useAppStore } from '../stores/use-app-store';
import { formatMinorUnits } from '@lifeos/core';

export const InsightsView: React.FC = () => {
  const { userProfile, financialSummary, categoryBreakdown, tasks, habits } = useAppStore();
  const currency = userProfile?.currency || 'INR';

  const hasData = financialSummary.transactionCount > 0 || tasks.length > 0 || habits.length > 0;
  const completedTasksCount = tasks.filter((t) => t.status === 'completed').length;
  const taskCompletionRate = tasks.length > 0 ? Math.round((completedTasksCount / tasks.length) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-boundary">
        <div>
          <span className="text-xs font-semibold text-accent-primary uppercase tracking-wider">
            Analytics
          </span>
          <h1 className="text-2xl font-bold tracking-tight text-content-primary">
            Insights & Analytics
          </h1>
          <p className="text-xs text-content-secondary mt-0.5">
            Objective metrics calculated strictly from your verified local records
          </p>
        </div>

        <Badge variant="accent">Honest Analytics</Badge>
      </div>

      {!hasData ? (
        <Card variant="elevated" className="space-y-6">
          <EmptyState
            icon={<BarChart3 size={32} />}
            title="Sufficient data required for analytics"
            description="LIFEOS does not display fabricated scores or vanity graphs. Once you log transactions, complete tasks, and check in on habits over multiple days, category distributions and trend charts will automatically populate here."
          />
        </Card>
      ) : (
        <div className="space-y-6">
          {/* Summary Stat Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Card variant="elevated">
              <div className="text-xs text-content-secondary mb-1">Total Transactions</div>
              <div className="text-2xl font-bold text-content-primary">
                {financialSummary.transactionCount}
              </div>
              <div className="text-[11px] text-content-muted mt-1">
                Net: {formatMinorUnits(financialSummary.availableBalanceMinor, currency)}
              </div>
            </Card>

            <Card variant="elevated">
              <div className="text-xs text-content-secondary mb-1">Task Completion Ratio</div>
              <div className="text-2xl font-bold text-status-success">
                {taskCompletionRate}%
              </div>
              <div className="text-[11px] text-content-muted mt-1">
                {completedTasksCount} of {tasks.length} tasks completed
              </div>
            </Card>

            <Card variant="elevated">
              <div className="text-xs text-content-secondary mb-1">Tracked Routines</div>
              <div className="text-2xl font-bold text-accent-primary">
                {habits.length}
              </div>
              <div className="text-[11px] text-content-muted mt-1">
                {habits.filter((h) => h.isCompletedToday).length} completed today
              </div>
            </Card>
          </div>

          {/* Category Spending Breakdown */}
          {categoryBreakdown.length > 0 && (
            <Card variant="elevated" className="space-y-4">
              <SectionHeader
                title="Category Expenditure Breakdown"
                subtitle="Calculated from real transaction expenses and refunds"
              />

              <div className="space-y-3">
                {categoryBreakdown.map((cat) => (
                  <div key={cat.categoryId} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-content-primary">{cat.categoryName}</span>
                      <span className="text-content-secondary">
                        {formatMinorUnits(cat.totalMinor, currency)} ({cat.percentage}%)
                      </span>
                    </div>
                    <div className="w-full h-2 bg-bg-secondary rounded-full overflow-hidden">
                      <div
                        className="h-full bg-accent-primary rounded-full transition-all duration-300"
                        style={{ width: `${Math.min(cat.percentage, 100)}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>
      )}
    </div>
  );
};
