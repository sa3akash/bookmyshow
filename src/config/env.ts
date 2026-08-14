import { z } from "zod";
import dotenv from "dotenv";

dotenv.config();

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "staging", "production"]).default("development"),
  PORT: z.coerce.number().default(3000),
  HOST: z.string().default("0.0.0.0"),
  
  // Database Configuration
  DATABASE_URL: z.string().default("postgres://postgres:postgres@localhost:5432/bookmyshow"),
  DATABASE_MAX_CONNECTIONS: z.coerce.number().default(20),
  DATABASE_IDLE_TIMEOUT: z.coerce.number().default(30),
  
  // Redis Configuration
  REDIS_URL: z.string().default("redis://localhost:6379"),
  REDIS_KEY_PREFIX: z.string().default("bms:"),
  
  // JWT & Security Configuration
  JWT_SECRET: z.string().min(32, "JWT Secret must be at least 32 characters").default("super-secret-jwt-key-bookmyshow-production-grade-secret-32-chars"),
  JWT_ACCESS_EXPIRES_IN: z.string().default("15m"),
  JWT_REFRESH_EXPIRES_IN: z.string().default("7d"),

  // Cloudflare Turnstile & Google reCAPTCHA
  TURNSTILE_SECRET_KEY: z.string().optional().default("1x0000000000000000000000000000000AA"),
  RECAPTCHA_SECRET_KEY: z.string().optional().default("6LeIxAcTAAAAAGG-vFI1TnRW8mzNF65B4d-ELstq"),

  // Seat Lock Configuration
  SEAT_HOLD_DURATION_SECONDS: z.coerce.number().default(300), // 5 minutes hold
  
  // Observability & Log Level
  LOG_LEVEL: z.enum(["fatal", "error", "warn", "info", "debug", "trace"]).default("info"),
});

const _env = envSchema.safeParse(process.env);

if (!_env.success) {
  console.error("❌ Invalid environment variables:", _env.error.format());
  throw new Error("Invalid environment variables");
}

export const env = _env.data;
export type Env = z.infer<typeof envSchema>;
