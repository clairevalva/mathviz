/* 
 * Last edited on April 28, 2019 by Claire Valva
 * 
 *
 * 
 * 
 * add precrit checker and precrit spec angle
 * will require precrit checker
 * add length changer
 * add sliders
 * actually draw things
 * test it all
 * 
 * 
 */

// declare original circle
// constant throughout stuff
var radius = 1000/4;
var odim = 4;
var pi2 = 2*Math.PI;
var rez1 = 3*4;

// SOMETHING WEIRD IS GOING ON WITH THE SPACING?

//var resolution = rez1*global_dim*global_dim;

//declare initial color pallette
var color_pal = ["#6e40aa","#bf3caf","#fe4b83",
    "#ff7847","#e2b72f","#aff05b","#52f667",
    "#1ddfa3","#23abd8","#4c6edb","#8dd3c7",
    "#ffffb3","#bebada","#fb8072","#80b1d3",
    "#fdb462","#b3de69","#fccde5","#d9d9d9",
    "#bc80bd","#ccebc5","#ffed6f"];

var places = nlist(resolution, zeros = true);
var theta1 = nlist(global_dim - 1, zeros = true);

// to reset upon new dim
var global_leafs = [];
var global_dim = odim;
var resolution = rez1*global_dim*global_dim;

var spacing = resolution / global_dim;
// sOMETHING WITH THE SPACING IS WRONG?
var theta_1 = [];  
var preimages =[];

function delete_all() {
    //write function to start everything over
    svg = d3.selectAll("body").selectAll("svg");
    svg.remove();
    add_circle();
};

function nplaces(){
    places = nlist(resolution, zeros = true);
    for (var ko = 0; ko < places.length; ko++){
        places[ko] = nlist(global_dim*5, zeros = true);
        for (var jjj = 0; jjj < global_dim*5; jjj++){
            places[ko][jjj] = nlist(global_dim*global_dim, zeros = true);
        }
    }  
}

function nlist(length = global_dim - 1, zeros = false, el = false){
    // returns a list (equiv to range)
    var toret = [];
    
    for (i = 0; i < length; i++){
        // check for overlaps in order of lengths
        if (zeros === true){
            toret[i] = false;
        } 
        if (el === true) {
            toret[i] = 0;
        } 
        if (el !== true && zeros !== true) {
        toret[i] = i;
    }
    }
    
    return toret;
}

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
        .style("fill", "grey")
        .style("fill-opacity", 0.2); 
};
// to declare offsets after each reset
function set_os(ndim = global_dim){
    // function to get original layout from dimensions
    
    theta_1 = [];

    for (var i = 0; i < ndim - 1; i++){
        theta_1[i] = i*3;
        
    }
    
    for (var i = ndim - 1; i < global_dim*10; i++){
        
        theta_1[i] = nlist(global_dim*5, false, true);
    }
    
   
};

function set_preimages(ndim = global_dim){
    preimages = [];

    for (var i = 0; i < ndim - 1; i++){
        
        preimages[i] = [0,0,0];
        var place1 = theta_1[i];
        var place2 = (place1 + spacing - 1) %resolution;
        var place3 = (place2 + spacing - 1) %resolution;
        var place4 = (place3 + spacing - 1) %resolution;
        preimages[i][0] = [place1, place2, place3, place4];
    }
    
    for (var pre = 1; pre < 3; pre++){
        for (var i = 0; i < ndim - 1; i++){
            
            var inded = (global_dim-1)*pre + i;
            
            preimages[inded] = nlist(Math.pow(global_dim, pre), false, true);
            
            var sp = spacing / Math.pow(global_dim,pre);
            
            for (var subpre = 0; subpre < Math.pow(global_dim, pre); subpre++){
                
                
                var place1 = (sp*subpre + spacing*subpre)%resolution;
                var place2 = (sp*(subpre + 1) + spacing*subpre)%resolution;
                var place3 = (sp*(subpre + 2) + spacing*subpre)%resolution;
                var place4 = (sp*(subpre + 3) + spacing*subpre)%resolution;
                    
                    if (subpre === 0){
                        place1  = place1 +1;
                        place2 = place2 +1;
                        place3 = place3 +1;
                        place4 = place4 +1;
                    }
                 
                    
                
                preimages[inded][subpre] = [place1, place2, place3, place4];
            }
        }
    }
}

function set_lens(ndim = global_dim){
    // get initial length list
    lens = [];
    for (var i = 0; i < ndim - 1; i++){
        lens[i] = 30 + i*2;
    };
    //console.log(lens)
    global_leafs = lens;
};

