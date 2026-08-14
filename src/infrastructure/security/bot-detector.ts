import { redis } from "@/infrastructure/redis/client";
import { logger } from "@/core/observability/logger";
import { ForbiddenError, TooManyRequestsError } from "@/core/errors/app-error";

export interface BotRiskAssessment {
  score: number; // 0 (Legitimate Human) to 100 (Malicious Bot)
  reasons: string[];
  isBlocked: boolean;
}

export class BotDetector {
  private knownBotUserAgents = [
    "puppeteer",
    "selenium",
    "headlesschrome",
    "phantomjs",
    "playwright",
    "python-requests",
    "postmanruntime",
    "curl",
    "wget",
    "scrapy",
  ];

  /**
   * Analyze Request Headers & Fingerprint for Bot Indicators
   */
  async assessRisk(headers: Record<string, string | undefined>, clientIp: string): Promise<BotRiskAssessment> {
    let score = 0;
    const reasons: string[] = [];

    const userAgent = (headers["user-agent"] || "").toLowerCase();
    const deviceFingerprint = headers["x-device-fingerprint"];
    const cfRay = headers["cf-ray"]; // Cloudflare Ray ID

    // 1. User Agent Scraper / Automated Bot Check
    if (!userAgent) {
      score += 40;
      reasons.push("Missing User-Agent header");
    } else {
      for (const botKeyword of this.knownBotUserAgents) {
        if (userAgent.includes(botKeyword)) {
          score += 60;
          reasons.push(`Suspicious automated User-Agent detected: ${botKeyword}`);
          break;
        }
      }
    }

    // 2. Device Fingerprint Validation
    if (!deviceFingerprint) {
      score += 25;
      reasons.push("Missing x-device-fingerprint header");
    } else if (deviceFingerprint.length < 16) {
      score += 30;
      reasons.push("Malformed or synthetic device fingerprint");
    }

    // 3. IP Reputation & Banned IP List Check in Redis
    try {
      const isBanned = await redis.get(`bot:banned:ip:${clientIp}`);
      if (isBanned) {
        score += 100;
        reasons.push(`IP address ${clientIp} is temporarily blacklisted for abuse`);
      }
    } catch {
      // Ignore Redis error fallback
    }

    // 4. Cloudflare Proxy Sanity Check
    if (process.env.NODE_ENV === "production" && !cfRay) {
      score += 15;
      reasons.push("Request bypassed Cloudflare proxy shield");
    }

    const isBlocked = score >= 75;

    if (isBlocked) {
      logger.warn({ clientIp, score, reasons, userAgent }, "High-risk bot threat detected and blocked");
    }

    return { score, reasons, isBlocked };
  }

  /**
   * Behavior Analysis: Velocity Rate-Limiting for Sensitive Actions (Coupon trial & Seat Hold Spam)
   */
  async checkActionVelocity(keyPrefix: string, identifier: string, limitWindowSec: number, maxAllowed: number): Promise<void> {
    const key = `velocity:${keyPrefix}:${identifier}`;
    try {
      const current = await redis.incr(key);
      if (current === 1) {
        await redis.expire(key, limitWindowSec);
      }

      if (current > maxAllowed) {
        // Flag IP in banlist for 10 minutes if velocity exceeded significantly
        if (current > maxAllowed * 2) {
          await redis.setex(`bot:banned:ip:${identifier}`, 600, "1");
        }
        throw new TooManyRequestsError("Abnormal request velocity detected. Action temporarily restricted to prevent abuse.");
      }
    } catch (err) {
      if (err instanceof TooManyRequestsError) throw err;
      // Fallback silently if Redis error
    }
  }

  /**
   * Guard Hook to enforce Bot Protection on High-Risk Endpoints
   */
  async enforceBotProtection(headers: Record<string, string | undefined>, clientIp: string): Promise<void> {
    const assessment = await this.assessRisk(headers, clientIp);
    if (assessment.isBlocked) {
      throw new ForbiddenError(`Security Shield: Request blocked due to high risk score (${assessment.reasons.join(", ")})`);
    }
  }
}

export const botDetector = new BotDetector();
