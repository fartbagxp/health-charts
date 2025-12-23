import * as d3 from 'd3';

export class LineChart {
  constructor(containerId, options = {}) {
    this.containerId = containerId;
    this.data = [];

    // Chart dimensions and margins (FRED-style spacing)
    this.margin = { top: 20, right: 30, bottom: 50, left: 60 };
    this.width = options.width || 960;
    this.height = options.height || 400;

    // Configuration
    this.xKey = options.xKey || 'date';
    this.yKey = options.yKey || 'value';
    this.lineColor = options.lineColor || '#0073e6';
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

    // Add line path
    this.linePath = this.chartGroup.append('path')
      .attr('class', 'line')
      .style('stroke', this.lineColor);

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

  update(data) {
    this.data = data;

    // Parse dates
    this.data.forEach(d => {
      d.parsedDate = new Date(d[this.xKey]);
      d.value = +d[this.yKey];
    });

    // Update scales
    this.xScale.domain(d3.extent(this.data, d => d.parsedDate));

    const yMax = d3.max(this.data, d => d.value);
    this.yScale.domain([0, yMax * 1.1]); // Add 10% padding to top

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

    // Update line
    this.linePath
      .datum(this.data)
      .transition()
      .duration(750)
      .attr('d', line);

    // Update bisector for hover
    this.bisect = d3.bisector(d => d.parsedDate).left;
  }

  handleMouseMove(event) {
    if (!this.data || this.data.length === 0) return;

    const [mouseX] = d3.pointer(event);
    const x0 = this.xScale.invert(mouseX);
    const i = this.bisect(this.data, x0, 1);
    const d0 = this.data[i - 1];
    const d1 = this.data[i];

    if (!d0 && !d1) return;

    const d = x0 - (d0?.parsedDate || 0) > ((d1?.parsedDate || 0) - x0) ? d1 : d0;

    if (!d) return;

    const x = this.xScale(d.parsedDate);
    const y = this.yScale(d.value);

    // Update hover elements
    this.hoverLine
      .attr('x1', x)
      .attr('x2', x)
      .style('opacity', 1);

    this.hoverCircle
      .attr('cx', x)
      .attr('cy', y)
      .style('opacity', 1);

    // Update tooltip
    const tooltipContent = `
      <div class="tooltip-date">${d3.timeFormat('%B %Y')(d.parsedDate)}</div>
      <div class="tooltip-value">${this.formatValue(d.value)} cases</div>
    `;

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
    const headers = [this.xKey, this.yKey];
    const csvContent = [
      headers.join(','),
      ...this.data.map(d => `${d[this.xKey]},${d[this.yKey]}`)
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    window.URL.revokeObjectURL(url);
  }
}
