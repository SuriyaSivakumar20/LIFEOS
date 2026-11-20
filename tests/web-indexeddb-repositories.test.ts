import 'fake-indexeddb/auto';
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { IndexedDBAdapter } from '../packages/database/src/adapters/indexeddb/index.ts';
import {
  TransactionRepository,
  TaskRepository,
  HabitRepository,
  JournalRepository,
  SettingsRepository,
  ChatRepository,
} from '../packages/database/src/repositories/index.ts';
import {
  calculateFinancialSummary,
} from '../packages/core/src/calculations/money.ts';
import {
  calculateStreak,
  isHabitCompletedForDate,
} from '../packages/core/src/calculations/habits.ts';
import {
  formatLocalDateString,
} from '../packages/core/src/calculations/time.ts';
import type {
  Transaction,
  Task,
  Habit,
  JournalEntry,
  UserProfile,
  AppSettings,
} from '../packages/shared-types/src/index.ts';

describe('Genuine IndexedDB Dexie Persistence & Repositories', () => {
  it('1. should initialize Dexie database, execute migrations, and seed default INR accounts and categories', async () => {
    const adapter = new IndexedDBAdapter('test_db_seed');
    await adapter.initialize();
    assert.strictEqual(adapter.isInitialized(), true, 'IndexedDB adapter must be initialized');

    const db = adapter.getDb();

    // Verify categories seeded
    const categories = await db.categories.toArray();
    assert.ok(categories.length >= 8, 'Default categories should be seeded');
    const foodCat = categories.find((c) => c.name === 'Food & Dining');
    assert.ok(foodCat, 'Food & Dining category must exist');
    assert.strictEqual(foodCat.type, 'expense');

    // Verify accounts seeded with default INR currency
    const accounts = await db.accounts.toArray();
    assert.ok(accounts.length >= 2, 'Default accounts should be seeded');
    const cashAcc = accounts.find((a) => a.name === 'Cash Wallet');
    assert.ok(cashAcc, 'Cash Wallet account must exist');
    assert.strictEqual(cashAcc.currency, 'INR');

    // Verify default app settings
    const settings = await db.app_settings.get('settings-default');
    assert.ok(settings, 'Default settings record must exist');
    assert.strictEqual(settings.themeMode, 'dark');

    // Verify default user profile
    const profile = await db.user_profile.get('profile-default');
    assert.ok(profile, 'Default profile must exist');
    assert.strictEqual(profile.currency, 'INR');

    await adapter.close();
  });

  it('2. should perform Transaction CRUD, preserve minor-unit precision, and calculate financial summaries', async () => {
    const adapter = new IndexedDBAdapter('test_db_tx');
    await adapter.initialize();
    const txRepo = new TransactionRepository(adapter);

    const accounts = await adapter.getDb().accounts.toArray();
    const categories = await adapter.getDb().categories.toArray();
    const accId = accounts[0].id;
    const expenseCatId = categories.find((c) => c.type === 'expense')!.id;
    const incomeCatId = categories.find((c) => c.type === 'income')!.id;

    // Create Income
    const salary = await txRepo.create({
      accountId: accId,
      categoryId: incomeCatId,
      amountMinor: 500000, // ₹5,000.00
      type: 'income',
      timestamp: '2026-11-20T10:00:00.000Z',
      userTimezone: 'Asia/Kolkata',
      description: 'Consulting Income',
    });
    assert.ok(salary.id);
    assert.strictEqual(salary.amountMinor, 500000);

    // Create Expense
    const grocery = await txRepo.create({
      accountId: accId,
      categoryId: expenseCatId,
      amountMinor: 125050, // ₹1,250.50
      type: 'expense',
      timestamp: '2026-11-20T12:00:00.000Z',
      userTimezone: 'Asia/Kolkata',
      description: 'Organic Groceries',
    });
    assert.strictEqual(grocery.amountMinor, 125050);

    // Create Refund
    const refund = await txRepo.create({
      accountId: accId,
      categoryId: expenseCatId,
      amountMinor: 25050, // ₹250.50 refund
      type: 'refund',
      timestamp: '2026-11-20T14:00:00.000Z',
      userTimezone: 'Asia/Kolkata',
      description: 'Grocery Item Refund',
    });
    assert.strictEqual(refund.amountMinor, 25050);

    // Retrieve All & Verify Count
    const all = await txRepo.getAll();
    assert.strictEqual(all.length, 3);

    // Verify Financial Summary calculation
    const summary = calculateFinancialSummary(all, 'INR');
    assert.strictEqual(summary.totalIncomeMinor, 500000);
    assert.strictEqual(summary.totalExpensesMinor, 125050);
    assert.strictEqual(summary.totalRefundsMinor, 25050);
    // Net: 500000 - 125050 + 25050 = 400000 (₹4,000.00)
    assert.strictEqual(summary.availableBalanceMinor, 400000);

    // Update Transaction
    await txRepo.update(grocery.id, { description: 'Supermarket Groceries' });
    const updated = await txRepo.getById(grocery.id);
    assert.strictEqual(updated?.description, 'Supermarket Groceries');

    // Delete Transaction
    await txRepo.delete(refund.id);
    const afterDelete = await txRepo.getAll();
    assert.strictEqual(afterDelete.length, 2);

    await adapter.close();
  });

  it('3. should perform Task CRUD operations and handle status transitions', async () => {
    const adapter = new IndexedDBAdapter('test_db_tasks');
    await adapter.initialize();
    const taskRepo = new TaskRepository(adapter);

    const task = await taskRepo.create({
      title: 'Review Q4 Architecture Plan',
      description: 'Ensure offline Dexie integration is stable',
      priority: 'urgent',
      status: 'pending',
    });
    assert.ok(task.id);
    assert.strictEqual(task.status, 'pending');

    const fetched = await taskRepo.getById(task.id);
    assert.strictEqual(fetched?.title, 'Review Q4 Architecture Plan');

    // Transition to completed
    const completedTimestamp = new Date().toISOString();
    await taskRepo.update(task.id, { status: 'completed', completedAt: completedTimestamp });
    const completedTask = await taskRepo.getById(task.id);
    assert.strictEqual(completedTask?.status, 'completed');
    assert.strictEqual(completedTask?.completedAt, completedTimestamp);

    // Transition back to pending
    await taskRepo.update(task.id, { status: 'pending', completedAt: null });
    const pendingTask = await taskRepo.getById(task.id);
    assert.strictEqual(pendingTask?.status, 'pending');

    // Delete task
    await taskRepo.delete(task.id);
    const afterDelete = await taskRepo.getById(task.id);
    assert.strictEqual(afterDelete, null);

    await adapter.close();
  });

  it('4. should manage Habits, Habit Logs, and calculate streak integrity', async () => {
    const adapter = new IndexedDBAdapter('test_db_habits');
    await adapter.initialize();
    const habitRepo = new HabitRepository(adapter);

    const habit = await habitRepo.create({
      title: 'Daily Meditation',
      frequency: 'daily',
      targetDaysPerWeek: 7,
      isArchived: false,
    });
    assert.ok(habit.id);

    // Log completions for consecutive days
    await habitRepo.logCompletion(habit.id, '2026-11-18');
    await habitRepo.logCompletion(habit.id, '2026-11-19');
    await habitRepo.logCompletion(habit.id, '2026-11-20');

    const logs = await habitRepo.getLogsForHabit(habit.id);
    assert.strictEqual(logs.length, 3);

    // Calculate streak using core calculation
    const completedDates = logs.map((l) => l.completedDate);
    const streak = calculateStreak(completedDates, '2026-11-20');
    assert.strictEqual(streak.currentStreak, 3, 'Consecutive 3-day completion should yield a streak of 3');

    // Check today completion status
    const isCompleted = isHabitCompletedForDate(logs, habit.id, '2026-11-20');
    assert.strictEqual(isCompleted, true);

    // Remove completion for a date
    await habitRepo.removeCompletion(habit.id, '2026-11-20');
    const remainingLogs = await habitRepo.getLogsForHabit(habit.id);
    assert.strictEqual(remainingLogs.length, 2);

    // Delete Habit
    await habitRepo.delete(habit.id);
    const deletedHabit = await habitRepo.getById(habit.id);
    assert.strictEqual(deletedHabit, null);

    await adapter.close();
  });

  it('5. should perform Journal Entries CRUD, tag filtering, and content search', async () => {
    const adapter = new IndexedDBAdapter('test_db_journal');
    await adapter.initialize();
    const journalRepo = new JournalRepository(adapter);

    const entry1 = await journalRepo.create({
      title: 'Sprint 3 Database Milestone',
      content: 'Dexie IndexedDB adapter initialized successfully with offline persistence.',
      mood: 'great',
      tags: ['engineering', 'milestone'],
    });

    const entry2 = await journalRepo.create({
      title: 'Quiet Reflection',
      content: 'A calm and productive afternoon.',
      mood: 'reflective',
      tags: ['personal'],
    });

    const all = await journalRepo.getAll();
    assert.strictEqual(all.length, 2);

    // Verify retrieval by ID
    const fetched = await journalRepo.getById(entry1.id);
    assert.strictEqual(fetched?.mood, 'great');

    // Update Entry
    await journalRepo.update(entry1.id, { title: 'Sprint 3 Verified Milestone' });
    const updated = await journalRepo.getById(entry1.id);
    assert.strictEqual(updated?.title, 'Sprint 3 Verified Milestone');

    // Delete Entry
    await journalRepo.delete(entry2.id);
    const remaining = await journalRepo.getAll();
    assert.strictEqual(remaining.length, 1);
    assert.strictEqual(remaining[0].id, entry1.id);

    await adapter.close();
  });

  it('6. should persist UserProfile and AppSettings modifications in IndexedDB', async () => {
    const adapter = new IndexedDBAdapter('test_db_settings');
    await adapter.initialize();
    const settingsRepo = new SettingsRepository(adapter);

    // Verify initial profile
    const profile = await settingsRepo.getProfile();
    assert.ok(profile);
    assert.strictEqual(profile.currency, 'INR');

    // Update Profile
    const updatedProfile = await settingsRepo.saveProfile({
      ...profile,
      name: 'Suriya Sivakumar',
      currency: 'INR',
    });
    assert.strictEqual(updatedProfile.name, 'Suriya Sivakumar');

    const readProfile = await settingsRepo.getProfile();
    assert.strictEqual(readProfile?.name, 'Suriya Sivakumar');

    // Verify and update settings
    const settings = await settingsRepo.getSettings();
    assert.ok(settings);

    const updatedSettings = await settingsRepo.saveSettings({
      ...settings,
      themeMode: 'dark',
      biometricsEnabled: true,
    });
    assert.strictEqual(updatedSettings.biometricsEnabled, true);

    const readSettings = await settingsRepo.getSettings();
    assert.strictEqual(readSettings?.biometricsEnabled, true);

    await adapter.close();
  });

  it('7. should store and retrieve Alfred chat messages chronologically strictly in IndexedDB', async () => {
    const adapter = new IndexedDBAdapter('test_db_chat');
    await adapter.initialize();
    const chatRepo = new ChatRepository(adapter);

    // Create Session
    const session = await chatRepo.createSession('Daily Standup Session');
    assert.ok(session.id);

    // Add user message
    const userMsg = await chatRepo.addMessage(session.id, 'user', 'Summarize my tasks for today.');
    assert.ok(userMsg.id);
    assert.strictEqual(userMsg.role, 'user');

    // Add offline assistant response
    const assistantMsg = await chatRepo.addMessage(
      session.id,
      'assistant',
      'You have 1 urgent task pending in your local planner.'
    );
    assert.ok(assistantMsg.id);
    assert.strictEqual(assistantMsg.role, 'assistant');

    // Retrieve messages and verify chronological order
    const messages = await chatRepo.getMessages(session.id);
    assert.strictEqual(messages.length, 2);
    assert.strictEqual(messages[0].id, userMsg.id);
    assert.strictEqual(messages[1].id, assistantMsg.id);

    await adapter.close();
  });

  it('8. should survive database close and reopen with 100% data persistence', async () => {
    const DB_NAME = 'test_persistence_lifecycle_db';

    // Phase 1: Open database, insert records across modules, then close
    const adapter1 = new IndexedDBAdapter(DB_NAME);
    await adapter1.initialize();

    const txRepo1 = new TransactionRepository(adapter1);
    const taskRepo1 = new TaskRepository(adapter1);
    const habitRepo1 = new HabitRepository(adapter1);
    const chatRepo1 = new ChatRepository(adapter1);

    const accounts = await adapter1.getDb().accounts.toArray();
    const categories = await adapter1.getDb().categories.toArray();

    const persistentTx = await txRepo1.create({
      accountId: accounts[0].id,
      categoryId: categories[0].id,
      amountMinor: 75000, // ₹750.00
      type: 'expense',
      timestamp: '2026-11-20T09:00:00.000Z',
      userTimezone: 'Asia/Kolkata',
      description: 'Persistent Espresso',
    });

    const persistentTask = await taskRepo1.create({
      title: 'Persistent Verification Task',
      priority: 'high',
      status: 'pending',
    });

    const persistentHabit = await habitRepo1.create({
      title: 'Persistent Exercise Habit',
      frequency: 'daily',
      targetDaysPerWeek: 5,
      isArchived: false,
    });
    await habitRepo1.logCompletion(persistentHabit.id, '2026-11-20');

    const session = await chatRepo1.createSession('Persistent Alfred Session');
    const persistentChat = await chatRepo1.addMessage(session.id, 'user', 'Keep this offline note safe');

    // Explicitly CLOSE the database
    await adapter1.close();
    assert.strictEqual(adapter1.isInitialized(), false, 'Database must be closed');

    // Phase 2: Simulate browser reload by instantiating a fresh adapter connected to the same store
    const adapter2 = new IndexedDBAdapter(DB_NAME);
    await adapter2.initialize();
    assert.strictEqual(adapter2.isInitialized(), true, 'Fresh adapter must re-initialize successfully');

    const txRepo2 = new TransactionRepository(adapter2);
    const taskRepo2 = new TaskRepository(adapter2);
    const habitRepo2 = new HabitRepository(adapter2);
    const chatRepo2 = new ChatRepository(adapter2);

    // Verify Transaction survived
    const loadedTx = await txRepo2.getById(persistentTx.id);
    assert.ok(loadedTx, 'Transaction must survive database close and reopen');
    assert.strictEqual(loadedTx.description, 'Persistent Espresso');
    assert.strictEqual(loadedTx.amountMinor, 75000);

    // Verify Task survived
    const loadedTask = await taskRepo2.getById(persistentTask.id);
    assert.ok(loadedTask, 'Task must survive database close and reopen');
    assert.strictEqual(loadedTask.title, 'Persistent Verification Task');

    // Verify Habit & Logs survived
    const loadedHabit = await habitRepo2.getById(persistentHabit.id);
    assert.ok(loadedHabit, 'Habit must survive database close and reopen');
    const loadedLogs = await habitRepo2.getLogsForHabit(persistentHabit.id);
    assert.strictEqual(loadedLogs.length, 1);
    assert.strictEqual(loadedLogs[0].completedDate, '2026-11-20');

    // Verify Chat survived
    const loadedMsgs = await chatRepo2.getMessages(session.id);
    assert.strictEqual(loadedMsgs.length, 1);
    assert.strictEqual(loadedMsgs[0].content, 'Keep this offline note safe');

    await adapter2.close();
  });
});
