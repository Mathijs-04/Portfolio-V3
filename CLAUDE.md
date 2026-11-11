# Fantasy Portfolio — the definitive version

Mathijs van der Meijde's portfolio in a dark-fantasy style (after his project The Arcane Archive).

The AI-generated prototype in `~/Code/Portfolio-Prototype/Portfolio-V3-Prototype` (called
"Portfolio-V2" in older notes) is **inspiration, not a template**. Read its
`CLAUDE.md` for history, the user's taste and hard-won technical notes. Do not copy it wholesale:
we move over one piece at a time and adjust it as we go.

## Roadmap (in order)

1. **Background** — sky/fog/grain. Done.
2. **Projects** (trading cards) ← current step. Cards, rarity tiers, detail view and the real
   data (27 projects from the original portfolio + a PLACEHOLDER "Fantasy Portfolio" card for this
   site, rarities set by the user), sorting and the deal-in are in. Still open: real
   texts/images for the Fantasy Portfolio card.
3. **Home** — started early: name, role and an "Explore my work" button. Will be redesigned.
4. Transfer and update the Skills section (constellations).
5. A brand-new About page.

## Running

```bash
npm install
npm run dev      # http://localhost:5180 (own port, so it runs next to the prototype on 5173)
npm run build
```

Vite 6 + React 18 + react-router 7 + framer-motion 11, plain CSS (one file per area in `src/styles/`).

## What is here so far

- `src/App.jsx` — router (Home/Projects/Skills/About), a Layout that keeps the sky and nav mounted,
  0.3s fade-out → scroll to top → 0.5s fade-in between pages, document titles. `SKY_MODES` maps a
  route to `html[data-sky]` so a page can tune the background in CSS. The `"skills"` mode (milky
  way, deep stars, less fog) is switched off for now: the user wants Skills to look like the other
  pages until the Skills section is built.
