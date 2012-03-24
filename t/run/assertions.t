#!/usr/bin/env coffee
require("proof") 3, ->
  @ok true, "truth works"
  @equal 1 + 1, 2, "math works"
  @deepEqual "a b".split(/\s/), [ "a", "b" ], "strings work"
