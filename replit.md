# TransitPH

TransitPH helps commuters navigate jeepney terminals and routes across CALABARZON with practical trip details, weather context, and saved journeys.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 5000)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- Required env: `DATABASE_URL` — provisioned Postgres connection string

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- API: Express 5
- DB: PostgreSQL + Drizzle ORM
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec)
- Build: esbuild (CJS bundle)

## Where things live

- `artifacts/transitph/src/pages/transit-pages.tsx` — user-facing pages and flows
- `artifacts/transitph/src/components/transit-ui.tsx` — app shell and reusable transit UI
- `artifacts/transitph/src/index.css` — visual tokens and app styling
- `artifacts/api-server/src/routes/` — auth, transit, search, saved-route, and weather endpoints
- `artifacts/api-server/src/lib/seed.ts` — development demo data
- `lib/api-spec/openapi.yaml` — source of truth for API contracts
- `lib/db/src/schema/` — Drizzle database tables

## Architecture decisions

- The frontend uses generated OpenAPI hooks so endpoint contracts stay synchronized with the API.
- The app uses the provisioned Postgres database rather than a browser-only store so saved routes and admin CRUD persist.
- Demo weather is implemented behind a service-shaped endpoint so a real weather provider can be substituted later.
- Route search is deliberately relevance-ranked and transparent rather than pretending to be a live routing engine.

## Product

The prototype supports account access, route search, terminal discovery and details, route details, weather lookup, saved routes, a five-search free limit, and admin-only terminal/route CRUD. Demo records cover Laguna, Cavite, Batangas, Rizal, and Quezon.

## User preferences

No additional user preferences recorded.

## Gotchas

- Run `pnpm --filter @workspace/api-spec run codegen` after changing the OpenAPI spec.
- Run `pnpm exec tsc --build --force` after schema changes when generated workspace declarations appear stale.
- The API service owns `/api`; the web app is served at `/`.

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
