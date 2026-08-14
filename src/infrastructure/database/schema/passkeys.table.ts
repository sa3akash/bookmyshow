import {
  pgTable,
  integer,
  timestamp,
  text,
  uuid,
  varchar,
  index,
} from "drizzle-orm/pg-core";
import { users } from "./users.table";

export const userPasskeys = pgTable("user_passkeys", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  credentialId: varchar("credential_id", { length: 512 }).notNull().unique(),
  publicKey: text("public_key").notNull(),
  counter: integer("counter").default(0).notNull(),
  deviceName: varchar("device_name", { length: 255 }).default("Passkey Authenticator").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  lastUsedAt: timestamp("last_used_at", { withTimezone: true }),
}, (table) => [
  index("idx_passkeys_user").on(table.userId),
  index("idx_passkeys_cred_id").on(table.credentialId),
]);
