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
  route to `html[data-sky]` so a page can tune the background in CSS (empty for now).
- `src/components/Atmosphere.jsx` + `src/styles/atmosphere.css` — the shared background:
  90 twinkling stars (upper half, `--star-boost` lets a page brighten them), the fog video
  (`public/fx/Fog-Loop.mp4`, slowed to 0.6x, masked into the lower 60%), the `#vintage-print` SVG ink
  filter (used by `.ink`) and the film-grain overlay (`public/fx/noise.gif` + SVG noise).
- `src/components/Nav.jsx` — the fixed top nav. Pages in `src/pages/` are placeholders (title only).
- Fonts: Ransite Medieval (local, titles/nav only — its E, I and L read as C, 1, C) and EB Garamond.

Left in the prototype for later steps: the small crescent moon, deep stars + milky way (Skills mood),
the forest/castle backdrop, rarity colours, stone textures/ornaments, all page content.

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

Before going live: Ransite licence ("PERSONAL USE"), compress `Fog-Loop.mp4` (18 MB), deployment
base path if served from a sub-path.
