import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { runDexieMigrations } from '../packages/database/src/migrations/index.ts';
import {
  TransactionRepository,
  TaskRepository,
  HabitRepository,
  JournalRepository,
  SettingsRepository,
  ChatRepository,
} from '../packages/database/src/repositories/index.ts';
import type { IDatabaseAdapter, Transaction, Task, Habit, JournalEntry, UserProfile, AppSettings } from '../packages/shared-types/src/index.ts';

// In-Memory Dexie Mock Table Implementation
class MockDexieTable<T extends { id: string }> {
  private data = new Map<string, T>();

  async get(id: string): Promise<T | undefined> {
    const item = this.data.get(id);
    return item ? JSON.parse(JSON.stringify(item)) : undefined;
  }

  async put(item: T): Promise<string> {
    this.data.set(item.id, JSON.parse(JSON.stringify(item)));
    return item.id;
  }

  async delete(id: string): Promise<void> {
    this.data.delete(id);
  }

  async toArray(): Promise<T[]> {
    return Array.from(this.data.values()).map((v) => JSON.parse(JSON.stringify(v)));
  }

  async count(): Promise<number> {
    return this.data.size;
  }

  async bulkPut(items: T[]): Promise<void> {
    for (const item of items) {
      await this.put(item);
    }
  }

  reverse() {
    return {
      sortBy: async (field: keyof T): Promise<T[]> => {
        const all = await this.toArray();
        return all.sort((a, b) => (b[field] > a[field] ? 1 : -1));
      },
    };
  }

  where(field: string) {
    return {
      equals: (val: any) => ({
        toArray: async (): Promise<T[]> => {
          const all = await this.toArray();
          return all.filter((item: any) => item[field] === val);
        },
      }),
      between: (lower: string, upper: string) => ({
        toArray: async (): Promise<T[]> => {
          const all = await this.toArray();
          return all.filter((item: any) => item[field] >= lower && item[field] <= upper);
        },
      }),
    };
  }

  orderBy(field: string) {
    return {
      toArray: async (): Promise<T[]> => {
        const all = await this.toArray();
        return all.sort((a: any, b: any) => (a[field] > b[field] ? 1 : -1));
      },
    };
  }

  filter(predicate: (item: T) => boolean) {
    return {
      toArray: async (): Promise<T[]> => {
        const all = await this.toArray();
        return all.filter(predicate);
      },
    };
  }
}

class MockDexieDB {
  user_profile = new MockDexieTable<any>();
  app_settings = new MockDexieTable<any>();
  accounts = new MockDexieTable<any>();
  categories = new MockDexieTable<any>();
  transactions = new MockDexieTable<any>();
  budgets = new MockDexieTable<any>();
  financial_goals = new MockDexieTable<any>();
  tasks = new MockDexieTable<any>();
  reminders = new MockDexieTable<any>();
  habits = new MockDexieTable<any>();
  habit_logs = new MockDexieTable<any>();
  journal_entries = new MockDexieTable<any>();
  chat_sessions = new MockDexieTable<any>();
  chat_messages = new MockDexieTable<any>();
}

class MockWebAdapter implements IDatabaseAdapter {
  readonly platform = 'web' as const;
  private db: MockDexieDB;
  private initialized = false;

  constructor(sharedDb?: MockDexieDB) {
    this.db = sharedDb || new MockDexieDB();
  }

  async initialize(): Promise<void> {
    this.initialized = true;
    await this.runMigrations();
  }

  isInitialized(): boolean {
    return this.initialized;
  }

  async runMigrations(): Promise<void> {
    await runDexieMigrations(this.db as any);
  }

  async close(): Promise<void> {
    this.initialized = false;
  }

  async resetDatabase(): Promise<void> {
    this.db = new MockDexieDB();
  }

  getDb(): any {
    return this.db;
  }
}

