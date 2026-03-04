import { Model } from '@nozbe/watermelondb';
import { field, children } from '@nozbe/watermelondb/decorators';

export class RecordModel extends Model {
  static table = 'records';

  static associations = {
    images: { type: 'has_many', foreignKey: 'record_id' },
  } as const;

  @field('type') type!: 'COMPRA' | 'VENDA';
  @field('date_time') date_time!: string;
  @field('description') description!: string;

  @children('images') images!: any;
}
