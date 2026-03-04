import { Model } from '@nozbe/watermelondb';
import { field, relation } from '@nozbe/watermelondb/decorators';
import { ModelFields } from '../../types/ModelFields';

export class ImageModel extends Model {
  static table = 'images';

  static associations = {
    records: { type: 'belongs_to', key: 'record_id' },
  } as const;

  @field('record_id') recordId!: string;
  @field('path') path!: string;

  @field('created_at') createdAt!: number;
  @field('updated_at') updatedAt!: number;
  @field('deleted_at') deletedAt?: number;

  @relation('records', 'record_id') record!: any;
}

export type ImageChange = ModelFields<ImageModel, 'record'>;
