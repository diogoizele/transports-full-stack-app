import { Model } from '@nozbe/watermelondb';
import { field } from '@nozbe/watermelondb/decorators';

export class CompanyModel extends Model {
  static table = 'companies';

  @field('name') name!: string;

  @field('created_at') createdAt!: Date;
  @field('updated_at') updatedAt!: Date;
  @field('deleted_at') deletedAt?: Date;
}
