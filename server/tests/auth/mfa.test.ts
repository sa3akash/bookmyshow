import { describe, expect, test, spyOn } from "bun:test";
import { mfaService } from "@/modules/auth/service/mfa.service";

describe("MULTI-FACTOR AUTHENTICATION (MFA) SUBSYSTEM TEST SUITE", () => {
  test("mfaService generates valid SHA-256 string hash", () => {
    const rawCode = "A1B2C3D4E5";
    const hash = mfaService.hashString(rawCode);
    expect(hash).toHaveLength(64); // SHA-256 hex string
    expect(hash).not.toBe(rawCode);
  });

  test("mfaService generates TOTP secret and 6-digit TOTP code", () => {
    const secret = "SECRETKEY1234567890";
    const code = mfaService.generateTotpCode(secret);
    expect(code).toHaveLength(6);
    expect(/^\d{6}$/.test(code)).toBe(true);

    const isValid = mfaService.verifyTotpCode(secret, code);
    expect(isValid).toBe(true);
  });

  test("mfaService dispatches SMS and Email 6-digit OTPs", async () => {
    const smsRes = await mfaService.sendSmsOtp("u-101", "+8801700000000");
    expect(smsRes.channel).toBe("SMS");
    expect(smsRes.expiresSec).toBe(300);

    const emailRes = await mfaService.sendEmailOtp("u-101", "user@example.com");
    expect(emailRes.channel).toBe("EMAIL");
    expect(emailRes.expiresSec).toBe(300);
  });

  test("mfaService verifies SMS channel OTP correctly", async () => {
    const spyOtp = spyOn(mfaService, "generateNumericOtp").mockReturnValue("123456");
    await mfaService.sendSmsOtp("u-202", "+8801800000000");

    const verified = await mfaService.verifyChannelOtp("u-202", "SMS", "123456");
    expect(verified).toBe(true);
    spyOtp.mockRestore();
  });
});
