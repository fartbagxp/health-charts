<script>
  import { SERIES_CONFIG } from '$lib/config.js';
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
