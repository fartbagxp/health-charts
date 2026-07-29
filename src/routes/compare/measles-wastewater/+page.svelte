<script>
  import { format } from 'd3-format';
  import { Plot, Line, AxisX, AxisY, RuleX, RuleY, GridY, Dot } from 'svelteplot';
  import { base } from '$app/paths';
  import { loadSeries } from '$lib/fetchData.js';
  import { SERIES_CONFIG } from '$lib/config.js';

  const CASES_COLOR = '#6a4c93';
  const WASTEWATER_COLOR = '#2a9d8f';

  let casesRows = $state([]);
  let wasteRows = $state([]);
  let loading = $state(true);
  let loadError = $state(null);

  const casesConfig = SERIES_CONFIG['measles-weekly'];
  const wasteConfig = SERIES_CONFIG['wastewater-measles'];

  $effect(() => {
    (async () => {
      try {
        const [allCases, waste] = await Promise.all([loadSeries(casesConfig), loadSeries(wasteConfig)]);
        wasteRows = waste;
        // The wastewater signal only starts Dec 2024 — clip the (much
        // longer, back to 2022) case history to that same window so both
        // panels show the same time range. The full case history is still
        // on its own page (see the link below the chart).
        const wasteStart = waste[0]?.date;
        casesRows = wasteStart ? allCases.filter(d => d.date >= wasteStart) : allCases;
      } catch (e) {
        loadError = e.message ?? 'Failed to load';
      } finally {
        loading = false;
      }
    })();
  });

  // Indexing to a common base (as the measles/vaccination and COVID
  // comparison pages do) doesn't work for this pair: measles case counts
  // hit exactly 0 in several weeks over this window (the disease is
  // normally near-eliminated between outbreaks), and dividing by a
  // zero-valued base is undefined — the whole indexed line would go blank.
  // Two panels sharing one time axis (small multiples) is the other
  // dataviz-sanctioned alternative to a dual-axis chart, and it sidesteps
  // the zero-base problem entirely.
  const sharedDomain = $derived.by(() => {
    const allDates = [...casesRows, ...wasteRows].map(d => d.date.getTime());
    if (!allDates.length) return undefined;
    return [new Date(Math.min(...allDates)), new Date(Math.max(...allDates))];
  });

  const allWeeks = $derived.by(() => {
    const weeks = new Set();
    for (const r of casesRows) weeks.add(r.date.getTime());
    for (const r of wasteRows) weeks.add(r.date.getTime());
    return [...weeks].sort((a, b) => a - b);
  });

  function nearestRow(rows, ts) {
    if (!rows.length) return null;
    return rows.reduce((best, r) => (Math.abs(r.date.getTime() - ts) < Math.abs(best.date.getTime() - ts) ? r : best));
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
    return d instanceof Date ? d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : String(d);
  }

  const hoveredCase = $derived(hoveredWeek != null ? nearestRow(casesRows, hoveredWeek) : null);
  const hoveredWaste = $derived(hoveredWeek != null ? nearestRow(wasteRows, hoveredWeek) : null);
</script>

<svelte:head><title>Measles Cases vs. Wastewater Signal — Health Charts</title></svelte:head>

