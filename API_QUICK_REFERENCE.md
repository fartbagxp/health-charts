# CDC API Quick Reference

Quick reference guide for accessing CDC RSV and COVID-19 data programmatically.

## Quick Start

### Fetch Data for This Project
```bash
npm run fetch-data
# or
node scripts/fetch-cdc-data.js
```

This will download the latest RSV and COVID-19 data into `/public/data/`.

---

## Direct API Access

### RSV Hospitalization Data

**Dataset ID**: `29hc-w46k`
**Endpoint**: `https://data.cdc.gov/resource/29hc-w46k.json`

#### Basic Queries

```bash
# Get national RSV data (all seasons)
curl "https://data.cdc.gov/resource/29hc-w46k.json?\$where=state='RSV-NET'&\$limit=1000"

# Get specific season
curl "https://data.cdc.gov/resource/29hc-w46k.json?\$where=state='RSV-NET' AND season='2023-24'&\$limit=500"

# Get data for specific state
curl "https://data.cdc.gov/resource/29hc-w46k.json?\$where=state='California' AND season='2023-24'&\$limit=500"
```

#### Available States
- `RSV-NET` (national aggregate)
- California
- Colorado
- Connecticut
- Georgia
- Maryland
- Michigan
- Minnesota
- New Mexico
- New York
- North Carolina
- Oregon
- Tennessee
- Utah
- Washington

#### Data Fields
```json
{
  "state": "RSV-NET",
  "season": "2023-24",
  "week_ending_date": "2023-10-07",
  "age_category": "All",
  "sex": "All",
  "race": "All",
  "rate": "0.5",
  "cumulative_rate": "0.5",
  "type": "Crude Rate"
}
```

---

### COVID-19 Hospitalization Data

**Dataset ID**: `7dk4-g6vg` (ARCHIVED - historical data through Sep 2023)
**Endpoint**: `https://data.cdc.gov/resource/7dk4-g6vg.json`

#### Basic Queries

```bash
# Get national COVID-19 data
curl "https://data.cdc.gov/resource/7dk4-g6vg.json?\$where=state='USA'&\$limit=500"

# Get specific state data
curl "https://data.cdc.gov/resource/7dk4-g6vg.json?\$where=state='CA'&\$limit=500"

# Get data by date range
curl "https://data.cdc.gov/resource/7dk4-g6vg.json?\$where=state='USA' AND week_ending_date>='2022-01-01'&\$limit=500"
```

#### Data Fields
```json
{
  "week_ending_date": "2022-01-15T00:00:00.000",
  "state": "USA",
  "avg_adm_all_covid_confirmed": "4517.57",
  "total_adm_all_covid_confirmed": "31623",
  "sum_adm_all_covid_confirmed": "1032508",
  "avg_total_patients": "2050.29",
  "avg_percent_inpatient_beds": "1.87",
  "avg_percent_staff_icu_beds": "1.44"
}
```

---

## SoQL Query Language Reference

### Basic Syntax

```bash
# Select specific columns
$select=column1,column2

# Filter data
$where=column='value'

# Order results
$order=column ASC|DESC

# Limit results
$limit=1000

# Offset (for pagination)
$offset=1000
```

### Common Filters

```bash
# Equality
$where=state='USA'

# Date comparison
$where=week_ending_date>='2022-01-01'

# Multiple conditions (AND)
$where=state='USA' AND season='2023-24'

# Multiple conditions (OR)
$where=season='2022-23' OR season='2023-24'

# IN clause
$where=state IN ('CA', 'NY', 'TX')
```

### Date Formatting

Dates in API responses are in ISO 8601 format:
```
2023-10-07T00:00:00.000
```

For queries, use simple format:
```bash
$where=week_ending_date>='2023-01-01'
```

---

## Output Formats

### JSON (default)
```bash
curl "https://data.cdc.gov/resource/29hc-w46k.json?$limit=10"
```

### CSV
```bash
curl "https://data.cdc.gov/resource/29hc-w46k.csv?$limit=10"
```

### XML
```bash
curl "https://data.cdc.gov/resource/29hc-w46k.xml?$limit=10"
```

---

## JavaScript Examples

### Using Fetch API

