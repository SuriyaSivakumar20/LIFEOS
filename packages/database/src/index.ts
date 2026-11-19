export * from './schema/ddl';
export * from './schema/dexie-schema';
export * from './migrations/index';
export * from './adapters/indexeddb/index';
export * from './adapters/index';
export * from './repositories/index';

import { getDatabaseAdapter } from './adapters/index';
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
} from './repositories/index';

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
