<script>
  import { format } from 'd3-format';
  import { Plot, Line, AxisX, AxisY, RuleY, GridY } from 'svelteplot';
  import { SERIES_CONFIG } from '$lib/config.js';

  let { data } = $props();

  const allSeries = Object.values(SERIES_CONFIG).filter(s => !s.hidden);
  const dataMap = $derived(Object.fromEntries(
    data.datasets.filter(d => d.data).map(d => [d.id, d.data])
  ));
  const subDataMap = $derived(Object.fromEntries(
    data.datasets.filter(d => d.subData).map(d => [d.id, d.subData])
  ));

  function yMax(seriesId) {
    const config = SERIES_CONFIG[seriesId];
    if (config.yDomain) return config.yDomain[1];
    const rows = dataMap[seriesId] ?? [];
    const max = Math.max(...rows.map(d => +d[config.valueKey]));
    if (!max || max <= 0) return 1;
    if (max <= 5) return Math.ceil(max) + 1;
    if (max <= 100) return Math.ceil(max / 10) * 10 + 10;
    if (max <= 1000) return Math.ceil(max / 100) * 100;
    return Math.ceil(max / 10000) * 10000;
  }

  function yMaxMulti(seriesId) {
    const config = SERIES_CONFIG[seriesId];
    const subData = subDataMap[seriesId] ?? [];
    const allValues = subData.flatMap(sub => sub.rows.map(d => +d[config.valueKey])).filter(v => !isNaN(v));
    const max = allValues.length ? Math.max(...allValues) : 0;
    if (!max || max <= 0) return 1;
    if (max <= 5) return Math.ceil(max) + 1;
    if (max <= 100) return Math.ceil(max / 10) * 10 + 10;
    if (max <= 1000) return Math.ceil(max / 100) * 100;
    return Math.ceil(max / 10000) * 10000;
  }

  function yTickFormat(d) {
    if (d === 0) return '0';
    if (d >= 1000) return `${d / 1000}k`;
    return String(d);
  }

  function latest(seriesId) {
    const config = SERIES_CONFIG[seriesId];
    const rows = dataMap[seriesId];
    if (!rows?.length) return '—';
    return format(config.format)(+rows[rows.length - 1][config.valueKey]);
  }

  function latestMulti(seriesId) {
    const config = SERIES_CONFIG[seriesId];
    const subData = subDataMap[seriesId] ?? [];
    const firstSub = subData[0];
    if (!firstSub?.rows?.length) return '—';
    return format(config.format)(+firstSub.rows[firstSub.rows.length - 1][config.valueKey]);
  }

  // Tooltip state — shared across all charts, keyed by series id
  let hovered = $state({ seriesId: null, datum: null, multiDatum: null, clientX: 0, clientY: 0, flipLeft: false });

  const MARGIN_LEFT = 48;
  const MARGIN_RIGHT = 16;

  function onChartMove(evt, seriesId, rows) {
    const rect = evt.currentTarget.getBoundingClientRect();
    const mouseX = evt.clientX - rect.left;

    const innerWidth = rect.width - MARGIN_LEFT - MARGIN_RIGHT;
    const fraction = (mouseX - MARGIN_LEFT) / innerWidth;

    if (fraction < 0 || fraction > 1 || !rows.length) {
      hovered = { seriesId: null, datum: null, multiDatum: null, clientX: 0, clientY: 0, flipLeft: false };
      return;
    }

    const t0 = rows[0].date.getTime();
    const t1 = rows[rows.length - 1].date.getTime();
    const targetTime = t0 + fraction * (t1 - t0);

    const datum = rows.reduce((best, d) =>
      Math.abs(d.date.getTime() - targetTime) < Math.abs(best.date.getTime() - targetTime) ? d : best
    );

    hovered = {
      seriesId, datum, multiDatum: null,
      clientX: evt.clientX, clientY: evt.clientY,
      flipLeft: evt.clientX > window.innerWidth * 0.6,
    };
  }

  function onChartMoveMulti(evt, seriesId, subData) {
    const rect = evt.currentTarget.getBoundingClientRect();
    const mouseX = evt.clientX - rect.left;

    const innerWidth = rect.width - MARGIN_LEFT - MARGIN_RIGHT;
    const fraction = (mouseX - MARGIN_LEFT) / innerWidth;

    const firstRows = subData[0]?.rows ?? [];
    if (fraction < 0 || fraction > 1 || !firstRows.length) {
      hovered = { seriesId: null, datum: null, multiDatum: null, clientX: 0, clientY: 0, flipLeft: false };
      return;
    }

    const t0 = firstRows[0].date.getTime();
    const t1 = firstRows[firstRows.length - 1].date.getTime();
    const targetTime = t0 + fraction * (t1 - t0);

    const closest = firstRows.reduce((best, d) =>
      Math.abs(d.date.getTime() - targetTime) < Math.abs(best.date.getTime() - targetTime) ? d : best
    );

    const multiDatum = subData.map(sub => ({
      key: sub.key,
      label: sub.label,
      color: sub.color,
      datum: sub.rows.find(d => d.date.getTime() === closest.date.getTime()) ?? closest
    }));

    hovered = {
      seriesId, datum: closest, multiDatum,
      clientX: evt.clientX, clientY: evt.clientY,
      flipLeft: evt.clientX > window.innerWidth * 0.6,
    };
  }

  function onChartLeave() {
    hovered = { seriesId: null, datum: null, multiDatum: null, clientX: 0, clientY: 0, flipLeft: false };
  }
