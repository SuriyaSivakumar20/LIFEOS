import { DEFAULT_CATEGORIES, DEFAULT_ACCOUNTS, SCHEMA_VERSION, SQLITE_TABLES_DDL } from '../schema/ddl';
import type { LifeOSDexieDB } from '../schema/dexie-schema';

export async function runSQLiteMigrations(db: any): Promise<void> {
  // Execute table creation and indexes
  await db.execAsync(SQLITE_TABLES_DDL);

  // Check version
  const rows = await db.getAllAsync(
    'SELECT version FROM _schema_migrations WHERE version = ?',
    [SCHEMA_VERSION]
  );

  const now = new Date().toISOString();

  if (rows.length === 0) {
    // Record migration
    await db.runAsync(
      'INSERT INTO _schema_migrations (version, applied_at) VALUES (?, ?)',
      [SCHEMA_VERSION, now]
    );

    // Seed default categories idempotently
    for (const cat of DEFAULT_CATEGORIES) {
      await db.runAsync(
        `INSERT OR IGNORE INTO categories (id, name, type, icon, color, is_system, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [cat.id, cat.name, cat.type, cat.icon, cat.color, cat.isSystem ? 1 : 0, now, now]
      );
    }

    // Seed default accounts idempotently
    for (const acc of DEFAULT_ACCOUNTS) {
      await db.runAsync(
        `INSERT OR IGNORE INTO accounts (id, name, type, balance_minor, currency, is_archived, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [acc.id, acc.name, acc.type, acc.balanceMinor, acc.currency, acc.isArchived ? 1 : 0, now, now]
      );
    }

    // Seed default settings if not exists
    await db.runAsync(
      `INSERT OR IGNORE INTO app_settings (id, theme_mode, analytics_enabled, biometrics_enabled, notifications_enabled, week_starts_on, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      ['settings-default', 'dark', 0, 0, 1, 1, now, now]
    );

    // Seed default user profile if not exists (INR as default currency)
    const tz = typeof Intl !== 'undefined' ? Intl.DateTimeFormat().resolvedOptions().timeZone || 'Asia/Kolkata' : 'Asia/Kolkata';
    await db.runAsync(
      `INSERT OR IGNORE INTO user_profile (id, name, timezone, currency, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?)`,
      ['profile-default', 'User', tz, 'INR', now, now]
    );
  }
}

export async function runDexieMigrations(db: LifeOSDexieDB): Promise<void> {
  const now = new Date().toISOString();

  // Seed default categories if table is empty
  const catCount = await db.categories.count();
  if (catCount === 0) {
    await db.categories.bulkPut(
      DEFAULT_CATEGORIES.map((c) => ({
        ...c,
        type: c.type as 'income' | 'expense' | 'transfer',
        createdAt: now,
        updatedAt: now,
      }))
    );
  }

  // Seed default accounts if table is empty
  const accCount = await db.accounts.count();
  if (accCount === 0) {
    await db.accounts.bulkPut(
      DEFAULT_ACCOUNTS.map((a) => ({
        ...a,
        type: a.type as any,
        createdAt: now,
        updatedAt: now,
      }))
    );
  }

  // Seed default settings
  const settingsCount = await db.app_settings.count();
  if (settingsCount === 0) {
    await db.app_settings.put({
      id: 'settings-default',
      themeMode: 'dark',
      analyticsEnabled: false,
      biometricsEnabled: false,
      notificationsEnabled: true,
      weekStartsOn: 1,
      createdAt: now,
      updatedAt: now,
    });
  }

  // Seed default profile
  const profileCount = await db.user_profile.count();
  if (profileCount === 0) {
    const tz = typeof Intl !== 'undefined' ? Intl.DateTimeFormat().resolvedOptions().timeZone || 'Asia/Kolkata' : 'Asia/Kolkata';
    await db.user_profile.put({
      id: 'profile-default',
      name: 'User',
      timezone: tz,
      currency: 'INR',
      createdAt: now,
      updatedAt: now,
    });
  }
}
