// The MIT License (MIT)

// Copyright (c) 2014 Antti Ukkonen, Matthijs van Leeuwen

// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:

// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.

// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
// THE SOFTWARE.

// Returns:
// - a list of items that remain frequent when added to the current itemset
//   together with their frequencies, and
// - a boolean that indicates if the current itemset is closed.
// An itemset is closed if we cannot extend it with any item without
// the support dropping below the current frequency.
function get_frequent_items( items, data, sigma, currentFreq ) {
    var new_items = new Array();
    var closed    = 1;
    for ( var i = 0; i < items.length; i++ ) {
	var e = items[i].item;
        var efreq = data.item_freq(e);
	if ( efreq >= sigma ) {
	    new_items.push( { item:e, itemfreq:efreq } );
            closed = closed * ( efreq < currentFreq );
	}
    }
    return { items: new_items, closed: closed };
}

function sample_path( data, sigma, maxdepth, sample_candidate_fnc ) {
    var currentFreq = data.num_rows;
    // make a copy of items because we will modify it
    // var items = data.items.slice(0);
    var candidates = new Array();
    for ( var i = 0; i < data.items.length; i++ ) {
        candidates.push( { item:data.items[i], itemfreq:currentFreq } );
    }
    var path = new Array();
    // by checking for <= maxdepth we in fact go one step deeper.
    // this is needed for closed set estimation, where we must know if
    // the node at the last level is closed.
    while ( path.length <= maxdepth ) {
	var res = get_frequent_items( candidates, data, sigma, currentFreq );
        candidates = res.items;
	if ( candidates.length > 0 ) {
            // idx has two elements:
            // i (the position of the item in candidates), and
            // invprob (inverse probability with which item was chosen)
            var idx = sample_candidate_fnc( candidates )
            var e   = candidates[ idx.i ];
	    // removes item at position idx
	    candidates.splice( idx.i, 1 );
	    // update projection on data
	    data.project_on_item( e.item );
            // update current frequency to that of the selected item
            currentFreq = e.itemfreq;
            // push the probability with which the current item was chosen on the path
            path.push( { deg: idx.invprob, closed: res.closed } );
	} else {
            path.push( { deg: 0, closed: res.closed } )
	    break;
	}
    }
    data.clear_projection();
    return path;
}

function sample_candidate_uniform( candidates ) {
    return { i: Math.floor( Math.random()*candidates.length ),
             invprob: candidates.length }
}

function sample_candidate_ifreq( candidates ) {
    // store the total item freq "mass" in x
    var x = 0;
    for ( var i = 0; i < candidates.length; i++ ) {
        x += candidates[i].itemfreq
    }
    var y = Math.random()*x;
    var xx = 0;
    for ( var i = 0; i < candidates.length; i++ ) {
        xx += candidates[i].itemfreq
        if ( y < xx ) {
            return { i: i, invprob: x/candidates[i].itemfreq };
        }
    }
    return { i: candidates.length-1, invprob: x/candidates[candidates.length-1].itemfreq };
}

function path_estimate( path, maxdepth ) {
    var x = 0.0;
    var d = 1.0;
    var correction = 1.0;
    var limit = maxdepth;
    if ( path.length < limit ) {
        limit = path.length;
    }
    for ( var i = 0; i < limit; i++ ) {
	d *= path[i].deg;
	correction = correction*(i+1);
	x += d/correction;
    }
    return x;
}

function path_estimate_closed( path, maxdepth ) {
    var x = 0.0;
    var d = 1.0;
    var correction = 1.0;
    var limit = maxdepth;
    if ( path.length <= limit ) {
        limit = path.length;
        // Push a final item that represents the last entry
        // that is always closed but has zero degree due to
        // the itemset being on the border.
        path.push( { deg: 0, closed: 1 } )
    }    
    for ( var i = 0; i < limit; i++ ) {
	d *= path[i].deg;
	correction = correction*(i+1);
	x += (d/correction * path[i+1].closed);
        // console.log( path[i].deg + " " + path[i].closed )
    }
    // console.log( "-1 -1" )
    return x;
}

function fast_est( data, sigmas, path_est_fnc, sample_cand_fnc, maxdepth ) {
    var estimates = new Array();
    for ( var i = 0; i < sigmas.length; i++ ) {
	estimates.push( path_est_fnc( sample_path( data, sigmas[i], maxdepth, sample_cand_fnc ),
                                      maxdepth ) );
    }
    return estimates;
}

function convert_log10( points ) {
    var converted = new Array();
    for ( var i = 0; i < points.length; i++ ) {
	converted.push( new Array( points[i][0], Math.log( points[i][1] )/Math.LN10) );
    }
    return converted;
}

function fitcurve( sigmas, estimates ) {
    var points = new Array();
    for ( var i = 0; i < sigmas.length; i++ ) {
	points.push( new Point( sigmas[i], estimates[i] ) );
    }
    // runs pava on points IN PLACE!
    pava( points );
    return convert_log10( pava_aggregate( points ) );
}

function get_sigmas( min_sigma, max_sigma, num ) {
    var sigmas = new Array();
    for ( var i = 0; i < num; i++ ) {
	sigmas.push( Math.floor( (max_sigma - min_sigma) * Math.random() + min_sigma ) );
    }
    return sigmas;
}
