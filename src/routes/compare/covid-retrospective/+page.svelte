<script>
  import { format } from 'd3-format';
  import { Plot, Line, AxisX, AxisY, RuleX, RuleY, GridY, Dot, Text } from 'svelteplot';
  import { base } from '$app/paths';
  import { loadSeries, indexToCommonBase, WEEKLY_BUCKET } from '$lib/fetchData.js';
  import { SERIES_CONFIG } from '$lib/config.js';

  const HOSP_COLOR = '#e63946';
  const WASTEWATER_COLOR = '#1a6faf';

  // Pandemic milestones. Kept out of config.js's per-series `annotations`
  // field (that field is for a single chart's own timeline) since this page
  // overlays two series and the milestones apply to the shared comparison,
  // not to either series individually.
  const ANNOTATIONS = [
    { date: '2020-03-11', label: 'WHO declares pandemic' },
    { date: '2020-12-14', label: 'First US vaccine doses' },
    { date: '2021-12-01', label: 'Omicron detected in US' },
    { date: '2023-05-11', label: 'US Public Health Emergency ends' }
  ];
  const annotationRows = ANNOTATIONS.map(a => ({ date: new Date(a.date), label: a.label }));

  let series = $state([]);
  let loading = $state(true);
  let loadError = $state(null);

  $effect(() => {
    (async () => {
      try {
        const hospConfig = SERIES_CONFIG['covid'];
        const wasteConfig = SERIES_CONFIG['wastewater-covid'];

        const [hospRows, wasteRows] = await Promise.all([
          loadSeries(hospConfig),
          loadSeries(wasteConfig)
        ]);

        series = indexToCommonBase(
          [
            {
              key: 'hosp',
              label: hospConfig.title,
              unit: hospConfig.unit,
              format: hospConfig.format,
              color: HOSP_COLOR,
              valueKey: hospConfig.valueKey,
              rows: hospRows
            },
            {
              key: 'wastewater',
              label: wasteConfig.title,
              unit: wasteConfig.unit,
              format: wasteConfig.format,
              color: WASTEWATER_COLOR,
              valueKey: wasteConfig.valueKey,
              rows: wasteRows
            }
          ],
          WEEKLY_BUCKET
        );
      } catch (e) {
        loadError = e.message ?? 'Failed to load';
      } finally {
        loading = false;
      }
    })();
  });

  const baseDate = $derived(series[0] ? new Date(series[0].baseYear) : null);

  const allWeeks = $derived.by(() => {
    const weeks = new Set();
    for (const s of series) for (const r of s.rows) weeks.add(r.year);
    return [...weeks].sort((a, b) => a - b);
  });

  function rowFor(s, week) {
    return s.rows.find(r => r.year === week) ?? null;
  }

  let hoveredWeek = $state(null);
  let clientX = $state(0);
  let clientY = $state(0);
  let flipLeft = $state(false);

  const MARGIN_LEFT = 48;
  const MARGIN_RIGHT = 40;

  function onChartMove(evt) {
    const rect = evt.currentTarget.getBoundingClientRect();
    const mx = evt.clientX - rect.left;
    const innerWidth = rect.width - MARGIN_LEFT - MARGIN_RIGHT;
    const fraction = (mx - MARGIN_LEFT) / innerWidth;

    if (fraction < 0 || fraction > 1 || !allWeeks.length) { hoveredWeek = null; return; }

    const t0 = allWeeks[0];
    const t1 = allWeeks[allWeeks.length - 1];
    const target = t0 + fraction * (t1 - t0);
    hoveredWeek = allWeeks.reduce((best, w) => (Math.abs(w - target) < Math.abs(best - target) ? w : best));
    clientX = evt.clientX;
    clientY = evt.clientY;
    flipLeft = evt.clientX > window.innerWidth * 0.6;
  }

  function onChartLeave() {
    hoveredWeek = null;
  }

  function fmtWeek(d) {
    return d instanceof Date ? d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : String(d);
  }
</script>

<svelte:head><title>COVID-19: Hospitalizations vs. Wastewater Signal · Health Charts</title></svelte:head>

