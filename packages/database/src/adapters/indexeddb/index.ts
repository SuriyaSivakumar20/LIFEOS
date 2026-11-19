import type { IDatabaseAdapter } from '@lifeos/shared-types';
import { LifeOSDexieDB } from '../../schema/dexie-schema';
import { runDexieMigrations } from '../../migrations/index';

export class IndexedDBAdapter implements IDatabaseAdapter {
  readonly platform = 'web' as const;
  private db: LifeOSDexieDB | null = null;
  private initialized = false;

  constructor(private dbName = 'lifeos_indexeddb') {}

  async initialize(): Promise<void> {
    if (this.initialized && this.db) {
      return;
    }

    try {
      this.db = new LifeOSDexieDB(this.dbName);
      await this.db.open();
      await this.runMigrations();
      this.initialized = true;
    } catch (error) {
      this.initialized = false;
      throw new Error(`Failed to initialize IndexedDB database: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  isInitialized(): boolean {
    return this.initialized;
  }

  getDb(): LifeOSDexieDB {
    if (!this.db) {
      throw new Error('IndexedDB database is not initialized. Call initialize() first.');
    }
    return this.db;
  }

  async runMigrations(): Promise<void> {
    if (!this.db) {
      throw new Error('IndexedDB database is not connected');
    }
    await runDexieMigrations(this.db);
  }

  async close(): Promise<void> {
    if (this.db) {
      this.db.close();
    }
    this.db = null;
    this.initialized = false;
  }

  async resetDatabase(): Promise<void> {
    if (this.db) {
      await this.db.delete();
      this.db = new LifeOSDexieDB(this.dbName);
      await this.db.open();
      await this.runMigrations();
    }
  }
}
