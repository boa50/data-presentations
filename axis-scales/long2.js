import { getChart, addAxis, getMargin, updateXaxis, addCircleLegend, addLegend } from "../node_modules/visual-components/index.js"
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


getData().then(data => {
    const { chart, width, height } = getChart({
        id: 'chart1',
        margin: getMargin({ bottom: 100, top: 16, left: 64, right: 48 })
    })

    const x = d3
        .scaleLinear()
        .domain(d3.extent(data, d => d.gdpPerCapita).map((d, i) => d * [0.7, 1.05][i]))
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
        .duration(100)
        .attr('cx', d => x(d.gdpPerCapita))
        .attr('cy', d => y(d.lifeExpectancy))
        .attr('r', d => radius(d.population))

    addAxis({
        chart,
        height,
        width,
        x,
        y,
        xLabel: 'GDP per capita (PPP$2017)',
        yLabel: 'Life expectancy (years, at birth)',
        xFormat: d => `$${(d >= 10000) ? d3.format('.3s')(d).replace('.0', '') : d
            }`,
        colour: defaultColours.axis,
        // xTickValues: [...Array(9).keys()].map(i => 500 * Math.pow(2, i))
    })

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
        valuesToShow: [maxPopulation * 0.25, maxPopulation * 0.5, maxPopulation],
        xPosition: width - 125,
        yPosition: height - 25,
        colour: defaultColours.axis,
        title: 'Population',
        textFormat: d => d3.format('.2s')(d).replace('G', 'B')
    })
})