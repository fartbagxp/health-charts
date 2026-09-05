<script>
  import { format } from 'd3-format';
  import { feature, mesh } from 'topojson-client';
  import { base } from '$app/paths';
  import { replaceState } from '$app/navigation';
  import ChoroplethMap from '$lib/ChoroplethMap.svelte';
  import { loadPlacesMeasures, loadPlacesChoropleth, loadCountyProfile } from '$lib/fetchData.js';
  import {
    PLACES_CATEGORY_ORDER,
    PLACES_HIGHER_IS_BETTER,
    SEQUENTIAL_SCHEME,
    NO_DATA_FILL,
    STATE_FIPS_TO_ABBR
  } from '$lib/mapConfig.js';

  // Geometry is fetched at runtime from public/topo/ (see
  // scripts/prepare-map-topology.js) rather than statically imported from
  // us-atlas: a static import bundles the full ~1.3MB topology into this
  // route's JS chunk. As fetched JSON it loads in parallel with the PLACES
  // CSVs, off the JS-parse critical path, and caches independently of app code.
  let countyFeatures = $state([]);
  let stateFeatures = $state([]);
  let countyBorders = $state(null);
  let stateBorders = $state(null);

  // State loads first and is the default view: state topology is ~114KB vs.
  // county's ~842KB, and its feature()/mesh() is ~5ms vs. ~60ms. County
  // geometry is fetched lazily, only once the user switches to it.
  let level = $state('state');
  let measureId = $state('OBESITY');
  let valueType = $state('CrdPrv'); // 'CrdPrv' | 'AgeAdjPrv' — BRFSS only

  let measures = $state([]);
  let topoLoading = $state(true);
  let topoError = $state(null);

  let countyTopologyLoading = $state(false);
  let countyTopologyLoaded = $state(false);
  let countyTopologyError = $state(null);

  let layer = $state({ byFips: new Map(), domain: [0, 1] });
  let layerLoading = $state(true);
  let layerError = $state(null);
  let layerToken = 0;

  let selectedFips = $state(null);
  let profile = $state(null);
  let profileLoading = $state(false);
  let profileError = $state(null);
  let profileToken = 0;

  const measure = $derived(measures.find((m) => m.measureId === measureId));
  const family = $derived(measure?.categoryId === 'SDOH' ? 'acs' : 'brfss');
  const canAgeAdjust = $derived(family === 'brfss');
  const effectiveValueType = $derived(canAgeAdjust ? valueType : 'CrdPrv');
  const higherIsBetter = $derived(PLACES_HIGHER_IS_BETTER.has(measureId));

  const displayFeatures = $derived(level === 'county' ? countyFeatures : stateFeatures);
  const fmt = format('.1f');

  const measuresByCategory = $derived.by(() => {
    const byCat = new Map();
    for (const m of measures) {
      if (!byCat.has(m.categoryId)) byCat.set(m.categoryId, { label: m.category, items: [] });
      byCat.get(m.categoryId).items.push(m);
    }
    return PLACES_CATEGORY_ORDER.filter((id) => byCat.has(id)).map((id) => ({
      id,
      label: byCat.get(id).label,
      items: byCat.get(id).items
    }));
  });

  const colorScale = $derived({
    type: 'linear',
    scheme: higherIsBetter ? [...SEQUENTIAL_SCHEME].reverse() : SEQUENTIAL_SCHEME,
    domain: layer.domain,
    unknown: NO_DATA_FILL,
    label:
      `${measure?.question ?? measure?.label ?? ''}` +
      (effectiveValueType === 'AgeAdjPrv' ? ', age-adjusted' : '') +
      ` (${measure?.unit ?? '%'})`
  });

  // --- initial load: measure catalog + state topology, then apply URL params ---
  $effect(() => {
    (async () => {
      try {
        const [cat, statesTopology] = await Promise.all([
          loadPlacesMeasures(),
          fetch(`${base}/topo/states-10m.json`).then((r) => r.json())
        ]);
        measures = cat;
        stateFeatures = feature(statesTopology, statesTopology.objects.states).features;
        stateBorders = mesh(statesTopology, statesTopology.objects.states, (a, b) => a !== b);

        const params = new URLSearchParams(location.search);
        const m = params.get('measure');
        if (m && cat.some((c) => c.measureId === m)) measureId = m;
        if (params.get('type') === 'AgeAdjPrv') valueType = 'AgeAdjPrv';
        const c = params.get('county');
        if (c) selectedFips = c;
        // A shared drill-down link implies the county view.
        if (params.get('level') === 'county' || c) level = 'county';
      } catch (e) {
        topoError = e.message ?? 'Failed to load';
      } finally {
        topoLoading = false;
      }
    })();
  });

  async function ensureCountyTopologyLoaded() {
    if (countyTopologyLoaded || countyTopologyLoading) return;
    countyTopologyLoading = true;
    try {
      const t = await fetch(`${base}/topo/counties-10m.json`).then((r) => r.json());
      countyFeatures = feature(t, t.objects.counties).features;
      countyBorders = mesh(t, t.objects.counties, (a, b) => a !== b);
      countyTopologyLoaded = true;
    } catch (e) {
      countyTopologyError = e.message ?? 'Failed to load county boundaries';
    } finally {
      countyTopologyLoading = false;
    }
  }

  // Triggers only when the user actually switches to County.
  $effect(() => {
    if (level === 'county') ensureCountyTopologyLoaded();
  });

  // --- choropleth layer: reload whenever measure / level / value-type change ---
  $effect(() => {
    if (!measure) return;
    const fam = family;
    const lvl = level;
    const vt = effectiveValueType;
    const mid = measureId;
    if (lvl === 'county' && !countyTopologyLoaded) return; // wait for geometry
    const token = ++layerToken;
    layerLoading = true;
    layerError = null;
    loadPlacesChoropleth({ measureId: mid, family: fam, level: lvl, valueType: vt })
      .then((res) => {
        if (token === layerToken) layer = res;
      })
      .catch((e) => {
        if (token === layerToken) layerError = e.message ?? 'Failed to load';
      })
      .finally(() => {
        if (token === layerToken) layerLoading = false;
      });
  });

  // --- county drill-down profile ---
  $effect(() => {
    const fips = selectedFips;
    if (!fips) {
      profile = null;
      return;
    }
    const token = ++profileToken;
    profileLoading = true;
    profileError = null;
    loadCountyProfile(fips)
      .then((res) => {
        if (token === profileToken) profile = res;
      })
      .catch((e) => {
        if (token === profileToken) profileError = e.message ?? 'Failed to load';
      })
      .finally(() => {
        if (token === profileToken) profileLoading = false;
      });
  });

  // --- keep the URL shareable ---
  $effect(() => {
    if (topoLoading) return;
    const url = new URL(location.href);
    const set = (k, v) => (v ? url.searchParams.set(k, v) : url.searchParams.delete(k));
    set('measure', measureId === 'OBESITY' ? null : measureId);
    set('level', level === 'county' ? 'county' : null);
    set('type', effectiveValueType === 'AgeAdjPrv' ? 'AgeAdjPrv' : null);
    set('county', selectedFips);
    replaceState(url, {});
  });

  function valueOf(f) {
    return layer.byFips.get(f.id)?.value ?? null;
  }

  function tooltipText(f) {
    const row = layer.byFips.get(f.id);
    const place =
      level === 'county'
        ? `${f.properties.name}, ${STATE_FIPS_TO_ABBR[f.id.slice(0, 2)] ?? ''}`
        : f.properties.name;
    const val = row?.value != null ? `${fmt(row.value)}${measure?.unit ?? '%'}` : 'No data';
    return `${place}: ${val}`;
  }

  function handleSelect(f) {
    if (level !== 'county') return;
    selectedFips = f.id;
  }

  function closePanel() {
    selectedFips = null;
  }

  const isCT = $derived(!!selectedFips && selectedFips.slice(0, 2) === '09');
  const selectedLabel = $derived.by(() => {
    if (!selectedFips) return '';
    const f = countyFeatures.find((x) => x.id === selectedFips);
    return f
      ? `${f.properties.name}, ${STATE_FIPS_TO_ABBR[selectedFips.slice(0, 2)] ?? ''}`
      : selectedFips;
  });
