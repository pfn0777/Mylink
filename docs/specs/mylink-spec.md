# Spec: MyLink Clone (admin-only link-in-bio + QR generator)

_Source intent: [docs/intent/mylink.md](../intent/mylink.md)_

_Revision note (2026-08-01): originally speced against Supabase. Pivoted to
Vercel Postgres (Neon) + Vercel Blob + custom admin auth after the user's
only Supabase organization hit its 2-active-project free-tier limit and the
user asked to avoid it entirely rather than pause an existing project._

## Objective

An internal, admin-only web tool for creating "link-in-bio" pages for client
businesses and generating a QR code that points to each page. Modeled on the
UI flow of mylink.asia (observed via screenshots only — no code or API access
to that site).

**User**: a single admin (the tool owner). Client businesses never log in;
the admin creates and edits their page on their behalf and hands them the
public URL / QR code.

**Success looks like**: admin logs in, creates a business record (name,
description, logo, slug), adds links (phone / Telegram / Instagram / Google
Maps / custom URL), gets a working public page at `/<slug>`, generates a
QR code for that URL with adjustable color/size and downloads it as PNG or
SVG, and can see/edit/delete all businesses from a list view.

## Assumptions

1. **Single admin, no multi-tenant roles.** One admin credential (email +
   bcrypt-hashed password in env vars), no roles/permissions system, no
   public sign-up.
2. **Next.js App Router + TypeScript (strict)**, Vercel Postgres (Neon) via
   Drizzle ORM, Vercel Blob for logo storage, deployed on Vercel.
3. **Tailwind CSS + shadcn/ui** for the admin UI — fastest path to the kind
   of clean form/list UI shown in the reference screenshots.
4. **QR codes generated locally** with the `qrcode` npm package (canvas/SVG
   renderer) rather than calling a third-party API (mylink.asia used goQR) —
   avoids an external dependency and rate limits, and keeps color/size
   customization fully in our control.
5. **Public page route is `/[slug]`** at the root (e.g. `mylink-clone.app/dunyouspa`),
   matching the reference. A fixed reserved-word list (`admin`, `login`,
   `api`, `dashboard`, `_next`, etc.) prevents a business slug from colliding
   with an app route.
6. **Mutations via Next.js Server Actions** (not a separate REST API) —
   idiomatic for the current App Router, less boilerplate than hand-rolled
   API routes. All database access happens server-side only; no DB
   credentials or client SDK are ever shipped to the browser.
7. **No analytics, payments, tariffs, or referral system in v1** (explicitly
   out of scope per the confirmed intent doc).
8. **Design**: no fixed visual spec yet — during implementation, a few
   real-world link-in-bio page designs will be pulled for reference before
   building the public page template.

→ Correct any of these now, or I'll proceed with them.

## Tech Stack

- Next.js 14+ (App Router), TypeScript (strict mode)
- Vercel Postgres (Neon) as the database, accessed via Drizzle ORM +
  `@neondatabase/serverless`
- Vercel Blob (`@vercel/blob`) for logo image storage
- Custom single-admin auth: bcrypt-hashed password check + signed session
  cookie via `jose` (edge-compatible, verified in middleware)
- Tailwind CSS + shadcn/ui
- `qrcode` (QR generation), `zod` (input validation)
- Vitest (unit tests), React Testing Library only where a component has real
  logic worth testing
- Deployed on Vercel

## Commands

```
Dev:        npm run dev
Build:      npm run build
Test:       npm test -- --coverage
Lint:       npm run lint --fix
Types:      npm run typecheck      (tsc --noEmit)
DB migrate: npm run db:generate && npm run db:migrate   (drizzle-kit)
```

## Project Structure

```
src/
  app/
    login/page.tsx                 → admin login
    dashboard/page.tsx             → "Mening bizneslarim" list
    businesses/new/page.tsx        → create business form
    businesses/[id]/edit/page.tsx  → edit business + manage links
    businesses/[id]/qr/page.tsx    → QR customizer + download
    [slug]/page.tsx                → public business page (reserved-word guarded)
    layout.tsx
  components/
    admin/            → forms, business list item, link editor rows
    public/            → public page card, link button
    ui/                → shadcn primitives
  lib/
    db/
      schema.ts         → Drizzle table definitions (source of truth for types)
      client.ts         → Neon serverless connection + Drizzle instance
    auth/
      session.ts        → sign/verify session cookie (jose)
      password.ts       → bcrypt hash/compare against env-var credential

    actions/
      businesses.ts     → createBusiness, updateBusiness, deleteBusiness
      links.ts          → addLink, updateLink, deleteLink, reorderLinks
    slug.ts              → slugify + reserved-word + uniqueness validation
    qr.ts                → QR generation (PNG/SVG buffer from URL + options)
    validation.ts        → zod schemas for business/link input
tests/
  unit/
    slug.test.ts
    qr.test.ts
    validation.test.ts
docs/
  intent/
  specs/
drizzle/
  migrations/           → SQL migrations generated by drizzle-kit
drizzle.config.ts
```

## Data Model (Postgres via Drizzle)

```typescript
// src/lib/db/schema.ts
import { pgTable, uuid, text, integer, timestamp, pgEnum } from 'drizzle-orm/pg-core'

export const linkType = pgEnum('link_type', ['phone', 'telegram', 'instagram', 'maps', 'custom'])

export const businesses = pgTable('businesses', {
  id: uuid('id').primaryKey().defaultRandom(),
  slug: text('slug').notNull().unique(),
  name: text('name').notNull(),
  description: text('description'),
  logoUrl: text('logo_url'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
})

export const links = pgTable('links', {
  id: uuid('id').primaryKey().defaultRandom(),
  businessId: uuid('business_id').notNull().references(() => businesses.id, { onDelete: 'cascade' }),
  type: linkType('type').notNull(),
  label: text('label').notNull(),
  value: text('value').notNull(), // phone number / username / url, normalized per type
  position: integer('position').notNull().default(0),
  createdAt: timestamp('created_at').notNull().defaultNow(),
})
```

