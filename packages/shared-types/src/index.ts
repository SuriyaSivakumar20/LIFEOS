/**
 * LIFEOS Shared Types & Domain Interfaces
 */

export type UUID = string;
export type ISOTimestamp = string; // UTC ISO 8601 string, e.g. "2026-11-16T09:20:00.000Z"

// ==========================================
// User & Settings
// ==========================================
export interface UserProfile {
  id: UUID;
  name: string;
  timezone: string;
  currency: string;
  createdAt: ISOTimestamp;
  updatedAt: ISOTimestamp;
}

export type ThemeMode = 'dark' | 'light' | 'system';

export interface AppSettings {
  id: UUID;
  themeMode: ThemeMode;
  analyticsEnabled: boolean;
  biometricsEnabled: boolean;
  notificationsEnabled: boolean;
  weekStartsOn: 0 | 1; // 0: Sunday, 1: Monday
  createdAt: ISOTimestamp;
  updatedAt: ISOTimestamp;
}

// ==========================================
// Money & Finance
// ==========================================
export type AccountType = 'checking' | 'savings' | 'credit' | 'cash' | 'investment';

export interface Account {
  id: UUID;
  name: string;
  type: AccountType;
  balanceMinor: number; // Integer minor currency units (e.g., cents: 1000 = $10.00)
  currency: string;
  isArchived: boolean;
  createdAt: ISOTimestamp;
  updatedAt: ISOTimestamp;
}

export type CategoryType = 'income' | 'expense' | 'transfer';

export interface Category {
  id: UUID;
  name: string;
  type: CategoryType;
  icon: string;
  color: string;
  isSystem: boolean;
  createdAt: ISOTimestamp;
  updatedAt: ISOTimestamp;
}

export type TransactionType = 'income' | 'expense' | 'transfer' | 'refund';

export interface Transaction {
  id: UUID;
  accountId: UUID;
  categoryId: UUID;
  amountMinor: number; // Always integer in minor currency units (e.g. cents/paise)
  type: TransactionType;
  timestamp: ISOTimestamp; // UTC
  userTimezone: string;
  description: string;
  notes?: string | null;
  tags?: string[];
  createdAt: ISOTimestamp;
  updatedAt: ISOTimestamp;
}

export interface Budget {
  id: UUID;
  categoryId: UUID;
  limitMinor: number;
  period: 'monthly' | 'weekly' | 'yearly';
  startDate: string; // YYYY-MM-DD
  endDate?: string | null;
  createdAt: ISOTimestamp;
  updatedAt: ISOTimestamp;
}

export interface FinancialGoal {
  id: UUID;
  name: string;
  targetAmountMinor: number;
  currentAmountMinor: number;
  targetDate?: string | null;
  createdAt: ISOTimestamp;
  updatedAt: ISOTimestamp;
}

export interface FinancialSummary {
  totalIncomeMinor: number;
  totalExpensesMinor: number;
  totalRefundsMinor: number;
  availableBalanceMinor: number;
  currency: string;
  transactionCount: number;
}

export interface CategoryExpenseBreakdown {
  categoryId: UUID;
  categoryName: string;
  categoryColor: string;
  categoryIcon: string;
  totalMinor: number;
  percentage: number;
}

// ==========================================
// Planner & Tasks & Reminders
// ==========================================
export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent';
export type TaskStatus = 'pending' | 'completed' | 'cancelled';

export interface Task {
  id: UUID;
  title: string;
  description?: string | null;
  priority: TaskPriority;
  status: TaskStatus;
  dueDate?: ISOTimestamp | null; // UTC ISO string
  completedAt?: ISOTimestamp | null; // UTC ISO string
  createdAt: ISOTimestamp;
  updatedAt: ISOTimestamp;
}

export type ReminderRecurrence = 'none' | 'daily' | 'weekly' | 'monthly';
export type ReminderStatus = 'pending' | 'dismissed' | 'completed';

