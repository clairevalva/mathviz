/* 
 * Last edited on March 12, 2019 by Claire Valva
 * 
 * 
 * 
 * 
 * TO DO: fixed artificial symmetry
 * TO DO: add no intersection property
 */

// declare original circle
// set radius
var radius = 1000/4;
var odim = 4;
var global_dim = 4;
var global_offsets = [];
var global_leafs = [];
var global_arcs = [];
var global_precrit_names = [];
var arc_refs = [];

var global_rands = []; // so don't introduce artifical symmetry but also not move them around

//declare initial color pallette
var color_pal = ["#6e40aa","#bf3caf","#fe4b83",
    "#ff7847","#e2b72f","#aff05b","#52f667",
    "#1ddfa3","#23abd8","#4c6edb","#8dd3c7",
    "#ffffb3","#bebada","#fb8072","#80b1d3",
    "#fdb462","#b3de69","#fccde5","#d9d9d9",
    "#bc80bd","#ccebc5","#ffed6f"];

function add_circle(){
   // append big circle
    d3.select("#my_dataviz")
        .append("svg")
        .attr("width", radius*2 + 200)
        .attr("height", radius*2 + 200)
        .append("circle")
        .attr("cx", radius + 100)
        .attr("cy", radius + 100)
        .attr("r", radius)
        .style("fill", "pink")
        .style("fill-opacity", 0.5); 
};

add_circle();




// first declare offsets from right multiplication
function initial_os(ndim){
    // function to get original layout from dimensions
    var divider = 2*ndim*ndim*ndim;
    var theta = 2*Math.PI / divider ;
    var offsets = [];
    
    for (i = 0; i < ndim; i++){
        if (i === 0){
            offsets[i] = 0;
        } else {        
        offsets[i] = offsets[i-1] + theta;
        };
    };
    global_offsets = offsets;
    return offsets;
};


// declare lengths (but make them all the same)
function initial_lens(ndim){
    // get initial length list
    lens = [];
    for (i = 0; i < ndim - 1; i++){
        lens[i] = 30;
    };
    global_leafs = lens;
    
    return lens;
};

// functions to get initial points

// convert angle offset to d points
function angle_to_points(ndim, offset) {
    // returns points along circle given initial angle and offset
    // for later usage -- let users change offset? 
    
    var theta = 2*Math.PI / ndim; 
    var angles = [];
    
    //console.log(theta);
    
    for (i=0;i<ndim;i++){
      
        var x = radius * Math.cos(theta*i + offset) + 100 + radius;
        var y = radius * Math.sin(theta*i + offset) + 100 + radius;  
        // plus 100s are added to center this on the page
        
        angles[i] = [x,y];
    } 
    return angles;
};

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

// make initial lines and label them

//gen symbols
var symbolGenerator = d3.symbol()
	.type(d3.symbolStar)
	.size(80);

//gen lines
var lineGenerator = d3.line()
	//.curve(d3.curveCardinal.tension(0.9))
                //.curve(d3.curveBasis)
                
        .curve(d3.curveBundle.beta(0.8))
        .x(function(d) { return d[0];})
        .y(function(d) { return d[1]; });

// function to draw lines from point to leaf end
function draw_lines(twopoints, color, named){
    
    var pathData3 = lineGenerator(twopoints);

    d3.select('svg').selectAll('path')
        .data(twopoints, function(d){return d;})
        .enter()
        .append("path")
	.attr('d', pathData3)
        .attr("stroke", color)
        .attr("fill","none")
        .attr("id", named)
        .attr("stroke-width",4);

//console.log(named);
}


function lines_gen(dim, offset, leaf, color, firstname) {
    //gets all points and leaves, then draws the lines 
    var points = angle_to_points(dim, offset);
    var leafs = angle_to_arcs(dim, offset, leaf);
    
    
    for (i=0;i<dim;i++){
        var lined = [points[i], leafs[i]];
        var namepass = firstname + "_line_" + i;
        
        draw_lines(lined, color, namepass);  
    }
 
};

// use this array to coordinate where each arc is
var global_places = [];

