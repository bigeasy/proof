#!/usr/bin/env node

require('./proof')(2, function (step, equal, execute, proof) {
    var spawn = require('child_process').spawn
    var fs = require('fs')
    step(function () {
        var env = {}
        for (var key in process.env) env[key] = process.env[key]
        env.TIMEOUT = 1000
        fs.readFile(__dirname + '/fixtures/timeout-progress.txt', 'utf8', step())
        execute(spawn('node', [ proof, 'test', '-M', 't/executable/timeout.js' ], { env: env }), '', step)
    }, function (expected, code, stdout, stderr) {
        equal(code, 1, 'timed out')
        equal(stdout.replace(/[\d?]/g, 'X').replace(/\\/g, '/'),
              expected.replace(/\r/g, ''), 'timeout progress message')
    })
})
