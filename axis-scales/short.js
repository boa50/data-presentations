import { getChart, addAxis, getMargin, updateYaxis } from "../node_modules/visual-components/index.js"
import { palette, defaultColours as colours } from "../colours.js"

const data = [
    { group: 'Women', value: 100 },
    { group: 'Men', value: 50 },
]

const xAxisType = document.getElementById('chart-xaxis-type')

const { chart, width, height } = getChart({ id: 'chart1', margin: getMargin({ bottom: 128, top: 32, left: 92, right: 48 }) })

let y = d3
    .scaleLinear()
    .domain([0, d3.max(data, d => d.value)])
    .range([height, 0])

const x = d3
    .scaleBand()
    .domain(data.map(d => d.group))
    .range([0, width])
    .padding(.1)

const colour = d3
    .scaleOrdinal()
    .range([palette.reddishPurple, palette.blue])

chart
    .selectAll('.data-point')
    .data(data)
    .join('rect')
    .attr('class', 'data-point')
    .attr('x', d => x(d.group))
    .attr('y', d => y(d.value))
    .attr('width', x.bandwidth())
    .attr('height', d => height - y(d.value))
    .attr('fill', colour)

const formatWage = d => d !== 0 ? `$${d}k` : d

chart
    .selectAll('.data-label')
    .data(data)
    .join('text')
    .attr('class', 'data-label')
    .attr('x', d => x(d.group) + x.bandwidth() / 2)
    .attr('y', d => y(d.value) + 50)
    .attr('font-size', '2rem')
    .attr('font-weight', 700)
    .style('text-anchor', 'middle')
    .attr('fill', 'white')
    .text(d => formatWage(d.value))

addAxis({
    chart,
    height,
    width,
    x,
    y,
    xLabel: 'Gender',
    yLabel: 'Average Wage',
    yFormat: formatWage,
    hideXdomain: true,
    hideYdomain: true,
    fontSize: '1rem',
    colour: colours.axis
})

xAxisType.addEventListener('change', () => {
    let tickValues
    switch (xAxisType.value) {
        case 'linear':
            y = d3
                .scaleLinear()
                .domain([0, d3.max(data, d => d.value)])
                .range([height, 0])
            break;
        case 'log':
            tickValues = [1, 10, 20, 30, 40, 50, 60, 80, 100]

            y = d3
                .scaleLog()
                .domain([1, d3.max(data, d => d.value)])
                .range([height, 0])
                .base(2)
            break;
        case 'pow':
            tickValues = [0, 40, 50, 60, 70, 80, 90, 100]

            y = d3
                .scalePow()
                .domain([0, d3.max(data, d => d.value)])
                .range([height, 0])
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
        .attr('x', d => x(d.group))
        .attr('y', d => y(d.value))
        .attr('width', x.bandwidth())
        .attr('height', d => height - y(d.value))

    chart
        .selectAll('.data-label')
        .data(data)
        .join('text')
        .attr('class', 'data-label')
        .attr('font-size', '2rem')
        .attr('font-weight', 700)
        .style('text-anchor', 'middle')
        .attr('fill', 'white')
        .text(d => formatWage(d.value))
        .transition()
        .attr('x', d => x(d.group) + x.bandwidth() / 2)
        .attr('y', d => y(d.value) + 50)

    updateYaxis({
        chart,
        y,
        format: formatWage,
        tickValues,
        hideDomain: true
    })
})