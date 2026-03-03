import { synchronize } from '@nozbe/watermelondb/sync';
import { database } from '../database';
import { getSync, postSync } from '../api/sync';

export const SyncService = {
  sync: async () => {
    await synchronize({
      database,
      pullChanges: getSync,
      pushChanges: postSync,
    });
  },
};
