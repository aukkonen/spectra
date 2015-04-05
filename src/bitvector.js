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

var bitvector_bitcount = bitvector_compute_bitcount_table();

function bitvector_count_bits( int16 ) {
    var count = int16 & 0x1;;
    for ( var i = 1; i < 16; i++ ) {
	count += (int16 >> i) & 0x1;
    }
    return count;
}

function bitvector_compute_bitcount_table() {
    var table = new Array();
    var N = 1 << 16;
    for ( var i = 0; i < N; i++ ) {
	table[i] = bitvector_count_bits(i);
    }
    return table;
}

function bitvector_init_empty() {
    var bv = new Object();
    bv.num_ones = 0;
    return bv;
}

function bitvector_init_zeros( num_buckets ) {
    var bv = bitvector_init_empty();
    bitvector_fill_zeros( bv, num_buckets );
    return bv;
}

// This assumes sorted_list is indeed sorted and that no duplicates appear.
function bitvector_init_from_sorted_list( sorted_list ) {
    var num_buckets_needed = Math.floor( sorted_list[sorted_list.length-1]/32 ) + 1
    var bv = bitvector_init_zeros( num_buckets_needed );
    for ( var i = 0; i < sorted_list.length; i++ ) {
	bitvector_set( bv, sorted_list[i] );
    }
    bv.num_ones = sorted_list.length;
    return bv;
}

function bitvector_fill_zeros( bv, num_buckets ) {
    bv.data     = new Array( num_buckets );
    for ( var i = 0; i < bv.data.length; i++ ) {
    	bv.data[i] = 0x0;
    }    
}

// Note, this is very dangerous, as it does not update the num_ones counter!
// It has to be taken care of separately.
function bitvector_set( bv, item ) {
    var bucket = Math.floor( item / 32 );
    var offset = Math.floor( item % 32 );
    bv.data[ bucket ] = bv.data[ bucket ] | (0x1 << offset);
}

function bitvector_isect( bv1, bv2 ) {
    // init buckets to the shorter of bv1 and bv2
    var buckets = bv1.data.length;
    if ( buckets > bv2.data.length ) {
	buckets = bv2.data.length;
    }
    var data = new Array();
    var bitcount = 0;
    for ( var i = 0; i < buckets; i++ ) {
	var newbucket = bv1.data[i] & bv2.data[i]
	bitcount += bitvector_bitcount[ newbucket & 0xffff ];
	bitcount += bitvector_bitcount[ (newbucket >> 16) & 0xffff ]
	data.push( newbucket )
    }
    var bv_out  = bitvector_init_empty();
    bv_out.data = data;
    bv_out.num_ones = bitcount;
    return bv_out;
}
