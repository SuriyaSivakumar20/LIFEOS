import type {
  Transaction,
  Account,
  Category,
  Task,
  Reminder,
  Habit,
  HabitLog,
  JournalEntry,
  UserProfile,
  AppSettings,
  ChatSession,
  ChatMessage,
  ITransactionRepository,
  IAccountRepository,
  ICategoryRepository,
  ITaskRepository,
  IReminderRepository,
  IHabitRepository,
  IJournalRepository,
  ISettingsRepository,
  IChatRepository,
  UUID,
  ISOTimestamp,
} from '@lifeos/shared-types';
import { generateUUID, getNowUTC } from '../../../core/src/entities/index.ts';
import { calculateStreak } from '../../../core/src/calculations/habits.ts';
import type { SQLiteAdapter } from '../adapters/sqlite/index';
import type { IndexedDBAdapter } from '../adapters/indexeddb/index';
import type { IDatabaseAdapter } from '@lifeos/shared-types';

export class TransactionRepository implements ITransactionRepository {
  private adapter: IDatabaseAdapter;

  constructor(adapter: IDatabaseAdapter) {
    this.adapter = adapter;
  }

  private isWeb(): boolean {
    return this.adapter.platform === 'web';
  }

  async getAll(): Promise<Transaction[]> {
    if (this.isWeb()) {
      const db = (this.adapter as IndexedDBAdapter).getDb();
      return db.transactions.reverse().sortBy('timestamp');
    }

    const db = (this.adapter as SQLiteAdapter).getDb();
    const rows = await db.getAllAsync(
      'SELECT * FROM transactions ORDER BY timestamp DESC'
    );
    return rows.map(this.mapSqliteRow);
  }

  async getById(id: UUID): Promise<Transaction | null> {
    if (this.isWeb()) {
      const db = (this.adapter as IndexedDBAdapter).getDb();
      const res = await db.transactions.get(id);
      return res ?? null;
    }

    const db = (this.adapter as SQLiteAdapter).getDb();
    const row = await db.getFirstAsync(
      'SELECT * FROM transactions WHERE id = ?',
      [id]
    );
    return row ? this.mapSqliteRow(row) : null;
  }

