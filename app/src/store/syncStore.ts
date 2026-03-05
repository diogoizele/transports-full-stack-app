import { create } from 'zustand';
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
};

export const useSyncStore = create<SyncState>(set => ({
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
}));
