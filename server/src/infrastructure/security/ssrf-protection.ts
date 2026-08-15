import { ForbiddenError } from "@/core/errors/app-error";

export class SSRFProtection {
  private static privateIpRanges = [
    /^127\./, // 127.0.0.0/8 (Loopback)
    /^10\./, // 10.0.0.0/8 (Private)
    /^172\.(1[6-9]|2[0-9]|3[0-1])\./, // 172.16.0.0/12 (Private)
    /^192\.168\./, // 192.168.0.0/16 (Private)
    /^169\.254\./, // 169.254.0.0/16 (AWS Link-local / IMDS)
    /^0\./, // 0.0.0.0/8
    /^localhost$/i,
  ];

  /**
   * Validate URL against SSRF vulnerabilities before outbound HTTP calls (webhooks, avatar fetches)
   */
  static validateOutboundUrl(targetUrl: string): void {
    let parsedUrl: URL;

    try {
      parsedUrl = new URL(targetUrl);
    } catch {
      throw new ForbiddenError("Invalid target URL provided");
    }

    if (parsedUrl.protocol !== "http:" && parsedUrl.protocol !== "https:") {
      throw new ForbiddenError("SSRF Shield: Only HTTP and HTTPS protocols are permitted");
    }

    const hostname = parsedUrl.hostname.toLowerCase();

    for (const range of this.privateIpRanges) {
      if (range.test(hostname)) {
        throw new ForbiddenError(`SSRF Shield: Access to internal network host '${hostname}' is strictly forbidden`);
      }
    }
  }
}
