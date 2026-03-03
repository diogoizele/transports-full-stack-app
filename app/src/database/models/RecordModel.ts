import { Model } from '@nozbe/watermelondb';
import { field, children } from '@nozbe/watermelondb/decorators';

export class RecordModel extends Model {
  static table = 'records';

  static associations = {
    images: { type: 'has_many', foreignKey: 'record_id' },
  } as const;

  @field('type') type!: 'COMPRA' | 'VENDA';
  @field('date_time') dateTime!: string;
  @field('description') description!: string;

  @field('company_id') companyId!: string;
  @field('user_id') userId!: string;

  @field('created_at') createdAt!: Date;
  @field('updated_at') updatedAt!: Date;
  @field('deleted_at') deletedAt?: Date;

  @children('images') images!: any;
}
