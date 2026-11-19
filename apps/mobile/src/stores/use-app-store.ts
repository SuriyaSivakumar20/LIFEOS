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
  type DatabaseRepositories,
} from '@lifeos/database';
import {
  calculateFinancialSummary,
  calculateCategoryBreakdown,
  formatLocalDateString,
  isHabitCompletedForDate,
  generateUUID,
} from '@lifeos/core';

interface AppState {
  isDbReady: boolean;
  dbError: string | null;
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

  // Actions
  init: () => Promise<void>;
  retryInit: () => Promise<void>;
  refreshMoney: () => Promise<void>;
  refreshTasks: () => Promise<void>;
  refreshHabits: () => Promise<void>;
  refreshJournal: () => Promise<void>;
  refreshChat: () => Promise<void>;
  refreshAll: () => Promise<void>;

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
  isDbReady: false,
  dbError: null,
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
      set({ dbError: null });
      await initializeDatabase();
      const repos = getRepositories();

      const [profile, settings] = await Promise.all([
        repos.settings.getProfile(),
        repos.settings.getSettings(),
      ]);

      const themeMode: ThemeMode = settings?.themeMode ?? 'dark';

      set({
        isDbReady: true,
        userProfile: profile,
        settings,
        themeMode,
      });

      await get().refreshAll();
    } catch (err) {
      set({
        isDbReady: false,
        dbError: err instanceof Error ? err.message : String(err),
      });
    }
  },

  retryInit: async () => {
    await get().init();
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
    }
  },

  refreshTasks: async () => {
    try {
      const repos = getRepositories();
      const [tasks, reminders] = await Promise.all([
        repos.tasks.getAll(),
        repos.reminders.getUpcoming(5),
      ]);
      set({ tasks, reminders });
    } catch (err) {
      console.error('Failed to refresh tasks', err);
    }
  },

  refreshHabits: async () => {
    try {
      const repos = getRepositories();
      const todayStr = formatLocalDateString(new Date());
      const [allHabits, todayLogs] = await Promise.all([
        repos.habits.getAll(),
        repos.habits.getTodayLogs(todayStr),
      ]);

      const habitsWithStatus: HabitWithTodayStatus[] = allHabits.map((h) => ({
        ...h,
        isCompletedToday: isHabitCompletedForDate(todayLogs, h.id, todayStr),
      }));

      set({ habits: habitsWithStatus });
    } catch (err) {
      console.error('Failed to refresh habits', err);
    }
  },

  refreshJournal: async () => {
    try {
      const repos = getRepositories();
      const entries = await repos.journal.getAll();
      set({ journalEntries: entries });
    } catch (err) {
      console.error('Failed to refresh journal', err);
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
    const repos = getRepositories();
    const created = await repos.transactions.create(tx);
    await get().refreshMoney();
    return created;
  },

  deleteTransaction: async (id) => {
    const repos = getRepositories();
    await repos.transactions.delete(id);
    await get().refreshMoney();
  },

  addTask: async (task) => {
    const repos = getRepositories();
    const created = await repos.tasks.create(task);
    await get().refreshTasks();
    return created;
  },

  toggleTaskStatus: async (id) => {
    const repos = getRepositories();
    const task = await repos.tasks.getById(id);
    if (!task) return;

    const nextStatus = task.status === 'completed' ? 'pending' : 'completed';
    const completedAt = nextStatus === 'completed' ? new Date().toISOString() : null;
    await repos.tasks.update(id, { status: nextStatus, completedAt });
    await get().refreshTasks();
  },

  deleteTask: async (id) => {
    const repos = getRepositories();
    await repos.tasks.delete(id);
    await get().refreshTasks();
  },

  addHabit: async (habit) => {
    const repos = getRepositories();
    await repos.habits.create({
      ...habit,
      isArchived: false,
    });
    await get().refreshHabits();
  },

  toggleHabitToday: async (habitId) => {
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
  },

  deleteHabit: async (id) => {
    const repos = getRepositories();
    await repos.habits.delete(id);
    await get().refreshHabits();
  },

  addJournalEntry: async (entry) => {
    const repos = getRepositories();
    const created = await repos.journal.create(entry);
    await get().refreshJournal();
    return created;
  },

  deleteJournalEntry: async (id) => {
    const repos = getRepositories();
    await repos.journal.delete(id);
    await get().refreshJournal();
  },

  setThemeMode: async (mode) => {
    set({ themeMode: mode });
    const repos = getRepositories();
    const current = await repos.settings.getSettings();
    if (current) {
      await repos.settings.saveSettings({ ...current, themeMode: mode });
    }
  },

  updateProfile: async (updates) => {
    const repos = getRepositories();
    const current = await repos.settings.getProfile();
    if (current) {
      const updated = await repos.settings.saveProfile({ ...current, ...updates });
      set({ userProfile: updated });
      await get().refreshMoney();
    }
  },

  sendChatMessage: async (content) => {
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

      // Add user message to conversation history
      await repos.chat.addMessage(sessionId, 'user', trimmed);
      await get().refreshChat();
    } catch (err) {
      console.error('Failed to save chat message to local database', err);
      throw err;
    }
  },
}));
