# LIFEOS Database Foundation & Schema Specification

**Architecture**: Local-first, offline-first.
**Native Adapter**: Expo SQLite (iOS / Android).
**Web Adapter**: IndexedDB via Dexie (Web browsers).

All tables use:
- RFC4122 v4 UUID primary keys (`id`).
- UTC ISO 8601 timestamps (`created_at`, `updated_at`, `timestamp`).
- User timezone stored separately (`user_timezone`).
- Currency amounts stored in integer minor currency units (e.g. cents: `$10.50` = `1050`).
- Foreign key relations and indexing on frequently queried columns.

---

## 1. Canonical Database Entities

### 1. `user_profile`
- `id` (TEXT, PK): Unique user identifier.
- `name` (TEXT): Display name.
- `timezone` (TEXT): Resolved IANA timezone (e.g. `America/New_York`, `Asia/Kolkata`, `UTC`).
- `currency` (TEXT): Default 3-letter ISO currency code (`USD`, `EUR`, `GBP`, etc.).
- `created_at` (TEXT): ISO UTC timestamp.
- `updated_at` (TEXT): ISO UTC timestamp.

### 2. `app_settings`
- `id` (TEXT, PK): Settings key identifier.
- `theme_mode` (TEXT): `'dark'` (default) | `'light'` | `'system'`.
- `analytics_enabled` (INTEGER): `0` or `1`.
- `biometrics_enabled` (INTEGER): `0` or `1`.
- `notifications_enabled` (INTEGER): `0` or `1`.
- `week_starts_on` (INTEGER): `0` (Sunday) | `1` (Monday).
- `created_at` (TEXT): ISO UTC timestamp.
- `updated_at` (TEXT): ISO UTC timestamp.

### 3. `accounts`
- `id` (TEXT, PK): UUID.
- `name` (TEXT): Account label (e.g., 'Main Checking', 'Cash Wallet').
- `type` (TEXT): `'checking'` | `'savings'` | `'credit'` | `'cash'` | `'investment'`.
- `balance_minor` (INTEGER): Balance in minor currency units.
- `currency` (TEXT): ISO currency code.
- `is_archived` (INTEGER): `0` or `1`.
- `created_at` (TEXT): ISO UTC timestamp.
- `updated_at` (TEXT): ISO UTC timestamp.

### 4. `categories`
- `id` (TEXT, PK): UUID.
- `name` (TEXT): Category name (e.g. 'Housing', 'Food & Dining', 'Salary').
- `type` (TEXT): `'income'` | `'expense'` | `'transfer'`.
- `icon` (TEXT): Lucide icon identifier.
- `color` (TEXT): Hex color string.
- `is_system` (INTEGER): `1` for default categories, `0` for user-defined.
- `created_at` (TEXT): ISO UTC timestamp.
- `updated_at` (TEXT): ISO UTC timestamp.

### 5. `transactions`
- `id` (TEXT, PK): UUID.
- `account_id` (TEXT, FK -> `accounts.id` ON DELETE CASCADE).
- `category_id` (TEXT, FK -> `categories.id` ON DELETE RESTRICT).
- `amount_minor` (INTEGER): Positive integer in minor units.
- `type` (TEXT): `'income'` | `'expense'` | `'transfer'`.
- `timestamp` (TEXT): ISO UTC timestamp of transaction.
- `user_timezone` (TEXT): Timezone when transaction was recorded.
- `description` (TEXT): Concise merchant or transaction title.
- `notes` (TEXT, nullable): Detailed memo.
- `tags` (TEXT, JSON array string): List of tag strings.
- `created_at` (TEXT): ISO UTC timestamp.
- `updated_at` (TEXT): ISO UTC timestamp.
- *Indexes*: `timestamp`, `category_id`, `account_id`.

### 6. `budgets`
- `id` (TEXT, PK): UUID.
- `category_id` (TEXT, FK -> `categories.id` ON DELETE CASCADE).
- `limit_minor` (INTEGER): Spending limit in minor currency units.
- `period` (TEXT): `'monthly'` | `'weekly'` | `'yearly'`.
- `start_date` (TEXT): Date string (`YYYY-MM-DD`).
- `end_date` (TEXT, nullable): Date string (`YYYY-MM-DD`).
- `created_at` (TEXT): ISO UTC timestamp.
- `updated_at` (TEXT): ISO UTC timestamp.

