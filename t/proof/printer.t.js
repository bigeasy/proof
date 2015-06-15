#!/usr/bin/env node

require('../..')(2, prove)

function prove (assert) {
    var printer = require('../../printer')
    var stream = require('stream')
    var out = new stream.PassThrough
    var err = new stream.PassThrough
    function echo (record) { return record.type + '\n' }
    var print = printer(echo, out, err)
    print({ type: 'foo' })
    print({ type: 'error', message: 'bad' })
    assert(out.read().toString(), 'foo\nerror\n', 'out')
    assert(err.read().toString(), 'error: bad\n', 'err')
}