// use basis and a point in the middle ish to get arc coords
function arcs_points(dim, offset, place1, place2, index) {
    // gets the arc
    
    var points = angle_to_points(dim, offset);
    var leafs = angle_to_arcs(dim*2, offset, -radius + 30);
    
    var difference = Math.round(place2 - place1);
    
    if (difference > 0){
        var middle = leafs[2*place1 + difference];
    }
    
    if (difference < 0){
        middle = leafs[2*place1 + difference];
    }
    
    //middle = [radius+100 + index*3,radius+100 + index*3];
    
    var to_connect = [points[place1], middle , points[place2]];
    global_places[index] = [place1, place2];
    global_arcs.push("critical", index, [place1, place2]);
    return to_connect;
};


//draw the arcs now
function arcs_gen(dim, offset, point1, point2, color, firstname, index) {
    //gets all points and leaves, then draws the lines 
    var arctest = arcs_points(dim, offset, point1, point2, index);
    
    draw_lines(arctest, color, firstname);
 
};

function slide_test(name, index){
    // adds new slider
    
    var slidersimple3 = d3
    .sliderBottom()
    .min(0)
    .max(Math.PI * 2)
    .width(300)
    .ticks(5)
    .default(initial_os(global_dim)[index])
    .on('onchange', val => {
      //console.log("val");
      updater_move(index, val, global_dim);
    });
    // add function change above
    
    var newsimple4 = d3.select('#anotherviz')
    .append('svg')
    .attr('width', 500)
    .attr('height', 80)
    .style("fill", color_pal[index])
    .append('g')
    .attr('transform', 'translate(30,30)');
    

    newsimple4.call(slidersimple3);
    
    var label = newsimple4.append("text")  
    .attr("class", "label")
    .attr("text-anchor", "middle")
    .text(name)
    .attr("transform", "translate(0," + (-10) + ")");
}

function slide_leaves(name, index){
    // adds new slider
    
    var slidersimple3 = d3
    .sliderBottom()
    .min(30)
    .max(100)
    .width(300)
    .ticks(5)
    .default(0.015)
    .on('onchange', val => {
      //console.log("val");
      updater_move(index, false, global_dim, val);
    });
    // add function change above
    
    var newsimple4 = d3.select('#anotherviz')
    .append('svg')
    .attr('width', 500)
    .attr('height', 80)
    .style("fill", color_pal[index])
    .append('g')
    .attr('transform', 'translate(30,30)');
    

    newsimple4.call(slidersimple3);
    
    var label = newsimple4.append("text")  
    .attr("class", "label")
    .attr("text-anchor", "middle")
    .text(name)
    .attr("transform", "translate(0," + (-10) + ")");
}

//slide_leaves("move a leaf!" , 2);
function setup2(dimen){
    global_dim = dimen;
    
    var oss = initial_os(dimen);
    var lll = initial_lens(dimen);
    
    for (j = 0; j < dimen -1; j++){
    var named = "set" + j;
    lines_gen(dimen, oss[j], lens[j], color_pal[j], named);
    //console.log(named)
    
    var arcname = named + "arc";
    arcs_gen(dimen, oss[j], j, j+1, color_pal[j], arcname, j);
    var name1 = "arc " + j;
    slide_test(name1, j);
    
    var name2 = "length " + j;
    slide_leaves(name2, j);
    
    global_rands[j] = Math.random();
}

    
};

setup2(odim);

// deletes everything to get original thing
function delete_all() {
    //write function to start everything over
    svg = d3.selectAll("body").selectAll("svg");
    svg.remove();
    add_circle();
};
 
// when button is clicked get value
function handleClick(event){
    //console.log(document.getElementById("myVal").value);
    dim_restart(document.getElementById("myVal").value);
    return false;
            }
 
//draw a new slate with restart
function dim_restart(newdim){
    delete_all();
    setup2(newdim);
    
};
 

// update the elements
function update(nRadius) {

 console.log("hi");
}

