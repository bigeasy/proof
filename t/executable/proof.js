#!/usr/bin/env node

var spawn = require('child_process').spawn, path = require('path'), stderr = [];

function execute (program, parameters, input, callback) {
  var stdout = [], stderr = [], proc = spawn(program, parameters), count = 0;
  proc.stderr.setEncoding('utf8');
  proc.stderr.on('data', function (chunk) { stderr.push(chunk) });
  proc.stdout.setEncoding('utf8');
  proc.stdout.on('data', function (chunk) { stdout.push(chunk) });
  if (typeof input == "string") {
    proc.stdin.write('%t\n');
    proc.stdin.end();
  } else if (input != null) {
    input.pipe(proc.stdin);
  }
  proc.on('close', function (code) {
    function drained () {
      if (++count == 3) {
        callback(null, code, stdout.join(''), stderr.join(''));
      }
    }
    if (proc.stderr.readable) {
      proc.stderr.on('drain', drained);
    } else {
      drained();
    }
    if (proc.stdout.readable) {
      proc.stdout.on('drain', drained);
    } else {
      drained();
    }
    drained();
  });
}

module.exports = require('../..')(function () { return { execute: execute, proof: path.resolve(__dirname, '..', '..', 'proof.bin.js') } });
