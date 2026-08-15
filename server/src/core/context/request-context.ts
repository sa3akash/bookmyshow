import { verifyAccessToken, JwtPayload } from "@/modules/auth/domain/jwt";
import { AuthenticationError, AuthorizationError } from "@/core/errors/app-error";
import { ROLE_PERMISSIONS_MAP, RoleName, PermissionName } from "@/modules/auth/domain/rbac.permissions";

export function getRequestContext(request: Request) {
  const requestId = request.headers.get("x-request-id") || crypto.randomUUID();
  const traceId = request.headers.get("x-trace-id") || crypto.randomUUID();

  const authHeader = request.headers.get("authorization");
  let currentUser: JwtPayload | null = null;

  if (authHeader && authHeader.startsWith("Bearer ")) {
    const token = authHeader.substring(7);
    try {
      currentUser = verifyAccessToken(token);
    } catch {
      // Token invalid or expired
    }
  }

  return {
    requestId,
    traceId,
    currentUser,
    requireAuth: (): JwtPayload => {
      if (!currentUser) {
        throw new AuthenticationError("Authentication required to access this resource");
      }
      return currentUser;
    },
    requireRole: (role: string): JwtPayload => {
      if (!currentUser) {
        throw new AuthenticationError("Authentication required");
      }
      if (!currentUser.roles.includes(role) && !currentUser.roles.includes("SUPER_ADMIN")) {
        throw new AuthorizationError(`Role '${role}' required`);
      }
      return currentUser;
    },
    requirePermission: (permission: PermissionName | string): JwtPayload => {
      if (!currentUser) {
        throw new AuthenticationError("Authentication required");
      }

      // Check explicit JWT permissions array
      let hasPerm = currentUser.permissions?.includes(permission);

      // Fallback: check permissions mapped to any of user's active roles
      if (!hasPerm && currentUser.roles) {
        for (const role of currentUser.roles) {
          const mappedPerms = ROLE_PERMISSIONS_MAP[role as RoleName];
          if (mappedPerms && mappedPerms.includes(permission as PermissionName)) {
            hasPerm = true;
            break;
          }
        }
      }

      // SUPER_ADMIN bypass
      if (currentUser.roles?.includes("SUPER_ADMIN")) {
        hasPerm = true;
      }

      if (!hasPerm) {
        throw new AuthorizationError(`Permission '${permission}' required`);
      }

      return currentUser;
    },
  };
}
