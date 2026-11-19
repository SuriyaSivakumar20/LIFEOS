import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  SQLITE_TABLES_DDL,
  DEFAULT_CATEGORIES,
  DEFAULT_ACCOUNTS,
  SCHEMA_VERSION,
} from '../packages/database/src/schema/ddl.ts';
import { TransactionRepository } from '../packages/database/src/repositories/index.ts';
import type { IDatabaseAdapter, Transaction } from '../packages/shared-types/src/index.ts';

class MockSQLiteAdapter implements IDatabaseAdapter {
  readonly platform = 'native' as const;
  private rows: Map<string, any> = new Map();
  private initialized = false;

  async initialize(): Promise<void> {
    this.initialized = true;
  }
  isInitialized(): boolean {
    return this.initialized;
  }
  async runMigrations(): Promise<void> {}
  async close(): Promise<void> {
    this.initialized = false;
  }
  async resetDatabase(): Promise<void> {
    this.rows.clear();
  }

  getDb() {
    return {
      getAllAsync: async (sql: string, params: any[] = []) => {
        const all = Array.from(this.rows.values());
        if (sql.includes('LIMIT')) {
          const limit = params[0] || 10;
          return all.slice(0, limit);
        }
        return all;
      },
      getFirstAsync: async (sql: string, params: any[] = []) => {
        return this.rows.get(params[0]) || null;
      },
      runAsync: async (sql: string, params: any[] = []) => {
        if (sql.startsWith('INSERT INTO transactions')) {
          const [id, account_id, category_id, amount_minor, type, timestamp, user_timezone, description, notes, tags, created_at, updated_at] = params;
          this.rows.set(id, {
            id,
            account_id,
            category_id,
            amount_minor,
            type,
            timestamp,
            user_timezone,
            description,
            notes,
            tags,
            created_at,
            updated_at,
          });
          return { changes: 1 };
        }
        if (sql.startsWith('DELETE FROM transactions')) {
          const id = params[0];
          const existed = this.rows.has(id);
          this.rows.delete(id);
          return { changes: existed ? 1 : 0 };
        }
        if (sql.startsWith('UPDATE transactions')) {
          const id = params[params.length - 1];
          const existing = this.rows.get(id);
          if (existing) {
            const [account_id, category_id, amount_minor, type, timestamp, user_timezone, description, notes, tags, updated_at] = params;
            this.rows.set(id, {
              ...existing,
              account_id,
              category_id,
              amount_minor,
              type,
              timestamp,
              user_timezone,
              description,
              notes,
              tags,
              updated_at,
            });
            return { changes: 1 };
          }
          return { changes: 0 };
        }
        return { changes: 0 };
      },
    };
  }
}

describe('Database Foundation & Transaction Repository', () => {
  it('should define all 14 canonical database tables in DDL', () => {
    const requiredTables = [
      'user_profile',
      'app_settings',
      'accounts',
      'categories',
      'transactions',
      'budgets',
      'financial_goals',
      'tasks',
      'reminders',
      'habits',
      'habit_logs',
      'journal_entries',
      'chat_sessions',
      'chat_messages',
    ];

    for (const table of requiredTables) {
      assert.ok(
        SQLITE_TABLES_DDL.includes(`CREATE TABLE IF NOT EXISTS ${table}`),
        `Table definition missing for ${table}`
      );
    }
    assert.equal(SCHEMA_VERSION, 1);
  });

  it('should define default seed categories and accounts with INR default currency', () => {
    assert.ok(DEFAULT_CATEGORIES.length >= 8);
    assert.ok(DEFAULT_ACCOUNTS.length >= 2);
    for (const acc of DEFAULT_ACCOUNTS) {
      assert.equal(acc.currency, 'INR');
    }
    assert.ok(SQLITE_TABLES_DDL.includes("currency TEXT NOT NULL DEFAULT 'INR'"));
  });

  it('should perform CRUD operations via TransactionRepository', async () => {
    const adapter = new MockSQLiteAdapter();
    await adapter.initialize();
    const repo = new TransactionRepository(adapter);

    // Create
    const created = await repo.create({
      accountId: 'acc-1',
      categoryId: 'cat-food',
      amountMinor: 1850,
      type: 'expense',
      timestamp: '2026-11-16T12:00:00.000Z',
      userTimezone: 'UTC',
      description: 'Healthy Lunch',
      notes: null,
      tags: ['food'],
    });

    assert.ok(created.id);
    assert.equal(created.amountMinor, 1850);
    assert.equal(created.description, 'Healthy Lunch');

    // Get by ID
    const fetched = await repo.getById(created.id);
    assert.ok(fetched);
    assert.equal(fetched.description, 'Healthy Lunch');

    // Update
    const updated = await repo.update(created.id, {
      description: 'Healthy Lunch (Updated)',
      amountMinor: 2000,
    });
    assert.ok(updated);
    assert.equal(updated.description, 'Healthy Lunch (Updated)');
    assert.equal(updated.amountMinor, 2000);

    // Delete
    const deleted = await repo.delete(created.id);
    assert.equal(deleted, true);

    const postDelete = await repo.getById(created.id);
    assert.equal(postDelete, null);
  });
});
