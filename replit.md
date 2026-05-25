# HOLA! Life Buddy

A mental wellness platform with a User Mobile App and a shared Express backend. Users track their mood daily, log emotions, view weekly trends, and receive daily affirmations.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 8080)
- `pnpm --filter @workspace/mobile-user run dev` — run the mobile app (Expo)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- Required env: `SESSION_SECRET` — used as JWT signing secret

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- API: Express 5 + JWT (jsonwebtoken)
- DB: In-memory store (mock data for Phase 1) — PostgreSQL + Drizzle ORM ready for Phase 2
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec)
- Mobile: Expo + React Native + Expo Router
- Build: esbuild (CJS bundle)

## Where things live

- API spec: `lib/api-spec/openapi.yaml`
- Generated hooks: `lib/api-client-react/src/generated/`
- Backend routes: `artifacts/api-server/src/routes/` (auth, mood, user)
- Auth middleware: `artifacts/api-server/src/middleware/auth.ts`
- In-memory store (mock): `artifacts/api-server/src/store.ts`
- Mobile screens: `artifacts/mobile-user/app/`
- Mobile colors: `artifacts/mobile-user/constants/colors.ts`
- Auth context: `artifacts/mobile-user/context/AuthContext.tsx`

## Architecture decisions

- OpenAPI-first: all API contracts defined in `lib/api-spec/openapi.yaml`, hooks generated via Orval
- JWT auth: tokens signed with `SESSION_SECRET`, 30-day expiry
- In-memory store for Phase 1 — trivially swappable with Drizzle/PostgreSQL in Phase 2
- Auth state persisted via AsyncStorage; token injected via `setAuthTokenGetter` from api-client-react
- Seed user: email `alex@example.com`, password `password123` with 6 days of mock mood data

## Product (Phase 1)

- **Onboarding**: 3-slide carousel with illustrations → Register or Log in
- **Home**: Greeting, 5-emoji quick mood check-in, daily affirmation card (black card), quick-access grid (Journal, Breathe, Chat, Meditate)
- **Mood Tracker**: 1–10 scale with emoji + label, 15 emotion tags (multi-select), optional note, weekly bar chart, recent mood history list
- **Mindfulness**: Placeholder (Phase 2)
- **Profile**: User info, settings list, sign out

## API Endpoints (Phase 1)

- `POST /api/v1/auth/register` — create account, returns JWT + user
- `POST /api/v1/auth/login` — sign in, returns JWT + user
- `GET /api/v1/users/me` — current user profile (auth required)
- `GET /api/v1/affirmation` — today's daily affirmation (auth required)
- `GET /api/v1/mood` — mood entries list (auth required)
- `POST /api/v1/mood` — log a mood entry (auth required)
- `GET /api/v1/mood/today` — today's mood entry (auth required)

## User preferences

- Phase 1 only: backend + mobile user app (Onboarding, Home, Mood Tracker)
- Mock data for now
- Design: minimalist — Threads/Quabble inspired, HOLA! brand colors
- Colors: black/white primary, #3DD68C calm green accent, #FF6B6B alert red

## Gotchas

- Always run codegen after changing `lib/api-spec/openapi.yaml`: `pnpm --filter @workspace/api-spec run codegen`
- In-memory store resets on server restart (Phase 1 mock behavior)
- Seed user `alex@example.com` / `password123` has mock mood history pre-loaded

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
