import * as d3 from 'd3';
import { SERIES_CONFIG, CATEGORIES } from './config.js';
import { loadSeriesData } from './dataLoader.js';
import { createSparkline } from './sparkline.js';

export async function renderHome(container) {
  container.innerHTML = `
    <section class="hero">
      <div class="hero-inner">
        <h1>Explore U.S. Public Health Data</h1>
        <p>Visualize, analyze, and download respiratory illness surveillance data from CDC and other federal sources.</p>
        <div class="hero-search">
          <input type="text" id="hero-search-input" placeholder='Search for a data series, e.g. "flu" or "COVID-19"' autocomplete="off">
          <button id="hero-search-btn">Search</button>
        </div>
        <div id="hero-search-results" class="search-dropdown"></div>
      </div>
    </section>

    <main class="home-main">
      <section class="featured-series">
        <h2 class="section-title">Popular Series</h2>
        <div class="series-cards" id="series-cards">
          ${Object.values(SERIES_CONFIG).map(s => `
            <a href="#/series/${s.id}" class="series-card">
              <div class="series-card-sparkline" id="sparkline-${s.id}"></div>
              <div class="series-card-info">
                <div class="series-card-badge" style="background:${s.color}22;color:${s.color};border-color:${s.color}44">${s.category}</div>
                <h3>${s.title}</h3>
                <p class="series-meta">${s.frequency} &nbsp;|&nbsp; ${s.source}</p>
                <div class="series-latest">
                  <span class="series-latest-label">Latest</span>
                  <span class="series-latest-value" id="latest-${s.id}">—</span>
                  <span class="series-latest-unit">${s.unit}</span>
                </div>
              </div>
            </a>
          `).join('')}
        </div>
      </section>

      <div class="home-columns">
        <section class="browse-categories">
          <h2 class="section-title">Browse by Category</h2>
          <div class="category-tags">
            ${CATEGORIES.map(cat => `
              <a href="#/series/${cat.series[0]}" class="category-tag">${cat.name}</a>
            `).join('')}
          </div>
        </section>

        <section class="data-sources">
          <h2 class="section-title">Data Sources</h2>
          <div class="source-list">
            <div class="source-item">
              <strong>CDC FluView</strong>
              <span>Weekly influenza surveillance network</span>
            </div>
            <div class="source-item">
              <strong>CDC COVID-NET</strong>
              <span>COVID-19 hospitalization surveillance</span>
            </div>
            <div class="source-item">
              <strong>CDC RSV-NET</strong>
              <span>RSV hospitalization surveillance</span>
            </div>
          </div>
        </section>
      </div>
    </main>
  `;

  // Load sparklines and latest values in parallel
  await Promise.all(Object.keys(SERIES_CONFIG).map(async (seriesId) => {
    const config = SERIES_CONFIG[seriesId];
    try {
      const data = await loadSeriesData(seriesId);

      const sparklineEl = document.getElementById(`sparkline-${seriesId}`);
      if (sparklineEl) {
        createSparkline(sparklineEl, data, config.valueKey, config.color);
      }

      const values = data.map(d => +d[config.valueKey]);
      const latest = values[values.length - 1];
      const latestEl = document.getElementById(`latest-${seriesId}`);
      if (latestEl) latestEl.textContent = d3.format(config.format)(latest);
    } catch (e) {
      console.error(`Failed to load ${seriesId}:`, e);
    }
  }));

  // Hero search
  const searchInput = document.getElementById('hero-search-input');
  const searchBtn = document.getElementById('hero-search-btn');
  const searchResults = document.getElementById('hero-search-results');
  const allSeries = Object.values(SERIES_CONFIG);

  function showResults(q) {
    if (!q) { searchResults.innerHTML = ''; searchResults.classList.remove('visible'); return; }
    const matches = allSeries.filter(s =>
      s.title.toLowerCase().includes(q) ||
      s.category.toLowerCase().includes(q) ||
      s.id.includes(q) ||
      s.source.toLowerCase().includes(q)
    );
    if (matches.length === 0) {
      searchResults.innerHTML = '<div class="search-no-results">No series found</div>';
    } else {
      searchResults.innerHTML = matches.map(s => `
        <a href="#/series/${s.id}" class="search-result-item">
          <span class="search-result-dot" style="background:${s.color}"></span>
          <span class="search-result-title">${s.title}</span>
          <span class="search-result-meta">${s.frequency}</span>
        </a>
      `).join('');
    }
    searchResults.classList.add('visible');
  }

  searchInput.addEventListener('input', () => showResults(searchInput.value.toLowerCase().trim()));

  searchInput.addEventListener('keydown', e => {
    if (e.key === 'Enter') {
      const q = searchInput.value.toLowerCase().trim();
      const match = allSeries.find(s =>
        s.title.toLowerCase().includes(q) || s.id.includes(q) || s.category.toLowerCase().includes(q)
      );
      if (match) window.location.hash = `#/series/${match.id}`;
      searchResults.classList.remove('visible');
    }
    if (e.key === 'Escape') searchResults.classList.remove('visible');
  });

  searchBtn.addEventListener('click', () => {
    const q = searchInput.value.toLowerCase().trim();
    const match = allSeries.find(s =>
      s.title.toLowerCase().includes(q) || s.id.includes(q) || s.category.toLowerCase().includes(q)
    );
    if (match) window.location.hash = `#/series/${match.id}`;
    searchResults.classList.remove('visible');
  });

  document.addEventListener('click', e => {
    if (!e.target.closest('.hero-search') && !e.target.closest('#hero-search-results')) {
      searchResults.classList.remove('visible');
    }
  }, { capture: true });
}
