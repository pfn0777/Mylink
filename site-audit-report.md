# Site Audit: https://mylink-clone.vercel.app
*Generated: 2026-08-01T12:00:00Z*

## Summary

| Category       | Critical | High | Medium | Low | Total |
|----------------|----------|------|--------|-----|-------|
| UX             | 0        | 1    | 0      | 4   | 5     |
| Accessibility  | 0        | 1    | 3      | 1   | 5     |
| Performance    | 0        | 0    | 0      | 4   | 4     |
| Bugs           | 0        | 0    | 1      | 1   | 2     |
| **Total**      | **0**    | **2**| **4**  | **10**| **16** |

> **Lighthouse performance score: 98/100**

*Scope note: this is an internal, admin-only app with no public sign-up. The only unauthenticated, crawlable page is `/login` — everything below was audited against that single page.*

---

## Critical Issues

*No critical issues found.*

---

## UX Issues

### High

- **https://mylink-clone.vercel.app/login** (Forms) — There is no "forgot password" link or any recovery flow. Since there is exactly one admin account with credentials stored only in env vars (`ADMIN_EMAIL`/`ADMIN_PASSWORD_HASH`, no DB table), a forgotten password leaves the admin with no in-app way to regain access to the entire tool.
  *Fix: Add a self-service password reset flow (e.g. email a reset token), or at minimum document a manual recovery runbook (regenerate the bcrypt hash + update the Vercel env var) so lockout risk is mitigated.*

### Medium

*No medium-severity UX issues found.*

### Low

- **https://mylink-clone.vercel.app/login** (Consistency) — Form labels mix languages: "Email" is in English while "Parol", "Kirish", and the error text are in Uzbek.
  *Fix: Standardize all label/button/error text to one language, e.g. translate "Email" to "Elektron pochta" to match the rest of the Uzbek UI.*
- **https://mylink-clone.vercel.app/login** (Consistency) — The root layout declares `<html lang="en">` while nearly all visible content is Uzbek, so screen readers apply English pronunciation rules to Uzbek text.
  *Fix: Change the `lang` attribute to `"uz"` so assistive technology pronounces the content correctly.*
- **https://mylink-clone.vercel.app/login** (Forms) — The login-failure error message has no `role="alert"` or `aria-live`, so screen-reader users aren't notified when it appears after a failed submit.
  *Fix: Add `role="alert"` (or wrap in an `aria-live="polite"` region) so the error is announced automatically.*
- **https://mylink-clone.vercel.app/login** (Navigation) — The login page has no logo, brand mark, or any link at all — just a bare heading, form, and submit button.
  *Fix: Add a small non-linking logo or product name above the form for brand context; low priority given this is an internal, single-page admin tool by design.*

---

## Accessibility Issues

### High

- **https://mylink-clone.vercel.app/login** — WCAG 4.1.3 — `<p className="text-sm text-destructive">{state.error}</p>` (`src/app/login/page.tsx` line 27): on a failed login, the error message renders with no `role="alert"` or `aria-live`, and focus stays on the submit button, so screen-reader users get no indication the submission failed or why.
  *Fix: Add `role="alert"` (or an `aria-live="assertive"` region) to the error `<p>` so assistive tech announces it immediately.*

### Medium

- **https://mylink-clone.vercel.app/login** — WCAG 3.1.1 — `<html lang="en">`: page content is entirely Uzbek ("Admin kirish", "Email", "Parol", "Kirish", and the error string).
  *Fix: Set `lang="uz"` on the root `<html>` element in `src/app/layout.tsx`.*
- **https://mylink-clone.vercel.app/login** — WCAG 3.3.1 — `#email`, `#password` inputs: on a failed login, neither input receives `aria-invalid="true"`, and the error text isn't linked via `aria-describedby`, even though `input.tsx` already ships `aria-invalid` styling that's never triggered.
  *Fix: When `state.error` is set, add `aria-invalid="true"` and `aria-describedby="login-error"` to the relevant inputs and give the error paragraph `id="login-error"`.*
- **https://mylink-clone.vercel.app/login** — WCAG 1.4.11 — Email/Parol input borders (`--input: oklch(0.922 0 0)` on `--background: oklch(1 0 0)`): unfocused border contrast is ~1.26:1 against the required 3:1 minimum for UI component boundaries.
  *Fix: Darken the default `--input` border token (e.g. toward `oklch(0.7-0.75 0 0)`) so the unfocused field outline reaches at least 3:1 contrast.*

