import { queryClient } from "../src/infrastructure/database/client";

async function runMigration() {
  console.log("Adding missing columns width, height, rotation, metadata to seats table...");
  try {
    await queryClient`ALTER TABLE "seats" ADD COLUMN IF NOT EXISTS "width" integer DEFAULT 30 NOT NULL;`;
    await queryClient`ALTER TABLE "seats" ADD COLUMN IF NOT EXISTS "height" integer DEFAULT 30 NOT NULL;`;
    await queryClient`ALTER TABLE "seats" ADD COLUMN IF NOT EXISTS "rotation" integer DEFAULT 0 NOT NULL;`;
    await queryClient`ALTER TABLE "seats" ADD COLUMN IF NOT EXISTS "metadata" jsonb DEFAULT '{}'::jsonb;`;
    console.log("Migration executed successfully!");
  } catch (err) {
    console.error("Migration error:", err);
  } finally {
    await queryClient.end();
  }
}

runMigration();
