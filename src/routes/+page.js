import { SERIES_CONFIG } from '$lib/config.js';

export const prerender = true;

function parseDate(str, format) {
  if (format === 'quarter') {
    const m = str.match(/(\d{4})\s+Q(\d)/);
    if (m) return new Date(+m[1], (+m[2] - 1) * 3, 1);
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

export async function load({ fetch }) {
  const datasets = await Promise.all(
    Object.values(SERIES_CONFIG).map(async (config) => {
      const text = await fetch(config.csvUrl).then(r => r.text());
      const dateKey = config.dateKey || 'date';
      const rows = parseCSV(text)
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
      return { id: config.id, data: rows };
    })
  );
  return { datasets };
}
