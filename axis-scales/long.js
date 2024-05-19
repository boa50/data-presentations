import { getChart, addAxis, getMargin, updateXaxis } from "../node_modules/visual-components/index.js"
import { palette, defaultColours as colours } from "../colours.js"

const data = [
    { group: 'Company A', value: 100 },
    { group: 'Company B', value: 90 },
    { group: 'Our Company', value: 82 },
    { group: 'Company D', value: 79 },
    { group: 'Company E', value: 67 },
    { group: 'Company F', value: 48 },
]

const xAxisType = document.getElementById('chart-xaxis-type')

const { chart, width, height } = getChart({ id: 'chart1', margin: getMargin({ bottom: 100, top: 32, left: 132, right: 48 }) })


let x = d3
    .scaleLinear()
    .domain([0, d3.max(data, d => d.value)])
    .range([0, width])

const y = d3
    .scaleBand()
    .domain(data.map(d => d.group))
    .range([0, height])
    .padding(.1)

const colour = d3
    .scaleOrdinal()
    .range([
        palette.blue + '50',
        palette.blue + '50',
        palette.blue,
        palette.blue + '50',
        palette.blue + '50',
        palette.blue + '50',
    ])

chart
    .selectAll('.data-point')
    .data(data)
    .join('rect')
    .attr('class', 'data-point')
    .attr('x', x(0))
    .attr('y', d => y(d.group))
    .attr('width', d => x(d.value))
    .attr('height', y.bandwidth())
    .attr('fill', colour)

const formatProfit = d => d !== 0 ? `$${d}M` : d

chart
    .selectAll('.data-label')
    .data(data)
    .join('text')
    .attr('class', 'data-label')
    .attr('x', d => x(d.value) - 15)
    .attr('y', d => y(d.group) + y.bandwidth() / 2)
    .attr('font-size', '2rem')
    .attr('font-weight', 700)
    .style('text-anchor', 'end')
    .attr('dominant-baseline', 'middle')
    .attr('fill', 'white')
    .text(d => formatProfit(d.value))

addAxis({
    chart,
    height,
    width,
    x,
    y,
    xLabel: 'Profit',
    xFormat: formatProfit,
    hideXdomain: true,
    hideYdomain: true,
    fontSize: '1rem',
    colour: colours.axis
})

xAxisType.addEventListener('change', () => {
    switch (xAxisType.value) {
        case 'linear':
            x = d3
                .scaleLinear()
                .domain([0, d3.max(data, d => d.value)])
                .range([0, width])
            break;
        case 'log':
            x = d3
                .scaleLog()
                .domain([1, d3.max(data, d => d.value)])
                .range([0, width])
                .base(2)
            break;
        case 'pow':
            x = d3
                .scalePow()
                .domain([0, d3.max(data, d => d.value)])
                .range([0, width])
                .exponent(3.5)
            break;
    }

    chart
        .selectAll('.data-point')
        .data(data)
        .join('rect')
        .attr('class', 'data-point')
        .attr('fill', colour)
        .transition()
        .attr('x', x(0))
        .attr('y', d => y(d.group))
        .attr('width', d => x(d.value))
        .attr('height', y.bandwidth())

    chart
        .selectAll('.data-label')
        .data(data)
        .join('text')
        .attr('class', 'data-label')
        .attr('font-size', '2rem')
        .attr('font-weight', 700)
        .style('text-anchor', 'end')
        .attr('fill', 'white')
        .text(d => formatProfit(d.value))
        .transition()
        .attr('x', d => x(d.value) - 15)
        .attr('y', d => y(d.group) + y.bandwidth() / 2)

    updateXaxis({
        chart,
        x,
        format: formatProfit,
        hideDomain: true
    })
})