import Dexie, { type EntityTable } from 'dexie';
import type {
  UserProfile,
  AppSettings,
  Account,
  Category,
  Transaction,
  Budget,
  FinancialGoal,
  Task,
  Reminder,
  Habit,
  HabitLog,
  JournalEntry,
  ChatSession,
  ChatMessage,
} from '@lifeos/shared-types';

export class LifeOSDexieDB extends Dexie {
  user_profile!: EntityTable<UserProfile, 'id'>;
  app_settings!: EntityTable<AppSettings, 'id'>;
  accounts!: EntityTable<Account, 'id'>;
  categories!: EntityTable<Category, 'id'>;
  transactions!: EntityTable<Transaction, 'id'>;
  budgets!: EntityTable<Budget, 'id'>;
  financial_goals!: EntityTable<FinancialGoal, 'id'>;
  tasks!: EntityTable<Task, 'id'>;
  reminders!: EntityTable<Reminder, 'id'>;
  habits!: EntityTable<Habit, 'id'>;
  habit_logs!: EntityTable<HabitLog, 'id'>;
  journal_entries!: EntityTable<JournalEntry, 'id'>;
  chat_sessions!: EntityTable<ChatSession, 'id'>;
  chat_messages!: EntityTable<ChatMessage, 'id'>;

  constructor(dbName = 'lifeos_indexeddb') {
    super(dbName);

    this.version(1).stores({
      user_profile: 'id, name, timezone, currency',
      app_settings: 'id, themeMode',
      accounts: 'id, name, type, isArchived',
      categories: 'id, name, type, isSystem',
      transactions: 'id, accountId, categoryId, amountMinor, type, timestamp',
      budgets: 'id, categoryId, period',
      financial_goals: 'id, targetDate',
      tasks: 'id, priority, status, dueDate, completedAt',
      reminders: 'id, targetTime, status',
      habits: 'id, frequency, isArchived',
      habit_logs: 'id, habitId, completedDate, [habitId+completedDate]',
      journal_entries: 'id, mood, createdAt',
      chat_sessions: 'id, createdAt',
      chat_messages: 'id, sessionId, createdAt',
    });
  }
}
