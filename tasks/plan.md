# Implementation Plan: BirJoyda

_Spec: [docs/specs/birjoyda-spec.md](../docs/specs/birjoyda-spec.md)_
_Intent: [docs/intent/birjoyda.md](../docs/intent/birjoyda.md)_

_Revision note (2026-08-01): Task 2 and Task 6 below were re-scoped from
Supabase to Vercel Postgres (Neon)/Drizzle + Vercel Blob + custom admin auth
— see the spec's revision note for why._

## Overview

An admin-only Next.js app: the admin creates a "business" record (name,
description, logo, slug), attaches links (phone, Telegram, Instagram, Google
Maps, custom URL) to it, gets an auto-generated public page at `/<slug>`,
and generates a customizable QR code pointing to that page. Repo is
currently empty — this plan starts from scaffold.

## Architecture Decisions

- **Server Actions over a REST API** — fewer moving parts for a single-admin
  tool with no external API consumers.
- **QR generated server-side with the `qrcode` package** — avoids depending
  on a third-party service (mylink.asia used goQR); PNG and SVG both
  producible from the same call.
- **Reserved-slug list checked in two places** — at Server Action validation
  time (fast feedback) and defensively in the `/[slug]` route (in case a
  reserved word is ever added after data already exists).
- **Vercel Postgres (Neon) + Drizzle ORM** for data, **Vercel Blob** for logo
  storage — both provision through the user's existing Vercel account, no
  new third-party signup, and side-step the Supabase org's 2-active-project
  free-tier cap.
- **Custom single-admin auth** (bcrypt password check + `jose`-signed session
  cookie) instead of a managed auth provider — there is exactly one admin
  account, so a full auth service is unnecessary weight. No client-side DB
  access exists at all (all queries run server-side), so there is no RLS
  layer to configure — access control is just "does this request have a
  valid admin session," checked once at the top of every mutating action
  and in middleware for page routes.

## Task List

### Phase 1: Foundation

- [x] Task 1: Scaffold the Next.js project
- [x] Task 2: Wire up the database (Neon/Drizzle schema + client/server helpers)
- [x] Task 3: Admin auth (login + route protection)

### Checkpoint: Foundation
- [x] `npm run build` and `npm run typecheck` succeed
- [x] Visiting `/dashboard` unauthenticated redirects to `/login`
- [x] Logging in with the admin account reaches an empty `/dashboard`
- [x] Review with human before proceeding

### Phase 2: Core Features (vertical slices)

- [x] Task 4: Slug validation module (reserved words, format, uniqueness)
- [x] Task 5: Create-business flow (form + Server Action + dashboard list)
- [x] Task 6: Logo upload (Vercel Blob)
- [x] Task 7: Links management (add/edit/delete/reorder, all 5 types)
- [x] Task 8: Public page at `/[slug]`
- [x] Task 9: QR generation module (`qrcode` wrapper)
- [x] Task 10: QR customizer page (color/size/format, download)

### Checkpoint: Core Features
- [x] Full flow works end-to-end in the browser: log in → create business →
      add links → view public page → generate and download a QR code
- [x] Review with human before proceeding

### Phase 3: Polish

- [x] Task 11: Delete business (cascade links, confirm dialog)
- [x] Task 12: Edge-case hardening (duplicate slug, invalid custom URL,
      empty-links public page, permissive phone validation, malformed-ID
      lookups)
- [x] Task 13: Deploy to Vercel (placeholder domain) + final verification

### Checkpoint: Complete
- [x] All success criteria in the spec are met
- [x] `npm run build`, `npm run typecheck`, `npm test` all pass
- [x] Ready for human review

## Risks and Mitigations

| Risk | Impact | Mitigation |
|---|---|---|
| Reserved slug collides with a real app route (`admin`, `api`, etc.) | High — breaks routing or lets a business shadow a system page | Explicit reserved-word list enforced at both validation and route level (Task 4, Task 8) |
| A mutating Server Action forgets the admin-session check | High — unauthenticated write | `requireAdminSession()` called first in every action (Task 3 provides the helper; every action in Tasks 5/6/7/11 uses it) |
| Blob store access misconfigured (write open to public, or logo not publicly readable) | Medium | Verify upload requires the admin session and the resulting URL is publicly viewable in Task 6 |
| QR PNG/SVG generation behaves differently server vs. client | Low | Generate both formats server-side via `qrcode`'s Node API in Task 9; UI only triggers download |

## Open Questions

- Final brand/domain name — not needed to start; Vercel preview URL used
  until decided (Task 13).
- Exact visual design of the public page — reference designs to be pulled
  during Task 8, not before.
- Phone number format — permissive validation (digits, `+`, spaces, dashes)
  unless told otherwise (Task 4/12).
