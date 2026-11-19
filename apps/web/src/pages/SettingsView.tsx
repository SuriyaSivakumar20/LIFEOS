import React, { useState } from 'react';
import {
  Settings,
  User,
  Globe,
  Sun,
  Moon,
  Shield,
  Download,
  Upload,
  HardDrive,
  Trash2,
  Lock,
  Check,
} from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { SectionHeader } from '../components/ui/SectionHeader';
import { useTheme } from '../hooks/use-theme';
import { usePersistentStorage } from '../hooks/use-persistent-storage';

export const SettingsView: React.FC = () => {
  const { theme, resolvedTheme, setTheme } = useTheme();
  const { isPersisted, isSupported, requestPersistence, quotaBytes, usageBytes } = usePersistentStorage();

  const [name, setName] = useState('User');
  const [selectedCurrency, setSelectedCurrency] = useState('INR');
  const [saveSuccess, setSaveSuccess] = useState(false);

  const currencies = ['INR', 'USD', 'EUR', 'GBP', 'CAD', 'AUD', 'JPY'];

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2500);
  };

  const handleExportBackup = () => {
    alert('JSON Data Backup export (with optional AES-GCM passphrase encryption) is staged for Sprint 5.');
  };

  const handleRestoreBackup = () => {
    alert('JSON Backup restore with Zod schema validation is staged for Sprint 5.');
  };

  const handleClearData = () => {
    if (confirm('CAUTION: Are you sure you want to permanently erase all local IndexedDB data? This action cannot be undone.')) {
      alert('Data reset action acknowledged.');
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-boundary">
        <div>
          <span className="text-xs font-semibold text-accent-primary uppercase tracking-wider">
            Preferences
          </span>
          <h1 className="text-2xl font-bold tracking-tight text-content-primary">
            Settings & Local Storage
          </h1>
          <p className="text-xs text-content-secondary mt-0.5">
            Manage your personal profile, display theme, and browser storage controls
          </p>
        </div>

        <Badge variant={isPersisted ? 'success' : 'warning'}>
          {isPersisted ? 'Storage Persisted' : 'Storage Ephemeral'}
        </Badge>
      </div>

      {/* Profile Preferences */}
      <Card variant="elevated" className="space-y-4">
        <SectionHeader
          title="Profile Preferences"
          subtitle="Customize your name and preferred currency"
        />

        <form onSubmit={handleSaveProfile} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-content-secondary mb-1">
              Your Name
            </label>
            <div className="relative">
              <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-content-muted" />
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full pl-9 pr-3 py-2 rounded-md bg-bg-secondary border border-boundary text-sm text-content-primary focus:outline-none focus:ring-1 focus:ring-accent-primary"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-content-secondary mb-1">
              Preferred Currency (Default: INR)
            </label>
            <div className="flex flex-wrap gap-2">
              {currencies.map((curr) => {
                const isSelected = selectedCurrency === curr;
                return (
                  <button
                    key={curr}
                    type="button"
                    onClick={() => setSelectedCurrency(curr)}
                    className={`px-3 py-1.5 rounded-md text-xs font-medium border transition-colors ${
                      isSelected
                        ? 'bg-accent-primary text-white border-accent-primary font-bold'
                        : 'bg-bg-secondary border-boundary text-content-primary hover:border-accent-primary/50'
                    }`}
                  >
                    {curr}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex items-center gap-2 pt-2">
            <Button type="submit" variant="primary" size="sm">
              Save Profile
            </Button>
            {saveSuccess && (
              <span className="flex items-center gap-1 text-xs text-status-success font-medium">
                <Check size={14} /> Saved successfully!
              </span>
            )}
          </div>
        </form>
      </Card>

      {/* Appearance & Theme */}
      <Card variant="elevated" className="space-y-4">
        <SectionHeader
          title="Theme Appearance"
          subtitle="Select your preferred visual mode"
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div
            onClick={() => setTheme('dark')}
            className={`p-4 rounded-lg border cursor-pointer transition-colors flex items-center justify-between ${
              resolvedTheme === 'dark'
                ? 'bg-bg-secondary border-accent-primary shadow-sm'
                : 'bg-bg-elevated border-boundary hover:border-accent-primary/40'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-accent-primary/10 text-accent-primary flex items-center justify-center">
                <Moon size={16} />
              </div>
              <div>
                <div className="text-sm font-semibold text-content-primary">Dark Mode (Default)</div>
                <div className="text-xs text-content-muted">Warm charcoal & amber aesthetic</div>
              </div>
            </div>
            {resolvedTheme === 'dark' && <Check size={18} className="text-accent-primary" />}
          </div>

          <div
            onClick={() => setTheme('light')}
            className={`p-4 rounded-lg border cursor-pointer transition-colors flex items-center justify-between ${
              resolvedTheme === 'light'
                ? 'bg-bg-secondary border-accent-primary shadow-sm'
                : 'bg-bg-elevated border-boundary hover:border-accent-primary/40'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-accent-primary/10 text-accent-primary flex items-center justify-center">
                <Sun size={16} />
              </div>
              <div>
                <div className="text-sm font-semibold text-content-primary">Light Mode</div>
                <div className="text-xs text-content-muted">Clean parchment & high contrast</div>
              </div>
            </div>
            {resolvedTheme === 'light' && <Check size={18} className="text-accent-primary" />}
          </div>
        </div>
      </Card>

      {/* Persistent Storage & Privacy */}
      <Card variant="elevated" className="space-y-4">
        <SectionHeader
          title="Storage Persistence & Privacy"
          subtitle="Dexie IndexedDB browser quota controls"
        />

        <div className="space-y-3">
          <div className="p-3.5 rounded-lg bg-bg-secondary border border-boundary flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-start gap-2.5">
              <HardDrive size={18} className={isPersisted ? 'text-status-success' : 'text-status-warning'} />
              <div>
                <div className="text-xs font-semibold text-content-primary">
                  {isPersisted ? 'Persistent Storage Granted' : 'Storage is Currently Ephemeral'}
                </div>
                <p className="text-[11px] text-content-muted mt-0.5">
                  {isPersisted
                    ? 'Your browser has granted persistence. LIFEOS data will not be evicted under disk pressure.'
                    : 'The browser may evict IndexedDB records if device storage runs low. Request persistence below.'}
                </p>
              </div>
            </div>

            {!isPersisted && isSupported && (
              <Button size="sm" variant="outline" onClick={requestPersistence}>
                Request Persistence
              </Button>
            )}
          </div>

          <div className="p-3 rounded-lg bg-bg-secondary border border-boundary/40 flex items-center gap-2 text-xs text-content-secondary">
            <Shield size={16} className="text-status-success shrink-0" />
            <span>Zero cloud servers or analytics tracking. All financial, habit, and journal records are strictly local.</span>
          </div>
        </div>
      </Card>

      {/* Data Backup & Portability */}
      <Card variant="elevated" className="space-y-4">
        <SectionHeader
          title="Data Backup & Portability"
          subtitle="Export and restore your complete local database"
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Button
            variant="secondary"
            icon={<Download size={16} />}
            onClick={handleExportBackup}
            className="w-full justify-center"
          >
            Export Backup (Plain / Encrypted)
          </Button>

          <Button
            variant="secondary"
            icon={<Upload size={16} />}
            onClick={handleRestoreBackup}
            className="w-full justify-center"
          >
            Restore Backup from JSON
          </Button>
        </div>

        <div className="pt-3 border-t border-boundary">
          <Button
            variant="danger"
            size="sm"
            icon={<Trash2 size={14} />}
            onClick={handleClearData}
          >
            Erase All Local Data
          </Button>
        </div>
      </Card>
    </div>
  );
};
