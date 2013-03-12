#!/usr/bin/env node

var spawn = require('child_process').spawn, fs = require('fs');

require('./proof')(4, function (step, equal, execute, proof) {
  step(function () {
    fs.readFile(__dirname + '/fixtures/bailout-progress.txt', 'utf8', step());
  }, function (expected) {
    execute('node', [ proof,  '-M', 't/executable/bailout' ], '', step());
  }, function (code, stdout, stderr, expected) {
    equal(code, 1, 'bailed progress exit code');
    equal(stdout.replace(/[\d?]/g, 'X').replace(/\\/g, '/'),
          expected.replace(/\r/g, ''), 'bailed progress message');
  }, function () {
    fs.readFile(__dirname + '/fixtures/bailout-errors.txt', 'utf8', step());
  }, function (expected) {
    var run = spawn('node', [ proof, 'run', 't/executable/bailout' ]);
    execute('node', [ proof, 'errors', '-M', 't/executable/bailout' ], run.stdout, step());
  }, function (code, stdout, stderr, expected) {
    equal(code, 1, 'bailed errors exit code');
    equal(stdout.replace(/\\/g, '/'), expected.replace(/\r/g, ''), 'bailed errors message');
  });
});
