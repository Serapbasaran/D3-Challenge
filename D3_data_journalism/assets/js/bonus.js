var svgWidth = 960;
var svgHeight = 620;

var margin = {
  top: 20,
  right: 40,
  bottom: 150,
  left: 100
};

var width = svgWidth - margin.left - margin.right;
var height = svgHeight - margin.top - margin.bottom;

// Create an SVG wrapper, append an SVG group that will hold our chart, and shift the latter by left and top margins.
var svg = d3.select("#scatter")
  .append("svg")
  .attr("width", svgWidth)
  .attr("height", svgHeight);

var chartGroup = svg.append("g")
  .attr("transform", `translate(${margin.left}, ${margin.top})`);

// Initial Params
var chosenXAxis = "poverty";
var chosenYAxis = "healthcare";

// function used for updating x-scale var upon click on axis label
function xScale(censusData, chosenXAxis) {
    // create scales
    var xLinearScale = d3.scaleLinear()
      .domain([d3.min(censusData, d => d[chosenXAxis]) * 0.8,
        d3.max(censusData, d => d[chosenXAxis]) * 1.2
      ])
      .range([0, width]);
  
    return xLinearScale;
    }
      
  // function used for updating y-scale var upon click on axis label
function yScale(censusData, chosenYAxis) {
    // create scales
    var yLinearScale = d3.scaleLinear()
      .domain([d3.min(censusData, d => d[chosenYAxis]) * 0.8,
        d3.max(censusData, d => d[chosenYAxis]) * 1.2
      ])
      .range([height, 0]);
  
    return yLinearScale;
    }

  // function used for updating xAxis var upon click on axis label
function renderXAxes(newXScale, xAxis) {
    var bottomAxis = d3.axisBottom(newXScale);
  
    xAxis.transition()
      .duration(1000)
      .call(bottomAxis);
  
    return xAxis;
  }
    
    // function used for updating yAxis var upon click on axis label
function renderYAxes(newYScale, yAxis) {
    var leftAxis = d3.axisLeft(newYScale);
  
    yAxis.transition()
      .duration(1000)
      .call(leftAxis);
  
    return yAxis;
  }
  
 // function used for updating circles group with a transition to
// new circles
function renderCircles(circlesGroup, newXScale, chosenXAxis, newYScale, chosenYAxis) {

    circlesGroup.transition()
      .duration(1000)
      .attr("cx", d => newXScale(d[chosenXAxis]))
      .attr("cy", d => newYScale(d[chosenYAxis]))

  
    return circlesGroup;
  }
 // function used for updating text in the circles group with the state abbrevation 
function renderText(circlesText, newXScale, chosenXAxis, newYScale, chosenYAxis) {

    circlesText.transition()
      .duration(1000)
      .attr("x", d => newXScale(d[chosenXAxis]))
      .attr("y", d => newYScale(d[chosenYAxis]))

  
    return circlesText;
  }

  // function used for updating circles group with new tooltip
function updateToolTip(chosenXAxis, chosenYAxis, circlesGroup) {

    var xlabel;
  
    if (chosenXAxis === "poverty") {
      xlabel = "Poverty:";
    }
    else if (chosenXAxis === "income") {
       xlabel = "Income:";}
      
    else {
      xlabel = "Age:";
    }
  
    // Select y-label
    // Lacking healthcare
    var ylabel;
    if (chosenYAxis === "healthcare") {
          ylabel = "No Healthcare:"
    }
    // Obesity
    else if (chosenYAxis === "obesity") {
          ylabel = "Obesity:"
    }
    // Smokers
    else {
        ylabel = "Smokers:"
    }


    var toolTip = d3.tip()
      .attr("class", "d3-tip")
      .offset([-8, 0])
      .html(function(d) {
        return (`${d.state}<br>${xlabel} ${d[chosenXAxis]}<br>${ylabel} ${d[chosenYAxis]}`);
      });
  
    circlesGroup.call(toolTip);

    circlesGroup.on("mouseover", toolTip.show)
    .on("mouseout", toolTip.hide);

      return circlesGroup;
  }

