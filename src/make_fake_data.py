import sys

def main():
    blockwidth  = int( sys.argv[1] )
    blockheight = int( sys.argv[2] )
    num_blocks  = int( sys.argv[3] )
    i = 0
    for j in xrange( num_blocks ):
        items = range( i, i+blockwidth )
        for k in xrange( blockheight ):
            print " ".join( [ str(x) for x in items ] )
        i += blockwidth

if __name__=='__main__':
    main()
