import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT_DIR = path.join(__dirname, '../public/data/processed');

fs.mkdirSync(OUT_DIR, { recursive: true });

const RAW_BASE = 'https://raw.githubusercontent.com/fartbagxp/health/main/data/raw/cdc_open';

const WASTEWATER_SERIES = [
  { name: 'wastewater_covid',    file: 'wastewater_covid.csv' },
  { name: 'wastewater_flu',      file: 'wastewater_flu.csv' },
  { name: 'wastewater_rsv',      file: 'wastewater_rsv.csv' },
  { name: 'wastewater_measles',  file: 'wastewater_measles.csv' },
  { name: 'wastewater_h5',       file: 'wastewater_h5.csv' },
];

const DATE_KEY   = 'sample_collect_date';
const VALUE_KEY  = 'pcr_target_flowpop_lin';

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

function weeklyMedian(rows) {
  const byWeek = new Map();
  for (const row of rows) {
    const d = new Date(row[DATE_KEY]);
    if (isNaN(d)) continue;
    const v = parseFloat(row[VALUE_KEY]);
    if (isNaN(v) || v < 0) continue;

    const day = d.getDay();
    const monday = new Date(d);
    monday.setDate(d.getDate() - (day === 0 ? 6 : day - 1));
    monday.setHours(0, 0, 0, 0);
    const key = monday.getTime();

    if (!byWeek.has(key)) byWeek.set(key, { date: monday, values: [] });
    byWeek.get(key).values.push(v);
  }

  return [...byWeek.values()]
    .map(({ date, values }) => {
      const sorted = [...values].sort((a, b) => a - b);
      return { date, value: sorted[Math.floor(sorted.length / 2)] };
    })
    .sort((a, b) => a.date - b.date);
}

function toCSV(rows) {
  const lines = [`${DATE_KEY},${VALUE_KEY}`];
  for (const { date, value } of rows) {
    lines.push(`${date.toISOString().slice(0, 10)},${value}`);
  }
  return lines.join('\n');
}

async function processSeries({ name, file }) {
  const url = `${RAW_BASE}/${file}`;
  console.log(`Fetching ${file}...`);
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status} fetching ${url}`);
  const text = await res.text();

  const rawRows = parseCSV(text);
  const aggregated = weeklyMedian(rawRows);
  const csv = toCSV(aggregated);

  const outPath = path.join(OUT_DIR, `${name}.csv`);
  fs.writeFileSync(outPath, csv);
  console.log(`  ${rawRows.length} raw rows → ${aggregated.length} weekly points → ${outPath}`);
}

async function main() {
  console.log('Aggregating wastewater data...\n');
  for (const series of WASTEWATER_SERIES) {
    await processSeries(series);
  }
  console.log('\nDone.');
}

main().catch(e => { console.error(e); process.exit(1); });
