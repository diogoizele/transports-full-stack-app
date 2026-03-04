// app/src/db/schema.ts
import { appSchema, tableSchema } from '@nozbe/watermelondb';

export const schema = appSchema({
  version: 2, // bump obrigatório quando muda colunas
  tables: [
    tableSchema({
      name: 'records',
      columns: [
        { name: 'type', type: 'string' },
        { name: 'date_time', type: 'string' },
        { name: 'description', type: 'string' },
      ],
    }),
    tableSchema({
      name: 'images',
      columns: [
        { name: 'record_id', type: 'string', isIndexed: true },
        { name: 'path', type: 'string' },
      ],
    }),
  ],
});
