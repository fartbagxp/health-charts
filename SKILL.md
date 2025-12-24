# SKILL.md

> **Repository**: health-charts
> **Description**: Interactive health data visualization dashboard for respiratory viruses
> **Tech Stack**: Node.js, pnpm, Vite, D3.js
> **Last Updated**: 2025-12-24

---

## Overview

Interactive dashboard displaying respiratory virus trends (Flu, COVID-19, RSV) using real-time CDC data. Built with D3.js and Vite, inspired by FRED (Federal Reserve Economic Data) interface.

## Tech Stack

- **Node.js** (v18+) - JavaScript runtime
- **pnpm** (v8+) - Package manager (faster than npm/yarn)
- **Vite 7.3.0** - Build tool with HMR and optimized production builds
- **D3.js 7.9.0** - Data visualization library
- **Vanilla JS** - No framework dependencies

## Quick Start

```bash
# Install dependencies
pnpm install

# Start dev server (http://localhost:5173)
pnpm run dev

# Fetch latest CDC data
pnpm run fetch-data

# Build for production
pnpm run build

# Preview production build
pnpm run preview
```

## Project Structure

```
health-charts/
├── src/
│   ├── main.js         # App initialization & data loading
│   ├── chart.js        # D3 LineChart component
│   └── style.css       # Styles
├── public/data/        # JSON datasets (flu, covid, rsv)
├── scripts/            # Data fetching utilities
└── index.html          # Entry point
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
```

## Chart Component

**LineChart** class (`src/chart.js`) - Reusable D3.js component

```javascript
// Create chart
const chart = new LineChart('container-id', {
  width: 960,
  height: 400,
  xKey: 'date',
  formatValue: d3.format(',')
});

// Update with data
chart.update([{
  name: 'Virus Name',
  data: [...],
  color: '#0073e6',
  valueKey: 'cases'
}]);
```

**Features**: Responsive SVG, smooth curves, tooltips, COVID period shading, legend, CSV export

**Colors**: Flu (Blue `#0073e6`), COVID-19 (Red `#dc3545`), RSV (Green `#28a745`)

## Adding New Charts

1. **Add data file**: `public/data/new-virus.json` with format `[{ date, value }]`
2. **Update HTML**: Add chart container with `id="chart-new"`
3. **Update main.js**: Load data, create LineChart instance, call update()
4. **Update CSS**: Add `#chart-new { width: 100%; min-height: 400px; }`

## Key Features

- **Interactive Tooltips**: Hover to see date and all virus values, color-coded
- **COVID-19 Period Shading**: Gray region (Mar 2020 - May 2023)
- **CSV Export**: Download button exports all series data
- **Responsive Design**: Fluid SVG, mobile breakpoint at 768px
- **Real-time CDC Data**: Fetch via `pnpm run fetch-data`

## CDC Data Fetching

Script uses Socrata Query Language (SoQL) to fetch from CDC API:

```bash
# Fetch latest data (saves to public/data/)
pnpm run fetch-data
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
- [CDC Data Portal](https://data.cdc.gov/) | [Socrata API](https://dev.socrata.com/)
