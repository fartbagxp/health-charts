# CDC FluView Research Summary

**Research Date**: December 23, 2025
**Last Updated**: May 18, 2026
**Project**: health-charts visualization

## Executive Summary

Successfully researched and documented CDC data sources for RSV, COVID-19, and Flu. Collected datasets covering 2020–2024. The project has since been fully implemented as a SvelteKit static site with interactive charts powered by svelteplot.

---

## Key Findings

### 1. CDC FluView Overview

**Website**: https://www.cdc.gov/fluview/index.html

CDC FluView is part of the broader **Respiratory Virus Data Channel** which provides integrated surveillance for:
- Influenza
- COVID-19
- RSV (Respiratory Syncytial Virus)

**Update Schedule**: Weekly (Fridays)
**Data Access**: Multiple platforms including interactive dashboards and downloadable datasets

### 2. RSV Data Sources

#### Primary Source: RSV-NET
- **Full Name**: Respiratory Syncytial Virus Hospitalization Surveillance Network
- **Coverage**: ~10% of US population across select counties
- **Data Type**: Laboratory-confirmed RSV-associated hospitalizations
- **Available Since**: 2020–21 season

#### Best Data Source for This Project
- **Dataset ID**: 29hc-w46k
- **Name**: Weekly Rates of Laboratory-Confirmed RSV Hospitalizations
- **URL**: https://data.cdc.gov/Public-Health-Surveillance/Weekly-Rates-of-Laboratory-Confirmed-RSV-Hospitali/29hc-w46k
- **API Endpoint**: `https://data.cdc.gov/resource/29hc-w46k.json`
- **Format**: JSON, CSV, XML

**Sample Data Retrieved**: 209 records covering seasons 2020–21 through 2023–24

#### Data Structure
```json
{
  "state": "RSV-NET",
  "season": "2022-23",
  "week_ending_date": "2022-11-12",
  "age_category": "All",
  "sex": "All",
  "race": "All",
  "rate": "5.1",
  "cumulative_rate": "15.3",
  "type": "Crude Rate"
}
```

**Key Metrics**:
- Hospitalization rate per 100,000 population
- Cumulative rate for the season
- Weekly granularity
- Breakdowns by age, sex, race

**Peak Rate Found**: 5.1 per 100,000 (week of November 12, 2022)

#### RSV in Context
RSV hospitalizations are much smaller in scale than COVID-19 in absolute terms:
- RSV peak: **5.1/100k** → est. **~16,800 total hospitalizations** (rate × 3,300 US pop. multiplier)
- COVID-19 peak: **~150,650 weekly hospitalizations**
- RSV is roughly **9× smaller** at peak; the dashboard's per-series normalization visually equates them, so a context annotation is shown on the RSV panel to make the scale difference explicit.

### 3. COVID-19 Data Sources

#### Primary Source: COVID-NET
- **Full Name**: COVID-19-Associated Hospitalization Surveillance Network
- **Coverage**: ~10% of US population
- **Data Type**: Laboratory-confirmed COVID-19-associated hospitalizations
- **Available Since**: March 2020

#### Best Data Source for This Project
- **Dataset ID**: 7dk4-g6vg
- **Name**: Weekly United States COVID-19 Hospitalization Metrics by Jurisdiction
- **Status**: ARCHIVED (historical data through September 2023)
- **URL**: https://data.cdc.gov/Public-Health-Surveillance/Weekly-United-States-COVID-19-Hospitalization-Metr/7dk4-g6vg
- **API Endpoint**: `https://data.cdc.gov/resource/7dk4-g6vg.json`
- **Format**: JSON, CSV, XML

**Sample Data Retrieved**: 195 records covering August 2020 through April 2024

#### Data Structure
```json
{
  "week_ending_date": "2022-01-15T00:00:00.000",
  "state": "USA",
  "avg_adm_all_covid_confirmed": "4517.57",
  "total_adm_all_covid_confirmed": "31623",
  "sum_adm_all_covid_confirmed": "1032508"
}
```

**Peak Hospitalizations Found**: 150,650 admissions (week of January 15, 2022)

### 4. Data Access Methods

#### Method 1: CDC Data.gov (Recommended)
- **Platform**: Socrata Open Data API
- **Base URL**: https://data.cdc.gov/
- **Authentication**: Optional (improves rate limits)
- **Rate Limits**: 1,000 requests/hour (no auth)
- **Formats**: JSON, CSV, XML
- **Query Language**: SoQL (SQL-like syntax)

#### Method 2: Delphi Epidata API
- **Provider**: Carnegie Mellon University Delphi Research Group
- **Base URL**: https://api.delphi.cmu.edu/epidata/
- **Limitations**: RSV data quality issues pre-Oct 2024 (voluntary reporting); third-party source

