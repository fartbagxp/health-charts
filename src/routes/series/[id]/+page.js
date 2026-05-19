import { SERIES_CONFIG } from '$lib/config.js';
import { base } from '$app/paths';
import { error } from '@sveltejs/kit';

export const prerender = true;

export function entries() {
  return Object.keys(SERIES_CONFIG).map(id => ({ id }));
}

export async function load({ fetch, params }) {
  const config = SERIES_CONFIG[params.id];
  if (!config) error(404, 'Series not found');
  const raw = await fetch(`${base}/data/${config.dataFile}`).then(r => r.json());
  const data = raw.map(d => ({ ...d, date: new Date(d.date) }));
  return { data, config };
}
