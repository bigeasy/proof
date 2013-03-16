#!/usr/bin/env node

var fs = require("fs")
  , exec = require("child_process").exec
  , program = __dirname + "/example.sh"
  ;

require("../../../lib/proof")(1, function (step) {
  step(function () {
    fs.unlink(program, step(Error));
  }, function (error) {
    if (error && error.code != "ENOENT") throw error;
  });
}, function (step, ok) {
  step(function () {
    fs.writeFile(program, "#!/bin/bash\nexit 1\n", "utf8", step());
  }, function () {
    ok(true, "cleanup");
  });
});
