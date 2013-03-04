#!/usr/bin/env node

var spawn = require('child_process').spawn, fs = require('fs');

require('./proof')(4, function (step, equal) {
  step(function () {
    fs.readFile(__dirname + '/fixtures/blather-progress.txt', 'utf8', step());
  }, function (expected, execute, proof) {
    execute('node', [ proof,  '-M', 't/executable/blather' ], '', step());
  }, function (code, stdout, stderr, expected) {
    equal(code, 1, 'bailed progress exit code');
    equal(stdout.replace(/[\d?]/g, 'X').replace(/\\/g, '/'), expected.replace(/\r/g, ''), 'bailed progress message');
  }, function () {
    fs.readFile(__dirname + '/fixtures/blather-errors.txt', 'utf8', step());
  }, function (expected, execute, proof) {
    var run = spawn('node', [ proof, 'run', 't/executable/blather' ]);
    execute('node', [ proof, 'errors', '-M', 't/executable/blather' ], run.stdout, step());
  }, function (code, stdout, stderr, expected) {
    equal(code, 1, 'bailed errors exit code');
    equal(stdout.replace(/\\/g, '/'), expected.replace(/\r/g, ''), 'bailed errors message');
  });
});
