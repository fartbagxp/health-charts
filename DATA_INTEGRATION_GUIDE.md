# Data Integration Quick Start

This guide helps you quickly integrate the CDC RSV and COVID-19 data into your health-charts visualizations.

## Available Data Files

After running `npm run fetch-data`, you'll have these files in `/public/data/`:

### 1. covid-hospitalizations.json
```json
[
  {
    "date": "2020-08-08",
    "hospitalizations": 31623,
    "avgDaily": "4517.57"
  },
  ...
]
```
- **Records**: 195
- **Date Range**: Aug 2020 - Apr 2024
- **Weekly data**: Each record represents one week
- **Metric**: Total confirmed COVID-19 hospital admissions per week

### 2. rsv-hospitalizations.json
```json
[
  {
    "date": "2020-10-03",
    "rate": 0.5,
    "cumulativeRate": 0.5,
    "season": "2020-21"
  },
  ...
]
```
- **Records**: 209
- **Date Range**: Oct 2020 - Sep 2024
- **Weekly data**: Each record represents one week
- **Metric**: Hospitalization rate per 100,000 population
- **Seasonal**: Data organized by RSV seasons (Oct-Sep)

### 3. flu-cases.json (existing)
```json
[
  {
    "date": "2020-01-01",
    "cases": 12500
  },
  ...
]
```
- **Records**: 60
- **Date Range**: Jan 2020 - Oct 2024
- **Monthly data**: Each record represents one month
- **Metric**: Flu cases (sample data)

## Quick Integration Examples

### Example 1: Load All Three Data Sources

```javascript
import * as d3 from 'd3';

async function loadAllData() {
  const [fluData, rsvData, covidData] = await Promise.all([
    d3.json('/data/flu-cases.json'),
    d3.json('/data/rsv-hospitalizations.json'),
    d3.json('/data/covid-hospitalizations.json')
  ]);

  return { fluData, rsvData, covidData };
}

// Usage
loadAllData().then(({ fluData, rsvData, covidData }) => {
  console.log('Flu records:', fluData.length);
  console.log('RSV records:', rsvData.length);
  console.log('COVID records:', covidData.length);
});
```

### Example 2: Normalize Data Formats

Since the data has different structures, you may want to normalize:

```javascript
function normalizeData(data, type) {
  switch(type) {
    case 'flu':
      return data.map(d => ({
        date: new Date(d.date),
        value: d.cases,
        type: 'Flu Cases'
      }));
    
    case 'rsv':
      return data.map(d => ({
        date: new Date(d.date),
        value: d.rate,
        type: 'RSV Rate (per 100k)',
        season: d.season
      }));
    
    case 'covid':
      return data.map(d => ({
        date: new Date(d.date),
        value: d.hospitalizations,
        type: 'COVID-19 Hospitalizations',
        avgDaily: parseFloat(d.avgDaily)
      }));
  }
}

// Usage
const normalizedFlu = normalizeData(fluData, 'flu');
const normalizedRSV = normalizeData(rsvData, 'rsv');
const normalizedCovid = normalizeData(covidData, 'covid');
```

### Example 3: Filter by Date Range

```javascript
function filterByDateRange(data, startDate, endDate) {
  const start = new Date(startDate);
  const end = new Date(endDate);
  
  return data.filter(d => {
    const date = new Date(d.date);
    return date >= start && date <= end;
  });
}

// Get data for 2022 only
const covidData2022 = filterByDateRange(covidData, '2022-01-01', '2022-12-31');
```

### Example 4: Aggregate Weekly to Monthly

To match the flu data's monthly granularity:

```javascript
function aggregateToMonthly(weeklyData, valueField) {
  const monthlyMap = new Map();
  
  weeklyData.forEach(d => {
    const date = new Date(d.date);
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    
    if (!monthlyMap.has(monthKey)) {
      monthlyMap.set(monthKey, {
        date: `${monthKey}-01`,
        total: 0,
        count: 0
      });
    }
    
    const month = monthlyMap.get(monthKey);
    month.total += d[valueField] || 0;
    month.count += 1;
  });
  
  return Array.from(monthlyMap.values()).map(m => ({
    date: m.date,
    value: m.total / m.count  // Average for the month
  }));
}

// Usage
const covidMonthly = aggregateToMonthly(covidData, 'hospitalizations');
const rsvMonthly = aggregateToMonthly(rsvData, 'rate');
```

### Example 5: Create Multi-Series Chart Data