<div class="series-main">
  <div class="series-header">
    <div>
      <h1>Measles Cases vs. Wastewater Signal</h1>
      <p class="series-desc">
        Weekly confirmed measles cases against the national measles wastewater RNA signal, over the window
        both are available (Dec 2024–present) — testing whether wastewater surveillance is picking up
        measles activity the way it does for COVID/flu/RSV. Shown as two panels sharing one time axis
        rather than one indexed line: case counts hit zero in several weeks in this window, and a
        common-base index breaks when the base value is zero. See
        <a href="{base}/series/measles-weekly">the full case history</a> (back to 2022) and
        <a href="{base}/series/wastewater-measles">the full wastewater series</a>.
      </p>
      <div class="meta-pills">
        <span class="meta-pill">Weekly</span>
        <span class="meta-pill">Source: CDC Measles Surveillance / CDC NWSS</span>
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
      <span class="legend-item"><span class="legend-swatch" style="background:{WASTEWATER_COLOR}"></span>{wasteConfig.title}</span>
      <span class="legend-item"><span class="legend-swatch" style="background:{CASES_COLOR}"></span>{casesConfig.title}</span>
    </div>

    <div
      role="figure"
      class="chart-wrap small-multiples"
      style="position:relative"
      onpointermove={onChartMove}
      onpointerleave={onChartLeave}
    >
      <Plot height={180} marginRight={MARGIN_RIGHT} marginLeft={MARGIN_LEFT} x={{ type: 'time', domain: sharedDomain }} style="width:100%">
        <GridY strokeOpacity={0.2} />
        <AxisX tickSpacing={90} tickFormat={fmtWeek} />
        <AxisY label={wasteConfig.unit} tickFormat={(d) => format('.2s')(d)} />
        {#if hoveredWeek != null}<RuleX data={[new Date(hoveredWeek)]} x={(d) => d} stroke="var(--fg-muted)" strokeOpacity={0.6} strokeDasharray="3,3" />{/if}
        <Line data={wasteRows} x="date" y={wasteConfig.valueKey} stroke={WASTEWATER_COLOR} strokeWidth={2} />
        {#if hoveredWaste}<Dot data={[hoveredWaste]} x="date" y={wasteConfig.valueKey} fill={WASTEWATER_COLOR} r={4} />{/if}
      </Plot>

      <Plot height={180} marginRight={MARGIN_RIGHT} marginLeft={MARGIN_LEFT} x={{ type: 'time', domain: sharedDomain }} style="width:100%">
        <RuleY y={0} />
        <GridY strokeOpacity={0.2} />
        <AxisX tickSpacing={90} tickFormat={fmtWeek} />
        <AxisY label={casesConfig.unit} />
        {#if hoveredWeek != null}<RuleX data={[new Date(hoveredWeek)]} x={(d) => d} stroke="var(--fg-muted)" strokeOpacity={0.6} strokeDasharray="3,3" />{/if}
        <Line data={casesRows} x="date" y={casesConfig.valueKey} stroke={CASES_COLOR} strokeWidth={2} />
        {#if hoveredCase}<Dot data={[hoveredCase]} x="date" y={casesConfig.valueKey} fill={CASES_COLOR} r={4} />{/if}
      </Plot>

      {#if hoveredWeek != null}
        <div class="tip-box" style="position:fixed; {flipLeft ? `right:${window.innerWidth - clientX + 14}px` : `left:${clientX + 14}px`}; top:{clientY}px; transform:translateY(-50%); pointer-events:none">
          <div class="tip-date">{fmtWeek(new Date(hoveredWeek))}</div>
          <div class="tip-row">
            <span class="tip-swatch" style="background:{WASTEWATER_COLOR}"></span>
            <span class="tip-label">{wasteConfig.title}</span>
            <span class="tip-val">{hoveredWaste ? format(wasteConfig.format)(+hoveredWaste[wasteConfig.valueKey]) : 'No data'} <span style="font-size:0.72rem;opacity:0.7">{wasteConfig.unit}</span></span>
          </div>
          <div class="tip-row">
            <span class="tip-swatch" style="background:{CASES_COLOR}"></span>
            <span class="tip-label">{casesConfig.title}</span>
            <span class="tip-val">{hoveredCase ? format(casesConfig.format)(+hoveredCase[casesConfig.valueKey]) : 'No data'} <span style="font-size:0.72rem;opacity:0.7">{casesConfig.unit}</span></span>
          </div>
        </div>
      {/if}
    </div>
  {/if}

  <p class="chart-source">
    Sources: <a href="https://www.cdc.gov/measles/data-research/index.html" target="_blank" rel="noopener">CDC Measles Surveillance</a>
    · <a href="https://data.cdc.gov/d/akvg-8vrb" target="_blank" rel="noopener">CDC NWSS</a>
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

  .small-multiples {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }
</style>
