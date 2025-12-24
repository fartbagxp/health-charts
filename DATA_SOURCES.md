# CDC Data Sources for RSV and COVID-19

This document provides comprehensive information about accessing RSV and COVID-19 data from the CDC to integrate into the health-charts visualization project.

## Overview

The CDC provides multiple surveillance systems for tracking respiratory viruses including influenza, RSV, and COVID-19. Data is available through several platforms with API access and downloadable datasets.

---

## 1. CDC FluView and Respiratory Virus Surveillance

### Main Portal
- **URL**: https://www.cdc.gov/respiratory-viruses/data/index.html
- **Update Frequency**: Weekly (Fridays)
- **Coverage**: COVID-19, Influenza, and RSV activity

### Key Features
- Integrated respiratory virus surveillance
- State-level activity tracking
- Hospitalization data
- Emergency department visit trends
- Wastewater surveillance

---

## 2. RSV Data Sources

### 2.1 RSV-NET (Primary Source)
**RSV Hospitalization Surveillance Network**

- **Description**: Laboratory-confirmed RSV-associated hospitalizations among children and adults
- **Dashboard**: https://www.cdc.gov/rsv/php/surveillance/rsv-net.html
- **Update Frequency**: Weekly

### 2.2 CDC Data.gov Dataset (Recommended for API Access)

**Weekly Rates of Laboratory-Confirmed RSV Hospitalizations**

- **Dataset ID**: `29hc-w46k`
- **URL**: https://data.cdc.gov/Public-Health-Surveillance/Weekly-Rates-of-Laboratory-Confirmed-RSV-Hospitali/29hc-w46k
- **API Endpoint**: `https://data.cdc.gov/resource/29hc-w46k.json`

**Data Structure:**
```json
{
  "state": "Utah",
  "season": "2022-23",
  "week_ending_date": "2023-09-30",
  "age_category": "All",
  "sex": "All",
  "race": "All",
  "rate": "0.1",
  "cumulative_rate": "78.7",
  "type": "Crude Rate"
}
```

**Available Seasons**: 2020-21, 2021-22, 2022-23, 2023-24, 2024-25

**API Query Examples:**

```bash
# Get all RSV data for a specific season
curl "https://data.cdc.gov/resource/29hc-w46k.json?\$where=season='2022-23'&\$limit=1000"

# Get data for multiple seasons (2020-2024)
curl "https://data.cdc.gov/resource/29hc-w46k.json?\$where=season IN ('2020-21','2021-22','2022-23','2023-24')&\$limit=5000"

# Get national data (all states aggregated)
curl "https://data.cdc.gov/resource/29hc-w46k.json?\$where=state='Overall'&\$order=week_ending_date ASC"
```

### 2.3 Other RSV Data Sources

**NHSN Hospital Respiratory Data Dashboard**
- **URL**: https://www.cdc.gov/nhsn/psc/hospital-respiratory-dashboard.html
- **Includes**: COVID-19, Influenza, and RSV data from hospitals
- **Start Date**: Required reporting began November 1, 2024

**RESP-NET Dashboard**
- **URL**: https://www.cdc.gov/resp-net/dashboard/index.html
- **Coverage**: Combined COVID-19, Influenza, and RSV hospitalizations
- **Features**: Interactive charts, downloadable data

---

## 3. COVID-19 Data Sources

### 3.1 COVID-NET (Primary Source)
**COVID-19 Hospitalization Surveillance Network**

- **Description**: Laboratory-confirmed COVID-19-associated hospitalizations
- **Dashboard**: https://www.cdc.gov/covid/php/covid-net/index.html
- **Interactive Map**: https://gis.cdc.gov/grasp/covidnet/covid19_3.html
- **Coverage**: March 2020 - Present
- **Sample Size**: ~10% of US population

### 3.2 CDC Data.gov Dataset (Recommended for API Access)

**Weekly United States COVID-19 Hospitalization Metrics by Jurisdiction**

- **Dataset ID**: `7dk4-g6vg`
- **URL**: https://data.cdc.gov/Public-Health-Surveillance/Weekly-United-States-COVID-19-Hospitalization-Metr/7dk4-g6vg
- **Status**: ARCHIVED (contains historical 2020-2024 data)
- **API Endpoint**: `https://data.cdc.gov/resource/7dk4-g6vg.json`

**Data Structure:**
```json
{
  "week_ending_date": "2020-08-08T00:00:00.000",
  "state": "USA",
  "avg_adm_all_covid_confirmed": "4517.571428571428",
  "total_adm_all_covid_confirmed": "31623",
  "sum_adm_all_covid_confirmed": "1032508",
  "avg_total_patients": "2050.285714285714",
  "avg_percent_inpatient_beds": "1.870273923891379",
  "avg_percent_staff_icu_beds": "1.437423295641672"
}
```

