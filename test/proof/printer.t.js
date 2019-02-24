#!/usr/bin/env node

require('../..')(1, prove)

function prove (assert) {
    var printer = require('../../printer')
    var stream = require('stream')
    var out = new stream.PassThrough
    var err = new stream.PassThrough
    function echo (record) { return record.type + '\n' }
    var print = printer(echo, out, err)
    print({ type: 'foo' })
    assert(out.read().toString(), 'foo\n', 'out')
}
