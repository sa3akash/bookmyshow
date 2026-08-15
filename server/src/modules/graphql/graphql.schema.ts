import { buildSchema } from "graphql";
import { authTypeDefs } from "@/modules/auth/graphql/auth.graphql";
import { adminTypeDefs } from "@/modules/admin/graphql/admin.graphql";
import { analyticsTypeDefs } from "@/modules/analytics/graphql/analytics.graphql";
import { auditTypeDefs } from "@/modules/audit/graphql/audit.graphql";
import { movieTypeDefs } from "@/modules/movies/graphql/movie.graphql";
import { venueTypeDefs } from "@/modules/venues/graphql/venue.graphql";
import { showTypeDefs } from "@/modules/shows/graphql/show.graphql";
import { eventTypeDefs } from "@/modules/events/graphql/event.graphql";
import { inventoryTypeDefs } from "@/modules/inventory/graphql/inventory.graphql";
import { walletTypeDefs } from "@/modules/wallet/graphql/wallet.graphql";
import { offerTypeDefs } from "@/modules/offers/graphql/offer.graphql";
import { bookingTypeDefs } from "@/modules/bookings/graphql/booking.graphql";
import { paymentTypeDefs } from "@/modules/payments/graphql/payment.graphql";
import { ticketTypeDefs } from "@/modules/tickets/graphql/ticket.graphql";
import { refundTypeDefs } from "@/modules/refunds/graphql/refund.graphql";
import { searchTypeDefs } from "@/modules/search/graphql/search.graphql";
import { reviewTypeDefs } from "@/modules/reviews/graphql/review.graphql";
import { couponTypeDefs } from "@/modules/coupons/graphql/coupon.graphql";
import { recommendationTypeDefs } from "@/modules/recommendations/graphql/recommendations.graphql";
import { settlementTypeDefs } from "@/modules/settlements/graphql/settlements.graphql";
import { statsTypeDefs } from "@/modules/stats/graphql/stats.graphql";

const baseTypeDefs = `
  type Query {
    _empty: String
  }
  type Mutation {
    _empty: String
  }
`;

export const typeDefs = [
  baseTypeDefs,
  authTypeDefs,
  adminTypeDefs,
  analyticsTypeDefs,
  auditTypeDefs,
  movieTypeDefs,
  venueTypeDefs,
  showTypeDefs,
  eventTypeDefs,
  inventoryTypeDefs,
  walletTypeDefs,
  offerTypeDefs,
  bookingTypeDefs,
  paymentTypeDefs,
  ticketTypeDefs,
  refundTypeDefs,
  searchTypeDefs,
  reviewTypeDefs,
  couponTypeDefs,
  recommendationTypeDefs,
  settlementTypeDefs,
  statsTypeDefs,
];

export const schema = buildSchema(typeDefs.join("\n"));
