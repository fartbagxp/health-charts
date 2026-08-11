# CDC Data Sources Reference

Dataset catalog for finding and adding new health data. The app fetches CSVs from `fartbagxp/health` at build time. This doc is for discovering new datasets to add to that repo and then wire into `config.js`.

---

## Active Data Sources (already in use)

| Series                             | Source                                                    | Notes                                |
| ---------------------------------- | --------------------------------------------------------- | ------------------------------------ |
| Flu / COVID / RSV hospitalizations | CDC RESP-NET combined CSV                                 | Weekly, 2020-present                 |
| COVID-19 hospitalizations (legacy) | CDC COVID-NET `7dk4-g6vg`                                 | Archived through Sep 2023            |
| RSV hospitalization rate           | CDC RSV-NET `29hc-w46k`                                   | Weekly rate per 100k                 |
| Respiratory death %                | CDC Open `resp_deaths_pct.csv`                            | Weekly, Oct 2024-present             |
| Vaccination coverage (adults)      | CDC NIS-ACM `resp_vaccination.csv`                        | Weekly, 2025-present                 |
| Nursing home vaccination           | CDC NHSN `nursing_home_resp.csv`                          | Weekly, Oct 2024-present             |
| Mortality rate (all causes)        | CDC NCHS `mortality_rates.csv`                            | Quarterly rolling 12-month           |
| Birth rate (fertility)             | CDC NCHS `birth_indicators.csv`                           | Quarterly                            |
| Annual births 1995-2024            | CDC WONDER natality (3 files)                             | Annual                               |
| Annual deaths 1979-2024            | CDC WONDER mortality                                      | Annual                               |
| Deaths by cause 1979-2024          | CDC WONDER top-cause breakdown                            | Annual                               |
| Measles weekly cases               | CDC `measles_weekly_cases.csv`                            | Weekly, 2022-present                 |
| Measles annual cases               | CDC `measles_annual_history.csv`                          | Annual, 1962-present                 |
| Life expectancy at birth           | CDC NCHS `life_expectancy.csv`                            | Annual, 1900-present                 |
| Lyme disease annual cases          | CDC WONDER `tick-borne-...csv`                            | Annual, 2016-present                 |
| Foodborne pathogen isolates        | CDC BEAM `beam_foodborne.csv`                             | Monthly, 2018-present                |
| Chronic disease prevalence (map)   | CDC PLACES `places_county.csv` (processed, slimmed)       | County-level, 2023, FIPS-keyed       |
| Health spending per capita         | NCHS DQS `dqs/national_health_spending.csv` (`s57w-7gbe`) | Annual, 1960-present                 |
| Drug overdose rate by opioid type  | NCHS DQS `dqs/drug_overdose_by_type.csv` (`rdjz-vn2n`)    | Annual, age-adjusted, 2018-present   |
| Low birthweight by state (map)     | NCHS DQS `dqs/low_birthweight_by_state.csv` (`ga7k-kycn`) | State-level, latest year, FIPS-keyed |

---

## CDC Data Portals

- **CDC Open Data (Socrata)**: https://data.cdc.gov/ (respiratory, vaccination, NHSN datasets)
- **CDC WONDER**: https://wonder.cdc.gov/ (natality, mortality, cause-of-death, long historical runs)
- **CDC RESP-NET Dashboard**: https://www.cdc.gov/resp-net/dashboard/index.html (flu/COVID/RSV combined)
- **CDC FluView**: https://www.cdc.gov/fluview/index.html (influenza surveillance)
- **Respiratory Virus Data Channel**: https://www.cdc.gov/respiratory-viruses/data/index.html

## Socrata API (CDC Open Data)

Datasets can be queried as CSV or JSON:

```bash
https://data.cdc.gov/resource/{dataset-id}.csv
https://data.cdc.gov/resource/{dataset-id}.json
```

Query syntax (SoQL):

```bash
?$where=state='USA'&$order=week_ending_date ASC&$limit=5000
```

Useful dataset IDs:

- RSV weekly rates: `29hc-w46k`
- COVID hospitalizations (archived 2020-2023): `7dk4-g6vg`
- COVID case surveillance: `vbim-akqf`
- Find more: https://dev.socrata.com/foundry/data.cdc.gov/

## CDC WONDER

Used for long historical runs (births, deaths by cause). Data is exported manually as CSV and committed to `fartbagxp/health`. Queries require the web interface at https://wonder.cdc.gov/; there is no simple API.

- Natality (births by year): https://wonder.cdc.gov/natality.html
- Mortality (deaths by cause): https://wonder.cdc.gov/ucd-icd10.html

## State Health Portals

Every series in this repo is federal CDC data. State-level sources are cataloged upstream in the `health` repo: [State Health Data Portals](https://fartbagxp.github.io/health/state-portals/) covers the official health data portal for all 50 states and DC along with which ones expose a usable API, and [State & Local Sources](https://fartbagxp.github.io/health/local/) covers the endpoints that have been verified against live data.

Before adding any state series, check the two notes below on California and New York. One of them duplicates a line this repo already charts.

## Data Quality Notes

- **RSV pre-Oct 2024**: Voluntary hospital reporting; likely undercounted by large factor
- **California is not an independent source**: Its Respiratory Virus Dashboard republishes CDC. Against NHSN (`ua7e-t2fy`), flu admissions match in 89 of 90 comparable weeks and COVID in 88 of 98. Charting it as a state series would duplicate an existing line under a different name. The COVID gap is confined to nine weeks (2024-09-07 through 2024-10-26) where CA ran 25% to 213% higher, ending the week of 2024-11-02, which lines up with the close of the voluntary-reporting era noted above
- **New York is independent and runs higher**: Summing `vgyq-b7tb` to statewide weekly COVID admissions exceeds CDC's New York figure in all 43 overlapping weeks (median ratio 1.23, range 1.09 to 2.29); flu from `iye6-rifr` runs 5% to 17% above CDC in peak weeks. Likely a broader reporting denominator than NHSN captures, though neither portal documents the reconciliation. Label any such series as state-sourced rather than blending it into a national line
- **COVID-19 Socrata dataset** (`7dk4-g6vg`): Archived, data ends Sep 2023
- **CDC WONDER exports**: May require splitting into multiple files if date range spans ICD revision boundaries
- **CDC Open CSVs**: Headers are quoted (e.g. `"week_end"`); the app's CSV parser strips outer quotes
