#!/usr/bin/env node

require('./proof')(2, function (step, equal, execute, proof) {
    var path = require('path')
    var stderr = []
    step(function () {
        execute('node', [ proof, 'progress' ], '%t\n', step)
    }, function (code, stdout, stderr) {
        equal(code, 1, 'non-zero exit')
        equal(stderr, 'error: cannot parse runner output at line 1: invalid syntax\n', 'invalid syntax')
    })
})
