#!/usr/bin/env node

require('./proof')(2, function (step, equal, execute, proof) {
    var spawn = require('child_process').spawn
    var fs = require('fs')
    step(function () {
        fs.readFile(__dirname + '/fixtures/timeout-progress.txt', 'utf8', step())
        execute(spawn('node', [ proof, 'test', '-t', 1, '-M', 't/executable/timeout.js' ]), '', step)
    }, function (expected, code, stdout, stderr) {
        equal(code, 1, 'timed out')
        equal(stdout.replace(/[\d?]/g, 'X').replace(/\\/g, '/'),
              expected.replace(/\r/g, ''), 'timeout progress message')
    })
})
