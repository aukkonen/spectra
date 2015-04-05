var s1 = [1, 15, 54, 145, 200, 432];
var s2 = [3, 15, 40, 54, 100, 102, 201, 432, 500];

var v1 = bitvector_init_from_sorted_list( s1 );
var v2 = bitvector_init_from_sorted_list( s2 );

print( s1.length + " should be equal to " + v1.num_ones )
print( s2.length + " should be equal to " + v2.num_ones )

var v3 = bitvector_isect( v1, v2 );

print( v3.num_ones + " should be equal to " + 3 );