Access control: there is no client-exposed database credential or RLS layer
(unlike Supabase) — every query runs server-side (Server Components, Server
Actions, or Route Handlers). Writes always check the admin session first;
the public `/[slug]` page only ever runs a `select ... where slug = $1`
scoped read, never a listing query, so there is no way to enumerate all
businesses without the admin session.

## Code Style

```typescript
// Server Action — validated input, typed return, no silent failure
'use server'

import { z } from 'zod'
import { db } from '@/lib/db/client'
import { businesses } from '@/lib/db/schema'
import { requireAdminSession } from '@/lib/auth/require-admin'

const CreateBusinessInput = z.object({
  slug: z.string().min(1),
  name: z.string().min(1),
  description: z.string().optional(),
})

export async function createBusiness(input: z.infer<typeof CreateBusinessInput>) {
  await requireAdminSession()
  const parsed = CreateBusinessInput.parse(input)

  const [business] = await db.insert(businesses).values(parsed).returning()
  if (!business) throw new Error('createBusiness: insert returned no row')
  return business
}
```

- `PascalCase` for components, `camelCase` for functions/variables, files
  matching their default export's name.
- No comments explaining *what* the code does; only non-obvious *why*.
- No silent `catch` — surface database/auth errors as thrown errors with
  context; every mutating Server Action starts with `requireAdminSession()`.

## Testing Strategy

Per project convention: **tests target business logic, not UI.**

- **Unit (Vitest)**: slug validation/normalization (reserved words, uniqueness
  check function), QR options → output params mapping, zod schema edge cases
  (empty label, invalid phone format, invalid URL for custom link), password
  hash/verify round-trip.
- **No component/UI test suite for v1.** Core flow (create business → add
  links → view public page → generate QR) is verified manually in the
  browser before marking a task done, per the run/browser-testing workflow.
- **Manual smoke check** before considering a phase complete: run `npm run
  dev`, walk through the full flow once in-browser.

## Boundaries

- **Always**: run `npm run typecheck` and unit tests before considering a
  task done; validate all Server Action input with zod; call
  `requireAdminSession()` at the top of every mutating action; use the
  reserved-slug list before writing a new business record.
- **Ask first**: any database schema change beyond what's in this spec
  (`drizzle/migrations`), adding a new npm dependency, choosing/registering
  the actual domain name, any change that would reintroduce a feature marked
  out-of-scope (analytics, payments, referral).
- **Never**: commit `.env*` or the database connection string, expose the
  Postgres connection string or Blob write token to the client, add public
  self-signup, add a payment integration.

## Success Criteria

- [x] Admin can log in (custom credential-based session) and reach `/dashboard`.
- [x] Admin can create a business (name, description, logo upload, slug) and
      see it in the businesses list.
- [x] Admin can add/edit/delete links of each type (phone, Telegram,
      Instagram, Maps, custom) on a business, with reordering.
- [x] `/<slug>` renders a public page showing the business's logo, name,
      description, and link buttons — no auth required to view it.
- [x] A reserved slug (e.g. `admin`, `login`, `api`) cannot be used for a
      business and is rejected with a clear error.
- [x] QR page renders a QR code for the business's public URL, adjustable
      color/background/size, downloadable as PNG and SVG.
- [x] `npm run build`, `npm run typecheck`, and `npm test` all pass.

Deployed and verified live at https://mylink-clone.vercel.app (2026-08-01).

## Open Questions

1. Final brand/domain name — deferred; using the placeholder Vercel subdomain
   `mylink-clone.vercel.app` until a real domain/brand is decided.
2. Exact visual design of the public page — implemented as a dark-gradient
   card (logo, name, description, colored link buttons), inspired by the
   mylink.asia reference; can be revisited later.
3. Phone number format/validation rules (local Uzbek format only, or
   international) — implemented permissively (digits, `+`, spaces, dashes,
   parentheses) per the earlier default.

## Known Issues Fixed During Implementation

- Next.js's local env loader (`dotenv-expand`) interprets `$` in `.env.local`
  values as variable interpolation — bcrypt hashes must be stored with
  escaped `\$` locally (Vercel's own env var storage does not need this).
- The `--src-dir` scaffold requires `middleware.ts`/`proxy.ts` under `src/`,
  not at the project root; Next.js 16 also renamed the convention from
  `middleware` to `proxy`.
- shadcn's generated `globals.css` shipped a circular `--font-sans: var(--font-sans)`
  theme token, silently rendering the entire app in the browser's default
  serif font; replaced with a concrete system-font stack.
- QR preview had a stale-response race condition (rapid parameter changes
  could let an older request overwrite a newer one); fixed with a
  cleanup-scoped staleness guard in the `useEffect`.
- ID-based lookups (`getBusinessById`, links actions) crashed with a raw
  Postgres error on a malformed (non-UUID) ID instead of a clean 404; now
  guarded with a UUID format check.
- The Vercel project's Framework Preset was stuck on "Other" (it was created
  before any source code existed), so the platform never applied Next.js's
  routing/function wiring and every route 404'd post-deploy; fixed via
  `vercel project update --framework nextjs`.
