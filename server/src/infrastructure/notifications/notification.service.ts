import { logger } from "@/core/observability/logger";

export interface SendEmailDTO {
  to: string;
  subject: string;
  bodyHtml: string;
}

export interface SendSMSDTO {
  phone: string;
  message: string;
}

export class NotificationService {
  async sendEmail(dto: SendEmailDTO): Promise<boolean> {
    logger.info({ to: dto.to, subject: dto.subject }, "Dispatching email notification");
    // Adapter logic for Mailpit / SMTP / SES
    return true;
  }

  async sendSMS(dto: SendSMSDTO): Promise<boolean> {
    logger.info({ phone: dto.phone }, "Dispatching SMS notification");
    // Adapter logic for Twilio / Infobip / SSL Wireless
    return true;
  }
}

export const notificationService = new NotificationService();
