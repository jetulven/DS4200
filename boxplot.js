// Dimensions and margins
const margin = { top: 20, right: 30, bottom: 50, left: 50 };
const width = 500 - margin.left - margin.right;
const height = 400 - margin.top - margin.bottom;

// Create the SVG canvas
const svg = d3.select("#boxplot")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

// Load and process the data
d3.csv("https://raw.githubusercontent.com/mwaskom/seaborn-data/master/iris.csv").then(data => {
    // Convert strings to numeric values
    data.forEach(d => {
        d.petal_length = +d.petal_length;
    });

    // Set up scales
    const xScale = d3.scaleBand()
        .domain(["setosa", "versicolor", "virginica"])
        .range([0, width])
        .padding(0.2);

    const yScale = d3.scaleLinear()
        .domain([0, d3.max(data, d => d.petal_length)]) // Set y domain from 0 to max Petal Length
        .range([height, 0]);

    // Add x-axis
    svg.append("g")
        .attr("transform", `translate(0,${height})`)
        .call(d3.axisBottom(xScale));

    // Add y-axis
    svg.append("g")
        .call(d3.axisLeft(yScale));

    // Add labels
    svg.append("text")
        .attr("x", width / 2)
        .attr("y", height + 40)
        .attr("fill", "black")
        .style("text-anchor", "middle")
        .text("Species");

    svg.append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", -40)
        .attr("x", -height / 2)
        .attr("fill", "black")
        .style("text-anchor", "middle")
        .text("Petal Length");

    // Function to calculate Q1, median, Q3, and IQR
    function rollupFunction(values) {
        values.sort(d3.ascending);
        const q1 = d3.quantile(values, 0.25);
        const median = d3.quantile(values, 0.5);
        const q3 = d3.quantile(values, 0.75);
        const iqr = q3 - q1; // Interquartile Range
        return { q1, median, q3, iqr };
    }

    // Calculate quartiles by species
    const quartilesBySpecies = d3.rollup(data, rollupFunction, d => d.species);

    // Draw the boxes
    quartilesBySpecies.forEach((quartiles, species) => {
        const x = xScale(species);
        const boxWidth = xScale.bandwidth();

        // Draw the box
        svg.append("rect")
            .attr("class", "box")
            .attr("x", x)
            .attr("y", yScale(quartiles.q3))
            .attr("height", yScale(quartiles.q1) - yScale(quartiles.q3))
            .attr("width", boxWidth)
            .attr("fill", "#69b3a2");

        // Draw median line
        svg.append("line")
            .attr("class", "median")
            .attr("x1", x)
            .attr("x2", x + boxWidth)
            .attr("y1", yScale(quartiles.median))
            .attr("y2", yScale(quartiles.median))
            .attr("stroke", "red")
            .attr("stroke-width", 2);

        // Calculate whisker limits
        const whiskerLow = Math.max(0, quartiles.q1 - 1.5 * quartiles.iqr); // Ensure lower limit is not below 0
        const whiskerHigh = quartiles.q3 + 1.5 * quartiles.iqr;

        // Draw whiskers
        svg.append("line")
            .attr("class", "whisker")
            .attr("x1", x + boxWidth / 2)
            .attr("x2", x + boxWidth / 2)
            .attr("y1", yScale(whiskerHigh))
            .attr("y2", yScale(whiskerLow))
            .attr("stroke", "black");
    });
});
