---
name: spendwatcher-design
description: Use this skill to generate well-branded interfaces and assets for SpendWatcher, a personal spending and savings tracker, either for production or throwaway prototypes/mocks/etc. Contains essential design guidelines, colors, type, fonts, assets, and UI kit components for prototyping.
user-invocable: true
---

Read the `README.md` file within this skill, and explore the other available files.

If creating visual artifacts (slides, mocks, throwaway prototypes, etc), copy assets out and create static HTML files for the user to view. If working on production code, you can copy assets and read the rules here to become an expert in designing with this brand.

If the user invokes this skill without any other guidance, ask them what they want to build or design, ask some questions, and act as an expert designer who outputs HTML artifacts _or_ production code, depending on the need.

## What's here
- `README.md` — product context, content fundamentals, visual foundations, iconography, and an index of everything. **Start here.**
- `colors_and_type.css` — the canonical token sheet (colors, type scale, shadows, radii, layout). **Import it in every artifact**; reference `--token-*` semantics, not raw hex.
- `fonts/Inter.ttf` — the brand typeface (referenced by the CSS).
- `assets/` — `spendwatcher-logo.png`, `icons.js` (self-hosted inline-SVG icon set — call `swIcon(name, size, color)`), and `ICON_MAP.md` (category → icon → color table).
- `preview/` — small specimen cards for colors, type, elevation, and components.
- `ui_kits/web-app/` — an interactive recreation of the app (React + JSX). Lift its components for new screens.

## Quick rules
- Soft, cool, tidy. Lighter-than-page tiles (`--token-color-background-primary`) float on a slightly darker page (`--token-color-background-secondary`) via cool multi-stop shadows — **no borders on cards**.
- Green (`#43a875`) is the only loud brand color; blue = info, red = expense/loss. Money is the hero: thin (300), large, tabular, colored green-gain / red-loss; render absent values as `--`.
- Inter only, sentence case everywhere, second-person voice, no emoji. Verbs for buttons, noun phrases for labels.
- Category = one fixed color + one fixed icon, shown as a 12px-rounded chip with a near-white glyph.
- Radii 4/8/12/16/pill. Buttons hover one shade deeper (no scale); nav icons scale 1.2× with a green selection dot.
- Use `assets/icons.js` for icons — never hand-draw SVG or use emoji.
