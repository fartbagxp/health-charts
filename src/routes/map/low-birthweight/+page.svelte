<script>
  import { format } from 'd3-format';
  import { feature, mesh } from 'topojson-client';
  import { base } from '$app/paths';
  import ChoroplethMap from '$lib/ChoroplethMap.svelte';
  import { loadLowBirthweightByState } from '$lib/fetchData.js';
  import { LOW_BIRTHWEIGHT_BY_STATE_CSV_URL, SEQUENTIAL_SCHEME, NO_DATA_FILL } from '$lib/mapConfig.js';

  // State-only choropleth — the NCHS DQS "low birthweight by state" table
  // reports at state granularity only, so (like /map/measles) there's no county
  // level to toggle to. Shares the map chrome via ChoroplethMap; the colour
  // domain is derived from this data's own min/max, not a fixed prevalence.
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
          fetch(`${base}/topo/states-10m.json`).then((r) => r.json())
        ]);
        stateFeatures = feature(statesTopology, statesTopology.objects.states).features;
        stateBorders = mesh(statesTopology, statesTopology.objects.states, (a, b) => a !== b);
        rowsByFips = new Map(rows.map((r) => [r.fips, r]));
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
  const values = $derived([...rowsByFips.values()].map((r) => r.pct).filter((v) => !isNaN(v)));
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

  <ChoroplethMap
    features={stateFeatures}
    {stateBorders}
    {valueOf}
    tooltip={tooltipText}
    tipLabel="Low birthweight"
    zoomable={false}
    {loading}
    error={loadError}
    color={{
      type: 'linear',
      scheme: SEQUENTIAL_SCHEME,
      domain,
      unknown: NO_DATA_FILL,
      label: 'Low birthweight (% of live births)'
    }}
  />

  <p class="chart-source">
    Source: <a href="https://data.cdc.gov/d/ga7k-kycn" target="_blank" rel="noopener">NCHS DQS (NVSS)</a>
    · Boundaries: <a href="https://github.com/topojson/us-atlas" target="_blank" rel="noopener">us-atlas</a>
  </p>
</div>
