function parseDate(str, format) {
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

// Deduplicate concurrent fetches for the same URL
const csvCache = new Map();

function fetchCSV(url) {
  if (!csvCache.has(url)) {
    csvCache.set(url, fetch(url).then(r => r.text()));
  }
  return csvCache.get(url);
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
