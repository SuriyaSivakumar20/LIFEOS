import React, { useState } from 'react';
import { Flame, Plus, CheckCircle2, Award, Trash2, X } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { SectionHeader } from '../components/ui/SectionHeader';
import { EmptyState } from '../components/ui/EmptyState';
import { useAppStore } from '../stores/use-app-store';

export const HabitsView: React.FC = () => {
  const { habits, addHabit, toggleHabitToday, deleteHabit } = useAppStore();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Form State
  const [title, setTitle] = useState('');
  const [frequency, setFrequency] = useState<'daily' | 'weekly'>('daily');
  const [targetDays, setTargetDays] = useState(7);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const completedTodayCount = habits.filter((h) => h.isCompletedToday).length;
  const bestStreak = habits.reduce((max, h) => Math.max(max, h.bestStreak || h.streakCount), 0);

  const handleCreateHabit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    setIsSubmitting(true);
    try {
      await addHabit({
        title: title.trim(),
        frequency,
        targetDaysPerWeek: Number(targetDays),
        isArchived: false,
      });

      setTitle('');
      setIsAddModalOpen(false);
    } catch (err) {
      alert('Failed to save habit: ' + (err instanceof Error ? err.message : String(err)));
    } finally {
      setIsSubmitting(false);
    }
  };

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
          onClick={() => setIsAddModalOpen(true)}
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
            {habits.length}
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
            {completedTodayCount} / {habits.length}
          </div>
          <p className="text-[11px] text-content-muted">
            Today's completion rate:{' '}
            {habits.length > 0
              ? Math.round((completedTodayCount / habits.length) * 100)
              : 0}
            %
          </p>
        </Card>

        <Card variant="elevated" className="space-y-1">
          <div className="flex items-center gap-2 text-xs font-medium text-status-warning">
            <Award size={15} /> Longest Active Streak
          </div>
          <div className="text-2xl font-extrabold text-status-warning">
            {bestStreak} days
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

        {habits.length > 0 ? (
          <div className="divide-y divide-boundary">
            {habits.map((habit) => (
              <div
                key={habit.id}
                className="py-3 flex items-center justify-between hover:bg-bg-secondary/40 px-2 rounded-md transition-colors"
              >
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => toggleHabitToday(habit.id)}
                    className={`w-6 h-6 rounded-md flex items-center justify-center border font-bold text-xs transition-colors ${habit.isCompletedToday
                      ? 'bg-status-success border-status-success text-white'
                      : 'border-boundary text-transparent hover:border-accent-primary'
                      }`}
                    title={habit.isCompletedToday ? 'Mark incomplete for today' : 'Mark done for today'}
                  >
                    ✓
                  </button>
                  <div>
                    <div className="text-sm font-semibold text-content-primary">
                      {habit.title}
                    </div>
                    <div className="text-[11px] text-content-muted mt-0.5">
                      Target: {habit.targetDaysPerWeek} days/week • {habit.frequency}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <span className="text-sm font-bold text-accent-primary">
                      🔥 {habit.streakCount} days
                    </span>
                    <div className="text-[10px] text-content-muted">
                      Best: {habit.bestStreak || habit.streakCount}d
                    </div>
                  </div>
                  <button
                    onClick={() => deleteHabit(habit.id)}
                    className="p-1 rounded text-content-muted hover:text-status-error transition-colors"
                    title="Delete habit"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState
            icon={<Flame size={28} />}
            title="No habits created yet"
            description="Start small by building one positive habit. LIFEOS calculates streaks accurately with yesterday grace period tolerance."
            action={
              <Button
                size="sm"
                variant="outline"
                icon={<Plus size={14} />}
                onClick={() => setIsAddModalOpen(true)}
              >
                Add First Habit
              </Button>
            }
          />
        )}
      </Card>

      {/* Add Habit Modal */}
      {isAddModalOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setIsAddModalOpen(false)}
        >
          <div
            className="bg-bg-elevated border border-boundary rounded-lg max-w-md w-full p-6 space-y-4 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-2 border-b border-boundary">
              <h3 className="text-base font-bold text-content-primary">
                Create New Habit
              </h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1 rounded text-content-muted hover:text-content-primary"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateHabit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-content-secondary mb-1">
                  Habit Title
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Read 20 pages, Morning workout"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-md bg-bg-secondary border border-boundary text-sm text-content-primary focus:outline-none focus:ring-1 focus:ring-accent-primary"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-content-secondary mb-1">
                    Frequency
                  </label>
                  <select
                    value={frequency}
                    onChange={(e) => setFrequency(e.target.value as 'daily' | 'weekly')}
                    className="w-full px-3 py-2 rounded-md bg-bg-secondary border border-boundary text-sm text-content-primary focus:outline-none focus:ring-1 focus:ring-accent-primary capitalize"
                  >
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-content-secondary mb-1">
                    Target Days/Week (1-7)
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={7}
                    required
                    value={targetDays}
                    onChange={(e) => setTargetDays(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-md bg-bg-secondary border border-boundary text-sm text-content-primary focus:outline-none focus:ring-1 focus:ring-accent-primary"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-boundary">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setIsAddModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  isLoading={isSubmitting}
                >
                  Save Habit
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
