# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

### Server (run from `server/`)
```
npm run dev          # Start dev server with tsx watch
npm run build        # TypeScript compile
npm test             # Run all tests (vitest)
npm run test:watch   # Run tests in watch mode
npm run db:push      # Push Prisma schema to SQLite
npm run db:generate  # Regenerate Prisma client
```

To run a single test file: `npx vitest run tests/levels.test.ts`

### Client (run from `client/`)
```
npm run dev          # Vite dev server (proxies /api to localhost:3000)
npm run build        # TypeScript check + Vite production build
```

### Docker
```
docker-compose up --build   # Build and run everything
```

## Architecture

Single Docker container: Express serves the API at `/api/*` and the compiled React SPA as static files. SQLite database persists via Docker volume.

### Server (`server/src/`)
- **`app.ts`** — Express app setup (middleware, routes, static serving). Separated from `index.ts` so tests can import the app without starting the server.
- **`index.ts`** — Imports app and calls `listen()`. Only used in production.
- **`prisma.ts`** — Singleton PrismaClient. All modules import prisma from here.
- **`middleware/auth.ts`** — JWT signing (`signToken`) and verification (`requireAuth` middleware). Attaches `req.user` with `{userId, username}`.
- **`services/passkey.ts`** — WebAuthn registration/login using `@simplewebauthn/server`. Challenges stored in-memory (Map).
- **`routes/`** — Auth (passkey flows + `/me`), Levels (CRUD + publish + complete), Users (dashboard levels + public profile).

### Client (`client/src/`)
- **`context/AuthContext.tsx`** — Manages JWT in localStorage and user state. On mount, validates token via `GET /api/auth/me`.
- **`services/api.ts`** — `apiFetch()` wrapper that injects JWT Authorization header on all requests.
- **`services/auth.ts`** — Passkey registration/login flows using `@simplewebauthn/browser`.
- **Pages:** Home (published level grid), Dashboard (user's levels), Login (passkey auth), About/Terms (stubs), LevelEditor/LevelPlayer (TODO placeholders with 700x500 canvas).

### Key Business Rules
- Levels go through: Draft → Published → Locked (once any user completes it).
- A locked level (published + has completions) cannot be edited or deleted.
- One completion per user per level (DB unique constraint).

### Tailwind Theme
Custom semantic colors defined in `client/src/index.css` using `@theme`: `primary` (indigo), `secondary` (amber), `surface` (slate), `danger` (red). Use these instead of raw Tailwind colors.

## Testing

Tests use Vitest + Supertest with an isolated SQLite test database (`test.db`). Test files run sequentially (shared DB). `tests/setup.ts` handles DB creation and cleanup between tests. `tests/helpers.ts` provides `createTestUser()` and `createTestLevel()` factories.

## Environment

Required env vars (see `.env.example`): `JWT_SECRET`, `RP_ID`, `RP_NAME`, `RP_ORIGIN`, `DATABASE_URL`, `PORT`. Server defaults work for local development against `localhost:3000`.
