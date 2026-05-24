const RAW_BASE = 'https://raw.githubusercontent.com/fartbagxp/health/main/data/raw/resp';
const CDC_OPEN_BASE = 'https://raw.githubusercontent.com/fartbagxp/health/main/data/raw/cdc_open';

export const SERIES_CONFIG = {
  flu: {
    id: 'flu',
    title: 'Flu New Admissions',
    description: 'Weekly influenza new hospital admissions from CDC surveillance (2020–present)',
    color: '#0073e6',
    csvUrl: `${RAW_BASE}/respiratory-combined.csv`,
    valueKey: 'flu_new_admissions',
    unit: 'admissions',
    format: ',',
    source: 'CDC NSSP',
    frequency: 'Weekly',
    category: 'Influenza'
  },
  covid: {
    id: 'covid',
    title: 'COVID-19 Hospitalizations',
    description: 'Weekly COVID-19-associated hospital admissions (2020–present)',
    color: '#dc3545',
    csvUrl: `${RAW_BASE}/covid-hospitalizations.csv`,
    valueKey: 'hospitalizations',
    unit: 'hospitalizations',
    format: ',',
    source: 'CDC COVID-NET',
    frequency: 'Weekly',
    category: 'COVID-19'
  },
  rsv: {
    id: 'rsv',
    title: 'RSV Hospitalization Rate',
    description: 'Weekly RSV-associated hospitalization rate per 100,000 from CDC RSV-NET (2020–present)',
    color: '#28a745',
    csvUrl: `${RAW_BASE}/rsv-hospitalizations.csv`,
    valueKey: 'rate',
    unit: 'per 100,000',
    format: '.1f',
    source: 'CDC RSV-NET',
    frequency: 'Weekly',
    category: 'Respiratory Syncytial Virus'
  },

  // Respiratory pathogen share of all U.S. deaths (CDC, weekly, Oct 2024–present)
  'resp-deaths-flu': {
    id: 'resp-deaths-flu',
    title: 'Flu Share of Deaths',
    description: 'Influenza as a percentage of all U.S. deaths, weekly (Oct 2024–present)',
    color: '#0073e6',
    csvUrl: `${CDC_OPEN_BASE}/resp_deaths_pct.csv`,
    dateKey: 'week_end',
    valueKey: 'percent_deaths',
    filters: { pathogen: 'Influenza' },
    unit: '% of deaths',
    format: '.2f',
    source: 'CDC',
    frequency: 'Weekly',
    category: 'Influenza'
  },
  'resp-deaths-covid': {
    id: 'resp-deaths-covid',
    title: 'COVID-19 Share of Deaths',
    description: 'COVID-19 as a percentage of all U.S. deaths, weekly (Oct 2024–present)',
    color: '#dc3545',
    csvUrl: `${CDC_OPEN_BASE}/resp_deaths_pct.csv`,
    dateKey: 'week_end',
    valueKey: 'percent_deaths',
    filters: { pathogen: 'COVID-19' },
    unit: '% of deaths',
    format: '.2f',
    source: 'CDC',
    frequency: 'Weekly',
    category: 'COVID-19'
  },
  'resp-deaths-rsv': {
    id: 'resp-deaths-rsv',
    title: 'RSV Share of Deaths',
    description: 'RSV as a percentage of all U.S. deaths, weekly (Oct 2024–present)',
    color: '#28a745',
    csvUrl: `${CDC_OPEN_BASE}/resp_deaths_pct.csv`,
    dateKey: 'week_end',
    valueKey: 'percent_deaths',
    filters: { pathogen: 'RSV' },
    unit: '% of deaths',
    format: '.2f',
    source: 'CDC',
    frequency: 'Weekly',
    category: 'Respiratory Syncytial Virus'
  },

  // Vaccination coverage (CDC NIS-ACM, national, adults 18+, weekly Oct 2025–present)
  'vacc-flu': {
    id: 'vacc-flu',
    title: 'Flu Vaccination Coverage',
    description: 'Percentage of U.S. adults 18+ up-to-date on flu vaccine, national, weekly (2025–present)',
    color: '#0073e6',
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
    frequency: 'Weekly',
    category: 'Influenza',
    yDomain: [0, 100]
  },
  'vacc-covid': {
    id: 'vacc-covid',
    title: 'COVID-19 Vaccination Coverage',
    description: 'Percentage of U.S. adults 18+ up-to-date on COVID-19 vaccine, national, weekly (2025–present)',
    color: '#dc3545',
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
    frequency: 'Weekly',
    category: 'COVID-19',
    yDomain: [0, 100]
  },
  'vacc-rsv': {
    id: 'vacc-rsv',
    title: 'RSV Vaccination Coverage',
    description: 'Percentage of U.S. adults 50+ up-to-date on RSV vaccine, national, weekly (2025–present)',
    color: '#28a745',
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
    frequency: 'Weekly',
    category: 'Respiratory Syncytial Virus',
    yDomain: [0, 100]
  },

  // Overall U.S. mortality rate (CDC, quarterly rolling 12-month, 2023–present)
  'mortality-all': {
    id: 'mortality-all',
    title: 'U.S. Mortality Rate',
    description: 'Age-adjusted mortality rate per 100,000 for all causes, U.S. national, rolling 12-month (2023–present)',
    color: '#6f42c1',
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
    frequency: 'Quarterly',
    category: 'Mortality'
  },

  // U.S. birth rate — general fertility rate (CDC, quarterly, 2023–present)
  'birth-rate': {
    id: 'birth-rate',
    title: 'U.S. Birth Rate',
    description: 'General fertility rate per 1,000 women aged 15–44, U.S. national, quarterly (2023–present)',
    color: '#fd7e14',
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
    frequency: 'Quarterly',
    category: 'Birth & Mortality'
  },

  // Nursing home respiratory vaccination rates (CDC, weekly, Oct 2024–Oct 2025, national)
  'nursing-covid': {
    id: 'nursing-covid',
    title: 'Nursing Home COVID-19 Vaccination',
    description: 'Percentage of nursing home residents up-to-date on COVID-19 vaccine, U.S. national, weekly',
    color: '#dc3545',
    csvUrl: `${CDC_OPEN_BASE}/nursing_home_resp.csv`,
    dateKey: 'survweekend',
    valueKey: 'pct_totresuptodate',
    filters: { jurisdiction: 'USA' },
    unit: '% up-to-date',
    format: '.1f',
    source: 'CDC NHSN',
    frequency: 'Weekly',
    category: 'COVID-19',
    yDomain: [0, 100]
  },
  'nursing-flu': {
    id: 'nursing-flu',
    title: 'Nursing Home Flu Vaccination',
    description: 'Percentage of nursing home residents vaccinated against flu, U.S. national, weekly',
    color: '#0073e6',
    csvUrl: `${CDC_OPEN_BASE}/nursing_home_resp.csv`,
    dateKey: 'survweekend',
    valueKey: 'pct_numresfluvacc',
    filters: { jurisdiction: 'USA' },
    unit: '% vaccinated',
    format: '.1f',
    source: 'CDC NHSN',
    frequency: 'Weekly',
    category: 'Influenza',
    yDomain: [0, 100]
  },
  'nursing-rsv': {
    id: 'nursing-rsv',
    title: 'Nursing Home RSV Vaccination',
    description: 'Percentage of nursing home residents vaccinated against RSV, U.S. national, weekly',
    color: '#28a745',
    csvUrl: `${CDC_OPEN_BASE}/nursing_home_resp.csv`,
    dateKey: 'survweekend',
    valueKey: 'pct_numresrsvvacc',
    filters: { jurisdiction: 'USA' },
    unit: '% vaccinated',
    format: '.1f',
    source: 'CDC NHSN',
    frequency: 'Weekly',
    category: 'Respiratory Syncytial Virus',
    yDomain: [0, 100]
  }
};

