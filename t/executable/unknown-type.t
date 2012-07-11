#!/usr/bin/env node

require('./proof')(2, function (async, equal) {
  var fs = require('fs'), path = require('path');
  async(function (execute, proof) {
    var stream = fs.createReadStream(__dirname + '/fixtures/unknown-type.out');
    execute('node', [ proof, 'progress' ], stream, async());
  }, function (code, stdout, stderr) {
    equal(code, 1, 'non-zero exit');
    equal(stderr, 'error: cannot parse runner output at line 2: unknown line type x\n', 'unknown type');
  });
});
