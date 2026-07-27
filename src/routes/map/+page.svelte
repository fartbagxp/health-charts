<script>
  import { format } from 'd3-format';
  import { Plot, Geo } from 'svelteplot';
  import { feature, mesh } from 'topojson-client';
  import countiesTopology from 'us-atlas/counties-10m.json';
  import statesTopology from 'us-atlas/states-10m.json';
  import { loadPlacesCounty } from '$lib/fetchData.js';
  import {
    PLACES_COUNTY_CSV_URL,
    PLACES_MEASURES,
    PLACES_MEASURE_LIST,
    SEQUENTIAL_SCHEME,
    NO_DATA_FILL,
    STATE_FIPS_TO_ABBR
  } from '$lib/mapConfig.js';

  // Static geometry — computed once, independent of any reactive state.
  //
  // Borders are drawn as a single stitched mesh line, not as each polygon's own
  // stroke. Adjacent county/state polygons are rendered as independent <path>
  // elements, and even though they share the same topojson arc, each one's `d`
  // is computed separately by geoPath — sub-pixel rounding differences at the
  // shared edge mean one polygon's fill can sliver over its neighbor's stroke,
  // making that shared border vanish. topojson.mesh() dedupes shared arcs into
  // one continuous line, so there's no seam to disappear at.
  const countyFeatures = feature(countiesTopology, countiesTopology.objects.counties).features;
  const stateFeatures = feature(statesTopology, statesTopology.objects.states).features;
  const countyBorders = mesh(countiesTopology, countiesTopology.objects.counties, (a, b) => a !== b);
  const stateBorders = mesh(statesTopology, statesTopology.objects.states, (a, b) => a !== b);

  let measureId = $state('OBESITY');
  let level = $state('county');
  let placesData = $state({ counties: [], states: [] });
  let loading = $state(true);
  let loadError = $state(null);

  // Split low-frequency hover identity (which feature) from high-frequency
  // pointer position (tooltip placement) — see perf note near onHoverEnter.
  let hoveredId = $state(null);
  let pointer = $state({ x: 0, y: 0 });

  $effect(() => {
    (async () => {
      try {
        placesData = await loadPlacesCounty(PLACES_COUNTY_CSV_URL);
      } catch (e) {
        loadError = e.message ?? 'Failed to load';
      } finally {
        loading = false;
      }
    })();
  });

  const measure = $derived(PLACES_MEASURES[measureId]);
  const fmt = $derived(format(measure.format));
  const displayFeatures = $derived(level === 'county' ? countyFeatures : stateFeatures);
  const featuresById = $derived.by(() => new Map(displayFeatures.map(f => [f.id, f])));
  const hoveredFeature = $derived(hoveredId ? featuresById.get(hoveredId) : null);

  // fips -> { value, stateAbbr } for the current measure + geography level
  const rowByFips = $derived.by(() => {
    const rows = level === 'county' ? placesData.counties : placesData.states;
    const map = new Map();
    for (const r of rows) {
      if (r.measureId === measureId) map.set(r.fips, r);
    }
    return map;
  });

  function valueOf(f) {
    return rowByFips.get(f.id)?.value ?? null;
  }

  // Derived from the FIPS code itself, not the PLACES row — counties with no
  // PLACES data at all (Kentucky, Pennsylvania) still need a state label.
  function tooltipText(f) {
    const row = rowByFips.get(f.id);
    const place = level === 'county'
      ? `${f.properties.name}, ${STATE_FIPS_TO_ABBR[f.id.slice(0, 2)] ?? ''}`
      : f.properties.name;
    const val = row?.value != null ? `${fmt(row.value)}${measure.unit}` : 'No data';
    return `${place}: ${val}`;
  }

  // onpointerenter/leave fire once per feature (not per pixel), so hoveredId
  // only changes a handful of times per hover session. Cursor position is
  // tracked separately via a plain pointermove on the wrapping div — that
  // only repositions the tooltip <div>, it never touches the Geo marks'
  // props. Reusing a single `hovered` object keyed off pointermove for both
  // used to force svelteplot's Plot to recompute scales across all 3,143
  // county paths on every mouse pixel, which is what made hovering laggy.
  function onHoverEnter(evt, datum) {
    hoveredId = datum.id;
  }
  function onHoverLeave() {
    hoveredId = null;
  }

  // Zoom/pan is a plain CSS transform on a wrapper div, not a re-projection.
  // SVG is vector content, so scaling it with CSS stays crisp at any zoom —
  // and critically, this never touches a Geo mark's props/data, so it can't
  // re-trigger svelteplot's scale recomputation across all county paths the
  // way the old hover implementation accidentally did.
  //
  // transform-origin is pinned at the content's top-left corner (0 0, set in
  // <style>) rather than left at its default center. A fixed, known origin is
  // what makes the point-under-cursor math below tractable: with origin 0 0,
  // a content-local point (x,y) maps to screen space as
  // `panX + x*zoomScale, panY + y*zoomScale`. Zooming "at" a point solves that
  // equation for the new panX/panY that keeps the same content point under the
  // cursor before and after the scale change — a "center zoom" is just this
  // same math with the container's center as the point.
  const ZOOM_MIN = 1;
  const ZOOM_MAX = 8;
  const ZOOM_STEP = 1.4;

  let zoomScale = $state(1);
  let panX = $state(0);
  let panY = $state(0);
  let dragging = $state(false);
  let mapWrapEl = $state(null);
  let dragOrigin = { x: 0, y: 0, panX: 0, panY: 0 };

  // Valid pan range with a top-left origin: the scaled content (width*scale)
  // must fully cover the container, so its left/top edge can't move past 0
  // and its right/bottom edge can't move short of the container's edge.
  function clampPan(x, y, scale) {
    if (!mapWrapEl) return { x, y };
    const rect = mapWrapEl.getBoundingClientRect();
    const minX = rect.width * (1 - scale);
    const minY = rect.height * (1 - scale);
    return { x: Math.min(0, Math.max(minX, x)), y: Math.min(0, Math.max(minY, y)) };
  }

  // (cx, cy) are container-relative coordinates (i.e. relative to mapWrapEl's
  // own top-left, not the viewport) of the point to zoom toward.
  function zoomAt(cx, cy, nextScale) {
    const newScale = Math.min(ZOOM_MAX, Math.max(ZOOM_MIN, nextScale));
    if (newScale === zoomScale) return;
    const ratio = newScale / zoomScale;
    const rawX = cx - (cx - panX) * ratio;
    const rawY = cy - (cy - panY) * ratio;
    zoomScale = newScale;
    if (zoomScale === ZOOM_MIN) {
      panX = 0;
      panY = 0;
    } else {
      ({ x: panX, y: panY } = clampPan(rawX, rawY, zoomScale));
    }
  }

  function containerCenter() {
    const rect = mapWrapEl?.getBoundingClientRect();
    return rect ? { x: rect.width / 2, y: rect.height / 2 } : { x: 0, y: 0 };
  }

  function zoomIn() {
    const { x, y } = containerCenter();
    zoomAt(x, y, zoomScale * ZOOM_STEP);
  }
  function zoomOut() {
    const { x, y } = containerCenter();
    zoomAt(x, y, zoomScale / ZOOM_STEP);
  }
  function resetZoom() {
    zoomScale = ZOOM_MIN;
    panX = 0;
    panY = 0;
  }

  function onWheelZoom(evt) {
    evt.preventDefault();
    const rect = mapWrapEl.getBoundingClientRect();
    zoomAt(evt.clientX - rect.left, evt.clientY - rect.top, zoomScale * (evt.deltaY < 0 ? 1.15 : 1 / 1.15));
  }

  function onMapPointerDown(evt) {
    if (zoomScale <= ZOOM_MIN) return;
    dragging = true;
    dragOrigin = { x: evt.clientX, y: evt.clientY, panX, panY };
    evt.currentTarget.setPointerCapture(evt.pointerId);
  }

  function onPointerMove(evt) {
    pointer = { x: evt.clientX, y: evt.clientY };
    if (!dragging) return;
    ({ x: panX, y: panY } = clampPan(
      dragOrigin.panX + (evt.clientX - dragOrigin.x),
      dragOrigin.panY + (evt.clientY - dragOrigin.y),
      zoomScale
    ));
  }

  function onMapPointerUp() {
    dragging = false;
  }
