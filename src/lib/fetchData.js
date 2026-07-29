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
  return new Date(str);
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
  const dateKey = config.dateKey || 'date';
  const texts = await Promise.all(urls.map(fetchCSV));
  const rows = texts
    .flatMap(text => parseCSV(text))
    .filter(d => {
      if (!d[dateKey]) return false;
      if (d[config.valueKey] === '') return false;
      if (config.filters) {
        return Object.entries(config.filters).every(([k, v]) => d[k] === v);
      }
      return true;
    })
    .map(d => ({ ...d, date: parseDate(d[dateKey], config.dateFormat) }))
    .sort((a, b) => a.date - b.date);
  if (config.aggregate === 'weekly_median') return weeklyMedian(rows, config.valueKey);
  return rows;
}

// Loads CDC PLACES county-level chronic disease data (crude prevalence rows
// only), keyed by 5-digit county FIPS so it can be joined against us-atlas
// topojson. State rows are derived by population-weighting the counties,
// since the CSV itself has no true state-level aggregate rows. The CSV is
// already filtered/slimmed server-side (see health's
// cdc_open.aggregate.aggregate_places_county()), so no further row filtering
// is needed here.
export async function loadPlacesCounty(csvUrl) {
  const text = await fetchCSV(csvUrl);
  const counties = parseCSV(text)
    .map(d => ({
      fips: d.locationid,
      stateFips: d.locationid.slice(0, 2),
      stateAbbr: d.stateabbr,
      name: d.locationname,
      measureId: d.measureid,
      value: +d.data_value,
      population: +d.totalpopulation || 0
    }));

  const byMeasureState = new Map();
  for (const c of counties) {
    const key = `${c.measureId}|${c.stateFips}`;
    if (!byMeasureState.has(key)) {
      byMeasureState.set(key, { fips: c.stateFips, stateAbbr: c.stateAbbr, measureId: c.measureId, totalPop: 0, weightedSum: 0 });
    }
    const s = byMeasureState.get(key);
    s.totalPop += c.population;
    s.weightedSum += c.value * c.population;
  }
  const states = [...byMeasureState.values()]
    .filter(s => s.totalPop > 0)
    .map(s => ({ fips: s.fips, stateAbbr: s.stateAbbr, measureId: s.measureId, value: s.weightedSum / s.totalPop }));

  return { counties, states };
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

export async function loadSubSeries(config) {
  const urls = config.csvUrls ?? [config.csvUrl];
  const dateKey = config.dateKey || 'date';
  const texts = await Promise.all(urls.map(fetchCSV));
  const allRows = texts
    .flatMap(text => parseCSV(text))
    .filter(d => d[dateKey] && d[config.valueKey] !== '' && !isNaN(+d[config.valueKey]))
    .map(d => { const dt = parseDate(d[dateKey], config.dateFormat); return { ...d, date: dt, ts: dt.getTime() }; })
    .sort((a, b) => a.ts - b.ts);
  return config.subSeries.map(sub => ({
    key: sub.key,
    label: sub.label,
    color: sub.color,
    rows: allRows.filter(d => Object.entries(sub.filters).every(([k, v]) => d[k] === v))
  }));
}