function dim_restart(dim){
    global_dim = dim;
    
    delete_all();
    theta_1 = [];
    
    resolution = rez1*global_dim*global_dim;
    spacing = resolution / global_dim;
    resolution = rez1*global_dim*global_dim;
    
    
    
    nplaces(dim);
    set_lens(dim);
    set_os(dim);
    /// adjust preims!! preimages[inded][subpre]
    
    
    set_preimages();
    
    
    
    //console.log(preimages[1])
    for (var j = 0; j < global_dim - 1; j++){
        places[preimages[j][0][j]][j] = j;
        places[preimages[j][0][j + 1]][j] = j;
    }
    
    
    draw_things();
    
    
    for (var j = 0; j < global_dim - 1; j++){
        
        if (j !== 0){
           var name1 = "arc " + j;
           slide_test(name1, j); 
        }
        
        
    
        var name2 = "length " + j;
        slide_leaves(name2, j);
    }
    // do the drawing
    // now draw this
}

function need_pres(index, indj = false){
    var lens = global_leafs[index];
    var iter_list = [];
    
    for (var i = 0; i < global_dim - 1; i ++){
        
        if (i === index){
            iter_list[i] = 0;
        } else if (i !== index && lens <= global_leafs[i]){
            iter_list[i] = 0;
        } else if (i !== index && lens > global_leafs[i]){
           var rep = false;
           var iter = 0;
           
           do {
               rep = false;
               var mut = Math.pow(global_dim, iter + 1);
               //console.log(lens/mut);
               
                if (lens/mut >= global_leafs[i]){
                   
                   rep = true;
                   iter = iter + 1;
                   iter_list[i] = iter;
                   
               }
               
               if (iter > 10){
                   console.log("errrr");
                   break
               }
           }
           while (rep === true)
        }
    }
        iter_list.push(0);
        
        
        if (iter_list.length !== 1){
           var maxed = iter_list.reduce(function(a, b) {
            return Math.max(a, b);
        }); 
        } else {
            var maxed = 0;
        }
        
        
    
        if (indj === false){
            return maxed;
        } else {
            return iter_list[indj];
        }
}

function iter_order(index, pre, chged = false){
    var sorted = refSort(nlist(), global_leafs);
    
    for (var nn = 0; nn <= sorted.length; nn++){
        
        if (sorted[nn] === index){
            var kk = nn;
            break
        }
    }
    
    var ordered = [];
    
    
    for (var app = 0; app < kk; app++){
        // add all leafs (crit) which are longer
        ordered.push([sorted[app],0]);
        
        if (need_pres(sorted[app]) !== 0){
            // add precrit leaves which are longer and do interfere
            for (var app2 = 1; app2 <= need_pres(sorted[app], indj = index); app2++){
                ordered.push([sorted[app], app2]);
            }
        }
    }
    
    if (chged === false && pre >= 1){
        // add own leaves to check against
        for (var pred = 0; pred < pre; pred ++){
            ordered.push([index, pred]);
        }
    }
    
    for (var nn = kk + 1; nn < global_dim - 1; nn ++){
        
        if (need_pres(sorted[kk], sorted[nn]) <  pre){

            for (var ugh = 0; ugh < pre; ugh ++){
                ordered.push([sorted[nn], ugh]);
            }
        }
    }
    
    return ordered;
}

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
  var mapped =  indices.map(function(index) {
    return targetData[index];
  });
  return mapped.reverse();
}

