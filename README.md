# Health Metrics Dashboard

An interactive health data visualization dashboard inspired by the Federal Reserve's FRED interface. Built with D3.js and Vite.

## Features

- FRED-style interactive line charts
- Smooth transitions and animations
- Hover tooltips with precise values
- Responsive design
- CSV data export
- Clean, professional styling

## Tech Stack

- **D3.js v7** - Data visualization
- **Vite** - Build tool and dev server
- **Vanilla JS** - No framework dependencies

## Getting Started

### Install Dependencies

```bash
pnpm install
```

### Development Server

```bash
pnpm run dev
```

The application will be available at `http://localhost:5173`

### Build for Production

```bash
pnpm run build
```

The built files will be in the `dist/` directory.

### Preview Production Build

```bash
pnpm run preview
```

## Project Structure

```bash
health-charts/
├── index.html              # Main HTML entry point
├── src/
│   ├── main.js            # Application entry point
│   ├── chart.js           # D3 chart component
│   └── style.css          # Styles
├── public/
│   └── data/
│       └── flu-cases.json # Sample health data
└── package.json
```

## Data Sources

Real-time CDC data integration:

- **COVID-19**: [CDC Weekly Hospitalization Data](https://data.cdc.gov/Public-Health-Surveillance/Weekly-United-States-COVID-19-Hospitalization-Metr/7dk4-g6vg) (2020-2024)
- **RSV**: [CDC RSV-NET Hospitalization Data](https://data.cdc.gov/Public-Health-Surveillance/Weekly-Rates-of-Laboratory-Confirmed-RSV-Hospitali/29hc-w46k) (2020-2024)
- **Influenza**: Sample data (2020-2024)

### Fetching Latest Data

```bash
npm run fetch-data
```

This downloads the latest CDC data into `public/data/`. See [DATA_SOURCES.md](./DATA_SOURCES.md) for detailed API documentation and [API_QUICK_REFERENCE.md](./API_QUICK_REFERENCE.md) for quick examples.

## Adding New Charts

1. Create a new data file in `public/data/`
2. Import and load the data in `src/main.js`
3. Create a new `LineChart` instance
4. Update with your data
