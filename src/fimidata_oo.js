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

function Data() {
    this.columns    = null;
    this.items      = null;
    this.projection = null;
    this.num_rows   = 0;
    this.num_cols   = 0;
}

// gets a list of all items that have a nonempty transaction list
Data.prototype.get_items = function() {
    var items = new Array();
    for ( var i = 0; i < this.columns.length; i++ ) {
	if ( this.columns[i] != null ) {
	    items.push( i );
	}
    }
    return items;
}

// gets the frequency of the item having the max frequency
Data.prototype.get_max_item_freq = function() {
    var maxfreq = -1;
    for ( var item = 0; item < this.columns.length; item++ ) {
	if ( this.columns[item] != null &&
	     this.columns[item].num_ones > maxfreq ) {
	    maxfreq = this.columns[item].num_ones;
	}
    }
    return maxfreq;
}

// Returns the frequency of an item in the current projection.
Data.prototype.item_freq = function( item ) {
    if ( this.projection == null ) {
	return this.columns[item].num_ones;
    }
    return bitvector_isect( this.projection, this.columns[item] ).num_ones;
}

// Projects the current view on the item.
Data.prototype.project_on_item = function( item ) {
    if ( this.projection == null ) {
	this.projection = this.columns[item];
    }
    else {
	this.projection = bitvector_isect( this.projection, this.columns[item] );
    }
}

// Clears the current projection.
Data.prototype.clear_projection = function() {
    this.projection = null;
}

// Loads the data from a String in Fimi format
Data.prototype.build_vertical_from_fimi = function( fimitext ) {
    var fimilines = fimitext.split( "\n" );
    var columns = new Array();
    var maxtid  = 0;
    for ( var tid = 0; tid < fimilines.length; tid++ ) {
        if ( fimilines[tid].length == 0 ) {
            continue;
        }
	var transaction = fimilines[tid].split( /\s+/ );
	for ( var j = 0; j < transaction.length; j++ ) {
	    var item = parseInt( transaction[j].trim() );
	    if ( columns[item] == null ) {
		columns[item] = new Array();
	    }
	    columns[item].push( tid );
	}
        maxtid++;
    }
    // update columns to use bitvector
    for ( var i = 0; i < columns.length; i++ ) {
	if ( columns[i] == null ) continue;
	columns[i] = bitvector_init_from_sorted_list( columns[i] );
    }
    this.columns  = columns;
    this.items    = this.get_items();
    this.num_rows = maxtid;
    this.num_cols = this.items.length;
}