**Date Range**: August 2020 - September 2023 (archived dataset)

**API Query Examples:**

```bash
# Get national COVID-19 hospitalization data
curl "https://data.cdc.gov/resource/7dk4-g6vg.json?\$where=state='USA'&\$order=week_ending_date ASC&\$limit=500"

# Get data for specific state
curl "https://data.cdc.gov/resource/7dk4-g6vg.json?\$where=state='CA'&\$order=week_ending_date ASC"

# Get data within date range
curl "https://data.cdc.gov/resource/7dk4-g6vg.json?\$where=week_ending_date>='2020-01-01' AND week_ending_date<='2024-12-31'&\$limit=5000"
```

### 3.3 Other COVID-19 Data Sources

**COVID-19 Case Surveillance Public Use Data**
- **Dataset ID**: `vbim-akqf`
- **URL**: https://data.cdc.gov/Case-Surveillance/COVID-19-Case-Surveillance-Public-Use-Data/vbim-akqf
- **Socrata API Docs**: https://dev.socrata.com/foundry/data.cdc.gov/vbim-akqf

**Rates of Laboratory-Confirmed COVID-19 Hospitalizations by Vaccination Status**
- **Dataset ID**: `k3na-u7xf`
- **URL**: https://data.cdc.gov/Case-Surveillance/Rates-of-Laboratory-Confirmed-COVID-19-Hospitaliza/k3na-u7xf

---

## 4. API Access Methods

### 4.1 CDC Data.gov (Socrata Open Data API)

The CDC uses Socrata's platform for hosting datasets. All datasets can be accessed via RESTful API.

**Base URL Format:**
```
https://data.cdc.gov/resource/{dataset-id}.{format}
```

**Supported Formats:**
- `.json` - JSON format
- `.csv` - CSV format
- `.xml` - XML format

**API Documentation:**
- Main Portal: https://data.cdc.gov/
- API Docs: https://open.cdc.gov/apis.html
- Socrata API Guide: https://dev.socrata.com/

**Authentication:**
- Anonymous access allowed (with rate limits)
- For better performance, create account at data.cdc.gov and obtain API token
- Include token in header: `X-App-Token: YOUR_TOKEN_HERE`

**Query Language (SoQL):**
```bash
# Select specific columns
$select=column1,column2,column3

# Filter data
$where=column='value' AND date>'2020-01-01'

# Order results
$order=date ASC

# Limit results
$limit=1000

# Offset for pagination
$offset=1000
```

### 4.2 Delphi Epidata API (Third-Party)

Carnegie Mellon University's Delphi Research Group provides an alternative API with additional processing.

**Base URL:**
```
https://api.delphi.cmu.edu/epidata/
```

**Documentation**: https://cmu-delphi.github.io/delphi-epidata/

**COVID-19 Endpoints:**
- State-level hospitalization: `/covid_hosp_state_timeseries/`
- COVIDcast signals: `/covidcast/`
- Hospital admissions: See https://cmu-delphi.github.io/delphi-epidata/api/hospital-admissions.html

**RSV Data:**
- NHSN Respiratory Hospitalizations: https://cmu-delphi.github.io/delphi-epidata/api/covidcast-signals/nhsn.html
- Note: Pre-Oct 31, 2024 RSV data has quality issues due to voluntary reporting

**Client Libraries:**
- Python: `pip install delphi-epidata`
- R: Available on CRAN
- JavaScript: npm package available

**Authentication:**
- Anonymous access allowed
- No API key required

---

## 5. Data Integration Recommendations

### For This Project (health-charts)

Based on the existing flu data format (`/public/data/flu-cases.json`):
```json
{ "date": "2020-01-01", "cases": 12500 }
```

### Recommended Approach:

1. **Use CDC Data.gov Socrata API** for most reliable, official data
2. **Create separate data files** for each virus:
   - `rsv-hospitalizations.json`
   - `covid-hospitalizations.json`

3. **Data Transformation Script** (to match existing format):

```javascript
// Example transformation for COVID-19 data
fetch('https://data.cdc.gov/resource/7dk4-g6vg.json?$where=state=\'USA\'&$order=week_ending_date ASC&$limit=500')
  .then(res => res.json())
  .then(data => {
    const transformed = data.map(d => ({
      date: d.week_ending_date.split('T')[0],
      cases: Math.round(parseFloat(d.total_adm_all_covid_confirmed))
    }));
    // Save to public/data/covid-hospitalizations.json
  });
```

```javascript
// Example transformation for RSV data
fetch('https://data.cdc.gov/resource/29hc-w46k.json?$where=state=\'Overall\' AND age_category=\'All\'&$order=week_ending_date ASC&$limit=500')
  .then(res => res.json())
  .then(data => {
    const transformed = data.map(d => ({
      date: d.week_ending_date,
      rate: parseFloat(d.rate)
    }));
    // Save to public/data/rsv-hospitalizations.json
  });
```

