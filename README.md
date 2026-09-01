# TransitPH

TransitPH is a mobile-first commuter app prototype for CALABARZON, Philippines. It helps riders find jeepney routes, compare fares and walking distances, explore terminals, check demo weather, and save regular trips.

## Technology stack

- React + Vite + Tailwind CSS
- Node.js + Express 5 API server
- PostgreSQL with Drizzle ORM
- OpenAPI 3.1 with generated React Query hooks and Zod schemas
- Cookie-based sessions with Node `scrypt` password hashing

## Run the application

The Replit workflows start both services automatically:

```bash
pnpm --filter @workspace/api-server run dev
pnpm --filter @workspace/transitph run dev
```

For a full check:

```bash
pnpm run typecheck
pnpm --filter @workspace/transitph run build
```

## Database setup

The app uses the provisioned PostgreSQL database. Apply the Drizzle schema with:

```bash
pnpm --filter @workspace/db run push
```

The API seeds 15 CALABARZON terminals and 30 sample jeepney routes on first startup. Records are clearly presented as demo data and should be verified before production use.

## Demo accounts

These development accounts are seeded automatically:

- Admin: `admin@transitph.test` / `Admin123!`
- User: `user@transitph.test` / `User123!`

The normal user receives five route searches per 12-hour window. Admin searches are unlimited. Payment processing and premium upgrades are intentionally non-functional in this prototype.

## API endpoints

- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/logout`
- `GET /api/auth/me`
- `GET|POST /api/terminals`
- `GET|PUT|DELETE /api/terminals/:id`
- `GET|POST /api/routes`
- `GET|PUT|DELETE /api/routes/:id`
- `GET /api/search?from=&to=`
- `GET|POST /api/saved-routes`
- `DELETE /api/saved-routes/:id`
- `GET /api/weather?location=`

Admin mutations require the signed-in admin session.

## Implemented features

- Login, registration, password confirmation, logout, duplicate email checks, and role-aware sessions
- Home dashboard with route finder, nearby terminals, network status, and weather snapshot
- Route finder with relevance-ranked results, fare, time, walking distance, transfers, and plain-language instructions
- Terminal tracker with CALABARZON terminal list, coordinates, and map-style marker surfaces
- Terminal and route details pages
- Admin-only terminal and route create, edit, and delete operations
- Saved route create, list, and delete flows per user
- Search limit enforcement with a visible user-facing error
- Location weather lookup using a realistic mock weather service
- Responsive bottom navigation and desktop navigation

## Future work

- Verified government and operator-supplied route data
- Live maps, GPS positioning, walking directions, and traffic-aware routing
- Live weather provider integration
- Premium billing and unlimited search subscriptions
- Persistent session storage and production-grade identity provider integration
- Notifications, safety reporting, and real-time commuter updates