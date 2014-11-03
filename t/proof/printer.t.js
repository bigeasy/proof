#!/usr/bin/env node

require('../..')(1, function (assert) {
    var printer = require('../../printer')
    var stream = require('stream')
    var test = new stream.PassThrough
    test.write('foo')
    assert(typeof(printer), 'function', 'ok') 
    assert(test.read().toString(), 'foo', 'equal')
})