### 7. `financial_goals`
- `id` (TEXT, PK): UUID.
- `name` (TEXT): Goal objective (e.g., 'Emergency Fund').
- `target_amount_minor` (INTEGER): Goal target in minor units.
- `current_amount_minor` (INTEGER): Saved amount in minor units.
- `target_date` (TEXT, nullable): Date string (`YYYY-MM-DD`).
- `created_at` (TEXT): ISO UTC timestamp.
- `updated_at` (TEXT): ISO UTC timestamp.

### 8. `tasks`
- `id` (TEXT, PK): UUID.
- `title` (TEXT): Task title.
- `description` (TEXT, nullable): Additional details.
- `priority` (TEXT): `'low'` | `'medium'` | `'high'` | `'urgent'`.
- `status` (TEXT): `'pending'` | `'completed'` | `'cancelled'`.
- `due_date` (TEXT, nullable): ISO UTC string.
- `completed_at` (TEXT, nullable): ISO UTC string.
- `created_at` (TEXT): ISO UTC timestamp.
- `updated_at` (TEXT): ISO UTC timestamp.
- *Indexes*: `status`, `due_date`.

### 9. `reminders`
- `id` (TEXT, PK): UUID.
- `title` (TEXT): Reminder notice.
- `target_time` (TEXT): Target ISO UTC timestamp.
- `recurrence` (TEXT): `'none'` | `'daily'` | `'weekly'` | `'monthly'`.
- `status` (TEXT): `'pending'` | `'dismissed'` | `'completed'`.
- `created_at` (TEXT): ISO UTC timestamp.
- `updated_at` (TEXT): ISO UTC timestamp.
- *Index*: `target_time`.

### 10. `habits`
- `id` (TEXT, PK): UUID.
- `title` (TEXT): Habit routine description.
- `frequency` (TEXT): `'daily'` | `'weekly'`.
- `target_days_per_week` (INTEGER): 1 to 7.
- `streak_count` (INTEGER): Active consecutive day streak.
- `best_streak` (INTEGER): All-time highest streak.
- `is_archived` (INTEGER): `0` or `1`.
- `created_at` (TEXT): ISO UTC timestamp.
- `updated_at` (TEXT): ISO UTC timestamp.

### 11. `habit_logs`
- `id` (TEXT, PK): UUID.
- `habit_id` (TEXT, FK -> `habits.id` ON DELETE CASCADE).
- `completed_date` (TEXT): `YYYY-MM-DD` in user's local context.
- `notes` (TEXT, nullable): Reflection or workout note.
- `created_at` (TEXT): ISO UTC timestamp.
- *Constraints*: `UNIQUE(habit_id, completed_date)`.
- *Indexes*: `completed_date`, `habit_id`.

### 12. `journal_entries`
- `id` (TEXT, PK): UUID.
- `title` (TEXT): Entry title.
- `content` (TEXT): Freeform markdown or text reflection.
- `mood` (TEXT, nullable): `'great'` | `'good'` | `'neutral'` | `'bad'` | `'awful'`.
- `tags` (TEXT, JSON array string).
- `created_at` (TEXT): ISO UTC timestamp.
- `updated_at` (TEXT): ISO UTC timestamp.
- *Index*: `created_at`.

### 13. `chat_sessions`
- `id` (TEXT, PK): UUID.
- `title` (TEXT): Session heading.
- `created_at` (TEXT): ISO UTC timestamp.
- `updated_at` (TEXT): ISO UTC timestamp.

### 14. `chat_messages`
- `id` (TEXT, PK): UUID.
- `session_id` (TEXT, FK -> `chat_sessions.id` ON DELETE CASCADE).
- `role` (TEXT): `'user'` | `'assistant'` | `'system'`.
- `content` (TEXT): Message text.
- `created_at` (TEXT): ISO UTC timestamp.
- *Index*: `session_id`.

---

## 2. Storage Adapters

1. **Native Adapter (`SQLiteAdapter`)**:
   - Uses `expo-sqlite` modern API (`openDatabaseAsync`, `runAsync`, `getAllAsync`, `getFirstAsync`).
   - Executes DDL with `CREATE TABLE IF NOT EXISTS` and creates indexes automatically.
   - Idempotently runs migrations tracked via `_schema_migrations`.
   - Seeds default categories, accounts, settings, and profile.

2. **Web Adapter (`IndexedDBAdapter`)**:
   - Uses `Dexie` to create a dedicated IndexedDB database (`lifeos_indexeddb`).
   - Indexes fields matching SQLite indexes for optimal in-browser querying.
   - Idempotently seeds default records on first run.