```javascript
// Fetch RSV data
async function fetchRSVData() {
  const url = 'https://data.cdc.gov/resource/29hc-w46k.json?' +
    '$where=state=\'RSV-NET\' AND season=\'2023-24\'' +
    '&$order=week_ending_date ASC' +
    '&$limit=500';

  const response = await fetch(url);
  const data = await response.json();
  return data;
}

// Fetch COVID-19 data
async function fetchCovidData() {
  const url = 'https://data.cdc.gov/resource/7dk4-g6vg.json?' +
    '$where=state=\'USA\'' +
    '&$order=week_ending_date ASC' +
    '&$limit=500';

  const response = await fetch(url);
  const data = await response.json();
  return data;
}
```

### With D3.js

```javascript
import * as d3 from 'd3';

// Load RSV data
d3.json('https://data.cdc.gov/resource/29hc-w46k.json?$where=state=\'RSV-NET\'&$limit=500')
  .then(data => {
    console.log('RSV data:', data);
  });

// Load COVID-19 data
d3.json('https://data.cdc.gov/resource/7dk4-g6vg.json?$where=state=\'USA\'&$limit=500')
  .then(data => {
    console.log('COVID data:', data);
  });
```

---

## Authentication (Optional)

For better rate limits, create an API token:

1. Create account at https://data.cdc.gov/
2. Generate API token in account settings
3. Include in requests:

```bash
curl -H "X-App-Token: YOUR_TOKEN_HERE" \
  "https://data.cdc.gov/resource/29hc-w46k.json?$limit=10"
```

### Rate Limits
- **Without token**: 1000 requests per rolling hour
- **With token**: Higher limits (varies)

---

## Common Use Cases

### Get Latest Week's Data

```bash
# RSV - latest week
curl "https://data.cdc.gov/resource/29hc-w46k.json?\$where=state='RSV-NET'&\$order=week_ending_date DESC&\$limit=1"

# COVID-19 - latest week
curl "https://data.cdc.gov/resource/7dk4-g6vg.json?\$where=state='USA'&\$order=week_ending_date DESC&\$limit=1"
```

### Get Seasonal Trends

```bash
# RSV - entire 2023-24 season
curl "https://data.cdc.gov/resource/29hc-w46k.json?\$where=state='RSV-NET' AND season='2023-24'&\$order=week_ending_date ASC"
```

### Compare Multiple States

```bash
# RSV - compare CA, NY, TX for current season
curl "https://data.cdc.gov/resource/29hc-w46k.json?\$where=state IN ('California','New York','Texas') AND season='2023-24'&\$order=week_ending_date ASC&\$limit=1000"
```

### Get Peak Hospitalization Rates

```bash
# RSV - find peak rate
curl "https://data.cdc.gov/resource/29hc-w46k.json?\$where=state='RSV-NET'&\$order=rate DESC&\$limit=10"

# COVID-19 - find peak hospitalizations
curl "https://data.cdc.gov/resource/7dk4-g6vg.json?\$where=state='USA'&\$order=total_adm_all_covid_confirmed DESC&\$limit=10"
```

---

## Troubleshooting

### Empty Results

If you get empty results (`[]`), check:
- State name is correct (case-sensitive)
- Season format is correct (`YYYY-YY`)
- Date format is valid
- Query is properly URL-encoded

### URL Encoding

Special characters need to be URL-encoded:
- Space → `%20`
- Single quote `'` → `%27` (or use double quotes)
- Equals `=` in values → `%3D`

Example:
```bash
# Not encoded (may fail)
curl "https://data.cdc.gov/resource/29hc-w46k.json?$where=state='RSV-NET'"

# Properly encoded
curl "https://data.cdc.gov/resource/29hc-w46k.json?\$where=state='RSV-NET'"
```

### Rate Limiting

If you hit rate limits:
- Add delays between requests
- Get an API token
- Increase `$limit` to fetch more data per request
- Use pagination with `$offset`

---

## Additional Resources

- **Full Documentation**: [DATA_SOURCES.md](./DATA_SOURCES.md)
- **Socrata API Docs**: https://dev.socrata.com/
- **CDC Data Portal**: https://data.cdc.gov/
- **CDC Open APIs**: https://open.cdc.gov/apis.html

---

**Last Updated**: December 23, 2025
