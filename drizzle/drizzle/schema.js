import { relations, sql } from "drizzle-orm";
import {
  int,
  mysqlTable,
  timestamp,
  varchar,
  boolean,
  text,
} from "drizzle-orm/mysql-core";


export const verifyEmailTokenTable = mysqlTable("verify_email_tokens", {
  id: int().primaryKey().autoincrement(),

  userId: int("user_id")
    .notNull()
    .references(() => usersTable.id, { onDelete: "cascade" }),

  token: varchar("token", { length: 8 }).notNull(),

  expiresAt: timestamp("expires_at")
    .default(sql`(CURRENT_TIMESTAMP + INTERVAL 1 DAY)`)
    .notNull(),

  createdAt: timestamp("created_at")
    .defaultNow()
    .notNull(),
});

// ==========================
// Users Table
// ==========================

export const usersTable = mysqlTable("users", {
  id: int().primaryKey().autoincrement(),

  name: varchar({ length: 255 }).notNull(),

  email: varchar({ length: 255 }).notNull().unique(),

  password: varchar({ length: 255 }).notNull(),

  isEmailValid:boolean("is_email_valid").default(false).notNull(),

  createdAt: timestamp("created_at").defaultNow().notNull(),

  updatedAt: timestamp("updated_at")
    .defaultNow()
    .onUpdateNow()
    .notNull(),
});

// ==========================
// Sessions Table
// ==========================

export const sessionsTable = mysqlTable("sessions", {
  id: int().primaryKey().autoincrement(),

  userId: int("user_id")
    .notNull()
    .references(() => usersTable.id, {
      onDelete: "cascade",
    }),

  valid: boolean().default(true).notNull(),

  userAgent: text("user_agent"),

  ip: varchar({ length: 255 }),

  createdAt: timestamp("created_at").defaultNow().notNull(),

  updatedAt: timestamp("updated_at")
    .defaultNow()
    .onUpdateNow()
    .notNull(),
});

// ==========================
// Short Links Table
// ==========================

export const shortLinksTable = mysqlTable("users_table", {
  id: int().primaryKey().autoincrement(),

  url: varchar({ length: 255 }).notNull(),

  shortCode: varchar("short_code", { length: 20 })
    .notNull()
    .unique(),

  createdAt: timestamp("created_at").defaultNow().notNull(),

  updatedAt: timestamp("updated_at")
    .defaultNow()
    .onUpdateNow()
    .notNull(),

  userId: int("user_id")
    .notNull()
    .references(() => usersTable.id, {
      onDelete: "cascade",
    }),
});

// ==========================
// Relations
// ==========================

// User -> ShortLinks & Sessions
export const usersRelations = relations(usersTable, ({ many }) => ({
  shortLinks: many(shortLinksTable),
  sessions: many(sessionsTable),
}));

// ShortLink -> User
export const shortLinksRelations = relations(
  shortLinksTable,
  ({ one }) => ({
    user: one(usersTable, {
      fields: [shortLinksTable.userId],
      references: [usersTable.id],
    }),
  })
);

// Session -> User
export const sessionsRelations = relations(
  sessionsTable,
  ({ one }) => ({
    user: one(usersTable, {
      fields: [sessionsTable.userId],
      references: [usersTable.id],
    }),
  })
);