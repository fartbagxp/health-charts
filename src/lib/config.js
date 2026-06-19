const RAW_BASE = 'https://raw.githubusercontent.com/fartbagxp/health/main/data/raw/resp';
const WONDER_BASE = 'https://raw.githubusercontent.com/fartbagxp/health/main/data/raw/wonder';
const CDC_OPEN_BASE = 'https://raw.githubusercontent.com/fartbagxp/health/main/data/raw/cdc_open';

export const SERIES_CONFIG = {
  flu: {
    id: 'flu',
    title: 'Flu New Admissions',
    description: 'Weekly influenza new hospital admissions from CDC surveillance (2020–present)',
    color: '#1a6faf',
    csvUrl: `${RAW_BASE}/respiratory-combined.csv`,
    valueKey: 'flu_new_admissions',
    unit: 'admissions',
    format: ',',
    source: 'CDC NSSP',
    sourceUrl: 'https://www.cdc.gov/respiratory-viruses/data/index.html',
    frequency: 'Weekly',
    category: 'Influenza'
  },
  covid: {
    id: 'covid',
    title: 'COVID-19 Hospitalizations',
    description: 'Weekly COVID-19-associated hospital admissions (2020–present)',
    color: '#e63946',
    csvUrl: `${RAW_BASE}/covid-hospitalizations.csv`,
    valueKey: 'hospitalizations',
    unit: 'hospitalizations',
    format: ',',
    source: 'CDC COVID-NET',
    sourceUrl: 'https://www.cdc.gov/covid/php/covid-net/index.html',
    frequency: 'Weekly',
    category: 'COVID-19'
  },
  rsv: {
    id: 'rsv',
    title: 'RSV Hospitalization Rate',
    description: 'Weekly RSV-associated hospitalization rate per 100,000 from CDC RSV-NET (2020–present)',
    color: '#2a9d8f',
    csvUrl: `${RAW_BASE}/rsv-hospitalizations.csv`,
    valueKey: 'rate',
    unit: 'per 100,000',
    format: '.1f',
    source: 'CDC RSV-NET',
    sourceUrl: 'https://www.cdc.gov/rsv/php/surveillance/rsv-net.html',
    frequency: 'Weekly',
    category: 'Respiratory Syncytial Virus'
  },

  // Respiratory pathogen share of all U.S. deaths (CDC, weekly, Oct 2024–present)
  'resp-deaths-flu': {
    id: 'resp-deaths-flu',
    title: 'Flu Share of Deaths',
    description: 'Influenza as a percentage of all U.S. deaths, weekly (Oct 2024–present)',
    color: '#1a6faf',
    csvUrl: `${CDC_OPEN_BASE}/resp_deaths_pct.csv`,
    dateKey: 'week_end',
    valueKey: 'percent_deaths',
    filters: { pathogen: 'Influenza' },
    unit: '% of deaths',
    format: '.2f',
    source: 'CDC Open Data Portal',
    sourceUrl: 'https://data.cdc.gov/NCHS/Provisional-Death-Counts-for-Influenza-COVID-19-an/ynw2-4viq',
    frequency: 'Weekly',
    category: 'Influenza'
  },
  'resp-deaths-covid': {
    id: 'resp-deaths-covid',
    title: 'COVID-19 Share of Deaths',
    description: 'COVID-19 as a percentage of all U.S. deaths, weekly (Oct 2024–present)',
    color: '#e63946',
    csvUrl: `${CDC_OPEN_BASE}/resp_deaths_pct.csv`,
    dateKey: 'week_end',
    valueKey: 'percent_deaths',
    filters: { pathogen: 'COVID-19' },
    unit: '% of deaths',
    format: '.2f',
    source: 'CDC Open Data Portal',
    sourceUrl: 'https://data.cdc.gov/NCHS/Provisional-Death-Counts-for-Influenza-COVID-19-an/ynw2-4viq',
    frequency: 'Weekly',
    category: 'COVID-19'
  },
  'resp-deaths-rsv': {
    id: 'resp-deaths-rsv',
    title: 'RSV Share of Deaths',
    description: 'RSV as a percentage of all U.S. deaths, weekly (Oct 2024–present)',
    color: '#2a9d8f',
    csvUrl: `${CDC_OPEN_BASE}/resp_deaths_pct.csv`,
    dateKey: 'week_end',
    valueKey: 'percent_deaths',
    filters: { pathogen: 'RSV' },
    unit: '% of deaths',
    format: '.2f',
    source: 'CDC Open Data Portal',
    sourceUrl: 'https://data.cdc.gov/NCHS/Provisional-Death-Counts-for-Influenza-COVID-19-an/ynw2-4viq',
    frequency: 'Weekly',
    category: 'Respiratory Syncytial Virus'
  },

  // Vaccination coverage (CDC NIS-ACM, national, adults 18+, weekly Oct 2025–present)
  'vacc-flu': {
    id: 'vacc-flu',
    title: 'Flu Vaccination Coverage',
    description: 'Percentage of U.S. adults 18+ up-to-date on flu vaccine, national, weekly (2025–present)',
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
    sourceUrl: 'https://www.cdc.gov/vaccines/imz-managers/nis/index.html',
    frequency: 'Weekly',
    category: 'Influenza',
    yDomain: [0, 100]
  },
  'vacc-covid': {
    id: 'vacc-covid',
    title: 'COVID-19 Vaccination Coverage',
    description: 'Percentage of U.S. adults 18+ up-to-date on COVID-19 vaccine, national, weekly (2025–present)',
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
    sourceUrl: 'https://www.cdc.gov/vaccines/imz-managers/nis/index.html',
    frequency: 'Weekly',
    category: 'COVID-19',
    yDomain: [0, 100]
  },
  'vacc-rsv': {
    id: 'vacc-rsv',
    title: 'RSV Vaccination Coverage',
    description: 'Percentage of U.S. adults 50+ up-to-date on RSV vaccine, national, weekly (2025–present)',
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
    sourceUrl: 'https://www.cdc.gov/vaccines/imz-managers/nis/index.html',
    frequency: 'Weekly',
    category: 'Respiratory Syncytial Virus',
    yDomain: [0, 100]
  },

  // U.S. annual births (CDC WONDER, 1995–2024)
  'births-annual': {
    id: 'births-annual',
    title: 'U.S. Annual Births',
    description: 'Total U.S. live births per year, 1995–2024 (CDC WONDER natality data)',
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
    source: 'CDC WONDER',
    sourceUrl: 'https://wonder.cdc.gov/natality.html',
    frequency: 'Annual',
    category: 'Birth & Mortality'
  },

  // Overall U.S. mortality rate (CDC, quarterly rolling 12-month, 2023–present)
  'mortality-all': {
    id: 'mortality-all',
    title: 'U.S. Mortality Rate',
    description: 'Age-adjusted mortality rate per 100,000 for all causes, U.S. national, rolling 12-month (2023–present)',
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
    sourceUrl: 'https://www.cdc.gov/nchs/nvss/vsrr/mortality-dashboard.htm',
    frequency: 'Quarterly',
    category: 'Mortality'
  },

  // U.S. birth rate — general fertility rate (CDC, quarterly, 2023–present)
  'birth-rate': {
    id: 'birth-rate',
    title: 'U.S. Birth Rate',
    description: 'General fertility rate per 1,000 women aged 15–44, U.S. national, quarterly (2023–present)',
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
    sourceUrl: 'https://www.cdc.gov/nchs/nvss/births.htm',
    frequency: 'Quarterly',
    category: 'Birth & Mortality'
  },

  // U.S. total deaths per year (CDC WONDER, 1979–2024)
  'deaths-annual': {
    id: 'deaths-annual',
    title: 'U.S. Annual Deaths',
    description: 'Total U.S. deaths per year, 1979–2024 (CDC WONDER)',
    color: '#6a4c93',
    csvUrl: `${WONDER_BASE}/mortality-total-by-year.csv`,
    dateKey: 'year',
    dateFormat: 'year',
    valueKey: 'total_deaths',
    unit: 'deaths',
    format: ',.0f',
    source: 'CDC WONDER',
    sourceUrl: 'https://wonder.cdc.gov/ucd-icd10-expanded.html',
    frequency: 'Annual',
    category: 'Birth & Mortality'
  },

  // Leading causes of death (CDC WONDER, 1979–2024)
  'deaths-circulatory': {
    id: 'deaths-circulatory',
    title: 'Deaths — Circulatory Disease',
    description: 'Annual U.S. deaths from diseases of the circulatory system (the #1 cause every year), 1979–2024',
    color: '#e63946',
    csvUrl: `${WONDER_BASE}/mortality-top5-causes-by-year.csv`,
    dateKey: 'year',
    dateFormat: 'year',
    valueKey: 'deaths',
    filters: { cause: 'Diseases of the circulatory system' },
    unit: 'deaths',
    format: ',.0f',
    source: 'CDC WONDER',
    sourceUrl: 'https://wonder.cdc.gov/ucd-icd10-expanded.html',
    frequency: 'Annual',
    category: 'Birth & Mortality'
  },
  'deaths-cancer': {
    id: 'deaths-cancer',
    title: 'Deaths — Cancer',
    description: 'Annual U.S. deaths from neoplasms (cancer, the #2 cause every year), 1979–2024',
    color: '#e07a5f',
    csvUrl: `${WONDER_BASE}/mortality-top5-causes-by-year.csv`,
    dateKey: 'year',
    dateFormat: 'year',
    valueKey: 'deaths',
    filters: { cause: 'Neoplasms' },
    unit: 'deaths',
    format: ',.0f',
    source: 'CDC WONDER',
    sourceUrl: 'https://wonder.cdc.gov/ucd-icd10-expanded.html',
    frequency: 'Annual',
    category: 'Birth & Mortality'
  },
  'deaths-respiratory': {
    id: 'deaths-respiratory',
    title: 'Deaths — Respiratory Disease',
    description: 'Annual U.S. deaths from diseases of the respiratory system, 1979–2024',
    color: '#2a9d8f',
    csvUrl: `${WONDER_BASE}/mortality-top5-causes-by-year.csv`,
    dateKey: 'year',
    dateFormat: 'year',
    valueKey: 'deaths',
    filters: { cause: 'Diseases of the respiratory system' },
    unit: 'deaths',
    format: ',.0f',
    source: 'CDC WONDER',
    sourceUrl: 'https://wonder.cdc.gov/ucd-icd10-expanded.html',
    frequency: 'Annual',
    category: 'Birth & Mortality'
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
    sourceUrl: 'https://www.cdc.gov/nhsn/index.html',
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
    sourceUrl: 'https://www.cdc.gov/nhsn/index.html',
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
    sourceUrl: 'https://www.cdc.gov/nhsn/index.html',
    frequency: 'Weekly',
    category: 'Respiratory Syncytial Virus',
    yDomain: [0, 100]
  },

  // Measles — weekly confirmed U.S. cases (CDC, 2022–present)
  'measles-weekly': {
    id: 'measles-weekly',
    title: 'Measles Weekly Cases',
    description: 'Weekly confirmed measles cases in the U.S. (2022–present)',
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
    description: 'Reported measles cases per year in the U.S., showing the collapse after the 1963 vaccine and 2000 elimination (1962–present)',
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
    category: 'Measles'
  },

  // U.S. life expectancy at birth — combined (CDC NCHS, 1900–present)
  'life-expectancy-combined': {
    id: 'life-expectancy-combined',
    title: 'U.S. Life Expectancy',
    description: 'Average life expectancy at birth by sex, all races, U.S. (1900–present)',
    csvUrl: `${CDC_OPEN_BASE}/life_expectancy.csv`,
    dateKey: 'year',
    dateFormat: 'year',
    valueKey: 'average_life_expectancy',
    unit: 'years',
    format: '.1f',
    source: 'CDC NCHS',
    sourceUrl: 'https://www.cdc.gov/nchs/products/life_tables.htm',
    frequency: 'Annual',
    category: 'Mortality',
    subSeries: [
      { key: 'avg', label: 'Both Sexes', color: '#457b9d', filters: { race: 'All Races', sex: 'Both Sexes' } },
      { key: 'male', label: 'Male', color: '#1a6faf', filters: { race: 'All Races', sex: 'Male' } },
      { key: 'female', label: 'Female', color: '#e07a5f', filters: { race: 'All Races', sex: 'Female' } }
    ]
  },

  // U.S. life expectancy at birth (CDC NCHS, 1900–present) — kept for direct URL access
  'life-expectancy': {
    id: 'life-expectancy',
    title: 'U.S. Life Expectancy',
    description: 'Average life expectancy at birth, all races, both sexes, U.S. (1900–present)',
    color: '#457b9d',
    csvUrl: `${CDC_OPEN_BASE}/life_expectancy.csv`,
    dateKey: 'year',
    dateFormat: 'year',
    valueKey: 'average_life_expectancy',
    filters: { race: 'All Races', sex: 'Both Sexes' },
    unit: 'years',
    format: '.1f',
    source: 'CDC NCHS',
    sourceUrl: 'https://www.cdc.gov/nchs/products/life_tables.htm',
    frequency: 'Annual',
    category: 'Mortality',
    hidden: true
  },

  // U.S. life expectancy at birth — male, all races (CDC NCHS, 1900–present)
  'life-expectancy-male': {
    id: 'life-expectancy-male',
    title: 'U.S. Life Expectancy — Male',
    description: 'Average life expectancy at birth for males, all races, U.S. (1900–present)',
    color: '#1a6faf',
    csvUrl: `${CDC_OPEN_BASE}/life_expectancy.csv`,
    dateKey: 'year',
    dateFormat: 'year',
    valueKey: 'average_life_expectancy',
    filters: { race: 'All Races', sex: 'Male' },
    unit: 'years',
    format: '.1f',
    source: 'CDC NCHS',
    sourceUrl: 'https://www.cdc.gov/nchs/products/life_tables.htm',
    frequency: 'Annual',
    category: 'Mortality',
    hidden: true
  },

  // U.S. life expectancy at birth — female, all races (CDC NCHS, 1900–present)
  'life-expectancy-female': {
    id: 'life-expectancy-female',
    title: 'U.S. Life Expectancy — Female',
    description: 'Average life expectancy at birth for females, all races, U.S. (1900–present)',
    color: '#e07a5f',
    csvUrl: `${CDC_OPEN_BASE}/life_expectancy.csv`,
    dateKey: 'year',
    dateFormat: 'year',
    valueKey: 'average_life_expectancy',
    filters: { race: 'All Races', sex: 'Female' },
    unit: 'years',
    format: '.1f',
    source: 'CDC NCHS',
    sourceUrl: 'https://www.cdc.gov/nchs/products/life_tables.htm',
    frequency: 'Annual',
    category: 'Mortality',
    hidden: true
  },

  // Lyme disease — annual U.S. cases (CDC NNDSS via WONDER, 2016–present)
  'lyme-disease': {
    id: 'lyme-disease',
    title: 'Lyme Disease Cases',
    description: 'Total reported Lyme disease cases per year in the U.S. (2016–present)',
    color: '#52b788',
    csvUrl: `${WONDER_BASE}/tick-borne-diseases-by-year.csv`,
    dateKey: 'year',
    dateFormat: 'year',
    valueKey: 'cases',
    filters: { disease: 'Lyme disease, Total' },
    unit: 'cases',
    format: ',.0f',
    source: 'CDC NNDSS via WONDER',
    sourceUrl: 'https://wonder.cdc.gov/',
    frequency: 'Annual',
    category: 'Tick-borne Disease'
  }
};

