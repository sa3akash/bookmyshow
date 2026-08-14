import { Elysia, t } from "elysia";
import { webAuthnService } from "../service/webauthn.service";
import { successResponse } from "@/core/types/api-response";
import { getRequestContext } from "@/core/context/request-context";

export const webAuthnController = new Elysia({ prefix: "/api/v1/auth/passkey" })
  .post(
    "/register/options",
    async ({ body, request }) => {
      const { requireAuth, requestId } = getRequestContext(request);
      const user = requireAuth();
      const options = await webAuthnService.generateRegistrationOptions(user.userId, body?.deviceName);
      return successResponse(options, undefined, requestId);
    },
    {
      body: t.Optional(t.Object({ deviceName: t.Optional(t.String()) })),
      detail: { tags: ["Auth"], summary: "Generate WebAuthn / Passkey registration options (Challenge)" },
    }
  )
  .post(
    "/register/verify",
    async ({ body, request }) => {
      const { requireAuth, requestId } = getRequestContext(request);
      const user = requireAuth();
      const passkey = await webAuthnService.registerPasskey({
        userId: user.userId,
        credentialId: body.credentialId,
        publicKey: body.publicKey,
        deviceName: body.deviceName,
      });
      return successResponse(passkey, undefined, requestId);
    },
    {
      body: t.Object({
        credentialId: t.String(),
        publicKey: t.String(),
        deviceName: t.Optional(t.String()),
      }),
      detail: { tags: ["Auth"], summary: "Verify WebAuthn response and save Passkey authenticator" },
    }
  )
  .post(
    "/login/options",
    async ({ body, request }) => {
      const { requestId } = getRequestContext(request);
      const options = await webAuthnService.generateLoginOptions(body.email);
      return successResponse(options, undefined, requestId);
    },
    {
      body: t.Object({ email: t.String({ format: "email" }) }),
      detail: { tags: ["Auth"], summary: "Generate WebAuthn / Passkey login assertion options" },
    }
  )
  .post(
    "/login/verify",
    async ({ body, request }) => {
      const { requestId } = getRequestContext(request);
      const result = await webAuthnService.authenticateWithPasskey(body);
      return successResponse(result, undefined, requestId);
    },
    {
      body: t.Object({
        email: t.String({ format: "email" }),
        credentialId: t.String(),
        counter: t.Number({ minimum: 0 }),
        signature: t.String(),
      }),
      detail: { tags: ["Auth"], summary: "Authenticate via Passkey / Touch ID / Face ID / YubiKey and issue JWT tokens" },
    }
  )
  .get(
    "/authenticators",
    async ({ request }) => {
      const { requireAuth, requestId } = getRequestContext(request);
      const user = requireAuth();
      const list = await webAuthnService.listUserPasskeys(user.userId);
      return successResponse(list, undefined, requestId);
    },
    {
      detail: { tags: ["Auth"], summary: "List registered Passkey / WebAuthn authenticators for current user" },
    }
  )
  .delete(
    "/authenticators/:id",
    async ({ params, request }) => {
      const { requireAuth, requestId } = getRequestContext(request);
      const user = requireAuth();
      const result = await webAuthnService.revokePasskey(user.userId, params.id);
      return successResponse(result, undefined, requestId);
    },
    {
      params: t.Object({ id: t.String() }),
      detail: { tags: ["Auth"], summary: "Revoke a registered Passkey / Security Key" },
    }
  );
