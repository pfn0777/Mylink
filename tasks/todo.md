# Task List: MyLink Clone

_Plan: [tasks/plan.md](./plan.md)_

## Phase 1: Foundation

### Task 1: Scaffold the Next.js project

**Description:** Initialize the Next.js (App Router) + TypeScript (strict)
project with Tailwind CSS and shadcn/ui, base lint/format config, and the
`docs/`/`tasks/` structure already in place.

**Acceptance criteria:**
- [ ] `npm run dev` serves a blank home page with Tailwind working
- [ ] `tsconfig.json` has `"strict": true`
- [ ] shadcn/ui CLI initialized, at least one primitive (e.g. Button) installed

**Verification:**
- [ ] `npm run build` succeeds
- [ ] `npm run typecheck` succeeds
- [ ] `npm run lint` succeeds

**Dependencies:** None

**Files likely touched:** `package.json`, `tsconfig.json`, `tailwind.config.ts`, `src/app/layout.tsx`, `src/app/page.tsx`, `components.json`

**Estimated scope:** Medium (scaffold-generated files)

---

### Task 2: Wire up the database (Neon/Drizzle schema + client helpers)

**Description:** Provision a Vercel Postgres (Neon) database on the user's
existing Vercel account, define the `businesses`/`links` schema in Drizzle,
generate and run the initial migration, and add the typed DB client used by
Server Actions/Components. No RLS layer is needed — there is no
client-exposed DB credential; every query runs server-side, and access
control is enforced by checking the admin session in code (Task 3), not by
database policy.

**Acceptance criteria:**
- [ ] Neon Postgres database provisioned and connected to the Vercel project (connection string in `.env.local`, never committed)
- [ ] Drizzle schema defines `businesses`, `link_type` enum, `links` per the spec
- [ ] `drizzle-kit generate` + `drizzle-kit migrate` apply cleanly against the database
- [ ] `src/lib/db/client.ts` exports a typed Drizzle instance importable from Server Actions/Components

**Verification:**
- [ ] `npm run db:generate && npm run db:migrate` succeeds against the real database
- [ ] Manual check: a one-off insert + select round-trip via the Drizzle client succeeds (e.g. a throwaway script or a temporary test route)
- [ ] `npm run typecheck` succeeds

**Dependencies:** Task 1

**Files likely touched:** `drizzle.config.ts`, `drizzle/migrations/*.sql`, `src/lib/db/schema.ts`, `src/lib/db/client.ts`, `.env.example`

**Estimated scope:** Medium

---

### Task 3: Admin auth (login + route protection)

**Description:** Single-admin login page: compares the submitted password
against a bcrypt hash stored in an env var, and on success issues a signed
(`jose`), httpOnly session cookie. Root `src/proxy.ts` verifies that cookie
and protects everything except `/login` and `/[slug]`. `requireAdminSession()`
helper used by every mutating Server Action from Task 5 onward.

**Acceptance criteria:**
- [ ] `/login` authenticates against `ADMIN_EMAIL`/`ADMIN_PASSWORD_HASH` env vars
- [ ] Unauthenticated request to `/dashboard` (or any admin route) redirects to `/login`
- [ ] Authenticated session persists across reloads; `requireAdminSession()` throws when called without a valid session

**Verification:**
- [ ] Manual check: log in, reload `/dashboard`, still authenticated; log out, `/dashboard` redirects
- [ ] `npm run typecheck` succeeds

**Dependencies:** Task 2

**Files likely touched:** `src/app/login/page.tsx`, `src/lib/auth/session.ts`, `src/lib/auth/password.ts`, `src/proxy.ts`, `.env.example`

**Estimated scope:** Small

---

## Checkpoint: Foundation
- [ ] `npm run build` and `npm run typecheck` succeed
- [ ] Unauthenticated `/dashboard` redirects to `/login`
- [ ] Admin can log in and reach an empty `/dashboard`
- [ ] **Review with human before proceeding to Phase 2**

---

## Phase 2: Core Features

### Task 4: Slug validation module

**Description:** A `src/lib/slug.ts` module: normalizes input to a URL-safe
slug, checks against the reserved-word list, and checks uniqueness against
the `businesses` table.