</script>

<svelte:head><title>PLACES Health Map · Health Charts</title></svelte:head>

<div class="series-main">
  <div class="series-header">
    <div>
      <h1>PLACES Health Map</h1>
      <p class="series-desc">
        {measure?.question ?? 'County- and state-level health estimates for U.S. adults'} — one of
        {measures.length || 49} measures across all seven pages of CDC's PLACES portal
        (BRFSS-modeled small-area estimates, plus American Community Survey non-medical factors).
        {#if level === 'county'}Click a county for its full profile.{/if}
      </p>
      <div class="meta-pills">
        <span class="meta-pill">Annual</span>
        <span class="meta-pill">{measure?.source ?? 'BRFSS'}</span>
        <span class="meta-pill"
          ><a href="https://www.cdc.gov/places/index.html" target="_blank" rel="noopener"
            >Source: CDC PLACES</a
          ></span
        >
      </div>
    </div>
  </div>

  <div class="map-controls">
    <label class="map-control">
      <span>Measure</span>
      <select bind:value={measureId}>
        {#each measuresByCategory as cat}
          <optgroup label={cat.label}>
            {#each cat.items as m}
              <option value={m.measureId}>{m.label}</option>
            {/each}
          </optgroup>
        {/each}
      </select>
    </label>

    <div class="map-control">
      <span>Geography</span>
      <div class="seg">
        <button class:active={level === 'state'} onclick={() => (level = 'state')}>State</button>
        <button class:active={level === 'county'} onclick={() => (level = 'county')}>County</button>
      </div>
    </div>

    <div class="map-control" class:disabled={!canAgeAdjust}>
      <span>Prevalence</span>
      <div class="seg">
        <button
          class:active={effectiveValueType === 'CrdPrv'}
          onclick={() => (valueType = 'CrdPrv')}>Crude</button
        >
        <button
          class:active={effectiveValueType === 'AgeAdjPrv'}
          disabled={!canAgeAdjust}
          onclick={() => (valueType = 'AgeAdjPrv')}>Age-adjusted</button
        >
      </div>
    </div>
  </div>

  <ChoroplethMap
    features={displayFeatures}
    countyBorders={level === 'county' ? countyBorders : null}
    {stateBorders}
    {valueOf}
    tooltip={tooltipText}
    tipLabel={measure?.label ?? ''}
    color={colorScale}
    loading={topoLoading || layerLoading || (level === 'county' && !countyTopologyLoaded)}
    error={topoError || layerError || (level === 'county' ? countyTopologyError : null)}
    onselect={level === 'county' ? handleSelect : null}
  />

  <p class="chart-source">
    Source:
    <a href="https://www.cdc.gov/places/index.html" target="_blank" rel="noopener">CDC PLACES</a>
    ·
    <a href="https://data.cdc.gov/browse?q=PLACES" target="_blank" rel="noopener">data.cdc.gov</a>
    · County drill-down via the community
    <a href="https://www.dolthub.com/repositories/fartbagxp/cdc-places" target="_blank" rel="noopener"
      >fartbagxp/cdc-places</a
    > Dolt mirror (not CDC) · Boundaries:
    <a href="https://github.com/topojson/us-atlas" target="_blank" rel="noopener">us-atlas</a>
  </p>
</div>

{#if selectedFips}
  <div class="panel-backdrop" role="presentation" onclick={closePanel}></div>
  <aside class="county-panel" aria-label="County profile">
    <div class="panel-top">
      <div>
        <div class="panel-eyebrow">County profile</div>
        <h2>{selectedLabel}</h2>
      </div>
      <button class="panel-close" onclick={closePanel} aria-label="Close">✕</button>
    </div>

    {#if profileError}
      <p class="panel-msg">Couldn't load this county: {profileError}</p>
    {:else if profileLoading || !profile}
      <p class="panel-msg" aria-busy="true">Loading…</p>
    {:else}
      {#if isCT}
        <p class="panel-note">
          Connecticut switched to planning-region geography in PLACES 2025, so only the
          American Community Survey measures resolve for the retired county FIPS.
        </p>
      {/if}
      {#each measuresByCategory as cat}
        {@const rows = cat.items.filter((m) => profile.has(m.measureId))}
        {#if rows.length}
          <div class="panel-cat">{cat.label}</div>
          {#each rows as m}
            {@const r = profile.get(m.measureId)}
            <div class="pm" class:current={m.measureId === measureId}>
              <div class="pm-row">
                <span class="pm-label">{m.label}</span>
                <span class="pm-val"
                  >{fmt(r.value)}{m.unit}{#if r.moe != null}<span class="pm-ci"> ±{fmt(r.moe)}</span
                    >{:else if r.low != null && r.high != null}<span class="pm-ci">
                      {fmt(r.low)}–{fmt(r.high)}</span
                    >{/if}</span
                >
              </div>
              <div class="pm-bar"><span style="width:{Math.min(100, r.value)}%"></span></div>
            </div>
          {/each}
        {/if}
      {/each}
    {/if}
  </aside>
{/if}

<style>
  .map-controls {
    display: flex;
    gap: 1.5rem;
    align-items: flex-end;
    flex-wrap: wrap;
    margin-bottom: 1rem;
  }

  .map-control {
    display: flex;
    flex-direction: column;
    gap: 0.3rem;
    font-size: 0.78rem;
    color: var(--fg-mid);
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  .map-control.disabled {
    opacity: 0.5;
  }

  .map-control select {
    padding: 0.45rem 0.75rem;
    border: 1px solid var(--border);
    border-radius: 4px;
    background: var(--bg-card);
    color: var(--fg);
    font-size: 0.9rem;
    font-weight: 400;
    text-transform: none;
    letter-spacing: normal;
    min-width: 260px;
  }

  .seg {
    display: flex;
    border: 1px solid var(--border);
    border-radius: 4px;
    overflow: hidden;
    width: fit-content;
  }

  .seg button {
    padding: 0.45rem 1rem;
    border: none;
    background: var(--bg-card);
    color: var(--fg-mid);
    font-size: 0.9rem;
    font-weight: 500;
    text-transform: none;
    letter-spacing: normal;
    cursor: pointer;
  }

  .seg button + button {
    border-left: 1px solid var(--border);
  }
  .seg button.active {
    background: #1a1a2e;
    color: #fff;
  }
  .seg button:disabled {
    opacity: 0.4;
    cursor: default;
  }

  .panel-backdrop {
    position: fixed;
    inset: 0;
    background: rgba(10, 10, 20, 0.28);
    z-index: 300;
  }

  .county-panel {
    position: fixed;
    top: 0;
    right: 0;
    bottom: 0;
    width: min(420px, 92vw);
    background: var(--bg-card);
    border-left: 1px solid var(--border);
    box-shadow: -8px 0 24px rgba(0, 0, 0, 0.12);
    z-index: 301;
    overflow-y: auto;
    padding: 1.25rem 1.4rem 2rem;
  }

  .panel-top {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: 1rem;
    margin-bottom: 1rem;
  }

  .panel-eyebrow {
    font-size: 0.7rem;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    color: var(--fg-muted);
    font-weight: 700;
  }

  .county-panel h2 {
    font-size: 1.15rem;
    font-weight: 700;
    color: var(--fg);
  }

  .panel-close {
    border: 1px solid var(--border);
    background: var(--bg);
    color: var(--fg-mid);
    border-radius: 4px;
    padding: 0.25rem 0.5rem;
    cursor: pointer;
    font-size: 0.85rem;
  }

  .panel-msg,
  .panel-note {
    color: var(--fg-mid);
    font-size: 0.85rem;
  }

  .panel-note {
    background: var(--bg);
    border: 1px solid var(--border);
    border-radius: 4px;
    padding: 0.5rem 0.7rem;
    margin-bottom: 0.85rem;
  }

  .panel-cat {
    font-size: 0.72rem;
    text-transform: uppercase;
    letter-spacing: 0.06em;
    color: var(--fg-muted);
    font-weight: 700;
    margin: 1rem 0 0.4rem;
  }

  .pm {
    padding: 0.35rem 0.4rem;
    border-radius: 4px;
  }

  .pm.current {
    background: color-mix(in srgb, var(--link) 12%, transparent);
  }

  .pm-row {
    display: flex;
    justify-content: space-between;
    align-items: baseline;
    gap: 0.75rem;
    font-size: 0.85rem;
  }

  .pm-label {
    color: var(--fg-mid);
  }

  .pm-val {
    font-weight: 700;
    color: var(--fg);
    white-space: nowrap;
  }

  .pm-ci {
    font-weight: 400;
    font-size: 0.75rem;
    color: var(--fg-muted);
  }

  .pm-bar {
    margin-top: 0.3rem;
    height: 5px;
    border-radius: 3px;
    background: var(--border);
    overflow: hidden;
  }

  .pm-bar span {
    display: block;
    height: 100%;
    background: var(--link);
  }

  @media (max-width: 640px) {
    .map-control select {
      min-width: 0;
      width: 100%;
    }
  }
</style>
