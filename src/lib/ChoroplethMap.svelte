<script>
  import { Plot, Geo } from 'svelteplot';

  /**
   * Shared US choropleth chrome: albers-usa projection, value fills, a single
   * stitched border mesh, CSS zoom/pan, a split hover tooltip, and loading /
   * error placeholders. Extracted from the PLACES map so /map, /map/measles and
   * /map/low-birthweight render identically from one implementation.
   *
   * The perf notes below are load-bearing — they were each a measured fix.
   */
  let {
    features = [],
    countyBorders = null,
    stateBorders = null,
    valueOf,
    tooltip,
    tipLabel = '',
    color,
    loading = false,
    error = null,
    zoomable = true,
    onselect = null
  } = $props();

  // Split low-frequency hover identity (which feature) from high-frequency
  // pointer position (tooltip placement). onpointerenter/leave fire once per
  // feature, not per pixel, so hoveredId changes only a handful of times per
  // hover session; cursor position is tracked separately on the wrapping div
  // and only repositions the tooltip <div>, never touching the Geo marks'
  // props. Reusing one object keyed off pointermove for both used to force
  // svelteplot to recompute scales across every county path on every mouse
  // pixel, which is what made hovering laggy.
  let hoveredId = $state(null);
  let pointer = $state({ x: 0, y: 0 });

  const featuresById = $derived.by(() => new Map(features.map((f) => [f.id, f])));
  const hoveredFeature = $derived(hoveredId ? featuresById.get(hoveredId) : null);

  function onHoverEnter(evt, datum) {
    hoveredId = datum.id;
  }
  function onHoverLeave() {
    hoveredId = null;
  }
  function onGeoClick(evt, datum) {
    if (onselect) onselect(datum);
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

  // (cx, cy) are container-relative coordinates (relative to mapWrapEl's own
  // top-left, not the viewport) of the point to zoom toward.
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
    if (!zoomable) return;
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

{#if error}
  <div class="chart-error-msg">Failed to load data: {error}</div>
{:else if loading}
  <div class="chart-loading-placeholder" aria-busy="true"></div>
{:else}
  <div
    class="chart-wrap map-wrap"
    class:can-pan={zoomable && zoomScale > ZOOM_MIN}
    class:dragging
    role="figure"
    bind:this={mapWrapEl}
    onpointermove={onPointerMove}
    onpointerdown={onMapPointerDown}
    onpointerup={onMapPointerUp}
    onpointercancel={onMapPointerUp}
    onwheel={onWheelZoom}
  >
    {#if zoomable}
      <div class="zoom-ctl">
        <button onclick={zoomOut} disabled={zoomScale <= ZOOM_MIN} aria-label="Zoom out">&minus;</button>
        <button onclick={resetZoom} disabled={zoomScale === ZOOM_MIN}>{Math.round(zoomScale * 100)}%</button>
        <button onclick={zoomIn} disabled={zoomScale >= ZOOM_MAX} aria-label="Zoom in">+</button>
      </div>
    {/if}

    <div
      class="zoom-content"
      class:no-transition={dragging}
      style="transform: translate({panX}px, {panY}px) scale({zoomScale})"
    >
      <Plot projection="albers-usa" color={{ legend: true, ...color }} style="width:100%">
        <Geo
          data={features}
          fill={valueOf}
          title={tooltip}
          onpointerenter={onHoverEnter}
          onpointerleave={onHoverLeave}
          onclick={onGeoClick}
        />
        <Geo
          canvas
          data={countyBorders ? [countyBorders] : []}
          fill="none"
          stroke="#1a1a2e"
          strokeOpacity={0.2}
          strokeWidth={0.5}
        />
        <Geo
          canvas
          data={stateBorders ? [stateBorders] : []}
          fill="none"
          stroke="#1a1a2e"
          strokeOpacity={0.4}
          strokeWidth={1}
        />
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
    {#if tipLabel}<div class="tip-label">{tipLabel}</div>{/if}
    <div class="tip-val">{tooltip(hoveredFeature)}</div>
  </div>
{/if}

<style>
  .map-wrap {
    padding: 1rem;
    overflow: hidden;
    position: relative;
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

  .zoom-ctl {
    position: absolute;
    right: 0.75rem;
    bottom: 0.75rem;
    z-index: 5;
    display: flex;
    border: 1px solid var(--border);
    border-radius: 4px;
    overflow: hidden;
    background: var(--bg-card);
  }

  .zoom-ctl button {
    padding: 0.35rem 0.7rem;
    border: none;
    background: var(--bg-card);
    color: var(--fg-mid);
    font-size: 0.85rem;
    font-weight: 500;
    cursor: pointer;
  }

  .zoom-ctl button + button {
    border-left: 1px solid var(--border);
  }

  .zoom-ctl button:disabled {
    opacity: 0.4;
    cursor: default;
  }

  /* Hover highlight is pure CSS (no JS/mark involved) so hovering never
     triggers a Plot/scale recompute — see the hover note in <script>. */
  .map-wrap :global(g.geo path) {
    cursor: pointer;
  }

  /* The canvas-rendered border marks sit in a <foreignObject> layered on top of
     the choropleth fills. svelteplot's CanvasLayer sets its own inline
     `style="width:...;height:...;"` on the <canvas> after spreading our props,
     which silently discards a `style="pointer-events:none"` prop passed to
     <Geo>. Setting it from an external rule isn't clobbered the same way, since
     the inline style never declares pointer-events itself — this is what lets
     hover reach the fills underneath again. */
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
