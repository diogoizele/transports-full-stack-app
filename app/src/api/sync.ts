import { synchronize } from '@nozbe/watermelondb/sync';

import { database } from '../database';
import { api } from '../api/axios';

export async function sync() {
  await synchronize({
    database,
    pullChanges: async ({ lastPulledAt }) => {
      const response = await api.get('/sync', {
        params: { lastPulledAt },
      });

      return {
        changes: response.data.changes,
        timestamp: response.data.timestamp,
      };
    },
    pushChanges: async ({ changes, lastPulledAt }) => {
      await api.post('/sync', {
        changes,
        lastPulledAt,
      });
    },
  });
}
