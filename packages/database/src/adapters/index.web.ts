import type { IDatabaseAdapter } from '@lifeos/shared-types';
import { IndexedDBAdapter } from './indexeddb/index';

let cachedAdapter: IDatabaseAdapter | null = null;

export function getDatabaseAdapter(): IDatabaseAdapter {
  if (cachedAdapter) {
    return cachedAdapter;
  }
  cachedAdapter = new IndexedDBAdapter('lifeos_indexeddb');
  return cachedAdapter;
}

export function setCustomAdapter(adapter: IDatabaseAdapter): void {
  cachedAdapter = adapter;
}
