Created seed.ts
Viewed package.json:1-36
Edited package.json
Ran command: `bun run typecheck`
Edited seed.ts
Viewed seed.ts:20-50
Edited seed.ts
Ran command: `bun run typecheck`
Ran command: `bun test`

Added the seed script ([`seed.ts`](file:///c:/Users/SHAKIL/Desktop/code/bookmyshow/src/infrastructure/database/seed.ts)) and registered the `db:seed` script in [`package.json`](file:///c:/Users/SHAKIL/Desktop/code/bookmyshow/package.json).

### Database Seeding Overview

To populate your database with initial production mock data, run:

```bash
bun run db:seed
# or
npm run db:seed
```

#### Seeded Data
1. **RBAC Roles & Permissions**:
   - Roles: `SUPER_ADMIN`, `ADMIN`, `MOVIE_MANAGER`, `VENUE_MANAGER`, `CUSTOMER`.
   - Permissions: `movie:create`, `movie:update`, `show:create`, `booking:read`, `refund:create`, `admin:read`.
2. **Default Admin User**: `admin@bookmyshow.com` (Password: `Admin123!`).
3. **Cities**: Dhaka, Chittagong, Sylhet.
4. **Venues & Screens**: Star Cineplex - Bashundhara City with IMAX 3D Hall & dynamic seat layout (Regular, VIP, Recliners).
5. **Movies**: *Dune: Part Two*.
6. **Shows & Showtimes**: Scheduled IMAX 3D showtime.
7. **Coupons**: `WELCOME50` (15% discount up to BDT 200).