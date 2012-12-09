#!/usr/bin/env _coffee
test = require "../../../lib/proof"

streamlined = (callback) -> callback(null, true)

test 1, (ok, _) -> ok streamlined(_), "test streamline"
