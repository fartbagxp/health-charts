# CDC Data Sources Reference

Dataset catalog for finding and adding new health data. The app fetches CSVs from `fartbagxp/health` at build time — this doc is for discovering new datasets to add to that repo and then wire into `config.js`.

---

## Active Data Sources (already in use)

| Series                             | Source                             | Notes                      |
| ---------------------------------- | ---------------------------------- | -------------------------- |
| Flu / COVID / RSV hospitalizations | CDC RESP-NET combined CSV          | Weekly, 2020–present       |
| COVID-19 hospitalizations (legacy) | CDC COVID-NET `7dk4-g6vg`          | Archived through Sep 2023  |
| RSV hospitalization rate           | CDC RSV-NET `29hc-w46k`            | Weekly rate per 100k       |
| Respiratory death %                | CDC Open `resp_deaths_pct.csv`     | Weekly, Oct 2024–present   |
| Vaccination coverage (adults)      | CDC NIS-ACM `resp_vaccination.csv` | Weekly, 2025–present       |
| Nursing home vaccination           | CDC NHSN `nursing_home_resp.csv`   | Weekly, Oct 2024–present   |
| Mortality rate (all causes)        | CDC NCHS `mortality_rates.csv`     | Quarterly rolling 12-month |
| Birth rate (fertility)             | CDC NCHS `birth_indicators.csv`    | Quarterly                  |
| Annual births 1995–2024            | CDC WONDER natality (3 files)      | Annual                     |
| Annual deaths 1979–2024            | CDC WONDER mortality               | Annual                     |
| Deaths by cause 1979–2024          | CDC WONDER top-cause breakdown     | Annual                     |

---

## CDC Data Portals

- **CDC Open Data (Socrata)**: https://data.cdc.gov/ — respiratory, vaccination, NHSN datasets
- **CDC WONDER**: https://wonder.cdc.gov/ — natality, mortality, cause-of-death, long historical runs
- **CDC RESP-NET Dashboard**: https://www.cdc.gov/resp-net/dashboard/index.html — flu/COVID/RSV combined
- **CDC FluView**: https://www.cdc.gov/fluview/index.html — influenza surveillance
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
- COVID hospitalizations (archived 2020–2023): `7dk4-g6vg`
- COVID case surveillance: `vbim-akqf`
- Find more: https://dev.socrata.com/foundry/data.cdc.gov/

## CDC WONDER

Used for long historical runs (births, deaths by cause). Data is exported manually as CSV and committed to `fartbagxp/health`. Queries require the web interface at https://wonder.cdc.gov/ — not available via a simple API.

- Natality (births by year): https://wonder.cdc.gov/natality.html
- Mortality (deaths by cause): https://wonder.cdc.gov/ucd-icd10.html

## Data Quality Notes

- **RSV pre-Oct 2024**: Voluntary hospital reporting; likely undercounted by large factor
- **COVID-19 Socrata dataset** (`7dk4-g6vg`): Archived, data ends Sep 2023
- **CDC WONDER exports**: May require splitting into multiple files if date range spans ICD revision boundaries
- **CDC Open CSVs**: Headers are quoted (e.g. `"week_end"`) — the app's CSV parser strips outer quotes
