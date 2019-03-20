/* 
 * Last edited on March 13, 2019 by Claire Valva
 * 
 * 
 * TO DO: add round slider
 * TO DO: debug if necessary --- 
 * TO DO: add other arrangements -- that comes next!
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
var all_names = [];
var arc_ref_2 = [];
var offset_log = [];

var places = [];
var ang = 2*Math.PI/360;
//for (var place = 0; place < 360; place ++){
    
    //var add = place*ang;
    //places.push(add);
//}


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



// declare initial lengths (but make them all the same)
function initial_lens(ndim){
    // get initial length list
    lens = [];
    for (i = 0; i < ndim - 1; i++){
        lens[i] = 30;
    };
    global_leafs = lens;
    
    return lens;
};

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


// function to draw lines given a set of points
function draw_lines(twopoints, color, named){
    
    all_names.push(named);
    
    var pathData3 = lineGenerator(twopoints);

    d3.select('svg').selectAll('path')
        .data(twopoints, function(d){return d;})
        .enter()
        .append("path")
	.attr('d', pathData3)
        .attr("stroke", color)
        .attr("fill","none")
        .attr("id", named)
        .attr("stroke-width",3);
}


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
    //.min(initial_lens(global_dim)[index])
    .min(10)
    .max(100)
    .width(300)
    .ticks(5)
    .default(initial_lens(global_dim)[index])
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
    global_dim = newdim;
    
    setup(newdim);
};

// removes lines given name 
function remover(named,twopoints = [[0,0],[0,0]],color = "red"){
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

//console.log(leaf_comp(11, 10));
//literally just rewrite below.. something is messed up
function leaf_comp(big_l, small_l){
    // takes two input leaves (one bigger and one smaller)
    // finds how many precritical leaves need to display
    //console.log("is" + big_l);
    var greater = false;
    var exponent = 0;
    var times = 1;
    
    var hey = false;
    
    if (big_l === small_l){
        return(0);
    }
    
    while (greater === false){
        //apend something
        var divider = Math.pow(global_dim, exponent);
        var tocomp = big_l / divider;
        //console.log(tocomp)
        if (tocomp < small_l){
            greater = true;
            
            //console.log(tocomp < small_l);
            //console.log(exponent);
            return(exponent);
        } else {
            exponent = exponent + 1;
        }
        
        times++;
        if (times === 10){
            return console.log("oops, recursion comparing lengths is too long");
        }
    };

    return exponent;
    // something weeird is going on here... fix
}


function arc_entry(start_ang, end_ang, leaf_len, index, precrit, precrit_num, index_pre = false, precrit_num_pre = false, two_parts = false){
    // start angle is first one
    // end angle is second one
    // leaf len
    // index -- for color
    // precrit = 0 if critical, count if else
    // precrit number -- just for indexing
    // unique name
    // if two_parts has multiple then look at parts of arcs
    global_precrit_names.push("name_" + index + "_" + precrit + "_" + precrit_num);
    
    
    return{
        start: start_ang,
        end: end_ang,
        leaf: leaf_len,
        index: index,
        pre: precrit,
        subpre: precrit_num,
        parts: two_parts,
        prev: precrit_num_pre,
        index_pre: index_pre,
        unique_name : "name_" + index + "_" + precrit + "_" + precrit_num + "_" + precrit_num_pre + "_" + index_pre
    };
}

function list_del(index, precrit, precrit_num, precrit_num_pre, index_pre){
    var unique_name = "name_" + index + "_" + precrit + "_" + precrit_num + "_" + precrit_num_pre + "_" + index_pre;
    
    for( var i = 0; i < arc_refs.length; i++){ 
        if (arc_refs[i]["unique_name"] === unique_name) {
            arc_refs.splice(i, 1); 
    }
    
}
}

function arc_log(start_ang, end_ang, leaf_len, 
index, precrit, precrit_num, 
index_pre = false, precrit_num_pre = false, two_parts = false){
    
    list_del(index, precrit, precrit_num, precrit_num_pre, index_pre);
    arc_refs.push(arc_entry(start_ang, end_ang, leaf_len, 
    index, precrit, precrit_num, 
    index_pre, precrit_num_pre, two_parts));
    
}

   //draw the arcs now
function new_arcs_gen(start_ang, end_ang, color, firstname,leaf_len, index) {
    //gets all points and leaves, then draws the lines 
    
    var x_st = radius*Math.cos(start_ang) + 100 + radius;
    var y_st = radius*Math.sin(start_ang) + 100 + radius;
    
    var x_e = radius*Math.cos(end_ang) + 100 + radius;
    var y_e = radius*Math.sin(end_ang) + 100 + radius;
    
    
    if (start_ang > end_ang){
        var middle = (start_ang - end_ang)/2 + end_ang;
    } else {
        var middle = (end_ang - start_ang)/2 + start_ang;
    }
    
    var x_mid = (radius/20 - 4*10) * Math.cos(middle) + 100 + radius;
    var y_mid = (radius/20 - 4*10) * Math.sin(middle) + 100 + radius;
    
    var points = [[x_st, y_st], [x_mid, y_mid], [x_e, y_e]];
    
    
    draw_lines(points, color, firstname);
    
}

function setup(){
    arc_ref_2 = [];
    
    var leafs = initial_lens(global_dim);
    var oss = initial_os(global_dim);
    var theta = (2*Math.PI/global_dim);
    
    for (var ar = 0; ar < global_dim - 1; ar ++){
        for (var pr = 0; pr < 5; pr ++){
        //global_offsets[arcnum]
            if (pr === 0){
                log_o(ar, pr, global_offsets[ar]);
            } else {
                log_o(ar, pr, -global_offsets[ar] + 1);// + global_offsets[global_dim -2]*2);
            };
        };
    };
    
    
    for (var j = 0; j < global_dim - 1; j ++){
        new_points_gen(oss[j], leafs[j], j, 0,2*Math.PI, 0, 0); 
        
        arc_ref_2.push([j,j+1]);
        
        var start_ang = theta*(j) + oss[j];
        var end_ang = theta*(j+1)+ oss[j] ;
        var firstname = "name_" + j + "_" + 0 + "_" + 0;
        
        //arc_refs.push(arc_entry(start_ang, end_ang, leafs[j], j, 0, 0, false));
        
        //arc_log(start_ang, end_ang, leafs[j], j, 0, 0, false, false,false);
        new_arcs_gen(start_ang, end_ang, color_pal[j], firstname,leafs[j], j);
        
        //now get arcs
        var name1 = "arc " + j;
        slide_test(name1, j);
    
        var name2 = "length " + j;
        slide_leaves(name2, j);
    };
    
}

setup();


function new_points_gen(offset, leaf_len, index, 
big_start,end_start, precrit, precrit_num){
    
    var difference = Math.abs(big_start - end_start);
    
    var new_rad = radius + leaf_len;
    
    var to_plot = [];
    
    for (var j = 0; j < global_dim; j++){
        var theta = (difference/global_dim);
        
        
       var angle = ((theta*j) + offset) % difference;
       
       if (big_start > end_start){
            var actual = angle + end_start;
            
        } else {
            var actual = angle + big_start;
        }
        
        var x_short =  radius*Math.cos(actual) + 100 + radius;
        var y_short = radius*Math.sin(actual) + 100 + radius;
        
        var x_long =  new_rad*Math.cos(actual) + 100 + radius;
        var y_long = new_rad*Math.sin(actual) + 100 + radius; 
        var lined = [[x_short,y_short], [x_long, y_long]];
        to_plot.push([x_short,y_short], [x_long, y_long]);
       
        var nametest = "line" + index + precrit + precrit_num;
        
        
        draw_lines(lined, color_pal[index], nametest);
    }
}

function out_line_draw(actual, leaf_len, index, precrit, precrit_num){
    //console.log(actual,"act");
    
    var nametest = "line_out" + index + precrit + precrit_num;
    
    
    var new_rad = radius + leaf_len; 
    
    var x_short =  radius*Math.cos(actual) + 100 + radius;
    var y_short = radius*Math.sin(actual) + 100 + radius;
        
     var x_long =  new_rad*Math.cos(actual) + 100 + radius;
     var y_long = new_rad*Math.sin(actual) + 100 + radius; 
     
    var lined = [[x_short,y_short], [x_long, y_long]];
    
    draw_lines(lined, color_pal[index], nametest);
}

function add(accumulator, a) {
    return accumulator + a;
}

function updater_move(arcnum, newoffset = false, dimen = global_dim, newleaf = false){
    // drawing new lines and removing the old ones
    if (newleaf === false){
        newleaf = global_leafs[arcnum];
    } else {
        global_leafs[arcnum] = newleaf;
    }
    
    var sign = false;
    if (newoffset === false){
        newoffset = global_offsets[arcnum];
    } else {
        if (global_offsets[arcnum] > newoffset){
            sign = -1;
        } else {
            sign = 1;
        };
        global_offsets[arcnum] = newoffset;
    }
    
    log_o(arcnum, 0, global_offsets[arcnum]);
    
    leaf_update(sign);
    
    manyfor_intersect(arcnum);

};

// CHECK THAT LEAF UPDATE WORKS

function leaf_update(sign, offset = false){
    
    for (var i = 0; i < all_names.length; i ++){
        remover(all_names[i]);
    }
    
    all_names = [];
    
    //console.log(global_offsets);
    
    for (var arcnum = 0; arcnum < global_dim - 1; arcnum++){
        // for each arc, draw appropriate number of precrit points
        var prenum = howmany(arcnum);
        //console.log("index", arcnum);
        //console.log("howmany", prenum);
        // check how many
        
        if (offset === false){
            var oss = global_offsets[arcnum];
        } else {
            var oss = offset[arcnum];
        }
        
        // inelegance.. but works?
        check_overlap(sign);
        check_overlap(sign);
        check_overlap(sign);
        check_overlap(sign);
        check_overlap(sign);
        check_overlap(sign);
        check_overlap(sign);
        check_overlap(sign);
        check_overlap(sign);

        for (var pre = 0; pre < prenum + 1; pre ++){
            
            for(var i = 0; i < offset_log.length; i++){ 
        
                if (offset_log[i]["pre"] === pre 
                    && offset_log[i]["ind"] === arcnum) {
                    
                    oss = offset_log[i]["off"]; 
                };
            };
            
            reg_points_gen(oss, false, arcnum, 0,2*Math.PI, pre, 0); 
            
            var firstname = "name_" + arcnum + "_" + pre + "_" + 0;
            reg_arcs_gen(oss, false,false, arcnum, color_pal[arcnum], firstname, pre,false);
        };
       
        
        
       
    };
    
    //console.log(arc_ref_2);
}



function reg_points_gen(offset, leaf_len = false, index, 
big_start = 0,end_start = 2*Math.PI, precrit, precrit_num = 0){
    
    var difference = Math.abs(big_start - end_start);
    
    var to_plot = [];
    
    if (leaf_len === false){
        leaf_len = global_leafs[index] / (Math.pow(global_dim, precrit));
    }
    var new_rad = radius + leaf_len;
    
    for (var j = 0; j < Math.pow(global_dim, precrit + 1); j++){
        var theta = (difference/(Math.pow(global_dim, precrit + 1)));
        
        
       var angle = ((theta*j) + offset) % difference;
       
       if (big_start > end_start){
            var actual = angle + end_start;
            
        } else {
            var actual = angle + big_start;
        }
        
        var x_short =  radius*Math.cos(actual) + 100 + radius;
        var y_short = radius*Math.sin(actual) + 100 + radius;
        
        var x_long =  new_rad*Math.cos(actual) + 100 + radius;
        var y_long = new_rad*Math.sin(actual) + 100 + radius; 
        var lined = [[x_short,y_short], [x_long, y_long]];
        to_plot.push([x_short,y_short], [x_long, y_long]);
       
        var nametest = "line" + index + precrit + precrit_num;
        
        
        draw_lines(lined, color_pal[index], nametest);
    }
}


function name_del(named){
    
    for( var i = 0; i < all_names.length; i++){ 
        if (all_names[i] === named) {
            all_names.splice(i, 1); 
    };
};
}

function howmany(arcnum){
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
   
   // get number of precrits to add
   for (item = 0; item < pairlist.length; item++){
       list_crits[item] = new_leaf_comp(global_leafs[pairlist[item][0]], global_leafs[pairlist[item][1]]);
   }
   //console.log(list_crits, "list_crits");
   var comp_arr = [];
   var counter = 0;
   
   for (var overlist = 0; overlist < pairlist.length; overlist++){

            if (pairlist[overlist][0] === arcnum){
            //add the crit points
                //console.log("item is" + item);
                //console.log("pair is" + pairlist[overlist]);
                comp_arr[counter] = list_crits[overlist];
                
                //console.log("listed", list_crits)
                counter++;
        } 
}
comp_arr.push(0);
var howmany = Math.max.apply(null,comp_arr);

           
return howmany;
}
// still have to fix howmany for weird first equality!!
//global_leafs = [10, 60, 60];
//console.log("zero", howmany(0));
//console.log("one", howmany(1));
//console.log("two", howmany(2));

function reg_arcs_gen(oss, start_ang = false, end_ang = false, index, 
color, firstname, precrit, leaf_len = false){
    //gets all points and leaves, then draws the lines 
    var theta = (2*Math.PI)/(Math.pow(global_dim, precrit + 1));
    
    if (leaf_len === false){
        leaf_len = global_leafs[index] / (Math.pow(global_dim, precrit));
    };
    
    for (var ppp = 0; ppp < Math.pow(global_dim, precrit + 1); ppp++){
    
        if (start_ang === false){
            var sang = oss + (theta*(arc_ref_2[index][0] + ppp*global_dim));
        } 
        if (end_ang === false){
            var eang = oss + (theta*(arc_ref_2[index][1] + ppp*global_dim));
        }
    
    //console.log(precrit);
    
    
    var x_st = radius*Math.cos(sang) + 100 + radius;
    var y_st = radius*Math.sin(sang) + 100 + radius;
    
    var x_e = radius*Math.cos(eang) + 100 + radius;
    var y_e = radius*Math.sin(eang) + 100 + radius;
    
    
    if (start_ang > end_ang){
        var middle = (sang - eang)/2 + eang;
    } else {
        var middle = (eang - sang)/2 + sang;
    }
    var adder = 0;
    if (precrit === 0){
         adder = 45;
    } else  if (precrit === 1){
        adder = 70;
    } else if (precrit === 2){
        adder = 10;
    } else {
        adder = 5;
    }
    
    //console.log(radius/20 - adder)
    var x_mid = (radius/20 - adder) * Math.cos(middle) + 100 + radius;
    var y_mid = (radius/20 - adder) * Math.sin(middle) + 100 + radius;
    
    var points = [[x_st, y_st], [x_mid, y_mid], [x_e, y_e]];
    
    arc_log(sang, eang, leaf_len, index, precrit, ppp, false, false, false);
        
    draw_lines(points, color, firstname);
    
    }; 
    
}

function log_o(index, precrit, offset = false){
    for(var i = 0; i < offset_log.length; i++){ 
        if (offset_log[i]["pre"] === precrit 
                && offset_log[i]["ind"] === index) {
            offset_log.splice(i, 1); 
    };};

    offset_log.push({pre: precrit, ind: index, off: offset});
};


function new_leaf_comp(big_l, small_l){
    // takes two input leaves (one bigger and one smaller)
    // finds how many precritical leaves need to display
    //console.log("is" + big_l);
    var greater = false;
    var exponent = 0;
    var times = 1;
    
    var hey = false;
    
    if (big_l === small_l){
        return(0);
    }
    
    while (greater === false){
        //apend something
        var divider = Math.pow(3, exponent + 1);
        var tocomp = 1 / divider;
        var ratio = small_l / big_l;
        
        //console.log("ratio", ratio, "div", divider, "exp", exponent);
        
        if (ratio > tocomp){
            //console.log("ratio", ratio, "div", divider, "exp", exponent);
            greater = true;
            return(exponent);
        } else {
            exponent = exponent + 1;
        }
        
        times++;
        //console.log("incremenet");
        if (times === 10){
            return console.log("oops, recursion comparing lengths is too long");
        }
    };

    return exponent;
    // something weeird is going on here... fix
}

function check_overlap(sign){
    var unfold = manyfor_intersect();
    var list_crits = unfold[0]; 
    var pairlist = unfold[1];
    
    if (sign === false){
        sign = 1;
    }
    // NOW NEED TO CHECK AGAINST ITSELF!!
    //console.log(unfold)
    // when hit add (or subtract theta) to bounce
    var many_list = [];
    
    for (var count = 0; count < global_dim - 1; count ++){
        //console.log(count);
        many_list[count] = howmany(count);
    }
    
    for (var pair = 0; pair < pairlist.length; pair++){
        var consider = pairlist[pair];
        var many = list_crits[pair];
        
        var num_con = list_crits[pair] + many_list[consider[1]] + 1;
        //console.log('list', list_crits[pair]);
        //console.log(many_list[consider[1]]);
        //console.log(num_con);
        
        var oss_list0 = [];
        var se_angs0 = [];
        
        for (var k = 0; k < num_con; k++){
            for (var i = 0; i < offset_log.length; i++){
            //console.log(i, "i");
            //console.log(consider[0], "consider")
            //console.log(offset_log[i])
            if (offset_log[i]["pre"] === k 
                    && offset_log[i]["ind"] === consider[0]){
                oss_list0.push(offset_log[i]["off"]);
                
                var theta = (2*Math.PI)/(Math.pow(global_dim, k + 1));
                var sang = offset_log[i]["off"] + (theta*(arc_ref_2[consider[0]][0] + k*global_dim));
                var eang = offset_log[i]["off"] + (theta*(arc_ref_2[consider[0]][1] + k*global_dim));
                
                sang = sang % (2*Math.PI);
                eang = eang % (2*Math.PI);
                
                se_angs0.push([k,sang,eang]);
            }
        }}
    
        //console.log(se_angs0)
        
        var oss_list1 = [];
        var se_angs1 = [];
        
        for (var j = 0; j < many_list[consider[1]] + 1; j++){
            //console.log(k)
            for (var i = 0; i < offset_log.length; i++){
                
                if (offset_log[i]["pre"] === j
                        && offset_log[i]["ind"] === consider[1]){
                    oss_list1.push(offset_log[i]["off"]);
                    
                    var theta = (2*Math.PI)/(Math.pow(global_dim, j + 1));
                    
                    var sang = offset_log[i]["off"] + (theta*(arc_ref_2[consider[1]][0] + j*global_dim));
                    var eang = offset_log[i]["off"] + (theta*(arc_ref_2[consider[1]][1] + j*global_dim));
                    //console.log(sang-eang);
                    sang = sang % (2*Math.PI);
                    eang = eang % (2*Math.PI);
                    se_angs1.push([j,sang,eang]);
                };
            };
        };
        
        for (var ent0 = 0; ent0 < se_angs0.length; ent0++){
            for (var ent1 = 0; ent1 < se_angs1.length; ent1++){
               
                var flip_min = Math.max.apply(null,[se_angs1[ent1][0], se_angs0[ent0][0]]);
                
                var theta_flip = (2*Math.PI)/(Math.pow(global_dim, flip_min + 1));
                
                var flip = false;
                if (se_angs0[ent0][1] > se_angs0[ent0][2]){
                    if (se_angs1[ent1][1] < se_angs0[ent0][1] &&
                         se_angs1[ent1][1] > se_angs0[ent0][2]){
                        flip = true;
                    } else if (se_angs1[ent1][2] < se_angs0[ent0][1] &&
                         se_angs1[ent1][2] > se_angs0[ent0][2]){
                         
                        flip = true;
                    };  
                };
                
                if (se_angs0[ent0][1] < se_angs0[ent0][2]){
                    if (se_angs1[ent1][1] > se_angs0[ent0][1]
                            && se_angs1[ent1][1] < se_angs0[ent0][2]){
                        flip = true;
                        //console.log("oh")
                            } else if (se_angs1[ent1][2] > se_angs0[ent0][1]
                            && se_angs1[ent1][2] < se_angs0[ent0][2]){
                        //console.log("also")
                              flip = true;  
                            };  
                };
                
                if (flip === true){
                    // don't forget to get direction for the flip
                    var newoss = oss_list1[se_angs1[ent1][0]] + theta_flip*sign;
                    log_o(consider[1], se_angs1[ent1][0], newoss);

                };
            
            };
        };
        
        for (var ent0 = 0; ent0 < se_angs0.length - 1; ent0++){
            for (var ent1 = ent0 + 1; ent1 < se_angs0.length; ent1++){
                
                //console.log("ent1", ent1)//
                //console.log("ent0", ent0)//
                
                var flip_min = Math.max.apply(null,[se_angs0[ent1][0], se_angs0[ent0][0]]);
                //console.log(flip_min)
                var theta_flip = (2*Math.PI)/(Math.pow(global_dim, flip_min + 1));
                var flip = false;
                if (se_angs0[ent0][1] > se_angs0[ent0][2]){
                    if (se_angs0[ent1][1] < se_angs0[ent0][1] &&
                         se_angs0[ent1][1] > se_angs0[ent0][2]){
                        flip = true;
                    } else if (se_angs0[ent1][2] < se_angs0[ent0][1] &&
                         se_angs0[ent1][2] > se_angs0[ent0][2]){
                         
                        flip = true;
                    };  
                };
                
                if (se_angs0[ent0][1] < se_angs0[ent0][2]){
                    if (se_angs0[ent1][1] > se_angs0[ent0][1]
                            && se_angs0[ent1][1] < se_angs0[ent0][2]){
                        flip = true;
                        //console.log("oh")
                            } else if (se_angs0[ent1][2] > se_angs0[ent0][1]
                            && se_angs0[ent1][2] < se_angs0[ent0][2]){
                        //console.log("also")
                              flip = true;  
                            };  
                };
                
                if (flip === true){
                    // don't forget to get direction for the flip
                    var newoss = oss_list0[se_angs0[ent1][0]] + theta_flip*sign;
                    log_o(consider[0], se_angs0[ent1][0], newoss);

                };
            
            };
        };
        
        for (var ent0 = 0; ent0 < se_angs1.length - 1; ent0++){
            for (var ent1 = ent0 + 1; ent1 < se_angs1.length; ent1++){
                
                //console.log("ent1", ent1)//
                //console.log("ent0", ent0)//
                
                var flip_min = Math.max.apply(null,[se_angs1[ent1][0], se_angs1[ent0][0]]);
                //console.log(flip_min)
                var theta_flip = (2*Math.PI)/(Math.pow(global_dim, flip_min + 1));
                //console.log(theta_flip);
                //console.log(theta_flip)
                var flip = false;
                if (se_angs1[ent0][1] > se_angs1[ent0][2]){
                    if (se_angs1[ent1][1] < se_angs1[ent0][1] &&
                         se_angs1[ent1][1] > se_angs1[ent0][2]){
                        flip = true;
                    } else if (se_angs1[ent1][2] < se_angs1[ent0][1] &&
                         se_angs1[ent1][2] > se_angs1[ent0][2]){
                         
                        flip = true;
                    };  
                };
                
                if (se_angs1[ent0][1] < se_angs1[ent0][2]){
                    if (se_angs1[ent1][1] > se_angs1[ent0][1]
                            && se_angs1[ent1][1] < se_angs1[ent0][2]){
                        flip = true;
                        //console.log("oh")
                            } else if (se_angs1[ent1][2] > se_angs1[ent0][1]
                            && se_angs1[ent1][2] < se_angs0[ent1][2]){
                        //console.log("also")
                              flip = true;  
                            };  
                };
                
                if (flip === true){
                    // don't forget to get direction for the flip
                    var newoss = oss_list1[se_angs1[ent1][0]] + theta_flip*sign;
                    log_o(consider[1], se_angs1[ent1][0], newoss);

                };
            
            };
        };
          
                
                
    };  
}


function manyfor_intersect(){
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
   
   // get number of precrits to add
   for (item = 0; item < pairlist.length; item++){
       list_crits[item] = leaf_comp(global_leafs[pairlist[item][0]], global_leafs[pairlist[item][1]]);
   }
   
   //console.log(list_crits);
   //console.log(pairlist);
   
   return [list_crits, pairlist];
}

// when button is clicked get value
function handleClick2(event){
    //console.log(document.getElementById("myVal").value);
    dim_restart(document.getElementById("myVal").value);
    return false;
            }
