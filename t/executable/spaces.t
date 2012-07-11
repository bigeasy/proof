#!/usr/bin/env node

require('./proof')(2, function (async, equal) {
  var path = require('path'), stderr = [];
  async(function (proof, execute) {
    execute('node', [ proof, 'run', 't/a b.t' ], '', async());
  }, function (code, stdout, stderr) {
    equal(code, 1, 'non-zero exit');
    equal(stderr, 'error: program names cannot contain spaces: t/a b.t\n', 'invalid syntax');
  });
});
