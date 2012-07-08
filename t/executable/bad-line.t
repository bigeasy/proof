#!/usr/bin/env node

require('./proof')(2, function (async, equal, execute) {
  var path = require('path'), stderr = [];
  async(function () {
    execute('node', [ path.resolve(__dirname, '..', '..', 'bin', 'proof'), 'progress' ], '%t\n', async());
  }, function (code, stdout, stderr) {
    equal(code, 1, 'non-zero exit');
    equal(stderr, 'error: cannot parse runner output at line 1: invalid syntax\n', 'invalid syntax');
  });
});
