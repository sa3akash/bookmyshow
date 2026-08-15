import { db } from "@/infrastructure/database/client";
import { users, userProfiles, roles, permissions, rolePermissions, userRoles, refreshTokens } from "@/infrastructure/database/schema";
import { eq, and } from "drizzle-orm";
import { ConflictError, AuthenticationError, NotFoundError } from "@/core/errors/app-error";
import { accountLockoutService } from "@/infrastructure/security/account-lockout.service";
import { generateAccessToken, generateRefreshToken, hashToken, JwtPayload } from "../domain/jwt";
import { ROLE_PERMISSIONS_MAP } from "../domain/rbac.permissions";
import { logger } from "@/core/observability/logger";

export interface RegisterDTO {
  email: string;
  phone?: string;
  password: string;
  fullName: string;
}

export interface LoginDTO {
  email?: string;
  phone?: string;
  password: string;
  deviceInfo?: string;
  ipAddress?: string;
}

export class AuthService {
  async register(dto: RegisterDTO) {
    // 1. Check existing user
    const existing = await db.query.users.findFirst({
      where: eq(users.email, dto.email),
    });

    if (existing) {
      throw new ConflictError("User with this email already exists");
    }

    // 2. Hash password natively with Bun
    const passwordHash = await Bun.password.hash(dto.password, {
      algorithm: "bcrypt",
      cost: 10,
    });

    // 3. Create user in transaction
    const newUser = await db.transaction(async (tx) => {
      const [insertedUser] = await tx
        .insert(users)
        .values({
          email: dto.email,
          phone: dto.phone,
          passwordHash,
          fullName: dto.fullName,
        })
        .returning();

      if (!insertedUser) {
        throw new Error("Failed to insert user");
      }

      // Create profile
      await tx.insert(userProfiles).values({
        userId: insertedUser.id,
      });

      // Find or assign CUSTOMER role
      let customerRole = await tx.query.roles.findFirst({
        where: eq(roles.name, "CUSTOMER"),
      });

      if (!customerRole) {
        [customerRole] = await tx
          .insert(roles)
          .values({
            name: "CUSTOMER",
            description: "Default customer role",
          })
          .returning();
      }

      if (customerRole) {
        await tx.insert(userRoles).values({
          userId: insertedUser.id,
          roleId: customerRole.id,
        });
      }

      return insertedUser;
    });

    return {
      id: newUser.id,
      email: newUser.email,
      fullName: newUser.fullName,
    };
  }

