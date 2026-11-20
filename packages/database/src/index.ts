export * from './schema/ddl.ts';
export * from './schema/dexie-schema.ts';
export * from './migrations/index.ts';
export * from './adapters/indexeddb/index.ts';
export * from './adapters/index.ts';
export * from './repositories/index.ts';

import { getDatabaseAdapter } from './adapters/index.ts';
import {
  TransactionRepository,
  AccountRepository,
  CategoryRepository,
  TaskRepository,
  ReminderRepository,
  HabitRepository,
  JournalRepository,
  SettingsRepository,
  ChatRepository,
} from './repositories/index.ts';

export interface DatabaseRepositories {
  transactions: TransactionRepository;
  accounts: AccountRepository;
  categories: CategoryRepository;
  tasks: TaskRepository;
  reminders: ReminderRepository;
  habits: HabitRepository;
  journal: JournalRepository;
  settings: SettingsRepository;
  chat: ChatRepository;
}

let repos: DatabaseRepositories | null = null;

export async function initializeDatabase(): Promise<DatabaseRepositories> {
  const adapter = getDatabaseAdapter();
  await adapter.initialize();

  repos = {
    transactions: new TransactionRepository(adapter),
    accounts: new AccountRepository(adapter),
    categories: new CategoryRepository(adapter),
    tasks: new TaskRepository(adapter),
    reminders: new ReminderRepository(adapter),
    habits: new HabitRepository(adapter),
    journal: new JournalRepository(adapter),
    settings: new SettingsRepository(adapter),
    chat: new ChatRepository(adapter),
  };

  return repos;
}

export function getRepositories(): DatabaseRepositories {
  if (!repos) {
    const adapter = getDatabaseAdapter();
    repos = {
      transactions: new TransactionRepository(adapter),
      accounts: new AccountRepository(adapter),
      categories: new CategoryRepository(adapter),
      tasks: new TaskRepository(adapter),
      reminders: new ReminderRepository(adapter),
      habits: new HabitRepository(adapter),
      journal: new JournalRepository(adapter),
      settings: new SettingsRepository(adapter),
      chat: new ChatRepository(adapter),
    };
  }
  return repos;
}
