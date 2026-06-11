<script>
  import { format } from 'd3-format';
  import { Plot, Line, AxisX, AxisY, RuleY, GridY } from 'svelteplot';

  let { data } = $props();
  const config = $derived(data.config);
  const rows = $derived(data.data);
  const fmt = $derived(format(config.format));

  const normRows = $derived(rows.map(d => ({ date: d.date, value: +d[config.valueKey] })));
  const values = $derived(rows.map(d => +d[config.valueKey]));
  const latestVal = $derived(fmt(values[values.length - 1]));
  const peakVal = $derived(fmt(Math.max(...values)));
  const avgVal = $derived(fmt(Math.round(values.reduce((a, b) => a + b, 0) / values.length)));

  let hoveredDatum = $state(null);
  let clientX = $state(0);
  let clientY = $state(0);
  let flipLeft = $state(false);

  const MARGIN_LEFT = 40;
  const MARGIN_RIGHT = 16;

  function onChartMove(evt) {
    const rect = evt.currentTarget.getBoundingClientRect();
    const mx = evt.clientX - rect.left;

    const innerWidth = rect.width - MARGIN_LEFT - MARGIN_RIGHT;
    const fraction = (mx - MARGIN_LEFT) / innerWidth;

    if (fraction < 0 || fraction > 1 || !rows.length) {
      hoveredDatum = null;
      return;
    }

    const t0 = rows[0].date.getTime();
    const t1 = rows[rows.length - 1].date.getTime();
    const targetTime = t0 + fraction * (t1 - t0);

    hoveredDatum = rows.reduce((best, d) =>
      Math.abs(d.date.getTime() - targetTime) < Math.abs(best.date.getTime() - targetTime) ? d : best
    );
    clientX = evt.clientX;
    clientY = evt.clientY;
    flipLeft = evt.clientX > window.innerWidth * 0.6;
  }

  function downloadCSV() {
    const lines = ['Date,' + config.valueKey, ...rows.map(d => `${d.date.toISOString().slice(0,10)},${d[config.valueKey]}`)];
    const blob = new Blob([lines.join('\n')], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = Object.assign(document.createElement('a'), { href: url, download: `${config.id}-data.csv` });
    a.click();
    URL.revokeObjectURL(url);
  }
</script>

<svelte:head><title>{config.title} — Health Charts</title></svelte:head>

<div class="series-main">
  <div class="series-header">
    <div>
      <h1>{config.title}</h1>
      <p class="series-desc">{config.description}</p>
      <div class="meta-pills">
        <span class="meta-pill">{config.frequency}</span>
        <span class="meta-pill">Source: {config.source}</span>
        <span class="meta-pill">{config.category}</span>
      </div>
    </div>
    <button class="btn-download" onclick={downloadCSV}>↓ Download CSV</button>
  </div>

  <div
    role="figure"
    class="chart-wrap"
    style="position:relative"
    onpointermove={onChartMove}
    onpointerleave={() => { hoveredDatum = null; }}
  >
    <Plot height={420} x={{ type: 'time' }} style="width:100%">
      <RuleY y={0} />
      <GridY strokeOpacity={0.2} />
      <AxisX tickFormat={(d) => d instanceof Date ? d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : String(d)} />
      <AxisY />
      <Line data={normRows} x="date" y="value" stroke={config.color ?? 'black'} strokeWidth={2} />
      {#snippet overlay()}
        {#if hoveredDatum}
          <div class="tip-box" style="position:fixed; {flipLeft ? `right:${window.innerWidth - clientX + 14}px` : `left:${clientX + 14}px`}; top:{clientY}px; transform:translateY(-50%); pointer-events:none">
            <div class="tip-label">{config.title}</div>
            <div class="tip-date">{hoveredDatum.date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</div>
            <div class="tip-val">{fmt(+hoveredDatum[config.valueKey])} <span style="font-size:0.72rem;opacity:0.7">{config.unit}</span></div>
          </div>
        {/if}
      {/snippet}
    </Plot>
  </div>

  <div class="metrics-grid">
    <div class="metric-card">
      <h3>Latest Value</h3>
      <p class="metric-value">{latestVal}</p>
      <p class="metric-unit">{config.unit}</p>
    </div>
    <div class="metric-card">
      <h3>Peak Value</h3>
      <p class="metric-value">{peakVal}</p>
      <p class="metric-unit">{config.unit}</p>
    </div>
    <div class="metric-card">
      <h3>Period Average</h3>
      <p class="metric-value">{avgVal}</p>
      <p class="metric-unit">{config.unit}</p>
    </div>
  </div>
</div>
