import { create } from 'zustand';

import {
  RecordService,
  type RecordDTO,
  type RecordInput,
} from '../services/recordService';
import { useAuthStore } from './authStore';

type RecordData = Pick<
  RecordInput,
  'description' | 'dateTime' | 'images' | 'type'
>;

interface RecordState {
  records: RecordDTO[];
  loading: boolean;

  subscribe: () => () => void;

  addRecord: (record: RecordData) => Promise<void>;
  updateRecord: (id: string, record: RecordData) => Promise<void>;
  removeRecord: (id: string) => Promise<void>;
}

export const useRecordStore = create<RecordState>(set => ({
  records: [],
  loading: false,

  subscribe: () => {
    const unsubscribe = RecordService.subscription(records => {
      set({ records });
    });

    return unsubscribe;
  },

  addRecord: async record => {
    const { companyId, userId } = useAuthStore.getState();

    if (!companyId || !userId) return;

    await RecordService.create({ ...record, companyId, userId });
  },

  updateRecord: async (id, record) => {
    const { companyId, userId } = useAuthStore.getState();

    if (!companyId || !userId) return;

    await RecordService.update(id, { ...record, companyId, userId });
    // set(state => ({
    //   records: state.records.map(r => (r.id === id ? updated : r)),
    // }));
  },

  removeRecord: async id => {
    await RecordService.delete(id);
    // set(state => ({ records: state.records.filter(r => r.id !== id) }));
  },
}));
