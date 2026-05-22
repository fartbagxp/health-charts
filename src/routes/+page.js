import { SERIES_CONFIG } from '$lib/config.js';

export const prerender = true;

function parseCSV(text) {
  const lines = text.trim().split('\n');
  const headers = lines[0].split(',').map(h => h.trim());
  return lines.slice(1).map(line => {
    const values = line.split(',');
    return Object.fromEntries(headers.map((h, i) => [h, values[i]?.trim() ?? '']));
  });
}

export async function load({ fetch }) {
  const datasets = await Promise.all(
    Object.values(SERIES_CONFIG).map(async (config) => {
      const text = await fetch(config.csvUrl).then(r => r.text());
      const rows = parseCSV(text);
      return {
        id: config.id,
        data: rows
          .filter(d => d.date && d[config.valueKey] !== '')
          .map(d => ({ ...d, date: new Date(d.date) }))
      };
    })
  );
  return { datasets };
}
