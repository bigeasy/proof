#!/usr/bin/env node

var path = require('path'), fs = require('fs');

require('./proof')(2, function (step, equal, execute, proof) {
  step(function () {
    execute('node', [ path.join(__dirname, 'say') ], '', step);
  }, function (code, stdout, stderr) {
    equal(code, 0, 'exit');
    equal(stdout, '1..1\n# Hello\nok 1 1\n', 'said');
  });
});
