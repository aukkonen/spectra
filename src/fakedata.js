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

function FakeData() {
    this.columns    = null;
    this.items      = null;
    this.projection = 1;
    this.prob       = null;
    this.num_rows   = 0;
    this.num_cols   = 0;
}

FakeData.prototype = new Data();

// takes a real data instance and reads column probabilities from it
FakeData.prototype.params_from_data = function( data ) {
    this.items    = data.items;
    this.num_cols = data.num_cols;
    this.num_rows = data.num_rows;

    this.prob = new Array();
    for ( var i = 0; i < this.items.length; i++ ) {
	var e = this.items[i];
	this.prob[ e ] = data.item_freq( e )/this.num_rows;
    }
}

// override Data.item_freq
FakeData.prototype.item_freq = function( item ) {
    return this.num_rows * this.projection * this.prob[ item ];
}

// override Data.project_on_item
FakeData.prototype.project_on_item = function( item ) {
    this.projection *= this.prob[ item ];
}

// overrice Data.clear_projection
FakeData.prototype.clear_projection = function() {
    this.projection = 1;
}
