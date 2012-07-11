#!/usr/bin/env _coffee
require("../../../lib/proof") 1, (async, ok) ->
  fs = require "fs"
  {exec} = require "child_process"

  program = "#{__dirname}/example.sh"

  async cleanup = (_) ->
    try
      fs.unlink program, _
    catch e
      throw e if e.code isnt "ENOENT"

  async (_) ->
    fs.writeFile program, "#!/bin/bash\nexit 1\n", "utf8", _
    ok true, "wrote"