  async create(tx: Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'> & { id?: UUID }): Promise<Transaction> {
    const now = getNowUTC();
    const record: Transaction = {
      ...tx,
      id: tx.id || generateUUID(),
      createdAt: now,
      updatedAt: now,
    };

    if (this.isWeb()) {
      const db = (this.adapter as IndexedDBAdapter).getDb();
      await db.transactions.put(record);
      return record;
    }

    const db = (this.adapter as SQLiteAdapter).getDb();
    await db.runAsync(
      `INSERT INTO transactions (id, account_id, category_id, amount_minor, type, timestamp, user_timezone, description, notes, tags, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        record.id,
        record.accountId,
        record.categoryId,
        record.amountMinor,
        record.type,
        record.timestamp,
        record.userTimezone,
        record.description,
        record.notes ?? null,
        record.tags ? JSON.stringify(record.tags) : null,
        record.createdAt,
        record.updatedAt,
      ]
    );

    return record;
  }

  async update(
    id: UUID,
    updates: Partial<Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'>>
  ): Promise<Transaction | null> {
    const existing = await this.getById(id);
    if (!existing) return null;

    const now = getNowUTC();
    const updated: Transaction = {
      ...existing,
      ...updates,
      updatedAt: now,
    };

    if (this.isWeb()) {
      const db = (this.adapter as IndexedDBAdapter).getDb();
      await db.transactions.put(updated);
      return updated;
    }

    const db = (this.adapter as SQLiteAdapter).getDb();
    await db.runAsync(
      `UPDATE transactions SET
         account_id = ?, category_id = ?, amount_minor = ?, type = ?,
         timestamp = ?, user_timezone = ?, description = ?, notes = ?,
         tags = ?, updated_at = ?
       WHERE id = ?`,
      [
        updated.accountId,
        updated.categoryId,
        updated.amountMinor,
        updated.type,
        updated.timestamp,
        updated.userTimezone,
        updated.description,
        updated.notes ?? null,
        updated.tags ? JSON.stringify(updated.tags) : null,
        updated.updatedAt,
        id,
      ]
    );

    return updated;
  }

  async delete(id: UUID): Promise<boolean> {
    if (this.isWeb()) {
      const db = (this.adapter as IndexedDBAdapter).getDb();
      await db.transactions.delete(id);
      return true;
    }

    const db = (this.adapter as SQLiteAdapter).getDb();
    const res = await db.runAsync('DELETE FROM transactions WHERE id = ?', [id]);
    return res.changes > 0;
  }

  async getByDateRange(startDateUTC: ISOTimestamp, endDateUTC: ISOTimestamp): Promise<Transaction[]> {
    if (this.isWeb()) {
      const db = (this.adapter as IndexedDBAdapter).getDb();
      return db.transactions
        .where('timestamp')
        .between(startDateUTC, endDateUTC, true, true)
        .reverse()
        .sortBy('timestamp');
    }

    const db = (this.adapter as SQLiteAdapter).getDb();
    const rows = await db.getAllAsync(
      'SELECT * FROM transactions WHERE timestamp >= ? AND timestamp <= ? ORDER BY timestamp DESC',
      [startDateUTC, endDateUTC]
    );
    return rows.map(this.mapSqliteRow);
  }

  async getRecent(limit: number): Promise<Transaction[]> {
    if (this.isWeb()) {
      const db = (this.adapter as IndexedDBAdapter).getDb();
      const all = await db.transactions.reverse().sortBy('timestamp');
      return all.slice(0, limit);
    }

    const db = (this.adapter as SQLiteAdapter).getDb();
    const rows = await db.getAllAsync(
      'SELECT * FROM transactions ORDER BY timestamp DESC LIMIT ?',
      [limit]
    );
    return rows.map(this.mapSqliteRow);
  }

  private mapSqliteRow(row: any): Transaction {
    return {
      id: row.id,
      accountId: row.account_id,
      categoryId: row.category_id,
      amountMinor: Number(row.amount_minor),
      type: row.type,
      timestamp: row.timestamp,
      userTimezone: row.user_timezone,
      description: row.description,
      notes: row.notes,
      tags: row.tags ? JSON.parse(row.tags) : [],
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }
}

export class AccountRepository implements IAccountRepository {
  private adapter: IDatabaseAdapter;

  constructor(adapter: IDatabaseAdapter) {
    this.adapter = adapter;
  }

  async getAll(): Promise<Account[]> {
    if (this.adapter.platform === 'web') {
      const db = (this.adapter as IndexedDBAdapter).getDb();
      return db.accounts.toArray();
    }
    const db = (this.adapter as SQLiteAdapter).getDb();
    const rows = await db.getAllAsync('SELECT * FROM accounts WHERE is_archived = 0');
    return rows.map((r: any) => ({
      id: r.id,
      name: r.name,
      type: r.type,
      balanceMinor: Number(r.balance_minor),
      currency: r.currency,
      isArchived: Boolean(r.is_archived),
      createdAt: r.created_at,
      updatedAt: r.updated_at,
    }));
  }

  async getById(id: UUID): Promise<Account | null> {
    if (this.adapter.platform === 'web') {
      const db = (this.adapter as IndexedDBAdapter).getDb();
      const a = await db.accounts.get(id);
      return a ?? null;
    }
    const db = (this.adapter as SQLiteAdapter).getDb();
    const r = await db.getFirstAsync('SELECT * FROM accounts WHERE id = ?', [id]);
    if (!r) return null;
    return {
      id: r.id,
      name: r.name,
      type: r.type,
      balanceMinor: Number(r.balance_minor),
      currency: r.currency,
      isArchived: Boolean(r.is_archived),
      createdAt: r.created_at,
      updatedAt: r.updated_at,
    };
  }

  async create(acc: Omit<Account, 'id' | 'createdAt' | 'updatedAt'> & { id?: UUID }): Promise<Account> {
    const now = getNowUTC();
    const record: Account = {
      ...acc,
      id: acc.id || generateUUID(),
      createdAt: now,
      updatedAt: now,
    };
    if (this.adapter.platform === 'web') {
      const db = (this.adapter as IndexedDBAdapter).getDb();
      await db.accounts.put(record);
      return record;
    }
    const db = (this.adapter as SQLiteAdapter).getDb();
    await db.runAsync(
      `INSERT INTO accounts (id, name, type, balance_minor, currency, is_archived, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [record.id, record.name, record.type, record.balanceMinor, record.currency, record.isArchived ? 1 : 0, now, now]
    );
    return record;
  }

  async update(id: UUID, updates: Partial<Omit<Account, 'id' | 'createdAt' | 'updatedAt'>>): Promise<Account | null> {
    const existing = await this.getById(id);
    if (!existing) return null;
    const now = getNowUTC();
    const updated = { ...existing, ...updates, updatedAt: now };
    if (this.adapter.platform === 'web') {
      const db = (this.adapter as IndexedDBAdapter).getDb();
      await db.accounts.put(updated);
      return updated;
    }
    const db = (this.adapter as SQLiteAdapter).getDb();
    await db.runAsync(
      `UPDATE accounts SET name = ?, type = ?, balance_minor = ?, currency = ?, is_archived = ?, updated_at = ? WHERE id = ?`,
      [updated.name, updated.type, updated.balanceMinor, updated.currency, updated.isArchived ? 1 : 0, now, id]
    );
    return updated;
  }

  async delete(id: UUID): Promise<boolean> {
    if (this.adapter.platform === 'web') {
      const db = (this.adapter as IndexedDBAdapter).getDb();
      await db.accounts.delete(id);
      return true;
    }
    const db = (this.adapter as SQLiteAdapter).getDb();
    const res = await db.runAsync('DELETE FROM accounts WHERE id = ?', [id]);
    return res.changes > 0;
  }
}

export class CategoryRepository implements ICategoryRepository {
  private adapter: IDatabaseAdapter;

