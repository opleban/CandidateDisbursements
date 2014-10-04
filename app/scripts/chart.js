var margin = {top: 20, right: 20, bottom: 30, left: 140};
var width = 960 - margin.left - margin.right;
var height = 500 - margin.top - margin.bottom;

var svg = d3.select("body").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
  .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

svg.append("text")
  .attr("x", (width)/2)
  .attr("y", 0)
  .attr("text-anchor", "middle")
  .style("font-size", "16px")
  .style("text-decoration", "underline")
  .text("Senate Campaign Disbursements by State Population Size");

d3.csv("CandidateSummary.csv", function(errors, candidates){
  var senCandidates = []
  for(var i=0; i<candidates.length; i++){
    if (candidates[i].can_off === "S" && (candidates[i].can_par_aff === "DEM" || candidates[i].can_par_aff === "REP"|| candidates[i].can_par_aff === "GRE" || candidates[i].can_par_aff === "LIB" || candidates[i].can_par_aff === "IND" )){
      senCandidates.push({name: candidates[i].can_nam, disbursements: +(candidates[i].tot_dis.replace(/\$|,/g,'')), state: candidates[i].can_off_sta, party: candidates[i].can_par_aff})
    }
  }
  d3.csv('populations.csv', function(errors, populations){
    senCandidates.forEach(function(candidate){
      populations.forEach(function(state){
        if (state.name === candidate.state){
          candidate.state_population = +state.population;
        }
      })
    });
    var xValue = function(d) { return d.state_population;}, // data -> value
      xScale = d3.scale.linear().range([0, width]), // value -> display
      xMap = function(d) { return xScale(xValue(d));}, // data -> display
      xAxis = d3.svg.axis().scale(xScale).orient("bottom");

    var yValue = function(d) { return d.disbursements;}, // data -> value
      yScale = d3.scale.linear().range([height, 0]), // value -> display
      yMap = function(d) {return yScale(yValue(d)); }, // data -> display
      yAxis = d3.svg.axis().scale(yScale).orient("left");

    var cValue = function(d) { return d.party;},
      color = d3.scale.ordinal()
                .domain(["DEM", "REP", "GRE", "LIB", "IND"])
                .range(["blue", "red", "green", "purple", "orange"])
              // .domain(["Democrat", "Republican", "Green", "Libertarian"])
      // color = function(d){
      //   PartyColors = {DEM:"blue", REP:"red", GRE:"green", LIB:"purple"}
      //   return PartyColors[d];
      // };

    var tooltip = d3.select("body").append("div")
      .attr("class", "tooltip")
      .style("opacity", 0);

    xScale.domain([d3.min(senCandidates, xValue)-1, d3.max(senCandidates, xValue)+1]);
    yScale.domain([d3.min(senCandidates, yValue)-1, d3.max(senCandidates, yValue)+1]);
    svg.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + height + ")")
        .call(xAxis)
      .append("text")
        .attr("class", "label")
        .attr("x", width)
        .attr("y", -6)
        .style("text-anchor", "end")
        .text("Population");

    svg.append("g")
        .attr("class", "y axis")
        .call(yAxis)
      .append("text")
        .attr("class", "label")
        .attr("transform", "rotate(-90)")
        .attr("y", 6)
        .attr("dy", ".71em")
        .style("text-anchor", "end")
        .text("Disbursements");

    svg.selectAll(".dot")
      .data(senCandidates)
      .enter().append("circle")
        .attr("class", "dot")
        .attr("r", 3.5)
        .attr("cx", xMap)
        .attr("cy", yMap)
        .style("fill", function(d) { return color(cValue(d));})
        .on("mouseover", function(d) {
          tooltip.transition()
               .duration(200)
               .style("opacity", 1)
               .style("z-index", 100);
          tooltip.html(d.name + " " + d.state + "<br/> Campaign Disbursements: $" + yValue(d))
               .style("left", (d3.event.pageX + 5) + "px")
               .style("top", (d3.event.pageY - 28) + "px");

        })
        .on("mouseout", function(d) {
            tooltip.transition()
                 .duration(500)
                 .style("opacity", 0);
        });
    // draw legend
    var legend = svg.selectAll(".legend")
        .data(color.domain())
      .enter().append("g")
        .attr("class", "legend")
        .attr("transform", function(d, i) { return "translate(0," + i * 20 + ")"; });

    // draw legend colored rectangles
    legend.append("rect")
        .attr("x", width - 18)
        .attr("width", 18)
        .attr("height", 18)
        .style("fill", color);

    // draw legend text
    legend.append("text")
        .attr("x", width - 24)
        .attr("y", 9)
        .attr("dy", ".35em")
        .style("text-anchor", "end")
        .text(function(d) { return d;})
  });
});