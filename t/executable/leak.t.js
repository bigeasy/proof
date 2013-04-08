#!/usr/bin/env node

var spawn = require('child_process').spawn, fs = require('fs');

require('./proof')(2, function (step, equal, execute, proof) {
  step(function () {
    fs.readFile(__dirname + '/fixtures/leak.txt', 'utf8', step());
    execute('node', [ 't/executable/leak.js' ], '', step);
  }, function (expected, code, stdout, stderr) {
    equal(code, 1, 'bailed leak exit code');
    equal(stdout, expected, 'leak text');
  });
});
