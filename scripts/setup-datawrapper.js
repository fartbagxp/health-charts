/**
 * Setup Datawrapper Charts
 *
 * Creates, configures, and publishes one Datawrapper line chart per health
 * data series. Saves the resulting public chart IDs (never the token) to
 * public/data/datawrapper-charts.json so the frontend can embed them.
 *
 * Usage:
 *   node --env-file=.env scripts/setup-datawrapper.js
 *
 * Re-running will create new charts each time. To update an existing chart
 * instead, pass the chart IDs as env vars: FLU_CHART_ID, COVID_CHART_ID, RSV_CHART_ID.
 */

import { readFile, writeFile } from 'node:fs/promises';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const DW_API = 'https://api.datawrapper.de/v3';

const TOKEN = process.env.DATAWRAPPER_API_TOKEN;
if (!TOKEN) {
  console.error(
    'Error: DATAWRAPPER_API_TOKEN is not set.\n' +
    'Run with: node --env-file=.env scripts/setup-datawrapper.js'
  );
  process.exit(1);
}

const CHART_CONFIGS = [
  {
    seriesId: 'flu',
    existingChartId: process.env.FLU_CHART_ID,
    title: 'Seasonal Flu Cases (2020–2024)',
    type: 'd3-lines',
    dataFile: 'flu-cases.json',
    valueKey: 'cases',
    valueLabel: 'Flu Cases',
    sourceName: 'CDC FluView',
    sourceUrl: 'https://www.cdc.gov/flu/weekly/',
    introText: 'Monthly influenza case estimates from CDC FluView surveillance.'
  },
  {
    seriesId: 'covid',
    existingChartId: process.env.COVID_CHART_ID,
    title: 'COVID-19 Hospitalizations (2020–2024)',
    type: 'd3-lines',
    dataFile: 'covid-hospitalizations.json',
    valueKey: 'hospitalizations',
    valueLabel: 'Hospitalizations',
    sourceName: 'CDC COVID-NET',
    sourceUrl: 'https://www.cdc.gov/covid/data-research/',
    introText: 'Weekly COVID-19-associated hospital admissions from CDC COVID-NET.'
  },
  {
    seriesId: 'rsv',
    existingChartId: process.env.RSV_CHART_ID,
    title: 'RSV Hospitalization Rate (2020–2024)',
    type: 'd3-lines',
    dataFile: 'rsv-hospitalizations.json',
    valueKey: 'rate',
    valueLabel: 'Rate per 100,000',
    sourceName: 'CDC RSV-NET',
    sourceUrl: 'https://www.cdc.gov/rsv/php/surveillance/',
    introText: 'Weekly RSV-associated hospitalization rate per 100,000 from CDC RSV-NET.'
  }
];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function jsonToCsv(data, valueKey, valueLabel) {
  const header = `Date,${valueLabel}`;
  const rows = data.map(d => `${d.date},${d[valueKey]}`);
  return [header, ...rows].join('\n');
}

async function dwFetch(path, method = 'GET', body = null, contentType = 'application/json') {
  const headers = {
    Authorization: `Bearer ${TOKEN}`,
    Accept: 'application/json',
  };
  if (body !== null) {
    headers['Content-Type'] = contentType;
  }

  const res = await fetch(`${DW_API}${path}`, {
    method,
    headers,
    body: body === null
      ? undefined
      : contentType === 'application/json'
        ? JSON.stringify(body)
        : body,
  });

  const text = await res.text();
  if (!res.ok) {
    throw new Error(`Datawrapper ${method} ${path} → HTTP ${res.status}: ${text}`);
  }
  return text ? JSON.parse(text) : {};
}

// ---------------------------------------------------------------------------
// Per-chart workflow
// ---------------------------------------------------------------------------

