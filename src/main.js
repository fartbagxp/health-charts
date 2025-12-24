import * as d3 from 'd3';
import { LineChart } from './chart.js';

// Initialize the application
async function init() {
  try {
    // Load all three datasets
    const [fluData, covidData, rsvData] = await Promise.all([
      d3.json('/data/flu-cases.json'),
      d3.json('/data/covid-hospitalizations.json'),
      d3.json('/data/rsv-hospitalizations.json')
    ]);

    // Prepare series data for the chart
    const series = [
      {
        name: 'Flu',
        data: fluData,
        color: '#0073e6',
        valueKey: 'cases'
      },
      {
        name: 'COVID-19',
        data: covidData,
        color: '#dc3545',
        valueKey: 'hospitalizations'
      },
      {
        name: 'RSV',
        data: rsvData,
        color: '#28a745',
        valueKey: 'rate'
      }
    ];

    // Create chart
    const chart = new LineChart('chart', {
      width: 960,
      height: 400,
      xKey: 'date',
      formatValue: d => d3.format(',')(d)
    });

    // Update chart with all series
    chart.update(series);

    // Calculate and display metrics
    updateMetrics(series);

    // Setup download button
    const downloadBtn = document.getElementById('download-csv');
    downloadBtn.addEventListener('click', () => {
      chart.downloadCSV('respiratory-viruses.csv');
    });

    // Handle window resize
    let resizeTimer;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        // Recreate chart on resize for responsiveness
        chart.init();
        chart.update(series);
      }, 250);
    });

  } catch (error) {
    console.error('Error loading data:', error);
    document.getElementById('chart').innerHTML = `
      <div style="padding: 2rem; text-align: center; color: #666;">
        <p>Error loading chart data. Please check the console for details.</p>
      </div>
    `;
  }
}

// Update metrics cards
function updateMetrics(seriesArray) {
  // Calculate metrics across all series
  let allValues = [];
  let latestValues = [];

  seriesArray.forEach(series => {
    const values = series.data.map(d => +d[series.valueKey]);
    allValues = allValues.concat(values);
    latestValues.push(values[values.length - 1]);
  });

  const latest = Math.max(...latestValues);
  const peak = Math.max(...allValues);
  const average = Math.round(allValues.reduce((a, b) => a + b, 0) / allValues.length);

  document.getElementById('latest-value').textContent = d3.format(',')(latest);
  document.getElementById('peak-value').textContent = d3.format(',')(peak);
  document.getElementById('avg-value').textContent = d3.format(',')(average);
}

// Start the app when DOM is loaded
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
