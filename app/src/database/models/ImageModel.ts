import { Model } from '@nozbe/watermelondb';
import { field, relation } from '@nozbe/watermelondb/decorators';

export class ImageModel extends Model {
  static table = 'images';

  static associations = {
    records: { type: 'belongs_to', key: 'record_id' },
  } as const;

  @field('record_id') record_id!: string;
  @field('path') path!: string;

  @relation('records', 'record_id') record!: any;
}
