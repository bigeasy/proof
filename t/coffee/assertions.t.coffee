#!/usr/bin/env coffee

require("../../redux") 3, (assert) ->
  assert true, "truth works"
  assert 1 + 1, 2, "math works"
  assert "a b".split(/\s/), [ "a", "b" ], "strings work"
