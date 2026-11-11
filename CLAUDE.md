# Fantasy Portfolio — the definitive version

Mathijs van der Meijde's portfolio in a dark-fantasy style (after his project The Arcane Archive).

The AI-generated prototype in `~/Code/Portfolio-V2` is **inspiration, not a template**. Read its
`CLAUDE.md` for history, the user's taste and hard-won technical notes. Do not copy it wholesale:
we move over one piece at a time and adjust it as we go.

## Roadmap (in order)

1. **Background** — get the sky/fog/grain exactly as the user envisions it. ← current step
2. Transfer and update the Projects section (trading cards).
3. A brand-new Home page.
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
  route to `html[data-sky]` so a page can tune the background in CSS (`/skills` → `"skills"`).
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
    18 MB original is in Portfolio-V2), the `#vintage-print` SVG ink filter (`.ink`)
    and the film-grain overlay (`public/fx/noise.gif` + SVG noise).
- Background tuning: every brightness/opacity/fog/glow value is a `--bg-*` variable in `:root` at the
  top of `atmosphere.css` (the single source of truth; current values were picked by the user).
  `src/components/DebugPanel.jsx` shows sliders for them (persists tweaks in localStorage, "Copy
  values"). It is switched off via `SHOW_BG_DEBUG = false` in `App.jsx`; when on it still only
  loads in `npm run dev`. When the user reports values, write them into the `:root` defaults.
- `src/components/Nav.jsx` — the fixed top nav. Pages in `src/pages/` are placeholders (title only).
- Fonts: Ransite Medieval (local, titles/nav only — its E, I and L read as C, 1, C) and EB Garamond.

Left in the prototype for later steps: rarity colours, stone textures/ornaments, all page content.

## Rules carried over from the prototype (don't regress)

- No background on `<body>` — it paints over the negative z-index sky layers. Night lives on `<html>`.
- 60fps is a hard requirement: animate only `transform`/`opacity`; no animated filters; no
  `drop-shadow`/SVG filters on repeated or animated elements; `.ink` only on large static titles.
- Respect `prefers-reduced-motion` (MotionConfig + CSS media queries).
- StrictMode runs `useState` initialisers twice: no storage writes in them.
- The user's taste: fantasy (not D&D), hand-made rather than "AI-ish" (no spaced-caps kickers,
  italic ledes, sprinkled glows, invented flavour text), brief focused pages, the user's own copy.
- Verify in the browser at ~1280x800 and 375x812 and measure frame times for anything animated.
  The user decides when to commit/push.

Before going live: Ransite licence ("PERSONAL USE"), deployment base path if served from a sub-path.
