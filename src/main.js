import * as d3 from 'd3';
import { LineChart } from './chart.js';

// Initialize the application
async function init() {
  try {
    // Load data
    const data = await d3.json('/data/flu-cases.json');

    // Create chart
    const chart = new LineChart('chart', {
      width: 960,
      height: 400,
      xKey: 'date',
      yKey: 'cases',
      lineColor: '#0073e6',
      formatValue: d => d3.format(',')(d)
    });

    // Update chart with data
    chart.update(data);

    // Calculate and display metrics
    updateMetrics(data);

    // Setup download button
    const downloadBtn = document.getElementById('download-csv');
    downloadBtn.addEventListener('click', () => {
      chart.downloadCSV('flu-cases.csv');
    });

    // Handle window resize
    let resizeTimer;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        // Recreate chart on resize for responsiveness
        chart.init();
        chart.update(data);
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
function updateMetrics(data) {
  const values = data.map(d => d.cases);

  const latest = values[values.length - 1];
  const peak = Math.max(...values);
  const average = Math.round(values.reduce((a, b) => a + b, 0) / values.length);

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
