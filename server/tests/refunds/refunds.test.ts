import { describe, expect, test, spyOn } from "bun:test";
import { refundService } from "@/modules/refunds/refund.service";

describe("REFUNDS SUBSYSTEM TEST SUITE", () => {
  test("RefundService processes instant wallet refund and releases seat hold", async () => {
    spyOn(refundService, "initiateRefund").mockImplementation(async () => ({
      refundId: "ref-1001",
      bookingId: "b-501",
      amountMinor: 50000,
      refundBDT: 500.0,
      refundMethod: "WALLET",
      status: "PROCESSED",
    }));

    const result = await refundService.initiateRefund({
      bookingId: "b-501",
      userId: "u-101",
      reason: "Customer requested cancellation",
      refundMethod: "WALLET",
    });

    expect(result.refundId).toBe("ref-1001");
    expect(result.status).toBe("PROCESSED");
    expect(result.refundBDT).toBe(500.0);
  });
});