#### Method 3: Interactive Dashboards (manual only)
- RESP-NET: https://www.cdc.gov/resp-net/dashboard/index.html
- COVID-NET: https://gis.cdc.gov/grasp/covidnet/covid19_3.html
- RSV-NET: https://www.cdc.gov/rsv/php/surveillance/rsv-net.html

---

## Data Quality Notes

### RSV Data
- **Pre-October 2024**: Significant quality issues due to voluntary hospital reporting
- **Undercounting**: Hospitalizations may be undercounted by factor of ~100 before mandatory reporting
- **Current Status**: Mandatory reporting began November 1, 2024 via NHSN
- **Recommendation**: Use data with appropriate caveats, especially for 2020–2023

### COVID-19 Data
- **Archived Dataset**: Main dataset (7dk4-g6vg) is archived with historical data through Sep 2023
- **Current Data**: For recent data, use COVID-NET dashboard or NHSN Hospital Respiratory Data
- **Data Lag**: Typically 1–2 weeks behind real-time

### Data Alignment
- **Flu**: Monthly aggregates
- **RSV**: Weekly rates, seasonal (Oct–Sep)
- **COVID-19**: Weekly hospitalizations

---

## Implementation Status

### Completed

#### Application (SvelteKit + svelteplot)
- Home page with per-series normalized sparklines (0–100% of own peak) for all three viruses
- Series detail pages with full-height line chart, metrics grid (latest, peak, average), CSV export
- Interactive hover tooltips using `position: fixed` (escapes nested `overflow: hidden` clipping); flips side at 60% viewport width
- RSV context annotation on home page panel: *"Peak X/100k · est. Y total hospitalizations vs. COVID-19 peak of Z/wk"* — computed live from data
- Fully static output via `@sveltejs/adapter-static`

#### Data
- `public/data/covid-hospitalizations.json` — 195 records, 2020–2024
- `public/data/rsv-hospitalizations.json` — 209 records, 2020–2024
- `public/data/flu-cases.json` — monthly flu cases, 2020–2024

#### Scripts
- `scripts/fetch-cdc-data.js` — fetches RSV + COVID from CDC Socrata API
- `scripts/setup-datawrapper.js` — legacy Datawrapper setup (unused in current stack)

### Remaining / Future Work
1. Set up automated data refresh (GitHub Actions cron)
2. Add data freshness indicator to UI
3. Add seasonal markers for RSV (Oct–Sep seasons)
4. State-level drill-down capability
5. Consider NHSN combined respiratory data when more historical data is available
6. Convert flu data from monthly to weekly granularity for consistency

---

## API Endpoints Summary

### RSV Hospitalization Data
```
GET https://data.cdc.gov/resource/29hc-w46k.json
```

**Common Queries**:
```
# National data, all seasons
?$where=state='RSV-NET'&$limit=1000

# Specific season
?$where=state='RSV-NET' AND season='2023-24'
```

### COVID-19 Hospitalization Data
```
GET https://data.cdc.gov/resource/7dk4-g6vg.json
```

**Common Queries**:
```
# National data
?$where=state='USA'&$limit=500

# Date range
?$where=state='USA' AND week_ending_date>='2022-01-01'
```

---

## Data Comparison

| Metric         | Flu            | RSV                    | COVID-19               |
|----------------|----------------|------------------------|------------------------|
| Timeframe      | 2020–2024      | 2020–2024              | 2020–2024              |
| Granularity    | Monthly        | Weekly                 | Weekly                 |
| Records        | 60             | 209                    | 195                    |
| Metric Type    | Cases          | Rate per 100k          | Total admissions       |
| Peak Value     | —              | 5.1/100k (~16,800 est) | 150,650/wk             |
| Geographic     | National       | National + States      | National + States      |
| Update Freq    | Static         | Weekly                 | Weekly (archived)      |

---

## Resources & References

### Official CDC Resources
- FluView Portal: https://www.cdc.gov/fluview/index.html
- Respiratory Virus Data Channel: https://www.cdc.gov/respiratory-viruses/data/index.html
- CDC Data Portal: https://data.cdc.gov/
- RESP-NET Dashboard: https://www.cdc.gov/resp-net/dashboard/index.html

### API Documentation
- Socrata API: https://dev.socrata.com/
- Delphi Epidata API: https://cmu-delphi.github.io/delphi-epidata/

### Datasets
- RSV Weekly Rates: https://data.cdc.gov/Public-Health-Surveillance/Weekly-Rates-of-Laboratory-Confirmed-RSV-Hospitali/29hc-w46k
- COVID-19 Weekly Metrics: https://data.cdc.gov/Public-Health-Surveillance/Weekly-United-States-COVID-19-Hospitalization-Metr/7dk4-g6vg

---

**Prepared by**: Claude (Anthropic)
**Original Research Date**: December 23, 2025
**Last Updated**: May 18, 2026
**Project**: health-charts
**Status**: Implemented and deployed