### Data Alignment Considerations:

- **Flu data**: Monthly aggregates (2020-2024)
- **RSV data**: Weekly rates by season (Oct-Sep seasons)
- **COVID-19 data**: Weekly hospitalizations (Aug 2020 - Sep 2023 archived)

**Recommendation**: Aggregate weekly data to monthly for consistency, or keep weekly granularity and update flu data to weekly.

---

## 6. Sample Data Collection Script

Create a file: `/scripts/fetch-cdc-data.js`

```javascript
const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, '../public/data');

async function fetchCovidData() {
  const url = 'https://data.cdc.gov/resource/7dk4-g6vg.json?$where=state=\'USA\'&$order=week_ending_date ASC&$limit=500';
  const response = await fetch(url);
  const data = await response.json();

  const transformed = data.map(d => ({
    date: d.week_ending_date.split('T')[0],
    hospitalizations: Math.round(parseFloat(d.total_adm_all_covid_confirmed))
  }));

  fs.writeFileSync(
    path.join(DATA_DIR, 'covid-hospitalizations.json'),
    JSON.stringify(transformed, null, 2)
  );

  console.log(`Fetched ${transformed.length} COVID-19 data points`);
}

async function fetchRSVData() {
  // Fetch multiple seasons
  const seasons = ['2020-21', '2021-22', '2022-23', '2023-24'];
  const whereClause = seasons.map(s => `season='${s}'`).join(' OR ');
  const url = `https://data.cdc.gov/resource/29hc-w46k.json?$where=(${whereClause}) AND state='Overall' AND age_category='All'&$order=week_ending_date ASC&$limit=1000`;

  const response = await fetch(url);
  const data = await response.json();

  const transformed = data.map(d => ({
    date: d.week_ending_date,
    rate: parseFloat(d.rate),
    cumulative_rate: parseFloat(d.cumulative_rate),
    season: d.season
  }));

  fs.writeFileSync(
    path.join(DATA_DIR, 'rsv-hospitalizations.json'),
    JSON.stringify(transformed, null, 2)
  );

  console.log(`Fetched ${transformed.length} RSV data points`);
}

async function main() {
  try {
    await fetchCovidData();
    await fetchRSVData();
    console.log('Data fetch complete!');
  } catch (error) {
    console.error('Error fetching data:', error);
  }
}

main();
```

---

## 7. Important Notes

### Data Quality Considerations:

1. **RSV Data**: Pre-October 31, 2024 data has significant quality issues due to voluntary reporting. Hospitalizations may be undercounted by factor of ~100.

2. **COVID-19 Data**: The main dataset (7dk4-g6vg) is archived and covers through September 2023. For current data, use COVID-NET dashboard or NHSN data.

3. **Updates**: Both datasets are updated weekly, typically on Fridays.

4. **Rate Limits**:
   - Socrata API: 1000 requests/rolling hour period (no auth)
   - With API token: Higher limits
   - Delphi API: No published limits

### Geographic Coverage:

- **RSV-NET**: Covers ~10% of US population across select counties
- **COVID-NET**: Covers ~10% of US population
- Both networks provide national and state-level estimates

### Timeframes:

- **RSV**: Seasonal data (typically Oct-Sep), available from 2020-21 season onward
- **COVID-19**: Weekly data from March 2020 onward
- **Flu** (existing): Monthly data 2020-2024

---

## 8. Additional Resources

### Official CDC Resources:
- FluView Portal: https://www.cdc.gov/fluview/index.html
- Respiratory Virus Data Channel: https://www.cdc.gov/respiratory-viruses/data/index.html
- CDC Open Technology APIs: https://open.cdc.gov/apis.html
- RESP-NET Dashboard: https://www.cdc.gov/resp-net/dashboard/index.html

### API Documentation:
- Socrata API Docs: https://dev.socrata.com/
- Socrata Foundry (CDC): https://dev.socrata.com/foundry/data.cdc.gov/
- Delphi Epidata API: https://cmu-delphi.github.io/delphi-epidata/

### Third-Party Tools:
- R Package (cdcfluview): https://github.com/hrbrmstr/cdcfluview
- Python CDC data tools: Various packages on PyPI
- Row Zero CDC Data Guide: https://rowzero.io/blog/cdc-data

---

## 9. Next Steps for Integration

1. Create data fetching script (`scripts/fetch-cdc-data.js`)
2. Add npm scripts to `package.json`:
   ```json
   "scripts": {
     "fetch-data": "node scripts/fetch-cdc-data.js"
   }
   ```
3. Decide on data granularity (weekly vs monthly)
4. Update chart components to handle multiple data series
5. Consider adding data source attribution to visualizations
6. Set up periodic data refresh (manual or automated)

---

**Last Updated**: December 23, 2025
**Data Coverage**: 2020-2024 (varies by source)
