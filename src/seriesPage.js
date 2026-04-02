import * as d3 from 'd3';
import { SERIES_CONFIG } from './config.js';
import { loadSeriesData } from './dataLoader.js';
import { LineChart } from './chart.js';

let dwChartIds = null;

async function loadDwChartIds() {
  if (dwChartIds !== null) return dwChartIds;
  const baseUrl = import.meta.env.BASE_URL;
  try {
    dwChartIds = await (await fetch(`${baseUrl}data/datawrapper-charts.json`)).json();
  } catch {
    dwChartIds = {};
  }
  return dwChartIds;
}

export async function renderSeries(container, seriesId) {
  const config = SERIES_CONFIG[seriesId];

  if (!config) {
    container.innerHTML = `
      <div class="error-page">
        <h2>Series not found</h2>
        <p>The series <strong>${seriesId}</strong> does not exist.</p>
        <a href="#/">← Back to Home</a>
      </div>
    `;
    return;
  }

  container.innerHTML = `
    <main class="series-main">
      <nav class="series-breadcrumb" aria-label="Breadcrumb">
        <a href="#/">Home</a>
        <span class="breadcrumb-sep">›</span>
        <span>${config.title}</span>
      </nav>

      <div class="series-header">
        <div class="series-header-text">
          <h1>${config.title}</h1>
          <p class="series-description">${config.description}</p>
          <div class="series-meta-row">
            <span class="meta-pill">${config.frequency}</span>
            <span class="meta-pill">Source: ${config.source}</span>
            <span class="meta-pill">${config.category}</span>
          </div>
        </div>
        <div class="series-actions">
          <button id="download-csv-btn" class="btn-download">↓ Download CSV</button>
        </div>
      </div>

      <div class="chart-wrapper" id="chart-wrapper">
        <div id="series-chart"></div>
      </div>

      <section class="metrics-grid">
        <div class="metric-card">
          <h3>Latest Value</h3>
          <p class="metric-value" id="metric-latest">—</p>
          <p class="metric-unit">${config.unit}</p>
        </div>
        <div class="metric-card">
          <h3>Peak Value</h3>
          <p class="metric-value" id="metric-peak">—</p>
          <p class="metric-unit">${config.unit}</p>
        </div>
        <div class="metric-card">
          <h3>Period Average</h3>
          <p class="metric-value" id="metric-avg">—</p>
          <p class="metric-unit">${config.unit}</p>
        </div>
      </section>

      <section class="series-nav">
        <h2>More Series</h2>
        <div class="other-series-links">
          ${Object.values(SERIES_CONFIG)
            .filter(s => s.id !== seriesId)
            .map(s => `
              <a href="#/series/${s.id}" class="other-series-link" style="border-left-color:${s.color}">
                <span class="other-series-title">${s.title}</span>
                <span class="other-series-meta">${s.frequency} · ${s.source}</span>
              </a>
            `)
            .join('')}
        </div>
      </section>
    </main>
  `;

  window.scrollTo(0, 0);

  let d3Chart;
  let resizeHandler;

  try {
    const [data, chartIds] = await Promise.all([
      loadSeriesData(seriesId),
      loadDwChartIds(),
    ]);

    const formatter = d3.format(config.format);
    const values = data.map(d => +d[config.valueKey]);
    document.getElementById('metric-latest').textContent = formatter(values[values.length - 1]);
    document.getElementById('metric-peak').textContent = formatter(Math.max(...values));
    document.getElementById('metric-avg').textContent = formatter(Math.round(values.reduce((a, b) => a + b, 0) / values.length));

    const dwId = chartIds[seriesId];
    const chartEl = document.getElementById('series-chart');
    const chartWrapper = document.getElementById('chart-wrapper');

    if (dwId) {
      // ── Datawrapper embed ──────────────────────────────────────────────
      chartWrapper.classList.add('chart-wrapper--dw');
      chartEl.innerHTML = `
        <iframe
          title="${config.title}"
          aria-label="Interactive line chart"
          src="https://datawrapper.dwcdn.net/${dwId}/1/"
          scrolling="no"
          frameborder="0"
          style="width: 100%; min-width: 100%; border: none; display: block;"
          height="460"
          data-external="1"
        ></iframe>
        <p class="dw-credit">
          Interactive chart powered by
          <a href="https://www.datawrapper.de/" target="_blank" rel="noopener">Datawrapper</a>
          &nbsp;·&nbsp;
          <a href="https://datawrapper.dwcdn.net/${dwId}/1/" target="_blank" rel="noopener">
            Open in full screen
          </a>
        </p>
      `;
    } else {
      // ── D3 fallback ────────────────────────────────────────────────────
      d3Chart = new LineChart('series-chart', {
        width: 960,
        height: 420,
        xKey: 'date',
        formatValue: formatter,
      });
      d3Chart.update([{
        name: config.title,
        data,
        color: config.color,
        valueKey: config.valueKey,
      }]);

      let resizeTimer;
      resizeHandler = () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => {
          d3Chart.init();
          d3Chart.update([{ name: config.title, data, color: config.color, valueKey: config.valueKey }]);
        }, 250);
      };
      window.addEventListener('resize', resizeHandler);
    }

    // Download (uses local data regardless of chart renderer)
    const csvRows = ['Date,' + config.valueKey, ...data.map(d => `${d.date},${d[config.valueKey]}`)];
    document.getElementById('download-csv-btn').addEventListener('click', () => {
      const blob = new Blob([csvRows.join('\n')], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = Object.assign(document.createElement('a'), { href: url, download: `${seriesId}-data.csv` });
      a.click();
      URL.revokeObjectURL(url);
    });

  } catch (e) {
    console.error('Error loading series:', e);
    const chartEl = document.getElementById('series-chart');
    if (chartEl) chartEl.innerHTML = '<p class="error-text">Failed to load chart data.</p>';
  }

  // Cleanup on next navigation
  window.addEventListener('hashchange', () => {
    if (resizeHandler) window.removeEventListener('resize', resizeHandler);
    if (d3Chart) d3Chart.destroy();
  }, { once: true });
}
