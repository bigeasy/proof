#!/usr/bin/env node

require('../..')(1, prove)

function prove (assert) {
    var progress = require('../../progress')

    var f = progress({ options: { env: {} }, ultimate: { monochrome: true, tty: true } })

    const test = []
    const out = {
        write: line => test.push(line)
    }

    var f = progress({ options: { env: {} }, ultimate: { monochrome: true, tty: false } }, {}, out)

    var chunks = f({
        type: 'run',
        file: 't/foo.t.js',
        time: 0,
        expected: 3
    })
    assert(test, [ '' ], 'run')
}