describe('Web IndexedDB Repositories & Dexie Migrations', () => {
  it('should run Dexie migrations and seed default INR accounts, profile, and categories', async () => {
    const adapter = new MockWebAdapter();
    await adapter.initialize();

    const db = adapter.getDb();
    const catCount = await db.categories.count();
    const accCount = await db.accounts.count();
    const profile = await db.user_profile.get('profile-default');
    const settings = await db.app_settings.get('settings-default');

    assert.ok(catCount >= 10, 'Default categories should be seeded');
    assert.ok(accCount >= 2, 'Default accounts should be seeded');
    assert.equal(profile.currency, 'INR', 'Default profile currency must be INR');
    assert.equal(settings.themeMode, 'dark', 'Default settings themeMode must be dark');
  });

  it('should perform Transaction CRUD on Web platform and maintain minor-unit integrity', async () => {
    const adapter = new MockWebAdapter();
    await adapter.initialize();
    const repo = new TransactionRepository(adapter);

    const created = await repo.create({
      accountId: 'acc-cash',
      categoryId: 'cat-exp-food',
      amountMinor: 25050, // ₹250.50
      type: 'expense',
      timestamp: '2026-11-19T12:00:00.000Z',
      userTimezone: 'Asia/Kolkata',
      description: 'Healthy Lunch',
      notes: null,
      tags: [],
    });

    assert.ok(created.id);
    assert.equal(created.amountMinor, 25050);
    assert.equal(created.type, 'expense');

    const fetched = await repo.getById(created.id);
    assert.ok(fetched);
    assert.equal(fetched.description, 'Healthy Lunch');

    // Add refund
    const refund = await repo.create({
      accountId: 'acc-cash',
      categoryId: 'cat-exp-food',
      amountMinor: 5050,
      type: 'refund',
      timestamp: '2026-11-19T14:00:00.000Z',
      userTimezone: 'Asia/Kolkata',
      description: 'Refund for item',
    });
    assert.equal(refund.type, 'refund');

    const all = await repo.getAll();
    assert.equal(all.length, 2);

    await repo.delete(created.id);
    const postDelete = await repo.getById(created.id);
    assert.equal(postDelete, null);
  });

  it('should perform Task and Habit CRUD operations on Web platform', async () => {
    const adapter = new MockWebAdapter();
    await adapter.initialize();

    const taskRepo = new TaskRepository(adapter);
    const habitRepo = new HabitRepository(adapter);

    // Task
    const task = await taskRepo.create({
      title: 'Review Sprint 3 deliverables',
      description: 'Check IndexedDB persistence',
      priority: 'high',
      status: 'pending',
      dueDate: '2026-11-19T18:00:00.000Z',
      completedAt: null,
    });
    assert.ok(task.id);
    assert.equal(task.status, 'pending');

    await taskRepo.update(task.id, { status: 'completed' });
    const updatedTask = await taskRepo.getById(task.id);
    assert.equal(updatedTask?.status, 'completed');

    // Habit
    const habit = await habitRepo.create({
      title: 'Daily Evening Reflection',
      frequency: 'daily',
      targetDaysPerWeek: 7,
      color: '#F28C28',
      icon: 'flame',
      isArchived: false,
    });
    assert.ok(habit.id);

    await habitRepo.logCompletion(habit.id, '2026-11-19');
    const logs = await habitRepo.getTodayLogs('2026-11-19');
    assert.ok(logs.some((l) => l.habitId === habit.id));
  });

  it('should persist data across simulated browser reloads with shared IndexedDB storage', async () => {
    const sharedDb = new MockDexieDB();

    // First session: write data
    const session1 = new MockWebAdapter(sharedDb);
    await session1.initialize();
    const journalRepo1 = new JournalRepository(session1);

    const entry = await journalRepo1.create({
      title: 'Day 1 on PWA',
      content: 'Migrated to Dexie IndexedDB and verified persistence.',
      mood: 'great',
      tags: ['pwa', 'migration'],
    });

    await session1.close();

    // Second session: reopen database (simulating page reload)
    const session2 = new MockWebAdapter(sharedDb);
    await session2.initialize();
    const journalRepo2 = new JournalRepository(session2);

    const recovered = await journalRepo2.getById(entry.id);
    assert.ok(recovered, 'Record must survive browser restart / adapter re-initialization');
    assert.equal(recovered.title, 'Day 1 on PWA');
    assert.equal(recovered.mood, 'great');
  });

  it('should store and retrieve Alfred chat messages on Web platform without cloud dependency', async () => {
    const adapter = new MockWebAdapter();
    await adapter.initialize();
    const chatRepo = new ChatRepository(adapter);

    const session = await chatRepo.createSession('Test Alfred Session');
    assert.ok(session.id);

    const userMsg = await chatRepo.addMessage(session.id, 'user', 'How are my finances?');
    assert.equal(userMsg.role, 'user');
    assert.equal(userMsg.content, 'How are my finances?');

    const messages = await chatRepo.getMessages(session.id);
    assert.equal(messages.length, 1);
    assert.equal(messages[0].content, 'How are my finances?');
  });
});

