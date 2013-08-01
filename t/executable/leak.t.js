#!/usr/bin/env node

require('./proof')(2, function (step, equal, execute, proof) {
    var spawn = require('child_process').spawn
    var fs = require('fs')
    step(function () {
        fs.readFile(__dirname + '/fixtures/leak.txt', 'utf8', step())
        execute('node', [ 't/executable/leak.js' ], '', step)
    }, function (expected, code, stdout, stderr) {
        equal(code, 1, 'bailed leak exit code')
        equal(stdout, expected, 'leak text')
    })
})
