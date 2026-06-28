<script>
  import { format } from 'd3-format';
  import { Plot, Line, AxisX, AxisY, RuleY, GridY } from 'svelteplot';
  import { loadSeries, loadSubSeries } from '$lib/fetchData.js';

  let { config } = $props();

  let rows = $state([]);
  let subData = $state([]);
  let loading = $state(false);
  let loaded = $state(false);
  let error = $state(null);
  let sectionEl = $state(null);

  let hovered = $state({ datum: null, multiDatum: null, clientX: 0, clientY: 0, flipLeft: false });

  const MARGIN_LEFT = 48;
  const MARGIN_RIGHT = 16;

  async function loadData() {
    if (loaded || loading) return;
    loading = true;
    try {
      if (config.subSeries) {
        subData = await loadSubSeries(config);
      } else {
        rows = await loadSeries(config);
      }
      loaded = true;
    } catch (e) {
      error = e.message ?? 'Failed to load';
    } finally {
      loading = false;
    }
  }

  $effect(() => {
    if (!sectionEl) return;
    const observer = new IntersectionObserver(
      (entries) => { if (entries[0].isIntersecting) loadData(); },
      { rootMargin: '300px' }
    );
    observer.observe(sectionEl);
    return () => observer.disconnect();
  });

  function yMax() {
    if (config.yDomain) return config.yDomain[1];
    const max = Math.max(...rows.map(d => +d[config.valueKey]));
    if (!max || max <= 0) return 1;
    if (max <= 5) return Math.ceil(max) + 1;
    if (max <= 100) return Math.ceil(max / 10) * 10 + 10;
    if (max <= 1000) return Math.ceil(max / 100) * 100;
    return Math.ceil(max / 10000) * 10000;
  }

  function yDomainMulti() {
    if (config.yDomain) return config.yDomain;
    const allValues = subData.flatMap(sub => sub.rows.map(d => +d[config.valueKey])).filter(v => !isNaN(v));
    const max = allValues.length ? Math.max(...allValues) : 0;
    let top = 1;
    if (max <= 5) top = Math.ceil(max) + 1;
    else if (max <= 100) top = Math.ceil(max / 10) * 10 + 10;
    else if (max <= 1000) top = Math.ceil(max / 100) * 100;
    else top = Math.ceil(max / 10000) * 10000;
    return [0, top];
  }

  function yTickFormat(d) {
    if (d === 0) return '0';
    if (d >= 1e9) return `${+(d / 1e9).toPrecision(3)}B`;
    if (d >= 1e6) return `${+(d / 1e6).toPrecision(3)}M`;
    if (d >= 1000) return `${+(d / 1000).toPrecision(3)}k`;
    return String(d);
  }

  function latestValue() {
    if (config.subSeries) {
      const firstSub = subData[0];
      if (!firstSub?.rows?.length) return '—';
      return format(config.format)(+firstSub.rows[firstSub.rows.length - 1][config.valueKey]);
    }
    if (!rows.length) return '—';
    return format(config.format)(+rows[rows.length - 1][config.valueKey]);
  }

  function onChartMove(evt) {
    const rect = evt.currentTarget.getBoundingClientRect();
    const mouseX = evt.clientX - rect.left;
    const innerWidth = rect.width - MARGIN_LEFT - MARGIN_RIGHT;
    const fraction = (mouseX - MARGIN_LEFT) / innerWidth;

    if (fraction < 0 || fraction > 1 || !rows.length) {
      hovered = { datum: null, multiDatum: null, clientX: 0, clientY: 0, flipLeft: false };
      return;
    }

    const t0 = rows[0].date.getTime();
    const t1 = rows[rows.length - 1].date.getTime();
    const targetTime = t0 + fraction * (t1 - t0);
    const datum = rows.reduce((best, d) =>
      Math.abs(d.date.getTime() - targetTime) < Math.abs(best.date.getTime() - targetTime) ? d : best
    );
    hovered = { datum, multiDatum: null, clientX: evt.clientX, clientY: evt.clientY, flipLeft: evt.clientX > window.innerWidth * 0.6 };
  }

  function onChartMoveMulti(evt) {
    const rect = evt.currentTarget.getBoundingClientRect();
    const mouseX = evt.clientX - rect.left;
    const innerWidth = rect.width - MARGIN_LEFT - MARGIN_RIGHT;
    const fraction = (mouseX - MARGIN_LEFT) / innerWidth;

    const firstRows = subData[0]?.rows ?? [];
    if (fraction < 0 || fraction > 1 || !firstRows.length) {
      hovered = { datum: null, multiDatum: null, clientX: 0, clientY: 0, flipLeft: false };
      return;
    }

    const t0 = firstRows[0].ts;
    const t1 = firstRows[firstRows.length - 1].ts;
    const targetTime = t0 + fraction * (t1 - t0);
    const closest = firstRows.reduce((best, d) =>
      Math.abs(d.ts - targetTime) < Math.abs(best.ts - targetTime) ? d : best
    );
    const multiDatum = subData.map(sub => ({
      key: sub.key,
      label: sub.label,
      color: sub.color,
      datum: sub.rows.find(d => d.ts === closest.ts) ?? closest
    }));
    hovered = { datum: closest, multiDatum, clientX: evt.clientX, clientY: evt.clientY, flipLeft: evt.clientX > window.innerWidth * 0.6 };
  }

  function onChartLeave() {
    hovered = { datum: null, multiDatum: null, clientX: 0, clientY: 0, flipLeft: false };
  }
