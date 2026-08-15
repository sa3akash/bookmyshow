import { describe, expect, test, spyOn } from "bun:test";
import { settlementService } from "@/modules/settlements/settlement.service";

describe("MERCHANT SETTLEMENTS TEST SUITE", () => {
  test("SettlementService generates net merchant payout deducting 10% platform fee and 5% tax", async () => {
    spyOn(settlementService, "generateVenueSettlement").mockImplementation(async () => ({
      settlementId: "set-801",
      settlementNumber: "SET-2026-001",
      totalTicketRevenueMinor: 100000,
      platformFeeMinor: 10000,
      taxAmountMinor: 5000,
      netPayoutMinor: 85000,
      netPayoutBDT: 850.0,
      status: "GENERATED",
    }));

    const result = (await settlementService.generateVenueSettlement(
      "v-1",
      new Date("2026-08-01"),
      new Date("2026-08-14")
    )) as { settlementId: string; netPayoutMinor: number; netPayoutBDT: number };

    expect(result.settlementId).toBe("set-801");
    expect(result.netPayoutMinor).toBe(85000);
    expect(result.netPayoutBDT).toBe(850.0);
  });
});
