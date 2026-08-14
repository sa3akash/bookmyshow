import { db } from "@/infrastructure/database/client";
import { auditLogs } from "@/infrastructure/database/schema";
import { logger } from "@/core/observability/logger";

export interface CreateAuditLogDTO {
  actorId?: string;
  action: string;
  resource: string;
  resourceId?: string;
  payload?: Record<string, unknown>;
  ipAddress?: string;
}

export class AuditLogService {
  async recordAudit(dto: CreateAuditLogDTO) {
    const [inserted] = await db
      .insert(auditLogs)
      .values({
        userId: dto.actorId,
        action: dto.action,
        resource: dto.resource,
        resourceId: dto.resourceId,
        payload: dto.payload,
        ipAddress: dto.ipAddress,
      })
      .returning();

    logger.info({ auditId: inserted!.id, action: dto.action, resource: dto.resource }, "Recorded audit log entry");
    return inserted!;
  }
}

export const auditLogService = new AuditLogService();