**Acceptance criteria:**
- [ ] Rejects reserved words (`admin`, `login`, `api`, `dashboard`, `businesses`, `_next`, etc.)
- [ ] Rejects non-URL-safe characters, normalizes casing
- [ ] Uniqueness check returns a clear conflict result (not a thrown DB error) when the slug already exists

**Verification:**
- [ ] `npm test -- slug` passes, covering reserved words, format edge cases, and the uniqueness path
- [ ] `npm run typecheck` succeeds

**Dependencies:** Task 2

**Files likely touched:** `src/lib/slug.ts`, `tests/unit/slug.test.ts`

**Estimated scope:** Small

---

### Task 5: Create-business flow

**Description:** `/businesses/new` form (name, description, slug) wired to a
`createBusiness` Server Action using the Task 4 slug validation and zod, and
the `/dashboard` list showing created businesses.

**Acceptance criteria:**
- [ ] Submitting valid input creates a row and redirects to the dashboard
- [ ] Duplicate or reserved slug shows an inline error, no partial write
- [ ] Dashboard lists all businesses with name, slug, and edit/view actions

**Verification:**
- [ ] Manual check: create two businesses, attempt a duplicate slug, confirm the error and confirm the dashboard list is correct
- [ ] `npm run typecheck` succeeds

**Dependencies:** Task 3, Task 4

**Files likely touched:** `src/app/businesses/new/page.tsx`, `src/lib/actions/businesses.ts`, `src/app/dashboard/page.tsx`, `src/components/admin/BusinessForm.tsx`

**Estimated scope:** Medium

---

### Task 6: Logo upload

**Description:** Add logo upload (`@vercel/blob`, public access) to the
business create/edit form. The upload Server Action requires an admin
session before calling `put()`; the resulting public URL is saved on the
business row.

**Acceptance criteria:**
- [ ] Uploading an image stores it via Vercel Blob and saves the public URL on the business row
- [ ] Logo preview shows in the admin form after upload
- [ ] Upload action rejects the request if there is no valid admin session

**Verification:**
- [ ] Manual check: upload a logo, confirm it's visible via its public URL without auth
- [ ] `npm run typecheck` succeeds

**Dependencies:** Task 5

**Files likely touched:** `src/lib/actions/businesses.ts`, `src/components/admin/LogoUpload.tsx`, `.env.example`

**Estimated scope:** Small

---

### Task 7: Links management

**Description:** On `/businesses/[id]/edit`, add/edit/delete/reorder links
of all 5 types (phone, telegram, instagram, maps, custom), each with a label
and a type-appropriate value.

**Acceptance criteria:**
- [ ] Each link type validates its value appropriately (phone: permissive numeric format; telegram/instagram: handle or URL; maps: URL; custom: label + URL)
- [ ] Links can be reordered and the `position` persists
- [ ] Deleting a link removes it immediately without affecting others

**Verification:**
- [ ] `npm test -- validation` passes for per-type value validation
- [ ] Manual check: add one of each link type, reorder them, delete one, confirm persisted order
- [ ] `npm run typecheck` succeeds

**Dependencies:** Task 5

**Files likely touched:** `src/app/businesses/[id]/edit/page.tsx`, `src/lib/actions/links.ts`, `src/lib/validation.ts`, `src/components/admin/LinkEditor.tsx`, `tests/unit/validation.test.ts`

**Estimated scope:** Medium

---

### Task 8: Public page at `/[slug]`

**Description:** Render the business's logo, name, description, and links
as buttons at `/<slug>`, guarded by the reserved-word list; unknown slugs
404.

**Acceptance criteria:**
- [ ] Valid slug renders logo/name/description/links without requiring auth
- [ ] Reserved-word or non-existent slug returns a 404, not a crash
- [ ] A business with zero links still renders cleanly (no broken empty state)

**Verification:**
- [ ] Manual check: view a real business's public page in-browser, confirm it works logged out (private/incognito)
- [ ] `npm run typecheck` succeeds

**Dependencies:** Task 7

**Files likely touched:** `src/app/[slug]/page.tsx`, `src/components/public/PublicBusinessPage.tsx`, `src/components/public/LinkButton.tsx`

**Estimated scope:** Medium

---

### Task 9: QR generation module

**Description:** `src/lib/qr.ts` wrapping the `qrcode` package: given a URL
and options (foreground color, background color, size), returns a PNG
buffer and an SVG string.

