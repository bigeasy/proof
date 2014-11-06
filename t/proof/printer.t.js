#!/usr/bin/env node

require('../..')(2, function (assert) {
    var printer = require('../../printer')
    var stream = require('stream')
    var passThrough = new stream.PassThrough
    function echo (string) { return string }
    var writeToStream = printer(echo, passThrough)
    writeToStream('foo')
    assert(typeof(printer), 'function', 'ok') 
    assert(passThrough.read().toString(), 'foo', 'equal')
})
