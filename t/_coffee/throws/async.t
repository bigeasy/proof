#!/usr/bin/env _coffee
require("../../../lib/proof") 2, (_) ->
  throw new Error("asynchronous")
, (error, equal, ok) ->
  if ok error, "thrown"
    equal(error.message, "asynchronous", "returned")
