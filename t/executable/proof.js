#!/usr/bin/env node

var spawn = require('child_process').spawn, path = require('path'), stderr = [];

function execute (program, parameters, input, step) {
  step(function () {
    var proc = spawn(program, parameters), count = 0;
    proc.stderr.setEncoding('utf8');
    proc.stdout.setEncoding('utf8');
    proc.on('close', step.event());
    proc.on('error', step.error());
    proc.stdout.on('data', step.event([]));
    proc.stdout.on('error', step.error());
    proc.stderr.on('data', step.event([]));
    proc.stderr.on('error', step.error());
    proc.stdin.on('error', step.error());
    proc.on('error', function (error) { throw error; });
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
