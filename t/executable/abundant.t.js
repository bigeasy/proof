#!/usr/bin/env node

var spawn = require('child_process').spawn, fs = require('fs');

require('./proof')(4, function (async, equal) {
  async(function () {
    fs.readFile(__dirname + '/fixtures/abundant-progress.txt', 'utf8', async());
  }, function (expected, execute, proof) {
    execute('node', [ proof,  '-M', 't/executable/abundant' ], '', async());
  }, function (code, stdout, stderr, expected) {
    equal(code, 1, 'bailed progress exit code');
    equal(stdout.replace(/[\d?]/g, 'X').replace(/\\/g, '/'),
          expected.replace(/\r/g, ''), 'bailed progress message');
    fs.readFile(__dirname + '/fixtures/abundant-errors.txt', 'utf8', async());
  }, function (expected, execute, proof) {
    var run = spawn('node', [ proof, 'run', 't/executable/abundant' ]);
    execute('node', [ proof, 'errors', '-M', 't/executable/abundant' ], run.stdout, async());
  }, function (code, stdout, stderr, expected) {
    equal(code, 1, 'bailed errors exit code');
    equal(stdout.replace(/\\/g, '/'), expected.replace(/\r/g, ''), 'bailed errors message');
  });
});
