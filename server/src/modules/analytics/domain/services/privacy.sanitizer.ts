export class PrivacySanitizer {
  private static sensitiveKeywords = [
    "password",
    "hash",
    "otp",
    "pin",
    "card",
    "cvv",
    "token",
    "secret",
    "ssn",
    "creditcard",
    "phone",
  ];

  public static sanitizeMetadata(metadata: Record<string, unknown>): Record<string, unknown> {
    if (!metadata || typeof metadata !== "object") return {};

    const sanitized: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(metadata)) {
      const lowerKey = key.toLowerCase();
      if (this.sensitiveKeywords.some((kw) => lowerKey.includes(kw))) {
        sanitized[key] = "[REDACTED_PII]";
      } else if (typeof value === "object" && value !== null && !Array.isArray(value)) {
        sanitized[key] = this.sanitizeMetadata(value as Record<string, unknown>);
      } else {
        sanitized[key] = value;
      }
    }
    return sanitized;
  }

  public static sanitizeUserReference(userId?: string, anonymousId?: string): { userId?: string; anonymousId: string } {
    return {
      userId: userId ?? undefined,
      anonymousId: anonymousId || `anon-${crypto.randomUUID().slice(0, 8)}`,
    };
  }
}