export const CATEGORIES = [
  { name: 'All Series', series: ['flu', 'covid', 'rsv', 'resp-deaths-flu', 'resp-deaths-covid', 'resp-deaths-rsv', 'vacc-flu', 'vacc-covid', 'vacc-rsv', 'nursing-flu', 'nursing-covid', 'nursing-rsv', 'measles-weekly', 'measles-annual', 'lyme-disease', 'births-annual', 'deaths-annual', 'deaths-circulatory', 'deaths-cancer', 'deaths-respiratory', 'mortality-all', 'life-expectancy-combined', 'birth-rate'] },
  { name: 'Hospitalizations', series: ['flu', 'covid', 'rsv'] },
  { name: 'Vaccination Coverage', series: ['vacc-flu', 'vacc-covid', 'vacc-rsv'] },
  { name: 'Nursing Home Vaccination', series: ['nursing-flu', 'nursing-covid', 'nursing-rsv'] },
  { name: 'Respiratory Mortality', series: ['resp-deaths-flu', 'resp-deaths-covid', 'resp-deaths-rsv'] },
  { name: 'Measles', series: ['measles-weekly', 'measles-annual'] },
  { name: 'Tick-borne Disease', series: ['lyme-disease'] },
  { name: 'Birth & Mortality', series: ['births-annual', 'birth-rate', 'deaths-annual', 'deaths-circulatory', 'deaths-cancer', 'deaths-respiratory', 'mortality-all', 'life-expectancy-combined'] },
  { name: 'Life Expectancy', series: ['life-expectancy-combined'] },
  { name: 'Influenza', series: ['flu', 'resp-deaths-flu', 'vacc-flu', 'nursing-flu'] },
  { name: 'COVID-19', series: ['covid', 'resp-deaths-covid', 'vacc-covid', 'nursing-covid'] },
  { name: 'Respiratory Syncytial Virus', series: ['rsv', 'resp-deaths-rsv', 'vacc-rsv', 'nursing-rsv'] }
];
