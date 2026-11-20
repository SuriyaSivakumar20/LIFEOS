import { create } from 'zustand';
import type {
  Transaction,
  Category,
  Task,
  Reminder,
  HabitWithTodayStatus,
  JournalEntry,
  UserProfile,
  AppSettings,
  ChatMessage,
  FinancialSummary,
  CategoryExpenseBreakdown,
  ThemeMode,
} from '@lifeos/shared-types';
import {
  initializeDatabase,
  getRepositories,
  getDatabaseAdapter,
} from '@lifeos/database';
import {
  calculateFinancialSummary,
  calculateCategoryBreakdown,
  formatLocalDateString,
  isHabitCompletedForDate,
} from '@lifeos/core';

export interface AppState {
  isInitializing: boolean;
  isDbReady: boolean;
  dbError: string | null;
  actionError: string | null;
  clearActionError: () => void;

  themeMode: ThemeMode;
  userProfile: UserProfile | null;
  settings: AppSettings | null;

  // Money
  financialSummary: FinancialSummary;
  categoryBreakdown: CategoryExpenseBreakdown[];
  transactions: Transaction[];
  categories: Category[];

  // Tasks & Reminders
  tasks: Task[];
  reminders: Reminder[];

  // Habits
  habits: HabitWithTodayStatus[];

  // Journal
  journalEntries: JournalEntry[];

  // Alfred Chat
  activeSessionId: string | null;
  chatMessages: ChatMessage[];

  // Reactive Lifecycle Actions
  init: () => Promise<void>;
  retryInit: () => Promise<void>;
  resetDatabaseSafely: () => Promise<void>;
  refreshMoney: () => Promise<void>;
  refreshTasks: () => Promise<void>;
  refreshHabits: () => Promise<void>;
  refreshJournal: () => Promise<void>;
  refreshChat: () => Promise<void>;
  refreshAll: () => Promise<void>;

