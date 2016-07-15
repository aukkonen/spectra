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

function ui_status_disabled( v ) {
    $("dropdownMenu1").prop( "disabled", v );
    $("#runbutton").prop( "disabled", v );
}

function load_data_from_string( datastr ) {
    var data = new Data();
    data.build_vertical_from_fimi( datastr );

    $("#numrows").html( data.num_rows );
    $("#numcols").html( data.num_cols );

    $("#minsigma").val( 1 );
    $("#maxsigma").val( data.get_max_item_freq() );
    $("#numsamples").val( Math.min( data.get_max_item_freq(), 5000 ) );

    $("#runbutton").attr( "disabled", false );

    $("#statustext").html( "Loaded data." );
    return data;
}

function load_exact_curve_from_string( datastr ) {
    var lines = datastr.split( '\n' );
    var curve = new Array();
    for ( var i = 0; i < lines.length; i++ ) {
        var record = lines[i].split( /\s+/ );
        var freq   = parseFloat(record[2]);
        if ( freq > 0 ) {
            curve.push( [ parseInt( record[0] ), Math.log(freq)/Math.LN10 ] );
        }
    }
    curve.sort( function(a,b) { return a[0] - b[0] } );
    return curve;
}

// Converts a "curve" list of [ sigma, estimate ] pairs into
// a hashtable of the form map[ sigma ] = estimate  (at that sigma).
// function curve_to_map( curve ) {
//     var m = new Array();
//     for ( var i = 0; i < curve.length; i++ ) {
//         m[ curve[i][0] ] = curve[i][1];
//     }
//     return m;
// }

function curve_to_map( curve ) {
    var m = new Array();
    curve.sort( function(a,b) { return a[0] - b[0] } );
    var sigma = curve[ curve.length-1 ][0];
    var value = curve[ curve.length-1 ][1]
    m[ sigma ] = value;
    var cpos = curve.length-2;
    for ( ; sigma >= curve[0][0]; sigma-- ) {
        if ( cpos >= 0 && curve[cpos][0] == sigma ) {
            value = curve[cpos][1];
            cpos--;
        }
        m[ sigma ] = value;
    }
    return m;
}

function merge_curves( exact, real, fake ) {

    var min_sigma   = parseInt( $("#minsigma").val() );
    var max_sigma   = parseInt( $("#maxsigma").val() );

    var m_exact = undefined;
    if ( exact != undefined ) {
        m_exact = curve_to_map( exact );
    }
    var m_real  = curve_to_map( real );
    var m_fake  = curve_to_map( fake );

    var merged = new Array();
    for ( var sigma = max_sigma; sigma >= min_sigma; sigma-- ) {
        if ( m_exact == undefined ) {
            merged.push( [sigma, m_real[sigma], m_fake[sigma]] );
        }
        else {
            merged.push( [sigma, m_exact[sigma], m_real[sigma], m_fake[sigma]] );
        }
    }
    merged.sort( function(a,b) { return a[0] - b[0] } );
    return merged;
}

function run_spectra( main_container ) {

    var data = main_container.data;

    // read min and max sigma from textfields
    var min_sigma   = parseInt( $("#minsigma").val() );
    var max_sigma   = parseInt( $("#maxsigma").val() );
    var num_samples = parseInt( $("#numsamples").val() );
    var sigmas      = get_sigmas( min_sigma, max_sigma, num_samples );

    var beginTime   = new Date().getTime();

    // fit curve from real data
    var realEsts  = fast_est( data, sigmas,
			      path_estimate, sample_candidate_uniform,
			      1000 );
    var realCurve = fitcurve( sigmas, realEsts );

    // fit expected curve with random data:
    var fakedata = new FakeData();
    fakedata.params_from_data( data );

    var fakeEsts  = fast_est( fakedata, sigmas,
			      path_estimate, sample_candidate_uniform,
			      1000 );
    var fakeCurve = fitcurve( sigmas, fakeEsts );

    // merge curves for plotting
    var curve = merge_curves( main_container.exact_curve, realCurve, fakeCurve );
    var colors = ['black', 'blue', 'green'];
    var labels = ['sigma', 'exact', 'estimate', 'expected'];
    if ( main_container.exact_curve == undefined ) {
        colors = ['blue', 'green'];
        labels = ['sigma', 'estimate', 'expected'];
    }
	
    new Dygraph( $("#graphdiv")[0], curve,
    		 {
    		     colors: colors,
    		     labels: labels,
    		     xlabel: 'sigma',
    		     ylabel: 'count (log10)',
                     strokeWidth: 2.0,
		     yAxisLabelWidth: 40,
    		     stepPlot: true
    		 } );
    $("#statustext").html( "Done! (in " +
			   ((new Date().getTime() - beginTime)/1000).toFixed(1) +
			   " sec.)" );
    $("#runbutton").attr( "disabled", false );
}


function main() {
    // set listeners
    var main_container = {data: undefined, exact_curve: undefined};

    $(".dataitem").click( function( evt ) {
	var dataname = evt.target.innerHTML.split(" ")[0]

        $("#statustext").html("Loading data from server...");
        ui_status_disabled( true );

        // load actual data
        $.get( "fimidata/" + dataname + ".dat", function( data ) {
            main_container.data = load_data_from_string( data );
            ui_status_disabled( false );
        } );

        // load the exact frequency spectrum for this data
        $.get( "fimidata/" + dataname + ".exact.txt", function( data ) {
            main_container.exact_curve = load_exact_curve_from_string( data );
            g = new Dygraph( $("#graphdiv")[0],
    		             main_container.exact_curve,
    		             {
    			         colors: ['black'],
    			         labels: ['sigma', 'exact'],
    			         xlabel: 'sigma',
    			         ylabel: 'count (log10)',
			         yAxisLabelWidth: 40,
    			         stepPlot: true
    		             } );
        } );
    } );

    $("#runbutton").click( function() {
        ui_status_disabled( true );
	$("#statustext").html( "Running Spectra..." );
        $("body").css({'cursor':'wait'})
	setTimeout( function() {
	    run_spectra( main_container );
            $("body").css({'cursor':'default'})
            ui_status_disabled( false );
	}, 50 );
    } );
    $("#runbutton").attr( "disabled", true );

    $("#minsigma").val( "" );
    $("#maxsigma").val( "" );
    $("#numsamples").val( "" );

    $('body').ajaxStart(function() {
        $(this).css({'cursor':'wait'});
    }).ajaxStop(function() {
        $(this).css({'cursor':'default'});
    });
}

function testmain() {
    console.log( 'main called' );
    $(".dataitem").click( function( evt ) {
	console.log( evt.target.innerHTML.split(" ")[0] );
	console.log( this );
	$("#numrows").html( evt.target.innerHTML );
	$("#numcols").html( evt.target.innerHTML );
    } );
}

$(document).ready( main );
