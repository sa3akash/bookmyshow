import { authResolvers } from "@/modules/auth/graphql/auth.graphql";
import { adminResolvers } from "@/modules/admin/graphql/admin.graphql";
import { analyticsResolvers } from "@/modules/analytics/graphql/analytics.graphql";
import { auditResolvers } from "@/modules/audit/graphql/audit.graphql";
import { movieResolvers } from "@/modules/movies/graphql/movie.graphql";
import { venueResolvers } from "@/modules/venues/graphql/venue.graphql";
import { showResolvers } from "@/modules/shows/graphql/show.graphql";
import { eventResolvers } from "@/modules/events/graphql/event.graphql";
import { inventoryResolvers } from "@/modules/inventory/graphql/inventory.graphql";
import { walletResolvers } from "@/modules/wallet/graphql/wallet.graphql";
import { offerResolvers } from "@/modules/offers/graphql/offer.graphql";
import { bookingResolvers } from "@/modules/bookings/graphql/booking.graphql";
import { paymentResolvers } from "@/modules/payments/graphql/payment.graphql";
import { ticketResolvers } from "@/modules/tickets/graphql/ticket.graphql";
import { refundResolvers } from "@/modules/refunds/graphql/refund.graphql";
import { searchResolvers } from "@/modules/search/graphql/search.graphql";
import { reviewResolvers } from "@/modules/reviews/graphql/review.graphql";
import { couponResolvers } from "@/modules/coupons/graphql/coupon.graphql";
import { recommendationResolvers } from "@/modules/recommendations/graphql/recommendations.graphql";
import { settlementResolvers } from "@/modules/settlements/graphql/settlements.graphql";
import { statsResolvers } from "@/modules/stats/graphql/stats.graphql";

export const rootResolvers = {
  Query: {
    ...authResolvers.Query,
    ...adminResolvers.Query,
    ...analyticsResolvers.Query,
    ...auditResolvers.Query,
    ...movieResolvers.Query,
    ...venueResolvers.Query,
    ...showResolvers.Query,
    ...eventResolvers.Query,
    ...inventoryResolvers.Query,
    ...walletResolvers.Query,
    ...offerResolvers.Query,
    ...ticketResolvers.Query,
    ...refundResolvers.Query,
    ...searchResolvers.Query,
    ...reviewResolvers.Query,
    ...couponResolvers.Query,
    ...recommendationResolvers.Query,
    ...settlementResolvers.Query,
    ...statsResolvers.Query,
  },
  Mutation: {
    ...authResolvers.Mutation,
    ...movieResolvers.Mutation,
    ...venueResolvers.Mutation,
    ...walletResolvers.Mutation,
    ...bookingResolvers.Mutation,
    ...paymentResolvers.Mutation,
    ...ticketResolvers.Mutation,
    ...refundResolvers.Mutation,
    ...reviewResolvers.Mutation,
    ...couponResolvers.Mutation,
  },
};
