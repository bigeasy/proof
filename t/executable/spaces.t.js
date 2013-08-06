#!/usr/bin/env node

require('./proof')(2, function (step, equal, execute, proof) {
    var path = require('path'), stderr = []
    var spawn = require('child_process').spawn
    step(function () {
        execute(spawn('node', [ proof, 'run', 't/a b.t' ]), '', step)
    }, function (code, stdout, stderr) {
        equal(code, 1, 'non-zero exit')
        equal(stderr, 'error: program names cannot contain spaces: t/a b.t\n', 'invalid syntax')
    })
})
