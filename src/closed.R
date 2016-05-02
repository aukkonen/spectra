estimate_closed <- function( path_table ) {
    sentinels <- which( path_table[,1] == -1 )
    beginpos  <- c( 1, sentinels[1:(length(sentinels)-1)]+1 )
    endpos    <- sentinels-1
    apply( cbind( beginpos, endpos ), 1, function(x) {
        deg <- path_table[ x[1]:x[2], 1 ]
        cls <- path_table[ x[1]:x[2], 2 ]
        foo <- cbind(cumprod(deg[1:(length(deg)-1)]),
                     cls[2:length(cls)],
                     cumprod(1:(length(cls)-1)) )
        c(sum( apply( foo, 1, function(y) { y[1]/y[3] * y[2] } ) ), x[2]-x[1]+1 )
    } )
}

levels_closed <- function( path_table ) {
    sentinels <- which( path_table[,1] == -1 )
    beginpos  <- c( 1, sentinels[1:(length(sentinels)-1)]+1 )
    endpos    <- sentinels-1
    l <- apply( cbind( beginpos, endpos), 1, function(x) {
        cls <- path_table[ x[1]:x[2], 2 ]
        foo <- rep( 0, 100 )
        foo[ 1:length(cls) ] <- cls
        foo
    } )
    apply( l, 1, sum )/length(beginpos)
}

levels <- function( path_table ) {
    sentinels <- which( path_table[,1] == -1 )
    beginpos  <- c( 1, sentinels[1:(length(sentinels)-1)]+1 )
    endpos    <- sentinels-1
    l <- apply( cbind( beginpos, endpos), 1, function(x) {
        deg <- path_table[ x[1]:x[2], 1 ]
        foo <- rep( 0, 100 )
        foo[ 1:length(deg) ] <- 1
        foo
    } )
    apply( l, 1, sum )/length(beginpos)
}

levels_closed_prob <- function( path_table ) {
    s  <- levels( path_table )
    sc <- levels_closed( path_table )
    s * sc
}
