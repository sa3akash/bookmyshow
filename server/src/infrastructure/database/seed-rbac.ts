import { db } from "./client";
import { roles, permissions, rolePermissions } from "./schema";
import { ROLE_PERMISSIONS_MAP, RoleName, PermissionName } from "@/modules/auth/domain/rbac.permissions";
import { eq } from "drizzle-orm";
import { logger } from "@/core/observability/logger";

export async function seedRbacData() {
  logger.info("Starting RBAC roles and permission seeding...");

  const allRoleNames = Object.keys(ROLE_PERMISSIONS_MAP) as RoleName[];
  const allPermissionsSet = new Set<PermissionName>();

  for (const rolePerms of Object.values(ROLE_PERMISSIONS_MAP)) {
    for (const perm of rolePerms) {
      allPermissionsSet.add(perm);
    }
  }

  // 1. Seed Permissions
  const permMap = new Map<string, string>();
  for (const permName of allPermissionsSet) {
    let permRecord = await db.query.permissions.findFirst({
      where: eq(permissions.name, permName),
    });

    if (!permRecord) {
      [permRecord] = await db
        .insert(permissions)
        .values({
          name: permName,
          description: `Permission for ${permName}`,
        })
        .returning();
    }

    if (permRecord) {
      permMap.set(permName, permRecord.id);
    }
  }

  // 2. Seed Roles and Role Permissions
  for (const roleName of allRoleNames) {
    let roleRecord = await db.query.roles.findFirst({
      where: eq(roles.name, roleName),
    });

    if (!roleRecord) {
      [roleRecord] = await db
        .insert(roles)
        .values({
          name: roleName,
          description: `Predefined ${roleName} RBAC Role`,
        })
        .returning();
    }

    if (roleRecord) {
      const assignedPerms = ROLE_PERMISSIONS_MAP[roleName];
      for (const permName of assignedPerms) {
        const permId = permMap.get(permName);
        if (permId) {
          const existingMapping = await db.query.rolePermissions.findFirst({
            where: (rp, { and, eq }) => and(eq(rp.roleId, roleRecord!.id), eq(rp.permissionId, permId)),
          });

          if (!existingMapping) {
            await db.insert(rolePermissions).values({
              roleId: roleRecord.id,
              permissionId: permId,
            });
          }
        }
      }
    }
  }

  logger.info("RBAC Roles and Permissions successfully seeded!");
}