d3.csv("assets/data/data.csv").then(function(censusData) {
 
    // parse data
    censusData.forEach(function(data) {
      data.poverty = +data.poverty;
      data.age = +data.age;
      data.income = +data.income;
      data.healthcare = +data.healthcare;
      data.obesity = +data.obesity;
      data.smokes = +data.smokes;
    });
  
    // xLinearScale function above csv import
    var xLinearScale = xScale(censusData, chosenXAxis);
  
    // Create y scale function
    var yLinearScale = yScale(censusData, chosenYAxis);
  
    // Create initial axis functions
    var bottomAxis = d3.axisBottom(xLinearScale);
    var leftAxis = d3.axisLeft(yLinearScale);
  
    // append x axis
    var xAxis = chartGroup.append("g")
      .classed("x-axis", true)
      .attr("transform", `translate(0, ${height})`)
      .call(bottomAxis);
  
    // append y axis
    var yAxis = chartGroup.append("g")
        .classed("y-axis", true)
        .call(leftAxis);
  
     // append initial circles
    var circlesGroup = chartGroup.selectAll("circle")
    .data(censusData)
    .enter()
    .append("circle")
    .classed("stateCircle", true)
    .attr("cx", d => xLinearScale(d[chosenXAxis]))
    .attr("cy", d => yLinearScale(d[chosenYAxis]))
    .attr("r", 12)
    .attr("opacity", ".5");

     // append state abbr to circle groups 
    var circlesText = chartGroup.selectAll(".stateText")
    .data(censusData)
    .enter()
    .append("text")
    .classed("stateText", true)
    .attr("x", d => xLinearScale(d[chosenXAxis]))
    .attr("y", d => yLinearScale(d[chosenYAxis]))
    .attr("font-size", "10px")
    .text(function(d){return d.abbr});

     // Create groups for three different x-axis labels
    var xlabelsGroup = chartGroup.append("g")
    .attr("transform", `translate(${width / 2}, ${height + 20 + margin.top})`);

    var povertyLabel = xlabelsGroup.append("text")
    .attr("x", 0)
    .attr("y", 25)
    .classed("aText", true)
    .attr("value", "poverty") // value to grab for event listener
    .classed("active", true)
    .text("In Poverty (%)");

    var incomeLabel = xlabelsGroup.append("text")
    .attr("x", 0)
    .attr("y", 50)
    .classed("aText", true)
    .attr("value", "income") // value to grab for event listener
    .classed("inactive", true)
    .text(" Avg Household Income");

    var ageLabel = xlabelsGroup.append("text")
    .attr("x", 0)
    .attr("y", 75)
    .classed("aText", true)
    .attr("value", "age") // value to grab for event listener
    .classed("inactive", true)
    .text(" Avg Age");
    
     // Create groups for three different y-axis labels
     var ylabelsGroup = chartGroup.append("g")

    var healthcareLabel = ylabelsGroup.append("text")
    .attr("transform", "rotate(-90)")
    .attr("y", -40)
    .attr("x", 0 - (height / 2))
    .attr("dy", "1em")
    .classed("aText", true)
    .attr("value", "healthcare") // value to grab for event listener
    .classed("active", true)
    .text("Lacks Healthcare (%)");

    var obesityLabel = ylabelsGroup.append("text")
    .attr("transform", "rotate(-90)")
    .attr("y", -60)
    .attr("x", 0 - (height / 2))
    .attr("dy", "1em")
    .classed("aTtext", true)
    .attr("value", "obesity") // value to grab for event listener
    .classed("inactive", true)
    .text(" Obesity (%)");

    var smokesLabel = ylabelsGroup.append("text")
    .attr("transform", "rotate(-90)")
    .attr("y", -80)
    .attr("x", 0 - (height / 2))
    .attr("dy", "1em")
    .classed("aTtext", true)
    .attr("value", "smokes") // value to grab for event listener
    .classed("inactive", true)
    .text("Smoking (%)");

     // updateToolTip function with data
    var circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);

     // x axis labels event listener
    xlabelsGroup.selectAll("text")
    .on("click", function() {
      // get value of selection
      var value = d3.select(this).attr("value");
      if (value != chosenXAxis) {

        // replaces chosenXAxis with value
        chosenXAxis = value;

        // console.log(chosenXAxis)

        // functions here found above csv import
        // updates x scale for new data
        xLinearScale = xScale(censusData, chosenXAxis);

        // updates x axis with transition
        xAxis = renderXAxes(xLinearScale, xAxis);

        // updates circles with new x values
        circlesGroup = renderCircles(circlesGroup, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis);
        
        // updates text in the circles group 
        circlesText = renderText(circlesText, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis)

        // updates tooltips with new info
        circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);
        
        // changes classes to change bold text
        if (chosenXAxis === "poverty") {
          povertyLabel.classed("active", true).classed("inactive", false);
          ageLabel.classed("active", false).classed("inactive", true);
          incomeLabel.classed("active", false).classed("inactive", true);
        }
        else if  (chosenXAxis === "age") {
          povertyLabel.classed("active", false).classed("inactive", true);
          ageLabel.classed("active", true).classed("inactive", false);
          incomeLabel.classed("active", false).classed("inactive", true);
          }              
        else {            
          povertyLabel.classed("active", false).classed("inactive", true);
          ageLabel.classed("active", false).classed("inactive", true);
          incomeLabel.classed("active", true).classed("inactive", false);
        }
      }
    });

     // y axis labels event listener
    ylabelsGroup.selectAll("text")
    .on("click", function() {
      // get value of selection
      var value = d3.select(this).attr("value");
      if (value != chosenYAxis) {

        // replaces chosenXAxis with value
        chosenYAxis = value;

        // console.log(chosenXAxis)

        // functions here found above csv import
        // updates x scale for new data
        yLinearScale = yScale(censusData, chosenYAxis);

        // updates x axis with transition
        yAxis = renderYAxes(yLinearScale, yAxis);

        // updates circles with new x values
        circlesGroup = renderCircles(circlesGroup, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis);

        // updates text in the circles group 
        circlesText = renderText(circlesText, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis)

        // updates tooltips with new info
        circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);

        // changes classes to change bold text
        if (chosenYAxis === "healthcare") {
          healthcareLabel.classed("active", true).classed("inactive", false);
          smokesLabel.classed("active", false).classed("inactive", true);
          obesityLabel.classed("active", false).classed("inactive", true);
        }
        else if (chosenYAxis === "smokes") {
          healthcareLabel.classed("active", false).classed("inactive", true);
          smokesLabel.classed("active", true).classed("inactive", false);
          obesityLabel.classed("active", false).classed("inactive", true);
          }  
          
        else {            
          healthcareLabel.classed("active", false).classed("inactive", true);
          smokesLabel.classed("active", false).classed("inactive", true);
          obesityLabel.classed("active", true).classed("inactive", false);
  
        }
      }
    });


})