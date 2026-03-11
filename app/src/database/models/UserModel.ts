import { Model } from '@nozbe/watermelondb';
import { field, children } from '@nozbe/watermelondb/decorators';

export class UserModel extends Model {
  static table = 'users';

  static associations = {
    records: { type: 'has_many', foreignKey: 'user_id' },
  } as const;

  @field('username') username!: string;
  @field('full_name') full_name!: string;

  @children('records') records!: any;
}
