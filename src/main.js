import { renderHome } from './home.js';
import { renderSeries } from './seriesPage.js';
import { SERIES_CONFIG } from './config.js';

const app = document.getElementById('app');

function route() {
  const hash = window.location.hash;

  if (!hash || hash === '#' || hash === '#/') {
    renderHome(app);
  } else if (hash.startsWith('#/series/')) {
    const seriesId = hash.replace('#/series/', '');
    renderSeries(app, seriesId);
  } else {
    renderHome(app);
  }
}

// Nav search (persistent across routes)
function initNavSearch() {
  const input = document.getElementById('nav-search-input');
  const allSeries = Object.values(SERIES_CONFIG);

  if (!input) return;

  input.addEventListener('keydown', e => {
    if (e.key !== 'Enter') return;
    const q = input.value.toLowerCase().trim();
    if (!q) return;
    const match = allSeries.find(s =>
      s.title.toLowerCase().includes(q) || s.id.includes(q) || s.category.toLowerCase().includes(q)
    );
    if (match) {
      window.location.hash = `#/series/${match.id}`;
      input.value = '';
    }
  });
}

window.addEventListener('hashchange', route);
initNavSearch();
route();
