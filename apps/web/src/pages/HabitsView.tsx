import React from 'react';
import { Flame, Plus, CheckCircle2, Award, Zap } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { SectionHeader } from '../components/ui/SectionHeader';
import { EmptyState } from '../components/ui/EmptyState';

export const HabitsView: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-boundary">
        <div>
          <span className="text-xs font-semibold text-accent-primary uppercase tracking-wider">
            Routines
          </span>
          <h1 className="text-2xl font-bold tracking-tight text-content-primary">
            Habit Tracking
          </h1>
          <p className="text-xs text-content-secondary mt-0.5">
            Build discipline with streak tracking, frequency goals, and zero-day protection
          </p>
        </div>

        <Button
          variant="primary"
          icon={<Plus size={16} />}
          onClick={() => alert('Add Habit modal will be connected to Dexie repository in Sprint 4.')}
        >
          Create Habit
        </Button>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card variant="elevated" className="space-y-1">
          <div className="flex items-center gap-2 text-xs font-medium text-content-secondary">
            <Flame size={15} className="text-accent-primary" /> Active Habits
          </div>
          <div className="text-2xl font-extrabold text-content-primary">
            0
          </div>
          <p className="text-[11px] text-content-muted">
            Daily & weekly tracked routines
          </p>
        </Card>

        <Card variant="elevated" className="space-y-1">
          <div className="flex items-center gap-2 text-xs font-medium text-status-success">
            <CheckCircle2 size={15} /> Completed Today
          </div>
          <div className="text-2xl font-extrabold text-status-success">
            0 / 0
          </div>
          <p className="text-[11px] text-content-muted">
            Today's completion rate: 0%
          </p>
        </Card>

        <Card variant="elevated" className="space-y-1">
          <div className="flex items-center gap-2 text-xs font-medium text-status-warning">
            <Award size={15} /> Longest Active Streak
          </div>
          <div className="text-2xl font-extrabold text-status-warning">
            0 days
          </div>
          <p className="text-[11px] text-content-muted">
            Consecutive daily consistency
          </p>
        </Card>
      </div>

      {/* Habits List Section */}
      <Card variant="elevated" className="space-y-4">
        <SectionHeader
          title="Daily Check-in"
          subtitle="Click to log today's completion status"
        />

        <EmptyState
          icon={<Flame size={28} />}
          title="No habits created yet"
          description="Start small by building one positive habit. LIFEOS calculates streaks accurately with yesterday grace period tolerance."
          action={
            <Button
              size="sm"
              variant="outline"
              icon={<Plus size={14} />}
              onClick={() => alert('Add Habit modal will be connected to Dexie repository in Sprint 4.')}
            >
              Add First Habit
            </Button>
          }
        />
      </Card>
    </div>
  );
};
