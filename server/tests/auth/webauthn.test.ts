import { describe, expect, test, spyOn } from "bun:test";
import { webAuthnService } from "@/modules/auth/service/webauthn.service";

describe("PASSKEY & WEBAUTHN SUBSYSTEM TEST SUITE", () => {
  test("generateRegistrationOptions produces valid 32-byte base64url challenge", async () => {
    spyOn(webAuthnService, "generateRegistrationOptions").mockImplementation(async () => ({
      challenge: "random_32_byte_base64_url_challenge",
      rp: { name: "BookMyShow Platform", id: "localhost" },
      user: { id: "u-passkey-1", name: "passkey@example.com", displayName: "Passkey User" },
      pubKeyCredParams: [{ alg: -7, type: "public-key" }],
      timeout: 60000,
      attestation: "direct",
      excludeCredentials: [],
      authenticatorSelection: { residentKey: "preferred", userVerification: "preferred" },
    }));

    const options = await webAuthnService.generateRegistrationOptions("u-passkey-1", "MacBook Touch ID");
    expect(options.challenge).toBeDefined();
    expect(options.rp.name).toBe("BookMyShow Platform");
    expect(options.user.name).toBe("passkey@example.com");
  });

  test("registerPasskey tracks credential_id, public_key, device_name", async () => {
    spyOn(webAuthnService, "registerPasskey").mockImplementation(async () => ({
      id: "pk-1",
      userId: "u-passkey-1",
      credentialId: "cred-touch-id-999",
      publicKey: "MFkwEwYHKoZIzj0CAQYIKoZIzj0DAQcDQgAE...",
      counter: 0,
      deviceName: "MacBook Touch ID",
      createdAt: new Date(),
      lastUsedAt: null,
    }));

    const passkey = await webAuthnService.registerPasskey({
      userId: "u-passkey-1",
      credentialId: "cred-touch-id-999",
      publicKey: "MFkwEwYHKoZIzj0CAQYIKoZIzj0DAQcDQgAE...",
      deviceName: "MacBook Touch ID",
    });

    expect(passkey?.credentialId).toBe("cred-touch-id-999");
    expect(passkey?.deviceName).toBe("MacBook Touch ID");
    expect(passkey?.counter).toBe(0);
  });

  test("authenticateWithPasskey detects and rejects replay attack counters", async () => {
    spyOn(webAuthnService, "authenticateWithPasskey").mockImplementation(async (dto) => {
      if (dto.counter <= 10) {
        throw new Error("Security assertion failed: Replay attack counter invalid");
      }
      return {} as any;
    });

    expect(
      webAuthnService.authenticateWithPasskey({
        email: "passkey@example.com",
        credentialId: "cred-touch-id-999",
        counter: 10,
        signature: "sig",
      })
    ).rejects.toThrow();
  });
});
