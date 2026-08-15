import pino from "pino";
import { env } from "@/config/env";

export const logger = pino({
  level: env.LOG_LEVEL,
  redact: {
    paths: [
      "password",
      "passwordHash",
      "otp",
      "accessToken",
      "refreshToken",
      "token",
      "cardNumber",
      "cvv",
      "secret",
      "secretKey",
      "mfaSecret",
      "authorization",
      "headers.authorization",
      "headers.cookie",
      "req.headers.authorization",
    ],
    censor: "[REDACTED]",
  },
  transport: env.NODE_ENV === "development" ? {
    target: "pino-pretty",
    options: {
      colorize: true,
      translateTime: "SYS:standard",
      ignore: "pid,hostname",
    },
  } : undefined,
  formatters: {
    level: (label) => ({ level: label }),
  },
  base: {
    env: env.NODE_ENV,
    service: "bookmyshow-backend",
  },
  timestamp: pino.stdTimeFunctions.isoTime,
});
