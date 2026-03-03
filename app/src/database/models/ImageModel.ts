import { Model } from '@nozbe/watermelondb';
import { field, relation } from '@nozbe/watermelondb/decorators';

export class ImageModel extends Model {
  static table = 'images';

  static associations = {
    records: { type: 'belongs_to', key: 'record_id' },
  } as const;

  @field('record_id') recordId!: string;
  @field('path') path!: string;

  @field('created_at') createdAt!: Date;
  @field('updated_at') updatedAt!: Date;
  @field('deleted_at') deletedAt?: Date;

  @relation('records', 'record_id') record!: any;
}
