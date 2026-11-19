import { Platform } from 'react-native';
import type { IDatabaseAdapter } from '@lifeos/shared-types';
import { IndexedDBAdapter } from './indexeddb/index';

let cachedAdapter: IDatabaseAdapter | null = null;

export function getDatabaseAdapter(): IDatabaseAdapter {
  if (cachedAdapter) {
    return cachedAdapter;
  }

  const isWeb =
    Platform.OS === 'web' ||
    (typeof window !== 'undefined' && typeof window.indexedDB !== 'undefined');

  let adapter: IDatabaseAdapter;
  if (isWeb) {
    adapter = new IndexedDBAdapter('lifeos_indexeddb');
  } else {
    try {
      // Lazy import on native platforms to prevent bundling on web
      const { SQLiteAdapter } = require('./sqlite/index');
      adapter = new SQLiteAdapter('lifeos.db');
    } catch {
      adapter = new IndexedDBAdapter('lifeos_indexeddb');
    }
  }

  cachedAdapter = adapter;
  return adapter;
}

export function setCustomAdapter(adapter: IDatabaseAdapter): void {
  cachedAdapter = adapter;
}
