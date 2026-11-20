import React, { useState } from 'react';
import { BookOpen, Plus, Search, Trash2, X } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { SectionHeader } from '../components/ui/SectionHeader';
import { EmptyState } from '../components/ui/EmptyState';
import { useAppStore } from '../stores/use-app-store';
import type { JournalMood } from '@lifeos/shared-types';

export const JournalView: React.FC = () => {
  const { journalEntries, addJournalEntry, deleteJournalEntry } = useAppStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [moodFilter, setMoodFilter] = useState<string>('all');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Form State
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [mood, setMood] = useState<JournalMood>('good');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const filteredEntries = journalEntries.filter((entry) => {
    const matchesSearch =
      entry.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      entry.content.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesMood = moodFilter === 'all' || entry.mood === moodFilter;
    return matchesSearch && matchesMood;
  });

  const handleCreateEntry = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;

    setIsSubmitting(true);
    try {
      await addJournalEntry({
        title: title.trim(),
        content: content.trim(),
        mood,
        tags: [],
      });

      setTitle('');
      setContent('');
      setIsAddModalOpen(false);
    } catch (err) {
      alert('Failed to save journal entry: ' + (err instanceof Error ? err.message : String(err)));
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
            Reflections
          </span>
          <h1 className="text-2xl font-bold tracking-tight text-content-primary">
            Personal Journal
          </h1>
          <p className="text-xs text-content-secondary mt-0.5">
            Private, unencrypted or encrypted reflections saved 100% locally on this device
          </p>
        </div>

        <Button
          variant="primary"
          icon={<Plus size={16} />}
          onClick={() => setIsAddModalOpen(true)}
        >
          New Entry
        </Button>
      </div>

      {/* Search & Mood Filter Bar */}
      <Card variant="elevated" className="space-y-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative w-full sm:w-72">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-content-muted" />
            <input
              type="text"
              placeholder="Search entries, keywords..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 rounded-md bg-bg-secondary border border-boundary text-xs text-content-primary placeholder:text-content-muted focus:outline-none focus:ring-1 focus:ring-accent-primary"
            />
          </div>

          <div className="flex items-center gap-1.5 text-xs text-content-muted flex-wrap">
            <span className="text-[11px] font-medium mr-1">Mood:</span>
            {(['all', 'great', 'good', 'neutral', 'bad', 'awful'] as const).map((m) => (
              <button
                key={m}
                onClick={() => setMoodFilter(m)}
                className={`px-2 py-0.5 rounded capitalize transition-colors ${
                  moodFilter === m
                    ? 'bg-accent-primary text-white font-semibold'
                    : 'bg-bg-secondary text-content-secondary hover:text-content-primary'
                }`}
              >
                {m}
              </button>
            ))}
          </div>
        </div>

        {/* Entries List */}
        {filteredEntries.length > 0 ? (
          <div className="divide-y divide-boundary">
            {filteredEntries.map((entry) => (
              <div
                key={entry.id}
                className="py-4 space-y-2 hover:bg-bg-secondary/40 px-2 rounded-md transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold text-content-primary">
                      {entry.title}
                    </h3>
                    {entry.mood && (
                      <Badge
                        variant={
                          entry.mood === 'great' || entry.mood === 'good'
                            ? 'success'
                            : entry.mood === 'neutral'
                            ? 'neutral'
                            : 'error'
                        }
                        size="sm"
                      >
                        {entry.mood}
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] text-content-muted">
                      {new Date(entry.createdAt).toLocaleDateString()}
                    </span>
                    <button
                      onClick={() => deleteJournalEntry(entry.id)}
                      className="p-1 rounded text-content-muted hover:text-status-error transition-colors"
                      title="Delete entry"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
                <p className="text-xs text-content-secondary whitespace-pre-wrap leading-relaxed">
                  {entry.content}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState
            icon={<BookOpen size={28} />}
            title="No journal entries found"
            description={
              searchQuery || moodFilter !== 'all'
                ? 'No entries match your search query or mood filter.'
                : 'Your personal journal is completely blank. Write down your daily reflections, thoughts, and mood logs.'
            }
            action={
              <Button
                size="sm"
                variant="outline"
                icon={<Plus size={14} />}
                onClick={() => setIsAddModalOpen(true)}
              >
                Write First Reflection
              </Button>
            }
          />
        )}
      </Card>

      {/* Add Entry Modal */}
      {isAddModalOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setIsAddModalOpen(false)}
        >
          <div
            className="bg-bg-elevated border border-boundary rounded-lg max-w-lg w-full p-6 space-y-4 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-2 border-b border-boundary">
              <h3 className="text-base font-bold text-content-primary">
                New Journal Reflection
              </h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1 rounded text-content-muted hover:text-content-primary"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateEntry} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-content-secondary mb-1">
                  Title
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Evening reflections, Weekly milestones"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-md bg-bg-secondary border border-boundary text-sm text-content-primary focus:outline-none focus:ring-1 focus:ring-accent-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-content-secondary mb-1">
                  Mood
                </label>
                <select
                  value={mood}
                  onChange={(e) => setMood(e.target.value as JournalMood)}
                  className="w-full px-3 py-2 rounded-md bg-bg-secondary border border-boundary text-sm text-content-primary focus:outline-none focus:ring-1 focus:ring-accent-primary capitalize"
                >
                  <option value="great">Great</option>
                  <option value="good">Good</option>
                  <option value="neutral">Neutral</option>
                  <option value="bad">Bad</option>
                  <option value="awful">Awful</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-content-secondary mb-1">
                  Reflection Content
                </label>
                <textarea
                  rows={5}
                  required
                  placeholder="What happened today? What went well, and what did you learn?"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="w-full px-3 py-2 rounded-md bg-bg-secondary border border-boundary text-sm text-content-primary focus:outline-none focus:ring-1 focus:ring-accent-primary resize-none"
                />
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
                  Save Reflection
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
