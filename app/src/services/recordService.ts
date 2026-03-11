import { RecordModel } from '../database/models/RecordModel';
import { ImageModel } from '../database/models/ImageModel';
import { database } from '../database';
import { switchMap } from '@nozbe/watermelondb/utils/rx';
import { combineLatest, from } from 'rxjs';
import { prepareImagesToSync } from '../helpers/image';
import { Q } from '@nozbe/watermelondb';

export type RecordDTO = {
  id: string;
  type: 'COMPRA' | 'VENDA';
  dateTime: string;
  description: string;
  synced: boolean;
  images: { id: string; path: string }[];
  user: {
    username: string;
    fullName: string;
    id: string;
  };
};

export type RecordCreateInput = {
  type: 'COMPRA' | 'VENDA';
  dateTime: string;
  description: string;
  images?: string[];
};

export type RecordUpdateInput = {
  type?: 'COMPRA' | 'VENDA';
  dateTime?: string;
  description?: string;
  imagesToAdd?: string[];
  imagesToDelete?: string[];
};

const toDTO = async (record: RecordModel): Promise<RecordDTO> => {
  const allImages = await database
    .get<ImageModel>('images')
    .query(Q.where('record_id', record.id))
    .fetch();

  const user = await record.user.fetch();

  const images = allImages.filter(
    (img: ImageModel) => img._raw._status !== 'deleted',
  );

  const synced =
    record._raw._status === 'synced' &&
    allImages.every((img: ImageModel) => img._raw._status === 'synced');

  return {
    id: record.id,
    type: record.type,
    dateTime: record.date_time,
    description: record.description,
    synced,
    images: images.map((img: ImageModel) => ({
      id: img.id,
      path: img.path,
    })),
    user: {
      id: user.id,
      username: user.username,
      fullName: user.full_name,
    },
  };
};

export const RecordService = {
  refetch: async (): Promise<RecordDTO[]> => {
    const records = await database.get<RecordModel>('records').query().fetch();
    return Promise.all(records.map(toDTO));
  },

  subscription: (callback: (records: RecordDTO[]) => void) => {
    const records$ = database.get<RecordModel>('records').query().observe();
    const images$ = database.get<ImageModel>('images').query().observe();

    const subscription = combineLatest([records$, images$])
      .pipe(switchMap(([rows]) => from(Promise.all(rows.map(toDTO)))))
      .subscribe(callback);

    return () => subscription.unsubscribe();
  },

  create: async (userId: string, data: RecordCreateInput) => {
    await database.write(async () => {
      const record = await database.get<RecordModel>('records').create(r => {
        r.type = data.type;
        r.date_time = data.dateTime;
        r.description = data.description;
        r.user_id = userId;
      });

      if (data.images?.length) {
        const base64EncodedImages = await prepareImagesToSync(data.images);

        for (const base64 of base64EncodedImages) {
          await database.get<ImageModel>('images').create(img => {
            img.record_id = record.id;
            img.path = base64;
          });
        }
      }
    });
  },

  update: async (id: string, data: RecordUpdateInput) => {
    await database.write(async () => {
      const record = await database.get<RecordModel>('records').find(id);

      await record.update(r => {
        if (data.type) r.type = data.type;
        if (data.dateTime) r.date_time = data.dateTime;
        if (data.description) r.description = data.description;
      });

      if (data.imagesToDelete?.length) {
        for (const imageId of data.imagesToDelete) {
          const image = await database.get<ImageModel>('images').find(imageId);

          await image.markAsDeleted();
        }
      }

      if (data.imagesToAdd?.length) {
        const base64EncodedImages = await prepareImagesToSync(data.imagesToAdd);

        for (const base64 of base64EncodedImages) {
          await database.get<ImageModel>('images').create(img => {
            img.record_id = id;
            img.path = base64;
          });
        }
      }
    });
  },

  delete: async (id: string) => {
    await database.write(async () => {
      const record = await database.get<RecordModel>('records').find(id);

      const images = await record.images.fetch();
      for (const image of images) {
        await image.markAsDeleted();
      }

      await record.markAsDeleted();
    });
  },
};
