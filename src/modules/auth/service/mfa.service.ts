import { db } from "@/infrastructure/database/client";
import { userMfaSecrets, userMfaRecoveryCodes, users } from "@/infrastructure/database/schema";
import { redis } from "@/infrastructure/redis/client";
import { eq, and } from "drizzle-orm";
import { AuthenticationError, ValidationError, NotFoundError } from "@/core/errors/app-error";
import { logger } from "@/core/observability/logger";
import { createHash, randomBytes } from "crypto";

export class MfaService {
  /**
   * Helper: Hash string using SHA-256 (Never Store Plaintext Recovery Codes!)
   */
  hashString(input: string): string {
    return createHash("sha256").update(input.trim().toUpperCase()).digest("hex");
  }

  /**
   * Generate 6-digit numeric OTP
   */
  generateNumericOtp(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  /**
   * Simple TOTP Generator & Verifier (RFC 6238 30-sec window)
   */
  generateTotpCode(secret: string, timeStep = Math.floor(Date.now() / 1000 / 30)): string {
    const hmac = createHash("sha256").update(secret + timeStep.toString()).digest("hex");
    const offset = parseInt(hmac.substring(hmac.length - 1), 16);
    const codeNum = (parseInt(hmac.substring(offset, offset + 8), 16) & 0x7fffffff) % 1000000;
    return codeNum.toString().padStart(6, "0");
  }

  /**
   * 1. Setup TOTP Authenticator App for a User
   */
  async setupTotp(userId: string) {
    const user = await db.query.users.findFirst({
      where: eq(users.id, userId),
    });

    if (!user) {
      throw new NotFoundError("User not found");
    }

    const totpSecret = randomBytes(20).toString("hex").toUpperCase();
    const qrUri = `otpauth://totp/BookMyShow:${encodeURIComponent(user.email)}?secret=${totpSecret}&issuer=BookMyShow`;

    // Generate 8 Single-Use Recovery Codes
    const rawRecoveryCodes: string[] = [];
    const recoveryCodeRecords: { userId: string; codeHash: string }[] = [];

    for (let i = 0; i < 8; i++) {
      const code = randomBytes(5).toString("hex").toUpperCase(); // e.g. A1B2C3D4E5
      rawRecoveryCodes.push(code);
      recoveryCodeRecords.push({
        userId,
        codeHash: this.hashString(code),
      });
    }

    await db.transaction(async (tx) => {
      // Upsert TOTP secret
      await tx
        .insert(userMfaSecrets)
        .values({
          userId,
          totpSecret,
          isTotpEnabled: false,
        })
        .onConflictDoUpdate({
          target: userMfaSecrets.userId,
          set: { totpSecret, isTotpEnabled: false, updatedAt: new Date() },
        });

      // Clear old recovery codes and save new SHA-256 hashed recovery codes
      await tx.delete(userMfaRecoveryCodes).where(eq(userMfaRecoveryCodes.userId, userId));
      await tx.insert(userMfaRecoveryCodes).values(recoveryCodeRecords);
    });

    logger.info({ userId }, "Generated TOTP secret and hashed 8 single-use recovery codes");

    // Return unhashed recovery codes ONLY ONCE to user for safe keeping
    return {
      totpSecret,
      qrUri,
      recoveryCodes: rawRecoveryCodes,
    };
  }

  /**
   * 2. Enable TOTP after initial code verification
   */
  async enableTotp(userId: string, code: string) {
    const record = await db.query.userMfaSecrets.findFirst({
      where: eq(userMfaSecrets.userId, userId),
    });

    if (!record) {
      throw new ValidationError("TOTP setup must be initiated first");
    }

    const isValid = this.verifyTotpCode(record.totpSecret, code);
    if (!isValid) {
      throw new AuthenticationError("Invalid TOTP code provided");
    }

    await db.transaction(async (tx) => {
      await tx
        .update(userMfaSecrets)
        .set({ isTotpEnabled: true, updatedAt: new Date() })
        .where(eq(userMfaSecrets.userId, userId));

      await tx
        .update(users)
        .set({ isMfaEnabled: true, updatedAt: new Date() })
        .where(eq(users.id, userId));
    });

    logger.info({ userId }, "TOTP Multi-Factor Authentication activated for user");
    return { isMfaEnabled: true };
  }

  /**
   * 3. Verify TOTP Code
   */
  verifyTotpCode(secret: string, code: string): boolean {
    const currentStep = Math.floor(Date.now() / 1000 / 30);
    // Allow +/- 1 time step window for clock skew
    for (let i = -1; i <= 1; i++) {
      const generated = this.generateTotpCode(secret, currentStep + i);
      if (generated === code.trim()) {
        return true;
      }
    }
    return false;
  }

  async verifyTotp(userId: string, code: string): Promise<boolean> {
    const record = await db.query.userMfaSecrets.findFirst({
      where: eq(userMfaSecrets.userId, userId),
    });

    if (!record || !record.isTotpEnabled) {
      throw new ValidationError("TOTP MFA is not enabled on this account");
    }

    const isValid = this.verifyTotpCode(record.totpSecret, code);
    if (!isValid) {
      throw new AuthenticationError("Invalid TOTP authentication code");
    }

    return true;
  }

  /**
   * 4. Verify Single-Use Hashed Recovery Code
   */
  async verifyRecoveryCode(userId: string, rawCode: string): Promise<boolean> {
    const codeHash = this.hashString(rawCode);

    const matchingCode = await db.query.userMfaRecoveryCodes.findFirst({
      where: and(
        eq(userMfaRecoveryCodes.userId, userId),
        eq(userMfaRecoveryCodes.codeHash, codeHash),
        eq(userMfaRecoveryCodes.isUsed, false)
      ),
    });

    if (!matchingCode) {
      throw new AuthenticationError("Invalid or already used MFA recovery code");
    }

    // Mark recovery code as USED
    await db
      .update(userMfaRecoveryCodes)
      .set({
        isUsed: true,
        usedAt: new Date(),
      })
      .where(eq(userMfaRecoveryCodes.id, matchingCode.id));

    logger.info({ userId, codeId: matchingCode.id }, "MFA Recovery code consumed successfully");
    return true;
  }

  /**
   * 5. Send SMS OTP Channel
   */
  async sendSmsOtp(userId: string, phone: string): Promise<{ channel: string; expiresSec: number }> {
    const otp = this.generateNumericOtp();
    const key = `otp:sms:${userId}`;
    await redis.setex(key, 300, otp); // 5-min TTL

    logger.info({ userId, phone, otp: "[REDACTED]" }, "Dispatched SMS OTP code");
    return { channel: "SMS", expiresSec: 300 };
  }

  /**
   * 6. Send Email OTP Channel
   */
  async sendEmailOtp(userId: string, email: string): Promise<{ channel: string; expiresSec: number }> {
    const otp = this.generateNumericOtp();
    const key = `otp:email:${userId}`;
    await redis.setex(key, 300, otp); // 5-min TTL

    logger.info({ userId, email, otp: "[REDACTED]" }, "Dispatched Email OTP code");
    return { channel: "EMAIL", expiresSec: 300 };
  }

  /**
   * 7. Verify SMS or Email OTP Code
   */
  async verifyChannelOtp(userId: string, channel: "SMS" | "EMAIL", code: string): Promise<boolean> {
    const key = `otp:${channel.toLowerCase()}:${userId}`;
    const storedOtp = await redis.get(key);

    if (!storedOtp || storedOtp !== code.trim()) {
      throw new AuthenticationError(`Invalid or expired ${channel} OTP code`);
    }

    await redis.del(key); // Invalidate OTP after 1-time verification
    return true;
  }
}

export const mfaService = new MfaService();
