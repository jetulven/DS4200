// Define the dimensions and margins for the SVG canvas
let width = 600;
let height = 400;
let margin = { top: 30, bottom: 50, left: 50, right: 150 }; // Increased right margin for the legend

// Create the SVG element
let svg = d3.select("body")
  .append("svg")
  .attr("width", width)
  .attr("height", height)
  .style("background", "lightyellow");

// Load and process the data
d3.csv("https://raw.githubusercontent.com/mwaskom/seaborn-data/master/iris.csv").then(data => {
  // Convert petal length and width to numeric types
  data.forEach(d => {
    d.petal_length = +d.petal_length;
    d.petal_width = +d.petal_width;
  });

  // Define scales
  let xScale = d3.scaleLinear()
    .domain([0, d3.max(data, d => d.petal_length)]) // X-axis range based on petal length
    .range([margin.left, width - margin.right]);

  let yScale = d3.scaleLinear()
    .domain([0, d3.max(data, d => d.petal_width)]) // Y-axis range based on petal width
    .range([height - margin.bottom, margin.top]);

  let colorScale = d3.scaleOrdinal(d3.schemeCategory10); // Color scale for species

  // Draw circles for each data point
  svg.selectAll("circle")
    .data(data)
    .enter()
    .append("circle")
    .attr("cx", d => xScale(d.petal_length))
    .attr("cy", d => yScale(d.petal_width))
    .attr("r", 5) // Radius of the circles
    .attr("fill", d => colorScale(d.species)); // Color based on species

  // Add x-axis
  svg.append("g")
    .attr("transform", `translate(0, ${height - margin.bottom})`)
    .call(d3.axisBottom(xScale));

  // Add y-axis
  svg.append("g")
    .attr("transform", `translate(${margin.left}, 0)`)
    .call(d3.axisLeft(yScale));

  // Add axis labels
  svg.append("text")
    .attr("x", width / 2)
    .attr("y", height - 10)
    .text("Petal Length")
    .style("text-anchor", "middle");

  svg.append("text")
    .attr("x", 0 - (height / 2))
    .attr("y", margin.left / 2)
    .style("text-anchor", "middle")
    .attr("transform", "rotate(-90)")
    .text("Petal Width");

  // Add legend
  let legend = svg.selectAll(".legend")
    .data(colorScale.domain())
    .enter().append("g")
    .attr("class", "legend")
    .attr("transform", (d, i) => `translate(${width - margin.right + 20}, ${i * 20 + 20})`); // Adjusted position

  // Legend circles
  legend.append("circle")
    .attr("cx", 0) // Position circle
    .attr("cy", 10) // Position circle
    .attr("r", 6)
    .style("fill", colorScale);

  // Legend text
  legend.append("text")
    .attr("x", 10) // Adjusted x position for text
    .attr("y", 15) // Adjusted y position for text
    .text(d => d);
});
