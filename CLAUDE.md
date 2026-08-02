# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

An internal, admin-only "link-in-bio" + QR-code generator (a mylink.asia-style
tool, built independently — no code/API ties to that site). A single admin
creates a page per client business (name, description, logo, links), which
gets a public page at `/<slug>` and a customizable downloadable QR code.
There is no public sign-up; client businesses never log in.

Full spec: [docs/specs/birjoyda-spec.md](docs/specs/birjoyda-spec.md). Original
intent: [docs/intent/birjoyda.md](docs/intent/birjoyda.md). Implementation status
is tracked in [tasks/plan.md](tasks/plan.md) and [tasks/todo.md](tasks/todo.md).

## Commands

```bash
npm run dev              # start dev server (Turbopack)
npm run build            # production build
npm run typecheck        # tsc --noEmit
npm run lint              # eslint
npm test                 # vitest run (all unit tests)
npx vitest run tests/unit/slug.test.ts   # single test file
npx vitest run -t "rejects a reserved word"  # single test by name

npm run db:generate      # generate a Drizzle migration from src/lib/db/schema.ts
npm run db:migrate       # apply pending migrations (uses DATABASE_URL_UNPOOLED)
```

Before considering any change done: `npm run typecheck && npm run lint && npm test && npm run build`, plus a manual browser check of the affected flow (tests only cover pure business logic — see Testing below).

## Architecture

**Stack**: Next.js 16 (App Router, Turbopack, `src/` dir) + TypeScript strict, Neon Postgres via Drizzle ORM, Vercel Blob for logos, Tailwind v4 + shadcn/ui (Base UI flavor, not Radix), Vitest.

**No managed auth, no RLS.** There is exactly one admin account (email + bcrypt hash in env vars, no DB table). All database access happens server-side only (Server Actions / Server Components) — no DB credentials are ever shipped to the client, so there's no Supabase-style RLS layer to maintain. Access control is just "does this request have a valid admin session," and it must be checked explicitly:
- Every mutating Server Action starts with `await requireAdminSession()` (`src/lib/auth/require-admin.ts`).
- `src/proxy.ts` (Next.js 16 renamed `middleware.ts` → `proxy.ts`; the exported function is `proxy`, not `middleware`) protects page routes via its `matcher` — currently `/dashboard/:path*` and `/businesses/:path*`. Anything not matched (e.g. `/[slug]`) is public by design.
- Session = a `jose`-signed JWT in an httpOnly cookie (`src/lib/auth/session.ts`, edge-safe — no `next/headers` import there). `src/lib/auth/require-admin.ts` wraps it with `next/headers` for use in Server Actions/Components; keep that split (edge-safe token logic vs. Node-only cookie access) rather than merging the files.

**Public vs. admin routing.** `src/app/[slug]/page.tsx` is a catch-all that renders a business's public page. Because Next.js resolves static segments (`/login`, `/dashboard`, `/businesses/*`) before the `[slug]` dynamic segment, real app routes always win — but words that aren't real routes yet (e.g. `api`, `_next`) could still collide with a business slug. `src/lib/slug.ts` maintains `RESERVED_SLUGS` and is checked both when creating/renaming a business and defensively inside `[slug]/page.tsx`. Add any new top-level route's segment to `RESERVED_SLUGS` when you create one.

**Data model** (`src/lib/db/schema.ts`): `businesses` (slug unique, name, description, logoUrl) and `links` (businessId FK with `onDelete: cascade`, `type` enum `phone|telegram|instagram|maps|custom`, label, value, position). `src/lib/slug.ts` holds pure slug logic (safe to import from client components); DB-touching queries live in `src/lib/actions/*.ts` instead of being bundled into that file, precisely so client components can import slug helpers without pulling in `src/lib/db/client.ts` (which throws if `DATABASE_URL` is unset — that env var is stripped from client bundles, so importing it client-side is a hard crash, not just a lint smell).

**ID lookups must validate format first.** Postgres throws on `invalid input syntax for type uuid` for a malformed ID, which surfaces as an unhandled 500 rather than a 404 if you query straight from a route param. Use `isValidId()` (`src/lib/id.ts`) before any `eq(table.id, someParam)` query that originates from a URL/form param.

**QR generation** (`src/lib/qr.ts`, wraps `qrcode`): `generateQrPng`/`generateQrSvg` take a URL + `{foregroundColor, backgroundColor, size}`. The customizer (`src/components/admin/QrCustomizer.tsx`) calls Server Actions (`src/lib/actions/qr.ts`) on every param change, debounced; the effect uses a cleanup-scoped `stale` flag to discard out-of-order responses — don't remove that guard, rapid slider/color changes will otherwise race. The public URL for QR/links is derived per-request from the `host` header (`src/lib/origin.ts`), not an env var, so it's correct in dev, preview, and production without configuration.

