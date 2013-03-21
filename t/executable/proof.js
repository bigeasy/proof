#!/usr/bin/env node

var spawn = require('child_process').spawn, path = require('path'), stderr = [];

function execute (program, parameters, input, step) {
  step(function () {
    var on = step('on');
    var proc = spawn(program, parameters), count = 0;
    proc.stderr.setEncoding('utf8');
    proc.stdout.setEncoding('utf8');
    on(proc, 'close');
    on(proc.stdout, 'data', [], 1);
    on(proc.stderr, 'data', [], 1);
    if (typeof input == "string") {
      proc.stdin.write('%t\n');
      proc.stdin.end();
    } else if (input != null) {
      input.pipe(proc.stdin);
    }
  }, function (code, signal, stdout, stderr) {
    step(null, code, stdout.join(''), stderr.join(''));
  });
}

module.exports = require('../..')(function () { return { execute: execute, proof: path.resolve(__dirname, '..', '..', 'proof.bin.js') } });
