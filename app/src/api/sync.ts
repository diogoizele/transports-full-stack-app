import { SyncDatabaseChangeSet } from '@nozbe/watermelondb/sync';

import { api } from '../api/axios';
import type { SyncPullResponse } from '../../../backend/src/schemas/sync';

export async function getSync(params: {
  lastPulledAt?: number | undefined;
}): Promise<SyncPullResponse> {
  const response = await api.get('/sync', {
    params: { lastPulledAt: params.lastPulledAt ?? 0 },
  });

  return {
    changes: response.data.changes,
    timestamp: response.data.timestamp,
  };
}

export async function postSync({
  changes,
}: {
  changes: SyncDatabaseChangeSet;
  lastPulledAt: number;
}): Promise<void> {
  await api.post('/sync', { changes });
}