export const CATEGORIES = [
  { name: 'All Series', series: ['flu', 'covid', 'rsv', 'resp-deaths-flu', 'resp-deaths-covid', 'resp-deaths-rsv', 'vacc-flu', 'vacc-covid', 'vacc-rsv', 'nursing-flu', 'nursing-covid', 'nursing-rsv', 'mortality-all', 'birth-rate'] },
  { name: 'Hospitalizations', series: ['flu', 'covid', 'rsv'] },
  { name: 'Vaccination Coverage', series: ['vacc-flu', 'vacc-covid', 'vacc-rsv'] },
  { name: 'Nursing Home Vaccination', series: ['nursing-flu', 'nursing-covid', 'nursing-rsv'] },
  { name: 'Respiratory Mortality', series: ['resp-deaths-flu', 'resp-deaths-covid', 'resp-deaths-rsv'] },
  { name: 'Birth & Mortality', series: ['birth-rate', 'mortality-all'] },
  { name: 'Influenza', series: ['flu', 'resp-deaths-flu', 'vacc-flu', 'nursing-flu'] },
  { name: 'COVID-19', series: ['covid', 'resp-deaths-covid', 'vacc-covid', 'nursing-covid'] },
  { name: 'Respiratory Syncytial Virus', series: ['rsv', 'resp-deaths-rsv', 'vacc-rsv', 'nursing-rsv'] }
];
