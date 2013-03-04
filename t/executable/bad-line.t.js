#!/usr/bin/env node

require('./proof')(2, function (step, equal, execute) {
  var path = require('path'), stderr = [];
  step(function () {
    execute('node', [ path.resolve(__dirname, '..', '..', 'bin', 'proof'), 'progress' ], '%t\n', step());
  }, function (code, stdout, stderr) {
    equal(code, 1, 'non-zero exit');
    equal(stderr, 'error: cannot parse runner output at line 1: invalid syntax\n', 'invalid syntax');
  });
});
