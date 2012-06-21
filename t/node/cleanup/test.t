#!/usr/bin/env node

var fs = require("fs")
  , exec = require("child_process").exec
  , program = __dirname + "/example.sh"
  ;

require("../../../lib/proof")(
1, function cleanup (callback) {
        fs.unlink(program, callback());
}, function cleanup (error) {
        if (error && error.code != "ENOENT") throw error;
}, function (callback) {
        fs.writeFile(program, "#!/bin/bash\nexit 1\n", "utf8", callback());
}, function (callback) {
        fs.chmod(program, 0755, callback());
}, function (callback, equal) {
        exec(program, callback());
}, function (error, equal) {
        equal(error.code, 1, "exit code")
});