  constructor(adapter: IDatabaseAdapter) {
    this.adapter = adapter;
  }

  async getAll(): Promise<Category[]> {
    if (this.adapter.platform === 'web') {
      const db = (this.adapter as IndexedDBAdapter).getDb();
      return db.categories.toArray();
    }
    const db = (this.adapter as SQLiteAdapter).getDb();
    const rows = await db.getAllAsync('SELECT * FROM categories ORDER BY name ASC');
    return rows.map((r: any) => ({
      id: r.id,
      name: r.name,
      type: r.type,
      icon: r.icon,
      color: r.color,
      isSystem: Boolean(r.is_system),
      createdAt: r.created_at,
      updatedAt: r.updated_at,
    }));
  }

  async getById(id: UUID): Promise<Category | null> {
    if (this.adapter.platform === 'web') {
      const db = (this.adapter as IndexedDBAdapter).getDb();
      const c = await db.categories.get(id);
      return c ?? null;
    }
    const db = (this.adapter as SQLiteAdapter).getDb();
    const r = await db.getFirstAsync('SELECT * FROM categories WHERE id = ?', [id]);
    if (!r) return null;
    return {
      id: r.id,
      name: r.name,
      type: r.type,
      icon: r.icon,
      color: r.color,
      isSystem: Boolean(r.is_system),
      createdAt: r.created_at,
      updatedAt: r.updated_at,
    };
  }

  async create(cat: Omit<Category, 'id' | 'createdAt' | 'updatedAt'> & { id?: UUID }): Promise<Category> {
    const now = getNowUTC();
    const record: Category = {
      ...cat,
      id: cat.id || generateUUID(),
      createdAt: now,
      updatedAt: now,
    };
    if (this.adapter.platform === 'web') {
      const db = (this.adapter as IndexedDBAdapter).getDb();
      await db.categories.put(record);
      return record;
    }
    const db = (this.adapter as SQLiteAdapter).getDb();
    await db.runAsync(
      `INSERT INTO categories (id, name, type, icon, color, is_system, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [record.id, record.name, record.type, record.icon, record.color, record.isSystem ? 1 : 0, now, now]
    );
    return record;
  }

  async update(id: UUID, updates: Partial<Omit<Category, 'id' | 'createdAt' | 'updatedAt'>>): Promise<Category | null> {
    const existing = await this.getById(id);
    if (!existing) return null;
    const now = getNowUTC();
    const updated = { ...existing, ...updates, updatedAt: now };
    if (this.adapter.platform === 'web') {
      const db = (this.adapter as IndexedDBAdapter).getDb();
      await db.categories.put(updated);
      return updated;
    }
    const db = (this.adapter as SQLiteAdapter).getDb();
    await db.runAsync(
      `UPDATE categories SET name = ?, type = ?, icon = ?, color = ?, is_system = ?, updated_at = ? WHERE id = ?`,
      [updated.name, updated.type, updated.icon, updated.color, updated.isSystem ? 1 : 0, now, id]
    );
    return updated;
  }

  async delete(id: UUID): Promise<boolean> {
    if (this.adapter.platform === 'web') {
      const db = (this.adapter as IndexedDBAdapter).getDb();
      await db.categories.delete(id);
      return true;
    }
    const db = (this.adapter as SQLiteAdapter).getDb();
    const res = await db.runAsync('DELETE FROM categories WHERE id = ?', [id]);
    return res.changes > 0;
  }
}

export class TaskRepository implements ITaskRepository {
  private adapter: IDatabaseAdapter;

  constructor(adapter: IDatabaseAdapter) {
    this.adapter = adapter;
  }

  async getAll(): Promise<Task[]> {
    if (this.adapter.platform === 'web') {
      const db = (this.adapter as IndexedDBAdapter).getDb();
      return db.tasks.reverse().sortBy('createdAt');
    }
    const db = (this.adapter as SQLiteAdapter).getDb();
    const rows = await db.getAllAsync('SELECT * FROM tasks ORDER BY created_at DESC');
    return rows.map(this.mapRow);
  }

  async getById(id: UUID): Promise<Task | null> {
    if (this.adapter.platform === 'web') {
      const db = (this.adapter as IndexedDBAdapter).getDb();
      const t = await db.tasks.get(id);
      return t ?? null;
    }
    const db = (this.adapter as SQLiteAdapter).getDb();
    const r = await db.getFirstAsync('SELECT * FROM tasks WHERE id = ?', [id]);
    return r ? this.mapRow(r) : null;
  }

  async create(task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'> & { id?: UUID }): Promise<Task> {
    const now = getNowUTC();
    const record: Task = {
      ...task,
      id: task.id || generateUUID(),
      createdAt: now,
      updatedAt: now,
    };
    if (this.adapter.platform === 'web') {
      const db = (this.adapter as IndexedDBAdapter).getDb();
      await db.tasks.put(record);
      return record;
    }
    const db = (this.adapter as SQLiteAdapter).getDb();
    await db.runAsync(
      `INSERT INTO tasks (id, title, description, priority, status, due_date, completed_at, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [record.id, record.title, record.description ?? null, record.priority, record.status, record.dueDate ?? null, record.completedAt ?? null, now, now]
    );
    return record;
  }

  async update(id: UUID, updates: Partial<Omit<Task, 'id' | 'createdAt' | 'updatedAt'>>): Promise<Task | null> {
    const existing = await this.getById(id);
    if (!existing) return null;
    const now = getNowUTC();
    const updated = { ...existing, ...updates, updatedAt: now };
    if (this.adapter.platform === 'web') {
      const db = (this.adapter as IndexedDBAdapter).getDb();
      await db.tasks.put(updated);
      return updated;
    }
    const db = (this.adapter as SQLiteAdapter).getDb();
    await db.runAsync(
      `UPDATE tasks SET title = ?, description = ?, priority = ?, status = ?, due_date = ?, completed_at = ?, updated_at = ? WHERE id = ?`,
      [updated.title, updated.description ?? null, updated.priority, updated.status, updated.dueDate ?? null, updated.completedAt ?? null, now, id]
    );
    return updated;
  }

  async delete(id: UUID): Promise<boolean> {
    if (this.adapter.platform === 'web') {
      const db = (this.adapter as IndexedDBAdapter).getDb();
      await db.tasks.delete(id);
      return true;
    }
    const db = (this.adapter as SQLiteAdapter).getDb();
    const res = await db.runAsync('DELETE FROM tasks WHERE id = ?', [id]);
    return res.changes > 0;
  }

  async getTodayTasks(localDateYYYYMMDD: string): Promise<Task[]> {
    const all = await this.getAll();
    // Return tasks that have due date matching today, or tasks pending created today/without specific due date
    return all.filter((t) => {
      if (t.dueDate) {
        return t.dueDate.startsWith(localDateYYYYMMDD);
      }
      return t.createdAt.startsWith(localDateYYYYMMDD) || t.status === 'pending';
    });
  }

  async getUpcomingTasks(): Promise<Task[]> {
    const all = await this.getAll();
    return all.filter((t) => t.status === 'pending');
  }

  private mapRow(r: any): Task {
    return {
      id: r.id,
      title: r.title,
      description: r.description,
      priority: r.priority,
      status: r.status,
      dueDate: r.due_date,
      completedAt: r.completed_at,
      createdAt: r.created_at,
      updatedAt: r.updated_at,
    };
  }
}

export class ReminderRepository implements IReminderRepository {
  private adapter: IDatabaseAdapter;

