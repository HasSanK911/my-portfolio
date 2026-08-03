# Ali Hassan Kaleemi — Portfolio

A 3D, motion-led portfolio built with Next.js 16, React 19, Three.js and Framer
Motion. Dark-first with a full light theme, brand colour `#BC2739`.

```bash
npm install
npm run dev        # http://localhost:3000
npm run build
npm run typecheck
npm run lint
```

Copy `.env.example` to `.env.local` and set `NEXT_PUBLIC_SITE_URL` before
deploying — it drives canonical URLs, `sitemap.xml`, Open Graph and JSON-LD.

---

## Visitor analytics

A self-contained analytics layer with no third-party script and no external
service: a view counter in the hero, and a private dashboard at **`/views`**.

**Setup.** Set `VIEWS_PASSWORD` in the Netlify environment. That is the only
required variable — until it is set, `/views` refuses everyone rather than
falling open. `VIEWS_SECRET` and `ANALYTICS_SALT` are optional and documented in
`.env.example`.

Storage is **Netlify Blobs**, which needs no configuration on a Netlify deploy.
`next dev` has no blob environment, so it falls back to an in-memory store; the
dashboard says so on screen rather than presenting throwaway numbers as real.

| Piece | File |
|---|---|
| Hero chip (all-time views) | `src/components/ui/views-chip.tsx` |
| Client tracker + view count context | `src/components/analytics/analytics-provider.tsx` |
| Ingest / totals / dashboard feed | `src/app/api/views/**` |
| Dashboard + password gate | `src/app/views/**` |
| Storage, sessions, auth, formatting | `src/lib/analytics/**` |

**What it records.** Per visitor: approximate city and country (from the edge's
geo header), device, browser, OS, referrer, every path read, engaged time per
path, and each session. Bots are dropped on arrival, and logging into `/views`
sets a cookie that excludes your own visits — toggleable from the dashboard.

**What it does not record.** No name, no email, no cross-site identity. The IP
is turned into a salted, truncated one-way hash on arrival and the address
itself is never written down. Location resolution stops at city because that is
all the edge exposes.

**Engaged time, not wall-clock time.** The clock only runs while the tab is
visible *and* the visitor has interacted in the last 60s, so a page left open in
a background tab does not report as hours of reading. Time is flushed on a 15s
heartbeat and once more via `sendBeacon` on unload.

Counters are updated with an ETag compare-and-swap loop, so two people landing
in the same millisecond cannot clobber each other's increment.

> The tracker sets a first-party cookie to recognise a returning visitor. If you
> need to serve the EU under a strict reading of the ePrivacy directive, add a
> consent notice — nothing here asks for consent on your behalf.

---

## Where to edit things

| I want to change… | Edit |
|---|---|
| Any text, project, job, award, skill | `src/lib/data.ts` |
| Colours, type scale, spacing, effects | `src/app/globals.css` (`:root` / `.dark`) |
| Site title, description, keywords, JSON-LD | `src/lib/site.ts` |
| Typefaces | `src/app/layout.tsx` |
| Section order on the home page | `src/app/page.tsx` |
| The 3D scene | `src/components/three/scene.tsx` |
| Analytics tuning (session gap, live window) | `src/lib/analytics/limits.ts` |

**`src/lib/data.ts` is the single source of truth for content.** Adding a
project there automatically creates its case-study page, its sitemap entry, its
prev/next links and its image slots — no other file needs touching.

---

## Adding your images

Every image slot renders a designed placeholder until the real file exists at
its expected path. Drop files into `public/images/` using the names in
[`public/images/README.md`](public/images/README.md) and rebuild — no code
changes needed.

Resolution happens at build time (`src/lib/assets.ts`), so empty slots produce
zero failed network requests, and `.avif` / `.webp` are picked up automatically
in place of `.jpg`.

You need 65 files in total: a portrait, an OG share image, 12 covers and 51
gallery screens.

---

## Design system

**Type** — Instrument Serif (display, incl. italic), Geist (UI/body),
JetBrains Mono (labels, dates, stats). All self-hosted through `next/font`, so
there is no render-blocking request to Google and no layout shift.

**Colour** — one brand ramp built from `#BC2739`. Components never reference
raw hex; they use semantic tokens (`--fg`, `--fg-muted`, `--accent`, `--line`)
that swap per theme. `--accent` is a *different* red in each theme so text
clears 4.5:1 both ways — the raw brand red only ever appears as a fill, glow or
large display text.

Every text token is verified against WCAG AA:

| Token | Light | Dark |
|---|---|---|
| `--fg` | 17.8:1 | 17.1:1 |
| `--fg-muted` | 6.3:1 | 7.3:1 |
| `--fg-subtle` | 4.8:1 | 4.9:1 |
| `--accent` | 6.9:1 | 5.5:1 |

**Motion** — one shared language in `src/lib/motion.ts`. Entrances use an
expo-out curve (`cubic-bezier(0.16, 1, 0.3, 1)`) at 260–950ms; exits are
faster. Only transforms and opacity are animated, so everything stays on the
compositor.

---

## The 3D layer

A single `<Canvas>` lives behind the whole page — one `WebGLRenderer` for the
page lifetime, because browsers cap concurrent GPU contexts at 8–16 and mobile
drops them aggressively. It contains a distorted crimson core, a wireframe
shell, two orbit rings and a seeded particle field, lit by a procedural
environment (no HDR is fetched over the network).

It degrades in layers:

| Condition | Behaviour |
|---|---|
| High-tier device | 2600 particles, DPR ≤ 2, antialiasing, 32-segment core |
| Mid-tier / touch / narrow | 1300 particles, DPR ≤ 1.5, 16-segment core |
| Low-tier or Save-Data | 600 particles, no antialiasing, low-power GPU hint |
| No WebGL | CSS gradient + ring fallback, visually consistent |
| Scrolled 1.6 viewports past | Render loop halted (`frameloop="never"`) |
| Tab hidden | Render loop halted |
| `prefers-reduced-motion` | Scene renders, all autonomous animation frozen |

The tier is measured once from `hardwareConcurrency`, `deviceMemory`, pointer
type, viewport width and the Save-Data hint.

---

## Accessibility

- Skip-to-content link; every section is a landmark with a heading.
- `prefers-reduced-motion` is respected globally in CSS *and* per-component —
  reveals collapse to fades, Lenis smooth scrolling is disabled entirely, the
  custom cursor does not mount, and the intro is skipped. The media query is
  **subscribed to**, not snapshotted, so toggling it mid-session takes effect.
- Split-word heading animations expose the full string via `aria-label`; the
  animated fragments are `aria-hidden`.
- Focus rings are branded and never removed. Every control clears 44×44px.
- Hover is never the only affordance — cards are links, and hover-revealed
  arrows also appear on `:focus-visible`.
- Images reserve their aspect ratio before loading, so CLS stays near zero.
- Pinch-zoom is not disabled.

---

## Stack

Next.js 16 (App Router, Turbopack) · React 19 · TypeScript · Tailwind CSS v4 ·
Three.js + React Three Fiber + drei · Framer Motion · Lenis · next-themes ·
lucide-react · Netlify Blobs

Design decisions were informed by the
[UI/UX Pro Max](https://github.com/nextlevelbuilder/ui-ux-pro-max-skill) design
intelligence database — pattern (Immersive/Interactive), style (Modern Dark
Cinema), motion tier and the pre-delivery checklist.
