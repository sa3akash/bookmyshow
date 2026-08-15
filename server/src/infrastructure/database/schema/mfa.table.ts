import {
  pgTable,
  boolean,
  timestamp,
  uuid,
  varchar,
  text,
  index,
} from "drizzle-orm/pg-core";
import { users } from "./users.table";

export const userMfaSecrets = pgTable("user_mfa_secrets", {
  userId: uuid("user_id").primaryKey().references(() => users.id, { onDelete: "cascade" }),
  totpSecret: text("totp_secret").notNull(),
  isTotpEnabled: boolean("is_totp_enabled").default(false).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export const userMfaRecoveryCodes = pgTable("user_mfa_recovery_codes", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  codeHash: varchar("code_hash", { length: 64 }).notNull(), // SHA-256 Hash of recovery code (Never Plaintext)
  isUsed: boolean("is_used").default(false).notNull(),
  usedAt: timestamp("used_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
  index("idx_mfa_recovery_user").on(table.userId),
  index("idx_mfa_recovery_hash").on(table.codeHash),
]);
