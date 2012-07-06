#!/usr/bin/env _coffee
fs      = require "fs"
{exec}  = require "child_process"
module.exports = require("../../../lib/proof") (async) ->
  tmp = "#{__dirname}/tmp"
  async cleanup = (_) ->
    try
      fs.unlink "#{tmp}/#{file}", _ for file in fs.readdir tmp, _
      fs.rmdir tmp, _
    catch e
      throw e if e.code isnt "ENOENT"
  , (_) ->
    fs.mkdir tmp, 0o755, _
    { fs, exec, tmp }
