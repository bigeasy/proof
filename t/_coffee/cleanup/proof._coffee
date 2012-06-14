#!/usr/bin/env _coffee
fs      = require "fs"
{exec}  = require "child_process"
module.exports = require("../../../lib/proof") (_) ->
  tmp = "#{__dirname}/tmp"
  @cleanup _, (_) ->
    try
      fs.unlink "#{tmp}/#{file}", _ for file in fs.readdir tmp, _
      fs.rmdir tmp, _
    catch e
      throw e if e.code isnt "ENOENT"
  fs.mkdir tmp, 0o755, _
  { fs, exec, tmp }
