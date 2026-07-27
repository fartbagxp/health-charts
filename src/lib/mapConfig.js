// Slimmed down by health's `cdc_open.aggregate.aggregate_places_county()`:
// crude-prevalence rows only, 6 columns instead of 22 (~800KB vs ~12MB raw).
const CDC_OPEN_PROCESSED_BASE = 'https://raw.githubusercontent.com/fartbagxp/health/main/data/processed/cdc_open';

export const PLACES_COUNTY_CSV_URL = `${CDC_OPEN_PROCESSED_BASE}/places_county.csv`;

// Sequential blue ramp (100->700, light->dark) for magnitude encoding.
export const SEQUENTIAL_SCHEME = [
  '#cde2fb', '#b7d3f6', '#9ec5f4', '#86b6ef', '#6da7ec', '#5598e7',
  '#3987e5', '#2a78d6', '#256abf', '#1c5cab', '#184f95', '#104281', '#0d366b'
];

export const NO_DATA_FILL = '#e4e4e2';

// CDC PLACES chronic-disease measures available in places_county.csv (BRFSS-based,
// crude prevalence, 2023). Domains are floor/ceil of the observed county-level
// min/max so the color scale stays fixed while switching measures.
export const PLACES_MEASURES = {
  OBESITY: {
    id: 'OBESITY',
    label: 'Obesity',
    description: 'Adults who are obese (BMI ≥ 30)',
    unit: '%',
    format: '.1f',
    domain: [16, 53]
  },
  DIABETES: {
    id: 'DIABETES',
    label: 'Diabetes',
    description: 'Adults with diagnosed diabetes',
    unit: '%',
    format: '.1f',
    domain: [4, 28]
  },
  BPHIGH: {
    id: 'BPHIGH',
    label: 'High Blood Pressure',
    description: 'Adults with diagnosed high blood pressure',
    unit: '%',
    format: '.1f',
    domain: [17, 60]
  },
  CHD: {
    id: 'CHD',
    label: 'Coronary Heart Disease',
    description: 'Adults with coronary heart disease',
    unit: '%',
    format: '.1f',
    domain: [3, 14]
  },
  STROKE: {
    id: 'STROKE',
    label: 'Stroke',
    description: 'Adults who have had a stroke',
    unit: '%',
    format: '.1f',
    domain: [1, 9]
  },
  CANCER: {
    id: 'CANCER',
    label: 'Cancer (non-skin) or Melanoma',
    description: 'Adults diagnosed with cancer (non-skin) or melanoma',
    unit: '%',
    format: '.1f',
    domain: [3, 18]
  },
  COPD: {
    id: 'COPD',
    label: 'COPD',
    description: 'Adults with chronic obstructive pulmonary disease',
    unit: '%',
    format: '.1f',
    domain: [3, 18]
  },
  ARTHRITIS: {
    id: 'ARTHRITIS',
    label: 'Arthritis',
    description: 'Adults with arthritis',
    unit: '%',
    format: '.1f',
    domain: [12, 46]
  }
};

export const PLACES_MEASURE_LIST = Object.values(PLACES_MEASURES);

// 2-digit state FIPS -> USPS abbreviation. The first two digits of any county
// FIPS are its state's FIPS code, so this gives every county a state label
// regardless of whether PLACES has any data for it (e.g. Kentucky, Pennsylvania).
export const STATE_FIPS_TO_ABBR = {
  '01': 'AL', '02': 'AK', '04': 'AZ', '05': 'AR', '06': 'CA', '08': 'CO', '09': 'CT',
  '10': 'DE', '11': 'DC', '12': 'FL', '13': 'GA', '15': 'HI', '16': 'ID', '17': 'IL',
  '18': 'IN', '19': 'IA', '20': 'KS', '21': 'KY', '22': 'LA', '23': 'ME', '24': 'MD',
  '25': 'MA', '26': 'MI', '27': 'MN', '28': 'MS', '29': 'MO', '30': 'MT', '31': 'NE',
  '32': 'NV', '33': 'NH', '34': 'NJ', '35': 'NM', '36': 'NY', '37': 'NC', '38': 'ND',
  '39': 'OH', '40': 'OK', '41': 'OR', '42': 'PA', '44': 'RI', '45': 'SC', '46': 'SD',
  '47': 'TN', '48': 'TX', '49': 'UT', '50': 'VT', '51': 'VA', '53': 'WA', '54': 'WV',
  '55': 'WI', '56': 'WY', '60': 'AS', '66': 'GU', '69': 'MP', '72': 'PR', '78': 'VI'
};
