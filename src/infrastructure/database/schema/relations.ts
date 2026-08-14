import { relations } from "drizzle-orm";
import {
  permissions,
  refreshTokens,
  rolePermissions,
  roles,
  userProfiles,
  userRoles,
  users,
} from "./users.table";
import { bookings, bookingSeats } from "./bookings.table";
import { payments } from "./payments.table";
import { reviews, settlements } from "./infra.table";
import { tickets } from "./tickets.table";
import { wallets, walletTransactions } from "./wallet.table";
import { refunds } from "./refunds.table";
import { cities, seats, venues, venueScreens } from "./venues.table";
import { eventPerformers, events, eventSlots } from "./events.table";
import { seatLocks, shows } from "./shows.table";
import { movieCast, movieCrew, movieMedia, movies } from "./movies.table";

// ==========================================
// 1. RBAC & USER RELATIONS
// ==========================================

export const usersRelations = relations(users, ({ one, many }) => ({
  profile: one(userProfiles, {
    fields: [users.id],
    references: [userProfiles.userId],
  }),
  userRoles: many(userRoles),
  refreshTokens: many(refreshTokens),
  bookings: many(bookings),
  payments: many(payments),
  tickets: many(tickets),
  reviews: many(reviews),
  wallet: one(wallets, { fields: [users.id], references: [wallets.userId] }),
  walletTransactions: many(walletTransactions),
  refunds: many(refunds),
}));

export const userProfilesRelations = relations(userProfiles, ({ one }) => ({
  user: one(users, { fields: [userProfiles.userId], references: [users.id] }),
}));

export const rolesRelations = relations(roles, ({ many }) => ({
  userRoles: many(userRoles),
  rolePermissions: many(rolePermissions),
}));

export const permissionsRelations = relations(permissions, ({ many }) => ({
  rolePermissions: many(rolePermissions),
}));

export const rolePermissionsRelations = relations(
  rolePermissions,
  ({ one }) => ({
    role: one(roles, {
      fields: [rolePermissions.roleId],
      references: [roles.id],
    }),
    permission: one(permissions, {
      fields: [rolePermissions.permissionId],
      references: [permissions.id],
    }),
  }),
);

export const userRolesRelations = relations(userRoles, ({ one }) => ({
  user: one(users, { fields: [userRoles.userId], references: [users.id] }),
  role: one(roles, { fields: [userRoles.roleId], references: [roles.id] }),
}));

export const refreshTokensRelations = relations(refreshTokens, ({ one }) => ({
  user: one(users, { fields: [refreshTokens.userId], references: [users.id] }),
}));

// ==========================================
// 2. CITIES, VENUES & SEATS RELATIONS
// ==========================================

export const citiesRelations = relations(cities, ({ many }) => ({
  venues: many(venues),
  events: many(events),
}));

export const venuesRelations = relations(venues, ({ one, many }) => ({
  city: one(cities, { fields: [venues.cityId], references: [cities.id] }),
  screens: many(venueScreens),
  settlements: many(settlements),
}));

export const venueScreensRelations = relations(
  venueScreens,
  ({ one, many }) => ({
    venue: one(venues, {
      fields: [venueScreens.venueId],
      references: [venues.id],
    }),
    seats: many(seats),
    shows: many(shows),
  }),
);

export const seatsRelations = relations(seats, ({ one, many }) => ({
  screen: one(venueScreens, {
    fields: [seats.screenId],
    references: [venueScreens.id],
  }),
  seatLocks: many(seatLocks),
  bookingSeats: many(bookingSeats),
}));

// ==========================================
// 3. MOVIES, CAST, CREW & MEDIA RELATIONS
// ==========================================

export const moviesRelations = relations(movies, ({ many }) => ({
  cast: many(movieCast),
  crew: many(movieCrew),
  media: many(movieMedia),
  shows: many(shows),
  reviews: many(reviews),
}));

export const movieCastRelations = relations(movieCast, ({ one }) => ({
  movie: one(movies, { fields: [movieCast.movieId], references: [movies.id] }),
}));

export const movieCrewRelations = relations(movieCrew, ({ one }) => ({
  movie: one(movies, { fields: [movieCrew.movieId], references: [movies.id] }),
}));

