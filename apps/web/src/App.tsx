import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './hooks/use-theme';
import { AppShell } from './components/layout/AppShell';
import { useAppStore } from './stores/use-app-store';

import { HomeView } from './pages/HomeView';
import { MoneyView } from './pages/MoneyView';
import { PlannerView } from './pages/PlannerView';
import { HabitsView } from './pages/HabitsView';
import { JournalView } from './pages/JournalView';
import { AlfredView } from './pages/AlfredView';
import { InsightsView } from './pages/InsightsView';
import { SettingsView } from './pages/SettingsView';

export const App: React.FC = () => {
  const {
    init,
    isInitializing,
    isDbReady,
    dbError,
    actionError,
    clearActionError,
    retryInit,
    resetDatabaseSafely,
  } = useAppStore();

  useEffect(() => {
    init();
  }, [init]);

  // 1. Dedicated Initial Loading State: Prevents any database-dependent interaction
  if (isInitializing) {
    return (
      <ThemeProvider>
        <div className="min-h-screen bg-bg-primary text-content-primary flex flex-col items-center justify-center p-6 select-none">
          <div className="w-16 h-16 rounded-2xl bg-accent-primary/10 border border-accent-primary/30 flex items-center justify-center text-accent-primary mb-6 animate-pulse shadow-lg shadow-accent-primary/5">
            <span className="text-2xl font-black tracking-wider">L</span>
          </div>
          <h1 className="text-xl font-bold tracking-tight mb-2 text-content-primary">
            Starting LIFEOS
          </h1>
          <p className="text-xs text-content-secondary mb-6 text-center max-w-sm leading-relaxed">
            Initializing local IndexedDB persistence and verifying database schema integrity...
          </p>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-bg-elevated border border-boundary text-[11px] text-content-muted">
            <div className="w-2 h-2 rounded-full bg-accent-primary animate-ping" />
            <span>Local-First • Zero Cloud Dependency</span>
          </div>
        </div>
      </ThemeProvider>
    );
  }

  // 2. Fatal Database Error State: Prevents uninitialized/corrupt usage and provides safe recovery
  if (!isDbReady && dbError) {
    return (
      <ThemeProvider>
        <div className="min-h-screen bg-bg-primary text-content-primary flex flex-col items-center justify-center p-6">
          <div className="max-w-md w-full bg-bg-secondary border border-status-error/40 rounded-xl p-6 text-center space-y-4 shadow-xl">
            <div className="w-12 h-12 rounded-full bg-status-error/20 text-status-error flex items-center justify-center mx-auto">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>
            <h2 className="text-lg font-bold text-content-primary">
              Database Initialization Failed
            </h2>
            <div className="text-xs text-status-error bg-status-error/10 p-3 rounded-lg border border-status-error/20 font-mono text-left break-all max-h-32 overflow-y-auto">
              {dbError}
            </div>
            <p className="text-xs text-content-secondary leading-relaxed">
              LIFEOS requires local browser IndexedDB storage to persist transactions, tasks, habits, and journals offline.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <button
                onClick={retryInit}
                className="w-full sm:w-auto px-4 py-2 bg-accent-primary hover:bg-accent-hover text-white rounded-lg text-sm font-semibold transition-colors"
              >
                Retry Initialization
              </button>
              <button
                onClick={resetDatabaseSafely}
                className="w-full sm:w-auto px-4 py-2 bg-bg-elevated hover:bg-bg-secondary border border-boundary text-content-secondary hover:text-content-primary rounded-lg text-sm font-semibold transition-colors"
              >
                Reset Database
              </button>
            </div>
          </div>
        </div>
      </ThemeProvider>
    );
  }

  // 3. Fully Initialized Application Shell & Routing
  return (
    <ThemeProvider>
      <BrowserRouter>
        {/* Global Action Error Toast (e.g. if a mutation fails) */}
        {actionError && (
          <div className="fixed top-3 right-3 left-3 sm:left-auto sm:w-96 z-50 bg-status-error text-white text-xs px-4 py-3 rounded-lg shadow-xl flex items-center justify-between gap-3 animate-in fade-in slide-in-from-top-2">
            <span className="font-medium truncate">{actionError}</span>
            <button
              onClick={clearActionError}
              className="text-white/80 hover:text-white font-bold px-1.5 py-0.5 rounded bg-black/20 text-xs shrink-0"
            >
              Dismiss
            </button>
          </div>
        )}

        <Routes>
          <Route path="/" element={<AppShell />}>
            <Route index element={<HomeView />} />
            <Route path="money" element={<MoneyView />} />
            <Route path="planner" element={<PlannerView />} />
            <Route path="habits" element={<HabitsView />} />
            <Route path="journal" element={<JournalView />} />
            <Route path="alfred" element={<AlfredView />} />
            <Route path="insights" element={<InsightsView />} />
            <Route path="settings" element={<SettingsView />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
};

export default App;