function remover(named,twopoints,color){
    // removes one color
    var pathData3 = lineGenerator(twopoints);
    var newname = "#"+named;
    
    //console.log(newname)
    var tochange = d3.selectAll(newname)
            .data(twopoints, function(d){return d;});
            
    tochange.attr("class","update");
    
    tochange.enter()
      .append("path")
	.attr('d', pathData3)
        .attr("stroke", color)
        .attr("fill","none")
        .attr("id", named)
        .attr("stroke-width",5);
    tochange.merge(tochange)
    .text(function(d) { return d; });

  // EXIT
  // Remove old elements as needed.
    tochange.exit().remove();
};

function draw_new_line(arcnum, newoffset, dimen){
    del = false;
    //draws new lines (only 1)
    var named = "set" + arcnum;
    if (del === false){
        lines_gen(dimen, newoffset, global_leafs[arcnum], color_pal[arcnum], named);
    } else {
        lines_gen(dimen, newoffset, 0, color_pal[arcnum], named+ "pre");
    };
    
    var arcname = named + "arc";
    
    
    arcs_gen(dimen, newoffset, 
        global_places[arcnum][0], global_places[arcnum][1], color_pal[arcnum], arcname);
    
    
    }


function updater_move(arcnum, newoffset = false, dimen = global_dim, newleaf = false){
    // drawing new lines and removing the old ones
    if (newleaf === false){
        newleaf = global_leafs[arcnum];
    } else {
        global_leafs[arcnum] = newleaf;
    }
    
    //global_precrits[0] = global_leafs;
    
    if (newoffset === false){
        newoffset = global_offsets[arcnum];
    } else {
        global_offsets[arcnum] = newoffset;
    }
    //console.log(global_leafs)
    var points = angle_to_points(dimen, newoffset);
    var leafs = angle_to_arcs(dimen, newoffset, newleaf);
    
    for (j = 0; j < dimen; j++){
        var nametest = "set" + arcnum + "_line_" + j;
        var lined = [points[j], leafs[j]];
        remover(nametest, lined, color_pal[arcnum]);
    };
    var nametest = "set" + arcnum + "arc";
    remover(nametest, lined, color_pal[arcnum]);
    
    //add draw new arc/lines
    draw_new_line(arcnum,newoffset,dimen);
    
    full_precrits();
    
    //precrit_leaves();

};

function refSort (targetData, refData) {
 // sorts target - based on ref -- gets primary ordering of the arcs! 
    
  // Create an array of indices [0, 1, 2, ...N].
  var indices = Object.keys(refData);

  // Sort array of indices according to the reference data.
  indices.sort(function(indexA, indexB) {
    if (refData[indexA] < refData[indexB]) {
      return -1;
    } else if (refData[indexA] > refData[indexB]) {
      return 1;
    }
    return 0;
  });

  // Map array of indices to corresponding values of the target array.
  return indices.map(function(index) {
    return targetData[index];
  });
}

function pairwise(list) {
  var pairs = [];
  list
    .slice(0, list.length - 1)
    .forEach(function (first, n) {
      var tail = list.slice(n + 1, list.length);
      tail.forEach(function (item) {
        pairs.push([first, item]);
      });
    });
  return pairs;
}

function leaf_comp(big_l, small_l){
    // takes two input leaves (one bigger and one smaller)
    // finds how many precritical leaves need to display
    //console.log("is" + big_l);
    var greater = false;
    var exponent = 0;
    var times = 1;
    
    
    
    while (greater === false){
        //apend something
        var divider = Math.pow(3, exponent);
        var tocomp = big_l / divider;
        //console.log(tocomp)
        //onsole.log(tocomp)
        if (tocomp <= small_l){
            greater = true;
            
            //console.log(tocomp < small_l);
            
            return(exponent);
        } else {
            exponent = exponent + 1;
        }
        
        times++;
        if (times === 5){
            //return console.log("oops");
        }
    };

    return exponent;
}
//leaf_comp(10, 4);
//console.log("equality");
leaf_comp(10,10);

