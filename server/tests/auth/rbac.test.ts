import { describe, expect, test } from "bun:test";
import { getRequestContext } from "@/core/context/request-context";
import { generateAccessToken } from "@/modules/auth/domain/jwt";
import { ROLE_PERMISSIONS_MAP } from "@/modules/auth/domain/rbac.permissions";

describe("PERMISSION-BASED RBAC SUBSYSTEM TEST SUITE", () => {
  test("ROLE_PERMISSIONS_MAP maps all 8 roles correctly", () => {
    expect(ROLE_PERMISSIONS_MAP.SUPER_ADMIN).toContain("admin:reconcile");
    expect(ROLE_PERMISSIONS_MAP.MOVIE_MANAGER).toContain("movie:create");
    expect(ROLE_PERMISSIONS_MAP.VENUE_MANAGER).toContain("venue:create");
    expect(ROLE_PERMISSIONS_MAP.SUPPORT_AGENT).toContain("refund:create");
    expect(ROLE_PERMISSIONS_MAP.FINANCE_MANAGER).toContain("refund:process");
    expect(ROLE_PERMISSIONS_MAP.CONTENT_MANAGER).toContain("event:create");
    expect(ROLE_PERMISSIONS_MAP.CUSTOMER).toContain("booking:create");
  });

  test("requirePermission allows authorized request with role permission fallback", () => {
    const token = generateAccessToken({
      userId: "u-movie-mgr",
      email: "moviemgr@example.com",
      roles: ["MOVIE_MANAGER"],
      permissions: [],
    });

    const req = new Request("http://localhost/api/v1/movies", {
      headers: { authorization: `Bearer ${token}` },
    });

    const ctx = getRequestContext(req);
    expect(() => ctx.requirePermission("movie:create")).not.toThrow();
  });

  test("requirePermission blocks unauthorized request lacking specific permission", () => {
    const token = generateAccessToken({
      userId: "u-customer",
      email: "cust@example.com",
      roles: ["CUSTOMER"],
      permissions: [],
    });

    const req = new Request("http://localhost/api/v1/movies", {
      headers: { authorization: `Bearer ${token}` },
    });

    const ctx = getRequestContext(req);
    expect(() => ctx.requirePermission("movie:create")).toThrow();
  });

  test("requirePermission grants full access to SUPER_ADMIN role", () => {
    const token = generateAccessToken({
      userId: "u-super-admin",
      email: "superadmin@example.com",
      roles: ["SUPER_ADMIN"],
      permissions: [],
    });

    const req = new Request("http://localhost/api/v1/admin/reconcile", {
      headers: { authorization: `Bearer ${token}` },
    });

    const ctx = getRequestContext(req);
    expect(() => ctx.requirePermission("admin:reconcile")).not.toThrow();
  });
});
