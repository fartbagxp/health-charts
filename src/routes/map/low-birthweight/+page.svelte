<script>
  import { format } from 'd3-format';
  import { Plot, Geo } from 'svelteplot';
  import { feature, mesh } from 'topojson-client';
  import { base } from '$app/paths';
  import { loadLowBirthweightByState } from '$lib/fetchData.js';
  import { LOW_BIRTHWEIGHT_BY_STATE_CSV_URL, SEQUENTIAL_SCHEME, NO_DATA_FILL } from '$lib/mapConfig.js';

  // State-only choropleth — the NCHS DQS "low birthweight by state" table
  // reports at state granularity only, so (like /map/measles) there's no county
  // level to toggle to. Kept as its own route rather than folded into /map's
  // PLACES measure dropdown: the color semantic here is a fixed-domain
  // prevalence % derived from this data's own min/max, not PLACES' hardcoded
  // per-measure domains.
  let stateFeatures = $state([]);
  let stateBorders = $state(null);
  let rowsByFips = $state(new Map());
  let year = $state(null);
  let loading = $state(true);
  let loadError = $state(null);

  $effect(() => {
    (async () => {
      try {
        const [rows, statesTopology] = await Promise.all([
          loadLowBirthweightByState(LOW_BIRTHWEIGHT_BY_STATE_CSV_URL),
          fetch(`${base}/topo/states-10m.json`).then(r => r.json())
        ]);
        stateFeatures = feature(statesTopology, statesTopology.objects.states).features;
        stateBorders = mesh(statesTopology, statesTopology.objects.states, (a, b) => a !== b);
        rowsByFips = new Map(rows.map(r => [r.fips, r]));
        year = rows[0]?.year ?? null;
      } catch (e) {
        loadError = e.message ?? 'Failed to load';
      } finally {
        loading = false;
      }
    })();
  });

  // Domain from the data's own spread (floored/ceiled to whole percents) so the
  // ramp uses its full range rather than starting at zero.
  const values = $derived([...rowsByFips.values()].map(r => r.pct).filter(v => !isNaN(v)));
  const domain = $derived(
    values.length ? [Math.floor(Math.min(...values)), Math.ceil(Math.max(...values))] : [0, 1]
  );

  const pct = format('.1f');

  function valueOf(f) {
    return rowsByFips.get(f.id)?.pct ?? null;
  }

  function tooltipText(f) {
    const row = rowsByFips.get(f.id);
    if (!row || isNaN(row.pct)) return `${f.properties.name}: no data`;
    return `${f.properties.name}: ${pct(row.pct)}% of live births`;
  }

  let hoveredId = $state(null);
  let pointer = $state({ x: 0, y: 0 });
  const featuresById = $derived.by(() => new Map(stateFeatures.map(f => [f.id, f])));
  const hoveredFeature = $derived(hoveredId ? featuresById.get(hoveredId) : null);

  function onHoverEnter(evt, datum) { hoveredId = datum.id; }
  function onHoverLeave() { hoveredId = null; }
  function onPointerMove(evt) { pointer = { x: evt.clientX, y: evt.clientY }; }
</script>

<svelte:head><title>Low Birthweight by State · Health Charts</title></svelte:head>

<div class="series-main">
  <div class="series-header">
    <div>
      <h1>Low Birthweight by State</h1>
      <p class="series-desc">
        Percent of live births classified as low birthweight (under 2,500 grams), by state, from CDC's
        National Vital Statistics System via the NCHS Data Query System. Higher percentages indicate a
        greater share of newborns at elevated health risk.
        See <a href="{base}/series/health-spending-per-capita">U.S. health spending</a> and the other
        NCHS DQS series for the national time-series view.
      </p>
      <div class="meta-pills">
        <span class="meta-pill">{#if year}{year}{:else}Annual{/if}</span>
        <span class="meta-pill"><a href="https://data.cdc.gov/d/ga7k-kycn" target="_blank" rel="noopener">Source: NCHS DQS (NVSS)</a></span>
        <span class="meta-pill">Birth & Mortality</span>
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
          domain,
          unknown: NO_DATA_FILL,
          legend: true,
          label: 'Low birthweight (% of live births)'
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
      <div class="tip-label">Low birthweight</div>
      <div class="tip-val">{tooltipText(hoveredFeature)}</div>
    </div>
  {/if}

  <p class="chart-source">
    Source: <a href="https://data.cdc.gov/d/ga7k-kycn" target="_blank" rel="noopener">NCHS DQS (NVSS)</a>
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
