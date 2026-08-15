import { Elysia } from "elysia";
import { verifyAccessToken, JwtPayload } from "@/modules/auth/domain/jwt";
import { AuthenticationError, AuthorizationError } from "@/core/errors/app-error";

export const authMiddleware = new Elysia({ name: "authMiddleware" })
  .derive(({ request }) => {
    const authHeader = request.headers.get("authorization");
    let currentUser: JwtPayload | null = null;

    if (authHeader && authHeader.startsWith("Bearer ")) {
      const token = authHeader.substring(7);
      try {
        currentUser = verifyAccessToken(token);
      } catch {
        // Token invalid/expired - currentUser remains null
      }
    }

    return {
      currentUser,
      requireAuth: () => {
        if (!currentUser) {
          throw new AuthenticationError("Authentication required to access this resource");
        }
        return currentUser;
      },
      requireRole: (role: string) => {
        if (!currentUser) {
          throw new AuthenticationError("Authentication required");
        }
        if (!currentUser.roles.includes(role) && !currentUser.roles.includes("SUPER_ADMIN")) {
          throw new AuthorizationError(`Role '${role}' required`);
        }
        return currentUser;
      },
      requirePermission: (permission: string) => {
        if (!currentUser) {
          throw new AuthenticationError("Authentication required");
        }
        if (
          !currentUser.permissions.includes(permission) &&
          !currentUser.roles.includes("SUPER_ADMIN")
        ) {
          throw new AuthorizationError(`Permission '${permission}' required`);
        }
        return currentUser;
      },
    };
  });