  async login(dto: LoginDTO) {
    const identifier = dto.email || dto.phone;
    if (!identifier) {
      throw new AuthenticationError("Email or phone number is required for authentication");
    }

    // 1. Check Account Lockout status
    await accountLockoutService.checkLockout(identifier);

    const user = await db.query.users.findFirst({
      where: dto.email ? eq(users.email, dto.email) : eq(users.phone, dto.phone!),
    });

    if (!user || !user.isActive) {
      await accountLockoutService.recordFailedAttempt(identifier);
      throw new AuthenticationError("Invalid credentials provided");
    }

    const isValidPassword = await Bun.password.verify(dto.password, user.passwordHash);
    if (!isValidPassword) {
      await accountLockoutService.recordFailedAttempt(identifier);
      throw new AuthenticationError("Invalid credentials provided");
    }

    // Reset failed attempts on success
    await accountLockoutService.resetAttempts(identifier);

    const { rolesList, permissionsList } = await this.getUserPermissions(user.id);

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
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 days

    await db.insert(refreshTokens).values({
      userId: user.id,
      tokenHash,
      deviceInfo: dto.deviceInfo,
      ipAddress: dto.ipAddress,
      expiresAt,
    });

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
   * Refresh Token Rotation & Token Reuse Detection
   */
  async refreshToken(rawRefreshToken: string, deviceInfo?: string, ipAddress?: string) {
    const tokenHash = await hashToken(rawRefreshToken);

    const existingToken = await db.query.refreshTokens.findFirst({
      where: eq(refreshTokens.tokenHash, tokenHash),
    });

    if (!existingToken) {
      throw new AuthenticationError("Invalid or unknown refresh token");
    }

    // REUSE DETECTION: If an already-revoked refresh token is presented, revoke ALL user sessions!
    if (existingToken.isRevoked) {
      logger.warn({ userId: existingToken.userId }, "CRITICAL: Refresh token reuse detected! Revoking all sessions for user");
      await db
        .update(refreshTokens)
        .set({ isRevoked: true })
        .where(eq(refreshTokens.userId, existingToken.userId));
      throw new AuthenticationError("Security Alert: Refresh token reuse detected! All user sessions have been terminated.");
    }

    if (existingToken.expiresAt < new Date()) {
      throw new AuthenticationError("Expired refresh token");
    }

    // Revoke old token (Rotation)
    await db
      .update(refreshTokens)
      .set({ isRevoked: true })
      .where(eq(refreshTokens.id, existingToken.id));

    const user = await db.query.users.findFirst({
      where: eq(users.id, existingToken.userId),
    });

    if (!user || !user.isActive) {
      throw new AuthenticationError("User is no longer active");
    }

    const { rolesList, permissionsList } = await this.getUserPermissions(user.id);

    const jwtPayload: JwtPayload = {
      userId: user.id,
      email: user.email,
      roles: rolesList,
      permissions: permissionsList,
    };

    const newAccessToken = generateAccessToken(jwtPayload);
    const newRefreshToken = generateRefreshToken();
    const newTokenHash = await hashToken(newRefreshToken);

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    await db.insert(refreshTokens).values({
      userId: user.id,
      tokenHash: newTokenHash,
      deviceInfo: deviceInfo || existingToken.deviceInfo,
      ipAddress: ipAddress || existingToken.ipAddress,
      expiresAt,
    });

    return {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    };
  }

  /**
   * Revoke single session
   */
  async logout(rawRefreshToken: string) {
    const tokenHash = await hashToken(rawRefreshToken);
    await db
      .update(refreshTokens)
      .set({ isRevoked: true })
      .where(eq(refreshTokens.tokenHash, tokenHash));
  }

  /**
   * Revoke ALL active sessions across all devices for user
   */
  async logoutAllDevices(userId: string) {
    await db
      .update(refreshTokens)
      .set({ isRevoked: true })
      .where(eq(refreshTokens.userId, userId));
    logger.info({ userId }, "Terminated all active sessions across all devices");
    return { success: true };
  }

  /**
   * List active non-revoked session records for user
   */
  async listActiveSessions(userId: string) {
    return await db.query.refreshTokens.findMany({
      where: and(
        eq(refreshTokens.userId, userId),
        eq(refreshTokens.isRevoked, false)
      ),
      columns: {
        id: true,
        deviceInfo: true,
        ipAddress: true,
        createdAt: true,
        expiresAt: true,
      },
    });
  }

  async getUserPermissions(userId: string) {
    const userRoleRecords = await db
      .select({ roleName: roles.name, roleId: roles.id })
      .from(userRoles)
      .innerJoin(roles, eq(userRoles.roleId, roles.id))
      .where(eq(userRoles.userId, userId));

    const rolesList = userRoleRecords.map((r) => r.roleName);
    const roleIds = userRoleRecords.map((r) => r.roleId);

    let permissionsList: string[] = [];

    if (roleIds.length > 0) {
      const permRecords = await db
        .select({ permName: permissions.name })
        .from(rolePermissions)
        .innerJoin(permissions, eq(rolePermissions.permissionId, permissions.id))
        .where(eq(rolePermissions.roleId, roleIds[0]!));

      permissionsList = Array.from(new Set(permRecords.map((p) => p.permName)));
    }

    // Default RBAC permissions fallback when database rolePermissions table has no explicit records
    if (permissionsList.length === 0 && rolesList.length > 0) {
      for (const roleName of rolesList) {
        const mapped = ROLE_PERMISSIONS_MAP[roleName as keyof typeof ROLE_PERMISSIONS_MAP];
        if (mapped) {
          permissionsList.push(...mapped);
        }
      }
      permissionsList = Array.from(new Set(permissionsList));
    }

    if (rolesList.includes("SUPER_ADMIN")) {
      permissionsList.push("analytics:read", "movie:create", "movie:update", "venue:create", "venue:update", "screen:create", "seat:update");
    }

    return { rolesList, permissionsList };
  }
}

export const authService = new AuthService();
