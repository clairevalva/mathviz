//d3.select("body")
        //.append("svg")
        //.attr("width", 50)
        //.attr("height", 50)
        //.append("circle")
        //.attr("cx", 25)
        //.attr("cy", 25)
        //.attr("r", 25)
        //.style("fill", "pink");

// note that the above is equivalent to the code below
//var bodySelection = d3.select("body");

//var svgSelection = bodySelection.append("svg")
        //.attr("width", 50)
        //.attr("height", 50);

//var circleSelection = svgSelection.append("circle")
        //.attr("cx", 25)
        //.attr("cy", 25)
        //.attr("r", 25)
        //.style("fill", "purple");
 
// now, what if I want a bigger circle?

//TO DO:
// add movement
// add all dimensions
// add subleaves


var dim = 4;
var radius = 1000/4;

var len1 = 70;
var offset1 = 0;

var len2 = 60;
var offset2 = 10;



// append big circle
d3.select("body")
        .append("svg")
        .attr("width", radius*2 + 200)
        .attr("height", radius*2 + 200)
        .append("circle")
        .attr("cx", radius + 100)
        .attr("cy", radius + 100)
        .attr("r", radius)
        .style("fill", "pink");

// convert angle offset to d points
function angle_to_points(ndim, offset) {
    // returns points along circle given initial angle and offset
    // for later usage -- let users change offset? 
    
    var theta = 2*Math.PI / ndim; 
    var angles = [];
    
    
    for (i=0;i<ndim;i++){
      
        var x = radius * Math.cos(theta*i + offset) + 100 + radius;
        var y = radius * Math.sin(theta*i + offset) + 100 + radius;  
        // plus 100s are added to center this on the page
        
        angles[i] = [x,y];
    } 
   
    return angles;
};
//edit above to label points!!


var points_1 = angle_to_points(dim, offset1);

// convert angle offset to d points
function angle_to_arcs(ndim, offset, leaf) {
    // returns points along circle given initial angle and offset
    // for later usage -- let users change offset? 
    
    var theta = 2*Math.PI / ndim; 
    var angles = [];
    var radius_new = radius + leaf;
    
    
    for (i=0;i<ndim;i++){
      
        var x = radius_new * Math.cos(theta*i + offset) + 100 + radius;
        var y = radius_new * Math.sin(theta*i + offset) + 100 + radius;  
        
        // plus 100s are added to center this on the page
        
        angles[i] = [x,y];
    } 
   
    return angles;
};

var leaf_1 = angle_to_arcs(dim, offset1, 50);
// append points around the circle -- eventually should connect each set to data

//gen symbols
var symbolGenerator = d3.symbol()
	.type(d3.symbolStar)
	.size(80);


function points_gen(dim, offset, leaf) {
    //gets all points and leaves
    
    var points = angle_to_points(dim, offset);
    var leafs = angle_to_arcs(dim, offset, leaf);
    var fulldat = points.concat(leafs);
    
    return fulldat;
    
};




var pathData = symbolGenerator();

var newdat = leaf_1.concat(points_1);

var fulldat = points_gen(dim, offset1, 50);

// add what are now blue stars -- soon to be else
d3.select('svg')
	.selectAll('path')
	.data(newdat)
	.enter()
	.append('path')
	.attr('transform', function(d) {
		return 'translate(' + d+ ')';
	})
        .attr("id", "first")
	.attr('d', pathData)
        .style("fill", "blue");

var curve2 = points_gen(dim, 15, 45);

function doUpdate(newdat, color, named) {
    var u = d3.select('svg')
	  .selectAll('path')
	  .data(newdat, function(d){return d;})
          .enter().append("path").attr('transform', function(d) {
		return 'translate(' + d + ')';
	})
	.attr('d', pathData)
        .attr("id", named)
        .style("fill", color);
    
	  
}

doUpdate(curve2, "orange", "second");

// make slider?


var arc1 = arcs_gen(dim, 0, 60, 0, 1);

console.log(arc1);
console.log(arc1[0][1])

var lineGenerator = d3.line()
	.curve(d3.curveCardinal.tension(0.6))
        .x(function(d) { return d[0];})
        .y(function(d) { return d[1]; });

var pathData2 = lineGenerator(arc1);

//d3.select('svg').selectAll('path')
        //.data(arc1, function(d){return d;})
        //.enter()
        //.append("path")
	//.attr('d', pathData2)
        //.attr("stroke", "orange")
        //.attr("fill","none")
        //.attr("id", "named")
        //.attr("stroke-width",5);
        

        


function draw_arcs(newdat, color, named){
    
    var pathData3 = lineGenerator(newdat);

    d3.select('svg').selectAll('path')
        .data(newdat, function(d){return d;})
        .enter()
        .append("path")
	.attr('d', pathData3)
        .attr("stroke", color)
        .attr("fill","none")
        .attr("id", named)
        .attr("stroke-width",5);
    
}
var arcok = arcs_gen(dim, 15, 60, 2, 1);

draw_arcs(arcok, "orange", "second_arc");

draw_arcs(arc1, "blue", "first_arc");

function small_leaves(){
    
    if (len1*8/9 >= len2){
    var new_points = points_gen(dim*3,14 + offset1, len1/3);
    
    var arcnew = arcs_gen(dim*3, 15 + offset1, len1/3, 0, 1);
    
    doUpdate(new_points, "blue", "first_points_a");
    draw_arcs(arcnew, "blue", "first_arc_a");
    
};
    
};

small_leaves();

//implement slider with new enter, append, remove funciton




//red circle to test whether syntax is wrong
d3.select("body")
        .append("svg")
        .attr("width", 50)
        .attr("height", 50)
        .append("circle")
        .attr("cx", 25)
        .attr("cy", 25)
        .attr("r", 25)
        .style("fill", "red");
    




