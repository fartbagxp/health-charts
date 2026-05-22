const RAW_BASE = 'https://raw.githubusercontent.com/fartbagxp/health/main/data/raw/resp';

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
  }
};

export const CATEGORIES = [
  { name: 'All Series', series: ['flu', 'covid', 'rsv'] },
  { name: 'Influenza', series: ['flu'] },
  { name: 'COVID-19', series: ['covid'] },
  { name: 'Respiratory Syncytial Virus', series: ['rsv'] }
];
