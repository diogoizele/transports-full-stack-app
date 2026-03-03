import { create } from 'zustand';

import {
  RecordService,
  type RecordDTO,
  type RecordInput,
} from '../services/recordService';

interface RecordState {
  records: RecordDTO[];
  loading: boolean;
  fetchRecords: () => Promise<void>;
  addRecord: (record: RecordInput) => Promise<void>;
  updateRecord: (id: string, record: RecordInput) => Promise<void>;
  removeRecord: (id: string) => Promise<void>;
}

export const useRecordStore = create<RecordState>(set => ({
  records: [],
  loading: false,

  fetchRecords: async () => {
    set({ loading: true });
    const data = await RecordService.getAll();
    console.log('[FETCH RECORDS]', { data });
    set({ records: data, loading: false });
  },

  addRecord: async record => {
    const newRecord = await RecordService.create(record);
    set(state => ({ records: [newRecord, ...state.records] }));
  },

  updateRecord: async (id, record) => {
    const updated = await RecordService.update(id, record);
    set(state => ({
      records: state.records.map(r => (r.id === id ? updated : r)),
    }));
  },

  removeRecord: async id => {
    await RecordService.delete(id);
    set(state => ({ records: state.records.filter(r => r.id !== id) }));
  },
}));
