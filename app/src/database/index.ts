import { Database } from '@nozbe/watermelondb';
import SQLiteAdapter from '@nozbe/watermelondb/adapters/sqlite';

import { schema } from './schema';
import { CompanyModel } from './models/CompanyModel';
import { UserModel } from './models/UserModel';
import { RecordModel } from './models/RecordModel';
import { ImageModel } from './models/ImageModel';

const adapter = new SQLiteAdapter({
  schema,
  dbName: 'takehome',
  jsi: true,
});

export const database = new Database({
  adapter,
  modelClasses: [CompanyModel, UserModel, RecordModel, ImageModel],
});