  constructor(adapter: IDatabaseAdapter) {
    this.adapter = adapter;
  }

  async getAll(): Promise<Reminder[]> {
    if (this.adapter.platform === 'web') {
      const db = (this.adapter as IndexedDBAdapter).getDb();
      return db.reminders.orderBy('targetTime').toArray();
    }
    const db = (this.adapter as SQLiteAdapter).getDb();
    const rows = await db.getAllAsync('SELECT * FROM reminders ORDER BY target_time ASC');
    return rows.map((r: any) => ({
      id: r.id,
      title: r.title,
      targetTime: r.target_time,
      recurrence: r.recurrence,
      status: r.status,
      createdAt: r.created_at,
      updatedAt: r.updated_at,
    }));
  }

  async getById(id: UUID): Promise<Reminder | null> {
    if (this.adapter.platform === 'web') {
      const db = (this.adapter as IndexedDBAdapter).getDb();
      const r = await db.reminders.get(id);
      return r ?? null;
    }
    const db = (this.adapter as SQLiteAdapter).getDb();
    const r = await db.getFirstAsync('SELECT * FROM reminders WHERE id = ?', [id]);
    if (!r) return null;
    return {
      id: r.id,
      title: r.title,
      targetTime: r.target_time,
      recurrence: r.recurrence,
      status: r.status,
      createdAt: r.created_at,
      updatedAt: r.updated_at,
    };
  }