  // Data Mutation Actions
  addTransaction: (tx: Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'>) => Promise<Transaction>;
  deleteTransaction: (id: string) => Promise<void>;

  addTask: (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => Promise<Task>;
  toggleTaskStatus: (id: string) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;

  addHabit: (habit: Omit<HabitWithTodayStatus, 'id' | 'createdAt' | 'updatedAt' | 'streakCount' | 'bestStreak' | 'isCompletedToday'>) => Promise<void>;
  toggleHabitToday: (habitId: string) => Promise<void>;
  deleteHabit: (id: string) => Promise<void>;

  addJournalEntry: (entry: Omit<JournalEntry, 'id' | 'createdAt' | 'updatedAt'>) => Promise<JournalEntry>;
  deleteJournalEntry: (id: string) => Promise<void>;

  setThemeMode: (mode: ThemeMode) => Promise<void>;
  updateProfile: (profile: Partial<UserProfile>) => Promise<void>;

  sendChatMessage: (content: string) => Promise<void>;
}

export const useAppStore = create<AppState>((set, get) => ({
  isInitializing: true,
  isDbReady: false,
  dbError: null,
  actionError: null,
  clearActionError: () => set({ actionError: null }),

  themeMode: 'dark',
  userProfile: null,
  settings: null,

  financialSummary: {
    totalIncomeMinor: 0,
    totalExpensesMinor: 0,
    totalRefundsMinor: 0,
    availableBalanceMinor: 0,
    currency: 'INR',
    transactionCount: 0,
  },
  categoryBreakdown: [],
  transactions: [],
  categories: [],

  tasks: [],
  reminders: [],
  habits: [],
  journalEntries: [],

  activeSessionId: null,
  chatMessages: [],

  init: async () => {
    try {
      set({ isInitializing: true, dbError: null, actionError: null });
      await initializeDatabase();
      const repos = getRepositories();

      const [profile, settings] = await Promise.all([
        repos.settings.getProfile(),
        repos.settings.getSettings(),
      ]);

      const themeMode: ThemeMode = settings?.themeMode ?? 'dark';

      set({
        isDbReady: true,
        isInitializing: false,
        userProfile: profile,
        settings,
        themeMode,
      });

      await get().refreshAll();
    } catch (err) {
      console.error('Database initialization failed:', err);
      set({
        isDbReady: false,
        isInitializing: false,
        dbError: err instanceof Error ? err.message : String(err),
      });
    }
  },

  retryInit: async () => {
    await get().init();
  },

  resetDatabaseSafely: async () => {
    try {
      set({ isInitializing: true, dbError: null, actionError: null });
      const adapter = getDatabaseAdapter();
      await adapter.resetDatabase();
      await get().init();
    } catch (err) {
      console.error('Database reset failed:', err);
      set({
        isInitializing: false,
        dbError: `Reset failed: ${err instanceof Error ? err.message : String(err)}`,
      });
    }
  },

  refreshMoney: async () => {
    try {
      const repos = getRepositories();
      const [txs, cats, profile] = await Promise.all([
        repos.transactions.getAll(),
        repos.categories.getAll(),
        repos.settings.getProfile(),
      ]);

      const currency = profile?.currency ?? 'INR';
      const summary = calculateFinancialSummary(txs, currency);
      const breakdown = calculateCategoryBreakdown(txs, cats);

      set({
        transactions: txs,
        categories: cats,
        financialSummary: summary,
        categoryBreakdown: breakdown,
      });
    } catch (err) {
      console.error('Failed to refresh money data', err);
      set({ actionError: 'Failed to refresh financial data from database' });
      throw err;
    }
  },

  refreshTasks: async () => {
    try {
      const repos = getRepositories();
      const [allTasks, allReminders] = await Promise.all([
        repos.tasks.getAll(),
        repos.reminders.getAll(),
      ]);
      set({ tasks: allTasks, reminders: allReminders });
    } catch (err) {
      console.error('Failed to refresh tasks', err);
      set({ actionError: 'Failed to refresh tasks from database' });
      throw err;
    }
  },

  refreshHabits: async () => {
    try {
      const repos = getRepositories();
      const rawHabits = await repos.habits.getAll();
      const todayStr = formatLocalDateString(new Date());

      const habitsWithStatus: HabitWithTodayStatus[] = await Promise.all(
        rawHabits.map(async (h) => {
          const logs = await repos.habits.getLogsForHabit(h.id);
          const isCompletedToday = isHabitCompletedForDate(logs, h.id, todayStr);
          return {
            ...h,
            isCompletedToday,
          };
        })
      );

      set({ habits: habitsWithStatus });
    } catch (err) {
      console.error('Failed to refresh habits', err);
      set({ actionError: 'Failed to refresh habits from database' });
      throw err;
    }
  },

  refreshJournal: async () => {
    try {
      const repos = getRepositories();
      const entries = await repos.journal.getAll();
      set({ journalEntries: entries });
    } catch (err) {
      console.error('Failed to refresh journal', err);
      set({ actionError: 'Failed to refresh journal from database' });
      throw err;
    }
  },

  refreshChat: async () => {
    try {
      const repos = getRepositories();
      let sessionId = get().activeSessionId;

      if (!sessionId) {
        const sessions = await repos.chat.getSessions();
        if (sessions.length > 0) {
          sessionId = sessions[0].id;
        } else {
          const newSession = await repos.chat.createSession('Alfred Session');
          sessionId = newSession.id;
        }
        set({ activeSessionId: sessionId });
      }

      if (sessionId) {
        const msgs = await repos.chat.getMessages(sessionId);
        set({ chatMessages: msgs });
      }
    } catch (err) {
      console.error('Failed to refresh chat', err);
      set({ actionError: 'Failed to refresh chat from database' });
      throw err;
    }
  },

  refreshAll: async () => {
    await Promise.all([
      get().refreshMoney(),
      get().refreshTasks(),
      get().refreshHabits(),
      get().refreshJournal(),
      get().refreshChat(),
    ]);
  },

  addTransaction: async (tx) => {
    if (!get().isDbReady) {
      const err = new Error('Database is not initialized. Please wait or retry.');
      set({ actionError: err.message });
      throw err;
    }
    try {
      const repos = getRepositories();
      const created = await repos.transactions.create(tx);
      await get().refreshMoney();
      set({ actionError: null });
      return created;
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      set({ actionError: msg });
      throw err;
    }
  },

  deleteTransaction: async (id) => {
    if (!get().isDbReady) {
      const err = new Error('Database is not initialized. Please wait or retry.');
      set({ actionError: err.message });
      throw err;
    }
    try {
      const repos = getRepositories();
      await repos.transactions.delete(id);
      await get().refreshMoney();
      set({ actionError: null });
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      set({ actionError: msg });
      throw err;
    }
  },

  addTask: async (task) => {
    if (!get().isDbReady) {
      const err = new Error('Database is not initialized. Please wait or retry.');
      set({ actionError: err.message });
      throw err;
    }
    try {
      const repos = getRepositories();
      const created = await repos.tasks.create(task);
      await get().refreshTasks();
      set({ actionError: null });
      return created;
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      set({ actionError: msg });
      throw err;
    }
  },

  toggleTaskStatus: async (id) => {
    if (!get().isDbReady) {
      const err = new Error('Database is not initialized. Please wait or retry.');
      set({ actionError: err.message });
      throw err;
    }
    try {
      const repos = getRepositories();
      const task = await repos.tasks.getById(id);
      if (!task) return;

      const nextStatus = task.status === 'completed' ? 'pending' : 'completed';
      const completedAt = nextStatus === 'completed' ? new Date().toISOString() : null;
      await repos.tasks.update(id, { status: nextStatus, completedAt });
      await get().refreshTasks();
      set({ actionError: null });
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      set({ actionError: msg });
      throw err;
    }
  },

  deleteTask: async (id) => {
    if (!get().isDbReady) {
      const err = new Error('Database is not initialized. Please wait or retry.');
      set({ actionError: err.message });
      throw err;
    }
    try {
      const repos = getRepositories();
      await repos.tasks.delete(id);
      await get().refreshTasks();
      set({ actionError: null });
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      set({ actionError: msg });
      throw err;
    }
  },

  addHabit: async (habit) => {
    if (!get().isDbReady) {
      const err = new Error('Database is not initialized. Please wait or retry.');
      set({ actionError: err.message });
      throw err;
    }
    try {
      const repos = getRepositories();
      await repos.habits.create({
        ...habit,
        isArchived: false,
      });
      await get().refreshHabits();
      set({ actionError: null });
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      set({ actionError: msg });
      throw err;
    }
  },

  toggleHabitToday: async (habitId) => {
    if (!get().isDbReady) {
      const err = new Error('Database is not initialized. Please wait or retry.');
      set({ actionError: err.message });
      throw err;
    }
    try {
      const repos = getRepositories();
      const todayStr = formatLocalDateString(new Date());
      const target = get().habits.find((h) => h.id === habitId);
      if (!target) return;

      if (target.isCompletedToday) {
        await repos.habits.removeCompletion(habitId, todayStr);
      } else {
        await repos.habits.logCompletion(habitId, todayStr);
      }
      await get().refreshHabits();
      set({ actionError: null });
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      set({ actionError: msg });
      throw err;
    }
  },

  deleteHabit: async (id) => {
    if (!get().isDbReady) {
      const err = new Error('Database is not initialized. Please wait or retry.');
      set({ actionError: err.message });
      throw err;
    }
    try {
      const repos = getRepositories();
      await repos.habits.delete(id);
      await get().refreshHabits();
      set({ actionError: null });
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      set({ actionError: msg });
      throw err;
    }
  },

  addJournalEntry: async (entry) => {
    if (!get().isDbReady) {
      const err = new Error('Database is not initialized. Please wait or retry.');
      set({ actionError: err.message });
      throw err;
    }
    try {
      const repos = getRepositories();
      const created = await repos.journal.create(entry);
      await get().refreshJournal();
      set({ actionError: null });
      return created;
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      set({ actionError: msg });
      throw err;
    }
  },

  deleteJournalEntry: async (id) => {
    if (!get().isDbReady) {
      const err = new Error('Database is not initialized. Please wait or retry.');
      set({ actionError: err.message });
      throw err;
    }
    try {
      const repos = getRepositories();
      await repos.journal.delete(id);
      await get().refreshJournal();
      set({ actionError: null });
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      set({ actionError: msg });
      throw err;
    }
  },

  setThemeMode: async (mode) => {
    if (!get().isDbReady) {
      const err = new Error('Database is not initialized. Please wait or retry.');
      set({ actionError: err.message });
      throw err;
    }
    try {
      set({ themeMode: mode });
      const repos = getRepositories();
      const current = await repos.settings.getSettings();
      if (current) {
        await repos.settings.saveSettings({ ...current, themeMode: mode });
      }
      set({ actionError: null });
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      set({ actionError: msg });
      throw err;
    }
  },

  updateProfile: async (updates) => {
    if (!get().isDbReady) {
      const err = new Error('Database is not initialized. Please wait or retry.');
      set({ actionError: err.message });
      throw err;
    }
    try {
      const repos = getRepositories();
      const current = await repos.settings.getProfile();
      if (current) {
        const updated = await repos.settings.saveProfile({ ...current, ...updates });
        set({ userProfile: updated });
        await get().refreshMoney();
      }
      set({ actionError: null });
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      set({ actionError: msg });
      throw err;
    }
  },

  sendChatMessage: async (content) => {
    if (!get().isDbReady) {
      const err = new Error('Database is not initialized. Please wait or retry.');
      set({ actionError: err.message });
      throw err;
    }
    const trimmed = content.trim();
    if (!trimmed) return;

    try {
      let sessionId = get().activeSessionId;
      const repos = getRepositories();
      if (!sessionId) {
        const session = await repos.chat.createSession('Alfred Session');
        sessionId = session.id;
        set({ activeSessionId: sessionId });
      }

      // 1. Persist user message locally in IndexedDB
      await repos.chat.addMessage(sessionId, 'user', trimmed);

      // 2. Persist local offline rule-based response (Zero external cloud AI)
      const offlineGuidance = 'Note recorded locally in IndexedDB. External AI cloud services are disabled by default to protect your privacy.';
      await repos.chat.addMessage(sessionId, 'assistant', offlineGuidance);

      await get().refreshChat();
      set({ actionError: null });
    } catch (err) {
      console.error('Failed to save chat message to local database', err);
      const msg = err instanceof Error ? err.message : String(err);
      set({ actionError: msg });
      throw err;
    }
  },
}));
