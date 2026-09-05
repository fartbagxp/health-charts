export function parseDate(str, format) {
  if (format === 'quarter') {
    const m = str.match(/(\d{4})\s+Q(\d)/);
    if (m) return new Date(+m[1], (+m[2] - 1) * 3, 1);
  }
  if (format === 'year') {
    const y = parseInt(str);
    if (!isNaN(y)) return new Date(y, 0, 1);
  }
  if (format === 'schoolyear') {
    const m = str.match(/^(\d{4})-\d{2}$/);
    if (m) return new Date(+m[1], 6, 1);
  }
  if (format === 'year-month') {
    const m = str.match(/^(\d{4})-(\d{1,2})$/);
    if (m) return new Date(+m[1], +m[2] - 1, 1);
  }
  return new Date(str);
}

// Some CSVs split the date across two columns (e.g. separate year/month
// integers) rather than one combined column. `dateKey` may be an array of
// column names in that case; this joins them into the single string
// `parseDate` expects (paired with dateFormat 'year-month').
function dateValue(config, d) {
  if (Array.isArray(config.dateKey)) {
    const parts = config.dateKey.map(k => d[k]);
    return parts.every(p => p !== undefined && p !== '') ? parts.join('-') : '';
  }
  return d[config.dateKey || 'date'];
}

function parseCSV(text) {
  const lines = text.trim().split('\n');
  const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''));
  return lines.slice(1).map(line => {
    const values = [];
    let current = '';
    let inQuotes = false;
    for (const ch of line) {
      if (ch === '"') { inQuotes = !inQuotes; continue; }
      if (ch === ',' && !inQuotes) { values.push(current.trim()); current = ''; continue; }
      current += ch;
    }
    values.push(current.trim());
    return Object.fromEntries(headers.map((h, i) => [h, values[i] ?? '']));
  });
}

function weeklyMedian(rows, valueKey) {
  const byWeek = new Map();
  for (const row of rows) {
    const d = row.date;
    const day = d.getDay();
    const monday = new Date(d);
    monday.setDate(d.getDate() - (day === 0 ? 6 : day - 1));
    monday.setHours(0, 0, 0, 0);
    const key = monday.getTime();
    if (!byWeek.has(key)) byWeek.set(key, { date: monday, values: [] });
    const v = parseFloat(row[valueKey]);
    if (!isNaN(v) && v >= 0) byWeek.get(key).values.push(v);
  }
  return [...byWeek.values()]
    .map(({ date, values }) => {
      if (!values.length) return null;
      const sorted = [...values].sort((a, b) => a - b);
      return { date, [valueKey]: sorted[Math.floor(sorted.length / 2)] };
    })
    .filter(Boolean)
    .sort((a, b) => a.date - b.date);
}

import { base } from '$app/paths';

// Resolve root-relative paths against the SvelteKit base path.
function resolveUrl(url) {
  if (url.startsWith('/') && !url.startsWith('//')) return `${base}${url}`;
  return url;
}

// Deduplicate concurrent fetches for the same URL
const csvCache = new Map();

function fetchCSV(url) {
  const resolved = resolveUrl(url);
  if (!csvCache.has(resolved)) {
    csvCache.set(resolved, fetch(resolved).then(r => r.text()));
  }
  return csvCache.get(resolved);
}

export async function loadSeries(config) {
  const urls = config.csvUrls ?? [config.csvUrl];
  const texts = await Promise.all(urls.map(fetchCSV));
  const rows = texts
    .flatMap(text => parseCSV(text))
    .filter(d => {
      if (!dateValue(config, d)) return false;
      if (d[config.valueKey] === '') return false;
      if (config.filters) {
        return Object.entries(config.filters).every(([k, v]) => d[k] === v);
      }
      return true;
    })
    .map(d => ({ ...d, date: parseDate(dateValue(config, d), config.dateFormat) }))
    .sort((a, b) => a.date - b.date);
  if (config.aggregate === 'weekly_median') return weeklyMedian(rows, config.valueKey);
  return rows;
}

