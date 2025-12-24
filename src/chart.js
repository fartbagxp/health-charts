import * as d3 from 'd3';

export class LineChart {
  constructor(containerId, options = {}) {
    this.containerId = containerId;
    this.series = []; // Array of {name, data, color, valueKey}

    // Chart dimensions and margins (FRED-style spacing)
    this.margin = { top: 20, right: 130, bottom: 50, left: 80 };
    this.width = options.width || 960;
    this.height = options.height || 400;

    // Configuration
    this.xKey = options.xKey || 'date';
    this.formatValue = options.formatValue || (d => d3.format(',')(d));

    this.init();
  }

  init() {
    const container = d3.select(`#${this.containerId}`);

    // Clear any existing content
    container.selectAll('*').remove();

    // Create SVG
    this.svg = container
      .append('svg')
      .attr('width', '100%')
      .attr('height', this.height)
      .attr('viewBox', `0 0 ${this.width} ${this.height}`)
      .attr('preserveAspectRatio', 'xMidYMid meet');

    // Create main chart group
    this.chartGroup = this.svg.append('g')
      .attr('transform', `translate(${this.margin.left},${this.margin.top})`);

    // Chart area dimensions
    this.innerWidth = this.width - this.margin.left - this.margin.right;
    this.innerHeight = this.height - this.margin.top - this.margin.bottom;

    // Create scales
    this.xScale = d3.scaleTime()
      .range([0, this.innerWidth]);

    this.yScale = d3.scaleLinear()
      .range([this.innerHeight, 0]);

    // Create axes
    this.xAxis = d3.axisBottom(this.xScale)
      .ticks(8)
      .tickFormat(d3.timeFormat('%b %Y'));

    this.yAxis = d3.axisLeft(this.yScale)
      .ticks(6)
      .tickFormat(this.formatValue);

    // Add COVID period shaded region (behind everything else)
    this.covidRect = this.chartGroup.append('rect')
      .attr('class', 'covid-period')
      .attr('y', 0)
      .attr('height', this.innerHeight)
      .style('fill', '#d3d3d3')
      .style('opacity', 0.3);

    // Add grid lines (FRED-style)
    this.xGrid = this.chartGroup.append('g')
      .attr('class', 'grid x-grid')
      .attr('transform', `translate(0,${this.innerHeight})`);

    this.yGrid = this.chartGroup.append('g')
      .attr('class', 'grid y-grid');

    // Add axes groups
    this.xAxisGroup = this.chartGroup.append('g')
      .attr('class', 'axis x-axis')
      .attr('transform', `translate(0,${this.innerHeight})`);

    this.yAxisGroup = this.chartGroup.append('g')
      .attr('class', 'axis y-axis');

    // Add group for lines
    this.linesGroup = this.chartGroup.append('g')
      .attr('class', 'lines');

    // Add legend group
    this.legendGroup = this.svg.append('g')
      .attr('class', 'legend')
      .attr('transform', `translate(${this.width - this.margin.right + 20}, ${this.margin.top})`);

    // Add hover elements
    this.hoverLine = this.chartGroup.append('line')
      .attr('class', 'hover-line')
      .attr('y1', 0)
      .attr('y2', this.innerHeight);

    this.hoverCircle = this.chartGroup.append('circle')
      .attr('class', 'hover-circle')
      .attr('r', 5);

    // Add tooltip
    this.tooltip = d3.select('body').append('div')
      .attr('class', 'tooltip');

    // Add invisible overlay for mouse tracking
    this.chartGroup.append('rect')
      .attr('class', 'overlay')
      .attr('width', this.innerWidth)
      .attr('height', this.innerHeight)
      .style('fill', 'none')
      .style('pointer-events', 'all')
      .on('mousemove', (event) => this.handleMouseMove(event))
      .on('mouseout', () => this.handleMouseOut());
  }

  update(seriesArray) {
    // seriesArray format: [{name: 'Flu', data: [...], color: '#color', valueKey: 'cases'}, ...]
    this.series = seriesArray;

    // Parse dates and values for all series
    this.series.forEach(series => {
      series.data.forEach(d => {
        d.parsedDate = new Date(d[this.xKey]);
        d.value = +d[series.valueKey];
      });
    });

    // Flatten all data points to find domain
    const allData = this.series.flatMap(s => s.data);

    // Update scales
    this.xScale.domain(d3.extent(allData, d => d.parsedDate));

    const yMax = d3.max(allData, d => d.value);
    this.yScale.domain([0, yMax * 1.1]); // Add 10% padding to top

    // Update COVID period shaded region
    const covidStart = new Date('2020-03-01'); // COVID-19 pandemic start
    const covidEnd = new Date('2023-05-11');   // WHO declared end of emergency

    this.covidRect
      .attr('x', this.xScale(covidStart))
      .attr('width', this.xScale(covidEnd) - this.xScale(covidStart));

    // Update grid
    this.xGrid.call(
      d3.axisBottom(this.xScale)
        .ticks(8)
        .tickSize(-this.innerHeight)
        .tickFormat('')
    );

    this.yGrid.call(
      d3.axisLeft(this.yScale)
        .ticks(6)
        .tickSize(-this.innerWidth)
        .tickFormat('')
    );

    // Update axes
    this.xAxisGroup.transition()
      .duration(750)
      .call(this.xAxis);

    this.yAxisGroup.transition()
      .duration(750)
      .call(this.yAxis);

    // Create line generator
    const line = d3.line()
      .x(d => this.xScale(d.parsedDate))
      .y(d => this.yScale(d.value))
      .curve(d3.curveMonotoneX); // Smooth curve like FRED

    // Update lines using data join
    const lines = this.linesGroup.selectAll('.line')
      .data(this.series, d => d.name);

    // Remove old lines
    lines.exit().remove();

    // Add new lines
    const linesEnter = lines.enter()
      .append('path')
      .attr('class', 'line')
      .style('stroke', d => d.color)
      .style('fill', 'none')
      .style('stroke-width', 2);

    // Update all lines
    linesEnter.merge(lines)
      .datum(d => d.data)
      .transition()
      .duration(750)
      .attr('d', line);

    // Update legend
    this.updateLegend();

    // Update bisector for hover
    this.bisect = d3.bisector(d => d.parsedDate).left;
  }

