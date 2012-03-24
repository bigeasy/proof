#!/usr/bin/env coffee
require("proof") 2, ->
  e = @throws "synchronous", -> throw new Error("synchronous")
  @equal e.message, "synchronous", "returned"
