#!/usr/bin/env node

var fs = require("fs")
  , exec = require("child_process").exec
  , program = __dirname + "/example.sh"
  ;

require("../../../lib/proof")(
1, function cleanup (async) {
  fs.unlink(program, async());
}, function cleanup (error) {
  if (error && error.code != "ENOENT") throw error;
}, function (async) {
  fs.writeFile(program, "#!/bin/bash\nexit 1\n", "utf8", async());
}, function (ok) {
  ok(true, "cleanup");   
});