</script>

<svelte:head><title>Maps — Health Charts</title></svelte:head>

<div class="series-main">
  <div class="series-header">
    <div>
      <h1>Chronic Disease Map</h1>
      <p class="series-desc">
        County- and state-level chronic disease prevalence among U.S. adults, from CDC PLACES
        (model-based estimates from BRFSS survey data).
      </p>
      <div class="meta-pills">
        <span class="meta-pill">Annual</span>
        <span class="meta-pill"><a href="https://www.cdc.gov/places/index.html" target="_blank" rel="noopener">Source: CDC PLACES</a></span>
        <span class="meta-pill">Health Outcomes</span>
      </div>
    </div>
  </div>

  <div class="map-controls">
    <label class="map-control">
      <span>Measure</span>
      <select bind:value={measureId}>
        {#each PLACES_MEASURE_LIST as m}
          <option value={m.id}>{m.label}</option>
        {/each}
      </select>
    </label>
    <div class="map-control">
      <span>Geography</span>
      <div class="level-toggle">
        <button class:active={level === 'county'} onclick={() => (level = 'county')}>County</button>
        <button class:active={level === 'state'} onclick={() => (level = 'state')}>State</button>
      </div>
    </div>
    <div class="map-control">
      <span>Zoom</span>
      <div class="level-toggle">
        <button onclick={zoomOut} disabled={zoomScale <= ZOOM_MIN} aria-label="Zoom out">&minus;</button>
        <button onclick={resetZoom} disabled={zoomScale === ZOOM_MIN}>{Math.round(zoomScale * 100)}%</button>
        <button onclick={zoomIn} disabled={zoomScale >= ZOOM_MAX} aria-label="Zoom in">+</button>
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
      class:can-pan={zoomScale > ZOOM_MIN}
      class:dragging
      role="figure"
      bind:this={mapWrapEl}
      onpointermove={onPointerMove}
      onpointerdown={onMapPointerDown}
      onpointerup={onMapPointerUp}
      onpointercancel={onMapPointerUp}
      onwheel={onWheelZoom}
    >
      <div class="zoom-content" class:no-transition={dragging} style="transform: translate({panX}px, {panY}px) scale({zoomScale})">
        <Plot
          projection="albers-usa"
          color={{
            type: 'linear',
            scheme: SEQUENTIAL_SCHEME,
            domain: measure.domain,
            unknown: NO_DATA_FILL,
            legend: true,
            label: `${measure.label} — crude prevalence (${measure.unit})`
          }}
          style="width:100%"
        >
          <Geo
            data={displayFeatures}
            fill={valueOf}
            title={tooltipText}
            onpointerenter={onHoverEnter}
            onpointerleave={onHoverLeave}
          />
          <Geo canvas data={level === 'county' ? [countyBorders] : []} fill="none" stroke="#1a1a2e" strokeOpacity={0.2} strokeWidth={0.5} />
          <Geo canvas data={[stateBorders]} fill="none" stroke="#1a1a2e" strokeOpacity={0.4} strokeWidth={1} />
        </Plot>
      </div>
    </div>
  {/if}

  <!-- Rendered outside .zoom-content on purpose: a CSS `transform` on an ancestor
       (even translate(0,0) scale(1)) makes that ancestor the containing block for
       `position: fixed` descendants, which would peg this tooltip to the panned/
       zoomed map instead of the viewport. Keeping it out of that subtree means
       pointer.x/pointer.y (real client coordinates) stay correct at any zoom. -->
  {#if hoveredFeature}
    <div
      class="tip-box"
      style="position:fixed; left:{pointer.x + 14}px; top:{pointer.y}px; transform:translateY(-50%); pointer-events:none"
    >
      <div class="tip-label">{measure.label}</div>
      <div class="tip-val">{tooltipText(hoveredFeature)}</div>
    </div>
  {/if}

  <p class="chart-source">
    Source: <a href="https://www.cdc.gov/places/index.html" target="_blank" rel="noopener">CDC PLACES</a>
    · Boundaries: <a href="https://github.com/topojson/us-atlas" target="_blank" rel="noopener">us-atlas</a> (US Census cartographic boundaries)
  </p>
</div>

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
    min-width: 220px;
  }

  .level-toggle {
    display: flex;
    border: 1px solid var(--border);
    border-radius: 4px;
    overflow: hidden;
    width: fit-content;
  }

  .level-toggle button {
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

  .level-toggle button + button { border-left: 1px solid var(--border); }
  .level-toggle button.active { background: #1a1a2e; color: #fff; }
  .level-toggle button:disabled { opacity: 0.4; cursor: default; }

  .map-wrap {
    padding: 1rem;
    overflow: hidden;
  }

  .map-wrap.can-pan {
    cursor: grab;
  }

  .map-wrap.can-pan.dragging {
    cursor: grabbing;
  }

  .zoom-content {
    transform-origin: 0 0;
    transition: transform 0.12s ease-out;
  }

  .zoom-content.no-transition {
    transition: none;
  }

  /* Hover highlight is pure CSS (no JS/mark involved) so hovering never
     triggers a Plot/scale recompute — see onHoverEnter for why that mattered. */
  .map-wrap :global(g.geo path) {
    cursor: pointer;
  }

  /* The canvas-rendered border marks (see script comment on countyBorders) sit
     in a <foreignObject> layered on top of the choropleth fills. svelteplot's
     CanvasLayer sets its own inline `style="width:...;height:...;"` on the
     <canvas> *after* spreading our props, which silently discards a
     `style="pointer-events:none"` prop passed to <Geo>. Setting it here from
     an external rule isn't clobbered the same way, since the inline style
     never declares pointer-events itself — this is what lets hover reach the
     fills underneath again. */
  .map-wrap :global(foreignObject),
  .map-wrap :global(foreignObject canvas) {
    pointer-events: none;
  }

  .map-wrap :global(g.geo path:hover) {
    stroke: #1a1a2e !important;
    stroke-width: 1.75px !important;
  }

  .chart-loading-placeholder {
    height: 420px;
    border-radius: 4px;
    background: linear-gradient(90deg, var(--bg) 25%, var(--border) 50%, var(--bg) 75%);
    background-size: 200% 100%;
    animation: shimmer 1.5s infinite;
    margin: 8px 0;
  }

  .chart-error-msg {
    height: 420px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--fg-muted);
    font-size: 0.85rem;
    border: 1px dashed var(--border);
    border-radius: 4px;
  }

  @keyframes shimmer {
    0% { background-position: 200% 0; }
    100% { background-position: -200% 0; }
  }
</style>
