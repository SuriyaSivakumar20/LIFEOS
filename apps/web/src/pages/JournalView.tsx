import React, { useState } from 'react';
import { BookOpen, Plus, Search, Smile, Heart, Meh, Frown, AlertCircle } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { SectionHeader } from '../components/ui/SectionHeader';
import { EmptyState } from '../components/ui/EmptyState';

export const JournalView: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');

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
          onClick={() => alert('New Journal Entry modal will be connected to Dexie repository in Sprint 4.')}
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
              placeholder="Search entries, keywords, tags..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 rounded-md bg-bg-secondary border border-boundary text-xs text-content-primary placeholder:text-content-muted focus:outline-none focus:ring-1 focus:ring-accent-primary"
            />
          </div>

          <div className="flex items-center gap-1.5 text-xs text-content-muted">
            <span className="text-[11px] font-medium mr-1">Mood Filter:</span>
            <span className="px-2 py-1 rounded bg-bg-secondary border border-boundary/60 text-content-secondary cursor-pointer hover:text-content-primary">
              All
            </span>
            <span className="px-2 py-1 rounded bg-bg-secondary border border-boundary/60 text-content-secondary cursor-pointer hover:text-content-primary">
              Great
            </span>
            <span className="px-2 py-1 rounded bg-bg-secondary border border-boundary/60 text-content-secondary cursor-pointer hover:text-content-primary">
              Good
            </span>
            <span className="px-2 py-1 rounded bg-bg-secondary border border-boundary/60 text-content-secondary cursor-pointer hover:text-content-primary">
              Neutral
            </span>
          </div>
        </div>

        {/* Empty State */}
        <EmptyState
          icon={<BookOpen size={28} />}
          title="No journal entries yet"
          description="Your personal journal is completely blank. Write down your daily reflections, thoughts, and mood logs."
          action={
            <Button
              size="sm"
              variant="outline"
              icon={<Plus size={14} />}
              onClick={() => alert('New Journal Entry modal will be connected to Dexie repository in Sprint 4.')}
            >
              Write First Reflection
            </Button>
          }
        />
      </Card>
    </div>
  );
};
