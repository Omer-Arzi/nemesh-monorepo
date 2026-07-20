# Investigation: compact-header scroll animation snaps instantly on Windows

**Status as of 2026-07-20: root cause mechanism confirmed via direct DevTools evidence. Final closing step (toggle the Windows OS setting and re-verify) not yet performed/confirmed by the user. Product decision (see "Open question" below) not yet made.**

## Symptom

On the Nemesh homepage, scrolling down past the hero section should reveal the fixed
desktop compact header (`DesktopCompactHeader`) with a smooth ~180ms fade/slide-in
(and hide it again with a matching transition when scrolling back up). On one
specific Windows 10 physical PC (Chrome), the header instead **appears/disappears
instantly** with no visible transition — on *every* toggle, not just the first.
On the reporter's Mac (Chrome), the same interaction animates correctly. This is a
reproduction of a bug the same user had already seen **in production**, on the same
Windows PC — not something introduced by local dev tooling.

## How it was reproduced locally

The Windows machine is on the same LAN as the Mac running the dev servers. Setup used to test cross-device:

- `client/.env.local` (gitignored, not committed) sets:
  - `NEXT_PUBLIC_API_URL=http://10.100.102.10:1337/api` (Mac's LAN IP — "localhost"
    only resolves correctly when the browser is on the same machine as the server)
  - `DEV_TUNNEL_HOST=<ngrok-hostname>` — must be updated every time a new ngrok
    session starts (ngrok free plan issues a new random hostname each time)
- `client/next.config.ts` reads `DEV_TUNNEL_HOST` into Next's `allowedDevOrigins`
  (Next 16 blocks cross-origin requests to dev-only resources like HMR unless the
  requesting host is allowlisted — this was a separate, already-fixed issue that
  showed up as "some content/images broken, drawer wouldn't open" before the LAN IP
  fix, unrelated to the animation bug below).
- ngrok tunnels port 3000 (`ngrok http 3000`) so the Windows machine can load the
  Next.js dev server.
- Windows machine: Chrome, Windows 10, **physical PC** (not a VM/RDP session —
  confirmed with the user, which rules out "RDP disables animations by default" as
  the explanation for *why* the OS setting is off).

## Investigation timeline

Two UI elements were initially confused during this investigation — worth noting
for continuity: the user's "toggle down" phrasing was first misread as the mobile
hamburger **NavDrawer** (a `@mui/material` `Drawer`/`Slide` component), when they
actually meant the **scroll-triggered `DesktopCompactHeader` reveal** (a hand-rolled
CSS `opacity`/`transform` transition driven by `AppShell.tsx`'s
`isHomeHeroVisible` state, itself driven by an `IntersectionObserver` in
`HomeHeroSection.tsx`). All findings below are about the compact header, not the
drawer.

1. **Ruled out: `prefers-reduced-motion` via `window.matchMedia()`.** Running
   `window.matchMedia('(prefers-reduced-motion: reduce)').matches` in the Windows
   Chrome console returned `false`. This *seemed* to rule out reduced-motion as a
   cause — see finding 5, which resolves this apparent contradiction.
2. **Ruled out: MUI `Slide`/`Drawer` internals.** Initially misattributed to the
   wrong component (see above) — MUI v9's `Slide` transition does have its own
   built-in `theme.motion.reducedMotion` handling (confirmed by reading
   `node_modules/@mui/material/Slide/Slide.js` and
   `transitions/useReducedMotion.js` directly), but this is irrelevant since the
   compact header doesn't use `Slide` at all.
3. **Confirmed via DevTools Animations panel: an animation *is* attempted.**
   Recording the panel while toggling the header showed **zero** entries — no
   animation was recorded at all for the header (contrast: toggling the NavDrawer
   *did* record an entry). This showed the CSS transition wasn't merely fast, it
   effectively wasn't running as an animation.
4. **Ruled out: JS/React state-layer bug.** Added temporary debug logging (since
   removed) to `HomeHeroSection.tsx`'s `IntersectionObserver` callback and
   `DesktopCompactHeader.tsx`'s render. Console output on the Windows machine
   showed the observer firing exactly once per scroll-past, and the component
   re-rendering exactly once with the correct `visible` value each time (a second,
   0.6ms-later duplicate render is React StrictMode double-invoking the render
   function in dev — harmless, results in only one real DOM commit). This ruled
   out state flapping, missed updates, or a hydration/first-paint-only glitch —
   the *second* and later toggles snap identically to the first.
