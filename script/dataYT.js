// var LINKS = [
//     {"source": 0, "target": 1},
//     {"source": 0, "target": 2},
//     {"source": 2, "target": 3},
//     {"source": 3, "target": 4}
//   ];
// var NODES = [
//     {"vidID": "2sLRMAkc2aM", "title": "song1"},
//     {"vidID": "MHu8948sDJA", "title": "song2"},
//     {"vidID": "3EyHnYFkaWc", "title": "song3"},
//     {"vidID": "OBl4pp0Sfko", "title": "song34"},
//     {"vidID": "Qg-nIAnUZwE", "title": "song5"}
//   ];

var getNodes = function(ytURL, breadth, depth){
    var ytURL = "https://www.googleapis.com/youtube/v3/search?part=snippet&relatedToVideoId=5rOiW_xY-kc&type=video&key=AIzaSyAXV9k7GK2rPUcGob1B4vDrAuzDrCoYgFo";
    $.get(ytURL, function(data){
      console.log('data', data);
    });

  }


var youtubeGlobalRender = function(){

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

  d3.json("../testGraph.json", function(json) {
    //get the JSON file
    //  use it to create ALL the nodes
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
          return d3.rgb(fill(d.group)).darker(); })//can FILL
        // .call(force.drag)
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
}
