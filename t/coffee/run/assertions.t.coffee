#!/usr/bin/env coffee
require("../../..") 3, (ok, equal, deepEqual) ->
  ok true, "truth works"
  equal 1 + 1, 2, "math works"
  deepEqual "a b".split(/\s/), [ "a", "b" ], "strings work"
