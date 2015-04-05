var fs = require('fs');

// arguments start at pos 2, which is a bit unfortunate but okay.
var fimistr = fs.readFileSync(process.argv[2]).toString();

var data = new Data();
data.build_vertical_from_fimi( fimistr );

// console.log( data.num_rows );
// console.log( data.num_cols );
// console.log( data.get_max_item_freq() );

console.log( "Got dataset with " + data.num_rows + " rows, and " +
	     data.num_cols + " columns." );

var sigmaMin = parseInt( process.argv[3] );
var sigmaMax = parseInt( process.argv[4] );
var rounds   = parseInt( process.argv[5] );

var sigmas = get_sigmas( sigmaMin, sigmaMax, rounds )

console.log( "Running FastEst with " + rounds + " samples..." );
var ests = fast_est( data, sigmas );

if ( sigmaMax > sigmaMin ) {
    var curve = fitcurve( sigmas, ests );
    console.log( curve );
}
else {
    var avg = average( ests );
    console.log( "Estimate (log10): " + Math.log(avg)/Math.LN10 );
}