  async create(reminder: Omit<Reminder, 'id' | 'createdAt' | 'updatedAt'> & { id?: UUID }): Promise<Reminder> {
    const now = getNowUTC();
    const record: Reminder = {
      ...reminder,
      id: reminder.id || generateUUID(),
      createdAt: now,
      updatedAt: now,
    };
    if (this.adapter.platform === 'web') {
      const db = (this.adapter as IndexedDBAdapter).getDb();
      await db.reminders.put(record);
      return record;
    }
    const db = (this.adapter as SQLiteAdapter).getDb();
    await db.runAsync(
      `INSERT INTO reminders (id, title, target_time, recurrence, status, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [record.id, record.title, record.targetTime, record.recurrence, record.status, now, now]
    );
    return record;
  }

  async update(id: UUID, updates: Partial<Omit<Reminder, 'id' | 'createdAt' | 'updatedAt'>>): Promise<Reminder | null> {
    const existing = await this.getById(id);
    if (!existing) return null;
    const now = getNowUTC();
    const updated = { ...existing, ...updates, updatedAt: now };
    if (this.adapter.platform === 'web') {
      const db = (this.adapter as IndexedDBAdapter).getDb();
      await db.reminders.put(updated);
      return updated;
    }
    const db = (this.adapter as SQLiteAdapter).getDb();
    await db.runAsync(
      `UPDATE reminders SET title = ?, target_time = ?, recurrence = ?, status = ?, updated_at = ? WHERE id = ?`,
      [updated.title, updated.targetTime, updated.recurrence, updated.status, now, id]
    );
    return updated;
  }

  async delete(id: UUID): Promise<boolean> {
    if (this.adapter.platform === 'web') {
      const db = (this.adapter as IndexedDBAdapter).getDb();
      await db.reminders.delete(id);
      return true;
    }
    const db = (this.adapter as SQLiteAdapter).getDb();
    const res = await db.runAsync('DELETE FROM reminders WHERE id = ?', [id]);
    return res.changes > 0;
  }

  async getUpcoming(limit: number): Promise<Reminder[]> {
    const all = await this.getAll();
    const pending = all.filter((r) => r.status === 'pending');
    return pending.slice(0, limit);
  }
}

export class HabitRepository implements IHabitRepository {
  private adapter: IDatabaseAdapter;

  constructor(adapter: IDatabaseAdapter) {
    this.adapter = adapter;
  }

  async getAll(): Promise<Habit[]> {
    if (this.adapter.platform === 'web') {
      const db = (this.adapter as IndexedDBAdapter).getDb();
      return db.habits.where('isArchived').equals(0).toArray();
    }
    const db = (this.adapter as SQLiteAdapter).getDb();
    const rows = await db.getAllAsync('SELECT * FROM habits WHERE is_archived = 0 ORDER BY created_at ASC');
    return rows.map(this.mapRow);
  }

  async getById(id: UUID): Promise<Habit | null> {
    if (this.adapter.platform === 'web') {
      const db = (this.adapter as IndexedDBAdapter).getDb();
      const h = await db.habits.get(id);
      return h ?? null;
    }
    const db = (this.adapter as SQLiteAdapter).getDb();
    const r = await db.getFirstAsync('SELECT * FROM habits WHERE id = ?', [id]);
    return r ? this.mapRow(r) : null;
  }

  async create(habit: Omit<Habit, 'id' | 'createdAt' | 'updatedAt' | 'streakCount' | 'bestStreak'> & { id?: UUID }): Promise<Habit> {
    const now = getNowUTC();
    const record: Habit = {
      ...habit,
      id: habit.id || generateUUID(),
      streakCount: 0,
      bestStreak: 0,
      createdAt: now,
      updatedAt: now,
    };
    if (this.adapter.platform === 'web') {
      const db = (this.adapter as IndexedDBAdapter).getDb();
      await db.habits.put(record);
      return record;
    }
    const db = (this.adapter as SQLiteAdapter).getDb();
    await db.runAsync(
      `INSERT INTO habits (id, title, frequency, target_days_per_week, streak_count, best_streak, is_archived, created_at, updated_at)
       VALUES (?, ?, ?, ?, 0, 0, ?, ?, ?)`,
      [record.id, record.title, record.frequency, record.targetDaysPerWeek, record.isArchived ? 1 : 0, now, now]
    );
    return record;
  }

  async update(id: UUID, updates: Partial<Omit<Habit, 'id' | 'createdAt' | 'updatedAt'>>): Promise<Habit | null> {
    const existing = await this.getById(id);
    if (!existing) return null;
    const now = getNowUTC();
    const updated = { ...existing, ...updates, updatedAt: now };
    if (this.adapter.platform === 'web') {
      const db = (this.adapter as IndexedDBAdapter).getDb();
      await db.habits.put(updated);
      return updated;
    }
    const db = (this.adapter as SQLiteAdapter).getDb();
    await db.runAsync(
      `UPDATE habits SET title = ?, frequency = ?, target_days_per_week = ?, streak_count = ?, best_streak = ?, is_archived = ?, updated_at = ? WHERE id = ?`,
      [updated.title, updated.frequency, updated.targetDaysPerWeek, updated.streakCount, updated.bestStreak, updated.isArchived ? 1 : 0, now, id]
    );
    return updated;
  }

  async delete(id: UUID): Promise<boolean> {
    if (this.adapter.platform === 'web') {
      const db = (this.adapter as IndexedDBAdapter).getDb();
      await db.habit_logs.where('habitId').equals(id).delete();
      await db.habits.delete(id);
      return true;
    }
    const db = (this.adapter as SQLiteAdapter).getDb();
    await db.runAsync('DELETE FROM habit_logs WHERE habit_id = ?', [id]);
    const res = await db.runAsync('DELETE FROM habits WHERE id = ?', [id]);
    return res.changes > 0;
  }

  async logCompletion(habitId: UUID, localDateYYYYMMDD: string, notes?: string): Promise<HabitLog> {
    const now = getNowUTC();
    const log: HabitLog = {
      id: generateUUID(),
      habitId,
      completedDate: localDateYYYYMMDD,
      notes: notes ?? null,
      createdAt: now,
    };

    if (this.adapter.platform === 'web') {
      const db = (this.adapter as IndexedDBAdapter).getDb();
      await db.habit_logs.put(log);
    } else {
      const db = (this.adapter as SQLiteAdapter).getDb();
      await db.runAsync(
        `INSERT OR REPLACE INTO habit_logs (id, habit_id, completed_date, notes, created_at)
         VALUES (?, ?, ?, ?, ?)`,
        [log.id, habitId, localDateYYYYMMDD, log.notes ?? null, now]
      );
    }

    // Recalculate streak
    const logs = await this.getLogsForHabit(habitId);
    const dates = logs.map((l) => l.completedDate);
    const { currentStreak, bestStreak } = calculateStreak(dates, localDateYYYYMMDD);
    await this.update(habitId, { streakCount: currentStreak, bestStreak });

    return log;
  }

  async removeCompletion(habitId: UUID, localDateYYYYMMDD: string): Promise<boolean> {
    if (this.adapter.platform === 'web') {
      const db = (this.adapter as IndexedDBAdapter).getDb();
      await db.habit_logs
        .where(['habitId', 'completedDate'])
        .equals([habitId, localDateYYYYMMDD])
        .delete();
    } else {
      const db = (this.adapter as SQLiteAdapter).getDb();
      await db.runAsync(
        'DELETE FROM habit_logs WHERE habit_id = ? AND completed_date = ?',
        [habitId, localDateYYYYMMDD]
      );
    }

    // Recalculate streak
    const logs = await this.getLogsForHabit(habitId);
    const dates = logs.map((l) => l.completedDate);
    const { currentStreak, bestStreak } = calculateStreak(dates, localDateYYYYMMDD);
    await this.update(habitId, { streakCount: currentStreak, bestStreak });

    return true;
  }

  async getLogsForHabit(habitId: UUID): Promise<HabitLog[]> {
    if (this.adapter.platform === 'web') {
      const db = (this.adapter as IndexedDBAdapter).getDb();
      return db.habit_logs.where('habitId').equals(habitId).toArray();
    }
    const db = (this.adapter as SQLiteAdapter).getDb();
    const rows = await db.getAllAsync(
      'SELECT * FROM habit_logs WHERE habit_id = ? ORDER BY completed_date DESC',
      [habitId]
    );
    return rows.map((r: any) => ({
      id: r.id,
      habitId: r.habit_id,
      completedDate: r.completed_date,
      notes: r.notes,
      createdAt: r.created_at,
    }));
  }

  async getTodayLogs(localDateYYYYMMDD: string): Promise<HabitLog[]> {
    if (this.adapter.platform === 'web') {
      const db = (this.adapter as IndexedDBAdapter).getDb();
      return db.habit_logs.where('completedDate').equals(localDateYYYYMMDD).toArray();
    }
    const db = (this.adapter as SQLiteAdapter).getDb();
    const rows = await db.getAllAsync(
      'SELECT * FROM habit_logs WHERE completed_date = ?',
      [localDateYYYYMMDD]
    );
    return rows.map((r: any) => ({
      id: r.id,
      habitId: r.habit_id,
      completedDate: r.completed_date,
      notes: r.notes,
      createdAt: r.created_at,
    }));
  }

  private mapRow(r: any): Habit {
    return {
      id: r.id,
      title: r.title,
      frequency: r.frequency,
      targetDaysPerWeek: Number(r.target_days_per_week),
      streakCount: Number(r.streak_count),
      bestStreak: Number(r.best_streak),
      isArchived: Boolean(r.is_archived),
      createdAt: r.created_at,
      updatedAt: r.updated_at,
    };
  }
}

export class JournalRepository implements IJournalRepository {
  private adapter: IDatabaseAdapter;

  constructor(adapter: IDatabaseAdapter) {
    this.adapter = adapter;
  }

  async getAll(): Promise<JournalEntry[]> {
    if (this.adapter.platform === 'web') {
      const db = (this.adapter as IndexedDBAdapter).getDb();
      return db.journal_entries.reverse().sortBy('createdAt');
    }
    const db = (this.adapter as SQLiteAdapter).getDb();
    const rows = await db.getAllAsync('SELECT * FROM journal_entries ORDER BY created_at DESC');
    return rows.map(this.mapRow);
  }

  async getById(id: UUID): Promise<JournalEntry | null> {
    if (this.adapter.platform === 'web') {
      const db = (this.adapter as IndexedDBAdapter).getDb();
      const e = await db.journal_entries.get(id);
      return e ?? null;
    }
    const db = (this.adapter as SQLiteAdapter).getDb();
    const r = await db.getFirstAsync('SELECT * FROM journal_entries WHERE id = ?', [id]);
    return r ? this.mapRow(r) : null;
  }

  async create(entry: Omit<JournalEntry, 'id' | 'createdAt' | 'updatedAt'> & { id?: UUID }): Promise<JournalEntry> {
    const now = getNowUTC();
    const record: JournalEntry = {
      ...entry,
      id: entry.id || generateUUID(),
      createdAt: now,
      updatedAt: now,
    };
    if (this.adapter.platform === 'web') {
      const db = (this.adapter as IndexedDBAdapter).getDb();
      await db.journal_entries.put(record);
      return record;
    }
    const db = (this.adapter as SQLiteAdapter).getDb();
    await db.runAsync(
      `INSERT INTO journal_entries (id, title, content, mood, tags, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [record.id, record.title, record.content, record.mood ?? null, record.tags ? JSON.stringify(record.tags) : null, now, now]
    );
    return record;
  }

  async update(id: UUID, updates: Partial<Omit<JournalEntry, 'id' | 'createdAt' | 'updatedAt'>>): Promise<JournalEntry | null> {
    const existing = await this.getById(id);
    if (!existing) return null;
    const now = getNowUTC();
    const updated = { ...existing, ...updates, updatedAt: now };
    if (this.adapter.platform === 'web') {
      const db = (this.adapter as IndexedDBAdapter).getDb();
      await db.journal_entries.put(updated);
      return updated;
    }
    const db = (this.adapter as SQLiteAdapter).getDb();
    await db.runAsync(
      `UPDATE journal_entries SET title = ?, content = ?, mood = ?, tags = ?, updated_at = ? WHERE id = ?`,
      [updated.title, updated.content, updated.mood ?? null, updated.tags ? JSON.stringify(updated.tags) : null, now, id]
    );
    return updated;
  }

  async delete(id: UUID): Promise<boolean> {
    if (this.adapter.platform === 'web') {
      const db = (this.adapter as IndexedDBAdapter).getDb();
      await db.journal_entries.delete(id);
      return true;
    }
    const db = (this.adapter as SQLiteAdapter).getDb();
    const res = await db.runAsync('DELETE FROM journal_entries WHERE id = ?', [id]);
    return res.changes > 0;
  }

  async search(query: string): Promise<JournalEntry[]> {
    const q = query.trim().toLowerCase();
    const all = await this.getAll();
    if (!q) return all;
    return all.filter(
      (entry) =>
        entry.title.toLowerCase().includes(q) ||
        entry.content.toLowerCase().includes(q) ||
        (entry.tags && entry.tags.some((t) => t.toLowerCase().includes(q)))
    );
  }

  private mapRow(r: any): JournalEntry {
    return {
      id: r.id,
      title: r.title,
      content: r.content,
      mood: r.mood,
      tags: r.tags ? JSON.parse(r.tags) : [],
      createdAt: r.created_at,
      updatedAt: r.updated_at,
    };
  }
}

export class SettingsRepository implements ISettingsRepository {
  private adapter: IDatabaseAdapter;