</script>

<svelte:head><title>Health Charts</title></svelte:head>

<div class="home-header">
  <div class="home-header-inner">
    <div class="home-header-text">
      <h1>U.S. Health Surveillance</h1>
      <p>Respiratory illness data from CDC surveillance networks</p>
    </div>
  </div>
</div>

<div class="charts-main">
  {#each allSeries as s}
    {#if s.subSeries}
      {@const subData = subDataMap[s.id] ?? []}
      <section class="chart-panel">
        <div class="panel-header">
          <div class="panel-title-group">
            <span class="panel-badge">{s.category}</span>
            <h2 class="panel-title">{s.title}</h2>
            <span class="panel-meta">{s.frequency} · {s.source}</span>
          </div>
          <div class="panel-stat">
            <span class="panel-stat-label">Latest</span>
            <span class="panel-stat-value">{latestMulti(s.id)}</span>
            <span class="panel-stat-unit">{s.unit}</span>
          </div>
        </div>

        <div
          role="figure"
          style="position:relative"
          onpointermove={(e) => onChartMoveMulti(e, s.id, subData)}
          onpointerleave={onChartLeave}
        >
          <Plot
            height={220}
            marginTop={24} marginBottom={36} marginLeft={48} marginRight={16}
            x={{ type: 'time' }}
            y={{ domain: [0, yMaxMulti(s.id)] }}
            style="width:100%"
          >
            <RuleY y={0} />
            <GridY strokeOpacity={0.2} />
            <AxisX tickFormat={(d) => d instanceof Date ? d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : String(d)} />
            <AxisY tickFormat={yTickFormat} />
            {#each subData as sub}
              <Line data={sub.rows} x="date" y={s.valueKey} stroke={sub.color} strokeWidth={2} />
            {/each}
            {#snippet overlay()}
              {#if hovered.seriesId === s.id && hovered.multiDatum}
                <div class="tip-box" style="position:fixed; {hovered.flipLeft ? `right:${window.innerWidth - hovered.clientX + 14}px` : `left:${hovered.clientX + 14}px`}; top:{hovered.clientY}px; transform:translateY(-50%); pointer-events:none">
                  <div class="tip-date">{hovered.datum.date.toLocaleDateString('en-US', { year: 'numeric' })}</div>
                  {#each hovered.multiDatum as sub}
                    <div class="tip-row">
                      <span class="tip-swatch" style="background:{sub.color}"></span>
                      <span class="tip-label">{sub.label}</span>
                      <span class="tip-val">{format(s.format)(+sub.datum[s.valueKey])} <span style="font-size:0.72rem;opacity:0.7">{s.unit}</span></span>
                    </div>
                  {/each}
                </div>
              {/if}
            {/snippet}
          </Plot>
        </div>
        <div class="panel-source">Source: <a href="{s.sourceUrl}" target="_blank" rel="noopener">{s.source}</a></div>
      </section>
    {:else}
      {@const rows = dataMap[s.id] ?? []}
      <section class="chart-panel">
        <div class="panel-header">
          <div class="panel-title-group">
            <span class="panel-badge">{s.category}</span>
            <h2 class="panel-title">{s.title}</h2>
            <span class="panel-meta">{s.frequency} · {s.source}</span>
          </div>
          <div class="panel-stat">
            <span class="panel-stat-label">Latest</span>
            <span class="panel-stat-value">{latest(s.id)}</span>
            <span class="panel-stat-unit">{s.unit}</span>
          </div>
        </div>

        <div
          role="figure"
          style="position:relative"
          onpointermove={(e) => onChartMove(e, s.id, rows)}
          onpointerleave={onChartLeave}
        >
          <Plot
            height={220}
            marginTop={24} marginBottom={36} marginLeft={48} marginRight={16}
            x={{ type: 'time' }}
            y={{ domain: [0, yMax(s.id)] }}
            style="width:100%"
          >
            <RuleY y={0} />
            <GridY strokeOpacity={0.2} />
            <AxisX tickFormat={(d) => d instanceof Date ? d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : String(d)} />
            <AxisY tickFormat={yTickFormat} />
            <Line data={rows} x="date" y={s.valueKey} stroke={s.color ?? 'black'} strokeWidth={2} />
            {#snippet overlay()}
              {#if hovered.seriesId === s.id && hovered.datum}
                <div class="tip-box" style="position:fixed; {hovered.flipLeft ? `right:${window.innerWidth - hovered.clientX + 14}px` : `left:${hovered.clientX + 14}px`}; top:{hovered.clientY}px; transform:translateY(-50%); pointer-events:none">
                  <div class="tip-label">{s.title}</div>
                  <div class="tip-date">{hovered.datum.date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</div>
                  <div class="tip-val">{format(s.format)(hovered.datum[s.valueKey])} <span style="font-size:0.72rem;opacity:0.7">{s.unit}</span></div>
                </div>
              {/if}
            {/snippet}
          </Plot>
        </div>
        <div class="panel-source">Source: <a href="{s.sourceUrl}" target="_blank" rel="noopener">{s.source}</a></div>
      </section>
    {/if}
  {/each}

  <section class="sources-box">
    <h2 class="section-title">Data Sources</h2>
    <div class="source-list">
      <div class="source-item">
        <a href="https://www.cdc.gov/fluview/index.html" target="_blank" rel="noopener noreferrer">CDC FluView</a>
        <span>Weekly influenza surveillance network</span>
      </div>
      <div class="source-item">
        <a href="https://www.cdc.gov/covid/php/covid-net/index.html" target="_blank" rel="noopener noreferrer">CDC COVID-NET</a>
        <span>COVID-19 hospitalization surveillance</span>
      </div>
      <div class="source-item">
        <a href="https://www.cdc.gov/rsv/php/surveillance/rsv-net.html" target="_blank" rel="noopener noreferrer">CDC RSV-NET</a>
        <span>RSV hospitalization surveillance</span>
      </div>
      <div class="source-item">
        <a href="https://www.cdc.gov/measles/data-research/index.html" target="_blank" rel="noopener noreferrer">CDC Measles Data</a>
        <span>National measles case surveillance</span>
      </div>
      <div class="source-item">
        <a href="https://www.cdc.gov/nchs/index.htm" target="_blank" rel="noopener noreferrer">CDC NCHS</a>
        <span>Births, mortality, and life expectancy</span>
      </div>
      <div class="source-item">
        <a href="https://wonder.cdc.gov/" target="_blank" rel="noopener noreferrer">CDC WONDER</a>
        <span>Historical natality, mortality, and notifiable diseases</span>
      </div>
      <div class="source-item">
        <a href="https://data.cdc.gov/" target="_blank" rel="noopener noreferrer">CDC Open Data Portal</a>
        <span>Source datasets behind these charts</span>
      </div>
    </div>
  </section>
</div>
