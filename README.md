# Health Charts

An interactive health data visualization dashboard inspired by the Federal Reserve's [FRED](https://fred.stlouisfed.org/) interface. Displays respiratory illness surveillance data from the CDC with a FRED-style home page and per-series detail pages powered by [Datawrapper](https://www.datawrapper.de/) interactive charts.

## Features

- FRED-style home page with hero search, sparkline cards, and category browsing
- Interactive Datawrapper chart embeds on series detail pages
- D3.js fallback charts when Datawrapper is not configured
- Hash-based client-side routing (`#/`, `#/series/flu`, etc.)
- Metrics summary (latest, peak, rounded average) from local data
- CSV download for every series
- Responsive design, mobile-friendly

## Tech Stack

- **D3.js v7** — sparklines and fallback line charts
- **Datawrapper** — hosted interactive chart embeds
- **Vite** — build tool and dev server
- **Vanilla JS** — no framework

## Getting Started

```bash
pnpm install
pnpm run dev        # http://localhost:5173
pnpm run build
pnpm run preview
```

## Datawrapper Setup

Interactive charts are embedded Datawrapper iframes. The API token is **never** exposed to the browser — only the public chart IDs are.

### 1. Create an API token

Go to `https://app.datawrapper.de/account/api-keys` and create a token with scopes:
`chart:read`, `chart:write`, `chart:publish`

### 2. Add to `.env`

```
DATAWRAPPER_API_TOKEN="your-token-here"
```

`.env` is gitignored — it never gets committed.

### 3. Run the setup script

```bash
pnpm run setup-datawrapper
```

This creates one line chart per series, uploads the CSV data, publishes each chart, and saves the public chart IDs to `public/data/datawrapper-charts.json` (safe to commit).

### Updating data in existing charts

```bash
FLU_CHART_ID=jxAMa COVID_CHART_ID=nBpHX RSV_CHART_ID=GsSm6 \
  pnpm run setup-datawrapper
```

Pass the existing IDs to update data and metadata without recreating the charts.

### Fallback

If `datawrapper-charts.json` is absent or has no entry for a series, the app automatically renders a local D3 chart instead.

## Data Sources

| Category              | Source                                                                                           | Metric                           | Frequency        |
| --------------------- | ------------------------------------------------------------------------------------------------ | -------------------------------- | ---------------- |
| Hospitalizations      | [CDC NHSN](https://data.cdc.gov/d/ua7e-t2fy)                                                    | New admissions (flu/COVID/RSV)   | Weekly           |
| Respiratory mortality | [CDC Open Data](https://data.cdc.gov/d/4bc2-bbpq)                                               | % of all deaths                  | Weekly           |
| Vaccination coverage  | [CDC NIS-ACM](https://data.cdc.gov/d/5c6r-xi2t)                                                 | % adults up-to-date              | Weekly           |
| Nursing home vacc.    | [CDC NHSN](https://data.cdc.gov/d/tscn-ryh9)                                                    | % residents vaccinated           | Weekly           |
| Wastewater            | [CDC NWSS](https://data.cdc.gov/d/j9g8-acpt)                                                    | RNA copies/person/day (national) | Weekly           |
| Measles               | [CDC Measles Surveillance](https://www.cdc.gov/measles/data-research/index.html)                 | Cases                            | Weekly / Annual  |
| Lyme disease          | [CDC NNDSS via WONDER](https://wonder.cdc.gov/)                                                  | Cases                            | Annual           |
| Births & fertility    | [CDC WONDER Natality](https://wonder.cdc.gov/natality.html) / [CDC NCHS](https://data.cdc.gov/d/76vv-a7x8) | Births / fertility rate | Annual / Quarterly |
| Mortality             | [CDC WONDER](https://wonder.cdc.gov/) / [CDC NCHS](https://data.cdc.gov/d/489q-934x)            | Deaths / age-adjusted rates      | Annual / Quarterly |
| Life expectancy       | [CDC NCHS](https://data.cdc.gov/d/w9j2-ggv5)                                                    | Years at birth                   | Annual           |
| Injury & overdose     | [CDC WISQARS](https://wisqars.cdc.gov/)                                                          | Death rate per 100k (annualized) | Monthly          |
| Foodborne disease     | [CDC BEAM Dashboard](https://www.cdc.gov/beam/dashboard/index.html)                              | Human isolates (5 pathogens)     | Monthly          |

```bash
pnpm run fetch-data   # pull latest CDC data into public/data/
```

## Project Structure

```bash
health-charts/
├── src/
│   ├── app.html                # HTML shell (favicon, meta tags)
│   ├── app.css                 # Global styles
│   ├── lib/
│   │   └── config.js           # Series definitions
│   └── routes/
│       ├── +page.js            # Home page data loader
│       ├── +page.svelte        # Home page component
│       └── series/[id]/
│           └── +page.js        # Series detail data loader
├── public/
│   ├── favicon.png             # Site favicon / icon
│   └── data/
│       ├── flu-cases.json
│       ├── covid-hospitalizations.json
│       ├── rsv-hospitalizations.json
│       └── datawrapper-charts.json # Generated by setup-datawrapper script
├── scripts/
│   ├── fetch-cdc-data.js       # CDC Socrata API fetcher
│   └── setup-datawrapper.js    # Datawrapper chart creator/publisher
├── svelte.config.js
├── vite.config.js
└── .env                        # DATAWRAPPER_API_TOKEN (gitignored)
```