  constructor(adapter: IDatabaseAdapter) {
    this.adapter = adapter;
  }

  async getProfile(): Promise<UserProfile | null> {
    if (this.adapter.platform === 'web') {
      const db = (this.adapter as IndexedDBAdapter).getDb();
      const p = await db.user_profile.toCollection().first();
      return p ?? null;
    }
    const db = (this.adapter as SQLiteAdapter).getDb();
    const r = await db.getFirstAsync('SELECT * FROM user_profile LIMIT 1');
    if (!r) return null;
    return {
      id: r.id,
      name: r.name,
      timezone: r.timezone,
      currency: r.currency,
      createdAt: r.created_at,
      updatedAt: r.updated_at,
    };
  }

  async saveProfile(profile: UserProfile): Promise<UserProfile> {
    const now = getNowUTC();
    const record: UserProfile = { ...profile, updatedAt: now };
    if (this.adapter.platform === 'web') {
      const db = (this.adapter as IndexedDBAdapter).getDb();
      await db.user_profile.put(record);
      return record;
    }
    const db = (this.adapter as SQLiteAdapter).getDb();
    await db.runAsync(
      `INSERT INTO user_profile (id, name, timezone, currency, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?)
       ON CONFLICT(id) DO UPDATE SET name = excluded.name, timezone = excluded.timezone, currency = excluded.currency, updated_at = excluded.updated_at`,
      [record.id, record.name, record.timezone, record.currency, record.createdAt, now]
    );
    return record;
  }

