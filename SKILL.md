# SKILL.md

> **Repository**: health-charts
> **Description**: Interactive health data visualization dashboard for respiratory viruses
> **Tech Stack**: Node.js, pnpm, Vite, D3.js, Datawrapper
> **Last Updated**: 2026-04-02

---

## Overview

Interactive dashboard displaying respiratory virus trends (Flu, COVID-19, RSV) using real-time CDC data. Built with D3.js and Vite, inspired by the FRED (Federal Reserve Economic Data) interface. Series detail pages embed interactive Datawrapper charts with a D3 fallback.

## Tech Stack

- **Node.js** (v18+) - JavaScript runtime
- **pnpm** (v8+) - Package manager (faster than npm/yarn)
- **Vite 8.0.3** - Build tool with HMR and optimized production builds
- **D3.js 7.9.0** - Data visualization library (sparklines, D3 fallback charts)
- **Datawrapper** - Hosted interactive chart embeds for series detail pages
- **Vanilla JS** - No framework dependencies

## Quick Start

```bash
# Install dependencies
pnpm install

# Start dev server (http://localhost:5173)
pnpm run dev

# Fetch latest CDC data
pnpm run fetch-data

# Create/update/publish Datawrapper charts (requires .env with DATAWRAPPER_API_TOKEN)
pnpm run setup-datawrapper

# Build for production
pnpm run build

# Preview production build
pnpm run preview
```

## Project Structure

```
health-charts/
├── src/
│   ├── main.js             # Hash router (# / → home, #/series/:id → detail)
│   ├── config.js           # Series definitions (id, color, valueKey, format, …)
│   ├── dataLoader.js       # Shared JSON loader with in-memory cache
│   ├── home.js             # FRED-style home page (hero, series cards, categories)
│   ├── seriesPage.js       # Series detail page (Datawrapper iframe or D3 fallback)
│   ├── sparkline.js        # Mini D3 area+line chart for home page cards
│   ├── chart.js            # Full D3 LineChart component (fallback / local dev)
│   └── style.css           # Styles
├── public/data/
│   ├── flu-cases.json              # Monthly flu data
│   ├── covid-hospitalizations.json # Weekly COVID data
│   ├── rsv-hospitalizations.json   # Weekly RSV data
│   └── datawrapper-charts.json     # Published Datawrapper chart IDs (generated)
├── scripts/
│   ├── fetch-cdc-data.js       # Pull latest data from CDC Socrata API
│   └── setup-datawrapper.js    # Create/publish Datawrapper charts, save IDs
├── .env                        # DATAWRAPPER_API_TOKEN (gitignored)
└── index.html                  # App shell (nav + #app mount + footer)
```

## Data Sources

All data from CDC via Socrata Open Data API:

| Dataset      | API Endpoint | Metric                   | Coverage  |
| ------------ | ------------ | ------------------------ | --------- |
| **COVID-19** | `7dk4-g6vg`  | Weekly hospitalizations  | 2020-2023 |
| **RSV**      | `29hc-w46k`  | Rate per 100k population | 2020-2024 |
| **Flu**      | Sample data  | Weekly cases             | 2020-2024 |

**Format**: All JSON datasets follow `[{ date: "YYYY-MM-DD", value_field: number }]`

See [DATA_SOURCES.md](./DATA_SOURCES.md) for detailed API documentation.

## Key Commands

```bash
# Dependencies
pnpm install              # Install all dependencies
pnpm add <package>        # Add dependency
pnpm add -D <package>     # Add dev dependency

# Development
pnpm run dev              # Start dev server (localhost:5173)
pnpm run build            # Build for production (outputs to dist/)
pnpm run preview          # Preview production build (localhost:4173)

# Data
pnpm run fetch-data       # Fetch latest CDC data to public/data/

# Datawrapper
pnpm run setup-datawrapper                        # Create + publish all 3 charts
FLU_CHART_ID=x COVID_CHART_ID=y RSV_CHART_ID=z \ # Re-use existing chart IDs
  pnpm run setup-datawrapper                      # (update data without recreating)
```

