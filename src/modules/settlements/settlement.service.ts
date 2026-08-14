import { db } from "@/infrastructure/database/client";
import { settlements, shows, bookings, venueScreens, venues } from "@/infrastructure/database/schema";
import { eq, and, gte, lte, sum, inArray } from "drizzle-orm";
import { financialLedgerService } from "@/core/ledger/ledger.service";
import { NotFoundError } from "@/core/errors/app-error";

export class SettlementService {
  async generateVenueSettlement(venueId: string, periodStart: Date, periodEnd: Date) {
    const venue = await db.query.venues.findFirst({
      where: eq(venues.id, venueId),
    });

    if (!venue) {
      throw new NotFoundError(`Venue ${venueId} not found`);
    }

    // Get screens for venue
    const screens = await db.query.venueScreens.findMany({
      where: eq(venueScreens.venueId, venueId),
    });

    const screenIds = screens.map((s) => s.id);
    if (screenIds.length === 0) {
      return { totalTicketRevenueMinor: 0, netPayoutMinor: 0 };
    }

    // Get shows for screens in time range
    const venueShows = await db
      .select({ showId: shows.id })
      .from(shows)
      .where(
        and(
          inArray(shows.screenId, screenIds),
          gte(shows.startTime, periodStart),
          lte(shows.endTime, periodEnd)
        )
      );

    const showIds = venueShows.map((s) => s.showId);
    if (showIds.length === 0) {
      return { totalTicketRevenueMinor: 0, netPayoutMinor: 0 };
    }

    // Aggregate confirmed ticket revenue
    const revenueSum = await db
      .select({ total: sum(bookings.finalAmountMinor) })
      .from(bookings)
      .where(
        and(
          inArray(bookings.showId, showIds),
          inArray(bookings.status, ["CONFIRMED", "TICKET_ISSUED"])
        )
      );

    const totalRevenueMinor = revenueSum[0]?.total ? Number(revenueSum[0].total) : 0;

    // Financial breakdown: Platform Fee = 10%, Tax = 5%
    const platformFeeMinor = Math.round(totalRevenueMinor * 0.10);
    const taxAmountMinor = Math.round(totalRevenueMinor * 0.05);
    const netPayoutMinor = totalRevenueMinor - platformFeeMinor - taxAmountMinor;

    const settlementNumber = "STL-" + Math.random().toString(36).substring(2, 8).toUpperCase() + "-" + Date.now().toString().slice(-4);

    return await db.transaction(async (tx) => {
      const [insertedSettlement] = await tx
        .insert(settlements)
        .values({
          venueId,
          settlementNumber,
          periodStart,
          periodEnd,
          totalTicketRevenueMinor: totalRevenueMinor,
          platformFeeMinor,
          taxAmountMinor,
          netPayoutMinor,
          status: "PAID",
          paidAt: new Date(),
        })
        .returning();

      // Record double-entry financial ledger records
      await financialLedgerService.recordEntry({
        entryType: "MERCHANT_PAYOUT",
        direction: "CREDIT",
        amountMinor: netPayoutMinor,
        referenceType: "settlement",
        referenceId: insertedSettlement!.id,
        metadata: { venueId, settlementNumber },
      });

      await financialLedgerService.recordEntry({
        entryType: "PLATFORM_FEE",
        direction: "CREDIT",
        amountMinor: platformFeeMinor,
        referenceType: "settlement",
        referenceId: insertedSettlement!.id,
      });

      await financialLedgerService.recordEntry({
        entryType: "TAX",
        direction: "CREDIT",
        amountMinor: taxAmountMinor,
        referenceType: "settlement",
        referenceId: insertedSettlement!.id,
      });

      return {
        settlementId: insertedSettlement!.id,
        settlementNumber: insertedSettlement!.settlementNumber,
        totalTicketRevenueMinor: totalRevenueMinor,
        platformFeeMinor,
        taxAmountMinor,
        netPayoutMinor,
        netPayoutBDT: netPayoutMinor / 100,
        status: "PAID",
      };
    });
  }
}

export const settlementService = new SettlementService();
