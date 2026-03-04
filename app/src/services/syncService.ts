import { SyncDatabaseChangeSet, synchronize } from '@nozbe/watermelondb/sync';
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
            pullChanges: async data => {
              const response = await getSync(data);
              // console.log('[pull]', data, response);
              return response;
            },
            pushChanges: async data => {
              const response = await postSync(data as SyncDatabaseChangeSet);
              // console.log('[push]', data, response);

              return response;
            },
          });
        } catch (err) {
          console.log(err);
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
