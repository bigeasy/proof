#!/usr/bin/env node

require('../..')(1, prove)

function prove (assert) {
    var progress = require('../../progress')

    var f = progress({ param: { monochrome: true } })

    var chunks = f({
        type: 'run',
        file: 't/foo.t.js',
        time: 0,
        expected: 3
    })
    assert(chunks, [], 'run')
}
