#!/usr/bin/env _coffee
require("../../../lib/proof") 2, (_) ->
  console.log "HERE"
  throw new Error("asynchronous")
, (error, equal, ok) ->
  console.log "HERE"
  if ok error, "thrown"
    equal(error.message, "asynchronous", "returned")
