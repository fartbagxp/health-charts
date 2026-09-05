<script>
  import { feature, mesh } from 'topojson-client';
  import { base } from '$app/paths';
  import ChoroplethMap from '$lib/ChoroplethMap.svelte';
  import { loadMeaslesByState } from '$lib/fetchData.js';
  import { MEASLES_BY_STATE_CSV_URL, SEQUENTIAL_SCHEME, NO_DATA_FILL } from '$lib/mapConfig.js';

  // State-only choropleth — NNDSS (the source for measles_by_state.csv) only
  // reports at state granularity, so unlike /map's PLACES data there's no
  // county level to toggle to. Shares the map chrome via ChoroplethMap; the
  // colour semantic here is a data-derived case count, not a fixed prevalence.
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
          fetch(`${base}/topo/states-10m.json`).then((r) => r.json())
        ]);
        stateFeatures = feature(statesTopology, statesTopology.objects.states).features;
        stateBorders = mesh(statesTopology, statesTopology.objects.states, (a, b) => a !== b);
        rowsByFips = new Map(rows.map((r) => [r.fips, r]));
        // All rows share the same (year, week) — the fetcher pulls each state's
        // latest snapshot and CDC reports every state on the same cadence.
        asOf = rows[0] ? { year: rows[0].year, week: rows[0].week } : null;
      } catch (e) {
        loadError = e.message ?? 'Failed to load';
      } finally {
        loading = false;
      }
    })();
  });

  const maxCases = $derived(Math.max(1, ...[...rowsByFips.values()].map((r) => r.cases)));

  function valueOf(f) {
    return rowsByFips.get(f.id)?.cases ?? null;
  }

  function tooltipText(f) {
    const cases = rowsByFips.get(f.id)?.cases ?? 0;
    return `${f.properties.name}: ${cases.toLocaleString()} case${cases === 1 ? '' : 's'} this year`;
  }
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

  <ChoroplethMap
    features={stateFeatures}
    {stateBorders}
    {valueOf}
    tooltip={tooltipText}
    tipLabel="Measles cases"
    zoomable={false}
    {loading}
    error={loadError}
    color={{
      type: 'linear',
      scheme: SEQUENTIAL_SCHEME,
      domain: [0, maxCases],
      unknown: NO_DATA_FILL,
      label: 'Cumulative cases this year'
    }}
  />

  <p class="chart-source">
    Source: <a href="https://data.cdc.gov/d/x9gk-5huc" target="_blank" rel="noopener">CDC NNDSS</a>
    · Boundaries: <a href="https://github.com/topojson/us-atlas" target="_blank" rel="noopener">us-atlas</a>
  </p>
</div>
