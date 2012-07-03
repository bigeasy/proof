#!/usr/bin/env coffee
require("../../../lib/proof") 2, ->
  throw new Error("synchronous")
, (error, ok, equal) ->
  if ok error, "thrown"
    equal error.message, "synchronous", "returned"
