import jwt from "jsonwebtoken";
import { env } from "@/config/env";
import { AuthenticationError } from "@/core/errors/app-error";

export interface JwtPayload {
  userId: string;
  email: string;
  roles: string[];
  permissions: string[];
}

export function generateAccessToken(payload: JwtPayload): string {
  return jwt.sign(payload, env.JWT_SECRET, {
    expiresIn: "15m",
  });
}

export function generateRefreshToken(): string {
  return crypto.randomUUID() + "." + crypto.randomUUID();
}

export async function hashToken(token: string): Promise<string> {
  const hasher = new Bun.CryptoHasher("sha256");
  hasher.update(token);
  return hasher.digest("hex");
}

export function verifyAccessToken(token: string): JwtPayload {
  try {
    return jwt.verify(token, env.JWT_SECRET) as JwtPayload;
  } catch {
    throw new AuthenticationError("Invalid or expired access token");
  }
}
