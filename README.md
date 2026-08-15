# Production Architecture Reference: BookMyShow-Level Backend Engine

This document provides the complete production architecture reference, database ERD, sequence diagrams, seat locking algorithm, event catalog, security model, scaling strategy, and production checklist for the **BookMyShow Entertainment Ticket-Booking Backend Engine**.

---

## 0. Core Engineering Rules & Priorities

### 0.1 Priorities Hierarchy (Rule 109)
When designing, building, or modifying any component in the system, engineering decisions must prioritize correctness in this exact order:

1. **Data Integrity**
2. **Security**
3. **Booking Correctness**
4. **Payment Correctness**
5. **Fault Tolerance**
6. **Observability**
7. **Scalability**
8. **Performance**
9. **Developer Experience**

> **Rule**: Never sacrifice booking or payment correctness simply to achieve lower latency.

### 0.2 Implementation Order (Rule 108)

The system module architecture is structured and constructed according to the following 10-phase sequence:

- **Phase 1**: Project Bootstrap, Configuration, Logging, Errors, Database, Redis, Health Checks
- **Phase 2**: Auth, Users, RBAC, Permissions
- **Phase 3**: Cities, Movies, Venues, Screens, Seats, Shows
- **Phase 4**: Seat Inventory, Seat Locking, Booking Engine, Idempotency
- **Phase 5**: Payments, Webhooks, Refunds
- **Phase 6**: Tickets, QR Verification, Notifications
- **Phase 7**: Coupons, Offers, Campaigns
- **Phase 8**: Search, Recommendations, Reviews
- **Phase 9**: Outbox, Event Bus, Queues, Workers, WebSockets
- **Phase 10**: Analytics, Audit, Admin, Reconciliation

---

## 1. Architecture Overview

The system is built as a **Modular Monolith with strict domain module boundaries**, supporting both **REST API Endpoints** and an **Apollo GraphQL Gateway (`/graphql`)**.

```mermaid
graph TD
    Client[Web / Mobile Application] --> Gateway[ElysiaJS Application Server]
    
    subgraph API Layers
        Gateway --> REST[REST API Router (/api/v1/...)]
        Gateway --> GQL[Apollo GraphQL Gateway (/graphql)]
    end

    subgraph Domain Module Architecture (Modules with REST + GraphQL)
        REST & GQL --> AuthModule[src/modules/auth/]
        REST & GQL --> MoviesModule[src/modules/movies/]
        REST & GQL --> VenuesModule[src/modules/venues/]
        REST & GQL --> ShowsModule[src/modules/shows/]
        REST & GQL --> EventsModule[src/modules/events/]
        REST & GQL --> BookingsModule[src/modules/bookings/]
        REST & GQL --> PaymentsModule[src/modules/payments/]
        REST & GQL --> WalletModule[src/modules/wallet/]
        REST & GQL --> RefundsModule[src/modules/refunds/]
        REST & GQL --> TicketsModule[src/modules/tickets/]
        REST & GQL --> CouponsModule[src/modules/coupons/]
        REST & GQL --> OffersModule[src/modules/offers/]
        REST & GQL --> SearchModule[src/modules/search/]
        REST & GQL --> ReviewsModule[src/modules/reviews/]
        REST & GQL --> StatsModule[src/modules/stats/]
        REST & GQL --> AnalyticsModule[src/modules/analytics/]
    end

    subgraph Infrastructure Layer
        BookingsModule <--> Redis[(Redis Cluster - SET NX EX 300)]
        BookingsModule <--> Postgres[(PostgreSQL 16 - ACID Source of Truth)]
        PaymentsModule --> PaymentFactory[Payment Provider Factory]
        
        PaymentFactory --> bKash[bKash Adapter]
        PaymentFactory --> Stripe[Stripe Adapter]
        PaymentFactory --> Razorpay[Razorpay Adapter]
        PaymentFactory --> SSLCommerz[SSLCommerz Adapter]
        PaymentFactory --> Nagad[Nagad Adapter]
        PaymentFactory --> Wallet[Wallet Adapter]
    end
```

---

## 2. Complete Domain GraphQL Operations Map

Every domain module includes its own `graphql/*.graphql.ts` typeDefs and resolvers:

| Domain Module | Type Definitions Path | Queries / Mutations Exposed |
| :--- | :--- | :--- |
| **Auth** | `src/modules/auth/graphql/auth.graphql.ts` | `me`, `login`, `register` |
| **Movies** | `src/modules/movies/graphql/movie.graphql.ts` | `movies`, `movie`, `popularMovies`, `similarMovies`, `createMovie` |
| **Venues** | `src/modules/venues/graphql/venue.graphql.ts` | `cities`, `venues`, `createCity`, `createVenue` |
| **Shows** | `src/modules/shows/graphql/show.graphql.ts` | `shows`, `seatMap` |
| **Events** | `src/modules/events/graphql/event.graphql.ts` | `events` |
| **Wallet** | `src/modules/wallet/graphql/wallet.graphql.ts` | `wallet`, `topupWallet` |
| **Offers** | `src/modules/offers/graphql/offer.graphql.ts` | `offers` |
| **Bookings** | `src/modules/bookings/graphql/booking.graphql.ts` | `holdSeats` |
| **Payments** | `src/modules/payments/graphql/payment.graphql.ts` | `createPaymentIntent` |
| **Tickets** | `src/modules/tickets/graphql/ticket.graphql.ts` | `ticket`, `issueTicket`, `verifyTicket` |
| **Refunds** | `src/modules/refunds/graphql/refund.graphql.ts` | `refund`, `requestRefund` |
| **Search** | `src/modules/search/graphql/search.graphql.ts` | `search` |
| **Reviews** | `src/modules/reviews/graphql/review.graphql.ts` | `reviews`, `addReview` |
| **Coupons** | `src/modules/coupons/graphql/coupon.graphql.ts` | `coupons`, `applyCoupon` |
| **Stats** | `src/modules/stats/graphql/stats.graphql.ts` | `stats`, `systemStats`, `infraStats`, `businessStats` |

---

## 3. Interactive Documentation

- **Swagger REST Documentation**: `http://localhost:3000/swagger`
- **Apollo GraphQL Sandbox**: `http://localhost:3000/graphql`
