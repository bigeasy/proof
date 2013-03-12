#!/usr/bin/env coffee
require("../../../lib/proof") 2, (step, ok, equal) ->
  step ->
    throw new Error("synchronous")
  , (error) ->
    if ok error, "thrown"
      equal error.message, "synchronous", "returned"
