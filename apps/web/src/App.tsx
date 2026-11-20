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
  const { init, isDbReady, dbError, retryInit } = useAppStore();

  useEffect(() => {
    init();
  }, [init]);

  return (
    <ThemeProvider>
      <BrowserRouter>
        {dbError && (
          <div className="bg-status-error/20 border-b border-status-error/40 px-4 py-2 text-xs text-status-error flex items-center justify-between z-50">
            <span>Database Initialization Error: {dbError}</span>
            <button
              onClick={retryInit}
              className="px-2 py-0.5 rounded bg-status-error/30 hover:bg-status-error/50 font-semibold transition-colors"
            >
              Retry
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
