import { relations } from "drizzle-orm";
import { int, mysqlTable, timestamp, varchar } from "drizzle-orm/mysql-core";

export const usersTable = mysqlTable("users", {
  id: int().primaryKey().autoincrement(),

  name: varchar({ length: 255 }).notNull(),

  email: varchar({ length: 255 }).notNull().unique(),

  password: varchar({ length: 255 }).notNull(),

  createdAt: timestamp("created_at").defaultNow().notNull(),

  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const shortLinksTable = mysqlTable("users_table", {
  id: int().primaryKey().autoincrement(),

  url: varchar({ length: 255 }).notNull(),

  shortCode: varchar("short_code", { length: 20 })
    .notNull()
    .unique(),

  createdAt: timestamp("created_at").defaultNow().notNull(),

  updatedAt: timestamp("updated_at").defaultNow().notNull(),

  userId: int("user_id")
    .notNull()
    .references(() => usersTable.id),
});

// Users -> Short Links (One to Many)
export const usersRelation = relations(usersTable, ({ many }) => ({
  shortLinks: many(shortLinksTable),
}));

// Short Link -> User (Many to One)
export const shortLinksRelation = relations(shortLinksTable, ({ one }) => ({
  user: one(usersTable, {
    fields: [shortLinksTable.userId],
    references: [usersTable.id],
  }),
}));