import { Model } from '@nozbe/watermelondb';
import { field, children } from '@nozbe/watermelondb/decorators';
import { ModelFields } from '../../types/ModelFields';

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

  @field('created_at') createdAt!: number;
  @field('updated_at') updatedAt!: number;
  @field('deleted_at') deletedAt?: number | null;

  @children('images') images!: any;
}

export type RecordChange = ModelFields<RecordModel, 'images'>;
