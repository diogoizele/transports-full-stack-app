import { Model, Relation } from '@nozbe/watermelondb';
import { field, children, relation } from '@nozbe/watermelondb/decorators';
import { UserModel } from './UserModel';

export class RecordModel extends Model {
  static table = 'records';

  static associations = {
    images: { type: 'has_many', foreignKey: 'record_id' },
    users: { type: 'belongs_to', key: 'user_id' },
  } as const;

  @field('type') type!: 'COMPRA' | 'VENDA';
  @field('date_time') date_time!: string;
  @field('description') description!: string;

  @field('user_id') user_id!: string;

  @children('images') images!: any;

  @relation('users', 'user_id') user!: Relation<UserModel>;
}
