import { db } from "@/infrastructure/database/client";
import { financialLedger } from "@/infrastructure/database/schema";
import { eq, and } from "drizzle-orm";
import { logger } from "@/core/observability/logger";

export interface LedgerEntryDTO {
  entryType: "REVENUE" | "PLATFORM_FEE" | "TAX" | "GATEWAY_FEE" | "MERCHANT_PAYOUT" | "REFUND";
  direction: "CREDIT" | "DEBIT";
  amountMinor: number;
  currency?: string;
  referenceType: "booking" | "payment" | "refund" | "settlement";
  referenceId: string;
  metadata?: Record<string, unknown>;
}

export class FinancialLedgerService {
  async recordEntry(entry: LedgerEntryDTO) {
    const [inserted] = await db
      .insert(financialLedger)
      .values({
        entryType: entry.entryType,
        direction: entry.direction,
        amountMinor: entry.amountMinor,
        currency: entry.currency || "BDT",
        referenceType: entry.referenceType,
        referenceId: entry.referenceId,
        metadata: entry.metadata,
      })
      .returning();

    logger.info({ entryId: inserted!.id, type: entry.entryType, amountMinor: entry.amountMinor }, "Recorded financial ledger entry");
    return inserted!;
  }

  async getLedgerForReference(referenceType: string, referenceId: string) {
    return await db.query.financialLedger.findMany({
      where: and(
        eq(financialLedger.referenceType, referenceType),
        eq(financialLedger.referenceId, referenceId)
      ),
    });
  }
}

export const financialLedgerService = new FinancialLedgerService();
