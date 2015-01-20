jQuery.ajaxSetup({async:false});
//Work: Links and nodes.
//clientside testing;
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
var LINKS = [];
var NODES = [];

var addPatterns = function(NODES){//loop over Nodes
  //jquery select #mySvg
  //create pattern based on this template
  /*
  <pattern id="image1" x="0" y="0" height="90" width="125">
          <image x="0" y="0" width="125" height="90" xlink:href="http://img.youtube.com/vi/2sLRMAkc2aM/0.jpg"></image>
        </pattern>
   */
  //append it to svg, with id = vidID
  //href will be the result of a call to imageQuery;
  //
  //
  //breaout
  var el = $('#patternBox');
  var allPatterns = "";
  for (var i = 0 ; i < NODES.length; i++){
    //make a new pattern
    var HTMLpattern = "<pattern id="+NODES[i].vidID+" x='0' y='0' height='90' width='125'>"+
          "<image x='0' y='0' width='125' height='90' xlink:href="+imageQuery(NODES[i].vidID)+
          "></image></pattern>";
    allPatterns += HTMLpattern;
  }
  $(el).html(allPatterns);
}

var imageQuery = function(id){
  return "http://img.youtube.com/vi/"+id+"/0.jpg"
};

var makeLink = function(source, target){
  //accepts numbers
  if (typeof source !== 'number' || typeof target !== 'number'){
    console.log('error, makeLink passed non-numbers');
    return;
  }
  return {"source": source, "target": target};
}

var makeNode = function(vidID, title){
  if (typeof vidID !== 'string' || typeof title !== 'string'){
    console.log('error, makeNode passed non-strings');
    return;
  }
  return {"vidID": vidID, "title": title};
}

var KEYTHINGY = "AIzaSyAXV9k7GK2rPUcGob1B4vDrAuzDrCoYgFo";
var makeYouTubeQuery = function(id, key){
  //Example id: 5rOiW_xY-kc ; for REM song
  //example Key: "AIzaSyAXV9k7GK2rPUcGob1B4vDrAuzDrCoYgFo"
  var queryString = "https://www.googleapis.com/youtube/v3/search?part=snippet&relatedToVideoId=";
  queryString += id +"&maxResults=20&type=video&key=" + key;
  return queryString;
}



var constructYouTubeTree = function(ytID, breadth, depth){
  //WILL BREAK if breadth > 5 right now, because of default response size
  //there are other parameters. default 5 songs returning.
    var queryQueue = [];
    queryQueue.push({
      'id': ytID,
      'title': "Root Song",
      'depth': 0
    });
    //takes ID and title strings
    //note that depth is tracked in 3rd parameter
    while (queryQueue.length !== 0){
      console.log(queryQueue.length);
      console.log('queryQueue : ', queryQueue, queryQueue.length);
      var nextNode = queryQueue[0];
      console.log(nextNode);
      if(nextNode['depth'] <= depth){
        //add it to the list of Nodes if it's at the right depth
        NODES.push(makeNode(nextNode['id'], nextNode['title']));

        if (nextNode['depth'] < depth){
          debugger;
          console.log('attempting to add children');
          //add some children
          var currentQueryString = makeYouTubeQuery(nextNode['id'],KEYTHINGY);
          $.get(currentQueryString, function(data){
            //REAL FUNCTION;
            console.log('received data, of type : ', typeof data);
            var response = data;
            var items = response.items;
            console.log('ITEM LENGTH :', items.length);
            var parentLocation = NODES.length-1;
            var childLocation = parentLocation+1;
            for (var i = 0 ; i < breadth; i++){
              queryQueue.push({
                'id': items[i].id.videoId,
                'title': items[i].snippet.title,
                'depth': nextNode['depth']+1
              });
              LINKS.push(makeLink(parentLocation,childLocation));
              childLocation++;
            }
          })
          .done(function() {
            console.log( "successfully called .done" );
          })
          .fail(function() {
            console.log( "error" );
          })
          .always(function() {
            console.log( "finished" );
          });

        }
      }
      queryQueue.shift();
      console.log('one while loop');
    }
    console.log('construction Completed');
    console.log('links : ', LINKS);
    console.log('nodes: ', NODES);
  }


//Global Construct Task:
var youTubeGlobalRender = function(){
  //make a call to NODES;

  addPatterns(NODES);

  var w = 960,
      h = 500,
      r = 6,
      fill = d3.scale.category20();

  var force = d3.layout.force()
      .charge(-120) //****MVP
      .linkDistance(200)//distance of links?
      .size([w, h]);

  // var svg = d3.select("body").append("svg:svg")
  var svg = d3.select("#patternBox")
      .attr("width", w)
      .attr("height", h);
  // var svg = $('#patternBox');
//link appending
  var link = svg.selectAll("line")
    .data(LINKS)
    .enter().append("svg:line");

//node appending
  var node = svg.selectAll("circle")
      .data(NODES)
      .enter().append("svg:circle")
      // .attr("fill", "url(#image1)")
      .attr("fill", function(d){
        console.log("d.vidID: ", d.vidID);
        var id = d.vidID;
        return "url(#"+id+")"
      })
      .attr("r", 38)
      .style("border-radius", "10px")
      .style("stroke", function(d) {
        return d3.rgb(fill(d.group)).darker(); })
      //can FILL
      // .call(force.drag)
// //http://img.youtube.com/vi/2sLRMAkc2aM/3.jpg
      .on('mousedown', function(d){
        console.log('changing playerFrame');
        $('#playerFrame')
        .attr('src', "//www.youtube.com/embed/"+d.vidID);
      })

  force
      .nodes(NODES)
      .links(LINKS)
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
}
