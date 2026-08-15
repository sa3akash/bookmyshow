# Engineering Rules & Guidelines

## 109. Priorities Hierarchy

When implementing, refactoring, or optimizing the system, prioritize correctness in this exact order:

1. **Data Integrity**
2. **Security**
3. **Booking Correctness**
4. **Payment Correctness**
5. **Fault Tolerance**
6. **Observability**
7. **Scalability**
8. **Performance**
9. **Developer Experience**

> [!IMPORTANT]
> **Golden Rule**: Never sacrifice booking/payment correctness simply to achieve lower latency or micro-optimizations.

---

## 108. Implementation Order

When building, adding modules, or extending the system, build strictly in this 10-phase order:

### Phase 1: Core Foundation & Infrastructure
- Project bootstrap
- Configuration
- Logging
- Errors & exception handling
- Database (PostgreSQL / Drizzle ORM)
- Redis (Caching & Locking)
- Health checks (`/health`, `/ready`)

### Phase 2: Auth & Identity
- Auth (JWT, MFA, OAuth)
- Users
- RBAC (Roles & Granular Permissions)
- Permissions

### Phase 3: Catalog & Scheduling
- Cities
- Movies
- Venues
- Screens
- Seats (Grid layouts, seat categories)
- Shows (Showtimes & Pricing dynamic tiers)

### Phase 4: Inventory & Booking Engine
- Seat inventory
- Seat locking (Redis SET NX distributed lock with 5-minute expiry)
- Booking engine (ACID Transactions, state machine)
- Idempotency (Idempotency keys, duplicate execution protection)

### Phase 5: Payment Processing & Financials
- Payments (Payment Providers: Stripe, bKash, Razorpay, Nagad, SSLCommerz, Wallet)
- Webhooks (Idempotent webhook signature verification)
- Refunds (Instant wallet refunds, auto-reversals)

### Phase 6: Ticketing & Verification
- Tickets (Ticket generation & PDF export)
- QR verification (HMAC signed QR verification scanner API)
- Notifications (SMS, Email, Push)

### Phase 7: Promotions & Loyalty
- Coupons
- Offers
- Campaigns

### Phase 8: Search, Discovery & Feedback
- Search (Full-text catalog search & OpenSearch engine)
- Recommendations (Trending & genre affinity engine)
- Reviews (Ratings, reviews & stats)

### Phase 9: Messaging, Events & Real-time
- Outbox (Transactional outbox pattern)
- Event bus
- Queues & Workers (Background queue processing)
- WebSockets (Real-time seat state broadcast & live booking tracking)

### Phase 10: Governance, Admin & Observability
- Analytics
- Audit (Compliance audit logs)
- Admin (Platform dashboard, management APIs)
- Reconciliation (Payment & settlement reconciliation engine)
