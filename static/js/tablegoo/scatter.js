function draw_scatter(){
data = no_identifiers_data_dictionary;
temp =feature_list;
 var width = 960,
 size = 125,
 padding = 30;

var x = d3.scale.linear()
    .range([padding / 2, size - padding / 2]);

var y = d3.scale.linear()
    .range([size - padding / 2, padding / 2]);

var histX = d3.scale.linear()
    .range([padding / 2, size - padding / 2]);

var histY = d3.scale.linear()
    .range([size - padding / 2, padding / 2]);

var formatSiPrefix = d3.format("3,.1s") ;

var xAxis = d3.svg.axis()
    .scale(x)
    .orient("bottom")
    .ticks(5)
    .tickFormat(formatSiPrefix);

var yAxis = d3.svg.axis()
    .scale(y)
    .orient("left")
    .ticks(5)
    .tickFormat(formatSiPrefix);

var color = d3.scale.category20();

// Establish the resource filtering buttons
categories = temp ;
d3Colors = d3.scale.category20()
              .domain(d3.range(1,21)) ;
categoryColors = [1,2, 3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21] ;
categoryLabels = temp;
categoryLabelColors = ["white","white","white","white","white","white",'weight'] ;
categoryColorIndex = data[0];
title_obj=features_dictionary[0];
var title_biject = eval('(' + title_obj + ')');
//console.log(title_biject)
diagonalNames = title_biject;
// Legend data buttons

// Legend variables
var dEdge = -50 ;
var radius = 15 ;

var filterType = ["none","none"] ;
var filterLimits = [[0,0],[0,0]] ;

//----------------------------------------
// Load and plot the data
//----------------------------------------

  var allData = data ;

  // Determine the types of each plot by extracting the first line of the csv and ignoring
  //  "species"

  var domainByTrait = {},
      traits = d3.keys(data[0]).filter(function(d) {return (d);
       }),

      n = traits.length;
//console.log(traits)
  // Get Min and Max of each of the columns
  traits.forEach(function(trait) {
    domainByTrait[trait] = d3.extent(data, function(d) {
      return +d[trait];
    });
  });

  // Set the ticks to stretch across all plots
  xAxis.tickSize(size * n);
  yAxis.tickSize(-size * n);  // negative so ticks go right

  // Create brishing variable
  var brush = d3.svg.brush()
      .x(x)
      .y(y)
      .on("brushstart", brushstart)
      .on("brush", brushmove)
      .on("brushend", brushend);

  // Create the svg box
  var svg = d3.select("#draw_scatter").append("svg")
      .attr('id', 'scatter_svg')
      .attr("width", size * n + padding*5)
      .attr("height", size * n + padding)
      .attr('class','scatter_svg')
      .append("g")
      .attr("transform", "translate(" + padding + "," + padding / 2 + ")");

  //------------------------------------
  // Create Legend
  //------------------------------------



  // Create each x-axis
  svg.selectAll(".x.axis")
      .data(traits)
    .enter().append("g")
      .attr("class", "x scatter_axis")
      .attr("transform", function(d, i) { return "translate(" + (n - i - 1) * size + ",0)"; })
      .each(function(d) {
        x.domain(domainByTrait[d]);
        d3.select(this).call(xAxis);
      });

  // Create each y-axis
  svg.selectAll(".y.axis")
      .data(traits)
    .enter().append("g")
      .attr("class", "y scatter_axis")
      .attr("transform", function(d, i) {
        return "translate(0," + i * size + ")";
      })
      .each(function(d) {
        y.domain(domainByTrait[d]);
        d3.select(this).call(yAxis);
      });

  var cell = svg.selectAll(".cell")
      .data(cross(traits, traits))
      .enter().append("g")
      .attr("class", "cell") ;

  var plotCells = cell.filter(function(d) { return d.i !== d.j; })
      .attr("transform", function(d) { return "translate(" + (n - d.i - 1) * size + "," + d.j * size + ")"; })
      .each(plot);

  var histCells = cell.filter(function(d) { return d.i === d.j; })
      .attr("transform", function(d) { return "translate(" + (n - d.i - 1) * size + "," + d.j * size + ")"; })
      .each(firstPlotHistogram) ;

  // Run the brush
  plotCells.call(brush);

  //------------------------------------------
  // Plot Scatterplot Point
  //------------------------------------------
  function plot(p) {
    var cell = d3.select(this);

    histX.domain(domainByTrait[p.x]);
    histY.domain(domainByTrait[p.y]);

    cell.append("rect")
        .attr("class", "scatter_frame")
        .attr("x", padding / 2)
        .attr("y", padding / 2)
        .attr("width", size - padding)
        .attr("height", size - padding);

    cell.selectAll("circle.data")
        .data(data)
        .enter().append("circle")
        .classed("data",true)
        .attr('id','scatter_circle')
        .attr("cx", function(d) {
          // For each data point, return the appropriate x and
          //  y value corresponding to the pair of data, and scale it
          return histX(d[p.x]);
        })
        .attr("cy", function(d) { return histY(d[p.y]); })
        .attr("r", 2)
               .on("mouseover", function(d) {
                    console.log(d)
 })
        .style("fill", function(d) {
          return d3Colors(3);               // 散点颜色
        });
  }

  //------------------------------------------
  // Update Histogram
  //------------------------------------------
  function updateHistograms() {
    d3.selectAll(".histogram")
      .remove() ;

    histCells.each(function(p) {

      var cell = d3.select(this);

      histX.domain(domainByTrait[p.x]);
      //y.domain(domainByTrait[p.y]);

      // Filter data down based on selections
      var histData = data.filter(function(d) {

           if (filterLimits[0][0] > +d[filterType[0]] || +d[filterType[0]] > filterLimits[0][1] ||
               filterLimits[1][0] > +d[filterType[1]] || +d[filterType[1]] > filterLimits[1][1]) {
            return false ;
           }
        return true ;
      }) ;

      // Extract data for histogramming into single array
      histData = histData.map(function(d) {
        return +d[p.x] ;
      });

      // Generate a histogram using twenty uniformly-spaced bins.
      var hist = d3.layout.histogram()
        .bins(histX.ticks(20))
        (histData);

      var histScale = d3.scale.linear()
      .domain([0, d3.max(hist, function(d) { return d.y; })])
      .range([size - padding / 2, padding / 2]);

      var bar = cell.selectAll(".bar")
        .data(hist)
        .enter().append("g")
        .attr("class", "scatter_bar")
        .classed("histogram",true)
        .attr("transform", function(d) {
          return "translate(" + histX(d.x) + "," + histScale(d.y) + ")";
        });

      bar.append("rect")
      .classed("histogram",true)
      .attr("x", 1)
      .attr("width", 5) //x(hist[0].dx) )
      .attr("height", function(d) {
        return size - padding / 2 - histScale(d.y);
      });

      // Titles for the diagonal.
      //cell.filter(function(d) { return d.i === d.j; }).
      cell.append("text")
      .classed("histogram",true)
      .attr("x", size - padding)
      .attr("y", padding)
      .attr("dy", ".71em")
      .attr("text-anchor","end")
      .text(function(d) { return diagonalNames[d.x]; });
    }) ;
  }

  //------------------------------------------
  // First Plot Histogram
  //------------------------------------------
  function firstPlotHistogram(p) {

    var cell = d3.select(this);

    histX.domain(domainByTrait[p.x]);
    histY.domain(domainByTrait[p.y]);

    cell.append("rect")
        .attr("x", padding / 2)
        .attr("y", padding / 2)
        .attr("width", size - padding)
        .attr("height", size - padding)
        .attr("fill", "white")
        .attr("stroke","#aaa");

    // Extract data for histogramming into single array
    histData = data.map(function(d) {
      return +d[p.x] ;
    });

    // Generate a histogram using twenty uniformly-spaced bins.
    var hist = d3.layout.histogram()
      .bins(histX.ticks(20))
      (histData);

    var histScale = d3.scale.linear()
    .domain([0, d3.max(hist, function(d) { return d.y; })])
    .range([size - padding / 2, padding / 2]);

    var bar = cell.selectAll(".bar")
      .data(hist)
      .enter().append("g")
      .attr("class", "scatter_bar")
      .classed("histogram",true)
      .attr("transform", function(d) {
        return "translate(" + histX(d.x) + "," + histScale(d.y) + ")";
      });

    bar.append("rect")
    .classed("histogram",true)
    .attr("x", 1)
    .attr("width", 5) //x(hist[0].dx) )
    .attr("height", function(d) {
      return size - padding / 2 - histScale(d.y);
    });

    // Titles for the diagonal.
    //cell.filter(function(d) { return d.i === d.j; }).
    cell.append("text")
    .classed("histogram",true)
    .attr("x", size - padding)
    .attr("y", padding)
    .attr("dy", ".71em")
    .attr("text-anchor","end")
    .text(function(d) { return diagonalNames[d.x]; });
  }

 var brushCell;

  //------------------------------------------
  // Brushstart
  //------------------------------------------
  // Clear the previously-active brush, if any.
  function brushstart(p) {
    if (brushCell !== this) {
      d3.select(brushCell).call(brush.clear());
      x.domain(domainByTrait[p.x]);
      y.domain(domainByTrait[p.y]);
      brushCell = this;
      console.log("clear");
    }

    // Reset histogram parameters
    //filterType = ["none","none"] ;
    //filterLimits = [[0,0],[0,0]] ;
    //updateHistograms() ;
    //console.log("start");
  }

  //------------------------------------------
  // Brushmove
  //------------------------------------------
  // Highlight the selected circles.
  function brushmove(p) {
    var e = brush.extent();

    // Identify subselections for histograms
    filterType = [p.x,p.y] ;
    filterLimits = [ [+e[0][0],+e[1][0]],
                     [+e[0][1],+e[1][1]]
                   ] ;
    if (filterLimits[0][0] == filterLimits[0][1] && filterLimits[1][0] == filterLimits[1][1]) {
      filterType = ["none","none"] ;
      updateHistograms() ;
    }

    svg.selectAll("circle.data").classed("hidden", function(d) {
      return +e[0][0] > +d[p.x] || +d[p.x] > +e[1][0] ||
             +e[0][1] > +d[p.y] || +d[p.y] > +e[1][1];

    });
    updateHistograms() ;
  }

  //------------------------------------------
  // Brushend
  //------------------------------------------
  // If the brush is empty, select all circles.
  function brushend() {
    if (brush.empty()) svg.selectAll(".hidden").classed("hidden", false);
    updateHistograms() ;
  }

  //------------------------------------------
  // Cross
  //------------------------------------------
  function cross(a, b) {
    var c = [], n = a.length, m = b.length, i, j;
    for (i = -1; ++i < n;)
      for (j = -1; ++j < m;)
        c.push({x: a[i], i: i, y: b[j], j: j});
    return c;
  }

  d3.select(self.frameElement).style("height", size * n + padding + 20 + "px");

//------------------------------------------
// Switchvisibility
//------------------------------------------
// Switch the visibility of generators based on side buttons
function switchVisibility(d,i) {
  var selection = svg.selectAll("circle.data")
                   .filter(function(data,index) {
                      return data.fuel === categories[i] ;
                   }) ;
  if (d3.select(this).attr("isVisible") === "true") {
    selection.attr("visibility","hidden") ;

    // Fade the button
    d3.select(this)
      .attr("fill", function() {
        return d3Colors(categoryColors[i]) ;
      })
      .attr("isVisible",false) ;

      // Remove the data from consideration in histograms
      categoryState[categories[i]] = false ;
  } else {
    selection.attr("visibility","visible") ;

    // Darken the button
    d3.select(this)
      .attr("fill", function() {
        return d3Colors(categoryColors[i]) ;
    })
    .attr("isVisible",true ) ;

    // Add the data to histograms
      categoryState[categories[i]] = true ;
  }
  updateHistograms();
}}