import {
  PLACES_MEASURES_CSV_URL,
  PLACES_COUNTY_CRUDE_CSV_URL,
  PLACES_COUNTY_AGEADJ_CSV_URL,
  PLACES_STATE_ROLLUP_CSV_URL,
  NMF_COUNTY_CSV_URL,
  NMF_STATE_ROLLUP_CSV_URL,
  CT_PLANNING_REGION_TO_COUNTY,
  STATE_ABBR_TO_FIPS,
  DOLT_PLACES_SQL_URL,
  DOLT_PLACES_RELEASE_YEAR,
  DOLT_NMF_PERIOD
} from '$lib/mapConfig.js';

// The 49-row PLACES measure catalog (both families). Returns plain objects the
// UI groups by category; join key is `measureId`.
export async function loadPlacesMeasures() {
  const text = await fetchCSV(PLACES_MEASURES_CSV_URL);
  return parseCSV(text)
    .filter(d => d.measureid)
    .map(d => ({
      measureId: d.measureid,
      categoryId: d.categoryid,
      category: d.category,
      label: d.short_question_text || d.measure,
      question: d.measure,
      unit: d.data_value_unit || '%',
      source: d.data_source
    }));
}

// Color domain from the data's own spread, floored/ceiled to whole units so the
// ramp uses its full range rather than starting at zero (matches the
// low-birthweight map's convention).
function domainOf(byFips) {
  const vals = [...byFips.values()].map(r => r.value).filter(v => !isNaN(v));
  if (!vals.length) return [0, 1];
  return [Math.floor(Math.min(...vals)), Math.ceil(Math.max(...vals))];
}

// One measure's national choropleth layer, keyed by FIPS (5-digit county or
// 2-digit state) for a direct join against us-atlas topojson.
//
//   family    'brfss' (40 BRFSS measures) | 'acs' (9 Non-Medical Factors)
//   level     'state' | 'county'
//   valueType 'CrdPrv' | 'AgeAdjPrv' — BRFSS only; ignored for 'acs'
//
// State values come straight from the committed rollups (population-weighted
// upstream by health's `places derive`), never re-aggregated here. The two
// 4 MB BRFSS county files are fetched lazily on first county view via the
// shared fetchCSV cache.
export async function loadPlacesChoropleth({ measureId, family, level, valueType = 'CrdPrv' }) {
  if (family === 'acs') {
    const url = level === 'county' ? NMF_COUNTY_CSV_URL : NMF_STATE_ROLLUP_CSV_URL;
    const byFips = new Map();
    for (const d of parseCSV(await fetchCSV(url))) {
      if (d.measureid !== measureId || d.data_value === '') continue;
      const value = +d.data_value;
      if (isNaN(value)) continue;
      if (level === 'county') {
        byFips.set(d.locationid, { value, moe: d.moe !== '' && d.moe != null ? +d.moe : null });
      } else {
        const fips = STATE_ABBR_TO_FIPS[d.stateabbr];
        if (fips) byFips.set(fips, { value });
      }
    }
    return { byFips, domain: domainOf(byFips) };
  }

  if (level === 'state') {
    const byFips = new Map();
    for (const d of parseCSV(await fetchCSV(PLACES_STATE_ROLLUP_CSV_URL))) {
      if (d.measureid !== measureId || d.data_value_type !== valueType) continue;
      const value = +d.data_value;
      if (isNaN(value)) continue;
      const fips = STATE_ABBR_TO_FIPS[d.stateabbr];
      if (fips) byFips.set(fips, { value });
    }
    return { byFips, domain: domainOf(byFips) };
  }

  // BRFSS, county level.
  const url = valueType === 'AgeAdjPrv' ? PLACES_COUNTY_AGEADJ_CSV_URL : PLACES_COUNTY_CRUDE_CSV_URL;
  const byFips = new Map();
  // Connecticut planning-region rows are accumulated onto the retired county
  // FIPS this app's topology uses (see CT_PLANNING_REGION_TO_COUNTY), weighted
  // by region population where more than one region lands on one county.
  const ct = new Map();
  for (const d of parseCSV(await fetchCSV(url))) {
    if (d.measureid !== measureId || d.data_value === '') continue;
    const value = +d.data_value;
    if (isNaN(value)) continue;
    const ctCounty = CT_PLANNING_REGION_TO_COUNTY[d.locationid];
    if (ctCounty) {
      const w = +d.totalpopulation || 1;
      const a = ct.get(ctCounty) ?? { wsum: 0, w: 0 };
      a.wsum += value * w;
      a.w += w;
      ct.set(ctCounty, a);
    } else {
      byFips.set(d.locationid, { value });
    }
  }
  for (const [fips, a] of ct) byFips.set(fips, { value: a.wsum / a.w });
  return { byFips, domain: domainOf(byFips) };
}