</script>

<section id={config.id} class="chart-panel" bind:this={sectionEl}>
  <div class="panel-header">
    <div class="panel-title-group">
      <span class="panel-badge">{config.category}</span>
      <h2 class="panel-title">{config.title}<a class="panel-anchor" href="#{config.id}" aria-label="Link to {config.title}">#</a></h2>
      <span class="panel-meta">{config.frequency} · {config.source}</span>
    </div>
    <div class="panel-stat">
      <span class="panel-stat-label">Latest</span>
      <span class="panel-stat-value">{loaded ? latestValue() : '—'}</span>
      <span class="panel-stat-unit">{config.unit}</span>
    </div>
  </div>

  {#if error}
    <div class="chart-placeholder chart-error">Failed to load data</div>
  {:else if !loaded}
    <div class="chart-placeholder chart-skeleton" aria-busy="true"></div>
  {:else if config.subSeries}
    <div
      role="figure"
      style="position:relative"
      onpointermove={onChartMoveMulti}
      onpointerleave={onChartLeave}
    >
      <Plot
        height={220}
        marginTop={24} marginBottom={36} marginLeft={48} marginRight={40}
        x={{ type: 'time' }}
        y={{ domain: yDomainMulti() }}
        style="width:100%"
      >
        <RuleY y={yDomainMulti()[0]} />
        <GridY strokeOpacity={0.2} />
        <AxisX tickSpacing={90} tickFormat={(d) => d instanceof Date ? d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : String(d)} />
        <AxisY tickFormat={yTickFormat} />
        {#each subData as sub}
          <Line data={sub.rows} x="date" y={config.valueKey} stroke={sub.color} strokeWidth={2} />
        {/each}
        {#snippet overlay()}
          {#if hovered.multiDatum}
            <div class="tip-box" style="position:fixed; {hovered.flipLeft ? `right:${window.innerWidth - hovered.clientX + 14}px` : `left:${hovered.clientX + 14}px`}; top:{hovered.clientY}px; transform:translateY(-50%); pointer-events:none">
              <div class="tip-date">{new Date(hovered.datum.ts).toLocaleDateString('en-US', { year: 'numeric' })}</div>
              {#each hovered.multiDatum as sub}
                <div class="tip-row">
                  <span class="tip-swatch" style="background:{sub.color}"></span>
                  <span class="tip-label">{sub.label}</span>
                  <span class="tip-val">{format(config.format)(+sub.datum[config.valueKey])} <span style="font-size:0.72rem;opacity:0.7">{config.unit}</span></span>
                </div>
              {/each}
            </div>
          {/if}
        {/snippet}
      </Plot>
    </div>
  {:else}
    <div
      role="figure"
      style="position:relative"
      onpointermove={onChartMove}
      onpointerleave={onChartLeave}
    >
      <Plot
        height={220}
        marginTop={24} marginBottom={36} marginLeft={48} marginRight={40}
        x={{ type: 'time' }}
        y={{ domain: [0, yMax()] }}
        style="width:100%"
      >
        <RuleY y={0} />
        <GridY strokeOpacity={0.2} />
        <AxisX tickSpacing={90} tickFormat={(d) => d instanceof Date ? d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : String(d)} />
        <AxisY tickFormat={yTickFormat} />
        <Line data={rows} x="date" y={config.valueKey} stroke={config.color ?? 'black'} strokeWidth={2} />
        {#snippet overlay()}
          {#if hovered.datum}
            <div class="tip-box" style="position:fixed; {hovered.flipLeft ? `right:${window.innerWidth - hovered.clientX + 14}px` : `left:${hovered.clientX + 14}px`}; top:{hovered.clientY}px; transform:translateY(-50%); pointer-events:none">
              <div class="tip-label">{config.title}</div>
              <div class="tip-date">{hovered.datum.date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</div>
              <div class="tip-val">{format(config.format)(hovered.datum[config.valueKey])} <span style="font-size:0.72rem;opacity:0.7">{config.unit}</span></div>
            </div>
          {/if}
        {/snippet}
      </Plot>
    </div>
  {/if}

  <div class="panel-source">Source: <a href="{config.sourceUrl}" target="_blank" rel="noopener">{config.source}</a></div>
</section>

<style>
  .chart-placeholder {
    height: 220px;
    border-radius: 4px;
    margin: 8px 0;
  }

  .chart-skeleton {
    background: linear-gradient(90deg, var(--color-bg-alt, #f0f0f0) 25%, var(--color-bg-alt2, #e0e0e0) 50%, var(--color-bg-alt, #f0f0f0) 75%);
    background-size: 200% 100%;
    animation: shimmer 1.5s infinite;
  }

  .chart-error {
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--color-muted, #888);
    font-size: 0.85rem;
    border: 1px dashed var(--color-border, #ccc);
  }

  @keyframes shimmer {
    0% { background-position: 200% 0; }
    100% { background-position: -200% 0; }
  }
</style>
