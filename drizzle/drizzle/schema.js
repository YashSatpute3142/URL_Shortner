import { timestamp } from "drizzle-orm/mysql-core";
import { int, mysqlTable, varchar } from 'drizzle-orm/mysql-core';

export const shortLinksTable = mysqlTable('users_table', {
  id: int().primaryKey().autoincrement(),
  url: varchar({ length: 255 }).notNull(),
  shortCode: varchar("short_code",{ length: 20 }).notNull().unique(),
});

export const usersTable = mysqlTable('users', {
  id: int().primaryKey().autoincrement(),
  name: varchar({length:255}).notNull(),
  email: varchar({length:255}).notNull().unique(),
  password:varchar({length:255}).notNull(),
  cratedAt: timestamp("created_at").default().notNull(),
  updatedAt: timestamp("updated_at").default().notNull()
});