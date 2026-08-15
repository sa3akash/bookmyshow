import { db } from "@/infrastructure/database/client";
import { users, movies, venues, bookings } from "@/infrastructure/database/schema";
import { eq, sum, count } from "drizzle-orm";
import { seatHoldReconcilerService } from "@/modules/inventory/seat-hold-reconciler.service";

export class AdminService {
  async getDashboardMetrics() {
    const totalUsersCount = await db.select({ val: count() }).from(users);
    const totalMoviesCount = await db.select({ val: count() }).from(movies);
    const totalVenuesCount = await db.select({ val: count() }).from(venues);
    const totalBookingsCount = await db.select({ val: count() }).from(bookings);

    const revenueResult = await db
      .select({ total: sum(bookings.finalAmountMinor) })
      .from(bookings)
      .where(eq(bookings.status, "TICKET_ISSUED"));

    const totalRevenueMinor = revenueResult[0]?.total ? Number(revenueResult[0].total) : 0;

    return {
      totalUsers: Number(totalUsersCount[0]?.val || 0),
      totalMovies: Number(totalMoviesCount[0]?.val || 0),
      totalVenues: Number(totalVenuesCount[0]?.val || 0),
      totalBookings: Number(totalBookingsCount[0]?.val || 0),
      totalRevenueMinor,
      totalRevenueBDT: totalRevenueMinor / 100,
    };
  }

  /**
   * Reconciliation Job: Finds expired seat locks and releases dangling seats safely in DB & Redis
   */
  async reconcileExpiredSeatHolds() {
    const res = await seatHoldReconcilerService.runReconciliation();
    return {
      reconciledCount: res.reconciledHoldsCount,
      expiredBookingsCount: res.expiredBookingsCount,
      releasedSeatsCount: res.releasedSeatsCount,
    };
  }
}

export const adminService = new AdminService();
