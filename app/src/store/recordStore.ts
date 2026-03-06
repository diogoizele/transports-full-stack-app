import { create } from 'zustand';
import { RecordService, type RecordDTO } from '../services/recordService';
import { useSyncStore } from './syncStore';

type FormImage = { id?: string; path: string };

type RecordData = {
  type: 'COMPRA' | 'VENDA';
  dateTime: string;
  description: string;
  images: FormImage[];
};

interface RecordState {
  records: RecordDTO[];
  loading: boolean;

  setRecords: (records: RecordDTO[]) => void;
  subscribe: () => () => void;
  addRecord: (record: RecordData) => Promise<void>;
  updateRecord: (id: string, record: RecordData) => Promise<void>;
  removeRecord: (id: string) => Promise<void>;
}

export const useRecordStore = create<RecordState>((set, get) => ({
  records: [],
  loading: false,

  setRecords: records => set({ records }),

  subscribe: () => {
    const unsubscribe = RecordService.subscription(records => {
      set({ records });
    });
    return unsubscribe;
  },

  addRecord: async record => {
    await RecordService.create({
      type: record.type,
      dateTime: record.dateTime,
      description: record.description,
      images: record.images.map(img => img.path),
    });

    const added = await RecordService.refetch();
    set({ records: added });

    useSyncStore.getState().queueSync('record-added');
  },

  updateRecord: async (id, record) => {
    const current = get().records.find(r => r.id === id);

    const currentImageIds = new Set(current?.images.map(img => img.id) ?? []);
    const incomingImageIds = new Set(
      record.images.filter(img => img.id).map(img => img.id as string),
    );

    const imagesToDelete = [...currentImageIds].filter(
      imgId => !incomingImageIds.has(imgId),
    );
    const imagesToAdd = record.images
      .filter(img => !img.id)
      .map(img => img.path);

    await RecordService.update(id, {
      type: record.type,
      dateTime: record.dateTime,
      description: record.description,
      imagesToAdd,
      imagesToDelete,
    });

    const updated = await RecordService.refetch();
    set({ records: updated });

    useSyncStore.getState().queueSync('record-updated');
  },

  removeRecord: async id => {
    await RecordService.delete(id);

    const removed = await RecordService.refetch();
    set({ records: removed });

    useSyncStore.getState().queueSync('record-removed');
  },
}));
