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
// the support dropping below sigma.
function get_frequent_items( items, data, sigma, currentFreq ) {
    var new_items = new Array();
    var closed    = true;
    for ( var i = 0; i < items.length; i++ ) {
	var e = items[i].item;
        var efreq = data.item_freq(e);
	if ( efreq >= sigma ) {
	    new_items.push( { item:e, itemfreq:efreq } );
            closed = closed & ( efreq < currentFreq );
	}
    }
    return { items: new_items, closed: closed };
}

function sample_path( data, sigma, maxdepth ) {
    var currentFreq = data.num_rows;
    // make a copy of items because we will modify it
    // var items = data.items.slice(0);
    var candidates = new Array();
    for ( var i = 0; i < data.items.length; i++ ) {
        candidates.push( { item:data.items[i], itemfreq:currentFreq } );
    }
    var degrees = new Array();
    // by checking for <= maxdepth we in fact go one step deeper.
    // this is needed for closed set estimation, where we must know if
    // the node at the last level is closed.
    while ( degrees.length <= maxdepth ) {
	var res = get_frequent_items( candidates, data, sigma, currentFreq );
        candidates = res.items;
        degrees.push( { deg: candidates.length, closed: res.closed } );
	if ( candidates.length > 0 ) {
	    var idx = Math.floor( Math.random()*candidates.length );
	    var e   = candidates[ idx ];
	    // removes item at position idx
	    candidates.splice( idx, 1 );
	    // update projection on data
	    data.project_on_item( e.item );
            // update current frequency to that of the selected item
            currentFreq = e.itemfreq;
	} else {
	    break;
	}
    }
    data.clear_projection();
    return degrees;
}

function path_estimate( degrees, maxdepth ) {
    var x = 1.0;
    var d = 1.0;
    var correction = 1.0;
    var limit = maxdepth;
    if ( degrees.length < limit ) {
        limit = degrees.length;
    }
    for ( var i = 0; i < limit; i++ ) {
	d *= degrees[i].deg;
	correction = correction*(i+1);
	x += d/correction;
    }
    return x;
}

function path_estimate_closed( degrees, maxdepth ) {
    var x = 1.0;
    var d = 1.0;
    var correction = 1.0;
    var limit = maxdepth;
    if ( degrees.length < limit ) {
        limit = degrees.length;
        // Push a final item that represents the last entry
        // that is always closed but has zero degree due to
        // the itemset being on the border.
        degrees.push( { deg: 0, closed: true } )
    }    
    for ( var i = 0; i < limit; i++ ) {
	d *= degrees[i].deg;
	correction = correction*(i+1);
	x += (d/correction * degrees[i+1].closed);
    }
    return x;
}

function fast_est( data, sigmas, path_est_fnc, maxdepth ) {
    var estimates = new Array();
    for ( var i = 0; i < sigmas.length; i++ ) {
	estimates.push( path_est_fnc( sample_path( data, sigmas[i], maxdepth ), maxdepth ) );
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
