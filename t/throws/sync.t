#!/usr/bin/env coffee
require("../../lib/proof") 2, ->
  e = @throws "synchronous", -> throw new Error("synchronous")
  @equal e.message, "synchronous", "returned"