**Logos**: uploaded via `@vercel/blob`'s `put(..., { access: "public" })` inside the same Server Action that creates/updates a business (`src/lib/actions/businesses.ts`), not a separate upload endpoint.

**Business edit is one form, not per-link Server Actions.** `/businesses/[id]/edit` (`src/components/admin/BusinessEditForm.tsx`) holds business fields *and* the links list in one client-side draft state, submitted through a single `<form>` / single `updateBusinessWithLinks` action (`src/lib/actions/businesses.ts`) — nothing touches the DB until "Saqlash" is clicked. Links are serialized into a hidden `linksJson` field (JSON array, recomputed every render so `position` is always just the array index, never tracked separately) instead of each link having its own action/round-trip. The action diffs the submitted array against the DB's current link ids via `computeLinksDiff()` (`src/lib/links-diff.ts`, pure and unit-tested) to derive inserts/updates/deletes, then writes all of them in one `db.batch([...])` call. `BusinessForm.tsx` (used only by `/businesses/new`, which has no links yet — the business doesn't exist until it's created) and `BusinessEditForm.tsx` are intentionally separate, non-nesting components with some duplicated field JSX, not one wrapping the other — `BusinessForm` owns its own `<form>`/`useActionState`, and a `<form>` can't nest inside a `<form>`.

**`drizzle-orm/neon-http` has no `.transaction()`** — it throws `"No transactions support in neon-http driver"` at runtime. Use `db.batch([...])` instead (see `updateBusinessWithLinks`): it runs independent, pre-built query objects atomically via Neon's HTTP batch endpoint, but unlike a real interactive transaction, no statement can read another's runtime result (e.g. insert-then-use-the-generated-id-later doesn't work). Fine as long as every row's id is already known before the batch is built.

**Drag-and-drop reordering** (`src/components/admin/LinkRow.tsx`, `@dnd-kit/core` + `@dnd-kit/sortable`) needs an explicit `id` prop on `<DndContext>` — without it, dnd-kit's auto-generated `aria-describedby` id differs between server-render and client hydration and Next throws a hydration-mismatch error. Also: `lucide-react` v1.x dropped brand/social icons (no `Instagram` export) — `src/lib/link-type-meta.ts` uses `Camera` as a stand-in for the Instagram link type.

## Environment variables

Local dev uses `.env.local` (gitignored; `.env.example` documents the keys and *is* committed). Two gotchas:

1. **Next.js's local env loader runs `dotenv-expand`, which treats `$` as variable interpolation.** A raw bcrypt hash like `$2b$12$abc...` gets silently mangled in `.env.local` — it must be stored there with escaped dollars (`\$2b\$12\$abc...`). Vercel's own env var storage does **not** go through dotenv-expand, so the value set via `vercel env add` / the dashboard must be the *unescaped* raw hash. Getting this backwards breaks login in exactly one of the two environments with no obvious error.
2. `vitest.config.mts` loads `.env.local` itself via `process.loadEnvFile()` (plain Node parsing, no expansion) and aliases `@` to `./src` — tests import via `@/lib/...` same as app code.

Required vars: `DATABASE_URL` / `DATABASE_URL_UNPOOLED` (Neon; pooled for runtime, unpooled for migrations), `BLOB_READ_WRITE_TOKEN`, `ADMIN_EMAIL`, `ADMIN_PASSWORD_HASH`, `SESSION_SECRET`.

## Testing

Per project convention, tests cover business logic, not UI/components: `tests/unit/slug.test.ts`, `validation.test.ts`, `qr.test.ts`, `links-diff.test.ts`. Core admin/public flows (create business → add links → view public page → generate QR) are verified manually in a real browser, not via a component test suite — do that before marking a UI-touching task done.

## Deployment

Vercel project `birjoyda` (team `pfn0777s-projects`), Neon Postgres + Blob store connected via Vercel's Marketplace integrations. Two things that bit us once and could again:

- If a Vercel project is created (`vercel project add`) before any source code exists, its Framework Preset can get stuck on "Other," which builds fine but makes every route 404 at the edge post-deploy (routing/function wiring never gets applied). Fix: `vercel project update <name> --framework nextjs`, then redeploy.
- Vercel's "Deployment Protection" (SSO/Vercel Authentication), if enabled, blocks unauthenticated access to *all* non-custom-domain URLs — including the `/[slug]` public pages that must be publicly reachable. It must stay disabled (or scoped to exclude the routes that need to be public) for this app to work as intended.
- Renaming a Vercel project (Settings → General → Project Name) does **not** move its `*.vercel.app` domain — that has to be added separately under Settings → Domains. Vercel does automatically set up a redirect from the old default domain to the new one once the new one is added, so old links/QR codes keep working.

Live at https://birjoyda.vercel.app (the old https://mylink-clone.vercel.app now redirects here; no custom domain chosen yet).

@AGENTS.md
