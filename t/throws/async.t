#!/usr/bin/env _coffee
require("proof") 2, (_) ->
  e = @throws "asynchronous", _, (_) -> throw new Error("asynchronous")
  @equal e.message, "asynchronous", "returned"
