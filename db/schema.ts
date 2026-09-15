import { integer, sqliteTable } from 'drizzle-orm/sqlite-core';

export const pageViewCounter = sqliteTable('page_view_counter', {
  id: integer('id').primaryKey(),
  total: integer('total').notNull().default(0),
});
