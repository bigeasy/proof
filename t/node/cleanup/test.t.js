#!/usr/bin/env node

var fs = require("fs")
  , exec = require("child_process").exec
  , program = __dirname + "/example.sh"
  ;

require("../../../lib/proof")(
1, function cleanup (step) {
  fs.unlink(program, step());
}, function cleanup (error) {
  if (error && error.code != "ENOENT") throw error;
}, function (step) {
  fs.writeFile(program, "#!/bin/bash\nexit 1\n", "utf8", step());
}, function (ok) {
  ok(true, "cleanup");   
});
