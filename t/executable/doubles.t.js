#!/usr/bin/env node

require('./proof')(2, function (step, equal, execute, proof) {
    var fs = require('fs')
    var path = require('path')
    var spawn = require('child_process').spawn
    step(function () {
        execute(spawn('node', [ proof, 'run', 't/node/run/minimal.t.js', 't/node/run/minimal.t.js' ]), '', step)
    }, function (code, stdout, stderr) {
        equal(code, 1, 'non-zero exit')
        equal(stderr.replace(/\\/g, '/'), 'error: a program must only run once in a test run: t/node/run/minimal.t.js\n', 'invalid exit code')
    })
})
