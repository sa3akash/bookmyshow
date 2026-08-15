import { Elysia, t } from "elysia";
import { authService } from "../service/auth.service";
import { successResponse } from "@/core/types/api-response";
import { getRequestContext } from "@/core/context/request-context";

export const authController = new Elysia({ prefix: "/api/v1/auth" })
  .post(
    "/register",
    async ({ body, request }) => {
      const { requestId } = getRequestContext(request);
      const user = await authService.register(body);
      return successResponse(user, undefined, requestId);
    },
    {
      body: t.Object({
        email: t.String({ format: "email" }),
        phone: t.Optional(t.String()),
        password: t.String({ minLength: 8 }),
        fullName: t.String({ minLength: 2 }),
      }),
      detail: {
        tags: ["Auth"],
        summary: "Register a new user account",
      },
    }
  )
  .post(
    "/login",
    async ({ body, request }) => {
      const { requestId } = getRequestContext(request);
      const userAgent = request.headers.get("user-agent") || undefined;
      const ip = request.headers.get("x-forwarded-for") || "127.0.0.1";
      const result = await authService.login({
        email: body.email,
        phone: body.phone,
        password: body.password,
        deviceInfo: userAgent,
        ipAddress: ip,
      });
      return successResponse(result, undefined, requestId);
    },
    {
      body: t.Object({
        email: t.Optional(t.String()),
        phone: t.Optional(t.String()),
        password: t.String(),
      }),
      detail: {
        tags: ["Auth"],
        summary: "Authenticate user via email/password or phone/password and issue tokens",
      },
    }
  )
  .post(
    "/refresh",
    async ({ body, request }) => {
      const { requestId } = getRequestContext(request);
      const userAgent = request.headers.get("user-agent") || undefined;
      const ip = request.headers.get("x-forwarded-for") || "127.0.0.1";
      const result = await authService.refreshToken(body.refreshToken, userAgent, ip);
      return successResponse(result, undefined, requestId);
    },
    {
      body: t.Object({
        refreshToken: t.String(),
      }),
      detail: {
        tags: ["Auth"],
        summary: "Rotate refresh token with reuse detection and issue new access token",
      },
    }
  )
  .post(
    "/logout",
    async ({ body, request }) => {
      const { requestId } = getRequestContext(request);
      await authService.logout(body.refreshToken);
      return successResponse({ message: "Successfully logged out" }, undefined, requestId);
    },
    {
      body: t.Object({
        refreshToken: t.String(),
      }),
      detail: {
        tags: ["Auth"],
        summary: "Revoke single session refresh token",
      },
    }
  )
  .post(
    "/logout-all",
    async ({ request }) => {
      const { requireAuth, requestId } = getRequestContext(request);
      const user = requireAuth();
      const result = await authService.logoutAllDevices(user.userId);
      return successResponse(result, undefined, requestId);
    },
    {
      detail: {
        tags: ["Auth"],
        summary: "Revoke all active sessions across all devices for current user",
      },
    }
  )
  .get(
    "/sessions",
    async ({ request }) => {
      const { requireAuth, requestId } = getRequestContext(request);
      const user = requireAuth();
      const sessions = await authService.listActiveSessions(user.userId);
      return successResponse(sessions, undefined, requestId);
    },
    {
      detail: {
        tags: ["Auth"],
        summary: "List all active non-revoked session records for current user",
      },
    }
  )
  .get(
    "/me",
    ({ request }) => {
      const { requireAuth, requestId } = getRequestContext(request);
      const user = requireAuth();
      return successResponse(user, undefined, requestId);
    },
    {
      detail: {
        tags: ["Auth"],
        summary: "Get current authenticated user profile",
      },
    }
  );
