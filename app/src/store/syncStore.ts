import { create } from 'zustand';
import { SyncService } from '../services/syncService';

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
    console.log('[SYNC NOW] - chamado');

    set({ isSyncing: true, lastError: null });
    try {
      await SyncService.sync();
      set({ lastSyncAt: Date.now(), isSyncing: false });
    } catch (error: any) {
      set({
        isSyncing: false,
        lastError: error?.message ?? 'Erro ao sincronizar',
      });
    }
  },
}));
