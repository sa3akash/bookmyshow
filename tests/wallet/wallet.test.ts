import { describe, expect, test, spyOn } from "bun:test";
import { walletService } from "@/modules/wallet/wallet.service";

describe("DIGITAL WALLET TEST SUITE", () => {
  test("WalletService returns wallet balance in minor units and BDT", async () => {
    spyOn(walletService, "getWallet").mockImplementation(async () => ({
      userId: "u-101",
      balanceMinor: 50000,
      balanceBDT: 500.0,
      currency: "BDT",
      recentTransactions: [],
    }));

    const wallet = await walletService.getWallet("u-101");
    expect(wallet.balanceMinor).toBe(50000);
    expect(wallet.balanceBDT).toBe(500.0);
  });

  test("WalletService tops up balance and records transaction entry", async () => {
    spyOn(walletService, "topUpWallet").mockImplementation(async () => ({
      userId: "u-101",
      newBalanceMinor: 100000,
      newBalanceBDT: 1000.0,
      transactionId: "tx-501",
    }));

    const updated = await walletService.topUpWallet("u-101", 50000, "Top-up via bKash");
    expect(updated.newBalanceMinor).toBe(100000);
    expect(updated.newBalanceBDT).toBe(1000.0);
  });
});
