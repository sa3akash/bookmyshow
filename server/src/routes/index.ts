import { Elysia } from "elysia";

// Import Controllers directly from Modules
import { authController } from "@/modules/auth/controller/auth.controller";
import { mfaController } from "@/modules/auth/controller/mfa.controller";
import { webAuthnController } from "@/modules/auth/controller/webauthn.controller";
import { movieController } from "@/modules/movies/controller/movie.controller";
import { venueController } from "@/modules/venues/controller/venue.controller";
import { showController } from "@/modules/shows/controller/show.controller";
import { eventController } from "@/modules/events/event.controller";
import { bookingController } from "@/modules/bookings/controller/booking.controller";
import { paymentController } from "@/modules/payments/controller/payment.controller";
import { walletController } from "@/modules/wallet/wallet.controller";
import { refundController } from "@/modules/refunds/refund.controller";
import { settlementController } from "@/modules/settlements/settlement.controller";
import { ticketController } from "@/modules/tickets/controller/ticket.controller";
import { couponController } from "@/modules/coupons/controller/coupon.controller";
import { offerController } from "@/modules/offers/offer.controller";
import { recommendationController } from "@/modules/recommendations/recommendation.controller";
import { searchController } from "@/modules/search/controller/search.controller";
import { reviewController } from "@/modules/reviews/controller/review.controller";
import { adminController, metricsController } from "@/modules/admin/controller/admin.controller";
import { statsController } from "@/modules/stats/controller/stats.controller";
import { analyticsController, adminStatsController } from "@/modules/analytics/presentation/analytics.controller";
import { seatHoldController } from "@/modules/inventory/controller/seat-hold.controller";
import { realtimeWsController } from "@/websocket/realtime.gateway";
import { graphqlController } from "@/modules/graphql/graphql.controller";

export const apiRoutes = new Elysia()
  .use(metricsController)
  .use(statsController)
  .use(analyticsController)
  .use(adminStatsController)
  .use(authController)
  .use(mfaController)
  .use(webAuthnController)
  .use(movieController)
  .use(venueController)
  .use(showController)
  .use(eventController)
  .use(bookingController)
  .use(seatHoldController)
  .use(paymentController)
  .use(walletController)
  .use(refundController)
  .use(settlementController)
  .use(ticketController)
  .use(couponController)
  .use(offerController)
  .use(recommendationController)
  .use(searchController)
  .use(reviewController)
  .use(adminController)
  .use(graphqlController)
  .use(realtimeWsController);
