# SKILL.md

> **Repository**: health-charts
> **Description**: Interactive health data visualization dashboard for respiratory viruses
> **Tech Stack**: Node.js, pnpm, Vite, SvelteKit, svelteplot, d3-format
> **Last Updated**: 2026-05-18

---

## Overview

Interactive dashboard displaying respiratory virus trends (Flu, COVID-19, RSV) using static CDC data. Built with SvelteKit and svelteplot (Observable Plot for Svelte), deployed as a fully static site via `@sveltejs/adapter-static`. All three series are shown on the home page as normalized sparklines; clicking through to a series shows a full-height chart with metrics and a CSV export.

## Tech Stack

- **Node.js** (v18+) — JavaScript runtime
- **pnpm** — Package manager
- **Vite 8** — Build tool with HMR and optimized production builds
- **SvelteKit 2 / Svelte 5** — App framework; file-based routing, SSG via adapter-static
- **svelteplot 0.14** — Observable Plot wrapper for Svelte (line charts, axes, grid, rules)
- **d3-format** — Number formatting (`,` for counts, `.1f` for rates)
- **@sveltejs/adapter-static** — Outputs fully static site to `build/`

## Quick Start

```bash
# Install dependencies
pnpm install

# Start dev server (http://localhost:5173)
pnpm dev

# Build for production (outputs to build/)
pnpm run build

# Preview production build
pnpm run preview

# Fetch latest CDC data (saves to public/data/)
pnpm run fetch-data
```

## Project Structure

```
health-charts/
├── src/
│   ├── app.html                      # HTML shell
│   ├── app.css                       # Global styles (all components)
│   ├── lib/
│   │   └── config.js                 # Series definitions (id, color, valueKey, format, …)
│   └── routes/
│       ├── +layout.js                # Prerender config
│       ├── +layout.svelte            # Nav + footer shell
│       ├── +page.js                  # Home: loads all datasets
│       ├── +page.svelte              # Home: per-series normalized sparklines + tooltips
│       └── series/[id]/
│           ├── +page.js              # Series detail: loads single dataset
│           └── +page.svelte          # Series detail: full chart + metrics grid + CSV export
├── public/data/
│   ├── flu-cases.json                # Monthly flu data
│   ├── covid-hospitalizations.json   # Weekly COVID hospitalization counts
│   └── rsv-hospitalizations.json    # Weekly RSV rate per 100k
├── scripts/
│   ├── fetch-cdc-data.js             # Pull latest data from CDC Socrata API
│   └── setup-datawrapper.js          # Legacy — Datawrapper chart setup (unused)
├── build/                            # Static site output (gitignored)
├── svelte.config.js
├── vite.config.js
└── package.json
```

## Series Configuration

Defined in `src/lib/config.js` as `SERIES_CONFIG`:

```js
{
  flu:   { id, title, color, dataFile, valueKey: 'cases',           format: ',',  unit: 'cases',          ... },
  covid: { id, title, color, dataFile, valueKey: 'hospitalizations', format: ',',  unit: 'hospitalizations', ... },
  rsv:   { id, title, color, dataFile, valueKey: 'rate',            format: '.1f', unit: 'per 100,000',    ... },
}
```

## Home Page Chart Design

- Each series is normalized to **0–100% of its own peak** so all three fit the same Y-axis
- Y-axis labels: `0`, `50%`, `peak` (at 100)
- RSV panel shows a contextual annotation: *"Peak X/100k · est. Y total hospitalizations vs. COVID-19 peak of Z/wk"* — computed live from the data, using the US population multiplier (rate × 3,300)
- Hover tooltip uses `position: fixed` with `clientX`/`clientY` so it escapes all nested `overflow: hidden` clipping contexts; flips to the left of the cursor past 60% viewport width

## Key Commands

```bash
pnpm dev              # Start dev server (localhost:5173)
pnpm run build        # Build static site → build/
pnpm run preview      # Preview build (localhost:4173)
pnpm run fetch-data   # Fetch latest CDC data → public/data/
```

## Adding a New Series

1. Add `public/data/new-series.json` — format: `[{ "date": "YYYY-MM-DD", "valueKey": number }]`
2. Add an entry to `src/lib/config.js` (`SERIES_CONFIG`)
3. The home page and routing pick it up automatically

## Data Sources

All data from CDC via Socrata Open Data API:

| Dataset      | API Endpoint | Metric                   | Coverage  |
| ------------ | ------------ | ------------------------ | --------- |
| **COVID-19** | `7dk4-g6vg`  | Weekly hospitalizations  | 2020–2024 |
| **RSV**      | `29hc-w46k`  | Rate per 100k population | 2020–2024 |
| **Flu**      | Sample data  | Monthly cases            | 2020–2024 |

See [DATA_SOURCES.md](./DATA_SOURCES.md) for full API documentation.

## Troubleshooting

**Port in use**: `lsof -ti:5173 | xargs kill -9` or `pnpm dev -- --port 3000`

**Data not loading**: Verify files exist in `public/data/`, validate JSON structure matches `valueKey` in config

**Build fails**: `rm -rf node_modules build .svelte-kit && pnpm install && pnpm run build`

**Svelte 5 `$derived` block form**: Use `$derived.by(() => { ... })` — the IIFE form `$derived(() => {})()` is invalid

## Resources

- [SvelteKit docs](https://svelte.dev/docs/kit) | [Svelte 5 runes](https://svelte.dev/docs/svelte/what-are-runes)
- [svelteplot](https://svelteplot.dev/) | [Observable Plot](https://observablehq.com/plot/)
- [d3-format](https://d3js.org/d3-format) | [pnpm](https://pnpm.io/)
- [CDC Data Portal](https://data.cdc.gov/) | [Socrata API](https://dev.socrata.com/)