  async getSettings(): Promise<AppSettings | null> {
    if (this.adapter.platform === 'web') {
      const db = (this.adapter as IndexedDBAdapter).getDb();
      const s = await db.app_settings.toCollection().first();
      return s ?? null;
    }
    const db = (this.adapter as SQLiteAdapter).getDb();
    const r = await db.getFirstAsync('SELECT * FROM app_settings LIMIT 1');
    if (!r) return null;
    return {
      id: r.id,
      themeMode: r.theme_mode,
      analyticsEnabled: Boolean(r.analytics_enabled),
      biometricsEnabled: Boolean(r.biometrics_enabled),
      notificationsEnabled: Boolean(r.notifications_enabled),
      weekStartsOn: r.week_starts_on,
      createdAt: r.created_at,
      updatedAt: r.updated_at,
    };
  }

  async saveSettings(settings: AppSettings): Promise<AppSettings> {
    const now = getNowUTC();
    const record: AppSettings = { ...settings, updatedAt: now };
    if (this.adapter.platform === 'web') {
      const db = (this.adapter as IndexedDBAdapter).getDb();
      await db.app_settings.put(record);
      return record;
    }
    const db = (this.adapter as SQLiteAdapter).getDb();
    await db.runAsync(
      `INSERT INTO app_settings (id, theme_mode, analytics_enabled, biometrics_enabled, notifications_enabled, week_starts_on, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)
       ON CONFLICT(id) DO UPDATE SET
         theme_mode = excluded.theme_mode,
         analytics_enabled = excluded.analytics_enabled,
         biometrics_enabled = excluded.biometrics_enabled,
         notifications_enabled = excluded.notifications_enabled,
         week_starts_on = excluded.week_starts_on,
         updated_at = excluded.updated_at`,
      [
        record.id,
        record.themeMode,
        record.analyticsEnabled ? 1 : 0,
        record.biometricsEnabled ? 1 : 0,
        record.notificationsEnabled ? 1 : 0,
        record.weekStartsOn,
        record.createdAt,
        now,
      ]
    );
    return record;
  }
}

export class ChatRepository implements IChatRepository {
  private adapter: IDatabaseAdapter;

