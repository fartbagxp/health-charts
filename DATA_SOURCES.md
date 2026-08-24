# CDC Data Sources Reference

The app fetches CSVs from [`fartbagxp/health`](https://github.com/fartbagxp/health)
at build time. This doc is the canonical reference for the surveillance systems
behind every chart. It is kept consistent with the `health` archive and with
`src/lib/sources.js` (which drives the on-site "Data Sources" section). For the
full upstream catalog of every dataset `health` collects, see its
[Data Catalog](https://fartbagxp.github.io/health/data-catalog/).

Each system below lists the collecting program, how it is collected, the CDC
center that runs it, how often it refreshes, and what it contains.

---

## Surveillance systems

| System (program) | CDC center | How it's collected | Frequency | Contains |
| ---------------- | ---------- | ------------------ | --------- | -------- |
| **NHSN**, National Healthcare Safety Network (Hospital Respiratory Data) | NCEZID, Div. of Healthcare Quality Promotion | Mandatory electronic reporting from acute-care hospitals | Weekly | COVID/flu/RSV new admissions, inpatient/ICU census, bed occupancy |
| **RESP-NET** (COVID-NET, RSV-NET, FluSurv-NET) | NCIRD respiratory surveillance programs | Population-based surveillance: lab-confirmed hospitalizations via EIP/IHSP catchment labs plus medical-record review | Weekly (seasonal) | Lab-confirmed flu/COVID/RSV hospitalization rates |
| **NVSS**, National Vital Statistics System (Rapid Release) | NCHS, Div. of Vital Statistics | Death and birth certificates filed by state vital-records offices | Weekly to quarterly (provisional) | Provisional mortality rates, % deaths from COVID/flu/RSV, birth indicators, monthly deaths by cause, life expectancy |
| **WONDER**, over NVSS and NNDSS | NCHS (platform) | Vital records and notifiable-disease case counts, as a query system | Annual (long runs) | Births since 1995, deaths by cause since 1979, maternal mortality, Lyme/tick-borne cases |
| **NIS**, National Immunization Survey (adult COVID / fall respiratory) | NCIRD, Immunization Services Div. | Random-digit-dial and probability-panel telephone survey | Weekly (respiratory season) | Adult flu/COVID/RSV vaccination coverage |
| **SchoolVaxView**, School Vaccination Assessment Program | NCIRD, Immunization Services Div. | State/local immunization programs report kindergarten school-entry records | Annual (school year) | Kindergarten MMR/DTaP/polio/HepB/varicella coverage and exemptions, national and by state |
| **NHSN (LTCF)**, nursing-home component | NCEZID, Div. of Healthcare Quality Promotion | Nursing-home facility reporting | Weekly | Nursing-home resident COVID/flu/RSV cases and up-to-date vaccination |
| **NWSS**, National Wastewater Surveillance System | CDC NWSS program (OPHDST, with NCIRD/CFA analytics) | RNA/DNA quantification from community wastewater at treatment plants (environmental sampling plus labs) | Weekly | SARS-CoV-2, flu A, RSV, measles, H5, mpox concentrations and activity levels |
| **BEAM Dashboard**, Bacteria, Enterics, Amoeba, and Mycotics | NCEZID, Div. of Foodborne, Waterborne, and Environmental Diseases | State/local public-health labs report pathogen isolates | Monthly | Salmonella, STEC, Campylobacter, Shigella, Vibrio isolate counts |
| **WISQARS**, Web-based Injury Statistics Query and Reporting System | NCIPC, Injury Prevention and Control | Compiled from NVSS death certificates and related systems | Annual (plus monthly provisional) | Firearm, suicide, homicide, drug-overdose death rates by geography |
| **NCHS DQS**, Data Query System (Health, United States) | NCHS | Vital records and CMS National Health Expenditure Accounts | Annual | Age-adjusted overdose rates by opioid type; national health spending per capita |
| **Epidemic Trends** (Rt nowcast) | CFA, Center for Forecasting and Outbreak Analytics | Model-based nowcast over ED-visit, wastewater, and hospitalization signals | Several times weekly | Growing/declining epidemic-trend class per state for COVID/flu/RSV |
| **Measles Surveillance**, via NNDSS | NCIRD, Div. of Viral Diseases | Case reporting from state/local health departments | Weekly (annual history) | Confirmed U.S. measles cases (weekly since 2022, annual since 1962) |
| **PLACES**, Local Data for Better Health | NCCDPHP, Chronic Disease Prevention | Small-area estimates modeled from the BRFSS telephone survey | Annual | County chronic-disease prevalence (obesity, diabetes, etc.) |
| **SEER\*Explorer**, Surveillance, Epidemiology, and End Results | **NCI (NIH)**, not CDC | Population-based cancer registries | Annual | Cancer incidence and U.S. mortality by site, sex, race, age |

> Collection methods at a glance: surveys (NIS, PLACES/BRFSS); vital records
> (NVSS, WONDER, WISQARS); hospital and facility reporting (NHSN); lab and
> population-based surveillance (RESP-NET, BEAM, measles/NNDSS); wastewater
> (NWSS); model-based nowcast (CFA); and cancer registries (SEER).

## Series in this app → system & dataset

| Chart series | System | Dataset / file |
| ------------ | ------ | -------------- |
| Flu / COVID / RSV hospitalizations | NHSN | `ua7e-t2fy` → `resp/respiratory-combined.csv` |
| COVID-19 hospitalizations (legacy) | COVID-NET | `7dk4-g6vg` (archived) |
| RSV hospitalization rate | RSV-NET | `29hc-w46k` |
| Respiratory death % | NVSS | `4bc2-bbpq` → `resp_deaths_pct.csv` |
| Adult vaccination coverage | NIS | `5c6r-xi2t` → `resp_vaccination.csv` |
| Kindergarten vaccination (incl. FL vs U.S. MMR) | SchoolVaxView | `ijqb-a7ye` → `schoolvaxview.csv` |
| Nursing-home vaccination | NHSN (LTCF) | `tscn-ryh9` → `nursing_home_resp.csv` |
| Mortality rate / birth rate / life expectancy | NVSS | `489q-934x`, `76vv-a7x8`, `w9j2-ggv5` |
| Annual births / deaths / deaths by cause | WONDER | natality & UCD mortality exports |
| Maternal mortality, Lyme disease | WONDER (NVSS / NNDSS) | `maternal-mortality-*`, `tick-borne-*` |
| Measles weekly / annual | Measles Surveillance | `measles_weekly_cases.csv`, `measles_annual_history.csv` |
| Wastewater: COVID / flu / RSV / measles / H5 / mpox | NWSS | `j9g8-acpt`, `ymmh-divb`, `45cq-cw4i`, `akvg-8vrb`, `mtpu-urpp`, `xpxn-rzgz` |
| COVID wastewater activity level | NWSS (public metric) | `2ew6-ywp6` → `nwss_metric.csv` |
| Epidemic growth nowcast | CFA Epidemic Trends | `5dqz-y4ea` → `epidemic_trends_national.csv` |
| Foodborne pathogen isolates | BEAM | `jbhn-e8xn` → `beam_foodborne.csv` |
| Injury / suicide / homicide / firearm / overdose | WISQARS | `injury_national.csv`, `suicide_by_sex.csv` |
| Cancer deaths by type / sex | SEER\*Explorer | `seer/mortality_by_year.csv` |
| Drug overdose rate by opioid type | NCHS DQS | `rdjz-vn2n` → `dqs/drug_overdose_by_type.csv` |
| Health spending per capita | NCHS DQS | `s57w-7gbe` → `dqs/national_health_spending.csv` |
| Chronic disease prevalence (map) | PLACES | `swc5-untb` → `processed/places_county.csv` |
| Low birthweight by state (map) | NCHS DQS | `ga7k-kycn` → `dqs/low_birthweight_by_state.csv` |

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