function pairwise(list) {
  // creates unique (up to content, not order) pairs from a given list
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
 
function remover(named,twopoints = [[0,0],[0,0]],color = "red"){
    // removes one color
    //gen lines
    var lineGenerator = d3.line()
            .curve(d3.curveBundle.beta(0.8))
            .x(function(d) { return d[0];})
            .y(function(d) { return d[1]; });

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

function draw_lines(twopoints, color, named){
    
    //gen lines
    var lineGenerator = d3.line()
        .curve(d3.curveBundle.beta(0.8))
        .x(function(d) { return d[0];})
        .y(function(d) { return d[1]; });
    
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

function leaf_change(input, ind_change, sign_change){
   // function called on changing leafs, adds or deletes precrits, then 
   // calls ang change
    
    // checks for changes in precrits
    var need_old = [];
    var need_new = [];
    
    for (var h = 0; h < global_dim - 1; h++){
        need_old.push(need_pres(h));
    }
    
    global_leafs[ind_change] = input; 
    
    for (var h = 0; h < global_dim - 1; h++){
        need_new.push(need_pres(h));
    }
    
    // implements changes in precrits
    
    for (var h = 0; h < global_dim - 1; h++){
        
        
        
        var newed = need_new[h];
        var olded = need_old[h];
        
        
        
        if (newed > olded){
           
            for (var ttt = olded + 1; ttt <= newed; ttt++){
                var inded = h + (ttt*(global_dim - 1));
                
                
                preimages[inded] = pre_assign();
                
                
                for (var subpre = 0; subpre < global_dim; subpre++){
                    
                    if (subpre !== global_dim - 1){
                       places[preimages[inded][subpre][subpre]][inded][subpre] = subpre;
                       places[preimages[inded][subpre][(subpre+1)%global_dim]][inded][subpre] = subpre;
                    } else {
                       places[preimages[inded][subpre][2]][inded][subpre] = subpre;  
                       places[preimages[inded][subpre][1]][inded][subpre] = subpre;  
                    }
                    
                    
                }
                
                
            }
            
            ang_change(h, 0);
            
            
             
        } else if (olded > newed){
            
            
            for (var ttt = newed + 1; ttt <= olded; ttt++){
            var inded = h + (ttt*(global_dim - 1));
                
            for (var ps = 0; ps < Math.pow(global_dim,ttt); ps++){
                var current = angle_fetch(ind_change, ttt, ps,true);
                
                
                
                places[current[0]][inded][subpre] = false;
                places[current[1]][inded][subpre] = false;
                
                
                var firstname = "line1" + String(h) + String(ttt) + String(ps);
                remover(firstname);
                
                var firstname = "line0" + String(h) + String(ttt) + String(ps);
                remover(firstname);
                
                var firstname = "arc" + String(h) + String(ttt) + String(ps);
                remover(firstname);
                }
            }
            
           ang_change(h, 0); 
        }
        
    }
    //console.log(places)
}

function ang_change(ind_change, sign_change){
    // call this function if the angle of any leaf changes
    // so the angle change logs offsets
    // from v_0 down, check for overlap
    // sign change gives +- so know which way to slide
    var sorted = refSort(nlist(), global_leafs);
    // get length order of list 
    for (var i = 0; i < global_dim - 2; i++){
        
        for (var j = i + 1; j < global_dim - 1; j++){
            // get angles for smaller
            if (overlap_check(sorted[i],sorted[j]) === true){
                ang_flip(sorted[j], 0, 0);
            }
            
            if (need_pres(sorted[i],sorted[j]) !== 0){
                // will want to check this later
                
                pre_ckfp(sorted[j], ind_change, sign_change);
            }
        }
        
        if (need_pres(sorted[i]) !== 0){
            pre_ckfp(sorted[i], ind_change, sign_change);
        }
    }
}

function pair_possibilities(i, ind_s, presub = 0){
    var current = angle_fetch(i, ind_s, presub = 0);
    var all = all_preims(i, ind_s, presub = 0);
    
    var pairs = pairwise(all);
    
                    var iterthru = [];
                    
                    for (var m = 0; m < pairwise.length; m++){
                    
                    if (pairs[m][0] === current[0]){
                        iterthru.push(pairs[m]);
                    } else if (pairs[m][0] === current[1]){
                        iterthru.push(pairs[m]);
                    } else if (pairs[m][1] === current[1]){
                        iterthru.push(pairs[m]);
                    } else if (pairs[m][1] === current[0]){
                        iterthru.push(pairs[m]);
                    }
                }
                
    return iterthru;            
}    

function pre_ckfp(i, ind_change, sign_change){
    var total_pres = need_pres(i);
    
    
    // go through each crit for this index
    // WHY INS:T THIS INCREASING
    for (var pre = 0; pre <= total_pres; pre++){
        
    for (var lll = 0; lll <= total_pres; lll++){
       
        
        var ordered = iter_order(i, pre);
        var inded = i + (pre*(global_dim - 1));
        // ADD IND CHANGE PART!!
        if (ordered.length === 0){
            // make sure not to permute something that has priority
            break
        }
        
        // go through pres got to circulate through
        for (var subpre = 0; subpre < Math.pow(global_dim, pre); subpre++){
            
            var overlap = true;
            
            //get preimages and current angle correct
            var vj = angle_fetch(i, pre, subpre, true);
            var all = all_preims(i, pre, subpre, true);
            
            var pairs = pairwise(all);
            var which = false;
            
            
            
            // check if arc goes over a preimage for pre and subpre
            // this is the arc that moved only really
            
            // if the preimage moves, 
            // append it to a list so that can do the slide 
            // with its lesser preimages also -- in theory don't have to do this
            
            for (var uuu = 0; uuu < ordered.length; uuu++){
                var big_leaf = (global_leafs[ordered[uuu][0]] >= global_leafs[i]);
                //console.log(big_leaf)
                if (ordered[uuu][1] < pre && ordered[uuu][0] === ind_change && big_leaf ){
                   
                    for (var subb = 0; subb < Math.pow(global_dim, ordered[uuu][1]); subb ++){
                        
                        var slid = slidey(i, pre, subpre, ordered[uuu][0], ordered[uuu][1], subb, sign_change);
                    }
                     
                }
            }
            
            
            
            
            // check over lesser preimage list
            
            
            // check if there is an overlap after that for everything bigger
            // fetch bigger current angle for thing in ordered
            // do the nice swaps if necessary
            
            var iterthru = [];
            for (var m = 0; m < pairs.length; m++){
        
                if (pairs[m][0] === vj[0]){
                    iterthru.push(pairs[m]);
                } else if (pairs[m][0] === vj[1]){
                    iterthru.push(pairs[m]);
                } else if (pairs[m][1] === vj[1]){
                    iterthru.push(pairs[m]);
                } else if (pairs[m][1] === vj[0]){
                    iterthru.push(pairs[m]);
                }
            }
            
            
            var ith = 0;
            
            
            var overlap = true;
            var replace = false;
            
            
            
            do {
                var subbed = true;
                
                
                //var newed = (theta_1[i][ind_b][bpresub] + sign_change)%resolution;
                if (ith !== 0){
                // if not the first round change the placement   
                    places[vj[0]][inded][subpre] = false;
                    places[vj[1]][inded][subpre] = false;
                    places[iterthru[ith][0]][inded][subpre] = subpre;
                    places[iterthru[ith][1]][inded][subpre] = subpre;
                
                    ith = ith + 1;
                    vj = angle_fetch(i, pre, subpre, true);
                    
                } else {
                    var trucur = vj;
                }
                
                if (ith >= iterthru.length && replace === false){
                    iterthru = pairs;
                    ith = 0;
                    replace = true;
                }
                
                if (ith >= iterthru.length - 1 && replace === true){
                    
                    console.log("no work");
                    overlap = true;
                    
                    places[vj[0]][inded][subpre] = false;
                    places[vj[1]][inded][subpre] = false;
                    places[trucur[0]][inded][subpre] = subpre;
                    places[trucur[1]][inded][subpre] = subpre;
                    
                    
                    break
                }
                
                        // check for all subpre intersections
                        for (var ord = 0; ord < ordered.length; ord++){
                            
                            
                            for (var subord = 0; subord < Math.pow(global_dim, ordered[ord][1]); subord ++){
                         // indexi, indexj, prei = 0, prej = 0, subi = 0, subj = 0        
                        //console.log("overlapped?" + ordered[ord][0] + ordered[ord][1] + subord);
                                if (overlap_check(indexi = ordered[ord][0], indexj = i, prei = ordered[ord][1],
                                prej = pre, subi = subord, subj = subpre)){
                                    
                                    var subbed = false;
                            //console.log(ordered[ord][0], ordered[ord][1])
                                 break
                                }
                            }
                    
                    
                            if (ord + 1 === ordered.length && subbed === true){
                                overlap = false;
                            }
                        }
                
                        if (ith === 0){
                            ith = ith + 1;
                            
                        }
                //console.log(ith)
                
            }
            while (overlap === true);   
        }
    }
            
    }        
}  

function ang_flip(j, pre = 0, subpre = 0){
    var sorted = refSort(nlist(), global_leafs);
    for (var hh = 0; hh < sorted.length; hh++){
        if (sorted[hh] === j){
            var sort_ind = hh;
        }
    }

    //console.log("sort", sort_ind);
    var overlap = true;
    
    var current = angle_fetch(j, pre = 0, subpre = 0,true);
    var all = all_preims(j, pre = 0, subpre = 0, true);
    
    var pairs = pairwise(all);
    //console.log(j,pre,subpre);
    //console.log("all", all);
    //console.log("current", current);

    
    var iterthru = [];
    for (var m = 0; m < pairs.length; m++){
        
        if (pairs[m][0] === current[0]){
            iterthru.push(pairs[m]);
        } else if (pairs[m][0] === current[1]){
            iterthru.push(pairs[m]);
        } else if (pairs[m][1] === current[1]){
            iterthru.push(pairs[m]);
        } else if (pairs[m][1] === current[0]){
            iterthru.push(pairs[m]);
        }
    }
    // add all options here?
    
    
    
    var ith = 0;
    
    var inded = j + (pre*(global_dim - 1));
    var replace = false;
    
    do {
        
        if (ith >= iterthru.length && replace === false){
            iterthru = pairs;
            ith = 0;
            replace = true;
        }
        
        if (pre === 0){
            places[current[0]][inded] = false;
            places[current[1]][inded][subpre] = false;
        
            
            places[iterthru[ith][0]][inded] = j;
            places[iterthru[ith][1]][inded] = j;
        } else {
            places[current[0]][inded][subpre] = false;
            places[current[1]][inded][subpre] = false;
        
            
            places[iterthru[ith][0]][inded][subpre] = j;
            places[iterthru[ith][1]][inded][subpre] = j;
        }
        
        
        
        
        // change overlap check to do by length!!
        for (var k = 0; k < sort_ind; k++){
            // pull up iter list and have check through these(!)
            if (overlap_check(sorted[k],j) === true){
                
                break
            } 
            
            if (k + 1 === sort_ind){
                overlap = false;
                break
            }
            
            
        }
        
        ith = ith + 1;
        
        
        
        
        
        current = angle_fetch(j, pre, subpre, true);
    }
    while (overlap === true);
}

function all_preims(index, pre = 0, subpre = 0, more = false){
    // get locations of all preims points
    var inds = index + (pre*(global_dim - 1));
    
    
    if (pre !== 0){
        var thet1 = theta_1[inds][subpre];
    } else {
        var thet1 = theta_1[inds];
        //more = false;
    }
    
    var pts = [];
    if (pre === 0){
        var spc = spacing;
    } else {
        var spc = spacing / (Math.pow(global_dim, pre));
    }
    
    if (more){
        pts = preimages[inds][subpre];
    } else {
        var mult = 1;
    
        for (var i = 0; i < global_dim*mult; i ++){
            if (i !== 0){
               pts[i] = Math.round((thet1 + (i*spc)) % resolution) % resolution; 
            } 
            pts[i] = Math.round((thet1 + (i*spc)) % resolution) % resolution;
        }
    }
    
    //console.log("places", pts, "name", index,pre,subpre);
    return pts;
}

function between(x, min, max) {
    return x >= min && x <= max;
}

function outside(x,min,max){
    return x <= min || x>= max;
}

function angle_fetch(index, pre = 0, subpre = 0, more = false){
    // gets angles to connect each point
    // ANGLE FETCH IS WRONG
    
    var pts = all_preims(index, pre, subpre, more);
    
    
    var first = false;
    var inded = index + (pre*(global_dim - 1));
    //console.log(pts[2])
    //console.log(index)
    //console.log(places[10][1] === index)
    
    
    for (var k = 0; k < pts.length; k++){
         //console.log("places[pts[k]][inded]")
         //console.log("uh", places[pts[k]]);
         //console.log("pts", pts[k]);
         //console.log("rpre", pre);
         //console.log(places[pts[k]]);
        
         
        if (places[pts[k]][inded] === index && pre === 0){
            
            if (first === false){
               
               var ang1 = pts[k];
               first = true;
               
            } else {
               var ang2 = pts[k] ;
            }
        }
        
        
        if (places[pts[k]][inded][subpre] === subpre){
            if (first === false){
               
               var ang1 = pts[k];
               first = true;
               
            } else {
               var ang2 = pts[k] ;
            }
        }
    }
    
    
    return [ang1, ang2];
}

function overlap_check(indexi, indexj, prei = 0, prej = 0, subi = 0, subj = 0 ){
    // function checks for arc overlap
      
    var vi = angle_fetch(indexi, prei, subi, true);
    var vj = angle_fetch(indexj, prej, subj, true);
    
   
    
    if (vi[0] < vi[1]){
       var be1 = between(vj[0], vi[0], vi[1]);
       var be2 = between(vj[1], vi[0], vi[1]); 
    } else {
       var be1 = between(vj[0], vi[1], vi[0]);
       var be2 = between(vj[1], vi[1], vi[0]);  
    }

    var bet = null;
    if (be1 !== be2){
        bet = true;
    } else {
        bet =  false;
    }
    
    if (vi[0] < vi[1]){
       var oe1 = outside(vj[0], vi[0], vi[1]);
       var oe2 = outside(vj[1], vi[0], vi[1]); 
    } else {
       var oe1 = outside(vj[0], vi[1], vi[0]);
       var oe2 = outside(vj[1], vi[1], vi[0]);  
    }

    var out = null;
    if (oe1 !== oe2){
        out = true;
    } else {
        out = false;
    }
    
    //return bet;
    //
    if (out === false){
        return false;
    } else if (bet === false) {
        return false;
    } else {
        
        return true;
    }
    
    
    
}

function handleClick(event){
    // when button is clicked get value
    //console.log(document.getElementById("myVal").value);
    
    dim_restart(document.getElementById("myVal").value);
    return false;
            }

function updater_ang(index, val){
    var newval = val*resolution/pi2;
    //console.log(newval)
    if (newval > theta_1[index]){
        var sign_change = 1;
    } else {
        var sign_change = -1;
    }
    var changed = (newval - theta_1[index]) % resolution;
    changed = Math.round(changed);
    
    var current = angle_fetch(index, 0, 0, true);
    
                    
    places[current[0]][index][0] = false;
    places[current[1]][index][0] = false;
    
    theta_1[index] = newval;
    
    
    var place1 = Math.round(theta_1[index]);
    var place2 = (place1 + spacing - 1) %resolution;
    var place3 = (place2 + spacing - 1) %resolution;
    var place4 = (place3 + spacing - 1) %resolution;
    
    preimages[index][0] = [place1, place2, place3, place4];
    
    /// lkjflkfsdklfs changes places
    // console.log(changed);
    var new0 = Math.round((current[0] + changed) % resolution);
    var new1 = Math.round((current[1] + changed) % resolution);
    if (new0 < 0){
        new0 = resolution + new0;
    }
    if (new1 < 0){
        new1 = resolution + new1;
    }
    
    places[new0][index] = index;
    places[new1][index] = index;
    //console.log(places[current[0] + changed][index])
    //console.log(ang_difference(new0,new1));
    ang_change(index, sign_change);
    draw_things();
    
}

function slide_test(name, index){
    // adds new slider
    
    var slidersimple3 = d3
    .sliderBottom()
    .min(0)
    .max(Math.PI * 2 - 0.05)
    .width(300)
    .ticks(5)
    .step(Math.PI * 2/resolution)
    .default(0)
    .on('onchange', val => {
      //console.log("val");
        updater_ang(index, val)
      ;
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

function updater_leaf(index, val){
    if (global_leafs[index] > val){
        var sign_change = -1; 
    } else {
        var sign_change = 1;
    }
    
    
    leaf_change(val, index, sign_change);
    draw_things();
    
}

function slide_leaves(name, index){
    // adds new slider
    
    var slidersimple3 = d3
    .sliderBottom()
    .min(0)
    .max(100)
    .width(300)
    .ticks(5)
    .default(global_leafs[index])
    .on('onchange', val => {
      //console.log("val");
      updater_leaf(index, val);
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

function arcs_gen(index, pre = 0, subpre = 0){
    //console.log(index,pre,subpre);
    if (pre === 0){
        subpre = 0;
    }
    var anged = angle_fetch(index, pre, subpre, true);
    var pres = all_preims(index, pre, subpre, true);
    
   
    
    var sang = pi2*anged[0]/resolution;
    var eang = pi2*anged[1]/resolution;
    
    var x_st = radius*Math.cos(sang) + 100 + radius;
    var y_st = radius*Math.sin(sang) + 100 + radius;
    
    var x_e = radius*Math.cos(eang) + 100 + radius;
    var y_e = radius*Math.sin(eang) + 100 + radius;
    
    //console.log(x_st)
    
    if (anged[0] > anged[1]){
        var middle = (sang - eang)/2 + eang;
    } else {
        var middle = (eang - sang)/2 + sang;
    }
    var adder = 0;
    if (pre === 0){
         adder = 50;
    } else  if (pre === 1){
        adder = 10;
    } else if (pre === 2){
        adder = 10;
    } else {
        adder = 5;
    }
    
    //console.log(radius/20 - adder)
    var x_mid = (radius/20 - adder) * Math.cos(middle) + 100 + radius;
    var y_mid = (radius/20 - adder) * Math.sin(middle) + 100 + radius;
    
    var points = [[x_st, y_st], [x_mid, y_mid], [x_e, y_e]];
    var firstname = "arc" + String(index) + String(pre) + String(subpre); 
    
    draw_lines(points, color_pal[index], firstname);
    
    }

function points_gen(index, pre = 0, subpre = 0){
    
    var div = Math.pow(global_dim, pre);
    var new_rad = radius + global_leafs[index]/div;
    
    var anged = angle_fetch(index, pre, subpre, true);
    var sang = pi2*anged[0]/resolution;
    var eang = pi2*anged[1]/resolution;
    
    var to_plot = [];
    
    var color_pal = ["#6e40aa","#bf3caf","#fe4b83",
    "#ff7847","#e2b72f","#aff05b","#52f667",
    "#1ddfa3","#23abd8","#4c6edb","#8dd3c7",
    "#ffffb3","#bebada","#fb8072","#80b1d3",
    "#fdb462","#b3de69","#fccde5","#d9d9d9",
    "#bc80bd","#ccebc5","#ffed6f"];
    
    for (var k = 0; k < 2; k++){
        var actual = pi2*anged[k]/resolution;
        var x_short =  radius*Math.cos(actual) + 100 + radius;
        var y_short = radius*Math.sin(actual) + 100 + radius;
        
        var x_long =  new_rad*Math.cos(actual) + 100 + radius;
        var y_long = new_rad*Math.sin(actual) + 100 + radius; 
        
        var lined = [[x_short,y_short], [x_long, y_long]];
        var firstname = "line" + String(k) + String(index) + String(pre) + String(subpre); 
        
        
        draw_lines(lined, color_pal[index], firstname);
    }
}

function draw_things(){
    for (var kkk = 0; kkk < global_dim - 1; kkk++){
        //make it draw things
        //jlksdfalkjfdskljdf
        var total_pres = need_pres(kkk);
        
        for (var pres = 0; pres <= total_pres; pres++){
            for (var subpre = 0; subpre < Math.pow(global_dim, pres); subpre++){
                var firstname = "line1" + String(kkk) + String(pres) + String(subpre);
                remover(firstname);
                
                var firstname = "line0" + String(kkk) + String(pres) + String(subpre);
                remover(firstname);
                
                var firstname = "arc" + String(kkk) + String(pres) + String(subpre);
                remover(firstname);
                
                arcs_gen(kkk,pres,subpre);
                points_gen(kkk,pres,subpre);
            }
        }
    }
}

function slidey(movei, movepre, movesubpre, bigi, bigpre, bigsubpre, direction = 0){
    //console.log("called:" +movei+movepre+movesubpre);
    
    var vi = angle_fetch(bigi, bigpre, bigsubpre, true);
    var vj = all_preims(movei, movepre, movesubpre, true);
    var inded = movei + (movepre*(global_dim - 1));
    
    
    var overlapped = overlap_check(bigi,movei,bigpre,movepre,bigsubpre,movesubpre);
    
    
    if (vi[0] > vi[1]){
        var vmin = vi[1];
        var vmax = vi[0];
    } else {
        var vmin = vi[0];
        var vmax = vi[1]; 
    }
                        
    var cttrue = 0;
    var ctfalse = 0;
    
    var border = 0;
                        
    for (var it = 0; it < global_dim; it++){
        if (vj[it] === vmin || vj[it] === vmax){
            border = border + 1;
        } else if (between(vj[it], vmin, vmax)){
            cttrue = cttrue + 1;
        } else {
            ctfalse = ctfalse + 1; 
        }
        
    }
    var change = true;
    var where = 0;
    
    if (cttrue + border === global_dim){
        where = true;
        change = false;
    } else if (ctfalse + border === global_dim) {
        where = false;
        change = false;
    } else if (ctfalse + border > cttrue){
        where = false;
    } else {
        where = true;
    }
    
    
    
    if (change){
       for (var it = 0; it < global_dim; it++){
        if (between(vj[it], vmin, vmax) !== where){
            var lol = it;
            
            }
       }
       
       
       
       if (vj[lol] < vmin && where){
           
           if (overlapped){
               places[vj[lol]][inded][movesubpre] = false;
               places[vmax][inded][movesubpre] = movesubpre;
               
           }
           
           
            preimages[inded][movesubpre][lol] = vmax;
       } else if (vj[lol] > vmax && where){
           
           if (overlapped){
               places[vj[lol]][inded][movesubpre] = false;
               places[vmin][inded][movesubpre] = movesubpre;
           }
           
           preimages[inded][movesubpre][lol] = vmin;
       } else if (where === false && direction < 0){
           if (overlapped){
               places[vj[lol]][inded][movesubpre] = false;
               places[vmax][inded][movesubpre] = movesubpre;
           }
           
           preimages[inded][movesubpre][lol] = vmax;
           
       } else if (where === false && direction > 0){
           if (overlapped){
               places[vj[lol]][inded][movesubpre] = false;
               places[vmin][inded][movesubpre] = movesubpre;
           }
           
           preimages[inded][movesubpre][lol] = vmin;
       }
    }
   
    
    if (movepre === 0){
            change = false;
    }
    
    
    
    return change;
}



function ang_difference(alpha, beta){
    var phi = Math.abs(beta - alpha) % resolution;
    var distance = phi > (resolution / 2) ? resolution - phi: phi;
    return distance;
}

function pre_assign(pre = 1){
    var fake_places = nlist(resolution);
    var to_return = nlist(global_dim);
    var sp = spacing/Math.pow(global_dim, pre);
    
    for (var hhh = 0; hhh < global_dim - 1; hhh++){
        var cur_ang = angle_fetch(hhh,0,0,true);
        var longer = [];
        if (Math.abs(ang_difference(cur_ang[0], cur_ang[1]) > spacing)){
                longer.push(hhh);
        }
    }
    
    for (var hhh = 0; hhh < global_dim - 1; hhh++){
        var longg = false;
        
        for (var lll = 0; lll < longer.length; lll++){
            if (hhh === longer[lll]){
                longg = true;
            }
        }
    
    
        var cur_ang = angle_fetch(hhh,0,0,true);
    
        if (cur_ang[1] > cur_ang[0]){
            var amin = cur_ang[0];
            var amax = cur_ang[1];
        } else {
            var amin = cur_ang[1];
            var amax = cur_ang[0];
        }
        
    
    
    if (longg === false){
        
        if ((amax - amin) > Math.abs(ang_difference(cur_ang[0], cur_ang[1]))){
                var place_1 = cur_ang[1];
                var place_2 = (cur_ang[1] + sp - 1) % resolution;
                var place_3 = (cur_ang[1] + sp*2 - 1) % resolution;
                var place_4 = (cur_ang[1] + sp*3 - 1) % resolution;
                
                to_return[hhh] = [place_1, place_2, place_3, place_4];
            var i = 0;
            do { 
                
                if (fake_places[i] <= amin|| fake_places[i] >= amax) {
                    
                    // removes things unevenly -- apend to a list first
                    fake_places.splice(i, 1); 
                } else {
                    i++;
                }
            } while (i < fake_places.length)
        } else {
            
            var place_1 = cur_ang[0];
            var place_2 = (cur_ang[0] + sp - 1) % resolution;
            var place_3 = (cur_ang[0] + sp*2 - 1) % resolution;
            var place_4 = (cur_ang[0] + sp*3 -1) % resolution;
                
            to_return[hhh] = [place_1, place_2, place_3, place_4];
            
            var i = 0;
            do { 
                
                if (fake_places[i] >= amin && fake_places[i] <= amax) {
                    
                    // removes things unevenly -- apend to a list first
                    fake_places.splice(i, 1); 
                } else {
                    i++;
                }
            } while (i < fake_places.length)
        }
            
        }
    }
    
    
    
    for (var ggg = 0; ggg < longer.length; ggg++){
        var cur_ang = angle_fetch(ggg, 0, 0, true);
        
        if ((amax - amin)  < Math.abs(ang_difference(cur_ang[0], cur_ang[1]))){
                for (var i = 0; i < fake_places.length; i++){
                    if (fake_places[i] === cur_ang[1]){
                        var placed = i;
                    }
                }
                var mod_len = fake_places.length;
                
                var place_1 = fake_places[placed];
                var place_2 = fake_places[(placed + sp*1 - 1) % mod_len];
                var place_3 = fake_places[(placed + sp*2 - 1) % mod_len];
                var place_4 = fake_places[(placed + sp*3 - 1) % mod_len];
                
                to_return[ggg] = [place_1, place_2, place_3, place_4];
            
            
                var i = 0;
            do { 
                
                if (fake_places[i] <= amin|| fake_places[i] >= amax) {
                    
                    // removes things unevenly -- apend to a list first
                    fake_places.splice(i, 1); 
                } else {
                    i++;
                }
            } while (i < fake_places.length)
            } else {
                
                for (var i = 0; i < fake_places.length; i++){
                    if (fake_places[i] === cur_ang[0]){
                        var placed = i;
                    }
                }
                var mod_len = fake_places.length;
                
                var place_1 = fake_places[placed];
                var place_2 = fake_places[(placed + sp*1 - 1) % mod_len];
                var place_3 = fake_places[(placed + sp*2 - 1) % mod_len];
                var place_4 = fake_places[(placed + sp*3 - 1) % mod_len];
                
                to_return[ggg] = [place_1, place_2, place_3, place_4];
                var i = 0;
                
                do { 
                
                if (fake_places[i] >= amin && fake_places[i] <= amax) {
                    
                    // removes things unevenly -- apend to a list first
                    fake_places.splice(i, 1); 
                } else {
                    i++;
                }
            } while (i < fake_places.length)
 
            }

    }
    
    var mod_len = fake_places.length;
    
    var place_1 = fake_places[0];
    var place_2 = fake_places[(sp*1 -1 ) % mod_len];
    var place_3 = fake_places[(sp*2 -1 ) % mod_len];
    var place_4 = fake_places[(sp*3 -1)% mod_len];
    
    
        
    to_return[global_dim - 1] = [place_1, place_2, place_3, place_4];
    
   return to_return; 
}



// CONVERT ALL TO DO WHILE STUFF
add_circle();
dim_restart(global_dim);





