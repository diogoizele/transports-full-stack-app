import { Model } from '@nozbe/watermelondb';
import { field } from '@nozbe/watermelondb/decorators';

export class UserModel extends Model {
  static table = 'users';

  @field('full_name') fullName!: string;
  @field('username') username!: string;
  @field('password') password!: string;

  @field('company_id') companyId!: string;

  @field('created_at') createdAt!: number;
  @field('updated_at') updatedAt!: number;
  @field('deleted_at') deletedAt?: number;
}
