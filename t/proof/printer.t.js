#!/usr/bin/env node

require('../..')(2, function (assert) {
    var printer = require('../../printer')
    var stream = require('stream')
    var test = new stream.PassThrough
    //test.write('foo')
    function echo (string) { return string }
    var print = printer(echo, test)
    assert(typeof(printer), 'function', 'ok') 
    assert(print('foo'), 'foo', 'equal')
})
