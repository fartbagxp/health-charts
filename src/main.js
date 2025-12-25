import * as d3 from 'd3';
import { LineChart } from './chart.js';

// Initialize the application
async function init() {
  try {
    // Load all three datasets using BASE_URL for proper path resolution
    const baseUrl = import.meta.env.BASE_URL;
    const [fluData, covidData, rsvData] = await Promise.all([
      d3.json(`${baseUrl}data/flu-cases.json`),
      d3.json(`${baseUrl}data/covid-hospitalizations.json`),
      d3.json(`${baseUrl}data/rsv-hospitalizations.json`)
    ]);

    // Create Flu chart
    const fluChart = new LineChart('chart-flu', {
      width: 960,
      height: 400,
      xKey: 'date',
      formatValue: d => d3.format(',')(d)
    });
    fluChart.update([{
      name: 'Flu',
      data: fluData,
      color: '#0073e6',
      valueKey: 'cases'
    }]);
    updateMetrics('flu', fluData, 'cases');

    // Create COVID-19 chart
    const covidChart = new LineChart('chart-covid', {
      width: 960,
      height: 400,
      xKey: 'date',
      formatValue: d => d3.format(',')(d)
    });
    covidChart.update([{
      name: 'COVID-19',
      data: covidData,
      color: '#dc3545',
      valueKey: 'hospitalizations'
    }]);
    updateMetrics('covid', covidData, 'hospitalizations');

    // Create RSV chart
    const rsvChart = new LineChart('chart-rsv', {
      width: 960,
      height: 400,
      xKey: 'date',
      formatValue: d => d3.format('.1f')(d)
    });
    rsvChart.update([{
      name: 'RSV',
      data: rsvData,
      color: '#28a745',
      valueKey: 'rate'
    }]);
    updateMetrics('rsv', rsvData, 'rate');

    // Setup download buttons
    document.getElementById('download-flu-csv').addEventListener('click', () => {
      fluChart.downloadCSV('flu-cases.csv');
    });

    document.getElementById('download-covid-csv').addEventListener('click', () => {
      covidChart.downloadCSV('covid-hospitalizations.csv');
    });

    document.getElementById('download-rsv-csv').addEventListener('click', () => {
      rsvChart.downloadCSV('rsv-rates.csv');
    });

    // Handle window resize
    let resizeTimer;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        // Recreate all charts on resize
        fluChart.init();
        fluChart.update([{ name: 'Flu', data: fluData, color: '#0073e6', valueKey: 'cases' }]);

        covidChart.init();
        covidChart.update([{ name: 'COVID-19', data: covidData, color: '#dc3545', valueKey: 'hospitalizations' }]);

        rsvChart.init();
        rsvChart.update([{ name: 'RSV', data: rsvData, color: '#28a745', valueKey: 'rate' }]);
      }, 250);
    });

  } catch (error) {
    console.error('Error loading data:', error);
    const errorMessage = `
      <div style="padding: 2rem; text-align: center; color: #666;">
        <p>Error loading chart data. Please check the console for details.</p>
      </div>
    `;
    document.getElementById('chart-flu').innerHTML = errorMessage;
    document.getElementById('chart-covid').innerHTML = errorMessage;
    document.getElementById('chart-rsv').innerHTML = errorMessage;
  }
}

// Update metrics cards
function updateMetrics(prefix, data, valueKey) {
  const values = data.map(d => +d[valueKey]);

  const latest = values[values.length - 1];
  const peak = Math.max(...values);
  const average = values.reduce((a, b) => a + b, 0) / values.length;

  // Format based on the type of data
  const formatter = valueKey === 'rate' ? d3.format('.1f') : d3.format(',');

  document.getElementById(`${prefix}-latest-value`).textContent = formatter(latest);
  document.getElementById(`${prefix}-peak-value`).textContent = formatter(peak);
  document.getElementById(`${prefix}-avg-value`).textContent = formatter(average);
}

// Start the app when DOM is loaded
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
