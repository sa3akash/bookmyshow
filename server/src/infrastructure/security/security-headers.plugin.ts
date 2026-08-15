import { Elysia } from "elysia";

export const securityHeadersPlugin = new Elysia({ name: "security-headers" })
  .onBeforeHandle({ as: "global" }, ({ set }) => {
    set.headers["X-DNS-Prefetch-Control"] = "off";
    set.headers["X-Frame-Options"] = "SAMEORIGIN";
    set.headers["X-Content-Type-Options"] = "nosniff";
    set.headers["X-XSS-Protection"] = "1; mode=block";
    set.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains";
    set.headers["Referrer-Policy"] = "strict-origin-when-cross-origin";
    set.headers["Permissions-Policy"] = "geolocation=(), camera=(), microphone=(), payment=()";
    set.headers["Content-Security-Policy"] =
      "default-src 'self'; " +
      "script-src 'self' 'unsafe-inline' https://challenges.cloudflare.com https://cdn.jsdelivr.net; " +
      "script-src-elem 'self' 'unsafe-inline' https://challenges.cloudflare.com https://cdn.jsdelivr.net; " +
      "style-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net; " +
      "img-src 'self' data: https:; " +
      "font-src 'self' data: https://cdn.jsdelivr.net; " +
      "connect-src 'self' https:; " +
      "frame-src https://challenges.cloudflare.com https://studio.apollographql.com;";
  });
