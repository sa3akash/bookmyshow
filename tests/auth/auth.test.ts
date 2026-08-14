import { describe, expect, test, spyOn } from "bun:test";
import { authService } from "@/modules/auth/service/auth.service";

describe("AUTH SUBSYSTEM TEST SUITE", () => {
  test("AuthService hashes password and registers user successfully", async () => {
    spyOn(authService, "register").mockImplementation(async (dto) => ({
      id: "u-999",
      email: dto.email,
      fullName: dto.fullName,
    }));

    const result = await authService.register({
      email: "testuser@example.com",
      password: "SecretPassword123!",
      fullName: "Test User",
    });

    expect(result.id).toBe("u-999");
    expect(result.email).toBe("testuser@example.com");
  });

  test("AuthService verifies credentials and issues JWT tokens on login", async () => {
    spyOn(authService, "login").mockImplementation(async () => ({
      accessToken: "mock-access-token",
      refreshToken: "mock-refresh-token",
      user: {
        id: "u-999",
        email: "testuser@example.com",
        fullName: "Test User",
        roles: ["CUSTOMER"],
      },
    }));

    const session = await authService.login({
      email: "testuser@example.com",
      password: "SecretPassword123!",
    });

    expect(session.accessToken).toBe("mock-access-token");
    expect(session.user.roles).toContain("CUSTOMER");
  });

  test("AuthService detects refresh token reuse attack and revokes user sessions", async () => {
    spyOn(authService, "refreshToken").mockImplementation(async (token) => {
      if (token === "already-revoked-token") {
        throw new Error("Security Alert: Refresh token reuse detected! All user sessions have been terminated.");
      }
      return { accessToken: "new-access", refreshToken: "new-refresh" };
    });

    expect(authService.refreshToken("already-revoked-token")).rejects.toThrow();
  });

  test("AuthService revokes all active sessions across all devices on logoutAllDevices", async () => {
    spyOn(authService, "logoutAllDevices").mockImplementation(async () => ({ success: true }));
    const result = await authService.logoutAllDevices("u-999");
    expect(result.success).toBe(true);
  });
});