async function doltQuery(sql) {
  const res = await fetch(`${DOLT_PLACES_SQL_URL}?q=${encodeURIComponent(sql)}`);
  if (!res.ok) throw new Error(`DoltHub HTTP ${res.status}`);
  const json = await res.json();
  if (json.query_execution_status && json.query_execution_status !== 'Success') {
    throw new Error(json.query_execution_message || 'DoltHub query failed');
  }
  return json.rows ?? [];
}

// One county's full 49-measure profile, live from the DoltHub mirror. Two
// PK-prefix range scans (~0.3s each), one per family — never a JOIN against the
// 6.6M-row fact table. Returns Map<measureId, { value, low?, high?, moe? }>.
// Connecticut counties return SDOH only: PLACES 2025 keys BRFSS rows by
// planning region, not the retired county FIPS passed here.
export async function loadCountyProfile(fips) {
  const brfssSql =
    `SELECT measure_id, data_value, low_confidence_limit, high_confidence_limit ` +
    `FROM measurement WHERE release_year=${DOLT_PLACES_RELEASE_YEAR} ` +
    `AND geo_level='county' AND location_id='${fips}' AND data_value_type='CrdPrv'`;
  const nmfSql =
    `SELECT measure_id, data_value, moe FROM nmf_measurement ` +
    `WHERE period='${DOLT_NMF_PERIOD}' AND geo_level='county' AND location_id='${fips}'`;
  const [brfss, nmf] = await Promise.all([doltQuery(brfssSql), doltQuery(nmfSql)]);
  const out = new Map();
  for (const r of brfss) {
    out.set(r.measure_id, {
      value: +r.data_value,
      low: r.low_confidence_limit != null && r.low_confidence_limit !== '' ? +r.low_confidence_limit : null,
      high: r.high_confidence_limit != null && r.high_confidence_limit !== '' ? +r.high_confidence_limit : null
    });
  }
  for (const r of nmf) {
    out.set(r.measure_id, {
      value: +r.data_value,
      moe: r.moe != null && r.moe !== '' ? +r.moe : null
    });
  }
  return out;
}

function mondayOf(d) {
  const day = d.getDay();
  const monday = new Date(d);
  monday.setDate(d.getDate() - (day === 0 ? 6 : day - 1));
  monday.setHours(0, 0, 0, 0);
  return monday;
}

// Bucket strategies for indexToCommonBase: `key` maps a row's date to a
// comparable, sortable bucket id; `date` maps that id back to a
// representative Date for plotting.
export const ANNUAL_BUCKET = {
  key: (d) => d.getFullYear(),
  date: (key) => new Date(key, 0, 1)
};
export const WEEKLY_BUCKET = {
  key: (d) => mondayOf(d).getTime(),
  date: (key) => new Date(key)
};

