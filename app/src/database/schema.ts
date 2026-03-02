import { appSchema, tableSchema } from '@nozbe/watermelondb';

export const schema = appSchema({
  version: 1,
  tables: [
    tableSchema({
      name: 'companies',
      columns: [
        { name: 'name', type: 'string' },

        { name: 'created_at', type: 'number' },
        { name: 'updated_at', type: 'number' },
        { name: 'deleted_at', type: 'number', isOptional: true },
      ],
    }),

    tableSchema({
      name: 'users',
      columns: [
        { name: 'full_name', type: 'string' },
        { name: 'username', type: 'string', isIndexed: true },
        { name: 'password', type: 'string' },

        { name: 'company_id', type: 'string', isIndexed: true },

        { name: 'created_at', type: 'number' },
        { name: 'updated_at', type: 'number' },
        { name: 'deleted_at', type: 'number', isOptional: true },
      ],
    }),

    tableSchema({
      name: 'records',
      columns: [
        { name: 'type', type: 'string' },
        { name: 'date_time', type: 'number' },
        { name: 'description', type: 'string' },

        { name: 'company_id', type: 'string', isIndexed: true },
        { name: 'user_id', type: 'string', isIndexed: true },

        { name: 'created_at', type: 'number' },
        { name: 'updated_at', type: 'number', isIndexed: true },
        { name: 'deleted_at', type: 'number', isOptional: true },
      ],
    }),

    tableSchema({
      name: 'images',
      columns: [
        { name: 'record_id', type: 'string', isIndexed: true },
        { name: 'path', type: 'string' },

        { name: 'created_at', type: 'number' },
        { name: 'updated_at', type: 'number', isIndexed: true },
        { name: 'deleted_at', type: 'number', isOptional: true },
      ],
    }),
  ],
});
