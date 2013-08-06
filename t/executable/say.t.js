#!/usr/bin/env node

var path = require('path')
var fs = require('fs')

require('./proof')(2, function (step, equal, execute, proof) {
    var spawn = require('child_process').spawn
    step(function () {
        execute(spawn('node', [ path.join(__dirname, 'say') ]), '', step)
    }, function (code, stdout, stderr) {
        equal(code, 0, 'exit')
        equal(stdout, '1..1\n# Hello\nok 1 1\n# expected 1\n# passed   1\n', 'said')
    })
})
