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

function update_path_items( items, data, sigma ) {
    var new_items = new Array();
    for ( var i = 0; i < items.length; i++ ) {
	var e = items[i];
	if ( data.item_freq(e) >= sigma ) {
	    new_items.push( e );
	}
    }
    return new_items;
}

function sample_path( data, sigma ) {
    // make a copy of items because we will modify it
    var items = data.items.slice(0);
    var d = new Array();
    while ( items.length > 1 ) {
	items = update_path_items( items, data, sigma );
	if ( items.length > 0 ) {
	    d.push( items.length )
	    var idx = Math.floor( Math.random()*items.length )
	    var e = items[ idx ]
	    // removes item at position idx
	    items.splice( idx, 1 );
	    // update projection on data
	    data.project_on_item( e );
	} else {
	    break;
	}
    }
    data.clear_projection();
    return d;
}

function path_estimate( degrees ) {
    var x = 1.0;
    var d = 1.0;
    var correction = 1.0;
    for ( var i = 0; i < degrees.length; i++ ) {
	d *= degrees[i];
	correction = correction*(i+1);
	x += d/correction;
    }
    return x;
}

function fast_est( data, sigmas ) {
    var estimates = new Array();
    for ( var i = 0; i < sigmas.length; i++ ) {
	estimates.push( path_estimate( sample_path( data, sigmas[i] ) ) )
    }
    return estimates;
}

function convert_log10( points ) {
    var converted = new Array();
    for ( var i = 0; i < points.length; i++ ) {
	converted.push( new Array( points[i][0], Math.log( points[i][1] )/Math.LN10) )
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
