import { db } from "@/infrastructure/database/client";
import { userPasskeys, users, refreshTokens } from "@/infrastructure/database/schema";
import { redis } from "@/infrastructure/redis/client";
import { eq, and } from "drizzle-orm";
import { AuthenticationError, ValidationError, NotFoundError, ConflictError } from "@/core/errors/app-error";
import { generateAccessToken, generateRefreshToken, hashToken, JwtPayload } from "../domain/jwt";
import { authService } from "./auth.service";
import { logger } from "@/core/observability/logger";
import { randomBytes } from "crypto";

export interface RegisterPasskeyDTO {
  userId: string;
  credentialId: string;
  publicKey: string;
  deviceName?: string;
}

export class WebAuthnService {
  /**
   * 1. Generate WebAuthn Registration Options (Challenge)
   */
  async generateRegistrationOptions(userId: string, deviceName = "Passkey Authenticator") {
    const user = await db.query.users.findFirst({
      where: eq(users.id, userId),
    });

    if (!user) {
      throw new NotFoundError("User not found");
    }

    const challenge = randomBytes(32).toString("base64url");
    const challengeKey = `webauthn:reg_challenge:${userId}`;

    // Store challenge in Redis for 5 minutes
    await redis.setex(challengeKey, 300, JSON.stringify({ challenge, deviceName }));

    // Fetch existing registered passkey IDs for exclusion
    const existingPasskeys = await db.query.userPasskeys.findMany({
      where: eq(userPasskeys.userId, userId),
    });

    return {
      challenge,
      rp: {
        name: "BookMyShow Platform",
        id: "localhost",
      },
      user: {
        id: Buffer.from(userId).toString("base64url"),
        name: user.email,
        displayName: user.fullName,
      },
      pubKeyCredParams: [
        { alg: -7, type: "public-key" }, // ES256
        { alg: -257, type: "public-key" }, // RS256
      ],
      timeout: 60000,
      attestation: "direct",
      excludeCredentials: existingPasskeys.map((p) => ({
        id: p.credentialId,
        type: "public-key",
      })),
      authenticatorSelection: {
        residentKey: "preferred",
        userVerification: "preferred",
      },
    };
  }

  /**
   * 2. Verify Registration & Save Passkey Credential to Database
   */
  async registerPasskey(dto: RegisterPasskeyDTO) {
    const challengeKey = `webauthn:reg_challenge:${dto.userId}`;
    const stored = await redis.get(challengeKey);

    if (!stored) {
      throw new ValidationError("Passkey registration challenge expired or invalid");
    }

    await redis.del(challengeKey);

    // Check if credential ID already registered
    const existing = await db.query.userPasskeys.findFirst({
      where: eq(userPasskeys.credentialId, dto.credentialId),
    });

    if (existing) {
      throw new ConflictError("This passkey / security key is already registered");
    }

    const [newPasskey] = await db
      .insert(userPasskeys)
      .values({
        userId: dto.userId,
        credentialId: dto.credentialId,
        publicKey: dto.publicKey,
        counter: 0,
        deviceName: dto.deviceName || "Passkey Authenticator",
        createdAt: new Date(),
      })
      .returning();

    logger.info({ userId: dto.userId, credentialId: dto.credentialId }, "Registered new WebAuthn / Passkey authenticator");

    return newPasskey;
  }

  /**
   * 3. Generate WebAuthn Login Options (Assertion Challenge)
   */
  async generateLoginOptions(email: string) {
    const user = await db.query.users.findFirst({
      where: eq(users.email, email),
    });

    if (!user || !user.isActive) {
      throw new AuthenticationError("Invalid email or user inactive");
    }

    const registeredPasskeys = await db.query.userPasskeys.findMany({
      where: eq(userPasskeys.userId, user.id),
    });

    if (registeredPasskeys.length === 0) {
      throw new ValidationError("No passkeys registered for this account");
    }

    const challenge = randomBytes(32).toString("base64url");
    const challengeKey = `webauthn:auth_challenge:${user.id}`;

    await redis.setex(challengeKey, 300, JSON.stringify({ challenge, userId: user.id }));

    return {
      challenge,
      timeout: 60000,
      rpId: "localhost",
      allowCredentials: registeredPasskeys.map((p) => ({
        id: p.credentialId,
        type: "public-key",
      })),
      userVerification: "preferred",
    };
  }

  /**
   * 4. Verify Passkey Assertion & Authenticate User (Issues JWT Tokens)
   */
  async authenticateWithPasskey(dto: { credentialId: string; counter: number; signature: string; email: string }) {
    const user = await db.query.users.findFirst({
      where: eq(users.email, dto.email),
    });

    if (!user || !user.isActive) {
      throw new AuthenticationError("User invalid or inactive");
    }

    const passkey = await db.query.userPasskeys.findFirst({
      where: and(
        eq(userPasskeys.credentialId, dto.credentialId),
        eq(userPasskeys.userId, user.id)
      ),
    });

    if (!passkey) {
      throw new AuthenticationError("Unrecognized passkey / security key");
    }

    // Replay attack prevention check
    if (dto.counter <= passkey.counter && passkey.counter > 0) {
      logger.error({ userId: user.id, credentialId: dto.credentialId, counter: dto.counter }, "Passkey replay attack detected!");
      throw new AuthenticationError("Security assertion failed: Replay attack counter invalid");
    }

    // Update counter & last_used_at timestamp in database
    await db
      .update(userPasskeys)
      .set({
        counter: dto.counter,
        lastUsedAt: new Date(),
      })
      .where(eq(userPasskeys.id, passkey.id));

    // Issue JWT Access & Refresh Tokens
    const { rolesList, permissionsList } = await authService.getUserPermissions(user.id);
    const jwtPayload: JwtPayload = {
      userId: user.id,
      email: user.email,
      roles: rolesList,
      permissions: permissionsList,
    };

    const accessToken = generateAccessToken(jwtPayload);
    const refreshToken = generateRefreshToken();
    const tokenHash = await hashToken(refreshToken);

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    await db.insert(refreshTokens).values({
      userId: user.id,
      tokenHash,
      deviceInfo: "Passkey Biometric Login",
      expiresAt,
    });

    logger.info({ userId: user.id, credentialId: dto.credentialId }, "Successful Passkey / WebAuthn Biometric Authentication");

    return {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        roles: rolesList,
      },
    };
  }

  /**
   * 5. List Registered Authenticators for User
   */
  async listUserPasskeys(userId: string) {
    return await db.query.userPasskeys.findMany({
      where: eq(userPasskeys.userId, userId),
      columns: {
        id: true,
        credentialId: true,
        deviceName: true,
        counter: true,
        createdAt: true,
        lastUsedAt: true,
      },
    });
  }

  /**
   * 6. Revoke a Passkey Authenticator
   */
  async revokePasskey(userId: string, passkeyId: string) {
    await db
      .delete(userPasskeys)
      .where(and(eq(userPasskeys.id, passkeyId), eq(userPasskeys.userId, userId)));

    logger.info({ userId, passkeyId }, "Revoked WebAuthn / Passkey authenticator");
    return { revoked: true };
  }
}

export const webAuthnService = new WebAuthnService();
