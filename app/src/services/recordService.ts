import { RecordModel } from '../database/models/RecordModel';
import { ImageModel } from '../database/models/ImageModel';
import { database } from '../database';

export type RecordDTO = {
  id: string;
  type: 'COMPRA' | 'VENDA';
  dateTime: string;
  description: string;
  synced: boolean;
  images: { id: string; path: string }[];
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
  const images = await record.images.fetch();
  const synced = record._raw._status === 'synced';

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
  };
};

export const RecordService = {
  subscription: (callback: (records: RecordDTO[]) => void) => {
    const subscription = database
      .get<RecordModel>('records')
      .query()
      .observe()
      .subscribe(async rows => {
        const dtos = await Promise.all(rows.map(toDTO));
        callback(dtos);
      });

    return () => subscription.unsubscribe();
  },

  create: async (data: RecordCreateInput) => {
    await database.write(async () => {
      const record = await database.get<RecordModel>('records').create(r => {
        r.type = data.type;
        r.date_time = data.dateTime;
        r.description = data.description;
      });

      if (data.images?.length) {
        for (const path of data.images) {
          await database.get<ImageModel>('images').create(img => {
            img.record_id = record.id;
            img.path = path;
          });
        }
      }
    });
  },

  update: async (id: string, data: RecordUpdateInput) => {
    console.log({ id, data });

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
        for (const path of data.imagesToAdd) {
          await database.get<ImageModel>('images').create(img => {
            img.record_id = id;
            img.path = path;
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
