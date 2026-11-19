import { useEffect, useState } from 'react';

export interface StoragePersistenceState {
  isSupported: boolean;
  isPersisted: boolean;
  quotaBytes?: number;
  usageBytes?: number;
  requestPersistence: () => Promise<boolean>;
}

export function usePersistentStorage(): StoragePersistenceState {
  const [isSupported, setIsSupported] = useState(false);
  const [isPersisted, setIsPersisted] = useState(false);
  const [quotaBytes, setQuotaBytes] = useState<number | undefined>(undefined);
  const [usageBytes, setUsageBytes] = useState<number | undefined>(undefined);

  useEffect(() => {
    async function checkStorage() {
      if (typeof navigator !== 'undefined' && navigator.storage) {
        setIsSupported(true);

        if (navigator.storage.persisted) {
          const persisted = await navigator.storage.persisted();
          setIsPersisted(persisted);
        }

        if (navigator.storage.estimate) {
          const estimate = await navigator.storage.estimate();
          setQuotaBytes(estimate.quota);
          setUsageBytes(estimate.usage);
        }
      }
    }

    checkStorage();
  }, []);

  const requestPersistence = async (): Promise<boolean> => {
    if (typeof navigator !== 'undefined' && navigator.storage && navigator.storage.persist) {
      const persisted = await navigator.storage.persist();
      setIsPersisted(persisted);
      return persisted;
    }
    return false;
  };

  return {
    isSupported,
    isPersisted,
    quotaBytes,
    usageBytes,
    requestPersistence,
  };
}
