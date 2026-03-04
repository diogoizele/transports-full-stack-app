import {
  SyncDatabaseChangeSet,
  SyncTableChangeSet,
} from '@nozbe/watermelondb/sync';
import { api } from '../api/axios';
import { RecordResponse } from '../types/RecordResponse';
import { prepareImagesToSync } from '../helpers/image';
import { RecordChange } from '../database/models/RecordModel';
import { ImageChange } from '../database/models/ImageModel';

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

export interface MySyncDatabaseChangeSet extends SyncDatabaseChangeSet {
  records: SyncTableChangeSet & {
    created: RecordChange[];
    updated: RecordChange[];
    deleted: string[];
  };
  images: SyncTableChangeSet & {
    created: ImageChange[];
    updated: ImageChange[];
    deleted: string[];
  };
}

interface PostSyncPayload {
  changes: MySyncDatabaseChangeSet;
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

export async function postSync(data: any) {
  const payload: PostSyncPayload = {
    ...data,
    changes: {
      ...data.changes,
      images: {
        ...data.changes?.images,
        created: (await prepareImagesToSync(
          data.changes?.images?.created,
        )) as ImageChange[],
        updated: (await prepareImagesToSync(
          data.changes?.images?.updated,
        )) as ImageChange[],
      },
    },
  };

  console.log({ payload });
  return (await api.post('/sync', payload)).data;
}
