import React from 'react';
import { TrendingUp, PieChart, Activity, ShieldCheck, BarChart3 } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { EmptyState } from '../components/ui/EmptyState';

export const InsightsView: React.FC = () => {
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

      {/* Honest Empty State Section */}
      <Card variant="elevated" className="space-y-6">
        <EmptyState
          icon={<BarChart3 size={32} />}
          title="Sufficient data required for analytics"
          description="LIFEOS does not display fabricated scores or vanity graphs. Once you log transactions, complete tasks, and check in on habits over multiple days, category distributions and trend charts will automatically populate here."
        />

        {/* Feature Preview Containers */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-boundary">
          <div className="p-3 rounded-md bg-bg-secondary border border-boundary/40 space-y-1">
            <div className="flex items-center gap-1.5 text-xs font-medium text-content-secondary">
              <PieChart size={14} className="text-accent-primary" />
              <span>Category Allocation</span>
            </div>
            <p className="text-[11px] text-content-muted">
              Shows spending percentages across food, housing, utilities, and transport.
            </p>
          </div>

          <div className="p-3 rounded-md bg-bg-secondary border border-boundary/40 space-y-1">
            <div className="flex items-center gap-1.5 text-xs font-medium text-content-secondary">
              <Activity size={14} className="text-status-success" />
              <span>Habit Consistency</span>
            </div>
            <p className="text-[11px] text-content-muted">
              Measures completion velocity and identifies routine drop-off days.
            </p>
          </div>

          <div className="p-3 rounded-md bg-bg-secondary border border-boundary/40 space-y-1">
            <div className="flex items-center gap-1.5 text-xs font-medium text-content-secondary">
              <TrendingUp size={14} className="text-status-warning" />
              <span>Task Completion Ratio</span>
            </div>
            <p className="text-[11px] text-content-muted">
              Calculates daily planned vs. achieved tasks across urgent & high priorities.
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
};
