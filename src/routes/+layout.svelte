<script>
  import '../app.css';
  import { base } from '$app/paths';
  import { goto } from '$app/navigation';
  import { SERIES_CONFIG } from '$lib/config.js';

  let { children } = $props();

  const allSeries = Object.values(SERIES_CONFIG);
  let navQuery = $state('');
  let navResults = $derived(
    navQuery.length > 0
      ? allSeries.filter(s =>
          s.title.toLowerCase().includes(navQuery) ||
          s.category.toLowerCase().includes(navQuery) ||
          s.id.includes(navQuery)
        )
      : []
  );

  function navSearch(e) {
    if (e.key !== 'Enter') return;
    const match = navResults[0];
    if (match) {
      goto(`${base}/series/${match.id}`);
      navQuery = '';
    }
  }
</script>

<nav>
  <div class="nav-inner">
    <a href="{base}/" class="nav-logo"><span>Health</span>Charts</a>
    <div class="nav-search">
      <input
        type="text"
        placeholder="Search data series..."
        autocomplete="off"
        bind:value={navQuery}
        onkeydown={navSearch}
      />
      {#if navResults.length > 0}
        <div class="nav-dropdown">
          {#each navResults as s}
            <a href="{base}/series/{s.id}" onclick={() => navQuery = ''}>
              <span class="nav-dot" style="background:{s.color}"></span>
              <span class="nav-result-title">{s.title}</span>
              <span class="nav-result-meta">{s.frequency}</span>
            </a>
          {/each}
        </div>
      {/if}
    </div>
  </div>
</nav>

<main>
  {@render children()}
</main>

<footer>
  <div class="footer-inner">
    <p>
      Data sources:
      <a href="https://www.cdc.gov/flu/weekly/" target="_blank" rel="noopener">CDC FluView</a>,
      <a href="https://www.cdc.gov/covid/data-research/" target="_blank" rel="noopener">CDC COVID-NET</a>,
      <a href="https://www.cdc.gov/rsv/php/surveillance/" target="_blank" rel="noopener">CDC RSV-NET</a>
    </p>
    <p class="footer-note">Health Charts is a personal project inspired by <a href="https://fred.stlouisfed.org/" target="_blank" rel="noopener">FRED</a></p>
  </div>
</footer>
