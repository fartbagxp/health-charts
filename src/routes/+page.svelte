<script>
  import { SERIES_CONFIG } from '$lib/config.js';
  import { DATA_SOURCES } from '$lib/sources.js';
  import ChartPanel from '$lib/ChartPanel.svelte';

  const allSeries = Object.values(SERIES_CONFIG).filter(s => !s.hidden);
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
    <ChartPanel config={s} />
  {/each}

  <section class="sources-box" id="sources">
    <h2 class="section-title">Data Sources</h2>
    <p class="sources-intro">
      Every series is archived by <a href="https://github.com/fartbagxp/health" target="_blank" rel="noopener noreferrer">fartbagxp/health</a>
      from the CDC and NCI surveillance systems below. Each lists the collecting program, how it is
      collected, the center that runs it, how often it refreshes, and what it contains.
    </p>
    <div class="source-list">
      {#each DATA_SOURCES as s}
        <div class="source-item">
          <a href={s.url} target="_blank" rel="noopener noreferrer">{s.system}</a>
          <span class="source-program">{s.program}</span>
          <div class="source-meta">
            <span class="source-tag">{s.center}</span>
            <span class="source-tag">{s.collection}</span>
            <span class="source-tag">{s.frequency}</span>
          </div>
          <span class="source-contents">{s.contents}</span>
        </div>
      {/each}
    </div>
  </section>
</div>