export interface Reminder {
  id: UUID;
  title: string;
  targetTime: ISOTimestamp;
  recurrence: ReminderRecurrence;
  status: ReminderStatus;
  createdAt: ISOTimestamp;
  updatedAt: ISOTimestamp;
}

// ==========================================
// Habits
// ==========================================
export type HabitFrequency = 'daily' | 'weekly';

export interface Habit {
  id: UUID;
  title: string;
  frequency: HabitFrequency;
  targetDaysPerWeek: number;
  streakCount: number;
  bestStreak: number;
  isArchived: boolean;
  createdAt: ISOTimestamp;
  updatedAt: ISOTimestamp;
}

export interface HabitLog {
  id: UUID;
  habitId: UUID;
  completedDate: string; // YYYY-MM-DD in local context
  notes?: string | null;
  createdAt: ISOTimestamp;
}

export interface HabitWithTodayStatus extends Habit {
  isCompletedToday: boolean;
}

// ==========================================
// Journal
// ==========================================
export type JournalMood = 'great' | 'good' | 'neutral' | 'bad' | 'awful';

export interface JournalEntry {
  id: UUID;
  title: string;
  content: string;
  mood?: JournalMood | null;
  tags?: string[];
  createdAt: ISOTimestamp;
  updatedAt: ISOTimestamp;
}

// ==========================================
// Alfred (Assistant Chat)
// ==========================================
export type ChatRole = 'user' | 'assistant' | 'system';

export interface ChatSession {
  id: UUID;
  title: string;
  createdAt: ISOTimestamp;
  updatedAt: ISOTimestamp;
}

export interface ChatMessage {
  id: UUID;
  sessionId: UUID;
  role: ChatRole;
  content: string;
  createdAt: ISOTimestamp;
}