<div class="series-main">
  <div class="series-header">
    <div>
      <h1>COVID-19: Hospitalizations vs. Wastewater Signal</h1>
      <p class="series-desc">
        Weekly COVID-19 hospital admissions against the national wastewater RNA signal, both indexed to
        {#if baseDate}100 at the week of {fmtWeek(baseDate)}{:else}a common base week{/if} so two
        differently-scaled measures share one axis honestly. See
        <a href="{base}/series/covid">hospitalizations</a> and
        <a href="{base}/series/wastewater-covid">the wastewater signal</a> for the real, unindexed series.
        Dashed lines mark four points in the pandemic timeline. Hospitalization reporting for this series
        ends April 2024; the wastewater signal runs through the present.
      </p>
      <div class="meta-pills">
        <span class="meta-pill">Weekly</span>
        <span class="meta-pill">Source: CDC COVID-NET / CDC NWSS</span>
        <span class="meta-pill">COVID-19</span>
      </div>
    </div>
  </div>

  {#if loadError}
    <div class="chart-error-msg">Failed to load data: {loadError}</div>
  {:else if loading}
    <div class="chart-loading-placeholder" aria-busy="true"></div>
  {:else}
    <div class="chart-legend">
      {#each series as s}
        <span class="legend-item">
          <span class="legend-swatch" style="background:{s.color}"></span>
          {s.label}
        </span>
      {/each}
    </div>

    <div
      role="figure"
      class="chart-wrap"
      style="position:relative"
      onpointermove={onChartMove}
      onpointerleave={onChartLeave}
    >
      <Plot height={420} marginTop={20} marginRight={MARGIN_RIGHT} marginLeft={MARGIN_LEFT} x={{ type: 'time' }} style="width:100%">
        <RuleY y={100} stroke="var(--fg-muted)" strokeOpacity={0.6} strokeDasharray="3,3" />
        <GridY strokeOpacity={0.2} />
        <AxisX tickSpacing={90} tickFormat={fmtWeek} />
        <AxisY label="Index (base week = 100)" />
        <RuleX data={annotationRows} x={(d) => d.date} stroke="var(--fg-muted)" strokeOpacity={0.5} strokeDasharray="3,3" />
        <Text
          data={annotationRows}
          x={(d) => d.date}
          text={(d) => d.label}
          frameAnchor="top"
          dy={-6}
          dx={(d) => (d.label === 'Omicron detected in US' ? 40 : 4)}
          fontSize={10}
          fill="var(--fg-muted)"
          textAnchor="start"
        />
        {#each series as s}
          <Line data={s.rows} x="date" y="index" stroke={s.color} strokeWidth={2} />
        {/each}
        {#if hoveredWeek != null}
          {#each series as s}
            {@const r = rowFor(s, hoveredWeek)}
            {#if r}
              <Dot data={[r]} x="date" y="index" fill={s.color} r={4} />
            {/if}
          {/each}
        {/if}
        {#snippet overlay()}
          {#if hoveredWeek != null}
            <div class="tip-box" style="position:fixed; {flipLeft ? `right:${window.innerWidth - clientX + 14}px` : `left:${clientX + 14}px`}; top:{clientY}px; transform:translateY(-50%); pointer-events:none">
              <div class="tip-date">{fmtWeek(new Date(hoveredWeek))}</div>
              {#each series as s}
                {@const r = rowFor(s, hoveredWeek)}
                <div class="tip-row">
                  <span class="tip-swatch" style="background:{s.color}"></span>
                  <span class="tip-label">{s.label}</span>
                  <span class="tip-val">
                    {r ? format(s.format)(r.value) : 'No data'} <span style="font-size:0.72rem;opacity:0.7">{s.unit}</span>
                  </span>
                </div>
              {/each}
            </div>
          {/if}
        {/snippet}
      </Plot>
    </div>

    <details class="table-view">
      <summary>Table view</summary>
      <div class="table-scroll">
        <table>
          <thead>
            <tr>
              <th>Week</th>
              {#each series as s}
                <th>{s.label} ({s.unit})</th>
                <th>{s.label} (index)</th>
              {/each}
            </tr>
          </thead>
          <tbody>
            {#each allWeeks as week}
              <tr>
                <td>{fmtWeek(new Date(week))}</td>
                {#each series as s}
                  {@const r = rowFor(s, week)}
                  <td>{r ? format(s.format)(r.value) : '—'}</td>
                  <td>{r ? r.index.toFixed(1) : '—'}</td>
                {/each}
              </tr>
            {/each}
          </tbody>
        </table>
      </div>
    </details>
  {/if}

  <p class="chart-source">
    Sources: <a href="https://data.cdc.gov/d/7dk4-g6vg" target="_blank" rel="noopener">CDC COVID-NET</a>
    · <a href="https://data.cdc.gov/d/j9g8-acpt" target="_blank" rel="noopener">CDC NWSS</a>
  </p>
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

  .table-view {
    margin: 1.5rem 0;
    font-size: 0.875rem;
  }

  .table-view summary {
    cursor: pointer;
    font-weight: 600;
    color: var(--fg-mid);
    margin-bottom: 0.5rem;
  }

  .table-scroll {
    overflow-x: auto;
  }

  table {
    border-collapse: collapse;
    width: 100%;
    min-width: 480px;
  }

  th, td {
    text-align: right;
    padding: 0.35rem 0.6rem;
    border-bottom: 1px solid var(--border);
    font-variant-numeric: tabular-nums;
    white-space: nowrap;
  }

  th:first-child, td:first-child {
    text-align: left;
  }

  th {
    color: var(--fg-mid);
    font-weight: 600;
    font-size: 0.8rem;
  }
</style>
