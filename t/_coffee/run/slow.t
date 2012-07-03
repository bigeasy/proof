#!/usr/bin/env _coffee
test = require "../../../lib/proof"

test 1, (ok, _) ->
  setTimeout _, 1001
  ok true, "test long running test"
