// The MIT License (MIT)

// Copyright (c) 2014 Antti Ukkonen

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

function Point( x, y ) {
    this.x = x;
    this.y = y;
}

function pava( points ) {
    points.sort( function(a,b) {
	if ( a.x == b.x ) {
	    // we want to sort in decreasing order according to y
	    return b.y - a.y;
	}
	// and in increasing order according to b
	return a.x - b.x;
    } );

    for ( var i = 1; i < points.length; i++ ) {
	if ( points[i].y > points[i-1].y ) {
	    // "backtrack" and pool adjacent violators until
	    // constraint is satisfied
	    var s = points[i].y + points[i-1].y;
	    var m = 2;
	    var j = i-2;
	    while ( j >= 0 && (s/m) > points[j].y ) {
		s += points[j].y;
		m++;
		j--;
	    }
	    j++;
	    // fill yhat with (s/m) until yhat[i]
	    var q = (s/m);
	    while ( j <= i ) {
		points[j].y = q
		j++;
	    }
	}
    }
}

function pava_aggregate( points ) {
    var a = new Array();
    for ( var i = 0; i < points.length; i++ ) {
	var x = points[i].x
	if ( a[ x ] == null ) {
	    a[ x ] = new Array();
	}
	a[ x ].push( points[i].y )
    }
    var new_points = new Array();
    for ( var i = 0; i < a.length; i++ ) {
	if ( a[i] == null ) continue;
	new_points.push( new Array( i, Math.round(average( a[i] )) ) );
    }
    return new_points;
}

function average( estimates ) {
    var s = 0.0;
    for ( var i = 0; i < estimates.length; i++ ) {
	s += estimates[i];
    }
    return s/estimates.length
}