5. **Ruled out: DevTools media-feature emulation override.** Checked
   DevTools → More tools → Rendering → "Emulate CSS media feature
   prefers-reduced-motion" — was set to "No emulation."
6. **Ruled out: Chrome extensions.** Reproduced in Incognito (which disables most
   extensions by default) — still snapped instantly.
7. **Ruled out: GPU/software rendering.** Checked `chrome://gpu` — "Compositing"
   and "Rasterization" both reported "Hardware accelerated."
8. **CONFIRMED root cause, via direct CSS cascade inspection.** In DevTools
   Elements → Styles panel, on the compact header's `.muirtl-*` rule, the
   `transition: opacity 180ms ease-out, transform 180ms ease-out;` declaration
   (from `DesktopCompactHeaderStyle.root()` in
   `client/src/components/layout/DesktopCompactHeader/DesktopCompactHeader.style.ts`)
   showed as **struck through** (overridden). Scrolling up in the same panel
   revealed the winning rule:
   ```css
   @media (prefers-reduced-motion: reduce) {
     .muirtl-1yd3kci { transition: none; }
   }
   ```
   Chrome's Styles panel only lists `@media`-scoped rules that are **currently
   matching** — so this is direct evidence that Chrome's rendering engine
   considers `prefers-reduced-motion: reduce` to be active on this machine, for
   this page, contradicting the `matchMedia()` console check from finding 1. This
   discrepancy between `matchMedia()` and actual `@media` cascade matching is
   unresolved/unexplained, but the cascade evidence is more direct and was
   corroborated independently (see finding 3 — no animation ever gets recorded,
   consistent with `transition: none` applying).
9. **Windows-specific mechanism (context, not yet verified as the actual
   fix).** Chromium on Windows ties `prefers-reduced-motion` to the OS-level
   "Show animations in Windows" setting. Confirmed with the user this is a
   **physical PC**, not a VM/RDP session (which would have made "RDP disables
   animations by default" a tidy explanation) — so the reason that setting is off
   on this particular machine is unknown (could be a deliberate prior choice, an
   OEM image default, or something else). This doesn't change the finding, just
   means there's no single well-known explanation for *why* it's off here.

## Not yet done

- **User was about to check/toggle the Windows setting** (Windows 11:
  הגדרות → נגישות → אפקטים חזותיים → "אפקטים של הנפשה"; Windows 10:
  הגדרות → קלות הגישה → תצוגה → "הצג הנפשות ב-Windows") and reload to confirm
  the animation resumes — **this closing verification was not completed/reported
  before the session moved on.** Next session should pick this up first.
- The `window.matchMedia()` vs. cascade-matching discrepancy (finding 8) was
  never explained — not critical to fixing anything, but worth a note if it comes
  up again elsewhere.

## Open question (product decision, not yet made)

Given a real production user hit this on a machine where "reduce motion" is
seemingly not a deliberate accessibility choice (unclear why it's set), should
Nemesh:
- **(a)** Keep respecting `prefers-reduced-motion` as-is for this header reveal —
  correct accessibility default, even for users who didn't consciously opt in, or
- **(b)** Override `prefers-reduced-motion` specifically for this one decorative,
  non-essential transition, on the theory that a meaningful number of Windows
  users may have this preference set unintentionally and would otherwise perceive
  the site as "broken" (an abrupt snap) rather than accessibly quiet.

No decision made yet — this needs the user's product judgment, not just an
engineering fix.

## Relevant files

- `client/src/components/layout/AppShell/AppShell.tsx` — owns
  `isHomeHeroVisible` state and computes `targetDesktopHeaderVisible`; also has
  its own separate `prefers-reduced-motion` check (line ~112) for the *route-group
  transition-reconstruction* seed logic only — unrelated to this bug, do not
  confuse the two.
- `client/src/components/layout/DesktopCompactHeader/DesktopCompactHeader.tsx` /
  `DesktopCompactHeader.style.ts` — the actual transition (`opacity`/`transform`,
  with an explicit `@media (prefers-reduced-motion: reduce) { transition: none }`
  override) that is confirmed to be the one not animating.
- `client/src/features/home/HomeHeroSection/HomeHeroSection.tsx` — the
  `IntersectionObserver` that flips `isHomeHeroVisible` on scroll. Confirmed
  firing correctly; not the source of the bug.
- Temporary debug `console.log` calls that were added to the two files above
  during this investigation have been **removed** (as of 2026-07-20). If picking
  this back up, the quickest way to re-instrument is to grep the git history for
  `TEMP DEBUG` around this date, or just re-add similar logging — it's not
  complex to recreate.
