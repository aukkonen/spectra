#!/bin/bash

cat bitvector.js fimidata_oo.js fakedata.js pava.js spectra.js node_spectra.js | \
    ~/opt/bin/node "" $@