function remover_pre(named){
    // i think this should remove all precrit points if passed in loopwise
    // removes one color
    //console.log("hey")
    var twopoints = [0,0];
    
    var pathData3 = lineGenerator(twopoints);
    var newname = "#"+named;
    
    
    //console.log(newname)
    var tochange = d3.selectAll(newname)
            .data(twopoints, function(d){return d;});
            
    tochange.attr("class","update");
    
    tochange.enter()
      .append("path")
	.attr('d', pathData3)
        .attr("stroke", "orange")
        .attr("fill","none")
        .attr("id", named)
        .attr("stroke-width",5);
    tochange.merge(tochange)
    .text(function(d) { return d; });

  // EXIT
  // Remove old elements as needed.
    tochange.exit().remove();
};

function draw_parcs(crit, item, place1, place2, newname,osed, points2,manyarcs){
    var newdim = Math.pow(global_dim, crit + 1 + 1);
    
    var points = angle_to_points(newdim, osed);
    
    //figure out this offset issue later!
    var leafs = angle_to_arcs(newdim*newdim*manyarcs, osed*(crit+2), -radius + 40 );
    //console.log(leafs);
    
    var difference = Math.round(place2 - place1);
    //console.log(2*place1 + difference);
    
    if (difference > 0){
        var middle = leafs[2*place1 + difference];
    }
    
    if (difference < 0){
        middle = leafs[2*place1 - difference];
    }   
    
    
    //console.log(middle);
    //console.log("lne" + points.length);
    var lined = [points[place1], [100 + radius,100 + radius], points[place2]];
    //console.log(lined);
    //console.log(2*place1 + difference);
    draw_lines(lined, color_pal[item], newname);
    
}

function prearcs(crit, item, named, osed, points){
    //console.log("undone");
    var manyarcs = global_dim * (crit + 1);
    var newdim = Math.pow(global_dim, crit + 1 + 1);
    
    for (k = 0; k < manyarcs; k++){
        place1 = 0 + k*(global_dim*(crit + 1));
        place2 = 1 +  k*(global_dim*(crit + 1));
        
        //console.log("manyarcs is " + manyarcs)
        
        var newname = named + "arc" + k;
        
        draw_parcs(crit, item, place1, place2, newname,osed, points, manyarcs);
        
        global_arcs.push("pre_" + crit + "_" + k, item, [place1,place2] );
        global_precrit_names.push(newname);
    };
    
    
}

//prearcs(0, 2, "heyo", 10 );

function drawcrits(named, item, crit){
    //
    //this does seem to draw them appropriately --- can i remove
    
    // introduce offset as to not introduce artificial symmetry
    var todiv = Math.pow(3, crit + 1);
    var osed = global_rands[item];
    var leaflen = global_leafs[item] / todiv;
    
    var newdim = Math.pow(global_dim, crit + 1);
    var points = angle_to_points(newdim, osed);
    var leafs = angle_to_arcs(newdim, osed, leaflen);
    
    for (i=0;i<newdim;i++){
        var lined = [points[i], leafs[i]];
        draw_lines(lined, color_pal[item], named);  
    }
    // now need to add arc!
    prearcs(crit, item, named, points, osed, points);
    
    // named will be the name of the lines
    // item will be the arc num
    // crit is the precrit number (0 is first set, 1 is second etc)
};


function add_crits(item, howmany){
    //console.log("not done yet!");
    //console.log(howmany + "how");
    if (howmany === 0){
        return;
    } else {
        
        
        for (crit = 1; crit < howmany + 1; crit++){
            named = "precrit_" + item + "_" + crit;
            global_precrit_names.push(named);
            //console.log(named);
            
            drawcrits(named, item, crit);
        };
        
    };
    //don't forget to append the names of each precritical leaf!!
    
    // item will indicate arnum -- ie. color, and length
    // how many will indicate how many layers
    // 
}


