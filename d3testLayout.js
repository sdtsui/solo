var w = 960,
    h = 500,
    r = 6,
    fill = d3.scale.category20();

var force = d3.layout.force()
    .charge(-120) //****MVP
    .linkDistance(200)//distance of links?
    .size([w, h]);

var svg = d3.select("body").append("svg:svg")
    .attr("width", w)
    .attr("height", h);

d3.json("testGraph.json", function(json) {

  var link = svg.selectAll("line")
      .data(json.links)
    .enter().append("svg:line");


    // svg.append('circle').attr('fill', 'url(#image1)')
    // .attr('cx', 85)
    // .attr('cy', 85)
    // .attr('r', 38);

  var node = svg.selectAll("circle")
      .data(json.nodes)
      .enter().append("svg:circle")
      .attr("fill", "url(#image1)")
      .attr("r", 38)
      .style("border-radius", "10px")
      .style("stroke", function(d) { 
        console.log("d:", d);
        console.log('d.group:', d.group);
        return d3.rgb(fill(d.group)).darker(); })//can FILL
      .call(force.drag)
// //http://img.youtube.com/vi/2sLRMAkc2aM/3.jpg

  force
      .nodes(json.nodes)
      .links(json.links)
      .on("tick", tick)
      .start();

  function tick(e) {

    // Push sources up and targets down to form a weak tree.
    // ****
    // var k = 6 * e.alpha;
    // json.links.forEach(function(d, i) {
    //   d.source.y -= k;
    //   d.target.y += k;
    // });
    // ****

    //assigns node locations
    node.attr("cx", function(d) { return d.x; })
        .attr("cy", function(d) { return d.y; });

    //updates rendering of links
    link.attr("x1", function(d) { return d.source.x; })
        .attr("y1", function(d) { return d.source.y; })
        .attr("x2", function(d) { return d.target.x; })
        .attr("y2", function(d) { return d.target.y; });
  }
});