async function setupChart(cfg) {
  console.log(`\n── ${cfg.title}`);

  // Load local data file
  const dataPath = join(ROOT, 'public', 'data', cfg.dataFile);
  const rawData = JSON.parse(await readFile(dataPath, 'utf8'));
  const csv = jsonToCsv(rawData, cfg.valueKey, cfg.valueLabel);

  let chartId = cfg.existingChartId;

  if (chartId) {
    console.log(`   Reusing existing chart ${chartId}`);
  } else {
    // 1. Create a new chart
    console.log('   Creating chart...');
    const created = await dwFetch('/charts', 'POST', {
      title: cfg.title,
      type: cfg.type,
      language: 'en-US',
    });
    chartId = created.id;
    console.log(`   Chart ID: ${chartId}`);
  }

  // 2. Configure metadata
  console.log('   Configuring metadata...');
  await dwFetch(`/charts/${chartId}`, 'PATCH', {
    title: cfg.title,
    metadata: {
      describe: {
        intro: cfg.introText,
        'source-name': cfg.sourceName,
        'source-url': cfg.sourceUrl,
      },
      visualize: {
        'x-grid': 'on',
        'y-grid': 'on',
      },
      data: {
        'column-format': {
          Date: { type: 'date', dateFormat: 'YYYY-MM-DD' },
          [cfg.valueLabel]: { type: 'number' },
        },
      },
    },
  });

  // 3. Upload CSV data
  console.log(`   Uploading ${rawData.length} rows of data...`);
  await dwFetch(`/charts/${chartId}/data`, 'PUT', csv, 'text/csv');

  // 4. Publish (requires chart:publish scope on the API token)
  console.log('   Publishing...');
  try {
    await dwFetch(`/charts/${chartId}/publish`, 'POST');
    const embedUrl = `https://datawrapper.dwcdn.net/${chartId}/1/`;
    console.log(`   Published → ${embedUrl}`);
    return { seriesId: cfg.seriesId, chartId, published: true };
  } catch (err) {
    if (err.message.includes('403') || err.message.includes('Insufficient scope')) {
      console.warn(
        `   ⚠ Could not publish (token missing chart:publish scope).\n` +
        `     Chart ${chartId} was created and data was uploaded — it just needs to be published.\n` +
        `     To fix: regenerate your API token at https://app.datawrapper.de/account/api-keys\n` +
        `     and enable the "chart:publish" scope. Then re-run this script with:\n` +
        `       FLU_CHART_ID=<id> COVID_CHART_ID=<id> RSV_CHART_ID=<id> node --env-file=.env scripts/setup-datawrapper.js\n` +
        `     Or publish manually in the Datawrapper UI: https://app.datawrapper.de/chart/${chartId}/publish`
      );
      return { seriesId: cfg.seriesId, chartId, published: false };
    }
    throw err;
  }
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  console.log('Setting up Datawrapper charts...');
  console.log('Token: [present, not logged]\n');

  const chartIds = {};
  const results = [];

  for (const cfg of CHART_CONFIGS) {
    const result = await setupChart(cfg);
    chartIds[result.seriesId] = result.chartId;
    results.push(result);
  }

  // Write ONLY the public chart IDs — the token is never included
  const outPath = join(ROOT, 'public', 'data', 'datawrapper-charts.json');
  await writeFile(outPath, JSON.stringify(chartIds, null, 2) + '\n');

  const allPublished = results.every(r => r.published);
  console.log(`\n${allPublished ? '✓' : '⚠'} Chart IDs saved to public/data/datawrapper-charts.json`);
  console.log('  (Safe to commit — contains no credentials.)\n');
  console.log(chartIds);
  console.log(
    '\nTo update existing charts without recreating them, set env vars:\n' +
    `  FLU_CHART_ID=${chartIds.flu} COVID_CHART_ID=${chartIds.covid} RSV_CHART_ID=${chartIds.rsv}`
  );
  if (!allPublished) {
    console.log(
      '\n⚠ One or more charts were not published. Embed URLs will not work until published.\n' +
      '  Fix: add chart:publish scope to your token at https://app.datawrapper.de/account/api-keys\n' +
      '  Then re-run the script with the existing chart IDs above.'
    );
  }
}

main().catch(err => {
  console.error('\nFatal:', err.message);
  process.exit(1);
});
