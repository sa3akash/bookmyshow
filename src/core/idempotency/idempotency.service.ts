import { db } from "@/infrastructure/database/client";
import { idempotencyKeys } from "@/infrastructure/database/schema";
import { eq } from "drizzle-orm";

export class IdempotencyService {
  async get(key: string, userId: string): Promise<{ status: number; body: unknown } | null> {
    const record = await db.query.idempotencyKeys.findFirst({
      where: eq(idempotencyKeys.key, key),
    });

    if (!record) return null;
    if (record.userId !== userId) return null;
    if (record.expiresAt < new Date()) return null;

    return {
      status: record.responseStatus,
      body: record.responseBody,
    };
  }

  async save(
    key: string,
    userId: string,
    requestPayload: unknown,
    responseStatus: number,
    responseBody: unknown,
    ttlSeconds: number = 86400 // 24 hours
  ) {
    const hasher = new Bun.CryptoHasher("sha256");
    hasher.update(JSON.stringify(requestPayload));
    const requestHash = hasher.digest("hex");

    const expiresAt = new Date();
    expiresAt.setSeconds(expiresAt.getSeconds() + ttlSeconds);

    await db.insert(idempotencyKeys).values({
      key,
      userId,
      requestHash,
      responseStatus,
      responseBody: responseBody as Record<string, unknown>,
      expiresAt,
    }).onConflictDoNothing();
  }
}

export const idempotencyService = new IdempotencyService();
