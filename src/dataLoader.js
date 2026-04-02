import * as d3 from 'd3';
import { SERIES_CONFIG } from './config.js';

const cache = {};

export async function loadSeriesData(seriesId) {
  if (cache[seriesId]) return cache[seriesId];
  const baseUrl = import.meta.env.BASE_URL;
  const config = SERIES_CONFIG[seriesId];
  const data = await d3.json(`${baseUrl}data/${config.dataFile}`);
  cache[seriesId] = data;
  return data;
}
