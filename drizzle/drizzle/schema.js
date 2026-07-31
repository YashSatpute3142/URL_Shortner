import { int, mysqlTable, varchar } from 'drizzle-orm/mysql-core';

export const shortLinksTable = mysqlTable('users_table', {
  id: int().primaryKey().autoincrement(),
  url: varchar({ length: 255 }).notNull(),
  shortCode: varchar("short_code",{ length: 20 }).notNull().unique(),
});
