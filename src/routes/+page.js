import { SERIES_CONFIG } from '$lib/config.js';
import { base } from '$app/paths';

export const prerender = true;

export async function load({ fetch }) {
  const datasets = await Promise.all(
    Object.values(SERIES_CONFIG).map(async (config) => {
      const data = await fetch(`${base}/data/${config.dataFile}`).then(r => r.json());
      return {
        id: config.id,
        data: data.map(d => ({ ...d, date: new Date(d.date) }))
      };
    })
  );
  return { datasets };
}