  updateLegend() {
    const legendItems = this.legendGroup.selectAll('.legend-item')
      .data(this.series, d => d.name);

    legendItems.exit().remove();

    const legendEnter = legendItems.enter()
      .append('g')
      .attr('class', 'legend-item')
      .attr('transform', (d, i) => `translate(0, ${i * 25})`);

    legendEnter.append('line')
      .attr('x1', 0)
      .attr('x2', 20)
      .attr('y1', 0)
      .attr('y2', 0)
      .style('stroke', d => d.color)
      .style('stroke-width', 2);

    legendEnter.append('text')
      .attr('x', 25)
      .attr('y', 0)
      .attr('dy', '0.35em')
      .style('font-size', '12px')
      .text(d => d.name);
  }

  handleMouseMove(event) {
    if (!this.series || this.series.length === 0) return;

    const [mouseX] = d3.pointer(event);
    const x0 = this.xScale.invert(mouseX);

    // Find closest data point from first series (they should all have similar dates)
    const firstSeries = this.series[0].data;
    const i = this.bisect(firstSeries, x0, 1);
    const d0 = firstSeries[i - 1];
    const d1 = firstSeries[i];

    if (!d0 && !d1) return;

    const d = x0 - (d0?.parsedDate || 0) > ((d1?.parsedDate || 0) - x0) ? d1 : d0;
    if (!d) return;

    const x = this.xScale(d.parsedDate);

    // Update hover line
    this.hoverLine
      .attr('x1', x)
      .attr('x2', x)
      .style('opacity', 1);

    // Hide the single hover circle (we'll show one per series if needed)
    this.hoverCircle.style('opacity', 0);

    // Build tooltip content with all series values
    let tooltipContent = `<div class="tooltip-date">${d3.timeFormat('%B %Y')(d.parsedDate)}</div>`;

    this.series.forEach(series => {
      // Find the data point closest to this date in each series
      const seriesI = this.bisect(series.data, x0, 1);
      const seriesD0 = series.data[seriesI - 1];
      const seriesD1 = series.data[seriesI];

      if (!seriesD0 && !seriesD1) return;

      const seriesD = x0 - (seriesD0?.parsedDate || 0) > ((seriesD1?.parsedDate || 0) - x0) ? seriesD1 : seriesD0;

      if (seriesD && seriesD.value !== undefined) {
        tooltipContent += `
          <div class="tooltip-value" style="color: ${series.color}">
            <strong>${series.name}:</strong> ${this.formatValue(seriesD.value)}
          </div>
        `;
      }
    });

    this.tooltip
      .html(tooltipContent)
      .classed('visible', true)
      .style('left', `${event.pageX + 15}px`)
      .style('top', `${event.pageY - 15}px`);
  }

  handleMouseOut() {
    this.hoverLine.style('opacity', 0);
    this.hoverCircle.style('opacity', 0);
    this.tooltip.classed('visible', false);
  }

  destroy() {
    if (this.tooltip) {
      this.tooltip.remove();
    }
  }

  // Utility function to download data as CSV
  downloadCSV(filename = 'data.csv') {
    if (!this.series || this.series.length === 0) return;

    // Create headers: date, series1_name, series2_name, ...
    const headers = [this.xKey, ...this.series.map(s => s.name)];

    // Collect all unique dates
    const allDates = new Set();
    this.series.forEach(series => {
      series.data.forEach(d => allDates.add(d[this.xKey]));
    });

    // Sort dates
    const sortedDates = Array.from(allDates).sort();

    // Build rows
    const rows = sortedDates.map(date => {
      const row = [date];
      this.series.forEach(series => {
        const dataPoint = series.data.find(d => d[this.xKey] === date);
        row.push(dataPoint ? dataPoint[series.valueKey] : '');
      });
      return row.join(',');
    });

    const csvContent = [headers.join(','), ...rows].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    window.URL.revokeObjectURL(url);
  }
}
