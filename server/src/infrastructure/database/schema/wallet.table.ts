import {
  pgTable,
  text,
  integer,
  boolean,
  timestamp,
  uuid,
  varchar,
  index,
} from "drizzle-orm/pg-core";
import { users } from "./users.table";

export const wallets = pgTable("wallets", {
  userId: uuid("user_id").primaryKey().references(() => users.id, { onDelete: "cascade" }),
  balanceMinor: integer("balance_minor").default(0).notNull(),
  currency: varchar("currency", { length: 10 }).default("BDT").notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export const walletTransactions = pgTable("wallet_transactions", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").notNull().references(() => users.id),
  type: varchar("type", { length: 30 }).notNull(),
  amountMinor: integer("amount_minor").notNull(),
  balanceAfterMinor: integer("balance_after_minor").notNull(),
  referenceId: varchar("reference_id", { length: 255 }),
  description: text("description"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
  index("idx_wallet_tx_user").on(table.userId),
]);
