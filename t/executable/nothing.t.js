#!/usr/bin/env node

var spawn = require('child_process').spawn, fs = require('fs');

require('./proof')(4, function (async, equal, proof, execute) {
  async(function () {
    fs.readFile(__dirname + '/fixtures/bailout-progress.txt', 'utf8', async());
  }, function (expected) {
    var stream = fs.createReadStream(__dirname + '/fixtures/empty.txt');
    execute('node', [ proof,  'progress' ], stream, async());
  }, function (code, stdout, stderr, expected) {
    equal(code, 0, 'no input exits zero');
    equal(stdout, '', 'no input means no output');
    execute('node', [ proof,  'progress' ], '', async());
  }, function (code, stdout, stderr, expected) {
    equal(code, 1, 'bailed errors exit code');
    equal(stdout, '', 'no input means no output');
  });
});
