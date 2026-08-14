import { buildSchema } from "graphql";
import { authTypeDefs } from "@/modules/auth/graphql/auth.graphql";
import { movieTypeDefs } from "@/modules/movies/graphql/movie.graphql";
import { venueTypeDefs } from "@/modules/venues/graphql/venue.graphql";
import { showTypeDefs } from "@/modules/shows/graphql/show.graphql";
import { eventTypeDefs } from "@/modules/events/graphql/event.graphql";
import { walletTypeDefs } from "@/modules/wallet/graphql/wallet.graphql";
import { offerTypeDefs } from "@/modules/offers/graphql/offer.graphql";
import { bookingTypeDefs } from "@/modules/bookings/graphql/booking.graphql";
import { paymentTypeDefs } from "@/modules/payments/graphql/payment.graphql";
import { ticketTypeDefs } from "@/modules/tickets/graphql/ticket.graphql";
import { refundTypeDefs } from "@/modules/refunds/graphql/refund.graphql";
import { searchTypeDefs } from "@/modules/search/graphql/search.graphql";
import { reviewTypeDefs } from "@/modules/reviews/graphql/review.graphql";
import { couponTypeDefs } from "@/modules/coupons/graphql/coupon.graphql";

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
  movieTypeDefs,
  venueTypeDefs,
  showTypeDefs,
  eventTypeDefs,
  walletTypeDefs,
  offerTypeDefs,
  bookingTypeDefs,
  paymentTypeDefs,
  ticketTypeDefs,
  refundTypeDefs,
  searchTypeDefs,
  reviewTypeDefs,
  couponTypeDefs,
];

export const schema = buildSchema(typeDefs.join("\n"));
