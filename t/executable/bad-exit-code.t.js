#!/usr/bin/env node

require('./proof')(2, function (step, equal, execute, proof) {
    var fs = require('fs')
    var path = require('path')
    step(function () {
        var stream = fs.createReadStream(__dirname + '/fixtures/bad-error-code.out')
        execute('node', [ proof, 'progress' ], stream, step)
    }, function (code, stdout, stderr) {
        equal(code, 1, 'non-zero exit')
        equal(stderr, 'error: cannot parse runner test exit code at line 5: exit code X\n', 'invalid exit code')
    })
})
