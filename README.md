# Health Charts

[![Deploy to GitHub Pages](https://github.com/fartbagxp/health-charts/actions/workflows/deploy.yml/badge.svg)](https://github.com/fartbagxp/health-charts/actions/workflows/deploy.yml)
[![Last Commit](https://img.shields.io/github/last-commit/fartbagxp/health-charts?logo=git&logoColor=white&label=last%20commit)](https://github.com/fartbagxp/health-charts/commits/main)
[![View Dashboard](https://img.shields.io/badge/view-dashboard-0057A8?logo=googlechrome&logoColor=white)](https://fartbagxp.github.io/health-charts)
[![License: CC0-1.0](https://img.shields.io/badge/license-CC0--1.0-lightgrey)](LICENSE)
[![Data Series](https://img.shields.io/badge/data%20series-50-4CAF50?logo=databricks&logoColor=white)](https://fartbagxp.github.io/health-charts)

A U.S. public health data dashboard built on CDC surveillance and federal health data. 50 series spanning hospitalizations, wastewater signals, vaccination rates, epidemic-trend nowcasts, mortality, injury, births, and foodborne illness.

**[View the dashboard →](https://fartbagxp.github.io/health-charts)**

## Features

- Home page with all series as lazily-loaded line charts (data fetches as you scroll)
- Per-series detail page with a larger chart, summary stats, and CSV download
- Category browsing via nav
- Hover tooltips showing exact value and date
- Responsive, mobile-friendly layout

## Tech Stack

- **SvelteKit 2** for routing and static site generation
- **Svelte 5** with the runes API
- **svelteplot** for chart primitives (built on D3)
- **d3-format** for number formatting
- **Vite** as the build tool
- **`@sveltejs/adapter-static`** to produce a static build for GitHub Pages

## Getting Started

```bash
pnpm install
pnpm run dev                    # http://localhost:5173 — auto-copies /map's topology first (predev)
pnpm run build                  # auto-copies /map's topology first (prebuild)
pnpm run preview
```

## Data Loading

All chart data is fetched client-side from CSVs in the [fartbagxp/health](https://github.com/fartbagxp/health) repository. Nothing is embedded in the HTML at build time.

Each chart on the home page uses `IntersectionObserver` to start fetching its data as it scrolls near the viewport. Series that share a CSV file (e.g. the three `resp-deaths-*` series all read `resp_deaths_pct.csv`) share a single fetch via a URL-keyed cache in `fetchData.js`.

Large raw sources (wastewater, PLACES) are pre-aggregated upstream by `health` itself (see its `cdc_open.aggregate` module) and fetched from `health`'s `data/processed/` directory. This repo does no pre-processing of its own; an earlier local `aggregate-wastewater.js` script was removed once `health` started serving the smaller processed files directly.

The **PLACES Map** (`/map`) covers all 49 measures of [CDC's PLACES portal](https://experience.arcgis.com/experience/22c7182a162d45788dd52a2362f8ed65) — 40 BRFSS-modeled health measures plus 9 American Community Survey non-medical factors, across 7 categories. County and state choropleths read the committed slices in `health`'s `data/processed/places/` (`county_crude.csv`, `county_ageadj.csv`, `state_rollup.csv`, `nmf_county.csv`, `nmf_state_rollup.csv`, `measures.csv`). Clicking a county fetches its full profile live from the community [`fartbagxp/cdc-places`](https://www.dolthub.com/repositories/fartbagxp/cdc-places) Dolt mirror (CORS-enabled, keyless) rather than shipping the multi-gigabyte sub-county tables.

## Scripts

```bash
pnpm run prepare-map-topology   # copies us-atlas county/state boundaries into public/topo/ (auto-run via predev/prebuild)
```

## Data Sources

| Category              | Source                                                                                                     | Metric                                  | Frequency          |
| --------------------- | ---------------------------------------------------------------------------------------------------------- | --------------------------------------- | ------------------ |
| Hospitalizations      | [CDC NHSN](https://data.cdc.gov/d/ua7e-t2fy)                                                               | New admissions (flu/COVID/RSV)          | Weekly             |
| Respiratory mortality | [CDC Open Data](https://data.cdc.gov/d/4bc2-bbpq)                                                          | % of all deaths                         | Weekly             |
| Vaccination coverage  | [CDC NIS-ACM](https://data.cdc.gov/d/5c6r-xi2t)                                                            | % adults up-to-date                     | Weekly             |
| Nursing home vacc.    | [CDC NHSN](https://data.cdc.gov/d/tscn-ryh9)                                                               | % residents vaccinated                  | Weekly             |
| Wastewater            | [CDC NWSS](https://data.cdc.gov/d/j9g8-acpt)                                                               | RNA copies/person/day (national median) | Weekly             |
| Kindergarten vacc.    | [CDC SchoolVaxView](https://data.cdc.gov/d/ijqb-a7ye)                                                      | % coverage by vaccine                   | Annual             |
| Measles               | [CDC Measles Surveillance](https://www.cdc.gov/measles/data-research/index.html)                           | Cases                                   | Weekly / Annual    |
| Lyme disease          | [CDC NNDSS via WONDER](https://wonder.cdc.gov/)                                                            | Cases                                   | Annual             |
| Births & fertility    | [CDC WONDER Natality](https://wonder.cdc.gov/natality.html) / [CDC NCHS](https://data.cdc.gov/d/76vv-a7x8) | Births / fertility rate                 | Annual / Quarterly |
| Mortality             | [CDC WONDER](https://wonder.cdc.gov/) / [CDC NCHS](https://data.cdc.gov/d/489q-934x)                       | Deaths / age-adjusted rates             | Annual / Quarterly |
| Life expectancy       | [CDC NCHS](https://data.cdc.gov/d/w9j2-ggv5)                                                               | Years at birth by sex                   | Annual             |
| Injury & overdose     | [CDC WISQARS](https://wisqars.cdc.gov/)                                                                    | Death rate per 100k (annualized)        | Monthly            |
| Foodborne disease     | [CDC BEAM Dashboard](https://www.cdc.gov/beam/dashboard/index.html)                                        | Human isolates (5 pathogens)            | Monthly            |
| Suicide by sex        | [CDC WISQARS / WONDER](https://wisqars.cdc.gov/)                                                           | Death rate per 100k                     | Annual             |

## Project Structure

```bash
health-charts/
├── src/
│   ├── app.html                     # HTML shell
│   ├── app.css                      # Global styles
│   ├── lib/
│   │   ├── config.js                # All 54 series definitions (50 visible, 4 hidden)
│   │   ├── sources.js               # Canonical CDC/NCI source registry (Data Sources section)
│   │   ├── mapConfig.js             # PLACES CSV/Dolt URLs, category order, color scheme, CT FIPS crosswalk
│   │   ├── ChoroplethMap.svelte     # Shared US choropleth chrome (zoom/pan, hover, borders)
│   │   ├── fetchData.js             # CSV fetching, parsing, and URL-keyed cache
│   │   └── ChartPanel.svelte        # Self-fetching chart card (used on home page)
│   └── routes/
│       ├── +layout.svelte           # Nav with category links
│       ├── +page.js                 # Home page (prerender only, no data loading)
│       ├── +page.svelte             # Home page — renders a ChartPanel per series
│       ├── map/
│       │   ├── +page.js             # Maps: static prerendered route
│       │   └── +page.svelte         # PLACES Map: 49-measure US choropleth + county drill-down panel
│       └── series/[id]/
│           ├── +page.js             # Loads config only; data is fetched client-side
│           └── +page.svelte         # Series detail — full chart, stats, CSV download
├── public/
│   ├── favicon.png
│   └── topo/                        # Generated by prepare-map-topology.js, gitignored
│       ├── counties-10m.json
│       └── states-10m.json
├── scripts/
│   └── prepare-map-topology.js      # Copies us-atlas boundaries into public/topo/
├── .github/workflows/deploy.yml     # CI: build (auto-runs prebuild) → deploy to GitHub Pages
├── svelte.config.js
└── vite.config.js
```

## Related projects

This is the visualization end of a three-repo pipeline:

```
pulse-code  →  health  →  health-charts
(explore)      (archive)   (visualize)
```

- **[fartbagxp/health](https://github.com/fartbagxp/health)** is the upstream data source. Every `csvUrl` in `src/lib/config.js` points at `raw.githubusercontent.com/fartbagxp/health/main/...`; nothing is copied into this repo, so a chart updates the moment `health` commits fresh data. Its README documents which CDC source and API backs each series.
- **[fartbagxp/pulse-code](https://github.com/fartbagxp/pulse-code)** sits further upstream: a CDC WONDER exploration CLI whose saved queries seed many of the WONDER-sourced series here (drug overdose, maternal mortality, suicide, births, tick-borne disease, etc.). `health` archives their output as CSVs, which this repo then charts.