```javascript
function prepareMultiSeriesData() {
  return [
    {
      name: 'COVID-19 Hospitalizations',
      color: '#e74c3c',
      data: covidData.map(d => ({
        date: new Date(d.date),
        value: d.hospitalizations
      }))
    },
    {
      name: 'RSV Rate (per 100k)',
      color: '#3498db',
      data: rsvData.map(d => ({
        date: new Date(d.date),
        value: d.rate
      }))
    },
    {
      name: 'Flu Cases',
      color: '#2ecc71',
      data: fluData.map(d => ({
        date: new Date(d.date),
        value: d.cases
      }))
    }
  ];
}
```

## Data Alignment Considerations

### Different Metrics
- **COVID**: Absolute numbers (hospitalizations)
- **RSV**: Rate per 100,000 population
- **Flu**: Case counts (sample data)

**Recommendation**: Use separate Y-axes or normalize to percentages for comparison.

### Different Granularities
- **COVID**: Weekly
- **RSV**: Weekly
- **Flu**: Monthly

**Recommendation**: Either:
1. Aggregate weekly data to monthly, OR
2. Update flu data to weekly, OR
3. Keep separate and indicate granularity in UI

### Date Ranges
- **COVID**: Aug 2020 - Apr 2024 (195 weeks)
- **RSV**: Oct 2020 - Sep 2024 (209 weeks, 4 seasons)
- **Flu**: Jan 2020 - Oct 2024 (60 months)

**Recommendation**: Filter all to common range (Oct 2020 - Apr 2024) for comparison.

## Updating the Chart Component

Here's how to modify your existing chart to handle multiple datasets:

```javascript
// In src/main.js or chart.js

class MultiSeriesChart {
  constructor(selector) {
    this.svg = d3.select(selector);
    this.margin = {top: 20, right: 80, bottom: 30, left: 50};
    // ... rest of initialization
  }
  
  async loadData() {
    const [flu, rsv, covid] = await Promise.all([
      d3.json('/data/flu-cases.json'),
      d3.json('/data/rsv-hospitalizations.json'),
      d3.json('/data/covid-hospitalizations.json')
    ]);
    
    this.datasets = {
      flu: this.normalizeData(flu, 'flu'),
      rsv: this.normalizeData(rsv, 'rsv'),
      covid: this.normalizeData(covid, 'covid')
    };
  }
  
  draw(selectedDataset = 'covid') {
    const data = this.datasets[selectedDataset];
    // ... existing chart drawing code
  }
}
```

## UI Controls for Data Selection

Add buttons or dropdown to switch between datasets:

```html
<div class="data-selector">
  <button onclick="chart.draw('flu')">Flu</button>
  <button onclick="chart.draw('rsv')">RSV</button>
  <button onclick="chart.draw('covid')">COVID-19</button>
  <button onclick="chart.drawAll()">Compare All</button>
</div>
```

## Refreshing Data

To get the latest data from CDC:

```bash
npm run fetch-data
```

This will:
1. Download latest RSV data from CDC
2. Download latest COVID-19 data from CDC
3. Save to `/public/data/`
4. Show summary statistics

**Recommended Schedule**: Weekly (Fridays after CDC updates)

## Data Attribution

When displaying these visualizations, include attribution:

```html
<div class="data-attribution">
  Data sources:
  <ul>
    <li>COVID-19: CDC COVID-NET Weekly Hospitalization Data</li>
    <li>RSV: CDC RSV-NET Hospitalization Surveillance</li>
    <li>Flu: Sample data</li>
  </ul>
  Last updated: [Date]
</div>
```

## Next Steps

1. **Test with current data**: Use the generated JSON files to test your visualizations
2. **Update chart component**: Modify `src/chart.js` to handle new data formats
3. **Add selectors**: Create UI to switch between datasets
4. **Style**: Update CSS for multi-series charts
5. **Automate**: Set up weekly data refresh

## Troubleshooting

### Data not loading?
- Check file paths are correct (`/data/` vs `/public/data/`)
- Verify JSON files exist in `public/data/`
- Check browser console for errors

### Charts look wrong?
- Verify date parsing is correct
- Check that value fields match (`.rate` vs `.hospitalizations`)
- Ensure scales are appropriate for data ranges

### Need to refetch data?
```bash
rm public/data/covid-hospitalizations.json
rm public/data/rsv-hospitalizations.json
npm run fetch-data
```

## Reference Documentation

- **Full API Documentation**: [DATA_SOURCES.md](./DATA_SOURCES.md)
- **Quick API Reference**: [API_QUICK_REFERENCE.md](./API_QUICK_REFERENCE.md)
- **Research Summary**: [RESEARCH_SUMMARY.md](./RESEARCH_SUMMARY.md)

---

**Last Updated**: December 23, 2025
