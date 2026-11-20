import React from 'react';
import { Link } from 'react-router-dom';
import {
  Wallet,
  Calendar,
  Flame,
  Sparkles,
  ArrowUpRight,
  ArrowDownLeft,
  RotateCcw,
  Plus,
  CheckCircle2,
  Bell,
  Clock,
  ShieldCheck,
  Check,
} from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { SectionHeader } from '../components/ui/SectionHeader';
import { useAppStore } from '../stores/use-app-store';
import { formatMinorUnits, formatLocalDateString } from '@lifeos/core';

export const HomeView: React.FC = () => {
  const {
    userProfile,
    financialSummary,
    tasks,
    habits,
    reminders,
    toggleTaskStatus,
    toggleHabitToday,
  } = useAppStore();

  const now = new Date();
  const hours = now.getHours();
  const greeting =
    hours < 12 ? 'Good morning' : hours < 18 ? 'Good afternoon' : 'Good evening';

  const formattedDate = now.toLocaleDateString('en-IN', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  const currency = userProfile?.currency || 'INR';
  const todayStr = formatLocalDateString(now);
  const todayTasks = tasks.filter((t) => !t.dueDate || t.dueDate.startsWith(todayStr));
  const pendingTasks = todayTasks.filter((t) => t.status === 'pending');
  const completedHabitsCount = habits.filter((h) => h.isCompletedToday).length;

  return (
    <div className="space-y-6">
      {/* Top Banner / Greeting */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-boundary">
        <div>
          <span className="text-xs font-semibold text-accent-primary uppercase tracking-wider">
            Dashboard
          </span>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-content-primary">
            {greeting}, {userProfile?.name || 'User'}
          </h1>
          <p className="text-xs md:text-sm text-content-secondary mt-1 flex items-center gap-2">
            <Clock size={14} className="text-accent-primary" />
            <span>{formattedDate}</span>
            <span>•</span>
            <span className="flex items-center gap-1 text-status-success font-medium">
              <ShieldCheck size={14} /> 100% Local-First
            </span>
          </p>
        </div>

        {/* Quick Assistant Entry */}
        <Link to="/alfred">
          <Button
            variant="primary"
            icon={<Sparkles size={16} />}
            className="w-full md:w-auto"
          >
            Ask Alfred
          </Button>
        </Link>
      </div>

      {/* Grid: Financial Card + Alfred Suggestions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Financial Overview (2 cols on lg) */}
        <Card className="lg:col-span-2 space-y-4" variant="elevated">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-content-secondary">
              <Wallet size={18} className="text-accent-primary" />
              <span className="text-xs font-medium uppercase tracking-wider">
                Financial Balance ({currency})
              </span>
            </div>
            <Link to="/money">
              <Button variant="ghost" size="sm" className="text-xs">
                View Ledger →
              </Button>
            </Link>
          </div>

          <div>
            <div className="text-3xl md:text-4xl font-extrabold text-content-primary tracking-tight">
              {formatMinorUnits(financialSummary.availableBalanceMinor, currency)}
            </div>
            <p className="text-xs text-content-muted mt-0.5">
              Available balance computed from {financialSummary.transactionCount} stored records
            </p>
          </div>

          <div className="grid grid-cols-3 gap-3 pt-3 border-t border-boundary">
            <div className="p-2.5 rounded-md bg-bg-secondary border border-boundary/40">
              <div className="flex items-center gap-1 text-[11px] text-content-secondary mb-1">
                <ArrowDownLeft size={13} className="text-status-success" />
                <span>Income</span>
              </div>
              <div className="text-sm font-bold text-status-success">
                {formatMinorUnits(financialSummary.totalIncomeMinor, currency)}
              </div>
            </div>

            <div className="p-2.5 rounded-md bg-bg-secondary border border-boundary/40">
              <div className="flex items-center gap-1 text-[11px] text-content-secondary mb-1">
                <ArrowUpRight size={13} className="text-status-warning" />
                <span>Expenses</span>
              </div>
              <div className="text-sm font-bold text-status-warning">
                {formatMinorUnits(financialSummary.totalExpensesMinor, currency)}
              </div>
            </div>

            <div className="p-2.5 rounded-md bg-bg-secondary border border-boundary/40">
              <div className="flex items-center gap-1 text-[11px] text-content-secondary mb-1">
                <RotateCcw size={13} className="text-accent-primary" />
                <span>Refunds</span>
              </div>
              <div className="text-sm font-bold text-accent-primary">
                {formatMinorUnits(financialSummary.totalRefundsMinor, currency)}
              </div>
            </div>
          </div>
        </Card>

        {/* Alfred Quick Suggestions */}
        <Card className="space-y-3" variant="secondary">
          <div className="flex items-center gap-2 text-accent-primary">
            <Sparkles size={18} />
            <h3 className="text-sm font-semibold text-content-primary">
              Alfred Suggestions
            </h3>
          </div>
          <p className="text-xs text-content-secondary leading-relaxed">
            Local AI recommendations based on your stored habits, finances, and schedule.
          </p>

          <div className="space-y-2 pt-1">
            <Link
              to="/alfred"
              className="block p-2.5 rounded-md bg-bg-elevated hover:border-accent-primary border border-boundary transition-colors text-xs font-medium text-content-primary"
            >
              "Summarize my tasks and upcoming reminders"
            </Link>
            <Link
              to="/alfred"
              className="block p-2.5 rounded-md bg-bg-elevated hover:border-accent-primary border border-boundary transition-colors text-xs font-medium text-content-primary"
            >
              "Analyze my spending breakdown this week"
            </Link>
            <Link
              to="/alfred"
              className="block p-2.5 rounded-md bg-bg-elevated hover:border-accent-primary border border-boundary transition-colors text-xs font-medium text-content-primary"
            >
              "Show my active habit streaks"
            </Link>
          </div>
        </Card>
      </div>

      {/* Grid: Tasks & Habits & Reminders */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {/* Today's Tasks */}
        <Card variant="elevated" className="space-y-3">
          <SectionHeader
            title="Today's Tasks"
            subtitle={`${pendingTasks.length} pending`}
            action={
              <Link to="/planner">
                <Button variant="ghost" size="sm">Manage</Button>
              </Link>
            }
          />
          {pendingTasks.length > 0 ? (
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {pendingTasks.slice(0, 4).map((task) => (
                <div
                  key={task.id}
                  onClick={() => toggleTaskStatus(task.id)}
                  className="flex items-center justify-between p-2 rounded-md bg-bg-secondary hover:bg-bg-elevated border border-boundary/40 cursor-pointer transition-colors"
                >
                  <span className="text-xs text-content-primary truncate mr-2">
                    {task.title}
                  </span>
                  <Badge
                    variant={
                      task.priority === 'urgent'
                        ? 'error'
                        : task.priority === 'high'
                        ? 'warning'
                        : 'neutral'
                    }
                    size="sm"
                  >
                    {task.priority}
                  </Badge>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-4 rounded-md bg-bg-secondary/60 border border-boundary/40 text-center space-y-2">
              <CheckCircle2 size={24} className="mx-auto text-status-success" />
              <p className="text-xs text-content-secondary">
                All caught up! No pending tasks for today.
              </p>
              <Link to="/planner">
                <Button size="sm" variant="outline" icon={<Plus size={14} />}>
                  Add Task
                </Button>
              </Link>
            </div>
          )}
        </Card>

        {/* Habits Status */}
        <Card variant="elevated" className="space-y-3">
          <SectionHeader
            title="Habit Streaks"
            subtitle={`${completedHabitsCount}/${habits.length} done today`}
            action={
              <Link to="/habits">
                <Button variant="ghost" size="sm">Manage</Button>
              </Link>
            }
          />
          {habits.length > 0 ? (
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {habits.slice(0, 4).map((habit) => (
                <div
                  key={habit.id}
                  onClick={() => toggleHabitToday(habit.id)}
                  className="flex items-center justify-between p-2 rounded-md bg-bg-secondary hover:bg-bg-elevated border border-boundary/40 cursor-pointer transition-colors"
                >
                  <div className="flex items-center gap-2 truncate mr-2">
                    <span
                      className={`w-4 h-4 rounded-full flex items-center justify-center border text-[10px] ${
                        habit.isCompletedToday
                          ? 'bg-status-success border-status-success text-white'
                          : 'border-boundary text-transparent'
                      }`}
                    >
                      ✓
                    </span>
                    <span className="text-xs text-content-primary truncate">{habit.title}</span>
                  </div>
                  <span className="text-xs font-semibold text-accent-primary shrink-0">
                    🔥 {habit.streakCount}d
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-4 rounded-md bg-bg-secondary/60 border border-boundary/40 text-center space-y-2">
              <Flame size={24} className="mx-auto text-content-muted" />
              <p className="text-xs text-content-secondary">
                No active habits tracked yet.
              </p>
              <Link to="/habits">
                <Button size="sm" variant="outline" icon={<Plus size={14} />}>
                  Create Habit
                </Button>
              </Link>
            </div>
          )}
        </Card>

        {/* In-App Reminders */}
        <Card variant="elevated" className="space-y-3 md:col-span-2 lg:col-span-1">
          <SectionHeader
            title="Reminders"
            subtitle={`${reminders.length} active`}
            action={<Badge variant="accent">In-App Alerts</Badge>}
          />
          {reminders.length > 0 ? (
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {reminders.map((rem) => (
                <div
                  key={rem.id}
                  className="p-2 rounded-md bg-bg-secondary border border-boundary/40 text-xs text-content-primary"
                >
                  <div className="font-medium">{rem.title}</div>
                  <div className="text-[10px] text-content-muted mt-0.5">
                    {new Date(rem.targetTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-4 rounded-md bg-bg-secondary/60 border border-boundary/40 text-center space-y-2">
              <Bell size={24} className="mx-auto text-content-muted" />
              <p className="text-xs text-content-secondary">
                No pending reminders.
              </p>
              <p className="text-[11px] text-content-muted">
                Reminders notify you while the app is active with realistic browser fallbacks.
              </p>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};
