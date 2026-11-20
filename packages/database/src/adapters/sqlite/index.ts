import type { IDatabaseAdapter } from '@lifeos/shared-types';
import { runSQLiteMigrations } from '../../migrations/index';

export class SQLiteAdapter implements IDatabaseAdapter {
  readonly platform = 'native' as const;
  private db: any = null;
  private initialized = false;
  private dbName: string;

  constructor(dbName = 'lifeos.db') {
    this.dbName = dbName;
  }

  async initialize(): Promise<void> {
    if (this.initialized && this.db) {
      return;
    }

    try {
      const SQLite = await import('expo-sqlite');
      this.db = await SQLite.openDatabaseAsync(this.dbName);
      await this.runMigrations();
      this.initialized = true;
    } catch (error) {
      this.initialized = false;
      throw new Error(`Failed to initialize SQLite database: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  isInitialized(): boolean {
    return this.initialized;
  }

  getDb(): any {
    if (!this.db) {
      throw new Error('SQLite database is not initialized. Call initialize() first.');
    }
    return this.db;
  }

  async runMigrations(): Promise<void> {
    if (!this.db) {
      throw new Error('Database not connected');
    }
    await runSQLiteMigrations(this.db);
  }

  async close(): Promise<void> {
    if (this.db && typeof this.db.closeAsync === 'function') {
      await this.db.closeAsync();
    }
    this.db = null;
    this.initialized = false;
  }

  async resetDatabase(): Promise<void> {
    if (this.db) {
      await this.db.execAsync(`
        DROP TABLE IF EXISTS _schema_migrations;
        DROP TABLE IF EXISTS chat_messages;
        DROP TABLE IF EXISTS chat_sessions;
        DROP TABLE IF EXISTS journal_entries;
        DROP TABLE IF EXISTS habit_logs;
        DROP TABLE IF EXISTS habits;
        DROP TABLE IF EXISTS reminders;
        DROP TABLE IF EXISTS tasks;
        DROP TABLE IF EXISTS financial_goals;
        DROP TABLE IF EXISTS budgets;
        DROP TABLE IF EXISTS transactions;
        DROP TABLE IF EXISTS categories;
        DROP TABLE IF EXISTS accounts;
        DROP TABLE IF EXISTS app_settings;
        DROP TABLE IF EXISTS user_profile;
      `);
      await this.runMigrations();
    }
  }
}