function full_precrits(){
   //takes no arguments as has to go through each and every one
   
    global_precrit_names.forEach(function(entry) {
        //remove all present precritical leaves
        remover_pre(entry);
    });
    
    //console.log(global_leafs);
    //console.log("above");
   
    //since all precritical leaves are gone, empty the list
    global_precrit_names = [];
   
   // check equalities
   var num_list = [];
   for (item = 0; item < global_dim - 1; item++){
       num_list[item] = item;
   }
   
   //get list based on length of global leafs
   var sortlist = refSort(num_list, global_leafs);
   var pairlist = pairwise(sortlist.reverse());
   //console.log("sort", sortlist, "pair", pairlist);
   var list_crits = [];
   
   //console.log(sortlist);
   // get number of precrits to add
   for (item = 0; item < pairlist.length; item++){
       //console.log(leaf_comp(global_leafs[pairlist[item][0]], global_leafs[pairlist[item][1]]));
       //console.log("first" + global_leafs[pairlist[item][0]] + "second" + global_leafs[pairlist[item][1]])
       //console.log();
       list_crits[item] = leaf_comp(global_leafs[pairlist[item][0]], global_leafs[pairlist[item][1]]);
   }
   
   // add new precrits
   // get max of precrits to add
   // add them
   // iterate through all arcs
   for (item = 0; item < global_dim - 1; item++){
       var comp_arr = [];
       var counter = 0;
       
        for (overlist = 0; overlist < pairlist.length; overlist++){
        
            if (pairlist[overlist][0] === item){
            //add the crit points
                //console.log("item is" + item);
                //console.log("pair is" + pairlist[overlist]);
                comp_arr[counter] = list_crits[overlist];
                //console.log("listed", list_crits)
        }
    }
       
       var howmany = Math.max(comp_arr);
       
       // write add crits function
        add_crits(item, howmany);
   }
   
   
};

//full_precrits();


// for intersections/movement -- have to clear all arcs?


function arc_entry(start_ang, end_ang, leaf_len, index, precrit, precrit_num, two_parts = false){
    // start angle is first one
    // end angle is second one
    // leaf len
    // index -- for color
    // precrit = 0 if critical, count if else
    // precrit number -- just for indexing
    // unique name
    // if two_parts has multiple then look at parts of arcs
    
    return{
        start: start_ang,
        end: end_ang,
        leaf: leaf_len,
        index: index,
        pre: precrit,
        subpre: precrit_num,
        parts: two_parts,
        unique_name: "name_" + index + "_" + precrit + "_" + precrit_num
    };

}

function list_del(index, precrit, precrit_num){
    var unique_name = "name_" + index + "_" + precrit + "_" + precrit_num;
    
    for( var i = 0; i < arc_refs.length; i++){ 
        if (arc_refs[i]["unique_name"] === unique_name) {
            arc_refs.splice(i, 1); 
    }
}
}

    //draw the arcs now
function new_arcs_gen(start_ang, end_ang, color, firstname,leaf_len) {
    //gets all points and leaves, then draws the lines 
    
    var x_st = radius*Math.cos(start_ang) + 100 + radius;
    var y_st = radius*Math.sin(start_ang) + 100 + radius;
    
    var x_e = radius*Math.cos(end_ang) + 100 + radius;
    var y_e = radius*Math.sin(end_ang) + 100 + radius;
    
    
    if (start_ang > end_ang){
        var middle = (start_ang - end_ang)/2 + start_ang;
    } else {
        var middle = (end_ang - start_ang)/2 + end_ang;
    }
    
    var x_mid = (radius - leaf_len) * Math.cos(middle) + 100 + radius;
    var y_mid = (radius - leaf_len) * Math.sin(middle) + 100 + radius;
    
    var points = [[x_st, y_st], [x_mid, y_mid], [x_e, y_e]];
    
    draw_lines(points, color, firstname);
    
}

function add_arc(start_ang, end_ang, leaf_len, index, precrit, precrit_num, two_parts = false){
    
    //remove entry from the list if had an old one
    list_del(index, precrit, precrit_num);
    
    //add list entry
    arc_refs.push(arc_entry(start_ang, end_ang, leaf_len, index, precrit, precrit_num));
    
    var firstname = "name_" + index + "_" + precrit + "_" + precrit_num;
    
    //insert drawing function here
    new_arcs_gen(start_ang, end_ang, color_pal[index], firstname, leaf_len);
    
}

