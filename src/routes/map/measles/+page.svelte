<script>
  import { format } from 'd3-format';
  import { Plot, Geo } from 'svelteplot';
  import { feature, mesh } from 'topojson-client';
  import { base } from '$app/paths';
  import { loadMeaslesByState } from '$lib/fetchData.js';
  import { MEASLES_BY_STATE_CSV_URL, SEQUENTIAL_SCHEME, NO_DATA_FILL } from '$lib/mapConfig.js';

  // State-only choropleth — NNDSS (the source for measles_by_state.csv) only
  // reports at state granularity, so unlike /map's PLACES data there's no
  // county level to toggle to. Kept as its own route rather than added to
  // /map's measure dropdown: that page's Geo/zoom/hover logic already has
  // several hard-won perf fixes documented inline, and this map has a
  // different color semantic (case counts, not a fixed-domain prevalence %)
  // — safer to keep it isolated than thread new conditionals through that
  // component.
  let stateFeatures = $state([]);
  let stateBorders = $state(null);
  let rowsByFips = $state(new Map());
  let asOf = $state(null); // { year, week } of the snapshot, from the data itself
  let loading = $state(true);
  let loadError = $state(null);

  $effect(() => {
    (async () => {
      try {
        const [rows, statesTopology] = await Promise.all([
          loadMeaslesByState(MEASLES_BY_STATE_CSV_URL),
          fetch(`${base}/topo/states-10m.json`).then(r => r.json())
        ]);
        stateFeatures = feature(statesTopology, statesTopology.objects.states).features;
        stateBorders = mesh(statesTopology, statesTopology.objects.states, (a, b) => a !== b);
        rowsByFips = new Map(rows.map(r => [r.fips, r]));
        // All rows share the same (year, week) — the fetcher pulls each
        // state's *latest* snapshot, and CDC reports every state on the
        // same weekly cadence.
        asOf = rows[0] ? { year: rows[0].year, week: rows[0].week } : null;
      } catch (e) {
        loadError = e.message ?? 'Failed to load';
      } finally {
        loading = false;
      }
    })();
  });

  const maxCases = $derived(Math.max(1, ...[...rowsByFips.values()].map(r => r.cases)));

  function valueOf(f) {
    return rowsByFips.get(f.id)?.cases ?? null;
  }

  function tooltipText(f) {
    const row = rowsByFips.get(f.id);
    const cases = row?.cases ?? 0;
    return `${f.properties.name}: ${cases.toLocaleString()} case${cases === 1 ? '' : 's'} this year`;
  }

  let hoveredId = $state(null);
  let pointer = $state({ x: 0, y: 0 });
  const featuresById = $derived.by(() => new Map(stateFeatures.map(f => [f.id, f])));
  const hoveredFeature = $derived(hoveredId ? featuresById.get(hoveredId) : null);

  function onHoverEnter(evt, datum) { hoveredId = datum.id; }
  function onHoverLeave() { hoveredId = null; }
  function onPointerMove(evt) { pointer = { x: evt.clientX, y: evt.clientY }; }
</script>

<svelte:head><title>Measles Cases by State · Health Charts</title></svelte:head>

<div class="series-main">
  <div class="series-header">
    <div>
      <h1>Measles Cases by State</h1>
      <p class="series-desc">
        Cumulative confirmed measles cases so far this year, by state, from CDC's National Notifiable
        Diseases Surveillance System (NNDSS). Combines imported and locally-acquired (indigenous) cases.
        See the <a href="{base}/series/measles-weekly">national weekly trend</a> and
        <a href="{base}/compare/measles-wastewater">wastewater comparison</a> for the time-series view.
      </p>
      <div class="meta-pills">
        <span class="meta-pill">{#if asOf}Week {asOf.week}, {asOf.year}{:else}Weekly{/if}</span>
        <span class="meta-pill"><a href="https://data.cdc.gov/d/x9gk-5huc" target="_blank" rel="noopener">Source: CDC NNDSS</a></span>
        <span class="meta-pill">Measles</span>
      </div>
    </div>
  </div>

  {#if loadError}
    <div class="chart-error-msg">Failed to load data: {loadError}</div>
  {:else if loading}
    <div class="chart-loading-placeholder" aria-busy="true"></div>
  {:else}
    <div
      class="chart-wrap map-wrap"
      role="figure"
      onpointermove={onPointerMove}
    >
      <Plot
        projection="albers-usa"
        color={{
          type: 'linear',
          scheme: SEQUENTIAL_SCHEME,
          domain: [0, maxCases],
          unknown: NO_DATA_FILL,
          legend: true,
          label: 'Cumulative cases this year'
        }}
        style="width:100%"
      >
        <Geo
          data={stateFeatures}
          fill={valueOf}
          title={tooltipText}
          onpointerenter={onHoverEnter}
          onpointerleave={onHoverLeave}
        />
        <Geo canvas data={[stateBorders]} fill="none" stroke="#1a1a2e" strokeOpacity={0.4} strokeWidth={1} />
      </Plot>
    </div>
  {/if}

  {#if hoveredFeature}
    <div
      class="tip-box"
      style="position:fixed; left:{pointer.x + 14}px; top:{pointer.y}px; transform:translateY(-50%); pointer-events:none"
    >
      <div class="tip-label">Measles cases</div>
      <div class="tip-val">{tooltipText(hoveredFeature)}</div>
    </div>
  {/if}

  <p class="chart-source">
    Source: <a href="https://data.cdc.gov/d/x9gk-5huc" target="_blank" rel="noopener">CDC NNDSS</a>
    · Boundaries: <a href="https://github.com/topojson/us-atlas" target="_blank" rel="noopener">us-atlas</a>
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

  .map-wrap {
    padding: 1rem;
  }

  .map-wrap :global(g.geo path) {
    cursor: pointer;
  }

  .map-wrap :global(foreignObject),
  .map-wrap :global(foreignObject canvas) {
    pointer-events: none;
  }

  .map-wrap :global(g.geo path:hover) {
    stroke: #1a1a2e !important;
    stroke-width: 1.75px !important;
  }
</style>
