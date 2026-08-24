const RAW_BASE = 'https://raw.githubusercontent.com/fartbagxp/health/main/data/raw/resp';
const WONDER_BASE = 'https://raw.githubusercontent.com/fartbagxp/health/main/data/raw/wonder';
const CDC_OPEN_BASE = 'https://raw.githubusercontent.com/fartbagxp/health/main/data/raw/cdc_open';
const CDC_OPEN_PROCESSED_BASE = 'https://raw.githubusercontent.com/fartbagxp/health/main/data/processed/cdc_open';
const WISQARS_BASE = 'https://raw.githubusercontent.com/fartbagxp/health/main/data/raw/wisqars';
const SEER_BASE = 'https://raw.githubusercontent.com/fartbagxp/health/main/data/raw/seer';
const DQS_BASE = 'https://raw.githubusercontent.com/fartbagxp/health/main/data/raw/dqs';

export const SERIES_CONFIG = {
  flu: {
    id: 'flu',
    title: 'Flu New Admissions',
    description: 'Weekly influenza new hospital admissions from CDC surveillance (2020-present)',
    color: '#1a6faf',
    csvUrl: `${RAW_BASE}/respiratory-combined.csv`,
    valueKey: 'flu_new_admissions',
    unit: 'admissions',
    format: ',',
    source: 'CDC NHSN',
    sourceUrl: 'https://data.cdc.gov/d/ua7e-t2fy',
    frequency: 'Weekly',
    category: 'Influenza'
  },
  covid: {
    id: 'covid',
    title: 'COVID-19 Hospitalizations',
    description: 'Weekly COVID-19-associated hospital admissions (2020-2024, archived COVID-NET series; for current admissions see the Flu/COVID/RSV NHSN charts)',
    color: '#e63946',
    csvUrl: `${RAW_BASE}/covid-hospitalizations.csv`,
    valueKey: 'hospitalizations',
    unit: 'hospitalizations',
    format: ',',
    source: 'CDC COVID-NET',
    sourceUrl: 'https://data.cdc.gov/d/7dk4-g6vg',
    frequency: 'Weekly',
    category: 'COVID-19'
  },
  rsv: {
    id: 'rsv',
    title: 'RSV Hospitalization Rate',
    description: 'Weekly RSV-associated hospitalization rate per 100,000 from CDC RSV-NET (2020-present)',
    color: '#2a9d8f',
    csvUrl: `${RAW_BASE}/rsv-hospitalizations.csv`,
    valueKey: 'rate',
    unit: 'per 100,000',
    format: '.1f',
    source: 'CDC RSV-NET',
    sourceUrl: 'https://data.cdc.gov/d/29hc-w46k',
    frequency: 'Weekly',
    category: 'Respiratory Syncytial Virus'
  },

  // Respiratory pathogen share of all U.S. deaths (CDC, weekly, Oct 2024–present)
  'resp-deaths-flu': {
    id: 'resp-deaths-flu',
    title: 'Flu Share of Deaths',
    description: 'Influenza as a percentage of all U.S. deaths, weekly (Oct 2024-present)',
    color: '#1a6faf',
    csvUrl: `${CDC_OPEN_BASE}/resp_deaths_pct.csv`,
    dateKey: 'week_end',
    valueKey: 'percent_deaths',
    filters: { pathogen: 'Influenza' },
    unit: '% of deaths',
    format: '.2f',
    source: 'CDC Open Data Portal',
    sourceUrl: 'https://data.cdc.gov/d/4bc2-bbpq',
    frequency: 'Weekly',
    category: 'Influenza'
  },
  'resp-deaths-covid': {
    id: 'resp-deaths-covid',
    title: 'COVID-19 Share of Deaths',
    description: 'COVID-19 as a percentage of all U.S. deaths, weekly (Oct 2024-present)',
    color: '#e63946',
    csvUrl: `${CDC_OPEN_BASE}/resp_deaths_pct.csv`,
    dateKey: 'week_end',
    valueKey: 'percent_deaths',
    filters: { pathogen: 'COVID-19' },
    unit: '% of deaths',
    format: '.2f',
    source: 'CDC Open Data Portal',
    sourceUrl: 'https://data.cdc.gov/d/4bc2-bbpq',
    frequency: 'Weekly',
    category: 'COVID-19'
  },
  'resp-deaths-rsv': {
    id: 'resp-deaths-rsv',
    title: 'RSV Share of Deaths',
    description: 'RSV as a percentage of all U.S. deaths, weekly (Oct 2024-present)',
    color: '#2a9d8f',
    csvUrl: `${CDC_OPEN_BASE}/resp_deaths_pct.csv`,
    dateKey: 'week_end',
    valueKey: 'percent_deaths',
    filters: { pathogen: 'RSV' },
    unit: '% of deaths',
    format: '.2f',
    source: 'CDC Open Data Portal',
    sourceUrl: 'https://data.cdc.gov/d/4bc2-bbpq',
    frequency: 'Weekly',
    category: 'Respiratory Syncytial Virus'
  },

  // Vaccination coverage (CDC NIS-ACM, national, adults 18+, weekly Oct 2025–present)
  'vacc-flu': {
    id: 'vacc-flu',
    title: 'Flu Vaccination Coverage',
    description: 'Percentage of U.S. adults 18+ up-to-date on flu vaccine, national, weekly (2025-present)',
    color: '#1a6faf',
    csvUrl: `${CDC_OPEN_BASE}/resp_vaccination.csv`,
    dateKey: 'week_ending',
    valueKey: 'nd_weekly_estimate',
    filters: {
      vaccine: 'FLU',
      geographic_level: 'National',
      demographic_name: '18+ years',
      indicator_label: 'Up-to-date',
      indicator_category_label: 'Yes'
    },
    unit: '% vaccinated',
    format: '.1f',
    source: 'CDC NIS-ACM',
    sourceUrl: 'https://data.cdc.gov/d/5c6r-xi2t',
    frequency: 'Weekly',
    category: 'Influenza',
    yDomain: [0, 100]
  },
  'vacc-covid': {
    id: 'vacc-covid',
    title: 'COVID-19 Vaccination Coverage',
    description: 'Percentage of U.S. adults 18+ up-to-date on COVID-19 vaccine, national, weekly (2025-present)',
    color: '#e63946',
    csvUrl: `${CDC_OPEN_BASE}/resp_vaccination.csv`,
    dateKey: 'week_ending',
    valueKey: 'nd_weekly_estimate',
    filters: {
      vaccine: 'COVID',
      geographic_level: 'National',
      demographic_name: '18+ years',
      indicator_label: 'Up-to-date',
      indicator_category_label: 'Yes'
    },
    unit: '% vaccinated',
    format: '.1f',
    source: 'CDC NIS-ACM',
    sourceUrl: 'https://data.cdc.gov/d/5c6r-xi2t',
    frequency: 'Weekly',
    category: 'COVID-19',
    yDomain: [0, 100]
  },
  'vacc-rsv': {
    id: 'vacc-rsv',
    title: 'RSV Vaccination Coverage',
    description: 'Percentage of U.S. adults 50+ up-to-date on RSV vaccine, national, weekly (2025-present)',
    color: '#2a9d8f',
    csvUrl: `${CDC_OPEN_BASE}/resp_vaccination.csv`,
    dateKey: 'week_ending',
    valueKey: 'nd_weekly_estimate',
    filters: {
      vaccine: 'RSV',
      geographic_level: 'National',
      demographic_name: '50+ years',
      indicator_label: 'Up-to-date',
      indicator_category_label: 'Yes'
    },
    unit: '% vaccinated',
    format: '.1f',
    source: 'CDC NIS-ACM',
    sourceUrl: 'https://data.cdc.gov/d/5c6r-xi2t',
    frequency: 'Weekly',
    category: 'Respiratory Syncytial Virus',
    yDomain: [0, 100]
  },

  // Kindergarten vaccination coverage — SchoolVaxView (CDC, 2009–present)
  'schoolvax': {
    id: 'schoolvax',
    title: 'Kindergarten Vaccination Coverage',
    description: 'Annual vaccination coverage rates for U.S. kindergartners by vaccine, national, 2009-present (CDC SchoolVaxView)',
    csvUrl: `${CDC_OPEN_BASE}/schoolvaxview.csv`,
    dateKey: 'year_season',
    dateFormat: 'schoolyear',
    valueKey: 'coverage_estimate',
    unit: '% vaccinated',
    format: '.1f',
    source: 'CDC SchoolVaxView',
    sourceUrl: 'https://data.cdc.gov/d/ijqb-a7ye',
    frequency: 'Annual',
    category: 'Vaccination Coverage',
    yDomain: [80, 100],
    subSeries: [
      { key: 'dtap',      label: 'DTaP/DTP',   color: '#1a6faf', filters: { vaccine: 'DTP, DTaP, or DT', geography_type: 'National' } },
      { key: 'mmr',       label: 'MMR',         color: '#6a4c93', filters: { vaccine: 'MMR',          geography_type: 'National' } },
      { key: 'polio',     label: 'Polio',       color: '#2a9d8f', filters: { vaccine: 'Polio',        geography_type: 'National' } },
      { key: 'hepb',      label: 'Hepatitis B', color: '#e07a5f', filters: { vaccine: 'Hepatitis B',  geography_type: 'National' } },
      { key: 'varicella', label: 'Varicella',   color: '#f4a261', filters: { vaccine: 'Varicella', dose: '1 Dose (unknown disease history)', geography_type: 'National' } }
    ]
  },

  // U.S. annual births (CDC WONDER, 1995–2024)
  'births-annual': {
    id: 'births-annual',
    title: 'U.S. Annual Births',
    description: 'Total U.S. live births per year, 1995-2024 (CDC WONDER natality data)',
    color: '#f4a261',
    csvUrls: [
      `${WONDER_BASE}/births-by-year-1995-2002.csv`,
      `${WONDER_BASE}/births-by-year-2003-2006.csv`,
      `${WONDER_BASE}/births-by-year-2007-2024.csv`
    ],
    dateKey: 'Year',
    dateFormat: 'year',
    valueKey: 'Births',
    unit: 'births',
    format: ',.0f',
    source: 'CDC WONDER (Natality)',
    sourceUrl: 'https://wonder.cdc.gov/natality-v2009.html',
    frequency: 'Annual',
    category: 'Birth & Mortality'
  },

  // Overall U.S. mortality rate (CDC, quarterly rolling 12-month, 2023–present)
  'mortality-all': {
    id: 'mortality-all',
    title: 'U.S. Mortality Rate',
    description: 'Age-adjusted mortality rate per 100,000 for all causes, U.S. national, rolling 12-month (2023-present)',
    color: '#6a4c93',
    csvUrl: `${CDC_OPEN_BASE}/mortality_rates.csv`,
    dateKey: 'year_and_quarter',
    dateFormat: 'quarter',
    valueKey: 'rate_overall',
    filters: {
      cause_of_death: 'All causes',
      time_period: '12 months ending with quarter',
      rate_type: 'Age-adjusted'
    },
    unit: 'deaths per 100,000',
    format: '.1f',
    source: 'CDC NCHS',
    sourceUrl: 'https://data.cdc.gov/d/489q-934x',
    frequency: 'Quarterly',
    category: 'Mortality'
  },

  // U.S. birth rate — general fertility rate (CDC, quarterly, 2023–present)
  'birth-rate': {
    id: 'birth-rate',
    title: 'U.S. Birth Rate',
    description: 'General fertility rate per 1,000 women aged 15-44, U.S. national, quarterly (2023-present)',
    color: '#f4a261',
    csvUrl: `${CDC_OPEN_BASE}/birth_indicators.csv`,
    dateKey: 'year_and_quarter',
    dateFormat: 'quarter',
    valueKey: 'rate',
    filters: {
      topic: 'Birth Rates',
      topic_subgroup: 'General Fertility Rates',
      indicator: '15-44 years',
      race_ethnicity: 'All races and origins'
    },
    unit: 'per 1,000 women',
    format: '.1f',
    source: 'CDC NCHS',
    sourceUrl: 'https://data.cdc.gov/d/76vv-a7x8',
    frequency: 'Quarterly',
    category: 'Birth & Mortality'
  },

  // U.S. total deaths per year (CDC WONDER, 1979–2024)
  'deaths-annual': {
    id: 'deaths-annual',
    title: 'U.S. Annual Deaths',
    description: 'Total U.S. deaths per year, 1979-2024 (CDC WONDER)',
    color: '#6a4c93',
    csvUrl: `${WONDER_BASE}/mortality-total-by-year.csv`,
    dateKey: 'year',
    dateFormat: 'year',
    valueKey: 'total_deaths',
    unit: 'deaths',
    format: ',.0f',
    source: 'CDC WONDER (Underlying Cause of Death)',
    sourceUrl: 'https://wonder.cdc.gov/ucd-icd10-expanded.html',
    frequency: 'Annual',
    category: 'Birth & Mortality'
  },

  // Leading causes of death (CDC WONDER, 1979–2024)
  'deaths-circulatory': {
    id: 'deaths-circulatory',
    title: 'Deaths: Circulatory Disease',
    description: 'Annual U.S. deaths from diseases of the circulatory system (the #1 cause every year), 1979-2024',
    color: '#e63946',
    csvUrl: `${WONDER_BASE}/mortality-top5-causes-by-year.csv`,
    dateKey: 'year',
    dateFormat: 'year',
    valueKey: 'deaths',
    filters: { cause: 'Diseases of the circulatory system' },
    unit: 'deaths',
    format: ',.0f',
    source: 'CDC WONDER (Underlying Cause of Death)',
    sourceUrl: 'https://wonder.cdc.gov/ucd-icd10-expanded.html',
    frequency: 'Annual',
    category: 'Birth & Mortality'
  },
  'deaths-cancer': {
    id: 'deaths-cancer',
    title: 'Deaths: Cancer',
    description: 'Annual U.S. deaths from neoplasms (cancer, the #2 cause every year), 1979-2024',
    color: '#e07a5f',
    csvUrl: `${WONDER_BASE}/mortality-top5-causes-by-year.csv`,
    dateKey: 'year',
    dateFormat: 'year',
    valueKey: 'deaths',
    filters: { cause: 'Neoplasms' },
    unit: 'deaths',
    format: ',.0f',
    source: 'CDC WONDER (Underlying Cause of Death)',
    sourceUrl: 'https://wonder.cdc.gov/ucd-icd10-expanded.html',
    frequency: 'Annual',
    category: 'Birth & Mortality'
  },
  // Cancer deaths by type — top 8 cancer sites by mortality burden (NCI SEER, 2000-2024)
  'deaths-cancer-by-type': {
    id: 'deaths-cancer-by-type',
    title: 'Deaths: Cancer by Type',
    description: 'Annual U.S. cancer deaths for 7 of the cancer types with the highest mortality burden, 2000-2024. Breast reflects female cases (99% of breast cancer deaths); Prostate is male-only by nature of the disease. Leukemia is temporarily omitted — the upstream SEER snapshot dropped its combined-subtype total.',
    csvUrl: `${SEER_BASE}/mortality_by_year.csv`,
    dateKey: 'year',
    dateFormat: 'year',
    valueKey: 'count',
    unit: 'deaths',
    format: ',.0f',
    source: 'NCI SEER*Explorer (U.S. Mortality)',
    sourceUrl: 'https://seer.cancer.gov/statistics-network/explorer/',
    frequency: 'Annual',
    category: 'Birth & Mortality',
    subSeries: [
      { key: 'lung',       label: 'Lung and Bronchus',       color: '#1a6faf', filters: { site_label: 'Lung and Bronchus', sex_label: 'Both Sexes' } },
      { key: 'colorectal', label: 'Colon and Rectum',        color: '#e63946', filters: { site_label: 'Colon and Rectum (including Appendix)', sex_label: 'Both Sexes' } },
      { key: 'pancreas',   label: 'Pancreas',                 color: '#eda100', filters: { site_label: 'Pancreas', sex_label: 'Both Sexes' } },
      { key: 'breast',     label: 'Breast (Female)',          color: '#2a9d8f', filters: { site_label: 'Breast', sex_label: 'Female' } },
      { key: 'prostate',   label: 'Prostate',                 color: '#6a4c93', filters: { site_label: 'Prostate', sex_label: 'Male' } },
      { key: 'liver',      label: 'Liver and Bile Duct',      color: '#e76f51', filters: { site_label: 'Liver and Intrahepatic Bile Duct', sex_label: 'Both Sexes' } },
      { key: 'nhl',        label: 'Non-Hodgkin Lymphoma',     color: '#e07a5f', filters: { site_label: 'Non-Hodgkin Lymphoma', sex_label: 'Both Sexes' } }
    ]
  },

  // Cancer deaths by sex — top 5 cancers common to both sexes (NCI SEER, 2000-2024)
  'cancer-sex-lung': {
    id: 'cancer-sex-lung',
    title: 'Lung Cancer Deaths by Sex',
    description: 'Annual U.S. lung and bronchus cancer deaths by sex, 2000-2024',
    csvUrl: `${SEER_BASE}/mortality_by_year.csv`,
    dateKey: 'year',
    dateFormat: 'year',
    valueKey: 'count',
    unit: 'deaths',
    format: ',.0f',
    source: 'NCI SEER*Explorer (U.S. Mortality)',
    sourceUrl: 'https://seer.cancer.gov/statistics-network/explorer/',
    frequency: 'Annual',
    category: 'Birth & Mortality',
    subSeries: [
      { key: 'male', label: 'Male', color: '#1a6faf', filters: { site_label: 'Lung and Bronchus', sex_label: 'Male' } },
      { key: 'female', label: 'Female', color: '#e07a5f', filters: { site_label: 'Lung and Bronchus', sex_label: 'Female' } }
    ]
  },
  'cancer-sex-colorectal': {
    id: 'cancer-sex-colorectal',
    title: 'Colorectal Cancer Deaths by Sex',
    description: 'Annual U.S. colon and rectum cancer deaths by sex, 2000-2024',
    csvUrl: `${SEER_BASE}/mortality_by_year.csv`,
    dateKey: 'year',
    dateFormat: 'year',
    valueKey: 'count',
    unit: 'deaths',
    format: ',.0f',
    source: 'NCI SEER*Explorer (U.S. Mortality)',
    sourceUrl: 'https://seer.cancer.gov/statistics-network/explorer/',
    frequency: 'Annual',
    category: 'Birth & Mortality',
    subSeries: [
      { key: 'male', label: 'Male', color: '#1a6faf', filters: { site_label: 'Colon and Rectum (including Appendix)', sex_label: 'Male' } },
      { key: 'female', label: 'Female', color: '#e07a5f', filters: { site_label: 'Colon and Rectum (including Appendix)', sex_label: 'Female' } }
    ]
  },
  'cancer-sex-pancreas': {
    id: 'cancer-sex-pancreas',
    title: 'Pancreatic Cancer Deaths by Sex',
    description: 'Annual U.S. pancreatic cancer deaths by sex, 2000-2024',
    csvUrl: `${SEER_BASE}/mortality_by_year.csv`,
    dateKey: 'year',
    dateFormat: 'year',
    valueKey: 'count',
    unit: 'deaths',
    format: ',.0f',
    source: 'NCI SEER*Explorer (U.S. Mortality)',
    sourceUrl: 'https://seer.cancer.gov/statistics-network/explorer/',
    frequency: 'Annual',
    category: 'Birth & Mortality',
    subSeries: [
      { key: 'male', label: 'Male', color: '#1a6faf', filters: { site_label: 'Pancreas', sex_label: 'Male' } },
      { key: 'female', label: 'Female', color: '#e07a5f', filters: { site_label: 'Pancreas', sex_label: 'Female' } }
    ]
  },
  'cancer-sex-liver': {
    id: 'cancer-sex-liver',
    title: 'Liver Cancer Deaths by Sex',
    description: 'Annual U.S. liver and intrahepatic bile duct cancer deaths by sex, 2000-2024',
    csvUrl: `${SEER_BASE}/mortality_by_year.csv`,
    dateKey: 'year',
    dateFormat: 'year',
    valueKey: 'count',
    unit: 'deaths',
    format: ',.0f',
    source: 'NCI SEER*Explorer (U.S. Mortality)',
    sourceUrl: 'https://seer.cancer.gov/statistics-network/explorer/',
    frequency: 'Annual',
    category: 'Birth & Mortality',
    subSeries: [
      { key: 'male', label: 'Male', color: '#1a6faf', filters: { site_label: 'Liver and Intrahepatic Bile Duct', sex_label: 'Male' } },
      { key: 'female', label: 'Female', color: '#e07a5f', filters: { site_label: 'Liver and Intrahepatic Bile Duct', sex_label: 'Female' } }
    ]
  },
  // Hidden: the upstream SEER snapshot (data/raw/seer/mortality_by_year.csv
  // in health) dropped the combined 'Leukemia' site_label in favor of narrow
  // myeloid subtypes (AML, CML, CMML, AML-M5) with no lymphocytic leukemia
  // types and no aggregate total, so this filter now matches zero rows.
  // Re-enable once the upstream catalog restores the aggregate site.
  'cancer-sex-leukemia': {
    id: 'cancer-sex-leukemia',
    title: 'Leukemia Deaths by Sex',
    description: 'Annual U.S. leukemia deaths by sex, 2000-2024',
    csvUrl: `${SEER_BASE}/mortality_by_year.csv`,
    dateKey: 'year',
    dateFormat: 'year',
    valueKey: 'count',
    unit: 'deaths',
    format: ',.0f',
    source: 'NCI SEER*Explorer (U.S. Mortality)',
    sourceUrl: 'https://seer.cancer.gov/statistics-network/explorer/',
    frequency: 'Annual',
    category: 'Birth & Mortality',
    hidden: true,
    subSeries: [
      { key: 'male', label: 'Male', color: '#1a6faf', filters: { site_label: 'Leukemia', sex_label: 'Male' } },
      { key: 'female', label: 'Female', color: '#e07a5f', filters: { site_label: 'Leukemia', sex_label: 'Female' } }
    ]
  },

  'deaths-respiratory': {
    id: 'deaths-respiratory',
    title: 'Deaths: Respiratory Disease',
    description: 'Annual U.S. deaths from diseases of the respiratory system, 1979-2024',
    color: '#2a9d8f',
    csvUrl: `${WONDER_BASE}/mortality-top5-causes-by-year.csv`,
    dateKey: 'year',
    dateFormat: 'year',
    valueKey: 'deaths',
    filters: { cause: 'Diseases of the respiratory system' },
    unit: 'deaths',
    format: ',.0f',
    source: 'CDC WONDER (Underlying Cause of Death)',
    sourceUrl: 'https://wonder.cdc.gov/ucd-icd10-expanded.html',
    frequency: 'Annual',
    category: 'Birth & Mortality'
  },

  // Deaths by place of death — monthly, all causes (CDC WONDER Provisional
  // Mortality Statistics D176, 2018–2024)
  'deaths-by-place': {
    id: 'deaths-by-place',
    title: 'U.S. Deaths by Place of Death',
    description: 'Monthly U.S. deaths by place of death (all causes), national, 2018-2024',
    csvUrl: `${WONDER_BASE}/deaths-by-place-of-death.csv`,
    dateKey: ['year', 'month'],
    dateFormat: 'year-month',
    valueKey: 'deaths',
    unit: 'deaths',
    format: ',.0f',
    source: 'CDC WONDER (Provisional Mortality Statistics)',
    sourceUrl: 'https://wonder.cdc.gov/mcd-icd10-provisional.html',
    frequency: 'Monthly',
    category: 'Mortality',
    subSeries: [
      { key: 'home',     label: "Decedent's home",              color: '#1a6faf', filters: { place: "Decedent's home" } },
      { key: 'inpatient',label: 'Medical Facility - Inpatient',  color: '#e63946', filters: { place: 'Medical Facility - Inpatient' } },
      { key: 'nursing',  label: 'Nursing home/long term care',   color: '#f4a261', filters: { place: 'Nursing home/long term care' } },
      { key: 'hospice',  label: 'Hospice facility',              color: '#2a9d8f', filters: { place: 'Hospice facility' } },
      { key: 'er',       label: 'Medical Facility - Outpatient or ER', color: '#6a4c93', filters: { place: 'Medical Facility - Outpatient or ER' } },
      { key: 'other',    label: 'Other',                         color: '#457b9d', filters: { place: 'Other' } },
      { key: 'doa',      label: 'Medical Facility - Dead on Arrival', color: '#e76f51', filters: { place: 'Medical Facility - Dead on Arrival' } },
      { key: 'unknown',  label: 'Place of death unknown',        color: '#a0a0a0', filters: { place: 'Place of death unknown' } }
    ]
  },

  // U.S. life expectancy at birth — combined (CDC NCHS, 1900–present)
  'life-expectancy-combined': {
    id: 'life-expectancy-combined',
    title: 'U.S. Life Expectancy',
    description: 'Average life expectancy at birth by sex, all races, U.S. (1900-present)',
    csvUrl: `${CDC_OPEN_BASE}/life_expectancy.csv`,
    dateKey: 'year',
    dateFormat: 'year',
    valueKey: 'average_life_expectancy',
    unit: 'years',
    format: '.1f',
    source: 'CDC NCHS',
    sourceUrl: 'https://data.cdc.gov/d/w9j2-ggv5',
    frequency: 'Annual',
    category: 'Mortality',
    subSeries: [
      { key: 'avg', label: 'Both Sexes', color: '#457b9d', filters: { race: 'All Races', sex: 'Both Sexes' } },
      { key: 'male', label: 'Male', color: '#1a6faf', filters: { race: 'All Races', sex: 'Male' } },
      { key: 'female', label: 'Female', color: '#e07a5f', filters: { race: 'All Races', sex: 'Female' } }
    ]
  },

  // Nursing home respiratory vaccination rates (CDC, weekly, Oct 2024–Oct 2025, national)
  'nursing-covid': {
    id: 'nursing-covid',
    title: 'Nursing Home COVID-19 Vaccination',
    description: 'Percentage of nursing home residents up-to-date on COVID-19 vaccine, U.S. national, weekly',
    color: '#e63946',
    csvUrl: `${CDC_OPEN_BASE}/nursing_home_resp.csv`,
    dateKey: 'survweekend',
    valueKey: 'pct_totresuptodate',
    filters: { jurisdiction: 'USA' },
    unit: '% up-to-date',
    format: '.1f',
    source: 'CDC NHSN',
    sourceUrl: 'https://data.cdc.gov/d/tscn-ryh9',
    frequency: 'Weekly',
    category: 'COVID-19',
    yDomain: [0, 100]
  },
  'nursing-flu': {
    id: 'nursing-flu',
    title: 'Nursing Home Flu Vaccination',
    description: 'Percentage of nursing home residents vaccinated against flu, U.S. national, weekly',
    color: '#1a6faf',
    csvUrl: `${CDC_OPEN_BASE}/nursing_home_resp.csv`,
    dateKey: 'survweekend',
    valueKey: 'pct_numresfluvacc',
    filters: { jurisdiction: 'USA' },
    unit: '% vaccinated',
    format: '.1f',
    source: 'CDC NHSN',
    sourceUrl: 'https://data.cdc.gov/d/tscn-ryh9',
    frequency: 'Weekly',
    category: 'Influenza',
    yDomain: [0, 100]
  },
  'nursing-rsv': {
    id: 'nursing-rsv',
    title: 'Nursing Home RSV Vaccination',
    description: 'Percentage of nursing home residents vaccinated against RSV, U.S. national, weekly',
    color: '#2a9d8f',
    csvUrl: `${CDC_OPEN_BASE}/nursing_home_resp.csv`,
    dateKey: 'survweekend',
    valueKey: 'pct_numresrsvvacc',
    filters: { jurisdiction: 'USA' },
    unit: '% vaccinated',
    format: '.1f',
    source: 'CDC NHSN',
    sourceUrl: 'https://data.cdc.gov/d/tscn-ryh9',
    frequency: 'Weekly',
    category: 'Respiratory Syncytial Virus',
    yDomain: [0, 100]
  },

  // Measles — weekly confirmed U.S. cases (CDC, 2022–present)
  'measles-weekly': {
    id: 'measles-weekly',
    title: 'Measles Weekly Cases',
    description: 'Weekly confirmed measles cases in the U.S. (2022-present)',
    color: '#6a4c93',
    csvUrl: `${CDC_OPEN_BASE}/measles_weekly_cases.csv`,
    dateKey: 'week_end',
    valueKey: 'cases',
    unit: 'cases',
    format: ',',
    source: 'CDC Measles Surveillance',
    sourceUrl: 'https://www.cdc.gov/measles/data-research/index.html',
    frequency: 'Weekly',
    category: 'Measles'
  },

  // Measles — annual U.S. cases, long historical run (CDC, 1962–present)
  'measles-annual': {
    id: 'measles-annual',
    title: 'U.S. Annual Measles Cases',
    description: 'Reported measles cases per year in the U.S., 1962-present. Cases collapsed after the 1963 vaccine and the 2000 elimination.',
    color: '#6a4c93',
    csvUrl: `${CDC_OPEN_BASE}/measles_annual_history.csv`,
    dateKey: 'year',
    dateFormat: 'year',
    valueKey: 'cases',
    unit: 'cases',
    format: ',.0f',
    source: 'CDC Measles Surveillance',
    sourceUrl: 'https://www.cdc.gov/measles/data-research/index.html',
    frequency: 'Annual',
    category: 'Measles',
    // Pre-vaccine years (1962-64) ran 400k+ cases/year while recent years run
    // in the tens to low thousands; a linear axis flattens the whole
    // post-1963 era into an invisible line near zero, so this series uses a
    // log y-axis to keep both eras readable.
    yScale: 'log',
    // Vertical reference lines marking the two events that explain this
    // series' shape. `date` is parsed with the series' own dateFormat, so it
    // stays a plain year string here, matching dateKey's values.
    annotations: [
      { date: '1963', label: 'Vaccine licensed' },
      { date: '2000', label: 'US declares elimination' }
    ]
  },

  // U.S. life expectancy at birth (CDC NCHS, 1900–present) — kept for direct URL access
  'life-expectancy': {
    id: 'life-expectancy',
    title: 'U.S. Life Expectancy',
    description: 'Average life expectancy at birth, all races, both sexes, U.S. (1900-present)',
    color: '#457b9d',
    csvUrl: `${CDC_OPEN_BASE}/life_expectancy.csv`,
    dateKey: 'year',
    dateFormat: 'year',
    valueKey: 'average_life_expectancy',
    filters: { race: 'All Races', sex: 'Both Sexes' },
    unit: 'years',
    format: '.1f',
    source: 'CDC NCHS',
    sourceUrl: 'https://data.cdc.gov/d/w9j2-ggv5',
    frequency: 'Annual',
    category: 'Mortality',
    hidden: true
  },

  // U.S. life expectancy at birth — male, all races (CDC NCHS, 1900–present)
  'life-expectancy-male': {
    id: 'life-expectancy-male',
    title: 'U.S. Life Expectancy: Male',
    description: 'Average life expectancy at birth for males, all races, U.S. (1900-present)',
    color: '#1a6faf',
    csvUrl: `${CDC_OPEN_BASE}/life_expectancy.csv`,
    dateKey: 'year',
    dateFormat: 'year',
    valueKey: 'average_life_expectancy',
    filters: { race: 'All Races', sex: 'Male' },
    unit: 'years',
    format: '.1f',
    source: 'CDC NCHS',
    sourceUrl: 'https://data.cdc.gov/d/w9j2-ggv5',
    frequency: 'Annual',
    category: 'Mortality',
    hidden: true
  },

  // U.S. life expectancy at birth — female, all races (CDC NCHS, 1900–present)
  'life-expectancy-female': {
    id: 'life-expectancy-female',
    title: 'U.S. Life Expectancy: Female',
    description: 'Average life expectancy at birth for females, all races, U.S. (1900-present)',
    color: '#e07a5f',
    csvUrl: `${CDC_OPEN_BASE}/life_expectancy.csv`,
    dateKey: 'year',
    dateFormat: 'year',
    valueKey: 'average_life_expectancy',
    filters: { race: 'All Races', sex: 'Female' },
    unit: 'years',
    format: '.1f',
    source: 'CDC NCHS',
    sourceUrl: 'https://data.cdc.gov/d/w9j2-ggv5',
    frequency: 'Annual',
    category: 'Mortality',
    hidden: true
  },

  // Wastewater surveillance (CDC NWSS, site-level weekly samples aggregated to national median)
  'wastewater-covid': {
    id: 'wastewater-covid',
    title: 'COVID-19 Wastewater Signal',
    description: 'National median flow-normalized SARS-CoV-2 RNA concentration across U.S. wastewater sampling sites (NWSS), aggregated weekly',
    color: '#e63946',
    csvUrl: `${CDC_OPEN_PROCESSED_BASE}/wastewater_covid.csv`,
    dateKey: 'sample_collect_date',
    valueKey: 'pcr_target_flowpop_lin',
    unit: 'copies/person/day',
    format: '.3s',
    source: 'CDC NWSS',
    sourceUrl: 'https://data.cdc.gov/d/j9g8-acpt',
    frequency: 'Weekly (aggregated)',
    category: 'Wastewater'
  },
  'wastewater-flu': {
    id: 'wastewater-flu',
    title: 'Influenza A Wastewater Signal',
    description: 'National median flow-normalized Influenza A RNA concentration across U.S. wastewater sampling sites (NWSS), aggregated weekly',
    color: '#1a6faf',
    csvUrl: `${CDC_OPEN_PROCESSED_BASE}/wastewater_flu.csv`,
    dateKey: 'sample_collect_date',
    valueKey: 'pcr_target_flowpop_lin',
    unit: 'copies/person/day',
    format: '.3s',
    source: 'CDC NWSS',
    sourceUrl: 'https://data.cdc.gov/d/ymmh-divb',
    frequency: 'Weekly (aggregated)',
    category: 'Wastewater'
  },
  'wastewater-rsv': {
    id: 'wastewater-rsv',
    title: 'RSV Wastewater Signal',
    description: 'National median flow-normalized RSV RNA concentration across U.S. wastewater sampling sites (NWSS), aggregated weekly',
    color: '#2a9d8f',
    csvUrl: `${CDC_OPEN_PROCESSED_BASE}/wastewater_rsv.csv`,
    dateKey: 'sample_collect_date',
    valueKey: 'pcr_target_flowpop_lin',
    unit: 'copies/person/day',
    format: '.3s',
    source: 'CDC NWSS',
    sourceUrl: 'https://data.cdc.gov/d/45cq-cw4i',
    frequency: 'Weekly (aggregated)',
    category: 'Wastewater'
  },
  'wastewater-measles': {
    id: 'wastewater-measles',
    title: 'Measles Wastewater Signal',
    description: 'National median flow-normalized measles RNA concentration across U.S. wastewater sampling sites (NWSS), aggregated weekly',
    color: '#6a4c93',
    csvUrl: `${CDC_OPEN_PROCESSED_BASE}/wastewater_measles.csv`,
    dateKey: 'sample_collect_date',
    valueKey: 'pcr_target_flowpop_lin',
    unit: 'copies/person/day',
    format: '.3s',
    source: 'CDC NWSS',
    sourceUrl: 'https://data.cdc.gov/d/akvg-8vrb',
    frequency: 'Weekly (aggregated)',
    category: 'Wastewater'
  },
  'wastewater-h5': {
    id: 'wastewater-h5',
    title: 'Avian Flu H5 Wastewater Signal',
    description: 'National median flow-normalized Influenza A (H5) RNA concentration across U.S. wastewater sampling sites (NWSS), aggregated weekly',
    color: '#f4a261',
    csvUrl: `${CDC_OPEN_PROCESSED_BASE}/wastewater_h5.csv`,
    dateKey: 'sample_collect_date',
    valueKey: 'pcr_target_flowpop_lin',
    unit: 'copies/person/day',
    format: '.3s',
    source: 'CDC NWSS',
    sourceUrl: 'https://data.cdc.gov/d/mtpu-urpp',
    frequency: 'Weekly (aggregated)',
    category: 'Wastewater'
  },

  // Maternal mortality — annual U.S. deaths (CDC WONDER, 1999–present)
  'maternal-mortality': {
    id: 'maternal-mortality',
    title: 'U.S. Maternal Mortality',
    description: 'Total maternal deaths per year in the U.S. (1999-present)',
    color: '#e07a5f',
    csvUrl: `${WONDER_BASE}/maternal-mortality-by-year.csv`,
    dateKey: 'year',
    dateFormat: 'year',
    valueKey: 'deaths',
    unit: 'deaths',
    format: ',.0f',
    source: 'CDC WONDER',
    sourceUrl: 'https://wonder.cdc.gov/',
    frequency: 'Annual',
    category: 'Birth & Mortality'
  },

  // Historical leading cause death rates (CDC NCHS, 1900–present)
  'death-rates-historical': {
    id: 'death-rates-historical',
    title: 'U.S. Leading Cause Death Rates',
    description: 'Age-adjusted death rates per 100,000 for leading causes of U.S. death (1900-present)',
    csvUrl: `${CDC_OPEN_BASE}/death_rates_historical.csv`,
    dateKey: 'year',
    dateFormat: 'year',
    valueKey: 'age_adjusted_death_rate',
    unit: 'deaths per 100,000',
    format: '.1f',
    source: 'CDC NCHS',
    sourceUrl: 'https://www.cdc.gov/nchs/',
    frequency: 'Annual',
    category: 'Mortality',
    subSeries: [
      { key: 'heart', label: 'Heart Disease', color: '#e63946', filters: { leading_causes: 'Heart Disease' } },
      { key: 'cancer', label: 'Cancer', color: '#e07a5f', filters: { leading_causes: 'Cancer' } },
      { key: 'stroke', label: 'Stroke', color: '#6a4c93', filters: { leading_causes: 'Stroke' } },
      { key: 'accidents', label: 'Accidents', color: '#f4a261', filters: { leading_causes: 'Accidents' } },
      { key: 'flu-pneumonia', label: 'Flu & Pneumonia', color: '#1a6faf', filters: { leading_causes: 'Influenza and Pneumonia' } }
    ]
  },

  // Injury & overdose — monthly rates (CDC WISQARS, 2019–present)
  'injury-drug-od': {
    id: 'injury-drug-od',
    title: 'Drug Overdose Death Rate',
    description: 'Annualized monthly drug overdose death rate per 100,000, U.S. national (2019-present)',
    color: '#6a4c93',
    csvUrl: `${WISQARS_BASE}/injury_national.csv`,
    dateKey: 'period',
    valueKey: 'rate',
    filters: { intent: 'Drug_OD', type: 'month' },
    unit: 'deaths per 100,000 (annualized)',
    format: '.1f',
    source: 'CDC WISQARS',
    sourceUrl: 'https://wisqars.cdc.gov/',
    frequency: 'Monthly',
    category: 'Injury & Overdose'
  },

  // Drug deaths by year — annual U.S. counts by drug type (CDC WONDER, 1999–2024)
  'drug-deaths-by-year': {
    id: 'drug-deaths-by-year',
    title: 'U.S. Drug Overdose Deaths by Type',
    description: 'Annual U.S. drug overdose deaths by substance type, 1999-2024. Fentanyl surpassed all other drugs around 2016 and now dominates. Data from 2021 onward are provisional. Source: CDC WONDER.',
    csvUrl: `${WONDER_BASE}/drug-deaths-by-year.csv`,
    dateKey: 'year',
    dateFormat: 'year',
    valueKey: 'deaths',
    unit: 'deaths',
    format: ',.0f',
    source: 'CDC WONDER',
    sourceUrl: 'https://wonder.cdc.gov/ucd-icd10-expanded.html',
    frequency: 'Annual',
    category: 'Injury & Overdose',
    subSeries: [
      { key: 'fentanyl',        label: 'Fentanyl (synthetic opioids)',       color: '#e63946', filters: { drug_code: 'T40.4' } },
      { key: 'cocaine',         label: 'Cocaine',                            color: '#2a9d8f', filters: { drug_code: 'T40.5' } },
      { key: 'stimulants',      label: 'Psychostimulants (meth/amphetamines)', color: '#e9c46a', filters: { drug_code: 'T43.6' } },
      { key: 'heroin',          label: 'Heroin',                             color: '#e76f51', filters: { drug_code: 'T40.1' } },
      { key: 'other-opioids',   label: 'Other opioids (natural/semi-synthetic)', color: '#f4a261', filters: { drug_code: 'T40.2' } },
      { key: 'methadone',       label: 'Methadone',                          color: '#457b9d', filters: { drug_code: 'T40.3' } },
      { key: 'cannabis',        label: 'Cannabis',                           color: '#52b788', filters: { drug_code: 'T40.7' } }
    ]
  },

  'injury-suicide': {
    id: 'injury-suicide',
    title: 'Suicide Death Rate',
    description: 'Annualized monthly suicide death rate per 100,000, U.S. national (2019-present)',
    color: '#457b9d',
    csvUrl: `${WISQARS_BASE}/injury_national.csv`,
    dateKey: 'period',
    valueKey: 'rate',
    filters: { intent: 'All_Suicide', type: 'month' },
    unit: 'deaths per 100,000 (annualized)',
    format: '.1f',
    source: 'CDC WISQARS',
    sourceUrl: 'https://wisqars.cdc.gov/',
    frequency: 'Monthly',
    category: 'Injury & Overdose'
  },
  'injury-homicide': {
    id: 'injury-homicide',
    title: 'Homicide Death Rate',
    description: 'Annualized monthly homicide death rate per 100,000, U.S. national (2019-present)',
    color: '#e63946',
    csvUrl: `${WISQARS_BASE}/injury_national.csv`,
    dateKey: 'period',
    valueKey: 'rate',
    filters: { intent: 'All_Homicide', type: 'month' },
    unit: 'deaths per 100,000 (annualized)',
    format: '.1f',
    source: 'CDC WISQARS',
    sourceUrl: 'https://wisqars.cdc.gov/',
    frequency: 'Monthly',
    category: 'Injury & Overdose'
  },
  'injury-firearm': {
    id: 'injury-firearm',
    title: 'Firearm Death Rate',
    description: 'Annualized monthly firearm death rate per 100,000 (all intents), U.S. national (2019-present)',
    color: '#f4a261',
    csvUrl: `${WISQARS_BASE}/injury_national.csv`,
    dateKey: 'period',
    valueKey: 'rate',
    filters: { intent: 'FA_Deaths', type: 'month' },
    unit: 'deaths per 100,000 (annualized)',
    format: '.1f',
    source: 'CDC WISQARS',
    sourceUrl: 'https://wisqars.cdc.gov/',
    frequency: 'Monthly',
    category: 'Injury & Overdose'
  },

  // Foodborne pathogens — BEAM monthly human isolates (CDC, 2018–present)
  'beam-foodborne': {
    id: 'beam-foodborne',
    title: 'Foodborne Pathogen Isolates',
    description: 'Monthly human isolate counts for five enteric pathogens from CDC BEAM surveillance (2018-present)',
    csvUrl: `${CDC_OPEN_BASE}/beam_foodborne.csv`,
    dateKey: 'date',
    valueKey: 'isolates',
    unit: 'isolates',
    format: ',',
    source: 'CDC BEAM',
    sourceUrl: 'https://www.cdc.gov/beam/dashboard/index.html',
    frequency: 'Monthly',
    category: 'Foodborne Disease',
    subSeries: [
      { key: 'salmonella', label: 'Salmonella', color: '#e63946', filters: { pathogen: 'Salmonella' } },
      { key: 'stec', label: 'STEC (E. coli)', color: '#f4a261', filters: { pathogen: 'STEC' } },
      { key: 'campylobacter', label: 'Campylobacter', color: '#2a9d8f', filters: { pathogen: 'Campylobacter' } },
      { key: 'shigella', label: 'Shigella', color: '#6a4c93', filters: { pathogen: 'Shigella' } },
      { key: 'vibrio', label: 'Vibrio', color: '#457b9d', filters: { pathogen: 'Vibrio' } }
    ]
  },

  // Suicide rate by sex — annual (CDC WISQARS + WONDER, 1999–2024)
  'suicide-by-sex': {
    id: 'suicide-by-sex',
    title: 'U.S. Suicide Rate by Sex',
    description: 'Annual U.S. suicide death rate per 100,000 by sex, 1999-2024. Male rates are consistently 3.5-4× female rates. Source: CDC WISQARS 1999-2016; CDC WONDER D77/D176 2017-2024.',
    csvUrl: `${WISQARS_BASE}/suicide_by_sex.csv`,
    dateKey: 'year',
    dateFormat: 'year',
    valueKey: 'crude_rate',
    unit: 'deaths per 100,000',
    format: '.1f',
    source: 'CDC WISQARS / CDC WONDER',
    sourceUrl: 'https://wisqars.cdc.gov/',
    frequency: 'Annual',
    category: 'Injury & Overdose',
    subSeries: [
      { key: 'male', label: 'Male', color: '#1a6faf', filters: { sex: 'Male' } },
      { key: 'female', label: 'Female', color: '#e07a5f', filters: { sex: 'Female' } },
      { key: 'both', label: 'Both Sexes', color: '#a0a0a0', filters: { sex: 'Both sexes' } }
    ]
  },

  // Lyme disease — annual U.S. cases (CDC NNDSS via WONDER, 2016–present)
  'lyme-disease': {
    id: 'lyme-disease',
    title: 'Lyme Disease Cases',
    description: 'Total reported Lyme disease cases per year in the U.S. (2016-present)',
    color: '#52b788',
    csvUrl: `${WONDER_BASE}/tick-borne-diseases-by-year.csv`,
    dateKey: 'year',
    dateFormat: 'year',
    valueKey: 'cases',
    filters: { disease: 'Lyme disease, Total' },
    unit: 'cases',
    format: ',.0f',
    source: 'CDC NNDSS via WONDER',
    sourceUrl: 'https://wonder.cdc.gov/nndss/nndss_annual_tables_menu.asp',
    frequency: 'Annual',
    category: 'Tick-borne Disease'
  },

  // Drug overdose death rate by opioid type — age-adjusted per 100,000 (NCHS DQS,
  // NVSS). Complements the WONDER count-based 'drug-deaths-by-year' with an
  // age-adjusted *rate* and the DQS opioid-category breakdown.
  'drug-overdose-rate-by-type': {
    id: 'drug-overdose-rate-by-type',
    title: 'Drug Overdose Death Rate by Opioid Type',
    description: 'Age-adjusted U.S. drug overdose death rate per 100,000, by opioid type, 2018-present. Source: NCHS Data Query System (NVSS).',
    csvUrl: `${DQS_BASE}/drug_overdose_by_type.csv`,
    dateKey: 'year',
    dateFormat: 'year',
    valueKey: 'rate',
    unit: 'deaths per 100,000 (age adjusted)',
    format: '.1f',
    source: 'NCHS DQS (NVSS)',
    sourceUrl: 'https://data.cdc.gov/d/rdjz-vn2n',
    frequency: 'Annual',
    category: 'Injury & Overdose',
    subSeries: [
      { key: 'all',                   label: 'All drug overdose deaths',            color: '#6a4c93', filters: { drug_type: 'all' } },
      { key: 'any_opioid',            label: 'Any opioid',                          color: '#e63946', filters: { drug_type: 'any_opioid' } },
      { key: 'synthetic_opioids',     label: 'Synthetic opioids (excl. methadone)', color: '#e76f51', filters: { drug_type: 'synthetic_opioids' } },
      { key: 'natural_semisynthetic', label: 'Natural & semisynthetic opioids',     color: '#f4a261', filters: { drug_type: 'natural_semisynthetic' } },
      { key: 'heroin',                label: 'Heroin',                              color: '#2a9d8f', filters: { drug_type: 'heroin' } },
      { key: 'methadone',             label: 'Methadone',                           color: '#457b9d', filters: { drug_type: 'methadone' } }
    ]
  },

  // Health spending — U.S. national health expenditure per capita, 1960–present
  // (NCHS DQS / CMS National Health Expenditure Accounts). The CSV also carries
  // dollars_billions and pct_gdp columns for alternate framings. Kept last so it
  // closes out the homepage chart list.
  'health-spending-per-capita': {
    id: 'health-spending-per-capita',
    title: 'U.S. Health Spending per Capita',
    description: 'National health expenditure per person per year, 1960-present (decadal before 2000, annual after). Source: NCHS Data Query System / CMS National Health Expenditure Accounts.',
    color: '#1a6faf',
    csvUrl: `${DQS_BASE}/national_health_spending.csv`,
    dateKey: 'year',
    dateFormat: 'year',
    valueKey: 'dollars_per_capita',
    unit: 'dollars per capita',
    format: '$,.0f',
    source: 'NCHS DQS (CMS NHEA)',
    sourceUrl: 'https://data.cdc.gov/d/s57w-7gbe',
    frequency: 'Annual',
    category: 'Health Spending'
  },

  // Mpox wastewater signal (CDC NWSS, site-level weekly samples -> national median)
  'wastewater-mpox': {
    id: 'wastewater-mpox',
    title: 'Mpox Wastewater Signal',
    description: 'National median flow-normalized Mpox (monkeypox) DNA concentration across U.S. wastewater sampling sites (NWSS), aggregated weekly (2025-present)',
    color: '#9b5de5',
    csvUrl: `${CDC_OPEN_PROCESSED_BASE}/wastewater_mpox.csv`,
    dateKey: 'sample_collect_date',
    valueKey: 'pcr_target_flowpop_lin',
    unit: 'copies/person/day',
    format: '.3s',
    source: 'CDC NWSS',
    sourceUrl: 'https://data.cdc.gov/d/xpxn-rzgz',
    frequency: 'Weekly (aggregated)',
    category: 'Wastewater'
  },

  // COVID-19 wastewater activity percentile: the interpreted NWSS metric the
  // public dashboard shows (CDC NWSS, site-level -> national weekly median)
  'wastewater-covid-percentile': {
    id: 'wastewater-covid-percentile',
    title: 'COVID-19 Wastewater Activity Level',
    description: 'National median COVID-19 wastewater activity percentile across U.S. sampling sites: where current levels sit within each site\'s own history, 0-100 (NWSS public metric, weekly)',
    color: '#e63946',
    csvUrl: `${CDC_OPEN_PROCESSED_BASE}/nwss_metric.csv`,
    dateKey: 'week_end',
    valueKey: 'median_percentile',
    unit: 'activity percentile',
    format: '.0f',
    source: 'CDC NWSS (public metric)',
    sourceUrl: 'https://data.cdc.gov/d/2ew6-ywp6',
    frequency: 'Weekly (aggregated)',
    category: 'Wastewater',
    yDomain: [0, 100]
  },

  // CFA epidemic-trend nowcast: share of states with a growing trajectory,
  // by respiratory disease (CDC Center for Forecasting & Outbreak Analytics)
  'cfa-epidemic-growth': {
    id: 'cfa-epidemic-growth',
    title: 'Epidemic Growth Nowcast (share of states rising)',
    description: 'Percentage of U.S. states where CDC\'s Center for Forecasting and Outbreak Analytics (CFA) nowcasts a growing trajectory for each respiratory disease. A near-real-time trend signal, not a case count. Accumulates weekly as CFA publishes.',
    csvUrl: `${CDC_OPEN_PROCESSED_BASE}/epidemic_trends_national.csv`,
    dateKey: 'date',
    valueKey: 'pct_growing',
    unit: '% of states growing',
    format: '.0f',
    source: 'CDC CFA (Epidemic Trends)',
    sourceUrl: 'https://data.cdc.gov/d/5dqz-y4ea',
    frequency: 'Daily (nowcast)',
    category: 'Forecasting',
    yDomain: [0, 100],
    subSeries: [
      { key: 'covid', label: 'COVID-19', color: '#e63946', filters: { disease: 'COVID-19' } },
      { key: 'flu',   label: 'Influenza', color: '#1a6faf', filters: { disease: 'Influenza' } },
      { key: 'rsv',   label: 'RSV',       color: '#2a9d8f', filters: { disease: 'RSV' } }
    ]
  },

  // Kindergarten MMR coverage, Florida vs national (CDC SchoolVaxView, 2009-present).
  // Florida fell below the 90% line in 2023-24; the 95% herd-immunity threshold
  // for measles sits above every recent national figure.
  'schoolvax-mmr-florida': {
    id: 'schoolvax-mmr-florida',
    title: 'Kindergarten MMR Coverage: Florida vs U.S.',
    description: 'Annual MMR vaccination coverage among kindergartners, Florida vs the U.S. national estimate, 2009-present. Florida dropped below 90% in 2023-24 (CDC SchoolVaxView).',
    csvUrl: `${CDC_OPEN_BASE}/schoolvaxview.csv`,
    dateKey: 'year_season',
    dateFormat: 'schoolyear',
    valueKey: 'coverage_estimate',
    unit: '% vaccinated',
    format: '.1f',
    source: 'CDC SchoolVaxView',
    sourceUrl: 'https://data.cdc.gov/d/ijqb-a7ye',
    frequency: 'Annual',
    category: 'Vaccination Coverage',
    yDomain: [80, 100],
    subSeries: [
      { key: 'florida',  label: 'Florida',       color: '#e63946', filters: { vaccine: 'MMR', geography: 'Florida', geography_type: 'States' } },
      { key: 'national', label: 'United States',  color: '#457b9d', filters: { vaccine: 'MMR', geography: 'United States', geography_type: 'National' } }
    ]
  }
};