function get_angles(ndim, offset){
    var angles = [];   
    var theta = 2*Math.PI / ndim; 
    
    for (i=0;i<ndim;i++){
      
        var x = theta*i + offset;
        // plus 100s are added to center this on the page
        angles[i] = x;
    };
} 

function new_updater_move(arcnum, newoffset = false, dimen = global_dim, newleaf = false){
    // drawing new lines and removing the old ones
    if (newleaf === false){
        newleaf = global_leafs[arcnum];
    } else {
        global_leafs[arcnum] = newleaf;
    }
    //global_precrits[0] = global_leafs;
    
    if (newoffset === false){
        newoffset = global_offsets[arcnum];
    } else {
        global_offsets[arcnum] = newoffset;
    }
    
    // do remover on things with the same name
    // honestly - need to rewrite with same naming convention as before!! 
    // -- easiest to copy to a new doc
    
    //console.log(global_leafs)
    var points = angle_to_points(dimen, newoffset);
    var leafs = angle_to_arcs(dimen, newoffset, newleaf);
    
    for (j = 0; j < dimen; j++){
        var nametest = "set" + arcnum + "_line_" + j;
        var lined = [points[j], leafs[j]];
        remover(nametest, lined, color_pal[arcnum]);
    };
    var nametest = "set" + arcnum + "arc";
    remover(nametest, lined, color_pal[arcnum]);
    
    //add draw new arc/lines
    draw_new_line(arcnum,newoffset,dimen);
    
    //full_precrits();
    
    //precrit_leaves();

};



////
//TO DO
// new function to determine initial arc placement + naming conventions for arcs
// 
// on initial set up include no overlap
// rank by leaf len
// check for overlap from top to bottom
// implement precrit addition from within each leaf ! -- recursively!!
////


function check_avail_int(start = 0, end = 2*Math.PI){
    console.log("checking");
    // order start angles here (or index of start angles here
    var angi = 0;
    var avail = [];
    for (var k = 0; k < places.length; k ++){
        if (places[k] <= angle[angi]){
            
        } else if (places[k] >= eng[angi]){
            angi ++ ;
        } else {
            // do nothin
        }
        
    };  
};


function giveang_plot(name, t,precrit,  total_l = (Math.PI*2)){
    // this is horribly inelegant but I really hope that it works
    //console.log(places)
    for (var i = 0; i < places.length; i++){
        //console.log(i);
        //console.log(places[i]);
        //console.log(name);
        if (places[i][0] === name){
           var choose = places[i][1];
           
        };
    };
    //console.log("choose", choose);
    differences = [];
    
    //console.log(total_l)
    console.log(choose, "choose")
    
    for (var i = 1; i < choose.length; i ++){
        if (i % 3 === 0 ){
            // do nothing
            differences.push(choose[i] - choose[i-1]);
        };
        if (i === choose.length - 1){
            differences.push((total_l - choose[i]));
            
        }
    }
    console.log(differences);
    
    var sum = differences.reduce(add);
    
    
    var percents = [];
    for (var i = 0; i < differences.length; i++){
        percents.push(differences[i]/sum);
    }
    
    var step = t;
    for (var i = 0; i < differences.length; i++){
        console.log(i, "i is");
        if (step >= percents[i]){
            step = step - percents[i];
            console.log("step", step);
        } else {
            var div = step/percents[i];
            if (i === 0){
                var angle = div*differences[i] + choose[i];
                
            } else if (i === 1){
                var angle = div*differences[i] + choose[2];
                
            } else {
                var angle = div*differences[i] + choose[i*3 + 2];
                
                //console.log(i*3);
            };
        };
    };
    
    return angle;
}

