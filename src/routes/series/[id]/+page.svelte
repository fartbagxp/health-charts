<script>
  import { format } from 'd3-format';
  import { Plot, Line, AxisX, AxisY, RuleY, GridY } from 'svelteplot';
  import { loadSeries, loadSubSeries } from '$lib/fetchData.js';

  let { data } = $props();
  const config = $derived(data.config);
  const isMulti = $derived(!!config.subSeries);
  const fmt = $derived(format(config.format));

  let rows = $state([]);
  let subData = $state([]);
  let loading = $state(true);
  let loadError = $state(null);

  $effect(() => {
    const cfg = config;
    rows = [];
    subData = [];
    loading = true;
    loadError = null;

    (async () => {
      try {
        if (cfg.subSeries) {
          subData = await loadSubSeries(cfg);
        } else {
          rows = await loadSeries(cfg);
        }
      } catch (e) {
        loadError = e.message ?? 'Failed to load';
      } finally {
        loading = false;
      }
    })();
  });

  const normRows = $derived(rows.map(d => ({ date: d.date, value: +d[config.valueKey] })));
  const values = $derived(rows.map(d => +d[config.valueKey]));

  const latestVal = $derived(isMulti
    ? fmt(+(subData[0]?.rows?.at(-1)?.[config.valueKey] ?? 0))
    : values.length ? fmt(values[values.length - 1]) : '—');
  const peakVal = $derived(isMulti
    ? fmt(Math.max(...subData.flatMap(s => s.rows.map(d => +d[config.valueKey]))))
    : values.length ? fmt(Math.max(...values)) : '—');
  const avgVal = $derived(isMulti
    ? (() => {
        const firstRows = subData[0]?.rows ?? [];
        const v = firstRows.map(d => +d[config.valueKey]);
        return v.length ? fmt(Math.round(v.reduce((a, b) => a + b, 0) / v.length)) : '—';
      })()
    : values.length ? fmt(Math.round(values.reduce((a, b) => a + b, 0) / values.length)) : '—');

  let hoveredDatum = $state(null);
  let multiDatum = $state(null);
  let clientX = $state(0);
  let clientY = $state(0);
  let flipLeft = $state(false);

  const MARGIN_LEFT = 40;
  const MARGIN_RIGHT = 16;

  function onChartMove(evt) {
    const rect = evt.currentTarget.getBoundingClientRect();
    const mx = evt.clientX - rect.left;
    const innerWidth = rect.width - MARGIN_LEFT - MARGIN_RIGHT;
    const fraction = (mx - MARGIN_LEFT) / innerWidth;

    if (fraction < 0 || fraction > 1 || !rows.length) { hoveredDatum = null; return; }

    const t0 = rows[0].date.getTime();
    const t1 = rows[rows.length - 1].date.getTime();
    const targetTime = t0 + fraction * (t1 - t0);
    hoveredDatum = rows.reduce((best, d) =>
      Math.abs(d.date.getTime() - targetTime) < Math.abs(best.date.getTime() - targetTime) ? d : best
    );
    clientX = evt.clientX;
    clientY = evt.clientY;
    flipLeft = evt.clientX > window.innerWidth * 0.6;
  }

  function onChartMoveMulti(evt) {
    const rect = evt.currentTarget.getBoundingClientRect();
    const mx = evt.clientX - rect.left;
    const innerWidth = rect.width - MARGIN_LEFT - MARGIN_RIGHT;
    const fraction = (mx - MARGIN_LEFT) / innerWidth;

    const firstRows = subData[0]?.rows ?? [];
    if (fraction < 0 || fraction > 1 || !firstRows.length) { hoveredDatum = null; multiDatum = null; return; }

    const t0 = firstRows[0].ts;
    const t1 = firstRows[firstRows.length - 1].ts;
    const targetTime = t0 + fraction * (t1 - t0);
    const closest = firstRows.reduce((best, d) =>
      Math.abs(d.ts - targetTime) < Math.abs(best.ts - targetTime) ? d : best
    );
    hoveredDatum = closest;
    multiDatum = subData.map(sub => ({
      key: sub.key,
      label: sub.label,
      color: sub.color,
      datum: sub.rows.find(d => d.ts === closest.ts) ?? closest
    }));
    clientX = evt.clientX;
    clientY = evt.clientY;
    flipLeft = evt.clientX > window.innerWidth * 0.6;
  }

  function downloadCSV() {
    if (isMulti) {
      const firstRows = subData[0]?.rows ?? [];
      const headers = ['Date', ...subData.map(s => s.label)];
      const lines = [
        headers.join(','),
        ...firstRows.map(d => {
          const vals = subData.map(sub => {
            const match = sub.rows.find(r => r.ts === d.ts);
            return match ? match[config.valueKey] : '';
          });
          return [new Date(d.ts).toISOString().slice(0, 10), ...vals].join(',');
        })
      ];
      const blob = new Blob([lines.join('\n')], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = Object.assign(document.createElement('a'), { href: url, download: `${config.id}-data.csv` });
      a.click();
      URL.revokeObjectURL(url);
    } else {
      const lines = ['Date,' + config.valueKey, ...rows.map(d => `${d.date.toISOString().slice(0,10)},${d[config.valueKey]}`)];
      const blob = new Blob([lines.join('\n')], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = Object.assign(document.createElement('a'), { href: url, download: `${config.id}-data.csv` });
      a.click();
      URL.revokeObjectURL(url);
    }
  }
</script>

<svelte:head><title>{config.title} — Health Charts</title></svelte:head>

<div class="series-main">
  <div class="series-header">
    <div>
      <h1>{config.title}</h1>
      <p class="series-desc">{config.description}</p>
      <div class="meta-pills">
        <span class="meta-pill">{config.frequency}</span>
        <span class="meta-pill"><a href="{config.sourceUrl}" target="_blank" rel="noopener">Source: {config.source}</a></span>
        <span class="meta-pill">{config.category}</span>
      </div>
    </div>
    <button class="btn-download" onclick={downloadCSV} disabled={loading || !!loadError}>↓ Download CSV</button>
  </div>

  {#if loadError}
    <div class="chart-error-msg">Failed to load data: {loadError}</div>
  {:else if loading}
    <div class="chart-loading-placeholder" aria-busy="true"></div>
  {:else if isMulti}
    <div class="chart-legend">
      {#each subData as sub}
        <span class="legend-item">
          <span class="legend-swatch" style="background:{sub.color}"></span>
          {sub.label}
        </span>
      {/each}
    </div>

    <div
      role="figure"
      class="chart-wrap"
      style="position:relative"
      onpointermove={onChartMoveMulti}
      onpointerleave={() => { hoveredDatum = null; multiDatum = null; }}
    >
      <Plot height={420} x={{ type: 'time' }} y={config.yDomain ? { domain: config.yDomain } : undefined} style="width:100%">
        <RuleY y={config.yDomain ? config.yDomain[0] : 0} />
        <GridY strokeOpacity={0.2} />
        <AxisX tickFormat={(d) => d instanceof Date ? d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : String(d)} />
        <AxisY />
        {#each subData as sub}
          <Line data={sub.rows} x="date" y={config.valueKey} stroke={sub.color} strokeWidth={2} />
        {/each}
        {#snippet overlay()}
          {#if hoveredDatum && multiDatum}
            <div class="tip-box" style="position:fixed; {flipLeft ? `right:${window.innerWidth - clientX + 14}px` : `left:${clientX + 14}px`}; top:{clientY}px; transform:translateY(-50%); pointer-events:none">
              <div class="tip-date">{new Date(hoveredDatum.ts).toLocaleDateString('en-US', { year: 'numeric' })}</div>
              {#each multiDatum as sub}
                <div class="tip-row">
                  <span class="tip-swatch" style="background:{sub.color}"></span>
                  <span class="tip-label">{sub.label}</span>
                  <span class="tip-val">{fmt(+sub.datum[config.valueKey])} <span style="font-size:0.72rem;opacity:0.7">{config.unit}</span></span>
                </div>
              {/each}
            </div>
          {/if}
        {/snippet}
      </Plot>
    </div>
  {:else}
    <div
      role="figure"
      class="chart-wrap"
      style="position:relative"
      onpointermove={onChartMove}
      onpointerleave={() => { hoveredDatum = null; }}
    >
      <Plot height={420} x={{ type: 'time' }} style="width:100%">
        <RuleY y={0} />
        <GridY strokeOpacity={0.2} />
        <AxisX tickFormat={(d) => d instanceof Date ? d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : String(d)} />
        <AxisY />
        <Line data={normRows} x="date" y="value" stroke={config.color ?? 'black'} strokeWidth={2} />
        {#snippet overlay()}
          {#if hoveredDatum}
            <div class="tip-box" style="position:fixed; {flipLeft ? `right:${window.innerWidth - clientX + 14}px` : `left:${clientX + 14}px`}; top:{clientY}px; transform:translateY(-50%); pointer-events:none">
              <div class="tip-label">{config.title}</div>
              <div class="tip-date">{hoveredDatum.date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</div>
              <div class="tip-val">{fmt(+hoveredDatum[config.valueKey])} <span style="font-size:0.72rem;opacity:0.7">{config.unit}</span></div>
            </div>
          {/if}
        {/snippet}
      </Plot>
    </div>
  {/if}

  <p class="chart-source">Source: <a href="{config.sourceUrl}" target="_blank" rel="noopener">{config.source}</a></p>

  <div class="metrics-grid">
    <div class="metric-card">
      <h3>Latest Value</h3>
      <p class="metric-value">{latestVal}</p>
      <p class="metric-unit">{config.unit}</p>
    </div>
    <div class="metric-card">
      <h3>Peak Value</h3>
      <p class="metric-value">{peakVal}</p>
      <p class="metric-unit">{config.unit}</p>
    </div>
    <div class="metric-card">
      <h3>Period Average</h3>
      <p class="metric-value">{avgVal}</p>
      <p class="metric-unit">{config.unit}</p>
    </div>
  </div>
</div>

<style>
  .chart-loading-placeholder {
    height: 420px;
    border-radius: 4px;
    background: linear-gradient(90deg, var(--color-bg-alt, #f0f0f0) 25%, var(--color-bg-alt2, #e0e0e0) 50%, var(--color-bg-alt, #f0f0f0) 75%);
    background-size: 200% 100%;
    animation: shimmer 1.5s infinite;
    margin: 8px 0;
  }

  .chart-error-msg {
    height: 420px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--color-muted, #888);
    font-size: 0.85rem;
    border: 1px dashed var(--color-border, #ccc);
    border-radius: 4px;
  }

  @keyframes shimmer {
    0% { background-position: 200% 0; }
    100% { background-position: -200% 0; }
  }
</style>
