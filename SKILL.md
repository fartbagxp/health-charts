# SKILL.md

> **Repository**: health-charts
> **Description**: Interactive health data visualization dashboard
> **Tech Stack**: Node.js, pnpm, Vite, SvelteKit, svelteplot, d3-format
> **Last Updated**: 2026-05-27

---

## Overview

Static dashboard displaying U.S. health trends across 19 series: respiratory virus hospitalizations, vaccination coverage, nursing home vaccination, birth rates, mortality rates, and annual totals. Also includes a `/map` section with US choropleth maps (state/county) of CDC PLACES chronic disease prevalence. Built with SvelteKit and svelteplot (Observable Plot for Svelte), deployed as a fully static site via `@sveltejs/adapter-static`. Data is fetched from raw GitHub CSVs directly in the browser (lazily, on scroll into view for the home page / on mount for detail pages) — no local data files, no build-time embedding.

## Tech Stack

- **Node.js** (v18+) — JavaScript runtime
- **pnpm** — Package manager
- **Vite** — Build tool with HMR and optimized production builds
- **SvelteKit 2 / Svelte 5** — App framework; file-based routing, SSG via adapter-static
- **svelteplot 0.14** — Observable Plot wrapper for Svelte (line charts, axes, grid, rules, geo/choropleth maps)
- **d3-format** — Number formatting (`,` for counts, `.1f` for rates, `.2f` for percentages)
- **topojson-client** — Converts TopoJSON topologies to GeoJSON (`feature`, `mesh`) for the `/map` choropleths
- **us-atlas** — Pre-built US state/county TopoJSON boundaries (10m resolution), FIPS-keyed
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
│   │   ├── config.js                 # All series definitions + CATEGORIES
│   │   ├── mapConfig.js              # CDC PLACES measures, color scheme, PLACES CSV url
│   │   └── fetchData.js              # CSV loaders, incl. loadPlacesCounty()
│   └── routes/
│       ├── +layout.js                # prerender = true
│       ├── +layout.svelte            # Nav (incl. "Maps" link) + footer shell
│       ├── +page.js                  # Home: fetches all datasets at build time
│       ├── +page.svelte              # Home: sparkline grid with hover tooltips
│       ├── map/
│       │   ├── +page.js              # Maps: static prerendered route
│       │   └── +page.svelte          # Maps: US choropleth (state/county), measure + level toggle
│       └── series/[id]/
│           ├── +page.js              # Detail: fetches single dataset at build time
│           └── +page.svelte          # Detail: full chart + metrics grid + CSV export
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

## Maps (`/map`)

US choropleth maps of CDC PLACES chronic disease prevalence, at county or state
granularity. Uses svelteplot's `Geo` mark with `projection="albers-usa"`.

- **Data**: `loadPlacesCounty()` in `fetchData.js` fetches the **processed**
  `places_county.csv` (`data/processed/cdc_open/`, not `data/raw/`) — health's
  `cdc_open.aggregate.aggregate_places_county()` slims the raw ~12MB/22-column file
  down to crude-prevalence rows and 6 columns (~800KB) so the map doesn't ship
  age-adjusted rows, confidence intervals, and descriptive text the map never reads.
  Keyed by 5-digit county FIPS (`locationid`). State values are derived client-side as
  a population-weighted average of that state's counties — the CSV itself has no true
  state-level rows.
- **Boundaries**: `us-atlas`'s `counties-10m.json` / `states-10m.json`, converted to
  GeoJSON with `topojson-client`'s `feature()`. Their feature `id` is the same
  zero-padded FIPS string as `locationid`, so the join needs no reformatting.
  `us-atlas` is a devDependency only — `scripts/prepare-map-topology.js` copies
  the two files into `public/topo/` (auto-run via `predev`/`prebuild`), and
  `+page.svelte` `fetch()`s them at runtime instead of statically importing
  them. A static `import ... from 'us-atlas/...'` bundles the ~950KB of
  topology directly into the `/map` route's own JS chunk (measured: 1.3MB
  uncompressed, by far the largest chunk in the build) — fetching it as a
  plain static file instead moves it off the JS-parse critical path and lets
  it load in parallel with the PLACES CSV.
- **Measures**: 8 BRFSS chronic-disease indicators defined in `mapConfig.js`
  (`PLACES_MEASURES`) — obesity, diabetes, high blood pressure, coronary heart disease,
  stroke, cancer, COPD, arthritis — each with a fixed color-scale `domain` so switching
  measures doesn't rescale the ramp.
- **Zip/ZCTA-level maps are not implemented.** CDC PLACES does publish a ZCTA table,
  but it isn't fetched into the `health` data repo yet, and nationwide ZCTA cartographic
  boundaries are 100MB+ (too large to bundle the way `us-atlas` state/county boundaries
  are). Adding it would need its own data-sourcing + boundary-size plan.
- **Borders**: drawn as `topojson.mesh()` lines (one stitched geometry per level), not
  as each polygon's own stroke — independently-rendered adjacent polygons can have
  sub-pixel seams at a shared edge where one's fill slivers over its neighbor's stroke.
  Rendered via `<Geo canvas>` rather than SVG: a national county-border mesh is ~3,141
  line segments in one `<path>`, and browsers can show stroke-tessellation artifacts
  (stray triangles) on sufficiently complex single SVG paths — canvas draws pixels
  directly and doesn't hit that. Canvas-mode `Geo` marks render inside a `<foreignObject>`
  that svelteplot sizes to the full plot area; getting `pointer-events: none` to actually
  reach hover on the layers below needs an external CSS rule on both the `foreignObject`
  and the `canvas` (the `style` *prop* on canvas-mode `<Geo>` gets silently overwritten by
  `CanvasLayer.svelte`'s own inline `style`, so passing `style="pointer-events:none"`
  directly to the mark doesn't work).
- **Zoom/pan**: a plain CSS `transform: translate(...) scale(...)` on a wrapper div
  around `<Plot>` (see `zoomScale`/`panX`/`panY` in `+page.svelte`), not a re-projection —
  SVG stays crisp at any zoom this way, and it never touches a `Geo` mark's props, so it
  can't retrigger a scale recomputation the way per-pixel `pointermove`-driven hover state
  once did (see the `onHoverEnter` comment). One easy-to-miss side effect: a CSS
  `transform` on an ancestor (even `scale(1)`) becomes the containing block for
  `position: fixed` descendants, so the hover tooltip is rendered as a sibling *outside*
  the transformed wrapper, not inside `Plot`'s `overlay` snippet, to keep it pinned to the
  viewport instead of panning/zooming with the map.

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
