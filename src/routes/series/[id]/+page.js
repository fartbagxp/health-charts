import { SERIES_CONFIG } from '$lib/config.js';
import { error } from '@sveltejs/kit';

export const prerender = true;

export function entries() {
  return Object.keys(SERIES_CONFIG).map(id => ({ id }));
}

export function load({ params }) {
  const config = SERIES_CONFIG[params.id];
  if (!config) error(404, 'Series not found');
  return { config };
}