### Low

- **https://mylink-clone.vercel.app/login** — WCAG 2.4.1 — No "Skip to content" link as the first focusable element in `<body>`. Low impact today (single centered form, no repeated nav), but will matter once shared dashboard chrome is added.
  *Fix: Add a visually-hidden-until-focused skip link (`<a href="#main" className="sr-only focus:not-sr-only">Skip to content</a>`) once shared navigation exists across authenticated pages.*

---

## Performance Issues

### Low

- **https://mylink-clone.vercel.app/login** (Unused JavaScript) — The largest JS chunk ships 40.8% unused code (29.5 KiB unused of 72.4 KiB in `/_next/static/chunks/25o46h8mdjlrg.js`).
  *Fix: Check whether the login page is pulling in a shared vendor/dashboard bundle it doesn't need; split or tree-shake so the login route only loads what it uses.*
- **https://mylink-clone.vercel.app/login** (Legacy JavaScript Polyfills) — Bundle includes polyfills for natively-supported ES2019+ methods (`Array.prototype.at/flat/flatMap`, `Object.fromEntries/hasOwn`, `String.prototype.trimStart/trimEnd`), ~14 KiB estimated savings.
  *Fix: Raise the SWC/browserslist target in `next.config` to a modern baseline so the build stops emitting these polyfills.*
- **https://mylink-clone.vercel.app/login** (Render-Blocking Resources) — One stylesheet blocks first paint (`2mhel5bpt-fcu.css`, 7.3 KB transferred / 33 KB uncompressed).
  *Fix: Optional — inline critical CSS for the login form. Low priority since FCP is already 0.98s, well under the 1.8s threshold.*
- **https://mylink-clone.vercel.app/login** (Max Potential First Input Delay) — Legacy diagnostic scores below Lighthouse's 0.5 cutoff (280ms, score 0.41), though the modern equivalent (Total Blocking Time, 155ms) is well within budget.
  *Fix: No action needed — this is a superseded metric; rely on TBT/INP, which already pass.*

---

## Bugs & Functional Issues

### Medium

- **https://mylink-clone.vercel.app/login** (accessibility-feedback) — Click path: fill valid-format but wrong email/password → click "Kirish". The failure message "Email yoki parol noto'g'ri" renders with no `role="alert"`/`aria-live` and no `aria-describedby` link to the email/password fields, so screen-reader users receive no notification that login failed. Confirmed via DOM inspection that no `role="alert"` element exists on this page in any state.
  *Fix: Wrap the credential-error message in `role="alert"` (or `aria-live="assertive"`), or connect it via `aria-describedby` on the email/password inputs.*

### Low

- **https://mylink-clone.vercel.app/login** (form-state-reset) — Click path: fill email + password → click "Kirish" → wrong-credentials error shown. After the failed submit, both the email and password inputs are cleared back to empty, forcing the admin to retype the email every time they mistype only the password.
  *Fix: Preserve the submitted email value (e.g. via `defaultValue` from the action's returned form state) after a failed login attempt so only the password field is cleared.*

---

## Top 5 Recommendations

1. **Announce login errors to screen readers** — Add `role="alert"` (or `aria-live="assertive"`) to the failed-login error message in `src/app/login/page.tsx`. This is the single most-corroborated finding (flagged independently by the UX, accessibility, and bug-hunt agents) and is a one-line fix with a real accessibility impact.
2. **Give the admin a password recovery path** — There's exactly one admin account and no in-app recovery flow; a forgotten password currently means editing env vars directly. Add a reset flow or document a recovery runbook so this isn't a silent single point of failure.
3. **Fix the `<html lang>` mismatch** — Change `lang="en"` to `lang="uz"` in `src/app/layout.tsx` to match the actual Uzbek page content; trivial fix, corrects mispronunciation for all screen-reader users site-wide.
4. **Wire up `aria-invalid`/`aria-describedby` on login inputs** — `input.tsx` already ships `aria-invalid` styling that's never triggered; connecting it on a failed submit is a small change with a real usability payoff for assistive-tech users.
5. **Raise input border contrast to meet WCAG 1.4.11** — The unfocused input border currently sits around 1.26:1 contrast against a 3:1 requirement; darkening the `--input` CSS token is a one-line design-token fix.
