#!/usr/bin/env node

require('./proof')(4, function (step, equal, proof, execute) {
    var spawn = require('child_process').spawn
    var fs = require('fs')
    step(function () {
        fs.readFile(__dirname + '/fixtures/bailout-progress.txt', 'utf8', step())
    }, function (expected) {
        var stream = fs.createReadStream(__dirname + '/fixtures/empty.txt')
        execute(spawn('node', [ proof,  'progress' ]), stream, step)
    }, function (code, stdout, stderr, expected) {
        equal(code, 0, 'no input exits zero')
        equal(stdout, '', 'no input means no output')
        execute(spawn('node', [ proof,  'progress' ]), '', step)
    }, function (code, stdout, stderr, expected) {
        equal(code, 1, 'bailed errors exit code')
        equal(stdout, '', 'no input means no output')
    })
})
