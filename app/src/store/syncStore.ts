import { create } from 'zustand';
import { debounce } from 'lodash';

import { SyncService } from '../services/syncService';
import { RecordService } from '../services/recordService';
import { useRecordStore } from './recordStore';

type SyncState = {
  isOnline: boolean;
  isSyncing: boolean;
  lastSyncAt: number | null;
  lastError: string | null;
  setOnline: (online: boolean) => void;
  syncNow: () => Promise<void>;
  queueSync: (reason: string) => void;
  debouncedSync: () => void;
  hasUnsyncedData: () => boolean;
};

const syncQueue = new Set<string>();

export const useSyncStore = create<SyncState>((set, get) => ({
  isOnline: false,
  isSyncing: false,
  lastSyncAt: null,
  lastError: null,

  setOnline: online => set({ isOnline: online }),

  syncNow: async () => {
    set({ isSyncing: true, lastError: null });
    try {
      await SyncService.sync();
      set({ lastSyncAt: Date.now(), isSyncing: false });

      const records = await RecordService.refetch();

      useRecordStore.getState().setRecords(records);
    } catch (error: any) {
      set({
        isSyncing: false,
        lastError: error?.message ?? 'Erro ao sincronizar',
      });
    }
  },

  queueSync: (reason: string) => {
    syncQueue.add(reason);
    get().debouncedSync();
  },

  debouncedSync: debounce(() => {
    const { isOnline, isSyncing } = get();
    if (isOnline && !isSyncing) {
      syncQueue.clear();
      get().syncNow();
    }
  }, 2000),

  hasUnsyncedData: () => {
    const records = useRecordStore.getState().records;
    return records.some(r => !r.synced);
  },
}));
