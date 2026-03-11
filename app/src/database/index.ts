import { Database } from '@nozbe/watermelondb';
import SQLiteAdapter from '@nozbe/watermelondb/adapters/sqlite';

import { schema } from './schema';

import { RecordModel } from './models/RecordModel';
import { ImageModel } from './models/ImageModel';
import { UserModel } from './models/UserModel';

const adapter = new SQLiteAdapter({
  schema,
  dbName: 'takehome',
  jsi: true,
});

export const database = new Database({
  adapter,
  modelClasses: [RecordModel, ImageModel, UserModel],
});
