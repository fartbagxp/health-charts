import * as d3 from 'd3';

export function createSparkline(container, data, valueKey, color) {
  const width = 320;
  const height = 80;
  const margin = { top: 6, right: 6, bottom: 6, left: 6 };
  const innerWidth = width - margin.left - margin.right;
  const innerHeight = height - margin.top - margin.bottom;

  const parsed = data.map(d => ({
    date: new Date(d.date),
    value: +d[valueKey]
  }));

  const xScale = d3.scaleTime()
    .domain(d3.extent(parsed, d => d.date))
    .range([0, innerWidth]);

  const yScale = d3.scaleLinear()
    .domain([0, d3.max(parsed, d => d.value) * 1.1])
    .range([innerHeight, 0]);

  const line = d3.line()
    .x(d => xScale(d.date))
    .y(d => yScale(d.value))
    .curve(d3.curveMonotoneX);

  const area = d3.area()
    .x(d => xScale(d.date))
    .y0(innerHeight)
    .y1(d => yScale(d.value))
    .curve(d3.curveMonotoneX);

  const svg = d3.select(container)
    .append('svg')
    .attr('width', '100%')
    .attr('height', height)
    .attr('viewBox', `0 0 ${width} ${height}`)
    .attr('preserveAspectRatio', 'xMidYMid meet');

  const g = svg.append('g')
    .attr('transform', `translate(${margin.left},${margin.top})`);

  g.append('path')
    .datum(parsed)
    .attr('d', area)
    .style('fill', color)
    .style('opacity', 0.12);

  g.append('path')
    .datum(parsed)
    .attr('d', line)
    .style('fill', 'none')
    .style('stroke', color)
    .style('stroke-width', 2);
}