function draw_pc_points2(pc, search_pre, precrit_num, ind, index_leaf = false, subpre2 = false){
    if (pc === -1){
        var total_l = 2*Math.PI;
    } else {
        for (var k = 0; k < arc_refs.length; k++){
           //console.log(pc);
           //console.log(arc_refs[k]["index"]);
           if (arc_refs[k]["pre"] === pc
                && arc_refs[k]["index"] === ind
                && arc_refs[k]["subpre"] === search_pre) {
            //console.log("oh");
            var tosave = arc_refs[k];
            var total_l = Math.abs(tosave["start"] - tosave["end"]);
            //console.log(total_l);
            };
        };
    };
    var name = "space" + ind + pc + precrit_num;
    //console.log(name);
    
    give_space(pc, ind, precrit_num, index_leaf);
    // rename
    
    //console.log(total_l)
    var ang2 = [];
    for (var t = 0; t < global_dim; t++){
        var ttt = (1/global_dim)* t; 
        
        //var leaf_len = global_leafs[ind]/(Math.exp(3, pc));
        var leaf_len = 30;
        var outangs = giveang_plot(name, ttt, total_l) + 0.04;
        out_line_draw(outangs, leaf_len, ind, pc, precrit_num);
        //console.log(outangs, "out");
        ang2.push(outangs);
    };
    
    
    
    // above just pushes other precrits up
    for (var j = 0; j < 1; j ++){
        var leaf_len = global_leafs[ind]/(Math.exp(3, pc));
        for (var i = 0;i < arc_refs.length; i++){
    if (pc === 0){  
        var big_start = 0;
        var end_start = 2*Math.PI;
    } else if (arc_refs[i]["index"] === index_leaf 
                && arc_refs[i]["pre"] === pc - 1 
                && arc_refs[i]["subpre"] === subpre2){
            var big_start = arc_refs[i]["start"];
            var end_start = arc_refs[i]["end"];
        } else {
            console.log("errrr");
        }
        
    }
        new_points_gen(0.1*ind, leaf_len, ind, 
    big_start,end_start, pc, precrit_num);
    
    }
} 

give_space(0,0);
function give_space(precrit, ind, precrit_num = false, index_pre = false){
    //console.log(ind);
    var all_angs = [];
    for(var i = 0; i < arc_refs.length; i++){ 
        //console.log(i);
        if (arc_refs[i]["pre"] === precrit
                && arc_refs[i]["prev"] === precrit_num 
                && arc_refs[i]["index_pre"] === index_pre ) {
            
            var str = arc_refs[i]["start"];
            
            
            //if (arc_refs[i]["end"] >= 0){
            var en = arc_refs[i]["end"];
            //} else {
            //    var en = 2*Math.PI + arc_refs[i]["end"];
            //}
            
            var pair = [str, en];
            var right_pair = refSort(pair, pair);
            //console.log(pair);
            //console.log(arc_refs[i])
            all_angs.push(right_pair);
            
    }};
    // for full circle will want precrit = 0, prev = false
    //search for all entries with that precrit and that precrit num
    //get start and end angle for that place, 
    // append to a list to pass to avail place
    // pass to avail_place with name as the big arc before 
    // (by precrit, index, and precrit num)
    // gotta be recrusive
    
    var name = "space" + ind + precrit + precrit_num;
    avail_place(name, all_angs, precrit);
};

function avail_place(name, angles, precrit){
    
    //remove old listing for that name
    for( var i = 0; i < places.length; i++){ 
        if (places[i][0] === name) {
            places.splice(i, 1); 
    }};
    
    
    low_angs = [];
    high_angs = [];
    numbered_list = [];
    for (var l = 0; l < angles.length; l++){
        numbered_list.push(l);
        
        if (angles[l][0] < angles[l][1]){
           low_angs.push(angles[l][0]);
           high_angs.push(angles[l][1]);
        } else if (angles[l][0] > angles[l][1]){
            low_angs.push(angles[l][1]);
            high_angs.push(angles[l][0]);
        } else{
            console.log("some reason arcs are equal");
        };
    };
    
    var avail = [];
    avail.push[0];
    
    var sorted = refSort (numbered_list, low_angs);
    
    for (var k = 0; k < sorted.length; k++){
        var num = sorted[k];
        avail.push(low_angs[num]);
        avail.push("no");
        avail.push(high_angs[num]);
    };
    
    //console.log(avail);
    
    places.push([name, avail, precrit]); 
}




