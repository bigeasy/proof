#!/usr/bin/env coffee
return if not require("streamline/module")(module)

test = require "../../lib/ace"

streamlined = (callback) -> callback(null, true)

test 1, (_) ->
  setTimeout _, 1001
  @ok true, "test long running test"
