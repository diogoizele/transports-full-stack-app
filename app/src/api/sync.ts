import { SyncDatabaseChangeSet } from '@nozbe/watermelondb/sync';
import { api } from '../api/axios';
import { RecordResponse } from '../types/RecordResponse';

interface GetSyncParams {
  lastPulledAt?: number;
}

interface GetSyncResponse {
  changes: {
    records: {
      created: RecordResponse[];
      updated: RecordResponse[];
      deleted: string[];
    };
  };
  timestamp: number;
}

interface PostSyncPayload {
  changes: SyncDatabaseChangeSet;
  lastPulledAt?: number;
}

export async function getSync(params: GetSyncParams) {
  const response = await api.get<GetSyncResponse>('/sync', {
    params,
  });

  return {
    changes: response.data.changes,
    timestamp: response.data.timestamp,
  };
}

export async function postSync(data: PostSyncPayload) {
  await api.post('/sync', data);
}
