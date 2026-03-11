import { synchronize } from '@nozbe/watermelondb/sync';
import { database } from '../database';
import { getSync, postSync } from '../api/sync';

let currentSync: Promise<void> | null = null;

export const SyncService = {
  sync: (): Promise<void> => {
    if (!currentSync) {
      currentSync = (async () => {
        try {
          await synchronize({
            database,
            pullChanges: getSync,
            pushChanges: postSync,
          });
        } catch (err) {
          throw err;
        } finally {
          currentSync = null;
        }
      })();
    }

    return currentSync;
  },

  reset: async () => {
    await database.write(async () => {
      await database.unsafeResetDatabase();
    });
  },
};
