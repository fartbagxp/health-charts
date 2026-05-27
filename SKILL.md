# SKILL.md

> **Repository**: health-charts
> **Description**: Interactive health data visualization dashboard
> **Tech Stack**: Node.js, pnpm, Vite, SvelteKit, svelteplot, d3-format
> **Last Updated**: 2026-05-27

---

## Overview

Static dashboard displaying U.S. health trends across 19 series: respiratory virus hospitalizations, vaccination coverage, nursing home vaccination, birth rates, mortality rates, and annual totals. Built with SvelteKit and svelteplot (Observable Plot for Svelte), deployed as a fully static site via `@sveltejs/adapter-static`. Data is fetched from raw GitHub CSVs at build time (prerendered) — no local data files, no runtime API calls.

## Tech Stack

- **Node.js** (v18+) — JavaScript runtime
- **pnpm** — Package manager
- **Vite** — Build tool with HMR and optimized production builds
- **SvelteKit 2 / Svelte 5** — App framework; file-based routing, SSG via adapter-static
- **svelteplot 0.14** — Observable Plot wrapper for Svelte (line charts, axes, grid, rules)
- **d3-format** — Number formatting (`,` for counts, `.1f` for rates, `.2f` for percentages)
- **@sveltejs/adapter-static** — Outputs fully static site to `build/`

## Quick Start

```bash
pnpm install          # Install dependencies
pnpm dev              # Start dev server (http://localhost:5173)
pnpm run build        # Build for production → build/
pnpm run preview      # Preview production build (http://localhost:4173)
```

## Project Structure

```
health-charts/
├── src/
│   ├── app.html                      # HTML shell
│   ├── app.css                       # Global styles
│   ├── lib/
│   │   └── config.js                 # All series definitions + CATEGORIES
│   └── routes/
│       ├── +layout.js                # prerender = true
│       ├── +layout.svelte            # Nav + footer shell
│       ├── +page.js                  # Home: fetches all datasets at build time
│       ├── +page.svelte              # Home: sparkline grid with hover tooltips
│       └── series/[id]/
│           ├── +page.js              # Detail: fetches single dataset at build time
│           └── +page.svelte          # Detail: full chart + metrics grid + CSV export
├── scripts/
│   └── fetch-cdc-data.js             # Legacy Socrata API fetcher (unused in current build)
├── build/                            # Static output (gitignored)
├── svelte.config.js
├── vite.config.js
└── package.json
```

## Data Pipeline

All data lives in a separate repo (`fartbagxp/health`). The app fetches CSVs directly from `raw.githubusercontent.com` at build time — SvelteKit prerendering embeds the responses in the static HTML output. No `public/data/` directory, no runtime fetches.

Three base URL constants in `config.js`:
```js
const RAW_BASE    = 'https://raw.githubusercontent.com/fartbagxp/health/main/data/raw/resp';
const WONDER_BASE = 'https://raw.githubusercontent.com/fartbagxp/health/main/data/raw/wonder';
const CDC_OPEN_BASE = 'https://raw.githubusercontent.com/fartbagxp/health/main/data/raw/cdc_open';
```

## Series Configuration

All series are defined in `src/lib/config.js` as `SERIES_CONFIG`. Each entry supports:

```js
{
  id: 'series-id',
  title: 'Display Title',
  description: 'One-line description',
  color: '#hex',
  csvUrl: `${BASE}/file.csv`,      // single CSV
  csvUrls: [`${BASE}/a.csv`, ...], // OR multiple CSVs (flatMap'd together)
  dateKey: 'column_name',          // column containing the date/year/quarter
  dateFormat: 'quarter' | 'year',  // omit for ISO date strings
  valueKey: 'column_name',         // column to plot
  filters: { column: 'value' },    // optional: row must match all filters
  unit: 'per 100,000',
  format: '.1f',                   // d3-format string
  source: 'CDC NCHS',
  frequency: 'Weekly' | 'Quarterly' | 'Annual',
  category: 'Category Name',
  yDomain: [0, 100],               // optional: fixed Y axis range
}
```

### Date Format Notes

| `dateFormat` | Example value  | Parsed as              |
| ------------ | -------------- | ---------------------- |
| _(omitted)_  | `"2024-11-02"` | `new Date(str)`        |
| `'quarter'`  | `"2024 Q3"`    | `new Date(2024, 6, 1)` |
| `'year'`     | `"2023"`       | `new Date(2023, 0, 1)` |

### Current Series (19 total)

| Category                 | Series                                                                                                                       |
| ------------------------ | ---------------------------------------------------------------------------------------------------------------------------- |
| Hospitalizations         | `flu`, `covid`, `rsv`                                                                                                        |
| Respiratory Mortality    | `resp-deaths-flu`, `resp-deaths-covid`, `resp-deaths-rsv`                                                                    |
| Vaccination Coverage     | `vacc-flu`, `vacc-covid`, `vacc-rsv`                                                                                         |
| Nursing Home Vaccination | `nursing-flu`, `nursing-covid`, `nursing-rsv`                                                                                |
| Birth & Mortality        | `births-annual`, `birth-rate`, `deaths-annual`, `deaths-circulatory`, `deaths-cancer`, `deaths-respiratory`, `mortality-all` |

## Adding a New Series

1. Find a CSV in `fartbagxp/health` (or add one there)
2. Inspect the CSV headers and a sample row to identify `dateKey`, `valueKey`, and any `filters` needed
3. Add an entry to `SERIES_CONFIG` in `src/lib/config.js`
4. Add the series `id` to one or more entries in the `CATEGORIES` array at the bottom of `config.js`
5. Run `pnpm run build` to verify — the series detail page and home sparkline are generated automatically

No local data files needed. The CSV URL is fetched at build time.

## Troubleshooting

**Flat line / no x-axis**: CSV headers are quoted (e.g. `"week_end"`). The parser strips outer quotes — check that `dateKey`/`valueKey`/filter keys match the unquoted header names exactly.

**Empty series (no line at all)**: A `filters` entry doesn't match any rows. Fetch the raw CSV and inspect the exact column values (case-sensitive).

**Wrong number of lines on chart**: A filter is under-constrained — multiple distinct values pass. Add another filter key to narrow it down (e.g. `rate_type: 'Age-adjusted'`).

**Hover tooltip reversed**: Data wasn't sorted ascending before display. Both loaders sort by `date` ascending — verify the `dateKey` column parses correctly.

**Build fails**: `rm -rf node_modules build .svelte-kit && pnpm install && pnpm run build`

**Port in use**: `lsof -ti:5173 | xargs kill -9` or `pnpm dev -- --port 3000`

## Resources

- [SvelteKit docs](https://svelte.dev/docs/kit) | [Svelte 5 runes](https://svelte.dev/docs/svelte/what-are-runes)
- [svelteplot](https://svelteplot.dev/) | [Observable Plot](https://observablehq.com/plot/)
- [d3-format](https://d3js.org/d3-format) | [pnpm](https://pnpm.io/)
- [CDC Data Portal](https://data.cdc.gov/) | [CDC WONDER](https://wonder.cdc.gov/)
- [DATA_SOURCES.md](./DATA_SOURCES.md) — CDC dataset catalog for finding new data