  constructor(adapter: IDatabaseAdapter) {
    this.adapter = adapter;
  }

  async getSessions(): Promise<ChatSession[]> {
    if (this.adapter.platform === 'web') {
      const db = (this.adapter as IndexedDBAdapter).getDb();
      return db.chat_sessions.reverse().sortBy('createdAt');
    }
    const db = (this.adapter as SQLiteAdapter).getDb();
    const rows = await db.getAllAsync('SELECT * FROM chat_sessions ORDER BY created_at DESC');
    return rows.map((r: any) => ({
      id: r.id,
      title: r.title,
      createdAt: r.created_at,
      updatedAt: r.updated_at,
    }));
  }

  async getSessionById(id: UUID): Promise<ChatSession | null> {
    if (this.adapter.platform === 'web') {
      const db = (this.adapter as IndexedDBAdapter).getDb();
      const s = await db.chat_sessions.get(id);
      return s ?? null;
    }
    const db = (this.adapter as SQLiteAdapter).getDb();
    const r = await db.getFirstAsync('SELECT * FROM chat_sessions WHERE id = ?', [id]);
    if (!r) return null;
    return {
      id: r.id,
      title: r.title,
      createdAt: r.created_at,
      updatedAt: r.updated_at,
    };
  }

  async createSession(title: string): Promise<ChatSession> {
    const now = getNowUTC();
    const session: ChatSession = {
      id: generateUUID(),
      title,
      createdAt: now,
      updatedAt: now,
    };
    if (this.adapter.platform === 'web') {
      const db = (this.adapter as IndexedDBAdapter).getDb();
      await db.chat_sessions.put(session);
      return session;
    }
    const db = (this.adapter as SQLiteAdapter).getDb();
    await db.runAsync(
      'INSERT INTO chat_sessions (id, title, created_at, updated_at) VALUES (?, ?, ?, ?)',
      [session.id, session.title, now, now]
    );
    return session;
  }

  async getMessages(sessionId: UUID): Promise<ChatMessage[]> {
    if (this.adapter.platform === 'web') {
      const db = (this.adapter as IndexedDBAdapter).getDb();
      return db.chat_messages.where('sessionId').equals(sessionId).sortBy('createdAt');
    }
    const db = (this.adapter as SQLiteAdapter).getDb();
    const rows = await db.getAllAsync(
      'SELECT * FROM chat_messages WHERE session_id = ? ORDER BY created_at ASC',
      [sessionId]
    );
    return rows.map((r: any) => ({
      id: r.id,
      sessionId: r.session_id,
      role: r.role,
      content: r.content,
      createdAt: r.created_at,
    }));
  }

  async addMessage(sessionId: UUID, role: 'user' | 'assistant' | 'system', content: string): Promise<ChatMessage> {
    const now = getNowUTC();
    const msg: ChatMessage = {
      id: generateUUID(),
      sessionId,
      role,
      content,
      createdAt: now,
    };
    if (this.adapter.platform === 'web') {
      const db = (this.adapter as IndexedDBAdapter).getDb();
      await db.chat_messages.put(msg);
      return msg;
    }
    const db = (this.adapter as SQLiteAdapter).getDb();
    await db.runAsync(
      'INSERT INTO chat_messages (id, session_id, role, content, created_at) VALUES (?, ?, ?, ?, ?)',
      [msg.id, sessionId, role, content, now]
    );
    return msg;
  }

  async deleteSession(sessionId: UUID): Promise<boolean> {
    if (this.adapter.platform === 'web') {
      const db = (this.adapter as IndexedDBAdapter).getDb();
      await db.chat_messages.where('sessionId').equals(sessionId).delete();
      await db.chat_sessions.delete(sessionId);
      return true;
    }
    const db = (this.adapter as SQLiteAdapter).getDb();
    await db.runAsync('DELETE FROM chat_messages WHERE session_id = ?', [sessionId]);
    const res = await db.runAsync('DELETE FROM chat_sessions WHERE id = ?', [sessionId]);
    return res.changes > 0;
  }
}
