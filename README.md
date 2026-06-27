# Health Charts

[![Deploy to GitHub Pages](https://github.com/fartbagxp/health-charts/actions/workflows/deploy.yml/badge.svg)](https://github.com/fartbagxp/health-charts/actions/workflows/deploy.yml)
[![Last Commit](https://img.shields.io/github/last-commit/fartbagxp/health-charts?logo=git&logoColor=white&label=last%20commit)](https://github.com/fartbagxp/health-charts/commits/main)
[![View Dashboard](https://img.shields.io/badge/view-dashboard-0057A8?logo=googlechrome&logoColor=white)](https://fartbagxp.github.io/health-charts)
[![License: CC0-1.0](https://img.shields.io/badge/license-CC0--1.0-lightgrey)](LICENSE)
[![Data Series](https://img.shields.io/badge/data%20series-37-4CAF50?logo=databricks&logoColor=white)](https://fartbagxp.github.io/health-charts)

A U.S. public health data dashboard built on CDC surveillance and federal health data. 37 series spanning hospitalizations, wastewater signals, vaccination rates, mortality, injury, births, and foodborne illness.

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
pnpm run aggregate-wastewater   # pre-aggregate wastewater CSVs (required before first build)
pnpm run dev                    # http://localhost:5173
pnpm run build
pnpm run preview
```

## Data Loading

All chart data is fetched client-side from raw CSVs in the [fartbagxp/health](https://github.com/fartbagxp/health) repository. Nothing is embedded in the HTML at build time.

Each chart on the home page uses `IntersectionObserver` to start fetching its data as it scrolls near the viewport. Series that share a CSV file (e.g. the three `resp-deaths-*` series all read `resp_deaths_pct.csv`) share a single fetch via a URL-keyed cache in `fetchData.js`.

Wastewater CSVs are the exception. The raw files have 50,000+ site-level sensor rows each, so `scripts/aggregate-wastewater.js` pre-aggregates them to weekly national medians and writes the results to `public/data/processed/`. The CI workflow runs this before the Vite build.

## Scripts

```bash
pnpm run aggregate-wastewater   # fetch + pre-aggregate the 5 wastewater CSVs
pnpm run fetch-data             # pull hospitalization data from CDC Socrata API
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
│   │   ├── config.js                # All 37 series definitions (URLs, keys, colors)
│   │   ├── fetchData.js             # CSV fetching, parsing, and URL-keyed cache
│   │   └── ChartPanel.svelte        # Self-fetching chart card (used on home page)
│   └── routes/
│       ├── +layout.svelte           # Nav with category links
│       ├── +page.js                 # Home page (prerender only, no data loading)
│       ├── +page.svelte             # Home page — renders a ChartPanel per series
│       └── series/[id]/
│           ├── +page.js             # Loads config only; data is fetched client-side
│           └── +page.svelte         # Series detail — full chart, stats, CSV download
├── public/
│   ├── favicon.png
│   └── data/
│       └── processed/
│           ├── wastewater_covid.csv
│           ├── wastewater_flu.csv
│           ├── wastewater_rsv.csv
│           ├── wastewater_measles.csv
│           └── wastewater_h5.csv    # Pre-aggregated weekly medians (generated by script)
├── scripts/
│   ├── aggregate-wastewater.js      # Fetches raw wastewater CSVs → weekly medians
│   └── fetch-cdc-data.js            # CDC Socrata API fetcher for hospitalization data
├── .github/workflows/deploy.yml     # CI: aggregate → build → deploy to GitHub Pages
├── svelte.config.js
└── vite.config.js
```