**Acceptance criteria:**
- [ ] Generates a valid PNG buffer and valid SVG string for a given URL
- [ ] Color and size options are reflected in the output
- [ ] Invalid input (e.g. empty URL) throws a clear error, not a silent failure

**Verification:**
- [ ] `npm test -- qr` passes, covering default options, custom color/size, and the invalid-input error path
- [ ] `npm run typecheck` succeeds

**Dependencies:** Task 2

**Files likely touched:** `src/lib/qr.ts`, `tests/unit/qr.test.ts`

**Estimated scope:** Small

---

### Task 10: QR customizer page

**Description:** `/businesses/[id]/qr` — color pickers (foreground/background),
a size slider, a live preview, and PNG/SVG download buttons, using the Task
9 module.

**Acceptance criteria:**
- [ ] Changing color/size updates the preview
- [ ] "Download PNG" and "Download SVG" produce files that scan to the correct public URL
- [ ] Page correctly builds the full public URL (not just the slug) for the QR payload

**Verification:**
- [ ] Manual check: generate a QR, scan it with a phone, confirm it opens the correct `/<slug>` page
- [ ] `npm run typecheck` succeeds

**Dependencies:** Task 8, Task 9

**Files likely touched:** `src/app/businesses/[id]/qr/page.tsx`, `src/components/admin/QrCustomizer.tsx`

**Estimated scope:** Medium

---

## Checkpoint: Core Features
- [ ] Full flow works end-to-end in the browser: log in → create business →
      upload logo → add links → view public page → generate and scan a QR code
- [ ] **Review with human before proceeding to Phase 3**

---

## Phase 3: Polish

### Task 11: Delete business

**Description:** Delete action on the dashboard/edit page with a confirmation
dialog; deleting a business cascades to its links.

**Acceptance criteria:**
- [ ] Confirmation dialog required before delete executes
- [ ] Deleting a business removes its links (DB cascade) and its public page 404s afterward

**Verification:**
- [ ] Manual check: delete a business, confirm its public page now 404s and the dashboard list no longer shows it
- [ ] `npm run typecheck` succeeds

**Dependencies:** Task 8

**Files likely touched:** `src/lib/actions/businesses.ts`, `src/app/dashboard/page.tsx`, `src/components/admin/DeleteBusinessDialog.tsx`

**Estimated scope:** Small

---

### Task 12: Edge-case hardening

**Description:** Sweep the known edge cases from the spec's open questions
and risks: duplicate-slug UX, invalid custom-link URLs, empty-links public
page polish, permissive phone validation.

**Acceptance criteria:**
- [ ] Duplicate slug attempt always shows a friendly inline error (no 500)
- [ ] Custom link with a malformed URL is rejected client- and server-side
- [ ] Public page with zero links shows a clean "no links yet" state instead of an empty gap

**Verification:**
- [ ] `npm test` full suite passes
- [ ] Manual check: deliberately trigger each edge case above once

**Dependencies:** Task 7, Task 8

**Files likely touched:** `src/lib/validation.ts`, `src/components/public/PublicBusinessPage.tsx`, `tests/unit/validation.test.ts`

**Estimated scope:** Small

---

### Task 13: Deploy to Vercel + final verification

**Description:** Connect the repo to Vercel, set Supabase env vars in the
Vercel project, deploy to a preview/placeholder domain, and re-verify the
full flow in production.

**Acceptance criteria:**
- [ ] Production deploy builds successfully on Vercel
- [ ] Env vars (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, service role key) set in Vercel, not committed to the repo
- [ ] Full flow re-verified against the deployed URL, not just localhost

**Verification:**
- [ ] Manual check: full create → links → public page → QR flow works on the live Vercel URL
- [ ] `npm run build`, `npm run typecheck`, `npm test` all pass locally before deploying

**Dependencies:** Task 12

**Files likely touched:** `vercel.json` (if needed), `.env.example`

**Estimated scope:** Small

---

## Checkpoint: Complete
- [ ] All success criteria in [docs/specs/mylink-spec.md](../docs/specs/mylink-spec.md) are met
- [ ] `npm run build`, `npm run typecheck`, `npm test` all pass
- [ ] Ready for human review