// Indexes two or more differently-scaled series to a common base (=100 at
// the first bucket every series has data), so they can share one y-axis
// honestly. Two measures of different scale should never share a dual-axis
// plot (the alignment of the two scales is arbitrary and invents a
// correlation that isn't in the data) — indexing to a common base is the
// standard alternative when the story specifically calls for one shared line
// chart rather than small multiples.
//
// series: [{ rows, valueKey, label, unit, format, color }], where `rows` are
// already-loaded/-filtered rows (from loadSeries/loadSubSeries) with a `date`
// field. `bucket` defaults to ANNUAL_BUCKET (calendar year) — pass
// WEEKLY_BUCKET for weekly series running on different exact-date cadences
// (e.g. hospitalization vs. wastewater sample-collection dates), which snaps
// each row to the Monday of its week before comparing.
export function indexToCommonBase(series, bucket = ANNUAL_BUCKET) {
  const bucketsPerSeries = series.map(s => new Set(s.rows.map(r => bucket.key(r.date))));
  const allBuckets = [...bucketsPerSeries[0]].filter(b => bucketsPerSeries.every(bs => bs.has(b)));
  if (!allBuckets.length) {
    throw new Error('No overlapping periods across the given series');
  }
  const baseBucket = Math.min(...allBuckets);

  return series.map(s => {
    const byBucket = new Map(s.rows.map(r => [bucket.key(r.date), r]));
    const baseValue = +byBucket.get(baseBucket)[s.valueKey];
    const indexed = [...byBucket.entries()]
      .filter(([b]) => b >= baseBucket)
      .sort(([a], [b]) => a - b)
      .map(([b, r]) => ({
        year: b,
        date: bucket.date(b),
        value: +r[s.valueKey],
        index: baseValue ? (+r[s.valueKey] / baseValue) * 100 : null
      }));
    // baseYear is the raw bucket key (a plain year integer for ANNUAL_BUCKET,
    // a week-start timestamp for WEEKLY_BUCKET) — format it with
    // bucket.date(baseYear) at the call site rather than displaying it
    // directly for weekly buckets.
    return { ...s, baseYear: baseBucket, baseValue, rows: indexed };
  });
}

// Loads the per-state measles case snapshot (one row per state, see health's
// cdc_open.fetch_measles_by_state), keyed by 2-digit state FIPS so it can be
// joined against us-atlas topology the same way loadPlacesCounty() is.
export async function loadMeaslesByState(csvUrl) {
  const text = await fetchCSV(csvUrl);
  return parseCSV(text).map(d => ({
    state: d.state,
    fips: d.state_fips,
    year: +d.year,
    week: +d.week,
    cases: +d.cases
  }));
}

// Loads the per-state low-birthweight snapshot (one row per state, see health's
// nchs_dqs.fetch_dqs), keyed by 2-digit state FIPS so it can be joined against
// us-atlas topology the same way loadMeaslesByState() is.
export async function loadLowBirthweightByState(csvUrl) {
  const text = await fetchCSV(csvUrl);
  return parseCSV(text).map(d => ({
    state: d.state,
    fips: d.state_fips,
    year: +d.year,
    pct: +d.pct_low_birthweight
  }));
}

export async function loadSubSeries(config) {
  const urls = config.csvUrls ?? [config.csvUrl];
  const texts = await Promise.all(urls.map(fetchCSV));
  const allRows = texts
    .flatMap(text => parseCSV(text))
    .filter(d => dateValue(config, d) && d[config.valueKey] !== '' && !isNaN(+d[config.valueKey]))
    .map(d => { const dt = parseDate(dateValue(config, d), config.dateFormat); return { ...d, date: dt, ts: dt.getTime() }; })
    .sort((a, b) => a.ts - b.ts);
  return config.subSeries.map(sub => ({
    key: sub.key,
    label: sub.label,
    color: sub.color,
    rows: allRows.filter(d => Object.entries(sub.filters).every(([k, v]) => d[k] === v))
  }));
}
