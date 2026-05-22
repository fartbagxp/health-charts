import { SERIES_CONFIG } from '$lib/config.js';
import { error } from '@sveltejs/kit';

export const prerender = true;

export function entries() {
  return Object.keys(SERIES_CONFIG).map(id => ({ id }));
}

function parseCSV(text) {
  const lines = text.trim().split('\n');
  const headers = lines[0].split(',').map(h => h.trim());
  return lines.slice(1).map(line => {
    const values = line.split(',');
    return Object.fromEntries(headers.map((h, i) => [h, values[i]?.trim() ?? '']));
  });
}

export async function load({ fetch, params }) {
  const config = SERIES_CONFIG[params.id];
  if (!config) error(404, 'Series not found');
  const text = await fetch(config.csvUrl).then(r => r.text());
  const data = parseCSV(text)
    .filter(d => d.date && d[config.valueKey] !== '')
    .map(d => ({ ...d, date: new Date(d.date) }));
  return { data, config };
}
