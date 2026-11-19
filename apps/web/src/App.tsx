import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './hooks/use-theme';
import { AppShell } from './components/layout/AppShell';

import { HomeView } from './pages/HomeView';
import { MoneyView } from './pages/MoneyView';
import { PlannerView } from './pages/PlannerView';
import { HabitsView } from './pages/HabitsView';
import { JournalView } from './pages/JournalView';
import { AlfredView } from './pages/AlfredView';
import { InsightsView } from './pages/InsightsView';
import { SettingsView } from './pages/SettingsView';

export const App: React.FC = () => {
  return (
    <ThemeProvider>
      <BrowserRouter>
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
