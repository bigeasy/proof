#!/usr/bin/env _coffee
require("../../../lib/proof") 1, (callback, equal) ->
  fs = require "fs"
  {exec} = require "child_process"

  program = "#{__dirname}/example.sh"

  callback cleanup = (_) ->
    try
      fs.unlink program, _
    catch e
      throw e if e.code isnt "ENOENT"

  callback (_) ->
    fs.writeFile program, "#!/bin/bash\nexit 1\n", "utf8", _
    fs.chmod program, 0o755, _

    try
      exec program, _
    catch e
      equal e.code, 1, "exit code"