export const CATEGORIES = [
  { name: 'All Series', series: ['flu', 'covid', 'rsv', 'resp-deaths-flu', 'resp-deaths-covid', 'resp-deaths-rsv', 'vacc-flu', 'vacc-covid', 'vacc-rsv', 'nursing-flu', 'nursing-covid', 'nursing-rsv', 'wastewater-covid', 'wastewater-flu', 'wastewater-rsv', 'wastewater-measles', 'wastewater-h5', 'measles-weekly', 'measles-annual', 'lyme-disease', 'births-annual', 'deaths-annual', 'deaths-circulatory', 'deaths-cancer', 'deaths-cancer-by-type', 'cancer-sex-lung', 'cancer-sex-colorectal', 'cancer-sex-pancreas', 'cancer-sex-liver', 'deaths-respiratory', 'deaths-by-place', 'mortality-all', 'life-expectancy-combined', 'birth-rate', 'maternal-mortality', 'death-rates-historical', 'injury-drug-od', 'injury-suicide', 'injury-homicide', 'injury-firearm', 'suicide-by-sex', 'beam-foodborne', 'schoolvax', 'schoolvax-mmr-florida', 'drug-deaths-by-year', 'drug-overdose-rate-by-type', 'health-spending-per-capita', 'wastewater-mpox', 'wastewater-covid-percentile', 'cfa-epidemic-growth'] },
  { name: 'Forecasting', series: ['cfa-epidemic-growth'] },
  { name: 'Hospitalizations', series: ['flu', 'covid', 'rsv'] },
  { name: 'Vaccination Coverage', series: ['vacc-flu', 'vacc-covid', 'vacc-rsv', 'schoolvax', 'schoolvax-mmr-florida'] },
  { name: 'Nursing Home Vaccination', series: ['nursing-flu', 'nursing-covid', 'nursing-rsv'] },
  { name: 'Respiratory Mortality', series: ['resp-deaths-flu', 'resp-deaths-covid', 'resp-deaths-rsv'] },
  { name: 'Wastewater Surveillance', series: ['wastewater-covid', 'wastewater-flu', 'wastewater-rsv', 'wastewater-measles', 'wastewater-h5', 'wastewater-mpox', 'wastewater-covid-percentile'] },
  { name: 'Measles', series: ['measles-weekly', 'measles-annual'] },
  { name: 'Tick-borne Disease', series: ['lyme-disease'] },
  { name: 'Birth & Mortality', series: ['births-annual', 'birth-rate', 'deaths-annual', 'deaths-circulatory', 'deaths-cancer', 'deaths-cancer-by-type', 'deaths-respiratory', 'deaths-by-place', 'mortality-all', 'life-expectancy-combined', 'maternal-mortality'] },
  { name: 'Life Expectancy', series: ['life-expectancy-combined'] },
  { name: 'Mortality', series: ['death-rates-historical', 'mortality-all', 'deaths-annual', 'deaths-circulatory', 'deaths-cancer', 'deaths-cancer-by-type', 'deaths-respiratory', 'deaths-by-place'] },
  { name: 'Cancer Mortality', series: ['deaths-cancer', 'deaths-cancer-by-type', 'cancer-sex-lung', 'cancer-sex-colorectal', 'cancer-sex-pancreas', 'cancer-sex-liver'] },
  { name: 'Injury & Overdose', series: ['injury-drug-od', 'injury-suicide', 'injury-homicide', 'injury-firearm', 'suicide-by-sex', 'drug-deaths-by-year', 'drug-overdose-rate-by-type'] },
  { name: 'Health Spending', series: ['health-spending-per-capita'] },
  { name: 'Foodborne Disease', series: ['beam-foodborne'] },
  { name: 'Influenza', series: ['flu', 'resp-deaths-flu', 'vacc-flu', 'nursing-flu', 'wastewater-flu'] },
  { name: 'COVID-19', series: ['covid', 'resp-deaths-covid', 'vacc-covid', 'nursing-covid', 'wastewater-covid', 'wastewater-covid-percentile'] },
  { name: 'Respiratory Syncytial Virus', series: ['rsv', 'resp-deaths-rsv', 'vacc-rsv', 'nursing-rsv', 'wastewater-rsv'] }
];
