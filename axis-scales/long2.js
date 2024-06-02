import { getChart, addAxis, getMargin, updateXaxis, addCircleLegend, addLegend, addHighlightTooltip } from "../node_modules/visual-components/index.js"
import { palette, defaultColours } from "../colours.js"

const getData = () =>
    d3.csv('https://raw.githubusercontent.com/boa50/datavis-for-everyone/master/world-population-scrollingtelling/data/dataset.csv')
        .then(d => d
            .filter(v => v.year === '2023')
            .map(v => {
                return {
                    ...v,
                    population: +v.population,
                    lifeExpectancy: +v.lifeExpectancy,
                    gdpPerCapita: +v.gdpPerCapita
                }
            })
        )

const formatGdp = d => `$${(d >= 10000) ? d3.format('.3s')(d).replace('.0', '') : d}`
const xTickValues = [...Array(9).keys()].map(i => 500 * Math.pow(2, i))

getData().then(data => {
    const { chart, width, height } = getChart({
        id: 'chart1',
        margin: getMargin({ bottom: 100, top: 16, left: 64, right: 48 })
    })

    const xExtent = d3.extent(data, d => d.gdpPerCapita).map((d, i) => d * [0.7, 1.05][i])

    const x = d3
        .scaleLinear()
        .domain(xExtent)
        .range([0, width])

    const y = d3
        .scaleLinear()
        .domain(d3.extent(data, d => d.lifeExpectancy).map((d, i) => d * [0.99, 1.02][i]))
        .range([height, 0])

    const radius = d3
        .scaleSqrt()
        .domain(d3.extent(data, d => d.population))
        .range([3, 40])


    const uniqueRegions = [...new Set(data.map(d => d.region))].sort()
    const continentColours = [palette.amber, palette.blue, palette.vermillion, palette.reddishPurple]
    const colour = d3
        .scaleOrdinal()
        .domain(uniqueRegions)
        .range(continentColours)

    updateChart(chart, data, x, y, radius, colour)

    addAxis({
        chart,
        height,
        width,
        x,
        y,
        xLabel: 'GDP per capita (PPP$2017)',
        yLabel: 'Life expectancy (years, at birth)',
        xFormat: formatGdp,
        colour: defaultColours.axis,
        xTickValues
    })
    updateXaxis({ chart, x, format: formatGdp, tickValues: xTickValues })

    addLegend({
        chart,
        legends: uniqueRegions.map(d => d.charAt(0).toUpperCase() + d.substr(1)),
        colours: continentColours,
        xPosition: 8,
        yPosition: 16
    })

    const maxPopulation = d3.max(data, d => d.population)
    addCircleLegend({
        chart,
        sizeScale: radius,
        valuesToShow: [maxPopulation * 0.1, maxPopulation * 0.4, maxPopulation],
        xPosition: width - 125,
        yPosition: height - 25,
        colour: defaultColours.axis,
        title: 'Population',
        textFormat: d => d3.format('.2s')(d).replace('G', 'B')
    })

    addHighlightTooltip({
        chart,
        htmlText: d => `
        <strong>${d.country}</strong>   
        <div style="display: flex; justify-content: space-between">
            <span>Population:&emsp;&emsp;</span>
            <span>${d3.formatLocale({ thousands: ' ', grouping: [3] }).format(',')(d.population)}</span>
        </div>
        <div style="display: flex; justify-content: space-between">
            <span>Life Expectancy:&emsp;&emsp;</span>
            <span>${d.lifeExpectancy} years</br></span>
        </div>
        <div style="display: flex; justify-content: space-between">
            <span>GDP per Capita:&emsp;&emsp;</span>
            <span>$${d.gdpPerCapita}</span>
        </div>
        `,
        elements: chart.selectAll('.country-bubbles'),
        fadedOpacity: 0.5,
        chartWidth: width,
        chartHeight: height
    })

    addXaxisListener(chart, data, width, xExtent, y, radius, colour)
})

function updateChart(chart, data, x, y, radius, colour) {
    chart
        .selectAll('.country-bubbles')
        .data(data)
        .join('circle')
        .attr('class', 'country-bubbles')
        .style('fill', d => colour(d.region))
        .attr('stroke', '#6b7280')
        .attr('stroke-width', 0.5)
        .style('opacity', 0.75)
        .transition('updateChart')
        .duration(500)
        .attr('cx', d => x(d.gdpPerCapita))
        .attr('cy', d => y(d.lifeExpectancy))
        .attr('r', d => radius(d.population))
}

function addXaxisListener(chart, data, width, xExtent, y, radius, colour) {
    const xAxisType = document.getElementById('chart-xaxis-type')

    xAxisType.addEventListener('change', () => {
        let x

        switch (xAxisType.value) {
            case 'linear':
                x = d3
                    .scaleLinear()
                    .domain(xExtent)
                    .range([0, width])
                break;
            case 'log':
                x = d3
                    .scaleLog()
                    .domain(xExtent)
                    .range([0, width])
                    .base(2)
                break;
        }

        updateChart(chart, data, x, y, radius, colour)

        updateXaxis({ chart, x, format: formatGdp, tickValues: xTickValues })
    })
}