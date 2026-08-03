# Image assets

Every image slot on the site renders through `PlaceholderImage`. Until a real
file exists at the path below, a designed placeholder occupies **exactly** the
same footprint — so dropping images in never shifts the layout.

## How to add an image

Save the file at the exact path listed below (inside `public/`). Covers and
gallery shots resolve by convention from the project slug, so no code change is
needed. If a path is wrong or the file is missing, the component falls back to
the placeholder rather than showing a broken image.

### Quickest route for project screenshots

Drop a whole folder of screenshots at `public/projects/<slug>/` under any
numbered filenames — `1.png`, `2.png`, … — and they are picked up in numeric
order at build time. No renaming, and the count in `src/lib/data.ts` no longer
matters for that project. The **first** image becomes the cover (unless a
`work/<slug>-cover.jpg` exists) and the rest fill the gallery. Each frame
reserves the screenshot's own aspect ratio, so wide desktop captures are shown
whole rather than cropped into a 4:3 box.

One filename in that folder is reserved: **`logo.png`** is the project's brand
lockup, not a screenshot. It's kept out of the gallery and rendered as a chip on
the project card. Export it with a transparent background and dark artwork — the
chip is light in both themes.

The per-file table below is the alternative for hand-placed art; a project
folder wins over it when both exist.

## Format guidance

- Prefer **WebP** or **AVIF** over JPEG — roughly 30% smaller at equal quality.
  If you export `.webp`, change the extension in the `hint` strings inside
  `src/components/ui/project-card.tsx` and `src/app/work/[slug]/page.tsx`.
- Export screenshots at 2x the listed size and let `next/image` downscale.
- Keep each file under ~400 KB.

---

## Global

| File | Size | Used by |
|---|---|---|
| `/images/portrait.jpg` | 1000 x 1250 (4:5) | About section portrait |
| `/images/og-image.png` | 1200 x 630 | Social share preview (Open Graph / Twitter) |

---

## Project images

Each project needs one cover plus N gallery screens. The **first gallery image
is displayed full-width at 16:9**; the rest are 4:3.

| Project | Cover (1600 x 1000) | Gallery screens (`-01` is 16:9, rest 4:3) |
|---|---|---|
| Jobero | `work/jobero-cover.jpg` | `work/jobero-01.jpg` … `-04.jpg` |
| London FRA | `work/london-fra-cover.jpg` | `work/london-fra-01.jpg` … `-05.jpg` |
| Tesla Electrics | `work/tesla-electrics-cover.jpg` | `work/tesla-electrics-01.jpg` … `-04.jpg` |
| Awal HR Management | `work/awal-hr-cover.jpg` | `work/awal-hr-01.jpg` … `-06.jpg` |
| Kyrobit | `work/kyrobit-cover.jpg` | `work/kyrobit-01.jpg` … `-03.jpg` |
| Zaratelier | `work/zaratelier-cover.jpg` | `work/zaratelier-01.jpg` … `-05.jpg` |
| EasyGiv | `work/easygiv-cover.jpg` | `work/easygiv-01.jpg` … `-03.jpg` |
| Travel Cashier | `work/travel-cashier-cover.jpg` | `work/travel-cashier-01.jpg` … `-04.jpg` |
| Medwork | `work/medwork-cover.jpg` | `work/medwork-01.jpg` … `-04.jpg` |
| World IPTV | `work/world-iptv-cover.jpg` | `work/world-iptv-01.jpg` … `-04.jpg` |
| CoresEdge | `work/coresedge-cover.jpg` | `work/coresedge-01.jpg` … `-04.jpg` |
| PatronWorks | `work/patronworks-cover.jpg` | `work/patronworks-01.jpg` … `-05.jpg` |

**65 files total** — 2 global, 12 covers, 51 gallery screens.

To change how many gallery slots a project has, edit its `gallery` count in
`src/lib/data.ts`.
