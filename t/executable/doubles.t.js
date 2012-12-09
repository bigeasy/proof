#!/usr/bin/env node

require('./proof')(2, function (async, equal) {
  var fs = require('fs'), path = require('path');
  async(function (proof, execute) {
    execute('node', [ proof, 'run', 't/node/run/minimal.t.js', 't/node/run/minimal.t.js' ], '', async());
  }, function (code, stdout, stderr) {
    equal(code, 1, 'non-zero exit');
    equal(stderr.replace(/\\/g, '/'), 'error: a program must only run once in a test run: t/node/run/minimal.t.js\n', 'invalid exit code');
  });
});