// ==========================================
// Repository Interfaces
// ==========================================
export interface ITransactionRepository {
  getAll(): Promise<Transaction[]>;
  getById(id: UUID): Promise<Transaction | null>;
  create(transaction: Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'> & { id?: UUID }): Promise<Transaction>;
  update(id: UUID, updates: Partial<Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'>>): Promise<Transaction | null>;
  delete(id: UUID): Promise<boolean>;
  getByDateRange(startDateUTC: ISOTimestamp, endDateUTC: ISOTimestamp): Promise<Transaction[]>;
  getRecent(limit: number): Promise<Transaction[]>;
}

export interface IAccountRepository {
  getAll(): Promise<Account[]>;
  getById(id: UUID): Promise<Account | null>;
  create(account: Omit<Account, 'id' | 'createdAt' | 'updatedAt'> & { id?: UUID }): Promise<Account>;
  update(id: UUID, updates: Partial<Omit<Account, 'id' | 'createdAt' | 'updatedAt'>>): Promise<Account | null>;
  delete(id: UUID): Promise<boolean>;
}

export interface ICategoryRepository {
  getAll(): Promise<Category[]>;
  getById(id: UUID): Promise<Category | null>;
  create(category: Omit<Category, 'id' | 'createdAt' | 'updatedAt'> & { id?: UUID }): Promise<Category>;
  update(id: UUID, updates: Partial<Omit<Category, 'id' | 'createdAt' | 'updatedAt'>>): Promise<Category | null>;
  delete(id: UUID): Promise<boolean>;
}

export interface ITaskRepository {
  getAll(): Promise<Task[]>;
  getById(id: UUID): Promise<Task | null>;
  create(task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'> & { id?: UUID }): Promise<Task>;
  update(id: UUID, updates: Partial<Omit<Task, 'id' | 'createdAt' | 'updatedAt'>>): Promise<Task | null>;
  delete(id: UUID): Promise<boolean>;
  getTodayTasks(localDateYYYYMMDD: string): Promise<Task[]>;
  getUpcomingTasks(): Promise<Task[]>;
}

export interface IReminderRepository {
  getAll(): Promise<Reminder[]>;
  getById(id: UUID): Promise<Reminder | null>;
  create(reminder: Omit<Reminder, 'id' | 'createdAt' | 'updatedAt'> & { id?: UUID }): Promise<Reminder>;
  update(id: UUID, updates: Partial<Omit<Reminder, 'id' | 'createdAt' | 'updatedAt'>>): Promise<Reminder | null>;
  delete(id: UUID): Promise<boolean>;
  getUpcoming(limit: number): Promise<Reminder[]>;
}

export interface IHabitRepository {
  getAll(): Promise<Habit[]>;
  getById(id: UUID): Promise<Habit | null>;
  create(habit: Omit<Habit, 'id' | 'createdAt' | 'updatedAt' | 'streakCount' | 'bestStreak'> & { id?: UUID }): Promise<Habit>;
  update(id: UUID, updates: Partial<Omit<Habit, 'id' | 'createdAt' | 'updatedAt'>>): Promise<Habit | null>;
  delete(id: UUID): Promise<boolean>;
  logCompletion(habitId: UUID, localDateYYYYMMDD: string, notes?: string): Promise<HabitLog>;
  removeCompletion(habitId: UUID, localDateYYYYMMDD: string): Promise<boolean>;
  getLogsForHabit(habitId: UUID): Promise<HabitLog[]>;
  getTodayLogs(localDateYYYYMMDD: string): Promise<HabitLog[]>;
}

export interface IJournalRepository {
  getAll(): Promise<JournalEntry[]>;
  getById(id: UUID): Promise<JournalEntry | null>;
  create(entry: Omit<JournalEntry, 'id' | 'createdAt' | 'updatedAt'> & { id?: UUID }): Promise<JournalEntry>;
  update(id: UUID, updates: Partial<Omit<JournalEntry, 'id' | 'createdAt' | 'updatedAt'>>): Promise<JournalEntry | null>;
  delete(id: UUID): Promise<boolean>;
  search(query: string): Promise<JournalEntry[]>;
}

export interface ISettingsRepository {
  getProfile(): Promise<UserProfile | null>;
  saveProfile(profile: UserProfile): Promise<UserProfile>;
  getSettings(): Promise<AppSettings | null>;
  saveSettings(settings: AppSettings): Promise<AppSettings>;
}

export interface IChatRepository {
  getSessions(): Promise<ChatSession[]>;
  getSessionById(id: UUID): Promise<ChatSession | null>;
  createSession(title: string): Promise<ChatSession>;
  getMessages(sessionId: UUID): Promise<ChatMessage[]>;
  addMessage(sessionId: UUID, role: ChatRole, content: string): Promise<ChatMessage>;
  deleteSession(sessionId: UUID): Promise<boolean>;
}

// ==========================================
// Database Adapter Interface
// ==========================================
export interface IDatabaseAdapter {
  readonly platform: 'native' | 'web';
  initialize(): Promise<void>;
  isInitialized(): boolean;
  runMigrations(): Promise<void>;
  close(): Promise<void>;
  resetDatabase(): Promise<void>;
}

// ==========================================
// App Navigation Routes
// ==========================================
export const APP_ROUTES = [
  { key: 'home', route: '/', label: 'Home', isPrimary: true },
  { key: 'money', route: '/money', label: 'Money', isPrimary: true },
  { key: 'planner', route: '/planner', label: 'Planner', isPrimary: true },
  { key: 'habits', route: '/habits', label: 'Habits', isPrimary: true },
  { key: 'alfred', route: '/alfred', label: 'Alfred', isPrimary: true },
  { key: 'journal', route: '/journal', label: 'Journal', isPrimary: false },
  { key: 'insights', route: '/insights', label: 'Insights', isPrimary: false },
  { key: 'settings', route: '/settings', label: 'Settings', isPrimary: false },
] as const;

