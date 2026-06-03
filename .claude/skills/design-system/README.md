# SpendWatcher Design System

SpendWatcher is a **personal spending and savings tracker** — a web app where one person logs expenses, watches recurring bills, tracks account balances and net worth, groups travel spend into trips, and reviews where their money went through charts and trends. The product is calm, data-dense, and utilitarian: soft elevated tiles on a cool off-white page, a quiet green accent, and a rainbow of fixed category colors that turn dry numbers into something legible at a glance.

This design system packages SpendWatcher's real visual foundations (color, type, elevation, shape), its component vocabulary, and a working UI-kit recreation of the app, so design agents can produce on-brand SpendWatcher screens, mocks, and assets.

> **Source of truth:** everything here is lifted from the live codebase, not guessed. Tokens are copied verbatim from the repo's CSS. Where this system substitutes anything, it is flagged inline and in the Caveats.

---

## Sources

- **Primary repo (source of truth):** [`CameronKnaus/spend_watcher`](https://github.com/CameronKnaus/spend_watcher) — React + TypeScript front-end (`ui/src`). Color/type/shadow tokens, components, pages, and copy were all read from here.
  - Tokens: `ui/src/Styles/Global/{ColorScheme,Typography,Shadows}.css`
  - Components: `ui/src/Components/*` (CustomButton, ModuleContainer, InteractiveRow, AlertMessage, Navigation, Currency, icon mappers…)
  - Pages: `ui/src/Pages/*` (Dashboard, AuthScreen, Savings, Trends, Trips, RecurringSpending)
  - Copy: `ui/src/Content/english.ts`
- **Related repo:** [`CameronKnaus/spend-watcher-frontend`](https://github.com/CameronKnaus/spend-watcher-frontend) (default branch `develop`) — a parallel/earlier front-end. Not used directly here; explore it for additional context.
- **Uploaded session files** (`uploads/`) — a prior Claude design session produced a charts-heavy "Spending insights" dashboard and a verbatim token export. The token file was reused; the bespoke dashboard charts were treated as an *extension*, not canon.

Anyone extending this system should browse the repos above to pull additional components or screens at higher fidelity.

---

## Content fundamentals

How SpendWatcher writes, drawn from `Content/english.ts` and component copy.

**Voice — plain, calm, second person.** Copy speaks *to* the user as "you / your": "You have no transactions this month.", "Your accounts", "Your current trip…". It never uses "I" or brand-as-personality. It states facts, not encouragement — there is no gamified cheerleading.

**Casing — sentence case, everywhere.** Headings, buttons, labels, and titles are all sentence case: "Total spent", "Recurring spending", "Add account", "Log expense", "Net worth". Almost nothing is Title Cased. ALL-CAPS is reserved for tiny eyebrow/section labels styled in CSS (uppercase + letter-spacing), not written in the copy itself.

**Labels are nouns; buttons are verbs.** Data labels are short noun phrases ("Discretionary total", "Top discretionary categories", "Accounts total"). Actions are imperative verb phrases ("Log expense", "Add trip", "Stop tracking", "Delete account", "Confirm change").

**Tone in destructive flows — direct and a little protective.** Delete/deactivate copy is honest about consequences and offers the gentler alternative: "This will permanently delete this account and all of its data. If you wish to keep this data, instead consider setting this account as inactive…", followed by a blunt "This action cannot be undone." Speed bumps are headed "Are you sure?".

**Numbers carry the meaning.** Money is the hero. Amounts are formatted as USD, shown thin-weight and large, and colored by gain/loss semantics (green up, red down). Empty/unknown values render as `--` (the literal `empty: '--'` token), never "N/A" or "0" when data is absent.

**Interpolation style.** Dynamic copy uses `{{0}}` placeholders: "{{0}} overview" → "October overview", "As of {{0}}", "{{0}} - Today". Dates read naturally ("Oct 14th", "MMM do").

**No emoji in product copy.** The shipped app expresses category through colored glyph icons, not emoji. (The uploaded session fixture used emoji glyphs as a shortcut — that is *not* the real product; use the icon set instead.)

**Vibe:** a competent personal-finance dashboard that respects your attention — quiet, factual, legible, never salesy.

---

## Visual foundations

**Overall feeling.** Soft, cool, and tidy. Light "tiles" (cards) float on a slightly darker page via gentle multi-stop shadows. Nothing is loud except the data. The only saturated brand color is a friendly green; a blue and a red round out the semantic set; category colors supply controlled bursts of hue.

**Color.**
- *Neutrals* run from near-black `#333` (text) up through a cool, faintly teal-tinted greyscale to white. The greys are not neutral-grey — they carry a subtle blue/green cast (e.g. `#64767d`, `#c3d4da`, `#e2eef3`, `#f0f7f9`). This is what gives the UI its calm, slightly cold cleanliness.
- *Primary* is green (`--theme-color-primary-500: #43a875`) — used for CTAs, the nav selection dot, gains, success, and "addition" semantics.
- *Secondary* is blue (`#268fba`) — info, secondary buttons.
- *Tertiary* is red/pink (`#ed0c3f` → `#fa3360`) — expenses, loss, danger, urgent CTAs.
- *Page vs tile:* page background is `neutral-800` (`#f0f7f9`); tiles/cards are `neutral-900` (`#f8fbfc`) — the card is *lighter* than the page, the opposite of a typical dark-card-on-white pattern. Lift comes from shadow, not from a darker surface.
- *Category colors:* a fixed 28-entry palette (Housing slate-blue, Groceries green, Restaurants orange, Travel green, Entertainment magenta, Utilities cyan, Health deep-red…). These are semantic constants — a category is *always* the same color across charts, icons, and bars.

**Typography.** A single family does everything: **Inter** (variable, weights 300–600), with system sans fallbacks (`'Trebuchet MS', 'Lucida Grande'…`). Mono (`source-code-pro`/Menlo) only for incidental code. Weights are restrained — **thin 300** for big numbers, **regular 400** body, **medium 500** for headings/labels, **semi-bold 600** for emphasis and active states. There is no bold-700, no display serif, no second family. Big monetary figures are deliberately *thin and large* (e.g. 32px / weight 300) — elegant, not heavy. Size ramp is a fixed scale from `--font-caption: 12px` to `--font-display-large: 60px`.

**Spacing & layout.** Page max-width 1440px, side padding 24px, mobile breakpoint 768px, min supported width 375px. Tiles use compact internal padding (≈10–18px vertical, 16–20px horizontal). Gaps cluster around 8 / 12 / 16 / 24px. Layout is flex-wrap based and responsive rather than a rigid grid. The desktop nav is a **fixed 68px rail** on the left that springs open to a labeled menu on sustained hover.

**Shape / corner radii.** Soft but not pill-everything. `--radius-xs 4px` (tag chips), `--radius-sm 8px` (cards, alerts, secondary buttons, the percentage bar), `--radius-md 12px` (primary buttons, module containers, category icons), `--radius-lg 16px` (auth card, percentage-bar wrap), and `--radius-pill 9999px` (filter chips, nav selection dot). Category icons are 12px-rounded squares, *not* circles.

**Elevation / shadows.** The signature: layered, low-opacity, **cool-grey** shadows (`--shadow-color: 194deg 13% 70%` — a desaturated blue-grey, never pure black). Three named ramps — `low` (3 stops), `medium` (4 stops), `high` (7 stops) — each a finely-tuned multi-layer drop shadow that fakes realistic light falloff. Cards pick a ramp by importance (the "Total spent" tile sits at `medium`, supporting tiles at `low`). There are essentially no borders on cards — separation is shadow, not stroke. Where borders exist (nav edge, inputs, auth card) they are 1px in a light neutral.

**Borders & dividers.** Hairlines in `neutral-500/600/700`. Inputs are *underline-only* (border-bottom), centered text, no box. The header rule and nav edge are single light hairlines.

**Backgrounds.** Flat color only — no gradients on surfaces, no imagery, no textures, no patterns. The single gradient in the system is functional: the stacked **percentage bar** that blends adjacent category colors left-to-right. Otherwise: solid `neutral-800` page, solid lighter tiles.

**Animation.** Purposeful and physical, via `@react-spring/web`. The nav rail expands with a slight mass/overshoot spring and chained text fade. Hover transitions are ~0.3–0.4s. The category "recurring" refresh icon has a playful keyframed over-rotation (`rotating` — spins 720°+ with an anticipatory back-swing). Motion is smooth and soft; no harsh linear snaps, no gratuitous looping decoration on content.

**Hover / press states.**
- *Buttons:* hover shifts the fill one primitive step **darker/deeper** (primary 500→400, secondary 200→100, tertiary 500→400) over 0.3s. No scale on buttons.
- *Nav items:* hover **scales the icon 1.2×** and darkens the label to near-black; the active route shows a green circle (`selectionBackground`) behind the icon.
- *Rows:* interactive rows reveal a right chevron and are fully clickable; some expose a green CTA footer bar.
- *Disabled:* fill swaps to a flat neutral-400, no hover.

**Transparency & blur.** Used sparingly. Active filter chips use the category color at ~12% alpha (`color + '20'`) as a tint behind a full-color border + dot. Sparkline area fills sit at ~12% opacity. No glassmorphism, no backdrop blur in the core app.

**Imagery.** The brand is essentially imagery-free — it's a numbers tool. The one raster asset is the app logo (a green circular badge of stacked dollar bills/coins). No photography, no illustration library, no hero images. Color and iconography do the expressive work.

**Cards, in one line:** lighter-than-page surface, 12px radius, no border, cool multi-stop shadow chosen by importance, compact padding, a medium-weight heading and content below.

---

## Iconography

SpendWatcher uses the **[`react-icons`](https://react-icons.github.io/react-icons/)** library, drawing from two sets:

- **Font Awesome (free, solid)** — `FaHome`, `FaHistory`, `FaChartPie`, `FaPlaneDeparture`, `FaChevronRight`, `FaInfoCircle`, `FaCar`, `FaGasPump`, `FaTshirt`, `FaGift`, `FaDollarSign`, `FaCannabis`, `FaSmoking`, `FaCookieBite`, `FaMoneyBillAlt`, `FaChargingStation`…
- **Material Design icons** — `MdSavings`, `MdFastfood`, `MdLocalGroceryStore`, `MdTrain`, `MdMovieFilter`, `MdWaterDrop`, `MdFitnessCenter`, `MdHealing`, `MdSchool`, `MdShoppingBag`, `MdHotel`, `MdLocalAirport`, `MdPets`, `MdRefresh`, `MdBrush`, `MdContentCut`, `MdBusinessCenter`, `MdShield`, `MdSportsBar`, `MdVideogameAsset`…

**Style:** glyph icons, **solid/filled** (FA "solid" + Material filled), monochrome, sized by font-size. There is no custom SVG illustration set and no outline-only icon style. Stroke vs fill is consistently *filled*.

**Category icons** are the system's most distinctive icon usage: each spending category maps to one fixed icon **and** one fixed color (`spendCategoryIconMapper` + `spendCategoryColorMapper`). They render as a **rounded-square (12px) chip** filled with the category color, the glyph knocked out in a near-white "category-icon" token (`--token-color-category-icon: #f8fbfc`). Size is configurable; the glyph is 0.65× the chip. Recurring categories can overlay a small spinning `MdRefresh` badge.

**Navigation icons** sit in a 36px box and scale 1.2× on hover; the active item gets a green circle behind it.

**Emoji:** not used in the real product. (The uploaded fixture's emoji glyphs are a stand-in only.) **Unicode glyphs:** the only literal-character "icon" is `--` for empty values and the chevron/arrow indicators rendered as real icons.

**This system's icon approach:** because cross-origin icon *fonts* don't load in every sandbox (and don't embed in screenshot captures), this kit ships a **self-hosted inline-SVG icon set** at `assets/icons.js` — faithful filled reproductions of the app's react-icons glyphs. Call `swIcon('house', 20, '#fff')` in plain HTML, or use `<Icon name="house" />` in the UI kit. See `assets/ICON_MAP.md` for the category → icon → color table.

---

## Index / manifest

Root files:
- **`README.md`** — this file.
- **`colors_and_type.css`** — the canonical token sheet (primitives `--theme-*`, semantics `--token-*`, type scale, shadows, radii, layout vars) + base element styles and the `.tile` idiom. Copied verbatim from the repo. **Import this in every SpendWatcher artifact.**
- **`SKILL.md`** — Agent-Skill manifest so this system works as a downloadable Claude skill.

Folders:
- **`fonts/`** — `Inter.ttf` (variable). Referenced by `colors_and_type.css`.
- **`assets/`** — `spendwatcher-logo.png` (app logo), `ICON_MAP.md` (category icon/color reference).
- **`preview/`** — small HTML specimen cards that populate the Design System tab (colors, type, elevation, components…).
- **`ui_kits/web-app/`** — the high-fidelity recreation of the SpendWatcher web app. Open `index.html`. See its own `README.md`.

---

## Caveats & substitutions

- **Icons are self-hosted inline SVG** (`assets/icons.js`), not the original `react-icons` font glyphs. They are faithful filled reproductions chosen so everything renders offline and in captures; a few category glyphs are close stand-ins rather than pixel-identical to the FA/Material originals.
- **The uploaded "Spending insights" charts dashboard is an extension, not canon.** It's a rich, beautiful charts page from a prior session, but it isn't a screen that exists in the repo. The category emoji used there are not the real icon system. Treat the repo's Dashboard/Savings/Trends/Trips as canonical structure.
- **Inter is the real font** (bundled `.ttf`), so no substitution there.
- Data shown anywhere is invented fixture data.
