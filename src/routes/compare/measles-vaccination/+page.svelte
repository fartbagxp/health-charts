<script>
  import { format } from 'd3-format';
  import { Plot, Line, AxisX, AxisY, RuleY, GridY, Dot } from 'svelteplot';
  import { base } from '$app/paths';
  import { loadSeries, loadSubSeries, indexToCommonBase } from '$lib/fetchData.js';
  import { SERIES_CONFIG } from '$lib/config.js';

  const MEASLES_COLOR = '#6a4c93';
  const MMR_COLOR = '#2a9d8f';

  let series = $state([]); // [{ label, unit, format, color, baseYear, rows }]
  let loading = $state(true);
  let loadError = $state(null);

  $effect(() => {
    (async () => {
      try {
        const measlesConfig = SERIES_CONFIG['measles-annual'];
        const schoolvaxConfig = SERIES_CONFIG['schoolvax'];

        const [measlesRows, schoolvaxSub] = await Promise.all([
          loadSeries(measlesConfig),
          loadSubSeries(schoolvaxConfig)
        ]);
        const mmr = schoolvaxSub.find(s => s.key === 'mmr');
        if (!mmr) throw new Error('MMR coverage sub-series not found in schoolvax config');

        // The 'mmr' sub-series filter (vaccine + geography_type only) matches
        // two rows per year in the raw CSV — a 'United States' row and a
        // 'U.S. Median' row, with slightly different values (e.g. 2024-25:
        // 92.5 vs 91.3) — so it needs a further geography pick here, or
        // indexing keys by year would silently pick whichever row happened
        // to sort last. 'United States' is the plain national total; 'U.S.
        // Median' is the median across states, a different statistic.
        const mmrRows = mmr.rows.filter(r => r.geography === 'United States');

        series = indexToCommonBase([
          {
            key: 'measles',
            label: measlesConfig.title,
            unit: measlesConfig.unit,
            format: measlesConfig.format,
            color: MEASLES_COLOR,
            valueKey: measlesConfig.valueKey,
            rows: measlesRows
          },
          {
            key: 'mmr',
            label: 'MMR Vaccination Coverage (Kindergarten)',
            unit: schoolvaxConfig.unit,
            format: schoolvaxConfig.format,
            color: MMR_COLOR,
            valueKey: schoolvaxConfig.valueKey,
            rows: mmrRows
          }
        ]);
      } catch (e) {
        loadError = e.message ?? 'Failed to load';
      } finally {
        loading = false;
      }
    })();
  });

  const baseYear = $derived(series[0]?.baseYear ?? null);

  // Union of years across both series — a hover target can land on a year
  // only one series has data for (their end years can differ by a year or
  // two depending on reporting lag).
  const allYears = $derived.by(() => {
    const years = new Set();
    for (const s of series) for (const r of s.rows) years.add(r.year);
    return [...years].sort((a, b) => a - b);
  });

  function rowFor(s, year) {
    return s.rows.find(r => r.year === year) ?? null;
  }

  let hoveredYear = $state(null);
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

    if (fraction < 0 || fraction > 1 || !allYears.length) { hoveredYear = null; return; }

    const t0 = allYears[0];
    const t1 = allYears[allYears.length - 1];
    const target = t0 + fraction * (t1 - t0);
    hoveredYear = allYears.reduce((best, y) => (Math.abs(y - target) < Math.abs(best - target) ? y : best));
    clientX = evt.clientX;
    clientY = evt.clientY;
    flipLeft = evt.clientX > window.innerWidth * 0.6;
  }

  function onChartLeave() {
    hoveredYear = null;
  }
</script>

<svelte:head><title>Measles Cases vs. MMR Vaccination Coverage — Health Charts</title></svelte:head>

<div class="series-main">
  <div class="series-header">
    <div>
      <h1>Measles Cases vs. MMR Vaccination Coverage</h1>
      <p class="series-desc">
        Annual U.S. measles cases against kindergarten MMR vaccination coverage, both indexed to
        {#if baseYear}100 at {baseYear}{:else}a common base year{/if} so two very differently-scaled
        measures (case counts vs. a percentage) can share one axis honestly — see
        <a href="{base}/series/measles-annual">measles cases</a> and
        <a href="{base}/series/schoolvax">vaccination coverage</a> for the real, unindexed series.
        Hover for the actual value and index at any year; a small coverage dip tends to line up with a
        disproportionately larger case increase, which is expected once coverage nears the herd-immunity
        threshold rather than a charting artifact.
      </p>
      <div class="meta-pills">
        <span class="meta-pill">Annual</span>
        <span class="meta-pill">Source: CDC Measles Surveillance / CDC SchoolVaxView</span>
        <span class="meta-pill">Measles</span>
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
      <Plot height={420} marginRight={MARGIN_RIGHT} marginLeft={MARGIN_LEFT} x={{ type: 'time' }} style="width:100%">
        <RuleY y={100} stroke="var(--fg-muted)" strokeOpacity={0.6} strokeDasharray="3,3" />
        <GridY strokeOpacity={0.2} />
        <AxisX tickSpacing={90} tickFormat={(d) => d instanceof Date ? String(d.getFullYear()) : String(d)} />
        <AxisY label="Index (base year = 100)" />
        {#each series as s}
          <Line data={s.rows} x="date" y="index" stroke={s.color} strokeWidth={2} />
        {/each}
        {#if hoveredYear != null}
          {#each series as s}
            {@const r = rowFor(s, hoveredYear)}
            {#if r}
              <Dot data={[r]} x="date" y="index" fill={s.color} r={4} />
            {/if}
          {/each}
        {/if}
        {#snippet overlay()}
          {#if hoveredYear != null}
            <div class="tip-box" style="position:fixed; {flipLeft ? `right:${window.innerWidth - clientX + 14}px` : `left:${clientX + 14}px`}; top:{clientY}px; transform:translateY(-50%); pointer-events:none">
              <div class="tip-date">{hoveredYear}</div>
              {#each series as s}
                {@const r = rowFor(s, hoveredYear)}
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
              <th>Year</th>
              {#each series as s}
                <th>{s.label} ({s.unit})</th>
                <th>{s.label} — index</th>
              {/each}
            </tr>
          </thead>
          <tbody>
            {#each allYears as year}
              <tr>
                <td>{year}</td>
                {#each series as s}
                  {@const r = rowFor(s, year)}
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
    Sources: <a href="https://www.cdc.gov/measles/data-research/index.html" target="_blank" rel="noopener">CDC Measles Surveillance</a>
    · <a href="https://data.cdc.gov/d/ijqb-a7ye" target="_blank" rel="noopener">CDC SchoolVaxView</a>
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
