import type { IDatabaseAdapter } from '@lifeos/shared-types';
import { SQLiteAdapter } from './sqlite/index';

let cachedAdapter: IDatabaseAdapter | null = null;

export function getDatabaseAdapter(): IDatabaseAdapter {
  if (cachedAdapter) {
    return cachedAdapter;
  }
  cachedAdapter = new SQLiteAdapter('lifeos.db');
  return cachedAdapter;
}

export function setCustomAdapter(adapter: IDatabaseAdapter): void {
  cachedAdapter = adapter;
}
