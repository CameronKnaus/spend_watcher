# SpendWatcher — web app UI kit

A high-fidelity, interactive recreation of the SpendWatcher web app, rebuilt from the real codebase ([`CameronKnaus/spend_watcher`](https://github.com/CameronKnaus/spend_watcher), `ui/src`). It mirrors the app's structure, components, tokens, and copy — but is cosmetic only (no backend, no real persistence).

## Run it
Open `index.html`. You land on the **login** screen → press **Submit** to enter the app. The thin left **nav rail** expands on hover; switch between **Dashboard**, **Savings**, and **Trends** (Recurring & Trips are stubbed). Press **Log expense** (or tap any transaction) to open the slide-up form.

## Files
| File | What it is |
|---|---|
| `index.html` | Entry point — loads React + Babel, tokens, `icons.js`, `data.js`, then the JSX below. |
| `Icon.jsx` | `<Icon name>` inline-SVG component + `CategoryIcon` chip + spend/account category → icon/color maps. |
| `primitives.jsx` | `ModuleContainer` (tile), `CustomButton`, `Currency`/`formatCurrency`, `SectionHeader`, `Segmented`, `InteractiveRow`, `AlertMessage`, `SlideUpPanel`. |
| `Nav.jsx` | `DesktopNav` — the 68px fixed rail that springs open to labels, with the green selection dot. |
| `Dashboard.jsx` | `DashboardPage` — summary totals, top-discretionary percentage bar, recent transactions, accounts list. |
| `Savings.jsx` | `SavingsPage` — net worth + sparkline, accounts total, totals by account type. |
| `Trends.jsx` | `TrendsPage` — Yearly/Monthly category table with percentage bars. |
| `Auth.jsx` | `AuthScreen` — login / register card. |
| `App.jsx` | App shell: auth gate, top bar, nav, page routing, log-expense panel. |
| `data.js` | Invented annual fixture (`window.DASH_DATA`, `window.CATEGORIES`). |

## Fidelity notes
- **Tokens, copy, layout, and component shapes** are lifted from the repo (`Content/english.ts`, `*.module.css`, the `Dashboard`/`Savings`/`Trends` pages, `ModuleContainer`, `CustomButton`, `InteractiveRow`, `AlertMessage`, the desktop nav).
- **Components are simplified, mainly-cosmetic versions** — they reproduce the look and key interactions, not the production logic (services, react-query, forms, routing).
- **Icons** come from the design system's self-hosted `assets/icons.js` (see `../../assets/ICON_MAP.md`), not `react-icons`.
- **The top bar** (logo + sync + avatar) is a light brand anchor; the real app puts the page title in a `PageContainer` and has no global header. Everything else follows the repo.
- All numbers are fixture data.
