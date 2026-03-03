import { database } from '../database';
import { RecordModel } from '../database/models/RecordModel';
import { ImageModel } from '../database/models/ImageModel';
import { useAuthStore } from '../store/authStore';

export type RecordType = 'COMPRA' | 'VENDA';

export type RecordImage = {
  id: string;
  path: string;
};

export type RecordInput = {
  type: RecordType;
  dateTime: string;
  description: string;
  images?: { path: string }[];
};

export type RecordDTO = {
  id: string;
  type: RecordType;
  dateTime: Date;
  description: string;

  images: RecordImage[];

  synced: boolean;
};

async function mapRecordModelToDTO(record: RecordModel): Promise<RecordDTO> {
  const images = (await record.images.fetch()) as ImageModel[];

  const hasPendingUpdate =
    (record as unknown as { _hasPendingUpdate?: boolean })._hasPendingUpdate ??
    false;

  return {
    id: record.id,
    type: record.type,
    dateTime: new Date(record.dateTime),
    description: record.description,
    synced: !hasPendingUpdate,
    images: images.map(img => ({
      id: img.id,
      path: img.path,
    })),
  };
}

export const RecordService = {
  /**
   * Lista todos os registros locais (offline first),
   * agregando as imagens relacionadas em um array tipado.
   */
  getAll: async (): Promise<RecordDTO[]> => {
    const records = await database.collections
      .get<RecordModel>('records')
      .query()
      .fetch();

    return Promise.all(records.map(mapRecordModelToDTO));
  },

  /**
   * Cria um novo registro localmente.
   * Preenche `companyId` e `userId` a partir do estado de autenticação,
   * garantindo que o sync para o backend tenha os dados necessários.
   */
  create: async (input: RecordInput): Promise<RecordDTO> => {
    const recordsCollection = database.collections.get<RecordModel>('records');
    const imagesCollection = database.collections.get<ImageModel>('images');

    const { companyId, userId } = useAuthStore.getState();

    console.log({
      input,
      companyId,
      userId,
    });

    console.log({
      type: input.type,
      dateTime: input.dateTime,
      description: input.description,
      companyId: companyId,
      userId: userId,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    const newRecord = await database.action(async () => {
      const createdRecord = await recordsCollection.create(record => {
        record.type = input.type;
        record.dateTime = input.dateTime;
        record.description = input.description;
        if (companyId) record.companyId = companyId;
        if (userId) record.userId = userId;
        // record.createdAt = Date.now();
        // record.updatedAt = Date.now();
      });

      console.log('PAssando por aqui');

      if (input.images?.length) {
        for (const img of input.images) {
          // eslint-disable-next-line no-await-in-loop
          await imagesCollection.create(image => {
            image.recordId = createdRecord.id;
            image.path = img.path;
            // image.createdAt = Date.now();
            // image.updatedAt = Date.now();
          });
        }
      }

      return createdRecord;
    });

    console.log({ newRecord });

    return mapRecordModelToDTO(newRecord);
  },

  /**
   * Atualiza um registro existente e sincroniza o relacionamento de imagens,
   * mantendo para o frontend apenas um array simples de imagens.
   */
  update: async (id: string, input: RecordInput): Promise<RecordDTO> => {
    const record = await database.collections
      .get<RecordModel>('records')
      .find(id);
    const imagesCollection = database.collections.get<ImageModel>('images');

    const updatedRecord = await database.action(async () => {
      record.type = input.type;
      record.dateTime = input.dateTime;
      record.description = input.description;
      // record.updatedAt = Date.now();

      const existingImages = (await record.images.fetch()) as ImageModel[];
      const newPaths = input.images?.map(i => i.path) ?? [];

      existingImages.forEach(img => {
        if (!newPaths.includes(img.path)) {
          img.markAsDeleted();
        }
      });

      if (input.images?.length) {
        for (const img of input.images) {
          const alreadyExists = existingImages.find(e => e.path === img.path);
          if (!alreadyExists) {
            // eslint-disable-next-line no-await-in-loop
            await imagesCollection.create(i => {
              i.recordId = record.id;
              i.path = img.path;
              // i.createdAt = Date.now();
              // i.updatedAt = Date.now();
            });
          }
        }
      }

      return record;
    });

    return mapRecordModelToDTO(updatedRecord);
  },

  /**
   * Exclui um registro localmente (soft delete no Watermelon),
   * permitindo que o adapter de sync envie a deleção para o backend.
   */
  delete: async (id: string): Promise<void> => {
    const record = await database.collections
      .get<RecordModel>('records')
      .find(id);

    await database.action(async () => {
      await record.markAsDeleted();
    });
  },
};
