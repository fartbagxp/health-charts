// CDC PLACES — all seven pages of the portal
// (https://experience.arcgis.com/experience/22c7182a162d45788dd52a2362f8ed65).
//
// health's `places` module mirrors the full datasets into a public Dolt
// database (fartbagxp/cdc-places) and commits small national-scale slices under
// data/processed/places/. This app reads those slices for the county/state
// choropleth and queries Dolt live (CORS-enabled, keyless) for one county's
// full 49-measure profile. See health/docs/places.md.
const PLACES_BASE = 'https://raw.githubusercontent.com/fartbagxp/health/main/data/processed/places';
const CDC_OPEN_BASE = 'https://raw.githubusercontent.com/fartbagxp/health/main/data/raw/cdc_open';

// 49-row catalog: measureid, categoryid, category, measure, short_question_text,
// data_value_unit, data_source. Spans both families (BRFSS + 5-year ACS).
export const PLACES_MEASURES_CSV_URL = `${PLACES_BASE}/measures.csv`;

// BRFSS family (40 measures, 6 categories). Two county files — crude and
// age-adjusted prevalence — plus a true population-weighted state rollup that
// carries both CrdPrv and AgeAdjPrv rows (so state values need no browser-side
// re-aggregation).
export const PLACES_COUNTY_CRUDE_CSV_URL = `${PLACES_BASE}/county_crude.csv`;
export const PLACES_COUNTY_AGEADJ_CSV_URL = `${PLACES_BASE}/county_ageadj.csv`;
export const PLACES_STATE_ROLLUP_CSV_URL = `${PLACES_BASE}/state_rollup.csv`;

// Non-Medical Factors family (9 measures, category SDOH), derived from the
// 5-year ACS. Crude only — no age-adjusted companion. nmf_county.csv adds a
// `moe` (margin of error) column where the BRFSS files carry confidence limits.
export const NMF_COUNTY_CSV_URL = `${PLACES_BASE}/nmf_county.csv`;
export const NMF_STATE_ROLLUP_CSV_URL = `${PLACES_BASE}/nmf_state_rollup.csv`;

// Live DoltHub SQL endpoint for county drill-down. PK-prefix queries return in
// ~0.3s; never JOIN the 6.6M-row `measurement` table (it times out) — labels
// are resolved client-side from PLACES_MEASURES_CSV_URL.
export const DOLT_PLACES_SQL_URL = 'https://www.dolthub.com/api/v1alpha1/fartbagxp/cdc-places/main';
export const DOLT_PLACES_RELEASE_YEAR = 2025;
export const DOLT_NMF_PERIOD = '2017-2021';

// One row per state: latest year-to-date cumulative measles case count.
// Aggregated server-side by health's cdc_open.fetch_measles_by_state.
export const MEASLES_BY_STATE_CSV_URL = `${CDC_OPEN_BASE}/measles_by_state.csv`;

// One row per state (50 + DC): percent of live births that are low birthweight,
// latest year. Aggregated server-side by health's nchs_dqs.fetch_dqs.
const DQS_BASE = 'https://raw.githubusercontent.com/fartbagxp/health/main/data/raw/dqs';
export const LOW_BIRTHWEIGHT_BY_STATE_CSV_URL = `${DQS_BASE}/low_birthweight_by_state.csv`;

// Portal page order, with the SDOH page (a separate CDC product) last, matching
// health/docs/places.md.
export const PLACES_CATEGORY_ORDER = [
  'HLTHOUT',   // Health Outcomes
  'PREVENT',   // Prevention
  'RISKBEH',   // Health Risk Behaviors
  'HLTHSTAT',  // Health Status
  'DISABLT',   // Disability
  'SOCLNEED',  // Health-Related Social Needs
  'SDOH'       // Non-Medical Factors (5-year ACS)
];

// Measures where a *higher* value is the good outcome (screening, checkups,
// treatment adherence). The choropleth flips the ramp for these so darker
// always reads as "worse". Everything else (disease prevalence, risk
// behaviors, unmet social needs) is worse when higher.
export const PLACES_HIGHER_IS_BETTER = new Set([
  'BPMED', 'CHECKUP', 'CHOLSCREEN', 'COLON_SCREEN', 'DENTAL', 'MAMMOUSE'
]);

// Sequential blue ramp (100->700, light->dark) for magnitude encoding.
export const SEQUENTIAL_SCHEME = [
  '#cde2fb', '#b7d3f6', '#9ec5f4', '#86b6ef', '#6da7ec', '#5598e7',
  '#3987e5', '#2a78d6', '#256abf', '#1c5cab', '#184f95', '#104281', '#0d366b'
];

export const NO_DATA_FILL = '#e4e4e2';

// Connecticut, PLACES 2025 vs the topology this app ships.
//
// us-atlas@3.0.1 counties-10m.json uses the *retired* CT county FIPS
// 09001-09015 (8 counties). The BRFSS county files (PLACES 2025) use the 9
// COG "planning region" FIPS 09110-09190 instead — same land, different units
// — so those rows would not join the topology and Connecticut would render as
// 8 holes for every BRFSS measure. The NMF family (ACS 2017-2021) still uses
// the old FIPS and joins fine.
//
// This crude best-overlap crosswalk folds each planning region onto the
// retired county it mostly covers, so the choropleth fills CT. Values for a
// county that catches more than one region are population-weighted in
// loadPlacesChoropleth. Tolland County (09013) has no region that maps to it
// and stays a hole; state-level view is exact regardless.
export const CT_PLANNING_REGION_TO_COUNTY = {
  '09110': '09003', // Capitol -> Hartford
  '09120': '09001', // Greater Bridgeport -> Fairfield
  '09130': '09007', // Lower CT River Valley -> Middlesex
  '09140': '09009', // Naugatuck Valley -> New Haven
  '09150': '09015', // Northeastern CT -> Windham
  '09160': '09005', // Northwest Hills -> Litchfield
  '09170': '09009', // South Central CT -> New Haven
  '09180': '09011', // Southeastern CT -> New London
  '09190': '09001'  // Western CT -> Fairfield
};

// 2-digit state FIPS -> USPS abbreviation. The first two digits of any county
// FIPS are its state's FIPS code, so this gives every county a state label
// regardless of whether PLACES has any data for it.
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

export const STATE_ABBR_TO_FIPS = Object.fromEntries(
  Object.entries(STATE_FIPS_TO_ABBR).map(([fips, abbr]) => [abbr, fips])
);
