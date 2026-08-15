import { Elysia, t } from "elysia";
import { mfaService } from "../service/mfa.service";
import { successResponse } from "@/core/types/api-response";
import { getRequestContext } from "@/core/context/request-context";

export const mfaController = new Elysia({ prefix: "/api/v1/auth/mfa" })
  .post(
    "/totp/setup",
    async ({ request }) => {
      const { requireAuth, requestId } = getRequestContext(request);
      const user = requireAuth();
      const result = await mfaService.setupTotp(user.userId);
      return successResponse(result, undefined, requestId);
    },
    {
      detail: {
        tags: ["Auth"],
        summary: "Generate TOTP secret, authenticator QR URI, and 8 SHA-256 hashed single-use recovery codes",
      },
    }
  )
  .post(
    "/totp/enable",
    async ({ body, request }) => {
      const { requireAuth, requestId } = getRequestContext(request);
      const user = requireAuth();
      const result = await mfaService.enableTotp(user.userId, body.code);
      return successResponse(result, undefined, requestId);
    },
    {
      body: t.Object({ code: t.String({ minLength: 6, maxLength: 6 }) }),
      detail: { tags: ["Auth"], summary: "Verify initial TOTP code and enable MFA on user account" },
    }
  )
  .post(
    "/totp/verify",
    async ({ body, request }) => {
      const { requireAuth, requestId } = getRequestContext(request);
      const user = requireAuth();
      await mfaService.verifyTotp(user.userId, body.code);
      return successResponse({ verified: true }, undefined, requestId);
    },
    {
      body: t.Object({ code: t.String({ minLength: 6, maxLength: 6 }) }),
      detail: { tags: ["Auth"], summary: "Verify 6-digit TOTP code during step-up login" },
    }
  )
  .post(
    "/otp/send",
    async ({ body, request }) => {
      const { requireAuth, requestId } = getRequestContext(request);
      const user = requireAuth();

      let result;
      if (body.channel === "SMS") {
        result = await mfaService.sendSmsOtp(user.userId, body.target);
      } else {
        result = await mfaService.sendEmailOtp(user.userId, body.target);
      }

      return successResponse(result, undefined, requestId);
    },
    {
      body: t.Object({
        channel: t.Union([t.Literal("SMS"), t.Literal("EMAIL")]),
        target: t.String(),
      }),
      detail: { tags: ["Auth"], summary: "Dispatch SMS or Email 6-digit OTP (5-minute TTL in Redis)" },
    }
  )
  .post(
    "/otp/verify",
    async ({ body, request }) => {
      const { requireAuth, requestId } = getRequestContext(request);
      const user = requireAuth();
      await mfaService.verifyChannelOtp(user.userId, body.channel, body.code);
      return successResponse({ verified: true }, undefined, requestId);
    },
    {
      body: t.Object({
        channel: t.Union([t.Literal("SMS"), t.Literal("EMAIL")]),
        code: t.String({ minLength: 6, maxLength: 6 }),
      }),
      detail: { tags: ["Auth"], summary: "Verify and invalidate 1-time SMS or Email OTP code" },
    }
  )
  .post(
    "/recovery/verify",
    async ({ body, request }) => {
      const { requireAuth, requestId } = getRequestContext(request);
      const user = requireAuth();
      await mfaService.verifyRecoveryCode(user.userId, body.recoveryCode);
      return successResponse({ verified: true }, undefined, requestId);
    },
    {
      body: t.Object({ recoveryCode: t.String() }),
      detail: { tags: ["Auth"], summary: "Verify single-use hashed MFA recovery code" },
    }
  );