export const movieMediaRelations = relations(movieMedia, ({ one }) => ({
  movie: one(movies, { fields: [movieMedia.movieId], references: [movies.id] }),
}));

// ==========================================
// 4. SHOWS & INVENTORY SEAT LOCKS RELATIONS
// ==========================================

export const showsRelations = relations(shows, ({ one, many }) => ({
  movie: one(movies, { fields: [shows.movieId], references: [movies.id] }),
  screen: one(venueScreens, {
    fields: [shows.screenId],
    references: [venueScreens.id],
  }),
  seatLocks: many(seatLocks),
  bookings: many(bookings),
  tickets: many(tickets),
}));

export const seatLocksRelations = relations(seatLocks, ({ one }) => ({
  show: one(shows, { fields: [seatLocks.showId], references: [shows.id] }),
  seat: one(seats, { fields: [seatLocks.seatId], references: [seats.id] }),
  user: one(users, { fields: [seatLocks.userId], references: [users.id] }),
}));

// ==========================================
// 5. BOOKINGS, PAYMENTS & TICKETS RELATIONS
// ==========================================

export const bookingsRelations = relations(bookings, ({ one, many }) => ({
  user: one(users, { fields: [bookings.userId], references: [users.id] }),
  show: one(shows, { fields: [bookings.showId], references: [shows.id] }),
  bookingSeats: many(bookingSeats),
  payments: many(payments),
  tickets: many(tickets),
  refunds: many(refunds),
}));

export const bookingSeatsRelations = relations(bookingSeats, ({ one }) => ({
  booking: one(bookings, {
    fields: [bookingSeats.bookingId],
    references: [bookings.id],
  }),
  seat: one(seats, { fields: [bookingSeats.seatId], references: [seats.id] }),
}));

export const paymentsRelations = relations(payments, ({ one, many }) => ({
  booking: one(bookings, {
    fields: [payments.bookingId],
    references: [bookings.id],
  }),
  user: one(users, { fields: [payments.userId], references: [users.id] }),
  refunds: many(refunds),
}));

export const ticketsRelations = relations(tickets, ({ one }) => ({
  booking: one(bookings, {
    fields: [tickets.bookingId],
    references: [bookings.id],
  }),
  user: one(users, { fields: [tickets.userId], references: [users.id] }),
  show: one(shows, { fields: [tickets.showId], references: [shows.id] }),
}));

// ==========================================
// 6. WALLET, REFUNDS & SETTLEMENTS RELATIONS
// ==========================================

export const walletsRelations = relations(wallets, ({ one }) => ({
  user: one(users, { fields: [wallets.userId], references: [users.id] }),
}));

export const walletTransactionsRelations = relations(
  walletTransactions,
  ({ one }) => ({
    user: one(users, {
      fields: [walletTransactions.userId],
      references: [users.id],
    }),
  }),
);

export const refundsRelations = relations(refunds, ({ one }) => ({
  booking: one(bookings, {
    fields: [refunds.bookingId],
    references: [bookings.id],
  }),
  payment: one(payments, {
    fields: [refunds.paymentId],
    references: [payments.id],
  }),
  user: one(users, { fields: [refunds.userId], references: [users.id] }),
}));

export const settlementsRelations = relations(settlements, ({ one }) => ({
  venue: one(venues, {
    fields: [settlements.venueId],
    references: [venues.id],
  }),
}));

export const reviewsRelations = relations(reviews, ({ one }) => ({
  movie: one(movies, { fields: [reviews.movieId], references: [movies.id] }),
  user: one(users, { fields: [reviews.userId], references: [users.id] }),
}));

// ==========================================
// 7. EVENTS, CONCERTS & SPORTS RELATIONS
// ==========================================

export const eventsRelations = relations(events, ({ one, many }) => ({
  city: one(cities, { fields: [events.cityId], references: [cities.id] }),
  performers: many(eventPerformers),
  slots: many(eventSlots),
}));

export const eventPerformersRelations = relations(
  eventPerformers,
  ({ one }) => ({
    event: one(events, {
      fields: [eventPerformers.eventId],
      references: [events.id],
    }),
  }),
);

export const eventSlotsRelations = relations(eventSlots, ({ one }) => ({
  event: one(events, { fields: [eventSlots.eventId], references: [events.id] }),
}));
