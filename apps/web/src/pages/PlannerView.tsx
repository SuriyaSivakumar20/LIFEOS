import React, { useState } from 'react';
import {
  Calendar,
  CheckCircle2,
  Clock,
  Plus,
  ListTodo,
  Trash2,
  X,
  Circle,
} from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { SectionHeader } from '../components/ui/SectionHeader';
import { EmptyState } from '../components/ui/EmptyState';
import { useAppStore } from '../stores/use-app-store';
import { formatLocalDateString } from '@lifeos/core';
import type { TaskPriority } from '@lifeos/shared-types';

export const PlannerView: React.FC = () => {
  const { tasks, addTask, toggleTaskStatus, deleteTask } = useAppStore();
  const [filter, setFilter] = useState<'today' | 'upcoming' | 'completed'>('today');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Form State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<TaskPriority>('medium');
  const [dueDate, setDueDate] = useState(formatLocalDateString(new Date()));
  const [isSubmitting, setIsSubmitting] = useState(false);

  const todayStr = formatLocalDateString(new Date());

  const filteredTasks = tasks.filter((task) => {
    if (filter === 'completed') {
      return task.status === 'completed';
    }
    if (filter === 'today') {
      return task.status !== 'completed' && (!task.dueDate || task.dueDate.startsWith(todayStr));
    }
    if (filter === 'upcoming') {
      return task.status !== 'completed' && task.dueDate && !task.dueDate.startsWith(todayStr);
    }
    return true;
  });

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    setIsSubmitting(true);
    try {
      await addTask({
        title: title.trim(),
        description: description.trim() || null,
        priority,
        status: 'pending',
        dueDate: dueDate ? new Date(dueDate).toISOString() : null,
        completedAt: null,
      });

      setTitle('');
      setDescription('');
      setIsAddModalOpen(false);
    } catch (err) {
      alert('Failed to save task: ' + (err instanceof Error ? err.message : String(err)));
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
          onClick={() => setIsAddModalOpen(true)}
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
                {tab} Tasks ({tasks.filter((t) => {
                  if (tab === 'completed') return t.status === 'completed';
                  if (tab === 'today') return t.status !== 'completed' && (!t.dueDate || t.dueDate.startsWith(todayStr));
                  return t.status !== 'completed' && t.dueDate && !t.dueDate.startsWith(todayStr);
                }).length})
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

        {/* Task List */}
        {filteredTasks.length > 0 ? (
          <div className="divide-y divide-boundary">
            {filteredTasks.map((task) => (
              <div
                key={task.id}
                className="py-3 flex items-center justify-between hover:bg-bg-secondary/40 px-2 rounded-md transition-colors"
              >
                <div className="flex items-start gap-3">
                  <button
                    onClick={() => toggleTaskStatus(task.id)}
                    className="mt-0.5 text-content-secondary hover:text-accent-primary transition-colors"
                    title={task.status === 'completed' ? 'Mark pending' : 'Mark completed'}
                  >
                    {task.status === 'completed' ? (
                      <CheckCircle2 size={18} className="text-status-success" />
                    ) : (
                      <Circle size={18} />
                    )}
                  </button>
                  <div>
                    <div
                      className={`text-sm font-medium ${
                        task.status === 'completed'
                          ? 'line-through text-content-muted'
                          : 'text-content-primary'
                      }`}
                    >
                      {task.title}
                    </div>
                    {task.description && (
                      <p className="text-xs text-content-secondary mt-0.5">{task.description}</p>
                    )}
                    {task.dueDate && (
                      <div className="text-[11px] text-content-muted flex items-center gap-1 mt-1">
                        <Clock size={11} />
                        <span>Due: {new Date(task.dueDate).toLocaleDateString()}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <Badge
                    variant={
                      task.priority === 'urgent'
                        ? 'error'
                        : task.priority === 'high'
                        ? 'warning'
                        : task.priority === 'medium'
                        ? 'accent'
                        : 'neutral'
                    }
                    size="sm"
                  >
                    {task.priority}
                  </Badge>
                  <button
                    onClick={() => deleteTask(task.id)}
                    className="p-1 rounded text-content-muted hover:text-status-error transition-colors"
                    title="Delete task"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
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
                onClick={() => setIsAddModalOpen(true)}
              >
                Add New Task
              </Button>
            }
          />
        )}
      </Card>

      {/* Add Task Modal */}
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
                Add New Task
              </h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1 rounded text-content-muted hover:text-content-primary"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateTask} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-content-secondary mb-1">
                  Task Title
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Review Sprint 3 deliverables"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-md bg-bg-secondary border border-boundary text-sm text-content-primary focus:outline-none focus:ring-1 focus:ring-accent-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-content-secondary mb-1">
                  Description (Optional)
                </label>
                <textarea
                  rows={2}
                  placeholder="Additional context or checklist items"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3 py-2 rounded-md bg-bg-secondary border border-boundary text-sm text-content-primary focus:outline-none focus:ring-1 focus:ring-accent-primary resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-content-secondary mb-1">
                    Priority
                  </label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as TaskPriority)}
                    className="w-full px-3 py-2 rounded-md bg-bg-secondary border border-boundary text-sm text-content-primary focus:outline-none focus:ring-1 focus:ring-accent-primary capitalize"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-content-secondary mb-1">
                    Due Date
                  </label>
                  <input
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
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
                  Create Task
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
