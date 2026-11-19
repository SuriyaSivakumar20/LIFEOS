import React, { useState } from 'react';
import {
  Calendar,
  CheckCircle2,
  Clock,
  Plus,
  AlertCircle,
  ListTodo,
} from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { SectionHeader } from '../components/ui/SectionHeader';
import { EmptyState } from '../components/ui/EmptyState';

export const PlannerView: React.FC = () => {
  const [filter, setFilter] = useState<'today' | 'upcoming' | 'completed'>('today');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-boundary">
        <div>
          <span className="text-xs font-semibold text-accent-primary uppercase tracking-wider">
            Planning
          </span>
          <h1 className="text-2xl font-bold tracking-tight text-content-primary">
            Daily Planner & Tasks
          </h1>
          <p className="text-xs text-content-secondary mt-0.5">
            Focus on what matters today with priority scheduling and in-app reminders
          </p>
        </div>

        <Button
          variant="primary"
          icon={<Plus size={16} />}
          onClick={() => alert('Add Task modal will be connected to Dexie repository in Sprint 4.')}
        >
          Add Task
        </Button>
      </div>

      {/* Main Task Management Card */}
      <Card variant="elevated" className="space-y-4">
        {/* Filter Segments */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-boundary">
          <div className="flex items-center gap-1 bg-bg-secondary p-1 rounded-md border border-boundary/60 text-xs">
            {(['today', 'upcoming', 'completed'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setFilter(tab)}
                className={`px-3 py-1 rounded capitalize font-medium transition-colors ${
                  filter === tab
                    ? 'bg-accent-primary text-white font-semibold'
                    : 'text-content-secondary hover:text-content-primary'
                }`}
              >
                {tab} Tasks
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2 text-xs text-content-muted">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-status-error" /> Urgent
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-status-warning" /> High
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-accent-primary" /> Medium
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-content-muted" /> Low
            </span>
          </div>
        </div>

        {/* Empty State */}
        <EmptyState
          icon={<ListTodo size={28} />}
          title={`No ${filter} tasks found`}
          description={
            filter === 'today'
              ? 'You have zero pending tasks for today. Plan your day by adding your highest-priority objective.'
              : filter === 'upcoming'
              ? 'No scheduled upcoming tasks on your calendar.'
              : 'You have not completed any tasks yet.'
          }
          action={
            <Button
              size="sm"
              variant="outline"
              icon={<Plus size={14} />}
              onClick={() => alert('Add Task modal will be connected to Dexie repository in Sprint 4.')}
            >
              Add New Task
            </Button>
          }
        />
      </Card>
    </div>
  );
};