- `src/components/Atmosphere.jsx` + `src/styles/atmosphere.css` — the shared background:
  - stars: 200 near stars + 170 deep stars (deep ones and the milky way only show with
    `data-sky="skills"`), both spread over the top 85% so they run down behind the mountains.
    Generated from a fixed seed (`SKY_SEED`): steep brightness curve (many faint, few bright, the
    brightest get `.star--bright` glow), ~35% in loose clusters, dimmer and more twinkly towards
    the horizon. Black and white only: the user does not want blue or yellow stars.
    `.starfield__sky` has a radial mask that keeps a star-free circle around the moon.
    `--star-boost` scales star brightness per page.
  - `ShootingStar.jsx`: an occasional falling star (random place/angle/gap, Web Animations API on
    transform/opacity), styled like the stars and inside the same mask.
  - the crescent moon (`--moon-size/top/right` on `.starfield`, shared with the mask), with a few
    soft grey maria + multiplied noise grain, and `.starfield__halo`. Kept minimal on purpose.
  - backdrop `public/fx/Background.webp` (mountains, forest, castle; the user's own image): a
    full-opacity night-coloured silhouette (`.forest__occluder`, the image as a mask) hides stars
    behind the mountains, with the artwork on top at 26% opacity (meant to stay vague) and a faint
    horizon glow under the silhouette. `.forest__frame` is `max(70% height, full width)` so
    ultrawide screens are covered.
  - the fog video (`public/fx/Fog-Loop.mp4`, 1280x720 H.264, 3.4 MB, played at 0.6x; the 1080p
    18 MB original is in the prototype), the `#vintage-print` SVG ink filter (`.ink`)
    and the film-grain overlay (`public/fx/noise.gif` + SVG noise).
- Background tuning: every brightness/opacity/fog/glow value is a `--bg-*` variable in `:root` at the
  top of `atmosphere.css` (the single source of truth; current values were picked by the user).
  `src/components/DebugPanel.jsx` shows sliders for them (persists tweaks in localStorage, "Copy
  values"). It is switched off via `SHOW_BG_DEBUG = false` in `App.jsx`; when on it still only
  loads in `npm run dev`. When the user reports values, write them into the `:root` defaults.
- `src/components/Nav.jsx` — the fixed top nav. Skills and About in `src/pages/` are placeholders.
- `src/components/Button.jsx` + `button.css` — the site button (dark plaque, double rule, gothic
  corner brackets, Ransite label, grime). Used on Home; *not* on the cards (they have their own).
- Fonts: Ransite Medieval (local, titles/nav only — its E, I and L read as C, 1, C) and EB Garamond.
- `html` has `scrollbar-gutter: stable`, so locking scroll (card inspector) doesn't shift the page.

### Projects (trading cards)

- `src/data/projects.js` — all 27 projects, in the order of the original portfolio's overview
  (`~/Code/Portfolio/Portfolio`, `src/pages/Projects.jsx` + `src/pages/projects/*.jsx`).
  Shape: `slug, name, rarity, order` (chronological, 1 = oldest; for sorting later, not the
  display order), `tagline, tech[], cover` (640px thumbnail in `public/projects/thumbs/`),
  `images[]` (full size, the gallery), `lore[]` (2 paragraphs), `links[]` (`{ label, href,
  kind: "code" | "live" }`, max 2). Rarities were chosen by the user. Texts were rewritten from
  the originals to a similar length (~60–160 words) and tone, without adding new claims; tech
  lists were checked against the repos. Images over 1 MB were re-encoded at 2560px (WebP q85).
- `pages/Projects.jsx` — header with the sort dropdown, the deck (4 across, 2 below 900px; 28
  cards so rows stay full) and the portalled inspector. `SORTS`: default (data order), rarity,
  date (`order`) and name, each ascending/descending; stable, so ties keep the default order.
  Cards glide to their new place via framer `layout="position"` on the `<li>`.
  `useDealIn`: one IntersectionObserver deals each card in once as it scrolls into view (CSS
  transition on `opacity` + the individual `translate`/`rotate` properties, 70ms stagger per
  batch). It must not use `transform`: framer owns that on the `<li>` for the reorder.
  Changing the sort calls `dealAll()` first: cards that glide into view are not reported by the
  observer, so every undealt card is shown at once (this was a bug: gaps after sorting).
- `SortSelect.jsx` — the dropdown: an accessible listbox (arrows/Home/End/Enter/Esc, click
  outside closes), dark plaque with a double rule; the chosen option has a small diamond.
- `ProjectCard.jsx` — tilt (`useTilt.js`, CSS vars, no re-renders), click/Enter opens. Measures the
  untransformed `.deck__slot`, not the (lifted/tilted) card, as the flight origin.
- `CardFace.jsx` — the front, all sized in `cqw`: stone surface + grime (kept to the edges so text
  stays readable), double-ruled frame, corner ornaments, rarity stone (`Gem.jsx`: an oval stone in
  a clawed mount of the card's ink), art (full colour, no filter), tagline, tech tiles, rarity
  label. Tech tiles: max 6, the last becomes "+N" when there are more. `children` render on the
  stone behind the content (used for legendary embers).
- `TechIcon.jsx` — tech name → react-icons (Simple Icons for brands, Tabler/Game icons otherwise;
  unknown names get a hexagon). Every tech in the prototype's data is mapped. Single colour.
- Rarity tiers (the user approved this balance; keep the steps distinct):
  common = plain stone; rare = blue steel (steel frame/ornaments, static sheen, faint resting
  foil); epic = arcane (violet frame/ornaments, violet-lit art window, `.face__arcane` glow that
  breathes via opacity); legendary = obsidian + gold (light sweep every 7s, 10 embers behind the
  art/text, strongest aura). Legendary's foil is kept soft so the gold text stays readable.
  No cursor-following glare: the user removed it.
- `CardInspector.jsx` — flies the card to the centre and flips it (spring); closing tweens back
  (exact landing). Only the veil fades: the card stays opaque until it lands, then the grid card is
  shown. Backdrop closes only if the press both starts and ends on it (gallery swipes end outside).
- `CardBack.jsx` — rarity, name, tagline, gallery, lore (scrolls inside the frame), full tech list
  with icons, and `CardLink`s: a hand-cut double-ruled plate in the rarity's frame colour with
  small corner brackets and grime, icon + EB Garamond label; hover/focus fills with the frame
  colour. (The user rejected arrows, the site button and side diamonds here.)
- `CardGallery.jsx` — images slide (framer, transform only) on swipe/drag, ←/→ keys or the
  thumbnails (centred, wrapping); loops; small "n / total" counter. No arrow buttons.

Left in the prototype for later steps: real project data and images, deal-in, Skills → Projects
"summon" link, all other page content.

## Rules carried over from the prototype (don't regress)

- No background on `<body>` — it paints over the negative z-index sky layers. Night lives on `<html>`.
- 60fps is a hard requirement: animate only `transform`/`opacity`; no animated filters; no
  `drop-shadow`/SVG filters on repeated or animated elements; `.ink` only on large static titles.
- Respect `prefers-reduced-motion` (MotionConfig + CSS media queries).
- StrictMode runs `useState` initialisers twice: no storage writes in them.
- The user's taste: fantasy (not D&D), hand-made rather than "AI-ish" (no spaced-caps kickers,
  italic ledes, sprinkled glows, invented flavour text), brief focused pages, the user's own copy.
- Verify in the browser at ~1280x800 and 375x812 and measure frame times for anything animated.
  The browser pane often runs as a background page (rAF ~1 frame per 2s): only trust frame times
  when `document.visibilityState` is "visible". The user decides when to commit/push.

Before going live: Ransite licence ("PERSONAL USE"), deployment base path if served from a sub-path.