## Datawrapper Integration

Interactive charts on series detail pages are embedded Datawrapper iframes. The API token never touches the browser.

### Security model

| Layer | Token present? | Purpose |
|---|---|---|
| `.env` | Yes (gitignored) | Stores `DATAWRAPPER_API_TOKEN` |
| `scripts/setup-datawrapper.js` | Yes (Node only) | Calls Datawrapper API to create/publish charts |
| `public/data/datawrapper-charts.json` | No | Stores only public chart IDs — safe to commit |
| Browser | No | Reads chart IDs, embeds iframes |

Vite enforces this too: only `VITE_`-prefixed env vars are bundled into the client.

### Setup

1. Create an API token at `https://app.datawrapper.de/account/api-keys` with scopes:
   - `chart:read`, `chart:write`, `chart:publish`
2. Add to `.env`:
   ```
   DATAWRAPPER_API_TOKEN="your-token-here"
   ```
3. Run the setup script:
   ```bash
   pnpm run setup-datawrapper
   ```
   This creates 3 line charts, uploads CSV data, publishes them, and writes their IDs to `public/data/datawrapper-charts.json`.

### Updating data in existing charts

```bash
FLU_CHART_ID=jxAMa COVID_CHART_ID=nBpHX RSV_CHART_ID=GsSm6 \
  pnpm run setup-datawrapper
```

### Fallback behavior

If `datawrapper-charts.json` is missing or has no entry for a series, `seriesPage.js` automatically falls back to the local D3 `LineChart` component.

## D3 LineChart Component

**LineChart** class (`src/chart.js`) — used for sparklines (always) and as the Datawrapper fallback.

```javascript
const chart = new LineChart('container-id', {
  width: 960,
  height: 400,
  xKey: 'date',
  formatValue: d3.format(',')
});

chart.update([{
  name: 'Flu',
  data: [...],
  color: '#0073e6',
  valueKey: 'cases'
}]);
```

**Features**: Responsive SVG, smooth curves, hover tooltips, COVID period shading, legend, CSV export

**Colors**: Flu `#0073e6` · COVID-19 `#dc3545` · RSV `#28a745`

## Adding a New Series

1. Add `public/data/new-series.json` — format: `[{ "date": "YYYY-MM-DD", "value": number }]`
2. Add an entry to `src/config.js` (`SERIES_CONFIG`)
3. Run `pnpm run setup-datawrapper` to create the Datawrapper chart

## CDC Data Fetching

Script uses Socrata Query Language (SoQL) to fetch from CDC API:

```bash
pnpm run fetch-data   # saves to public/data/
```

**Query params**: `$where`, `$limit`, `$select`, `$order`

See [API_QUICK_REFERENCE.md](./API_QUICK_REFERENCE.md) for examples.

## Troubleshooting

**Port in use**: `lsof -ti:5173 | xargs kill -9` or `pnpm run dev -- --port 3000`

**Data not loading**: Check console, verify files in `public/data/`, validate JSON

**Build fails**: `rm -rf node_modules dist .vite && pnpm install && pnpm run build`

## Resources

**Documentation**

- [DATA_SOURCES.md](./DATA_SOURCES.md) - CDC API reference
- [API_QUICK_REFERENCE.md](./API_QUICK_REFERENCE.md) - Quick examples
- [DATA_INTEGRATION_GUIDE.md](./DATA_INTEGRATION_GUIDE.md) - Integration guide

**External**

- [D3.js](https://d3js.org/) | [Vite](https://vitejs.dev/) | [pnpm](https://pnpm.io/)
- [Datawrapper](https://www.datawrapper.de/) | [Datawrapper API docs](https://developer.datawrapper.de/docs)
- [CDC Data Portal](https://data.cdc.gov/) | [Socrata API](https://dev.socrata.com/)
